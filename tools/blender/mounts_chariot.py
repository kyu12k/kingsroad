# 🔥 불병거와 불말 (2026-10-02) — 「두 사람이 길을 가며 말하더니 불수레와 불말들이 두 사람을 갈라놓고 엘리야가 회오리바람으로 하늘로 올라가더라」(왕하 2:11)
# 실행: blender -b -P mounts_chariot.py -- <출력 폴더> [이름 …]   → models/mounts/mt_chariot_*.glb · gd_chariot_*.glb
# mounts.py와 같은 약속: 앞 = 블렌더 +x, 원점 = 말과 병거 전체 한가운데 아래 땅(finish center=False), 사람 키 약 0.53 기준
# 불말 둘이 나란히(왼 +y · 오 −y, y ±0.11) 금 병거를 끈다. 코끝 x 0.65 ~ 병거 뒤 x −0.62, 말 어깨 약 0.5
# 다리 leg0~3 = 왼말(+y) 앞왼·앞오·뒤왼·뒤오, leg4~7 = 오른말(−y) 같은 순서, 축 = 다리 꼭대기 z 0.4
# 머리 head0(왼말)·head1(오른말), 축 = 목 밑동 · 바퀴 wheelL(+y)·wheelR(−y), 축 = 굴대(x −0.46, y ±0.2, z 0.15), y축으로 돈다
# 불꽃 flame = 갈기·꼬리·병거의 불꽃 혀 전부(한 부분 — 게임에서 일렁이게), 축 = 원점
# 서는 자리 = 병거 바닥 (−0.46, 0.215) · 고삐 쥐는 곳 = 앞 난간 (−0.3, ±0.045, 0.48)
# 장식은 같은 좌표로 빚는다 · pv_chariot = 불빛 + 장식 넷(미리보기 확인용, 게임에 쓰지 않는다)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))

GOLD, GOLD_D, GOLD_L = lin(0xe8c25a), lin(0xb8923a), lin(0xf6dc8a)
RUBY = lin(0xd8323a)

# 불빛: 몸 위·옆·아래 · 불꽃 밑·끝 · 발굽·눈 · 빛(재질 발광색)
COATS = {
    'fire':  dict(BT=lin(0xffa424), B=lin(0xec5a0c), BB=lin(0xa82406), F0=lin(0xe0300a), F1=lin(0xffd23a), HF=lin(0xffeeb0), EM=(0.32, 0.1, 0.0)),
    'blue':  dict(BT=lin(0x7cc4ff), B=lin(0x2f7aee), BB=lin(0x1838b0), F0=lin(0x1f5cf0), F1=lin(0xd8f2ff), HF=lin(0xf4fbff), EM=(0.04, 0.14, 0.4)),
    'white': dict(BT=lin(0xfffbf0), B=lin(0xf8e2a8), BB=lin(0xd8a44a), F0=lin(0xf4b440), F1=lin(0xfffcf0), HF=lin(0xffffff), EM=(0.32, 0.26, 0.12)),
}

S_H = 0.8        # 말 크기(백마의 0.8배 — 어깨 0.5)
OX = 0.23        # 말 몸 가운데 x
HY = (0.11, -0.11)   # 왼말 · 오른말 y

# ── 말 단면(백마와 같은 모양을 줄여서) ──
BX = [-0.27, -0.22, -0.1, 0.05, 0.17, 0.25, 0.29]
BZ = [0.52, 0.52, 0.495, 0.495, 0.51, 0.525, 0.53]
BR = [0.055, 0.105, 0.122, 0.122, 0.112, 0.085, 0.045]
BELL = (0.8, 1.0)
NECK_CTRL = [(0.22, 0, 0.55), (0.28, 0, 0.645), (0.31, 0, 0.725), (0.345, 0, 0.8)]
NECK_R = [0.085, 0.072, 0.06, 0.05, 0.047]
HP = V(0.37, 0, 0.85); HM = V(0.53, 0, 0.665)
HD = (HM - HP).normalized(); HL = (HM - HP).length
HN = V(-HD.z, 0, HD.x)
HEAD_SEC = [(0.0, 0.040, 0.03, 0.062), (0.33, 0.043, 0.036, 0.05), (0.72, 0.031, 0.028, 0.032), (1.0, 0.026, 0.022, 0.026)]
def head_sec(u):
    for i in range(len(HEAD_SEC) - 1):
        if u <= HEAD_SEC[i + 1][0]:
            a, b = HEAD_SEC[i], HEAD_SEC[i + 1]; t = (u - a[0]) / (b[0] - a[0]); return tuple(a[k] + (b[k] - a[k]) * t for k in (1, 2, 3))
    return HEAD_SEC[-1][1:]
