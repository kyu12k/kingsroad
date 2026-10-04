# 바다 생물 열두 종 (2026-10-05) — 생명수의 바다 도감(game.js NJ_SEA_DEX). 겔 47:10 「고기가 각기 종류대로」
# 실행: blender -b -P sea.py -- <출력 폴더> [이름 …]   → models/sea/*.glb (게임은 nj3d.js loadSea, 캐시 번호 SEA_V)
# 처음엔 3D 화면 코드에서 공·원기둥으로 급히 그렸다 — 문어 다리가 짧고, 소라게 소라가 거꾸로, 곰치 머리가 몸에서 떨어지고, 돌고래 꼬리가 상자였다(사용자).
# 지킬 것: 크기는 게임 단위 그대로(순례자 키 0.22) · 앞은 −y(게임에선 +z) · 원점 = 바닥 가운데(center=False로 그대로)
#   · 요일 빛깔이 물들 곳은 TINT 재질(게임이 그날 빛깔을 곱한다 — 그래서 옅은 바탕색으로 칠한다), 눈·흰 배는 BASE
#   · 눈이 있는 아이는 모두 눈(흰자·눈동자·반짝점) — 안경 자리는 nj3d.js SEA_ACC(눈 가운데 앞)
#   · 움직일 부분은 part(이름) — 게임이 그 축을 돌린다(문어 a0~a7 · 거북 fl0~3 · 가오리 wL·wR · 해파리 t0~3 · 복어 pL·pR·tail · 곰치 eel · 흰동가리 fish · 소라게 claw·legs · 돌고래 tail · 해마 fin)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])
Z = Vector((0, 0, 1))
WHITE, PUPIL, DARK = lin(0xfbfbf6), lin(0x15110e), lin(0x2a2420)

def oblob(c, f, radii, n=14, jitter=0.05):
    """방향 f를 따라 놓인 타원 덩이"""
    f = Vector(f).normalized(); s = Z.cross(f)
    if s.length < 1e-4: s = Vector((1, 0, 0))
    s.normalize(); u = f.cross(s); c = Vector(c); pts = []
    for k in range(n):
        z = 1 - 2 * (k + 0.5) / n; r = math.sqrt(max(0, 1 - z * z)); a = k * 2.39996; m = 1 + (random.random() - 0.5) * jitter
        pts.append(c + (f * math.cos(a) * r * radii[0] + s * math.sin(a) * r * radii[1] + u * z * radii[2]) * m)
    return hull(pts)

def eye(c, d, r):
    """흰자 + 눈동자(보는 쪽 d) + 반짝점"""
    c = Vector(c); d = Vector(d).normalized()
    paint(blob(c, (r, r, r), n=16, jitter=0), solid(WHITE, 0.02))
    paint(blob(c + d * r * 0.55, (r * 0.62,) * 3, n=12, jitter=0), solid(PUPIL, 0.02))
    paint(blob(c + d * r * 0.95 + Z * r * 0.32, (r * 0.2,) * 3, n=6, jitter=0), solid(WHITE, 0.0))

def split(faces, top, bot, thr=0.0, tmat=TINT, bmat=BASE):
    """위를 향한 면은 top(물들임), 아래는 bot"""
    for f in faces:
        f.normal_update(); up = f.normal.z > thr
        f.material_index = tmat if up else bmat
        c = jit(top if up else bot, 0.08)
        for l in f.loops: l[S.CL] = (c[0], c[1], c[2], 1.0)
    return faces

def fan(p0, pts, th=0.004):
    """지느러미 — p0에서 펼쳐지는 얇은 판(볼록)"""
    P = [Vector(p0)] + [Vector(p) for p in pts]
    n = (P[1] - P[0]).cross(P[-1] - P[0]).normalized() if len(P) > 2 else Vector((1, 0, 0))
    return hull([p + n * th for p in P] + [p - n * th for p in P])

def revolve(prof, sides=16, wave=None, center=(0, 0)):
    """세로 축 둘레로 돌린 그릇 — prof = [(반지름, 높이)…] 아래부터. wave(a, i) = 반지름 배율(테두리 물결)"""
    bm = S.bm; rings = []
    for i, (r, z) in enumerate(prof):
        ring = []
        for j in range(sides):
            a = j / sides * 2 * math.pi; m = wave(a, i) if wave else 1.0
            ring.append(bm.verts.new((center[0] + math.cos(a) * r * m, center[1] + math.sin(a) * r * m, z)))
        rings.append(ring)
    faces = []
    for i in range(len(rings) - 1):
        for j in range(sides):
            faces.append(bm.faces.new((rings[i][j], rings[i][(j + 1) % sides], rings[i + 1][(j + 1) % sides], rings[i + 1][j])))
    if prof[-1][0] > 1e-5: faces.append(bm.faces.new(rings[-1]))
    bmesh.ops.recalc_face_normals(bm, faces=faces)
    return faces

