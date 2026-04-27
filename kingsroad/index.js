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

// 저장 가능한 최대 젬 증가량 (1회 저장 요청 기준)
const MAX_GEM_INCREASE_PER_SAVE = 50000;

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

    // 6. 기존 데이터와 비교해 비정상적인 증가 감지
    const existingDoc = await db.collection("saves").doc(uid).get();

    if (existingDoc.exists) {
        const existing = existingDoc.data();

        // 젬이 비정상적으로 많이 증가한 경우 거부
        const gemDiff = newData.gems - (existing.gems || 0);
        if (gemDiff > MAX_GEM_INCREASE_PER_SAVE) {
            console.warn(`[보안] 젬 비정상 증가 감지 uid=${uid} 기존=${existing.gems} 신규=${newData.gems}`);
            throw new HttpsError("invalid-argument", `젬 증가량이 비정상적입니다. (증가: ${gemDiff})`);
        }

        // 레벨이 한 번에 2 이상 오른 경우 거부
        // 단, 기존 문서가 신규 상태(level 0)이면 기기이전으로 간주하여 건너뜀
        const existingLevel = existing.level || 0;
        const levelDiff = newData.level - existingLevel;
        if (levelDiff > 1 && existingLevel > 0) {
            console.warn(`[보안] 레벨 비정상 증가 감지 uid=${uid} 기존=${existing.level} 신규=${newData.level}`);
            throw new HttpsError("invalid-argument", `레벨 증가량이 비정상적입니다. (증가: ${levelDiff})`);
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
        throw new HttpsError("internal", `Firestore 저장 실패: ${e.message}`);
    }

    return { success: true, updatedAt: serverNow };
});
