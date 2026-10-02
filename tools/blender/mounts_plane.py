# ✈️ 비행기 (2026-10-02) — 3D 걸어서 구경의 탈것. 귀여운 옛날 복엽기(지붕 없는 조종석, 꼬리바퀴), 조종석 위로 어깨부터 사람이 보인다
# 실행: blender -b -P mounts_plane.py -- <출력 폴더> [이름 …]   → models/mounts/mt_plane_*.glb · gd_plane_*.glb
# 앞 = 블렌더 +x, 왼쪽 = +y, 원점 = 비행기 한가운데 아래 땅(finish center=False — 장식이 같은 원점에 맞물린다). 사람 키 약 0.53 기준
# 땅에 앉은 모습(꼬리가 낮다 — 동체 중심선이 앞 0.37 → 꼬리 0.195)
# 움직이는 부분: prop — 프로펠러, 축 = 코의 허브 HUB, 블렌더 x축(앞뒤)으로 돈다
#               rudder — 방향타, 축 = 수직 꼬리날개 경첩, z축으로 꺾인다
#               elevator — 승강타(양쪽 한 덩어리), 축 = 수평 꼬리날개 경첩, y축으로 기운다
#               aileronL(+y) · aileronR(−y) — 아래 날개 바깥쪽 보조날개, 축 = 경첩, y축으로 기운다(서로 반대로)
#               wheelL(+y) · wheelR(−y) — 주바퀴, wheelT — 꼬리바퀴. 굴대 중심, y축으로 돈다
# 조종석: 엉덩이 SEAT_HIP · 조종간 손잡이 STICK (동체 안이라 몸통은 가려지고 어깨부터 보인다)
# 장식: banner(꼬리 현수막) · smoke(비행운) · goggles(고글과 목도리) · wingstripes(위 날개 끝 줄무늬) — 모두 몸통
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *
import lp

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))

TIRE, TIRE_D = lin(0x2a2a2e), lin(0x1a1a1c)
CHROME, CHROME_D = lin(0xe2e6ec), lin(0xa8aeb6)
WHITE = lin(0xfbfaf6)
WOOD, WOOD_D = lin(0xb57a42), lin(0x7e5028)
LEATHER, LEATHER_D = lin(0x7a4628), lin(0x4e2c18)
HOLE = lin(0x2a2622)
GLASS = lin(0xb8e0f2)
STRUT = lin(0xf1e6cc)

# ── 치수 ──
HUB = V(0.545, 0, 0.37)        # 프로펠러 허브(축은 x)
PROP_R = 0.175                 # 프로펠러 반지름
WR, WY, WX = 0.068, 0.165, 0.30   # 주바퀴 반지름·y·x
TWR, TWX = 0.03, -0.5          # 꼬리바퀴
SEAT_HIP = V(-0.075, 0, 0.29)  # 조종사 엉덩이
STICK = V(0.0, 0, 0.345)       # 조종간 손잡이(손)
CK = (-0.075, 0.105, 0.078)    # 조종석 구멍: 가운데 x, 반길이, 반폭
UW = (0.40, 0.19, 0.625, 0.034, 0.61)   # 위 날개: 앞전 x, 뒷전 x, z, 두께, 반날개 길이
LW = (0.36, 0.16, 0.225, 0.03, 0.58)    # 아래 날개
AIL = (0.205, 0.335, 0.525)    # 보조날개 경첩 x, y 범위
RUD_X, ELE_X = -0.492, -0.492  # 경첩 x
STAB_Z = 0.21

# 동체 중심선: (x, 중심 z, 반지름)
FUS = [(0.535, 0.37, 0.07), (0.47, 0.37, 0.118), (0.40, 0.366, 0.136), (0.30, 0.356, 0.143), (0.15, 0.342, 0.143),
       (0.0, 0.322, 0.136), (-0.15, 0.292, 0.12), (-0.30, 0.257, 0.091), (-0.42, 0.226, 0.06), (-0.535, 0.196, 0.028)]
FUS_W = 0.92   # 단면 가로/세로