import bmesh

# ── 🐙 문어 — 둥근 외투막, 눈, 바닥에 펼쳐져 끝이 말린 긴 다리 여덟 ──
def octopus():
    begin(101)
    T, TD, SUCK = lin(0xfbe4dd), lin(0xeac3ba), lin(0xfff4ef)
    paint(blob((0, 0.012, 0.135), (0.058, 0.066, 0.082), n=48, jitter=0.03), lambda p, n: jit(T if p.z > 0.1 else TD, 0.06), TINT)   # 외투막
    paint(blob((0, -0.008, 0.07), (0.052, 0.048, 0.036), n=36, jitter=0.03), solid(T, 0.06), TINT)   # 머리(눈 자리)
    for sx in (-1, 1): eye((sx * 0.03, -0.042, 0.083), (sx * 0.45, -1, 0.15), 0.014)
    for k in range(8):
        a = (k + 0.5) / 8 * 2 * math.pi - math.pi / 2; d = Vector((math.cos(a), math.sin(a), 0)); s = Z.cross(d)
        root = Vector((0, 0, 0.05)) + d * 0.028
        part(f'a{k}', loc=tuple(root))
        curl = 1 if k % 2 else -1
        L = 0.82   # 다리 길이 배율 — 외투막의 약 세 배(처음 그린 것은 너무 짧았다)
        ctrl = [root, root + d * 0.05 * L - Z * 0.035, root + d * 0.11 * L - Z * 0.046, root + d * 0.17 * L + s * curl * 0.02 - Z * 0.044,
                root + d * 0.215 * L + s * curl * 0.05 - Z * 0.03, root + d * 0.215 * L + s * curl * 0.08 - Z * 0.005, root + d * 0.19 * L + s * curl * 0.085 + Z * 0.01]
        pts = crs(ctrl, 16); radii = [0.017 * (1 - i / 16) ** 1.1 + 0.0025 for i in range(16)]
        paint(loft(pts, radii, sides=7, wob=0.03, ell=(1.0, 0.8)), shade(T, T, SUCK), TINT)   # 아랫면(빨판)은 밝게
        base()
    finish('octopus', OUT, center=False, ao=0.45)

# ── 🐴 해마 — S자 몸, 말린 꼬리, 대롱 주둥이, 머리 위 관(코로넷), 등지느러미 ──
def seahorse():
    begin(102)
    T, TD = lin(0xfbecd2), lin(0xead6b2)
    ctrl = [(0, 0.03, 0.035), (0, 0.05, 0.018), (0, 0.035, 0.004), (0, 0.016, 0.014), (0, 0.012, 0.04), (0, 0.022, 0.08),
            (0, 0.014, 0.12), (0, 0.004, 0.155), (0, 0.006, 0.19), (0, 0.0, 0.215), (0, -0.012, 0.232)]
    pts = crs(ctrl, 26)
    def rad(i):
        u = i / 25
        return 0.003 + 0.02 * math.sin(min(1, u * 1.6) * math.pi / 2) * (1 - max(0, u - 0.75) * 1.6) + (0.006 if 0.35 < u < 0.62 else 0)
    paint(loft(pts, [rad(i) for i in range(26)], sides=7, wob=0.1, ell=(0.8, 1.0)), lambda p, n: jit(T if (int(p.z * 120) % 2) else TD, 0.05), TINT)   # 마디진 몸
    paint(blob((0, -0.012, 0.236), (0.016, 0.02, 0.018), n=20, jitter=0.04), solid(T, 0.05), TINT)   # 머리
    paint(loft([(0, -0.025, 0.232), (0, -0.05, 0.226), (0, -0.068, 0.222)], [0.008, 0.006, 0.0055], sides=6, wob=0), solid(T, 0.05), TINT)   # 주둥이
    paint(cone((0, -0.004, 0.25), (0, 0.002, 0.27), 0.007, 5), solid(TD, 0.05), TINT)   # 관
    for sx in (-1, 1): eye((sx * 0.013, -0.02, 0.24), (sx * 1, -0.6, 0.1), 0.0065)
    part('fin', loc=(0, 0.028, 0.13))
    paint(fan((0, 0.022, 0.11), [(0, 0.045, 0.112), (0, 0.05, 0.13), (0, 0.043, 0.15), (0, 0.022, 0.152)], 0.0015), solid(lin(0xfff8ea), 0.04), TINT)
    base()
    finish('seahorse', OUT, center=False, ao=0.4)

