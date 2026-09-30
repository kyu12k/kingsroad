# 만국의 예물 — 로우폴리 모델 아홉 가지 (용은 dragon_lp.py)
# 실행: blender -b -P gifts.py -- <출력 폴더> [예물 이름 …]
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector, Matrix
from lp import *
import lp

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

GOLD, GOLD_D = lin(0xe0b545), lin(0xb88a2a)
WOOD, WOOD_D = lin(0x8a5a30), lin(0x5e3c1e)
MARBLE, MARBLE_S = lin(0xf2ede2), lin(0xd9d2c2)
FLAME = lin(0xffd27a)

def annulus(M, R, r, h, seg=16, fn=None, mat=BASE):
    """가운데 구멍 뚫린 두꺼운 원판 (맷돌) — M으로 놓는다"""
    bm = S.bm; ring = lambda rad, z: [bm.verts.new(M @ Vector((math.cos(a) * rad * (1 + (random.random() - 0.5) * 0.04), math.sin(a) * rad * (1 + (random.random() - 0.5) * 0.04), z)))
                                      for a in [k / seg * 2 * math.pi for k in range(seg)]]
    ot, ob, it, ib = ring(R, h / 2), ring(R, -h / 2), ring(r, h / 2), ring(r, -h / 2)
    fs = []
    for k in range(seg):
        j = (k + 1) % seg
        fs.append(bm.faces.new((ot[k], ot[j], ob[j], ob[k])))      # 바깥 옆
        fs.append(bm.faces.new((it[j], it[k], ib[k], ib[j])))      # 구멍 옆
        fs.append(bm.faces.new((it[k], it[j], ot[j], ot[k])))      # 윗면
        fs.append(bm.faces.new((ob[k], ob[j], ib[j], ib[k])))      # 아랫면
    import bmesh; bmesh.ops.recalc_face_normals(bm, faces=fs)
    return paint(fs, fn or solid(lin(0x8c857a)), mat)

# ── 흰 돌 (2:17) — 새 이름이 새겨진 흰 돌, 곁에 감추었던 만나의 금 항아리 ──
def whitestone():
    begin(21)
    paint(hull([Vector((x * 0.5 + (random.random() - 0.5) * 0.05, y * 0.4 + (random.random() - 0.5) * 0.05, z)) for x in (-1, 1) for y in (-1, 1) for z in (0, 0.07)] +
               [Vector((0.54, 0, 0.035)), Vector((-0.54, 0, 0.035)), Vector((0, 0.44, 0.035)), Vector((0, -0.44, 0.035))]), shade(lin(0x3a4f9a), lin(0x2c3c7a), k=0.08))
    paint(blob((0, 0, 0.24), (0.34, 0.26, 0.18), n=44, jitter=0.1), shade(lin(0xfbf8f0), lin(0xe8e3d6), k=0.06))
    part('letters')   # 가끔 반짝인다
    GLYPHS = [[((-0.04, 0.045), (0.04, 0.045)), ((0.0, 0.045), (-0.03, -0.05)), ((-0.01, -0.005), (0.045, -0.045))],
              [((-0.045, 0.0), (0.045, 0.0)), ((-0.02, 0.05), (-0.02, -0.05)), ((0.03, 0.04), (0.02, -0.05))],
              [((-0.04, 0.04), (0.035, 0.05)), ((0.035, 0.05), (-0.035, -0.045)), ((-0.035, -0.045), (0.045, -0.035))]]
    for k, g in enumerate(GLYPHS):   # 새긴 이름 — 글자 셋, 받는 자밖에 모른다
        o = Vector((-0.13 + k * 0.13, 0.0, 0.405))
        for (x0, y0), (x1, y1) in g:
            a, b = o + Vector((x0, y0, 0)), o + Vector((x1, y1, 0)); d = b - a; w = Vector((-d.y, d.x, 0)).normalized() * 0.011
            paint(hull([a - w, a + w, b - w, b + w, a + Vector((0, 0, 0.014)), b + Vector((0, 0, 0.014))]), solid(GOLD, 0.05), METAL)
    base()
    jp = Vector((0.5, 0.22, 0.07))   # 만나 항아리 (히 9:4)
    paint(loft([jp, jp + Vector((0, 0, 0.06)), jp + Vector((0, 0, 0.16)), jp + Vector((0, 0, 0.24)), jp + Vector((0, 0, 0.28))], [0.075, 0.105, 0.095, 0.06, 0.075], sides=10, wob=0.02), shade(GOLD, GOLD_D, k=0.08), METAL)
    paint(cone(jp + Vector((0, 0, 0.28)), jp + Vector((0, 0, 0.34)), 0.07, 10), solid(GOLD, 0.06), METAL)
    finish('whitestone', OUT)