def head_pt(u, a, k=1.0):
    w, hf, hb = head_sec(u); c = HP + HD * (u * HL)
    return c + V(0, math.sin(a) * w * k, 0) + HN * (math.cos(a) * (hf if math.cos(a) > 0 else hb) * k)
def neck_line():
    pts = crs(NECK_CTRL, 7); out = []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, 6)] - pts[max(i - 1, 0)]).normalized()
        out.append((p, V(-t.z, 0, t.x), interp(NECK_R, i / 6)))
    return out

def T(p, y0):   # 백마 좌표 → 이 병거의 말 자리
    p = Vector(p); return V(OX + p.x * S_H, y0 + p.y * S_H, p.z * S_H)

def lerp3(a, b, t): return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))

def tongue(p0, d, L, r, K, curl=(0, 0, 0), sides=4, c0=None, c1=None):
    """불꽃 혀 — p0에서 d 쪽으로 L만큼, 끝으로 갈수록 가늘고 밝다(끝이 curl 쪽으로 휜다)"""
    p0 = Vector(p0); d = Vector(d).normalized(); cu = Vector(curl)
    sd = d.cross(V(0, 0, 1)); sd = sd.normalized() if sd.length > 1e-4 else V(0, 1, 0)
    w = (random.random() - 0.5) * 0.25   # 혀가 살짝 S자로 흔들린다
    pts = [p0 + d * (L * t) + cu * (L * t * t) + sd * (L * w * math.sin(t * math.pi * 1.6)) for t in (0.0, 0.33, 0.67, 1.0)]
    tip = pts[-1]; ax = tip - p0; l2 = max(ax.length_squared, 1e-6)
    a, b = c0 or K['F0'], c1 or K['F1']
    def fn(p, n):
        t = max(0.0, min(1.0, (p - p0).dot(ax) / l2)); return jit(lerp3(a, b, t ** 0.8), 0.06)
    paint(loft(pts, [r * 0.85, r * 1.05, r * 0.6, 0.0015], sides=sides, wob=0.15), fn, GLOW)

def body_shade(K): return shade(K['BT'], K['B'], K['BB'], k=0.07)

