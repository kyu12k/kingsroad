const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: "asia-northeast3", maxInstances: 10 });

// 허용할 출처 목록 (로컬 개발 + 실제 배포 도메인)
const ALLOWED_ORIGINS = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "https://kings-road-rank.web.app",
    "https://kings-road-rank.firebaseapp.com",
    "https://kingsload.pages.dev"
];


// 필수 필드 목록
const REQUIRED_FIELDS = ["version", "gems", "level", "nickname", "tag", "playerId"];

// ── 점수·젬 조작 방지 상한 ──
// 하루 증가폭 상한은 제거했다. 세이브 전체가 클라이언트에서 만들어지므로 증가폭 제한은
// 조작을 막지 못하고 며칠에 나눠 올리도록 늦출 뿐인데, 정상 유저의 백업 복원과
// 상위권 정상 플레이를 실제로 차단했다(2026-07-09~10). 절대 상한만 남긴다.
const GEM_ABS_MAX          = 100000000; // 젬 절대 상한
// 하루 젬 증가량 **표식**(차단 아님, 2026-09-17). 위 이력대로 차단은 정상 유저를 잡으므로 서버가 KST 날짜별
// 증가량을 saves/{uid}.gemLedger에 적어두고, 문턱을 넘으면 flags를 올려 로그만 남긴다. 분석 때 훑어본다.
// 정상 최대치: 바쁜 날 ~10만, 월요일(랭킹 3판 보상 8.75만 + 미션) ~19만 → 30만.
const GEM_DAILY_FLAG       = 300000;
// 줄어든 것도 적는다(2026-10-05 사용자: 오전에 10만이 넘었는데 낮에 보니 그 아래 — 늘어난 양만 남아 언제 줄었는지 알 수 없었다).
// 그날 줄어든 합(lost)과 한 번에 크게 줄어든 순간(GEM_DROP_MARK 넘게) 최근 10개(drops) — 두 기기 저장이 부딪쳐 한꺼번에 사라진 것을 가려내려고.
// 같은 저장 트랜잭션 안에서 숫자 몇 개만 더 쓴다 — 요청 수·응답은 그대로
const GEM_DROP_MARK        = 5000;
const SCORE_ABS_MAX        = 100000000;   // 주간·월간 점수 절대 상한 ('즉시 1억' 류 차단)
// 누적·연간은 쌓이기만 하므로 따로 — 2천만 하나로 묶었다가 1위(흠없는 어린양, 누적 19,999,236)가 닿아
// 그 뒤 모든 점수 제출이 invalid-argument로 거절됐다 (2026-09-29)
const SCORE_ABS_MAX_TOTAL  = 2000000000;
const SCORE_TOTAL_FIELDS   = new Set(['totalScore', 'yearlyScore']);
// 클라이언트가 제출한 점수 저장 시 검증할 점수 필드
const SCORE_FIELDS = ['score', 'myMonthlyScore', 'totalScore', 'yearlyScore', 'prevWeekScore', 'prevMonthlyScore'];
// submitScoreSecure가 leaderboard에 쓸 수 있는 필드 화이트리스트 (재화 필드 주입 차단)
const SCORE_WRITE_WHITELIST = [
    ...SCORE_FIELDS,
    'nickname', 'castleLv', 'tribe', 'dept', 'tag',
    'weekId', 'monthId', 'prevWeekId', 'prevMonthId', 'maxHearts', 'weeklyHistory',
    'recallWeekId', 'recallCount', // 실시간 암송왕 (2026-09-13) — 이번 주 백지로 써낸 구절 수
    'readWeekId', 'readCount',     // 실시간 통독왕 (2026-09-16) — 이번 주 읽음을 누른 구절 수
    'dailyDoneDate', 'weeklyDoneWeek', // 오늘의 암송 ✅·📅 암송완료 (2026-09-17)
    'eventId', 'eventTried', 'eventReady', 'eventTotal', // 시험 준비 참여 요약 — 대시보드 집계용 (2026-09-18)
];
const READ_COUNT_MAX = 200000; // 3초 간격 상한 28,800/일 × 7
// 실시간 암송왕 상한: 404절 × 7일 (같은 구절 하루 1회 규칙의 이론상 최대)
const RECALL_COUNT_MAX = 404 * 7;

/**
 * 게임 데이터 저장 검증 Cloud Function
 * 클라이언트가 직접 Firestore에 쓰는 대신 이 함수를 통해 저장
 */
exports.saveGameDataSecure = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    // 1. 인증 확인
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "로그인이 필요합니다.");
    }

    const uid = request.auth.uid;
    const newData = request.data;

    // 2. 필수 필드 확인
    for (const field of REQUIRED_FIELDS) {
        if (newData[field] === undefined || newData[field] === null) {
            throw new HttpsError("invalid-argument", `필수 필드 누락: ${field}`);
        }
    }

    // 3. playerId가 인증된 UID와 일치하는지 확인 (다른 사람 데이터 덮어쓰기 방지)
    if (newData.playerId !== uid) {
        throw new HttpsError("permission-denied", "playerId가 인증 정보와 일치하지 않습니다.");
    }

    // 4. 기본 타입 검증
    if (typeof newData.gems !== "number" || newData.gems < 0 || newData.gems > GEM_ABS_MAX) {
        throw new HttpsError("invalid-argument", "젬 값이 유효하지 않습니다.");
    }
    if (typeof newData.level !== "number" || newData.level < 0 || newData.level > 50) {
        throw new HttpsError("invalid-argument", "레벨 값이 유효하지 않습니다.");
    }

    // 5. 서버 시간 기준 updatedAt 유효성 검사 (5분 이상 미래 값 거부)
    const serverNow = Date.now();
    if (newData.updatedAt && newData.updatedAt > serverNow + 5 * 60 * 1000) {
        throw new HttpsError("invalid-argument", "updatedAt이 서버 시간보다 미래입니다.");
    }

    // 6. 검증 통과 — 서버 타임스탬프로 덮어써서 저장
    const dataToSave = {
        ...newData,
        updatedAt: serverNow,
        savedByServer: true
    };
    // baseUpdatedAt은 동시성 검사용 메타 필드이므로 문서에는 남기지 않는다
    delete dataToSave.baseUpdatedAt;

    // 7. 낙관적 동시성 제어
    // 클라이언트는 자신이 기준으로 삼은 서버 updatedAt을 baseUpdatedAt으로 보낸다.
    // 그 사이 다른 기기가 더 최근에 저장했다면 이 저장은 '낡은 버전 위의 쓰기'이므로 거절한다.
    // (이 장치가 없어 오래된 기기가 다른 기기의 진행을 통째로 덮어쓴 사고가 있었다. 2026-09-06)
    //
    // ★ baseUpdatedAt을 보내지 않는 구버전 클라이언트는 검사를 건너뛴다.
    //   덕분에 서버/클라이언트 배포 순서와 무관하게 안전하며, 이 함수만 되돌리면 검사가 사라진다.
    const docRef = db.collection("saves").doc(uid);
    const hasBase = typeof newData.baseUpdatedAt === "number";

    try {
        await db.runTransaction(async (tx) => {
            // 젬 장부 때문에 늘 읽는다 (저장당 읽기 1회)
            const snap = await tx.get(docRef);
            const old = snap.exists ? snap.data() : null;
            if (hasBase && old) {
                const serverUpdatedAt = old.updatedAt || 0;
                if (serverUpdatedAt > newData.baseUpdatedAt) {
                    const staleErr = new Error("stale-write");
                    staleErr._staleServerUpdatedAt = serverUpdatedAt;
                    throw staleErr;
                }
            }
            /* ★ 기준 시각 없는 저장은 이미 있는 문서를 덮지 못한다 (2026-10-10).
               10/7 전 앱은 기준 시각을 저장본에 남기지 않아, 다시 열면 기준 없이 첫 업로드를 했고 위 검사를 건너뛰었다.
               그 옛 앱이 켜진 채 남은 기기가 10/8·10/9(#TJNGGW 밭 20→17·햇살 약속), 10/10(#FHDVGA 이번 주 승점 −18,506)에 옛 기록으로 덮었다.
               지금 앱은 서버 기록을 받은 뒤 그 시각을 기준으로 올리므로 걸리지 않는다. 거절된 옛 앱은 「다른 기기에서 더 최근에 저장」 배너 → 서버 기록을 받는다 */
            if (!hasBase && old && (old.updatedAt || 0) > 0) {
                const staleErr = new Error("stale-write-nobase");
                staleErr._staleServerUpdatedAt = old.updatedAt;
                throw staleErr;
            }
            /* ★ 줄지 않는 값은 서버가 지킨다 — 어떤 경로로 낡은 저장이 들어와도 밭·승점은 내려가지 않게 */
            if (old) {
                const oh = Number(old.maxHearts) || 0;
                if ((Number(dataToSave.maxHearts) || 0) < oh) dataToSave.maxHearts = oh;   // 밭은 줄지 않는다
                const ol = old.leagueData, nl = dataToSave.leagueData;
                if (ol && nl && typeof ol === "object" && typeof nl === "object") {
                    const up = (k, same) => { if (same && (Number(ol[k]) || 0) > (Number(nl[k]) || 0)) nl[k] = ol[k]; };
                    up("totalScore", true);
                    up("myScore", ol.weekId && ol.weekId === nl.weekId);
                    up("myMonthlyScore", ol.monthId && ol.monthId === nl.monthId);
                    up("yearlyScore", String(ol.monthId || "").slice(0, 4) && String(ol.monthId || "").slice(0, 4) === String(nl.monthId || "").slice(0, 4));
                }
            }
            // 젬 장부 — 서버만 쓴다. 클라이언트가 echo한 gemLedger는 여기서 덮인다
            const kstDay = new Date(serverNow + 9 * 3600 * 1000).toISOString().slice(0, 10);
            const led = (old && old.gemLedger && typeof old.gemLedger === "object") ? old.gemLedger : {};
            const prevGems = (old && typeof old.gems === "number") ? old.gems : null;
            let gained = led.day === kstDay ? (led.gained || 0) : 0;
            let lost = led.day === kstDay ? (led.lost || 0) : 0;
            if (prevGems !== null && newData.gems > prevGems) gained += newData.gems - prevGems;
            if (prevGems !== null && newData.gems < prevGems) lost += prevGems - newData.gems;
            let drops = Array.isArray(led.drops) ? led.drops : [];
            if (prevGems !== null && prevGems - newData.gems > GEM_DROP_MARK) {
                drops = [...drops, { at: serverNow, from: prevGems, to: newData.gems, base: Number(newData.baseUpdatedAt) || null, prevAt: Number(old && old.updatedAt) || null }].slice(-10);
                console.warn(`[gemDrop] uid=${uid} tag=${newData.tag} ${prevGems} → ${newData.gems}`);
            }
            const ledger = { day: kstDay, gained, lost, drops, flags: led.flags || 0, flaggedAt: led.flaggedAt || null };
            if (gained > GEM_DAILY_FLAG && led.flaggedDay !== kstDay) {
                ledger.flags += 1;
                ledger.flaggedAt = serverNow;
                ledger.flaggedDay = kstDay;
                console.warn(`[gemLedger] uid=${uid} tag=${newData.tag} day=${kstDay} gained=${gained} gems=${newData.gems} (prev ${prevGems})`);
            } else if (led.flaggedDay) {
                ledger.flaggedDay = led.flaggedDay;
            }
            dataToSave.gemLedger = ledger;
            tx.set(docRef, dataToSave);
        });
    } catch (e) {
        if (e && e._staleServerUpdatedAt !== undefined) {
            console.log(`[saveGameDataSecure] 낡은 쓰기 거절 uid=${uid} base=${newData.baseUpdatedAt} server=${e._staleServerUpdatedAt}`);
            throw new HttpsError(
                "aborted",
                "다른 기기에서 더 최근에 저장했습니다.",
                { serverUpdatedAt: e._staleServerUpdatedAt }
            );
        }
        console.error(`[saveGameDataSecure] Firestore set 실패 uid=${uid}`, e);
        throw new HttpsError("internal", "저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }

    return { success: true, updatedAt: serverNow };
});

