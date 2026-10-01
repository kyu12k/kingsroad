# 거룩한 성 — 보좌·진주 문·기초석과 성벽 (계 21~22, 4장) (2026-10-01)
# 사용자: 꾸밈 아이템은 잘 뽑혔는데 거룩한 성은 그에 비해 멋짐이 덜하다 → 처음 3D의 단순 도형을 블렌더 로우폴리로 다시 빚는다
# 실행: blender -b -P city.py -- <출력 폴더> [이름 …]   → models/city/*.glb (게임 nj3d.js)
# 크기: 성 반폭 6, 가운데 못(네 물길이 만나는 곳) 가로세로 약 1.9, 물길 폭 약 1.9. 앞(남쪽) = 블렌더 −y = 게임 +z
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

MARBLE, MARBLE_S, MARBLE_D = lin(0xf7f4ec), lin(0xe4ddcd), lin(0xcfc6b2)
GOLD, GOLD_D, GOLD_L = lin(0xe8bf4a), lin(0xb88a2a), lin(0xffe08a)
EMERALD, EMERALD_L = lin(0x2fd98a), lin(0x9dffd0)
FLAME = lin(0xffd27a)

def slab(cx, cy, z0, w, d, h, fn, mat=BASE, bev=0.02):
    """모서리를 살짝 깎은 판"""
    pts = []
    for (x, y) in ((-w / 2, -d / 2), (w / 2, -d / 2), (w / 2, d / 2), (-w / 2, d / 2)):
        for (dx, dy) in ((bev if x < 0 else -bev, 0), (0, bev if y < 0 else -bev)):
            for z in (z0, z0 + h): pts.append(Vector((cx + x + dx, cy + y + dy, z)))
    return paint(hull(pts), fn, mat)

