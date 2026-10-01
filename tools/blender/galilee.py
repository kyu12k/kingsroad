# 꾸밈 컨셉 「🎣 갈릴리 바닷가」(요 21 · 겔 47:10 「어부가 그 곁에 설 것이니 … 그물 치는 곳이 될 것이라」) (2026-10-01)
# 생명수의 바다 — 열린 해안에만 놓는다(nj3d.js shoreSpot). 세트 ① 고깃배와 그물 · ② 숯불 아침
# 실행: blender -b -P galilee.py -- <출력 폴더> [이름 …]   → models/decor/*.glb
# 앞(바다 쪽) = 블렌더 −y = 게임 +z (세트를 놓으면 +z가 바다를 보게 돌린다)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

WOOD, WOOD_D, WOOD_L = lin(0x8a5a30), lin(0x5e3c1e), lin(0xb07c48)
HULL, HULL_D = lin(0x6e4a2c), lin(0x4f331d)
SAIL, SAIL_D = lin(0xf1e6cc), lin(0xd8c8a4)
NET, NET_D = lin(0xc9b98e), lin(0xa8976c)
ROPE = lin(0xd6c59a)
STONE, STONE_D = lin(0xb9b2a4), lin(0x8f887a)
ROBE, ROBE_D = lin(0x5d7da6), lin(0x45607f)
SKIN = lin(0xd9a77c)
FISH, FISH_D = lin(0xa9b8c4), lin(0x7d8d99)

def box(c, s, fn, mat=BASE):
    c = Vector(c); return paint(hull([c + Vector((x * s[0], y * s[1], z * s[2])) for x in (-.5, .5) for y in (-.5, .5) for z in (-.5, .5)]), fn, mat)

def fish_at(c, ang, s=1.0):
    d = Vector((math.cos(ang), math.sin(ang), 0)); side = Vector((-d.y, d.x, 0))
    pts = [c + d * 0.05 * s, c - d * 0.04 * s] + [c + side * k * 0.016 * s + Vector((0, 0, z)) for k in (-1, 1) for z in (0, 0.012 * s)]
    paint(hull(pts), shade(FISH, FISH_D, k=0.08))
    paint(hull([c - d * 0.035 * s, c - d * 0.06 * s + side * 0.018 * s, c - d * 0.06 * s - side * 0.018 * s, c - d * 0.035 * s + Vector((0, 0, 0.008 * s))]), solid(FISH_D))

def scale_all(f):   # 만든 모든 조각을 한꺼번에 키운다(축 위치도 함께)
    import bmesh
    for pt in S.parts:
        for v in pt['bm'].verts: v.co *= f
        pt['loc'] = pt['loc'] * f