/**
 * 점수 저장 검증 Cloud Function
 * 클라이언트가 leaderboard.score를 직접 쓰는 대신 이 함수로만 제출한다.
 * (firestore.rules에서 점수 필드 직접 쓰기를 차단해야 실효성 있음)
 */
exports.submitScoreSecure = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const p = request.data || {};
    const { myTag } = p;

    await verifyTag(request.auth.uid, myTag);

    // 점수 필드 타입·범위 검증 (정수, 0 이상, 절대 상한 이하 — '즉시 1억' 류 차단)
    for (const f of SCORE_FIELDS) {
        if (p[f] === undefined) continue;
        const cap = SCORE_TOTAL_FIELDS.has(f) ? SCORE_ABS_MAX_TOTAL : SCORE_ABS_MAX;
        if (typeof p[f] !== 'number' || !Number.isInteger(p[f]) || p[f] < 0 || p[f] > cap) {
            throw new HttpsError('invalid-argument', '점수 값이 유효하지 않습니다.');
        }
    }

    // 실시간 암송왕 — 정수 0~2,828, 주차는 'YYYY-Www' 형식만
    if (p.recallCount !== undefined) {
        if (typeof p.recallCount !== 'number' || !Number.isInteger(p.recallCount) || p.recallCount < 0 || p.recallCount > RECALL_COUNT_MAX) {
            throw new HttpsError('invalid-argument', '암송 집계 값이 유효하지 않습니다.');
        }
    }
    if (p.recallWeekId !== undefined && !/^\d{4}-W\d{2}$/.test(String(p.recallWeekId))) {
        throw new HttpsError('invalid-argument', '암송 집계 주차가 유효하지 않습니다.');
    }
    if (p.readCount !== undefined) {
        if (typeof p.readCount !== 'number' || !Number.isInteger(p.readCount) || p.readCount < 0 || p.readCount > READ_COUNT_MAX) {
            throw new HttpsError('invalid-argument', '통독 집계 값이 유효하지 않습니다.');
        }
    }
    if (p.readWeekId !== undefined && !/^\d{4}-W\d{2}$/.test(String(p.readWeekId))) {
        throw new HttpsError('invalid-argument', '통독 집계 주차가 유효하지 않습니다.');
    }
    // 오늘의 암송 — 빈 문자열 또는 'YYYY-MM-DD' / 'YYYY-Www'
    if (p.dailyDoneDate !== undefined && p.dailyDoneDate !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(String(p.dailyDoneDate))) {
        throw new HttpsError('invalid-argument', '오늘의 암송 날짜가 유효하지 않습니다.');
    }
    if (p.weeklyDoneWeek !== undefined && p.weeklyDoneWeek !== '' && !/^\d{4}-W\d{2}$/.test(String(p.weeklyDoneWeek))) {
        throw new HttpsError('invalid-argument', '암송완료 주차가 유효하지 않습니다.');
    }
    // 시험 준비 참여 요약 — id는 짧은 문자열, 절 수는 0~100 정수
    if (p.eventId !== undefined && (typeof p.eventId !== 'string' || p.eventId.length > 40)) {
        throw new HttpsError('invalid-argument', '이벤트 id가 유효하지 않습니다.');
    }
    for (const k of ['eventTried', 'eventReady', 'eventTotal']) {
        if (p[k] !== undefined && (!Number.isInteger(p[k]) || p[k] < 0 || p[k] > 100)) {
            throw new HttpsError('invalid-argument', `${k} 값이 유효하지 않습니다.`);
        }
    }

    const lbRef = db.collection('leaderboard').doc(String(myTag));

    // 화이트리스트 필드만 저장 (재화·길드 필드 주입 차단)
    // updatedAt은 기존 leaderboard 관례(Timestamp)에 맞춰 서버 타임스탬프로 기록
    const dataToSave = { updatedAt: admin.firestore.FieldValue.serverTimestamp(), savedByServer: true };
    for (const k of SCORE_WRITE_WHITELIST) {
        if (p[k] !== undefined) dataToSave[k] = p[k];
    }
    if (typeof dataToSave.nickname === 'string' && dataToSave.nickname.length > 20) {
        dataToSave.nickname = dataToSave.nickname.slice(0, 20);
    }
    dataToSave.tag = String(myTag); // 항상 본인 태그로 고정

    // 신규 문서에만 createdAt 추가 (분석용)
    const existing = await lbRef.get();
    if (!existing.exists || !existing.data().createdAt) {
        dataToSave.createdAt = admin.firestore.FieldValue.serverTimestamp();
    }

    await lbRef.set(dataToSave, { merge: true });
    return { ok: true };
});

// ── 길드 시스템 ────────────────────────────────────────────────────────────────

