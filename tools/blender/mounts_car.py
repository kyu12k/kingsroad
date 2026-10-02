# 🚗 자동차 (2026-10-02) — 3D 걸어서 구경의 탈것. 둥글고 귀여운 옛날 소형차(비틀·피아트 500 느낌), 지붕 없는 오픈카라 위에서 운전하는 사람이 보인다
# 실행: blender -b -P mounts_car.py -- <출력 폴더> [이름 …]   → models/mounts/mt_car_*.glb · gd_car_*.glb
# 앞 = 블렌더 +x, 왼쪽 = +y, 원점 = 차 한가운데 아래 땅(finish center=False — 장식이 같은 원점에 맞물린다). 사람 키 약 0.53 기준
# 움직이는 부분: wheel0(앞 왼쪽 +y) · wheel1(앞 오른쪽 −y) · wheel2(뒤 왼쪽) · wheel3(뒤 오른쪽) — 굴대 중심, y축으로 돈다
#               steer — 운전대 허브. 축(피벗)의 로컬 +z(블렌더) = three.js 로컬 +y = 운전대 기둥 방향, 그 축으로 돌리면 핸들이 꺾인다
# 운전석: 가운데 앞 벤치(y=0). 엉덩이 SEAT_HIP · 운전대 HUB
# 장식: roofrack(뒤 덮개 위 짐칸) · weddingflowers(혼인 잔치 차 — 보닛 꽃다발과 리본) · picnic(뒷좌석 소풍 바구니·담요) — 모두 몸통
#       wheelcaps — 움직이는 부분 cap0~cap3(바퀴와 같은 굴대 중심, 같은 번호의 wheelN과 함께 돌린다)
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
FLOORC = lin(0x4a4a50)
RUBBER = lin(0x38383c)
LAMP = lin(0xfff4c8)
TAIL = lin(0xe8322a)
GLASS = lin(0xa8d6ee)
GOLD, GOLD_D = lin(0xf2c84a), lin(0xc8962c)
LEAF = lin(0x6f9a45)

# ── 치수 ──
WR = 0.09                     # 바퀴 반지름(타이어 끝)
TW = 0.0325                   # 타이어 반폭
WY = 0.19                     # 바퀴 가운데 y
FA = V(0.31, 0, WR)           # 앞 굴대(x, z)
RA = V(-0.29, 0, WR)          # 뒤 굴대
WHEELS = [(FA, 1), (FA, -1), (RA, 1), (RA, -1)]   # wheel0..3
FLOOR = 0.125                 # 실내 바닥
CK0, CK1 = -0.285, 0.125      # 실내(타는 곳) x 범위
SEAT_HIP = V(-0.05, 0, 0.18)  # 운전하는 사람 엉덩이
HUB = V(0.072, 0, 0.285)       # 운전대 가운데
STEER_N = V(-math.sqrt(0.5), 0, math.sqrt(0.5))   # 운전대 기둥 방향(운전자 쪽 위)
P = 3.0                       # 몸통 단면 둥글기(초타원)

# 몸통 단면: (x, 바닥 z, 가장 넓은 z, 꼭대기 z, 반폭, 실내를 파냄)
ST = [
    (0.468, 0.122, 0.155, 0.185, 0.06, 0),
    (0.458, 0.098, 0.158, 0.218, 0.098, 0),
    (0.44, 0.08, 0.162, 0.245, 0.122, 0),
    (0.405, 0.072, 0.166, 0.266, 0.138, 0),
    (0.34, 0.07, 0.171, 0.284, 0.147, 0),
    (0.25, 0.07, 0.174, 0.296, 0.15, 0),
    (0.16, 0.07, 0.176, 0.302, 0.152, 0),
    (0.133, 0.07, 0.176, 0.302, 0.152, 0),
    (0.125, 0.07, 0.176, 0.3, 0.152, 1),
    (0.0, 0.07, 0.176, 0.3, 0.153, 1),
    (-0.15, 0.07, 0.176, 0.3, 0.153, 1),
    (-0.285, 0.07, 0.176, 0.3, 0.152, 1),
    (-0.293, 0.07, 0.176, 0.302, 0.152, 0),
    (-0.34, 0.07, 0.174, 0.298, 0.15, 0),
    (-0.40, 0.074, 0.17, 0.279, 0.143, 0),
    (-0.44, 0.083, 0.165, 0.25, 0.128, 0),
    (-0.462, 0.10, 0.16, 0.216, 0.102, 0),
    (-0.472, 0.122, 0.157, 0.185, 0.065, 0),
]