def _horse_body(K, y0, hi):
    sh = body_shade(K); s = S_H
    paint(loft([T((x, 0, z), y0) for x, z in zip(BX, BZ)], [r * s for r in BR], sides=8, ell=BELL, wob=0.03), sh, GLOW)
    for s2 in (-1, 1):
        paint(blob(T((-0.19, s2 * 0.034, 0.53), y0), (0.1 * s, 0.06 * s, 0.09 * s), n=10, jitter=0.05), sh, GLOW)   # 엉덩이
        paint(blob(T((0.18, s2 * 0.03, 0.52), y0), (0.075 * s, 0.055 * s, 0.088 * s), n=9, jitter=0.05), sh, GLOW)   # 어깨
    paint(blob(T((0.25, 0, 0.5), y0), (0.06 * s, 0.065 * s, 0.07 * s), n=9, jitter=0.05), sh, GLOW)   # 가슴
    # 머리
    part('head%d' % hi, loc=T((0.24, 0, 0.56), y0))
    NL = neck_line()
    paint(loft([T(p, y0) for p, n, r in NL], [r * s for p, n, r in NL], sides=7, ell=(0.6, 1.0), wob=0.03), sh, GLOW)
    paint(hull([T(head_pt(u, j / 9 * 2 * math.pi), y0) for (u, w, hf, hb) in HEAD_SEC for j in range(9)]), sh, GLOW)
    paint(blob(T(HP + HD * 0.05 - HN * 0.03, y0), (0.045 * s, 0.04 * s, 0.045 * s), n=8, jitter=0.05), sh, GLOW)   # 볼
    for s2 in (-1, 1):
        e = T(head_pt(0.3, s2 * 1.35, 1.0), y0)
        paint(blob(e, (0.009, 0.005, 0.008), n=6, jitter=0), solid(K['HF'], 0.02), GLOW)   # 빛나는 눈
        eb = T(head_pt(0.0, s2 * 0.75, 1.0), y0)
        paint(loft([eb, eb + V(0.01, s2 * 0.008, 0.032), eb + V(0.013, s2 * 0.01, 0.058)], [0.013, 0.01, 0.002], sides=4, ell=(1.0, 0.6), wob=0), sh, GLOW)   # 귀
        b = T(head_pt(0.86, s2 * 1.75, 1.1), y0)
        paint(blob(b, (0.008, 0.004, 0.008), n=6, jitter=0), shade(GOLD_L, GOLD_D), METAL)   # 금 재갈 고리
    for u in (0.66,):   # 금 코끈
        paint(loft([T(head_pt(u, -math.pi + j / 8 * 2 * math.pi, 1.1), y0) for j in range(8)], 0.0035, sides=3, closed=True, wob=0), shade(GOLD_L, GOLD_D), METAL)
    base()
    # 다리 — 앞은 곧게, 뒤는 비절이 뒤로 (발굽은 흰 불빛)
    for i, (x, y) in enumerate(((0.18, 0.05), (0.18, -0.05), (-0.19, 0.05), (-0.19, -0.05))):
        top = T((x, y, 0.5), y0)
        part('leg%d' % (hi * 4 + i), loc=top)
        if i < 2:
            paint(cyl(T((x, y, 0.52), y0), T((x, y, 0.27), y0), 0.04 * s, 0.026 * s, sides=5), sh, GLOW)
            paint(cyl(T((x, y, 0.27), y0), T((x, y, 0.03), y0), 0.021 * s, 0.019 * s, sides=5), sh, GLOW)
            fx = x
        else:
            paint(loft([T((x, y, 0.53), y0), T((x - 0.02, y, 0.4), y0), T((x - 0.04, y, 0.28), y0)], [0.05 * s, 0.036 * s, 0.024 * s], sides=5, wob=0.02), sh, GLOW)
            paint(cyl(T((x - 0.04, y, 0.28), y0), T((x - 0.03, y, 0.03), y0), 0.02 * s, 0.019 * s, sides=5), sh, GLOW)
            fx = x - 0.03
        f = T((fx + 0.01, y, 0.0), y0)
        paint(hull([f + V(math.cos(a) * 0.019, math.sin(a) * 0.018, 0.0) for a in [k / 7 * 2 * math.pi for k in range(7)]] +
                   [f + V(math.cos(a) * 0.015 - 0.003, math.sin(a) * 0.015, 0.032) for a in [k / 7 * 2 * math.pi for k in range(7)]]), solid(K['HF'], 0.03), GLOW)   # 발굽
        fl = T((fx, y, 0.075), y0)   # 발목 뒤로 날리는 작은 불꽃(다리와 함께 움직인다)
        tongue(fl, (-1, 0, 0.5), 0.055, 0.013, K, curl=(0, 0, 0.3))
        base()

def _horse_flames(K, y0):
    s = S_H
    for i, (p, n, r) in enumerate(neck_line()):   # 갈기 — 목 등선에서 위·뒤로 타오른다
        q = T(p + n * r * 0.8, y0)
        L = (0.1 - i * 0.006) * (0.9 + random.random() * 0.25)
        tongue(q, Vector(n) * 0.6 + V(-0.45, 0, 0.75), L, 0.02, K, curl=(-0.4, (random.random() - 0.5) * 0.3, 0.1))
        if i % 3 == 1: tongue(q + V(0, 0.012 * (1 if y0 > 0 else -1), -0.01), V(-0.7, 0, 0.6), L * 0.75, 0.016, K, curl=(-0.3, 0, 0.2))
    fl = T(HP + HN * 0.02, y0)
    tongue(fl, HN + V(-0.3, 0, 0.3), 0.06, 0.016, K, curl=(-0.4, 0, 0))   # 앞머리 불꽃
    for i, x in enumerate((-0.12, 0.0, 0.1)):   # 등줄기를 따라 낮은 불꽃
        q = T((x, 0, 0.6 if x > -0.1 else 0.62), y0)
        tongue(q, (-0.5, 0, 1), 0.06, 0.018, K, curl=(-0.5, 0, 0))
    root = T((-0.27, 0, 0.58), y0)   # 꼬리 — 크게 뒤로 휘날리는 불꽃
    for k, (dy, dz, L, r) in enumerate(((0, 0.25, 0.2, 0.03), (0.03, 0.05, 0.16, 0.024), (-0.03, 0.1, 0.17, 0.024), (0.01, 0.45, 0.12, 0.02))):
        tongue(root, (-1, dy * 6, dz), L, r, K, curl=(-0.1, 0, 0.35))