PLANE_COATS = {   # 몸통, 몸통 그늘, 날개, 날개 그늘, 띠(장식색)
    'red':    (lin(0xe0453a), lin(0xa82e28), lin(0xea5646), lin(0xb83a30), WHITE),
    'yellow': (lin(0xffd23c), lin(0xd9a520), lin(0xffdd5e), lin(0xd8ac30), lin(0x2b4c8c)),
    'navy':   (lin(0x2c4274), lin(0x1b294c), lin(0xdfe3ea), lin(0xaab2be), lin(0xd8dde4)),
}

_SM = [V(x, z, r) for x, z, r in FUS]
_SS = crs(_SM, 40)

def fus(x):   # x에서 (중심 z, 반지름)
    s = _SS
    if x >= s[0].x: return s[0].y, s[0].z
    for a, b in zip(s, s[1:]):
        if b.x <= x <= a.x:
            t = (a.x - x) / (a.x - b.x); return a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t
    return s[-1].y, s[-1].z

def topz(x, y=0.0):
    c, r = fus(x); w = r * FUS_W; return c + r * math.sqrt(max(0.0, 1 - (y / w) ** 2))

def botz(x, y=0.0):
    c, r = fus(x); w = r * FUS_W; return c - r * math.sqrt(max(0.0, 1 - (y / w) ** 2))

def tube(pts, r, col, sides=6, mat=BASE, **kw):
    return paint(loft(pts, r, sides=sides, wob=0, **kw), col, mat)

# ── 날개 단면 ──
AF = [0.0, 0.05, 0.18, 0.42, 0.72, 1.0]
AT = [0.12, 0.6, 0.95, 1.0, 0.62, 0.14]
AB = [-0.12, -0.38, -0.45, -0.4, -0.26, -0.06]

def wsec(xle, xte, z, t, y, s=1.0, f1=1.0):   # 날개 단면 점들(앞전→뒷전), s = 끝에서 줄어듦, f1 = 뒷전을 잘라낸 비율
    xm = (xle + xte) / 2; a = xm + (xle - xm) * s; b = xm + (xte - xm) * s
    out = []
    for f, tp, bt in zip(AF, AT, AB):
        if f > f1 + 1e-6: continue
        x = a + (b - a) * f
        out += [V(x, y, z + tp * t * s), V(x, y, z + bt * t * s)]
    if f1 < 1.0:
        x = a + (b - a) * f1; tp = interp(AT, f1); bt = interp(AB, f1)
        out += [V(x, y, z + tp * t * s), V(x, y, z + bt * t * s)]
    return out

def _ip(xs, ys, x):
    for a, b, ya, yb in zip(xs, xs[1:], ys, ys[1:]):
        if a <= x <= b: return ya + (yb - ya) * (x - a) / (b - a)
    return ys[-1]

TIP = [(0.0, 1.0), (0.04, 0.9), (0.03, 0.74), (0.015, 0.5)]   # 반날개 끝에서 안쪽으로 dy, 줄어듦

def wing(W, col, y0=None, y1=None, f1=1.0, tips=True):
    xle, xte, z, t, sp = W
    secs = []
    ys = [y for y in (y0, y1) if y is not None]
    for y in ys: secs += wsec(xle, xte, z, t, y, 1.0, f1)
    if tips:
        sg = 1 if (y1 or 0) > 0 else -1
        for dy, s in TIP: secs += wsec(xle, xte, z, t, sg * (sp - dy), s, f1)
    return paint(hull(secs), col)

# ── 바퀴 ──
def circ(c, r, n, y):
    return [V(c.x + math.cos(a) * r, y, c.z + math.sin(a) * r) for a in [k / n * 2 * math.pi for k in range(n)]]

