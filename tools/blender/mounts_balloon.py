# 🎈 열기구 (2026-10-02) — 3D 걸어서 구경의 오늘의 탈것. 느리게 높이 떠서 구경하는 탈것
# 실행: blender -b -P mounts_balloon.py -- <출력 폴더> [이름 …]   → models/mounts/mt_balloon_*.glb · gd_balloon_*.glb
# 앞 = 블렌더 +x, 원점 = 바구니 가운데 아래 땅(finish center=False — 장식이 같은 원점에 맞물린다). 사람 키 약 0.53 기준
# 사람은 바구니 바닥(FLOOR)에 선다 — 허리 위만 보인다
# 움직이는 부분: flame(버너 불꽃, 노즐 위 — 게임이 크기를 흔든다) · envelope(풍선 전체, 아래 입구 — 게임이 살살 흔든다)
# 장식: lanterns = envelope 축에 붙는다(풍선과 함께 흔들린다) · flags·sandbags·banner = 몸통
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))

REED, REED_L, REED_D = lin(0xc39a5c), lin(0xd6b274), lin(0x8e6a3a)
LEATHER, LEATHER_D = lin(0x6a4026), lin(0x4a2a18)
SILVER, SILVER_D = lin(0xd0d4da), lin(0x9aa0a8)
BLACK = lin(0x26262a)
ROPE = lin(0xd8c8a0)
CANVAS, CANVAS_D = lin(0xcdb488), lin(0x9e8660)
CREAM = lin(0xf4ead2)

# ── 치수 ──
BX = 0.15          # 바구니 반폭(바깥)
BT = 0.016         # 벽 두께
BH = 0.2           # 벽 높이(가죽 테 아래)
RIM = 0.212        # 가죽 테 높이
FLOOR = 0.025      # 바구니 바닥(사람이 서는 높이)
FRAME_Z = 0.6      # 버너 틀
NOZ = V(0, 0, 0.665)   # 버너 노즐 = flame 축
MOUTH = V(0, 0, 0.72)  # 풍선 입구 = envelope 축
SIDES = 24         # 풍선 조각(고어) 수
# 풍선 옆모습 (높이, 반지름) — 아래 좁고 위가 둥근 눈물방울
PROF = [(0.72, 0.13), (0.76, 0.17), (0.84, 0.24), (0.94, 0.315), (1.05, 0.38), (1.16, 0.425), (1.27, 0.45),
        (1.36, 0.445), (1.44, 0.41), (1.5, 0.355), (1.545, 0.285), (1.575, 0.2), (1.593, 0.11), (1.6, 0.03)]

def rad(z):
    for (z0, r0), (z1, r1) in zip(PROF, PROF[1:]):
        if z0 <= z <= z1: return r0 + (r1 - r0) * (z - z0) / (z1 - z0)
    return PROF[0][1] if z < PROF[0][0] else 0.0

R_, O_, Y_, G_, B_, P_ = lin(0xe0453a), lin(0xf08a2c), lin(0xf6cf3a), lin(0x5cb85a), lin(0x3f86d8), lin(0x8a5cc8)
SKY, SKY_L, WHITE = lin(0x6fbbe8), lin(0x9ad2f2), lin(0xfbfbf8)

def _cloud(a, z):   # 하늘 풍선의 흰 구름 — (각도, 높이) 위의 타원 몇 개
    for ca, cz, wa, wz in ((0.2, 1.18, 0.42, 0.05), (0.45, 1.24, 0.3, 0.06), (0.75, 1.19, 0.3, 0.04),
                           (2.2, 1.0, 0.35, 0.045), (2.45, 1.06, 0.25, 0.05),
                           (3.9, 1.32, 0.38, 0.05), (4.15, 1.38, 0.25, 0.05), (4.4, 1.32, 0.3, 0.04),
                           (5.5, 1.05, 0.3, 0.04), (5.7, 1.1, 0.22, 0.045)):
        d = (a - ca + math.pi) % (2 * math.pi) - math.pi
        if (d / wa) ** 2 + ((z - cz) / wz) ** 2 < 1: return True
    return False