# ── 종려 가지 (7:9) — 흰 끈으로 묶어 항아리에 꽂은 다섯 가지 ──
def palm():
    begin(7)
    paint(loft([(0, 0, 0), (0, 0, 0.08), (0, 0, 0.22), (0, 0, 0.34), (0, 0, 0.4)], [0.13, 0.19, 0.18, 0.1, 0.125], sides=10, wob=0.03), shade(lin(0xc8744a), lin(0xb0613a), k=0.1))
    neck = [Vector((math.cos(t) * 0.108, math.sin(t) * 0.108, 0.345)) for t in [k / 12 * 2 * math.pi for k in range(12)]]
    paint(loft(neck, 0.016, sides=4, closed=True, wob=0), solid(lin(0xf6f2e8), 0.05))
    up = Vector((0, 0, 1))
    for k in range(5):
        az = k / 5 * 2 * math.pi + random.random() * 0.4; tilt = 0.25 + random.random() * 0.25; L = 1.0 + random.random() * 0.25
        d = Vector((math.cos(az), math.sin(az), 0))
        b = Vector((0, 0, 0.36)) + d * 0.03
        part(f'frond{k}', loc=b)   # 바람에 살랑
        rib = crs([b, b + d * (0.25 * L * tilt * 2) + up * 0.45 * L, b + d * (0.5 * L * tilt * 2) + up * 0.78 * L, b + d * (0.75 * L * tilt * 2) + up * 0.82 * L], 13)
        paint(loft(rib, [0.013 - 0.008 * i / 12 for i in range(13)], sides=4, wob=0), solid(lin(0x7a8a3a), 0.08))
        for i in range(3, 13):
            p = rib[i]; T = (rib[min(i + 1, 12)] - rib[i - 1]).normalized(); sd = T.cross(up).normalized()
            if sd.length < 0.1: sd = Vector((1, 0, 0))
            ll = 0.24 * (1 - (i - 3) / 12) + 0.05
            for s in (-1, 1):
                tip = p + sd * s * ll + T * 0.1 - up * 0.1
                paint(hull([p, p + T * 0.045, tip, p + up * 0.006, p + T * 0.045 + up * 0.006]), solid(lin(0x3f9444) if i % 2 else lin(0x4aa24c), 0.14))
    finish('palm', OUT)

# ── 광명한 새벽별 (22:16) — 흰 대리석 기둥 위의 빛나는 별 ──
def morningstar():
    begin(22)
    paint(hull([Vector((x * 0.2, y * 0.2, z)) for x in (-1, 1) for y in (-1, 1) for z in (0, 0.08)]), shade(MARBLE, MARBLE_S, k=0.05))
    paint(loft([(0, 0, 0.08), (0, 0, 0.14), (0, 0, 0.62), (0, 0, 0.7)], [0.14, 0.1, 0.085, 0.13], sides=10, wob=0.01), shade(MARBLE, MARBLE_S, k=0.05))
    paint(hull([Vector((x * 0.16, y * 0.16, z)) for x in (-1, 1) for y in (-1, 1) for z in (0.7, 0.76)]), shade(MARBLE, MARBLE_S, k=0.05))
    c = Vector((0, 0, 1.05))
    part('star', loc=c)   # 돌며 반짝
    paint(blob(c, (0.1, 0.1, 0.1), n=14, jitter=0.0), solid(lin(0xfff6d6), 0.04), GLOW)
    dirs = [Vector(v) for v in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1))]
    for d in dirs: paint(cone(c + d * 0.05, c + d * 0.3, 0.055, 4), solid(lin(0xfff0b8), 0.05), GLOW)
    for sx in (-1, 1):
        for sy in (-1, 1):
            for sz in (-1, 1):
                d = Vector((sx, sy, sz)).normalized(); paint(cone(c + d * 0.05, c + d * 0.17, 0.035, 3), solid(lin(0xffe39a), 0.05), GLOW)
    finish('morningstar', OUT, emit=(1.0, 0.86, 0.55))