CAR_COATS = {   # 몸통, 몸통 그늘, 좌석, 좌석 그늘, 실내 벽
    'sky':    (lin(0x86c8ea), lin(0x5aa2c8), lin(0xf3e7cc), lin(0xd8c6a2), lin(0x9fd3ee)),
    'yellow': (lin(0xffe066), lin(0xe0b83c), lin(0x8a5236), lin(0x643824), lin(0xf3dc80)),
    'white':  (lin(0xf5f3ee), lin(0xd4d1c8), lin(0xd2463e), lin(0xa83430), lin(0xece8de)),
}

def stat(x):   # x에서의 몸통 단면(바닥, 넓은 곳, 꼭대기, 반폭)
    s = ST
    if x >= s[0][0]: return s[0][1:5]
    for a, b in zip(s, s[1:]):
        if b[0] <= x <= a[0]:
            t = (a[0] - x) / (a[0] - b[0]); return tuple(a[k] + (b[k] - a[k]) * t for k in range(1, 5))
    return s[-1][1:5]

def _se(u): return max(0.0, 1 - min(1.0, abs(u)) ** P) ** (1 / P)

def topz(x, y):   # 몸통 윗면 높이(파낸 곳은 무시)
    zb, zc, zt, hw = stat(x); return zc + (zt - zc) * _se(y / hw)

def sidey(x, z):   # 높이 z에서 몸통 옆면 y
    zb, zc, zt, hw = stat(x); h = (zt - zc) if z >= zc else (zc - zb); return hw * _se((z - zc) / h)

def tube(pts, r, col, sides=6, mat=BASE, **kw):
    return paint(loft(pts, r, sides=sides, wob=0, **kw), col, mat)

def rbox(x0, x1, y0, y1, z0, z1, b=0.012, tilt=0.0):   # 모서리를 깎은 상자, tilt = 위로 갈수록 x로 기움
    pts = []
    for bx, by, bz in ((b, b, 0), (b, 0, b), (0, b, b)):
        for x in (x0 + bx, x1 - bx):
            for y in (y0 + by, y1 - by):
                for z in (z0 + bz, z1 - bz):
                    pts.append(V(x + tilt * (z - z0) / (z1 - z0), y, z))
    return hull(pts)

def circ(c, r, n, y):   # xz 평면의 원(굴대 방향 y)
    return [V(c.x + math.cos(a) * r, y, c.z + math.sin(a) * r) for a in [k / n * 2 * math.pi for k in range(n)]]

# ── 몸통 ──
def _ring(s):
    x, zb, zc, zt, hw, cut = s
    hu, hl = zt - zc, zc - zb
    a = hw - 0.055
    tops = [hw, hw - 0.006, hw - 0.016, hw - 0.028, hw - 0.04, a, 0.45 * a, 0.0]
    tops = tops + [-t for t in reversed(tops[:-1])]
    pts = [V(x, y, FLOOR if (cut and abs(y) <= hw - 0.039) else zc + hu * _se(y / hw)) for y in tops]
    pts += [V(x, f * hw, zc - hl * _se(f)) for f in (-0.93, -0.7, -0.35, 0.0, 0.35, 0.7, 0.93)]
    return pts

def _body(C, CD, WALL):
    bm = S.bm
    rings = [[bm.verts.new(p) for p in _ring(s)] for s in ST]
    K = len(rings[0]); faces = []
    for r0, r1 in zip(rings, rings[1:]):
        for j in range(K): faces.append(bm.faces.new((r0[j], r0[(j + 1) % K], r1[(j + 1) % K], r1[j])))
    for r, dx in ((rings[0], 0.006), (rings[-1], -0.006)):
        c = sum((v.co for v in r), Vector()) / K; c.x += dx; cv = bm.verts.new(c)
        for j in range(K): faces.append(bm.faces.new((cv, r[(j + 1) % K], r[j])))
    bmesh_recalc(faces)
    def col(p, n):
        if CK0 - 0.012 < p.x < CK1 + 0.012 and abs(p.y) < 0.128 and p.z > 0.115:
            return jit(FLOORC if n.z > 0.6 else WALL, 0.05)
        return jit(CD if n.z < -0.5 else C, 0.05)
    paint(faces, col)

def bmesh_recalc(faces):
    import bmesh
    bmesh.ops.recalc_face_normals(S.bm, faces=faces)

def _fender(c, s, C, CD):
    RF = WR + 0.032
    pts = [V(c.x + math.cos(a) * RF, s * 0.185, c.z + math.sin(a) * RF) for a in [math.radians(-14 + 208 * k / 15) for k in range(16)]]
    paint(loft(pts, 0.024, sides=8, ell=(1.0, 1.7), wob=0, up=Vector((0, 1, 0))), shade(C, CD, k=0.05))

