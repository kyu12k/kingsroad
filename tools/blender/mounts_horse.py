# 🐎 백마 (2026-10-02) — 「하늘에 있는 군대들이 희고 깨끗한 세마포를 입고 백마를 타고 그를 따르더라」(계 19:14)
# 실행: blender -b -P mounts_horse.py -- <출력 폴더> [이름 …]   → models/mounts/mt_horse_*.glb · gd_horse_*.glb
# mounts.py와 같은 약속: 앞 = 블렌더 +x, 원점 = 몸 한가운데 아래 땅(finish center=False), 사람 키 약 0.53 기준
# 어깨(기갑) 0.63, 코~꼬리 약 0.9. 머리 축 head = 목 밑동(0.24, 0, 0.56) — 목·머리·갈기·귀가 함께 움직인다
# 다리 leg0~3(앞왼 +y · 앞오 −y · 뒤왼 · 뒤오), 축 = 다리 꼭대기 z 0.5 · 꼬리 tail 축(−0.27, 0, 0.58)
# 앉는 자리 = 기갑 뒤 등 위 (−0.02, 0.63)
# 장식은 같은 좌표로 빚는다. 머리에 다는 것(bridle·maneflowers)은 게임에서 머리 축 아래로 옮겨 붙인다
# pv_horse = 흰 말 + 장식 넷을 한 모델로(미리보기 확인용, 게임에 쓰지 않는다)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))

GOLD, GOLD_D = lin(0xe8c25a), lin(0xb8923a)
LINEN, LINEN_D = lin(0xfbfaf4), lin(0xe4e0d4)
RED, RED_D = lin(0xc0303a), lin(0x8a1e28)
LEAF = lin(0x6f9a45)
FLOWERS = [lin(0xf4a6c0), lin(0xffffff), lin(0xf6d77a), lin(0xe57a9a), lin(0xb9a4e8)]

# 털빛: 털 · 그늘 · 배 · 갈기·꼬리 · 주둥이 · 발굽 · 정강이(아래 다리)
HORSE_COATS = {
    'white':  dict(C=lin(0xf4f2ec), CD=lin(0xd2cdc2), CL=lin(0xfbfaf6), M=lin(0xd0c9be), MZ=lin(0xc9bab4), H=lin(0x5a5450), LO=lin(0xeae6de)),
    'pearl':  dict(C=lin(0xf0e4cc), CD=lin(0xd2c2a0), CL=lin(0xf8f0de), M=lin(0xfbf4e2), MZ=lin(0xc8ac9a), H=lin(0x6a5c50), LO=lin(0xe6d8bc)),
    'dapple': dict(C=lin(0xaeb3b8), CD=lin(0x868b92), CL=lin(0xd0d3d6), M=lin(0xe6e6e4), MZ=lin(0x4a4a50), H=lin(0x3a3634), LO=lin(0x6a6e74), DOT=lin(0xdfe2e4)),
}

# ── 몸통 단면(장식이 몸에 맞도록 공용) ──
BX = [-0.27, -0.22, -0.1, 0.05, 0.17, 0.25, 0.29]
BZ = [0.52, 0.52, 0.495, 0.495, 0.51, 0.525, 0.53]
BR = [0.055, 0.105, 0.122, 0.122, 0.112, 0.085, 0.045]
BELL = (0.8, 1.0)   # 몸통 단면 납작함(옆 · 위아래)
def body_at(x):   # x에서의 몸통 중심 z, 반지름
    if x <= BX[0]: return BZ[0], BR[0]
    for i in range(len(BX) - 1):
        if x <= BX[i + 1]:
            t = (x - BX[i]) / (BX[i + 1] - BX[i]); return BZ[i] + (BZ[i + 1] - BZ[i]) * t, BR[i] + (BR[i + 1] - BR[i]) * t
    return BZ[-1], BR[-1]
def body_pt(x, a, k=1.0):   # a = 등 꼭대기에서 잰 각(라디안, +는 +y쪽)
    zc, r = body_at(x); return V(x, math.sin(a) * r * BELL[0] * k, zc + math.cos(a) * r * BELL[1] * k)

