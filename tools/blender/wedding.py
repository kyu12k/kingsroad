# 꾸밈 컨셉 「💒 어린 양의 혼인 잔치」(계 19:7-9 「어린 양의 혼인 잔치에 청함을 받은 자들은 복이 있도다」 · 마 25 · 요 2) (2026-10-02)
# 성 둘레 땅에 놓는다. 세트 ① 잔칫상(요 2 가나의 돌항아리 · 계 19:8 빛나고 깨끗한 세마포)
# 신랑(그리스도)은 형상으로 만들지 않는다 — 큰 세트에서는 빛과 행렬로만(갈릴리에서 예수님 형상을 만들지 않은 것과 같다)
# 실행: blender -b -P wedding.py -- <출력 폴더> [이름 …]   → models/decor/*.glb
# 사람 모델은 앞 = 블렌더 +x (키 약 0.53). 세트의 앞(+z, 보는 쪽) = 블렌더 −y
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))
def box(c, s, fn, mat=BASE):
    c = Vector(c); return paint(hull([c + Vector((x * s[0], y * s[1], z * s[2])) for x in (-.5, .5) for y in (-.5, .5) for z in (-.5, .5)]), fn, mat)

WOOD, WOOD_D, WOOD_L = lin(0x8a5a30), lin(0x5e3c1e), lin(0xb07c48)
LINEN, LINEN_D = lin(0xf6f2e8), lin(0xd8d0bc)       # 빛나고 깨끗한 세마포(계 19:8)
GOLD, GOLD_D = lin(0xe8c25a), lin(0xb8923a)
SKIN = lin(0xd9a77c)
STONE_W, STONE_WD = lin(0xe2dccb), lin(0xb8b09c)     # 석회암 돌항아리
CLAY, CLAY_D = lin(0xc4825a), lin(0x9a6040)
BREAD, BREAD_D = lin(0xd9a35c), lin(0xb07c3a)
WINE = lin(0x7a1e3a)
LEAF, LEAF_D = lin(0x6f9a45), lin(0x4f7a30)
FLOWERS = [lin(0xf4a6c0), lin(0xffffff), lin(0xf6d77a), lin(0xe57a9a)]

def ring_pts(c, r, z, n=10, sx=1.0):
    return [V(c[0] + math.cos(a) * r * sx, c[1] + math.sin(a) * r, z) for a in [k / n * 2 * math.pi for k in range(n)]]

def face(z, hair, beard=None, veil=None):   # 머리 — 얼굴, 머리카락(또는 너울), 수염
    paint(blob((0.01, 0, z), (0.045, 0.043, 0.05), n=12, jitter=0.08), solid(SKIN, 0.05))
    if beard: paint(blob((0.035, 0, z - 0.025), (0.026, 0.03, 0.028), n=10, jitter=0.2), solid(beard, 0.06))
    if veil:
        paint(blob((-0.005, 0, z + 0.022), (0.053, 0.05, 0.036), n=12, jitter=0.08), solid(veil, 0.04))
        paint(loft([(-0.01, 0, z + 0.04), (-0.035, 0, z - 0.03), (-0.05, 0, z - 0.13)], [0.05, 0.056, 0.05], sides=7, ell=(1.0, 1.1), wob=0.05), solid(veil, 0.04))
    else:
        paint(blob((-0.01, 0, z + 0.025), (0.05, 0.048, 0.03), n=12, jitter=0.15), solid(hair, 0.06))

