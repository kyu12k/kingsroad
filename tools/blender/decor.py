# 꾸밈 아이템 — 계시록과 상관없는 평범한 것들 (2026-10-01). 성 둘레를 💎로 꾸민다(game.js NJ_DECOR)
# 실행: blender -b -P decor.py -- <출력 폴더> [이름 …]   → models/decor/*.glb (게임은 nj3d.js loadDecor, 캐시 번호 DECO_V)
# 크기는 성 안 생명나무(높이 약 1.4)·예물(0.4~0.8)과 어울리게 — 사람(0.22)에 맞추면 내려다볼 때 안 보인다
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

WOOD, WOOD_D, WOOD_L = lin(0x9a6a3c), lin(0x6b4423), lin(0xc49260)
STONE, STONE_D = lin(0xc9c1b2), lin(0x9d9586)
LEAF, LEAF_D = lin(0x3f9a4f), lin(0x2c7a3c)
TERRA = lin(0xc8714a)
IRON = lin(0x3c3f46)
WATER = lin(0x6fd3ec)

def box(c, s, fn, mat=BASE):
    c = Vector(c); return paint(hull([c + Vector((x * s[0], y * s[1], z * s[2])) for x in (-.5, .5) for y in (-.5, .5) for z in (-.5, .5)]), fn, mat)

def ring_pts(r, z, n, ph=0.0):
    return [Vector((math.cos(k / n * 2 * math.pi + ph) * r, math.sin(k / n * 2 * math.pi + ph) * r, z)) for k in range(n)]

def flowers(center, rad, n, z, cols):
    for k in range(n):
        a = random.random() * 2 * math.pi; r = rad * math.sqrt(random.random())
        c = Vector(center) + Vector((math.cos(a) * r, math.sin(a) * r, z + random.random() * 0.03))
        paint(blob(c, (0.035, 0.035, 0.025), n=8, jitter=0.2), solid(random.choice(cols), 0.08))

FLOWER_COLS = [lin(0xf06292), lin(0xffd54f), lin(0xffffff), lin(0xba68c8), lin(0xff8a65)]

# ── 10/2 손질 도구: 큰 돌·꽃잎 꽃·잎·새 ──
Z = Vector((0, 0, 1))
PETALS = [lin(0xf06292), lin(0xffd54f), lin(0xfafafa), lin(0xba68c8), lin(0xff8a65), lin(0x6fa8f0)]
STONES = [lin(0xc9bba3), lin(0xb8ab95), lin(0xd6cbb6), lin(0xa89f8f), lin(0xc4b394)]   # 따뜻한 회색·베이지

def arc_stone(r0, r1, a0, a1, z0, z1, ex=1.0, ey=1.0, b=0.012, j=0.005, bulge=0.01):
    """둥근 담의 큰 돌 하나 — 호(a0~a1) 모양 덩이, 모서리를 깎고 바깥을 살짝 부풀린다"""
    def at(a, r, z): return Vector((math.cos(a) * r * ex + (random.random() - .5) * j, math.sin(a) * r * ey + (random.random() - .5) * j, z + (random.random() - .5) * j))
    # 면 수를 아끼려고(압축해도 삼각형당 약 63바이트) 바깥 모서리만 깎는다
    da = b / r1; P = []
    for a, sa in ((a0, 1), (a1, -1)):
        for z, sz in ((z0, 1), (z1, -1)):
            P.append(at(a + sa * da * 0.5, r0, z))
            P += [at(a + sa * da, r1 - b * 0.6, z), at(a, r1 - b * 0.6, z + sz * b)]
    P.append(at((a0 + a1) / 2, r1 + bulge, (z0 + z1) / 2))
    return hull(P)

def leaf(p, d, L, w, droop=0.3, col=None):
    """납작한 잎 — p에서 방향 d(수평)로 길이 L, 끝이 droop만큼 처진다"""
    p = Vector(p); d = Vector((d[0], d[1], 0)).normalized(); s = Vector((-d.y, d.x, 0)); t = 0.004
    mid = p + d * L * 0.45 + Z * L * 0.12; tip = p + d * L - Z * L * droop
    pts = [p + Z * t, mid + s * w + Z * t, mid - s * w + Z * t, tip + Z * t, mid - Z * t * 2]
    return paint(hull(pts), shade(col or LEAF, LEAF_D, k=0.1))

def petal_flower(c, r, col, n=5, tilt=0.35, center=None):
    """꽃잎 다섯 장 + 노란 꽃술"""
    c = Vector(c); ph = random.random() * 6.28; th = max(0.003, r * 0.1)
    for k in range(n):
        a = ph + k / n * 2 * math.pi; d = Vector((math.cos(a), math.sin(a), 0)); s = Vector((-d.y, d.x, 0))
        mid = c + d * r * 0.55 + Z * r * tilt * 0.4; tip = c + d * r + Z * r * tilt
        pts = [c + d * r * 0.12 + Z * th, mid + s * r * 0.42 + Z * th, mid - s * r * 0.42 + Z * th, tip + Z * th, mid - Z * th * 1.5]
        paint(hull(pts), shade(col, tuple(v * 0.82 for v in col), k=0.06))
    cc = center or (lin(0xc77a2a) if col == PETALS[1] else lin(0xffc93c))
    paint(blob(c + Z * r * 0.12, (r * 0.3, r * 0.3, r * 0.2), n=6, jitter=0.1), solid(cc, 0.05))