def wheel(name, c, s, C):
    cc = V(c.x, s * WY, c.z)
    part(name, loc=tuple(cc))
    paint(loft(circ(cc, WR - 0.025, 18, cc.y), 0.025, sides=8, ell=(1.0, 1.3), closed=True, wob=0, up=Vector((0, 1, 0))), shade(TIRE, TIRE_D, k=0.05))   # 타이어
    paint(cyl(cc + V(0, -0.026, 0), cc + V(0, 0.026, 0), 0.047, sides=14), solid(C, 0.04))                       # 휠(몸통 색)
    paint(loft(circ(cc, WR - 0.03, 18, cc.y + s * 0.03), 0.0075, sides=6, ell=(1.0, 0.45), closed=True, wob=0, up=Vector((0, 1, 0))), solid(WHITE, 0.03))   # 흰 띠 타이어
    paint(loft([cc + V(0, s * 0.024, 0), cc + V(0, s * 0.03, 0), cc + V(0, s * 0.036, 0), cc + V(0, s * 0.039, 0)], [0.026, 0.024, 0.016, 0.006], sides=10, wob=0), solid(CHROME, 0.04), METAL)   # 허브 캡
    for k in range(4):   # 볼트 — 돌아가는 게 보이게
        a = k / 4 * 2 * math.pi + 0.4
        paint(blob(cc + V(math.cos(a) * 0.036, s * 0.027, math.sin(a) * 0.036), (0.005, 0.004, 0.005), n=6, jitter=0), solid(CHROME_D), METAL)
    base()