# ── 목·머리 (머리 축 아래) ──
NECK_CTRL = [(0.22, 0, 0.55), (0.28, 0, 0.645), (0.31, 0, 0.725), (0.345, 0, 0.8)]
NECK_R = [0.085, 0.072, 0.06, 0.05, 0.047]
NECK_ELL = (0.6, 1.0)
HP = V(0.37, 0, 0.85); HM = V(0.53, 0, 0.665)   # 정수리(poll) · 주둥이 끝
HD = (HM - HP).normalized(); HL = (HM - HP).length
HN = V(-HD.z, 0, HD.x)   # 이마 쪽(앞·위)
HEAD_SEC = [(0.0, 0.040, 0.03, 0.062), (0.33, 0.043, 0.036, 0.05), (0.72, 0.031, 0.028, 0.032), (1.0, 0.026, 0.022, 0.026)]   # u, 반폭, 앞 높이, 뒤(턱) 높이
def head_sec(u):
    for i in range(len(HEAD_SEC) - 1):
        if u <= HEAD_SEC[i + 1][0]:
            a, b = HEAD_SEC[i], HEAD_SEC[i + 1]; t = (u - a[0]) / (b[0] - a[0]); return tuple(a[k] + (b[k] - a[k]) * t for k in (1, 2, 3))
    return HEAD_SEC[-1][1:]
def head_pt(u, a, k=1.0):   # a = 이마에서 잰 각(+는 +y쪽)
    w, hf, hb = head_sec(u); c = HP + HD * (u * HL)
    return c + V(0, math.sin(a) * w * k, 0) + HN * (math.cos(a) * (hf if math.cos(a) > 0 else hb) * k)

def neck_line():
    pts = crs(NECK_CTRL, 8); out = []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, 7)] - pts[max(i - 1, 0)]).normalized()
        n = V(-t.z, 0, t.x)   # 목 등선 쪽(뒤·위)
        out.append((p, n, interp(NECK_R, i / 7)))
    return out
def crest(i_from=1, i_to=7):
    return [(p + n * r * 0.95, n) for (p, n, r) in neck_line()[i_from:i_to + 1]]