def stem_flower(ground, top, r, col, leaves=2):
    ground, top = Vector(ground), Vector(top)
    paint(cyl(ground, top, 0.0055, 0.0045, sides=3), solid(LEAF_D))
    for k in range(leaves):
        a = random.random() * 6.28; h = ground + (top - ground) * (0.3 + 0.35 * k / max(1, leaves))
        leaf(h, (math.cos(a), math.sin(a)), r * 1.3, r * 0.35, droop=0.15)
    petal_flower(top, r, col)

def oblob(c, f, radii, n=12, jitter=0.06):
    """방향 f를 따라 놓인 타원 덩이"""
    f = Vector(f).normalized(); s = Z.cross(f).normalized(); u = f.cross(s); c = Vector(c); pts = []
    for k in range(n):
        z = 1 - 2 * (k + 0.5) / n; r = math.sqrt(max(0, 1 - z * z)); a = k * 2.39996; m = 1 + (random.random() - 0.5) * jitter
        pts.append(c + (f * math.cos(a) * r * radii[0] + s * math.sin(a) * r * radii[1] + u * z * radii[2]) * m)
    return hull(pts)

def songbird(feet, f, col, belly, sc=1.0):
    """작은 새 — feet = 발 자리, f = 보는 쪽(수평)"""
    feet = Vector(feet); f = Vector((f[0], f[1], 0)).normalized(); s = Z.cross(f)
    q = lambda x, y, z: feet + (f * x + s * y + Z * z) * sc
    dark = tuple(v * 0.7 for v in col)
    for y in (-0.008, 0.008): paint(cyl(q(0.004, y, 0), q(0.0, y, 0.016), 0.0035 * sc, sides=3), solid(lin(0xe8913a)))
    paint(oblob(q(0, 0, 0.034), f, (0.042 * sc, 0.03 * sc, 0.028 * sc), n=14), solid(col, 0.05))
    paint(oblob(q(0.012, 0, 0.026), f, (0.03 * sc, 0.024 * sc, 0.02 * sc), n=10), solid(belly, 0.05))
    for y in (-1, 1): paint(oblob(q(-0.006, y * 0.026, 0.04), f, (0.032 * sc, 0.008 * sc, 0.016 * sc), n=10), solid(dark, 0.05))
    tail = [q(-0.034, 0, 0.042), q(-0.08, -0.016, 0.06), q(-0.08, 0.016, 0.06)]
    paint(hull([p + Z * 0.004 * sc for p in tail] + [p - Z * 0.004 * sc for p in tail]), solid(dark, 0.05))
    h = q(0.03, 0, 0.068)
    paint(blob(h, (0.025 * sc, 0.025 * sc, 0.024 * sc), n=12, jitter=0.04), solid(col, 0.05))
    paint(cone(h + f * 0.018 * sc, h + f * 0.042 * sc - Z * 0.004 * sc, 0.008 * sc, 4), solid(lin(0xf2a33a)))
    for y in (-1, 1): paint(blob(h + (f * 0.012 + s * y * 0.019 + Z * 0.006) * sc, (0.006 * sc,) * 3, n=6, jitter=0), solid(lin(0x1a1410), 0.02))

def tuft(c, h=0.06, n=6, col=None):
    """풀 한 포기 — 가는 잎 여러 장"""
    c = Vector(c)
    for k in range(n):
        a = k / n * 6.28 + random.random() * 0.5; d = Vector((math.cos(a), math.sin(a), 0)); hh = h * (0.7 + random.random() * 0.5)
        paint(cone(c + d * 0.006, c + d * hh * 0.35 + Z * hh, 0.007, 3), solid(col or random.choice([LEAF, LEAF_D, lin(0x5aae4f)]), 0.08))

# ── 나무 벤치 ──
def bench():
    begin(1)
    for x in (-0.26, 0.26):   # 돌 다리
        box((x, 0, 0.09), (0.07, 0.24, 0.18), shade(STONE, STONE_D))
    for k in range(3):        # 앉는 판자 셋
        box((0, -0.08 + k * 0.08, 0.2), (0.68, 0.07, 0.035), shade(WOOD_L, WOOD, k=0.1))
    for x in (-0.26, 0.26): box((x, 0.12, 0.33), (0.05, 0.04, 0.26), solid(WOOD_D))
    for z in (0.32, 0.42): box((0, 0.13, z), (0.66, 0.03, 0.06), shade(WOOD_L, WOOD))
    finish('bench', OUT)