COATS = {
    'rainbow':  dict(gore=lambda j, a, z: [R_, O_, Y_, G_, B_, P_][j % 6], crown=lin(0xf6d26a), skirt=None),
    'redwhite': dict(gore=lambda j, a, z: R_ if j % 2 == 0 else WHITE, crown=R_, skirt=None),
    'sky':      dict(gore=lambda j, a, z: WHITE if _cloud(a, z) else (SKY if j % 2 == 0 else SKY_L), crown=lin(0xf3e6c4), skirt=lin(0xf3e6c4)),
}

def tube(pts, r, col, sides=6, mat=BASE):
    return paint(loft(pts, r, sides=sides, wob=0), col, mat)

def box(x0, x1, y0, y1, z0, z1):
    return hull([V(x, y, z) for x in (x0, x1) for y in (y0, y1) for z in (z0, z1)])

# ── 바구니 ──
def _basket():
    paint(box(-BX, BX, -BX, BX, 0.0, FLOOR), shade(lin(0x7a5634), lin(0x5a3e24)))          # 바닥
    for s in (-1, 1): paint(box(-BX + 0.01, BX - 0.01, s * 0.1 - 0.012, s * 0.1 + 0.012, -0.004, 0.006), solid(LEATHER_D))   # 밑 받침목
    nb = 7
    for k in range(nb):   # 엮은 띠 — 띠마다 살짝 들어갔다 나왔다
        z0, z1 = FLOOR * 0.4 + k * (BH - FLOOR * 0.4) / nb, FLOOR * 0.4 + (k + 1) * (BH - FLOOR * 0.4) / nb
        e = 0.002 if k % 2 else -0.001
        c = shade(REED_L if k % 2 else REED, REED if k % 2 else REED_D, k=0.1)
        for s in (-1, 1):
            paint(box(s * (BX + e), s * (BX - BT), -BX, BX, z0, z1), c)
            paint(box(-BX, BX, s * (BX + e), s * (BX - BT), z0, z1), c)
    for t in (-0.09, -0.03, 0.03, 0.09):   # 세로 살
        for s in (-1, 1):
            tube([V(s * (BX + 0.003), t, 0.01), V(s * (BX + 0.003), t, BH)], 0.0045, solid(REED_D, 0.06), sides=4)
            tube([V(t, s * (BX + 0.003), 0.01), V(t, s * (BX + 0.003), BH)], 0.0045, solid(REED_D, 0.06), sides=4)
    for sx in (-1, 1):   # 모서리 가죽
        for sy in (-1, 1):
            paint(box(sx * (BX + 0.004), sx * (BX - 0.022), sy * (BX + 0.004), sy * (BX - 0.022), 0.0, BH), shade(LEATHER, LEATHER_D, k=0.06))
    loop = [V(BX, BX, RIM), V(-BX, BX, RIM), V(-BX, -BX, RIM), V(BX, -BX, RIM)]
    paint(loft(loop, 0.016, sides=6, closed=True, wob=0, ell=(1.0, 0.8)), shade(LEATHER, LEATHER_D, k=0.06))   # 가죽 테
    for s in (-1, 1):   # 옆 밧줄 손잡이
        for x in (-0.07, 0.07):
            tube(crs([V(x - 0.025, s * (BX + 0.004), 0.15), V(x, s * (BX + 0.02), 0.125), V(x + 0.025, s * (BX + 0.004), 0.15)], 6), 0.004, solid(ROPE), sides=3)
    # 연료통 둘 — 뒤 구석, 가죽 덮개
    for s in (-1, 1):
        c = V(-0.088, s * 0.088, FLOOR)
        paint(loft([c, c + V(0, 0, 0.15), c + V(0, 0, 0.165)], [0.04, 0.04, 0.028], sides=10, wob=0), shade(lin(0x2f4a7a), lin(0x22365a), k=0.05))
        paint(cyl(c + V(0, 0, 0.165), c + V(0, 0, 0.185), 0.009, sides=6), solid(SILVER), METAL)
        tube(crs([c + V(0, 0, 0.185), c + V(0.02, -s * 0.01, 0.26), V(-0.06, s * 0.055, 0.45), V(-0.05, s * 0.05, FRAME_Z - 0.01)], 8), 0.005, solid(BLACK))   # 호스

