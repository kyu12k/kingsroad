# 로우폴리 예물 공통 도구 — 각진 관(loft)·볼록 덩어리(hull)·면마다 색·glb 내보내기·미리보기
import bpy, bmesh, math, random, os
from mathutils import Vector, Quaternion, Matrix

def lin(c):
    f = lambda v: v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    return tuple(f(((c >> s) & 255) / 255) for s in (16, 8, 0))

class S:  # 지금 빚는 메시 — 움직일 부분은 따로(part), 이름으로 게임에서 찾는다
    bm = None; CL = None; parts = []

def _new_bm():
    S.bm = bmesh.new(); S.CL = S.bm.loops.layers.float_color.new('Col')

def begin(seed=1):
    random.seed(seed)
    for p in S.parts: p['bm'].free()
    S.parts = []; _new_bm(); S.parts.append({'name': 'base', 'bm': S.bm, 'loc': Vector(), 'rot': None, 'local': False})

def part(name, loc=(0, 0, 0), rot=None, local=False):
    """이제부터 빚는 것은 따로 움직이는 부분 name.
    local=False: 세계 좌표로 빚고, 축(원점)만 loc에 둔다 (흔들림·오르내림).
    local=True : 원점 기준으로 빚어 loc·rot(오일러, 라디안)으로 놓는다 (제 축으로 도는 것)."""
    _new_bm(); S.parts.append({'name': name, 'bm': S.bm, 'loc': Vector(loc), 'rot': rot, 'local': local})

def base():
    """다시 가만히 있는 부분으로"""
    S.bm = S.parts[0]['bm']; S.CL = S.bm.loops.layers.float_color['Col']

# 재질 번호: 0 = 보통, 1 = 금속(금·쇠), 2 = 빛(불꽃·별), 3 = 물들일 곳(tint — 게임이 그날 빛깔을 곱한다. 바다 생물 10/5)
BASE, METAL, GLOW, TINT = 0, 1, 2, 3

def jit(c, k=0.12):
    s = 1 - k / 2 + random.random() * k; return tuple(v * s for v in c)

def solid(c, k=0.1):
    return lambda p, n: jit(c, k)

def shade(top, side, bottom=None, k=0.12):
    """위를 향한 면·옆면·아랫면 색을 나눈다"""
    return lambda p, n: jit(top if n.z > 0.55 else (bottom or side) if n.z < -0.5 else side, k)

def paint(faces, fn, mat=BASE):
    for f in faces:
        f.normal_update(); f.material_index = mat
        c = fn(f.calc_center_median(), f.normal)
        for l in f.loops: l[S.CL] = (c[0], c[1], c[2], 1.0)
    return faces

def crs(pts, n):
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

def loft(pts, radii, sides=6, ell=(1.0, 1.0), cap0=True, cap1=True, wob=0.06, twist=0.0, up=Vector((0, 0, 1)), closed=False):
    bm = S.bm; pts = [Vector(p) for p in pts]; n = len(pts)
    if closed: T = [(pts[(i + 1) % n] - pts[(i - 1) % n]).normalized() for i in range(n)]
    else: T = [(pts[min(i + 1, n - 1)] - pts[max(i - 1, 0)]).normalized() for i in range(n)]
    N = up - T[0] * up.dot(T[0])
    if N.length < 1e-4: N = T[0].orthogonal()
    N.normalize(); rings = []
    for i in range(n):
        if i: N = T[i - 1].rotation_difference(T[i]) @ N; N = (N - T[i] * N.dot(T[i])).normalized()
        Bv = T[i].cross(N); r = radii[i] if isinstance(radii, (list, tuple)) else radii; ring = []
        for j in range(sides):
            a = j / sides * 2 * math.pi + math.pi / 2 + twist
            rr = r * (1 + (random.random() - 0.5) * wob)
            ring.append(bm.verts.new(pts[i] + Bv * math.cos(a) * rr * ell[0] + N * math.sin(a) * rr * ell[1]))
        rings.append(ring)
    faces = []
    last = n if closed else n - 1
    for i in range(last):
        r0, r1 = rings[i], rings[(i + 1) % n]
        for j in range(sides):
            faces.append(bm.faces.new((r0[j], r0[(j + 1) % sides], r1[(j + 1) % sides], r1[j])))
    if not closed:
        if cap0: faces.append(bm.faces.new(list(reversed(rings[0]))))
        if cap1: faces.append(bm.faces.new(rings[-1]))
    bmesh.ops.recalc_face_normals(bm, faces=faces)
    return faces

def hull(points):
    bm = S.bm; vs = [bm.verts.new(Vector(p)) for p in points]
    r = bmesh.ops.convex_hull(bm, input=vs)
    junk = list({v for v in r['geom_interior'] + r['geom_unused'] if isinstance(v, bmesh.types.BMVert)})   # 겹쳐 나올 수 있다
    if junk: bmesh.ops.delete(bm, geom=junk, context='VERTS')
    return [g for g in r['geom'] if isinstance(g, bmesh.types.BMFace)]