# ── 꽃 화분 ──
def pot():
    begin(2)
    # 10/2: 꽃이 네모 덩이였다 → 테 두른 토분에 꽃잎 꽃(줄기·잎)과 잎 무더기
    TD = lin(0xa95a37)
    paint(loft([(0, 0, 0), (0, 0, 0.02), (0, 0, 0.17), (0, 0, 0.18)], [0.11, 0.115, 0.15, 0.152], sides=14, wob=0.02), shade(TERRA, TD))
    paint(loft([(0, 0, 0.175), (0, 0, 0.185), (0, 0, 0.235), (0, 0, 0.245)], [0.158, 0.172, 0.176, 0.168], sides=14, wob=0.01), shade(lin(0xd98457), TD))   # 테
    paint(cyl((0, 0, 0.07), (0, 0, 0.08), 0.131, sides=14), solid(lin(0xe39a6e), 0.04))   # 가는 띠
    paint(cyl((0, 0, 0.225), (0, 0, 0.24), 0.155, sides=14), solid(lin(0x4a3220)))   # 흙
    paint(blob((0, 0, 0.255), (0.135, 0.135, 0.06), n=20, jitter=0.25), shade(LEAF, LEAF_D))
    for k in range(11):   # 테 너머로 늘어진 잎
        a = k / 11 * 6.28 + random.random() * 0.3
        leaf((math.cos(a) * 0.07, math.sin(a) * 0.07, 0.27), (math.cos(a), math.sin(a)), 0.12, 0.035, droop=0.45, col=random.choice([LEAF, lin(0x56b25c)]))
    cols = [PETALS[0], PETALS[1], PETALS[2], PETALS[3]]
    spots = [(0, 0, 0.42), (0.09, 0.03, 0.38), (-0.07, 0.075, 0.39), (-0.065, -0.085, 0.37), (0.06, -0.095, 0.365), (-0.12, -0.01, 0.35), (0.035, 0.115, 0.36),
             (0.12, -0.04, 0.33), (-0.1, 0.1, 0.33)]
    for i, (x, y, z) in enumerate(spots):
        stem_flower((x * 0.5, y * 0.5, 0.26), (x, y, z), 0.07 if i == 0 else 0.06, cols[i % 4], leaves=1 if i < 5 else 0)
    finish('pot', OUT)

# ── 돌 울타리 ──
def fence():
    begin(3)
    # 10/2: 기둥·가로대뿐이었다 → 결 빛깔이 다른 나무 판자 세 줄, 뾰족한 기둥 머리, 못, 밑동 풀과 들꽃
    WOODS = [lin(0x9a6a3c), lin(0x8a5e36), lin(0xa87a4a), lin(0x7d5532), lin(0xb08454)]
    POST, POST_D = lin(0x7a5a3e), lin(0x5e4430)
    for x in (-0.44, 0.0, 0.44):
        x += (random.random() - 0.5) * 0.01; h = 0.31 + random.random() * 0.02
        paint(hull([Vector((x + dx, dy, z)) for dx in (-0.032, 0.032) for dy in (-0.03, 0.03) for z in (0, h)] + [Vector((x, 0, h + 0.06))]), shade(lin(0x9a7a58), POST, k=0.16))
        paint(hull([Vector((x + dx, dy, z)) for dx in (-0.036, 0.036) for dy in (-0.034, 0.034) for z in (0.0, 0.025)]), solid(POST_D, 0.1))   # 밑동 테
    for z in (0.08, 0.17, 0.26):
        for x0 in (-0.44, 0.0):
            x1 = x0 + 0.44; tz = (random.random() - 0.5) * 0.012
            col = random.choice(WOODS)
            for seg in range(3):   # 한 판자를 세 토막 빛깔로 — 나뭇결
                u0, u1 = seg / 3, (seg + 1) / 3
                xa, xb = x0 - 0.02 + (x1 - x0 + 0.04) * u0, x0 - 0.02 + (x1 - x0 + 0.04) * u1
                paint(hull([Vector((x, y, z + tz * (x - x0) / 0.44 + dz)) for x in (xa, xb) for y in (-0.052, -0.032) for dz in (-0.026, 0.026)]), shade(col, tuple(v * 0.85 for v in col), k=0.2))
            if random.random() < 0.6:   # 옹이
                kx = x0 + 0.08 + random.random() * 0.28
                paint(oblob((kx, -0.053, z + tz * (kx - x0) / 0.44), (1, 0, 0), (0.011, 0.004, 0.007), n=8, jitter=0.1), solid(lin(0x4a3220), 0.05))
            for xn in (x0, x1):   # 못
                paint(blob((xn, -0.054, z + tz * (xn - x0) / 0.44), (0.005, 0.003, 0.005), n=6, jitter=0), solid(lin(0x55585e)), METAL)
    for x in (-0.44, -0.3, -0.12, 0.0, 0.18, 0.32, 0.44):   # 밑동 풀 — 판자 앞에(뒤에 두면 판자에 가려 안 보였다)
        tuft((x + (random.random() - 0.5) * 0.04, -0.06, 0.0), h=0.08 + random.random() * 0.04)
    for x, c in ((-0.25, PETALS[2]), (-0.19, PETALS[1]), (0.22, PETALS[0]), (0.28, PETALS[2])):   # 들꽃
        stem_flower((x, -0.06, 0), (x + 0.01, -0.07, 0.1 + random.random() * 0.03), 0.042, c, leaves=1)
    finish('fence', OUT)

# ── 이정표 ──
def sign():
    begin(4)
    paint(cyl((0, 0, 0), (0, 0, 0.62), 0.03, sides=6), solid(WOOD_D))
    for z, a, L in ((0.52, 0.3, 0.32), (0.4, -0.5, 0.28)):
        d = Vector((math.cos(a), math.sin(a), 0))
        c = d * (L / 2 + 0.02) + Vector((0, 0, z)); w = Vector((-d.y, d.x, 0)) * 0.012
        tip = c + d * L / 2
        paint(hull([c - d * L / 2 + w + Vector((0, 0, s)) for s in (-0.04, 0.04)] + [c - d * L / 2 - w + Vector((0, 0, s)) for s in (-0.04, 0.04)] +
                   [tip - d * 0.06 + w + Vector((0, 0, s)) for s in (-0.04, 0.04)] + [tip - d * 0.06 - w + Vector((0, 0, s)) for s in (-0.04, 0.04)] + [tip + w, tip - w]), shade(WOOD_L, WOOD))
    finish('sign', OUT)