def _horse(coat, seed=501):
    K = HORSE_COATS[coat]; C, CD, CL = K['C'], K['CD'], K['CL']
    sh = shade(C, CD, k=0.05)
    begin(seed)
    # 몸통 — 둥근 통 + 어깨·엉덩이·가슴·기갑 덩어리
    paint(loft(list(zip(BX, [0] * 7, BZ)), BR, sides=12, ell=BELL, wob=0.025), sh)
    for s2 in (-1, 1):
        paint(blob((-0.19, s2 * 0.038, 0.53), (0.105, 0.065, 0.092), n=18, jitter=0.04), sh)   # 엉덩이
        paint(blob((0.18, s2 * 0.032, 0.52), (0.075, 0.058, 0.088), n=16, jitter=0.04), sh)   # 어깨
    paint(blob((0.25, 0, 0.5), (0.06, 0.068, 0.072), n=14, jitter=0.04), sh)   # 가슴
    paint(blob((0.15, 0, 0.598), (0.075, 0.03, 0.032), n=10, jitter=0.03), sh)   # 기갑
    paint(loft([(-0.14, 0, 0.392), (0.0, 0, 0.38), (0.13, 0, 0.392)], [0.05, 0.06, 0.05], sides=8, ell=(1.0, 0.4), wob=0.02), solid(CL))   # 배
    if 'DOT' in K:   # 얼룩(점박이 회색) — 몸 위에 밝은 점
        from mathutils.bvhtree import BVHTree
        bvh = BVHTree.FromBMesh(S.bm)   # 몸 겉면에 납작하게 붙인다(덩어리 위로 튀어나오지 않게)
        for k in range(80):
            x = -0.28 + random.random() * 0.52; a = (random.random() - 0.5) * 2 * 1.9
            zc, r = body_at(x)
            o = V(x, math.sin(a) * 0.4, zc + math.cos(a) * 0.4)
            hit, nrm, _, _ = bvh.ray_cast(o, (V(x, 0, zc) - o).normalized())
            if hit is None: continue
            t1 = V(1, 0, 0) if abs(nrm.x) < 0.8 else V(0, 0, 1)
            t1 = (t1 - nrm * t1.dot(nrm)).normalized(); t2 = nrm.cross(t1)
            rr = 0.01 + random.random() * 0.01
            ring = [t1 * math.cos(q) * rr + t2 * math.sin(q) * rr for q in [m / 7 * 2 * math.pi for m in range(7)]]
            paint(hull([hit + d + nrm * 0.0025 for d in ring] + [hit + d * 0.7 - nrm * 0.01 for d in ring]), solid(K['DOT'], 0.05))
    # 머리 축: 목 · 머리 · 갈기 · 귀
    part('head', loc=(0.24, 0, 0.56))
    NL = neck_line()
    paint(loft([p for p, n, r in NL], [r for p, n, r in NL], sides=9, ell=NECK_ELL, wob=0.03), sh)
    secs = []
    for (u, w, hf, hb) in HEAD_SEC:
        for j in range(10):
            secs.append(head_pt(u, j / 10 * 2 * math.pi))
    paint(hull(secs), shade(C, CD, k=0.05))
    paint(blob(HP + HD * 0.05 - HN * 0.03, (0.05, 0.043, 0.05), n=12, jitter=0.05), sh)   # 볼(턱)
    paint(hull([head_pt(u, j / 10 * 2 * math.pi, 1.02) for u in (0.82, 1.0) for j in range(10)]), solid(K['MZ'], 0.06))   # 주둥이
    for s2 in (-1, 1):
        paint(blob(head_pt(0.95, s2 * 1.0, 1.0) + HN * 0.004, (0.007, 0.006, 0.007), n=5, jitter=0), solid(lin(0x2a2220)))   # 콧구멍
        e = head_pt(0.3, s2 * 1.35, 1.0)
        paint(blob(e, (0.011, 0.006, 0.01), n=6, jitter=0), solid(lin(0x1a1410)))   # 눈
        paint(blob(e + V(0.003, s2 * 0.002, 0.006), (0.004, 0.002, 0.003), n=5, jitter=0), solid(lin(0xffffff)))   # 눈빛
        eb = head_pt(0.0, s2 * 0.75, 1.0) + V(-0.005, 0, 0.0)
        paint(loft([eb, eb + V(0.012, s2 * 0.01, 0.04), eb + V(0.016, s2 * 0.012, 0.072)], [0.016, 0.013, 0.003], sides=5, ell=(1.0, 0.6), wob=0), shade(C, CD))   # 뾰족한 귀
        paint(loft([eb + V(0.008, s2 * 0.004, 0.01), eb + V(0.016, s2 * 0.01, 0.05)], [0.007, 0.003], sides=3, ell=(1.0, 0.4), wob=0), solid(K['MZ']))
    # 갈기 — 목 등선을 따라 +y 쪽으로 흘러내린다
    M = K['M']; MD = tuple(v * 0.85 for v in M)
    cr = crest(0, 7)
    paint(loft([p + n * 0.014 for p, n in cr], 0.022, sides=6, ell=(1.3, 1.0), wob=0.1), shade(M, MD))
    for i, (p, n) in enumerate(cr[:-1]):
        for f in (0.0, 0.5):
            q = p + (cr[i + 1][0] - p) * f
            L = 0.075 + random.random() * 0.03 - i * 0.004
            paint(loft([q, q + V(-0.012, 0.035, -L * 0.45), q + V(-0.03, 0.055, -L)], [0.018, 0.013, 0.003], sides=4, ell=(0.6, 1.0), wob=0.08), shade(M, MD))
            if f == 0.0: paint(loft([q, q + V(-0.01, -0.03, -L * 0.25), q + V(-0.02, -0.042, -L * 0.5)], [0.016, 0.011, 0.003], sides=4, ell=(0.6, 1.0), wob=0.08), shade(M, MD))   # 반대쪽으로 넘어간 몇 가닥
    fl = HP + HN * 0.02 + HD * 0.0
    paint(loft([fl, fl + HD * 0.04 + HN * 0.022, fl + HD * 0.08 + HN * 0.026], [0.017, 0.012, 0.003], sides=4, ell=(1.0, 0.5), wob=0.05), shade(M, MD))   # 앞머리
    base()
    # 다리 — 앞은 곧게, 뒤는 비절이 뒤로 꺾인다
    LO = K['LO']
    for i, (x, y) in enumerate(((0.18, 0.055), (0.18, -0.055), (-0.19, 0.055), (-0.19, -0.055))):
        part('leg%d' % i, loc=(x, y, 0.5))
        if i < 2:
            paint(cyl((x, y, 0.52), (x, y, 0.27), 0.042, 0.026, sides=7), sh)              # 팔뚝
            paint(blob((x + 0.003, y, 0.265), (0.026, 0.024, 0.024), n=7, jitter=0.05), shade(LO, CD))   # 무릎
            paint(cyl((x, y, 0.26), (x, y, 0.07), 0.02, 0.019, sides=6), shade(LO, CD))     # 정강이
            fx = x
        else:
            paint(loft([(x, y, 0.53), (x - 0.02, y, 0.4), (x - 0.04, y, 0.28)], [0.05, 0.036, 0.024], sides=7, wob=0.02), sh)   # 허벅지·종아리
            paint(blob((x - 0.042, y, 0.272), (0.026, 0.022, 0.026), n=7, jitter=0.05), shade(LO, CD))   # 비절
            paint(cyl((x - 0.04, y, 0.27), (x - 0.03, y, 0.07), 0.02, 0.019, sides=6), shade(LO, CD))
            fx = x - 0.03
        paint(blob((fx, y, 0.065), (0.022, 0.021, 0.02), n=7, jitter=0.05), shade(LO, CD))   # 구절
        paint(cyl((fx + 0.002, y, 0.06), (fx + 0.012, y, 0.03), 0.018, 0.02, sides=6), shade(LO, CD))   # 발목
        paint(hull([V(fx + 0.013 + math.cos(a) * 0.023, y + math.sin(a) * 0.022, 0.0) for a in [k / 8 * 2 * math.pi for k in range(8)]] +
                   [V(fx + 0.01 + math.cos(a) * 0.018, y + math.sin(a) * 0.018, 0.032) for a in [k / 8 * 2 * math.pi for k in range(8)]]), solid(K['H']))   # 발굽
        base()
    # 꼬리 — 꼬리뿌리에서 살짝 들렸다가 길게 흘러내린다
    part('tail', loc=(-0.27, 0, 0.58))
    tp = crs([(-0.27, 0, 0.585), (-0.32, 0, 0.58), (-0.355, 0, 0.5), (-0.37, 0, 0.38), (-0.36, 0, 0.24)], 9)
    paint(loft(tp, [0.02, 0.03, 0.036, 0.042, 0.044, 0.042, 0.036, 0.026, 0.008], sides=7, ell=(0.7, 1.0), wob=0.12), shade(M, MD))
    for s2 in (-1, 0, 1):
        q = tp[3] + V(0, s2 * 0.015, 0)
        paint(loft([q, q + V(-0.02, s2 * 0.012, -0.08), q + V(-0.01, s2 * 0.018, -0.17)], [0.02, 0.014, 0.003], sides=4, wob=0.1), shade(M, MD))
    base()

