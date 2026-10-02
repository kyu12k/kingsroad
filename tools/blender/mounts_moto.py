# 🛵 오토바이 (2026-10-02) — 3D 걸어서 구경의 현대 탈것. 둥근 판의 복고풍 오토바이(베스파와 카페레이서 사이)
# 실행: blender -b -P mounts_moto.py -- <출력 폴더> [이름 …]   → models/mounts/mt_motorcycle_*.glb · gd_motorcycle_*.glb
# 앞 = 블렌더 +x, 원점 = 두 바퀴 사이 땅(finish center=False — 장식이 같은 원점에 맞물린다). 사람 키 약 0.53 기준
# 움직이는 부분: wheelF·wheelR(굴대 중심, y축으로 돈다) · bars(조향축 위 — 핸들·거울·앞등)
# 장식: windshield = bars 축(핸들과 함께 꺾인다) · sidecar·topbox·flags = 몸통. 사이드카는 오른쪽(−y)
import sys, os, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mathutils import Vector
from lp import *

args = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = os.path.abspath(args[0] if args else '.')
ONLY = set(args[1:])

def V(x, y, z): return Vector((x, y, z))

TIRE, TIRE_D = lin(0x2a2a2e), lin(0x18181a)
WHITEWALL = lin(0xf2eee4)
CHROME, CHROME_D = lin(0xdfe3e8), lin(0xa4aab2)
ENGINE, ENGINE_D = lin(0x8a8e96), lin(0x5c6068)
BLACK = lin(0x232327)
RUBBER = lin(0x1e1e20)

# ── 뼈대 치수 ──
WR = 0.13                           # 바퀴 바깥 반지름(타이어 끝)
TR = 0.03                           # 타이어 굵기(반지름)
RA = V(-0.26, 0, WR)                # 뒷바퀴 굴대
FA = V(0.27, 0, WR)                 # 앞바퀴 굴대
_AX = V(-math.sin(math.radians(25)), 0, math.cos(math.radians(25)))   # 조향축(위로 갈수록 뒤로)
HT0 = FA + _AX * 0.19               # 헤드 아래(포크 위 끝)
HT1 = FA + _AX * 0.27               # 헤드 위 = bars 축
SADDLE_C = V(-0.12, 0, 0.335)       # 안장 가운데(앉는 자리)
GRIP_P = V(0.10, 0.13, 0.415)       # 손잡이 가운데(왼쪽, 오른쪽은 y 반대)
PEG_P = V(0.0, 0.085, 0.115)        # 발판(왼쪽)
LAMP = HT1 + V(0.06, 0, -0.02)      # 앞등 통 가운데

# 털빛: 몸 색·어두운 몸 색 · 꾸밈 색·어두운 꾸밈 색 · 안장 · 옆판에 꾸밈 색을 쓰는가 · 줄무늬('wide' 넓은 띠, 'pin' 가는 금줄) · 흰 타이어 벽
MOTO_COATS = {
    'cream': dict(main=(lin(0xf3e6c4), lin(0xd2c29c)), acc=(lin(0x8fd6c0), lin(0x62ae98)), seat=(lin(0x6a4128), lin(0x4a2c1a)), side_acc=True, stripe='wide', ww=True, accmat=BASE),
    'red':   dict(main=(lin(0xcc302c), lin(0x962022)), acc=(lin(0xf4f0e8), lin(0xcfc8bb)), seat=(lin(0x2a2a2e), lin(0x1a1a1c)), side_acc=False, stripe='wide', ww=False, accmat=BASE),
    'black': dict(main=(lin(0x24242a), lin(0x141418)), acc=(lin(0xe6c05a), lin(0xb08a30)), seat=(lin(0x7a5030), lin(0x56361e)), side_acc=False, stripe='pin', ww=False, accmat=METAL),
}

def tube(pts, r, col, sides=6, mat=BASE):
    return paint(loft(pts, r, sides=sides, wob=0), col, mat)

def arc(c, r, a0, a1, n, y=0.0):
    return [V(c.x + math.cos(a) * r, y, c.z + math.sin(a) * r) for a in [a0 + (a1 - a0) * k / (n - 1) for k in range(n)]]

def ring(c, r, n=22, y=0.0):
    return [V(c.x + math.cos(a) * r, y, c.z + math.sin(a) * r) for a in [k / n * 2 * math.pi for k in range(n)]]