# ── 가로등 ──
def lamp():
    begin(5)
    # 10/2: 가는 검은 막대에 불빛이 안 보였다 → 장식 받침·홈 판 기둥·유리 등갓(빛나는 판)·꼭지
    IR, IR_L = lin(0x2e3138), lin(0x4a4f5a)
    ir = shade(IR_L, IR, k=0.08)
    paint(loft([(0, 0, 0), (0, 0, 0.035), (0, 0, 0.045), (0, 0, 0.08), (0, 0, 0.1), (0, 0, 0.16), (0, 0, 0.18), (0, 0, 0.2)],
               [0.085, 0.085, 0.07, 0.07, 0.052, 0.04, 0.046, 0.03], sides=8, wob=0), ir, METAL)
    for k in range(4):   # 받침의 다리 장식
        a = k / 4 * 6.28 + 0.39; d = Vector((math.cos(a), math.sin(a), 0))
        paint(loft(crs([d * 0.072 + Z * 0.04, d * 0.07 + Z * 0.09, d * 0.045 + Z * 0.13, d * 0.03 + Z * 0.16], 6), [0.011, 0.01, 0.008, 0.006, 0.005, 0.004], sides=4, wob=0), ir, METAL)
    paint(cyl((0, 0, 0.2), (0, 0, 0.8), 0.02, 0.017, sides=8), ir, METAL)
    for k in range(8):   # 홈 판 기둥의 골
        a = k / 8 * 6.28; d = Vector((math.cos(a), math.sin(a), 0))
        paint(cyl(d * 0.019 + Z * 0.22, d * 0.016 + Z * 0.62, 0.0045, sides=3), solid(IR_L, 0.06), METAL)
    for z, r in ((0.22, 0.03), (0.62, 0.026), (0.79, 0.028)):   # 마디 고리
        paint(loft([(0, 0, z - 0.012), (0, 0, z), (0, 0, z + 0.012)], [r * 0.8, r, r * 0.8], sides=8, wob=0), solid(lin(0xb08a3e), 0.05), METAL)
    for k in range(4):   # 등을 받치는 고사리 손 장식
        a = k / 4 * 6.28 + 0.39; d = Vector((math.cos(a), math.sin(a), 0))
        paint(loft(crs([Z * 0.7, d * 0.03 + Z * 0.74, d * 0.06 + Z * 0.8, d * 0.045 + Z * 0.83, d * 0.032 + Z * 0.81], 8), 0.0055, sides=4, wob=0), ir, METAL)
    paint(loft([(0, 0, 0.8), (0, 0, 0.82), (0, 0, 0.835)], [0.03, 0.075, 0.075], sides=6, wob=0, twist=0.0), ir, METAL)   # 등 받침판
    G0, G1 = 0.835, 0.975
    paint(loft([(0, 0, G0), (0, 0, G1)], [0.058, 0.07], sides=6, wob=0), solid(lin(0xffa53a), 0.04), GLOW)   # 빛나는 유리
    for k in range(6):   # 유리 틀
        a = k / 6 * 6.28 + math.pi / 2; d = Vector((math.cos(a), math.sin(a), 0))
        paint(cyl(d * 0.062 + Z * G0, d * 0.074 + Z * G1, 0.0055, sides=4), ir, METAL)
    paint(loft([(0, 0, G1 - 0.005), (0, 0, G1 + 0.01)], [0.078, 0.082], sides=6, wob=0), ir, METAL)
    paint(loft([(0, 0, G1 + 0.01), (0, 0, G1 + 0.04), (0, 0, G1 + 0.065), (0, 0, G1 + 0.075)], [0.09, 0.055, 0.02, 0.012], sides=6, wob=0), ir, METAL)   # 갓
    paint(blob((0, 0, G1 + 0.085), (0.014, 0.014, 0.014), n=8, jitter=0), solid(lin(0xc89a48), 0.04), METAL)   # 꼭지 구슬
    paint(cone((0, 0, G1 + 0.095), (0, 0, G1 + 0.125), 0.007, 4), solid(lin(0xc89a48), 0.04), METAL)
    finish('lamp', OUT, emit=(1.0, 0.85, 0.5))