# ── 🐢 바다거북 — 등딱지(무늬 판), 크림빛 배딱지, 머리·부리·눈, 노 같은 앞지느러미 ──
def turtle():
    begin(103)
    T, TD, RIM = lin(0xeaf3dc), lin(0xc9dcb3), lin(0xb7cca0)
    SKIN, SKIND, BELLY = lin(0xa9b98c), lin(0x8b9c70), lin(0xf2e4bf)
    pts = []
    for k in range(70):
        z = 1 - (k + 0.5) / 70; r = math.sqrt(max(0, 1 - z * z)); a = k * 2.39996
        pts.append(Vector((math.cos(a) * r * 0.13, math.sin(a) * r * 0.165, 0.035 + z * 0.06)))
    for k in range(24):
        a = k / 24 * 2 * math.pi; pts.append(Vector((math.cos(a) * 0.13, math.sin(a) * 0.165, 0.035)))
    sh = hull(pts)
    for f in sh:   # 판 무늬 — 육각 칸마다 밝기를 달리, 가장자리 띠는 어둡게
        f.normal_update(); f.material_index = TINT; c0 = f.calc_center_median()
        cell = (int((c0.x + 1) * 22) + int((c0.y + 1) * 18) * 3) % 3
        col = RIM if f.normal.z < 0.35 else (T if cell == 0 else TD if cell == 1 else lin(0xdde9cb))
        col = jit(col, 0.05)
        for l in f.loops: l[S.CL] = (col[0], col[1], col[2], 1.0)
    paint(hull([Vector((math.cos(a) * 0.118, math.sin(a) * 0.15, z)) for a in [k / 20 * 2 * math.pi for k in range(20)] for z in (0.022, 0.036)]), solid(BELLY, 0.04))   # 배딱지
    paint(loft([(0, -0.13, 0.045), (0, -0.165, 0.05), (0, -0.19, 0.055)], [0.026, 0.024, 0.02], sides=8, wob=0), solid(SKIN, 0.06))   # 목
    paint(oblob((0, -0.205, 0.058), (0, -1, 0.1), (0.04, 0.03, 0.026), n=24), solid(SKIN, 0.06))   # 머리
    paint(cone((0, -0.236, 0.054), (0, -0.25, 0.05), 0.012, 5), solid(SKIND, 0.04))   # 부리
    for sx in (-1, 1): eye((sx * 0.022, -0.222, 0.066), (sx * 0.8, -1, 0.15), 0.009)
    def flipper(nm, piv, tip, wid, back):
        piv, tip = Vector(piv), Vector(tip); part(nm, loc=tuple(piv))
        d = (tip - piv); sd = Vector((0, back, 0))
        P = [piv, piv + d * 0.35 + sd * wid, piv + d * 0.75 + sd * wid * 0.8, tip, piv + d * 0.6 - sd * wid * 0.25]
        paint(hull([p + Z * 0.006 for p in P] + [p - Z * 0.006 for p in P]), solid(SKIN, 0.06))
        base()
    flipper('fl0', (-0.09, -0.07, 0.04), (-0.27, 0.01, 0.03), 0.045, 1)
    flipper('fl1', (0.09, -0.07, 0.04), (0.27, 0.01, 0.03), 0.045, 1)
    flipper('fl2', (-0.08, 0.12, 0.035), (-0.15, 0.2, 0.03), 0.03, 1)
    flipper('fl3', (0.08, 0.12, 0.035), (0.15, 0.2, 0.03), 0.03, 1)
    paint(cone((0, 0.16, 0.04), (0, 0.2, 0.035), 0.012, 5), solid(SKIN, 0.05))   # 꼬리
    finish('turtle', OUT, center=False, ao=0.45)