def blob(center, radii, n=26, jitter=0.12):
    """울퉁불퉁한 덩어리 — 타원체 위의 점을 흔들어 볼록 껍질로"""
    c = Vector(center); pts = []
    for k in range(n):
        z = 1 - 2 * (k + 0.5) / n; r = math.sqrt(max(0, 1 - z * z)); a = k * 2.39996
        d = Vector((math.cos(a) * r, math.sin(a) * r, z)) * (1 + (random.random() - 0.5) * jitter)
        pts.append(c + Vector((d.x * radii[0], d.y * radii[1], d.z * radii[2])))
    return hull(pts)

def cone(base, tip, r, sides=4):
    base, tip = Vector(base), Vector(tip); ax = tip - base; s1 = ax.orthogonal().normalized(); s2 = ax.normalized().cross(s1)
    return hull([base + (s1 * math.cos(a) + s2 * math.sin(a)) * r for a in [k / sides * 2 * math.pi for k in range(sides)]] + [tip])

def cyl(p0, p1, r0, r1=None, sides=8, wob=0.0):
    return loft([p0, p1], [r0, r0 if r1 is None else r1], sides=sides, wob=wob)

def mirror(pts):
    out = list(pts)
    for p in pts:
        if abs(p[1]) > 1e-6: out.append((p[0], -p[1], p[2]))
    return out

# ── 구석 그늘(AO) 굽기 (2026-10-04) — 면 모서리마다 바깥쪽 반구로 광선을 쏴서 가려진 만큼 꼭짓점 색을 어둡게.
#    게임은 이 색을 그대로 곱해 그리므로 실시간 계산이 하나도 늘지 않고 텍스처도 없다(용량 거의 그대로).
#    바닥(모델 맨 아래 높이)도 가리는 것으로 쳐서 땅에 닿는 아랫부분이 자연스럽게 어두워진다. 빛나는 재질(GLOW)은 건너뛴다.
_AO_DIRS = None
def _ao_dirs(n=28):
    global _AO_DIRS
    if _AO_DIRS is None:   # 코사인 가중 반구 — 고정된 방향(매번 같은 결과)
        out = []; ga = math.pi * (3 - math.sqrt(5))
        for i in range(n):
            u = (i + 0.5) / n; r = math.sqrt(u); a = i * ga
            out.append(Vector((r * math.cos(a), r * math.sin(a), math.sqrt(max(0.0, 1 - u)))))
        _AO_DIRS = out
    return _AO_DIRS

def bake_ao(obs, strength=0.6, reach=0.22, ground=True):
    from mathutils.bvhtree import BVHTree
    verts, polys = [], []
    for ob in obs:
        mw = ob.matrix_world; o = len(verts)
        verts += [mw @ v.co for v in ob.data.vertices]
        polys += [[o + i for i in p.vertices] for p in ob.data.polygons]
    if not polys: return
    tree = BVHTree.FromPolygons(verts, polys)
    zs = [v.z for v in verts]; zmin = min(zs)
    size = max(max(v.x for v in verts) - min(v.x for v in verts), max(v.y for v in verts) - min(v.y for v in verts), max(zs) - zmin)
    maxd = max(0.02, size * reach); eps = size * 0.0015
    dirs = _ao_dirs()
    for ob in obs:
        me = ob.data; mw = ob.matrix_world; nm = mw.to_3x3()
        col = me.color_attributes.get('Col') if hasattr(me, 'color_attributes') else None
        if col is None: continue
        for p in me.polygons:
            if p.material_index == GLOW: continue
            n = (nm @ p.normal).normalized()
            q = n.to_track_quat('Z', 'Y')   # 반구의 z를 면의 바깥쪽으로
            ctr = mw @ p.center
            for li in p.loop_indices:
                v = mw @ me.vertices[me.loops[li].vertex_index].co
                org = v.lerp(ctr, 0.12) + n * eps   # 모서리에서 조금 안쪽 — 이웃 면에 바로 걸리지 않게
                occ = 0.0
                for d0 in dirs:
                    d = q @ d0
                    hit = tree.ray_cast(org, d, maxd)
                    dist = hit[3] if hit[0] is not None else None
                    if ground and d.z < -1e-3:
                        tg = (zmin - org.z) / d.z
                        if 0 < tg < maxd and (dist is None or tg < dist): dist = tg
                    if dist is not None: occ += 1.0 - (dist / maxd) ** 0.5 * 0.6
                ao = 1.0 - strength * (occ / len(dirs))
                c = col.data[li].color
                col.data[li].color = (c[0] * ao, c[1] * ao, c[2] * ao, c[3])