def wheel(name, c, cs):
    part(name, loc=tuple(c))
    paint(loft(ring(c, WR - TR), TR, sides=8, ell=(1.0, 1.1), closed=True, wob=0, up=Vector((0, 1, 0))), shade(TIRE, TIRE_D, k=0.05))   # 굵은 타이어
    if cs['ww']:   # 흰 타이어 벽(크림만)
        for s in (-1, 1): paint(loft(ring(c, WR - TR - 0.004, y=s * 0.03), 0.007, sides=4, closed=True, wob=0), solid(WHITEWALL, 0.03))
    paint(loft(ring(c, WR - 2 * TR + 0.002), 0.01, sides=6, closed=True, wob=0), solid(CHROME, 0.04), METAL)   # 테
    hubc = cs['acc'][0] if cs['stripe'] == 'pin' else CHROME
    for k in range(5):   # 굵은 주물 바퀴살 다섯
        a = k / 5 * 2 * math.pi + 0.3
        paint(loft([V(c.x + math.cos(a) * 0.03, 0, c.z + math.sin(a) * 0.03), V(c.x + math.cos(a) * (WR - 2 * TR), 0, c.z + math.sin(a) * (WR - 2 * TR))], [0.012, 0.01], sides=5, ell=(1.0, 1.0), wob=0), solid(CHROME_D, 0.04), METAL)
    paint(cyl(V(c.x, -0.032, c.z), V(c.x, 0.032, c.z), 0.034, sides=12), solid(hubc, 0.03), METAL)   # 허브(브레이크 드럼)
    paint(cyl(V(c.x, -0.042, c.z), V(c.x, 0.042, c.z), 0.014, sides=8), solid(CHROME, 0.03), METAL)  # 굴대 끝
    base()

# 기름통 단면 — x를 따라 높이(z)와 반지름
TK_X = [-0.02, 0.005, 0.045, 0.09, 0.125, 0.155]
TK_Z = [0.318, 0.332, 0.342, 0.34, 0.33, 0.315]
TK_R = [0.026, 0.044, 0.052, 0.05, 0.042, 0.024]
def _tk(x, arr):
    for i in range(len(TK_X) - 1):
        if TK_X[i] <= x <= TK_X[i + 1]:
            t = (x - TK_X[i]) / (TK_X[i + 1] - TK_X[i]); return arr[i] + (arr[i + 1] - arr[i]) * t
    return arr[-1]
TK_ELL = (1.12, 0.82)

def _band(x0, x1, k=1.035):
    xs = [x0 + (x1 - x0) * i / 2 for i in range(3)]
    return loft([V(x, 0, _tk(x, TK_Z)) for x in xs], [_tk(x, TK_R) * k for x in xs], sides=14, ell=TK_ELL, wob=0, cap0=False, cap1=False)