# ── 병거: U자 난간(뒤는 열림) ──
CX0, CXF, CW = -0.62, -0.43, 0.15   # 뒤 x · 앞 반원 중심 x · 반폭
AXLE = V(-0.46, 0, 0.15); WR = 0.15; WY = 0.2
FLOOR = 0.215
GRIP = (-0.295, 0.045, 0.478)   # 고삐가 앞 난간에 묶인 곳 = 손 쥐는 곳
def rail_plan(n=23):   # 왼 뒤 → 앞 반원 → 오른 뒤
    pts = []
    for k in range(n):
        u = k / (n - 1)
        if u < 0.25: t = u / 0.25; pts.append((CX0 + (CXF - CX0) * t, CW))
        elif u > 0.75: t = (u - 0.75) / 0.25; pts.append((CXF + (CX0 - CXF) * t, -CW))
        else:
            a = (u - 0.25) / 0.5 * math.pi; pts.append((CXF + math.sin(a) * CW, math.cos(a) * CW))
    return pts
def rail_h(x): return 0.36 + (x - CX0) / (CXF + CW - CX0) * 0.11
RAIL = [V(x, y, rail_h(x)) for x, y in rail_plan()]

def _chariot(K):
    g = shade(GOLD_L, GOLD, GOLD_D, k=0.06)
    P = rail_plan()
    # 바닥
    paint(hull([V(x, y, z) for x, y in P for z in (FLOOR - 0.025, FLOOR)]), shade(lin(0x8a4a2a), GOLD_D), METAL)
    # 벽 — 난간까지 금판, 마디마다
    for i in range(len(P) - 1):
        a, b = P[i], P[i + 1]
        pts = []
        for (x, y) in (a, b):
            c = V(x, y, 0); nn = V(x - CXF, y, 0) if x > CXF else V(0, y, 0); nn = nn.normalized() * 0.006
            for z in (FLOOR - 0.02, rail_h(x)):
                pts += [c + nn + V(0, 0, z), c - nn + V(0, 0, z)]
        paint(hull(pts), g, METAL)
    paint(loft(RAIL, 0.012, sides=4, wob=0), shade(GOLD_L, GOLD_D), METAL)   # 난간 테
    # 겉면 장식 띠 — 붉은 띠와 금 점
    mid = [V(x * 1.0 + (0.008 if x > CXF else 0), y * 1.05, (FLOOR + rail_h(x)) * 0.5) for x, y in P[2:-2]]
    paint(loft(mid, 0.012, sides=3, ell=(0.4, 1.0), wob=0), solid(RUBY, 0.06))
    for k in range(1, len(mid), 3):
        paint(blob(mid[k] + (V(mid[k].x - CXF, mid[k].y, 0).normalized() * 0.008 if mid[k].x > CXF else V(0, math.copysign(0.008, mid[k].y), 0)), (0.009, 0.009, 0.009), n=6, jitter=0), shade(GOLD_L, GOLD_D), METAL)
    # 앞 가운데 해 문양(빛)
    fc = V(CXF + CW + 0.01, 0, (FLOOR + rail_h(CXF + CW)) * 0.5 + 0.015)
    paint(blob(fc, (0.012, 0.03, 0.03), n=10, jitter=0), solid(K['F1'], 0.03), GLOW)
    for k in range(8):
        a = k / 8 * 2 * math.pi
        paint(cone(fc + V(0, math.cos(a) * 0.03, math.sin(a) * 0.03), fc + V(0.004, math.cos(a) * 0.055, math.sin(a) * 0.055), 0.008, 3), shade(GOLD_L, GOLD_D), METAL)
    # 굴대·받침·끌채·멍에
    paint(cyl(AXLE + V(0, -WY - 0.02, 0), AXLE + V(0, WY + 0.02, 0), 0.014, sides=6), shade(GOLD, GOLD_D), METAL)
    for y in (-0.1, 0.1): paint(hull([V(AXLE.x + dx, y + dy, z) for dx in (-0.03, 0.03) for dy in (-0.012, 0.012) for z in (0.14, FLOOR - 0.02)]), shade(GOLD, GOLD_D), METAL)
    yoke_x = OX + 0.12 * S_H; yoke_z = 0.5
    pole = crs([(CXF + CW - 0.02, 0, FLOOR - 0.015), (-0.12, 0, 0.26), (0.12, 0, 0.37), (yoke_x, 0, yoke_z)], 9)
    paint(loft(pole, [0.016, 0.014, 0.013, 0.012, 0.012, 0.012, 0.012, 0.012, 0.013], sides=6, wob=0), shade(GOLD_L, GOLD_D), METAL)
    paint(blob(V(yoke_x + 0.01, 0, yoke_z + 0.005), (0.02, 0.02, 0.02), n=8, jitter=0), solid(K['F1'], 0.03), GLOW)   # 끌채 끝 빛 구슬
    paint(cyl(V(yoke_x, -0.2, yoke_z), V(yoke_x, 0.2, yoke_z), 0.011, sides=6), shade(GOLD_L, GOLD_D), METAL)   # 멍에
    for y0 in HY:   # 멍에 안장(목에 걸치는 굽은 쇠) + 끝 장식
        wz = 0.598 * S_H
        arc = [V(yoke_x, y0 + math.sin(a) * 0.05, yoke_z - 0.012 - (1 - math.cos(a)) * 0.05) for a in [(-1 + k / 6 * 2) * 1.25 for k in range(7)]]
        paint(loft(arc, 0.008, sides=4, wob=0), shade(GOLD_L, GOLD_D), METAL)
    for y in (-0.2, 0.2): paint(blob(V(yoke_x, y, yoke_z), (0.014, 0.014, 0.014), n=6, jitter=0), shade(GOLD_L, GOLD_D), METAL)
    # 고삐 — 재갈에서 병거 앞 난간 위 쥐는 곳으로(불빛 끈)
    for y0 in HY:
        for s2 in (-1, 1):
            b = T(head_pt(0.86, s2 * 1.75, 1.1), y0)
            g2 = V(GRIP[0] + 0.01, GRIP[1] * (1 if y0 > 0 else -1) + s2 * 0.008, GRIP[2])
            mid1 = V(0.2, y0 * 0.8 + s2 * 0.035, 0.55)
            paint(loft(crs([b, V(b.x - 0.08, b.y, b.z - 0.04), mid1, V(-0.12, (g2.y + mid1.y) / 2, 0.52), g2], 7), 0.0035, sides=3, wob=0), solid(K['F1'], 0.04), GLOW)
    for y in (-1, 1): paint(loft([V(GRIP[0] + 0.012 * math.cos(t), y * GRIP[1], GRIP[2] - 0.012 + 0.012 * math.sin(t)) for t in [k / 6 * 2 * math.pi for k in range(6)]], 0.004, sides=3, closed=True, wob=0), shade(GOLD_L, GOLD_D), METAL)   # 난간 앞 고삐 고리
    # 바퀴
    for y, nm in ((WY, 'wheelL'), (-WY, 'wheelR')):
        part(nm, loc=(AXLE.x, y, AXLE.z))
        rim = [V(AXLE.x + math.cos(a) * WR, y, AXLE.z + math.sin(a) * WR) for a in [k / 12 * 2 * math.pi for k in range(12)]]
        paint(loft(rim, 0.016, sides=4, closed=True, wob=0, ell=(1.0, 1.4)), shade(GOLD_L, GOLD_D), METAL)
        rim2 = [V(AXLE.x + math.cos(a) * (WR - 0.022), y, AXLE.z + math.sin(a) * (WR - 0.022)) for a in [k / 12 * 2 * math.pi for k in range(12)]]
        paint(loft(rim2, 0.005, sides=3, closed=True, wob=0), solid(K['F0'], 0.04), GLOW)   # 테 안쪽 불빛 고리
        for k in range(6):
            a = k / 6 * 2 * math.pi
            paint(cyl(AXLE + V(math.cos(a) * 0.02, y, math.sin(a) * 0.02), AXLE + V(math.cos(a) * (WR - 0.01), y, math.sin(a) * (WR - 0.01)), 0.0085, 0.006, sides=4), shade(GOLD, GOLD_D), METAL)
        paint(cyl(V(AXLE.x, y - 0.03, AXLE.z), V(AXLE.x, y + 0.03, AXLE.z), 0.03, 0.022, sides=6), shade(GOLD_L, GOLD_D), METAL)   # 바퀴통
        paint(blob(V(AXLE.x, y + math.copysign(0.032, y), AXLE.z), (0.014, 0.008, 0.014), n=6, jitter=0), solid(K['F1'], 0.03), GLOW)
        base()