function getWeekId() {
    // KST(UTC+9) 기준 — 스케줄(월요일 06:00 KST)과 일치시키기 위해 KST 날짜 사용
    const kst = new Date(Date.now() + 9 * 3600000);
    const d = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day + 3);
    const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const firstDay = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
    const weekNumber = 1 + Math.round((d - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return `${d.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

const GUILD_CODE_CHARS   = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const GUILD_LEVEL_XP     = [0, 300, 1000, 3000, 8000];
const GUILD_MAX_MEMBERS  = [0, 5, 10, 15, 20, 25];
// 뿔 1-10 (index 1-10), 머리 1-7 (index 11-17). 확장 시 배열 끝에 추가.
const GUILD_DRAGON_BASE_HP = [
    0,
    2000, 5000, 12000, 25000, 50000, 100000, 200000, // 뿔 1-7
    400000, 800000, 1500000,                          // 뿔 8-10
    3000000, 6000000, 12000000, 25000000, 50000000, 100000000, 200000000, // 머리 1-7
];
const GUILD_DRAGON_MAX_LEVEL = GUILD_DRAGON_BASE_HP.length - 1; // = 17
const GUILD_DRAGON_HEAD_START = 11; // 머리 시작 레벨

// 길드 장비 — index = 레벨(0~5)
const GUILD_EQUIP_CHAIN_REDUCTION = [0, 3, 6, 10, 15, 20];   // 용 최대 HP 감소(%)
const GUILD_EQUIP_BLADE_BONUS     = [0, 3, 6, 10, 15, 20];   // 전체 대미지 증가(%)
const GUILD_EQUIP_JUDGMENT_BONUS  = [0, 10, 20, 30, 40, 50]; // 주간 비늘 보상 증가(%)
const GUILD_EQUIP_WINEPRESS_BONUS = [0, 1, 2, 3, 4, 5];      // 처치당 추가 비늘
const GUILD_EQUIP_CLAW_COST       = [0, 1, 2, 4, 7, 12];     // 해당 레벨 도달 증분 발톱

// 개인 장비 — index = 성(0~5)
const PERSONAL_EQUIP_COST = [0, 4, 8, 24, 72, 216]; // 증분 비늘 비용
const PERSONAL_EQUIP_KEYS = ['sword','breastplate','helmet','shield','belt','shoes'];

function calcDragonMaxHp(dragonLevel) {
    if (dragonLevel >= 1 && dragonLevel <= GUILD_DRAGON_MAX_LEVEL) return GUILD_DRAGON_BASE_HP[dragonLevel];
    return Math.round(200000 * Math.pow(2, dragonLevel - 7));
}

async function generateUniqueGuildCode() {
    for (let attempt = 0; attempt < 10; attempt++) {
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += GUILD_CODE_CHARS[Math.floor(Math.random() * GUILD_CODE_CHARS.length)];
        }
        const snap = await db.collection('guilds').where('code', '==', code).limit(1).get();
        if (snap.empty) return code;
    }
    throw new HttpsError('internal', '코드 생성에 실패했습니다.');
}

async function verifyTag(uid, tag) {
    const [saveDoc, lbDoc] = await Promise.all([
        db.collection('saves').doc(uid).get(),
        db.collection('leaderboard').doc(String(tag)).get(),
    ]);
    if (!saveDoc.exists || String(saveDoc.data().tag) !== String(tag)) {
        throw new HttpsError('permission-denied', '태그가 인증 정보와 일치하지 않습니다.');
    }
    return { ...saveDoc.data(), ...(lbDoc.exists ? lbDoc.data() : {}) };
}

// ── 레이트 리밋 (Firestore 기반, 사용자별 슬라이딩 윈도우) ─────────────────────
// rate_limits/{uid} 문서에 키별로 { count, sum, windowStart } 저장.
// maxCalls: 윈도우 내 최대 호출 수 / maxSum: 윈도우 내 sumValue 누적 상한(선택).
// rate_limits 컬렉션은 보안 규칙에 없어 클라이언트는 쓸 수 없고(기본 거부), CF만 admin으로 갱신한다.
async function enforceRateLimit(uid, key, { maxCalls, windowMs, maxSum = null, sumValue = 0 }) {
    const ref = db.collection('rate_limits').doc(uid);
    await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        const now = Date.now();
        const all = snap.exists ? snap.data() : {};
        let e = all[key];
        if (!e || now - (e.windowStart || 0) > windowMs) {
            e = { count: 0, sum: 0, windowStart: now };
        }
        e.count += 1;
        e.sum += sumValue;
        if (e.count > maxCalls || (maxSum !== null && e.sum > maxSum)) {
            throw new HttpsError('resource-exhausted', '요청이 너무 잦습니다. 잠시 후 다시 시도해주세요.');
        }
        tx.set(ref, { [key]: e }, { merge: true });
    });
}

// 레이드 대미지 일일 상한 (정상 플레이보다 훨씬 넉넉 — 무한 조작만 차단. 필요시 조정 가능)
const RAID_DMG_WINDOW_MS   = 24 * 60 * 60 * 1000; // 24시간
const RAID_DMG_MAX_CALLS   = 5000;                // 하루 최대 보고 횟수
const RAID_DMG_MAX_SUM     = 300000;              // 하루 최대 누적 대미지(클라이언트 신고 기준)

/* 길드 감사 로그 (2026-09-17). 한 길드가 흔적 없이 사라져 "무슨 일이 있었나"에 답할 수 없었다 —
   생성·가입·탈퇴·해산·추방을 guild_log 컬렉션에 남긴다. 해산 때는 문서 사본까지(복구용). 규칙상 클라이언트는 못 쓴다 */
async function guildLog(action, data) {
    try {
        await db.collection('guild_log').add({ action, at: admin.firestore.FieldValue.serverTimestamp(), ...data });
        console.log(`[guild] ${action} ${JSON.stringify(data)}`);
    } catch (e) { console.warn('[guild] log failed', e && e.message); }
}

exports.createGuild = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { name, myTag } = request.data;
    const trimmedName = (name || '').trim();
    if (trimmedName.length < 2 || trimmedName.length > 12)
        throw new HttpsError('invalid-argument', '길드 이름은 2~12자여야 합니다.');

    const userData = await verifyTag(request.auth.uid, myTag);
    if (userData.guildId) throw new HttpsError('already-exists', '이미 길드에 가입되어 있습니다.');

    const code = await generateUniqueGuildCode();
    const guildRef = db.collection('guilds').doc();
    const batch = db.batch();
    batch.set(guildRef, {
        name: trimmedName,
        code,
        leaderId: myTag,
        level: 1,
        xp: 0,
        members: [myTag],
        memberNicknames: { [myTag]: userData.nickname || '순례자' },
        pendingRequests: [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        raidDragonLevel: 1,
        raidDragonMaxHp: calcDragonMaxHp(1),
        raidDragonCurrentHp: calcDragonMaxHp(1),
        raidWeekId: getWeekId(),
        raidContributions: {},
        raidStatus: 'active'
    });
    batch.update(db.collection('leaderboard').doc(myTag), { guildId: guildRef.id });
    await batch.commit();
    await guildLog('create', { guildId: guildRef.id, name: trimmedName, tag: myTag, uid: request.auth.uid });
    return { ok: true, guildId: guildRef.id, code };
});

exports.joinGuildRequest = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { code, myTag } = request.data;
    if (!code) throw new HttpsError('invalid-argument', '코드를 입력해주세요.');

    const userData = await verifyTag(request.auth.uid, myTag);
    if (userData.guildId) throw new HttpsError('already-exists', '이미 길드에 가입되어 있습니다.');

    const guildSnap = await db.collection('guilds').where('code', '==', code.toUpperCase().trim()).limit(1).get();
    if (guildSnap.empty) throw new HttpsError('not-found', '존재하지 않는 코드입니다.');

    const guildDoc = guildSnap.docs[0];
    const guild = guildDoc.data();
    const maxMembers = GUILD_MAX_MEMBERS[guild.level] || 5;
    if (guild.members.length >= maxMembers)
        throw new HttpsError('resource-exhausted', '길드 인원이 가득 찼습니다.');

    const pending = guild.pendingRequests || [];
    const inviteEntry = pending.find(r => r.tag === myTag && r.invitedBy);
    if (inviteEntry) {
        // 초대받은 사람이 코드로 가입 시도 → 양측 의사 확인됨, 자동 수락
        const newPending = pending.filter(r => r.tag !== myTag);
        const batch = db.batch();
        batch.update(guildDoc.ref, {
            pendingRequests: newPending,
            members: admin.firestore.FieldValue.arrayUnion(myTag),
            [`memberNicknames.${myTag}`]: userData.nickname || '순례자'
        });
        batch.update(db.collection('leaderboard').doc(String(myTag)), { guildId: guildDoc.id });
        await batch.commit();
        return { ok: true, guildName: guild.name, autoAccepted: true, guildId: guildDoc.id };
    }

    if (pending.some(r => r.tag === myTag))
        throw new HttpsError('already-exists', '이미 가입 신청 중입니다.');

    await guildDoc.ref.update({
        pendingRequests: admin.firestore.FieldValue.arrayUnion({
            tag: myTag,
            nickname: userData.nickname || '순례자',
            sentAt: Date.now()
        })
    });
    return { ok: true, guildName: guild.name };
});

exports.respondJoinRequest = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { guildId, targetTag, accept, myTag } = request.data;

    await verifyTag(request.auth.uid, myTag);
    const guildRef = db.collection('guilds').doc(guildId);
    const guildDoc = await guildRef.get();
    if (!guildDoc.exists) throw new HttpsError('not-found', '길드를 찾을 수 없습니다.');

    const guild = guildDoc.data();
    if (guild.leaderId !== myTag) throw new HttpsError('permission-denied', '길드장만 처리할 수 있습니다.');

    const pending = (guild.pendingRequests || []).find(r => r.tag === targetTag);
    if (!pending) throw new HttpsError('not-found', '신청 정보를 찾을 수 없습니다.');

    const targetLbRef = db.collection('leaderboard').doc(targetTag);
    let alreadyInGuild = false;

    await db.runTransaction(async tx => {
        const guildSnap = await tx.get(guildRef);
        if (!guildSnap.exists) throw new HttpsError('not-found', '길드를 찾을 수 없습니다.');
        const g = guildSnap.data();
        const newPending = (g.pendingRequests || []).filter(r => r.tag !== targetTag);

        if (!accept) {
            tx.update(guildRef, { pendingRequests: newPending });
            return;
        }

        const maxMembers = GUILD_MAX_MEMBERS[g.level] || 5;
        if (g.members.length >= maxMembers)
            throw new HttpsError('resource-exhausted', '길드 인원이 가득 찼습니다.');

        const targetSnap = await tx.get(targetLbRef);
        if (targetSnap.exists && targetSnap.data().guildId) {
            tx.update(guildRef, { pendingRequests: newPending });
            alreadyInGuild = true;
            return;
        }

        tx.update(guildRef, {
            pendingRequests: newPending,
            members: admin.firestore.FieldValue.arrayUnion(targetTag),
            [`memberNicknames.${targetTag}`]: pending.nickname || '순례자',
        });
        tx.update(targetLbRef, { guildId });
    });

    if (alreadyInGuild) return { ok: false, msg: '이미 다른 길드에 가입한 사용자입니다.' };
    if (accept) await guildLog('join-accept', { guildId, tag: targetTag, by: myTag, uid: request.auth.uid });
    return { ok: true };
});

exports.leaveGuild = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    // auto: 기기 변경(Google 이어하기)이 부르는 자동 탈퇴. 혼자 남은 길드장이면 **해산하지 않고 그대로 둔다** (2026-09-17).
    // 태그가 그대로면 길드도 그대로 써야 하는데, 이 경로가 해산까지 해버려 황금 나팔(#NGCTUB)의 길드가 사라졌다
    const { myTag, auto } = request.data;

    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) throw new HttpsError('not-found', '가입한 길드가 없습니다.');

    const guildRef = db.collection('guilds').doc(userData.guildId);
    const guildDoc = await guildRef.get();
    if (!guildDoc.exists) {
        await db.collection('leaderboard').doc(myTag).update({ guildId: admin.firestore.FieldValue.delete() });
        return { ok: true };
    }

    const guild = guildDoc.data();
    const batch = db.batch();
    batch.update(db.collection('leaderboard').doc(myTag), { guildId: admin.firestore.FieldValue.delete() });

    let action = 'leave', extra = {};
    if (guild.leaderId === myTag) {
        if (guild.members.length <= 1) {
            if (auto) {
                await guildLog('leave-skip', { guildId: userData.guildId, name: guild.name, tag: myTag, uid: request.auth.uid, reason: 'auto-sole-leader' });
                return { ok: true, skipped: 'sole-leader' };
            }
            batch.delete(guildRef);
            action = 'dissolve';
            extra = { snapshot: guild };   // 복구용 사본 — 이름·레벨·xp·장비·레이드 상태
        } else {
            const newLeader = guild.members.find(m => m !== myTag);
            batch.update(guildRef, {
                leaderId: newLeader,
                members: admin.firestore.FieldValue.arrayRemove(myTag)
            });
            action = 'leave-transfer';
            extra = { newLeader };
        }
    } else {
        batch.update(guildRef, { members: admin.firestore.FieldValue.arrayRemove(myTag) });
    }

    await batch.commit();
    await guildLog(action, { guildId: userData.guildId, name: guild.name, tag: myTag, uid: request.auth.uid, ...extra });
    return { ok: true };
});

exports.kickGuildMember = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { targetTag, myTag } = request.data;
    if (targetTag === myTag) throw new HttpsError('invalid-argument', '자기 자신을 추방할 수 없습니다.');

    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) throw new HttpsError('not-found', '가입한 길드가 없습니다.');

    const guildRef = db.collection('guilds').doc(userData.guildId);
    const guildDoc = await guildRef.get();
    if (!guildDoc.exists) throw new HttpsError('not-found', '길드를 찾을 수 없습니다.');
    if (guildDoc.data().leaderId !== myTag) throw new HttpsError('permission-denied', '길드장만 추방할 수 있습니다.');

    const batch = db.batch();
    batch.update(guildRef, { members: admin.firestore.FieldValue.arrayRemove(targetTag) });
    batch.update(db.collection('leaderboard').doc(targetTag), { guildId: admin.firestore.FieldValue.delete() });
    await batch.commit();
    await guildLog('kick', { guildId: userData.guildId, name: guildDoc.data().name, tag: myTag, targetTag, uid: request.auth.uid });
    return { ok: true };
});

exports.inviteToGuild = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { friendTag, myTag } = request.data;

    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) throw new HttpsError('not-found', '가입한 길드가 없습니다.');

    const friends = userData.friends || [];
    if (!friends.includes(friendTag))
        throw new HttpsError('permission-denied', '친구에게만 초대를 보낼 수 있습니다.');

    const friendDoc = await db.collection('leaderboard').doc(friendTag).get();
    if (!friendDoc.exists) throw new HttpsError('not-found', '친구를 찾을 수 없습니다.');
    if (friendDoc.data().guildId) throw new HttpsError('already-exists', '이미 다른 길드에 가입해 있습니다.');

    const guildRef = db.collection('guilds').doc(userData.guildId);
    const guildDoc = await guildRef.get();
    if (!guildDoc.exists) throw new HttpsError('not-found', '길드를 찾을 수 없습니다.');

    const guild = guildDoc.data();
    if (guild.leaderId !== myTag) throw new HttpsError('permission-denied', '길드장만 초대할 수 있습니다.');
    const maxMembers = GUILD_MAX_MEMBERS[guild.level] || 5;
    if (guild.members.length >= maxMembers)
        throw new HttpsError('resource-exhausted', '길드 인원이 가득 찼습니다.');

    if ((guild.pendingRequests || []).some(r => r.tag === friendTag))
        return { ok: true, msg: '이미 초대가 발송되어 있습니다.' };

    const sentAt = Date.now();
    const batch = db.batch();
    batch.update(guildRef, {
        pendingRequests: admin.firestore.FieldValue.arrayUnion({
            tag: friendTag,
            nickname: friendDoc.data().nickname || '순례자',
            sentAt,
            invitedBy: myTag
        })
    });
    batch.update(db.collection('leaderboard').doc(String(friendTag)), {
        pendingInvites: admin.firestore.FieldValue.arrayUnion(
            { guildId: userData.guildId, guildName: guild.name, invitedBy: myTag, sentAt }
        )
    });
    await batch.commit();
    return { ok: true };
});

exports.respondInvite = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { accept, guildId, myTag } = request.data;
    if (!guildId) throw new HttpsError('invalid-argument', 'guildId가 필요합니다.');

    const userData = await verifyTag(request.auth.uid, myTag);
    const invites = userData.pendingInvites || [];
    const invite = invites.find(i => i.guildId === guildId);
    if (!invite) throw new HttpsError('not-found', '해당 초대를 찾을 수 없습니다.');

    const guildRef = db.collection('guilds').doc(guildId);
    const lbRef = db.collection('leaderboard').doc(String(myTag));
    let guildName = '';

    await db.runTransaction(async tx => {
        const lbSnap = await tx.get(lbRef);
        const guildSnap = await tx.get(guildRef);

        if (!guildSnap.exists) throw new HttpsError('not-found', '길드가 존재하지 않습니다.');
        const guild = guildSnap.data();
        guildName = guild.name;
        const currentInvites = lbSnap.exists ? (lbSnap.data().pendingInvites || []) : [];
        const newInvites = currentInvites.filter(i => i.guildId !== guildId);
        const newPending = (guild.pendingRequests || []).filter(r => r.tag !== myTag);

        if (!accept) {
            tx.update(lbRef, { pendingInvites: newInvites });
            tx.update(guildRef, { pendingRequests: newPending });
            return;
        }

        // 트랜잭션 내 최신 guildId로 중복 가입 방지
        if (lbSnap.exists && lbSnap.data().guildId)
            throw new HttpsError('already-exists', '이미 길드에 가입되어 있습니다.');

        const maxMembers = GUILD_MAX_MEMBERS[guild.level] || 5;
        if (guild.members.length >= maxMembers)
            throw new HttpsError('resource-exhausted', '길드 인원이 가득 찼습니다.');

        // 수락 시 다른 모든 초대도 일괄 제거
        tx.update(lbRef, { pendingInvites: [], guildId });
        tx.update(guildRef, {
            pendingRequests: newPending,
            members: admin.firestore.FieldValue.arrayUnion(myTag),
            [`memberNicknames.${myTag}`]: userData.nickname || '순례자',
        });
    });

    if (accept) await guildLog('join-invite', { guildId, name: guildName, tag: myTag, uid: request.auth.uid });
    return { ok: true, guildName, guildId: accept ? guildId : null };
});

exports.reportRaidDamage = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { damage, myTag } = request.data;
    if (typeof damage !== 'number' || damage <= 0 || damage > 5000)
        throw new HttpsError('invalid-argument', '유효하지 않은 대미지 값입니다.');

    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) return { ok: false };

    // 레이트 리밋: 사용자별 하루 누적 대미지/호출 상한 (무한 호출로 레이드·보상 조작 방지)
    await enforceRateLimit(request.auth.uid, 'raidDmg', {
        maxCalls: RAID_DMG_MAX_CALLS,
        windowMs: RAID_DMG_WINDOW_MS,
        maxSum: RAID_DMG_MAX_SUM,
        sumValue: damage,
    });

    const guildRef = db.collection('guilds').doc(userData.guildId);
    await db.runTransaction(async tx => {
        const doc = await tx.get(guildRef);
        if (!doc.exists) return;
        const guild = doc.data();

        const currentWeekId = getWeekId();
        const isNewWeek = guild.raidWeekId !== currentWeekId;

        const contributions = isNewWeek ? {} : (guild.raidContributions || {});
        const clearedCount = isNewWeek ? 0 : (guild.raidClearedCount || 0);
        const headClearedCount = isNewWeek ? 0 : (guild.raidHeadClearedCount || 0);
        const currentLevel = isNewWeek ? 1 : (guild.raidCurrentDragonLevel || guild.raidDragonLevel || 1);
        const currentHp = isNewWeek ? calcDragonMaxHp(1) : (guild.raidDragonCurrentHp || calcDragonMaxHp(currentLevel));
        const currentMaxHp = isNewWeek ? calcDragonMaxHp(1) : (guild.raidDragonMaxHp || calcDragonMaxHp(currentLevel));

        // 이한 검: 길드 장비 서버 측 대미지 보너스
        const guildEquip = guild.guildEquipment || {};
        const bladeBonus = GUILD_EQUIP_BLADE_BONUS[guildEquip.blade || 0] / 100;
        const adjustedDamage = Math.round(damage * (1 + bladeBonus));

        const newContribs = { ...contributions };
        newContribs[myTag] = (newContribs[myTag] || 0) + adjustedDamage;

        // 쇠사슬: 용 최대 HP 감소 적용 후 실질 HP 계산
        const chainReduction = GUILD_EQUIP_CHAIN_REDUCTION[guildEquip.chain || 0] / 100;
        const effectiveMaxHp = Math.round(currentMaxHp * (1 - chainReduction));
        const effectiveCurrentHp = Math.min(currentHp, effectiveMaxHp);

        const isHeadKill = currentLevel >= GUILD_DRAGON_HEAD_START;

        if (adjustedDamage >= effectiveCurrentHp) {
            // 용 처치 + 초과 데미지 처리
            const overflowDamage = adjustedDamage - effectiveCurrentHp;
            const newClearedCount = clearedCount + 1;
            const newHeadClearedCount = headClearedCount + (isHeadKill ? 1 : 0);
            const nextLevel = Math.min(currentLevel + 1, GUILD_DRAGON_MAX_LEVEL);
            const nextMaxHp = calcDragonMaxHp(nextLevel);
            // 다음 용에도 쇠사슬 적용 후 초과 데미지 — 연속 처치 방지(최소 1)
            const nextEffectiveMaxHp = Math.round(nextMaxHp * (1 - chainReduction));
            const nextHp = overflowDamage > 0
                ? Math.max(1, nextEffectiveMaxHp - overflowDamage)
                : nextEffectiveMaxHp;
            tx.update(guildRef, {
                raidContributions: newContribs,
                raidCurrentDragonLevel: nextLevel,
                raidDragonMaxHp: nextMaxHp,
                raidDragonCurrentHp: nextHp,
                raidClearedCount: newClearedCount,
                raidHeadClearedCount: newHeadClearedCount,
                raidStatus: 'active',
                raidWeekId: currentWeekId,
            });
        } else {
            const update = {
                raidContributions: newContribs,
                raidCurrentDragonLevel: currentLevel,
                raidDragonMaxHp: currentMaxHp,
                raidDragonCurrentHp: effectiveCurrentHp - adjustedDamage,
                raidStatus: 'active',
                raidWeekId: currentWeekId,
            };
            if (isNewWeek) update.raidHeadClearedCount = 0;
            tx.update(guildRef, update);
        }
    });
    return { ok: true };
});

// ── 길드 XP 헬퍼 ──────────────────────────────────────────────────────────────
const GUILD_ATTEND_XP = 5;
const GUILD_DONATE_XP = 1;          // 옛 기부(💎100) 한 번
const GUILD_DONATE_GEMS = 100;      // 옛 앱이 보내는 값 — 배포 직후 캐시된 앱을 위해 남긴다
const GUILD_DONATE_ONCE = 500;      // 9/30: 하루 100×5번 → 500 한 번(XP 5). 저장 단위(count)는 그대로 100 = 1
const GUILD_DONATE_MAX_DAILY = 5;
const RAID_SCALES_BY_TIER = [0, 2, 4, 6, 10, 0]; // tier 0~4 (0%/20%/40%/60%/80%+)

function calcGuildXpResult(currentLevel, currentXp, gained) {
    const XP_TABLE = [0, 300, 1000, 3000, 8000];
    let level = currentLevel;
    let xp = currentXp + gained;
    let levelUp = false;
    while (level < 5 && xp >= XP_TABLE[level]) {
        xp -= XP_TABLE[level];
        level++;
        levelUp = true;
    }
    if (level >= 5) xp = 0;
    return { level, xp, levelUp };
}

// 자정 기준 KST 날짜 (기부 등 일반 일일 초기화용)
function todayKst() {
    const kst = new Date(Date.now() + 9 * 3600000);
    return kst.toISOString().slice(0, 10);
}
// 오전 6시 기준 KST 날짜 (출석·레이드 주간 리셋용)
function today6AmKst() {
    const kst = new Date(Date.now() + 9 * 3600000);
    if (kst.getUTCHours() < 6) kst.setUTCDate(kst.getUTCDate() - 1);
    return kst.toISOString().slice(0, 10);
}

// ── 일일 출석 체크 ─────────────────────────────────────────────────────────────
exports.guildAttend = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag } = request.data;
    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) throw new HttpsError('not-found', '가입한 길드가 없습니다.');

    const today = today6AmKst();
    if (userData.lastGuildAttend === today) return { ok: true, alreadyDone: true };

    const guildRef = db.collection('guilds').doc(userData.guildId);
    const lbRef = db.collection('leaderboard').doc(String(myTag));
    let result;
    await db.runTransaction(async (tx) => {
        const guildDoc = await tx.get(guildRef);
        if (!guildDoc.exists) throw new HttpsError('not-found', '길드를 찾을 수 없습니다.');
        const { level, xp, levelUp } = calcGuildXpResult(guildDoc.data().level, guildDoc.data().xp, GUILD_ATTEND_XP);
        tx.update(guildRef, { level, xp });
        tx.update(lbRef, { lastGuildAttend: today });
        result = { level, xp, levelUp };
    });
    return { ok: true, alreadyDone: false, xpGained: GUILD_ATTEND_XP, levelUp: result.levelUp, newLevel: result.level, newXp: result.xp };
});

// ── 일일 보석 기부 ─────────────────────────────────────────────────────────────
exports.guildDonate = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag, gems } = request.data;
    if (gems !== GUILD_DONATE_GEMS && gems !== GUILD_DONATE_ONCE) throw new HttpsError('invalid-argument', '기부 금액이 올바르지 않습니다.');
    const once = gems === GUILD_DONATE_ONCE;

    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) throw new HttpsError('not-found', '가입한 길드가 없습니다.');

    const today = todayKst();
    const donateInfo = userData.guildDonateInfo || { date: '', count: 0 };
    const todayCount = donateInfo.date === today ? donateInfo.count : 0;
    if (todayCount >= GUILD_DONATE_MAX_DAILY) return { ok: true, alreadyDone: true, todayCount };

    const guildRef = db.collection('guilds').doc(userData.guildId);
    const lbRef = db.collection('leaderboard').doc(String(myTag));
    const newCount = once ? GUILD_DONATE_MAX_DAILY : todayCount + 1;   // 500은 오늘 몫을 한 번에 채운다
    const xpGain = once ? GUILD_DONATE_XP * GUILD_DONATE_MAX_DAILY : GUILD_DONATE_XP;
    let result;
    await db.runTransaction(async (tx) => {
        const guildDoc = await tx.get(guildRef);
        if (!guildDoc.exists) throw new HttpsError('not-found', '길드를 찾을 수 없습니다.');
        const { level, xp, levelUp } = calcGuildXpResult(guildDoc.data().level, guildDoc.data().xp, xpGain);
        tx.update(guildRef, { level, xp });
        tx.update(lbRef, { guildDonateInfo: { date: today, count: newCount } });
        result = { level, xp, levelUp };
    });
    return { ok: true, alreadyDone: false, xpGained: xpGain, levelUp: result.levelUp, newLevel: result.level, newXp: result.xp, todayCount: newCount };
});

// ── 레이드 보상 수령 ───────────────────────────────────────────────────────────
exports.claimRaidReward = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag } = request.data;
    const userData = await verifyTag(request.auth.uid, myTag);

    const lbRef = db.collection('leaderboard').doc(String(myTag));
    const reward = userData.pendingRaidReward || null;
    if (!reward) return { ok: false };

    const updates = { pendingRaidReward: admin.firestore.FieldValue.delete() };
    if (reward.scales)        updates.dragonScales        = admin.firestore.FieldValue.increment(reward.scales);
    if (reward.hornFragments) updates.dragonHornFragments = admin.firestore.FieldValue.increment(reward.hornFragments);
    if (reward.headSkins)     updates.dragonHeadSkins     = admin.firestore.FieldValue.increment(reward.headSkins);
    await lbRef.update(updates);
    return { ok: true, hornFragments: reward.hornFragments || 0, headSkins: reward.headSkins || 0, scales: reward.scales || 0 };
});

// ── 주간 레이드 리셋 (매주 월요일 00:00 KST) ──────────────────────────────────
exports.weeklyRaidReset = onSchedule({
    schedule: '0 6 * * 1',
    timeZone: 'Asia/Seoul',
    region: 'asia-northeast3',
}, async () => {
    const currentWeekId = getWeekId();
    const guildsSnap = await db.collection('guilds').get();
    let processed = 0, skipped = 0;
    console.log(`[weeklyRaidReset] 시작 weekId=${currentWeekId} 전체 길드=${guildsSnap.size}`);

    for (const guildDoc of guildsSnap.docs) {
        const guild = guildDoc.data();
        if (guild.raidWeekId === currentWeekId) {
            skipped++;
            console.log(`[weeklyRaidReset] 건너뜀(이미 리셋됨): ${guildDoc.id}(${guild.name}) weekId=${guild.raidWeekId}`);
            continue;
        }

        const clearedCount = guild.raidClearedCount || 0;
        const headClearedCount = guild.raidHeadClearedCount || 0;
        const maxHp = guild.raidDragonMaxHp || calcDragonMaxHp(guild.raidCurrentDragonLevel || 1);
        const currentHp = guild.raidDragonCurrentHp || maxHp;
        const hpDealtPct = maxHp > 0 ? Math.round(((maxHp - currentHp) / maxHp) * 100) : 0;

        let scalesTier = 0;
        if (hpDealtPct >= 80) scalesTier = 4;
        else if (hpDealtPct >= 60) scalesTier = 3;
        else if (hpDealtPct >= 40) scalesTier = 2;
        else if (hpDealtPct >= 20) scalesTier = 1;

        // 비늘 = 처치 수×10 + 현재 용 진행도 티어
        const guildEquip = guild.guildEquipment || {};
        const winepressBonus = GUILD_EQUIP_WINEPRESS_BONUS[guildEquip.winepress || 0];
        const judgmentBonus  = GUILD_EQUIP_JUDGMENT_BONUS[guildEquip.judgment || 0] / 100;
        const baseScales = clearedCount * 10 + RAID_SCALES_BY_TIER[scalesTier];
        const scales = Math.round((baseScales + clearedCount * winepressBonus) * (1 + judgmentBonus));
        // 뿔조각 = 전체 처치 + 머리 처치 보너스(+1), 머릿가죽 = 머리 처치
        const hornFragments = clearedCount + headClearedCount;
        const headSkins = headClearedCount;

        const members = guild.members || [];
        const batch = db.batch();

        for (const tag of members) {
            if (hornFragments > 0 || headSkins > 0 || scales > 0) {
                batch.set(db.collection('leaderboard').doc(String(tag)), {
                    pendingRaidReward: { weekId: guild.raidWeekId || '', hornFragments, headSkins, scales, scalesTier }
                }, { merge: true });
            }
        }

        // 지난주 레이드 결과 보관 (2026-09-17) — 리셋하면 기여도·처치 수가 사라져 "지난주 몇 등이었나"에 답할 수 없었다.
        // 문서 하나가 한 길드의 한 주. 순위는 읽는 쪽이 처치 수 → 진행도로 정렬해 매긴다
        batch.set(db.collection('raid_history').doc(`${guild.raidWeekId || 'unknown'}_${guildDoc.id}`), {
            weekId: guild.raidWeekId || '',
            guildId: guildDoc.id,
            name: guild.name || '',
            level: guild.level || 1,
            dragonLevel: guild.raidCurrentDragonLevel || 1,
            clearedCount, headClearedCount, hpDealtPct,
            scales, hornFragments, headSkins, scalesTier,
            members, contributions: guild.raidContributions || {},
            archivedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        batch.update(guildDoc.ref, {
            raidCurrentDragonLevel: 1,
            raidDragonMaxHp: calcDragonMaxHp(1),
            raidDragonCurrentHp: calcDragonMaxHp(1),
            raidClearedCount: 0,
            raidHeadClearedCount: 0,
            raidContributions: {},
            raidStatus: 'active',
            raidWeekId: currentWeekId,
        });

        await batch.commit();
        processed++;
        console.log(`[weeklyRaidReset] 처리 완료 ${guildDoc.id}(${guild.name}): scales=${scales} hornFragments=${hornFragments} headSkins=${headSkins} tier=${scalesTier} 멤버=${members.length}`);
    }
    console.log(`[weeklyRaidReset] 완료 weekId=${currentWeekId} 처리=${processed} 건너뜀=${skipped}`);
});

exports.buyPersonalEquipment = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { itemKey, myTag } = request.data;
    if (!PERSONAL_EQUIP_KEYS.includes(itemKey))
        throw new HttpsError('invalid-argument', '유효하지 않은 장비입니다.');

    await verifyTag(request.auth.uid, myTag);
    const lbRef = db.collection('leaderboard').doc(String(myTag));
    await db.runTransaction(async tx => {
        const doc = await tx.get(lbRef);
        if (!doc.exists) throw new HttpsError('not-found', '유저 정보를 찾을 수 없습니다.');

        const data = doc.data();
        const equip = data.personalEquipment || {};
        const currentLevel = equip[itemKey] || 0;
        if (currentLevel >= 5) throw new HttpsError('already-exists', '이미 최고 등급입니다.');

        const cost = PERSONAL_EQUIP_COST[currentLevel + 1];
        const currentScales = data.dragonScales || 0;
        if (currentScales < cost)
            throw new HttpsError('resource-exhausted', `비늘이 부족합니다. (필요: ${cost}, 보유: ${currentScales})`);

        tx.update(lbRef, {
            dragonScales: currentScales - cost,
            [`personalEquipment.${itemKey}`]: currentLevel + 1,
        });
    });
    return { ok: true };
});

exports.contributeGuildEquipment = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { itemKey, amount, myTag } = request.data;
    const validKeys = ['chain', 'blade', 'judgment', 'winepress'];
    if (!validKeys.includes(itemKey))
        throw new HttpsError('invalid-argument', '유효하지 않은 길드 장비입니다.');
    if (typeof amount !== 'number' || amount < 1 || !Number.isInteger(amount))
        throw new HttpsError('invalid-argument', '유효하지 않은 기여량입니다.');

    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) throw new HttpsError('not-found', '길드에 가입되어 있지 않습니다.');

    const guildRef = db.collection('guilds').doc(userData.guildId);
    const lbRef = db.collection('leaderboard').doc(String(myTag));

    let result = {};
    await db.runTransaction(async tx => {
        const [guildDoc, lbDoc] = await Promise.all([tx.get(guildRef), tx.get(lbRef)]);
        if (!guildDoc.exists) throw new HttpsError('not-found', '길드를 찾을 수 없습니다.');

        const guild = guildDoc.data();
        const guildEquip = guild.guildEquipment || {};
        const currentLevel = guildEquip[itemKey] || 0;
        if (currentLevel >= 5) throw new HttpsError('already-exists', '이미 최고 레벨입니다.');

        const currentHornFragments = (lbDoc.data() || {}).dragonHornFragments || 0;
        if (currentHornFragments < amount)
            throw new HttpsError('resource-exhausted', `뿔조각이 부족합니다. (필요: ${amount}, 보유: ${currentHornFragments})`);

        const fund = guild.guildEquipmentFund || {};
        const newFund = (fund[itemKey] || 0) + amount;
        const cost = GUILD_EQUIP_CLAW_COST[currentLevel + 1];

        tx.update(lbRef, { dragonHornFragments: currentHornFragments - amount });

        if (newFund >= cost) {
            // 강화 달성 — 초과분 다음 레벨 기금으로 이월
            const nextLevel = currentLevel + 1;
            tx.update(guildRef, {
                [`guildEquipment.${itemKey}`]: nextLevel,
                [`guildEquipmentFund.${itemKey}`]: newFund - cost,
            });
            result = { upgraded: true, newLevel: nextLevel, newFund: newFund - cost, newHornFragments: currentHornFragments - amount };
        } else {
            tx.update(guildRef, { [`guildEquipmentFund.${itemKey}`]: newFund });
            result = { upgraded: false, newFund, newHornFragments: currentHornFragments - amount };
        }
    });
    return result;
});

exports.renameGuild = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { newName, myTag } = request.data;
    const trimmedName = (newName || '').trim();
    const nameLen = [...trimmedName].length;
    if (nameLen < 2 || nameLen > 10)
        throw new HttpsError('invalid-argument', '길드 이름은 2~10자여야 합니다.');

    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) throw new HttpsError('not-found', '소속 길드가 없습니다.');

    const guildRef = db.collection('guilds').doc(userData.guildId);
    const guildDoc = await guildRef.get();
    if (!guildDoc.exists) throw new HttpsError('not-found', '길드를 찾을 수 없습니다.');
    const guild = guildDoc.data();

    if (guild.leaderId !== myTag) throw new HttpsError('permission-denied', '길드장만 이름을 변경할 수 있습니다.');
    if (guild.name === trimmedName) throw new HttpsError('already-exists', '현재 길드 이름과 동일합니다.');

    if (guild.lastNameChangeAt) {
        const lastChangeMs = guild.lastNameChangeAt.toMillis();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const remainMs = sevenDaysMs - (Date.now() - lastChangeMs);
        if (remainMs > 0) {
            const remainDays = Math.ceil(remainMs / 86400000);
            throw new HttpsError('resource-exhausted', `${remainDays}일 후에 다시 변경할 수 있습니다.`);
        }
    }

    const dupSnap = await db.collection('guilds').where('name', '==', trimmedName).limit(1).get();
    if (!dupSnap.empty) throw new HttpsError('already-exists', '이미 사용 중인 길드 이름입니다.');

    await guildRef.update({
        name: trimmedName,
        lastNameChangeAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { ok: true, newName: trimmedName };
});

// ── N주 전 주 ID 계산 (offsetWeeks=0: 이번 주, 1: 지난 주, ...) ──────────────
function getWeekIdOffset(offsetWeeks) {
    const kst = new Date(Date.now() - offsetWeeks * 7 * 24 * 60 * 60 * 1000 + 9 * 3600000);
    const d = new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day + 3);
    const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const firstDay = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
    const weekNumber = 1 + Math.round((d - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return `${d.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}
function getLastWeekId() { return getWeekIdOffset(1); }

// ── 대시보드 분석 데이터 ────────────────────────────────────────────────────────
exports.getAnalytics = onRequest({ cors: true }, async (req, res) => {
    try {
        const now = new Date();
        const currentWeekId = getWeekId();
        const lastWeekId    = getLastWeekId();
        const MS_7D  = 7  * 24 * 60 * 60 * 1000;
        const MS_14D = 14 * 24 * 60 * 60 * 1000;
        const cutoff7 = admin.firestore.Timestamp.fromMillis(now - MS_7D);

        // 전체 수집 후 코드에서 필터링 (복합 인덱스 불필요)
        const [allSnap, newSnap] = await Promise.all([
            db.collection('leaderboard').get(),
            db.collection('leaderboard').where('createdAt', '>=', cutoff7).get(),
        ]);

        const allData = allSnap.docs.map(d => d.data());
        const realUsers = allData.filter(d => (d.totalScore || 0) > 0);

        // 이번 주 활성 (weekId 일치 + score > 0)
        const activeData = allData.filter(d => d.weekId === currentWeekId && (d.score || 0) > 0);
        const activeThisWeek = activeData.length;

        // 재방문율: 이번 주 활성 중 지난 주도 했던 비율
        const retained = activeData.filter(d => (d.prevWeekScore || 0) > 0).length;

        // ① 이탈: 지난주엔 했는데 이번 주에 안 한 사람
        const churned = allData.filter(d => d.weekId === lastWeekId && (d.score || 0) > 0).length;

        // 지난주 활성 (이탈 + 재방문)
        const lastWeekActive = retained + churned;

        // 최근 8주 활성 추이 (weeklyHistory 기반, 오래된 순)
        const trendWeekIds = Array.from({ length: 8 }, (_, i) => getWeekIdOffset(7 - i));
        const weeklyTrend = {};
        for (const wid of trendWeekIds) weeklyTrend[wid] = 0;
        for (const d of allData) {
            if ((d.totalScore || 0) === 0) continue;
            const history = d.weeklyHistory || {};
            for (const wid of trendWeekIds) {
                if (wid === currentWeekId) {
                    if (d.weekId === currentWeekId && (d.score || 0) > 0) weeklyTrend[wid]++;
                } else {
                    if ((history[wid] || 0) > 0) weeklyTrend[wid]++;
                }
            }
        }

        // 최근 14일 일별 활성 (updatedAt 기준 버킷)
        const dailyBuckets = {};
        for (let i = 0; i < 14; i++) {
            const d = new Date(now - i * 24 * 60 * 60 * 1000);
            dailyBuckets[d.toISOString().slice(0, 10)] = 0;
        }

        // ④ 시간대별 활성 (KST 기준, 최근 14일)
        const hourBuckets = { '새벽 0-5시': 0, '오전 6-11시': 0, '오후 12-17시': 0, '저녁 18-23시': 0 };

        for (const d of allData) {
            if (!d.updatedAt || (d.totalScore || 0) === 0) continue;
            const ms = d.updatedAt.toMillis();
            if (ms < now - MS_14D) continue;
            // 일별 버킷
            const dateStr = new Date(ms).toISOString().slice(0, 10);
            if (dateStr in dailyBuckets) dailyBuckets[dateStr]++;
            // 시간대 버킷 (KST = UTC+9)
            const kstHour = new Date(ms + 9 * 3600000).getUTCHours();
            if      (kstHour < 6)  hourBuckets['새벽 0-5시']++;
            else if (kstHour < 12) hourBuckets['오전 6-11시']++;
            else if (kstHour < 18) hourBuckets['오후 12-17시']++;
            else                   hourBuckets['저녁 18-23시']++;
        }

        // 점수 구간 분포 (totalScore 기준)
        const buckets = { '1~99': 0, '100~499': 0, '500~1999': 0, '2000~9999': 0, '10000+': 0 };
        for (const d of realUsers) {
            const ts = d.totalScore || 0;
            if (ts < 100) buckets['1~99']++;
            else if (ts < 500) buckets['100~499']++;
            else if (ts < 2000) buckets['500~1999']++;
            else if (ts < 10000) buckets['2000~9999']++;
            else buckets['10000+']++;
        }

        // ⑤ 길드 참여율
        const inGuild = realUsers.filter(d => d.guildId).length;
        const guildRate = realUsers.length > 0 ? Math.round(inGuild / realUsers.length * 100) : 0;

        // ⑥ 새 콘텐츠 참여 (leaderboard 필드만으로 — saves는 7천 건이라 안 훑는다)
        //    하루 경계는 앱과 같은 오전 6시(KST): 6시간을 빼고 KST 날짜를 취한다
        const day6 = (ms) => new Date(ms + 9 * 3600000 - 6 * 3600000).toISOString().slice(0, 10);
        const today6 = day6(now.getTime()), yday6 = day6(now.getTime() - 86400000);
        const features = {
            dailyDoneToday: 0, dailyDoneYesterday: 0,   // 📅 오늘의 암송 — ✅ 오늘 암송함
            weekDoneThisWeek: 0, weekDoneLastWeek: 0,   // 📅 암송완료 (주간)
            recallThisWeek: 0, readThisWeek: 0,         // 실시간 암송왕·통독왕 참가자 (1절 이상)
            events: {},                                 // eventId → { tried, ready, total }
        };
        for (const d of allData) {
            if (d.dailyDoneDate === today6) features.dailyDoneToday++;
            else if (d.dailyDoneDate === yday6) features.dailyDoneYesterday++;
            if (d.weeklyDoneWeek === currentWeekId) features.weekDoneThisWeek++;
            else if (d.weeklyDoneWeek === lastWeekId) features.weekDoneLastWeek++;
            if (d.recallWeekId === currentWeekId && (d.recallCount || 0) > 0) features.recallThisWeek++;
            if (d.readWeekId === currentWeekId && (d.readCount || 0) > 0) features.readThisWeek++;
            if (d.eventId && (d.eventTried || 0) > 0) {
                const ev = features.events[d.eventId] || (features.events[d.eventId] = { tried: 0, ready: 0, total: d.eventTotal || 0 });
                ev.tried++;
                if ((d.eventReady || 0) >= (d.eventTotal || 0) && (d.eventTotal || 0) > 0) ev.ready++;
            }
        }

        // 상위 10명
        const top10 = realUsers
            .map(d => ({ tag: d.tag, nickname: d.nickname, totalScore: d.totalScore || 0 }))
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 10);

        res.json({
            weekId: currentWeekId,
            generatedAt: now.toISOString(),
            totalUsers: realUsers.length,
            activeThisWeek,
            newThisWeek: newSnap.size,
            retained,
            retentionRate: activeThisWeek > 0 ? Math.round(retained / activeThisWeek * 100) : 0,
            churned,
            lastWeekActive,
            weeklyTrend,
            hourDistribution: hourBuckets,
            inGuild,
            guildRate,
            dailyActive: dailyBuckets,
            scoreDistribution: buckets,
            top10,
            features,
        });
    } catch (e) {
        console.error('getAnalytics 오류:', e);
        res.status(500).json({ error: e.message });
    }
});


// ══ 생명수의 바다와 만국 (2026-09-30) — docs/새-예루살렘.md 「바다」 ══════════════════
// 모두가 함께 쓰는 바다 하나: sea/world 문서. 💎 보석은 강 어귀에서부터 물칸을 맑히고(에스겔 47:3~5 네 단계),
// 🍃 잎사귀(생명나무 열매를 먹어 얻음)는 해안의 70 나라(창 10장)를 소성한다. 나라는 바다가 차오른 단계까지만 자란다.
// 누가(어느 길드가) 무엇을 얼마나 드렸는지는 sea/world/gifts에 전부 남긴다 — 보여주는 방식은 나중에 바꿀 수 있게.
// 화면에는 단계마다 함께한 길드 이름(길드가 없으면 사람 이름)만, 같은 크기로. 양·순위는 보이지 않는다.
const SEA_CELL_COST = 200000;
const SEA_STAGES = [250, 500, 1000, 2000];   // 발목 · 무릎 · 허리 · 헤엄칠 물 (누적 칸 수)
const SEA_MAX_CELLS = 2000;
const SEA_NATIONS = 70;
const SEA_LEAF_PER_LV = 50;
const SEA_NATION_MAX_LV = 4;                 // 메마름(0) → 풀밭 → 나무 → 집·사람 → 성읍·그물(4)
const SEA_GEM_MAX_PER_CALL = 10000000;
const SEA_LEAF_MAX_PER_CALL = 200;
const SEA_FRUIT_FALL_MS = 37 * 86400000;

function seaStageIdx(c) { for (let i = 0; i < SEA_STAGES.length; i++) if (c < SEA_STAGES[i]) return i; return SEA_STAGES.length - 1; }
// 나라가 자랄 수 있는 끝 — 다 채운 바다 단계 + 1 (발목을 채우는 중이면 풀밭까지). 오염으로 칸이 줄어도 한 번 채운 단계는 그대로(clearMax)
function seaNationCap(clearMax) { return Math.min(SEA_NATION_MAX_LV, SEA_STAGES.filter(n => clearMax >= n).length + 1); }
function seaFreshWorld() {
    const nations = {};
    for (let i = 0; i < SEA_NATIONS; i++) nations[i] = { lv: 0, pool: 0, g: {} };
    return { clear: 0, clearMax: 0, pool: 0, stageG: {}, nations, totalGems: 0, totalLeaves: 0, week: { id: getWeekId(), cells: 0 }, hist: [], pollution: null };
}
// 저장본에서 번 잎사귀 — 클라이언트 _njLeaves()와 같은 셈: 달마다 max(접은 수, 남은 기록의 먹은 수)
function seaLeavesEarned(sv) {
    const fr = (sv && typeof sv.njFruits === 'object' && sv.njFruits) || {}, ar = (sv && typeof sv.njLeafArch === 'object' && sv.njLeafArch) || {};
    const months = new Set([...Object.keys(fr), ...Object.keys(ar)]);
    let n = 0;
    months.forEach(m => {
        let live = 0;
        Object.values(fr[m] || {}).forEach(f => { if (Array.isArray(f) && f[1]) live++; });
        n += Math.max(Number(ar[m]) | 0, live);
    });
    return n + ((sv && Number(sv.njGiftLeaves)) | 0);   // 🎁 나눔 열매로 받은 잎사귀 (2026-10-04, 클라이언트 _njLeaves와 같게)
}
function seaAddLabel(map, key, label) {
    const arr = Array.isArray(map[key]) ? map[key] : [];
    if (!arr.includes(label)) arr.push(label);
    map[key] = arr;
}
// 주가 바뀌었으면 지난주 맑힌 칸 수를 기록에 넘긴다 (오염량 계산용)
function seaRollWeek(w) {
    const wk = getWeekId();
    if (!w.week || w.week.id !== wk) {
        if (w.week) w.hist = [...(Array.isArray(w.hist) ? w.hist : []), w.week.cells || 0].slice(-4);
        w.week = { id: wk, cells: 0 };
    }
}

exports.seaGive = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const uid = request.auth.uid;
    const { myTag, kind, giftId } = request.data || {};
    const amount = Math.floor(Number(request.data && request.data.amount));
    const nation = Math.floor(Number(request.data && request.data.nation));
    if (kind !== 'gem' && kind !== 'leaf') throw new HttpsError('invalid-argument', '무엇을 쓸지 알 수 없어요.');
    if (!(amount > 0) || amount > (kind === 'gem' ? SEA_GEM_MAX_PER_CALL : SEA_LEAF_MAX_PER_CALL)) throw new HttpsError('invalid-argument', '양이 올바르지 않아요.');
    if (kind === 'leaf' && !(nation >= 0 && nation < SEA_NATIONS)) throw new HttpsError('invalid-argument', '나라를 알 수 없어요.');
    if (typeof giftId !== 'string' || !/^[A-Za-z0-9_-]{8,40}$/.test(giftId)) throw new HttpsError('invalid-argument', '요청 번호가 올바르지 않아요.');

    const user = await verifyTag(uid, myTag);
    await enforceRateLimit(uid, 'seaGive', { maxCalls: 120, windowMs: 3600000 });
    let guildName = '';
    if (user.guildId) {
        const gd = await db.collection('guilds').doc(String(user.guildId)).get();
        if (gd.exists) guildName = String(gd.data().name || '');
    }
    // 새길 이름 — 길드면 길드 이름, 아니면 지파 보석 + 닉네임
    const label = guildName ? `g|${guildName}` : `p|${Number.isInteger(user.tribe) ? user.tribe : ''}|${String(user.nickname || '').slice(0, 20)}`;

    const worldRef = db.collection('sea').doc('world');
    const giftRef = worldRef.collection('gifts').doc(`${uid}_${giftId}`);
    const giverRef = worldRef.collection('givers').doc(uid);
    const saveRef = db.collection('saves').doc(uid);
    let out = null;
    await db.runTransaction(async (tx) => {
        const [wSnap, gSnap, gvSnap, svSnap] = await Promise.all([tx.get(worldRef), tx.get(giftRef), tx.get(giverRef), tx.get(saveRef)]);
        const w = wSnap.exists ? wSnap.data() : seaFreshWorld();
        const gv = gvSnap.exists ? gvSnap.data() : { gems: 0, leaves: 0 };
        if (gSnap.exists) {   // 같은 요청이 두 번 온 것(재시도) — 다시 반영하지 않는다
            out = { ok: true, dup: true, used: gSnap.data().used || 0, spentLeaves: gv.leaves || 0, givenGems: gv.gems || 0 };
            return;
        }
        seaRollWeek(w);
        const now = Date.now();
        let used = 0, lvUp = null, stageUp = null;
        if (kind === 'gem') {
            // 보석은 기기가 차감한다(기초석·제트팩과 같은 신뢰 수준). 서버는 저장본 보유량만 확인한다 — 기기는 드리기 전에 저장을 올린다
            const have = Number(svSnap.exists ? svSnap.data().gems : 0) || 0;
            if (have < amount) throw new HttpsError('failed-precondition', '보석이 부족해요.');
            if (w.clear >= SEA_MAX_CELLS) throw new HttpsError('failed-precondition', '바다가 모두 되살아났어요.');
            used = amount;
            const s0 = seaStageIdx(w.clear), before = w.clearMax || 0;
            w.pool = (w.pool || 0) + amount;
            let cells = 0;
            while (w.pool >= SEA_CELL_COST && w.clear < SEA_MAX_CELLS) { w.pool -= SEA_CELL_COST; w.clear++; cells++; }
            if (w.clear >= SEA_MAX_CELLS) w.pool = 0;
            w.clearMax = Math.max(before, w.clear);
            w.week.cells = (w.week.cells || 0) + cells;
            const s1 = seaStageIdx(Math.max(0, w.clear - (cells ? 1 : 0)));
            w.stageG = w.stageG || {};
            for (let s = s0; s <= s1; s++) seaAddLabel(w.stageG, String(s), label);
            const done = SEA_STAGES.findIndex(n => before < n && w.clearMax >= n);
            if (done >= 0) stageUp = done;
            w.totalGems = (w.totalGems || 0) + amount;
        } else {
            const avail = seaLeavesEarned(svSnap.exists ? svSnap.data() : {}) - (gv.leaves || 0);
            if (avail < 1) throw new HttpsError('failed-precondition', '쓸 잎사귀가 없어요.');
            w.nations = w.nations || {};
            const n = w.nations[nation] || { lv: 0, pool: 0, g: {} };
            const cap = seaNationCap(w.clearMax || 0);
            if (n.lv >= cap) throw new HttpsError('failed-precondition', '바다가 더 차올라야 이 나라가 자랄 수 있어요.');
            used = Math.min(amount, avail, SEA_LEAF_PER_LV - (n.pool || 0));
            n.pool = (n.pool || 0) + used;
            n.g = n.g || {};
            seaAddLabel(n.g, String(n.lv), label);
            if (n.pool >= SEA_LEAF_PER_LV) { n.lv++; n.pool = 0; n.at = Object.assign({}, n.at, { [n.lv]: now }); lvUp = n.lv; }
            w.nations[nation] = n;
            w.totalLeaves = (w.totalLeaves || 0) + used;
        }
        w.updatedAt = now;
        const gvNew = { gems: (gv.gems || 0) + (kind === 'gem' ? used : 0), leaves: (gv.leaves || 0) + (kind === 'leaf' ? used : 0), updatedAt: now };
        tx.set(worldRef, w);
        tx.set(giverRef, gvNew, { merge: true });
        tx.set(giftRef, { uid, tag: String(myTag), nick: String(user.nickname || ''), tribe: Number.isInteger(user.tribe) ? user.tribe : null,
            guildId: user.guildId || null, guildName, kind, amount, used, nation: kind === 'leaf' ? nation : null,
            clearAfter: w.clear, nationLv: kind === 'leaf' ? w.nations[nation].lv : null, at: now });
        out = { ok: true, used, lvUp, stageUp, spentLeaves: gvNew.leaves, givenGems: gvNew.gems };
    });
    return out;
});

