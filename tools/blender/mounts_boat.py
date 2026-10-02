# ⛵ 돛단배 탈것 (2026-10-02) — 바다에서만 타는 한 사람 배 (요 21 · 겔 47:10 「그물 치는 곳」)
# 실행: blender -b -P mounts_boat.py -- <출력 폴더> [이름 …]   → models/mounts/mt_sailboat_*.glb · gd_sailboat_*.glb
# 앞 = 블렌더 +x, 원점 = 배 한가운데의 물 높이(z=0이 물낯, 배 밑은 조금 잠긴다) · finish center=False. 사람 키 약 0.53 기준
# 움직이는 부분: sail = 돛대 밑동(0.14, 0, 0.06)에서 돛·활대가 돈다(돛대는 그대로) · rudder = 고물 경첩(−0.465, 0, 0.1)
# 앉는 자리 = 고물 쪽 가로 널(−0.24, z 0.12) — 키손잡이를 쥐는 자리. 돛은 +y 쪽으로 부푼다(장식은 −y 쪽에)
# 선체 빛은 모델을 따로 뽑는다(mt_sailboat_wood·bluewhite·red). 장식도 같은 좌표 — 줄무늬 돛은 게임에서 sail 축 아래로 옮겨 붙인다
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))

WOOD, WOOD_D, WOOD_L = lin(0x8a5a30), lin(0x5e3c1e), lin(0xb07c48)
FLOOR = lin(0x4a3018)
SAIL, SAIL_D = lin(0xf1e6cc), lin(0xd8c8a4)
NET, NET_D = lin(0xc9b98e), lin(0xa8976c)
ROPE = lin(0xd6c59a)
GOLD, GOLD_D = lin(0xe8c25a), lin(0xb8923a)
REED, REED_D = lin(0xc9a868), lin(0xa0844c)
FISH, FISH_D = lin(0xa9b8c4), lin(0x7d8d99)
IRON = lin(0x3a3632)

# 선체 빛: 몸 · 그늘 · 띠(0.035~0.07) · 뱃전 널 · 배 밑
COATS = {
    'wood':      (lin(0x8a5a30), lin(0x6e4626), lin(0x5e3c1e), lin(0xb07c48), lin(0x4f331d)),
    'bluewhite': (lin(0xeeeae0), lin(0xcfcabd), lin(0x2f5f9e), lin(0xf4f0e6), lin(0x3a4a5a)),
    'red':       (lin(0xa83228), lin(0x86271f), lin(0xb83a2e), lin(0xd8b058), lin(0x4a2420)),   # 붉은 몸 · 금빛 뱃전
}

L2 = 0.45   # 반 길이
def half_w(x):
    u = (x + L2) / (2 * L2); return 0.15 * max(0.0, math.sin(u * math.pi)) ** 0.55 + 0.018

def box(c, s, fn, mat=BASE):
    c = Vector(c); return paint(hull([c + Vector((x * s[0], y * s[1], z * s[2])) for x in (-.5, .5) for y in (-.5, .5) for z in (-.5, .5)]), fn, mat)

def fish_at(c, ang, s=1.0, tilt=0.0):
    d = Vector((math.cos(ang) * math.cos(tilt), math.sin(ang) * math.cos(tilt), math.sin(tilt))); side = Vector((-math.sin(ang), math.cos(ang), 0))
    up = d.cross(side).normalized() * -1
    pts = [c + d * 0.05 * s, c - d * 0.04 * s] + [c + side * k * 0.014 * s + up * z for k in (-1, 1) for z in (-0.008 * s, 0.01 * s)]
    paint(hull(pts), shade(FISH, FISH_D, k=0.08))
    paint(hull([c - d * 0.035 * s, c - d * 0.062 * s + up * 0.018 * s, c - d * 0.062 * s - up * 0.018 * s, c - d * 0.035 * s + side * 0.005 * s]), solid(FISH_D))

