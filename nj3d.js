/* ══════════════════════════════════════════════════════════════════════════
   새 예루살렘 3D 보기 (2026-09-29, 1차) — 설계: docs/새-예루살렘.md
   건축 창의 「🏛️ 3D로 보기」가 이 파일을 처음 누를 때만 불러온다(index.html에 싣지 않는다).
   three.js(r128)도 이때 CDN에서 받는다. 시안(claude.ai 비공개 페이지 nj3d)에서 폰으로 검증한 코드를 옮겼다.
   1차에 든 것: 성 터·풀밭·꽃·사방으로 흐르는 강·정금 바닥과 길·보좌, 기초석(njBuilt), 진주 문(njPearls), 문 경사로,
                내려다보기 / 걸어서 구경(흰 옷 입은 순례자, 점프, 보석으로 산 제트팩), 화질 기본/고급.
   한 세계(9/30): 성은 높은 산 위(산마루 PL=12, 높이 14), 네 강은 비탈을 따라 내려가고 남쪽 강은 골짜기를 지나 바다 어귀로.
                바다 2,000칸·해안 70 나라는 game.js의 _seaGeom·_seaWorld(서버 sea/world) 그대로. 「바다로/성으로」, openNJ3D({start:'sea'}).
   2차 이후(시안에 있음): 성곽 12켜와 이름 벽돌, 문 위 천사, 정금 성, 다른 순례자·인사.
   지킬 것: 창을 닫으면 루프를 멈추고 모든 자원을 버린다 · 만지지 않으면 초당 30번 · 고급에서 느리면 기본으로
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
    const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    const ORBIT_URL = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
    const GLTF_URL = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';   // 예물 모델(.glb) — 예물을 볼 때만 받는다
    const GIFT_V = '20261004';   // models/gifts/*.glb 캐시 번호 — 모델을 다시 뽑으면 올린다 (tools/blender/)
    const JET_COST = 300000;
    const T = (k, p) => (typeof t === 'function' ? t(k, p) : k);

    function loadScript(src) {
        return new Promise((res, rej) => {
            const s = document.createElement('script'); s.src = src; s.crossOrigin = 'anonymous';
            s.onload = () => res(); s.onerror = () => rej(new Error(src)); document.head.appendChild(s);
        });
    }
    async function ensureThree() {
        if (typeof THREE === 'undefined') await loadScript(THREE_URL);
        if (!THREE.OrbitControls) await loadScript(ORBIT_URL);
    }

    let cur = null;   // 열려 있는 보기 — 닫을 때 정리

    window.openNJ3D = async function (opts) {
        if (cur) return;
        const ov = document.createElement('div');
        ov.id = 'nj3d';
        ov.innerHTML = `
            <div class="nj3d-head">
                <b>${T('nj_title')}</b>
                <div class="nj3d-q" role="group"><button data-q="basic">${T('nj3d_q_basic')}</button><button data-q="high">${T('nj3d_q_high')}</button></div>
                <button class="nj3d-x" aria-label="close">✕</button>
            </div>
            <div class="nj3d-stage">
                <div class="nj3d-loading">${T('nj3d_loading')}</div>
                <button class="nj3d-mode"></button>
                <button class="nj3d-go"></button>
                <button class="nj3d-deco"></button>
                <button class="nj3d-holo" hidden></button>
                <div class="nj3d-decobar" hidden></div>
                <div class="nj3d-decopanel" hidden></div>
                <div class="nj3d-decopanel nj3d-mountpanel" hidden></div>
                <div class="nj3d-walk" hidden>
                    <div class="nj3d-joy"><div class="nj3d-knob"></div></div>
                    <div class="nj3d-btns">
                        <button class="nj3d-wb small nj3d-viewbtn"></button>
                        <button class="nj3d-wb small nj3d-jetbuy"></button>
                        <button class="nj3d-wb fly nj3d-fly" hidden>${T('nj3d_fly')}</button>
                        <button class="nj3d-wb small nj3d-fishbtn" hidden></button>
                        <button class="nj3d-wb small nj3d-clambtn" hidden></button>
                        <button class="nj3d-wb small nj3d-pearlbtn" hidden></button>
                        <button class="nj3d-wb small nj3d-talk" hidden></button>
                        <button class="nj3d-wb small nj3d-tackbtn" hidden>${T('nj3d_tack')}</button>
                        <button class="nj3d-wb small nj3d-ridebtn"></button>
                        <button class="nj3d-wb small nj3d-divebtn" hidden>${T('nj3d_dive')}</button>
                        <button class="nj3d-wb small nj3d-slidebtn" hidden>${T('nj3d_slide')}</button>
                        <button class="nj3d-wb nj3d-jump">${T('nj3d_jump')}</button>
                    </div>
                </div>
                <div class="nj3d-under" hidden></div>
                <div class="nj3d-speed" aria-hidden="true"></div>
                <div class="nj3d-hint"></div>
                <div class="nj3d-wallet"></div>
                <canvas class="nj3d-mini" hidden></canvas>
                <button class="nj3d-dexbtn" hidden></button>
                <div class="nj3d-fishq" hidden></div>
                <div class="nj3d-offer" hidden></div>
                <button class="nj3d-skip" hidden></button>
                <button class="nj3d-rate" hidden></button>
                <div class="nj3d-fruit" hidden></div>
            </div>`;
        document.body.appendChild(ov);
        const stageEl = ov.querySelector('.nj3d-stage'), loading = ov.querySelector('.nj3d-loading');
        const cleanups = [];
        cur = { ov, cleanups, running: false };
        ov.querySelector('.nj3d-x').onclick = () => closeNJ3D();
        try { await ensureThree(); } catch (e) { loading.textContent = T('nj3d_fail'); return; }
        if (!cur || cur.ov !== ov) return;   // 받는 사이에 닫았다
        build(ov, stageEl, loading, cleanups, opts || {});
    };

    window.closeNJ3D = function () {
        if (!cur) return;
        const c = cur; cur = null;
        c.running = false;
        c.cleanups.forEach(fn => { try { fn(); } catch (e) { } });
        c.ov.remove();
    };

    function build(ov, stageEl, loading, cleanups, opts) {
        const C = cur;
        const listen = (target, ev, fn, opt) => { target.addEventListener(ev, fn, opt); cleanups.push(() => target.removeEventListener(ev, fn, opt)); };
        const found = Math.max(0, Math.min(12, (typeof njBuilt !== 'undefined' ? njBuilt : 0) | 0));
        const pearls = Math.max(0, Math.min(12, (typeof njPearls !== 'undefined' ? njPearls : 0) | 0));
        const STONES = (typeof NJ_STONES !== 'undefined') ? NJ_STONES.map(s => s.color) : ['#00a0e9', '#1d2088', '#59c3e1', '#009651', '#eb6120', '#d7005b', '#fdd000', '#86cab6', '#e39300', '#6FBA2C', '#005dac', '#7f1084'];
        const SEQ = [['N', 1], ['N', 2], ['E', 0], ['E', 1], ['E', 2], ['S', 2], ['S', 1], ['S', 0], ['W', 2], ['W', 1], ['W', 0], ['N', 0]];
        const HALF = 6, BAND = 5.5, SEG = 4, GATE_GAP = 3, FH = 0.6, GATE = 1.15, GATE_H = 3.6, RAMP_L = 0.9, RAMP_W = 0.9;
        const onSide = (side, tt) => side === 'N' ? [tt, -BAND] : side === 'S' ? [tt, BAND] : side === 'W' ? [-BAND, tt] : [BAND, tt];
        const gatePos = (side, i) => onSide(side, (i - 1) * GATE_GAP);

        let HIGH = true, userPicked = false;
        try { const q = localStorage.getItem('kingsRoad_nj3dQ'); if (q) { HIGH = q === 'high'; userPicked = true; } } catch (e) { }
        const duals = [];
        const dual = (obj, basic, high) => { obj.material = HIGH ? high : basic; duals.push({ obj, basic, high }); return obj; };

        // ── 장면 ──
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, HIGH ? 2 : 1.5));
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
        renderer.shadowMap.enabled = HIGH; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        stageEl.insertBefore(renderer.domElement, stageEl.firstChild);
        cleanups.push(() => { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); });

        const scene = new THREE.Scene();
        cleanups.push(() => scene.traverse(o => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) [].concat(o.material).forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
        }));
        const grad = (stops) => { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; return tx; };
        // 하늘은 밤이 아니다 — 「거기에는 밤이 없음이라」(21:25) · 「주 하나님이 그들에게 비치심이라」(22:5).
        // 위로 갈수록 밝아지는 금빛 하늘(카메라를 따라다니는 둥근 지붕) + 성 위의 영광의 빛 + 천천히 떠오르는 빛 알갱이 (9/30, 별 하늘 대신)
        const HAZE = new THREE.Color(0xf0d49a).convertSRGBToLinear();   // 지평선의 금빛 안개 — 색은 보이는 그대로(sRGB→선형)
        scene.background = HAZE.clone(); scene.fog = new THREE.Fog(HAZE, 70, 240);   // 먼 땅은 빛 속으로 흐려진다
        // 반사 환경 — 밝은 금빛 하늘을 구워 둔다 (머리 위가 남색이면 금속이 어둠을 비춰 검게 보였다)
        const envTex = (() => {
            const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene();
            es.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ map: grad([[0, '#fff7e2'], [0.45, '#ffe3a6'], [0.55, '#d9c48f'], [1, '#3f8a57']]), side: THREE.BackSide })));
            const sunB = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); sunB.position.set(22, 34, 16); es.add(sunB);
            const tx = pm.fromScene(es, 0.02).texture; pm.dispose();
            es.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
            return tx;
        })();
        cleanups.push(() => envTex.dispose());
        scene.environment = HIGH ? envTex : null;

        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 420);
        camera.position.set(15, 14, 19);
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.5, 0); controls.enableDamping = true; controls.dampingFactor = 0.08;
        controls.minDistance = 4; controls.maxDistance = 110; controls.maxPolarAngle = 1.5; controls.enablePan = false;
        controls.autoRotate = true; controls.autoRotateSpeed = 0.55;
        cleanups.push(() => controls.dispose());
        const hint = ov.querySelector('.nj3d-hint');
        const showHint = (txt, ms) => { hint.textContent = txt; hint.style.opacity = '1'; if (ms) setTimeout(() => { hint.style.opacity = '0'; }, ms); };
        showHint(T('nj3d_hint_orbit'));
        controls.addEventListener('start', () => { controls.autoRotate = false; hint.style.opacity = '0'; });

        scene.add(new THREE.HemisphereLight(0xfff4d6, 0x2e6b45, 0.75));
        const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(10, 18, 8); scene.add(sun);
        sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0005;
        sun.shadow.autoUpdate = false; sun.shadow.needsUpdate = true;   // 🌗 굽는 그림자 (10/4) — 아래 loop에서 정한 때만 다시 굽는다. 매 프레임이 아니라서 2048로 올려도 가볍다
        Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
        const throneLight = new THREE.PointLight(0xffe7a8, 1.6, 16, 1.6); throneLight.position.set(0, 2, 0); scene.add(throneLight);

        // 물길 — 두 축을 따라 파여 있다 (9/29 — 평평한 강은 걸어도 강 같지 않았다)
        const RW = 0.55, RB = 0.95, RD = 0.12, WL = -0.05, IN_F = 4.9;   // 물길 바닥 반폭 · 둑 끝 · 깊이 · 수면 · 정금 바닥 끝
        // ══ 한 세계 (2026-09-30) — 성은 높은 산 위(21:10 「크고 높은 산으로 올라가 거룩한 성을 보이니」),
        //    네 강은 비탈을 따라 내려가고 남쪽 강은 골짜기를 지나 생명수의 바다로(겔 47). 바다는 서버 진행도(sea/world) 그대로 ══
        const PL = 12, DROP = 14, SLOPE = 26;                  // 산마루 반폭 · 산 높이 · 비탈 길이
        const SZ = 66, SRX = 24, SRZ = 23, SEA_Y = -14.15;    // 바다 가운데(남쪽 z) · 반지름 · 수면
        const SHORE = SZ - SRZ;                                // 강 어귀
        const seaE = (x, z) => (x / SRX) ** 2 + ((z - SZ) / SRZ) ** 2;
        const slopeH = d => { if (d <= PL) return 0; const q = Math.min(1, (d - PL) / SLOPE); return -DROP * q * q * (3 - 2 * q); };
        const SEA_DEEP = 7;   // 🌊 바다 가운데 깊이(10/2 사용자: 물속에 빠질 수 있게 · 잠수함이 다닐 만큼) — 전엔 수면 0.85 아래가 바닥이었다
        const seabed = (x, z) => { const e = seaE(x, z); return SEA_Y - 0.12 - SEA_DEEP * Math.pow(Math.max(0, 1 - e), 0.55) + Math.sin(x * 0.45) * Math.cos(z * 0.38) * 0.35 * (1 - e); };
        function WT(x, z) {   // 땅 높이(물길 파임 제외) — 바다 안은 바다 밑
            const h = slopeH(Math.max(Math.abs(x), Math.abs(z))), e = seaE(x, z);
            return e < 1 ? seabed(x, z) : h;
        }
        const stripDip = u => u >= RB ? 0 : u <= RW ? -RD : -RD * (RB - u) / (RB - RW);
        // 땅 격자 자리 — 가까운 곳은 촘촘히, 먼 곳은 성기게. 강둑도 이 자리에서 높이를 잰다(10/4 밤: 따로 재서 휜 비탈에서 맞닿는 가장자리가 어긋나 땅 밑이 비쳤다)
        const GRID_S = (() => { const xs = [RB]; for (let v = 1.5; v <= 20; v += 1) xs.push(v); for (let v = 22; v <= 60; v += 2) xs.push(v); for (let v = 65; v <= 150; v += 5) xs.push(v); return xs; })();
        {
            // 네 조각(물길 띠를 비움) — 가까운 곳은 촘촘히, 먼 곳은 성기게
            const xs = GRID_S;
            const gm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.DoubleSide });
            const cTop = new THREE.Color(0x2f9e58), cLow = new THREE.Color(0x3d8a48), cSand = new THREE.Color(0xc9b486), cDeep = new THREE.Color(0x1f5a5e), c = new THREE.Color();
            const n = xs.length;
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
                const pos = [], col = [], idx = [];
                xs.forEach(zv => xs.forEach(xv => {
                    const x = sx * xv, z = sz * zv, h = WT(x, z), e = seaE(x, z);
                    pos.push(x, e < 1 ? h - 0.3 : h, z);   // 바다 안은 촘촘한 바다 밑 그릇(아래)이 덮는다 — 성긴 땅 그물은 조금 아래로(겹쳐 깜빡이지 않게)
                    c.copy(cTop).lerp(cLow, Math.min(1, -h / DROP)); if (e < 1.5 && e > 0.75) c.lerp(cSand, 0.88 * Math.min(1, (1.5 - e) / 0.18));   // 🏖️ 물가는 모래사장(10/4 밤 — 0.55로 섞어 풀빛이 남았다)
                    if (e < 1) { const dd = Math.min(1, (SEA_Y - h) / SEA_DEEP); c.copy(cSand).lerp(cDeep, Math.pow(dd, 0.7)); }   // 바다 밑 — 모래에서 짙은 청록으로
                    c.convertSRGBToLinear();   // 꼭짓점 색은 선형으로 — 안 바꾸면 화면에서 허옇게 바래 연한 민트로 보였다(10/2 풀밭 손질)
                    col.push(c.r, c.g, c.b);
                }));
                for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) { const a = j * n + i; idx.push(a, a + n, a + 1, a + 1, a + n, a + n + 1); }
                const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
                g.setIndex(idx); g.computeVertexNormals();
                const m = new THREE.Mesh(g, gm); m.receiveShadow = true; scene.add(m);
            });
            // 산마루 밑 — 물길 틈으로 하늘이 비치지 않게
            const under = new THREE.Mesh(new THREE.PlaneGeometry(PL * 2, PL * 2), new THREE.MeshBasicMaterial({ color: 0x3a2e22 }));
            under.rotation.x = -Math.PI / 2; under.position.y = -RD - 0.03; scene.add(under);
        }

        /* 🔲 가까운 것만 그리기 (10/3 사용자: 폰에서 바닷가·물속이 끊긴다).
           재 보니 한 화면에 삼각형 27만 개 — 꽃 9.5만 · 해초 5만 · 물칸 5만 · 풀 3.4만 · 산호·바위 2만. 전부 온 세상에 흩어진 InstancedMesh라
           r128은 그 범위를 몰라(인스턴스 하나 크기로만 안다) frustumCulled = false로 **늘 통째로** 그리고 있었다 — 등 뒤·바다 건너편까지.
           → 칸(cell)으로 쪼개 칸마다 자기 범위(경계 구)를 주면 화면 밖 칸은 three가 알아서 건너뛰고, 순례자에게서 R 넘게 먼 칸은 끈다.
           순례자 크기에서 30 넘게 떨어진 꽃·해초는 한 점도 안 된다. */
        const nearSets = [];
        function chunkInstanced(src, cell, R, pad, parent) {
            const n = src.count, buckets = new Map(), m4 = new THREE.Matrix4(), p = new THREE.Vector3(), col = new THREE.Color();
            for (let i = 0; i < n; i++) {
                src.getMatrixAt(i, m4); p.setFromMatrixPosition(m4);
                const k = Math.floor(p.x / cell) + ',' + Math.floor(p.z / cell);
                if (!buckets.has(k)) buckets.set(k, []);
                buckets.get(k).push(i);
            }
            const parts = [];
            buckets.forEach(ids => {
                const g = src.geometry.clone(), m = new THREE.InstancedMesh(g, src.material, ids.length), box = new THREE.Box3();
                ids.forEach((i, j) => {
                    src.getMatrixAt(i, m4); m.setMatrixAt(j, m4); box.expandByPoint(p.setFromMatrixPosition(m4));
                    if (src.instanceColor) { src.getColorAt(i, col); m.setColorAt(j, col); }
                });
                g.boundingSphere = box.getBoundingSphere(new THREE.Sphere()); g.boundingSphere.radius += pad;   // 칸의 범위 = 인스턴스 자리들 + 가장 큰 인스턴스 크기
                m.castShadow = src.castShadow; m.receiveShadow = src.receiveShadow; m.renderOrder = src.renderOrder;
                m.frustumCulled = true; parent.add(m);
                parts.push({ mesh: m, x: g.boundingSphere.center.x, z: g.boundingSphere.center.z });
            });
            if (src.parent) src.parent.remove(src);
            src.dispose && src.dispose();
            nearSets.push({ parts, R2: R * R });
            return parts.map(q => q.mesh);
        }
        let nearAt = 0, shadowAt = 0, lastMove = 0, shadowGeos = -1, watchAt = 0; const lastCam = new THREE.Vector3();
        function nearTick(now, fx, fz) {   // 0.25초마다 — 순례자(또는 보는 곳)에서 먼 칸은 끈다
            if (now - nearAt < 250) return; nearAt = now;
            nearSets.forEach(S => S.parts.forEach(q => { const dx = q.x - fx, dz = q.z - fz; q.mesh.visible = dx * dx + dz * dz < S.R2; }));
        }
        {   // 🌸 들꽃 (10/2 사용자: 이모지 꽃이 너무 크다 → 순례자 발치에) — 꽃술을 그린 꽃잎 접시 + 줄기, 무리지어 핀다. 한 번에 그린다(InstancedMesh)
            // 🔧 10/4 잔렉: 노란 꽃술(작은 구 1,800개 = 삼각형 약 6.5만, 들꽃 전체의 2/3)을 빼고 꽃잎 한 장에 꽃술을 그려 넣는다 —
            //    가운데 노란 오각(꼭짓점 색) → 얇은 테에서 흰빛으로 → 다섯 꽃잎 끝(살짝 오목한 접시). 꽃 하나 삼각형 41 → 25
            //    (꼭짓점 하나만 노랗게 하면 노랑이 꽃잎 전체로 번져 꽃술이 안 보였다)
            const N = 1800, petals = (() => {
                const R0 = 0.038 * 1.15, Y = [1.55, 1.15, 0.28], P = [0, 0.0045, 0], C = Y.slice(), I = [];   // 꽃술은 1보다 밝게(꽃잎 색이 곱해져도 노랗게) · 가운데를 살짝 볼록하게
                const ring = (r, y, c) => { for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; P.push(Math.cos(a) * r, y, -Math.sin(a) * r); C.push(c[0], c[1], c[2]); } };
                ring(R0 * 0.28, 0.003, Y); ring(R0 * 0.38, 0.002, [1, 1, 1]); ring(R0, 0.006, [1, 1, 1]);   // 꽃술 · 테 · 꽃잎 끝
                for (let i = 0; i < 5; i++) { const j = (i + 1) % 5; I.push(0, 1 + i, 1 + j); [[1, 6], [6, 11]].forEach(([a, b]) => I.push(a + i, b + i, a + j, a + j, b + i, b + j)); }
                const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
            })();
            const head = new THREE.InstancedMesh(petals, new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x302820, side: THREE.DoubleSide, vertexColors: true }), N);   // 램버트 — 처음엔 꽃잎이 어둡게 나왔다
            const stem = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.003, 0.004, 1, 3), new THREE.MeshStandardMaterial({ color: 0x5f9a3e, roughness: 0.9 }), N);
            const COLS = [0xf4a6c0, 0xffffff, 0xf6d77a, 0xe57a9a, 0xb7a6f0, 0xff9a7a, 0x9ad0f5];
            let sd = 7; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), sc = new THREE.Vector3(), col = new THREE.Color();
            let n = 0;
            while (n < N) {   // 무리 하나 = 한 빛깔 꽃 6~18송이
                const a = r() * Math.PI * 2, d = 7.8 + Math.pow(r(), 0.8) * 26, cx = Math.cos(a) * d, cz = Math.sin(a) * d;
                if (Math.abs(cx) < 1.6 || Math.abs(cz) < 1.6) continue;
                const c0 = COLS[Math.floor(r() * COLS.length)], cnt = 6 + Math.floor(r() * 13);
                for (let k = 0; k < cnt && n < N; k++) {
                    const x = cx + (r() - 0.5) * 0.9, z = cz + (r() - 0.5) * 0.9;
                    if (Math.abs(x) < 1.3 || Math.abs(z) < 1.3 || (Math.abs(x) < 7.6 && Math.abs(z) < 7.6) || seaE(x, z) < 1.5) continue;   // 모래사장엔 꽃이 없다
                    const h = 0.04 + r() * 0.05, gy = WT(x, z), s2 = 0.8 + r() * 0.5;
                    e.set(0.55 + r() * 0.6, r() * 6.28, 0, 'YXZ'); q.setFromEuler(e);   // 꽃송이를 비스듬히 세운다 — 누워 있으면 낮은 시선에선 옆모습(회색 막대)만 보였다
                    v.set(x, gy + h, z); sc.set(s2, s2, s2); m4.compose(v, q, sc); head.setMatrixAt(n, m4);
                    v.set(x, gy + h / 2, z); sc.set(1, h, 1); m4.compose(v, new THREE.Quaternion(), sc); stem.setMatrixAt(n, m4);
                    col.setHex(c0).offsetHSL(0, 0, (r() - 0.5) * 0.08).convertSRGBToLinear(); head.setColorAt(n, col);   // 선형으로 — 안 바꾸면 바래 보인다
                    n++;
                }
            }
            [head, stem].forEach(m => { m.instanceMatrix.needsUpdate = true; scene.add(m); chunkInstanced(m, 4, 26, 0.3, scene); });   // 가까운 꽃만
        }
        // 보좌 — 빛
        const radial = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
            const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
            x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
        // 하늘 지붕 — 지평선은 옅은 금빛, 위로 갈수록 밝아져 꼭대기는 흰빛에 가깝다
        const skyDome = (() => {
            const g = new THREE.SphereGeometry(350, 32, 20), pos = g.attributes.position, col = [];
            const L = h => new THREE.Color(h).convertSRGBToLinear();
            const stops = [[0, L(0xf0d49a)], [0.22, L(0xf2c878)], [0.55, L(0xf7dca0)], [1, L(0xfdf0cf)]], c = new THREE.Color();
            for (let i = 0; i < pos.count; i++) {
                const t = Math.max(0, pos.getY(i) / 350);
                let k = 0; while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
                const [t0, c0] = stops[k], [t1, c1] = stops[k + 1];
                c.copy(c0).lerp(c1, Math.min(1, (t - t0) / (t1 - t0))); col.push(c.r, c.g, c.b);
            }
            g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
            const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false }));
            m.renderOrder = -1; scene.add(m); return m;
        })();
        // 성 위의 영광 — 21:11 「하나님의 영광이 있어 그 성의 빛이 지극히 귀한 보석 같고」. 바다에서 올려다보면 산 위 하늘이 빛난다
        {
            const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xffd98a, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false, opacity: 0.35, toneMapped: false }));
            glow.scale.set(170, 170, 1); glow.position.set(0, 95, 0); scene.add(glow);
            const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xfff4d8, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, fog: false, opacity: 0.45, toneMapped: false }));
            core.scale.set(46, 46, 1); core.position.set(0, 95, 0); scene.add(core);
        }
        // 떠오르는 빛 알갱이 — 카메라 둘레에서 천천히 올라가고, 꼭대기에 닿으면 아래에서 다시
        const GLINTS = 360, glintPos = new Float32Array(GLINTS * 3), glintSpd = new Float32Array(GLINTS);
        { let sd = 17; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
          for (let n = 0; n < GLINTS; n++) { glintPos[n * 3] = (r() - 0.5) * 80; glintPos[n * 3 + 1] = r() * 40 - 6; glintPos[n * 3 + 2] = (r() - 0.5) * 80; glintSpd[n] = 0.25 + r() * 0.6; } }
        const glintGeo = new THREE.BufferGeometry(); glintGeo.setAttribute('position', new THREE.BufferAttribute(glintPos, 3));
        const glints = new THREE.Points(glintGeo, new THREE.PointsMaterial({ size: 0.32, map: radial, color: 0xffcf5a, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: false }));
        scene.add(glints);
        // ── 거룩한 성 모델 (10/1 사용자: 꾸밈 아이템에 비해 성이 멋짐이 덜하다) — 보좌·진주 문은 블렌더 로우폴리(tools/blender/city.py → models/city/*.glb) ──
        const CITY_V = '20261004';
        const cityCache = {}, cityAnims = [];
        function loadCity(k) {
            if (!cityCache[k]) cityCache[k] = (async () => {
                if (!THREE.GLTFLoader) await loadScript(GLTF_URL);
                const gl = await new Promise((res, rej) => new THREE.GLTFLoader().load(`models/city/${k}.glb?v=${CITY_V}`, res, undefined, rej));
                gl.scene.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true;
                    const m = o.material; if (m.metalness > 0.5) { m.metalness = 0.45; m.roughness = 0.3; } if (m.emissive && m.emissive.getHex()) m.emissiveIntensity = 1.3;
                    else if (k === 'pearlgate') { m.roughness = 0.28; m.metalness = 0.12; } });   // 진줏빛은 꼭짓점 색으로 — 빛을 더하면 하얗게 날아갔다
                return gl.scene;
            })();
            cityCache[k].catch(() => { delete cityCache[k]; });
            return cityCache[k];
        }
        {   // 보좌 (4:2-6 · 22:1) — 세 단 위 흰 보좌, 녹보석 무지개가 천천히 돌고, 일곱 등불이 일렁인다. 못(수면 WL) 위에 선다
            const tg = new THREE.Group(); tg.position.y = -0.05; scene.add(tg);
            const old = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.45, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff1c9, emissiveIntensity: 0.8 }));
            old.position.y = 0.3; tg.add(old);
            loadCity('throne').then(sc => {
                if (cur !== C) return; tg.remove(old); const c = sc.clone(); tg.add(c);
                const rb = c.getObjectByName('rainbow'), lp = c.getObjectByName('lamps'), ms = [];
                if (lp) lp.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); ms.push(o.material); } });
                cityAnims.push(t => { if (rb) rb.rotation.y = t * 0.25; if (lp) lp.scale.y = 1 + Math.sin(t * 9) * 0.03; ms.forEach((m, i) => { m.emissiveIntensity = 1.2 + Math.sin(t * 8 + i) * 0.3; }); });
            }).catch(() => {});
            const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xfff0c8, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }));
            glow.material.opacity = 0.45; glow.scale.set(3, 3, 1); glow.position.y = 1.5; scene.add(glow);   // 보좌를 가리지 않게 옅게
        }
        // 생명수의 강 — 보좌에서 사방으로 (22:1)
        const riverCv = document.createElement('canvas'); riverCv.width = 32; riverCv.height = 128;
        { const rg = riverCv.getContext('2d'); rg.fillStyle = '#12b3cc'; rg.fillRect(0, 0, 32, 128); rg.fillStyle = 'rgba(220,250,255,0.75)'; rg.fillRect(7, 10, 2, 34); rg.fillRect(22, 60, 2, 26); rg.fillRect(14, 96, 2, 22); }
        const rivers = [];
        // 물길 띠 — +z 방향 s0~s1, 단면 us(가로)·hs(높이), 바닥 높이는 hf(s)를 따라간다(비탈을 내려간다). 물결 무늬는 바깥으로 흐르게 v = -s/3
        const ribbonGeo = (s0, s1, us, hs, step, hf, st) => {   // st = 높이를 잴 자리(땅 격자와 맞출 때)
            const n = us.length, ns0 = Math.max(1, Math.ceil((s1 - s0) / step)), pos = [], uv = [], idx = [];
            const SS = st ? [s0, ...st.filter(v => v > s0 + 1e-6 && v < s1 - 1e-6), s1] : Array.from({ length: ns0 + 1 }, (_, k) => s0 + (s1 - s0) * k / ns0), ns = SS.length - 1;
            SS.forEach(sv => { const b = hf(sv); us.forEach((u, i) => { pos.push(u, b + hs[i], sv); uv.push(i / (n - 1), -sv / 3); }); });
            for (let k = 0; k < ns; k++) for (let i = 0; i < n - 1; i++) { const a = k * n + i; idx.push(a, a + n, a + 1, a + 1, a + n, a + n + 1); }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
            g.setIndex(idx); g.computeVertexNormals(); return g;
        };
        const bankEarth = new THREE.MeshStandardMaterial({ color: 0x6b5238, roughness: 0.9, side: THREE.DoubleSide });
        const bankGold = new THREE.MeshStandardMaterial({ color: 0xc99a3a, metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide });
        const WW = 2 * (RW + (RB - RW) * (-WL) / RD);   // 수면이 둑 비탈과 만나는 폭
        const waterMat = (tex) => [new THREE.MeshStandardMaterial({ map: tex, emissive: 0x0a6f80, emissiveIntensity: 0.35, roughness: 0.25, metalness: 0.1, side: THREE.DoubleSide }),
            new THREE.MeshStandardMaterial({ map: tex, emissive: 0x0a6f80, emissiveIntensity: 0.2, roughness: 0.04, metalness: 0.5, envMapIntensity: 1.8, side: THREE.DoubleSide })];
        const TR_US = [-RB, -RW, RW, RB], TR_HS = [0, -RD, -RD, 0];
        // 남쪽(+z)은 바다 어귀까지, 나머지 셋은 비탈을 내려가 지평선까지
        [[0, SHORE + 0.8, sv => WT(0, sv)], [Math.PI, 150, slopeH], [Math.PI / 2, 150, slopeH], [-Math.PI / 2, 150, slopeH]].forEach(([a, end, hf]) => {
            const grp = new THREE.Group(); grp.rotation.y = a;
            const tex = new THREE.CanvasTexture(riverCv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.encoding = THREE.sRGBEncoding;
            const t1 = new THREE.Mesh(ribbonGeo(RB, IN_F, TR_US, TR_HS, 0.5, hf), bankGold), t2 = new THREE.Mesh(ribbonGeo(IN_F, end, TR_US, TR_HS, 1, hf, GRID_S), bankEarth);
            t1.receiveShadow = t2.receiveShadow = true; grp.add(t1); grp.add(t2);
            [-RB, RB].forEach(u => grp.add(new THREE.Mesh(ribbonGeo(IN_F, end, [u, u], [0, -0.6], 1, hf, GRID_S), bankEarth)));   // 둑 가장자리 흙벽 — 남은 틈으로 땅 밑이 비치지 않게
            const [wb, wh] = waterMat(tex);
            grp.add(dual(new THREE.Mesh(ribbonGeo(RB, end, [-WW / 2, WW / 2], [WL, WL], 1, hf)), wb, wh));
            scene.add(grp); rivers.push(tex);
        });
        {   // 어귀부터 남쪽 끝까지 — 물길 띠 자리를 땅으로 메운다(바다 밑 바닥 포함). 처음엔 바다 건너편만 메워 물칸 틈으로 빈 띠가 검은 줄처럼 보였다(9/30)
            const g = ribbonGeo(SHORE + 0.8, 150, [-RB, RB], [0, 0], 1, sv => WT(0, sv) - (seaE(0, sv) < 1 ? 0.35 : 0));   // 바다 안은 바다 밑 그릇 아래로(물속에서 밝은 띠로 보였다)
            scene.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x3d8a48, roughness: 0.95, side: THREE.DoubleSide })));
        }
        {   // 보좌 둘레 샘 — 네 물길이 만나는 네모 못
            const pool = new THREE.Mesh(new THREE.PlaneGeometry(RB * 2, RB * 2), bankGold); pool.rotation.x = -Math.PI / 2; pool.position.y = -RD; scene.add(pool);
            const tex = new THREE.CanvasTexture(riverCv); tex.encoding = THREE.sRGBEncoding;
            const [wb, wh] = waterMat(tex);
            const w = dual(new THREE.Mesh(new THREE.PlaneGeometry(RB * 2, RB * 2)), wb, wh); w.rotation.x = -Math.PI / 2; w.position.y = WL; scene.add(w);
        }
        // 정금 바닥과 길 (21:18, 21)
        {
            // 정금 바닥 — 물길을 비운 네 조각
            const fB = new THREE.MeshStandardMaterial({ color: 0xd9a93a, metalness: 0.6, roughness: 0.3, emissive: 0x4a3208, emissiveIntensity: 0.25 });
            const fH = new THREE.MeshPhysicalMaterial({ color: 0xe0b04a, metalness: 0.85, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.2, emissive: 0x5a3c0c, emissiveIntensity: 0.3 });
            const fs = IN_F - RB, fc = RB + fs / 2, fg = new THREE.PlaneGeometry(fs, fs);
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
                const q = dual(new THREE.Mesh(fg), fB, fH);
                q.rotation.x = -Math.PI / 2; q.position.set(sx * fc, 0.04, sz * fc); q.receiveShadow = true; scene.add(q);
            });
            const stB = new THREE.MeshStandardMaterial({ color: 0xfff1c4, metalness: 0.7, roughness: 0.15, emissive: 0x8a6a1c, emissiveIntensity: 0.4 });
            const stH = new THREE.MeshPhysicalMaterial({ color: 0xffe7a6, metalness: 0.85, roughness: 0.08, clearcoat: 1, envMapIntensity: 1.3, emissive: 0x7a5a18, emissiveIntensity: 0.35 });
            [-GATE_GAP, GATE_GAP].forEach(p => {
                const a = dual(new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.04, 9.8)), stB, stH); a.position.set(p, 0.07, 0); a.receiveShadow = true; scene.add(a);
                const b = dual(new THREE.Mesh(new THREE.BoxGeometry(9.8, 0.04, 0.55)), stB, stH); b.position.set(0, 0.07, p); b.receiveShadow = true; scene.add(b);
            });
        }
        // 터의 윤곽
        if (found === 0) {
            const outline = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-6, -6], [6, -6], [6, 6], [-6, 6]].map(([x, z]) => new THREE.Vector3(x, 0.05, z))),
                new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.5, gapSize: 0.35, transparent: true, opacity: 0.8 }));
            outline.computeLineDistances(); scene.add(outline);
        }

        // ── 기초석 · 진주 문 · 경사로 ──
        const built = new THREE.Group(); scene.add(built);
        function foundationGeom(i) {   // 북쪽 면 기준, 모서리는 45도로 잘라 이웃과 반씩
            const gap = 0.06, t0 = -HALF + i * SEG, t1 = t0 + SEG, OUT = HALF, IN = HALF - 1.05;
            const xo0 = i === 0 ? -OUT + gap : t0 + gap, xi0 = i === 0 ? -IN + gap * 2 : t0 + gap;
            const xo1 = i === 2 ? OUT - gap : t1 - gap, xi1 = i === 2 ? IN - gap * 2 : t1 - gap;
            const sh = new THREE.Shape(); sh.moveTo(xo0, OUT); sh.lineTo(xo1, OUT); sh.lineTo(xi1, IN); sh.lineTo(xi0, IN); sh.closePath();
            const g = new THREE.ExtrudeGeometry(sh, { depth: FH - 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.05, bevelSegments: 1 });   // 깎은 보석처럼 모서리를 깎는다
            g.translate(0, 0, 0.04); g.rotateX(-Math.PI / 2); return g;
        }
        // 벽옥 성벽 (21:18 「그 성곽은 벽옥으로 쌓였고」 · 21:11 「벽옥과 수정 같이 맑더라」) — 기초석 위 바깥쪽 띠. 문 자리는 비우고 모퉁이엔 망대
        const WALL_H = 2.4, WALL_T = 0.55, GATE_OPEN = 0.98, GATE_SC = 1.15;   // 21:12 「크고 높은 성곽」 — 처음 1.25·문 0.85배는 낮다(10/1 사용자)
        // ✨ 반짝임 — 보석이 숨 쉬듯 빛나고, 보석·성벽·진주 문 위로 별빛이 차례로 반짝인다(10/1 사용자: 보석 같긴 한데 빛나는 효과가 있어야)
        const STAR_TEX = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
            const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
            x.fillStyle = gr; x.fillRect(0, 0, 64, 64); x.fillStyle = 'rgba(255,255,255,0.95)';
            x.beginPath(); x.moveTo(32, 2); x.lineTo(35, 29); x.lineTo(62, 32); x.lineTo(35, 35); x.lineTo(32, 62); x.lineTo(29, 35); x.lineTo(2, 32); x.lineTo(29, 29); x.closePath(); x.fill();
            return new THREE.CanvasTexture(c); })();
        const sparkPts = [], gemMats = [], sparkles = [];
        cityAnims.push(t => {
            sparkles.forEach((pt, i) => { pt.material.opacity = Math.pow(Math.max(0, Math.sin(t * 1.9 + i * 1.57)), 5); pt.material.size = 0.38 + pt.material.opacity * 0.22; });
            gemMats.forEach((m, i) => { m.emissiveIntensity = 0.35 + 0.55 * Math.pow(Math.max(0, Math.sin(t * 1.2 + i * 0.83)), 3); });
        });
        function makeSparkles() {   // 반짝일 점을 넷으로 나눠 차례로 깜박인다
            for (let g = 0; g < 4; g++) {
                const pts = sparkPts.filter((_, n) => n % 4 === g); if (!pts.length) continue;
                const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3));
                const pm = new THREE.Points(geo, new THREE.PointsMaterial({ map: STAR_TEX, size: 0.45, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xfff6dc, toneMapped: false }));
                built.add(pm); sparkles.push(pm);
            }
        }
        // 수정처럼 맑은 벽옥 (21:11 「벽옥과 수정 같이 맑더라」, 10/1 사용자) — 처음엔 '碧玉' 글자대로 초록이었다. 성경의 벽옥은 맑게 빛나는 보석으로 본다.
        // 면마다 아주 옅은 하늘·분홍·연보라·상아를 칠해 빛을 받으면 프리즘처럼 비치고, 반투명이라 성 안이 어렴풋이 보인다
        const CRYSTAL = ['#f6fbff', '#e6f2ff', '#fbecf6', '#eef0ff', '#fff7e6', '#eafcf6'].map(c => new THREE.Color(c));
        function crystalGeo(g) {
          g = g.toNonIndexed(); const n = g.attributes.position.count, col = new Float32Array(n * 3);
          for (let i = 0; i < n; i += 3) { const c = CRYSTAL[Math.floor(Math.random() * CRYSTAL.length)]; for (let j = 0; j < 3; j++) { col[(i + j) * 3] = c.r; col[(i + j) * 3 + 1] = c.g; col[(i + j) * 3 + 2] = c.b; } }
          g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
        }
        const wallMat = () => HIGH
            ? new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.04, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.6, emissive: 0xbfe0ff, emissiveIntensity: 0.12, transparent: true, opacity: 0.82, flatShading: true })
            : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.08, metalness: 0.1, emissive: 0xbfe0ff, emissiveIntensity: 0.18, transparent: true, opacity: 0.85, flatShading: true });
        const rotXZ = (x, z, r) => [x * Math.cos(r) + z * Math.sin(r), -x * Math.sin(r) + z * Math.cos(r)];
        function wallPieces(idx) {   // 북쪽 면 기준 [x0, x1] 조각들 — 문 자리(가운데)와 모퉁이(망대 자리)를 비운다
            const t0 = -HALF + idx * SEG, t1 = t0 + SEG, g = (idx - 1) * GATE_GAP, x0 = idx === 0 ? -HALF + WALL_T : t0, x1 = idx === 2 ? HALF - WALL_T : t1;   // 모퉁이 한 칸(WALL_T)은 모퉁이 기둥이 메운다
            return [[x0, g - GATE_OPEN], [g + GATE_OPEN, x1]];
        }
        const SIDE_ROT = { N: [0, i => i], E: [-Math.PI / 2, i => i], S: [Math.PI, i => 2 - i], W: [Math.PI / 2, i => 2 - i] };
        // 🏰 완성된 모습 미리 보기 (10/1 사용자) — 아직 놓지 않은 기초석·성벽·진주 문을 홀로그램처럼 흐릿하게. 부딪히지 않고 반짝이지 않는다
        let preview = false;
        const holoFill = new THREE.MeshBasicMaterial({ color: 0x2fa8d8, transparent: true, opacity: 0.07, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, toneMapped: false });
        const holoLine = new THREE.LineBasicMaterial({ color: 0x7fdcff, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false });
        cityAnims.push(t => { const f = 0.75 + 0.25 * Math.sin(t * 2.2) + (Math.random() < 0.02 ? -0.35 : 0); holoFill.opacity = 0.07 * f; holoLine.opacity = 0.4 * f; });   // 깜박이는 빛 — 겹치면 더해져 하얗게 날아가 아주 옅게
        function holoize(o) {   // 실제 재질을 홀로그램으로 — 면은 옅게, 모서리는 빛나는 선
            const ms = []; o.traverse(m => { if (m.isMesh) ms.push(m); });
            ms.forEach(m => { m.material = holoFill; m.castShadow = m.receiveShadow = false;
                if (!m.isInstancedMesh && m.geometry) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 40), holoLine); m.add(e); } });
        }
        function rebuild() {
            built.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
            while (built.children.length) built.remove(built.children[0]);
            sparkPts.length = 0; gemMats.length = 0; sparkles.length = 0;
            BOXES.length = 0; BOXES.push(THRONE_BOX, ...TREE_BOXES);
            SEQ.forEach(([side, i], k) => {
                const [cx, cz] = gatePos(side, i), horiz = side === 'N' || side === 'S';
                const stoneReal = k < found, gateReal = k < pearls;
                const c0 = built.children.length, b0 = BOXES.length, s0 = sparkPts.length;
                const unholo = () => {   // 홀로그램 조각 — 재질 바꾸고, 부딪힘·반짝임은 되돌린다
                    built.children.slice(c0).forEach(o => { o.userData.holo = true; holoize(o); });
                    BOXES.length = b0; sparkPts.length = s0;
                };
                if (stoneReal || preview) {
                    const col = new THREE.Color(STONES[k]);
                    const mat = HIGH
                        ? new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.1, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.08, envMapIntensity: 0.9, emissive: col, emissiveIntensity: 0.12 })
                        : new THREE.MeshStandardMaterial({ color: col, roughness: 0.08, metalness: 0.3, emissive: col, emissiveIntensity: 0.05 });
                    const [rot, idx] = SIDE_ROT[side];
                    mat.flatShading = true;
                    const stone = new THREE.Mesh(foundationGeom(idx(i)), mat);
                    stone.rotation.y = rot; stone.castShadow = stone.receiveShadow = true; built.add(stone);
                    {   // 바깥 면에 박힌 보석 — 같은 빛깔로 깎은 보석이 줄지어
                        const t0 = -HALF + idx(i) * SEG, gm = new THREE.MeshStandardMaterial({ color: col.clone().offsetHSL(0, 0.05, 0.12), roughness: 0.05, metalness: 0.3, emissive: col, emissiveIntensity: 0.35, flatShading: true });
                        const xs = []; for (let x = t0 + 0.35; x < t0 + SEG - 0.2; x += 0.55) { const gx = (idx(i) - 1) * GATE_GAP; if (Math.abs(x - gx) > 0.5) xs.push(x); }
                        const gem = new THREE.InstancedMesh(new THREE.OctahedronGeometry(0.11, 0), gm, xs.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1.35, 0.55);
                        xs.forEach((x, n) => { const [wx, wz] = rotXZ(x, -HALF - 0.01, rot); m4.compose(new THREE.Vector3(wx, FH * 0.5, wz), q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), sc); gem.setMatrixAt(n, m4);
                            const [sx, sz] = rotXZ(x, -HALF - 0.12, rot); sparkPts.push([sx, FH * 0.5 + 0.05, sz]); });
                        built.add(gem); gemMats.push(gm, mat);   // 박힌 보석과 기초석 판이 함께 숨 쉬듯
                        for (let n = 0; n < 5; n++) { const [sx, sz] = rotXZ(t0 + 0.3 + Math.random() * (SEG - 0.6), -HALF - 0.6 + Math.random() * 0.5, rot); sparkPts.push([sx, FH + 0.02, sz]); }   // 기초석 윗면
                    }
                    {   // 성벽 — 기초석 위 바깥 띠, 위에 성가퀴
                        const wm = wallMat(), mer = [];
                        wallPieces(idx(i)).forEach(([a0, a1]) => {
                            const L = a1 - a0; if (L <= 0.05) return;
                            const w = new THREE.Mesh(crystalGeo(new THREE.BoxGeometry(L, WALL_H, WALL_T)), wm), [wx, wz] = rotXZ((a0 + a1) / 2, -HALF + WALL_T / 2, rot);
                            w.position.set(wx, FH + WALL_H / 2, wz); w.rotation.y = rot; w.castShadow = w.receiveShadow = true; built.add(w);
                            const c1 = rotXZ(a0, -HALF, rot), c2 = rotXZ(a1, -HALF + WALL_T, rot);
                            BOXES.push({ x0: Math.min(c1[0], c2[0]), x1: Math.max(c1[0], c2[0]), z0: Math.min(c1[1], c2[1]), z1: Math.max(c1[1], c2[1]), y0: FH, y1: FH + WALL_H });
                            for (let x = a0 + 0.15; x < a1 - 0.1; x += 0.42) mer.push(x);
                            for (let n = 0; n < Math.round(L * 1.2); n++) { const [sx, sz] = rotXZ(a0 + Math.random() * L, -HALF - 0.04, rot); sparkPts.push([sx, FH + 0.3 + Math.random() * (WALL_H - 0.4), sz]); }   // 벽옥 성벽 겉면
                        });
                        const mg = new THREE.InstancedMesh(crystalGeo(new THREE.BoxGeometry(0.24, 0.22, WALL_T + 0.04)), wm, mer.length), m4 = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), one = new THREE.Vector3(1, 1, 1);
                        mer.forEach((x, n) => { const [wx, wz] = rotXZ(x, -HALF + WALL_T / 2, rot); m4.compose(new THREE.Vector3(wx, FH + WALL_H + 0.11, wz), q, one); mg.setMatrixAt(n, m4); });
                        mg.castShadow = true; built.add(mg);
                        [0, 2].forEach(end => {   // 모퉁이 — 두 면의 성벽이 맞물리는 네모 기둥(성벽과 같은 높이·성가퀴 하나). 망대는 뺐다(10/1 사용자 — 21장에 없고, 문을 닫지 않는 성 21:25)
                            if (idx(i) !== end) return;
                            const [tx, tz] = rotXZ(end === 0 ? -HALF + WALL_T / 2 : HALF - WALL_T / 2, -HALF + WALL_T / 2, rot);
                            if (built.children.some(o => o.userData.corner && Math.hypot(o.position.x - tx, o.position.z - tz) < 0.1)) return;
                            const cn = new THREE.Mesh(crystalGeo(new THREE.BoxGeometry(WALL_T, WALL_H, WALL_T)), wm); cn.userData.corner = true; cn.position.set(tx, FH + WALL_H / 2, tz); cn.castShadow = true; built.add(cn);
                            const cm = new THREE.Mesh(crystalGeo(new THREE.BoxGeometry(WALL_T + 0.04, 0.22, WALL_T + 0.04)), wm); cm.position.y = WALL_H / 2 + 0.11; cn.add(cm);
                            BOXES.push({ x0: tx - WALL_T / 2, x1: tx + WALL_T / 2, z0: tz - WALL_T / 2, z1: tz + WALL_T / 2, y0: FH, y1: FH + WALL_H });
                        });
                    }
                    // 문 안팎의 경사로 — 기초석 단(0.6)은 순례자 키(0.22)보다 훨씬 높다
                    const n = side === 'N' ? [0, -1] : side === 'S' ? [0, 1] : side === 'E' ? [1, 0] : [-1, 0];
                    const along = horiz ? [1, 0] : [0, 1], tg = (i - 1) * GATE_GAP;
                    const rm = new THREE.MeshStandardMaterial({ color: 0xf2ead8, roughness: 0.5, metalness: 0.1, side: THREE.DoubleSide });   // 경사로 — 보좌 단과 같은 흰 대리석
                    [[n, HALF], [[-n[0], -n[1]], HALF - 1.05]].forEach(([X, d]) => {
                        const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(RAMP_L, 0); sh.lineTo(0, FH); sh.closePath();
                        const geo = new THREE.ExtrudeGeometry(sh, { depth: RAMP_W, bevelEnabled: false });
                        const Z = [-X[1], X[0]];
                        const ex = n[0] * d + along[0] * tg, ez = n[1] * d + along[1] * tg;
                        const mesh = new THREE.Mesh(geo, rm); mesh.matrixAutoUpdate = false;
                        mesh.matrix.makeBasis(new THREE.Vector3(X[0], 0, X[1]), new THREE.Vector3(0, 1, 0), new THREE.Vector3(Z[0], 0, Z[1]));
                        mesh.matrix.setPosition(ex - Z[0] * RAMP_W / 2, 0, ez - Z[1] * RAMP_W / 2);
                        mesh.receiveShadow = true; built.add(mesh);
                    });
                    if (!stoneReal) unholo();
                }
                // 진주 문 — 얻은 진주만큼 온전한 문이 선다. 아직이면 아무것도 없다(통로는 처음부터 열려 있다). 기둥과 아치는 부딪힌다
                if (!gateReal && !preview) return;
                const g0 = built.children.length, gb0 = BOXES.length, gs0 = sparkPts.length;
                const gm = HIGH ? new THREE.MeshPhysicalMaterial({ color: 0xfdfbff, roughness: 0.12, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.8, emissive: 0xd8cff5, emissiveIntensity: 0.22 })
                    : new THREE.MeshStandardMaterial({ color: 0xfbf8ff, roughness: 0.1, metalness: 0.25, emissive: 0xcfc6f0, emissiveIntensity: 0.3 });
                const base = (stoneReal || preview) ? FH : 0.02, R = GATE / 2, Tk = 0.14, postH = GATE_H - R;
                const gate = new THREE.Group();
                const PC = 0.635 * GATE_SC, PT = 0.2 * GATE_SC, ARCH0 = 3.74, ARCH1 = 4.2;   // 부딪힘 — 진주 문 모델(city.py, ×GATE_SC)의 기둥 가운데·두께·아치 안쪽/바깥 높이
                [-1, 1].forEach(sg => {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(Tk, Tk, postH, 12), gm); post.position.set(sg * R, postH / 2, 0); post.castShadow = true; gate.add(post);
                    const px = horiz ? cx + sg * PC : cx, pz = horiz ? cz : cz + sg * PC;
                    BOXES.push({ x0: px - PT, x1: px + PT, z0: pz - PT, z1: pz + PT, y0: base, y1: base + ARCH0 });
                });
                const arch = new THREE.Mesh(new THREE.TorusGeometry(R, Tk, 12, 36, Math.PI), gm); arch.position.set(0, postH, 0); gate.add(arch);
                const plain = gate.children.slice();
                loadCity('pearlgate').then(sc => {
                    if (cur !== C || gate.parent !== built) return;
                    plain.forEach(o => gate.remove(o)); const c = sc.clone(); c.scale.setScalar(GATE_SC); gate.add(c);   // 높은 성벽보다 높게
                    if (gate.userData.holo) holoize(c);
                    const wl = c.getObjectByName('wingL'), wr = c.getObjectByName('wingR'), ph = k * 0.7;
                    cityAnims.push(t => { const f = Math.sin(t * 1.4 + ph) * 0.12; if (wl) wl.rotation.y = f; if (wr) wr.rotation.y = -f; });
                }).catch(() => {});
                const aw = PC + PT;   // 아치 — 제트팩으로 날다 부딪히거나 위에 설 수 있게 대략 상자 하나(안쪽 꼭대기 ~ 바깥)
                BOXES.push(horiz ? { x0: cx - aw, x1: cx + aw, z0: cz - PT, z1: cz + PT, y0: base + ARCH0, y1: base + ARCH1 }
                                 : { x0: cx - PT, x1: cx + PT, z0: cz - aw, z1: cz + aw, y0: base + ARCH0, y1: base + ARCH1 });
                gate.position.set(cx, base, cz); if (!horiz) gate.rotation.y = Math.PI / 2; built.add(gate);
                [[-0.72, 1.2], [0.72, 2.2], [-0.72, 3.1], [0.0, 4.6], [0.6, 3.9]].forEach(([a, h]) => sparkPts.push([cx + (horiz ? a : 0) * GATE_SC, base + h * GATE_SC, cz + (horiz ? 0 : a) * GATE_SC]));
                if (!gateReal) { built.children.slice(g0).forEach(o => { o.userData.holo = true; holoize(o); }); BOXES.length = gb0; sparkPts.length = gs0; }
            });
            makeSparkles();
        }
        // 부딪히는 상자 — 보좌(오르지 못한다) + rebuild가 넣는 진주 문 기둥·아치
        const THRONE_BOX = { x0: -0.85, x1: 0.85, z0: -0.85, z1: 0.85, y0: 0, y1: 60 };
        const BOXES = [THRONE_BOX];

        // ── 생명나무와 열매 (22:2) — 나무 자리는 game.js의 _njTreeSpots, 열매는 _njFruitList ──
        const TREE_SPOTS = (typeof _njTreeSpots === 'function') ? _njTreeSpots() : [];
        const TREE_BOXES = TREE_SPOTS.map(([x, z]) => ({ x0: x - 0.11, x1: x + 0.11, z0: z - 0.11, z1: z + 0.11, y0: 0, y1: 0.85 }));
        const CANOPY_Y = 1.05, CANOPY_R = 0.5;
        {
            const trunkG = new THREE.CylinderGeometry(0.07, 0.1, 0.84, 8), trunkM = new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.9 });
            const leafG = new THREE.IcosahedronGeometry(1, 1), leafM = new THREE.MeshStandardMaterial({ color: 0x2f8f4e, roughness: 0.8, flatShading: true });
            TREE_SPOTS.forEach(([x, z]) => {
                const tr = new THREE.Mesh(trunkG, trunkM); tr.position.set(x, 0.46, z); tr.castShadow = true; scene.add(tr);
                [[0, 0, 0, CANOPY_R], [0.24, -0.12, 0.1, 0.34], [-0.22, -0.1, -0.12, 0.32], [0.05, 0.26, 0, 0.33]].forEach(([dx, dy, dz, r]) => {
                    const c = new THREE.Mesh(leafG, leafM); c.scale.setScalar(r); c.position.set(x + dx, CANOPY_Y + dy, z + dz);
                    c.castShadow = true; c.receiveShadow = true; scene.add(c);
                });
            });
        }
        // 한 그루에 34자리 — 수관 둘레에 고르게(황금각 나선). 34 × 12 = 408 ≥ 404절
        const SLOTS = [];
        for (let i = 0; i < 34; i++) {
            const y = 0.9 - (i + 0.5) / 34 * 1.45, rr = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.39996;
            const R = CANOPY_R + 0.14;   // 곁가지 잎 덩이(중심에서 0.63까지)보다 바깥 — 안에 묻혀 안 보였다(9/30)
            SLOTS.push([Math.cos(a) * rr * R, y * R, Math.sin(a) * rr * R]);
        }
        const KINDS = (typeof NJ_FRUIT_KINDS !== 'undefined') ? NJ_FRUIT_KINDS : [];
        const fruitList = (TREE_SPOTS.length && typeof _njFruitList === 'function') ? _njFruitList() : [];
        const fruitPos = [];
        const fruitMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 12, 8), new THREE.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05 }), Math.max(1, fruitList.length));
        {
            const m4 = new THREE.Matrix4(), col = new THREE.Color(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), v = new THREE.Vector3();
            fruitList.forEach((f, i) => {
                const [tx, tz] = TREE_SPOTS[i % 12], [ox, oy, oz] = SLOTS[Math.floor(i / 12) % 34];
                v.set(tx + ox, CANOPY_Y + oy, tz + oz); fruitPos.push(v.clone());
                sc.setScalar(f.ripe ? 1 : 0.8); m4.compose(v, q, sc); fruitMesh.setMatrixAt(i, m4);
                col.set(f.ripe ? ((KINDS[f.kind] || {}).color || '#d0383a') : '#e4f28a'); fruitMesh.setColorAt(i, col);   // 익는 중 — 잎(진초록)과 다른 연노랑
            });
            fruitMesh.count = fruitList.length;
            fruitMesh.castShadow = true;
            if (fruitList.length) scene.add(fruitMesh);
            else { fruitMesh.geometry.dispose(); fruitMesh.material.dispose(); }
        }
        const ripeN = fruitList.filter(f => f.ripe).length;
        if (ripeN) showHint(T('nj_fruit_hint', { n: ripeN }), 5000);
        // 🎁 나눔 열매(10/4) — 받은 금빛 열매(아직 안 먹은 것, 많아야 3)를 앞쪽 나무들 수관 바로 아래에 크게, 은은히 빛나며 살랑
        const giftList = (TREE_SPOTS.length && typeof njGiftFruits !== 'undefined' && Array.isArray(njGiftFruits)) ? njGiftFruits.filter(f => f && !f.done).slice(0, 6) : [];
        const giftPos = [], giftObjs = [];
        if (giftList.length) {
            const gG = new THREE.SphereGeometry(0.1, 18, 12), gM = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xd9971a).convertSRGBToLinear(), emissive: new THREE.Color(0x6a3c00).convertSRGBToLinear(), emissiveIntensity: 0.45, roughness: 0.3, metalness: 0.45 });   // 짙은 금빛 — 밝은 성 안에서 크림색으로 바래 보였다
            const leafM2 = new THREE.MeshStandardMaterial({ color: 0x3f9b4b, roughness: 0.6, side: THREE.DoubleSide });
            giftList.forEach((f, i) => {
                const [tx, tz] = TREE_SPOTS[i % TREE_SPOTS.length], a = 0.6 + i * 2.1;
                // 수관 아래·바깥으로 — 처음엔 수관 속(0.66 높이)이라 잎 덩이에 묻혀 반쯤만 보였다(10/4 스크린샷)
                const g = new THREE.Group(); g.position.set(tx + Math.cos(a) * 0.5, CANOPY_Y - CANOPY_R - 0.1, tz + Math.sin(a) * 0.5);
                const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.22, 4), leafM2); stem.position.y = 0.16; g.add(stem);   // 가지에서 늘어진 꼭지
                const orb = new THREE.Mesh(gG, gM); orb.castShadow = true; g.add(orb);
                const lf = new THREE.Mesh(new THREE.CircleGeometry(0.05, 6), leafM2); lf.position.set(0.03, 0.1, 0); lf.rotation.set(0.4, 0, 0.6); g.add(lf);
                const ripe = !!(f.ripe && Date.now() >= f.ripe); orb.scale.setScalar(ripe ? 1.15 : 0.9);
                scene.add(g); giftObjs.push({ g, ph: i * 1.7, ripe, a }); giftPos.push(g.position);
            });
            cityAnims.push(t => giftObjs.forEach(o => { o.g.rotation.z = Math.sin(t * 1.3 + o.ph) * 0.12; if (o.ripe) o.g.children[0].material.emissiveIntensity = 0.45 + Math.sin(t * 3) * 0.25; }));
        }
        // 🍎 함께 정착한 사람 — 인도자의 빨간 열매(2026-10-01). 달마다 바뀌는 열매와 따로, 수관 바깥에 조금 크고 윤기 나게.
        //    2D는 나무마다 3개까지지만 3D는 나무마다 12개(모두 144)까지 — 그 이상은 수만 늘어난다(건축 창 「🍎 n」)
        {
            const redN = Math.min(144, (typeof guideInfo !== 'undefined' && guideInfo && guideInfo.grads) || 0);
            if (redN && TREE_SPOTS.length) {
                const red = new THREE.InstancedMesh(new THREE.SphereGeometry(0.085, 14, 10),
                    new THREE.MeshStandardMaterial({ color: 0xd8121f, emissive: 0x5a0008, emissiveIntensity: 0.35, roughness: 0.22, metalness: 0.1 }), redN);
                const m4 = new THREE.Matrix4(), v = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), R = CANOPY_R + 0.1;
                for (let i = 0; i < redN; i++) {
                    const [tx, tz] = TREE_SPOTS[i % 12], k = Math.floor(i / 12);
                    const y = 0.55 - (k + 0.5) / 12 * 1.1, rr = Math.sqrt(Math.max(0, 1 - y * y)), ang = k * 2.39996 + 1.2 + (i % 12) * 0.7;   // 나무마다 자리를 조금씩 돌려 똑같아 보이지 않게
                    v.set(tx + Math.cos(ang) * rr * R, CANOPY_Y + y * R, tz + Math.sin(ang) * rr * R);
                    m4.compose(v, q, sc); red.setMatrixAt(i, m4);
                }
                red.castShadow = true; scene.add(red);
            }
        }

        // ── 생명수의 바다와 만국 (겔 47 · 창 10 · 계 22:2) — 지도 바다와 같은 칸·같은 순서(game.js _seaGeom), 서버 진행도 그대로 ──
        const seaGrp = new THREE.Group(); scene.add(seaGrp);
        const SG = (typeof _seaGeom === 'function') ? _seaGeom() : { water: [], salt: [] };
        const toW = (x, y) => [(x - 440) / 330 * SRX, SZ + (y - 470) / 320 * SRZ];
        const HRW = 7.75 / 330 * SRX;
        {
            // 바다 밑 그릇 — 극좌표 그물(고리 28 × 72), 모래에서 짙은 청록으로. 옛 짙은 바닥판(수면 0.6 아래)은 물속에서 천장처럼 막아 뺐다
            const RN = 28, AN = 72, pos = [], col = [], idx = [], cS = new THREE.Color(0xc9b486), cD = new THREE.Color(0x1f5a5e), cc = new THREE.Color();
            for (let i = 0; i <= RN; i++) for (let j = 0; j < AN; j++) {
                const q = i / RN * 1.01, a = j / AN * Math.PI * 2, x = Math.cos(a) * q * SRX, z = SZ + Math.sin(a) * q * SRZ, y = Math.min(SEA_Y - 0.12, seabed(x, z));
                pos.push(x, y, z); cc.copy(cS).lerp(cD, Math.pow(Math.min(1, (SEA_Y - y) / SEA_DEEP), 0.7)).convertSRGBToLinear(); col.push(cc.r, cc.g, cc.b);
            }
            for (let i = 0; i < RN; i++) for (let j = 0; j < AN; j++) { const a = i * AN + j, b2 = i * AN + (j + 1) % AN, c2 = a + AN, d2 = b2 + AN; idx.push(a, b2, c2, b2, d2, c2); }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
            const bed = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.DoubleSide })); bed.receiveShadow = true; seaGrp.add(bed);
        }
        // 수면 (9/30) — 칸 위에 얇게 비치는 물결 한 장. 사용자: "바다 칸이 메마른 땅 같다" — 칸만 있으면 타일 바닥처럼 보였다.
        // 반투명이라 아래 칸 색(맑아진 정도)은 그대로 보이고, 물결 무늬가 천천히 흐른다
        const seaTex = (() => {
            const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');
            g.fillStyle = '#3aa7c4'; g.fillRect(0, 0, 128, 128);
            g.strokeStyle = 'rgba(225,250,255,0.55)'; g.lineCap = 'round';
            for (let i = 0; i < 26; i++) {   // 짧은 물결 줄 — 이음매 없이 되풀이되도록 가장자리를 넘으면 반대편에도
                const x = Math.random() * 128, y = Math.random() * 128, w = 8 + Math.random() * 14; g.lineWidth = 1 + Math.random() * 1.5;
                [[0, 0], [-128, 0], [0, -128], [-128, -128]].forEach(([ox, oy]) => { g.beginPath(); g.moveTo(x + ox, y + oy); g.quadraticCurveTo(x + ox + w / 2, y + oy - 2.5, x + ox + w, y + oy); g.stroke(); });
            }
            const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 9); t.encoding = THREE.sRGBEncoding; return t;
        })();
        {
            const sf = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshStandardMaterial({ map: seaTex, color: 0xffffff, transparent: true, opacity: 0.5, roughness: 0.12, metalness: 0.2, depthWrite: false }));
            sf.rotation.x = -Math.PI / 2; sf.scale.set(SRX * 1.02, SRZ * 1.02, 1); sf.position.set(0, SEA_Y + 0.006, SZ); sf.renderOrder = 1; seaGrp.add(sf);
        }
        const cellN = SG.water.length + SG.salt.length;
        // 물칸 — 납작한 육각 판 (10/3: 두께 0.14 기둥이던 것. 위에선 똑같이 보이고 삼각형은 24 → 6 · 물칸 2,051개라 4.9만 → 1.2만)
        const tileG = new THREE.CircleGeometry(HRW * 0.985, 6); tileG.rotateZ(Math.PI / 2); tileG.rotateX(-Math.PI / 2);   // 기둥과 같은 방향의 육각(꼭짓점이 ±z)
        const tiles = new THREE.InstancedMesh(tileG, new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.15, side: THREE.DoubleSide }), Math.max(1, cellN));
        {
            const m4 = new THREE.Matrix4();
            [...SG.water, ...SG.salt].forEach((c, i) => { const [X, Z] = toW(c.x, c.y); m4.makeTranslation(X, SEA_Y - 0.002, Z); tiles.setMatrixAt(i, m4); });
            tiles.count = cellN; seaGrp.add(tiles);
        }

        // 🐠 바다 밑 풍경 (10/2) — 바위 · 흔들리는 해초 · 산호 · 물고기 떼. 한 번에 그린다(InstancedMesh). 물고기는 물속을 볼 때만 움직인다
        const reefT = { value: 0 }, fishSchools = [];
        const reefG = new THREE.Group(); seaGrp.add(reefG);   // 바위·해초·산호 — 위에서는 물칸에 가려 안 보이는데 그리고 있었다(10/4 밤: 바다로 활강하면 무거워진다). 카메라가 물속·수면 가까이일 때만
        let fishMesh = null;
        {
            let sd = 41; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
            const inSea = (q) => { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * q; return [Math.cos(a) * d * SRX, SZ + Math.sin(a) * d * SRZ]; };
            const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
            // 바위
            const RK = 220, rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.22, 0), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, flatShading: true }), RK);
            for (let i = 0; i < RK; i++) { const [x, z] = inSea(0.97), s2 = 0.4 + r() * 1.6; e.set(r() * 3, r() * 3, r() * 3); qq.setFromEuler(e);
                v.set(x, seabed(x, z) + 0.05 * s2, z); sc.set(s2, s2 * (0.5 + r() * 0.5), s2 * (0.7 + r() * 0.6)); m4.compose(v, qq, sc); rocks.setMatrixAt(i, m4);
                col.setHSL(0.08 + r() * 0.06, 0.15 + r() * 0.15, 0.3 + r() * 0.2).convertSRGBToLinear(); rocks.setColorAt(i, col); }
            reefG.add(rocks); chunkInstanced(rocks, 6, 30, 1, reefG);
            // 해초 — 끝으로 갈수록 가늘고, 물결 따라 흔들린다(꼭짓점을 시간으로 흔드는 셰이더)
            const SW = 900, weedG = new THREE.CylinderGeometry(0.004, 0.022, 1, 4, 6); weedG.translate(0, 0.5, 0);
            const weedM = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
            weedM.onBeforeCompile = sh => { sh.uniforms.uT = reefT;
                sh.vertexShader = 'uniform float uT;\n' + sh.vertexShader.replace('#include <begin_vertex>',
                    '#include <begin_vertex>\n float ph = instanceMatrix[3].x * 1.7 + instanceMatrix[3].z * 1.3;\n transformed.x += sin(uT * 1.3 + ph) * 0.18 * position.y * position.y;\n transformed.z += cos(uT * 1.1 + ph) * 0.12 * position.y * position.y;'); };
            const weed = new THREE.InstancedMesh(weedG, weedM, SW);
            let n = 0;
            while (n < SW) {   // 해초 숲 — 한 곳에 6~20가닥
                const [cx, cz] = inSea(0.92), cnt = 6 + Math.floor(r() * 15), hue = 0.25 + r() * 0.12;
                for (let k = 0; k < cnt && n < SW; k++) { const x = cx + (r() - 0.5) * 1.4, z = cz + (r() - 0.5) * 1.4; if (seaE(x, z) > 0.95) continue;
                    const h = 0.6 + r() * 1.6; v.set(x, seabed(x, z) - 0.05, z); sc.set(1, h, 1); e.set(0, r() * 6.28, 0); qq.setFromEuler(e); m4.compose(v, qq, sc); weed.setMatrixAt(n, m4);
                    col.setHSL(hue, 0.55, 0.22 + r() * 0.12).convertSRGBToLinear(); weed.setColorAt(n, col); n++; }
            }
            reefG.add(weed); chunkInstanced(weed, 6, 30, 2.4, reefG);
            // 산호 — 얕은 데(가장자리 쪽)에 분홍·주황·보라 가지
            const CR = 260, coral = new THREE.InstancedMesh(new THREE.ConeGeometry(0.06, 0.32, 5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }), CR * 3);
            const CC = [0xf28aa0, 0xf5a25a, 0xb58ae0, 0xf2d06a, 0xff7a7a];
            let ci = 0;
            for (let i = 0; i < CR; i++) { const a = r() * Math.PI * 2, d = 0.55 + r() * 0.38, x = Math.cos(a) * d * SRX, z = SZ + Math.sin(a) * d * SRZ, c0 = CC[Math.floor(r() * CC.length)];
                for (let b = 0; b < 3; b++) { e.set((r() - 0.5) * 0.9, r() * 6.28, (r() - 0.5) * 0.9); qq.setFromEuler(e); const s2 = 0.6 + r() * 0.8;
                    v.set(x + (r() - 0.5) * 0.12, seabed(x, z) + 0.12 * s2, z + (r() - 0.5) * 0.12); sc.set(s2, s2, s2); m4.compose(v, qq, sc); coral.setMatrixAt(ci, m4);
                    col.setHex(c0).convertSRGBToLinear(); coral.setColorAt(ci, col); ci++; } }
            reefG.add(coral); chunkInstanced(coral, 6, 30, 0.6, reefG);
            // 물고기 떼 — 떼마다 둥글게 돌며 오르내린다. 물고기 하나 = 몸통(다이아) + 꼬리
            const FPS = 9, FS = 36, fishG = (() => { const P = [0.09, 0, 0, 0, 0.03, 0, 0, -0.03, 0, 0, 0, 0.018, 0, 0, -0.018, -0.03, 0, 0, -0.07, 0.03, 0, -0.07, -0.03, 0];
                const I = [0, 1, 3, 0, 3, 2, 0, 2, 4, 0, 4, 1, 5, 3, 1, 5, 2, 3, 5, 4, 2, 5, 1, 4, 5, 6, 7];
                const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g; })();
            fishMesh = new THREE.InstancedMesh(fishG, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.3, side: THREE.DoubleSide }), FS * FPS);
            const FC = [0xf5c242, 0x7ad0f0, 0xf08a5a, 0xc0c8d0, 0x9ae07a, 0xe57aa8];
            for (let i = 0; i < FS; i++) { const [x, z] = inSea(0.85), floor = seabed(x, z), c0 = FC[i % FC.length];
                const sch = { x, z, y: Math.min(SEA_Y - 0.6, floor + 0.6 + r() * Math.max(0.2, SEA_Y - floor - 1.4)), R: 0.8 + r() * 1.6, w: (0.25 + r() * 0.3) * (r() < 0.5 ? 1 : -1), ph: r() * 6.28, off: [] };
                for (let k = 0; k < FPS; k++) { sch.off.push([(r() - 0.5) * 0.5, (r() - 0.5) * 0.3, (r() - 0.5) * 0.5]); col.setHex(c0).offsetHSL(0, 0, (r() - 0.5) * 0.1).convertSRGBToLinear(); fishMesh.setColorAt(i * FPS + k, col); }
                fishSchools.push(sch); }
            fishMesh.frustumCulled = false; seaGrp.add(fishMesh);
        }
        const fishTick = (t) => {   // 물속을 볼 때만 — 떼가 둥글게 돌고 물고기는 꼬리를 친다
            if (!fishMesh) return;
            const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
            fishSchools.forEach((sc, i) => {
                const a = sc.ph + t * sc.w, cx = sc.x + Math.cos(a) * sc.R, cz = sc.z + Math.sin(a) * sc.R, cy = sc.y + Math.sin(t * 0.6 + sc.ph) * 0.15;
                const head = Math.atan2(-(Math.cos(a) * sc.w), -(Math.sin(a) * sc.w)) - Math.PI / 2;   // 진행 방향(원의 접선)
                sc.off.forEach((o, k) => { qq.setFromAxisAngle(up, head + Math.sin(t * 9 + k) * 0.18); v.set(cx + o[0], cy + o[1], cz + o[2]); m4.compose(v, qq, one); fishMesh.setMatrixAt(i * sc.off.length + k, m4); });
            });
            fishMesh.instanceMatrix.needsUpdate = true;
        };
        fishTick(0);   // 처음 자리 — 안 그러면 물고기가 모두 원점(성 한가운데)에 모여 있다
        // 해안 70 나라 — 한 덩이(얼굴 8개씩), 누른 얼굴로 나라를 찾는다
        const NAT_FACES = 8, natRing = (() => {
            const pos = [], col = [], idx = [];
            const A0 = -Math.PI / 2 + 0.13, SP = Math.PI * 2 - 0.26;
            for (let i = 0; i < 70; i++) {
                const a0 = A0 + SP * i / 70, a1 = A0 + SP * (i + 1) / 70, base = pos.length / 3;
                for (let q = 0; q <= 4; q++) {
                    const a = a0 + (a1 - a0) * q / 4;
                    [3, 86].forEach(r => { const [X, Z] = toW(440 + Math.cos(a) * (330 + r), 470 + Math.sin(a) * (320 + r)); pos.push(X, -DROP + 0.05, Z); col.push(1, 1, 1); });
                }
                for (let q = 0; q < 4; q++) { const a = base + q * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
            }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
            g.setIndex(idx); g.computeVertexNormals();
            const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }));
            m.receiveShadow = true; seaGrp.add(m); return m;
        })();
        const natTrees = new THREE.InstancedMesh(new THREE.ConeGeometry(0.45, 1.3, 6), new THREE.MeshStandardMaterial({ color: 0x2b7a3a, roughness: 0.8, flatShading: true }), 140);
        const natHouses = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.55, 0.7), new THREE.MeshStandardMaterial({ color: 0xf2e3c2, roughness: 0.7 }), 140);
        natTrees.count = 0; natHouses.count = 0; seaGrp.add(natTrees); seaGrp.add(natHouses);
        const natMid = (i, r) => { const A0 = -Math.PI / 2 + 0.13, SP = Math.PI * 2 - 0.26, a = A0 + SP * (i + 0.5) / 70; return toW(440 + Math.cos(a) * (330 + r), 470 + Math.sin(a) * (320 + r)); };
        let seaW = (typeof _seaWorld !== 'undefined') ? _seaWorld : null;
        function paintSea(w) {
            seaW = w;
            const clear = (w && w.clear) || 0, stages = [250, 500, 1000, 2000]; let upto = 2000; for (const n of stages) if (clear < n) { upto = n; break; }
            const col = new THREE.Color();
            SG.water.forEach((c, i) => { col.set(i < clear ? (i >= clear - 12 ? '#2c95aa' : '#1fb0c9') : i < upto ? '#2b4f58' : '#1d3a44'); tiles.setColorAt(i, col); });
            SG.salt.forEach((c, i) => { col.set('#d9d2c3'); tiles.setColorAt(SG.water.length + i, col); });
            if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
            const LAND = ['#75674f', '#5aa962', '#3f8f4d', '#4f9b58', '#62b06a'], ca = natRing.geometry.attributes.color, m4 = new THREE.Matrix4();
            let nt = 0, nh = 0;
            for (let i = 0; i < 70; i++) {
                const lv = (w && w.nations && w.nations[i] && w.nations[i].lv) || 0;
                col.set(lv ? LAND[lv] : (i % 2 ? '#6a5c48' : '#75674f'));
                for (let v = 0; v < 10; v++) ca.setXYZ(i * 10 + v, col.r, col.g, col.b);
                if (lv >= 2) [30, 48].forEach(r => { const [X, Z] = natMid(i, r); m4.makeTranslation(X, -DROP + 0.7, Z); natTrees.setMatrixAt(nt++, m4); });
                if (lv >= 3) { const [X, Z] = natMid(i, 64); m4.makeTranslation(X, -DROP + 0.3, Z); natHouses.setMatrixAt(nh++, m4); }
                if (lv >= 4) { const [X, Z] = natMid(i, 78); m4.makeTranslation(X, -DROP + 0.3, Z); natHouses.setMatrixAt(nh++, m4); }
            }
            ca.needsUpdate = true; natTrees.count = nt; natHouses.count = nh;
            natTrees.instanceMatrix.needsUpdate = true; natHouses.instanceMatrix.needsUpdate = true;
        }
        // 내 포도나무 — 심은 나라 해안에 덩굴, 다 익으면 보랏빛 송이
        const vineG = new THREE.Group(); seaGrp.add(vineG);
        {
            const vines = (typeof _njVinesGrowing === 'function') ? _njVinesGrowing() : [];
            const stem = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.9 }), leaf = new THREE.MeshStandardMaterial({ color: 0x4f9a3a, roughness: 0.8, flatShading: true });
            const grape = new THREE.MeshStandardMaterial({ color: 0x5b2a86, roughness: 0.35, emissive: 0x220a33, emissiveIntensity: 0.3 });
            vines.forEach(v => {
                const [X, Z] = natMid(v.n, 20), y = -DROP + 0.05, ripe = typeof _njVineInfo === 'function' && _njVineInfo(v).ripe;
                [-0.5, 0, 0.5].forEach(o => {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.9, 6), stem); post.position.set(X + o, y + 0.45, Z); vineG.add(post);
                    const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28, 0), leaf); bush.position.set(X + o, y + 0.85, Z); vineG.add(bush);
                    if (ripe) [[0.12, 0.62, 0.15], [-0.14, 0.6, -0.1]].forEach(([dx, dy, dz]) => { const c = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 7), grape); c.rotation.x = Math.PI; c.position.set(X + o + dx, y + dy, Z + dz); vineG.add(c); });
                });
            });
        }
        // ══ 🎁 만국의 예물 — 사신 · 예물 모양 · 성 둘레에 놓인 예물 ══
        const mat = (color, o) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.6 }, o || {}));
        const GOLD = mat(0xe0b04a, { metalness: 0.7, roughness: 0.3, emissive: 0x4a3208, emissiveIntensity: 0.3 });
        const FAMILY_ROBE = { '셈': 0x3b6fb6, '함': 0xc77b2e, '야벳': 0x2e8b57 };
        // ── 사람 · 짐승 · 수레 (9/30 그래픽 2차, 시안 「만국의 예물 행렬」에서) — 모두 +x를 바라본다. 만들면 { g, anim(t, 빠르기), animal? } ──
        const PM = (() => {
        const LINEN = mat(0xfbf8f0, { roughness: 0.85 });
        const SKIN = mat(0xd9b28c), WOOD = mat(0x7a5230, { roughness: 0.8 }), SANDAL = mat(0x8a5a34);
        const ell = (r, sx, sy, sz, m) => { const e = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), m); e.scale.set(sx, sy, sz); return e; };
        const put = (o, x, y, z) => { o.position.set(x, y, z); return o; };
        const cyl = (r0, r1, h, m, seg) => new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg || 10), m);
        // 사람 — 두건·겉옷·띠, 무릎 없는 다리와 팔(순례자와 같은 크기). pose: 'walk' | 'carry'(두 팔을 들어 채를 붙잡는다) | 'lead'(지팡이)
        function person(robe, pose) {
          const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
          const R = mat(robe, { roughness: 0.7 }), cloth = mat(0xeee6d8);
          body.add(put(cyl(0.032, 0.058, 0.12, R, 14), 0, 0.115, 0));
          const belt = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.006, 6, 16), GOLD); belt.rotation.x = Math.PI / 2; belt.position.y = 0.13; body.add(belt);
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), SKIN); head.position.y = 0.2; body.add(head);
          const hood = ell(0.034, 1, 1.15, 1, cloth); hood.position.set(-0.004, 0.207, 0); body.add(hood);   // 두건
          const band = new THREE.Mesh(new THREE.TorusGeometry(0.031, 0.005, 6, 16), R); band.rotation.x = Math.PI / 2; band.position.y = 0.214; body.add(band);
          const tail = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.07, 8), cloth); tail.position.set(-0.03, 0.18, 0); tail.rotation.z = -0.5; body.add(tail);   // 두건 자락
          const face = new THREE.Mesh(new THREE.SphereGeometry(0.029, 12, 8, -Math.PI / 2.4, Math.PI / 1.2, 0.5, 1.6), SKIN); face.position.set(0.004, 0.2, 0); body.add(face);
          const limb = (x, y, z, len, r, m, foot) => { const p = new THREE.Group(); p.position.set(x, y, z); const l = cyl(r, r * 0.85, len, m, 8); l.position.y = -len / 2; p.add(l);
            if (foot) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.01, 0.02), SANDAL); f.position.set(0.008, -len, 0); p.add(f); }
            else { const h = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 6), SKIN); h.position.y = -len - 0.003; p.add(h); }
            body.add(p); return p; };
          const hipL = limb(0, 0.07, 0.017, 0.07, 0.011, cloth, true), hipR = limb(0, 0.07, -0.017, 0.07, 0.011, cloth, true);
          const armL = limb(0, 0.162, 0.038, 0.066, 0.011, R), armR = limb(0, 0.162, -0.038, 0.066, 0.011, R);
          if (pose === 'lead') { const st = cyl(0.005, 0.005, 0.3, WOOD, 6); st.position.set(0.004, -0.02, 0); armR.add(st); }
          const anim = (t, sp) => {
            const w = Math.sin(t * 9 * (sp || 1)), a = 0.5 * w;
            hipL.rotation.z = a; hipR.rotation.z = -a;
            if (pose === 'carry') { armL.rotation.z = armR.rotation.z = 2.55; armL.rotation.x = -0.25; armR.rotation.x = 0.25; }
            else if (pose === 'lead') { armL.rotation.z = -a * 0.8; armR.rotation.z = 0.5; }
            else { armL.rotation.z = -a * 0.8; armR.rotation.z = a * 0.8; }
            body.position.y = Math.abs(Math.cos(t * 9 * (sp || 1))) * 0.006;
          };
          anim(0); return { g, anim };
        }
        // 네 발 짐승의 두 마디 다리 — 넓적다리가 흔들리고 앞으로 나올 때 무릎이 굽는다
        function makeLegs(parent, coat, spots, upper, lower, r) {
          const legs = spots.map(([x, z, ph]) => {
            const hip = new THREE.Group(); hip.position.set(x, upper + lower, z); parent.add(hip);
            const u = cyl(r, r * 0.8, upper, coat, 8); u.position.y = -upper / 2; hip.add(u);
            const knee = new THREE.Group(); knee.position.y = -upper; hip.add(knee);
            const l = cyl(r * 0.8, r * 0.65, lower, coat, 8); l.position.y = -lower / 2; knee.add(l);
            const hoof = cyl(r * 0.8, r * 0.9, 0.012, mat(0x3a2e24), 8); hoof.position.y = -lower; knee.add(hoof);
            return { hip, knee, ph };
          });
          return (t, sp) => legs.forEach(L => { const p = t * 11 * (sp || 1) + L.ph, s = Math.sin(p); L.hip.rotation.z = s * 0.42; L.knee.rotation.z = -Math.max(0, Math.cos(p)) * 0.7; });
        }
        const GAIT = [0, Math.PI, Math.PI / 2, Math.PI * 1.5];   // 앞왼·앞오·뒤왼·뒤오
        // 세마포 예물 — 금줄 십자와 나비매듭, 늘어진 술
        function wrapped(w, h, d) {
          const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), LINEN));
          const fold = new THREE.Mesh(new THREE.BoxGeometry(w * 0.98, 0.006, d * 1.02), mat(0xece6d8)); fold.position.y = h * 0.18; g.add(fold);   // 천 주름
          [[w + 0.008, 0.012, 0.018], [0.018, 0.012, d + 0.008]].forEach(([a, b, c]) => { const r = new THREE.Mesh(new THREE.BoxGeometry(a, b, c), GOLD); r.position.y = h / 2; g.add(r); });
          [[w + 0.008, h + 0.006, 0.016], [0.016, h + 0.006, d + 0.008]].forEach(([a, b, c]) => g.add(new THREE.Mesh(new THREE.BoxGeometry(a, b, c), GOLD)));
          [-1, 1].forEach(sd => { const loop = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 6, 12), GOLD); loop.position.set(sd * 0.02, h / 2 + 0.018, 0); loop.rotation.y = Math.PI / 2; g.add(loop); });
          const knot = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 6), GOLD); knot.position.y = h / 2 + 0.01; g.add(knot);
          [-1, 1].forEach(sd => { const tas = cyl(0.004, 0.009, 0.05, GOLD, 6); tas.position.set(sd * 0.012, h / 2 - 0.02, d / 2 + 0.01); g.add(tas); });
          return g;
        }
        function mule() {
          const g = new THREE.Group(), coat = mat(0x8a6a50, { roughness: 0.8 });
          g.add(put(ell(0.1, 1.7, 0.72, 0.62, coat), 0, 0.22, 0));
          const neck = cyl(0.03, 0.045, 0.14, coat); neck.position.set(0.16, 0.29, 0); neck.rotation.z = -0.8; g.add(neck);
          const head = ell(0.045, 1.6, 0.8, 0.8, coat); head.position.set(0.23, 0.33, 0); head.rotation.z = -0.4; g.add(head);
          [-1, 1].forEach(sd => { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.08, 6), coat); ear.position.set(0.21, 0.39, sd * 0.022); ear.rotation.x = sd * 0.25; g.add(ear); });
          const tailM = cyl(0.006, 0.012, 0.1, coat, 6); tailM.position.set(-0.18, 0.2, 0); tailM.rotation.z = -0.3; g.add(tailM);
          const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.15), mat(0x9b3a2e)); saddle.position.set(-0.01, 0.285, 0); g.add(saddle);
          const legsAnim = makeLegs(g, coat, [[0.1, 0.035, GAIT[0]], [0.1, -0.035, GAIT[1]], [-0.1, 0.035, GAIT[2]], [-0.1, -0.035, GAIT[3]]], 0.075, 0.075, 0.013);
          const w = wrapped(0.18, 0.12, 0.15); w.position.set(-0.01, 0.36, 0); g.add(w);
          return { g, animal: true, anim: (t, sp) => { legsAnim(t, sp); head.rotation.z = -0.4 + Math.sin(t * 11) * 0.05; } };
        }
        function camel(load) {
          const g = new THREE.Group(), coat = mat(0xc9a06a, { roughness: 0.85 });
          g.add(put(ell(0.13, 1.55, 0.72, 0.68, coat), 0, 0.37, 0));
          const hump = ell(0.1, 1.15, 0.95, 0.9, coat); hump.position.set(-0.02, 0.46, 0); g.add(hump);
          [[0.2, 0.4, -0.3, 0.05], [0.26, 0.47, -0.9, 0.042], [0.3, 0.55, -0.2, 0.036]].forEach(([x, y, rz, r]) => { const n = cyl(r * 0.85, r, 0.11, coat); n.position.set(x, y, 0); n.rotation.z = rz; g.add(n); });   // 휜 목
          const head = ell(0.05, 1.7, 0.75, 0.75, coat); head.position.set(0.36, 0.6, 0); g.add(head);
          [-1, 1].forEach(sd => { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.03, 6), coat); ear.position.set(0.32, 0.64, sd * 0.02); g.add(ear); });
          const tailC = cyl(0.006, 0.01, 0.12, coat, 6); tailC.position.set(-0.2, 0.34, 0); tailC.rotation.z = -0.2; g.add(tailC);
          // 안장 담요 — 붉은 천에 금 띠, 네 귀퉁이 술
          const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.24), mat(0x9b2d2d, { roughness: 0.7 })); blanket.position.set(-0.02, 0.5, 0); g.add(blanket);
          const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.265, 0.022, 0.03), GOLD); stripe.position.copy(blanket.position); g.add(stripe);
          [[0.12, 0.12], [0.12, -0.12], [-0.15, 0.12], [-0.15, -0.12]].forEach(([x, z]) => { const tas = new THREE.Mesh(new THREE.ConeGeometry(0.01, 0.04, 6), GOLD); tas.position.set(x, 0.47, z); tas.rotation.x = Math.PI; g.add(tas); });
          const legsAnim = makeLegs(g, coat, [[0.13, 0.05, GAIT[0]], [0.13, -0.05, GAIT[1]], [-0.13, 0.05, GAIT[2]], [-0.13, -0.05, GAIT[3]]], 0.15, 0.15, 0.018);
          if (load) { const w = wrapped(0.2, 0.15, 0.18); w.position.set(-0.02, 0.6, 0); g.add(w); }
          else [-1, 1].forEach(sd => { const bag = ell(0.06, 1, 1.25, 0.7, sd > 0 ? GOLD : mat(0xe9dcc0, { roughness: 0.9 })); bag.position.set(-0.03, 0.4, sd * 0.13); g.add(bag); });   // 금 · 유향
          return { g, animal: true, anim: (t, sp) => { legsAnim(t, (sp || 1) * 0.8); head.position.y = 0.6 + Math.sin(t * 8.8) * 0.01; } };
        }
        function horse() {
          const g = new THREE.Group(), coat = mat(0xfbfbf6, { roughness: 0.6 });
          g.add(put(ell(0.11, 1.65, 0.75, 0.62, coat), 0, 0.3, 0));
          const neck = cyl(0.035, 0.055, 0.17, coat); neck.position.set(0.17, 0.39, 0); neck.rotation.z = -0.6; g.add(neck);
          const head = ell(0.045, 1.8, 0.8, 0.72, coat); head.position.set(0.25, 0.46, 0); head.rotation.z = -0.55; g.add(head);
          for (let k = 0; k < 6; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.03, 0.012), GOLD); m.position.set(0.12 + k * 0.022, 0.4 + k * 0.022, 0); m.rotation.z = -0.6; g.add(m); }   // 금 갈기
          const tailH = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.16, 8), GOLD); tailH.position.set(-0.2, 0.26, 0); tailH.rotation.z = -0.5; g.add(tailH);
          const breast = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.008, 6, 16, Math.PI), GOLD); breast.position.set(0.13, 0.3, 0); breast.rotation.set(0, Math.PI / 2, Math.PI); g.add(breast);
          const legsAnim = makeLegs(g, coat, [[0.12, 0.04, GAIT[0]], [0.12, -0.04, GAIT[1]], [-0.12, 0.04, GAIT[2]], [-0.12, -0.04, GAIT[3]]], 0.11, 0.11, 0.015);
          return { g, animal: true, anim: (t, sp) => { legsAnim(t, sp); head.rotation.z = -0.55 + Math.sin(t * 11) * 0.06; } };
        }
        function spokedWheel(r) { const w = new THREE.Group(); w.add(new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 20), WOOD));
          for (let k = 0; k < 6; k++) { const sp = cyl(0.004, 0.004, r * 2, WOOD, 4); sp.rotation.z = k * Math.PI / 6; w.add(sp); }
          w.add(cyl(0.018, 0.018, 0.03, GOLD, 8).rotateX(Math.PI / 2)); return w; }
        function chariot() {
          const g = new THREE.Group();
          const box = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.22), GOLD); box.position.set(-0.02, 0.2, 0); g.add(box);
          const front = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.12, 16, 1, false, 0, Math.PI), GOLD); front.position.set(0.08, 0.2, 0); front.rotation.y = Math.PI / 2; g.add(front);
          const wheels = [-1, 1].map(sd => { const wh = spokedWheel(0.12); wh.position.set(-0.02, 0.12, sd * 0.13); g.add(wh); return wh; });
          const pole = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.016, 0.016), WOOD); pole.position.set(0.3, 0.22, 0); g.add(pole);
          const w = wrapped(0.16, 0.13, 0.16); w.position.set(-0.02, 0.33, 0); g.add(w);
          return { g, anim: (t, sp) => wheels.forEach(wh => { wh.rotation.z = -t * 9 * (sp || 1); }) };
        }
        function litter(robe) {
          const g = new THREE.Group();
          const base = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.035, 0.28), GOLD); base.position.y = 0.2; g.add(base);
          [[0.18, 0.12], [0.18, -0.12], [-0.18, 0.12], [-0.18, -0.12]].forEach(([x, z]) => { const p = cyl(0.007, 0.007, 0.24, GOLD, 6); p.position.set(x, 0.33, z); g.add(p); });
          const roof = new THREE.Mesh(new THREE.ConeGeometry(0.29, 0.12, 4), mat(0x6b3a8e, { roughness: 0.5 })); roof.position.y = 0.5; roof.rotation.y = Math.PI / 4; g.add(roof);
          const fin = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), GOLD); fin.position.y = 0.57; g.add(fin);
          for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, x = Math.cos(a) * 0.2, z = Math.sin(a) * 0.2; const tas = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.035, 5), GOLD); tas.position.set(x, 0.43, z); tas.rotation.x = Math.PI; g.add(tas); }   // 술 장식
          [-1, 1].forEach(sd => { const cur = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.2), new THREE.MeshStandardMaterial({ color: 0x8e5bb0, transparent: true, opacity: 0.55, side: THREE.DoubleSide })); cur.position.set(0, 0.33, sd * 0.125); g.add(cur); });   // 휘장
          [-0.1, 0.1].forEach(z => { const pole = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.018, 0.018), WOOD); pole.position.set(0, 0.215, z * 1.9); g.add(pole); });
          const w = wrapped(0.2, 0.14, 0.18); w.position.set(0, 0.29, 0); g.add(w);
          const bearers = [[0.36, 0.19], [0.36, -0.19], [-0.36, 0.19], [-0.36, -0.19]].map(([x, z], n) => { const p = person(robe, 'carry'); p.g.position.set(x, 0, z); g.add(p.g); p.ph = n * 1.3; return p; });
          return { g, bearers, anim: (t, sp) => bearers.forEach(b => b.anim(t + b.ph, sp)) };
        }
        function ship() {
          const g = new THREE.Group();
          const prof = new THREE.Shape(); prof.moveTo(-0.62, 0.22); prof.quadraticCurveTo(-0.5, -0.02, 0, -0.04); prof.quadraticCurveTo(0.55, -0.02, 0.78, 0.3); prof.lineTo(0.62, 0.22); prof.lineTo(-0.62, 0.22);
          const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(prof, { depth: 0.34, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.04, bevelSegments: 2 }), mat(0x7a5230, { roughness: 0.75 })); hull.position.z = -0.17; g.add(hull);
          const rail = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.03, 0.42), GOLD); rail.position.set(0, 0.23, 0); g.add(rail);
          const mast = cyl(0.018, 0.024, 1.15, WOOD, 8); mast.position.set(0, 0.8, 0); g.add(mast);
          const sg = new THREE.PlaneGeometry(0.62, 0.72, 8, 8), sp = sg.attributes.position;
          for (let i = 0; i < sp.count; i++) { const x = sp.getX(i), y = sp.getY(i); sp.setZ(i, 0.09 * Math.cos(x / 0.62 * Math.PI) * Math.cos(y / 0.72 * Math.PI * 0.8)); }   // 바람 먹은 돛
          sg.computeVertexNormals();
          const sail = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ color: 0xf2ead8, side: THREE.DoubleSide, roughness: 0.8 })); sail.position.set(0.03, 0.8, 0); sail.rotation.y = Math.PI / 2; g.add(sail);
          const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.07), new THREE.MeshStandardMaterial({ color: 0x2e8b57, side: THREE.DoubleSide })); flag.position.set(-0.07, 1.36, 0); g.add(flag);
          const oars = []; for (let k = 0; k < 4; k++) [-1, 1].forEach(sd => {
            const piv = new THREE.Group(); piv.position.set(-0.35 + k * 0.22, 0.22, sd * 0.21); g.add(piv);   // 뱃전의 노걸이
            const o = cyl(0.006, 0.006, 0.46, WOOD, 5); o.rotation.x = sd * 2.1; o.position.set(0, -0.5 * 0.23, sd * 0.85 * 0.23); piv.add(o);   // 바깥 아래 — 물 쪽으로
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.004, 0.09), WOOD); blade.position.set(0, -0.5 * 0.44, sd * 0.85 * 0.44); blade.rotation.x = sd * 0.55; piv.add(blade);
            oars.push({ o: piv, sd }); });
          const w = wrapped(0.24, 0.16, 0.22); w.position.set(-0.3, 0.33, 0); g.add(w);
          return { g, anim: (t) => { oars.forEach(({ o, sd }) => { o.rotation.y = Math.sin(t * 3.2) * 0.45 * sd; o.rotation.x = -(Math.cos(t * 3.2) * 0.12) * sd; }); flag.rotation.y = Math.sin(t * 6) * 0.3; } };   // 노: 잠겼을 때 뒤로 밀고, 들어서 앞으로
        }
            return { person, mule, camel, horse, chariot, litter, ship, wrapped };
        })();
        const makePerson = robe => PM.person(robe, 'lead').g;   // 사신 — 지팡이 든 사람
        const envoyG = new THREE.Group(); seaGrp.add(envoyG);
        const envoys = [];   // { i, x, z }
        function buildEnvoys(w) {
            while (envoyG.children.length) envoyG.remove(envoyG.children[0]);
            envoys.length = 0;
            for (let i = 0; i < 70; i++) {
                const lv = (w && w.nations && w.nations[i] && w.nations[i].lv) || 0;
                if (lv < 1) continue;
                const N = (typeof SEA_NATIONS !== 'undefined' && SEA_NATIONS[i]) || [];
                const [X, Z] = natMid(i, 40), e = makePerson(FAMILY_ROBE[N[4]] || 0x888888);
                e.scale.setScalar(1.6); e.position.set(X, -DROP + 0.05, Z); e.lookAt(0, -DROP + 0.05, SZ); e.rotateY(Math.PI); e.rotateY(-Math.PI / 2);   // 사람 모델은 +x가 앞
                envoyG.add(e); envoys.push({ i, x: X, z: Z });
            }
        }
        // 예물 모양 — 블렌더 로우폴리 모델(models/gifts/*.glb, tools/blender/)을 받아 쓴다. 받기 전·실패하면 이 도형(9/30 처음 모양)
        function giftModel(k) {
            const g = new THREE.Group(), add = (m, x, y, z) => { m.position.set(x || 0, y || 0, z || 0); m.castShadow = true; g.add(m); return m; };
            const flame = () => new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xffc860, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
            if (k === 'whitestone') { const m = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), mat(0xf7f5ee, { roughness: 0.3 })), 0, 0.18); m.scale.set(1, 0.55, 0.8); }
            else if (k === 'palm') {
                add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.4, 8), mat(0x8a6a42)), 0, 0.7);
                for (let n = 0; n < 7; n++) { const f = add(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.9, 4), mat(0x3f9a4a, { flatShading: true })), 0, 1.4); f.rotation.set(1.1, n / 7 * Math.PI * 2, 0); f.translateY(0.4); }
            } else if (k === 'morningstar') {
                add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.9, 10), mat(0xf2ead8)), 0, 0.45);
                add(new THREE.Mesh(new THREE.OctahedronGeometry(0.16), mat(0xfff4c2, { emissive: 0xffe08a, emissiveIntensity: 0.9 })), 0, 1.1);
                const f = add(flame(), 0, 1.1); f.scale.set(1.1, 1.1, 1);
            } else if (k === 'harp') {
                const fr = add(new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 8, 24, Math.PI * 1.1), GOLD), 0, 0.5); fr.rotation.z = -0.3;
                add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 8), GOLD), -0.32, 0.45);
                for (let n = 0; n < 7; n++) add(new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.55 - n * 0.04, 4), mat(0xfff6dc)), -0.24 + n * 0.08, 0.45);
            } else if (k === 'menorah') {
                add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.08, 20), GOLD), 0, 0.04);
                for (let n = 0; n < 7; n++) { const a = n / 7 * Math.PI * 2, x = Math.cos(a) * 0.42, z = Math.sin(a) * 0.42;
                    add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.55, 8), GOLD), x, 0.33, z);
                    add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.06, 10), GOLD), x, 0.63, z);
                    const f = add(flame(), x, 0.72, z); f.scale.set(0.22, 0.3, 1); }
            } else if (k === 'olives') {
                [-0.45, 0.45].forEach(x => { add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.7, 7), mat(0x7a6048)), x, 0.35);
                    const c = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), mat(0x8fa36a, { flatShading: true })), x, 0.85); c.scale.y = 0.8; });
            } else if (k === 'winepress') {
                add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.32, 18), mat(0x9a9186)), 0, 0.16);
                add(new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 0.02, 18), mat(0x5b1f4a, { roughness: 0.3 })), 0, 0.33);
                add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), mat(0x7a5230)), 0, 0.62);
                [-0.55, 0.55].forEach(x => add(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.62, 0.08), mat(0x7a5230)), x, 0.31));
            } else if (k === 'rainbow') {
                ['#1fae6a', '#46c28a', '#7fd6a6', '#b8ead0'].forEach((c, n) => { const r = add(new THREE.Mesh(new THREE.TorusGeometry(1.1 - n * 0.09, 0.045, 8, 36, Math.PI), mat(c, { emissive: c, emissiveIntensity: 0.25 }))); r.position.y = 0.02; });
            } else if (k === 'millstone') {
                const m = add(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.22, 24), mat(0x8c857a)), 0, 0.35); m.rotation.z = 1.2;
                const hole = add(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.24, 12), mat(0x3a352e)), 0, 0.35); hole.rotation.z = 1.2;
            } else if (k === 'dragon') {
                const skin = mat(0x7a2a24, { roughness: 0.5 }), chain = mat(0x8a8f96, { metalness: 0.8, roughness: 0.3 });
                for (let n = 0; n < 6; n++) { const b = add(new THREE.Mesh(new THREE.SphereGeometry(0.2 - n * 0.022, 10, 8), skin), -0.5 + n * 0.22, 0.17 - n * 0.01, Math.sin(n) * 0.12); b.scale.y = 0.75; }
                const head = add(new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.36, 8), skin), -0.72, 0.15, 0); head.rotation.z = Math.PI / 2;
                [-1, 1].forEach(sd => { const wg = add(new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 3), mat(0x5a1d1a, { flatShading: true })), -0.2, 0.3, sd * 0.18); wg.rotation.set(sd * 1.2, 0, 0.4); });
                for (let n = 0; n < 4; n++) { const l = add(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 16), chain), -0.4 + n * 0.25, 0.17); l.rotation.y = Math.PI / 2; }
            }
            return g;
        }
        const giftsG = new THREE.Group(); scene.add(giftsG);
        const slots = (typeof NJ_GIFT_SLOTS !== 'undefined') ? NJ_GIFT_SLOTS : [];
        // ── 예물의 움직임 — 블렌더에서 따로 떼어 둔 부분(축 노드)을 이름으로 찾아 매 프레임 움직인다 ──
        const _q = new THREE.Quaternion(), _Y = new THREE.Vector3(0, 1, 0);
        const NOTE_TEX = ['♪', '♫'].map(ch => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
          x.font = 'bold 52px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = 'rgba(120,80,0,.6)'; x.shadowBlur = 6; x.fillStyle = '#ffd86a'; x.fillText(ch, 32, 34); return new THREE.CanvasTexture(c); });
        function giftAnim(k, root) {
          const N = n => root.getObjectByName(n), all = [];
          const own = o => { o.traverse(c => { if (c.isMesh) c.material = c.material.clone(); }); return o; };   // 불꽃마다 따로 깜박이게
          const keep = o => { if (o) { o.userData.p0 = o.position.clone(); o.userData.s0 = o.scale.clone(); o.userData.q0 = o.quaternion.clone(); } return o; };
          const mats = o => { const m = []; o.traverse(c => { if (c.isMesh) m.push(c.material); }); return m; };
          const wave = (t, f, ph) => Math.sin(t * f + ph);
          if (k === 'menorah') {   // 등불 — 불꽃마다 제멋대로 흔들리고 일렁인다
            for (let i = 0; i < 7; i++) { const f = N('flame' + i); if (f) all.push([keep(own(f)), i * 1.7, mats(f)]); }
            return t => all.forEach(([f, ph, ms]) => {
              f.rotation.z = wave(t, 2.3, ph) * 0.12 + wave(t, 6.1, ph * 2) * 0.05; f.rotation.x = wave(t, 1.9, ph) * 0.09;
              const sy = 1 + wave(t, 8.7, ph) * 0.08 + wave(t, 13.1, ph) * 0.04; f.scale.set(1 - (sy - 1) * 0.5, sy, 1 - (sy - 1) * 0.5);
              ms.forEach(m => m.emissiveIntensity = 1.1 + wave(t, 11, ph) * 0.25);
            });
          }
          if (k === 'morningstar') {   // 새벽별 — 천천히 돌며 이따금 반짝
            const s = N('star'); if (!s) return null; own(s); const ms = mats(s);
            const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xffe6a0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.add(halo);
            return t => { s.rotation.y = t * 0.5; const tw = Math.pow(Math.max(0, Math.sin(t * 3.1)), 12) + 0.5 * Math.pow(Math.max(0, Math.sin(t * 1.7 + 1)), 10);
              s.scale.setScalar(1 + wave(t, 2.4, 0) * 0.06 + tw * 0.08); ms.forEach(m => m.emissiveIntensity = 1 + tw * 0.9);
              halo.scale.setScalar(0.9 + tw * 0.6 + wave(t, 2.4, 0) * 0.08); halo.material.opacity = 0.55 + tw * 0.45; };
          }
          if (k === 'millstone') {   // 맷돌 — 제 축으로 돌고, 물보라가 일렁인다
            const s = keep(N('stone')), sp = keep(N('splash')); if (!s || !sp) return null;
            return t => { s.quaternion.copy(s.userData.q0).multiply(_q.setFromAxisAngle(_Y, t * 0.7));
              sp.scale.set(1 + wave(t, 2.5, 1) * 0.05, 1 + wave(t, 2.5, 0) * 0.18, 1 + wave(t, 2.5, 1) * 0.05); };
          }
          if (k === 'winepress') {   // 포도주 틀 — 기둥이 비틀며 쿵 내려와 짜면 포도가 포도주 속에 잠기고, 들리면 다시 떠오른다
            const pr = keep(N('press')), gr = keep(N('grapes')), drops = [0, 1, 2, 3].map(i => keep(N('drop' + i))).filter(Boolean); if (!pr || !gr) return null;
            const ease = x => x * x * (3 - 2 * x);
            return t => { const u = (t % 2.8) / 2.8;   // 한 번 짜는 데 2.8초
              let d;   // 누름판이 내려간 깊이 0~1
              if (u < 0.22) d = Math.pow(u / 0.22, 2.2);          // 빠르게 쿵
              else if (u < 0.45) d = 1 + Math.sin((u - 0.22) * 60) * 0.02 * (1 - (u - 0.22) / 0.23);   // 눌러 버티며 떨림
              else d = 1 - ease((u - 0.45) / 0.55);                // 천천히 들어 올림
              pr.position.y = pr.userData.p0.y - 0.2 * d; pr.rotation.y = -d * 2.4;   // 나사 기둥이 돌며 내려간다
              const bob = Math.sin(t * 3.2) * 0.012 * (1 - d);     // 들렸을 땐 포도가 둥실
              gr.position.y = gr.userData.p0.y - 0.19 * d + bob; gr.scale.set(1 + 0.08 * d, 1 - 0.12 * d, 1 + 0.08 * d); gr.rotation.y = Math.sin(t * 0.7) * 0.15;
              const flow = u > 0.12 && u < 0.7 ? 1 : 0.25;
              drops.forEach((dr, i) => { const f = (t * 1.6 + i / 4) % 1;
                dr.position.set(dr.userData.p0.x, dr.userData.p0.y - 0.132 * f * f, dr.userData.p0.z + 0.135 * f);
                dr.scale.setScalar(Math.max(0.001, flow * (f < 0.1 ? f / 0.1 : f > 0.9 ? (1 - f) / 0.1 : 1))); }); };
          }
          if (k === 'palm') {   // 종려 가지 — 바람에 살랑
            for (let i = 0; i < 5; i++) { const f = N('frond' + i); if (f) all.push([f, i * 1.3]); }
            return t => all.forEach(([f, ph]) => { f.rotation.x = wave(t, 1.2, ph) * 0.05 + wave(t, 3.1, ph) * 0.012; f.rotation.z = wave(t, 0.9, ph * 1.3) * 0.06; });
          }
          if (k === 'olives') {   // 감람나무 — 잎이 바람에 흔들린다
            [N('crown0'), N('crown1')].forEach((c, i) => c && all.push([c, i * 2.1]));
            return t => all.forEach(([c, ph]) => { c.rotation.z = wave(t, 0.8, ph) * 0.035; c.rotation.x = wave(t, 1.1, ph) * 0.03; });
          }
          if (k === 'harp') {   // 거문고 — 줄을 하나씩 튕기면 떨리며 빛나고, 음표가 날아오른다. 10/1부터 눕혀 놓은 우리 거문고(줄 여섯) — 떨림은 위아래, 음표는 줄 따라 여기저기서
            const strs = []; for (let i = 0; i < 7; i++) { const st = N('string' + i); if (st) { keep(own(st)); const ms = mats(st); ms.forEach(m => m.emissive.set(0xfff0b0)); strs.push({ st, ms, at: -9 }); } }
            if (!strs.length) return null;
            const TUNE = [0, 2, 4, 6, 4, 2, 3, 5, 6, 5, 3, 1, 2, 4, 5, 3];   // 올라갔다 내려오는 가락
            const notes = [0, 1, 2, 3, 4, 5, 6, 7].map(n => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: NOTE_TEX[n % 2], transparent: true, depthWrite: false, opacity: 0 })); sp.scale.setScalar(0.13); root.add(sp); return { sp, age: 9, v: new THREE.Vector3() }; });
            let next = 0, step = 0, last = 0, ni = 0;
            return t => { const dt = Math.min(0.05, Math.max(0, t - last)); last = t;
              if (t >= next) { const s0 = strs[TUNE[step++ % TUNE.length] % strs.length]; s0.at = t; next = t + 0.38 + (step % 4 === 0 ? 0.3 : 0);
                const n = notes[ni++ % notes.length]; n.age = 0; n.sp.position.set(s0.st.position.x + (Math.random() - 0.5) * 0.9, s0.st.position.y + 0.12 + Math.random() * 0.1, s0.st.position.z);
                n.v.set((Math.random() - 0.5) * 0.25, 0.32 + Math.random() * 0.12, 0.12 + Math.random() * 0.1); }
              strs.forEach(({ st, ms, at }) => { const a = t - at, e = Math.exp(-a * 5);
                st.position.y = st.userData.p0.y + Math.sin(a * 75) * 0.005 * e; ms.forEach(m => m.emissiveIntensity = 0.9 * e); });
              notes.forEach(n => { n.age += dt; if (n.age > 2.2) { n.sp.material.opacity = 0; return; }
                n.sp.position.addScaledVector(n.v, dt); n.sp.position.x += Math.sin(n.age * 4 + n.v.z * 20) * 0.003;
                n.sp.material.opacity = Math.min(1, n.age * 6) * (1 - n.age / 2.2); n.sp.scale.setScalar(0.1 + n.age * 0.03); });
            };
          }
          if (k === 'rainbow') {   // 무지개 — 안쪽 띠에서 바깥 띠로 빛이 흐른다
            for (let i = 0; i < 4; i++) { const b = N('band' + i); if (b) { own(b); const ms = mats(b); ms.forEach(m => m.emissive.set(0x3dffa8)); all.push([ms, i]); } }
            return t => all.forEach(([ms, i]) => ms.forEach(m => m.emissiveIntensity = 0.08 + 0.3 * Math.pow(Math.max(0, Math.sin(t * 1.6 - i * 0.9)), 3)));
          }
          if (k === 'whitestone') {   // 흰 돌 — 새긴 글자가 이따금 금빛으로 반짝
            const l = N('letters'); if (!l) return null; own(l); const ms = mats(l); ms.forEach(m => m.emissive.set(0xffd76a));
            return t => ms.forEach(m => m.emissiveIntensity = 0.9 * Math.pow(Math.max(0, Math.sin(t * 0.9)), 16));
          }
          if (k === 'dragon') {   // 결박된 용 — 무겁게 숨 쉬고, 일곱 머리가 따로 늘어졌다가 이따금 하나씩 겨우 들다 떨군다
            const body = keep(N('base')), heads = [];
            for (let i = 0; i < 7; i++) { const h = keep(N('head' + i)); if (!h || !h.children[0]) continue;
              const c = h.children[0].position, d = new THREE.Vector3(c.x, 0, c.z).normalize();
              heads.push({ h, ph: i * 1.63, axis: new THREE.Vector3(-d.z, 0, d.x), off: i * 1.9 }); }
            const qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
            return t => {
              const br = 0.5 - 0.5 * Math.cos(t * 0.75);   // 느린 숨
              if (body) body.scale.y = body.userData.s0.y * (1 + br * 0.035);
              heads.forEach(({ h, ph, axis, off }) => {
                // 11초마다 차례로 한 번: 1.8초에 걸쳐 겨우 들었다가, 힘이 빠져 툭 떨군다 (떨림 조금)
                const u = (t + off) % 11; let lift = 0;
                if (u < 1.8) lift = 0.2 * Math.pow(Math.sin(u / 1.8 * Math.PI / 2), 2) + Math.sin(t * 23 + ph) * 0.008 * (u / 1.8);
                else if (u < 3.6) { const v = u - 1.8; lift = 0.2 * Math.exp(-v * 4) * Math.cos(v * 5); }
                const pitch = lift + br * 0.025 - 0.01, yaw = Math.sin(t * 0.33 + ph) * 0.05;
                h.quaternion.copy(h.userData.q0).multiply(qa.setFromAxisAngle(_Y, yaw)).multiply(qb.setFromAxisAngle(axis, pitch));
              });
            };
          }
          return null;
        }
        const glbCache = {};
        function loadGift(k) {   // 한 번 받아 두고 쓸 때마다 복제
            if (!glbCache[k]) glbCache[k] = (async () => {
                if (!THREE.GLTFLoader) await loadScript(GLTF_URL);
                const gl = await new Promise((res, rej) => new THREE.GLTFLoader().load(`models/gifts/${k}.glb?v=${GIFT_V}`, res, undefined, rej));
                gl.scene.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true;
                    // 반사할 주변 빛이 없으면(기본 화질) 금속이 검게 보인다 — 금속감을 낮춰 금빛을 살린다
                    const m = o.material; if (m.metalness > 0.5) { m.metalness = 0.35; m.roughness = 0.38; } if (m.emissive && m.emissive.getHex()) m.emissiveIntensity = 1.2; });
                return gl.scene;
            })();
            glbCache[k].catch(() => { delete glbCache[k]; });
            return glbCache[k];
        }
        const GIFT_SCALE = { dragon: 0.42 };   // 용만 크게 빚었다(길이 4.2)
        function placeGift(gf) {
            if (gf.st) return null;   // 보관함에 넣어 둔 예물
            let sp = gf.x != null ? [gf.x, gf.z] : slots[gf.slot]; if (!sp) return null;   // 꾸미기로 옮겼으면 그 자리
            if (gf.x != null) {   // 성 안에는 못 둔다(꾸미기 decoSpot과 같은 규칙 — 이 함수가 먼저 돌아 여기서 직접)
                const need = HALF + RAMP_L + 0.15 + 0.7; let [x, z] = sp;
                if (Math.max(Math.abs(x), Math.abs(z)) < need) { if (Math.abs(x) >= Math.abs(z)) x = (x < 0 ? -1 : 1) * need; else z = (z < 0 ? -1 : 1) * need; }
                sp = [x, z];
            }
            const m = new THREE.Group(); m.position.set(sp[0], terrain(sp[0], sp[1]), sp[1]); m.rotation.y = gf.x != null ? (gf.r || 0) : Math.atan2(sp[0], sp[1]);   // 처음엔 성을 등지고 바깥을 본다
            m.userData.item = { kind: 'gift', id: gf.id, k: gf.k };
            const o = (typeof NJ_OFFERINGS !== 'undefined') ? NJ_OFFERINGS.find(x => x.k === gf.k) : null;
            m.userData.base = [1, 1, 1.3, 1.7][(o && o.size) || 1]; m.scale.setScalar(m.userData.base);   // 큰 예물은 크게
            loadGift(gf.k).then(sc => { if (cur !== C) return; const c = sc.clone(); c.scale.setScalar(GIFT_SCALE[gf.k] || 1); m.add(c); m.userData.anim = giftAnim(gf.k, c); })
                .catch(() => { if (cur === C) m.add(giftModel(gf.k)); });
            giftsG.add(m); return m;
        }
        ((typeof njGifts !== 'undefined' && Array.isArray(njGifts)) ? njGifts : []).forEach(placeGift);

        paintSea(seaW); buildEnvoys(seaW);
        if (typeof _seaFetch === 'function') _seaFetch().then(w => { if (cur === C && w) { paintSea(w); buildEnvoys(w); } });

        // ── 고급에서만: 빛줄기 · 빛 알갱이 · 풀잎 ──
        const extras = new THREE.Group(); scene.add(extras);
        let grassFollow = null;   // 🌿 발밑 풀밭 — 보는 곳 둘레에 깐다(아래 풀포기)
        // 🤿 물속 (10/2) — 화면 덮개 · 거품 · 안개 빛깔
        const UNDER_C = new THREE.Color(0x1d6a78).convertSRGBToLinear();
        let underView = false;
        const underEl = ov.querySelector('.nj3d-under'), diveBtn = ov.querySelector('.nj3d-divebtn');
        const BUB = 14, bubPos = new Float32Array(BUB * 3), bubG = new THREE.BufferGeometry(); bubG.setAttribute('position', new THREE.BufferAttribute(bubPos, 3));
        const bubbles = new THREE.Points(bubG, new THREE.PointsMaterial({ map: radial, color: 0xdff8ff, size: 0.016, transparent: true, opacity: 0.9, depthWrite: false }));  bubbles.frustumCulled = false; bubbles.visible = false; scene.add(bubbles);
        const shaft = (() => {
            const c = document.createElement('canvas'); c.width = 4; c.height = 128; const x = c.getContext('2d');
            const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,1)');
            x.fillStyle = g; x.fillRect(0, 0, 4, 128);
            const m = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 0.7, 10, 40, 1, true),
                new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), color: 0xfff2cf, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
            m.position.y = 5.2; return m;
        })();
        extras.add(shaft);
        const MOTES = 220, motePos = new Float32Array(MOTES * 3), moteSpd = new Float32Array(MOTES);
        { let sd = 3; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
          for (let n = 0; n < MOTES; n++) { const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 9;
            motePos[n * 3] = Math.cos(a) * d; motePos[n * 3 + 1] = r() * 10; motePos[n * 3 + 2] = Math.sin(a) * d; moteSpd[n] = 0.15 + r() * 0.35; } }
        const moteGeo = new THREE.BufferGeometry(); moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
        extras.add(new THREE.Points(moteGeo, new THREE.PointsMaterial({ size: 0.18, map: radial, color: 0xfff0c2, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
        {   // 🌿 풀포기 (10/2 사용자: 풀이 한 가닥씩 듬성듬성 → 풀밭으로) — 가는 잎 다섯이 부채처럼 모인 작은 포기, 무리지어 촘촘히. 기본 화질 9천 · 고급 화질 1.8만
            const tuft = (() => {
                const P = [], I = []; let vi = 0;
                for (let k = 0; k < 5; k++) {
                    const a = k / 5 * Math.PI * 2 + 0.3, lean = 0.45 + (k % 2) * 0.2, w = 0.0055, h = 0.026 + (k % 3) * 0.009;   // 순례자(0.22)의 발목쯤 — 처음엔 무릎까지 와서 줄였다
                    const dx = Math.cos(a), dz = Math.sin(a), px = -dz * w, pz = dx * w;
                    P.push(-px, 0, -pz, px, 0, pz, dx * lean * h, h, dz * lean * h);   // 잎 하나 = 밑이 넓고 끝이 뾰족한 세모, 바깥으로 눕는다
                    I.push(vi, vi + 1, vi + 2); vi += 3;
                }
                const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
            })();
            const mk = (N, seed, parent) => {
                const m = new THREE.InstancedMesh(tuft, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, side: THREE.DoubleSide }), N);
                let sd = seed; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
                const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
                let n = 0;
                while (n < N) {   // 풀숲 하나 = 포기 10~30
                    const a = r() * Math.PI * 2, d = 6.8 + Math.pow(r(), 0.75) * 30, cx = Math.cos(a) * d, cz = Math.sin(a) * d;
                    if (Math.abs(cx) < 1.4 || Math.abs(cz) < 1.4) continue;
                    const cnt = 25 + Math.floor(r() * 40), hue = 0.27 + r() * 0.07, rad = 0.3 + r() * 0.6;
                    for (let k = 0; k < cnt && n < N; k++) {
                        const ang = r() * 6.28, rr = Math.sqrt(r()) * rad, x = cx + Math.cos(ang) * rr, z = cz + Math.sin(ang) * rr;
                        if (Math.abs(x) < 1.25 || Math.abs(z) < 1.25 || (Math.abs(x) < 7.6 && Math.abs(z) < 7.6) || seaE(x, z) < 1.5) continue;
                        const s2 = 0.8 + r() * 0.6;
                        e.set(0, r() * 6.28, 0); q.setFromEuler(e); v.set(x, WT(x, z) - 0.003, z); sc.set(s2, s2 * (0.8 + r() * 0.5), s2); m4.compose(v, q, sc); m.setMatrixAt(n, m4);
                        col.setHSL(hue + (r() - 0.5) * 0.03, 0.5 + r() * 0.2, 0.3 + r() * 0.12); m.setColorAt(n, col);
                        n++;
                    }
                }
                m.receiveShadow = true; parent.add(m); return m;
            };
            mk(2500, 5, scene);      // 멀리서도 보이는 풀숲 무리(기본 화질에도)
            // 발밑 풀밭 — 세계가 넓어 전체를 촘촘히 깔 수 없다(순례자 키 0.22). 보는 곳 둘레 반지름 5에만 빽빽이 깔고, 반 칸(0.5)을 옮길 때마다 다시 깐다.
            // 칸마다 같은 씨앗이라 돌아와도 같은 자리에 같은 풀. 고급 화질 약 4천 포기 · 기본 2천(10/4 밤 절반으로)
            const FN = 8000, FR = 5, CELL = 0.5;   // 10/4 밤: 1.4만 → 8천(칸당 포기 수를 절반으로 — 사용자: 성 밖에서 여전히 끊긴다, 풀이 너무 많다)
            const near = new THREE.InstancedMesh(tuft, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, side: THREE.DoubleSide }), FN);
            near.setColorAt(0, new THREE.Color(0x5a8a3a));   // 색 버퍼를 처음부터 — 없이 그리면 셰이더가 색 없이 굳어 풀이 하얗게 나왔다
            near.frustumCulled = false; near.count = 0; scene.add(near);
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color(), up = new THREE.Vector3(0, 1, 0);
            // 🔧 10/4 잔렉: 반 칸마다 1.4만 포기를 통째로 다시 계산했다 — 노트북 실측 한 번 5.8ms(최대 11ms), 달리면 초당 3.5번 → 폰에선 20~50ms 멈칫이 계속 끼었다.
            //    칸마다 한 번 계산한 풀(행렬·색)을 기억해 두고, 다시 깔 때는 기억한 것을 이어 붙이기만 한다. 새로 들어온 칸(한 줄 약 21칸)만 계산
            const cellCache = new Map(); let cacheQ = '';
            const MA = near.instanceMatrix.array, CA = near.instanceColor.array;
            function cellGrass(ix, iz, per) {
                const ck = ix + ',' + iz; let c = cellCache.get(ck); if (c) return c;
                let sd = ((ix * 73856093) ^ (iz * 19349663)) >>> 0; sd = sd % 2147483646 + 1;
                const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
                const patch = r(), k = Math.floor(per * (patch < 0.18 ? 0.15 : patch < 0.5 ? 0.7 : 1.15)), hue = 0.27 + r() * 0.06;   // 풀이 짙은 데·성긴 데
                const mm = new Float32Array(k * 16), cc = new Float32Array(k * 3); let n = 0;
                for (let j = 0; j < k; j++) {
                    const x = (ix + r()) * CELL, z = (iz + r()) * CELL;
                    if (Math.abs(x) < 7.6 && Math.abs(z) < 7.6) continue;   // 성과 경사로
                    if (seaE(x, z) < 1.45 || wetAt(x, z)) continue;          // 바다·모래사장·강 (10/4 밤: 1.05 — 물 바로 앞까지 풀이 자랐다)
                    const s2 = 0.8 + r() * 0.7;
                    q.setFromAxisAngle(up, r() * 6.28); v.set(x, terrain(x, z) - 0.003, z); sc.set(s2, s2 * (0.8 + r() * 0.6), s2); m4.compose(v, q, sc); m4.toArray(mm, n * 16);
                    col.setHSL(hue + (r() - 0.5) * 0.03, 0.5 + r() * 0.2, 0.3 + r() * 0.12); cc[n * 3] = col.r; cc[n * 3 + 1] = col.g; cc[n * 3 + 2] = col.b;
                    n++;
                }
                c = { m: mm.subarray(0, n * 16), c: cc.subarray(0, n * 3), n, ix, iz };
                cellCache.set(ck, c); return c;
            }
            let lastKey = '';
            grassFollow = (px, pz, force) => {
                const ix0 = Math.floor(px / CELL), iz0 = Math.floor(pz / CELL), key = ix0 + ',' + iz0 + (HIGH ? 'h' : 'b');
                if (key === lastKey && !force) return; lastKey = key;
                const per = HIGH ? 24 : 14, R = Math.ceil(FR / CELL), qk = HIGH ? 'h' : 'b'; let n = 0;
                if (qk !== cacheQ) { cellCache.clear(); cacheQ = qk; }   // 화질이 바뀌면 칸마다 포기 수가 달라진다
                for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
                    if (dx * dx + dz * dz > R * R) continue;
                    const c = cellGrass(ix0 + dx, iz0 + dz, per);
                    if (!c.n || n + c.n > FN) continue;
                    MA.set(c.m, n * 16); CA.set(c.c, n * 3); n += c.n;
                }
                if (cellCache.size > 1600) cellCache.forEach((c, k) => { if (Math.abs(c.ix - ix0) > 2 * R || Math.abs(c.iz - iz0) > 2 * R) cellCache.delete(k); });   // 멀리 떠난 칸은 잊는다
                near.count = n;
                // 쓰는 앞부분만 그래픽 칩으로 보낸다 — 전엔 다시 깔 때마다 버퍼 전체(약 1MB)를 보냈다
                near.instanceMatrix.updateRange.offset = 0; near.instanceMatrix.updateRange.count = n * 16; near.instanceMatrix.needsUpdate = true;
                near.instanceColor.updateRange.offset = 0; near.instanceColor.updateRange.count = n * 3; near.instanceColor.needsUpdate = true;
            };
            grassFollow.mesh = near;
        }
        extras.visible = HIGH;

        // ── 순례자 (계 7:9 흰 옷) — 성벽 높이의 1/14쯤 ──
        const CH = 0.22, CR = 0.07, STEP = 0.14, G = 4.2, JUMP_V = 1.55, WALK_V = 0.95, RUN_V = 1.75;
        const P = { x: 1.3, y: 0, z: 9.2, vy: 0, onGround: true, face: Math.PI };
        let deco = null;   // 🛠️ 꾸미기 중이면 상태(아래 「꾸미기」)
        let camOff = null;   // 걷기 카메라 — 순례자에서 카메라까지(이것만 부드럽게 따라간다)
        let fpView = false; try { fpView = localStorage.getItem('kingsRoad_nj3dFP') === '1'; } catch (e) { }   // 👁 1인칭
        const viewBtn = ov.querySelector('.nj3d-viewbtn');
        const syncViewBtn = () => { viewBtn.textContent = T(fpView ? 'nj3d_view_tp' : 'nj3d_view_fp'); };
        syncViewBtn();
        viewBtn.addEventListener('click', () => { fpView = !fpView; try { localStorage.setItem('kingsRoad_nj3dFP', fpView ? '1' : '0'); } catch (e) { } syncViewBtn(); if (!fpView) body.visible = true; lastTouch = performance.now(); });
        const slideBtn = ov.querySelector('.nj3d-slidebtn');
        let slide = null, slideCheckT = 0;   // 🛝 생명수 미끄럼 — 남쪽 강을 타고 바다까지 { v 빠르기, t, sp 물보라 }
        // 🛝 속도감 (10/5 사용자: 빠르기는 그대로, 속도감만) — 시야 넓히기 · 물보라 · 화면 가장자리 바람 선 · 흐르는 물·바람 소리. 화면 흔들기는 뺐다(떨림을 싫어했다)
        let fovBoost = 0, slideSnd = null, slideK = 0;
        const speedEl = ov.querySelector('.nj3d-speed');
        const slideSndStop = () => { if (slideSnd) { slideSnd.stop(); slideSnd = null; } };
        cleanups.push(slideSndStop);
        listen(document, 'visibilitychange', () => { if (document.hidden) slideSndStop(); });   // 화면을 떠나면 물소리도 멈춘다(돌아오면 미끄럼이 다시 켠다)
        const SPRAY = 70, sprayPos = new Float32Array(SPRAY * 3), sprayVel = new Float32Array(SPRAY * 3), sprayLife = new Float32Array(SPRAY);
        const sprayGeo = new THREE.BufferGeometry(); sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
        const spray = new THREE.Points(sprayGeo, new THREE.PointsMaterial({ map: radial, color: 0xf2fbff, size: 0.05, transparent: true, opacity: 1, depthWrite: false }));
        spray.frustumCulled = false; spray.visible = false; scene.add(spray);
        for (let i = 0; i < SPRAY; i++) sprayPos[i * 3 + 1] = -999;
        let sprayN = 0, sprayAcc = 0;
        function sprayBurst(x, y, z, n, vz) {   // 풍덩 — 들어간 자리에서 물방울이 위로 크게 솟구친다
            for (let q = 0; q < n; q++) {
                const i = sprayN++ % SPRAY, a = Math.random() * Math.PI * 2, r = 0.4 + Math.random() * 0.9;
                sprayPos[i * 3] = x + Math.cos(a) * 0.05; sprayPos[i * 3 + 1] = y; sprayPos[i * 3 + 2] = z + Math.sin(a) * 0.05;
                sprayVel[i * 3] = Math.cos(a) * r; sprayVel[i * 3 + 1] = 1.4 + Math.random() * 1.4; sprayVel[i * 3 + 2] = Math.sin(a) * r + vz * 0.2;
                sprayLife[i] = 0.7 + Math.random() * 0.4;
            }
            spray.visible = true;
        }
        let plungeMom = null;   // 🌊 풍덩한 뒤 물속으로 나아가는 기세 { vz } — 점점 준다
        function sprayTick(dt, emit) {   // 순례자 양옆·뒤로 튀는 물방울 — 빠를수록 많이
            sprayAcc += emit * dt;
            while (sprayAcc >= 1) {
                sprayAcc -= 1; const i = sprayN++ % SPRAY, side = Math.random() < 0.5 ? -1 : 1;
                sprayPos[i * 3] = P.x + side * 0.06; sprayPos[i * 3 + 1] = P.y + 0.03; sprayPos[i * 3 + 2] = P.z + 0.02;
                sprayVel[i * 3] = side * (0.4 + Math.random() * 0.6); sprayVel[i * 3 + 1] = 0.6 + Math.random() * 0.7; sprayVel[i * 3 + 2] = (slide ? slide.v : 0) * (0.35 + Math.random() * 0.3);   // 강물보다 덜 빨라 뒤로 처진다
                sprayLife[i] = 0.5 + Math.random() * 0.25;
            }
            let live = false;
            for (let i = 0; i < SPRAY; i++) {
                if (sprayLife[i] <= 0) continue;
                sprayLife[i] -= dt; if (sprayLife[i] <= 0) { sprayPos[i * 3 + 1] = -999; continue; }
                live = true; sprayVel[i * 3 + 1] -= 3.2 * dt;
                sprayPos[i * 3] += sprayVel[i * 3] * dt; sprayPos[i * 3 + 1] += sprayVel[i * 3 + 1] * dt; sprayPos[i * 3 + 2] += sprayVel[i * 3 + 2] * dt;
            }
            spray.visible = live; if (live) sprayGeo.attributes.position.needsUpdate = true;
        }
        let walk = false, jetOn = false, camYaw = 0, camPitch = 0.12, camDist = 0.95, walkT = 0, gait = 0;
        // 팔다리가 있는 순례자 (9/29) — 엉덩이·어깨를 축으로 흔들어 걷기·달리기·점프·날기 자세를 만든다. 앞은 -z
        const pilgrim = new THREE.Group(), body = new THREE.Group(); pilgrim.add(body);
        const limbs = {};
        {
            // 10/2 사용자: 캐릭터도 좀 더 정성 들여 — 크기(키 0.22)·팔다리 축(hipL/R·armL/R)은 그대로, 생김새만.
            // 아래로 퍼지는 흰 겉옷(계 7:9)과 옷깃 · 금빛 띠와 늘어진 술 · 눈·볼·앞머리 · 끝이 넓어지는 소매 · 끈 달린 샌들
            const M = (c, r = 0.7, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r }, o));
            const white = M(0xfbf8f0, 0.6), whiteSh = M(0xe9e2d2, 0.7), skin = M(0xf1d3b3, 0.65), cloth = M(0xeee6d8, 0.8), sandal = M(0x8a5a34, 0.8);
            const gold = M(0xf2c14e, 0.3, { metalness: 0.6 }), hairM = M(0x4a2f1c, 0.8), eyeM = new THREE.MeshBasicMaterial({ color: 0x2a1e18 }), cheekM = new THREE.MeshBasicMaterial({ color: 0xf2a8a0, transparent: true, opacity: 0.7 });
            // 겉옷 — 어깨에서 밑단으로 퍼지는 돌림체, 밑단은 살짝 물결
            const prof = [[0.026, 0.168], [0.032, 0.16], [0.034, 0.14], [0.036, 0.128], [0.042, 0.11], [0.05, 0.085], [0.058, 0.066], [0.06, 0.062]].reverse().map(([r, y]) => new THREE.Vector2(r, y));   // 밑단부터 — 위에서부터 주면 면이 안쪽을 봐 겉옷이 안 보였다
            const robeG = new THREE.LatheGeometry(prof, 20);
            { const pa = robeG.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i); if (y < 0.07) { const x = pa.getX(i), z = pa.getZ(i), a = Math.atan2(z, x); pa.setY(i, y + Math.sin(a * 6) * 0.003); } } robeG.computeVertexNormals(); }
            const robe = new THREE.Mesh(robeG, white); body.add(robe);
            const hem = new THREE.Mesh(new THREE.TorusGeometry(0.059, 0.003, 6, 28), gold); hem.rotation.x = Math.PI / 2; hem.position.y = 0.064; body.add(hem);   // 밑단 금선
            const collar = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 20), whiteSh); collar.rotation.x = Math.PI / 2; collar.position.y = 0.168; body.add(collar);
            const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.013, 0.02, 10), skin); neck.position.y = 0.176; body.add(neck);
            const sash = new THREE.Mesh(new THREE.TorusGeometry(0.037, 0.0055, 8, 24), gold); sash.rotation.x = Math.PI / 2; sash.position.y = 0.127; body.add(sash);
            [-1, 1].forEach(sg => {   // 띠에서 늘어진 술 둘 — 옆구리
                const t = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0035, 0.034, 5), gold); t.position.set(sg * 0.012 + 0.03, 0.108, -0.016); t.rotation.z = sg * 0.12; body.add(t);
                const k = new THREE.Mesh(new THREE.SphereGeometry(0.0045, 6, 4), gold); k.position.set(sg * 0.012 + 0.03, 0.09, -0.016); body.add(k);
            });
            // 머리 — 얼굴·눈·볼·머리카락(앞머리)
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.032, 18, 14), skin); head.position.y = 0.205; head.scale.set(1, 1.04, 1); body.add(head);
            [-1, 1].forEach(sg => {
                const eye = new THREE.Mesh(new THREE.SphereGeometry(0.0046, 8, 6), eyeM); eye.position.set(sg * 0.0115, 0.204, -0.0295); eye.scale.set(1, 1.3, 0.6); body.add(eye);
                const ck = new THREE.Mesh(new THREE.CircleGeometry(0.006, 10), cheekM); ck.position.set(sg * 0.019, 0.196, -0.0282); ck.rotation.y = sg * -0.6; body.add(ck);
                const ear = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 6), skin); ear.position.set(sg * 0.031, 0.205, 0.002); ear.scale.set(0.6, 1, 0.8); body.add(ear);
            });
            const hair = new THREE.Mesh(new THREE.SphereGeometry(0.0345, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), hairM); hair.position.set(0, 0.207, 0.003); body.add(hair);
            const back = new THREE.Mesh(new THREE.SphereGeometry(0.033, 14, 10, Math.PI * 0.15, Math.PI * 0.7, Math.PI * 0.4, Math.PI * 0.35), hairM); back.position.set(0, 0.207, 0.003); back.rotation.y = Math.PI; body.add(back);   // 뒷머리
            for (let k = -2; k <= 2; k++) {   // 앞머리 — 이마에 내린 머리 다섯 갈래
                const f = new THREE.Mesh(new THREE.ConeGeometry(0.0075, 0.011, 5), hairM); f.position.set(k * 0.0085, 0.2285 - Math.abs(k) * 0.002, -0.0275 + Math.abs(k) * 0.002);   // 처음엔 길어 눈을 덮었다 f.rotation.x = Math.PI + 0.5; f.rotation.z = -k * 0.15; body.add(f);
            }
            [-1, 1].forEach(sg => {
                const hip = new THREE.Group(); hip.position.set(sg * 0.017, 0.075, 0); body.add(hip);
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.01, 0.07, 8), cloth); leg.position.y = -0.035; hip.add(leg);
                const foot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.009, 0.036), sandal); foot.position.set(0, -0.07, -0.007); hip.add(foot);
                [-0.012, 0.004].forEach(zz => { const st = new THREE.Mesh(new THREE.TorusGeometry(0.0105, 0.0018, 4, 10, Math.PI), sandal); st.position.set(0, -0.0655, -0.007 + zz); st.rotation.y = Math.PI / 2; hip.add(st); });   // 샌들 끈
                const sh = new THREE.Group(); sh.position.set(sg * 0.036, 0.158, 0); body.add(sh);
                const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.016, 0.066, 10), white); arm.position.y = -0.033; sh.add(arm);   // 끝이 넓어지는 소매
                const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.0155, 0.0022, 5, 14), gold); cuff.rotation.x = Math.PI / 2; cuff.position.y = -0.064; sh.add(cuff);
                const hand = new THREE.Mesh(new THREE.SphereGeometry(0.0098, 10, 8), skin); hand.position.y = -0.074; sh.add(hand);
                limbs[sg < 0 ? 'hipL' : 'hipR'] = hip; limbs[sg < 0 ? 'armL' : 'armR'] = sh;
            });
        }
        // 물결 고리 — 물길에서 발을 디디면 퍼진다
        const ripples = [];
        {
            const rg = new THREE.RingGeometry(0.03, 0.042, 24); rg.rotateX(-Math.PI / 2);
            for (let n = 0; n < 8; n++) {
                const m = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0xe8fbff, transparent: true, opacity: 0, depthWrite: false }));
                m.visible = false; scene.add(m); ripples.push({ m, t: 1, big: false });
            }
        }
        let ripN = 0;
        const splash = (x, z, big, quiet) => {
            const d = Math.max(Math.abs(x), Math.abs(z)), base = seaE(x, z) < 1 ? SEA_Y - WL : d <= PL ? 0 : WT(x, z);
            const r = ripples[ripN++ % ripples.length]; r.t = 0; r.big = big; r.m.position.set(x, base + WL + 0.004, z); r.m.visible = true;
            if (!quiet && typeof SoundEffect !== 'undefined' && SoundEffect.playSplash) SoundEffect.playSplash(big);
        };
        const walletEl = ov.querySelector('.nj3d-wallet');
        const syncWallet = () => {
            if (!walletEl) return;
            const fish = typeof _njFishAvail === 'function' ? _njFishAvail() : 0;
            walletEl.innerHTML = `<span>💎 ${Number(typeof myGems !== 'undefined' ? myGems : 0).toLocaleString()}</span><span>🍃 ${typeof _njLeavesAvail === 'function' ? _njLeavesAvail() : 0}</span>${fish ? `<span>🐟 ${fish}</span>` : ''}`;
        };
        syncWallet();
        // 글라이더 (9/30) — 점프한 채로 점프를 한 번 더: 날개가 펼쳐져 천천히 활강, 또 누르면 접힌다. 땅에 닿으면 접힌다. 값은 없다
        // 🪂 글라이더·등 날개 (10/2) — 종류마다 모양이 다르다(도형으로 그린다, 모델 파일 없음). 글라이더는 머리 위로 들고, 등 날개는 걸을 땐 접혀 있다가 활강할 때 펼쳐 퍼덕인다
        const glider = new THREE.Group(); glider.position.set(0, 0.3, 0.01); glider.visible = false; body.add(glider);
        const backWings = new THREE.Group(); backWings.position.set(0, 0.155, 0.03); backWings.visible = false; body.add(backWings);
        let gliding = false, wingK = null, wingKind = 'glider', wingFx = null;
        const triGeo = (pts, idx) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); g.setIndex(idx); g.computeVertexNormals(); return g; };
        const wingMat = (c, em, ei) => new THREE.MeshStandardMaterial({ color: c, emissive: em || 0x000000, emissiveIntensity: ei || 0, roughness: 0.45, metalness: 0.2, side: THREE.DoubleSide });
        const wingSparks = (n, col) => {   // 반짝이는 알갱이 — 날개 뒤로 흘러 사라진다
            const pos = new Float32Array(n * 3), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const p = new THREE.Points(g, new THREE.PointsMaterial({ map: radial, color: col, size: 0.03, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending })); p.frustumCulled = false;
            const seed = [...Array(n)].map(() => [Math.random(), (Math.random() - 0.5), Math.random()]);
            return { p, step: (t, span, on) => { p.visible = on; if (!on) return; seed.forEach(([a, b, c], i) => { const u = (t * 0.8 + a) % 1; pos[i * 3] = b * span; pos[i * 3 + 1] = -u * 0.06 + c * 0.02; pos[i * 3 + 2] = 0.05 + u * 0.25; }); g.attributes.position.needsUpdate = true; } };
        };
        function makeGlider(k) {   // 머리 위 활강 날개 — 앞(−z)이 뾰족한 삼각
            const G2 = new THREE.Group();
            const D = [0, 0, -0.2, -0.34, 0, 0.12, 0.34, 0, 0.12, 0, 0.035, 0.05], I = [0, 1, 3, 0, 3, 2, 1, 2, 3];
            if (k === 'olive') {   // 감람 잎(창 8:11) — 길쭉한 잎, 가운데 잎맥
                const pts = [0, 0.03, -0.02], idx = [], N = 22;
                for (let i = 0; i <= N; i++) { const u = i / N * Math.PI * 2, z = -0.02 - Math.cos(u) * 0.2, x = Math.sin(u) * 0.3 * Math.pow(Math.abs(Math.sin(u)), 0.15) * (1 - 0.25 * Math.cos(u)); pts.push(x, 0, z); if (i) idx.push(0, i, i + 1); }
                G2.add(new THREE.Mesh(triGeo(pts, idx), wingMat(0x7aa34a, 0x223a10, 0.25)));
                const vein = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.006, 0.38), wingMat(0x4f7a30)); vein.position.set(0, 0.03, -0.02); G2.add(vein);
            } else if (k === 'rainbow') {   // 무지개(창 9:13) — 끝에서 뒤로 일곱 빛 띠
                const cols = [0xe74c3c, 0xf39c12, 0xf1c40f, 0x2ecc71, 0x3498db, 0x5b5bd6, 0x9b59b6], A = [0, 0, -0.2], Lc = [-0.34, 0, 0.12], Rc = [0.34, 0, 0.12];
                const at = (c, f) => [A[0] + (c[0] - A[0]) * f, 0.035 * Math.sin(f * Math.PI), A[2] + (c[2] - A[2]) * f];
                cols.forEach((c, i) => { const f0 = i / cols.length, f1 = (i + 1) / cols.length, a = at(Lc, f0), b = at(Rc, f0), d = at(Lc, f1), e = at(Rc, f1);
                    G2.add(new THREE.Mesh(triGeo([...a, ...b, ...d, ...e], [0, 2, 1, 1, 2, 3]), wingMat(c, c, 0.25))); });
            } else if (k === 'fire') {   // 불꽃 — 빛나는 주황 날개, 뒤로 불티
                G2.add(new THREE.Mesh(triGeo(D, I), wingMat(0xff8a3c, 0xff5a10, 0.9)));
                const edge = new THREE.Mesh(triGeo([-0.34, 0.002, 0.12, 0.34, 0.002, 0.12, 0, 0.004, 0.02], [0, 1, 2]), wingMat(0xffd27a, 0xffb040, 1.2)); G2.add(edge);
                const sp = wingSparks(24, 0xffb050); G2.add(sp.p); G2.userData.fx = (t, on) => sp.step(t, 0.6, on);
            } else G2.add(new THREE.Mesh(triGeo(D, I), wingMat(0xf6d77a, 0x6a4a10, 0.3)));   // 금빛(기본)
            G2.traverse(o => { if (o.isMesh) o.castShadow = false; });   // 순례자와 함께 — 굽는 그림자에서 뺀다
            return G2;
        }
        function makeBackWing(k) {   // 등 날개 한쪽(오른쪽 +x로 뻗는다) — 깃털 일곱이 부채처럼
            const g = new THREE.Group(), N = 7;
            for (let i = 0; i < N; i++) {
                const a = 0.55 - i * 0.2, L = 0.21 - i * 0.017, w = 0.034, f = i / (N - 1);
                const col = k === 'dawn' ? new THREE.Color(0xffc0d0).lerp(new THREE.Color(0xf6d77a), f) : k === 'light' ? new THREE.Color(0xffe27a) : new THREE.Color(0xf8f6f0);
                const geo = triGeo([0, 0, 0, L * 0.35, w / 2, 0, L, 0, 0, L * 0.35, -w / 2, 0], [0, 1, 2, 0, 2, 3]);
                const m = new THREE.Mesh(geo, wingMat(col, k === 'light' ? 0xffd060 : k === 'dawn' ? col.clone().multiplyScalar(0.3) : 0x000000, k === 'light' ? 0.9 : 0.3));
                m.rotation.z = a; m.position.z = i * 0.002; m.castShadow = false; g.add(m);
            }
            return g;
        }
        function equipWing() {   // 낀 날개가 바뀌었으면 다시 그린다
            const W = typeof _njWingOn === 'function' ? _njWingOn() : { k: 'gold', kind: 'glider' };
            if (W.k === wingK) return W;
            wingK = W.k; wingKind = W.kind; wingFx = null;
            [...glider.children].forEach(c => glider.remove(c)); [...backWings.children].forEach(c => backWings.remove(c));
            if (W.kind === 'glider') { const g = makeGlider(W.k); glider.add(g); wingFx = g.userData.fx || null; }
            else {
                const R = makeBackWing(W.k), Lw = makeBackWing(W.k); Lw.scale.x = -1;
                const pR = new THREE.Group(), pL = new THREE.Group(); pR.position.x = 0.02; pL.position.x = -0.02; pR.add(R); pL.add(Lw); backWings.add(pR, pL);
                backWings.userData.p = [pR, pL];
                if (W.k === 'light') { const sp = wingSparks(28, 0xffe08a); backWings.add(sp.p); wingFx = (t, on) => sp.step(t, 0.5, on); }
            }
            return W;
        }
        const jet = new THREE.Group(); body.add(jet);
        const jm = new THREE.MeshStandardMaterial({ color: 0xd4a53a, metalness: 0.8, roughness: 0.25 });
        [-1, 1].forEach(sg => { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.075, 12), jm); c.position.set(sg * 0.018, 0.13, 0.03); jet.add(c); });
        const flameMat = new THREE.SpriteMaterial({ map: radial, color: 0xff9a3c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
        const flames = [-1, 1].map(sg => { const f = new THREE.Sprite(flameMat); f.position.set(sg * 0.018, 0.075, 0.03); f.scale.set(0.05, 0.08, 1); jet.add(f); return f; });
        pilgrim.traverse(o => { if (o.isMesh) o.castShadow = true; });
        pilgrim.position.set(P.x, P.y, P.z); pilgrim.visible = false; scene.add(pilgrim);
        const hasJet = () => typeof njJetpack !== 'undefined' && !!njJetpack;
        jet.visible = hasJet();

        // 땅 높이 — 기초석 단과 문 경사로
        function bandHeight(x, z) {
            const ax = Math.abs(x), az = Math.abs(z), d = Math.max(ax, az);
            if (d > HALF + RAMP_L || found === 0) return 0;
            const side = az >= ax ? (z < 0 ? 'N' : 'S') : (x > 0 ? 'E' : 'W');
            const tt = (side === 'N' || side === 'S') ? x : z;
            const i = Math.max(0, Math.min(2, Math.floor((tt + HALF) / SEG)));
            const k = SEQ.findIndex(([sd, ii]) => sd === side && ii === i);
            if (k < 0 || k >= found) return 0;
            const g = (i - 1) * GATE_GAP, inSlot = Math.abs(tt - g) < RAMP_W / 2, IN = HALF - 1.05;
            if (inSlot) {
                if (d >= HALF) return FH * Math.max(0, (HALF + RAMP_L - d) / RAMP_L);
                if (d >= IN) return FH;
                if (d >= IN - RAMP_L) return FH * (d - (IN - RAMP_L)) / RAMP_L;
                return 0;
            }
            return (d >= IN && d <= HALF) ? FH : 0;
        }
        // 물길 깊이 — 두 축을 따라 파여 있다(보좌 둘레는 네모 샘). 0 ~ -RD
        function riverDip(x, z) {
            const ax = Math.abs(x), az = Math.abs(z);
            if (ax < RB && az < RB) return -RD;
            const u = Math.min(ax, az);
            if (u >= RB) return 0;
            return u <= RW ? -RD : -RD * (RB - u) / (RB - RW);
        }
        // 땅 높이 — 기초석 단·경사로 > 정금 길(물길 위로는 다리) > 물길 > 정금 바닥 / 풀밭
        function terrain(x, z) {
            const ax0 = Math.abs(x), az0 = Math.abs(z);
            if (Math.max(ax0, az0) > PL) {   // 산마루 밖 — 비탈·벌판, 강은 파여 있고, 바다 위는 수면(들어가지는 못한다)
                if (seaE(x, z) < 1) return SEA_Y + 0.02;
                let dip = 0;
                if (ax0 < RB && z < SHORE) dip = stripDip(ax0);
                if (az0 < RB) dip = Math.min(dip, stripDip(az0));
                return WT(x, z) + dip;
            }
            const band = bandHeight(x, z); if (band > 0) return band;
            const ax = Math.abs(x), az = Math.abs(z), inner = ax < IN_F && az < IN_F;
            if (inner && (Math.abs(ax - GATE_GAP) < 0.275 || Math.abs(az - GATE_GAP) < 0.275)) return 0.09;
            const dip = riverDip(x, z);
            if (dip < 0) return dip;
            return inner ? 0.04 : 0;
        }
        /* 🌑 발밑 그림자 (10/4) — 순례자·탈것·예물 행렬처럼 빠르게 움직이고 카메라 가까이 있는 것은 굽는 그림자(초당 8번)에서 빼고
           발밑에 둥근 그늘을 단다. 늘 매끄럽게 따라오고, 그림자가 없는 「기본」 화질에서도 땅에 붙어 보인다. 높이 뜰수록 넓고 옅어진다 */
        const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
            const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,0.62)'); g.addColorStop(0.55, 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
            x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
        const blobG = new THREE.PlaneGeometry(1, 1); blobG.rotateX(-Math.PI / 2);
        const blobs = [];
        function addBlob(obj, d, when) {   // d = 지름(없으면 모양에서 잰다) · when() = 이때만 보인다
            // 그리는 순서: 땅(0) → 그늘(1) → 그늘 임자(2). 그늘을 길보다 높은 풀밭 높이로 올려도 발은 그늘 위에 그려진다(10/4 스크린샷: 발을 덮었다)
            //   투명 단계는 늘 불투명 뒤라 순서를 못 정한다 → 불투명 단계에서 직접 섞는다(CustomBlending)
            const m = new THREE.Mesh(blobG, new THREE.MeshBasicMaterial({ map: blobTex, transparent: false, blending: THREE.CustomBlending,
                blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor, depthWrite: false, fog: true }));
            m.renderOrder = 1; m.visible = false; scene.add(m);
            const mark = () => obj.traverse(o => { o.renderOrder = 2; if (o.isMesh) o.castShadow = false; });   // 굽는 그림자에서 빼고, 그늘 뒤에 그린다(묶음 안 묶음까지)
            mark();
            blobs.push({ obj, d: d || 0, when, m, mark });
        }
        const _bv = new THREE.Vector3(), _bb = new THREE.Box3();
        // 👀 세트 조각 감시 — 양·목자·배·그물·수레·신랑 행렬처럼 스스로 움직이는 조각은 한 번이라도 움직이면 발밑 그늘로 바꾼다(굽는 그림자에서 뺀다).
        //    연출마다 누가 움직이는지 하나하나 적지 않아도 되게(10/4)
        const watch = [];
        const watchMove = o => { if (o && !o.userData.blob) watch.push({ o, x: o.position.x, z: o.position.z }); };
        function watchTick() {
            for (let i = watch.length - 1; i >= 0; i--) {
                const w = watch[i];
                if (!w.o.parent) { watch.splice(i, 1); continue; }
                if (Math.abs(w.o.position.x - w.x) + Math.abs(w.o.position.z - w.z) > 0.004) { w.o.userData.blob = true; addBlob(w.o, 0); watch.splice(i, 1); }
            }
        }
        const shownChain = o => { for (let q = o; q; q = q.parent) { if (!q.visible) return false; if (q === scene) return true; } return false; };
        function blobTick() {
            for (let i = blobs.length - 1; i >= 0; i--) {
                const b = blobs[i];
                if (!b.obj.parent) { if (++b.gone > 300) { scene.remove(b.m); b.m.material.dispose(); blobs.splice(i, 1); } else b.m.visible = false; continue; }
                b.gone = 0;
                if (!shownChain(b.obj) || (b.when && !b.when())) { b.m.visible = false; continue; }
                if (!b.d) { _bb.setFromObject(b.obj); if (_bb.isEmpty()) { b.m.visible = false; continue; } b.d = Math.max(_bb.max.x - _bb.min.x, _bb.max.z - _bb.min.z) * 1.05; b.mark(); }   // 긴 쪽 — 말·낙타는 몸통이 길어 앞에서 보면 그늘이 몸에 가렸다
                b.obj.getWorldPosition(_bv);
                const g = groundAt(_bv.x, _bv.z, _bv.y), h = Math.max(0, _bv.y - g);
                if (!isFinite(g) || h > 5) { b.m.visible = false; continue; }
                const sc = b.d * (1 + h * 0.25), r = sc * 0.4;
                let top = g;   // 그늘이 덮는 자리 중 가장 높은 땅 — 길보다 조금 높은 풀밭이 그늘 반쪽을 가리던 것(10/4 스크린샷)
                for (const [ox, oz] of [[r, 0], [-r, 0], [0, r], [0, -r]]) { const q = groundAt(_bv.x + ox, _bv.z + oz, _bv.y); if (isFinite(q) && q > top && q - g < 0.25) top = q; }
                b.m.scale.set(sc, 1, sc); b.m.position.set(_bv.x, top + 0.008, _bv.z);
                b.m.material.opacity = Math.max(0, 1 - h / 5); b.m.visible = true;
            }
        }
        function groundAt(x, z, y) {
            if (y < SEA_Y - 0.03 && seaE(x, z) < 1) return seabed(x, z);   // 🤿 물속 — 발밑은 바다 밑(수면이 아니라)
            let g = terrain(x, z);
            BOXES.forEach(b => { if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && b.y1 <= y + STEP && b.y1 > g) g = b.y1; });
            return g;
        }
        // 발이 물에 잠기는 곳(참방 소리) — 물길 바닥·비탈. 다리·기초석 위는 아니다
        function wetAt(x, z) {
            const ax = Math.abs(x), az = Math.abs(z);
            if (Math.max(ax, az) > PL) {
                if (seaE(x, z) < 1) return 'sea';   // 바다 위를 걷는다 — 발밑에 물결(느려지지는 않는다)
                return (ax < RB && z < SHORE && stripDip(ax) < -0.02) || (az < RB && stripDip(az) < -0.02);
            }
            if (bandHeight(x, z) > 0) return false;
            if (ax < IN_F && az < IN_F && (Math.abs(ax - GATE_GAP) < 0.275 || Math.abs(az - GATE_GAP) < 0.275)) return false;
            return riverDip(x, z) < -0.02;
        }
        // 풀밭 — 산마루 밖 비탈·벌판(바다·강 빼고)과 성벽 안 정금 바닥 바깥. 기초석 단·상자 위는 아니다 (사각사각 소리)
        function grassAt(x, z, y) {
            if (wetAt(x, z)) return false;
            if (groundAt(x, z, y) > terrain(x, z) + 0.01) return false;   // 무언가 위에 올라서 있다
            const ax = Math.abs(x), az = Math.abs(z);
            if (Math.max(ax, az) > PL) return true;
            return bandHeight(x, z) <= 0 && !(ax < IN_F && az < IN_F);
        }
        function blocked(x, z, y) {
            if (Math.abs(x) > 140 || z < -140 || z > 150) return true;
            if ((y < SEA_Y - 0.03 && seaE(x, z) < 1 ? seabed(x, z) : terrain(x, z)) - y > STEP) return true;   // 물속에선 바다 밑이 땅 — 수면을 땅으로 보면 물속에서 앞이 막혀 못 움직였다
            return BOXES.some(b => b.y1 > y + STEP && b.y0 < y + CH && x > b.x0 - CR && x < b.x1 + CR && z > b.z0 - CR && z < b.z1 + CR);
        }

        // ── 입력 ──
        const joy = ov.querySelector('.nj3d-joy'), knob = ov.querySelector('.nj3d-knob');
        const inp = { jx: 0, jy: 0, keys: {} };
        let joyId = null, lastTouch = performance.now(), touching = false;
        const moveJoy = e => {
            const r = joy.getBoundingClientRect(), R = r.width / 2 - 12;
            let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
            const m = Math.hypot(dx, dy); if (m > R) { dx *= R / m; dy *= R / m; }
            inp.jx = dx / R; inp.jy = dy / R; knob.style.transform = `translate(${dx}px, ${dy}px)`;
        };
        joy.addEventListener('pointerdown', e => { joyId = e.pointerId; joy.setPointerCapture(e.pointerId); moveJoy(e); });
        joy.addEventListener('pointermove', e => { if (e.pointerId === joyId) moveJoy(e); });
        const endJoy = e => { if (e.pointerId !== joyId) return; joyId = null; inp.jx = inp.jy = 0; knob.style.transform = ''; };
        joy.addEventListener('pointerup', endJoy); joy.addEventListener('pointercancel', endJoy);
        let lookId = null, lx = 0, ly = 0;
        const cvs = renderer.domElement;
        // 열매 누르기 — 짧게 톡 누른 곳에서 화면상 가장 가까운 열매(28px 안). 작은 열매도 누르기 쉽게 화면 거리로 고른다
        const fruitPanel = ov.querySelector('.nj3d-fruit');
        const hideFruit = () => { fruitPanel.hidden = true; };
        const showFruit = (f) => {
            const k = KINDS[f.kind] || { ko: '', en: '', color: '#d0383a' };
            const name = (typeof currentLang !== 'undefined' && currentLang === 'en') ? k.en : k.ko;
            const ref = (typeof _njVerseRef === 'function') ? _njVerseRef(f.id) : f.id, now = Date.now();
            let body;
            if (!f.ripe) body = `<div class="nj3d-fruit-sub">${T('nj_fruit_unripe', { d: Math.max(1, Math.ceil((f.ripeAt - now) / 86400000)) })}</div>`;
            else if (f.retryAt && now < f.retryAt) body = `<div class="nj3d-fruit-sub">${T('nj_fruit_retry')}</div>`;
            else body = `<button class="nj3d-eat">${T('nj_fruit_eat')}</button>`;
            fruitPanel.innerHTML = `<button class="nj3d-fruit-x" aria-label="close">✕</button>
                <div class="nj3d-fruit-head"><span class="nj3d-fruit-dot" style="background:${f.ripe ? k.color : '#e4f28a'}"></span><b>${name}</b><span>${ref}</span></div>${body}`;
            fruitPanel.hidden = false;
            fruitPanel.querySelector('.nj3d-fruit-x').onclick = hideFruit;
            const eat = fruitPanel.querySelector('.nj3d-eat');
            if (eat) eat.onclick = () => { if (typeof njEatFruit === 'function') njEatFruit(f.key); };
        };
        let tap = null;
        listen(cvs, 'pointerdown', e => { tap = { x: e.clientX, y: e.clientY, t: performance.now() }; });
        const natRay = new THREE.Raycaster();
        const showNation = (i) => {
            const en = typeof currentLang !== 'undefined' && currentLang === 'en';
            const N = (typeof SEA_NATIONS !== 'undefined' && SEA_NATIONS[i]) || ['', '', '', '', '', ''];
            const lv = (seaW && seaW.nations && seaW.nations[i] && seaW.nations[i].lv) || 0;
            const LV = (typeof SEA_LV_NAMES !== 'undefined') ? SEA_LV_NAMES[en ? 'en' : 'ko'] : [];
            fruitPanel.innerHTML = `<button class="nj3d-fruit-x" aria-label="close">✕</button>
                <div class="nj3d-fruit-head"><b>🏞️ ${en ? N[2] : N[0]}</b><span>${en ? N[5] + ' line' : N[4] + ' 가문'} · ${en ? N[3] : N[1]} · ${LV[lv] || ''}</span></div>
                <button class="nj3d-eat">${T('nj3d_nat_open')}</button>`;
            fruitPanel.hidden = false;
            fruitPanel.querySelector('.nj3d-fruit-x').onclick = hideFruit;
            fruitPanel.querySelector('.nj3d-eat').onclick = () => { closeNJ3D(); if (typeof openSea === 'function') { openSea(); _seaSel = i; _seaRender(); } };
        };
        listen(cvs, 'pointerup', e => {
            if (!tap) return;
            if (proc || deco) { tap = null; return; }   // 행렬을 돌려 보는 손길·꾸미기 — 열매·나라 창을 띄우지 않는다
            if (creatureTap(e)) { tap = null; return; }   // 🐠 물속 생물을 눌러 살펴봄
            if (!fruitPos.length) {   // 열매가 없으면 해안의 나라만 본다
                const moved = Math.hypot(e.clientX - tap.x, e.clientY - tap.y), long = performance.now() - tap.t;
                tap = null;
                if (moved > 10 || long > 450) return;
                const r = cvs.getBoundingClientRect();
                natRay.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
                const hit = natRay.intersectObject(natRing);
                if (hit.length) showNation(Math.floor(hit[0].faceIndex / NAT_FACES)); else hideFruit();
                return;
            }
            const moved = Math.hypot(e.clientX - tap.x, e.clientY - tap.y), long = performance.now() - tap.t;
            tap = null;
            if (moved > 10 || long > 450) return;
            const r = cvs.getBoundingClientRect(), pv = new THREE.Vector3();
            let best = -1, bd = 28;
            fruitPos.forEach((p, i) => {
                pv.copy(p).project(camera);
                if (pv.z > 1 || pv.z < -1) return;
                const sx = r.left + (pv.x + 1) / 2 * r.width, sy = r.top + (1 - pv.y) / 2 * r.height, d = Math.hypot(sx - e.clientX, sy - e.clientY);
                if (d < bd) { bd = d; best = i; }
            });
            if (best >= 0) { showFruit(fruitList[best]); return; }
            {   // 🎁 나눔 열매를 누르면 — 누가 보냈는지·지금 상태
                let gb = -1, gd = 34;
                giftPos.forEach((p, i) => { pv.copy(p).project(camera); if (pv.z > 1 || pv.z < -1) return; const sx = r.left + (pv.x + 1) / 2 * r.width, sy = r.top + (1 - pv.y) / 2 * r.height, d = Math.hypot(sx - e.clientX, sy - e.clientY); if (d < gd) { gd = d; gb = i; } });
                if (gb >= 0) { const f = giftList[gb]; showHint(T('nj3d_gift_tap', { from: f.from || '', st: T(f.ripe && Date.now() >= f.ripe ? 'gift_st_ripe' : 'nj3d_gift_wait') }), 3000); return; }
            }
            natRay.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
            const hit = natRay.intersectObject(natRing);
            if (hit.length) showNation(Math.floor(hit[0].faceIndex / NAT_FACES)); else hideFruit();
        });
        // 🤏 두 손가락으로 벌리고 오므리면 멀리·가까이 (10/4 사용자: 폰에선 걸을 때 화면 크기가 고정이었다 — 휠만 있었다).
        //    조이스틱은 화면 밖 단추라 엄지를 얹은 채 한 손가락으로 돌리는 건 그대로. 화면 위 두 손가락일 때만 확대·축소(돌리기는 멈춤)
        const wPts = new Map(); let wPinch0 = 0, wDist0 = 0;
        cvs.addEventListener('pointerdown', e => {
            if (!walk || proc) return;   // 행렬 중엔 행렬 카메라가 받는다
            wPts.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (wPts.size === 2) { const [a, b] = [...wPts.values()]; wPinch0 = Math.hypot(a.x - b.x, a.y - b.y); wDist0 = camDist; lookId = null; return; }
            lookId = e.pointerId; lx = e.clientX; ly = e.clientY;
        });
        cvs.addEventListener('pointermove', e => {
            if (!walk) return;
            if (wPts.has(e.pointerId)) wPts.set(e.pointerId, { x: e.clientX, y: e.clientY });
            if (wPts.size === 2 && wPinch0) {
                const [a, b] = [...wPts.values()];
                camDist = Math.max(0.45, Math.min(3, wDist0 * wPinch0 / Math.max(20, Math.hypot(a.x - b.x, a.y - b.y))));
                lastTouch = performance.now(); return;
            }
            if (e.pointerId !== lookId) return;
            camYaw -= (e.clientX - lx) * 0.006; camPitch = Math.max(-1.25, Math.min(1.2, camPitch + (e.clientY - ly) * 0.005));   // 음수 = 카메라가 발치로 내려가 하늘을 올려다본다
            lx = e.clientX; ly = e.clientY; lastTouch = performance.now();
        });
        const endLook = e => { wPts.delete(e.pointerId); if (wPts.size < 2) wPinch0 = 0; if (e.pointerId === lookId) lookId = null; };
        cvs.addEventListener('pointerup', endLook); cvs.addEventListener('pointercancel', endLook);
        cvs.addEventListener('wheel', e => { if (walk && !proc) { camDist = Math.max(0.45, Math.min(3, camDist * (e.deltaY > 0 ? 1.1 : 0.9))); e.preventDefault(); } }, { passive: false });
        let jumpHeld = false;   // 🦅 나는 탈것 — 점프를 누르고 있는 동안 떠오른다 · 🤿 물속에선 위로 헤엄
        let diveHeld = false, diveHintShown = false;   // 🤿 잠수 — 누르고 있는 동안 내려간다(버튼 또는 C 키)
        const isUnder = () => P.y < SEA_Y - 0.03 && seaE(P.x, P.z) < 1;
        const doJump = () => {
            if (slide) return;   // 미끄러지는 중엔 뛰지 않는다
            if (!ride.on && isUnder()) return;   // 물속 — 점프는 누르고 있는 동안 위로 헤엄(아래 walkUpdate)
            if (ride.on && kindOfMount(ride.k) === 'sub') return;   // 🚢 잠수함 — 누르는 동안 떠오른다
            if (ride.on && kindOfMount(ride.k) === 'fly') { const D = NJ_MOUNTS[ride.k] || {}; if (P.onGround) { P.vy = D.climb || 1; P.onGround = false; } return; }
            if (ride.on) {   // 🐴 탄 채로 — 땅에선 탈것째 뛰고, 공중에서 한 번 더 누르면 뛰어내려 글라이더
                if (kindOfMount(ride.k) === 'boat') { splash(P.x, P.z, true); return; }   // ⛵ 배에선 뛰지 않는다 — 물보라만
                if (P.onGround) { P.vy = JUMP_V * (NJ_MOUNTS[ride.k] || {}).jump || JUMP_V; P.onGround = false; return; }
                mountDown('leap'); return;
            }
            if (P.onGround) { P.vy = JUMP_V; P.onGround = false; return; }
            if (jetOn) return;
            gliding = !gliding;   // 공중에서 한 번 더 — 펼치기 / 접기
            if (gliding && P.vy < -0.2) P.vy = -0.2;
            showHint(T(gliding ? 'nj3d_glide_on' : 'nj3d_glide_off'), 1400);
        };
        listen(window, 'keydown', e => { if (!walk) return; inp.keys[e.code] = true; if (e.code === 'Space') { if (!e.repeat) { jumpHeld = true; doJump(); } e.preventDefault(); } if (e.code === 'Escape') closeNJ3D(); });
        listen(window, 'keyup', e => { inp.keys[e.code] = false; if (e.code === 'Space') jumpHeld = false; if (e.code === 'KeyC') diveHeld = false; });
        listen(window, 'keydown', e => { if (walk && e.code === 'KeyC') diveHeld = true; });
        { const db = ov.querySelector('.nj3d-divebtn');
          db.addEventListener('pointerdown', e => { e.preventDefault(); diveHeld = true; try { db.setPointerCapture(e.pointerId); } catch (_) {} });
          ['pointerup', 'pointercancel'].forEach(tp => db.addEventListener(tp, () => { diveHeld = false; })); }
        { const jb = ov.querySelector('.nj3d-jump');
          jb.addEventListener('pointerdown', e => { e.preventDefault(); jumpHeld = true; try { jb.setPointerCapture(e.pointerId); } catch (_) {} doJump(); });
          ['pointerup', 'pointercancel'].forEach(tp => jb.addEventListener(tp, () => { jumpHeld = false; })); }
        const flyBtn = ov.querySelector('.nj3d-fly'), jetBuy = ov.querySelector('.nj3d-jetbuy');
        flyBtn.addEventListener('pointerdown', e => { e.preventDefault(); jetOn = true; flyBtn.setPointerCapture(e.pointerId); });
        ['pointerup', 'pointercancel'].forEach(tp => flyBtn.addEventListener(tp, () => { jetOn = false; }));
        const syncJetUI = () => {
            const own = hasJet(); jet.visible = own; flyBtn.hidden = !own; jetBuy.hidden = own;
            jetBuy.innerHTML = T('nj3d_jet_buy', { cost: JET_COST.toLocaleString() });
        };
        jetBuy.addEventListener('click', () => {
            if (hasJet()) return syncJetUI();
            const gems = (typeof myGems !== 'undefined') ? myGems : 0;
            if (gems < JET_COST) { showHint(T('nj3d_jet_need', { n: (JET_COST - gems).toLocaleString() }), 2600); return; }
            if (!confirm(T('nj3d_jet_confirm', { cost: JET_COST.toLocaleString() }))) return;
            myGems -= JET_COST; njJetpack = true;
            if (typeof updateGemDisplay === 'function') updateGemDisplay();
            if (typeof saveGameData === 'function') saveGameData();
            if (typeof syncToFirestore === 'function') syncToFirestore();
            syncJetUI(); syncWallet(); showHint(T('nj3d_jet_got'), 3500);
        });
        syncJetUI();

        // ── 🐴 탈것 (10/2) — 타면 빨라지고, 점프는 탈것째, 공중에서 한 번 더 누르면 뛰어내려 글라이더(사용자 결정). 성 안에서는 내려서 걷는다.
        //    탈것은 내린 자리에서 기다린다(「타기」를 누르면 곁으로 와서 태운다). 모델은 사람 키 0.53 기준이라 순례자 키(0.22)에 맞춰 줄인다
        const MOUNT_V = '20261004', MOUNT_S = 0.22 / 0.53;
        const mountCache = {};
        function loadMount(k) {
            if (!mountCache[k]) mountCache[k] = (async () => {
                if (!THREE.GLTFLoader) await loadScript(GLTF_URL);
                const gl = await new Promise((res, rej) => new THREE.GLTFLoader().load(`models/mounts/${k}.glb?v=${MOUNT_V}`, res, undefined, rej));
                gl.scene.traverse(o => { if (!o.isMesh) return; o.castShadow = true; const m = o.material; if (m.metalness > 0.5) { m.metalness = 0.35; m.roughness = 0.38; } });
                return gl.scene;
            })();
            mountCache[k].catch(() => { delete mountCache[k]; });
            return mountCache[k];
        }
        const ride = { on: false, wait: false, k: null, obj: null, parts: null, gait: 0, lastOut: null, roll: 0, px: 0, pz: 0 };
        addBlob(pilgrim, 0.2, () => !ride.on);   // 🌑 순례자 발밑 그림자 — 탈 때는 탈것의 그늘이 대신
        const kindOfMount = k => ((typeof NJ_MOUNTS !== 'undefined' && NJ_MOUNTS[k]) || {}).kind || 'animal';   // animal · bike · boat
        const mountsOf = () => (typeof njMounts !== 'undefined' && njMounts) || {};
        const ownedMounts = () => Object.keys(typeof NJ_MOUNTS !== 'undefined' ? NJ_MOUNTS : {}).filter(k => mountsOf()[k] && mountsOf()[k].own);
        const curMount = () => { const own = ownedMounts(); return (typeof njMountSel !== 'undefined' && own.includes(njMountSel)) ? njMountSel : (own[0] || null); };
        const inCity = (x, z) => Math.max(Math.abs(x), Math.abs(z)) < HALF + 0.35;
        async function buildMountObj(k) {
            const D = NJ_MOUNTS[k], st = mountsOf()[k] || {}, coat = st.coat || D.coats[0][0];
            const root = new THREE.Group(), body = (await loadMount('mt_' + k + '_' + coat)).clone();
            root.add(body); root.scale.setScalar(MOUNT_S);
            const head = body.getObjectByName('head');
            for (const g of D.gear) {
                if (!(st.on || []).includes(g[0])) continue;
                const gm = (await loadMount('gd_' + k + '_' + g[0])).clone();
                if (g[4] === 'wings') {   // 🦅 날개 장식 — L/R 조각을 날개 축 아래로(축 위치만큼 빼서)
                    body.add(gm);
                    [['L', 'wingL'], ['R', 'wingR']].forEach(([s, w]) => { const wp = body.getObjectByName(w); if (!wp) return; const parts = []; gm.children.forEach(o => { if (o.name && o.name.endsWith(s)) parts.push(o); }); parts.forEach(o => { wp.add(o); o.position.sub(wp.position); }); });
                    continue;
                }
                if (g[4] === 'wheels') {   // 🚗 금빛 휠 — capN을 wheelN 축 아래로 옮겨 바퀴와 함께 돌게
                    body.add(gm);
                    for (let i = 0; i < 4; i++) { const cp = gm.getObjectByName('cap' + i), wh = body.getObjectByName('wheel' + i); if (cp && wh) { wh.add(cp); cp.position.set(0, 0, 0); cp.rotation.set(0, 0, 0); } }
                    continue;
                }
                const pv = g[4] && g[4] !== 'body' ? body.getObjectByName(g[4]) : null;   // 머리·돛·핸들에 붙는 장식은 그 축 아래로(축 위치만큼 빼서)
                if (pv) { gm.position.copy(pv.position).multiplyScalar(-1); pv.add(gm); } else body.add(gm);
            }
            const nm = n => body.getObjectByName(n);
            const wheels = []; body.traverse(o => { if (/^wheel(F|R|\d)$/.test(o.name)) wheels.push(o); });   // 자전거·오토바이 wheelF/R · 자동차 wheel0~3
            const legsAll = []; body.traverse(o => { if (/^leg\d$/.test(o.name)) legsAll.push(o); }); legsAll.sort((a, b) => a.name.localeCompare(b.name));
            root.userData.parts = { legs: [0, 1, 2, 3].map(i => nm('leg' + i)), legsAll, head, heads: [nm('head0'), nm('head1')].filter(Boolean), tail: nm('tail'), wheels, crank: nm('crank'), bars: nm('bars'), sail: nm('sail'), rudder: nm('rudder'), prop: nm('prop'), steer: nm('steer'), body,
                wingL: nm('wingL'), wingR: nm('wingR'), tuck: nm('legs'), flame: nm('flame'), envelope: nm('envelope'), elevator: nm('elevator'), fins: nm('fins'), periscope: nm('periscope') };
            return root;
        }
        async function refreshMount() {   // 털빛·장식을 바꾸면 다시 짓는다(자리는 그대로)
            const k = curMount(); if (!k) return;
            const old = ride.obj, pos = old ? old.position.clone() : new THREE.Vector3(P.x, P.y, P.z), rot = old ? old.rotation.y : P.face + Math.PI / 2;
            let obj; try { obj = await buildMountObj(k); } catch (e) { return; }
            if (cur !== C) return;
            if (old) scene.remove(old);
            ride.obj = obj; ride.k = k; ride.parts = obj.userData.parts;
            if (!obj.userData.blob) { obj.userData.blob = true; addBlob(obj, 0); }   // 🌑 크기는 모양에서 잰다
            obj.position.copy(pos); obj.rotation.y = rot; obj.visible = ride.on || ride.wait; scene.add(obj);
        }
        const rideBtn = ov.querySelector('.nj3d-ridebtn'), tackBtn = ov.querySelector('.nj3d-tackbtn'), tackEl = ov.querySelector('.nj3d-mountpanel');
        function syncRideUI() {
            const k = curMount();
            rideBtn.innerHTML = !k ? T('nj3d_mount_shop') : ride.on ? T('nj3d_unride') : T('nj3d_ride', { e: NJ_MOUNTS[k].e });
            tackBtn.hidden = false;   // 날개 창도 여기서 — 탈것이 없어도 연다
        }
        async function mountUp() {
            const k = curMount(); if (!k) { openTack(); return; }
            if (inCity(P.x, P.z)) { showHint(T('nj3d_ride_city'), 2200); return; }
            if (kindOfMount(k) === 'boat' || kindOfMount(k) === 'sub') {   // ⛵ 배·🚢 잠수함 — 바다 위나 바닷가에서만
                if (seaE(P.x, P.z) > 1.45) { showHint(T('nj3d_boat_shore'), 2600); return; }
                for (let i = 0; i < 40 && seaE(P.x, P.z) > 0.95; i++) { const dx = -P.x, dz = SZ - P.z, l = Math.hypot(dx, dz) || 1; P.x += dx / l * 0.1; P.z += dz / l * 0.1; }
                P.y = groundAt(P.x, P.z, P.y + 1);
            }
            if (!ride.obj || ride.k !== k) await refreshMount();
            if (!ride.obj || cur !== C) return;
            ride.on = true; ride.wait = false; gliding = false; jetOn = false; ride.obj.visible = true;
            ride.obj.position.set(P.x, P.y, P.z); ride.obj.rotation.y = P.face + Math.PI / 2; ride.px = P.x; ride.pz = P.z;
            if (kindOfMount(k) === 'sub') { P.y = SEA_Y - 0.35; P.vy = 0; P.onGround = false; ride.obj.position.y = P.y; }   // 🚢 물속으로
            syncRideUI(); showHint(kindOfMount(k) === 'sub' ? T('nj3d_sub_on') : T('nj3d_ride_on', { name: _njMountObj(k) }), 3600);
        }
        function mountDown(how) {   // how: 'leap'(뛰어내려 글라이더) · 'city'(성문 앞) · 그 밖(그냥 내림)
            if (!ride.on) return;
            ride.on = false; ride.wait = true;
            if (ride.obj) {
                const at = how === 'city' && ride.lastOut ? ride.lastOut : [P.x, P.z];
                ride.obj.position.set(at[0], groundAt(at[0], at[1], P.y + 0.5), at[1]);
            }
            if (how === 'leap') { P.vy = Math.max(P.vy, 0.9); gliding = true; showHint(T('nj3d_leap'), 2400); }
            if (how === 'city') showHint(T('nj3d_ride_off_city'), 2600);
            pilgrim.position.y = P.y; L0();
            syncRideUI();
        }
        function L0() { const L = limbs; L.hipL.rotation.z = 0; L.hipR.rotation.z = 0; }
        rideBtn.addEventListener('click', () => { if (!curMount()) openTack('mount'); else if (ride.on) mountDown(P.onGround ? undefined : 'leap'); else mountUp(); });   // 공중에서 내리면 뛰어내려 글라이더
        tackBtn.addEventListener('click', () => openTack(curMount() ? null : 'wings'));
        let tackTab = 'mount'; const tackOpen = {};   // 탈것 창 — 고른 탭 · 펼친 탈것
        function openTack(tab) {   // 🐴 탈것 창 — 탈것(사기·고르기·털빛·장식) | 🪂 날개(글라이더·등 날개)
            if (tab) tackTab = tab;
            const en = typeof currentLang !== 'undefined' && currentLang === 'en', gems = Number(typeof myGems !== 'undefined' ? myGems : 0);
            if (tackTab === 'wings') { openWings(); return; }
            const price = (n, key) => gems >= n ? `<button data-${key}>💎 ${n.toLocaleString()}</button>` : `<span class="nj3d-offer-lock">💎 ${n.toLocaleString()}</span>`;
            tackEl.innerHTML = `<button class="nj3d-fruit-x" aria-label="close">✕</button><div class="nj3d-offer-head">${T('mount_title')}</div>
                <div class="nj3d-offer-have">💎 ${gems.toLocaleString()}</div>${tackTabs()}<div class="nj3d-offer-intro">${T('mount_intro')}</div>`
                + Object.keys(NJ_MOUNTS).sort((a, b) => !!NJ_MOUNTS[a].modern - !!NJ_MOUNTS[b].modern).map((k, i, arr) => {
                    const sec = (i === 0 || !!NJ_MOUNTS[arr[i - 1]].modern !== !!NJ_MOUNTS[k].modern) ? `<div class="nj3d-offer-head" style="margin-top:14px;font-size:0.9rem">${T(NJ_MOUNTS[k].modern ? 'mount_sec_modern' : 'mount_sec_bible')}</div>` : '';
                    const D = NJ_MOUNTS[k], st = mountsOf()[k] || {}, own = !!st.own, sel = curMount() === k;
                    // 탈것마다 접었다 펴는 칸(10/2 사용자: 버튼을 흩뿌리지 않게) — 제목 줄엔 이름·값(또는 ✓)만, 누르면 사기·털빛·장식. 고른 탈것은 펼친 채로 시작
                    const spd = D.speedMax ? T('mount_speed2', { x: D.speed, y: D.speedMax }) : T('mount_speed', { x: D.speed });
                    const tag = sel ? '✓' : own ? '' : `💎 ${D.cost.toLocaleString()}`;
                    const openIt = tackOpen[k] !== undefined ? tackOpen[k] : sel;
                    let h = sec + `<details class="nj3d-shop-fold" data-mk="${k}"${openIt ? ' open' : ''}><summary>${D.e} ${esc2(_njMountName(k))}<span class="nj3d-shop-n" style="margin-left:auto;min-width:0">${tag}</span></summary><div style="padding:0 8px 8px">`
                        + `<div class="nj3d-offer-intro" style="margin:0 0 6px">${esc2(D.ref ? D.ref + ' · ' : '')}${spd}</div>`;
                    if (!own) return h + `<div class="nj3d-offer-list"><div class="nj3d-offer-row"><div><b>${D.e} ${esc2(_njMountName(k))}</b></div>${gems >= D.cost ? `<button data-buy="${k}">${T('mount_buy', { cost: D.cost.toLocaleString() })}</button>` : `<span class="nj3d-offer-lock">💎 ${D.cost.toLocaleString()}</span>`}</div></div></div></details>`;
                    h += sel ? `<div class="nj3d-shop-big">${T('mount_picked')}</div>` : `<button class="nj3d-shop-rest" data-pick="${k}">${T('mount_pick')}</button>`;
                    h += `<div class="nj3d-shop-tabs">${D.coats.map(c => { const has = (st.coats || []).includes(c[0]); return `<button data-coat="${k}:${c[0]}" class="${st.coat === c[0] ? 'on' : ''}">${esc2(en ? c[2] : c[1])}${has ? '' : ` · 💎${c[3].toLocaleString()}`}</button>`; }).join('')}</div>`;
                    h += `<div class="nj3d-offer-intro">${T('mount_gear', { name: esc2(_njMountName(k)) })}</div><div class="nj3d-offer-list">` + D.gear.map(g => {
                        const has = (st.gear || []).includes(g[0]), on = (st.on || []).includes(g[0]);
                        return `<div class="nj3d-offer-row"><div><b>${esc2(en ? g[2] : g[1])}</b>${has ? '' : `<span>💎 ${g[3].toLocaleString()}</span>`}</div>${has ? `<button data-gear="${k}:${g[0]}">${on ? T('mount_gear_off') : T('mount_gear_on')}</button>` : gems >= g[3] ? `<button data-gear="${k}:${g[0]}">💎 ${g[3].toLocaleString()}</button>` : `<span class="nj3d-offer-lock">💎 ${g[3].toLocaleString()}</span>`}</div>`;
                    }).join('') + `</div></div></details>`;
                    return h;
                }).join('');
            tackEl.hidden = false; bindTabs();
            tackEl.querySelectorAll('details[data-mk]').forEach(d => d.ontoggle = () => { tackOpen[d.dataset.mk] = d.open; });
            tackEl.querySelector('.nj3d-fruit-x').onclick = () => { tackEl.hidden = true; };
            const after = async (ok, msg) => { if (!ok) { showHint(T('mount_need'), 2000); return; } syncWallet(); syncRideUI(); await refreshMount(); openTack(); if (msg) showHint(msg, 3000);
                if (typeof SoundEffect !== 'undefined' && SoundEffect.playClear) SoundEffect.playClear(); };
            tackEl.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {   // 탈것은 한 번 더 눌러야 산다
                if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = T('mount_sure'); b.classList.add('sure'); return; }
                const k = b.dataset.buy; after(_njMountBuy(k), T('mount_got', { name: _njMountObj(k) }));
            });
            tackEl.querySelectorAll('[data-pick]').forEach(b => b.onclick = () => after(_njMountPick(b.dataset.pick)));
            tackEl.querySelectorAll('[data-coat]').forEach(b => b.onclick = () => { const [k, c] = b.dataset.coat.split(':'); after(_njMountCoat(k, c)); });
            tackEl.querySelectorAll('[data-gear]').forEach(b => b.onclick = () => { const [k, g] = b.dataset.gear.split(':'); after(_njMountGear(k, g)); });
        }

        function tackTabs() { return `<div class="nj3d-shop-tabs"><button data-tab="mount" class="${tackTab === 'mount' ? 'on' : ''}">${T('mount_tab')}</button><button data-tab="wings" class="${tackTab === 'wings' ? 'on' : ''}">${T('wing_tab')}</button></div>`; }
        function bindTabs() { tackEl.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => openTack(b.dataset.tab)); }
        function openWings() {   // 🪂 날개 — 사면 바로 낀다
            const gems = Number(typeof myGems !== 'undefined' ? myGems : 0), st = typeof _njWingSt === 'function' ? _njWingSt() : { own: ['gold'], on: 'gold' };
            const stat = w => T('wing_stat', { b: w.bonus ? '+' + Math.round(w.bonus * 100) + '%' : T('wing_base'), s: w.sink < 0.42 ? Math.round((1 - w.sink / 0.42) * 100) + '%' : T('wing_base') });
            const row = w => { const has = st.own.includes(w.k), on = st.on === w.k;
                return `<div class="nj3d-offer-row"><div><b>${esc2(_njWingName(w))}</b><span>${w.ref ? esc2(w.ref) + ' · ' : ''}${stat(w)}</span></div>${on ? `<span class="nj3d-offer-lock">${T('wing_on')}</span>`
                    : has ? `<button data-wing="${w.k}">${T('wing_use')}</button>` : gems >= w.cost ? `<button data-wing="${w.k}" data-cost="1">💎 ${w.cost.toLocaleString()}</button>` : `<span class="nj3d-offer-lock">💎 ${w.cost.toLocaleString()}</span>`}</div>`; };
            tackEl.innerHTML = `<button class="nj3d-fruit-x" aria-label="close">✕</button><div class="nj3d-offer-head">${T('mount_title')}</div><div class="nj3d-offer-have">💎 ${gems.toLocaleString()}</div>${tackTabs()}
                <div class="nj3d-offer-intro">${T('wing_intro')}</div>
                <div class="nj3d-shop-sec">${T('wing_glider')}</div><div class="nj3d-offer-list">${NJ_WINGS.filter(w => w.kind === 'glider').map(row).join('')}</div>
                <div class="nj3d-shop-sec">${T('wing_wings')}</div><div class="nj3d-offer-list">${NJ_WINGS.filter(w => w.kind === 'wings').map(row).join('')}</div>`;
            tackEl.hidden = false; bindTabs();
            tackEl.querySelector('.nj3d-fruit-x').onclick = () => { tackEl.hidden = true; };
            tackEl.querySelectorAll('[data-wing]').forEach(b => b.onclick = () => {
                if (b.dataset.cost && b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = T('mount_sure'); b.classList.add('sure'); return; }
                const w = NJ_WINGS.find(x => x.k === b.dataset.wing);
                if (!_njWingBuy(w.k)) { showHint(T('mount_need'), 2000); return; }
                equipWing(); syncWallet(); openWings(); showHint(T('wing_got', { name: _koObj(_njWingName(w)) }), 3000);
                if (typeof SoundEffect !== 'undefined' && SoundEffect.playClear) SoundEffect.playClear();
            });
        }
        syncRideUI();
        // 탄 채로 움직일 때 — 탈것을 순례자 자리로, 다리·머리·꼬리, 발굽 소리. 기다릴 때는 가끔 고개 숙여 풀을 뜯는다
        function mountAnim(dt, moving, run, inWater) {
            const o = ride.obj; if (!o) return;
            const pt = ride.parts || {}, t = walkT;
            if (ride.on) {
                o.position.set(P.x, P.y, P.z); o.rotation.y = P.face + Math.PI / 2;
                if (moving && P.onGround) {
                    const prev = Math.sin(ride.gait); ride.gait += dt * (run ? 13 : 7);
                    if (Math.sign(Math.sin(ride.gait)) !== Math.sign(prev)) {
                        if (inWater) splash(P.x, P.z, false);
                        else if (kindOfMount(ride.k) === 'animal' && typeof SoundEffect !== 'undefined' && SoundEffect.playHoof) SoundEffect.playHoof(run);   // 발굽 소리는 짐승만
                    }
                }
            }
            const go = ride.on && moving && P.onGround, a = run ? 0.55 : 0.32;
            const KD = NJ_MOUNTS[ride.k] || {}, kind = KD.kind || 'animal';
            if (kind === 'sub') {   // 🚢 프로펠러가 돌고, 오르내리면 뱃머리를 들고 숙이고, 천천히 흔들린다
                if (ride.on) { o.position.set(P.x, P.y, P.z); o.rotation.y = P.face + Math.PI / 2; }
                if (pt.prop) pt.prop.rotation.x += (ride.on && (moving || Math.abs(P.vy) > 0.1) ? 30 : 3) * dt;
                if (pt.fins) pt.fins.rotation.y = ride.on ? Math.max(-0.4, Math.min(0.4, -P.vy * 0.4)) : 0;
                if (pt.periscope) pt.periscope.rotation.z = Math.sin(t * 0.4) * 0.5;
                if (pt.body) pt.body.rotation.z += ((ride.on ? Math.max(-0.3, Math.min(0.3, P.vy * 0.3)) : 0) - pt.body.rotation.z) * Math.min(1, dt * 4);
                o.position.y += Math.sin(t * 1.1) * 0.0015;
                return;
            }
            if (kind === 'bike' || kind === 'boat' || kind === 'car' || kind === 'fly') {   // 🚲🛵🚗 바퀴는 간 거리만큼 구르고 페달이 돈다 · ⛵🚤 배는 물결에 흔들리고 돛이 부풀거나 프로펠러가 돈다
                const d = ride.on ? Math.hypot(P.x - ride.px, P.z - ride.pz) : 0; ride.px = P.x; ride.pz = P.z;
                if (d < 1) ride.roll += d / (MOUNT_S * (KD.wheelR || 0.14));
                (pt.wheels || []).forEach(wh => { wh.rotation.z = -ride.roll; });
                if (pt.crank) pt.crank.rotation.z = -ride.roll * 0.45;
                const df = Math.atan2(Math.sin(P.face - (ride.lastFace ?? P.face)), Math.cos(P.face - (ride.lastFace ?? P.face))); ride.lastFace = P.face;
                const turn = dt > 0 ? Math.max(-3, Math.min(3, df / dt)) : 0; ride.turn = (ride.turn || 0) + (turn - (ride.turn || 0)) * Math.min(1, dt * 6);
                if (pt.bars) pt.bars.rotation.y = 0;
                if (pt.steer) { if (kind === 'car') pt.steer.rotation.y = -ride.turn * 0.6; else pt.steer.rotation.x = -ride.turn * 0.35; }   // 운전대가 도는 쪽으로(자동차는 기둥 축 = 자기 Y)
                if (pt.prop) pt.prop.rotation.x += (moving || (kind === 'fly' && !P.onGround) ? 40 : 4) * dt;   // 프로펠러
                if (kind === 'fly') {
                    const air = ride.on && !P.onGround, up = ride.on && jumpHeld;
                    if (pt.wingL && pt.wingR) { const f = air ? Math.sin(t * (up ? 9 : 3.5)) * (up ? 0.55 : 0.18) : -0.55; pt.wingL.rotation.x += (f - pt.wingL.rotation.x) * Math.min(1, dt * 10); pt.wingR.rotation.x += (-f - pt.wingR.rotation.x) * Math.min(1, dt * 10); }   // 🦅 날갯짓 · 땅에선 내린다
                    if (pt.tuck) pt.tuck.rotation.z += ((air ? 1.0 : 0) - pt.tuck.rotation.z) * Math.min(1, dt * 6);   // 날 때는 다리를 접는다
                    (pt.legsAll || []).forEach((l, i) => { if (pt.tuck) return; const g = air || moving; l.rotation.z = g ? Math.sin(t * 9 + (i % 4 < 2 ? 0 : Math.PI) + (i >= 4 ? 0.6 : 0)) * 0.5 : 0; });   // 🔥 불말은 공중을 달린다
                    (pt.heads || []).forEach((h, i) => { h.rotation.z = Math.sin(t * 9 + i) * 0.06; });
                    if (pt.flame) { const s = (up || KD.flameAlways) ? 1 + Math.sin(t * 23) * 0.12 + Math.sin(t * 37) * 0.06 : 0.4; pt.flame.scale.set(s, s * (up ? 1.2 : 1), s); }   // 🎈 오를 때 버너가 크게 · 🔥 불은 늘 일렁
                    if (pt.envelope) { pt.envelope.rotation.x = Math.sin(t * 0.7) * 0.03; pt.envelope.rotation.z = Math.sin(t * 0.5) * 0.03; }
                    if (pt.rudder) pt.rudder.rotation.z = -ride.turn * 0.3;
                    if (pt.elevator) pt.elevator.rotation.y = up ? -0.25 : air ? 0.08 : 0;
                    if (pt.body) pt.body.rotation.z += ((air ? Math.max(-0.35, Math.min(0.35, P.vy * 0.25)) : 0) - pt.body.rotation.z) * Math.min(1, dt * 4);   // 오를 땐 머리를 들고 내릴 땐 숙인다
                }
                if (pt.body) {   // 🛵 도는 쪽으로 몸을 기울인다 · 🚤 빨리 달리면 뱃머리가 들린다
                    pt.body.rotation.x += ((KD.lean && ride.on && moving ? -ride.turn * KD.lean : 0) - pt.body.rotation.x) * Math.min(1, dt * 8);
                    pt.body.rotation.z += ((KD.planing && ride.on && moving && run ? KD.planing : 0) - pt.body.rotation.z) * Math.min(1, dt * 3);
                }
                if (kind === 'boat') {
                    o.position.y += Math.sin(t * 1.3) * 0.004; o.rotation.x = Math.sin(t * 0.9) * 0.04; o.rotation.z = Math.sin(t * 1.1) * 0.03;
                    if (pt.sail) pt.sail.rotation.z = Math.sin(t * 0.8) * 0.08 + (moving ? 0.12 : 0);
                    if (pt.rudder) pt.rudder.rotation.z = Math.sin(t * 0.6) * 0.15;
                    if (ride.on && moving && Math.random() < dt * (KD.wake ? 6 : 2)) splash(P.x - Math.sin(P.face) * (KD.wake ? -0.12 : 0.15), P.z - Math.cos(P.face) * (KD.wake ? -0.12 : 0.15), !!KD.wake && Math.random() < 0.3);   // 뱃머리 물보라 · 모터보트는 뒤로 하얀 물길
                }
                return;
            }
            const pace = KD.gait === 'pace';   // 낙타 — 같은 쪽 다리가 함께
            (pt.legs || []).forEach((l, i) => { if (!l) return; const want = go ? Math.sin(ride.gait + ((pace ? (i === 0 || i === 2) : run ? i < 2 : (i === 0 || i === 3)) ? 0 : Math.PI)) * a : (!P.onGround && ride.on ? (i < 2 ? -0.5 : 0.5) : 0); l.rotation.z += (want - l.rotation.z) * Math.min(1, dt * 14); });
            if (pt.head) pt.head.rotation.z = go ? Math.sin(ride.gait * 2) * (run ? 0.06 : 0.035) : (!ride.on && ((t % 9) < 3) ? -0.45 * Math.sin((t % 9) / 3 * Math.PI) : 0);
            if (pt.tail) pt.tail.rotation.x = Math.sin(t * 3) * 0.3;
        }

        // ── 모드 ──
        const walkUI = ov.querySelector('.nj3d-walk'), modeBtn = ov.querySelector('.nj3d-mode');
        const ray = new THREE.Raycaster();
        const setModeLabel = () => { modeBtn.textContent = walk ? T('nj3d_overview') : T('nj3d_walk'); };
        setModeLabel();
        // 성 ↔ 바다 (한 세계, 9/30) — 내려다보기는 보는 곳을 옮기고, 걷기는 그 자리로 옮겨 선다
        const FOCUS = { city: { t: [0, 0.5, 0], c: [15, 14, 19] }, sea: { t: [0, -14, 64], c: [30, 22, 18] } };
        const SPOT = { city: [1.3, 9.2, 0], sea: [-2.4, SHORE - 3.5, Math.PI] };   // x, z, 카메라 방향(바다는 남쪽을 본다)
        let where = opts.start === 'sea' ? 'sea' : 'city';
        const goBtn = ov.querySelector('.nj3d-go');
        const setGoLabel = () => { goBtn.textContent = where === 'city' ? T('nj3d_to_sea') : T('nj3d_to_city'); };
        const placeAt = (dest) => {
            const [x, z, yaw] = SPOT[dest];
            P.x = x; P.z = z; P.y = terrain(x, z) + 0.05; P.vy = 0; camYaw = yaw; P.face = yaw + Math.PI; slide = null; slideSndStop(); plungeMom = null;
            pilgrim.position.set(P.x, P.y, P.z);
            if (walk) camera.position.set(P.x + Math.sin(yaw) * camDist, P.y + 0.4, P.z + Math.cos(yaw) * camDist);
        };
        const lookAt = (dest) => { const f = FOCUS[dest]; controls.target.set(...f.t); camera.position.set(...f.c); controls.update(); };
        goBtn.addEventListener('click', () => {
            where = where === 'city' ? 'sea' : 'city';
            if (walk) placeAt(where); else { controls.autoRotate = false; lookAt(where); }
            setGoLabel(); lastTouch = performance.now();
        });
        if (where === 'sea') { placeAt('sea'); lookAt('sea'); controls.autoRotate = false; }
        if (opts.focusGift && giftPos.length) {   // 🎁 「생명나무에서 보기」 — 받은 나눔 열매가 걸린 나무를 비춘다
            const gi = Math.max(0, giftList.findIndex(f => f.id === opts.focusGift)), gp = giftPos[gi];
            const ga = giftObjs[gi].a;   // 나무 바깥쪽에서, 열매 높이로 — 위에서 보면 수관이 가렸다
            controls.autoRotate = false; controls.target.set(gp.x, gp.y + 0.1, gp.z); camera.position.set(gp.x + Math.cos(ga) * 4, gp.y + 0.6, gp.z + Math.sin(ga) * 4); controls.update();
            showHint(T('nj3d_gift_here', { from: (giftList[gi] && giftList[gi].from) || '' }), 4500);
        }
        setGoLabel();
        modeBtn.addEventListener('click', () => {
            walk = !walk; controls.enabled = !walk; walkUI.hidden = !walk; pilgrim.visible = true; mini.hidden = !walk; dexBtn.hidden = !walk; miniT = 0; camOff = null; slide = null; slideBtn.hidden = true; slideSndStop(); fovBoost = 0; speedEl.style.opacity = '0'; plungeMom = null;
            if (walk) { controls.autoRotate = false; camera.fov = 62; camera.near = 0.02; showHint(T('nj3d_hint_walk'), 3500); }
            else { camera.fov = 42; camera.near = 0.1; where = P.z > 25 ? 'sea' : 'city'; lookAt(where); setGoLabel(); endFish(); fishBtn.hidden = true; }
            camera.updateProjectionMatrix(); setModeLabel(); lastTouch = performance.now();
        });

        // ══ 🎣 낚시 — 맑아진 물칸 위에서 그물을 던지고, 걸리면 빈칸 하나 ══
        const fishBtn = ov.querySelector('.nj3d-fishbtn'), fishQ = ov.querySelector('.nj3d-fishq');
        const FISH_COST = (typeof NJ_FISH_COST !== 'undefined') ? NJ_FISH_COST : 2000;
        const cellAt = (x, z) => {   // 발밑 물칸(880 좌표로 바꿔 가장 가까운 칸) — 번호가 곧 맑아지는 순서
            if (seaE(x, z) >= 1) return null;
            const px = x / SRX * 330 + 440, py = (z - SZ) / SRZ * 320 + 470;
            let best = -1, bd = 7.75 * 1.25;
            SG.water.forEach((c, i) => { const d = Math.hypot(c.x - px, c.y - py); if (d < bd) { bd = d; best = i; } });
            if (best < 0) return null;
            const clear = (seaW && seaW.clear) || 0, st = best < 250 ? 0 : best < 500 ? 1 : best < 1000 ? 2 : 3;
            return { idx: best, clear: best < clear, stage: st };
        };
        const fishEmoji = (() => {
            const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
            x.font = '76px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🐟', 48, 54);
            const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; return tx;
        })();
        const bobber = new THREE.Group();
        {
            const top = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshStandardMaterial({ color: 0xe8453c, roughness: 0.4 })); top.position.y = 0.03; bobber.add(top);
            const bot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })); bot.position.y = -0.005; bobber.add(bot);
        }
        bobber.visible = false; scene.add(bobber);
        const netRing = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.24, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xf5e6c4, transparent: true, opacity: 0, depthWrite: false }));
        netRing.visible = false; scene.add(netRing);
        const caught = new THREE.Sprite(new THREE.SpriteMaterial({ map: fishEmoji, transparent: true, depthWrite: false }));
        caught.scale.set(0.35, 0.35, 1); caught.visible = false; scene.add(caught);
        const fish = { phase: 'idle', t: 0, wait: 0, x: 0, z: 0, stage: 0, tries: 0, q: null, jump: 0, from: null,
            nibbles: [], strike: 0, strikeT: 0, early: false, reel: null };   // 🎣 미니게임 (10/4) — 챔질 성공(1) · 끌어올리기 {k, hits, pos, dir, zone, spd}
        const DIP_WIN = 0.5;   // 챔질 — 찌가 쏙 들어간 뒤 이 안에 누르면 성공(넉넉히: 어르신도)
        let fishCheckT = 0, fishCell = null, fishHinted = false, fishHintHold = 0;   // fishHintHold — 이때까진 낚시 안내를 미룬다(미끄럼 도착 안내가 덮이지 않게)
        const endFish = (msg) => { fish.phase = 'idle'; fish.reel = null; bobber.visible = false; fishQ.hidden = true; fishQ.classList.remove('reel', 'watch', 'now'); if (msg) showHint(msg, 1800); };
        const askFish = () => {
            const q = (typeof _njFishQuestion === 'function') ? _njFishQuestion() : null;
            if (!q) { endFish(T('nj3d_fish_miss')); return; }
            fish.q = q;
            const esc = t => String(t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
            const pot = fish.stage + (q.lenTier || 0);   // 입질 세기 — 긴 구절·먼 바다일수록 큰 물고기
            fishQ.innerHTML = `<div class="nj3d-fishq-head">${T(fish.tries === 2 ? (pot >= 5 ? 'nj3d_fish_bite3' : pot >= 3 ? 'nj3d_fish_bite2' : 'nj3d_fish_bite') : 'nj3d_fish_again')}</div>
                <div class="nj3d-fishq-ref">${esc(q.ref)}</div>
                <div class="nj3d-fishq-text">${esc(q.before)} <span class="nj3d-fishq-blank">＿＿＿</span> ${esc(q.after)}</div>
                <div class="nj3d-fishq-choices">${q.choices.map((c, i) => `<button data-i="${i}">${esc(c)}</button>`).join('')}</div>`;
            fishQ.hidden = false;
            fishQ.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => {
                const ok = q.choices[+b.dataset.i] === q.answer;
                if (ok) startReel();   // 🎣 맞혔으면 끌어올리기(게이지) — 낚느냐는 퀴즈가 정했고, 이건 크기 보너스만
                else {
                    fish.tries--;
                    if (fish.tries > 0) askFish(); else { splash(fish.x, fish.z, false); endFish(T('nj3d_fish_miss')); }
                }
            });
        };
        // ── 🎣 끌어올리기 (10/4 사용자) — 막대 위를 오가는 표시가 초록 칸에 올 때 세 번 누른다. 두 번 이상 맞히면 성공.
        //    큰 물고기(입질 세기)일수록 표시가 빠르다. 놓쳐도 물고기는 잃지 않는다 — 크기 보너스만
        const REEL_N = 3;
        const reelZone = () => { const w = 0.24; const a = 0.08 + Math.random() * (0.92 - w - 0.08); return [a, a + w]; };
        function renderReel() {
            const r = fish.reel; if (!r) return;
            const dots = Array.from({ length: REEL_N }, (_, i) => `<span class="nj3d-reel-dot ${i < r.res.length ? (r.res[i] ? 'ok' : 'no') : ''}"></span>`).join('');
            fishQ.innerHTML = `<div class="nj3d-fishq-head">${T('nj3d_fish_reel_head')}</div>
                <div class="nj3d-reel-bar"><div class="nj3d-reel-zone" style="left:${r.zone[0] * 100}%;width:${(r.zone[1] - r.zone[0]) * 100}%"></div><div class="nj3d-reel-mark"></div></div>
                <div class="nj3d-reel-dots">${dots}</div>`;
            r.mark = fishQ.querySelector('.nj3d-reel-mark'); r.bar = fishQ.querySelector('.nj3d-reel-bar');
            fishQ.onpointerdown = e => { e.preventDefault(); reelTap(); };
        }
        function startReel() {
            const pot = fish.stage + ((fish.q && fish.q.lenTier) || 0);
            fish.phase = 'reel'; fish.t = 0;
            fish.reel = { res: [], pos: Math.random(), dir: 1, zone: reelZone(), spd: 0.75 + pot * 0.12, flash: 0 };
            fishQ.classList.remove('watch', 'now'); fishQ.classList.add('reel'); fishQ.hidden = false;
            bobber.visible = false; renderReel(); syncFishBtn();
        }
        function reelTap() {
            const r = fish.reel; if (!r || fish.phase !== 'reel') return;
            const ok = r.pos >= r.zone[0] && r.pos <= r.zone[1];
            r.res.push(ok); splash(fish.x, fish.z, ok);
            if (typeof SoundEffect !== 'undefined') { if (ok && SoundEffect.playCorrect) SoundEffect.playCorrect(); else if (!ok && SoundEffect.playWrong) SoundEffect.playWrong(); }
            if (r.res.length >= REEL_N) { landFish(); return; }
            r.zone = reelZone(); renderReel();
        }
        function landFish() {   // 낚음 — 챔질·끌어올리기 성공 하나당 반 단계(둘 다면 한 단계), 최대 한 단계
            const reelOk = !!(fish.reel && fish.reel.res.filter(Boolean).length >= 2);
            const half = (fish.strike ? 1 : 0) + (reelOk ? 1 : 0);
            const q = fish.q || {};
            const r = (typeof _njFishGot === 'function') ? _njFishGot(fish.stage, q.lenTier || 0, half) : { value: 1, name: '', score: 0 };
            caught.scale.setScalar(0.28 + (r.score || 0) * 0.09);   // 큰 물고기는 크게 뛰어오른다
            fishQ.hidden = true; fishQ.classList.remove('reel'); fishQ.onpointerdown = null; fish.reel = null;
            fish.phase = 'jump'; fish.jump = 0; fish.from = bobber.position.clone(); fish.from.y = SEA_Y; bobber.visible = false; caught.visible = true;
            splash(fish.x, fish.z, true); syncWallet(); syncFishBtn();
            const bonus = half === 2 ? T('nj3d_fish_bonus2') : half === 1 ? T('nj3d_fish_bonus1') : '';
            showHint(T('nj3d_fish_got', { name: r.name, n: r.value }) + bonus, 2800);
            if (typeof SoundEffect !== 'undefined' && SoundEffect.playClear) SoundEffect.playClear();
        }
        // ── 🎣 챔질 (10/4 사용자) — 찌가 살짝살짝 흔들리다(가짜 입질) 쏙 가라앉는 순간 누른다. 이르거나 늦어도 물고기는 걸린다
        function syncFishBtn() {
            if (fish.phase === 'wait' || fish.phase === 'dip') { fishBtn.hidden = false; fishBtn.classList.remove('dim'); fishBtn.classList.add('act'); fishBtn.innerHTML = T('nj3d_fish_strike_btn'); }
            else if (fish.phase === 'reel') { fishBtn.hidden = false; fishBtn.classList.remove('dim'); fishBtn.classList.add('act'); fishBtn.innerHTML = T('nj3d_fish_reel_btn'); }
            else fishBtn.classList.remove('act');
        }
        function strikeTap() {
            if (fish.phase === 'wait') {   // 너무 이름 — 보너스만 없다
                if (!fish.early) { fish.early = true; showHint(T('nj3d_fish_early'), 1400); }
                return;
            }
            if (fish.phase === 'dip') {
                fish.strike = (!fish.early && fish.strikeT <= DIP_WIN) ? 1 : 0;
                showHint(T(fish.strike ? 'nj3d_fish_strike_ok' : 'nj3d_fish_strike_late'), 1400);
                if (fish.strike && typeof SoundEffect !== 'undefined' && SoundEffect.playCorrect) SoundEffect.playCorrect();
                hookFish();
            }
        }
        function hookFish() {   // 걸었다 → 빈칸 퀴즈
            fish.phase = 'bite'; fish.t = 0; fishQ.classList.remove('watch', 'now');
            fishBtn.hidden = true; fishBtn.classList.remove('act');
            askFish();
        }
        fishBtn.addEventListener('pointerdown', e => {
            e.preventDefault();
            if (fish.phase === 'wait' || fish.phase === 'dip') { strikeTap(); return; }   // 🎣 챔질
            if (fish.phase === 'reel') { reelTap(); return; }                          // 🎣 감기
            if (fish.phase !== 'idle' || !fishCell) return;
            if (!fishCell.clear) { showHint(T('nj3d_fish_murky'), 1600); return; }
            const gems = (typeof myGems !== 'undefined') ? myGems : 0;
            if (gems < FISH_COST) { showHint(T('nj3d_fish_need', { n: (FISH_COST - gems).toLocaleString() }), 2200); return; }
            if (typeof _njFishPay !== 'function' || !_njFishPay()) return;
            syncWallet();
            const fx = -Math.sin(P.face), fz = -Math.cos(P.face);
            fish.x = P.x + fx * 1.4; fish.z = P.z + fz * 1.4;
            if (seaE(fish.x, fish.z) >= 1) { fish.x = P.x; fish.z = P.z; }
            const cc = cellAt(fish.x, fish.z) || fishCell;
            fish.stage = cc.stage; fish.phase = 'wait'; fish.t = 0; fish.wait = 1.6 + Math.random() * 2.2; fish.tries = 2;
            fish.strike = 0; fish.early = false; fish.strikeT = 0; fish.reel = null;
            fish.nibbles = Array.from({ length: Math.floor(Math.random() * 3) }, () => 0.5 + Math.random() * Math.max(0.3, fish.wait - 0.9)).sort((a, b) => a - b);   // 가짜 입질 — 살짝 흔들림
            fishQ.innerHTML = `<div class="nj3d-fishq-head">${T('nj3d_fish_watch')}</div>`; fishQ.onpointerdown = null;
            fishQ.classList.remove('reel', 'now'); fishQ.classList.add('watch'); fishQ.hidden = false; syncFishBtn();
            bobber.position.set(fish.x, SEA_Y + 0.03, fish.z); bobber.visible = true;
            netRing.position.set(fish.x, SEA_Y + 0.02, fish.z); netRing.visible = true; netRing.scale.setScalar(0.3); netRing.material.opacity = 0.8;
            splash(fish.x, fish.z, false);
        });
        function fishUpdate(dt) {
            // 발밑 물칸을 1초에 네 번만 본다
            fishCheckT -= dt;
            if (fishCheckT <= 0) {
                fishCheckT = 0.25;
                fishCell = (P.onGround && !gliding) ? cellAt(P.x, P.z) : null;
                const show = !!fishCell && fish.phase === 'idle';
                const mini = fish.phase === 'wait' || fish.phase === 'dip' || fish.phase === 'reel';   // 🎣 챔질·감기 중엔 버튼이 그 일을 한다
                if (mini) syncFishBtn();
                fishBtn.hidden = mini ? false : !show;
                if (show) {
                    fishBtn.innerHTML = fishCell.clear ? T('nj3d_fish_btn', { cost: FISH_COST.toLocaleString() }) : T('nj3d_fish_murky');
                    fishBtn.classList.toggle('dim', !fishCell.clear);
                    if (!fishHinted && performance.now() > fishHintHold) { fishHinted = true; showHint(T('nj3d_fish_sea_hint'), 3000); }
                }
            }
            if (netRing.visible) { const k = netRing.scale.x + dt * 3; netRing.scale.setScalar(k); netRing.material.opacity = Math.max(0, 0.8 - (k - 0.3) / 3); if (netRing.material.opacity <= 0) netRing.visible = false; }
            if (fish.phase === 'wait' || fish.phase === 'dip' || fish.phase === 'bite') {
                fish.t += dt;
                if (Math.hypot(P.x - fish.x, P.z - fish.z) > 3.5) { endFish(T('nj3d_fish_left')); return; }   // 멀리 가면 그물을 거둔다
                let bob = Math.sin(fish.t * 3) * 0.008;
                if (fish.phase === 'wait') { for (const nt of fish.nibbles) { const d = fish.t - nt; if (d > 0 && d < 0.22) bob -= Math.sin(d / 0.22 * Math.PI) * 0.018; } }   // 가짜 입질 — 살짝 톡
                if (fish.phase === 'dip') { fish.strikeT += dt; bob = -0.07 + Math.sin(fish.t * 22) * 0.008; if (fish.strikeT > DIP_WIN + 0.7) { fish.strike = 0; showHint(T('nj3d_fish_strike_late'), 1400); hookFish(); } }   // 안 누르면 늦은 챔질로 넘어간다
                if (fish.phase === 'bite') bob = Math.sin(fish.t * 18) * 0.03 - 0.02;
                bobber.position.y = SEA_Y + 0.03 + bob;
                if (fish.phase === 'wait' && fish.t > fish.wait) {   // 쏙! — 진짜 입질
                    fish.phase = 'dip'; fish.strikeT = 0; splash(fish.x, fish.z, true);
                    fishQ.innerHTML = `<div class="nj3d-fishq-head now">${T('nj3d_fish_now')}</div>`; fishQ.classList.add('now');
                    if (typeof SoundEffect !== 'undefined' && SoundEffect.playClick) SoundEffect.playClick();
                }
            }
            if (fish.phase === 'reel' && fish.reel) {   // 끌어올리기 — 표시가 오간다, 물고기가 몸부림친다
                const r = fish.reel; fish.t += dt;
                if (Math.hypot(P.x - fish.x, P.z - fish.z) > 3.5) { landFish(); return; }   // 멀리 가도 이미 걸린 물고기는 낚는다
                r.pos += r.dir * r.spd * dt; if (r.pos > 1) { r.pos = 2 - r.pos; r.dir = -1; } else if (r.pos < 0) { r.pos = -r.pos; r.dir = 1; }
                if (r.mark) r.mark.style.left = (r.pos * 100) + '%';
                if (Math.floor(fish.t * 2.5) !== Math.floor((fish.t - dt) * 2.5)) splash(fish.x + (Math.random() - 0.5) * 0.3, fish.z + (Math.random() - 0.5) * 0.3, false);
            }
            if (fish.phase === 'jump') {   // 낚은 물고기가 순례자에게로 뛰어오른다
                fish.jump += dt / 0.8;
                const k = Math.min(1, fish.jump), to = new THREE.Vector3(P.x, P.y + 0.3, P.z);
                caught.position.lerpVectors(fish.from, to, k); caught.position.y += Math.sin(k * Math.PI) * 0.8;
                caught.material.opacity = k > 0.8 ? (1 - k) * 5 : 1;
                if (k >= 1) { caught.visible = false; fish.phase = 'idle'; }
            }
        }

        // ══ 🎁 사신에게 청하기 · 예물 행렬 ══
        const talkBtn = ov.querySelector('.nj3d-talk'), offerEl = ov.querySelector('.nj3d-offer'), skipBtn = ov.querySelector('.nj3d-skip');
        let nearEnvoy = null, envoyCheckT = 0, proc = null;
        const natName = i => { const N = (typeof SEA_NATIONS !== 'undefined' && SEA_NATIONS[i]) || []; return (typeof currentLang !== 'undefined' && currentLang === 'en') ? (N[2] || '') : (N[0] || ''); };
        const esc2 = t => String(t).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
        function openOffer(i) {
            const list = (typeof NJ_OFFERINGS !== 'undefined') ? NJ_OFFERINGS : [];
            const have = typeof _njTreasureAvail === 'function' ? _njTreasureAvail() : 0;
            const full = false;   // 꾸미기(10/1)부터 자리 제한 없음 — 16자리가 차면 성 둘레 빈 곳에 놓고 옮긴다
            offerEl.innerHTML = `<button class="nj3d-fruit-x" aria-label="close">✕</button>
                <div class="nj3d-offer-head">${T('gift_title', { name: esc2(natName(i)) })}</div>
                <div class="nj3d-offer-intro">${T('gift_intro')}</div>
                <div class="nj3d-offer-have">${T('gift_have', { f: typeof _njFishAvail === 'function' ? _njFishAvail() : 0, g: typeof _njGrapesAvail === 'function' ? _njGrapesAvail() : 0 })}</div>
                <div class="nj3d-offer-list">${list.map(o => {
                    const open = typeof _njOfferUnlocked === 'function' && _njOfferUnlocked(o);
                    const btn = !open ? `<span class="nj3d-offer-lock">${T('gift_locked', { ch: o.ch })}</span>`
                        : full ? `<span class="nj3d-offer-lock">${T('gift_full')}</span>`
                        : have >= o.cost ? `<button data-k="${o.k}">${T('gift_take', { cost: o.cost })}</button>`
                        : `<span class="nj3d-offer-lock">${T('gift_need', { n: o.cost - have })} · ${o.cost}</span>`;
                    return `<div class="nj3d-offer-row${open ? '' : ' locked'}"><div><b>${esc2(typeof _njOfferName === 'function' ? _njOfferName(o) : o.ko)}</b><span>계 ${o.ref}</span></div>${btn}</div>`;
                }).join('')}</div>
                ${typeof _njPearlAvail === 'function' && ['w', 'c', 'g'].some(k => _njPearlAvail(k) > 0) ? `<div class="nj3d-offer-head nj3d-offer-sub">${T('nj3d_pearl_btn')}</div><div class="nj3d-offer-list">${_njPearlSellHtml()}</div>` : ''}`;
            offerEl.hidden = false; offerEl.dataset.pearl = '';
            offerEl.querySelector('.nj3d-fruit-x').onclick = () => { offerEl.hidden = true; };
            bindPearlSell(offerEl, () => openOffer(i));   // 💎 소성된 나라의 사신도 진주를 산다
            offerEl.querySelectorAll('button[data-k]').forEach(b => b.onclick = () => {
                const gf = typeof _njOfferBuy === 'function' ? _njOfferBuy(b.dataset.k, i) : null;
                if (!gf) return;
                offerEl.hidden = true; syncWallet(); startProc(i, gf);
            });
        }
        talkBtn.addEventListener('pointerdown', e => { e.preventDefault(); if (nearEnvoy && !proc) openOffer(nearEnvoy.i); });
        skipBtn.textContent = T('gift_skip');
        const rateBtn = ov.querySelector('.nj3d-rate');
        skipBtn.addEventListener('pointerdown', e => { e.preventDefault();
            if (!proc) return;
            if (proc.phase === 'sail') { proc.s = proc.sea.L; procUpdate(0.001); }
            if (proc && proc.phase === 'go') proc.s = proc.land.L; });
        rateBtn.addEventListener('pointerdown', e => { e.preventDefault(); if (!proc) return; proc.rate = proc.rate === 1 ? 2 : 1; rateBtn.textContent = proc.rate === 1 ? '⏩ 2×' : '▶ 1×'; });

        // ── 행렬 (9/30 2단계 — 시안 「만국의 예물 행렬」에서 옮김) ──
        // 가문과 예물 크기로 고른다: 함 = 낙타 행렬(사 60:6) · 야벳 = 다시스의 배(60:9) → 어귀부터 짐꾼 넷이 가마로 · 셈 = 말과 수레, 큰 예물은 교자(66:20)
        // 예물은 세마포에 싸고 금줄로 묶는다(19:8). 비탈에서 짐승은 몸을 기울이고, 가마는 수평을 지키며 가마꾼마다 제 발밑에 선다
        const { person, camel, horse, chariot, litter, ship } = PM;

        // 매끈한 길 — 꺾인 점들을 곡선(Catmull-Rom)으로 잇고, 길이 기준으로 고르게 걷는다
        function mkPath(pts) {
            const c = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
            c.arcLengthDivisions = 600; return { c, L: c.getLength() };
        }
        const _pt = new THREE.Vector3(), _tg = new THREE.Vector3();
        const at = (path, sv) => { const u = Math.max(0, Math.min(1, sv / path.L)); path.c.getPointAt(u, _pt); path.c.getTangentAt(u, _tg); return { x: _pt.x, z: _pt.z, dx: _tg.x, dz: _tg.z }; };
        const ease = k => 1 - Math.exp(-k);   // 프레임과 상관없이 같은 빠르기로 따라가게
        const angLerp = (a, b, f) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return a + d * f; };
        // 어귀 옆 둑 → 골짜기 → 성 둘레(반지름 9.5) → 자리
        function upPath(side, slot) {
            const pts = []; for (let z = SHORE - 3; z >= 9.5; z -= 2) pts.push([side, z]);
            const sp = slots[slot], aS = Math.atan2(9.5, side), aE = Math.atan2(sp[1], sp[0]);
            let dA = aE - aS; while (dA > Math.PI) dA -= Math.PI * 2; while (dA < -Math.PI) dA += Math.PI * 2;
            const M = Math.max(2, Math.ceil(Math.abs(dA) / 0.2));
            for (let k = 0; k <= M; k++) { const a = aS + dA * k / M; pts.push([Math.cos(a) * 9.5, Math.sin(a) * 9.5]); }
            pts.push([sp[0], sp[1]]); return pts;
        }
        function landPath(i, slot) {   // 나라 해안 → 바닷가를 가까운 쪽으로 돌아 어귀 → 골짜기
            const pts = [], A0 = -Math.PI / 2 + 0.13, SP = Math.PI * 2 - 0.26, a1 = A0 + SP * (i + 0.5) / 70;
            const toMouth = a1 < Math.PI / 2 ? -Math.PI / 2 + 0.22 : Math.PI * 1.5 - 0.22;
            const N = Math.max(4, Math.ceil(Math.abs(toMouth - a1) / 0.08));
            for (let k = 0; k <= N; k++) { const a = a1 + (toMouth - a1) * k / N; pts.push(toW(440 + Math.cos(a) * (330 + 40), 470 + Math.sin(a) * (320 + 40))); }
            return pts.concat(upPath(toMouth < 0 ? 1.7 : -1.7, slot));
        }
        function seaPath(i) {   // 나라 앞바다 → 어귀
            const A0 = -Math.PI / 2 + 0.13, SP = Math.PI * 2 - 0.26, a1 = A0 + SP * (i + 0.5) / 70, [x0, z0] = toW(440 + Math.cos(a1) * 310, 470 + Math.sin(a1) * 300);
            return [[x0, z0], [x0 * 0.5, (z0 + SHORE) / 2 + 3], [0.9, SHORE + 1.4], [1.2, SHORE + 0.5]];
        }
        const localGround = (obj, lx, lz) => { const S = obj.scale.x, th = obj.rotation.y, c = Math.cos(th), sn = Math.sin(th);
            return terrain(obj.position.x + (lx * c + lz * sn) * S, obj.position.z + (-lx * sn + lz * c) * S); };
        function startProc(i, gf) {
            const N = (typeof SEA_NATIONS !== 'undefined' && SEA_NATIONS[i]) || [], fam = N[4] || '셈';
            const o = (typeof NJ_OFFERINGS !== 'undefined') ? NJ_OFFERINGS.find(x => x.k === gf.k) : null, size = (o && o.size) || 1;
            const robe = FAMILY_ROBE[fam] || 0x888888, members = [];
            const add = (mdl, off, extra) => members.push(Object.assign({ obj: mdl.g, anim: mdl.anim, animal: !!mdl.animal, bearers: mdl.bearers, off, init: false }, extra || {}));
            let mode = 'go', seaPts = null;
            if (fam === '함') {
                add(person(robe, 'lead'), -0.6);
                const mid = Math.floor(size / 2);
                for (let k = 0; k < size; k++) add(camel(k === mid), k * 0.75);
            } else if (fam === '야벳') {
                add(ship(), 0, { sea: true }); mode = 'sail'; seaPts = seaPath(i);
            } else if (size >= 3) {
                add(person(robe, 'lead'), -0.7); add(litter(robe), 0);
            } else {
                add(horse(), 0); add(chariot(), 0.5); add(person(robe, 'lead'), -0.55);
            }
            const grp = new THREE.Group(); scene.add(grp);
            members.forEach(m => { m.obj.scale.setScalar(2.2); grp.add(m.obj); if (!m.sea) addBlob(m.obj, 0); });
            const land = fam === '야벳' ? upPath(1.7, gf.slot) : landPath(i, gf.slot);
            proc = { phase: mode, i, gf, grp, members, t: 0, s: 0, v: 0, robe, rate: 1, model: null,
                sea: seaPts ? mkPath(seaPts) : null, land: mkPath(land) };
            cam.dist = 7; cam.pitch = 0.42; cam.off = 0.55; cam.ready = false;
            loadGift(gf.k).catch(() => { });   // 도착하기 전에 모델을 받아 둔다
            walkUI.hidden = true; talkBtn.hidden = true; fishBtn.hidden = true; skipBtn.hidden = false; rateBtn.hidden = false; rateBtn.textContent = '⏩ 2×';
            proc.name = o ? (typeof _njOfferName === 'function' ? _njOfferName(o) : o.ko) : '';
            showHint(T('gift_depart', { item: proc.name, nation: natName(i) }), 3000);
        }
        function placeMembers(path, sv, dt) {
            let head = null, sx = 0, sy = 0, sz = 0, n = 0, lo = Infinity, hi = -Infinity;
            const fYaw = ease(dt * 7), fY = ease(dt * 10), fP = ease(dt * 6);
            proc.members.forEach(m => {
                const p = at(path, Math.max(0, sv - m.off * 2.2)), yaw = Math.atan2(-p.dz, p.dx);
                // 방향·높이·기울기를 곧장 바꾸지 않고 따라가게 — 모퉁이·울퉁불퉁한 땅에서 튀지 않는다
                if (!m.init) { m.yaw = yaw; m.init = true; m.y = null; m.pitch = 0; }
                m.yaw = angLerp(m.yaw, yaw, fYaw);
                m.obj.position.x = p.x; m.obj.position.z = p.z; m.obj.rotation.y = m.yaw;
                let ty, tp = 0;
                if (m.sea) ty = SEA_Y + 0.02 + Math.sin(proc.t * 1.6) * 0.03;
                else if (m.animal) { const yf = localGround(m.obj, 0.14, 0), yb = localGround(m.obj, -0.14, 0), S = m.obj.scale.x; tp = Math.atan2(yf - yb, 0.28 * S); ty = (yf + yb) / 2; }
                else if (m.bearers) { const ys = m.bearers.map(b => localGround(m.obj, b.g.position.x, b.g.position.z)), S = m.obj.scale.x;
                    const yf = (ys[0] + ys[1]) / 2, yb = (ys[2] + ys[3]) / 2;
                    ty = (yf + yb) / 2 + Math.abs(yf - yb) * 0.25; tp = Math.atan2(yf - yb, 0.72 * S) * 0.6; }   // 가마는 비탈의 6할만큼만 기울인다
                else ty = terrain(p.x, p.z);
                m.y = m.y == null ? ty : m.y + (ty - m.y) * fY; m.pitch += (tp - m.pitch) * fP;
                if (!m.sea && m.y < ty) m.y = ty;   // 땅 아래로는 내려가지 않는다 — 오르막에서 늦게 따라가다 산에 묻혔다(오를 땐 바로, 내려갈 때만 부드럽게)
                m.obj.position.y = m.y; m.obj.rotation.z = m.sea ? Math.sin(proc.t * 1.6) * 0.04 : m.pitch;
                if (m.bearers) {   // 가마꾼 — 가마의 지금 높이·기울기에서 거꾸로 풀어 발을 제 땅에, 몸은 똑바로
                    const S = m.obj.scale.x, sp = Math.sin(m.pitch), cp = Math.cos(m.pitch);
                    m.bearers.forEach(b => { let y = b.g.position.y;
                        for (let it = 0; it < 3; it++) {   // 가마가 기울면 가마꾼이 서는 가로 자리도 바뀐다 — 그 자리의 땅으로 몇 번 맞춘다
                            const gy = localGround(m.obj, b.g.position.x * cp - y * sp, b.g.position.z);
                            y = ((gy - m.y) / S - b.g.position.x * sp) / cp; }
                        b.g.position.y = y; b.g.rotation.z = -m.pitch; });
                }
                if (m.anim) m.anim(proc.t, Math.max(0.35, proc.v));   // 걸음은 빠르기에 맞춘다(출발·도착 때 천천히)
                if (!head) head = { dx: p.dx, dz: p.dz };
                sx += p.x; sy += m.y; sz += p.z; n++; lo = Math.min(lo, m.off); hi = Math.max(hi, m.off);
            });
            // 카메라는 행렬 전체의 가운데를 보고, 행렬 길이만큼 더 물러난다(맨 앞만 따라가면 뒤 낙타들 사이에 카메라가 놓였다)
            return { x: sx / n, y: sy / n, z: sz / n, dx: head.dx, dz: head.dz, span: (hi - lo) * 2.2 };
        }
        // 행렬 카메라 — 행렬을 따라가되, 끌어서 돌려보고 두 손가락·휠로 가까이/멀리 (걷기 카메라와 따로)
        const cam = { off: 0.55, pitch: 0.42, dist: 7, tgt: new THREE.Vector3(), hd: new THREE.Vector3(1, 0, 0), pos: new THREE.Vector3(), ready: false };
        {
            const pts = new Map(); let pinch0 = 0, dist0 = 0;
            cvs.addEventListener('pointerdown', e => { if (!proc) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); dist0 = cam.dist; } });
            cvs.addEventListener('pointermove', e => {
                const p0 = pts.get(e.pointerId); if (!proc || !p0) return;
                if (pts.size === 1) { cam.off -= (e.clientX - p0.x) * 0.008; cam.pitch = Math.max(0.08, Math.min(1.35, cam.pitch + (e.clientY - p0.y) * 0.006)); }
                pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
                if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()]; cam.dist = Math.max(2.5, Math.min(30, dist0 * pinch0 / Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)))); }
                lastTouch = performance.now();
            });
            const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; };
            cvs.addEventListener('pointerup', up); cvs.addEventListener('pointercancel', up);
            cvs.addEventListener('wheel', e => { if (!proc) return; cam.dist = Math.max(2.5, Math.min(30, cam.dist * (e.deltaY > 0 ? 1.1 : 0.9))); e.preventDefault(); }, { passive: false });
        }
        function follow(h, dt, distScale) {
            cam.hd.lerp(new THREE.Vector3(h.dx, 0, h.dz).normalize(), ease(dt * 2.2)).normalize();   // 방향은 천천히(모퉁이에서 휙 돌지 않게)
            cam.tgt.lerp(new THREE.Vector3(h.x, h.y + 0.45, h.z), cam.ready ? ease(dt * 6) : 1);
            const bx = -cam.hd.x, bz = -cam.hd.z, c = Math.cos(cam.off), s = Math.sin(cam.off), d = (cam.dist + (h.span || 0) * 0.9) * (distScale || 1);
            const want = new THREE.Vector3(cam.tgt.x + (bx * c - bz * s) * Math.cos(cam.pitch) * d, cam.tgt.y + Math.sin(cam.pitch) * d, cam.tgt.z + (bx * s + bz * c) * Math.cos(cam.pitch) * d);
            want.y = Math.max(want.y, Math.max(terrain(want.x, want.z), SEA_Y) + 0.6);
            cam.pos.lerp(want, cam.ready ? ease(dt * 4) : 1); cam.ready = true;
            camera.position.copy(cam.pos); camera.lookAt(cam.tgt);
        }
        function endGroup() { if (!proc || !proc.grp) return; scene.remove(proc.grp); proc.grp.traverse(o => { if (o.geometry) o.geometry.dispose(); }); proc.grp = null; }
        function procUpdate(dt0) {
            const pr = proc, dt = dt0 * (pr.phase === 'show' ? 1 : pr.rate); pr.t += dt;
            if (pr.phase === 'sail' || pr.phase === 'go') {
                const path = pr.phase === 'sail' ? pr.sea : pr.land, total = path.L;
                const vmax = total / (pr.phase === 'sail' ? 6 : pr.sea ? 8 : 13);
                // 천천히 출발해 속도를 내고, 끝에 가까우면 천천히 멈춘다
                const target = Math.min(1, pr.t / 1.4) * Math.max(0.2, Math.min(1, (total - pr.s) / 4));
                pr.v += (target - pr.v) * ease(dt * 3);
                pr.s = Math.min(total, pr.s + vmax * pr.v * dt);
                const h = placeMembers(path, pr.s, dt); follow(h, dt0, pr.phase === 'sail' ? 1.5 : 1);
                if (pr.s >= total - 0.02) {
                    if (pr.phase === 'sail') {   // 어귀에 닿으면 배는 머물고, 짐꾼 넷이 가마로 메고 오른다
                        const l = litter(pr.robe); l.g.scale.setScalar(2.2); pr.grp.add(l.g);
                        pr.members = [{ obj: l.g, anim: l.anim, bearers: l.bearers, off: 0, init: false }]; pr.phase = 'go'; pr.s = 0; pr.t = 0; pr.v = 0;
                    } else {   // 도착 — 세마포를 풀고 예물이 선다
                        endGroup();
                        pr.model = placeGift(pr.gf); if (pr.model) pr.model.scale.setScalar(0.01);
                        pr.phase = 'show'; pr.t = 0; skipBtn.hidden = true; rateBtn.hidden = true; cam.dist = 4.5;
                        if (typeof SoundEffect !== 'undefined' && SoundEffect.playClear) SoundEffect.playClear();
                        showHint(T('gift_arrive', { item: pr.name }), 3000);
                    }
                }
            } else {
                const k = Math.min(1, pr.t / 0.9), sc = k < 1 ? 1 - Math.pow(1 - k, 3) * (1 - k * 0.3) : 1;   // 부드럽게 커진다
                if (pr.model) { pr.model.scale.setScalar(Math.max(0.01, sc * (pr.model.userData.base || 1)));
                    const p = pr.model.position; follow({ x: p.x, y: p.y + 0.3, z: p.z, dx: -p.x, dz: -p.z }, dt0, 1); }
                if (pr.t > 4) { proc = null; walkUI.hidden = false; syncWallet(); }
            }
        }

        // ══ 🛠️ 꾸미기 (2026-10-01) — 예물과 꾸밈 아이템을 끌어서 놓고, 돌리고, 보관함에 넣는다 ══
        //    사용자: "아무 데나 끌어서 놓되 꾸미기 전용 화면에 들어가게". 걷기·행렬과 따로 — 위에서 비스듬히 내려다보는 카메라.
        //    물건을 끌면 옮기고, 빈 곳을 끌면 화면이 움직이고, 두 손가락은 확대·돌리기. 마칠 때 바뀐 것만 저장(_njDecoSave)
        const DS = (typeof NJ_DECO_S !== 'undefined') ? NJ_DECO_S : 0.42;   // 꾸밈 배율(game.js)
        const DIS = (typeof NJ_DECO_ITEM_S !== 'undefined') ? NJ_DECO_ITEM_S : {};   // 아이템마다 더 곱하는 배율
        const DECO_V = '20261004';   // models/decor/*.glb 캐시 번호 — 모델을 다시 뽑으면 올린다 (tools/blender/decor.py)
        const decoCache = {};
        function loadDecor(k) {
            if (!decoCache[k]) decoCache[k] = (async () => {
                if (!THREE.GLTFLoader) await loadScript(GLTF_URL);
                const gl = await new Promise((res, rej) => new THREE.GLTFLoader().load(`models/decor/${k}.glb?v=${DECO_V}`, res, undefined, rej));
                gl.scene.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true;
                    const m = o.material; if (m.metalness > 0.5) { m.metalness = 0.35; m.roughness = 0.38; } if (m.emissive && m.emissive.getHex()) m.emissiveIntensity = 1.2; });
                return gl.scene;
            })();
            decoCache[k].catch(() => { delete decoCache[k]; });
            return decoCache[k];
        }
        function decoFallback() {   // 모델을 못 받으면 나무 상자 하나
            const g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.3), new THREE.MeshStandardMaterial({ color: 0xb08a5a, roughness: 0.8 }));
            b.position.y = 0.15; b.castShadow = true; g.add(b); return g;
        }
        const decoG = new THREE.Group(); scene.add(decoG);
        // 낱개로 놓였을 때의 작은 움직임 (10/1 사용자: 세트가 되기 전에도 조금씩은 다들 움직였으면) — 놓은 자리에서 벗어나지 않는다.
        // 동물: 제자리에서 풀 뜯기·두리번·가끔 몸 돌리기 / 목자: 둘러보며 숨 / 나무·건초·천막·물부대: 바람에 살랑 / 배: 흔들 / 가로등: 불빛이 숨 쉬듯.
        // 돌담·문·지팡이·피리·깔개·벤치처럼 단단한 것은 그대로
        const IDLE_SWAY = { figtree: [0.025, 0.7], palmtree: [0.04, 0.55], arbor: [0.015, 0.8], hay: [0.012, 1.1], tent: [0.008, 0.9], waterskin: [0.03, 1.3], 
    olivetree: [0.02, 0.6], wildflowers: [0.06, 1.4], pot: [0.38, 0.37, 0.45], flowerbed: [1.2, 0.79, 0.21], reeds: [0.07, 1.1], terebinth: [0.012, 0.5], booth: [0.006, 0.8] };
        function idleFx(k, c, ph) {
            ph = ph || Math.random() * 6.28;
            if (k === 'sheep' || k === 'blacksheep' || k === 'lamb' || k === 'dog') {
                const hd = c.getObjectByName('head'); let turnAt = 2 + Math.random() * 4, yaw0 = 0, yaw1 = 0, turnT = 0, last = 0;
                return t => {
                    const dt = Math.min(0.05, Math.max(0, t - last)); last = t;
                    const u = (t + ph) % 7, eat = k === 'dog' ? u < 2.5 : u < 4.2;   // 개는 엎드려 쉬다 고개 들고, 양은 오래 뜯는다
                    if (hd) hd.rotation.z += ((eat ? -0.7 + Math.sin(t * 6 + ph) * 0.08 : Math.sin(t * 0.9 + ph) * 0.15) - hd.rotation.z) * Math.min(1, dt * 3);
                    if (hd && !eat) hd.rotation.y = Math.sin(t * 0.6 + ph) * 0.35;
                    if (t > turnAt) { turnAt = t + 5 + Math.random() * 6; yaw0 = c.rotation.y; yaw1 = yaw0 + (Math.random() - 0.5) * 1.4; turnT = 0; }
                    if (turnT < 1) { turnT = Math.min(1, turnT + dt / 1.2); const e = turnT * turnT * (3 - 2 * turnT); c.rotation.y = yaw0 + (yaw1 - yaw0) * e; c.position.y = Math.abs(Math.sin(turnT * Math.PI * 3)) * 0.01; }
                };
            }
            if (k === 'shepherd' || k === 'disciple' || k === 'disciple2') {   // 목자·제자 — 둘러보며 숨
                const hd = c.getObjectByName('head');
                return t => { if (hd) { hd.rotation.y = Math.sin(t * 0.35 + ph) * 0.45; hd.rotation.x = Math.sin(t * 0.5 + ph) * 0.05; } c.scale.y = 1 + Math.sin(t * 1.6 + ph) * 0.008; };
            }
            if (IDLE_SWAY[k]) {
                const [a, f] = IDLE_SWAY[k];
                return t => { c.rotation.z = Math.sin(t * f + ph) * a + Math.sin(t * f * 2.3 + ph) * a * 0.3; c.rotation.x = Math.sin(t * f * 0.8 + ph * 1.7) * a * 0.6; };
            }
            if (k === 'restsheep') {   // 누워 쉬는 양 — 숨 쉬고, 가끔 고개를 든다
        const hd = c.getObjectByName('head');
        return t => { c.scale.y = 1 + Math.sin(t * 1.3 + ph) * 0.015; const u = (t + ph) % 9; if (hd) hd.rotation.z = u < 2 ? Math.sin(u / 2 * Math.PI) * 0.35 : -0.08 + Math.sin(t * 0.8) * 0.03; };
    }
    if (k === 'butterfly') {   // 나비 — 날갯짓하며 8자로 맴돈다(놓은 자리 둘레)
        const wl = c.getObjectByName('wingL'), wr = c.getObjectByName('wingR'); c.scale.setScalar(2.2); let last = 0;
        return t => { const a = t * 0.9 + ph, x = Math.sin(a) * 0.22, z = Math.sin(a * 2) * 0.12, nx = Math.sin(a + 0.05) * 0.22, nz = Math.sin((a + 0.05) * 2) * 0.12;
            c.position.set(x, 0.18 + Math.sin(t * 3 + ph) * 0.05, z); c.rotation.y = Math.atan2(-(nz - z), nx - x);
            const f = Math.sin(t * 22) * 0.9; if (wl) wl.rotation.x = f; if (wr) wr.rotation.x = -f; };
    }
    if (k === 'brook') {   // 시냇물 — 물빛이 흐르듯 일렁인다
        const wt = c.getObjectByName('water');
        return t => { if (wt) { wt.position.x = Math.sin(t * 1.7 + ph) * 0.015; wt.scale.y = 1 + Math.sin(t * 2.3 + ph) * 0.04; } };
    }
if (k === 'gulls') {   // 갈매기 한 쌍 — 공중에서 맴돌며 퍼덕인다
            const ws = ['wingL0', 'wingR0', 'wingL1', 'wingR1'].map(n => c.getObjectByName(n));
            return t => { const a = t * 0.55 + ph; c.position.set(Math.cos(a) * 0.45, 0.9 + Math.sin(t * 1.3 + ph) * 0.05, Math.sin(a) * 0.45); c.rotation.y = -a;
                const f = Math.sin(t * 9 + ph) * 0.6; ws.forEach((w, i) => { if (w) w.rotation.x = i % 2 ? -f : f; }); };
        }
        if (k === 'ox' || k === 'donkey') {   // 소·나귀 — 놓아 두면 꼬리를 흔들고 되새김질, 가끔 고개 숙여 먹는다(망을 씌우지 않았다, 신 25:4)
            const hd = c.getObjectByName('head'), tl = c.getObjectByName('tail');
            return t => { if (tl) tl.rotation.x = Math.sin(t * 2.3 + ph) * 0.35; const u = (t + ph) % 8;
                if (hd) { hd.rotation.z = u < 2 ? -0.45 * Math.sin(u / 2 * Math.PI) : 0; hd.rotation.y = Math.sin(t * 3 + ph) * 0.03; } };
        }
        if (k === 'winnower') {   // 키질하는 사람 — 떠서 높이 던지면 쭉정이는 바람에 날리고 알곡은 떨어진다 (3초)
            const ar = c.getObjectByName('arms'); if (!ar) return null;
            const N = 26, pos = new Float32Array(N * 3), vel = [], age = [], chaff = [];
            for (let i = 0; i < N; i++) { vel.push(new THREE.Vector3()); age.push(9); chaff.push(i % 3 !== 0); pos[i * 3 + 1] = -9; }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            const col = new Float32Array(N * 3); for (let i = 0; i < N; i++) { const cc = chaff[i] ? [0.95, 0.9, 0.72] : [0.85, 0.62, 0.22]; col.set(cc, i * 3); }
            g.setAttribute('color', new THREE.BufferAttribute(col, 3));
            const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false })); pts.frustumCulled = false; c.add(pts);
            let last = 0, thrown = false;
            return t => { const dt = Math.min(0.05, Math.max(0, t - last)); last = t; const u = ((t + ph) % 3) / 3;
                ar.rotation.z = u < 0.45 ? -0.35 + 0.1 * Math.sin(u * 30) : u < 0.6 ? -0.35 + 1.0 * ((u - 0.45) / 0.15) : 0.65 - 1.0 * ((u - 0.6) / 0.4);
                if (u >= 0.58 && !thrown) { thrown = true; const a = ar.rotation.z, px = ar.position.x + Math.cos(a) * 0.41 - Math.sin(a) * 0.08, py = ar.position.y + Math.sin(a) * 0.41 + Math.cos(a) * 0.08;
                    for (let i = 0; i < N; i++) { age[i] = 0; pos.set([px + (Math.random() - 0.5) * 0.04, py, (Math.random() - 0.5) * 0.04], i * 3);
                        if (chaff[i]) vel[i].set(0.05 + (Math.random() - 0.5) * 0.08, 0.12 + Math.random() * 0.1, 0.25 + Math.random() * 0.15); else vel[i].set((Math.random() - 0.5) * 0.06, 0.15, 0); } }
                if (u < 0.5) thrown = false;
                for (let i = 0; i < N; i++) { if (age[i] > 2.2) { pos[i * 3 + 1] = -9; continue; } age[i] += dt;
                    if (!chaff[i]) vel[i].y -= 1.4 * dt; else vel[i].y -= 0.08 * dt;
                    pos[i * 3] += vel[i].x * dt; pos[i * 3 + 1] = Math.max(0.01, pos[i * 3 + 1] + vel[i].y * dt); pos[i * 3 + 2] += vel[i].z * dt; }
                g.attributes.position.needsUpdate = true; };
        }
        if (k === 'restboaz') {   // 누운 보아스 — 고요히 숨 쉰다
            const bd = c.getObjectByName('body');
            return t => { if (bd) bd.scale.y = 1 + Math.sin(t * 1.2 + ph) * 0.05; };
        }
        if (k === 'weddingtent') {   // 혼인 천막 — 천이 바람에 살랑
            const cl = c.getObjectByName('cloth');
            return t => { if (cl) { cl.rotation.x = Math.sin(t * 0.8 + ph) * 0.025; cl.rotation.z = Math.sin(t * 0.6 + ph) * 0.02; } };
        }
        if (k === 'flowerarch') {   // 꽃 아치 문 — 평소엔 활짝 열려 있다(큰 세트 연출에서 닫힌다 — 마 25:10)
            const L = c.getObjectByName('doorL'), Rr = c.getObjectByName('doorR');
            if (L) L.rotation.y = -1.35; if (Rr) Rr.rotation.y = 1.35;
            return null;
        }
        if (k === 'drummer') {   // 소고 — 박자에 맞춰 친다
            const ar = c.getObjectByName('arms'), hd = c.getObjectByName('head');
            return t => { if (ar) { ar.rotation.y = Math.abs(Math.sin(t * 4 + ph)) * 0.12; ar.rotation.z = Math.sin(t * 2 + ph) * 0.05; } if (hd) hd.rotation.y = Math.sin(t * 2 + ph) * 0.15; c.position.y = Math.abs(Math.sin(t * 4 + ph)) * 0.008; };
        }
        if (k === 'trumpeter') {   // 나팔 — 들어 불고, 내려 쉰다
            const ar = c.getObjectByName('arms');
            return t => { if (!ar) return; const u = ((t + ph) % 6) / 6, e = x => x * x * (3 - 2 * x);
                ar.rotation.z = u < 0.1 ? -0.35 + 0.55 * e(u / 0.1) : u < 0.5 ? 0.2 + Math.sin(u * 50) * 0.01 : u < 0.6 ? 0.2 - 0.55 * e((u - 0.5) / 0.1) : -0.35; };
        }
        if (k === 'doorkeeper') {   // 문지기 — 오는 이를 살핀다
            const hd = c.getObjectByName('head');
            return t => { if (hd) hd.rotation.y = Math.sin(t * 0.45 + ph) * 0.5; };
        }
        if (k === 'flowergirl') {   // 꽃잎 뿌리는 아이 — 3초마다 한 줌 뿌리면 꽃잎이 팔랑이며 내려앉는다
            const ar = c.getObjectByName('arm'); if (!ar) return null;
            const N = 18, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), vel = [], age = [];
            const PAL = [[0.96, 0.65, 0.75], [1, 1, 1], [0.96, 0.84, 0.48], [0.9, 0.48, 0.6]];
            for (let i = 0; i < N; i++) { vel.push(new THREE.Vector3()); age.push(9); pos[i * 3 + 1] = -9; col.set(PAL[i % 4], i * 3); }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
            const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.03, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false })); pts.frustumCulled = false; c.add(pts);
            let last = 0, thrown = false;
            return t => { const dt = Math.min(0.05, Math.max(0, t - last)); last = t; const u = ((t + ph) % 3) / 3;
                ar.rotation.z = u < 0.3 ? -0.3 * (u / 0.3) : u < 0.42 ? -0.3 + 1.2 * ((u - 0.3) / 0.12) : 0.9 - 0.9 * ((u - 0.42) / 0.58);
                if (u >= 0.42 && !thrown) { thrown = true;
                    for (let i = 0; i < N; i++) { age[i] = 0; pos.set([0.1 + (Math.random() - 0.5) * 0.03, 0.3, -0.05 + (Math.random() - 0.5) * 0.03], i * 3); vel[i].set(0.12 + Math.random() * 0.12, 0.25 + Math.random() * 0.15, (Math.random() - 0.5) * 0.2); } }
                if (u < 0.3) thrown = false;
                for (let i = 0; i < N; i++) { if (age[i] > 2.6) { pos[i * 3 + 1] = -9; continue; } age[i] += dt;
                    vel[i].y = Math.max(-0.12, vel[i].y - 0.9 * dt); vel[i].x *= 0.98;
                    pos[i * 3] += (vel[i].x + Math.sin(age[i] * 6 + i) * 0.05) * dt; pos[i * 3 + 1] = Math.max(0.005, pos[i * 3 + 1] + vel[i].y * dt); pos[i * 3 + 2] += vel[i].z * dt; }
                g.attributes.position.needsUpdate = true; };
        }
        if (['virgin1', 'virgin2', 'sleepvirgin', 'lampstand', 'oillamps', 'lanternpole', 'foolvirgin', 'torches'].includes(k)) {   // 등불 — 불꽃마다 따로 일렁인다(마 25)
            const ms = []; c.traverse(o => { if (o.isMesh && o.material.emissive && o.material.emissive.getHex()) { o.material = o.material.clone(); ms.push(o.material); } });
            const lp = c.getObjectByName('lamp'), hd = c.getObjectByName('head'), bd = c.getObjectByName('body'), ln = c.getObjectByName('lantern');
            return t => { ms.forEach((m, i) => { m.emissiveIntensity = 1.2 + Math.sin(t * 8 + i * 1.7 + ph) * 0.25 + Math.sin(t * 13 + i) * 0.12; });
                if (lp) lp.rotation.x = Math.sin(t * 1.1 + ph) * 0.05;
                if (hd && k !== 'sleepvirgin') hd.rotation.y = k === 'foolvirgin' ? Math.sin(t * 1.7 + ph) * 0.6 : Math.sin(t * 0.5 + ph) * 0.35;   // 신랑이 오나 둘러본다(꺼져가는 쪽은 다급하게)
                if (k === 'sleepvirgin') { const u = (t + ph) % 8;   // 꾸벅꾸벅 — 고개를 떨구다 가끔 번쩍 든다
                    if (hd) hd.rotation.z = u < 6.5 ? -0.35 - Math.sin(t * 1.2) * 0.04 : -0.35 + Math.sin((u - 6.5) / 1.5 * Math.PI) * 0.3;
                    if (bd) bd.scale.y = 1 + Math.sin(t * 1.1 + ph) * 0.03; }
                if (ln) { ln.rotation.x = Math.sin(t * 1.3 + ph) * 0.08; ln.rotation.z = Math.sin(t * 0.9 + ph) * 0.05; } };
        }
        if (k === 'guest1' || k === 'guest2') {   // 잔치 손님 — 이야기하듯 고개를 돌리고, 가끔 금잔을 들어 올린다
            const ar = c.getObjectByName('arm'), hd = c.getObjectByName('head'), off = k === 'guest2' ? 3.5 : 0;
            return t => { const u = ((t + ph + off) % 7) / 7, e = x => x * x * (3 - 2 * x);
                if (ar) ar.rotation.z = u < 0.12 ? 0.9 * e(u / 0.12) : u < 0.3 ? 0.9 : u < 0.42 ? 0.9 * (1 - e((u - 0.3) / 0.12)) : 0;
                if (hd) { hd.rotation.y = Math.sin(t * 0.7 + ph) * 0.45; hd.rotation.z = Math.sin(t * 1.9 + ph) * 0.05; } };
        }
        if (k === 'servant') {   // 물 붓는 하인 — 물동이를 기울여 붓고 다시 든다(요 2:7)
            const ar = c.getObjectByName('arms');
            return t => { if (!ar) return; const u = ((t + ph) % 5) / 5, e = x => x * x * (3 - 2 * x);
                ar.rotation.z = u < 0.2 ? -0.7 * e(u / 0.2) : u < 0.55 ? -0.7 + Math.sin(u * 40) * 0.02 : u < 0.75 ? -0.7 * (1 - e((u - 0.55) / 0.2)) : 0; };
        }
        if (k === 'garland') {   // 꽃줄 — 바람에 흔들린다
            const g = c.getObjectByName('garland');
            return t => { if (g) g.rotation.x = Math.sin(t * 0.9 + ph) * 0.09 + Math.sin(t * 2.1 + ph) * 0.03; };
        }
        if (k === 'grinder') {   // 맷돌 가는 여인 — 위짝이 돌고 손이 손잡이를 따라 오간다(마 24:41)
            const st = c.getObjectByName('stone'), ar = c.getObjectByName('arms');
            return t => { const a = t * 2.2 + ph; if (st) st.rotation.y = a; if (ar) { ar.rotation.y = Math.sin(a) * 0.18; ar.rotation.z = Math.cos(a) * 0.06; } };
        }
        if (k === 'oven') {   // 진흙 화덕 — 숯불이 일렁인다
            const fl = c.getObjectByName('flame'); if (!fl) return null;
            const ms = []; fl.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); ms.push(o.material); } });
            return t => ms.forEach(m => { m.emissiveIntensity = 1.1 + Math.sin(t * 9 + ph) * 0.25 + Math.sin(t * 15) * 0.15; });
        }
        if (k === 'hens') {   // 닭 세 마리 — 저마다 쪼고, 고개 들고, 가끔 돌아선다
            const hs = [0, 1, 2].map(i => c.getObjectByName('hen' + i)), dir = [0.3, 2.4, -1.2];
            return t => hs.forEach((h, i) => { if (!h) return; const u = (t * 1.3 + i * 1.7 + ph) % 4, peck = u < 1.2 ? Math.abs(Math.sin(u * Math.PI * 2.5)) : 0;
                const ax = new THREE.Vector3(Math.sin(dir[i]), 0, Math.cos(dir[i])); h.quaternion.setFromAxisAngle(ax, peck * 0.5);
                h.rotateY(Math.sin(t * 0.4 + i * 2 + ph) * 0.5); });
        }
        if (k === 'wheatfield') {   // 익은 밀밭 — 일곱 줄이 차례로 숙였다 일어나 바람 물결이 지나간다
            const rows = [0, 1, 2, 3, 4, 5, 6].map(i => c.getObjectByName('row' + i));
            return t => rows.forEach((r, i) => { if (r) r.rotation.x = Math.sin(t * 1.4 - i * 0.55 + ph) * 0.07 + Math.sin(t * 0.5 + ph) * 0.03; });
        }
        if (k === 'reaper') {   // 낫 든 일꾼 — 쓱 베고(빠르게) 천천히 다시 겨눈다
            const ar = c.getObjectByName('arms');
            return t => { if (!ar) return; const u = ((t + ph) % 2.4) / 2.4; ar.rotation.y = u < 0.2 ? 0.5 - 1.0 * (u / 0.2) : -0.5 + 1.0 * ((u - 0.2) / 0.8); ar.rotation.z = -Math.abs(Math.sin(u * Math.PI)) * 0.08; };
        }
        if (k === 'gleaner') {   // 이삭 줍는 여인 — 허리를 굽혀 줍고, 일어나 잠시 둘러본다 (6초)
            const tr = c.getObjectByName('torso');
            return t => { if (!tr) return; const u = ((t + ph) % 6) / 6, e = x => x * x * (3 - 2 * x);
                tr.rotation.z = u < 0.2 ? -0.95 * e(u / 0.2) : u < 0.5 ? -0.95 + Math.sin((u - 0.2) * 40) * 0.04 : u < 0.7 ? -0.95 * (1 - e((u - 0.5) / 0.2)) : 0; };
        }
        if (k === 'boaz') {   // 보아스 — 둘러보다 가끔 오른손을 들어 축복한다 「여호와께서 너희와 함께하시기를」
            const ar = c.getObjectByName('arm'), hd = c.getObjectByName('head');
            return t => { const u = ((t + ph) % 9) / 9, e = x => x * x * (3 - 2 * x);
                if (ar) ar.rotation.z = u < 0.12 ? 2.0 * e(u / 0.12) : u < 0.3 ? 2.0 + Math.sin(u * 30) * 0.05 : u < 0.42 ? 2.0 * (1 - e((u - 0.3) / 0.12)) : 0;
                if (hd) hd.rotation.y = Math.sin(t * 0.4 + ph) * 0.4; };
        }
if (k === 'mender') {   // 그물 깁는 어부 — 손이 바삐 오간다
            const ar = c.getObjectByName('arms'), hd = c;
            return t => { if (ar) { ar.rotation.y = Math.sin(t * 5 + ph) * 0.12; ar.rotation.z = Math.sin(t * 2.5 + ph) * 0.05; } };
        }
        if (k === 'galboat') {   // 고깃배 — 물결에 흔들리고 돛이 바람에 부푼다
        const sl = c.getObjectByName('sail');
        return t => { c.position.y = Math.sin(t * 1.1 + ph) * 0.012; c.rotation.x = Math.sin(t * 0.9 + ph) * 0.04; c.rotation.z = Math.sin(t * 0.7 + ph) * 0.03; if (sl) sl.rotation.z = Math.sin(t * 0.8 + ph) * 0.08; };
    }
    if (k === 'fisherman') {   // 어부 — 그물을 머리 위로 들었다 힘껏 던지고, 거둔다 (5초)
        const ar = c.getObjectByName('arms');
        return t => { if (!ar) return; const u = ((t + ph) % 5) / 5;
            ar.rotation.z = u < 0.4 ? 0.7 * (u / 0.4) : u < 0.5 ? 0.7 - 1.3 * ((u - 0.4) / 0.1) : -0.6 + 0.6 * ((u - 0.5) / 0.5); };
    }
    if (k === 'boat') return t => { c.position.y = Math.sin(t * 1.2 + ph) * 0.012; c.rotation.x = Math.sin(t * 0.9 + ph) * 0.05; c.rotation.z = Math.sin(t * 0.7 + ph) * 0.03; };
            if (k === 'birdhouse') {   // 새집 — 몸은 바람에 살랑, 새는 횃대에서 콩콩 뛰고 가끔 날개를 털며 날아올랐다 내려앉는다
            const bd = c.getObjectByName('bird'), by = bd ? bd.position.y : 0;   // 횃대 높이 — 움직임은 그 위에 더한다
            return t => { c.rotation.z = Math.sin(t * 0.9 + ph) * 0.012;
                if (!bd) return; const u = (t + ph) % 7;
                if (u < 5.6) { bd.position.y = by + Math.abs(Math.sin(u * 4)) * (u % 2 < 1 ? 0.012 : 0); bd.rotation.y = Math.sin(u * 1.3) * 0.6; bd.rotation.z = 0; }
                else { const k2 = (u - 5.6) / 1.4; bd.position.y = by + Math.sin(k2 * Math.PI) * 0.12; bd.rotation.z = Math.sin(t * 40) * 0.25; } };
        }
        if (k === 'lamp') {
                const ms = []; c.traverse(o => { if (o.isMesh && o.material.emissive && o.material.emissive.getHex()) { o.material = o.material.clone(); ms.push(o.material); } });
                return t => ms.forEach(m => { m.emissiveIntensity = 1.1 + Math.sin(t * 1.4 + ph) * 0.35; });
            }
            return null;
        }
        // 누르는 자리 — 모델 면으로 고르면 압축 모델에서 맞지 않고 가는 기둥·성긴 잎(포도 시렁)은 아예 안 짚혔다(10/1).
        // 물건마다 보이지 않는 상자(모델 크기, 너무 작으면 0.35)를 씌워 그 안 어디를 눌러도 골라지게. 크기는 decor.py가 찍은 SIZE(가로·깊이·높이)
        const DECO_BOX = { bench: [0.68, 0.26, 0.46], pot: [0.38, 0.38, 0.44], fence: [0.96, 0.14, 0.39], sign: [0.36, 0.27, 0.62], lamp: [0.17, 0.17, 1.1],
            flowerbed: [1.21, 0.82, 0.19], birdhouse: [0.27, 0.31, 1.06], figtree: [1.13, 1.09, 1.06], palmtree: [1.39, 1.39, 1.37], well: [0.84, 0.69, 0.98],
            arbor: [0.98, 0.79, 0.95], bridge: [2.51, 0.52, 0.48], boat: [1.04, 0.56, 0.2], fountain: [1.1, 1.1, 1.0], gazebo: [1.36, 1.36, 1.17],
            penwall: [2.09, 2.04, 0.33], pengate: [2.06, 0.18, 0.42], sheep: [0.48, 0.25, 0.34], blacksheep: [0.49, 0.24, 0.33], lamb: [0.34, 0.16, 0.23], trough: [0.54, 0.24, 0.28], hay: [0.49, 0.4, 0.52],
            tent: [1.05, 1.25, 0.5], campfire: [0.38, 0.36, 0.28], shepherd: [0.26, 0.29, 0.43], staff: [0.16, 0.03, 0.9], flute: [0.2, 0.02, 0.03], waterskin: [0.19, 0.15, 0.26], rug: [0.66, 0.4, 0.01], dog: [0.55, 0.13, 0.33],
            charcoal: [0.42, 0.39, 0.16], fullnet: [0.92, 0.43, 0.23], breadbasket: [0.3, 0.3, 0.16], woodpile: [0.4, 0.31, 0.19], waterjar: [0.24, 0.24, 0.32], sitlog: [1.06, 0.6, 0.14], disciple: [0.27, 0.2, 0.51], disciple2: [0.27, 0.2, 0.51], pier: [0.37, 2.3, 0.61], hut: [0.68, 0.6, 0.48], fishdry: [0.64, 0.2, 0.45], mooringpost: [0.2, 0.2, 0.52], amphorae: [0.36, 0.29, 0.34], crates: [0.39, 0.22, 0.35], gulls: [0.45, 0.4, 0.3], mender: [0.35, 0.27, 0.41], wheatfield: [1.5, 0.93, 0.41], reaper: [0.34, 0.27, 0.46], gleaner: [0.28, 0.2, 0.51], boaz: [0.17, 0.2, 0.54], sheaves: [0.32, 0.35, 0.3], gleanbasket: [0.19, 0.19, 0.17], meal: [0.4, 0.3, 0.15], booth: [0.77, 0.5, 0.52], boundarystone: [0.2, 0.23, 0.25], threshingfloor: [1.67, 1.65, 0.07], ox: [1.06, 0.32, 0.43], winnower: [0.52, 0.17, 0.54], grainheap: [0.5, 0.43, 0.42], restboaz: [0.52, 0.16, 0.15], strawpile: [0.45, 0.41, 0.23], sacks: [0.27, 0.29, 0.2], measure: [0.31, 0.16, 0.1], winnowtools: [0.21, 0.16, 0.52], granary: [0.71, 0.56, 0.61], harvestbase: [7.4, 3.8, 0.1], cart: [0.73, 0.38, 0.39], donkey: [0.55, 0.3, 0.5], grinder: [0.37, 0.22, 0.41], oven: [0.39, 0.36, 0.18], storejars: [0.32, 0.32, 0.31], hens: [0.25, 0.34, 0.12], bethwell: [0.41, 0.34, 0.36], lowwall: [0.93, 0.16, 0.25], feasttable: [1.26, 0.38, 0.22], breadfruit: [0.44, 0.2, 0.07], stonejars: [0.36, 0.24, 0.2], winepitcher: [0.25, 0.14, 0.13], guestbench: [1.24, 0.12, 0.14], guest1: [0.27, 0.18, 0.49], guest2: [0.28, 0.18, 0.5], garland: [1.44, 0.11, 0.67], servant: [0.26, 0.17, 0.53], virgin1: [0.27, 0.18, 0.51], virgin2: [0.27, 0.18, 0.51], sleepvirgin: [0.29, 0.24, 0.45], oilflasks: [0.19, 0.16, 0.11], oiljar: [0.18, 0.22, 0.33], lampstand: [0.16, 0.16, 0.63], oillamps: [0.77, 0.1, 0.14], lanternpole: [0.2, 0.07, 0.62], waitbench: [0.9, 0.16, 0.14], weddingtent: [0.84, 0.69, 0.64], flowerarch: [0.76, 0.12, 0.74], drummer: [0.22, 0.23, 0.55], trumpeter: [0.43, 0.17, 0.62], doorkeeper: [0.16, 0.19, 0.56], flowergirl: [0.17, 0.13, 0.38], petalpath: [0.36, 1.24, 0.01], flowerurns: [0.54, 0.14, 0.28], torches: [0.52, 0.07, 0.56], foolvirgin: [0.27, 0.2, 0.51], weddingbase: [6.86, 3.91, 0.1], galboat: [2.16, 0.85, 1.8], netrack: [0.84, 0.3, 0.6], netpile: [0.51, 0.27, 0.17], fishbasket: [0.3, 0.3, 0.18], oars: [0.24, 0.2, 0.62], anchorstone: [0.52, 0.25, 0.21], fisherman: [0.31, 0.38, 0.53],
            brook: [2.26, 0.78, 0.04], steppingstones: [0.21, 0.81, 0.06], meadow: [1.13, 0.84, 0.13], restsheep: [0.5, 0.28, 0.23], wildflowers: [0.44, 0.48, 0.24], reeds: [0.23, 0.16, 0.7], olivetree: [1.04, 0.98, 1.16], rock: [0.64, 0.46, 0.38], butterfly: [0.5, 0.3, 0.4] };
        const pickMat = new THREE.MeshBasicMaterial({ visible: false });
        // 놓을 수 있는 곳 — 산마루 안, 그리고 **성과 성문 경사로 바깥**(10/1 사용자: 성 안에는 못 놓게). 성 안엔 생명나무 열두 그루·보좌가 있고,
        // 기초석을 다 놓으면 가장자리(4.95~6)에 띠가 서고 경사로가 6.9까지 나온다. 물건 반지름(r)만큼 더 밀어내 큰 세트도 닿지 않게
        const DECO_CITY = HALF + RAMP_L + 0.15;
        // ext = 물건이 차지하는 [가로 반폭, 세로 반폭](돌린 방향까지). 큰 세트(약 10×4)는 원으로 보면 산마루 밖으로 밀려나 직사각형으로 본다
        // prev(끌기 전 자리)가 있으면 그쪽 성벽 바깥에 붙는다 — 없으면 성을 가로지를 때 반대편으로 튀었다
        // river: 세트·큰 세트는 성 밖으로 흐르는 네 물길(폭 ±0.95)도 피한다 — 큰 세트(약 10)를 남쪽에 두면 양 우리가 강물 위에 놓였다. 낱개(다리·배)는 강 위에 둘 수 있다
        function decoSpot(x, z, ext, prev, river) {
            const lim = PL - 0.4; x = Math.max(-lim, Math.min(lim, x)); z = Math.max(-lim, Math.min(lim, z));
            const [ex, ez] = Array.isArray(ext) ? ext : [ext || 0, ext || 0];
            if (river) {   // 물길 띠를 가로지르면 가까운 쪽으로 비켜난다(가장자리에 닿으면 반대쪽)
                const RV = RB + 0.08;
                if (Math.abs(x) < RV + ex) { const sx = x < 0 ? -1 : 1, nx = sx * (RV + ex); x = Math.abs(nx) <= lim ? nx : -sx * (RV + ex); }
                if (Math.abs(z) < RV + ez && Math.abs(x) < DECO_CITY + ex) { const sz = z < 0 ? -1 : 1, nz = sz * (RV + ez); z = Math.abs(nz) <= lim ? nz : -sz * (RV + ez); }
            }
            if (Math.abs(x) - ex < DECO_CITY && Math.abs(z) - ez < DECO_CITY) {   // 성(+경사로)과 겹친다
                const pin = p => Math.abs(p.x) - ex >= DECO_CITY - 0.01 || Math.abs(p.z) - ez >= DECO_CITY - 0.01;
                const ref = prev && pin(prev) ? (Math.abs(prev.x) - ex >= DECO_CITY - 0.01 ? { x: prev.x, z: 0 } : { x: 0, z: prev.z }) : { x, z };
                if (Math.abs(ref.x) >= Math.abs(ref.z)) x = (ref.x < 0 ? -1 : 1) * Math.min(lim, DECO_CITY + ex); else z = (ref.z < 0 ? -1 : 1) * Math.min(lim, DECO_CITY + ez);
            }
            return [x, z];
        }
        const decoExt = (kind, k, r) => {
            let w = 0.4, d = 0.4;
            if (kind === 'big') { const B = (typeof NJ_BIG !== 'undefined') && NJ_BIG[k]; if (B) { w = B.box[0] / 2 * DS; d = B.box[1] / 2 * DS; } }
            else if (kind === 'set') { const D = (typeof NJ_SETS !== 'undefined') && NJ_SETS[k]; if (D) { w = D.box[0] / 2 * DS; d = D.box[1] / 2 * DS; } }
            else if (kind === 'gift') { w = d = 0.7; }
            else { const b = DECO_BOX[k], sc = k === 'bridge' ? 1.1 : DS * (DIS[k] || 1); if (b) { w = b[0] / 2 * sc; d = b[1] / 2 * sc; } }
            const c = Math.abs(Math.cos(r || 0)), sn = Math.abs(Math.sin(r || 0));
            return [c * w + sn * d, sn * w + c * d];
        };
        // 🌊 바다 해안 꾸미기 (10/1 사용자) — 갈릴리 바닷가는 생명수의 바다, **소성된 나라 해안 띠**에만. 배는 그 앞 물 위.
        //    나라 i의 해안 = 지도 바다 둘레 각도 A0 + SP·i/70 (natRing과 같다). 소성(lv ≥ 1)은 모두가 함께 하는 것이라 하나라도 소성되면 열린다
        const SHORE_A0 = -Math.PI / 2 + 0.13, SHORE_SP = Math.PI * 2 - 0.26, SHORE_Y = -DROP + 0.05;
        const decoMeta = k => (typeof NJ_DECOR !== 'undefined') ? NJ_DECOR.find(v => v.k === k) : null;
        const isSeaItem = (kind, k) => kind === 'set' ? !!((typeof NJ_SETS !== 'undefined') && NJ_SETS[k] && NJ_SETS[k].sea) : kind === 'decor' ? !!(decoMeta(k) || {}).sea : false;
        // 열린 해안(10/1 사용자 — 소성된 나라 하나는 세트보다 좁고, 지금은 소성된 나라가 없다): 바다를 한 칸이라도 맑히면 **강 어귀 양쪽 해안**(나라 0·1·68·69),
        // 나라가 소성되면 **그 나라와 양옆 이웃 해안**까지. 소성될수록 꾸밀 해안이 넓어진다
        const healedNations = () => {
            const ns = (seaW && seaW.nations) || {}, open = new Set();
            if (((seaW && seaW.clear) || 0) >= 1) [0, 1, 68, 69].forEach(i => open.add(i));
            for (let i = 0; i < 70; i++) if (ns[i] && ns[i].lv >= 1) [i - 1, i, i + 1].forEach(j => { if (j >= 0 && j < 70) open.add(j); });
            return [...open].sort((a, b) => a - b);
        };
        let openBand = null;   // 꾸미는 동안 열린 해안을 옅은 금빛 띠로 보여 준다
        function showOpenBand(on) {
            if (openBand) { scene.remove(openBand); openBand.geometry.dispose(); openBand = null; }
            if (!on) return;
            const pos = [], idx = [];
            healedNations().forEach(i => { for (let q = 0; q <= 4; q++) { const a = SHORE_A0 + SHORE_SP * (i + q / 4) / 70; [1.02, 1.25].forEach(r => pos.push(Math.cos(a) * r * SRX, SHORE_Y + 0.03, SZ + Math.sin(a) * r * SRZ)); }
                const b = pos.length / 3 - 10; for (let q = 0; q < 4; q++) { const c = b + q * 2; idx.push(c, c + 1, c + 2, c + 1, c + 3, c + 2); } });
            if (!pos.length) return;
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
            openBand = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide }));
            scene.add(openBand);
        }
        function shoreSpot(x, z, r, mode) {   // mode: 'land' 해안 띠 · 'water' 그 앞 물 · 'edge' 물가(세트 가운데)
            const H = healedNations(); if (!H.length) return null;
            let a = Math.atan2((z - SZ) / SRZ, x / SRX), q = Math.hypot(x / SRX, (z - SZ) / SRZ) || 1;
            const rel = ((a - SHORE_A0) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2), i = Math.floor(rel / SHORE_SP * 70);
            if (rel > SHORE_SP || !H.includes(i)) {   // 소성되지 않은 나라 앞이면 가장 가까운 소성된 나라 해안으로
                let bd = 9; H.forEach(j => { const c = SHORE_A0 + SHORE_SP * (j + 0.5) / 70, d = Math.abs(Math.atan2(Math.sin(a - c), Math.cos(a - c))); if (d < bd) { bd = d; a = c; } });
            }
            const rq = (r || 0.3) / SRX;
            q = mode === 'water' ? Math.max(0.8, Math.min(0.97 - rq, q)) : mode === 'edge' ? 1.03 : Math.max(1.03 + rq, Math.min(1.24 - rq, q));
            return [Math.cos(a) * q * SRX, SZ + Math.sin(a) * q * SRZ];
        }
        const seaFace = (x, z) => Math.atan2(-x, SZ - z);   // 세트의 +z가 바다 가운데를 본다
        const kindOf = it => it.big || (it.kind === 'set' && typeof NJ_BIG !== 'undefined' && NJ_BIG[it.k]) ? 'big' : it.kind;
        function addPick(m, size) {
            const [w, d, h] = (size || [0.9, 0.9, 0.9]).map(v => Math.max(0.35, v));
            const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), pickMat); b.position.y = h / 2; m.add(b); m.userData.pick = b;
        }
        function placeDecor(it) {
            if (!it || it.st || it.in || it.sold) return null;   // 보관함 · 세트로 조립된 낱개 · 판 것은 안 놓는다
            const md0 = decoMeta(it.k) || {}, sea = isSeaItem('decor', it.k), wet = sea && !!md0.water, edge = sea && !!md0.edge;
            const sp = sea ? (shoreSpot(it.x || 0, it.z || 0, Math.max(...decoExt('decor', it.k, 0)), wet ? 'water' : edge ? 'edge' : 'land') || [it.x || 0, it.z || 0])
                           : decoSpot(it.x || 0, it.z || 0, decoExt('decor', it.k, it.r || 0));   // 예전에 성 안에 놓은 것도 바깥으로
            const [px, pz] = sp;
            const m = new THREE.Group(); m.position.set(px, (sea ? (wet ? SEA_Y : SHORE_Y) : terrain(px, pz)) - (md0.drop || 0) * DS * (DIS[it.k] || 1), pz); m.rotation.y = edge ? seaFace(px, pz) : (it.r || 0); m.userData.sea = sea;   // 부두·말뚝은 물가에 걸쳐 바다를 보고 땅속으로 박힌다
            m.userData.item = { kind: 'decor', id: it.id, k: it.k };
            m.scale.setScalar(it.k === 'bridge' ? 1.1 : DS * (DIS[it.k] || 1));   // 순례자 크기에 맞춰(NJ_DECO_S) — 다리는 강을 건너야 해서 그대로
            addPick(m, DECO_BOX[it.k]);
            loadDecor(it.k).then(sc => { if (cur !== C) return; const c = sc.clone(); m.add(c);
                if (it.k === 'fountain') { const wt = c.getObjectByName('water'); if (wt) { const ms = []; wt.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.transparent = true; ms.push(o.material); } });
                    m.userData.anim = t => { wt.scale.set(1 + Math.sin(t * 5.3) * 0.06, 1 + Math.sin(t * 3.7) * 0.12, 1 + Math.sin(t * 4.1 + 1) * 0.06); wt.rotation.y = t * 0.6; ms.forEach(mt => { mt.opacity = 0.75 + Math.sin(t * 7) * 0.12; }); }; } }   // 솟는 물이 일렁이고 돌며 반짝인다(10/2 — 커졌다 작아지기만 했다)
                else { const f = setFx(it.k, c, m, m, { parts: [] }) || idleFx(it.k, c); if (f) m.userData.anim = f; }   // 낱개 모닥불도 일렁이고, 동물·나무·배… 저마다 조금씩
            }).catch(() => { if (cur === C) m.add(decoFallback()); });
            decoG.add(m); return m;
        }
        ((typeof njDecor !== 'undefined' && Array.isArray(njDecor)) ? njDecor : []).forEach(placeDecor);

        // ── 🧩 조립한 세트 (10/1) — 낱개 모델을 세트 배치(NJ_SETS.layout)대로 한 덩어리에. 동물은 안에서 거닌다(setAnim) ──
        const setG = new THREE.Group(); scene.add(setG);
        function setAnim(D, animals) {
            if (!animals.length) return null;
            const [x0, x1, z0, z1] = D.area, spots = D.spots || [];   // 머무는 자리 — 양은 구유·건초 앞, 개는 불가
            const lead = {}; Object.entries(D.follow || {}).forEach(([k, m]) => { lead[k] = animals.find(a => a.k === m); });
            const pick = (a) => {
                const mom = lead[a.k];
                if (mom) {   // 어린양은 흰 양을 졸졸
                    const h = mom.o.rotation.y; a.tx = mom.o.position.x - Math.cos(h) * 0.22 + 0.06; a.tz = mom.o.position.z + Math.sin(h) * 0.22; a.eat = Math.random() < 0.4; return;
                }
                const r = Math.random();
                if (r < 0.4 && spots.length) { const sp = spots[Math.floor(Math.random() * spots.length)]; a.tx = sp[0] + (Math.random() - 0.5) * 0.12; a.tz = sp[1] + (Math.random() - 0.5) * 0.06; a.eat = true; }
                else {   // 아무 데서나(풀을 뜯기도) — 피할 자리(목자·불)는 다시 고른다
                    const av = D.avoid || [];
                    for (let k = 0; k < 8; k++) { a.tx = x0 + Math.random() * (x1 - x0); a.tz = z0 + Math.random() * (z1 - z0); if (!av.some(([ax, az, ar]) => Math.hypot(a.tx - ax, a.tz - az) < ar)) break; }
                    a.eat = Math.random() < 0.35;
                }
            };
            let last = 0;
            return t => {
                const dt = Math.min(0.05, Math.max(0, t - last)); last = t; if (!dt) return;
                animals.forEach(a => {
                    const o = a.o;
                    if (a.wait > 0) {   // 서서 — 먹거나 두리번
                        a.wait -= dt; o.position.y = 0;
                        if (a.head) a.head.rotation.z += ((a.eat ? -0.75 + Math.sin(t * 6 + a.ph) * 0.1 : Math.sin(t * 0.7 + a.ph) * 0.12) - a.head.rotation.z) * Math.min(1, dt * 4);
                        if (a.wait <= 0) pick(a);
                        return;
                    }
                    const dx = a.tx - o.position.x, dz = a.tz - o.position.z, d = Math.hypot(dx, dz);
                    if (d < 0.025) { a.wait = a.eat ? 3 + Math.random() * 4 : 1 + Math.random() * 3; return; }
                    const st = Math.min(d, (lead[a.k] ? 0.22 : a.k === 'dog' ? 0.24 : 0.15) * dt);
                    o.position.x += dx / d * st; o.position.z += dz / d * st;
                    let df = Math.atan2(-dz, dx) - o.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); o.rotation.y += df * Math.min(1, dt * 5);
                    o.position.y = Math.abs(Math.sin(t * 13 + a.ph)) * 0.012;   // 종종걸음
                    if (a.head) a.head.rotation.z += (Math.sin(t * 13 + a.ph) * 0.05 - a.head.rotation.z) * Math.min(1, dt * 6);
                });
            };
        }
        // 세트 안의 작은 연출 — 모닥불 일렁임, 피리 음표, 목자가 가락 따라 고개를 끄덕
        function setFx(k, c, h, m, D) {
            if (k === 'campfire' || k === 'charcoal') {   // 숯불도 같은 일렁임
                const fl = c.getObjectByName('flame'); if (!fl) return null;
                const ms = []; fl.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); ms.push(o.material); } });
                return t => { fl.scale.set(1 + Math.sin(t * 7.3) * 0.08, 1 + Math.sin(t * 9.1) * 0.16 + Math.sin(t * 14.7) * 0.07, 1 + Math.sin(t * 6.1 + 1) * 0.08);
                    fl.rotation.y = Math.sin(t * 1.3) * 0.4; ms.forEach(mt => { mt.emissiveIntensity = 1.2 + Math.sin(t * 11) * 0.25 + Math.sin(t * 17) * 0.15; }); };
            }
            if (k === 'ox' && D.circle) {   // 타작마당 — 소가 썰매를 끌고 마당을 빙빙 돈다, 다리를 번갈아 딛고 가끔 고개 숙여 먹는다
                const [cx, cz, r, sp] = D.circle, legs = [0, 1, 2, 3].map(i => c.getObjectByName('leg' + i)), hd = c.getObjectByName('head'), tl = c.getObjectByName('tail');
                return t => { const a = t * sp; h.position.x = cx + Math.cos(a) * r; h.position.z = cz + Math.sin(a) * r; h.rotation.y = Math.atan2(-Math.cos(a), -Math.sin(a));
                    legs.forEach((l, i) => { if (l) l.rotation.z = Math.sin(t * 5 + ((i === 0 || i === 3) ? 0 : Math.PI)) * 0.32; });
                    if (tl) tl.rotation.x = Math.sin(t * 2.3) * 0.35; const u = t % 9; if (hd) hd.rotation.z = (u < 1.6 ? -0.4 * Math.sin(u / 1.6 * Math.PI) : 0) + Math.sin(t * 10) * 0.03; };
            }
if ((k === 'disciple' || k === 'disciple2') && D.parts.length) return null;   // 세트 안 제자는 idleFx(아래)
        if (k === 'shepherd' && D.parts.includes('flute')) {
                const hd = c.getObjectByName('head');
                return t => { if (hd) { hd.rotation.y = Math.sin(t * 1.1) * 0.12; hd.rotation.x = Math.sin(t * 2.2) * 0.05; } };
            }
            if (k === 'flute' && D.parts.includes('shepherd')) {   // 음표 — 목자가 든 피리 끝에서 하나씩 날아오른다(피리만 따로 놓으면 조용, 큰 세트에서 목자가 걸으러 가면 mute)
                const notes = [0, 1, 2, 3, 4, 5].map(n => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: NOTE_TEX[n % 2], transparent: true, depthWrite: false, opacity: 0 }));
                    sp.scale.setScalar(0.09); m.add(sp); return { sp, age: 9, v: new THREE.Vector3() }; });
                let next = 0, ni = 0, last = 0;
                return t => { const dt = Math.min(0.05, Math.max(0, t - last)); last = t;
                    if (t >= next && !h.userData.mute) { next = t + 0.55 + Math.random() * 0.5; const n = notes[ni++ % notes.length]; n.age = 0;
                        n.sp.position.set(h.position.x + (Math.random() - 0.5) * 0.06, h.position.y + 0.06, h.position.z + 0.1); n.v.set((Math.random() - 0.5) * 0.12, 0.22 + Math.random() * 0.08, 0.05); }
                    notes.forEach(n => { n.age += dt; if (n.age > 2) { n.sp.material.opacity = 0; return; }
                        n.sp.position.addScaledVector(n.v, dt); n.sp.position.x += Math.sin(n.age * 4) * 0.002;
                        n.sp.material.opacity = Math.min(1, n.age * 5) * (1 - n.age / 2); n.sp.scale.setScalar(0.07 + n.age * 0.03); }); };
            }
            return null;
        }
        // 세트 내용(낱개 배치 · 동물 · 작은 효과)을 m 안에 — 보통 세트와 큰 세트가 같이 쓴다. noAnimals면 동물은 만들지 않는다(큰 세트가 직접 움직인다)
        function buildSet(D, m, opt) {
            opt = opt || {};
            const animals = [], fx = [], holders = {};
            const LL = Object.assign({}, D.layout, opt.layout || {});   // 큰 세트 안에선 자리를 바꿀 수 있다(override)
            D.parts.forEach((k, i) => {
                const L = LL[k];
                if (!L && opt.noAnimals) return;
                const h = new THREE.Group(); m.add(h); holders[k] = h;
                if (L) { h.position.set(L[0], L[3] || 0, L[1]); h.rotation.y = L[2] || 0; }
                else { const [x0, x1, z0, z1] = D.area; h.position.set(x0 + Math.random() * (x1 - x0), 0, z0 + Math.random() * (z1 - z0)); h.rotation.y = Math.random() * 6.28;
                    animals.push({ o: h, k, wait: Math.random() * 2, tx: h.position.x, tz: h.position.z, eat: false, head: null, ph: i * 1.7 }); }
                loadDecor(k).then(sc => { if (!(cur === C)) return; const c = sc.clone(); h.add(c); const an = animals.find(q => q.o === h); if (an) an.head = c.getObjectByName('head');
                    const f = setFx(k, c, h, m, D) || (an ? null : idleFx(k, c)); if (f) fx.push(f); })   // 세트 안 천막·건초·물부대도 바람에
                    .catch(() => {});
            });
            const walk = setAnim(D, animals);
            Object.values(holders).forEach(watchMove);   // 움직이는 조각은 발밑 그늘로
            return { anim: t => { if (walk) walk(t); fx.forEach(f => f(t)); }, holders };
        }
        // ── 🏞️ 큰 세트 「목자의 언덕」 연출 — 목자가 일어나 양 떼를 이끌고 물가로 갔다 돌아온다(요 10:4 「앞서 가면 양들이 그의 음성을 아는 고로 따라오되」) ──
        //    한 바퀴: 앉아 피리 → 일어나 우리로 → 문 앞에 양이 모인다 → 앞서 걸으면 줄지어 따라온다 → 시냇가에서 마시고 뜯는다 → 다시 우리로 → 쉼터로 돌아가 앉는다
        function bigShow(B, m, subs) {
            const P = B.path, Ld = B.leads, SP = 0.42;
            const flock = Ld.flock.map((k, i) => { const h = new THREE.Group(); m.add(h);
                h.position.set(P.penArea[0] + Math.random() * (P.penArea[1] - P.penArea[0]), 0, P.penArea[2] + Math.random() * (P.penArea[3] - P.penArea[2]));
                const a = { o: h, k, head: null, tx: h.position.x, tz: h.position.z, wait: Math.random() * 2, eat: false, ph: i * 1.9 };
                loadDecor(k).then(sc => { if (!(cur === C)) return; const c = sc.clone(); h.add(c); a.head = c.getObjectByName('head'); }).catch(() => {});
                return a; });
            const W = new THREE.Group(); W.visible = false; m.add(W); let legs = [], wHead = null;
            flock.forEach(a => watchMove(a.o)); watchMove(W);
            loadDecor(Ld.walker).then(sc => { if (!(cur === C)) return; const c = sc.clone(); W.add(c); legs = [c.getObjectByName('legL'), c.getObjectByName('legR')]; wHead = c.getObjectByName('head'); }).catch(() => {});
            const seatH = subs[Ld.seatSet] && subs[Ld.seatSet].holders[Ld.seatPart], fluteH = subs[Ld.seatSet] && subs[Ld.seatSet].holders[Ld.flutePart];
            const gateH = subs[Ld.set] && subs[Ld.set].holders.pengate; let door = null, doorA = 0;   // 우리 문짝(축 door) — 목자·양이 가까이 오면 바깥쪽으로 열린다
            const seat = P.seat, Rt = P.routes, gth = P.gather;   // 길은 바닥(hillbase)의 흙길을 따른다
            const S = [
                { sit: 8, mode: 'pen' },
                { walk: Rt.toPen, mode: 'pen', gatherAt: 0.55 },
                { wait: 2.5, mode: 'gather' },
                { walk: Rt.lead, mode: 'follow' },
                { wait: 14, mode: 'graze' },
                { walk: Rt.back, mode: 'follow' },
                { wait: 2, mode: 'pen' },
                { walk: Rt.home, mode: 'pen' },
            ];
            const lenOf = pts => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L; };
            S.forEach(s => { s.dur = s.walk ? lenOf(s.walk) / SP : (s.sit || s.wait); });
            const total = S.reduce((a, s) => a + s.dur, 0);
            const at = (pts, d) => { for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
                if (d <= L || i === pts.length - 1) { const u = L ? Math.max(0, Math.min(1, d / L)) : 1; return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]; } d -= L; } return pts[pts.length - 1]; };
            const moveTo = (a, tx, tz, sp, dt, t) => { const o = a.o, dx = tx - o.position.x, dz = tz - o.position.z, d = Math.hypot(dx, dz);
                if (d < 0.02) { o.position.y = 0; return true; }
                const st = Math.min(d, sp * dt); o.position.x += dx / d * st; o.position.z += dz / d * st;
                let df = Math.atan2(-dz, dx) - o.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); o.rotation.y += df * Math.min(1, dt * 6);
                o.position.y = Math.abs(Math.sin(t * 13 + a.ph)) * 0.012; if (a.head) a.head.rotation.z += (Math.sin(t * 13) * 0.05 - a.head.rotation.z) * Math.min(1, dt * 6); return false; };
            const headTo = (a, eat, t, dt) => { if (a.head) a.head.rotation.z += ((eat ? -0.75 + Math.sin(t * 6 + a.ph) * 0.1 : Math.sin(t * 0.7 + a.ph) * 0.12) - a.head.rotation.z) * Math.min(1, dt * 4); };
            const penPick = a => { if (Math.random() < 0.4) { const sp = P.penSpots[Math.floor(Math.random() * P.penSpots.length)]; a.tx = sp[0]; a.tz = sp[1]; a.eat = true; }
                else { a.tx = P.penArea[0] + Math.random() * (P.penArea[1] - P.penArea[0]); a.tz = P.penArea[2] + Math.random() * (P.penArea[3] - P.penArea[2]); a.eat = Math.random() < 0.35; } };
            const trail = []; let last = 0, t0 = null, lastMode = 'pen';
            return t => {
                const dt = Math.min(0.05, Math.max(0, t - last)); last = t; if (!dt) return; if (t0 === null) t0 = t;
                let u = (t - t0) % total, si = 0; while (u > S[si].dur && si < S.length - 1) { u -= S[si].dur; si++; }
                const s = S[si], sitting = !!s.sit;
                W.visible = !sitting; if (seatH) seatH.visible = sitting; if (fluteH) { fluteH.visible = sitting; fluteH.userData.mute = !sitting; }
                let wx = seat[0], wz = seat[1], moving = false;
                if (s.walk) { [wx, wz] = at(s.walk, u * SP); moving = u < s.dur - 0.05; const [nx, nz] = at(s.walk, u * SP + 0.05); if (Math.hypot(nx - wx, nz - wz) > 1e-4) W.rotation.y = Math.atan2(-(nz - wz), nx - wx); }
                else if (s.wait) { const p = S[si - 1].walk; [wx, wz] = p[p.length - 1]; }
                W.position.set(wx, moving ? Math.abs(Math.sin(t * 9)) * 0.01 : 0, wz);
                const sw = moving ? Math.sin(t * 9) * 0.5 : 0; if (legs[0]) legs[0].rotation.z = sw; if (legs[1]) legs[1].rotation.z = -sw;
                if (wHead) wHead.rotation.y = moving ? 0 : Math.sin(t * 0.5) * 0.4;
                trail.push([t, wx, wz]); while (trail.length > 2 && trail[0][0] < t - 6) trail.shift();
                if (!door && gateH) door = gateH.getObjectByName('door');
                if (door && P.gate) {   // 문 — 목자가 다가오거나, 양이 드나드는 동안 열려 있다
                    const g = P.gate, near = s.mode === 'gather' || Math.hypot(wx - g[0], wz - g[1]) < 0.75 ||
                        (s.mode === 'follow' && flock.some(a => Math.hypot(a.o.position.x - g[0], a.o.position.z - g[1]) < 0.6));
                    doorA += ((near ? 1.7 : 0) - doorA) * Math.min(1, dt * 2.5); door.rotation.y = doorA;
                }
                if (s.mode !== lastMode) {   // 자리·줄 순서는 바뀌는 순간의 위치로 — 미리 정해 두면 서로 가로질렀다(10/1 사용자: 시냇가에서 흰 양·검은 양이 엇갈린다)
                    if (s.mode === 'pen') flock.forEach(a => { a.wait = 0; penPick(a); });
                    if (s.mode === 'graze') { const sp = P.graze.slice().sort((p, q) => p[0] - q[0]); flock.slice().sort((p, q) => p.o.position.x - q.o.position.x).forEach((a, k) => { a.g = sp[k % sp.length]; }); }
                    if (s.mode === 'follow') flock.slice().sort((p, q) => Math.hypot(p.o.position.x - wx, p.o.position.z - wz) - Math.hypot(q.o.position.x - wx, q.o.position.z - wz)).forEach((a, k) => { a.rank = k; });   // 목자에게 가까운 양이 앞
                    lastMode = s.mode;
                }
                const gather = s.mode === 'gather' || (s.gatherAt && u / s.dur > s.gatherAt);
                flock.forEach((a, i) => {
                    if (s.mode === 'follow') {   // 목자의 발자취를 조금씩 늦게 — 줄지어 따라온다
                        const rk = a.rank == null ? i : a.rank, lag = 0.9 * (rk + 1); let p = trail[0]; for (const q of trail) { if (q[0] <= t - lag) p = q; else break; }
                        const off = (rk % 2 ? 1 : -1) * 0.05; if (moveTo(a, p[1] + off, p[2] + off, 0.6, dt, t)) headTo(a, false, t, dt); return;
                    }
                    if (gather) { if (moveTo(a, gth[0] - (i % 2) * 0.1, gth[1] + (i - 1) * 0.16, 0.35, dt, t)) headTo(a, false, t, dt); return; }
                    if (s.mode === 'graze') { const g = a.g || P.graze[i % P.graze.length]; if (moveTo(a, g[0], g[1], 0.4, dt, t)) headTo(a, true, t, dt); return; }
                    if (a.wait > 0) { a.wait -= dt; headTo(a, a.eat, t, dt); return; }
                    if (moveTo(a, a.tx, a.tz, 0.15, dt, t)) { a.wait = 2 + Math.random() * 4; penPick(a); }
                });
            };
        }
        // ── 🏞️ 큰 세트 「디베랴 바닷가」 연출 (요 21:3-11) — 배가 나가 밤새 빈 그물 → 오른편에 던지니 물고기 떼가 가득 → 무거운 그물을 끌고 돌아와 숯불 곁에 ──
        function fishShow(B, m, subs) {
            const F = B.fishing, bs = subs[F.boatSet], ns = subs[F.netSet];
            const boatH = bs && bs.holders[F.boat], netH = ns && ns.holders[F.net];
            if (!boatH || !netH) return null;
            const bOff = B.offsets[F.boatSet], nOff = B.offsets[F.netSet];
            const home = boatH.position.clone(), home0y = home.y, homeRot = F.moor ? F.moorRot : boatH.rotation.y, netHome = netH.position.clone();
            const toBoat = (x, z) => [x - bOff[0], z - bOff[1]], toNet = (x, z) => [x - nOff[0], z - nOff[1]];
            const S0 = F.moor ? F.moor.slice() : [home.x + bOff[0], home.z + bOff[1]], P1 = F.out, R1 = F.back;   // 쉴 때는 부두 곁에 매어 둔다(moor)
            const side = (p, s) => [p[0] + Math.sin(head) * 0.7 * s, p[1] + Math.cos(head) * 0.7 * s];   // 배의 오른편(s=1)·왼편(s=-1) — 배 모델은 +x가 이물
            // 물결 고리와 물고기 떼(반짝이는 점)
            const ring = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.2, 32), new THREE.MeshBasicMaterial({ color: 0xe8fbff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
            ring.rotation.x = -Math.PI / 2; m.add(ring);
            const FN = 60, fp = new Float32Array(FN * 3), fseed = [];
            for (let i = 0; i < FN; i++) fseed.push([Math.random() * 6.28, 0.1 + Math.random() * 0.32, Math.random() * 6.28]);
            const fg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(fp, 3));
            const fish = new THREE.Points(fg, new THREE.PointsMaterial({ color: 0xcfe9ff, size: 0.09, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
            m.add(fish);
            // 매는 밧줄 — 부두 끝 말뚝(tie)에서 이물로, 조금 처지게. 매어 있을 때만
            const RN = 9, rp = new Float32Array(RN * 3), rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3));
            const rope = new THREE.Line(rg, new THREE.LineBasicMaterial({ color: 0xd6c59a })); rope.visible = false; rope.frustumCulled = false; if (F.tie) m.add(rope);
            const tieRope = () => { const bx = S0[0] + Math.cos(head) * 0.98, bz = S0[1] - Math.sin(head) * 0.98, by = home0y + 0.4, [tx, ty, tz] = F.tie;
                for (let i = 0; i < RN; i++) { const u = i / (RN - 1); rp[i * 3] = tx + (bx - tx) * u; rp[i * 3 + 1] = ty + (by - ty) * u - Math.sin(u * Math.PI) * 0.08; rp[i * 3 + 2] = tz + (bz - tz) * u; }
                rg.attributes.position.needsUpdate = true; };
            const lerp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], ez = u => u * u * (3 - 2 * u);
            const T = [6, 8, 10, 3, 10, 2, 13, 6, 2];   // 쉼 · 나감 · 빈 그물 · 오른편 · 끌고 옴 · 해안에 · 아침 · 돌아감 · 정리
            const total = T.reduce((a, b) => a + b, 0);
            let last = 0, t0 = null, head = homeRot, cdt = 0;
            const turn = to => { let d = to - head; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; head += d * Math.min(1, cdt * 2.2); };   // 뱃머리는 천천히 돈다
            const setBoat = (p, dirTo) => { const [lx, lz] = toBoat(p[0], p[1]); if (dirTo) { const dx = dirTo[0] - p[0], dz = dirTo[1] - p[1]; if (Math.hypot(dx, dz) > 0.05) turn(Math.atan2(-dz, dx)); }
                boatH.position.set(lx, home0y, lz); boatH.rotation.y = head; };
            const splash = (p, r, op) => { ring.position.set(p[0], -0.12, p[1]); ring.scale.setScalar(r); ring.material.opacity = op; };
            const school = (c, spread, op, t) => { for (let i = 0; i < FN; i++) { const [a, r, ph] = fseed[i], rr = r * spread;
                fp[i * 3] = c[0] + Math.cos(a + t * 0.6) * rr; fp[i * 3 + 1] = -0.11 + Math.abs(Math.sin(t * 7 + ph)) * 0.06; fp[i * 3 + 2] = c[1] + Math.sin(a + t * 0.6) * rr; }
                fg.attributes.position.needsUpdate = true; fish.material.opacity = op * (0.6 + 0.4 * Math.sin(t * 9)); };
            return t => {
                const dt = Math.min(0.05, Math.max(0, t - last)); last = t; if (!dt) return; if (t0 === null) t0 = t; cdt = dt;
                let u = (t - t0) % total, ph = 0; while (u > T[ph]) { u -= T[ph]; ph++; }
                const k = u / T[ph];
                netH.visible = ph >= 4 && ph <= 7;
                if (ph === 0) { head = homeRot; setBoat(S0); splash([0, 0], 0, 0); fish.material.opacity = 0; }
                else if (ph === 1) setBoat(lerp(S0, P1, ez(k)), P1);                                   // 바다로 나간다
                else if (ph === 2) {   // 밤새 빈 그물 — 물결만
                    setBoat([P1[0] + Math.sin(u * 0.4) * 0.15, P1[1] + Math.cos(u * 0.3) * 0.1]);
                    const c = (u % 3.3) / 3.3; splash(side(P1, -1), 0.5 + c * 2.2, (1 - c) * 0.6);   // 왼편에 던져도 빈 그물
                }
                else if (ph === 3) { setBoat(P1); const c = side(P1, 1); splash(c, 0.6 + k * 4, (1 - k) * 0.9); school(c, 0.3 + k * 0.7, k, t); }   // 오른편에 — 물고기 떼가 반짝
                else if (ph === 4) {   // 무거운 그물을 끌고 천천히
                    const p = lerp(P1, R1, ez(k)); setBoat(p, R1);
                    const bk = [p[0] - Math.cos(head) * 0.55, p[1] + Math.sin(head) * 0.55], [nx, nz] = toNet(bk[0], bk[1]);
                    netH.position.set(nx, -0.1, nz); netH.rotation.y = head; school(bk, 0.6, 0.8, t); splash([0, 0], 0, 0);
                }
                else if (ph === 5) {   // 해안으로 끌어올린다
                    const bk = [R1[0] - Math.cos(head) * 0.55, R1[1] + Math.sin(head) * 0.55], [nx, nz] = toNet(bk[0], bk[1]);
                    netH.position.set(nx + (netHome.x - nx) * ez(k), -0.1 * (1 - k), nz + (netHome.z - nz) * ez(k)); netH.rotation.y = head * (1 - k);
                    fish.material.opacity = 0.5 * (1 - k);
                }
                else if (ph === 6) { netH.position.copy(netHome); netH.rotation.y = 0; fish.material.opacity = 0; }   // 숯불 곁 아침
                else if (ph === 7) setBoat(lerp(R1, S0, ez(k)), S0);                                    // 배는 제자리로
                else { turn(homeRot); setBoat(S0); netH.visible = false; }   // 제자리 방향으로
                if (ph === 6 || ph === 8) { boatH.position.y = home0y; }
                rope.visible = !!F.tie && (ph === 0 || (ph === 1 && k < 0.04) || ph === 8); if (rope.visible) tieRope();   // 떠날 때 풀고, 돌아와 다시 맨다
            };
        }
        // ── 🌾 큰 세트 「베들레헴의 추수」 연출 — 나귀가 수레를 끌고 곳간을 나서 밭에 들러(곡식단을 싣고) 타작마당을 지나 곳간으로 돌아오면 곳간 문이 열린다 ──
        // B.haul = { set, donkey, cart, store, path: 닫힌 길의 점들(큰 세트 안 좌표), stops: [[점 번호, 기다리는 초]…], speed, gap: 나귀와 수레 사이 }
        function haulShow(B, m, subs) {
            const H = B.haul, S = subs[H.set]; if (!S) return null;
            const dH = S.holders[H.donkey], cH = S.holders[H.cart], gH = S.holders[H.store]; if (!dH || !cH) return null;
            const off = B.offsets[H.set], ro = off[2] || 0, rc = Math.cos(ro), rs = Math.sin(ro);
            const toL = (x, z) => { const dx = x - off[0], dz = z - off[1]; return [dx * rc - dz * rs, dx * rs + dz * rc]; };   // 큰 세트 좌표 → 돌아 있는 세트 안 좌표
            const curve = new THREE.CatmullRomCurve3(H.path.map(p => new THREE.Vector3(p[0], 0, p[1])), true, 'centripetal');
            const L = curve.getLength(), N = 600, pts = curve.getSpacedPoints(N);
            const sOf = i => { const q = new THREE.Vector3(H.path[i][0], 0, H.path[i][1]); let b = 0, bd = 1e9; pts.forEach((p, k) => { const d = p.distanceToSquared(q); if (d < bd) { bd = d; b = k; } }); return b / N * L; };
            const stops = H.stops.map(([i, w]) => [sOf(i), w]).sort((a, b) => a[0] - b[0]);
            const v = H.speed || 0.5, gap = H.gap || 0.6;
            const total = L / v + stops.reduce((a, s) => a + s[1], 0);
            const sAt = u => {   // 한 바퀴 안 시각 u → 길 위 거리 s (멈춤 포함), 멈춘 중이면 그 번호
                let s = 0, t = u, stop = -1;
                for (let i = 0; i < stops.length; i++) {
                    const run = (stops[i][0] - s) / v;
                    if (t < run) return [s + t * v, -1];
                    t -= run; s = stops[i][0];
                    if (t < stops[i][1]) return [s, i];
                    t -= stops[i][1];
                }
                return [Math.min(L, s + t * v), stop];
            };
            const at = s => { s = ((s % L) + L) % L; const u = s / L; return [curve.getPointAt(u), curve.getTangentAt(u)]; };
            const legs = [0, 1, 2, 3].map(i => () => dH.children[0] && dH.children[0].getObjectByName('leg' + i));
            const wheels = ['wheelL', 'wheelR'].map(n => () => cH.children[0] && cH.children[0].getObjectByName(n));
            const door = () => gH && gH.children[0] && gH.children[0].getObjectByName('door');
            let last = 0, t0 = null, prevS = 0, roll = 0, doorA = 0;
            return t => {
                const dt = Math.min(0.05, Math.max(0, t - last)); last = t; if (!dt) return; if (t0 === null) t0 = t;
                const [s, stopI] = sAt((t - t0) % total), moving = stopI < 0;
                const [p, tg] = at(s), [pc, tc] = at(s - gap);
                const [dx, dz] = toL(p.x, p.z), [cx, cz] = toL(pc.x, pc.z);
                dH.position.x = dx; dH.position.z = dz; dH.rotation.y = Math.atan2(-tg.z, tg.x) - ro;
                cH.position.x = cx; cH.position.z = cz; cH.rotation.y = Math.atan2(-tc.z, tc.x) - ro;
                let ds = s - prevS; if (ds < -L / 2) ds += L; prevS = s; roll -= Math.max(0, ds) / 0.115;
                wheels.forEach(w => { const o = w(); if (o) o.rotation.z = roll; });
                legs.forEach((l, i) => { const o = l(); if (o) o.rotation.z = moving ? Math.sin(t * 7 + ((i === 0 || i === 3) ? 0 : Math.PI)) * 0.4 : o.rotation.z * 0.9; });
                // 곳간 문 — 돌아오는 길 끝 1.5 앞부터 열리고, 곳간 앞에 멈춘 처음 6초 열려 있다가 닫힌다
                const home = stops.findIndex(st => st[0] < 1e-6 || Math.abs(st[0] - L) < 1e-6);
                const elapsedHome = (() => { if (stopI !== home || home < 0) return 1e9; let tt = (t - t0) % total, acc = 0; for (let i = 0; i < stops.length; i++) { acc += (stops[i][0] - (i ? stops[i - 1][0] : 0)) / v; if (i === home) break; acc += stops[i][1]; } return tt - acc; })();
                const want = (moving && (L - s) < 1.5 && s > L / 2) || (stopI === home && elapsedHome < 6) ? 1 : 0;
                doorA += (want - doorA) * Math.min(1, dt * 1.8); const d = door(); if (d) d.rotation.y = H.doorOpen * doorA;
            };
        }
        // ── 💒 큰 세트 「보라 신랑이로다」 연출 (마 25:1-13) — 한 바퀴 58초 ──
        // 기다림 → 멀리서 빛(신랑 — 사람 모양 없이 빛으로만)이 다가와 문 앞에 → 졸던 처녀가 깨고, 등불 든 처녀 둘이 빛을 따라 문 안 천막 곁으로 →
        // 문이 닫힌다 → 등불 꺼진 처녀가 늦게 와 닫힌 문 앞에 서서 두드린다(25:11) → 문이 다시 열리고 모두 제자리로
        // B.wedding = { vset, walkers, sleeper, fool, gate: { set, part }, routes: [[x, z]…] (사람마다), foolStand: [x, z], light: [[x, z, 높이]…] } — 큰 세트 안 좌표
        function brideShow(B, m, subs) {
            const W = B.wedding, VS = subs[W.vset], GS = subs[W.gate.set]; if (!VS || !GS) return null;
            const offOf = sk => B.offsets[sk] || [0, 0, 0];
            const toL = (sk, x, z) => { const o = offOf(sk), r = o[2] || 0, c = Math.cos(r), s = Math.sin(r), dx = x - o[0], dz = z - o[1]; return [dx * c - dz * s, dx * s + dz * c]; };
            const bigOf = (sk, h) => { const o = offOf(sk), r = o[2] || 0, c = Math.cos(r), s = Math.sin(r); return [o[0] + h.position.x * c + h.position.z * s, o[1] - h.position.x * s + h.position.z * c]; };
            const place = (sk, h, x, z, head) => { const [lx, lz] = toL(sk, x, z); h.position.x = lx; h.position.z = lz; if (head !== undefined) h.rotation.y = head - (offOf(sk)[2] || 0); };
            const along = (pts, d) => {
                for (let i = 1; i < pts.length; i++) {
                    const [x0, z0] = pts[i - 1], [x1, z1] = pts[i], L = Math.hypot(x1 - x0, z1 - z0);
                    if (d <= L || i === pts.length - 1) { const u = L ? Math.min(1, Math.max(0, d / L)) : 1; return [x0 + (x1 - x0) * u, z0 + (z1 - z0) * u, Math.atan2(-(z1 - z0), x1 - x0)]; }
                    d -= L;
                }
                return [pts[0][0], pts[0][1], 0];
            };
            const lenOf = pts => pts.slice(1).reduce((a, p, i) => a + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
            const ez = x => x * x * (3 - 2 * x), lerp3 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
            const walkers = W.walkers.map((k, i) => { const h = VS.holders[k]; if (!h) return null; const home = bigOf(W.vset, h); const pts = [home, ...W.routes[i]]; return { h, home, rot0: h.rotation.y, pts, L: lenOf(pts), delay: i * 1.0 }; }).filter(Boolean);
            const fool = VS.holders[W.fool], foolHome = fool ? bigOf(W.vset, fool) : null, foolRot0 = fool ? fool.rotation.y : 0, foolPts = fool ? [foolHome, W.foolStand] : null, foolL = fool ? lenOf(foolPts) : 0;
            const sleeper = VS.holders[W.sleeper], gateH = GS.holders[W.gate.part];
            // 빛 — 둥근 빛 하나와 그 둘레를 도는 작은 빛 셋(신랑을 맞는 등불 행렬)
            const cv = document.createElement('canvas'); cv.width = cv.height = 64; const cx = cv.getContext('2d');
            const gr = cx.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,240,190,0.9)'); gr.addColorStop(1, 'rgba(255,220,140,0)');
            cx.fillStyle = gr; cx.fillRect(0, 0, 64, 64); const tex = new THREE.CanvasTexture(cv);
            const mk = (col, sc) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.scale.setScalar(sc); m.add(s); return s; };
            const glow = mk(0xfff4d0, 0.9), trail = [0, 1, 2].map(() => mk(0xffd080, 0.28));
            const TOT = 58;
            let t0 = null;
            return t => {
                if (t0 === null) t0 = t; const u = (t - t0) % TOT;
                // 빛
                const Lg = W.light; let lp = null, op = 0;
                if (u >= 8 && u < 15) { const k = (u - 8) / 7; lp = lerp3(Lg[0], Lg[1], ez(k)); op = Math.min(1, k * 2); }
                else if (u >= 15 && u < 22) { lp = lerp3(Lg[1], Lg[2], ez((u - 15) / 7)); op = 1; }
                else if (u >= 22 && u < 25) { lp = lerp3(Lg[2], Lg[3], ez((u - 22) / 3)); op = 1; }
                else if (u >= 25 && u < 49) { lp = Lg[3]; op = 1; }
                else if (u >= 49 && u < 52) { lp = Lg[3]; op = 1 - (u - 49) / 3; }
                if (lp) {
                    glow.position.set(lp[0], lp[2] + Math.sin(u * 2) * 0.03, lp[1]); const rest = u >= 25 ? 0.7 : 1;   // 천막 위에 머물 때는 조금 작고 은은하게(천막을 가리지 않게)
                    glow.material.opacity = op * rest * (0.85 + 0.15 * Math.sin(u * 5)); glow.scale.setScalar((0.8 + 0.1 * Math.sin(u * 3)) * rest);
                    trail.forEach((s, i) => { const a = u * 1.5 + i * 2.1; s.position.set(lp[0] + Math.cos(a) * 0.25, lp[2] - 0.15 + Math.sin(a * 1.3) * 0.05, lp[1] + Math.sin(a) * 0.25); s.material.opacity = op * 0.7; });
                } else { glow.material.opacity = 0; trail.forEach(s => { s.material.opacity = 0; }); }
                // 등불 든 처녀들 — 빛을 따라 문 안으로, 끝나면 돌아온다
                walkers.forEach(w => {
                    if (u < 15 + w.delay) { place(W.vset, w.h, w.home[0], w.home[1]); w.h.rotation.y = w.rot0; w.h.position.y = 0; return; }
                    if (u < 49) { const d = Math.min(w.L, (u - 15 - w.delay) * 0.35), [x, z, hd] = along(w.pts, d); place(W.vset, w.h, x, z, d < w.L ? hd : undefined); w.h.position.y = d < w.L ? Math.abs(Math.sin(u * 7)) * 0.01 : 0; return; }
                    const back = w.pts.slice().reverse(), d = Math.min(w.L, Math.max(0, (u - 49 - w.delay * 0.5) * 0.35)), [x, z, hd] = along(back, d);
                    place(W.vset, w.h, x, z, d > 0 && d < w.L ? hd : undefined); w.h.position.y = d > 0 && d < w.L ? Math.abs(Math.sin(u * 7)) * 0.01 : 0; if (d >= w.L) w.h.rotation.y = w.rot0;
                });
                // 등불 꺼진 처녀 — 늦게 와서 닫힌 문 앞에 선다, 두드린다
                if (fool) {
                    const c0 = fool.children[0], fh = c0 && c0.getObjectByName('head');
                    if (u < 30) { place(W.vset, fool, foolHome[0], foolHome[1]); fool.rotation.y = foolRot0; }
                    else if (u < 49) { const d = Math.min(foolL, (u - 30) * 0.3), [x, z, hd] = along(foolPts, d); place(W.vset, fool, x, z, d < foolL ? hd : Math.PI / 2);
                        if (fh && d >= foolL && u > 37 && u < 46) fh.rotation.z = Math.sin(u * 9) * 0.12; }
                    else { const back = foolPts.slice().reverse(), d = Math.min(foolL, (u - 49) * 0.3), [x, z, hd] = along(back, d); place(W.vset, fool, x, z, d < foolL ? hd : undefined); if (d >= foolL) fool.rotation.y = foolRot0; if (fh) fh.rotation.z = 0; }
                }
                // 졸던 처녀가 깬다
                if (sleeper && u >= 14 && u < 49) { const c0 = sleeper.children[0], hd = c0 && c0.getObjectByName('head'); if (hd) { hd.rotation.z = 0.05; hd.rotation.y = Math.sin(u * 1.2) * 0.5; } }
                // 문 — 처녀들이 들어간 뒤 닫히고(25:10), 끝에 다시 열린다
                const open = u < 27 ? 1 : u < 30 ? 1 - ez((u - 27) / 3) : u < 46 ? 0 : u < 49 ? ez((u - 46) / 3) : 1;
                const g0 = gateH && gateH.children[0];
                if (g0) { const dl = g0.getObjectByName('doorL'), dr = g0.getObjectByName('doorR'); if (dl) dl.rotation.y = -1.35 * open; if (dr) dr.rotation.y = 1.35 * open; }
            };
        }
        function placeBig(rec) {
            const B = (typeof NJ_BIG !== 'undefined') ? NJ_BIG[rec.s] : null; if (!B) return null;
            const [px, pz] = B.sea ? (shoreSpot(rec.x || 0, rec.z || 0, 0, 'edge') || [rec.x || 0, rec.z || 0]) : decoSpot(rec.x || 0, rec.z || 0, decoExt('big', rec.s, rec.r || 0), null, true);
            const m = new THREE.Group(); m.position.set(px, B.sea ? SHORE_Y : terrain(px, pz), pz); m.rotation.y = B.sea ? seaFace(px, pz) : (rec.r || 0); m.scale.setScalar(DS); m.userData.sea = !!B.sea;
            m.userData.item = { kind: 'set', id: rec.id, k: rec.s, big: true };
            const subs = {}, anims = [];
            B.sets.forEach(sk => { const [ox, oz, oy, lift] = B.offsets[sk], g = new THREE.Group(); g.position.set(ox, lift || 0, oz); g.rotation.y = oy || 0; m.add(g);
                const b = buildSet(NJ_SETS[sk], g, { noAnimals: B.leads && B.leads.set === sk, layout: B.override && B.override[sk] }); subs[sk] = b; anims.push(b.anim); });
            (B.extras || []).forEach(e => {   // 큰 세트만의 바닥·그늘 나무
                const h = new THREE.Group(); h.position.set(e.at[0], e.at[3] || 0, e.at[1]); h.rotation.y = e.at[2] || 0; m.add(h);   // 바닥은 시냇물을 덮지 않게 조금 낮게
                loadDecor(e.k).then(sc => { if (!(cur === C)) return; const c = sc.clone(); h.add(c); const f = idleFx(e.k, c); if (f) anims.push(f); }).catch(() => {});
            });
            const show = B.leads ? bigShow(B, m, subs) : B.fishing ? fishShow(B, m, subs) : B.haul ? haulShow(B, m, subs) : B.wedding ? brideShow(B, m, subs) : null;
            m.userData.anim = t => { anims.forEach(a => a(t)); if (show) show(t); };
            setG.add(m); addPick(m, B.box); return m;
        }
        function placeSet(rec) {
            if (!rec || rec.st || rec.in) return null;   // 보관함 · 큰 세트에 들어간 세트는 따로 안 놓는다
            if (rec.big) return placeBig(rec);
            const D = (typeof NJ_SETS !== 'undefined') ? NJ_SETS[rec.s] : null; if (!D) return null;
            const [px, pz] = D.sea ? (shoreSpot(rec.x || 0, rec.z || 0, 0, 'edge') || [rec.x || 0, rec.z || 0]) : decoSpot(rec.x || 0, rec.z || 0, decoExt('set', rec.s, rec.r || 0), null, true);
            const m = new THREE.Group(); m.position.set(px, D.sea ? SHORE_Y : terrain(px, pz), pz); m.rotation.y = D.sea ? seaFace(px, pz) : (rec.r || 0); m.scale.setScalar(DS); m.userData.sea = !!D.sea;
            m.userData.item = { kind: 'set', id: rec.id, k: rec.s };
            const b = buildSet(D, m); m.userData.anim = b.anim;
            setG.add(m); addPick(m, D.box); return m;
        }

        ((typeof njSets !== 'undefined' && Array.isArray(njSets)) ? njSets : []).forEach(placeSet);
        const decoBtn = ov.querySelector('.nj3d-deco'), decoBar = ov.querySelector('.nj3d-decobar'), decoPanel = ov.querySelector('.nj3d-decopanel');
        decoBtn.textContent = T('deco_btn');
        const holoBtn = ov.querySelector('.nj3d-holo');
        if (found < 12 || pearls < 12) {   // 다 지은 사람에겐 필요 없다
            holoBtn.hidden = false; holoBtn.textContent = T('nj3d_holo_on');
            holoBtn.addEventListener('click', () => {
                preview = !preview; rebuild(); holoBtn.textContent = T(preview ? 'nj3d_holo_off' : 'nj3d_holo_on'); holoBtn.classList.toggle('on', preview);
                if (preview) showHint(T('nj3d_holo_hint'), 3500); lastTouch = performance.now();
            });
        }
        const decoRing = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 40), new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
        decoRing.rotation.x = -Math.PI / 2; decoRing.visible = false; scene.add(decoRing);
        const decoPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), decoHit = new THREE.Vector3();
        const decoName = (it) => {
            if (it.kind === 'gift') { const o = (typeof NJ_OFFERINGS !== 'undefined') ? NJ_OFFERINGS.find(x => x.k === it.k) : null; return o ? (typeof _njOfferName === 'function' ? _njOfferName(o) : o.ko) : it.k; }
            if (it.kind === 'set') return (kindOf(it) === 'big' ? '🏞️ ' : '🧩 ') + (typeof _njSetName === 'function' ? _njSetName(it.k) : it.k);
            const d = (typeof NJ_DECOR !== 'undefined') ? NJ_DECOR.find(x => x.k === it.k) : null; return d ? (typeof _njDecorName === 'function' ? _njDecorName(d) : d.ko) : it.k;
        };
        const setOfK = k => { const d = (typeof NJ_DECOR !== 'undefined') ? NJ_DECOR.find(v => v.k === k) : null; return d && d.set ? d.set : null; };
        const partNote = k => { const sk = setOfK(k); return sk && typeof _njSetName === 'function' ? T('deco_part_of', { name: esc2(_njSetName(sk)) }) : ''; };   // 「🧩 양 우리 세트의 하나」
        const asmReady = () => [...((typeof NJ_BIG !== 'undefined' && typeof _njBigPick === 'function') ? Object.keys(NJ_BIG).filter(k => _njBigPick(k)) : []),   // 큰 세트가 먼저
            ...((typeof NJ_SETS !== 'undefined' && typeof _njSetPick === 'function') ? Object.keys(NJ_SETS).filter(k => _njSetPick(k)) : [])]
            .filter(k => !!((typeof NJ_SETS !== 'undefined' && NJ_SETS[k] && NJ_SETS[k].sea) || (typeof NJ_BIG !== 'undefined' && NJ_BIG[k] && NJ_BIG[k].sea)) === !!(deco && deco.sea))
            .filter(k => !(deco && deco.sea) || healedNations().length);
        const decoObjs = () => [...giftsG.children, ...decoG.children, ...setG.children].filter(o => o.userData.item && !!o.userData.sea === !!(deco && deco.sea));
        const decoRoot = (o) => { while (o && !(o.userData && o.userData.item)) o = o.parent; return o; };
        const decoSel = (obj) => { deco.sel = obj; decoRing.visible = !!obj; decoPanel.hidden = true; decoRender(); };
        const decoTouch = (obj) => { if (obj && obj.userData.item) deco.touched.set(obj.userData.item.id, obj); };
        function decoRender() {
            const it = deco.sel && deco.sel.userData.item;
            const ready = asmReady();
            decoBar.innerHTML = (it ? `<div class="nj3d-deco-sel"><b>${esc2(decoName(it))}${it.kind === 'decor' && partNote(it.k) ? `<small>${partNote(it.k)}</small>` : ''}</b>
                    <button data-a="rot">${T('deco_rotate')}</button>${it.kind === 'set' ? `<button data-a="dis">${T('deco_disasm')}</button>` : ''}<button data-a="stash">${T('deco_stash')}</button>${it.kind === 'decor' && typeof _njDecorSellPrice === 'function' ? `<button data-a="sell" class="sell">${T('deco_sell', { n: _njDecorSellPrice(it.k).toLocaleString() })}</button>` : ''}${ready.length ? `<button data-a="asm" class="asm-mini" title="${T('deco_asm_title')}">🧩</button>` : ''}</div>`
                    : ready.length ? `<button class="nj3d-deco-asm" data-a="asm">${T('deco_asm_ready', { name: _njSetName(ready[0]) + (ready.length > 1 ? ` +${ready.length - 1}` : '') })}</button>`
                    : `<div class="nj3d-deco-tip">${T('deco_tip')}</div>`)
                + `<div class="nj3d-deco-row"><button data-a="bag">${T('deco_bag', { n: deco.stash.length })}</button><button data-a="shop">${T('deco_shop')}</button><button data-a="done" class="done">${T('deco_done')}</button></div>`;
        }
        function decoPanelShow(kind, note) {
            decoPanel.hidden = false;
            if (kind === 'bag') {
                decoPanel.innerHTML = `<button class="nj3d-fruit-x" aria-label="close">✕</button><div class="nj3d-offer-head">${T('deco_bag_title')}</div>`
                    + (deco.stash.length ? (() => {   // 10/1 사용자: 세트인 채로 들어간 것이 잘 구분되게 — 🏞️ 큰 세트 · 🧩 세트 · 🪴 낱개로 나눠, 세트는 금빛 카드
                        const isBig = s => s.kind === 'set' && typeof NJ_BIG !== 'undefined' && !!NJ_BIG[s.k];
                        const grp = [['deco_bag_sec_big', s => isBig(s)], ['deco_bag_sec_set', s => s.kind === 'set' && !isBig(s)], ['deco_bag_sec_item', s => s.kind !== 'set']];
                        const one = (s, i) => {
                            const sub = isBig(s) ? T('deco_bag_big', { n: NJ_BIG[s.k].sets.length }) : s.kind === 'set' ? T('deco_bag_set', { n: ((NJ_SETS[s.k] || {}).parts || []).length })
                                : s.kind === 'gift' ? T('deco_kind_gift') : (partNote(s.k) || T('deco_kind_decor'));
                            return `<div class="nj3d-offer-row${s.kind === 'set' ? ' nj3d-bag-setcard' : ''}"><div><b>${s.kind === 'set' ? (isBig(s) ? '🏞️ ' : '🧩 ') : ''}${esc2(decoName(s))}</b><span>${sub}</span></div><span class="nj3d-bag-btns">${s.kind === 'decor' && typeof _njDecorSellPrice === 'function' ? `<button class="sell" data-sell="${i}">${T('deco_sell', { n: _njDecorSellPrice(s.k).toLocaleString() })}</button>` : ''}<button data-i="${i}">${T('deco_place')}</button></span></div>`;
                        };
                        return grp.map(([t, f]) => { const rows = deco.stash.map((s, i) => [s, i]).filter(([s]) => f(s)); return rows.length ? `<div class="nj3d-shop-sec">${T(t)} <span>${rows.length}</span></div><div class="nj3d-offer-list">${rows.map(([s, i]) => one(s, i)).join('')}</div>` : ''; }).join('');
                    })() : `<div class="nj3d-offer-intro">${T('deco_bag_empty')}</div>`);
                decoPanel.querySelectorAll('button[data-sell]').forEach(b => b.onclick = () => {
                    if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = T('deco_sell_sure'); return; }
                    const s = deco.stash[+b.dataset.sell]; if (!s) return;
                    const back = typeof _njDecorSell === 'function' ? _njDecorSell(s.id) : 0;
                    if (back) { deco.stash.splice(+b.dataset.sell, 1); deco.stashed.delete(s.id); syncWallet(); decoRender(); decoPanelShow('bag'); showHint(T('deco_sold', { n: back.toLocaleString() }), 2000); }
                });
                decoPanel.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => {
                    const s0 = deco.stash[+b.dataset.i]; if (!s0) return;
                    const sea0 = isSeaItem(s0.kind, s0.k);
                    if (sea0 !== !!deco.sea) { showHint(T(sea0 ? 'deco_sea_only' : 'deco_land_only'), 2000); return; }
                    if (sea0 && !healedNations().length) { showHint(T('deco_sea_need'), 3000); return; }
                    const s = deco.stash.splice(+b.dataset.i, 1)[0];
                    const [x, z] = sea0 ? shoreSpot(deco.tgt.x, deco.tgt.z, 0.4, (decoMeta(s.k) || {}).water ? 'water' : (decoMeta(s.k) || {}).edge ? 'edge' : 'land') : decoSpot(deco.tgt.x, deco.tgt.z, decoExt(kindOf(s), s.k, 0), null, s.kind === 'set');
                    const rec = ((s.kind === 'gift' ? njGifts : s.kind === 'set' ? njSets : njDecor) || []).find(v => v.id === s.id);
                    const put = Object.assign({}, rec, { x, z, r: 0, st: false });
                    const obj = rec ? (s.kind === 'gift' ? placeGift(put) : s.kind === 'set' ? placeSet(put) : placeDecor(put)) : null;
                    if (obj) { decoTouch(obj); decoSel(obj); }
                });
            } else if (kind === 'shop') {
                const gems = Number(typeof myGems !== 'undefined' ? myGems : 0), list = (typeof NJ_DECOR !== 'undefined') ? NJ_DECOR : [];
                decoPanel.innerHTML = `<button class="nj3d-fruit-x" aria-label="close">✕</button><div class="nj3d-offer-head">${T('deco_shop_title')}</div>
                    <div class="nj3d-offer-have">💎 ${gems.toLocaleString()}</div>
                    ${(() => {   // 꾸밈 / 컨셉 → 세트로 묶어서, 세트마다 몇 가지 모았는지
                        const own = k => ((typeof njDecor !== 'undefined' && njDecor) || []).filter(v => v.k === k && !v.sold).length;
                        const seaOpen = healedNations().length > 0;
                        const lockOf = d => !!d.sea !== !!deco.sea ? T(d.sea ? 'deco_sea_only' : 'deco_land_only') : (d.sea && !seaOpen ? '🔒' : '');
                        const row = (d, inSet) => { const lk = lockOf(d); return `<div class="nj3d-offer-row"><div><b>${esc2(typeof _njDecorName === 'function' ? _njDecorName(d) : d.ko)}</b>${d.set && !inSet ? `<span>${partNote(d.k)}</span>` : ''}${own(d.k) ? `<span>${T('deco_owned', { n: own(d.k) })}</span>` : ''}</div>${lk
                            ? `<span class="nj3d-offer-lock">${lk} · 💎 ${d.cost.toLocaleString()}</span>` : gems >= d.cost
                            ? `<button data-k="${d.k}">💎 ${d.cost.toLocaleString()}</button>` : `<span class="nj3d-offer-lock">💎 ${d.cost.toLocaleString()}</span>`}</div>`; };
                        // 10/1 사용자: 아이템 목록이 어수선하다 → 위에 테마 탭(🪴 꾸밈 · 컨셉마다), 세트는 접었다 펴는 칸(제목에 모은 수와 막대). 고른 탭·펼친 세트는 기억
                        const cons = ((typeof NJ_CONCEPTS !== 'undefined') ? NJ_CONCEPTS : []).slice().sort((p, q) => (!!q.sea === !!deco.sea) - (!!p.sea === !!deco.sea));   // 지금 꾸미는 곳의 컨셉이 먼저
                        const tabs = (deco.sea ? [] : ['plain']).concat(cons.map(c => c.k));
                        if (!tabs.includes(deco.shopTab)) deco.shopTab = deco.sea ? (cons.find(c => c.sea) || {}).k || tabs[0] : 'plain';
                        deco.shopOpen = deco.shopOpen || {};
                        let h = `<div class="nj3d-shop-tabs">${tabs.map(t => { const c = cons.find(q => q.k === t); const nm = c ? (currentLang === 'en' ? c.en : c.ko) : T('deco_shop_plain');
                            return `<button data-tab="${t}" class="${t === deco.shopTab ? 'on' : ''}">${esc2(nm)}</button>`; }).join('')}</div>`;
                        if (deco.shopTab === 'plain') return h + `<div class="nj3d-offer-list">${list.filter(d => !d.set).map(d => row(d)).join('')}</div>`;
                        const c = cons.find(q => q.k === deco.shopTab);
                        h += `<div class="nj3d-shop-sec">${esc2(c.ref || '')}</div>`;
                        if (c.sea && !seaOpen) h += `<div class="nj3d-shop-big">${T('deco_sea_need')}</div>`;
                        if (c.big && typeof NJ_BIG !== 'undefined' && NJ_BIG[c.big]) h += `<div class="nj3d-shop-big">${T('deco_big_got', { name: esc2(_njSetName(c.big)), n: _njBigGot(c.big), m: NJ_BIG[c.big].sets.length })}</div>`;
                        c.sets.forEach(sk => {
                            const D = NJ_SETS[sk], got = typeof _njSetOwned === 'function' ? _njSetOwned(sk) : 0, m = D.parts.length;
                            h += `<details class="nj3d-shop-fold" data-set="${sk}"${deco.shopOpen[sk] ? ' open' : ''}><summary>🧩 ${esc2(_njSetName(sk))}
                                <span class="nj3d-shop-meter"><i style="width:${Math.round(got / m * 100)}%"></i></span><span class="nj3d-shop-n">${got >= m ? '✅' : `${got}/${m}`}</span></summary>
                                ${(() => { const miss = typeof _njSetMissing === 'function' ? _njSetMissing(sk) : [], cost = miss.reduce((a, k) => a + ((list.find(v => v.k === k) || {}).cost || 0), 0), lk = lockOf(D);
                                    if (lk) return '';
                                    return !miss.length ? `<button class="nj3d-shop-rest" data-buildset="${sk}">${T('deco_build_now')}</button>`
                                        : gems >= cost ? `<button class="nj3d-shop-rest" data-buyset="${sk}">${T('deco_buy_rest', { n: miss.length, cost: cost.toLocaleString() })}</button>`
                                        : `<div class="nj3d-shop-rest off">${T('deco_buy_rest', { n: miss.length, cost: cost.toLocaleString() })}</div>`; })()}
                                <div class="nj3d-offer-list">${list.filter(d => d.set === sk).map(d => row(d, true)).join('')}</div></details>`;
                        });
                        return h;
                    })()}`;
                decoPanel.querySelectorAll('button[data-tab]').forEach(b => b.onclick = () => { deco.shopTab = b.dataset.tab; const y = 0; decoPanelShow('shop'); decoPanel.scrollTop = y; });
                decoPanel.querySelectorAll('details[data-set]').forEach(d => d.ontoggle = () => { deco.shopOpen[d.dataset.set] = d.open; });
                decoPanel.querySelectorAll('button[data-buildset]').forEach(b => b.onclick = () => { decoPanel.hidden = true; decoBar.dispatchEvent(new CustomEvent('asm-ok', { detail: b.dataset.buildset })); });
                decoPanel.querySelectorAll('button[data-buyset]').forEach(b => b.onclick = () => {   // 남은 낱개 한꺼번에 사서 조립 — 한 번 더 눌러야
                    if (b.dataset.sure !== '1') { b.dataset.label = b.textContent; b.dataset.sure = '1'; b.textContent = T('deco_buy_rest_sure'); b.classList.add('sure'); return; }
                    const sk = b.dataset.buyset, D = NJ_SETS[sk], seaS = !!D.sea;
                    const [x, z] = seaS ? shoreSpot(deco.tgt.x, deco.tgt.z, 0, 'edge') : decoSpot(deco.tgt.x, deco.tgt.z, decoExt('set', sk, 0), null, true);
                    const r = typeof _njSetBuyRest === 'function' ? _njSetBuyRest(sk, x, z) : null;
                    if (!r) { showHint(T('deco_need_gems'), 2000); return; }
                    decoPanel.hidden = true; decoAbsorb(r);
                    const obj = placeSet(r.rec); if (obj) decoSel(obj); syncWallet();
                    if (typeof SoundEffect !== 'undefined' && SoundEffect.playClear) SoundEffect.playClear();
                    showHint(T('deco_asm_done', { name: _njSetName(sk) }), 3000);
                    decoAskBig(sk);
                });
                decoPanel.querySelectorAll('button[data-k]').forEach(b => b.onclick = () => {
                    if (b.dataset.sure !== '1') {   // 정말 살까요 — 한 번 더 눌러야 산다(10/1 사용자)
                        decoPanel.querySelectorAll('button[data-k]').forEach(o => { if (o !== b && o.dataset.sure === '1') { o.dataset.sure = ''; o.textContent = o.dataset.label; o.classList.remove('sure'); } });
                        b.dataset.label = b.textContent; b.dataset.sure = '1'; b.textContent = T('deco_buy_sure'); b.classList.add('sure'); return;
                    }
                    const md = decoMeta(b.dataset.k) || {};
                    const [x, z] = md.sea ? (shoreSpot(deco.tgt.x, deco.tgt.z, 0.4, md.water ? 'water' : md.edge ? 'edge' : 'land') || [0, 0]) : decoSpot(deco.tgt.x, deco.tgt.z, decoExt('decor', b.dataset.k, 0));
                    const it = typeof _njDecorBuy === 'function' ? _njDecorBuy(b.dataset.k, x, z) : null;
                    if (!it) { showHint(T('deco_need_gems'), 2000); return; }
                    const obj = placeDecor(it); syncWallet();
                    if (typeof SoundEffect !== 'undefined' && SoundEffect.playClear) SoundEffect.playClear();
                    if (obj) decoSel(obj);
                    const sk0 = setOfK(b.dataset.k); if (sk0 && asmReady().includes(sk0)) decoPanelShow('asm', T('deco_all_got', { name: esc2(_njSetName(sk0)) }));   // 마지막 조각 — 그 자리에서 묻는다
                });
            }
            if (kind === 'asm') {   // 조립 확인 — 어디 있던 낱개가 몇 개 모이는지
                const list = asmReady();
                decoPanel.innerHTML = `<button class="nj3d-fruit-x" aria-label="close">✕</button><div class="nj3d-offer-head">${T('deco_asm_title')}</div>
                    ${note ? `<div class="nj3d-shop-big">${note}</div>` : ''}<div class="nj3d-offer-intro">${T('deco_asm_note')}</div>` + list.map(sk => {
                        const big = typeof NJ_BIG !== 'undefined' && !!NJ_BIG[sk], pick = (big ? _njBigPick(sk) : _njSetPick(sk)) || [];
                        const out = pick.filter(v => !v.st).length, inBag = pick.length - out;
                        return `<div class="nj3d-asm-card"><b>${big ? '🏞️' : '🧩'} ${esc2(_njSetName(sk))}</b>
                            <span>${T(big ? 'deco_asm_count_big' : 'deco_asm_count', { out, bag: inBag })}</span>
                            <div class="nj3d-asm-btns"><button data-a="asm-ok" data-k="${sk}">${T('deco_asm_go')}</button><button data-a="asm-no">${T('deco_cancel')}</button></div></div>`;
                    }).join('');
                decoPanel.querySelectorAll('button[data-a="asm-ok"], button[data-a="asm-no"]').forEach(b => b.onclick = () => {
                    if (b.dataset.a === 'asm-no') { decoPanel.hidden = true; return; }
                    decoPanel.hidden = true; decoBar.dispatchEvent(new CustomEvent('asm-ok', { detail: b.dataset.k }));
                });
            }
            const x = decoPanel.querySelector('.nj3d-fruit-x'); if (x) x.onclick = () => { decoPanel.hidden = true; };
        }
        // 조립에 들어간 낱개(또는 세트)를 화면·보관함에서 걷는다
        const decoAbsorb = (r, big) => {
            (big ? setG : decoG).children.filter(o => o.userData.item && r.parts.includes(o.userData.item.id)).forEach(o => { deco.touched.delete(o.userData.item.id); o.parent.remove(o); });
            deco.stash = deco.stash.filter(st => !r.parts.includes(st.id));
        };
        // 세트를 조립했더니 그 세트가 든 큰 세트가 다 모였으면 — 그 자리에서 묻는다
        const decoAskBig = sk => {
            if (typeof NJ_BIG === 'undefined') return;
            const bk = Object.keys(NJ_BIG).find(k => NJ_BIG[k].sets.includes(sk) && asmReady().includes(k));
            if (bk) setTimeout(() => decoPanelShow('asm', T('deco_big_ready', { name: esc2(_njSetName(bk)) })), 400);
        };
        decoBar.addEventListener('asm-ok', e => { const fake = document.createElement('button'); fake.dataset.a = 'asm-ok'; fake.dataset.k = e.detail; decoBar.appendChild(fake); fake.click(); fake.remove(); });
        decoBar.addEventListener('click', e => {
            const b = e.target.closest('button'); if (!b || !deco) return;
            const a = b.dataset.a;
            if (a === 'rot' && deco.sel) {   // 돌리면 차지하는 폭이 바뀐다 — 성에 닿으면 다시 밀어낸다
                const o = deco.sel, it = o.userData.item;
                if (o.userData.sea && it.kind === 'set') { showHint(T('deco_sea_hint'), 2000); return; }   // 바다 세트는 늘 바다를 본다
                o.rotation.y += Math.PI / 4;
                if (o.userData.sea) { decoTouch(o); return; }
                const [x, z] = decoSpot(o.position.x, o.position.z, decoExt(kindOf(it), it.k, o.rotation.y), o.position, it.kind === 'set'); o.position.set(x, terrain(x, z), z); decoTouch(o);
            }
            else if (a === 'stash' && deco.sel) {
                const o = deco.sel, it = o.userData.item; deco.stash.push({ kind: it.kind, id: it.id, k: it.k });
                deco.touched.delete(it.id); deco.stashed.add(it.id); o.parent.remove(o); decoSel(null);
            }
            else if (a === 'dis' && deco.sel) {   // 🔨 해체 — 낱개로 둘레에 내려놓는다
                const o = deco.sel, id = o.userData.item.id, big = kindOf(o.userData.item) === 'big'; deco.touched.delete(id);
                if (big) { const sets = typeof _njBigDisassemble === 'function' ? _njBigDisassemble(id) : []; o.parent.remove(o); decoSel(null); sets.forEach(S => placeSet(S)); }   // 큰 세트 → 세트 셋
                else { const parts = typeof _njSetDisassemble === 'function' ? _njSetDisassemble(id) : []; o.parent.remove(o); decoSel(null); parts.forEach(v => placeDecor(v)); }
                showHint(T('deco_disasm_done'), 2000);
            }
            else if (a === 'asm') decoPanelShow('asm');   // 🧩 조립 — 먼저 확인 창
            else if (a === 'asm-ok') {   // 🧩 조립 — 화면 가운데에 세트로
                const ready = asmReady(); if (!ready.includes(b.dataset.k)) return;
                const sk = b.dataset.k, big = typeof NJ_BIG !== 'undefined' && !!NJ_BIG[sk], seaS = !!((NJ_SETS[sk] || (big && NJ_BIG[sk]) || {}).sea);
                const [x, z] = seaS ? shoreSpot(deco.tgt.x, deco.tgt.z, 0, 'edge') : decoSpot(deco.tgt.x, deco.tgt.z, decoExt(big ? 'big' : 'set', sk, 0), null, true);
                const r = big ? _njBigAssemble(sk, x, z) : _njSetAssemble(sk, x, z); if (!r) return;
                decoAbsorb(r, big);
                const obj = placeSet(r.rec); if (obj) decoSel(obj);
                if (typeof SoundEffect !== 'undefined' && SoundEffect.playClear) SoundEffect.playClear();
                showHint(T('deco_asm_done', { name: _njSetName(sk) }), 3000);
                if (!big) decoAskBig(sk);
            }
            else if (a === 'sell' && deco.sel) {   // 💰 팔기 — 한 번 더 눌러야 판다
                if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = T('deco_sell_sure'); return; }
                const o = deco.sel, id = o.userData.item.id, back = typeof _njDecorSell === 'function' ? _njDecorSell(id) : 0;
                if (back) { deco.touched.delete(id); o.parent.remove(o); decoSel(null); syncWallet(); showHint(T('deco_sold', { n: back.toLocaleString() }), 2000); }
            }
            else if (a === 'bag') decoPanelShow('bag');
            else if (a === 'shop') decoPanelShow('shop');
            else if (a === 'done') exitDeco();
            lastTouch = performance.now();
        });
        function enterDeco() {
            if (walk || proc) return;
            const stash = [];
            ((typeof njGifts !== 'undefined' && njGifts) || []).forEach(g => { if (g.st) stash.push({ kind: 'gift', id: g.id, k: g.k }); });
            ((typeof njDecor !== 'undefined' && njDecor) || []).forEach(d => { if (d.st && !d.in && !d.sold) stash.push({ kind: 'decor', id: d.id, k: d.k }); });
            ((typeof njSets !== 'undefined' && njSets) || []).forEach(d => { if (d.st && !d.in) stash.push({ kind: 'set', id: d.id, k: d.s, big: !!d.big }); });
            const sea = where === 'sea', H = healedNations();
            let tgt = new THREE.Vector3(3.4, 0, 8.8);
            if (sea) { const [hx, hz] = H.length ? natMid(H[0], 10) : [0, SHORE - 2]; tgt = new THREE.Vector3(hx, SHORE_Y, hz); }   // 바다 — 첫 소성된 나라 해안
            deco = { sea, sel: null, tgt, yaw: sea ? Math.atan2(tgt.x, tgt.z - SZ) : 0.5, pitch: 1.0, dist: sea ? 7 : 9, pts: new Map(), drag: null, stash, touched: new Map(), stashed: new Set() };
            decoPlane.constant = sea ? -SHORE_Y : 0; showOpenBand(sea);
            controls.enabled = false; controls.autoRotate = false;
            modeBtn.hidden = goBtn.hidden = decoBtn.hidden = true; holoBtn.dataset.was = holoBtn.hidden ? '1' : ''; holoBtn.hidden = true; hideFruit(); offerEl.hidden = true;
            decoBar.hidden = false; ov.classList.add('deco-on'); decoRender(); showHint(T(sea ? (H.length ? 'deco_sea_hint' : 'deco_sea_need') : 'deco_hint'), 3500); lastTouch = performance.now();
        }
        function exitDeco() {
            const ch = [];
            deco.touched.forEach((o, id) => { const it = o.userData.item; ch.push({ kind: it.kind, id, x: o.position.x, z: o.position.z, r: o.rotation.y, st: false }); });
            deco.stash.forEach(s => { if (deco.stashed.has(s.id)) ch.push({ kind: s.kind, id: s.id, x: 0, z: 0, r: 0, st: true }); });
            if (ch.length && typeof _njDecoSave === 'function') { _njDecoSave(ch); showHint(T('deco_saved'), 2000); }
            const back = deco.sea ? 'sea' : 'city'; showOpenBand(false);
            deco = null; decoRing.visible = false; decoBar.hidden = true; decoPanel.hidden = true; ov.classList.remove('deco-on');
            modeBtn.hidden = goBtn.hidden = decoBtn.hidden = false; holoBtn.hidden = holoBtn.dataset.was === '1'; controls.enabled = true; lookAt(back); lastTouch = performance.now();
        }
        decoBtn.addEventListener('click', enterDeco);
        // 손가락 — 물건을 짚으면 옮기기, 빈 곳이면 화면 옮기기, 두 손가락은 확대·돌리기
        const decoNdc = (e) => { const r = cvs.getBoundingClientRect(); return new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); };
        cvs.addEventListener('pointerdown', e => {
            if (!deco) return;
            deco.pts.set(e.pointerId, { x: e.clientX, y: e.clientY, t: performance.now(), x0: e.clientX, y0: e.clientY });
            if (deco.pts.size === 2) {
                const [a, b] = [...deco.pts.values()];
                deco.drag = { pinch: Math.hypot(a.x - b.x, a.y - b.y), ang: Math.atan2(b.y - a.y, b.x - a.x), dist0: deco.dist, yaw0: deco.yaw }; return;
            }
            ray.setFromCamera(decoNdc(e), camera);
            const hit = ray.intersectObjects(decoObjs().map(o => { if (!o.userData.pick) addPick(o); return o.userData.pick; }), false);   // 예물은 처음 고를 때 상자를 씌운다
            const one = hit.find(h => { const r = decoRoot(h.object); return r && r.userData.item.kind !== 'set'; });   // 겹쳐 있으면 낱개·예물이 세트보다 먼저(10/1 사용자) — 세트 상자가 커서 위에 놓인 낱개를 가렸다
            const obj = one ? decoRoot(one.object) : hit.length ? decoRoot(hit[0].object) : null;
            if (obj) { if (deco.sel !== obj) decoSel(obj); deco.drag = { obj }; }
            else deco.drag = { pan: true };
            touching = true; lastTouch = performance.now();
        });
        cvs.addEventListener('pointermove', e => {
            if (!deco) return;
            const p = deco.pts.get(e.pointerId); if (!p) return;
            const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
            const d = deco.drag; if (!d) return;
            if (d.pinch && deco.pts.size === 2) {
                const [a, b] = [...deco.pts.values()];
                deco.dist = Math.max(1.6, Math.min(32, d.dist0 * d.pinch / Math.max(20, Math.hypot(a.x - b.x, a.y - b.y))));
                deco.yaw = d.yaw0 - (Math.atan2(b.y - a.y, b.x - a.x) - d.ang);
            } else if (d.obj) {
                ray.setFromCamera(decoNdc(e), camera);
                if (ray.ray.intersectPlane(decoPlane, decoHit)) {
                    const it = d.obj.userData.item;
                    if (d.obj.userData.sea) {   // 바다 — 소성된 해안 띠(배는 물 위), 세트는 물가를 따라 바다를 보며
                        const md1 = it.kind === 'decor' ? (decoMeta(it.k) || {}) : {}, wet = !!md1.water, edge = it.kind === 'set' || !!md1.edge;
                        const sp = shoreSpot(decoHit.x, decoHit.z, Math.max(...decoExt(kindOf(it), it.k, 0)), edge ? 'edge' : wet ? 'water' : 'land');
                        if (sp) { d.obj.position.set(sp[0], (wet ? SEA_Y : SHORE_Y) - (md1.drop || 0) * DS * (DIS[it.k] || 1), sp[1]); if (edge) d.obj.rotation.y = seaFace(sp[0], sp[1]); decoTouch(d.obj); }
                    } else {
                        const [x, z] = decoSpot(decoHit.x, decoHit.z, decoExt(kindOf(it), it.k, d.obj.rotation.y), d.obj.position, it.kind === 'set');   // 성 안으로는 못 들어간다 — 끌던 쪽 성벽 바깥에 붙는다
                        d.obj.position.set(x, terrain(x, z), z); decoTouch(d.obj);
                    }
                }
            } else if (d.pan) {
                const s = deco.dist * 0.0021, cy = Math.cos(deco.yaw), sy = Math.sin(deco.yaw);
                deco.tgt.x -= (cy * dx + sy * dy) * s; deco.tgt.z -= (-sy * dx + cy * dy) * s;
                if (deco.sea) { deco.tgt.x = Math.max(-34, Math.min(34, deco.tgt.x)); deco.tgt.z = Math.max(SHORE - 6, Math.min(SZ + 30, deco.tgt.z)); }
                else { deco.tgt.x = Math.max(-16, Math.min(16, deco.tgt.x)); deco.tgt.z = Math.max(-16, Math.min(16, deco.tgt.z)); }
            }
            lastTouch = performance.now();
        });
        const decoUp = e => {
            if (!deco) return;
            const p = deco.pts.get(e.pointerId); deco.pts.delete(e.pointerId);
            if (p && deco.drag && deco.drag.pan && Math.hypot(e.clientX - p.x0, e.clientY - p.y0) < 8 && performance.now() - p.t < 350) decoSel(null);   // 빈 곳을 톡 — 고르기 풀기
            if (deco.pts.size === 0) { deco.drag = null; touching = false; } else if (deco.drag && deco.drag.pinch) deco.drag = null;
            lastTouch = performance.now();
        };
        cvs.addEventListener('pointerup', decoUp); cvs.addEventListener('pointercancel', decoUp);
        cvs.addEventListener('wheel', e => { if (!deco) return; deco.dist = Math.max(1.6, Math.min(32, deco.dist * (e.deltaY > 0 ? 1.1 : 0.9))); e.preventDefault(); lastTouch = performance.now(); }, { passive: false });
        function decoCam() {
            const c = Math.cos(deco.pitch) * deco.dist;
            camera.position.set(deco.tgt.x + Math.sin(deco.yaw) * c, deco.tgt.y + Math.sin(deco.pitch) * deco.dist, deco.tgt.z + Math.cos(deco.yaw) * c);
            camera.lookAt(deco.tgt);
            if (deco.sel) {   // 고리는 누르는 상자 크기에 맞춘다 — 세트(양 우리)는 낱개보다 훨씬 크다
                const p = deco.sel.position, pk = deco.sel.userData.pick, gp = pk && pk.geometry.parameters;
                const rad = gp ? Math.max(gp.width, gp.depth) / 2 * deco.sel.scale.x : 0.5;
                decoRing.position.set(p.x, p.y + 0.03, p.z); decoRing.scale.setScalar(Math.max(0.7, rad / 0.42));
            }
        }

        /* 🛝 생명수 미끄럼 (10/4 사용자) — 남쪽 강물(겔 47:1·8 성전에서 나와 바다로 흐르는 강)을 워터슬라이드처럼 타고 내려가 바다에 풍덩.
           산마루 끝~어귀 앞 강물에 서면 버튼. 비탈이 가파를수록 빨라지고(강바닥 높이 WT(0, z)의 내리막) 골짜기에선 느려진다. 조이스틱 좌우로 물길 안에서 비켜 간다.
           바다에 닿으면 물속으로 풍덩 → 그 깊이에 머문다(점프로 헤엄쳐 오르고, 잠수로 더 내려간다) */
        function slideStep(dt) {
            const S = slide; S.t += dt; lastTouch = performance.now();
            const k = inp.keys, jx = inp.jx + ((k.KeyD || k.ArrowRight) ? 1 : 0) - ((k.KeyA || k.ArrowLeft) ? 1 : 0);
            const grade = Math.max(0, (WT(0, P.z) - WT(0, P.z + 0.3)) / 0.3);
            S.v = Math.max(1.3, Math.min(6.5, S.v + (grade * 7 - S.v * 0.22) * dt));
            slideK = (S.v - 1.3) / 5.2;   // 0(가장 느림) ~ 1(가장 빠름)
            if (!slideSnd && typeof SoundEffect !== 'undefined' && SoundEffect.slideLoop) slideSnd = SoundEffect.slideLoop();
            if (slideSnd) slideSnd.set(slideK);
            if (!reduce) sprayTick(dt, 10 + 60 * slideK);
            if (S.t - (S.bl || 0) > 0.45 + Math.random() * 0.5 && typeof SoundEffect !== 'undefined' && SoundEffect.playSplash) { S.bl = S.t; SoundEffect.playSplash(false); }   // 이따금 첨벙
            P.z += S.v * dt;
            P.x = Math.max(-RW * 0.8, Math.min(RW * 0.8, P.x - jx * 0.9 * dt));   // 바다를 보고 앉았으니 오른쪽 = −x
            P.y = WT(0, P.z) + WL - 0.03; P.vy = 0; P.onGround = true; P.face = Math.PI;
            pilgrim.position.set(P.x, P.y, P.z); pilgrim.rotation.y = P.face;
            const ce = 1 - Math.exp(-dt * 3);
            camYaw = angLerp(camYaw, Math.PI, ce); camPitch += (0.3 + Math.atan(grade) * 0.9 - camPitch) * ce;   // 카메라는 뒤에서 — 비탈이 가파를수록 더 위에서(뒤는 오르막이라 낮으면 땅에 파묻혔다)
            const L = limbs, e = Math.min(1, dt * 10), wv = Math.sin(S.t * 6) * 0.25;   // 앉아서 두 팔을 번쩍, 몸은 뒤로
            L.hipL.rotation.x += (-1.45 - L.hipL.rotation.x) * e; L.hipR.rotation.x += (-1.45 - L.hipR.rotation.x) * e;
            L.armL.rotation.x += (-2.6 + wv - L.armL.rotation.x) * e; L.armR.rotation.x += (-2.6 - wv - L.armR.rotation.x) * e;
            L.armL.rotation.z += (-0.45 - L.armL.rotation.z) * e; L.armR.rotation.z += (0.45 - L.armR.rotation.z) * e;
            body.rotation.x += (0.3 - body.rotation.x) * e; body.position.y += (0 - body.position.y) * e;
            S.sp -= dt; if (S.sp <= 0) { S.sp = 0.12; splash(P.x, P.z, false, true); }   // 지나간 자리에 물결
            if (seaE(P.x, P.z) < 0.995) {   // 어귀 — 미끄러지던 기세 그대로 바다 속으로 풍덩 (10/5 사용자: 물속에 풍덩 하는 느낌)
                const v = S.v; slide = null; slideSndStop();
                P.y = SEA_Y - 0.05; P.vy = -1.6 - v * 0.25; P.onGround = false; gliding = false;   // 빠를수록 깊이 — 물속 헤엄(뜨는 힘)이 천천히 되돌린다
                plungeMom = { vz: v * 0.75 };
                splash(P.x, P.z, true, true); sprayBurst(P.x, SEA_Y + 0.02, P.z, 46, v);
                if (typeof SoundEffect !== 'undefined' && SoundEffect.playPlunge) SoundEffect.playPlunge();
                showHint(T('nj3d_slide_end'), 4200); fishHintHold = performance.now() + 5000;
            }
        }
        function rippleTick(dt) {
            ripples.forEach(r => {
                if (r.t >= 1) return;
                r.t = Math.min(1, r.t + dt / (r.big ? 0.9 : 0.6));
                const sc = 1 + r.t * (r.big ? 9 : 5); r.m.scale.set(sc, 1, sc);
                r.m.material.opacity = (r.big ? 0.75 : 0.55) * (1 - r.t); if (r.t >= 1) r.m.visible = false;
            });
        }
        slideBtn.addEventListener('click', () => {
            if (!walk || slide || proc) return;
            if (ride.on) mountDown();
            slide = { v: 1.6, t: 0, sp: 0 }; slideBtn.hidden = true;
            P.x = Math.max(-RW * 0.8, Math.min(RW * 0.8, P.x));
            showHint(T('nj3d_slide_hint'), 3800); lastTouch = performance.now();
            if (typeof SoundEffect !== 'undefined' && SoundEffect.playWhee) SoundEffect.playWhee();
        });
        function speedFx(dt) {   // 시야·바람 선 — 미끄럼이 끝나면 천천히 돌아온다. 물보라는 끝난 뒤에도 떨어질 때까지
            miniT -= dt; if (miniT <= 0) { miniT = 0.1; miniDraw(); }   // 🗺️ 미니맵 — 초당 10번
            const want = slide ? 16 * slideK : 0;
            fovBoost += (want - fovBoost) * (1 - Math.exp(-dt * 3));
            const fov = 62 + fovBoost; if (Math.abs(camera.fov - fov) > 0.01) { camera.fov = fov; camera.updateProjectionMatrix(); }
            speedEl.style.opacity = slide && !reduce ? (0.45 * Math.max(0, slideK - 0.15)).toFixed(3) : '0';
            if (!slide && spray.visible) sprayTick(dt, 0);
        }
        function walkUpdate(dt) {
            speedFx(dt);
            if (proc) { procUpdate(dt); return; }
            if (slide) { slideStep(dt); rippleTick(dt); followCam(dt); return; }
            fishUpdate(dt);
            slideCheckT -= dt;
            clamTick(dt); mannaTick(dt); dexTick(dt);
            if (slideCheckT <= 0) { clamCheck(); mannaCheck(); slideCheckT = 0.25; slideBtn.hidden = !(P.onGround && Math.abs(P.x) < RB && P.z > PL - 1.5 && P.z < SHORE - 3 && !isUnder()); }   // 🛝 남쪽 강물에 섰나
            envoyCheckT -= dt;
            if (envoyCheckT <= 0) {   // 사신 곁인가 (1초에 네 번)
                envoyCheckT = 0.25;
                nearEnvoy = null; let bd = 1.6;
                if (P.onGround) envoys.forEach(e => { const d = Math.hypot(e.x - P.x, e.z - P.z); if (d < bd) { bd = d; nearEnvoy = e; } });
                talkBtn.hidden = !nearEnvoy;
                if (nearEnvoy) talkBtn.innerHTML = T('gift_talk', { name: esc2(natName(nearEnvoy.i)) });
                else if (!offerEl.hidden && offerEl.dataset.pearl !== '1' && offerEl.dataset.keep !== '1') offerEl.hidden = true;   // 도감 창(keep)도 그대로   // 진주 장사 창은 장사 곁을 떠날 때 닫는다(clamCheck)
            }
            walkT += dt;
            const k = inp.keys;
            const kv = (k.ControlLeft || k.ControlRight) ? 1 : 0.7;   // 키보드는 걷기, Ctrl을 누르면 달리기
            const jx = inp.jx + (((k.KeyD || k.ArrowRight) ? 1 : 0) - ((k.KeyA || k.ArrowLeft) ? 1 : 0)) * kv;
            const jy = inp.jy + (((k.KeyS || k.ArrowDown) ? 1 : 0) - ((k.KeyW || k.ArrowUp) ? 1 : 0)) * kv;
            const fly = hasJet() && (jetOn || k.ShiftLeft || k.ShiftRight);
            if (fly && ride.on) mountDown();   // 날기 버튼 = 내리며 제트팩
            const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
            let mx = fx * (-jy) + rx * jx, mz = fz * (-jy) + rz * jx;
            const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
            const moving = ml > 0.05, wasGround = P.onGround;
            const inWater = P.onGround && wetAt(P.x, P.z);
            const run = moving && ml > 0.85 && !fly;   // 조이스틱을 끝까지 밀면 달린다
            const inRiver = inWater && inWater !== 'sea';
            const glide = gliding && !fly && !P.onGround;
            if (glide && !moving) { mx = -Math.sin(P.face); mz = -Math.cos(P.face); }   // 활강은 손을 떼도 바라보는 쪽으로 계속 나아간다
            const FD0 = ride.on && NJ_MOUNTS[ride.k] && NJ_MOUNTS[ride.k].kind === 'fly' ? NJ_MOUNTS[ride.k] : null;
            if (FD0 && FD0.cruise && !P.onGround && !moving) { mx = -Math.sin(P.face) * 0.7; mz = -Math.cos(P.face) * 0.7; }   // ✈️ 비행기는 손을 떼도 앞으로 난다
            const MD = ride.on ? (NJ_MOUNTS[ride.k] || {}) : null;
            if (MD) ride.runT = (moving && run) ? (ride.runT || 0) + dt : (P.onGround ? 0 : ride.runT || 0);   // 🐪 지구력 — 쉬지 않고 달린 시간(공중에선 이어진다)
            const mSpd = MD ? (MD.speedMax ? MD.speed + (MD.speedMax - MD.speed) * Math.min(1, (ride.runT || 0) / (MD.ramp || 3)) : (MD.speed || 1)) : 1;
            const WG = equipWing();
            const swim = !ride.on && P.y < SEA_Y - 0.03 && seaE(P.x, P.z) < 1;
            if (MD && MD.kind === 'sub' && !moving && P.onGround) P.vy = Math.max(P.vy, 0);
            const sp = swim ? (run ? 1.35 : 0.85) : glide ? 2.6 * (1 + (WG.bonus || 0)) : (MD && MD.kind === 'fly') ? RUN_V * (P.onGround ? (MD.groundSpeed ?? 0.6) : mSpd) * (run || !P.onGround ? 1 : 0.55)   // 땅에선 느리게, 하늘에선 빠르게
                : MD ? RUN_V * mSpd * (run ? 1 : 0.55) * (inRiver && !MD.water ? 0.8 : 1)   // 🐴 탄 채로 — 끝까지 밀면 달리고, 덜 밀면 걷는다(공중에서도 그 빠르기)
                : (fly || !P.onGround) ? WALK_V * 1.35 : (run ? RUN_V : WALK_V) * (inRiver ? 0.65 : 1);
            const nx = P.x + mx * sp * dt, nz = P.z + mz * sp * dt;
            const boatOn = ride.on && MD && (MD.kind === 'boat' || MD.kind === 'sub'), seaOk = (x, z) => !boatOn || seaE(x, z) < 0.97;   // ⛵ 배는 바다 안에서만 — 해안에 닿으면 멈춘다
            if (!blocked(nx, P.z, P.y) && seaOk(nx, P.z)) P.x = nx;
            if (!blocked(P.x, nz, P.y) && seaOk(P.x, nz)) P.z = nz;
            if (plungeMom) {   // 🌊 풍덩 뒤 물속으로 미끄러져 나아간다 — 물의 저항으로 1초 남짓에 멎는다
                const mz = P.z + plungeMom.vz * dt; if (!blocked(P.x, mz, P.y)) P.z = mz;
                plungeMom.vz *= Math.exp(-dt * 1.6); if (plungeMom.vz < 0.08) plungeMom = null;
            }
            if (boatOn && moving && !seaOk(nx, nz)) { ride.edgeT = (ride.edgeT || 0) + dt; if (ride.edgeT > 0.6 && !ride.edgeHint) { ride.edgeHint = true; showHint(T('nj3d_boat_edge'), 2600); } } else { ride.edgeT = 0; if (boatOn && seaE(P.x, P.z) < 0.85) ride.edgeHint = false; }
            const FD = ride.on && MD && MD.kind === 'fly' ? MD : null;   // 🦅🔥🎈✈️ 나는 탈것 — 누르면 떠오르고, 떼면 천천히 내려온다(중력 대신)
            if (!ride.on && diveHeld && P.onGround && seaE(P.x, P.z) < 1 && !isUnder()) {   // 🤿 수면에서 잠수 — 첨벙
                P.y = SEA_Y - 0.06; P.vy = -0.6; P.onGround = false; gliding = false; splash(P.x, P.z, true);
                if (!diveHintShown) { diveHintShown = true; showHint(T('nj3d_dive_hint'), 3800); }
            }
            const underNow = !ride.on && isUnder(), SUB = ride.on && MD && MD.kind === 'sub' ? MD : null;
            if (SUB) { const want = jumpHeld ? 1.1 : diveHeld ? -1.1 : 0; P.vy += (want - P.vy) * Math.min(1, dt * 3); gliding = false; }
            else if (underNow) {   // 둘 다 떼면 그 깊이에 머문다 — 10/5까지는 0.16으로 저절로 떠올랐다(길 잃지 말라는 안전장치였는데, 사용자: 잠수 안 해도 떠오르는 게 싫다)
                const want = jumpHeld ? 0.95 : diveHeld ? -0.95 : 0; P.vy += (want - P.vy) * Math.min(1, dt * 4); gliding = false;
                if (!diveHintShown) { diveHintShown = true; showHint(T('nj3d_dive_hint'), 3800); }   // 떨어져 잠겨도 「점프 = 위로」를 알게
            }
            else if (FD) { const want = jumpHeld ? (FD.climb || 1) : P.onGround ? 0 : -(FD.sink || 0.5); P.vy += (want - P.vy) * Math.min(1, dt * 3); }
            else if (fly) { P.vy = Math.min(P.vy + 6.5 * dt, 1.4); gliding = false; }
            else if (glide) P.vy = Math.max(P.vy - G * 0.18 * dt, -(WG.sink || 0.42));   // 천천히 내려앉는다 — 좋은 날개일수록 덜 떨어진다
            else P.vy -= G * dt;
            const prevY = P.y, fallV = P.vy;
            P.y = Math.min(SUB ? SEA_Y - 0.12 : FD ? (FD.maxY || 40) : 18, P.y + P.vy * dt);   // 🚢 잠수함은 수면 바로 아래까지
            const g = groundAt(P.x, P.z, P.y);
            if (P.y <= g) { P.y = g; if (P.vy < 0) P.vy = 0; P.onGround = true; }
            else if (!fly && wasGround && P.vy <= 0 && P.y - g < 0.45) { P.y = g; P.vy = 0; P.onGround = true; }   // 내리막은 발을 땅에 붙인다 — 한 걸음마다 살짝 떴다 떨어져 콩콩 튀었고, 늘 공중이라 점프도 안 됐다(9/30)
            else P.onGround = false;
            if (!wasGround && P.onGround && wetAt(P.x, P.z)) splash(P.x, P.z, true);   // 물에 떨어짐
            if (!ride.on && prevY >= SEA_Y - 0.03 && P.y < SEA_Y - 0.03 && seaE(P.x, P.z) < 1) {   // 🌊 높은 데서 떨어져 수면을 뚫고 들어감(10/5 사용자: 활강하다 떨어지면 꽤 깊이 잠기는데 소리가 없었다)
                if (fallV < -1.2) { splash(P.x, P.z, true, true); sprayBurst(P.x, SEA_Y + 0.02, P.z, Math.min(SPRAY, 20 + Math.round(-fallV * 8)), 0); if (typeof SoundEffect !== 'undefined' && SoundEffect.playPlunge) SoundEffect.playPlunge(); }
                else splash(P.x, P.z, true);   // 살살 내려앉으면 보통 첨벙
            }
            if (moving) { const want = Math.atan2(-mx, -mz); let d = want - P.face; d = Math.atan2(Math.sin(d), Math.cos(d)); P.face += d * Math.min(1, dt * 10); }
            if (ride.on) {   // 성 안에서는 내린다 — 탈것은 문 밖 마지막 자리에서 기다린다
                if (inCity(P.x, P.z)) mountDown('city'); else ride.lastOut = [P.x, P.z];
            }
            pilgrim.position.set(P.x, P.y, P.z); pilgrim.rotation.y = P.face;
            if (ride.on && MD) {   // 안장 위에 — 앉는 자리만큼 올리고 앞뒤로 옮긴다, 달리면 들썩
                const s = MD.seat || [0, 0.36], fwd = s[0] * MOUNT_S;
                pilgrim.position.set(P.x - Math.sin(P.face) * fwd, P.y + s[1] * MOUNT_S - (MD.pose === 'stand' ? 0 : 0.07) + (moving && P.onGround ? Math.abs(Math.sin(ride.gait)) * (run ? 0.018 : 0.008) : 0), P.z - Math.cos(P.face) * fwd);
            }
            mountAnim(dt, moving, run, inWater);
            // 자세 — 걷기·달리기는 팔다리를 엇갈려 흔들고, 공중에선 팔을 벌리고, 날 때는 다리를 모은다
            const stepping = moving && P.onGround && !ride.on;
            if (stepping) {
                const prev = Math.sin(gait);
                gait += dt * (run ? 15 : 9.5) * (inRiver ? 0.8 : 1);
                if (Math.sign(Math.sin(gait)) !== Math.sign(prev)) {   // 발을 디딜 때마다 — 물이면 참방, 풀밭이면 사각
                    if (inWater) splash(P.x, P.z, false);
                    else if (typeof SoundEffect !== 'undefined' && SoundEffect.playGrass && grassAt(P.x, P.z, P.y)) SoundEffect.playGrass(run);
                }
            }
            const amp = run ? 0.95 : 0.55, sw = Math.sin(gait);
            let hL = 0, hR = 0, aL = 0, aR = 0, zL = 0, zR = 0, lean = 0, bob = 0;
            if (P.onGround) gliding = false;
            const gl = gliding && !fly;
            glider.visible = gl && wingKind === 'glider';
            backWings.visible = wingKind === 'wings' && !ride.on;   // 탈 때는 접은 날개를 감춘다(배·자전거에서 삐죽 튀어나왔다)
            if (wingKind === 'wings' && backWings.userData.p) {   // 걸을 땐 등에 접고, 활강하면 펼쳐 퍼덕인다
                const [pR, pL] = backWings.userData.p, fl = gl ? Math.sin(walkT * 7) * 0.35 + 0.1 : -0.25, ry = gl ? 0.15 : 1.3, ek = Math.min(1, dt * 8);
                pR.rotation.y += (-ry - pR.rotation.y) * ek; pL.rotation.y += (ry - pL.rotation.y) * ek; pR.rotation.z += (fl - pR.rotation.z) * ek; pL.rotation.z += (-fl - pL.rotation.z) * ek;
            }
            if (wingFx) wingFx(walkT, gl);
            const rk = ride.on ? kindOfMount(ride.k) : null;
            const RK = ride.on ? (NJ_MOUNTS[ride.k] || {}) : {};
            if (RK.pose === 'stand') { hL = 0; hR = 0; aL = RK.reins ? -0.8 : -0.35; aR = RK.reins ? -0.8 : -0.25; zL = -0.2; zR = 0.2; }   // 🔥🎈 서서 탄다 — 불병거는 고삐를
            else if (rk === 'car' || rk === 'sub' || RK.pose === 'sit') { hL = -1.45; hR = -1.45; aL = -1.15; aR = -1.15; zL = -0.05; zR = 0.05; }   // 🚗 앉아서 운전대를
            else if (rk === 'bike' && RK.motor) { hL = -0.95; hR = -0.95; aL = -1.0; aR = -1.0; lean = -0.3; }   // 🛵 발판에 발을 얹고 몸을 숙인다
            else if (rk === 'bike') { const c = Math.sin(ride.roll * 0.45); hL = -1.05 + c * 0.5; hR = -1.05 - c * 0.5; aL = -1.0; aR = -1.0; lean = -0.25; }   // 🚲 페달을 밟고 핸들을 잡는다
            else if (rk === 'boat') { hL = -1.45; hR = -1.45; aL = -0.35; aR = -0.6; zL = -0.2; zR = 0.25; }   // ⛵ 앉아서 한 손은 키를
            else if (ride.on) { hL = -1.25; hR = -1.25; aL = -0.75; aR = -0.75; zL = -0.15; zR = 0.15; lean = moving && run ? -0.15 : 0; }   // 🐴 걸터앉아 고삐를 잡는다
            else if (!ride.on && isUnder()) { const k2 = Math.sin(walkT * 9); hL = 0.25 * k2; hR = -0.25 * k2; const st = Math.sin(walkT * 3.5); aL = -2.6 + st * 0.6; aR = -2.6 - st * 0.6; zL = -0.35; zR = 0.35; lean = moving ? -1.25 : -0.5; }   // 🤿 헤엄 — 몸을 눕혀 발차기, 팔을 젓는다
            else if (glider.visible) { hL = -0.3; hR = -0.2; zL = -2.7; zR = 2.7; lean = -0.35; }   // 두 팔로 날개를 붙잡고 몸을 앞으로
            else if (gl && wingKind === 'wings') { hL = -0.25; hR = -0.15; zL = -0.9; zR = 0.9; lean = -0.5; }   // 등 날개로 날 때 — 팔을 벌리고 몸을 눕힌다
            else if (fly) { hL = 0.12; hR = 0.05; zL = -0.35; zR = 0.35; lean = -0.25; }
            else if (!P.onGround) { hL = 0.65; hR = -0.3; aL = -0.5; aR = 0.4; zL = -0.75; zR = 0.75; }
            else if (stepping) { hL = amp * sw; hR = -amp * sw; aL = -amp * 0.85 * sw; aR = amp * 0.85 * sw; lean = run ? -0.2 : -0.05; bob = Math.abs(Math.cos(gait)) * (run ? 0.012 : 0.006); }
            const e = Math.min(1, dt * 14), L = limbs;
            L.hipL.rotation.x += (hL - L.hipL.rotation.x) * e; L.hipR.rotation.x += (hR - L.hipR.rotation.x) * e;
            L.armL.rotation.x += (aL - L.armL.rotation.x) * e; L.armR.rotation.x += (aR - L.armR.rotation.x) * e;
            L.armL.rotation.z += (zL - L.armL.rotation.z) * e; L.armR.rotation.z += (zR - L.armR.rotation.z) * e;
            body.rotation.x += (lean - body.rotation.x) * e; body.position.y += (bob - body.position.y) * Math.min(1, dt * 30);
            { const sz = !ride.on || RK.pose === 'stand' ? 0 : rk === 'bike' ? (RK.motor ? 0.18 : 0.06) : rk === 'car' ? 0.12 : rk === 'boat' ? 0.15 : 0.42; L.hipL.rotation.z += (-sz - L.hipL.rotation.z) * e; L.hipR.rotation.z += (sz - L.hipR.rotation.z) * e; }   // 탈 때는 다리를 벌린다
            rippleTick(dt);
            flames.forEach(f => { f.visible = fly; f.scale.set(0.05, 0.08 + Math.random() * 0.04, 1); });
            if (moving || fly || !P.onGround) lastTouch = performance.now();
            followCam(dt);
        }
        function followCam(dt) {   // 걷기 카메라 — 미끄럼에서도 같이 쓴다
            const MD = ride.on ? (NJ_MOUNTS[ride.k] || {}) : null;
            const Tg = new THREE.Vector3(P.x, P.y + (ride.on && MD ? 0.12 + (MD.seat || [0, 0.36])[1] * MOUNT_S : 0.17), P.z);   // 탈 때는 앉은 높이만큼(낙타는 높이 — 멀리 보인다)
            const dir = new THREE.Vector3(Math.sin(camYaw) * Math.cos(camPitch), Math.sin(camPitch), Math.cos(camYaw) * Math.cos(camPitch));
            if (fpView) {   // 👁 1인칭(10/5 사용자) — 순례자 눈높이(탈 때는 안장 위)에서 보는 쪽 그대로. 내 몸은 감춘다
                const eye = Tg.clone(); eye.y += ride.on ? 0.06 : 0.025;
                const fw = new THREE.Vector3(-dir.x, 0, -dir.z); if (fw.lengthSq() > 1e-6) eye.addScaledVector(fw.normalize(), 0.035);   // 얼굴 앞 — 머리 속에서 보지 않게
                eye.y = Math.max(eye.y, groundAt(eye.x, eye.z, eye.y) + 0.05);
                camera.position.copy(eye); body.visible = false; camOff = null;
                camera.lookAt(eye.x - dir.x, eye.y - dir.y, eye.z - dir.z);
                return;
            }
            let dist = camDist * (ride.on && MD ? (MD.camFar || 1) : 1);   // 큰 탈것(비행기·불병거·열기구)은 카메라를 뒤로 — 날개가 화면을 가렸다
            body.visible = camPitch > -0.75;   // 많이 올려다보면 순례자를 잠시 숨긴다(1인칭처럼) — 등이 화면을 가렸다
            ray.set(Tg, dir); ray.far = dist;
            const hits = ray.intersectObjects(built.children, true);
            if (hits.length) dist = Math.max(0.12, hits[0].distance - 0.05);
            const cp = Tg.clone().addScaledVector(dir, dist);
            if ((!ride.on || kindOfMount(ride.k) === 'sub') && isUnder()) {   // 🤿 물속에선 카메라도 물속에 — 카메라 자리가 뭍이면 바다 쪽으로 당긴다(바닷가에선 뭍 위에 떠서 물 위를 비췄다)
                let dd = dist; while (seaE(cp.x, cp.z) >= 0.99 && dd > 0.12) { dd *= 0.8; cp.copy(Tg).addScaledVector(dir, dd); }
                cp.y = Math.min(cp.y, SEA_Y - 0.1);
            }   // 🤿 물속에선 카메라도 물속에 — 카메라가 바다 위일 때만(물가에선 뭍 땅속으로 끌려 들어갔다)
            cp.y = Math.max(cp.y, groundAt(cp.x, cp.z, cp.y) + 0.12);   // 10/5: 0.03 — 내리막에서 카메라가 땅 표면에 눌려 파묻힌 듯 보였다
            // 🪂 10/4 밤 (사용자: 활강할 때 캐릭터가 덜덜 떨린다) — 전엔 카메라 자리를 lerp(dt × 12)로 쫓았다. 빠를수록 카메라가 뒤처지는데
            //    그 거리가 프레임 간격마다 달라 순례자가 화면에서 앞뒤로 떨렸다. → 순례자에서 카메라까지의 **오프셋만** 부드럽게(돌리기·벽에 걸림),
            //    카메라는 늘 순례자 + 오프셋 — 아무리 빨라도 순례자는 화면 같은 자리
            const want = cp.sub(Tg);
            if (!camOff || camOff.distanceTo(want) > 6) camOff = want.clone(); else camOff.lerp(want, 1 - Math.exp(-dt * 12));
            camera.position.copy(Tg).add(camOff);
            const gy = groundAt(camera.position.x, camera.position.z, camera.position.y) + 0.12, lift = gy - camera.position.y;
            if (lift > 0) camera.position.y = gy;
            // 늘 순례자 쪽(-dir)을 본다 — 카메라가 땅에 걸려 멈춰도 시선은 그대로 위로 들려 하늘을 본다(땅속을 보지 않는다)
            // 단 보통 시선(위에서 내려다봄)인데 오르막에 걸려 들렸으면 들린 만큼 순례자 쪽으로 고개를 숙인다 — 안 그러면 땅을 훑어봤다(10/5)
            const k = camPitch > 0 ? Math.max(0, Math.min(1, lift / 0.3)) : 0;
            camera.lookAt(camera.position.x - dir.x + (Tg.x - camera.position.x + dir.x) * k, camera.position.y - dir.y + 0.04 + (Tg.y - camera.position.y + dir.y - 0.04) * k, camera.position.z - dir.z + (Tg.z - camera.position.z + dir.z) * k);
        }

        // ══ 🐚 값진 진주 찾기 (10/5) — 바다 밑 조개 셋(날마다 새 자리) · 강 어귀의 진주 장사 (game.js NJ_PEARLS · docs/새-예루살렘.md) ══
        const clamBtn = ov.querySelector('.nj3d-clambtn'), pearlBtn = ov.querySelector('.nj3d-pearlbtn');
        clamBtn.textContent = T('nj3d_clam_open'); pearlBtn.textContent = T('nj3d_pearl_btn');
        const clams = [], clamAnims = [];
        let nearClam = null, nearMerchant = false, clamQ = null, clamHinted = false;
        const shellMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xe9c9b4).convertSRGBToLinear(), roughness: 0.55, flatShading: true, side: THREE.DoubleSide });
        const innerMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(0xf7ece4).convertSRGBToLinear(), roughness: 0.25, metalness: 0.2, side: THREE.DoubleSide });
        const PEARL_C = { w: 0xf6f2ea, c: 0xf2b8cf, g: 0xffd56a };
        const halfShell = (() => {   // 부채꼴 조개껍데기 반쪽 — 골이 진 납작한 반구
            const g = new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), p = g.attributes.position;
            for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), rib = 1 + 0.06 * Math.cos(a * 9); p.setXYZ(i, x * rib, y * 0.32, z * rib * 0.85); }
            g.computeVertexNormals(); return g;
        })();
        cleanups.push(() => halfShell.dispose());
        function clamSpots(day) {   // 날짜로 정해지는 자리 — 깊은 데 · 중간 · 얕은 데
            let sd = 7; for (const ch of String(day)) sd = (sd * 31 + ch.charCodeAt(0)) % 2147483647; sd = sd || 1;
            const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
            return [[0.12, 0.42], [0.45, 0.68], [0.7, 0.86]].map(([a0, a1]) => { const a = r() * Math.PI * 2, q = Math.sqrt(a0 + (a1 - a0) * r()); return [Math.cos(a) * q * SRX, SZ + Math.sin(a) * q * SRZ]; });
        }
        if (typeof _njClamDay === 'function') {
            const day = _njClamDay();
            clamSpots(day.day).forEach(([x, z], i) => {
                const g = new THREE.Group(), y = seabed(x, z);
                const bottom = new THREE.Mesh(halfShell, shellMat); bottom.rotation.x = Math.PI; bottom.scale.setScalar(0.09);
                const hinge = new THREE.Group(); hinge.position.set(-0.075, 0, 0); g.add(hinge);
                const top = new THREE.Mesh(halfShell, shellMat); top.position.set(0.075, 0, 0); top.scale.setScalar(0.09); hinge.add(top);
                const inner = new THREE.Mesh(new THREE.CircleGeometry(0.07, 14).rotateX(-Math.PI / 2), innerMat); inner.position.y = 0.002; inner.scale.set(1, 1, 0.85);
                g.add(bottom, inner);
                const glint = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xfff2c4, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
                glint.position.y = 0.12; glint.scale.setScalar(0.3); g.add(glint);
                g.position.set(x, y + 0.02, z); g.rotation.y = i * 2.1; reefG.add(g);
                const done = (day.done || []).includes(i);
                if (done) hinge.rotation.z = 0.9;   // 연(또는 닫혀 버린) 조개는 빈 껍데기 — 열린 채로
                glint.visible = !done;
                clams.push({ i, x, z, y, g, hinge, glint, done });
            });
        }
        // 진주 장사 — 강 어귀 모래밭, 미끄럼으로 풍덩한 자리가 보이는 곳(마 13:45). 자색 옷, 앞에 깔개와 진주 바구니
        const MER = { x: 1.9, z: SHORE - 0.9 };
        {
            const y = WT(MER.x, MER.z), mg = new THREE.Group(); mg.position.set(MER.x, y, MER.z); scene.add(mg);
            const man = makePerson(0x6b3fa0); man.scale.setScalar(1.6); mg.add(man);
            const dx = -MER.x, dz = SHORE + 1.5 - MER.z, L = Math.hypot(dx, dz); man.rotation.y = Math.atan2(-dz / L, dx / L);   // 사람 모델은 +x가 앞 — 어귀를 본다
            const fx = dx / L * 0.32, fz = dz / L * 0.32;
            const rug = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.01, 0.3), new THREE.MeshStandardMaterial({ color: 0x9b2d3a, roughness: 0.9 })); rug.position.set(fx, 0.005, fz); rug.rotation.y = man.rotation.y; mg.add(rug);
            const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.06, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0xb08850, roughness: 0.9, side: THREE.DoubleSide })); basket.position.set(fx, 0.04, fz); mg.add(basket);
            [[0, 0], [0.025, 0.015], [-0.02, 0.02], [0.01, -0.025], [-0.025, -0.01]].forEach(([a, b], k) => { const pm = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 8), new THREE.MeshStandardMaterial({ color: [0xf6f2ea, 0xf2b8cf, 0xf6f2ea, 0xd9c8f2, 0xffd56a][k], roughness: 0.15, metalness: 0.3 })); pm.position.set(fx + a, 0.07, fz + b); mg.add(pm); });
            addBlob(man, 0.3);
        }
        function clamHint() {
            if (clamHinted || typeof _njClamLeft !== 'function') return;
            const n = _njClamLeft(); if (!n) return;
            clamHinted = true; showHint(T('nj3d_clam_today', { n }), 4500);
        }
        function closeClamQ() { if (clamQ) { clamQ = null; fishQ.hidden = true; fishQ.innerHTML = ''; } }
        function askClam(c) {
            const q = typeof _njClamQuestion === 'function' ? _njClamQuestion() : null;
            if (!q) { showHint(T('nj3d_clam_need'), 3000); return; }
            clamQ = { c, q, tries: clamQ && clamQ.c === c ? clamQ.tries : 2 };
            const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
            fishQ.classList.remove('watch', 'now', 'reel');
            fishQ.innerHTML = `<div class="nj3d-fishq-head">${T(clamQ.tries === 2 ? 'nj3d_clam_q' : 'nj3d_clam_again')}</div>
                <div class="nj3d-fishq-ref">${esc(q.ref)}</div>
                <div class="nj3d-fishq-text">${esc(q.before)} <span class="nj3d-fishq-blank">＿＿＿</span> ${esc(q.after)}</div>
                <div class="nj3d-fishq-choices">${q.choices.map((ch, i) => `<button data-i="${i}">${esc(ch)}</button>`).join('')}</div>`;
            fishQ.hidden = false;
            fishQ.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => {
                const ok = q.choices[+b.dataset.i] === q.answer;
                if (ok) { closeClamQ(); openClam(c); return; }
                if (typeof _njClamResult === 'function') _njClamResult(c.i, false);
                clamQ.tries--;
                if (clamQ.tries > 0) askClam(c);
                else { closeClamQ(); c.done = true; c.glint.visible = false; clamAnims.push({ c, t: 0, kind: 'shut' }); showHint(T('nj3d_clam_shut'), 3200); }
            });
        }
        function openClam(c) {
            const res = typeof _njClamResult === 'function' ? _njClamResult(c.i, true) : null;
            if (!res) return;
            c.done = true; c.glint.visible = false;
            const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.022, 14, 10), new THREE.MeshStandardMaterial({ color: new THREE.Color(PEARL_C[res.k]).convertSRGBToLinear(), roughness: 0.12, metalness: 0.35,
                emissive: res.k === 'g' ? 0x8a6200 : 0x222222, emissiveIntensity: res.k === 'g' ? 0.9 : 0.25 }));
            pearl.position.set(0, 0.02, 0); c.g.add(pearl);
            clamAnims.push({ c, t: 0, kind: 'open', pearl, rare: res.k === 'g' });
            sprayBurst(c.x, c.y + 0.05, c.z, 12, 0);
            if (typeof SoundEffect !== 'undefined' && SoundEffect.playBlankLevelUp) { SoundEffect.playBlankLevelUp(); if (res.k === 'g') setTimeout(() => SoundEffect.playBlankLevelUp(), 380); }
            showHint(res.k === 'g' ? T('nj3d_clam_rare', { gem: res.gem.toLocaleString() }) : T('nj3d_clam_got', { name: res.name, gem: res.gem.toLocaleString() }), 4800);
        }
        function clamTick(dt) {
            const tt = performance.now() / 1000;
            clams.forEach(c => { if (c.glint.visible) { const s = 0.24 + Math.sin(tt * 3 + c.i * 2) * 0.08; c.glint.scale.setScalar(s); c.glint.position.y = 0.12 + Math.sin(tt * 1.7 + c.i) * 0.02; } });
            for (let k = clamAnims.length - 1; k >= 0; k--) {
                const a = clamAnims[k]; a.t += dt;
                if (a.kind === 'open') {
                    a.c.hinge.rotation.z = Math.min(1, a.t / 0.5) * 1.1;
                    if (a.pearl) { const u = Math.max(0, a.t - 0.4); a.pearl.position.y = 0.02 + Math.min(0.14, u * 0.25); a.pearl.rotation.y = tt * 2; a.pearl.scale.setScalar(1 + (a.rare ? Math.sin(tt * 8) * 0.12 : 0));
                        if (a.t > 2.6) { const f = Math.max(0, 1 - (a.t - 2.6) / 0.5); a.pearl.scale.setScalar(f); } }
                    if (a.t > 3.1) { if (a.pearl) { a.c.g.remove(a.pearl); a.pearl.geometry.dispose(); a.pearl.material.dispose(); } a.c.hinge.rotation.z = 0.9; clamAnims.splice(k, 1); }
                } else {   // 닫혀 버림 — 덜컥 흔들리고 열린 채 빈 껍데기로
                    a.c.g.rotation.z = Math.sin(a.t * 40) * 0.08 * Math.max(0, 1 - a.t / 0.5);
                    if (a.t > 0.6) { a.c.g.rotation.z = 0; a.c.hinge.rotation.z = 0.9; clamAnims.splice(k, 1); }
                }
            }
        }
        function clamCheck() {   // 1초에 네 번 — 물속 조개 곁 · 어귀 진주 장사 곁
            nearClam = null;
            if (isUnder()) {
                let bd = 0.55; clams.forEach(c => { if (c.done) return; const d = Math.hypot(c.x - P.x, c.z - P.z); if (d < bd && Math.abs(P.y - c.y) < 0.9) { bd = d; nearClam = c; } });
                clamHint();
            }
            clamBtn.hidden = !nearClam || !!clamQ;
            if (clamQ && (!nearClam || nearClam !== clamQ.c)) closeClamQ();   // 헤엄쳐 멀어지면 문제를 닫는다(다시 오면 다시)
            nearMerchant = !isUnder() && Math.hypot(MER.x - P.x, MER.z - P.z) < 1.3;
            pearlBtn.hidden = !nearMerchant;
            if (!nearMerchant && offerEl.dataset.pearl === '1') { offerEl.hidden = true; offerEl.dataset.pearl = ''; }
        }
        clamBtn.addEventListener('pointerdown', e => { e.preventDefault(); if (nearClam && !clamQ) { clamBtn.hidden = true; askClam(nearClam); } });
        function bindPearlSell(root, reopen) {
            root.querySelectorAll('button[data-sell]').forEach(b => b.onclick = () => {
                const gem = typeof _njPearlSell === 'function' ? _njPearlSell(b.dataset.sell, b.dataset.n === 'all' ? 'all' : 1) : 0;
                if (gem > 0) { syncWallet(); showHint(T('nj3d_pearl_sold', { gem: gem.toLocaleString() }), 2400); if (typeof SoundEffect !== 'undefined' && SoundEffect.playGem) SoundEffect.playGem(); }
                reopen();
            });
        }
        function openPearlShop() {
            offerEl.innerHTML = `<button class="nj3d-fruit-x" aria-label="close">✕</button>
                <div class="nj3d-offer-head">${T('nj3d_pearl_title')}</div>
                <div class="nj3d-offer-intro">${T('nj3d_pearl_intro')}</div>
                <div class="nj3d-offer-list">${typeof _njPearlSellHtml === 'function' ? _njPearlSellHtml() : ''}</div>`;
            offerEl.hidden = false; offerEl.dataset.pearl = '1';
            offerEl.querySelector('.nj3d-fruit-x').onclick = () => { offerEl.hidden = true; offerEl.dataset.pearl = ''; };
            bindPearlSell(offerEl, openPearlShop);
        }
        pearlBtn.addEventListener('pointerdown', e => { e.preventDefault(); if (nearMerchant) openPearlShop(); });

        // ══ 🍞 만나 · 🐦 메추라기 (10/5) — 오늘의 암송을 마친 날 성 둘레 들판(출 16:13 「진 사면에」) (game.js _njMannaToday · docs/새-예루살렘.md) ══
        const MT = typeof _njMannaToday === 'function' ? _njMannaToday() : { ids: [], ready: false };
        const MD0 = typeof _njMannaDay === 'function' ? _njMannaDay() : { got: [], quail: [], qfail: {} };
        const mannaSpots = (() => {   // 날짜로 정해지는 자리 — 산마루 안, 성벽 바깥(물길 피함), 고르게 돌아가며
            let sd = 11; for (const ch of String(MD0.day || '')) sd = (sd * 31 + ch.charCodeAt(0)) % 2147483647; sd = sd || 1;
            const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647, n = MT.ids.length, a0 = r() * Math.PI * 2, out = [];
            for (let i = 0; i < n; i++) {
                let a = a0 + i / Math.max(1, n) * Math.PI * 2 + (r() - 0.5) * 0.4, d = 8.3 + r() * 2.6;
                for (let k = 0; k < 8; k++) { const c = Math.cos(a), s = Math.sin(a), m = Math.max(Math.abs(c), Math.abs(s)), x = c / m * d, z = s / m * d; if (Math.abs(x) > 1.6 && Math.abs(z) > 1.6) { out.push([x, z]); break; } a += 0.2; }
                if (out.length <= i) out.push([d, d]);
            }
            return out;
        })();
        const mannaG = new THREE.Group(); scene.add(mannaG);
        const mannas = [], quails = [], mannaAnims = [];
        let mannaHinted = false, quailHinted = false, nearQuail = null, quailQ = null;
        const flakeG = new THREE.CircleGeometry(0.014, 6); flakeG.rotateX(-Math.PI / 2);
        const flakeM = new THREE.MeshStandardMaterial({ color: 0xfffdf2, emissive: 0x6b6250, emissiveIntensity: 0.35, roughness: 0.5 });
        cleanups.push(() => flakeG.dispose());
        if (MT.ready) mannaSpots.forEach(([x, z], i) => {
            if ((MD0.got || []).includes(i)) return;
            const N = MT.sat ? 110 : 60, R0 = MT.sat ? 0.42 : 0.32, im = new THREE.InstancedMesh(flakeG, flakeM, N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
            for (let k = 0; k < N; k++) { const a = Math.random() * 6.28, rr = Math.sqrt(Math.random()) * R0, fx = x + Math.cos(a) * rr, fz = z + Math.sin(a) * rr, s2 = 0.7 + Math.random() * 0.7;
                q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * 6.28); v.set(fx, terrain(fx, fz) + 0.008, fz); sc.set(s2, 1, s2); m4.compose(v, q, sc); im.setMatrixAt(k, m4); }
            const dew = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xfff6dc, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
            dew.position.set(x, terrain(x, z) + 0.06, z); dew.scale.setScalar(R0 * 1.5);   // 이슬빛 — 처음 2.4배는 기둥처럼 번졌다
            const g = new THREE.Group(); g.add(im, dew); mannaG.add(g);
            mannas.push({ i, x, z, g, im, dew, done: false });
        });
        // 메추라기 — 둥근 갈색 몸, 작은 머리와 부리. 쪼다가 가끔 콩콩
        const quailBody = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x8a6a45).convertSRGBToLinear(), roughness: 0.85, flatShading: true });
        const quailHead = new THREE.MeshStandardMaterial({ color: new THREE.Color(0x5b4430).convertSRGBToLinear(), roughness: 0.85, flatShading: true });
        const quailBeak = new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.6 });
        function makeQuail() {
            const g = new THREE.Group(), body = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), quailBody); body.scale.set(1, 0.82, 1.3); body.position.y = 0.04; g.add(body);
            const head = new THREE.Group(); head.position.set(0, 0.075, 0.045); g.add(head);
            head.add(new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), quailHead));
            const bk = new THREE.Mesh(new THREE.ConeGeometry(0.007, 0.018, 5), quailBeak); bk.rotation.x = Math.PI / 2; bk.position.set(0, -0.004, 0.026); head.add(bk);
            const plume = new THREE.Mesh(new THREE.ConeGeometry(0.005, 0.03, 4), quailHead); plume.position.set(0, 0.028, 0.006); plume.rotation.x = -0.4; head.add(plume);   // 머리 깃
            [-1, 1].forEach(s => { const w = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), quailHead); w.scale.set(0.35, 0.6, 1.1); w.position.set(s * 0.04, 0.045, -0.005); w.name = s < 0 ? 'wL' : 'wR'; g.add(w); });
            g.userData.head = head; return g;
        }
        if (MT.ready && typeof _njQuailTime === 'function' && _njQuailTime()) (MD0.got || []).forEach(i => {
            if ((MD0.quail || []).includes(i) || !mannaSpots[i]) return;
            const [x0, z0] = mannaSpots[i], g = makeQuail(), x = x0 + 0.5, z = z0 - 0.3;
            g.position.set(x, terrain(x, z), z); g.rotation.y = Math.random() * 6.28; mannaG.add(g);
            quails.push({ i, g, x, z, tries: 2, done: false, ph: Math.random() * 6 });
        });
        function mannaHint() {
            if (!mannaHinted && mannas.some(m => !m.done)) { mannaHinted = true; showHint(T('nj3d_manna_here'), 5000); return; }
            if (!quailHinted && quails.some(q => !q.done)) { quailHinted = true; showHint(T('nj3d_quail_here'), 4500); }
        }
        setTimeout(() => { if (cur === C) mannaHint(); }, 3200);
        function closeQuailQ() { if (quailQ) { quailQ = null; fishQ.hidden = true; fishQ.innerHTML = ''; } }
        function askQuail(qa) {
            const q = typeof _njQuailQuestion === 'function' ? _njQuailQuestion(qa.i) : null;
            if (!q) { catchQuail(qa, ''); return; }   // 문제를 못 만들면(아주 짧은 절) 그냥 잡힌다
            quailQ = { qa, q };
            const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
            fishQ.classList.remove('watch', 'now', 'reel');
            fishQ.innerHTML = `<div class="nj3d-fishq-head">${T(qa.tries === 2 ? 'nj3d_quail_flee' : 'nj3d_quail_again')}</div>
                <div class="nj3d-fishq-ref">${esc(q.ref)}</div>
                <div class="nj3d-fishq-text">${esc(q.before)} <span class="nj3d-fishq-blank">＿＿＿</span> ${esc(q.after)}</div>
                <div class="nj3d-fishq-choices">${q.choices.map((ch, i) => `<button data-i="${i}">${esc(ch)}</button>`).join('')}</div>`;
            fishQ.hidden = false;
            fishQ.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => {
                const ok = q.choices[+b.dataset.i] === q.answer;
                closeQuailQ();
                if (ok) { catchQuail(qa, q.answer); return; }
                if (typeof _njQuailResult === 'function') _njQuailResult(qa.i, false);
                qa.tries--;
                if (qa.tries > 0) {   // 푸드덕 물러난다 — 다시 다가가면 또 문제
                    const dx = qa.x - P.x, dz = qa.z - P.z, L = Math.hypot(dx, dz) || 1;
                    mannaAnims.push({ kind: 'hop', qa, t: 0, fx: qa.x, fz: qa.z, tx: qa.x + dx / L * 0.9, tz: qa.z + dz / L * 0.9 });
                    showHint(T('nj3d_quail_again'), 1800);
                } else { qa.done = true; mannaAnims.push({ kind: 'fly', qa, t: 0, dx: qa.x - P.x, dz: qa.z - P.z }); showHint(T('nj3d_quail_away'), 2600); }
            });
        }
        const netG = (() => { const g = new THREE.SphereGeometry(0.11, 12, 5, 0, Math.PI * 2, 0, Math.PI / 2); return g; })();
        cleanups.push(() => netG.dispose());
        function wordSprite(txt) {
            const cv = document.createElement('canvas'); cv.width = 512; cv.height = 96; const x = cv.getContext('2d');
            x.font = '700 52px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = 'rgba(120,80,0,0.8)'; x.shadowBlur = 12; x.fillStyle = '#ffe28a'; x.fillText(txt, 256, 48);
            const tx = new THREE.CanvasTexture(cv); tx.encoding = THREE.sRGBEncoding;
            const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false })); s.scale.set(0.5, 0.094, 1); return s;
        }
        function catchQuail(qa, word) {   // ✨ 말씀의 그물 — 금빛 그물이 위에서 펼쳐져 덮고, 맞힌 말씀이 떠오른다
            const gem = typeof _njQuailResult === 'function' ? _njQuailResult(qa.i, true) : 0;
            qa.done = true;
            const net = new THREE.Mesh(netG, new THREE.MeshBasicMaterial({ color: 0xffd34d, wireframe: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
            net.position.set(qa.x, qa.g.position.y + 0.8, qa.z); net.scale.setScalar(2.4); mannaG.add(net);
            let ws = null; if (word) { ws = wordSprite(word); ws.position.set(qa.x, qa.g.position.y + 0.2, qa.z); ws.material.opacity = 0; mannaG.add(ws); }
            mannaAnims.push({ kind: 'net', qa, net, ws, t: 0 });
            sprayBurst(qa.x, qa.g.position.y + 0.05, qa.z, 10, 0);
            if (typeof SoundEffect !== 'undefined') { if (SoundEffect.playWhee) SoundEffect.playWhee(); if (SoundEffect.playBlankLevelUp) setTimeout(() => SoundEffect.playBlankLevelUp(), 450); }
            if (gem) setTimeout(() => { if (cur === C) { showHint(T('nj3d_quail_got', { gem: gem.toLocaleString() }), 3500); syncWallet(); } }, 500);
        }
        function mannaTick(dt) {
            const tt = performance.now() / 1000;
            mannas.forEach(m => { if (!m.done) m.dew.material.opacity = 0.28 + Math.sin(tt * 2 + m.i) * 0.1; });
            quails.forEach(q => {
                if (q.done) return;
                const near = nearQuail === q, hd = q.g.userData.head;
                q.ph += dt;
                if (near) { hd.position.y = 0.085; hd.rotation.x = -0.3; q.g.position.y = terrain(q.x, q.z) + Math.abs(Math.sin(tt * 14)) * 0.012; q.g.getObjectByName('wL').rotation.z = Math.sin(tt * 30) * 0.5; q.g.getObjectByName('wR').rotation.z = -Math.sin(tt * 30) * 0.5; }   // 도망치려 푸드덕
                else { hd.position.y = 0.075; hd.rotation.x = Math.max(0, Math.sin(q.ph * 2.2)) * 0.9; q.g.position.y = terrain(q.x, q.z); }   // 쪼아 먹는다
            });
            for (let k = mannaAnims.length - 1; k >= 0; k--) {
                const a = mannaAnims[k]; a.t += dt;
                if (a.kind === 'gather') {   // 만나가 반짝이며 떠올라 사라진다
                    const u = Math.min(1, a.t / 0.8); a.m.g.position.y = u * 0.25; a.m.g.scale.setScalar(1 - u * 0.6); a.m.dew.material.opacity = 0.6 * (1 - u);
                    if (u >= 1) { mannaG.remove(a.m.g); a.m.im.dispose(); mannaAnims.splice(k, 1); }
                } else if (a.kind === 'net') {
                    const u = Math.min(1, a.t / 0.45), e = 1 - Math.pow(1 - u, 3);
                    a.net.position.y = a.qa.g.position.y + 0.8 - 0.8 * e; a.net.scale.setScalar(2.4 - 1.4 * e); a.net.rotation.y = tt * 0.8;
                    if (a.ws) { a.ws.position.y = a.qa.g.position.y + 0.2 + Math.max(0, a.t - 0.4) * 0.25; a.ws.material.opacity = Math.max(0, Math.min(1, (a.t - 0.35) * 4)) * Math.max(0, 1 - Math.max(0, a.t - 1.6) * 2); }
                    if (a.t > 1.7) { const f = Math.max(0, 1 - (a.t - 1.7) / 0.5); a.net.scale.setScalar(f); a.qa.g.scale.setScalar(f); a.net.material.opacity = 0.95 * f; }
                    if (a.t > 2.3) { mannaG.remove(a.net); a.net.material.dispose(); mannaG.remove(a.qa.g); if (a.ws) { mannaG.remove(a.ws); a.ws.material.map.dispose(); a.ws.material.dispose(); } mannaAnims.splice(k, 1); }
                } else if (a.kind === 'hop') {   // 푸드덕 물러남
                    const u = Math.min(1, a.t / 0.45); a.qa.x = a.fx + (a.tx - a.fx) * u; a.qa.z = a.fz + (a.tz - a.fz) * u;
                    a.qa.g.position.set(a.qa.x, terrain(a.qa.x, a.qa.z) + Math.sin(u * Math.PI) * 0.25, a.qa.z);
                    if (u >= 1) mannaAnims.splice(k, 1);
                } else if (a.kind === 'fly') {   // 날아가 버림
                    const L = Math.hypot(a.dx, a.dz) || 1; a.qa.g.position.x += a.dx / L * dt * 3; a.qa.g.position.z += a.dz / L * dt * 3; a.qa.g.position.y += dt * 2.2;
                    a.qa.g.getObjectByName('wL').rotation.z = Math.sin(tt * 40) * 0.8; a.qa.g.getObjectByName('wR').rotation.z = -Math.sin(tt * 40) * 0.8;
                    if (a.t > 2) { mannaG.remove(a.qa.g); mannaAnims.splice(k, 1); }
                }
            }
        }
        function mannaCheck() {   // 1초에 네 번 — 만나를 밟았나 · 메추라기 곁인가
            if (isUnder()) { nearQuail = null; return; }
            mannas.forEach(m => {
                if (m.done || !P.onGround || Math.hypot(m.x - P.x, m.z - P.z) > 0.45) return;
                const gem = typeof _njMannaGather === 'function' ? _njMannaGather(m.i) : 0;
                if (!gem) return;
                m.done = true; mannaAnims.push({ kind: 'gather', m, t: 0 }); syncWallet();
                if (typeof SoundEffect !== 'undefined' && SoundEffect.playBlankLevelUp) SoundEffect.playBlankLevelUp();
                showHint(mannas.every(x => x.done) ? T('nj3d_manna_got', { gem: gem.toLocaleString() }) + (MT.sat ? T('nj3d_manna_sat') : '') + ' · ' + T('nj3d_manna_all') : T('nj3d_manna_got', { gem: gem.toLocaleString() }) + (MT.sat ? T('nj3d_manna_sat') : ''), 3800);
            });
            let best = null, bd = 1.1;
            quails.forEach(q => { if (q.done) return; const d = Math.hypot(q.x - P.x, q.z - P.z); if (d < bd) { bd = d; best = q; } });
            const was = nearQuail; nearQuail = best;
            if (best && !quailQ && !clamQ && best !== (was && quailQ ? was : null) && !mannaAnims.some(a => a.qa === best)) askQuail(best);
            if (quailQ && (!best || best !== quailQ.qa)) closeQuailQ();   // 멀어지면 문제를 닫는다(다시 다가가면 다시)
        }

        // ══ 🗺️ 미니맵 (10/5 사용자) — 걷기 화면 오른쪽 위. 바라보는 쪽이 위(조이스틱과 같은 방향), 누르면 가까이/멀리 ══
        //    성·산마루·강·바다(모래사장)·내 위치 + 진주 장사·만나·메추라기·사신. 조개는 찾는 재미 — 8칸 안에 들어와야 반짝 표시
        const mini = ov.querySelector('.nj3d-mini'), mctx = mini.getContext('2d');
        let miniFar = false, miniT = 0;
        try { miniFar = localStorage.getItem('kingsRoad_nj3dMiniFar') === '1'; } catch (e) { }
        mini.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); miniFar = !miniFar; try { localStorage.setItem('kingsRoad_nj3dMiniFar', miniFar ? '1' : '0'); } catch (er) { } miniT = 0; });
        function miniDraw() {
            const css = mini.clientWidth || 116, dpr = Math.min(2, window.devicePixelRatio || 1), W = Math.round(css * dpr);
            if (mini.width !== W) { mini.width = W; mini.height = W; }
            const c = mctx, h = W / 2, Rw = miniFar ? 46 : 16, s = h / Rw;
            const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
            const toMap = (x, z) => { const dx = x - P.x, dz = z - P.z; return [h + (rx * dx + rz * dz) * s, h - (fx * dx + fz * dz) * s]; };
            c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, W);
            c.save(); c.beginPath(); c.arc(h, h, h - 1, 0, Math.PI * 2); c.clip();
            c.fillStyle = '#3f7f4b'; c.fillRect(0, 0, W, W);   // 비탈·벌판
            c.setTransform(rx * s, -fx * s, rz * s, -fz * s, h - s * (rx * P.x + rz * P.z), h + s * (fx * P.x + fz * P.z));   // 세계 좌표 그대로 그린다
            c.fillStyle = '#e3d29f'; c.beginPath(); c.ellipse(0, SZ, SRX * 1.22, SRZ * 1.22, 0, 0, Math.PI * 2); c.fill();   // 모래사장
            c.fillStyle = '#3aa7c4'; c.beginPath(); c.ellipse(0, SZ, SRX, SRZ, 0, 0, Math.PI * 2); c.fill();                    // 생명수의 바다
            c.fillStyle = '#5fae69'; c.fillRect(-PL, -PL, PL * 2, PL * 2);                                                          // 산마루
            c.strokeStyle = '#7fd8ea'; c.lineWidth = 1.1;
            c.beginPath(); c.moveTo(0, -150); c.lineTo(0, SHORE + 0.5); c.moveTo(-150, 0); c.lineTo(150, 0); c.stroke();          // 네 강(남쪽은 어귀까지)
            c.fillStyle = '#f2d58a'; c.fillRect(-HALF, -HALF, HALF * 2, HALF * 2);                                                // 성
            c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, 0.9, 0, Math.PI * 2); c.fill();                                   // 보좌
            c.setTransform(1, 0, 0, 1, 0, 0);
            const dot = (x, z, col, r, ring) => { const [mx, my] = toMap(x, z); if (Math.hypot(mx - h, my - h) > h - 4) return; c.fillStyle = col; c.beginPath(); c.arc(mx, my, r * dpr, 0, Math.PI * 2); c.fill(); if (ring) { c.strokeStyle = ring; c.lineWidth = 1.2 * dpr; c.stroke(); } };
            envoys.forEach(e => dot(e.x, e.z, '#c77b2e', 2.6));
            dot(MER.x, MER.z, '#8e5ad0', 3.6, '#ffffff');                                                                          // 💎 진주 장사
            mannas.forEach(m => { if (!m.done) dot(m.x, m.z, '#fffdf0', 3.4, '#e8c35a'); });                                      // 🍞 만나
            quails.forEach(q => { if (!q.done) dot(q.x, q.z, '#8a6a45', 3.2, '#fff2c4'); });                                      // 🐦 메추라기
            const tw = 0.6 + Math.sin(performance.now() / 180) * 0.4;
            clams.forEach(cl => { if (!cl.done && Math.hypot(cl.x - P.x, cl.z - P.z) < 8) dot(cl.x, cl.z, `rgba(255,236,170,${tw.toFixed(2)})`, 2.6); });   // 🐚 가까이 오면 반짝
            // 나 — 가운데 화살표(늘 위)
            c.fillStyle = '#ffffff'; c.strokeStyle = '#1b2a44'; c.lineWidth = 1.5 * dpr;
            c.beginPath(); c.moveTo(h, h - 7 * dpr); c.lineTo(h + 5 * dpr, h + 5 * dpr); c.lineTo(h, h + 2.5 * dpr); c.lineTo(h - 5 * dpr, h + 5 * dpr); c.closePath(); c.fill(); c.stroke();
            c.restore();
            // 테두리 · 북쪽
            c.strokeStyle = 'rgba(246,215,122,0.85)'; c.lineWidth = 2 * dpr; c.beginPath(); c.arc(h, h, h - 1.5 * dpr, 0, Math.PI * 2); c.stroke();
            const [nmx, nmy] = (() => { const dx = 0, dz = -1, X = rx * dx + rz * dz, Y = -(fx * dx + fz * dz); return [h + X * (h - 9 * dpr), h + Y * (h - 9 * dpr)]; })();
            c.fillStyle = '#1b2a44'; c.beginPath(); c.arc(nmx, nmy, 6 * dpr, 0, Math.PI * 2); c.fill();
            c.fillStyle = '#f6d77a'; c.font = `800 ${8 * dpr}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', nmx, nmy + 0.5 * dpr);
        }

        // ══ 🐠 바다 생물 도감 (10/5) — 열두 종, 로우폴리로 그린다. 숨는 아이는 다가가면 나오고 헤엄치는 아이는 돌아다닌다 (game.js NJ_SEA_DEX) ══
        const dexBtn = ov.querySelector('.nj3d-dexbtn');
        const dexMat = (hex, o) => new THREE.MeshStandardMaterial(Object.assign({ color: new THREE.Color(hex).convertSRGBToLinear(), roughness: 0.6, flatShading: true }, o || {}));
        const dexDir = () => { const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u); return new THREE.Vector3(r * Math.cos(a), u, r * Math.sin(a)); };   // 고른 방향(r128엔 randomDirection이 없다)
        const DAYC = (typeof NJ_DEX_COLORS !== 'undefined' && typeof _njDexColorIdx === 'function') ? NJ_DEX_COLORS[_njDexColorIdx()].hex : null;
        const dexTint = hex => DAYC == null ? hex : new THREE.Color(hex).lerp(new THREE.Color(DAYC), 0.7).getHex();   // 고유 색에 그날(요일) 빛깔이 물든다
        const dexMesh = (geo, m, x, y, z, sx, sy, sz) => { const me = new THREE.Mesh(geo, m); me.position.set(x || 0, y || 0, z || 0); if (sx) me.scale.set(sx, sy || sx, sz || sx); return me; };
        const CREATURE = {
            octopus() { const g = new THREE.Group(), m = dexMat(dexTint(0xc9564b)), arms = [];
                g.add(dexMesh(new THREE.SphereGeometry(0.07, 10, 8), m, 0, 0.1, 0, 1, 1.2, 1));
                [-1, 1].forEach(s => g.add(dexMesh(new THREE.SphereGeometry(0.014, 6, 5), dexMat(0xf6f2e0), s * 0.03, 0.1, 0.06)));
                for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, arm = new THREE.Group(); arm.position.set(Math.cos(a) * 0.04, 0.05, Math.sin(a) * 0.04); arm.rotation.y = -a;
                    const tg = new THREE.CylinderGeometry(0.004, 0.014, 0.12, 5); tg.translate(0, -0.06, 0); const t1 = new THREE.Mesh(tg, m); t1.rotation.z = -1.1; arm.add(t1); g.add(arm); arms.push(arm); }
                return { g, anim: (t) => arms.forEach((a, i) => { a.rotation.z = Math.sin(t * 2 + i) * 0.25; }) }; },
            seahorse() { const g = new THREE.Group(), m = dexMat(dexTint(0xe8a33a)), pts = [];
                for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push(new THREE.Vector3(Math.sin(u * 3.2) * 0.03 * (1 - u) + (u > 0.85 ? (u - 0.85) * 0.3 : 0), 0.22 - u * 0.2, u > 0.7 ? -Math.sin((u - 0.7) * 10) * 0.03 : 0)); }
                g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.014, 6), m));
                const head = dexMesh(new THREE.SphereGeometry(0.022, 8, 6), m, 0, 0.23, 0.01); g.add(head);
                const sn = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, 0.04, 5), m); sn.rotation.x = Math.PI / 2; sn.position.set(0, 0.225, 0.04); g.add(sn);
                return { g, anim: (t) => { g.position.y = g.userData.y0 + Math.sin(t * 1.5) * 0.02; } }; },
            turtle() { const g = new THREE.Group(), sh = dexMat(dexTint(0x4f7a3a)), sk = dexMat(0x9cb07a), fl = [];
                g.add(dexMesh(new THREE.SphereGeometry(0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), sh, 0, 0, 0, 1, 0.45, 1.25));
                g.add(dexMesh(new THREE.SphereGeometry(0.11, 10, 4), sk, 0, 0, 0, 1, 0.12, 1.2));
                g.add(dexMesh(new THREE.SphereGeometry(0.04, 8, 6), sk, 0, 0.02, 0.17, 1, 0.8, 1.2));
                [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sz]) => { const f = new THREE.Group(); f.position.set(sx * 0.1, 0, sz * 0.08); const fm = dexMesh(new THREE.SphereGeometry(0.05, 6, 4), sk, sx * 0.04, 0, 0, 1.2, 0.18, 0.55); f.add(fm); g.add(f); fl.push([f, sx]); });
                return { g, swim: 0.35, anim: (t) => fl.forEach(([f, sx], i) => { f.rotation.z = sx * Math.sin(t * 3 + i) * 0.4; }) }; },
            ray() { const g = new THREE.Group(), m = dexMat(dexTint(0x6f7c8c)), sh = new THREE.Shape();
                sh.moveTo(0, 0.16); sh.quadraticCurveTo(0.18, 0.02, 0.2, -0.02); sh.quadraticCurveTo(0.08, -0.06, 0, -0.1); sh.quadraticCurveTo(-0.08, -0.06, -0.2, -0.02); sh.quadraticCurveTo(-0.18, 0.02, 0, 0.16);
                const body = new THREE.Mesh(new THREE.ShapeGeometry(sh, 6), dexMat(dexTint(0x6f7c8c), { side: THREE.DoubleSide })); body.rotation.x = -Math.PI / 2; g.add(body);
                const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.008, 0.25, 4), m); tail.rotation.x = Math.PI / 2; tail.position.z = 0.22; g.add(tail);
                return { g, swim: 0.45, anim: (t) => { body.scale.y = 1; body.rotation.z = 0; body.position.y = Math.sin(t * 3) * 0.01; body.scale.x = 1 - Math.abs(Math.sin(t * 3)) * 0.15; } }; },
            starfish() { const sh = new THREE.Shape(); for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.035 : 0.09; if (i) sh.lineTo(Math.cos(a) * r, Math.sin(a) * r); else sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
                const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1 });
                const g = new THREE.Group(), me = new THREE.Mesh(geo, dexMat(dexTint(0xe8743b))); me.rotation.x = -Math.PI / 2; me.position.y = 0.01; g.add(me);
                return { g, anim: (t) => { me.rotation.z = Math.sin(t * 0.4) * 0.15; } }; },
            crab() { const g = new THREE.Group(), shell = dexMat(dexTint(0xd8c3a0)), leg = dexMat(0xd9603b), legs = [];
                const sh = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 8), shell); sh.rotation.z = -1.2; sh.position.set(-0.02, 0.05, 0); g.add(sh);
                g.add(dexMesh(new THREE.SphereGeometry(0.03, 8, 6), leg, 0.05, 0.03, 0));
                for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.05, 4), leg); l.position.set(0.04 + (i % 3) * 0.012, 0.015, (i < 3 ? 1 : -1) * 0.03); l.rotation.x = (i < 3 ? 1 : -1) * 0.9; g.add(l); legs.push(l); }
                [-1, 1].forEach(s => g.add(dexMesh(new THREE.SphereGeometry(0.008, 5, 4), dexMat(0x222222), 0.075, 0.06, s * 0.012)));
                return { g, anim: (t) => { legs.forEach((l, i) => { l.rotation.z = Math.sin(t * 9 + i) * 0.3; }); g.position.x = g.userData.x0 + Math.sin(t * 0.7) * 0.15; } }; },
            jelly() { const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: new THREE.Color(dexTint(0xf0b8ff)).convertSRGBToLinear(), transparent: true, opacity: 0.55, emissive: 0x7a3c9c, emissiveIntensity: 0.4, roughness: 0.2, side: THREE.DoubleSide, depthWrite: false }), ts = [];
                g.add(dexMesh(new THREE.SphereGeometry(0.08, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), m));
                for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28, tl = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.002, 0.18, 3), m); tl.position.set(Math.cos(a) * 0.05, -0.09, Math.sin(a) * 0.05); g.add(tl); ts.push(tl); }
                return { g, float: true, anim: (t) => { g.position.y = g.userData.y0 + Math.sin(t * 1.2) * 0.12; g.scale.set(1 + Math.sin(t * 3) * 0.08, 1 - Math.sin(t * 3) * 0.08, 1 + Math.sin(t * 3) * 0.08); ts.forEach((x, i) => { x.rotation.z = Math.sin(t * 2 + i) * 0.2; }); } }; },
            puffer() { const g = new THREE.Group(), m = dexMat(dexTint(0xe6d36a)), body = dexMesh(new THREE.SphereGeometry(0.05, 10, 8), m); g.add(body);
                for (let i = 0; i < 18; i++) { const v = dexDir(), sp = new THREE.Mesh(new THREE.ConeGeometry(0.006, 0.025, 4), m); sp.position.copy(v).multiplyScalar(0.05); sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v); body.add(sp); }
                [-1, 1].forEach(s => body.add(dexMesh(new THREE.SphereGeometry(0.009, 5, 4), dexMat(0x111111), s * 0.025, 0.015, 0.042)));
                return { g, part: body, float: true, anim: (t, near) => { const k = near ? 1.6 : 1; body.scale.setScalar(body.scale.x + (k - body.scale.x) * 0.1); g.position.y = g.userData.y0 + 0.15 + Math.sin(t * 2) * 0.03; } }; },   // 다가가면 부푼다
            eel() { const g = new THREE.Group(), m = dexMat(dexTint(0x5d6b2e)), pts = [];
                for (let i = 0; i <= 8; i++) pts.push(new THREE.Vector3(0, i * 0.035, Math.sin(i * 0.8) * 0.02));
                const body = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.022, 6), m); g.add(body);
                g.add(dexMesh(new THREE.SphereGeometry(0.028, 8, 6), m, 0, 0.29, 0.01, 1, 0.9, 1.3));
                g.add(dexMesh(new THREE.BoxGeometry(0.07, 0.07, 0.07), dexMat(0x5b5148), 0, 0.02, 0));   // 굴 입구 바위
                return { g, anim: (t) => { body.rotation.x = Math.sin(t * 1.4) * 0.15; } }; },
            clown() { const g = new THREE.Group(), anem = dexMat(0xe37fb0), fm = dexMat(dexTint(0xf07a24)), wm = dexMat(0xffffff), fish = new THREE.Group();
                for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28, r = 0.03 + (i % 3) * 0.015, c = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.1, 4), anem); c.position.set(Math.cos(a) * r, 0.05, Math.sin(a) * r); c.rotation.set(Math.sin(a) * 0.3, 0, Math.cos(a) * 0.3); g.add(c); }
                fish.add(dexMesh(new THREE.SphereGeometry(0.03, 8, 6), fm, 0, 0, 0, 1.4, 1, 0.6));
                [-0.015, 0.02].forEach(x => fish.add(dexMesh(new THREE.TorusGeometry(0.024, 0.005, 4, 10), wm, x, 0, 0, 1, 1.2, 1).rotateY(Math.PI / 2)));
                const tail = dexMesh(new THREE.ConeGeometry(0.018, 0.03, 4), fm, -0.05, 0, 0); tail.rotation.z = Math.PI / 2; fish.add(tail);
                g.add(fish);
                return { g, part: fish, anim: (t) => { const a = t * 1.3; fish.position.set(Math.cos(a) * 0.11, 0.1 + Math.sin(t * 2) * 0.02, Math.sin(a) * 0.11); fish.rotation.y = -a - Math.PI / 2; tail.rotation.y = Math.sin(t * 12) * 0.5; } }; },
            urchin() { const g = new THREE.Group(), m = dexMat(dexTint(0x3a2448)), body = dexMesh(new THREE.SphereGeometry(0.04, 8, 6), m, 0, 0.035, 0); g.add(body);
                for (let i = 0; i < 26; i++) { const v = dexDir(); if (v.y < -0.3) continue; const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.001, 0.004, 0.08, 3), m); sp.position.copy(v).multiplyScalar(0.06); sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v); body.add(sp); }
                return { g, anim: (t) => { body.rotation.y = t * 0.1; } }; },
            dolphin() { const g = new THREE.Group(), m = dexMat(dexTint(0x7d97ad), { flatShading: false, roughness: 0.35 });
                g.add(dexMesh(new THREE.SphereGeometry(0.1, 12, 8), m, 0, 0, 0, 0.8, 0.8, 2.6));
                const sn = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.1, 6), m); sn.rotation.x = Math.PI / 2; sn.position.z = 0.3; g.add(sn);
                const fin = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.09, 4), m); fin.position.set(0, 0.1, -0.02); fin.rotation.x = -0.4; g.add(fin);
                const tail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.06), m); tail.position.z = -0.28; g.add(tail);
                return { g, swim: 0.9, anim: (t) => { tail.rotation.x = Math.sin(t * 6) * 0.4; g.rotation.x = Math.sin(t * 1.5) * 0.12; } }; },
        };
        // 🎩👓🎀👑 꾸밈 — 머리 위(모자·리본·면류관) 또는 얼굴 앞(안경). [위, 앞, 크기, 앞이 +x인 아이는 돌림]
        const ACC_AT = { octopus: [[0, 0.185, 0], [0, 0.11, 0.07], 1], seahorse: [[0, 0.25, 0.01], [0, 0.232, 0.03], 0.7], turtle: [[0, 0.065, 0.17], [0, 0.035, 0.215], 1.3],
            ray: [[0, 0.02, 0.04], [0, 0.014, 0.11], 1.1], starfish: [[0, 0.045, 0], [0, 0.045, 0.035], 1], crab: [[0.05, 0.065, 0], [0.085, 0.06, 0], 0.8, Math.PI / 2],
            jelly: [[0, 0.085, 0], [0, 0.04, 0.078], 1.1], puffer: [[0, 0.055, 0], [0, 0.016, 0.05], 1], eel: [[0, 0.32, 0.01], [0, 0.295, 0.04], 0.9],
            clown: [[0.01, 0.03, 0], [0.045, 0.006, 0], 0.7, Math.PI / 2], urchin: [[0, 0.11, 0], [0, 0.05, 0.065], 1], dolphin: [[0, 0.085, 0.18], [0, 0.045, 0.29], 1.5] };
        const accMat = { dark: dexMat(0x2b2b38), red: dexMat(0xc0392b), pink: dexMat(0xf48fb1), gold: new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.8, roughness: 0.25, emissive: 0x5a3c00, emissiveIntensity: 0.4 }) };
        accMat.goldIn = accMat.gold.clone(); accMat.goldIn.side = THREE.DoubleSide;   // 금테 안쪽 면도
        function makeAcc(kind) {
            const g = new THREE.Group();
            if (kind === 'hat') { g.add(dexMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.006, 14), accMat.dark)); g.add(dexMesh(new THREE.CylinderGeometry(0.024, 0.026, 0.036, 14), accMat.dark, 0, 0.02, 0)); g.add(dexMesh(new THREE.CylinderGeometry(0.0265, 0.0265, 0.008, 14), accMat.red, 0, 0.008, 0)); }
            else if (kind === 'glasses') { [-1, 1].forEach(sx => g.add(dexMesh(new THREE.TorusGeometry(0.014, 0.003, 5, 14), accMat.dark, sx * 0.018, 0, 0))); g.add(dexMesh(new THREE.BoxGeometry(0.01, 0.003, 0.003), accMat.dark)); }
            else if (kind === 'ribbon') { [-1, 1].forEach(sx => { const c = dexMesh(new THREE.ConeGeometry(0.014, 0.03, 6), accMat.pink, sx * 0.016, 0.01, 0); c.rotation.z = sx * Math.PI / 2; g.add(c); }); g.add(dexMesh(new THREE.SphereGeometry(0.008, 8, 6), accMat.pink, 0, 0.01, 0)); }
            else if (kind === 'crown') { g.add(dexMesh(new THREE.CylinderGeometry(0.026, 0.024, 0.016, 12, 1, true), accMat.goldIn, 0, 0.008, 0)); g.add(dexMesh(new THREE.SphereGeometry(0.023, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), accMat.red, 0, 0.002, 0, 1, 0.75, 1)); g.add(dexMesh(new THREE.SphereGeometry(0.005, 6, 5), accMat.gold, 0, 0.022, 0)); /* 속이 비어 보였다(10/5) — 붉은 벨벳과 꼭대기 구슬 */ for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.add(dexMesh(new THREE.ConeGeometry(0.005, 0.014, 4), accMat.gold, Math.cos(a) * 0.025, 0.022, Math.sin(a) * 0.025)); } }
            return g;
        }
        // ══ 🐠 바다 생물 블렌더 모델 (10/5 — tools/blender/sea.py → models/sea/*.glb) ══
        //    처음엔 위 CREATURE(공·원기둥)로 그렸다 — 문어 다리가 짧고 소라게 소라가 거꾸로, 곰치 머리가 몸에서 떨어지고 돌고래 꼬리가 상자였다(사용자). 이제 모델을 쓰고 CREATURE는 못 받을 때만.
        //    물들일 곳 = 재질 이름 'tint'(그날 빛깔을 곱한다 — 모델은 옅은 바탕색) · 눈·흰 배는 그대로 · 꾸밈은 SEA_ACC(눈 가운데 앞 / 머리 위, 게임 좌표 = 블렌더 (x, z, −y))
        const SEA_V = '20261005';
        const SEA_ACC = {   // top·face = 모자·안경 자리, hs·gs = 크기(안경은 눈 사이 반 너비 ÷ 0.018), node = 이 부분에 단다
            octopus: { top: [0, 0.217, -0.012], face: [0, 0.083, 0.056], hs: 1.2, gs: 1.67 }, seahorse: { top: [0, 0.256, 0.004], face: [0, 0.243, 0.034], hs: 0.55, gsep: 0.016, gr: 0.0068 },
            turtle: { top: [0, 0.084, 0.205], face: [0, 0.07, 0.252], hs: 0.8, gsep: 0.024, gr: 0.0105 }, ray: { top: [0, 0.042, 0.06], face: [0, 0.046, 0.075], hs: 0.8, gsep: 0.03, gr: 0.011, grx: -Math.PI / 2 },
            starfish: { top: [0, 0.036, 0], face: [0, 0.042, 0], hs: 0.8, gsep: 0.022, gr: 0.012, grx: -Math.PI / 2 }, crab: { top: [0, 0.12, -0.04], face: [0, 0.078, 0.074], hs: 0.9, gs: 0.85 },
            jelly: { top: [0, 0.14, 0], face: [0, 0.1, 0.082], hs: 1.2, gs: 1.6 }, puffer: { top: [0, 0.132, 0], face: [0, 0.088, 0.058], hs: 1.1, gs: 1.78 },
            eel: { node: 'eel', top: [0, 0.198, 0.03], face: [0, 0.188, 0.056], hs: 0.6, gs: 0.68 }, clown: { node: 'fish', top: [0, 0.027, 0.012], face: [0, 0.007, 0.036], hs: 0.45, gs: 0.6 },
            urchin: { top: [0, 0.11, 0], face: [0, 0.05, 0.052], hs: 0.9, gs: 1.3 }, dolphin: { top: [0, 0.162, 0.16], face: [0, 0.108, 0.158], hs: 1.0, gsep: 0.05, gr: 0.015 },   // 눈이 옆에 있다 — 렌즈를 눈 바깥에, 다리는 머리 속에 묻힌다(처음엔 코뚜레처럼 부리를 뚫었다)
        };
        const SEA_MOVE = { turtle: { swim: 0.35 }, ray: { swim: 0.45 }, dolphin: { swim: 0.9 }, jelly: { float: 1 }, puffer: { float: 1 } };
        const SEA_ANIM = {   // 이름 붙은 부분을 움직인다 (t 초, near = 순례자가 곁에)
            octopus: (g, N) => { const a = [0, 1, 2, 3, 4, 5, 6, 7].map(i => N('a' + i)); return t => a.forEach((x, i) => { if (x) { x.rotation.y = Math.sin(t * 1.6 + i * 0.9) * 0.16; x.rotation.x = Math.sin(t * 1.1 + i) * 0.05; } }); },
            seahorse: (g, N) => { const f = N('fin'); return t => { if (f) f.rotation.y = Math.sin(t * 16) * 0.5; g.position.y = Math.sin(t * 1.5) * 0.015; }; },
            turtle: (g, N) => { const f = [0, 1, 2, 3].map(i => N('fl' + i)); return t => { const s = Math.sin(t * 2.4); if (f[0]) f[0].rotation.z = s * 0.45; if (f[1]) f[1].rotation.z = -s * 0.45; if (f[2]) f[2].rotation.z = s * 0.2; if (f[3]) f[3].rotation.z = -s * 0.2; }; },
            ray: (g, N) => { const l = N('wL'), r = N('wR'); return t => { const s = Math.sin(t * 2.6) * 0.32; if (l) l.rotation.z = -s; if (r) r.rotation.z = s; g.position.y = Math.sin(t * 2.6 + 1) * 0.01; }; },
            starfish: g => t => { g.rotation.y = Math.sin(t * 0.3) * 0.1; },
            crab: (g, N) => { const l = N('legs'), c = N('claw'); return t => { if (l) l.position.y = Math.abs(Math.sin(t * 9)) * 0.003; if (c) c.rotation.x = Math.sin(t * 1.4) * 0.12; g.position.x = Math.sin(t * 0.7) * 0.12; }; },
            jelly: (g, N) => { const a = [0, 1, 2, 3].map(i => N('t' + i)); return t => { const p = Math.sin(t * 2.2); g.scale.set(1 + p * 0.06, 1 - p * 0.06, 1 + p * 0.06); g.position.y = Math.sin(t * 1.1) * 0.08; a.forEach((x, i) => { if (x) { x.rotation.x = Math.sin(t * 1.7 + i) * 0.18; x.rotation.z = Math.cos(t * 1.3 + i) * 0.18; } }); }; },
            puffer: (g, N) => { const l = N('pL'), r = N('pR'), tl = N('tail'); return (t, near) => { if (l) l.rotation.y = Math.sin(t * 9) * 0.5; if (r) r.rotation.y = -Math.sin(t * 9) * 0.5; if (tl) tl.rotation.y = Math.sin(t * 5) * 0.35; const k = near ? 1.4 : 1; g.scale.setScalar(g.scale.x + (k - g.scale.x) * 0.08); g.position.y = 0.1 + Math.sin(t * 2) * 0.02; }; },   // 다가가면 부푼다
            eel: (g, N) => { const e = N('eel'); return t => { if (e) { e.rotation.z = Math.sin(t * 1.2) * 0.12; e.rotation.x = Math.sin(t * 0.9) * 0.08; } }; },
            clown: (g, N) => { const f = N('fish'); return t => { if (!f) return; const a = t * 1.1; f.position.set(Math.cos(a) * 0.11, 0.11 + Math.sin(t * 2) * 0.01, Math.sin(a) * 0.11); f.rotation.y = -a; }; },
            urchin: g => t => { g.rotation.y = t * 0.05; },
            dolphin: (g, N) => { const tl = N('tail'); return t => { if (tl) tl.rotation.x = Math.sin(t * 5) * 0.3; g.rotation.x = Math.sin(t * 1.5) * 0.08; }; },
        };
        const seaCache = {};
        function seaLoad(k) {
            if (!seaCache[k]) seaCache[k] = (async () => {
                if (!THREE.GLTFLoader && typeof loadScript === 'function' && typeof GLTF_URL !== 'undefined') await loadScript(GLTF_URL);
                const gl = await new Promise((res, rej) => new THREE.GLTFLoader().load(`${typeof SEA_BASE !== 'undefined' ? SEA_BASE : ''}models/sea/${k}.glb?v=${SEA_V}`, res, undefined, rej));
                gl.scene.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
                return gl.scene;
            })();
            seaCache[k].catch(() => { delete seaCache[k]; });
            return seaCache[k];
        }
        function seaGlasses(sep, r) {   // 안경 — 렌즈 간격(sep)과 크기(r)를 따로(한 배율로 키우면 렌즈가 커져 머리를 파고들었다)
            const g = new THREE.Group(), tb = Math.max(0.0018, r * 0.22);
            [-1, 1].forEach(sx => { const t = new THREE.Mesh(new THREE.TorusGeometry(r, tb, 6, 18), accMat.dark); t.position.x = sx * sep; g.add(t); });
            const bw = Math.max(0.004, 2 * (sep - r)); const br = new THREE.Mesh(new THREE.BoxGeometry(bw, tb * 1.4, tb * 1.4), accMat.dark); g.add(br);
            return g;
        }
        /* 모델 하나를 그날 빛깔·꾸밈으로 — 반환 { g, anim } */
        function seaMake(tpl, k, hex, tier) {
            const g = tpl.clone(true), tc = new THREE.Color(hex).convertSRGBToLinear(), done = new Map();
            g.traverse(o => {
                if (!o.isMesh) return;
                const one = m => { if (!m || m.name !== 'tint') return m; if (!done.has(m)) { const c = m.clone(); c.color.copy(tc); if (k === 'jelly') { c.transparent = true; c.opacity = 0.62; c.depthWrite = false; c.side = THREE.DoubleSide; } done.set(m, c); } return done.get(m); };
                o.material = Array.isArray(o.material) ? o.material.map(one) : one(o.material);
            });
            const A = SEA_ACC[k], N = n => g.getObjectByName(n);
            if (tier && A) {
                const host = (A.node && N(A.node)) || g, gl = tier === 'glasses', am = gl ? seaGlasses(A.gsep || 0.018 * A.gs, A.gr || 0.014 * A.gs) : makeAcc(tier), at = gl ? A.face : A.top;
                am.position.set(at[0], at[1], at[2]); if (!gl) am.scale.setScalar(A.hs); if (gl && A.grx) am.rotation.x = A.grx; host.add(am);
            }
            return { g, anim: SEA_ANIM[k] ? SEA_ANIM[k](g, N) : () => { } };
        }
        // 오늘 바다에 사는 아이들 — 풀린 절(처음 백지로 써낸 절)의 생물 중 오늘 요일 빛깔 · 지금 그 종의 시간대 (game.js _njDexToday). 자리는 절과 날짜로
        const creatures = [];
        let dexQ = null, dexTapHinted = false;
        (typeof _njDexToday === 'function' ? _njDexToday() : []).forEach(E => {
            let sd = 17; for (const ch of String(_get6AMDayStr()) + E.id) sd = (sd * 31 + ch.charCodeAt(0)) % 2147483647; sd = sd || 1;
            const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
            const d = E.d; if (!CREATURE[d.k]) return;
            const a = r() * Math.PI * 2, q = Math.sqrt(0.06 + r() * 0.78), x = Math.cos(a) * q * SRX, z = SZ + Math.sin(a) * q * SRZ;
            const mv = SEA_MOVE[d.k] || {}, c = { g: new THREE.Group(), anim: () => { }, swim: mv.swim || 0, float: !!mv.float }, y = seabed(x, z), swim = c.swim;
            c.g.userData.x0 = x; c.g.userData.y0 = swim ? y + 0.8 + r() * 1.2 : c.float ? y + 0.4 : y;
            c.g.position.set(x, c.g.userData.y0, z); c.g.rotation.y = r() * 6.28;
            const acc = (typeof NJ_DEX_TIERS !== 'undefined' && NJ_DEX_TIERS[E.t]) ? NJ_DEX_TIERS[E.t].k : '', AT = ACC_AT[d.k];   // 꾸밈은 절이 정한다(장이 뒤로 갈수록 모자 → 안경 → 리본 → 면류관)
            seaLoad(d.k).then(tpl => { if (cur !== C) return; const m = seaMake(tpl, d.k, DAYC == null ? 0xffffff : DAYC, acc); c.g.add(m.g); c.anim = m.anim; })
                .catch(() => {   // 모델을 못 받으면 예전 도형으로
                    if (cur !== C) return; const f = CREATURE[d.k](); f.g.userData.x0 = 0; f.g.userData.y0 = 0;
                    if (acc && AT) { const am = makeAcc(acc), at = acc === 'glasses' ? AT[1] : AT[0]; am.position.set(at[0], at[1], at[2]); am.scale.setScalar(AT[2]); if (acc === 'glasses' && AT[3]) am.rotation.y = AT[3]; (f.part || f.g).add(am); }
                    c.g.add(f.g); c.anim = f.anim;
                });
            const tapG = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xfff2c4, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));   // 가까이 오면 반짝 — 눌러 보라고
            tapG.visible = false; tapG.scale.setScalar(0.22); c.g.add(tapG); c.tapG = tapG;
            const hide = !swim && !c.float;   // 숨는 아이 — 웅크려 있다가 다가가면 나온다
            if (hide) c.g.scale.setScalar(0.25);
            reefG.add(c.g);
            creatures.push(Object.assign(c, { E, d, x, z, hide, cx: x, cz: z, ang: r() * 6.28, rad: 1.5 + r() * 2 }));
        });
        const dexWho = c => (typeof _njDexFullName === 'function' ? _njDexFullName(c.E) : c.d.ko);
        const dexRef = c => (typeof _njDexRef === 'function' ? _njDexRef(c.E.id) : c.E.id);
        function closeDexQ() { if (dexQ) { dexQ = null; fishQ.hidden = true; fishQ.innerHTML = ''; } }
        function askDex(c, retry) {   // 그 생물의 말씀 — 빈칸 4지
            const q = typeof _njFishQuestion === 'function' ? _njFishQuestion([c.E.id]) : null;
            if (!q) { dexDone(c, typeof _njDexAnswer === 'function' ? _njDexAnswer(c.E.id, true) : null); return; }   // 아주 짧은 절이라 문제를 못 만들면 그냥 만난 것으로
            dexQ = { c, q };
            const esc = x => String(x).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
            fishQ.classList.remove('watch', 'now', 'reel');
            fishQ.innerHTML = `<div class="nj3d-fishq-head">${esc(T(retry ? 'nj3d_dex_retry' : 'nj3d_dex_q', { e: c.d.e, name: dexWho(c) }))}</div>
                <div class="nj3d-fishq-ref">${esc(q.ref)}</div>
                <div class="nj3d-fishq-text">${esc(q.before)} <span class="nj3d-fishq-blank">＿＿＿</span> ${esc(q.after)}</div>
                <div class="nj3d-fishq-choices">${q.choices.map((ch, i) => `<button data-i="${i}">${esc(ch)}</button>`).join('')}</div>`;
            fishQ.hidden = false;
            fishQ.querySelectorAll('button[data-i]').forEach(bt => bt.onclick = () => {
                const ok = q.choices[+bt.dataset.i] === q.answer; closeDexQ();
                const res = typeof _njDexAnswer === 'function' ? _njDexAnswer(c.E.id, ok) : null;
                if (ok) { dexDone(c, res); return; }
                if (res && res.hidden) { c.met = true; c.tapG.visible = false; showHint(T('nj3d_dex_miss', { e: c.d.e }), 3200); if (c.hide) c.g.scale.setScalar(0.25); }
                else askDex(c, true);
            });
        }
        function dexDone(c, res) {
            c.met = true; c.tapG.visible = false;
            if (!res || !res.gem) return;
            const tot = typeof _njDexVerseList === 'function' ? _njDexVerseList().length : 404;
            let msg = res.all ? T('nj3d_dex_all', { gem: res.gem.toLocaleString() }) : T('nj3d_dex_found', { e: c.d.e, name: dexWho(c), ref: dexRef(c), gem: (typeof NJ_DEX_GEM !== 'undefined' ? NJ_DEX_GEM : 200).toLocaleString(), n: res.n, m: tot });
            if (res.bonus && res.bonus.length) msg += ' · ' + res.bonus.map(b => T('nj3d_dex_bonus', { group: b.name, gem: b.gem.toLocaleString() })).join(' · ');
            showHint(msg, 5000); syncWallet(); syncDexBtn();
            if (typeof SoundEffect !== 'undefined' && SoundEffect.playBlankLevelUp) { SoundEffect.playBlankLevelUp(); if (res.bonus && res.bonus.length) setTimeout(() => SoundEffect.playBlankLevelUp(), 420); }
            sprayBurst(c.x, c.g.position.y + 0.08, c.z, 12, 0);
        }
        function creatureTap(e) {   // 👆 눌러서 만남 — 물속에서 2.4 안, 화면에서 70px 안의 가장 가까운 아이
            if (!walk || !isUnder() || !tap || dexQ) return false;
            if (Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > 10 || performance.now() - tap.t > 450) return false;
            const rr = cvs.getBoundingClientRect(), pv = new THREE.Vector3(); let best = null, bd = 70;
            creatures.forEach(c => {
                if (!c.g.visible || Math.hypot(c.x - P.x, c.z - P.z) > 2.4 || (c.hide && c.g.scale.x < 0.8)) return;
                c.g.getWorldPosition(pv); pv.y += 0.06; pv.project(camera); if (pv.z > 1 || pv.z < -1) return;
                const sx = rr.left + (pv.x + 1) / 2 * rr.width, sy = rr.top + (1 - pv.y) / 2 * rr.height, dd = Math.hypot(sx - e.clientX, sy - e.clientY);
                if (dd < bd) { bd = dd; best = c; }
            });
            if (!best) return false;
            const id = best.E.id;
            if (typeof _njDexMetThisWeek === 'function' && _njDexMetThisWeek(id)) { showHint(T('nj3d_dex_again', { e: best.d.e, name: dexWho(best), ref: dexRef(best) }), 3000); return true; }
            if (typeof _njDexHidden === 'function' && _njDexHidden(id)) { showHint(T('nj3d_dex_miss', { e: best.d.e }), 3000); return true; }
            askDex(best, false);
            return true;
        }
        function dexTick(dt) {
            const tt = performance.now() / 1000, under = isUnder();
            creatures.forEach(c => {
                const d = Math.hypot(c.x - P.x, c.z - P.z);
                c.g.visible = d < 12;   // 하루 최대 45마리 — 먼 아이는 그리지 않는다
                if (!c.g.visible) return;
                if (c.swim) {   // 둥글게 헤엄친다
                    c.ang += dt * c.swim / c.rad; const nx = c.cx + Math.cos(c.ang) * c.rad, nz = c.cz + Math.sin(c.ang) * c.rad;
                    if (seaE(nx, nz) < 0.92) { c.x = nx; c.z = nz; } c.g.position.x = c.x; c.g.position.z = c.z; c.g.rotation.y = -c.ang;
                    c.g.position.y = Math.max(seabed(c.x, c.z) + 0.15, Math.min(c.g.userData.y0, SEA_Y - 0.35));   // 얕은 데로 와도 물 위로 튀어나오지 않게
                }
                const near = under && d < 2.2;
                if (c.hide && !(c.met && typeof _njDexHidden === 'function' && _njDexHidden(c.E.id))) { const want = near ? 1 : 0.25; c.g.scale.setScalar(c.g.scale.x + (want - c.g.scale.x) * Math.min(1, dt * 3)); }
                c.anim(tt, near);
                const fresh = !(typeof _njDexMetThisWeek === 'function' && _njDexMetThisWeek(c.E.id)) && !(typeof _njDexHidden === 'function' && _njDexHidden(c.E.id));
                const can = fresh && near && (!c.hide || c.g.scale.x > 0.8);   // 이번 주에 아직 안 만난 아이 — 위에 반짝임
                c.tapG.visible = can; if (can) { c.tapG.position.y = 0.2 + Math.sin(tt * 3) * 0.02; c.tapG.material.opacity = 0.6 + Math.sin(tt * 5) * 0.3; if (!dexTapHinted) { dexTapHinted = true; showHint(T('nj3d_dex_tap'), 4500); } }
            });
            if (dexQ && Math.hypot(dexQ.c.x - P.x, dexQ.c.z - P.z) > 2.8) closeDexQ();   // 멀어지면 문제를 닫는다
        }
        function syncDexBtn() { dexBtn.textContent = T('nj3d_dex_btn', { n: typeof _njDexCount === 'function' ? _njDexCount() : 0, m: typeof _njDexVerseList === 'function' ? _njDexVerseList().length : 404 }); }
        syncDexBtn();
        function openDex() {
            offerEl.innerHTML = `<button class="nj3d-fruit-x" aria-label="close">✕</button>
                <div class="nj3d-offer-head">${T('nj3d_dex_title')}</div>
                <div class="nj3d-offer-intro">${T('nj3d_dex_intro')}</div>
                <div class="nj3d-offer-list">${typeof _njDexHtml === 'function' ? _njDexHtml() : ''}</div>`;
            offerEl.hidden = false; offerEl.dataset.pearl = ''; offerEl.dataset.keep = '1';
            offerEl.querySelector('.nj3d-fruit-x').onclick = () => { offerEl.hidden = true; offerEl.dataset.keep = ''; };
            offerEl.querySelectorAll('.nj3d-dex-cell[data-tip]').forEach(cl => cl.onclick = () => { const line = cl.closest('.nj3d-dex-card').querySelector('.nj3d-dex-tipline'); if (line) line.textContent = cl.dataset.tip; });   // 칸을 누르면 그 절·요일·시간
        }
        dexBtn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (!offerEl.hidden && offerEl.dataset.keep === '1') { offerEl.hidden = true; offerEl.dataset.keep = ''; } else openDex(); });

        // ── 화질 ──
        function setQuality(h, byUser) {
            HIGH = h;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, h ? 2 : 1.5));
            renderer.shadowMap.enabled = h; sun.shadow.needsUpdate = true; scene.environment = h ? envTex : null;
            duals.forEach(d => { d.obj.material = h ? d.high : d.basic; });
            extras.visible = h; rebuild();
            scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); });
            ov.querySelectorAll('.nj3d-q button').forEach(b => b.setAttribute('aria-pressed', (b.dataset.q === 'high') === h ? 'true' : 'false'));
            if (byUser) { userPicked = true; try { localStorage.setItem('kingsRoad_nj3dQ', h ? 'high' : 'basic'); } catch (e) { } }
            resize();
        }
        cleanups.push(() => duals.forEach(d => { d.basic.dispose(); d.high.dispose(); }));
        ov.querySelector('.nj3d-q').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setQuality(b.dataset.q === 'high', true); });
        ov.querySelectorAll('.nj3d-q button').forEach(b => b.setAttribute('aria-pressed', (b.dataset.q === 'high') === HIGH ? 'true' : 'false'));

        // ── 그리기 ──
        function resize() {
            const w = stageEl.clientWidth, h = stageEl.clientHeight;
            if (!w || !h) return;
            renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
        }
        listen(window, 'resize', resize);
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) controls.autoRotate = false;
        controls.addEventListener('start', () => { touching = true; });
        controls.addEventListener('end', () => { touching = false; lastTouch = performance.now(); });
        let last = performance.now();
        const perf = { n: 0, sum: 0 };
        listen(document, 'visibilitychange', () => { if (!document.hidden && C.running) { last = performance.now(); requestAnimationFrame(loop); } });
        function loop(now) {
            if (!C.running || cur !== C || document.hidden) return;
            // 만지지 않은 지 3초가 지나면 초당 30번 — 쉬지 않고 60번 그리면 폰이 뜨거워져 스스로 느려졌다(시안 실측)
            if (!touching && now - lastTouch > 3000 && now - last < 30) { requestAnimationFrame(loop); return; }
            const dt = Math.min(0.05, (now - last) / 1000); last = now;
            if (!reduce) { rivers.forEach(tx => { tx.offset.y += dt * 0.25; }); seaTex.offset.x += dt * 0.012; seaTex.offset.y += dt * 0.02; }   // 강은 보좌에서 바깥으로 · 바다 물결은 천천히
            if (HIGH && !reduce) {
                for (let n = 0; n < MOTES; n++) { const i = n * 3 + 1; motePos[i] += dt * moteSpd[n]; if (motePos[i] > 10) motePos[i] = 0; }
                moteGeo.attributes.position.needsUpdate = true; shaft.rotation.y += dt * 0.05;
            }
            if (HIGH && !userPicked && perf.n < 140) {   // 고급으로 시작했는데 평균 22fps 미만이면 기본으로
                perf.n++; if (perf.n > 20) perf.sum += dt;
                if (perf.n === 140 && perf.sum / 120 > 0.045) { setQuality(false, false); showHint(T('nj3d_slow'), 3500); }
            }
            if (grassFollow) { if (walk) { const air = P.y - groundAt(P.x, P.z, P.y) > 1.2; grassFollow.mesh.visible = !air; if (!air) grassFollow(P.x, P.z); }   // 🪂 높이 날 땐 발밑 풀을 감추고 다시 깔지 않는다(활강은 빨라 초당 5~6번 깔았다)
                else { grassFollow.mesh.visible = true; if (deco) grassFollow(deco.tgt.x, deco.tgt.z); else grassFollow(controls.target.x, controls.target.z); } }
            if (walk) nearTick(now, P.x, P.z); else if (deco) nearTick(now, deco.tgt.x, deco.tgt.z); else nearTick(now, controls.target.x, controls.target.z);
            {   // 🌗 그림자 굽기 (10/4) — 해는 고정이고 그림자는 성 둘레(±16)에만 생긴다. 바다·바닷가·나라에 있을 땐 매 프레임 다시 굽는 게 헛일이었다
                //    → 성 둘레 밖이거나 물속이면 2초에 한 번만(늦게 불러온 건물·새로 놓은 꾸밈이 빠지지 않게)
                //    10/4: 성 둘레 안도 매 프레임 → 초당 8번. 빠른 것(순례자·탈것·행렬)은 굽는 그림자에서 빼고 발밑 그림자(blobTick)로
                const fx = walk ? P.x : deco ? deco.tgt.x : controls.target.x, fz = walk ? P.z : deco ? deco.tgt.z : controls.target.z;
                // 10/4 저녁: 초당 8번 굽기는 여덟 프레임에 한 번씩 무거운 프레임이 끼어 「움직일 때 끊어지며 간다」(사용자) —
                //    고르지 않은 프레임이 고르게 무거운 것보다 더 끊겨 보인다. → **움직이는 동안엔 굽지 않는다.**
                //    멈춰 있을 때 1.5초에 한 번 · 새 모양이 생기면(모델 도착·건축·세트 조립) 바로 · 꾸미는 중 매 프레임 · 물속은 안 굽는다
                const cp = camera.position, mv = Math.abs(cp.x - lastCam.x) + Math.abs(cp.y - lastCam.y) + Math.abs(cp.z - lastCam.z);
                lastCam.copy(cp); if (mv > 0.002) lastMove = now;
                const geos = renderer.info.memory.geometries;
                const idle = now - lastMove > 600;
                if (deco || (!underView && ((idle && now - shadowAt > 1500) || (geos !== shadowGeos && now - shadowAt > 1000)))) {
                    shadowAt = now; shadowGeos = geos; sun.shadow.needsUpdate = true;
                }
                if (now - watchAt > 300) { watchAt = now; watchTick(); }
            }
            if (walk) walkUpdate(dt);
            else if (deco) decoCam();
            else {
                controls.update();
                // 땅(바다는 수면) 위로 붙잡는다 — 산 속·바다 밑으로 꺼지지 않게
                const cx = camera.position.x, cz = camera.position.z, d0 = Math.max(Math.abs(cx), Math.abs(cz));
                const gy = Math.max(d0 <= PL ? 0.6 : WT(cx, cz), SEA_Y) + 0.8;
                if (camera.position.y < gy) { camera.position.y = gy; camera.lookAt(controls.target); }
            }
            { const tt = now / 1000; cityAnims.forEach(f => f(tt)); giftsG.children.forEach(g => { if (g.userData.anim) g.userData.anim(tt); }); decoG.children.forEach(g => { if (g.userData.anim) g.userData.anim(tt); }); setG.children.forEach(g => { if (g.userData.anim) g.userData.anim(tt); }); }   // 등불·별·맷돌·분수·양 떼…
            blobTick();   // 🌑 발밑 그늘 — 순례자·탈것·행렬·양 떼를 **움직인 뒤에** 맞춘다(10/4 밤: 앞에서 맞추면 한 프레임 전 자리라 프레임 간격 따라 발과 어긋나 끊기며 따라왔다)
            {   // 🤿 카메라가 물속이면 — 안개를 짙은 청록으로 가까이, 화면에 물빛 덮개, 하늘 지붕은 끈다
                const cu = camera.position.y < SEA_Y - 0.01 && seaE(camera.position.x, camera.position.z) < 1;
                reefG.visible = cu || camera.position.y < SEA_Y + 2.5;   // 바닷가에 서서 보는 높이까지는 그대로
                if (cu !== underView) {
                    underView = cu; underEl.hidden = !cu; skyDome.visible = !cu;
                    if (cu) clamHint();
                    if (cu) { scene.fog.color.copy(UNDER_C); scene.fog.near = 1.5; scene.fog.far = 26; scene.background = UNDER_C.clone(); }
                    else { scene.fog.color.copy(HAZE); scene.fog.near = 70; scene.fog.far = 240; scene.background = HAZE.clone(); }
                    camera.far = cu ? 30 : 420; camera.updateProjectionMatrix();   // 물속 — 안개(26) 너머는 아예 안 그린다
                }
                reefT.value = now / 1000; if (cu) fishTick(now / 1000);   // 해초 흔들림 · 물고기는 물속을 볼 때만
                bubbles.visible = walk && (!ride.on || kindOfMount(ride.k) === 'sub') && isUnder();
                if (bubbles.visible) {
                    const tt = now / 1000;
                    for (let i = 0; i < BUB; i++) { const u = (tt * 0.55 + i / BUB) % 1, bi = i * 3; bubPos[bi] = P.x + Math.sin(i * 2.3 + tt * 2) * 0.02; bubPos[bi + 1] = P.y + 0.2 + u * 0.6; bubPos[bi + 2] = P.z + Math.cos(i * 1.7 + tt * 2) * 0.02; }
                    bubG.attributes.position.needsUpdate = true;
                }
                diveBtn.hidden = !(walk && seaE(P.x, P.z) < 1 && (!ride.on || kindOfMount(ride.k) === 'sub'));
            }
            skyDome.position.copy(camera.position);
            glints.position.set(camera.position.x, camera.position.y - 6, camera.position.z);
            if (!reduce) {
                for (let n = 0; n < GLINTS; n++) { const i = n * 3 + 1; glintPos[i] += dt * glintSpd[n]; if (glintPos[i] > 34) glintPos[i] = -6; }
                glintGeo.attributes.position.needsUpdate = true;
            }
            renderer.render(scene, camera);
            requestAnimationFrame(loop);
        }
        rebuild(); resize(); loading.remove();
        C.running = true; requestAnimationFrame(loop);
    }
})();
