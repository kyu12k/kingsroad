# 🦅 독수리 날개 (2026-10-02) — 「오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요」(사 40:31)
#                               「그 여자가 큰 독수리의 두 날개를 받아」(계 12:14)
# 실행: blender -b -P mounts_eagle.py -- <출력 폴더> [이름 …]   → models/mounts/mt_eagle_*.glb · gd_eagle_*.glb
# mounts.py와 같은 약속: 앞 = 블렌더 +x, 원점 = 몸 한가운데 아래 땅(finish center=False), 사람 키 약 0.53 기준
# 몸 길이(가슴~꼬리뿌리) 약 0.6 + 꼬리 0.2, 등 높이 약 0.45, 날개 편 폭 약 1.65 — 날개는 옆으로 평평하게 편 채로 빚었다
# 움직이는 축:
#   wingL(+y) · wingR(−y) = 어깨 (0.08, ±0.1, 0.42) — 몸 긴 축(x)을 따라 돌리면 날갯짓, 접기
#   head = 목 밑동 (0.19, 0, 0.37) · tail = 꼬리뿌리 (−0.27, 0, 0.34) · legs = 엉덩이 (0.0, 0, 0.24) — 두 다리와 발톱을 함께(날 때 접어 넣는다)
# 앉는 자리 = 날개 사이 등 위 (−0.03, 0.47)
# 장식은 같은 좌표로 빚는다. crown은 게임에서 head 축 아래로 옮겨 붙인다.
#   ribbons·sparkle은 ribbonL/ribbonR · glowL/glowR 축(= 어깨 축과 같은 자리)으로 나뉘어 있어 게임에서 wingL/wingR 아래로 옮겨 붙인다
# pv_eagle = 금빛 독수리 + 장식 넷을 한 모델로(미리보기 확인용, 게임에 쓰지 않는다)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))
def dk(c, k=0.8): return tuple(v * k for v in c)

GOLD, GOLD_D = lin(0xe8c25a), lin(0xb8923a)

# 깃빛: 몸 · 그늘 · 배 · 머리 · 머리 그늘 · 뒷목(dark만 금빛) · 덮깃 끝 · 날개깃 · 날개깃 끝(재질) · 꼬리 · 꼬리 끝 · 부리 · 발
EAGLE_COATS = {
    'golden': dict(C=lin(0xa8742e), CD=lin(0x7a5020), BL=lin(0x8a5a24), HD=lin(0xfbfaf4), HDD=lin(0xe0dbcf), NP=None,
                   CE=lin(0xd6a554), F=lin(0x6a4420), FT=lin(0x33200f), FTM=BASE, TL=lin(0xf6f4ee), TT=lin(0xe8e4da),
                   BK=lin(0xf4c02a), FEET=lin(0xf2c232)),
    'white':  dict(C=lin(0xf4f5f6), CD=lin(0xd4d9e0), BL=lin(0xffffff), HD=lin(0xffffff), HDD=lin(0xe4e7ec), NP=None,
                   CE=lin(0xdfe4ea), F=lin(0xeceff2), FT=lin(0xb4bfcc), FTM=METAL, TL=lin(0xf4f5f6), TT=lin(0xb4bfcc),
                   BK=lin(0xf2c84a), FEET=lin(0xf2cc50)),
    'dark':   dict(C=lin(0x4e3424), CD=lin(0x34221a), BL=lin(0x3e2a1e), HD=lin(0x5a3e28), HDD=lin(0x44301e), NP=lin(0xc8983e),
                   CE=lin(0xc8983e), F=lin(0x2e1e16), FT=lin(0xd8a840), FTM=METAL, TL=lin(0x3a281c), TT=lin(0xd8a840),
                   BK=lin(0xf0c030), FEET=lin(0xf0c030)),
}
CLAW = lin(0x2a2420)

# ── 몸통 단면 ──
BX = [-0.30, -0.22, -0.1, 0.02, 0.13, 0.21, 0.26]
BZ = [0.335, 0.322, 0.31, 0.31, 0.322, 0.345, 0.37]
BR = [0.045, 0.092, 0.125, 0.135, 0.126, 0.098, 0.055]
BELL = (0.85, 0.95)
def body_at(x):
    if x <= BX[0]: return BZ[0], BR[0]
    for i in range(len(BX) - 1):
        if x <= BX[i + 1]:
            t = (x - BX[i]) / (BX[i + 1] - BX[i]); return BZ[i] + (BZ[i + 1] - BZ[i]) * t, BR[i] + (BR[i + 1] - BR[i]) * t
    return BZ[-1], BR[-1]
