# 🚤 모터보트 탈것 (2026-10-02) — 바다에서만 타는 작은 런어바웃 (오늘의 탈것)
# 실행: blender -b -P mounts_motorboat.py -- <출력 폴더> [이름 …]   → models/mounts/mt_motorboat_*.glb · gd_motorboat_*.glb
# 앞 = 블렌더 +x, 원점 = 배 한가운데의 물 높이(z=0이 물낯, 배 밑은 잠긴다) · finish center=False. 사람 키 약 0.53 기준
# 움직이는 부분: prop = 프로펠러(허브 (−0.578, 0, −0.09)), x축으로 돈다 · steer = 운전대(허브 STEER_C), 제 판의 법선 STEER_N 축으로 돈다
# 앉는 자리 = 운전석(x −0.165, z 0.13) — 운전대를 쥔다. 선체 빛은 모델을 따로(mt_motorboat_whiteblue·red·teal). 장식도 같은 좌표(모두 body)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))

CHROME, CHROME_D = lin(0xd8dde2), lin(0xa4abb2)
LINER, LINER_D = lin(0xece8de), lin(0xcfc9ba)
FLOOR = lin(0xb89a6e)                       # 티크 바닥
TEAK, TEAK_D = lin(0xa87a48), lin(0x7e5832)
VINYL, VINYL_D = lin(0xf3eee2), lin(0xd6cfbf)
DASH = lin(0x2c3036)
GLASS = lin(0xc4e4f4)
MOTOR, MOTOR_D = lin(0x2a2d33), lin(0x1b1d21)
IRON = lin(0x3a3632)
ORANGE, ORANGE_D = lin(0xf06a28), lin(0xc4521c)
WHITE = lin(0xf4f2ec)
GOLD, GOLD_D = lin(0xe8c25a), lin(0xb8923a)
CORK = lin(0xc89a58)

# 선체 빛: 몸 · 그늘 · 띠 · 띠 테두리 · 배 밑
COATS = {
    'whiteblue': (lin(0xf2f0ea), lin(0xd4d1c8), lin(0x1f3a6e), lin(0x4f86c6), lin(0x22324a)),
    'red':       (lin(0xc0262a), lin(0x981d20), lin(0xf4f2ec), lin(0x2a2a2e), lin(0x2a2a2e)),
    'teal':      (lin(0x1f9a96), lin(0x177a77), lin(0xf4f2ec), lin(0xe8c25a), lin(0x1d3a44)),
}

L2 = 0.475      # 반 길이 (고물 = −L2, 이물 끝 = +L2)
FL = 0.065      # 배 안 바닥 높이
def half_w(x):
    t = max(0.0, (x + 0.05) / 0.53); w = 0.17 * max(0.0, 1 - t * t) ** 0.55 + 0.004
    if x < -0.3: w -= 0.012 * ((-0.3 - x) / 0.175) ** 2
    return w
def keel_z(x): return -0.065 + (0.15 * (x / L2) ** 2 if x > 0 else 0.0)
def chine_z(x): return 0.0 + (0.058 * (x / L2) ** 2.2 if x > 0 else 0.0)
def sheer(x): return 0.13 + (0.052 * ((x - 0.1) / (L2 - 0.1)) ** 1.6 if x > 0.1 else 0.0)
def outer_y(x, z):   # 아랫배 바깥면(용골~뱃전 아래) z 높이의 반폭
    w = half_w(x); cz = chine_z(x)
    if z <= cz: return 0.8 * w * max(0.0, (z - keel_z(x)) / max(1e-4, cz - keel_z(x)))
    return 0.8 * w + 0.2 * w * min(1.0, (z - cz) / max(1e-4, FL - cz))

XS = [-L2 + 2 * L2 * k / 16 for k in range(17)]

def box(c, s, fn, mat=BASE):
    c = Vector(c); return paint(hull([c + Vector((x * s[0], y * s[1], z * s[2])) for x in (-.5, .5) for y in (-.5, .5) for z in (-.5, .5)]), fn, mat)

