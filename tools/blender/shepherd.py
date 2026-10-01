# 꾸밈 컨셉 「🐑 목자의 언덕」(시 23 · 요 10) — 세트 ① 양 우리 · ② 목자의 쉼터 · ③ 푸른 풀밭과 쉴 만한 물가 (2026-10-01)
# 실행: blender -b -P shepherd.py -- <출력 폴더> [이름 …]   → models/decor/*.glb (게임 NJ_DECOR · NJ_SETS)
# 우리의 열린 쪽 = 블렌더 -y = 게임 +z. 조립 배치는 game.js NJ_SETS.pen.layout(게임 좌표)와 맞춘다:
#   돌담(ㄷ자) 가운데 (0,0) · 나무 문 (0, +0.9) · 구유 · 건초 · 양들은 안에서 거닌다
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

STONE, STONE_D, STONE_L = lin(0xbfb4a0), lin(0x948a78), lin(0xd6ccb8)
WOOD, WOOD_D, WOOD_L = lin(0x8a5a30), lin(0x5e3c1e), lin(0xb07c48)
WOOL, WOOL_D = lin(0xf4efe4), lin(0xd9d1c0)
FACE = lin(0x3a302a)
HAY, HAY_D = lin(0xe2c46a), lin(0xc4a24a)

def stones_along(pts, h=0.3, rows=3, size=0.11):
    """돌을 줄지어 쌓는다 — pts(블렌더 xy) 사이를 잇는 낮은 돌담"""
    P = [Vector((p[0], p[1], 0)) for p in pts]
    for a, b in zip(P, P[1:]):
        L = (b - a).length; n = max(1, int(L / (size * 1.7)))
        for k in range(n + 1):
            c = a + (b - a) * (k / n)
            for r in range(rows):
                off = (size * 0.8 if r % 2 else 0) / max(L, 1e-6)
                q = c + (b - a) * off * 0.5 + Vector(((random.random() - 0.5) * 0.02, (random.random() - 0.5) * 0.02, size * 0.55 + r * h / rows))
                paint(blob(q, (size * (0.9 + random.random() * 0.3), size * 0.8, size * 0.6), n=8, jitter=0.3),
                      solid(random.choice([STONE, STONE_D, STONE_L]), 0.08))

# ── 돌담 (ㄷ자) — 뒤와 양옆. 앞은 나무 문이 막는다 ──
def penwall():
    begin(31)
    stones_along([(-0.9, -0.9), (-0.9, 0.9), (0.9, 0.9), (0.9, -0.9)])
    finish('penwall', OUT)

# ── 나무 문 — 앞쪽 짧은 돌담 둘과 가운데 나무 문 ──
def pengate():
    begin(32)
    stones_along([(-0.9, 0), (-0.38, 0)]); stones_along([(0.38, 0), (0.9, 0)])
    for x in (-0.33, 0.33): paint(cyl((x, 0, 0), (x, 0, 0.42), 0.035, sides=6), solid(WOOD_D))
    part('door', loc=(0.3, 0, 0.0))   # 문짝 — 오른쪽 기둥이 경첩(세로축). 큰 세트에서 목자가 오면 열린다(nj3d.js bigShow). 왼쪽에 달았더니 열린 문짝이 흙길(남쪽으로 꺾인다)을 막아 목자·양이 문을 뚫고 지났다(10/1)
    for z in (0.12, 0.3):   # 가로대 둘 + 엇대
        paint(cyl((-0.3, 0, z), (0.3, 0, z), 0.018, sides=4), solid(WOOD))
    paint(cyl((-0.28, 0, 0.12), (0.28, 0, 0.3), 0.016, sides=4), solid(WOOD_L))
    for x in (-0.18, 0.0, 0.18): paint(cyl((x, 0, 0.06), (x, 0, 0.36), 0.014, sides=4), solid(WOOD))
    base()
    finish('pengate', OUT)

# ── 양 — 털은 울퉁불퉁한 덩어리, 머리는 따로(고개를 숙여 물 마시고 풀 뜯는다) ──
def _sheep(name, seed, wool, wool_d, face, s=1.0):
    begin(seed)
    L = 0.36 * s
    paint(blob((0, 0, 0.2 * s), (L / 2, 0.12 * s, 0.11 * s), n=30, jitter=0.25), shade(wool, wool_d, k=0.08))   # 몸(앞 = +x)
    for (x, y) in ((0.1, 0.06), (0.1, -0.06), (-0.11, 0.06), (-0.11, -0.06)):
        paint(cyl((x * s, y * s, 0), (x * s, y * s, 0.13 * s), 0.016 * s, sides=5), solid(face))
    paint(blob((-0.18 * s, 0, 0.22 * s), (0.03 * s, 0.03 * s, 0.03 * s), n=8, jitter=0.2), solid(wool))   # 꼬리
    paint(blob((0.15 * s, 0, 0.235 * s), (0.065 * s, 0.06 * s, 0.07 * s), n=12, jitter=0.15), shade(wool, wool_d, k=0.08))   # 목 — 고개를 숙여도 머리가 떨어져 보이지 않게
    part('head', loc=(0.15 * s, 0, 0.24 * s))   # 목에서 숙인다
    paint(blob((0.22 * s, 0, 0.27 * s), (0.065 * s, 0.045 * s, 0.05 * s), n=12, jitter=0.1), solid(face, 0.06))
    paint(blob((0.19 * s, 0, 0.31 * s), (0.04 * s, 0.05 * s, 0.03 * s), n=10, jitter=0.3), solid(wool, 0.06))   # 정수리 털
    for y in (-1, 1):
        paint(cone((0.19 * s, y * 0.04 * s, 0.28 * s), (0.17 * s, y * 0.11 * s, 0.25 * s), 0.014 * s, 4), solid(face))
    for y in (-1, 1):   # 눈
        paint(blob((0.265 * s, y * 0.025 * s, 0.29 * s), (0.008 * s, 0.008 * s, 0.008 * s), n=6, jitter=0), solid(lin(0x111111)))
    finish(name, OUT)