def body_pt(x, a, k=1.0):   # a = 등 꼭대기에서 잰 각(+는 +y쪽)
    zc, r = body_at(x); return V(x, math.sin(a) * r * BELL[0] * k, zc + math.cos(a) * r * BELL[1] * k)
def body_n(a): return V(0, math.sin(a) / BELL[0], math.cos(a) / BELL[1]).normalized()

SHOULDER = {1: V(0.08, 0.10, 0.42), -1: V(0.08, -0.10, 0.42)}
SEAT = (-0.03, 0.47)
HEAD_PIV = V(0.19, 0, 0.37)

# ── 날개 배치(정해진 값 — 장식이 같은 자리를 쓴다) ──
def wing_layout(s):
    """깃 하나 = (종류, 뿌리, 끝, 폭). 종류: sec(둘째날개깃) · pri(첫날개깃) · cov1(큰덮깃) · cov2(작은덮깃)"""
    out = []
    for i in range(10):   # 둘째날개깃 — 팔을 따라 뒤로
        t = i / 9; y = 0.12 + t * 0.29
        root = V(0.05, s * y, 0.428 + 0.02 * t)
        tip = V(-0.17 - 0.015 * math.sin(t * math.pi), s * (y + 0.015), 0.42 + 0.025 * t)
        out.append(('sec', root, tip, 0.028))
    LS = [0.22, 0.235, 0.25, 0.262, 0.272, 0.276, 0.27, 0.25]
    for i in range(8):    # 첫날개깃 — 손에서 부채처럼, 바깥 끝은 손가락처럼 벌어진다
        th = math.radians(12 + i * 10.5)
        root = V(0.06 - 0.01 * i / 7, s * (0.40 + i * 0.024), 0.448 + 0.004 * i)
        d = V(-math.cos(th), s * math.sin(th), 0.04)
        out.append(('pri', root, root + d * LS[i], 0.03 - 0.004 * i / 7))
    for i in range(12):   # 큰덮깃
        t = i / 11; y = 0.11 + t * 0.47
        th = math.radians(max(0.0, (y - 0.38) / 0.2) * 45)
        root = V(0.085, s * y, 0.448 + 0.018 * t)
        L = 0.13 - 0.03 * t
        out.append(('cov1', root, root + V(-math.cos(th), s * math.sin(th), -0.004) * L, 0.03))
    for i in range(10):   # 작은덮깃
        t = i / 9; y = 0.11 + t * 0.44
        th = math.radians(max(0.0, (y - 0.38) / 0.2) * 40)
        root = V(0.1, s * y, 0.46 + 0.016 * t)
        out.append(('cov2', root, root + V(-math.cos(th), s * math.sin(th), -0.004) * 0.075, 0.028))
    return out

def arm_line(s):   # 날개 앞전(팔뼈)
    return crs([V(0.07, s * 0.09, 0.425), V(0.11, s * 0.25, 0.445), V(0.11, s * 0.42, 0.455), V(0.075, s * 0.58, 0.47)], 8)

def feather(root, tip, w, col, tipcol, tipmat=BASE, frac=0.74, thick=0.14, lift=0.008, mat=BASE):
    L = (tip - root).length
    pts = [root.lerp(tip, u) + V(0, 0, lift * math.sin(u * math.pi)) for u in (0, 0.68, 1.0)]   # 세모 단면 · 마디 둘 — 가볍게
    fs = loft(pts, [w * 0.6, w * 1.12, w * 0.1], sides=3, ell=(1.0, thick * 1.6), wob=0, cap0=False, cap1=False)
    for f in fs:
        c = f.calc_center_median()
        if (c - root).length > L * frac: paint([f], solid(tipcol, 0.06), tipmat)
        else: paint([f], shade(col, dk(col, 0.82), k=0.06), mat)
    return fs

def scale(p, nrm, d, w, L, col):   # 몸에 눕힌 작은 깃(비늘처럼)
    side = nrm.cross(d).normalized()
    paint(hull([p + side * w, p - side * w, p + d * L + nrm * 0.004, p + d * (L * 0.35) + nrm * 0.01 + side * w * 0.6, p + d * (L * 0.35) + nrm * 0.01 - side * w * 0.6]), col)