# ── 선체 ──
def _hull(coat):
    C, CD, ST, ST2, BOT = COATS[coat]
    # 아랫배 — V자 바닥, 이물로 갈수록 용골이 들린다
    pts = []
    for x in XS[:-1]:
        w = half_w(x)
        pts += [V(x, 0, keel_z(x)), V(x, 0.8 * w, chine_z(x)), V(x, -0.8 * w, chine_z(x)), V(x, w, FL), V(x, -w, FL)]
    pts += [V(L2 + 0.012, 0, 0.1), V(L2, 0, FL + 0.03)]
    def fn(p, n):
        if n.z > 0.55: return jit(FLOOR, 0.06)
        if p.z < 0.012 or n.z < -0.35: return jit(BOT, 0.06)
        return jit(C if n.z > -0.2 else CD, 0.05)
    paint(hull(pts), fn)
    # 띠 — 고물에서 이물로 치솟는 두 줄
    def band(f0, f1, col, x1):
        for i in range(len(XS) - 1):
            a, b = XS[i], XS[i + 1]
            if a >= x1: break
            b = min(b, x1); q = []
            for x in (a, b):
                cz = max(chine_z(x), 0.0) + 0.004
                for f in (f0, f1):
                    z = cz + (FL - cz) * f; y = outer_y(x, z)
                    for s in (1, -1): q += [V(x, s * (y + 0.0045), z), V(x, s * (y - 0.002), z)]
            for s in (1, -1): paint(hull([v for v in q if v.y * s > 0]), solid(col, 0.04))
    band(0.3, 0.62, ST, 0.36)
    band(0.66, 0.76, ST2, 0.3)
    # 옆벽 — 배 안을 우묵하게 (바깥 = 선체 빛, 위 = 티크, 안 = 흰 안벽)
    def wallfn(p, n):
        if n.z > 0.55: return jit(TEAK, 0.06)
        if n.y * p.y > 0 and abs(n.y) > 0.3: return jit(C, 0.05)
        return jit(LINER, 0.05)
    for i in range(len(XS) - 1):
        a, b = XS[i], XS[i + 1]
        if a >= 0.1: break
        b = min(b, 0.1)
        for s in (1, -1):
            q = []
            for x in (a, b):
                w = half_w(x)
                for z in (FL - 0.005, sheer(x)): q += [V(x, s * w, z), V(x, s * (w - 0.016), z)]
            paint(hull(q), wallfn)
    # 고물판(트랜섬)
    wt = half_w(-L2)
    paint(hull([V(x, y, z) for x in (-L2, -L2 + 0.016) for y in (-wt, wt) for z in (FL - 0.005, 0.13)]),
          lambda p, n: jit(TEAK if n.z > 0.55 else C if n.x < -0.5 else LINER, 0.05))
    # 앞 갑판 — 볼록하게 솟은 이물
    q = []
    for x in [0.1] + [x for x in XS if x > 0.1] :
        w = half_w(x); sz = sheer(x)
        q += [V(x, w, FL), V(x, -w, FL), V(x, w * 0.98, sz), V(x, -w * 0.98, sz), V(x, 0, sz + 0.018)]
    q += [V(L2 + 0.012, 0, 0.1), V(L2 + 0.004, 0, sheer(L2) + 0.004)]
    def deckfn(p, n):
        if n.x < -0.6: return jit(LINER, 0.05)
        if n.z > 0.45: return jit(C, 0.04) if coat != 'whiteblue' else jit(lin(0xf8f6f0), 0.04)
        return jit(C, 0.05)
    paint(hull(q), deckfn)
    # 갑판 가운데 줄(띠 빛)
    paint(loft([V(0.13, 0, sheer(0.13) + 0.019), V(0.3, 0, sheer(0.3) + 0.019), V(0.44, 0, sheer(0.44) + 0.01)], 0.006, sides=4, ell=(2.2, 0.4), wob=0), solid(ST, 0.04))
    # 뱃전 고무띠 — 크롬 빛으로 한 바퀴
    rim = [V(x, half_w(x) + 0.004, sheer(x)) for x in XS[1:-1]]
    rim = [V(-L2 + 0.004, half_w(-L2) + 0.004, 0.13)] + rim + [V(L2 + 0.006, 0, sheer(L2) + 0.004)] + [V(v.x, -v.y, v.z) for v in reversed(rim)] + [V(-L2 + 0.004, -half_w(-L2) - 0.004, 0.13)]
    paint(loft(rim, 0.006, sides=4, ell=(1.0, 1.4), closed=True, wob=0), shade(CHROME, CHROME_D, k=0.04), METAL)
    # 이물 난간 — 크롬 기둥 위의 관
    rx = [0.17, 0.25, 0.33, 0.4, 0.44]
    side = [V(x, half_w(x) - 0.012, sheer(x) + 0.05) for x in rx]
    rail = side + [V(L2 - 0.01, 0, sheer(L2) + 0.045)] + [V(v.x, -v.y, v.z) for v in reversed(side)]
    paint(loft(crs(rail, 17), 0.0045, sides=5, wob=0), solid(CHROME, 0.04), METAL)
    for x in (0.17, 0.3, 0.42):
        for s in (1, -1):
            y = half_w(x) - 0.012
            paint(cyl((x, s * y, sheer(x)), (x, s * y, sheer(x) + 0.05), 0.0035, sides=4), solid(CHROME_D, 0.04), METAL)
    # 계선주(클리트) — 이물과 고물
    for c in ((0.38, 0), (-0.44, 0.12), (-0.44, -0.12)):
        z = sheer(c[0]) + 0.015 + (0.004 if c[0] > 0 else 0)
        box((c[0], c[1], z), (0.03, 0.008, 0.006), solid(CHROME_D, 0.04), METAL)
    # 바람막이 유리 — 앞 갑판 뒷가장자리에 휘어 감기고 뒤로 눕는다
    ys = [-0.15 + 0.3 * k / 8 for k in range(9)]
    def wsx(y): return 0.1 - 0.9 * y * y
    for i in range(8):
        q = []
        for y in (ys[i], ys[i + 1]):
            x0 = wsx(y)
            for (dx, z) in ((0.0, 0.132), (-0.038, 0.212)):
                q += [V(x0 + dx, y, z), V(x0 + dx - 0.006, y, z)]
        paint(hull(q), solid(GLASS, 0.03), METAL)
    top = [V(wsx(y) - 0.041, y, 0.214) for y in ys]
    paint(loft(top, 0.004, sides=4, wob=0), solid(CHROME, 0.04), METAL)
    for y in (-0.15, 0.15, 0.0):
        paint(cyl((wsx(y), y, 0.132), (wsx(y) - 0.041, y, 0.214), 0.0035, sides=4), solid(CHROME_D, 0.04), METAL)
    # 계기판(콘솔) — 운전석 앞
    con = [V(x, y, z) for y in (-0.065, 0.065) for (x, z) in ((-0.04, FL), (0.05, FL), (-0.04, 0.165), (0.045, 0.19), (0.01, 0.195))]
    paint(hull(con), lambda p, n: jit(DASH if n.z > 0.4 else LINER if n.x > -0.5 else LINER_D, 0.05))
    for (y, col) in ((-0.028, lin(0x9fe8ff)), (0.028, lin(0xffe0a0))):   # 계기 둘
        paint(cyl((-0.006, y, 0.183), (-0.008, y, 0.191), 0.014, sides=8), solid(CHROME_D, 0.04), METAL)
        paint(cyl((-0.008, y, 0.19), (-0.009, y, 0.193), 0.011, sides=8), solid(col, 0.02), GLOW)
    # 스로틀 손잡이 — 오른쪽(−y) 옆
    box((-0.0, -0.072, 0.15), (0.04, 0.012, 0.03), solid(CHROME_D, 0.04), METAL)
    paint(cyl((-0.0, -0.08, 0.155), (-0.03, -0.08, 0.2), 0.004, sides=4), solid(CHROME, 0.04), METAL)
    paint(blob((-0.032, -0.08, 0.204), (0.008, 0.008, 0.008), n=8, jitter=0), solid(DASH, 0.04))
    # 운전석 — 받침 · 방석 · 등받이
    paint(cyl((-0.165, 0, FL), (-0.165, 0, 0.1), 0.02, sides=6), solid(CHROME_D, 0.04), METAL)
    box((-0.165, 0, 0.11), (0.09, 0.11, 0.025), shade(VINYL, VINYL_D, k=0.05))
    box((-0.165, 0, 0.098), (0.094, 0.114, 0.006), solid(ST, 0.04))   # 테두리
    paint(hull([V(x, y, z) for y in (-0.052, 0.052) for (x, z) in ((-0.205, 0.12), (-0.225, 0.12), (-0.225, 0.215), (-0.24, 0.215))]), shade(VINYL, VINYL_D, k=0.05))
    paint(hull([V(x, y, z) for y in (-0.054, 0.054) for (x, z) in ((-0.226, 0.15), (-0.232, 0.15), (-0.233, 0.175), (-0.239, 0.175))]), solid(ST, 0.04))
    # 뒷자리 긴 의자 — 고물판 앞을 가로질러
    wb = half_w(-0.4) - 0.016
    box((-0.4, 0, 0.098), (0.08, 2 * wb, 0.066), lambda p, n: jit(VINYL if n.z > 0.55 else LINER_D, 0.05))
    box((-0.4, 0, 0.133), (0.074, 2 * wb - 0.01, 0.006), solid(ST, 0.04))
    paint(hull([V(x, y, z) for y in (-wb, wb) for (x, z) in ((-0.445, 0.13), (-0.458, 0.13), (-0.452, 0.185), (-0.462, 0.185))]), shade(VINYL, VINYL_D, k=0.05))
    # 바닥 티크 줄
    for y in (-0.06, -0.02, 0.02, 0.06): paint(cyl((-0.44, y, FL + 0.001), (0.08, y, FL + 0.001), 0.003, sides=3), solid(TEAK_D, 0.04))
    # 선외기 — 고물판에 물린 쇠틀 · 덮개 · 다리 · 기어통
    box((-0.49, 0, 0.115), (0.03, 0.05, 0.05), solid(MOTOR_D, 0.05))
    paint(hull([V(x, y, z) for y in (-0.024, 0.024) for (x, z) in ((-0.505, 0.14), (-0.55, 0.14), (-0.5, -0.05), (-0.545, -0.05))]), solid(MOTOR, 0.06))
    paint(blob((-0.53, 0, 0.2), (0.058, 0.045, 0.06), n=30, jitter=0.02), lambda p, n: jit(MOTOR if n.z < 0.6 else MOTOR_D, 0.05), METAL)
    paint(loft([V(-0.588, 0, 0.2), V(-0.53, 0, 0.21), V(-0.474, 0, 0.2)], 0.006, sides=4, ell=(1, 0.4), wob=0), solid(ST, 0.04))   # 덮개 띠
    paint(hull([V(x, y, -0.058) for x in (-0.485, -0.565) for y in (-0.036, 0.036)] + [V(x, y, -0.064) for x in (-0.49, -0.56) for y in (-0.034, 0.034)]), solid(MOTOR_D, 0.04), METAL)   # 공동방지판
    paint(loft([V(-0.48, 0, -0.09), V(-0.52, 0, -0.09), V(-0.562, 0, -0.09)], [0.01, 0.018, 0.014], sides=8, wob=0), solid(MOTOR, 0.05), METAL)
    paint(hull([V(x, y, z) for y in (-0.003, 0.003) for (x, z) in ((-0.505, -0.095), (-0.54, -0.095), (-0.52, -0.13), (-0.545, -0.128))]), solid(MOTOR_D, 0.04))   # 스케그
    paint(cyl((-0.56, 0, 0.21), (-0.6, 0, 0.17), 0.004, sides=4), solid(CHROME_D, 0.04), METAL)   # 손잡이대