# ── 버너와 줄 ──
FC = [V(sx * 0.06, sy * 0.06, FRAME_Z) for sx, sy in ((1, 1), (-1, 1), (-1, -1), (1, -1))]
def _burner():
    for sx in (-1, 1):   # 바구니 모서리에서 버너 틀까지 기둥(아래는 가죽 덮개)
        for sy in (-1, 1):
            a, b = V(sx * (BX - 0.016), sy * (BX - 0.016), RIM), V(sx * 0.06, sy * 0.06, FRAME_Z)
            tube([a, b], 0.006, solid(SILVER_D), sides=5, mat=METAL)
            tube([a + V(0, 0, -0.01), a + (b - a) * 0.28], 0.013, shade(LEATHER, LEATHER_D, k=0.06), sides=6)
    paint(loft(FC, 0.007, sides=4, closed=True, wob=0), solid(SILVER), METAL)   # 버너 틀
    paint(loft([V(math.cos(a) * 0.042, math.sin(a) * 0.042, FRAME_Z + 0.03) for a in [k / 14 * 2 * math.pi for k in range(14)]], 0.012, sides=6, closed=True, wob=0), solid(SILVER, 0.05), METAL)   # 코일
    paint(loft([V(0, 0, FRAME_Z - 0.012), V(0, 0, FRAME_Z + 0.03), V(0, 0, NOZ.z)], [0.03, 0.026, 0.012], sides=8, wob=0), shade(SILVER, SILVER_D, k=0.05), METAL)
    for p in FC: tube([p, V(p.x * 0.6, p.y * 0.6, FRAME_Z + 0.03)], 0.004, solid(SILVER_D), sides=3, mat=METAL)
    for k, p in enumerate(FC):   # 버너 틀에서 풍선 입구로 — 모서리마다 줄 둘
        for da in (-0.32, 0.32):
            a = math.atan2(p.y, p.x) + da
            tube([p, V(math.cos(a) * 0.125, math.sin(a) * 0.125, MOUTH.z + 0.004)], 0.0035, solid(lin(0x5a4a3a)), sides=3)

def _flame():
    part('flame', loc=tuple(NOZ))
    paint(loft([NOZ, NOZ + V(0, 0, 0.03), NOZ + V(0, 0, 0.07), NOZ + V(0, 0, 0.11), NOZ + V(0, 0, 0.14)], [0.014, 0.03, 0.028, 0.016, 0.003], sides=8, wob=0.15), solid(lin(0xffa030), 0.12), GLOW)
    paint(loft([NOZ + V(0, 0, 0.005), NOZ + V(0, 0, 0.04), NOZ + V(0, 0, 0.075)], [0.008, 0.016, 0.004], sides=6, wob=0), solid(lin(0xfff0a0), 0.05), GLOW)
    base()

def _envelope(coat):
    C = COATS[coat]
    part('envelope', loc=tuple(MOUTH))
    sm = crs([V(r, 0, z) for z, r in PROF], 24)   # 매끈하게 다시 뽑은 옆모습
    pts = [V(0, 0, q.z) for q in sm]; radii = [q.x for q in sm]
    fs = loft(pts, radii, sides=SIDES, wob=0)
    n = len(sm); body = fs[:(n - 1) * SIDES]
    for idx, f in enumerate(body):
        i, j = divmod(idx, SIDES)
        f.normal_update(); c = f.calc_center_median()
        a = math.atan2(c.y, c.x) % (2 * math.pi)
        col = C['gore'](j, a, c.z)
        if C['skirt'] and c.z < 0.8: col = C['skirt']
        k = 0.84 + 0.16 * max(-1.0, min(1.0, f.normal.z + 0.4))   # 아래쪽은 조금 어둡게
        paint([f], solid(tuple(v * k for v in col), 0.03))
    paint([fs[(n - 1) * SIDES]], solid(lin(0x6a3020)))         # 입구 안쪽
    paint([fs[(n - 1) * SIDES + 1]], solid(C['crown']))       # 꼭대기
    # 입구 쇠고리 + 꼭대기 단추
    paint(loft([V(math.cos(a) * 0.128, math.sin(a) * 0.128, MOUTH.z + 0.004) for a in [k / 16 * 2 * math.pi for k in range(16)]], 0.006, sides=4, closed=True, wob=0), solid(SILVER_D), METAL)
    paint(cyl(V(0, 0, 1.598), V(0, 0, 1.612), 0.05, 0.035, sides=12), solid(C['crown']))
    base()

