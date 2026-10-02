# 🚢 잠수함 탈것 (2026-10-02) — 바닷속을 다니는 작고 동글동글한 장난감 같은 잠수함
# 실행: blender -b -P mounts_sub.py -- <출력 폴더> [이름 …]   → models/mounts/mt_submarine_*.glb · gd_submarine_*.glb
# 앞 = 블렌더 +x, 원점 = 잠수함 몸통 한가운데(몸통 축이 z=0, 물에 떠 있다 — 땅에 앉지 않는다) · finish center=False. 사람 키 약 0.53 기준
# 움직이는 부분: prop = 프로펠러(허브 PROP), x축으로 돈다 · fins = 고물 수평 잠항타(경첩 FINS), y축으로 기운다
#                periscope = 잠망경(밑동 PERI), z축으로 돌고 위아래로 오르내린다
# 앉는 자리 = 탑 안 조종석(엉덩이 SEAT) — 열린 해치 위로 가슴부터 보인다. 몸 빛은 모델을 따로(mt_submarine_yellow·teal·red). 장식도 같은 좌표(모두 body)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))

BRASS, BRASS_D = lin(0xd9a84a), lin(0xa77a2e)
STEEL, STEEL_D = lin(0xb8c0c8), lin(0x7e8790)
DARK, DARK_D = lin(0x2c3138), lin(0x1c2025)
GLASS = lin(0xbfe8ff)
LAMP = lin(0xfff4c8)
CUSH, CUSH_D = lin(0x6a4a8a), lin(0x4c3466)
WHITE = lin(0xf4f2ec)
PEARL = lin(0xf6f0ea)

# 몸 빛: 몸 · 그늘 · 배 밑 · 띠(탑 테·고리)
COATS = {
    'yellow': (lin(0xfcd424), lin(0xe0ad10), lin(0xc78a10), lin(0xe8642a)),
    'teal':   (lin(0x22a39c), lin(0x18807a), lin(0x13615d), lin(0xe8c25a)),
    'red':    (lin(0xd23a2e), lin(0xa82a22), lin(0x7e1f1a), lin(0xf4f2ec)),
}

R = 0.17          # 몸통 반지름(가장 굵은 곳)
NOSE, TAIL = 0.5, -0.46
def rad(x):       # 몸통 반지름 — 앞은 둥근 머리, 뒤는 물방울처럼 가늘어진다
    if x >= 0.1: return R * math.sqrt(max(0.0, 1 - ((x - 0.1) / 0.4) ** 2))
    return R * (1 - 0.8 * ((0.1 - x) / 0.55) ** 2)

TC = -0.02                     # 탑 가운데 x
TA, TB = 0.125, 0.098          # 탑 바깥 반폭 (x, y)
TW = 0.016                     # 탑 벽 두께
TZ0, TZ1 = 0.1, 0.3            # 탑 밑 · 테 높이
SEAT = (-0.035, 0.19)          # 조종석 엉덩이 (x, z)

def box(c, s, fn, mat=BASE):
    c = Vector(c); return paint(hull([c + Vector((x * s[0], y * s[1], z * s[2])) for x in (-.5, .5) for y in (-.5, .5) for z in (-.5, .5)]), fn, mat)

def ring_x(x, r, t, col, mat=BASE, n=16):   # 몸통을 두르는 고리
    paint(loft([V(x, math.cos(a) * r, math.sin(a) * r) for a in [k / n * 2 * math.pi for k in range(n)]], t, sides=4, closed=True, wob=0), col, mat)

def rivet(p, r=0.0065):
    p = Vector(p); paint(hull([p + Vector((dx, dy, dz)) for (dx, dy, dz) in ((r, 0, 0), (-r, 0, 0), (0, r, 0), (0, -r, 0), (0, 0, r), (0, 0, -r))]), solid(BRASS, 0.06), METAL)