# ── 선체 ──
def _hull(coat):
    C, CD, BAND, RIM, BOT = COATS[coat]
    pts = []
    for k in range(13):
        x = -L2 + 2 * L2 * k / 12; w = half_w(x)
        for z, s2 in ((-0.055, 0.32), (-0.015, 0.72), (0.035, 0.93), (0.07, 1.0)):
            pts += [V(x, w * s2, z), V(x, -w * s2, z)]
    pts += [V(0.48, 0, 0.11), V(0.47, 0, -0.03), V(-0.47, 0, 0.09), V(-0.465, 0, -0.03)]   # 이물이 솟고 고물은 뭉툭
    def fn(p, n):
        if n.z > 0.55: return jit(FLOOR, 0.08)   # 배 안 바닥
        if p.z > 0.035: return jit(BAND, 0.06)
        if p.z < -0.03: return jit(BOT, 0.08)
        return jit(C if n.z > -0.3 else CD, 0.08)
    paint(hull(pts), fn)
    # 뱃전 널 — 바닥보다 높이 둘러 배 안이 우묵해 보이게
    rim = [V(-L2 + 2 * L2 * k / 12, half_w(-L2 + 2 * L2 * k / 12), 0.1) for k in range(1, 12)]
    rim = rim + [V(0.475, 0, 0.13)] + [V(v.x, -v.y, v.z) for v in reversed(rim)] + [V(-0.462, 0, 0.11)]
    paint(loft(rim, 0.02, sides=4, ell=(0.4, 1.7), closed=True, wob=0), shade(RIM, RIM, k=0.08))
    # 용골과 이물 기둥
    paint(loft([V(-0.44, 0, -0.05), V(0.0, 0, -0.065), V(0.42, 0, -0.04), V(0.49, 0, 0.06), V(0.5, 0, 0.17)], 0.012, sides=4, wob=0), solid(WOOD_D))
    paint(cyl((-0.468, 0, -0.04), (-0.468, 0, 0.15), 0.012, sides=4), solid(WOOD_D))   # 고물 기둥(키 경첩)
    # 가로 널 — 앉는 널(고물 쪽)과 돛대 널
    for x, wdt in ((-0.24, 0.07), (0.14, 0.06)):
        w = half_w(x) - 0.004
        box((x, 0, 0.105), (wdt, 2 * w, 0.022), shade(WOOD_L, WOOD))
    # 바닥 널 줄
    for y in (-0.05, 0.05): paint(cyl((-0.33, y, 0.072), (0.36, y, 0.072), 0.005, sides=3), solid(WOOD_D))
    # 돛대 — 돛대 널을 꿰어 바닥에 선다
    paint(cyl((0.14, 0, 0.06), (0.14, 0, 0.75), 0.013, 0.009, sides=6), solid(WOOD_D))
    paint(blob((0.14, 0, 0.765), (0.016, 0.016, 0.016), n=6, jitter=0), shade(GOLD, GOLD_D), METAL)
    # 밧줄 — 돛대 꼭대기에서 이물·양 뱃전으로
    for end in (V(0.47, 0, 0.13), V(0.0, 0.145, 0.12), V(0.0, -0.145, 0.12)):
        paint(cyl((0.14, 0, 0.73), end, 0.003, sides=3), solid(ROPE))

# ── 돛 (sail) ──
ST, SP, SC = V(0.40, 0.02, 0.15), V(-0.06, 0.02, 1.0), V(-0.05, 0.02, 0.26)   # 앞 아래 · 꼭대기 · 뒤 아래
NSTRIP = 7
def _billow(wT, wP, wC): return 0.075 * 27 * wT * wP * wC
def _strip(k, th):
    f0, f1 = k / NSTRIP, (k + 1) / NSTRIP; pts = []
    for f in (f0, f1):
        a = ST + (SC - ST) * f; b = SP + (SC - SP) * f
        for g in (0, 0.25, 0.5, 0.75, 1):
            p = a + (b - a) * g
            wC = f; wT = (1 - f) * (1 - g); wP = (1 - f) * g
            y = _billow(wT, wP, wC)
            pts += [p + V(0, y + th, 0), p + V(0, y - th, 0)]
    return hull(pts)

def _sail():
    for k in range(NSTRIP): paint(_strip(k, 0.006), shade(SAIL, SAIL_D, k=0.04))
    # 활대(위) — 앞 아래에서 돛대 꼭대기를 지나 하늘로
    d = (SP - ST).normalized()
    paint(cyl(ST - d * 0.05, SP + d * 0.04, 0.011, 0.007, sides=5), solid(WOOD_D))
    paint(cyl(ST, SC + (SC - ST).normalized() * 0.02, 0.008, sides=4), solid(WOOD))   # 아래 활대
    paint(blob((0.14, 0.012, 0.63), (0.016, 0.016, 0.02), n=6, jitter=0), solid(ROPE))   # 활대를 돛대에 묶은 매듭
    paint(cyl((0.14, 0.012, 0.63), (0.14, 0.0, 0.7), 0.004, sides=3), solid(ROPE))
    paint(cyl(SC, V(-0.16, 0.0, 0.14), 0.003, sides=3), solid(ROPE))   # 돛줄 — 앉은 사람 손으로