def _wing(K, s):
    C, CD = K['C'], K['CD']
    part('wingL' if s > 0 else 'wingR', loc=tuple(SHOULDER[s]))
    al = arm_line(s)
    paint(loft(al, [0.04, 0.038, 0.034, 0.03, 0.028, 0.025, 0.02, 0.012], sides=6, ell=(1.0, 0.45), wob=0.02), shade(C, CD, k=0.05))
    # 깃 사이로 비치지 않게 얇은 막
    mem = [p + V(0, 0, dz) for p in al for dz in (-0.006, 0.004)]
    mem += [V(-0.1, s * y, 0.42 + dz) for y in (0.11, 0.3, 0.45) for dz in (-0.006, 0.004)]
    paint(hull(mem), shade(dk(K['F'], 0.95), dk(K['F'], 0.8)))
    for kind, root, tip, w in wing_layout(s):
        if kind == 'sec': feather(root, tip, w, K['F'], K['FT'], K['FTM'], frac=0.8)
        elif kind == 'pri': feather(root, tip, w, K['F'], K['FT'], K['FTM'], frac=0.7)
        elif kind == 'cov1': feather(root, tip, w, C, K['CE'], frac=0.78, lift=0.006)
        else: feather(root, tip, w, C, C, frac=1.1, lift=0.006, thick=0.2)
    base()