def wheel(name, cc, r, w, C):
    part(name, loc=tuple(cc))
    paint(loft(circ(cc, r - w * 0.75, 16, cc.y), w * 0.75, sides=8, ell=(1.0, 1.3), closed=True, wob=0, up=Vector((0, 1, 0))), shade(TIRE, TIRE_D, k=0.05))
    paint(cyl(cc + V(0, -w * 0.8, 0), cc + V(0, w * 0.8, 0), r * 0.55, sides=12), solid(C, 0.04))
    for s in (-1, 1):
        paint(loft([cc + V(0, s * w * 0.75, 0), cc + V(0, s * w * 1.05, 0), cc + V(0, s * w * 1.25, 0)], [r * 0.32, r * 0.24, r * 0.08], sides=10, wob=0), solid(CHROME, 0.04), METAL)
        for k in range(3):   # 볼트 — 도는 게 보이게
            a = k / 3 * 2 * math.pi + 0.3
            paint(blob(cc + V(math.cos(a) * r * 0.42, s * w * 0.82, math.sin(a) * r * 0.42), (r * 0.07, r * 0.06, r * 0.07), n=6, jitter=0), solid(CHROME_D), METAL)
    base()

# ── 비행기 ──
def _plane(coat):
    C, CD, WG, WGD, TR = PLANE_COATS[coat]
    begin(701)
    trim_metal = METAL if coat == 'navy' else BASE
    # 동체 — 둥근 관, 옆에 띠 한 줄
    pts = [V(p.x, 0, p.y) for p in _SS[::2]] + [V(_SS[-1].x, 0, _SS[-1].y)]
    rad = [p.z for p in _SS[::2]] + [_SS[-1].z]
    def fcol(p, n):
        if 0.0 < n.z < 0.32 and -0.44 < p.x < 0.40: return jit(TR, 0.04)
        return jit(CD if n.z < -0.45 else C, 0.05)
    paint(loft(pts, rad, sides=12, ell=(FUS_W, 1.0), wob=0), fcol)
    # 엔진 덮개(은빛 고리) · 배기관
    c0, r0 = fus(0.40); c1, r1 = fus(0.50)
    paint(loft([V(0.385, 0, c0), V(0.40, 0, c0), V(0.48, 0, (c0 + c1) / 2), V(0.515, 0, c1)], [r0 + 0.006, r0 + 0.01, r0 * 0.94, r1 * 0.98], sides=14, ell=(FUS_W + 0.03, 1.0), wob=0, cap0=False), shade(CHROME, CHROME_D, k=0.04), METAL)
    for k in range(5):   # 덮개 앞 통풍 구멍
        a = k / 5 * math.pi * 2 + 0.6
        paint(blob(V(0.5, math.cos(a) * 0.08, c1 + math.sin(a) * 0.075), (0.008, 0.012, 0.012), n=6, jitter=0), solid(HOLE))
    for s in (-1, 1):
        tube([V(0.37, s * 0.118, 0.29), V(0.34, s * 0.128, 0.27), V(0.25, s * 0.13, 0.262)], 0.011, solid(CHROME_D), sides=6, mat=METAL)
    # 조종석 — 어두운 구멍, 가죽 테두리, 머리 받침 혹
    cx, hl, hw = CK
    rim = [V(cx + math.cos(a) * hl, math.sin(a) * hw, 0) for a in [k / 18 * 2 * math.pi for k in range(18)]]
    rim = [V(p.x, p.y, topz(p.x, p.y) + 0.004) for p in rim]
    paint(hull([p + V(0, 0, dz) for p in rim for dz in (-0.02, 0.0)]), solid(HOLE, 0.04))
    paint(loft(rim, 0.011, sides=6, closed=True, wob=0, ell=(1.0, 0.8)), shade(LEATHER, LEATHER_D, k=0.05))
    hx = cx - hl - 0.005
    paint(hull([V(hx + dx, y, topz(hx + dx, y) - 0.01) for dx in (0, -0.1) for y in (-0.03, 0.03)] +
               [V(hx - 0.004, y, topz(hx, 0) + 0.04) for y in (-0.028, 0.028)] + [V(hx - 0.1, 0, topz(hx - 0.1, 0) + 0.004)]), shade(C, CD, k=0.04))
    # 조종간
    tube([V(-0.005, 0, 0.27), STICK], 0.006, solid(lin(0x2e2e32)), sides=5)
    paint(blob(STICK + V(0, 0, 0.008), (0.011, 0.011, 0.016), n=8, jitter=0), solid(LEATHER_D))
    # 앞유리
    xw = cx + hl + 0.035; zw = topz(xw, 0)
    gl = []
    for y in (-0.07, -0.035, 0, 0.035, 0.07):
        zb = topz(xw, y) - 0.004
        gl += [V(xw, y, zb), V(xw - 0.004, y, zb), V(xw - 0.03, y * 0.95, zw + 0.06 - abs(y) * 0.25), V(xw - 0.034, y * 0.95, zw + 0.06 - abs(y) * 0.25)]
    paint(hull(gl), solid(GLASS, 0.03))
    tube([V(xw - 0.03, -0.067, zw + 0.044), V(xw - 0.032, 0, zw + 0.062), V(xw - 0.03, 0.067, zw + 0.044)], 0.0045, solid(CHROME), sides=4, mat=METAL)
    # 아래 날개 — 가운데 · 바깥(보조날개 자리 잘림) · 끝
    wf = shade(WG, WGD, k=0.04)
    xle, xte, z, t, sp = LW
    f_h = (xle - AIL[0]) / (xle - xte)
    wing(LW, wf, -AIL[1] - 0.005, AIL[1] + 0.005, tips=False)
    for s in (-1, 1):
        wing(LW, wf, s * (AIL[1] - 0.01), s * (AIL[2] + 0.005), f1=f_h, tips=False)
        paint(hull(wsec(xle, xte, z, t, s * (AIL[2] - 0.005)) + sum((wsec(xle, xte, z, t, s * (sp - dy), sc) for dy, sc in TIP), [])), wf)
    # 위 날개
    xle2, xte2, z2, t2, sp2 = UW
    paint(hull(sum((wsec(xle2, xte2, z2, t2, s * (sp2 - dy), sc) for s in (-1, 1) for dy, sc in TIP), [])), wf)
    paint(hull([V(x, y, z2 + 0.012) for x in (xte2 + 0.035, xte2 + 0.0) for y in (-0.07, 0.07)] + [V(xte2 + 0.05, y, z2 + 0.03) for y in (-0.07, 0.07)] + [V(xte2 - 0.001, y, z2 + 0.004) for y in (-0.06, 0.06)]), solid(TR, 0.04), trim_metal)   # 뒷전 가운데 띠(조종석 쪽)
    # 날개 기둥 — 날개 사이, 동체 위(카반)
    sc = solid(STRUT, 0.04)
    for s in (-1, 1):
        y = s * 0.45
        tube([V(0.305, y, z + t * 0.5), V(0.345, y, z2 - t * 0.3)], 0.009, sc, sides=6, ell=(2.0, 1.0))
        tube([V(0.205, y, z + t * 0.5), V(0.245, y, z2 - t * 0.3)], 0.009, sc, sides=6, ell=(2.0, 1.0))
        tube([V(0.305, y, z + t * 0.6), V(0.245, y, z2 - t * 0.3)], 0.0025, solid(CHROME_D), sides=4, mat=METAL)   # 버팀줄
        tube([V(0.205, y, z + t * 0.6), V(0.345, y, z2 - t * 0.3)], 0.0025, solid(CHROME_D), sides=4, mat=METAL)
        for x0, x1 in ((0.33, 0.35), (0.23, 0.25)):
            tube([V(x0, s * 0.045, topz(x0, 0.045) - 0.01), V(x1, s * 0.11, z2 - t * 0.3)], 0.007, sc, sides=6)
    # 꼬리 — 수평 날개(고정) · 수직 날개(고정)
    tf = shade(C, CD, k=0.04)
    paint(hull([V(x, s * y, STAB_Z + dz) for s in (-1, 1) for x, y in ((-0.385, 0.03), (-0.42, 0.15), (-0.445, 0.19), (-0.475, 0.2), (ELE_X + 0.002, 0.19), (ELE_X + 0.002, 0.03)) for dz in (-0.006, 0.006)]), shade(WG, WGD, k=0.04))
    zt0 = topz(-0.37, 0) - 0.01
    paint(hull([V(x, y, zz) for y in (-0.007, 0.007) for x, zz in ((-0.34, zt0), (-0.40, 0.33), (-0.44, 0.40), (-0.47, 0.425), (RUD_X + 0.002, 0.43), (RUD_X + 0.002, 0.22))]), tf)
    # 착륙 바퀴 다리 — 주바퀴 V자 · 굴대 · 꼬리바퀴 다리
    for s in (-1, 1):
        ax = V(WX, s * (WY - 0.03), WR)
        for x0 in (0.37, 0.22):
            tube([V(x0, s * 0.05, botz(x0, 0.05) + 0.015), ax], 0.008, solid(CHROME_D), sides=6, mat=METAL)
        paint(hull([V(WX + dx, s * y, WR + dz) for dx in (-0.016, 0.016) for y in (WY - 0.035, WY - 0.025) for dz in (-0.016, 0.016)]), solid(CHROME_D), METAL)
    tube([V(WX, -(WY - 0.03), WR), V(WX, WY - 0.03, WR)], 0.007, solid(CHROME_D), sides=6, mat=METAL)
    tc = V(TWX, 0, TWR)
    tube([V(-0.47, 0, botz(-0.47) + 0.01), V(TWX + 0.005, 0, TWR + 0.03)], 0.006, solid(CHROME_D), sides=5, mat=METAL)
    for s in (-1, 1): tube([V(TWX + 0.005, s * 0.012, TWR + 0.032), V(TWX, s * 0.012, TWR)], 0.004, solid(CHROME_D), sides=4, mat=METAL)
    # 움직이는 부분
    wheel('wheelL', V(WX, WY, WR), WR, 0.026, TR)
    wheel('wheelR', V(WX, -WY, WR), WR, 0.026, TR)
    wheel('wheelT', tc, TWR, 0.01, TR)
    for nm, s in (('aileronL', 1), ('aileronR', -1)):
        yA, yB = s * (AIL[1] + 0.003), s * (AIL[2] - 0.003)
        hz = z + _ip(AF, AT, f_h) * t * 0.5
        part(nm, loc=(AIL[0], (yA + yB) / 2, hz))
        pts = []
        for y in (yA, yB):
            pts += [V(AIL[0], y, z + _ip(AF, AT, f_h) * t), V(AIL[0], y, z + _ip(AF, AB, f_h) * t),
                    V(xte + 0.003, y, z + AT[-1] * t), V(xte + 0.003, y, z + AB[-1] * t)]
        paint(hull(pts), shade(TR, tuple(v * 0.8 for v in TR), k=0.04), trim_metal)
    part('elevator', loc=(ELE_X, 0, STAB_Z))
    for s in (-1, 1):
        paint(hull([V(x, s * y, STAB_Z + dz) for x, y, dd in ((ELE_X, 0.022, 1), (ELE_X, 0.195, 1), (-0.53, 0.19, 0.7), (-0.555, 0.15, 0.5), (-0.56, 0.022, 0.5)) for dz in (-0.006 * dd, 0.006 * dd)]), shade(WG, WGD, k=0.04))
    part('rudder', loc=(RUD_X, 0, 0.32))
    rpts = [(RUD_X, 0.43), (-0.515, 0.432), (-0.545, 0.41), (-0.565, 0.36), (-0.57, 0.22), (-0.56, 0.17), (RUD_X, 0.17)]
    paint(hull([V(x, y, zz) for y in (-0.006, 0.006) for x, zz in rpts]), shade(TR, tuple(v * 0.8 for v in TR), k=0.04), trim_metal)
    for k, zz in enumerate((0.25, 0.31, 0.37)):   # 방향타 줄무늬(몸통 색)
        paint(hull([V(x, y, zz + dz) for y in (-0.0075, 0.0075) for x in (RUD_X + 0.003, -0.566) for dz in (0, 0.022)]), solid(C, 0.04))
    # 프로펠러 — 허브에서 x축으로 돈다
    part('prop', loc=tuple(HUB))
    paint(loft([HUB + V(-0.02, 0, 0), HUB + V(0.012, 0, 0), HUB + V(0.045, 0, 0), HUB + V(0.068, 0, 0)], [0.05, 0.05, 0.035, 0.006], sides=12, wob=0), shade(TR, tuple(v * 0.8 for v in TR), k=0.04), trim_metal)
    for s in (-1, 1):
        bl = []
        for k, (rr, w, th) in enumerate(((0.03, 0.022, 0.012), (0.08, 0.034, 0.01), (0.13, 0.034, 0.008), (PROP_R - 0.012, 0.026, 0.006), (PROP_R, 0.012, 0.005))):
            tw = 0.5 - 0.25 * rr / PROP_R   # 비틀림
            for dw in (-w, w):
                for dt in (-th, th):
                    bl.append(HUB + V(0.012 + dt * math.cos(tw) + dw * math.sin(tw) * 0.25, s * dw * math.cos(tw), s * rr))
        paint(hull(bl), shade(WOOD, WOOD_D, k=0.06))
        paint(hull([HUB + V(0.012 + dt, s * dw, s * r) for dt in (-0.0075, 0.0075) for dw in (-0.03, 0.03) for r in (PROP_R - 0.03, PROP_R - 0.01)] + [HUB + V(0.012, 0, s * (PROP_R + 0.003))]), solid(TR, 0.04), trim_metal)   # 날 끝 색
    base()