# ── 몸통 ──
def _body(coat):
    C, CD, BOT, AC = COATS[coat]
    xs = [TAIL + (NOSE - 0.006 - TAIL) * (1 - math.cos(math.pi * k / 19)) / 2 for k in range(20)]
    def fn(p, n):
        if p.z < -0.11: return jit(BOT, 0.04)
        return jit(C if n.z > -0.3 else CD, 0.04)
    paint(loft([V(x, 0, 0) for x in xs], [max(rad(x), 0.012) for x in xs], sides=16, wob=0), fn)
    # 고리 띠 둘 — 리벳 박힌
    for x in (0.27, -0.24):
        r = rad(x) + 0.003
        ring_x(x, r, 0.009, solid(AC, 0.04))
        for k in range(10):
            a = k / 10 * 2 * math.pi + 0.22
            rivet(V(x + 0.014, math.cos(a) * (r - 0.002), math.sin(a) * (r - 0.002)), 0.0045)
    # 꽁무니 고리
    ring_x(-0.42, rad(-0.42) + 0.003, 0.007, solid(AC, 0.04))
    # 둥근 창(현창) — 양옆에 셋, 놋쇠 테 + 빛나는 하늘빛 유리
    for x in (0.2, 0.04, -0.12):
        for s in (1, -1):
            y = s * rad(x)
            cr = 0.036 if x != 0.04 else 0.04
            n = 12
            paint(loft([V(x + math.cos(a) * cr, y + s * 0.006, math.sin(a) * cr) for a in [k / n * 2 * math.pi for k in range(n)]], 0.0085, sides=4, closed=True, wob=0), shade(BRASS, BRASS_D, k=0.04), METAL)
            paint(cyl((x, y - s * 0.02, 0), (x, y + s * 0.006, 0), cr - 0.003, sides=10), solid(GLASS, 0.02), GLOW)
            paint(blob((x - cr * 0.35, y + s * 0.008, cr * 0.38), (0.008, 0.002, 0.006), n=6, jitter=0), solid(WHITE, 0.0), GLOW)   # 반짝임
            for k in range(4):
                a = k / 4 * 2 * math.pi + 0.78
                rivet(V(x + math.cos(a) * (cr + 0.013), y + s * 0.004, math.sin(a) * (cr + 0.013)), 0.0035)
    # 코 앞 전조등 — 놋쇠 테 + 빛
    paint(cyl((NOSE - 0.04, 0, 0), (NOSE + 0.008, 0, 0), 0.05, 0.047, sides=12), shade(BRASS, BRASS_D, k=0.04), METAL)
    paint(cyl((NOSE + 0.004, 0, 0), (NOSE + 0.014, 0, 0), 0.038, 0.034, sides=12), solid(LAMP, 0.0), GLOW)
    paint(blob((NOSE + 0.013, 0.012, 0.012), (0.004, 0.01, 0.01), n=8, jitter=0), solid(WHITE, 0.0), GLOW)
    # 탑(돛) — 속이 빈 둥근 탑, 위가 열려 있다
    N = 16
    def tw(p, n):
        rx, ry = (p.x - TC) / TA, p.y / TB
        if n.z > 0.6: return jit(AC, 0.04)
        if n.x * rx + n.y * ry > 0.2: return jit(C if n.z > -0.3 else CD, 0.04)
        return jit(DARK, 0.05)
    for k in range(N):
        a0, a1 = k / N * 2 * math.pi, (k + 1) / N * 2 * math.pi
        q = []
        for a in (a0, a1):
            for (ax, by) in ((TA, TB), (TA - TW, TB - TW)):
                for z in (TZ0, TZ1):
                    bulge = 1.0 + (0.08 if z == TZ0 else 0.0)
                    q.append(V(TC + math.cos(a) * ax * bulge, math.sin(a) * by * bulge, z))
        paint(hull(q), tw)
    # 탑 테 — 둥근 관
    paint(loft([V(TC + math.cos(a) * (TA - TW / 2), math.sin(a) * (TB - TW / 2), TZ1 + 0.004) for a in [k / 28 * 2 * math.pi for k in range(20)]], 0.011, sides=5, closed=True, wob=0), solid(AC, 0.04))
    for k in range(10):   # 테 아래 리벳
        a = k / 10 * 2 * math.pi + 0.3
        rivet(V(TC + math.cos(a) * (TA + 0.002), math.sin(a) * (TB + 0.002), TZ1 - 0.025), 0.005)
    # 탑 밑 둘레 — 몸통에 이어 붙는 받침
    paint(loft([V(TC + math.cos(a) * TA * 1.12, math.sin(a) * TB * 1.14, 0.135) for a in [k / 28 * 2 * math.pi for k in range(18)]], 0.012, sides=4, closed=True, wob=0), solid(CD, 0.04))
    # 탑 속 — 바닥 · 조종석
    paint(hull([V(TC + math.cos(a) * (TA - TW + 0.002), math.sin(a) * (TB - TW + 0.002), z) for a in [k / 20 * 2 * math.pi for k in range(12)] for z in (0.15, 0.17)]), solid(DARK_D, 0.04))
    sx, sz = SEAT
    box((sx, 0, sz - 0.012), (0.075, 0.1, 0.024), shade(CUSH, CUSH_D, k=0.05))
    paint(cyl((sx, 0, 0.17), (sx, 0, sz - 0.022), 0.014, sides=6), solid(STEEL_D, 0.04), METAL)
    # 열린 해치 뚜껑 — 탑 뒤 경첩에서 뒤로 젖혀 서 있다 (등받이처럼)
    hx = TC - TA + 0.012; hz = TZ1 + 0.012
    d = V(-math.sin(math.radians(22)), 0, math.cos(math.radians(22))); nrm = V(d.z, 0, -d.x)
    lc = V(hx, 0, hz) + d * 0.1
    paint(loft([lc - nrm * 0.007, lc + nrm * 0.007], 0.1, sides=14, ell=(0.88, 1.0), wob=0), shade(C, CD, k=0.04))
    # 뚜껑 안쪽 손바퀴
    wc = lc + nrm * 0.012
    u, v = V(0, 1, 0), d
    paint(loft([wc + (u * math.cos(a) + v * math.sin(a)) * 0.034 for a in [k / 14 * 2 * math.pi for k in range(10)]], 0.004, sides=3, closed=True, wob=0), solid(BRASS, 0.04), METAL)
    for k in range(4):
        a = k / 4 * 2 * math.pi + 0.78
        paint(cyl(wc, wc + (u * math.cos(a) + v * math.sin(a)) * 0.034, 0.0025, sides=4), solid(BRASS_D, 0.04), METAL)
    paint(blob(wc, (0.007, 0.007, 0.007), n=8, jitter=0), solid(BRASS, 0.04), METAL)
    # 경첩
    paint(cyl((hx - 0.004, -0.04, hz), (hx - 0.004, 0.04, hz), 0.009, sides=8), solid(STEEL_D, 0.04), METAL)
    # 탑 옆 작은 지느러미(돛 날개)
    for s in (1, -1):
        y0 = s * TB * 0.98
        paint(hull([V(x, y0 + s * dy, z) for (x, dy) in ((0.06, 0.0), (-0.02, 0.0), (0.035, 0.07), (0.005, 0.07)) for z in (0.215, 0.228)]), shade(AC, AC, k=0.05))
    # 고물 세로 방향타 — 위아래 (움직이지 않는다)
    for s in (1, -1):
        q = [V(x, dy, s * z) for dy in (-0.006, 0.006) for (x, z) in ((-0.33, rad(-0.33) - 0.01), (-0.44, rad(-0.44) - 0.005), (-0.43, 0.135), (-0.385, 0.13))]
        paint(hull(q), lambda p, n: jit(AC if abs(p.z) > 0.1 else C, 0.04))
    # 프로펠러 보호 고리 — 방향타 끝에 걸린 둥근 테
    paint(loft([V(-0.485, math.cos(a) * 0.082, math.sin(a) * 0.082) for a in [k / 22 * 2 * math.pi for k in range(16)]], 0.009, sides=5, ell=(2.0, 1.0), closed=True, wob=0), solid(AC, 0.04))
    for s in (1, -1):
        paint(cyl((-0.44, 0, s * 0.11), (-0.485, 0, s * 0.082), 0.006, sides=5), solid(AC, 0.04))
    # 꽁무니 축
    paint(cyl((TAIL + 0.01, 0, 0), (PROP[0] + 0.008, 0, 0), 0.016, 0.012, sides=10), solid(STEEL_D, 0.04), METAL)