def _eagle(coat, seed=601):
    K = EAGLE_COATS[coat]; C, CD = K['C'], K['CD']
    sh = shade(C, CD, k=0.05)
    begin(seed)
    # 몸통 — 둥근 통 + 가슴 · 어깨 덩어리
    paint(loft(list(zip(BX, [0] * 7, BZ)), BR, sides=12, ell=BELL, wob=0.02), sh)
    paint(blob((0.17, 0, 0.33), (0.1, 0.1, 0.105), n=18, jitter=0.04), shade(C, CD, K['BL'], k=0.05))   # 가슴
    for s2 in (-1, 1):
        paint(blob((0.07, s2 * 0.06, 0.4), (0.08, 0.05, 0.045), n=14, jitter=0.04), sh)   # 어깨
    paint(loft([(-0.16, 0, 0.215), (0.0, 0, 0.195), (0.13, 0, 0.225)], [0.06, 0.075, 0.06], sides=8, ell=(1.0, 0.4), wob=0.02), solid(K['BL']))   # 배
    # 몸에 눕힌 깃 — 가슴(아래로)·옆구리(뒤로)·허리(뒤로)
    for x in (-0.2, -0.12, 0.13):
        for a in (-1.9, -1.45, -1.0, 1.0, 1.45, 1.9, 2.3, -2.3):
            if x > 0 and abs(a) < 1.5: continue
            p = body_pt(x, a, 1.0); n = body_n(a)
            scale(p, n, V(-1, 0, -0.15).normalized(), 0.025, 0.06, shade(C, CD, k=0.08))
    for a in (-2.6, -2.2, -1.8, 1.8, 2.2, 2.6, math.pi):
        for x in (0.2, 0.13):
            zc, r = body_at(x)
            p = V(x + 0.07, math.sin(a) * 0.08, 0.33 + math.cos(a) * 0.09); n = (p - V(0.12, 0, 0.33)).normalized()
            scale(p, n, V(-0.2, 0, -1).normalized(), 0.025, 0.055, shade(C, CD, K['BL'], k=0.08))
    for x in (-0.24, -0.17):   # 허리 위 — 꼬리 쪽
        for a in (-0.5, 0.0, 0.5):
            p = body_pt(x, a, 1.0); scale(p, body_n(a), V(-1, 0, -0.1).normalized(), 0.028, 0.065, sh)
    # 머리 축: 목 · 머리 · 부리 · 눈
    part('head', loc=tuple(HEAD_PIV))
    HD, HDD = K['HD'], K['HDD']
    def nfn(p, n):
        if K['NP'] is not None and p.z > 0.44 and p.x < 0.32 and n.x < -0.25 and n.z > -0.2: return jit(K['NP'], 0.08)
        if p.z > 0.425 or p.x > 0.27: return jit(HD if n.z > 0.3 else HDD, 0.05)
        return jit(C if n.z > 0.3 else CD, 0.05)
    nk = crs([(0.15, 0, 0.36), (0.22, 0, 0.41), (0.28, 0, 0.47), (0.32, 0, 0.5)], 6)
    paint(loft(nk, [0.085, 0.078, 0.068, 0.062, 0.058, 0.055], sides=10, ell=(0.85, 1.0), wob=0.04), nfn)
    paint(blob((0.33, 0, 0.505), (0.072, 0.058, 0.062), n=22, jitter=0.03), nfn)                 # 머리
    paint(blob((0.37, 0, 0.497), (0.04, 0.046, 0.045), n=14, jitter=0.03), nfn)                  # 볼
    for k in range(7):   # 목둘레 깃 — 머리 빛과 몸 빛이 만나는 자리에 뾰족하게
        a = (k / 6 - 0.5) * 2 * 2.2
        p = V(0.215 + 0.02 * math.cos(a), math.sin(a) * 0.07, 0.405 + math.cos(a) * 0.055)
        n = V(0.3, math.sin(a), math.cos(a)).normalized()
        scale(p, n, V(-1, 0, -0.5).normalized(), 0.024, 0.06, lambda p_, n_: jit(HD if K['NP'] is None else K['NP'], 0.06))
    BK = K['BK']
    paint(blob((0.392, 0, 0.508), (0.022, 0.03, 0.024), n=10, jitter=0.02), shade(BK, dk(BK, 0.85)))   # 납막(부리 뿌리)
    up = crs([(0.39, 0, 0.51), (0.43, 0, 0.513), (0.458, 0, 0.497), (0.468, 0, 0.472), (0.458, 0, 0.452)], 8)
    paint(loft(up, [0.026, 0.024, 0.02, 0.016, 0.012, 0.008, 0.005, 0.001], sides=7, ell=(0.75, 1.0), wob=0), shade(BK, dk(BK, 0.85)))   # 굽은 윗부리
    paint(loft([(0.39, 0, 0.483), (0.42, 0, 0.478), (0.445, 0, 0.478)], [0.017, 0.013, 0.003], sides=6, ell=(0.8, 0.7), wob=0), solid(dk(BK, 0.9)))   # 아랫부리
    for s2 in (-1, 1):
        paint(blob((0.405, s2 * 0.012, 0.515), (0.006, 0.003, 0.004), n=5, jitter=0), solid(lin(0x5a3a10)))   # 콧구멍
        e = V(0.372, s2 * 0.043, 0.522)
        paint(blob(e, (0.016, 0.008, 0.015), n=10, jitter=0), solid(lin(0xe0a020)))                   # 호박색 눈
        paint(blob(e + V(0.004, s2 * 0.004, 0.0), (0.009, 0.006, 0.009), n=8, jitter=0), solid(lin(0x140c06)))   # 눈동자
        paint(blob(e + V(0.008, s2 * 0.008, 0.005), (0.004, 0.002, 0.004), n=5, jitter=0), solid(lin(0xffffff)))   # 눈빛
        paint(loft([e + V(-0.018, s2 * 0.004, 0.014), e + V(0.0, s2 * 0.008, 0.018), e + V(0.02, s2 * 0.002, 0.012)], [0.008, 0.009, 0.005], sides=5, ell=(1.0, 0.6), wob=0), solid(HDD))   # 눈썹뼈
    base()
    # 날개
    _wing(K, 1); _wing(K, -1)
    # 꼬리 — 부채꼴
    part('tail', loc=(-0.27, 0, 0.34))
    for i in range(9):
        ph = math.radians(-36 + i * 9)
        root = V(-0.25, math.sin(ph) * 0.03, 0.335 + 0.002 * abs(i - 4))
        d = V(-math.cos(ph), math.sin(ph), -0.13).normalized()
        feather(root, root + d * (0.22 - 0.012 * abs(i - 4)), 0.034, K['TL'], K['TT'], K['FTM'], frac=0.8, lift=0.004 + 0.001 * abs(i - 4))
    for i in range(5):   # 꼬리 덮깃
        ph = math.radians(-24 + i * 12)
        root = V(-0.24, math.sin(ph) * 0.02, 0.355)
        d = V(-math.cos(ph), math.sin(ph), -0.12).normalized()
        feather(root, root + d * 0.11, 0.032, C, C, frac=1.1, lift=0.006, thick=0.25)
    base()
    # 다리 — 깃 바지 · 노란 정강이 · 발가락과 검은 발톱
    part('legs', loc=(0.0, 0, 0.24))
    F = K['FEET']
    for s2 in (-1, 1):
        y = s2 * 0.075
        paint(blob((0.0, y, 0.2), (0.062, 0.048, 0.075), n=16, jitter=0.06), shade(C, CD, K['BL'], k=0.06))   # 깃 바지
        for k in range(4):
            a = k / 4 * 2 * math.pi
            p = V(0.005 + math.cos(a) * 0.035, y + math.sin(a) * 0.03, 0.15)
            scale(p, V(math.cos(a), math.sin(a), 0), V(0, 0, -1), 0.02, 0.04, shade(C, CD, k=0.08))
        paint(cyl((0.012, y, 0.16), (0.03, y, 0.03), 0.021, 0.017, sides=7), shade(F, dk(F, 0.85)))   # 정강이
        A = V(0.032, y, 0.024)
        paint(blob(A, (0.022, 0.02, 0.016), n=8, jitter=0.03), shade(F, dk(F, 0.85)))
        for ang, L in ((-0.5, 0.07), (0.0, 0.08), (0.5, 0.07), (math.pi, 0.045)):
            d = V(math.cos(ang), math.sin(ang) * (1 if s2 > 0 else 1), 0)
            E = A + d * L + V(0, 0, -0.011)
            paint(loft([A, A + d * (L * 0.5) + V(0, 0, -0.006), E], [0.014, 0.012, 0.009], sides=6, wob=0), shade(F, dk(F, 0.85)))
            paint(loft(crs([E, E + d * 0.014 + V(0, 0, 0.0), E + d * 0.022 + V(0, 0, -0.012)], 4), [0.008, 0.006, 0.004, 0.0008], sides=5, wob=0), solid(CLAW))
    base()

