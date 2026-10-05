# 만국의 특산물 — 70 나라마다 하나 (2026-10-05 사용자: 나라마다 다른 예물, 70개 따로)
# 「사람들이 만국의 영광과 존귀를 가지고 그리로 들어가겠고」(계 21:26). 목록·근거는 game.js NJ_GOODS · docs/새-예루살렘.md
# 무기 여섯은 🕊️ 평화의 모습도(gd_<번호>p) — 「칼을 쳐서 보습을, 창을 쳐서 낫을」(사 2:4) · 「활을 꺾고 … 수레를 불사르시는도다」(시 46:9)
# 크기 0.5~0.75(예물과 비슷). 포장(꾸러미·궤·수레)은 따로(goods_pack.py) — 게임이 이 모델을 그 위에 하나·셋·여럿 얹는다
# 실행: blender -b -P goods.py -- <출력 폴더> [번호 …]   (예: 0 3 3p)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector, Matrix, Euler
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])
V = Vector

GOLD, GOLD_D = lin(0xe0b545), lin(0xb88a2a)
SILVER, SILVER_D = lin(0xd9dde2), lin(0xa9b0b8)
BRONZE, BRONZE_D = lin(0xc58a4a), lin(0x93622e)
WOOD, WOOD_D = lin(0x8a5a30), lin(0x5e3c1e)
LEATHER, LEATHER_D = lin(0x9a6438), lin(0x6e4422)
CLAY, CLAY_D = lin(0xc4784a), lin(0x9c5a34)
LINEN = lin(0xf2ead8)
ROPE = lin(0xc9b083)

def box(c, sx, sy, sz, rz=0.0, rx=0.0):
    """가운데 c, 크기(전체) sx·sy·sz, z축으로 rz 돌린 상자"""
    c = V(c); R = Euler((rx, 0, rz)).to_matrix()
    return hull([c + R @ V((x * sx / 2, y * sy / 2, z * sz / 2)) for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)])

def disc(c, r, h, sides=12):
    c = V(c); return cyl(c, c + V((0, 0, h)), r, r, sides=sides)

def flower(p, col, r=0.045):
    paint(blob(p, (r, r, r * 0.6), n=14, jitter=0.25), solid(col, 0.12))
    paint(blob(p + V((0, 0, r * 0.4)), (r * 0.4, r * 0.4, r * 0.3), n=8), solid(lin(0xf5d24a), 0.08))

# ── 0 엘람 · 화살통 (사 22:6 「엘람은 화살통을 메었고」) ──
def quiver(peace=False):
    begin(100)
    ax0, ax1 = V((0, 0, 0.02)), V((0.08, 0, 0.5))
    paint(loft([ax0, ax0.lerp(ax1, 0.5), ax1], [0.085, 0.095, 0.09], sides=10, wob=0.03), shade(LEATHER, LEATHER_D, k=0.08))
    for t in (0.2, 0.75):   # 놋쇠 띠
        p = ax0.lerp(ax1, t); paint(loft([p, p + (ax1 - ax0).normalized() * 0.03], [0.1, 0.1], sides=10, wob=0), solid(BRONZE, 0.05), METAL)
    strap = crs([ax0 + V((-0.09, 0, 0.08)), V((-0.16, 0, 0.3)), ax1 + V((-0.1, 0, 0.0))], 8)
    paint(loft(strap, 0.014, sides=4, wob=0), solid(LEATHER_D, 0.05))
    paint(hull([V((x, y, z)) for x in (-0.2, 0.2) for y in (-0.16, 0.16) for z in (0, 0.02)]), shade(lin(0x7a6a52), lin(0x5f513e)))   # 받침 깔개
    top = ax1
    for k in range(7):
        a = k / 7 * 2 * math.pi; o = V((math.cos(a) * 0.045, math.sin(a) * 0.045, 0))
        tip = top + o * 1.6 + V((0.02 + random.random() * 0.03, 0, 0.16 + random.random() * 0.06))
        if peace:   # 🕊️ 화살 대신 꽃 — 꽃을 꽂은 화살통
            paint(loft([top + o, tip], 0.006, sides=4, wob=0), solid(lin(0x4f9a3a), 0.1))
            flower(tip, [lin(0xf28aa0), lin(0xffffff), lin(0xb58ae0), lin(0xf5a25a)][k % 4])
            for s in (-1, 1): paint(hull([tip - V((0, 0, 0.07)), tip - V((0, 0, 0.05)) + V((0.04 * s, 0.01, 0.0)), tip - V((0, 0, 0.09))]), solid(lin(0x5aa244), 0.1))
        else:
            paint(loft([top + o - V((0, 0, 0.05)), tip], 0.006, sides=4, wob=0), solid(lin(0xc9a46a), 0.08))
            d = (tip - top - o).normalized(); sd = d.cross(V((0, 1, 0))).normalized()
            for s in (-1, 1): paint(hull([tip - d * 0.01, tip - d * 0.06, tip - d * 0.06 + sd * 0.025 * s, tip - d * 0.02 + sd * 0.02 * s]), solid(lin(0xe8e1cf), 0.1))
    finish('gd_0p' if peace else 'gd_0', OUT)

# ── 1 앗수르 · 수놓은 옷을 담은 백향목 상자 (겔 27:23-24) ──
def cedarchest():
    begin(101)
    CED, CED_D = lin(0xa0603a), lin(0x7a4426)
    paint(box((0, 0, 0.13), 0.56, 0.36, 0.26), shade(CED, CED_D, k=0.06))
    paint(box((0, 0, 0.13), 0.5, 0.3, 0.27), solid(CED_D, 0.05))
    for x in (-0.28, 0.28): paint(box((x, 0, 0.13), 0.02, 0.37, 0.27), solid(BRONZE, 0.05), METAL)
    paint(box((0, 0.2, 0.39), 0.56, 0.04, 0.32, rx=0.32), shade(CED, CED_D, k=0.06))   # 뒤 경첩에서 위로 열린 뚜껑(10/5: 앞에서 판자처럼 가렸다)
    for x in (-0.2, 0.2): paint(box((x, 0.185, 0.27), 0.04, 0.03, 0.03), solid(BRONZE, 0.05), METAL)   # 경첩
    cols = [lin(0x2a4fa0), lin(0xb03a3a), lin(0xe0b545), lin(0x6a3a8a)]
    for k, c in enumerate(cols):   # 접은 옷 네 겹 — 청색·홍색·금실·자색
        z = 0.24 + k * 0.035; paint(box((0.0 + (k % 2) * 0.02, 0.02, z), 0.46 - k * 0.03, 0.24, 0.032), solid(c, 0.05))
        paint(box((0.0, 0.02, z + 0.017), 0.4 - k * 0.03, 0.03, 0.004), solid(lin(0xf2d36a), 0.05), METAL)   # 수놓은 줄
    rope = [V((math.cos(a) * 0.3, math.sin(a) * 0.2, 0.14)) for a in [k / 16 * 2 * math.pi for k in range(16)]]
    paint(loft(rope, 0.012, sides=4, closed=True, wob=0), solid(ROPE, 0.06))
    finish('gd_1', OUT)

# ── 2 아르박삿 · 시날 땅 벽돌 (창 11:3) ──
def bricks():
    begin(102)
    B = lin(0xb8653c)
    for lay in range(4):
        for i in range(3 - (lay % 2)):
            for j in range(2):
                x = (i - (1 if lay % 2 == 0 else 0.5)) * 0.19; y = (j - 0.5) * 0.11
                paint(box((x, y, 0.035 + lay * 0.065), 0.18, 0.1, 0.06, rz=(random.random() - 0.5) * 0.06), shade(jit(B, 0.15), jit(lin(0x96502e), 0.15), k=0.05))
    paint(loft([V((0.32, 0.12, 0)), V((0.32, 0.12, 0.08)), V((0.32, 0.12, 0.13))], [0.07, 0.08, 0.06], sides=10, wob=0.04), shade(lin(0x2a2420), lin(0x1a1614)))   # 역청 단지
    paint(blob((0.32, 0.12, 0.13), (0.055, 0.055, 0.02), n=12), solid(lin(0x0c0a08), 0.05))
    for k in range(3):   # 흘러내린 역청
        a = 0.6 + k * 1.9
        paint(loft([V((0.32 + math.cos(a) * 0.075, 0.12 + math.sin(a) * 0.075, 0.12)), V((0.32 + math.cos(a) * 0.082, 0.12 + math.sin(a) * 0.082, 0.07 - k * 0.015))], [0.012, 0.007], sides=5, wob=0), solid(lin(0x0c0a08), 0.05))
    paint(loft([V((0.31, 0.13, 0.1)), V((0.24, 0.2, 0.3))], 0.008, sides=4, wob=0), solid(WOOD, 0.05))   # 나무 주걱 — 역청을 바르는
    paint(box((0.325, 0.115, 0.12), 0.04, 0.008, 0.05, rz=0.8), solid(lin(0x1a1410), 0.05))
    finish('gd_2', OUT)

# ── 3 룻 · 투구 (겔 27:10) — 🕊️ 투구 화분 ──
def helmet(peace=False):
    begin(103)
    up = not peace
    if up:
        paint(blob((0, 0, 0.18), (0.17, 0.2, 0.17), n=40, jitter=0.03), shade(BRONZE, BRONZE_D, k=0.06), METAL)
        paint(box((0, 0, 0.01), 0.2, 0.24, 0.03), solid(lin(0x3a2a1a), 0.05))
        for s in (-1, 1): paint(hull([V((0.15 * s, -0.04, 0.17)), V((0.17 * s, 0.1, 0.17)), V((0.16 * s, 0.09, 0.02)), V((0.14 * s, -0.03, 0.04))]), solid(BRONZE_D, 0.05), METAL)   # 볼 가리개
        crest = crs([V((0, -0.2, 0.3)), V((0, -0.05, 0.42)), V((0, 0.12, 0.4)), V((0, 0.24, 0.3))], 10)
        paint(loft(crest, [0.03, 0.05, 0.055, 0.05, 0.05, 0.05, 0.045, 0.04, 0.03, 0.02], sides=6, ell=(0.4, 1)), solid(lin(0xb02a2a), 0.12))   # 붉은 깃
        paint(box((0, 0, 0.0), 0.36, 0.36, 0.0), solid(BRONZE, 0.05))
    else:   # 투구를 뒤집어(정수리가 아래) 속을 흙으로 채우고 꽃을 심었다 — 속이 빈 그릇이라 테두리 안쪽으로 흙이 보인다(10/5 사용자: 흙이 아니라 투구처럼 보였다)
        prof = [(0.0, 0.03), (0.03, 0.09), (0.09, 0.14), (0.17, 0.165), (0.25, 0.175), (0.27, 0.18)]   # (높이, 반지름) — 정수리에서 테두리까지
        # 위가 뚫린 그릇으로 빚었더니 면 방향이 뒤집혀 겉이 빛을 못 받았다(10/5 사용자) — 닫힌 그릇으로, 윗면(뚜껑 자리)은 흙빛
        # 겉은 투구(위)와 같은 청동 · 잘게 깎은 면 — 연한 단색에 면이 16개뿐이라 칠한 그릇 같았다(10/5 사용자: 투구는 반짝이는데 화분은 색칠된 느낌)
        prof = [(z, r) for z, r in [(0.0, 0.03), (0.015, 0.065), (0.03, 0.09), (0.06, 0.118), (0.09, 0.14), (0.13, 0.156), (0.17, 0.165), (0.21, 0.171), (0.25, 0.175), (0.27, 0.18)]]
        #   잘게 깎으니 오히려 매끈한 질그릇이 됐다 — 투구처럼 큰 두드린 면 + 빛 쪽 면에 밝은 하이라이트를 칠해 둔다
        prof = prof[::2] + [prof[-1]]
        LD = V((1, -1.4, 2)).normalized()   # 미리보기·게임 해 방향(three (1, 2, 1.4))
        BR_HI, BR_MID, BR_LO, BR_DK = lin(0xf0b440), lin(0xc8822e), lin(0x9a5c22), lin(0x5e3614)   # 짙고 채도 높은 청동 — 연한 색은 질그릇 같았다
        def brz(p_, n):
            if n.z > 0.9: return jit(lin(0x4a3220), 0.08)
            s = 0.25 * n.z + (random.random() - 0.35) * 0.9   # 빛 방향에 묶지 않고(뒤로 돌면 반쪽이 통째로 어두웠다) 면마다 제각각 · 아래쪽도 너무 어둡지 않게(10/5 사용자: 밑이 반짝임을 먹었다)
            return jit(lin(0xffd870) if s > 0.5 else BR_HI if s > 0.25 else BR_MID if s > -0.05 else BR_LO, 0.08)
        paint(loft([V((0, 0, z)) for z, _ in prof], [r for _, r in prof], sides=13, ell=(1.0, 1.15), wob=0.08), brz, METAL)
        paint(loft([V((0, 0, 0.268)), V((0, 0, 0.292))], [0.183, 0.19], sides=13, ell=(1.0, 1.15), wob=0), lambda p_, n: jit(lin(0xffe08a) if n.dot(LD) > 0.3 else GOLD, 0.05), METAL)   # 테두리 — 흙보다 조금 높이, 금테
        paint(blob((0, 0, 0.274), (0.162, 0.186, 0.032), n=40, jitter=0.06), solid(lin(0x2e1c10), 0.15))   # 흙 — 테두리 안에 볼록하게, 짙게(10/5 사용자: 투구와 색 차이가 없었다)
        for k in range(10):
            a = random.random() * 6.28; r0 = random.random() * 0.12
            paint(blob((math.cos(a) * r0, math.sin(a) * r0 * 1.1, 0.27 + 0.034 * (1 - (r0 / 0.17) ** 2) ** 0.5), (0.018, 0.016, 0.008), n=8, jitter=0.4), solid(lin(0x3a2616), 0.12))   # 흙덩이
        for sgn in (-1, 1): paint(hull([V((0.16 * sgn, -0.02, 0.27)), V((0.18 * sgn, 0.12, 0.27)), V((0.17 * sgn, 0.1, 0.4)), V((0.15 * sgn, -0.01, 0.37))]), lambda p_, n: jit(BR_HI if random.random() > 0.5 else BR_MID, 0.08), METAL)   # 위로 선 볼 가리개 — 몸통과 같은 청동(칙칙한 갈색이었다)
        paint(loft([V((0, 0, 0)), V((0, 0, 0.03))], [0.06, 0.08], sides=12, wob=0), solid(lin(0xb02a2a), 0.1))   # 아래로 간 붉은 깃 — 받침이 됐다
        for k in range(6):
            a = k / 6 * 2 * math.pi; p = V((math.cos(a) * 0.07, math.sin(a) * 0.08, 0.295)); tip = p + V((math.cos(a) * 0.06, math.sin(a) * 0.06, 0.16 + random.random() * 0.06))
            paint(loft([p, tip], 0.006, sides=4, wob=0), solid(lin(0x4f9a3a), 0.1)); flower(tip, [lin(0xf28aa0), lin(0xffffff), lin(0xf5d24a)][k % 3])
        for k in range(5):
            a = k / 5 * 6.28 + 0.3
            paint(blob((math.cos(a) * 0.06, math.sin(a) * 0.06, 0.31), (0.05, 0.03, 0.02), n=10, jitter=0.3), solid(lin(0x5aa244), 0.12))   # 잎
    finish('gd_3p' if peace else 'gd_3', OUT)

# ── 4 아람 · 홍보석과 산호 (겔 27:16) ──
def rubycoral():
    begin(104)
    paint(loft([V((0, 0, 0)), V((0, 0, 0.04)), V((0, 0, 0.07))], [0.18, 0.28, 0.3], sides=14, wob=0.02), shade(SILVER, SILVER_D, k=0.05), METAL)
    for k in range(5):   # 산호 가지
        a = k / 5 * 2 * math.pi; b = V((math.cos(a) * 0.12, math.sin(a) * 0.12, 0.06))
        pts = crs([b, b + V((math.cos(a) * 0.04, math.sin(a) * 0.04, 0.12)), b + V((math.cos(a) * 0.02, math.sin(a) * 0.08, 0.24))], 6)
        paint(loft(pts, [0.02, 0.016, 0.012, 0.01, 0.008, 0.006], sides=5, wob=0.1), solid(lin(0xf0707a), 0.12))
        for t in (2, 4): paint(loft([pts[t], pts[t] + V((math.sin(a) * 0.06, -math.cos(a) * 0.04, 0.06))], 0.008, sides=4, wob=0), solid(lin(0xf28a90), 0.1))
    for k in range(7):   # 홍보석
        a = random.random() * 6.28; r = random.random() * 0.09; p = V((math.cos(a) * r, math.sin(a) * r, 0.1))
        s = 0.035 + random.random() * 0.02
        paint(hull([p + V((s, 0, 0)), p - V((s, 0, 0)), p + V((0, s, 0)), p - V((0, s, 0)), p + V((0, 0, s * 1.2)), p - V((0, 0, s * 0.5))]), solid(lin(0xd0142a), 0.15), GLOW if k == 0 else METAL)
    finish('gd_4', OUT)

# ── 5 우스 · 양털 (욥 31:20) ──
def fleece():
    begin(105)
    for k in range(9):
        a = k * 2.4; r = 0.12 * math.sqrt(k / 9 + 0.1); p = V((math.cos(a) * r, math.sin(a) * r * 0.8, 0.12 + (k % 3) * 0.04))
        paint(blob(p, (0.12, 0.1, 0.09), n=20, jitter=0.3), solid(lin(0xf3eee2), 0.08))
    paint(blob((0, 0, 0.06), (0.24, 0.19, 0.08), n=24, jitter=0.2), solid(lin(0xe8e1d0), 0.08))
    band = [V((math.cos(a) * 0.23, math.sin(a) * 0.18, 0.12)) for a in [k / 14 * 2 * math.pi for k in range(14)]]
    paint(loft(band, 0.015, sides=4, closed=True, wob=0), solid(lin(0x8a3a2a), 0.06))
    finish('gd_5', OUT)

# ── 6 훌 · 헬본 포도주 (겔 27:18) ──
def amphora(p, scale=1.0, col=CLAY, cold=CLAY_D, tilt=0.0):
    p = V(p); up = V((math.sin(tilt), 0, math.cos(tilt)))
    zs = [0, 0.05, 0.16, 0.3, 0.38, 0.44, 0.47]; rs = [0.02, 0.07, 0.11, 0.1, 0.05, 0.04, 0.05]
    paint(loft([p + up * z * scale for z in zs], [r * scale for r in rs], sides=12, wob=0.02), shade(col, cold, k=0.06))
    for s in (-1, 1):
        h = crs([p + up * 0.42 * scale + V((0.035 * s * scale, 0, 0)), p + up * 0.43 * scale + V((0.09 * s * scale, 0, 0)), p + up * 0.32 * scale + V((0.1 * s * scale, 0, 0))], 6)
        paint(loft(h, 0.012 * scale, sides=4, wob=0), solid(cold, 0.06))
def wine():
    begin(106)
    amphora((0, 0, 0)); amphora((0.2, 0.1, 0), 0.8, lin(0xb06a40), lin(0x8a4a2a)); amphora((-0.18, 0.12, 0), 0.7)
    paint(loft([V((0.2, -0.17, 0)), V((0.2, -0.17, 0.03)), V((0.2, -0.17, 0.09))], [0.04, 0.02, 0.06], sides=10, wob=0), shade(SILVER, SILVER_D), METAL)   # 잔
    paint(disc((0.2, -0.17, 0.09), 0.053, 0.004, 14), solid(lin(0x8a1238), 0.04), METAL)   # 잔에 찰랑이는 포도주 — 은 테 안쪽(10/5 사용자: 빈 잔 같았다)
    # 포도송이 둘 — 가지에 달린 채 눕혔다(10/5 사용자: 알만 몇 개 굴러 있었다)
    grapes((-0.2, -0.1, 0), (1, -0.45), lin(0x5b2a86), lin(0x3e1a60))
    grapes((-0.04, -0.27, 0), (1, 0.15), lin(0x7a2458), lin(0x541640))
    finish('gd_6', OUT)

def grapes(base, d, col, col_d, L=0.15):
    """바닥에 누운 포도송이 — base = 꼭지 쪽, d = 송이가 뻗는 방향(x, y). 줄마다 알이 줄어 끝이 뾰족하고 위에 한 겹 더"""
    d = V((d[0], d[1], 0)).normalized(); u = V((-d.y, d.x, 0)); b = V(base); r = 0.015
    for i in range(6):
        t = i / 5; c = b + d * (0.02 + t * L); w = 0.05 * (1 - 0.7 * t)
        m = max(1, round(w * 2 / (r * 1.7)))
        for j in range(m):
            o = (j - (m - 1) / 2) * r * 1.7
            paint(blob(c + u * o + V((0, 0, r)), (r, r, r * 0.95), n=10, jitter=0.05), shade(col, col_d, k=0.08), METAL if (i + j) % 4 == 0 else BASE)
            if j < m - 1 and t < 0.8: paint(blob(c + u * (o + r * 0.85) + d * r * 0.5 + V((0, 0, r * 2.4)), (r, r, r * 0.95), n=10, jitter=0.05), shade(col, col_d, k=0.08))
    stem = crs([b + d * 0.02 + V((0, 0, 0.03)), b - d * 0.03 + V((0, 0, 0.04)), b - d * 0.07 + u * 0.03 + V((0, 0, 0.02))], 6)
    paint(loft(stem, [0.006, 0.006, 0.005, 0.005, 0.004, 0.004], sides=5, wob=0), solid(lin(0x6a4a24), 0.06))   # 꼭지 — 가지
    paint(loft([stem[-1], stem[-1] + u * 0.05 - d * 0.03 + V((0, 0, -0.012))], 0.007, sides=5, wob=0.1), solid(WOOD_D, 0.06))   # 잘라 온 포도나무 가지
    lc = b - d * 0.04 - u * 0.05 + V((0, 0, 0.012))   # 포도잎 — 다섯 갈래 납작한 잎
    pts = [lc]
    for k in range(5):
        a = math.atan2(-u.y, -u.x) + (k - 2) * 0.62; rr = 0.055 if k == 2 else 0.045
        pts += [lc + V((math.cos(a) * rr, math.sin(a) * rr, 0.004)), lc + V((math.cos(a + 0.3) * rr * 0.6, math.sin(a + 0.3) * rr * 0.6, 0.006))]
    paint(hull(pts + [lc + V((0, 0, -0.004))]), shade(lin(0x5aa244), lin(0x3e7a30), k=0.08))

# ── 7 게델 · 석류 ──
def pomegranate(p, s=1.0):
    p = V(p); paint(blob(p, (0.06 * s, 0.06 * s, 0.055 * s), n=22, jitter=0.08), shade(lin(0xc22a2a), lin(0x9a1a1e), k=0.08))
    for k in range(5): a = k / 5 * 6.28; c = p + V((0, 0, 0.055 * s)); paint(cone(c, c + V((math.cos(a) * 0.02 * s, math.sin(a) * 0.02 * s, 0.03 * s)), 0.008 * s, 4), solid(lin(0x8a1a1a), 0.08))