def _finish_plane(coat):
    _plane(coat); finish('mt_plane_' + coat, OUT, center=False)

def mt_plane_red(): _finish_plane('red')
def mt_plane_yellow(): _finish_plane('yellow')
def mt_plane_navy(): _finish_plane('navy')

# ── 비행기 장식 ──
CREAM, CREAM_D = lin(0xfaf0d6), lin(0xd8c9a4)
ROPE = lin(0x8a6a44)

def _banner():   # 꼬리 현수막 — 꼬리 끝에서 끈 둘이 뒤로, 긴 크림색 천이 물결치며 끌린다 (몸통)
    tail = V(-0.535, 0, 0.196)
    paint(blob(tail + V(-0.004, 0, 0), (0.012, 0.012, 0.012), n=8, jitter=0), solid(CHROME_D), METAL)   # 고리
    x0, x1, zb, zt = -0.8, -1.42, 0.035, 0.195
    n = 12
    def wy(x): return 0.03 * math.sin((x0 - x) / (x0 - x1) * math.pi * 2.2) * ((x0 - x) / (x0 - x1) + 0.2)
    # 앞 막대
    tube([V(x0, 0, zb - 0.01), V(x0, 0, zt + 0.01)], 0.006, solid(WOOD_D), sides=5)
    for zz in (zb, zt): tube(crs([tail + V(-0.01, 0, 0), V(-0.62, 0.004, (0.196 + zz) / 2 + 0.01), V(x0, 0, zz)], 6), 0.0025, solid(ROPE), sides=3)
    for i in range(n):
        a = x0 + (x1 - x0) * i / n; b = x0 + (x1 - x0) * (i + 1) / n
        sag = lambda x: -0.012 * ((x0 - x) / (x0 - x1))
        pts = [V(x, wy(x) + dy, zz + sag(x)) for x in (a, b) for dy in (-0.003, 0.003) for zz in (zb, zt)]
        paint(hull(pts), shade(CREAM, CREAM_D, k=0.04))
        for zz in (zb + 0.012, zt - 0.012):   # 가장자리 단(금빛 실)
            paint(hull([V(x, wy(x) + dy, zz + sag(x) + dz) for x in (a, b) for dy in (-0.0045, 0.0045) for dz in (-0.004, 0.004)]), solid(lin(0xe0b040), 0.04))
    xe = x1; paint(hull([V(xe + dx, wy(xe) + dy, zz + -0.012) for dx in (0, -0.012) for dy in (-0.004, 0.004) for zz in (zb, zt)]), solid(CREAM_D))   # 끝 단