# ── 꽃밭 ──
def flowerbed():
    begin(6)
    # 10/2: 꽃이 네모 덩이였다 → 큰 돌 테두리 안 흙에 줄지어 심은 꽃잎 꽃(뒤로 갈수록 키 큼)과 잎
    EX, EY = 1.42, 0.92
    pts = ring_pts(0.37, 0, 16)
    paint(hull([Vector((p.x * EX, p.y * EY, 0)) for p in pts] + [Vector((p.x * EX * 0.9, p.y * EY * 0.9, 0.065)) for p in pts]), shade(lin(0x5e4128), lin(0x4a3220)))   # 흙
    n = 18
    for k in range(n):   # 둘레 돌
        a0 = k / n * 6.28 + 0.03; a1 = (k + 1) / n * 6.28 - 0.03
        paint(arc_stone(0.36, 0.42, a0, a1, 0.0, 0.07 + random.random() * 0.012, ex=EX, ey=EY, b=0.014), shade(*(lambda c: (c, tuple(v * 0.85 for v in c)))(random.choice(STONES)), k=0.06))
    rows = ((0.14, 0.11, 0.06, (PETALS[3], PETALS[5])), (0.0, 0.085, 0.058, (PETALS[0], PETALS[2])), (-0.14, 0.06, 0.055, (PETALS[1], PETALS[4])))
    for y, h, r, cs in rows:
        half = 0.37 * EX * math.sqrt(max(0, 1 - (y / (0.37 * EY)) ** 2)) - 0.08
        m = max(2, int(half * 2 / 0.12))
        for i in range(m):
            x = -half + (i + 0.5) * (2 * half / m) + (random.random() - 0.5) * 0.02
            yy = y + (random.random() - 0.5) * 0.04
            paint(blob((x, yy, 0.075), (0.055, 0.045, 0.03), n=8, jitter=0.3), shade(random.choice([LEAF, lin(0x56b25c)]), LEAF_D))   # 포기 밑 잎 무더기
            stem_flower((x, yy, 0.08), (x + (random.random() - 0.5) * 0.02, yy, 0.065 + h * (0.85 + random.random() * 0.3)), r, cs[(i // 2) % 2], leaves=1)
    finish('flowerbed', OUT)

# ── 새집 ──
def birdhouse():
    begin(7)
    # 10/2: 막대 위 작은 상자였다 → 박공 새집(둥근 구멍·횃대·지붕 널), 받침 기둥과 버팀대, 밑동 풀꽃, 횃대 위 새(축 bird = 새 발)
    WALL, WALL_D = lin(0xf2dc9a), lin(0xd9bf78)
    paint(hull([Vector((dx, dy, z)) for dx in (-0.024, 0.024) for dy in (-0.024, 0.024) for z in (0, 0.66)]), shade(WOOD_L, WOOD, k=0.14))
    for s in (-1, 1):   # 버팀대
        paint(cyl((s * 0.022, 0, 0.55), (s * 0.075, 0, 0.655), 0.011, sides=4), shade(WOOD_L, WOOD))
    paint(hull([Vector((x, y, z)) for x in (-0.11, 0.11) for y in (-0.1, 0.1) for z in (0.655, 0.675)]), shade(WOOD_L, WOOD_D))   # 받침판
    paint(hull([Vector((x, y, z)) for x in (-0.09, 0.09) for y in (-0.08, 0.08) for z in (0.675, 0.86)] + [Vector((0, y, 0.95)) for y in (-0.08, 0.08)]), shade(WALL, WALL_D, k=0.06))   # 몸
    for s in (-1, 1):   # 모서리 흰 테
        paint(cyl((s * 0.09, -0.081, 0.675), (s * 0.09, -0.081, 0.86), 0.007, sides=4), solid(lin(0xfaf6ec)))
        paint(cyl((s * 0.09, -0.083, 0.86), (0, -0.083, 0.95), 0.007, sides=4), solid(lin(0xfaf6ec)))
    ROOF, ROOF_D = lin(0xc0503a), lin(0x93392a)
    for s in (-1, 1):   # 지붕 두 쪽 — 널 세 줄
        for k in range(3):
            u0, u1 = k / 3, (k + 1) / 3 + 0.04
            p = lambda u, y, t: Vector((s * (0.0 + 0.135 * u), y, 0.975 - 0.13 * u + t))
            paint(hull([p(u, y, t) for u in (u0, min(1, u1)) for y in (-0.115, 0.115) for t in (-0.012, 0.012)]), shade(ROOF if k % 2 == 0 else lin(0xcf5e45), ROOF_D, k=0.08))
    paint(cyl((0, -0.12, 0.985), (0, 0.12, 0.985), 0.011, sides=5), solid(lin(0x7a2e22)))   # 용마루
    paint(cyl((0, -0.081, 0.79), (0, -0.087, 0.79), 0.038, sides=12), solid(lin(0xfaf6ec)))   # 구멍 테
    paint(cyl((0, -0.086, 0.79), (0, -0.09, 0.79), 0.029, sides=12), solid(lin(0x22160e), 0.02))   # 둥근 구멍
    paint(cyl((0, -0.08, 0.73), (0, -0.165, 0.73), 0.0075, sides=6), solid(WOOD_D))   # 횃대
    paint(hull([Vector((x, y, z)) for x in (-0.03, 0.03) for y in (-0.084, -0.08) for z in (0.885, 0.915)]), solid(lin(0x8fc4d8)))   # 작은 창 대신 하늘색 판
    for (x, y) in ((-0.05, -0.03), (0.04, -0.05), (0.06, 0.04), (-0.04, 0.05)):   # 밑동 풀꽃
        tuft((x, y, 0), h=0.06)
    for x, y, c in ((-0.07, -0.06, PETALS[0]), (0.07, -0.02, PETALS[2]), (-0.02, 0.07, PETALS[1])):
        stem_flower((x, y, 0), (x, y, 0.08 + random.random() * 0.03), 0.026, c, leaves=1)
    feet = Vector((0.0, -0.145, 0.7375))
    part('bird', loc=feet)   # 게임에서 깡충·날갯짓 — 축은 횃대 위 새의 발
    songbird(feet, (-1.0, -0.35), lin(0x4f86d9), lin(0xf3e6c8), sc=1.15)
    songbird((0.02, 0.06, 0.995), (1.0, 0.25), lin(0xe0624a), lin(0xf6d9b0), sc=0.7)   # 지붕 위 작은 새
    base()
    finish('birdhouse', OUT)

# ── 무화과나무 — 넓은 잎, 낮고 퍼진 수관 ──
def figtree():
    begin(8)
    paint(loft([(0, 0, 0), (0.02, 0, 0.3), (0.05, 0.02, 0.55)], [0.07, 0.055, 0.045], sides=6), solid(lin(0x8d7b68)))
    for (dx, dy, dz, r) in ((0, 0, 0.75, 0.42), (0.3, 0.1, 0.65, 0.28), (-0.28, -0.08, 0.68, 0.3), (0.05, 0.3, 0.7, 0.26), (0.0, -0.28, 0.66, 0.26)):
        paint(blob((dx, dy, dz), (r, r, r * 0.7), n=22, jitter=0.2), shade(lin(0x4f9a3a), lin(0x3b7d2c)))
    for k in range(14):   # 무화과 열매
        a = random.random() * 2 * math.pi; z = 0.55 + random.random() * 0.3
        paint(blob((math.cos(a) * 0.48, math.sin(a) * 0.48, z), (0.035, 0.035, 0.045), n=8, jitter=0.05), solid(lin(0x6b3a6e), 0.1))
    finish('figtree', OUT)

# ── 종려나무 ──
def palmtree():
    begin(9)
    trunk = [Vector((0.06 * math.sin(t * 2.2), 0, t * 1.25)) for t in [k / 7 for k in range(8)]]
    paint(loft(trunk, [0.07 - k * 0.004 for k in range(8)], sides=6, wob=0.12), solid(lin(0xa98257), 0.15))
    top = trunk[-1]
    for k in range(8):
        a = k / 8 * 2 * math.pi + random.random() * 0.2
        d = Vector((math.cos(a), math.sin(a), 0))
        path = [top, top + d * 0.25 + Vector((0, 0, 0.1)), top + d * 0.5 + Vector((0, 0, 0.0)), top + d * 0.7 + Vector((0, 0, -0.18))]
        paint(loft(crs(path, 6), [0.02, 0.07, 0.08, 0.06, 0.03, 0.005], sides=4, ell=(1.0, 0.18), wob=0.05, up=Vector((0, 0, 1))), shade(LEAF, LEAF_D))
    for k in range(4): paint(blob(top + Vector((math.cos(k * 1.6) * 0.06, math.sin(k * 1.6) * 0.06, -0.06)), (0.035, 0.035, 0.045), n=8, jitter=0), solid(lin(0x7a4a24)))
    finish('palmtree', OUT)

# ── 우물 ──
def well():
    begin(10)
    # 10/2: 작은 돌덩이가 흰 자갈처럼 보였다 → 큰 돌 세 켜(엇갈려 쌓음)와 갓돌, 안에 물, 나무 틀·도르래·빨간 지붕·밧줄·두레박
    R0, R1 = 0.23, 0.33
    courses = ((0.0, 0.11, 10, 0.0), (0.11, 0.21, 10, 0.5), (0.21, 0.3, 11, 0.0))
    for z0, z1, n, off in courses:
        for k in range(n):
            a0 = (k + off) / n * 6.28 + 0.025; a1 = (k + 1 + off) / n * 6.28 - 0.025
            c = random.choice(STONES)
            paint(arc_stone(R0, R1, a0, a1, z0 + 0.004, z1 - 0.004 + random.random() * 0.006, b=0.018, j=0.008, bulge=0.012), shade(tuple(v * 1.05 for v in c), tuple(v * 0.88 for v in c), k=0.07))
    n = 12
    for k in range(n):   # 갓돌 — 조금 내밀어
        a0 = (k + 0.25) / n * 6.28 + 0.02; a1 = (k + 1.25) / n * 6.28 - 0.02
        c = random.choice(STONES)
        paint(arc_stone(R0 - 0.01, R1 + 0.015, a0, a1, 0.3, 0.345, b=0.014, j=0.006, bulge=0.006), shade(tuple(v * 1.08 for v in c), tuple(v * 0.9 for v in c), k=0.06))
    paint(cyl((0, 0, 0.05), (0, 0, 0.2), R0 + 0.005, sides=16), solid(lin(0x3b3630), 0.05))   # 안쪽 어둠
    paint(cyl((0, 0, 0.2), (0, 0, 0.215), R0 + 0.004, sides=16), shade(lin(0x3f97b8), lin(0x2f6f8f), k=0.04))   # 물
    paint(blob((0.07, 0.05, 0.215), (0.05, 0.02, 0.003), n=8, jitter=0), solid(lin(0x9fe3f2), 0.03))   # 물빛
    PX = 0.29
    for x in (-PX, PX):   # 나무 틀 기둥 — 갓돌 위에 서서
        paint(hull([Vector((x + dx, dy, z)) for dx in (-0.024, 0.024) for dy in (-0.024, 0.024) for z in (0.0, 0.8)]), shade(WOOD_L, WOOD_D, k=0.14))
    paint(cyl((-PX - 0.06, 0, 0.62), (PX + 0.02, 0, 0.62), 0.03, sides=8), shade(WOOD_L, WOOD))   # 감는 굴대
    paint(cyl((-0.1, 0, 0.62), (0.1, 0, 0.62), 0.042, sides=8), solid(lin(0xcdb486), 0.08))   # 감긴 밧줄
    paint(cyl((PX + 0.02, 0, 0.62), (PX + 0.05, 0, 0.62), 0.008, sides=4), solid(IRON), METAL)   # 손잡이
    paint(cyl((PX + 0.05, 0, 0.62), (PX + 0.05, 0, 0.53), 0.008, sides=4), solid(IRON), METAL)
    paint(cyl((PX + 0.05, 0, 0.53), (PX + 0.1, 0, 0.53), 0.012, sides=5), solid(WOOD_D))
    for s in (-1, 1):   # 지붕 — 두 쪽, 널 줄무늬
        for k in range(3):
            u0, u1 = k / 3, min(1, (k + 1) / 3 + 0.05)
            p = lambda u, x, t: Vector((x, s * 0.28 * u, 0.95 - 0.16 * u + t))
            paint(hull([p(u, x, t) for u in (u0, u1) for x in (-0.4, 0.4) for t in (-0.016, 0.016)]), shade(lin(0xb5462f) if k % 2 == 0 else lin(0xc8553a), lin(0x8f3524), k=0.08))
    paint(cyl((-0.42, 0, 0.965), (0.42, 0, 0.965), 0.016, sides=5), solid(lin(0x6e2a1f)))   # 용마루
    for x in (-PX, PX): paint(hull([Vector((x + dx, dy, z)) for dx in (-0.02, 0.02) for dy in (-0.02, 0.02) for z in (0.78, 0.95)]), solid(WOOD_D))
    paint(cyl((0, -0.03, 0.62), (0, -0.03, 0.42), 0.006, sides=4), solid(lin(0xd9c49a)))   # 내려온 밧줄
    paint(loft([(0, -0.03, 0.33), (0, -0.03, 0.35), (0, -0.03, 0.4)], [0.045, 0.05, 0.058], sides=10, wob=0), shade(WOOD_L, WOOD))   # 두레박
    for z in (0.345, 0.385): paint(cyl((0, -0.03, z - 0.005), (0, -0.03, z + 0.005), 0.0565 if z > 0.36 else 0.0505, sides=10), solid(IRON), METAL)
    paint(cyl((0, -0.03, 0.4), (0, -0.03, 0.402), 0.05, sides=10), solid(lin(0x3f97b8)))
    paint(loft(crs([(-0.056, -0.03, 0.4), (-0.03, -0.03, 0.43), (0, -0.03, 0.44), (0.03, -0.03, 0.43), (0.056, -0.03, 0.4)], 7), 0.004, sides=3, wob=0), solid(IRON), METAL)
    for a in (0.6, 2.2, 3.9, 5.2):   # 밑동 풀
        tuft((math.cos(a) * 0.35, math.sin(a) * 0.35, 0), h=0.07)
    finish('well', OUT)

# ── 포도 시렁 ──
def arbor():
    begin(11)
    for x in (-0.4, 0.4):
        for y in (-0.3, 0.3): paint(cyl((x, y, 0), (x, y, 0.8), 0.03, sides=6), solid(WOOD_D))
    for y in (-0.3, 0.3): box((0, y, 0.82), (0.95, 0.04, 0.04), solid(WOOD))
    for k in range(6): box((-0.4 + k * 0.16, 0, 0.86), (0.03, 0.75, 0.03), solid(WOOD_L))
    for k in range(16):   # 덮은 잎
        paint(blob((-0.42 + random.random() * 0.84, -0.32 + random.random() * 0.64, 0.9), (0.12, 0.12, 0.05), n=10, jitter=0.3), shade(LEAF, LEAF_D))
    for k in range(7):   # 늘어진 송이
        c = Vector((-0.35 + random.random() * 0.7, -0.25 + random.random() * 0.5, 0.74))
        for j in range(6):
            paint(blob(c + Vector(((random.random() - 0.5) * 0.06, (random.random() - 0.5) * 0.06, -j * 0.022)), (0.024, 0.024, 0.024), n=6, jitter=0), solid(lin(0x5e3aa6), 0.1))
    for x in (-0.4, 0.4):   # 기둥 감은 덩굴
        paint(loft([Vector((x + math.cos(t * 6) * 0.04, -0.3 + math.sin(t * 6) * 0.04, t * 0.8)) for t in [k / 10 for k in range(11)]], 0.012, sides=4, wob=0), solid(LEAF_D))
    finish('arbor', OUT)

# ── 나무다리 — 물길(폭 약 1.9)을 건너는 무지개다리 ──
def bridge():
    begin(12)
    L, H = 1.25, 0.22
    arc = lambda u: H * math.sin(u * math.pi)
    n = 14
    for k in range(n):   # 디딤판
        u0, u1 = k / n, (k + 1) / n; x0, x1 = -L + 2 * L * u0, -L + 2 * L * u1
        z0, z1 = arc(u0), arc(u1)
        paint(hull([Vector((x0 + 0.01, y, z0)) for y in (-0.22, 0.22)] + [Vector((x1 - 0.01, y, z1)) for y in (-0.22, 0.22)] +
                   [Vector((x0 + 0.01, y, z0 - 0.04)) for y in (-0.22, 0.22)] + [Vector((x1 - 0.01, y, z1 - 0.04)) for y in (-0.22, 0.22)]), shade(WOOD_L, WOOD, k=0.14))
    for y in (-0.24, 0.24):   # 난간
        rail = [Vector((-L + 2 * L * u, y, arc(u) + 0.2)) for u in [k / 10 for k in range(11)]]
        paint(loft(rail, 0.018, sides=4, wob=0), solid(WOOD_D))
        for u in (0.05, 0.3, 0.5, 0.7, 0.95): paint(cyl((-L + 2 * L * u, y, arc(u)), (-L + 2 * L * u, y, arc(u) + 0.2), 0.016, sides=4), solid(WOOD_D))
    finish('bridge', OUT)

# ── 나룻배 — 볼록 껍질은 속을 팔 수 없어서, 윗면을 배 안쪽 빛깔로 칠하고 뱃전 테를 두른다 ──
def boat():
    begin(13)
    hullpts, rim = [], []
    for k in range(9):
        u = k / 8; x = -0.45 + 0.9 * u; w = 0.2 * math.sin(u * math.pi) ** 0.7 + 0.01
        for z, s in ((0.0, 0.55), (0.14, 1.0)): hullpts += [Vector((x, w * s, z)), Vector((x, -w * s, z))]
        rim.append((x, w))
    hullpts += [Vector((-0.5, 0, 0.17)), Vector((0.5, 0, 0.17))]
    paint(hull(hullpts), shade(lin(0x4a2f1a), lin(0x8f5e34), k=0.1))   # 윗면 = 배 안쪽(어둡게), 옆 = 뱃전
    side = [Vector((x, w, 0.155)) for x, w in rim] + [Vector((0.5, 0, 0.17))] + [Vector((x, -w, 0.155)) for x, w in reversed(rim)] + [Vector((-0.5, 0, 0.17))]
    paint(loft(side, 0.022, sides=4, closed=True, wob=0), solid(lin(0xc49260)))
    for x in (-0.15, 0.15): box((x, 0, 0.165), (0.06, 0.32, 0.025), solid(WOOD_L))
    paint(cyl((0.05, 0.12, 0.18), (-0.35, 0.3, 0.12), 0.012, sides=4), solid(WOOD_D))   # 노
    paint(hull([Vector((-0.35 + dx, 0.3, 0.12 + dz)) for dx in (-0.08, 0.02) for dz in (-0.01, 0.01)] + [Vector((-0.3, 0.33, 0.12))]), solid(WOOD))
    finish('boat', OUT)

# ── 분수 ──
def fountain():
    begin(14)
    paint(loft([(0, 0, 0), (0, 0, 0.14), (0, 0, 0.16)], [0.55, 0.55, 0.5], sides=16, wob=0.01), shade(STONE, STONE_D))
    paint(cyl((0, 0, 0.15), (0, 0, 0.168), 0.47, sides=16), solid(WATER, 0.05))   # 아래 수반 물 — 테두리(0.16) 위로 살짝(안에 두면 돌에 묻혀 안 보였다)
    paint(loft([(0, 0, 0.13), (0, 0, 0.45), (0, 0, 0.5)], [0.08, 0.06, 0.07], sides=8), shade(STONE, STONE_D))
    paint(loft([(0, 0, 0.5), (0, 0, 0.56), (0, 0, 0.6)], [0.08, 0.24, 0.25], sides=12), shade(STONE, STONE_D))
    paint(cyl((0, 0, 0.58), (0, 0, 0.6), 0.21, sides=12), solid(WATER, 0.05))
    paint(loft([(0, 0, 0.6), (0, 0, 0.78), (0, 0, 0.82)], [0.04, 0.03, 0.05], sides=6), solid(STONE))
    part('water', loc=(0, 0, 0.82))   # 솟는 물 — 게임에서 일렁인다. 하얗게 칠했더니 수반 물과 달라 어색했다(10/1) → 하늘색
    paint(loft([(0, 0, 0.82), (0, 0, 0.95), (0, 0, 1.0)], [0.025, 0.035, 0.0], sides=6, wob=0), solid(lin(0x8fdcf0), 0.04))
    for k in range(6):
        a = k / 6 * 2 * math.pi; d = Vector((math.cos(a), math.sin(a), 0))
        path = [Vector((0, 0, 0.92)), d * 0.12 + Vector((0, 0, 0.9)), d * 0.2 + Vector((0, 0, 0.75)), d * 0.23 + Vector((0, 0, 0.6))]
        paint(loft(crs(path, 6), 0.012, sides=4, wob=0), solid(lin(0x8fdcf0), 0.04))
    finish('fountain', OUT)

# ── 정자 ──
def gazebo():
    begin(15)
    paint(loft([(0, 0, 0), (0, 0, 0.08)], [0.62, 0.6], sides=8, wob=0), shade(STONE, STONE_D))
    for p in ring_pts(0.5, 0, 8, math.pi / 8): paint(cyl((p.x, p.y, 0.08), (p.x, p.y, 0.72), 0.03, sides=6), solid(lin(0xf3ede0)))
    paint(loft([(0, 0, 0.72), (0, 0, 0.76)], [0.62, 0.62], sides=8, wob=0), solid(lin(0xe9e1cf)))
    paint(cone((0, 0, 0.76), (0, 0, 1.12), 0.68, 8), shade(lin(0x2f7d74), lin(0x24635c)))
    paint(blob((0, 0, 1.14), (0.04, 0.04, 0.04), n=8, jitter=0), solid(lin(0xe0b545)), METAL)
    pts = ring_pts(0.5, 0.3, 8, math.pi / 8)
    for k in range(6):
        a, b = pts[k], pts[k + 1]; paint(loft([a, b], 0.018, sides=4, wob=0), solid(lin(0xf3ede0)))
    finish('gazebo', OUT)

ALL = [bench, pot, fence, sign, lamp, flowerbed, birdhouse, figtree, palmtree, well, arbor, bridge, boat, fountain, gazebo]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