# ── 키 (rudder) ──
RUD = (-0.465, 0, 0.1)
def _rudder():
    blade = [V(x, y, z) for y in (-0.008, 0.008) for (x, z) in ((-0.475, 0.12), (-0.5, 0.12), (-0.475, -0.13), (-0.56, -0.11), (-0.555, 0.0))]
    paint(hull(blade), shade(WOOD, WOOD_D))
    paint(cyl((-0.48, 0, 0.12), (-0.48, 0, 0.16), 0.01, sides=5), solid(WOOD_D))
    paint(loft([V(-0.48, 0, 0.155), V(-0.42, 0, 0.165), V(-0.32, 0, 0.17)], [0.008, 0.007, 0.006], sides=4, wob=0), solid(WOOD_L))   # 키손잡이
    for z in (0.03, 0.1): paint(cyl((-0.468, 0, z), (-0.478, 0, z), 0.012, sides=5), solid(IRON), METAL)   # 경첩

def _boat(coat, extra=None):
    begin(501)
    _hull(coat)
    part('sail', loc=(0.14, 0, 0.06))
    _sail()
    if extra: extra('sail')
    base()
    part('rudder', loc=RUD)
    _rudder()
    base()
    if extra: extra('body')

def mt_sailboat_wood(): _boat('wood'); finish('mt_sailboat_wood', OUT, center=False)
def mt_sailboat_bluewhite(): _boat('bluewhite'); finish('mt_sailboat_bluewhite', OUT, center=False)
def mt_sailboat_red(): _boat('red'); finish('mt_sailboat_red', OUT, center=False)

# ── 장식 ──
def _g_stripesail():   # 줄무늬 돛 — 돛 위에 붉은 띠를 겹친다 (sail 축 아래로)
    for k in range(1, NSTRIP, 2): paint(_strip(k, 0.0095), shade(lin(0xb83a32), lin(0x962c26), k=0.04))
    paint(_strip(0, 0.0095), shade(lin(0x2f5f9e), lin(0x244a7c), k=0.04))   # 활대 아래 첫 띠는 푸르게

def _g_pennant():   # 뱃머리 깃발 — 이물 기둥 위 깃대에 뒤로 나부끼는 긴 삼각기
    paint(cyl((0.5, 0, 0.16), (0.5, 0, 0.52), 0.006, sides=4), solid(WOOD_D))
    paint(blob((0.5, 0, 0.53), (0.012, 0.012, 0.012), n=6, jitter=0), shade(GOLD, GOLD_D), METAL)
    top, bot = 0.51, 0.43; xs = [0.495, 0.44, 0.38, 0.32, 0.27]
    for i in range(len(xs) - 1):
        def edge(j):
            u = j / (len(xs) - 1); h = (top - bot) * (1 - u) / 2; m = (top + bot) / 2 - 0.01 * u
            y = 0.015 * math.sin(u * math.pi * 2)
            return [V(xs[j], y + t, m + h) for t in (-0.003, 0.003)] + [V(xs[j], y + t, m - h) for t in (-0.003, 0.003)]
        paint(hull(edge(i) + edge(i + 1)), solid(lin(0xc8402e) if i % 2 == 0 else lin(0xf0e2c0), 0.04))

def _g_lantern():   # 고물 등불 — 오른쪽(−y) 고물 뱃전 안쪽에 세운 갈고리 기둥에 매단 등
    paint(cyl((-0.36, -0.082, 0.09), (-0.36, -0.082, 0.36), 0.007, sides=4), solid(WOOD_D))
    paint(loft([V(-0.36, -0.082, 0.355), V(-0.395, -0.082, 0.37), V(-0.425, -0.082, 0.355)], 0.005, sides=3, wob=0), solid(IRON), METAL)
    cx, cy = -0.425, -0.082
    paint(cyl((cx, cy, 0.35), (cx, cy, 0.325), 0.002, sides=3), solid(IRON), METAL)
    paint(cyl((cx, cy, 0.24), (cx, cy, 0.252), 0.024, 0.024, sides=6), shade(GOLD, GOLD_D), METAL)   # 밑판
    paint(cone((cx, cy, 0.3), (cx, cy, 0.33), 0.027, sides=6), shade(GOLD, GOLD_D), METAL)   # 지붕
    for a in range(4):
        aa = a / 4 * 2 * math.pi + math.pi / 4
        paint(cyl((cx + math.cos(aa) * 0.02, cy + math.sin(aa) * 0.02, 0.25), (cx + math.cos(aa) * 0.02, cy + math.sin(aa) * 0.02, 0.302), 0.003, sides=3), solid(GOLD_D), METAL)
    paint(cyl((cx, cy, 0.252), (cx, cy, 0.3), 0.017, sides=6), solid(lin(0xffe2a0), 0.02), GLOW)   # 빛나는 유리
    paint(blob((cx, cy, 0.272), (0.008, 0.008, 0.014), n=6, jitter=0), solid(lin(0xfff4c8), 0), GLOW)

