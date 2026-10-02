# 🐴 탈것 (2026-10-02) — 3D 걸어서 구경에서 타는 것. 성경의 탈것(나귀·낙타·돛단배·백마·독수리 날개·불병거)과 오늘의 탈것(자전거…비행기)
# 실행: blender -b -P mounts.py -- <출력 폴더> [이름 …]   → models/mounts/*.glb
# 앞 = 블렌더 +x, 원점 = 몸 한가운데 아래 땅(finish center=False — 장식이 같은 원점에 맞물린다). 사람 키 약 0.53 기준(게임에서 순례자 키에 맞춰 줄인다)
# 장식은 탈것마다 따로(10/2 사용자: 호환되지 않게) — 장식 모델도 탈것과 같은 좌표로 빚는다. 머리에 다는 것은 게임에서 머리 축 아래로 옮겨 붙인다
# 털빛은 모델을 따로 뽑는다(mt_donkey_gray·brown·white)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))
def ring_pts(c, r, z, n=10):
    return [V(c[0] + math.cos(a) * r, c[1] + math.sin(a) * r, z) for a in [k / n * 2 * math.pi for k in range(n)]]

WOOD, WOOD_D = lin(0x8a5a30), lin(0x5e3c1e)
GOLD, GOLD_D = lin(0xe8c25a), lin(0xb8923a)
REED, REED_D = lin(0xc9a868), lin(0xa0844c)
LEATHER = lin(0x6b3e22)
HOOF = lin(0x3a3430)
FLOWERS = [lin(0xf4a6c0), lin(0xffffff), lin(0xf6d77a), lin(0xe57a9a)]

# ══ 🫏 나귀 (슥 9:9) ══
# 머리 축 head = 목 밑동(0.15, 0, 0.32). 다리 leg0~3(앞왼·앞오·뒤왼·뒤오) · 꼬리 tail. 등 위 앉는 자리 ≈ (−0.02, 0, 0.37)
DONKEY_COATS = {
    'gray':  (lin(0x8f8a84), lin(0x6e6a64), lin(0xd8d0c4)),   # 털 · 그늘 · 주둥이·배
    'brown': (lin(0x8a6a4e), lin(0x6a4e38), lin(0xd8c4a8)),
    'white': (lin(0xeeeae2), lin(0xc8c2b6), lin(0xfaf6ee)),   # 흰 나귀(삿 5:10)
}
def _donkey(coat):
    C, CD, CL = DONKEY_COATS[coat]
    begin(401)
    # 몸통 — 둥근 통(처음엔 상자처럼 보였다): 엉덩이 · 배 · 가슴으로 갈수록 굵기가 바뀐다
    paint(loft([(-0.235, 0, 0.29), (-0.17, 0, 0.285), (-0.05, 0, 0.275), (0.08, 0, 0.28), (0.17, 0, 0.29), (0.2, 0, 0.3)], [0.045, 0.072, 0.08, 0.078, 0.066, 0.04], sides=10, ell=(0.95, 1.0), wob=0.03), shade(C, CD, k=0.06))
    paint(loft([(-0.13, 0, 0.215), (0.0, 0, 0.205), (0.11, 0, 0.215)], [0.04, 0.05, 0.04], sides=8, ell=(1.0, 0.45), wob=0.02), solid(CL))   # 흰 배
    paint(hull([V(x, y, 0.352) for x in (0.02, 0.07) for y in (-0.012, 0.012)] + [V(0.045, 0, 0.356)]), solid(CD))   # 등줄
    for s2 in (-1, 1): paint(hull([V(0.03 + dx, s2 * 0.07, z) for dx in (-0.012, 0.012) for z in (0.27, 0.34)] + [V(0.03, s2 * 0.08, 0.3)]), solid(CD))   # 어깨 십자 무늬(나귀 등의 짙은 줄)
    part('head', loc=(0.15, 0, 0.32))
    paint(loft([(0.14, 0, 0.3), (0.21, 0, 0.39), (0.25, 0, 0.43)], [0.045, 0.04, 0.034], sides=7, ell=(1.0, 0.8), wob=0.03), shade(C, CD))   # 목
    paint(loft([(0.15, 0, 0.36), (0.22, 0, 0.44), (0.25, 0, 0.47)], [0.012, 0.012, 0.01], sides=4, wob=0.1), solid(lin(0x3a3430)))   # 갈기
    paint(hull([V(0.22, y, z) for y in (-0.036, 0.036) for z in (0.4, 0.47)] + [V(0.36, y, z) for y in (-0.028, 0.028) for z in (0.36, 0.41)]), shade(C, CD, k=0.06))
    paint(blob((0.36, 0, 0.375), (0.022, 0.03, 0.022), n=8, jitter=0.1), solid(CL))   # 흰 주둥이
    for s2 in (-1, 1):
        paint(blob((0.29, s2 * 0.033, 0.43), (0.007, 0.004, 0.007), n=5, jitter=0), solid(lin(0x1a1410)))   # 눈
        paint(loft([(0.24, s2 * 0.02, 0.47), (0.23, s2 * 0.045, 0.54), (0.22, s2 * 0.05, 0.58)], [0.015, 0.014, 0.004], sides=4, ell=(0.45, 1.0), wob=0), shade(C, CD))   # 긴 귀
        paint(loft([(0.241, s2 * 0.022, 0.48), (0.232, s2 * 0.044, 0.54)], [0.007, 0.004], sides=3, ell=(0.3, 1.0), wob=0), solid(lin(0x3a3430)))
    base()
    for i, (x, y) in enumerate(((0.11, 0.045), (0.11, -0.045), (-0.15, 0.045), (-0.15, -0.045))):
        part('leg%d' % i, loc=(x, y, 0.22))
        paint(cyl((x, y, 0.23), (x, y, 0.02), 0.022, 0.015, sides=6), shade(C, CD))
        paint(blob((x, y, 0.012), (0.017, 0.016, 0.013), n=6, jitter=0.1), solid(HOOF))
        base()
    part('tail', loc=(-0.22, 0, 0.3))
    paint(loft([(-0.22, 0, 0.3), (-0.25, 0, 0.21), (-0.25, 0, 0.14)], [0.008, 0.006, 0.005], sides=4, wob=0), solid(CD))
    paint(blob((-0.25, 0, 0.12), (0.013, 0.013, 0.03), n=6, jitter=0.2), solid(lin(0x3a3430)))
    base()
    finish('mt_donkey_' + coat, OUT, center=False)

