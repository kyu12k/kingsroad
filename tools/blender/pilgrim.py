# 순례자 모델 — KayKit Adventurers 1.0(Kay Lousberg, CC0)의 Mage 몸에 꾸미기 부품을 모두 담아 GLB 하나로 (10/20)
# 원본: https://kaylousberg.itch.io/kaykit-adventurers — BASE 아래 adv/ 에 풀어 둔다(저장소에는 넣지 않음)
# 실행: blender --background --factory-startup --python tools/blender/pilgrim.py   (PREVIEW=1 이면 조합 미리보기만)
# 다시 뽑으면 nj3d.js의 PILGRIM_V를 올릴 것.
#
# 부품(앱이 이름으로 켜고 끈다 — nj3d.js PM_PARTS): 모두 머리 뼈에 100% 붙은 따로 메시
#   hair_tied·hair_short·hair_long·hair_hood·scalp(민머리)   · beard
#   eyes_soft·eyes_happy·eyes_bright·eyes_dot   · brow_thin·brow_thick·brow_bushy
#   nose_dot·nose_button·nose_big   · mouth_smile·mouth_open·mouth_small·mouth_flat   · blush   · ears_s·ears_m·ears_l
# 재질(앱이 색을 바꾼다): skin · hair · brow · eye · hood  (그 밖 ink·white·blush·lip·mouth·tongue·skin_dk는 고정)
# 피부는 색칠 지도 대신 skin 재질 — 몸·팔의 살빛 칸(지도 왼쪽 위)을 쓰던 면도 skin으로 바꾼다
import bpy, os, math, bmesh
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree
BASE = r'C:\Users\kikej\kingsroad_assets\kaykit'
APP = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) if '__file__' in dir() else r'C:\Users\kikej\OneDrive\바탕 화면\앱들\kingsload'
OUT = os.path.join(APP, 'models', 'pilgrim')
PREV = os.path.join(BASE, 'face')
PREVIEW = os.environ.get('PREVIEW') == '1'
KEEP = {'Idle', 'Walking_A', 'Running_A', 'Running_B', 'Jump_Idle', 'Jump_Start', 'Sit_Chair_Idle', 'Sit_Floor_Idle', 'Cheer'}
cdir = None
for r, d, f in os.walk(os.path.join(BASE, 'adv')):
    if 'Mage.glb' in f: cdir = r

def islands(me):
    bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
    seen = set(); out = []
    for v in bm.verts:
        if v.index in seen: continue
        st = [v]; comp = []; seen.add(v.index)
        while st:
            x = st.pop(); comp.append(x.index)
            for e in x.link_edges:
                o = e.other_vert(x)
                if o.index not in seen: seen.add(o.index); st.append(o)
        out.append(comp)
    bm.free(); return out

def keep_only(obj, idx):
    idx = set(idx)
    bm = bmesh.new(); bm.from_mesh(obj.data); bm.verts.ensure_lookup_table()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.index not in idx], context='VERTS'); bm.to_mesh(obj.data); bm.free()

def extract(src, idx, name):
    o = src.copy(); o.data = src.data.copy(); o.name = name; o.data.name = name
    bpy.context.scene.collection.objects.link(o); keep_only(o, idx); return o

def mat(name, rgb, rough=0.7):
    m = bpy.data.materials.get(name)
    if m: return m
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough
    m.diffuse_color = (*rgb, 1); return m

def set_mat(o, m):
    o.data.materials.clear(); o.data.materials.append(m)
    for p in o.data.polygons: p.material_index = 0; p.use_smooth = True

def attach(o, rig):   # 머리 뼈에 100% — 처음 자세 그대로 Mage 뼈대에 붙인다
    mw = o.matrix_world.copy(); o.parent = rig; o.matrix_world = mw
    for g in list(o.vertex_groups): o.vertex_groups.remove(g)
    vg = o.vertex_groups.new(name='head'); vg.add(list(range(len(o.data.vertices))), 1.0, 'REPLACE')
    for m in list(o.modifiers): o.modifiers.remove(m)
    a = o.modifiers.new('Armature', 'ARMATURE'); a.object = rig

