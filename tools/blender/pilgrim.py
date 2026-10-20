# 순례자 모델 내보내기 — KayKit Mage(CC0)에서 모자·소품을 빼고 흰 겉옷·금빛 망토로 칠한 뒤, 앱에서 쓸 동작만 남겨 GLB로
# 원본: KayKit Character Pack: Adventurers 1.0 (Kay Lousberg, CC0) — https://kaylousberg.itch.io/kaykit-adventurers
#       BASE 아래 adv/ 에 풀어 둔다(저장소에는 넣지 않음). 다시 뽑으면 nj3d.js의 PILGRIM_V를 올릴 것
# 실행: blender --background --factory-startup --python tools/blender/pilgrim.py
import bpy, os
import numpy as np
from mathutils import Vector
BASE = r'C:\Users\kikej\kingsroad_assets\kaykit'
OUT = r'C:\Users\kikej\OneDrive\바탕 화면\앱들\kingsload\models\pilgrim'
os.makedirs(OUT, exist_ok=True)
char = None
for r, d, f in os.walk(os.path.join(BASE, 'adv')):
    if 'Mage.glb' in f: char = os.path.join(r, 'Mage.glb')
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=char)
sc = bpy.context.scene
for o in list(sc.objects):
    if o.type == 'MESH' and o.name in ('Spellbook', 'Spellbook_open', '1H_Wand', '2H_Staff', 'Mage_Hat', 'Icosphere'):
        bpy.data.objects.remove(o, do_unlink=True)
KEEP = {'Idle', 'Walking_A', 'Running_A', 'Running_B', 'Jump_Idle', 'Jump_Start', 'Sit_Chair_Idle', 'Sit_Floor_Idle', 'Cheer'}
for a in list(bpy.data.actions):
    if a.name not in KEEP: bpy.data.actions.remove(a)
arm = next(o for o in sc.objects if o.type == 'ARMATURE')
if arm.animation_data:
    arm.animation_data.action = None
    for t in list(arm.animation_data.nla_tracks): arm.animation_data.nla_tracks.remove(t)
for a in bpy.data.actions:   # 동작마다 NLA 띠로 — 내보낼 때 각각 클립이 된다
    a.use_fake_user = True
meshes = [o for o in sc.objects if o.type == 'MESH']
img = None
for o in meshes:
    for s in o.material_slots:
        if s.material and s.material.use_nodes:
            for n in s.material.node_tree.nodes:
                if n.type == 'TEX_IMAGE' and n.image: img = n.image
W, H = img.size
a = np.array(img.pixels[:], dtype=np.float32).reshape(H, W, 4)
rgb = a[..., :3]
mx = rgb.max(-1); mn = rgb.min(-1); d = mx - mn + 1e-6
r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
hue = np.where(mx == r, ((g - b) / d) % 6, np.where(mx == g, (b - r) / d + 2, (r - g) / d + 4)) * 60
sat = np.where(mx > 0, d / (mx + 1e-6), 0)
def paint(mask, base, lo, hi):
    v = mx[mask]; v = (v - v.min()) / (v.max() - v.min() + 1e-6) if v.size else v
    rgb[mask] = np.array(base, dtype=np.float32)[None, :] * (lo + (hi - lo) * v)[:, None]
# 머리(얼굴·눈·머리카락)가 쓰는 칸은 그대로 — 짙은 남색 눈이 겉옷 색 바꾸기에 걸려 하얘졌다
head = np.zeros((H, W), dtype=bool)
ho = next(o for o in meshes if o.name == 'Mage_Head'); hme = ho.data; huv = hme.uv_layers.active.data
hme.calc_loop_triangles()
for t in hme.loop_triangles:
    P = np.array([huv[li].uv[:] for li in t.loops]) * [W, H]
    x0, y0 = np.floor(P.min(0)).astype(int) - 1; x1, y1 = np.ceil(P.max(0)).astype(int) + 1
    x0, y0 = max(0, x0), max(0, y0); x1, y1 = min(W - 1, x1), min(H - 1, y1)
    if x1 < x0 or y1 < y0: continue
    xs, ys = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
    (ax, ay), (bx, by), (cx, cy) = P
    den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
    if abs(den) < 1e-9:
        head[y0:y1 + 1, x0:x1 + 1] |= True; continue
    l1 = ((by - cy) * (xs - cx) + (cx - bx) * (ys - cy)) / den; l2 = ((cy - ay) * (xs - cx) + (ax - cx) * (ys - cy)) / den
    head[y0:y1 + 1, x0:x1 + 1] |= (l1 >= -0.05) & (l2 >= -0.05) & (1 - l1 - l2 >= -0.05)
robe = (hue >= 215) & (hue <= 290) & (sat > 0.12) & ~head
cape = ((hue >= 300) | (hue <= 5)) & (sat > 0.45) & (mx > 0.35) & ~head
teal = (hue >= 165) & (hue < 215) & (sat > 0.25) & ~head
print('REPORT HEADPX', int(head.sum()), 'robe-in-head', int(((hue >= 215) & (hue <= 290) & (sat > 0.12) & head).sum()))
paint(robe, (1.0, 0.985, 0.95), 0.72, 1.0)
paint(cape, (1.0, 0.80, 0.36), 0.70, 1.0)
paint(teal, (1.0, 0.95, 0.84), 0.70, 0.95)
a[..., :3] = rgb
img.pixels[:] = a.ravel(); img.update()
img.scale(512, 512)
img.name = 'pilgrim'
bb = []
for o in meshes:
    if o.visible_get(): bb += [o.matrix_world @ Vector(c) for c in o.bound_box]
print('REPORT HEIGHT', round(max(c.z for c in bb) - min(c.z for c in bb), 3), 'minz', round(min(c.z for c in bb), 3))
dst = os.path.join(OUT, 'pilgrim.glb')
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_animation_mode='ACTIONS', export_image_format='JPEG',
                          export_jpeg_quality=90, export_optimize_animation_size=True, export_yup=True, export_apply=False)
print('REPORT SIZE', os.path.getsize(dst))