def _moto(coat):
    cs = MOTO_COATS[coat]
    M, MD = cs['main']; A, AD = cs['acc']
    body = shade(M, MD, k=0.04); accp = shade(A, AD, k=0.04)
    begin(601)
    fr = solid(BLACK, 0.05)
    # 뼈대 — 검은 관(대부분 판에 가려진다)
    tube([HT0 + _AX * -0.015, HT1], 0.02, fr, sides=8)                                                  # 헤드
    tube(crs([HT0 + V(-0.01, 0, 0.01), V(0.06, 0, 0.3), V(-0.1, 0, 0.29), V(-0.27, 0, 0.29)], 8), 0.014, fr, sides=6)   # 등뼈
    tube(crs([HT0 + V(0.0, 0, -0.01), V(0.15, 0, 0.17), V(0.1, 0, 0.09), V(0.0, 0, 0.07), V(-0.07, 0, 0.12)], 8), 0.014, fr, sides=6)   # 아래 관
    tube([V(-0.07, 0, 0.12), V(-0.1, 0, 0.29)], 0.013, fr, sides=6)
    for s in (-1, 1):
        tube([V(-0.06, s * 0.04, 0.14), RA + V(0, s * 0.045, 0)], 0.012, fr, sides=6)                     # 스윙암
        tube([RA + V(0.01, s * 0.05, 0.02), V(-0.16, s * 0.055, 0.29)], 0.012, solid(CHROME, 0.04), sides=6, mat=METAL)   # 뒤 완충기
        for z in (0.2, 0.23, 0.26):   # 완충기 스프링
            t = (z - 0.15) / 0.14; p = RA + V(0.01, s * 0.05, 0.02) + (V(-0.16, s * 0.055, 0.29) - (RA + V(0.01, s * 0.05, 0.02))) * t
            paint(cyl(p + V(0.004, 0, -0.005), p + V(-0.004, 0, 0.005), 0.019, sides=8), solid(cs['acc'][0] if coat == 'cream' else CHROME_D, 0.04), METAL if coat != 'cream' else BASE)
        # 앞포크 — 위는 덮개, 아래는 크롬
        tube([HT0 + V(0, s * 0.045, 0), HT0 + (FA - HT0) * 0.45 + V(0, s * 0.045, 0)], 0.019, body, sides=8)
        tube([HT0 + (FA - HT0) * 0.4 + V(0, s * 0.045, 0), FA + V(0, s * 0.045, 0)], 0.013, solid(CHROME, 0.04), sides=8, mat=METAL)
    paint(hull([HT0 + V(dx, y, dz) for dx in (-0.025, 0.025) for y in (-0.062, 0.062) for dz in (-0.012, 0.012)]), solid(CHROME_D, 0.04), METAL)   # 포크 다리 묶음
    # 엔진 — 은빛 몸통과 기울어진 실린더(냉각 핀)
    paint(hull([V(x, y, z) for (x, z0, z1) in ((-0.06, 0.09, 0.2), (0.0, 0.065, 0.215), (0.08, 0.07, 0.2), (0.11, 0.1, 0.17)) for y in (-0.048, 0.048) for z in (z0, z1)]), shade(ENGINE, ENGINE_D, k=0.05), METAL)
    for s in (-1, 1): paint(cyl(V(0.0, s * 0.048, 0.13), V(0.0, s * 0.062, 0.13), 0.045, sides=12), solid(CHROME, 0.04), METAL)   # 옆 덮개 원판
    c0, c1 = V(0.06, 0, 0.18), V(0.11, 0, 0.27)
    for k in range(5):
        p = c0 + (c1 - c0) * (k / 4)
        paint(cyl(p - (c1 - c0).normalized() * 0.006, p + (c1 - c0).normalized() * 0.006, 0.042 if k < 4 else 0.034, sides=10), solid(ENGINE if k % 2 == 0 else ENGINE_D, 0.04), METAL)
    paint(cyl(c0, c1, 0.03, sides=8), solid(ENGINE_D), METAL)
    # 배기관 — 오른쪽(−y)으로 내려와 뒤로, 끝은 굵은 소음기
    ex = solid(CHROME, 0.04)
    tube(crs([c1 + V(0.01, -0.02, -0.01), V(0.15, -0.05, 0.19), V(0.13, -0.07, 0.08), V(0.03, -0.08, 0.06), V(-0.14, -0.085, 0.09)], 10), 0.014, ex, sides=8, mat=METAL)
    paint(loft([V(-0.13, -0.085, 0.09), V(-0.17, -0.085, 0.097), V(-0.3, -0.088, 0.12), V(-0.36, -0.088, 0.13)], [0.016, 0.026, 0.028, 0.024], sides=10, wob=0), ex, METAL)
    paint(cyl(V(-0.36, -0.088, 0.13), V(-0.37, -0.088, 0.132), 0.014, sides=8), solid(BLACK), BASE)
    # 기름통 — 둥근 통, 띠, 무릎 배지
    paint(loft([V(x, 0, z) for x, z in zip(TK_X, TK_Z)], TK_R, sides=14, ell=TK_ELL, wob=0), body)
    if cs['stripe'] == 'wide':
        paint(_band(0.04, 0.075), accp)
    else:
        for x0 in (0.02, 0.098): paint(_band(x0, x0 + 0.006, 1.03), solid(A, 0.03), METAL)
    for s in (-1, 1):
        paint(cyl(V(0.07, s * 0.052, 0.335), V(0.07, s * 0.062, 0.335), 0.016, sides=10), solid(lin(0xe6c05a), 0.03), METAL)   # 무릎 배지
    paint(cyl(V(0.06, 0, 0.375), V(0.06, 0, 0.385), 0.014, sides=8), solid(CHROME), METAL)   # 기름 마개
    # 옆판 — 안장 아래 둥근 판(베스파 엉덩이)
    side = accp if cs['side_acc'] else body
    paint(hull([V(x, y, z) for (x, z0, z1) in ((-0.18, 0.2, 0.3), (-0.12, 0.16, 0.3), (-0.04, 0.17, 0.3), (-0.02, 0.22, 0.3)) for y in (-0.042, 0.042) for z in (z0, z1)]), solid(BLACK, 0.05))   # 전지 상자
    for s in (-1, 1):   # 둥근 옆 덮개(달걀꼴)
        paint(loft([V(-0.1, s * 0.036, 0.24), V(-0.1, s * 0.05, 0.24), V(-0.1, s * 0.056, 0.24)], [0.05, 0.05, 0.043], sides=18, ell=(1.3, 1.0), wob=0), side)
        if cs['stripe'] == 'pin':
            paint(loft([V(-0.1 + math.cos(a) * 0.058, s * 0.058, 0.24 + math.sin(a) * 0.04) for a in [k / 16 * 2 * math.pi for k in range(16)]], 0.004, sides=3, closed=True, wob=0), solid(A), METAL)
    # 안장 — 긴 벤치, 테두리 띠
    S0, S1 = cs['seat']
    seatp = [V(-0.25, 0, 0.318), V(-0.2, 0, 0.322), V(-0.12, 0, 0.318), V(-0.05, 0, 0.318), V(-0.01, 0, 0.33)]
    paint(loft(seatp, [0.03, 0.05, 0.056, 0.05, 0.03], sides=12, ell=(1.2, 0.42), wob=0), shade(S0, S1, k=0.05))
    paint(loft([p + V(0, 0, -0.012) for p in seatp], [0.032, 0.052, 0.058, 0.052, 0.032], sides=12, ell=(1.2, 0.18), wob=0), solid(CHROME_D, 0.04), METAL)
    paint(cyl(V(-0.16, -0.075, 0.31), V(-0.16, 0.075, 0.31), 0.01, sides=6), solid(CHROME), METAL)   # 손잡이 띠
    # 흙받이 — 넓고 둥근 판
    for c, a0, a1 in ((FA, math.radians(5), math.radians(135)), (RA, math.radians(20), math.radians(165))):
        paint(loft(arc(c, WR + 0.016, a0, a1, 16), 0.045, sides=8, ell=(0.32, 1.0), wob=0, up=Vector((0, 1, 0))), body)
    for s in (-1, 1): tube([FA + V(0, s * 0.045, 0), FA + V(0.1, s * 0.045, 0.1)], 0.01, solid(CHROME_D), sides=4, mat=METAL)
    # 뒷등 — 흙받이 뒤 위
    tl = V(-0.37, 0, 0.255)
    paint(hull([tl + V(dx, y, dz) for dx in (0.0, 0.03) for y in (-0.022, 0.022) for dz in (-0.014, 0.016)]), solid(CHROME, 0.04), METAL)
    paint(hull([tl + V(dx, y, dz) for dx in (-0.006, 0.002) for y in (-0.018, 0.018) for dz in (-0.01, 0.012)]), solid(lin(0xe8302a)), GLOW)
    # 번호판 대신 작은 반사판 · 발판 · 옆 받침대
    for s in (-1, 1):
        p = V(PEG_P.x, s * PEG_P.y, PEG_P.z)
        tube([V(p.x + 0.01, s * 0.045, p.z), V(p.x, s * 0.06, p.z)], 0.01, solid(CHROME_D), sides=5, mat=METAL)
        paint(loft([V(p.x, s * 0.058, p.z), V(p.x, s * 0.105, p.z)], 0.012, sides=6, ell=(1.3, 0.8), wob=0), solid(RUBBER))
    tube([V(-0.05, 0.05, 0.1), V(-0.09, 0.1, 0.01)], 0.01, solid(CHROME_D), sides=4, mat=METAL)   # 옆 받침대(왼쪽)
    # 바퀴
    wheel('wheelF', FA, cs)
    wheel('wheelR', RA, cs)
    # 핸들 — 앞등·속도계·거울
    part('bars', loc=tuple(HT1))
    hb = HT1 + _AX * 0.02
    tube([HT1, hb], 0.02, solid(CHROME_D, 0.04), sides=8, mat=METAL)
    paint(loft([LAMP + V(-0.03, 0, 0), LAMP + V(0.0, 0, 0), LAMP + V(0.028, 0, 0)], [0.026, 0.042, 0.045], sides=14, wob=0), shade(M, MD, k=0.03) if coat != 'black' else solid(CHROME, 0.03), BASE if coat != 'black' else METAL)   # 앞등 통
    paint(loft([LAMP + V(0.026, 0, 0), LAMP + V(0.034, 0, 0)], [0.047, 0.045], sides=14, wob=0, cap1=False), solid(CHROME, 0.03), METAL)   # 테
    paint(loft([LAMP + V(0.03, 0, 0), LAMP + V(0.038, 0, 0)], [0.038, 0.03], sides=14, wob=0), solid(lin(0xfff2c0)), GLOW)                   # 유리
    for s in (-1, 1): tube([LAMP + V(-0.02, s * 0.03, -0.02), HT1 + V(0.0, s * 0.03, -0.03)], 0.01, solid(CHROME_D), sides=4, mat=METAL)
    gc = hb + V(0.01, 0, 0.022)   # 속도계
    paint(cyl(gc + V(-0.006, 0, -0.012), gc + V(0.004, 0, 0.012), 0.022, sides=12), solid(CHROME, 0.03), METAL)
    paint(cyl(gc + V(-0.009, 0, 0.004), gc + V(-0.004, 0, 0.016), 0.017, sides=12), solid(lin(0xf8f4e8)))
    for s in (-1, 1):
        g = V(GRIP_P.x, s * GRIP_P.y, GRIP_P.z)
        tube(crs([hb, hb + V(-0.005, s * 0.045, 0.006), V(g.x + 0.01, s * (GRIP_P.y - 0.035), g.z), V(g.x, s * (GRIP_P.y - 0.02), g.z)], 7), 0.01, solid(CHROME, 0.04), sides=6, mat=METAL)
        paint(loft([V(g.x, s * (GRIP_P.y - 0.022), g.z), V(g.x, s * (GRIP_P.y + 0.024), g.z)], [0.014, 0.015], sides=8, wob=0), solid(RUBBER))   # 손잡이
        paint(cyl(V(g.x, s * (GRIP_P.y + 0.024), g.z), V(g.x, s * (GRIP_P.y + 0.03), g.z), 0.012, sides=8), solid(CHROME), METAL)
        tube([V(g.x + 0.012, s * (GRIP_P.y - 0.03), g.z + 0.004), V(g.x + 0.02, s * (GRIP_P.y + 0.01), g.z - 0.002)], 0.01, solid(CHROME_D), sides=4, mat=METAL)   # 레버
        m0 = V(g.x + 0.008, s * (GRIP_P.y - 0.035), g.z + 0.008); m1 = V(g.x + 0.0, s * (GRIP_P.y + 0.025), g.z + 0.085)
        tube([m0, m0 + V(-0.004, s * 0.01, 0.05), m1], 0.01, solid(CHROME_D), sides=5, mat=METAL)   # 거울 대
        paint(cyl(m1 + V(-0.008, 0, 0.022), m1 + V(0.004, 0, 0.022), 0.028, sides=12), solid(CHROME, 0.03), METAL)   # 거울(둥근)
        paint(cyl(m1 + V(-0.011, 0, 0.022), m1 + V(-0.007, 0, 0.022), 0.022, sides=12), solid(lin(0xbfe0f0), 0.03), METAL)
    base()
    finish('mt_motorcycle_' + coat, OUT, center=False, lens=75, views={'a': (1.0, -1.25, 0.75), 's': (0.0, -1.0, 0.1), 'f': (1.0, 0.0, 0.25), 't': (0.05, 0.0, 1.0)})