def join(objs, name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1: bpy.ops.object.join()
    o = bpy.context.view_layer.objects.active; o.name = name; o.data.name = name; return o

# ── 1. Mage 몸 ──
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=os.path.join(cdir, 'Mage.glb'))
sc = bpy.context.scene
for o in list(sc.objects):
    if o.type == 'MESH' and o.name in ('Spellbook', 'Spellbook_open', '1H_Wand', '2H_Staff', 'Mage_Hat', 'Icosphere'):
        bpy.data.objects.remove(o, do_unlink=True)
rig = next(o for o in sc.objects if o.type == 'ARMATURE')
RIG_NAME = rig.name
SKIN = mat('skin', (0.93, 0.70, 0.55)); SKIN_DK = mat('skin_dk', (0.86, 0.60, 0.47)); HAIR = mat('hair', (0.17, 0.12, 0.10), 0.6); BROWM = mat('brow', (0.22, 0.14, 0.10))
EYE = mat('eye', (0.08, 0.05, 0.05), 0.35); INK = mat('ink', (0.06, 0.045, 0.05), 0.35); WHITE = mat('white', (1, 1, 1), 0.3)
BLUSH = mat('blush', (0.98, 0.58, 0.55), 0.8); LIP = mat('lip', (0.55, 0.22, 0.18), 0.6); MOUTH = mat('mouth', (0.42, 0.10, 0.10), 0.6); TONGUE = mat('tongue', (0.95, 0.52, 0.52), 0.6)
HOOD = mat('hood', (0.86, 0.78, 0.64), 0.85)

# 색칠 지도 — 겉옷 흰색·망토 금빛·청록 크림(명암은 살림)
head = bpy.data.objects['Mage_Head']
img = None
for n in head.material_slots[0].material.node_tree.nodes:
    if n.type == 'TEX_IMAGE' and n.image: img = n.image
W, H = img.size
a = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4); rgb = a[..., :3]
mx = rgb.max(-1); mn = rgb.min(-1); dd = mx - mn + 1e-6; r_, g_, b_ = rgb[..., 0], rgb[..., 1], rgb[..., 2]
hue = np.where(mx == r_, ((g_ - b_) / dd) % 6, np.where(mx == g_, (b_ - r_) / dd + 2, (r_ - g_) / dd + 4)) * 60
sat = np.where(mx > 0, dd / (mx + 1e-6), 0)
def paint(mask, base, lo, hi):
    v = mx[mask]; v = (v - v.min()) / (v.max() - v.min() + 1e-6) if v.size else v
    rgb[mask] = np.array(base, dtype=np.float32)[None, :] * (lo + (hi - lo) * v)[:, None]
paint((hue >= 215) & (hue <= 290) & (sat > 0.12), (1.0, 0.985, 0.95), 0.72, 1.0)
paint(((hue >= 300) | (hue <= 5)) & (sat > 0.45) & (mx > 0.35), (1.0, 0.80, 0.36), 0.70, 1.0)
paint((hue >= 165) & (hue < 215) & (sat > 0.25), (1.0, 0.95, 0.84), 0.70, 0.95)
a[..., :3] = rgb; img.pixels[:] = a.ravel(); img.update()

# 몸·팔·다리의 살빛 면(지도 u<0.125, v>0.75) → skin 재질
for o in sc.objects:
    if o.type != 'MESH' or o.name == 'Mage_Head': continue
    me = o.data; uv = me.uv_layers.active.data
    me.materials.append(SKIN); si = len(me.materials) - 1
    for p in me.polygons:
        u = sum(uv[l].uv[0] for l in p.loop_indices) / p.loop_total; v = sum(uv[l].uv[1] for l in p.loop_indices) / p.loop_total
        if u < 0.125 and v > 0.75: p.material_index = si