def sheep(): _sheep('sheep', 33, WOOL, WOOL_D, FACE)
def blacksheep(): _sheep('blacksheep', 34, lin(0x4a4440), lin(0x37322e), lin(0x221c18))
def lamb(): _sheep('lamb', 35, lin(0xfffaf0), lin(0xeee6d4), lin(0x8a776a), s=0.7)

# ── 여물통(먹이 구유) — 나무 다리 위 V자 통에 건초 (10/1 사용자: 물 구유였는데 바로 앞 시냇물과 겹쳐 → 먹이 구유로. 물은 시냇가에서) ──
def trough():
    begin(36)
    for x in (-0.22, 0.22):   # X자 다리
        for s2 in (-1, 1): paint(cyl((x, s2 * 0.1, 0.0), (x, -s2 * 0.04, 0.2), 0.012, sides=4), solid(WOOD_D))
    sides = []
    for s2 in (-1, 1):   # 비스듬한 옆판(가로 널 둘)
        for z0 in (0.13, 0.19):
            paint(hull([Vector((x, s2 * (0.035 + (z0 - 0.1) * 0.9) + dy, z)) for x in (-0.26, 0.26) for dy in (-0.006, 0.006) for z in (z0, z0 + 0.05)]), shade(WOOD_L, WOOD, k=0.1))
    for x in (-0.26, 0.26):   # 마구리
        paint(hull([Vector((x + dx, y, z)) for dx in (-0.008, 0.008) for (y, z) in ((-0.03, 0.11), (0.03, 0.11), (-0.12, 0.25), (0.12, 0.25))]), solid(WOOD, 0.08))
    paint(blob((0, 0, 0.21), (0.24, 0.09, 0.045), n=22, jitter=0.35), shade(HAY, HAY_D, k=0.12))   # 담긴 건초
    for k in range(8):
        a = random.random() * 2 * math.pi; c = Vector(((random.random() - 0.5) * 0.4, (random.random() - 0.5) * 0.12, 0.24))
        paint(cone(c, c + Vector((math.cos(a) * 0.06, math.sin(a) * 0.04, 0.03)), 0.006, 3), solid(HAY, 0.1))
    finish('trough', OUT)

# ── 건초더미 — 둥글게 쌓은 건초와 꽂아 둔 쇠스랑 ──
def hay():
    begin(37)
    paint(blob((0, 0, 0.13), (0.22, 0.18, 0.15), n=30, jitter=0.3), shade(HAY, HAY_D, k=0.12))
    for k in range(10):   # 삐져나온 지푸라기
        a = random.random() * 2 * math.pi; c = Vector((math.cos(a) * 0.17, math.sin(a) * 0.14, 0.12 + random.random() * 0.1))
        paint(cone(c, c + Vector((math.cos(a) * 0.08, math.sin(a) * 0.08, 0.04)), 0.008, 3), solid(HAY, 0.1))
    paint(cyl((0.12, 0.05, 0.15), (0.2, 0.09, 0.5), 0.011, sides=4), solid(WOOD))   # 쇠스랑 자루
    for d in (-0.02, 0.0, 0.02): paint(cyl((0.12 + d, 0.05, 0.15), (0.11 + d, 0.05, 0.06), 0.005, sides=3), solid(lin(0x55585e)))
    finish('hay', OUT)

# ══ 세트 ② 목자의 쉼터 — 검은 염소털 천막 · 모닥불 · 피리 부는 목자 · 굽은 지팡이 · 피리 · 가죽 물부대 · 깔개 · 목양견 ══
GOAT, GOAT_D = lin(0x3b302a), lin(0x2a221d)
ROBE, ROBE_D = lin(0x9c6b4a), lin(0x7e5236)
SKIN = lin(0xd9a77c)
CLOTH = lin(0xe9dfc8)