# ── 🪁 가오리 — 납작한 마름모, 위는 물들고 배는 흰빛, 펄럭이는 두 날개, 긴 꼬리 ──
def ray():
    begin(104)
    T, TD, BELLY = lin(0xf2ebde), lin(0xddd2bf), lin(0xfbfbf6)
    def outline(x0, x1):
        out = []
        for i in range(13):
            x = x0 + (x1 - x0) * i / 12; ax = abs(x)
            yf = -0.15 + ax * 0.75 if ax < 0.2 else -0.0 + (ax - 0.2) * 0.4   # 앞 가장자리
            yb = 0.1 - ax * 0.42                                              # 뒷 가장자리
            th = max(0.004, 0.03 * max(0.0, 1 - ax / 0.24) ** 1.3)
            out += [Vector((x, yf, 0.015 + th * 0.3)), Vector((x, yb, 0.015 + th * 0.2)), Vector((x, (yf + yb) / 2, 0.015 + th)), Vector((x, (yf + yb) / 2, 0.012 - th * 0.3))]
        return out
    split(hull(outline(-0.065, 0.065)), T, BELLY, -0.2)
    for nm, sx in (('wL', -1), ('wR', 1)):
        part(nm, loc=(sx * 0.06, 0, 0.015))
        x0, x1 = (sx * 0.06, sx * 0.24)
        split(hull(outline(min(x0, x1), max(x0, x1))), T, BELLY, -0.2)
        base()
    for k in range(9):   # 점무늬
        x, y = (random.random() - 0.5) * 0.1, -0.06 + random.random() * 0.12
        paint(blob((x, y, 0.04 - abs(x) * 0.2), (0.008, 0.008, 0.003), n=8, jitter=0), solid(TD, 0.05), TINT)
    paint(loft(crs([(0, 0.09, 0.017), (0, 0.2, 0.02), (0, 0.3, 0.024), (0, 0.4, 0.03)], 10), [0.007 * (1 - i / 10) + 0.0012 for i in range(10)], sides=5, wob=0), solid(TD, 0.04), TINT)   # 꼬리
    for sx in (-1, 1): eye((sx * 0.03, -0.075, 0.034), (sx * 0.3, -0.6, 1), 0.008)
    finish('ray', OUT, center=False, ao=0.4)

# ── ⭐ 불가사리 — 가운데 원판에서 뻗은 다섯 팔, 위에 오톨도톨 돌기 ──
def starfish():
    begin(105)
    T, TD, KNOB = lin(0xffe4d2), lin(0xf2c9b2), lin(0xfff6ee)
    paint(blob((0, 0, 0.018), (0.035, 0.035, 0.016), n=24, jitter=0.04), solid(T, 0.05), TINT)
    for k in range(5):
        a = k / 5 * 2 * math.pi - math.pi / 2; d = Vector((math.cos(a), math.sin(a), 0))
        pts = crs([d * 0.0 + Z * 0.02, d * 0.06 + Z * 0.016, d * 0.11 + Z * 0.012, d * 0.135 + Z * 0.02], 9)
        paint(loft(pts, [0.026, 0.022, 0.018, 0.015, 0.012, 0.009, 0.007, 0.005, 0.003], sides=7, wob=0.05, ell=(1.0, 0.55)), shade(T, TD), TINT)
        for t in (0.03, 0.06, 0.09, 0.115):
            paint(blob(d * t + Z * (0.032 - t * 0.12), (0.005,) * 3, n=6, jitter=0), solid(KNOB, 0.04), TINT)
    finish('starfish', OUT, center=False, ao=0.4)