def _car(coat):
    C, CD, SEAT, SEAT_D, WALL = CAR_COATS[coat]
    begin(601)
    _body(C, CD, WALL)
    for c in (FA, RA):
        for s in (-1, 1): _fender(c, s, C, CD)
    # 발판 — 앞뒤 흙받기를 잇는다
    for s in (-1, 1):
        paint(hull([V(x, s * y, z) for x in (-0.185, 0.205) for y in (0.14, 0.212) for z in (0.06, 0.074)]), shade(RUBBER, TIRE_D, k=0.05))
        tube([V(-0.18, s * 0.213, 0.067), V(0.2, s * 0.213, 0.067)], 0.004, solid(CHROME), sides=4, mat=METAL)
    # 옆 크롬 띠 · 문 손잡이
    for s in (-1, 1):
        tube([V(x, s * (sidey(x, 0.205) + 0.003), 0.205) for x in (-0.16, -0.05, 0.06, 0.17)], 0.0035, solid(CHROME), sides=4, mat=METAL)
        x = 0.06; tube([V(x, s * (sidey(x, 0.228) + 0.004), 0.228), V(x - 0.025, s * (sidey(x - 0.025, 0.228) + 0.004), 0.228)], 0.004, solid(CHROME), sides=4, mat=METAL)
    # 보닛 가운데 크롬 줄 · 앞 엠블럼 · 콧수염 그릴
    tube([V(x, 0, topz(x, 0) + 0.002) for x in (0.17, 0.25, 0.33, 0.40, 0.44)], 0.004, solid(CHROME), sides=4, mat=METAL)
    paint(loft([V(0.452, 0, 0.19), V(0.466, 0, 0.19)], [0.016, 0.014], sides=10, wob=0, up=Vector((0, 0, 1))), solid(CHROME), METAL)
    paint(cyl(V(0.466, 0, 0.19), V(0.469, 0, 0.19), 0.01, sides=10), solid(lin(0xd84040)))
    tube(crs([V(0.448, -0.075, 0.148), V(0.462, -0.035, 0.142), V(0.47, 0, 0.152), V(0.462, 0.035, 0.142), V(0.448, 0.075, 0.148)], 9), 0.0055, solid(CHROME), sides=5, mat=METAL)
    # 범퍼 — 앞뒤, 받침
    for xs, sg in ((0.476, 1), (-0.48, -1)):
        tube(crs([V(xs - sg * 0.05, -0.185, 0.1), V(xs - sg * 0.008, -0.13, 0.1), V(xs, 0, 0.1), V(xs - sg * 0.008, 0.13, 0.1), V(xs - sg * 0.05, 0.185, 0.1)], 11), 0.014, shade(CHROME, CHROME_D), sides=6, mat=METAL, ell=(1.0, 1.25))
        for y in (-0.09, 0.09): tube([V(xs - sg * 0.05, y, 0.1), V(xs, y, 0.1)], 0.006, solid(CHROME_D), sides=4, mat=METAL)
    # 뒤 번호판 · 배기관 · 엔진 덮개 통풍구
    paint(hull([V(x, y, z) for x in (-0.477, -0.468) for y in (-0.042, 0.042) for z in (0.12, 0.152)]), solid(lin(0xf6f0dc)))
    for k in range(3): paint(hull([V(-0.479, -0.03 + k * 0.024 + dy, z) for dy in (0, 0.014) for z in (0.13, 0.142)] + [V(-0.477, -0.03 + k * 0.024 + dy, z) for dy in (0, 0.014) for z in (0.13, 0.142)]), solid(lin(0x3a5a8a)))
    tube([V(-0.43, -0.09, 0.072), V(-0.5, -0.09, 0.072)], 0.009, solid(CHROME_D), sides=6, mat=METAL)
    for k in range(4):
        x = -0.36 - k * 0.018
        paint(hull([V(x + dx, y, topz(x + dx, y) + dz) for dx in (0, 0.008) for y in (-0.06, -0.02, 0.02, 0.06) for dz in (-0.004, 0.004)]), solid(CHROME_D), METAL)
    # 눈 같은 앞등(앞 흙받기 위) · 뒤 등
    for s in (-1, 1):
        a = math.radians(48); R = WR + 0.032 + 0.018
        p = V(FA.x + math.cos(a) * R, s * 0.185, FA.z + math.sin(a) * R)
        paint(loft([p + V(-0.03, 0, -0.004), p + V(0.0, 0, 0), p + V(0.022, 0, 0.002)], [0.022, 0.03, 0.031], sides=12, wob=0), shade(C, CD, k=0.04))
        paint(loft([p + V(0.02, 0, 0.002), p + V(0.028, 0, 0.002)], [0.033, 0.031], sides=12, wob=0), solid(CHROME), METAL)
        paint(loft([p + V(0.026, 0, 0.002), p + V(0.031, 0, 0.002)], [0.026, 0.018], sides=12, wob=0), solid(LAMP), GLOW)
        a = math.radians(128); q = V(RA.x + math.cos(a) * R, s * 0.185, RA.z + math.sin(a) * R)
        paint(loft([q + V(0.02, 0, 0), q + V(-0.012, 0, 0.002)], [0.016, 0.02], sides=10, wob=0), shade(C, CD, k=0.04))
        paint(loft([q + V(-0.011, 0, 0.002), q + V(-0.018, 0, 0.002)], [0.021, 0.015], sides=10, wob=0), solid(TAIL), GLOW)
    # 앞유리 — 크롬 틀과 옅은 하늘빛 판
    xb, xt, yw, zt = 0.152, 0.12, 0.138, 0.392
    for s in (-1, 1): tube([V(xb, s * yw, topz(xb, yw) - 0.012), V(xt, s * yw, zt)], 0.0065, solid(CHROME), sides=5, mat=METAL)
    tube(crs([V(xt, -yw, zt), V(xt - 0.004, 0, zt + 0.008), V(xt, yw, zt)], 7), 0.0065, solid(CHROME), sides=5, mat=METAL)
    gl = []
    for y in [k / 6 * 0.26 - 0.13 for k in range(7)]:
        for dx in (0, -0.005): gl.append(V(xb - 0.002 + dx, y, topz(xb, y) - 0.006))
    for y in (-0.13, 0.13):
        for dx in (0, -0.005): gl.append(V(xt + 0.001 + dx, y, zt - 0.004))
    for dx in (0, -0.005): gl.append(V(xt - 0.003 + dx, 0, zt + 0.004))
    paint(hull(gl), solid(GLASS, 0.03))
    paint(hull([V(xt - 0.006 + dx, y, z) for dx in (0, -0.006) for y in (-0.03, 0.03) for z in (zt - 0.026, zt - 0.006)]), solid(CHROME_D), METAL)   # 거울
    # 계기판 · 운전대 기둥
    paint(rbox(0.1, 0.13, -0.13, 0.13, 0.2, 0.278, b=0.012), shade(C, CD, k=0.04))
    for y in (-0.065, 0.065):
        paint(cyl(V(0.1, y, 0.248), V(0.094, y, 0.248), 0.016, sides=10), solid(CHROME), METAL)
        paint(cyl(V(0.095, y, 0.248), V(0.093, y, 0.248), 0.012, sides=10), solid(LAMP), GLOW)
    tube([HUB - STEER_N * 0.075, HUB - STEER_N * 0.01], 0.0065, solid(lin(0x2e2e32)), sides=6)
    # 좌석 — 앞 벤치(운전), 뒤 벤치
    sf = shade(SEAT, SEAT_D, k=0.05)
    paint(rbox(-0.105, 0.035, -0.126, 0.126, FLOOR - 0.005, 0.176, b=0.016), sf)
    paint(rbox(-0.13, -0.09, -0.126, 0.126, 0.165, 0.305, b=0.016, tilt=-0.03), sf)
    paint(rbox(-0.268, -0.155, -0.126, 0.126, FLOOR - 0.005, 0.172, b=0.016), sf)
    paint(rbox(-0.292, -0.258, -0.126, 0.126, 0.16, 0.292, b=0.016, tilt=-0.012), sf)
    for y in (-0.042, 0.042):   # 등받이 누빔 줄
        paint(hull([V(-0.0905 - 0.03 * t + dx, y + dy, 0.175 + 0.12 * t) for t in (0, 1) for dx in (0, 0.003) for dy in (-0.003, 0.003)]), solid(SEAT_D))
        paint(hull([V(-0.2585 - 0.012 * t + dx, y + dy, 0.175 + 0.105 * t) for t in (0, 1) for dx in (0, 0.003) for dy in (-0.003, 0.003)]), solid(SEAT_D))
    # 바퀴
    for i, (c, s) in enumerate(WHEELS): wheel('wheel%d' % i, c, s, C)
    # 운전대 — 제 축(로컬 z)으로 빚어 기둥 방향으로 눕힌다
    part('steer', loc=tuple(HUB), rot=(0, -math.pi / 4, 0), local=True)
    paint(loft([V(math.cos(a) * 0.05, math.sin(a) * 0.05, 0) for a in [k / 16 * 2 * math.pi for k in range(16)]], 0.0065, sides=5, closed=True, wob=0), solid(lin(0xf4ecd8), 0.04))
    for k in range(3):
        a = k / 3 * 2 * math.pi - math.pi / 2
        tube([V(0, 0, 0.004), V(math.cos(a) * 0.046, math.sin(a) * 0.046, 0)], 0.0035, solid(CHROME), sides=4, mat=METAL)
    paint(loft([V(0, 0, -0.008), V(0, 0, 0.006), V(0, 0, 0.012)], [0.014, 0.014, 0.008], sides=10, wob=0), solid(CHROME), METAL)
    paint(cyl(V(0, 0, 0.011), V(0, 0, 0.014), 0.008, sides=10), solid(lin(0xd84040)))
    base()
    finish('mt_car_' + coat, OUT, center=False)