def _smoke():   # 비행운 — 꼬리 아래 은빛 연기 대롱과 뒤로 이어지는 흰 뭉게 연기 (몸통)
    x0 = -0.47; z0 = botz(x0) + 0.003
    tube([V(-0.3, 0, botz(-0.3) - 0.002), V(x0, 0, z0 - 0.004), V(-0.555, 0, z0 - 0.012)], 0.011, shade(CHROME, CHROME_D), sides=8, mat=METAL)
    paint(loft([V(-0.553, 0, z0 - 0.012), V(-0.565, 0, z0 - 0.013)], [0.016, 0.014], sides=10, wob=0), solid(CHROME_D), METAL)
    puffs = [(-0.585, 0.0, 0.0, 0.026), (-0.625, 0.008, 0.016, 0.036), (-0.68, -0.006, 0.04, 0.045), (-0.745, 0.01, 0.07, 0.055),
             (-0.825, -0.008, 0.102, 0.064), (-0.915, 0.012, 0.132, 0.072), (-1.01, -0.006, 0.158, 0.078), (-1.105, 0.01, 0.18, 0.08),
             (-1.19, -0.008, 0.198, 0.072), (-1.265, 0.006, 0.212, 0.058)]   # 위로 피어오른다(현수막과 겹치지 않게)
    for k, (x, y, dz, r) in enumerate(puffs):
        c = V(x, y, z0 - 0.012 + dz)
        paint(blob(c, (r * 1.05, r, r * 0.92), n=16, jitter=0.12), shade(lin(0xffffff), lin(0xdfe4ea), lin(0xc8ced8), k=0.04))
        if r > 0.04:   # 곁뭉게
            paint(blob(c + V(0.01, (0.6 if k % 2 else -0.6) * r, r * 0.35), (r * 0.6, r * 0.55, r * 0.5), n=10, jitter=0.15), shade(lin(0xffffff), lin(0xe4e8ee), k=0.04))