def pomegranates():
    begin(107)
    paint(loft([V((0, 0, 0)), V((0, 0, 0.05)), V((0, 0, 0.11))], [0.15, 0.22, 0.25], sides=14, wob=0.03), shade(lin(0xc9a46a), lin(0xa3803e), k=0.12))   # 바구니
    for k in range(14):   # 엮은 줄
        a = k / 14 * 6.28; paint(loft([V((math.cos(a) * 0.15, math.sin(a) * 0.15, 0.0)), V((math.cos(a) * 0.25, math.sin(a) * 0.25, 0.11))], 0.006, sides=4, wob=0), solid(lin(0x8a6a3a), 0.08))
    spots = [(0, 0, 0.16), (0.1, 0.03, 0.15), (-0.09, 0.05, 0.15), (0.02, -0.1, 0.15), (-0.04, 0.09, 0.2), (0.06, -0.02, 0.22)]
    for k, sp in enumerate(spots): pomegranate(sp, 1.0 if k < 4 else 0.9)
    # 쪼갠 석류 — 나무 접시 위에 반으로 갈라 속(붉은 알)이 보이게(10/5 사용자: 통째 석류에 알만 얹혀 바구니에서 떨어진 것 같았다)
    q = V((0.26, -0.14, 0)); paint(loft([q, q + V((0, 0, 0.015)), q + V((0, 0, 0.025))], [0.07, 0.1, 0.105], sides=12, wob=0), shade(WOOD, WOOD_D))   # 접시
    SKIN, PITH, SEED = lin(0xc22a2a), lin(0xf0d8b0), lin(0xe0203a)
    for c, d in ((q + V((-0.035, 0.0, 0.08)), V((0, 0, -1))), (q + V((0.05, 0.015, 0.075)), V((0.75, 0.1, -0.65)).normalized())):
        r = 0.052; zs = [0, 0.3, 0.6, 0.85, 1.0]   # 반구 — 자른 면 c, 껍질 쪽으로 d
        paint(loft([c + d * (z * r) for z in zs], [r * math.sqrt(max(0.02, 1 - z * z)) for z in zs], sides=12, wob=0.03),
              lambda p_, n, d=d: jit(PITH, 0.05) if n.dot(-d) > 0.9 else jit(SKIN, 0.06))
        u = d.cross(V((0, 1, 0)) if abs(d.y) < 0.9 else V((1, 0, 0))).normalized(); w = d.cross(u)
        for k in range(14):   # 자른 면 위 붉은 알
            a = k * 2.4; rr = r * 0.72 * math.sqrt((k + 0.5) / 14)
            paint(blob(c - d * 0.006 + u * math.cos(a) * rr + w * math.sin(a) * rr, (0.009, 0.009, 0.009), n=8), solid(SEED, 0.1), GLOW if k % 5 == 0 else BASE)
    finish('gd_7', OUT)

# ── 8 마스 · 산꿀 ──
def honey():
    begin(108)
    HC, HC_D = lin(0xe8a830), lin(0xc0861a)
    for i in range(4):   # 벌집 조각 — 육각 칸
        for j in range(3):
            x = (i - 1.5) * 0.06 + (0.03 if j % 2 else 0); z = 0.05 + j * 0.052
            c = V((x - 0.08, 0, z)); paint(loft([c - V((0, 0.05, 0)), c + V((0, 0.05, 0))], [0.032, 0.032], sides=6, wob=0, up=V((0, 0, 1))), shade(HC, HC_D, k=0.08), GLOW if (i + j) % 5 == 0 else BASE)
    paint(loft([V((0.18, 0.02, 0)), V((0.18, 0.02, 0.06)), V((0.18, 0.02, 0.18)), V((0.18, 0.02, 0.22))], [0.07, 0.1, 0.08, 0.07], sides=12, wob=0.03), shade(CLAY, CLAY_D))   # 꿀 단지
    paint(disc((0.18, 0.02, 0.215), 0.065, 0.01, 12), solid(HC, 0.05))
    paint(loft([V((0.18, 0.02, 0.2)), V((0.25, 0.08, 0.34))], 0.008, sides=4, wob=0), solid(WOOD, 0.05))   # 꿀 뜨개
    paint(blob((0.18, 0.02, 0.215), (0.02, 0.02, 0.012), n=8), solid(HC, 0.05))
    paint(box((0, 0, 0.01), 0.6, 0.26, 0.02), shade(lin(0x7a6a52), lin(0x5f513e)))   # 받침 깔개
    finish('gd_8', OUT)

# ── 9 셀라 · 쐐기문자 토판 ──
#    쐐기 = 갈대 끝을 눌러 찍은 자국: 넓은 머리(세모)에 가는 꼬리. 세로(머리 위·꼬리 아래) · 가로(머리 왼쪽·꼬리 오른쪽) · 꺾쇠(〈) 세 가지를 줄마다 섞는다.
#    판에 눌려 들어간 자국이라 짙게, 겉면 바로 앞에 얇게(10/5 사용자: 아래로 향한 세모 하나뿐 · 박힌 쪽이 반대)
def wedge(o, R, kind, sz, col):
    f = lambda x, z, d=-0.0215: o + R @ V((x, d, z))
    if kind == 'v':   head = [(-sz, 0), (sz, 0), (0, -sz * 1.1)]; tail = [(-sz * 0.18, -sz * 0.9), (sz * 0.18, -sz * 0.9), (0, -sz * 2.6)]
    elif kind == 'h': head = [(0, sz), (0, -sz), (sz * 1.1, 0)]; tail = [(sz * 0.9, sz * 0.18), (sz * 0.9, -sz * 0.18), (sz * 2.6, 0)]
    else:             head = [(0, 0), (sz * 1.4, sz * 0.9), (sz * 1.4, -sz * 0.9)]; tail = []
    for tri in (head, tail):
        if not tri: continue
        paint(hull([f(x, z) for x, z in tri] + [f(x, z, -0.0235) for x, z in tri]), solid(col, 0.08))
def tablets():
    begin(109)
    T, T_D, MARK = lin(0xc79a6a), lin(0xa07a4e), lin(0x5a3a22)
    paint(box((0, 0.04, 0.02), 0.5, 0.22, 0.04), shade(WOOD, WOOD_D))   # 받침
    paint(box((0, 0.11, 0.12), 0.5, 0.03, 0.16), shade(WOOD, WOOD_D))     # 기댐목 — 윗모서리 (y 0.095, z 0.2)
    random.seed(9)
    # 토판 윗부분이 뒤(기댐목 쪽)로 눕게 — 전엔 앞으로 넘어가는 쪽으로 돌아 있었다(10/5 사용자). 뒷면이 기댐목 윗모서리에 닿게 놓는다
    for k, (x, tilt, h) in enumerate([(-0.155, 0.24, 0.24), (0.0, 0.18, 0.27), (0.155, 0.28, 0.22)]):
        R = Euler((-tilt, 0, 0)).to_matrix()
        t = (0.2 - 0.04) / math.cos(tilt); B = V((x, 0.095 - t * math.sin(tilt), 0.04))   # 뒤 밑모서리
        c = B - R @ V((0, 0.02, -h / 2))
        paint(box(c, 0.13, 0.04, h, rx=-tilt), shade(T, T_D, k=0.06))
        rows = int(h / 0.034)
        for rr in range(rows):
            z = h / 2 - 0.02 - rr * 0.034; xx = -0.05
            while xx < 0.05:
                kind = random.choice('vvhhw'); sz = 0.0075 + random.random() * 0.003
                wedge(c + R @ V((xx, 0, z)), R, kind, sz, MARK)
                xx += sz * (2.2 if kind == 'v' else 3.4 if kind == 'h' else 2.0) + 0.005
            paint(box(c + R @ V((0, -0.021, z - 0.017)), 0.11, 0.003, 0.002, rx=-tilt), solid(T_D, 0.05))   # 줄 긋개
    finish('gd_9', OUT)

# ── 10 에벨 · 나그네의 장막 (히 11:9) ──
def tent():
    begin(110)
    TC = lin(0x3a3230)
    paint(hull([V((-0.32, -0.22, 0)), V((0.32, -0.22, 0)), V((-0.32, 0.22, 0)), V((0.32, 0.22, 0)), V((-0.32, 0, 0.36)), V((0.32, 0, 0.36))]), shade(lin(0x4a403a), TC, k=0.1))
    # 지주대 — 양 끝 마룻대 바로 밖에 땅에서 곧게 서서 마룻대를 받친다. 줄은 두 갈래로 벌려 말뚝에(10/5 사용자: 박힌 자리가 어설펐다 — 비탈진 벽에 반쯤 묻혀 있었다)
    for s in (-1, 1):
        top = V((0.335 * s, 0, 0.43))   # 끝벽을 곧게 세우고 그 바로 밖
        paint(cyl((0.335 * s, 0, 0), top, 0.013, sides=6), solid(WOOD, 0.05))
        paint(blob(top, (0.016, 0.016, 0.012), n=8), solid(WOOD_D, 0.05))   # 꼭대기 매듭
        for sy in (-1, 1):
            peg = V((0.47 * s, 0.16 * sy, 0))
            paint(loft([top, peg + V((0, 0, 0.035))], 0.004, sides=3, wob=0), solid(ROPE, 0.05))
            paint(cone(peg, peg + V((0, 0, 0.045)), 0.01, 4), solid(WOOD_D))
    # 문 — 긴 쪽(앞) 비탈에 걷어 올린 휘장 자리. 비탈면 위로 살짝 띄운다
    sl = lambda x, t: V((x, -0.22 + 0.22 * t - 0.004, 0.36 * t + 0.002))
    paint(hull([sl(-0.08, 0.01), sl(0.08, 0.01), sl(-0.05, 0.55), sl(0.05, 0.55)] + [p + V((0, 0.006, 0)) for p in (sl(-0.08, 0.01), sl(0.08, 0.01), sl(-0.05, 0.55), sl(0.05, 0.55))]), solid(lin(0x161210), 0.05))
    for sx in (-1, 1): paint(blob(sl(0.075 * sx, 0.5) + V((0, -0.01, 0)), (0.025, 0.012, 0.018), n=8, jitter=0.2), solid(lin(0x4a403a), 0.08))   # 걷어 맨 휘장
    # 깔개 — 문 앞 땅에 깐 얇은 줄무늬 천(전엔 두꺼운 상자 같았다)
    for k in range(5):
        paint(box((0, -0.3 + (k - 2) * 0.022, 0.003), 0.22, 0.022, 0.006), solid([lin(0xb0402a), lin(0xe0b060), lin(0x2a4a6a), lin(0xe0b060), lin(0xb0402a)][k], 0.05))
    for sx in (-1, 1):
        for k in range(6): paint(box((0.112 * sx, -0.3 + (k - 2.5) * 0.018, 0.002), 0.014, 0.004, 0.003), solid(lin(0xe0d0a0), 0.05))   # 술
    finish('gd_10', OUT)

# ── 11 벨렉 · 경계석 (창 10:25 · 신 19:14) ──
def boundary():
    begin(111)
    ST, ST_D = lin(0xa9a08e), lin(0x857c6a)
    paint(hull([V((x * 0.12 + random.random() * 0.02, y * 0.08, 0)) for x in (-1, 1) for y in (-1, 1)] + [V((x * 0.1, y * 0.07, 0.48)) for x in (-1, 1) for y in (-1, 1)] + [V((0, 0, 0.56))]), shade(ST, ST_D, k=0.08))
    paint(box((0, -0.082, 0.3), 0.18, 0.006, 0.012), solid(lin(0x5a5248), 0.05))   # 새긴 가름줄
    for k in range(3): paint(box((-0.05 + k * 0.05, -0.082, 0.2), 0.01, 0.006, 0.06), solid(lin(0x5a5248), 0.05))
    paint(blob((0, 0, 0.02), (0.26, 0.2, 0.05), n=20, jitter=0.3), solid(lin(0x7a7060), 0.12))
    finish('gd_11', OUT)

# ── 12 욕단 · 낙타 (사 60:6) ──
def camel():
    begin(112)
    C, C_D = lin(0xc9985a), lin(0xa77a40)
    body = crs([V((-0.2, 0, 0.32)), V((0, 0, 0.36)), V((0.18, 0, 0.32))], 6)
    paint(loft(body, [0.08, 0.1, 0.11, 0.1, 0.09, 0.07], sides=8, ell=(0.9, 1.1)), shade(C, C_D, k=0.06))
    paint(blob((0.0, 0, 0.47), (0.08, 0.07, 0.07), n=16), shade(C, C_D))   # 혹
    neck = crs([V((0.22, 0, 0.36)), V((0.3, 0, 0.5)), V((0.33, 0, 0.58))], 6)
    paint(loft(neck, [0.05, 0.045, 0.04, 0.038, 0.035, 0.035], sides=6), shade(C, C_D))
    paint(loft([V((0.32, 0, 0.6)), V((0.41, 0, 0.57))], [0.04, 0.025], sides=6), shade(C, C_D))   # 머리
    for x in (-0.15, 0.13):
        for y in (-0.05, 0.05): paint(loft([V((x, y, 0.28)), V((x + 0.01, y, 0.14)), V((x, y, 0.0))], [0.025, 0.018, 0.016], sides=5, wob=0), shade(C, C_D))
    for s in (-1, 1): paint(box((0.0, 0.1 * s, 0.32), 0.12, 0.05, 0.12), shade(lin(0xb03a3a), lin(0x8a2a2a)))   # 짐 주머니
    paint(box((0, 0, 0.44), 0.16, 0.18, 0.02), solid(lin(0xe0b545), 0.06), METAL)
    finish('gd_12', OUT)

# ── 13 알모닷 · 몰약 ──
def resinsack(resin, resin_d, seed):
    random.seed(seed)
    paint(loft([V((0, 0, 0)), V((0, 0, 0.12)), V((0, 0, 0.22)), V((0, 0, 0.26))], [0.13, 0.15, 0.12, 0.13], sides=10, wob=0.1), shade(lin(0xd8c8a0), lin(0xb8a67e), k=0.1))
    for k in range(12): a = random.random() * 6.28; r = random.random() * 0.1; paint(blob((math.cos(a) * r, math.sin(a) * r, 0.26 + random.random() * 0.03), (0.025, 0.022, 0.02), n=10, jitter=0.4), solid(resin, 0.15), GLOW if k < 2 else BASE)
    for k in range(5): a = random.random() * 6.28; paint(blob((0.22 + math.cos(a) * 0.05, math.sin(a) * 0.05, 0.015), (0.022, 0.02, 0.015), n=10, jitter=0.4), solid(resin_d, 0.15))
def myrrh():
    begin(113); resinsack(lin(0x8a3a1a), lin(0x6a2a10), 113)
    paint(loft([V((-0.2, 0.08, 0)), V((-0.2, 0.08, 0.08)), V((-0.2, 0.08, 0.16))], [0.05, 0.07, 0.04], sides=10, wob=0), shade(lin(0xe8e0d0), lin(0xc8c0b0)))   # 몰약 병
    finish('gd_13', OUT)

# ── 14 셀렙 · 염소털 장막천 (아 1:5) ──
def tentcloth():
    begin(114)
    BK, BK_D = lin(0x2a2422), lin(0x1a1614)
    for k, (y, z) in enumerate([(-0.1, 0.08), (0.1, 0.08), (0.0, 0.22)]):
        p0, p1 = V((-0.28, y, z)), V((0.28, y, z)); paint(loft([p0, p1], [0.08, 0.08], sides=10, wob=0.03), shade(BK, BK_D, k=0.08))
        paint(blob(p1, (0.01, 0.06, 0.06), n=10), solid(lin(0x4a403a), 0.1))   # 말린 끝
        for x in (-0.15, 0.15): paint(loft([V((x, y, z + 0.08)), V((x, y + 0.08, z)), V((x, y, z - 0.08)), V((x, y - 0.08, z))], 0.008, sides=4, closed=True, wob=0), solid(ROPE, 0.06))
        for x in (-0.24, 0.24): paint(loft([V((x, y, z)), V((x + 0.025, y, z))], [0.0805, 0.0805], sides=10, wob=0), solid(lin(0xe8e0cf), 0.06))   # 흰 줄무늬 — 검은 염소털로 짠 장막천(아 1:5)
    paint(blob((0.2, 0.22, 0.03), (0.06, 0.04, 0.03), n=14, jitter=0.4), solid(lin(0x2a2422), 0.1))   # 깎아 둔 털 뭉치
    finish('gd_14', OUT)

# ── 15 하살마웻 · 유향 ──
def frankincense():
    begin(115)
    paint(loft([V((0, 0, 0)), V((0, 0, 0.04)), V((0, 0, 0.08))], [0.16, 0.22, 0.24], sides=12, wob=0.02), shade(SILVER, SILVER_D), METAL)
    for k in range(16): a = random.random() * 6.28; r = random.random() * 0.17; paint(blob((math.cos(a) * r, math.sin(a) * r, 0.09 + random.random() * 0.03), (0.022, 0.018, 0.016), n=10, jitter=0.4), solid(lin(0xf2e6b0), 0.12), GLOW if k < 3 else BASE)
    c = V((0.26, 0.1, 0))   # 향로 — 피어오르는 연기
    paint(loft([c, c + V((0, 0, 0.12)), c + V((0, 0, 0.18)), c + V((0, 0, 0.22))], [0.04, 0.025, 0.07, 0.08], sides=10, wob=0), shade(BRONZE, BRONZE_D), METAL)
    part('smoke', loc=c + V((0, 0, 0.24)))
    for k in range(4): paint(blob(c + V((math.sin(k) * 0.02, 0, 0.26 + k * 0.06)), (0.03 + k * 0.01, 0.03 + k * 0.01, 0.025), n=12, jitter=0.3), solid(lin(0xeeeeee), 0.05), GLOW)
    finish('gd_15', OUT)

def flat_crescent(c, R, th):
    """초승달 금판 — 반지름 R 원에서 위로 0.45R 어긋난 원을 도려낸 모양(뿔이 위로). x–z 평면, 두께 th(y)"""
    import bmesh
    n = 18; off = R * 0.45; r2 = R * 0.92
    # 바깥 원과 안쪽(도려낸) 원이 만나는 높이 yc — 두 원 교점. 뿔끝이 그 점(전엔 어림각이라 안쪽 호가 뿔 위로 넘어가 판이 접혔다 — 10/5)
    yc = (R * R - r2 * r2 + off * off) / (2 * off); xc = math.sqrt(max(0.0, R * R - yc * yc))
    ao = math.atan2(yc, xc); ai = math.atan2(yc - off, xc)   # 교점의 바깥 원 각 · 안쪽 원 각
    outer, inner = [], []
    for i in range(n + 1):   # 바깥 호: 왼뿔에서 아래를 지나 오른뿔까지
        a = (math.pi - ao) + i * ((math.pi + 2 * ao) / n); outer.append((math.cos(a) * R, math.sin(a) * R))
    e = math.radians(4)   # 뿔끝이 한 점으로 모이지 않게 안쪽 호를 조금 짧게
    for i in range(n + 1):   # 안쪽 호: 오른뿔에서 아래를 지나 왼뿔로 되돌아온다
        a = (2 * math.pi + ai - e) - i * ((math.pi + 2 * ai - 2 * e) / n); inner.append((math.cos(a) * r2, math.sin(a) * r2 + off))
    poly = outer + inner
    bm = S.bm
    fr = [bm.verts.new(c + V((x, -th / 2, z))) for x, z in poly]
    bk = [bm.verts.new(c + V((x, th / 2, z))) for x, z in poly]
    m = len(poly); faces = []
    # 앞·뒷면 = 바깥 호 i 와 안쪽 호 n-i 를 잇는 사각 띠(오목한 n각형 한 장은 삼각형이 엇갈려 줄무늬가 났다 — 10/5)
    for i in range(n):
        a, b, c2, d = i, i + 1, m - 1 - (i + 1), m - 1 - i
        faces.append(bm.faces.new((fr[a], fr[b], fr[c2], fr[d])))
        faces.append(bm.faces.new((bk[d], bk[c2], bk[b], bk[a])))
    for i in range(m): faces.append(bm.faces.new((fr[i], fr[(i + 1) % m], bk[(i + 1) % m], bk[i])))
    bmesh.ops.recalc_face_normals(bm, faces=faces)
    paint(faces, solid(lin(0xf6d264), 0.04), METAL)

# ── 16 예라 · 초승달 장식 (이름 뜻 「달」 · 삿 8:21) — 걸이대에 줄로 매단 금 초승달 셋(10/5: 방석에 누워 바나나처럼 보였다) ──
def crescents():
    begin(116)
    paint(box((0, 0, 0.02), 0.5, 0.2, 0.04), shade(lin(0x5a2a6a), lin(0x3a1a4a)))   # 자줏빛 받침
    for x in (-0.22, 0.22): paint(cyl((x, 0, 0.04), (x, 0, 0.46), 0.014, sides=6), solid(WOOD_D, 0.05))
    paint(cyl((-0.24, 0, 0.45), (0.24, 0, 0.45), 0.014, sides=6), solid(WOOD_D, 0.05))
    for x in (-0.24, 0.24): paint(blob((x, 0, 0.45), (0.022, 0.022, 0.022), n=8), solid(GOLD, 0.05), METAL)
    for k in range(3):
        cx = (k - 1) * 0.14; R = 0.076 if k == 1 else 0.058; cz = 0.24 if k == 1 else 0.27
        paint(loft([V((cx, 0, 0.45)), V((cx, 0, cz - R * 0.45))], 0.003, sides=3, wob=0), solid(GOLD_D, 0.05), METAL)   # 줄
        # 초승달 — 아래가 둥글고 두 뿔이 위로(정면에서 보이게 x–z 평면). 가운데가 두툼하고 뿔끝은 가늘다
        flat_crescent(V((cx, 0, cz)), R, 0.012)   # 납작한 금판 — 둥근 관으로 빚었더니 여전히 바나나 같았다(10/5)
        paint(blob((cx, 0, cz - R * 0.95), (0.012, 0.012, 0.012), n=8), solid(lin(0xd0142a), 0.05), METAL)   # 아래 붉은 구슬
    finish('gd_16', OUT)

# ── 17 하도람 · 금·은·놋 그릇 (대상 18:10) ──
def vessels():
    begin(117)
    paint(loft([V((-0.18, 0, 0)), V((-0.18, 0, 0.04)), V((-0.18, 0, 0.11))], [0.06, 0.1, 0.13], sides=14, wob=0), shade(GOLD, GOLD_D), METAL)   # 금 대접
    paint(loft([V((0.02, 0.06, 0)), V((0.02, 0.06, 0.04)), V((0.02, 0.06, 0.12)), V((0.02, 0.06, 0.2))], [0.05, 0.02, 0.05, 0.07], sides=12, wob=0), shade(SILVER, SILVER_D), METAL)   # 은 잔
    p = V((0.2, -0.04, 0))   # 놋 주전자
    paint(loft([p, p + V((0, 0, 0.05)), p + V((0, 0, 0.18)), p + V((0, 0, 0.27)), p + V((0, 0, 0.31))], [0.05, 0.1, 0.09, 0.04, 0.05], sides=12, wob=0), shade(BRONZE, BRONZE_D), METAL)
    paint(loft([p + V((0.07, 0, 0.2)), p + V((0.15, 0, 0.29))], [0.02, 0.012], sides=6, wob=0), solid(BRONZE_D, 0.05), METAL)
    paint(loft(crs([p + V((-0.05, 0, 0.27)), p + V((-0.13, 0, 0.22)), p + V((-0.08, 0, 0.1))], 6), 0.012, sides=4, wob=0), solid(BRONZE_D, 0.05), METAL)
    finish('gd_17', OUT)