def mt_car_sky(): _car('sky')
def mt_car_yellow(): _car('yellow')
def mt_car_white(): _car('white')

# ── 자동차 장식 ──
BROWN, BROWN_D = lin(0x9a5e36), lin(0x6e4022)
STRAP = lin(0x4a2e1e)

def _roofrack():   # 지붕 짐칸 — 뒤 덮개 위 크롬 짐받이와 가방 둘·모자 상자 (몸통)
    x0, x1, yr, zr = -0.31, -0.445, 0.105, 0.31
    for s in (-1, 1):
        tube([V(x0, s * yr, zr), V(x1, s * yr, zr)], 0.005, solid(CHROME), sides=5, mat=METAL)
        tube([V(x1, s * yr, zr), V(x1 - 0.004, s * yr, zr + 0.024)], 0.005, solid(CHROME), sides=5, mat=METAL)   # 뒤 턱
        for x in (x0 + 0.01, x1 + 0.012):
            tube([V(x, s * yr, zr), V(x, s * yr, topz(x, yr) - 0.006)], 0.0045, solid(CHROME_D), sides=4, mat=METAL)
            paint(hull([V(x + dx, s * yr + dy, topz(x, yr) - 0.004 + dz) for dx in (-0.01, 0.01) for dy in (-0.008, 0.008) for dz in (-0.004, 0.003)]), solid(RUBBER))
    for x in (x0, -0.355, -0.4, x1): tube([V(x, -yr, zr), V(x, yr, zr)], 0.004, solid(CHROME), sides=4, mat=METAL)
    tube([V(x1 - 0.004, -yr, zr + 0.024), V(x1 - 0.004, yr, zr + 0.024)], 0.005, solid(CHROME), sides=5, mat=METAL)
    # 큰 가방(갈색 가죽) — 띠 둘, 손잡이, 금빛 모서리
    a0, a1, b0, b1, c0, c1 = -0.322, -0.432, -0.1, 0.022, zr + 0.005, zr + 0.056
    paint(rbox(a1, a0, b0, b1, c0, c1, b=0.008), shade(BROWN, BROWN_D, k=0.06))
    for x in (-0.35, -0.405):
        paint(hull([V(x + dx, y, z) for dx in (0, 0.01) for y in (b0 - 0.002, b1 + 0.002) for z in (c0 - 0.002, c1 + 0.002)]), solid(STRAP))
    tube(crs([V(-0.395, b1 + 0.002, c1 - 0.012), V(-0.377, b1 + 0.014, c1 - 0.01), V(-0.36, b1 + 0.002, c1 - 0.012)], 5), 0.004, solid(STRAP), sides=4)
    for x in (a1 + 0.004, a0 - 0.004):
        for y in (b0 + 0.004, b1 - 0.004): paint(blob(V(x, y, c1 - 0.004), (0.006, 0.006, 0.006), n=6, jitter=0), solid(GOLD), METAL)
    # 작은 가방(크림·청록 띠) 위에
    d0, d1, e0, e1, f0, f1 = -0.338, -0.418, -0.085, 0.005, c1, c1 + 0.036
    paint(rbox(d1, d0, e0, e1, f0, f1, b=0.007), shade(lin(0xf1e4c4), lin(0xcdbb94), k=0.05))
    paint(hull([V(x, y, z) for x in (d1 - 0.002, d0 + 0.002) for y in (-0.047, -0.033) for z in (f0, f1 + 0.002)]), solid(lin(0x2f9a94)))
    tube(crs([V(-0.39, -0.04, f1), V(-0.378, -0.04, f1 + 0.012), V(-0.366, -0.04, f1)], 5), 0.0035, solid(STRAP), sides=4)
    # 모자 상자 — 분홍·흰 줄무늬 둥근 상자
    hc = V(-0.375, 0.062, zr + 0.004)
    for k in range(4):
        paint(cyl(hc + V(0, 0, k * 0.011), hc + V(0, 0, (k + 1) * 0.011), 0.04, sides=14), solid(lin(0xf3a2bb) if k % 2 == 0 else WHITE, 0.03))
    paint(loft([hc + V(0, 0, 0.043), hc + V(0, 0, 0.052), hc + V(0, 0, 0.055)], [0.043, 0.043, 0.03], sides=14, wob=0), solid(lin(0xe57a9a), 0.03))
    paint(blob(hc + V(0, 0, 0.06), (0.01, 0.018, 0.006), n=8, jitter=0.1), solid(WHITE))
    # 묶는 끈 — 가방을 짐받이에
    for x in (-0.335, -0.42):
        tube([V(x, -yr, zr), V(x, b0 - 0.003, c1 + 0.002), V(x, b1 + 0.003, c1 + 0.002)], 0.003, solid(STRAP), sides=3)