# ── 하나님의 거문고 (15:2) — 불이 섞인 유리 바다 위에 선 금 수금 ──
def harp():
    begin(15)
    def sea(p, n):
        return jit(lin(0xf2a45a) if random.random() < 0.22 else lin(0xc4e6ee), 0.1)
    paint(loft([(0, 0, 0), (0, 0, 0.05)], [0.52, 0.5], sides=14, wob=0.03), sea)
    paint(hull([Vector((x * 0.19, y * 0.075, z)) for x in (-1, 1) for y in (-1, 1) for z in (0.05, 0.3)] + [Vector((0, 0.09, 0.18)), Vector((0, -0.09, 0.18))]), shade(WOOD, WOOD_D, k=0.1))
    for s in (-1, 1):
        arm = crs([(0.15 * s, 0, 0.28), (0.27 * s, 0, 0.55), (0.22 * s, 0, 0.82), (0.3 * s, 0, 1.0)], 10)
        paint(loft(arm, [0.03 - 0.012 * i / 9 for i in range(10)], sides=6, wob=0.02), shade(GOLD, GOLD_D, k=0.08), METAL)
    paint(cyl((-0.26, 0, 0.9), (0.26, 0, 0.9), 0.02, sides=6), shade(GOLD, GOLD_D, k=0.06), METAL)
    for k in range(7):   # 줄 일곱 — 하나씩 튕긴다
        x = -0.12 + k * 0.04
        part(f'string{k}', loc=(x * 1.15, 0, 0.6))
        paint(cyl((x, 0.0, 0.3), (x * 1.3, 0.0, 0.89), 0.0045, sides=3), solid(lin(0xfff4d8), 0.04))
    finish('harp', OUT)