# ── 프로펠러 (prop) ──
PROP = (-0.578, 0, -0.09)
def _prop():
    hx, _, hz = PROP
    paint(cyl((hx + 0.016, 0, hz), (hx - 0.006, 0, hz), 0.011, 0.009, sides=8), solid(CHROME_D, 0.04), METAL)
    paint(cone((hx - 0.006, 0, hz), (hx - 0.022, 0, hz), 0.009, sides=8), solid(CHROME, 0.04), METAL)
    for k in range(3):
        a = k / 3 * 2 * math.pi
        def at(r, da, dx): aa = a + da; return V(hx + dx, math.cos(aa) * r, hz + math.sin(aa) * r)
        pts = [at(0.008, -0.45, 0.008), at(0.008, 0.45, -0.008), at(0.03, -0.35, 0.006), at(0.032, 0.35, -0.006), at(0.04, 0.05, 0.0),
               at(0.008, -0.45, 0.004), at(0.008, 0.45, -0.012)]
        paint(hull(pts), solid(CHROME, 0.05), METAL)

# ── 운전대 (steer) ──
STEER_C = (-0.05, 0, 0.205)
STEER_N = Vector((-0.8, 0, 0.6))          # 운전대 판의 법선(운전자 쪽) = 도는 축
def _steer():
    c = Vector(STEER_C); u = Vector((0, 1, 0)); v = STEER_N.cross(u).normalized(); r = 0.033
    ring = [c + (u * math.cos(a) + v * math.sin(a)) * r for a in [k / 14 * 2 * math.pi for k in range(14)]]
    paint(loft(ring, 0.0045, sides=5, closed=True, wob=0), solid(DASH, 0.05))
    for k in range(3):
        a = math.pi / 2 + k / 3 * 2 * math.pi
        paint(cyl(c, c + (u * math.cos(a) + v * math.sin(a)) * r, 0.0028, sides=4), solid(CHROME, 0.04), METAL)
    paint(cyl(c + STEER_N * 0.006, c - STEER_N * 0.035, 0.007, sides=6), solid(CHROME_D, 0.04), METAL)   # 축대 → 계기판
    paint(blob(c + STEER_N * 0.006, (0.009, 0.009, 0.009), n=8, jitter=0), solid(CHROME, 0.04), METAL)

