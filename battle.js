/* ⚔️ 말씀 대결 — 도전장(비동기 1:1) · 2026-10-13 · docs/말씀-대결.md
   game.js의 openBattle()이 누를 때만 불러온다(nj3d.js처럼). 서버: kingsroad battleCheck·battleSend·battleAnswer
   보낸 사람이 먼저 7문제를 풀고 그 기록과 함께 보낸다 → 받은 사람이 같은 문제로 그 기록과 겨룬다.
   문제마다 한쪽만 맞히면 그쪽, 둘 다 맞히면 빠른 쪽. 승패만 남는다(보석·리그 없음).
   대결 결과는 암송 증거(백지 레벨·기름 단계·복습)에 넣지 않는다 — 알아보기지 떠올리기가 아니다. 일지에만 tr로 */
(function () {
    'use strict';
    const Q_N = 7;
    const LIMIT = { ro: 30000, bl: 15000, ra: 15000, nx: 12000 };
    const KIND = { ro: '순서 맞추기', bl: '빈칸 고르기', ra: '몇 절일까요?', nx: '다음 어절' };
    const WHY = {
        google: '말씀 대결은 구글 계정을 연결한 분끼리 할 수 있어요.',
        toGoogle: '{nick}님이 아직 구글 계정을 연결하지 않았어요.',
        rel: '친구나 같은 길드원에게만 보낼 수 있어요.',
        open: '{nick}님에게 보낸 도전장이 아직 열려 있어요. 답이 오면 다시 보낼 수 있어요.',
        daily: '오늘은 도전장을 다 보냈어요(하루 10장).',
        nouser: '보낼 수 없는 상대예요.', self: '보낼 수 없는 상대예요.',
        closed: '이미 끝났거나 기한이 지난 도전장이에요.', gone: '사라진 도전장이에요.', notyou: '내 도전장이 아니에요.'
    };
    const esc = (s) => (typeof escapeHtml === 'function' ? escapeHtml(String(s == null ? '' : s)) : String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
    const call = (name, data) => firebase.app().functions('asia-northeast3').httpsCallable(name)(Object.assign({ myTag }, data)).then(r => r.data);
    const uid = () => (auth && auth.currentUser ? auth.currentUser.uid : '');
    const note = (k) => { try { if (typeof _featNote === 'function') _featNote(k); } catch (e) { } };
    const snd = (k) => { try { if (typeof SoundEffect !== 'undefined' && SoundEffect[k]) SoundEffect[k](); } catch (e) { } };

    /* ── 문제 만들기 — 퀴즈퀴즈 계시록 app/public/js/common.js·scoring.js에서 복사(10/13) ── */
    const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
    // 초성 — 쉼표·마침표 같은 기호는 뺀다(카드에 남으면 어디에 오는 말인지 귀띔이 된다)
    function chosung(w) { let out = ''; for (const ch of String(w || '')) { const c = ch.charCodeAt(0) - 44032; out += c >= 0 && c < 11172 ? CHO[Math.floor(c / 588)] : /[\p{L}\p{N}]/u.test(ch) ? ch : ''; } return out; }
    // 카드는 초성 가나다 순. seq[k] = 원래 k 번째 어절이 몇 번 카드인가
    function roCards(words) {
        const idx = words.map((_, k) => k).sort((a, b) => chosung(words[a]).localeCompare(chosung(words[b]), 'ko') || words[a].localeCompare(words[b], 'ko') || a - b);
        return { cards: idx.map(k => chosung(words[k])), words: idx.map(k => words[k]), seq: words.map((_, k) => idx.indexOf(k)) };
    }
    // 채점은 초성끼리 — 초성이 같은 두 카드는 어느 쪽을 먼저 놓아도 맞다(화면만 보고는 가릴 수 없다)
    function roRight(cards, seq, a) {
        if (a.length !== seq.length || new Set(a).size !== a.length) return false;
        return a.every((k, n) => cards[k] === cards[seq[n]]);
    }

    const W = (ch, v) => (bibleData[ch][v - 1].chunks || bibleData[ch][v - 1].text.split(/\s+/));
    const bare = (w) => String(w).replace(/[^\p{L}\p{N}]/gu, '');
    const rnd = (n) => Math.floor(Math.random() * n);
    const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    // 그 장의 다른 절이 앞 n어절이 같은가 — 후렴(2·3장 「귀 있는 자는…」)처럼 앞부분으로 절이 갈리지 않는 절
    function sharedPrefix(ch, v, n) {
        const a = W(ch, v).slice(0, n).map(bare).join(' ');
        for (let u = 1; u <= bibleData[ch].length; u++) if (u !== v && W(ch, u).slice(0, n).map(bare).join(' ') === a) return true;
        return false;
    }
    // 보기 셋 — 그 장의 다른 어절에서, 끝 글자(조사)가 같은 것을 먼저(문법으로 정답이 드러나지 않게)
    // 그 절에 이미 나오는 말은 뺀다(18:13 물건 목록처럼 그 자리에도 들어갈 수 있어 보인다)
    function distractors(ch, ans, n, v) {
        const A = bare(ans), pool = new Map(), own = new Set(W(ch, v).map(bare));
        for (let u = 1; u <= bibleData[ch].length; u++) W(ch, u).forEach(w => { const b = bare(w); if (b.length >= 2 && b !== A && !own.has(b) && !pool.has(b)) pool.set(b, w); });
        const all = shuffle([...pool.values()]), same = all.filter(w => bare(w).slice(-1) === A.slice(-1));
        const out = same.slice(0, n);
        for (const w of all) { if (out.length >= n) break; if (!out.includes(w)) out.push(w); }
        return out;
    }
    const MAKE = {
        ro(ch, v) {
            const ws = W(ch, v), k = Math.min(7, ws.length - 2);
            if (k < 5) return null;
            for (let t = 0; t < 12; t++) {
                const lo = ws.length - k >= 2 ? 1 : 0, hi = Math.max(lo, ws.length - k - (ws.length - k >= 2 ? 1 : 0));
                const s = lo + rnd(hi - lo + 1), seg = ws.slice(s, s + k).map(bare);
                if (new Set(seg).size === seg.length) return { k: 'ro', v: `${ch}-${v}`, s, n: k };   // 7장 지파 절처럼 같은 말이 되풀이되는 토막은 내지 않는다
            }
            return null;
        },
        bl(ch, v) {
            const ws = W(ch, v), cnt = {};
            ws.forEach(w => { const b = bare(w); cnt[b] = (cnt[b] || 0) + 1; });
            const cand = ws.map((w, i) => i).filter(i => bare(ws[i]).length >= 2 && cnt[bare(ws[i])] === 1);
            if (!cand.length) return null;
            const i = cand[rnd(cand.length)], d = distractors(ch, ws[i], 3, v);
            if (d.length < 3) return null;
            return { k: 'bl', v: `${ch}-${v}`, i, o: shuffle([ws[i], ...d]) };
        },
        ra(ch, v) {
            const N = bibleData[ch].length;
            if (N < 4 || sharedPrefix(ch, v, 3)) return null;
            const others = shuffle([...Array(N).keys()].map(x => x + 1).filter(x => x !== v)).slice(0, 3);
            return { k: 'ra', v: `${ch}-${v}`, o: shuffle([v, ...others]) };
        },
        nx(ch, v) {
            const ws = W(ch, v);
            if (ws.length < 5 || sharedPrefix(ch, v, 3)) return null;
            const ps = shuffle([2, 3, 4, 5, 6].filter(p => p <= ws.length - 2));
            for (const p of ps) {
                if (sharedPrefix(ch, v, p)) continue;
                const d = distractors(ch, ws[p], 3, v);
                if (d.length < 3) continue;
                return { k: 'nx', v: `${ch}-${v}`, p, o: shuffle([ws[p], ...d]) };
            }
            return null;
        }
    };
    function makeQs(ch) {
        const N = bibleData[ch].length, plan = shuffle(['ro', 'ro', 'bl', 'bl', 'ra', 'ra', 'nx']);
        let verses = shuffle([...Array(N).keys()].map(x => x + 1));
        const qs = [], used = new Set();
        for (const kind of plan) {
            let q = null;
            for (const k of [kind, ...shuffle(['ro', 'bl', 'ra', 'nx'].filter(x => x !== kind))]) {
                for (const v of verses) { if (used.has(v)) continue; q = MAKE[k](ch, v); if (q) { used.add(v); break; } }
                if (q) break;
            }
            if (!q) {   // 절이 모자라면(15장 8절) 이미 쓴 절에서 다른 형식으로
                for (const v of verses) for (const k of ['bl', 'ro', 'nx', 'ra']) { if (q) break; if (!qs.some(x => x.v === `${ch}-${v}` && x.k === k)) q = MAKE[k](ch, v); }
            }
            if (q) qs.push(q);
        }
        return qs.length === Q_N ? qs : null;
    }

    /* ── 화면 ── */
    let S = null;   // 지금 화면 상태
    function css() {
        if (document.getElementById('bt-style')) return;
        const st = document.createElement('style');
        st.id = 'bt-style';
        st.textContent = `
#bt-ov{position:fixed;inset:0;z-index:9000;background:rgba(10,14,24,.78);display:flex;justify-content:center;align-items:stretch;padding:max(10px,env(safe-area-inset-top)) 10px max(10px,env(safe-area-inset-bottom))}
#bt-ov .bt-p{width:100%;max-width:440px;background:#16202e;color:#e8edf3;border:1px solid #2c3b52;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 10px 40px rgba(0,0,0,.5)}
#bt-ov .bt-h{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #26354a;font-weight:bold;font-size:1.05rem}
#bt-ov .bt-x{background:none;border:none;color:#8fa3bd;font-size:1.2rem;cursor:pointer;padding:2px 6px}
#bt-ov .bt-b{flex:1;overflow-y:auto;padding:14px 16px 20px;display:flex;flex-direction:column;gap:12px}
#bt-ov .bt-sec{font-size:.82rem;color:#8fa3bd;margin-top:4px;letter-spacing:.02em}
#bt-ov .bt-row{display:flex;align-items:center;gap:10px;background:#1d2a3c;border:1px solid #2a3a50;border-radius:12px;padding:11px 12px}
#bt-ov .bt-row .bt-m{flex:1;min-width:0}
#bt-ov .bt-row .bt-n{font-weight:bold}
#bt-ov .bt-row .bt-s{font-size:.8rem;color:#8fa3bd;margin-top:2px}
#bt-ov .bt-btn{background:#d4a73a;color:#1a1408;border:none;border-radius:10px;padding:9px 14px;font-weight:bold;cursor:pointer;font-size:.9rem;white-space:nowrap}
#bt-ov .bt-btn.sub{background:#2a3a50;color:#dbe4ee}
#bt-ov .bt-btn.big{width:100%;padding:13px;font-size:1rem}
#bt-ov .bt-btn:disabled{opacity:.5}
#bt-ov .bt-empty{color:#8fa3bd;text-align:center;padding:14px 0;font-size:.9rem}
#bt-ov .bt-rec{text-align:center;color:#dbe4ee;font-size:.92rem}
#bt-ov .bt-rec b{color:#f3cf6b}
#bt-ov .bt-note{font-size:.88rem;line-height:1.6;color:#c9d4e2;background:#1d2a3c;border-radius:12px;padding:12px}
#bt-ov .bt-chs{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
#bt-ov .bt-chs button{background:#1d2a3c;color:#e8edf3;border:1px solid #2f4260;border-radius:10px;padding:11px 0;font-weight:bold;cursor:pointer;font-size:.95rem}
#bt-ov .bt-top{display:flex;justify-content:space-between;font-size:.85rem;color:#8fa3bd}
#bt-ov .bt-bar{height:5px;background:#26354a;border-radius:3px;overflow:hidden}
#bt-ov .bt-bar i{display:block;height:100%;background:#d4a73a;width:100%;transform-origin:left}
#bt-ov .bt-kind{font-size:.85rem;color:#f3cf6b;font-weight:bold}
#bt-ov .bt-ref{font-size:.85rem;color:#8fa3bd}
#bt-ov .bt-txt{font-size:1.08rem;line-height:1.75;word-break:keep-all}
#bt-ov .bt-gap{display:inline-block;min-width:3.2em;border-bottom:2px solid #d4a73a;margin:0 2px}
#bt-ov .bt-opts{display:flex;flex-direction:column;gap:8px}
#bt-ov .bt-opts button{background:#1d2a3c;color:#e8edf3;border:1px solid #2f4260;border-radius:12px;padding:13px;font-size:1rem;cursor:pointer;text-align:center}
#bt-ov .bt-opts button.ok{background:#1f5d3a;border-color:#2f8a57}
#bt-ov .bt-opts button.no{background:#6b2430;border-color:#9b3443}
#bt-ov .bt-cards{display:flex;flex-wrap:wrap;gap:6px;justify-content:center}
#bt-ov .bt-cards button{min-width:3em;background:#2c5fa8;color:#fff;border:1px solid #1a4080;border-radius:10px;padding:9px 11px;font-size:1rem;font-weight:bold;cursor:pointer}
#bt-ov .bt-cards button.used{visibility:hidden}
#bt-ov .bt-placed{min-height:56px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center;align-content:flex-start;background:#f4f1e8;border:2px dashed #b9b2a0;border-radius:12px;padding:8px}
#bt-ov .bt-placed .slot{display:inline-block;height:2.4em;border-bottom:3px solid #b9b2a0;border-radius:4px;background:rgba(0,0,0,.04)}
#bt-ov .bt-placed .slot.next{border-bottom-color:#d4a73a;background:rgba(212,167,58,.14)}
#bt-ov .bt-placed button{background:#fff;color:#2c3e50;border:1px solid #d5cfc0;border-radius:10px;padding:9px 11px;font-size:1rem;font-weight:bold;cursor:pointer}
#bt-ov .bt-placed button.c{background:#2ecc71;color:#fff;border-color:#27ae60}
#bt-ov .bt-placed button.e{background:#e74c3c;color:#fff;border-color:#c0392b;animation:btShake .4s}
@keyframes btShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
#bt-ov .bt-attack{width:100%;background:#d4a73a;color:#1a1408;border:none;border-radius:12px;padding:12px;font-size:1rem;font-weight:bold;cursor:pointer}
#bt-ov .bt-attack:disabled{opacity:.45}
#bt-ov .bt-fb{min-height:1.6em;text-align:center;font-weight:bold}
#bt-ov .bt-fb .y{color:#6fd39a} #bt-ov .bt-fb .n{color:#f08a96}
#bt-ov .bt-ghost{text-align:center;font-size:.88rem;color:#8fa3bd;min-height:1.4em}
#bt-ov .bt-score{text-align:center;font-size:2rem;font-weight:bold;letter-spacing:.05em}
#bt-ov .bt-win{text-align:center;font-size:1.15rem;font-weight:bold;color:#f3cf6b}
#bt-ov .bt-per{display:flex;flex-direction:column;gap:6px}
#bt-ov .bt-per div{display:flex;gap:8px;align-items:center;font-size:.86rem;background:#1d2a3c;border-radius:10px;padding:8px 10px}
#bt-ov .bt-per span.r{flex:1;min-width:0;color:#c9d4e2}
#bt-ov .bt-per button{background:#2a3a50;color:#dbe4ee;border:none;border-radius:8px;padding:5px 8px;font-size:.8rem;cursor:pointer;white-space:nowrap}
`;
        document.head.appendChild(st);
    }
    function shell(title, body, onClose) {
        css();
        let ov = document.getElementById('bt-ov');
        if (!ov) { ov = document.createElement('div'); ov.id = 'bt-ov'; document.body.appendChild(ov); }
        ov.innerHTML = `<div class="bt-p"><div class="bt-h"><span>${title}</span><button class="bt-x" id="bt-close">✕</button></div><div class="bt-b" id="bt-body">${body}</div></div>`;
        ov.querySelector('#bt-close').onclick = onClose || close;
        return ov.querySelector('#bt-body');
    }
    function close() {
        if (S && S.timer) cancelAnimationFrame(S.timer);
        if (S && S.ghostT) clearTimeout(S.ghostT);
        S = null;
        const ov = document.getElementById('bt-ov'); if (ov) ov.remove();
        if (typeof window._battleInboxRefresh === 'function') window._battleInboxRefresh();
    }
    const msg = (why, nick) => (WHY[why] || '잠시 뒤 다시 해 주세요.').replace('{nick}', esc(nick || '상대'));
    const toast = (m, bad) => { if (typeof showGemToast === 'function') showGemToast(0, m, !!bad); };
    const refOf = (v) => v.replace('-', ':');
    // 목록의 이름 — 친구 메모가 있으면 메모를 크게, 닉네임은 아래에(친구 목록과 같은 방식, 사용자 10/13). 제목·알림 문구는 닉네임 그대로
    const memo = (tag) => { try { return (typeof getFriendMemo === 'function' && getFriendMemo(tag)) || ''; } catch (e) { return ''; } };
    const nameOf = (p) => esc(memo(p.tag) || p.nick);
    const nickSub = (p) => memo(p.tag) ? `${esc(p.nick)} · ` : '';
    const runOf = (d, side) => (d.runs && (d.runs[side] || d.runs[d[side].uid])) || [];   // 10/13 첫 배포분은 계정 번호로 남았다
    const daysLeft = (d) => Math.max(1, Math.ceil((d.expiresAt - Date.now()) / 86400000));

    /* 허브 — 받은 도전장 · 기다리는 도전장 · 지난 대결 · 새 도전장 */
    async function hub() {
        note('bt_open');
        const body = shell('⚔️ 말씀 대결', '<div class="bt-empty">불러오는 중…</div>');
        if (!isGoogleLinked()) { googleGate(body); return; }
        let docs = [], lb = {};
        try {
            const [snap, me] = await Promise.all([
                db.collection('battles').where('uids', 'array-contains', uid()).get(),
                _getFriendDoc(myTag)
            ]);
            docs = snap.docs.map(d => Object.assign({ id: d.id }, d.data())); lb = me || {};
        } catch (e) { console.warn('[battle] hub', e); body.innerHTML = '<div class="bt-empty">불러오지 못했어요. 잠시 뒤 다시 열어 주세요.</div>'; return; }
        if (!document.getElementById('bt-body')) return;
        const now = Date.now(), me = String(myTag);   // 쪽은 태그로 가린다 — 한 사람이 계정을 여럿 쓰기도 한다(10/13)
        const inbox = docs.filter(d => d.state === 'open' && d.to.tag === me && d.expiresAt > now).sort((a, b) => b.createdAt - a.createdAt);
        const waiting = docs.filter(d => d.state === 'open' && d.from.tag === me && d.expiresAt > now);
        const past = docs.filter(d => d.state === 'done').sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0)).slice(0, 15);
        const seen = seenGet();
        let h = `<div class="bt-rec">내 전적 <b>${lb.battleW | 0}</b>승 <b>${lb.battleL | 0}</b>패${lb.battleD ? ` <b>${lb.battleD | 0}</b>무` : ''}</div>`;
        h += `<button class="bt-btn big" id="bt-new">＋ 새 도전장 보내기</button>`;
        h += `<div class="bt-sec">📬 받은 도전장</div>`;
        h += inbox.length ? inbox.map(d => `<div class="bt-row"><div class="bt-m"><div class="bt-n">${nameOf(d.from)}</div><div class="bt-s">${nickSub(d.from)}${d.ch}장 · ${daysLeft(d)}일 남음</div></div><button class="bt-btn" data-play="${d.id}">겨루기</button></div>`).join('')
            : `<div class="bt-empty">받은 도전장이 없어요</div>`;
        if (waiting.length) {
            h += `<div class="bt-sec">⏳ 답을 기다리는 도전장</div>`;
            h += waiting.map(d => `<div class="bt-row"><div class="bt-m"><div class="bt-n">${nameOf(d.to)}</div><div class="bt-s">${nickSub(d.to)}${d.ch}장 · ${daysLeft(d)}일 남음</div></div></div>`).join('');
        }
        if (past.length) {
            h += `<div class="bt-sec">📜 지난 대결</div>`;
            h += past.map(d => {
                const mine = d.from.tag === me ? 'from' : 'to', opp = mine === 'from' ? d.to : d.from;
                const res = d.win === 'draw' ? '무승부' : d.win === mine ? '승' : '패';
                const isNew = mine === 'from' && !seen[d.id + d.doneAt];
                return `<div class="bt-row"><div class="bt-m"><div class="bt-n">${nameOf(opp)}${isNew ? ' <span style="color:#f08a96;font-size:.75rem">새 결과</span>' : ''}</div><div class="bt-s">${nickSub(opp)}${d.ch}장 · ${d.score[mine]}:${d.score[mine === 'from' ? 'to' : 'from']} ${res}</div></div><button class="bt-btn sub" data-see="${d.id}">보기</button></div>`;
            }).join('');
        }
        h += `<div class="bt-note">📖 도전장을 보내면 내가 먼저 7문제를 풀고, 상대는 같은 문제로 내 기록과 겨뤄요. 문제마다 맞힌 사람이, 둘 다 맞히면 더 빠른 사람이 점수를 얻어요. 친구와 같은 길드원에게 보낼 수 있어요.</div>`;
        body.innerHTML = h;
        body.querySelector('#bt-new').onclick = () => pickOpponent();
        body.querySelectorAll('[data-play]').forEach(b => b.onclick = () => play(docs.find(d => d.id === b.dataset.play)));
        body.querySelectorAll('[data-see]').forEach(b => b.onclick = () => { const d = docs.find(x => x.id === b.dataset.see); seenSet(d); result(d); });
    }
    function seenGet() { try { return JSON.parse(localStorage.getItem('kr_bt_seen') || '{}') || {}; } catch (e) { return {}; } }
    function seenSet(d) { try { const s = seenGet(); s[d.id + d.doneAt] = 1; const ks = Object.keys(s); if (ks.length > 60) ks.slice(0, ks.length - 60).forEach(k => delete s[k]); localStorage.setItem('kr_bt_seen', JSON.stringify(s)); } catch (e) { } }

    function googleGate(body) {
        const blocked = typeof _googleBlockedBrowser === 'function' && _googleBlockedBrowser();
        body.innerHTML = `<div class="bt-note">⚔️ 말씀 대결은 <b>구글 계정을 연결한 분끼리</b> 할 수 있어요.<br>승패 기록은 계정에 남는 기록이라, 기기를 바꾸거나 앱을 지워도 지켜지도록요.</div>
            ${blocked ? `<div class="bt-note">지금 화면(앱 안 브라우저)에서는 구글 연결이 막혀 있어요. 크롬·사파리 같은 브라우저나 설치한 앱에서 열어 주세요.</div>`
                : `<button class="bt-btn big" id="bt-glink">구글 계정 연결하기</button>`}`;
        const b = body.querySelector('#bt-glink');
        if (b) b.onclick = async () => { close(); if (typeof linkGoogleAccount === 'function') await linkGoogleAccount(); };
    }

    /* 상대 고르기 — 친구 + 같은 길드원 */
    async function pickOpponent() {
        const body = shell('⚔️ 누구에게 보낼까요?', '<div class="bt-empty">불러오는 중…</div>', hub);
        let list = [];
        try {
            const me = (await _getFriendDoc(myTag)) || {};
            const tags = new Map();
            (me.friends || []).forEach(t => tags.set(t, '친구'));
            if (me.guildId) {
                const g = await db.collection('guilds').doc(me.guildId).get();
                if (g.exists) (g.data().members || []).forEach(t => { if (t !== myTag && !tags.has(t)) tags.set(t, '길드원'); });
            }
            const ds = await Promise.all([...tags.keys()].map(t => _getFriendDoc(t).catch(() => null)));
            list = [...tags.entries()].map(([t, rel], i) => ({ tag: t, rel, nick: (ds[i] && ds[i].nickname) || '순례자' }));
        } catch (e) { console.warn('[battle] pick', e); }
        if (!document.getElementById('bt-body')) return;
        if (!list.length) { body.innerHTML = `<div class="bt-empty">친구나 길드원이 생기면 도전장을 보낼 수 있어요.</div>`; return; }
        body.innerHTML = list.map(p => `<div class="bt-row"><div class="bt-m"><div class="bt-n">${nameOf(p)}</div><div class="bt-s">${nickSub(p)}#${esc(p.tag)} · ${p.rel}</div></div><button class="bt-btn" data-to="${esc(p.tag)}">선택</button></div>`).join('');
        body.querySelectorAll('[data-to]').forEach(b => b.onclick = () => { const p = list.find(x => x.tag === b.dataset.to); precheck(p.tag, p.nick, b); });
    }
    async function precheck(tag, nick, btn) {
        if (btn) { btn.disabled = true; btn.textContent = '확인 중…'; }
        let r;
        try { r = await call('battleCheck', { toTag: tag }); } catch (e) { console.warn('[battle] check', e); r = { ok: false }; }
        if (btn) { btn.disabled = false; btn.textContent = '선택'; }
        if (!r || !r.ok) {
            if (btn) { toast(msg(r && r.why, nick), true); return; }
            const body = shell('⚔️ 말씀 대결', '', hub);   // 친구 목록·결과 화면에서 바로 온 경우 — 이유를 화면에
            body.innerHTML = `<div class="bt-note">${msg(r && r.why, nick)}</div><button class="bt-btn big sub" id="bt-back">대결 화면으로</button>`;
            wire(body); return;
        }
        pickChapter(tag, nick);
    }
    /* 장 고르기 — 진도는 보여 주지 않는다(사용자 10/13: 부담) */
    function pickChapter(tag, nick) {
        const body = shell(`⚔️ ${esc(nick)}님에게 · 어느 장으로?`, '', hub);
        body.innerHTML = `<div class="bt-chs">${Array.from({ length: 22 }, (_, i) => `<button data-ch="${i + 1}">${i + 1}장</button>`).join('')}</div>
            <div class="bt-note">고른 장에서 7문제가 나와요. 내가 먼저 풀고 나면 도전장이 ${esc(nick)}님에게 가요.</div>`;
        body.querySelectorAll('[data-ch]').forEach(b => b.onclick = () => {
            const ch = +b.dataset.ch, qs = makeQs(ch);
            if (!qs) { toast('이 장으로는 문제를 만들지 못했어요. 다른 장을 골라 주세요.', true); return; }
            play({ ch, qs, send: { tag, nick } });
        });
    }

    /* 풀기 — d.send가 있으면 보내는 쪽(먼저 풂), 없으면 받은 도전장(상대 기록과 겨룸) */
    function play(d) {
        if (!d) return;
        const ghost = d.send ? null : runOf(d, 'from');
        S = { d, i: 0, run: [], ghost, me: 0, op: 0, title: d.send ? `⚔️ ${esc(d.send.nick)}님에게 보낼 도전장` : `⚔️ ${esc(d.from.nick)}님의 도전장` };
        note(d.send ? 'bt_write' : 'bt_play');
        ask();
    }
    function ask() {
        const { d, i } = S, q = d.qs[i], [ch, v] = q.v.split('-').map(Number), ws = W(ch, v);
        const body = shell(S.title, '', () => { if (confirm_quit()) close(); });
        let core = '';
        if (q.k === 'ro') {
            const seg = ws.slice(q.s, q.s + q.n), c = roCards(seg);
            S.ro = { cards: c.cards, words: c.words, seq: c.seq, a: [] };
            core = `<div class="bt-txt">${esc(ws.slice(0, q.s).join(' '))} <span class="bt-gap">…</span> ${esc(ws.slice(q.s + q.n).join(' '))}</div>
                <div class="bt-placed" id="bt-placed"></div>
                <div class="bt-cards">${c.words.map((wd, k) => `<button data-c="${k}">${esc(wd)}</button>`).join('')}</div>
                <button class="bt-attack" id="bt-attack" disabled>⚔️ 공격</button>`;
        } else if (q.k === 'bl') {
            core = `<div class="bt-txt">${ws.map((w, k) => k === q.i ? '<span class="bt-gap">&nbsp;</span>' : esc(w)).join(' ')}</div>
                <div class="bt-opts">${q.o.map((o, k) => `<button data-o="${k}">${esc(o)}</button>`).join('')}</div>`;
        } else if (q.k === 'ra') {
            core = `<div class="bt-txt">${esc(ws.join(' '))}</div>
                <div class="bt-opts">${q.o.map((o, k) => `<button data-o="${k}">${ch}장 ${o}절</button>`).join('')}</div>`;
        } else {
            core = `<div class="bt-txt">${esc(ws.slice(0, q.p).join(' '))} <span class="bt-gap">&nbsp;</span> …</div>
                <div class="bt-opts">${q.o.map((o, k) => `<button data-o="${k}">${esc(o)}</button>`).join('')}</div>`;
        }
        body.innerHTML = `<div class="bt-top"><span>${i + 1} / ${Q_N}</span><span>${S.ghost ? `나 <b>${S.me}</b> : <b>${S.op}</b> 상대` : '내 기록을 남기는 중'}</span></div>
            <div class="bt-bar"><i id="bt-tm"></i></div>
            <div class="bt-kind">${KIND[q.k]}</div>${q.k === 'ra' ? '' : `<div class="bt-ref">${ch}장 ${v}절</div>`}
            ${core}
            <div class="bt-fb" id="bt-fb"></div><div class="bt-ghost" id="bt-gh">${S.ghost ? '🕊️ 상대가 푸는 중…' : ''}</div>`;
        S.t0 = performance.now(); S.done = false;
        const lim = LIMIT[q.k], bar = body.querySelector('#bt-tm');
        const tick = () => {
            if (!S || S.done) return;
            const el = performance.now() - S.t0;
            bar.style.transform = `scaleX(${Math.max(0, 1 - el / lim)})`;
            if (el >= lim) { answer(false, lim); return; }
            S.timer = requestAnimationFrame(tick);
        };
        S.timer = requestAnimationFrame(tick);
        if (S.ghost) {
            const g = S.ghost[i];
            S.ghostT = setTimeout(() => { if (S && !S.done) showGhost(); }, Math.min(g.ms, lim));
        }
        if (q.k === 'ro') {   // 🗡️ 보스전처럼 블록을 차례로 놓고 공격, 칸마다 초록·빨강, 시간 안이면 고쳐서 다시(10/13). 10/14 사용자: 난이도를 낮춰 — 초성 대신 단어 블록, 자리마다 그 단어 길이만큼의 빈칸
            drawPlaced(body);
            body.querySelectorAll('[data-c]').forEach(b => b.onclick = () => {
                if (S.done) return;
                S.ro.a.push(+b.dataset.c); S.ro.marks = null; b.classList.add('used'); snd('playClick'); drawPlaced(body);
            });
            body.querySelector('#bt-attack').onclick = () => {
                if (S.done || S.ro.a.length !== S.ro.cards.length) return;
                S.ro.marks = S.ro.a.map((k, n) => bare(S.ro.words[k]) === bare(S.ro.words[S.ro.seq[n]]));   // 칸마다 — 그 자리 단어면 맞다
                drawPlaced(body);
                if (S.ro.marks.every(Boolean)) { S.ro.won = true; drawPlaced(body); answer(true, performance.now() - S.t0); }
                else snd('playWrong');
            };
        } else {
            body.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
                if (S.done) return;
                const o = q.o[+b.dataset.o], ok = q.k === 'ra' ? o === v : o === (q.k === 'bl' ? ws[q.i] : ws[q.p]);
                b.classList.add(ok ? 'ok' : 'no');
                if (!ok) body.querySelectorAll('[data-o]').forEach(x => { const ox = q.o[+x.dataset.o]; if (q.k === 'ra' ? ox === v : ox === (q.k === 'bl' ? ws[q.i] : ws[q.p])) x.classList.add('ok'); });
                answer(ok, performance.now() - S.t0);
            });
        }
    }
    function confirm_quit() {
        // 브라우저 confirm 대신 — 나가면 이번 판은 기록되지 않는다
        if (S && S.quitAsk) return true;
        if (S) { S.quitAsk = true; toast('한 번 더 누르면 나가요. 이번 판은 기록되지 않아요.'); setTimeout(() => { if (S) S.quitAsk = false; }, 2500); }
        return false;
    }
    function drawPlaced(body) {
        const el = body.querySelector('#bt-placed'); if (!el) return;
        const R = S.ro, mk = R.marks;
        // 자리마다 — 놓은 블록, 아직이면 그 자리 단어 길이만큼의 빈칸(다음 자리는 금빛)
        el.innerHTML = R.seq.map((_, n) => n < R.a.length
            ? `<button data-p="${n}" class="${mk ? (mk[n] ? 'c' : 'e') : ''}">${esc(R.words[R.a[n]])}</button>`
            : `<span class="slot${n === R.a.length ? ' next' : ''}" style="width:calc(${bare(R.words[R.seq[n]]).length}em + 22px)"></span>`).join('');
        const atk = body.querySelector('#bt-attack'); if (atk) atk.disabled = R.a.length !== R.cards.length || S.done;
        el.querySelectorAll('[data-p]').forEach(b => b.onclick = () => {   // 놓은 블록을 누르면 아래로 되돌린다(그 블록만)
            if (S.done) return;
            const k = R.a.splice(+b.dataset.p, 1)[0]; R.marks = null;
            const c = body.querySelector(`[data-c="${k}"]`); if (c) c.classList.remove('used');
            drawPlaced(body);
        });
    }
    function showGhost() {
        const g = S.ghost[S.i], el = document.getElementById('bt-gh');
        if (el) el.innerHTML = g.ok ? `🕊️ 상대 <span style="color:#6fd39a">✓</span> ${(g.ms / 1000).toFixed(1)}초` : `🕊️ 상대 <span style="color:#f08a96">✗</span>`;
    }
    function answer(ok, ms) {
        if (!S || S.done) return;
        S.done = true; cancelAnimationFrame(S.timer); clearTimeout(S.ghostT);
        ms = Math.round(Math.min(ms, LIMIT[S.d.qs[S.i].k]));
        S.run.push({ ok, ms });
        const q = S.d.qs[S.i];
        try { if (typeof _battleLog === 'function') _battleLog(q.v, ok, ms, q.k); } catch (e) { }
        snd(ok ? 'playCorrect' : 'playWrong');
        const fb = document.getElementById('bt-fb');
        let extra = '';
        if (!ok && q.k === 'ro') { const [c, v] = q.v.split('-').map(Number); extra = `<div style="font-weight:normal;font-size:.95rem;margin-top:6px;color:#c9d4e2">${esc(W(c, v).slice(q.s, q.s + q.n).join(' '))}</div>`; }   // 틀리면 원래 순서를 보여 준다
        if (fb) fb.innerHTML = ok ? `<span class="y">✓ 정답 · ${(ms / 1000).toFixed(1)}초</span>` : `<span class="n">✗ ${ms >= LIMIT[q.k] ? '시간이 다 됐어요' : '아쉬워요'}</span>${extra}`;
        if (S.ghost) {
            showGhost();
            const g = S.ghost[S.i];
            const w = ok && g.ok ? (ms < g.ms ? 'me' : g.ms < ms ? 'op' : '') : ok ? 'me' : g.ok ? 'op' : '';
            if (w === 'me') S.me++; else if (w === 'op') S.op++;
            const el = document.getElementById('bt-gh');
            if (el) el.innerHTML += w === 'me' ? ' · <b style="color:#f3cf6b">내 점수!</b>' : w === 'op' ? ' · 상대 점수' : ' · 아무도 못 얻음';
        }
        setTimeout(() => {
            if (!S) return;
            S.i++;
            if (S.i < Q_N) ask(); else finish();
        }, ok ? 1100 : (q.k === 'ro' ? 2600 : 1800));
    }
    async function finish() {
        const d = S.d, run = S.run;
        const body = shell(S.title, '<div class="bt-empty">기록을 보내는 중…</div>', close);
        try {
            if (d.send) {
                const r = await call('battleSend', { toTag: d.send.tag, ch: d.ch, qs: d.qs, run, nick: myNickname });
                if (!r || !r.ok) { body.innerHTML = `<div class="bt-note">${msg(r && r.why, d.send.nick)}</div>${reviewHtml(d, run)}<button class="bt-btn big sub" id="bt-back">대결 화면으로</button>`; wire(body); return; }
                note('bt_send');
                const n = run.filter(x => x.ok).length;
                body.innerHTML = `<div class="bt-win">📨 ${esc(d.send.nick)}님에게 도전장을 보냈어요</div>
                    <div class="bt-rec">${d.ch}장 · 내 기록 <b>${n}</b> / ${Q_N}</div>
                    <div class="bt-note">${esc(d.send.nick)}님이 같은 문제로 이 기록과 겨루면 결과가 알림으로 와요(7일 안).</div>
                    ${reviewHtml(d, run)}<button class="bt-btn big sub" id="bt-back">대결 화면으로</button>`;
                wire(body);
            } else {
                const r = await call('battleAnswer', { id: d.id, run });
                if (!r || !r.ok) { body.innerHTML = `<div class="bt-note">${msg(r && r.why)}</div><button class="bt-btn big sub" id="bt-back">대결 화면으로</button>`; wire(body); return; }
                note('bt_done');
                d.state = 'done'; d.score = r.score; d.per = r.per; d.win = r.win; d.runs = Object.assign({}, d.runs, { to: run }); d.doneAt = Date.now();
                result(d);
            }
        } catch (e) {
            console.warn('[battle] finish', e);
            body.innerHTML = `<div class="bt-note">기록을 보내지 못했어요. 인터넷 연결을 확인해 주세요.</div><button class="bt-btn big" id="bt-retry">다시 보내기</button>`;
            body.querySelector('#bt-retry').onclick = () => finish();
        }
    }
    function reviewHtml(d, run) {
        const wrong = d.qs.map((q, i) => ({ q, r: run[i] })).filter(x => !x.r.ok);
        if (!wrong.length) return '';
        return `<div class="bt-sec">틀린 절 — 백지로 다시 써 볼까요?</div><div class="bt-per">${wrong.map(x => `<div><span class="r">${refOf(x.q.v)} · ${KIND[x.q.k]}</span><button data-rev="${x.q.v}">✍️ 백지로</button></div>`).join('')}</div>`;
    }
    function wire(body) {
        const b = body.querySelector('#bt-back'); if (b) b.onclick = hub;
        body.querySelectorAll('[data-rev]').forEach(x => x.onclick = () => { note('bt_rev'); const id = x.dataset.rev; close(); if (typeof battleReviewVerse === 'function') battleReviewVerse(id); });
        const a = body.querySelector('#bt-again'); if (a) a.onclick = () => precheck(a.dataset.tag, a.dataset.nick, null);
    }
    /* 결과 — 두 기록을 문제마다 나란히 */
    function result(d) {
        const mine = d.from.tag === String(myTag) ? 'from' : 'to', theirs = mine === 'from' ? 'to' : 'from';
        const myRun = runOf(d, mine), opRun = runOf(d, theirs), opp = d[theirs];
        const res = d.win === 'draw' ? '🤝 무승부' : d.win === mine ? '🏆 이겼어요!' : '다음엔 이겨 봐요';
        const cell = (r) => r ? (r.ok ? `<span style="color:#6fd39a">✓</span>${(r.ms / 1000).toFixed(1)}초` : `<span style="color:#f08a96">✗</span>`) : '';
        const body = shell(`⚔️ ${esc(opp.nick)}님과 · ${d.ch}장`, '', close);
        body.innerHTML = `<div class="bt-score">${d.score[mine]} : ${d.score[theirs]}</div><div class="bt-win">${res}</div>
            <div class="bt-sec">문제마다 (나 · 상대)</div>
            <div class="bt-per">${d.qs.map((q, i) => `<div><span class="r">${i + 1}. ${refOf(q.v)} ${KIND[q.k]}</span>${cell(myRun[i])} · ${cell(opRun[i])}${d.per[i] === mine ? ' ⭐' : ''}</div>`).join('')}</div>
            ${reviewHtml(d, myRun)}
            ${d.win !== mine ? `<button class="bt-btn big" id="bt-again" data-tag="${esc(opp.tag)}" data-nick="${esc(opp.nick)}">⚔️ ${esc(opp.nick)}님에게 도전장 보내기</button>` : ''}
            <button class="bt-btn big sub" id="bt-back">대결 화면으로</button>`;
        if (d.win === mine) snd('playClear');
        wire(body);
    }

    window.openBattleScreen = function (opts) {
        opts = opts || {};
        if (!isGoogleLinked()) { const body = shell('⚔️ 말씀 대결', ''); googleGate(body); return; }
        if (opts.to) { shell('⚔️ 말씀 대결', '<div class="bt-empty">확인하는 중…</div>', hub); precheck(opts.to, opts.nick || '', null); return; }
        hub();
    };
    window._battleMakeQs = makeQs;   // 헤드리스 확인용
})();