# ── 순금 등대 (출 25:31~37 · 계 1:12) — 한 줄기에서 양쪽으로 가지 셋씩, 등잔 일곱 ──
def menorah():
    begin(12)
    G = shade(GOLD, GOLD_D, k=0.08)
    T = 0.98            # 등잔 받침(잔)이 모두 같은 높이에 선다
    # 받침 — 층진 팔각 대와 세 발
    paint(loft([(0, 0, 0), (0, 0, 0.045)], [0.24, 0.22], sides=8, wob=0.0), G, METAL)
    paint(loft([(0, 0, 0.045), (0, 0, 0.1)], [0.15, 0.12], sides=8, wob=0.0), G, METAL)
    for k in range(3):
        a = k / 3 * 2 * math.pi + math.pi / 2
        paint(hull([Vector((math.cos(a) * 0.22, math.sin(a) * 0.22, 0)) + Vector(v) for v in ((-0.04, -0.04, 0), (0.04, 0.04, 0), (-0.04, 0.04, 0), (0.04, -0.04, 0), (0, 0, 0.07))]), G, METAL)
    # 가운데 줄기 — 가지가 나는 곳마다 꽃받침 마디
    RS = (0.13, 0.25, 0.37)
    zs = [0.1, 0.2, 0.3, 0.38] ; rs = [0.045, 0.026, 0.024, 0.04]
    for r in reversed(RS):
        j = T - r; zs += [j - 0.03, j, j + 0.03]; rs += [0.024, 0.042, 0.024]
    zs += [T - 0.02, T + 0.02, T + 0.07]; rs += [0.024, 0.03, 0.055]
    paint(loft([(0, 0, z) for z in zs], rs, sides=8, wob=0.0), G, METAL)
    cups = [Vector((0, 0, T + 0.07))]
    # 여섯 가지 — 줄기에서 옆으로 나와 둥글게 올라가 같은 높이에 닿는다
    for s in (-1, 1):
        for r in RS:
            n = 12
            pts = [Vector((s * r * math.sin(t), 0, T - r * math.cos(t))) for t in [k / (n - 1) * math.pi / 2 for k in range(n)]]
            pts += [Vector((s * r, 0, T + 0.02)), Vector((s * r, 0, T + 0.07))]
            rad = [0.02] * len(pts)
            for k in (4, 8): rad[k] = 0.032          # 살구꽃 모양 꽃받침과 마디
            rad[-2], rad[-1] = 0.028, 0.052           # 등잔을 받치는 잔
            paint(loft(pts, rad, sides=6, wob=0.0), G, METAL)
            cups.append(Vector((s * r, 0, T + 0.07)))
    # 등잔 일곱과 불꽃 — 앞을 비추게 (출 25:37)
    for i, c in enumerate(cups):
        # 둥근 기름 등잔 — 앞으로 부리가 나왔다
        paint(hull([c + Vector((math.cos(t) * 0.045, math.sin(t) * 0.035, z)) for t in [k / 10 * 2 * math.pi for k in range(10)] for z in (0.0, 0.025)] +
                   [c + Vector((0, -0.075, 0.03))]), G, METAL)
        # 물방울 불꽃 — 어느 쪽에서 봐도 통통하게, 아래는 희고 위는 주황
        f = c + Vector((0, -0.06, 0.035))
        prof = [(0.0, 0.01), (0.025, 0.03), (0.06, 0.028), (0.1, 0.016), (0.135, 0.004)]
        part(f'flame{i}', loc=f)   # 바람에 흔들리는 불꽃
        paint(loft([f + Vector((0, -0.004 * i, z)) for i, (z, r) in enumerate(prof)], [r for z, r in prof], sides=8, wob=0.05),
              lambda p, n, f=f: jit(tuple(a_ + (b_ - a_) * min(1, max(0, (p.z - f.z) / 0.12)) for a_, b_ in zip(lin(0xfff4c8), lin(0xffa640))), 0.05), GLOW)
        base()
    finish('menorah', OUT, emit=(1.0, 0.72, 0.3), views={'a': (1.0, -1.25, 0.75), 's': (1.0, 0.05, 0.3)})

# ── 두 감람나무 (11:4) — 흙 둔덕 위, 비틀린 줄기와 은록빛 잎 ──
def olives():
    begin(4)
    paint(blob((0, 0, 0), (0.85, 0.48, 0.09), n=30, jitter=0.1), shade(lin(0x8a7550), lin(0x6e5c3e), k=0.12))
    for x in (-0.4, 0.4):
        tr = crs([(x, 0, 0.0), (x + 0.06, 0.04, 0.22), (x - 0.04, -0.03, 0.42), (x + 0.02, 0.0, 0.58)], 7)
        paint(loft(tr, [0.09, 0.08, 0.07, 0.062, 0.058, 0.052, 0.05], sides=6, wob=0.3), shade(lin(0x7a6650), lin(0x5e4c38), k=0.18))
        for s in (-1, 1):
            br = crs([tr[5], tr[5] + Vector((0.14 * s, 0.05 * s, 0.1)), tr[5] + Vector((0.24 * s, 0.02, 0.22))], 4)
            paint(loft(br, [0.035, 0.028, 0.02, 0.015], sides=5, wob=0.2), solid(lin(0x6a5842), 0.12))
        part(f'crown{int(x > 0)}', loc=(x, 0, 0.6))   # 바람에 흔들리는 잎
        clumps = []
        for k in range(7):
            a = k / 7 * 2 * math.pi; c = Vector((x + math.cos(a) * 0.2, math.sin(a) * 0.14, 0.78 + (random.random() - 0.3) * 0.14))
            paint(blob(c, (0.19, 0.17, 0.13), n=16, jitter=0.25), shade(lin(0x9aae78), lin(0x75895a), lin(0x566a40), k=0.14)); clumps.append((c, (0.19, 0.17, 0.13)))
        paint(blob(Vector((x, 0, 0.9)), (0.2, 0.18, 0.14), n=16, jitter=0.25), shade(lin(0x9aae78), lin(0x75895a), k=0.14))
        for k in range(36):   # 감람 열매 — 잎 덩어리 바깥 아래쪽에 주렁주렁 (익은 것은 검보라, 덜 익은 것은 연두)
            c, r = random.choice(clumps); a_ = math.atan2(c.y, c.x - x) + (random.random() - 0.5) * 1.6
            d = Vector((math.cos(a_), math.sin(a_), -0.2 - random.random() * 0.9)).normalized()
            p = c + Vector((d.x * r[0], d.y * r[1], d.z * r[2])) * 1.04
            paint(blob(p, (0.03, 0.03, 0.038), n=8, jitter=0.0), solid(lin(0x3a2a44) if k % 4 else lin(0x8a9a3a), 0.12))
        base()
    finish('olives', OUT)