def mt_motorcycle_cream(): _moto('cream')
def mt_motorcycle_red(): _moto('red')
def mt_motorcycle_black(): _moto('black')

# ── 오토바이 장식 ──
GLASS, GLASS_D = lin(0xcfe8f4), lin(0xa8cfe0)

def _windshield():   # 앞 바람막이 — 앞등 위로 휘어 올라간 둥근 유리, 크롬 테 (bars 축)
    n = 9; R = 0.1
    def at(k, h):
        a = math.radians(-60 + 120 * k / (n - 1))
        hz = h * (1 - 0.4 * math.sin(a) ** 2)            # 옆은 낮게 → 둥근 윗변
        x = LAMP.x + 0.012 - (1 - math.cos(a)) * R * 0.6 - hz * 0.07
        return V(x, math.sin(a) * R * (1 - 0.25 * hz * hz), LAMP.z + 0.035 + hz * 0.14)
    hs = [0, 0.33, 0.66, 0.85, 1.0]
    for k in range(n - 1):
        for j in range(len(hs) - 1):
            q = [at(k, hs[j]), at(k + 1, hs[j]), at(k, hs[j + 1]), at(k + 1, hs[j + 1])]
            paint(hull(q + [p + V(-0.006, 0, 0) for p in q]), shade(GLASS, GLASS_D, k=0.04))
    paint(loft([at(k, 1.0) + V(-0.003, 0, 0.004) for k in range(n)], 0.01, sides=5, wob=0), solid(CHROME, 0.03), METAL)    # 위 테
    paint(loft([at(k, 0.0) + V(-0.003, 0, -0.002) for k in range(n)], 0.01, sides=5, wob=0), solid(CHROME, 0.03), METAL)   # 아래 테
    for s in (-1, 1):   # 받침쇠 둘 — 앞등 통으로
        tube([at(1 if s < 0 else n - 2, 0.1) + V(-0.006, 0, 0), LAMP + V(-0.01, s * 0.03, 0.03)], 0.01, solid(CHROME_D), sides=4, mat=METAL)