# ── 🦀 소라게 — 등에 멘 소라(입구가 앞을 본다), 빨간 몸, 집게 둘(오른쪽이 크다), 눈자루 끝에 눈 ──
def crab():
    begin(106)
    T, TD = lin(0xfbeedd), lin(0xe8d2b8)
    RED, REDD, TIP = lin(0xd95f3c), lin(0xb2462a), lin(0xf6e7d6)
    # 소라 — 입구(굵은 끝)가 앞(−y) 아래, 뒤로 갈수록 가늘어지며 위로 감긴다
    ax0 = Vector((0, 0.01, 0.045)); pts = []; radii = []
    for i in range(30):
        u = i / 29; ang = u * 3.0 * math.pi; rr = 0.04 * (1 - u) ** 1.1
        pts.append(ax0 + Vector((math.sin(ang) * rr * 0.9, 0.03 * u + math.cos(ang) * rr * 0.5 - 0.02 * (1 - u), 0.07 * u ** 0.8 + math.cos(ang) * rr * 0.5)))
        radii.append(0.034 * (1 - u) ** 1.25 + 0.002)
    paint(loft(pts, radii, sides=10, wob=0.04, cap0=False), lambda p, n: jit(T if (int((p.z + p.y) * 140) % 2) else TD, 0.05), TINT)
    paint(blob((0, -0.03, 0.03), (0.024, 0.016, 0.018), n=18, jitter=0.03), solid(lin(0x4a2e22), 0.04))   # 입구 안 어둠
    paint(blob((0, -0.045, 0.032), (0.026, 0.02, 0.018), n=20, jitter=0.03), shade(RED, REDD))   # 몸(머리가슴)
    for sx in (-1, 1):   # 눈자루와 눈
        paint(cyl((sx * 0.009, -0.055, 0.044), (sx * 0.014, -0.064, 0.074), 0.003, sides=5), solid(RED, 0.04))
        eye((sx * 0.015, -0.066, 0.078), (sx * 0.4, -1, 0.1), 0.006)
    part('legs', loc=(0, -0.045, 0.03))   # 걷는 다리 세 쌍
    for sx in (-1, 1):
        for k in range(3):
            y = -0.05 + k * 0.013
            j1 = Vector((sx * 0.024, y, 0.034)); j2 = Vector((sx * 0.055, y - 0.006, 0.046)); j3 = Vector((sx * 0.07, y - 0.012, 0.002))
            paint(loft([j1, j2], [0.0045, 0.004], sides=5, wob=0), solid(RED, 0.05))
            paint(loft([j2, j3], [0.004, 0.0018], sides=5, wob=0), lambda p, n: jit(TIP if p.z < 0.012 else RED, 0.05))
    base()
    part('claw', loc=(0, -0.06, 0.03))   # 집게 — 오른쪽이 크다
    for sx, sc in ((1, 1.0), (-1, 0.65)):
        sh = Vector((sx * 0.022, -0.06, 0.03)); el = Vector((sx * 0.032, -0.08, 0.022)); hand = Vector((sx * 0.026, -0.095, 0.022))
        paint(loft([sh, el, hand], [0.006 * sc, 0.0065 * sc, 0.008 * sc], sides=6, wob=0), shade(RED, REDD))
        paint(oblob(hand, (0, -1, 0), (0.016 * sc, 0.012 * sc, 0.009 * sc), n=14), shade(RED, REDD))
        for dz in (0.006, -0.005):
            paint(cone(hand + Vector((0, -0.012 * sc, dz * sc)), hand + Vector((0, -0.03 * sc, dz * sc * 0.5)), 0.005 * sc, 4), solid(TIP, 0.04))
    base()
    finish('crab', OUT, center=False, ao=0.45)

# ── 🪼 해파리 — 물결 테두리의 종, 가운데 주름진 입팔, 가는 촉수(게임이 반투명으로) ──
def jelly():
    begin(107)
    T, TD = lin(0xfde9ff), lin(0xf1cff7)
    prof = [(0.082, 0.055), (0.086, 0.07), (0.08, 0.095), (0.064, 0.118), (0.04, 0.132), (0.015, 0.138), (0.0, 0.139)]
    paint(revolve(prof, sides=20, wave=lambda a, i: 1 + (0.07 * math.cos(a * 8) if i == 0 else 0)), lambda p, n: jit(T if p.z > 0.09 else TD, 0.04), TINT)
    paint(revolve([(0.07, 0.06), (0.05, 0.085), (0.025, 0.1), (0.0, 0.104)], sides=16), solid(lin(0xfff4ff), 0.03), TINT)   # 안쪽 종
    for k in range(4):
        a = k / 4 * 2 * math.pi; d = Vector((math.cos(a), math.sin(a), 0)); s = Z.cross(d)
        part(f't{k}', loc=(0, 0, 0.06))
        arm = [Vector((0, 0, 0.06)) + d * 0.012 - Z * z + s * math.sin(z * 60 + k) * 0.01 + d * z * 0.15 for z in (0.0, 0.03, 0.06, 0.09, 0.12)]
        paint(loft(crs(arm, 10), [0.01 * (1 - i / 10) + 0.002 for i in range(10)], sides=5, wob=0.15, ell=(1.6, 0.6)), solid(lin(0xfbe1ff), 0.05), TINT)   # 주름진 입팔
        for j in (0, 1):
            b = a + (j - 0.5) * 0.7; dd = Vector((math.cos(b), math.sin(b), 0))
            ten = [dd * 0.078 + Z * 0.058 - Z * z + Z.cross(dd) * math.sin(z * 40 + j) * 0.008 for z in (0.0, 0.05, 0.1, 0.15, 0.19)]
            paint(loft(crs(ten, 9), [0.0022] * 9, sides=4, wob=0), solid(lin(0xf5d7ff), 0.04), TINT)
        base()
    finish('jelly', OUT, center=False, ao=0.25)