# ── 프로펠러 (prop) ──
PROP = (-0.485, 0, 0.0)
def _prop():
    hx = PROP[0]
    paint(cyl((hx + 0.012, 0, 0), (hx - 0.01, 0, 0), 0.016, 0.014, sides=10), solid(BRASS_D, 0.04), METAL)
    paint(cone((hx - 0.01, 0, 0), (hx - 0.032, 0, 0), 0.014, sides=10), solid(BRASS, 0.04), METAL)
    for k in range(4):
        a = k / 4 * 2 * math.pi + 0.4
        def at(r, da, dx): aa = a + da; return V(hx + dx, math.cos(aa) * r, math.sin(aa) * r)
        pts = [at(0.012, -0.5, 0.009), at(0.012, 0.5, -0.009), at(0.05, -0.38, 0.007), at(0.055, 0.32, -0.007), at(0.068, 0.0, 0.0),
               at(0.012, -0.5, 0.005), at(0.012, 0.5, -0.013)]
        paint(hull(pts), shade(BRASS, BRASS_D, k=0.05), METAL)

# ── 수평 잠항타 (fins) — 경첩에서 y축으로 기운다 ──
FINS = (-0.355, 0, 0.0)
def _fins(coat):
    C, CD, BOT, AC = COATS[coat]
    for s in (1, -1):
        q = [V(x, s * y, dz) for dz in (-0.006, 0.006) for (x, y) in ((-0.34, 0.03), (-0.435, 0.03), (-0.43, 0.145), (-0.39, 0.15))]
        paint(hull(q), lambda p, n: jit(AC if abs(p.y) > 0.11 else C, 0.04))
    paint(cyl((FINS[0], -0.06, 0), (FINS[0], 0.06, 0), 0.008, sides=6), solid(STEEL_D, 0.04), METAL)