// 매주 월요일 06:00 KST — 가장 바깥의 맑은 물 일부가 다시 흐려진다.
// 양은 지난 4주 동안 한 주에 맑힌 칸 평균의 30% (최소 2칸) — 사람이 늘어도 균형이 저절로 맞는다. 한 번 채운 단계(clearMax)와 나라는 그대로
exports.seaWeekly = onSchedule({ schedule: '0 6 * * 1', timeZone: 'Asia/Seoul', region: 'asia-northeast3' }, async () => {
    const worldRef = db.collection('sea').doc('world');
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(worldRef);
        if (!snap.exists) return;
        const w = snap.data();
        const wk = getWeekId();
        if (w.pollution && w.pollution.week === wk) return;   // 이미 했다
        seaRollWeek(w);
        const hist = Array.isArray(w.hist) ? w.hist : [];
        const avg = hist.length ? hist.reduce((a, b) => a + b, 0) / hist.length : 0;
        const lost = Math.min(w.clear || 0, Math.max(2, Math.round(avg * 0.3)));
        w.clear = (w.clear || 0) - lost;
        w.pollution = { week: wk, lost, at: Date.now() };
        tx.set(worldRef, w);
        console.log(`[seaWeekly] ${wk} 흐려진 칸 ${lost} (지난 주 평균 ${avg.toFixed(1)}), 남은 맑은 칸 ${w.clear}`);
    });
});