def mt_eagle_golden():
    _eagle('golden'); finish('mt_eagle_golden', OUT, center=False)
def mt_eagle_white():
    _eagle('white'); finish('mt_eagle_white', OUT, center=False)
def mt_eagle_dark():
    _eagle('dark'); finish('mt_eagle_dark', OUT, center=False)

# ══ 장식 (독수리 전용) ══
BLUE, BLUE_D = lin(0x2f4f9a), lin(0x203870)
RED, RED_D = lin(0xc0303a), lin(0x8a1e28)

def _saddle():   # 깃털 안장 — 푸른 담요에 금테, 폭신한 자리, 앞 금 손잡이, 몸을 두른 띠, 옆에 깃털 술
    xs = [-0.15 + 0.2 * t / 6 for t in range(7)]
    A = [(k / 10 * 2 - 1) * 1.3 for k in range(11)]
    for i in range(6):   # 담요
        paint(hull([body_pt(x, a, 1.05) for x in (xs[i], xs[i + 1]) for a in A]), shade(BLUE, BLUE_D, k=0.04))
    for s2 in (-1, 1):   # 담요 아래 금 단
        paint(hull([body_pt(x, s2 * (1.3 - da), 1.065) for x in xs for da in (0.0, 0.1)]), shade(GOLD, GOLD_D), METAL)
    for x in (xs[0] - 0.006, xs[-1] + 0.006):
        paint(hull([body_pt(x + dx, a, 1.065) for dx in (-0.005, 0.005) for a in A]), shade(GOLD, GOLD_D), METAL)
    # 자리(쿠션)
    seat = []
    for x in (-0.11, -0.07, -0.01, 0.03):
        for a in (-0.85, -0.42, 0.0, 0.42, 0.85):
            p = body_pt(x, a, 1.06); seat.append(p); seat.append(p + V(0, 0, 0.022 if abs(a) < 0.5 else 0.01))
    paint(hull(seat), shade(lin(0xf3ead6), lin(0xd8cbb0)))
    for x in (-0.07, -0.01):   # 누빈 줄
        paint(loft([body_pt(x, a, 1.06) + V(0, 0, 0.023 if abs(a) < 0.5 else 0.011) for a in (-0.8, -0.4, 0.0, 0.4, 0.8)], 0.003, sides=3, wob=0), solid(lin(0xc8b48a)))
    top = body_pt(0.045, 0, 1.06)   # 앞 손잡이
    paint(hull([body_pt(0.045 + dx, a, 1.06) for dx in (-0.01, 0.01) for a in (-0.6, 0, 0.6)] + [top + V(dx, y, 0.03) for dx in (-0.008, 0.008) for y in (-0.028, 0.028)]), shade(GOLD, GOLD_D), METAL)
    paint(loft([top + V(0, -0.012, 0.03), top + V(0.006, 0, 0.055), top + V(0, 0.012, 0.03)], 0.006, sides=5, wob=0), shade(GOLD, GOLD_D), METAL)
    paint(blob(top + V(0.006, 0, 0.055), (0.009, 0.009, 0.009), n=6, jitter=0), solid(lin(0xd8f4ff)), GLOW)
    back = body_pt(-0.12, 0, 1.06)   # 뒤 테
    paint(hull([body_pt(-0.12 + dx, a, 1.06) for dx in (-0.008, 0.008) for a in (-0.8, 0, 0.8)] + [back + V(dx, y, 0.03) for dx in (-0.007, 0.007) for y in (-0.05, 0.05)]), shade(GOLD, GOLD_D), METAL)
    # 몸을 두른 띠 (배 아래로)
    for x in (-0.045,):
        paint(loft([body_pt(x, a, 1.035) for a in [k / 16 * 2 * math.pi for k in range(16)]], 0.007, sides=4, ell=(1.6, 0.6), closed=True, wob=0), shade(lin(0x8a5a30), lin(0x6a4220)))
        for s2 in (-1, 1):
            b = body_pt(x, s2 * 1.6, 1.05)
            paint(loft([b + V(0.012 * math.cos(t), 0, 0.012 * math.sin(t)) for t in [k / 8 * 2 * math.pi for k in range(8)]], 0.003, sides=3, closed=True, wob=0), shade(GOLD, GOLD_D), METAL)   # 고리
            # 깃털 술 — 담요 옆에 흰·붉은 깃
            for j, col in enumerate((lin(0xffffff), RED, lin(0xffffff))):
                q = body_pt(-0.09 + j * 0.035, s2 * 1.3, 1.07)
                d = V(-0.25, s2 * 0.3, -1).normalized()
                feather(q, q + d * 0.06, 0.012, col, col, frac=1.1, lift=0.0, thick=0.3)