def _goggles():   # 조종사 고글과 목도리 — 고글은 앞유리 위에 걸어 두고, 흰·빨간 목도리가 조종석 뒤 테두리에서 바람에 날린다 (몸통)
    cx, hl, hw = CK
    xw = cx + hl + 0.035; zw = topz(xw, 0)
    # 고글 — 앞유리 틀에 걸친 두 알과 가죽 끈
    gx, gz = xw - 0.031, zw + 0.064
    for s in (-1, 1):
        c = V(gx + 0.004, s * 0.024, gz - 0.002)
        paint(loft([c + V(-0.006, 0, 0), c + V(0.004, 0, 0), c + V(0.012, 0, 0)], [0.019, 0.02, 0.017], sides=12, wob=0, up=Vector((0, 0, 1))), solid(lin(0xc89a40)), METAL)
        paint(cyl(c + V(0.011, 0, 0), c + V(0.014, 0, 0), 0.014, sides=12), solid(lin(0x9fd4ee), 0.03), GLOW)
    tube([V(gx + 0.008, -0.006, gz), V(gx + 0.008, 0.006, gz)], 0.004, solid(LEATHER_D), sides=4)
    for s in (-1, 1):
        tube(crs([V(gx + 0.004, s * 0.042, gz), V(gx - 0.004, s * 0.062, gz - 0.01), V(gx - 0.012, s * 0.066, gz - 0.035), V(gx - 0.016, s * 0.06, gz - 0.055)], 7), 0.004, solid(LEATHER), sides=4, ell=(1.0, 0.4))
    # 목도리 — 뒤 테두리 위 매듭에서 두 갈래가 꼬리 쪽으로 물결치며
    k0 = V(cx - hl + 0.006, 0, topz(cx - hl, 0) + 0.014)
    paint(blob(k0, (0.02, 0.03, 0.014), n=10, jitter=0.1), solid(WHITE, 0.04))
    for s, ln, col in ((1, 1.0, WHITE), (-1, 0.78, lin(0xd8403a))):
        path = []
        for i in range(10):
            u = i / 9; x = k0.x - 0.02 - u * 0.36 * ln
            path.append(V(x, s * (0.012 + 0.03 * u) + 0.03 * math.sin(u * 7.5 + s), max(topz(x, 0) + 0.02, k0.z) + 0.035 * u + 0.016 * math.sin(u * 9 + 1)))
        paint(loft(path, [0.016 + 0.004 * (i / 9) for i in range(10)], sides=4, ell=(1.0, 0.22), wob=0, up=Vector((0, 1, 0)), twist=0.0), solid(col, 0.04))
        e = path[-1]   # 술
        for d in (-0.008, 0.0, 0.008):
            tube([e + V(0, d, 0), e + V(-0.022, d * 1.4, -0.004)], 0.0022, solid(col, 0.04), sides=3)