def _weddingflowers():   # 혼인 잔치 차 — 보닛 가운데 꽃다발, 네 귀퉁이로 뻗은 흰 리본, 앞유리 위 꽃줄, 뒤 리본 (몸통)
    PINK, ROSE, CREAM = lin(0xf6b4c8), lin(0xe57a9a), lin(0xfff6ea)
    def flower(c, r, col):
        paint(blob(c, (r, r, r * 0.75), n=8, jitter=0.2), solid(col, 0.05))
        paint(blob(c + V(0, 0, r * 0.55), (r * 0.45, r * 0.45, r * 0.3), n=6, jitter=0.1), solid(tuple(v * 0.82 for v in col)))
    # 꽃다발
    bc = V(0.3, 0, topz(0.3, 0))
    paint(blob(bc + V(0, 0, 0.012), (0.072, 0.06, 0.018), n=12, jitter=0.15), solid(LEAF, 0.1))
    spots = [(0, 0, 0.04, ROSE)] + [(math.cos(a) * 0.038, math.sin(a) * 0.034, 0.026, [WHITE, PINK][k % 2]) for k, a in enumerate([k / 7 * 2 * math.pi for k in range(7)])]
    for dx, dy, dz, col in spots: flower(bc + V(dx, dy, dz), 0.022 if dz > 0.03 else 0.019, col)
    for k in range(6):   # 안개꽃
        a = k / 6 * 2 * math.pi + 0.3
        paint(blob(bc + V(math.cos(a) * 0.062, math.sin(a) * 0.054, 0.02), (0.007, 0.006, 0.005), n=5, jitter=0.2), solid(CREAM))
    # 리본 — 꽃다발에서 네 귀퉁이로, 보닛 면을 따라
    for ex, ey in ((0.155, 0.13), (0.155, -0.13), (0.44, 0.105), (0.44, -0.105)):
        path = []
        for k in range(7):
            t = k / 6; x = bc.x + (ex - bc.x) * t; y = ey * t * (0.35 + 0.65 * t) if ex > bc.x else ey * t
            path.append(V(x, y, topz(x, y) + 0.004))
        path[0] = path[0] + V(0, 0, 0.012)
        paint(loft(path, 0.009, sides=4, ell=(1.0, 0.22), wob=0), solid(WHITE, 0.03))
        e = path[-1] + V(0, 0, 0.004)   # 귀퉁이 나비 리본
        for sg in (-1, 1):
            paint(hull([e, e + V(0.012, sg * 0.016, 0.006), e + V(-0.012, sg * 0.016, 0.006), e + V(0.008, sg * 0.016, -0.002), e + V(-0.008, sg * 0.016, -0.002)]), solid(PINK, 0.04))
        paint(blob(e + V(0, 0, 0.002), (0.005, 0.005, 0.005), n=6, jitter=0), solid(ROSE))
    # 앞유리 위 꽃줄
    xt, zt = 0.12, 0.392
    for k in range(9):
        y = -0.12 + k * 0.03; z = zt + 0.008 * (1 - (y / 0.138) ** 2) + 0.004
        paint(blob(V(xt + 0.004, y, z - 0.006), (0.012, 0.012, 0.007), n=6, jitter=0.2), solid(LEAF, 0.1))
        flower(V(xt + 0.006, y, z + 0.004), 0.011, [WHITE, PINK, CREAM][k % 3])
    # 뒤 — 큰 나비 리본과 땅에 끌리는 꼬리 둘
    bk = V(-0.481, 0, 0.178)
    for sg in (-1, 1):
        paint(hull([bk, bk + V(-0.004, sg * 0.04, 0.022), bk + V(-0.004, sg * 0.042, -0.014), bk + V(-0.012, sg * 0.03, 0.004)]), solid(WHITE, 0.03))
    paint(blob(bk + V(-0.004, 0, 0.002), (0.008, 0.009, 0.009), n=6, jitter=0), solid(PINK))
    for sg in (-1, 1):
        path = crs([bk + V(-0.005, sg * 0.006, -0.004), V(-0.495, sg * 0.03, 0.118), V(-0.53, sg * 0.05, 0.04), V(-0.58, sg * 0.065, 0.006), V(-0.63, sg * 0.06, 0.004)], 10)
        paint(loft(path, 0.012, sides=4, ell=(1.0, 0.22), wob=0, up=Vector((0, 0, 1))), solid(PINK if sg > 0 else ROSE, 0.03))

