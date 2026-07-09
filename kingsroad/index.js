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

// ── 점수·젬 조작 방지 상한 (정상 플레이보다 훨씬 넉넉 — 무한/즉시 조작만 차단. 필요시 조정) ──
const GEM_ABS_MAX          = 100000000; // 젬 절대 상한
const GEM_DAILY_GAIN_MAX   = 300000;    // 하루 최대 젬 증가폭 (백업 파일 복원 시 보유 젬 전체가 증가폭으로 잡히므로 넉넉히)
// 한 번의 저장에서 이 값을 넘는 젬 증가는 정상 플레이로 보기 어렵다 → 복원 여부를 확인(같은 태그 기준선 조회).
// 정상 저장은 델타가 수천 이하라 이 경로를 타지 않으므로 추가 쿼리 비용이 사실상 없다.
const GEM_RESTORE_PROBE    = 20000;
const SCORE_ABS_MAX        = 20000000;  // 점수 필드 절대 상한
const SCORE_DAILY_GAIN_MAX = 100000;    // 하루 최대 점수 증가폭(yearlyScore 델타 기준)
const DAY_MS               = 24 * 60 * 60 * 1000;
// 클라이언트가 제출한 점수 저장 시 검증할 점수 필드
const SCORE_FIELDS = ['score', 'myMonthlyScore', 'totalScore', 'yearlyScore', 'prevWeekScore', 'prevMonthlyScore'];
// submitScoreSecure가 leaderboard에 쓸 수 있는 필드 화이트리스트 (재화 필드 주입 차단)
const SCORE_WRITE_WHITELIST = [
    ...SCORE_FIELDS,
    'nickname', 'castleLv', 'tribe', 'dept', 'tag',
    'weekId', 'monthId', 'prevWeekId', 'prevMonthId', 'maxHearts', 'weeklyHistory',
];

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

    // 6. 젬 하루 증가폭 상한 (무한 젬 생성 방지). 기존 문서가 없으면(첫 저장) 부트스트랩으로 통과.
    const prevSaveSnap = await db.collection("saves").doc(uid).get();
    if (prevSaveSnap.exists && typeof prevSaveSnap.data().gems === "number") {
        let gemGain = Math.max(0, newData.gems - prevSaveSnap.data().gems);

        // [백업 복원 보정] 백업 파일로 복원하면 보유 젬 전체가 증가폭으로 잡혀 상한에 걸린다.
        // (예: 새 기기의 임시 계정 젬 50 → 복원 후 28만 → 매 저장마다 차단되어 영구 복구 불가)
        // 증가폭이 비정상적으로 클 때만, 같은 태그로 서버에 이미 존재하는 세이브의 최대 젬을 기준선으로 재계산한다.
        // 서버가 과거에 인정한 잔액까지는 복원을 허용하되, 그 이상은 그대로 차단 → 조작 방어는 유지.
        // 미지정 태그('0000')는 여러 계정이 공유하므로 남의 잔액을 기준선으로 삼지 않도록 제외한다.
        const tagForLookup = String(newData.tag || "");
        if (gemGain > GEM_RESTORE_PROBE && tagForLookup && tagForLookup !== "0000") {
            const sameTagSnap = await db.collection("saves").where("tag", "==", newData.tag).get();
            let baseline = prevSaveSnap.data().gems;
            sameTagSnap.forEach(d => {
                const g = d.data().gems;
                if (typeof g === "number" && g > baseline) baseline = g;
            });
            gemGain = Math.max(0, newData.gems - baseline);
        }

        if (gemGain > 0) {
            await enforceRateLimit(uid, "gemGain", {
                maxCalls: 100000, windowMs: DAY_MS,
                maxSum: GEM_DAILY_GAIN_MAX, sumValue: gemGain,
            });
        }
    }

    // 7. 검증 통과 — 서버 타임스탬프로 덮어써서 저장
    const dataToSave = {
        ...newData,
        updatedAt: serverNow,
        savedByServer: true
    };

    try {
        await db.collection("saves").doc(uid).set(dataToSave);
    } catch (e) {
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
        if (typeof p[f] !== 'number' || !Number.isInteger(p[f]) || p[f] < 0 || p[f] > SCORE_ABS_MAX) {
            throw new HttpsError('invalid-argument', '점수 값이 유효하지 않습니다.');
        }
    }

    const lbRef = db.collection('leaderboard').doc(String(myTag));
    const oldSnap = await lbRef.get();
    const old = oldSnap.exists ? oldSnap.data() : {};

    // 하루 점수 증가폭 상한 — yearlyScore(단조 증가)의 델타 기준.
    // 서버에 기존 yearlyScore가 없으면(첫 저장·구 스키마) 부트스트랩으로 통과(절대 상한만 적용).
    if (typeof old.yearlyScore === 'number' && typeof p.yearlyScore === 'number') {
        const gain = Math.max(0, p.yearlyScore - old.yearlyScore);
        if (gain > 0) {
            await enforceRateLimit(request.auth.uid, 'scoreGain', {
                maxCalls: 100000, windowMs: DAY_MS,
                maxSum: SCORE_DAILY_GAIN_MAX, sumValue: gain,
            });
        }
    }

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
    const saveDoc = await db.collection('saves').doc(uid).get();
    if (!saveDoc.exists || String(saveDoc.data().tag) !== String(tag)) {
        throw new HttpsError('permission-denied', '태그가 인증 정보와 일치하지 않습니다.');
    }
    // leaderboard 문서에서 guildId, friends 등 부가 데이터 병합
    const lbDoc = await db.collection('leaderboard').doc(String(tag)).get();
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
    return { ok: true };
});