# ── 돛단 고깃배 — 갈릴리의 나무배, 삼각돛(돛은 따로 — 바람에 부푼다), 배 안에 그물 ──
def galboat():
    begin(91)
    pts = []
    for k in range(11):
        u = k / 10; x = -0.55 + 1.1 * u; w = 0.22 * math.sin(u * math.pi) ** 0.6 + 0.015
        for z, s2 in ((0.0, 0.45), (0.12, 0.85), (0.2, 1.0)): pts += [Vector((x, w * s2, z)), Vector((x, -w * s2, z))]
    pts += [Vector((-0.62, 0, 0.26)), Vector((0.62, 0, 0.27))]   # 이물·고물이 솟는다
    paint(hull(pts), shade(lin(0x3e2a18), HULL, k=0.1))   # 윗면 = 배 안(어둡게)
    rim = [Vector((-0.55 + 1.1 * k / 10, (0.22 * math.sin(k / 10 * math.pi) ** 0.6 + 0.015), 0.2)) for k in range(11)]
    rim = rim + [Vector((0.62, 0, 0.27))] + [Vector((v.x, -v.y, v.z)) for v in reversed(rim)] + [Vector((-0.62, 0, 0.26))]
    paint(loft(rim, 0.016, sides=4, closed=True, wob=0), solid(WOOD_L))   # 뱃전
    for x in (-0.22, 0.12): box((x, 0, 0.17), (0.05, 0.4, 0.02), solid(WOOD_L))   # 가로 널
    paint(blob((0.3, 0, 0.16), (0.12, 0.1, 0.05), n=12, jitter=0.3), shade(NET, NET_D))   # 배 안의 그물
    paint(cyl((-0.05, 0, 0.12), (-0.05, 0, 1.05), 0.014, sides=5), solid(WOOD_D))   # 돛대
    part('sail', loc=(-0.05, 0, 0.6))
    yard = [Vector((-0.45, 0, 0.42)), Vector((0.35, 0, 1.05))]
    paint(loft(yard, 0.01, sides=4, wob=0), solid(WOOD_D))
    sail = [Vector((-0.43, 0.0, 0.44)), Vector((0.33, 0.0, 1.03)), Vector((0.25, 0.0, 0.28)), Vector((-0.05, 0.08, 0.6))]   # 삼각돛, 가운데가 부푼다
    paint(hull(sail + [Vector((v.x, v.y + 0.012, v.z)) for v in sail]), shade(SAIL, SAIL_D, k=0.05))
    base()
    scale_all(1.7)   # 10/1 사용자: 부두·사람과 크기가 안 맞는다 → 1.4 → 「좀 더 커도 좋겠다」 1.7 (길이 약 2.16)
    finish('galboat', OUT)

# ── 그물 말리는 대 — 두 기둥에 걸쳐 늘어진 그물 ──
def netrack():
    begin(92)
    for x in (-0.4, 0.4): paint(cyl((x, 0, 0), (x, 0, 0.6), 0.02, sides=5), solid(WOOD_D))
    paint(cyl((-0.42, 0, 0.58), (0.42, 0, 0.58), 0.013, sides=4), solid(WOOD))
    for k in range(9):   # 늘어진 그물 — 세로줄
        x = -0.36 + k * 0.09; sag = 0.06 * math.sin(k / 8 * math.pi)
        paint(loft([Vector((x, 0, 0.57)), Vector((x, 0.01, 0.35 - sag)), Vector((x + 0.01, 0.0, 0.12 - sag))], 0.004, sides=3, wob=0), solid(NET))
    for z in (0.5, 0.38, 0.26, 0.15):   # 가로줄
        paint(loft([Vector((-0.38 + k * 0.095, 0.005, z - 0.07 * math.sin(k / 8 * math.pi) * (0.57 - z) / 0.45)) for k in range(9)], 0.004, sides=3, wob=0), solid(NET_D))
    for k in range(5): paint(blob((-0.3 + k * 0.15, 0, 0.11), (0.018, 0.018, 0.018), n=6, jitter=0), solid(lin(0xe0c060)))   # 찌
    finish('netrack', OUT)

# ── 그물 더미 — 접어 쌓은 그물과 찌 ──
def netpile():
    begin(93)
    for k in range(3): paint(blob((0.02 * k, 0, 0.04 + k * 0.04), (0.2 - k * 0.04, 0.15 - k * 0.03, 0.045), n=14, jitter=0.35), shade(NET, NET_D, k=0.12))
    for k in range(6):
        a = random.random() * 2 * math.pi; paint(blob((math.cos(a) * 0.16, math.sin(a) * 0.12, 0.06), (0.018, 0.018, 0.018), n=6, jitter=0), solid(lin(0xe0c060)))
    paint(loft(crs([(-0.2, 0.05, 0.02), (-0.28, 0.12, 0.01), (-0.33, 0.04, 0.01)], 5), 0.006, sides=3, wob=0), solid(ROPE))
    finish('netpile', OUT)