def mt_donkey_gray(): _donkey('gray')
def mt_donkey_brown(): _donkey('brown')
def mt_donkey_white(): _donkey('white')

# ── 나귀 장식 ──
def gd_donkey_rug():   # 줄무늬 깔개 — 등에 덮는다(붉은·크림·푸른 줄, 술)
    begin(411)
    cols = [lin(0xb03a3a), lin(0xf0e2c0), lin(0x3a5a9a), lin(0xf0e2c0), lin(0xb03a3a)]
    for i, c in enumerate(cols):
        x0 = -0.12 + i * 0.045
        pts = [V(x0 + dx, y, z) for dx in (0.0, 0.045) for (y, z) in ((0.0, 0.358), (0.06, 0.345), (0.088, 0.3), (0.092, 0.25), (-0.06, 0.345), (-0.088, 0.3), (-0.092, 0.25))]
        paint(hull(pts), solid(c, 0.05))
    for s2 in (-1, 1):
        for k in range(8): paint(cyl((-0.11 + k * 0.03, s2 * 0.094, 0.25), (-0.11 + k * 0.03, s2 * 0.096, 0.22), 0.004, sides=3), solid(GOLD))   # 술
    finish('gd_donkey_rug', OUT, center=False)

def gd_donkey_bells():   # 방울 굴레 — 머리띠와 볼끈, 턱 밑과 이마에 금방울 (머리 축에 붙는다)
    begin(412)
    for x in (0.25, 0.33):
        paint(loft([V(x + 0.006 * math.cos(a), 0.04 * math.sin(a), 0.405 + 0.045 * math.cos(a) - (x - 0.25) * 0.4) for a in [k / 12 * 2 * math.pi for k in range(12)]], 0.005, sides=3, closed=True, wob=0), solid(LEATHER))
    paint(cyl((0.25, 0, 0.45), (0.33, 0, 0.42), 0.005, sides=3), solid(LEATHER))
    for (x, y, z) in ((0.29, 0, 0.35), (0.25, 0.042, 0.4), (0.25, -0.042, 0.4), (0.27, 0, 0.47)):
        paint(blob((x, y, z), (0.012, 0.012, 0.012), n=6, jitter=0), shade(GOLD, GOLD_D), METAL)
    paint(hull([V(0.3, y, z) for y in (-0.016, 0.016) for z in (0.44, 0.46)] + [V(0.305, 0, 0.45)]), shade(GOLD, GOLD_D), METAL)   # 이마 금패
    finish('gd_donkey_bells', OUT, center=False)

def gd_donkey_garland():   # 꽃목걸이 — 목 밑동에 두른 꽃 고리 (머리 축에 붙는다)
    begin(413)
    for k in range(16):
        a = k / 16 * 2 * math.pi
        c = V(0.19 + 0.012 * math.cos(a), 0.052 * math.sin(a), 0.36 + 0.05 * math.cos(a))
        paint(blob(c, (0.016, 0.016, 0.015), n=6, jitter=0.2), solid(random.choice(FLOWERS) if k % 3 else lin(0x6f9a45), 0.06))
    finish('gd_donkey_garland', OUT, center=False)

def gd_donkey_baskets():   # 짐바구니 — 양옆에 걸친 갈대 바구니, 무화과와 떡
    begin(414)
    paint(hull([V(x, y, z) for x in (-0.1, 0.06) for y in (-0.08, 0.08) for z in (0.352, 0.362)]), solid(lin(0x9a5a3a)))
    for s2 in (-1, 1):
        pts = [V(-0.02 + math.cos(a) * 0.06, s2 * 0.11 + math.sin(a) * 0.035, z) for a in [k / 10 * 2 * math.pi for k in range(10)] for z in (0.2, 0.31)]
        paint(hull(pts), shade(REED, REED_D))
        for z in (0.23, 0.27): paint(loft([V(-0.02 + math.cos(a) * 0.061, s2 * 0.11 + math.sin(a) * 0.036, z) for a in [k / 12 * 2 * math.pi for k in range(12)]], 0.003, sides=3, closed=True, wob=0), solid(REED_D))
        for k in range(4): paint(blob((-0.04 + k * 0.02, s2 * 0.11 + (random.random() - 0.5) * 0.03, 0.32), (0.016, 0.016, 0.014), n=6, jitter=0.1), solid(random.choice([lin(0x6a4a6a), lin(0xd9a35c)]), 0.06))
        paint(cyl((-0.02, s2 * 0.09, 0.355), (-0.02, s2 * 0.11, 0.31), 0.004, sides=3), solid(LEATHER))
    finish('gd_donkey_baskets', OUT, center=False)

ALL = [mt_donkey_gray, mt_donkey_brown, mt_donkey_white, gd_donkey_rug, gd_donkey_bells, gd_donkey_garland, gd_donkey_baskets]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