def _wingstripes():   # 날개 줄무늬 — 위 날개 양 끝에 흰·하늘·흰 띠, 아래 날개 안쪽에도 한 쌍 (몸통)
    def band(W, y0, y1, col, lift=0.0028):
        xle, xte, z, t, sp = W
        pts = []
        for y in (y0, y1):
            for f in [k / 8 for k in range(9)]:
                x = xle + (xte - xle) * f; zt = z + _ip(AF, AT, f) * t
                pts += [V(x + (0.003 if f == 0 else -0.003 if f == 1 else 0), y, zt + lift), V(x, y, zt + lift - 0.004)]
        paint(hull(pts), solid(col, 0.03))
    SKY = lin(0x5aa8e0)
    for s in (-1, 1):
        for (a, b), col in (((0.43, 0.455), WHITE), ((0.462, 0.5), SKY), ((0.507, 0.532), WHITE)):
            band(UW, s * a, s * b, col)
        for (a, b), col in (((0.2, 0.225), WHITE), ((0.232, 0.27), SKY), ((0.277, 0.302), WHITE)):
            band(LW, s * a, s * b, col)

def gd_plane_banner(): begin(711); _banner(); finish('gd_plane_banner', OUT, center=False)
def gd_plane_smoke(): begin(712); _smoke(); finish('gd_plane_smoke', OUT, center=False)
def gd_plane_goggles(): begin(713); _goggles(); finish('gd_plane_goggles', OUT, center=False)
def gd_plane_wingstripes(): begin(714); _wingstripes(); finish('gd_plane_wingstripes', OUT, center=False)