// ══ 🧭 인도자와 동행 (2026-10-01) ══════════════════════════════════════════════════════════════════
// 먼저 시작한 친구(인도자)가 오프라인에서 초심자의 정착을 돕는다. 보상은 없고, 초심자가 졸업하면 인도자의 거룩한 성 나무에 빨간 열매.
//  guides/{tag}          — 인도자: 시험 통과 시각·졸업시킨 수(grads)·졸업 명단
//  guideLinks/{초심자tag} — 동행 하나: pending → active → graduated. 졸업한 초심자는 다시 신청할 수 없다(한 사람이 한 번)
// 졸업 = 동행 뒤 망각의 고난 한 장 통과 + 4주 연속 매주 3일 이상(동행 시작일부터 7일 묶음). 쓰기는 전부 이 함수들만(규칙 write: false).
const GUIDE_WEEK_MS = 7 * 86400000, GUIDE_GRAD_WEEKS = 4, GUIDE_WEEK_DAYS = 3, GUIDE_MEET_REQ_MS = 2 * 86400000;
const GUIDE_MAX_ACTIVE = 5;   // 한 인도자가 동시에 함께하는 초심자 — 받아만 두고 못 챙기지 않게(사용자 10/1). 졸업한 사람은 세지 않는다
async function guideActiveCount(gTag) { return (await db.collection('guideLinks').where('guide', '==', gTag).where('status', '==', 'active').get()).size; }
const _gNick = (v) => String(v || '').slice(0, 20);
// 연속으로 3일 이상인 주(묶음) 수 — 지금 묶음이 이미 3일이면 거기까지, 아니면 바로 앞 묶음까지(아직 끊긴 게 아니다)
// 기기는 묶음을 6시 날짜로 세서 서버의 시각 계산과 하루 어긋날 수 있다 → 지금 묶음과 그다음 묶음 둘 다에서 세어 큰 쪽
function guideWeeksOk(wk, since, now) {
    const run = (cur) => {
        let i = (Number(wk && wk[cur]) || 0) >= GUIDE_WEEK_DAYS ? cur : cur - 1, n = 0;
        while (i >= 0 && (Number(wk && wk[i]) || 0) >= GUIDE_WEEK_DAYS) { n++; i--; }
        return n;
    };
    const cur = Math.floor((now - since) / GUIDE_WEEK_MS);
    return Math.max(run(cur), run(cur + 1));
}
// 동행 뒤 망각의 고난을 한 장 이상 완주하고 80% 이상 맞힘 — 저장본에서 직접 본다
function guidePassedHardship(save, since) {
    const h = (save && save.hardshipMemoryClearHistory) || {};
    return Object.values(h).some(arr => (arr || []).some(e => e && e.date > since && e.total > 0 && e.correct / e.total >= 0.8));
}

