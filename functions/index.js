const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * 시온성 커트라인 자동 조절 시스템
 * leaderboard 컬렉션에 데이터가 쓰일 때마다 실행되어 시온성 인원을 체크하고
 * 100명이 넘으면 100등의 점수를 커트라인으로 설정합니다.
 */
exports.updateZionCutoff = functions.firestore
    .document('leaderboard/{userId}')
    .onWrite(async (change, context) => {
        try {
            // 삭제된 경우는 무시
            if (!change.after.exists) {
                console.log('문서 삭제됨, 처리 안함');
                return null;
            }

            const updatedData = change.after.data();
            console.log(`📡 랭킹 업데이트 감지: ${updatedData.nickname} (점수: ${updatedData.score})`);

            // 현재 시즌 ID (예: "2026-02")
            const currentMonthId = new Date().toISOString().slice(0, 7);

            // 시온성(tier 5) 유저들만 조회하여 상위 100명 추출
            const zionSnapshot = await db.collection('leaderboard')
                .where('tier', '==', 5)
                .where('weekId', '==', currentMonthId)
                .orderBy('score', 'desc')
                .limit(100)
                .get();

            console.log(`🏰 시온성 인원: ${zionSnapshot.size}명`);

            // 100명 이상이면 100등의 점수를 커트라인으로 설정
            if (zionSnapshot.size >= 100) {
                const docs = zionSnapshot.docs;
                const cutoffScore = docs[docs.length - 1].data().score;

                // system_meta에 커트라인 저장
                await db.collection('system_meta').doc('tier_info').set({
                    zion_cutoff: cutoffScore,
                    zion_count: zionSnapshot.size,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                console.log(`✅ 시온성 커트라인 업데이트: ${cutoffScore}점 (인원: ${zionSnapshot.size}명)`);

                // 101등부터는 가나안(tier 4)으로 강등
                if (zionSnapshot.size > 100) {
                    const batch = db.batch();
                    let demotedCount = 0;

                    // 전체 시온성 인원을 다시 조회 (100명 이상)
                    const allZionSnapshot = await db.collection('leaderboard')
                        .where('tier', '==', 5)
                        .where('weekId', '==', currentMonthId)
                        .orderBy('score', 'desc')
                        .get();

                    // 101등부터 강등
                    allZionSnapshot.docs.slice(100).forEach(doc => {
                        batch.update(doc.ref, { tier: 4 });
                        demotedCount++;
                    });

                    if (demotedCount > 0) {
                        await batch.commit();
                        console.log(`⬇️ ${demotedCount}명 강등 처리 (가나안으로)`);
                    }
                }
            } else {
                // 100명 미만이면 기본 커트라인 (10,000점) 유지
                await db.collection('system_meta').doc('tier_info').set({
                    zion_cutoff: 10000,
                    zion_count: zionSnapshot.size,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                console.log(`📊 시온성 인원 부족 (${zionSnapshot.size}명), 기본 커트라인 10,000점 유지`);
            }

            return null;

        } catch (error) {
            console.error('❌ 커트라인 업데이트 실패:', error);
            return null;
        }
    });

/**
 * 매일 자정 명예의 전당 기록 생성
 * 매월 1일 00:00에 실행되어 지난달 Top 100을 history 컬렉션에 영구 보관
 */
exports.archiveMonthlyRankings = functions.pubsub
    .schedule('0 0 1 * *')  // 매월 1일 00:00 (한국시간: 0 9 1 * *)
    .timeZone('Asia/Seoul')
    .onRun(async (context) => {
        try {
            console.log('📜 월간 명예의 전당 아카이빙 시작');

            // 지난달 ID 계산 (예: "2026-01")
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthId = lastMonth.toISOString().slice(0, 7);

            console.log(`🗓️ 아카이빙 대상: ${lastMonthId}`);

            // leaderboard에서 지난달 데이터 중 상위 100명 조회
            const snapshot = await db.collection('leaderboard')
                .where('weekId', '==', lastMonthId)
                .orderBy('score', 'desc')
                .limit(100)
                .get();

            if (snapshot.empty) {
                console.log('⚠️ 아카이빙할 데이터 없음');
                return null;
            }

            // history 컬렉션에 복사
            const batch = db.batch();
            snapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                const historyDocId = `${lastMonthId}_${doc.id}`;
                const historyRef = db.collection('history').doc(historyDocId);
                
                batch.set(historyRef, {
                    ...data,
                    rank: index + 1,  // 순위 기록
                    archivedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });

            await batch.commit();
            console.log(`✅ ${snapshot.size}명 명예의 전당 등록 완료 (${lastMonthId})`);

            return null;

        } catch (error) {
            console.error('❌ 아카이빙 실패:', error);
            return null;
        }
    });

/**
 * [선택] 시온성 진입 가능 여부 확인 API
 * 클라이언트에서 호출 가능한 callable function
 */
exports.checkZionEligibility = functions.https.onCall(async (data, context) => {
    try {
        const { score } = data;

        if (!score || typeof score !== 'number') {
            throw new functions.https.HttpsError('invalid-argument', '점수가 필요합니다');
        }

        // 현재 커트라인 조회
        const tierInfoDoc = await db.collection('system_meta').doc('tier_info').get();
        const cutoff = tierInfoDoc.exists ? (tierInfoDoc.data().zion_cutoff || 10000) : 10000;
        const zionCount = tierInfoDoc.exists ? (tierInfoDoc.data().zion_count || 0) : 0;

        // 진입 가능 여부 판정
        const canEnter = score >= cutoff && zionCount < 100;

        return {
            success: true,
            canEnter,
            cutoff,
            currentCount: zionCount,
            yourScore: score,
            message: canEnter 
                ? '🎉 시온성 진입 가능합니다!' 
                : zionCount >= 100 
                    ? `현재 시온성 만원 (커트라인: ${cutoff}점)` 
                    : `커트라인 미달 (필요: ${cutoff}점)`
        };

    } catch (error) {
        console.error('❌ 시온성 자격 확인 실패:', error);
        throw new functions.https.HttpsError('internal', '서버 오류가 발생했습니다');
    }
});