# ── 잠망경 (periscope) — 탑 왼쪽(+y) 테, 밑동에서 돈다 ──
PA = 1.75
PERI = (TC + math.cos(PA) * (TA - TW / 2), math.sin(PA) * (TB - TW / 2), TZ1 + 0.01)
def _periscope():
    px, py, pz = PERI
    paint(cyl((px, py, pz - 0.006), (px, py, pz + 0.016), 0.019, sides=10), solid(STEEL_D, 0.04), METAL)
    paint(cyl((px, py, pz), (px, py, pz + 0.13), 0.011, sides=8), shade(STEEL, STEEL_D, k=0.04), METAL)
    ring = pz + 0.07
    paint(cyl((px, py, ring), (px, py, ring + 0.008), 0.014, sides=8), solid(BRASS, 0.04), METAL)
    top = pz + 0.13
    paint(blob((px, py, top), (0.015, 0.015, 0.015), n=12, jitter=0), solid(STEEL, 0.04), METAL)
    paint(cyl((px - 0.004, py, top), (px + 0.045, py, top), 0.014, 0.016, sides=10), shade(STEEL, STEEL_D, k=0.04), METAL)
    paint(cyl((px + 0.043, py, top), (px + 0.05, py, top), 0.012, sides=10), solid(GLASS, 0.02), GLOW)
    # 손잡이 둘
    for s in (1, -1):
        paint(cyl((px, py, pz + 0.05), (px - 0.006, py + s * 0.03, pz + 0.05), 0.004, sides=4), solid(DARK, 0.04))

def _sub(coat, extra=None):
    begin(701)
    _body(coat)
    part('prop', loc=PROP)
    _prop()
    base()
    part('fins', loc=FINS)
    _fins(coat)
    base()
    part('periscope', loc=PERI)
    _periscope()
    base()
    if extra: extra()

def mt_submarine_yellow(): _sub('yellow'); finish('mt_submarine_yellow', OUT, center=False)
def mt_submarine_teal(): _sub('teal'); finish('mt_submarine_teal', OUT, center=False)
def mt_submarine_red(): _sub('red'); finish('mt_submarine_red', OUT, center=False)

# ── 장식 (모두 body) ──
def _g_lamps():   # 탐조등 둘 — 이물 아래 양쪽, 앞을 비추는 빛
    for s in (1, -1):
        x, y, z = 0.33, s * 0.07, -0.125
        # 받침 — 몸통 속에서 나온다
        paint(cyl((x - 0.01, y * 0.7, -0.09), (x, y, z), 0.008, sides=5), solid(STEEL_D, 0.04), METAL)
        c = V(x, y, z)
        paint(cyl(c + V(-0.045, 0, 0), c + V(0.02, 0, 0), 0.02, 0.026, sides=12), shade(STEEL, STEEL_D, k=0.04), METAL)
        paint(cyl(c + V(0.018, 0, 0), c + V(0.028, 0, 0), 0.03, sides=12), shade(BRASS, BRASS_D, k=0.04), METAL)
        paint(cyl(c + V(0.026, 0, 0), c + V(0.031, 0, 0), 0.024, sides=12), solid(LAMP, 0.0), GLOW)
        paint(cone(c + V(-0.045, 0, 0), c + V(-0.058, 0, 0), 0.016, sides=10), solid(STEEL_D, 0.04), METAL)
        # 빛줄기 — 짧은 원뿔
        paint(cyl(c + V(0.031, 0, 0), c + V(0.1, 0, -0.008), 0.024, 0.04, sides=12), solid(lin(0xfff0b8), 0.0), GLOW)

