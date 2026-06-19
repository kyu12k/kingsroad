const { onCall, HttpsError } = require("firebase-functions/v2/https");
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
    if (typeof newData.gems !== "number" || newData.gems < 0) {
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
        throw new HttpsError("internal", `Firestore 저장 실패: ${e.message}`);
    }

    return { success: true, updatedAt: serverNow };
});

// ── 길드 시스템 ────────────────────────────────────────────────────────────────

function getWeekId() {
    const now = new Date();
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day + 3);
    const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    const firstDay = (firstThursday.getUTCDay() + 6) % 7;
    firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDay + 3);
    const weekNumber = 1 + Math.round((d - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return `${d.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

const GUILD_CODE_CHARS   = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const GUILD_LEVEL_XP     = [0, 300, 1000, 3000, 8000]; // index=레벨, 값=다음 레벨 필요 XP
const GUILD_MAX_MEMBERS  = [0, 5, 10, 15, 20, 25];    // index=레벨, 값=최대 인원
const GUILD_DRAGON_BASE_HP = [0, 2000, 5000, 12000, 25000, 50000, 100000, 200000];

function calcDragonMaxHp(dragonLevel) {
    if (dragonLevel >= 1 && dragonLevel <= 7) return GUILD_DRAGON_BASE_HP[dragonLevel];
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

    const newPending = (guild.pendingRequests || []).filter(r => r.tag !== targetTag);
    const batch = db.batch();
    const updateData = { pendingRequests: newPending };

    if (accept) {
        const maxMembers = GUILD_MAX_MEMBERS[guild.level] || 5;
        if (guild.members.length >= maxMembers)
            throw new HttpsError('resource-exhausted', '길드 인원이 가득 찼습니다.');
        const targetDoc = await db.collection('leaderboard').doc(targetTag).get();
        if (targetDoc.exists && targetDoc.data().guildId) {
            batch.update(guildRef, updateData);
            await batch.commit();
            return { ok: false, msg: '이미 다른 길드에 가입한 사용자입니다.' };
        }
        updateData.members = admin.firestore.FieldValue.arrayUnion(targetTag);
        updateData[`memberNicknames.${targetTag}`] = pending.nickname || '순례자';
        batch.update(db.collection('leaderboard').doc(targetTag), { guildId });
    }

    batch.update(guildRef, updateData);
    await batch.commit();
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
    const maxMembers = GUILD_MAX_MEMBERS[guild.level] || 5;
    if (guild.members.length >= maxMembers)
        throw new HttpsError('resource-exhausted', '길드 인원이 가득 찼습니다.');

    if ((guild.pendingRequests || []).some(r => r.tag === friendTag))
        return { ok: true, msg: '이미 초대가 발송되어 있습니다.' };

    await guildRef.update({
        pendingRequests: admin.firestore.FieldValue.arrayUnion({
            tag: friendTag,
            nickname: friendDoc.data().nickname || '순례자',
            sentAt: Date.now(),
            invitedBy: myTag
        })
    });
    return { ok: true };
});

exports.reportRaidDamage = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { damage, myTag } = request.data;
    if (typeof damage !== 'number' || damage <= 0 || damage > 2000)
        throw new HttpsError('invalid-argument', '유효하지 않은 대미지 값입니다.');

    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) return { ok: false };

    const guildRef = db.collection('guilds').doc(userData.guildId);
    await db.runTransaction(async tx => {
        const doc = await tx.get(guildRef);
        if (!doc.exists) return;
        const guild = doc.data();

        const currentWeekId = getWeekId();
        const isNewWeek = guild.raidWeekId !== currentWeekId;

        // 새 주차 시작 시 초기화
        const contributions = isNewWeek ? {} : (guild.raidContributions || {});
        const clearedCount = isNewWeek ? 0 : (guild.raidClearedCount || 0);
        const currentLevel = isNewWeek ? 1 : (guild.raidCurrentDragonLevel || guild.raidDragonLevel || 1);
        const currentHp = isNewWeek ? calcDragonMaxHp(1) : (guild.raidDragonCurrentHp || calcDragonMaxHp(currentLevel));
        const currentMaxHp = isNewWeek ? calcDragonMaxHp(1) : (guild.raidDragonMaxHp || calcDragonMaxHp(currentLevel));

        const newContribs = { ...contributions };
        newContribs[myTag] = (newContribs[myTag] || 0) + damage;

        const newHp = Math.max(0, currentHp - damage);

        if (newHp <= 0) {
            // 용 처치 → 다음 레벨 등장
            const newClearedCount = clearedCount + 1;
            const nextLevel = currentLevel + 1;
            const nextMaxHp = calcDragonMaxHp(nextLevel);
            tx.update(guildRef, {
                raidContributions: newContribs,
                raidCurrentDragonLevel: nextLevel,
                raidDragonMaxHp: nextMaxHp,
                raidDragonCurrentHp: nextMaxHp,
                raidClearedCount: newClearedCount,
                raidStatus: 'active',
                raidWeekId: currentWeekId,
            });
        } else {
            tx.update(guildRef, {
                raidContributions: newContribs,
                raidCurrentDragonLevel: currentLevel,
                raidDragonMaxHp: currentMaxHp,
                raidDragonCurrentHp: newHp,
                raidStatus: 'active',
                raidWeekId: currentWeekId,
            });
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

function todayKst() {
    const kst = new Date(Date.now() + 9 * 3600000);
    return kst.toISOString().slice(0, 10);
}

// ── 일일 출석 체크 ─────────────────────────────────────────────────────────────
exports.guildAttend = onCall({ cors: ALLOWED_ORIGINS }, async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    const { myTag } = request.data;
    const userData = await verifyTag(request.auth.uid, myTag);
    if (!userData.guildId) throw new HttpsError('not-found', '가입한 길드가 없습니다.');

    const today = todayKst();
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

    await lbRef.update({ pendingRaidReward: admin.firestore.FieldValue.delete() });
    return { ok: true, claws: reward.claws || 0, scales: reward.scales || 0 };
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
        const maxHp = guild.raidDragonMaxHp || calcDragonMaxHp(guild.raidCurrentDragonLevel || 1);
        const currentHp = guild.raidDragonCurrentHp || maxHp;
        const hpDealtPct = maxHp > 0 ? Math.round(((maxHp - currentHp) / maxHp) * 100) : 0;

        let scalesTier = 0;
        if (hpDealtPct >= 80) scalesTier = 4;
        else if (hpDealtPct >= 60) scalesTier = 3;
        else if (hpDealtPct >= 40) scalesTier = 2;
        else if (hpDealtPct >= 20) scalesTier = 1;

        const scales = RAID_SCALES_BY_TIER[scalesTier];
        const claws = clearedCount;
        const members = guild.members || [];
        const batch = db.batch();

        for (const tag of members) {
            if (claws > 0 || scales > 0) {
                batch.set(db.collection('leaderboard').doc(String(tag)), {
                    pendingRaidReward: { weekId: guild.raidWeekId || '', claws, scales, scalesTier }
                }, { merge: true });
            }
        }

        batch.update(guildDoc.ref, {
            raidCurrentDragonLevel: 1,
            raidDragonMaxHp: calcDragonMaxHp(1),
            raidDragonCurrentHp: calcDragonMaxHp(1),
            raidClearedCount: 0,
            raidContributions: {},
            raidStatus: 'active',
            raidWeekId: currentWeekId,
        });

        await batch.commit();
        console.log(`[weeklyRaidReset] 길드 ${guildDoc.id}: claws=${claws} scales=${scales} tier=${scalesTier}`);
    }
});