# ── 18 우살 · 철과 계피와 창포 (겔 27:19) ──
def ironspice():
    begin(118)
    IR, IR_D = lin(0x5a5a62), lin(0x3a3a42)
    for k in range(4): paint(box((-0.15 + (k % 2) * 0.12, -0.05 + (k // 2) * 0.0, 0.03 + (k // 2) * 0.06), 0.11, 0.06, 0.05, rz=0.1 * k), shade(IR, IR_D), METAL)   # 쇠막대
    for k in range(7):   # 계피 다발
        a = k / 7 * 6.28; o = V((0.12 + math.cos(a) * 0.03, 0.06 + math.sin(a) * 0.03, 0.02))
        paint(loft([o, o + V((0.0, 0, 0.3))], 0.012, sides=6, wob=0.05), shade(lin(0xa0522d), lin(0x7a3e20)))
    paint(loft([V((0.12, 0.06, 0.12)), V((0.12, 0.06, 0.14))], 0.05, sides=8, wob=0), solid(lin(0xc8102e), 0.05))   # 묶은 끈
    for k in range(6): paint(loft([V((0.24 + k * 0.012, -0.12, 0)), V((0.27 + k * 0.02, -0.14, 0.38))], [0.008, 0.004], sides=4, wob=0), solid(lin(0x7a9a3a), 0.12))   # 창포
    finish('gd_18', OUT)

# ── 19 디글라 · 대추야자 (이름 뜻 「종려 숲」) ──
def dates():
    begin(119)
    paint(loft([V((0, 0, 0)), V((0, 0, 0.03)), V((0, 0, 0.05))], [0.2, 0.26, 0.27], sides=14, wob=0.02), shade(lin(0xc9a46a), lin(0xa3803e)))
    stem = crs([V((-0.05, 0, 0.05)), V((0, 0, 0.25)), V((0.08, 0, 0.4))], 8)
    paint(loft(stem, 0.012, sides=4, wob=0), solid(lin(0xd8a040), 0.08))
    for i in range(2, 8):
        for k in range(5):
            a = k / 5 * 6.28 + i; p = stem[i] + V((math.cos(a) * 0.05, math.sin(a) * 0.05, -0.04))
            paint(loft([stem[i], p], 0.003, sides=3, wob=0), solid(lin(0xd8a040), 0.08)); paint(blob(p, (0.02, 0.02, 0.03), n=10), shade(lin(0xa0501a), lin(0x7a3a12)))
    for k in range(10): a = random.random() * 6.28; r = random.random() * 0.2; paint(blob((math.cos(a) * r, math.sin(a) * r, 0.07), (0.02, 0.02, 0.028), n=10), shade(lin(0x8a3a12), lin(0x6a2a0e)))
    finish('gd_19', OUT)

def feather(b, tip, col, w=0.035):
    """깃대(가는 관) + 양쪽 깃 — 끝이 둥근 잎 모양, 살짝 휜다"""
    b, tip = V(b), V(tip); d = tip - b; L = d.length; d.normalize(); sd = d.cross(V((0, 0, 1)))
    sd = sd.normalized() if sd.length > 1e-3 else V((1, 0, 0)); nrm = sd.cross(d)
    sp = [b + d * L * t + nrm * (math.sin(t * math.pi) * L * 0.08) for t in [i / 8 for i in range(9)]]
    paint(loft(sp, [0.004 - 0.003 * i / 8 for i in range(9)], sides=3, wob=0), solid(lin(0xf0ead8), 0.05))
    for s_ in (-1, 1):
        edge = [sp[i] + sd * s_ * w * math.sin(min(1, (i + 0.5) / 8) * math.pi) ** 0.7 for i in range(1, 9)]
        for i in range(len(edge) - 1):
            paint(hull([sp[i + 1], sp[i + 2] if i + 2 < 9 else sp[8], edge[i], edge[i + 1], sp[i + 1] + nrm * 0.003]), solid(col, 0.08))
# ── 20 오발 · 바닷새 깃털 머리띠 (10/5: 깃털이 칼날처럼 보였다 → 깃대 있는 둥근 깃털) ──
def featherband():
    begin(120)
    paint(disc((0, 0, 0), 0.2, 0.06, 14), shade(lin(0x2a6a7a), lin(0x1a4a5a)))   # 받침
    band = [V((math.cos(a) * 0.14, math.sin(a) * 0.14, 0.09)) for a in [k / 18 * 6.28 for k in range(18)]]
    paint(loft(band, 0.018, sides=5, closed=True, wob=0, ell=(1, 1.6)), solid(lin(0xd8b070), 0.06))
    for k in range(9):
        a = (k / 9 - 0.5) * 2.2 + math.pi / 2; b = V((math.cos(a) * 0.14, math.sin(a) * 0.14, 0.1))
        tip = b + V((math.cos(a) * 0.07, math.sin(a) * 0.07, 0.2 + (1 - abs(k - 4) / 4) * 0.12))
        feather(b, tip, [lin(0xffffff), lin(0x3a3a4a), lin(0x3a9ab0)][k % 3])
    for k in range(6): a = k / 6 * 6.28; paint(blob((math.cos(a) * 0.14, math.sin(a) * 0.14, 0.09), (0.012, 0.012, 0.012), n=8), solid(lin(0xb03a3a), 0.06))
    finish('gd_20', OUT)

# ── 21 아비마엘 · 타조 깃털 ──
def ostrich():
    begin(121)
    paint(loft([V((0, 0, 0)), V((0, 0, 0.08)), V((0, 0, 0.2)), V((0, 0, 0.26))], [0.07, 0.1, 0.07, 0.08], sides=12, wob=0.02), shade(lin(0x2a4a8a), lin(0x1a3a6a)))   # 꽃병
    for k in range(5):
        a = k / 5 * 6.28; b = V((math.cos(a) * 0.03, math.sin(a) * 0.03, 0.24))
        sp = crs([b, b + V((math.cos(a) * 0.08, math.sin(a) * 0.08, 0.22)), b + V((math.cos(a) * 0.2, math.sin(a) * 0.2, 0.32))], 9)
        paint(loft(sp, 0.004, sides=3, wob=0), solid(lin(0xe8e0d0), 0.05))
        for i in range(2, 9):
            for s in (-1, 1):
                d = (sp[min(i + 1, 8)] - sp[i - 1]).normalized(); sd = d.cross(V((0, 0, 1))).normalized()
                paint(blob(sp[i] + sd * s * 0.03 - V((0, 0, 0.02)), (0.035, 0.035, 0.02), n=8, jitter=0.4), solid(lin(0xf6f2ea) if k % 2 else lin(0x2a2622), 0.06))
    finish('gd_21', OUT)

# ── 22 스바(욕단의 아들) · 스바의 금 (시 72:15) ──
def shebagold():
    begin(122)
    paint(box((0, 0, 0.1), 0.42, 0.28, 0.2), shade(lin(0x5a3a7a), lin(0x3a2a5a)))   # 자줏빛 궤
    for x in (-0.21, 0.21): paint(box((x, 0, 0.1), 0.02, 0.29, 0.21), solid(GOLD, 0.05), METAL)
    GB, GB_D = lin(0xf6d156), lin(0xd9a930)   # 밝은 금(10/5 사용자: 동 같고 흙 같다)
    for k in range(9): paint(box((-0.12 + (k % 3) * 0.12, -0.06 + (k // 3) * 0.06, 0.22 + (k // 3) * 0.01), 0.1, 0.05, 0.035, rz=(random.random() - 0.5) * 0.3), shade(GB, GB_D, k=0.04), METAL)
    # 금화 — 쌓은 줄 셋 + 바닥에 누운 낱개. 전엔 높이만 다르게 아무 데나 흩어 바닥에 묻히고 떠 있었다 · 흰 「반짝임」 점은 뺐다(10/5 사용자)
    for (x, y, n) in ((0.28, -0.04, 5), (0.33, 0.05, 3), (0.26, 0.08, 2)):
        for k in range(n): paint(disc((x + (random.random() - 0.5) * 0.006, y + (random.random() - 0.5) * 0.006, k * 0.0075), 0.028, 0.007, 12), shade(GB, GB_D, k=0.04), METAL)
    for (x, y) in ((0.36, -0.08), (0.22, -0.13), (0.38, 0.0)): paint(disc((x, y, 0), 0.028, 0.007, 12), shade(GB, GB_D, k=0.04), METAL)
    finish('gd_22', OUT)

# ── 23 오빌 · 백단목과 보석 (왕상 10:11) ──
def almug():
    begin(123)
    SD, SD_D = lin(0xb0503a), lin(0x8a3a2a)
    for k, (y, z) in enumerate([(-0.05, 0.035), (0.05, 0.035), (0.0, 0.1)]): paint(loft([V((-0.18, y, z)), V((0.18, y, z))], [0.035, 0.035], sides=8, wob=0.04), shade(SD, SD_D))   # 백단목(줄였다 — 보석이 묻혔다)
    paint(loft([V((0.0, 0.2, 0)), V((0, 0.2, 0.03)), V((0, 0.2, 0.05))], [0.14, 0.17, 0.18], sides=14, wob=0), shade(SILVER, SILVER_D), METAL)   # 보석 쟁반
    for k in range(5):
        a = k / 5 * 6.28; p = V((math.cos(a) * 0.09, 0.2 + math.sin(a) * 0.09, 0.07)); s = 0.045
        col = [lin(0x2a8a4a), lin(0x2a4aa0), lin(0xd02a3a), lin(0xe0b545), lin(0x8a2aa0)][k]
        paint(hull([p + V((s, 0, 0)), p - V((s, 0, 0)), p + V((0, s, 0)), p - V((0, s, 0)), p + V((0, 0, s * 1.3)), p - V((0, 0, s * 0.3))]), solid(col, 0.1), METAL)
    finish('gd_23', OUT)

# ── 24 하윌라(욕단의 아들) · 베델리엄과 호마노 (창 2:12) ──
def bdellium():
    begin(124)
    paint(disc((0, 0, 0), 0.24, 0.04, 16), shade(lin(0x6a4a2a), lin(0x4a3a1e)))
    for k in range(7): a = random.random() * 6.28; r = random.random() * 0.12; paint(blob((math.cos(a) * r - 0.06, math.sin(a) * r, 0.07), (0.03, 0.028, 0.025), n=12, jitter=0.4), solid(lin(0xe0a040), 0.12), GLOW if k < 2 else BASE)   # 베델리엄(나무진)
    for k in range(3):   # 호마노 — 검고 흰 띠
        p = V((0.12, -0.08 + k * 0.08, 0.06))
        for b in range(4): paint(blob(p + V((0, 0, b * 0.018)), (0.04 - b * 0.004, 0.035 - b * 0.004, 0.01), n=12, jitter=0.1), solid(lin(0x1a1a1a) if b % 2 == 0 else lin(0xf0ece4), 0.05))
    finish('gd_24', OUT)

# ── 25 요밥 · 가죽 물부대 ── (주둥이·다리가 몸통에서 떨어져 떠 있었다 — 10/5 사용자. 몸통 안에서 나오게)
def waterskin():
    begin(125)
    paint(blob((0, 0, 0.16), (0.2, 0.13, 0.15), n=40, jitter=0.06), shade(LEATHER, LEATHER_D, k=0.08))
    neck = crs([V((0.12, 0, 0.2)), V((0.2, 0, 0.27)), V((0.25, 0, 0.33))], 6)
    paint(loft(neck, [0.055, 0.048, 0.04, 0.035, 0.033, 0.035], sides=8, wob=0.02), shade(LEATHER_D, LEATHER))
    paint(loft([neck[-2], neck[-1] + (neck[-1] - neck[-2]) * 0.4], 0.042, sides=8, wob=0), solid(ROPE, 0.06))   # 묶은 끈
    for sy in (-1, 1):   # 묶은 앞다리 자리 — 몸통 안에서 비스듬히 나온 짧은 뭉툭이
        b = V((-0.12, 0.05 * sy, 0.1)); t = b + V((-0.08, 0.05 * sy, -0.05))
        paint(loft([b, t], [0.04, 0.03], sides=6, wob=0.05), shade(LEATHER, LEATHER_D))
        paint(loft([t, t + (t - b).normalized() * 0.015], 0.032, sides=6, wob=0), solid(ROPE, 0.06))
    strap = crs([V((-0.17, 0, 0.2)), V((-0.05, 0, 0.36)), V((0.15, 0, 0.27))], 8)
    paint(loft(strap, 0.012, sides=4, wob=0), solid(lin(0x5a3a1e), 0.05))
    for e in (strap[0], strap[-1]): paint(blob(e, (0.02, 0.02, 0.02), n=8), solid(BRONZE, 0.05), METAL)   # 고리
    finish('gd_25', OUT)

# ════════ 함의 자손 26~55 (10/5) ════════
# 공용 도우미 — 첫 묶음에서 배운 것: 떠 있거나 묻힌 조각 없이 땅(z 0)에 닿게 · 기대는 것은 받침 쪽으로 · 뜻 없는 반짝 점은 넣지 않는다
def basis(ax):
    ax = V(ax).normalized(); u = ax.orthogonal().normalized(); return u, ax.cross(u)

def ring(c, r, t, ax=(0, 0, 1), sides=16, ell=(1, 1)):
    """닫힌 고리 — 가운데 c, 축 ax에 수직인 평면, 반지름 r, 굵기 t"""
    c = V(c); u, w = basis(ax)
    return loft([c + u * math.cos(a) * r * ell[0] + w * math.sin(a) * r * ell[1] for a in [k / sides * 2 * math.pi for k in range(sides)]], t, sides=5, closed=True, wob=0)

def plate(c, ax, r, h, sides=16, wob=0.0):
    """축 ax 쪽으로 두께 h인 둥근 판(뒤 c → 앞 c + ax*h)"""
    c = V(c); ax = V(ax).normalized(); return loft([c, c + ax * h], [r, r], sides=sides, wob=wob, up=ax.orthogonal())

def strip(pts, widths, nrm, th=0.006):
    """납작한 띠 — 점 pts를 따라, 면의 법선 nrm(점마다 하나 또는 하나), 폭 widths. 조각마다 볼록 껍질"""
    pts = [V(p) for p in pts]; out = []
    for i in range(len(pts) - 1):
        quad = []
        for j in (i, i + 1):
            t = (pts[min(j + 1, len(pts) - 1)] - pts[max(j - 1, 0)]).normalized()
            n = V(nrm[j] if isinstance(nrm, list) else nrm).normalized(); sd = t.cross(n).normalized()
            w = widths[j] if isinstance(widths, (list, tuple)) else widths
            for s in (-1, 1):
                for q in (-1, 1): quad.append(pts[j] + sd * s * w / 2 + n * q * th / 2)
        out += hull(quad)
    return out

def gem(p, s, col, mat=METAL, tall=1.3):
    p = V(p); return paint(hull([p + V((s, 0, 0)), p - V((s, 0, 0)), p + V((0, s, 0)), p - V((0, s, 0)), p + V((s * 0.7, s * 0.7, s * 0.3)), p + V((-s * 0.7, -s * 0.7, s * 0.3)), p + V((0, 0, s * tall)), p - V((0, 0, s * 0.5))]), solid(col, 0.06), mat)

def wheat(base, h=0.38, n=11, spread=0.05, band=0.14, lean=(0, 0, 1)):
    """선 곡식단 — 아래가 모이고 위가 벌어진 줄기 + 이삭, 허리에 끈"""
    b = V(base); up = V(lean).normalized(); u, w = basis(up)
    for k in range(n):
        a = k * 2.4; r = spread * math.sqrt((k + 0.5) / n)
        foot = b + (u * math.cos(a) + w * math.sin(a)) * r * 0.6
        top = b + up * h + (u * math.cos(a) + w * math.sin(a)) * r * 1.8 + V(((random.random() - 0.5) * 0.02, (random.random() - 0.5) * 0.02, 0))
        mid = b + up * band
        paint(loft(crs([foot, mid + (foot - b) * 0.4, top], 5), 0.0045, sides=4, wob=0), solid(lin(0xc9a24a), 0.1))
        d = (top - mid).normalized(); paint(loft([top - d * 0.005, top + d * 0.06], [0.011, 0.006], sides=5, wob=0.1), solid(lin(0xe0b850), 0.1))
    paint(ring(b + up * band, spread * 0.55, 0.009, ax=up, sides=10), solid(ROPE, 0.06))

def wheel(c, R, ax=(0, 1, 0), spokes=6, col=WOOD, col_d=WOOD_D, rim=0.014):
    c = V(c); u, w = basis(ax); a3 = V(ax).normalized()
    paint(ring(c, R, rim, ax=a3, sides=20), shade(col, col_d))
    paint(loft([c - a3 * 0.035, c + a3 * 0.035], [0.025, 0.025], sides=8, wob=0, up=u), solid(col_d, 0.05))   # 바퀴통
    for k in range(spokes):
        a = k / spokes * 2 * math.pi; paint(loft([c, c + (u * math.cos(a) + w * math.sin(a)) * R], [0.009, 0.008], sides=5, wob=0), solid(col, 0.06))

def lean_on(B, a, s):
    """바닥 B에서 뒤(+y)로 a만큼 누운 판의 위쪽 방향과 그 위 s 지점"""
    up = V((0, math.sin(a), math.cos(a))); return up, V(B) + up * s

# ── 26 구스 · 구스의 황옥 (욥 28:19) — 바위에서 돋은 육각 결정 + 깎은 황옥 한 알 ──
def topaz():
    begin(126)
    paint(blob((0, 0.02, 0.05), (0.24, 0.17, 0.08), n=26, jitter=0.25), shade(lin(0x6a6258), lin(0x4a443c), k=0.1))
    T1, T2 = lin(0xe6c440), lin(0xc2cc58)
    for k, (x, y, dx, dy, L, r) in enumerate([(0, 0.02, 0, 0, 0.3, 0.045), (-0.08, 0.04, -0.5, 0.2, 0.22, 0.035), (0.08, 0.0, 0.45, -0.2, 0.24, 0.038), (0.03, 0.08, 0.15, 0.5, 0.18, 0.03), (-0.04, -0.05, -0.2, -0.45, 0.16, 0.028), (0.13, 0.06, 0.6, 0.4, 0.13, 0.025)]):
        b = V((x, y, 0.08)); d = V((dx, dy, 1)).normalized()
        col = T1 if k % 2 == 0 else T2
        paint(loft([b - d * 0.03, b + d * L * 0.72], r, sides=6, wob=0, up=d.orthogonal()), solid(col, 0.1), GLOW if k == 0 else METAL)
        paint(cone(b + d * L * 0.72, b + d * L, r, sides=6), solid(jit(col, 0.05), 0.08), METAL)
    paint(disc((0.2, -0.17, 0), 0.06, 0.014, 14), shade(SILVER, SILVER_D), METAL)   # 은 접시
    gem((0.2, -0.17, 0.035), 0.035, T1, tall=1.1)
    finish('gd_26', OUT)

# ── 27 미스라임 · 수놓은 가는 베 돛 (겔 27:7) — 돛대에 편 아마포 돛, 가운데·위아래에 청색·자색 수 ──
def sail():
    begin(127)
    paint(box((0, 0.03, 0.02), 0.32, 0.16, 0.04), shade(WOOD, WOOD_D))
    paint(cyl((0, 0.05, 0.04), (0, 0.05, 0.62), 0.013, sides=6), solid(WOOD, 0.05))
    for z, w in ((0.56, 0.25), (0.17, 0.23)): paint(cyl((-w, 0.035, z), (w, 0.035, z), 0.008, sides=5), solid(WOOD_D, 0.05))   # 위 활대 · 아래 활대
    bul = lambda x, z: 0.045 * math.sin(math.pi * (x + 0.22) / 0.44) * math.sin(math.pi * (z - 0.18) / 0.37)
    S_ = lambda x, z, o=0.0: V((x, 0.03 - bul(x, z) - o, z))   # 돛 면 — 앞(-y)으로 바람을 받아 부푼다
    xs = [-0.22 + i * 0.44 / 6 for i in range(7)]; zs = [0.18 + j * 0.37 / 4 for j in range(5)]
    for i in range(6):
        for j in range(4):
            q = [S_(x, z) for x in (xs[i], xs[i + 1]) for z in (zs[j], zs[j + 1])]
            paint(hull(q + [p + V((0, 0.005, 0)) for p in q]), solid(LINEN, 0.05))
    BL, PU, RD = lin(0x2a4fa0), lin(0x6a2a8a), lin(0xb03a3a)
    for z, col in ((0.53, BL), (0.515, RD), (0.21, BL), (0.225, RD)):   # 위아래 수놓은 띠
        paint(strip([S_(x, z, 0.004) for x in [-0.21 + i * 0.07 for i in range(7)]], 0.01, [(S_(x, z + 0.01) - S_(x, z - 0.01)).cross(V((1, 0, 0))) * -1 for x in [-0.21 + i * 0.07 for i in range(7)]], th=0.003), solid(col, 0.05))
    for k in range(5):   # 가운데 마름모 무늬
        x = -0.16 + k * 0.08; p = S_(x, 0.37, 0.005); col = BL if k % 2 else PU
        paint(hull([p + V((0.025, 0, 0)), p - V((0.025, 0, 0)), p + V((0, 0, 0.035)), p - V((0, 0, 0.035)), p + V((0, 0.004, 0))]), solid(col, 0.05))
        paint(blob(p + V((0, -0.003, 0)), (0.007, 0.004, 0.007), n=8), solid(lin(0xf2d36a), 0.05), METAL)
    for sx in (-1, 1): paint(loft([V((0.25 * sx, 0.035, 0.56)), V((0.15 * sx, 0.06, 0.04))], 0.003, sides=3, wob=0), solid(ROPE, 0.05))
    finish('gd_27', OUT)

# ── 28 붓 · 방패 (렘 46:9) — 🕊️ 방패로 만든 둥근 상 ──
def shield(peace=False):
    begin(128)
    R = 0.2
    if not peace:
        a = 0.32; n = V((0, -math.cos(a), math.sin(a)))   # 앞(-y)·조금 위를 본다 — 윗부분이 뒤 받침대에 기대
        up = V((0, math.sin(a), math.cos(a))); c = V((0, 0, R * math.cos(a) + 0.012))
        paint(loft([c, c + n * 0.014, c + n * 0.03], [R, R, R * 0.86], sides=20, wob=0.01, up=up), shade(lin(0x8a3a24), lin(0x6a2a1a), k=0.06))   # 가죽 씌운 판
        paint(ring(c + n * 0.016, R, 0.012, ax=n, sides=24), solid(BRONZE, 0.05), METAL)
        paint(blob(c + n * 0.035, (0.05, 0.05, 0.05), n=14, jitter=0.05), solid(BRONZE, 0.05), METAL)   # 가운데 혹
        u, w = basis(n)
        for k in range(10): ang = k / 10 * 2 * math.pi; paint(blob(c + n * 0.03 + (u * math.cos(ang) + w * math.sin(ang)) * 0.14, (0.012, 0.012, 0.012), n=8), solid(BRONZE, 0.05), METAL)
        P = c + up * 0.13; bar = P + V((0, math.cos(a), -math.sin(a))) * 0.013   # 방패 뒷면에 닿는 가로대
        for x in (-0.17, 0.17): paint(cyl((x, bar.y, 0), (x, bar.y, bar.z + 0.03), 0.012, sides=6), solid(WOOD, 0.05))
        paint(cyl((-0.18, bar.y, bar.z), (0.18, bar.y, bar.z), 0.011, sides=6), solid(WOOD_D, 0.05))
        paint(box((0, bar.y, 0.012), 0.42, 0.06, 0.024), shade(WOOD, WOOD_D))
    else:   # 방패를 눕혀 다리 셋을 달고 상으로 — 빵·과일·잔
        top = 0.17
        for k in range(3):
            ang = k / 3 * 2 * math.pi + 0.5; x, y = math.cos(ang) * 0.13, math.sin(ang) * 0.13
            paint(loft([V((x * 1.15, y * 1.15, 0)), V((x, y, top * 0.5)), V((x * 0.9, y * 0.9, top - 0.005))], [0.016, 0.012, 0.014], sides=6, wob=0), solid(WOOD, 0.05))
        c = V((0, 0, top))
        paint(loft([c, c + V((0, 0, 0.014)), c + V((0, 0, 0.022))], [R, R, R * 0.92], sides=20, wob=0.01), lambda p_, n: jit(lin(0x9a4a2c) if n.z > 0.9 else lin(0x7a3420), 0.06))
        paint(ring(c + V((0, 0, 0.016)), R, 0.012, sides=24), solid(BRONZE, 0.05), METAL)
        tz = top + 0.022
        for k, (x, y) in enumerate(((-0.07, 0.05), (-0.02, -0.06))): paint(blob((x, y, tz + 0.025), (0.06, 0.04, 0.03), n=18, jitter=0.1), shade(lin(0xd8a060), lin(0xb07a40), k=0.08))   # 빵
        paint(loft([V((0.08, 0.04, tz)), V((0.08, 0.04, tz + 0.02)), V((0.08, 0.04, tz + 0.045))], [0.035, 0.06, 0.07], sides=12, wob=0), shade(CLAY, CLAY_D))   # 과일 그릇
        for k in range(4): paint(blob((0.08 + math.cos(k * 1.6) * 0.03, 0.04 + math.sin(k * 1.6) * 0.03, tz + 0.06), (0.025, 0.025, 0.025), n=12), solid([lin(0xc22a2a), lin(0xe8a830), lin(0x6aa040), lin(0x5b2a86)][k], 0.08))
        paint(loft([V((0.05, -0.1, tz)), V((0.05, -0.1, tz + 0.03)), V((0.05, -0.1, tz + 0.06))], [0.025, 0.012, 0.03], sides=10, wob=0), shade(SILVER, SILVER_D), METAL)   # 잔
    finish('gd_28p' if peace else 'gd_28', OUT)

# ── 29 가나안 · 젖과 꿀 (출 3:8) — 젖 항아리·젖 대접·꿀 단지 ──
def milkhoney():
    begin(129)
    MILK, HC = lin(0xfaf5e6), lin(0xe8a830)
    paint(box((0, 0, 0.004), 0.52, 0.34, 0.008), solid(lin(0x7a5a8a), 0.05))   # 깔개 — 흰 젖이 보이게 짙은 색
    jz = [0, 0.03, 0.12, 0.21, 0.25, 0.28]; jr = [0.05, 0.09, 0.105, 0.075, 0.048, 0.056]
    paint(loft([V((-0.12, 0.05, z + 0.008)) for z in jz], jr, sides=14, wob=0.02), lambda p_, n: jit(MILK, 0.03) if n.z > 0.9 else jit(CLAY if n.z > -0.3 else CLAY_D, 0.06))   # 젖 항아리 — 윗면이 젖
    paint(loft(crs([V((-0.035, 0.05, 0.258)), V((0.0, 0.05, 0.208)), V((-0.03, 0.05, 0.108))], 6), 0.012, sides=5, wob=0), solid(CLAY_D, 0.05))
    paint(loft([V((0.1, -0.08, 0.008)), V((0.1, -0.08, 0.03)), V((0.1, -0.08, 0.07))], [0.05, 0.08, 0.095], sides=14, wob=0.01), lambda p_, n: jit(MILK, 0.03) if n.z > 0.9 else jit(lin(0x8a6a4a), 0.06))   # 젖 대접(나무)
    hz = [0, 0.02, 0.09, 0.13, 0.15]; hr = [0.04, 0.06, 0.065, 0.045, 0.05]
    paint(loft([V((0.15, 0.1, z + 0.008)) for z in hz], hr, sides=12, wob=0.02), lambda p_, n: jit(HC, 0.04) if n.z > 0.9 else jit(lin(0xb8945a), 0.06))   # 꿀 단지
    for k, a in enumerate((0.3, 2.4)): paint(loft([V((0.15 + math.cos(a) * 0.05, 0.1 + math.sin(a) * 0.05, 0.155)), V((0.15 + math.cos(a) * 0.066, 0.1 + math.sin(a) * 0.066, 0.1 - k * 0.02))], [0.01, 0.006], sides=5, wob=0), solid(HC, 0.04), METAL)   # 흘러내린 꿀
    paint(loft([V((0.15, 0.1, 0.14)), V((0.22, 0.17, 0.28))], 0.007, sides=4, wob=0), solid(WOOD, 0.05))   # 꿀 뜨개
    paint(blob((0.15, 0.1, 0.155), (0.022, 0.022, 0.01), n=8), solid(HC, 0.04), METAL)
    finish('gd_29', OUT)

# ── 30 스바(구스) · 흑단 — 묶은 통나무 + 잘라 닦은 판 ──
def ebony():
    begin(130)
    BK, BARK, CUT = lin(0x2a1e1a), lin(0x3e302a), lin(0x1a1210)
    endc = lambda p_, n: jit(lin(0x4a2a20) if abs(n.x) > 0.9 else BARK, 0.08)
    for k, (y, z) in enumerate([(-0.09, 0.045), (0.0, 0.045), (0.09, 0.045), (-0.045, 0.125), (0.045, 0.125)]):
        x0 = -0.24 + random.random() * 0.03; x1 = 0.24 - random.random() * 0.03
        paint(loft([V((x0, y, z)), V((x1, y, z))], 0.044, sides=9, wob=0.05), endc)
    for x in (-0.14, 0.14): paint(ring((x, 0, 0.085), 0.1, 0.009, ax=(1, 0, 0), sides=14, ell=(1.45, 0.92)), solid(ROPE, 0.06))
    paint(box((0.02, -0.21, 0.014), 0.36, 0.08, 0.028), lambda p_, n: jit(CUT if n.z > 0.5 else BK, 0.05), METAL)   # 닦은 판 — 윤이 난다
    paint(loft([V((-0.2, -0.21, 0)), V((-0.2, -0.21, 0.04)), V((-0.2, -0.21, 0.08))], [0.03, 0.04, 0.045], sides=10, wob=0), solid(CUT, 0.05), METAL)   # 흑단 잔
    finish('gd_30', OUT)

# ── 31 하윌라(구스) · 정금 (창 2:11-12) — 사금 일어 낸 나무 쟁반 + 금맥 박힌 돌 ──
def puregold():
    begin(131)
    GB, GB_D = lin(0xf6d156), lin(0xd9a930)
    paint(loft([V((0, 0, 0)), V((0, 0, 0.02)), V((0, 0, 0.05))], [0.12, 0.2, 0.22], sides=16, wob=0.02), lambda p_, n: jit(lin(0xc8b088) if n.z > 0.9 else WOOD, 0.06))   # 쟁반 — 바닥은 모래
    for k in range(16):
        a = random.random() * 6.28; r = random.random() * 0.15; s = 0.012 + random.random() * 0.018
        paint(blob((math.cos(a) * r, math.sin(a) * r, 0.05 + s * 0.4), (s, s * 0.9, s * 0.6), n=10, jitter=0.35), shade(GB, GB_D, k=0.05), METAL)
    paint(blob((0.27, 0.1, 0.07), (0.1, 0.08, 0.075), n=22, jitter=0.25), shade(lin(0x7a7266), lin(0x5a544a), k=0.08))   # 금맥 돌
    for k in range(6): paint(blob((0.27 + math.cos(k) * 0.07, 0.1 + math.sin(k) * 0.05 - 0.02, 0.07 + (k % 3 - 1) * 0.03), (0.022, 0.01, 0.01), n=8, jitter=0.3), solid(GB, 0.05), METAL)
    for (x, y) in ((0.12, -0.2), (0.19, -0.16), (0.02, -0.25)): paint(blob((x, y, 0.012), (0.02, 0.018, 0.012), n=10, jitter=0.35), shade(GB, GB_D), METAL)
    finish('gd_31', OUT)

# ── 32 삽다 · 구리 거울 — 파피루스 손잡이로 선 큰 거울 + 누운 손거울 ──
def mirror():
    begin(132)
    CU, CU_D, CU_HI = lin(0xd88a50), lin(0xa05a30), lin(0xffc890)
    paint(box((0, 0.02, 0.02), 0.22, 0.14, 0.04), shade(WOOD, WOOD_D))
    paint(loft([V((0, 0.02, 0.04)), V((0, 0.02, 0.16)), V((0, 0.02, 0.2))], [0.018, 0.015, 0.035], sides=8, wob=0), solid(lin(0x3a6a3a), 0.06))   # 파피루스 줄기 손잡이 — 끝이 벌어진다
    a = 0.12; n = V((0, -math.cos(a), math.sin(a))); c = V((0, 0.02, 0.33))
    paint(plate(c - n * 0.006, n, 0.13, 0.012, sides=22), lambda p_, nn: jit(CU_HI if nn.dot(n) > 0.9 else CU_D, 0.05), METAL)   # 닦은 앞면은 밝게
    paint(ring(c, 0.13, 0.008, ax=n, sides=22), solid(CU, 0.05), METAL)
    paint(box((-0.1, -0.15, 0.003), 0.26, 0.14, 0.006), solid(lin(0x2a4fa0), 0.05))   # 천
    c2 = V((-0.06, -0.15, 0.006))
    paint(plate(c2, (0, 0, 1), 0.06, 0.008, sides=16), lambda p_, nn: jit(CU_HI if nn.z > 0.9 else CU_D, 0.05), METAL)
    paint(loft([V((-0.12, -0.15, 0.01)), V((-0.21, -0.17, 0.012))], [0.012, 0.01], sides=6, wob=0), solid(lin(0xe0d0b0), 0.05))   # 상아 손잡이
    finish('gd_32', OUT)

# ── 33 라아마 · 각종 보석 (겔 27:22) — 뚜껑 연 보석함 + 천에 쏟아진 보석 ──
def gems():
    begin(133)
    CB, CB_D = lin(0x6a2a2a), lin(0x4a1a1a)
    paint(box((0, 0.04, 0.06), 0.3, 0.2, 0.12), shade(CB, CB_D, k=0.05))
    for x in (-0.15, 0.15): paint(box((x, 0.04, 0.06), 0.012, 0.205, 0.125), solid(GOLD, 0.05), METAL)
    up, P = lean_on((0, 0.14, 0.12), 0.32, 0.1)
    paint(box(P, 0.3, 0.02, 0.2, rx=-0.32), shade(CB, CB_D, k=0.05))   # 뒤 경첩에서 열린 뚜껑
    paint(box(P + V((0, -0.012, 0)), 0.2, 0.004, 0.12, rx=-0.32), solid(lin(0xb03a3a), 0.05))   # 뚜껑 안 비단
    COLS = [lin(0x2a9a5a), lin(0x2a5ac0), lin(0xd0203a), lin(0x8a3ac0), lin(0xe6c440), lin(0xf0f0f6), lin(0x2ab0b0)]
    random.seed(33)
    for k in range(14): gem((-0.12 + (k % 5) * 0.06 + random.random() * 0.02, -0.03 + (k // 5) * 0.06, 0.125), 0.024 + random.random() * 0.008, COLS[k % 7], GLOW if k == 3 else METAL)
    paint(box((0.05, -0.2, 0.003), 0.36, 0.12, 0.006), solid(lin(0x3a2a5a), 0.05))
    for k in range(5): gem((-0.08 + k * 0.06, -0.2 + (k % 2) * 0.03, 0.006), 0.02, COLS[(k * 3) % 7], tall=1.0)
    finish('gd_33', OUT)

# ── 34 삽드가 · 가죽 북 — 끈으로 조인 통북 + 땅에 누운 소고 ──
def drum():
    begin(134)
    SK, RED = lin(0xead8b0), lin(0xa03a2a)
    c = V((0.05, 0.03, 0)); zs = [0, 0.04, 0.15, 0.26, 0.3]; rs = [0.1, 0.115, 0.125, 0.115, 0.1]
    paint(loft([c + V((0, 0, z)) for z in zs], rs, sides=16, wob=0.01), lambda p_, n: jit(SK if abs(n.z) > 0.9 else RED, 0.06))
    for z in (0.006, 0.294): paint(ring(c + V((0, 0, z)), 0.104, 0.008, sides=16), solid(LEATHER_D, 0.05))
    for k in range(12):
        a0 = k / 12 * 2 * math.pi; a1 = a0 + math.pi / 12
        pts = crs([c + V((math.cos(a0) * 0.108, math.sin(a0) * 0.108, 0.29)), c + V((math.cos((a0 + a1) / 2) * 0.133, math.sin((a0 + a1) / 2) * 0.133, 0.15)), c + V((math.cos(a1) * 0.108, math.sin(a1) * 0.108, 0.01))], 6)
        paint(loft(pts, 0.004, sides=3, wob=0), solid(lin(0x5a3a1e), 0.05))
    f = V((-0.17, -0.12, 0))
    paint(loft([f, f + V((0, 0, 0.035))], [0.1, 0.1], sides=18, wob=0), lambda p_, n: jit(SK if n.z > 0.9 else WOOD, 0.05))   # 소고
    for k in range(4):
        a = k / 4 * 2 * math.pi + 0.4
        for s in (-1, 1): paint(plate(f + V((math.cos(a) * 0.101, math.sin(a) * 0.101, 0.0175 + s * 0.006)), (0, 0, s), 0.013, 0.003, sides=8), solid(BRONZE, 0.05), METAL)
    finish('gd_34', OUT)

# ── 35 스바(라아마) · 상등 향품 (겔 27:22) — 입을 접어 내린 자루 셋 + 계피 다발 ──
def spices():
    begin(135)
    BUR, BUR_D = lin(0xb89a6a), lin(0x8a7048)
    for k, (x, y, s, col) in enumerate([(-0.14, 0.07, 1.0, lin(0xc4502a)), (0.12, 0.08, 0.95, lin(0xe0a020)), (0.0, -0.1, 0.8, lin(0x8a4a24))]):
        c = V((x, y, 0)); zs = [0, 0.04, 0.13, 0.16]; rs = [0.075 * s, 0.092 * s, 0.088 * s, 0.09 * s]
        paint(loft([c + V((0, 0, z * s)) for z in zs], rs, sides=12, wob=0.06), shade(BUR, BUR_D, k=0.1))
        paint(ring(c + V((0, 0, 0.16 * s)), 0.095 * s, 0.016 * s, sides=12), solid(BUR_D, 0.08))   # 접어 내린 입
        paint(blob(c + V((0, 0, 0.165 * s)), (0.085 * s, 0.085 * s, 0.045 * s), n=24, jitter=0.12), solid(col, 0.1))
    paint(loft([V((0.12, 0.08, 0.2)), V((0.17, 0.02, 0.21)), V((0.21, -0.01, 0.2))], [0.004, 0.006, 0.018], sides=6, wob=0), solid(BRONZE, 0.05), METAL)   # 놋 국자
    for k in range(6): paint(loft([V((0.14, -0.2 + k * 0.012, 0.01 + (k % 2) * 0.012)), V((0.3, -0.18 + k * 0.012, 0.01 + (k % 2) * 0.012))], 0.007, sides=5, wob=0.05), solid(lin(0x9a5a30), 0.08))   # 계피
    paint(ring((0.22, -0.17, 0.016), 0.03, 0.005, ax=(1, 0.1, 0), sides=10, ell=(1.3, 0.8)), solid(lin(0xb03a3a), 0.05))
    finish('gd_35', OUT)

# ── 36 드단 · 상아 (겔 27:15 「상아와 박달나무」) — 받침 둘에 나란히 누운 엄니 둘. 받침 높이는 엄니 아랫면에 맞춘다(10/5: 하나가 받침에 묻혔다) ──
def ivory():
    begin(136)
    IV, IV_D = lin(0xf2e6c8), lin(0xd8c8a0)
    tusks = []
    for y, sc in ((-0.06, 1.0), (0.07, 0.9)):
        pts = crs([V((-0.26 * sc, y, 0.06)), V((-0.08, y, 0.055)), V((0.1 * sc, y + 0.01, 0.085)), V((0.24 * sc, y + 0.03, 0.19 * sc))], 12)
        rs = [0.045 * sc - 0.039 * sc * (i / 11) ** 1.3 for i in range(12)]
        d0 = (pts[1] - pts[0]).normalized()
        paint(loft(pts, rs, sides=10, wob=0.02), lambda p_, n, d=d0: jit(lin(0xb09a70) if n.dot(-d) > 0.9 else IV if n.z > -0.2 else IV_D, 0.04))
        tusks.append((pts, rs))
    for x in (-0.15, 0.06):
        for pts, rs in tusks:   # 그 x에서 엄니 아랫면 높이
            i = min(range(len(pts) - 1), key=lambda k: abs(pts[k].x - x)); bot = pts[i].z - rs[i] + 0.004
            paint(box((x, pts[i].y, bot / 2), 0.06, 0.07, bot), shade(WOOD, WOOD_D))
        paint(box((x, 0.005, 0.008), 0.08, 0.26, 0.016), solid(WOOD_D, 0.05))
    finish('gd_36', OUT)

# ── 37 니므롯 · 사냥꾼의 창 (창 10:9) — 🕊️ 낫(사 2:4 「창을 쳐서 낫을」) ──
def spear(peace=False):
    begin(137)
    if not peace:
        paint(box((0, 0.0, 0.015), 0.56, 0.14, 0.03), shade(WOOD_D, lin(0x4a2e16)))
        for x in (-0.2, 0.2):   # Y자 걸이
            paint(cyl((x, 0, 0.03), (x, 0, 0.27), 0.013, sides=6), solid(WOOD, 0.05))
            for s in (-1, 1): paint(loft([V((x, 0, 0.26)), V((x, 0.035 * s, 0.32))], 0.009, sides=5, wob=0), solid(WOOD, 0.05))
        z = 0.29
        paint(cyl((-0.3, 0, z), (0.24, 0, z), 0.01, sides=6), solid(lin(0x9a6a3a), 0.05))   # 자루 — 두 Y 사이에 얹힌다
        paint(hull([V((0.24, 0, z)), V((0.3, 0.025, z)), V((0.3, -0.025, z)), V((0.36, 0, z)), V((0.3, 0, z + 0.005)), V((0.3, 0, z - 0.005))]), solid(lin(0xb8bcc4), 0.05), METAL)   # 창날
        paint(cone((-0.3, 0, z), (-0.34, 0, z), 0.01, 6), solid(BRONZE, 0.05), METAL)
        for k in range(5): paint(loft([V((0.23, 0, z)), V((0.22 - k * 0.004, (k - 2) * 0.008, z - 0.07))], 0.004, sides=3, wob=0), solid(lin(0xb02a2a), 0.08))   # 붉은 술
    else:   # 낫 + 곡식단
        wheat((-0.06, 0.04, 0), h=0.4, n=13)
        c = V((0.15, -0.1, 0.006)); arc = [c + V((math.cos(a) * 0.09, math.sin(a) * 0.09, 0)) for a in [math.radians(200 - i * 25) for i in range(9)]]
        paint(strip(arc, [0.012 + 0.018 * math.sin(i / 8 * math.pi) ** 0.6 for i in range(9)], V((0, 0, 1)), th=0.006), solid(lin(0xc0c4cc), 0.05), METAL)   # 굽은 날
        h0 = arc[0]; paint(loft([h0, h0 + V((-0.05, -0.1, 0.006))], [0.012, 0.014], sides=6, wob=0), solid(WOOD, 0.05))   # 손잡이
    finish('gd_37p' if peace else 'gd_37', OUT)

# ── 38 루딤 · 활 (렘 46:9) — 🕊️ 수금 ──
def bow(peace=False):
    begin(138)
    paint(box((0, 0.02, 0.015), 0.34, 0.14, 0.03), shade(WOOD_D, lin(0x4a2e16)))
    if not peace:
        zt = lambda t: 0.06 + t * 0.5
        xb = lambda t: -0.07 * (1 - ((t - 0.5) / 0.5) ** 2) + (0.025 * ((abs(t - 0.5) - 0.38) / 0.12) if abs(t - 0.5) > 0.38 else 0)
        pts = [V((xb(i / 14), 0, zt(i / 14))) for i in range(15)]
        paint(loft(pts, [0.008 + 0.006 * math.sin(i / 14 * math.pi) for i in range(15)], sides=6, wob=0, ell=(1, 1.4)), lambda p_, n: jit(lin(0x7a4a24), 0.08))
        paint(loft([pts[0], pts[-1]], 0.002, sides=3, wob=0), solid(LINEN, 0.04))   # 시위
        g = pts[7]; paint(loft([g - V((0, 0, 0.04)), g + V((0, 0, 0.04))], 0.017, sides=6, wob=0), solid(LEATHER_D, 0.05))   # 손잡이 감은 가죽
        paint(cyl((g.x - 0.006, 0.03, 0.03), (g.x - 0.006, 0.03, g.z - 0.045), 0.012, sides=6), solid(WOOD, 0.05))   # 받침 기둥
        paint(box((g.x - 0.006, 0.012, g.z - 0.05), 0.03, 0.04, 0.012), solid(WOOD, 0.05))
        for k in range(3):   # 화살 셋 — 받침 위에 누움
            y = -0.035 + k * 0.016; z = 0.036
            paint(cyl((-0.15, y, z), (0.13, y, z), 0.004, sides=4), solid(lin(0xc9a46a), 0.05))
            paint(cone((0.13, y, z), (0.16, y, z), 0.008, 4), solid(lin(0xb8bcc4), 0.05), METAL)
            for s in (-1, 1): paint(hull([V((-0.15, y, z)), V((-0.11, y, z)), V((-0.14, y + 0.008 * s, z + 0.006))]), solid(lin(0xe8e1cf), 0.08))
    else:   # 수금(킨노르) — 울림통 위로 두 팔과 멍에, 일곱 줄
        paint(box((0, 0.02, 0.1), 0.26, 0.08, 0.14), shade(lin(0x9a6a3a), lin(0x7a4a24), k=0.06))
        paint(plate(V((0, -0.021, 0.1)), (0, -1, 0), 0.03, 0.003, sides=12), solid(lin(0x2a1a10), 0.05))   # 울림 구멍
        arms = []
        for s in (-1, 1):
            arm = crs([V((0.1 * s, 0.02, 0.165)), V((0.13 * s, 0.02, 0.3)), V((0.12 * s, 0.02, 0.43))], 6); arms.append(arm)
            paint(loft(arm, [0.016, 0.014, 0.013, 0.012, 0.012, 0.013], sides=6, wob=0), solid(lin(0x8a5a30), 0.06))
        yl, yr = arms[0][-1] + V((-0.02, 0, -0.01)), arms[1][-1] + V((0.02, 0, 0.03))
        paint(loft([yl, yr], 0.012, sides=6, wob=0), solid(lin(0x6a4020), 0.05))   # 멍에
        for k in range(7):
            x = -0.075 + k * 0.025; t = (x - yl.x) / (yr.x - yl.x); top = yl.lerp(yr, t)
            paint(loft([V((x, 0.0, 0.17)), top + V((0, -0.015, 0))], 0.0018, sides=3, wob=0), solid(lin(0xf0e6c8), 0.04))
            paint(cyl(top + V((0, -0.008, 0)), top + V((0, -0.02, 0.008)), 0.004, sides=4), solid(WOOD_D, 0.05))
        paint(box((0, -0.002, 0.172), 0.18, 0.012, 0.012), solid(lin(0x3a2a1a), 0.05))   # 줄받침
    finish('gd_38p' if peace else 'gd_38', OUT)

# ── 39 아나밈 · 파피루스 두루마리 (나일) — 펼친 두루마리·만 두루마리·갈대 단지 ──
def papyrus():
    begin(139)
    PA, PA_D, INK = lin(0xe8d6a4), lin(0xc8b07a), lin(0x2a2018)
    for x in (-0.15, 0.13):   # 펼친 두루마리 양 끝 말린 데
        paint(cyl((x, -0.14, 0.022), (x, 0.0, 0.022), 0.022, sides=10), shade(PA, PA_D))
    paint(box((-0.01, -0.07, 0.003), 0.28, 0.14, 0.004), solid(PA, 0.04))
    for col in range(3):
        for row in range(5):
            for k in range(3 + (row + col) % 3):
                paint(box((-0.11 + col * 0.08 + k * 0.012, -0.12 + row * 0.022, 0.0055), 0.007, 0.006, 0.001), solid(INK if (row + k) % 5 else lin(0xa02a1a), 0.05))
    for k, (y, z) in enumerate(((0.06, 0.025), (0.06 + 0.05, 0.025), (0.085, 0.07))):
        paint(cyl((-0.22, y, z), (0.0, y, z), 0.024, sides=10), shade(PA, PA_D))
        paint(ring((-0.11, y, z), 0.025, 0.004, ax=(1, 0, 0), sides=10), solid(lin(0xa03a2a), 0.05))
    jc = V((0.2, 0.1, 0)); paint(loft([jc + V((0, 0, z)) for z in (0, 0.03, 0.12, 0.17, 0.2)], [0.05, 0.07, 0.07, 0.045, 0.05], sides=12, wob=0.02), shade(lin(0x2a7a9a), lin(0x1e5a72)))   # 청색 유약 단지
    for k in range(5):
        a = k * 1.3; top = jc + V((math.cos(a) * 0.06, math.sin(a) * 0.05, 0.36 + (k % 2) * 0.05))
        paint(loft([jc + V((0, 0, 0.18)), top], 0.005, sides=3, wob=0), solid(lin(0x4f8a3a), 0.08))
        paint(cone(top - V((0, 0, 0.004)), top + V((0, 0, 0.05)), 0.035, 7), solid(lin(0x6aa244), 0.12))   # 우산 같은 꽃차례
    finish('gd_39', OUT)

# ── 40 르하빔 · 사막 소금 (리비아) — 나란히 쌓아 두 줄로 묶은 소금 판 + 굵은 소금 대접 (10/5: 엇갈려 쌓아 밧줄이 손잡이처럼 떴다) ──
def salt():
    begin(140)
    SL, SL_D = lin(0xece6da), lin(0xc4bcae)
    for k in range(4):
        c = V((0.04 + (random.random() - 0.5) * 0.02, 0.04, 0.035 + k * 0.066))
        paint(hull([c + V((x * 0.17 + (random.random() - 0.5) * 0.012, y * 0.1 + (random.random() - 0.5) * 0.01, z * 0.032)) for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]), shade(SL, SL_D, k=0.1))
    for x in (-0.06, 0.13): paint(ring((x, 0.04, 0.134), 0.1, 0.008, ax=(1, 0, 0), sides=14, ell=(1.12, 1.4)), solid(ROPE, 0.06))
    c = V((-0.2, -0.17, 0)); paint(loft([c, c + V((0, 0, 0.03)), c + V((0, 0, 0.06))], [0.05, 0.075, 0.085], sides=12, wob=0.02), shade(CLAY, CLAY_D))
    for k in range(14):
        a = random.random() * 6.28; r = random.random() * 0.06
        paint(box(c + V((math.cos(a) * r, math.sin(a) * r, 0.065 + random.random() * 0.012)), 0.018, 0.018, 0.018, rz=random.random() * 3, rx=random.random()), solid(SL, 0.06))
    finish('gd_40', OUT)

# ── 41 납두힘 · 나일 연꽃 — 청색 유약 대접의 물 위 연잎과 푸른 연꽃 ──
def lotus():
    begin(141)
    FA, WATER = lin(0x2a8aa0), lin(0x8ac8d8)
    paint(loft([V((0, 0, 0)), V((0, 0, 0.03)), V((0, 0, 0.08))], [0.13, 0.21, 0.25], sides=20, wob=0.01), lambda p_, n: jit(WATER, 0.03) if n.z > 0.9 else jit(FA, 0.06), METAL)
    paint(ring((0, 0, 0.08), 0.25, 0.01, sides=20), solid(lin(0x1e6a80), 0.05), METAL)
    for (x, y, r) in ((-0.1, 0.06, 0.06), (0.08, 0.1, 0.05), (0.1, -0.09, 0.055), (-0.06, -0.11, 0.045)):
        paint(disc((x, y, 0.08), r, 0.005, 12), shade(lin(0x4a9a3a), lin(0x3a7a2a), k=0.08))   # 연잎
    PET, PET_T = lin(0x6a8ae0), lin(0xc8d4f8)
    for k, (x, y, h, s) in enumerate(((0.0, 0.0, 0.2, 1.0), (-0.1, -0.02, 0.15, 0.8), (0.09, 0.03, 0.17, 0.85))):
        c = V((x, y, 0.08 + h)); paint(loft([V((x, y, 0.08)), c], 0.006, sides=4, wob=0), solid(lin(0x4a8a3a), 0.08))
        for ring_i, (cnt, ln, tilt) in enumerate(((8, 0.07, 0.55), (8, 0.06, 0.3))):
            for j in range(cnt):
                a = j / cnt * 2 * math.pi + ring_i * 0.4; d = V((math.cos(a) * math.sin(tilt), math.sin(a) * math.sin(tilt), math.cos(tilt)))
                sd = V((-math.sin(a), math.cos(a), 0))
                paint(hull([c, c + d * ln * s * 0.5 + sd * 0.016 * s, c + d * ln * s * 0.5 - sd * 0.016 * s, c + d * ln * s, c + d * ln * s * 0.5 + d.cross(sd) * 0.004]), lambda p_, n, cc=c: jit(PET_T if (p_ - cc).length > 0.035 * s else PET, 0.05))
        paint(blob(c + V((0, 0, 0.012)), (0.014, 0.014, 0.01), n=8), solid(lin(0xf5d24a), 0.05))
    b = V((0.15, -0.02, 0.08)); paint(loft([b, b + V((0.01, 0, 0.12))], 0.005, sides=4, wob=0), solid(lin(0x4a8a3a), 0.08))   # 봉오리
    paint(loft([b + V((0.01, 0, 0.11)), b + V((0.01, 0, 0.14)), b + V((0.012, 0, 0.17))], [0.012, 0.016, 0.002], sides=6, wob=0), solid(PET, 0.06))
    finish('gd_41', OUT)

# ── 42 바드루심 · 옥합(설화석고 향유병) (막 14:3) — 목이 긴 옥합·둥근 옥합·향유 접시 ──
def alabaster():
    begin(142)
    AL, VEIN = lin(0xf2ecdc), lin(0xd8c8a8)
    alc = lambda p_, n: jit(VEIN if random.random() < 0.25 else AL, 0.04)
    paint(box((0, 0, 0.012), 0.44, 0.26, 0.024), shade(lin(0x9a948a), lin(0x7a746a)))   # 돌판
    c = V((-0.08, 0.03, 0.024)); zs = [0, 0.02, 0.07, 0.15, 0.21, 0.25, 0.28, 0.3]; rs = [0.04, 0.062, 0.078, 0.072, 0.045, 0.02, 0.018, 0.03]
    paint(loft([c + V((0, 0, z)) for z in zs], rs, sides=14, wob=0.01), alc, METAL)
    paint(disc(c + V((0, 0, 0.3)), 0.028, 0.01, 10), solid(lin(0xb03a3a), 0.05))   # 봉한 마개
    c2 = V((0.1, 0.05, 0.024)); paint(loft([c2 + V((0, 0, z)) for z in (0, 0.02, 0.08, 0.13, 0.15)], [0.04, 0.07, 0.075, 0.045, 0.05], sides=14, wob=0.01), alc, METAL)
    paint(blob(c2 + V((0, 0, 0.16)), (0.05, 0.05, 0.018), n=12, jitter=0.05), solid(AL, 0.04), METAL)   # 뚜껑
    d = V((0.1, -0.08, 0.024)); paint(loft([d, d + V((0, 0, 0.015)), d + V((0, 0, 0.03))], [0.04, 0.055, 0.06], sides=12, wob=0), lambda p_, n: jit(lin(0xe0b040), 0.04) if n.z > 0.9 else jit(AL, 0.04), METAL)   # 향유 접시
    finish('gd_42', OUT)

# ── 43 가슬루힘 · 도끼와 괭이 (삼상 13:20) — 그루터기에 박힌 도끼·누운 괭이·숫돌 ──
def axehoe():
    begin(143)
    BARK, RINGC, IRON = lin(0x6a4a30), lin(0xd8b080), lin(0x8a8e96)
    c = V((0.04, 0.06, 0))
    paint(loft([c + V((0, 0, z)) for z in (0, 0.06, 0.2)], [0.14, 0.125, 0.12], sides=14, wob=0.04), lambda p_, n: jit(RINGC if n.z > 0.9 else BARK, 0.08))
    for r in (0.04, 0.08): paint(ring(c + V((0, 0, 0.2)), r, 0.002, sides=14), solid(lin(0xb08a5a), 0.05))   # 나이테
    h = c + V((-0.02, 0, 0.2))   # 도끼날 — 그루터기 윗면에 박혔다(일부러)
    paint(hull([h + V((-0.05, 0, 0.03)), h + V((0.05, 0, 0.03)), h + V((-0.06, 0, -0.025)), h + V((0.06, 0, -0.025)), h + V((0, 0.012, 0.035)), h + V((0, -0.012, 0.035))]), solid(IRON, 0.05), METAL)
    paint(loft([h + V((0, 0, 0.04)), h + V((0.03, -0.12, 0.25))], [0.014, 0.012], sides=6, wob=0), solid(lin(0x9a6a3a), 0.05))   # 도끼 자루
    paint(loft([V((-0.3, -0.18, 0.012)), V((0.12, -0.22, 0.012))], 0.012, sides=6, wob=0), solid(lin(0x9a6a3a), 0.05))   # 괭이 자루
    paint(box((-0.3, -0.13, 0.008), 0.06, 0.09, 0.012, rz=0.1), solid(IRON, 0.05), METAL)   # 괭이 날
    paint(box((-0.3, -0.18, 0.016), 0.04, 0.03, 0.03), solid(IRON, 0.05), METAL)
    paint(box((0.24, -0.1, 0.02), 0.12, 0.05, 0.04, rz=0.3), shade(lin(0x9a9a8a), lin(0x7a7a6a)))   # 숫돌
    finish('gd_43', OUT)

# ── 44 갑도림 · 문어 무늬 꽃병 (크레타) — 문어 다리가 몸통을 감싼 그림 ──
def octopusvase():
    begin(144)
    CR, BR = lin(0xead8b8), lin(0x5a2e18)
    zs = [0, 0.03, 0.1, 0.2, 0.28, 0.33, 0.36]; rs = [0.06, 0.09, 0.15, 0.16, 0.12, 0.07, 0.078]
    paint(loft([V((0, 0, z)) for z in zs], rs, sides=18, wob=0.01), solid(CR, 0.04))
    def rz(z):
        for i in range(len(zs) - 1):
            if zs[i] <= z <= zs[i + 1]: t = (z - zs[i]) / (zs[i + 1] - zs[i]); return rs[i] + (rs[i + 1] - rs[i]) * t
        return rs[-1]
    P = lambda a, z, o=0.004: V((math.cos(a) * (rz(z) + o), math.sin(a) * (rz(z) + o), z))
    for z in (0.045, 0.3): paint(ring((0, 0, z), rz(z) + 0.003, 0.005, sides=18), solid(BR, 0.05))
    f = -math.pi / 2   # 앞
    paint(blob(P(f, 0.235, 0.006), (0.05, 0.014, 0.06), n=14, jitter=0.05), solid(BR, 0.05))   # 문어 머리
    for e in (-1, 1): paint(blob(P(f + e * 0.16, 0.215, 0.012), (0.009, 0.006, 0.009), n=8), solid(CR, 0.03))   # 눈
    for k in range(8):
        side = -1 if k < 4 else 1; j = k % 4
        pts = [P(f + side * (0.05 + t * (0.35 + j * 0.25)) + math.sin(t * 5 + j) * 0.08, 0.2 - t * (0.08 + j * 0.03) + (0.06 * t * t if j == 3 else 0)) for t in [i / 8 for i in range(9)]]
        paint(loft(pts, [0.013 - 0.0105 * i / 8 for i in range(9)], sides=5, wob=0), solid(BR, 0.05))
    for s in (-1, 1): paint(loft(crs([P(0 if s > 0 else math.pi, 0.31, 0), P(0 if s > 0 else math.pi, 0.31, 0.05) + V((0, 0, 0.02)), P(0 if s > 0 else math.pi, 0.24, 0)], 6), 0.011, sides=5, wob=0), solid(CR, 0.04))   # 손잡이
    finish('gd_44', OUT)

# ── 45 시돈 · 백향목 재목 (왕상 5:6) — 네모로 깎아 묶은 재목 + 백향목 가지 ──
def cedartimber():
    begin(145)
    CED, CED_E = lin(0x8a4a2c), lin(0xd8a070)   # 짙은 붉은 갈색(벽돌 같았다)
    endc = lambda p_, n: jit(CED_E if abs(n.x) > 0.9 else CED, 0.07)
    for k, (y, z) in enumerate([(-0.08, 0.035), (0.0, 0.035), (0.08, 0.035), (-0.04, 0.105), (0.04, 0.105)]):
        paint(box((random.random() * 0.03 - 0.015, y, z), 0.5, 0.075, 0.07), endc)
    for x in (-0.15, 0.15): paint(loft([V((x, math.cos(a) * 0.127, 0.07 + math.sin(a) * 0.079)) for a in [k / 14 * 2 * math.pi for k in range(14)]], 0.008, sides=5, closed=True, wob=0), solid(ROPE, 0.06))   # 묶음에 꼭 맞게(고리가 손잡이처럼 떴다)
    br = crs([V((-0.12, -0.02, 0.14)), V((0.0, 0.01, 0.15)), V((0.14, -0.02, 0.15))], 6)
    paint(loft(br, 0.008, sides=5, wob=0), solid(lin(0x5a3a22), 0.05))
    for k in range(5):
        p = br[k + 1] if k + 1 < len(br) else br[-1]
        paint(blob(p + V((0, (k % 2 - 0.5) * 0.04, 0.012)), (0.05, 0.035, 0.012), n=14, jitter=0.25), solid(lin(0x3a6a3a), 0.1))   # 층층이 납작한 잎
    paint(blob(V((0.0, 0.03, 0.165)), (0.018, 0.018, 0.026), n=10, jitter=0.1), solid(lin(0x7a5a3a), 0.08))   # 솔방울
    finish('gd_45', OUT)

# ── 46 헷 · 병거 (왕상 10:29) — 🕊️ 곡식 수레 ──
def chariot(peace=False):
    begin(146)
    R = 0.14; az = R + 0.012
    for y in (-0.17, 0.17): wheel((-0.02, y, az), R, spokes=6 if not peace else 8)
    paint(cyl((-0.02, -0.21, az), (-0.02, 0.21, az), 0.011, sides=6), solid(WOOD_D, 0.05))   # 굴대
    if not peace:
        RED, TR = lin(0xa04030), GOLD
        paint(box((0.0, 0, az + 0.02), 0.2, 0.26, 0.02), shade(WOOD, WOOD_D))   # 바닥
        paint(box((0.1, 0, az + 0.12), 0.02, 0.26, 0.2), shade(RED, lin(0x7a2a20)))   # 앞 가리개
        for s in (-1, 1): paint(box((0.02, 0.125 * s, az + 0.08), 0.17, 0.012, 0.12), shade(RED, lin(0x7a2a20)))
        paint(cyl((0.1, -0.13, az + 0.22), (0.1, 0.13, az + 0.22), 0.01, sides=6), solid(TR, 0.05), METAL)
        for s in (-1, 1): paint(cyl((-0.06, 0.125 * s, az + 0.14), (0.1, 0.125 * s, az + 0.14), 0.007, sides=5), solid(TR, 0.05), METAL)
        q = V((0.07, -0.135, az + 0.05)); qt = q + V((-0.1, -0.005, 0.13))   # 옆 화살통 — 뒤로 비스듬히, 화살 깃이 보이게(곧게 세우니 기둥 같았다)
        paint(loft([q, qt], [0.022, 0.026], sides=8, wob=0), shade(LEATHER, LEATHER_D))
        dq = (qt - q).normalized()
        for k in range(4):
            o = V(((k - 1.5) * 0.008, (k % 2 - 0.5) * 0.012, 0)); t0 = qt + o; t1 = t0 + dq * 0.06
            paint(loft([t0, t1], 0.003, sides=3, wob=0), solid(lin(0xc9a46a), 0.05))
            paint(hull([t1, t1 - dq * 0.03 + V((0, 0.008, 0)), t1 - dq * 0.03 - V((0, 0.008, 0)), t1 + V((0, 0, 0.004))]), solid(lin(0xe8e1cf), 0.08))
    else:
        paint(box((0.0, 0, az + 0.02), 0.32, 0.3, 0.02), shade(WOOD, WOOD_D))
        for s in (-1, 1):
            for k in range(5): paint(cyl((-0.15 + k * 0.075, 0.145 * s, az + 0.03), (-0.15 + k * 0.075, 0.145 * s, az + 0.12), 0.007, sides=5), solid(WOOD, 0.05))
            paint(cyl((-0.16, 0.145 * s, az + 0.12), (0.16, 0.145 * s, az + 0.12), 0.008, sides=5), solid(WOOD_D, 0.05))
        for k, (y, z) in enumerate(((-0.08, 0.04), (0.0, 0.04), (0.08, 0.04), (-0.04, 0.085), (0.04, 0.085))):   # 바닥에 길게 눕혀 쌓은 곡식단(가로질러 눕혔더니 사방으로 삐져나왔다)
            wheat((-0.15, y, az + z), h=0.24, n=8, spread=0.022, band=0.08, lean=(1, 0, 0.12))
    pole = crs([V((0.1, 0, az + 0.02)), V((0.3, 0, az + 0.06)), V((0.44, 0, az + 0.12))], 6)
    paint(loft(pole, 0.012, sides=6, wob=0), solid(WOOD, 0.05))   # 끌채
    y0 = pole[-1]; paint(cyl(y0 + V((0, -0.12, 0)), y0 + V((0, 0.12, 0)), 0.012, sides=6), solid(WOOD_D, 0.05))   # 멍에
    paint(cyl((y0.x, 0, 0), (y0.x, 0, y0.z - 0.01), 0.012, sides=6), solid(WOOD_D, 0.05))   # 멍에 받침 — 끌채가 공중에 뜨지 않게
    paint(box((y0.x, 0, 0.01), 0.06, 0.06, 0.02), solid(WOOD_D, 0.05))
    finish('gd_46p' if peace else 'gd_46', OUT)

# ── 47 여부스 · 타작마당의 곡식단 (삼하 24:18) — 돌 타작마당·곡식 더미·선 곡식단·쇠스랑 ──
def threshing():
    begin(147)
    paint(disc((0, 0, 0), 0.28, 0.025, 20), shade(lin(0xb8a888), lin(0x968868)))
    for k in range(16): a = k / 16 * 2 * math.pi; paint(blob((math.cos(a) * 0.28, math.sin(a) * 0.28, 0.03), (0.035, 0.03, 0.025), n=10, jitter=0.3), solid(lin(0x8a8070), 0.1))
    paint(blob((0.06, -0.05, 0.025), (0.13, 0.1, 0.07), n=26, jitter=0.15), solid(lin(0xe0bc5a), 0.1))   # 곡식 더미
    paint(blob((0.03, -0.02, 0.025), (0.07, 0.06, 0.03), n=14, jitter=0.2), solid(lin(0xcaa45a), 0.1))
    wheat((-0.13, 0.1, 0.025), h=0.36); wheat((-0.02, 0.15, 0.025), h=0.33, n=9)
    f0, f1 = V((-0.2, -0.15, 0.035)), V((0.12, -0.21, 0.035))
    paint(loft([f0, f1], 0.009, sides=6, wob=0), solid(WOOD, 0.05))   # 쇠스랑 자루
    d = (f1 - f0).normalized(); sd = V((-d.y, d.x, 0))
    for k in range(4): paint(loft([f1 + sd * (k - 1.5) * 0.018, f1 + sd * (k - 1.5) * 0.024 + d * 0.07], 0.004, sides=4, wob=0), solid(WOOD, 0.05))
    paint(loft([f1 - sd * 0.03, f1 + sd * 0.03], 0.006, sides=4, wob=0), solid(WOOD_D, 0.05))
    finish('gd_47', OUT)

# ── 48 아모리 · 상수리나무 묘목 (암 2:9) — 삼베로 싼 뿌리분 + 어린 나무 + 도토리 ──
def oaksapling():
    begin(148)
    paint(blob((0, 0, 0.075), (0.11, 0.11, 0.08), n=26, jitter=0.1), shade(lin(0xb09060), lin(0x8a7048), k=0.1))   # 삼베 뿌리분
    paint(ring((0, 0, 0.1), 0.098, 0.008, sides=14), solid(ROPE, 0.06))
    paint(disc((0, 0, 0.145), 0.06, 0.008, 12), solid(lin(0x3a2616), 0.1))
    trunk = crs([V((0, 0, 0.14)), V((0.01, 0, 0.3)), V((0.025, 0.01, 0.48))], 8)
    paint(loft(trunk, [0.018, 0.016, 0.014, 0.012, 0.011, 0.01, 0.009, 0.008], sides=6, wob=0.05), solid(lin(0x6a5a48), 0.08))
    tips = [trunk[-1] + V((0, 0, 0.03))]
    for k, (t, dx, dy, dz) in enumerate(((3, -0.12, 0.02, 0.08), (4, 0.11, -0.03, 0.09), (5, -0.06, -0.08, 0.06), (6, 0.07, 0.08, 0.05))):
        b = trunk[t]; e = b + V((dx, dy, dz)); tips.append(e)
        paint(loft([b, e], [0.007, 0.004], sides=5, wob=0), solid(lin(0x6a5a48), 0.08))
    for k, e in enumerate(tips):
        for j in range(3): paint(blob(e + V(((j - 1) * 0.03, (j % 2) * 0.02, (j % 2) * 0.015)), (0.045, 0.04, 0.03), n=14, jitter=0.35), solid(lin(0x4f8a34) if (k + j) % 2 else lin(0x6a9a40), 0.1))
    def acorn(p):
        p = V(p); paint(blob(p, (0.012, 0.012, 0.016), n=10), solid(lin(0xb08a4a), 0.06)); paint(blob(p + V((0, 0, 0.011)), (0.013, 0.013, 0.007), n=10, jitter=0.3), solid(lin(0x6a4a2a), 0.08))
    acorn(tips[1] + V((0.02, -0.03, -0.035))); acorn(tips[2] + V((-0.02, 0.02, -0.035)))
    acorn((0.15, -0.1, 0.016)); acorn((0.18, -0.06, 0.016))
    finish('gd_48', OUT)

# ── 49 기르가스 · 무화과 — 납작한 광주리 · 무화과 잎 · 반 가른 무화과 ──
def fig(p, d, s, col):
    p = V(p); d = V(d).normalized(); R, L = 0.032 * s, 0.07 * s
    paint(loft([p + d * (t * L) for t in (0, 0.2, 0.5, 0.8, 1.0)], [R * f for f in (0.45, 0.95, 0.9, 0.45, 0.15)], sides=10, wob=0.04), shade(col, jit(col, 0.3), k=0.06))
    paint(loft([p + d * L, p + d * (L + 0.012)], 0.004, sides=4, wob=0), solid(lin(0x6a8a3a), 0.05))
def figs():
    begin(149)
    paint(loft([V((0, 0, 0)), V((0, 0, 0.02)), V((0, 0, 0.045))], [0.18, 0.22, 0.235], sides=18, wob=0.02), lambda p_, n: jit(lin(0xb08a4a) if n.z > 0.9 else lin(0xc9a46a), 0.1))
    for k in range(14): a = k / 14 * 6.28; paint(loft([V((math.cos(a) * 0.18, math.sin(a) * 0.18, 0.0)), V((math.cos(a) * 0.235, math.sin(a) * 0.235, 0.045))], 0.005, sides=4, wob=0), solid(lin(0x8a6a3a), 0.08))
    for j, a0 in enumerate((0.6, 2.4)):   # 잎 — 세 갈래를 납작한 덩이 셋으로
        for k in range(3):
            a = a0 + (k - 1) * 0.6; paint(blob((math.cos(a) * 0.1, math.sin(a) * 0.1, 0.05), (0.07, 0.035, 0.006), n=12, jitter=0.15), solid(lin(0x4a8a3a), 0.08))
    PUR, GRN = lin(0x5a2a4a), lin(0x8a9a4a)
    for k, (x, y, z, dx, dy) in enumerate(((-0.05, 0.0, 0.06, 0.2, 0.1), (0.04, 0.03, 0.06, -0.1, 0.4), (0.0, -0.07, 0.06, 0.4, -0.2), (0.08, -0.03, 0.06, 0.2, 0.3), (-0.08, 0.08, 0.06, 0.1, -0.3), (-0.01, 0.02, 0.1, 0.3, 0.2))):
        fig((x, y, z), (dx, dy, 0.25), 1.0, PUR if k % 3 else GRN)
    c = V((0.26, -0.13, 0.005)); paint(loft([c + V((0, 0, z)) for z in (0, 0.012, 0.024, 0.03)], [0.022, 0.03, 0.026, 0.0], sides=12, wob=0), lambda p_, n: jit(PUR, 0.05))   # 반 가른 무화과(뒤집어 놓은 껍질)
    paint(plate(V((0.2, -0.17, 0.002)), (0, 0, 1), 0.03, 0.022, sides=12), lambda p_, n: jit(lin(0xe05a6a), 0.05) if n.z > 0.9 else jit(PUR, 0.05))   # 갈라진 속 — 붉은 속살
    for k in range(10): a = k * 2.4; r = 0.022 * math.sqrt((k + 0.5) / 10); paint(blob((0.2 + math.cos(a) * r, -0.17 + math.sin(a) * r, 0.025), (0.003, 0.003, 0.002), n=6), solid(lin(0xf0d090), 0.05))
    finish('gd_49', OUT)

# ── 50 히위 · 땔나무 단과 물 항아리 (수 9:21) ──
def woodwater():
    begin(150)
    rows = [(-0.04, 0.03), (0.0, 0.03), (0.04, 0.03), (-0.02, 0.065), (0.02, 0.065), (0.0, 0.1)]
    for k, (y, z) in enumerate(rows):
        r = 0.015 + random.random() * 0.006; x0 = -0.25 + random.random() * 0.04; x1 = 0.17 - random.random() * 0.04
        paint(loft([V((x0, y - 0.06, z - 0.012)), V((x1, y - 0.06, z - 0.012 + (random.random() - 0.5) * 0.01))], r, sides=6, wob=0.08), lambda p_, n: jit(lin(0xd0a878) if abs(n.x) > 0.85 else lin(0x7a5a3a), 0.1))
    for x in (-0.14, 0.06): paint(ring((x, -0.06, 0.056), 0.06, 0.007, ax=(1, 0, 0), sides=12, ell=(1.2, 0.95)), solid(ROPE, 0.06))
    c = V((0.24, 0.08, 0)); zs = [0, 0.03, 0.15, 0.27, 0.32, 0.36, 0.38]; rs = [0.05, 0.085, 0.11, 0.095, 0.05, 0.04, 0.05]
    paint(loft([c + V((0, 0, z)) for z in zs], rs, sides=14, wob=0.02), lambda p_, n: jit(lin(0x3a6a8a), 0.04) if n.z > 0.9 else jit(CLAY if n.z > -0.3 else CLAY_D, 0.06))
    for s in (-1, 1): paint(loft(crs([c + V((0.04 * s, 0, 0.33)), c + V((0.1 * s, 0, 0.32)), c + V((0.09 * s, 0, 0.24))], 6), 0.011, sides=5, wob=0), solid(CLAY_D, 0.05))
    finish('gd_50', OUT)

# ── 51 알가 · 올리브기름 항아리 — 큰 항아리·주둥이 단지·기름 접시와 올리브 가지 ──
def oliveoil():
    begin(151)
    OC, OC_D, OIL = lin(0xc8a070), lin(0xa07a4e), lin(0xc8a020)
    c = V((-0.1, 0.06, 0)); zs = [0, 0.03, 0.14, 0.26, 0.31, 0.34, 0.36]; rs = [0.05, 0.1, 0.13, 0.11, 0.055, 0.045, 0.055]
    paint(loft([c + V((0, 0, z)) for z in zs], rs, sides=14, wob=0.02), shade(OC, OC_D, k=0.06))
    for s in (-1, 1): paint(loft(crs([c + V((0.045 * s, 0, 0.32)), c + V((0.11 * s, 0, 0.31)), c + V((0.11 * s, 0, 0.22))], 6), 0.012, sides=5, wob=0), solid(OC_D, 0.05))
    paint(blob(c + V((0, 0, 0.365)), (0.06, 0.06, 0.02), n=12, jitter=0.2), solid(LINEN, 0.08)); paint(ring(c + V((0, 0, 0.345)), 0.05, 0.006, sides=12), solid(ROPE, 0.05))   # 천으로 봉함
    c2 = V((0.13, 0.1, 0)); paint(loft([c2 + V((0, 0, z)) for z in (0, 0.02, 0.1, 0.16, 0.2)], [0.04, 0.065, 0.07, 0.035, 0.04], sides=12, wob=0.02), shade(OC, OC_D))
    paint(loft([c2 + V((0.03, 0, 0.17)), c2 + V((0.08, -0.02, 0.21))], [0.012, 0.007], sides=5, wob=0), solid(OC_D, 0.05))   # 주둥이
    d = V((0.07, -0.15, 0)); paint(loft([d, d + V((0, 0, 0.015)), d + V((0, 0, 0.03))], [0.045, 0.065, 0.07], sides=14, wob=0), lambda p_, n: jit(OIL, 0.04) if n.z > 0.9 else jit(OC, 0.05), METAL)
    br = crs([V((-0.28, -0.14, 0.01)), V((-0.15, -0.16, 0.012)), V((-0.02, -0.2, 0.01))], 6)
    paint(loft(br, 0.006, sides=5, wob=0), solid(lin(0x6a5a40), 0.05))
    for k in range(9):
        p = br[k % 5 + 1]; a = k * 2.1; dd = V((math.cos(a), math.sin(a), 0.15)).normalized()
        paint(hull([p, p + dd * 0.035 + V((-dd.y, dd.x, 0)) * 0.009, p + dd * 0.035 - V((-dd.y, dd.x, 0)) * 0.009, p + dd * 0.065, p + dd * 0.03 + V((0, 0, 0.003))]), solid(lin(0x8a9a6a), 0.08))   # 은빛 잎
    for k in range(6): paint(blob(br[k % 5] + V(((k % 3 - 1) * 0.015, 0.02, 0.012)), (0.012, 0.01, 0.01), n=10), solid(lin(0x3a2a3a) if k % 2 else lin(0x6a7a30), 0.06))   # 올리브 열매
    finish('gd_51', OUT)

# ── 52 신 · 아마 실타래 — 장대에 건 실타래 · 묶어 세운 아마 줄기 · 가락 ──
def flax():
    begin(152)
    TH = lin(0xeee2c4)
    paint(box((0, 0.04, 0.012), 0.46, 0.12, 0.024), shade(WOOD_D, lin(0x4a2e16)))
    for x in (-0.2, 0.2): paint(cyl((x, 0.04, 0.024), (x, 0.04, 0.38), 0.012, sides=6), solid(WOOD, 0.05))
    paint(cyl((-0.21, 0.04, 0.37), (0.21, 0.04, 0.37), 0.01, sides=6), solid(WOOD_D, 0.05))
    for x in (-0.09, 0.0, 0.09):   # 늘어진 실타래 — 장대에 걸린 긴 고리, 가닥 셋
        for s in range(3):
            pts = [V((x + (s - 1) * 0.008 + math.sin(a) * 0.032, 0.04 + math.cos(a) * 0.012, 0.37 - 0.1 * (1 - math.cos(a)) * 0.98)) for a in [k / 16 * 2 * math.pi for k in range(16)]]
            paint(loft(pts, 0.007, sides=4, closed=True, wob=0), solid(TH, 0.05))
        paint(ring((x, 0.04, 0.2), 0.03, 0.005, ax=(0, 0, 1), sides=10, ell=(1.1, 0.5)), solid(lin(0x2a4fa0), 0.05))   # 묶은 끈
    wheat((-0.31, -0.08, 0), h=0.34, n=14, spread=0.03, band=0.12)   # 아마 단 — 곡식단 모양을 빌림(이삭 대신 둥근 씨주머니처럼 보인다)
    sp = V((0.12, -0.15, 0.022)); paint(loft([sp - V((0.12, 0, 0)), sp + V((0.06, 0, 0))], 0.005, sides=4, wob=0), solid(WOOD, 0.05))   # 가락
    paint(plate(sp + V((0.04, 0, 0)), (1, 0, 0), 0.022, 0.01, sides=10), solid(lin(0x7a5a3a), 0.05))   # 가락바퀴
    paint(loft([sp - V((0.06, 0, 0)), sp + V((0.035, 0, 0))], [0.008, 0.02], sides=8, wob=0.05), solid(TH, 0.05))   # 감긴 실
    finish('gd_52', OUT)

# ── 53 아르왓 · 사공의 노 (겔 27:8) — 걸이에 기댄 노 둘 + 사린 밧줄 ──
def oars():
    begin(153)
    a = 0.32
    bar = None
    for sx in (-1, 1):
        B = V((0.08 * sx, -0.1, 0.0)); d = V((0.06 * sx, math.sin(a), math.cos(a))).normalized()
        u = V((1, 0, 0)) - d * d.x; u.normalize(); n = d.cross(u)
        q = [B + d * t + u * s * w + n * o for t, w in ((0.0, 0.03), (0.17, 0.03)) for s in (-1, 1) for o in (-0.006, 0.006)]
        paint(hull(q), lambda p_, nn, B=B, d=d: jit(lin(0x2a6aa0) if (p_ - B).dot(d) < 0.04 else lin(0xc89a60), 0.05))   # 노깃 — 끝에 청색 띠
        paint(loft([B + d * 0.16, B + d * 0.62], [0.014, 0.012], sides=6, wob=0), solid(lin(0xc89a60), 0.05))   # 노자루
        paint(loft([B + d * 0.58, B + d * 0.66], 0.016, sides=6, wob=0), solid(LEATHER_D, 0.05))   # 손잡이
        P = B + d * 0.45; bar = P + V((0, math.cos(a), -math.sin(a))) * 0.026
    for x in (-0.24, 0.24): paint(cyl((x, bar.y, 0), (x, bar.y, bar.z + 0.03), 0.012, sides=6), solid(WOOD, 0.05))
    paint(cyl((-0.25, bar.y, bar.z), (0.25, bar.y, bar.z), 0.012, sides=6), solid(WOOD_D, 0.05))
    coil = [V((0.2 + math.cos(t) * (0.025 + t * 0.006), -0.18 + math.sin(t) * (0.025 + t * 0.006), 0.011)) for t in [k * 0.35 for k in range(32)]]
    paint(loft(coil, 0.01, sides=5, wob=0), solid(ROPE, 0.06))
    finish('gd_53', OUT)

# ── 54 스말 · 자주 물감 단지 (뿔고둥) — 자주 물감 단지·걸친 물든 천·뿔고둥 ──
def murex(p, d, s=1.0):
    p = V(p); d = V(d).normalized(); u, w = basis(d)
    paint(loft([p + d * t * s for t in (0, 0.02, 0.05, 0.08, 0.1)], [0.012 * s, 0.03 * s, 0.032 * s, 0.018 * s, 0.004 * s], sides=8, wob=0.1), shade(lin(0xe0c8a8), lin(0xb09a7a)))
    paint(loft([p, p - d * 0.06 * s], [0.008 * s, 0.003 * s], sides=5, wob=0), solid(lin(0xd0b898), 0.05))   # 긴 수관
    for k in range(6):
        a = k / 6 * 2 * math.pi; q = p + d * 0.05 * s + (u * math.cos(a) + w * math.sin(a)) * 0.03 * s
        paint(cone(q, q + (u * math.cos(a) + w * math.sin(a)) * 0.02 * s + d * 0.005, 0.005 * s, 4), solid(lin(0xc8b090), 0.06))
def purpledye():
    begin(154)
    PU = lin(0x6a1a7a)
    c = V((-0.05, 0.05, 0)); zs = [0, 0.03, 0.12, 0.2, 0.24]; rs = [0.08, 0.12, 0.15, 0.14, 0.15]
    paint(loft([c + V((0, 0, z)) for z in zs], rs, sides=16, wob=0.02), lambda p_, n: jit(lin(0x4a1050), 0.04) if n.z > 0.9 else jit(CLAY if n.z > -0.3 else CLAY_D, 0.06))
    paint(ring(c + V((0, 0, 0.24)), 0.15, 0.012, sides=16), solid(CLAY_D, 0.05))
    path = [c + V((0.06, 0, 0.245)), c + V((0.13, 0, 0.262)), c + V((0.165, 0, 0.25)), c + V((0.172, 0, 0.18)), c + V((0.168, 0, 0.1)), c + V((0.18, 0, 0.03))]
    nrm = [V((0, 0, 1)), V((0.3, 0, 1)), V((1, 0, 0.6)), V((1, 0, 0.05)), V((1, 0, -0.05)), V((1, 0, 0.2))]
    paint(strip(path, 0.11, nrm, th=0.008), solid(PU, 0.06))   # 물든 천 — 단지 안에서 테두리를 넘어 밖으로
    paint(loft([c + V((-0.04, 0.03, 0.22)), c + V((-0.12, 0.08, 0.42))], 0.008, sides=5, wob=0), solid(WOOD, 0.05))   # 젓는 막대
    for k, (x, y, dx, dy) in enumerate(((0.2, -0.12, 1, 0.3), (0.06, -0.19, -0.4, 1), (-0.18, -0.15, -1, 0.4), (0.24, 0.0, 0.2, 1))):
        murex((x, y, 0.028), (dx, dy, 0.1), 1.0 if k % 2 == 0 else 0.85)
    finish('gd_54', OUT)

# ── 55 하맛 · 물레바퀴 (오론테스 강) — 물길에 잠긴 바퀴와 두레박 ──
def waterwheel():
    begin(155)
    paint(box((0, 0, 0.03), 0.56, 0.18, 0.06), lambda p_, n: jit(lin(0x4a8ab0), 0.04) if n.z > 0.9 else jit(lin(0x8a8070), 0.06))   # 물길 — 윗면은 물
    R, cz = 0.21, 0.27
    for y in (-0.045, 0.045): paint(ring((0, y, cz), R, 0.011, ax=(0, 1, 0), sides=24), shade(WOOD, WOOD_D))
    for y in (-0.045, 0.045):
        for k in range(8): a = k / 8 * 2 * math.pi; paint(loft([V((0, y, cz)), V((math.cos(a) * R, y, cz + math.sin(a) * R))], 0.008, sides=5, wob=0), solid(WOOD, 0.05))
    for k in range(12):
        a = k / 12 * 2 * math.pi + 0.13; p = V((math.cos(a) * R, 0, cz + math.sin(a) * R))
        paint(box(p, 0.03, 0.1, 0.012, rz=0, rx=0), solid(WOOD_D, 0.05))
        if k % 2 == 0: paint(loft([p + V((0, 0, 0)), p + V((math.cos(a) * 0.04, 0, math.sin(a) * 0.04))], [0.018, 0.022], sides=8, wob=0), shade(CLAY, CLAY_D))   # 두레박 단지
    paint(cyl((0, -0.1, cz), (0, 0.1, cz), 0.014, sides=8), solid(WOOD_D, 0.05))   # 굴대
    for y in (-0.1, 0.1):   # A자 받침 — 물길 밖 땅에
        for sx in (-1, 1): paint(loft([V((0.18 * sx, y, 0.0)), V((0, y, cz + 0.01))], 0.012, sides=6, wob=0), solid(WOOD, 0.05))
    for y in (-0.115, 0.115):
        for sx in (-1, 1): paint(box((0.18 * sx, y, 0.012), 0.05, 0.05, 0.024), solid(lin(0x8a8070), 0.06))
    finish('gd_55', OUT)

HAM = {'26': topaz, '27': sail, '28': shield, '28p': lambda: shield(True), '29': milkhoney, '30': ebony, '31': puregold, '32': mirror, '33': gems,
       '34': drum, '35': spices, '36': ivory, '37': spear, '37p': lambda: spear(True), '38': bow, '38p': lambda: bow(True), '39': papyrus, '40': salt,
       '41': lotus, '42': alabaster, '43': axehoe, '44': octopusvase, '45': cedartimber, '46': chariot, '46p': lambda: chariot(True), '47': threshing,
       '48': oaksapling, '49': figs, '50': woodwater, '51': oliveoil, '52': flax, '53': oars, '54': purpledye, '55': waterwheel}


# ════════ 야벳의 자손 56~69 (10/5) — 바닷가 섬 나라들 ════════
def quad_strip(rows, col_fn, mat=BASE, th=0.006):
    """점 격자 rows[i][j] 로 이은 얇은 면 — 칸마다 볼록 껍질(오목한 한 장을 피한다). 뒤로 th 두께"""
    for i in range(len(rows) - 1):
        for j in range(len(rows[i]) - 1):
            q = [rows[i][j], rows[i][j + 1], rows[i + 1][j], rows[i + 1][j + 1]]
            nrm = (q[1] - q[0]).cross(q[2] - q[0]).normalized()
            paint(hull(q + [p - nrm * th for p in q]), col_fn, mat)

# ── 56 고멜 · 털가죽 외투 (북방) — 걸이에 건 털 외투, 목둘레 털·뼈 단추 ──
def furcloak():
    begin(156)
    FUR, FUR_D, COL = lin(0x7a5434), lin(0x5a3a22), lin(0xd8c8a8)
    paint(box((0, 0.03, 0.015), 0.34, 0.16, 0.03), shade(WOOD_D, lin(0x4a2e16)))
    paint(cyl((0, 0.06, 0.03), (0, 0.06, 0.58), 0.014, sides=6), solid(WOOD, 0.05))
    paint(cyl((-0.19, 0.06, 0.52), (0.19, 0.06, 0.52), 0.012, sides=6), solid(WOOD_D, 0.05))   # 어깨 걸이
    rows = []
    for zi in range(7):   # 어깨(z 0.52)에서 단(0.1)까지 — 아래로 갈수록 넓고, 앞으로 둥글게 감싼다
        t = zi / 6; z = 0.52 - t * 0.42; hw = 0.19 + t * 0.06
        rows.append([V((x * hw, 0.06 - 0.05 * math.cos(x * 1.4) - 0.012 * math.sin(x * 9 + t * 4), z)) for x in [-1 + k / 6 * 2 for k in range(7)]])
    quad_strip(rows, lambda p_, n: jit(FUR if n.y < 0 else FUR_D, 0.05), th=0.016)   # 얼룩 없이 — 안쪽만 짙게
    for k in range(11):   # 목둘레 털
        x = -0.17 + k * 0.034; paint(blob((x, 0.03 - 0.01 * (1 - abs(x) / 0.17), 0.53), (0.03, 0.03, 0.03), n=10, jitter=0.35), solid(COL, 0.1))
    for k in range(9):    # 단 둘레 털
        x = -0.22 + k * 0.055; paint(blob((x, 0.06 - 0.05 * math.cos(x / 0.25 * 1.4), 0.1), (0.032, 0.022, 0.02), n=10, jitter=0.35), solid(COL, 0.1))
    for z in (0.44, 0.34, 0.24): paint(blob((0, -0.002 + (0.52 - z) * 0.0, z), (0.012, 0.02, 0.008), n=8), solid(lin(0xf0e6cc), 0.05))   # 뼈 단추
    finish('gd_56', OUT)

# ── 57 마곡 · 칼을 쳐서 만든 보습 (사 2:4) — 쇠 보습을 낀 나무 쟁기 + 날을 잘라 낸 칼자루 ──
def plowshare():
    begin(157)
    IRON, IRON_HI = lin(0x8a8e96), lin(0xc8ccd4)
    beam = crs([V((0.3, 0, 0.03)), V((0.1, 0, 0.12)), V((-0.12, 0, 0.18)), V((-0.32, 0, 0.17))], 8)
    paint(loft(beam, 0.016, sides=6, wob=0.03), solid(WOOD, 0.06))   # 끌채
    paint(loft([V((0.18, 0, 0.0)), V((0.12, 0, 0.02)), V((0.0, 0, 0.03))], [0.02, 0.022, 0.018], sides=6, wob=0), solid(WOOD_D, 0.05))   # 바닥 나무
    paint(loft([V((0.02, 0, 0.03)), V((0.08, 0, 0.12)), V((-0.06, 0, 0.36))], [0.014, 0.013, 0.012], sides=6, wob=0), solid(WOOD, 0.05))   # 손잡이
    paint(loft([V((-0.07, 0, 0.35)), V((-0.05, 0, 0.38))], 0.02, sides=6, wob=0), solid(LEATHER_D, 0.05))
    s0 = V((0.18, 0, 0.012))   # 쇠 보습 — 칼날을 두드려 편 넓은 세모
    paint(hull([s0, s0 + V((0.1, 0, -0.008)), s0 + V((0.0, 0.04, 0.02)), s0 + V((0.0, -0.04, 0.02)), s0 + V((-0.03, 0, 0.03)), s0 + V((0.05, 0, 0.022))]), lambda p_, n: jit(IRON_HI if n.z > 0.3 else IRON, 0.05), METAL)
    h = V((-0.08, -0.17, 0.012))   # 날을 잘라 낸 칼자루 — 코등이·손잡이·자루끝
    paint(box(h, 0.012, 0.09, 0.016), solid(BRONZE, 0.05), METAL)
    paint(loft([h + V((-0.008, 0, 0)), h + V((-0.09, 0, 0))], 0.012, sides=6, wob=0), solid(LEATHER_D, 0.05))
    paint(blob(h + V((-0.1, 0, 0)), (0.016, 0.016, 0.014), n=8), solid(BRONZE, 0.05), METAL)
    paint(box(h + V((0.03, 0, 0)), 0.05, 0.03, 0.008), solid(IRON, 0.05), METAL)   # 잘린 날 밑동
    finish('gd_57', OUT)

# ── 58 마대 · 메대 융단 — 펼친 융단(가운데 메달·테두리·술) + 말아 세운 융단 ──
def carpet():
    begin(158)
    RED, NAVY, GOLDY, IVORY = lin(0x9a2a2a), lin(0x22305a), lin(0xd8a840), lin(0xead8b0)
    cx, cy, L, Wd = -0.04, -0.03, 0.44, 0.3
    paint(box((cx, cy, 0.004), L, Wd, 0.008), solid(RED, 0.05))
    for (w, h, col) in ((L - 0.03, Wd - 0.03, NAVY), (L - 0.06, Wd - 0.06, RED)):   # 테두리 띠
        for s in (-1, 1):
            paint(box((cx, cy + s * h / 2, 0.0085), w, 0.012, 0.001), solid(col, 0.05)); paint(box((cx + s * w / 2, cy, 0.0085), 0.012, h, 0.001), solid(col, 0.05))
    paint(hull([V((cx + x, cy + y, 0.0085)) for x, y in ((0.1, 0), (-0.1, 0), (0, 0.075), (0, -0.075))] + [V((cx, cy, 0.0095))]), solid(NAVY, 0.04))   # 가운데 메달
    paint(hull([V((cx + x, cy + y, 0.0095)) for x, y in ((0.055, 0), (-0.055, 0), (0, 0.04), (0, -0.04))] + [V((cx, cy, 0.0105))]), solid(GOLDY, 0.04))
    for k in range(4):
        a = k / 4 * 2 * math.pi + math.pi / 4; paint(blob((cx + math.cos(a) * 0.15, cy + math.sin(a) * 0.09, 0.009), (0.018, 0.018, 0.002), n=8), solid(GOLDY, 0.05))   # 귀퉁이 꽃
    for s in (-1, 1):
        for k in range(12): paint(box((cx + s * (L / 2 + 0.012), cy - Wd / 2 + 0.015 + k * (Wd - 0.03) / 11, 0.002), 0.024, 0.005, 0.003), solid(IVORY, 0.05))   # 술
    c = V((0.24, 0.09, 0))   # 말아 세운 융단 — 바깥 감긴 면과 위 끝의 소용돌이
    paint(loft([c, c + V((0, 0, 0.36))], 0.045, sides=12, wob=0.01), lambda p_, n: jit(NAVY if abs(n.z) > 0.9 else (GOLDY if random.random() < 0.15 else RED), 0.05))
    sp = [c + V((math.cos(t) * (0.006 + t * 0.0028), math.sin(t) * (0.006 + t * 0.0028), 0.362)) for t in [k * 0.4 for k in range(36)]]
    paint(loft(sp, 0.0025, sides=3, wob=0), solid(GOLDY, 0.04))
    for k in range(10): a = k / 10 * 2 * math.pi; paint(loft([c + V((math.cos(a) * 0.04, math.sin(a) * 0.04, 0.36)), c + V((math.cos(a) * 0.05, math.sin(a) * 0.05, 0.39))], 0.003, sides=3, wob=0), solid(IVORY, 0.05))
    finish('gd_58', OUT)

# ── 59 야완 · 놋그릇 (겔 27:13) — 그리스 놋 섞음 독(볼류트 손잡이)·물 주전자·얕은 잔 ──
def greekbronze():
    begin(159)
    B, B_D, B_HI = lin(0xc89048), lin(0x8a5a28), lin(0xf0c070)
    brz = lambda p_, n: jit(B_HI if n.z > 0.5 else (B if random.random() > 0.35 else B_D), 0.06)
    c = V((-0.06, 0.04, 0)); zs = [0, 0.03, 0.06, 0.08, 0.17, 0.25, 0.28, 0.31]; rs = [0.06, 0.06, 0.03, 0.05, 0.12, 0.13, 0.11, 0.15]
    paint(loft([c + V((0, 0, z)) for z in zs], rs, sides=18, wob=0.0), lambda p_, n: jit(lin(0x2a2018), 0.04) if n.z > 0.95 else brz(p_, n), METAL)   # 윗면 = 어두운 속(막힌 뚜껑 같았다)
    for s in (-1, 1):   # 볼류트 손잡이 — 어깨에서 테두리 위로 솟아 말린다
        pts = crs([c + V((0.11 * s, 0, 0.25)), c + V((0.16 * s, 0, 0.3)), c + V((0.17 * s, 0, 0.36)), c + V((0.14 * s, 0, 0.37)), c + V((0.135 * s, 0, 0.34))], 8)
        paint(loft(pts, 0.011, sides=5, wob=0), solid(B, 0.05), METAL)
        paint(ring(c + V((0.15 * s, 0, 0.355)), 0.018, 0.006, ax=(0, 1, 0), sides=10), solid(B_D, 0.05), METAL)
    paint(ring(c + V((0, 0, 0.21)), 0.13, 0.006, sides=18), solid(B_HI, 0.04), METAL)   # 어깨 띠
    j = V((0.19, 0.08, 0)); paint(loft([j + V((0, 0, z)) for z in (0, 0.02, 0.1, 0.17, 0.2, 0.23)], [0.04, 0.06, 0.07, 0.04, 0.025, 0.035], sides=14, wob=0), brz, METAL)   # 물 주전자
    paint(loft(crs([j + V((-0.025, 0, 0.22)), j + V((-0.08, 0, 0.21)), j + V((-0.06, 0, 0.1))], 6), 0.008, sides=5, wob=0), solid(B_D, 0.05), METAL)
    paint(hull([j + V((0.025, 0, 0.215)), j + V((0.06, 0, 0.245)), j + V((0.03, 0.015, 0.235)), j + V((0.03, -0.015, 0.235))]), solid(B, 0.05), METAL)   # 부리
    d = V((0.14, -0.15, 0)); paint(loft([d, d + V((0, 0, 0.012)), d + V((0, 0, 0.03))], [0.03, 0.07, 0.085], sides=16, wob=0), brz, METAL)   # 얕은 잔
    paint(blob(d + V((0, 0, 0.03)), (0.02, 0.02, 0.012), n=8), solid(B_HI, 0.05), METAL)   # 가운데 배꼽
    finish('gd_59', OUT)

# ── 60 두발 · 대장간 망치와 모루 — 그루터기 위 모루·달군 쇠·망치·집게 ──
def forge():
    begin(160)
    IRON, IRON_D, HOT = lin(0x5a5e66), lin(0x3a3e44), lin(0xff8a2a)
    paint(loft([V((0, 0, z)) for z in (0, 0.05, 0.14)], [0.13, 0.12, 0.115], sides=12, wob=0.05), lambda p_, n: jit(lin(0xc8a070) if n.z > 0.9 else lin(0x6a4a30), 0.08))   # 그루터기
    t = 0.14
    paint(box((0, 0, t + 0.03), 0.12, 0.07, 0.06), solid(IRON_D, 0.05), METAL)   # 모루 허리
    paint(hull([V((x, y, z)) for x in (-0.1, 0.08) for y in (-0.045, 0.045) for z in (t + 0.06, t + 0.1)] + [V((0.16, 0, t + 0.095)), V((0.16, 0, t + 0.085))]), lambda p_, n: jit(lin(0x9aa0aa) if n.z > 0.9 else IRON, 0.05), METAL)   # 모루 몸 + 뿔
    paint(box((0.0, 0.0, t + 0.106), 0.09, 0.02, 0.012), solid(HOT, 0.05), GLOW)   # 달군 쇠
    hd = V((-0.15, -0.16, 0.03))   # 망치 — 땅에 누움
    paint(box(hd, 0.08, 0.04, 0.04, rz=0.4), lambda p_, n: jit(IRON if n.z < 0.9 else lin(0x7a7e86), 0.05), METAL)
    paint(loft([hd + V((0.01, 0.01, -0.012)), hd + V((0.1, 0.2, -0.018))], 0.011, sides=6, wob=0), solid(WOOD, 0.05))
    for s in (-1, 1): paint(loft(crs([V((0.12, -0.18, 0.008)), V((0.2, -0.17 + 0.012 * s, 0.009)), V((0.28, -0.14 + 0.025 * s, 0.008))], 6), 0.006, sides=4, wob=0), solid(IRON_D, 0.05), METAL)   # 집게
    paint(loft([V((-0.24, 0.12, 0)), V((-0.24, 0.12, 0.04)), V((-0.24, 0.12, 0.07))], [0.05, 0.065, 0.07], sides=12, wob=0.02), lambda p_, n: jit(lin(0x3a6a8a), 0.04) if n.z > 0.9 else jit(lin(0x6a5040), 0.06))   # 담금질 물통
    finish('gd_60', OUT)

# ── 61 메섹 · 청동 솥 (겔 27:13) — 세발 솥, 고리 손잡이 둘 ──
def tripod():
    begin(161)
    B, B_D, B_HI = lin(0xb88040), lin(0x7a4e22), lin(0xe8b868)
    brz = lambda p_, n: jit(B_HI if n.z > 0.5 else (B if random.random() > 0.35 else B_D), 0.06)
    zc = 0.2
    paint(loft([V((0, 0, zc + z)) for z in (-0.13, -0.11, -0.06, 0.0, 0.05, 0.07)], [0.03, 0.08, 0.15, 0.17, 0.155, 0.16], sides=18, wob=0), lambda p_, n: jit(lin(0x2a2018), 0.04) if n.z > 0.95 else brz(p_, n), METAL)   # 솥 — 윗면은 어두운 속
    paint(ring((0, 0, zc + 0.07), 0.16, 0.008, sides=18), solid(B_HI, 0.04), METAL)
    for k in range(3):
        a = k / 3 * 2 * math.pi + 0.5; top = V((math.cos(a) * 0.13, math.sin(a) * 0.13, zc + 0.02)); foot = V((math.cos(a) * 0.2, math.sin(a) * 0.2, 0))
        paint(loft([top, top.lerp(foot, 0.5) + V((0, 0, -0.01)), foot + V((0, 0, 0.02))], [0.016, 0.014, 0.016], sides=6, wob=0), solid(B_D, 0.05), METAL)
        paint(blob(foot + V((0, 0, 0.015)), (0.028, 0.028, 0.016), n=10), solid(B, 0.05), METAL)   # 짐승 발 모양 받침
    for s in (-1, 1):
        a = math.pi / 2 * s + 0.5; p = V((math.cos(a) * 0.155, math.sin(a) * 0.155, zc + 0.1))
        paint(ring(p, 0.05, 0.009, ax=(math.sin(a), -math.cos(a), 0), sides=14), solid(B, 0.05), METAL)   # 위로 선 고리 손잡이
    finish('gd_61', OUT)

# ── 62 디라스 · 뿔잔 — 받침에 꽂은 뿔잔 둘(은 테·짐승 머리 끝) + 누운 하나 ──
def horn(base, d_up, bend, L, r, col, tip_col):
    """입이 base, 몸이 휘어 끝으로 가늘어지는 뿔"""
    base = V(base); d = V(d_up).normalized(); b = V(bend).normalized()
    pts = [base + d * (t * L) * (1 - 0.3 * t) + b * (t * t * L * 0.6) for t in [i / 9 for i in range(10)]]
    paint(loft(pts, [r * (1 - 0.85 * i / 9) for i in range(10)], sides=10, wob=0.02), shade(col, jit(col, 0.25), k=0.06))
    paint(ring(base, r, 0.007, ax=d, sides=12), solid(SILVER, 0.04), METAL)   # 은 테
    paint(blob(pts[-1], (r * 0.4, r * 0.4, r * 0.4), n=10), solid(tip_col, 0.05), METAL)   # 끝 장식
    return pts
def drinkhorn():
    begin(162)
    HN, HN2 = lin(0xd8b888), lin(0x8a6a4a)
    paint(box((0, 0.03, 0.015), 0.36, 0.12, 0.03), shade(WOOD_D, lin(0x4a2e16)))
    for x, bend, col, tc in ((-0.08, (-1, 0.3, 0), HN, GOLD), (0.08, (1, -0.3, 0), HN2, SILVER)):   # 입이 위, 끝이 아래로 휜다 — 뿔이 고리에 꼭 끼는 높이에 고리를 단다
        pts = horn((x, 0.03, 0.27), (0, 0, -1), bend, 0.24, 0.045, col, tc)
        rc = pts[3]; rr = 0.045 * (1 - 0.85 * 3 / 9)
        paint(ring(rc, rr + 0.004, 0.008, sides=12), solid(BRONZE, 0.05), METAL)
        paint(cyl((rc.x, rc.y + rr + 0.012, 0.03), (rc.x, rc.y + rr + 0.012, rc.z + 0.005), 0.01, sides=6), solid(WOOD, 0.05))   # 고리를 받친 기둥 — 뒤에서
        paint(loft([V((rc.x, rc.y + rr + 0.012, rc.z)), V((rc.x, rc.y + rr + 0.004, rc.z))], 0.006, sides=4, wob=0), solid(WOOD, 0.05))
    horn((0.0, -0.17, 0.035), (-1, 0, 0.0), (0, 0.4, 0), 0.26, 0.035, HN, GOLD)
    finish('gd_62', OUT)

# ── 63 아스그나스 · 호박(琥珀) (북쪽 바닷가) — 굵은 호박 덩이·꿰어 놓은 호박 목걸이 ──
def amber():
    begin(163)
    AM, AM_D, AM_HI = lin(0xe08a1a), lin(0xa85a10), lin(0xffc050)
    paint(blob((0, 0.05, 0.035), (0.22, 0.14, 0.035), n=20, jitter=0.25), shade(lin(0x9a8a72), lin(0x7a6a52), k=0.08))   # 바닷가 유목 받침
    random.seed(63)
    for k, (x, y, s) in enumerate(((-0.08, 0.05, 0.06), (0.06, 0.07, 0.05), (0.0, 0.0, 0.045), (0.12, 0.0, 0.035), (-0.14, 0.0, 0.035))):
        paint(blob((x, y, 0.07 + s * 0.5), (s, s * 0.8, s * 0.65), n=14, jitter=0.3), lambda p_, n: jit(AM_HI if n.z > 0.5 else (AM if random.random() > 0.3 else AM_D), 0.06), GLOW if k == 0 else METAL)
    paint(blob((-0.08, 0.05, 0.1), (0.008, 0.004, 0.004), n=6), solid(lin(0x2a1a0a), 0.05))   # 갇힌 작은 벌레 — 첫 덩이 속
    for k in range(22):   # 목걸이 — 천 위에 둥글게 놓은 알
        a = k / 22 * 2 * math.pi; p = V((0.02 + math.cos(a) * 0.13, -0.2 + math.sin(a) * 0.06, 0.012))
        paint(blob(p, (0.012, 0.012, 0.011), n=8), solid(AM if k % 3 else AM_HI, 0.06), METAL)
    paint(box((0.02, -0.2, 0.002), 0.34, 0.16, 0.004), solid(lin(0x2a3a5a), 0.05))
    finish('gd_63', OUT)

# ── 64 리밧 · 통나무배 — 속을 판 통나무배, 받침목 둘, 노 하나 ──
def dugout():
    begin(164)
    LOG, LOG_D, IN = lin(0x8a6a4a), lin(0x6a4a30), lin(0x4a3220)
    xs = [-0.3, -0.26, -0.15, 0.0, 0.15, 0.26, 0.3]; rs = [0.012, 0.04, 0.06, 0.065, 0.06, 0.04, 0.012]
    pts = [V((x, 0, 0.06 + 0.02 * (abs(x) / 0.3) ** 2)) for x in xs]
    paint(loft(pts, rs, sides=12, wob=0.03, ell=(1.0, 0.72)), lambda p_, n: jit(IN if n.z > 0.45 else (LOG if n.z > -0.3 else LOG_D), 0.08))   # 윗면 = 파낸 속(어둡게)
    for x in (-0.15, 0.15): paint(box((x, 0, 0.012), 0.05, 0.16, 0.024), shade(WOOD, WOOD_D))   # 받침목
    p0, p1 = V((-0.2, -0.12, 0.012)), V((0.12, -0.16, 0.012))   # 노
    paint(loft([p0, p1], 0.008, sides=5, wob=0), solid(WOOD, 0.05))
    d = (p1 - p0).normalized(); sd = V((-d.y, d.x, 0))
    paint(hull([p1 + sd * 0.025, p1 - sd * 0.025, p1 + d * 0.1 + sd * 0.028, p1 + d * 0.1 - sd * 0.028, p1 + d * 0.11, p1 + V((0, 0, 0.005)), p1 + d * 0.1 + V((0, 0, 0.005))]), solid(WOOD, 0.05))
    finish('gd_64', OUT)

# ── 65 도갈마 · 말과 노새 (겔 27:14) — 고삐 맨 말 한 마리와 짐 실은 노새 ──
def beast(c, s, col, col_d, mane, ears=0.03, pack=False):
    c = V(c); f = V((1, 0, 0))
    body = c + V((0, 0, 0.17 * s))
    paint(blob(body, (0.13 * s, 0.055 * s, 0.06 * s), n=22, jitter=0.05), shade(col, col_d, k=0.05))
    neck0 = body + V((0.1 * s, 0, 0.03 * s)); head = body + V((0.17 * s, 0, 0.14 * s))
    paint(loft([neck0, head - V((0.02 * s, 0, 0.02 * s))], [0.045 * s, 0.03 * s], sides=8, wob=0.03), shade(col, col_d))
    paint(loft([head - V((0.02 * s, 0, 0.0)), head + V((0.06 * s, 0, -0.05 * s))], [0.03 * s, 0.022 * s], sides=8, wob=0.03), shade(col, col_d))   # 머리 — 코가 아래로
    for e in (-1, 1): paint(cone(head + V((-0.01 * s, 0.013 * s * e, 0.02 * s)), head + V((-0.015 * s, 0.018 * s * e, (0.02 + ears) * s)), 0.008 * s, 4), solid(col_d, 0.05))
    for e in (-1, 1): paint(blob(head + V((0.015 * s, 0.022 * s * e, -0.008 * s)), (0.004, 0.003, 0.004), n=6), solid(lin(0x1a1410), 0.03))   # 눈
    for k in range(5): t = k / 4; paint(blob(neck0.lerp(head, t) + V((-0.012 * s, 0, 0.028 * s)), (0.012 * s, 0.008 * s, 0.018 * s), n=8, jitter=0.3), solid(mane, 0.08))   # 갈기
    for lx in (-0.085, 0.085):
        for ly in (-0.03, 0.03):
            top = body + V((lx * s, ly * s, -0.03 * s)); paint(loft([top, V((top.x, top.y, 0.025 * s)), V((top.x, top.y, 0.0))], [0.017 * s, 0.012 * s, 0.014 * s], sides=6, wob=0), shade(col_d, col_d))
            paint(loft([V((top.x, top.y, 0.0)), V((top.x, top.y, 0.015 * s))], 0.016 * s, sides=6, wob=0), solid(lin(0x2a2018), 0.05))   # 발굽
    tail = [body + V((-0.12 * s, 0, 0.03 * s)), body + V((-0.15 * s, 0, -0.03 * s)), body + V((-0.15 * s, 0, -0.1 * s))]
    paint(loft(crs(tail, 5), [0.012 * s, 0.015 * s, 0.014 * s, 0.01 * s, 0.006 * s], sides=5, wob=0.1), solid(mane, 0.08))
    if pack:
        paint(box(body + V((0, 0, 0.06 * s)), 0.1 * s, 0.13 * s, 0.015 * s), solid(lin(0x8a2a2a), 0.05))   # 안장 깔개
        for e in (-1, 1): paint(blob(body + V((0, 0.075 * s * e, 0.02 * s)), (0.05 * s, 0.025 * s, 0.045 * s), n=14, jitter=0.1), shade(lin(0xb89a6a), lin(0x8a7048)))   # 짐 자루
    return head
def horsemule():
    begin(165)
    h = beast((-0.02, 0.09, 0), 1.0, lin(0x8a5a30), lin(0x6a4020), lin(0x2a1a10))
    beast((-0.06, -0.1, 0), 0.9, lin(0x8a8070), lin(0x6a6050), lin(0x4a4038), ears=0.055, pack=True)
    mz = h + V((0.035, 0, -0.03))   # 주둥이 — 굴레를 두르고 고삐는 말 쪽 바깥 말뚝으로(노새 입 앞을 지나 노새에게서 튀어나온 것처럼 보였다 — 10/5 사용자)
    paint(ring(mz, 0.026, 0.004, ax=(1, 0, -0.6), sides=10), solid(LEATHER_D, 0.05))
    post = V((0.27, 0.22, 0))
    paint(cyl(post, post + V((0, 0, 0.11)), 0.01, sides=6), solid(WOOD_D, 0.05))
    paint(loft(crs([mz + V((0, 0.026, 0)), mz + V((0.06, 0.08, -0.1)), post + V((0, -0.005, 0.09))], 6), 0.004, sides=3, wob=0), solid(LEATHER_D, 0.05))
    paint(ring(post + V((0, 0, 0.09)), 0.014, 0.004, sides=8), solid(LEATHER_D, 0.05))   # 말뚝에 감은 매듭
    finish('gd_65', OUT)

# ── 66 엘리사 · 청색·자색 천 (겔 27:7) — 판에 감은 천 필 셋 + 흘러내려 펼친 한 자락 ──
def bolts():
    begin(166)
    BL, PU, BL2 = lin(0x2a4fa0), lin(0x6a2a8a), lin(0x3a6ac0)
    for k, (y, z, col) in enumerate(((-0.055, 0.05, BL), (0.055, 0.05, PU), (0.0, 0.135, BL2))):   # 둥글게 감은 천 필(네모로 하니 계단 같았다)
        paint(loft([V((-0.16, y, z)), V((0.16, y, z))], 0.05, sides=12, wob=0.02), lambda p_, n, col=col: jit(jit(col, 0.25) if abs(n.x) > 0.9 else col, 0.04))
        for x in (-0.168, 0.168): paint(box((x, y, z), 0.01, 0.075, 0.075), solid(WOOD, 0.05))   # 감은 판 끝
    path = [V((0.1, 0.0, 0.186)), V((0.17, 0.0, 0.18)), V((0.215, 0.0, 0.13)), V((0.225, 0.0, 0.06)), V((0.25, 0.0, 0.01)), V((0.33, 0.0, 0.004))]
    nrm = [V((0, 0, 1)), V((0.3, 0, 1)), V((1, 0, 0.4)), V((1, 0, 0.1)), V((1, 0, 0.5)), V((0, 0, 1))]
    paint(strip(path, 0.1, nrm, th=0.006), solid(PU, 0.05))   # 흘러내린 자색 자락
    for k in range(3): paint(box((0.3 + k * 0.012, 0.0, 0.0085), 0.004, 0.09, 0.002), solid(lin(0xe0b545), 0.05), METAL)   # 끝 금실 줄
    finish('gd_66', OUT)

# ── 67 달시스 · 은괴 (겔 27:12 「은과 철과 주석과 납」) — 은괴 더미·철·주석·납 덩이·저울 ──
def silver():
    begin(167)
    AG, AG_D = lin(0xe6eaee), lin(0xaab2ba)
    paint(box((-0.05, 0.02, 0.012), 0.36, 0.26, 0.024), shade(WOOD, WOOD_D))   # 나무 판
    for lay in range(3):
        for i in range(3 - lay):
            for j in range(2):
                x = -0.13 + (i + lay * 0.5) * 0.09; y = -0.03 + j * 0.08 + lay * 0.0
                paint(hull([V((x + sx * 0.04 * (0.8 if sz > 0 else 1), y + sy * 0.03 * (0.8 if sz > 0 else 1), 0.024 + lay * 0.028 + (sz + 1) * 0.013)) for sx in (-1, 1) for sy in (-1, 1) for sz in (-1, 1)]), lambda p_, n: jit(AG if n.z > 0.5 else AG_D, 0.04), METAL)   # 사다리꼴 은괴
    for k, (x, y, col) in enumerate(((0.1, -0.1, lin(0x4a4e56)), (0.06, 0.12, lin(0xb8bcc0)), (-0.2, -0.13, lin(0x6a6e78)))):   # 철·주석·납
        paint(blob((x, y, 0.024 + 0.018), (0.035, 0.028, 0.018), n=12, jitter=0.15), solid(col, 0.05), METAL)
    s = V((0.25, 0.04, 0))   # 저울
    paint(box(s + V((0, 0, 0.01)), 0.08, 0.08, 0.02), solid(WOOD_D, 0.05))
    paint(cyl(s + V((0, 0, 0.02)), s + V((0, 0, 0.3)), 0.008, sides=6), solid(BRONZE, 0.05), METAL)
    paint(cyl(s + V((0, -0.12, 0.29)), s + V((0, 0.12, 0.29)), 0.006, sides=5), solid(BRONZE, 0.05), METAL)
    for e in (-1, 1):
        pan = s + V((0, 0.12 * e, 0.14))
        for k in range(3): a = k / 3 * 2 * math.pi; paint(loft([s + V((0, 0.12 * e, 0.29)), pan + V((math.cos(a) * 0.035, math.sin(a) * 0.035, 0.01))], 0.0015, sides=3, wob=0), solid(lin(0x8a7a5a), 0.05))
        paint(loft([pan, pan + V((0, 0, 0.01)), pan + V((0, 0, 0.02))], [0.015, 0.035, 0.04], sides=12, wob=0), solid(BRONZE, 0.05), METAL)
    paint(blob(s + V((0, -0.12, 0.165)), (0.016, 0.012, 0.008), n=8), solid(AG, 0.04), METAL)   # 한쪽 접시에 은 한 조각
    finish('gd_67', OUT)

# ── 68 깃딤 · 상아로 꾸민 회양목 판 (겔 27:6) — 상아를 박은 회양목 걸상 ──
def ivorybench():
    begin(168)
    BX, BX_D, IV = lin(0xe0c27a), lin(0xb8984e), lin(0xf6eedc)
    top = 0.2
    paint(box((0, 0, top + 0.015), 0.5, 0.24, 0.03), shade(BX, BX_D, k=0.05))   # 앉는 판
    for sx in (-1, 1):
        for sy in (-1, 1): paint(loft([V((0.21 * sx, 0.09 * sy, 0)), V((0.21 * sx, 0.09 * sy, 0.08)), V((0.21 * sx, 0.09 * sy, 0.12)), V((0.21 * sx, 0.09 * sy, top))], [0.022, 0.016, 0.022, 0.02], sides=8, wob=0), solid(BX, 0.05))   # 돌려 깎은 다리
        paint(cyl((0.21 * sx, -0.09, 0.07), (0.21 * sx, 0.09, 0.07), 0.01, sides=6), solid(BX_D, 0.05))   # 가로대
    paint(cyl((-0.21, 0, 0.07), (0.21, 0, 0.07), 0.01, sides=6), solid(BX_D, 0.05))
    zt = top + 0.0305
    for k in range(5):   # 상아 무늬 — 윗면의 장미꽃 다섯과 테두리
        x = -0.18 + k * 0.09
        for j in range(6): a = j / 6 * 2 * math.pi; paint(blob((x + math.cos(a) * 0.016, math.sin(a) * 0.016, zt), (0.011, 0.011, 0.002), n=8), solid(IV, 0.03), METAL)
        paint(blob((x, 0, zt + 0.001), (0.008, 0.008, 0.002), n=8), solid(GOLD, 0.04), METAL)
    for s in (-1, 1): paint(box((0, 0.105 * s, zt), 0.47, 0.008, 0.002), solid(IV, 0.03), METAL); paint(box((0.235 * s, 0, zt), 0.008, 0.2, 0.002), solid(IV, 0.03), METAL)
    for k in range(8): paint(box((-0.21 + k * 0.06, -0.1205, top + 0.015), 0.035, 0.002, 0.016), solid(IV, 0.03), METAL)   # 앞 옆면 상아 조각
    finish('gd_68', OUT)

# ── 69 도다님 · 장미 화분 (로도스 = 「장미」) — 테라코타 화분의 장미 덤불 ──
def rose(p, s, col, col_d):
    p = V(p)
    paint(blob(p, (0.026 * s, 0.026 * s, 0.02 * s), n=12, jitter=0.1), solid(col_d, 0.05))
    for k in range(5): a = k / 5 * 2 * math.pi; paint(blob(p + V((math.cos(a) * 0.018 * s, math.sin(a) * 0.018 * s, 0.004 * s)), (0.016 * s, 0.016 * s, 0.014 * s), n=8, jitter=0.15), solid(col, 0.06))   # 겉꽃잎
    for k in range(3): a = k / 3 * 2 * math.pi + 0.5; paint(blob(p + V((math.cos(a) * 0.008 * s, math.sin(a) * 0.008 * s, 0.012 * s)), (0.011 * s, 0.011 * s, 0.012 * s), n=8, jitter=0.1), solid(jit(col, 0.15), 0.05))   # 안꽃잎
def rosepot():
    begin(169)
    TC, TC_D = lin(0xc06a42), lin(0x9a4e2e)
    zs = [0, 0.02, 0.15, 0.17, 0.19]; rs = [0.08, 0.085, 0.13, 0.145, 0.145]
    paint(loft([V((0, 0, z)) for z in zs], rs, sides=16, wob=0.01), lambda p_, n: jit(lin(0x3a2616), 0.08) if n.z > 0.9 else jit(TC if n.z > -0.3 else TC_D, 0.06))
    paint(ring((0, 0, 0.18), 0.145, 0.012, sides=16), solid(TC, 0.05))
    stems = []
    for k in range(7):
        a = k * 2.4; r = 0.05 * math.sqrt((k + 0.5) / 7)
        b = V((math.cos(a) * r, math.sin(a) * r, 0.19)); tip = b + V((math.cos(a) * 0.06, math.sin(a) * 0.06, 0.2 + (k % 3) * 0.05))
        paint(loft(crs([b, b.lerp(tip, 0.5) + V((0, 0, 0.02)), tip], 5), 0.005, sides=4, wob=0), solid(lin(0x3a6a2a), 0.06)); stems.append((b, tip))
    for b, tip in stems:
        for t in (0.35, 0.65):
            p = b.lerp(tip, t); d = (tip - b).normalized(); sd = V((-d.y, d.x, 0)).normalized() if abs(d.z) < 0.99 else V((1, 0, 0))
            for e in (-1, 1): paint(blob(p + sd * e * 0.022, (0.018, 0.012, 0.004), n=8, jitter=0.2), solid(lin(0x3f7a30), 0.08))   # 톱니 잎
    cols = [(lin(0xd0203a), lin(0x9a1028)), (lin(0xf08aa0), lin(0xc8607a)), (lin(0xd0203a), lin(0x9a1028))]
    for k, (b, tip) in enumerate(stems): rose(tip, 1.0 if k % 3 else 1.15, *cols[k % 3])
    for k in range(3): a = k * 2.0; paint(blob((0.17 + math.cos(a) * 0.04, -0.12 + math.sin(a) * 0.03, 0.006), (0.014, 0.01, 0.003), n=8, jitter=0.3), solid(lin(0xd0203a), 0.06))   # 떨어진 꽃잎
    finish('gd_69', OUT)

JAP = {'56': furcloak, '57': plowshare, '58': carpet, '59': greekbronze, '60': forge, '61': tripod, '62': drinkhorn, '63': amber,
       '64': dugout, '65': horsemule, '66': bolts, '67': silver, '68': ivorybench, '69': rosepot}


# ════════ 포장 — 하나(꾸러미) · 한 짐(궤) · 수레 가득(수레) + 다시스의 배 (10/5) ════════
# 특산물은 이 위(윗면 DECK 높이)에 얹는다. 천·깃발은 TINT(옅은 바탕) — 게임이 나라 빛깔을 곱한다.
# 앞(가는 쪽) = +x. 들것 채·끌채·뱃머리가 +x
CLOTH = lin(0xf4eee2)   # 물들일 천 — 옅게

# ── 하나 · 천 꾸러미 — 천을 덮은 작은 들것, 네 귀를 묶은 매듭, 두 사람이 메는 채 ──
def pack_bundle():
    begin(201)
    T = 0.05   # 들것 판 윗면
    paint(box((0, 0, T - 0.015), 0.62, 0.62, 0.03), shade(WOOD, WOOD_D))
    for sy in (-1, 1): paint(cyl((-0.62, 0.27 * sy, T - 0.02), (0.62, 0.27 * sy, T - 0.02), 0.018, sides=6), solid(WOOD_D, 0.05))   # 메는 채 — 앞뒤로 길게
    for sx in (-1, 1):
        for sy in (-1, 1): paint(blob((0.6 * sx, 0.27 * sy, T - 0.02), (0.024, 0.024, 0.024), n=8), solid(BRONZE, 0.05), METAL)   # 채 끝 마개
    paint(box((0, 0, T + 0.003), 0.6, 0.6, 0.006), solid(CLOTH, 0.03), TINT)   # 덮은 천
    for sx in (-1, 1):   # 네 변으로 늘어진 천 자락
        paint(box((0.305 * sx, 0, T - 0.03), 0.006, 0.58, 0.06), solid(CLOTH, 0.03), TINT)
        paint(box((0, 0.305 * sx, T - 0.03), 0.58, 0.006, 0.06), solid(CLOTH, 0.03), TINT)
    for sx in (-1, 1):
        for sy in (-1, 1):   # 네 귀 — 위로 모아 묶은 매듭과 술
            c = V((0.29 * sx, 0.29 * sy, T + 0.01))
            paint(hull([c + V((-0.03 * sx, 0, 0)), c + V((0, -0.03 * sy, 0)), c + V((0.012 * sx, 0.012 * sy, 0.06))]), solid(CLOTH, 0.03), TINT)
            paint(blob(c + V((0.006 * sx, 0.006 * sy, 0.06)), (0.016, 0.016, 0.014), n=8), solid(GOLD, 0.05), METAL)
            paint(loft([c + V((0.01 * sx, 0.01 * sy, 0.055)), c + V((0.03 * sx, 0.03 * sy, 0.0))], 0.004, sides=3, wob=0), solid(GOLD, 0.05), METAL)
    finish('pk_1', OUT)

# ── 한 짐 · 밧줄 맨 나무 궤 — 놋 모서리·금 띠, 궤를 꿴 채 둘(네 사람이 멘다), 위에 덮은 천 ──
def pack_chest():
    begin(202)
    CH, CH_D = lin(0x9a6a3a), lin(0x6e4a26)
    L, Wd, H = 1.0, 0.72, 0.32
    paint(box((0, 0, H / 2 + 0.04), L, Wd, H), shade(CH, CH_D, k=0.06))
    for k in range(4): paint(box((-L / 2 + 0.125 + k * 0.25, -Wd / 2 - 0.002, H / 2 + 0.04), 0.004, 0.004, H - 0.02), solid(CH_D, 0.05))   # 널 이음
    for sx in (-1, 1):
        for sy in (-1, 1):
            paint(box((sx * (L / 2 - 0.01), sy * (Wd / 2 - 0.01), H / 2 + 0.04), 0.05, 0.05, H + 0.01), solid(BRONZE, 0.05), METAL)   # 놋 모서리
            paint(box((sx * (L / 2 - 0.05), sy * (Wd / 2 - 0.05), 0.02), 0.08, 0.08, 0.04), solid(CH_D, 0.05))   # 발
    for z in (0.08, H + 0.0): paint(box((0, 0, z), L + 0.008, Wd + 0.008, 0.025), solid(GOLD, 0.05), METAL)   # 금 띠
    for x in (-0.3, 0.3): paint(loft([V((x, math.cos(a) * (Wd / 2 + 0.012), H / 2 + 0.04 + math.sin(a) * (H / 2 + 0.012))) for a in [k / 16 * 2 * math.pi for k in range(16)]], 0.012, sides=5, closed=True, wob=0), solid(ROPE, 0.06))   # 묶은 밧줄 — 궤를 꼭 감싸게
    paint(box((0, 0, H + 0.04 + 0.004), 0.5, Wd + 0.03, 0.008), solid(CLOTH, 0.03), TINT)   # 가운데 덮은 천 띠
    for sy in (-1, 1): paint(box((0, sy * (Wd / 2 + 0.018), H + 0.04 - 0.05), 0.5, 0.006, 0.1), solid(CLOTH, 0.03), TINT)
    for sy in (-1, 1):   # 궤를 꿴 채 — 옆 고리에 꽂혀 앞뒤로 길게
        z = 0.2
        paint(cyl((-0.95, sy * (Wd / 2 + 0.04), z), (0.95, sy * (Wd / 2 + 0.04), z), 0.022, sides=6), solid(WOOD_D, 0.05))
        for x in (-0.36, 0.36): paint(ring((x, sy * (Wd / 2 + 0.03), z), 0.032, 0.008, ax=(1, 0, 0), sides=10), solid(BRONZE, 0.05), METAL)
        for sx in (-1, 1): paint(blob((0.95 * sx, sy * (Wd / 2 + 0.04), z), (0.028, 0.028, 0.028), n=8), solid(BRONZE, 0.05), METAL)
    finish('pk_2', OUT)

# ── 수레 가득 · 금테 수레 — 네 바퀴, 판 바닥, 금테 난간, 네 귀 깃발, 소가 끄는 끌채 ──
def pack_cart():
    begin(203)
    CW, CW_D = lin(0xa0663a), lin(0x704420)
    R = 0.24; az = R + 0.02; bed = az + 0.07
    for x in (-0.48, 0.48):
        for y in (-0.56, 0.56): wheel((x, y, az), R, ax=(0, 1, 0), spokes=8)
        paint(cyl((x, -0.6, az), (x, 0.6, az), 0.02, sides=6), solid(WOOD_D, 0.05))   # 굴대
        paint(box((x, 0, az + 0.04), 0.08, 1.0, 0.05), solid(CW_D, 0.05))   # 굴대 받침
    paint(box((0, 0, bed), 1.5, 1.0, 0.05), shade(CW, CW_D, k=0.06))   # 짐 바닥 — 윗면 bed + 0.025
    for sy in (-1, 1):   # 옆 난간 — 낮은 기둥 + 금테 가로대
        for k in range(9): paint(cyl((-0.72 + k * 0.18, 0.49 * sy, bed + 0.025), (-0.72 + k * 0.18, 0.49 * sy, bed + 0.14), 0.014, sides=5), solid(CW, 0.05))
        paint(cyl((-0.74, 0.49 * sy, bed + 0.14), (0.74, 0.49 * sy, bed + 0.14), 0.018, sides=6), solid(GOLD, 0.05), METAL)
        paint(box((0, 0.5 * sy, bed), 1.52, 0.012, 0.055), solid(GOLD, 0.05), METAL)   # 바닥 옆 금테
    for sx in (-1, 1):
        for k in range(6): paint(cyl((0.74 * sx, -0.45 + k * 0.18, bed + 0.025), (0.74 * sx, -0.45 + k * 0.18, bed + 0.14), 0.014, sides=5), solid(CW, 0.05))
        paint(cyl((0.74 * sx, -0.5, bed + 0.14), (0.74 * sx, 0.5, bed + 0.14), 0.018, sides=6), solid(GOLD, 0.05), METAL)
        paint(box((0.75 * sx, 0, bed), 0.012, 1.02, 0.055), solid(GOLD, 0.05), METAL)
    for sx in (-1, 1):
        for sy in (-1, 1):   # 네 귀 깃발
            p = V((0.74 * sx, 0.49 * sy, bed + 0.025))
            paint(cyl(p, p + V((0, 0, 0.62)), 0.012, sides=6), solid(GOLD_D, 0.05), METAL)
            paint(blob(p + V((0, 0, 0.635)), (0.022, 0.022, 0.03), n=8), solid(GOLD, 0.05), METAL)
            rows = []
            for i in range(4):   # 바람에 살짝 물결치는 깃발 — 뒤(-x)로 날린다
                x = -i * 0.07; rows.append([p + V((x, 0.012 * math.sin(i * 1.6 + sy), 0.6 - j * 0.09)) for j in range(3)])
            quad_strip([list(r) for r in zip(*rows)], solid(CLOTH, 0.03), TINT, th=0.006)
            paint(hull([p + V((-0.21, 0.012 * math.sin(3 * 1.6 + sy), 0.6)), p + V((-0.21, 0.012 * math.sin(3 * 1.6 + sy), 0.42)), p + V((-0.27, 0.0, 0.51))]), solid(CLOTH, 0.03), TINT)   # 제비꼬리 끝
    paint(box((0, 0, bed + 0.03), 1.3, 0.85, 0.01), solid(CLOTH, 0.03), TINT)   # 짐 바닥에 깐 천 — 윗면 DECK
    pole = crs([V((0.75, 0, bed - 0.02)), V((1.1, 0, bed - 0.06)), V((1.45, 0, bed - 0.04))], 6)
    paint(loft(pole, 0.025, sides=6, wob=0), solid(CW_D, 0.05))   # 끌채
    y0 = pole[-1]; paint(cyl(y0 + V((0, -0.32, 0.02)), y0 + V((0, 0.32, 0.02)), 0.022, sides=6), solid(CW_D, 0.05))   # 멍에(소 둘)
    paint(cyl((y0.x, 0, 0), (y0.x, 0, y0.z - 0.01), 0.018, sides=6), solid(CW_D, 0.05))   # 멍에 받침(행렬에선 소가 대신한다)
    finish('pk_3', OUT)

# ── 다시스의 배 (사 60:9) — 섬 나라 짐을 싣는 배. 가운데 갑판에 포장(수레까지)을 싣고, 이물 쪽에 돛대 하나 ──
def tarshish():
    begin(204)
    HU, HU_D, DK = lin(0x7a5232), lin(0x553620), lin(0xb08a5a)
    L = 3.0; Bm = 0.62   # 반폭
    xs = [-1.5, -1.35, -1.0, -0.5, 0.0, 0.5, 1.0, 1.35, 1.5]
    def half(x):   # 그 자리의 반폭 — 이물·고물로 갈수록 좁다
        t = abs(x) / 1.5; return Bm * max(0.05, 1 - t ** 2.4)
    def sheer(x): return 0.42 + 0.22 * (abs(x) / 1.5) ** 2.2   # 뱃전 높이 — 이물·고물이 솟는다
    rows = []
    for x in xs:   # 단면: 뱃전 → 배 밑(용골) → 반대 뱃전
        w = half(x); top = sheer(x)
        rows.append([V((x, w * math.cos(a), top - (top - 0.05) * math.sin(a) ** 1.3 if a > 0 else top)) for a in [k / 8 * math.pi for k in range(9)]])
    # 배 몸 — 칸마다 볼록 껍질(겉면만 보이게 두께는 안으로)
    for i in range(len(rows) - 1):
        for j in range(len(rows[i]) - 1):
            q = [rows[i][j], rows[i][j + 1], rows[i + 1][j], rows[i + 1][j + 1]]
            c = sum(q, V()) / 4; inward = (V((c.x, 0, 0.3)) - c).normalized()
            paint(hull(q + [p + inward * 0.03 for p in q]), lambda p_, n: jit(HU if p_.z > 0.25 else HU_D, 0.06))
    dz = 0.36   # 갑판 — 윗면 DECK
    paint(hull([V((x, s * half(x) * 0.96, dz + o)) for x in [-1.25 + k * 0.25 for k in range(11)] for s in (-1, 1) for o in (0, 0.03)]), shade(DK, lin(0x8a6a40), k=0.05))
    for x in [-1.0 + k * 0.25 for k in range(9)]: paint(box((x, 0, dz + 0.031), 0.006, 2 * half(x) * 0.9, 0.002), solid(lin(0x8a6a40), 0.05))   # 갑판 널 줄
    for s in (-1, 1):   # 뱃전 띠 + 방패처럼 단 둥근 장식(놋)
        rail = [V((x, s * half(x), sheer(x) + 0.01)) for x in xs[1:-1]]
        paint(loft(rail, 0.022, sides=5, wob=0), solid(HU_D, 0.05))
        for x in (-0.75, -0.25, 0.25, 0.75): paint(plate(V((x, s * (half(x) + 0.004), sheer(x) - 0.08)), (0, s, 0), 0.05, 0.012, sides=10), solid(BRONZE, 0.05), METAL)
    paint(loft(crs([V((1.42, 0, sheer(1.42))), V((1.55, 0, 0.78)), V((1.5, 0, 0.92)), V((1.4, 0, 0.9))], 8), [0.04, 0.035, 0.03, 0.025, 0.022, 0.02, 0.02, 0.018], sides=6, wob=0), solid(HU_D, 0.05))   # 이물 — 솟아 말린 머리
    paint(loft(crs([V((-1.42, 0, sheer(-1.42))), V((-1.6, 0, 0.8)), V((-1.62, 0, 0.98))], 6), [0.04, 0.035, 0.03, 0.026, 0.022, 0.02], sides=6, wob=0), solid(HU_D, 0.05))   # 고물
    for k in range(2): paint(blob((1.56 - k * 0.0, 0.032 * (1 if k else -1), 0.84), (0.012, 0.008, 0.012), n=6), solid(lin(0xf0e6cc), 0.05))   # 이물 눈
    for s in (-1, 1): paint(loft([V((-1.3, s * 0.3, 0.75)), V((-1.6, s * 0.42, 0.1))], [0.018, 0.02], sides=6, wob=0), solid(WOOD, 0.05)); paint(box((-1.62, s * 0.43, 0.14), 0.18, 0.012, 0.12, rz=0.0), solid(WOOD, 0.05))   # 키 노 둘
    for s in (-1, 1):   # 젓는 노 — 뱃전 구멍에서 비스듬히 물로
        for k in range(5):
            x = -0.8 + k * 0.4; a = V((x, s * half(x), sheer(x) - 0.04)); b = a + V((-0.12, s * 0.55, -0.42))
            paint(loft([a, b], 0.012, sides=5, wob=0), solid(WOOD, 0.05))
            d = (b - a).normalized(); paint(box(b + d * 0.04, 0.05, 0.012, 0.09, rz=0.2 * s), solid(WOOD, 0.05))
    mx = 1.0; mt = 1.9   # 돛대 — 이물 쪽(짐 자리를 비운다)
    paint(cyl((mx, 0, dz), (mx, 0, mt), 0.03, sides=8), solid(WOOD, 0.05))
    paint(cyl((mx, -0.75, mt - 0.08), (mx, 0.75, mt - 0.08), 0.02, sides=6), solid(WOOD_D, 0.05))   # 활대
    rows = []
    for j in range(4):   # 네모 돛 — 줄무늬가 들어간 천, 앞(+x)으로 부푼다
        z = mt - 0.1 - j * 0.28; rows.append([V((mx + 0.03 + 0.1 * math.sin(math.pi * (y + 0.72) / 1.44) * (0.4 + 0.6 * math.sin(math.pi * j / 3 * 0.9 + 0.3)), y, z)) for y in [-0.72 + k * 0.24 for k in range(7)]])
    for i in range(3):
        for j in range(6):
            q = [rows[i][j], rows[i][j + 1], rows[i + 1][j], rows[i + 1][j + 1]]
            stripe = j in (2, 3)
            paint(hull(q + [p + V((0.006, 0, 0)) for p in q]), solid(CLOTH if stripe else LINEN, 0.03), TINT if stripe else BASE)
    for s in (-1, 1):
        paint(loft([V((mx, s * 0.72, mt - 0.08)), V((mx - 0.15, s * 0.6, dz + 0.32))], 0.005, sides=3, wob=0), solid(ROPE, 0.05))   # 돛 아랫줄
        paint(loft([V((mx, 0, mt)), V((1.45, s * 0.05, 0.85))], 0.005, sides=3, wob=0), solid(ROPE, 0.05))
    paint(loft([V((mx, 0, mt)), V((-1.4, 0, 0.9))], 0.005, sides=3, wob=0), solid(ROPE, 0.05))
    paint(cone((mx, 0, mt), (mx, 0, mt + 0.18), 0.012, 4), solid(GOLD_D, 0.05), METAL)
    rows = [[V((mx - i * 0.07, 0.01 * math.sin(i * 1.7), mt + 0.16 - j * 0.07)) for i in range(4)] for j in range(2)]
    quad_strip(rows, solid(CLOTH, 0.03), TINT, th=0.005)   # 돛대 끝 작은 깃발
    finish('pk_ship', OUT)

PACK = {'pk1': pack_bundle, 'pk2': pack_chest, 'pk3': pack_cart, 'ship': tarshish}


ALL = {'0': quiver, '0p': lambda: quiver(True), '1': cedarchest, '2': bricks, '3': helmet, '3p': lambda: helmet(True), '4': rubycoral, '5': fleece, '6': wine,
       '7': pomegranates, '8': honey, '9': tablets, '10': tent, '11': boundary, '12': camel, '13': myrrh, '14': tentcloth, '15': frankincense,
       '16': crescents, '17': vessels, '18': ironspice, '19': dates, '20': featherband, '21': ostrich, '22': shebagold, '23': almug, '24': bdellium, '25': waterskin}
ALL.update(HAM); ALL.update(JAP); ALL.update(PACK)
for k, fn in ALL.items():
    if not ONLY or k in ONLY: fn()