def _sidecar():   # 사이드카 — 오른쪽(−y)에 단 총알 모양 작은 배, 붉은 방석, 앞에 작은 등, 바퀴 하나 (몸통)
    yc = -0.3; zc = 0.205
    shell, shell_d = lin(0xf0ece0), lin(0xc8c2b0)
    xs = [0.25, 0.21, 0.13, 0.02, -0.1, -0.2, -0.24]
    rs = [0.012, 0.05, 0.08, 0.09, 0.088, 0.07, 0.03]
    zs = [zc - 0.01, zc - 0.005, zc, zc + 0.005, zc + 0.005, zc + 0.01, zc + 0.012]
    ell = (1.0, 0.75)
    paint(loft([V(x, yc, z) for x, z in zip(xs, zs)], rs, sides=16, ell=ell, wob=0), shade(shell, shell_d, k=0.04))
    for s in (-1, 1):   # 옆 크롬 띠
        pts = [V(x, yc + s * r * 1.01, z + 0.004) for x, z, r in zip(xs[1:6], zs[1:6], rs[1:6])]
        paint(loft(pts, 0.006, sides=4, wob=0), solid(CHROME, 0.03), METAL)
    # 앉는 자리 — 위에 뚫린 자리(어두운 테)와 붉은 방석, 등받이
    top = zc + 0.062
    paint(loft([V(x, yc, top) for x in (0.06, 0.0, -0.08, -0.13)], [0.045, 0.06, 0.06, 0.045], sides=12, ell=(1.0, 0.18), wob=0), solid(lin(0x3a2a22), 0.05))
    rim = [V(0.02 + math.cos(a) * 0.1, yc + math.sin(a) * 0.065, top + 0.006) for a in [k / 16 * 2 * math.pi for k in range(16)]]
    rim = [V(p.x - 0.04, p.y, p.z) for p in rim]
    paint(loft(rim, 0.01, sides=5, closed=True, wob=0), solid(lin(0x5a3a26), 0.04))   # 가죽 테
    paint(blob(V(-0.045, yc, top + 0.012), (0.055, 0.05, 0.016), n=30, jitter=0.0), shade(lin(0xc83a34), lin(0x962424), k=0.05))   # 방석
    red, red_d = lin(0xc83a34), lin(0x962424)
    back = [V(-0.05 + math.cos(math.radians(d)) * 0.075, yc + math.sin(math.radians(d)) * 0.06, top + 0.035) for d in range(130, 231, 20)]
    paint(loft(back, 0.024, sides=8, ell=(0.7, 1.4), wob=0), shade(red, red_d, k=0.05))   # 둥근 등받이
    # 작은 앞유리 — 자리 앞을 둥글게 감싼다
    def sc(d, h): return V(-0.03 + math.cos(math.radians(d)) * 0.1 - h * 0.5, yc + math.sin(math.radians(d)) * 0.065, top + 0.008 + h)
    for d in range(-60, 60, 24):
        q = [sc(d, 0), sc(d + 24, 0), sc(d, 0.05), sc(d + 24, 0.05)]
        paint(hull(q + [p + V(-0.005, 0, 0) for p in q]), shade(GLASS, GLASS_D, k=0.04))
    paint(loft([sc(d, 0.052) for d in range(-60, 61, 20)], 0.006, sides=4, wob=0), solid(CHROME, 0.03), METAL)
    # 앞 작은 등
    paint(cyl(V(0.2, yc, zc + 0.05), V(0.215, yc, zc + 0.052), 0.016, sides=10), solid(CHROME), METAL)
    paint(cyl(V(0.215, yc, zc + 0.052), V(0.22, yc, zc + 0.052), 0.012, sides=10), solid(lin(0xfff2c0)), GLOW)
    paint(cyl(V(0.16, yc, zc + 0.04), V(0.2, yc, zc + 0.05), 0.01, sides=5), solid(CHROME_D), METAL)
    # 바퀴 — 바깥쪽, 반원 흙받이
    wc = V(-0.03, -0.44, 0.1); wr = 0.1
    paint(loft(ring(wc, wr - 0.025, y=wc.y), 0.025, sides=8, ell=(1.0, 1.1), closed=True, wob=0, up=Vector((0, 1, 0))), shade(TIRE, TIRE_D, k=0.05))
    paint(cyl(wc + V(0, -0.025, 0), wc + V(0, 0.025, 0), 0.05, sides=12), solid(CHROME, 0.03), METAL)
    paint(cyl(wc + V(0, -0.03, 0), wc + V(0, 0.03, 0), 0.018, sides=8), solid(CHROME_D, 0.03), METAL)
    fpts = [V(wc.x + math.cos(a) * (wr + 0.014), wc.y, wc.z + math.sin(a) * (wr + 0.014)) for a in [math.radians(10 + 160 * k / 11) for k in range(12)]]
    paint(loft(fpts, 0.036, sides=8, ell=(0.32, 1.0), wob=0, up=Vector((0, 1, 0))), shade(shell, shell_d, k=0.04))
    tube([wc + V(0, 0.03, 0), V(wc.x, yc - 0.06, zc - 0.03)], 0.012, solid(CHROME_D), sides=6, mat=METAL)    # 굴대 팔
    # 오토바이에 잇는 받침 — 앞뒤 둘, 아래 하나
    tube([V(0.12, yc + 0.06, zc - 0.02), V(0.1, -0.08, 0.14), V(0.08, -0.04, 0.12)], 0.012, solid(CHROME_D), sides=6, mat=METAL)
    tube([V(-0.15, yc + 0.065, zc - 0.01), V(-0.12, -0.1, 0.18), V(-0.08, -0.04, 0.2)], 0.012, solid(CHROME_D), sides=6, mat=METAL)
    tube([V(-0.03, yc + 0.05, zc - 0.055), V(-0.04, -0.12, 0.09), V(-0.05, -0.045, 0.1)], 0.012, solid(CHROME_D), sides=6, mat=METAL)