# ── 🐡 복어 — 둥근 몸, 위는 물들고 배는 크림빛, 작은 가시, 큰 눈, 작은 입, 가슴지느러미·꼬리 ──
def puffer():
    begin(108)
    T, TD, BELLY = lin(0xfbf1cc), lin(0xe9dba8), lin(0xfffaea)
    split(blob((0, 0, 0.07), (0.055, 0.064, 0.054), n=60, jitter=0.03), T, BELLY, -0.25)
    for k in range(46):   # 가시 — 몸 위쪽 반
        z = 1 - (k + 0.5) / 46 * 1.4; r = math.sqrt(max(0, 1 - z * z)); a = k * 2.39996
        d = Vector((math.cos(a) * r, math.sin(a) * r, z)).normalized()
        p = Vector((0, 0, 0.07)) + Vector((d.x * 0.055, d.y * 0.064, d.z * 0.054))
        if d.y < -0.6 and abs(d.z) < 0.4: continue   # 얼굴은 비운다
        paint(cone(p, p + d * 0.016, 0.0035, 3), solid(TD, 0.05), TINT)
    for sx in (-1, 1):
        for dd in (TD,): paint(blob((sx * 0.024, -0.03, 0.105), (0.008, 0.012, 0.004), n=8, jitter=0), solid(dd, 0.04), TINT)   # 눈썹 무늬
        eye((sx * 0.032, -0.046, 0.088), (sx * 0.55, -1, 0.1), 0.0155)
    paint(oblob((0, -0.064, 0.064), (0, -1, 0), (0.006, 0.009, 0.005), n=10), solid(lin(0xd88a6a), 0.04))   # 입
    for nm, sx in (('pL', -1), ('pR', 1)):
        part(nm, loc=(sx * 0.052, -0.008, 0.066))
        paint(fan((sx * 0.052, -0.008, 0.066), [(sx * 0.075, 0.0, 0.08), (sx * 0.08, 0.012, 0.066), (sx * 0.073, 0.012, 0.052)], 0.0015), solid(lin(0xfff3cc), 0.04), TINT)
        base()
    part('tail', loc=(0, 0.062, 0.07))
    paint(fan((0, 0.06, 0.07), [(0, 0.09, 0.095), (0, 0.1, 0.07), (0, 0.09, 0.045)], 0.0018), solid(TD, 0.04), TINT)
    base()
    paint(fan((0, 0.045, 0.11), [(0, 0.06, 0.13), (0, 0.068, 0.115)], 0.0015), solid(TD, 0.04), TINT)   # 등지느러미
    finish('puffer', OUT, center=False, ao=0.4)

