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
    paint(loft([(0, 0, 0), (0, 0, 0.05), (0, 0, 0.2), (0, 0, 0.24)], [0.12, 0.13, 0.17, 0.19], sides=10, wob=0.03), shade(TERRA, lin(0xa95a37)))
    paint(cyl((0, 0, 0.22), (0, 0, 0.245), 0.165, sides=10), solid(lin(0x5a3d26)))
    paint(blob((0, 0, 0.32), (0.17, 0.17, 0.12), n=24, jitter=0.25), shade(LEAF, LEAF_D))
    flowers((0, 0, 0), 0.15, 9, 0.38, FLOWER_COLS)
    finish('pot', OUT)

# ── 돌 울타리 ──
def fence():
    begin(3)
    for x in (-0.42, 0.0, 0.42):
        paint(hull([Vector((x + dx, dy, z)) for dx in (-0.05, 0.05) for dy in (-0.05, 0.05) for z in (0, 0.32)] + [Vector((x, 0, 0.37))]), shade(STONE, STONE_D))
    for z in (0.12, 0.24):
        for x0 in (-0.42, 0.0):
            box((x0 + 0.21, 0, z), (0.4, 0.04, 0.05), shade(STONE, STONE_D, k=0.08))
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
    paint(cyl((0, 0, 0), (0, 0, 0.06), 0.09, 0.07, sides=8), solid(IRON), METAL)
    paint(cyl((0, 0, 0.06), (0, 0, 0.8), 0.025, sides=8), solid(IRON), METAL)
    paint(loft([(0, 0, 0.8), (0, 0, 0.83), (0, 0, 0.95), (0, 0, 0.98)], [0.04, 0.07, 0.08, 0.03], sides=6, wob=0), solid(IRON), METAL)
    paint(blob((0, 0, 0.885), (0.055, 0.055, 0.055), n=12, jitter=0), solid(lin(0xffe39a), 0.02), GLOW)
    paint(cone((0, 0, 0.98), (0, 0, 1.06), 0.06, 6), solid(IRON), METAL)
    finish('lamp', OUT, emit=(1.0, 0.85, 0.5))

# ── 꽃밭 ──
def flowerbed():
    begin(6)
    pts = ring_pts(0.42, 0, 12)
    paint(hull([Vector((p.x * 1.2, p.y * 0.8, 0)) for p in pts] + [Vector((p.x * 1.2, p.y * 0.8, 0.06)) for p in pts]), shade(lin(0x6b4a2e), lin(0x5a3d26)))
    for p in ring_pts(0.47, 0.03, 14):   # 둘레 돌
        paint(blob(Vector((p.x * 1.2, p.y * 0.8, 0.03)), (0.05, 0.05, 0.04), n=8, jitter=0.25), solid(STONE, 0.12))
    for k in range(10):
        a = random.random() * 2 * math.pi; r = 0.32 * math.sqrt(random.random())
        paint(blob((math.cos(a) * r * 1.2, math.sin(a) * r * 0.8, 0.1), (0.07, 0.07, 0.05), n=10, jitter=0.3), shade(LEAF, LEAF_D))
    flowers((0, 0, 0), 0.38, 26, 0.13, FLOWER_COLS)
    finish('flowerbed', OUT)

# ── 새집 ──
def birdhouse():
    begin(7)
    paint(cyl((0, 0, 0), (0, 0, 0.7), 0.025, sides=6), solid(WOOD_D))
    box((0, 0, 0.8), (0.18, 0.16, 0.2), shade(lin(0xe9d8b4), lin(0xd4bf95)))
    paint(hull([Vector((x, y, 0.9)) for x in (-0.12, 0.12) for y in (-0.11, 0.11)] + [Vector((0, y, 1.0)) for y in (-0.11, 0.11)]), shade(lin(0xb5462f), lin(0x8f3524)))
    paint(cyl((0, -0.081, 0.82), (0, -0.085, 0.82), 0.035, sides=8), solid(lin(0x2a1a10)))
    bird = Vector((0.06, -0.12, 0.92))   # 지붕에 앉은 새
    paint(blob(bird, (0.045, 0.03, 0.03), n=10, jitter=0.1), solid(lin(0x5b8fd6)))
    paint(blob(bird + Vector((0.04, -0.005, 0.025)), (0.022, 0.022, 0.022), n=8, jitter=0), solid(lin(0x5b8fd6)))
    paint(cone(bird + Vector((0.06, -0.005, 0.025)), bird + Vector((0.085, -0.005, 0.02)), 0.008, 3), solid(lin(0xffb84d)))
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
    for p in ring_pts(0.28, 0, 14):   # 돌 쌓은 둘레
        for z in (0.06, 0.18, 0.3):
            q = p * (1 + (random.random() - 0.5) * 0.04)
            paint(blob(Vector((q.x, q.y, z)), (0.075, 0.075, 0.065), n=8, jitter=0.2), shade(STONE, STONE_D))
    paint(cyl((0, 0, 0.12), (0, 0, 0.13), 0.2, sides=12), solid(lin(0x2f6f8f)))   # 물
    for x in (-0.3, 0.3): paint(cyl((x, 0, 0.2), (x, 0, 0.75), 0.03, sides=6), solid(WOOD_D))
    paint(cyl((-0.32, 0, 0.62), (0.32, 0, 0.62), 0.025, sides=6), solid(WOOD))
    paint(hull([Vector((x, y, 0.72)) for x in (-0.4, 0.4) for y in (-0.24, 0.24)] + [Vector((x, 0, 0.92)) for x in (-0.4, 0.4)]), shade(lin(0xb5462f), lin(0x8f3524)))
    paint(loft([(0, 0, 0.62), (0, 0, 0.45)], 0.006, sides=4), solid(lin(0xd9c49a)))
    paint(loft([(0, 0, 0.36), (0, 0, 0.4), (0, 0, 0.46)], [0.05, 0.06, 0.06], sides=8), shade(WOOD_L, WOOD))   # 두레박
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