# ── 포도주 틀 (14:19~20) — 팔각 돌확, 누르는 들보, 흘러나오는 붉은 즙 ──
def winepress():
    begin(19)
    STN, STN_S = lin(0xa39a8c), lin(0x857c6e)
    paint(loft([(0, 0, 0), (0, 0, 0.3)], [0.5, 0.47], sides=8, wob=0.03), shade(STN, STN_S, k=0.12))
    paint(loft([(0, 0, 0.3), (0, 0, 0.312)], [0.41, 0.41], sides=8, wob=0.0), solid(lin(0x5b1030), 0.08))
    part('grapes', loc=(0, 0, 0.31))   # 눌리면 납작해진다
    for k in range(34):   # 수북한 포도송이
        a = random.random() * 2 * math.pi; r = random.random() ** 0.7 * 0.3; z = 0.34 + (0.3 - r) * 0.5 + random.random() * 0.03
        paint(blob((math.cos(a) * r, math.sin(a) * r, z), (0.045, 0.045, 0.045), n=10, jitter=0.1), solid(lin(0x5a2f7a) if k % 3 else lin(0x40235e), 0.15))
    base()
    for s in (-1, 1):
        paint(hull([Vector((0.58 * s + x, y, z)) for x in (-0.045, 0.045) for y in (-0.05, 0.05) for z in (0, 0.98)]), shade(WOOD, WOOD_D, k=0.12))
    paint(hull([Vector((x, y, z)) for x in (-0.66, 0.66) for y in (-0.06, 0.06) for z in (0.9, 0.99)]), shade(WOOD, WOOD_D, k=0.12))
    part('press', loc=(0, 0, 0.62))   # 오르내리며 짠다 — 나사 기둥은 들보를 뚫고 위로 길게
    paint(cyl((0, 0, 1.12), (0, 0, 0.62), 0.035, sides=6), solid(WOOD_D, 0.1))
    paint(loft([(0, 0, 0.56), (0, 0, 0.62)], [0.3, 0.29], sides=8, wob=0.02), shade(WOOD, WOOD_D, k=0.1))
    base()
    # 앞으로 난 홈과 즙을 받는 작은 확
    paint(hull([Vector((x, y, z)) for x in (-0.05, 0.05) for y in (-0.5, -0.66) for z in (0.2, 0.26)]), shade(STN, STN_S))
    paint(hull([Vector((x, y, z)) for x in (-0.03, 0.03) for y in (-0.5, -0.66) for z in (0.26, 0.268)]), solid(lin(0x7a1430), 0.06))
    paint(loft([(0, -0.8, 0), (0, -0.8, 0.14)], [0.14, 0.13], sides=8, wob=0.04), shade(STN, STN_S, k=0.1))
    paint(loft([(0, -0.8, 0.12), (0, -0.8, 0.13)], [0.11, 0.11], sides=8, wob=0), solid(lin(0x6e0e28), 0.06))
    lip = Vector((0, -0.665, 0.262))
    for k in range(4):   # 홈 끝에서 떨어지는 포도주 방울 — 게임에서 떨어뜨린다
        part(f'drop{k}', loc=lip)
        paint(blob(lip, (0.024, 0.024, 0.032), n=8, jitter=0), solid(lin(0x8a1238), 0.05))
    finish('winepress', OUT)