# ── 끝내기: 메시 → 재질 → 바닥 가운데 원점 → glb → 미리보기 ──
def _mat(name, metal, rough, emit=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    ca = m.node_tree.nodes.new('ShaderNodeVertexColor'); ca.layer_name = 'Col'
    m.node_tree.links.new(ca.outputs['Color'], b.inputs['Base Color'])
    b.inputs['Metallic'].default_value = metal; b.inputs['Roughness'].default_value = rough
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = 1.0
    return m

def finish(name, out_dir, emit=(1.0, 0.75, 0.3), views=None, lens=40, center=True, ao=0.6):   # ao: 구석 그늘 세기(0이면 안 굽는다)   # center=False: 원점을 그대로 둔다(탈것과 그 장식처럼 서로 맞물려야 하는 모델)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    mats = [_mat('base', 0.0, 0.72), _mat('metal', 0.9, 0.32), _mat('glow', 0.0, 0.5, emit), _mat('tint', 0.0, 0.6)]
    obs = []; roots = []
    for pt in S.parts:
        if not pt['bm'].faces: pt['bm'].free(); continue
        me = bpy.data.meshes.new(pt['name']); pt['bm'].to_mesh(me); pt['bm'].free()
        for p in me.polygons: p.use_smooth = False
        for m in mats: me.materials.append(m)
        if not pt['local']: me.transform(Matrix.Translation(-pt['loc']))
        if pt['name'] == 'base':
            ob = bpy.data.objects.new('base', me); sc.collection.objects.link(ob); pivot = ob
        else:
            # 움직이는 부분: 빈 축(pivot, 이름 그대로) 아래에 메시(이름_m)를 붙인다.
            # 압축(quantize)이 메시 노드의 위치·크기를 바꿔도 축은 그대로 남아 게임에서 이 축을 돌린다
            pivot = bpy.data.objects.new(pt['name'], None); sc.collection.objects.link(pivot)
            ob = bpy.data.objects.new(pt['name'] + '_m', me); sc.collection.objects.link(ob); ob.parent = pivot
        pivot.location = pt['loc']
        if pt['rot']: pivot.rotation_euler = pt['rot']
        obs.append(ob); roots.append(pivot)
    S.parts = []; S.bm = None
    bpy.context.view_layer.update()
    if ao and obs: bake_ao(obs, ao, ground=not name.startswith('gd_'))   # 탈것 장식(gd_)은 탈것 위에 얹혀 맨 아래가 땅이 아니다
    xs = [ob.matrix_world @ v.co for ob in obs for v in ob.data.vertices]
    mn = Vector((min(v.x for v in xs), min(v.y for v in xs), min(v.z for v in xs))); mx = Vector((max(v.x for v in xs), max(v.y for v in xs), max(v.z for v in xs)))
    ctr = Vector(((mn.x + mx.x) / 2, (mn.y + mx.y) / 2, mn.z)) if center else Vector((0, 0, 0))
    for r in roots: r.location -= ctr
    size = mx - mn
    tris = sum(len(p.vertices) - 2 for ob in obs for p in ob.data.polygons)
    os.makedirs(out_dir, exist_ok=True); path = os.path.join(out_dir, name + '.glb')
    for ob in obs + roots: ob.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_yup=True, export_vertex_color='ACTIVE')
    print('GIFT', name, 'TRIS', tris, 'SIZE', tuple(round(v, 2) for v in size), 'CENTER', (round(ctr.x, 3), round(ctr.y, 3)), 'GLB', os.path.getsize(path), 'PARTS', [o.name for o in obs])   # CENTER = 원점으로 옮긴 바닥 가운데(블렌더 x, y)
    # 미리보기 (LP_NO_PREVIEW=1이면 건너뛴다 — 모델을 한꺼번에 다시 뽑을 때. 미리보기 렌더가 모델당 1분 넘게 걸렸다)
    if os.environ.get('LP_NO_PREVIEW'): return
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.62, 0.72, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.7
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sc.collection.objects.link(sun)
    sun.data.energy = 3.2; sun.rotation_euler = (math.radians(48), 0, math.radians(30))
    gm = bpy.data.meshes.new('g'); gb = bmesh.new(); bmesh.ops.create_grid(gb, x_segments=1, y_segments=1, size=6); gb.to_mesh(gm); gb.free()
    g = bpy.data.objects.new('g', gm); sc.collection.objects.link(g)
    gmat = bpy.data.materials.new('gm'); gmat.use_nodes = True; gmat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.4, 0.5, 0.42, 1); gm.materials.append(gmat)
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = lens
    sc.render.resolution_x, sc.render.resolution_y = 700, 560
    sc.render.engine = 'BLENDER_EEVEE_NEXT'
    R = max(size.x, size.y, size.z)
    tgt = Vector((0, 0, size.z * 0.45))
    for vn, d in (views or {'a': (1.0, -1.25, 0.75)}).items():
        cam.location = tgt + Vector(d).normalized() * R * 2.3
        cam.rotation_euler = (tgt - cam.location).to_track_quat('-Z', 'Y').to_euler()
        sc.render.filepath = os.path.join(out_dir, f'{name}_{vn}.png'); bpy.ops.render.render(write_still=True)
