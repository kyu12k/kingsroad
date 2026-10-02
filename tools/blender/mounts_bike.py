# 🚲 자전거 (2026-10-02) — 3D 걸어서 구경의 오늘의 탈것. 처음 타는 사람을 위한 값싼 탈것(시티 자전거, 앞이 낮은 스텝스루 프레임)
# 실행: blender -b -P mounts_bike.py -- <출력 폴더> [이름 …]   → models/mounts/mt_bicycle_*.glb · gd_bicycle_*.glb
# 앞 = 블렌더 +x, 원점 = 두 바퀴 사이 땅(finish center=False — 장식이 같은 원점에 맞물린다). 사람 키 약 0.53 기준
# 움직이는 부분: wheelF·wheelR(굴대 중심, y축으로 돈다) · crank(크랭크 축, 페달 둘) · bars(헤드튜브 위, 핸들·벨)
# 장식: basket·bell = bars 축에 붙는다(핸들과 함께 꺾인다) · rack·flag = 몸통
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))

TIRE, TIRE_D = lin(0x2a2a2e), lin(0x1a1a1c)
SILVER, SILVER_D = lin(0xd0d4da), lin(0x9aa0a8)
BLACK = lin(0x26262a)
SADDLE, SADDLE_D = lin(0x5a3a26), lin(0x3e2618)
GRIP = lin(0x6b4a30)
WOOD, WOOD_D = lin(0xc89a62), lin(0x9a7044)
REED, REED_D = lin(0xc9a868), lin(0x9a7c48)
FLOWERS = [lin(0xf4a6c0), lin(0xffffff), lin(0xf6d77a), lin(0xe57a9a), lin(0xb48ae0)]
LEAF = lin(0x6f9a45)

# ── 뼈대 치수 ──
WR = 0.135                          # 바퀴 바깥 반지름(타이어 끝)
RA = V(-0.22, 0, WR)                # 뒷바퀴 굴대
FA = V(0.22, 0, WR)                 # 앞바퀴 굴대
BB = V(-0.02, 0, 0.115)             # 크랭크 축
CR = 0.048                          # 크랭크 길이
SEAT_TOP = V(-0.075, 0, 0.29)       # 시트튜브 끝
SADDLE_C = V(-0.092, 0, 0.335)      # 안장 가운데(앉는 자리)
_AX = V(-math.sin(math.radians(18)), 0, math.cos(math.radians(18)))   # 조향축(위로 갈수록 뒤로)
HT0 = FA + _AX * 0.135              # 헤드튜브 아래
HT1 = FA + _AX * 0.2                # 헤드튜브 위 = bars 축
GRIP_P = V(0.085, 0.085, 0.37)      # 손잡이(왼쪽, 오른쪽은 y 반대)

BIKE_COATS = {
    'red':  (lin(0xd23a3c), lin(0xa02428)),
    'mint': (lin(0x8ed8c0), lin(0x5fae96)),
    'navy': (lin(0x2c3e74), lin(0x1c2a52)),
}

def tube(pts, r, col, sides=6, mat=BASE):
    return paint(loft(pts, r, sides=sides, wob=0), col, mat)

def arc(c, r, a0, a1, n, y=0.0):
    return [V(c.x + math.cos(a) * r, y, c.z + math.sin(a) * r) for a in [a0 + (a1 - a0) * k / (n - 1) for k in range(n)]]

def wheel(name, c):
    part(name, loc=tuple(c))
    paint(loft([V(c.x + math.cos(a) * (WR - 0.012), 0, c.z + math.sin(a) * (WR - 0.012)) for a in [k / 20 * 2 * math.pi for k in range(20)]], 0.012, sides=6, closed=True, wob=0), shade(TIRE, TIRE_D, k=0.05))   # 타이어
    paint(loft([V(c.x + math.cos(a) * (WR - 0.026), 0, c.z + math.sin(a) * (WR - 0.026)) for a in [k / 20 * 2 * math.pi for k in range(20)]], 0.006, sides=4, closed=True, wob=0), solid(SILVER, 0.04), METAL)   # 테
    for k in range(12):   # 살 — 허브 양쪽에서 엇갈려 테로
        a = k / 12 * 2 * math.pi; s = 1 if k % 2 else -1
        paint(cyl(V(c.x, s * 0.014, c.z), V(c.x + math.cos(a) * (WR - 0.028), 0, c.z + math.sin(a) * (WR - 0.028)), 0.0035, sides=3), solid(SILVER_D, 0.04), METAL)
    paint(cyl(V(c.x, -0.018, c.z), V(c.x, 0.018, c.z), 0.012, sides=8), solid(SILVER, 0.04), METAL)   # 허브
    base()

