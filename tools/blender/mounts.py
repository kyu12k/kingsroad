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

# ══ 🐪 낙타 (창 24 — 리브가를 맞으러 온 낙타) ══
# 단봉낙타 — 어깨 0.6, 혹 꼭대기 0.83, 길쭉한 다리, S자 목. 머리 축 head = 목 밑동(0.26, 0, 0.62). 다리 leg0~3(앞왼·앞오·뒤왼·뒤오) · 꼬리 tail. 앉는 자리 = 혹 위 (−0.02, 0.86)
CAMEL_COATS = {
    'sand':  (lin(0xd4b07a), lin(0xb08a54), lin(0xead6b0)),
    'brown': (lin(0x8a6040), lin(0x6a4630), lin(0xb08a64)),
    'white': (lin(0xeee4d0), lin(0xcfc2a6), lin(0xfaf4e6)),
}
def _camel(coat):
    C, CD, CL = CAMEL_COATS[coat]
    begin(421)
    paint(loft([(-0.32, 0, 0.62), (-0.24, 0, 0.6), (-0.08, 0, 0.6), (0.1, 0, 0.6), (0.24, 0, 0.62), (0.3, 0, 0.64)], [0.06, 0.1, 0.12, 0.12, 0.1, 0.06], sides=10, ell=(0.85, 1.0), wob=0.03), shade(C, CD, k=0.06))   # 몸통
    paint(blob((-0.03, 0, 0.72), (0.17, 0.085, 0.12), n=16, jitter=0.06), shade(C, CD, k=0.05))   # 혹
    paint(loft([(-0.16, 0, 0.5), (0.0, 0, 0.49), (0.14, 0, 0.5)], [0.05, 0.065, 0.05], sides=8, ell=(1.0, 0.5), wob=0.02), solid(CL))   # 배
    part('head', loc=(0.26, 0, 0.62))
    paint(loft(crs([(0.24, 0, 0.62), (0.36, 0, 0.6), (0.45, 0, 0.66), (0.5, 0, 0.78), (0.52, 0, 0.84)], 8), [0.07, 0.062, 0.055, 0.05, 0.046, 0.044, 0.042, 0.04], sides=7, ell=(1.0, 0.8), wob=0.03), shade(C, CD))   # S자 목
    paint(hull([V(0.5, y, z) for y in (-0.035, 0.035) for z in (0.8, 0.88)] + [V(0.66, y, z) for y in (-0.03, 0.03) for z in (0.78, 0.83)]), shade(C, CD, k=0.06))   # 머리
    paint(blob((0.655, 0, 0.775), (0.022, 0.03, 0.018), n=8, jitter=0.15), solid(CL))   # 늘어진 입술
    for s2 in (-1, 1):
        paint(blob((0.56, s2 * 0.034, 0.86), (0.008, 0.005, 0.008), n=5, jitter=0), solid(lin(0x1a1410)))   # 눈
        paint(blob((0.51, s2 * 0.03, 0.9), (0.012, 0.008, 0.016), n=5, jitter=0.1), shade(C, CD))   # 작은 귀
    base()
    for i, (x, y) in enumerate(((0.2, 0.055), (0.2, -0.055), (-0.22, 0.055), (-0.22, -0.055))):
        part('leg%d' % i, loc=(x, y, 0.56))
        paint(cyl((x, y, 0.57), (x, y, 0.3), 0.035, 0.022, sides=6), shade(C, CD))
        paint(blob((x, y, 0.3), (0.026, 0.024, 0.03), n=6, jitter=0.1), shade(C, CD))   # 무릎
        paint(cyl((x, y, 0.3), (x, y, 0.03), 0.02, 0.018, sides=6), shade(C, CD))
        paint(blob((x + 0.01, y, 0.015), (0.03, 0.026, 0.015), n=6, jitter=0.1), solid(CD))   # 넓은 발
        base()
    part('tail', loc=(-0.31, 0, 0.64))
    paint(loft([(-0.31, 0, 0.64), (-0.34, 0, 0.52), (-0.34, 0, 0.44)], [0.01, 0.008, 0.006], sides=4, wob=0), solid(CD))
    paint(blob((-0.34, 0, 0.42), (0.012, 0.012, 0.03), n=6, jitter=0.2), solid(lin(0x3a3028)))
    base()
    finish('mt_camel_' + coat, OUT, center=False)

def mt_camel_sand(): _camel('sand')
def mt_camel_brown(): _camel('brown')
def mt_camel_white(): _camel('white')