def _wheelcaps():   # 반짝이는 금빛 휠 캡 — cap0~3, 바퀴와 같은 굴대 중심 (같은 번호의 wheelN과 함께 돈다)
    for i, (c, s) in enumerate(WHEELS):
        cc = V(c.x, s * WY, c.z)
        part('cap%d' % i, loc=tuple(cc))
        paint(loft([cc + V(0, s * 0.026, 0), cc + V(0, s * 0.032, 0), cc + V(0, s * 0.039, 0), cc + V(0, s * 0.044, 0)], [0.05, 0.049, 0.036, 0.018], sides=16, wob=0), shade(GOLD, GOLD_D, k=0.04), METAL)
        for k in range(8):   # 바람개비 날
            a = k / 8 * 2 * math.pi
            d = V(math.cos(a), 0, math.sin(a)); t = V(-math.sin(a), 0, math.cos(a))
            p0 = cc + d * 0.018 + V(0, s * 0.043, 0); p1 = cc + d * 0.045 + V(0, s * 0.033, 0)
            paint(hull([p0, p1, p0 + t * 0.006, p1 + t * 0.012, p0 + V(0, s * 0.004, 0), p1 + t * 0.006 + V(0, s * 0.004, 0)]), solid(GOLD_D, 0.04), METAL)
        paint(blob(cc + V(0, s * 0.046, 0), (0.011, 0.006, 0.011), n=8, jitter=0), solid(lin(0xfff2d0)), GLOW)
    base()