def _balloon(coat):
    begin(601)
    _basket(); _burner(); _flame(); _envelope(coat)
    finish('mt_balloon_' + coat, OUT, center=False)

def mt_balloon_rainbow(): _balloon('rainbow')
def mt_balloon_redwhite(): _balloon('redwhite')
def mt_balloon_sky(): _balloon('sky')

# ── 열기구 장식 ──
FLAGC = [lin(0xe0453a), lin(0xf6cf3a), lin(0x3f86d8), lin(0x5cb85a), lin(0xf08a2c), lin(0xfbfbf8)]

def _flags():   # 바구니 깃발 줄 — 가죽 테를 따라 늘어진 삼각 깃발 (몸통)
    o = BX + 0.022; ci = 0
    corners = [V(o, o, 0.205), V(-o, o, 0.205), V(-o, -o, 0.205), V(o, -o, 0.205)]
    for k in range(4):
        a, b = corners[k], corners[(k + 1) % 4]
        for h in range(2):   # 한 변에 두 번 늘어짐
            p0, p1 = a + (b - a) * (h / 2), a + (b - a) * ((h + 1) / 2)
            at = lambda u: p0 + (p1 - p0) * u + V(0, 0, -0.03 * math.sin(math.pi * u))
            tube([at(u / 6) for u in range(7)], 0.0025, solid(ROPE), sides=3)
            for m in range(4):
                u0, u1 = 0.1 + m * 0.21, 0.1 + m * 0.21 + 0.16
                q0, q1 = at(u0), at(u1); mid = (q0 + q1) / 2 + V(0, 0, -0.04)
                nrm = (p1 - p0).normalized().cross(V(0, 0, 1)) * 0.002
                paint(hull([q0 + nrm, q1 + nrm, mid + nrm, q0 - nrm, q1 - nrm, mid - nrm]), solid(FLAGC[ci % len(FLAGC)], 0.06)); ci += 1
    for c in corners: paint(blob(c, (0.007, 0.007, 0.007), n=6, jitter=0), solid(lin(0xf6d26a)), METAL)

def _sandbags():   # 모래주머니 — 앞뒤 벽에 둘씩, 테에서 밧줄로 매단 (몸통)
    for sx in (-1, 1):
        for y in (-0.075, 0.075):
            top = V(sx * (BX + 0.006), y, RIM - 0.01); c = V(sx * (BX + 0.03), y, 0.1)
            tube([top, c + V(-sx * 0.004, 0, 0.05)], 0.003, solid(ROPE), sides=3)
            paint(blob(c, (0.022, 0.03, 0.04), n=14, jitter=0.12), shade(CANVAS, CANVAS_D, k=0.1))
            paint(blob(c + V(-sx * 0.003, 0, 0.044), (0.01, 0.012, 0.008), n=7, jitter=0.1), solid(CANVAS_D))   # 묶은 목
            tube([c + V(-sx * 0.002, -0.013, 0.038), c + V(-sx * 0.002, 0.013, 0.038)], 0.003, solid(lin(0x7a5634)), sides=3)

def _banner():   # 현수막 — 양 옆 벽에 테 아래로 매단 크림색 천(글씨는 게임이 얹는다) (몸통)
    for s in (-1, 1):
        y = s * (BX + 0.012); x0, x1, z0, z1 = -0.125, 0.125, 0.05, 0.178
        nx = 8
        for k in range(nx):   # 살짝 물결치는 천
            u0, u1 = k / nx, (k + 1) / nx
            w = lambda u: s * 0.004 * math.sin(u * math.pi * 2)
            pts = []
            for u in (u0, u1):
                x = x0 + (x1 - x0) * u
                for d in (0, s * 0.003): pts += [V(x, y + w(u) + d, z0), V(x, y + w(u) + d, z1)]
            paint(hull(pts), solid(CREAM, 0.03))
        tube([V(x0 - 0.012, y, z1 + 0.006), V(x1 + 0.012, y, z1 + 0.006)], 0.005, solid(lin(0x9a7044)), sides=5)   # 위 막대
        for x in (x0 - 0.008, x1 + 0.008):
            tube([V(x, y, z1 + 0.006), V(x, s * (BX + 0.004), RIM)], 0.0025, solid(ROPE), sides=3)
            paint(blob(V(x, y, z1 + 0.006), (0.006, 0.006, 0.006), n=6, jitter=0), solid(lin(0xf6d26a)), METAL)
        paint(hull([V(x, y + s * 0.0025 + d, z) for x in (x0, x1) for d in (0, s * 0.001) for z in (z0 - 0.004, z0)]), solid(lin(0xc9a868)))   # 아래 술 띠