exports.leaveGuild = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag } = request.data;

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

    if (guild.leaderId === myTag) {
        if (guild.members.length <= 1) {
            batch.delete(guildRef);
        } else {
            const newLeader = guild.members.find(m => m !== myTag);
            batch.update(guildRef, {
                leaderId: newLeader,
                members: admin.firestore.FieldValue.arrayRemove(myTag)
            });
        }
    } else {
        batch.update(guildRef, { members: admin.firestore.FieldValue.arrayRemove(myTag) });
    }

    await batch.commit();
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
const GUILD_DONATE_XP = 1;
const GUILD_DONATE_GEMS = 100;
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
    const guildDoc = await guildRef.get();
    if (!guildDoc.exists) throw new HttpsError('not-found', '길드를 찾을 수 없습니다.');

    const { level, xp, levelUp } = calcGuildXpResult(guildDoc.data().level, guildDoc.data().xp, GUILD_ATTEND_XP);
    const batch = db.batch();
    batch.update(guildRef, { level, xp });
    batch.update(db.collection('leaderboard').doc(String(myTag)), { lastGuildAttend: today });
    await batch.commit();
    return { ok: true, alreadyDone: false, xpGained: GUILD_ATTEND_XP, levelUp, newLevel: level, newXp: xp };
});

// ── 일일 보석 기부 ─────────────────────────────────────────────────────────────
exports.guildDonate = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag, gems } = request.data;
    if (gems !== GUILD_DONATE_GEMS) throw new HttpsError('invalid-argument', '기부 금액이 올바르지 않습니다.');

    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) throw new HttpsError('not-found', '가입한 길드가 없습니다.');

    const today = todayKst();
    const donateInfo = userData.guildDonateInfo || { date: '', count: 0 };
    const todayCount = donateInfo.date === today ? donateInfo.count : 0;
    if (todayCount >= GUILD_DONATE_MAX_DAILY) return { ok: true, alreadyDone: true, todayCount };

    const guildRef = db.collection('guilds').doc(userData.guildId);
    const guildDoc = await guildRef.get();
    if (!guildDoc.exists) throw new HttpsError('not-found', '길드를 찾을 수 없습니다.');

    const { level, xp, levelUp } = calcGuildXpResult(guildDoc.data().level, guildDoc.data().xp, GUILD_DONATE_XP);
    const newCount = todayCount + 1;
    const batch = db.batch();
    batch.update(guildRef, { level, xp });
    batch.update(db.collection('leaderboard').doc(String(myTag)), { guildDonateInfo: { date: today, count: newCount } });
    await batch.commit();
    return { ok: true, alreadyDone: false, xpGained: GUILD_DONATE_XP, levelUp, newLevel: level, newXp: xp, todayCount: newCount };
});

// ── 레이드 보상 수령 ───────────────────────────────────────────────────────────
exports.claimRaidReward = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag } = request.data;
    await verifyTag(request.auth.uid, myTag);

    const lbRef = db.collection('leaderboard').doc(String(myTag));
    const lbDoc = await lbRef.get();
    const reward = lbDoc.exists ? lbDoc.data().pendingRaidReward : null;
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

    for (const guildDoc of guildsSnap.docs) {
        const guild = guildDoc.data();
        if (guild.raidWeekId === currentWeekId) continue;

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
        console.log(`[weeklyRaidReset] 길드 ${guildDoc.id}: hornFragments=${hornFragments} headSkins=${headSkins} scales=${scales} tier=${scalesTier}`);
    }
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