# ── 🐍 곰치 — 바위 굴에서 S자로 솟은 한 몸(머리와 몸이 한 덩어리 — 처음엔 따로 놀았다), 벌린 입, 눈, 등지느러미 ──
def eel():
    begin(109)
    ROCK, ROCKD, HOLE = lin(0x8e8578), lin(0x6f675c), lin(0x1e1a16)
    T, TD, MOUTH = lin(0xeef3d2), lin(0xd6deaf), lin(0xc9786e)
    paint(blob((0, 0.025, 0.035), (0.095, 0.085, 0.055), n=40, jitter=0.12), shade(ROCK, ROCKD))
    paint(blob((0.06, -0.04, 0.02), (0.04, 0.035, 0.03), n=20, jitter=0.15), shade(ROCK, ROCKD))
    paint(oblob((0, -0.035, 0.05), (0, -1, 0.3), (0.006, 0.03, 0.026), n=14), solid(HOLE, 0.03))   # 굴 입구
    part('eel', loc=(0, -0.04, 0.05))
    ctrl = [(0, -0.02, 0.03), (0, -0.045, 0.07), (0, -0.05, 0.12), (0, -0.04, 0.165), (0, -0.05, 0.2), (0, -0.075, 0.222), (0, -0.1, 0.226)]
    pts = crs(ctrl, 22)
    radii = [0.021 if i < 17 else 0.021 - (i - 17) * 0.0025 for i in range(22)]
    paint(loft(pts, radii, sides=8, wob=0.04, ell=(0.7, 1.0)), lambda p, n: jit(TD if random.random() < 0.3 else T, 0.08), TINT)   # 몸과 머리 한 덩어리
    paint(loft(crs([(0, -0.077, 0.206), (0, -0.098, 0.2), (0, -0.112, 0.204)], 6), [0.012, 0.008, 0.004, 0.003, 0.003, 0.002], sides=6, wob=0), solid(T, 0.05), TINT)   # 아래턱(살짝 벌림)
    paint(oblob((0, -0.098, 0.212), (0, -1, 0.2), (0.012, 0.006, 0.004), n=10), solid(MOUTH, 0.04))   # 입 안
    for i in range(3, 19):   # 등지느러미 띠
        a, b = pts[i], pts[i + 1]; up = Vector((0, 0.6, 0.4)).normalized()
        paint(hull([a + up * 0.018, b + up * 0.018, a + up * 0.03, b + up * 0.028, a + Vector((0.002, 0, 0)) + up * 0.018, b + Vector((0.002, 0, 0)) + up * 0.018]), solid(TD, 0.05), TINT)
    for sx in (-1, 1): eye((sx * 0.012, -0.085, 0.236), (sx * 0.6, -1, 0.2), 0.0075)
    base()
    finish('eel', OUT, center=False, ao=0.45)

# ── 🐠 흰동가리 — 말미잘(물들지 않음)과 그 둘레를 도는 물고기(주황 몸은 물들고 흰 띠는 그대로) ──
def clown():
    begin(110)
    ANE, ANED, ANET = lin(0xd77aa0), lin(0xb35d84), lin(0xf6c0d8)
    paint(loft([(0, 0, 0), (0, 0, 0.03), (0, 0, 0.045)], [0.05, 0.045, 0.052], sides=12, wob=0.05), shade(ANED, ANED))
    for k in range(34):
        a = k * 2.39996; r = 0.012 + (k % 7) / 7 * 0.038; d = Vector((math.cos(a), math.sin(a), 0))
        b = d * r + Z * 0.045; tip = b + d * (0.02 + random.random() * 0.02) + Z * (0.05 + random.random() * 0.035)
        mid = (b + tip) / 2 + d * 0.01
        paint(loft(crs([b, mid, tip], 6), [0.006, 0.0055, 0.005, 0.0045, 0.004, 0.0035], sides=5, wob=0), solid(ANE, 0.06))
        paint(blob(tip, (0.006,) * 3, n=6, jitter=0), solid(ANET, 0.04))
    part('fish', loc=(0.11, 0, 0.11), local=True)   # 원점 기준으로 빚는다 — 게임이 말미잘 둘레를 돌린다
    O, BLK = lin(0xffd7b8), lin(0x2a2420)
    body = oblob((0, 0, 0), (0, -1, 0), (0.04, 0.0165, 0.025), n=40, jitter=0.02)
    for f in body:   # 흰 띠 셋은 물들지 않는다
        f.normal_update(); y = f.calc_center_median().y
        band = any(abs(y - b) < 0.0055 for b in (-0.024, 0.0, 0.024))
        f.material_index = BASE if band else TINT; c = jit(WHITE if band else O, 0.04)
        for l in f.loops: l[S.CL] = (c[0], c[1], c[2], 1.0)
    paint(fan((0, 0.035, 0), [(0, 0.058, 0.02), (0, 0.064, 0.0), (0, 0.058, -0.02)], 0.0015), solid(O, 0.04), TINT)   # 꼬리
    paint(fan((0, -0.01, 0.022), [(0, 0.0, 0.034), (0, 0.022, 0.03), (0, 0.03, 0.02)], 0.0013), solid(O, 0.04), TINT)   # 등지느러미
    for sx in (-1, 1):
        paint(fan((sx * 0.014, -0.012, -0.005), [(sx * 0.03, -0.0, -0.012), (sx * 0.028, 0.008, -0.004)], 0.0012), solid(O, 0.04), TINT)
        eye((sx * 0.0105, -0.03, 0.007), (sx * 0.7, -1, 0.1), 0.0058)
    base()
    finish('clown', OUT, center=False, ao=0.35)