# Mage 머리 → 바탕(피부 0 + 입 덮개 5 + 뒤 두건 1) · 묶은 머리 · 귀 · 큰 코. 눈·눈썹은 버린다
isl = islands(head.data)
MH = {'skin': [0, 5], 'back': [1], 'hair': [2, 3, 4, 6, 7, 8], 'ears': [9, 10, 11, 12, 13, 14], 'nose': [15, 16]}
V = lambda keys: [i for k in keys for j in MH[k] for i in isl[j]]
hair_tied = extract(head, V(['hair']), 'hair_tied'); set_mat(hair_tied, HAIR)
ears_m = extract(head, V(['ears']), 'ears_m'); set_mat(ears_m, SKIN)
nose_big = extract(head, V(['nose']), 'nose_big'); set_mat(nose_big, SKIN)
keep_only(head, V(['skin']))   # 뒤 두건 주름(1)은 뺀다 — 머리 모양을 바꾸면 뒤통수 아래 흰 고리로 떴다
skin_set = set(islands(head.data)[0])
# 입 자리 홈 메우기 — 턱(1.239: 0.348)부터 볼(1.499: 0.444)까지 한 곡선
mw = head.matrix_world; inv = mw.inverted()
for vtx in head.data.vertices:
    w = mw @ vtx.co
    if 1.26 < w.z < 1.49 and w.y < -0.1:
        rr = 0.444 - 1.42 * (1.499 - w.z) ** 2; cur = math.hypot(w.x, w.y); k = max(0.0, min(1.0, (0.4 - abs(w.x)) / 0.12)); s = 1 + (rr / cur - 1) * k
        w.x *= s; w.y *= s; vtx.co = inv @ w
head.data.materials.append(SKIN); si = len(head.data.materials) - 1
hi = islands(head.data); back_idx = None
for comp in hi:   # 뒤 두건(보라 → 흰) 덩어리만 지도 그대로, 나머지는 피부
    c = sum((mw @ head.data.vertices[i].co).y for i in comp) / len(comp)
    if c > 0.3 and len(comp) == 42: back_idx = set(comp)
for p in head.data.polygons:
    if back_idx and all(i in back_idx for i in p.vertices): continue
    p.material_index = si; p.use_smooth = True
# 귀 크기 셋 — 귀 뿌리(±0.37, 0, 1.51)를 기준으로
def scaled_ears(k, name):
    o = extract(ears_m, range(len(ears_m.data.vertices)), name)
    for vtx in o.data.vertices:
        w = o.matrix_world @ vtx.co; root = Vector((0.37 if w.x > 0 else -0.37, 0.0, 1.51))
        vtx.co = o.matrix_world.inverted() @ (root + (w - root) * k)
    return o
ears_s = scaled_ears(0.8, 'ears_s'); ears_l = scaled_ears(1.25, 'ears_l')

# ── 2. 다른 캐릭터에서 머리카락·수염·눈썹·두건 ──
def borrow(fname, headname, groups):
    before = set(bpy.data.objects); bacts = set(bpy.data.actions)
    bpy.ops.import_scene.gltf(filepath=os.path.join(cdir, fname))
    new = [o for o in bpy.data.objects if o not in before]
    h = next(o for o in new if o.name.startswith(headname))
    hi = islands(h.data); out = {}
    for name, (ids, m) in groups.items():
        o = extract(h, [i for j in ids for i in hi[j]], name); set_mat(o, m); out[name] = o
    for o in new: bpy.data.objects.remove(o, do_unlink=True)
    for ac in list(bpy.data.actions):
        if ac not in bacts: bpy.data.actions.remove(ac)
    return out