def _g_netbasket():   # 그물과 물고기 바구니 — 이물 쪽 바닥에 그물 더미, 돛대 뒤 오른쪽에 물고기 바구니 (요 21:11)
    for k in range(3): paint(blob((0.29 + 0.01 * k, 0, 0.085 + k * 0.022), (0.075 - k * 0.018, 0.075 - k * 0.018, 0.024), n=12, jitter=0.35), shade(NET, NET_D, k=0.12))
    for (x, y) in ((0.22, 0.06), (0.35, -0.05), (0.27, -0.07), (0.37, 0.04)):
        paint(blob((x, y, 0.1), (0.012, 0.012, 0.012), n=6, jitter=0), solid(lin(0xe0c060)))   # 찌
    paint(loft(crs([(0.24, 0.02, 0.12), (0.2, 0.07, 0.1), (0.17, 0.1, 0.11)], 5), 0.004, sides=3, wob=0), solid(ROPE))
    cx, cy = 0.03, -0.085
    pts = [V(cx + math.cos(a) * r, cy + math.sin(a) * r * 0.85, z) for a in [k / 10 * 2 * math.pi for k in range(10)] for (r, z) in ((0.035, 0.07), (0.048, 0.15))]
    paint(hull(pts), shade(lin(0x3a2a16), REED_D))   # 윗면 = 바구니 안(어둡게)
    for z in (0.095, 0.125): paint(loft([V(cx + math.cos(a) * (0.0395 + (z - 0.07) * 0.11), cy + math.sin(a) * (0.0395 + (z - 0.07) * 0.11) * 0.85, z) for a in [k / 12 * 2 * math.pi for k in range(12)]], 0.003, sides=3, closed=True, wob=0), solid(REED_D))
    paint(loft([V(cx + math.cos(a) * 0.049, cy + math.sin(a) * 0.042, 0.15) for a in [k / 12 * 2 * math.pi for k in range(12)]], 0.005, sides=3, closed=True, wob=0), solid(REED))
    for (dx, dy, ang, tl) in ((-0.01, 0.0, 0.4, 0.7), (0.015, 0.012, 2.6, 0.5), (0.005, -0.015, 4.4, 0.9), (-0.02, -0.01, 1.2, 0.3)):
        fish_at(V(cx + dx, cy + dy, 0.165), ang, 0.8, tl)

GEAR = {'stripesail': (_g_stripesail, 'sail'), 'pennant': (_g_pennant, 'body'), 'lantern': (_g_lantern, 'body'), 'netbasket': (_g_netbasket, 'body')}

def _gear(key):
    begin(510 + list(GEAR).index(key)); GEAR[key][0](); finish('gd_sailboat_' + key, OUT, center=False)

def gd_sailboat_stripesail(): _gear('stripesail')
def gd_sailboat_pennant(): _gear('pennant')
def gd_sailboat_lantern(): _gear('lantern')
def gd_sailboat_netbasket(): _gear('netbasket')

def pv_sailboat():   # 확인용 — 나무 배 + 장식 넷
    def extra(where):
        for k, (fn, at) in GEAR.items():
            if at == where: fn()
    _boat('wood', extra)
    finish('pv_sailboat', OUT, center=True, views={'a': (1.0, -1.25, 0.75), 'b': (-0.6, 1.3, 0.6), 's': (0.0, -1.0, 0.15)})

ALL = [mt_sailboat_wood, mt_sailboat_bluewhite, mt_sailboat_red,
       gd_sailboat_stripesail, gd_sailboat_pennant, gd_sailboat_lantern, gd_sailboat_netbasket, pv_sailboat]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