# ── 보좌 (4:2-6 · 22:1) — 세 단 대리석 단 위 흰 보좌, 녹보석 무지개가 두르고, 앞에 일곱 등불, 단 아래 네 면에서 생명수가 흘러나온다 ──
def throne():
    begin(81)
    # 세 단 — 단마다 금 테
    for k, (w, h) in enumerate(((1.62, 0.12), (1.24, 0.12), (0.9, 0.12))):
        z0 = k * 0.12
        slab(0, 0, z0, w, w, h, shade(MARBLE, MARBLE_S, MARBLE_D, k=0.05))
        for s in (-1, 1):
            paint(cyl((-w / 2, s * w / 2, z0 + h), (w / 2, s * w / 2, z0 + h), 0.012, sides=4), solid(GOLD, 0.05), METAL)
            paint(cyl((s * w / 2, -w / 2, z0 + h), (s * w / 2, w / 2, z0 + h), 0.012, sides=4), solid(GOLD, 0.05), METAL)
    top = 0.36
    # (앞 계단 판은 뺐다 — 단 자체가 계단인데 판이 단 속에 묻히고 어긋나 보였다, 10/1 사용자)
    # 보좌 — 앉는 자리 · 높은 등받이(금 테와 둥근 머리) · 팔걸이(사자 머리 대신 둥근 금 장식)
    slab(0, 0.05, top, 0.5, 0.42, 0.18, shade(MARBLE, MARBLE_S, k=0.04))
    slab(0, 0.05, top + 0.18, 0.46, 0.38, 0.04, solid(lin(0x8a1f2e), 0.06))   # 자색 방석
    back = [Vector((x, 0.24 + dy, z)) for x in (-0.25, 0.25) for dy in (-0.04, 0.04) for z in (top, top + 0.62)] + \
           [Vector((math.cos(a) * 0.25, 0.24 + dy, top + 0.62 + math.sin(a) * 0.2)) for a in [k / 8 * math.pi for k in range(9)] for dy in (-0.04, 0.04)]
    paint(hull(back), shade(MARBLE, MARBLE_S, k=0.04))
    arch = [Vector((math.cos(a) * 0.27, 0.19, top + 0.62 + math.sin(a) * 0.22)) for a in [k / 12 * math.pi for k in range(13)]]
    paint(loft([Vector((0.27, 0.19, top + 0.05))] + arch + [Vector((-0.27, 0.19, top + 0.05))], 0.018, sides=5, wob=0), solid(GOLD, 0.05), METAL)   # 등받이 금 테
    paint(blob((0, 0.19, top + 0.88), (0.06, 0.04, 0.06), n=10, jitter=0), solid(GOLD_L, 0.04), METAL)   # 꼭대기 금 구슬
    for s in (-1, 1):
        slab(s * 0.29, 0.03, top + 0.18, 0.08, 0.4, 0.14, shade(MARBLE, MARBLE_S, k=0.04))
        paint(blob((s * 0.29, -0.17, top + 0.34), (0.05, 0.05, 0.05), n=10, jitter=0), solid(GOLD, 0.05), METAL)
    # (네 면의 물 혀는 뺐다 — 길처럼 보이고 물길과 어긋났다. 생명수는 못에서 네 물길로 흐른다)
    # 일곱 등불 (4:5) — 보좌 앞 단 가장자리에 반원으로
    # 맨 위 단 앞 가장자리에 한 줄로 — 처음엔 반원으로 놓아 양 끝이 윗단 속에 묻혔다(10/1 사용자)
    part('lamps', loc=(0, -0.36, top))
    for k in range(7):
        p = Vector((-0.39 + k * 0.13, -0.36, top))
        paint(loft([p, p + Vector((0, 0, 0.1))], [0.022, 0.018], sides=6, wob=0), solid(GOLD, 0.05), METAL)
        paint(loft([p + Vector((0, 0, 0.1)), p + Vector((0, 0, 0.115)), p + Vector((0, 0, 0.13))], [0.03, 0.035, 0.02], sides=6, wob=0), solid(GOLD, 0.05), METAL)
        f = p + Vector((0, 0, 0.13))
        paint(loft([f, f + Vector((0, 0, 0.03)), f + Vector((0, 0, 0.09))], [0.022, 0.018, 0.0], sides=5, wob=0.05), solid(FLAME, 0.06), GLOW)
    base()
    # 녹보석 무지개 (4:3 「무지개가 있어 보좌에 둘렸는데 그 모양이 녹보석 같더라」) — 보좌를 감싸는 선 고리, 은은히 빛나며 돈다
    part('rainbow', loc=(0, 0.1, top + 0.45))
    ring = [Vector((math.cos(a) * 0.78, 0.1, top + 0.45 + math.sin(a) * 0.78)) for a in [k / 40 * 2 * math.pi for k in range(40)]]
    paint(loft(ring, 0.03, sides=6, ell=(1.0, 0.5), closed=True, wob=0), solid(EMERALD, 0.05), GLOW)
    ring2 = [Vector((math.cos(a) * 0.72, 0.1, top + 0.45 + math.sin(a) * 0.72)) for a in [k / 40 * 2 * math.pi for k in range(40)]]
    paint(loft(ring2, 0.012, sides=4, closed=True, wob=0), solid(EMERALD_L, 0.05), GLOW)
    finish('throne', OUT, emit=(0.6, 1.0, 0.8), views={'a': (1.0, -1.25, 0.75), 'f': (0.0, -1.0, 0.35)})

# ── 진주 문 (21:21 「열두 문은 열두 진주니 각 문마다 한 개의 진주로 되어 있고」 · 21:12 문 위의 천사와 지파의 이름) ──
#    게임의 문 자리·부딪힘과 같은 크기: 안쪽 폭 1.15(반지름 0.575), 높이 3.6, 기둥 두께 0.14. 문은 x로 가로지른다(통로 = y)
PEARL = [lin(0xf6f1ff), lin(0xe6d8f6), lin(0xf6dde8), lin(0xd9ecf8), lin(0xf8ecd8)]   # 무지갯빛이 비치게 조금 짙게(하얗게 날아갔다)
def pearl_col(p, n):   # 진줏빛 — 높이·각도에 따라 분홍·하늘·상아가 은은히 섞인다
    h = (p.z * 0.6 + math.atan2(n.y, n.x) * 0.3) % 1.0
    c = PEARL[int(h * len(PEARL)) % len(PEARL)]
    return jit(c, 0.03)
