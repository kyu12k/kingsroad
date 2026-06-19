const { onCall, HttpsError } = require("firebase-functions/v2/https");
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
    const doc = await db.collection('leaderboard').doc(String(tag)).get();
    if (!doc.exists || doc.data().playerId !== uid) {
        throw new HttpsError('permission-denied', '태그가 인증 정보와 일치하지 않습니다.');
    }
    return doc.data();
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
    if ((guild.pendingRequests || []).some(r => r.tag === myTag))
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