# ── 낙타 장식 ──
def gd_camel_cloth():   # 술 달린 안장 덮개 — 혹을 덮는 붉은·금빛 천, 아래로 술
    begin(431)
    cols = [lin(0x9a2a3a), lin(0xe8c25a), lin(0x9a2a3a), lin(0x2a4a8a), lin(0x9a2a3a)]
    for i, c in enumerate(cols):
        x0 = -0.16 + i * 0.064
        pts = []
        for dx in (0.0, 0.064):
            x = x0 + dx; top = 0.72 + 0.12 * math.sqrt(max(0, 1 - ((x + 0.03) / 0.18) ** 2))
            pts += [V(x, 0, top + 0.012), V(x, 0.07, top - 0.02), V(x, 0.105, 0.6), V(x, 0.11, 0.53), V(x, -0.07, top - 0.02), V(x, -0.105, 0.6), V(x, -0.11, 0.53)]
        paint(hull(pts), solid(c, 0.05))
    for s2 in (-1, 1):
        for k in range(11): paint(cyl((-0.15 + k * 0.03, s2 * 0.112, 0.53), (-0.15 + k * 0.03, s2 * 0.114, 0.49), 0.005, sides=3), solid(lin(0xe8c25a)))
    finish('gd_camel_cloth', OUT, center=False)

def gd_camel_bells():   # 방울 줄 — 목에 늘어뜨린 금방울 줄 (머리 축에 붙는다)
    begin(432)
    pts = [V(0.3 + 0.2 * u, 0, 0.6 + 0.2 * u * u - 0.06 * math.sin(u * math.pi)) for u in [k / 10 for k in range(11)]]
    paint(loft([V(p.x, 0.058 - p.x * 0.03, p.z - 0.01) for p in pts], 0.005, sides=3, wob=0), solid(lin(0x9a2a3a)))
    for k in range(1, 10, 2):
        p = pts[k]; paint(blob((p.x, 0.06 - p.x * 0.03, p.z - 0.035), (0.013, 0.013, 0.015), n=6, jitter=0), shade(GOLD, GOLD_D), METAL)
    for s2 in (-1, 1): paint(blob((0.36, s2 * 0.064, 0.58), (0.016, 0.012, 0.018), n=6, jitter=0), shade(GOLD, GOLD_D), METAL)
    finish('gd_camel_bells', OUT, center=False)

def gd_camel_bundles():   # 짐 꾸러미 — 「주인의 모든 좋은 것을 가지고」(창 24:10) 양옆의 보따리와 항아리
    begin(433)
    for s2 in (-1, 1):
        paint(blob((-0.2, s2 * 0.13, 0.62), (0.07, 0.04, 0.06), n=10, jitter=0.2), shade(lin(0xc8a46a), lin(0xa0804a)))
        paint(blob((-0.12, s2 * 0.135, 0.58), (0.05, 0.035, 0.05), n=10, jitter=0.2), shade(lin(0x6a8aa8), lin(0x4a6a88)))
        paint(loft([(-0.26, s2 * 0.13, 0.52), (-0.26, s2 * 0.13, 0.56), (-0.26, s2 * 0.13, 0.6), (-0.26, s2 * 0.13, 0.62)], [0.02, 0.032, 0.02, 0.016], sides=8, wob=0.02), shade(lin(0xc4825a), lin(0x9a6040)))
        paint(cyl((-0.2, s2 * 0.1, 0.7), (-0.2, s2 * 0.13, 0.66), 0.005, sides=3), solid(LEATHER))
    finish('gd_camel_bundles', OUT, center=False)

def gd_camel_halter():   # 코걸이와 고삐 — 머리띠와 금 코걸이(창 24:47), 늘어진 고삐 (머리 축에 붙는다)
    begin(434)
    for x in (0.54, 0.62):
        paint(loft([V(x + 0.004 * math.cos(a), 0.036 * math.sin(a), 0.83 + 0.04 * math.cos(a) - (x - 0.54) * 0.3) for a in [k / 12 * 2 * math.pi for k in range(12)]], 0.005, sides=3, closed=True, wob=0), solid(lin(0x9a2a3a)))
    paint(loft([V(0.66, 0.012 * math.cos(a), 0.795 + 0.012 * math.sin(a)) for a in [k / 10 * 2 * math.pi for k in range(10)]], 0.003, sides=3, closed=True, wob=0), shade(GOLD, GOLD_D), METAL)
    paint(loft([V(0.62, 0.04, 0.8), V(0.55, 0.05, 0.7), V(0.45, 0.05, 0.68), V(0.3, 0.06, 0.72)], 0.004, sides=3, wob=0), solid(LEATHER))
    finish('gd_camel_halter', OUT, center=False)

ALL = [mt_donkey_gray, mt_donkey_brown, mt_donkey_white, gd_donkey_rug, gd_donkey_bells, gd_donkey_garland, gd_donkey_baskets,
       mt_camel_sand, mt_camel_brown, mt_camel_white, gd_camel_cloth, gd_camel_bells, gd_camel_bundles, gd_camel_halter]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