def _topbox():   # 뒤 짐 상자 — 안장 뒤 짐받이 위의 둥근 가죽 상자 (몸통)
    zr = 0.335
    for s in (-1, 1):   # 짐받이
        tube([V(-0.24, s * 0.055, zr), V(-0.39, s * 0.055, zr)], 0.01, solid(CHROME, 0.04), sides=5, mat=METAL)
        tube([V(-0.37, s * 0.055, zr), V(-0.34, s * 0.05, 0.27)], 0.01, solid(CHROME_D), sides=4, mat=METAL)
        tube([V(-0.25, s * 0.055, zr), V(-0.22, s * 0.055, 0.3)], 0.01, solid(CHROME_D), sides=4, mat=METAL)
    for x in (-0.28, -0.33, -0.39): tube([V(x, -0.055, zr), V(x, 0.055, zr)], 0.01, solid(CHROME), sides=4, mat=METAL)
    L, LD = lin(0xa86a3a), lin(0x7c4a24)
    x0, x1, w, z0, z1, ch = -0.405, -0.255, 0.075, zr + 0.01, zr + 0.11, 0.022
    pts = []
    for x in (x0, x1):
        for y in (-w, w):
            for z in (z0, z1):
                sx, sy, sz = (1 if x == x0 else -1), (1 if y < 0 else -1), (1 if z == z0 else -1)
                pts += [V(x + sx * ch, y, z), V(x, y + sy * ch, z), V(x, y, z + sz * ch * (0.5 if z == z0 else 1)), V(x + sx * ch * 0.4, y + sy * ch * 0.4, z + sz * ch * 0.4)]
    paint(hull([V(min(max(p.x, x0), x1), min(max(p.y, -w), w), min(max(p.z, z0), z1)) for p in pts]), shade(L, LD, k=0.05))
    # 가죽 끈 둘 · 크롬 걸쇠 · 뒤 반사판
    for xs in (x0 + 0.04, x1 - 0.04):
        strap = [V(xs, -w - 0.003, z0 + 0.01), V(xs, -w - 0.003, z1 - 0.01), V(xs, -w + 0.02, z1 + 0.003), V(xs, w - 0.02, z1 + 0.003), V(xs, w + 0.003, z1 - 0.01), V(xs, w + 0.003, z0 + 0.01)]
        paint(loft(strap, 0.01, sides=4, ell=(1.0, 0.4), wob=0, up=Vector((1, 0, 0))), solid(lin(0x4a2c18), 0.04))
        paint(hull([V(xs + dx, -w - 0.006 + dy, z1 - 0.05 + dz) for dx in (-0.012, 0.012) for dy in (0, 0.006) for dz in (0, 0.02)]), solid(lin(0xe6c05a)), METAL)
    paint(hull([V(x0 - 0.004 + dx, y, z0 + 0.03 + dz) for dx in (0, 0.006) for y in (-0.03, 0.03) for dz in (0, 0.014)]), solid(lin(0xe8302a)), GLOW)
    paint(blob(V((x0 + x1) / 2, 0, z1 + 0.006), (0.03, 0.012, 0.008), n=10, jitter=0), solid(CHROME), METAL)   # 손잡이

