# 쇠사슬에 결박된 큰 붉은 용 — 로우폴리(각진 면) 양식
# 계 12:3 머리 일곱·뿔 열 · 20:1~3 큰 쇠사슬·무저갱·인봉
# 실행: blender -b -P dragon_lp.py -- <출력 폴더>
import bpy, bmesh, math, random, sys, os
from mathutils import Vector, Quaternion, Matrix

OUT = os.path.abspath(sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '.')
random.seed(12)
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def lin(c):
    f = lambda v: v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return tuple(f(((c >> s) & 255) / 255) for s in (16, 8, 0))

RED, DARK, BELLY, SPIKE = lin(0x9c1d16), lin(0x4a0b08), lin(0xc07a48), lin(0x3a0907)
BONE, BONE_TIP, IRON, STONE_C, GOLD = lin(0xeadcbc), lin(0x7a6650), lin(0x5f636b), lin(0x7d766c), lin(0xd4a83e)

bm = bmesh.new()
CL = bm.loops.layers.float_color.new('Col')
PARTS = [{'name': 'base', 'bm': bm, 'loc': Vector(), 'rot': None, 'local': False}]

def part(name, loc):
    """이제부터 빚는 것은 따로 움직이는 부분 — 축은 loc"""
    global bm, CL
    bm = bmesh.new(); CL = bm.loops.layers.float_color.new('Col')
    PARTS.append({'name': name, 'bm': bm, 'loc': Vector(loc), 'rot': None, 'local': False})

def body():   # 다시 몸으로
    global bm, CL
    bm = PARTS[0]['bm']; CL = bm.loops.layers.float_color['Col']

def paint(faces, fn, mat=0):
    for f in faces:
        f.normal_update(); f.material_index = mat
        c = fn(f.calc_center_median(), f.normal)
        for l in f.loops: l[CL] = (c[0], c[1], c[2], 1.0)

def jit(c, k=0.12):
    s = 1 - k / 2 + random.random() * k; return tuple(v * s for v in c)

def hide(c, n, base=RED):
    # 등은 검붉게, 배는 밝게, 면마다 조금씩 다른 결
    c = base
    if n.z > 0.55: c = tuple(a + (b - a) * 0.45 for a, b in zip(c, DARK))
    elif n.z < -0.5: c = BELLY
    return jit(c, 0.18)

def solid(c, k=0.1):
    return lambda p, n: jit(c, k)

# ── 도구: 관(고리를 이어 만든 각진 관) · 볼록 덩어리 · 곡선 ──
def crs(pts, n):
    """Catmull-Rom — 점들을 매끈하게 잇는 n개의 점"""
    P = [Vector(p) for p in pts]; P = [P[0] * 2 - P[1]] + P + [P[-1] * 2 - P[-2]]
    out = []
    for k in range(n):
        t = k / (n - 1) * (len(P) - 3); i = min(int(t), len(P) - 4); u = t - i
        p0, p1, p2, p3 = P[i], P[i + 1], P[i + 2], P[i + 3]
        out.append(0.5 * ((2 * p1) + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u ** 3))
    return out

def interp(vals, u):
    f = u * (len(vals) - 1); i = min(int(f), len(vals) - 2); t = f - i
    return vals[i] + (vals[i + 1] - vals[i]) * t