VIEWS = {'a': (1.0, -1.25, 0.75), 's': (0.0, -1.0, 0.12), 'b': (-1.0, 0.9, 0.6), 't': (0.25, -0.2, 1.0), 'f': (1.0, 0.1, 0.2)}

def _pilot():   # 확인용 조종사(미리보기에만) — 몸통·머리
    h = SEAT_HIP
    paint(blob(h + V(0.005, 0, 0.1), (0.06, 0.085, 0.11), n=16, jitter=0), solid(lin(0x5a7ab0)))
    paint(blob(h + V(0.01, 0, 0.245), (0.062, 0.062, 0.066), n=18, jitter=0), solid(lin(0xf0c8a0)))
    for s in (-1, 1): tube([h + V(0.0, s * 0.07, 0.15), STICK + V(-0.01, s * 0.012, 0.0)], 0.017, solid(lin(0x5a7ab0)), sides=6)

def _quiet(fn, *a):
    _orig = lp.finish
    lp.finish = lambda *a, **k: None; globals()['finish'] = lp.finish
    try: fn(*a)
    finally: lp.finish = _orig; globals()['finish'] = _orig

def pv_plane():   # 확인용: 빨간 비행기 + 장식 넷 + 조종사
    _quiet(_finish_plane, 'red')
    base(); random.seed(720)
    _banner(); _smoke(); _goggles(); _wingstripes(); _pilot()
    finish('pv_plane', OUT, center=True, views=VIEWS, lens=60)

def _pv_coat(coat):
    _quiet(_finish_plane, coat)
    base(); _pilot()
    finish('pv_plane_' + coat, OUT, center=True, views={'a': (1.0, -1.25, 0.75), 'f': (1.0, 0.35, 0.3), 'b': (-1.0, 0.9, 0.6)}, lens=60)

def pv_plane_red(): _pv_coat('red')
def pv_plane_yellow(): _pv_coat('yellow')
def pv_plane_navy(): _pv_coat('navy')

ALL = [mt_plane_red, mt_plane_yellow, mt_plane_navy, gd_plane_banner, gd_plane_smoke, gd_plane_goggles, gd_plane_wingstripes, pv_plane]
for f in ALL + [pv_plane_red, pv_plane_yellow, pv_plane_navy]:
    if (not ONLY and f in ALL) or f.__name__ in ONLY: f()
print('DONE')