def _boat(coat, extra=None):
    begin(601)
    _hull(coat)
    part('prop', loc=PROP)
    _prop()
    base()
    part('steer', loc=STEER_C)
    _steer()
    base()
    if extra: extra()

def mt_motorboat_whiteblue(): _boat('whiteblue'); finish('mt_motorboat_whiteblue', OUT, center=False)
def mt_motorboat_red(): _boat('red'); finish('mt_motorboat_red', OUT, center=False)
def mt_motorboat_teal(): _boat('teal'); finish('mt_motorboat_teal', OUT, center=False)

# ── 장식 (모두 body) ──
def _g_flag():   # 고물 깃발 — 왼쪽 고물 모서리 깃대에 뒤로 나부끼는 기
    px, py = -0.452, 0.118
    paint(cyl((px, py, 0.12), (px, py, 0.46), 0.0045, sides=4), solid(CHROME, 0.04), METAL)
    paint(blob((px, py, 0.468), (0.009, 0.009, 0.009), n=6, jitter=0), shade(GOLD, GOLD_D), METAL)
    # 삼각 깃발: 남색 바탕 + 가운데 흰 줄 + 깃대 쪽 금빛 띠 (나라 깃발과 닮지 않게)
    top, bot = 0.458, 0.37; xs = [px - 0.002, px - 0.04, px - 0.08, px - 0.12, px - 0.16]
    NAVY = lin(0x1f3a6e)
    for i in range(len(xs) - 1):
        def edge(j, f0, f1):
            u = j / (len(xs) - 1); m = (top + bot) / 2 - 0.01 * u; h = (top - bot) / 2 * (1 - 0.92 * u)
            y = py + 0.012 * math.sin(u * math.pi * 2)
            return [V(xs[j], y + t, m + h * f) for t in (-0.0025, 0.0025) for f in (f0, f1)]
        for (f0, f1, col) in ((0.25, 1, NAVY), (-0.25, 0.25, WHITE), (-1, -0.25, NAVY)):
            paint(hull(edge(i, f0, f1) + edge(i + 1, f0, f1)), solid(GOLD if i == 0 and col == NAVY else col, 0.04))