def loft(pts, radii, sides=6, ell=(1.0, 1.0), cap0=True, cap1=True, wob=0.06, twist=0.0):
    """점마다 고리를 두고 이웃 고리를 면으로 잇는다 — 비틀림 없는 틀(평행 이동)"""
    n = len(pts); T = [(pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized() for i in range(n)]
    up = Vector((0, 0, 1)); N = (up - T[0] * up.dot(T[0]))
    if N.length < 1e-4: N = Vector((1, 0, 0))
    N.normalize(); rings = []
    for i in range(n):
        if i: N = (T[i - 1].rotation_difference(T[i]) @ N); N = (N - T[i] * N.dot(T[i])).normalized()
        B = T[i].cross(N); r = radii[i]; ring = []
        for j in range(sides):
            a = j / sides * 2 * math.pi + math.pi / 2 + twist
            rr = r * (1 + (random.random() - 0.5) * wob)
            ring.append(bm.verts.new(pts[i] + B * math.cos(a) * rr * ell[0] + N * math.sin(a) * rr * ell[1]))
        rings.append(ring)
    faces = []
    for i in range(n - 1):
        for j in range(sides):
            a, b = rings[i][j], rings[i][(j + 1) % sides]; c, d = rings[i + 1][(j + 1) % sides], rings[i + 1][j]
            faces.append(bm.faces.new((a, b, c, d)))
    if cap0: faces.append(bm.faces.new(list(reversed(rings[0]))))
    if cap1: faces.append(bm.faces.new(rings[-1]))
    bmesh.ops.recalc_face_normals(bm, faces=faces)
    return faces

def hull(points):
    vs = [bm.verts.new(Vector(p)) for p in points]
    r = bmesh.ops.convex_hull(bm, input=vs)
    junk = [v for v in r['geom_interior'] + r['geom_unused'] if isinstance(v, bmesh.types.BMVert)]
    if junk: bmesh.ops.delete(bm, geom=junk, context='VERTS')
    return [g for g in r['geom'] if isinstance(g, bmesh.types.BMFace)]

def cone(base, tip, r, sides=4):
    ax = tip - base; side = ax.orthogonal().normalized(); side2 = ax.normalized().cross(side)
    pts = [base + (side * math.cos(a) + side2 * math.sin(a)) * r for a in [k / sides * 2 * math.pi for k in range(sides)]] + [tip]
    return hull(pts)

def mirror(pts):
    out = list(pts)
    for p in pts:
        if abs(p[1]) > 1e-6: out.append((p[0], -p[1], p[2]))
    return out

# ── 몸통 — 꼬리를 말고 땅에 엎드렸다. 어깨·골반이 불룩 ──
SP = [(-2.05, 0.95, 0.05), (-2.0, 0.55, 0.06), (-1.75, 0.18, 0.08), (-1.38, -0.06, 0.11), (-0.98, -0.12, 0.17),
      (-0.58, -0.05, 0.25), (-0.18, 0.02, 0.29), (0.2, 0.02, 0.31), (0.5, 0.0, 0.3)]
SR = [0.012, 0.03, 0.055, 0.09, 0.15, 0.235, 0.215, 0.265, 0.2]
spine = crs(SP, 34); srad = [interp(SR, k / 33) for k in range(34)]
paint(loft(spine, srad, sides=8, ell=(1.08, 0.86), wob=0.08), hide)

def spine_at(u):
    f = u * (len(spine) - 1); i = min(int(f), len(spine) - 2); t = f - i
    return spine[i].lerp(spine[i + 1], t), srad[i] + (srad[i + 1] - srad[i]) * t, (spine[i + 1] - spine[i]).normalized()

# 꼬리 끝 — 납작한 창날
p0, _, _ = spine_at(0.0); tg = (spine[0] - spine[1]).normalized(); sd = Vector((-tg.y, tg.x, 0))
paint(hull([p0 - tg * 0.02 + sd * 0.05, p0 - tg * 0.02 - sd * 0.05, p0 + tg * 0.14, p0 + Vector((0, 0, 0.018)), p0 - Vector((0, 0, 0.012)) + tg * 0.03]), solid(SPIKE))

# 등판 가시 — 들쭉날쭉한 판, 어깨에서 가장 크다
for k in range(15):
    u = 0.16 + k * 0.055
    p, r, tg = spine_at(u); sd = Vector((-tg.y, tg.x, 0)).normalized()
    h = (0.05 + 0.13 * math.exp(-((u - 0.74) / 0.22) ** 2)) * (0.8 + random.random() * 0.4)
    base = p + Vector((0, 0, r * 0.8)); L = max(0.035, r * 0.5)
    paint(hull([base - tg * L, base + tg * L * 0.6, base - tg * L * 0.7 + Vector((0, 0, h)), base + sd * 0.014, base - sd * 0.014]), solid(SPIKE, 0.2))

# ── 다리 넷 — 웅크려 땅을 짚었다, 발가락 셋에 발톱 ──
def foot(F, fwd, s):
    sd = Vector((-fwd.y, fwd.x, 0))
    pts = [F - fwd * 0.06 + sd * 0.035, F - fwd * 0.06 - sd * 0.035, F - fwd * 0.04 + Vector((0, 0, 0.05)),
           F + fwd * 0.03 + Vector((0, 0, 0.035)), F + fwd * 0.07 + sd * 0.05, F + fwd * 0.07 - sd * 0.05, F + fwd * 0.08]
    paint(hull([p + Vector((0, 0, 0.004)) for p in pts]), hide)
    for k in (-1, 0, 1):
        b = F + fwd * 0.075 + sd * (k * 0.036) + Vector((0, 0, 0.012))
        paint(cone(b, b + fwd * 0.045 + sd * k * 0.012 - Vector((0, 0, 0.012)), 0.011, 4), solid(BONE))

for s in (-1, 1):
    fl = [Vector((0.3, 0.18 * s, 0.27)), Vector((0.36, 0.42 * s, 0.2)), Vector((0.5, 0.45 * s, 0.07)), Vector((0.56, 0.46 * s, 0.03))]
    paint(loft(crs(fl, 8), [0.12, 0.1, 0.085, 0.075, 0.065, 0.058, 0.05, 0.045], sides=6), hide)
    foot(Vector((0.6, 0.47 * s, 0.0)), Vector((1, 0.12 * s, 0)).normalized(), s)
    hl = [Vector((-0.52, 0.17 * s, 0.25)), Vector((-0.32, 0.46 * s, 0.24)), Vector((-0.56, 0.49 * s, 0.09)), Vector((-0.5, 0.5 * s, 0.03))]
    paint(loft(crs(hl, 8), [0.15, 0.14, 0.12, 0.09, 0.065, 0.058, 0.05, 0.046], sides=6), hide)
    foot(Vector((-0.45, 0.51 * s, 0.0)), Vector((1, 0.1 * s, 0)).normalized(), s)

# ── 일곱 머리 (12:3) — 목마다 굽이·길이·높이가 다르고, 둘은 지쳐 반쯤 들었다 ──
CH = Vector((0.5, 0.0, 0.3))
#        각도°  길이  머리높이 옆굽이 누움  고개돌림 뿔
HEADS = [(-64, 0.86, 0.06, 0.10, 0.45, 0.25, 1),
         (-40, 1.02, 0.30, -0.06, 0.05, -0.1, 2),
         (-17, 0.8, 0.06, 0.07, -0.2, 0.2, 1),
         (3, 1.08, 0.07, -0.04, 0.12, -0.15, 2),
         (22, 0.84, 0.25, 0.08, -0.1, 0.12, 1),
         (42, 0.98, 0.06, -0.09, 0.3, -0.25, 2),
         (63, 0.8, 0.07, 0.05, -0.4, 0.35, 1)]
assert sum(h[6] for h in HEADS) == 10    # 뿔 열

HEAD = mirror([(0.0, 0.0, 0.07), (-0.02, 0.06, 0.02), (0.0, 0.045, -0.05), (0.1, 0.07, 0.065), (0.12, 0.0, 0.08),
               (0.13, 0.085, -0.005), (0.22, 0.05, 0.05), (0.31, 0.0, 0.04), (0.31, 0.045, 0.005), (0.37, 0.0, 0.012),
               (0.36, 0.025, -0.012)])
JAW = mirror([(0.02, 0.05, -0.03), (0.06, 0.055, -0.075), (0.12, 0.0, -0.09), (0.3, 0.032, -0.045), (0.35, 0.0, -0.045),
              (0.3, 0.035, -0.02), (0.08, 0.06, -0.02)])

def head(i, M, horns):
    S = Matrix.Scale(1.3, 4)
    T = lambda p: M @ S @ Vector(p)
    paint(hull([T(p) for p in HEAD]), hide)
    paint(hull([T(p) for p in JAW]), lambda p, n: hide(p, n, lin(0xa8402a)))
    for s in (-1, 1):
        # 감은 눈 — 눈두덩 아래 가는 틈
        paint(hull([T((0.09, 0.074 * s, 0.04)), T((0.15, 0.07 * s, 0.035)), T((0.12, 0.078 * s, 0.047)), T((0.12, 0.066 * s, 0.03))]), solid(lin(0x1c0404)))
        paint(hull([T((0.345, 0.02 * s, 0.022)), T((0.36, 0.015 * s, 0.015)), T((0.35, 0.028 * s, 0.012)), T((0.34, 0.012 * s, 0.01))]), solid(lin(0x1c0404)))
        for x in (0.2, 0.27):   # 다문 입 밖의 송곳니
            paint(cone(T((x, 0.033 * s, -0.02)), T((x + 0.004, 0.036 * s, -0.062)), 0.007 * 1.3, 3), solid(BONE))
    ys = [-0.042, 0.042] if horns == 2 else [0.0]
    for y in ys:
        hp = [T((0.05, y, 0.07)), T((0.035, y * 1.6, 0.14)), T((0.0, y * 2.0, 0.2)), T((-0.05, y * 2.15, 0.235))]
        b = hp[0]
        paint(loft(hp, [0.024, 0.018, 0.01, 0.002], sides=5, cap1=False, wob=0.0),
              lambda p, n, b=b: tuple(x + (y_ - x) * min(1, (p - b).length / 0.2) for x, y_ in zip(BONE, BONE_TIP)))

for i, (deg, R, hz, wig, roll, turn, horns) in enumerate(HEADS):
    a = math.radians(deg); d = Vector((math.cos(a), math.sin(a), 0)); sd = Vector((-d.y, d.x, 0))
    S0 = CH + Vector((0.02, math.sin(a) * 0.14, 0.02 + ((i * 37) % 5) * 0.012))
    E = CH + d * R + sd * wig * 0.3; E.z = hz + 0.05
    lift = hz - 0.06
    ctrl = [S0, S0 + d * 0.28 + Vector((0, 0, 0.13 + lift * 0.4)), CH + d * (0.62 * R) + sd * wig + Vector((0, 0, -0.18 + lift * 0.8 + 0.12)), E]
    pts = crs(ctrl, 11); rad = [0.1 - 0.05 * min(1, k / 7) for k in range(11)]
    paint(loft(pts, rad, sides=6, cap0=False), hide)
    for t in (0.35, 0.55, 0.75):   # 목의 작은 가시
        k = int(t * 10); p = pts[k]; tg = (pts[k + 1] - pts[k]).normalized(); sd2 = Vector((-tg.y, tg.x, 0)).normalized()
        bp = p + Vector((0, 0, rad[k] * 0.8))
        paint(hull([bp - tg * 0.035, bp + tg * 0.02, bp - tg * 0.03 + Vector((0, 0, 0.05)), bp + sd2 * 0.01, bp - sd2 * 0.01]), solid(SPIKE, 0.2))
    tg = (pts[-1] - pts[-3]).normalized()
    yaw = math.atan2(tg.y, tg.x) + turn; pitch = -0.1 if hz < 0.15 else 0.25
    M = Matrix.Translation(E + Vector((0, 0, -0.02))) @ Matrix.Rotation(yaw, 4, 'Z') @ Matrix.Rotation(-pitch, 4, 'Y') @ Matrix.Rotation(roll, 4, 'X')
    if hz < 0.15:   # 땅에 누운 머리는 턱 끝이 땅에 닿게
        M = Matrix.Translation(Vector((0, 0, 0.02))) @ M
    part(f'head{i}', loc=E)   # 목 끝을 축으로 — 지친 듯 따로 움직인다
    head(i, M, horns)
    body()

# ── 큰 쇠사슬 (20:1~2) ──
def ring_path(center, ax1, ax2, r1, r2, n=40, drift=None):
    return [center + ax1 * math.cos(t) * r1 + ax2 * math.sin(t) * r2 + (drift * (t / (2 * math.pi)) if drift else Vector())
            for t in [k / n * 2 * math.pi for k in range(n + 1)]]

def resample(pts, step):
    out = [(pts[0], (pts[1] - pts[0]).normalized())]; acc = 0.0
    for a, b in zip(pts, pts[1:]):
        seg = (b - a).length
        while acc + seg >= step:
            t = (step - acc) / seg; p = a.lerp(b, t); out.append((p, (b - a).normalized())); a = p; seg = (b - a).length; acc = 0.0
        acc += seg
    return out

links = []
for u in (0.42, 0.6, 0.78):
    p, r, tg = spine_at(u); sd = Vector((-tg.y, tg.x, 0)).normalized()
    links += resample(ring_path(p, sd, Vector((0, 0, 1)), r * 1.08 + 0.03, r * 0.86 + 0.03, drift=tg * 0.05), 0.066)
links += resample(ring_path(CH + Vector((0.26, 0, 0.14)), Vector((0, 1, 0)), Vector((0, 0, 1)), 0.3, 0.1), 0.066)
STONE = Vector((-0.3, 1.05, 0.0))
p, r, tg = spine_at(0.6)
a0 = p + Vector((0, r * 1.08 + 0.03, 0)); a1 = STONE + Vector((0, -0.1, 0.13))
mid = (a0 + a1) / 2 + Vector((0, 0, -0.1))
links += resample([a0.lerp(mid, t / 10) for t in range(10)] + [mid.lerp(a1, t / 10) for t in range(11)], 0.066)

for k, (p, t) in enumerate(links):
    q = Vector((1, 0, 0)).rotation_difference(t) @ Quaternion((1, 0, 0), (k % 2) * math.pi / 2)
    Mq = Matrix.Translation(p) @ q.to_matrix().to_4x4()
    vs = []
    for i in range(6):   # 고리 하나 = 여섯 마디 × 세모 단면
        a = i / 6 * 2 * math.pi; n = Vector((math.cos(a), math.sin(a), 0)); c = Vector((math.cos(a) * 0.045, math.sin(a) * 0.028, 0))
        vs.append([bm.verts.new(Mq @ (c + n * math.cos(b) * 0.011 + Vector((0, 0, math.sin(b) * 0.011)))) for b in [j / 3 * 2 * math.pi for j in range(3)]])
    fs = [bm.faces.new((vs[i][j], vs[i][(j + 1) % 3], vs[(i + 1) % 6][(j + 1) % 3], vs[(i + 1) % 6][j])) for i in range(6) for j in range(3)]
    bmesh.ops.recalc_face_normals(bm, faces=fs)
    paint(fs, solid(IRON, 0.15), 1)

# 인봉한 돌 — 쇠고리와 금 인장(20:3)
paint(hull([STONE + Vector(((random.random() - 0.5) * 0.04 + x, (random.random() - 0.5) * 0.04 + y, z)) for x in (-0.15, 0.15) for y in (-0.13, 0.13) for z in (0.0, 0.17)] +
           [STONE + Vector((0, 0, 0.19)), STONE + Vector((0.17, 0, 0.09)), STONE + Vector((0, 0.15, 0.1))]), solid(STONE_C, 0.25))
paint(loft([STONE + Vector((0.02, 0.02, 0.17)), STONE + Vector((0.02, 0.02, 0.2))], [0.055, 0.05], sides=10, wob=0), solid(GOLD, 0.05), 1)
rp = [STONE + Vector((0, -0.16, 0.12)) + Vector((0, math.cos(t) * 0.0, 0)) + Vector((math.cos(t) * 0.05, 0, math.sin(t) * 0.05)) for t in [k / 10 * 2 * math.pi for k in range(11)]]
paint(loft(rp, [0.011] * 11, sides=4, wob=0), solid(IRON, 0.1), 1)

# ── 내보내기 — 공통 도구(lp.finish)에 넘긴다: 몸(base) + 머리 일곱(head0~6, 목 끝이 축) ──
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lp
lp.S.parts = PARTS; lp.S.bm = bm
lp.finish('dragon', OUT, views={'a': (1.0, -1.0, 0.6), 's': (0.05, -1.0, 0.25)})
print('DONE')