def _g_arm():   # 집게팔 — 배 밑에서 앞으로 뻗은 기계 팔, 두 손가락 집게
    sh = V(0.17, 0, -rad(0.17) + 0.004)
    paint(blob(sh, (0.03, 0.03, 0.022), n=14, jitter=0), shade(STEEL, STEEL_D, k=0.04), METAL)   # 어깨
    el = V(0.26, 0, -0.245)
    wr = V(0.38, 0, -0.215)
    paint(cyl(sh, el, 0.014, 0.012, sides=8), shade(lin(0xf08a2a), lin(0xc46a1c), k=0.04))   # 위팔(주황)
    paint(blob(el, (0.018, 0.022, 0.018), n=12, jitter=0), solid(STEEL_D, 0.04), METAL)
    paint(cyl(el, wr, 0.011, 0.01, sides=8), shade(lin(0xf08a2a), lin(0xc46a1c), k=0.04))
    # 유압관
    paint(loft(crs([sh + V(0.01, 0.016, -0.006), V(0.22, 0.02, -0.22), el + V(0.01, 0.02, 0.01), V(0.33, 0.016, -0.215)], 8), 0.0035, sides=4, wob=0), solid(DARK, 0.04))
    paint(blob(wr, (0.016, 0.018, 0.016), n=12, jitter=0), solid(STEEL_D, 0.04), METAL)
    hand = wr + V(0.02, 0, 0)
    paint(cyl(wr, hand, 0.016, 0.02, sides=8), solid(STEEL, 0.04), METAL)
    for s in (1, -1):   # 집게 손가락 — 위아래로 벌어져 무언가를 잡으려는
        p1 = hand + V(0.004, 0, s * 0.014)
        p2 = hand + V(0.04, 0, s * 0.03)
        p3 = hand + V(0.07, 0, s * 0.012)
        paint(loft([p1, p2, p3], [0.007, 0.0065, 0.004], sides=5, wob=0), solid(STEEL_D, 0.04), METAL)
        paint(cone(p3, p3 + V(0.008, 0, -s * 0.012), 0.005, sides=5), solid(DARK, 0.04))

def _g_flag():   # 탑 깃발 — 탑 뒤에 선 깃대, 뒤로 나부끼는 삼각기 (흰·하늘·금, 나라 깃발 아님)
    a = -2.3; px, py = TC + math.cos(a) * (TA + 0.007), math.sin(a) * (TB + 0.007)
    z0 = TZ1 - 0.06
    paint(cyl((px, py, z0), (px, py, 0.56), 0.0045, sides=5), solid(STEEL, 0.04), METAL)
    paint(cyl((px, py - 0.004, z0 + 0.01), (px, py - 0.004, z0 + 0.03), 0.009, sides=6), solid(STEEL_D, 0.04), METAL)   # 물림쇠
    paint(blob((px, py, 0.568), (0.01, 0.01, 0.01), n=8, jitter=0), shade(BRASS, BRASS_D), METAL)
    top, bot = 0.555, 0.465; xs = [px - 0.003 - 0.04 * k for k in range(6)]
    SKY = lin(0x58a8e0)
    for i in range(len(xs) - 1):
        def edge(j, f0, f1):
            u = j / (len(xs) - 1); m = (top + bot) / 2 - 0.012 * u; h = (top - bot) / 2 * (1 - 0.92 * u)
            y = py + 0.014 * math.sin(u * math.pi * 2)
            return [V(xs[j], y + t, m + h * f) for t in (-0.0025, 0.0025) for f in (f0, f1)]
        for (f0, f1, col) in ((0.3, 1, SKY), (-0.3, 0.3, WHITE), (-1, -0.3, SKY)):
            paint(hull(edge(i, f0, f1) + edge(i + 1, f0, f1)), solid(BRASS if i == 0 else col, 0.04))

