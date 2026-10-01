# 꾸밈 컨셉 「🌾 추수하는 들판」(룻 2 · 계 14:15 「낫을 휘둘러 거두소서 거둘 때가 이르러 땅의 곡식이 다 익었음이로다」) (2026-10-01)
# 성 둘레 땅에 놓는다. 세트 ① 밀밭과 일꾼(룻 2:3 「베는 자를 따라 밭에서 이삭을 줍는데」)
# 실행: blender -b -P harvest.py -- <출력 폴더> [이름 …]   → models/decor/*.glb
# 사람 모델은 앞 = 블렌더 +x (키 약 0.53 — 갈릴리·목자의 언덕과 같다). 세트의 앞(+z, 보는 쪽) = 블렌더 −y
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

WOOD, WOOD_D, WOOD_L = lin(0x8a5a30), lin(0x5e3c1e), lin(0xb07c48)
WHEAT, WHEAT_D, EAR = lin(0xe0b850), lin(0xb48a34), lin(0xf2d27a)
SOIL, SOIL_D = lin(0x9a7a52), lin(0x7a5c3a)
SKIN = lin(0xd9a77c)
STONE, STONE_D = lin(0xb9b2a4), lin(0x8f887a)
LEAF, LEAF_D = lin(0x6f8f45), lin(0x4f6a30)
CLOTH = lin(0xe9dfc8)
BREAD, BREAD_D = lin(0xd9a35c), lin(0xb07c3a)
REED, REED_D = lin(0xc9a868), lin(0xa0844c)
ROPE_C = lin(0xd6c59a)

def V(x, y, z): return Vector((x, y, z))

def box(c, s, fn, mat=BASE):
    c = Vector(c); return paint(hull([c + Vector((x * s[0], y * s[1], z * s[2])) for x in (-.5, .5) for y in (-.5, .5) for z in (-.5, .5)]), fn, mat)

def ear(c, h=0.065, w=0.013):   # 밀 이삭 하나 — 길쭉한 마름모
    paint(hull([c, c + V(0, 0, h), c + V(w, 0, h * 0.45), c + V(-w, 0, h * 0.45), c + V(0, w, h * 0.45), c + V(0, -w, h * 0.45)]), shade(EAR, WHEAT, k=0.08))

def stalk(c, h):   # 밀 한 줄기 — 가는 세모 줄기가 조금 기울고, 끝의 이삭은 더 숙인다
    a = random.random() * 2 * math.pi; lean = 0.04 + random.random() * 0.05
    tip = c + V(math.cos(a) * lean, math.sin(a) * lean, h)
    paint(cone(c, tip, 0.0085, sides=3), solid(WHEAT_D, 0.12))
    d = (tip - c).normalized() + V(math.cos(a) * 0.5, math.sin(a) * 0.5, 0); d.normalize()
    sd = d.cross(V(0, 0, 1)); sd.normalize(); up = sd.cross(d)
    L, W = 0.06 + random.random() * 0.015, 0.0135
    paint(hull([tip, tip + d * L, tip + d * L * 0.45 + sd * W, tip + d * L * 0.45 - sd * W, tip + d * L * 0.45 + up * W, tip + d * L * 0.45 - up * W]), shade(EAR, WHEAT, k=0.1))

def clump(c, h, r, ears=2):   # 밀 한 포기 — 아래는 모이고 위로 퍼지는 줄기, 끝에 이삭
    pts = []
    for k in range(5):
        a = k / 5 * 2 * math.pi + random.random() * 0.5
        pts += [c + V(math.cos(a) * r * 0.45, math.sin(a) * r * 0.45, 0), c + V(math.cos(a) * r * 1.05, math.sin(a) * r * 1.05, h)]
    paint(hull(pts), shade(WHEAT, WHEAT_D, k=0.1))
    for e in range(ears):
        a = random.random() * 2 * math.pi; rr = r * (0.3 + random.random() * 0.6)
        ear(c + V(math.cos(a) * rr, math.sin(a) * rr, h - 0.01 + random.random() * 0.02))

def sheaf(c, lean=(0, 0), h=0.26, r=0.06):   # 곡식단 — 아래로 퍼진 줄기, 허리를 동인 띠, 위에 이삭 다발
    lx, ly = lean
    top = c + V(lx, ly, h)
    mid = c + V(lx * 0.55, ly * 0.55, h * 0.55)
    pts = [c + V(math.cos(a) * r, math.sin(a) * r, 0) for a in [k / 7 * 2 * math.pi for k in range(7)]]
    pts += [mid + V(math.cos(a) * r * 0.4, math.sin(a) * r * 0.4, 0) for a in [k / 7 * 2 * math.pi for k in range(7)]]
    paint(hull(pts), shade(WHEAT, WHEAT_D, k=0.1))
    pts = [mid + V(math.cos(a) * r * 0.4, math.sin(a) * r * 0.4, 0) for a in [k / 7 * 2 * math.pi for k in range(7)]]
    pts += [top + V(math.cos(a) * r * 0.85, math.sin(a) * r * 0.85, -0.02) for a in [k / 7 * 2 * math.pi for k in range(7)]]
    paint(hull(pts), shade(WHEAT, WHEAT_D, k=0.1))
    paint(loft([mid + V(math.cos(a) * r * 0.43, math.sin(a) * r * 0.43, 0) for a in [k / 8 * 2 * math.pi for k in range(8)]], 0.009, sides=3, closed=True, wob=0), solid(REED_D))   # 동인 띠
    for k in range(6):
        a = k / 6 * 2 * math.pi
        ear(top + V(math.cos(a) * r * 0.5, math.sin(a) * r * 0.5, -0.03), h=0.07)

def face(z, beard=None, hat=CLOTH, band=None):   # 머리 — 얼굴, 수염, 두건(띠)
    paint(blob((0.01, 0, z), (0.045, 0.043, 0.05), n=12, jitter=0.08), solid(SKIN, 0.05))
    if beard: paint(blob((0.035, 0, z - 0.025), (0.026, 0.03, 0.028), n=10, jitter=0.2), solid(beard, 0.06))
    paint(blob((-0.005, 0, z + 0.025), (0.055, 0.053, 0.036), n=12, jitter=0.1), shade(hat, hat))
    if band: paint(loft([V(0.01 + math.cos(t) * 0.052, math.sin(t) * 0.052, z + 0.035) for t in [k / 12 * 2 * math.pi for k in range(12)]], 0.007, sides=4, closed=True, wob=0), solid(band))

# ══ 세트 ① 밀밭과 일꾼 ══

# ── 익은 밀밭 — 일곱 줄(축 row0~6)이 차례로 바람에 물결친다. 앞쪽(−y)은 벤 그루터기 ──
def wheatfield():
    begin(201)
    rim = [V(math.cos(a) * 0.74 * (1 + (random.random() - 0.5) * 0.05), math.sin(a) * 0.46 * (1 + (random.random() - 0.5) * 0.05), 0) for a in [k / 16 * 2 * math.pi for k in range(16)]]
    paint(hull(rim + [v + V(0, 0, 0.025) for v in rim]), shade(SOIL, SOIL_D, k=0.08))   # 갈아 놓은 흙
    for k in range(14):   # 벤 그루터기(앞쪽)
        x = -0.6 + k * 0.09 + (random.random() - 0.5) * 0.03; y = -0.33 + (random.random() - 0.5) * 0.05
        for j in range(3): paint(cone(V(x + (random.random() - 0.5) * 0.03, y + (random.random() - 0.5) * 0.03, 0.02), V(x + (random.random() - 0.5) * 0.04, y + (random.random() - 0.5) * 0.04, 0.05 + random.random() * 0.02), 0.007, sides=3), solid(WHEAT_D, 0.12))
    # 10/1 사용자: 밀 덩어리는 보기 좋지 않다, 듬성듬성이어도 밀 같게 — 줄기 하나 = 세모 가시(면 4) + 이삭(면 8), 줄마다 흩어 심고 조금씩 기울여 이삭이 고개를 숙인다
    for i in range(7):
        y = -0.25 + i * 0.085
        part('row%d' % i, loc=(0, y, 0.02))
        half = 0.68 * math.sqrt(max(0.0, 1 - (y / 0.44) ** 2))
        n = int(half * 2 / 0.036)
        for k in range(n):
            x = -half + (k + 0.5) * (half * 2 / n) + (random.random() - 0.5) * 0.02
            yy = y + (random.random() - 0.5) * 0.06
            stalk(V(x, yy, 0.02), 0.24 + random.random() * 0.08)
        base()
    finish('wheatfield', OUT)