def _chariot_flames(K):
    # 난간 바깥을 감싸 오르는 불꽃(뒤로 휜다) — 앞 반원은 낮게, 옆은 높게
    for i, p in enumerate(RAIL):
        if i % 2 or 8 <= i <= 14: continue   # 앞 가운데(해 문양·고삐 쪽)는 비운다
        out = (V(p.x - CXF, p.y, 0) if p.x > CXF else V(0, p.y, 0)).normalized()
        L = 0.09 + 0.08 * (1 - (p.x - CX0) / 0.34) + random.random() * 0.03
        tongue(p + out * 0.016 - V(0, 0, 0.07), out * 0.25 + V(-0.5, 0, 1), L, 0.032, K, curl=(-0.6, 0, 0))
        tongue(p + out * 0.02 - V(0, 0, 0.1), out * 0.4 + V(-0.6, 0, 0.8), L * 0.55, 0.022, K, curl=(-0.4, 0, 0))
    for y in (-1, 1):   # 뒤 모서리 큰 불꽃
        tongue(V(CX0, y * CW, 0.33), (-0.6, y * 0.2, 1), 0.2, 0.03, K, curl=(-0.6, 0, 0))
    for k in range(3):   # 바닥 아래로 흘러 뒤로 끌리는 불꽃
        y = (-1 + k) * 0.11
        tongue(V(CX0 + 0.02, y, FLOOR - 0.02), (-1, y * 0.5, 0.15), 0.12 + (0.04 if k % 2 == 0 else 0), 0.022, K, curl=(0, 0, 0.25))