def _flags():   # 깃발 한 쌍 — 뒤 양쪽에 솟은 깃대와 제비꼬리 깃발 (몸통)
    cols = {1: (lin(0x7a4cc0), lin(0xf2c84a)), -1: (lin(0xf2c84a), lin(0x7a4cc0))}
    for s in (-1, 1):
        b = V(-0.33, s * 0.095, 0.25); t = V(-0.37, s * 0.1, 0.64)
        tube([V(-0.3, s * 0.06, 0.23), b + V(0, 0, 0.02)], 0.01, solid(CHROME_D), sides=4, mat=METAL)   # 고정쇠
        tube([b, t], 0.01, solid(lin(0xf0f0f0)), sides=6)
        paint(blob(t + V(0, 0, 0.012), (0.014, 0.014, 0.014), n=10, jitter=0), solid(lin(0xf2c84a)), METAL)
        F, F2 = cols[s]
        # 제비꼬리 깃발 — 네 조각으로 펄럭임
        L, H = 0.17, 0.085
        def at(u, h): return V(t.x - 0.012 - u * L, t.y + s * math.sin(u * 3.2) * 0.014, t.z - 0.015 - h)
        segs = 4
        for k in range(segs):
            u0, u1 = k / segs, (k + 1) / segs
            notch = lambda u: max(0.0, (u - 0.7) / 0.3) * H * 0.5
            for (h0, h1) in ((0, H / 2), (H / 2, H)):
                q = []
                for u in (u0, u1):
                    a0, a1 = (h0, h1)
                    if h0 == 0: a1 = max(H / 2 - notch(u), 0.003)
                    else: a0 = min(a0 + notch(u), H - 0.003)
                    q += [at(u, a0), at(u, a1)]
                paint(hull(q + [p + V(0, 0.004, 0) for p in q]), solid(F if k != 1 else F2, 0.04))