# ── 앉은 손님 — 벤치(높이 0.12)에 앉아 상 아래로 다리를 넣었다. 축 head · arm(오른팔) ──
def _guest(name, seed, robe, robe_d, sash, hair, beard=None, veil=None, toast=True):
    begin(seed)
    paint(blob((-0.02, 0, 0.15), (0.08, 0.09, 0.045), n=12, jitter=0.12), shade(robe, robe_d))   # 앉은 엉덩이
    for y in (-1, 1):
        paint(loft([(0.0, y * 0.045, 0.14), (0.12, y * 0.05, 0.14), (0.14, y * 0.05, 0.02)], [0.035, 0.032, 0.025], sides=5, wob=0.05), shade(robe, robe_d))
        paint(blob((0.16, y * 0.05, 0.012), (0.03, 0.018, 0.012), n=6, jitter=0.1), solid(lin(0x8a6a4a)))
    paint(loft([(-0.02, 0, 0.15), (-0.01, 0, 0.3), (0.0, 0, 0.38)], [0.078, 0.068, 0.054], sides=7, wob=0.06), shade(robe, robe_d))
    paint(loft([(-0.015, 0, 0.21), (-0.012, 0, 0.24)], [0.074, 0.072], sides=7, wob=0.02), solid(sash))   # 띠
    # 왼팔 — 상 위에 얹었다
    paint(loft([(0.0, 0.065, 0.34), (0.07, 0.07, 0.27), (0.15, 0.05, 0.22)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(robe, robe_d))
    paint(blob((0.155, 0.05, 0.215), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    part('head', loc=(0.0, 0, 0.39))
    face(0.44, hair, beard, veil)
    base()
    part('arm', loc=(0.0, -0.065, 0.35))   # 오른팔 — 잔을 들어 올린다(축은 어깨)
    paint(loft([(0.0, -0.065, 0.35), (0.06, -0.075, 0.28), (0.13, -0.06, 0.24)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(robe, robe_d))
    paint(blob((0.135, -0.06, 0.235), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    if toast:
        paint(loft([(0.14, -0.06, 0.24), (0.14, -0.06, 0.27), (0.14, -0.06, 0.29)], [0.012, 0.018, 0.02], sides=6, wob=0), shade(GOLD, GOLD_D), METAL)   # 금잔
        paint(blob((0.14, -0.06, 0.285), (0.016, 0.016, 0.004), n=6, jitter=0), solid(WINE))
    base()
    finish(name, OUT)

def guest1(): _guest('guest1', 301, LINEN, LINEN_D, GOLD, lin(0x3a2a1a), beard=lin(0x3a2a1a))
def guest2(): _guest('guest2', 302, LINEN, LINEN_D, lin(0x8fb8d8), lin(0x5a3a22), veil=lin(0xeae4f4))

# ── 긴 잔칫상 — 낮은 나무 상에 흰 세마포를 덮었다. 윗면 높이 0.2 ──
def feasttable():
    begin(303)
    L, W, H = 0.62, 0.17, 0.2
    for x in (-L + 0.06, L - 0.06):
        for y in (-W + 0.04, W - 0.04): paint(cyl((x, y, 0), (x, y, H - 0.02), 0.018, sides=5), solid(WOOD_D))
    paint(hull([V(x, y, z) for x in (-L, L) for y in (-W, W) for z in (H - 0.025, H)]), shade(WOOD_L, WOOD))
    cloth = [V(x, y, H + 0.004) for x in (-L - 0.01, L + 0.01) for y in (-W - 0.01, W + 0.01)]
    paint(hull(cloth + [V(v.x, v.y, H + 0.012) for v in cloth]), shade(LINEN, LINEN_D, k=0.05))
    for s2 in (-1, 1):   # 앞뒤로 늘어진 천 자락(물결)
        pts = []
        for k in range(13):
            x = -L - 0.01 + k * (2 * L + 0.02) / 12
            pts += [V(x, s2 * (W + 0.012), H + 0.01), V(x, s2 * (W + 0.02), H - 0.07 - 0.015 * math.sin(k * 1.3))]
        paint(hull(pts), shade(LINEN, LINEN_D, k=0.05))
    paint(hull([V(x, y, H + 0.013) for x in (-L, L) for y in (-0.025, 0.025)] + [V(x, y, H + 0.016) for x in (-L, L) for y in (-0.025, 0.025)]), solid(GOLD))   # 가운데 금빛 띠
    finish('feasttable', OUT)

# ── 떡과 과일 — 상에 올리는 쟁반 둘: 떡 바구니, 포도·무화과·석류 ──
def breadfruit():
    begin(304)
    paint(hull(ring_pts((-0.12, 0), 0.09, 0.0, 12) + ring_pts((-0.12, 0), 0.1, 0.015, 12)), shade(GOLD, GOLD_D), METAL)   # 금쟁반
    for (x, y) in ((-0.15, 0.03), (-0.09, 0.04), (-0.12, -0.03), (-0.16, -0.04)):
        paint(blob((x, y, 0.035), (0.032, 0.026, 0.018), n=10, jitter=0.12), shade(BREAD, BREAD_D))
    paint(hull(ring_pts((0.12, 0), 0.09, 0.0, 12) + ring_pts((0.12, 0), 0.1, 0.015, 12)), shade(lin(0xc9a877), lin(0xa98a5c)))   # 나무 쟁반
    for k in range(9):   # 포도송이
        paint(blob((0.09 + (k % 3) * 0.018, -0.02 + (k // 3) * 0.016, 0.03 + (2 - k // 3) * 0.008), (0.011, 0.011, 0.011), n=6, jitter=0), solid(lin(0x5a2a5a), 0.08))
    for (x, y, c) in ((0.15, 0.04, lin(0x6a4a6a)), (0.17, -0.02, lin(0x6a4a6a)), (0.14, -0.05, lin(0xc0303a))):   # 무화과 둘 · 석류
        paint(blob((x, y, 0.035), (0.022, 0.022, 0.022), n=8, jitter=0.08), solid(c, 0.06))
    paint(cone(V(0.14, -0.05, 0.055), V(0.14, -0.05, 0.068), 0.008, sides=5), solid(lin(0x8a2028)))   # 석류 꼭지
    finish('breadfruit', OUT)

# ── 돌항아리 여섯 — 결례를 위한 석회암 항아리(요 2:6 「두세 통 드는 돌항아리 여섯이 놓였는지라」) ──
def stonejars():
    begin(305)
    for i in range(6):
        x = -0.12 + (i % 3) * 0.12; y = -0.06 + (i // 3) * 0.12; h = 0.17 + random.random() * 0.02
        paint(loft([(x, y, 0.0), (x, y, h * 0.12), (x, y, h * 0.55), (x, y, h * 0.8), (x, y, h * 0.9), (x, y, h)], [0.035, 0.052, 0.058, 0.045, 0.034, 0.04], sides=10, wob=0.02), shade(STONE_W, STONE_WD))   # 통처럼 보였다 → 어깨가 불룩하고 목이 좁은 항아리
        paint(loft(ring_pts((x, y), 0.041, h, 10), 0.007, sides=3, closed=True, wob=0), solid(STONE_WD))
        paint(hull(ring_pts((x, y), 0.034, h - 0.006, 10) + [V(x, y, h - 0.004)]), solid(lin(0xb8d8e8) if i % 2 else lin(0x9a2a44)))   # 물 — 몇은 포도주가 되었다(2:9)
        for k in range(6): paint(cyl((x + 0.058 * math.cos(k * 1.05), y + 0.058 * math.sin(k * 1.05), h * 0.28), (x + 0.058 * math.cos(k * 1.05), y + 0.058 * math.sin(k * 1.05), h * 0.7), 0.004, sides=3), solid(STONE_WD))   # 깎은 결
    finish('stonejars', OUT)

# ── 포도주 주전자와 잔 — 상 위에 놓는 은 주전자와 금잔 넷 ──
def winepitcher():
    begin(306)
    paint(loft([(0, 0, 0), (0, 0, 0.04), (0, 0, 0.1), (0, 0, 0.13)], [0.035, 0.045, 0.028, 0.032], sides=10, wob=0), shade(lin(0xd8dce0), lin(0xa8acb0)), METAL)
    paint(loft([(0.03, 0, 0.1), (0.06, 0, 0.13)], [0.008, 0.005], sides=4, wob=0), shade(lin(0xd8dce0), lin(0xa8acb0)), METAL)   # 부리
    paint(loft([(-0.03, 0, 0.11), (-0.06, 0, 0.09), (-0.04, 0, 0.04)], 0.006, sides=4, wob=0), shade(lin(0xd8dce0), lin(0xa8acb0)), METAL)   # 손잡이
    for (x, y) in ((0.09, 0.05), (0.11, -0.04), (-0.09, 0.05), (-0.1, -0.05)):
        paint(loft([(x, y, 0.0), (x, y, 0.01), (x, y, 0.04), (x, y, 0.05)], [0.016, 0.006, 0.016, 0.02], sides=7, wob=0), shade(GOLD, GOLD_D), METAL)
        paint(blob((x, y, 0.046), (0.016, 0.016, 0.004), n=6, jitter=0), solid(WINE))
    finish('winepitcher', OUT)

# ── 긴 의자 — 손님이 앉는 나무 의자(높이 0.12) ──
def guestbench():
    begin(307)
    paint(hull([V(x, y, z) for x in (-0.62, 0.62) for y in (-0.06, 0.06) for z in (0.105, 0.125)]), shade(WOOD_L, WOOD))
    for x in (-0.55, 0.0, 0.55):
        for y in (-0.045, 0.045): paint(cyl((x, y, 0.0), (x, y, 0.11), 0.012, sides=4), solid(WOOD_D))
    for x in (-0.3, 0.3): paint(hull([V(x + dx, y, 0.126) for dx in (-0.12, 0.12) for y in (-0.05, 0.05)] + [V(x, 0, 0.14)]), shade(lin(0xb05a6a), lin(0x8a4050)))   # 방석
    finish('guestbench', OUT)

# ── 꽃줄 기둥 — 두 기둥 사이로 늘어진 꽃줄과 리본(축 garland — 바람에 흔들린다) ──
def garland():
    begin(308)
    # 처음엔 꽃이 작고 줄이 가늘어 실처럼 보였다 → 굵은 잎 줄에 큰 꽃을 촘촘히, 기둥도 굵게
    for x in (-0.66, 0.66):
        paint(cyl((x, 0, 0), (x, 0, 0.64), 0.03, sides=6), shade(WOOD_L, WOOD))
        paint(loft([(x, 0, 0.62), (x, 0, 0.67)], [0.04, 0.034], sides=6, wob=0), solid(GOLD), METAL)
        for k in range(8):   # 기둥을 감은 잎과 꽃
            paint(blob((x + 0.032 * math.cos(k * 1.9), 0.032 * math.sin(k * 1.9), 0.06 + k * 0.07), (0.036, 0.03, 0.026), n=6, jitter=0.3), shade(LEAF, LEAF_D))
            if k % 2: paint(blob((x + 0.04 * math.cos(k * 1.9 + 1), 0.04 * math.sin(k * 1.9 + 1), 0.08 + k * 0.07), (0.022, 0.022, 0.02), n=6, jitter=0.2), solid(random.choice(FLOWERS), 0.06))
    part('garland', loc=(0, 0, 0.62))
    sag = lambda x: 0.62 - 0.15 * (1 - (x / 0.66) ** 2)
    for k in range(14):   # 잎 다발로 이은 줄
        x = -0.64 + k * 0.0985
        paint(blob((x, 0, sag(x)), (0.06, 0.04, 0.035), n=8, jitter=0.3), shade(LEAF, LEAF_D))
    for k in range(34):   # 큰 꽃
        x = -0.62 + random.random() * 1.24
        paint(blob((x, (random.random() - 0.5) * 0.05, sag(x) + (random.random() - 0.3) * 0.04), (0.032, 0.03, 0.028), n=8, jitter=0.2), solid(random.choice(FLOWERS), 0.06))
    for x in (-0.33, 0.0, 0.33):   # 늘어진 리본
        paint(loft([(x, 0, sag(x)), (x + 0.015, 0, sag(x) - 0.1), (x - 0.015, 0, sag(x) - 0.2)], [0.02, 0.016, 0.01], sides=3, ell=(1.0, 0.3), wob=0), solid(lin(0xf4c0d0)))
    base()
    finish('garland', OUT)

# ── 물 붓는 하인 — 「항아리에 물을 채우라」(요 2:7) 어깨에 멘 물동이를 기울여 붓는다(축 arms) ──
def servant():
    begin(309)
    TUN, TUN_D = lin(0xc8b48a), lin(0xa08c64)
    for y in (-1, 1):
        paint(cyl((0, y * 0.035, 0.2), (0.0, y * 0.045, 0.02), 0.024, sides=5), shade(TUN, TUN_D))
        paint(blob((0.02, y * 0.045, 0.012), (0.03, 0.018, 0.012), n=6, jitter=0.1), solid(lin(0x6b4a2e)))
    paint(loft([(0, 0, 0.14), (0, 0, 0.3), (0.0, 0, 0.42)], [0.068, 0.064, 0.054], sides=7, wob=0.06), shade(TUN, TUN_D))
    paint(loft([(0.0, 0, 0.19), (0.0, 0, 0.22)], [0.071, 0.071], sides=7, wob=0.02), solid(lin(0x7a4a2a)))
    part('head', loc=(0.0, 0, 0.43))
    face(0.48, lin(0x3a2a1a), beard=lin(0x3a2a1a))
    base()
    part('arms', loc=(0.0, 0, 0.38))   # 두 팔로 든 물동이 — 앞으로 기울여 붓는다
    for y in (-1, 1):
        paint(loft([(0, y * 0.065, 0.38), (0.06, y * 0.06, 0.34), (0.11, y * 0.04, 0.36)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(TUN, TUN_D))
    jar = [(0.14, 0, 0.3), (0.14, 0, 0.34), (0.14, 0, 0.4), (0.14, 0, 0.43)]
    paint(loft(jar, [0.035, 0.05, 0.035, 0.025], sides=8, wob=0.03), shade(CLAY, CLAY_D))
    base()
    finish('servant', OUT)

# ══ 세트 ② 등불 든 처녀들 (마 25:1-13 「등을 들고 신랑을 맞으러 나간 열 처녀」) ══
FLAME, FLAME_C = lin(0xffb040), lin(0xfff0b0)
DRESS_A, DRESS_AD = lin(0xf2ece0), lin(0xd6ccb8)      # 흰 옷
DRESS_B, DRESS_BD = lin(0xd8b8d8), lin(0xb898b8)      # 연보라 옷

def flame(c, s=1.0, name=None):   # 불꽃 — 빛나는 재질(GLOW). 바깥 주황 + 안쪽 밝은 심지
    c = Vector(c)
    paint(hull([c + V(0, 0, 0.045 * s)] + [c + V(math.cos(a) * 0.016 * s, math.sin(a) * 0.016 * s, 0.012 * s) for a in [k / 6 * 2 * math.pi for k in range(6)]] + [c]), solid(FLAME), GLOW)
    paint(hull([c + V(0, 0, 0.028 * s)] + [c + V(math.cos(a) * 0.007 * s, math.sin(a) * 0.007 * s, 0.008 * s) for a in [k / 5 * 2 * math.pi for k in range(5)]]), solid(FLAME_C), GLOW)

def handlamp(c):   # 들고 다니는 등 — 짧은 막대 위 흙 등잔, 위에 불꽃
    c = Vector(c)
    paint(cyl(c, c + V(0, 0, 0.16), 0.008, sides=4), solid(WOOD_D))
    paint(hull([c + V(math.cos(a) * r, math.sin(a) * r, z) for a in [k / 8 * 2 * math.pi for k in range(8)] for r, z in ((0.01, 0.15), (0.022, 0.175), (0.018, 0.19))]), shade(CLAY, CLAY_D))
    flame(c + V(0, 0, 0.19), 1.8)   # 처음엔 불꽃이 작아 등이 갈색 공처럼 보였다 → 등잔은 작게, 불꽃은 크게

def _maiden(name, seed, dress, dress_d, veil):
    begin(seed)
    paint(loft([(0, 0, 0.0), (0, 0, 0.12), (0, 0, 0.21)], [0.085, 0.07, 0.06], sides=8, wob=0.05), shade(dress, dress_d))   # 긴 옷
    for y in (-1, 1): paint(blob((0.05, y * 0.035, 0.01), (0.028, 0.017, 0.011), n=6, jitter=0.1), solid(lin(0x8a6a4a)))
    paint(loft([(0, 0, 0.2), (0, 0, 0.33), (0.0, 0, 0.4)], [0.06, 0.058, 0.05], sides=7, wob=0.05), shade(dress, dress_d))
    paint(loft([(0.0, 0, 0.22), (0.0, 0, 0.245)], [0.064, 0.062], sides=7, wob=0.02), solid(GOLD))   # 금빛 띠
    # 왼팔 — 기름 그릇을 안았다(25:4)
    paint(loft([(0.0, 0.06, 0.37), (0.04, 0.07, 0.3), (0.07, 0.03, 0.28)], [0.02, 0.019, 0.016], sides=5, wob=0), shade(dress, dress_d))
    paint(loft([(0.075, 0.03, 0.24), (0.075, 0.03, 0.27), (0.075, 0.03, 0.3)], [0.018, 0.026, 0.012], sides=7, wob=0), shade(CLAY, CLAY_D))
    part('head', loc=(0.0, 0, 0.41))
    face(0.45, None, veil=veil)
    base()
    part('lamp', loc=(0.0, -0.065, 0.37))   # 오른팔 — 등을 앞으로 들었다(축은 어깨, 조금씩 흔들린다)
    paint(loft([(0, -0.065, 0.37), (0.06, -0.075, 0.32), (0.12, -0.065, 0.3)], [0.02, 0.019, 0.016], sides=5, wob=0), shade(dress, dress_d))
    paint(blob((0.125, -0.065, 0.3), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    handlamp((0.13, -0.065, 0.22))
    base()
    finish(name, OUT)

def virgin1(): _maiden('virgin1', 311, DRESS_A, DRESS_AD, lin(0xf8f4ea))
def virgin2(): _maiden('virgin2', 312, DRESS_B, DRESS_BD, lin(0xf0e4f0))

# ── 졸다 잠든 처녀 — 「신랑이 더디 오므로 다 졸며 잘새」(25:5) 의자에 앉아 고개를 떨군다. 곁에 등 · 축 head(꾸벅) · body(숨) ──
def sleepvirgin():
    begin(313)
    paint(blob((-0.02, 0, 0.15), (0.08, 0.09, 0.045), n=12, jitter=0.12), shade(DRESS_A, DRESS_AD))
    for y in (-1, 1):
        paint(loft([(0.0, y * 0.04, 0.14), (0.11, y * 0.045, 0.14), (0.13, y * 0.045, 0.02)], [0.035, 0.032, 0.025], sides=5, wob=0.05), shade(DRESS_A, DRESS_AD))
    part('body', loc=(-0.02, 0, 0.16))
    paint(loft([(-0.02, 0, 0.16), (0.0, 0, 0.28), (0.03, 0, 0.35)], [0.072, 0.064, 0.05], sides=7, wob=0.06), shade(DRESS_A, DRESS_AD))   # 앞으로 조금 숙였다
    for y in (-1, 1): paint(loft([(0.02, y * 0.06, 0.33), (0.08, y * 0.06, 0.24), (0.1, y * 0.02, 0.2)], [0.02, 0.019, 0.016], sides=5, wob=0), shade(DRESS_A, DRESS_AD))   # 무릎 위로 모은 손
    part('head', loc=(0.03, 0, 0.36))
    paint(blob((0.06, 0, 0.39), (0.042, 0.04, 0.046), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(blob((0.045, 0, 0.415), (0.052, 0.05, 0.035), n=12, jitter=0.08), solid(lin(0xf8f4ea), 0.04))
    paint(loft([(0.04, 0, 0.43), (0.01, 0, 0.36), (-0.01, 0, 0.27)], [0.05, 0.055, 0.05], sides=7, ell=(1.0, 1.1), wob=0.05), solid(lin(0xf8f4ea), 0.04))
    base()
    paint(loft([(0.16, 0.12, 0.0), (0.16, 0.12, 0.02), (0.16, 0.12, 0.035)], [0.03, 0.04, 0.03], sides=8, wob=0), shade(CLAY, CLAY_D))   # 바닥에 내려놓은 등잔
    flame((0.16, 0.12, 0.035), 1.2)
    finish('sleepvirgin', OUT)

# ── 기름 그릇 — 작은 기름병 셋과 깔때기(「슬기 있는 자들은 그릇에 기름을 담아」 25:4) ──
def oilflasks():
    begin(314)
    for (x, y, h) in ((-0.05, 0.0, 0.1), (0.04, 0.04, 0.085), (0.03, -0.05, 0.075)):
        paint(loft([(x, y, 0.0), (x, y, h * 0.4), (x, y, h * 0.8), (x, y, h)], [0.025, 0.035, 0.014, 0.016], sides=8, wob=0.02), shade(CLAY, CLAY_D))
        paint(blob((x, y, h + 0.006), (0.012, 0.012, 0.008), n=6, jitter=0.1), solid(lin(0xd8c890)))   # 마개
    paint(blob((0.0, 0.0, 0.002), (0.1, 0.09, 0.004), n=8, jitter=0.2), solid(lin(0x8a7a40), 0.05))   # 흘린 기름 자국
    finish('oilflasks', OUT)

# ── 기름 항아리 — 큰 올리브기름 항아리와 국자 ──
def oiljar():
    begin(315)
    paint(loft([(0, 0, 0.0), (0, 0, 0.05), (0, 0, 0.17), (0, 0, 0.24), (0, 0, 0.27)], [0.05, 0.09, 0.085, 0.045, 0.05], sides=10, wob=0.03), shade(CLAY, CLAY_D))
    paint(hull(ring_pts((0, 0), 0.042, 0.265, 10) + [V(0, 0, 0.26)]), solid(lin(0x9a8a30)))   # 금빛 기름
    for s2 in (-1, 1): paint(loft([(0, s2 * 0.06, 0.24), (0, s2 * 0.1, 0.22), (0, s2 * 0.085, 0.17)], 0.01, sides=4, wob=0), shade(CLAY, CLAY_D))   # 손잡이
    paint(cyl((0.02, 0.0, 0.2), (0.07, 0.0, 0.33), 0.006, sides=4), solid(WOOD))   # 국자 자루
    finish('oiljar', OUT)

# ── 등잔대 — 돌 받침 위 기둥에 일곱 갈래가 아닌 하나의 큰 등잔(성막의 등잔대와 구별) ──
def lampstand():
    begin(316)
    paint(hull(ring_pts((0, 0), 0.08, 0.0, 8) + ring_pts((0, 0), 0.06, 0.05, 8)), shade(STONE_W, STONE_WD))
    paint(cyl((0, 0, 0.05), (0, 0, 0.5), 0.018, sides=6), shade(WOOD_L, WOOD))
    paint(hull(ring_pts((0, 0), 0.02, 0.5, 8) + ring_pts((0, 0), 0.06, 0.54, 8) + ring_pts((0, 0), 0.055, 0.56, 8)), shade(GOLD, GOLD_D), METAL)
    flame((0, 0, 0.56), 2.4)
    finish('lampstand', OUT)

# ── 등잔 줄 — 낮은 돌턱 위에 작은 흙 등잔 다섯(모두 불이 켜졌다) ──
def oillamps():
    begin(317)
    for k in range(7): paint(blob((-0.33 + k * 0.11, 0, 0.04), (0.06, 0.05, 0.045), n=8, jitter=0.2), shade(STONE_W, STONE_WD))
    paint(hull([V(x, y, z) for x in (-0.36, 0.36) for y in (-0.045, 0.045) for z in (0.07, 0.085)]), shade(STONE_W, STONE_WD))
    for k in range(5):
        x = -0.28 + k * 0.14
        pts = [V(x + math.cos(a) * 0.035, math.sin(a) * 0.024, z) for a in [i / 10 * 2 * math.pi for i in range(10)] for z in (0.085, 0.105)] + [V(x + 0.05, 0, 0.1)]   # 헤롯 시대 흙 등잔(부리가 앞으로)
        paint(hull(pts), shade(CLAY, CLAY_D))
        flame((x + 0.045, 0, 0.103), 1.25)
    finish('oillamps', OUT)

# ── 걸린 등불 기둥 — 갈고리 기둥에 매단 등불(축 lantern — 바람에 흔들린다) ──
def lanternpole():
    begin(318)
    paint(cyl((0, 0, 0), (0, 0, 0.62), 0.02, sides=6), shade(WOOD_L, WOOD))
    paint(cyl((0, 0, 0.6), (0.16, 0, 0.6), 0.012, sides=4), solid(WOOD_D))
    part('lantern', loc=(0.15, 0, 0.6))
    paint(cyl((0.15, 0, 0.6), (0.15, 0, 0.52), 0.003, sides=3), solid(lin(0x3a3a3a)))
    paint(hull([V(0.15 + x, y, z) for x in (-0.035, 0.035) for y in (-0.035, 0.035) for z in (0.43, 0.43)] + [V(0.15, 0, 0.52), V(0.15, 0, 0.42)]), shade(GOLD, GOLD_D), METAL)   # 등 갓
    for x in (-0.03, 0.03):
        for y in (-0.03, 0.03): paint(cyl((0.15 + x, y, 0.44), (0.15 + x, y, 0.48), 0.003, sides=3), solid(GOLD_D), METAL)
    flame((0.15, 0, 0.435), 1.4)
    base()
    finish('lanternpole', OUT)

# ── 기다리는 돌 의자 — 높이 0.14 ──
def waitbench():
    begin(319)
    paint(hull([V(x, y, z) for x in (-0.45, 0.45) for y in (-0.08, 0.08) for z in (0.11, 0.14)]), shade(STONE_W, STONE_WD))
    for x in (-0.36, 0.36): paint(hull([V(x + dx, y, z) for dx in (-0.06, 0.06) for y in (-0.07, 0.07) for z in (0.0, 0.11)]), shade(STONE_W, STONE_WD))
    finish('waitbench', OUT)

# ── 등불이 꺼져가는 처녀 — 「미련한 자들은 등을 가지되 기름을 가지지 아니하였고」(25:3) · 「우리 등불이 꺼져가니」(25:8)
#    기름 그릇 없이 빈손, 등에는 꺼져가는 불씨와 연기 한 줄기. 두리번거린다(축 head · lamp) (10/2 사용자: 미련한 다섯도 넣자)
def foolvirgin():
    begin(320)
    D, DD = lin(0xe8d8b0), lin(0xc8b890)
    paint(loft([(0, 0, 0.0), (0, 0, 0.12), (0, 0, 0.21)], [0.085, 0.07, 0.06], sides=8, wob=0.05), shade(D, DD))
    for y in (-1, 1): paint(blob((0.05, y * 0.035, 0.01), (0.028, 0.017, 0.011), n=6, jitter=0.1), solid(lin(0x8a6a4a)))
    paint(loft([(0, 0, 0.2), (0, 0, 0.33), (0.0, 0, 0.4)], [0.06, 0.058, 0.05], sides=7, wob=0.05), shade(D, DD))
    paint(loft([(0.0, 0.06, 0.37), (0.03, 0.08, 0.3), (0.06, 0.09, 0.25)], [0.02, 0.019, 0.016], sides=5, wob=0), shade(D, DD))   # 빈 왼손 — 펼쳤다
    paint(blob((0.065, 0.092, 0.245), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    part('head', loc=(0.0, 0, 0.41))
    face(0.45, None, veil=lin(0xf0e6cc))
    base()
    part('lamp', loc=(0.0, -0.065, 0.37))
    paint(loft([(0, -0.065, 0.37), (0.06, -0.075, 0.32), (0.12, -0.065, 0.3)], [0.02, 0.019, 0.016], sides=5, wob=0), shade(D, DD))
    paint(blob((0.125, -0.065, 0.3), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    c = V(0.13, -0.065, 0.22)
    paint(cyl(c, c + V(0, 0, 0.16), 0.008, sides=4), solid(WOOD_D))
    paint(hull([c + V(math.cos(a) * r, math.sin(a) * r, z) for a in [k / 8 * 2 * math.pi for k in range(8)] for r, z in ((0.01, 0.15), (0.022, 0.175), (0.018, 0.19))]), shade(CLAY, CLAY_D))
    paint(blob(c + V(0, 0, 0.192), (0.008, 0.008, 0.005), n=6, jitter=0.1), solid(lin(0xa83a10)), GLOW)   # 꺼져가는 불씨
    for k in range(3): paint(blob(c + V(0.01 * k, 0, 0.215 + k * 0.03), (0.012 + k * 0.004, 0.012 + k * 0.004, 0.012), n=6, jitter=0.3), solid(lin(0x8a8a8a)))   # 연기
    base()
    finish('foolvirgin', OUT)

# ══ 세트 ③ 혼인 천막과 문 (마 25:10 「준비하였던 자들은 함께 혼인 잔치에 들어가고 문은 닫힌지라」 · 시 150:4) ══
def _stand_body(robe, robe_d, sash=None, s=1.0):   # 선 사람 몸 — 다리·겉옷·띠 (머리·팔은 따로)
    for y in (-1, 1):
        paint(cyl((0, y * 0.035 * s, 0.2 * s), (0.0, y * 0.045 * s, 0.02 * s), 0.024 * s, sides=5), shade(robe, robe_d))
        paint(blob((0.02 * s, y * 0.045 * s, 0.012 * s), (0.03 * s, 0.018 * s, 0.012 * s), n=6, jitter=0.1), solid(lin(0x6b4a2e)))
    paint(loft([(0, 0, 0.05 * s), (0, 0, 0.3 * s), (0.0, 0, 0.42 * s)], [0.075 * s, 0.066 * s, 0.054 * s], sides=7, wob=0.05), shade(robe, robe_d))
    if sash: paint(loft([(0.0, 0, 0.19 * s), (0.0, 0, 0.22 * s)], [0.07 * s, 0.07 * s], sides=7, wob=0.02), solid(sash))

# ── 혼인 천막 — 네 기둥 위 금빛 테를 두른 흰 천(축 cloth — 바람에 흔들린다), 기둥마다 꽃, 아래 깔개 ──
def weddingtent():
    begin(321)
    paint(hull([V(x, y, z) for x in (-0.42, 0.42) for y in (-0.34, 0.34) for z in (0.0, 0.012)]), shade(lin(0xb05a6a), lin(0x8a4050)))   # 붉은 깔개
    paint(hull([V(x, y, z) for x in (-0.38, 0.38) for y in (-0.3, 0.3) for z in (0.012, 0.016)]), solid(GOLD))
    for x in (-0.38, 0.38):
        for y in (-0.3, 0.3):
            paint(cyl((x, y, 0), (x, y, 0.62), 0.016, sides=6), shade(GOLD, GOLD_D), METAL)
            for k in range(4): paint(blob((x + 0.02 * math.cos(k * 2), y + 0.02 * math.sin(k * 2), 0.15 + k * 0.12), (0.026, 0.024, 0.022), n=6, jitter=0.25), solid(random.choice(FLOWERS), 0.06))
    part('cloth', loc=(0, 0, 0.62))
    top = []
    for i in range(7):
        for j in range(6):
            x = -0.4 + i * (0.8 / 6); y = -0.32 + j * (0.64 / 5)
            sag = 0.05 * (1 - (x / 0.4) ** 2) * (1 - (y / 0.32) ** 2)
            top.append(V(x, y, 0.64 - sag))
    paint(hull(top + [V(0, 0, 0.6)]), shade(LINEN, LINEN_D, k=0.04))
    for s2 in (-1, 1):   # 앞뒤로 늘어진 술 달린 천
        pts = []
        for k in range(9):
            x = -0.41 + k * 0.1025
            pts += [V(x, s2 * 0.33, 0.64), V(x, s2 * 0.335, 0.56 - 0.012 * math.sin(k * 1.4))]
        paint(hull(pts), shade(LINEN, LINEN_D, k=0.04))
        paint(loft([V(-0.41 + k * 0.1025, s2 * 0.337, 0.565) for k in range(9)], 0.008, sides=3, wob=0), solid(GOLD))
    base()
    finish('weddingtent', OUT)

# ── 꽃 아치 문 — 두 기둥과 꽃 아치, 양쪽으로 여는 나무 문(축 doorL · doorR — 큰 세트에서 「문은 닫힌지라」) ──
def flowerarch():
    begin(322)
    for x in (-0.34, 0.34):
        paint(hull([V(x + dx, dy, z) for dx in (-0.04, 0.04) for dy in (-0.04, 0.04) for z in (0.0, 0.5)]), shade(STONE_W, STONE_WD))
        for k in range(6): paint(blob((x + (random.random() - 0.5) * 0.06, -0.045, 0.06 + k * 0.08), (0.03, 0.02, 0.028), n=6, jitter=0.3), shade(LEAF, LEAF_D))
    arc = [V(math.cos(a) * 0.34, 0, 0.5 + math.sin(a) * 0.2) for a in [k / 12 * math.pi for k in range(13)]]
    paint(loft(arc, 0.035, sides=5, wob=0.05), shade(LEAF, LEAF_D))
    for k in range(26):
        a = random.random() * math.pi
        paint(blob((math.cos(a) * 0.34 + (random.random() - 0.5) * 0.04, (random.random() - 0.5) * 0.06, 0.5 + math.sin(a) * 0.2 + (random.random() - 0.5) * 0.04), (0.03, 0.028, 0.026), n=7, jitter=0.2), solid(random.choice(FLOWERS), 0.06))
    for x0, s2, nm in ((-0.3, 1, 'doorL'), (0.3, -1, 'doorR')):   # 문짝 — 기둥 안쪽 경첩에서 가운데로
        part(nm, loc=(x0, 0, 0.0))
        paint(hull([V(x0 + s2 * dx, dy, z) for dx in (0.0, 0.295) for dy in (-0.012, 0.012) for z in (0.0, 0.46)]), shade(WOOD_L, WOOD, k=0.1))
        for z in (0.1, 0.36): paint(cyl((x0, -0.016, z), (x0 + s2 * 0.29, -0.016, z), 0.008, sides=3), solid(WOOD_D))
        paint(blob((x0 + s2 * 0.25, -0.02, 0.24), (0.012, 0.008, 0.012), n=6, jitter=0), solid(GOLD), METAL)   # 고리
        base()
    finish('flowerarch', OUT)

# ── 소고 치는 여인 — 왼손에 소고를 들고 오른손으로 친다(시 150:4) · 축 arms ──
def drummer():
    begin(323)
    R2, R2D = lin(0xd88a6a), lin(0xb06a4a)
    _stand_body(R2, R2D, GOLD)
    part('head', loc=(0.0, 0, 0.43))
    face(0.47, None, veil=lin(0xf4e8d0))
    base()
    part('arms', loc=(0.0, 0, 0.38))
    paint(loft([(0, 0.065, 0.38), (0.05, 0.09, 0.42), (0.08, 0.08, 0.47)], [0.02, 0.019, 0.016], sides=5, wob=0), shade(R2, R2D))   # 왼팔 — 소고를 들었다
    ring = [V(0.1 + math.cos(a) * 0.006, 0.08 + math.cos(a) * 0.055, 0.49 + math.sin(a) * 0.055) for a in [k / 12 * 2 * math.pi for k in range(12)]]
    paint(loft(ring, 0.01, sides=4, closed=True, wob=0), solid(WOOD))
    paint(hull(ring), solid(lin(0xf0e2c0)))   # 가죽
    for a in (0.5, 2.1, 3.7, 5.3): paint(blob((0.1, 0.08 + math.cos(a) * 0.058, 0.49 + math.sin(a) * 0.058), (0.008, 0.008, 0.008), n=5, jitter=0), solid(GOLD), METAL)   # 방울
    paint(loft([(0, -0.065, 0.38), (0.06, -0.04, 0.42), (0.09, 0.03, 0.47)], [0.02, 0.019, 0.016], sides=5, wob=0), shade(R2, R2D))   # 오른팔 — 친다
    paint(blob((0.092, 0.035, 0.47), (0.016, 0.016, 0.016), n=6, jitter=0), solid(SKIN))
    base()
    finish('drummer', OUT)

# ── 나팔 부는 사람 — 긴 은나팔을 들어 분다(민 10:2) · 축 arms ──
def trumpeter():
    begin(324)
    R2, R2D = lin(0x5a7a9a), lin(0x45607a)
    _stand_body(R2, R2D, GOLD)
    part('head', loc=(0.0, 0, 0.43))
    face(0.47, lin(0x3a2a1a), beard=lin(0x3a2a1a))
    base()
    part('arms', loc=(0.0, 0, 0.38))
    for y in (-1, 1): paint(loft([(0, y * 0.065, 0.38), (0.06, y * 0.05, 0.42), (0.08, y * 0.015, 0.46)], [0.02, 0.019, 0.016], sides=5, wob=0), shade(R2, R2D))
    paint(loft([(0.05, 0, 0.47), (0.2, 0, 0.53), (0.3, 0, 0.57)], [0.008, 0.01, 0.012], sides=6, wob=0), shade(lin(0xe0e4e8), lin(0xa8acb0)), METAL)
    paint(loft([(0.3, 0, 0.57), (0.34, 0, 0.585)], [0.012, 0.04], sides=8, wob=0), shade(lin(0xe0e4e8), lin(0xa8acb0)), METAL)   # 나팔 끝
    base()
    finish('trumpeter', OUT)

# ── 문지기 — 지팡이를 짚고 문 곁에 선다(요 10:3) · 축 head ──
def doorkeeper():
    begin(325)
    R2, R2D = lin(0x7a6a8a), lin(0x5e506e)
    _stand_body(R2, R2D, lin(0xc8a050))
    paint(loft([(0, 0.065, 0.38), (0.03, 0.08, 0.3), (0.07, 0.075, 0.27)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(R2, R2D))
    paint(cyl((0.08, 0.075, 0.0), (0.08, 0.075, 0.56), 0.01, sides=5), shade(WOOD_L, WOOD))
    paint(loft([(0, -0.065, 0.38), (0.01, -0.075, 0.28), (0.02, -0.07, 0.2)], [0.022, 0.02, 0.017], sides=5, wob=0), shade(R2, R2D))
    part('head', loc=(0.0, 0, 0.43))
    face(0.47, lin(0x6a6a6a), beard=lin(0xb8b0a0))
    base()
    finish('doorkeeper', OUT)

# ── 꽃잎 뿌리는 아이 — 바구니에서 꽃잎을 집어 뿌린다(축 arm) · 키 0.75배 ──
def flowergirl():
    begin(326)
    S = 0.75; R2, R2D = lin(0xf4c0d0), lin(0xd8a0b4)
    paint(loft([(0, 0, 0.0), (0, 0, 0.12 * S), (0, 0, 0.21 * S)], [0.08 * S, 0.065 * S, 0.055 * S], sides=8, wob=0.05), shade(R2, R2D))
    paint(loft([(0, 0, 0.2 * S), (0, 0, 0.33 * S), (0.0, 0, 0.4 * S)], [0.058 * S, 0.056 * S, 0.048 * S], sides=7, wob=0.05), shade(R2, R2D))
    paint(loft([(0.0, 0.055 * S, 0.37 * S), (0.05 * S, 0.07 * S, 0.3 * S), (0.08 * S, 0.04 * S, 0.27 * S)], 0.018 * S, sides=5, wob=0), shade(R2, R2D))
    bc = V(0.1 * S, 0.04 * S, 0.24 * S)   # 꽃바구니
    paint(hull([bc + V(math.cos(a) * r, math.sin(a) * r, z) for a in [k / 8 * 2 * math.pi for k in range(8)] for r, z in ((0.025, -0.02), (0.035, 0.015))]), shade(lin(0xc9a868), lin(0xa0844c)))
    for k in range(6): paint(blob(bc + V((random.random() - 0.5) * 0.04, (random.random() - 0.5) * 0.04, 0.018), (0.012, 0.012, 0.008), n=5, jitter=0.2), solid(random.choice(FLOWERS), 0.06))
    part('head', loc=(0.0, 0, 0.41 * S))
    paint(blob((0.01, 0, 0.45 * S), (0.045 * S, 0.043 * S, 0.05 * S), n=12, jitter=0.08), solid(SKIN, 0.05))
    paint(blob((-0.01, 0, 0.47 * S), (0.05 * S, 0.048 * S, 0.035 * S), n=12, jitter=0.15), solid(lin(0x5a3a22), 0.06))
    paint(loft([V(-0.005 + math.cos(t) * 0.04 * S, math.sin(t) * 0.04 * S, 0.49 * S) for t in [k / 10 * 2 * math.pi for k in range(10)]], 0.008, sides=3, closed=True, wob=0), solid(lin(0xffffff)))   # 화관
    base()
    part('arm', loc=(0.0, -0.055 * S, 0.37 * S))
    paint(loft([(0.0, -0.055 * S, 0.37 * S), (0.05 * S, -0.07 * S, 0.3 * S), (0.09 * S, -0.06 * S, 0.27 * S)], 0.018 * S, sides=5, wob=0), shade(R2, R2D))
    paint(blob((0.095 * S, -0.06 * S, 0.27 * S), (0.013, 0.013, 0.013), n=6, jitter=0), solid(SKIN))
    base()
    finish('flowergirl', OUT)

# ── 꽃잎 뿌린 길 — 흰 세마포를 깔고 꽃잎을 뿌린 길(문에서 천막까지) ──
def petalpath():
    begin(327)
    paint(hull([V(x, y, z) for x in (-0.15, 0.15) for y in (-0.62, 0.62) for z in (0.0, 0.006)]), shade(LINEN, LINEN_D, k=0.04))
    for s2 in (-1, 1): paint(hull([V(s2 * x, y, z) for x in (0.14, 0.155) for y in (-0.62, 0.62) for z in (0.006, 0.009)]), solid(GOLD))
    for k in range(60):
        paint(blob((random.random() * 0.36 - 0.18, random.random() * 1.24 - 0.62, 0.008), (0.012, 0.009, 0.003), n=5, jitter=0.3), solid(random.choice(FLOWERS), 0.06))
    finish('petalpath', OUT)

# ── 꽃 항아리 둘 — 금빛 띠 두른 항아리에 꽃을 가득 꽂았다 ──
def flowerurns():
    begin(328)
    for x in (-0.2, 0.2):
        paint(loft([(x, 0, 0.0), (x, 0, 0.04), (x, 0, 0.13), (x, 0, 0.18)], [0.04, 0.065, 0.05, 0.06], sides=10, wob=0.02), shade(STONE_W, STONE_WD))
        paint(loft(ring_pts((x, 0), 0.066, 0.06, 12), 0.006, sides=3, closed=True, wob=0), solid(GOLD), METAL)
        paint(blob((x, 0, 0.21), (0.07, 0.07, 0.05), n=10, jitter=0.3), shade(LEAF, LEAF_D))
        for k in range(10):
            a = random.random() * 2 * math.pi; r = random.random() * 0.06
            paint(blob((x + math.cos(a) * r, math.sin(a) * r, 0.22 + random.random() * 0.05), (0.022, 0.022, 0.02), n=6, jitter=0.2), solid(random.choice(FLOWERS), 0.06))
    finish('flowerurns', OUT)

# ── 횃불 한 쌍 — 길 양쪽 받침대 위 횃불(빛남) ──
def torches():
    begin(329)
    for x in (-0.22, 0.22):
        paint(hull(ring_pts((x, 0), 0.04, 0.0, 6) + ring_pts((x, 0), 0.03, 0.03, 6)), shade(STONE_W, STONE_WD))
        paint(cyl((x, 0, 0.03), (x, 0, 0.42), 0.012, sides=5), solid(WOOD_D))
        paint(hull(ring_pts((x, 0), 0.015, 0.42, 6) + ring_pts((x, 0), 0.035, 0.47, 6)), shade(GOLD, GOLD_D), METAL)
        flame((x, 0, 0.465), 2.2)
    finish('torches', OUT)

# ══ 큰 세트 「보라 신랑이로다」 바닥 — 꽃 울타리가 안(잔치 마당)과 밖(기다리는 들)을 나누고, 문 자리만 비웠다.
#    게임 좌표(큰 세트 안, 1.5배 전): 블렌더 x = 게임 x, 블렌더 y = −게임 z. 문(꽃 아치)은 x −1.2, z 0.2 — game.js NJ_BIG.bridegroom과 같다
GATE_X, HEDGE_Z = -1.2, 0.2
def weddingbase():
    begin(331)
    G = lambda x, z, h=0.0: V(x, -z, h)
    rim = [G(math.cos(a) * 3.4 * (1 + (random.random() - 0.5) * 0.04), 0.1 + math.sin(a) * 1.95 * (1 + (random.random() - 0.5) * 0.06)) for a in [k / 30 * 2 * math.pi for k in range(30)]]
    paint(hull(rim + [V(v.x, v.y, 0.008) for v in rim]), shade(lin(0x86b862), lin(0x6a9a4a), k=0.06))   # 바깥 들
    inner = [G(math.cos(a) * 3.1, -0.85 + math.sin(a) * 1.0) for a in [k / 24 * 2 * math.pi for k in range(24)]]
    inner = [V(v.x, max(v.y, -HEDGE_Z + 0.02), 0.0) for v in inner]
    paint(hull(inner + [V(v.x, v.y, 0.012) for v in inner]), shade(lin(0xa8d47a), lin(0x88b45a), k=0.05))   # 잔치 마당(밝은 풀)
    path = [G(GATE_X + (random.random() - 0.5) * 0.04, z, 0.0) for z in (1.95, 1.5, 1.0, 0.55)]
    paint(loft([V(v.x, v.y, 0.013) for v in path], 0.15, sides=4, ell=(1.0, 0.05), wob=0.1), shade(lin(0xc9a877), lin(0xa98a5c), k=0.1))   # 문으로 오는 흙길
    for x0, x1 in ((-3.15, GATE_X - 0.4), (GATE_X + 0.4, 3.15)):   # 꽃 울타리 — 문 자리만 비운다
        n = int((x1 - x0) / 0.13)
        for k in range(n + 1):
            x = x0 + k * (x1 - x0) / n
            paint(blob(G(x, HEDGE_Z, 0.1), (0.09, 0.07, 0.11), n=8, jitter=0.25), shade(lin(0x4f8a42), lin(0x3a6e30)))
            if random.random() < 0.6: paint(blob(G(x + (random.random() - 0.5) * 0.06, HEDGE_Z - 0.06, 0.15 + random.random() * 0.06), (0.025, 0.02, 0.022), n=6, jitter=0.2), solid(random.choice(FLOWERS), 0.06))
    for (x, z, r) in ((-3.0, 1.4, 0.16), (3.0, 1.3, 0.18), (2.9, -1.4, 0.2), (-2.9, -1.3, 0.18)):   # 덤불
        paint(blob(G(x, z, r * 0.6), (r, r, r * 0.7), n=12, jitter=0.3), shade(lin(0x5f9a4a), lin(0x467d38)))
    for k in range(50):   # 풀과 들꽃
        x = -3.2 + random.random() * 6.4; z = -1.8 + random.random() * 3.8
        if ((x / 3.4) ** 2 + ((z - 0.1) / 1.95) ** 2) > 0.9 or abs(z - HEDGE_Z) < 0.15 or abs(x - GATE_X) < 0.3: continue
        c = G(x, z, 0.012)
        paint(cone(c, c + V((random.random() - 0.5) * 0.03, (random.random() - 0.5) * 0.03, 0.06), 0.012, 3), solid(lin(0x6a9a4a), 0.08))
        if random.random() < 0.4: paint(blob(c + V(0, 0, 0.06), (0.015, 0.015, 0.012), n=5, jitter=0.2), solid(random.choice(FLOWERS), 0.06))
    finish('weddingbase', OUT)

ALL = [feasttable, breadfruit, stonejars, winepitcher, guestbench, guest1, guest2, garland, servant,
       virgin1, virgin2, sleepvirgin, oilflasks, oiljar, lampstand, oillamps, lanternpole, waitbench, foolvirgin,
       weddingtent, flowerarch, drummer, trumpeter, doorkeeper, flowergirl, petalpath, flowerurns, torches, weddingbase]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