# ── 보좌를 두른 무지개 (4:3) — 녹보석 같은 무지개, 두 발치에 녹보석 결정 ──
def rainbow():
    begin(3)
    greens = [lin(0x0e7a4a), lin(0x1f9c62), lin(0x46bd84), lin(0x8edbb2)]
    for i, gcol in enumerate(greens):
        R = 0.9 - i * 0.075
        part(f'band{i}', loc=(0, 0, 0.05))   # 띠마다 빛이 흐른다
        path = [Vector((math.cos(t) * R, 0, math.sin(t) * R + 0.05)) for t in [k / 22 * math.pi for k in range(23)]]
        paint(loft(path, 0.052, sides=5, ell=(1.0, 1.0), wob=0.05, up=Vector((0, 1, 0))), solid(gcol, 0.08))
    base()
    for s in (-1, 1):
        for k in range(5):
            b = Vector((0.79 * s + (random.random() - 0.5) * 0.2, (random.random() - 0.5) * 0.18, 0))
            d = Vector(((random.random() - 0.5) * 0.7 + 0.2 * -s, (random.random() - 0.5) * 0.6, 1)).normalized(); L = 0.26 + random.random() * 0.22; r = 0.06 + random.random() * 0.04
            paint(loft([b, b + d * L * 0.75], [r, r], sides=6, cap1=False, wob=0), shade(lin(0x2fb87a), lin(0x138a55), k=0.2))
            paint(cone(b + d * L * 0.75, b + d * L * 1.15, r, 6), solid(lin(0x5fd49e), 0.15))
    finish('rainbow', OUT)

# ── 큰 맷돌 (18:21) — 바다에 던져져 물보라를 일으키는 큰 맷돌 ──
def millstone():
    begin(18)
    def water(p, n):
        return jit(lin(0x9fd3ef) if random.random() < 0.18 else lin(0x3f86b8), 0.1)
    paint(loft([(0, 0, 0), (0, 0, 0.05)], [0.78, 0.76], sides=18, wob=0.04), water)
    part('stone', loc=(0, 0, 0.3), rot=(math.radians(62), 0, 0), local=True)   # 제 축으로 돈다
    def grooves(p, n):
        a = math.atan2(p.y, p.x) + math.pi; return jit(lin(0x9a9284) if int(a / (math.pi / 8)) % 2 else lin(0x847c6e), 0.1)
    annulus(Matrix(), 0.44, 0.08, 0.16, seg=16, fn=grooves)
    paint(cyl((0, 0, 0.0), (0, 0, 0.26), 0.05, sides=6), solid(WOOD_D, 0.1))
    part('splash', loc=(0, 0, 0.04))   # 물보라가 일렁인다
    for k in range(14):   # 물보라
        a = k / 14 * 2 * math.pi + random.random() * 0.3; r = 0.42 + random.random() * 0.12
        b = Vector((math.cos(a) * r * 0.9, math.sin(a) * r * 0.55, 0.04)); d = Vector((math.cos(a) * 0.5, math.sin(a) * 0.3, 1)).normalized()
        paint(cone(b, b + d * (0.1 + random.random() * 0.16), 0.03, 4), solid(lin(0xe6f6ff), 0.06))
    for k in range(10):
        a = random.random() * 2 * math.pi; c = Vector((math.cos(a) * 0.5, math.sin(a) * 0.35, 0.25 + random.random() * 0.2))
        paint(blob(c, (0.018, 0.018, 0.018), n=6, jitter=0), solid(lin(0xe6f6ff), 0.05))
    finish('millstone', OUT)

ALL = [whitestone, palm, morningstar, harp, menorah, olives, winepress, rainbow, millstone]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