def _crown():   # 금관 깃 장식 — 머리 위 금테 관, 앞의 빛나는 보석, 뒤로 넘긴 금빛 깃 셋
    c = V(0.325, 0, 0.0)
    ring0 = [V(c.x + math.cos(t) * 0.044, math.sin(t) * 0.036, 0.548) for t in [k / 12 * 2 * math.pi for k in range(12)]]
    ring1 = [V(c.x + math.cos(t) * 0.05, math.sin(t) * 0.042, 0.57) for t in [k / 12 * 2 * math.pi for k in range(12)]]
    for k in range(12):   # 테 — 조각마다(속이 비게)
        k2 = (k + 1) % 12
        paint(hull([ring0[k], ring0[k2], ring1[k], ring1[k2], ring0[k] * 1.0 + V(0, 0, 0) - (ring0[k] - V(c.x, 0, 0.548)) * 0.15, ring1[k2] - (ring1[k2] - V(c.x, 0, 0.57)) * 0.15]), shade(GOLD, GOLD_D), METAL)
    for k in range(0, 12, 2):   # 뾰족한 끝
        p = ring1[k]; out = (p - V(c.x, 0, 0.57)).normalized()
        paint(cone(p - out * 0.004, p + out * 0.006 + V(0, 0, 0.022), 0.009, 4), shade(GOLD, GOLD_D), METAL)
        paint(blob(p + out * 0.006 + V(0, 0, 0.024), (0.004, 0.004, 0.004), n=5, jitter=0), solid(lin(0xfff4c0)), GLOW)
    paint(blob(V(c.x + 0.05, 0, 0.56), (0.006, 0.011, 0.011), n=8, jitter=0), solid(lin(0xd8f4ff)), GLOW)   # 앞 보석
    for j, yy in enumerate((-0.016, 0.0, 0.016)):   # 뒤로 넘긴 깃
        r0 = V(c.x - 0.03, yy, 0.565)
        pts = crs([r0, r0 + V(-0.03, yy * 0.8, 0.05), r0 + V(-0.09, yy * 1.6, 0.075 - 0.01 * abs(j - 1)), r0 + V(-0.14, yy * 2.2, 0.06 - 0.015 * abs(j - 1))], 7)
        fs = loft(pts, [0.008, 0.013, 0.016, 0.016, 0.014, 0.01, 0.002], sides=4, ell=(0.35, 1.0), wob=0)
        for f in fs:
            cc = f.calc_center_median()
            paint([f], solid(lin(0xfff2c0), 0.04) if (cc - r0).length > 0.13 else shade(GOLD, GOLD_D), GLOW if (cc - r0).length > 0.13 else METAL)