exports.guidePass = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag, nick } = request.data || {};
    const u = await verifyTag(request.auth.uid, myTag);
    const ref = db.collection('guides').doc(String(myTag));
    const snap = await ref.get();
    const prev = snap.exists ? snap.data() : {};
    const passedAt = prev.passedAt || Date.now();
    await ref.set({ tag: String(myTag), nick: _gNick(nick || u.nickname), passedAt, grads: prev.grads || 0 }, { merge: true });
    return { ok: true, passedAt, grads: prev.grads || 0 };
});

exports.guideRequest = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag, guideTag, nick } = request.data || {};
    const u = await verifyTag(request.auth.uid, myTag);
    const gTag = String(guideTag || '').replace(/^#/, '').toUpperCase();
    if (!gTag || gTag === String(myTag)) return { ok: false, why: 'self' };
    await enforceRateLimit(request.auth.uid, 'guideRequest', { maxCalls: 10, windowMs: 86400000 });
    const gSnap = await db.collection('guides').doc(gTag).get();
    if (!gSnap.exists || !gSnap.data().passedAt) return { ok: false, why: 'notGuide' };
    if (await guideActiveCount(gTag) >= GUIDE_MAX_ACTIVE) return { ok: false, why: 'full' };
    const ref = db.collection('guideLinks').doc(String(myTag));
    const cur = await ref.get();
    if (cur.exists && cur.data().status !== 'pending') return { ok: false, why: cur.data().status };   // active·graduated
    const doc = { beginner: String(myTag), bNick: _gNick(nick || u.nickname), guide: gTag, gNick: _gNick(gSnap.data().nick), status: 'pending', reqAt: Date.now() };
    await ref.set(doc);
    return { ok: true, link: doc };
});