def _g_buoy():   # 구명 튜브 — 왼쪽(+y) 옆벽 바깥에 걸린 주황 고리, 흰 띠 넷
    cx, cz = -0.06, 0.098; y = half_w(cx) + 0.016
    r, t = 0.042, 0.011; n = 16
    for k in range(n):
        a0, a1 = k / n * 2 * math.pi, (k + 1) / n * 2 * math.pi
        seg = [V(cx + math.cos(a) * r, y, cz + math.sin(a) * r) for a in (a0, a1)]
        col = WHITE if (k % 4) == 1 else ORANGE
        paint(loft(seg, t, sides=6, wob=0), shade(col, col if col == WHITE else ORANGE_D, k=0.05))
    paint(loft([V(cx + math.cos(a) * (r + t * 0.6), y + 0.006, cz + math.sin(a) * (r + t * 0.6)) for a in [k / 16 * 2 * math.pi for k in range(16)]], 0.002, sides=3, closed=True, wob=0), solid(lin(0xe8e2d0), 0.04))   # 둘레 줄
    paint(cyl((cx, half_w(cx) - 0.008, sheer(cx) + 0.004), (cx, y, cz + r + 0.004), 0.003, sides=3), solid(CHROME_D, 0.04), METAL)   # 걸쇠

def _g_fishing():   # 낚싯대 두 개 — 고물 뱃전 받침에 꽂혀 뒤로 휘어 오른다 (요 21:6)
    for s in (1, -1):
        bx, by = -0.36, s * (half_w(-0.36) - 0.008)
        paint(cyl((bx + 0.012, by, sheer(bx) - 0.03), (bx - 0.012, by + s * 0.008, sheer(bx) + 0.02), 0.008, sides=6), solid(CHROME, 0.04), METAL)   # 받침 통
        p0 = V(bx + 0.02, by - s * 0.004, sheer(bx) - 0.04)
        d = V(-0.42, s * 0.2, 0.88).normalized()
        butt = p0 + d * 0.1
        paint(cyl(p0, butt, 0.0065, sides=5), solid(CORK, 0.05))   # 손잡이
        # 휘는 낚싯대
        pts = [butt + d * (0.06 * k) + V(-0.003 * k * k, 0, -0.002 * k * k) for k in range(6)]
        paint(loft(pts, [0.0045, 0.004, 0.0034, 0.0028, 0.0022, 0.0018], sides=4, wob=0), solid(lin(0x2a3a5e) if s > 0 else lin(0x6e2a2a), 0.05))
        reel = p0 + d * 0.085 + V(0, 0, -0.016)
        paint(cyl(reel + V(0, -0.012, 0), reel + V(0, 0.012, 0), 0.014, sides=8), solid(CHROME_D, 0.04), METAL)
        paint(cyl(p0 + d * 0.085, reel, 0.003, sides=3), solid(CHROME_D, 0.04), METAL)
        tip = pts[-1]
        paint(cyl(tip, tip + V(0, 0, -0.07), 0.0012, sides=3), solid(lin(0xf0f0f0), 0.02))   # 늘어진 낚싯줄
        paint(blob(tip + V(0, 0, -0.078), (0.007, 0.007, 0.01), n=8, jitter=0), solid(lin(0xe03a2a), 0.03))   # 찌
        paint(blob(tip + V(0, 0, -0.07), (0.0075, 0.0075, 0.004), n=8, jitter=0), solid(WHITE, 0.03))