parts = {'hair_tied': hair_tied, 'ears_m': ears_m, 'ears_s': ears_s, 'ears_l': ears_l, 'nose_big': nose_big}
parts.update(borrow('Knight.glb', 'Knight_Head', {'hair_short': ([2, 4, 5, 6], HAIR)}))
parts.update(borrow('Rogue.glb', 'Rogue_Head', {'hair_long': ([0, 1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 44, 45, 46, 47, 48], HAIR), 'brow_thick': ([51, 52, 53, 56, 57, 58], BROWM)}))
parts.update(borrow('Rogue_Hooded.glb', 'Rogue_Head_Hooded', {'hair_hood': ([0, 3, 4, 5, 6], HOOD)}))
parts.update(borrow('Barbarian.glb', 'Barbarian_Head', {'beard': ([1, 2, 3, 4, 5, 6, 7, 8, 9], HAIR), 'brow_bushy': ([19, 20, 22, 23], BROWM), 'scalp': ([0], SKIN)}))
# 민머리 두피 — 바바리안 머리에서 얼굴 앞(수염에 가려 잘린 곳)을 빼고 정수리·뒤통수만, 아주 조금 키워 얼굴 위 끝을 덮는다
sp = parts['scalp']; spw = sp.matrix_world
keep_only(sp, [i for i, vtx in enumerate(sp.data.vertices) if (spw @ vtx.co).z > 1.8 or (spw @ vtx.co).y > 0.0])
for vtx in sp.data.vertices:
    w = spw @ vtx.co; c = Vector((0, 0, 1.6)); vtx.co = spw.inverted() @ (c + (w - c) * 1.01)