def _ribbon(T, s, col, cold, phase=0.0, L=0.34):
    pts = []
    for k in range(10):
        t = k / 9
        pts.append(T + V(-L * t, s * (0.02 * t + 0.015 * math.sin(t * 7 + phase)), 0.03 * math.sin(t * 6 + phase) - 0.01 * t))
    fs = loft(pts, [0.006, 0.014, 0.017, 0.018, 0.018, 0.017, 0.016, 0.015, 0.014, 0.012], sides=4, ell=(1.0, 0.12), wob=0)
    paint(fs, shade(col, cold, col, k=0.04))

def _ribbons():   # 날개 끝 리본 — 가장 바깥 첫날개깃 끝에 붉은 리본과 금빛 리본
    for s in (1, -1):
        part('ribbonL' if s > 0 else 'ribbonR', loc=tuple(SHOULDER[s]))
        pri = [f for f in wing_layout(s) if f[0] == 'pri']
        for (kind, root, tip, w), col, cold, ph in ((pri[-1], RED, RED_D, 0.0), (pri[-3], GOLD, GOLD_D, 1.7)):
            k0 = root.lerp(tip, 0.9)
            paint(blob(k0 + V(0, 0, 0.004), (0.012, 0.012, 0.008), n=8, jitter=0), shade(col, cold))   # 매듭
            _ribbon(k0 + V(-0.004, 0, 0.0), s, col, cold, ph, 0.34 if col == RED else 0.26)
        base()

def _sparkle():   # 빛나는 깃 — 첫·둘째 날개깃 끝을 빛으로 덮는다
    for s in (1, -1):
        part('glowL' if s > 0 else 'glowR', loc=tuple(SHOULDER[s]))
        for kind, root, tip, w in wing_layout(s):
            if kind not in ('pri', 'sec'): continue
            a = root.lerp(tip, 0.74 if kind == 'pri' else 0.8)
            pts = [a.lerp(tip, u) + V(0, 0, 0.007 + 0.003 * math.sin(u * math.pi)) for u in (0, 0.35, 0.7, 1.0)]
            pts[-1] = pts[-1] + (tip - root).normalized() * 0.006
            fs = loft(pts, [w * 0.7, w * 0.8, w * 0.6, w * 0.1], sides=4, ell=(1.0, 0.18), wob=0)
            paint(fs, solid(lin(0xfff0a8), 0.05), GLOW)
        base()

def gd_eagle_saddle():
    begin(611); _saddle(); finish('gd_eagle_saddle', OUT, center=False)
def gd_eagle_crown():
    begin(612); _crown(); finish('gd_eagle_crown', OUT, center=False)
def gd_eagle_ribbons():
    begin(613); _ribbons(); finish('gd_eagle_ribbons', OUT, center=False)
def gd_eagle_sparkle():
    begin(614); _sparkle(); finish('gd_eagle_sparkle', OUT, center=False)

def _views(name, views):
    return dict(views=views)
VIEWS = {'a': (1.0, -1.25, 0.75), 'b': (-0.6, 1.0, 0.9), 'c': (1.4, 0.3, 0.3), 'd': (0.05, 0.0, 1.0)}

def pv_eagle():   # 확인용: 금빛 독수리 + 장식 넷
    _eagle('golden'); base(); _saddle(); _crown(); _ribbons(); _sparkle()
    finish('pv_eagle', OUT, center=True, views=VIEWS, lens=80)
def pv_eagle_white():
    _eagle('white'); finish('pv_eagle_white', OUT, center=True, views={'a': VIEWS['a'], 'c': VIEWS['c']}, lens=80)
def pv_eagle_dark():
    _eagle('dark'); finish('pv_eagle_dark', OUT, center=True, views={'a': VIEWS['a'], 'c': VIEWS['c']}, lens=80)

ALL = [mt_eagle_golden, mt_eagle_white, mt_eagle_dark, gd_eagle_saddle, gd_eagle_crown, gd_eagle_ribbons, gd_eagle_sparkle, pv_eagle, pv_eagle_white, pv_eagle_dark]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