# ── 🌰 성게 — 둥근 몸에서 사방으로 뻗은 가시 ──
def urchin():
    begin(111)
    T, TD = lin(0xeedcf6), lin(0xd6c0e6)
    paint(blob((0, 0, 0.032), (0.05, 0.05, 0.036), n=40, jitter=0.03), solid(TD, 0.05), TINT)
    for k in range(70):
        z = 1 - (k + 0.5) / 70 * 1.25; r = math.sqrt(max(0, 1 - z * z)); a = k * 2.39996
        d = Vector((math.cos(a) * r, math.sin(a) * r, z)).normalized()
        p = Vector((0, 0, 0.032)) + Vector((d.x * 0.048, d.y * 0.048, d.z * 0.034))
        paint(cone(p, p + d * (0.06 + random.random() * 0.02), 0.0032, 3), lambda q, n: jit(T, 0.06), TINT)
    finish('urchin', OUT, center=False, ao=0.4)

# ── 🐬 돌고래 — 유선형 몸, 이마(멜론)와 부리, 휜 등지느러미, 가슴지느러미, 반달 꼬리(두 갈래), 흰 배 ──
def dolphin():
    begin(112)
    T, TD, BELLY = lin(0xe6edf3), lin(0xcdd8e2), lin(0xfbfbf8)
    ys = [-0.25, -0.225, -0.2, -0.17, -0.12, -0.06, 0.0, 0.06, 0.12, 0.17, 0.205]
    zc = [0.1, 0.101, 0.104, 0.11, 0.112, 0.112, 0.11, 0.107, 0.104, 0.102, 0.1]
    rr = [0.008, 0.016, 0.028, 0.046, 0.06, 0.066, 0.064, 0.054, 0.038, 0.022, 0.012]
    pts = crs([(0, y, z) for y, z in zip(ys, zc)], 30)
    radii = [interp(rr, i / 29) for i in range(30)]
    split(loft(pts, radii, sides=12, wob=0.01, ell=(0.82, 1.0)), T, BELLY, -0.3)
    paint(blob((0, -0.168, 0.13), (0.036, 0.04, 0.03), n=24, jitter=0.02), solid(T, 0.03), TINT)   # 이마(멜론)
    fin = [(0, -0.02, 0.165), (0, 0.06, 0.16), (0, 0.04, 0.2), (0, 0.075, 0.235), (0, 0.095, 0.24)]   # 뒤로 휜 등지느러미
    paint(hull([Vector(p) + Vector((s * (0.007 if p[2] < 0.19 else 0.003), 0, 0)) for p in fin for s in (-1, 1)]), solid(TD, 0.04), TINT)
    paint(hull([Vector(p) + Vector((s * 0.004, 0, 0)) for p in [(0, 0.03, 0.17), (0, 0.075, 0.235), (0, 0.068, 0.2)] for s in (-1, 1)]), solid(TD, 0.04), TINT)
    for sx in (-1, 1):   # 가슴지느러미
        P = [(sx * 0.045, -0.1, 0.075), (sx * 0.05, -0.065, 0.075), (sx * 0.13, -0.035, 0.04), (sx * 0.12, -0.05, 0.042)]
        paint(hull([Vector(p) + Z * 0.004 for p in P] + [Vector(p) - Z * 0.004 for p in P]), solid(TD, 0.04), TINT)
        eye((sx * 0.04, -0.15, 0.104), (sx * 1, -0.35, 0.05), 0.0075)
    paint(loft([(0, -0.235, 0.096), (0, -0.2, 0.093)], [0.004, 0.006], sides=6, wob=0), solid(lin(0x9fb0bf), 0.03), TINT)   # 입선
    part('tail', loc=(0, 0.2, 0.1))   # 반달 꼬리 — 두 갈래(가운데가 패인다)
    for sx in (-1, 1):
        P = [(0, 0.195, 0.1), (sx * 0.02, 0.215, 0.1), (sx * 0.075, 0.25, 0.1), (sx * 0.11, 0.285, 0.1), (sx * 0.06, 0.265, 0.1), (sx * 0.012, 0.24, 0.1)]
        paint(hull([Vector(p) + Z * 0.005 for p in P] + [Vector(p) - Z * 0.005 for p in P]), solid(TD, 0.04), TINT)
    base()
    finish('dolphin', OUT, center=False, ao=0.35)

ALL = [octopus, seahorse, turtle, ray, starfish, crab, jelly, puffer, eel, clown, urchin, dolphin]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