def _g_searchlight():   # 탐조등 — 이물 갑판 받침 위, 앞을 비추는 빛
    x = 0.33; z0 = sheer(x) + 0.016
    paint(cyl((x, 0, z0 - 0.006), (x, 0, z0 + 0.004), 0.022, sides=8), solid(CHROME_D, 0.04), METAL)
    paint(cyl((x, 0, z0), (x, 0, z0 + 0.04), 0.008, sides=6), solid(CHROME_D, 0.04), METAL)
    paint(hull([V(x + dx, y, z0 + 0.04 + dz) for dx in (-0.012, 0.012) for y in (-0.024, 0.024) for dz in (0.0, 0.006)]), solid(CHROME, 0.04), METAL)   # 멍에
    c = V(x, 0, z0 + 0.065)
    for y in (-0.024, 0.024): paint(cyl((x, y, z0 + 0.044), (x, y, c.z), 0.004, sides=4), solid(CHROME, 0.04), METAL)
    paint(cyl(c + V(-0.03, 0, 0), c + V(0.02, 0, 0), 0.017, 0.021, sides=10), shade(CHROME, CHROME_D, k=0.04), METAL)
    paint(cyl(c + V(0.02, 0, 0), c + V(0.026, 0, 0), 0.024, sides=10), solid(CHROME, 0.04), METAL)   # 테
    paint(cyl(c + V(0.022, 0, 0), c + V(0.029, 0, 0), 0.019, sides=10), solid(lin(0xfff6d0), 0.0), GLOW)   # 빛나는 렌즈
    paint(cyl(c + V(0.029, 0, 0), c + V(0.09, 0, 0), 0.02, 0.032, sides=10), solid(lin(0xfff2c0), 0.0), GLOW)   # 빛줄기(짧은 원뿔)
    paint(cone(c + V(-0.03, 0, 0), c + V(-0.042, 0, 0), 0.014, sides=8), solid(CHROME_D, 0.04), METAL)