def _lanterns():   # 등불 줄 — 풍선 아래쪽을 두른 작은 등불 (envelope 축)
    Z, N, sag = 0.9, 10, 0.035
    def at(t, u):
        a = t * 2 * math.pi / N; z = Z - sag * math.sin(math.pi * u); r = rad(z) + 0.012
        return V(math.cos(a) * r, math.sin(a) * r, z)
    for k in range(N):
        tube([at(k + u / 6, u / 6) for u in range(7)], 0.0025, solid(lin(0x5a4a3a)), sides=3)
        paint(blob(at(k, 0), (0.007, 0.007, 0.007), n=6, jitter=0), solid(lin(0xf6d26a)), METAL)
        m = at(k + 0.5, 1.0); out = V(m.x, m.y, 0).normalized() * 0.01
        top = m + out * 0.6; c = top + out * 1.4 + V(0, 0, -0.042)
        tube([m, top, c + V(0, 0, 0.022)], 0.0018, solid(lin(0x5a4a3a)), sides=3)
        col = lin(0xff5a3a) if k % 2 else lin(0xffc040)
        paint(loft([c + V(0, 0, -0.02), c + V(0, 0, -0.008), c + V(0, 0, 0.008), c + V(0, 0, 0.02)], [0.01, 0.02, 0.02, 0.01], sides=8, wob=0), solid(col, 0.05), GLOW)
        paint(cyl(c + V(0, 0, 0.019), c + V(0, 0, 0.026), 0.011, 0.007, sides=6), solid(lin(0x3a2a20)))
        paint(cyl(c + V(0, 0, -0.027), c + V(0, 0, -0.019), 0.005, 0.011, sides=6), solid(lin(0x3a2a20)))

def gd_balloon_flags(): begin(611); _flags(); finish('gd_balloon_flags', OUT, center=False)
def gd_balloon_sandbags(): begin(612); _sandbags(); finish('gd_balloon_sandbags', OUT, center=False)
def gd_balloon_banner(): begin(613); _banner(); finish('gd_balloon_banner', OUT, center=False)
def gd_balloon_lanterns(): begin(614); _lanterns(); finish('gd_balloon_lanterns', OUT, center=False)

def _noexport(fn):
    import lp
    _orig = lp.finish
    lp.finish = lambda *a, **k: None; globals()['finish'] = lp.finish
    try: fn()
    finally: lp.finish = _orig; globals()['finish'] = _orig

V3 = {'a': (1.0, -1.25, 0.55), 's': (0.0, -1.0, 0.1), 'b': (-1.0, 0.9, 0.5)}

def pv_balloon():   # 확인용: 무지개 열기구 + 장식 넷을 한 모델로
    _noexport(lambda: _balloon('rainbow'))
    base(); random.seed(620)
    _flags(); _sandbags(); _banner(); _lanterns()
    finish('pv_balloon', OUT, center=True, views=V3)

def pv_basket():   # 확인용: 바구니 가까이(장식 포함, 풍선 없이)
    begin(601); _basket(); _burner(); _flame(); _flags(); _sandbags(); _banner()
    finish('pv_basket', OUT, center=True, views={'a': (1.0, -1.25, 0.7), 'b': (-1.0, 0.9, 0.5)})

ALL = [mt_balloon_rainbow, mt_balloon_redwhite, mt_balloon_sky, gd_balloon_flags, gd_balloon_sandbags, gd_balloon_banner, gd_balloon_lanterns, pv_balloon, pv_basket]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