exports.guideRespond = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag, beginnerTag, accept } = request.data || {};
    await verifyTag(request.auth.uid, myTag);
    const ref = db.collection('guideLinks').doc(String(beginnerTag));
    const snap = await ref.get();
    if (!snap.exists || snap.data().guide !== String(myTag) || snap.data().status !== 'pending') return { ok: false };
    if (!accept) { await ref.delete(); return { ok: true, accepted: false }; }
    if (await guideActiveCount(String(myTag)) >= GUIDE_MAX_ACTIVE) return { ok: false, why: 'full' };
    await ref.update({ status: 'active', since: Date.now(), prog: {}, meets: [] });
    return { ok: true, accepted: true };
});

// 그만두기 — 초심자는 자기 동행을, 인도자는 beginnerTag로. 졸업한 기록은 지우지 않는다
exports.guideLeave = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag, beginnerTag } = request.data || {};
    await verifyTag(request.auth.uid, myTag);
    const ref = db.collection('guideLinks').doc(String(beginnerTag || myTag));
    const snap = await ref.get();
    if (!snap.exists) return { ok: true };
    const d = snap.data();
    if (d.status === 'graduated') return { ok: false };
    if (beginnerTag ? d.guide !== String(myTag) : d.beginner !== String(myTag)) return { ok: false };
    await ref.delete();
    return { ok: true };
});