def mt_horse_white():
    _horse('white'); finish('mt_horse_white', OUT, center=False)
def mt_horse_pearl():
    _horse('pearl'); finish('mt_horse_pearl', OUT, center=False)
def mt_horse_dapple():
    _horse('dapple'); finish('mt_horse_dapple', OUT, center=False)

# ══ 장식 (말 전용) ══
def _linen():   # 세마포 안장 덮개 — 희고 깨끗한 세마포(계 19:14), 금빛 테두리, 흰 안장과 금 앞테
    X0, X1 = -0.12, 0.1
    A = [k / 10 * 2.0 - 1.0 for k in range(11)]   # −1..1 → 각
    def drape(x, k=1.07):
        return [body_pt(x, a * 1.75, k) for a in A]
    xs = [X0 + (X1 - X0) * t / 6 for t in range(7)]
    for i in range(6):
        paint(hull(drape(xs[i]) + drape(xs[i + 1])), shade(LINEN, LINEN_D, k=0.04))
    for x in (X0 - 0.006, X1 + 0.006):   # 앞뒤 금빛 테두리
        paint(hull(drape(x - 0.006, 1.08) + drape(x + 0.006, 1.08)), shade(GOLD, GOLD_D), METAL)
    for s2 in (-1, 1):   # 아래 금빛 단 + 술
        pts = []
        for x in xs:
            for da in (0.0, 0.08):
                pts.append(body_pt(x, s2 * (1.75 - da), 1.085))
        paint(hull(pts), shade(GOLD, GOLD_D), METAL)
        for x in xs[::1]:
            p = body_pt(x, s2 * 1.75, 1.08)
            paint(cyl(p, p + V(0, s2 * 0.004, -0.03), 0.005, 0.002, sides=3), solid(GOLD))
        c = body_pt(-0.01, s2 * 1.15, 1.09)   # 옆면 금 마름모 장식 — 처음엔 금 십자였는데 흰 말 + 십자는 십자군을 떠올리게 해서 뺐다(10/2)
        paint(hull([c + V(dx, s2 * 0.004 * f, dz) for dx, dz in ((-0.02, 0.0), (0.02, 0.0), (0.0, -0.02), (0.0, 0.02)) for f in (0, 1)]), shade(GOLD, GOLD_D), METAL)
    # 안장 — 흰 가죽 자리, 앞 금 테, 뒤 테
    seat = []
    for x in (-0.07, -0.02, 0.04, 0.07):
        for a in (-0.9, -0.45, 0.0, 0.45, 0.9):
            seat.append(body_pt(x, a, 1.07)); seat.append(body_pt(x, a, 1.07) + V(0, 0, 0.018 if abs(a) < 0.5 else 0.008))
    paint(hull(seat), shade(lin(0xf2ece0), lin(0xd8cfbe)))
    for x, h in ((0.075, 0.026), (-0.075, 0.022)):
        top = body_pt(x, 0, 1.07)
        paint(hull([body_pt(x + dx, a, 1.07) for dx in (-0.008, 0.008) for a in (-0.7, 0.0, 0.7)] + [top + V(dx, y, h) for dx in (-0.006, 0.006) for y in (-0.03, 0.03)]), shade(GOLD, GOLD_D), METAL)