# ── 천막 — 베두인 검은 천막: 기둥 위에 늘어진 지붕, 앞은 열려 있다(앞 = +x) ──
def tent():
    begin(41)
    for x in (-0.35, 0.35):
        for y in (-0.42, 0.0, 0.42): paint(cyl((x, y, 0), (x, y, 0.5 if y == 0 else 0.42), 0.02, sides=5), solid(WOOD_D))
    roof = []
    for x in (-0.42, 0.0, 0.42):
        for y in (-0.48, -0.24, 0.0, 0.24, 0.48):
            z = 0.42 + 0.08 * (1 - abs(y) / 0.48) - (0.04 if x == 0 else 0)   # 기둥 사이로 처진다
            roof += [Vector((x, y, z)), Vector((x, y, z - 0.03))]
    paint(hull(roof), shade(GOAT, GOAT_D, k=0.1))
    for k in range(5):   # 지붕 무늬(줄)
        y = -0.4 + k * 0.2
        paint(hull([Vector((x, y + d, 0.5 - 0.06 * abs(y) / 0.48 + 0.002)) for x in (-0.42, 0.42) for d in (-0.012, 0.012)]), solid(lin(0x6b5a4a), 0.05))
    paint(hull([Vector((-0.42, y, z)) for y in (-0.48, 0.48) for z in (0.0, 0.44)] + [Vector((-0.44, 0, 0.5))]), shade(GOAT, GOAT_D))   # 뒷벽
    for y in (-1, 1):   # 옆벽(반쯤)
        paint(hull([Vector((x, y * 0.48, z)) for x in (-0.42, 0.05) for z in (0.0, 0.42)]), shade(GOAT_D, GOAT))
    for y in (-1, 1):   # 줄과 말뚝
        paint(cyl((0.35, y * 0.42, 0.42), (0.6, y * 0.62, 0.0), 0.005, sides=3), solid(lin(0xcfc2a0)))
        paint(cyl((0.6, y * 0.62, 0.0), (0.6, y * 0.62, 0.05), 0.01, sides=4), solid(WOOD))
    paint(hull([Vector((x, y, z)) for x in (-0.38, 0.3) for y in (-0.4, 0.4) for z in (0.0, 0.01)]), solid(lin(0x8a3a2a), 0.06))   # 안에 깔린 천
    finish('tent', OUT)

# ── 모닥불 — 돌 둘레 · 장작 · 따로 일렁이는 불꽃(flame) ──
def campfire():
    begin(42)
    for k in range(9):
        a = k / 9 * 2 * math.pi
        paint(blob((math.cos(a) * 0.15, math.sin(a) * 0.15, 0.03), (0.045, 0.04, 0.035), n=8, jitter=0.3), solid(random.choice([STONE, STONE_D]), 0.08))
    for k in range(4):
        a = k / 4 * math.pi + 0.3
        paint(cyl((math.cos(a) * 0.12, math.sin(a) * 0.12, 0.02), (-math.cos(a) * 0.04, -math.sin(a) * 0.04, 0.09), 0.022, sides=5), solid(WOOD_D))
    paint(blob((0, 0, 0.03), (0.07, 0.07, 0.02), n=10, jitter=0.3), solid(lin(0xff6a2a), 0.1), GLOW)   # 숯불
    part('flame', loc=(0, 0, 0.06))
    for k, (dx, dy, h) in enumerate(((0, 0, 0.22), (0.04, 0.03, 0.15), (-0.04, -0.02, 0.16), (0.02, -0.04, 0.12))):
        b = Vector((dx, dy, 0.06))
        paint(loft([b, b + Vector((0, 0, h * 0.4)), b + Vector((0, 0, h))], [0.045 - k * 0.006, 0.035 - k * 0.004, 0.0], sides=5, wob=0.1),
              solid(lin(0xff7a22) if k else lin(0xffb83a), 0.1), GLOW)   # 짙은 주황 — 옅으면 빛나며 하얗게 날아간다
    finish('campfire', OUT, emit=(1.0, 0.55, 0.15))