def gd_motorcycle_windshield(): begin(611); _windshield(); finish('gd_motorcycle_windshield', OUT, center=False)
def gd_motorcycle_sidecar(): begin(612); _sidecar(); finish('gd_motorcycle_sidecar', OUT, center=False)
def gd_motorcycle_topbox(): begin(613); _topbox(); finish('gd_motorcycle_topbox', OUT, center=False)
def gd_motorcycle_flags(): begin(614); _flags(); finish('gd_motorcycle_flags', OUT, center=False)

def pv_motorcycle():   # 확인용: 크림 오토바이 + 장식 넷을 한 모델로
    import lp
    _orig = lp.finish
    lp.finish = lambda *a, **k: None
    globals()['finish'] = lp.finish
    try:
        _moto('cream')
    finally:
        lp.finish = _orig; globals()['finish'] = _orig
    base(); random.seed(620)
    _windshield(); _sidecar(); _topbox(); _flags()
    finish('pv_motorcycle', OUT, center=True, lens=65, views={'a': (1.0, -1.25, 0.75), 's': (0.0, -1.0, 0.12), 'b': (-1.0, 0.9, 0.6), 'f': (1.0, 0.15, 0.35)})

ALL = [mt_motorcycle_cream, mt_motorcycle_red, mt_motorcycle_black, gd_motorcycle_windshield, gd_motorcycle_sidecar, gd_motorcycle_topbox, gd_motorcycle_flags, pv_motorcycle]
for f in ALL:
    if not ONLY or f.__name__ in ONLY: f()
print('DONE')