def _picnic():   # 뒷좌석 소풍 — 등나무 바구니(포도·바게트)와 빨간 체크 담요 (몸통)
    REED, REED_D = lin(0xc9a868), lin(0x9a7c48)
    # 담요 — 왼쪽 절반, 방석에서 등받이 위로 걸쳐
    path = [V(-0.148, 0, 0.14), V(-0.15, 0, 0.18), V(-0.2, 0, 0.181), V(-0.252, 0, 0.181), V(-0.255, 0, 0.215), V(-0.262, 0, 0.255), V(-0.268, 0, 0.296), V(-0.295, 0, 0.297)]
    ys = [0.0, 0.03, 0.06, 0.09, 0.12]
    for i, (a, b) in enumerate(zip(path, path[1:])):
        for j, (y0, y1) in enumerate(zip(ys, ys[1:])):
            pts = [V(p.x, y, p.z + dz) for p in (a, b) for y in (y0, y1) for dz in (0, 0.005)]
            paint(hull(pts), solid(lin(0xd8403a) if (i + j) % 2 == 0 else WHITE, 0.04))
    for k, (x, y) in enumerate(((-0.18, 0.05), (-0.21, 0.095), (-0.195, 0.025))):   # 사과
        paint(blob(V(x, y, 0.198), (0.014, 0.014, 0.013), n=8, jitter=0.08), solid(lin(0xd03a30) if k != 2 else lin(0x9ccc4a), 0.06))
        tube([V(x, y, 0.21), V(x + 0.002, y, 0.218)], 0.002, solid(lin(0x5a3a20)), sides=3)
    # 바구니 — 오른쪽 절반
    x0, x1, y0, y1, z0, z1 = -0.25, -0.168, -0.118, -0.018, 0.17, 0.222
    paint(hull([V(x, y, z0) for x in (x0 + 0.006, x1 - 0.006) for y in (y0 + 0.006, y1 - 0.006)] + [V(x, y, z1) for x in (x0, x1) for y in (y0, y1)]), shade(REED, REED_D, k=0.1))
    for z in (0.185, 0.2, 0.215):
        e = (z - z0) / (z1 - z0) * 0.006
        loop = [V(x0 + 0.006 - e, y0 + 0.006 - e, z), V(x1 - 0.006 + e, y0 + 0.006 - e, z), V(x1 - 0.006 + e, y1 - 0.006 + e, z), V(x0 + 0.006 - e, y1 - 0.006 + e, z)]
        paint(loft(loop, 0.003, sides=3, closed=True, wob=0), solid(REED_D))
    ym = (y0 + y1) / 2
    paint(hull([V(x, y, z) for x in (x0, x1) for y in (y0, ym - 0.004) for z in (z1, z1 + 0.006)] + [V(x, ym - 0.004, z1 + 0.014) for x in (x0, x1)]), shade(REED, REED_D, k=0.08))   # 뚜껑 반쪽(닫힘)
    tube(crs([V(x0 + 0.01, ym, z1), V((x0 + x1) / 2, ym, z1 + 0.06), V(x1 - 0.01, ym, z1)], 9), 0.004, solid(REED_D), sides=4)   # 손잡이
    paint(hull([V(x, y, z) for x in (x0 + 0.004, x1 - 0.004) for y in (ym, y1 + 0.004) for z in (z1 - 0.004, z1 + 0.006)]), solid(lin(0xd8403a), 0.05))   # 열린 쪽 체크 천
    for k in range(7):   # 포도송이
        r = [(0, 0, 0.02), (0.008, 0.008, 0.02), (-0.008, 0.008, 0.02), (0, -0.006, 0.02), (0.004, 0.002, 0.03), (-0.004, 0.002, 0.03), (0, 0.004, 0.012)][k]
        paint(blob(V(-0.19 + r[0], ym + 0.03 + r[1], z1 + r[2] - 0.004), (0.0075, 0.0075, 0.0075), n=6, jitter=0.05), solid(lin(0x6a3a8a), 0.08))
    paint(blob(V(-0.19, ym + 0.032, z1 + 0.034), (0.012, 0.007, 0.004), n=6, jitter=0.1), solid(LEAF))
    paint(loft([V(-0.235, ym + 0.02, z1 - 0.01), V(-0.215, ym + 0.025, z1 + 0.03), V(-0.2, ym + 0.028, z1 + 0.06)], [0.009, 0.01, 0.007], sides=6, wob=0.05), shade(lin(0xe0a85a), lin(0xb07a38), k=0.06))   # 바게트

def gd_car_roofrack(): begin(611); _roofrack(); finish('gd_car_roofrack', OUT, center=False)
def gd_car_weddingflowers(): begin(612); _weddingflowers(); finish('gd_car_weddingflowers', OUT, center=False)
def gd_car_wheelcaps(): begin(613); _wheelcaps(); finish('gd_car_wheelcaps', OUT, center=False)
def gd_car_picnic(): begin(614); _picnic(); finish('gd_car_picnic', OUT, center=False)

VIEWS = {'a': (1.0, -1.25, 0.75), 's': (0.0, -1.0, 0.12), 'b': (-1.0, 0.9, 0.6), 't': (0.25, -0.2, 1.0)}

def pv_car():   # 확인용: 하늘색 차 + 장식 넷을 한 모델로
    _orig = lp.finish
    lp.finish = lambda *a, **k: None
    globals()['finish'] = lp.finish
    try:
        _car('sky')
    finally:
        lp.finish = _orig; globals()['finish'] = _orig
    base(); random.seed(620)
    _roofrack(); _weddingflowers(); _picnic(); _wheelcaps()
    finish('pv_car', OUT, center=True, views=VIEWS, lens=80)

def _pv_coat(coat):
    _orig = lp.finish
    lp.finish = lambda *a, **k: None
    globals()['finish'] = lp.finish
    try:
        _car(coat)
    finally:
        lp.finish = _orig; globals()['finish'] = _orig
    finish('pv_car_' + coat, OUT, center=True, views={'a': (1.0, -1.25, 0.75), 'f': (1.0, 0.35, 0.3)}, lens=80)

def pv_car_sky(): _pv_coat('sky')
def pv_car_yellow(): _pv_coat('yellow')
def pv_car_white(): _pv_coat('white')

ALL = [mt_car_sky, mt_car_yellow, mt_car_white, gd_car_roofrack, gd_car_weddingflowers, gd_car_wheelcaps, gd_car_picnic, pv_car]
for f in ALL + [pv_car_sky, pv_car_yellow, pv_car_white]:
    if (not ONLY and f in ALL) or f.__name__ in ONLY: f()
print('DONE')