# ── 3. 얼굴 그림(눈·눈썹·코·입·볼) — 얼굴 면에 붙는 얇은 조각 ──
class Face:
    def __init__(self, h):
        mw = h.matrix_world; verts = [mw @ v.co for v in h.data.vertices]
        polys = [list(p.vertices) for p in h.data.polygons if all(i in skin_set for i in p.vertices)]
        self.bvh = BVHTree.FromPolygons(verts, polys); self.new = []
    def surf(self, x, z):
        hit = self.bvh.ray_cast(Vector((x, -2.0, z)), Vector((0, 1, 0)))
        exp = -math.sqrt(max(0.01, 0.444 ** 2 - x * x))
        if hit[0] is None or hit[0].y > exp + 0.012:   # 빗나감·눈 구멍 — 둥근 얼굴로 어림
            return Vector((x, exp, z)), Vector((x, exp, 0)).normalized()
        n = hit[1]
        return hit[0], (-n if n.y > 0 else n)
    def decal(self, cx, cz, rx, rz, m, off, seg=24, shape=None):
        bm = bmesh.new(); ring = []
        for i in range(seg):
            t = i / seg * math.tau; dx, dz = shape(t) if shape else (math.cos(t), math.sin(t))
            p, n = self.surf(cx + dx * rx, cz + dz * rz); ring.append(bm.verts.new(p + n * off))
        p, n = self.surf(cx, cz); c = bm.verts.new(p + n * off)
        for i in range(seg): bm.faces.new((c, ring[(i + 1) % seg], ring[i]))
        bm.normal_update()
        if sum(f.normal.y for f in bm.faces) > 0:
            for f in bm.faces: f.normal_flip()
        me = bpy.data.meshes.new('d'); bm.to_mesh(me); bm.free(); me.materials.append(m)
        ob = bpy.data.objects.new('d', me); sc.collection.objects.link(ob); self.new.append(ob)
    def tube(self, pts, r, m, off):
        cu = bpy.data.curves.new('c', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = r; cu.bevel_resolution = 3; cu.use_fill_caps = True
        spn = cu.splines.new('POLY'); spn.points.add(len(pts) - 1)
        for i, (x, z) in enumerate(pts):
            p, n = self.surf(x, z); q = p + n * (off + r * 0.6); spn.points[i].co = (q.x, q.y, q.z, 1)
        o = bpy.data.objects.new('c', cu); sc.collection.objects.link(o)
        dg = bpy.context.evaluated_depsgraph_get(); me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
        bpy.data.objects.remove(o); me.materials.clear(); me.materials.append(m)
        ob = bpy.data.objects.new('t', me); sc.collection.objects.link(ob); self.new.append(ob)
    def part(self, name, fn):
        self.new = []; fn(self)
        o = join(self.new, name)
        for p in o.data.polygons: p.use_smooth = True
        parts[name] = o
F = Face(head)
def arc(cx, cz, w, h, n=9, tilt=0.0):
    return [(cx + (i / (n - 1) - 0.5) * w, cz + h * (1 - (2 * i / (n - 1) - 1) ** 2) + tilt * (i / (n - 1) - 0.5)) for i in range(n)]
MZ = 0.03   # 입 자리를 메운 뒤라 입을 조금 올린다
def eyes_soft(F):
    for sg in (-1, 1):
        x = sg * 0.2
        F.decal(x, 1.6, 0.058, 0.08, EYE, 0.004)
        F.decal(x - 0.02, 1.632, 0.021, 0.021, WHITE, 0.008, 12)
        F.decal(x + 0.022, 1.565, 0.009, 0.009, WHITE, 0.008, 10)
def eyes_happy(F):
    for sg in (-1, 1): F.tube(arc(sg * 0.2, 1.6, 0.12, 0.04), 0.013, INK, 0.003)
def eyes_bright(F):
    for sg in (-1, 1):
        x = sg * 0.2
        F.decal(x, 1.6, 0.062, 0.085, EYE, 0.004)
        F.decal(x, 1.592, 0.036, 0.052, INK, 0.007)
        F.decal(x - 0.022, 1.636, 0.02, 0.02, WHITE, 0.01, 12)
        F.decal(x + 0.022, 1.56, 0.009, 0.009, WHITE, 0.01, 10)
        F.tube([(x + dx * sg, z) for dx, z in arc(0, 1.675, 0.14, 0.012, tilt=0.03)], 0.011, INK, 0.003)
def eyes_dot(F):
    for sg in (-1, 1):
        x = sg * 0.19
        F.decal(x, 1.6, 0.04, 0.046, EYE, 0.004)
        F.decal(x - 0.013, 1.617, 0.013, 0.013, WHITE, 0.008, 10)
def brow_thin(F):
    for sg in (-1, 1): F.tube([(sg * x, zz) for x, zz in arc(0.2, 1.735, 0.13, 0.018)], 0.009, BROWM, 0.003)
def blush(F):
    for sg in (-1, 1): F.decal(sg * 0.29, 1.5, 0.055, 0.03, BLUSH, 0.003, 20)
def nose_dot(F): F.decal(0, 1.49, 0.024, 0.017, SKIN_DK, 0.003, 14)
def nose_button(F):
    F.decal(0, 1.5, 0.05, 0.04, SKIN, 0.012, 18)
    F.decal(0, 1.5, 0.042, 0.032, SKIN, 0.02, 18)
    F.decal(0.012, 1.512, 0.012, 0.009, WHITE, 0.024, 10)
def mouth_smile(F): F.tube(arc(0, 1.395 + MZ, 0.11, -0.022), 0.009, LIP, 0.003)
def mouth_open(F):
    F.decal(0, 1.385 + MZ, 0.06, 0.045, MOUTH, 0.003, 24, shape=lambda t: (math.cos(t), math.sin(t) if math.sin(t) < 0 else 0.2 * math.sin(t)))
    F.decal(0, 1.362 + MZ, 0.03, 0.015, TONGUE, 0.006, 16)
def mouth_small(F): F.decal(0, 1.39 + MZ, 0.022, 0.017, MOUTH, 0.003, 16)
def mouth_flat(F): F.tube([(-0.045, 1.4 + MZ), (0, 1.398 + MZ), (0.045, 1.4 + MZ)], 0.008, LIP, 0.003)
for name, fn in [('eyes_soft', eyes_soft), ('eyes_happy', eyes_happy), ('eyes_bright', eyes_bright), ('eyes_dot', eyes_dot), ('brow_thin', brow_thin),
                 ('blush', blush), ('nose_dot', nose_dot), ('nose_button', nose_button),
                 ('mouth_smile', mouth_smile), ('mouth_open', mouth_open), ('mouth_small', mouth_small), ('mouth_flat', mouth_flat)]:
    F.part(name, fn)
rig = bpy.data.objects[RIG_NAME]
for o in parts.values(): attach(o, rig)
print('REPORT parts', sorted((k, len(o.data.vertices)) for k, o in parts.items()))

# ── 4. 미리보기 — 조합 몇 개 ──
COMBOS = {
    'default': ['hair_tied', 'eyes_soft', 'brow_thin', 'nose_dot', 'mouth_smile', 'blush', 'ears_m'],
    'short': ['hair_short', 'eyes_bright', 'brow_thick', 'nose_dot', 'mouth_smile', 'ears_m'],
    'long': ['hair_long', 'eyes_happy', 'brow_thin', 'nose_button', 'mouth_open', 'blush', 'ears_s'],
    'hood': ['hair_hood', 'eyes_dot', 'nose_dot', 'mouth_small', 'blush', 'ears_m'],
    'bald': ['scalp', 'beard', 'eyes_soft', 'brow_bushy', 'nose_big', 'mouth_flat', 'ears_l'],
}
def show(keys):
    for k, o in parts.items(): o.hide_render = k not in keys
def render_all():
    try: sc.render.engine = 'BLENDER_EEVEE_NEXT'
    except TypeError: sc.render.engine = 'BLENDER_EEVEE'
    sc.render.resolution_x = 360; sc.render.resolution_y = 360; sc.view_settings.view_transform = 'Standard'
    sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True
    sc.world.node_tree.nodes['Background'].inputs['Color'].default_value = (0.75, 0.85, 0.78, 1)
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 3.2; sun.data.use_shadow = False
    sun.rotation_euler = (math.radians(50), 0, math.radians(-30)); sc.collection.objects.link(sun)
    cam = bpy.data.objects.new('_cam', bpy.data.cameras.new('_cam')); sc.collection.objects.link(cam); cam.data.lens = 60; sc.camera = cam
    for tag, keys in COMBOS.items():
        show(keys)
        for vt, ctr, dist, az in (('h', Vector((0, 0, 1.65)), 2.3, 25), ('b', Vector((0, 0, 1.1)), 4.8, 150)):
            aa = math.radians(az); cam.location = ctr + Vector((math.sin(aa), -math.cos(aa), 0.12)) * dist
            cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
            sc.render.filepath = os.path.join(PREV, f'cmb_{tag}_{vt}.png'); bpy.ops.render.render(write_still=True)
    for o in parts.values(): o.hide_render = False
    bpy.data.objects.remove(sun); bpy.data.objects.remove(cam)
if PREVIEW:
    render_all()
else:
    for ac in list(bpy.data.actions):
        if ac.name not in KEEP: bpy.data.actions.remove(ac)
        else: ac.use_fake_user = True
    if rig.animation_data:
        rig.animation_data.action = None
        for t in list(rig.animation_data.nla_tracks): rig.animation_data.nla_tracks.remove(t)
    img.scale(512, 512); img.name = 'pilgrim'
    os.makedirs(OUT, exist_ok=True); dst = os.path.join(OUT, 'pilgrim.glb')
    bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_animation_mode='ACTIONS', export_image_format='JPEG',
                              export_jpeg_quality=90, export_optimize_animation_size=True, export_yup=True, export_apply=False)
    print('REPORT SIZE', os.path.getsize(dst), 'actions', sorted(a.name for a in bpy.data.actions))