def _all(coat):
    K = COATS[coat]
    begin(901)
    for hi, y0 in enumerate(HY): _horse_body(K, y0, hi)
    _chariot(K)
    part('flame', loc=(0, 0, 0))
    for y0 in HY: _horse_flames(K, y0)
    _chariot_flames(K)
    base()
    return K

def mt_chariot_fire():
    K = _all('fire'); finish('mt_chariot_fire', OUT, emit=K['EM'], center=False)
def mt_chariot_blue():
    K = _all('blue'); finish('mt_chariot_blue', OUT, emit=K['EM'], center=False)
def mt_chariot_white():
    K = _all('white'); finish('mt_chariot_white', OUT, emit=K['EM'], center=False)

# ══ 장식 (병거 전용) ══
FIREK = COATS['fire']
def _canopy():   # 금 차양 — 네 기둥 위 금빛 지붕, 붉은 술 단
    posts = [(-0.6, 0.138), (-0.6, -0.138), (-0.323, 0.105), (-0.323, -0.105)]
    for x, y in posts:
        paint(cyl(V(x, y, FLOOR), V(x, y, 0.86), 0.009, sides=5), shade(GOLD_L, GOLD_D), METAL)
        paint(blob(V(x, y, rail_h(x) - 0.005), (0.014, 0.014, 0.014), n=6, jitter=0), shade(GOLD_L, GOLD_D), METAL)   # 난간에 묶은 고리
    x0, x1, yw = -0.65, -0.27, 0.17
    roof = [V(x, y, 0.86) for x in (x0, x1) for y in (-yw, yw)] + [V(x, y, 0.875) for x in (x0, x1) for y in (-yw, yw)]
    roof += [V((x0 + x1) / 2, 0, 0.95), V(x0 + 0.06, 0, 0.92), V(x1 - 0.06, 0, 0.92)]
    paint(hull(roof), shade(GOLD_L, GOLD, GOLD_D, k=0.05), METAL)
    paint(blob(V((x0 + x1) / 2, 0, 0.96), (0.018, 0.018, 0.022), n=8, jitter=0), solid(FIREK['F1'], 0.03), GLOW)   # 꼭대기 빛 구슬
    # 붉은 술 단(가장자리를 돌아가며 늘어진 조각)
    edge = []
    for k in range(9): edge.append((x0 + (x1 - x0) * k / 8, yw))
    for k in range(1, 6): edge.append((x1, yw - 2 * yw * k / 6))
    for k in range(9): edge.append((x1 - (x1 - x0) * k / 8, -yw))
    for k in range(1, 6): edge.append((x0, -yw + 2 * yw * k / 6))
    for i, (x, y) in enumerate(edge):
        out = V(1 if x >= x1 - 1e-6 else -1 if x <= x0 + 1e-6 else 0, 1 if y >= yw - 1e-6 else -1 if y <= -yw + 1e-6 else 0, 0) * 0.004
        c = V(x, y, 0.86) + out
        col = RUBY if i % 2 else lin(0xff9a2a)
        paint(hull([c + V(dx, dy, 0.0) for dx in (-0.016, 0.016) for dy in (-0.004, 0.004)] + [c + V(0, 0, -0.04)]), solid(col, 0.05))
        paint(blob(c + V(0, 0, -0.045), (0.005, 0.005, 0.006), n=5, jitter=0), shade(GOLD_L, GOLD_D), METAL)