def _bike(coat):
    C, CD = BIKE_COATS[coat]
    fr = shade(C, CD, k=0.05)
    begin(501)
    # 프레임 — 스텝스루: 헤드튜브에서 크게 휘어 크랭크 축으로 내려가는 다운튜브 두 줄
    tube([HT0 + _AX * -0.01, HT1], 0.016, fr, sides=8)                               # 헤드튜브
    tube(crs([HT0 + V(-0.005, 0, 0.03), V(0.08, 0, 0.2), V(0.02, 0, 0.13), BB + V(0.01, 0, 0.0)], 8), 0.014, fr, sides=7)   # 낮은 다운튜브
    tube(crs([HT0 + V(-0.01, 0, -0.005), V(0.09, 0, 0.17), V(0.03, 0, 0.115), BB + V(0.015, 0, -0.01)], 8), 0.011, fr, sides=6)  # 아래 보강 튜브
    tube([BB, SEAT_TOP], 0.015, fr, sides=8)                                          # 시트튜브
    for s in (-1, 1):
        tube([BB + V(0, s * 0.012, 0), RA + V(0, s * 0.022, 0)], 0.009, fr)            # 체인스테이
        tube([SEAT_TOP + V(0.004, s * 0.008, -0.03), RA + V(0, s * 0.022, 0)], 0.009, fr)   # 시트스테이
        tube([HT0 + V(0, s * 0.012, 0), HT0 + V(0.012, s * 0.022, -0.02), FA + V(0, s * 0.022, 0)], 0.009, solid(SILVER, 0.04), mat=METAL)   # 앞포크
    paint(cyl(BB + V(0, -0.022, 0), BB + V(0, 0.022, 0), 0.018, sides=8), solid(SILVER_D, 0.04), METAL)   # 크랭크 통
    # 안장과 시트포스트
    tube([SEAT_TOP + V(0, 0, -0.01), SADDLE_C + V(0.004, 0, -0.012)], 0.009, solid(SILVER, 0.04), sides=6, mat=METAL)
    paint(hull([V(x, y, z) for (x, w) in ((-0.135, 0.04), (-0.1, 0.036), (-0.06, 0.016), (-0.035, 0.008)) for y in (-w, w) for z in (SADDLE_C.z - 0.012 + (0.006 if x > -0.08 else 0), SADDLE_C.z + 0.008 + (0.004 if x > -0.08 else 0))]), shade(SADDLE, SADDLE_D, k=0.06))
    for s in (-1, 1): paint(loft([V(-0.125, s * 0.03, SADDLE_C.z - 0.014), V(-0.12, s * 0.03, SADDLE_C.z - 0.03), V(-0.105, s * 0.02, SADDLE_C.z - 0.034)], 0.004, sides=3, wob=0), solid(SILVER_D), METAL)   # 안장 스프링
    # 흙받기 — 프레임 색
    for c, a0, a1 in ((FA, math.radians(-15), math.radians(165)), (RA, math.radians(15), math.radians(200))):
        pts = arc(c, WR + 0.012, a0, a1, 14)
        paint(loft(pts, 0.021, sides=4, ell=(0.28, 1.0), wob=0, up=Vector((0, 1, 0))), fr)
    for s in (-1, 1):   # 흙받기 받침살
        tube([FA + V(0, s * 0.022, 0), FA + V(0.13, s * 0.02, 0.05)], 0.003, solid(SILVER_D), sides=3, mat=METAL)
        tube([RA + V(0, s * 0.022, 0), RA + V(-0.13, s * 0.02, 0.06)], 0.003, solid(SILVER_D), sides=3, mat=METAL)
    # 체인과 체인 덮개(오른쪽 = −y)
    yc = -0.03
    top = [V(BB.x + 0.0, yc, BB.z + 0.034), V(RA.x, yc, RA.z + 0.014)]
    bot = [V(RA.x, yc, RA.z - 0.014), V(BB.x, yc, BB.z - 0.034)]
    tube(top, 0.004, solid(BLACK), sides=3); tube(bot, 0.004, solid(BLACK), sides=3)
    paint(cyl(RA + V(0, yc - 0.003, 0), RA + V(0, yc + 0.003, 0), 0.016, sides=8), solid(SILVER_D), METAL)   # 뒤 톱니
    paint(hull([V(x, yc - 0.012 + dy, z) for (x, z0, z1) in ((BB.x + 0.035, BB.z - 0.005, BB.z + 0.04), (BB.x - 0.02, BB.z + 0.02, BB.z + 0.05), (RA.x + 0.03, RA.z + 0.0, RA.z + 0.03)) for z in (z0, z1) for dy in (0, 0.006)]), fr)   # 체인 덮개
    # 받침대 · 앞등 · 뒤 반사판
    tube([RA + V(0.04, 0.025, 0), V(RA.x - 0.0, 0.05, 0.005)], 0.004, solid(SILVER_D), sides=3, mat=METAL)
    paint(loft([HT0 + V(0.03, 0, 0.0), HT0 + V(0.05, 0, 0.0)], [0.016, 0.018], sides=8, wob=0), solid(SILVER), METAL)
    paint(cyl(HT0 + V(0.05, 0, 0), HT0 + V(0.054, 0, 0), 0.015, sides=8), solid(lin(0xfff4c0)), GLOW)
    tube([HT0 + V(0, 0, 0.0), HT0 + V(0.03, 0, 0.0)], 0.004, solid(SILVER_D), sides=3, mat=METAL)
    paint(hull([V(RA.x - 0.15 + dx, y, RA.z + 0.045 + dz) for dx in (0, 0.006) for y in (-0.012, 0.012) for dz in (0, 0.014)]), solid(lin(0xe03020)), GLOW)   # 뒤 반사판
    # 바퀴
    wheel('wheelF', FA)
    wheel('wheelR', RA)
    # 크랭크 — 체인링(오른쪽)과 팔 둘, 페달 둘
    part('crank', loc=tuple(BB))
    paint(loft([V(BB.x + math.cos(a) * 0.032, yc, BB.z + math.sin(a) * 0.032) for a in [k / 14 * 2 * math.pi for k in range(14)]], 0.005, sides=4, closed=True, wob=0), solid(SILVER, 0.04), METAL)
    for k in range(3):
        a = k / 3 * 2 * math.pi + 0.3
        tube([V(BB.x, yc, BB.z), V(BB.x + math.cos(a) * 0.03, yc, BB.z + math.sin(a) * 0.03)], 0.004, solid(SILVER_D), sides=3, mat=METAL)
    for s, sg in ((-1, 1), (1, -1)):   # 오른쪽 팔은 앞, 왼쪽은 뒤
        y0 = s * 0.036; p = V(BB.x + sg * CR, y0, BB.z)
        tube([V(BB.x, y0, BB.z), p], 0.006, solid(SILVER, 0.04), sides=4, mat=METAL)
        paint(hull([p + V(dx, s * dy, dz) for dx in (-0.016, 0.016) for dy in (0.006, 0.04) for dz in (-0.005, 0.005)]), solid(BLACK))
    base()
    # 핸들 — 뒤로 휜 시티 핸들, 가죽 손잡이
    part('bars', loc=tuple(HT1))
    tube([HT1, HT1 + _AX * 0.025, HT1 + _AX * 0.035 + V(0.015, 0, 0.0)], 0.009, solid(SILVER, 0.04), sides=6, mat=METAL)   # 핸들 기둥
    hb = HT1 + _AX * 0.035 + V(0.015, 0, 0.0)
    for s in (-1, 1):
        tube(crs([hb, hb + V(-0.005, s * 0.045, 0.003), V(GRIP_P.x + 0.03, s * GRIP_P.y, GRIP_P.z), V(GRIP_P.x + 0.012, s * GRIP_P.y, GRIP_P.z)], 7), 0.0065, solid(SILVER, 0.04), sides=5, mat=METAL)
        paint(loft([V(GRIP_P.x + 0.016, s * GRIP_P.y, GRIP_P.z), V(GRIP_P.x - 0.024, s * GRIP_P.y, GRIP_P.z)], [0.0095, 0.0105], sides=6, wob=0), solid(GRIP))
        tube([V(GRIP_P.x + 0.03, s * (GRIP_P.y - 0.01), GRIP_P.z + 0.002), V(GRIP_P.x + 0.008, s * (GRIP_P.y - 0.002), GRIP_P.z + 0.012)], 0.003, solid(BLACK), sides=3)   # 브레이크 레버
    base()
    finish('mt_bicycle_' + coat, OUT, center=False)