# ── 낫 든 일꾼 — 몸을 숙여 왼손으로 밀을 움켜쥐고 오른손 낫을 휘두른다(축 arms) ──
def reaper():
    begin(202)
    TUN, TUN_D = lin(0xc8b48a), lin(0xa08c64)
    for y in (-1, 1):   # 다리 — 벌려 디딘다
        paint(cyl((0, y * 0.04, 0.2), (0.01 * y, y * 0.06, 0.02), 0.024, sides=5), shade(TUN, TUN_D))
        paint(blob((0.02, y * 0.06, 0.012), (0.03, 0.018, 0.012), n=6, jitter=0.1), solid(lin(0x6b4a2e)))
    paint(loft([(0, 0, 0.14), (0.04, 0, 0.27), (0.1, 0, 0.36)], [0.07, 0.068, 0.058], sides=7, wob=0.06), shade(TUN, TUN_D))   # 앞으로 숙인 몸
    paint(loft([(0.0, 0, 0.2), (0.02, 0, 0.23)], [0.074, 0.074], sides=7, wob=0.02), solid(lin(0x7a4a2a)))   # 허리띠
    part('head', loc=(0.12, 0, 0.38))
    paint(blob((0.15, 0, 0.41), (0.045, 0.043, 0.048), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(blob((0.175, 0, 0.385), (0.024, 0.028, 0.026), n=10, jitter=0.2), solid(lin(0x4a3220), 0.06))
    paint(blob((0.14, 0, 0.44), (0.05, 0.05, 0.03), n=12, jitter=0.1), solid(CLOTH, 0.05))
    base()
    part('arms', loc=(0.1, 0, 0.35))
    # 왼팔 — 앞으로 뻗어 밀 한 움큼을 쥔다
    paint(loft([(0.1, 0.06, 0.35), (0.17, 0.08, 0.28), (0.23, 0.05, 0.22)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(TUN, TUN_D))
    paint(blob((0.24, 0.05, 0.215), (0.017, 0.017, 0.017), n=6, jitter=0), solid(SKIN))
    for k in range(4): ear(V(0.24 + (k - 1.5) * 0.008, 0.05, 0.225), h=0.06, w=0.01)
    # 오른팔 — 낫
    paint(loft([(0.1, -0.06, 0.35), (0.15, -0.1, 0.27), (0.2, -0.08, 0.2)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(TUN, TUN_D))
    paint(blob((0.205, -0.08, 0.195), (0.017, 0.017, 0.017), n=6, jitter=0), solid(SKIN))
    paint(cyl((0.2, -0.08, 0.17), (0.21, -0.08, 0.24), 0.008, sides=4), solid(WOOD))   # 낫 자루
    blade = [V(0.21, -0.08, 0.24)] + [V(0.21 + 0.06 * math.sin(t), -0.08 - 0.05 * (1 - math.cos(t)), 0.24 + 0.015 * math.sin(t)) for t in [k / 6 * 2.4 for k in range(1, 7)]]
    paint(loft(blade, [0.009, 0.008, 0.007, 0.006, 0.005, 0.004, 0.002], sides=3, ell=(1.0, 0.3), wob=0), solid(lin(0xc8ccd0)), METAL)
    base()
    finish('reaper', OUT)

# ── 이삭 줍는 여인(룻) — 허리를 굽혀 이삭을 줍고, 일어나 품에 안는다(축 torso) ──
def gleaner():
    begin(203)
    DRESS, DRESS_D = lin(0x9a5a6a), lin(0x7a4252)
    SCARF = lin(0xe8d6b0)
    paint(loft([(0, 0, 0.0), (0, 0, 0.12), (0, 0, 0.21)], [0.085, 0.07, 0.06], sides=8, wob=0.05), shade(DRESS, DRESS_D))   # 긴 치마
    for y in (-1, 1): paint(blob((0.05, y * 0.035, 0.01), (0.028, 0.017, 0.011), n=6, jitter=0.1), solid(lin(0x6b4a2e)))
    part('torso', loc=(0, 0, 0.2))
    paint(loft([(0, 0, 0.2), (0, 0, 0.33), (0.0, 0, 0.4)], [0.06, 0.06, 0.05], sides=7, wob=0.05), shade(DRESS, DRESS_D))
    paint(blob((0.01, 0, 0.45), (0.042, 0.04, 0.046), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(loft([(-0.01, 0, 0.5), (-0.03, 0, 0.42), (-0.045, 0, 0.32)], [0.05, 0.055, 0.05], sides=7, ell=(1.0, 1.1), wob=0.05), solid(SCARF, 0.05))   # 머리 수건
    paint(blob((-0.002, 0, 0.475), (0.05, 0.05, 0.035), n=12, jitter=0.08), solid(SCARF, 0.05))
    # 왼팔 — 주운 이삭 한 다발을 안았다
    paint(loft([(0.0, 0.06, 0.38), (0.05, 0.065, 0.31), (0.06, 0.02, 0.3)], [0.02, 0.019, 0.016], sides=5, wob=0), shade(DRESS, DRESS_D))
    for k in range(5): ear(V(0.06 + (random.random() - 0.5) * 0.02, 0.03 + (k - 2) * 0.008, 0.3), h=0.07, w=0.011)
    paint(cyl((0.06, 0.03, 0.27), (0.06, 0.03, 0.31), 0.02, sides=5), shade(WHEAT, WHEAT_D))
    # 오른팔 — 아래로 뻗어 이삭을 줍는다
    paint(loft([(0.0, -0.06, 0.38), (0.04, -0.07, 0.3), (0.08, -0.06, 0.24)], [0.02, 0.019, 0.016], sides=5, wob=0), shade(DRESS, DRESS_D))
    paint(blob((0.085, -0.06, 0.235), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    base()
    for k in range(5): ear(V(0.12 + random.random() * 0.06, -0.06 + (random.random() - 0.5) * 0.1, 0.0), h=0.05, w=0.01)   # 떨어진 이삭 몇
    finish('gleaner', OUT)

# ── 보아스 — 밭 주인, 일꾼들에게 「여호와께서 너희와 함께하시기를」(룻 2:4) 오른손을 든다(축 arm) ──
def boaz():
    begin(204)
    ROBE, ROBE_D = lin(0x6a3a5a), lin(0x4f2a44)
    paint(loft([(0, 0, 0.0), (0, 0, 0.2), (0, 0, 0.42)], [0.085, 0.074, 0.058], sides=8, wob=0.05), shade(ROBE, ROBE_D))
    paint(loft([(0.0, 0, 0.18), (0.005, 0, 0.21)], [0.078, 0.076], sides=8, wob=0.02), solid(lin(0xc9a050)))   # 금빛 띠
    paint(blob((0.035, 0, 0.012), (0.04, 0.05, 0.012), n=6, jitter=0.1), solid(lin(0x5a3a22)))
    # 왼팔 — 지팡이
    paint(loft([(0, 0.065, 0.38), (0.03, 0.08, 0.3), (0.07, 0.075, 0.27)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(ROBE, ROBE_D))
    paint(blob((0.075, 0.075, 0.27), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    paint(cyl((0.08, 0.075, 0.0), (0.08, 0.075, 0.5), 0.009, sides=5), shade(WOOD_L, WOOD))
    part('head', loc=(0.0, 0, 0.43))
    face(0.48, beard=lin(0xcfc6b4), hat=lin(0xf0e6d0), band=lin(0x6a3a5a))
    base()
    part('arm', loc=(0.0, -0.065, 0.39))   # 오른팔 — 축은 어깨, 들어 올려 축복한다
    paint(loft([(0, -0.065, 0.39), (0.02, -0.08, 0.3), (0.04, -0.075, 0.23)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(ROBE, ROBE_D))
    paint(blob((0.045, -0.075, 0.22), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    base()
    finish('boaz', OUT)

# ── 곡식단 — 세 단을 서로 기대 세우고 하나는 눕혔다 ──
def sheaves():
    begin(205)
    sheaf(V(-0.06, 0.0, 0), lean=(0.04, 0.0)); sheaf(V(0.05, 0.05, 0), lean=(-0.03, -0.03)); sheaf(V(0.04, -0.06, 0), lean=(-0.03, 0.04))
    # 누운 단 — 옆으로
    c = V(0.0, -0.2, 0.05)
    pts = [c + V(-0.13, math.cos(a) * 0.045, math.sin(a) * 0.045) for a in [k / 7 * 2 * math.pi for k in range(7)]] + [c + V(0.02, math.cos(a) * 0.022, math.sin(a) * 0.022) for a in [k / 7 * 2 * math.pi for k in range(7)]]
    paint(hull(pts), shade(WHEAT, WHEAT_D, k=0.1))
    pts = [c + V(0.02, math.cos(a) * 0.022, math.sin(a) * 0.022) for a in [k / 7 * 2 * math.pi for k in range(7)]] + [c + V(0.12, math.cos(a) * 0.05, math.sin(a) * 0.05) for a in [k / 7 * 2 * math.pi for k in range(7)]]
    paint(hull(pts), shade(WHEAT, WHEAT_D, k=0.1))
    paint(loft([c + V(0.02, math.cos(a) * 0.025, math.sin(a) * 0.025) for a in [k / 8 * 2 * math.pi for k in range(8)]], 0.008, sides=3, closed=True, wob=0), solid(REED_D))
    for k in range(5):
        a = k / 5 * 2 * math.pi
        paint(hull([c + V(0.12, math.cos(a) * 0.03, math.sin(a) * 0.03), c + V(0.19, math.cos(a) * 0.035, math.sin(a) * 0.035), c + V(0.15, math.cos(a) * 0.03 + 0.012, math.sin(a) * 0.03), c + V(0.15, math.cos(a) * 0.03, math.sin(a) * 0.03 + 0.012)]), shade(EAR, WHEAT))
    finish('sheaves', OUT)

# ── 이삭 바구니 — 갈대로 엮은 바구니에 주운 이삭 ──
def gleanbasket():
    begin(206)
    pts = [V(math.cos(a) * r, math.sin(a) * r, z) for a in [k / 10 * 2 * math.pi for k in range(10)] for r, z in ((0.07, 0.0), (0.095, 0.11))]
    paint(hull(pts), shade(REED, REED_D, k=0.1))
    for z in (0.04, 0.08): paint(loft([V(math.cos(a) * (0.072 + z * 0.22), math.sin(a) * (0.072 + z * 0.22), z) for a in [k / 12 * 2 * math.pi for k in range(12)]], 0.0035, sides=3, closed=True, wob=0), solid(REED_D))
    paint(blob((0, 0, 0.11), (0.08, 0.08, 0.025), n=10, jitter=0.2), shade(WHEAT, WHEAT_D))
    for k in range(9):
        a = random.random() * 2 * math.pi; r = random.random() * 0.06
        ear(V(math.cos(a) * r, math.sin(a) * r, 0.115), h=0.06)
    finish('gleanbasket', OUT)

# ── 새참 — 그늘에 펼친 보자기 위 떡과 볶은 곡식, 초 그릇, 물동이(룻 2:14 「떡을 먹으며 네 떡 조각을 초에 찍으라」) ──
def meal():
    begin(207)
    cl = [V(math.cos(a) * 0.2 * (1 + (random.random() - 0.5) * 0.08), math.sin(a) * 0.15 * (1 + (random.random() - 0.5) * 0.08), 0) for a in [k / 12 * 2 * math.pi for k in range(12)]]
    paint(hull(cl + [v + V(0, 0, 0.008) for v in cl]), shade(lin(0xd8c8a0), lin(0xbca878)))
    for (x, y) in ((-0.08, 0.04), (-0.02, 0.07), (-0.1, -0.03)):
        paint(blob((x, y, 0.025), (0.035, 0.035, 0.016), n=10, jitter=0.12), shade(BREAD, BREAD_D))
    paint(blob((0.06, 0.05, 0.016), (0.045, 0.04, 0.012), n=10, jitter=0.35), shade(lin(0xc89a4a), lin(0x9a7032)))   # 볶은 곡식
    bowl = [V(math.cos(a) * r, math.sin(a) * r, z) for a in [k / 9 * 2 * math.pi for k in range(9)] for r, z in ((0.018, 0.008), (0.035, 0.035))]
    paint(hull([v + V(0.07, -0.05, 0) for v in bowl]), shade(lin(0xb0704a), lin(0x8a5236)))
    paint(blob((0.07, -0.05, 0.034), (0.03, 0.03, 0.004), n=8, jitter=0), solid(lin(0x7a3a2a)))   # 초
    jar = [(0.15, 0.06, 0.0), (0.15, 0.06, 0.05), (0.15, 0.06, 0.11), (0.15, 0.06, 0.15)]
    paint(loft(jar, [0.03, 0.045, 0.03, 0.022], sides=8, wob=0.03), shade(lin(0xc4825a), lin(0x9a6040)))
    finish('meal', OUT)

# ── 그늘막 — 네 기둥에 나뭇가지를 얹은 쉼터(룻 2:7 「잠시 쉰 외에는」) ──
def booth():
    begin(208)
    for x in (-0.28, 0.28):
        for y in (-0.2, 0.2):
            paint(cyl((x, y, 0), (x + (random.random() - 0.5) * 0.02, y, 0.46), 0.016, sides=5, wob=0.1), shade(WOOD_L, WOOD))
    for x in (-0.3, 0.3): paint(cyl((x, -0.24, 0.45), (x, 0.24, 0.46), 0.012, sides=4), solid(WOOD))
    for y in (-0.22, 0.0, 0.22): paint(cyl((-0.34, y, 0.46), (0.34, y, 0.47), 0.01, sides=4), solid(WOOD_D))
    for k in range(10):   # 얹은 가지와 잎
        x = -0.3 + random.random() * 0.6; y = -0.22 + random.random() * 0.44
        paint(blob((x, y, 0.49), (0.12, 0.09, 0.03), n=10, jitter=0.35), shade(LEAF, LEAF_D, k=0.12))
    finish('booth', OUT)

# ── 경계석 — 밭의 경계를 표시한 선 돌과 작은 돌무더기(신 19:14 「이웃의 경계표를 옮기지 말라」) ──
def boundarystone():
    begin(209)
    paint(hull([V(x, y, z) for x in (-0.04, 0.04) for y in (-0.03, 0.03) for z in (0,)] + [V(x * 0.8, y * 0.8, 0.22 + (random.random() - 0.5) * 0.03) for x in (-0.04, 0.04) for y in (-0.03, 0.03)] + [V(0, 0, 0.25)]), shade(STONE, STONE_D, k=0.1))
    for k in range(6):
        a = random.random() * 2 * math.pi; r = 0.07 + random.random() * 0.04
        paint(blob((math.cos(a) * r, math.sin(a) * r, 0.015), (0.03, 0.025, 0.02), n=8, jitter=0.25), shade(STONE, STONE_D))
    finish('boundarystone', OUT)

# ══ 세트 ② 타작마당 (룻 3 · 신 25:4 「곡식을 떠는 소에게 망을 씌우지 말지니라」) ══
STRAW, STRAW_D = lin(0xe8d498), lin(0xc4ae70)
EARTH, EARTH_D = lin(0xcbb08a), lin(0xa88c64)
OX, OX_D = lin(0x8a6a4e), lin(0x6a4e38)
GRAIN, GRAIN_D = lin(0xd8a84a), lin(0xb08232)

# ── 타작마당 — 단단히 다진 둥근 흙바닥, 둘레에 돌, 흩어진 짚과 낟알 ──
def threshingfloor():
    begin(211)
    rim = [V(math.cos(a) * 0.76, math.sin(a) * 0.76, 0) for a in [k / 24 * 2 * math.pi for k in range(24)]]
    paint(hull(rim + [V(v.x * 0.98, v.y * 0.98, 0.03) for v in rim]), shade(EARTH, EARTH_D, k=0.06))
    for k in range(20):   # 둘레 돌
        a = k / 20 * 2 * math.pi + random.random() * 0.1
        paint(blob((math.cos(a) * 0.79, math.sin(a) * 0.79, 0.025), (0.055, 0.045, 0.035), n=8, jitter=0.25), shade(STONE, STONE_D))
    for k in range(40):   # 흩어진 짚
        a = random.random() * 2 * math.pi; r = 0.15 + random.random() * 0.55; c = V(math.cos(a) * r, math.sin(a) * r, 0.032); d = random.random() * 2 * math.pi
        paint(cone(c, c + V(math.cos(d) * 0.07, math.sin(d) * 0.07, 0.004), 0.007, sides=3), solid(STRAW, 0.12))
    for k in range(6):   # 떨어진 낟알 무더기
        a = random.random() * 2 * math.pi; r = random.random() * 0.5
        paint(blob((math.cos(a) * r, math.sin(a) * r, 0.033), (0.05, 0.04, 0.008), n=8, jitter=0.3), shade(WHEAT, WHEAT_D))
    finish('threshingfloor', OUT)

# ── 소와 타작 썰매 — 멍에 맨 소가 돌 박힌 썰매를 끈다. 다리 축 leg0~3 · 머리 head · 꼬리 tail (망을 씌우지 않았다 — 가끔 고개 숙여 먹는다) ──
def ox():
    begin(212)
    body = [V(x, y, z) for x in (-0.2, 0.18) for y in (-0.09, 0.09) for z in (0.2, 0.36)] + [V(0.22, 0, 0.3), V(-0.24, 0, 0.3), V(0.12, 0, 0.4), V(0.0, 0.1, 0.27), V(0.0, -0.1, 0.27)]
    paint(hull(body), shade(OX, OX_D, k=0.08))
    paint(blob((0.13, 0, 0.38), (0.07, 0.07, 0.04), n=10, jitter=0.15), shade(OX, OX_D))   # 등혹
    paint(cyl((0.17, -0.16, 0.42), (0.17, 0.16, 0.42), 0.014, sides=5), solid(WOOD))   # 멍에
    for y in (-0.06, 0.06): paint(cyl((0.17, y, 0.42), (0.17, y, 0.3), 0.006, sides=3), solid(WOOD_D))
    for y in (-0.15, 0.15): paint(cyl((0.17, y, 0.41), (-0.42, y * 0.8, 0.07), 0.008, sides=4), solid(WOOD_D))   # 끄는 막대
    # 타작 썰매 — 판자 밑에 돌을 박았다, 위에 돌을 얹어 누른다
    paint(hull([V(x, y, z) for x in (-0.66, -0.4) for y in (-0.15, 0.15) for z in (0.03, 0.06)] + [V(-0.38, 0, 0.08)]), shade(WOOD_L, WOOD))
    for k in range(5): paint(blob((-0.6 + random.random() * 0.16, (random.random() - 0.5) * 0.2, 0.08), (0.035, 0.03, 0.025), n=8, jitter=0.25), shade(STONE, STONE_D))
    for k in range(10): paint(cone(V(-0.66 + random.random() * 0.28, (random.random() - 0.5) * 0.3, 0.01), V(-0.72 + random.random() * 0.3, (random.random() - 0.5) * 0.36, 0.0), 0.008, sides=3), solid(STRAW, 0.1))
    part('head', loc=(0.22, 0, 0.33))
    paint(hull([V(0.2, y, z) for y in (-0.05, 0.05) for z in (0.28, 0.36)] + [V(0.36, y, z) for y in (-0.04, 0.04) for z in (0.22, 0.28)]), shade(OX, OX_D, k=0.08))
    paint(blob((0.36, 0, 0.24), (0.03, 0.04, 0.025), n=8, jitter=0.1), solid(lin(0x4a3628)))
    for y in (-1, 1):
        paint(loft([(0.24, y * 0.05, 0.36), (0.25, y * 0.1, 0.38), (0.27, y * 0.12, 0.42)], [0.012, 0.009, 0.004], sides=4, wob=0), solid(lin(0xe0d4b8)))   # 뿔
        paint(blob((0.24, y * 0.065, 0.34), (0.015, 0.025, 0.01), n=6, jitter=0.1), solid(OX_D))   # 귀
    base()
    for i, (x, y) in enumerate(((0.13, -0.06), (0.13, 0.06), (-0.15, -0.06), (-0.15, 0.06))):
        part('leg%d' % i, loc=(x, y, 0.22))
        paint(cyl((x, y, 0.23), (x, y, 0.02), 0.034, 0.024, sides=5), shade(OX, OX_D))
        paint(blob((x, y, 0.015), (0.022, 0.02, 0.015), n=6, jitter=0.1), solid(lin(0x3a2a20)))
        base()
    part('tail', loc=(-0.24, 0, 0.33))
    paint(loft([(-0.24, 0, 0.33), (-0.27, 0, 0.22), (-0.27, 0, 0.12)], [0.009, 0.007, 0.006], sides=4, wob=0), solid(OX_D))
    paint(blob((-0.27, 0, 0.1), (0.015, 0.015, 0.03), n=6, jitter=0.2), solid(lin(0x3a2a20)))
    base()
    finish('ox', OUT)

# ── 키질하는 사람 — 쇠스랑으로 떤 곡식을 바람에 높이 던진다(축 arms). 쭉정이는 바람에 날리고 알곡은 떨어진다(마 3:12) ──
def winnower():
    begin(213)
    TUN, TUN_D = lin(0xb8c4a0), lin(0x92a07a)
    for y in (-1, 1):
        paint(cyl((0, y * 0.035, 0.2), (0.0, y * 0.05, 0.02), 0.024, sides=5), shade(TUN, TUN_D))
        paint(blob((0.02, y * 0.05, 0.012), (0.03, 0.018, 0.012), n=6, jitter=0.1), solid(lin(0x6b4a2e)))
    paint(loft([(0, 0, 0.14), (0, 0, 0.3), (0.0, 0, 0.42)], [0.07, 0.066, 0.055], sides=7, wob=0.06), shade(TUN, TUN_D))
    paint(loft([(0.0, 0, 0.19), (0.0, 0, 0.22)], [0.073, 0.073], sides=7, wob=0.02), solid(lin(0x7a4a2a)))
    part('head', loc=(0.0, 0, 0.43))
    face(0.48, beard=lin(0x5a3a22), hat=CLOTH)
    base()
    part('arms', loc=(0.0, 0, 0.38))   # 두 팔과 쇠스랑 — 아래에서 떠서 위로 던진다
    for y in (-1, 1):
        paint(loft([(0, y * 0.065, 0.38), (0.06, y * 0.06, 0.32), (0.11, y * 0.03, 0.3)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(TUN, TUN_D))
        paint(blob((0.115, y * 0.03, 0.3), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    paint(cyl((0.02, 0, 0.24), (0.36, 0, 0.42), 0.008, sides=4), solid(WOOD_L))   # 자루
    for d in (-0.03, -0.01, 0.01, 0.03):   # 나무 갈퀴 살
        paint(cyl((0.36, d, 0.42), (0.43, d * 1.3, 0.47), 0.004, sides=3), solid(WOOD))
    paint(blob((0.41, 0, 0.46), (0.05, 0.04, 0.025), n=8, jitter=0.35), shade(STRAW, STRAW_D))   # 떠 올린 짚
    base()
    finish('winnower', OUT)

# ── 곡식 더미 — 키질해 모은 알곡, 꽂아 둔 나무 삽 ──
def grainheap():
    begin(214)
    rings = [(0.25, 0.0), (0.22, 0.05), (0.15, 0.12), (0.07, 0.17), (0.0, 0.19)]   # 감자처럼 보였다 → 쌓인 더미(원뿔)
    pts = [V(math.cos(a) * r * (1 + (random.random() - 0.5) * 0.08), math.sin(a) * r * 0.85 * (1 + (random.random() - 0.5) * 0.08), z) for r, z in rings for a in [k / 12 * 2 * math.pi for k in range(12)]]
    paint(hull(pts), shade(GRAIN, GRAIN_D, k=0.1))
    for k in range(18):
        a = random.random() * 2 * math.pi; r = random.random() * 0.2
        paint(blob((math.cos(a) * r, math.sin(a) * r * 0.85, 0.19 * (1 - r / 0.25) + 0.005), (0.018, 0.018, 0.008), n=6, jitter=0.3), solid(lin(0xe6bc5c), 0.1))
    paint(cyl((0.12, 0.05, 0.14), (0.2, 0.08, 0.42), 0.009, sides=4), solid(WOOD_L))   # 나무 삽 자루
    paint(hull([V(0.11 + dx, 0.05 + dy, z) for dx in (-0.01, 0.01) for dy in (-0.04, 0.04) for z in (0.08, 0.15)]), solid(WOOD))
    finish('grainheap', OUT)

# ── 곡식 더미 곁에 누운 보아스 — 겉옷을 덮고 잠들었다, 숨 쉰다(룻 3:7 「곡식 단 더미의 끝에 눕는지라」) — 축 body ──
def restboaz():
    begin(215)
    ROBE, ROBE_D = lin(0x6a3a5a), lin(0x4f2a44)
    paint(hull([V(x, y, z) for x in (-0.25, 0.25) for y in (-0.08, 0.08) for z in (0.0, 0.02)]), shade(lin(0xc8b490), lin(0xa8946e)))   # 깐 짚 거적
    part('body', loc=(0, 0, 0.02))
    paint(blob((-0.12, 0, 0.055), (0.12, 0.06, 0.04), n=16, jitter=0.12), shade(ROBE, ROBE_D))   # 덮은 겉옷 — 다리
    paint(blob((0.06, 0, 0.07), (0.1, 0.075, 0.055), n=16, jitter=0.12), shade(ROBE, ROBE_D))   # 몸
    base()
    paint(blob((-0.24, 0, 0.04), (0.03, 0.045, 0.025), n=8, jitter=0.15), solid(lin(0x5a3a22)))   # 발
    paint(blob((0.21, 0, 0.04), (0.05, 0.07, 0.03), n=10, jitter=0.2), shade(WHEAT, WHEAT_D))   # 베개 삼은 곡식단
    paint(blob((0.18, 0, 0.1), (0.042, 0.042, 0.04), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(blob((0.2, 0.0, 0.13), (0.045, 0.048, 0.025), n=12, jitter=0.1), solid(lin(0xf0e6d0), 0.05))
    paint(blob((0.15, 0, 0.09), (0.03, 0.035, 0.02), n=8, jitter=0.2), solid(lin(0xcfc6b4), 0.06))   # 흰 수염
    finish('restboaz', OUT)

# ── 짚더미 — 떨고 남은 짚을 쌓았다 ──
def strawpile():
    begin(216)
    paint(blob((0, 0, 0.1), (0.2, 0.17, 0.12), n=26, jitter=0.3), shade(STRAW, STRAW_D, k=0.12))
    for k in range(14):
        a = random.random() * 2 * math.pi; c = V(math.cos(a) * 0.16, math.sin(a) * 0.13, 0.06 + random.random() * 0.12)
        paint(cone(c, c + V(math.cos(a) * 0.08, math.sin(a) * 0.08, 0.03), 0.008, sides=3), solid(STRAW, 0.1))
    finish('strawpile', OUT)

# ── 곡식 자루 — 묶은 자루 둘, 입을 벌린 자루 하나 ──
def sacks():
    begin(217)
    SACK, SACK_D = lin(0xcdb98e), lin(0xa8956a)
    for (x, y) in ((-0.07, 0.03), (0.06, 0.06)):
        paint(loft([(x, y, 0), (x, y, 0.1), (x, y, 0.17), (x, y, 0.2)], [0.06, 0.07, 0.04, 0.025], sides=8, wob=0.08), shade(SACK, SACK_D))
        paint(loft([V(x + math.cos(a) * 0.035, y + math.sin(a) * 0.035, 0.175) for a in [k / 8 * 2 * math.pi for k in range(8)]], 0.007, sides=3, closed=True, wob=0), solid(lin(0x8a6a40)))
    x, y = 0.0, -0.09
    paint(loft([(x, y, 0), (x, y, 0.09), (x, y, 0.13)], [0.06, 0.07, 0.065], sides=8, wob=0.08), shade(SACK, SACK_D))
    paint(blob((x, y, 0.13), (0.055, 0.055, 0.02), n=10, jitter=0.25), shade(GRAIN, GRAIN_D))
    finish('sacks', OUT)

# ── 됫박과 체 — 곡식을 되는 나무 됫박(룻 3:15 「보리를 여섯 번 되어」)과 기대 세운 체 ──
def measure():
    begin(218)
    pts = [V(math.cos(a) * r, math.sin(a) * r, z) for a in [k / 10 * 2 * math.pi for k in range(10)] for r, z in ((0.07, 0.0), (0.075, 0.09))]
    paint(hull(pts), shade(WOOD_L, WOOD, k=0.1))
    paint(blob((0, 0, 0.09), (0.065, 0.065, 0.015), n=10, jitter=0.2), shade(GRAIN, GRAIN_D))
    for z in (0.02, 0.07): paint(loft([V(math.cos(a) * 0.076, math.sin(a) * 0.076, z) for a in [k / 12 * 2 * math.pi for k in range(12)]], 0.004, sides=3, closed=True, wob=0), solid(WOOD_D))
    c = V(0.15, 0.0, 0.0)   # 체 — 바닥에 눕힌 둥근 나무 테, 촘촘한 그물(세워 두니 거울처럼 보였다 → 눕히고 줄을 그었다)
    ring = [c + V(math.cos(a) * 0.08, math.sin(a) * 0.08, 0.02) for a in [k / 14 * 2 * math.pi for k in range(14)]]
    paint(hull(ring + [v + V(0, 0, -0.02) for v in ring]), shade(WOOD_L, WOOD))
    paint(hull([v + V(0, 0, 0.003) for v in ring]), solid(lin(0x8a7450), 0.05))
    for k in range(-3, 4):
        w = math.sqrt(max(0, 0.075 ** 2 - (k * 0.02) ** 2))
        paint(cyl(c + V(k * 0.02, -w, 0.025), c + V(k * 0.02, w, 0.025), 0.0025, sides=3), solid(lin(0xd6c59a)))
        paint(cyl(c + V(-w, k * 0.02, 0.026), c + V(w, k * 0.02, 0.026), 0.0025, sides=3), solid(lin(0xd6c59a)))
    finish('measure', OUT)

# ── 키와 쇠스랑 — 말뚝에 기대 세운 나무 키(삽 모양)와 쇠스랑 ──
def winnowtools():
    begin(219)
    paint(cyl((0, 0, 0), (0, 0, 0.36), 0.02, sides=6, wob=0.1), shade(WOOD_L, WOOD))
    paint(cyl((0.07, 0.03, 0.0), (0.0, 0.015, 0.44), 0.008, sides=4), solid(WOOD_L))   # 쇠스랑 자루
    for d in (-0.03, -0.01, 0.01, 0.03): paint(cyl((0.0, 0.015 + d, 0.44), (-0.012, 0.015 + d * 1.3, 0.52), 0.004, sides=3), solid(WOOD))
    paint(cyl((-0.08, -0.03, 0.12), (-0.01, -0.025, 0.42), 0.008, sides=4), solid(WOOD_L))   # 키 자루
    blade = [V(-0.13 + dz * 0.2, -0.03 + dy, dz) for dy in (-0.06, 0.06) for dz in (0.0, 0.13)] + [V(-0.12, -0.03 + dy, 0.0) for dy in (-0.07, 0.07)]
    paint(hull(blade + [v + V(0.012, 0, 0) for v in blade]), shade(lin(0xc8a46a), lin(0xa0804a)))   # 넓적한 나무 키
    finish('winnowtools', OUT)

# ══ 세트 ③ 곳간과 집 (마 13:30 「곡식은 모아 내 곳간에 넣으라」 · 룻 4 베들레헴) ══
MUDW, MUDW_D = lin(0xc4a27a), lin(0x9c7e58)   # 처음엔 밝은 베이지라 천막(유르트)처럼 보였다 → 흙벽돌 빛
CLAY, CLAY_D = lin(0xc4825a), lin(0x9a6040)
DONK, DONK_D = lin(0x8f8a84), lin(0x6e6a64)

# ── 곳간 — 돌로 쌓은 네모난 곳간, 평평한 지붕 위에도 곡식단. 앞에 나무 문(축 door — 왼쪽 경첩, 큰 세트에서 열린다)
#    (처음엔 둥근 벌집 곳간이었는데 천막처럼 보였다 → 네모난 돌집)
def granary():
    begin(221)
    W2, D2, H = 0.32, 0.24, 0.36
    paint(hull([V(x, y, z) for x in (-W2, W2) for y in (-D2, D2) for z in (0.0, H)]), shade(MUDW, MUDW_D, k=0.05))
    for k in range(46):   # 벽에 박힌 돌(앞·옆)
        side = random.random()
        if side < 0.45: c = V(-W2 + random.random() * W2 * 2, -D2 - 0.004, 0.03 + random.random() * (H - 0.06))
        elif side < 0.72: c = V(-W2 - 0.004, -D2 + random.random() * D2 * 2, 0.03 + random.random() * (H - 0.06))
        else: c = V(W2 + 0.004, -D2 + random.random() * D2 * 2, 0.03 + random.random() * (H - 0.06))
        if abs(c.x) < 0.13 and c.y < -D2 + 0.01 and c.z < 0.3: continue   # 문 자리는 비운다
        paint(blob(c, (0.035, 0.035, 0.026), n=6, jitter=0.25), shade(STONE, STONE_D))
    paint(hull([V(x, y, z) for x in (-W2 - 0.03, W2 + 0.03) for y in (-D2 - 0.03, D2 + 0.03) for z in (H, H + 0.025)]), shade(lin(0x9a7a50), lin(0x7a5c38)))   # 지붕
    for x in (-0.24, -0.08, 0.08, 0.24): paint(cyl((x, -D2 - 0.04, H + 0.005), (x, D2 + 0.04, H + 0.005), 0.012, sides=4), solid(WOOD_D))   # 들보 끝
    for k in range(4): sheaf(V(-0.18 + k * 0.12, 0.05 + (random.random() - 0.5) * 0.06, H + 0.025), lean=((random.random() - 0.5) * 0.04, 0), h=0.18, r=0.045)
    paint(hull([V(x, -D2 + dy, z) for x in (-0.11, 0.11) for dy in (-0.006, 0.02) for z in (0.0, 0.29)]), solid(lin(0x3a2a1e)))   # 문 안 어둠
    for x in (-0.125, 0.125): paint(cyl((x, -D2 - 0.012, 0.0), (x, -D2 - 0.012, 0.31), 0.016, sides=4), solid(WOOD_D))
    paint(cyl((-0.15, -D2 - 0.012, 0.31), (0.15, -D2 - 0.012, 0.31), 0.02, sides=4), solid(WOOD_D))   # 문 위 인방
    part('door', loc=(-0.11, -D2 - 0.012, 0.0))
    paint(hull([V(x, -D2 - 0.012 + dy, z) for x in (-0.11, 0.11) for dy in (-0.012, 0.0) for z in (0.0, 0.29)]), shade(WOOD_L, WOOD, k=0.1))
    for z in (0.07, 0.22): paint(cyl((-0.1, -D2 - 0.027, z), (0.1, -D2 - 0.027, z), 0.008, sides=3), solid(WOOD_D))
    base()
    finish('granary', OUT)

# ── 곡식 수레 — 두 바퀴(축 wheelL·wheelR), 곡식단을 가득 실었다 ──
def cart():
    begin(222)
    paint(hull([V(x, y, z) for x in (-0.2, 0.2) for y in (-0.14, 0.14) for z in (0.12, 0.15)]), shade(WOOD_L, WOOD, k=0.1))   # 짐칸 바닥
    for y in (-0.14, 0.14): paint(hull([V(x, y + dy, z) for x in (-0.2, 0.2) for dy in (-0.008, 0.008) for z in (0.15, 0.22)]), shade(WOOD_L, WOOD))
    for x in (-0.2, 0.2): paint(hull([V(x + dx, y, z) for dx in (-0.008, 0.008) for y in (-0.14, 0.14) for z in (0.15, 0.2)]), shade(WOOD_L, WOOD))
    for y in (-0.06, 0.06): paint(cyl((0.2, y, 0.14), (0.52, y * 0.7, 0.12), 0.011, sides=4), solid(WOOD_D))   # 끌채
    paint(cyl((0.0, -0.19, 0.12), (0.0, 0.19, 0.12), 0.012, sides=5), solid(WOOD_D))   # 굴대
    for k in range(5): sheaf(V(-0.14 + k * 0.07, (random.random() - 0.5) * 0.08, 0.15), lean=((random.random() - 0.5) * 0.05, (random.random() - 0.5) * 0.05), h=0.2, r=0.05)
    for y, nm in ((-0.17, 'wheelL'), (0.17, 'wheelR')):
        part(nm, loc=(0.0, y, 0.12))
        rim = [V(math.cos(a) * 0.115, y, 0.12 + math.sin(a) * 0.115) for a in [k / 14 * 2 * math.pi for k in range(14)]]
        paint(loft(rim, 0.014, sides=4, closed=True, wob=0), shade(WOOD, WOOD_D))
        for k in range(4):
            a = k / 4 * math.pi
            paint(cyl((math.cos(a) * 0.11, y, 0.12 + math.sin(a) * 0.11), (-math.cos(a) * 0.11, y, 0.12 - math.sin(a) * 0.11), 0.007, sides=3), solid(WOOD))
        paint(cyl((0, y - 0.015, 0.12), (0, y + 0.015, 0.12), 0.025, sides=6), solid(WOOD_D))
        base()
    finish('cart', OUT)

# ── 나귀 — 양옆에 곡식 바구니를 진 나귀. 다리 leg0~3 · 머리 head(긴 귀) · 꼬리 tail ──
def donkey():
    begin(223)
    paint(hull([V(x, y, z) for x in (-0.15, 0.13) for y in (-0.065, 0.065) for z in (0.17, 0.29)] + [V(0.16, 0, 0.25), V(-0.18, 0, 0.24)]), shade(DONK, DONK_D, k=0.08))
    paint(blob((0.0, 0, 0.3), (0.1, 0.075, 0.02), n=8, jitter=0.1), solid(lin(0x9a5a3a)))   # 안장 담요
    for y in (-1, 1):   # 바구니
        pts = [V(math.cos(a) * 0.065, y * 0.11 + math.sin(a) * 0.04, z) for a in [k / 8 * 2 * math.pi for k in range(8)] for z in (0.15, 0.27)]
        paint(hull(pts), shade(REED, REED_D))
        paint(blob((0.0, y * 0.11, 0.28), (0.06, 0.035, 0.03), n=8, jitter=0.3), shade(WHEAT, WHEAT_D))
        for k in range(3): ear(V(-0.03 + k * 0.03, y * 0.11, 0.28), h=0.06)
    part('head', loc=(0.14, 0, 0.27))
    paint(loft([(0.14, 0, 0.27), (0.2, 0, 0.36), (0.23, 0, 0.38)], [0.04, 0.035, 0.03], sides=6, wob=0.03), shade(DONK, DONK_D))   # 목
    paint(hull([V(0.2, y, z) for y in (-0.035, 0.035) for z in (0.34, 0.4)] + [V(0.33, y, z) for y in (-0.028, 0.028) for z in (0.3, 0.34)]), shade(DONK, DONK_D, k=0.08))
    paint(blob((0.33, 0, 0.315), (0.02, 0.03, 0.02), n=6, jitter=0.1), solid(lin(0xd8d0c4)))   # 흰 주둥이
    for y in (-1, 1): paint(loft([(0.22, y * 0.025, 0.4), (0.21, y * 0.05, 0.47), (0.2, y * 0.055, 0.5)], [0.016, 0.014, 0.004], sides=4, ell=(0.5, 1.0), wob=0), shade(DONK, DONK_D))   # 긴 귀
    base()
    for i, (x, y) in enumerate(((0.1, -0.04), (0.1, 0.04), (-0.12, -0.04), (-0.12, 0.04))):
        part('leg%d' % i, loc=(x, y, 0.18))
        paint(cyl((x, y, 0.19), (x, y, 0.02), 0.02, 0.014, sides=5), shade(DONK, DONK_D))
        paint(blob((x, y, 0.012), (0.016, 0.015, 0.012), n=6, jitter=0.1), solid(lin(0x3a3430)))
        base()
    part('tail', loc=(-0.18, 0, 0.27))
    paint(loft([(-0.18, 0, 0.27), (-0.2, 0, 0.18), (-0.2, 0, 0.12)], [0.008, 0.006, 0.005], sides=4, wob=0), solid(DONK_D))
    paint(blob((-0.2, 0, 0.11), (0.012, 0.012, 0.025), n=6, jitter=0.2), solid(lin(0x3a3430)))
    base()
    finish('donkey', OUT)

# ── 맷돌 가는 여인 — 무릎 꿇고 손맷돌을 돌린다(마 24:41). 위짝 축 stone · 팔 축 arms ──
def grinder():
    begin(224)
    DRESS, DRESS_D = lin(0x5a7a9a), lin(0x45607a)
    paint(blob((-0.02, 0, 0.06), (0.1, 0.1, 0.06), n=14, jitter=0.12), shade(DRESS, DRESS_D))   # 꿇은 무릎·치마
    paint(loft([(-0.03, 0, 0.08), (-0.02, 0, 0.22), (-0.01, 0, 0.29)], [0.065, 0.06, 0.05], sides=7, wob=0.05), shade(DRESS, DRESS_D))
    paint(blob((0.0, 0, 0.34), (0.042, 0.04, 0.046), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(loft([(-0.02, 0, 0.39), (-0.04, 0, 0.31), (-0.055, 0, 0.21)], [0.05, 0.055, 0.05], sides=7, ell=(1.0, 1.1), wob=0.05), solid(lin(0xe0d0b0), 0.05))
    paint(blob((-0.01, 0, 0.365), (0.05, 0.05, 0.035), n=12, jitter=0.08), solid(lin(0xe0d0b0), 0.05))
    # 아래짝
    paint(cyl((0.17, 0, 0.0), (0.17, 0, 0.05), 0.08, sides=10), shade(STONE, STONE_D))
    paint(blob((0.17, 0, 0.0), (0.12, 0.12, 0.012), n=10, jitter=0.2), solid(lin(0xf0e8d8), 0.04))   # 흘러내린 가루
    part('stone', loc=(0.17, 0, 0.05))
    paint(cyl((0.17, 0, 0.05), (0.17, 0, 0.09), 0.075, sides=10), shade(STONE, STONE_D))
    paint(cyl((0.17, 0, 0.09), (0.17, 0, 0.095), 0.018, sides=6), solid(lin(0x5a5048)))   # 곡식 넣는 구멍
    paint(cyl((0.12, 0, 0.08), (0.12, 0, 0.15), 0.008, sides=4), solid(WOOD))   # 손잡이
    base()
    part('arms', loc=(0.0, 0, 0.26))
    for y in (-1, 1):
        paint(loft([(0, y * 0.055, 0.27), (0.06, y * 0.04, 0.18), (0.11, y * 0.01, 0.15)], [0.019, 0.017, 0.015], sides=5, wob=0), shade(DRESS, DRESS_D))
    paint(blob((0.12, 0, 0.15), (0.02, 0.022, 0.016), n=6, jitter=0), solid(SKIN))
    base()
    finish('grinder', OUT)

# ── 진흙 화덕(타분) — 둥근 흙 화덕 안에 숯불(축 flame, 빛남), 둘레에 납작한 떡 ──
def oven():
    begin(225)
    pts = [V(math.cos(a) * r, math.sin(a) * r, z) for a in [k / 12 * 2 * math.pi for k in range(12)] for r, z in ((0.13, 0.0), (0.12, 0.1), (0.08, 0.17))]
    paint(hull(pts), shade(CLAY, CLAY_D, k=0.08))
    paint(hull([V(math.cos(a) * 0.065, math.sin(a) * 0.065, 0.171) for a in [k / 10 * 2 * math.pi for k in range(10)]] + [V(0, 0, 0.165)]), solid(lin(0x2a1a12)))   # 아궁이
    paint(hull([V(x, -0.12 + dy, z) for x in (-0.04, 0.04) for dy in (-0.012, 0.004) for z in (0.0, 0.05)]), solid(lin(0x2a1a12)))   # 불 때는 구멍
    part('flame', loc=(0, -0.12, 0.02))
    paint(blob((0, -0.124, 0.022), (0.03, 0.01, 0.02), n=8, jitter=0.2), solid(lin(0xff9a30)), GLOW)
    paint(blob((0, 0, 0.172), (0.045, 0.045, 0.004), n=8, jitter=0.2), solid(lin(0xff7a20)), GLOW)
    base()
    for k in range(4):   # 납작한 떡
        a = 0.6 + k * 0.5; c = V(math.cos(a) * 0.19, math.sin(a) * 0.19, 0.005)
        paint(blob(c, (0.04, 0.04, 0.008), n=10, jitter=0.15), shade(BREAD, BREAD_D))
    paint(hull([V(x, y, z) for x in (0.16, 0.26) for y in (-0.12, -0.02) for z in (0.0, 0.015)]), shade(WOOD_L, WOOD))   # 떡 놓는 판
    for (x, y) in ((0.19, -0.08), (0.23, -0.05)): paint(blob((x, y, 0.024), (0.035, 0.035, 0.008), n=10, jitter=0.15), shade(BREAD, BREAD_D))
    finish('oven', OUT, emit=(1.0, 0.55, 0.15))

# ── 저장 항아리 — 곡식·기름을 담는 큰 항아리 셋 ──
def storejars():
    begin(226)
    for (x, y, h) in ((-0.08, 0.03, 0.3), (0.08, 0.06, 0.26), (0.0, -0.1, 0.22)):
        paint(loft([(x, y, 0.0), (x, y, h * 0.15), (x, y, h * 0.55), (x, y, h * 0.88), (x, y, h)], [0.03, 0.07, 0.08, 0.04, 0.035], sides=9, wob=0.03), shade(CLAY, CLAY_D))
        paint(loft([V(x + math.cos(a) * 0.037, y + math.sin(a) * 0.037, h) for a in [k / 10 * 2 * math.pi for k in range(10)]], 0.008, sides=3, closed=True, wob=0), solid(CLAY_D))
        paint(loft([V(x + math.cos(a) * 0.075, y + math.sin(a) * 0.075, h * 0.6) for a in [k / 12 * 2 * math.pi for k in range(12)]], 0.004, sides=3, closed=True, wob=0), solid(lin(0x7a4a30)))
    finish('storejars', OUT)

# ── 닭 세 마리 — 마당을 쪼며 다닌다(축 hen0~2 — 발 쪽에서 앞으로 숙여 쫀다) ──
def hens():
    begin(227)
    for i, (x, y, a, col) in enumerate(((0.0, 0.0, 0.3, lin(0xf2ece0)), (0.13, 0.08, 2.4, lin(0xb06a3a)), (0.06, -0.12, -1.2, lin(0x8a5a32)))):
        part('hen%d' % i, loc=(x, y, 0.0))
        d = V(math.cos(a), math.sin(a), 0); sd = V(-d.y, d.x, 0); c = V(x, y, 0.0)
        paint(blob(c + V(0, 0, 0.055), (0.045, 0.045, 0.038), n=10, jitter=0.12), shade(col, col))
        paint(blob(c + d * 0.045 + V(0, 0, 0.09), (0.022, 0.022, 0.024), n=8, jitter=0.1), shade(col, col))   # 머리
        paint(cone(c + d * 0.062 + V(0, 0, 0.09), c + d * 0.085 + V(0, 0, 0.085), 0.007, sides=3), solid(lin(0xe0a030)))   # 부리
        paint(blob(c + d * 0.045 + V(0, 0, 0.115), (0.012, 0.006, 0.01), n=6, jitter=0.1), solid(lin(0xd03028)))   # 볏
        paint(hull([c - d * 0.04 + V(0, 0, 0.06), c - d * 0.07 + V(0, 0, 0.1), c - d * 0.06 + sd * 0.012 + V(0, 0, 0.08), c - d * 0.06 - sd * 0.012 + V(0, 0, 0.08)]), shade(col, col))   # 꼬리
        for s2 in (-1, 1): paint(cyl(c + sd * 0.015 * s2 + V(0, 0, 0.025), c + sd * 0.015 * s2, 0.004, sides=3), solid(lin(0xe0a030)))
        base()
    finish('hens', OUT)

# ── 베들레헴 우물 — 돌 테두리, 나무 걸대에 두레박(삼하 23:15 「베들레헴 성문 곁 우물 물」) ──
def bethwell():
    begin(228)
    pts = [V(math.cos(a) * r, math.sin(a) * r, z) for a in [k / 14 * 2 * math.pi for k in range(14)] for r, z in ((0.15, 0.0), (0.14, 0.13))]
    paint(hull(pts), shade(STONE, STONE_D, k=0.08))
    paint(hull([V(math.cos(a) * 0.1, math.sin(a) * 0.1, 0.132) for a in [k / 12 * 2 * math.pi for k in range(12)]] + [V(0, 0, 0.128)]), solid(lin(0x2a3a44)))   # 물(어둡게)
    for k in range(10):
        a = k / 10 * 2 * math.pi + random.random() * 0.2
        paint(blob((math.cos(a) * 0.145, math.sin(a) * 0.145, 0.06 + random.random() * 0.06), (0.03, 0.03, 0.025), n=6, jitter=0.2), solid(STONE, 0.08))
    for y in (-0.15, 0.15): paint(cyl((0, y, 0.0), (0, y, 0.36), 0.014, sides=5), shade(WOOD_L, WOOD))
    paint(cyl((0, -0.17, 0.33), (0, 0.17, 0.33), 0.012, sides=5), solid(WOOD_D))
    paint(cyl((0.0, 0.03, 0.33), (0.0, 0.03, 0.2), 0.003, sides=3), solid(ROPE_C))
    paint(loft([(0.0, 0.03, 0.14), (0.0, 0.03, 0.2)], [0.03, 0.035], sides=8, wob=0.02), shade(WOOD_L, WOOD))   # 두레박
    pts = [V(0.2 + math.cos(a) * r, 0.05 + math.sin(a) * r, z) for a in [k / 10 * 2 * math.pi for k in range(10)] for r, z in ((0.028, 0.0), (0.045, 0.07), (0.03, 0.12))]
    paint(hull(pts), shade(CLAY, CLAY_D))   # 물동이
    finish('bethwell', OUT)

# ── 낮은 돌담 — 마당 둘레 마른 돌담 한 토막 ──
def lowwall():
    begin(229)
    # 처음엔 돌이 작아 자갈처럼 보였다 → 큰 돌 두 켜(무릎 높이 약 0.22)
    for k in range(8):
        x = -0.4 + k * 0.115
        paint(blob((x, (random.random() - 0.5) * 0.02, 0.055), (0.07, 0.065, 0.06), n=8, jitter=0.22), shade(STONE, STONE_D))
        if k < 7: paint(blob((x + 0.058, (random.random() - 0.5) * 0.02, 0.15), (0.065, 0.06, 0.05), n=8, jitter=0.22), shade(STONE, STONE_D))
    for k in range(3): paint(blob((-0.3 + k * 0.3, 0.0, 0.205), (0.06, 0.05, 0.03), n=8, jitter=0.25), shade(STONE, STONE_D))
    for k in range(4): paint(blob((-0.33 + k * 0.22, 0.06, 0.01), (0.05, 0.035, 0.03), n=6, jitter=0.3), shade(LEAF, LEAF_D))   # 담 밑 풀
    finish('lowwall', OUT)

# ══ 큰 세트 「베들레헴의 추수」 바닥 — 세 세트를 한 농가로 묶는 땅: 가운데 타작마당을 두르는 흙길(수레 길), 밭 둘레 그루터기, 덤불·풀 ══
#    게임 좌표(큰 세트 안, 1.5배 전)로 빚는다: 블렌더 x = 게임 x, 블렌더 y = −게임 z. 흙길은 game.js NJ_BIG.bethlehem.haul.path와 같은 점(닫힌 길)
HARVEST_PATH = [(1.12, -0.75), (0.6, -1.3), (-0.6, -1.32), (-1.25, -0.55), (-1.1, 0.35), (0.0, 0.72), (1.1, 0.3)]
def harvestbase():
    begin(231)
    G = lambda x, z, h=0.0: V(x, -z, h)
    rim = [G(math.cos(a) * 3.75 * (1 + (random.random() - 0.5) * 0.05), -0.2 + math.sin(a) * 1.95 * (1 + (random.random() - 0.5) * 0.07)) for a in [k / 30 * 2 * math.pi for k in range(30)]]
    paint(hull(rim + [V(v.x, v.y, 0.01) for v in rim]), shade(lin(0x9cc06a), lin(0x7a9a4e), k=0.08))   # 늦여름 풀판(조금 누런 초록)
    P, m, road = HARVEST_PATH, len(HARVEST_PATH), []   # 닫힌 캣멀롬 — 게임(nj3d.js haulShow)의 수레 길과 같은 모양
    for i in range(m):
        p0, p1, p2, p3 = P[(i - 1) % m], P[i], P[(i + 1) % m], P[(i + 2) % m]
        for k in range(8):
            t = k / 8; t2 = t * t; t3 = t2 * t
            f = lambda a, b, c, d: 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
            road.append(V(f(p0[0], p1[0], p2[0], p3[0]), -f(p0[1], p1[1], p2[1], p3[1]), 0.014))
    paint(loft(road, 0.16, sides=4, ell=(1.0, 0.05), wob=0.12, closed=True), shade(lin(0xc9a877), lin(0xa98a5c), k=0.12))   # 흙길(한 바퀴)
    for k in range(16):   # 바퀴 자국 사이 풀과 길가 자갈
        v = road[int(random.random() * (len(road) - 1))]; s2 = random.choice((-1, 1))
        paint(blob(V(v.x + (random.random() - 0.5) * 0.1, v.y + s2 * 0.19, 0.016), (0.03, 0.025, 0.016), n=6, jitter=0.3), solid(random.choice([STONE, STONE_D]), 0.08))
    for (x, z, r) in ((-3.5, -1.3, 0.2), (3.4, -1.5, 0.22), (3.3, 1.2, 0.17), (-3.2, 1.3, 0.18), (1.6, 1.75, 0.14), (-1.8, 1.65, 0.15)):   # 덤불
        paint(blob(G(x, z, r * 0.6), (r, r, r * 0.7), n=14, jitter=0.3), shade(lin(0x5f9a4a), lin(0x467d38)))
    for k in range(70):   # 밭 둘레 그루터기와 풀 무더기
        x = -3.6 + random.random() * 7.2; z = -2.0 + random.random() * 3.7
        if ((x / 3.75) ** 2 + ((z + 0.2) / 1.95) ** 2) > 0.92: continue
        if min((x - v.x) ** 2 + (-z - v.y) ** 2 for v in road[::3]) < 0.09: continue
        if (x ** 2 + (z + 0.35) ** 2) < 0.8: continue   # 타작마당
        c = G(x, z, 0.01); col = random.choice([WHEAT_D, lin(0x7fae5a), lin(0x6a9a4a)])
        for j in range(2): paint(cone(c, c + V((random.random() - 0.5) * 0.04, (random.random() - 0.5) * 0.04, 0.05 + random.random() * 0.04), 0.012, 3), solid(col, 0.08))
    finish('harvestbase', OUT)

ALL = [wheatfield, reaper, gleaner, boaz, sheaves, gleanbasket, meal, booth, boundarystone,
       threshingfloor, ox, winnower, grainheap, restboaz, strawpile, sacks, measure, winnowtools,
       granary, cart, donkey, grinder, oven, storejars, hens, bethwell, lowwall, harvestbase]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