# ── 목자 — 깔개에 앉아 피리를 분다(앞 = +x). 머리에 두건, 수염 ──
def shepherd():
    begin(43)
    paint(blob((-0.01, 0, 0.07), (0.1, 0.12, 0.07), n=16, jitter=0.12), shade(ROBE, ROBE_D))      # 엉덩이·겉옷 자락
    for y in (-1, 1):   # 책상다리 — 무릎이 양옆으로, 발목이 앞에서 엇갈린다
        paint(loft(crs([(0.0, y * 0.05, 0.05), (0.06, y * 0.12, 0.05), (0.12, y * 0.06, 0.04), (0.13, -y * 0.03, 0.035)], 6), [0.042, 0.04, 0.035, 0.03, 0.026, 0.022], sides=6, wob=0.05), shade(ROBE, ROBE_D))
        paint(blob((0.13, -y * 0.045, 0.03), (0.025, 0.018, 0.015), n=6, jitter=0.1), solid(lin(0x6b4a2e)))   # 발(가죽신)
    paint(loft([(-0.02, 0, 0.12), (-0.01, 0, 0.26), (0.0, 0, 0.32)], [0.09, 0.08, 0.06], sides=7, wob=0.08), shade(ROBE, ROBE_D))   # 몸
    paint(loft([(0.0, 0, 0.18), (0.0, 0, 0.3)], [0.095, 0.075], sides=7, wob=0.05), solid(lin(0xe2d4b0), 0.06))   # 겉옷 위 망토 띠
    part('head', loc=(0.0, 0, 0.32))
    paint(blob((0.01, 0, 0.37), (0.05, 0.048, 0.055), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(blob((0.035, 0, 0.345), (0.03, 0.035, 0.03), n=10, jitter=0.2), solid(lin(0x6b4a2e), 0.06))   # 수염
    paint(blob((-0.005, 0, 0.395), (0.06, 0.058, 0.04), n=12, jitter=0.1), shade(CLOTH, lin(0xd2c6a8)))   # 두건
    paint(loft([(-0.02, 0, 0.39), (-0.06, 0, 0.3), (-0.07, 0, 0.22)], [0.045, 0.05, 0.05], sides=5, ell=(1.0, 0.5), wob=0.05), shade(CLOTH, lin(0xd2c6a8)))   # 뒤로 늘어진 두건
    paint(loft([Vector((0.01 + math.cos(t) * 0.058, math.sin(t) * 0.058, 0.41)) for t in [k / 12 * 2 * math.pi for k in range(12)]], 0.008, sides=4, closed=True, wob=0), solid(lin(0x6b2a2a)))   # 두건 띠(이마 위로 두른 끈)
    base()
    for y in (-1, 1):   # 피리를 잡은 두 팔 — 입 앞으로
        paint(loft([(0.0, y * 0.07, 0.28), (0.07, y * 0.06, 0.24), (0.1, y * 0.025, 0.32)], [0.025, 0.022, 0.018], sides=5, wob=0), shade(ROBE, ROBE_D))
        paint(blob((0.105, y * 0.02, 0.33), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    finish('shepherd', OUT)

# ── 목자의 지팡이 — 끝이 둥글게 굽은 막대(시 23:4 「주의 지팡이와 막대기가 나를 안위하시나이다」) ──
def staff():
    begin(44)
    pts = [(0, 0, 0), (0.0, 0, 0.5), (0.01, 0, 0.78)] + [(0.07 + 0.07 * math.cos(t), 0, 0.82 + 0.07 * math.sin(t)) for t in [math.pi - k * 0.4 for k in range(9)]]
    paint(loft(crs(pts, 18), 0.014, sides=5, wob=0.05), shade(WOOD_L, WOOD))
    finish('staff', OUT)

# ── 피리 — 갈대 피리 ──
def flute():
    begin(45)
    paint(cyl((-0.1, 0, 0.015), (0.1, 0, 0.015), 0.012, sides=6), shade(lin(0xd8c084), lin(0xb79e60)))
    for k in range(5): paint(cyl((-0.04 + k * 0.025, 0, 0.026), (-0.04 + k * 0.025, 0, 0.029), 0.004, sides=4), solid(lin(0x3a2a1a)))
    finish('flute', OUT)

# ── 가죽 물부대 — 염소 가죽 부대에 끈 ──
def waterskin():
    begin(46)
    paint(blob((0, 0, 0.09), (0.11, 0.08, 0.09), n=20, jitter=0.18), shade(lin(0x8a5a36), lin(0x6b4426)))
    paint(loft([(0.02, 0, 0.16), (0.03, 0, 0.21), (0.035, 0, 0.25)], [0.03, 0.018, 0.022], sides=6), solid(lin(0x7a4e2e)))   # 위로 묶은 목
    paint(loft([Vector((0.03 + math.cos(t) * 0.02, math.sin(t) * 0.02, 0.215)) for t in [k / 8 * 2 * math.pi for k in range(8)]], 0.006, sides=3, closed=True, wob=0), solid(lin(0x3a2414)))   # 묶은 끈
    paint(loft(crs([(-0.08, 0.0, 0.12), (-0.02, 0.0, 0.25), (0.08, 0.0, 0.16)], 7), 0.006, sides=3, wob=0), solid(lin(0x4a2e1a)))
    finish('waterskin', OUT)

# ── 깔개 — 줄무늬 짠 깔개 ──
def rug():
    begin(47)
    cols = [lin(0x9c2f2a), lin(0xe0c27a), lin(0x2f4f7a), lin(0xe9dfc8)]
    for k in range(8):
        x0 = -0.28 + k * 0.07
        paint(hull([Vector((x, y, z)) for x in (x0, x0 + 0.07) for y in (-0.2, 0.2) for z in (0.0, 0.012)]), solid(cols[k % 4], 0.05))
    for x in (-0.3, 0.3):
        for y in [-0.18 + k * 0.06 for k in range(7)]: paint(cyl((x, y, 0.005), (x + (0.03 if x > 0 else -0.03), y, 0.002), 0.004, sides=3), solid(CLOTH))
    finish('rug', OUT)

# ── 목양견 — 양 지키는 개(머리는 따로) ──
def dog():
    begin(48)
    s = 1.0
    paint(blob((0, 0, 0.17), (0.15, 0.07, 0.07), n=18, jitter=0.15), shade(lin(0x2b2420), lin(0x1e1916)))
    paint(blob((0.02, 0, 0.15), (0.1, 0.06, 0.05), n=12, jitter=0.1), solid(lin(0xe9dfc8), 0.05))   # 가슴 흰 털
    for (x, y) in ((0.09, 0.04), (0.09, -0.04), (-0.1, 0.04), (-0.1, -0.04)):
        paint(cyl((x, y, 0), (x, y, 0.13), 0.014, sides=5), solid(lin(0xe9dfc8), 0.05))
    paint(loft(crs([(-0.14, 0, 0.19), (-0.22, 0, 0.21), (-0.27, 0, 0.17)], 5), [0.02, 0.016, 0.012, 0.008, 0.004], sides=4, wob=0), solid(lin(0x2b2420)))   # 꼬리
    paint(blob((0.13, 0, 0.2), (0.05, 0.045, 0.05), n=10, jitter=0.1), solid(lin(0x2b2420), 0.06))   # 목
    part('head', loc=(0.13, 0, 0.21))
    paint(blob((0.18, 0, 0.25), (0.055, 0.045, 0.045), n=12, jitter=0.1), solid(lin(0x2b2420), 0.06))
    paint(blob((0.24, 0, 0.235), (0.035, 0.022, 0.022), n=8, jitter=0.05), solid(lin(0xe9dfc8), 0.05))   # 주둥이
    paint(blob((0.268, 0, 0.24), (0.008, 0.008, 0.008), n=6, jitter=0), solid(lin(0x111111)))
    for y in (-1, 1):
        paint(cone((0.16, y * 0.03, 0.28), (0.15, y * 0.04, 0.33), 0.016, 3), solid(lin(0x2b2420)))
        paint(blob((0.215, y * 0.022, 0.265), (0.006, 0.006, 0.006), n=6, jitter=0), solid(lin(0x111111)))
    finish('dog', OUT)

# ══ 세트 ③ 푸른 풀밭과 쉴 만한 물가 (시 23:2) — 시냇물 · 디딤돌 · 풀밭 · 누워 쉬는 양 · 들꽃 · 갈대 · 올리브나무 · 이끼 바위 · 나비 ══
GRASS, GRASS_D, GRASS_L = lin(0x5fae4e), lin(0x3f8a3a), lin(0x86c766)
SAND, SAND_D = lin(0xd8c79a), lin(0xb9a777)
BROOK = lin(0x5ec8e4)

def _brook_y(x):   # 시냇물 가운데 줄 — 완만한 S자(x −1.1 ~ 1.1)
    return 0.12 * math.sin(x * 2.4)

# ── 시냇물 — 모래 둑과 물(water 축, 일렁인다). 길이 2.2, 흐름 = x ──
def brook():
    begin(51)
    xs = [-1.1 + 2.2 * k / 22 for k in range(23)]
    for side in (-1, 1):   # 모래 둑
        pts = [Vector((x, _brook_y(x) + side * 0.2, 0.012)) for x in xs]
        paint(loft(pts, 0.07, sides=5, ell=(1.0, 0.25), wob=0.25), shade(SAND, SAND_D, k=0.12))
    for k in range(12):   # 물가 자갈
        x = -1.0 + random.random() * 2.0; s = random.choice((-1, 1))
        paint(blob((x, _brook_y(x) + s * (0.2 + random.random() * 0.05), 0.02), (0.035, 0.03, 0.02), n=6, jitter=0.3), solid(random.choice([STONE, STONE_D, STONE_L]), 0.08))
    part('water', loc=(0, 0, 0.012))
    paint(loft([Vector((x, _brook_y(x), 0.008)) for x in xs], 0.16, sides=6, ell=(1.0, 0.06), wob=0.05), solid(BROOK, 0.08))
    for k in range(9):   # 물결 하이라이트
        x = -0.95 + k * 0.24 + random.random() * 0.05
        paint(hull([Vector((x + dx, _brook_y(x) + dy, 0.02)) for dx in (-0.05, 0.05) for dy in (-0.012, 0.012)]), solid(lin(0xd9f6ff), 0.04))
    finish('brook', OUT)

# ── 디딤돌 — 시냇물을 건너는 납작한 돌 넷(건너는 방향 = y) ──
def steppingstones():
    begin(52)
    for k, y in enumerate((-0.33, -0.11, 0.11, 0.33)):
        paint(hull([Vector((math.cos(a) * 0.09 * (1 + (random.random() - 0.5) * 0.3) + (k % 2) * 0.03, y + math.sin(a) * 0.075, z)) for a in [j / 7 * 2 * math.pi for j in range(7)] for z in (0.0, 0.05 + random.random() * 0.015)]),
              shade(STONE_L, STONE_D, k=0.1))
    finish('steppingstones', OUT)

# ── 푸른 풀밭 — 낮게 깔린 풀판과 풀 무더기 ──
def meadow():
    begin(53)
    pts = [Vector((math.cos(a) * 0.55 * (1 + (random.random() - 0.5) * 0.2), math.sin(a) * 0.42 * (1 + (random.random() - 0.5) * 0.2), z)) for a in [k / 14 * 2 * math.pi for k in range(14)] for z in (0.0, 0.02)]
    paint(hull(pts), shade(GRASS, GRASS_D, k=0.1))
    for k in range(34):   # 풀 무더기
        a = random.random() * 2 * math.pi; r = math.sqrt(random.random()); c = Vector((math.cos(a) * r * 0.5, math.sin(a) * r * 0.38, 0.02))
        for j in range(3):
            d = Vector(((random.random() - 0.5) * 0.04, (random.random() - 0.5) * 0.04, 0.06 + random.random() * 0.05))
            paint(cone(c + Vector(((random.random() - 0.5) * 0.02, (random.random() - 0.5) * 0.02, 0)), c + d, 0.012, 3), solid(random.choice([GRASS, GRASS_L, GRASS_D]), 0.08))
    finish('meadow', OUT)

# ── 누워 쉬는 양 — 다리를 접고 엎드렸다(머리는 따로 — 가끔 든다) ──
def restsheep():
    begin(54)
    paint(blob((0, 0, 0.11), (0.19, 0.14, 0.1), n=28, jitter=0.25), shade(WOOL, WOOL_D, k=0.08))
    for (x, y) in ((0.12, 0.1), (0.12, -0.1), (-0.12, 0.11)):
        paint(blob((x, y, 0.025), (0.04, 0.025, 0.02), n=6, jitter=0.1), solid(FACE))   # 접은 다리 끝
    paint(blob((-0.18, 0, 0.12), (0.03, 0.03, 0.03), n=8, jitter=0.2), solid(WOOL))
    paint(blob((0.15, 0, 0.14), (0.06, 0.055, 0.06), n=10, jitter=0.15), shade(WOOL, WOOL_D))   # 목
    part('head', loc=(0.16, 0, 0.15))
    paint(blob((0.23, 0, 0.17), (0.065, 0.045, 0.05), n=12, jitter=0.1), solid(FACE, 0.06))
    paint(blob((0.2, 0, 0.21), (0.04, 0.05, 0.03), n=10, jitter=0.3), solid(WOOL, 0.06))
    for y in (-1, 1):
        paint(cone((0.2, y * 0.04, 0.18), (0.18, y * 0.11, 0.15), 0.014, 4), solid(FACE))
    finish('restsheep', OUT)

# ── 들꽃 무리 — 아네모네·데이지 같은 들의 백합화(마 6:28) ──
def wildflowers():
    begin(55)
    cols = [lin(0xe0303a), lin(0xffffff), lin(0xf3c93b), lin(0x9b59d0), lin(0xff8fb1)]
    for k in range(16):
        a = random.random() * 2 * math.pi; r = math.sqrt(random.random()) * 0.22; b = Vector((math.cos(a) * r, math.sin(a) * r, 0))
        top = b + Vector(((random.random() - 0.5) * 0.05, (random.random() - 0.5) * 0.05, 0.12 + random.random() * 0.12))
        paint(cyl(b, top, 0.005, sides=3), solid(GRASS_D))
        c = random.choice(cols)
        paint(hull([top + Vector((math.cos(q) * 0.03 * (1 if j % 2 else 0.7), math.sin(q) * 0.03 * (1 if j % 2 else 0.7), z)) for j, q in enumerate([j / 10 * 2 * math.pi for j in range(10)]) for z in (-0.002, 0.002)]), solid(c, 0.06))   # 꽃잎은 한 장(무게 1/4)
        paint(blob(top + Vector((0, 0, 0.004)), (0.009, 0.009, 0.007), n=6, jitter=0), solid(lin(0x3a2a14) if c != lin(0xf3c93b) else lin(0xb5651d)))
    for k in range(8):   # 밑동 잎
        a = random.random() * 2 * math.pi; c = Vector((math.cos(a) * 0.12, math.sin(a) * 0.12, 0.02))
        paint(blob(c, (0.05, 0.03, 0.015), n=6, jitter=0.2), solid(GRASS, 0.1))
    finish('wildflowers', OUT)

# ── 갈대 — 물가에 선 갈대와 부들 ──
def reeds():
    begin(56)
    for k in range(14):
        a = random.random() * 2 * math.pi; r = math.sqrt(random.random()) * 0.12; b = Vector((math.cos(a) * r, math.sin(a) * r, 0))
        h = 0.4 + random.random() * 0.3; tip = b + Vector(((random.random() - 0.5) * 0.08, (random.random() - 0.5) * 0.08, h))
        paint(cone(b, tip, 0.012, 3), solid(random.choice([lin(0x6f9a3a), lin(0x87a84a), lin(0x9cae5c)]), 0.08))
        if k % 3 == 0: paint(loft([b + (tip - b) * 0.68, b + (tip - b) * 0.84], 0.02, sides=5, wob=0), solid(lin(0x6b4426)))   # 부들 이삭
    finish('reeds', OUT)

# ── 올리브나무 — 비틀린 굵은 줄기, 은빛 도는 잎 ──
def olivetree():
    begin(57)
    trunk = crs([(0, 0, 0), (0.06, 0.02, 0.25), (-0.04, 0.03, 0.5), (0.03, -0.02, 0.72)], 8)
    paint(loft(trunk, [0.12, 0.1, 0.085, 0.08, 0.075, 0.07, 0.065, 0.06], sides=7, wob=0.25, twist=0.6), solid(lin(0x7a6a58), 0.15))
    for (dx, dy, dz, r) in ((0.0, 0.0, 0.92, 0.36), (0.28, 0.08, 0.82, 0.24), (-0.27, -0.05, 0.84, 0.25), (0.06, 0.28, 0.86, 0.22), (0.02, -0.27, 0.82, 0.22)):
        paint(blob((dx, dy, dz), (r, r, r * 0.6), n=20, jitter=0.25), shade(lin(0x98aa74), lin(0x76895a)))
    for k in range(18):   # 올리브 열매
        a = random.random() * 2 * math.pi; z = 0.72 + random.random() * 0.18
        paint(blob((math.cos(a) * 0.38, math.sin(a) * 0.38, z), (0.018, 0.018, 0.022), n=6, jitter=0), solid(lin(0x3a3d1e), 0.1))
    finish('olivetree', OUT)

# ── 이끼 낀 바위 ──
def rock():
    begin(58)
    paint(blob((0, 0, 0.16), (0.3, 0.24, 0.2), n=20, jitter=0.35), shade(lin(0xa59c8c), lin(0x847b6c), k=0.1))
    paint(blob((0.24, 0.1, 0.07), (0.1, 0.09, 0.07), n=10, jitter=0.35), shade(lin(0xa59c8c), lin(0x847b6c), k=0.1))
    for k in range(6):   # 이끼
        a = random.random() * 2 * math.pi; c = Vector((math.cos(a) * 0.16, math.sin(a) * 0.13, 0.27 + random.random() * 0.05))
        paint(blob(c, (0.07, 0.06, 0.02), n=8, jitter=0.3), solid(lin(0x6f8f3a), 0.12))
    finish('rock', OUT)

# ── 나비 — 날개는 따로(wingL·wingR, 몸 축에서 펄럭) ──
def butterfly():
    begin(59)
    paint(loft([(-0.035, 0, 0.0), (0.0, 0, 0.0), (0.03, 0, 0.002)], [0.006, 0.008, 0.005], sides=4, wob=0), solid(lin(0x2a1e14)))
    for s, nm in ((1, 'wingL'), (-1, 'wingR')):
        part(nm, loc=(0, 0, 0))
        paint(hull([Vector((x, s * y, z)) for (x, y) in ((0.0, 0.004), (0.03, 0.045), (0.0, 0.055), (-0.025, 0.04)) for z in (-0.0015, 0.0015)]), solid(lin(0xf5a623), 0.05))
        paint(hull([Vector((x, s * y, z)) for (x, y) in ((-0.004, 0.004), (-0.03, 0.035), (-0.012, 0.045)) for z in (-0.0015, 0.0015)]), solid(lin(0xd9792a), 0.05))
        paint(blob((0.012, s * 0.038, 0.0018), (0.006, 0.006, 0.001), n=6, jitter=0), solid(lin(0x2a1e14)))
        base()
    finish('butterfly', OUT, views={'a': (0.2, -0.3, 1.0)})

# ══ 큰 세트 「목자의 언덕」 전용 — 걷는 목자(지팡이를 짚고, 다리는 따로 — 걸으며 흔든다). 앞 = +x ══
def shepherdwalk():
    begin(61)
    paint(loft([(0, 0, 0.1), (0, 0, 0.3), (0.0, 0, 0.42)], [0.075, 0.07, 0.055], sides=7, wob=0.06), shade(ROBE, ROBE_D))   # 몸(겉옷)
    paint(loft([(-0.005, 0, 0.18), (0, 0, 0.4)], [0.08, 0.065], sides=7, wob=0.04), solid(lin(0xe2d4b0), 0.06))
    paint(loft([(-0.01, 0, 0.42), (-0.03, 0, 0.2), (-0.04, 0, 0.1)], [0.05, 0.06, 0.07], sides=6, ell=(1.0, 0.55), wob=0.05), shade(ROBE_D, ROBE))   # 뒤로 늘어진 망토
    for y in (-1, 1):   # 왼팔은 내리고, 오른팔은 지팡이를 짚는다
        if y < 0: paint(loft([(0, y * 0.065, 0.38), (0.01, y * 0.075, 0.28), (0.02, y * 0.07, 0.2)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(ROBE, ROBE_D))
        else:
            paint(loft([(0, y * 0.065, 0.38), (0.05, y * 0.08, 0.3), (0.09, y * 0.07, 0.3)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(ROBE, ROBE_D))
            paint(blob((0.1, y * 0.07, 0.3), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    st = [(0.1, 0.07, 0.0), (0.1, 0.07, 0.4), (0.1, 0.07, 0.5)] + [(0.14 + 0.04 * math.cos(t), 0.07, 0.52 + 0.04 * math.sin(t)) for t in [math.pi - k * 0.45 for k in range(8)]]
    paint(loft(crs(st, 14), 0.009, sides=4, wob=0.03), shade(WOOD_L, WOOD))   # 지팡이
    part('head', loc=(0.0, 0, 0.43))
    paint(blob((0.01, 0, 0.48), (0.045, 0.043, 0.05), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(blob((0.035, 0, 0.455), (0.026, 0.03, 0.028), n=10, jitter=0.2), solid(lin(0x6b4a2e), 0.06))
    paint(blob((-0.005, 0, 0.505), (0.055, 0.053, 0.036), n=12, jitter=0.1), shade(CLOTH, lin(0xd2c6a8)))
    paint(loft([Vector((0.01 + math.cos(t) * 0.052, math.sin(t) * 0.052, 0.515)) for t in [k / 12 * 2 * math.pi for k in range(12)]], 0.007, sides=4, closed=True, wob=0), solid(lin(0x6b2a2a)))
    for y, nm in ((-1, 'legL'), (1, 'legR')):   # 다리 — 엉덩이에서 앞뒤로
        part(nm, loc=(0, y * 0.03, 0.12))
        paint(cyl((0, y * 0.03, 0.12), (0, y * 0.03, 0.02), 0.022, sides=5), shade(ROBE, ROBE_D))
        paint(blob((0.015, y * 0.03, 0.012), (0.03, 0.018, 0.012), n=6, jitter=0.1), solid(lin(0x6b4a2e)))
        base()
    finish('shepherdwalk', OUT)

# ══ 큰 세트 「목자의 언덕」 바닥 — 세 세트를 한 땅으로 묶는 풀밭, 우리 문에서 쉼터까지 흙길, 덤불·돌·풀 (10/1 사용자: 나란히 놓였을 뿐 어우러지지 않는다) ══
#    게임 좌표(큰 세트 안, 1.5배 전)로 빚는다: 블렌더 x = 게임 x, 블렌더 y = −게임 z. 흙길은 game.js NJ_BIG.hill.path의 길과 같은 점
HILL_PATH = [(-0.85, -0.35), (-0.7, 0.2), (0.4, 0.22), (1.9, 0.2), (2.05, 0.0)]
def hillbase():
    begin(71)
    G = lambda x, z, h=0.0: Vector((x, -z, h))
    rim = [G(math.cos(a) * 3.35 * (1 + (random.random() - 0.5) * 0.06), 0.05 + math.sin(a) * 1.75 * (1 + (random.random() - 0.5) * 0.08)) for a in [k / 28 * 2 * math.pi for k in range(28)]]
    paint(hull(rim + [Vector((v.x, v.y, 0.012)) for v in rim]), shade(lin(0x7fbf62), lin(0x5f9a48), k=0.08))   # 얇은 풀판(물건이 떠 보이지 않게 낮게)
    path = crs([(x, -z, 0.0) for x, z in HILL_PATH], 24)
    paint(loft([Vector((v.x, v.y, 0.016)) for v in path], 0.13, sides=4, ell=(1.0, 0.05), wob=0.15), shade(lin(0xc9a877), lin(0xa98a5c), k=0.12))   # 흙길
    for k in range(10):   # 길가 자갈
        v = path[int(random.random() * (len(path) - 1))]; s2 = random.choice((-1, 1))
        paint(blob(Vector((v.x + (random.random() - 0.5) * 0.1, v.y + s2 * 0.16, 0.02)), (0.03, 0.025, 0.018), n=6, jitter=0.3), solid(random.choice([STONE, STONE_D, STONE_L]), 0.08))
    for (x, z, r) in ((-3.0, -1.35, 0.22), (-0.9, -1.45, 0.18), (3.0, -1.3, 0.2), (3.05, 1.2, 0.16), (-3.05, 1.25, 0.18), (1.2, 1.55, 0.14)):   # 덤불
        paint(blob(G(x, z, r * 0.6), (r, r, r * 0.7), n=14, jitter=0.3), shade(lin(0x4f9a4a), lin(0x3a7d38)))
    for k in range(40):   # 풀 무더기
        x = -3.1 + random.random() * 6.2; z = -1.5 + random.random() * 3.1
        if abs(z - 0.2) < 0.25: continue
        c = G(x, z, 0.012)
        for j in range(2): paint(cone(c, c + Vector(((random.random() - 0.5) * 0.04, (random.random() - 0.5) * 0.04, 0.06 + random.random() * 0.04)), 0.012, 3), solid(random.choice([GRASS, GRASS_L, GRASS_D]), 0.08))
    finish('hillbase', OUT)

# ── 그늘 나무 — 상수리(테레빈)나무, 넓게 퍼진 큰 나무 ──
def terebinth():
    begin(72)
    trunk = crs([(0, 0, 0), (0.05, 0.03, 0.4), (-0.03, 0.02, 0.75), (0.02, 0, 1.0)], 8)
    paint(loft(trunk, [0.16, 0.13, 0.11, 0.1, 0.09, 0.08, 0.075, 0.07], sides=7, wob=0.2, twist=0.4), solid(lin(0x6e5a44), 0.14))
    for a, l in ((0.4, 0.5), (2.5, 0.45), (4.4, 0.5)):   # 굵은 가지
        d = Vector((math.cos(a), math.sin(a), 0))
        paint(loft([Vector((0, 0, 0.8)), d * l * 0.5 + Vector((0, 0, 1.0)), d * l + Vector((0, 0, 1.1))], [0.06, 0.045, 0.03], sides=5, wob=0.1), solid(lin(0x6e5a44), 0.14))
    for (dx, dy, dz, r) in ((0, 0, 1.35, 0.6), (0.55, 0.15, 1.2, 0.42), (-0.5, -0.1, 1.22, 0.45), (0.1, 0.5, 1.25, 0.4), (0.05, -0.5, 1.2, 0.4), (-0.3, 0.35, 1.45, 0.35)):
        paint(blob((dx, dy, dz), (r, r, r * 0.6), n=20, jitter=0.25), shade(lin(0x4f8f3e), lin(0x3b7230)))
    finish('terebinth', OUT)

ALL = [penwall, pengate, sheep, blacksheep, lamb, trough, hay, tent, campfire, shepherd, staff, flute, waterskin, rug, dog,
       brook, steppingstones, meadow, restsheep, wildflowers, reeds, olivetree, rock, butterfly, shepherdwalk, hillbase, terebinth]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