// 초심자의 진행 — 7일 묶음별 암송한 날 수(wk) · 마지막 암송일 · 망각의 고난 통과 여부. 인도자 화면이 이것을 본다
exports.guideProgress = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag, wk, last, hard } = request.data || {};
    await verifyTag(request.auth.uid, myTag);
    const ref = db.collection('guideLinks').doc(String(myTag));
    const snap = await ref.get();
    if (!snap.exists || snap.data().status !== 'active') return { ok: false };
    const clean = {};
    Object.entries(wk || {}).slice(0, 80).forEach(([k, v]) => {
        const i = parseInt(k, 10), n = Math.max(0, Math.min(7, parseInt(v, 10) || 0));
        if (i >= 0 && i < 200) clean[i] = n;
    });
    await ref.update({ prog: { wk: clean, last: String(last || '').slice(0, 10), hard: !!hard, at: Date.now() } });
    return { ok: true };
});

// 🤝 함께한 날 — 한쪽이 누르면 요청, 다른 쪽이 이틀 안에 누르면 기록(하루 한 번)
exports.guideMeet = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag, beginnerTag } = request.data || {};
    await verifyTag(request.auth.uid, myTag);
    const ref = db.collection('guideLinks').doc(String(beginnerTag || myTag));
    let out = { ok: false };
    await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) return;
        const d = snap.data(), me = String(myTag);
        if (d.status !== 'active' || (d.guide !== me && d.beginner !== me)) return;
        const now = Date.now(), meets = Array.isArray(d.meets) ? d.meets : [], today = todayKst();
        const req = d.meetReq;
        if (req && req.by !== me && now - req.at < GUIDE_MEET_REQ_MS) {
            const already = meets.some(ts => new Date(ts + 9 * 3600000).toISOString().slice(0, 10) === today);
            const next = already ? meets : meets.concat([now]).slice(-200);
            tx.update(ref, { meets: next, meetReq: admin.firestore.FieldValue.delete() });
            out = { ok: true, recorded: true, meets: next.length };
        } else {
            tx.update(ref, { meetReq: { by: me, at: now } });
            out = { ok: true, recorded: false };
        }
    });
    return out;
});

// 졸업 — 서버가 다시 확인한다: 동행 4주 이상 · 4주 연속 주 3일(초심자 보고) · 망각의 고난(저장본에서 직접)
exports.guideGraduate = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag } = request.data || {};
    const u = await verifyTag(request.auth.uid, myTag);
    const ref = db.collection('guideLinks').doc(String(myTag));
    let out = { ok: false };
    await db.runTransaction(async tx => {
        const snap = await tx.get(ref);
        if (!snap.exists) return;
        const d = snap.data(), now = Date.now();
        if (d.status !== 'active' || !d.since) return;
        if (now - d.since < GUIDE_GRAD_WEEKS * GUIDE_WEEK_MS - 86400000) { out = { ok: false, why: 'tooSoon' }; return; }   // 하루 여유(6시 경계)
        if (guideWeeksOk((d.prog || {}).wk, d.since, now) < GUIDE_GRAD_WEEKS) { out = { ok: false, why: 'weeks' }; return; }
        if (!guidePassedHardship(u, d.since)) { out = { ok: false, why: 'hardship' }; return; }
        const gRef = db.collection('guides').doc(d.guide);
        tx.update(ref, { status: 'graduated', gradAt: now });
        tx.set(gRef, { grads: admin.firestore.FieldValue.increment(1), gradList: admin.firestore.FieldValue.arrayUnion({ tag: d.beginner, nick: d.bNick || '', at: now }) }, { merge: true });
        out = { ok: true, guide: d.guide, gNick: d.gNick || '' };
    });
    if (out.ok) console.log(`[guideGraduate] ${myTag} → 인도자 ${out.guide}`);
    return out;
});
