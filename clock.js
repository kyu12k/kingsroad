/* ── 서버 시각 보정 (2026-09-17) ─────────────────────────────────────────────
   앱의 '오늘'(일일 미션·6시 해금·단비·이벤트 보상·하루 1회 승점)은 전부 Date로 정해지는데,
   Date는 기기 시계를 읽는다. 시계를 하루 돌리면 그 모든 '하루'가 다시 열렸다.

   해결: 페이지가 뜨자마자 우리 서버(Cloudflare)에 HEAD 요청을 하나 보내 응답의 Date 헤더로
   "기기 시계 − 서버 시각"을 재고, 전역 Date를 그 차이만큼 보정한 것으로 바꿔 끼운다.
   날짜 함수가 수십 곳이라 하나씩 고치면 빠뜨리므로 한 곳에서 막는다.

   ★ 이 파일은 <head>의 **첫 스크립트**여야 한다. Firebase SDK·GA·game.js가 모두 같은 Date를 봐야
     instanceof·타임스탬프가 어긋나지 않는다.
   - 30초 안쪽 차이는 0으로 본다 — 초 단위 헤더 오차로 매 접속마다 흔들리지 않게
   - 마지막 차이를 localStorage(kingsRoad_clockOffset)에 두고 오프라인·요청 실패 때 그대로 쓴다
   - 앱이 다시 보일 때마다(visibilitychange) 다시 잰다 — 백그라운드에서 시계를 돌리는 경우
   - 마지막으로 확인한 서버 시각을 **하한**(kingsRoad_clockFloor)으로 둔다 — 진짜 시간은 그보다 앞설 수 없다.
     오프라인에서 시계를 어제로 돌려도 앱의 시간은 하한 아래로 내려가지 않는다(세션 안에서는 performance.now로 흐른다)
   - 못 막는 것: 오프라인에서 시계를 **앞으로** 돌리는 것(다음 접속 때 바로잡히지만 그 사이 받은 건 남는다), 시간대 조작
   - 되돌리려면 index.html에서 이 스크립트 한 줄을 빼면 된다 (game.js는 window._krClock이 없어도 돈다) */
(function () {
    var RealDate = Date;
    var KEY = 'kingsRoad_clockOffset';
    var KEY_FLOOR = 'kingsRoad_clockFloor';
    var offset = 0, floor = 0;
    try {
        var v = Number(localStorage.getItem(KEY));
        if (isFinite(v) && Math.abs(v) < 10 * 365 * 86400000) offset = v;
        var f = Number(localStorage.getItem(KEY_FLOOR));
        if (isFinite(f) && f > 0) floor = f;
    } catch (e) { /* localStorage 불가 — 보정 없이 기기 시계 */ }
    function perf() { return (window.performance && typeof performance.now === 'function') ? performance.now() : 0; }
    var floorPerf = perf();

    function now() {
        var t = RealDate.now() + offset;
        var f = floor + (perf() - floorPerf);   // 하한은 세션 안에서 단조롭게 흐른다
        return t > f ? t : f;
    }

    // 생성자가 객체를 반환하면 그것이 new의 결과다 → 늘 진짜 Date 인스턴스를 돌려준다.
    // prototype을 공유하므로 `x instanceof Date`가 어느 쪽 인스턴스에도 참이다.
    function KRDate(a, b, c, d, e, f, g) {
        if (!(this instanceof KRDate)) return String(new KRDate());   // Date() — new 없이 부르면 문자열
        var n = arguments.length;
        if (n === 0) return new RealDate(now());
        if (n === 1) return new RealDate(a);
        return new RealDate(a, b, c === undefined ? 1 : c, d || 0, e || 0, f || 0, g || 0);
    }
    KRDate.prototype = RealDate.prototype;
    KRDate.now = now;
    KRDate.parse = RealDate.parse;
    KRDate.UTC = RealDate.UTC;
    window.Date = KRDate;

    function sync() {
        if (typeof fetch !== 'function' || location.protocol === 'file:') return;
        var t0 = RealDate.now();
        // 코어 자산('/', index.html, game.js…)은 SW가 cache.put을 하는데 HEAD는 Cache API가 못 넣는다 → 비코어 경로에 HEAD
        var url = location.pathname.replace(/[^/]*$/, '') + 'bible_en.js?clock=' + t0;
        fetch(url, { method: 'HEAD', cache: 'no-store' }).then(function (r) {
            var h = r.headers.get('date');
            var s = h ? RealDate.parse(h) : NaN;
            if (!isFinite(s)) return;
            var t1 = RealDate.now();
            // HTTP Date는 초 단위(내림) → +500ms, 왕복의 절반을 더한다
            var next = Math.round(s + 500 + (t1 - t0) / 2 - t1);
            if (Math.abs(next) < 30000) next = 0;
            var prev = offset;
            offset = next;
            floor = s + 500; floorPerf = perf();
            try { localStorage.setItem(KEY, String(offset)); localStorage.setItem(KEY_FLOOR, String(floor)); } catch (e) {}
            if (Math.abs(next - prev) > 60000) {
                api.lastChange = { offset: offset, prev: prev };   // game.js가 아직 안 떠 있으면 이걸 보고 알린다
                try { document.dispatchEvent(new CustomEvent('kr-clock-changed', { detail: api.lastChange })); } catch (e) {}
            }
        }).catch(function () { /* 오프라인 — 저장된 차이 그대로 */ });
    }
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') sync();
    });
    var api = { get offset() { return offset; }, sync: sync, RealDate: RealDate, lastChange: null };
    window._krClock = api;
    sync();
})();