# ── 물고기 바구니 — 갈대 바구니에 가득한 물고기 (요 21:11) ──
def fishbasket():
    begin(94)
    paint(loft([(0, 0, 0), (0, 0, 0.04), (0, 0, 0.14)], [0.11, 0.13, 0.15], sides=10, wob=0.04), shade(lin(0xc9a466), lin(0xa98447)))
    for z in (0.05, 0.09, 0.13): paint(loft([Vector((math.cos(a) * (0.12 + z * 0.2), math.sin(a) * (0.12 + z * 0.2), z)) for a in [k / 12 * 2 * math.pi for k in range(12)]], 0.006, sides=3, closed=True, wob=0), solid(lin(0x8a6a34)))
    for k in range(9):
        a = random.random() * 2 * math.pi; r = random.random() * 0.08
        fish_at(Vector((math.cos(a) * r, math.sin(a) * r, 0.14 + random.random() * 0.03)), random.random() * 6.28, 1.2)
    finish('fishbasket', OUT)

# ── 노 한 쌍 — 모래에 기대 세운 노 ──
def oars():
    begin(95)
    for s2 in (-1, 1):
        b = Vector((s2 * 0.08, 0, 0)); t = Vector((s2 * 0.02, 0.1, 0.62))
        paint(cyl(b + (t - b) * 0.25, t, 0.012, sides=5), solid(WOOD))
        d = (t - b).normalized(); side = Vector((1, 0, 0))
        paint(hull([b + side * k * 0.04 + Vector((0, 0, z)) for k in (-1, 1) for z in (0, 0.0)] + [b + d * 0.18 + side * k * 0.035 for k in (-1, 1)] + [b + Vector((0, 0.008, 0.02))]), solid(WOOD_L))
    finish('oars', OUT)

# ── 닻돌 — 구멍 뚫은 돌닻과 감긴 밧줄 ──
def anchorstone():
    begin(96)
    paint(blob((0, 0, 0.09), (0.12, 0.09, 0.1), n=14, jitter=0.2), shade(STONE, STONE_D))
    paint(loft([Vector((math.cos(a) * 0.03, 0, 0.17 + math.sin(a) * 0.03)) for a in [k / 10 * 2 * math.pi for k in range(10)]], 0.008, sides=3, closed=True, wob=0), solid(ROPE))
    paint(loft(crs([(0, 0, 0.2), (0.1, 0.05, 0.05), (0.2, 0.0, 0.01), (0.3, 0.1, 0.01)], 7), 0.008, sides=3, wob=0), solid(ROPE))
    for k in range(3): paint(loft([Vector((0.32 + math.cos(a) * (0.05 + k * 0.012), 0.1 + math.sin(a) * (0.05 + k * 0.012), 0.01 + k * 0.008)) for a in [j / 10 * 2 * math.pi for j in range(10)]], 0.007, sides=3, closed=True, wob=0), solid(ROPE))
    finish('anchorstone', OUT)