def _g_shell():   # 진주조개 장식 — 이물 위에 얹은 큰 조개, 벌어진 입에 진주 한 알
    c = V(0.27, 0, rad(0.27) - 0.006)
    SC = 1.5
    tilt = math.radians(14)   # 앞으로 기운 몸통 등선을 따라
    def rot(v):   # y축으로 앞쪽 내리기 (크기 SC)
        v = v * SC
        return V(v.x * math.cos(tilt) + v.z * math.sin(tilt), v.y, -v.x * math.sin(tilt) + v.z * math.cos(tilt))
    PINK, PINK_D = lin(0xf6d2c8), lin(0xd8a698)
    NACRE = lin(0xeef4f8)
    hinge = V(-0.045, 0, 0.008)
    nr = 9
    for half in (0, 1):   # 0 = 아래 껍데기(누운), 1 = 위 껍데기(벌어져 선)
        for k in range(nr):
            a0 = math.radians(-70 + 140 * k / nr); a1 = math.radians(-70 + 140 * (k + 1) / nr)
            q = []
            for a in (a0, a1):
                L = 0.085
                for (r, h) in ((0.0, 0.0), (L * 0.55, 0.012), (L, 0.004)):
                    p = V(math.cos(a) * r, math.sin(a) * r, h)
                    if half == 1:   # 경첩에서 위로 55° 들어 올린다
                        b = math.radians(55)
                        p = V(p.x * math.cos(b) - p.z * math.sin(b), p.y, p.x * math.sin(b) + p.z * math.cos(b) + 0.012)
                    for t in (0.0, 0.006):
                        q.append(c + rot(hinge + p + V(0, 0, t if half == 0 else -t)))
            mid = (k % 2 == 0)
            paint(hull(q), solid(PINK if mid else PINK_D, 0.04))
    # 속살(자개) — 아래 껍데기 안
    paint(hull([c + rot(hinge + V(math.cos(a) * 0.07, math.sin(a) * 0.07, 0.014)) for a in [math.radians(-60 + 120 * k / 8) for k in range(9)]] + [c + rot(hinge + V(0.004, 0, 0.012))]), solid(NACRE, 0.03), METAL)
    # 진주
    paint(blob(c + rot(hinge + V(0.035, 0, 0.034)), (0.03, 0.03, 0.03), n=26, jitter=0), solid(PEARL, 0.02), METAL)
    paint(blob(c + rot(hinge + V(0.03, -0.008, 0.046)), (0.008, 0.008, 0.006), n=8, jitter=0), solid(WHITE, 0.0), GLOW)
    # 받침 — 몸통에 박힌 놋쇠 받침
    paint(cyl(c + V(-0.05, 0, -0.012), c + rot(hinge + V(0.0, 0, 0.006)), 0.012, sides=6), solid(BRASS_D, 0.04), METAL)

GEAR = {'lamps': _g_lamps, 'arm': _g_arm, 'flag': _g_flag, 'shell': _g_shell}

def _gear(key):
    begin(710 + list(GEAR).index(key)); GEAR[key](); finish('gd_submarine_' + key, OUT, center=False)

def gd_submarine_lamps(): _gear('lamps')
def gd_submarine_arm(): _gear('arm')
def gd_submarine_flag(): _gear('flag')
def gd_submarine_shell(): _gear('shell')

def _dummy():   # 확인용 사람 — 키 0.53 앉은 자세 (게임에 들어가지 않는다)
    sx, sz = SEAT
    SK = lin(0xe8b890)
    paint(blob((sx + 0.01, 0, sz + 0.1), (0.05, 0.065, 0.1), n=20, jitter=0), solid(lin(0x4a70b0), 0.04))
    paint(blob((sx + 0.02, 0, sz + 0.25), (0.05, 0.05, 0.055), n=20, jitter=0), solid(SK, 0.04))

VIEWS = {'a': (1.0, -1.25, 0.75), 'b': (-0.8, 1.2, 0.6), 's': (0.0, -1.0, 0.15), 'f': (1.0, -0.15, 0.1)}
def pv_submarine():   # 확인용 — 노란 잠수함 + 장식 넷 + 사람
    def extra():
        for fn in GEAR.values(): fn()
        _dummy()
    _sub('yellow', extra)
    finish('pv_submarine', OUT, center=True, views=VIEWS)
def pv_submarine_teal(): _sub('teal'); finish('pv_submarine_teal', OUT, center=True, views={'a': VIEWS['a']})
def pv_submarine_red(): _sub('red'); finish('pv_submarine_red', OUT, center=True, views={'a': VIEWS['a']})
def pv_submarine_yellow(): _sub('yellow'); finish('pv_submarine_yellow', OUT, center=True, views={'a': VIEWS['a']})

ALL = [mt_submarine_yellow, mt_submarine_teal, mt_submarine_red,
       gd_submarine_lamps, gd_submarine_arm, gd_submarine_flag, gd_submarine_shell,
       pv_submarine, pv_submarine_yellow, pv_submarine_teal, pv_submarine_red]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
