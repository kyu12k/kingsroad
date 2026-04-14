const functions = require('firebase-functions/v1');
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

// tag 기준 중복 제거 (점수 내림차순 정렬 상태에서 먼저 나온 것이 높은 점수)
function deduplicateByTag(docs) {
    const seen = new Set();
    return docs.filter(doc => {
        const tag = doc.data().tag || doc.id;
        if (seen.has(tag)) return false;
        seen.add(tag);
        return true;
    });
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
                tribeQuery.where('score', '>', 0).orderBy('score', 'desc').limit(100).get()
            ]).then(([count, snapshot]) => {
                tribeCounts[String(i)] = count;

                // Cutoff 점수 저장
                if (!snapshot.empty && snapshot.size >= 100) {
                    cutoffTribes[String(i)] = snapshot.docs[snapshot.docs.length - 1].data().score || 0;
                } else {
                    cutoffTribes[String(i)] = 0;
                }

                // Snapshot 생성: tribe_{i} 문서에 Top100 저장
                const rankingData = deduplicateByTag(snapshot.docs).slice(0, 100).map((doc, index) => {
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
    const zionSnapshot = await baseQuery.where('score', '>', 0).orderBy('score', 'desc').limit(100).get();
    let cutoffTotal = 0;

    if (!zionSnapshot.empty && zionSnapshot.size >= 100) {
        cutoffTotal = zionSnapshot.docs[zionSnapshot.docs.length - 1].data().score || 0;
    }

    const zionRankingData = deduplicateByTag(zionSnapshot.docs).slice(0, 100).map((doc, index) => {
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

    // 🌟🌟🌟 [여기서부터 새로 추가되는 부분] 🌟🌟🌟
    // 3️⃣ 누적 승점(명예의 전당) Top100 조회 및 Snapshot 생성
    // 누적 승점은 주차(weekId)와 상관없이 전체 리더보드에서 'totalScore' 기준으로 가져옵니다.
    // 중복 제거 후 100명을 확보하기 위해 여유 있게 300개를 가져옵니다
    const totalSnapshot = await db.collection('leaderboard')
        .where('totalScore', '>', 0)
        .orderBy('totalScore', 'desc')
        .limit(300)
        .get();

    // 1차: 원시 데이터 변환
    const rawTotalData = totalSnapshot.docs.map(doc => {
        const row = doc.data();
        return {
            name: row.nickname || "이름없음",
            score: row.totalScore || 0,
            tribe: row.tribe !== undefined ? row.tribe : 0,
            dept: row.dept !== undefined ? row.dept : 0,
            tag: row.tag || "",
            castle: row.castleLv || 0
        };
    });

    // 2차: tag 기준 중복 제거 (같은 계정의 여러 기기 문서, 닉네임 변경 케이스 포함)
    // tag는 계정당 고유하게 발급되므로 닉네임이 달라도 같은 사람으로 처리
    const seenPlayers = new Map();
    for (const item of rawTotalData) {
        // tag가 없거나 기본값("0000")인 경우 name+score를 fallback 키로 사용
        const key = (item.tag && item.tag !== "0000") ? item.tag : `${item.name}__${item.score}`;
        if (!seenPlayers.has(key) || seenPlayers.get(key).score < item.score) {
            seenPlayers.set(key, item);
        }
    }

    // 3차: 점수 내림차순 재정렬 후 rank 부여
    const totalRankingData = [...seenPlayers.values()]
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({ ...item, rank: index + 1 }));

    // 저장 경로는 영구 보존의 느낌을 살려 'all_time/hall/total'로 만듭니다.
    const totalSnapshotRef = db.collection('ranking_snapshots').doc('all_time')
        .collection('hall').doc('total');

    snapshotBatch.set(totalSnapshotRef, {
        type: 'all_time_total',
        ranks: totalRankingData,
        count: totalSnapshot.size,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // 🌟🌟🌟 [새로 추가되는 부분 끝] 🌟🌟🌟

    // 🌟🌟🌟 [여기서부터 새로 추가할 대항전 합산 로직] 🌟🌟🌟
    console.log(`⚔️ 12지파 대항전(연간) 상위 12,000명 합산 시작...`);
    const yearlyTribeJobs = [];
    const yearlyScores = []; // 각 지파의 합산 점수를 담을 배열

    // 12개 지파를 순회하며 쿼리 실행
    for (let i = 0; i < 12; i++) {
        const tribeYearlyQuery = db.collection('leaderboard')
            .where('tribe', '==', i)
            .where('yearlyScore', '>', 0)
            .orderBy('yearlyScore', 'desc')
            .limit(12000); // 🌟 요한계시록의 14,4000명 룰 (지파당 12,000명 제한!)

        yearlyTribeJobs.push(
            tribeYearlyQuery.get().then(snapshot => {
                let tribeTotal = 0;
                snapshot.forEach(doc => {
                    tribeTotal += (doc.data().yearlyScore || 0);
                });
                yearlyScores.push({ tribeId: i, score: tribeTotal });
            })
        );
    }

    // 12지파의 점수 계산이 모두 끝날 때까지 대기
    await Promise.all(yearlyTribeJobs);

    // 점수가 높은 순서대로 내림차순 정렬
    yearlyScores.sort((a, b) => b.score - a.score);

    const yearlyRankingData = [];
    let currentRank = 1;
    let previousScore = -1;
    let actualPosition = 1; // 공동 순위를 건너뛰기 위한 실제 위치 (1, 2, 2, 4...)

    // 🌟 정교한 랭킹 시스템 적용 (동점 처리 및 0점 12등 강등)
    for (let i = 0; i < yearlyScores.length; i++) {
        const current = yearlyScores[i];

        if (current.score === 0) {
            // 점수가 0점이면 무조건 공동 12등으로 깔아버림
            currentRank = 12;
        } else if (current.score === previousScore) {
            // 이전 지파와 동점이면 등수 유지 (공동 1위, 공동 2위 등)
        } else {
            // 점수가 다르면 실제 위치로 등수 갱신
            currentRank = actualPosition;
        }

        yearlyRankingData.push({
            rank: currentRank,
            tribeId: current.tribeId,
            score: current.score
        });

        previousScore = current.score;
        actualPosition++;
    }

    // 연간 랭킹 스냅샷 문서 생성
    const currentYear = new Date().getFullYear();
    const yearlySnapshotRef = db.collection('ranking_snapshots').doc('yearly')
        .collection('tribes').doc('current');

    snapshotBatch.set(yearlySnapshotRef, {
        year: currentYear,
        ranks: yearlyRankingData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // 🌟🌟🌟 [대항전 합산 로직 끝] 🌟🌟🌟

    // 4️⃣ 일괄 저장 (원래 있던 코드)
    await snapshotBatch.commit();
    console.log(`✅ Ranking Snapshots 저장 완료 (지파 12개 + Zion + 누적 + 연간 대항전)`);

    // 5️⃣ 카운트 메타데이터 저장 (원래 4️⃣였던 부분)
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
// 순위 → 시온성 보석 환산
function calcZionGems(rank) {
    if (rank === 1)          return 500;
    if (rank <= 3)           return 300;
    if (rank <= 10)          return 200;
    if (rank <= 30)          return 120;
    return 60; // 31~100
}

// 순위 → 지파 보석 환산
function calcTribeGems(rank) {
    if (rank === 1)          return 300;
    if (rank <= 3)           return 180;
    if (rank <= 10)          return 120;
    if (rank <= 30)          return 70;
    return 30; // 31~100
}

// Firestore batch 500개 제한 안전하게 커밋
async function commitInChunks(updates) {
    const CHUNK = 500;
    for (let i = 0; i < updates.length; i += CHUNK) {
        const b = db.batch();
        updates.slice(i, i + CHUNK).forEach(({ ref, data }) => b.update(ref, data));
        await b.commit();
    }
}

exports.archiveWeeklyRankings = functions.pubsub
    .schedule('5 0 * * 1')  // 매주 월요일 00:05 (updateWeeklyCounts 00:00 완료 후)
    .timeZone('Asia/Seoul')
    .onRun(async () => {
        try {
            console.log('📜 주간 랭킹 아카이빙 시작');

            const lastWeekId = getWeekId(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            console.log(`🗓️ 아카이빙 대상: ${lastWeekId}`);

            const baseQuery = db.collection('leaderboard')
                .where('weekId', '==', lastWeekId)
                .where('score', '>', 0)
                .orderBy('score', 'desc');

            // ① 시온성(전체) Top100 (중복 포함 여유분 조회)
            const zionSnapshot = await baseQuery.limit(200).get();

            if (zionSnapshot.empty) {
                console.log('⚠️ 아카이빙할 데이터 없음');
                return null;
            }

            // tag 기준 중복 제거 후 Top100 확정
            const zionDocs = deduplicateByTag(zionSnapshot.docs).slice(0, 100);

            // ② 주간 히스토리 보관 (기존 로직)
            const archiveBatch = db.batch();
            zionDocs.forEach((doc, index) => {
                const data = doc.data();
                const historyRef = db.collection('weekly_history').doc(`${lastWeekId}_${doc.id}`);
                archiveBatch.set(historyRef, {
                    ...data,
                    rank: index + 1,
                    weekId: lastWeekId,
                    archivedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });
            await archiveBatch.commit();
            console.log(`✅ ${zionDocs.length}명 주간 랭킹 보관 완료 (${lastWeekId})`);

            // ③ 지파별 Top100 병렬 조회 (중복 포함 여유분 조회)
            const tribeJobs = [];
            for (let i = 0; i < TRIBE_COUNT; i++) {
                tribeJobs.push(
                    db.collection('leaderboard')
                        .where('weekId', '==', lastWeekId)
                        .where('tribe', '==', i)
                        .where('score', '>', 0)
                        .orderBy('score', 'desc')
                        .limit(200)
                        .get()
                );
            }
            const tribeSnapshots = await Promise.all(tribeJobs);

            // ④ 보상 계산
            // tag → reward 정보 (tag를 키로 사용해 중복 방지)
            const rewardMap = new Map();

            // 시온성 보상 (zionDocs는 이미 중복 제거 + Top100 확정)
            const zionQualified = zionDocs.length >= 100;
            zionDocs.forEach((doc, idx) => {
                const tag = doc.data().tag || doc.id;
                const rank = idx + 1;
                rewardMap.set(tag, {
                    docId: doc.data().tag || doc.id, // tag 기반 문서 ID
                    score: doc.data().score || 0,
                    zionRank: rank,
                    zionGems: zionQualified ? calcZionGems(rank) : 0,
                    zionQualified,
                    tribeRank: null,
                    tribeGems: 0,
                    tribeQualified: false
                });
            });

            // 지파 보상 병합 (지파별로 중복 제거 후 Top100 확정)
            tribeSnapshots.forEach((snapshot) => {
                const tribeDocs = deduplicateByTag(snapshot.docs).slice(0, 100);
                const tribeQualified = tribeDocs.length >= 100;
                tribeDocs.forEach((doc, idx) => {
                    const tag = doc.data().tag || doc.id;
                    const rank = idx + 1;
                    const existing = rewardMap.get(tag) || {
                        docId: tag,
                        score: doc.data().score || 0,
                        zionRank: null,
                        zionGems: 0,
                        zionQualified,
                        tribeRank: null,
                        tribeGems: 0,
                        tribeQualified: false
                    };
                    existing.tribeRank = rank;
                    existing.tribeGems = tribeQualified ? calcTribeGems(rank) : 0;
                    existing.tribeQualified = tribeQualified;
                    rewardMap.set(tag, existing);
                });
            });

            // ⑤ pendingReward 일괄 기록 (tag 기반 문서에 저장)
            const updates = [];
            rewardMap.forEach((reward) => {
                const totalGems = reward.zionGems + reward.tribeGems;
                updates.push({
                    ref: db.collection('leaderboard').doc(reward.docId),
                    data: {
                        pendingReward: {
                            weekId: lastWeekId,
                            score: reward.score,
                            zionRank: reward.zionRank,
                            zionGems: reward.zionGems,
                            zionQualified: reward.zionQualified,
                            tribeRank: reward.tribeRank,
                            tribeGems: reward.tribeGems,
                            tribeQualified: reward.tribeQualified,
                            totalGems
                        }
                    }
                });
            });

            await commitInChunks(updates);
            console.log(`🎁 ${updates.length}명에게 주간 보상 기록 완료`);

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
                .where('myMonthlyScore', '>', 0)
                .orderBy('myMonthlyScore', 'desc')
                .limit(100)
                .get();

            // 월 전환 직후 앱을 켠 유저는 monthId가 이미 새달로 바뀌어 위 쿼리에 누락될 수 있음.
            // prevMonthId 백업 필드로 보존된 데이터를 fallback으로 추가 조회.
            const fallbackSnapshot = await db.collection('leaderboard')
                .where('prevMonthId', '==', lastMonthId)
                .where('prevMonthlyScore', '>', 0)
                .orderBy('prevMonthlyScore', 'desc')
                .limit(100)
                .get();

            // 두 결과 병합 (중복 제거, 점수 높은 쪽 우선)
            const combinedMap = new Map();
            snapshot.docs.forEach(doc => {
                const d = doc.data();
                combinedMap.set(doc.id, { id: doc.id, score: d.myMonthlyScore || 0, data: d });
            });
            fallbackSnapshot.docs.forEach(doc => {
                if (!combinedMap.has(doc.id)) {
                    const d = doc.data();
                    combinedMap.set(doc.id, { id: doc.id, score: d.prevMonthlyScore || 0, data: { ...d, myMonthlyScore: d.prevMonthlyScore || 0 } });
                }
            });

            const mergedDocs = Array.from(combinedMap.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, 100);

            if (mergedDocs.length === 0) {
                console.log('⚠️ 월간 아카이빙할 데이터 없음');
                return null;
            }

            // 1️⃣ 월간 히스토리 저장
            const historyBatch = db.batch();
            mergedDocs.forEach(({ id, data }, index) => {
                const historyDocId = `${lastMonthId}_${id}`;
                const historyRef = db.collection('monthly_history').doc(historyDocId);

                historyBatch.set(historyRef, {
                    ...data,
                    rank: index + 1,
                    monthId: lastMonthId,
                    archivedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });

            await historyBatch.commit();
            console.log(`✅ ${mergedDocs.length}명 월간 랭킹 보관 완료 (${lastMonthId})`);

            // 2️⃣ 월간 명예의 전당 Snapshot 생성 (Zion 기준)
            const monthlyRankingData = mergedDocs.map(({ score, data }, index) => {
                return {
                    rank: index + 1,
                    name: data.nickname || "이름없음",
                    score: score,
                    tribe: data.tribe !== undefined ? data.tribe : 0,
                    dept: data.dept !== undefined ? data.dept : 0,
                    tag: data.tag || "",
                    castle: data.castleLv || 0
                };
            });

            const snapshotRef = db.collection('ranking_snapshots').doc(lastMonthId)
                .collection('hall').doc('monthly');

            await snapshotRef.set({
                monthId: lastMonthId,
                ranks: monthlyRankingData,
                count: mergedDocs.length,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`✅ 월간 명예의 전당 Snapshot 저장 완료 (${lastMonthId})`);

            return null;
        } catch (error) {
            console.error('❌ 월간 아카이빙 실패:', error);
            return null;
        }
    });

// ── 매일 알림 발송 (매 분 실행) ─────────────────────────────────────────────

exports.sendDailyNotifications = functions
    .region('asia-northeast3')
    .pubsub.schedule('* * * * *')
    .timeZone('Asia/Seoul')
    .onRun(async () => {
        try {
            const now = new Date();
            const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000); // UTC → KST(+9)
            const hh = String(kst.getUTCHours()).padStart(2, '0');
            const mm = String(kst.getUTCMinutes()).padStart(2, '0');
            const currentTime = `${hh}:${mm}`;

            const snap = await db.collection('leaderboard')
                .where('notificationTimes', 'array-contains', currentTime)
                .get();

            if (snap.empty) return null;

            const messages = snap.docs
                .filter(doc => doc.data().fcmToken)
                .map(doc => ({
                    token: doc.data().fcmToken,
                    data: {
                        title: '킹스로드 복습 시간',
                        body: '오늘의 복습할 말씀이 기다리고 있습니다.',
                        link: 'https://kings-road-rank.web.app'
                    }
                }));

            if (messages.length === 0) return null;

            // FCM 최대 500개씩 배치 발송
            const chunks = [];
            for (let i = 0; i < messages.length; i += 500) {
                chunks.push(messages.slice(i, i + 500));
            }
            const results = await Promise.all(chunks.map(chunk =>
                admin.messaging().sendEach(chunk)
            ));

            const totalSent = results.reduce((sum, r) => sum + r.successCount, 0);
            const totalFailed = results.reduce((sum, r) => sum + r.failureCount, 0);
            console.log(`✅ 알림 발송 완료 [${currentTime}] 성공: ${totalSent}, 실패: ${totalFailed}`);

            return null;
        } catch (error) {
            console.error('❌ 알림 발송 실패:', error);
            return null;
        }
    });

// ── 복습 알림 발송 (매 1분 실행) ──────────────────────────────────────────────
exports.sendReviewNotifications = functions
    .region('asia-northeast3')
    .pubsub.schedule('* * * * *')
    .timeZone('Asia/Seoul')
    .onRun(async () => {
        try {
            const now = admin.firestore.Timestamp.now();

            const snap = await db.collection('leaderboard')
                .where('nextReviewNotifAt', '<=', now)
                .get();

            if (snap.empty) return null;

            const messages = [];
            const clearBatch = db.batch();

            snap.docs.forEach(doc => {
                const data = doc.data();
                if (!data.fcmToken) return;

                const stageTitle = data.nextReviewStage || '말씀';
                messages.push({
                    token: data.fcmToken,
                    data: {
                        title: '킹스로드 복습 알림',
                        body: `"${stageTitle}" 복습할 시간입니다!`,
                        link: 'https://kings-road-rank.web.app'
                    }
                });

                // 발송 후 필드 삭제 (중복 발송 방지)
                clearBatch.update(doc.ref, {
                    nextReviewNotifAt: admin.firestore.FieldValue.delete(),
                    nextReviewStage: admin.firestore.FieldValue.delete()
                });
            });

            if (messages.length === 0) return null;

            // FCM 최대 500개씩 배치 발송
            const chunks = [];
            for (let i = 0; i < messages.length; i += 500) {
                chunks.push(messages.slice(i, i + 500));
            }
            const results = await Promise.all(chunks.map(chunk =>
                admin.messaging().sendEach(chunk)
            ));

            await clearBatch.commit();

            const totalSent = results.reduce((sum, r) => sum + r.successCount, 0);
            const totalFailed = results.reduce((sum, r) => sum + r.failureCount, 0);
            console.log(`✅ 복습 알림 발송 완료: 성공 ${totalSent}, 실패 ${totalFailed}`);

            return null;
        } catch (error) {
            console.error('❌ 복습 알림 발송 실패:', error);
            return null;
        }
    });