def _strap_ring(u, k, a0=-math.pi, a1=math.pi, n=12, r=0.0045, col=None, closed=True):
    pts = [head_pt(u, a0 + (a1 - a0) * j / n, k) for j in range(n if closed else n + 1)]
    paint(loft(pts, r, sides=4, closed=closed, wob=0), col or shade(GOLD, GOLD_D), METAL)

def _bridle():   # 금 굴레 — 정수리끈·이마띠·코끈·볼끈은 금, 이마에 금패, 재갈 고리와 붉은 고삐
    _strap_ring(0.04, 1.08)                                          # 정수리끈(귀 뒤)
    _strap_ring(0.13, 1.1, -1.5, 1.5, n=8, closed=False)             # 이마띠
    _strap_ring(0.68, 1.12)                                          # 코끈
    for s2 in (-1, 1):
        pts = [head_pt(u, s2 * 1.55, 1.1) for u in (0.04, 0.25, 0.5, 0.68, 0.86)]
        paint(loft(pts, 0.0045, sides=4, wob=0), shade(GOLD, GOLD_D), METAL)   # 볼끈
        b = head_pt(0.86, s2 * 1.75, 1.1)
        paint(loft([b + V(0.011 * math.cos(t), s2 * 0.006, 0.011 * math.sin(t)) for t in [k / 8 * 2 * math.pi for k in range(8)]], 0.0035, sides=3, closed=True, wob=0), shade(GOLD, GOLD_D), METAL)   # 재갈 고리
        paint(blob(head_pt(0.13, s2 * 1.5, 1.12), (0.01, 0.006, 0.01), n=6, jitter=0), solid(RED))   # 이마띠 끝 붉은 장식
        paint(loft(crs([b, V(0.41, s2 * 0.048, 0.66), V(0.32, s2 * 0.05, 0.675), V(0.23, s2 * 0.05, 0.64), V(0.16, s2 * 0.035, 0.64)], 8), 0.004, sides=3, wob=0), solid(RED))   # 고삐 — 목 옆을 따라 기갑까지
    c = head_pt(0.3, 0, 1.0); w = head_sec(0.3)[0]
    q = [c + HD * dx + V(0, y, 0) for dx, y in ((-0.035, 0), (0, -0.022), (0.04, 0), (0, 0.022))]
    paint(hull(q + [p + HN * 0.008 for p in q]), shade(GOLD, GOLD_D), METAL)   # 이마 금패
    paint(blob(c + HN * 0.01, (0.008, 0.008, 0.008), n=6, jitter=0), solid(lin(0xd8f4ff)), GLOW)   # 금패의 보석