def _banners():   # 불꽃 깃발 둘 — 병거 뒤 모서리에 금 깃대, 불꽃 모양 깃발이 뒤로 휘날린다
    K = FIREK
    for y in (-1, 1):
        px, py = CX0 + 0.005, y * (CW + 0.015)
        paint(cyl(V(px, py, FLOOR - 0.01), V(px, py, 0.98), 0.008, sides=5), shade(GOLD_L, GOLD_D), METAL)
        for z in (0.25, rail_h(CX0) - 0.01): paint(cyl(V(px, py - y * 0.012, z), V(px, py + y * 0.006, z), 0.012, sides=5), shade(GOLD, GOLD_D), METAL)   # 병거에 묶은 쇠고리
        paint(cone(V(px, py, 0.98), V(px, py, 1.03), 0.014, 5), shade(GOLD_L, GOLD_D), METAL)
        # 깃발 — 깃대에서 뒤로, 물결치며 끝이 세 갈래 불꽃 혀
        top, bot = 0.96, 0.8
        cols = []
        for k in range(7):
            t = k / 6; x = px - 0.02 - t * 0.2; yy = py + y * 0.02 * math.sin(t * math.pi * 1.5)
            cols.append((x, yy, top - t * 0.035 + 0.01 * math.sin(t * 6), bot + t * 0.035))
        for k in range(6):
            a, b = cols[k], cols[k + 1]; tt = k / 5
            c = lerp3(lin(0xd8281a), lin(0xffb030), tt)
            paint(hull([V(a[0], a[1] + d, a[2]) for d in (-0.003, 0.003)] + [V(a[0], a[1] + d, a[3]) for d in (-0.003, 0.003)] +
                       [V(b[0], b[1] + d, b[2]) for d in (-0.003, 0.003)] + [V(b[0], b[1] + d, b[3]) for d in (-0.003, 0.003)]), solid(c, 0.05), GLOW)
        paint(hull([V(px - 0.02, py + d, z) for d in (-0.004, 0.004) for z in (cols[0][2], cols[0][3])] + [V(px, py + d, z) for d in (-0.004, 0.004) for z in (cols[0][2], cols[0][3])]), solid(lin(0xd8281a), 0.04), GLOW)   # 깃대에 붙은 자락
        e = cols[-1]
        for k, zt in enumerate((0.0, 0.5, 1.0)):
            z = e[3] + (e[2] - e[3]) * zt
            tongue(V(e[0] + 0.004, e[1], z), (-1, 0, 0.35 - zt * 0.25), 0.07 + 0.03 * (k == 1), 0.016, K, curl=(0, 0, 0.2), c0=lin(0xffa028), c1=lin(0xfff0a0))
        paint(blob(V(cols[2][0], cols[2][1] + y * 0.005, (cols[2][2] + cols[2][3]) / 2), (0.022, 0.006, 0.022), n=8, jitter=0), shade(GOLD_L, GOLD_D), METAL)   # 깃발 가운데 금 해