def pearlgate():
    begin(82)
    R, H = 0.575, 3.6
    Tk = 0.2                       # 기둥·아치 두께(반지름) — 안쪽 폭은 게임 부딪힘(0.575 − 0.14)과 맞게 기둥 가운데를 조금 바깥으로
    C = R + 0.06
    postH = H - C - 0.15
    path = [Vector((-C, 0, 0.25)), Vector((-C, 0, postH * 0.5)), Vector((-C, 0, postH))] +            [Vector((-math.cos(a) * C, 0, postH + math.sin(a) * C)) for a in [k / 18 * math.pi for k in range(1, 18)]] +            [Vector((C, 0, postH)), Vector((C, 0, postH * 0.5)), Vector((C, 0, 0.25))]
    paint(loft(path, Tk, sides=10, ell=(1.0, 1.25), wob=0.0, up=Vector((0, 1, 0))), pearl_col)
    for s2 in (-1, 1):   # 받침(세 단) · 기둥머리
        x = s2 * C
        paint(loft([Vector((x, 0, 0)), Vector((x, 0, 0.1)), Vector((x, 0, 0.18)), Vector((x, 0, 0.28))], [0.34, 0.32, 0.26, 0.22], sides=10, wob=0), pearl_col)
        paint(loft([Vector((x, 0, postH - 0.12)), Vector((x, 0, postH)), Vector((x, 0, postH + 0.08))], [0.22, 0.29, 0.24], sides=10, wob=0), pearl_col)
    # 아치를 따라 박힌 진주알
    for k in range(1, 18, 2):
        a = k / 18 * math.pi; c = Vector((-math.cos(a) * C, -0.27, postH + math.sin(a) * C))
        paint(blob(c, (0.065, 0.065, 0.065), n=10, jitter=0), pearl_col)
    for z in (0.7, 1.3, 1.9, 2.5):
        for s2 in (-1, 1): paint(blob(Vector((s2 * C, -0.27, z)), (0.06, 0.06, 0.06), n=10, jitter=0), pearl_col)
    # 꼭대기 큰 진주 — 한 개의 진주
    apex = postH + C + 0.32
    paint(blob(Vector((0, 0, apex)), (0.42, 0.42, 0.42), n=40, jitter=0), pearl_col)
    # 지파의 이름 — 큰 진주 아래 금 명판
    paint(hull([Vector((x, y, z)) for x in (-0.34, 0.34) for y in (-0.3, -0.24) for z in (postH + C - 0.12, postH + C + 0.06)]), shade(GOLD_L, GOLD, k=0.05), METAL)
    for k in range(5): paint(cyl((-0.22 + k * 0.11, -0.305, postH + C - 0.06), (-0.2 + k * 0.11, -0.305, postH + C + 0.0), 0.01, sides=3), solid(GOLD_D), METAL)
    # 천사 (21:12) — 큰 진주 위에 선 흰 옷의 천사, 날개는 따로(살짝 너울)
    top = apex + 0.4
    paint(loft([Vector((0, 0, top)), Vector((0, 0, top + 0.2)), Vector((0, 0, top + 0.4))], [0.15, 0.11, 0.065], sides=8, wob=0.04), shade(lin(0xffffff), lin(0xe8e4f4)))
    paint(blob(Vector((0, 0, top + 0.48)), (0.065, 0.065, 0.075), n=10, jitter=0), solid(lin(0xf3d9bf), 0.04))
    ring = [Vector((math.cos(a) * 0.075, math.sin(a) * 0.075, top + 0.58)) for a in [k / 12 * 2 * math.pi for k in range(12)]]
    paint(loft(ring, 0.01, sides=4, closed=True, wob=0), solid(GOLD_L), GLOW)
    for s2, nm in ((-1, 'wingL'), (1, 'wingR')):
        part(nm, loc=(s2 * 0.05, 0.04, top + 0.32))
        paint(hull([Vector((s2 * x, 0.04 + y * 0.2, top + z)) for (x, z) in ((0.05, 0.34), (0.34, 0.56), (0.4, 0.42), (0.25, 0.15), (0.08, 0.13)) for y in (-0.08, 0.08)]), shade(lin(0xffffff), lin(0xe3e0f5)))
        base()
    finish('pearlgate', OUT, emit=(1.0, 0.92, 0.6), views={'a': (1.0, -1.25, 0.75), 'f': (0.0, -1.0, 0.25)})

ALL = [throne, pearlgate]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