GEAR = {'flag': _g_flag, 'buoy': _g_buoy, 'fishing': _g_fishing, 'searchlight': _g_searchlight}

def _gear(key):
    begin(610 + list(GEAR).index(key)); GEAR[key](); finish('gd_motorboat_' + key, OUT, center=False)

def gd_motorboat_flag(): _gear('flag')
def gd_motorboat_buoy(): _gear('buoy')
def gd_motorboat_fishing(): _gear('fishing')
def gd_motorboat_searchlight(): _gear('searchlight')

VIEWS = {'a': (1.0, -1.25, 0.75), 'b': (-0.8, 1.2, 0.6), 's': (0.0, -1.0, 0.15), 't': (-0.9, -0.3, 1.0)}
def pv_motorboat():   # 확인용 — 흰·남색 배 + 장식 넷
    def extra():
        for fn in GEAR.values(): fn()
    _boat('whiteblue', extra)
    finish('pv_motorboat', OUT, center=True, views=VIEWS)
def pv_motorboat_red(): _boat('red'); finish('pv_motorboat_red', OUT, center=True, views={'a': VIEWS['a']})
def pv_motorboat_teal(): _boat('teal'); finish('pv_motorboat_teal', OUT, center=True, views={'a': VIEWS['a']})

ALL = [mt_motorboat_whiteblue, mt_motorboat_red, mt_motorboat_teal,
       gd_motorboat_flag, gd_motorboat_buoy, gd_motorboat_fishing, gd_motorboat_searchlight, pv_motorboat, pv_motorboat_red, pv_motorboat_teal]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
