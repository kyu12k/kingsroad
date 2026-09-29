/* ══════════════════════════════════════════════════════════════════════════
   새 예루살렘 3D 보기 (2026-09-29, 1차) — 설계: docs/새-예루살렘.md
   건축 창의 「🏛️ 3D로 보기」가 이 파일을 처음 누를 때만 불러온다(index.html에 싣지 않는다).
   three.js(r128)도 이때 CDN에서 받는다. 시안(claude.ai 비공개 페이지 nj3d)에서 폰으로 검증한 코드를 옮겼다.
   1차에 든 것: 성 터·풀밭·꽃·사방으로 흐르는 강·정금 바닥과 길·보좌, 기초석(njBuilt), 진주 문(njPearls), 문 경사로,
                내려다보기 / 걸어서 구경(흰 옷 입은 순례자, 점프, 보석으로 산 제트팩), 화질 기본/고급.
   2차 이후(시안에 있음): 성곽 12켜와 이름 벽돌, 문 위 천사, 정금 성, 다른 순례자·인사.
   지킬 것: 창을 닫으면 루프를 멈추고 모든 자원을 버린다 · 만지지 않으면 초당 30번 · 고급에서 느리면 기본으로
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
    const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    const ORBIT_URL = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
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

    window.openNJ3D = async function () {
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
                <div class="nj3d-walk" hidden>
                    <div class="nj3d-joy"><div class="nj3d-knob"></div></div>
                    <div class="nj3d-btns">
                        <button class="nj3d-wb small nj3d-jetbuy"></button>
                        <button class="nj3d-wb fly nj3d-fly" hidden>${T('nj3d_fly')}</button>
                        <button class="nj3d-wb nj3d-jump">${T('nj3d_jump')}</button>
                    </div>
                </div>
                <div class="nj3d-hint"></div>
            </div>`;
        document.body.appendChild(ov);
        const stageEl = ov.querySelector('.nj3d-stage'), loading = ov.querySelector('.nj3d-loading');
        const cleanups = [];
        cur = { ov, cleanups, running: false };
        ov.querySelector('.nj3d-x').onclick = () => closeNJ3D();
        try { await ensureThree(); } catch (e) { loading.textContent = T('nj3d_fail'); return; }
        if (!cur || cur.ov !== ov) return;   // 받는 사이에 닫았다
        build(ov, stageEl, loading, cleanups);
    };

    window.closeNJ3D = function () {
        if (!cur) return;
        const c = cur; cur = null;
        c.running = false;
        c.cleanups.forEach(fn => { try { fn(); } catch (e) { } });
        c.ov.remove();
    };

    function build(ov, stageEl, loading, cleanups) {
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
        const skyTex = grad([[0, '#0f1a33'], [0.55, '#35406f'], [1, '#f3d9a0']]);
        scene.background = skyTex; scene.fog = new THREE.Fog(0x9fb59a, 55, 120);
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

        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
        camera.position.set(15, 14, 19);
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target.set(0, 0.5, 0); controls.enableDamping = true; controls.dampingFactor = 0.08;
        controls.minDistance = 4; controls.maxDistance = 60; controls.maxPolarAngle = 1.38; controls.enablePan = false;
        controls.autoRotate = true; controls.autoRotateSpeed = 0.55;
        cleanups.push(() => controls.dispose());
        const hint = ov.querySelector('.nj3d-hint');
        const showHint = (txt, ms) => { hint.textContent = txt; hint.style.opacity = '1'; if (ms) setTimeout(() => { hint.style.opacity = '0'; }, ms); };
        showHint(T('nj3d_hint_orbit'));
        controls.addEventListener('start', () => { controls.autoRotate = false; hint.style.opacity = '0'; });

        scene.add(new THREE.HemisphereLight(0xfff4d6, 0x2e6b45, 0.75));
        const sun = new THREE.DirectionalLight(0xffffff, 0.9); sun.position.set(10, 18, 8); scene.add(sun);
        sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0006;
        Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 60 });
        const throneLight = new THREE.PointLight(0xffe7a8, 1.6, 16, 1.6); throneLight.position.set(0, 2, 0); scene.add(throneLight);

        // 풀밭 — 물길 자리(두 축 둘레 RB)를 비운 네 조각. 물길은 파여 있다 (9/29 — 평평한 강은 걸어도 강 같지 않았다)
        const RW = 0.55, RB = 0.95, RD = 0.12, WL = -0.05, IN_F = 4.9;   // 물길 바닥 반폭 · 둑 끝 · 깊이 · 수면 · 정금 바닥 끝
        {
            const R = 80, gm = new THREE.MeshStandardMaterial({ color: 0x2f9e58, roughness: 0.95, side: THREE.DoubleSide });
            const e = Math.sqrt(R * R - RB * RB), a0 = Math.asin(RB / R), sh = new THREE.Shape();
            sh.moveTo(RB, RB); sh.lineTo(RB, e);
            for (let n = 1; n < 24; n++) { const a = Math.PI / 2 - a0 - (Math.PI / 2 - 2 * a0) * n / 24; sh.lineTo(R * Math.cos(a), R * Math.sin(a)); }
            sh.lineTo(e, RB); sh.closePath();
            const qg = new THREE.ShapeGeometry(sh); qg.rotateX(Math.PI / 2);   // (x, y) → (x, 0, y)
            [0, 1, 2, 3].forEach(q => { const m = new THREE.Mesh(qg, gm); m.rotation.y = q * Math.PI / 2; m.receiveShadow = true; scene.add(m); });
            // 땅속 — 틈으로 하늘이 비치지 않게
            const under = new THREE.Mesh(new THREE.CircleGeometry(80, 32), new THREE.MeshBasicMaterial({ color: 0x3a2e22 }));
            under.rotation.x = -Math.PI / 2; under.position.y = -RD - 0.03; scene.add(under);
        }
        {
            const mats = ['🌸', '🌼', '🌷', '🌺', '🌻'].map(e => {
                const c = document.createElement('canvas'); c.width = c.height = 96;
                const x = c.getContext('2d'); x.font = '76px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
                x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 48, 54);
                const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding;
                return new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false });
            });
            let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
            for (let n = 0; n < 110; n++) {
                const x = (rnd() - 0.5) * 50, z = (rnd() - 0.5) * 50;
                if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;
                if (Math.abs(x) < 1.6 || Math.abs(z) < 1.6) continue;
                const f = new THREE.Sprite(mats[n % mats.length]);
                const sz = 0.7 + rnd() * 0.35; f.scale.set(sz, sz, 1); f.position.set(x, sz * 0.42, z); scene.add(f);
            }
        }
        // 보좌 — 빛
        const radial = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
            const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)');
            x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
        {
            const throne = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 0.45, 24), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff1c9, emissiveIntensity: 0.8 }));
            throne.position.y = 0.25; scene.add(throne);
            const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: radial, color: 0xfff0c8, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
            glow.scale.set(4.2, 4.2, 1); glow.position.y = 1.1; scene.add(glow);
        }
        // 생명수의 강 — 보좌에서 사방으로 (22:1)
        const riverCv = document.createElement('canvas'); riverCv.width = 32; riverCv.height = 128;
        { const rg = riverCv.getContext('2d'); rg.fillStyle = '#12b3cc'; rg.fillRect(0, 0, 32, 128); rg.fillStyle = 'rgba(220,250,255,0.75)'; rg.fillRect(7, 10, 2, 34); rg.fillRect(22, 60, 2, 26); rg.fillRect(14, 96, 2, 22); }
        const rivers = [];
        // 물길 단면: 둑 비탈(RB→RW) · 바닥(깊이 RD) · 둑 비탈. s0~s1 구간을 +z 방향으로
        const troughGeo = (s0, s1) => {
            const us = [-RB, -RW, RW, RB], hs = [0, -RD, -RD, 0], pos = [], idx = [];
            us.forEach((u, i) => pos.push(u, hs[i], s0, u, hs[i], s1));
            for (let i = 0; i < 3; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
            return g;
        };
        const bankEarth = new THREE.MeshStandardMaterial({ color: 0x6b5238, roughness: 0.9, side: THREE.DoubleSide });
        const bankGold = new THREE.MeshStandardMaterial({ color: 0xc99a3a, metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide });
        const WW = 2 * (RW + (RB - RW) * (-WL) / RD);   // 수면이 둑 비탈과 만나는 폭
        const waterMat = (tex) => [new THREE.MeshStandardMaterial({ map: tex, emissive: 0x0a6f80, emissiveIntensity: 0.35, roughness: 0.25, metalness: 0.1 }),
            new THREE.MeshStandardMaterial({ map: tex, emissive: 0x0a6f80, emissiveIntensity: 0.2, roughness: 0.04, metalness: 0.5, envMapIntensity: 1.8 })];
        [0, Math.PI, Math.PI / 2, -Math.PI / 2].forEach(a => {
            const L = 60, grp = new THREE.Group(); grp.rotation.y = a;
            const tex = new THREE.CanvasTexture(riverCv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1, (L - RB) / 3); tex.encoding = THREE.sRGBEncoding;
            const t1 = new THREE.Mesh(troughGeo(RB, IN_F), bankGold), t2 = new THREE.Mesh(troughGeo(IN_F, L), bankEarth);
            t1.receiveShadow = t2.receiveShadow = true; grp.add(t1); grp.add(t2);
            const [wb, wh] = waterMat(tex);
            const water = dual(new THREE.Mesh(new THREE.PlaneGeometry(WW, L - RB)), wb, wh);
            water.rotation.x = -Math.PI / 2; water.position.set(0, WL, RB + (L - RB) / 2); grp.add(water);
            scene.add(grp); rivers.push(tex);
        });
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
            const g = new THREE.ExtrudeGeometry(sh, { depth: FH, bevelEnabled: false }); g.rotateX(-Math.PI / 2); return g;
        }
        const SIDE_ROT = { N: [0, i => i], E: [-Math.PI / 2, i => i], S: [Math.PI, i => 2 - i], W: [Math.PI / 2, i => 2 - i] };
        function rebuild() {
            built.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
            while (built.children.length) built.remove(built.children[0]);
            BOXES.length = 0; BOXES.push(THRONE_BOX);
            SEQ.forEach(([side, i], k) => {
                const [cx, cz] = gatePos(side, i), horiz = side === 'N' || side === 'S';
                if (k < found) {
                    const col = new THREE.Color(STONES[k]);
                    const mat = HIGH
                        ? new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.1, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.08, envMapIntensity: 0.9, emissive: col, emissiveIntensity: 0.12 })
                        : new THREE.MeshStandardMaterial({ color: col, roughness: 0.08, metalness: 0.3, emissive: col, emissiveIntensity: 0.05 });
                    const [rot, idx] = SIDE_ROT[side];
                    const stone = new THREE.Mesh(foundationGeom(idx(i)), mat);
                    stone.rotation.y = rot; stone.castShadow = stone.receiveShadow = true; built.add(stone);
                    // 문 안팎의 경사로 — 기초석 단(0.6)은 순례자 키(0.22)보다 훨씬 높다
                    const n = side === 'N' ? [0, -1] : side === 'S' ? [0, 1] : side === 'E' ? [1, 0] : [-1, 0];
                    const along = horiz ? [1, 0] : [0, 1], tg = (i - 1) * GATE_GAP;
                    const rm = new THREE.MeshStandardMaterial({ color: 0xdbe6ee, roughness: 0.75, side: THREE.DoubleSide });
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
                }
                // 진주 문 — 얻은 진주만큼 온전한 문이 선다. 아직이면 아무것도 없다(통로는 처음부터 열려 있다). 기둥과 아치는 부딪힌다
                if (k >= pearls) return;
                const gm = HIGH ? new THREE.MeshPhysicalMaterial({ color: 0xfdfbff, roughness: 0.12, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.8, emissive: 0xd8cff5, emissiveIntensity: 0.22 })
                    : new THREE.MeshStandardMaterial({ color: 0xfbf8ff, roughness: 0.1, metalness: 0.25, emissive: 0xcfc6f0, emissiveIntensity: 0.3 });
                const base = k < found ? FH : 0.02, R = GATE / 2, Tk = 0.14, postH = GATE_H - R;
                const gate = new THREE.Group();
                [-1, 1].forEach(sg => {
                    const post = new THREE.Mesh(new THREE.CylinderGeometry(Tk, Tk, postH, 12), gm); post.position.set(sg * R, postH / 2, 0); post.castShadow = true; gate.add(post);
                    const px = horiz ? cx + sg * R : cx, pz = horiz ? cz : cz + sg * R;
                    BOXES.push({ x0: px - Tk, x1: px + Tk, z0: pz - Tk, z1: pz + Tk, y0: base, y1: base + postH });
                });
                const arch = new THREE.Mesh(new THREE.TorusGeometry(R, Tk, 12, 36, Math.PI), gm); arch.position.set(0, postH, 0); gate.add(arch);
                const aw = R + Tk;   // 아치 — 제트팩으로 날다 부딪히거나 위에 설 수 있게 대략 상자 하나
                BOXES.push(horiz ? { x0: cx - aw, x1: cx + aw, z0: cz - Tk, z1: cz + Tk, y0: base + postH + R * 0.7, y1: base + GATE_H + Tk }
                                 : { x0: cx - Tk, x1: cx + Tk, z0: cz - aw, z1: cz + aw, y0: base + postH + R * 0.7, y1: base + GATE_H + Tk });
                gate.position.set(cx, base, cz); if (!horiz) gate.rotation.y = Math.PI / 2; built.add(gate);
            });
        }
        // 부딪히는 상자 — 보좌(오르지 못한다) + rebuild가 넣는 진주 문 기둥·아치
        const THRONE_BOX = { x0: -0.75, x1: 0.75, z0: -0.75, z1: 0.75, y0: 0, y1: 60 };
        const BOXES = [THRONE_BOX];

        // ── 고급에서만: 빛줄기 · 빛 알갱이 · 풀잎 ──
        const extras = new THREE.Group(); scene.add(extras);
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
        {
            const N = 3000, blade = new THREE.InstancedMesh(new THREE.ConeGeometry(0.045, 0.42, 3), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 }), N);
            let sd = 5; const r = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
            const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
            let n = 0;
            while (n < N) {
                const a = r() * Math.PI * 2, d = 6.6 + Math.pow(r(), 0.7) * 30, x = Math.cos(a) * d, z = Math.sin(a) * d;
                if (Math.abs(x) < 1.25 || Math.abs(z) < 1.25) continue;
                if (Math.abs(x) < 7.6 && Math.abs(z) < 7.6) continue;   // 성과 경사로 둘레는 비운다
                const k = 0.7 + r() * 0.8;
                e.set((r() - 0.5) * 0.5, r() * Math.PI, (r() - 0.5) * 0.5); q.setFromEuler(e);
                v.set(x, 0.2 * k, z); sc.set(1, k, 1); m4.compose(v, q, sc); blade.setMatrixAt(n, m4);
                col.setHSL(0.3 + r() * 0.06, 0.55 + r() * 0.2, 0.28 + r() * 0.14); blade.setColorAt(n, col);
                n++;
            }
            blade.receiveShadow = true; extras.add(blade);
        }
        extras.visible = HIGH;

        // ── 순례자 (계 7:9 흰 옷) — 성벽 높이의 1/14쯤 ──
        const CH = 0.22, CR = 0.07, STEP = 0.14, G = 4.2, JUMP_V = 1.55, WALK_V = 0.95, RUN_V = 1.75;
        const P = { x: 1.3, y: 0, z: 9.2, vy: 0, onGround: true, face: Math.PI };
        let walk = false, jetOn = false, camYaw = 0, camPitch = 0.12, camDist = 0.95, walkT = 0, gait = 0;
        // 팔다리가 있는 순례자 (9/29) — 엉덩이·어깨를 축으로 흔들어 걷기·달리기·점프·날기 자세를 만든다. 앞은 -z
        const pilgrim = new THREE.Group(), body = new THREE.Group(); pilgrim.add(body);
        const limbs = {};
        {
            const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
            const skin = new THREE.MeshStandardMaterial({ color: 0xf1d3b3, roughness: 0.7 });
            const cloth = new THREE.MeshStandardMaterial({ color: 0xeee6d8, roughness: 0.8 });
            const sandal = new THREE.MeshStandardMaterial({ color: 0x8a5a34, roughness: 0.8 });
            const robe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.056, 0.105, 16), white); robe.position.y = 0.115; body.add(robe);
            const sash = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.005, 8, 20), new THREE.MeshStandardMaterial({ color: 0xf2c14e, metalness: 0.6, roughness: 0.3 }));
            sash.rotation.x = Math.PI / 2; sash.position.y = 0.128; body.add(sash);
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.031, 16, 12), skin); head.position.y = 0.195; body.add(head);
            const hair = new THREE.Mesh(new THREE.SphereGeometry(0.033, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x3b2a20, roughness: 0.8 }));
            hair.position.set(0, 0.2, 0.004); body.add(hair);
            [-1, 1].forEach(sg => {
                const hip = new THREE.Group(); hip.position.set(sg * 0.017, 0.075, 0); body.add(hip);
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.01, 0.07, 8), cloth); leg.position.y = -0.035; hip.add(leg);
                const foot = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.034), sandal); foot.position.set(0, -0.07, -0.007); hip.add(foot);
                const sh = new THREE.Group(); sh.position.set(sg * 0.036, 0.158, 0); body.add(sh);
                const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.009, 0.068, 8), white); arm.position.y = -0.034; sh.add(arm);
                const hand = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 6), skin); hand.position.y = -0.071; sh.add(hand);
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
        const splash = (x, z, big) => {
            const r = ripples[ripN++ % ripples.length]; r.t = 0; r.big = big; r.m.position.set(x, WL + 0.004, z); r.m.visible = true;
            if (typeof SoundEffect !== 'undefined' && SoundEffect.playSplash) SoundEffect.playSplash(big);
        };
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
            const band = bandHeight(x, z); if (band > 0) return band;
            const ax = Math.abs(x), az = Math.abs(z), inner = ax < IN_F && az < IN_F;
            if (inner && (Math.abs(ax - GATE_GAP) < 0.275 || Math.abs(az - GATE_GAP) < 0.275)) return 0.09;
            const dip = riverDip(x, z);
            if (dip < 0) return dip;
            return inner ? 0.04 : 0;
        }
        function groundAt(x, z, y) {
            let g = terrain(x, z);
            BOXES.forEach(b => { if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && b.y1 <= y + STEP && b.y1 > g) g = b.y1; });
            return g;
        }
        function blocked(x, z, y) {
            if (Math.abs(x) > 34 || Math.abs(z) > 34) return true;
            if (terrain(x, z) - y > STEP) return true;
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
        cvs.addEventListener('pointerdown', e => { if (!walk) return; lookId = e.pointerId; lx = e.clientX; ly = e.clientY; });
        cvs.addEventListener('pointermove', e => {
            if (!walk || e.pointerId !== lookId) return;
            camYaw -= (e.clientX - lx) * 0.006; camPitch = Math.max(-0.45, Math.min(1.2, camPitch + (e.clientY - ly) * 0.005));
            lx = e.clientX; ly = e.clientY; lastTouch = performance.now();
        });
        const endLook = e => { if (e.pointerId === lookId) lookId = null; };
        cvs.addEventListener('pointerup', endLook); cvs.addEventListener('pointercancel', endLook);
        cvs.addEventListener('wheel', e => { if (walk) { camDist = Math.max(0.45, Math.min(3, camDist * (e.deltaY > 0 ? 1.1 : 0.9))); e.preventDefault(); } }, { passive: false });
        const doJump = () => { if (P.onGround) { P.vy = JUMP_V; P.onGround = false; } };
        listen(window, 'keydown', e => { if (!walk) return; inp.keys[e.code] = true; if (e.code === 'Space') { doJump(); e.preventDefault(); } if (e.code === 'Escape') closeNJ3D(); });
        listen(window, 'keyup', e => { inp.keys[e.code] = false; });
        ov.querySelector('.nj3d-jump').addEventListener('pointerdown', e => { e.preventDefault(); doJump(); });
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
            syncJetUI(); showHint(T('nj3d_jet_got'), 3500);
        });
        syncJetUI();

        // ── 모드 ──
        const walkUI = ov.querySelector('.nj3d-walk'), modeBtn = ov.querySelector('.nj3d-mode');
        const camSave = camera.position.clone();
        const ray = new THREE.Raycaster();
        const setModeLabel = () => { modeBtn.textContent = walk ? T('nj3d_overview') : T('nj3d_walk'); };
        setModeLabel();
        modeBtn.addEventListener('click', () => {
            walk = !walk; controls.enabled = !walk; walkUI.hidden = !walk; pilgrim.visible = true;
            if (walk) { controls.autoRotate = false; camera.fov = 62; camera.near = 0.02; showHint(T('nj3d_hint_walk'), 3500); }
            else { camera.fov = 42; camera.near = 0.1; camera.position.copy(camSave); controls.target.set(0, 0.5, 0); }
            camera.updateProjectionMatrix(); setModeLabel(); lastTouch = performance.now();
        });

        function walkUpdate(dt) {
            walkT += dt;
            const k = inp.keys;
            const kv = (k.ControlLeft || k.ControlRight) ? 1 : 0.7;   // 키보드는 걷기, Ctrl을 누르면 달리기
            const jx = inp.jx + (((k.KeyD || k.ArrowRight) ? 1 : 0) - ((k.KeyA || k.ArrowLeft) ? 1 : 0)) * kv;
            const jy = inp.jy + (((k.KeyS || k.ArrowDown) ? 1 : 0) - ((k.KeyW || k.ArrowUp) ? 1 : 0)) * kv;
            const fly = hasJet() && (jetOn || k.ShiftLeft || k.ShiftRight);
            const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
            let mx = fx * (-jy) + rx * jx, mz = fz * (-jy) + rz * jx;
            const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
            const moving = ml > 0.05, wasGround = P.onGround;
            const inWater = P.onGround && P.y < -0.02;
            const run = moving && ml > 0.85 && !fly;   // 조이스틱을 끝까지 밀면 달린다
            const sp = (fly || !P.onGround) ? WALK_V * 1.35 : (run ? RUN_V : WALK_V) * (inWater ? 0.65 : 1);
            const nx = P.x + mx * sp * dt, nz = P.z + mz * sp * dt;
            if (!blocked(nx, P.z, P.y)) P.x = nx;
            if (!blocked(P.x, nz, P.y)) P.z = nz;
            if (fly) P.vy = Math.min(P.vy + 6.5 * dt, 1.4); else P.vy -= G * dt;
            P.y = Math.min(16, P.y + P.vy * dt);
            const g = groundAt(P.x, P.z, P.y);
            if (P.y <= g) { P.y = g; if (P.vy < 0) P.vy = 0; P.onGround = true; } else P.onGround = false;
            if (!wasGround && P.onGround && P.y < -0.02) splash(P.x, P.z, true);   // 물에 떨어짐
            if (moving) { const want = Math.atan2(-mx, -mz); let d = want - P.face; d = Math.atan2(Math.sin(d), Math.cos(d)); P.face += d * Math.min(1, dt * 10); }
            pilgrim.position.set(P.x, P.y, P.z); pilgrim.rotation.y = P.face;
            // 자세 — 걷기·달리기는 팔다리를 엇갈려 흔들고, 공중에선 팔을 벌리고, 날 때는 다리를 모은다
            const stepping = moving && P.onGround;
            if (stepping) {
                const prev = Math.sin(gait);
                gait += dt * (run ? 15 : 9.5) * (inWater ? 0.8 : 1);
                if (inWater && Math.sign(Math.sin(gait)) !== Math.sign(prev)) splash(P.x, P.z, false);   // 발을 디딜 때마다 참방
            }
            const amp = run ? 0.95 : 0.55, sw = Math.sin(gait);
            let hL = 0, hR = 0, aL = 0, aR = 0, zL = 0, zR = 0, lean = 0, bob = 0;
            if (fly) { hL = 0.12; hR = 0.05; zL = -0.35; zR = 0.35; lean = -0.25; }
            else if (!P.onGround) { hL = 0.65; hR = -0.3; aL = -0.5; aR = 0.4; zL = -0.75; zR = 0.75; }
            else if (stepping) { hL = amp * sw; hR = -amp * sw; aL = -amp * 0.85 * sw; aR = amp * 0.85 * sw; lean = run ? -0.2 : -0.05; bob = Math.abs(Math.cos(gait)) * (run ? 0.012 : 0.006); }
            const e = Math.min(1, dt * 14), L = limbs;
            L.hipL.rotation.x += (hL - L.hipL.rotation.x) * e; L.hipR.rotation.x += (hR - L.hipR.rotation.x) * e;
            L.armL.rotation.x += (aL - L.armL.rotation.x) * e; L.armR.rotation.x += (aR - L.armR.rotation.x) * e;
            L.armL.rotation.z += (zL - L.armL.rotation.z) * e; L.armR.rotation.z += (zR - L.armR.rotation.z) * e;
            body.rotation.x += (lean - body.rotation.x) * e; body.position.y += (bob - body.position.y) * Math.min(1, dt * 30);
            ripples.forEach(r => {
                if (r.t >= 1) return;
                r.t = Math.min(1, r.t + dt / (r.big ? 0.9 : 0.6));
                const sc = 1 + r.t * (r.big ? 9 : 5); r.m.scale.set(sc, 1, sc);
                r.m.material.opacity = (r.big ? 0.75 : 0.55) * (1 - r.t); if (r.t >= 1) r.m.visible = false;
            });
            flames.forEach(f => { f.visible = fly; f.scale.set(0.05, 0.08 + Math.random() * 0.04, 1); });
            if (moving || fly || !P.onGround) lastTouch = performance.now();
            const Tg = new THREE.Vector3(P.x, P.y + 0.17, P.z);
            const dir = new THREE.Vector3(Math.sin(camYaw) * Math.cos(camPitch), Math.sin(camPitch), Math.cos(camYaw) * Math.cos(camPitch));
            let dist = camDist;
            ray.set(Tg, dir); ray.far = camDist;
            const hits = ray.intersectObjects(built.children, true);
            if (hits.length) dist = Math.max(0.12, hits[0].distance - 0.05);
            const cp = Tg.clone().addScaledVector(dir, dist);
            cp.y = Math.max(cp.y, groundAt(cp.x, cp.z, cp.y) + 0.03);
            camera.position.lerp(cp, Math.min(1, dt * 12));
            camera.lookAt(Tg.x, Tg.y + 0.04, Tg.z);
        }

        // ── 화질 ──
        function setQuality(h, byUser) {
            HIGH = h;
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, h ? 2 : 1.5));
            renderer.shadowMap.enabled = h; scene.environment = h ? envTex : null;
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
            if (!reduce) rivers.forEach(tx => { tx.offset.y += dt * 0.25; });   // 보좌에서 바깥으로
            if (HIGH && !reduce) {
                for (let n = 0; n < MOTES; n++) { const i = n * 3 + 1; motePos[i] += dt * moteSpd[n]; if (motePos[i] > 10) motePos[i] = 0; }
                moteGeo.attributes.position.needsUpdate = true; shaft.rotation.y += dt * 0.05;
            }
            if (HIGH && !userPicked && perf.n < 140) {   // 고급으로 시작했는데 평균 22fps 미만이면 기본으로
                perf.n++; if (perf.n > 20) perf.sum += dt;
                if (perf.n === 140 && perf.sum / 120 > 0.045) { setQuality(false, false); showHint(T('nj3d_slow'), 3500); }
            }
            if (walk) walkUpdate(dt); else controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(loop);
        }
        rebuild(); resize(); loading.remove();
        C.running = true; requestAnimationFrame(loop);
    }
})();