# ── 그물 던지는 어부 — 물가에 서서 그물을 펼쳐 던진다(팔·그물은 따로 — 던졌다 거둔다) ──
def fisherman():
    begin(97)
    paint(loft([(0, 0, 0.1), (0, 0, 0.3), (0.0, 0, 0.42)], [0.075, 0.068, 0.055], sides=7, wob=0.06), shade(ROBE, ROBE_D))
    paint(loft([(0, 0, 0.12), (0, 0, 0.2)], [0.078, 0.075], sides=7, wob=0.03), solid(lin(0xe2d4b0), 0.06))   # 허리에 두른 겉옷
    for y in (-1, 1):
        paint(cyl((0, y * 0.03, 0.12), (0.01, y * 0.03, 0.02), 0.02, sides=5), solid(SKIN))
        paint(blob((0.02, y * 0.03, 0.01), (0.03, 0.017, 0.01), n=6, jitter=0.1), solid(lin(0x6b4a2e)))
    paint(blob((0.01, 0, 0.48), (0.045, 0.043, 0.05), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(blob((0.035, 0, 0.455), (0.026, 0.03, 0.028), n=10, jitter=0.2), solid(lin(0x3a2a1a), 0.06))
    paint(blob((-0.005, 0, 0.505), (0.052, 0.05, 0.03), n=12, jitter=0.1), solid(lin(0xe9dfc8), 0.05))
    part('arms', loc=(0.0, 0, 0.38))   # 두 팔과 펼친 그물 — 어깨에서 들어 올렸다 던진다
    for y in (-1, 1):
        paint(loft([(0, y * 0.065, 0.38), (0.08, y * 0.08, 0.42), (0.15, y * 0.07, 0.48)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(ROBE, ROBE_D))
        paint(blob((0.155, y * 0.07, 0.49), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    net = [Vector((0.16 + 0.2 * math.cos(a) * 0.4, 0.2 * math.sin(a), 0.48 - 0.12 * (1 - math.cos(a)))) for a in [k / 10 * 2 * math.pi for k in range(10)]]
    paint(hull(net + [Vector((0.16, 0, 0.5))]), shade(NET, NET_D, k=0.1))
    base()
    finish('fisherman', OUT)

# ══ 세트 ② 숯불 아침 (요 21:9-13 「육지에 올라보니 숯불이 있는데 그 위에 생선이 놓였고 떡도 있더라」) ══
BREAD, BREAD_D = lin(0xd9a35c), lin(0xb07c3a)
EMBER = lin(0xff6a2a)

# ── 숯불 — 돌 둘레, 빨갛게 타는 숯, 위에 생선 둘과 떡 둘(불꽃은 따로 — 일렁인다) ──
def charcoal():
    begin(101)
    for k in range(10):
        a = k / 10 * 2 * math.pi
        paint(blob((math.cos(a) * 0.17, math.sin(a) * 0.17, 0.03), (0.045, 0.04, 0.035), n=8, jitter=0.3), solid(random.choice([STONE, STONE_D]), 0.08))
    for k in range(9):   # 숯 — 빛난다
        a = random.random() * 2 * math.pi; r = random.random() * 0.1
        paint(blob((math.cos(a) * r, math.sin(a) * r, 0.03), (0.035, 0.03, 0.022), n=6, jitter=0.3), solid(EMBER if k % 3 else lin(0x3a2a20), 0.15), GLOW if k % 3 else BASE)
    for x in (-0.06, 0.06):   # 생선 둘
        fish_at(Vector((x, -0.02, 0.07)), math.pi / 2, 1.6)
    for x in (-0.07, 0.07):   # 떡 둘
        paint(blob((x, 0.08, 0.075), (0.045, 0.04, 0.018), n=10, jitter=0.1), shade(BREAD, BREAD_D))
    part('flame', loc=(0, 0, 0.04))
    for k, (dx, dy, h) in enumerate(((0.0, 0.0, 0.12), (0.06, 0.03, 0.08), (-0.05, -0.04, 0.09))):
        b = Vector((dx, dy, 0.04))
        paint(loft([b, b + Vector((0, 0, h * 0.4)), b + Vector((0, 0, h))], [0.03, 0.022, 0.0], sides=5, wob=0.1), solid(lin(0xff7a22) if k else lin(0xffb83a), 0.1), GLOW)
    finish('charcoal', OUT, emit=(1.0, 0.55, 0.15))

# ── 물고기 가득한 그물 — 물가로 끌어올린 그물, 물고기가 넘친다 (21:11 백쉰세 마리) ──
def fullnet():
    begin(102)
    paint(blob((0, 0, 0.1), (0.32, 0.2, 0.12), n=24, jitter=0.35), shade(NET, NET_D, k=0.12))   # 불룩한 그물
    for k in range(26):
        a = random.random() * 2 * math.pi; r = math.sqrt(random.random())
        fish_at(Vector((math.cos(a) * r * 0.26, math.sin(a) * r * 0.15, 0.17 + random.random() * 0.06 * (1 - r))), random.random() * 6.28, 1.4)
    paint(loft(crs([(0.3, 0, 0.05), (0.45, 0.05, 0.02), (0.6, -0.03, 0.01)], 6), 0.008, sides=3, wob=0), solid(ROPE))
    for k in range(6): paint(blob((-0.3 + k * 0.12, 0.2, 0.05), (0.018, 0.018, 0.018), n=6, jitter=0), solid(lin(0xe0c060)))
    finish('fullnet', OUT)

# ── 떡 바구니 ──
def breadbasket():
    begin(103)
    paint(loft([(0, 0, 0), (0, 0, 0.05), (0, 0, 0.1)], [0.12, 0.14, 0.15], sides=10, wob=0.04), shade(lin(0xc9a466), lin(0xa98447)))
    for z in (0.04, 0.08): paint(loft([Vector((math.cos(a) * (0.13 + z * 0.2), math.sin(a) * (0.13 + z * 0.2), z)) for a in [k / 12 * 2 * math.pi for k in range(12)]], 0.006, sides=3, closed=True, wob=0), solid(lin(0x8a6a34)))
    for k in range(5):
        a = k / 5 * 2 * math.pi; paint(blob((math.cos(a) * 0.06, math.sin(a) * 0.06, 0.12), (0.05, 0.045, 0.025), n=10, jitter=0.1), shade(BREAD, BREAD_D))
    paint(blob((0, 0, 0.14), (0.05, 0.045, 0.025), n=10, jitter=0.1), shade(BREAD, BREAD_D))
    finish('breadbasket', OUT)

# ── 장작더미 ──
def woodpile():
    begin(104)
    for row in range(3):
        for k in range(4 - row):
            y = -0.12 + (k + row * 0.5) * 0.08; z = 0.035 + row * 0.06
            paint(cyl((-0.2, y, z), (0.2, y + (random.random() - 0.5) * 0.03, z), 0.032, sides=6, wob=0.15), solid(random.choice([WOOD, WOOD_D, lin(0x7a5232)]), 0.1))
    finish('woodpile', OUT)

# ── 물동이 — 질그릇 항아리 ──
def waterjar():
    begin(105)
    paint(loft([(0, 0, 0), (0, 0, 0.06), (0, 0, 0.2), (0, 0, 0.28), (0, 0, 0.32)], [0.06, 0.12, 0.11, 0.05, 0.06], sides=10, wob=0.03), shade(lin(0xc0764a), lin(0x9a5a34)))
    for s2 in (-1, 1): paint(loft(crs([(s2 * 0.05, 0, 0.29), (s2 * 0.11, 0, 0.27), (s2 * 0.1, 0, 0.18)], 5), 0.012, sides=4, wob=0), solid(lin(0xb06a40)))
    finish('waterjar', OUT)

# ── 앉을 통나무 둘 — 숯불 양쪽에 마주 놓는다(제자 둘이 앉는다) ──
def sitlog():
    begin(106)
    for x in (-0.46, 0.46):
        paint(cyl((x, -0.3, 0.07), (x, 0.3, 0.07), 0.07, sides=8, wob=0.12), shade(lin(0x9a7048), lin(0x6e4a2c)))
        for y in (-0.3, 0.3): paint(cyl((x, y, 0.07), (x, y * 1.01, 0.07), 0.068, sides=8), solid(lin(0xd2b07a)))
    finish('sitlog', OUT)

# ── 둘러앉은 제자 — 통나무에 앉아 불을 바라본다(머리는 따로). 겉옷 빛깔만 다른 둘 ──
def _disciple(name, seed, robe, robe_d, beard):
    begin(seed)
    paint(blob((-0.02, 0, 0.17), (0.08, 0.09, 0.05), n=12, jitter=0.12), shade(robe, robe_d))   # 앉은 엉덩이(통나무 높이 0.14)
    for y in (-1, 1):   # 무릎을 세운 다리
        paint(loft([(0.0, y * 0.05, 0.16), (0.12, y * 0.06, 0.18), (0.13, y * 0.055, 0.02)], [0.035, 0.032, 0.025], sides=5, wob=0.05), shade(robe, robe_d))
        paint(blob((0.15, y * 0.055, 0.012), (0.03, 0.018, 0.012), n=6, jitter=0.1), solid(lin(0x6b4a2e)))
    paint(loft([(-0.02, 0, 0.18), (-0.01, 0, 0.33), (0.0, 0, 0.4)], [0.08, 0.07, 0.055], sides=7, wob=0.06), shade(robe, robe_d))
    for y in (-1, 1):   # 무릎에 얹은 팔
        paint(loft([(0.0, y * 0.065, 0.36), (0.06, y * 0.07, 0.26), (0.12, y * 0.05, 0.2)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(robe, robe_d))
        paint(blob((0.125, y * 0.05, 0.2), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    part('head', loc=(0.0, 0, 0.41))
    paint(blob((0.01, 0, 0.46), (0.045, 0.043, 0.05), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(blob((0.035, 0, 0.435), (0.026, 0.03, 0.028), n=10, jitter=0.2), solid(beard, 0.06))
    paint(blob((-0.01, 0, 0.485), (0.05, 0.048, 0.03), n=12, jitter=0.15), solid(beard, 0.06))   # 머리카락
    base()
    finish(name, OUT)
def disciple(): _disciple('disciple', 107, lin(0x8a5a3a), lin(0x6e4428), lin(0x3a2a1a))
def disciple2(): _disciple('disciple2', 108, lin(0x6a7a52), lin(0x51603e), lin(0x5a4430))

# ══ 세트 ③ 부두와 어부 마을 ══
MUD, MUD_D = lin(0xd8c6a0), lin(0xb8a57e)

# ── 나무 부두 — 해안에서 바다로(블렌더 −y = 바다). 다리는 물속으로 ──
def pier():
    begin(111)
    # 10/1 사용자: 배와 크기가 안 맞는다 — 굵은 널 9장은 사다리처럼 보였다. 좁은 널 · 가는 기둥 · 폭 0.34
    # 큰 세트에서 배(길이 약 2.16)가 곁에 나란히 매이도록 길이 약 2.3
    for k in range(36):   # 널빤지(조금씩 들쭉날쭉)
        y = 0.22 - k * 0.064; w = 0.34 + (random.random() - 0.5) * 0.03
        box((random.random() * 0.01, y, 0.12), (w, 0.056, 0.022), shade(WOOD_L, WOOD, k=0.14))
    for y in (0.17, -0.4, -0.97, -1.54, -1.98):
        for x in (-0.15, 0.15): paint(cyl((x, y, -0.35), (x, y, 0.16), 0.018, sides=6), solid(WOOD_D))
    for x in (-0.17, 0.17): paint(cyl((x, 0.25, 0.104), (x, -2.05, 0.104), 0.01, sides=4), solid(WOOD_D))   # 널 밑 받침
    paint(cyl((0.15, -1.98, 0.16), (0.15, -1.98, 0.26), 0.026, sides=6), solid(WOOD_D))   # 끝 말뚝 머리 — 배를 맨다
    for z in (0.2, 0.23): paint(loft([Vector((0.15 + math.cos(a) * 0.03, -1.98 + math.sin(a) * 0.03, z)) for a in [k / 8 * 2 * math.pi for k in range(8)]], 0.006, sides=3, closed=True, wob=0), solid(ROPE))
    finish('pier', OUT)

# ── 어부의 돌집 — 흙벽돌·돌담, 평평한 지붕, 지붕 위 그물 ──
def hut():
    begin(112)
    paint(hull([Vector((x, y, z)) for x in (-0.3, 0.3) for y in (-0.25, 0.25) for z in (0, 0.38)]), shade(MUD, MUD_D, k=0.08))
    for k in range(10):
        paint(blob((-0.3 + random.random() * 0.6, -0.255, 0.05 + random.random() * 0.3), (0.04, 0.01, 0.03), n=6, jitter=0.2), solid(STONE_D, 0.08))
    paint(hull([Vector((x, y, z)) for x in (-0.34, 0.34) for y in (-0.29, 0.29) for z in (0.38, 0.42)]), shade(lin(0x9a7a50), lin(0x7a5c38)))   # 평지붕
    for x in (-0.25, -0.1, 0.05, 0.2): paint(cyl((x, -0.3, 0.4), (x, 0.3, 0.4), 0.012, sides=4), solid(WOOD_D))   # 들보 끝
    paint(hull([Vector((x, -0.252, z)) for x in (-0.07, 0.07) for z in (0, 0.24)] + [Vector((x, -0.262, z)) for x in (-0.07, 0.07) for z in (0, 0.24)]), solid(lin(0x5e3c1e)))   # 문
    paint(hull([Vector((0.17 + dx, -0.256, z)) for dx in (-0.04, 0.04) for z in (0.2, 0.28)] + [Vector((0.17, -0.26, 0.24))]), solid(lin(0x2a1e14)))   # 창
    paint(blob((0.05, 0.05, 0.45), (0.14, 0.1, 0.03), n=10, jitter=0.3), shade(NET, NET_D))   # 지붕 위 그물
    finish('hut', OUT)

# ── 생선 말리는 대 ──
def fishdry():
    begin(113)
    for x in (-0.3, 0.3): paint(cyl((x, 0, 0), (x, 0, 0.45), 0.018, sides=5), solid(WOOD_D))
    paint(cyl((-0.32, 0, 0.42), (0.32, 0, 0.42), 0.008, sides=3), solid(ROPE))
    for k in range(7):
        x = -0.24 + k * 0.08; c = Vector((x, 0, 0.33))
        paint(hull([c + Vector((0, 0, 0.07)), c + Vector((0, 0, -0.06)), c + Vector((0.02, 0, 0)), c + Vector((-0.02, 0, 0)), c + Vector((0, 0.008, 0)), c + Vector((0, -0.008, 0))]), shade(lin(0xb7a27a), lin(0x8f7a55)))
        paint(cyl((x, 0, 0.4), (x, 0, 0.42), 0.003, sides=3), solid(ROPE))
    finish('fishdry', OUT)

# ── 배 매는 말뚝 ──
def mooringpost():
    begin(114)
    paint(cyl((0, 0, -0.2), (0, 0, 0.32), 0.05, sides=7, wob=0.1), solid(WOOD_D))
    for z in (0.18, 0.22, 0.26): paint(loft([Vector((math.cos(a) * 0.056, math.sin(a) * 0.056, z)) for a in [k / 10 * 2 * math.pi for k in range(10)]], 0.008, sides=3, closed=True, wob=0), solid(ROPE))
    paint(loft(crs([(0.05, 0, 0.2), (0.2, -0.05, 0.08), (0.35, -0.1, -0.05)], 5), 0.008, sides=3, wob=0), solid(ROPE))
    finish('mooringpost', OUT)

# ── 항아리 셋 ──
def amphorae():
    begin(115)
    for (x, y, sc) in ((-0.1, 0, 1.0), (0.1, 0.03, 0.85), (0.0, 0.14, 0.75)):
        paint(loft([(x, y, 0), (x, y, 0.05 * sc), (x, y, 0.2 * sc), (x, y, 0.3 * sc), (x, y, 0.34 * sc)], [0.03 * sc, 0.09 * sc, 0.08 * sc, 0.03 * sc, 0.04 * sc], sides=9, wob=0.03), shade(lin(0xc98a5a), lin(0xa06a40)))
    finish('amphorae', OUT)

# ── 나무 궤짝 ──
def crates():
    begin(116)
    for (x, y, z, r) in ((-0.1, 0, 0.08, 0.0), (0.11, 0.02, 0.08, 0.3), (0.0, 0.0, 0.24, 0.15)):
        c = Vector((x, y, z)); ca, sa = math.cos(r), math.sin(r)
        pts = [c + Vector((ca * dx - sa * dy, sa * dx + ca * dy, dz)) for dx in (-0.08, 0.08) for dy in (-0.08, 0.08) for dz in (-0.08, 0.08)]
        paint(hull(pts), shade(WOOD_L, WOOD, k=0.1))
        for dz in (-0.03, 0.03): paint(hull([c + Vector((ca * dx - sa * dy, sa * dx + ca * dy, dz + e)) for dx in (-0.082, 0.082) for dy in (-0.082, 0.082) for e in (-0.006, 0.006)]), solid(WOOD_D))
    fish_at(Vector((0.0, 0.0, 0.33)), 0.7, 1.4)
    finish('crates', OUT)

# ── 갈매기 한 쌍 — 날개는 따로(퍼덕인다). 게임에서 공중을 맴돈다 ──
def gulls():
    begin(117)
    for gi, (ox, oy, oz) in enumerate(((0, 0, 0), (0.3, 0.18, 0.08))):
        o = Vector((ox, oy, oz))
        paint(blob(o, (0.06, 0.022, 0.022), n=10, jitter=0.05), shade(lin(0xffffff), lin(0xdcdcdc)))
        paint(blob(o + Vector((0.055, 0, 0.012)), (0.02, 0.018, 0.018), n=8, jitter=0), solid(lin(0xffffff)))
        paint(cone(o + Vector((0.072, 0, 0.012)), o + Vector((0.095, 0, 0.008)), 0.006, 3), solid(lin(0xf2b33d)))
        for s2, nm in ((1, f'wingL{gi}'), (-1, f'wingR{gi}')):
            part(nm, loc=(ox, oy + s2 * 0.015, oz + 0.01))
            paint(hull([o + Vector((x, s2 * y, 0.01 + z)) for (x, y) in ((0.02, 0.015), (-0.02, 0.015), (0.0, 0.11), (-0.04, 0.09)) for z in (-0.003, 0.003)]), shade(lin(0xf4f4f4), lin(0x9aa3ad)))
            base()
    finish('gulls', OUT, views={'a': (0.3, -0.6, 1.0)})

# ── 그물 깁는 어부 (마 4:21) — 앉아서 무릎 위 그물을 깁는다(팔은 따로 — 바늘질) ──
def mender():
    begin(118)
    R2, R2D = lin(0x9c6b4a), lin(0x7e5236)
    paint(blob((-0.02, 0, 0.07), (0.1, 0.11, 0.06), n=14, jitter=0.12), shade(R2, R2D))
    for y in (-1, 1):
        paint(loft(crs([(0.0, y * 0.05, 0.05), (0.07, y * 0.11, 0.05), (0.13, y * 0.05, 0.04), (0.13, -y * 0.03, 0.035)], 6), [0.04, 0.038, 0.034, 0.03, 0.026, 0.022], sides=6, wob=0.05), shade(R2, R2D))
    paint(loft([(-0.02, 0, 0.1), (-0.01, 0, 0.26), (0.0, 0, 0.32)], [0.08, 0.07, 0.055], sides=7, wob=0.06), shade(R2, R2D))
    paint(blob((0.12, 0, 0.09), (0.12, 0.13, 0.03), n=12, jitter=0.35), shade(NET, NET_D))   # 무릎 위 그물
    paint(blob((0.01, 0, 0.37), (0.045, 0.043, 0.05), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(blob((0.035, 0, 0.345), (0.026, 0.03, 0.028), n=10, jitter=0.2), solid(lin(0xd8d0c0), 0.06))   # 흰 수염
    paint(blob((-0.005, 0, 0.395), (0.052, 0.05, 0.03), n=12, jitter=0.1), solid(lin(0xe9dfc8), 0.05))
    part('arms', loc=(0.0, 0, 0.3))
    for y in (-1, 1):
        paint(loft([(0.0, y * 0.065, 0.3), (0.07, y * 0.06, 0.2), (0.12, y * 0.03, 0.13)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(R2, R2D))
        paint(blob((0.125, y * 0.03, 0.125), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    base()
    finish('mender', OUT)

ALL = [galboat, netrack, netpile, fishbasket, oars, anchorstone, fisherman, charcoal, fullnet, breadbasket, woodpile, waterjar, sitlog, disciple, disciple2,
       pier, hut, fishdry, mooringpost, amphorae, crates, gulls, mender]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