def mt_bicycle_red(): _bike('red')
def mt_bicycle_mint(): _bike('mint')
def mt_bicycle_navy(): _bike('navy')

# ── 자전거 장식 ──
def _basket():   # 꽃 바구니 — 핸들 앞에 단 등나무 바구니, 꽃이 가득 (bars 축)
    x0, x1, y0, z0, z1 = HT1.x + 0.03, HT1.x + 0.13, 0.065, 0.3, 0.375
    pts = [V(x, y, z0) for x in (x0 + 0.008, x1 - 0.008) for y in (-y0 + 0.008, y0 - 0.008)] + [V(x, y, z1) for x in (x0, x1) for y in (-y0, y0)]
    paint(hull(pts), shade(REED, REED_D, k=0.1))
    for z in (0.32, 0.345, 0.37):   # 엮은 띠
        e = (z - z0) / (z1 - z0) * 0.008
        loop = [V(x0 + 0.008 - e, -y0 + 0.008 - e, z), V(x1 - 0.008 + e, -y0 + 0.008 - e, z), V(x1 - 0.008 + e, y0 - 0.008 + e, z), V(x0 + 0.008 - e, y0 - 0.008 + e, z)]
        paint(loft(loop, 0.004, sides=3, closed=True, wob=0), solid(REED_D))
    paint(loft([V(x0 + 0.01, -0.05, z1), V((x0 + x1) / 2, 0, z1 + 0.07), V(x1 - 0.01, 0.05, z1)], 0.004, sides=3, wob=0), solid(REED_D))   # 손잡이
    for s in (-1, 1): tube([V(x0, s * 0.03, z1 - 0.005), V(HT1.x + 0.03, s * 0.03, 0.375)], 0.004, solid(SILVER_D), sides=3, mat=METAL)   # 걸쇠
    for k in range(9):
        c = V(x0 + 0.015 + (k % 3) * 0.035 + random.uniform(-0.006, 0.006), -0.04 + (k // 3) * 0.04 + random.uniform(-0.006, 0.006), z1 + 0.012 + random.random() * 0.012)
        paint(blob(c + V(0, 0, -0.006), (0.02, 0.016, 0.008), n=6, jitter=0.2), solid(LEAF, 0.1))
        paint(blob(c + V(0, 0, 0.006), (0.013, 0.013, 0.01), n=7, jitter=0.25), solid(random.choice(FLOWERS), 0.06))
        paint(blob(c + V(0, 0, 0.015), (0.004, 0.004, 0.003), n=5, jitter=0), solid(lin(0xf6d040)))

def _bell():   # 따르릉 벨 — 왼쪽 핸들, 손잡이 안쪽 (bars 축)
    p = V(GRIP_P.x + 0.035, GRIP_P.y - 0.024, GRIP_P.z + 0.002)
    tube([p, p + V(0, 0, 0.014)], 0.003, solid(SILVER_D), sides=3, mat=METAL)
    paint(loft([p + V(0, 0, 0.012), p + V(0, 0, 0.022), p + V(0, 0, 0.03), p + V(0, 0, 0.034)], [0.016, 0.015, 0.011, 0.004], sides=10, wob=0), shade(lin(0xf0d060), lin(0xc8a030), k=0.04), METAL)
    paint(blob(p + V(0, 0, 0.036), (0.004, 0.004, 0.004), n=5, jitter=0), solid(lin(0xf0d060)), METAL)
    tube([p + V(0, -0.012, 0.016), p + V(-0.012, -0.022, 0.018)], 0.003, solid(SILVER_D), sides=3, mat=METAL)   # 엄지 레버

def _rack():   # 뒤 짐받이와 나무 상자 (몸통)
    xa, xb, zt = RA.x - 0.12, SEAT_TOP.x - 0.055, 0.292
    for s in (-1, 1):
        tube([V(xa, s * 0.04, zt), V(xb, s * 0.04, zt)], 0.005, solid(SILVER, 0.04), sides=4, mat=METAL)
        tube([V(xa + 0.01, s * 0.04, zt), RA + V(0, s * 0.03, 0)], 0.005, solid(SILVER_D), sides=4, mat=METAL)
        tube([V(xa + 0.08, s * 0.04, zt), RA + V(0.005, s * 0.03, 0.005)], 0.005, solid(SILVER_D), sides=4, mat=METAL)
        tube([V(xb, s * 0.04, zt), SEAT_TOP + V(0.004, s * 0.01, -0.03)], 0.004, solid(SILVER_D), sides=3, mat=METAL)
    for x in (xa, xa + 0.06, xb - 0.02): tube([V(x, -0.04, zt), V(x, 0.04, zt)], 0.004, solid(SILVER), sides=3, mat=METAL)
    # 상자 — 판자를 겹쳐 짠 사과 상자
    cx0, cx1, cy, cz0, cz1 = xa - 0.005, xb - 0.005, 0.06, zt + 0.006, zt + 0.08
    paint(hull([V(x, y, z) for x in (cx0, cx1) for y in (-cy, cy) for z in (cz0, cz0 + 0.008)]), shade(WOOD, WOOD_D))
    for k, z in enumerate((cz0 + 0.008, cz0 + 0.032, cz0 + 0.056)):
        for s in (-1, 1): paint(hull([V(x, s * cy + dy, zz) for x in (cx0, cx1) for dy in (0, -s * 0.007) for zz in (z, z + 0.018)]), shade(WOOD, WOOD_D, k=0.14))
        for x in (cx0, cx1): paint(hull([V(x + dx, y, zz) for dx in (0, 0.007 if x == cx0 else -0.007) for y in (-cy, cy) for zz in (z, z + 0.018)]), shade(WOOD, WOOD_D, k=0.14))
    for x in (cx0, cx1):
        for s in (-1, 1): paint(hull([V(x + dx, s * cy + dy, z) for dx in (0, 0.012 if x == cx0 else -0.012) for dy in (0, -s * 0.012) for z in (cz0, cz1)]), solid(WOOD_D))   # 모서리 기둥
    for k in range(5):   # 사과·빵
        c = V(cx0 + 0.03 + (k % 3) * 0.045, -0.025 + (k // 3) * 0.05, cz1 - 0.012)
        paint(blob(c, (0.017, 0.017, 0.016), n=7, jitter=0.1), solid(lin(0xd03a30) if k != 4 else lin(0xd9a35c), 0.08))

def _flag():   # 작은 깃발 — 뒤 굴대에서 높이 솟은 안전 깃대와 주황 삼각기 (몸통)
    b = RA + V(-0.01, 0.03, 0.0); t = V(RA.x - 0.06, 0.075, 0.72)
    tube([b, RA + V(-0.004, 0.075, 0.06)], 0.005, solid(SILVER_D), sides=3, mat=METAL)   # 고정쇠
    tube([RA + V(-0.004, 0.075, 0.05), t], 0.005, solid(lin(0xf0f0f0)), sides=4)
    paint(blob(t + V(0, 0, 0.008), (0.009, 0.009, 0.009), n=6, jitter=0), solid(lin(0xffd040)), GLOW)
    for k in range(3):   # 펄럭이는 삼각기 — 세 조각으로 살짝 꺾임
        u0, u1 = k / 3, (k + 1) / 3
        def at(u, h): return V(t.x - 0.015 - u * 0.15, t.y + math.sin(u * 3.0) * 0.012, t.z - 0.012 - h * (1 - u))
        paint(hull([at(u0, 0), at(u0, 0.075), at(u1, 0), at(u1, 0.075)] + [p + V(0, 0.003, 0) for p in (at(u0, 0), at(u0, 0.075), at(u1, 0), at(u1, 0.075))]), solid(lin(0xff7a1e) if k != 1 else lin(0xffb030), 0.04))

def gd_bicycle_basket(): begin(511); _basket(); finish('gd_bicycle_basket', OUT, center=False)
def gd_bicycle_bell(): begin(512); _bell(); finish('gd_bicycle_bell', OUT, center=False)
def gd_bicycle_rack(): begin(513); _rack(); finish('gd_bicycle_rack', OUT, center=False)
def gd_bicycle_flag(): begin(514); _flag(); finish('gd_bicycle_flag', OUT, center=False)

def pv_bicycle():   # 확인용: 빨간 자전거 + 장식 넷을 한 모델로
    import lp
    _orig = lp.finish
    lp.finish = lambda *a, **k: None
    globals()['finish'] = lp.finish
    try:
        _bike('red')
    finally:
        lp.finish = _orig; globals()['finish'] = _orig
    base(); random.seed(520)
    _basket(); _bell(); _rack(); _flag()
    finish('pv_bicycle', OUT, center=True, views={'a': (1.0, -1.25, 0.75), 's': (0.0, -1.0, 0.12), 'b': (-1.0, 0.9, 0.6)})

ALL = [mt_bicycle_red, mt_bicycle_mint, mt_bicycle_navy, gd_bicycle_basket, gd_bicycle_bell, gd_bicycle_rack, gd_bicycle_flag, pv_bicycle]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
