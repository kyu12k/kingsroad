const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

const TRIBE_COUNT = 12;

function getWeekId(dateObj) {
    const d = dateObj ? new Date(dateObj) : new Date();
    d.setHours(0, 0, 0, 0);

    const day = (d.getDay() + 6) % 7; // 월=0 ... 일=6
    d.setDate(d.getDate() - day + 3); // 해당 주의 목요일

    const firstThursday = new Date(d.getFullYear(), 0, 4);
    const firstDay = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstDay + 3);

    const weekNumber = 1 + Math.round((d - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return `${d.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

function getMonthId(dateObj) {
    const d = dateObj ? new Date(dateObj) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
}

async function countQuery(query) {
    const snapshot = await query.count().get();
    return snapshot.data().count || 0;
}

async function updateWeeklyCountsImpl() {
    const currentWeekId = getWeekId();
    console.log(`📊 주간 카운트 집계 + Snapshot 생성 시작: ${currentWeekId}`);

    const baseQuery = db.collection('leaderboard').where('weekId', '==', currentWeekId);
    const totalCount = await countQuery(baseQuery);

    const tribeCounts = {};
    const cutoffTribes = {};

    // 1️⃣ 지파별 인원 수 집계 및 Snapshot 생성
    const snapshotBatch = db.batch();
    const tribeJobs = [];

    for (let i = 0; i < TRIBE_COUNT; i++) {
        const tribeQuery = baseQuery.where('tribe', '==', i);

        tribeJobs.push(
            Promise.all([
                // 인원 수 카운트
                countQuery(tribeQuery),
                // Top100 조회
                tribeQuery.orderBy('score', 'desc').limit(100).get()
            ]).then(([count, snapshot]) => {
                tribeCounts[String(i)] = count;

                // Cutoff 점수 저장
                if (!snapshot.empty && snapshot.size >= 100) {
                    cutoffTribes[String(i)] = snapshot.docs[snapshot.docs.length - 1].data().score || 0;
                } else {
                    cutoffTribes[String(i)] = 0;
                }

                // Snapshot 생성: tribe_{i} 문서에 Top100 저장
                const rankingData = snapshot.docs.map((doc, index) => {
    const row = doc.data();
    return {
        rank: index + 1,
        name: row.nickname || "이름없음",
        score: row.score || 0,
        tribe: row.tribe !== undefined ? row.tribe : 0, // 안전장치 추가!
        dept: row.dept !== undefined ? row.dept : 0,   // 안전장치 추가!
        tag: row.tag || "",
        castle: row.castleLv || 0
    };
});

                const snapshotRef = db.collection('ranking_snapshots').doc(currentWeekId)
                    .collection('tribes').doc(`tribe_${i}`);
                snapshotBatch.set(snapshotRef, {
                    weekId: currentWeekId,
                    tribeId: i,
                    ranks: rankingData,
                    count: snapshot.size,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            })
        );
    }

    await Promise.all(tribeJobs);

    // 2️⃣ Zion (전체) Top100 조회 및 Snapshot 생성
    const zionSnapshot = await baseQuery.orderBy('score', 'desc').limit(100).get();
    let cutoffTotal = 0;

    if (!zionSnapshot.empty && zionSnapshot.size >= 100) {
        cutoffTotal = zionSnapshot.docs[zionSnapshot.docs.length - 1].data().score || 0;
    }

    const zionRankingData = zionSnapshot.docs.map((doc, index) => {
    const row = doc.data();
    return {
        rank: index + 1,
        name: row.nickname || "이름없음",
        score: row.score || 0,
        tribe: row.tribe !== undefined ? row.tribe : 0, 
        dept: row.dept !== undefined ? row.dept : 0,   
        tag: row.tag || "",
        castle: row.castleLv || 0
    };
});

    const zionSnapshotRef = db.collection('ranking_snapshots').doc(currentWeekId)
        .collection('tribes').doc('zion');
    snapshotBatch.set(zionSnapshotRef, {
        weekId: currentWeekId,
        tribeId: 'zion',
        ranks: zionRankingData,
        count: zionSnapshot.size,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 3️⃣ 일괄 저장
    await snapshotBatch.commit();
    console.log(`✅ Ranking Snapshots 저장 완료 (지파 12개 + Zion 1개)`);

    // 4️⃣ 카운트 메타데이터 저장
    await db.collection('system_meta').doc('weekly_counts').set({
        weekId: currentWeekId,
        totalCount: totalCount,
        tribeCounts: tribeCounts,
        cutoffTotal: cutoffTotal,
        cutoffTribes: cutoffTribes,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log(`✅ 주간 카운트 저장 완료: total=${totalCount}`);
}

/**
 * 주간 랭킹 카운트 집계 + Snapshot 생성
 * 매시간 현재 주차의 전체/지파별 인원을 system_meta에 저장
 * 각 지파별 Top100과 Zion Top100을 ranking_snapshots에 저장 (클라이언트 읽기 용)
 */
exports.updateWeeklyCounts = functions.pubsub
    .schedule('0 0,6,12,18 * * *') // 자정, 06시, 정오, 18시
    .timeZone('Asia/Seoul')
    .onRun(async () => {
        try {
            await updateWeeklyCountsImpl();
            return null;
        } catch (error) {
            console.error('❌ 주간 카운트 집계 실패:', error);
            return null;
        }
    });

/**
 * 주간 랭킹 기록 생성
 * 매주 월요일 00:00에 지난주 Top 100을 history 컬렉션에 보관
 */
exports.archiveWeeklyRankings = functions.pubsub
    .schedule('0 0 * * 1')  // 매주 월요일 00:00
    .timeZone('Asia/Seoul')
    .onRun(async () => {
        try {
            console.log('📜 주간 랭킹 아카이빙 시작');

            const lastWeekId = getWeekId(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            console.log(`🗓️ 아카이빙 대상: ${lastWeekId}`);

            const snapshot = await db.collection('leaderboard')
                .where('weekId', '==', lastWeekId)
                .orderBy('score', 'desc')
                .limit(100)
                .get();

            if (snapshot.empty) {
                console.log('⚠️ 아카이빙할 데이터 없음');
                return null;
            }

            const batch = db.batch();
            snapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                const historyDocId = `${lastWeekId}_${doc.id}`;
                const historyRef = db.collection('weekly_history').doc(historyDocId);

                batch.set(historyRef, {
                    ...data,
                    rank: index + 1,
                    weekId: lastWeekId,
                    archivedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });

            await batch.commit();
            console.log(`✅ ${snapshot.size}명 주간 랭킹 보관 완료 (${lastWeekId})`);

            return null;
        } catch (error) {
            console.error('❌ 주간 아카이빙 실패:', error);
            return null;
        }
    });

/**
 * 월간 랭킹 기록 생성 및 Snapshot 생성
 * 매달 1일 00:00에 지난달 Top 100을 시온성 기준으로 history 컬렉션에 보관
 * 월간 명예의 전당용 snapshot도 동시 생성
 */
exports.archiveMonthlyRankings = functions.pubsub
    .schedule('0 0 1 * *')  // 매달 1일 00:00
    .timeZone('Asia/Seoul')
    .onRun(async () => {
        try {
            console.log('📜 월간 랭킹 아카이빙 시작');

            // 지난달 ID 계산
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthId = getMonthId(lastMonth);
            console.log(`🗓️ 아카이빙 대상: ${lastMonthId}`);

            // 지난달의 모든 사용자 데이터 조회 (monthId 기준)
            const snapshot = await db.collection('leaderboard')
                .where('monthId', '==', lastMonthId)
                .orderBy('myMonthlyScore', 'desc')
                .limit(100)
                .get();

            if (snapshot.empty) {
                console.log('⚠️ 월간 아카이빙할 데이터 없음');
                return null;
            }

            // 1️⃣ 월간 히스토리 저장
            const historyBatch = db.batch();
            snapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                const historyDocId = `${lastMonthId}_${doc.id}`;
                const historyRef = db.collection('monthly_history').doc(historyDocId);

                historyBatch.set(historyRef, {
                    ...data,
                    rank: index + 1,
                    monthId: lastMonthId,
                    archivedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });

            await historyBatch.commit();
            console.log(`✅ ${snapshot.size}명 월간 랭킹 보관 완료 (${lastMonthId})`);

            // 2️⃣ 월간 명예의 전당 Snapshot 생성 (Zion 기준)
            const monthlyRankingData = snapshot.docs.map((doc, index) => {
    const row = doc.data();
    return {
        rank: index + 1,
        name: row.nickname || "이름없음",
        score: row.myMonthlyScore || 0,
        tribe: row.tribe !== undefined ? row.tribe : 0,
        dept: row.dept !== undefined ? row.dept : 0,
        tag: row.tag || "",
        castle: row.castleLv || 0
    };
});

            const snapshotRef = db.collection('ranking_snapshots').doc(lastMonthId)
                .collection('hall').doc('monthly');

            await snapshotRef.set({
                monthId: lastMonthId,
                ranks: monthlyRankingData,
                count: snapshot.size,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`✅ 월간 명예의 전당 Snapshot 저장 완료 (${lastMonthId})`);

            return null;
        } catch (error) {
            console.error('❌ 월간 아카이빙 실패:', error);
            return null;
        }
    });