def _mantle():   # 엘리야의 겉옷(왕하 2:13) — 앞 난간에 걸쳐 바깥으로 늘어진 갈색 털옷
    W0, W1, W2 = lin(0x8a6440), lin(0x6a4a2c), lin(0xa47e56)
    wool = shade(W2, W0, W1, k=0.14)
    idx = list(range(6, 17))   # 앞 반원 쪽 난간 마디
    def outv(p): return (V(p.x - CXF, p.y, 0) if p.x > CXF else V(0, p.y, 0)).normalized()
    hem = {i: 0.12 + 0.035 * math.sin(i * 1.9) for i in idx}   # 늘어진 길이(단이 들쭉날쭉)
    paint(loft([RAIL[i] + V(0, 0, 0.008) for i in idx], 0.02, sides=6, ell=(1.2, 0.8), wob=0.25), wool)   # 난간 위로 접힌 두툼한 자락
    for i in idx[:-1]:
        j = i + 1; P0, P1 = RAIL[i], RAIL[j]; o0, o1 = outv(P0), outv(P1)
        pts = []
        for P, o, L in ((P0, o0, hem[i]), (P1, o1, hem[j])):
            for dz, k in ((0.005, 0.016), (-L * 0.5, 0.03), (-L, 0.026)):
                pts += [P + o * k + V(0, 0, dz), P + o * (k + 0.012) + V(0, 0, dz)]
        paint(hull(pts), wool)   # 바깥으로 늘어진 털옷
        pts = [P + outv(P) * -0.01 + V(0, 0, dz) for P in (P0, P1) for dz in (0.0, -0.045)] + [P + outv(P) * -0.018 + V(0, 0, -0.03) for P in (P0, P1)]
        paint(hull(pts), wool)   # 안쪽으로 조금
        if i % 2 == 0:   # 털 뭉치
            q = P0 + o0 * 0.04 + V(0, 0, -hem[i] * (0.3 + random.random() * 0.5))
            paint(blob(q, (0.012, 0.012, 0.014), n=6, jitter=0.25), solid(W2, 0.08))
def _trail():   # 불꽃 자취 — 두 바퀴 뒤 땅에 타는 줄과 일어서는 불씨 불꽃
    K = FIREK
    for y in (-WY, WY):
        x0 = AXLE.x - 0.02; L = 0.55
        pts = [V(x0 - L * t, y + 0.015 * math.sin(t * 7), 0.004) for t in [k / 8 for k in range(9)]]
        def fn(p, n, x0=x0, L=L): t = max(0, min(1, (x0 - p.x) / L)); return jit(lerp3(K['F1'], lin(0xd8401a), t), 0.06)
        paint(loft(pts, [0.045 - 0.038 * k / 8 for k in range(9)], sides=4, ell=(1.0, 0.15), wob=0.1), fn, GLOW)
        for k in range(5):
            t = (k + 0.3) / 5; p = V(x0 - L * t, y + (random.random() - 0.5) * 0.03, 0.0)
            tongue(p, (-0.4, 0, 1), 0.13 * (1 - t) + 0.03, 0.03 * (1 - t * 0.5), K, curl=(-0.6, 0, 0))
        for k in range(10):   # 땅에 떨어진 불씨
            t = random.random(); p = V(x0 - L * t, y + (random.random() - 0.5) * 0.09, 0.006)
            paint(blob(p, (0.007, 0.007, 0.005), n=5, jitter=0.2), solid(lerp3(K['F1'], K['F0'], t), 0.05), GLOW)

def gd_chariot_canopy():
    begin(911); _canopy(); finish('gd_chariot_canopy', OUT, center=False)
def gd_chariot_banners():
    begin(912); _banners(); finish('gd_chariot_banners', OUT, emit=FIREK['EM'], center=False)
def gd_chariot_mantle():
    begin(913); _mantle(); finish('gd_chariot_mantle', OUT, center=False)
def gd_chariot_trail():
    begin(914); _trail(); finish('gd_chariot_trail', OUT, emit=FIREK['EM'], center=False)

def pv_chariot():   # 확인용: 불빛 + 장식 넷
    K = _all('fire'); _canopy(); _banners(); _mantle(); _trail()
    finish('pv_chariot', OUT, emit=K['EM'], center=True, views={'a': (1.0, -1.25, 0.75), 'b': (-0.6, 1.3, 0.5), 'c': (0.2, -1.4, 0.35)})
def pv_chariot_plain():   # 장식 없이
    K = _all('fire'); finish('pv_chariot_plain', OUT, emit=K['EM'], center=True, lens=85, views={'a': (1.0, -1.25, 0.75), 'd': (-1.2, -0.6, 0.9), 'e': (1.3, 0.5, 0.6)})

ALL = [mt_chariot_fire, mt_chariot_blue, mt_chariot_white, gd_chariot_canopy, gd_chariot_banners, gd_chariot_mantle, gd_chariot_trail, pv_chariot]
for f in ALL + ([pv_chariot_plain] if 'pv_chariot_plain' in ONLY else []):
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