def _maneflowers():   # 꽃 갈기 장식 — 갈기를 땋아 꽃을 꽂고, 앞머리에도 한 송이
    cr = crest(0, 7)
    paint(loft([p + n * 0.016 + V(0, 0.01, 0) for p, n in cr], 0.006, sides=4, wob=0.05), solid(LEAF))   # 땋은 덩굴
    for i, (p, n) in enumerate(cr):
        for f in (0.0, 0.5):
            if i == len(cr) - 1 and f: continue
            q = p + ((cr[i + 1][0] - p) * f if f else V(0, 0, 0)) + n * 0.018 + V(0, 0.014, 0)
            col = FLOWERS[(i * 2 + int(f * 2)) % len(FLOWERS)]
            for k in range(5):
                a = k / 5 * 2 * math.pi
                paint(blob(q + V(math.cos(a) * 0.009, 0.004, math.sin(a) * 0.009), (0.007, 0.004, 0.007), n=5, jitter=0), solid(col, 0.05))
            paint(blob(q + V(0, 0.007, 0), (0.005, 0.004, 0.005), n=5, jitter=0), solid(lin(0xf6c84a)))
            if (i + int(f * 2)) % 2: paint(blob(q + V(-0.012, -0.006, -0.01), (0.009, 0.004, 0.005), n=5, jitter=0), solid(LEAF))
    q = HP + HN * 0.036 + HD * 0.025   # 앞머리 꽃
    for k in range(5):
        a = k / 5 * 2 * math.pi
        paint(blob(q + V(0, math.cos(a) * 0.011, 0) + HD * (math.sin(a) * 0.011), (0.008, 0.008, 0.006), n=5, jitter=0), solid(FLOWERS[0], 0.05))
    paint(blob(q + HN * 0.004, (0.006, 0.006, 0.005), n=5, jitter=0), solid(lin(0xf6c84a)))

def _breastcollar():   # 붉은 술 가슴걸이 — 가슴을 두른 붉은 띠에 금 장식, 붉은 술과 작은 금방울
    pts = []
    for k in range(13):
        t = k / 12; a = (t - 0.5) * 2 * 1.45   # −y → +y 로 가슴 앞을 돈다
        pts.append(V(0.17 + 0.145 * math.cos(a), 0.118 * math.sin(a), 0.5 + 0.02 * (1 - math.cos(a))))
    paint(loft(pts, 0.009, sides=5, ell=(0.6, 1.4), wob=0), shade(RED, RED_D))
    paint(loft([p + V(0.0, 0, 0.012) for p in pts], 0.0035, sides=3, wob=0), shade(GOLD, GOLD_D), METAL)   # 금 테
    for s2 in (-1, 1):   # 기갑 위로 넘어가는 끈
        p0 = pts[0] if s2 < 0 else pts[-1]
        paint(loft([p0, V(0.15, s2 * 0.09, 0.575), V(0.14, s2 * 0.04, 0.64), V(0.14, 0, 0.65)], 0.006, sides=4, ell=(0.6, 1.4), wob=0), shade(RED, RED_D))
    paint(blob(pts[6] + V(0.008, 0, 0), (0.008, 0.02, 0.02), n=8, jitter=0), shade(GOLD, GOLD_D), METAL)   # 가운데 금 메달
    for k in range(1, 12):
        p = pts[k] + (pts[k] - V(0.17, 0, p_z(pts[k]))).normalized() * 0.004
        if k % 2:
            paint(cyl(p + V(0, 0, -0.006), p + V(0, 0, -0.045), 0.006, 0.009, sides=5), solid(RED, 0.06))   # 술
            paint(blob(p + V(0, 0, -0.008), (0.006, 0.006, 0.005), n=5, jitter=0), shade(GOLD, GOLD_D), METAL)
        else:
            paint(blob(p + V(0, 0, -0.016), (0.008, 0.008, 0.009), n=6, jitter=0), shade(GOLD, GOLD_D), METAL)   # 방울
def p_z(p): return p.z

def gd_horse_linen():
    begin(511); _linen(); finish('gd_horse_linen', OUT, center=False)
def gd_horse_bridle():
    begin(512); _bridle(); finish('gd_horse_bridle', OUT, center=False)
def gd_horse_maneflowers():
    begin(513); _maneflowers(); finish('gd_horse_maneflowers', OUT, center=False)
def gd_horse_breastcollar():
    begin(514); _breastcollar(); finish('gd_horse_breastcollar', OUT, center=False)

def pv_horse():   # 확인용: 흰 말 + 장식 넷
    _horse('white'); base(); _linen(); _bridle(); _maneflowers(); _breastcollar()
    finish('pv_horse', OUT, center=True, views={'a': (1.0, -1.25, 0.75), 'b': (-0.4, 1.3, 0.5), 'c': (1.4, 0.3, 0.35)})

ALL = [mt_horse_white, mt_horse_pearl, mt_horse_dapple, gd_horse_linen, gd_horse_bridle, gd_horse_maneflowers, gd_horse_breastcollar, pv_horse]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
