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
                <div class="nj3d-walk" hidden>
                    <div class="nj3d-joy"><div class="nj3d-knob"></div></div>
                    <div class="nj3d-btns">
                        <button class="nj3d-wb small nj3d-jetbuy"></button>
                        <button class="nj3d-wb fly nj3d-fly" hidden>${T('nj3d_fly')}</button>
                        <button class="nj3d-wb nj3d-jump">${T('nj3d_jump')}</button>
                    </div>
                </div>
                <div class="nj3d-hint"></div>
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
        sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0006;
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
        function WT(x, z) {   // 땅 높이(물길 파임 제외)
            const h = slopeH(Math.max(Math.abs(x), Math.abs(z))), e = seaE(x, z);
            return e < 1 ? -DROP - (e < 0.85 ? 1 : (1 - e) / 0.15) : h;
        }
        const stripDip = u => u >= RB ? 0 : u <= RW ? -RD : -RD * (RB - u) / (RB - RW);
        {
            // 네 조각(물길 띠를 비움) — 가까운 곳은 촘촘히, 먼 곳은 성기게
            const xs = [RB]; for (let v = 1.5; v <= 20; v += 1) xs.push(v); for (let v = 22; v <= 60; v += 2) xs.push(v); for (let v = 65; v <= 150; v += 5) xs.push(v);
            const gm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, side: THREE.DoubleSide });
            const cTop = new THREE.Color(0x2f9e58), cLow = new THREE.Color(0x3d8a48), cSand = new THREE.Color(0xc9b486), c = new THREE.Color();
            const n = xs.length;
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => {
                const pos = [], col = [], idx = [];
                xs.forEach(zv => xs.forEach(xv => {
                    const x = sx * xv, z = sz * zv, h = WT(x, z), e = seaE(x, z);
                    pos.push(x, h, z);
                    c.copy(cTop).lerp(cLow, Math.min(1, -h / DROP)); if (e < 1.5 && e > 0.75) c.lerp(cSand, 0.55);
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
                const sz = 0.7 + rnd() * 0.35; f.scale.set(sz, sz, 1); f.position.set(x, WT(x, z) + sz * 0.42, z); scene.add(f);
            }
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
        // 물길 띠 — +z 방향 s0~s1, 단면 us(가로)·hs(높이), 바닥 높이는 hf(s)를 따라간다(비탈을 내려간다). 물결 무늬는 바깥으로 흐르게 v = -s/3
        const ribbonGeo = (s0, s1, us, hs, step, hf) => {
            const n = us.length, ns = Math.max(1, Math.ceil((s1 - s0) / step)), pos = [], uv = [], idx = [];
            for (let k = 0; k <= ns; k++) { const sv = s0 + (s1 - s0) * k / ns, b = hf(sv); us.forEach((u, i) => { pos.push(u, b + hs[i], sv); uv.push(i / (n - 1), -sv / 3); }); }
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
            const t1 = new THREE.Mesh(ribbonGeo(RB, IN_F, TR_US, TR_HS, 0.5, hf), bankGold), t2 = new THREE.Mesh(ribbonGeo(IN_F, end, TR_US, TR_HS, 1, hf), bankEarth);
            t1.receiveShadow = t2.receiveShadow = true; grp.add(t1); grp.add(t2);
            const [wb, wh] = waterMat(tex);
            grp.add(dual(new THREE.Mesh(ribbonGeo(RB, end, [-WW / 2, WW / 2], [WL, WL], 1, hf)), wb, wh));
            scene.add(grp); rivers.push(tex);
        });
        {   // 어귀부터 남쪽 끝까지 — 물길 띠 자리를 땅으로 메운다(바다 밑 바닥 포함). 처음엔 바다 건너편만 메워 물칸 틈으로 빈 띠가 검은 줄처럼 보였다(9/30)
            const g = ribbonGeo(SHORE + 0.8, 150, [-RB, RB], [0, 0], 1, sv => WT(0, sv));
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
            const g = new THREE.ExtrudeGeometry(sh, { depth: FH, bevelEnabled: false }); g.rotateX(-Math.PI / 2); return g;
        }
        const SIDE_ROT = { N: [0, i => i], E: [-Math.PI / 2, i => i], S: [Math.PI, i => 2 - i], W: [Math.PI / 2, i => 2 - i] };
        function rebuild() {
            built.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
            while (built.children.length) built.remove(built.children[0]);
            BOXES.length = 0; BOXES.push(THRONE_BOX, ...TREE_BOXES);
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
            SLOTS.push([Math.cos(a) * rr * (CANOPY_R + 0.04), y * (CANOPY_R + 0.04), Math.sin(a) * rr * (CANOPY_R + 0.04)]);
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
                sc.setScalar(f.ripe ? 1 : 0.62); m4.compose(v, q, sc); fruitMesh.setMatrixAt(i, m4);
                col.set(f.ripe ? ((KINDS[f.kind] || {}).color || '#d0383a') : '#a5d66f'); fruitMesh.setColorAt(i, col);
            });
            fruitMesh.count = fruitList.length;
            fruitMesh.castShadow = true;
            if (fruitList.length) scene.add(fruitMesh);
            else { fruitMesh.geometry.dispose(); fruitMesh.material.dispose(); }
        }
        const ripeN = fruitList.filter(f => f.ripe).length;
        if (ripeN) showHint(T('nj_fruit_hint', { n: ripeN }), 5000);

        // ── 생명수의 바다와 만국 (겔 47 · 창 10 · 계 22:2) — 지도 바다와 같은 칸·같은 순서(game.js _seaGeom), 서버 진행도 그대로 ──
        const seaGrp = new THREE.Group(); scene.add(seaGrp);
        const SG = (typeof _seaGeom === 'function') ? _seaGeom() : { water: [], salt: [] };
        const toW = (x, y) => [(x - 440) / 330 * SRX, SZ + (y - 470) / 320 * SRZ];
        const HRW = 7.75 / 330 * SRX;
        {
            const fl = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x0b2a33 }));
            fl.rotation.x = -Math.PI / 2; fl.scale.set(SRX, SRZ, 1); fl.position.set(0, SEA_Y - 0.6, SZ); seaGrp.add(fl);
        }
        const cellN = SG.water.length + SG.salt.length;
        const tiles = new THREE.InstancedMesh(new THREE.CylinderGeometry(HRW * 0.93, HRW * 0.93, 0.14, 6), new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0.15 }), Math.max(1, cellN));
        {
            const m4 = new THREE.Matrix4();
            [...SG.water, ...SG.salt].forEach((c, i) => { const [X, Z] = toW(c.x, c.y); m4.makeTranslation(X, SEA_Y - 0.07, Z); tiles.setMatrixAt(i, m4); });
            tiles.count = cellN; seaGrp.add(tiles);
        }
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
            SG.water.forEach((c, i) => { col.set(i < clear ? (i >= clear - 12 ? '#2c95aa' : '#1fb0c9') : i < upto ? '#3b4a3f' : '#26312b'); tiles.setColorAt(i, col); });
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
        paintSea(seaW);
        if (typeof _seaFetch === 'function') _seaFetch().then(w => { if (cur === C && w) paintSea(w); });

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
                v.set(x, WT(x, z) + 0.2 * k, z); sc.set(1, k, 1); m4.compose(v, q, sc); blade.setMatrixAt(n, m4);
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
            const d = Math.max(Math.abs(x), Math.abs(z)), base = d <= PL ? 0 : WT(x, z);
            const r = ripples[ripN++ % ripples.length]; r.t = 0; r.big = big; r.m.position.set(x, base + WL + 0.004, z); r.m.visible = true;
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
        function groundAt(x, z, y) {
            let g = terrain(x, z);
            BOXES.forEach(b => { if (x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && b.y1 <= y + STEP && b.y1 > g) g = b.y1; });
            return g;
        }
        // 발이 물에 잠기는 곳(참방 소리) — 물길 바닥·비탈. 다리·기초석 위는 아니다
        function wetAt(x, z) {
            const ax = Math.abs(x), az = Math.abs(z);
            if (Math.max(ax, az) > PL) {
                if (seaE(x, z) < 1) return false;
                return (ax < RB && z < SHORE && stripDip(ax) < -0.02) || (az < RB && stripDip(az) < -0.02);
            }
            if (bandHeight(x, z) > 0) return false;
            if (ax < IN_F && az < IN_F && (Math.abs(ax - GATE_GAP) < 0.275 || Math.abs(az - GATE_GAP) < 0.275)) return false;
            return riverDip(x, z) < -0.02;
        }
        function blocked(x, z, y) {
            if (Math.abs(x) > 140 || z < -140 || z > 150) return true;
            if (seaE(x, z) < 0.985 && y < SEA_Y + 1.5) return true;   // 바다에는 걸어 들어가지 않는다(제트팩으로 높이 날면 위로 지나간다)
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
                <div class="nj3d-fruit-head"><span class="nj3d-fruit-dot" style="background:${f.ripe ? k.color : '#a5d66f'}"></span><b>${name}</b><span>${ref}</span></div>${body}`;
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
                <div class="nj3d-fruit-head"><b>🏞️ ${en ? N[2] : N[0]}</b><span>${en ? N[3] : N[1]} · ${LV[lv] || ''}</span></div>
                <button class="nj3d-eat">${T('nj3d_nat_open')}</button>`;
            fruitPanel.hidden = false;
            fruitPanel.querySelector('.nj3d-fruit-x').onclick = hideFruit;
            fruitPanel.querySelector('.nj3d-eat').onclick = () => { closeNJ3D(); if (typeof openSea === 'function') { openSea(); _seaSel = i; _seaRender(); } };
        };
        listen(cvs, 'pointerup', e => {
            if (!tap) return;
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
            natRay.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
            const hit = natRay.intersectObject(natRing);
            if (hit.length) showNation(Math.floor(hit[0].faceIndex / NAT_FACES)); else hideFruit();
        });
        cvs.addEventListener('pointerdown', e => { if (!walk) return; lookId = e.pointerId; lx = e.clientX; ly = e.clientY; });
        cvs.addEventListener('pointermove', e => {
            if (!walk || e.pointerId !== lookId) return;
            camYaw -= (e.clientX - lx) * 0.006; camPitch = Math.max(-1.25, Math.min(1.2, camPitch + (e.clientY - ly) * 0.005));   // 음수 = 카메라가 발치로 내려가 하늘을 올려다본다
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
            P.x = x; P.z = z; P.y = terrain(x, z) + 0.05; P.vy = 0; camYaw = yaw; P.face = yaw + Math.PI;
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
        setGoLabel();
        modeBtn.addEventListener('click', () => {
            walk = !walk; controls.enabled = !walk; walkUI.hidden = !walk; pilgrim.visible = true;
            if (walk) { controls.autoRotate = false; camera.fov = 62; camera.near = 0.02; showHint(T('nj3d_hint_walk'), 3500); }
            else { camera.fov = 42; camera.near = 0.1; where = P.z > 25 ? 'sea' : 'city'; lookAt(where); setGoLabel(); }
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
            const inWater = P.onGround && wetAt(P.x, P.z);
            const run = moving && ml > 0.85 && !fly;   // 조이스틱을 끝까지 밀면 달린다
            const sp = (fly || !P.onGround) ? WALK_V * 1.35 : (run ? RUN_V : WALK_V) * (inWater ? 0.65 : 1);
            const nx = P.x + mx * sp * dt, nz = P.z + mz * sp * dt;
            if (!blocked(nx, P.z, P.y)) P.x = nx;
            if (!blocked(P.x, nz, P.y)) P.z = nz;
            if (fly) P.vy = Math.min(P.vy + 6.5 * dt, 1.4); else P.vy -= G * dt;
            P.y = Math.min(18, P.y + P.vy * dt);
            const g = groundAt(P.x, P.z, P.y);
            if (P.y <= g) { P.y = g; if (P.vy < 0) P.vy = 0; P.onGround = true; } else P.onGround = false;
            if (!wasGround && P.onGround && wetAt(P.x, P.z)) splash(P.x, P.z, true);   // 물에 떨어짐
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
            body.visible = camPitch > -0.75;   // 많이 올려다보면 순례자를 잠시 숨긴다(1인칭처럼) — 등이 화면을 가렸다
            ray.set(Tg, dir); ray.far = dist;
            const hits = ray.intersectObjects(built.children, true);
            if (hits.length) dist = Math.max(0.12, hits[0].distance - 0.05);
            const cp = Tg.clone().addScaledVector(dir, dist);
            cp.y = Math.max(cp.y, groundAt(cp.x, cp.z, cp.y) + 0.03);
            camera.position.lerp(cp, Math.min(1, dt * 12));
            // 늘 순례자 쪽(-dir)을 본다 — 카메라가 땅에 걸려 멈춰도 시선은 그대로 위로 들려 하늘을 본다(땅속을 보지 않는다)
            camera.lookAt(camera.position.x - dir.x, camera.position.y - dir.y + 0.04, camera.position.z - dir.z);
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
            if (walk) walkUpdate(dt);
            else {
                controls.update();
                // 땅(바다는 수면) 위로 붙잡는다 — 산 속·바다 밑으로 꺼지지 않게
                const cx = camera.position.x, cz = camera.position.z, d0 = Math.max(Math.abs(cx), Math.abs(cz));
                const gy = Math.max(d0 <= PL ? 0.6 : WT(cx, cz), SEA_Y) + 0.8;
                if (camera.position.y < gy) { camera.position.y = gy; camera.lookAt(controls.target); }
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
