// [추가] 망각 위험 스테이지 모달 오픈 함수
function openForgettingModal() {
    // 1. 모달 요소 가져오기
    const modal = document.getElementById('forgetting-modal');
    const listDiv = document.getElementById('forgetting-stage-list');
    if (!modal || !listDiv) return;

    // 2. 로컬스토리지에서 최신 망각 스테이지 목록 불러오기
    let forgottenStages = [];
    try {
        const data = localStorage.getItem('kingsroad_notifications');
        if (data) {
            const parsed = JSON.parse(data);
            if (parsed && Array.isArray(parsed.forgottenStages)) {
                forgottenStages = parsed.forgottenStages;
            }
        }
    } catch (e) {}

    // 3. 목록 렌더링 (복습하기 버튼 포함)
    if (forgottenStages.length === 0) {
        listDiv.innerHTML = '<div style="color:#7f8c8d; text-align:center; padding:20px 0;">망각 위험 스테이지가 없습니다.</div>';
    } else {
        // 각 스테이지명에서 id 추출 (chapter.title 매칭 실패 시 stage.title만으로도 찾기)
        listDiv.innerHTML = forgottenStages.map((s, i) => {
            let stageId = null;
            let displayTitle = null;
            if (window.gameData) {
                // 1. 기존 방식: chapter.title + ' - ' + stage.title 매칭
                for (const chapter of gameData) {
                    if (s.startsWith(chapter.title)) {
                        const stageTitle = s.replace(chapter.title + ' - ', '');
                        const found = chapter.stages && chapter.stages.find(st => st.title === stageTitle);
                        if (found) {
                            stageId = found.id;
                            displayTitle = found.title;
                            break;
                        }
                    }
                }
                // 2. 실패 시: 모든 스테이지에서 stage.title만으로 매칭
                if (!stageId) {
                    for (const chapter of gameData) {
                        const found = chapter.stages && chapter.stages.find(st => st.title === s || st.title === s.replace(/.* - /, ''));
                        if (found) {
                            stageId = found.id;
                            displayTitle = found.title;
                            break;
                        }
                    }
                }
            }
            // 버튼: stageId가 있으면 활성화, 없으면 비활성화
            const btnHtml = stageId
                ? `<button style=\"margin-left:10px; padding:4px 12px; border-radius:12px; background:#f1c40f; color:#2c3e50; border:none; font-size:0.95em; cursor:pointer;\" onclick=\"startQuickReviewFromModal('${stageId}')\">복습하기</button>`
                : `<button style=\"margin-left:10px; padding:4px 12px; border-radius:12px; background:#ccc; color:#888; border:none; font-size:0.95em; cursor:not-allowed;\" disabled>복습 불가</button>`;
            // 스테이지 타이틀만 표시 (displayTitle가 없으면 s에서 마지막 '-' 이후만 추출)
            let titleToShow = displayTitle;
            if (!titleToShow) {
                const parts = s.split('-');
                titleToShow = parts.length > 1 ? parts.slice(1).join('-').trim() : s;
            }
            return `<div style=\"padding:8px 0; border-bottom:1px solid #eee; font-size:1rem; display:flex; align-items:center;\">${i+1}. ${titleToShow}${btnHtml}</div>`;
        }).join('');
    }

    // 4. 모달 표시
    modal.style.display = 'flex';
}

// [추가] 복습 모달에서 복습하기 버튼 클릭 시 빠른 복습 시작
function startQuickReviewFromModal(stageId) {
    closeForgettingModal();
    // 빠른 복습(스마트/전체/복습 모드 등)으로 연결: openStageSheet 등 활용
    // stageId로 해당 챕터 데이터 찾기
    if (!window.gameData) return;
    let chapterData = null;
    for (const ch of gameData) {
        if (ch.stages && ch.stages.find(st => st.id === stageId)) {
            chapterData = ch;
            break;
        }
    }
    if (chapterData) {
        // openStageSheet로 스테이지 시트 열고, 해당 스테이지 자동 선택
        openStageSheet(chapterData);
        setTimeout(() => {
            // 스테이지 버튼 클릭 시와 동일하게 동작하도록 트리거
            const itemList = document.querySelectorAll('.stage-item');
            for (const item of itemList) {
                if (item && item.onclick && item.innerText.includes(stageId.split('-').pop())) {
                    item.onclick();
                    break;
                }
            }
        }, 300);
    }
}

// [추가] 망각 위험 스테이지 모달 닫기 함수
function closeForgettingModal() {
    const modal = document.getElementById('forgetting-modal');
    if (modal) modal.style.display = 'none';
}
// [정식 배포] 게임 버전 정보
const GAME_VERSION = "1.0.0"; // 정식 배포 버전

// [시스템: 경제 및 인벤토리]
let myGems = 0;           // 현재 보유 보석
let myNickname = "순례자";
let myTag = "";
let myPlayerId = "";

/* [수정] 체력 변수 분리 (충돌 방지용) */
let purchasedMaxHearts = 5; // 상점에서 구매한 순수 체력 (이걸 저장합니다)
let maxPlayerHearts = 5;    // 버프가 포함된 실제 게임 체력

let inventory = {
    lifeBread: 0,  // 생명의 떡 개수
};

// [시스템: 게임 진행 데이터]
let stageMastery = {}; // ID별 클리어 횟수 저장
let stageLastClear = {}; // ID별 마지막 클리어 시간 (타임스탬프)
let stageNextEligibleTime = {}; // 다음 클리어 가능 시간 (forgetting-curve)
let stageTimedBonus = {}; // 망각 주기 기반 보너스 (때를 따른 양식)

/* ============================================= */

/* (주의) saveGameData의 통합 구현은 아래의 선언부(function saveGameData)에서 관리합니다. */
// 2. 게임 불러오기 (데이터가 없어도 에러 안 나게 방어)
loadGameData = function() {
    const savedString = localStorage.getItem('kingsRoadSave');
    
    if (!savedString) {
        console.log("📂 저장된 데이터 없음: 신규 시작");
        lastClaimTime = Date.now(); 
        return;
    }

    try {
        const parsed = JSON.parse(savedString);

        // ★ [정식 배포] 버전 체크: 구버전이거나 버전 정보가 없으면 초기화
        if (!parsed.version || parsed.version !== GAME_VERSION) {
            console.log(`🔄 게임 버전 업데이트 감지 (${parsed.version || '구버전'} → ${GAME_VERSION})`);
            console.log("📦 데이터를 초기화합니다...");
            localStorage.removeItem('kingsRoadSave');
            alert(`🎉 King's Road v${GAME_VERSION} 정식 버전에 오신 것을 환영합니다!\n\n새로운 시작을 위해 게임 데이터가 초기화되었습니다.`);
            lastClaimTime = Date.now();
            return;
        }

        // [기본 복구]
        myCastleLevel = parsed.level || 0;
        myGems = parsed.gems || 0;
        inventory = parsed.inv || { lifeBread: 0 };
        if (inventory) {
            if (typeof inventory.lifeBread === 'undefined' && typeof inventory.potion !== 'undefined') {
                inventory.lifeBread = inventory.potion;
                delete inventory.potion;
            }
            if (typeof inventory.lifeBread === 'undefined') inventory.lifeBread = 0;
        }
        purchasedMaxHearts = parsed.maxHearts || 5;
        myNickname = parsed.nickname || "순례자";
        myTribe = (parsed.tribe !== undefined) ? parsed.tribe : 0;
        myDept = (parsed.dept !== undefined) ? parsed.dept : 0;
        myTag = parsed.tag || "0000";
        myPlayerId = parsed.playerId || "";

        // [진행도 복구]
        stageLastClear = parsed.lastClear || {};
        stageMastery = parsed.mastery || {};
        stageMemoryLevels = parsed.memoryLevels || {};
        stageNextEligibleTime = parsed.nextEligibleTime || {}; // ★ [Forgetting-Curve] 다음 클리어 가능 시간
        stageTimedBonus = parsed.timedBonus || {}; // ★ [때를 따른 양식] 망각 주기 기반 보너스
        // stageDailyAttempts 제거됨 (초회/반복만 구분)
        if(parsed.leagueData) leagueData = parsed.leagueData;
        if(parsed.missions) missionData = parsed.missions;
        if(parsed.boosterData) boosterData = parsed.boosterData;

        // 미션 데이터 구조 보정 (구버전 호환)
        if (!missionData) missionData = {};
        if (!missionData.daily) missionData.daily = {};
        if (!missionData.weekly) missionData.weekly = {};
        if (!Array.isArray(missionData.daily.claimed)) missionData.daily.claimed = [false, false, false];
        if (!Array.isArray(missionData.weekly.claimed)) missionData.weekly.claimed = [false, false, false];

        if (typeof missionData.daily.newClear !== 'number') missionData.daily.newClear = 0;
        if (typeof missionData.daily.differentStages !== 'number') missionData.daily.differentStages = 0;
        if (typeof missionData.daily.checkpointBoss !== 'number') missionData.daily.checkpointBoss = 0;

        if (typeof missionData.weekly.attendance !== 'number') missionData.weekly.attendance = 0;
        if (!Array.isArray(missionData.weekly.attendanceLog)) missionData.weekly.attendanceLog = [];
        if (typeof missionData.weekly.dragonKill !== 'number') missionData.weekly.dragonKill = 0;
        if (typeof missionData.weekly.stageClear !== 'number') missionData.weekly.stageClear = 0;

        // [★ 핵심 복구: 업적 및 통계]
        // 저장된 업적 기록이 있으면 덮어쓰고, 없으면 기존(0) 유지
        if (parsed.achievementStatus) {
            achievementStatus = parsed.achievementStatus;
        }
        
        // 통계 데이터 복구 (별도 키 'stats' 또는 'kingsRoad_stats' 모두 체크)
        if (parsed.stats) {
            Object.assign(userStats, parsed.stats);
        } else {
            const oldStats = localStorage.getItem("kingsRoad_stats");
            if (oldStats) Object.assign(userStats, JSON.parse(oldStats));
        }

        // [기타]
        if (parsed.lastClaimTime) lastClaimTime = parsed.lastClaimTime;
        else { lastClaimTime = Date.now(); saveGameData(); }

        if (parsed.lastPlayed) localStorage.setItem('lastPlayedDate', parsed.lastPlayed);
        if (parsed.streak) localStorage.setItem('streakDays', parsed.streak);

        // [게임 로직 반영]
        // 1. 스테이지 클리어 상태 시각화
        gameData.forEach(chapter => {
            chapter.stages.forEach(stage => {
                if (stageMastery[stage.id] > 0) {
                    stage.cleared = true;
                } else {
                    stage.cleared = false;
                }
                stage.locked = false; 
            });
        });

        // 2. 부스터 시간 체크
        if (boosterData && boosterData.active) {
            if (Date.now() < boosterData.endTime) {
                if(typeof startBoosterTimer === 'function') startBoosterTimer(); 
            } else {
                boosterData.active = false;
                boosterData.multiplier = 1;
            }
        }

        // 3. UI 갱신
        if(typeof updateGemDisplay === 'function') updateGemDisplay();
        if(typeof updateProfileUI === 'function') updateProfileUI();
        if(typeof updateCastleView === 'function') updateCastleView();
        if(typeof recalculateMaxHearts === 'function') recalculateMaxHearts();
        
        console.log("📂 데이터 불러오기 성공");

    } catch (e) {
        console.error("데이터 로드 실패:", e);
        lastClaimTime = Date.now(); 
    }
};

/* [시스템] 업적 달성 대기열 (전투 중 방해 금지용) */
var milestoneQueue = []; 
var isMilestoneShowing = false;

/* [시스템] 유저 통계 데이터 (기록실용) */
var userStats = {
    loginDays: 0,           // 누적 접속일
    lastLoginDate: "",      // 마지막 접속 날짜
    totalVersesCleared: 0,  // 누적 구절 클리어
    totalBossKilled: 0,     // 보스/중간점검 처치
    totalGemsEarned: 0,     // 누적 획득 보석
    totalScoreEarned: 0,    // 누적 획득 승점
    totalPerfects: 0,       // 퍼펙트 횟수
    maxCastleLevel: 0,      // 성전 최고 레벨
    earlyBirdCounts: 0,     // 새벽 암송 횟수
    accountCreatedAt: 0,    // 계정 생성 시각 (timestamp)
    totalPlaySeconds: 0,    // 누적 플레이타임 (초)
    dailyPlaySeconds: {}    // 일별 플레이타임 (YYYY-MM-DD: seconds)
};

let playSessionStart = null;

function ensurePlaytimeStats() {
    if (!userStats.accountCreatedAt) userStats.accountCreatedAt = Date.now();
    if (typeof userStats.totalPlaySeconds !== 'number') userStats.totalPlaySeconds = 0;
    if (!userStats.dailyPlaySeconds || typeof userStats.dailyPlaySeconds !== 'object') userStats.dailyPlaySeconds = {};
    if (typeof userStats.totalScoreEarned !== 'number') userStats.totalScoreEarned = 0;
}

function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function addPlaytimeRange(startMs, endMs) {
    if (!startMs || !endMs || endMs <= startMs) return;
    let cursor = startMs;
    while (cursor < endMs) {
        const currentDate = new Date(cursor);
        const nextDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
        const chunkEnd = Math.min(endMs, nextDay.getTime());
        const seconds = Math.floor((chunkEnd - cursor) / 1000);
        const key = getDateKey(currentDate);
        userStats.dailyPlaySeconds[key] = (userStats.dailyPlaySeconds[key] || 0) + seconds;
        userStats.totalPlaySeconds += seconds;
        cursor = chunkEnd;
    }
}

function startPlaySession() {
    if (playSessionStart) return;
    playSessionStart = Date.now();
}

function stopPlaySession() {
    if (!playSessionStart) return;
    const end = Date.now();
    addPlaytimeRange(playSessionStart, end);
    playSessionStart = null;
    saveGameData();
}

function formatDuration(totalSeconds) {
    if (!totalSeconds || totalSeconds <= 0) return "0m";
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function getStageClearCounts() {
    let normal = 0;
    let bossMid = 0;
    const keys = Object.keys(stageMastery || {});
    keys.forEach((id) => {
        if (!stageMastery[id]) return;
        if (id.includes('boss') || id.includes('mid')) {
            bossMid += 1;
            return;
        }
        if (/^\d+-\d+$/.test(id)) normal += 1;
    });
    return { normal, bossMid };
}

function getTotalMemoryLevel() {
    let total = 0;
    Object.keys(stageMemoryLevels || {}).forEach((id) => {
        if (id.includes('boss')) return;
        const value = stageMemoryLevels[id] || 0;
        total += value;
    });
    return total;
}

function getAverageDailySecondsLast7Days() {
    if (!userStats.accountCreatedAt) return 0;
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    const startWindow = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const startDate = new Date(userStats.accountCreatedAt);
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const start = startDay > startWindow ? startDay : startWindow;
    if (yesterday < start) return 0;

    let total = 0;
    const dayCount = Math.floor((yesterday - start) / 86400000) + 1;
    const daily = userStats.dailyPlaySeconds || {};
    Object.keys(daily).forEach((key) => {
        if (key >= getDateKey(start) && key <= getDateKey(yesterday)) {
            total += daily[key];
        }
    });

    return dayCount > 0 ? Math.floor(total / dayCount) : 0;
}

function getTotalPlaySecondsNow() {
    const base = (userStats && typeof userStats.totalPlaySeconds === 'number') ? userStats.totalPlaySeconds : 0;
    if (playSessionStart) {
        const extra = Math.floor((Date.now() - playSessionStart) / 1000);
        return base + Math.max(0, extra);
    }
    return base;
}

/* [시스템] 통계 업데이트 매니저 (업적 감지 기능 추가됨) */
function updateStats(type, value = 1) {
    if (typeof userStats === 'undefined') return;

    let isChanged = false;

    // 1. 통계 수치 증가 로직 (기존과 동일)
    // ... (기존 switch문 로직 그대로 유지하거나 아래처럼 간단히 작성) ...
    
    // (편의를 위해 기존 로직을 포함하여 작성합니다)
    switch (type) {
        case 'login':
            const now = new Date();
            const today = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate();
            if (userStats.lastLoginDate !== today) {
                userStats.loginDays++;
                userStats.lastLoginDate = today;
                isChanged = true;
            }
            break;
        case 'verse_clear': userStats.totalVersesCleared += value; isChanged = true; break;
        case 'boss_kill': userStats.totalBossKilled += value; isChanged = true; break;
        case 'gem_get': userStats.totalGemsEarned += value; isChanged = true; break;
        case 'perfect': userStats.totalPerfects += value; isChanged = true; break;
        case 'castle_levelup': 
            if (value > userStats.maxCastleLevel) { userStats.maxCastleLevel = value; isChanged = true; }
            break;
        case 'earlybird': userStats.earlyBirdCounts += value; isChanged = true; break; // earlybird 케이스 추가 필요
    }
    
    // 새벽 시간(04~07시) 체크 로직은 verse_clear 안에 있던 것 유지 필요
    if (type === 'verse_clear') {
        const h = new Date().getHours();
        if (h >= 4 && h < 7) {
             updateStats('earlybird', 1); // 재귀 호출로 처리
             return; // 재귀 호출 후 아래 로직 중복 실행 방지
        }
    }

    if (isChanged) {
        saveGameData();
        // ★ [핵심] 수치가 변했으니 업적 달성했는지 체크!
        checkAchievementUnlock(type);
    }
}

// [보조] 업적 달성 체크 함수
function checkAchievementUnlock(statType) {
    // achievementStatus와 ACHIEVEMENT_DATA를 사용하여 체크
    // statType 매핑 (통계 키 -> 업적 키)
    // (주의: updateStats의 type과 ACHIEVEMENT_DATA의 키가 약간 다를 수 있음)
    let achKey = statType;
    if (statType === 'gem_get') achKey = 'gem';
    if (statType === 'verse_clear') achKey = 'verse';
    if (statType === 'boss_kill') achKey = 'boss';
    if (statType === 'castle_levelup') achKey = 'castle';
    if (statType === 'earlybird') achKey = 'earlybird';

    const achData = ACHIEVEMENT_DATA[achKey];
    if (!achData) return;

    // 현재 완료된 단계 (예: 0단계 완료)
    const currentTier = achievementStatus[achKey] || 0;
    
    // 다음 목표 단계가 있는지 확인
    if (currentTier < achData.tiers.length) {
        const targetValue = achData.tiers[currentTier];
        
        // 내 현재 수치 확인
        const statsMap = {
            login: 'loginDays', verse: 'totalVersesCleared', boss: 'totalBossKilled',
            gem: 'totalGemsEarned', perfect: 'totalPerfects', castle: 'maxCastleLevel', earlybird: 'earlyBirdCounts'
        };
        const myVal = userStats[statsMap[achKey]];

        // ★ [목표 달성!] 
        // 큐에 이미 같은 보상이 들어있는지 확인 (중복 팝업 방지)
        const alreadyInQueue = milestoneQueue.some(q => q.key === achKey && q.tier === currentTier);

        if (myVal >= targetValue && !alreadyInQueue) {
            // 대기열에 추가!
            milestoneQueue.push({
                key: achKey,
                tier: currentTier,
                data: achData
            });
            console.log(`🎉 업적 달성 감지: ${achData.title} (Lv.${currentTier + 1})`);
            
            // 전투 중이 아니면 바로 보여주기 시도
            tryShowMilestone();
        }
    }
}

/* [시스템: 망각 곡선 및 기억 레벨 설정] */
// 레벨별 복습 주기 (Lv.0 -> 1일, Lv.1 -> 3일, Lv.2 -> 7일...)
const FORGETTING_CURVE = [1, 3, 7, 14, 30]; 

// 각 스테이지의 기억 레벨을 저장할 객체 (예: { "1-1": 2, "1-2": 0 })
let stageMemoryLevels = {};

/* [시스템] 업적(기록실) 데이터 설정 */
const ACHIEVEMENT_DATA = {
    // 1. 🕯️ 누적 출석 (login)
    login: {
        title: "누적 출석 달성",
        desc: "성실함이 곧 능력입니다.",
        tiers: [3, 7, 14, 30, 50, 100, 365], 
        rewards: [100, 300, 500, 1000, 2000, 3000, 5000]
    },
    // 2. 📖 구절 암송 (verse)
    verse: {
        title: "누적 구절 암송",
        desc: "일반 훈련(1절)을 완료한 횟수입니다.",
        tiers: [10, 50, 100, 300, 500, 1000, 3000],
        rewards: [100, 300, 500, 1000, 1500, 3000, 5000]
    },
    // 3. 🏆 승리자 (boss)
    boss: {
        title: "중간·보스 승리",
        desc: "실전 테스트를 통과한 횟수입니다.",
        tiers: [1, 5, 10, 30, 50, 100, 200],
        rewards: [200, 500, 1000, 2000, 3000, 5000, 10000]
    },
    // 4. 💎 부자 (gem)
    gem: {
        title: "누적 획득 보석",
        desc: "지금까지 모은 보석의 총합입니다.",
        tiers: [1000, 5000, 10000, 30000, 50000, 100000, 300000],
        rewards: [100, 300, 500, 1000, 2000, 3000, 5000] 
    },
    // 5. ✨ 완벽주의 (perfect)
    perfect: {
        title: "오타 없는 암송",
        desc: "실수 없이(퍼펙트) 클리어한 횟수입니다.",
        tiers: [1, 10, 30, 50, 100, 300, 500],
        rewards: [100, 300, 500, 1000, 2000, 3000, 5000]
    },
    // 6. 🏰 성전 건축 (castle)
    castle: {
        title: "성전 건축 단계",
        desc: "나의 성전 레벨 도달 기록입니다.",
        tiers: [2, 3, 5, 7, 9, 10, 11], 
        rewards: [200, 400, 800, 1500, 2500, 4000, 10000]
    },
    // 7. 🌅 얼리버드 (earlybird)
    earlybird: {
        title: "새벽 암송 달성",
        desc: "새벽(04~07시)에 훈련한 횟수입니다.",
        tiers: [1, 3, 7, 14, 21, 40, 100],
        rewards: [100, 300, 500, 1000, 2000, 3000, 5000]
    }
};

/* [시스템] 업적 보상 수령 기록 (각 항목별로 몇 단계까지 받았는지 저장) */
var achievementStatus = {
    login: 0,
    verse: 0,
    boss: 0,
    gem: 0,
    perfect: 0,
    castle: 0,
    earlybird: 0
};

// [시스템] 영문+숫자 혼합 4자리 태그 생성 함수 (167만 가지 조합)
function generateRandomTag() {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/* =========================================
   [시스템: 미션 관리 (일일/주간 통합)]
   ========================================= */
// 미션 데이터 초기화 (구조 변경됨)
let missionData = {
    lastLoginDate: "",      // 일일 초기화용
    weekId: "",             // 주간 초기화용 (예: "2024-W05")
    
    // 일일 미션 진행도
    daily: {
        newClear: 0,        // 신규 훈련 횟수
        differentStages: 0, // 서로 다른 스테이지 클리어 횟수
        checkpointBoss: 0,  // 중보/보스 처치 횟수
        claimed: [false, false, false] // 보상 수령 여부
    },
    
    // 주간 미션 진행도
    weekly: {
        attendance: 0,      // 주간 출석 일수
        attendanceLog: [],  // 이번 주 출석한 날짜들 ["Mon", "Tue"...] (중복 방지용)
        dragonKill: 0,      // 용/중보/보스 처치 횟수
        stageClear: 0,      // 스테이지 15개 완료 횟수
        claimed: [false, false, false]
    }
};

/* [시스템: 미션 상태 확인 및 초기화] */
function checkMissions() {
    const today = new Date().toDateString(); // "Mon Jan 01 2024"
    const currentWeekId = getWeekId();       // 주차 계산 함수 필요
    let lastMissionDate = localStorage.getItem('lastMissionCheckDate');
    
    // 1. 일일 미션 초기화 (날짜가 바뀌었으면)
    if (missionData.lastLoginDate !== today) {
        missionData.lastLoginDate = today;
        missionData.daily = {
            newClear: 0,
            differentStages: 0,
            checkpointBoss: 0,
            claimed: [false, false, false]
        };
        console.log("📅 새로운 하루가 시작되어 일일 미션이 초기화되었습니다.");
        
        // 날짜 변경 시 초기화 (stageDailyAttempts 제거)
        
        // ★ [보상 지급] 전에 예약된 '다음 날' 보상이 있다면 지금 지급
        if (boosterData.nextLoginReward) {
            const reward = boosterData.nextLoginReward;
            activateBooster(reward.multi, reward.min);
            alert(`🎁 지난 미션 보상으로\n[승점 ${reward.multi}배 ${reward.min}분]이 도착했습니다!`);
            boosterData.nextLoginReward = null; // 지급 완료 후 삭제
            saveGameData();
        }
        
        // 주간 출석 체크 (하루에 한 번만)
        updateWeeklyAttendance(today, currentWeekId);
    }

    // 2. 주간 미션 초기화 (주차가 바뀌었으면: 월요일 기준)
    if (missionData.weekId !== currentWeekId) {
        missionData.weekId = currentWeekId;
        missionData.weekly = {
            attendance: 1,          // 월요일 첫 접속이므로 1일 출석
            attendanceLog: [today], // 오늘 날짜 기록
            dragonKill: 0,
            stageClear: 0,
            claimed: [false, false, false]
        };
        console.log("📅 새로운 주가 시작되어 주간 미션이 초기화되었습니다.");
    }
    
    updateMissionUI();
}

// [보조] 주간 출석 체크 로직 (버그 수정됨)
function updateWeeklyAttendance(today, currentWeek) {
    // 주차가 맞는지 확인
    if (missionData.weekId === currentWeek) {
        // 이미 출석한 날짜인지 기록부(Log)에서 확인
        if (!missionData.weekly.attendanceLog.includes(today)) {
            missionData.weekly.attendanceLog.push(today); // 오늘 날짜 도장 쾅
            missionData.weekly.attendance++;              // 출석 일수 +1
            saveGameData();
        }
    }
}

/* [시스템: 미션 진행도 업데이트 (핵심 기능)] */
// type: 'new'(신규), 'review'(복습), 'dragon'(용)
function updateMissionProgress(type, extraData) {
    if (type === 'training') type = 'new';
    if (type === 'dragonKill') type = 'dragon';
    if (type === 'review') return;

    // 모든 도감이 열렸는지 체크 (하루 1회만 인정)
    let allOpened = true;
    for (let ch = 1; ch <= 22; ch++) {
        if (bibleData[ch]) {
            for (let idx = 0; idx < bibleData[ch].length; idx++) {
                const sId = `${ch}-${idx + 1}`;
                if (!(stageMastery[sId] && stageMastery[sId] >= 1)) {
                    allOpened = false;
                    break;
                }
            }
            if (!allOpened) break;
        }
    }

    // 오늘 날짜
    const today = new Date().toISOString().split('T')[0];

    // 1. 일일 미션: 신규 훈련 or 모든 도감 오픈 시 아무 스테이지든 1회
    if (type === 'new') {
        if (allOpened) {
            if (missionData.daily.anyStageClearDate !== today) {
                missionData.daily.anyStageClearDate = today;
                missionData.daily.newClear = 1; // 하루 1회만 인정
            }
        } else {
            missionData.daily.newClear++;
        }
    }
    // 2. 일일 미션: 다양성 (오늘 처음 클리어하는 스테이지)
    else if (type === 'differentStage') {
        missionData.daily.differentStages = (missionData.daily.differentStages || 0) + 1;
    }
    // 3. 일일 미션: 중보/보스 처치
    else if (type === 'checkpointBoss') {
        missionData.daily.checkpointBoss = (missionData.daily.checkpointBoss || 0) + 1;
    }
    // 4. 주간 미션: 중보/보스 처치 (용 사냥)
    else if (type === 'dragon') {
        missionData.weekly.dragonKill++;
    }

    // 5. 스테이지 클리어 총수 (일반 스테이지에서만)
    if (type === 'new') {
        missionData.weekly.stageClear++;
    }

    saveGameData(); 
    updateMissionUI();
}

/* [시스템: 미션 UI 표시 (화면 그리기)] */
function updateMissionUI() {
    const list = document.getElementById('mission-list');
    if (!list) return; // 미션 화면이 없으면 중단
    
    list.innerHTML = ""; // 기존 목록 초기화

    // ============================================
    // 1. 일일 미션 정의 (신규훈련, 다양성, 중보/보스)
    // ============================================
    const dailyMissions = [
        { 
            desc: "새로운 훈련 1회 완료",
            current: missionData.daily.newClear, 
            target: 1, 
            rewardText: "💎 보석 100개",
            rewardType: "gem",
            val1: 100, val2: 0,
            claimed: missionData.daily.claimed[0],
            index: 0,
            type: 'daily'
        },
        { 
            desc: "서로 다른 스테이지 3개 클리어",
            current: missionData.daily.differentStages, 
            target: 3, 
            rewardText: "💎 보석 300개",
            rewardType: "gem",
            val1: 300, val2: 0,
            claimed: missionData.daily.claimed[1],
            index: 1,
            type: 'daily'
        },
        { 
            desc: "중보/보스 처치 1회", 
            current: missionData.daily.checkpointBoss, 
            target: 1, 
            rewardText: "💎 보석 500개",
            rewardType: "gem",
            val1: 500, val2: 0,
            claimed: missionData.daily.claimed[2],
            index: 2,
            type: 'daily'
        }
    ];

    // ============================================
    // 2. 주간 미션 정의 (중보/보스 5회로 증가)
    // ============================================
    const weeklyMissions = [
        { 
            desc: "주 5일 출석하기", 
            current: missionData.weekly.attendance, 
            target: 5, 
            rewardText: "💎 보석 1,000개", 
            rewardType: "gem",
            val1: 1000, val2: 0,
            claimed: missionData.weekly.claimed[0],
            index: 0,
            type: 'weekly'
        },
        { 
            desc: "중보/보스 처치 5회", 
            current: missionData.weekly.dragonKill, 
            target: 5, 
            rewardText: "💎 보석 3,000개", 
            rewardType: "gem",
            val1: 3000, val2: 0,
            claimed: missionData.weekly.claimed[1],
            index: 1,
            type: 'weekly'
        },
        { 
            desc: "스테이지 15회 완료",
            current: missionData.weekly.stageClear, 
            target: 15, 
            rewardText: "💎 보석 2,000개", 
            rewardType: "gem",
            val1: 2000, val2: 0,
            claimed: missionData.weekly.claimed[2],
            index: 2,
            type: 'weekly'
        }
    ];

    // ----------------------------------------------------
    // 3. HTML 생성 및 추가 (통합 렌더링)
    // ----------------------------------------------------
    // 일일 미션 제목
    const dailyTitle = document.createElement('div');
    dailyTitle.innerHTML = `<h3 style="margin:10px 0 5px; color:#f1c40f;">☀️ 일일 미션</h3>`;
    list.appendChild(dailyTitle);

    dailyMissions.forEach(m => createMissionElement(list, m));

    // 주간 미션 제목
    const weeklyTitle = document.createElement('div');
    weeklyTitle.innerHTML = `<h3 style="margin:20px 0 5px; color:#e67e22;">🏆 주간 미션</h3>`;
    list.appendChild(weeklyTitle);

    weeklyMissions.forEach(m => createMissionElement(list, m));
}

// [보조] 미션 항목 HTML 만들기
function createMissionElement(parent, m) {
    const item = document.createElement('div');
    item.className = 'mission-item';
    // 스타일: 아이템 박스
    item.style.background = "rgba(255,255,255,0.05)";
    item.style.marginBottom = "8px";
    item.style.padding = "10px";
    item.style.borderRadius = "8px";
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";

    const isCompleted = m.current >= m.target;
    let btnHtml = "";
    
    // 버튼 상태 결정
    if (m.claimed) {
        btnHtml = `<button style="background:#7f8c8d; color:#bdc3c7; border:none; padding:5px 10px; border-radius:5px;" disabled>완료됨</button>`;
    } else if (isCompleted) {
        // 완료했으나 아직 안 받음 -> 클릭 가능
        // onclick에 claimReward 함수 연결 (인자 전달을 위해 익명함수 사용 불가피할 때도 있지만, 여기선 ID로 처리하거나 아래처럼 직접 할당)
        btnHtml = `<button id="btn-${m.type}-${m.index}" class="btn-claim-active" style="background:#e74c3c; color:white; border:none; padding:5px 10px; border-radius:5px; cursor:pointer; font-weight:bold; animation: pulse 1s infinite;">보상 받기</button>`;
    } else {
        btnHtml = `<button style="background:transparent; color:#7f8c8d; border:1px solid #7f8c8d; padding:5px 10px; border-radius:5px;" disabled>${m.current}/${m.target}</button>`;
    }

    item.innerHTML = `
        <div class="mission-info">
            <div style="font-weight:bold; font-size:0.95rem;">${m.desc}</div>
            <div style="font-size:0.8rem; color:#f39c12; margin-top:3px;">🎁 ${m.rewardText}</div>
        </div>
        ${btnHtml}
    `;
    parent.appendChild(item);

    // 버튼에 클릭 이벤트 연결 (문자열로 넣으면 따옴표 문제가 생기므로 JS로 연결)
    if (isCompleted && !m.claimed) {
        const btn = document.getElementById(`btn-${m.type}-${m.index}`);
        if (btn) {
            btn.onclick = function() {
                claimReward(m.type, m.index, m.rewardType, m.val1, m.val2);
            };
        }
    }
}

/* [시스템: 보상 수령 처리 함수] */
function claimReward(type, index, rewardType, value1, value2) {
    // 1. 중복 수령 방지
    let isAlreadyClaimed = (type === 'daily') ? missionData.daily.claimed[index] : missionData.weekly.claimed[index];
    if (isAlreadyClaimed) return;

    // 2. 수령 상태 저장
    if (type === 'daily') {
        missionData.daily.claimed[index] = true;
    } else {
        missionData.weekly.claimed[index] = true;
    }

    // 3. 보상 실제 지급 로직
    if (rewardType === 'gem') {
        // 보석 지급
        myGems += value1;
        updateGemDisplay(); // 상단 보석 UI 갱신 함수
        alert(`💎 보석 ${value1}개를 받았습니다!`);
        // playSound('coin'); // 효과음이 있다면 주석 해제
    } 
    else if (rewardType === 'xp_boost') {
        // 즉시 승점 부스터 발동
        activateBooster(value1, value2); // (배율, 분)
    } 
    else if (rewardType === 'next_day_xp') {
        // 내일 보상 예약
        boosterData.nextLoginReward = { multi: value1, min: value2 };
        alert(`✅ 예약 완료!\n내일 접속 시 [승점 ${value1}배 ${value2}분] 부스터가 자동 적용됩니다.`);
    }

    // 4. 저장 및 화면 갱신
    saveGameData();
    updateNotificationBadges();
    // ✅ [수정됨] 현재 보고 있는 탭의 화면을 다시 그립니다.
    if (typeof renderMissionList === 'function') {
        renderMissionList(currentMissionTab); 
    } else {
        updateMissionUI(); // 혹시 모를 상황을 대비한 예비 코드
    }
}

/* =========================================
   [시스템: 사운드 효과 (Web Audio API)]
   용량 0KB로 효과음을 생성하는 신디사이저입니다.
   ========================================= */
const SoundEffect = {
    ctx: new (window.AudioContext || window.webkitAudioContext)(),
    
    // ★ [수정] 저장된 설정이 'true'이면 음소거(true), 아니면 기본값 해제(false)
    isMuted: localStorage.getItem('setting_sfx_mute') === 'true',

    toggleMute: function() {
        this.isMuted = !this.isMuted;
        
        // ★ [추가] 변경된 설정을 저장합니다.
        localStorage.setItem('setting_sfx_mute', this.isMuted);
        
        return this.isMuted;
    },

    // 소리 재생의 기초 함수
    playTone: function(freq, type, duration, vol = 0.1) {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type; // sine, square, sawtooth, triangle
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // 1. 블록 선택/클릭 소리 (틱!)
    playClick: function() {
        this.playTone(800, 'sine', 0.05, 0.05);
    },

    // 2. 정답 소리 (딩동댕!)
    playCorrect: function() {
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        
        // 도-미-솔 (화음 느낌)
        this.createOsc(523.25, 'sine', now, 0.1); // C5
        this.createOsc(659.25, 'sine', now + 0.1, 0.1); // E5
        this.createOsc(783.99, 'sine', now + 0.2, 0.2); // G5
    },
    
    // 내부용 오실레이터 생성기
    createOsc: function(freq, type, time, dur) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
    },

    // 3. 오답 소리 (삐-! 둔탁하게)
    playWrong: function() {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sawtooth'; // 톱니파 (거친 소리)
        osc.frequency.setValueAtTime(150, this.ctx.currentTime); // 낮은음
        osc.frequency.linearRampToValueAtTime(100, this.ctx.currentTime + 0.3); // 더 낮아짐
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    },

    // 4. 공격 소리 (슈우웅-쾅!)
    playAttack: function() {
        if (this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15); // 급격히 떨어짐
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    },

    // 5. 클리어 팡파레 (빠바밤!)
    playClear: function() {
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        // 멜로디
        this.createOsc(523.25, 'square', now, 0.1);       // C5
        this.createOsc(523.25, 'square', now + 0.15, 0.1); // C5
        this.createOsc(523.25, 'square', now + 0.30, 0.1); // C5
        this.createOsc(659.25, 'square', now + 0.45, 0.4); // E5 (길게)
    },
// 6. 레벨업/퍼펙트 효과음 (띠로리링~)
    playLevelUp: function() {
        if (this.isMuted) return;
        const now = this.ctx.currentTime;
        this.createOsc(523.25, 'sine', now, 0.1); // 도
        this.createOsc(659.25, 'sine', now + 0.1, 0.1); // 미
        this.createOsc(783.99, 'sine', now + 0.2, 0.1); // 솔
        this.createOsc(1046.50, 'sine', now + 0.3, 0.4); // 높은 도
    },

    // 7. 보석 획득 소리 (칭!)
    playGetGem: function() {
        if (this.isMuted) return;
        this.playTone(1200, 'sine', 0.1, 0.1);
    }
};

/* [시스템: 배경 음악 (Soft Flowing - 물 흐르듯 부드럽게)] */
const BackgroundMusic = {
    audioCtx: null,
    isPlaying: false,
    timerID: null,
    noteIndex: 0,

    // 중음역대 위주의 따뜻한 음색
    notes: {
        'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25
    },

    // ★ 튀지 않는 부드러운 멜로디
    // 특징: 음 길이(l)가 대기 시간(d)보다 깁니다. (잔향이 계속 남음)
    melody: [
        /* === Part 1: 잔잔한 도입 === */
        {n:'E4', l:1.5, d:800}, {n:'G4', l:1.5, d:800}, {n:'C5', l:2.0, d:1200},
        {n:'B4', l:1.5, d:800}, {n:'A4', l:1.5, d:800}, {n:'G4', l:2.0, d:1200},
        
        {n:'F4', l:1.5, d:800}, {n:'A4', l:1.5, d:800}, {n:'G4', l:1.5, d:800}, {n:'E4', l:1.5, d:800},
        {n:'D4', l:1.5, d:800}, {n:'E4', l:1.5, d:800}, {n:'G4', l:2.0, d:1600},

        /* === Part 2: 평온한 흐름 === */
        {n:'C4', l:1.5, d:800}, {n:'E4', l:1.5, d:800}, {n:'G4', l:1.5, d:800}, {n:'C5', l:2.0, d:1200},
        {n:'D5', l:1.5, d:800}, {n:'C5', l:1.5, d:800}, {n:'B4', l:1.5, d:800}, {n:'A4', l:2.0, d:1200},

        {n:'G4', l:1.5, d:800}, {n:'C5', l:1.5, d:800}, {n:'E5', l:2.0, d:1200},
        {n:'D5', l:1.5, d:800}, {n:'C5', l:1.5, d:800}, {n:'B4', l:1.5, d:800}, {n:'C5', l:3.0, d:2000},

        /* === Part 3: 낮은 음의 여운 (반복 전 휴식) === */
        {n:'G3', l:2.0, d:1000}, {n:'C4', l:2.0, d:1000}, {n:'E4', l:2.0, d:1000}, 
        {n:'D4', l:2.5, d:1500}, {n:'C4', l:3.0, d:2000}
    ],

    init: function() {
        if (!this.audioCtx) {
            this.audioCtx = SoundEffect.ctx; 
        }
    },

    start: function() {
        if (this.isPlaying) return;
        this.init();
        this.isPlaying = true;
        this.noteIndex = 0; 
        this.playNextNote();
    },

    stop: function() {
        this.isPlaying = false;
        if (this.timerID) clearTimeout(this.timerID);
    },

    toggle: function() {
        if (this.isPlaying) this.stop();
        else this.start();
        return this.isPlaying;
    },

    playNextNote: function() {
        if (!this.isPlaying) return;

        const noteData = this.melody[this.noteIndex];
        const freq = this.notes[noteData.n];

        if (freq) this.playPianoTone(freq, noteData.l);

        this.noteIndex = (this.noteIndex + 1) % this.melody.length;
        this.timerID = setTimeout(() => this.playNextNote(), noteData.d);
    },

    playPianoTone: function(freq, duration) {


        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        // Sine파: 가장 둥글고 부드러운 소리
        osc.type = 'sine'; 
        osc.frequency.value = freq;

        const maxVol = 0.12; 

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        const now = this.audioCtx.currentTime;

        // ★ [핵심] 튀는 소리 제거를 위한 Envelope 설정
        
        // 1. Attack (소리 시작): 0.2초 동안 아주 천천히 볼륨이 올라갑니다.
        // (이전 버전의 0.05초보다 4배 느림 -> "땅!" 소리가 사라짐)
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(maxVol, now + 0.2); 
        
        // 2. Sustain (유지): 소리가 급격히 줄지 않고 오랫동안 은은하게 울립니다.
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    }
};

/* [시스템] 12지파 설정 데이터 (보석 이름 복구 완료) */
const TRIBE_DATA = [
    { id: 0, name: "요한", core: "#57E3B6", glow: "#009651", gem: "녹보석" },
    { id: 1, name: "베드로", core: "#8FE3FF", glow: "#00a0e9", gem: "벽옥" },
    { id: 2, name: "부산야고보", core: "#A5A9FF", glow: "#1d2088", gem: "남보석" },
    { id: 3, name: "안드레", core: "#C4F6FF", glow: "#59c3e1", gem: "옥수" },
    { id: 4, name: "다대오", core: "#FFB085", glow: "#eb6120", gem: "홍마노" },
    { id: 5, name: "빌립", core: "#FF8EB9", glow: "#d7005b", gem: "홍보석" },
    { id: 6, name: "시몬", core: "#FFF59D", glow: "#fdd000", gem: "황옥" },
    { id: 7, name: "바돌로매", core: "#C2F0E0", glow: "#86cab6", gem: "녹옥" },
    { id: 8, name: "마태", core: "#FFE082", glow: "#e39300", gem: "담황옥" },
    { id: 9, name: "맛디아", core: "#B4F080", glow: "#6FBA2C", gem: "비취옥" },
    { id: 10, name: "서울야고보", core: "#78BEFF", glow: "#005dac", gem: "청옥" },
    { id: 11, name: "도마", core: "#E09FFF", glow: "#7f1084", gem: "자정" }
];

/* [시스템] 소속 부서 데이터 */
const DEPT_DATA = [
    { id: 0, name: "교역자", tag: "교" },
    { id: 1, name: "장로회", tag: "로" },
    { id: 2, name: "자문회", tag: "자" },
    { id: 3, name: "장년회", tag: "장" },
    { id: 4, name: "부녀회", tag: "부" },
    { id: 5, name: "청년회", tag: "청" },
    { id: 6, name: "학생회", tag: "학" },
    { id: 7, name: "유년회", tag: "유" }
];

function hexToRgbString(hex) {
    if (!hex) return null;
    const normalized = hex.replace('#', '').trim();
    if (normalized.length === 3) {
        const r = parseInt(normalized[0] + normalized[0], 16);
        const g = parseInt(normalized[1] + normalized[1], 16);
        const b = parseInt(normalized[2] + normalized[2], 16);
        return `${r}, ${g}, ${b}`;
    }
    if (normalized.length === 6) {
        const r = parseInt(normalized.slice(0, 2), 16);
        const g = parseInt(normalized.slice(2, 4), 16);
        const b = parseInt(normalized.slice(4, 6), 16);
        return `${r}, ${g}, ${b}`;
    }
    return null;
}

function applyHomeThemeByTribe(tribeIdx) {
    const tribe = TRIBE_DATA[tribeIdx] || TRIBE_DATA[0];
    const root = document.documentElement;
    const accent = hexToRgbString(tribe.core);
    const strong = hexToRgbString(tribe.glow);
    if (accent) root.style.setProperty('--home-accent-rgb', accent);
    if (strong) root.style.setProperty('--home-accent-strong-rgb', strong);
    if (accent) root.style.setProperty('--home-btn-a-rgb', accent);
    if (strong) root.style.setProperty('--home-btn-b-rgb', strong);
}

// 현재 나의 지파 (기본값: 0)
let myTribe = 0;
// 현재 나의 부서 (기본값: 0)
let myDept = 0;

function getDeptTag(deptId) {
    if (deptId === null || typeof deptId === 'undefined') return "";
    const dept = DEPT_DATA[deptId] || DEPT_DATA[0];
    return `<span style="display:inline-block; margin:0 4px; padding:2px 6px; border-radius:6px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.25); font-size:0.8em; line-height:1;">[${dept.tag}]</span>`;
}

/* [수정] 지파 아이콘 HTML 생성기 (클릭 기능 추가) */
function getTribeIcon(tribeIdx) {
    const tribe = TRIBE_DATA[tribeIdx] || TRIBE_DATA[0];
    
    // 네온 스타일 (기존 유지)
    const neonStyle = `
        color: ${tribe.core}; 
        text-shadow: 
            0 0 5px ${tribe.glow}, 
            0 0 10px ${tribe.glow}, 
            0 0 20px ${tribe.glow};
        margin-right: 4px; 
        font-size: 1.3em;
        vertical-align: middle;
        display: inline-block;
        cursor: pointer; /* 손가락 모양 커서 추가 */
    `;
    
    // ★ 핵심: onclick 이벤트 추가
    // event.stopPropagation()은 아이콘을 눌렀을 때 부모 버튼(랭킹 등)이 눌리는 걸 막아줍니다.
    return `<span onclick="showTribeInfo(event, ${tribeIdx})" style="${neonStyle}">✦</span>`;
}

/* [수정] 지파 정보 말풍선 (클릭한 위치에 표시) */
function showTribeInfo(e, id) {
    // 1. 클릭 전파 방지
    if(e) e.stopPropagation();

    const t = TRIBE_DATA[id];
    if (!t) return;

    // 2. 기존 팝업 제거
    const old = document.getElementById('tribe-toast');
    if (old) old.remove();

    // 3. 클릭한 요소(보석)의 위치 계산
    // e.target은 클릭된 <span> 태그입니다.
    const rect = e.target.getBoundingClientRect();
    const targetX = rect.left + (rect.width / 2); // 아이콘의 가로 중심
    const targetY = rect.top; // 아이콘의 윗부분
    const belowY = rect.bottom; // 아이콘의 아랫부분

    // 4. 팝업 생성
    const toast = document.createElement('div');
    toast.id = 'tribe-toast';
    
    // 스타일: 클릭한 곳 바로 위에 뜨도록 설정
    const toastTop = (targetY - 45 < 8) ? (belowY + 8) : (targetY - 45);

    toast.style.cssText = `
        position: fixed;
        top: ${toastTop}px; /* 상단에 닿으면 아래로 뒤집기 */
        left: ${targetX}px;
        transform: translateX(-50%); /* 정확히 중앙 정렬 */
        
        background-color: rgba(33, 33, 33, 0.95);
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        border: 1px solid ${t.core};
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        
        z-index: 10000;
        font-size: 0.9rem;
        font-weight: bold;
        white-space: nowrap; /* ★ 글자가 절대 줄바꿈 되지 않게 함 (가로 유지) */
        
        display: flex;
        align-items: center;
        gap: 8px;
        
        animation: bubblePop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: none;
    `;

    // 내용: [보석이름] | [지파이름]
    // 아이콘은 이미 눌렀으니 굳이 팝업 안에 또 안 넣고 글자만 깔끔하게 보여줍니다.
    toast.innerHTML = `
        <span style="color:${t.core}; text-shadow:0 0 5px ${t.glow};">${t.gem}</span>
        <span style="width:1px; height:12px; background:#7f8c8d; opacity:0.5;"></span>
        <span style="color:#ecf0f1;">${t.name} 지파</span>
    `;

    document.body.appendChild(toast);

    // 5. 팝업 애니메이션 (톡 튀어나오는 효과)
    if (!document.getElementById('anim-bubble')) {
        const style = document.createElement('style');
        style.id = 'anim-bubble';
        style.innerHTML = `
            @keyframes bubblePop {
                0% { opacity: 0; transform: translate(-50%, 10px) scale(0.8); }
                100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
            }
            @keyframes bubbleFadeOut {
                0% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -10px); }
            }
        `;
        document.head.appendChild(style);
    }

    // 6. 1.5초 뒤 사라짐
    setTimeout(() => {
        if (toast) {
            toast.style.animation = "bubbleFadeOut 0.3s forwards"; // 사라지는 애니메이션 적용
            setTimeout(() => { if(toast.parentNode) toast.remove(); }, 300);
        }
    }, 1500);
}

/* [시스템] 리그 티어 기반 구조는 폐지됨 (지파 랭킹 사용) */

        /* [데이터: 성경 전체 데이터베이스 (1~5장 통합)] */
/* 기존의 bossStageData 변수는 삭제하고 이 변수를 사용합니다. */
const bibleData = {
    1: [
        { text: "예수 그리스도의 계시라 이는 하나님이 그에게 주사 반드시 속히 될 일을 그 종들에게 보이시려고 그 천사를 그 종 요한에게 보내어 지시하신 것이라", chunks: ["예수", "그리스도의", "계시라", "이는", "하나님이", "그에게", "주사", "반드시", "속히", "될", "일을", "그", "종들에게", "보이시려고", "그", "천사를", "그", "종", "요한에게", "보내어", "지시하신", "것이라"] },
        { text: "요한은 하나님의 말씀과 예수 그리스도의 증거 곧 자기의 본 것을 다 증거하였느니라", chunks: ["요한은", "하나님의", "말씀과", "예수", "그리스도의", "증거", "곧", "자기의", "본", "것을", "다", "증거하였느니라"] },
        { text: "이 예언의 말씀을 읽는 자와 듣는 자들과 그 가운데 기록한 것을 지키는 자들이 복이 있나니 때가 가까움이라", chunks: ["이", "예언의", "말씀을", "읽는", "자와", "듣는", "자들과", "그", "가운데", "기록한", "것을", "지키는", "자들이", "복이", "있나니", "때가", "가까움이라"] },
        { text: "요한은 아시아에 있는 일곱 교회에 편지하노니 이제도 계시고 전에도 계시고 장차 오실 이와 그 보좌 앞에 일곱 영과", chunks: ["요한은", "아시아에", "있는", "일곱", "교회에", "편지하노니", "이제도", "계시고", "전에도", "계시고", "장차", "오실", "이와", "그", "보좌", "앞에", "일곱", "영과"] },
        { text: "또 충성된 증인으로 죽은 자들 가운데서 먼저 나시고 땅의 임금들의 머리가 되신 예수 그리스도로 말미암아 은혜와 평강이 너희에게 있기를 원하노라 우리를 사랑하사 그의 피로 우리 죄에서 우리를 해방하시고", chunks: ["또", "충성된", "증인으로", "죽은", "자들", "가운데서", "먼저", "나시고", "땅의", "임금들의", "머리가", "되신", "예수", "그리스도로", "말미암아", "은혜와", "평강이", "너희에게", "있기를", "원하노라", "우리를", "사랑하사", "그의", "피로", "우리", "죄에서", "우리를", "해방하시고"] },
        { text: "그 아버지 하나님을 위하여 우리를 나라와 제사장으로 삼으신 그에게 영광과 능력이 세세토록 있기를 원하노라 아멘", chunks: ["그", "아버지", "하나님을", "위하여", "우리를", "나라와", "제사장으로", "삼으신", "그에게", "영광과", "능력이", "세세토록", "있기를", "원하노라", "아멘"] },
        { text: "볼찌어다 구름을 타고 오시리라 각인의 눈이 그를 보겠고 그를 찌른 자들도 볼터이요 땅에 있는 모든 족속이 그를 인하여 애곡하리니 그러하리라 아멘", chunks: ["볼찌어다", "구름을", "타고", "오시리라", "각인의", "눈이", "그를", "보겠고", "그를", "찌른", "자들도", "볼터이요", "땅에", "있는", "모든", "족속이", "그를", "인하여", "애곡하리니", "그러하리라", "아멘"] },
        { text: "주 하나님이 가라사대 나는 알파와 오메가라 이제도 있고 전에도 있었고 장차 올 자요 전능한 자라 하시더라", chunks: ["주", "하나님이", "가라사대", "나는", "알파와", "오메가라", "이제도", "있고", "전에도", "있었고", "장차", "올", "자요", "전능한", "자라", "하시더라"] },
        { text: "나 요한은 너희 형제요 예수의 환난과 나라와 참음에 동참하는 자라 하나님의 말씀과 예수의 증거를 인하여 밧모라 하는 섬에 있었더니", chunks: ["나", "요한은", "너희", "형제요", "예수의", "환난과", "나라와", "참음에", "동참하는", "자라", "하나님의", "말씀과", "예수의", "증거를", "인하여", "밧모라", "하는", "섬에", "있었더니"] },
        { text: "주의 날에 내가 성령에 감동하여 내 뒤에서 나는 나팔 소리 같은 큰 음성을 들으니", chunks: ["주의", "날에", "내가", "성령에", "감동하여", "내", "뒤에서", "나는", "나팔", "소리", "같은", "큰", "음성을", "들으니"] },
        { text: "가로되 너 보는 것을 책에 써서 에베소, 서머나, 버가모, 두아디라, 사데, 빌라델비아, 라오디게아 일곱 교회에 보내라 하시기로", chunks: ["가로되", "너", "보는", "것을", "책에", "써서", "에베소,", "서머나,", "버가모,", "두아디라,", "사데,", "빌라델비아,", "라오디게아", "일곱", "교회에", "보내라", "하시기로"] },
        { text: "몸을 돌이켜 나더러 말한 음성을 알아 보려고 하여 돌이킬 때에 일곱 금 촛대를 보았는데", chunks: ["몸을", "돌이켜", "나더러", "말한", "음성을", "알아", "보려고", "하여", "돌이킬", "때에", "일곱", "금", "촛대를", "보았는데"] },
        { text: "촛대 사이에 인자 같은 이가 발에 끌리는 옷을 입고 가슴에 금띠를 띠고", chunks: ["촛대", "사이에", "인자", "같은", "이가", "발에", "끌리는", "옷을", "입고", "가슴에", "금띠를", "띠고"] },
        { text: "그 머리와 털의 희기가 흰 양털 같고 눈 같으며 그의 눈은 불꽃 같고", chunks: ["그", "머리와", "털의", "희기가", "흰", "양털", "같고", "눈", "같으며", "그의", "눈은", "불꽃", "같고"] },
        { text: "그의 발은 풀무에 단련한 빛난 주석 같고 그의 음성은 많은 물 소리와 같으며", chunks: ["그의", "발은", "풀무에", "단련한", "빛난", "주석", "같고", "그의", "음성은", "많은", "물", "소리와", "같으며"] },
        { text: "그 오른손에 일곱 별이 있고 그 입에서 좌우에 날선 검이 나오고 그 얼굴은 해가 힘있게 비취는것 같더라", chunks: ["그", "오른손에", "일곱", "별이", "있고", "그", "입에서", "좌우에", "날선", "검이", "나오고", "그", "얼굴은", "해가", "힘있게", "비취는것", "같더라"] },
        { text: "내가 볼때에 그 발앞에 엎드러져 죽은 자 같이 되매 그가 오른손을 내게 얹고 가라사대 두려워 말라 나는 처음이요 나중이니", chunks: ["내가", "볼때에", "그", "발앞에", "엎드러져", "죽은", "자", "같이", "되매", "그가", "오른손을", "내게", "얹고", "가라사대", "두려워", "말라", "나는", "처음이요", "나중이니"] },
        { text: "곧 산 자라 내가 전에 죽었었노라 볼찌어다 이제 세세토록 살아 있어 사망과 음부의 열쇠를 가졌노니", chunks: ["곧", "산", "자라", "내가", "전에", "죽었었노라", "볼찌어다", "이제", "세세토록", "살아", "있어", "사망과", "음부의", "열쇠를", "가졌노니"] },
        { text: "그러므로 네 본 것과 이제 있는 일과 장차 될 일을 기록하라", chunks: ["그러므로", "네", "본", "것과", "이제", "있는", "일과", "장차", "될", "일을", "기록하라"] },
        { text: "네 본 것은 내 오른손에 일곱 별의 비밀과 일곱 금 촛대라 일곱 별은 일곱 교회의 사자요 일곱 촛대는 일곱 교회니라", chunks: ["네", "본", "것은", "내", "오른손에", "일곱", "별의", "비밀과", "일곱", "금", "촛대라", "일곱", "별은", "일곱", "교회의", "사자요", "일곱", "촛대는", "일곱", "교회니라"] }
    ],
    2: [
        { text: "에베소 교회의 사자에게 편지하기를 오른손에 일곱 별을 붙잡고 일곱 금 촛대 사이에 다니시는 이가 가라사대", chunks: ["에베소", "교회의", "사자에게", "편지하기를", "오른손에", "일곱", "별을", "붙잡고", "일곱", "금", "촛대", "사이에", "다니시는", "이가", "가라사대"] },
        { text: "내가 네 행위와 수고와 네 인내를 알고 또 악한 자들을 용납지 아니한 것과 자칭 사도라 하되 아닌 자들을 시험하여 그 거짓된 것을 네가 드러낸 것과", chunks: ["내가", "네", "행위와", "수고와", "네", "인내를", "알고", "또", "악한", "자들을", "용납지", "아니한", "것과", "자칭", "사도라", "하되", "아닌", "자들을", "시험하여", "그", "거짓된", "것을", "네가", "드러낸", "것과"] },
        { text: "또 네가 참고 내 이름을 위하여 견디고 게으르지 아니한 것을 아노라", chunks: ["또", "네가", "참고", "내", "이름을", "위하여", "견디고", "게으르지", "아니한", "것을", "아노라"] },
        { text: "그러나 너를 책망할 것이 있나니 너의 처음 사랑을 버렸느니라", chunks: ["그러나", "너를", "책망할", "것이", "있나니", "너의", "처음", "사랑을", "버렸느니라"] },
        { text: "그러므로 어디서 떨어진 것을 생각하고 회개하여 처음 행위를 가지라 만일 그리하지 아니하고 회개치 아니하면 내가 네게 임하여 네 촛대를 그 자리에서 옮기리라", chunks: ["그러므로", "어디서", "떨어진", "것을", "생각하고", "회개하여", "처음", "행위를", "가지라", "만일", "그리하지", "아니하고", "회개치", "아니하면", "내가", "네게", "임하여", "네", "촛대를", "그", "자리에서", "옮기리라"] },
        { text: "오직 네게 이것이 있으니 네가 니골라당의 행위를 미워하는도다 나도 이것을 미워하노라", chunks: ["오직", "네게", "이것이", "있으니", "네가", "니골라당의", "행위를", "미워하는도다", "나도", "이것을", "미워하노라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다 이기는 그에게는 내가 하나님의 낙원에 있는 생명나무의 과실을 주어 먹게 하리라", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "듣을찌어다", "이기는", "그에게는", "내가", "하나님의", "낙원에", "있는", "생명나무의", "과실을", "주어", "먹게", "하리라"] },
        { text: "서머나 교회의 사자에게 편지하기를 처음이요 나중이요 죽었다가 살아나신 이가 가라사대", chunks: ["서머나", "교회의", "사자에게", "편지하기를", "처음이요", "나중이요", "죽었다가", "살아나신", "이가", "가라사대"] },
        { text: "내가 네 환난과 궁핍을 아노니 실상은 네가 부요한 자니라 자칭 유대인이라 하는 자들의 훼방도 아노니 실상은 유대인이 아니요 사단의 회라", chunks: ["내가", "네", "환난과", "궁핍을", "아노니", "실상은", "네가", "부요한", "자니라", "자칭", "유대인이라", "하는", "자들의", "훼방도", "아노니", "실상은", "유대인이", "아니요", "사단의", "회라"] },
        { text: "네가 장차 받을 고난을 두려워 말라 볼찌어다 마귀가 장차 너희 가운데서 몇 사람을 옥에 던져 시험을 받게 하리니 너희가 십일 동안 환난을 받으리라 네가 죽도록 충성하라 그리하면 내가 생명의 면류관을 네게 주리라", chunks: ["네가", "장차", "받을", "고난을", "두려워", "말라", "볼찌어다", "마귀가", "장차", "너희", "가운데서", "몇", "사람을", "옥에", "던져", "시험을", "받게", "하리니", "너희가", "십일", "동안", "환난을", "받으리라", "네가", "죽도록", "충성하라", "그리하면", "내가", "생명의", "면류관을", "네게", "주리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다 이기는 자는 둘째 사망의 해를 받지 아니하리라", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다", "이기는", "자는", "둘째", "사망의", "해를", "받지", "아니하리라"] },
        { text: "버가모 교회의 사자에게 편지하기를 좌우에 날선 검을 가진 이가 가라사대", chunks: ["버가모", "교회의", "사자에게", "편지하기를", "좌우에", "날선", "검을", "가진", "이가", "가라사대"] },
        { text: "네가 어디 사는 것을 내가 아노니 거기는 사단의 위가 있는 데라 네가 내 이름을 굳게 잡아서 내 충성된 증인 안디바가 너희 가운데 곧 사단의 거하는 곳에서 죽임을 당할 때에도 나를 믿는 믿음을 저버리지 아니하였도다", chunks: ["네가", "어디", "사는", "것을", "내가", "아노니", "거기는", "사단의", "위가", "있는", "데라", "네가", "내", "이름을", "굳게", "잡아서", "내", "충성된", "증인", "안디바가", "너희", "가운데", "곧", "사단의", "거하는", "곳에서", "죽임을", "당할", "때에도", "나를", "믿는", "믿음을", "저버리지", "아니하였도다"] },
        { text: "그러나 네게 두어가지 책망할 것이 있나니 거기 네게 발람의 교훈을 지키는 자들이 있도다 발람이 발락을 가르쳐 이스라엘 앞에 올무를 놓아 우상의 제물을 먹게 하였고 또 행음하게 하였느니라", chunks: ["그러나", "네게", "두어가지", "책망할", "것이", "있나니", "거기", "네게", "발람의", "교훈을", "지키는", "자들이", "있도다", "발람이", "발락을", "가르쳐", "이스라엘", "앞에", "올무를", "놓아", "우상의", "제물을", "먹게", "하였고", "또", "행음하게", "하였느니라"] },
        { text: "이와 같이 네게도 니골라당의 교훈을 지키는 자들이 있도다", chunks: ["이와", "같이", "네게도", "니골라당의", "교훈을", "지키는", "자들이", "있도다"] },
        { text: "그러므로 회개하라 그리하지 아니하면 내가 네게 속히 임하여 내 입의 검으로 그들과 싸우리라", chunks: ["그러므로", "회개하라", "그리하지", "아니하면", "내가", "네게", "속히", "임하여", "내", "입의", "검으로", "그들과", "싸우리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다 이기는 그에게는 내가 감추었던 만나를 주고 또 흰 돌을 줄터인데 그 돌 위에 새 이름을 기록한 것이 있나니 받는 자 밖에는 그 이름을 알 사람이 없느니라", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다", "이기는", "그에게는", "내가", "감추었던", "만나를", "주고", "또", "흰", "돌을", "줄터인데", "그", "돌", "위에", "새", "이름을", "기록한", "것이", "있나니", "받는", "자", "밖에는", "그", "이름을", "알", "사람이", "없느니라"] },
        { text: "두아디라 교회의 사자에게 편지하기를 그 눈이 불꽃 같고 그 발이 빛난 주석과 같은 하나님의 아들이 가라사대", chunks: ["두아디라", "교회의", "사자에게", "편지하기를", "그", "눈이", "불꽃", "같고", "그", "발이", "빛난", "주석과", "같은", "하나님의", "아들이", "가라사대"] },
        { text: "내가 네 사업과 사랑과 믿음과 섬김과 인내를 아노니 네 나중 행위가 처음것보다 많도다", chunks: ["내가", "네", "사업과", "사랑과", "믿음과", "섬김과", "인내를", "아노니", "네", "나중", "행위가", "처음것보다", "많도다"] },
        { text: "그러나 네게 책망할 일이 있노라 자칭 선지자라 하는 여자 이세벨을 네가 용납함이니 그가 내 종들을 가르쳐 꾀어 행음하게 하고 우상의 제물을 먹게 하는도다", chunks: ["그러나", "네게", "책망할", "일이", "있노라", "자칭", "선지자라", "하는", "여자", "이세벨을", "네가", "용납함이니", "그가", "내", "종들을", "가르쳐", "꾀어", "행음하게", "하고", "우상의", "제물을", "먹게", "하는도다"] },
        { text: "또 내가 그에게 회개할 기회를 주었으되 그 음행을 회개하고자 아니하는도다", chunks: ["또", "내가", "그에게", "회개할", "기회를", "주었으되", "그", "음행을", "회개하고자", "아니하는도다"] },
        { text: "볼찌어다 내가 그를 침상에 던질터이요 또 그로 더불어 간음하는 자들도 만일 그의 행위를 회개치 아니하면 큰 환난 가운데 던지고", chunks: ["볼찌어다", "내가", "그를", "침상에", "던질터이요", "또", "그로", "더불어", "간음하는", "자들도", "만일", "그의", "행위를", "회개치", "아니하면", "큰", "환난", "가운데", "던지고"] },
        { text: "또 내가 사망으로 그의 자녀를 죽이리니 모든 교회가 나는 사람의 뜻과 마음을 살피는 자인줄 알찌라 내가 너희 각 사람의 행위대로 갚아 주리라", chunks: ["또", "내가", "사망으로", "그의", "자녀를", "죽이리니", "모든", "교회가", "나는", "사람의", "뜻과", "마음을", "살피는", "자인줄", "알찌라", "내가", "너희", "각", "사람의", "행위대로", "갚아", "주리라"] },
        { text: "두아디라에 남아 있어 이 교훈을 받지 아니하고 소위 사단의 깊은 것을 알지 못하는 너희에게 말하노니 다른 짐으로 너희에게 지울 것이 없노라", chunks: ["두아디라에", "남아", "있어", "이", "교훈을", "받지", "아니하고", "소위", "사단의", "깊은", "것을", "알지", "못하는", "너희에게", "말하노니", "다른", "짐으로", "너희에게", "지울", "것이", "없노라"] },
        { text: "다만 너희에게 있는 것을 내가 올 때까지 굳게 잡으라", chunks: ["다만", "너희에게", "있는", "것을", "내가", "올", "때까지", "굳게", "잡으라"] },
        { text: "이기는 자와 끝까지 내 일을 지키는 그에게 만국을 다스리는 권세를 주리니", chunks: ["이기는", "자와", "끝까지", "내", "일을", "지키는", "그에게", "만국을", "다스리는", "권세를", "주리니"] },
        { text: "그가 철장을 가지고 저희를 다스려 질그릇 깨뜨리는 것과 같이 하리라 나도 내 아버지께 받은 것이 그러하니라", chunks: ["그가", "철장을", "가지고", "저희를", "다스려", "질그릇", "깨뜨리는", "것과", "같이", "하리라", "나도", "내", "아버지께", "받은", "것이", "그러하니라"] },
        { text: "내가 또 그에게 새벽 별을 주리라", chunks: ["내가", "또", "그에게", "새벽", "별을", "주리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다"] }
    ],
    3: [
        { text: "사데 교회의 사자에게 편지하기를 하나님의 일곱 영과 일곱 별을 가진이가 가라사대 내가 네 행위를 아노니 네가 살았다 하는 이름은 가졌으나 죽은 자로다", chunks: ["사데", "교회의", "사자에게", "편지하기를", "하나님의", "일곱", "영과", "일곱", "별을", "가진이가", "가라사대", "내가", "네", "행위를", "아노니", "네가", "살았다", "하는", "이름은", "가졌으나", "죽은", "자로다"] },
        { text: "너는 일깨워 그 남은바 죽게 된 것을 굳게 하라 내 하나님 앞에 네 행위의 온전한 것을 찾지 못하였노니", chunks: ["너는", "일깨워", "그", "남은바", "죽게", "된", "것을", "굳게", "하라", "내", "하나님", "앞에", "네", "행위의", "온전한", "것을", "찾지", "못하였노니"] },
        { text: "그러므로 네가 어떻게 받았으며 어떻게 들었는지 생각하고 지키어 회개하라 만일 일깨지 아니하면 내가 도적 같이 이르리니 어느 시에 네게 임할는지 네가 알지 못하리라", chunks: ["그러므로", "네가", "어떻게", "받았으며", "어떻게", "들었는지", "생각하고", "지키어", "회개하라", "만일", "일깨지", "아니하면", "내가", "도적", "같이", "이르리니", "어느", "시에", "네게", "임할는지", "네가", "알지", "못하리라"] },
        { text: "그러나 사데에 그 옷을 더럽히지 아니한 자 몇명이 네게 있어 흰 옷을 입고 나와 함께 다니리니 그들은 합당한 자인 연고라", chunks: ["그러나", "사데에", "그", "옷을", "더럽히지", "아니한", "자", "몇명이", "네게", "있어", "흰", "옷을", "입고", "나와", "함께", "다니리니", "그들은", "합당한", "자인", "연고라"] },
        { text: "이기는 자는 이와 같이 흰 옷을 입을 것이요 내가 그 이름을 생명책에서 반드시 흐리지 아니하고 그 이름을 내 아버지 앞과 그 천사들 앞에서 시인하리라", chunks: ["이기는", "자는", "이와", "같이", "흰", "옷을", "입을", "것이요", "내가", "그", "이름을", "생명책에서", "반드시", "흐리지", "아니하고", "그", "이름을", "내", "아버지", "앞과", "그", "천사들", "앞에서", "시인하리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다"] },
        { text: "빌라델비아 교회의 사자에게 편지하기를 거룩하고 진실하사 다윗의 열쇠를 가지신 이 곧 열면 닫을 사람이 없고 닫으면 열 사람이 없는 그이가 가라사대", chunks: ["빌라델비아", "교회의", "사자에게", "편지하기를", "거룩하고", "진실하사", "다윗의", "열쇠를", "가지신", "이", "곧", "열면", "닫을", "사람이", "없고", "닫으면", "열", "사람이", "없는", "그이가", "가라사대"] },
        { text: "볼찌어다 내가 네 앞에 열린 문을 두었으되 능히 닫을 사람이 없으리라 내가 네 행위를 아노니 네가 적은 능력을 가지고도 내 말을 지키며 내 이름을 배반치 아니하였도다", chunks: ["볼찌어다", "내가", "네", "앞에", "열린", "문을", "두었으되", "능히", "닫을", "사람이", "없으리라", "내가", "네", "행위를", "아노니", "네가", "적은", "능력을", "가지고도", "내", "말을", "지키며", "내", "이름을", "배반치", "아니하였도다"] },
        { text: "보라 사단의 회 곧 자칭 유대인이라 하나 그렇지 않고 거짓말 하는 자들 중에서 몇을 네게 주어 저희로 와서 네 발앞에 절하게 하고 내가 너를 사랑하는 줄을 알게 하리라", chunks: ["보라", "사단의", "회", "곧", "자칭", "유대인이라", "하나", "그렇지", "않고", "거짓말", "하는", "자들", "중에서", "몇을", "네게", "주어", "저희로", "와서", "네", "발앞에", "절하게", "하고", "내가", "너를", "사랑하는", "줄을", "알게", "하리라"] },
        { text: "네가 나의 인내의 말씀을 지켰은즉 내가 또한 너를 지키어 시험의 때를 면하게 하리니 이는 장차 온 세상에 임하여 땅에 거하는 자들을 시험할 때라", chunks: ["네가", "나의", "인내의", "말씀을", "지켰은즉", "내가", "또한", "너를", "지키어", "시험의", "때를", "면하게", "하리니", "이는", "장차", "온", "세상에", "임하여", "땅에", "거하는", "자들을", "시험할", "때라"] },
        { text: "내가 속히 임하리니 네가 가진 것을 굳게 잡아 아무나 네 면류관을 빼앗지 못하게 하라", chunks: ["내가", "속히", "임하리니", "네가", "가진", "것을", "굳게", "잡아", "아무나", "네", "면류관을", "빼앗지", "못하게", "하라"] },
        { text: "이기는 자는 내 하나님 성전에 기둥이 되게 하리니 그가 결코 다시 나가지 아니하리라 내가 하나님의 이름과 하나님의 성 곧 하늘에서 내 하나님께로부터 내려 오는 새 예루살렘의 이름과 나의 새 이름을 그이 위에 기록하리라", chunks: ["이기는", "자는", "내", "하나님", "성전에", "기둥이", "되게", "하리니", "그가", "결코", "다시", "나가지", "아니하리라", "내가", "하나님의", "이름과", "하나님의", "성", "곧", "하늘에서", "내", "하나님께로부터", "내려", "오는", "새", "예루살렘의", "이름과", "나의", "새", "이름을", "그이", "위에", "기록하리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다"] },
        { text: "라오디게아 교회의 사자에게 편지하기를 아멘이시요 충성되고 참된 증인이시요 하나님의 창조의 근본이신 이가 가라사대", chunks: ["라오디게아", "교회의", "사자에게", "편지하기를", "아멘이시요", "충성되고", "참된", "증인이시요", "하나님의", "창조의", "근본이신", "이가", "가라사대"] },
        { text: "내가 네 행위를 아노니 네가 차지도 아니하고 더웁지도 아니하도다 네가 차든지 더웁든지 하기를 원하노라", chunks: ["내가", "네", "행위를", "아노니", "네가", "차지도", "아니하고", "더웁지도", "아니하도다", "네가", "차든지", "더웁든지", "하기를", "원하노라"] },
        { text: "네가 이같이 미지근하여 더웁지도 아니하고 차지도 아니하니 내 입에서 너를 토하여 내치리라", chunks: ["네가", "이같이", "미지근하여", "더웁지도", "아니하고", "차지도", "아니하니", "내", "입에서", "너를", "토하여", "내치리라"] },
        { text: "네가 말하기를 나는 부자라 부요하여 부족한 것이 없다 하나 네 곤고한 것과 가련한 것과 가난한 것과 눈 먼것과 벌거벗은 것을 알지 못하도다", chunks: ["네가", "말하기를", "나는", "부자라", "부요하여", "부족한", "것이", "없다", "하나", "네", "곤고한", "것과", "가련한", "것과", "가난한", "것과", "눈", "먼것과", "벌거벗은", "것을", "알지", "못하도다"] },
        { text: "내가 너를 권하노니 내게서 불로 연단한 금을 사서 부요하게 하고 흰 옷을 사서 입어 벌거벗은 수치를 보이지 않게 하고 안약을 사서 눈에 발라 보게 하라", chunks: ["내가", "너를", "권하노니", "내게서", "불로", "연단한", "금을", "사서", "부요하게", "하고", "흰", "옷을", "사서", "입어", "벌거벗은", "수치를", "보이지", "않게", "하고", "안약을", "사서", "눈에", "발라", "보게", "하라"] },
        { text: "무릇 내가 사랑하는 자를 책망하여 징계하노니 그러므로 네가 열심을 내라 회개하라", chunks: ["무릇", "내가", "사랑하는", "자를", "책망하여", "징계하노니", "그러므로", "네가", "열심을", "내라", "회개하라"] },
        { text: "볼찌어다 내가 문밖에 서서 두드리노니 누구든지 내 음성을 듣고 문을 열면 내가 그에게로 들어가 그로 더불어 먹고 그는 나로 더불어 먹으리라", chunks: ["볼찌어다", "내가", "문밖에", "서서", "두드리노니", "누구든지", "내", "음성을", "듣고", "문을", "열면", "내가", "그에게로", "들어가", "그로", "더불어", "먹고", "그는", "나로", "더불어", "먹으리라"] },
        { text: "이기는 그에게는 내가 내 보좌에 함께 앉게 하여주기를 내가 이기고 아버지 보좌에 함께 앉은 것과 같이 하리라", chunks: ["이기는", "그에게는", "내가", "내", "보좌에", "함께", "앉게", "하여주기를", "내가", "이기고", "아버지", "보좌에", "함께", "앉은", "것과", "같이", "하리라"] },
        { text: "귀 있는 자는 성령이 교회들에게 하시는 말씀을 들을찌어다", chunks: ["귀", "있는", "자는", "성령이", "교회들에게", "하시는", "말씀을", "들을찌어다"] }
    ],
    4: [
        { text: "이 일 후에 내가 보니 하늘에 열린 문이 있는데 내가 들은바 처음에 내게 말하던 나팔소리 같은 그 음성이 가로되 이리로 올라오라 이 후에 마땅히 될 일을 내가 네게 보이리라 하시더라", chunks: ["이", "일", "후에", "내가", "보니", "하늘에", "열린", "문이", "있는데", "내가", "들은바", "처음에", "내게", "말하던", "나팔소리", "같은", "그", "음성이", "가로되", "이리로", "올라오라", "이", "후에", "마땅히", "될", "일을", "내가", "네게", "보이리라", "하시더라"] },
        { text: "내가 곧 성령에 감동하였더니 보라 하늘에 보좌를 베풀었고 그 보좌 위에 앉으신 이가 있는데", chunks: ["내가", "곧", "성령에", "감동하였더니", "보라", "하늘에", "보좌를", "베풀었고", "그", "보좌", "위에", "앉으신", "이가", "있는데"] },
        { text: "앉으신 이의 모양이 벽옥과 홍보석 같고 또 무지개가 있어 보좌에 둘렸는데 그 모양이 녹보석 같더라", chunks: ["앉으신", "이의", "모양이", "벽옥과", "홍보석", "같고", "또", "무지개가", "있어", "보좌에", "둘렸는데", "그", "모양이", "녹보석", "같더라"] },
        { text: "또 보좌에 둘려 이십 사 보좌들이 있고 그 보좌들 위에 이십 사 장로들이 흰 옷을 입고 머리에 금 면류관을 쓰고 앉았더라", chunks: ["또", "보좌에", "둘려", "이십", "사", "보좌들이", "있고", "그", "보좌들", "위에", "이십", "사", "장로들이", "흰", "옷을", "입고", "머리에", "금", "면류관을", "쓰고", "앉았더라"] },
        { text: "보좌로부터 번개와 음성과 뇌성이 나고 보좌 앞에 일곱 등불 켠것이 있으니 이는 하나님의 일곱 영이라", chunks: ["보좌로부터", "번개와", "음성과", "뇌성이", "나고", "보좌", "앞에", "일곱", "등불", "켠것이", "있으니", "이는", "하나님의", "일곱", "영이라"] },
        { text: "보좌 앞에 수정과 같은 유리 바다가 있고 보좌 가운데와 보좌 주위에 네 생물이 있는데 앞뒤에 눈이 가득하더라", chunks: ["보좌", "앞에", "수정과", "같은", "유리", "바다가", "있고", "보좌", "가운데와", "보좌", "주위에", "네", "생물이", "있는데", "앞뒤에", "눈이", "가득하더라"] },
        { text: "그 첫째 생물은 사자 같고 그 둘째 생물은 송아지 같고 그 세째 생물은 얼굴이 사람 같고 그 네째 생물은 날아가는 독수리 같은데", chunks: ["그", "첫째", "생물은", "사자", "같고", "그", "둘째", "생물은", "송아지", "같고", "그", "세째", "생물은", "얼굴이", "사람", "같고", "그", "네째", "생물은", "날아가는", "독수리", "같은데"] },
        { text: "네 생물이 각각 여섯 날개가 있고 그 안과 주위에 눈이 가득하더라 그들이 밤낮 쉬지 않고 이르기를 거룩하다 거룩하다 거룩하다 주 하나님 곧 전능하신이여 전에도 계셨고 이제도 계시고 장차 오실 자라 하고", chunks: ["네", "생물이", "각각", "여섯", "날개가", "있고", "그", "안과", "주위에", "눈이", "가득하더라", "그들이", "밤낮", "쉬지", "않고", "이르기를", "거룩하다", "거룩하다", "거룩하다", "주", "하나님", "곧", "전능하신이여", "전에도", "계셨고", "이제도", "계시고", "장차", "오실", "자라", "하고"] },
        { text: "그 생물들이 영광과 존귀와 감사를 보좌에 앉으사 세세토록 사시는 이에게 돌릴 때에", chunks: ["그", "생물들이", "영광과", "존귀와", "감사를", "보좌에", "앉으사", "세세토록", "사시는", "이에게", "돌릴", "때에"] },
        { text: "이십 사 장로들이 보좌에 앉으신 이 앞에 엎드려 세세토록 사시는 이에게 경배하고 자기의 면류관을 보좌 앞에 던지며 가로되", chunks: ["이십", "사", "장로들이", "보좌에", "앉으신", "이", "앞에", "엎드려", "세세토록", "사시는", "이에게", "경배하고", "자기의", "면류관을", "보좌", "앞에", "던지며", "가로되"] },
        { text: "우리 주 하나님이여 영광과 존귀와 능력을 받으시는 것이 합당하오니 주께서 만물을 지으신지라 만물이 주의 뜻대로 있었고 또 지으심을 받았나이다 하더라", chunks: ["우리", "주", "하나님이여", "영광과", "존귀와", "능력을", "받으시는", "것이", "합당하오니", "주께서", "만물을", "지으신지라", "만물이", "주의", "뜻대로", "있었고", "또", "지으심을", "받았나이다", "하더라"] }
    ],
    5: [
        { text: "내가 보매 보좌에 앉으신 이의 오른손에 책이 있으니 안팎으로 썼고 일곱 인으로 봉하였더라", chunks: ["내가", "보매", "보좌에", "앉으신", "이의", "오른손에", "책이", "있으니", "안팎으로", "썼고", "일곱", "인으로", "봉하였더라"] },
        { text: "또 보매 힘 있는 천사가 큰 음성으로 외치기를 누가 책을 펴며 그 인을 떼기에 합당하냐 하니", chunks: ["또", "보매", "힘", "있는", "천사가", "큰", "음성으로", "외치기를", "누가", "책을", "펴며", "그", "인을", "떼기에", "합당하냐", "하니"] },
        { text: "하늘 위에나 땅 위에나 땅 아래에 능히 책을 펴거나 보거나 할 이가 없더라", chunks: ["하늘", "위에나", "땅", "위에나", "땅", "아래에", "능히", "책을", "펴거나", "보거나", "할", "이가", "없더라"] },
        { text: "이 책을 펴거나 보거나 하기에 합당한 자가 보이지 않기로 내가 크게 울었더니", chunks: ["이", "책을", "펴거나", "보거나", "하기에", "합당한", "자가", "보이지", "않기로", "내가", "크게", "울었더니"] },
        { text: "장로 중에 하나가 내게 말하되 울지 말라 유대 지파의 사자 다윗의 뿌리가 이기었으니 이 책과 그 일곱 인을 떼시리라 하더라", chunks: ["장로", "중에", "하나가", "내게", "말하되", "울지", "말라", "유대", "지파의", "사자", "다윗의", "뿌리가", "이기었으니", "이", "책과", "그", "일곱", "인을", "떼시리라", "하더라"] },
        { text: "내가 또 보니 보좌와 네 생물과 장로들 사이에 어린 양이 섰는데 일찍 죽임을 당한것 같더라 일곱 뿔과 일곱 눈이 있으니 이 눈은 온 땅에 보내심을 입은 하나님의 일곱 영이더라", chunks: ["내가", "또", "보니", "보좌와", "네", "생물과", "장로들", "사이에", "어린", "양이", "섰는데", "일찍", "죽임을", "당한것", "같더라", "일곱", "뿔과", "일곱", "눈이", "있으니", "이", "눈은", "온", "땅에", "보내심을", "입은", "하나님의", "일곱", "영이더라"] },
        { text: "어린 양이 나아와서 보좌에 앉으신 이의 오른손에서 책을 취하시니라", chunks: ["어린", "양이", "나아와서", "보좌에", "앉으신", "이의", "오른손에서", "책을", "취하시니라"] },
        { text: "책을 취하시매 네 생물과 이십 사 장로들이 어린 양 앞에 엎드려 각각 거문고와 향이 가득한 금 대접을 가졌으니 이 향은 성도의 기도들이라", chunks: ["책을", "취하시매", "네", "생물과", "이십", "사", "장로들이", "어린", "양", "앞에", "엎드려", "각각", "거문고와", "향이", "가득한", "금", "대접을", "가졌으니", "이", "향은", "성도의", "기도들이라"] },
        { text: "새 노래를 노래하여 가로되 책을 가지시고 그 인봉을 떼기에 합당하시도다 일찍 죽임을 당하사 각 족속과 방언과 백성과 나라 가운데서 사람들을 피로 사서 하나님께 드리시고", chunks: ["새", "노래를", "노래하여", "가로되", "책을", "가지시고", "그", "인봉을", "떼기에", "합당하시도다", "일찍", "죽임을", "당하사", "각", "족속과", "방언과", "백성과", "나라", "가운데서", "사람들을", "피로", "사서", "하나님께", "드리시고"] },
        { text: "저희로 우리 하나님 앞에서 나라와 제사장을 삼으셨으니 저희가 땅에서 왕노릇하리로다 하더라", chunks: ["저희로", "우리", "하나님", "앞에서", "나라와", "제사장을", "삼으셨으니", "저희가", "땅에서", "왕노릇하리로다", "하더라"] },
        { text: "내가 또 보고 들으매 보좌와 생물들과 장로들을 둘러 선 많은 천사의 음성이 있으니 그 수가 만만이요 천천이라", chunks: ["내가", "또", "보고", "들으매", "보좌와", "생물들과", "장로들을", "둘러", "선", "많은", "천사의", "음성이", "있으니", "그", "수가", "만만이요", "천천이라"] },
        { text: "큰 음성으로 가로되 죽임을 당하신 어린 양이 능력과 부와 지혜와 힘과 존귀와 영광과 찬송을 받으시기에 합당하도다 하더라", chunks: ["큰", "음성으로", "가로되", "죽임을", "당하신", "어린", "양이", "능력과", "부와", "지혜와", "힘과", "존귀와", "영광과", "찬송을", "받으시기에", "합당하도다", "하더라"] },
        { text: "내가 또 들으니 하늘 위에와 땅 위에와 땅 아래와 바다 위에와 또 그 가운데 모든 만물이 가로되 보좌에 앉으신 이와 어린 양에게 찬송과 존귀와 영광과 능력을 세세토록 돌릴찌어다 하니", chunks: ["내가", "또", "들으니", "하늘", "위에와", "땅", "위에와", "땅", "아래와", "바다", "위에와", "또", "그", "가운데", "모든", "만물이", "가로되", "보좌에", "앉으신", "이와", "어린", "양에게", "찬송과", "존귀와", "영광과", "능력을", "세세토록", "돌릴찌어다", "하니"] },
        { text: "네 생물이 가로되 아멘 하고 장로들은 엎드려 경배하더라", chunks: ["네", "생물이", "가로되", "아멘", "하고", "장로들은", "엎드려", "경배하더라"] }
    ],

    6: [
        { text: "내가 보매 어린 양이 일곱 인 중에 하나를 떼시는 그 때에 내가 들으니 네 생물 중에 하나가 우뢰소리 같이 말하되 오라 하기로", chunks: ["내가", "보매", "어린", "양이", "일곱", "인", "중에", "하나를", "떼시는", "그", "때에", "내가", "들으니", "네", "생물", "중에", "하나가", "우뢰소리", "같이", "말하되", "오라", "하기로"] },
        { text: "내가 이에 보니 흰 말이 있는데 그 탄 자가 활을 가졌고 면류관을 받고 나가서 이기고 또 이기려고 하더라", chunks: ["내가", "이에", "보니", "흰", "말이", "있는데", "그", "탄", "자가", "활을", "가졌고", "면류관을", "받고", "나가서", "이기고", "또", "이기려고", "하더라"] },
        { text: "둘째 인을 떼실 때에 내가 들으니 둘째 생물이 말하되 오라 하더니", chunks: ["둘째", "인을", "떼실", "때에", "내가", "들으니", "둘째", "생물이", "말하되", "오라", "하더니"] },
        { text: "이에 붉은 다른 말이 나오더라 그 탄 자가 허락을 받아 땅에서 화평을 제하여 버리며 서로 죽이게 하고 또 큰 칼을 받았더라", chunks: ["이에", "붉은", "다른", "말이", "나오더라", "그", "탄", "자가", "허락을", "받아", "땅에서", "화평을", "제하여", "버리며", "서로", "죽이게", "하고", "또", "큰", "칼을", "받았더라"] },
        { text: "세째 인을 떼실 때에 내가 들으니 세째 생물이 말하되 오라 하기로 내가 보니 검은 말이 나오는데 그 탄 자가 손에 저울을 가졌더라", chunks: ["세째", "인을", "떼실", "때에", "내가", "들으니", "세째", "생물이", "말하되", "오라", "하기로", "내가", "보니", "검은", "말이", "나오는데", "그", "탄", "자가", "손에", "저울을", "가졌더라"] },
        { text: "내가 네 생물 사이로서 나는듯하는 음성을 들으니 가로되 한 데나리온에 밀 한되요 한 데나리온에 보리 석되로다 또 감람유와 포도주는 해치 말라 하더라", chunks: ["내가", "네", "생물", "사이로서", "나는듯하는", "음성을", "들으니", "가로되", "한", "데나리온에", "밀", "한되요", "한", "데나리온에", "보리", "석되로다", "또", "감람유와", "포도주는", "해치", "말라", "하더라"] },
        { text: "네째 인을 떼실 때에 내가 네째 생물의 음성을 들으니 가로되 오라 하기로", chunks: ["네째", "인을", "떼실", "때에", "내가", "네째", "생물의", "음성을", "들으니", "가로되", "오라", "하기로"] },
        { text: "내가 보매 청황색 말이 나오는데 그 탄 자의 이름은 사망이니 음부가 그 뒤를 따르더라 저희가 땅 사분 일의 권세를 얻어 검과 흉년과 사망과 땅의 짐승으로써 죽이더라", chunks: ["내가", "보매", "청황색", "말이", "나오는데", "그", "탄", "자의", "이름은", "사망이니", "음부가", "그", "뒤를", "따르더라", "저희가", "땅", "사분", "일의", "권세를", "얻어", "검과", "흉년과", "사망과", "땅의", "짐승으로써", "죽이더라"] },
        { text: "다섯째 인을 떼실 때에 내가 보니 하나님의 말씀과 저희의 가진 증거를 인하여 죽임을 당한 영혼들이 제단 아래 있어", chunks: ["다섯째", "인을", "떼실", "때에", "내가", "보니", "하나님의", "말씀과", "저희의", "가진", "증거를", "인하여", "죽임을", "당한", "영혼들이", "제단", "아래", "있어"] },
        { text: "큰 소리로 불러 가로되 거룩하고 참되신 대주재여 땅에 거하는 자들을 심판하여 우리 피를 신원하여 주지 아니하시기를 어느 때까지 하시려나이까 하니", chunks: ["큰", "소리로", "불러", "가로되", "거룩하고", "참되신", "대주재여", "땅에", "거하는", "자들을", "심판하여", "우리", "피를", "신원하여", "주지", "아니하시기를", "어느", "때까지", "하시려나이까", "하니"] },
        { text: "각각 저희에게 흰 두루마기를 주시며 가라사대 아직 잠시 동안 쉬되 저희 동무 종들과 형제들도 자기처럼 죽임을 받아 그 수가 차기까지 하라 하시더라", chunks: ["각각", "저희에게", "흰", "두루마기를", "주시며", "가라사대", "아직", "잠시", "동안", "쉬되", "저희", "동무", "종들과", "형제들도", "자기처럼", "죽임을", "받아", "그", "수가", "차기까지", "하라", "하시더라"] },
        { text: "내가 보니 여섯째 인을 떼실 때에 큰 지진이 나며 해가 총담 같이 검어지고 온 달이 피 같이 되며", chunks: ["내가", "보니", "여섯째", "인을", "떼실", "때에", "큰", "지진이", "나며", "해가", "총담", "같이", "검어지고", "온", "달이", "피", "같이", "되며"] },
        { text: "하늘의 별들이 무화과나무가 대풍에 흔들려 선 과실이 떨어지는것 같이 땅에 떨어지며", chunks: ["하늘의", "별들이", "무화과나무가", "대풍에", "흔들려", "선", "과실이", "떨어지는것", "같이", "땅에", "떨어지며"] },
        { text: "하늘은 종이 축이 말리는것 같이 떠나가고 각 산과 섬이 제 자리에서 옮기우매", chunks: ["하늘은", "종이", "축이", "말리는것", "같이", "떠나가고", "각", "산과", "섬이", "제", "자리에서", "옮기우매"] },
        { text: "땅의 임금들과 왕족들과 장군들과 부자들과 강한 자들과 각 종과 자주자가 굴과 산 바위틈에 숨어", chunks: ["땅의", "임금들과", "왕족들과", "장군들과", "부자들과", "강한", "자들과", "각", "종과", "자주자가", "굴과", "산", "바위틈에", "숨어"] },
        { text: "산과 바위에게 이르되 우리 위에 떨어져 보좌에 앉으신 이의 낯에서와 어린 양의 진노에서 우리를 가리우라", chunks: ["산과", "바위에게", "이르되", "우리", "위에", "떨어져", "보좌에", "앉으신", "이의", "낯에서와", "어린", "양의", "진노에서", "우리를", "가리우라"] },
        { text: "그들의 진노의 큰 날이 이르렀으니 누가 능히 서리요 하더라", chunks: ["그들의", "진노의", "큰", "날이", "이르렀으니", "누가", "능히", "서리요", "하더라"] }
    ],
    7: [
        { text: "이 일 후에 내가 네 천사가 땅 네 모퉁이에 선 것을 보니 땅의 사방의 바람을 붙잡아 바람으로 하여금 땅에나 바다에나 각종 나무에 불지 못하게 하더라", chunks: ["이", "일", "후에", "내가", "네", "천사가", "땅", "네", "모퉁이에", "선", "것을", "보니", "땅의", "사방의", "바람을", "붙잡아", "바람으로", "하여금", "땅에나", "바다에나", "각종", "나무에", "불지", "못하게", "하더라"] },
        { text: "또 보매 다른 천사가 살아계신 하나님의 인을 가지고 해 돋는 데로부터 올라와서 땅과 바다를 해롭게 할 권세를 얻은 네 천사를 향하여 큰 소리로 외쳐", chunks: ["또", "보매", "다른", "천사가", "살아계신", "하나님의", "인을", "가지고", "해", "돋는", "데로부터", "올라와서", "땅과", "바다를", "해롭게", "할", "권세를", "얻은", "네", "천사를", "향하여", "큰", "소리로", "외쳐"] },
        { text: "가로되 우리가 우리 하나님의 종들의 이마에 인치기까지 땅이나 바다나 나무나 해하지 말라 하더라", chunks: ["가로되", "우리가", "우리", "하나님의", "종들의", "이마에", "인치기까지", "땅이나", "바다나", "나무나", "해하지", "말라", "하더라"] },
        { text: "내가 인맞은 자의 수를 들으니 이스라엘 자손의 각 지파 중에서 인맞은 자들이 십 사만 사천이니", chunks: ["내가", "인맞은", "자의", "수를", "들으니", "이스라엘", "자손의", "각", "지파", "중에서", "인맞은", "자들이", "십", "사만", "사천이니"] },
        { text: "유다 지파 중에 인맞은 자가 일만 이천이요 르우벤 지파 중에 일만 이천이요 갓 지파 중에 일만 이천이요", chunks: ["유다", "지파", "중에", "인맞은", "자가", "일만", "이천이요", "르우벤", "지파", "중에", "일만", "이천이요", "갓", "지파", "중에", "일만", "이천이요"] },
        { text: "아셀 지파 중에 일만 이천이요 납달리 지파 중에 일만 이천이요 므낫세 지파 중에 일만 이천이요", chunks: ["아셀", "지파", "중에", "일만", "이천이요", "납달리", "지파", "중에", "일만", "이천이요", "므낫세", "지파", "중에", "일만", "이천이요"] },
        { text: "시므온 지파 중에 일만 이천이요 레위 지파 중에 일만 이천이요 잇사갈 지파 중에 일만 이천이요", chunks: ["시므온", "지파", "중에", "일만", "이천이요", "레위", "지파", "중에", "일만", "이천이요", "잇사갈", "지파", "중에", "일만", "이천이요"] },
        { text: "스불론 지파 중에 일만 이천이요 요셉 지파 중에 일만 이천이요 베냐민 지파 중에 인맞은 자가 일만 이천이라", chunks: ["스불론", "지파", "중에", "일만", "이천이요", "요셉", "지파", "중에", "일만", "이천이요", "베냐민", "지파", "중에", "인맞은", "자가", "일만", "이천이라"] },
        { text: "이 일 후에 내가 보니 각 나라와 족속과 백성과 방언에서 아무라도 능히 셀 수 없는 큰 무리가 흰 옷을 입고 손에 종려 가지를 들고 보좌 앞과 어린 양 앞에 서서", chunks: ["이", "일", "후에", "내가", "보니", "각", "나라와", "족속과", "백성과", "방언에서", "아무라도", "능히", "셀", "수", "없는", "큰", "무리가", "흰", "옷을", "입고", "손에", "종려", "가지를", "들고", "보좌", "앞과", "어린", "양", "앞에", "서서"] },
        { text: "큰 소리로 외쳐 가로되 구원하심이 보좌에 앉으신 우리 하나님과 어린 양에게 있도다 하니", chunks: ["큰", "소리로", "외쳐", "가로되", "구원하심이", "보좌에", "앉으신", "우리", "하나님과", "어린", "양에게", "있도다", "하니"] },
        { text: "모든 천사가 보좌와 장로들과 네 생물의 주위에 섰다가 보좌 앞에 엎드려 얼굴을 대고 하나님께 경배하여", chunks: ["모든", "천사가", "보좌와", "장로들과", "네", "생물의", "주위에", "섰다가", "보좌", "앞에", "엎드려", "얼굴을", "대고", "하나님께", "경배하여"] },
        { text: "가로되 아멘 찬송과 영광과 지혜와 감사와 존귀와 능력과 힘이 우리 하나님께 세세토록 있을찌로다 아멘 하더라", chunks: ["가로되", "아멘", "찬송과", "영광과", "지혜와", "감사와", "존귀와", "능력과", "힘이", "우리", "하나님께", "세세토록", "있을찌로다", "아멘", "하더라"] },
        { text: "장로 중에 하나가 응답하여 내게 이르되 이 흰옷 입은 자들이 누구며 또 어디서 왔느뇨", chunks: ["장로", "중에", "하나가", "응답하여", "내게", "이르되", "이", "흰옷", "입은", "자들이", "누구며", "또", "어디서", "왔느뇨"] },
        { text: "내가 가로되 내 주여 당신이 알리이다 하니 그가 나더러 이르되 이는 큰 환난에서 나오는 자들인데 어린양의 피에 그 옷을 씻어 희게 하였느니라", chunks: ["내가", "가로되", "내", "주여", "당신이", "알리이다", "하니", "그가", "나더러", "이르되", "이는", "큰", "환난에서", "나오는", "자들인데", "어린양의", "피에", "그", "옷을", "씻어", "희게", "하였느니라"] },
        { text: "그러므로 그들이 하나님의 보좌 앞에 있고 또 그의 성전에서 밤낮 하나님을 섬기매 보좌에 앉으신 이가 그들 위에 장막을 치시리니", chunks: ["그러므로", "그들이", "하나님의", "보좌", "앞에", "있고", "또", "그의", "성전에서", "밤낮", "하나님을", "섬기매", "보좌에", "앉으신", "이가", "그들", "위에", "장막을", "치시리니"] },
        { text: "저희가 다시 주리지도 아니하며 목마르지도 아니하고 해나 아무 뜨거운 기운에 상하지 아니할찌니", chunks: ["저희가", "다시", "주리지도", "아니하며", "목마르지도", "아니하고", "해나", "아무", "뜨거운", "기운에", "상하지", "아니할찌니"] },
        { text: "이는 보좌 가운데 계신 어린 양이 저희의 목자가 되사 생명수 샘으로 인도하시고 하나님께서 저희 눈에서 모든 눈물을 씻어 주실 것임이러라", chunks: ["이는", "보좌", "가운데", "계신", "어린", "양이", "저희의", "목자가", "되사", "생명수", "샘으로", "인도하시고", "하나님께서", "저희", "눈에서", "모든", "눈물을", "씻어", "주실", "것임이러라"] }
    ],
    8: [
        { text: "일곱째 인을 떼실 때에 하늘이 반시 동안쯤 고요하더니", chunks: ["일곱째", "인을", "떼실", "때에", "하늘이", "반시", "동안쯤", "고요하더니"] },
        { text: "내가 보매 하나님 앞에 시위한 일곱 천사가 있어 일곱 나팔을 받았더라", chunks: ["내가", "보매", "하나님", "앞에", "시위한", "일곱", "천사가", "있어", "일곱", "나팔을", "받았더라"] },
        { text: "또 다른 천사가 와서 제단 곁에 서서 금 향로를 가지고 많은 향을 받았으니 이는 모든 성도의 기도들과 합하여 보좌 앞 금단에 드리고자 함이라", chunks: ["또", "다른", "천사가", "와서", "제단", "곁에", "서서", "금", "향로를", "가지고", "많은", "향을", "받았으니", "이는", "모든", "성도의", "기도들과", "합하여", "보좌", "앞", "금단에", "드리고자", "함이라"] },
        { text: "향연이 성도의 기도와 함께 천사의 손으로부터 하나님 앞으로 올라가는지라", chunks: ["향연이", "성도의", "기도와", "함께", "천사의", "손으로부터", "하나님", "앞으로", "올라가는지라"] },
        { text: "천사가 향로를 가지고 단 위의 불을 담아다가 땅에 쏟으매 뇌성과 음성과 번개와 지진이 나더라", chunks: ["천사가", "향로를", "가지고", "단", "위의", "불을", "담아다가", "땅에", "쏟으매", "뇌성과", "음성과", "번개와", "지진이", "나더라"] },
        { text: "일곱 나팔 가진 일곱 천사가 나팔 불기를 예비하더라", chunks: ["일곱", "나팔", "가진", "일곱", "천사가", "나팔", "불기를", "예비하더라"] },
        { text: "첫째 천사가 나팔을 부니 피 섞인 우박과 불이 나서 땅에 쏟아지매 땅의 삼분의 일이 타서 사위고 수목의 삼분의 일도 타서 사위고 각종 푸른 풀도 타서 사위더라", chunks: ["첫째", "천사가", "나팔을", "부니", "피", "섞인", "우박과", "불이", "나서", "땅에", "쏟아지매", "땅의", "삼분의", "일이", "타서", "사위고", "수목의", "삼분의", "일도", "타서", "사위고", "각종", "푸른", "풀도", "타서", "사위더라"] },
        { text: "둘째 천사가 나팔을 부니 불붙는 큰 산과 같은 것이 바다에 던지우매 바다의 삼분의 일이 피가 되고", chunks: ["둘째", "천사가", "나팔을", "부니", "불붙는", "큰", "산과", "같은", "것이", "바다에", "던지우매", "바다의", "삼분의", "일이", "피가", "되고"] },
        { text: "바다 가운데 생명 가진 피조물들의 삼분의 일이 죽고 배들의 삼분의 일이 깨어지더라", chunks: ["바다", "가운데", "생명", "가진", "피조물들의", "삼분의", "일이", "죽고", "배들의", "삼분의", "일이", "깨어지더라"] },
        { text: "세째 천사가 나팔을 부니 횃불 같이 타는 큰 별이 하늘에서 떨어져 강들의 삼분의 일과 여러 물샘에 떨어지니", chunks: ["세째", "천사가", "나팔을", "부니", "횃불", "같이", "타는", "큰", "별이", "하늘에서", "떨어져", "강들의", "삼분의", "일과", "여러", "물샘에", "떨어지니"] },
        { text: "이 별 이름은 쑥이라 물들의 삼분의 일이 쑥이 되매 그 물들이 쓰게 됨을 인하여 많은 사람이 죽더라", chunks: ["이", "별", "이름은", "쑥이라", "물들의", "삼분의", "일이", "쑥이", "되매", "그", "물들이", "쓰게", "됨을", "인하여", "많은", "사람이", "죽더라"] },
        { text: "네째 천사가 나팔을 부니 해 삼분의 일과 달 삼분의 일과 별들의 삼분의 일이 침을 받아 그 삼분의 일이 어두워지니 낮 삼분의 일은 비췸이 없고 밤도 그러하더라", chunks: ["네째", "천사가", "나팔을", "부니", "해", "삼분의", "일과", "달", "삼분의", "일과", "별들의", "삼분의", "일이", "침을", "받아", "그", "삼분의", "일이", "어두워지니", "낮", "삼분의", "일은", "비췸이", "없고", "밤도", "그러하더라"] },
        { text: "내가 또 보고 들으니 공중에 날아가는 독수리가 큰 소리로 이르되 땅에 거하는 자들에게 화, 화, 화가 있으리로다 이 외에도 세 천사의 불 나팔소리를 인함이로다 하더라", chunks: ["내가", "또", "보고", "들으니", "공중에", "날아가는", "독수리가", "큰", "소리로", "이르되", "땅에", "거하는", "자들에게", "화,", "화,", "화가", "있으리로다", "이", "외에도", "세", "천사의", "불", "나팔소리를", "인함이로다", "하더라"] }
    ],
    9: [
        { text: "다섯째 천사가 나팔을 불매 내가 보니 하늘에서 땅에 떨어진 별 하나가 있는데 저가 무저갱의 열쇠를 받았더라", chunks: ["다섯째", "천사가", "나팔을", "불매", "내가", "보니", "하늘에서", "땅에", "떨어진", "별", "하나가", "있는데", "저가", "무저갱의", "열쇠를", "받았더라"] },
        { text: "저가 무저갱을 여니 그 구멍에서 큰 풀무의 연기 같은 연기가 올라오매 해와 공기가 그 구멍의 연기로 인하여 어두워지며", chunks: ["저가", "무저갱을", "여니", "그", "구멍에서", "큰", "풀무의", "연기", "같은", "연기가", "올라오매", "해와", "공기가", "그", "구멍의", "연기로", "인하여", "어두워지며"] },
        { text: "또 황충이 연기 가운데로부터 땅 위에 나오매 저희가 땅에 있는 전갈의 권세와 같은 권세를 받았더라", chunks: ["또", "황충이", "연기", "가운데로부터", "땅", "위에", "나오매", "저희가", "땅에", "있는", "전갈의", "권세와", "같은", "권세를", "받았더라"] },
        { text: "저희에게 이르시되 땅의 풀이나 푸른 것이나 각종 수목은 해하지 말고 오직 이마에 하나님의 인 맞지 아니한 사람들만 해하라 하시더라", chunks: ["저희에게", "이르시되", "땅의", "풀이나", "푸른", "것이나", "각종", "수목은", "해하지", "말고", "오직", "이마에", "하나님의", "인", "맞지", "아니한", "사람들만", "해하라", "하시더라"] },
        { text: "그러나 그들을 죽이지는 못하게 하시고 다섯달 동안 괴롭게만 하게 하시는데 그 괴롭게 함은 전갈이 사람을 쏠 때에 괴롭게 함과 같더라", chunks: ["그러나", "그들을", "죽이지는", "못하게", "하시고", "다섯달", "동안", "괴롭게만", "하게", "하시는데", "그", "괴롭게", "함은", "전갈이", "사람을", "쏠", "때에", "괴롭게", "함과", "같더라"] },
        { text: "그날에는 사람들이 죽기를 구하여도 얻지 못하고 죽고 싶으나 죽음이 저희를 피하리로다", chunks: ["그날에는", "사람들이", "죽기를", "구하여도", "얻지", "못하고", "죽고", "싶으나", "죽음이", "저희를", "피하리로다"] },
        { text: "황충들의 모양은 전쟁을 위하여 예비한 말들 같고 그 머리에 금 같은 면류관 비슷한 것을 썼으며 그 얼굴은 사람의 얼굴 같고", chunks: ["황충들의", "모양은", "전쟁을", "위하여", "예비한", "말들", "같고", "그", "머리에", "금", "같은", "면류관", "비슷한", "것을", "썼으며", "그", "얼굴은", "사람의", "얼굴", "같고"] },
        { text: "또 여자의 머리털 같은 머리털이 있고 그 이는 사자의 이 같으며", chunks: ["또", "여자의", "머리털", "같은", "머리털이", "있고", "그", "이는", "사자의", "이", "같으며"] },
        { text: "또 철흉갑 같은 흉갑이 있고 그 날개들의 소리는 병거와 많은 말들이 전장으로 달려 들어가는 소리 같으며", chunks: ["또", "철흉갑", "같은", "흉갑이", "있고", "그", "날개들의", "소리는", "병거와", "많은", "말들이", "전장으로", "달려", "들어가는", "소리", "같으며"] },
        { text: "또 전갈과 같은 꼬리와 쏘는 살이 있어 그 꼬리에는 다섯달 동안 사람들을 해하는 권세가 있더라", chunks: ["또", "전갈과", "같은", "꼬리와", "쏘는", "살이", "있어", "그", "꼬리에는", "다섯달", "동안", "사람들을", "해하는", "권세가", "있더라"] },
        { text: "저희에게 임금이 있으니 무저갱의 사자라 히브리 음으로 이름은 아바돈이요 헬라 음으로 이름은 아볼루온이더라", chunks: ["저희에게", "임금이", "있으니", "무저갱의", "사자라", "히브리", "음으로", "이름은", "아바돈이요", "헬라", "음으로", "이름은", "아볼루온이더라"] },
        { text: "첫째 화는 지나갔으나 보라 아직도 이 후에 화 둘이 이르리로다", chunks: ["첫째", "화는", "지나갔으나", "보라", "아직도", "이", "후에", "화", "둘이", "이르리로다"] },
        { text: "여섯째 천사가 나팔을 불매 내가 들으니 하나님 앞 금단 네 뿔에서 한 음성이 나서", chunks: ["여섯째", "천사가", "나팔을", "불매", "내가", "들으니", "하나님", "앞", "금단", "네", "뿔에서", "한", "음성이", "나서"] },
        { text: "나팔 가진 여섯째 천사에게 말하기를 큰 강 유브라데에 결박한 네 천사를 놓아 주라 하매", chunks: ["나팔", "가진", "여섯째", "천사에게", "말하기를", "큰", "강", "유브라데에", "결박한", "네", "천사를", "놓아", "주라", "하매"] },
        { text: "네 천사가 놓였으니 그들은 그 년 월 일 시에 이르러 사람 삼분의 일을 죽이기로 예비한 자들이더라", chunks: ["네", "천사가", "놓였으니", "그들은", "그", "년", "월", "일", "시에", "이르러", "사람", "삼분의", "일을", "죽이기로", "예비한", "자들이더라"] },
        { text: "마병대의 수는 이만만이니 내가 그들의 수를 들었노라", chunks: ["마병대의", "수는", "이만만이니", "내가", "그들의", "수를", "들었노라"] },
        { text: "이같이 이상한 가운데 그 말들과 그 탄 자들을 보니 불빛과 자주빛과 유황빛 흉갑이 있고 또 말들의 머리는 사자 머리 같고 그 입에서는 불과 연기와 유황이 나오더라", chunks: ["이같이", "이상한", "가운데", "그", "말들과", "그", "탄", "자들을", "보니", "불빛과", "자주빛과", "유황빛", "흉갑이", "있고", "또", "말들의", "머리는", "사자", "머리", "같고", "그", "입에서는", "불과", "연기와", "유황이", "나오더라"] },
        { text: "이 세 재앙 곧 저희 입에서 나오는 불과 연기와 유황을 인하여 사람 삼분의 일이 죽임을 당하니라", chunks: ["이", "세", "재앙", "곧", "저희", "입에서", "나오는", "불과", "연기와", "유황을", "인하여", "사람", "삼분의", "일이", "죽임을", "당하니라"] },
        { text: "이 말들의 힘은 그 입과 그 꼬리에 있으니 그 꼬리는 뱀 같고 또 꼬리에 머리가 있어 이것으로 해하더라", chunks: ["이", "말들의", "힘은", "그", "입과", "그", "꼬리에", "있으니", "그", "꼬리는", "뱀", "같고", "또", "꼬리에", "머리가", "있어", "이것으로", "해하더라"] },
        { text: "이 재앙에 죽지 않고 남은 사람들은 그 손으로 행하는 일을 회개치 아니하고 오히려 여러 귀신과 또는 보거나 듣거나 다니거나 하지 못하는 금, 은, 동과 목석의 우상에게 절하고", chunks: ["이", "재앙에", "죽지", "않고", "남은", "사람들은", "그", "손으로", "행하는", "일을", "회개치", "아니하고", "오히려", "여러", "귀신과", "또는", "보거나", "듣거나", "다니거나", "하지", "못하는", "금,", "은,", "동과", "목석의", "우상에게", "절하고"] },
        { text: "또 그 살인과 복술과 음행과 도적질을 회개치 아니하더라", chunks: ["또", "그", "살인과", "복술과", "음행과", "도적질을", "회개치", "아니하더라"] }
    ],
    10: [
        { text: "내가 또 보니 힘센 다른 천사가 구름을 입고 하늘에서 내려 오는데 그 머리 위에 무지개가 있고 그 얼굴은 해 같고 그 발은 불기둥 같으며", chunks: ["내가", "또", "보니", "힘센", "다른", "천사가", "구름을", "입고", "하늘에서", "내려", "오는데", "그", "머리", "위에", "무지개가", "있고", "그", "얼굴은", "해", "같고", "그", "발은", "불기둥", "같으며"] },
        { text: "그 손에 펴 놓인 작은 책을 들고 그 오른발은 바다를 밟고 왼발은 땅을 밟고", chunks: ["그", "손에", "펴", "놓인", "작은", "책을", "들고", "그", "오른발은", "바다를", "밟고", "왼발은", "땅을", "밟고"] },
        { text: "사자의 부르짖는것 같이 큰 소리로 외치니 외칠 때에 일곱 우뢰가 그 소리를 발하더라", chunks: ["사자의", "부르짖는것", "같이", "큰", "소리로", "외치니", "외칠", "때에", "일곱", "우뢰가", "그", "소리를", "발하더라"] },
        { text: "일곱 우뢰가 발할 때에 내가 기록하려고 하다가 곧 들으니 하늘에서 소리나서 말하기를 일곱 우뢰가 발한 것을 인봉하고 기록하지 말라 하더라", chunks: ["일곱", "우뢰가", "발할", "때에", "내가", "기록하려고", "하다가", "곧", "들으니", "하늘에서", "소리나서", "말하기를", "일곱", "우뢰가", "발한", "것을", "인봉하고", "기록하지", "말라", "하더라"] },
        { text: "내가 본바 바다와 땅을 밟고 섰는 천사가 하늘을 향하여 오른손을 들고", chunks: ["내가", "본바", "바다와", "땅을", "밟고", "섰는", "천사가", "하늘을", "향하여", "오른손을", "들고"] },
        { text: "세세토록 살아계신 자 곧 하늘과 그 가운데 있는 물건이며 땅과 그 가운데 있는 물건이며 바다와 그 가운데 있는 물건을 창조하신 이를 가리켜 맹세하여 가로되 지체하지 아니하리니", chunks: ["세세토록", "살아계신", "자", "곧", "하늘과", "그", "가운데", "있는", "물건이며", "땅과", "그", "가운데", "있는", "물건이며", "바다와", "그", "가운데", "있는", "물건을", "창조하신", "이를", "가리켜", "맹세하여", "가로되", "지체하지", "아니하리니"] },
        { text: "일곱째 천사가 소리 내는 날 그 나팔을 불게 될 때에 하나님의 비밀이 그 종 선지자들에게 전하신 복음과 같이 이루리라", chunks: ["일곱째", "천사가", "소리", "내는", "날", "그", "나팔을", "불게", "될", "때에", "하나님의", "비밀이", "그", "종", "선지자들에게", "전하신", "복음과", "같이", "이루리라"] },
        { text: "하늘에서 나서 내게 들리던 음성이 또 내게 말하여 가로되 네가 가서 바다와 땅을 밟고 섰는 천사의 손에 펴 놓인 책을 가지라 하기로", chunks: ["하늘에서", "나서", "내게", "들리던", "음성이", "또", "내게", "말하여", "가로되", "네가", "가서", "바다와", "땅을", "밟고", "섰는", "천사의", "손에", "펴", "놓인", "책을", "가지라", "하기로"] },
        { text: "내가 천사에게 나아가 작은 책을 달라 한즉 천사가 가로되 갖다 먹어버리라 네 배에는 쓰나 네 입에는 꿀 같이 달리라 하거늘", chunks: ["내가", "천사에게", "나아가", "작은", "책을", "달라", "한즉", "천사가", "가로되", "갖다", "먹어버리라", "네", "배에는", "쓰나", "네", "입에는", "꿀", "같이", "달리라", "하거늘"] },
        { text: "내가 천사의 손에서 작은 책을 갖다 먹어버리니 내 입에는 꿀 같이 다나 먹은 후에 내 배에서는 쓰게 되더라", chunks: ["내가", "천사의", "손에서", "작은", "책을", "갖다", "먹어버리니", "내", "입에는", "꿀", "같이", "다나", "먹은", "후에", "내", "배에서는", "쓰게", "되더라"] },
        { text: "저가 내게 말하기를 네가 많은 백성과 나라와 방언과 임금에게 다시 예언하여야 하리라 하더라", chunks: ["저가", "내게", "말하기를", "네가", "많은", "백성과", "나라와", "방언과", "임금에게", "다시", "예언하여야", "하리라", "하더라"] }
    ],

    11: [
        { text: "또 내게 지팡이 같은 갈대를 주며 말하기를 일어나서 하나님의 성전과 제단과 그 안에서 경배하는 자들을 척량하되", chunks: ["또", "내게", "지팡이", "같은", "갈대를", "주며", "말하기를", "일어나서", "하나님의", "성전과", "제단과", "그", "안에서", "경배하는", "자들을", "척량하되"] },
        { text: "성전 밖 마당은 척량하지 말고 그냥 두라 이것을 이방인에게 주었은즉 저희가 거룩한 성을 마흔 두달 동안 짓밟으리라", chunks: ["성전", "밖", "마당은", "척량하지", "말고", "그냥", "두라", "이것을", "이방인에게", "주었은즉", "저희가", "거룩한", "성을", "마흔", "두달", "동안", "짓밟으리라"] },
        { text: "내가 나의 두 증인에게 권세를 주리니 저희가 굵은 베옷을 입고 일천 이백 육십 일을 예언하리라", chunks: ["내가", "나의", "두", "증인에게", "권세를", "주리니", "저희가", "굵은", "베옷을", "입고", "일천", "이백", "육십", "일을", "예언하리라"] },
        { text: "이는 이 땅의 주 앞에 섰는 두 감람나무와 두 촛대니", chunks: ["이는", "이", "땅의", "주", "앞에", "섰는", "두", "감람나무와", "두", "촛대니"] },
        { text: "만일 누구든지 저희를 해하고자 한즉 저희 입에서 불이 나서 그 원수를 소멸할찌니 누구든지 해하려 하면 반드시 이와 같이 죽임을 당하리라", chunks: ["만일", "누구든지", "저희를", "해하고자", "한즉", "저희", "입에서", "불이", "나서", "그", "원수를", "소멸할찌니", "누구든지", "해하려", "하면", "반드시", "이와", "같이", "죽임을", "당하리라"] },
        { text: "저희가 권세를 가지고 하늘을 닫아 그 예언을 하는 날 동안 비 오지 못하게 하고 또 권세를 가지고 물을 변하여 피 되게 하고 아무 때든지 원하는 대로 여러가지 재앙으로 땅을 치리로다", chunks: ["저희가", "권세를", "가지고", "하늘을", "닫아", "그", "예언을", "하는", "날", "동안", "비", "오지", "못하게", "하고", "또", "권세를", "가지고", "물을", "변하여", "피", "되게", "하고", "아무", "때든지", "원하는", "대로", "여러가지", "재앙으로", "땅을", "치리로다"] },
        { text: "저희가 그 증거를 마칠 때에 무저갱으로부터 올라오는 짐승이 저희로 더불어 전쟁을 일으켜 저희를 이기고 저희를 죽일터인즉", chunks: ["저희가", "그", "증거를", "마칠", "때에", "무저갱으로부터", "올라오는", "짐승이", "저희로", "더불어", "전쟁을", "일으켜", "저희를", "이기고", "저희를", "죽일터인즉"] },
        { text: "저희 시체가 큰 성길에 있으리니 그 성은 영적으로 하면 소돔이라고도 하고 애굽이라고도 하니 곧 저희 주께서 십자가에 못 박히신 곳이니라", chunks: ["저희", "시체가", "큰", "성길에", "있으리니", "그", "성은", "영적으로", "하면", "소돔이라고도", "하고", "애굽이라고도", "하니", "곧", "저희", "주께서", "십자가에", "못", "박히신", "곳이니라"] },
        { text: "백성들과 족속과 방언과 나라 중에서 사람들이 그 시체를 사흘 반 동안을 목도하며 무덤에 장사하지 못하게 하리로다", chunks: ["백성들과", "족속과", "방언과", "나라", "중에서", "사람들이", "그", "시체를", "사흘", "반", "동안을", "목도하며", "무덤에", "장사하지", "못하게", "하리로다"] },
        { text: "이 두 선지자가 땅에 거하는 자들을 괴롭게 한고로 땅에 거하는 자들이 저희의 죽음을 즐거워하고 기뻐하여 서로 예물을 보내리라 하더라", chunks: ["이", "두", "선지자가", "땅에", "거하는", "자들을", "괴롭게", "한고로", "땅에", "거하는", "자들이", "저희의", "죽음을", "즐거워하고", "기뻐하여", "서로", "예물을", "보내리라", "하더라"] },
        { text: "삼일 반 후에 하나님께로부터 생기가 저희 속에 들어가매 저희가 발로 일어서니 구경하는 자들이 크게 두려워하더라", chunks: ["삼일", "반", "후에", "하나님께로부터", "생기가", "저희", "속에", "들어가매", "저희가", "발로", "일어서니", "구경하는", "자들이", "크게", "두려워하더라"] },
        { text: "하늘로부터 큰 음성이 있어 이리로 올라오라 함을 저희가 듣고 구름을 타고 하늘로 올라가니 저희 원수들도 구경하더라", chunks: ["하늘로부터", "큰", "음성이", "있어", "이리로", "올라오라", "함을", "저희가", "듣고", "구름을", "타고", "하늘로", "올라가니", "저희", "원수들도", "구경하더라"] },
        { text: "그 시에 큰 지진이 나서 성 십분의 일이 무너지고 지진에 죽은 사람이 칠천이라 그 남은 자들이 두려워하여 영광을 하늘의 하나님께 돌리더라", chunks: ["그", "시에", "큰", "지진이", "나서", "성", "십분의", "일이", "무너지고", "지진에", "죽은", "사람이", "칠천이라", "그", "남은", "자들이", "두려워하여", "영광을", "하늘의", "하나님께", "돌리더라"] },
        { text: "둘째 화는 지나갔으나 보라 세째 화가 속히 이르는도다", chunks: ["둘째", "화는", "지나갔으나", "보라", "세째", "화가", "속히", "이르는도다"] },
        { text: "일곱째 천사가 나팔을 불매 하늘에 큰 음성들이 나서 가로되 세상 나라가 우리 주와 그 그리스도의 나라가 되어 그가 세세토록 왕노릇 하시리로다 하니", chunks: ["일곱째", "천사가", "나팔을", "불매", "하늘에", "큰", "음성들이", "나서", "가로되", "세상", "나라가", "우리", "주와", "그", "그리스도의", "나라가", "되어", "그가", "세세토록", "왕노릇", "하시리로다", "하니"] },
        { text: "하나님 앞에 자기 보좌에 앉은 이십 사 장로들이 엎드려 얼굴을 대고 하나님께 경배하여", chunks: ["하나님", "앞에", "자기", "보좌에", "앉은", "이십", "사", "장로들이", "엎드려", "얼굴을", "대고", "하나님께", "경배하여"] },
        { text: "가로되 감사하옵나니 옛적에도 계셨고 시방도 계신 주 하나님 곧 전능하신이여 친히 큰 권능을 잡으시고 왕노릇 하시도다", chunks: ["가로되", "감사하옵나니", "옛적에도", "계셨고", "시방도", "계신", "주", "하나님", "곧", "전능하신이여", "친히", "큰", "권능을", "잡으시고", "왕노릇", "하시도다"] },
        { text: "이방들이 분노하매 주의 진노가 임하여 죽은 자를 심판하시며 종 선지자들과 성도들과 또 무론대소하고 주의 이름을 경외하는 자들에게 상 주시며 또 땅을 망하게 하는 자들을 멸망시키실 때로소이다 하더라", chunks: ["이방들이", "분노하매", "주의", "진노가", "임하여", "죽은", "자를", "심판하시며", "종", "선지자들과", "성도들과", "또", "무론대소하고", "주의", "이름을", "경외하는", "자들에게", "상", "주시며", "또", "땅을", "망하게", "하는", "자들을", "멸망시키실", "때로소이다", "하더라"] },
        { text: "이에 하늘에 있는 하나님의 성전이 열리니 성전 안에 하나님의 언약궤가 보이며 또 번개와 음성들과 뇌성과 지진과 큰 우박이 있더라", chunks: ["이에", "하늘에", "있는", "하나님의", "성전이", "열리니", "성전", "안에", "하나님의", "언약궤가", "보이며", "또", "번개와", "음성들과", "뇌성과", "지진과", "큰", "우박이", "있더라"] }
    ],
    12: [
        { text: "하늘에 큰 이적이 보이니 해를 입은 한 여자가 있는데 그 발 아래는 달이 있고 그 머리에는 열 두 별의 면류관을 썼더라", chunks: ["하늘에", "큰", "이적이", "보이니", "해를", "입은", "한", "여자가", "있는데", "그", "발", "아래는", "달이", "있고", "그", "머리에는", "열", "두", "별의", "면류관을", "썼더라"] },
        { text: "이 여자가 아이를 배어 해산하게 되매 아파서 애써 부르짖더라", chunks: ["이", "여자가", "아이를", "배어", "해산하게", "되매", "아파서", "애써", "부르짖더라"] },
        { text: "하늘에 또 다른 이적이 보이니 보라 한 큰 붉은 용이 있어 머리가 일곱이요 뿔이 열이라 그 여러 머리에 일곱 면류관이 있는데", chunks: ["하늘에", "또", "다른", "이적이", "보이니", "보라", "한", "큰", "붉은", "용이", "있어", "머리가", "일곱이요", "뿔이", "열이라", "그", "여러", "머리에", "일곱", "면류관이", "있는데"] },
        { text: "그 꼬리가 하늘 별 삼분의 일을 끌어다가 땅에 던지더라 용이 해산하려는 여자 앞에서 그가 해산하면 그 아이를 삼키고자 하더니", chunks: ["그", "꼬리가", "하늘", "별", "삼분의", "일을", "끌어다가", "땅에", "던지더라", "용이", "해산하려는", "여자", "앞에서", "그가", "해산하면", "그", "아이를", "삼키고자", "하더니"] },
        { text: "여자가 아들을 낳으니 이는 장차 철장으로 만국을 다스릴 남자라 그 아이를 하나님 앞과 그 보좌 앞으로 올려가더라", chunks: ["여자가", "아들을", "낳으니", "이는", "장차", "철장으로", "만국을", "다스릴", "남자라", "그", "아이를", "하나님", "앞과", "그", "보좌", "앞으로", "올려가더라"] },
        { text: "그 여자가 광야로 도망하매 거기서 일천 이백 육십일 동안 저를 양육하기 위하여 하나님의 예비하신 곳이 있더라", chunks: ["그", "여자가", "광야로", "도망하매", "거기서", "일천", "이백", "육십일", "동안", "저를", "양육하기", "위하여", "하나님의", "예비하신", "곳이", "있더라"] },
        { text: "하늘에 전쟁이 있으니 미가엘과 그의 사자들이 용으로 더불어 싸울쌔 용과 그의 사자들도 싸우나", chunks: ["하늘에", "전쟁이", "있으니", "미가엘과", "그의", "사자들이", "용으로", "더불어", "싸울쌔", "용과", "그의", "사자들도", "싸우나"] },
        { text: "이기지 못하여 다시 하늘에서 저희의 있을 곳을 얻지 못한지라", chunks: ["이기지", "못하여", "다시", "하늘에서", "저희의", "있을", "곳을", "얻지", "못한지라"] },
        { text: "큰 용이 내어 쫓기니 옛 뱀 곧 마귀라고도 하고 사단이라고도 하는 온 천하를 꾀는 자라 땅으로 내어 쫓기니 그의 사자들도 저와 함께 내어 쫓기니라", chunks: ["큰", "용이", "내어", "쫓기니", "옛", "뱀", "곧", "마귀라고도", "하고", "사단이라고도", "하는", "온", "천하를", "꾀는", "자라", "땅으로", "내어", "쫓기니", "그의", "사자들도", "저와", "함께", "내어", "쫓기니라"] },
        { text: "내가 또 들으니 하늘에 큰 음성이 있어 가로되 이제 우리 하나님의 구원과 능력과 나라와 또 그의 그리스도의 권세가 이루었으니 우리 형제들을 참소하던 자 곧 우리 하나님 앞에서 밤낮 참소하던 자가 쫓겨 났고", chunks: ["내가", "또", "들으니", "하늘에", "큰", "음성이", "있어", "가로되", "이제", "우리", "하나님의", "구원과", "능력과", "나라와", "또", "그의", "그리스도의", "권세가", "이루었으니", "우리", "형제들을", "참소하던", "자", "곧", "우리", "하나님", "앞에서", "밤낮", "참소하던", "자가", "쫓겨", "났고"] },
        { text: "또 여러 형제가 어린 양의 피와 자기의 증거하는 말을 인하여 저를 이기었으니 그들은 죽기까지 자기 생명을 아끼지 아니하였도다", chunks: ["또", "여러", "형제가", "어린", "양의", "피와", "자기의", "증거하는", "말을", "인하여", "저를", "이기었으니", "그들은", "죽기까지", "자기", "생명을", "아끼지", "아니하였도다"] },
        { text: "그러므로 하늘과 그 가운데 거하는 자들은 즐거워하라 그러나 땅과 바다는 화 있을찐저 이는 마귀가 자기의 때가 얼마 못된 줄을 알므로 크게 분내어 너희에게 내려 갔음이라 하더라", chunks: ["그러므로", "하늘과", "그", "가운데", "거하는", "자들은", "즐거워하라", "그러나", "땅과", "바다는", "화", "있을찐저", "이는", "마귀가", "자기의", "때가", "얼마", "못된", "줄을", "알므로", "크게", "분내어", "너희에게", "내려", "갔음이라", "하더라"] },
        { text: "용이 자기가 땅으로 내어쫓긴 것을 보고 남자를 낳은 여자를 핍박하는지라", chunks: ["용이", "자기가", "땅으로", "내어쫓긴", "것을", "보고", "남자를", "낳은", "여자를", "핍박하는지라"] },
        { text: "그 여자가 큰 독수리의 두 날개를 받아 광야 자기 곳으로 날아가 거기서 그 뱀의 낯을 피하여 한 때와 두 때와 반 때를 양육 받으매", chunks: ["그", "여자가", "큰", "독수리의", "두", "날개를", "받아", "광야", "자기", "곳으로", "날아가", "거기서", "그", "뱀의", "낯을", "피하여", "한", "때와", "두", "때와", "반", "때를", "양육", "받으매"] },
        { text: "여자의 뒤에서 뱀이 그 입으로 물을 강 같이 토하여 여자를 물에 떠내려 가게 하려 하되", chunks: ["여자의", "뒤에서", "뱀이", "그", "입으로", "물을", "강", "같이", "토하여", "여자를", "물에", "떠내려", "가게", "하려", "하되"] },
        { text: "땅이 여자를 도와 그 입을 벌려 용의 입에서 토한 강물을 삼키니", chunks: ["땅이", "여자를", "도와", "그", "입을", "벌려", "용의", "입에서", "토한", "강물을", "삼키니"] },
        { text: "용이 여자에게 분노하여 돌아가서 그 여자의 남은 자손 곧 하나님의 계명을 지키며 예수의 증거를 가진 자들로 더불어 싸우려고 바다 모래 위에 섰더라", chunks: ["용이", "여자에게", "분노하여", "돌아가서", "그", "여자의", "남은", "자손", "곧", "하나님의", "계명을", "지키며", "예수의", "증거를", "가진", "자들로", "더불어", "싸우려고", "바다", "모래", "위에", "섰더라"] }
    ],
    13: [
        { text: "내가 보니 바다에서 한 짐승이 나오는데 뿔이 열이요 머리가 일곱이라 그 뿔에는 열 면류관이 있고 그 머리들에는 참람된 이름들이 있더라", chunks: ["내가", "보니", "바다에서", "한", "짐승이", "나오는데", "뿔이", "열이요", "머리가", "일곱이라", "그", "뿔에는", "열", "면류관이", "있고", "그", "머리들에는", "참람된", "이름들이", "있더라"] },
        { text: "내가 본 짐승은 표범과 비슷하고 그 발은 곰의 발 같고 그 입은 사자의 입 같은데 용이 자기의 능력과 보좌와 큰 권세를 그에게 주었더라", chunks: ["내가", "본", "짐승은", "표범과", "비슷하고", "그", "발은", "곰의", "발", "같고", "그", "입은", "사자의", "입", "같은데", "용이", "자기의", "능력과", "보좌와", "큰", "권세를", "그에게", "주었더라"] },
        { text: "그의 머리 하나가 상하여 죽게 된 것 같더니 그 죽게 되었던 상처가 나으매 온 땅이 이상히 여겨 짐승을 따르고", chunks: ["그의", "머리", "하나가", "상하여", "죽게", "된", "것", "같더니", "그", "죽게", "되었던", "상처가", "나으매", "온", "땅이", "이상히", "여겨", "짐승을", "따르고"] },
        { text: "용이 짐승에게 권세를 주므로 용에게 경배하며 짐승에게 경배하여 가로되 누가 이 짐승과 같으뇨 누가 능히 이로 더불어 싸우리요 하더라", chunks: ["용이", "짐승에게", "권세를", "주므로", "용에게", "경배하며", "짐승에게", "경배하여", "가로되", "누가", "이", "짐승과", "같으뇨", "누가", "능히", "이로", "더불어", "싸우리요", "하더라"] },
        { text: "또 짐승이 큰 말과 참람된 말 하는 입을 받고 또 마흔 두달 일할 권세를 받으니라", chunks: ["또", "짐승이", "큰", "말과", "참람된", "말", "하는", "입을", "받고", "또", "마흔", "두달", "일할", "권세를", "받으니라"] },
        { text: "짐승이 입을 벌려 하나님을 향하여 훼방하되 그의 이름과 그의 장막 곧 하늘에 거하는 자들을 훼방하더라", chunks: ["짐승이", "입을", "벌려", "하나님을", "향하여", "훼방하되", "그의", "이름과", "그의", "장막", "곧", "하늘에", "거하는", "자들을", "훼방하더라"] },
        { text: "또 권세를 받아 성도들과 싸워 이기게 되고 각 족속과 백성과 방언과 나라를 다스리는 권세를 받으니", chunks: ["또", "권세를", "받아", "성도들과", "싸워", "이기게", "되고", "각", "족속과", "백성과", "방언과", "나라를", "다스리는", "권세를", "받으니"] },
        { text: "죽임을 당한 어린 양의 생명책에 창세 이후로 녹명되지 못하고 이 땅에 사는 자들은 다 짐승에게 경배하리라", chunks: ["죽임을", "당한", "어린", "양의", "생명책에", "창세", "이후로", "녹명되지", "못하고", "이", "땅에", "사는", "자들은", "다", "짐승에게", "경배하리라"] },
        { text: "누구든지 귀가 있거든 들을찌어다", chunks: ["누구든지", "귀가", "있거든", "들을찌어다"] },
        { text: "사로잡는 자는 사로잡힐 것이요 칼로 죽이는 자는 자기도 마땅히 칼에 죽으리니 성도들의 인내와 믿음이 여기 있느니라", chunks: ["사로잡는", "자는", "사로잡힐", "것이요", "칼로", "죽이는", "자는", "자기도", "마땅히", "칼에", "죽으리니", "성도들의", "인내와", "믿음이", "여기", "있느니라"] },
        { text: "내가 보매 또 다른 짐승이 땅에서 올라오니 새끼양 같이 두 뿔이 있고 용처럼 말하더라", chunks: ["내가", "보매", "또", "다른", "짐승이", "땅에서", "올라오니", "새끼양", "같이", "두", "뿔이", "있고", "용처럼", "말하더라"] },
        { text: "저가 먼저 나온 짐승의 모든 권세를 그 앞에서 행하고 땅과 땅에 거하는 자들로 처음 짐승에게 경배하게 하니 곧 죽게 되었던 상처가 나은 자니라", chunks: ["저가", "먼저", "나온", "짐승의", "모든", "권세를", "그", "앞에서", "행하고", "땅과", "땅에", "거하는", "자들로", "처음", "짐승에게", "경배하게", "하니", "곧", "죽게", "되었던", "상처가", "나은", "자니라"] },
        { text: "큰 이적을 행하되 심지어 사람들 앞에서 불이 하늘로부터 땅에 내려 오게 하고", chunks: ["큰", "이적을", "행하되", "심지어", "사람들", "앞에서", "불이", "하늘로부터", "땅에", "내려", "오게", "하고"] },
        { text: "짐승 앞에서 받은바 이적을 행함으로 땅에 거하는 자들을 미혹하며 땅에 거하는 자들에게 이르기를 칼에 상하였다가 살아난 짐승을 위하여 우상을 만들라 하더라", chunks: ["짐승", "앞에서", "받은바", "이적을", "행함으로", "땅에", "거하는", "자들을", "미혹하며", "땅에", "거하는", "자들에게", "이르기를", "칼에", "상하였다가", "살아난", "짐승을", "위하여", "우상을", "만들라", "하더라"] },
        { text: "저가 권세를 받아 그 짐승의 우상에게 생기를 주어 그 짐승의 우상으로 말하게 하고 또 짐승의 우상에게 경배하지 아니하는 자는 몇이든지 다 죽이게 하더라", chunks: ["저가", "권세를", "받아", "그", "짐승의", "우상에게", "생기를", "주어", "그", "짐승의", "우상으로", "말하게", "하고", "또", "짐승의", "우상에게", "경배하지", "아니하는", "자는", "몇이든지", "다", "죽이게", "하더라"] },
        { text: "저가 모든 자 곧 작은 자나 큰 자나 부자나 빈궁한 자나 자유한 자나 종들로 그 오른손에나 이마에 표를 받게 하고", chunks: ["저가", "모든", "자", "곧", "작은", "자나", "큰", "자나", "부자나", "빈궁한", "자나", "자유한", "자나", "종들로", "그", "오른손에나", "이마에", "표를", "받게", "하고"] },
        { text: "누구든지 이 표를 가진 자 외에는 매매를 못하게 하니 이 표는 곧 짐승의 이름이나 그 이름의 수라", chunks: ["누구든지", "이", "표를", "가진", "자", "외에는", "매매를", "못하게", "하니", "이", "표는", "곧", "짐승의", "이름이나", "그", "이름의", "수라"] },
        { text: "지혜가 여기 있으니 총명 있는 자는 그 짐승의 수를 세어 보라 그 수는 사람의 수니 육백 육십 륙이니라", chunks: ["지혜가", "여기", "있으니", "총명", "있는", "자는", "그", "짐승의", "수를", "세어", "보라", "그", "수는", "사람의", "수니", "육백", "육십", "륙이니라"] }
    ],
    14: [
        { text: "또 내가 보니 보라 어린 양이 시온산에 섰고 그와 함께 십 사만 사천이 섰는데 그 이마에 어린 양의 이름과 그 아버지의 이름을 쓴 것이 있도다", chunks: ["또", "내가", "보니", "보라", "어린", "양이", "시온산에", "섰고", "그와", "함께", "십", "사만", "사천이", "섰는데", "그", "이마에", "어린", "양의", "이름과", "그", "아버지의", "이름을", "쓴", "것이", "있도다"] },
        { text: "내가 하늘에서 나는 소리를 들으니 많은 물소리도 같고 큰 뇌성도 같은데 내게 들리는 소리는 거문고 타는 자들의 그 거문고 타는 것 같더라", chunks: ["내가", "하늘에서", "나는", "소리를", "들으니", "많은", "물소리도", "같고", "큰", "뇌성도", "같은데", "내게", "들리는", "소리는", "거문고", "타는", "자들의", "그", "거문고", "타는", "것", "같더라"] },
        { text: "저희가 보좌와 네 생물과 장로들 앞에서 새 노래를 부르니 땅에서 구속함을 얻은 십 사만 사천인 밖에는 능히 이 노래를 배울 자가 없더라", chunks: ["저희가", "보좌와", "네", "생물과", "장로들", "앞에서", "새", "노래를", "부르니", "땅에서", "구속함을", "얻은", "십", "사만", "사천인", "밖에는", "능히", "이", "노래를", "배울", "자가", "없더라"] },
        { text: "이 사람들은 여자로 더불어 더럽히지 아니하고 정절이 있는 자라 어린 양이 어디로 인도하든지 따라가는 자며 사람 가운데서 구속을 받아 처음 익은 열매로 하나님과 어린 양에게 속한 자들이니", chunks: ["이", "사람들은", "여자로", "더불어", "더럽히지", "아니하고", "정절이", "있는", "자라", "어린", "양이", "어디로", "인도하든지", "따라가는", "자며", "사람", "가운데서", "구속을", "받아", "처음", "익은", "열매로", "하나님과", "어린", "양에게", "속한", "자들이니"] },
        { text: "그 입에 거짓말이 없고 흠이 없는 자들이더라", chunks: ["그", "입에", "거짓말이", "없고", "흠이", "없는", "자들이더라"] },
        { text: "또 보니 다른 천사가 공중에 날아가는데 땅에 거하는 자들 곧 여러 나라와 족속과 방언과 백성에게 전할 영원한 복음을 가졌더라", chunks: ["또", "보니", "다른", "천사가", "공중에", "날아가는데", "땅에", "거하는", "자들", "곧", "여러", "나라와", "족속과", "방언과", "백성에게", "전할", "영원한", "복음을", "가졌더라"] },
        { text: "그가 큰 음성으로 가로되 하나님을 두려워하며 그에게 영광을 돌리라 이는 그의 심판하실 시간이 이르렀음이니 하늘과 땅과 바다와 물들의 근원을 만드신 이를 경배하라 하더라", chunks: ["그가", "큰", "음성으로", "가로되", "하나님을", "두려워하며", "그에게", "영광을", "돌리라", "이는", "그의", "심판하실", "시간이", "이르렀음이니", "하늘과", "땅과", "바다와", "물들의", "근원을", "만드신", "이를", "경배하라", "하더라"] },
        { text: "또 다른 천사 곧 둘째가 그 뒤를 따라 말하되 무너졌도다 무너졌도다 큰 성 바벨론이여 모든 나라를 그 음행으로 인하여 진노의 포도주로 먹이던 자로다 하더라", chunks: ["또", "다른", "천사", "곧", "둘째가", "그", "뒤를", "따라", "말하되", "무너졌도다", "무너졌도다", "큰", "성", "바벨론이여", "모든", "나라를", "그", "음행으로", "인하여", "진노의", "포도주로", "먹이던", "자로다", "하더라"] },
        { text: "또 다른 천사 곧 세째가 그 뒤를 따라 큰 음성으로 가로되 만일 누구든지 짐승과 그의 우상에게 경배하고 이마에나 손에 표를 받으면", chunks: ["또", "다른", "천사", "곧", "세째가", "그", "뒤를", "따라", "큰", "음성으로", "가로되", "만일", "누구든지", "짐승과", "그의", "우상에게", "경배하고", "이마에나", "손에", "표를", "받으면"] },
        { text: "그도 하나님의 진노의 포도주를 마시리니 그 진노의 잔에 섞인 것이 없이 부은 포도주라 거룩한 천사들 앞과 어린 양 앞에서 불과 유황으로 고난을 받으리니", chunks: ["그도", "하나님의", "진노의", "포도주를", "마시리니", "그", "진노의", "잔에", "섞인", "것이", "없이", "부은", "포도주라", "거룩한", "천사들", "앞과", "어린", "양", "앞에서", "불과", "유황으로", "고난을", "받으리니"] },
        { text: "그 고난의 연기가 세세토록 올라가리로다 짐승과 그의 우상에게 경배하고 그 이름의 표를 받는 자는 누구든지 밤낮 쉼을 얻지 못하리라 하더라", chunks: ["그", "고난의", "연기가", "세세토록", "올라가리로다", "짐승과", "그의", "우상에게", "경배하고", "그", "이름의", "표를", "받는", "자는", "누구든지", "밤낮", "쉼을", "얻지", "못하리라", "하더라"] },
        { text: "성도들의 인내가 여기 있나니 저희는 하나님의 계명과 예수 믿음을 지키는 자니라", chunks: ["성도들의", "인내가", "여기", "있나니", "저희는", "하나님의", "계명과", "예수", "믿음을", "지키는", "자니라"] },
        { text: "또 내가 들으니 하늘에서 음성이 나서 가로되 기록하라 자금 이후로 주 안에서 죽는 자들은 복이 있도다 하시매 성령이 가라사대 그러하다 저희 수고를 그치고 쉬리니 이는 저희의 행한 일이 따름이라 하시더라", chunks: ["또", "내가", "들으니", "하늘에서", "음성이", "나서", "가로되", "기록하라", "자금", "이후로", "주", "안에서", "죽는", "자들은", "복이", "있도다", "하시매", "성령이", "가라사대", "그러하다", "저희", "수고를", "그치고", "쉬리니", "이는", "저희의", "행한", "일이", "따름이라", "하시더라"] },
        { text: "또 내가 보니 흰구름이 있고 구름 위에 사람의 아들과 같은 이가 앉았는데 그 머리에는 금 면류관이 있고 그 손에는 이한 낫을 가졌더라", chunks: ["또", "내가", "보니", "흰구름이", "있고", "구름", "위에", "사람의", "아들과", "같은", "이가", "앉았는데", "그", "머리에는", "금", "면류관이", "있고", "그", "손에는", "이한", "낫을", "가졌더라"] },
        { text: "또 다른 천사가 성전으로부터 나와 구름 위에 앉은이를 향하여 큰 음성으로 외쳐 가로되 네 낫을 휘둘러 거두라 거둘 때가 이르러 땅에 곡식이 다 익었음이로다 하니", chunks: ["또", "다른", "천사가", "성전으로부터", "나와", "구름", "위에", "앉은이를", "향하여", "큰", "음성으로", "외쳐", "가로되", "네", "낫을", "휘둘러", "거두라", "거둘", "때가", "이르러", "땅에", "곡식이", "다", "익었음이로다", "하니"] },
        { text: "구름 위에 앉으신 이가 낫을 땅에 휘두르매 곡식이 거두어지니라", chunks: ["구름", "위에", "앉으신", "이가", "낫을", "땅에", "휘두르매", "곡식이", "거두어지니라"] },
        { text: "또 다른 천사가 하늘에 있는 성전에서 나오는데 또한 이한 낫을 가졌더라", chunks: ["또", "다른", "천사가", "하늘에", "있는", "성전에서", "나오는데", "또한", "이한", "낫을", "가졌더라"] },
        { text: "또 불을 다스리는 다른 천사가 제단으로부터 나와 이한 낫 가진 자를 향하여 큰 음성으로 불러 가로되 네 이한 낫을 휘둘러 땅의 포도송이를 거두라 그 포도가 익었느니라 하더라", chunks: ["또", "불을", "다스리는", "다른", "천사가", "제단으로부터", "나와", "이한", "낫", "가진", "자를", "향하여", "큰", "음성으로", "불러", "가로되", "네", "이한", "낫을", "휘둘러", "땅의", "포도송이를", "거두라", "그", "포도가", "익었느니라", "하더라"] },
        { text: "천사가 낫을 땅에 휘둘러 땅의 포도를 거두어 하나님의 진노의 큰 포도주 틀에 던지매", chunks: ["천사가", "낫을", "땅에", "휘둘러", "땅의", "포도를", "거두어", "하나님의", "진노의", "큰", "포도주", "틀에", "던지매"] },
        { text: "성 밖에서 그 틀이 밟히니 틀에서 피가 나서 말굴레까지 닿았고 일천 육백 스다디온에 퍼졌더라", chunks: ["성", "밖에서", "그", "틀이", "밟히니", "틀에서", "피가", "나서", "말굴레까지", "닿았고", "일천", "육백", "스다디온에", "퍼졌더라"] }
    ],
    15: [
        { text: "또 하늘에 크고 이상한 다른 이적을 보매 일곱 천사가 일곱 재앙을 가졌으니 곧 마지막 재앙이라 하나님의 진노가 이것으로 마치리로다", chunks: ["또", "하늘에", "크고", "이상한", "다른", "이적을", "보매", "일곱", "천사가", "일곱", "재앙을", "가졌으니", "곧", "마지막", "재앙이라", "하나님의", "진노가", "이것으로", "마치리로다"] },
        { text: "또 내가 보니 불이 섞인 유리 바다 같은 것이 있고 짐승과 그의 우상과 그의 이름의 수를 이기고 벗어난 자들이 유리바다 가에 서서 하나님의 거문고를 가지고", chunks: ["또", "내가", "보니", "불이", "섞인", "유리", "바다", "같은", "것이", "있고", "짐승과", "그의", "우상과", "그의", "이름의", "수를", "이기고", "벗어난", "자들이", "유리바다", "가에", "서서", "하나님의", "거문고를", "가지고"] },
        { text: "하나님의 종 모세의 노래, 어린 양의 노래를 불러 가로되 주 하나님 곧 전능하신이시여 하시는 일이 크고 기이하시도다 만국의 왕이시여 주의 길이 의롭고 참되시도다", chunks: ["하나님의", "종", "모세의", "노래,", "어린", "양의", "노래를", "불러", "가로되", "주", "하나님", "곧", "전능하신이시여", "하시는", "일이", "크고", "기이하시도다", "만국의", "왕이시여", "주의", "길이", "의롭고", "참되시도다"] },
        { text: "주여 누가 주의 이름을 두려워하지 아니하며 영화롭게 하지 아니하오리이까 오직 주만 거룩하시니이다 주의 의로우신 일이 나타났으매 만국이 와서 주께 경배하리이다 하더라", chunks: ["주여", "누가", "주의", "이름을", "두려워하지", "아니하며", "영화롭게", "하지", "아니하오리이까", "오직", "주만", "거룩하시니이다", "주의", "의로우신", "일이", "나타났으매", "만국이", "와서", "주께", "경배하리이다", "하더라"] },
        { text: "또 이 일 후에 내가 보니 하늘에 증거 장막의 성전이 열리며", chunks: ["또", "이", "일", "후에", "내가", "보니", "하늘에", "증거", "장막의", "성전이", "열리며"] },
        { text: "일곱 재앙을 가진 일곱 천사가 성전으로부터 나와 맑고 빛난 세마포 옷을 입고 가슴에 금띠를 띠고", chunks: ["일곱", "재앙을", "가진", "일곱", "천사가", "성전으로부터", "나와", "맑고", "빛난", "세마포", "옷을", "입고", "가슴에", "금띠를", "띠고"] },
        { text: "네 생물 중에 하나가 세세에 계신 하나님의 진노를 가득히 담은 금대접 일곱을 그 일곱 천사에게 주니", chunks: ["네", "생물", "중에", "하나가", "세세에", "계신", "하나님의", "진노를", "가득히", "담은", "금대접", "일곱을", "그", "일곱", "천사에게", "주니"] },
        { text: "하나님의 영광과 능력을 인하여 성전에 연기가 차게 되매 일곱 천사의 일곱 재앙이 마치기까지는 성전에 능히 들어갈 자가 없더라", chunks: ["하나님의", "영광과", "능력을", "인하여", "성전에", "연기가", "차게", "되매", "일곱", "천사의", "일곱", "재앙이", "마치기까지는", "성전에", "능히", "들어갈", "자가", "없더라"] }
    ],

    16: [
        { text: "또 내가 들으니 성전에서 큰 음성이 나서 일곱 천사에게 말하되 너희는 가서 하나님의 진노의 일곱 대접을 땅에 쏟으라 하더라", chunks: ["또", "내가", "들으니", "성전에서", "큰", "음성이", "나서", "일곱", "천사에게", "말하되", "너희는", "가서", "하나님의", "진노의", "일곱", "대접을", "땅에", "쏟으라", "하더라"] },
        { text: "첫째가 가서 그 대접을 땅에 쏟으매 악하고 독한 헌데가 짐승의 표를 받은 사람들과 그 우상에게 경배하는 자들에게 나더라", chunks: ["첫째가", "가서", "그", "대접을", "땅에", "쏟으매", "악하고", "독한", "헌데가", "짐승의", "표를", "받은", "사람들과", "그", "우상에게", "경배하는", "자들에게", "나더라"] },
        { text: "둘째가 그 대접을 바다에 쏟으매 바다가 곧 죽은 자의 피 같이 되니 바다 가운데 모든 생물이 죽더라", chunks: ["둘째가", "그", "대접을", "바다에", "쏟으매", "바다가", "곧", "죽은", "자의", "피", "같이", "되니", "바다", "가운데", "모든", "생물이", "죽더라"] },
        { text: "세째가 그 대접을 강과 물 근원에 쏟으매 피가 되더라", chunks: ["세째가", "그", "대접을", "강과", "물", "근원에", "쏟으매", "피가", "되더라"] },
        { text: "내가 들으니 물을 차지한 천사가 가로되 전에도 계셨고 시방도 계신 거룩하신 이여 이렇게 심판하시니 의로우시도다", chunks: ["내가", "들으니", "물을", "차지한", "천사가", "가로되", "전에도", "계셨고", "시방도", "계신", "거룩하신", "이여", "이렇게", "심판하시니", "의로우시도다"] },
        { text: "저희가 성도들과 선지자들의 피를 흘렸으므로 저희로 피를 마시게 하신 것이 합당하니이다 하더라", chunks: ["저희가", "성도들과", "선지자들의", "피를", "흘렸으므로", "저희로", "피를", "마시게", "하신", "것이", "합당하니이다", "하더라"] },
        { text: "또 내가 들으니 제단이 말하기를 그러하다 주 하나님 곧 전능하신 이시여 심판하시는 것이 참되시고 의로우시도다 하더라", chunks: ["또", "내가", "들으니", "제단이", "말하기를", "그러하다", "주", "하나님", "곧", "전능하신", "이시여", "심판하시는", "것이", "참되시고", "의로우시도다", "하더라"] },
        { text: "네째가 그 대접을 해에 쏟으매 해가 권세를 받아 불로 사람들을 태우니", chunks: ["네째가", "그", "대접을", "해에", "쏟으매", "해가", "권세를", "받아", "불로", "사람들을", "태우니"] },
        { text: "사람들이 크게 태움에 태워진지라 이 재앙들을 행하는 권세를 가지신 하나님의 이름을 훼방하며 또 회개하여 영광을 주께 돌리지 아니하더라", chunks: ["사람들이", "크게", "태움에", "태워진지라", "이", "재앙들을", "행하는", "권세를", "가지신", "하나님의", "이름을", "훼방하며", "또", "회개하여", "영광을", "주께", "돌리지", "아니하더라"] },
        { text: "또 다섯째가 그 대접을 짐승의 보좌에 쏟으니 그 나라가 곧 어두워지며 사람들이 아파서 자기 혀를 깨물고", chunks: ["또", "다섯째가", "그", "대접을", "짐승의", "보좌에", "쏟으니", "그", "나라가", "곧", "어두워지며", "사람들이", "아파서", "자기", "혀를", "깨물고"] },
        { text: "아픈 것과 종기로 인하여 하늘의 하나님을 훼방하고 저희 행위를 회개치 아니하더라", chunks: ["아픈", "것과", "종기로", "인하여", "하늘의", "하나님을", "훼방하고", "저희", "행위를", "회개치", "아니하더라"] },
        { text: "또 여섯째가 그 대접을 큰 강 유브라데에 쏟으매 강물이 말라서 동방에서 오는 왕들의 길이 예비되더라", chunks: ["또", "여섯째가", "그", "대접을", "큰", "강", "유브라데에", "쏟으매", "강물이", "말라서", "동방에서", "오는", "왕들의", "길이", "예비되더라"] },
        { text: "또 내가 보매 개구리 같은 세 더러운 영이 용의 입과 짐승의 입과 거짓 선지자의 입에서 나오니", chunks: ["또", "내가", "보매", "개구리", "같은", "세", "더러운", "영이", "용의", "입과", "짐승의", "입과", "거짓", "선지자의", "입에서", "나오니"] },
        { text: "저희는 귀신의 영이라 이적을 행하여 온 천하 임금들에게 가서 하나님 곧 전능하신이의 큰 날에 전쟁을 위하여 그들을 모으더라", chunks: ["저희는", "귀신의", "영이라", "이적을", "행하여", "온", "천하", "임금들에게", "가서", "하나님", "곧", "전능하신이의", "큰", "날에", "전쟁을", "위하여", "그들을", "모으더라"] },
        { text: "보라 내가 도적 같이 오리니 누구든지 깨어 자기 옷을 지켜 벌거벗고 다니지 아니하며 자기의 부끄러움을 보이지 아니하는 자가 복이 있도다", chunks: ["보라", "내가", "도적", "같이", "오리니", "누구든지", "깨어", "자기", "옷을", "지켜", "벌거벗고", "다니지", "아니하며", "자기의", "부끄러움을", "보이지", "아니하는", "자가", "복이", "있도다"] },
        { text: "세 영이 히브리 음으로 아마겟돈이라 하는 곳으로 왕들을 모으더라", chunks: ["세", "영이", "히브리", "음으로", "아마겟돈이라", "하는", "곳으로", "왕들을", "모으더라"] },
        { text: "일곱째가 그 대접을 공기 가운데 쏟으매 큰 음성이 성전에서 보좌로부터 나서 가로되 되었다 하니", chunks: ["일곱째가", "그", "대접을", "공기", "가운데", "쏟으매", "큰", "음성이", "성전에서", "보좌로부터", "나서", "가로되", "되었다", "하니"] },
        { text: "번개와 음성들과 뇌성이 있고 또 큰 지진이 있어 어찌 큰지 사람이 땅에 있어 옴으로 이같이 큰 지진이 없었더라", chunks: ["번개와", "음성들과", "뇌성이", "있고", "또", "큰", "지진이", "있어", "어찌", "큰지", "사람이", "땅에", "있어", "옴으로", "이같이", "큰", "지진이", "없었더라"] },
        { text: "큰 성이 세 갈래로 갈라지고 만국의 성들도 무너지니 큰 성 바벨론이 하나님 앞에 기억하신바 되어 그의 맹렬한 진노의 포도주 잔을 받으매", chunks: ["큰", "성이", "세", "갈래로", "갈라지고", "만국의", "성들도", "무너지니", "큰", "성", "바벨론이", "하나님", "앞에", "기억하신바", "되어", "그의", "맹렬한", "진노의", "포도주", "잔을", "받으매"] },
        { text: "각 섬도 없어지고 산악도 간데 없더라", chunks: ["각", "섬도", "없어지고", "산악도", "간데", "없더라"] },
        { text: "또 중수가 한 달란트나 되는 큰 우박이 하늘로부터 사람들에게 내리매 사람들이 그 박재로 인하여 하나님을 훼방하니 그 재앙이 심히 큼이러라", chunks: ["또", "중수가", "한", "달란트나", "되는", "큰", "우박이", "하늘로부터", "사람들에게", "내리매", "사람들이", "그", "박재로", "인하여", "하나님을", "훼방하니", "그", "재앙이", "심히", "큼이러라"] }
    ],
    17: [
        { text: "또 일곱 대접을 가진 일곱 천사 중 하나가 와서 내게 말하여 가로되 이리 오라 많은 물위에 앉은 큰 음녀의 받을 심판을 네게 보이리라", chunks: ["또", "일곱", "대접을", "가진", "일곱", "천사", "중", "하나가", "와서", "내게", "말하여", "가로되", "이리", "오라", "많은", "물위에", "앉은", "큰", "음녀의", "받을", "심판을", "네게", "보이리라"] },
        { text: "땅의 임금들도 그로 더불어 음행하였고 땅에 거하는 자들도 그 음행의 포도주에 취하였다 하고", chunks: ["땅의", "임금들도", "그로", "더불어", "음행하였고", "땅에", "거하는", "자들도", "그", "음행의", "포도주에", "취하였다", "하고"] },
        { text: "곧 성령으로 나를 데리고 광야로 가니라 내가 보니 여자가 붉은 빛 짐승을 탔는데 그 짐승의 몸에 참람된 이름들이 가득하고 일곱 머리와 열 뿔이 있으며", chunks: ["곧", "성령으로", "나를", "데리고", "광야로", "가니라", "내가", "보니", "여자가", "붉은", "빛", "짐승을", "탔는데", "그", "짐승의", "몸에", "참람된", "이름들이", "가득하고", "일곱", "머리와", "열", "뿔이", "있으며"] },
        { text: "그 여자는 자주 빛과 붉은 빛 옷을 입고 금과 보석과 진주로 꾸미고 손에 금잔을 가졌는데 가증한 물건과 그의 음행의 더러운 것들이 가득하더라", chunks: ["그", "여자는", "자주", "빛과", "붉은", "빛", "옷을", "입고", "금과", "보석과", "진주로", "꾸미고", "손에", "금잔을", "가졌는데", "가증한", "물건과", "그의", "음행의", "더러운", "것들이", "가득하더라"] },
        { text: "그 이마에 이름이 기록되었으니 비밀이라, 큰 바벨론이라, 땅의 음녀들과 가증한 것들의 어미라 하였더라", chunks: ["그", "이마에", "이름이", "기록되었으니", "비밀이라,", "큰", "바벨론이라,", "땅의", "음녀들과", "가증한", "것들의", "어미라", "하였더라"] },
        { text: "또 내가 보매 이 여자가 성도들의 피와 예수의 증인들의 피에 취한지라 내가 그 여자를 보고 기이히 여기고 크게 기이히 여기니", chunks: ["또", "내가", "보매", "이", "여자가", "성도들의", "피와", "예수의", "증인들의", "피에", "취한지라", "내가", "그", "여자를", "보고", "기이히", "여기고", "크게", "기이히", "여기니"] },
        { text: "천사가 가로되 왜 기이히 여기느냐 내가 여자와 그의 탄바 일곱 머리와 열 뿔 가진 짐승의 비밀을 네게 이르리라", chunks: ["천사가", "가로되", "왜", "기이히", "여기느냐", "내가", "여자와", "그의", "탄바", "일곱", "머리와", "열", "뿔", "가진", "짐승의", "비밀을", "네게", "이르리라"] },
        { text: "네가 본 짐승은 전에 있었다가 시방 없으나 장차 무저갱으로부터 올라와 멸망으로 들어갈 자니 땅에 거하는 자들로서 창세 이후로 생명책에 녹명되지 못한 자들이 이전에 있었다가 시방 없으나 장차 나올 짐승을 보고 기이히 여기리라", chunks: ["네가", "본", "짐승은", "전에", "있었다가", "시방", "없으나", "장차", "무저갱으로부터", "올라와", "멸망으로", "들어갈", "자니", "땅에", "거하는", "자들로서", "창세", "이후로", "생명책에", "녹명되지", "못한", "자들이", "이전에", "있었다가", "시방", "없으나", "장차", "나올", "짐승을", "보고", "기이히", "여기리라"] },
        { text: "지혜 있는 뜻이 여기 있으니 그 일곱 머리는 여자가 앉은 일곱 산이요", chunks: ["지혜", "있는", "뜻이", "여기", "있으니", "그", "일곱", "머리는", "여자가", "앉은", "일곱", "산이요"] },
        { text: "또 일곱 왕이라 다섯은 망하였고 하나는 있고 다른이는 아직 이르지 아니하였으나 이르면 반드시 잠간 동안 계속하리라", chunks: ["또", "일곱", "왕이라", "다섯은", "망하였고", "하나는", "있고", "다른이는", "아직", "이르지", "아니하였으나", "이르면", "반드시", "잠간", "동안", "계속하리라"] },
        { text: "전에 있었다가 시방 없어진 짐승은 여덟째 왕이니 일곱 중에 속한 자라 저가 멸망으로 들어가리라", chunks: ["전에", "있었다가", "시방", "없어진", "짐승은", "여덟째", "왕이니", "일곱", "중에", "속한", "자라", "저가", "멸망으로", "들어가리라"] },
        { text: "네가 보던 열 뿔은 열 왕이니 아직 나라를 얻지 못하였으나 다만 짐승으로 더불어 임금처럼 권세를 일시 동안 받으리라", chunks: ["네가", "보던", "열", "뿔은", "열", "왕이니", "아직", "나라를", "얻지", "못하였으나", "다만", "짐승으로", "더불어", "임금처럼", "권세를", "일시", "동안", "받으리라"] },
        { text: "저희가 한 뜻을 가지고 자기의 능력과 권세를 짐승에게 주더라", chunks: ["저희가", "한", "뜻을", "가지고", "자기의", "능력과", "권세를", "짐승에게", "주더라"] },
        { text: "저희가 어린 양으로 더불어 싸우려니와 어린 양은 만주의 주시요 만왕의 왕이시므로 저희를 이기실터이요 또 그와 함께 있는 자들 곧 부르심을 입고 빼내심을 얻고 진실한 자들은 이기리로다", chunks: ["저희가", "어린", "양으로", "더불어", "싸우려니와", "어린", "양은", "만주의", "주시요", "만왕의", "왕이시므로", "저희를", "이기실터이요", "또", "그와", "함께", "있는", "자들", "곧", "부르심을", "입고", "빼내심을", "얻고", "진실한", "자들은", "이기리로다"] },
        { text: "또 천사가 내게 말하되 네가 본바 음녀의 앉은 물은 백성과 무리와 열국과 방언들이니라", chunks: ["또", "천사가", "내게", "말하되", "네가", "본바", "음녀의", "앉은", "물은", "백성과", "무리와", "열국과", "방언들이니라"] },
        { text: "네가 본바 이 열 뿔과 짐승이 음녀를 미워하여 망하게 하고 벌거벗게 하고 그 살을 먹고 불로 아주 사르리라", chunks: ["네가", "본바", "이", "열", "뿔과", "짐승이", "음녀를", "미워하여", "망하게", "하고", "벌거벗게", "하고", "그", "살을", "먹고", "불로", "아주", "사르리라"] },
        { text: "하나님이 자기 뜻대로 할 마음을 저희에게 주사 한 뜻을 이루게 하시고 저희 나라를 그 짐승에게 주게 하시되 하나님 말씀이 응하기까지 하심이니라", chunks: ["하나님이", "자기", "뜻대로", "할", "마음을", "저희에게", "주사", "한", "뜻을", "이루게", "하시고", "저희", "나라를", "그", "짐승에게", "주게", "하시되", "하나님", "말씀이", "응하기까지", "하심이니라"] },
        { text: "또 네가 본바 여자는 땅의 임금들을 다스리는 큰 성이라 하더라", chunks: ["또", "네가", "본바", "여자는", "땅의", "임금들을", "다스리는", "큰", "성이라", "하더라"] }
    ],
    18: [
        { text: "이 일 후에 다른 천사가 하늘에서 내려오는 것을 보니 큰 권세를 가졌는데 그의 영광으로 땅이 환하여지더라", chunks: ["이", "일", "후에", "다른", "천사가", "하늘에서", "내려오는", "것을", "보니", "큰", "권세를", "가졌는데", "그의", "영광으로", "땅이", "환하여지더라"] },
        { text: "힘센 음성으로 외쳐 가로되 무너졌도다 무너졌도다 큰 성 바벨론이여 귀신의 처소와 각종 더러운 영의 모이는 곳과 각종 더럽고 가증한 새의 모이는 곳이 되었도다", chunks: ["힘센", "음성으로", "외쳐", "가로되", "무너졌도다", "무너졌도다", "큰", "성", "바벨론이여", "귀신의", "처소와", "각종", "더러운", "영의", "모이는", "곳과", "각종", "더럽고", "가증한", "새의", "모이는", "곳이", "되었도다"] },
        { text: "그 음행의 진노의 포도주를 인하여 만국이 무너졌으며 또 땅의 왕들이 그로 더불어 음행하였으며 땅의 상고들도 그 사치의 세력을 인하여 치부하였도다 하더라", chunks: ["그", "음행의", "진노의", "포도주를", "인하여", "만국이", "무너졌으며", "또", "땅의", "왕들이", "그로", "더불어", "음행하였으며", "땅의", "상고들도", "그", "사치의", "세력을", "인하여", "치부하였도다", "하더라"] },
        { text: "또 내가 들으니 하늘로서 다른 음성이 나서 가로되 내 백성아, 거기서 나와 그의 죄에 참예하지 말고 그의 받을 재앙들을 받지 말라", chunks: ["또", "내가", "들으니", "하늘로서", "다른", "음성이", "나서", "가로되", "내", "백성아,", "거기서", "나와", "그의", "죄에", "참예하지", "말고", "그의", "받을", "재앙들을", "받지", "말라"] },
        { text: "그 죄는 하늘에 사무쳤으며 하나님은 그의 불의한 일을 기억하신지라", chunks: ["그", "죄는", "하늘에", "사무쳤으며", "하나님은", "그의", "불의한", "일을", "기억하신지라"] },
        { text: "그가 준 그대로 그에게 주고 그의 행위대로 갑절을 갚아주고 그의 섞은 잔에도 갑절이나 섞어 그에게 주라", chunks: ["그가", "준", "그대로", "그에게", "주고", "그의", "행위대로", "갑절을", "갚아주고", "그의", "섞은", "잔에도", "갑절이나", "섞어", "그에게", "주라"] },
        { text: "그가 어떻게 자기를 영화롭게 하였으며 사치하였든지 그만큼 고난과 애통으로 갚아 주라 그가 마음에 말하기를 나는 여황으로 앉은 자요 과부가 아니라 결단코 애통을 당하지 아니하리라 하니", chunks: ["그가", "어떻게", "자기를", "영화롭게", "하였으며", "사치하였든지", "그만큼", "고난과", "애통으로", "갚아", "주라", "그가", "마음에", "말하기를", "나는", "여황으로", "앉은", "자요", "과부가", "아니라", "결단코", "애통을", "당하지", "아니하리라", "하니"] },
        { text: "그러므로 하루 동안에 그 재앙들이 이르리니 곧 사망과 애통과 흉년이라 그가 또한 불에 살라지리니 그를 심판하신 주 하나님은 강하신 자이심이니라", chunks: ["그러므로", "하루", "동안에", "그", "재앙들이", "이르리니", "곧", "사망과", "애통과", "흉년이라", "그가", "또한", "불에", "살라지리니", "그를", "심판하신", "주", "하나님은", "강하신", "자이심이니라"] },
        { text: "그와 함께 음행하고 사치하던 땅의 왕들이 그 불붙는 연기를 보고 위하여 울고 가슴을 치며", chunks: ["그와", "함께", "음행하고", "사치하던", "땅의", "왕들이", "그", "불붙는", "연기를", "보고", "위하여", "울고", "가슴을", "치며"] },
        { text: "그 고난을 무서워하여 멀리 서서 가로되 화 있도다 화 있도다 큰 성, 견고한 성 바벨론이여 일시간에 네 심판이 이르렀다 하리로다", chunks: ["그", "고난을", "무서워하여", "멀리", "서서", "가로되", "화", "있도다", "화", "있도다", "큰", "성,", "견고한", "성", "바벨론이여", "일시간에", "네", "심판이", "이르렀다", "하리로다"] },
        { text: "땅의 상고들이 그를 위하여 울고 애통하는 것은 다시 그 상품을 사는 자가 없음이라", chunks: ["땅의", "상고들이", "그를", "위하여", "울고", "애통하는", "것은", "다시", "그", "상품을", "사는", "자가", "없음이라"] },
        { text: "그 상품은 금과 은과 보석과 진주와 세마포와 자주 옷감과 비단과 붉은 옷감이요 각종 향목과 각종 상아 기명이요 값진 나무와 진유와 철과 옥석으로 만든 각종 기명이요", chunks: ["그", "상품은", "금과", "은과", "보석과", "진주와", "세마포와", "자주", "옷감과", "비단과", "붉은", "옷감이요", "각종", "향목과", "각종", "상아", "기명이요", "값진", "나무와", "진유와", "철과", "옥석으로", "만든", "각종", "기명이요"] },
        { text: "계피와 향료와 향과 향유와 유향과 포도주와 감람유와 고운 밀가루와 밀과 소와 양과 말과 수레와 종들과 사람의 영혼들이라", chunks: ["계피와", "향료와", "향과", "향유와", "유향과", "포도주와", "감람유와", "고운", "밀가루와", "밀과", "소와", "양과", "말과", "수레와", "종들과", "사람의", "영혼들이라"] },
        { text: "바벨론아 네 영혼의 탐하던 과실이 네게서 떠났으며 맛 있는 것들과 빛난 것들이 다 없어졌으니 사람들이 결코 이것들을 다시 보지 못하리로다", chunks: ["바벨론아", "네", "영혼의", "탐하던", "과실이", "네게서", "떠났으며", "맛", "있는", "것들과", "빛난", "것들이", "다", "없어졌으니", "사람들이", "결코", "이것들을", "다시", "보지", "못하리로다"] },
        { text: "바벨론을 인하여 치부한 이 상품의 상고들이 그 고난을 무서워하여 멀리 서서 울고 애통하여", chunks: ["바벨론을", "인하여", "치부한", "이", "상품의", "상고들이", "그", "고난을", "무서워하여", "멀리", "서서", "울고", "애통하여"] },
        { text: "가로되 화 있도다 화 있도다 큰 성이여 세마포와 자주와 붉은 옷을 입고 금과 보석과 진주로 꾸민 것인데", chunks: ["가로되", "화", "있도다", "화", "있도다", "큰", "성이여", "세마포와", "자주와", "붉은", "옷을", "입고", "금과", "보석과", "진주로", "꾸민", "것인데"] },
        { text: "그러한 부가 일시간에 망하였도다 각 선장과 각처를 다니는 선객들과 선인들과 바다에서 일하는 자들이 멀리 서서", chunks: ["그러한", "부가", "일시간에", "망하였도다", "각", "선장과", "각처를", "다니는", "선객들과", "선인들과", "바다에서", "일하는", "자들이", "멀리", "서서"] },
        { text: "그 불붙는 연기를 보고 외쳐 가로되 이 큰 성과 같은 성이 어디 있느뇨 하며", chunks: ["그", "불붙는", "연기를", "보고", "외쳐", "가로되", "이", "큰", "성과", "같은", "성이", "어디", "있느뇨", "하며"] },
        { text: "티끌을 자기 머리에 뿌리고 울고 애통하여 외쳐 가로되 화 있도다 화 있도다 이 큰 성이여 바다에서 배 부리는 모든 자들이 너의 보배로운 상품을 인하여 치부하였더니 일시간에 망하였도다", chunks: ["티끌을", "자기", "머리에", "뿌리고", "울고", "애통하여", "외쳐", "가로되", "화", "있도다", "화", "있도다", "이", "큰", "성이여", "바다에서", "배", "부리는", "모든", "자들이", "너의", "보배로운", "상품을", "인하여", "치부하였더니", "일시간에", "망하였도다"] },
        { text: "하늘과 성도들과 사도들과 선지자들아 그를 인하여 즐거워하라 하나님이 너희를 신원하시는 심판을 그에게 하셨음이라 하더라", chunks: ["하늘과", "성도들과", "사도들과", "선지자들아", "그를", "인하여", "즐거워하라", "하나님이", "너희를", "신원하시는", "심판을", "그에게", "하셨음이라", "하더라"] },
        { text: "이에 한 힘센 천사가 큰 맷돌 같은 돌을 들어 바다에 던져 가로되 큰 성 바벨론이 이같이 몹시 떨어져 결코 다시 보이지 아니하리로다", chunks: ["이에", "한", "힘센", "천사가", "큰", "맷돌", "같은", "돌을", "들어", "바다에", "던져", "가로되", "큰", "성", "바벨론이", "이같이", "몹시", "떨어져", "결코", "다시", "보이지", "아니하리로다"] },
        { text: "또 거문고 타는 자와 풍류하는 자와 퉁소 부는 자와 나팔 부는 자들의 소리가 결코 다시 네 가운데서 들리지 아니하고 물론 어떠한 세공업자든지 결코 다시 네 가운데서 보이지 아니하고 또 맷돌 소리가 결코 다시 네 가운데서 들리지 아니하고", chunks: ["또", "거문고", "타는", "자와", "풍류하는", "자와", "퉁소", "부는", "자와", "나팔", "부는", "자들의", "소리가", "결코", "다시", "네", "가운데서", "들리지", "아니하고", "물론", "어떠한", "세공업자든지", "결코", "다시", "네", "가운데서", "보이지", "아니하고", "또", "맷돌", "소리가", "결코", "다시", "네", "가운데서", "들리지", "아니하고"] },
        { text: "등불 빛이 결코 다시 네 가운데서 비취지 아니하고 신랑과 신부의 음성이 결코 다시 네 가운데서 들리지 아니하리로다 너의 상고들은 땅의 왕족들이라 네 복술을 인하여 만국이 미혹되었도다", chunks: ["등불", "빛이", "결코", "다시", "네", "가운데서", "비취지", "아니하고", "신랑과", "신부의", "음성이", "결코", "다시", "네", "가운데서", "들리지", "아니하리로다", "너의", "상고들은", "땅의", "왕족들이라", "네", "복술을", "인하여", "만국이", "미혹되었도다"] },
        { text: "선지자들과 성도들과 및 땅 위에서 죽임을 당한 모든 자의 피가 이 성중에서 보였느니라 하더라", chunks: ["선지자들과", "성도들과", "및", "땅", "위에서", "죽임을", "당한", "모든", "자의", "피가", "이", "성중에서", "보였느니라", "하더라"] }
    ],
    19: [
        { text: "이 일 후에 내가 들으니 하늘에 허다한 무리의 큰 음성 같은 것이 있어 가로되 할렐루야 구원과 영광과 능력이 우리 하나님께 있도다", chunks: ["이", "일", "후에", "내가", "들으니", "하늘에", "허다한", "무리의", "큰", "음성", "같은", "것이", "있어", "가로되", "할렐루야", "구원과", "영광과", "능력이", "우리", "하나님께", "있도다"] },
        { text: "그의 심판은 참되고 의로운지라 음행으로 땅을 더럽게 한 큰 음녀를 심판하사 자기 종들의 피를 그의 손에 갚으셨도다 하고", chunks: ["그의", "심판은", "참되고", "의로운지라", "음행으로", "땅을", "더럽게", "한", "큰", "음녀를", "심판하사", "자기", "종들의", "피를", "그의", "손에", "갚으셨도다", "하고"] },
        { text: "두번째 가로되 할렐루야 하더니 그 연기가 세세토록 올라가더라", chunks: ["두번째", "가로되", "할렐루야", "하더니", "그", "연기가", "세세토록", "올라가더라"] },
        { text: "또 이십 사 장로와 네 생물이 엎드려 보좌에 앉으신 하나님께 경배하여 가로되 아멘 할렐루야 하니", chunks: ["또", "이십", "사", "장로와", "네", "생물이", "엎드려", "보좌에", "앉으신", "하나님께", "경배하여", "가로되", "아멘", "할렐루야", "하니"] },
        { text: "보좌에서 음성이 나서 가로되 하나님의 종들 곧 그를 경외하는 너희들아 무론대소하고 다 우리 하나님께 찬송하라 하더라", chunks: ["보좌에서", "음성이", "나서", "가로되", "하나님의", "종들", "곧", "그를", "경외하는", "너희들아", "무론대소하고", "다", "우리", "하나님께", "찬송하라", "하더라"] },
        { text: "또 내가 들으니 허다한 무리의 음성도 같고 많은 물 소리도 같고 큰 뇌성도 같아서 가로되 할렐루야 주 우리 하나님 곧 전능하신 이가 통치하시도다", chunks: ["또", "내가", "들으니", "허다한", "무리의", "음성도", "같고", "많은", "물", "소리도", "같고", "큰", "뇌성도", "같아서", "가로되", "할렐루야", "주", "우리", "하나님", "곧", "전능하신", "이가", "통치하시도다"] },
        { text: "우리가 즐거워하고 크게 기뻐하여 그에게 영광을 돌리세 어린 양의 혼인 기약이 이르렀고 그 아내가 예비하였으니", chunks: ["우리가", "즐거워하고", "크게", "기뻐하여", "그에게", "영광을", "돌리세", "어린", "양의", "혼인", "기약이", "이르렀고", "그", "아내가", "예비하였으니"] },
        { text: "그에게 허락하사 빛나고 깨끗한 세마포를 입게 하셨은즉 이 세마포는 성도들의 옳은 행실이로다 하더라", chunks: ["그에게", "허락하사", "빛나고", "깨끗한", "세마포를", "입게", "하셨은즉", "이", "세마포는", "성도들의", "옳은", "행실이로다", "하더라"] },
        { text: "천사가 내게 말하기를 기록하라 어린 양의 혼인 잔치에 청함을 입은 자들이 복이 있도다 하고 또 내게 말하되 이것은 하나님의 참되신 말씀이라 하기로", chunks: ["천사가", "내게", "말하기를", "기록하라", "어린", "양의", "혼인", "잔치에", "청함을", "입은", "자들이", "복이", "있도다", "하고", "또", "내게", "말하되", "이것은", "하나님의", "참되신", "말씀이라", "하기로"] },
        { text: "내가 그 발 앞에 엎드려 경배하려 하니 그가 나더러 말하기를 나는 너와 및 예수의 증거를 받은 네 형제들과 같이 된 종이니 삼가 그리하지 말고 오직 하나님께 경배하라 예수의 증거는 대언의 영이라 하더라", chunks: ["내가", "그", "발", "앞에", "엎드려", "경배하려", "하니", "그가", "나더러", "말하기를", "나는", "너와", "및", "예수의", "증거를", "받은", "네", "형제들과", "같이", "된", "종이니", "삼가", "그리하지", "말고", "오직", "하나님께", "경배하라", "예수의", "증거는", "대언의", "영이라", "하더라"] },
        { text: "또 내가 하늘이 열린 것을 보니 보라 백마와 탄 자가 있으니 그 이름은 충신과 진실이라 그가 공의로 심판하며 싸우더라", chunks: ["또", "내가", "하늘이", "열린", "것을", "보니", "보라", "백마와", "탄", "자가", "있으니", "그", "이름은", "충신과", "진실이라", "그가", "공의로", "심판하며", "싸우더라"] },
        { text: "그 눈이 불꽃 같고 그 머리에 많은 면류관이 있고 또 이름 쓴 것이 하나가 있으니 자기 밖에 아는 자가 없고", chunks: ["그", "눈이", "불꽃", "같고", "그", "머리에", "많은", "면류관이", "있고", "또", "이름", "쓴", "것이", "하나가", "있으니", "자기", "밖에", "아는", "자가", "없고"] },
        { text: "또 그가 피 뿌린 옷을 입었는데 그 이름은 하나님의 말씀이라 칭하더라", chunks: ["또", "그가", "피", "뿌린", "옷을", "입었는데", "그", "이름은", "하나님의", "말씀이라", "칭하더라"] },
        { text: "하늘에 있는 군대들이 희고 깨끗한 세마포를 입고 백마를 타고 그를 따르더라", chunks: ["하늘에", "있는", "군대들이", "희고", "깨끗한", "세마포를", "입고", "백마를", "타고", "그를", "따르더라"] },
        { text: "그의 입에서 이한 검이 나오니 그것으로 만국을 치겠고 친히 저희를 철장으로 다스리며 또 친히 하나님 곧 전능하신 이의 맹렬한 진노의 포도주 틀을 밟겠고", chunks: ["그의", "입에서", "이한", "검이", "나오니", "그것으로", "만국을", "치겠고", "친히", "저희를", "철장으로", "다스리며", "또", "친히", "하나님", "곧", "전능하신", "이의", "맹렬한", "진노의", "포도주", "틀을", "밟겠고"] },
        { text: "그 옷과 그 다리에 이름 쓴 것이 있으니 만왕의 왕이요 만주의 주라 하였더라", chunks: ["그", "옷과", "그", "다리에", "이름", "쓴", "것이", "있으니", "만왕의", "왕이요", "만주의", "주라", "하였더라"] },
        { text: "또 내가 보니 한 천사가 해에 서서 공중에 나는 모든 새를 향하여 큰 음성으로 외쳐 가로되 와서 하나님의 큰 잔치에 모여", chunks: ["또", "내가", "보니", "한", "천사가", "해에", "서서", "공중에", "나는", "모든", "새를", "향하여", "큰", "음성으로", "외쳐", "가로되", "와서", "하나님의", "큰", "잔치에", "모여"] },
        { text: "왕들의 고기와 장군들의 고기와 장사들의 고기와 말들과 그 탄 자들의 고기와 자유한 자들이나 종들이나 무론대소하고 모든 자의 고기를 먹으라 하더라", chunks: ["왕들의", "고기와", "장군들의", "고기와", "장사들의", "고기와", "말들과", "그", "탄", "자들의", "고기와", "자유한", "자들이나", "종들이나", "무론대소하고", "모든", "자의", "고기를", "먹으라", "하더라"] },
        { text: "또 내가 보매 그 짐승과 땅의 임금들과 그 군대들이 모여 그 말 탄 자와 그의 군대로 더불어 전쟁을 일으키다가", chunks: ["또", "내가", "보매", "그", "짐승과", "땅의", "임금들과", "그", "군대들이", "모여", "그", "말", "탄", "자와", "그의", "군대로", "더불어", "전쟁을", "일으키다가"] },
        { text: "짐승이 잡히고 그 앞에서 이적을 행하던 거짓 선지자도 함께 잡혔으니 이는 짐승의 표를 받고 그의 우상에게 경배하던 자들을 이적으로 미혹하던 자라 이 둘이 산채로 유황불 붙는 못에 던지우고", chunks: ["짐승이", "잡히고", "그", "앞에서", "이적을", "행하던", "거짓", "선지자도", "함께", "잡혔으니", "이는", "짐승의", "표를", "받고", "그의", "우상에게", "경배하던", "자들을", "이적으로", "미혹하던", "자라", "이", "둘이", "산채로", "유황불", "붙는", "못에", "던지우고"] },
        { text: "그 나머지는 말 탄 자의 입으로 나오는 검에 죽으매 모든 새가 그 고기로 배불리우더라", chunks: ["그", "나머지는", "말", "탄", "자의", "입으로", "나오는", "검에", "죽으매", "모든", "새가", "그", "고기로", "배불리우더라"] }
    ],
    20: [
        { text: "또 내가 보매 천사가 무저갱 열쇠와 큰 쇠사슬을 그 손에 가지고 하늘로서 내려와서", chunks: ["또", "내가", "보매", "천사가", "무저갱", "열쇠와", "큰", "쇠사슬을", "그", "손에", "가지고", "하늘로서", "내려와서"] },
        { text: "용을 잡으니 곧 옛 뱀이요 마귀요 사단이라 잡아 일천년 동안 결박하여", chunks: ["용을", "잡으니", "곧", "옛", "뱀이요", "마귀요", "사단이라", "잡아", "일천년", "동안", "결박하여"] },
        { text: "무저갱에 던져 잠그고 그 위에 인봉하여 천년이 차도록 다시는 만국을 미혹하지 못하게 하였다가 그 후에는 반드시 잠간 놓이리라", chunks: ["무저갱에", "던져", "잠그고", "그", "위에", "인봉하여", "천년이", "차도록", "다시는", "만국을", "미혹하지", "못하게", "하였다가", "그", "후에는", "반드시", "잠간", "놓이리라"] },
        { text: "또 내가 보좌들을 보니 거기 앉은 자들이 있어 심판하는 권세를 받았더라 또 내가 보니 예수의 증거와 하나님의 말씀을 인하여 목 베임을 받은 자의 영혼들과 또 짐승과 그의 우상에게 경배하지도 아니하고 이마와 손에 그의 표를 받지도 아니한 자들이 살아서 그리스도로 더불어 천년 동안 왕노릇 하니", chunks: ["또", "내가", "보좌들을", "보니", "거기", "앉은", "자들이", "있어", "심판하는", "권세를", "받았더라", "또", "내가", "보니", "예수의", "증거와", "하나님의", "말씀을", "인하여", "목", "베임을", "받은", "자의", "영혼들과", "또", "짐승과", "그의", "우상에게", "경배하지도", "아니하고", "이마와", "손에", "그의", "표를", "받지도", "아니한", "자들이", "살아서", "그리스도로", "더불어", "천년", "동안", "왕노릇", "하니"] },
        { text: "그 나머지 죽은 자들은 그 천년이 차기까지 살지 못하더라 이는 첫째 부활이라", chunks: ["그", "나머지", "죽은", "자들은", "그", "천년이", "차기까지", "살지", "못하더라", "이는", "첫째", "부활이라"] },
        { text: "이 첫째 부활에 참예하는 자들은 복이 있고 거룩하도다 둘째 사망이 그들을 다스리는 권세가 없고 도리어 그들이 하나님과 그리스도의 제사장이 되어 천년 동안 그리스도로 더불어 왕노릇 하리라", chunks: ["이", "첫째", "부활에", "참예하는", "자들은", "복이", "있고", "거룩하도다", "둘째", "사망이", "그들을", "다스리는", "권세가", "없고", "도리어", "그들이", "하나님과", "그리스도의", "제사장이", "되어", "천년", "동안", "그리스도로", "더불어", "왕노릇", "하리라"] },
        { text: "천년이 차매 사단이 그 옥에서 놓여", chunks: ["천년이", "차매", "사단이", "그", "옥에서", "놓여"] },
        { text: "나와서 땅의 사방 백성 곧 곡과 마곡을 미혹하고 모아 싸움을 붙이리니 그 수가 바다 모래 같으리라", chunks: ["나와서", "땅의", "사방", "백성", "곧", "곡과", "마곡을", "미혹하고", "모아", "싸움을", "붙이리니", "그", "수가", "바다", "모래", "같으리라"] },
        { text: "저희가 지면에 널리 퍼져 성도들의 진과 사랑하시는 성을 두르매 하늘에서 불이 내려와 저희를 소멸하고", chunks: ["저희가", "지면에", "널리", "퍼져", "성도들의", "진과", "사랑하시는", "성을", "두르매", "하늘에서", "불이", "내려와", "저희를", "소멸하고"] },
        { text: "또 저희를 미혹하는 마귀가 불과 유황 못에 던지우니 거기는 그 짐승과 거짓 선지자도 있어 세세토록 밤낮 괴로움을 받으리라", chunks: ["또", "저희를", "미혹하는", "마귀가", "불과", "유황", "못에", "던지우니", "거기는", "그", "짐승과", "거짓", "선지자도", "있어", "세세토록", "밤낮", "괴로움을", "받으리라"] },
        { text: "또 내가 크고 흰 보좌와 그 위에 앉으신 자를 보니 땅과 하늘이 그 앞에서 피하여 간데 없더라", chunks: ["또", "내가", "크고", "흰", "보좌와", "그", "위에", "앉으신", "자를", "보니", "땅과", "하늘이", "그", "앞에서", "피하여", "간데", "없더라"] },
        { text: "또 내가 보니 죽은 자들이 무론 대소하고 그 보좌 앞에 섰는데 책들이 펴 있고 또 다른 책이 펴졌으니 곧 생명책이라 죽은 자들이 자기 행위를 따라 책들에 기록된대로 심판을 받으니", chunks: ["또", "내가", "보니", "죽은", "자들이", "무론", "대소하고", "그", "보좌", "앞에", "섰는데", "책들이", "펴", "있고", "또", "다른", "책이", "펴졌으니", "곧", "생명책이라", "죽은", "자들이", "자기", "행위를", "따라", "책들에", "기록된대로", "심판을", "받으니"] },
        { text: "바다가 그 가운데서 죽은 자들을 내어주고 또 사망과 음부도 그 가운데서 죽은 자들을 내어주매 각 사람이 자기의 행위대로 심판을 받고", chunks: ["바다가", "그", "가운데서", "죽은", "자들을", "내어주고", "또", "사망과", "음부도", "그", "가운데서", "죽은", "자들을", "내어주매", "각", "사람이", "자기의", "행위대로", "심판을", "받고"] },
        { text: "사망과 음부도 불못에 던지우니 이것은 둘째 사망 곧 불못이라", chunks: ["사망과", "음부도", "불못에", "던지우니", "이것은", "둘째", "사망", "곧", "불못이라"] },
        { text: "누구든지 생명책에 기록되지 못한 자는 불못에 던지우더라", chunks: ["누구든지", "생명책에", "기록되지", "못한", "자는", "불못에", "던지우더라"] }
    ],

    21: [
        { text: "또 내가 새 하늘과 새 땅을 보니 처음 하늘과 처음 땅이 없어졌고 바다도 다시 있지 않더라", chunks: ["또", "내가", "새", "하늘과", "새", "땅을", "보니", "처음", "하늘과", "처음", "땅이", "없어졌고", "바다도", "다시", "있지", "않더라"] },
        { text: "또 내가 보매 거룩한 성 새 예루살렘이 하나님께로부터 하늘에서 내려오니 그 예비한 것이 신부가 남편을 위하여 단장한 것 같더라", chunks: ["또", "내가", "보매", "거룩한", "성", "새", "예루살렘이", "하나님께로부터", "하늘에서", "내려오니", "그", "예비한", "것이", "신부가", "남편을", "위하여", "단장한", "것", "같더라"] },
        { text: "내가 들으니 보좌에서 큰 음성이 나서 가로되 보라 하나님의 장막이 사람들과 함께 있으매 하나님이 저희와 함께 거하시리니 저희는 하나님의 백성이 되고 하나님은 친히 저희와 함께 계셔서", chunks: ["내가", "들으니", "보좌에서", "큰", "음성이", "나서", "가로되", "보라", "하나님의", "장막이", "사람들과", "함께", "있으매", "하나님이", "저희와", "함께", "거하시리니", "저희는", "하나님의", "백성이", "되고", "하나님은", "친히", "저희와", "함께", "계셔서"] },
        { text: "모든 눈물을 그 눈에서 씻기시매 다시 사망이 없고 애통하는 것이나 곡하는 것이나 아픈 것이 다시 있지 아니하리니 처음 것들이 다 지나갔음이러라", chunks: ["모든", "눈물을", "그", "눈에서", "씻기시매", "다시", "사망이", "없고", "애통하는", "것이나", "곡하는", "것이나", "아픈", "것이", "다시", "있지", "아니하리니", "처음", "것들이", "다", "지나갔음이러라"] },
        { text: "보좌에 앉으신 이가 가라사대 보라 내가 만물을 새롭게 하노라 하시고 또 가라사대 이 말은 신실하고 참되니 기록하라 하시고", chunks: ["보좌에", "앉으신", "이가", "가라사대", "보라", "내가", "만물을", "새롭게", "하노라", "하시고", "또", "가라사대", "이", "말은", "신실하고", "참되니", "기록하라", "하시고"] },
        { text: "또 내게 말씀하시되 이루었도다 나는 알파와 오메가요 처음과 나중이라 내가 생명수 샘물로 목 마른 자에게 값 없이 주리니", chunks: ["또", "내게", "말씀하시되", "이루었도다", "나는", "알파와", "오메가요", "처음과", "나중이라", "내가", "생명수", "샘물로", "목", "마른", "자에게", "값", "없이", "주리니"] },
        { text: "이기는 자는 이것들을 유업으로 얻으리라 나는 저의 하나님이 되고 그는 내 아들이 되리라", chunks: ["이기는", "자는", "이것들을", "유업으로", "얻으리라", "나는", "저의", "하나님이", "되고", "그는", "내", "아들이", "되리라"] },
        { text: "그러나 두려워하는 자들과 믿지 아니하는 자들과 흉악한 자들과 살인자들과 행음자들과 술객들과 우상 숭배자들과 모든 거짓말 하는 자들은 불과 유황으로 타는 못에 참예하리니 이것이 둘째 사망이라", chunks: ["그러나", "두려워하는", "자들과", "믿지", "아니하는", "자들과", "흉악한", "자들과", "살인자들과", "행음자들과", "술객들과", "우상", "숭배자들과", "모든", "거짓말", "하는", "자들은", "불과", "유황으로", "타는", "못에", "참예하리니", "이것이", "둘째", "사망이라"] },
        { text: "일곱 대접을 가지고 마지막 일곱 재앙을 담은 일곱 천사중 하나가 나아와서 내게 말하여 가로되 이리 오라 내가 신부 곧 어린 양의 아내를 네게 보이리라 하고", chunks: ["일곱", "대접을", "가지고", "마지막", "일곱", "재앙을", "담은", "일곱", "천사중", "하나가", "나아와서", "내게", "말하여", "가로되", "이리", "오라", "내가", "신부", "곧", "어린", "양의", "아내를", "네게", "보이리라", "하고"] },
        { text: "성령으로 나를 데리고 크고 높은 산으로 올라가 하나님께로부터 하늘에서 내려오는 거룩한 성 예루살렘을 보이니", chunks: ["성령으로", "나를", "데리고", "크고", "높은", "산으로", "올라가", "하나님께로부터", "하늘에서", "내려오는", "거룩한", "성", "예루살렘을", "보이니"] },
        { text: "하나님의 영광이 있으매 그 성의 빛이 지극히 귀한 보석 같고 벽옥과 수정 같이 맑더라", chunks: ["하나님의", "영광이", "있으매", "그", "성의", "빛이", "지극히", "귀한", "보석", "같고", "벽옥과", "수정", "같이", "맑더라"] },
        { text: "크고 높은 성곽이 있고 열 두 문이 있는데 문에 열 두 천사가 있고 그 문들 위에 이름을 썼으니 이스라엘 자손 열 두 지파의 이름들이라", chunks: ["크고", "높은", "성곽이", "있고", "열", "두", "문이", "있는데", "문에", "열", "두", "천사가", "있고", "그", "문들", "위에", "이름을", "썼으니", "이스라엘", "자손", "열", "두", "지파의", "이름들이라"] },
        { text: "동편에 세 문, 북편에 세 문, 남편에 세 문, 서편에 세 문이니", chunks: ["동편에", "세", "문,", "북편에", "세", "문,", "남편에", "세", "문,", "서편에", "세", "문이니"] },
        { text: "그 성에 성곽은 열 두 기초석이 있고 그 위에 어린 양의 십 이 사도의 열 두 이름이 있더라", chunks: ["그", "성에", "성곽은", "열", "두", "기초석이", "있고", "그", "위에", "어린", "양의", "십", "이", "사도의", "열", "두", "이름이", "있더라"] },
        { text: "내게 말하는 자가 그 성과 그 문들과 성곽을 척량하려고 금 갈대를 가졌더라", chunks: ["내게", "말하는", "자가", "그", "성과", "그", "문들과", "성곽을", "척량하려고", "금", "갈대를", "가졌더라"] },
        { text: "그 성은 네모가 반듯하여 장광이 같은지라 그 갈대로 그 성을 척량하니 일만 이천 스다디온이요 장과 광과 고가 같더라", chunks: ["그", "성은", "네모가", "반듯하여", "장광이", "같은지라", "그", "갈대로", "그", "성을", "척량하니", "일만", "이천", "스다디온이요", "장과", "광과", "고가", "같더라"] },
        { text: "그 성곽을 척량하매 일백 사십 사 규빗이니 사람의 척량 곧 천사의 척량이라", chunks: ["그", "성곽을", "척량하매", "일백", "사십", "사", "규빗이니", "사람의", "척량", "곧", "천사의", "척량이라"] },
        { text: "그 성곽은 벽옥으로 쌓였고 그 성은 정금인데 맑은 유리 같더라", chunks: ["그", "성곽은", "벽옥으로", "쌓였고", "그", "성은", "정금인데", "맑은", "유리", "같더라"] },
        { text: "그 성의 성곽의 기초석은 각색 보석으로 꾸몄는데 첫째 기초석은 벽옥이요 둘째는 남보석이요 세째는 옥수요 네째는 녹보석이요", chunks: ["그", "성의", "성곽의", "기초석은", "각색", "보석으로", "꾸몄는데", "첫째", "기초석은", "벽옥이요", "둘째는", "남보석이요", "세째는", "옥수요", "네째는", "녹보석이요"] },
        { text: "다섯째는 홍마노요 여섯째는 홍보석이요 일곱째는 황옥이요 여덟째는 녹옥이요 아홉째는 담황옥이요 열째는 비취옥이요 열 한째는 청옥이요 열 둘째는 자정이라", chunks: ["다섯째는", "홍마노요", "여섯째는", "홍보석이요", "일곱째는", "황옥이요", "여덟째는", "녹옥이요", "아홉째는", "담황옥이요", "열째는", "비취옥이요", "열", "한째는", "청옥이요", "열", "둘째는", "자정이라"] },
        { text: "그 열 두 문은 열 두 진주니 문마다 한 진주요 성의 길은 맑은 유리 같은 정금이더라", chunks: ["그", "열", "두", "문은", "열", "두", "진주니", "문마다", "한", "진주요", "성의", "길은", "맑은", "유리", "같은", "정금이더라"] },
        { text: "성안에 성전을 내가 보지 못하였으니 이는 주 하나님 곧 전능하신 이와 및 어린 양이 그 성전이심이라", chunks: ["성안에", "성전을", "내가", "보지", "못하였으니", "이는", "주", "하나님", "곧", "전능하신", "이와", "및", "어린", "양이", "그", "성전이심이라"] },
        { text: "그 성은 해나 달의 비췸이 쓸데 없으니 이는 하나님의 영광이 비취고 어린 양이 그 등이 되심이라", chunks: ["그", "성은", "해나", "달의", "비췸이", "쓸데", "없으니", "이는", "하나님의", "영광이", "비취고", "어린", "양이", "그", "등이", "되심이라"] },
        { text: "만국이 그 빛 가운데로 다니고 땅의 왕들이 자기 영광을 가지고 그리로 들어오리라", chunks: ["만국이", "그", "빛", "가운데로", "다니고", "땅의", "왕들이", "자기", "영광을", "가지고", "그리로", "들어오리라"] },
        { text: "성문들을 낮에 도무지 닫지 아니하리니 거기는 밤이 없음이라", chunks: ["성문들을", "낮에", "도무지", "닫지", "아니하리니", "거기는", "밤이", "없음이라"] },
        { text: "사람들이 만국의 영광과 존귀를 가지고 그리로 들어오겠고", chunks: ["사람들이", "만국의", "영광과", "존귀를", "가지고", "그리로", "들어오겠고"] },
        { text: "무엇이든지 속된 것이나 가증한 일 또는 거짓말 하는 자는 결코 그리로 들어오지 못하되 오직 어린 양의 생명책에 기록된 자들뿐이라", chunks: ["무엇이든지", "속된", "것이나", "가증한", "일", "또는", "거짓말", "하는", "자는", "결코", "그리로", "들어오지", "못하되", "오직", "어린", "양의", "생명책에", "기록된", "자들뿐이라"] }
    ],
    22: [
        { text: "또 저가 수정 같이 맑은 생명수의 강을 내게 보이니 하나님과 및 어린 양의 보좌로부터 나서", chunks: ["또", "저가", "수정", "같이", "맑은", "생명수의", "강을", "내게", "보이니", "하나님과", "및", "어린", "양의", "보좌로부터", "나서"] },
        { text: "길 가운데로 흐르더라 강 좌우에 생명 나무가 있어 열 두가지 실과를 맺히되 달마다 그 실과를 맺히고 그 나무 잎사귀들은 만국을 소성하기 위하여 있더라", chunks: ["길", "가운데로", "흐르더라", "강", "좌우에", "생명", "나무가", "있어", "열", "두가지", "실과를", "맺히되", "달마다", "그", "실과를", "맺히고", "그", "나무", "잎사귀들은", "만국을", "소성하기", "위하여", "있더라"] },
        { text: "다시 저주가 없으며 하나님과 그 어린 양의 보좌가 그 가운데 있으리니 그의 종들이 그를 섬기며", chunks: ["다시", "저주가", "없으며", "하나님과", "그", "어린", "양의", "보좌가", "그", "가운데", "있으리니", "그의", "종들이", "그를", "섬기며"] },
        { text: "그의 얼굴을 볼터이요 그의 이름도 저희 이마에 있으리라", chunks: ["그의", "얼굴을", "볼터이요", "그의", "이름도", "저희", "이마에", "있으리라"] },
        { text: "다시 밤이 없겠고 등불과 햇빛이 쓸데 없으니 이는 주 하나님이 저희에게 비취심이라 저희가 세세토록 왕노릇하리로다", chunks: ["다시", "밤이", "없겠고", "등불과", "햇빛이", "쓸데", "없으니", "이는", "주", "하나님이", "저희에게", "비취심이라", "저희가", "세세토록", "왕노릇하리로다"] },
        { text: "또 그가 내게 말하기를 이 말은 신실하고 참된지라 주 곧 선지자들의 영의 하나님이 그의 종들에게 결코 속히 될 일을 보이시려고 그의 천사를 보내셨도다", chunks: ["또", "그가", "내게", "말하기를", "이", "말은", "신실하고", "참된지라", "주", "곧", "선지자들의", "영의", "하나님이", "그의", "종들에게", "결코", "속히", "될", "일을", "보이시려고", "그의", "천사를", "보내셨도다"] },
        { text: "보라 내가 속히 오리니 이 책의 예언의 말씀을 지키는 자가 복이 있으리라 하더라", chunks: ["보라", "내가", "속히", "오리니", "이", "책의", "예언의", "말씀을", "지키는", "자가", "복이", "있으리라", "하더라"] },
        { text: "이것들을 보고 들은 자는 나 요한이니 내가 듣고 볼 때에 이 일을 내게 보이던 천사의 발앞에 경배하려고 엎드렸더니", chunks: ["이것들을", "보고", "들은", "자는", "나", "요한이니", "내가", "듣고", "볼", "때에", "이", "일을", "내게", "보이던", "천사의", "발앞에", "경배하려고", "엎드렸더니"] },
        { text: "저가 내게 말하기를 나는 너와 네 형제 선지자들과 또 이 책의 말을 지키는 자들과 함께 된 종이니 그리하지 말고 오직 하나님께 경배하라 하더라", chunks: ["저가", "내게", "말하기를", "나는", "너와", "네", "형제", "선지자들과", "또", "이", "책의", "말을", "지키는", "자들과", "함께", "된", "종이니", "그리하지", "말고", "오직", "하나님께", "경배하라", "하더라"] },
        { text: "또 내게 말하되 이 책의 예언의 말씀을 인봉하지 말라 때가 가까우니라", chunks: ["또", "내게", "말하되", "이", "책의", "예언의", "말씀을", "인봉하지", "말라", "때가", "가까우니라"] },
        { text: "불의를 하는 자는 그대로 불의를 하고 더러운 자는 그대로 더럽고 의로운 자는 그대로 의를 행하고 거룩한 자는 그대로 거룩되게 하라", chunks: ["불의를", "하는", "자는", "그대로", "불의를", "하고", "더러운", "자는", "그대로", "더럽고", "의로운", "자는", "그대로", "의를", "행하고", "거룩한", "자는", "그대로", "거룩되게", "하라"] },
        { text: "보라 내가 속히 오리니 내가 줄 상이 내게 있어 각 사람에게 그의 일한대로 갚아 주리라", chunks: ["보라", "내가", "속히", "오리니", "내가", "줄", "상이", "내게", "있어", "각", "사람에게", "그의", "일한대로", "갚아", "주리라"] },
        { text: "나는 알파와 오메가요 처음과 나중이요 시작과 끝이라", chunks: ["나는", "알파와", "오메가요", "처음과", "나중이요", "시작과", "끝이라"] },
        { text: "그 두루마기를 빠는 자들은 복이 있으니 이는 저희가 생명 나무에 나아가며 문들을 통하여 성에 들어갈 권세를 얻으려 함이로다", chunks: ["그", "두루마기를", "빠는", "자들은", "복이", "있으니", "이는", "저희가", "생명", "나무에", "나아가며", "문들을", "통하여", "성에", "들어갈", "권세를", "얻으려", "함이로다"] },
        { text: "개들과 술객들과 행음자들과 살인자들과 우상 숭배자들과 및 거짓말을 좋아하며 지어내는 자마다 성밖에 있으리라", chunks: ["개들과", "술객들과", "행음자들과", "살인자들과", "우상", "숭배자들과", "및", "거짓말을", "좋아하며", "지어내는", "자마다", "성밖에", "있으리라"] },
        { text: "나 예수는 교회들을 위하여 내 사자를 보내어 이것들을 너희에게 증거하게 하였노라 나는 다윗의 뿌리요 자손이니 곧 광명한 새벽별이라 하시더라", chunks: ["나", "예수는", "교회들을", "위하여", "내", "사자를", "보내어", "이것들을", "너희에게", "증거하게", "하였노라", "나는", "다윗의", "뿌리요", "자손이니", "곧", "광명한", "새벽별이라", "하시더라"] },
        { text: "성령과 신부가 말씀하시기를 오라 하시는도다 듣는 자도 오라 할 것이요 목마른 자도 올 것이요 또 원하는 자는 값 없이 생명수를 받으라 하시더라", chunks: ["성령과", "신부가", "말씀하시기를", "오라", "하시는도다", "듣는", "자도", "오라", "할", "것이요", "목마른", "자도", "올", "것이요", "또", "원하는", "자는", "값", "없이", "생명수를", "받으라", "하시더라"] },
        { text: "내가 이 책의 예언의 말씀을 듣는 각인에게 증거하노니 만일 누구든지 이것들 외에 더하면 하나님이 이 책에 기록된 재앙들을 그에게 더하실 터이요", chunks: ["내가", "이", "책의", "예언의", "말씀을", "듣는", "각인에게", "증거하노니", "만일", "누구든지", "이것들", "외에", "더하면", "하나님이", "이", "책에", "기록된", "재앙들을", "그에게", "더하실", "터이요"] },
        { text: "만일 누구든지 이 책의 예언의 말씀에서 제하여 버리면 하나님이 이 책에 기록된 생명 나무와 및 거룩한 성에 참예함을 제하여 버리시리라", chunks: ["만일", "누구든지", "이", "책의", "예언의", "말씀에서", "제하여", "버리면", "하나님이", "이", "책에", "기록된", "생명", "나무와", "및", "거룩한", "성에", "참예함을", "제하여", "버리시리라"] },
        { text: "이것들을 증거하신 이가 가라사대 내가 진실로 속히 오리라 하시거늘 아멘 주 예수여 오시옵소서", chunks: ["이것들을", "증거하신", "이가", "가라사대", "내가", "진실로", "속히", "오리라", "하시거늘", "아멘", "주", "예수여", "오시옵소서"] },
        { text: "주 예수의 은혜가 모든 자들에게 있을찌어다 아멘", chunks: ["주", "예수의", "은혜가", "모든", "자들에게", "있을찌어다", "아멘"] }
    ]
};


/* [시스템] 닉네임 생성 데이터 */
const NICK_ADJECTIVES = [
    "푸른", "붉은", "하얀", "황금", "투명한", 
    "온유한", "겸손한", "강한", "지혜로운", "신실한",
    "기뻐하는", "기도하는", "감사하는", "순종하는", "담대한",
    "새벽의", "은혜로운", "거룩한", "따뜻한", "빛나는"
];

const NICK_NOUNS = [
    "만나", "무화과", "포도", "감람유", "밀이삭",
    "양", "비둘기", "사자", "독수리", "나귀",
    "방패", "성벽", "물매돌", "지팡이", "등불",
    "시냇물", "종려나무", "백향목", "면류관", "항아리"
];

/* [기능] 랜덤 닉네임 조합 함수 */
function generateRandomNickname() {
    const adj = NICK_ADJECTIVES[Math.floor(Math.random() * NICK_ADJECTIVES.length)];
    const noun = NICK_NOUNS[Math.floor(Math.random() * NICK_NOUNS.length)];
    return adj + " " + noun;
}

/* [추가] 최종 체력 계산 함수 (버프 적용용) */
function recalculateMaxHearts() {
    // 1. 도감 점수 확인 (15,000점 이상이면 +3 보너스)
    let bonus = 0;
    
    // 아직 점수 변수가 안 만들어졌을 수도 있으니 안전하게 확인
    if (typeof grandTotalScore !== 'undefined' && grandTotalScore >= 15000) {
        bonus = 3;
    }

    // 2. 최종 체력 = 구매한 체력 + 보너스
    maxPlayerHearts = purchasedMaxHearts + bonus;
    
    // 3. UI 갱신 (화면의 하트 숫자 바꾸기)
    if(typeof updateBattleUI !== 'undefined') updateBattleUI();
}

// 1. 리그 및 부스터 데이터 초기화
let leagueData = {
    weekId: getWeekId(), // 현재 주차 (예: "2026-W07")
    monthId: getMonthId(), // 현재 월 (예: "202602")
    myScore: 0,
    myMonthlyScore: 0, // 월간 누적 점수
    stageLog: {}, // { "1-1": "2026-02-14" } -> 일일 초회 클리어 기록 (미션용)
};

// ============================================================
// [Forgetting-Curve 냉각 시간 계산]
// ============================================================
function getNextEligibleTime(memoryLevel) {
    // 메모리 레벨에 따른 냉각 시간 (시간 단위)
    const cooldownHours = {
        0: 23,   // Level 0: 1일 (23시간)
        1: 71,   // Level 1: 3일 (71시간)
        2: 167,  // Level 2: 7일 (167시간)
        3: 335,  // Level 3: 14일 (335시간)
        4: 719,  // Level 4+: 30일 (719시간)
        5: 719
    };
    
    const hours = cooldownHours[memoryLevel] || 719;
    return Date.now() + (hours * 60 * 60 * 1000);
}

// ============================================================
// [때를 따른 양식 보너스 시스템]
// ============================================================
function getTimedBonus(stageId) {
    // 보너스 데이터 초기화
    if (!stageTimedBonus[stageId]) {
        stageTimedBonus[stageId] = { remaining: 3, lastClear: 0 };
    }
    
    const bonus = stageTimedBonus[stageId];
    
    // 망각 주기 체크
    const memStatus = checkMemoryStatus(stageId);
    
    // 망각 주기 도래 시 자동 리셋
    if (memStatus.isForgotten && bonus.remaining < 3) {
        bonus.remaining = 3;
    }
    
    return bonus;
}

function consumeTimedBonus(stageId) {
    const bonus = getTimedBonus(stageId);
    
    const currentLevel = bonus.remaining; // 현재 값 저장
    
    if (bonus.remaining > 0) {
        bonus.remaining--;
        bonus.lastClear = Date.now();
    }
    
    return currentLevel; // 소진 전 값 반환
}

/* [시스템: 미션 및 부스터 데이터] */
let boosterData = {
    active: false,
    endTime: 0,
    multiplier: 1,
    nextLoginReward: null // { multi: 3, min: 15 } 형태 (내일 보상 저장용)
};

/* ✨ [캐시] 랭킹 데이터 클라이언트 캐싱 (1시간 유지) */
let rankingCache = {
    tribes: {}, // { tribeId: { data, timestamp }, ... }
    zion: { data: null, timestamp: 0 },
    weeklyHall: { data: null, timestamp: 0 },
    monthlyHall: { data: null, timestamp: 0 }
};

const RANKING_CACHE_DURATION = 60 * 60 * 1000; // 1시간(ms)

        /* [데이터: 챕터 및 스테이지 정보 (자동 생성 시스템 - 버그 수정판)] */
const gameData = [];

// ★ 디버그: bibleData 길이 확인
console.log('=== bibleData 장별 길이 확인 ===');
for (let j = 1; j <= 22; j++) {
    if (bibleData[j]) {
        console.log(`장 ${j}: ${bibleData[j].length}절`);
    }
}

// 1장부터 22장까지 반복
for (let i = 1; i <= 22; i++) {
    const chapterVerses = bibleData[i];
    
    if (chapterVerses) {
        const totalVerses = chapterVerses.length;
        
        // -------------------------------------------------------
        // [1] 중간 점검 구간(Range) 미리 계산하기 (3~7개 규칙 적용)
        // -------------------------------------------------------
        let midBossRanges = [];
        let start = 1;
        
        while (start <= totalVerses) {
            let end = start + 4; // 기본 5개씩 (예: 1~5)
            
            // 남은 구절 개수 확인 (전체 길이 - 현재 끝번호)
            let remaining = totalVerses - end;
            
            // [규칙 1] 남은 게 3개 미만이면(1, 2개), 현재 구간에 흡수시킨다. (예: 10장 6~10 + 11 -> 6~11)
            if (remaining > 0 && remaining < 3) {
                end = totalVerses; 
            }
            
            // [규칙 2] 계산된 끝번호가 전체보다 크면 전체로 맞춤
            if (end > totalVerses) {
                end = totalVerses;
            }

            // [생성 조건 수정]
            // 1. 구간의 길이가 최소 3개 이상이어야 함.
            // 2. '1절부터 끝절까지' 한 번에 다루는 구간은 제외 (그건 최종 보스니까)
            const isRangeValid = (end - start + 1) >= 3;
            const isWholeChapter = (start === 1 && end === totalVerses);

            if (isRangeValid && !isWholeChapter) {
                midBossRanges.push({ start: start, end: end });
            }
            
            start = end + 1; // 다음 구간 시작점
        }

        // -------------------------------------------------------
        // [2] 스테이지 객체 생성
        // -------------------------------------------------------
        const chapterObj = {
            id: i,
            title: `요한계시록 ${i}장`,
            subtitle: i === 1 ? "계시의 시작" : "진행 중",
            locked: false,
            stages: []
        };

        // 절(Verse)별 스테이지 생성 루프
        chapterVerses.forEach((verse, idx) => {
            const verseNum = idx + 1;
            
            // 1. 일반 훈련 스테이지 추가
            chapterObj.stages.push({
                id: `${i}-${verseNum}`,
                title: `${i}장 ${verseNum}절`,
                desc: verse.text.substring(0, 15) + "...",
                type: "normal",
                locked: false,
                cleared: false
            });

            // 2. 중간 점검 삽입 타이밍 확인
            // 현재 절(verseNum)이 아까 계산해둔 구간의 '끝(end)'과 일치하는지 확인
            const range = midBossRanges.find(r => r.end === verseNum);
            
            if (range) {
                // 동적 HP 계산 (끝 - 시작 + 1)
                const hp = range.end - range.start + 1;
                
                chapterObj.stages.push({
                    id: `${i}-mid-${range.end}`, // ID는 끝 번호 기준
                    title: `🛡️ 중간 점검 (${i}장 ${range.start}~${range.end}절)`,
                    desc: `지금까지 외운 ${hp}개 절을 확인합니다.`,
                    type: "mid-boss",
                    targetVerseCount: hp, // ★ 실제 개수만큼 HP 설정!
                    locked: false,
                    cleared: false
                });
            }
        });

        // 3. 최종 보스 추가
        chapterObj.stages.push({
            id: `${i}-boss`,
            title: `🐲 BOSS: ${i}장 완전 정복`,
            desc: `붉은 용을 물리치고 ${i}장을 완성하라!`,
            type: "boss",
            targetVerseCount: totalVerses, // 전체 개수만큼 HP
            locked: false,
            cleared: false
        });

        gameData.push(chapterObj);
    } 
    else {
        // 데이터 없는 챕터
        gameData.push({ id: i, title: `요한계시록 ${i}장`, subtitle: "준비 중", locked: true, stages: [] });
    }
}

        /* [시스템: 성전 데이터 (12단계 최종판)] */
let myCastleLevel = 0; 
let viewingCastleLevel = -1;
let lastClaimTime = Date.now(); // 방치형 보상 시간 기록

/* [1단계] 성전 데이터 수정 (생산량 1/4 축소 + reqStage 제거) */
const castleBlueprints = [
    // [Lv.0]
    { 
        level: 0, 
        name: "제사장의 시작", 
        desc: "작은 촛불 하나, 그리고 고요한 방. 이 빈 공간은 무엇으로 채워지게 될까요?", 
        img: "image_0.webp", 
        cost: 0, prod: 0, cap: 0, bonus: 0 
    },
    // [Lv.1~3]
    { level: 1, name: "쌓이는 노력", desc: "바닥에 쌓인 책들만큼 당신의 마음에도 말씀이 쌓여갑니다.", img: "image_1.webp", cost: 1000, prod: 5, cap: 40, bonus: 2 },
    { level: 2, name: "첫 번째 책장", desc: "어수선하던 생각들이 제자리를 찾기 시작합니다.", img: "image_2.webp", cost: 2000, prod: 10, cap: 80, bonus: 4 },
    { level: 3, name: "서재의 모습", desc: "책상 위 가득한 열정과 깊어진 지식.", img: "image_3.webp", cost: 3000, prod: 15, cap: 120, bonus: 6 },
    // [Lv.4~7]
    { level: 4, name: "빛의 변화", desc: "벽면에 일곱 금 촛대가 불을 밝혔습니다.", img: "image_4.webp", cost: 5000, prod: 25, cap: 200, bonus: 8 },
    { level: 5, name: "정결한 옷", desc: "순백의 두루마기가 준비되었습니다.", img: "image_5.webp", cost: 7000, prod: 35, cap: 280, bonus: 10 },
    { level: 6, name: "생명의 샘", desc: "메마른 바닥에서 맑은 생명수가 터져 나옵니다.", img: "image_6.webp", cost: 10000, prod: 45, cap: 360, bonus: 12 },
    { level: 7, name: "자라나는 생명", desc: "물가에 심기운 나무처럼, 당신의 믿음에 푸른 싹이 돋아납니다.", img: "image_7.webp", cost: 13000, prod: 60, cap: 480, bonus: 15 },
    // [Lv.8~11]
    { level: 8, name: "하늘의 보화", desc: "책장 한편에 반짝이는 보석과 면류관이 보이나요?", img: "image_8.webp", cost: 17000, prod: 80, cap: 640, bonus: 18 },
    { level: 9, name: "새 노래", desc: "정적을 깨고 아름다운 선율이 흐릅니다.", img: "image_9.webp", cost: 21000, prod: 100, cap: 800, bonus: 20 },
    { level: 10, name: "풍성한 결실", desc: "어느새 천장까지 닿은 나무에 생명 과실이 가득합니다.", img: "image_10.webp", cost: 28000, prod: 125, cap: 1000, bonus: 25 },
    { level: 11, name: "열린 문과 영광", desc: "굳게 닫혀있던 문이 열리고 영광의 빛이 쏟아집니다!", img: "image_11.webp", cost: 37000, prod: 150, cap: 1500, bonus: 30 }
];

        // [시스템: 성과 측정 변수]
        let stageStartTime = 0; // 시작 시간
        let wrongCount = 0;     // 틀린 횟수

        /* [시스템: 화면 이동] */
/* [수정] 게임 시작 함수 (사운드 설정 불러오기 적용) */
function startGame() {
    // 0. 여정 시작 오버레이 표시
    const overlay = document.getElementById('journey-overlay');
    const amenBtn = document.getElementById('amen-btn');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    if (amenBtn) {
        amenBtn.style.display = 'block'; // display 속성 복구 추가
        amenBtn.style.opacity = '0';
        amenBtn.style.pointerEvents = 'none';
        setTimeout(() => {
            amenBtn.style.opacity = '1';
            amenBtn.style.pointerEvents = 'auto';
        }, 1000);
        amenBtn.onclick = amenAndStartGame;
    }
}

function amenAndStartGame() {
    const overlay = document.getElementById('journey-overlay');
    const amenBtn = document.getElementById('amen-btn');
    if (overlay) overlay.style.display = 'none';
    if (amenBtn) amenBtn.style.display = 'none';

    // 1. 오디오 권한 획득
    if (typeof SoundEffect !== 'undefined' && SoundEffect.ctx.state === 'suspended') {
        SoundEffect.ctx.resume();
    }
    // 2. ★ [핵심] 배경 음악 설정 확인 및 시작
    // 저장된 값이 없으면(null) 기본값 'true'(켜짐)로 간주
    const savedBgmState = localStorage.getItem('setting_bgm_on');
    const shouldPlayBgm = (savedBgmState === null) || (savedBgmState === 'true');

    if (typeof BackgroundMusic !== 'undefined') {
        // 이전에 켜놨거나, 처음 실행이라면 음악 재생
        if (shouldPlayBgm) {
            BackgroundMusic.start();
        } else {
            // 꺼놨다면 재생하지 않음 (BackgroundMusic.isPlaying은 기본 false임)
            BackgroundMusic.stop(); 
        }
        // 3. ★ 버튼 상태 동기화 (UI 업데이트)
        const bgmBtn = document.getElementById('btn-bgm');
        if(bgmBtn) {
            if (shouldPlayBgm) {
                bgmBtn.style.opacity = "1";
                bgmBtn.innerText = "🎵";
            } else {
                bgmBtn.style.opacity = "0.5";
                bgmBtn.innerText = "🔇";
            }
        }
    }

    // 4. ★ 효과음 버튼 상태 동기화
    // SoundEffect.isMuted는 1단계에서 이미 불러왔으므로, 버튼 아이콘만 맞춰줍니다.
    const sfxBtn = document.querySelector('.map-header button[onclick="toggleSound(this)"]');
    if (sfxBtn) {
        // isMuted가 true면(음소거면) 🔇, 아니면 🔊
        sfxBtn.innerText = SoundEffect.isMuted ? "🔇" : "🔊";
    }

    // 5. 맵 화면으로 이동
    goMap(); 

    // 6. 일일 생명의 떡 지급 체크 (기능 제거)
}

        function goHome() {
            // 1. 모든 화면 숨기기
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            
            // 2. 홈 화면 켜기
            document.getElementById('home-screen').classList.add('active');
            
            // 3. 성전 모습 업데이트
            updateCastleView();

            // ★ 주간 리셋 알림 표시
            const warningEl = document.getElementById('month-end-warning');
            if (warningEl) {
                const now = new Date();
                const isLastDay = isLastDayOfWeek();

                // 일요일이면 알림 표시
                warningEl.style.display = isLastDay ? 'block' : 'none';
            }

            // ★ [추가] 중요! 혹시 열려있을지 모르는 스테이지 시트(하얀 박스)를 닫아줌
            closeStageSheet();
            // 백버튼 표시 상태 갱신 (홈에서는 숨김)
            if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
        }

        function goMap() {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            
            // ★ [수정] 동적으로 생성된 화면(도감 등) 제거
            const lifeBookScreen = document.getElementById('life-book-screen');
            if (lifeBookScreen) lifeBookScreen.remove();
            
            document.getElementById('map-screen').classList.add('active');
            if (typeof seasonTimerInterval !== 'undefined' && seasonTimerInterval) {
        clearInterval(seasonTimerInterval);
    }
            // ★ [추가] 맵으로 돌아올 때 복습 데이터 업데이트
            if (typeof updateForgottenNotificationData === 'function') {
                updateForgottenNotificationData();
            }
         setTimeout(drawRiver, 50);
        // 백버튼 표시 상태 갱신 (맵에서는 숨김)
        if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
        // ★ [추가] 맵으로 돌아올 때 리소스 UI 업데이트 (만나 수령 시 보석 반영)
        if (typeof updateResourceUI === 'function') updateResourceUI();
        }

        // 백버튼(돌아가기) 표시를 현재 활성 화면에 따라 제어
        function updateBackButtonVisibility() {
            // 1) 우선 모든 btn-back 숨김 처리
            document.querySelectorAll('.btn-back').forEach(b => b.style.display = 'none');

            // 2) 현재 활성화된 화면 내부의 btn-back 만 보이게 함
            const active = document.querySelector('.screen.active');
            if (!active) return;
            active.querySelectorAll('.btn-back').forEach(b => b.style.display = 'inline-block');
        }

        // 화면에 돌아가기 버튼이 없으면 생성
        function ensureBackButton(screen) {
            if (!screen) return;

            let footer = screen.querySelector('.button-area-static');
            if (!footer) {
                footer = document.createElement('div');
                footer.className = 'button-area-static';
                screen.appendChild(footer);
            }

            let btn = footer.querySelector('.btn-back');
            if (!btn) {
                btn = document.createElement('button');
                btn.className = 'btn-gray btn-back';
                btn.type = 'button';
                btn.textContent = '돌아가기';
                btn.onclick = goMap;
                footer.appendChild(btn);
            } else {
                btn.classList.add('btn-gray', 'btn-back');
                if (!btn.textContent || btn.textContent.trim() === '') {
                    btn.textContent = '돌아가기';
                }
            }
        }

        /* [시스템: 맵 렌더링 (레이어 완벽 분리 버전)] */
function renderChapterMap() {
    const container = document.getElementById('chapter-list-area');
    
    // 1. 컨테이너 초기화
    container.className = 'river-map-container';
    container.innerHTML = `
        <div id="map-land-area"></div> <svg id="river-svg">           <path id="river-path" class="river-path" d="" />
        </svg>
    `;
    
    const landArea = document.getElementById('map-land-area');

    // 2. 챕터별 구역 생성
    gameData.forEach((chapter, index) => {
        // A. 상태 확인
        const bossId = `${chapter.id}-boss`;
        const isChapterClear = stageMastery[bossId] > 0;
        
        const lastTime = stageLastClear[`chapter-${chapter.id}`] || 0;

        // B. 껍데기 (Wrapper) 생성
        const wrapper = document.createElement('div');
        wrapper.className = 'zone-wrapper';
        if (index % 2 === 0) wrapper.classList.add('left');
        else wrapper.classList.add('right');

        // C. 배경 (Land Background) 생성
        const bg = document.createElement('div');
        let bgClass = 'land-bg barren'; 
        if (isChapterClear) {
            bgClass = 'land-bg garden';
        }
        bg.className = bgClass;

        // D. 나무 버튼 (Node) 생성
        const node = document.createElement('div');
        let statusClass = chapter.locked ? 'locked' : 'unlocked';
        if (isChapterClear) statusClass = 'completed';
        
        node.className = `stage-node ${statusClass}`;
        node.id = `node-${index}`;

        // 아이콘 결정
        let iconChar = "🌱";
        let fruitHTML = ""; 

        if (!chapter.locked) iconChar = "🌳"; 

        if (isChapterClear) {
            iconChar = "🌳"; 
            fruitHTML = `
                <div class="fruit-cluster">
                    <span class="fruit f1">🍎</span>
                    <span class="fruit f2">🍒</span>
                    <span class="fruit f3">🍎</span>
                    <span class="fruit f4">✨</span>
                </div>
            `;
        }

        node.innerHTML = `
            <div class="tree-icon">
                ${iconChar}
                ${fruitHTML}
            </div>
            <div class="stage-label">${chapter.title}</div>
        `;

        node.onclick = () => { 
            if (!chapter.locked) openStageSheet(chapter); 
            else alert("🔒 이전 챕터를 먼저 클리어하여 길을 여세요."); 
        };

        // ★ 핵심: 배경과 버튼을 형제(Sibling)로 배치
        wrapper.appendChild(bg);   // 1층 (배경)
        wrapper.appendChild(node); // 3층 (버튼) - CSS z-index:10 적용됨
        
        landArea.appendChild(wrapper);
    });

    // 3. 강물 그리기
    setTimeout(drawRiver, 100); 
    window.addEventListener('resize', drawRiver);
}

/* [시스템: S자 강물 그리기 (Zone 대응 버전)] */
function drawRiver() {
    const svg = document.getElementById('river-svg');
    const path = document.getElementById('river-path');
    const nodes = document.querySelectorAll('.stage-node');
    const container = document.querySelector('.river-map-container');
    
    if (nodes.length === 0 || !svg || !path || !container || container.offsetParent === null) return;

    // 1. SVG 높이 설정 (컨텐츠 전체 높이만큼)
    svg.style.height = `${container.scrollHeight}px`;

    // 2. 컨테이너 위치
    const containerRect = container.getBoundingClientRect();

    // 3. 좌표 수집
    let points = [];
    nodes.forEach(node => {
        const rect = node.getBoundingClientRect();
        
        // X: 노드 중심
        const x = (rect.left - containerRect.left) + (rect.width / 2);
        
        // Y: 노드 중심 + 스크롤 보정
        // (주의: position:relative인 부모들 때문에 offsetTop이 더 정확할 수 있음)
        // 여기서는 getBoundingClientRect와 scrollTop을 조합
        const y = (rect.top - containerRect.top) + container.scrollTop + (rect.height / 2);
        
        points.push({ x, y });
    });

    if (points.length < 2) return;

    // 4. 경로 그리기
    // 시작: 첫 번째 노드의 훨씬 위쪽 하늘에서 시작 (강물이 내려오는 느낌)
    let d = `M ${points[0].x} 0 `; 
    
    // 각 노드를 연결 (부드러운 곡선)
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i+1];
        
        // 중간 지점 (Control Point)
        const midY = (p1.y + p2.y) / 2;
        
        // p1 -> p2로 가는 베지어 곡선
        // 첫 번째 점은 직선으로 연결하지 않고, 이전 곡선과 이어지게 처리
        if (i === 0) d += `L ${p1.x} ${p1.y} `;

        d += `C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y} `;
    }

    // 끝: 마지막 노드 아래로 흘러가게
    const lastP = points[points.length - 1];
    d += `L ${lastP.x} ${container.scrollHeight}`;

    path.setAttribute('d', d);
}

        // 전역 변수로 타이머 관리 (창 닫을 때 끄기 위해)
var stageSheetTimer = null;

// [도우미] 스테이지가 속한 챕터 데이터 조회
function getChapterDataByStageId(stageId) {
    const chNum = parseInt(String(stageId).split('-')[0]);
    if (isNaN(chNum)) return null;
    return gameData.find(c => c.id === chNum) || null;
}

// [도우미] 해당 스테이지 구간의 체크포인트(중간점검/보스) ID 찾기
function getSegmentCheckpointStageId(chapterData, stageId) {
    if (!chapterData || !chapterData.stages) return null;
    const idx = chapterData.stages.findIndex(s => s.id === stageId);
    if (idx === -1) return null;

    for (let i = idx + 1; i < chapterData.stages.length; i++) {
        const stage = chapterData.stages[i];
        if (!stage) continue;
        if (stage.type === 'mid-boss' || stage.type === 'boss') return stage.id;
    }

    return null;
}

// [도우미] 중간점검/보스 클리어 시 전체학습 허용 여부
function isFullLearningUnlockedByCheckpoint(stageId) {
    const chapterData = getChapterDataByStageId(stageId);
    if (!chapterData) return false;

    const stage = chapterData.stages.find(s => s.id === stageId);
    if (!stage || stage.type !== 'normal') return false;

    const checkpointId = getSegmentCheckpointStageId(chapterData, stageId);
    if (!checkpointId) return false;

    return (stageMastery[checkpointId] || 0) > 0;
}

// [도우미] 한 번도 진행하지 않은 스테이지인지 확인
function isUnplayedStage(stageId) {
    return !missionData.stageProgress || !missionData.stageProgress[stageId];
}

// [도우미] 스테이지 진행도 스냅샷
function getStageProgressSnapshot(stageId) {
    if (!missionData || !missionData.stageProgress) return null;
    return missionData.stageProgress[stageId] || null;
}

// [도우미] Step 1~5 완료 처리 여부
function isStageFullyLearned(stageId, stageData) {
    const progress = getStageProgressSnapshot(stageId);
    const phase = progress ? progress.phase : 0;
    const hasMastery = (stageMastery && stageMastery[stageId] && stageMastery[stageId] > 0);
    const isCleared = stageData && stageData.cleared;

    if (hasMastery || isCleared || phase >= 3) return true;
    return isFullLearningUnlockedByCheckpoint(stageId);
}

// ★ [도우미] 해당 장의 아직 초회를 받지 않은 mid-boss의 총 절수
function getUnreceivedMidBossVerses(chapterNum) {
    const chData = gameData.find(c => c.id === chapterNum);
    if (!chData) return 0;
    
    let unreceived = 0;
    chData.stages.forEach(stage => {
        if (stage.type === 'mid-boss') {
            const lastTime = stageLastClear[stage.id] || 0;
            const isClearedToday = lastTime && new Date(lastTime).toDateString() === new Date().toDateString();
            // 초회를 못 받은 mid-boss = 아직 오늘 클리어하지 않은 것
            if (!isClearedToday) {
                unreceived += stage.targetVerseCount || 0;
            }
        }
    });
    return unreceived;
}

// ★ [도우미] 해당 장의 모든 mid-boss 스테이지 ID 목록
function getChapterMidBossIds(chapterNum) {
    const chData = gameData.find(c => c.id === chapterNum);
    if (!chData) return [];
    return chData.stages
        .filter(s => s.type === 'mid-boss')
        .map(s => s.id);
}

/* [수정] 스테이지 시트 열기 (각 버튼별 타이머 적용) */
function openStageSheet(chapterData) {
    const sheet = document.getElementById('stage-sheet');
    document.getElementById('sheet-chapter-title').innerText = chapterData.title;
    
    const list = document.getElementById('stage-list-area');
    list.innerHTML = "";
    
    // 이전에 돌아가던 타이머가 있다면 정지 (중복 방지)
    if (stageSheetTimer) clearInterval(stageSheetTimer);

    chapterData.stages.forEach(stage => {
        const item = document.createElement('div');
        
        // 1. 상태 정보 확인
        const isCleared = stage.cleared; 
        const chNum = parseInt(stage.id.split('-')[0]);
        
        // 배지 및 스타일
        let itemClass = `stage-item ${stage.type === 'boss' ? 'boss' : ''}`;
        if (isCleared) itemClass += ' cleared';

        const lastTime = stageLastClear[stage.id] || 0;
let isTodayClear = new Date(lastTime).toDateString() === new Date().toDateString();

// [추가] 망각 상태 체크 로직
const memStatus = checkMemoryStatus(stage.id); 
const isForgotten = memStatus.isForgotten;

let statusBadgeHtml = "";

// 1. 오늘 완료 배지
if (isTodayClear) {
    itemClass += ' today-clear';
    statusBadgeHtml = `<div class="today-badge">오늘 완료</div>`;
} 
// 2. 망각 위험 배지
else if (isForgotten) {
    itemClass += ' forgotten-clear';
    statusBadgeHtml = `<div class="forgotten-badge">망각 위험!</div>`;
}

// 3. 기억 레벨 배지 (타이틀 옆에 붙일 예정)
// 레벨 0은 굳이 표시 안 함 (깔끔하게)
let levelBadgeHtml = "";
if (memStatus.level > 0) {
    let colorClass = "mem-lv-low"; // 초록 (Lv.1~2)
    if (memStatus.level >= 5) colorClass = "mem-lv-high"; // 빨강 (Lv.5+)
    else if (memStatus.level >= 3) colorClass = "mem-lv-mid"; // 파랑 (Lv.3~4)
    
    levelBadgeHtml = `<span class="mem-badge ${colorClass}">Lv.${memStatus.level}</span>`;
}

        item.className = itemClass;

        // 아이콘
        let iconChar = "🌱"; 
        if (stage.type === 'boss') iconChar = "🐲";
        else if (stage.type === 'mid-boss') iconChar = "🛡️";
        if (isCleared) iconChar = "🌳"; 

        // 2. ★ 쿨타임(숙성) 여부 확인 ★
        const progress = getStageProgressSnapshot(stage.id);
        const progressPhase = progress ? progress.phase : 0;
        const isFullStepsComplete = isStageFullyLearned(stage.id, stage);
        const isCoolingDown = !isFullStepsComplete && progress && progress.unlockTime > Date.now();
        const isNormalStage = (stage.type !== 'boss' && stage.type !== 'mid-boss');
        const canChooseReviewMode = isNormalStage && isFullStepsComplete;

        // 3. 버튼 오른쪽 표시 (톱니바퀴 vs 재생버튼 vs 타이머)
        let rightSideContent = "";
        let rewardInfo = "";

        if (canChooseReviewMode) {
            rightSideContent = `<div style="font-size:1.2rem; color:#bdc3c7;">⚙️</div>`;
            
            // ★ [때를 따른 양식 보너스 표시]
            const timedBonus = getTimedBonus(stage.id);
            const bonusRemaining = timedBonus.remaining;
            const baseGem = 10;
            const bonusMultiplier = (bonusRemaining === 3) ? 5 : (bonusRemaining === 2) ? 2 : (bonusRemaining === 1) ? 1.5 : 1;
            let displayGem = Math.floor(baseGem * bonusMultiplier);
            if (isForgotten) displayGem = Math.floor(displayGem * 1.1);
            const forgottenTag = isForgotten ? " 💜+10%" : "";

            let rewardLabel = "";
            if (bonusRemaining === 3) {
                rewardLabel = `🎁[1회차] ${displayGem}💎 (×5)${forgottenTag}`;
            } else if (bonusRemaining === 2) {
                rewardLabel = `🔱[2회차] ${displayGem}💎 (×2)${forgottenTag}`;
            } else if (bonusRemaining === 1) {
                rewardLabel = `⚔️[3회차] ${displayGem}💎 (×1.5)${forgottenTag}`;
            } else {
                rewardLabel = `⏳[쿨타임] ${displayGem}💎 (×1)${forgottenTag}`;
            }
            const bossNote = (stage.type === 'boss' || stage.type === 'mid-boss')
                ? `<div style="font-size:0.7rem; color:#7f8c8d; margin-top:2px;">정확도/성전/퍼펙트는 별도 적용</div>`
                : "";
            rewardInfo = `<div style="font-size:0.75rem; color:#e67e22; font-weight:bold; margin-top:4px;">${rewardLabel}</div>${bossNote}`;
        }
        else if (isCoolingDown) {
            // 쿨타임 중
            rightSideContent = `<div class="live-timer" data-unlock="${progress.unlockTime}" style="font-size:0.9rem; color:#e74c3c; font-weight:bold; background:#fff0f0; padding:4px 8px; border-radius:12px; border:1px solid #e74c3c;">⏳ 계산중</div>`;
            rewardInfo = `<div style="font-size:0.75rem; color:#95a5a6; margin-top:4px;">뇌가 소화 중입니다...</div>`;
        } 
        else {
            // 안 깼고 쿨타임도 아님 -> 재생 버튼
            rightSideContent = `<div style="font-size:1.2rem; color:#f1c40f;">▶</div>`;
            
            // ★ [통일] 모든 스테이지에 때를 따른 양식 보너스 표시
            const timedBonus = getTimedBonus(stage.id);
            const bonusRemaining = timedBonus.remaining;
            const bonusMultiplier = (bonusRemaining === 3) ? 5 : (bonusRemaining === 2) ? 2 : (bonusRemaining === 1) ? 1.5 : 1;
            const baseGem = (stage.type === 'boss' || stage.type === 'mid-boss')
                ? (stage.targetVerseCount || 0) * 10
                : 10;
            let displayGem = Math.floor(baseGem * bonusMultiplier);
            if (isForgotten) displayGem = Math.floor(displayGem * 1.1);
            const forgottenTag = isForgotten ? " 💜+10%" : "";

            let rewardLabel = "";
            if (bonusRemaining === 3) {
                rewardLabel = `🎁[1회차] ${displayGem}💎 (×5)${forgottenTag}`;
            } else if (bonusRemaining === 2) {
                rewardLabel = `🔱[2회차] ${displayGem}💎 (×2)${forgottenTag}`;
            } else if (bonusRemaining === 1) {
                rewardLabel = `⚔️[3회차] ${displayGem}💎 (×1.5)${forgottenTag}`;
            } else {
                rewardLabel = `⏳[쿨타임] ${displayGem}💎 (×1)${forgottenTag}`;
            }
            rewardInfo = `<div style="font-size:0.75rem; color:#e67e22; font-weight:bold; margin-top:4px;">${rewardLabel}</div>`;
        }

        // 3-1. 단계 진행 안내 뱃지 (phase 시스템 제거로 인해 삭제됨)
        let stepHintHtml = "";
        // (이전: "다음: Step 1~2" 등의 표시 제거됨)

        // 4. HTML 조립
        item.innerHTML = `
    ${statusBadgeHtml}
    <div class="stage-icon">${iconChar}</div>
    <div class="stage-info">
        <div class="stage-title">
            ${levelBadgeHtml} ${stage.title}  </div>
        <div class="stage-desc">${stage.desc}</div> 
        ${stepHintHtml}
        ${rewardInfo}
    </div>
    ${rightSideContent}
        `;
        
        // 5. 클릭 이벤트
        item.onclick = () => {
            window.currentStageId = stage.id;

            if (stage.type === 'boss' || stage.type === 'mid-boss') {
                startBossBattle(stage.targetVerseCount); 
            } else if (canChooseReviewMode) {
                openModeSelect(stage.id);
            } else {
                startTraining(stage.id);
            }
        };
        
        list.appendChild(item);
    });
    
    sheet.classList.add('open');

    // ★ 6. 타이머 작동 시작 (1초마다 갱신) ★
    stageSheetTimer = setInterval(() => {
        const timerEls = document.querySelectorAll('.live-timer');
        if (timerEls.length === 0) return;

        const now = Date.now();
        timerEls.forEach(el => {
            const unlockTime = parseInt(el.dataset.unlock);
            const diff = unlockTime - now;

            if (diff <= 0) {
                // 시간이 다 되면 -> 'OPEN'으로 변경 (초록색)
                el.innerText = "🔓 OPEN";
                el.style.color = "#2ecc71";
                el.style.borderColor = "#2ecc71";
                el.style.background = "#eafaf1";
                // (선택 사항: 여기서 리스트를 새로고침하면 재생 버튼으로 바뀜)
            } else {
                // 남은 시간 표시 (MM:SS)
                const mm = Math.floor(diff / 60000);
                const ss = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
                el.innerText = `⏳ ${mm}:${ss}`;
            }
        });
    }, 1000);
}

// [1. 스마트 모드 선택 팝업 (시간 감지 기능 탑재)]

// 시간대별 설정값 (아이콘, 색상, 설명, 코스모드)
const TIME_ROUTINE = {
    'morning': { 
        title: "🌅 아침 묵상", 
        desc: "읽기(Step 1) + 초성(Step 2)으로 하루를 여세요.", 
        color: "#f39c12", 
        mode: "morning" 
    },
    'lunch': { 
        title: "🍱 점심 게임", 
        desc: "타워(Step 3) + 두루마리(Step 4)로 잠을 깨우세요!", 
        color: "#27ae60", 
        mode: "lunch" 
    },
    'evening': { 
        title: "🌙 저녁 완성", 
        desc: "배열(Step 5) + 초성완성(Step 6)으로 기억 저장.", 
        color: "#8e44ad", 
        mode: "evening" 
    },
    'night': { 
        title: "🦉 심야 훈련", 
        desc: "고요한 시간에 말씀에 집중하세요.", 
        color: "#34495e", 
        mode: "full" // 밤에는 그냥 풀코스 추천
    }
};

let selectedStageForMode = null;

/* [수정] 복습 모드 선택 팝업 (Step 6 클리어 후 전용) */
function openModeSelect(stageId) {
    const modal = document.getElementById('mode-select-modal');
    const container = modal.querySelector('.result-card');
    
    // 팝업 내용 재구성
    container.innerHTML = `
        <div style="text-align: right;">
            <button onclick="closeModeSelect()" style="background:none; border:none; font-size:1.5rem; color:#95a5a6; cursor:pointer;">✕</button>
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="margin:0; color:#2c3e50;">복습 모드 선택</h2>
            <p style="color:#7f8c8d; font-size:0.9rem; margin-top:5px;">완료된 스테이지입니다.</p>
        </div>

        <button class="mode-btn" onclick="confirmMode('quick')" style="background:#fff9c4; border:2px solid #f1c40f; color:#d35400; box-shadow: 0 4px 0 #f39c12;">
            <div class="mode-icon">⚡</div>
            <div class="mode-info">
                <div class="mode-tag" style="background:#f1c40f; color:#d35400;">추천</div>
                <div class="mode-title">빠른 복습 (Step 2, 5)</div>
                <div class="mode-desc">초성 퀴즈 + 문장 배열 (핵심만!)</div>
            </div>
        </button>

        <button class="mode-btn" onclick="confirmMode('full')" style="background:white; border:2px solid #bdc3c7; color:#7f8c8d; box-shadow: 0 4px 0 #95a5a6;">
            <div class="mode-icon">📖</div>
            <div class="mode-info">
                <div class="mode-title">전체 학습 (Step 1~5)</div>
                <div class="mode-desc">읽기부터 문장 완성까지 꼼꼼하게</div>
            </div>
        </button>
    `;

    window.selectedStageForMode = stageId;
    modal.style.display = 'flex';
}

function confirmMode(mode) {
    if (!window.selectedStageForMode) return;
    const stageId = window.selectedStageForMode;
    closeModeSelect(); 
    startTraining(stageId, mode);
}

function closeModeSelect() {
    const modal = document.getElementById('mode-select-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    window.selectedStageForMode = null; // 선택 상태 초기화
}

        function closeStageSheet() {
    const sheet = document.getElementById('stage-sheet');
    sheet.classList.remove('open');
    
    // [추가] 타이머 정리 (메모리 누수 방지)
    if (stageSheetTimer) {
        clearInterval(stageSheetTimer);
        stageSheetTimer = null;
    }
}

/* [시스템] 초회/반복 학습 권장 (이전 재도전 보너스 제거) */

/* [2단계] 보스전 보상 정밀 계산 함수 (초회/반복 구분) */
function calculateBossBaseGem(chapterNum) {
    const verses = bibleData[chapterNum]; // 해당 장의 구절 데이터
    if (!verses) return 0;

    let totalGem = 0;
    const today = new Date().setHours(0,0,0,0); // 오늘 날짜 0시 0분

    verses.forEach((v, idx) => {
        const subId = `${chapterNum}-${idx + 1}`;
        const lastTime = stageLastClear[subId] || 0;
        
        // 해당 스테이지를 '오늘' 깼는지 확인
        const isClearedToday = new Date(lastTime).setHours(0,0,0,0) === today;

        if (isClearedToday) {
            // 같은 날 반복: 기본 보상 10개
            totalGem += 10; 
        } else {
            // 새로운 날 초회: 초회 보상 50개
            totalGem += 50;
        }
    });

    return totalGem;
}

/* [수정] 기억 상태 확인 함수 (1시간 여유 두기 패치) */
function checkMemoryStatus(stageId) {
    // 1. (기존) 보스/중간점검도 망각 위험 판정에서 제외했으나, 이제 포함

    // 2. 한 번도 안 깬 경우
    if (!stageLastClear[stageId]) {
        return { level: 0, isForgotten: false, remainTime: null };
    }

    const currentLevel = stageMemoryLevels[stageId] || 0;
    const lastTime = stageLastClear[stageId];
    const now = Date.now();
    
    // 경과 시간(시간 단위) 계산
    const diffHours = (now - lastTime) / (1000 * 60 * 60);

    // ★ [핵심 변경] 레벨별 망각 주기 (1시간씩 단축!)
    let forgettingTime = 23; // Lv.0 (기본 24시간 -> 23시간)
    
    if (currentLevel === 1) {
        forgettingTime = 71;  // Lv.1 (3일=72시간 -> 71시간)
    } else if (currentLevel === 2) {
        forgettingTime = 167; // Lv.2 (7일=168시간 -> 167시간)
    } else if (currentLevel === 3) {
        forgettingTime = 335; // Lv.3 (14일=336시간 -> 335시간)
    } else if (currentLevel >= 4) {
        forgettingTime = 719; // Lv.4+ (30일=720시간 -> 719시간)
    }

    // 설정된 시간보다 더 지났으면 '망각 상태(true)'
    const isForgotten = diffHours >= forgettingTime;

    return {
        level: currentLevel,
        isForgotten: isForgotten,
        remainTime: forgettingTime - diffHours
    };
}

/* [수정] 스테이지 클리어: 다음 스테이지 잠금 해제 로직 추가 */
function stageClear(type) {
    // [추가] 숙련도(클리어 횟수) 증가 로직
    if (window.currentStageId) {
        if (!stageMastery[window.currentStageId]) {
            stageMastery[window.currentStageId] = 0;
        }
        stageMastery[window.currentStageId]++; // 횟수 +1
    }
    // 1. 현재 스테이지 클리어 처리
    let currentStageIndex = -1;
    let targetChapter = null;

    if (window.currentStageId) {
        // 전체 챕터를 뒤져서 현재 스테이지 위치를 찾음
        gameData.forEach(ch => {
            const idx = ch.stages.findIndex(st => st.id === window.currentStageId);
            if (idx !== -1) {
                ch.stages[idx].cleared = true; // 깃발 꽂기
                currentStageIndex = idx;
                targetChapter = ch;
            }
        });
    }

    
if (type === 'normal') {
        updateMissionProgress('training', 1); // 훈련 1회 완료
    }
    if (window.isReplayMode) {
        updateMissionProgress('review', 1); // 복습 1회 완료
    }

    // ★ 보스나 중간점검을 잡았다면? -> 주간 미션 갱신!
    if (type === 'boss' || type === 'mid-boss') {
        updateMissionProgress('dragonKill', 1, 'weekly'); 
    }
    updateGemDisplay(); // UI 갱신

    // 3. 저장
    saveGameData(); 
    updateNotificationBadges();
}

        //[시스템: 보스전 로직]//
        let currentBossHp, maxBossHp, playerHearts, currentVerseIdx, currentVerseData, selectedBlocks;
        let currentBossParts, currentBossPartIndex, currentBossChunks;

  //[2] 보스전 시작 함수 (하트 버그 수정 + 구간 자동 탐지)//
function startBossBattle(limitCount_unused) { 
    // 1. 이어하기 데이터 확인
    const savedRaw = localStorage.getItem('kingsRoad_checkpoint');
    let resumeMode = false;
    let savedData = null;

    if (savedRaw) {
        savedData = JSON.parse(savedRaw);
        if (savedData.stageId === window.currentStageId) {
            if (confirm(`💾 지난 기록이 있습니다.\n\n[${savedData.index + 1}번째 구절]부터 이어하시겠습니까?\n(체력: ${savedData.hp} / ${savedData.maxHp})`)) {
                resumeMode = true;
            } else {
                clearCheckpoint();
            }
        }
    }

    // 화면 전환 및 초기화
    closeStageSheet();
    document.getElementById('map-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    document.getElementById('game-screen').classList.remove('mode-training');

    const bossAvatar = document.querySelector('.boss-avatar');
    if (bossAvatar) {
        bossAvatar.classList.remove('boss-die-effect'); // 사망 연출 제거 (부활)
        bossAvatar.classList.remove('boss-hit-effect'); // 피격 연출 제거
        bossAvatar.style.opacity = "1"; // 혹시 모르니 투명도 원상복구
        bossAvatar.style.transform = "scaleX(-1)"; // 좌우 반전 유지
    }

    const field = document.querySelector('.battle-field');
    const control = document.querySelector('.battle-control');
    field.innerHTML = `<div class="verse-indicator" id="verse-index">준비 중...</div><div class="answer-zone" id="answer-zone"><span class="placeholder-text" id="placeholder-text">...</span></div>`;
    control.innerHTML = `<div class="block-pool" id="block-pool"></div>`;

    window.currentBattleData = [];
    wrongCount = 0;

    const sId = String(window.currentStageId);
    const parts = sId.split('-'); 
    const chapterNum = parseInt(parts[0]);

    if (isNaN(chapterNum) || !bibleData[chapterNum]) return;

    // -----------------------------------------------------------
    // [구간 설정] ID 이름이 아닌 '순서'로 5개씩 끊기
    // -----------------------------------------------------------
    const fullChapterData = bibleData[chapterNum];
    let startIndex = 0; 
    let endIndex = fullChapterData.length; // 기본값: 전체 (최종보스)

    console.log(`[보스 시작] 1단계: 장 확인 - ${chapterNum}장, bibleData[${chapterNum}].length = ${fullChapterData.length}`);

    const chData = gameData.find(c => c.id === chapterNum);
    
    // 중간보스라면 순서를 찾아서 범위 지정
    if (chData && sId.includes('mid')) { 
        const midBosses = chData.stages.filter(s => s.type === 'mid-boss');
        const myIndex = midBosses.findIndex(s => s.id === sId);

        // 0번(첫째): 0~5 (1~5절)
        // 1번(둘째): 5~10 (6~10절)
        // 2번(셋째): 10~15 (11~15절)
        if (myIndex !== -1) {
            startIndex = myIndex * 5;
            endIndex = startIndex + 5;
            
            // 데이터 범위 초과 방지 안전장치
            if (endIndex > fullChapterData.length) endIndex = fullChapterData.length;
        }
    }

    // 데이터 잘라내기
    window.currentBattleData = fullChapterData.slice(startIndex, endIndex);
    maxBossHp = window.currentBattleData.length; 

    window.currentBattleChapter = chapterNum;
    window.currentBattleStartIndex = startIndex;
    
    // ★ 디버그: 보스 체력 확인
    console.log(`[보스 시작] 장: ${chapterNum}, 스테이지: ${sId}, 최대 체력: ${maxBossHp}, 구절 수: ${window.currentBattleData.length}`); 

    // -----------------------------------------------------------
    // [체력 설정] 하트 10개 버그 수정 (확실한 초기화)
    // -----------------------------------------------------------
    if (resumeMode && savedData) {
        currentVerseIdx = savedData.index;
        playerHearts = savedData.hp;     
        currentBossHp = savedData.bossHp;
        currentBossPartIndex = (typeof savedData.partIndex === 'number') ? savedData.partIndex : 0;
    } else {
        // ★ 새로 시작: 일단 기본 체력으로 초기화
        currentVerseIdx = 0;
        currentBossHp = maxBossHp;
        playerHearts = maxPlayerHearts; // (보통 5)
        currentBossPartIndex = 0;
    }

    updateBattleUI(); 
    loadNextVerse();
}

/* [축하 이펙트] 보스 클리어 시 파티클 폭죽 생성 */
function createVictoryParticles() {
    const gameScreen = document.getElementById('game-screen');
    const particleEmojis = ['⭐', '✨', '💛', '🎉', '🏆', '💎'];
    
    // 2번의 웨이브로 나눠서 생성 (더 화려하게)
    for (let wave = 0; wave < 2; wave++) {
        setTimeout(() => {
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.innerHTML = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
                
                // 랜덤 위치에서 시작
                const startX = Math.random() * 100; // 0 ~ 100%
                const startY = -10; // 화면 위에서 출발
                
                particle.style.cssText = `
                    position: fixed;
                    left: ${startX}%;
                    top: ${startY}%;
                    font-size: ${1.5 + Math.random() * 1}rem;
                    pointer-events: none;
                    z-index: 1000;
                    animation: fallDown ${2 + Math.random() * 1}s ease-in forwards;
                    opacity: 1;
                `;
                
                gameScreen.appendChild(particle);
            }
        }, wave * 300); // 300ms 간격으로 웨이브 생성
    }
}

/* [CSS 인젝션] fallDown 애니메이션 (동적 추가) */
(function injectParticleStyles() {
    if (document.getElementById('particle-style')) return; // 이미 있으면 스킵
    
    const style = document.createElement('style');
    style.id = 'particle-style';
    style.textContent = `
        @keyframes fallDown {
            0% {
                transform: translateY(0) translateX(0) scale(1);
                opacity: 1;
            }
            50% {
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) translateX(${Math.sin(Math.random() * Math.PI) * 200}px) scale(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
})();

        /* [수정] loadNextVerse (축하 이펙트 강화 버전) */
function loadNextVerse() {
    // 1. 전투 종료 체크 (승리!)
    if (currentVerseIdx >= window.currentBattleData.length) {
        
        // ★ [추가] 용 사망 연출 시작
        const bossAvatar = document.querySelector('.boss-avatar');
        if (bossAvatar && !bossAvatar.classList.contains('boss-die-effect')) {
            
            // 1. 사망 애니메이션 클래스 추가
            bossAvatar.classList.add('boss-die-effect');
            
            // 2. 축하 이펙트 음성 (승리 팡파레 시뮬레이션)
            if(typeof SoundEffect !== 'undefined') {
                // 승리 음성: 상승하는 톤 연속
                SoundEffect.playTone(330, 'sine', 0.3, 0.1);  // 미(E)
                setTimeout(() => SoundEffect.playTone(392, 'sine', 0.3, 0.1), 100);  // 파(G)
                setTimeout(() => SoundEffect.playTone(494, 'sine', 0.3, 0.1), 200);  // 라(A)
                setTimeout(() => SoundEffect.playTone(587, 'sine', 0.5, 0.2), 300);  // 시(B) - 길게
            }

            // 3. 파티클 폭죽 이펙트 생성
            createVictoryParticles();

            // 4. 애니메이션 시간(2초) 뒤에 진짜 승리 처리
            setTimeout(() => {
                const clearedStageId = window.currentStageId;
                const sId = String(window.currentStageId);
                
                // 저장 데이터 삭제
                clearCheckpoint();

                if (sId.includes('mid')) stageClear('mid-boss');
                else stageClear('boss');
                
                quitGame();
                openStageSheetForStageId(clearedStageId);
            }, 2000); // 2초 딜레이 (폭죽 효과 최대 2개 웨이브)
            
            return; // 함수 여기서 중단 (애니메이션 기다림)
        }
        // 이미 연출 중이면 중복 실행 방지
        return;
    }

    // ▼▼▼ [추가] 5구절 단위 자동 저장 (0번 인덱스 제외) ▼▼▼
    // 예: idx=5(6구절), idx=10(11구절) 시작할 때 저장
    if (currentVerseIdx > 0 && currentVerseIdx % 5 === 0) {
        saveBattleCheckpoint();
    }
    
    // 2. 화면 구조 복구 (훈련 모드 잔상 제거)
    const field = document.querySelector('.battle-field');
    const control = document.querySelector('.battle-control');
    
    field.innerHTML = `
        <div class="verse-indicator" id="verse-index">준비 중...</div>
        <div class="answer-zone" id="answer-zone">
            <span class="placeholder-text" id="placeholder-text">단어를 터치하여 공격 주문을 완성하세요</span>
        </div>
    `;
    control.innerHTML = `<div class="block-pool" id="block-pool"></div>`;

    // 3. 데이터 준비
    currentVerseData = window.currentBattleData[currentVerseIdx];

    const verseChunks = (currentVerseData && currentVerseData.chunks) ? currentVerseData.chunks : [];
    if (verseChunks.length > 20) {
        const splitIndex = Math.ceil(verseChunks.length / 2);
        currentBossParts = [verseChunks.slice(0, splitIndex), verseChunks.slice(splitIndex)];
        if (typeof currentBossPartIndex !== 'number' || currentBossPartIndex < 0) currentBossPartIndex = 0;
        if (currentBossPartIndex >= currentBossParts.length) currentBossPartIndex = 0;
        currentBossChunks = currentBossParts[currentBossPartIndex];
    } else {
        currentBossParts = null;
        currentBossPartIndex = 0;
        currentBossChunks = verseChunks;
    }

    function updateVerseIndicator() {
        const chapterNum = window.currentBattleChapter || 1;
        const verseNum = (window.currentBattleStartIndex || 0) + currentVerseIdx + 1;
        let label = `요한계시록 ${chapterNum}장 ${verseNum}절`;
        if (currentBossParts && currentBossParts.length > 1) {
            label += ` (파트 ${currentBossPartIndex + 1}/${currentBossParts.length})`;
        }
        const verseEl = document.getElementById('verse-index');
        if (verseEl) verseEl.innerText = label;
    }

    // 상단 스테이지 표시 업데이트
    updateVerseIndicator();
    
    const zone = document.getElementById('answer-zone');
    const pool = document.getElementById('block-pool');
    
    // 4. 블록 클릭 핸들러
    let selectedBlock = null; 
    function deselect() {
        if (selectedBlock) {
            selectedBlock.classList.remove('selected-block');
            selectedBlock = null;
        }
    }

    function handleBossBlockClick(btn) {
        btn.classList.remove('error-block');
        btn.classList.remove('correct-block');

        if (btn.parentElement === pool) {
            const ph = document.getElementById('placeholder-text');
            if(ph) ph.style.display = 'none';
            zone.appendChild(btn);
        } else {
            pool.appendChild(btn);
            if (zone.children.length === 0) {
                const ph = document.getElementById('placeholder-text');
                if(ph) ph.style.display = 'block';
            }
        }
    }

    function renderBossBlocks(chunks) {
        zone.innerHTML = '<span class="placeholder-text" id="placeholder-text">단어를 터치하여 공격 주문을 완성하세요</span>';
        pool.innerHTML = '';
        selectedBlock = null;

        const shuffled = [...chunks].sort(() => Math.random() - 0.5);
        shuffled.forEach(word => {
            const btn = document.createElement('div');
            btn.className = 'word-block';
            btn.innerText = getChosung(word);
            btn.dataset.original = word;
            btn.style.backgroundColor = "#e74c3c"; // 붉은색 계열
            btn.style.color = "#fff";
            btn.style.border = "1px solid #c0392b";
            btn.onclick = () => handleBossBlockClick(btn);
            pool.appendChild(btn);
        });
    }

    // 5. 블록 생성
    renderBossBlocks(currentBossChunks);

    // 6. 공격 버튼 생성
    const oldBtn = document.getElementById('btn-boss-attack');
    if(oldBtn) oldBtn.remove();

    const attackBtn = document.createElement('button');
    attackBtn.id = 'btn-boss-attack';
    attackBtn.className = 'btn-attack';
    attackBtn.innerText = "⚔️ 공격하기";
    
    // [수정] 보스전 공격 버튼 클릭 로직
attackBtn.onclick = () => {
    const currentBlocks = Array.from(zone.querySelectorAll('.word-block'));
    const correctChunks = currentBossChunks;

    // 개수 체크
    if (currentBlocks.length !== correctChunks.length) {
        alert(`주문이 완성되지 않았습니다!\n(현재: ${currentBlocks.length} / 필요: ${correctChunks.length})`);
        return;
    }

    let errorCount = 0;
    currentBlocks.forEach((btn, index) => {
        // ★ [핵심 수정] 원래 단어(dataset.original)가 아니라, 
        // 화면에 보이는 초성(innerText)이 정답의 초성과 같은지 비교합니다.
        const visibleText = btn.innerText; 
        const targetChosung = getChosung(correctChunks[index]);

        if (visibleText === targetChosung) {
            btn.classList.add('correct-block');
            btn.classList.remove('error-block');
        } else {
            btn.classList.add('error-block');
            btn.classList.remove('correct-block');
            errorCount++;
        }
    });

    if (errorCount === 0) {
        if (currentBossParts && currentBossPartIndex < currentBossParts.length - 1) {
            SoundEffect.playAttack();
            currentBossPartIndex += 1;
            currentBossChunks = currentBossParts[currentBossPartIndex];
            renderBossBlocks(currentBossChunks);
            updateVerseIndicator();
            deselect();
            return;
        }

        // 🔵 성공 로직 (기존 유지)
        SoundEffect.playAttack();
        triggerBossHitEffect();
        currentBossHp--;
        updateBattleUI();
        
        attackBtn.innerText = "✨ CRITICAL HIT! ✨";
        attackBtn.style.backgroundColor = "#f1c40f";
        
        setTimeout(() => {
            currentVerseIdx++;
            loadNextVerse();
        }, 1000);
        deselect();
    } else {
        // 🔴 실패 로직 (기존 유지)
        SoundEffect.playWrong();
        playerHearts--;
        wrongCount++;
        updateBattleUI();

        alert(`❌ 공격 실패!\n${errorCount}군데가 틀렸습니다.`);
        
        if (playerHearts <= 0) {
            showReviveModal(); 
        }
        deselect();
    }
};

    document.querySelector('.battle-control').appendChild(attackBtn);
}
        

/* [수정] UI 업데이트 함수 (분할 체력바 + 개선된 보스 표시) */
function updateBattleUI() {
    // ★ 디버그: updateBattleUI 호출 시점의 maxBossHp 확인
    console.log(`[updateBattleUI] 호출됨 - maxBossHp=${maxBossHp}, currentBossHp=${currentBossHp}`);
    
    // 1. 보스 체력바 업데이트 (세그먼트 방식)
    if(typeof maxBossHp !== 'undefined' && maxBossHp > 0) { 
        const hpContainer = document.querySelector('.hp-container');
        const bossText = document.getElementById('boss-hp-text');
        
        // ★ 핵심: maxBossHp가 변경되면 항상 새로 생성 (플래그 확인 안 함)
        if(hpContainer) {
            const currentSegmentCount = hpContainer.querySelectorAll('.hp-segment').length;
            
            // maxBossHp가 일치하지 않으면 새로 생성
            if (currentSegmentCount !== maxBossHp) {
                hpContainer.innerHTML = ''; // 기존 내용 제거
                
                // 각 구절마다 세그먼트 생성
                for (let i = 0; i < maxBossHp; i++) {
                    const segment = document.createElement('div');
                    segment.className = 'hp-segment';
                    segment.setAttribute('data-index', i);
                    if (i >= currentBossHp) {
                        segment.classList.add('damaged');
                    }
                    // 모든 세그먼트가 동일한 크기를 가지도록 계산: (전체 너비 - gap*개수) / 개수
                    const flexBasis = `calc((100% - ${(maxBossHp - 1) * 1}px) / ${maxBossHp})`;
                    segment.style.flex = `0 0 ${flexBasis}`;
                    segment.style.height = '100%';
                    hpContainer.appendChild(segment);
                }
            } else {
                // 이미 동일한 개수의 세그먼트가 있으면 상태만 업데이트
                const segments = hpContainer.querySelectorAll('.hp-segment');
                segments.forEach((seg, i) => {
                    if (i >= currentBossHp) {
                        seg.classList.add('damaged');
                    } else {
                        seg.classList.remove('damaged');
                    }
                });
            }
        }
        
        // 텍스트 업데이트 (현재 체력 / 최대 체력)
        if(bossText) bossText.innerText = `${currentBossHp} / ${maxBossHp}`;
    }

    // 2. 데이터 준비
    const lifeBreadCnt = (typeof inventory !== 'undefined' && inventory.lifeBread) ? inventory.lifeBread : 0;
    const heartIcon = playerHearts > 0 ? "❤️" : "💔";
    const isDanger = (playerHearts <= 2);

    // 생명의 떡 버튼 HTML (공통 사용)
    const lifeBreadBtnHtml = `
        <span onclick="event.stopPropagation(); useBattleItem('lifeBread')" 
              style="cursor:pointer; margin-left:10px; font-size:0.9rem; display:inline-flex; align-items:center; 
                     background:#fff; color:#2c3e50; padding:4px 12px; border-radius:20px; 
                     border:1px solid #bdc3c7; box-shadow:0 2px 5px rgba(0,0,0,0.1); transition:transform 0.1s;">
            🍞 <span style="margin-left:5px; font-weight:bold; font-size:1rem;">${lifeBreadCnt}</span>
        </span>
    `;

    // 3. UI 렌더링
    
    // [A] 보스전 화면 (아이디 player-hearts 유지 중요!)
    const heartDisplay = document.querySelector('.heart-display');
    if (heartDisplay) {
        heartDisplay.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:center;">
                <span style="font-size:1.2rem;">${heartIcon}</span> 
                <span id="player-hearts" style="font-weight:bold; margin-left:5px;">${playerHearts}</span>
                <span style="font-size:0.8rem; color:#bdc3c7; margin-left:3px;"> / ${maxPlayerHearts}</span>
                ${lifeBreadBtnHtml}
            </div>
        `;
        applyDangerEffect(heartDisplay, isDanger);
    }

    // [B] 훈련 모드 헤더 (아이디 training-hearts 유지 중요!)
    const trainingHeartEl = document.getElementById('training-hearts');
    if (trainingHeartEl) {
        const parent = trainingHeartEl.parentElement; 
        if (parent) {
            parent.style.display = "flex";
            parent.style.alignItems = "center";
            parent.style.justifyContent = "center";
            
            // ★ 핵심: 갱신할 때 id="training-hearts"를 반드시 다시 적어줘야 다음에도 찾을 수 있습니다.
            parent.innerHTML = `
                ${heartIcon} <span id="training-hearts" style="margin-left:5px; font-weight:bold; color:#2c3e50;">${playerHearts}</span>
                ${lifeBreadBtnHtml}
            `;
            applyDangerEffect(parent, isDanger);
        }
    }
}

// [보조] 위기 상황 효과 함수
function applyDangerEffect(element, isDanger) {
    if (!element) return;
    if (isDanger && playerHearts > 0) {
        element.style.animation = "pulse 0.5s infinite";
        if(element.querySelector('#player-hearts')) element.querySelector('#player-hearts').style.color = "#ff4757";
        if(element.querySelector('#training-hearts')) element.querySelector('#training-hearts').style.color = "#ff4757";
    } else {
        element.style.animation = "none";
        if(element.querySelector('#player-hearts')) element.querySelector('#player-hearts').style.color = "";
        if(element.querySelector('#training-hearts')) element.querySelector('#training-hearts').style.color = "#2c3e50";
    }
}

/* [시스템] 부활 관련 함수 (비용 차등 적용) */
let currentReviveCost = 300; // 현재 부활 비용 저장용 변수

/* [수정] 부활 모달 표시 함수 (ID 불일치 문제 해결) */
function showReviveModal() {
    // 1. 현재 스테이지 ID 확인
    const sId = String(window.currentStageId);

    // 2. 비용 계산 (일반:150, 중간:300, 보스:500)
    if (sId.includes('mid')) {
        currentReviveCost = 300;
    } else if (sId.includes('boss')) {
        currentReviveCost = 500;
    } else {
        currentReviveCost = 150;
    }

    // 3. UI 텍스트 업데이트 (계산원이 가격표를 바꿔치는 부분)
    
    // (A) 설명글 업데이트
    const descText = document.getElementById('revive-cost-text');
    if (descText) {
        descText.innerText = currentReviveCost;
        
        // 색상 강조
        if (currentReviveCost >= 500) descText.style.color = "#e74c3c"; // 빨강
        else if (currentReviveCost >= 300) descText.style.color = "#e67e22"; // 주황
        else descText.style.color = "#2c3e50"; // 기본
    }

    // (B) 버튼 텍스트 업데이트 (이 부분이 핵심!)
    const btnText = document.getElementById('revive-btn-cost');
    if (btnText) {
        btnText.innerText = currentReviveCost;
    }

    // 4. 모달 창 띄우기
    const modal = document.getElementById('revive-modal');
    if (modal) {
        modal.style.display = 'flex';
        // 부드럽게 나타나는 효과
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.style.transition = 'opacity 0.3s';
        }, 10);
    }
}

function giveUpBattle() {
    document.getElementById('revive-modal').style.display = 'none';
    alert("💔 패배... 눈앞이 캄캄해집니다.");
    quitGame();
}

/* [수정] 부활 함수 (Step 4 재시동 기능 탑재) */
function revivePlayer() {
    // 안전장치: 혹시라도 변수가 정의되지 않았을 경우 기본값 300
    const cost = (typeof currentReviveCost !== 'undefined') ? currentReviveCost : 300;

    // 1. 보석 부족 체크
    if (myGems < cost) {
        alert(`💎 보석이 부족합니다... 부활하려면 ${cost}개가 필요합니다.`);
        return; 
    }

    // 2. 결제 및 부활 처리
    myGems -= cost;
    updateGemDisplay(); 
    
    // 체력 완전 회복
    playerHearts = maxPlayerHearts;
    updateBattleUI(); 
    
    // 모달(팝업) 닫기
    const modal = document.getElementById('revive-modal');
    if(modal) modal.style.display = 'none';

    // ====================================================
    // [★ 핵심 수리] 멈춰있던 Step 4 엔진 다시 켜기
    // ====================================================
    if (currentStep === 4) {
        // 이미 0.1초 딜레이 같은 건 필요 없으니 바로 출발시킵니다.
        // 이 함수가 두루마리를 다시 내려오게 만듭니다.
        startScrollStep(); 
    }

    // 효과음 재생
    if(typeof SoundEffect !== 'undefined' && SoundEffect.playLevelUp) {
        SoundEffect.playLevelUp(); 
    }
    
    alert(`✨ 기적적으로 회복했습니다!\n(보석 -${cost})`);
}

/* [시스템] 자동 저장 및 불러오기 기능 */

// 1. 토스트 알림 띄우기
function showToast(message) {
    const toast = document.getElementById("toast-notification");
    toast.innerText = message;
    toast.className = "show";
    
    // 2초 뒤에 사라짐
    setTimeout(function(){ 
        toast.className = toast.className.replace("show", ""); 
    }, 2000);
}

// 2. 체크포인트 저장 (5구절마다)
function saveBattleCheckpoint() {
    const saveData = {
        stageId: window.currentStageId,   // 현재 스테이지
        index: currentVerseIdx,           // 현재 몇 번째 구절인지
        partIndex: (typeof currentBossPartIndex === 'number') ? currentBossPartIndex : 0,
        hp: playerHearts,                 // ★ 현재 체력 그대로 저장
        maxHp: maxPlayerHearts,
        bossHp: currentBossHp,
        timestamp: Date.now()
    };
    
    localStorage.setItem('kingsRoad_checkpoint', JSON.stringify(saveData));
    showToast(`💾 진행 상황 저장됨 (Step ${currentVerseIdx + 1})`);
}

// 3. 저장 데이터 삭제 (클리어하거나 죽어서 나갈 때)
function clearCheckpoint() {
    localStorage.removeItem('kingsRoad_checkpoint');
}

        /* [수정] 게임 종료/포기 (나가기 시 밀린 팝업 확인 기능 추가) */
function quitGame() {
    // 1. 스크롤 게임 정지 (안전장치)
    if(typeof scrollGame !== 'undefined' && scrollGame.animId) {
        cancelAnimationFrame(scrollGame.animId);
    }

    // 2. 화면 전환 (전투 -> 맵)
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('map-screen').classList.add('active');
    
    // 3. 모달 닫기
    const quitModal = document.getElementById('quit-modal');
    if (quitModal) quitModal.style.display = 'none';
    
    // 4. 전투 데이터 및 진행 상황 완전 초기화
    window.currentBattleData = null; 
    window.currentVerseData = null;         
    window.currentStageId = null;    
    window.currentVerseIdx = 0;
    window.wrongCount = 0;
    
    // 5. 배경음악 복구
    if(typeof playBGM === 'function') {
        playBGM('main'); 
    }

    // ★ [NEW] 6. 전투 끝나고 맵에 도착했으니, 밀린 업적 팝업이 있다면 보여줘!
    // 0.5초 뒤에 실행 (화면 전환이 완전히 끝난 뒤 자연스럽게)
    setTimeout(() => {
        if (typeof tryShowMilestone === 'function') {
            tryShowMilestone();
        }
    }, 500);
}

       /* [시스템: 성전 화면 업데이트 (이미지 & 버튼 상태)] */
function updateCastleView() {
    // 1. 데이터 가져오기
    const data = castleBlueprints[Math.min(myCastleLevel, castleBlueprints.length - 1)];
    const nextData = castleBlueprints[myCastleLevel + 1]; // 다음 단계 정보

    // 2. 텍스트 & 이미지 업데이트
    document.getElementById('castle-name').innerText = `Lv.${data.level} ${data.name}`;
    document.getElementById('castle-desc').innerText = data.desc;
    
    const imgTag = document.getElementById('castle-img');
    imgTag.src = data.img; // 이미지 파일 연결! (파일 없으면 엑박 대신 🚧 뜸)

    // 3. 건설 버튼 상태 관리 logic
    const btn = document.getElementById('btn-build');
    
    if (!nextData) {
        // 만렙
        btn.innerText = "👑 건설 완료";
        btn.disabled = true;
        btn.style.background = "#2c3e50";
        btn.style.cursor = "default";
        return;
    }

    const canBuild = myGems >= nextData.cost;
    
    if (canBuild) {
        btn.innerText = `🔨 건설하기 (💎 ${nextData.cost})`;
        btn.disabled = false;
        btn.style.background = "#2ecc71"; // 초록색 (가능)
        btn.style.cursor = "pointer";
        btn.style.boxShadow = "0 4px 0 #27ae60";
        btn.onclick = tryBuildCastle; // 클릭 이벤트 연결
    } else {
        btn.innerText = `🔒 건설 불가 (필요: 💎 ${nextData.cost})`;
        btn.disabled = true;
        btn.style.background = "#95a5a6"; // 회색 (불가)
        btn.style.cursor = "not-allowed";
        btn.style.boxShadow = "none";
    }
}

/* =========================================
   [시스템: 데이터 저장 및 불러오기 (Local Storage)]
   ========================================= */

/* [수정] 게임 저장하기 (닉네임 포함) */
function saveGameData() {
    // ID와 태그가 없으면 만듭니다
    if (!myPlayerId) myPlayerId = 'user_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    if (!myTag) myTag = Math.floor(1000 + Math.random() * 9000);

    // 리셋 중에는 저장을 중단합니다.
    if (window.isResetting) {
        console.log('저장 중단: 리셋 플래그 활성화');
        return;
    }

    const saveData = {
        version: GAME_VERSION, // ★ [정식 배포] 버전 정보 추가
        level: myCastleLevel,
        gems: myGems,
        maxHearts: purchasedMaxHearts, // 순수 체력만 저장
        
        // ★ 닉네임 / 지파 정보 추가
        nickname: myNickname,
        tribe: (typeof myTribe !== 'undefined') ? myTribe : 0,
        dept: (typeof myDept !== 'undefined') ? myDept : 0,
        tag: myTag,
        playerId: myPlayerId,
        
        // 나머지 데이터 유지
        inv: inventory,
        missions: missionData,
        mastery: stageMastery,
        lastClear: stageLastClear,
        nextEligibleTime: stageNextEligibleTime, // ★ [Forgetting-Curve] 다음 클리어 가능 시간
        timedBonus: stageTimedBonus, // ★ [때를 따른 양식] 망각 주기 기반 보너스
        // dailyAttempts 제거됨
        achievementStatus: achievementStatus, 
        memoryLevels: stageMemoryLevels,
        // 통계 데이터 포함
        stats: userStats,
        lastClaimTime: lastClaimTime,
        clearedStages: Object.keys(stageMastery), 
        lastPlayed: localStorage.getItem('lastPlayedDate'),
        streak: localStorage.getItem('streakDays'),
        leagueData: leagueData,
        boosterData: boosterData
    };
    localStorage.setItem('kingsRoadSave', JSON.stringify(saveData));

    // 서버 업로드가 있다면 호출
    if (typeof saveMyScoreToServer === 'function') saveMyScoreToServer();

    // Service Worker용 복습 알림 데이터 업데이트
    if (typeof updateForgottenNotificationData === 'function') {
        try { updateForgottenNotificationData(); } catch(e) { console.error(e); }
    }
}



/* [수정됨] 통합 자원 UI 업데이트 (지파 색상 반영) */
function updateGemDisplay() {
    // 1. 인벤토리 파악
    const lifeBreadCnt = (typeof inventory !== 'undefined' && inventory.lifeBread) ? inventory.lifeBread : 0;
    
    // 2. 현재 내 지파 정보 가져오기 (색상 적용을 위해)
    const currentTribe = TRIBE_DATA[myTribe] || TRIBE_DATA[0];
    
    // 3. 지파 색상에 맞춘 보석 아이콘 생성 (네온 효과)
    // '💎' 대신 지파의 고유 색상(core)으로 빛나는 '✦' 아이콘 사용
    const gemIcon = `<span style="color:${currentTribe.core}; text-shadow:0 0 5px ${currentTribe.glow}; font-size:1.1rem;">💎</span>`;
    
    // 4. 표시할 HTML 구성 (지파 보석 + 숫자)
    // toLocaleString()을 써서 1,000 단위 쉼표 추가
    const resourceHtml = `${gemIcon} ${myGems.toLocaleString()} <span style="opacity:0.3; margin:0 3px;">|</span> 🍞 ${lifeBreadCnt} <span style="opacity:0.3; margin:0 3px;">|</span> ❤️ ${maxPlayerHearts}`;

    // 5. [맵 화면] 헤더 업데이트 (ID로 안전하게 찾기)
    const mapRes = document.getElementById('header-resources');
    if (mapRes) mapRes.innerHTML = resourceHtml;
    
    // 6. [상점 화면] 내 보석 업데이트
    const shopRes = document.getElementById('shop-user-gems');
    if (shopRes) shopRes.innerHTML = `${gemIcon} ${myGems.toLocaleString()}`;

    // 7. [홈 화면] 성전 뷰도 같이 갱신 (켜져 있다면)
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen && homeScreen.classList.contains('active') && typeof updateCastleView === 'function') {
        updateCastleView(); 
    }
}

/* =========================================
   [시스템: 일반 훈련 모드 (6-Step System)]
   ========================================= */

let currentStep = 1; // 1~6단계
let trainingVerseData = null; // 현재 학습 중인 절 데이터
let stepSequence = []; // 이번에 진행할 단계 목록 (예: [1, 2] 또는 [2, 5])
let sequenceIndex = 0; // 목록 중 몇 번째인지 (0, 1, 2...)

// [유틸] 단어 비교용 정규화 (보이지 않는 공백/제로폭 제거)
function normalizeChunkText(text) {
    return String(text)
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ▼▼▼ [미사용] startLevel 함수 - 제거됨 (startTraining으로 완전 대체)
// 호출되지 않으므로 제거해도 무방

/* [수정] 훈련 시작 함수 (phase 시스템 제거) */
function startTraining(stageId, mode = 'normal') {
    const isForceFullNew = (mode === 'full-new');
    // 힌트 비용 스테이지별 리셋
    hintCost = 10;
    
    // ★ chNum을 여기서 미리 정의 (함수 전체에서 쓰임)
    const m = String(stageId).match(/^(\d+)(?:-(\d+|.+))?/);
    const chNum = m ? parseInt(m[1], 10) : 0;
    const verseNum = (m && m[2] && /^\d+$/.test(m[2])) ? parseInt(m[2], 10) : 1;

    // ============================================
    // [이미 클리어했는지 판단]
    // ============================================
    let stageData = null;
    if (stageMastery[stageId] && stageMastery[stageId] > 0) {
        // 이미 클리어했으면 그냥 진행 (게임은 할 수 있되, 보상은 제한될 수 있음)
    } else {
        const chData = gameData.find(c => c.id === chNum);
        if (chData) {
            stageData = chData.stages.find(s => s.id === stageId);
        }
    }
    
    // ============================================
    // [복습 모드 판단: Step 1~5 완료했나?]
    // ============================================
    const isFullStepsComplete = isStageFullyLearned(stageId, stageData);
    const isReplayEligible = isFullStepsComplete;
    window.isReplayMode = isReplayEligible && !isForceFullNew;

    // ============================================
    // [모드 결정: 복습 vs 전체 학습]
    // ============================================
    if (window.isReplayMode) {
        // 이미 Step 1~5를 다 완료한 상태
        const courses = {
            'quick': [2, 5],
            'full': [1, 2, 3, 4, 5],
            'normal': [1, 2, 3, 4, 5]
        };
        stepSequence = courses[mode] || courses['full'];
    } else {
        // 아직 Step 1~5를 완료하지 않은 상태: 항상 전체 학습
        mode = 'full-new';
        stepSequence = [1, 2, 3, 4, 5];
    }

    // ----------------------------------------------------
    // [공통] 게임 초기화 및 시작
    // ----------------------------------------------------
    window.currentStageId = stageId;
    window.trainingMode = mode;
    sequenceIndex = 0;
    currentStep = stepSequence[0];

    // [데이터 로드] - chNum, verseNum이 위에서 정의되어 있어 오류 해결됨
    if (bibleData[chNum] && bibleData[chNum][verseNum - 1]) {
        trainingVerseData = bibleData[chNum][verseNum - 1];
    } else {
        alert("데이터 로드 오류"); return;
    }

    // 화면 전환
    if (typeof closeStageSheet === 'function') closeStageSheet();
    document.getElementById('map-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    document.getElementById('game-screen').classList.add('mode-training');

    if(typeof recalculateMaxHearts === 'function') recalculateMaxHearts();
    playerHearts = maxPlayerHearts;
    updateBattleUI();

    stageStartTime = Date.now();
    wrongCount = 0;
    const totalStepEl = document.getElementById('total-step-num');
    if (totalStepEl) {
        // 전체 단계가 줄었으므로, 현재 시퀀스의 길이로 표시하는 것이 더 직관적일 수 있습니다.
        // 예: 빠른 복습이면 "Step 1/2", 전체 학습이면 "Step 1/5"
        totalStepEl.innerText = stepSequence.length; 
    }
    loadStep();
}

/* [정식 배포] 모바일 UI 최적화 함수 (디버그 기능 제거됨) */
function enableMobileCheat() {
    // 정식 배포 버전: 기능 비활성화
    // 추후 필요한 모바일 최적화 로직은 여기에 추가
}

// 2. 단계별 화면 로드
/* [수정된 단계별 로직 함수: 3단계 타워 적용] */
function loadStep() {
    const currentOrder = sequenceIndex + 1;
    const totalCount = stepSequence.length || 1; // 0으로 나누기 방지

    // 1. 텍스트 업데이트 (예: Step 1/2)
    const stepNumEl = document.getElementById('current-step-num');
    if (stepNumEl) stepNumEl.innerText = currentOrder;
    
    // 2. 진행바 게이지 계산 (전체 단계 수에 비례하여 꽉 차게)
    const percent = (currentOrder / totalCount) * 100;
    const barEl = document.getElementById('step-progress-fill');
    if (barEl) barEl.style.width = `${percent}%`;

    const field = document.querySelector('.battle-field');
    const control = document.querySelector('.battle-control');
    
    // 화면 초기화
    field.innerHTML = "";
    control.innerHTML = "";

    // game.js - loadStep 함수 내부

    // ----------------------------------------------------
    // [Step 1] 각인 모드 (속도 조절: 낭독 속도)
    // ----------------------------------------------------
    if (currentStep === 1) {
        field.innerHTML = `
            <div class="verse-indicator">Step 1. 화면을 꾹 눌러 말씀을 머리에 새기세요</div>
            
            <div style="position: relative; margin-bottom: 30px;">
                <div class="reading-card" id="tap-reading-card" 
                     style="cursor:pointer; min-height:150px; display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:8px; line-height: 1.8; user-select: none; position: relative; z-index: 2;">
                </div>
                <div id="pouring-light" style="position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: 40px; height: 0; background: linear-gradient(to bottom, #f1c40f 30%, rgba(255,255,255,0)); opacity: 0; transition: all 0.8s ease-in-out; z-index: 1;"></div>
            </div>

            <div style="text-align: center; margin-bottom: 20px;">
                <svg id="head-silhouette" viewBox="0 0 24 24" width="80" height="80" fill="#bdc3c7" style="transition: fill 1s ease, filter 1s ease;">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
            </div>
        `;
        
        const card = document.getElementById('tap-reading-card');
        window.chunksToReveal = trainingVerseData.chunks;
        window.revealIndex = 0;
        let autoFillInterval = null;

        // 미리보기 (흐린 글씨) 생성
        window.chunksToReveal.forEach((chunk, idx) => {
            const span = document.createElement('span');
            span.innerText = chunk;
            span.id = `chunk-${idx}`;
            span.style.color = "#bdc3c7"; 
            span.style.fontSize = "1.3rem";
            span.style.opacity = "0.4";
            // 애니메이션 속도를 조금 더 부드럽게 조정
            span.style.transition = "all 0.3s ease-out"; 
            card.appendChild(span);
        });

        control.innerHTML = `
            <button class="btn-attack" id="btn-step1-next" onclick="nextStep()" style="display:none; background-color:#2ecc71; margin-top:10px;">성령 충만! 다음 단계로 ▶</button>
            <div style="text-align:center; color:#7f8c8d; font-size:0.9rem; margin-top:5px;">
                <span style="background:#eee; padding:2px 8px; border-radius:10px;">TIP</span> 꾹 누르면 말씀이 흘러들어옵니다
            </div>
        `;
        
        const fillOneChunk = () => {
            if (window.revealIndex >= window.chunksToReveal.length) {
                stopAutoFill(); 
                return;
            }
            
            const span = document.getElementById(`chunk-${window.revealIndex}`);
            if (span) {
                span.style.color = "#2c3e50"; 
                span.style.fontWeight = "bold";
                span.style.opacity = "1";
                span.style.fontSize = "1.5rem"; 
                span.style.transform = "scale(1.1)";
                setTimeout(() => { 
                    span.style.transform = "scale(1)";
                    span.style.fontSize = "1.3rem"; // ★ 원래 크기로 복귀
                }, 200);
            }

            window.revealIndex++;

            if (window.revealIndex === window.chunksToReveal.length) {
                finishStep1Effect();
            }
        };

        // ▼ [수정됨] 자동 채우기 속도 조절 (낭독 속도)
        const startAutoFill = (e) => {
            if(e && e.preventDefault) e.preventDefault();
            fillOneChunk(); 
            autoFillInterval = setInterval(fillOneChunk, 350);
        };

        const stopAutoFill = (e) => {
            if(e && e.preventDefault) e.preventDefault();
            if (autoFillInterval) {
                clearInterval(autoFillInterval);
                autoFillInterval = null;
            }
        };

        // 카드 자체는 스크롤 전용으로 두고, 별도 버튼에서 각인(한 번/롱프레스)을 처리합니다.
        card.style.overflowY = 'auto';
        card.style.maxHeight = '50vh';
        card.style.cursor = 'auto';
        card.style.padding = '12px';

        // 리빌 버튼 생성: 짧게 누르면 한 덩어리, 길게 누르면 자동 재생
        const revealBtn = document.createElement('button');
        revealBtn.id = 'btn-reveal';
        revealBtn.className = 'btn-attack';
        revealBtn.style.marginRight = '8px';
        revealBtn.innerText = '읽기 ▶ (한 번/꾹 누름)';

        let longPressTimer = null;
        let longPressActive = false;

        // 포인터 캡처 및 이동 임계값 적용: 작은 손 떨림으로 자동 재생이 멈추지 않도록
        let startX = 0, startY = 0;
        const MOVE_THRESHOLD = 10; // px

        revealBtn.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            // 포인터 캡처로 다른 요소로 포인터가 넘어가지 않게 유지
            try { revealBtn.setPointerCapture && revealBtn.setPointerCapture(ev.pointerId); } catch (e) {}
            startX = ev.clientX; startY = ev.clientY;
            longPressActive = false;
            if (longPressTimer) clearTimeout(longPressTimer);
            longPressTimer = setTimeout(() => {
                longPressActive = true;
                revealBtn.classList.add('active');
                startAutoFill();
            }, 300); // 300ms 롱프레스
        }, {passive: false});

        revealBtn.addEventListener('pointermove', (ev) => {
            // 버튼 내부에서의 손/커서 이동은 허용합니다. 버튼 바깥으로 벗어났을 때만 취소합니다.
            const rect = revealBtn.getBoundingClientRect();
            const MARGIN = 10; // 버튼 바깥으로 살짝 나가면 취소
            const inside = (ev.clientX >= rect.left - MARGIN && ev.clientX <= rect.right + MARGIN &&
                            ev.clientY >= rect.top - MARGIN && ev.clientY <= rect.bottom + MARGIN);
            if (!inside) {
                if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
                if (longPressActive) {
                    stopAutoFill();
                    longPressActive = false;
                    revealBtn.classList.remove('active');
                }
            }
        }, {passive: true});

        revealBtn.addEventListener('pointerup', (ev) => {
            ev.preventDefault();
            try { revealBtn.releasePointerCapture && revealBtn.releasePointerCapture(ev.pointerId); } catch (e) {}
            if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
            if (longPressActive) {
                stopAutoFill();
                revealBtn.classList.remove('active');
                longPressActive = false;
            } else {
                // 짧게 누른 경우 한 덩어리만 채우기
                fillOneChunk();
            }
        });

        revealBtn.addEventListener('pointercancel', (ev) => {
            try { revealBtn.releasePointerCapture && revealBtn.releasePointerCapture(ev.pointerId); } catch (e) {}
            if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
            stopAutoFill();
            longPressActive = false;
            revealBtn.classList.remove('active');
        });

        // 컨트롤 영역에 리빌 버튼을 앞쪽에 삽입
        const nextBtn = document.getElementById('btn-step1-next');
        if (nextBtn) {
            control.insertBefore(revealBtn, nextBtn);
        } else {
            control.appendChild(revealBtn);
        }

        // 피니시 효과 (빛줄기 + 머리 채움)
        const finishStep1Effect = () => {
            stopAutoFill();
            
            card.style.transition = "box-shadow 0.5s, background 0.5s";
            card.style.boxShadow = "0 0 30px #f1c40f"; 
            card.style.backgroundColor = "#fff9c4";
            
            const spans = card.querySelectorAll('span');
            spans.forEach(s => {
                s.style.color = "#d35400";
                s.style.textShadow = "0 0 5px #f1c40f";
            });

            const pouringLight = document.getElementById('pouring-light');
            const headIcon = document.getElementById('head-silhouette');
            
            pouringLight.style.opacity = "1";
            pouringLight.style.height = "70px"; 

            setTimeout(() => {
                headIcon.style.fill = "#f1c40f"; 
                headIcon.style.filter = "drop-shadow(0 0 15px #f1c40f)"; 
            }, 600); 

            setTimeout(() => {
                document.getElementById('btn-step1-next').style.display = 'block';
                document.getElementById('btn-step1-next').classList.add('shake-effect');
                pouringLight.style.opacity = "0"; 
            }, 1500); 
        };
    }
    
    // ----------------------------------------------------
    // [Step 2] 초성 퀴즈 (기존 유지)
    // ----------------------------------------------------
    else if (currentStep === 2) {
        // (기존 코드와 동일)
        const chunkInitials = trainingVerseData.chunks.map(word => getChosung(word));
        
        field.innerHTML = `
            <div class="verse-indicator">Step 2. 초성에 맞는 단어를 누르세요! (틀리면 ❤️감소)</div>
            <div class="reading-card" id="initials-display" style="line-height:2.2; display:flex; flex-wrap:wrap; justify-content:center; gap:8px;">
                </div>
        `;

        const display = document.getElementById('initials-display');
        chunkInitials.forEach((initial, idx) => {
            const span = document.createElement('span');
            span.id = `slot-${idx}`; 
            span.className = 'initial-slot';
            span.innerText = initial;
            span.style.padding = "5px 10px";
            span.style.borderRadius = "10px";
            span.style.backgroundColor = "#eee";
            span.style.color = "#bdc3c7"; 
            span.style.transition = "all 0.3s";
            
            if (idx === 0) {
                span.style.border = "2px solid var(--primary-color)";
                span.style.color = "#2c3e50";
                span.style.fontWeight = "bold";
                span.style.backgroundColor = "white";
            }
            display.appendChild(span);
        });

        control.innerHTML = `<div class="block-pool" id="block-pool"></div>`;
        const pool = document.getElementById('block-pool');
        
        let shuffledList = [...trainingVerseData.chunks].sort(() => Math.random() - 0.5);
        window.currentSlotIndex = 0; 

        shuffledList.forEach(word => {
            const btn = document.createElement('div');
            btn.className = 'word-block';
            btn.innerText = word;
            
            // ★ 클릭 이벤트 핸들러 (수정됨)
            btn.onclick = function() {
                // 1. 현재 맞춰야 할 정답 단어 가져오기
                const correctWord = trainingVerseData.chunks[window.currentSlotIndex];

                // 2. 정답 판별
                if (word === correctWord) {
                    // 🔵 [성공] 정답일 때
                    SoundEffect.playCorrect();
                    
                    // 슬롯 채우기 (시각 효과)
                    const slot = document.getElementById(`slot-${window.currentSlotIndex}`);
                    if (slot) {
                        slot.innerText = correctWord;
                        slot.style.backgroundColor = "var(--primary-color)";
                        slot.style.color = "#2c3e50";
                        slot.style.border = "none";
                        slot.style.fontWeight = "bold";
                        
                        // 강조 애니메이션 (선택)
                        slot.animate([
                            { transform: 'scale(1)' },
                            { transform: 'scale(1.2)' },
                            { transform: 'scale(1)' }
                        ], 300);
                    }

                    // 버튼 숨기기 (중복 클릭 방지)
                    this.style.visibility = "hidden";
                    this.onclick = null; // 이벤트 제거

                    // 다음 단계로 인덱스 증가
                    window.currentSlotIndex++;

                    // 다음 슬롯이 남았는지 확인
                    if (window.currentSlotIndex < trainingVerseData.chunks.length) {
                        // 다음 슬롯 강조 표시
                        const nextSlot = document.getElementById(`slot-${window.currentSlotIndex}`);
                        if (nextSlot) {
                            nextSlot.style.border = "2px solid var(--primary-color)";
                            nextSlot.style.color = "#2c3e50";
                            nextSlot.style.fontWeight = "bold";
                            nextSlot.style.backgroundColor = "white";
                        }
                    } else {
                        // 모든 슬롯 완성! (0.3초 뒤 성공 처리)
                        setTimeout(() => {
                            nextStep();
                        }, 300);
                    }

                } else {
                    // 🔴 [실패] 오답일 때 (else 문으로 확실히 분리!)
                    SoundEffect.playWrong();
                    playerHearts--;
                    wrongCount++;
                    updateBattleUI(); // 하트 UI 갱신
                    
                    // 버튼 흔들기 효과
                    this.style.backgroundColor = "#e74c3c"; 
                    this.classList.add('shake-effect');
                    
                    const self = this; // setTimeout 안에서 this 쓰기 위해 저장
                    setTimeout(() => {
                        self.style.backgroundColor = "#ecf0f1"; 
                        self.classList.remove('shake-effect');
                    }, 500);

                    // 게임 오버 체크
                    if (playerHearts <= 0) {
                        setTimeout(() => {
                            // 즉시 부활 모달 띄우기
                            showReviveModal(); 
                        }, 100);
                    }
                }
            };
            
            pool.appendChild(btn);
        });
    }

    // ----------------------------------------------------
    // [Step 3] 바이블 타워 (기록판 추가)
    // ----------------------------------------------------
    else if (currentStep === 3) {
        // 게임 영역 생성 (HTML 구조 변경: #tower-text-display 추가)
        field.innerHTML = `
            <div class="verse-indicator">Step 3. 타이밍을 맞춰 단어를 쌓으세요!</div>
            <div id="tower-game-container" onclick="dropTowerBlock()">
                <div id="tower-text-display"></div>
                
                <div id="tower-msg">화면을 터치하여 블록을 떨어뜨리세요</div>
                <div id="moving-block">READY</div>
                <div id="tower-stack-area"></div>
                <div id="tower-base"></div>
            </div>
        `;
        
        control.innerHTML = "";

        // 게임 시작 (약간의 딜레이 후)
        setTimeout(() => {
            initTowerGame();
        }, 500);
    }

    // ----------------------------------------------------
    // [Step 4] 예언의 두루마리 (어르신 모드 추가)
    // ----------------------------------------------------
    else if (currentStep === 4) {
        // 안전장치: Step 3에서 넘어왔을 때 타워 게임 멈추기
        if(typeof towerGame !== 'undefined' && towerGame.interval) {
            clearInterval(towerGame.interval);
            towerGame.interval = null;
        }

        // 1. 화면 구성 (두루마리 틀 만들기 + 천천히 버튼 추가)
        field.innerHTML = `
            <div class="verse-indicator">Step 4. 🔥불타기 전에 빈칸을 채우세요!</div>
            
            <button id="btn-scroll-fast" onclick="toggleScrollFastMode(this)" 
                style="margin-bottom:10px; background:rgba(255,255,255,0.9); border:2px solid #e67e22; color:#e67e22;
                       padding:8px 15px; border-radius:20px; font-weight:bold; font-size:0.9rem; 
                       box-shadow:0 2px 5px rgba(0,0,0,0.1); cursor:pointer; display:inline-flex; align-items:center; gap:5px;">
                🐇 빨리 감기
            </button>

            <div id="scroll-game-container">
                <div id="deadline-line"></div>
                <div id="scroll-track">
                    </div>
            </div>
        `;
        
        control.innerHTML = `
            <div style="text-align:center; margin-bottom:10px; color:#bdc3c7;">아래 카드를 눌러 빈칸을 채우세요</div>
            <div class="block-pool" id="scroll-deck"></div>
        `;

        // 두루마리 게임 설정 초기화
        if (typeof scrollGame === 'undefined') scrollGame = {};
        scrollGame.isSlowMode = true; // 느린 모드가 기본값

        // 2. 게임 시작 (화면 로딩 안정성을 위해 0.1초 뒤 실행)
        setTimeout(startScrollStep, 100);
    }

    // [수정된 Step 5: 오류 수정 & 기능 강화]
    else if (currentStep === 5) {
        // 1. 화면 구성 (field.innerHTML 사용 - modeTitle 오류 해결!)
        field.innerHTML = `
            <div class="verse-indicator">Step 5. 단어를 터치하여 문장을 완성하세요</div>
            
            <div class="answer-zone" id="answer-zone" style="min-height: 120px; align-content: flex-start;">
                <span class="placeholder-text" id="placeholder-text">단어를 터치하여 문장을 만드세요</span>
            </div>
            
            <div style="margin-top: 10px; font-size: 0.85rem; color: #576574; text-align: center; background-color: rgba(255,255,255,0.8); padding: 8px 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                💡 <b>팁:</b> 정답칸의 단어를 <b>누르면</b> 다시 빠집니다.
            </div>
        `;
        
        control.innerHTML = `<div class="block-pool" id="block-pool"></div>`;
        const pool = document.getElementById('block-pool');
        const zone = document.getElementById('answer-zone');
        const correctChunks = trainingVerseData.chunks;

        // 2. 단어 섞기
        let list = [...trainingVerseData.chunks].sort(() => Math.random() - 0.5);
        let selectedBlock = null;

        // 선택 해제 함수
        function deselect() {
            if (selectedBlock) {
                selectedBlock.classList.remove('selected-block');
                selectedBlock = null;
            }
        }

        // 3. 단어 블록 생성
        list.forEach(word => {
            const btn = document.createElement('div');
            btn.className = 'word-block';
            btn.innerText = word;
            // 클릭 이벤트 (배치 로직)
            btn.onclick = () => {
                if (btn.style.visibility === 'hidden') return;
                const placeholder = document.getElementById('placeholder-text');
                if (placeholder) placeholder.remove();
                // (1) 복제 블록 생성 (정답칸에 들어갈 녀석)
                const answerBlock = document.createElement('div');
                answerBlock.className = 'word-block';
                answerBlock.innerText = word;
                answerBlock.dataset.original = word;
                // 스타일 (노란색 강조)
                answerBlock.style.backgroundColor = "#f1c40f";
                answerBlock.style.color = "#000";
                answerBlock.style.margin = "5px";
                // (2) 복제 블록 클릭 시 (취소/회수)
                answerBlock.onclick = () => {
                    answerBlock.remove();
                    btn.style.visibility = 'visible';
                    SoundEffect.playClick();
                    if (zone.children.length === 0) {
                        zone.innerHTML = '<span class="placeholder-text" id="placeholder-text">단어를 터치하여 문장을 만드세요</span>';
                    }
                    // block-pool이 비었는지 체크해서 레이아웃 조정
                    setTimeout(() => {
                        if ([...pool.children].every(b => b.style.visibility === 'hidden')) {
                            pool.style.height = '0px';
                            pool.style.margin = '0';
                            zone.style.minHeight = '180px';
                            zone.style.paddingBottom = '40px';
                        } else {
                            pool.style.height = '';
                            pool.style.margin = '';
                            zone.style.minHeight = '120px';
                            zone.style.paddingBottom = '';
                        }
                    }, 10);
                };
                // (3) 화면 추가 및 원본 숨기기
                if (selectedBlock && selectedBlock.parentElement === zone) {
                    zone.insertBefore(answerBlock, selectedBlock);
                    deselect();
                } else {
                    zone.appendChild(answerBlock);
                }
                btn.style.visibility = 'hidden';
                SoundEffect.playClick();
                // block-pool이 비었는지 체크해서 레이아웃 조정
                setTimeout(() => {
                    if ([...pool.children].every(b => b.style.visibility === 'hidden')) {
                        pool.style.height = '0px';
                        pool.style.margin = '0';
                        zone.style.minHeight = '180px';
                        zone.style.paddingBottom = '40px';
                    } else {
                        pool.style.height = '';
                        pool.style.margin = '';
                        zone.style.minHeight = '120px';
                        zone.style.paddingBottom = '';
                    }
                }, 10);
            };
            pool.appendChild(btn);
        });
        // 최초 진입 시에도 block-pool이 비어있으면 레이아웃 조정
        setTimeout(() => {
            if ([...pool.children].every(b => b.style.visibility === 'hidden')) {
                pool.style.height = '0px';
                pool.style.margin = '0';
                zone.style.minHeight = '180px';
                zone.style.paddingBottom = '40px';
            } else {
                pool.style.height = '';
                pool.style.margin = '';
                zone.style.minHeight = '120px';
                zone.style.paddingBottom = '';
            }
        }, 10);

        // 4. 빈 곳 클릭 시 선택 해제
        zone.onclick = (e) => { 
            if (e.target === zone) deselect(); 
        };

        // 5. [정답 확인] 버튼 생성
        // 컨트롤 버튼 래퍼 생성 (정답 확인 + 다시하기)
        const btnWrapper = document.createElement('div');
        btnWrapper.style.display = 'flex';
        btnWrapper.style.width = '100%';
        btnWrapper.style.gap = '2%';

        // 정답 확인 버튼 (왼쪽 3/4)
        const checkBtn = document.createElement('button');
        checkBtn.className = 'btn-attack';
        checkBtn.innerText = "정답 확인";
        checkBtn.style.flex = '3 1 0';
        checkBtn.onclick = () => {
            const currentBlocks = Array.from(zone.querySelectorAll('.word-block'));
            if (currentBlocks.length !== correctChunks.length) {
                alert("블록을 모두 채워주세요.");
                return;
            }
            let errorCount = 0;
            currentBlocks.forEach((btn, index) => {
                const expected = normalizeChunkText(correctChunks[index]);
                const actual = normalizeChunkText(btn.dataset.original);
                if (actual === expected) {
                    btn.classList.add('correct-block');
                    btn.classList.remove('error-block');
                } else {
                    btn.classList.add('error-block');
                    btn.classList.remove('correct-block');
                    errorCount++;
                }
            });
            if (errorCount === 0) {
                nextStep();
            } else {
                SoundEffect.playWrong();
                playerHearts--;
                updateBattleUI();
                wrongCount++;
                alert(`${errorCount}군데가 틀렸습니다.`);
                if (playerHearts <= 0) {
                    setTimeout(showReviveModal, 100);
                }
            }
        };

        // 다시하기 버튼 (오른쪽 1/4)
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-reset-step5';
        resetBtn.innerText = '다시하기';
        resetBtn.style.flex = '1 1 0';
        resetBtn.onclick = () => {
            // 정답칸 비우기
            Array.from(zone.querySelectorAll('.word-block')).forEach(block => block.remove());
            // 안내문구 복구
            if (!zone.querySelector('#placeholder-text')) {
                zone.innerHTML = '<span class="placeholder-text" id="placeholder-text">단어를 터치하여 문장을 만드세요</span>';
            }
            // 모든 블록 다시 보이게
            Array.from(pool.children).forEach(btn => {
                btn.style.visibility = 'visible';
            });
            deselect();
            SoundEffect.playClick();
        };

        btnWrapper.appendChild(checkBtn);
        btnWrapper.appendChild(resetBtn);
        control.appendChild(btnWrapper);
    }

// ▼▼▼ [수정된 Step 6 코드] ▼▼▼

} // loadStep 끝

// [2. nextStep 함수 교체] (노선도 방식)
function nextStep() {
    // 다음 순번으로 이동 (0 -> 1 -> 2...)
    sequenceIndex++;

    // 더 이상 갈 곳이 없으면 종료
    if (sequenceIndex >= stepSequence.length) {
        finishTraining();
    } else {
        // 목록(stepSequence)에 적힌 다음 숫자를 currentStep에 넣음
        currentStep = stepSequence[sequenceIndex];
        
        // ★ 중요: 건너뛴 단계에 따라 UI나 변수 초기화가 필요할 수 있음
        // (예: 타워 게임 잔상 제거 등은 loadStep에서 처리하므로 OK)
        
        loadStep();
    }
}

// 4. 정답 체크 (훈련용)
function checkTrainingAnswer() {
    // 사용자가 맞춘 답
    if (selectedBlocks.join(" ") === trainingVerseData.chunks.join(" ")) {
        alert("정답입니다! 다음 단계로 넘어갑니다.");
        nextStep();
    } else {
        alert("틀렸습니다. 다시 해보세요!");
        wrongCount++;
        // 블록 리셋 로직 (간단히 Step 2 다시 로드)
        selectedBlocks = [];
        loadStep();
    }
}

/* [수정] 훈련 중간 종료 처리 (phase 시스템 제거) */
function finishTraining() {
    // Phase 시스템이 제거되었으므로
    // 모든 모드는 동일하게 처리: 결과 화면으로 이동
    showClearScreen(); 
}

// ▼▼▼ [수정된 addGems] UI 갱신 기능 연결 ▼▼▼
function addGems(amount) {
    // 1. 전역 변수 초기화 안전장치
    if (typeof myGems === 'undefined') myGems = 0;
    
    // 2. 보석 추가
    myGems += amount;
    
    // 3. ★ 핵심 수정: 게임 내 통합 UI 갱신 함수 호출
    // (이게 있어야 상단 보석 숫자가 바로 바뀝니다!)
    if (typeof updateGemDisplay === 'function') {
        updateGemDisplay();
    }
    
    // 4. 데이터 저장
    if (typeof saveGameData === 'function') {
        saveGameData();
    }
}
// ▲▲▲ [여기까지] ▲▲▲

/* [유틸: 한글 초성 추출기] */
function getChosung(str) {
    const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    let result = "";
    for(let i=0; i<str.length; i++) {
        const code = str.charCodeAt(i) - 44032;
        if(code > -1 && code < 11172) result += cho[Math.floor(code/588)];
        else result += str.charAt(i); // 한글 아니면 그냥 반환
    }
    return result;
}

/* [수정] 결과 화면 표시 (표시 오류 해결판) */
function showClearScreen() {
    triggerConfetti();
    SoundEffect.playClear(); 

    // 1. 시간 계산
    const endTime = Date.now();
    const duration = Math.floor((stageStartTime ? (endTime - stageStartTime) : 0) / 1000);
    const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
    const seconds = (duration % 60).toString().padStart(2, '0');
    
    // 2. 정확도 계산
    let accuracy = Math.max(0, 100 - (wrongCount * 10));

    // ============================================================
    // ▼ [때를 따른 양식 보너스] 망각 주기 기반
    // ============================================================
    let baseGem = 10; // 기본 보상
    let msg = "📖 [훈련] 완료!";

    // 현재 스테이지 ID
    const sId = window.currentStageId;

    // ★ 보너스 확인 (망각 주기 도래 시 자동 복구)
    const timedBonus = getTimedBonus(sId);
    const bonusCount = timedBonus.remaining;

    if (bonusCount === 3) {
        baseGem *= 5;
        msg += " 🎁 (때를 따른 양식 × 5배)";
    } else if (bonusCount === 2) {
        baseGem *= 2;
        msg += " 🔱 (때를 따른 양식 × 2배)";
    } else if (bonusCount === 1) {
        baseGem *= 1.5;
        msg += " ⚔️ (때를 따른 양식 × 1.5배)";
    } else {
        msg += " ⏳ (보너스 쿨타임)";
    }

    // 정확도 반영
    let displayGem = Math.floor(baseGem * (accuracy / 100));
    // ============================================================

    // 3. 스트릭 업데이트
    const streakInfo = updateStreak();

    // 4. UI 업데이트
    document.getElementById('result-time').innerText = `${minutes}:${seconds}`;
    document.getElementById('result-accuracy').innerText = `${accuracy}%`;
    document.getElementById('result-exp').innerText = `+${displayGem}`;
    document.getElementById('streak-days').innerText = streakInfo.days;
    
    document.getElementById('result-modal').classList.add('active');
}

//[수정된 중간 결과창: 보상 안내 추가]
function showPhaseClearScreen(rewardAmount) {
    triggerConfetti();
    SoundEffect.playClear();
    
    // 메시지 구성
    let msg = "";
    let nextTime = "";
    
    if (window.trainingMode === 'phase1') {
        msg = `🌱 1단계 완료! 보석 +${rewardAmount}개 획득!`;
        nextTime = "10분 뒤에 [물주기]가 가능합니다.";
    } else {
        msg = `🌿 2단계 완료! 보석 +${rewardAmount}개 획득!`;
        nextTime = "10분 뒤에 [열매맺기]가 가능합니다.";
    }

    // 알림창
    alert(`${msg}\n\n⏳ ${nextTime}\n(뇌가 말씀을 저장할 시간을 주세요)`);
    
    // 화면 전환
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('map-screen').classList.add('active');
    
    if (typeof updateMapUI === 'function') updateMapUI();
    reloadCurrentChapterUI();
}

// 스트릭 계산 로직
function updateStreak() {
    const today = new Date().toDateString(); // "Wed Jan 08 2026" 형식
    let lastPlayed = localStorage.getItem('lastPlayedDate');
    let streak = parseInt(localStorage.getItem('streakDays') || 0);

    if (lastPlayed !== today) {
        // 오늘 처음 깸
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPlayed === yesterday.toDateString()) {
            // 어제 하고 오늘 또 함 -> 스트릭 증가!
            streak++;
        } else {
            // 하루 빼먹음 or 처음 -> 1일부터 시작
            streak = 1;
        }
        
        // 저장
        localStorage.setItem('lastPlayedDate', today);
        localStorage.setItem('streakDays', streak);
    }
    
    return { days: streak };
}

// 모달 닫고 나가기
function closeResultModal() {
    document.getElementById('result-modal').classList.remove('active');
    
    // 여기서 진짜 종료 처리
    const clearedStageId = window.currentStageId;
    stageClear('normal'); 
    quitGame();
    openStageSheetForStageId(clearedStageId);
    setTimeout(tryShowMilestone, 500);
}

// 소리 토글 함수 (기존 코드)
function toggleSound(btn) {
    const isMuted = SoundEffect.toggleMute();
    btn.innerText = isMuted ? "🔇" : "🔊";
}

// ▼▼▼ [수정] 배경음악 토글 함수 (설정 저장 기능 추가) ▼▼▼
function toggleBGM(btn) {
    const isPlaying = BackgroundMusic.toggle();
    
    // ★ [추가] 켜졌으면 'true', 꺼졌으면 'false'로 저장
    localStorage.setItem('setting_bgm_on', isPlaying);

    if (isPlaying) {
        btn.style.opacity = "1"; 
        btn.innerText = "🎵";
    } else {
        btn.style.opacity = "0.5"; 
        btn.innerText = "🔇"; 
    }
}

/* [시스템: 성전 보급소 로직] */
function openShop() {
    // 화면 전환
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('shop-screen').classList.add('active');
    
    updateShopUI();
    ensureBackButton(document.getElementById('shop-screen'));
    // 백버튼 가시성 갱신 (상점에서는 보여야 함)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
}

/* [시스템: 아이템 사용 로직] */

// 화면에 아이템 개수 갱신하기 (훈련/보스전 모두)
function updateItemButtons() {
    // 보스전 버튼
    const pBtn = document.getElementById('btn-potion-cnt');
    if(pBtn) pBtn.innerText = inventory.lifeBread;

    // 훈련 모드 버튼
    const pBtnT = document.getElementById('btn-potion-cnt-t');
    if(pBtnT) pBtnT.innerText = inventory.lifeBread;
}

// 1. 생명의 떡 사용하기 (누르면 바로 회복)
function useLifeBread() {
    if (inventory.lifeBread <= 0) { 
        alert("🥖 생명의 떡이 없습니다.\n상점에서 구매하세요!"); 
        return; 
    }
    if (playerHearts >= maxPlayerHearts) { 
        alert("체력이 이미 가득 찼습니다."); 
        return; 
    }
    
    // 사용 처리
    inventory.lifeBread--;
    playerHearts = Math.min(playerHearts + 3, maxPlayerHearts); // 3칸 회복
    
    SoundEffect.playCorrect(); // 띠링! 소리
    alert(`체력이 회복되었습니다. (현재: ${playerHearts})`);
    
    updateBattleUI();   // 하트 UI 갱신
    updateItemButtons(); // 생명의 떡 개수 UI 갱신
    saveGameData();     // 저장
}

// 2. 힌트 사용하기 (만능 도우미, 개선)
let isHintModalOpen = false;
let hintCost = 10;
function useHint() {
    if (isHintModalOpen) return;
    if (typeof hintCost !== 'number' || hintCost < 10) hintCost = 10;
    if (myGems < hintCost) {
        alert(`💎 보석이 부족합니다! (필요: ${hintCost})`);
        return;
    }
    const screen = document.getElementById('game-screen');
    const isTraining = screen.classList.contains('mode-training');
    if (isTraining && currentStep === 1) {
        alert("이 단계에서는 큰 소리로 읽는 것이 정답입니다! 📣");
        return;
    }
    // 안내 문구
    if (!confirm(`💎 보석 ${hintCost}개를 소모하여 힌트를 보시겠습니까?`)) {
        return;
    }
    // 보석 차감 및 입력 비활성화
    myGems -= hintCost;
    updateGemDisplay();
    saveGameData();
    SoundEffect.playClick();
    disableGameInputs(true);
    isHintModalOpen = true;
    hintCost += 5;
    // 힌트 모달 생성 및 표시
    showHintModal({
        cost: hintCost - 5,
        onClose: () => {
            isHintModalOpen = false;
            disableGameInputs(false);
        }
    });
}

function showHintModal({ cost, onClose }) {
    if (document.getElementById('hint-modal')) return;
    let hintText = '';
    const screen = document.getElementById('game-screen');
    const isTraining = screen.classList.contains('mode-training');
    let verse = '';
    let highlightHtml = '';
    if (isTraining) {
        // step5 힌트 undefined 방지
        if (!trainingVerseData || !trainingVerseData.text) {
            alert("이 구절의 힌트 데이터를 불러올 수 없습니다.");
            if (typeof onClose === 'function') onClose();
            return;
        }
        if (typeof trainingVerseData === 'object' && trainingVerseData.text) {
            verse = trainingVerseData.text;
        }
        if (currentStep === 2 && typeof trainingVerseData.chunks === 'object') {
            const idx = window.currentSlotIndex;
            highlightHtml = trainingVerseData.chunks.map((w,i)=>
                i===idx ? `<span style='background:#ffe066; border-radius:5px;'>${w}</span>` : w
            ).join(' ');
            hintText = `<div style='margin-top:10px;'>현재 단어: ${highlightHtml}</div>`;
        } else if (currentStep === 3 && typeof trainingVerseData.text === 'string') {
            const targetSlot = document.querySelector('.blank-slot');
            if (targetSlot) {
                const answer = targetSlot.dataset.answer;
                highlightHtml = trainingVerseData.text.replace(answer, `<span style='background:#ffe066; border-radius:5px;'>${answer}</span>`);
                hintText = `<div style='margin-bottom:8px;'>현재 구절</div><div style='font-size:1.1rem; color:#2c3e50;'>${highlightHtml}</div>`;
            } else {
                hintText = `<div style='font-size:1.1rem; color:#2c3e50;'>${trainingVerseData.text}</div>`;
            }
        } else if (currentStep === 4) {
            hintText = `<div style='font-size:1.1rem; color:#2c3e50;'>${trainingVerseData.text}</div><div style='margin-top:10px; color:#e74c3c;'>가짜 단어를 찾아 빨갛게 표시합니다.</div>`;
        } else if (currentStep === 5) {
            hintText = `<div style='font-size:1.1rem; color:#2c3e50;'>${trainingVerseData.text}</div>`;
        } else {
            hintText = `<div style='font-size:1.1rem; color:#2c3e50;'>${trainingVerseData.text}</div>`;
        }
    } else {
        if (typeof currentVerseData === 'object' && currentVerseData.verse) {
            verse = currentVerseData.verse;
        }
        if (typeof currentVerseData.chunks === 'object') {
            const zone = document.getElementById('answer-zone');
            const currentBlocks = zone.querySelectorAll('.word-block');
            const idx = currentBlocks.length;
            highlightHtml = currentVerseData.chunks.map((w,i)=>
                i===idx ? `<span style='background:#ffe066; border-radius:5px;'>${w}</span>` : w
            ).join(' ');
            hintText = `<div style='margin-bottom:8px;'>현재 구절</div><div style='font-size:1.1rem; color:#2c3e50;'>${verse}</div><div style='margin-top:10px;'>현재 부분: ${highlightHtml}</div>`;
        } else {
            hintText = `<div style='font-size:1.1rem; color:#2c3e50;'>${verse}</div>`;
        }
    }
    const modal = document.createElement('div');
    modal.id = 'hint-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = 9999;
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="result-card" style="max-width:400px; text-align:center;">
            <div style="text-align:right;">
                <button id="hint-modal-close" style="background:none; border:none; font-size:1.5rem; color:#95a5a6; cursor:pointer;">✕</button>
            </div>
            <div style="margin-bottom:10px; font-size:1.1rem; color:#2c3e50;">💡 힌트 사용 (💎${cost})</div>
            <div style="margin-bottom:20px; color:#34495e;">${hintText}</div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('hint-modal-close').onclick = function() {
        document.body.removeChild(modal);
        if (typeof onClose === 'function') onClose();
    };
}

// 게임 입력/버튼 비활성화 (힌트 모달용)
function disableGameInputs(disable) {
    // 주요 버튼/입력 모두 비활성화
    const btns = document.querySelectorAll('button, input, .word-block');
    btns.forEach(btn => {
        if (disable) {
            btn.setAttribute('disabled', 'disabled');
            btn.style.pointerEvents = 'none';
        } else {
            btn.removeAttribute('disabled');
            btn.style.pointerEvents = '';
        }
    });
    // 단, 힌트 모달 내 버튼은 예외로 복구
    if (!disable) {
        const modalBtns = document.querySelectorAll('#hint-modal button');
        modalBtns.forEach(btn => {
            btn.removeAttribute('disabled');
            btn.style.pointerEvents = '';
        });
    }
}

// [수정] 힌트 로직: 오답이 있으면 오답부터 지적, 없으면 다음 길 안내
function highlightNextBlock(correctChunks) {
    const zone = document.getElementById('answer-zone');
    const currentBlocks = zone.querySelectorAll('.word-block');
    
    let errorIndex = -1;

    // 1. [오답 체크] 앞에서부터 검사해서 틀린 곳 찾기
    for(let i=0; i<currentBlocks.length; i++) {
        if (currentBlocks[i].id === 'placeholder-text') continue;
        
        // ★ [핵심 수정] 블록의 텍스트가 초성인지 전체 단어인지 확인하여 비교
        const blockText = currentBlocks[i].innerText;
        
        // 정답 데이터 (상황에 따라 초성으로 변환해서 비교)
        let targetText = correctChunks[i];
        
        // 만약 현재 블록이 '초성(1~2글자)'라면 정답도 초성으로 변환해서 비교
        // (단, '이와' 같이 원래 짧은 단어와 구분을 위해 한글 여부 등 체크하면 좋지만, 
        //  게임 문맥상 길이가 같고 텍스트가 다르면 다른 글자로 봄)
        if (blockText.length !== targetText.length || blockText !== targetText) {
             // 텍스트가 다를 경우, 혹시 초성 게임 중인가? 확인
             if (getChosung(targetText) === blockText) {
                 // 초성으로 변환했더니 같다면 -> 정답으로 인정! (Pass)
                 continue; 
             }
             
             // 진짜 틀림
             errorIndex = i;
             break; 
        }
    }

    // 2. [상황 A: 오답이 발견됨] -> 빨갛게 알려줌 (빼라고)
    if (errorIndex !== -1) {
        const wrongBlock = currentBlocks[errorIndex];
        
        // 효과 적용
        wrongBlock.classList.add('hint-error');
        
        // 안내 메시지
        alert(`❌ 틀린 부분이 있습니다!\n빨갛게 깜빡이는 '${wrongBlock.innerText}' 블록을 눌러서 빼세요.`);
        
        // 3초 뒤 효과 끄기
        setTimeout(() => wrongBlock.classList.remove('hint-error'), 3000);
        return; // 여기서 종료 (다음 블록 안 알려줌)
    }

    // 3. [상황 B: 오답 없음 (깨끗함)] -> 다음 블록 노랗게 알려줌 (넣으라고)
    
    // 현재 놓인 개수가 곧 다음 정답의 인덱스
    const nextIndex = currentBlocks.length;

    // 이미 다 채웠는데 힌트 누른 경우
    if (nextIndex >= correctChunks.length) {
        alert("모든 블록이 올바르게 배치되었습니다! 공격 버튼을 누르세요.");
        return;
    }

    const targetWord = correctChunks[nextIndex];

    // 대기실(Pool)에서 그 단어 찾기
    const poolBlocks = Array.from(document.querySelectorAll('#block-pool .word-block'));
    const targetBlock = poolBlocks.find(b => {
        const text = b.dataset.original || b.innerText;
        return text === targetWord && b.style.visibility !== 'hidden';
    });

    if (targetBlock) {
        // 노란색 효과
        targetBlock.classList.add('hint-highlight');
        
        // 안내 메시지 (선택사항 - 너무 자주 뜨면 귀찮을 수 있음)
        // alert(`다음 단어는 '${targetWord}' 입니다.`); 
        
        setTimeout(() => targetBlock.classList.remove('hint-highlight'), 3000);
        
        // 클릭하면 즉시 효과 해제
        targetBlock.addEventListener('click', function remover() {
            targetBlock.classList.remove('hint-highlight');
            targetBlock.removeEventListener('click', remover);
        });
    } else {
        // 희귀 케이스: 대기실에 없는데 정답칸에도 없다? (로직상 발생 희박)
        alert(`다음 단어 '${targetWord}'를 찾을 수 없습니다.`);
    }
}

/* [시스템: 미션 UI & 탭 로직] */
let currentMissionTab = 'daily'; // 현재 보고 있는 탭

/* [시스템: 미션 탭 전환 기능] */
function switchMissionTab(tabName) {
    currentMissionTab = tabName; // 현재 탭 기억

    // 1. 탭 버튼 스타일 업데이트
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        // 버튼의 onclick 속성을 확인해서 현재 탭과 일치하면 활성화
        if (btn.getAttribute('onclick').includes(tabName)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. 목록 다시 그리기
    renderMissionList(tabName);
}

/* [수정] 미션 목록 렌더링 (초기화 안내 문구 추가) */
function renderMissionList(tabName) {
    const listArea = document.getElementById('mission-list-area');
    if (!listArea) return;
    
    listArea.innerHTML = ""; // 기존 목록 초기화

    // 1. [추가됨] 초기화 안내 문구 삽입
    let resetInfoText = "";
    if (tabName === 'daily') {
        resetInfoText = "🕒 매일 자정에 초기화됩니다";
    } else {
        resetInfoText = "🕒 매주 월요일 자정에 초기화됩니다";
    }

    const infoDiv = document.createElement('div');
    infoDiv.style.textAlign = "center";
    infoDiv.style.fontSize = "0.85rem";
    infoDiv.style.color = "#7f8c8d"; // 은은한 회색
    infoDiv.style.marginBottom = "15px"; // 목록과의 간격
    infoDiv.style.padding = "5px";
    infoDiv.style.backgroundColor = "rgba(0,0,0,0.1)"; // 살짝 어두운 배경
    infoDiv.style.borderRadius = "10px";
    infoDiv.style.display = "inline-block"; // 글자 크기만큼만 배경 차지
    
    // 가운데 정렬을 위한 래퍼(Wrapper) 생성
    const wrapperDiv = document.createElement('div');
    wrapperDiv.style.textAlign = "center";
    wrapperDiv.style.width = "100%";
    
    infoDiv.innerText = resetInfoText;
    wrapperDiv.appendChild(infoDiv);
    listArea.appendChild(wrapperDiv);


    // 2. 미션 내용 정의
    let missions = [];

    if (tabName === 'daily') {
        // 모든 도감이 열렸는지 체크
        let allOpened = true;
        for (let ch = 1; ch <= 22; ch++) {
            if (bibleData[ch]) {
                for (let idx = 0; idx < bibleData[ch].length; idx++) {
                    const sId = `${ch}-${idx + 1}`;
                    if (!(stageMastery[sId] && stageMastery[sId] >= 1)) {
                        allOpened = false;
                        break;
                    }
                }
                if (!allOpened) break;
            }
        }
        missions = [
            allOpened ?
            {
                id: 0,
                title: "어떤 스테이지든 1회 학습",
                desc: "아무 스테이지나 1회 학습하세요.",
                target: 1,
                current: missionData.daily.newClear, // 기존 카운트 활용
                reward: "💎 보석 100개",
                rewardType: 'gem', val1: 100, val2: 0,
                claimed: missionData.daily.claimed[0]
            }
            :
            {
                id: 0,
                title: "새로운 훈련 1회 완료",
                desc: "새로운 말씀을 1회 학습하세요.",
                target: 1,
                current: missionData.daily.newClear,
                reward: "💎 보석 100개",
                rewardType: 'gem', val1: 100, val2: 0,
                claimed: missionData.daily.claimed[0]
            },
            {
                id: 1,
                title: "서로 다른 스테이지 3회 완료",
                desc: "다른 스테이지를 골고루 학습하세요.",
                target: 3,
                current: missionData.daily.differentStages,
                reward: "💎 보석 300개",
                rewardType: 'gem', val1: 300, val2: 0,
                claimed: missionData.daily.claimed[1]
            },
            {
                id: 2,
                title: "중보/보스 처치 1회",
                desc: "중간 점검 또는 보스를 완료하세요.",
                target: 1,
                current: missionData.daily.checkpointBoss,
                reward: "💎 보석 500개",
                rewardType: 'gem', val1: 500, val2: 0,
                claimed: missionData.daily.claimed[2]
            }
        ];
    } else {
        // 주간 미션 정의
        missions = [
            {
                id: 0,
                title: "주 5일 출석하기",
                desc: "꾸준함이 실력입니다.",
                target: 5,
                current: missionData.weekly.attendance,
                reward: "💎 보석 1,000",
                rewardType: 'gem', val1: 1000,
                claimed: missionData.weekly.claimed[0]
            },
            {
                id: 1,
                title: "용 사냥",
                desc: "중간 점검 또는 보스 완료.",
                target: 5,
                current: missionData.weekly.dragonKill,
                reward: "💎 보석 3,000",
                rewardType: 'gem', val1: 3000,
                claimed: missionData.weekly.claimed[1]
            },
            {
                id: 2,
                title: "스테이지 15회 완료",
                desc: "(주간)누적 15회 완료.",
                target: 15,
                current: missionData.weekly.stageClear,
                reward: "💎 보석 2,000",
                rewardType: 'gem', val1: 2000,
                claimed: missionData.weekly.claimed[2]
            }
        ];
    }

    missions.forEach(m => {
        // 진행도 계산 (100% 넘지 않게)
        const percent = Math.min(100, Math.floor((m.current / m.target) * 100));
        const isComplete = m.current >= m.target;
        
        // 카드 요소 생성
        const div = document.createElement('div');
        div.className = 'mission-item'; 
        
        // 버튼 상태 결정
        let btnHtml = "";
        if (m.claimed) {
            btnHtml = `<button class="btn-claim done">완료</button>`;
        } else if (isComplete) {
            // 보상 받기 버튼
            btnHtml = `<button class="btn-claim ready" onclick="claimReward('${tabName}', ${m.id}, '${m.rewardType}', ${m.val1 || 0}, ${m.val2 || 0})">보상 받기</button>`;
        } else {
            btnHtml = `<button class="btn-claim" disabled>${m.current}/${m.target}</button>`;
        }

        div.innerHTML = `
            <div class="mission-info">
                <div class="mission-title">${m.title} <span style="font-size:0.8rem; color:#e67e22; font-weight:normal;">(${m.reward})</span></div>
                <div class="mission-desc">${m.desc}</div>
                <div class="mission-progress-bg">
                    <div class="mission-progress-bar" style="width: ${percent}%"></div>
                </div>
            </div>
            <div>${btnHtml}</div>
        `;
        
        listArea.appendChild(div);
    });
}

/* [UI: 미션 화면 (하단 버튼 디자인 적용)] */
function openMission() {
    // 화면 전환
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    let screen = document.getElementById('mission-screen');
    if (!screen) {
        screen = document.createElement('div');
        screen.id = 'mission-screen';
        screen.className = 'screen';
        // flex 레이아웃 적용
        screen.style.display = 'flex';
        screen.style.flexDirection = 'column';
        
        screen.innerHTML = `
            <div class="map-header" style="justify-content: center; flex-shrink: 0;">
                <div style="font-weight:bold; font-size:1.3rem;">임무</div>
            </div>

            <div class="mission-list" id="mission-list-area" style="flex: 1; overflow-y: auto; padding: 20px;">
                </div>

            <div class="button-area-static">
        <button class="btn-gray btn-back" onclick="goMap()">돌아가기</button>
    </div>
        `;
        document.body.appendChild(screen);
    }

    ensureBackButton(screen);
    
    // 화면 켜기 (CSS 클래스 대신 display flex를 직접 줬으므로 active만 추가)
    screen.classList.add('active'); 

    // 상단 탭 버튼 UI 추가 (헤더 아래에 탭이 있어야 함)
    // 기존 HTML 구조를 살리면서 디자인을 적용하기 위해 재구성
    const listArea = document.getElementById('mission-list-area');
    
    // 탭 버튼 영역이 없으면 생성 (리스트 위에)
    if (!screen.querySelector('.mission-tabs')) {
        const tabContainer = document.createElement('div');
        tabContainer.className = 'mission-tabs';
        tabContainer.style.cssText = "display:flex; justify-content:center; gap:10px; padding: 10px; background: var(--bg-dark); flex-shrink: 0;";
        tabContainer.innerHTML = `
            <button class="tab-btn active" onclick="switchMissionTab('daily')">일일 미션</button>
            <button class="tab-btn" onclick="switchMissionTab('weekly')">주간 미션</button>
        `;
        // 헤더 바로 다음에 삽입
        screen.insertBefore(tabContainer, listArea);
    }

    // 미션 목록 렌더링 시작
    switchMissionTab('daily');
    // 백버튼 가시성 갱신 (미션 화면에서는 보여야 함)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
}

/* [시스템: 생명책 (도감) 로직 - 통합 점수 & 랭크 시스템] */
let currentLifeBookChapter = 1;

/* [UI: 생명책 화면 (하단 버튼 디자인 적용)] */
function openLifeBook() {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // ★ 매번 새로 생성 (HTML 업데이트 보장)
    let screen = document.getElementById('life-book-screen');
    if (screen) screen.remove();
    
    screen = document.createElement('div');
    screen.id = 'life-book-screen';
    screen.className = 'screen';
    // flex 레이아웃
    screen.style.display = 'flex';
    screen.style.flexDirection = 'column';
        
        screen.innerHTML = `
            <div class="life-book-header" style="padding:20px; text-align:center; background:#2c3e50; z-index:10; border-bottom:1px solid rgba(255,255,255,0.1); flex-shrink: 0;">
                <div style="display:flex; align-items:center; justify-content:center; gap:10px;">
                    <h1 style="color:#f1c40f; margin:0;">📖 도감</h1>
                    <button onclick="document.getElementById('life-book-help').classList.toggle('hidden'); document.getElementById('help-icon').textContent = document.getElementById('life-book-help').classList.contains('hidden') ? '❓' : '❌';" style="background:none; border:none; font-size:1.3rem; cursor:pointer; padding:5px; color:#f1c40f;" id="help-icon">❓</button>
                </div>
                
                <div id="life-book-help" class="hidden" style="background:rgba(52, 73, 94, 0.8); padding:15px; border-radius:10px; margin:10px 0; text-align:left; border-left:3px solid #f1c40f;">
                    <div style="font-size:0.85rem; color:#bdc3c7; line-height:1.6;">
                        <div style="margin-bottom:8px;"><strong style="color:#f1c40f;">🎯 도감이란?</strong></div>
                        <div>각 구절을 여러 번 훈련하면서 <strong>'도감 점수'</strong>를 모아갑니다. 점수가 높아질수록 더 강한 보너스를 얻습니다.</div>
                        <div style="margin-top:12px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">
                            <div style="margin-bottom:8px;"><strong style="color:#f1c40f;">📊 점수 획득 방식</strong></div>
                            <div>• 구절 1회 클리어: 10점</div>
                            <div>• 구절 5회 이상: 20점</div>
                            <div>• 구절 10회 이상: 30점</div>
                            <div>• 구절 20회 이상: 50점</div>
                        </div>
                        <div style="margin-top:12px; border-top:1px dashed rgba(255,255,255,0.1); padding-top:10px;">
                            <div style="margin-bottom:8px;"><strong style="color:#f1c40f;">⭐ 깨달음의 경지 보너스</strong></div>
                            <div style="font-size:0.8rem;">• 1000점: 보석 5% 추가 획득</div>
                            <div style="font-size:0.8rem;">• 2500점: 오답 1회 무시</div>
                            <div style="font-size:0.8rem;">• 6000점: 보석 10%, 승점 5% 추가</div>
                            <div style="font-size:0.8rem;">• 14000점: 보석 15%, 오답 2회</div>
                            <div style="font-size:0.8rem;">• 20000점: 보석 15% + 오답 3회 + 승점 15%</div>
                        </div>
                    </div>
                </div>
                
                <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:15px; margin-top:10px;">
                    <div style="font-size:0.9rem; color:#bdc3c7;">현재 도감 점수</div>
                    <div style="font-size:2rem; font-weight:bold; color:#fff; text-shadow:0 0 10px #f1c40f;">
                        <span id="collection-score">0</span> <span style="font-size:1rem;">pts</span>
                    </div>
                    <div style="margin-top:15px; padding-top:15px; border-top:1px dashed rgba(255,255,255,0.1);">
                        <div style="font-size:0.8rem; color:#bdc3c7; margin-bottom:5px;">깨달음의 경지</div>
                        <div id="collection-rank-label" style="font-size:1.5rem; font-weight:bold; color:#95a5a6;">🎒 나그네</div>
                        <div id="collection-rank-buff" style="font-size:0.9rem; color:#2ecc71; margin-top:5px;">아직 효과 없음</div>
                    </div>
                </div>
                
                <div id="lb-chapter-selector">
                    </div>
            </div>

            <div id="card-grid" style="flex: 1; overflow-y: auto; padding:15px; display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; align-content: start;">
                </div>

            <div class="button-area-static">
        <button class="btn-gray btn-back" onclick="goMap()">돌아가기</button>
    </div>
        `;
    
    document.body.appendChild(screen);

    ensureBackButton(screen);
    screen.classList.add('active');

    // 내용 채우기 (기존 함수인 renderLifeBook 호출)
    renderLifeBook();
    // 백버튼 가시성 갱신 (도감 화면에서는 보여야 함)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
}

/* [시스템: 생명책 (도감) 로직 - 업데이트 버전] */
function renderLifeBook() {
    // 1. 챕터 선택 버튼 그리기 (기존과 동일)
    const selector = document.getElementById('lb-chapter-selector');
    selector.innerHTML = "";
    for (let i = 1; i <= 22; i++) {
        const btn = document.createElement('button');
        btn.className = `lb-chapter-btn ${i === currentLifeBookChapter ? 'active' : ''}`;
        btn.innerText = `제 ${i}장`;
        btn.onclick = () => {
            currentLifeBookChapter = i;
            renderLifeBook();
        };
        selector.appendChild(btn);
    }
    const activeBtn = selector.querySelector('.active');
    if(activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    // 2. 전체 통합 점수 계산
    let grandTotalScore = 0;
    for (let ch = 1; ch <= 22; ch++) {
        if (bibleData[ch]) {
            bibleData[ch].forEach((v, idx) => {
                const sId = `${ch}-${idx + 1}`;
                const count = stageMastery[sId] || 0;
                if(count >= 20) grandTotalScore += 50;
                else if(count >= 10) grandTotalScore += 30;
                else if(count >= 5) grandTotalScore += 20;
                else if(count >= 1) grandTotalScore += 10;
            });
        }
    }

    // 3. ★ 다음 경지까지 남은 점수 계산 ★
    const nextRank = getNextCollectionRank(grandTotalScore);
    const nextGoalText = nextRank
        ? `다음 <b>[${nextRank.title}]</b>까지 ${nextRank.min - grandTotalScore}점 남음`
        : "🎉 명예로운 만점! 온전한 결실을 맺으셨습니다!";

    // 4. UI 업데이트
    document.getElementById('collection-score').innerText = grandTotalScore.toLocaleString();
    
    const rankInfo = getCollectionRank(grandTotalScore);
    const rankLabel = document.getElementById('collection-rank-label');
    const rankBuff = document.getElementById('collection-rank-buff');

    if (rankLabel) {
        // 직분 이름 + 아래에 작은 글씨로 남은 점수 표시
        rankLabel.innerHTML = `
            ${rankInfo.title}
            <div style="font-size:0.8rem; color:#7f8c8d; font-weight:normal; margin-top:5px; opacity:0.8;">
                ${nextGoalText}
            </div>
        `;
        rankLabel.style.color = rankInfo.color;
        
        // 현재 레벨의 보너스 표시
        let buffText = "";
        if (rankInfo.gemBonus > 0 || rankInfo.wrongCorrection > 0 || rankInfo.scoreBonus > 0) {
            let buffItems = [];
            if (rankInfo.gemBonus > 0) buffItems.push(`💎 보석 +${rankInfo.gemBonus}%`);
            if (rankInfo.wrongCorrection > 0) buffItems.push(`🐛 오답 ${rankInfo.wrongCorrection}회`);
            if (rankInfo.scoreBonus > 0) buffItems.push(`⭐ 승점 +${rankInfo.scoreBonus}%`);
            buffText = buffItems.join(" · ");
        } else {
            buffText = "아직 효과 없음";
        }
        rankBuff.innerHTML = buffText;
    }

    // 5. 카드 그리드 그리기 (기존과 동일)
    const grid = document.getElementById('card-grid');
    grid.innerHTML = "";
    let targetData = bibleData[currentLifeBookChapter] || [];

    if (targetData.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px; color:#7f8c8d;">🚧 데이터 준비 중</div>`;
    } else {
        targetData.forEach((verse, index) => {
            const verseNum = index + 1;
            const stageId = `${currentLifeBookChapter}-${verseNum}`;
            const count = stageMastery[stageId] || 0; 
            
            if (count === 0) {
                const div = document.createElement('div');
                div.className = 'card-item';
                div.style.background = '#34495e'; 
                div.style.border = '2px dashed #7f8c8d';
                div.innerHTML = `<div style="font-size:2rem;">🔒</div><div style="color:#7f8c8d; font-size:0.8rem; margin-top:5px;">${verseNum}절</div>`;
                div.onclick = () => alert("해당 구절을 1회 이상 클리어하여 잠금을 해제하세요.");
                grid.appendChild(div);
                return;
            }

            let tierClass = 'tier-bronze', tierName = 'Bronze';
            if (count >= 20) { tierClass = 'tier-diamond'; tierName = 'Diamond'; }
            else if (count >= 10) { tierClass = 'tier-gold'; tierName = 'Gold'; }
            else if (count >= 5) { tierClass = 'tier-silver'; tierName = 'Silver'; }
            
            const card = document.createElement('div');
            card.className = `card-item ${tierClass}`;
            card.innerHTML = `
                <div class="card-num">${currentLifeBookChapter}:${verseNum}</div>
                <div class="card-tier-label">${tierName}</div>
                <div style="font-size:0.7rem; color:#555; margin-top:5px;">숙련도: ${count}</div>
            `;
            card.onclick = () => {
                alert(`[제 ${currentLifeBookChapter}장 ${verseNum}절]\n\n${verse.text}`);
            };
            grid.appendChild(card);
        });
    }
}

// [보조 함수] 점수에 따른 경지 계산 (10단계) - 레벨별 보너스 포함
const COLLECTION_RANKS = [
    { min: 0, title: "좋은 땅에 뿌린 씨", color: "#95a5a6", gemBonus: 0, wrongCorrection: 0, scoreBonus: 0 },
    { min: 1000, title: "단단한 뿌리", color: "#2ecc71", gemBonus: 5, wrongCorrection: 0, scoreBonus: 0 },
    { min: 2500, title: "수줍은 새싹", color: "#7f8c8d", gemBonus: 5, wrongCorrection: 1, scoreBonus: 0 },
    { min: 4000, title: "푸르른 본잎", color: "#27ae60", gemBonus: 5, wrongCorrection: 1, scoreBonus: 5 },
    { min: 6000, title: "곧게 뻗은 줄기", color: "#3498db", gemBonus: 10, wrongCorrection: 1, scoreBonus: 5 },
    { min: 8500, title: "풍성한 가지", color: "#16a085", gemBonus: 10, wrongCorrection: 2, scoreBonus: 5 },
    { min: 11000, title: "강인한 나무", color: "#9b59b6", gemBonus: 10, wrongCorrection: 2, scoreBonus: 10 },
    { min: 14000, title: "간절한 꽃봉오리", color: "#8e44ad", gemBonus: 15, wrongCorrection: 2, scoreBonus: 10 },
    { min: 17000, title: "눈부신 개화", color: "#f1c40f", gemBonus: 15, wrongCorrection: 3, scoreBonus: 10 },
    { min: 20000, title: "처음 익은 열매", color: "#e74c3c", gemBonus: 15, wrongCorrection: 3, scoreBonus: 15 }
];

// 현재 도감 점수 계산
function getCurrentCollectionScore() {
    let score = 0;
    for (let ch = 1; ch <= 22; ch++) {
        if (bibleData[ch]) {
            bibleData[ch].forEach((v, idx) => {
                const count = stageMastery[`${ch}-${idx + 1}`] || 0;
                if (count >= 20) score += 50;
                else if (count >= 10) score += 30;
                else if (count >= 5) score += 20;
                else if (count >= 1) score += 10;
            });
        }
    }
    return score;
}

function getCollectionRank(score) {
    for (let i = COLLECTION_RANKS.length - 1; i >= 0; i--) {
        if (score >= COLLECTION_RANKS[i].min) return COLLECTION_RANKS[i];
    }
    return COLLECTION_RANKS[0];
}

function getNextCollectionRank(score) {
    for (let i = 0; i < COLLECTION_RANKS.length; i++) {
        if (score < COLLECTION_RANKS[i].min) return COLLECTION_RANKS[i];
    }
    return null;
}

/* [시스템: 일일 보급 (Daily Reward)] */
function checkDailyReward() {
    // 1. 오늘 날짜 구하기 (YYYY-MM-DD 형식)
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem('kingsRoad_lastLoginDate');

    // 2. 이미 오늘 보상을 받았으면 패스
    if (lastDate === today) return;

    // 3. 현재 도감 점수 계산
    let currentTotalScore = 0;
    for (let ch = 1; ch <= 22; ch++) {
        if (bibleData[ch]) {
            bibleData[ch].forEach((v, idx) => {
                const count = stageMastery[`${ch}-${idx + 1}`] || 0;
                if(count >= 20) currentTotalScore += 50;
                else if(count >= 10) currentTotalScore += 30;
                else if(count >= 5) currentTotalScore += 20;
                else if(count >= 1) currentTotalScore += 10;
            });
        }
    }

    // 4. [성도] 등급(1000점) 이상인지 확인
    if (currentTotalScore >= 1000) {
        // 보석 지급
        const dailyBonus = 50;
        myGems += dailyBonus;
        
        // 저장 및 알림
        localStorage.setItem('kingsRoad_lastLoginDate', today);
        saveGameData();
        updateGemDisplay();

        // 환영 메시지
        setTimeout(() => {
            alert(`🕊️ [일용할 양식]\n\n성도의 직분을 가진 자에게\n보석 ${dailyBonus}개가 지급되었습니다! 💎\n(현재 보석: ${myGems})`);
        }, 500);
    } else {
        // 성도가 아니더라도 날짜는 갱신
        localStorage.setItem('kingsRoad_lastLoginDate', today);
    }
}

/* =========================================
   [시스템: 천국 침노 랭킹전 (Kingdom League) & XP 시스템]
   ========================================= */

const LEAGUE_TIERS = [
    { name: "🌿 광야 리그", color: "#cd7f32" }, // Bronze
    { name: "🕊️ 성도 리그", color: "#bdc3c7" }, // Silver
    { name: "⚔️ 군사 리그", color: "#f1c40f" }, // Gold
    { name: "📜 장로 리그", color: "#2ecc71" }, // Platinum
    { name: "🔥 사도 리그", color: "#3498db" }, // Diamond
    { name: "👑 천국 리그", color: "#9b59b6" }  // Master
];

/* [기능] 시즌 리셋 (새로운 주가 시작되었을 때) */
function resetLeague(newWeekId) {
    console.log(`🔄 새 시즌 감지: ${leagueData.weekId} → ${newWeekId}`);
    leagueData.weekId = newWeekId;
    // stageLog와 myScore는 checkDailyLogin에서 초기화하므로 여기선 weekId만 업데이트
}

/* [수정] calculateScore 함수 (반복 보너스 시스템) */
function calculateScore(stageId, type, verseCount, hearts, isForgotten) {
    const currentWeek = getWeekId();
    
    if (leagueData.weekId !== currentWeek) {
        resetLeague(currentWeek);
    }

    let baseScore = 0;
    let bonus = 1.0;
    let isRetry = false;

    // 기본 점수 계산 (현재 하트 기준)
    if (type === 'boss' || type === 'mid-boss') {
        baseScore = verseCount * hearts * 1;  // 보스: hearts × 구절 수
    } else {
        baseScore = hearts * 1;  // 일반: hearts × 1
    }

    // ============================================================
    // [때를 따른 양식 보너스] (망각 주기 기반, 모든 스테이지 적용)
    // ============================================================
    const bonusLevel = consumeTimedBonus(stageId); // 보너스 소진 후 사용 전 값 반환
    
    // 보너스 배율 적용
    if (bonusLevel === 3) {
        // 1회차 보너스 (5배)
        baseScore = baseScore * 5;
        isRetry = false;
    } else if (bonusLevel === 2) {
        // 2회차 보너스 (2배)
        baseScore = baseScore * 2;
        isRetry = true;
    } else if (bonusLevel === 1) {
        // 3회차 보너스 (1.5배)
        baseScore = baseScore * 1.5;
        isRetry = true;
    } else {
        // 보너스 소진 (1배, 보너스 없음)
        baseScore = baseScore * 1;
        isRetry = true;
    }
    
    if (isForgotten) {
        // (기억레벨+1) × 10% 보너스 적용 (최소 10%, Lv4이상 50%)
        const memStatus = checkMemoryStatus(stageId);
        let bonusPercent = ((memStatus.level + 1) * 0.1);
        if (bonusPercent > 0.5) bonusPercent = 0.5; // 50% cap
        baseScore = baseScore * (1 + bonusPercent);
    }

    // ... (이하 부스터 적용 및 저장 로직 그대로 유지) ...
    
    checkBoosterStatus(); 
    const finalScore = Math.floor(baseScore * boosterData.multiplier);

    leagueData.myScore += finalScore;
    leagueData.myMonthlyScore += finalScore; // ✨ 월간 누적도 추가
    if (typeof userStats !== 'undefined') {
        userStats.totalScoreEarned = (userStats.totalScoreEarned || 0) + finalScore;
    }
    saveGameData();

    return { 
        score: finalScore, 
        bonus: bonus,
        isRetry: isRetry,
        blocked: false
    };
}

// 4. 부스터 활성화 함수
/* =========================================
   [시스템: 부스터 타이머 관리 로직] 
   ========================================= */

let boosterInterval = null; // 타이머 ID 저장용

// floating booster UI
function initBoosterFloat() {
    const root = document.getElementById('booster-float');
    const btn = document.getElementById('booster-float-btn');
    if (!root || !btn) return;

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let moved = false;

    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

    btn.addEventListener('pointerdown', (e) => {
        pointerId = e.pointerId;
        btn.setPointerCapture(pointerId);
        moved = false;

        const rect = root.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startLeft = rect.left;
        startTop = rect.top;

        // disable centering transform after first drag interaction
        root.style.transform = 'none';
    });

    btn.addEventListener('pointermove', (e) => {
        if (pointerId !== e.pointerId) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;

        const nextLeft = startLeft + dx;
        const nextTop = startTop + dy;

        const maxLeft = window.innerWidth - root.offsetWidth - 8;
        const maxTop = window.innerHeight - root.offsetHeight - 8;

        root.style.left = clamp(nextLeft, 8, maxLeft) + 'px';
        root.style.top = clamp(nextTop, 8, maxTop) + 'px';
    });

    btn.addEventListener('pointerup', (e) => {
        if (pointerId !== e.pointerId) return;
        btn.releasePointerCapture(pointerId);
        pointerId = null;

        if (!moved) {
            root.classList.toggle('open');
        }
    });
}

// 1. 부스터 활성화 함수 (기존 activateBooster 대체)
function activateBooster(multiplier, minutes) {
    const duration = minutes * 60 * 1000;
    const now = Date.now();
    
    // 이미 켜져 있으면 시간 연장
    if (boosterData.active && now < boosterData.endTime) {
        if (multiplier > boosterData.multiplier) {
            boosterData.multiplier = multiplier;
            alert(`🔥 더 강력한 ${multiplier}배 부스터가 적용되었습니다!`);
        } else {
            alert(`🔥 부스터 시간이 ${minutes}분 연장되었습니다!`);
        }
        boosterData.endTime += duration;
    } else {
        // 새로 시작
        boosterData.active = true;
        boosterData.multiplier = multiplier;
        boosterData.endTime = now + duration;
        alert(`⚡ ${minutes}분간 승점 ${multiplier}배 부스터 발동!`);
    }
    
    saveGameData();
    startBoosterTimer(); // 타이머 시작!
}

// 2. 타이머 시작 및 UI 갱신 (핵심 함수)
function startBoosterTimer() {
    // 기존 타이머가 돌고 있다면 정지 (중복 방지)
    if (boosterInterval) clearInterval(boosterInterval);

    // 즉시 한 번 실행 (화면 갱신)
    updateBoosterDisplay();

    // 1초마다 갱신
    boosterInterval = setInterval(() => {
        const isRunning = updateBoosterDisplay();
        if (!isRunning) {
            clearInterval(boosterInterval); // 시간 다 되면 타이머 종료
            boosterInterval = null;
        }
    }, 1000);
}

// 3. 화면에 남은 시간 표시
function updateBoosterDisplay() {
    const now = Date.now();
    const remain = boosterData.endTime - now;

    // A. 부스터가 끝났거나 없을 때
    if (!boosterData.active || remain <= 0) {
        if (boosterData.active) { 
            // 막 끝난 순간
            boosterData.active = false;
            boosterData.multiplier = 1;
            saveGameData();
            // 필요하다면 알림: alert("부스터 효과가 종료되었습니다.");
        }
        
        // 숨기기
        document.querySelectorAll('.booster-badge').forEach(el => el.style.display = 'none');
        const floatRoot = document.getElementById('booster-float');
        if (floatRoot) {
            floatRoot.style.display = 'none';
            floatRoot.classList.remove('open');
        }
        return false; // 타이머 멈춤 신호
    }

    // B. 부스터 진행 중
    const min = Math.floor(remain / 60000);
    const sec = Math.floor((remain % 60000) / 1000).toString().padStart(2, '0');
    const text = `승점 ${boosterData.multiplier}배 (${min}:${sec})`;

    // 플로팅 패널에만 표시
    const floatRoot = document.getElementById('booster-float');
    const floatPanel = document.getElementById('booster-float-panel');
    if (floatRoot && floatPanel) {
        floatRoot.style.display = 'flex';
        floatPanel.textContent = text;
    }

    return true; // 계속 실행
}

function checkBoosterStatus() {
    if (Date.now() > boosterData.endTime) {
        boosterData.multiplier = 1;
    }
}

// init floating booster UI
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBoosterFloat);
} else {
    initBoosterFloat();
}

// 주간 랭킹 카운트 캐시 (지파/전체)
let weeklyRankCounts = {
    weekId: null,
    totalCount: 0,
    tribeCounts: {},
    cutoffTotal: 0,
    cutoffTribes: {}
};

function loadWeeklyRankCounts() {
    if (typeof db === 'undefined' || !db) return;

    db.collection('system_meta').doc('weekly_counts').get()
        .then(doc => {
            if (!doc.exists) return;
            const data = doc.data();
            const currentWeekId = getWeekId();

            if (data.weekId !== currentWeekId) return;

            weeklyRankCounts = {
                weekId: data.weekId,
                totalCount: data.totalCount || 0,
                tribeCounts: data.tribeCounts || {},
                cutoffTotal: data.cutoffTotal || 0,
                cutoffTribes: data.cutoffTribes || {}
            };

            if (document.getElementById('ranking-screen')) {
                updateStickyMyRank(window.lastRankInTop100 === true);
            }
        })
        .catch(err => {
            console.error('❌ 주간 카운트 로드 실패:', err);
        });
}

function getCurrentRankingTotalCount() {
    const mode = window.currentRankingMode || 'tribe';
    if (mode === 'zion') {
        return weeklyRankCounts.totalCount || 0;
    }
    const tribeKey = String(myTribe);
    return (weeklyRankCounts.tribeCounts && weeklyRankCounts.tribeCounts[tribeKey]) || 0;
}

function getCurrentRankingCutoff() {
    const mode = window.currentRankingMode || 'tribe';
    if (mode === 'zion') {
        return weeklyRankCounts.cutoffTotal || 0;
    }
    const tribeKey = String(myTribe);
    return (weeklyRankCounts.cutoffTribes && weeklyRankCounts.cutoffTribes[tribeKey]) || 0;
}

function updateMyScorePanel() {
    const weeklyEl = document.getElementById('my-weekly-score');
    const monthlyEl = document.getElementById('my-monthly-score');
    const weekIdEl = document.getElementById('my-week-id');
    const monthIdEl = document.getElementById('my-month-id');
    if (!weeklyEl || !monthlyEl || !weekIdEl || !monthIdEl) return;

    const weekly = (leagueData && typeof leagueData.myScore === 'number') ? leagueData.myScore : 0;
    const monthly = (leagueData && typeof leagueData.myMonthlyScore === 'number') ? leagueData.myMonthlyScore : 0;
    const weekId = (leagueData && leagueData.weekId) ? leagueData.weekId : getWeekId();
    const monthId = (leagueData && leagueData.monthId) ? leagueData.monthId : getMonthId();

    weeklyEl.textContent = weekly.toLocaleString();
    monthlyEl.textContent = monthly.toLocaleString();
    weekIdEl.textContent = weekId;
    monthIdEl.textContent = monthId;
}

function toggleMyScorePanel() {
    const panel = document.getElementById('my-score-panel');
    if (!panel) return;
    const isOpen = panel.style.display === 'block';
    panel.style.display = isOpen ? 'none' : 'block';
    if (!isOpen) updateMyScorePanel();
}

/* [수정] 랭킹 화면 열기 */
function openRankingScreen() {
    // 랭킹 오버레이 먼저 띄우기
    const overlay = document.getElementById('ranking-overlay');
    const amenBtn = document.getElementById('ranking-amen-btn');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    if (amenBtn) {
        amenBtn.style.opacity = '0';
        amenBtn.style.pointerEvents = 'none';
        setTimeout(() => {
            amenBtn.style.opacity = '1';
            amenBtn.style.pointerEvents = 'auto';
        }, 1000);
        amenBtn.onclick = showRankingScreenReal;
    }

    // ====== 랭킹 화면 및 데이터 백그라운드 로딩 ======
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    let screen = document.getElementById('ranking-screen');
    
    if (!screen) {
        screen = document.createElement('div');
        screen.id = 'ranking-screen';
        screen.className = 'screen';
        screen.style.background = "#2c3e50"; 

        screen.innerHTML = `
    <div class="map-header" style="flex-direction:column; justify-content:center; border-bottom:1px solid rgba(255,255,255,0.1); padding:15px 0;">
        <div style="font-weight:bold; font-size:1.2rem; color:white; margin-bottom:5px;">🏆 지파 랭킹 (Top 100)</div>
        <div id="season-timer-display" style="font-size:0.85rem; color:#bdc3c7; font-family:monospace; margin-bottom:10px;">⏳ 시간 계산 중...</div>
        <div style="font-size:0.8rem; color:#95a5a6; margin-bottom:10px;">🔄 06시, 정오(12:00) · 18시, 자정(00:00)에 업데이트됩니다</div>
        
        <button onclick="scrollToMyRank()" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: #ecf0f1; padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; display: flex; align-items: center; gap: 5px; margin: 0 auto;">
            📍 내 순위 찾기
        </button>

        <button onclick="toggleMyScorePanel()" style="background: rgba(241,196,15,0.15); border: 1px solid rgba(241,196,15,0.4); color: #f1c40f; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; margin: 10px auto 0;">
            📊 나의 주간·월간 승점
        </button>
        <div id="my-score-panel" style="display:none; margin:8px auto 0; width:90%; max-width:320px; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:10px 12px; color:#ecf0f1; font-size:0.85rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>주간 승점</span>
                <span style="font-weight:bold; color:#f1c40f;"><span id="my-weekly-score">0</span> pts</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <span>월간 승점</span>
                <span style="font-weight:bold; color:#f1c40f;"><span id="my-monthly-score">0</span> pts</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#95a5a6;">
                <span>주차: <span id="my-week-id">-</span></span>
                <span>월: <span id="my-month-id">-</span></span>
            </div>
        </div>
    </div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; padding:10px; gap:5px;">
        <button id="tab-tribe" onclick="switchRankingTab('tribe')" 
            style="padding:12px 2px; border-radius:10px; border:none; background:#f1c40f; color:#2c3e50; font-weight:bold; cursor:pointer; white-space:nowrap; font-size:0.9rem; letter-spacing:-0.5px;">
            🧭 내 지파
        </button>

        <button id="tab-zion" onclick="switchRankingTab('zion')" 
            style="padding:12px 2px; border-radius:10px; border:none; background:rgba(255,255,255,0.1); color:#bdc3c7; font-weight:bold; cursor:pointer; white-space:nowrap; font-size:0.9rem; letter-spacing:-0.5px;">
            👑 시온성
        </button>

        <button id="tab-weekly-hall" onclick="switchRankingTab('weekly-hall')" 
            style="padding:12px 2px; border-radius:10px; border:none; background:rgba(255,255,255,0.1); color:#bdc3c7; font-weight:bold; cursor:pointer; white-space:nowrap; font-size:0.9rem; letter-spacing:-0.5px;">
            🏛️ 주간 명예
        </button>

        <button id="tab-monthly-hall" onclick="switchRankingTab('monthly-hall')" 
            style="padding:12px 2px; border-radius:10px; border:none; background:rgba(255,255,255,0.1); color:#bdc3c7; font-weight:bold; cursor:pointer; white-space:nowrap; font-size:0.9rem; letter-spacing:-0.5px;">
            📜 월간 명예
        </button>
    </div>

        <div id="ranking-list" style="flex: 1; overflow-y: auto; padding: 10px; padding-bottom: 150px;">
            <div style="text-align:center; padding:50px; color:#bdc3c7;">📡 데이터 불러오는 중...</div>
        </div>

        <div class="button-area-static">
            <button class="btn-gray btn-back" onclick="goMap()">돌아가기</button>
        </div>
        `;
        document.body.appendChild(screen);
    }
    
    screen.classList.add('active'); 
    switchRankingTab('tribe'); // 기본 탭 열기
    startSeasonTimer();
    loadWeeklyRankCounts();
    updateMyScorePanel();
    // 백버튼 가시성 갱신 (랭킹 화면에서는 보여야 함)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
}

function showRankingScreenReal() {
    const overlay = document.getElementById('ranking-overlay');
    const amenBtn = document.getElementById('ranking-amen-btn');
    if (overlay) overlay.style.display = 'none';
    if (amenBtn) {
        amenBtn.style.opacity = '0';
        amenBtn.style.pointerEvents = 'none';
    }
}

/* [추가] 지파/시온성 랭킹 로드 */
function loadTribeRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    const tribeName = (TRIBE_DATA[myTribe] && TRIBE_DATA[myTribe].name) ? TRIBE_DATA[myTribe].name : '내 지파';
    list.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">📡 ${tribeName} 랭킹 불러오는 중...</div>`;

    window.currentRankingMode = 'tribe';
    loadTribeLeaderboard(myTribe, (data) => renderRankingList(data));
}

function loadZionRanking() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    list.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">📡 시온성 랭킹 불러오는 중...</div>`;

    window.currentRankingMode = 'zion';
    loadZionLeaderboard((data) => renderRankingList(data));
}

/* [데이터] 주간 지파/시온성 랭킹 로드 (+ 캐싱) */
function loadTribeLeaderboard(tribeId, callback) {
    if (typeof db === 'undefined' || !db) {
        callback([]);
        return;
    }

    const now = Date.now();
    
    // ✨ 캐시 확인
    if (!rankingCache.tribes[tribeId]) {
        rankingCache.tribes[tribeId] = { data: null, timestamp: 0 };
    }
    
    const cached = rankingCache.tribes[tribeId];
    if (cached.data && (now - cached.timestamp) < RANKING_CACHE_DURATION) {
        console.log(`📦 캐시 사용 (tribe_${tribeId})`);
        callback(cached.data);
        return;
    }

    const currentWeekId = getWeekId();
    
    // 📡 서버에서 읽기
    db.collection('ranking_snapshots')
        .doc(currentWeekId)
        .collection('tribes')
        .doc(`tribe_${tribeId}`)
        .get()
        .then(doc => {
            if (!doc.exists) {
                console.warn(`⚠️ Snapshot 아직 준비 중: ${currentWeekId}/tribe_${tribeId}`);
                callback([]);
                return;
            }
            
            const data = doc.data();
            const ranks = data.ranks || [];
            
            // ranks 배열을 UI에 맞게 변환
            const transformed = ranks.map((row, index) => {
                return {
                    rank: index + 1,
                    name: row.name || "이름없음",
                    score: row.score || 0,
                    tribe: row.tribe !== undefined ? row.tribe : tribeId,
                    dept: row.dept !== undefined ? row.dept : 0,
                    tag: row.tag || "",
                    castle: row.castle || 0,
                    isMe: false  // ⚠️ Snapshot에는 myPlayerId 정보가 없으므로 false로 설정
                };
            });
            
            // 💾 캐시 저장
            rankingCache.tribes[tribeId] = { data: transformed, timestamp: now };
            
            callback(transformed);
        })
        .catch(err => {
            console.error("❌ 지파 랭킹 로드 실패:", err);
            callback([]);
        });
}

function loadZionLeaderboard(callback) {
    if (typeof db === 'undefined' || !db) {
        callback([]);
        return;
    }

    const now = Date.now();
    
    // ✨ 캐시 확인
    if (rankingCache.zion.data && (now - rankingCache.zion.timestamp) < RANKING_CACHE_DURATION) {
        console.log(`📦 캐시 사용 (zion)`);
        callback(rankingCache.zion.data);
        return;
    }

    const currentWeekId = getWeekId();
    
    // 📡 서버에서 읽기
    db.collection('ranking_snapshots')
        .doc(currentWeekId)
        .collection('tribes')
        .doc('zion')
        .get()
        .then(doc => {
            if (!doc.exists) {
                console.warn(`⚠️ Zion Snapshot 아직 준비 중: ${currentWeekId}/zion`);
                callback([]);
                return;
            }
            
            const data = doc.data();
            const ranks = data.ranks || [];
            
            // ranks 배열을 UI에 맞게 변환
            const transformed = ranks.map((row, index) => {
                return {
                    rank: index + 1,
                    name: row.name || "이름없음",
                    score: row.score || 0,
                    tribe: row.tribe !== undefined ? row.tribe : 0,
                    dept: row.dept !== undefined ? row.dept : 0,
                    tag: row.tag || "",
                    castle: row.castle || 0,
                    isMe: false  // ⚠️ Snapshot에는 myPlayerId 정보가 없으므로 false로 설정
                };
            });
            
            // 💾 캐시 저장
            rankingCache.zion = { data: transformed, timestamp: now };
            
            callback(transformed);
        })
        .catch(err => {
            console.error("❌ 시온성 랭킹 로드 실패:", err);
            callback([]);
        });
}

/* ✨ [NEW] 주간 명예의 전당 로드 */
/* ✨ [NEW] 주간 명예의 전당 로드 (+ 캐싱) */
function loadWeeklyHallOfFame() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    const now = Date.now();
    
    // ✨ 캐시 확인
    if (rankingCache.weeklyHall.data && (now - rankingCache.weeklyHall.timestamp) < RANKING_CACHE_DURATION) {
        console.log(`📦 캐시 사용 (weeklyHall)`);
        renderHallOfFameList(rankingCache.weeklyHall.data, '지난 주 명예의 전당');
        return;
    }

    list.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">📡 주간 명예의 전당 불러오는 중...</div>`;

    const lastWeekId = getLastWeekId(); // 지난주 ID
    
    if (typeof db === 'undefined' || !db) {
        renderHallOfFameList([], '지난 주 명예의 전당');
        return;
    }

    // 📡 서버에서 읽기
    db.collection('ranking_snapshots')
        .doc(lastWeekId)
        .collection('tribes')
        .doc('zion')
        .get()
        .then(doc => {
            if (!doc.exists) {
                console.warn(`⚠️ 주간 명예의 전당 데이터 없음: ${lastWeekId}`);
                renderHallOfFameList([], '지난 주 명예의 전당');
                return;
            }

            const data = doc.data();
            const ranks = data.ranks || [];
            
            // 💾 캐시 저장
            rankingCache.weeklyHall = { data: ranks, timestamp: now };
            
            renderHallOfFameList(ranks, '지난 주 명예의 전당');
        })
        .catch(err => {
            console.error("❌ 주간 명예의 전당 로드 실패:", err);
            renderHallOfFameList([], '지난 주 명예의 전당');
        });
}

/* ✨ [NEW] 월간 명예의 전당 로드 (+ 캐싱) */
function loadMonthlyHallOfFame() {
    const list = document.getElementById('ranking-list');
    if (!list) return;

    const now = Date.now();
    
    // ✨ 캐시 확인
    if (rankingCache.monthlyHall.data && (now - rankingCache.monthlyHall.timestamp) < RANKING_CACHE_DURATION) {
        console.log(`📦 캐시 사용 (monthlyHall)`);
        renderHallOfFameList(rankingCache.monthlyHall.data, '지난 달 명예의 전당');
        return;
    }

    list.innerHTML = `<div style="text-align:center; padding:50px; color:#bdc3c7;">📡 월간 명예의 전당 불러오는 중...</div>`;

    const lastMonthId = getLastMonthId(); // 지난달 ID
    
    if (typeof db === 'undefined' || !db) {
        renderHallOfFameList([], '지난 달 명예의 전당');
        return;
    }

    // 📡 서버에서 읽기
    db.collection('ranking_snapshots')
        .doc(lastMonthId)
        .collection('hall')
        .doc('monthly')
        .get()
        .then(doc => {
            if (!doc.exists) {
                console.warn(`⚠️ 월간 명예의 전당 데이터 없음: ${lastMonthId}`);
                renderHallOfFameList([], '지난 달 명예의 전당');
                return;
            }

            const data = doc.data();
            const ranks = data.ranks || [];
            
            // 💾 캐시 저장
            rankingCache.monthlyHall = { data: ranks, timestamp: now };
            
            renderHallOfFameList(ranks, '지난 달 명예의 전당');
        })
        .catch(err => {
            console.error("❌ 월간 명예의 전당 로드 실패:", err);
            renderHallOfFameList([], '지난 달 명예의 전당');
        });
}

/* [수정] 내 순위 찾기 */
function scrollToMyRank() {
    findAndScrollMe();
}

// 스크롤 로직 분리
function findAndScrollMe() {
    // isMe 플래그가 있는 카드 찾기 (renderRankingList에서 이미 id를 심어두는 게 좋음)
    // 현재 코드에서는 isMe일 때 배경색을 바꾸는데, 식별용 ID도 추가하면 좋습니다.
    // renderRankingList 함수 안의 item 생성 부분에 id="my-ranking-card" 가 들어가는 조건 확인 필요
    
    const myCard = document.getElementById('my-ranking-card'); // renderRankingList에서 이 ID를 넣어주셔야 합니다!
    
    if (myCard) {
        myCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        myCard.style.transition = "transform 0.2s";
        myCard.style.transform = "scale(1.05)";
        setTimeout(() => myCard.style.transform = "scale(1)", 200);
    } else {
        alert("현재 랭킹 Top 100 안에 들지 못했습니다.\n분발하세요, 순례자여! 🔥");
    }
}

/* [기능] 다음 월요일 0시까지 남은 시간 계산 및 표시 */
var seasonTimerInterval = null;

function startSeasonTimer() {
    // 기존 타이머가 돌고 있다면 정지 (중복 방지)
    if (seasonTimerInterval) clearInterval(seasonTimerInterval);

    const timerDisplay = document.getElementById('season-timer-display');
    if (!timerDisplay) return;

    function updateTimer() {
        const now = new Date();
        
        // 다음 주 월요일 0시 계산
        // (오늘에서 월요일까지 며칠 남았는지 계산)
        const day = now.getDay(); // 0(일) ~ 6(토)
        const daysUntilMonday = (day === 0) ? 1 : (8 - day); // 일요일이면 1일 뒤, 그 외에는 8-요일
        
        // 다음 월요일 자정 목표 설정
        const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday);
        nextMonday.setHours(0, 0, 0, 0);

        // 일요일인데 이미 월요일 날짜로 넘어가는 경우(다음주) 보정
        if (day === 1 && now > nextMonday) {
            nextMonday.setDate(nextMonday.getDate() + 7);
        }

        const diff = nextMonday - now;

        if (diff <= 0) {
            timerDisplay.innerHTML = "🔄 리그 갱신 중...";
            return;
        }

        // 시, 분, 초 변환
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        // 예쁘게 표시
        timerDisplay.innerHTML = `⏰ 이번 리그 종료까지: <span style="color:#f1c40f;">${d}일 ${h}시간 ${m}분 ${s}초</span>`;
    }

    // 즉시 실행 후 1초마다 갱신
    updateTimer();
    seasonTimerInterval = setInterval(updateTimer, 1000);
}

/* [수정] 메인 탭 전환 (리그 선택 바 숨김/표시 추가) */
function switchRankingTab(tabName) {
    const btnTribe = document.getElementById('tab-tribe');
    const btnZion = document.getElementById('tab-zion');
    const btnWeeklyHall = document.getElementById('tab-weekly-hall');
    const btnMonthlyHall = document.getElementById('tab-monthly-hall');

    // 모든 탭 버튼 초기화
    [btnTribe, btnZion, btnWeeklyHall, btnMonthlyHall].forEach(btn => {
        if (btn) {
            btn.style.background = "rgba(255,255,255,0.1)";
            btn.style.color = "#bdc3c7";
        }
    });

    if (tabName === 'tribe') {
        // [내 지파]
        btnTribe.style.background = "#f1c40f";
        btnTribe.style.color = "#2c3e50";
        loadTribeRanking();

    } else if (tabName === 'zion') {
        // [시온성]
        btnZion.style.background = "#e67e22";
        btnZion.style.color = "white";
        loadZionRanking();

    } else if (tabName === 'weekly-hall') {
        // [주간 명예의 전당]
        btnWeeklyHall.style.background = "#9b59b6";
        btnWeeklyHall.style.color = "white";
        loadWeeklyHallOfFame();

    } else if (tabName === 'monthly-hall') {
        // [월간 명예의 전당]
        btnMonthlyHall.style.background = "#1abc9c";
        btnMonthlyHall.style.color = "white";
        loadMonthlyHallOfFame();
    }
}

/* [기능] 명예의 전당 리스트 그리기 */
function renderHallOfFameList(data, title) {
    const list = document.getElementById('ranking-list');
    list.innerHTML = ""; 

    // 상단에 타이틀 표시
    const header = document.createElement('div');
    header.style.textAlign = "center";
    header.style.marginBottom = "20px";
    header.innerHTML = `
        <div style="font-size:0.9rem; color:#f39c12; font-weight:bold;">🏆 HALL OF FAME</div>
        <div style="font-size:1.5rem; color:white; font-weight:bold;">${title}</div>
    `;
    list.appendChild(header);

    if (data.length === 0) {
        list.innerHTML += `<div style="text-align:center; padding:30px; color:#7f8c8d;">지난 시즌 기록이 없습니다.<br>(역사가 이제 막 시작되었습니다)</div>`;
        return;
    }

    data.forEach((user, index) => {
        const rank = index + 1;
        
        // 1,2,3등 특별 디자인 (메달 카드)
        if (rank <= 3) {
            let trophy = "🥇";
            let trophyColor = "#f1c40f"; // 금
            let glow = "0 0 15px rgba(241, 196, 15, 0.5)";
            let medalText = "GOLD MEDAL";
            
            if (rank === 2) { 
                trophy = "🥈"; 
                trophyColor = "#bdc3c7"; 
                glow = "0 0 10px rgba(189, 195, 199, 0.5)";
                medalText = "SILVER MEDAL";
            }
            if (rank === 3) { 
                trophy = "🥉"; 
                trophyColor = "#d35400"; 
                glow = "0 0 10px rgba(211, 84, 0, 0.5)";
                medalText = "BRONZE MEDAL";
            }

            const card = document.createElement('div');
            card.style.cssText = `
                background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                border: 2px solid ${trophyColor};
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 15px;
                text-align: center;
                box-shadow: ${glow};
                position: relative;
            `;
            
            card.innerHTML = `
                <div style="font-size:3rem; margin-bottom:5px;">${trophy}</div>
                <div style="font-size:0.7rem; color:${trophyColor}; font-weight:bold; letter-spacing:1px; margin-bottom:8px;">
                    ${medalText}
                </div>
                <div style="font-size:1.2rem; font-weight:bold; color:white; margin-bottom:5px;">
                    ${getTribeIcon(user.tribe || 0)}${getDeptTag(user.dept)} ${user.name}
                </div>
                <div style="font-size:1rem; color:${trophyColor}; font-weight:bold;">
                    ${user.score.toLocaleString()} 점
                </div>
            `;
            list.appendChild(card);
        } 
        // 4~100등: 명예의 전당 리스트
        else {
            const item = document.createElement('div');
            item.style.cssText = `
                display:flex; align-items:center; padding:10px; 
                border-bottom:1px solid rgba(255,255,255,0.1); color:#bdc3c7;
                background: ${rank <= 10 ? 'rgba(241,196,15,0.05)' : 'transparent'};
            `;
            item.innerHTML = `
                <div style="width:40px; font-weight:bold; text-align:center; color:${rank <= 10 ? '#f1c40f' : '#7f8c8d'};">
                    ${rank <= 10 ? '⭐' : ''}${rank}
                </div>
                <div style="flex:1; margin-left:10px;">
                    ${getTribeIcon(user.tribe || 0)}${getDeptTag(user.dept)} ${user.name}
                </div>
                <div style="font-weight:bold; color:#ecf0f1;">${user.score.toLocaleString()}</div>
            `;
            list.appendChild(item);
        }
    });
}

/* [수정] 랭킹 리스트 그리기 (+ 50위 밖일 때 하단 고정바 표시) */
function renderRankingList(data) {
    const list = document.getElementById('ranking-list');
    list.innerHTML = ""; 

    // 1. 내가 리스트(Top 100) 안에 있는지 확인
    let amIInTop100 = false;

    // 헤더 표시
    const mode = window.currentRankingMode || 'tribe';
    const tribeName = (TRIBE_DATA[myTribe] && TRIBE_DATA[myTribe].name) ? TRIBE_DATA[myTribe].name : '내 지파';
    const headerTitle = mode === 'zion' ? '👑 시온성 Top 100' : `🧭 ${tribeName} Top 100`;
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = `padding: 15px; color: #bdc3c7; font-size: 0.9rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2);`;
    headerDiv.innerHTML = `${headerTitle} <span style="opacity:0.7; margin-left:6px;">(${getWeekId()})</span>`;
    list.appendChild(headerDiv);
    
    // 데이터가 없을 때 처리
    if (data.length === 0) {
        list.innerHTML += `<div style="text-align:center; padding:30px; color:#bdc3c7;">아직 기록이 없습니다.<br>첫 번째 주인공이 되어보세요!</div>`;
    }

    // 2. 리스트 그리기
    data.forEach((user, index) => {
        const rank = index + 1;
        const isMe = user.isMe;
        if (isMe) amIInTop100 = true; // 나를 찾았다!
        
        const userTribe = (user.tribe !== undefined) ? user.tribe : 0;

        const bgStyle = isMe 
            ? "border: 2px solid #f1c40f; background: rgba(241, 196, 15, 0.15);" 
            : "border: 1px solid rgba(255,255,255,0.1); background: rgba(0, 0, 0, 0.3);";

        let rankBadge = `<span style="font-size:1.1rem; color:#bdc3c7; width:25px; text-align:center; font-weight:bold;">${rank}</span>`;
        if (rank === 1) rankBadge = "🥇";
        if (rank === 2) rankBadge = "🥈";
        if (rank === 3) rankBadge = "🥉";

        const item = document.createElement('div');
        item.style.cssText = `${bgStyle} margin-bottom:8px; padding:12px 15px; border-radius:12px; display:flex; align-items:center; color:#ecf0f1;`;
        
        // ★ 내 카드에 ID 설정 (scrollToMyRank에서 찾기 위함)
        if (isMe) {
            item.id = 'my-ranking-card';
        }
        
        item.innerHTML = `
            <div style="font-size:1.5rem; margin-right:12px; width:35px; text-align:center;">${rankBadge}</div>
            <div style="flex:1;">
                <div style="display:flex; align-items:center; margin-bottom:4px;">
                    <span style="font-weight:bold; font-size:1.05rem; display:flex; align-items:center; color:#fff;">
                        ${getTribeIcon(userTribe)}${getDeptTag(user.dept)} ${user.name}
                    </span>
                    ${mode === 'zion' ? `<span style="font-size:0.75rem; color:#bdc3c7; margin-left:6px;">(${TRIBE_DATA[userTribe] ? TRIBE_DATA[userTribe].name : '지파'})</span>` : ''}
                </div>
                <div style="font-size:0.8rem; color:#bdc3c7;">
                    🏰 성전 Lv.${user.castle || 0} <span style="opacity:0.5; margin:0 3px;">|</span> <span style="opacity:0.7;">#${user.tag}</span>
                </div>
            </div>
            <div style="text-align:right;">
                <div style="font-weight:bold; color:#f1c40f; font-size:1.1rem;">
                    ${user.score ? user.score.toLocaleString() : 0}
                </div>
                <div style="font-size:0.7rem; color:#95a5a6;">점</div>
            </div>
        `;
        list.appendChild(item);
    });

    // 3. ★ 핵심: 내가 100위 안에 없으면 하단에 '내 정보 바' 띄우기
    window.lastRankInTop100 = amIInTop100;
    updateStickyMyRank(amIInTop100);
}

/* [수정] 하단 고정 내 정보 바 (타 리그 구경 모드 지원) */
function updateStickyMyRank(amIInTop100) {
    // 1. 기존 바 제거
    const oldBar = document.getElementById('sticky-my-rank');
    if (oldBar) oldBar.remove();

    // 2. 100위 안이면 표시하지 않음
    if (amIInTop100) return;

    const mode = window.currentRankingMode || 'tribe';
    const tribeName = (TRIBE_DATA[myTribe] && TRIBE_DATA[myTribe].name) ? TRIBE_DATA[myTribe].name : '내 지파';
    const leagueName = mode === 'zion' ? '시온성' : tribeName;
    const totalCount = getCurrentRankingTotalCount();
    const topPercent = totalCount > 0 ? Math.min(100, (100 / totalCount) * 100) : null;
    const cutoffScore = getCurrentRankingCutoff();

    let approxText = '';
    if (topPercent && cutoffScore > 0 && myScore > 0) {
        const ratio = myScore / cutoffScore;
        const estimated = topPercent / Math.max(ratio, 0.1);
        const estimatedPercent = Math.min(100, Math.max(topPercent, estimated));
        approxText = ` (대략 상위 ${estimatedPercent.toFixed(1)}%)`;
    }

    const rankDisplay = topPercent ? `상위<br>${topPercent.toFixed(1)}%` : "순위<br>외";
    const rankColor = "#7f8c8d";
    const message = topPercent
        ? `${leagueName} 랭킹: 순위 외입니다. (Top 100은 상위 ${topPercent.toFixed(1)}% 기준)${approxText}`
        : `${leagueName} 랭킹: 순위 외입니다.`;

    // 4. 하단 바 생성 (디자인 개선)
    const stickyBar = document.createElement('div');
    stickyBar.id = 'sticky-my-rank';
    stickyBar.style.cssText = `
    position: absolute; 
    bottom: 85px; /* ✅ 수정: 닫기 버튼 높이(약 80px)만큼 위로 띄움 */
    left: 0; 
    width: 100%;
    background: rgba(30, 40, 50, 0.98); 
    border-top: 2px solid #7f8c8d; 
    padding: 12px 15px;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.6);
    display: flex; align-items: center; z-index: 100;
    box-sizing: border-box; animation: slideUp 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
`;

    const myScore = leagueData.myScore || 0;
    const myTribeIdx = (typeof myTribe !== 'undefined') ? myTribe : 0;

    stickyBar.innerHTML = `
        <div style="flex:1;">
            <div style="display:flex; align-items:center; margin-bottom:3px;">
                <span style="font-weight:bold; font-size:1rem; color:white;">
                    ${getTribeIcon(myTribeIdx)}${getDeptTag(myDept)} ${myNickname}
                </span>
            </div>
            <div style="font-size:0.8rem; color:#bdc3c7;">
                ${message}
            </div>
        </div>
        <div style="text-align:right;">
            <div style="display:inline-block; font-size:0.7rem; color:${rankColor}; border:1px solid rgba(127,140,141,0.6); padding:2px 6px; border-radius:10px; margin-bottom:4px; font-weight:bold;">
                ${rankDisplay.replace('<br>', ' ')}
            </div>
            <div style="font-weight:bold; color:#f1c40f; font-size:1.1rem;">
                ${myScore.toLocaleString()}
            </div>
            <div style="font-size:0.7rem; color:#95a5a6;">점 (내 점수)</div>
        </div>
    `;

    // 랭킹 스크린에 붙이기
    const screen = document.getElementById('ranking-screen');
    if (screen) screen.appendChild(stickyBar);
}

// [덮어쓰기] 저장/불러오기/클리어 함수 (기존 기능을 업그레이드)
const originalSaveGameData = saveGameData; // 혹시 몰라 백업 (안 씀)


/* [시스템] 주간 ID 생성기 (월요일 시작, ISO 주차) */
function getWeekId(dateObj) {
    const d = dateObj ? new Date(dateObj) : new Date();
    d.setHours(0, 0, 0, 0);

    // ISO week: 월요일 시작 기준으로 주차 계산
    const day = (d.getDay() + 6) % 7; // 월=0 ... 일=6
    d.setDate(d.getDate() - day + 3); // 해당 주의 목요일로 이동

    const firstThursday = new Date(d.getFullYear(), 0, 4);
    const firstDay = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - firstDay + 3);

    const weekNumber = 1 + Math.round((d - firstThursday) / (7 * 24 * 60 * 60 * 1000));
    return `${d.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

/* [시스템] 지난주 ID 구하기 */
function getLastWeekId() {
    const today = new Date();
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    return getWeekId(lastWeek);
}

/* [시스템] 주간 마감 당일인지 확인 (일요일) */
function isLastDayOfWeek() {
    const today = new Date();
    return today.getDay() === 0; // 일요일
}

/* [시스템] 현재 월간 ID 구하기 (YYYYMM 형식) */
function getMonthId(dateObj) {
    const d = dateObj ? new Date(dateObj) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
}

/* [시스템] 지난달 ID 구하기 */
function getLastMonthId() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return getMonthId(lastMonth);
}

/* [시스템] 월간 마감 당일인지 확인 (1일) */
function isFirstDayOfMonth() {
    const today = new Date();
    return today.getDate() === 1;
}

/* [시스템] 출석 및 주간 리그 결산 (핵심 로직) */
function checkDailyLogin() {
    const today = new Date().toDateString(); 
    const lastDate = localStorage.getItem('lastPlayedDate');
    
    // 1. 미션 데이터 안전장치
    if (!missionData) missionData = { weekly: { attendance: 0, claimed: [false, false, false] } };
    if (!missionData.weekly) missionData.weekly = { attendance: 0, claimed: [false, false, false] };

    // 2. 주간 초기화 (새로운 주가 시작되었는지 확인)
    const currentWeekId = getWeekId(); // 예: "2026-W07"
    
    if (missionData.weekId !== currentWeekId) {
        console.log("🔄 새로운 주가 시작되었습니다! (주간 리셋)");

        // (1) 주간 데이터 초기화
        missionData.weekId = currentWeekId;
        missionData.weekly.attendance = 0;
        missionData.weekly.claimed = [false, false, false];
        missionData.weekly.dragonKill = 0;
        missionData.weekly.stageClear = 0;
        
        // (2) 내 점수 리셋 (새로운 주 시작)
        leagueData.weekId = currentWeekId;
        leagueData.myScore = 0; // 점수 0점부터 다시 시작
        leagueData.stageLog = {}; // 반복 훈련 기록 초기화
    }

    // ✨ NEW: 3. 월간 초기화 (새로운 달이 시작되었는지 확인)
    const currentMonthId = getMonthId(); // 예: "202602"
    
    if (leagueData.monthId !== currentMonthId) {
        console.log("🔄 새로운 달이 시작되었습니다! (월간 리셋)");

        // (1) 월간 데이터 초기화
        leagueData.monthId = currentMonthId;
        leagueData.myMonthlyScore = 0; // 월간 점수 0점부터 다시 시작
    }

    // 4. 일일 출석 체크
    if (lastDate !== today) {
        // 주간 출석 체크는 반드시 updateWeeklyAttendance로 통일
        const currentWeekId = getWeekId();
        updateWeeklyAttendance(today, currentWeekId);

        // ★ 일일 미션 초기화
        missionData.daily.newClear = 0;
        missionData.daily.differentStages = 0;
        missionData.daily.checkpointBoss = 0;
        missionData.daily.claimed = [false, false, false];

        localStorage.setItem('lastPlayedDate', today);
        saveGameData();

        // (선택) 출석 알림 대신 생명의 떡 알림이 뜨므로 여기선 조용히 넘어감
    }
}

// [3] 스테이지 클리어 함수 (수정됨)
stageClear = function(type) {
    try {
        const sId = String(window.currentStageId);
        
        // 변수 호이스팅 문제 방지용 선언
        let verseCnt = 1; 

        const memStatus = checkMemoryStatus(sId);
        const prevLevel = memStatus.level;
        const isForgotten = memStatus.isForgotten;
        
        let baseGem = 0;
        let msg = `🎉 클리어 성공!\n\n`;

        const lastTime = stageLastClear[sId] || 0;
        const isAlreadyClearedToday = new Date(lastTime).setHours(0,0,0,0) === new Date().setHours(0,0,0,0);
        const currentWeekId = (typeof getWeekId === 'function') ? getWeekId() : null;
        const chNum = parseInt(sId.split('-')[0]);

        // [A] 보스 (챕터 전체)
        if (type === 'boss') { 
            // 망각 주기가 지난 경우에만 클리어 시각 갱신
            if (isForgotten) {
                stageLastClear[sId] = Date.now();
            }
            const verseCount = bibleData[chNum] ? bibleData[chNum].length : 0;
            const rewardData = calculateProgressiveReward(chNum, verseCount, 1);
            // ★ [통일] 보스 기본 보상: 보스 절수 × 10 (mid-boss 상태 무관)
            baseGem = verseCount * 10;
            msg += `🐲 [드래곤 토벌] ${verseCount}절 완료!\n`;

            // ★ 보스 클리어 시 mid-boss를 당일 클리어로 자동 마킹하지 않음
            // (때를 따른 양식/표시 일관성 유지)

            // ★ 보스 stage 객체에서 실제 hp 값 가져오기
            const chData = gameData.find(c => c.id === chNum);
            let bossHpForScore = verseCount; // 기본값
            if (chData) {
                const bossStage = chData.stages.find(s => s.id === sId);
                if (bossStage && bossStage.targetVerseCount) {
                    bossHpForScore = bossStage.targetVerseCount; // ★ 실제 hp 값 사용
                }
            }

            verseCnt = bossHpForScore;

            // ★ [때를 따른 양식 보너스] 망각 주기 기반 (보스도 mid-boss/일반과 동일하게 적용)
            const timedBonus = getTimedBonus(sId); // 현재 상태만 확인
            const bonusLevel = timedBonus.remaining; // 소진 전 값
            if (bonusLevel === 3) {
                baseGem *= 5;
                msg += `🎁 때를 따른 양식 ( × 5배)\n`;
            } else if (bonusLevel === 2) {
                baseGem *= 2;
                msg += `🔱 때를 따른 양식 ( × 2배)\n`;
            } else if (bonusLevel === 1) {
                baseGem *= 1.5;
                msg += `⚔️ 때를 따른 양식 ( × 1.5배)\n`;
            } else {
                msg += `⏳ 보너스 쿨타임 (망각 주기 대기 중)\n`;
            }

            // 하위 스테이지 자동 처리 제거: 보스 클리어가 다른 스테이지에 영향 주지 않음

            // ★ 미션 업데이트: 보스 처치
            updateMissionProgress('checkpointBoss'); // 일일 미션
            updateMissionProgress('dragon'); // 주간 미션 
        }
        // [B] 일반 / 중간점검
        else {
            let maxGem = 0;
            
            if (type === 'mid-boss') {
                let startV = 1; 
                let endV = 5;
                const chData = gameData.find(c => c.id === chNum);
                let actualHp = 5; // 기본값
                
                if (chData) {
                    // 현재 스테이지의 실제 hp 값 찾기
                    const currentStage = chData.stages.find(s => s.id === sId);
                    if (currentStage && currentStage.targetVerseCount) {
                        actualHp = currentStage.targetVerseCount; // ★ 실제 hp 값 사용
                    }
                    
                    const midBosses = chData.stages.filter(s => s.type === 'mid-boss');
                    const myIndex = midBosses.findIndex(s => s.id === sId);
                    if (myIndex !== -1) {
                        startV = (myIndex * 5) + 1;
                        endV = startV + 4;
                    }
                }
                const rewardData = calculateProgressiveReward(chNum, endV, startV);
                
                // ★ [통일] 중간보스도 기본 보상으로 통일 (때를 따른 양식 보너스로 대체)
                maxGem = actualHp * 10; // 기본: 절수 × 10
                msg += `🛡️ [중간 점검] ${actualHp}절 완료!\n`;
                
                // 실제 hp 값으로 계산
                verseCnt = actualHp; 

                // 역주행 처리
                if (chData && chData.stages) {
                    let myIndexInMap = chData.stages.findIndex(s => s.id === sId);
                    for (let i = myIndexInMap - 1; i >= 0; i--) {
                        const targetStage = chData.stages[i];
                        if (targetStage.type === 'boss' || targetStage.type === 'mid-boss') break;
                        const subId = targetStage.id;
                        if (!stageMastery[subId]) stageMastery[subId] = 0;
                        stageMastery[subId]++;
                        targetStage.cleared = true;
                    }
                }
                
                // ★ 미션 업데이트: 중보 처치
                if (!isAlreadyClearedToday) {
                    updateMissionProgress('checkpointBoss'); // 일일 미션
                }
                updateMissionProgress('dragon'); // 주간 미션 (중보/보스)
            }
            else { 
                // 일반 스테이지: 때를 따른 양식 보너스
                maxGem = 10; // 기본 보상
                msg += "📖 [훈련] 완료!\n";
                verseCnt = 1; // 일반은 1개
                
                if (isForgotten) stageMemoryLevels[sId] = (prevLevel || 0) + 1;
                
                // ★ 미션 업데이트
                // 복습 모드, 전체 학습 모드, 신규 모드 모두 카운트
                updateMissionProgress('new'); // 스테이지 클리어 시 무조건 카운트

                // 다양성 미션: 오늘 처음 클리어하는 스테이지라면 (복습/전체학습/신규 모두 적용)
                if (!isAlreadyClearedToday) {
                    updateMissionProgress('differentStage');
                }
            } 

            baseGem = maxGem;

            // ★ [때를 따른 양식 보너스] 망각 주기 기반 (모든 스테이지 적용)
            // 주의: calculateScore보다 먼저 호출하면 안 됨 (중복 소진 방지)
            const timedBonus = getTimedBonus(sId); // 현재 상태만 확인
            const bonusLevel = timedBonus.remaining; // 소진 전 값

            if (bonusLevel === 3) {
                baseGem *= 5;
                msg += `🎁 때를 따른 양식 ( × 5배)\n`;
            } else if (bonusLevel === 2) {
                baseGem *= 2;
                msg += `🔱 때를 따른 양식 ( × 2배)\n`;
            } else if (bonusLevel === 1) {
                baseGem *= 1.5;
                msg += `⚔️ 때를 따른 양식 ( × 1.5배)\n`;
            } else {
                msg += `⏳ 보너스 쿨타임 (망각 주기 대기 중)\n`;
            }

            // 망각 주기가 지난 경우에만 클리어 시각 갱신
            if (isForgotten) {
                stageLastClear[sId] = Date.now();
                // 복습 주기 갱신: 현재 기억레벨 기준으로 다음 eligibleTime 설정
                const memoryLevel = stageMemoryLevels[sId] || 0;
                stageNextEligibleTime[sId] = getNextEligibleTime(memoryLevel);
                // (기억레벨+1) × 10% 보너스 적용 (최소 10%, Lv4이상 50%)
                let bonusPercent = ((prevLevel + 1) * 0.1);
                if (bonusPercent > 0.5) bonusPercent = 0.5; // 50% cap
                baseGem = Math.floor(baseGem * (1 + bonusPercent));
                msg += `💜 [기억 회복] 보너스 +${Math.round(bonusPercent*100)}%! (Lv.${prevLevel})\n`;
            }
        }
        
        // ★ [깨달음의 경지 보너스 적용]
        const collectionScore = getCurrentCollectionScore();
        const rankBuff = getCollectionRank(collectionScore);
        let buffMsg = "";
        
        // 보석 보너스
        if (rankBuff.gemBonus > 0) {
            baseGem = Math.floor(baseGem * (1 + rankBuff.gemBonus / 100));
            buffMsg += `💎 깨달음 보석 보너스(+${rankBuff.gemBonus}%)\n`;
        }
        
        // ★ [4회 이상 클리어 시 보상 제한]
        let scoreType = (type === 'boss') ? 'boss' : (type === 'mid-boss' ? 'mid-boss' : 'normal');
        
        // 재도전 보너스가 자동으로 포함됨 (calculateScore 내부에서 보너스 소진)
        const scoreResult = calculateScore(sId, scoreType, verseCnt, playerHearts, isForgotten);
        
        // ★ 월말 23시 이후 승점 차단 체크
        if (scoreResult.blocked) {
            msg += `\n⚠️ ${scoreResult.blockReason}\n\n`;
            msg += `💎 보석은 정상 지급됩니다.\n`;
            scoreResult.score = 0;
        }
        
        scoreResult.score = Math.floor(scoreResult.score);
        
        // 승점 보너스 (차단되지 않았을 때만)
        if (!scoreResult.blocked && rankBuff.scoreBonus > 0) {
            scoreResult.score = Math.floor(scoreResult.score * (1 + rankBuff.scoreBonus / 100));
            buffMsg += `✨ 깨달음 승점 보너스(+${rankBuff.scoreBonus}%)\n`;
        }

        // 정확도 보너스
        let adjustedWrongCount = Math.max(0, wrongCount - rankBuff.wrongCorrection);
        let accuracyRate = (type === 'boss' || type === 'mid-boss') 
            ? Math.max(0.1, (100 - (adjustedWrongCount * 5)) / 100) 
            : Math.max(0.1, (100 - (adjustedWrongCount * 10)) / 100);
        
        if (rankBuff.wrongCorrection > 0) {
            buffMsg += `👼 깨달음 오답 보정(${rankBuff.wrongCorrection}회)\n`;
        }
        
        const baseGemBeforeAccuracy = baseGem; // ★ 정확도 적용 전 값 저장
        baseGem = Math.floor(baseGem * accuracyRate);

        // 성전 보너스
        const currentCastle = castleBlueprints[myCastleLevel];
        const bonusPercent = currentCastle ? currentCastle.bonus : 0;
        let castleBonusGem = Math.floor(baseGem * (bonusPercent / 100)); 
        let totalGem = baseGem + castleBonusGem;

        // 퍼펙트 보너스
        let perfectBonus = 0;
        if (adjustedWrongCount === 0) {
            perfectBonus = Math.floor(baseGem * 0.1);
            totalGem += perfectBonus;
            if(typeof SoundEffect !== 'undefined') SoundEffect.playLevelUp(); 
            updateStats('perfect', 1);
        }

        myGems += totalGem;
        updateStats('gem_get', totalGem);
        
        if (!stageMastery[sId]) stageMastery[sId] = 0;
        stageMastery[sId]++;

        const accPercent = Math.floor(accuracyRate * 100);
        
        // 깨달음 보너스 메시지 추가
        if (buffMsg) {
            msg += buffMsg;
        }
        
        // 초회 클리어 시 상세 정보 표시
        if (!isAlreadyClearedToday) {
            msg += `\n━━━━━━━━━━━━━━━━\n`;
            
            if (type === 'mid-boss') {
                msg += `💎 초회 기본: ${baseGemBeforeAccuracy}개 (${verseCnt}절 × 10)\n`;
            } else if (type === 'boss') {
                msg += `💎 초회 기본: ${baseGemBeforeAccuracy}개 (${verseCnt}절 × 10)\n`;
            } else {
                // 일반 스테이지
                msg += `💎 초회 기본: ${baseGemBeforeAccuracy}개\n`;
            }
            
            msg += `🎯 정확도: ${accPercent}% (오답: ${adjustedWrongCount}) → ${baseGem}개\n`;
            msg += `🏰 성전 보너스: +${castleBonusGem}개\n`;
            if (perfectBonus > 0) {
                msg += `⭐ 퍼펙트 보너스: +${perfectBonus}개\n`;
            }
            msg += `✨ 승점: +${scoreResult.score}\n`;
            msg += `💎 최종 획득: ${totalGem}개`;
        } else {
            // 반복 클리어 시 기존 표시
            msg += `🎯 정확도: ${accPercent}% (오답: ${adjustedWrongCount})\n`;
            if (perfectBonus > 0) {
                msg += `(💎 퍼펙트 +${perfectBonus})\n`;
            }
            if (buffMsg) {
                msg += buffMsg;
            }
            msg += `✨ 승점: +${scoreResult.score}\n`; 
            msg += `💎 보석: +${totalGem} (성전 +${castleBonusGem})`;
        }
        if (typeof triggerConfetti === 'function') triggerConfetti();

        /* [3] 클리어 횟수 기록 (함수 맨 끝부분, alert 뜨기 전) */
    if (type === 'boss' || type === 'mid-boss') {
        updateStats('boss_kill', 1);
    } else {
        updateStats('verse_clear', 1);
    }

        alert(msg);
        updateGemDisplay(); 
        saveGameData(); 

    } catch (error) {
        console.error("클리어 처리 중 오류:", error);
        alert("오류 발생: " + error.message);
        quitGame(); 
    }
};

//[1] 구간별 보상 계산 함수 (시작/끝 지정 가능)//
function calculateProgressiveReward(chNum, count, startVerse = 1) {
    let totalGem = 0;
    let effectiveVerses = 0;
    let isReduced = false;
    
    const today = new Date().setHours(0,0,0,0);
    
    // startVerse부터 count(끝번호)까지 루프
    for (let i = startVerse; i <= count; i++) {
        const subId = `${chNum}-${i}`;
        const lastTime = stageLastClear[subId] || 0;
        const clearedDate = new Date(lastTime).setHours(0,0,0,0);
        
        if (clearedDate === today) {
            totalGem += 10;
            effectiveVerses += 0.2;
            isReduced = true;
        } else {
            totalGem += 50;
            effectiveVerses += 1.0;
        }
    }
    
    return { gem: totalGem, effectiveVerses: effectiveVerses, isReduced: isReduced };
}

/* =========================================
   [시스템: 통합 아이템 상점 (최종_완성본)]
   ========================================= */

// 일반 아이템 목록 (가격 고정)
const SHOP_ITEMS = {
    "lifeBread": { name: "생명의 떡", price: 50, desc: "체력 2칸 회복", icon: "🍞" },
    "booster": { name: "승점 부스터", price: 500, desc: "30분간 승점 2배", icon: "⚡" },
    "booster3": { name: "승점 부스터+", price: 1200, desc: "30분간 승점 3배", icon: "⚡" }
};

function getShopTodayKey() {
    return new Date().toDateString();
}

function isLifeBreadFreeAvailable() {
    const lastFreeDate = localStorage.getItem("kingsroad_free_lifebread_date");
    return lastFreeDate !== getShopTodayKey();
}

function markLifeBreadFreeUsed() {
    localStorage.setItem("kingsroad_free_lifebread_date", getShopTodayKey());
}

/* [수정] 통합 상점 구매 함수 (최종 수정판) */
function buyItem(itemType) {
    if (itemType === 'potion') itemType = 'lifeBread';
    // ------------------------------------------
    // [1] 체력 구매 (굳건한 마음) - 가격 3,000 적용
    // ------------------------------------------
    if (itemType === 'heart') {
        // 1. 최대치 제한 확인 (30칸)
        if (purchasedMaxHearts >= 30) {
            alert("더 이상 체력을 늘릴 수 없습니다 (순수 최대치 30 도달).");
            return;
        }

        // ★ 가격 계산 수정: (현재 - 4) * 3,000
        const heartPrice = (purchasedMaxHearts - 4) * 3000;

        // 2. 보석 부족 확인
        if (myGems < heartPrice) {
            alert(`💎 보석이 부족합니다! (필요: ${heartPrice})`);
            return;
        }

        // 3. 구매 진행
        if(confirm(`💎 ${heartPrice} 보석으로 [굳건한 마음]을 구매하시겠습니까?\n(최대 체력 +1 증가)`)) {
            myGems -= heartPrice;    // 보석 차감
            purchasedMaxHearts++;    // 체력 증가
            
            recalculateMaxHearts();  // 보너스 포함 최종 체력 재계산
            
            updateGemDisplay();      // UI 갱신
            updateShopUI();          // 상점 UI 갱신 (가격표 업데이트)
            saveGameData();          // 저장
            
            alert(`❤️ 최대 체력이 ${maxPlayerHearts}칸으로 늘어났습니다!`);
        }
        return; // 체력 구매 후 함수 종료
    }

    // ------------------------------------------
    // [2] 일반 아이템 (생명의 떡, 부스터) 구매
    // ------------------------------------------
    // SHOP_ITEMS에 정의된 아이템인지 확인
    const item = SHOP_ITEMS[itemType];
    if (!item) return;

    const isFreeLifeBread = (itemType === 'lifeBread') && isLifeBreadFreeAvailable();
    const price = isFreeLifeBread ? 0 : item.price;
    const confirmMsg = isFreeLifeBread
        ? `오늘 무료 1회로 [${item.name}]을 구매하시겠습니까?`
        : `💎 ${price} 보석으로 [${item.name}]을 구매하시겠습니까?`;

    // 가격 확인
    if (price > 0 && myGems < price) {
        alert("💎 보석이 부족합니다!");
        return;
    }

    // 구매 진행
    if(confirm(confirmMsg)) {
        if (price > 0) myGems -= price;

        // 부스터는 즉시 사용, 나머지는 인벤토리에 추가
        if (itemType === 'booster') {
            activateBooster(2, 30); // 2배, 30분
        } else if (itemType === 'booster3') {
            activateBooster(3, 30); // 3배, 30분
        } else {
            if (!inventory) inventory = {};
            inventory[itemType] = (inventory[itemType] || 0) + 1;
            alert(`✅ [${item.name}] 구매 완료! (보유: ${inventory[itemType]}개)`);
        }

        if (isFreeLifeBread) {
            markLifeBreadFreeUsed();
        }
        
        updateGemDisplay();
        updateShopUI();
        saveGameData();
        updateResourceUI();
        if (typeof updateNotificationBadges === 'function') updateNotificationBadges();
    }
}

/* [수정] 상점 UI 업데이트 (오류 수정됨) */
updateShopUI = function() {
    let shopScreen = document.getElementById('shop-screen');
    if (!shopScreen) {
        // 화면 생성 로직 (기존과 동일)
        shopScreen = document.createElement('div');
        shopScreen.id = 'shop-screen';
        shopScreen.className = 'screen';
        shopScreen.innerHTML = `
            <div class="map-header" style="justify-content: center;">
                <div style="font-weight:bold; font-size:1.3rem;">보급소</div>
            </div>
            <div class="shop-list" style="flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 20px;"></div>
            <div class="button-area-static">
                <button class="btn-gray btn-back" onclick="goMap()">돌아가기</button>
            </div>
        `;
        document.body.appendChild(shopScreen);
    }

    const list = shopScreen.querySelector('.shop-list');
    list.innerHTML = ""; 

    // [굳건한 마음] 가격 계산 수정
    const heartPrice = (purchasedMaxHearts - 4) * 3000;
    const isMax = purchasedMaxHearts >= 30;
    
    const heartDiv = document.createElement('div');
    heartDiv.className = 'shop-item';
    heartDiv.style.cssText = "background:white; padding:15px; border-radius:15px; display:flex; align-items:center; color:black; box-shadow:0 2px 5px rgba(0,0,0,0.1); margin-bottom:10px;";
    heartDiv.innerHTML = `
        <div style="font-size:2.5rem; margin-right:15px;">❤️</div>
        <div style="flex:1;">
            <div style="font-weight:bold; font-size:1.1rem;">굳건한 마음</div>
            <div style="font-size:0.8rem; color:#7f8c8d;">최대 체력 영구 증가</div>
            <div style="color:#e67e22; font-weight:bold; margin-top:5px;">${isMax ? "품절 (MAX)" : `💎 ${heartPrice}`}</div>
        </div>
        <button onclick="buyItem('heart')" style="background:${isMax?'#95a5a6':'#2ecc71'}; border:none; color:white; padding:8px 15px; border-radius:20px; font-weight:bold; cursor:${isMax?'default':'pointer'};" ${isMax?'disabled':''}>${isMax ? "완료" : "구매"}</button>
    `;
    list.appendChild(heartDiv);

    // [일반 아이템]
    ['lifeBread', 'booster', 'booster3'].forEach(key => {
        const item = SHOP_ITEMS[key];
        const count = (inventory && inventory[key]) ? inventory[key] : 0;
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.style.cssText = "background:white; padding:15px; border-radius:15px; display:flex; align-items:center; color:black; box-shadow:0 2px 5px rgba(0,0,0,0.1); margin-bottom:10px;";
        const isFreeLifeBread = (key === 'lifeBread') && isLifeBreadFreeAvailable();
        const priceText = isFreeLifeBread ? "무료 1회" : `💎 ${item.price}`;
        
        let countHtml = (key === 'booster' || key === 'booster3') ? '' : `<div style="font-size:0.8rem; color:#2ecc71; font-weight:bold;">보유: ${count}개</div>`;

        const buttonText = (key === 'lifeBread' && isFreeLifeBread) ? "무료" : "구매";

        div.innerHTML = `
            <div style="font-size:2.5rem; margin-right:15px;">${item.icon}</div>
            <div style="flex:1;">
                <div style="font-weight:bold; font-size:1.1rem;">${item.name}</div>
                <div style="font-size:0.8rem; color:#7f8c8d;">${item.desc}</div>
                <div style="color:#e67e22; font-weight:bold; margin-top:5px;">${priceText}</div>
                ${countHtml}
            </div>
            <button onclick="buyItem('${key}')" style="background:#f1c40f; border:none; color:#2c3e50; padding:8px 15px; border-radius:20px; font-weight:bold; cursor:pointer;">${buttonText}</button>
        `;
        list.appendChild(div);
    });

    if (typeof updateNotificationBadges === 'function') updateNotificationBadges();
};

// 3. 전투 중 아이템 사용 함수
function useBattleItem(itemType) {
    if (itemType === 'potion') itemType = 'lifeBread';
    if (!inventory || !inventory[itemType] || inventory[itemType] <= 0) {
        alert("아이템이 없습니다! 보급소에서 구매하세요.");
        return;
    }

    if (itemType === "lifeBread") {
        if (playerHearts >= maxPlayerHearts) {
            alert("이미 체력이 가득 찼습니다!");
            return;
        }
        playerHearts = Math.min(playerHearts + 2, maxPlayerHearts); // 2칸 회복
        inventory[itemType]--;
        updateResourceUI();
        alert("🍞 생명의 떡을 먹었습니다! (체력 +2)");
    }

    saveGameData();
    updateBattleUI(); // 화면 갱신
}

/* =========================================
   [시스템: 뒤로가기 방지 및 종료 팝업]
   ========================================= */

// 1. 뒤로가기 키 감지 ("납치" 설정)
window.addEventListener('load', function() {
    // 페이지 로드 시 가짜 히스토리를 하나 쌓음
    history.pushState(null, null, location.href);
    
    window.onpopstate = function(event) {
        // 게임 화면(전투 중)일 때만 막음
        const gameScreen = document.getElementById('game-screen');
        
        if (gameScreen.classList.contains('active')) {
            // 뒤로가기를 누르면 히스토리가 빠지므로, 다시 채워넣어서 "못 나가게" 막음
            history.pushState(null, null, location.href);
            
            // 종료 팝업 띄우기
            openQuitModal();
        } else {
            // 게임 중이 아닐 때(홈, 맵 등)는
            // 여기서 앱을 종료할지, 아니면 그냥 둘지 결정할 수 있습니다.
            // 일단은 홈 화면 등에서는 뒤로가기가 작동하지 않게 막거나(동일 로직),
            // 별도 처리를 안 하면 브라우저 기본 동작을 따릅니다.
            // (모바일 웹앱 특성상 계속 머무르게 하려면 아래 줄 유지)
            history.pushState(null, null, location.href);
        }
    };
});

// 2. 팝업 열기
function openQuitModal() {
    document.getElementById('quit-modal').classList.add('active');
}

// 3. [계속하기] 버튼: 팝업 닫고 게임 계속
function cancelQuit() {
    document.getElementById('quit-modal').classList.remove('active');
}

// 4. [나가기] 버튼: 진짜로 나감
function confirmQuit() {
    document.getElementById('quit-modal').classList.remove('active');
    
    // 오답 처리를 할지, 그냥 나갈지는 왕의 선택입니다.
    // 여기서는 "포기"로 간주하고 맵으로 이동시킵니다.
    quitGame(); 
}

/* =========================================
   [Step 3: 바이블 타워 게임 로직 (속도/스크롤 개선판)]
   ========================================= */
let towerGame = {
    words: [],
    idx: 0,
    interval: null,
    pos: 50,
    dir: 1, 
    speed: 0.8,    // [수정] 시작 속도 낮춤 (너무 빠르지 않게)
    stackHeight: 0
};

// 타워 게임 초기화
function initTowerGame() {
    towerGame.words = [...trainingVerseData.chunks];
    towerGame.idx = 0;
    towerGame.stackHeight = 0;
    towerGame.speed = 0.8; 
    
    // 1. 이전 잔여물 제거 및 위치 초기화
    const stackArea = document.getElementById('tower-stack-area');
    const base = document.getElementById('tower-base');
    const textDisplay = document.getElementById('tower-text-display'); // [NEW]
    
    if(stackArea) {
        stackArea.innerHTML = "";
        stackArea.style.transform = "translateY(0px)"; 
    }
    if(base) {
        base.style.transform = "translateX(-50%) translateY(0px)"; 
    }

    // 2. [NEW] 말씀 기록판(빈칸) 미리 만들기
    if (textDisplay) {
        textDisplay.innerHTML = "";
        towerGame.words.forEach((word, index) => {
            const span = document.createElement('span');
            span.innerText = word;
            span.className = 'tower-word-slot'; // 기본 흐릿한 상태
            span.id = `tower-word-${index}`; // 나중에 찾기 위해 ID 부여
            textDisplay.appendChild(span);
        });
    }
    
    // 3. 게임 시작
    spawnTowerBlock();
}



function spawnTowerBlock() {
    const movingBlock = document.getElementById('moving-block');
    if (!movingBlock) return;

    // 모든 단어 완료 체크
    if (towerGame.idx >= towerGame.words.length) {
        document.getElementById('tower-msg').innerText = "🎉 성벽 건축 완료!";
        document.getElementById('tower-msg').style.color = "#f1c40f";
        movingBlock.style.display = "none";
        
        setTimeout(() => {
            nextStep(); 
        }, 1500);
        return;
    }

    // 블록 세팅
    movingBlock.innerText = towerGame.words[towerGame.idx];
    movingBlock.style.display = "flex";
    
    // [확인] CSS에서 top: 30%로 잡았지만, JS에서 덮어쓰지 않도록 주의하거나 명시적으로 지정
    movingBlock.style.top = "30%"; 
    
    movingBlock.style.backgroundColor = "#e74c3c";
    
    // 위치 및 방향 초기화
    towerGame.pos = Math.random() * 80 + 10; 
    towerGame.dir = Math.random() > 0.5 ? 1 : -1;
    
    towerGame.speed = 0.8 + (towerGame.idx * 0.05); 

    if (towerGame.interval) clearInterval(towerGame.interval);
    towerGame.interval = setInterval(moveTowerBlock, 16); 
}

// 블록 움직임 처리 (기존과 동일)
function moveTowerBlock() {
    towerGame.pos += towerGame.speed * towerGame.dir;
    if (towerGame.pos > 90 || towerGame.pos < 10) {
        towerGame.dir *= -1;
    }
    const block = document.getElementById('moving-block');
    if(block) {
        block.style.left = towerGame.pos + "%";
        block.style.transform = "translateX(-50%)";
    }
}

// 블록 떨어뜨리기
function dropTowerBlock() {
    if (!towerGame.interval) return;

    clearInterval(towerGame.interval);
    towerGame.interval = null;

    const movingBlock = document.getElementById('moving-block');
    const stackArea = document.getElementById('tower-stack-area');
    const base = document.getElementById('tower-base');

    // 판정 로직
    const blockRect = movingBlock.getBoundingClientRect();
    
    let targetRect;
    const lastStacked = stackArea.lastElementChild;
    if (lastStacked) {
        targetRect = lastStacked.getBoundingClientRect();
    } else {
        targetRect = base.getBoundingClientRect();
    }

    const overlap = !(blockRect.right < targetRect.left || blockRect.left > targetRect.right);

    if (overlap) {
        // [성공]
        SoundEffect.playClick();
        
        // 1. 블록 쌓기 (기존 로직)
        const stacked = document.createElement('div');
        stacked.className = 'stacked-block';
        stacked.innerText = movingBlock.innerText;
        stacked.style.left = towerGame.pos + "%";
        stacked.style.transform = "translateX(-50%)";
        stacked.style.width = movingBlock.offsetWidth + "px";
        
        // CSS 상 블록 높이 40px
        stacked.style.bottom = (20 + (towerGame.stackHeight * 40)) + "px";
        stackArea.appendChild(stacked);
        
        // 2. [NEW] 상단 기록판 업데이트 (빈칸 채우기!)
        const wordSlot = document.getElementById(`tower-word-${towerGame.idx}`);
        if (wordSlot) {
            wordSlot.classList.add('active'); // 황금색으로 빛나게 변경
            // 스크롤이 필요하면 해당 단어로 이동
            wordSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        towerGame.stackHeight++;
        towerGame.idx++;

        // 3. 스크롤 효과 (기존 로직)
        // 화면 중앙(약 5~6개)을 넘어가면 내리기 시작
        if (towerGame.stackHeight > 4) {
            const scrollOffset = (towerGame.stackHeight - 4) * 40; 
            stackArea.style.transform = `translateY(${scrollOffset}px)`;
            base.style.transform = `translateX(-50%) translateY(${scrollOffset}px)`;
        }
        
        setTimeout(spawnTowerBlock, 400);
        
    } else {
        // [실패]
        SoundEffect.playWrong();
        // 실패 연출은 동일
        movingBlock.style.transition = "top 0.5s ease-in";
        movingBlock.style.top = "100%"; 
        movingBlock.style.backgroundColor = "#95a5a6";
        
        document.getElementById('tower-msg').innerText = "빗나갔습니다. 다시 시도!";
        
        setTimeout(() => {
            movingBlock.style.transition = "none"; 
            document.getElementById('tower-msg').innerText = "화면을 터치하여 블록을 떨어뜨리세요";
            spawnTowerBlock();
        }, 1000);
    }
}

// [Step 4: 예언의 두루마리 게임 상태 변수]
let scrollGame = {
    animId: null,
    speed: 1.5,
    pos: 0,
    blanks: [],
    nextBlankIdx: 0,
    isOver: false,
    isColliding: false
};

/* [시스템: 성전 화면 업데이트 (과거 보기 기능 추가됨)] */
function updateCastleView() {
    // 1. 뷰어 초기화 (게임 켰을 때 한 번만 내 레벨로 동기화)
    if (viewingCastleLevel === -1) viewingCastleLevel = myCastleLevel;

    // 만약 업그레이드 직후라면, 뷰어도 최신 레벨로 갱신
    // (이 줄을 지우면 업그레이드 후에도 보고 있던 레벨이 유지됩니다)
    if (viewingCastleLevel > myCastleLevel) viewingCastleLevel = myCastleLevel;

    const display = document.getElementById('castle-display');
    if (!display) return;

    // 2. 현재 '보고 있는' 레벨의 데이터 가져오기
    const viewBP = castleBlueprints[viewingCastleLevel];
    
    // 3. 실제 내 레벨(myCastleLevel)의 다음 단계 데이터 (건설 버튼용)
    const currentBP = castleBlueprints[myCastleLevel]; 
    const nextBP = castleBlueprints[myCastleLevel + 1];

    // 방치 보상 계산 (실제 레벨 기준)
    const now = Date.now();
    const elapsedSeconds = (now - lastClaimTime) / 1000;
    let produced = Math.floor((currentBP.prod / 3600) * elapsedSeconds);
    if (produced > currentBP.cap) produced = currentBP.cap;
    if (produced < 0) produced = 0;

    // 이미지 태그 생성
    const imgTag = viewBP.img ? 
        `<img src="images/${viewBP.img}" alt="${viewBP.name}" style="width:100%; height:100%; object-fit:cover; transition: filter 0.3s;" onerror="this.style.display='none';">` : '';

    // ★ 과거 회상 중인지 확인
    const isPast = viewingCastleLevel < myCastleLevel;
    const filterClass = isPast ? 'memory-filter' : ''; // 과거면 필터 클래스 추가

    // ===============================================
    // [버튼 로직]
    // ===============================================
    
    // 1. 왼쪽 (수거) 버튼: 과거를 보고 있어도 '수거'는 가능하게 하거나, 
    //    헷갈리지 않게 '현재 레벨 보기' 버튼으로 바꿀 수 있습니다.
    //    여기서는 "과거를 볼 땐 수거 버튼 숨김" 처리하여 깔끔하게 합니다.
    let leftBtnHTML = `<div style="width:50px; height:50px;"></div>`; 
    
    if (!isPast && currentBP.prod > 0) { // 현재 시점일 때만 수거 버튼 표시
        if (produced > 0) {
            leftBtnHTML = `
                <button onclick="claimTempleSupply()" class="btn-pulse" style="width:50px; height:50px; border-radius:10px; border:none; background:#2ecc71; color:#fff; cursor:pointer; padding:0; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 3px 0 #27ae60;">
                    <div style="font-size:1.2rem;">💎</div>
                    <div style="font-size:0.6rem; font-weight:bold;">GET</div>
                </button>`;
        } else {
            leftBtnHTML = `
                <button disabled style="width:50px; height:50px; border-radius:10px; border:none; background:#34495e; color:#bdc3c7; padding:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="font-size:1.2rem;">⏳</div>
                </button>`;
        }
    } else if (isPast) {
         // 과거 회상 중일 때 왼쪽 버튼 위치에 '현재로 복귀' 아이콘 표시 (선택사항)
         leftBtnHTML = `
            <button onclick="viewingCastleLevel = myCastleLevel; updateCastleView();" style="width:50px; height:50px; border-radius:10px; border:1px dashed rgba(255,255,255,0.3); background:rgba(0,0,0,0.2); color:#bdc3c7; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                <div style="font-size:1.2rem;">🔙</div>
            </button>`;
    }

    // 2. 오른쪽 (건설) 버튼: 과거를 보고 있으면 '업그레이드' 버튼 숨김 (실수 방지)
    let rightBtnHTML = `<div style="width:50px; height:50px;"></div>`; 

    if (!isPast && myCastleLevel < 11) {
        if (myGems < nextBP.cost) {
            rightBtnHTML = `
                <button style="width:50px; height:50px; border-radius:10px; border:none; background:#34495e; color:#7f8c8d; padding:0; display:flex; flex-direction:column; align-items:center; justify-content:center; border-bottom:3px solid #2c3e50;">
                    <div style="font-size:1rem;">🔒</div>
                    <div style="font-size:0.55rem; margin-top:2px;">${nextBP.cost.toLocaleString()}</div>
                </button>`;
        } else {
            rightBtnHTML = `
                <button onclick="upgradeCastle()" class="btn-pulse" style="width:50px; height:50px; border-radius:10px; border:none; background:#e67e22; color:#fff; cursor:pointer; padding:0; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 3px 0 #d35400;">
                    <div style="font-size:1.2rem;">🔨</div>
                    <div style="font-size:0.6rem; font-weight:bold;">UP</div>
                </button>`;
        }
    } else if (isPast) {
        // 과거를 보고 있을 땐 빈 공간 (또는 설명)
        rightBtnHTML = `<div style="width:50px; height:50px; display:flex; align-items:center; justify-content:center; font-size:1.5rem; opacity:0.3;">🔒</div>`;
    }

    // 3. 네비게이션 화살표 상태
    const prevDisabled = (viewingCastleLevel <= 0) ? 'disabled' : '';
    const nextDisabled = (viewingCastleLevel >= myCastleLevel) ? 'disabled' : ''; // 내 레벨보다 미래는 못 봄

    // 과거 뷰일 때 화면 내부에 표시할 배지 HTML (의사요소 대신 사용)
    const pastBadgeHTML = isPast ? `<div class="past-badge">🕰️ 과거의 기록</div>` : '';

    // [HTML 조립]
    display.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; gap:15px; width:100%;">
            <button class="castle-nav-btn" ${prevDisabled} onclick="changeViewLevel(-1)">‹</button>

            <div style="text-align:center;">
                <div style="font-size: 1.2rem; font-weight: bold; color: ${isPast ? '#bdc3c7' : '#f1c40f'}; margin-top:3px; margin-bottom:2.5px; transition:color 0.3s;">
                    Lv.${viewBP.level} ${viewBP.name}
                </div>

                <div class="castle-frame ${filterClass}" style="width: 220px; height: 220px; position: relative;">
                    ${imgTag}
                    ${pastBadgeHTML}
                    <div class="frame-center-decor"></div>
                </div>
            </div>

            <button class="castle-nav-btn" ${nextDisabled} onclick="changeViewLevel(1)">›</button>
        </div>

        <div style="font-size: 0.85rem; color: #bdc3c7; margin-top: 3px; margin-bottom: 3px; font-style: italic; min-height:3em;">
            "${viewBP.desc}"
        </div>

        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-top:1px; width:95%; max-width:320px; margin-left:auto; margin-right:auto;">
            ${leftBtnHTML}

            <div style="flex:1; background:rgba(0,0,0,0.4); border-radius:10px; border:1px solid rgba(255,255,255,0.1); height:50px; display:flex; flex-direction:column; justify-content:center; align-items:center;">
                <div style="font-size: 0.9rem; color:#fff; font-weight:bold;">
                    💎 <span style="color:#f1c40f;">${produced}</span> / ${currentBP.cap}
                </div>
                <div style="font-size: 0.7rem; color: #95a5a6;">
                    ⚡${currentBP.prod}/H <span style="color:#2ecc71;">(+${currentBP.bonus}%)</span>
                </div>
            </div>

            ${rightBtnHTML}
        </div>
    `;
}

// [추가] 뷰어 레벨 변경 함수
function changeViewLevel(delta) {
    const nextLvl = viewingCastleLevel + delta;
    
    // 범위 체크 (0보다 작거나, 내가 가진 레벨보다 높으면 이동 불가)
    if (nextLvl < 0 || nextLvl > myCastleLevel) return;
    
    viewingCastleLevel = nextLvl;
    
    // 효과음 (찰칵 소리나 부드러운 클릭음 추천)
    if(typeof SoundEffect !== 'undefined') SoundEffect.playClick();
    
    updateCastleView();
}

/* [시스템: 성전 기능 작동 함수] */

// 1. 성전 건축하기
function upgradeCastle() {
    if (myCastleLevel >= 11) { alert("이미 하나님 나라가 완성되었습니다!"); return; }
    
    const nextLevel = myCastleLevel + 1;
    const nextBP = castleBlueprints[nextLevel];
    
    if (myGems >= nextBP.cost) {
        if (!confirm(`보석 ${nextBP.cost}개를 사용하여\n[Lv.${nextLevel} ${nextBP.name}]을(를) 건축하시겠습니까?`)) return;

        myGems -= nextBP.cost;
        myCastleLevel++; 
        
        // [★추가] 업그레이드 즉시 최신 모습을 보여주기 위해 뷰어 갱신
        viewingCastleLevel = myCastleLevel; 

        updateStats('castle_levelup', myCastleLevel);

        if(typeof SoundEffect !== 'undefined') SoundEffect.playLevelUp();
        
        alert(`🎉 건축 완료!\n\n[Lv.${myCastleLevel} ${nextBP.name}]\n"${nextBP.desc}"`);
        
        updateGemDisplay();
        updateCastleView(); // 화면 갱신
        saveGameData();
    } else {
        alert(`보석이 부족합니다.\n(필요: ${nextBP.cost}개 / 보유: ${myGems}개)`);
    }
}

// 2. 보석 수거하기
function claimTempleSupply() {
    const currentBP = castleBlueprints[myCastleLevel];
    if (currentBP.prod === 0) return; 

    const now = Date.now();
    const elapsedHours = (now - lastClaimTime) / (1000 * 60 * 60);
    let pending = Math.floor(elapsedHours * currentBP.prod);
    
    if (pending > currentBP.cap) pending = currentBP.cap;
    if (pending <= 0) return;
    
    myGems += pending;
    lastClaimTime = now; 
    
    if(typeof SoundEffect !== 'undefined') SoundEffect.playGetGem();
    alert(`💎 성전 공급 보석 ${pending}개를 수거했습니다!`);
    
    updateCastleView(); // 화면 갱신
    updateResourceUI();
    saveGameData();
}

/* ========================================
   [정식 배포 버전 - 치트키 제거됨]
   ======================================== */

// [변경] 두루마리 게임 빨리 감기/어르신 모드 토글 동작
function toggleScrollFastMode(btn) {
    if (!scrollGame.isSlowMode) {
        // 어르신 모드로 전환
        scrollGame.isSlowMode = true;
        scrollGame.speed = 0.6;
        btn.innerHTML = '🐇 빨리 감기';
        btn.style.borderColor = '#e67e22';
        btn.style.color = '#e67e22';
        alert('어르신 모드(느린 속도)로 전환되었습니다.');
    } else {
        // 기존(빠른) 속도로 전환
        scrollGame.isSlowMode = false;
        scrollGame.speed = 1.5;
        btn.innerHTML = '🐢 어르신 모드';
        btn.style.borderColor = '#27ae60';
        btn.style.color = '#27ae60';
        alert('빠른 속도로 전환되었습니다.');
    }
}

/* =========================================
   [Step 4] 예언의 두루마리 게임 로직 (NEW)
   ========================================= */
function startScrollStep() {
    scrollGame.isOver = false;
    scrollGame.nextBlankIdx = 0;
    
    // [수정] 속도 설정 (느린 모드 체크)
    if (scrollGame.isSlowMode) {
        scrollGame.speed = 0.6; // 아주 느리게
    } else {
        scrollGame.speed = 1.5; // 기존 빠른 속도
    }

    const track = document.getElementById('scroll-track');
    const deck = document.getElementById('scroll-deck');
    const container = document.getElementById('scroll-game-container');

    if(!track || !container) return;

    // 1. 위치 초기화 (오른쪽 끝)
    scrollGame.pos = container.offsetWidth;
    track.style.left = scrollGame.pos + "px";

    // 2. 단어 및 빈칸 생성
    const words = trainingVerseData.chunks;
    const totalWords = words.length;

    // [개선] 전체의 최대 2/3까지만 빈칸으로 설정 (즉, 최소 1/3은 보여줌)
    const maxBlankCount = Math.floor(totalWords * (2 / 3));
    
    // 일단 모든 인덱스를 담은 후보 배열 생성
    let candidates = words.map((_, i) => i);
    
    // 긴 단어(3글자 이상)를 우선적으로 빈칸 후보로 올리기 위해 셔플
    candidates.sort(() => Math.random() - 0.5);

    const blankIndices = [];
    
    for (let i of candidates) {
        const word = words[i];
        
        // 조건 1: 빈칸 개수가 전체의 2/3를 넘지 않아야 함
        if (blankIndices.length < maxBlankCount) {
            // 조건 2: 확률(60%)이거나 단어가 길 때 (기존 로직 유지하되 한도 제한)
            if (Math.random() > 0.4 || word.length > 2) {
                blankIndices.push(i);
            }
        }
    }

    // 화면 순서대로 정렬
    blankIndices.sort((a, b) => a - b);
    scrollGame.blanks = blankIndices;

    track.innerHTML = "";
    words.forEach((word, idx) => {
        const node = document.createElement('div');
        node.className = 'scroll-node';
        node.innerText = word;
        node.dataset.idx = idx;

        if (blankIndices.includes(idx)) {
            node.classList.add('scroll-blank');
            
            // ★ [핵심 수정] "???" 대신 초성 함수 사용!
            node.innerText = getChosung(word); 
            
            node.dataset.answer = word;
        }
        track.appendChild(node);
    });

    // 3. 정답 카드 생성
    deck.innerHTML = "";
    const answers = blankIndices.map(i => words[i]);
    const shuffled = [...answers].sort(() => Math.random() - 0.5);

    shuffled.forEach(word => {
        const btn = document.createElement('div');
        btn.className = 'word-block';
        btn.innerText = word;
        btn.onclick = () => handleScrollCardClick(btn, word);
        deck.appendChild(btn);
    });

    // 4. 애니메이션 시작
    if (scrollGame.animId) cancelAnimationFrame(scrollGame.animId);
    scrollGameLoop();
}

function scrollGameLoop() {
    if (scrollGame.isOver) return;

    // 이동
    scrollGame.pos -= scrollGame.speed;
    const track = document.getElementById('scroll-track');
    if(track) track.style.left = scrollGame.pos + "px";

    // 충돌 체크
    checkScrollCollision();

    // 반복
    scrollGame.animId = requestAnimationFrame(scrollGameLoop);
}

function checkScrollCollision() {
    const deadline = 60; // 불타는 선 위치
    const nodes = document.querySelectorAll('.scroll-node');

    // 타겟(다음 빈칸) 찾기
    const targetIdx = scrollGame.blanks[scrollGame.nextBlankIdx];

    // [상황 A] 성공 체크 (그대로 유지)
    if (targetIdx === undefined) {
        // ... (기존 성공 로직 유지) ...
        const lastNode = nodes[nodes.length-1];
        if(!lastNode) return;
        const rect = lastNode.getBoundingClientRect();
        const container = document.getElementById('scroll-game-container');
        
        if (rect.right < container.getBoundingClientRect().left) {
            scrollGame.isOver = true;
            cancelAnimationFrame(scrollGame.animId);
            if(typeof nextStep === 'function') nextStep(); 
        }
        return;
    }

    // [상황 B] 충돌 체크
    const targetNode = nodes[targetIdx];
    const rect = targetNode.getBoundingClientRect();
    const container = document.getElementById('scroll-game-container');
    const nodeLeftRel = rect.left - container.getBoundingClientRect().left; // 화면상 빈칸의 위치

    // 데드라인을 넘었는데 아직 정답을 못 맞췄다면?
    if (nodeLeftRel < deadline && targetNode.classList.contains('scroll-blank') && !targetNode.classList.contains('filled')) {
        
        // -------------------------------------------------------------
        // 🔥 [수정됨] 무적 시간(Cooldown) 체크 추가
        // 연속으로 다다닥 깎이는 것을 막기 위해 '충돌 중' 상태면 무시
        if (scrollGame.isColliding) return; 
        scrollGame.isColliding = true; // 충돌 상태 ON
        // -------------------------------------------------------------

        // 1. 체력 감소
        if(typeof playerHearts !== 'undefined') {
            playerHearts--;
            wrongCount++;
            if(typeof updateBattleUI === 'function') updateBattleUI();
        }

        // 2. 연출
        showDamageEffect();
        if(typeof SoundEffect !== 'undefined') SoundEffect.playWrong();

        // 3. ★ [핵심 수정] 절대 좌표 계산으로 밀어내기 ★
        // 논리: (트랙의 왼쪽 위치 + 빈칸의 트랙 내 위치) = 화면상 빈칸 위치
        // 우리가 원하는 것: 화면상 빈칸 위치 = 데드라인 + 250px (안전거리)
        // 따라서: 트랙의 왼쪽 위치 = (데드라인 + 250px) - 빈칸의 트랙 내 위치
        
        const safeDistance = 250; // 데드라인 뒤로 250px만큼 확실하게 밉니다
        const nodeOffset = targetNode.offsetLeft; // 트랙 시작점부터 빈칸까지의 거리
        
        // 트랙의 새로운 위치 강제 지정
        scrollGame.pos = (deadline + safeDistance) - nodeOffset;
        
        const track = document.getElementById('scroll-track');
        track.style.transition = "left 0.2s cubic-bezier(0.25, 1, 0.5, 1)"; // 튕겨나가는 애니메이션
        track.style.left = scrollGame.pos + "px";
        
        // -------------------------------------------------------------
        // 4. 충돌 상태 해제 (0.5초 뒤)
        // 밀려나는 애니메이션이 끝날 때쯤 다시 충돌 감지를 켭니다.
        setTimeout(() => { 
            track.style.transition = "none"; 
            scrollGame.isColliding = false; // 충돌 상태 OFF
        }, 500);
        // -------------------------------------------------------------

        // 5. 게임 오버 체크
        if (typeof playerHearts !== 'undefined' && playerHearts <= 0) {
            scrollGame.isOver = true;
            cancelAnimationFrame(scrollGame.animId);
            if(typeof showReviveModal === 'function') setTimeout(showReviveModal, 100);
        }
    }
}

function handleScrollCardClick(btn, word) {
    if (scrollGame.isOver) return;

    const targetIdx = scrollGame.blanks[scrollGame.nextBlankIdx];
    if (targetIdx === undefined) return;

    const nodes = document.querySelectorAll('.scroll-node');
    const targetNode = nodes[targetIdx];
    const correctWord = targetNode.dataset.answer;

    if (word === correctWord) {
        // 정답 로직 (기존과 동일)
        if(typeof SoundEffect !== 'undefined') SoundEffect.playCorrect();
        targetNode.classList.add('filled');
        targetNode.innerText = correctWord;
        btn.style.visibility = 'hidden';
        scrollGame.nextBlankIdx++;
        
        if (scrollGame.nextBlankIdx >= scrollGame.blanks.length) scrollGame.speed = 15;

    } else {
        // [오답 로직 수정됨]
        if(typeof playerHearts !== 'undefined') {
            playerHearts--;
            wrongCount++;
            if(typeof updateBattleUI === 'function') updateBattleUI();
        }

        // ★ 오답 시에도 하트 연출 추가
        showDamageEffect();
        if(typeof SoundEffect !== 'undefined') SoundEffect.playWrong();
        
        btn.style.backgroundColor = "#e74c3c";
        setTimeout(() => btn.style.backgroundColor = "#ecf0f1", 300);

        if (typeof playerHearts !== 'undefined' && playerHearts <= 0) {
            scrollGame.isOver = true;
            cancelAnimationFrame(scrollGame.animId);
            if(typeof showReviveModal === 'function') setTimeout(showReviveModal, 100);
        }
    }
}

// [하트 감소 연출 함수]
function showDamageEffect() {
    // 1. 하트 요소 생성
    const el = document.createElement('div');
    el.innerText = "💔"; // 깨진 하트 (혹은 그냥 ❤️)
    el.className = "damage-heart-effect";
    document.body.appendChild(el);

    // 2. 화면 흔들림 효과 (게임 컨테이너에)
    const container = document.getElementById('scroll-game-container');
    if(container) {
        container.classList.add('shake-screen-hard');
        setTimeout(() => container.classList.remove('shake-screen-hard'), 500);
    }

    // 3. 1.5초 뒤에 하트 요소 삭제 (메모리 정리)
    setTimeout(() => {
        if(el && el.parentNode) el.parentNode.removeChild(el);
    }, 1500);
}

// [수정] 초기 실행 순서 변경
        loadGameData();     // 1. 장부(데이터)를 먼저 꺼내고
        renderChapterMap(); // 2. 그 내용을 바탕으로 지도를 그림
        updateCastleView(); // 3. 성전 모습 업데이트

/* =========================================
   [시스템: 어르신 맞춤형 백업 (카톡 공유)]
   ========================================= */

function openDataSettings() {
    let modal = document.getElementById('data-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'data-modal';
        modal.className = 'modal-overlay';
        modal.style.zIndex = "9999";
        modal.innerHTML = `
            <div class="result-card" style="max-width:350px; text-align:left; background:white; color:#2c3e50;">
                <div class="result-header" style="font-size:1.4rem; text-align:center; color:#2c3e50; margin-bottom:5px;">
                    💾 데이터 보관함
                </div>
                
                <div style="margin-bottom:20px; padding:15px; background:#fef9e7; border-radius:10px; border:1px solid #f1c40f;">
                    <h3 style="color:#d35400; margin:0 0 5px 0; font-size:1.1rem;">📤 기록 보관하기</h3>
                    <p style="font-size:0.9rem; color:#7f8c8d; margin-bottom:10px;">
                        내 게임 기록을 <b>카카오톡</b>이나 <b>문자</b>로<br>가족에게 보내두세요. (가장 안전합니다)
                    </p>
                    <button onclick="shareSaveCode()" style="width:100%; background:#f39c12; color:white; border:none; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:1rem; box-shadow:0 3px 0 #d35400;">
                        🎁 카톡/문자로 기록 보내기
                    </button>
                </div>

                <div style="margin-bottom:20px; padding:15px; background:#e8f8f5; border-radius:10px; border:1px solid #2ecc71;">
                    <h3 style="color:#27ae60; margin:0 0 5px 0; font-size:1.1rem;">📥 기록 가져오기</h3>
                    <p style="font-size:0.9rem; color:#7f8c8d; margin-bottom:10px;">
                        보관해둔 긴 영어 코드를 복사해서<br>아래 버튼을 눌러 붙여넣으세요.
                    </p>
                    <button onclick="importSaveCode()" style="width:100%; background:#27ae60; color:white; border:none; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:1rem; box-shadow:0 3px 0 #1e8449;">
                        📝 기록 붙여넣기
                    </button>
                </div>

                <button onclick="document.getElementById('data-modal').style.display='none'" style="width:100%; background:#95a5a6; color:white; border:none; padding:12px; border-radius:30px; cursor:pointer; font-weight:bold;">
                    확인
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
}

// [기능 1] 공유하기 (Share API)
function shareSaveCode() {
    saveGameData(); // 저장
    const rawData = localStorage.getItem('kingsRoadSave');
    
    if (!rawData) { alert("저장할 기록이 없습니다."); return; }

    try {
        // 데이터를 안전한 코드로 변환
        const code = btoa(encodeURIComponent(rawData));
        const shareData = {
            title: "킹스로드 구원 기록",
            text: code
        };

        // ★ 핵심: 스마트폰의 '공유하기' 창을 띄웁니다 (카톡, 문자 등 선택 가능)
        if (navigator.share) {
            navigator.share(shareData)
                .then(() => console.log('공유 성공'))
                .catch((error) => console.log('공유 취소', error));
        } else {
            // PC 등 공유 기능이 없는 경우 -> 클립보드 복사로 대체
            copyToClipboard(code);
        }
    } catch (e) {
        console.error(e);
        alert("오류가 발생했습니다.");
    }
}

// (보조) 클립보드 복사 함수 (공유 기능 미지원 기기용)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("📋 기록 코드가 복사되었습니다!\n카카오톡을 열고 '붙여넣기' 해서 보관하세요.");
    }).catch(() => {
        prompt("아래 코드를 전체 복사(Ctrl+A)하세요:", text);
    });
}

// [기능 2] 불러오기 (Import)
function importSaveCode() {
    const code = prompt("카톡/문자에 보관해둔 코드를\n여기에 '붙여넣기' 하세요:");
    
    if (!code) return; 

    try {
        const jsonString = decodeURIComponent(atob(code));
        const parsedData = JSON.parse(jsonString);
        
        if (parsedData.gems === undefined) throw new Error("데이터 없음");

        if (confirm("⚠️ 현재 진행 상황을 지우고,\n입력한 기록으로 되돌리시겠습니까?")) {
            localStorage.setItem('kingsRoadSave', jsonString);
            alert("✅ 기록 복원 완료!\n게임을 다시 시작합니다.");
            location.reload();
        }
    } catch (e) {
        alert("❌ 코드가 잘못되었습니다.\n전체 코드를 빠짐없이 복사했는지 확인해주세요.");
    }
}

// 화면에 이름과 태그(#0000)를 그려주는 함수
function updateProfileUI() {
    // 1. 메인 화면 큰 닉네임
    const display = document.getElementById('home-nickname-display');
    if (display) {
        const tag = (typeof myTag !== 'undefined' && myTag) ? myTag : "0000";
        // ★ getTribeIcon 사용
        display.innerHTML = `${getTribeIcon(myTribe)}${getDeptTag(myDept)} ${myNickname} <span style="opacity:0.6; font-size:0.85em;">#${tag}</span>`;
    }

    // 2. 상단 작은 닉네임
    const subDisplay = document.getElementById('sub-profile-name');
    if (subDisplay) {
        // 지파 아이콘과 닉네임만 표시 (지파 이름 텍스트 제거)
        subDisplay.innerHTML = `${getTribeIcon(myTribe)}${getDeptTag(myDept)} ${myNickname}`;
    }

    applyHomeThemeByTribe(myTribe);
}

/* [수정] 자원 UI 업데이트 (updateGemDisplay로 통합) */
function updateResourceUI() {
    updateGemDisplay(); // 이제 이 함수가 모든 걸 처리합니다.
}

/* [시스템] 해당 챕터의 보스를 오늘 클리어했는지 확인 */
function isChapterBossClearedToday(chNum) {
    const bossId = `${chNum}-boss`;
    const lastTime = stageLastClear[bossId] || 0;
    if (lastTime === 0) return false;

    const today = new Date().setHours(0,0,0,0);
    const clearDate = new Date(lastTime).setHours(0,0,0,0);
    
    return today === clearDate;
}

/* [UI 보조] 스테이지 목록에 표시할 예상 보상 계산기 */
function getDisplayRewardInfo(stageId, type, verseCount, isAlreadyClearedToday = false) {
    let maxGem = 0;
    let maxScore = 0;
    let isReduced = false;

    // 1. 보스/중간점검의 정확한 보상 계산
    if (type === 'mid-boss' || type === 'boss') {
        // 최대 하트 기준 계산: verseCount × maxPlayerHearts × 1
        const baseScore = verseCount * maxPlayerHearts * 1;
        
        if (isAlreadyClearedToday) {
            // 반복 클리어: 기본 승점대로
            maxScore = baseScore;
            maxGem = verseCount * 10; // 반복: 구절 수 × 10
        } else {
            // 초회 클리어: 보너스는 때를 따른 양식에서 처리
            maxScore = baseScore * 5;
            maxGem = verseCount * 10;
        }
    } 
    // 2. 일반 스테이지
    else if (type === 'normal') {
        const baseScore = maxPlayerHearts * 1;
        if (isAlreadyClearedToday) {
            maxGem = 10;
            maxScore = baseScore;
        } else {
            maxGem = 50;
            maxScore = baseScore * 5;
        }
    }

    // 3. 패널티 확인 (중간점검 & 보스가 깨졌을 때)
    if (type === 'mid-boss') {
        const chNum = parseInt(stageId.split('-')[0]);
        if (isChapterBossClearedToday(chNum)) {
            // 보스 깼으면 1/5 토막 (표시도 줄여줌)
            maxGem = Math.floor(maxGem * 0.2);
            maxScore = Math.floor(maxScore * 0.2);
            isReduced = true;
        }
    }

    return { gem: maxGem, score: maxScore, isReduced };
}

/* [시스템: 도움말 모달] */
function openHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeHelpModal() {
    const modal = document.getElementById('help-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/* [시스템: 맵 화면 도움말 모달] */
function openStageHelpModal() {
    const modal = document.getElementById('stage-help-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeStageHelpModal() {
    const modal = document.getElementById('stage-help-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/* [수정] 프로필 설정 팝업 (네온 반짝이 버전) */
function openProfileSettings() {
    if (document.getElementById('nickname-modal')) return;

    let tempName = (myNickname === "순례자") ? generateRandomNickname() : myNickname;
    window.tempNickname = tempName; 
    window.tempTribe = (typeof myTribe !== 'undefined') ? myTribe : 0; 
    window.tempDept = (typeof myDept !== 'undefined') ? myDept : 0;

    const modal = document.createElement('div');
    modal.id = 'nickname-modal';
    modal.className = 'modal-overlay';
    modal.style.zIndex = "9999";
    
    // 지파 버튼 생성 HTML (네온 스타일 적용)
    let tribeButtonsHtml = `<div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:20px;">`;
    
    TRIBE_DATA.forEach((t) => {
        // 선택된 버튼은 진한 테두리 + 약간 커짐
        const isSelected = (t.id === window.tempTribe) ? 
            `border:2px solid ${t.glow}; transform:scale(1.05); background:#fff;` : 
            `border:1px solid #bdc3c7; opacity:0.8; background:#f9f9f9;`;
        
        // 버튼 안의 반짝이 스타일
        const iconStyle = `
            font-size:1.8rem; 
            color:${t.core}; 
            text-shadow: 0 0 5px ${t.glow}, 0 0 15px ${t.glow};
            margin-bottom: 2px;
        `;

        tribeButtonsHtml += `
            <div id="tribe-btn-${t.id}" onclick="selectTribe(${t.id})" 
                 style="border-radius:12px; padding:10px 5px; cursor:pointer; text-align:center; transition:all 0.2s; ${isSelected} box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="${iconStyle}">✦</div>
                <div style="font-size:0.75rem; color:#2c3e50; font-weight:bold; white-space:nowrap;">${t.name}</div>
            </div>
        `;
    });
    tribeButtonsHtml += `</div>`;

    let deptButtonsHtml = `<div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom:20px;">`;

    DEPT_DATA.forEach((d) => {
        const isSelected = (d.id === window.tempDept) ?
            `border:2px solid #f1c40f; transform:scale(1.03); background:#fff;` :
            `border:1px solid #bdc3c7; opacity:0.85; background:#f9f9f9;`;

        deptButtonsHtml += `
            <div id="dept-btn-${d.id}" onclick="selectDept(${d.id})"
                 style="border-radius:12px; padding:10px 5px; cursor:pointer; text-align:center; transition:all 0.2s; ${isSelected} box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="font-size:1rem; font-weight:bold; color:#2c3e50;">[${d.tag}]</div>
                <div style="font-size:0.75rem; color:#7f8c8d; font-weight:bold; white-space:nowrap;">${d.name}</div>
            </div>
        `;
    });
    deptButtonsHtml += `</div>`;

    modal.innerHTML = `
        <div class="result-card" style="max-width:340px; background:#fff; color:#2c3e50; text-align:center; max-height:85vh; overflow-y:auto;">
            <h2 style="color:#2c3e50; margin:0 0 5px 0;">순례자 등록</h2>
            <p style="color:#7f8c8d; font-size:0.85rem; margin-bottom:15px;">이름과 소속 부서/지파를 선택하세요.</p>
            
            <div style="background:#f4f6f7; padding:15px; border-radius:15px; margin-bottom:15px; border:1px solid #ecf0f1;">
                <div id="preview-full" style="font-size: 1.3rem; font-weight: bold; color: #2c3e50; margin-bottom:10px; background:#2c3e50; padding:10px; border-radius:10px; color:white;">
                    ${getTribeIcon(window.tempTribe)}${getDeptTag(window.tempDept)} ${tempName}
                </div>
                <button onclick="refreshNickname()" style="background:white; border:1px solid #bdc3c7; color:#7f8c8d; padding:6px 15px; border-radius:20px; font-weight:bold; cursor:pointer; font-size:0.8rem;">
                    🎲 이름 랜덤 변경
                </button>
            </div>

            <div style="text-align:left; font-size:0.9rem; font-weight:bold; color:#7f8c8d; margin-bottom:10px; margin-left:5px;">소속 부서 선택</div>
            ${deptButtonsHtml}

            <div style="text-align:left; font-size:0.9rem; font-weight:bold; color:#7f8c8d; margin-bottom:10px; margin-left:5px;">소속 지파 선택</div>
            ${tribeButtonsHtml}

            <button onclick="confirmProfile()" style="width:100%; background:#f1c40f; color:#2c3e50; border:none; padding:12px; border-radius:30px; font-weight:bold; cursor:pointer; font-size:1.1rem; box-shadow: 0 4px 0 #d35400;">
                ✅ 등록 완료
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

/* [기능] 지파 선택 처리 (선택 시 UI 갱신) */
function selectTribe(id) {
    window.tempTribe = id;
    
    // 모든 버튼 스타일 초기화 후 선택된 것만 강조
    TRIBE_DATA.forEach(t => {
        const btn = document.getElementById(`tribe-btn-${t.id}`);
        if (t.id === id) {
            btn.style.border = `2px solid ${t.glow}`;
            btn.style.transform = "scale(1.05)";
            btn.style.background = "#fff";
            btn.style.opacity = "1";
        } else {
            btn.style.border = "1px solid #bdc3c7";
            btn.style.transform = "scale(1)";
            btn.style.background = "#f9f9f9";
            btn.style.opacity = "0.8";
        }
    });

    updatePreviewText();
}

/* [기능] 부서 선택 처리 (선택 시 UI 갱신) */
function selectDept(id) {
    window.tempDept = id;

    DEPT_DATA.forEach(d => {
        const btn = document.getElementById(`dept-btn-${d.id}`);
        if (!btn) return;
        if (d.id === id) {
            btn.style.border = "2px solid #f1c40f";
            btn.style.transform = "scale(1.03)";
            btn.style.background = "#fff";
            btn.style.opacity = "1";
        } else {
            btn.style.border = "1px solid #bdc3c7";
            btn.style.transform = "scale(1)";
            btn.style.background = "#f9f9f9";
            btn.style.opacity = "0.85";
        }
    });

    updatePreviewText();
}

/* [기능] 이름 랜덤 변경 */
function refreshNickname() {
    window.tempNickname = generateRandomNickname();
    updatePreviewText();
}

/* [기능] 미리보기 텍스트 갱신 헬퍼 */
function updatePreviewText() {
    const preview = document.getElementById('preview-full');
    if (preview) {
        preview.innerHTML = `${getTribeIcon(window.tempTribe)}${getDeptTag(window.tempDept)} ${window.tempNickname}`;
    }
}

/* [기능] 프로필 확정 (저장) */
function confirmProfile() {
    if (window.tempNickname) myNickname = window.tempNickname;
    if (window.tempTribe !== undefined) myTribe = window.tempTribe;
    if (window.tempDept !== undefined) myDept = window.tempDept;
    
    // 저장 및 갱신
    saveGameData();
    updateProfileUI(); // 메인 화면 갱신
    if (typeof saveMyScoreToServer === 'function') saveMyScoreToServer(); // 서버 전송
    
    // 팝업 닫기
    const modal = document.getElementById('nickname-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
    }
    
    const tribeName = TRIBE_DATA[myTribe].name;
    alert(`[${tribeName} 지파]의 ${myNickname}님,\n환영합니다! 🙏`);
}

/* [시스템] 데이터 경고 팝업 제어 */
function checkDataWarning() {
    // '다시 보지 않기'가 체크되어 있는지 확인
    const isHidden = localStorage.getItem("hideDataWarning");
    
    // 저장된 값이 없으면 팝업을 보여줌
    if (!isHidden) {
        document.getElementById('data-warning-modal').style.display = 'flex';
    }
}

/* 팝업 닫기 함수 */
function closeWarningModal() {
    const checkbox = document.getElementById('dont-show-again');
    const modal = document.getElementById('data-warning-modal');

    // 체크박스에 체크했으면 영구적으로 숨김 처리
    if (checkbox.checked) {
        localStorage.setItem("hideDataWarning", "true");
    }

    modal.style.display = 'none';
}

// 게임 시작 시 자동 실행 (기존 window.onload 안에 넣거나, 맨 아래에 추가)
// setTimeout을 써서 게임 로딩 0.5초 뒤에 뜨게 하면 더 자연스러움
setTimeout(checkDataWarning, 500);

/* [시스템: 게임 초기화 및 시작] */
window.onload = function() {
    console.log("🚀 게임 로딩 시작...");

    // 1. 저장된 데이터 불러오기 (가장 중요)
    loadGameData(); 
    checkMissions(); // [추가] 게임 시작 시 미션 초기화 체크
    updateStats('login');
    updateNotificationBadges();

    // 4. 화면 UI 갱신
    updateGemDisplay();
    if(typeof updateResourceUI === 'function') updateResourceUI();
    if(typeof updateProfileUI === 'function') updateProfileUI();
    if(typeof updateCastleView === 'function') updateCastleView();
    ensurePlaytimeStats();
    startPlaySession();
    if (!window.playtimeTrackingInitialized) {
        window.playtimeTrackingInitialized = true;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopPlaySession();
            else startPlaySession();
        });
        window.addEventListener('beforeunload', stopPlaySession);
    }

    console.log("✅ 게임 로딩 완료!");

    // ▼▼▼ [추가] 망각 주기 도래한 스테이지 알림 ▼▼▼
    setTimeout(() => {
        let forgottenCount = 0;
        let forgottenList = [];
        
        // 모든 스테이지에서 망각 상태 확인
        gameData.forEach((chapter) => {
            if (!chapter.stages) return;
            chapter.stages.forEach((stage) => {
                if (stage.type === 'boss' || stage.id.includes('boss')) return; // 보스는 제외
                
                const memStatus = checkMemoryStatus(stage.id);
                if (memStatus.isForgotten) {
                    forgottenCount++;
                    forgottenList.push(`${chapter.title} - ${stage.title}`);
                }
            });
        });
        
        // 망각 상태인 스테이지가 있으면 알림
        // 복습 토스트 알림 표시 코드 삭제됨
        
        // ★ [추가] Service Worker용 알림 데이터 업데이트 및 주기 체크 시작
        updateForgottenNotificationData();
        startForgottenStatusChecker();
    }, 1500);

    // ▼▼▼ [수정] 최초 1회만 닉네임 설정창 띄우기 ▼▼▼
    if (myNickname === "순례자" && !localStorage.getItem('hasShownProfileSetup')) {
        localStorage.setItem('hasShownProfileSetup', 'true');
        setTimeout(openProfileSettings, 1000); // 1초 뒤 자연스럽게 등장
    }
    // enableMobileCheat(); // 정식 버전: 비활성화
};

// [1. 초성 변환 함수 추가] 
function getChosung(str) {
    const cho = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
    let result = "";
    for(let i=0; i<str.length; i++) {
        let code = str.charCodeAt(i) - 44032;
        if(code > -1 && code < 11172) result += cho[Math.floor(code/588)];
        else result += str.charAt(i);
    }
    return result;
}

// ★ [추가] 복습 알림 데이터 저장 및 업데이트 (Service Worker용)
function updateForgottenNotificationData() {
    try {
        let forgottenStages = [];
        
        // 모든 스테이지에서 망각 상태 확인
        gameData.forEach((chapter) => {
            if (!chapter.stages) return;
            chapter.stages.forEach((stage) => {
                if (stage.type === 'boss' || stage.id.includes('boss')) return;
                const memStatus = checkMemoryStatus(stage.id);
                if (memStatus.isForgotten) {
                    // 챕터 타이틀 없이 스테이지 타이틀만 저장
                    forgottenStages.push(stage.title);
                }
            });
        });
        
        // 로컬스토리지에 저장
        const notificationData = {
            lastUpdated: Date.now(),
            forgottenStages: forgottenStages,
            count: forgottenStages.length
        };
        
        localStorage.setItem('kingsroad_notifications', JSON.stringify(notificationData));
        
        // ★ 복습할 스테이지 버튼 표시 제어
        const forgettingBtn = document.getElementById('forgetting-btn');
        if (forgettingBtn) {
            if (forgottenStages.length > 0) {
                forgettingBtn.style.display = 'block';
            } else {
                forgettingBtn.style.display = 'none';
            }
        }

        // Service Worker에 메시지 전달
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'UPDATE_FORGOTTEN_DATA',
                stages: forgottenStages,
                count: forgottenStages.length
            });
        }
        
        console.log('📝 복습 알림 데이터 업데이트:', forgottenStages.length + '개');
    } catch (err) {
        console.error('❌ 복습 알림 업데이트 실패:', err);
    }
}

// ★ [추가] 주기적인 복습 상태 확인 (5분마다)
function startForgottenStatusChecker() {
    // 게임 로딩 후 5초 지나서 시작
    setTimeout(() => {
        updateForgottenNotificationData();
        
        // 이후 5분마다 확인
        setInterval(() => {
            updateForgottenNotificationData();
            
            // Background Sync 지원 시 sync 이벤트 발동
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                if ('sync' in navigator.serviceWorker.registration) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.sync.register('check-forgotten-stages');
                    });
                }
            }
        }, 5 * 60 * 1000); // 5분 = 300000ms
    }, 5000);
}

/* [시스템: 클리어 축하 폭죽 효과 (Confetti)] */
function triggerConfetti() {
    const duration = 1500; // 1.5초 동안 지속
    const end = Date.now() + duration;

    // 캔버스 생성 및 설정
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; // 클릭 통과 (게임 방해 X)
    canvas.style.zIndex = '9999'; // 모달보다 위에 뜨도록
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // 리사이즈 대응
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // 파티클 색상 (게임 테마색: 황금, 빨강, 초록, 파랑, 흰색)
    const colors = ['#f1c40f', '#e74c3c', '#2ecc71', '#3498db', '#ffffff'];
    const particles = [];

    // 파티클 생성 함수
    function createParticle() {
        return {
            x: Math.random() * width, // 화면 가로 랜덤 위치
            y: Math.random() * height - height, // 화면 위쪽에서 시작
            r: Math.random() * 10 + 5, // 크기
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngle: 0,
            tiltAngleIncr: (Math.random() * 0.07) + 0.05,
            dy: (Math.random() * 5) + 2, // 떨어지는 속도
            dx: (Math.random() * 2) - 1  // 흔들리는 정도
        };
    }

    // 초기 파티클 150개 생성
    for (let i = 0; i < 150; i++) {
        particles.push(createParticle());
    }

    // 애니메이션 루프
    (function frame() {
        const timeLeft = end - Date.now();

        // 시간이 다 되면 캔버스 지우고 종료
        if (timeLeft <= 0) {
            canvas.style.transition = 'opacity 1s';
            canvas.style.opacity = '0';
            setTimeout(() => canvas.remove(), 1000);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        particles.forEach((p, i) => {
            p.tiltAngle += p.tiltAngleIncr;
            p.y += p.dy; // 아래로 떨어짐
            p.x += Math.sin(p.tiltAngle) * 2; // 좌우로 살랑살랑

            // 바닥에 닿으면 다시 위로 (시간 내에는 계속 순환)
            if (p.y > height) {
                particles[i] = createParticle();
                particles[i].y = -20; // 화면 위에서 다시 시작
            }

            // 그리기 (사각형 종이 모양)
            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r);
            ctx.stroke();
        });

        requestAnimationFrame(frame);
    }());
}

/* ========================================
   [정식 배포 버전 - 디버그 기능 제거됨]
   ======================================== */

/* =========================================
   [시스템: 업적(나의 기록실) UI 및 로직]
   ========================================= */

// 1. 업적 화면 열기 (수정됨)
function openAchievement() {
    // 다른 화면 끄기
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // 화면이 없으면 생성 (최초 1회)
    let screen = document.getElementById('achievement-screen');
    if (!screen) {
        screen = document.createElement('div');
        screen.id = 'achievement-screen';
        screen.className = 'screen';
        // [유지] 방향 설정은 놔두셔도 됩니다 (CSS로 옮겨도 되지만 여기 둬도 무방)
        screen.style.flexDirection = 'column';
        screen.style.backgroundColor = '#2c3e50';

        screen.innerHTML = `
            <div class="map-header" style="justify-content: center; flex-shrink: 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <div style="font-weight:bold; font-size:1.3rem; color:#f1c40f;">🎖️ 나의 기록실</div>
            </div>

            <div style="text-align:center; padding:15px; background:rgba(0,0,0,0.2); color:#bdc3c7; font-size:0.9rem; flex-shrink: 0;">
                당신의 여정이 이곳에 기록됩니다.
            </div>

            <div id="record-summary" style="padding:15px; flex-shrink:0;">
            </div>

            <div id="achievement-list" style="flex: 1; overflow-y: auto; padding: 20px; padding-bottom: 80px;">
                </div>

            <div class="button-area-static">
                <button class="btn-gray btn-back" onclick="goMap()">돌아가기</button>
            </div>
        `;
        document.body.appendChild(screen);
    }

    screen.classList.add('active'); // 여기서 CSS가 display: flex를 적용해줍니다.
    renderMyPlayRecord();
    renderAchievementList(); // 목록 그리기
    // 백버튼 가시성 갱신 (기록실 화면에서는 보여야 함)
    if (typeof updateBackButtonVisibility === 'function') updateBackButtonVisibility();
}

// 2. 업적 목록 그리기 (핵심 로직)
function renderAchievementList() {
    const list = document.getElementById('achievement-list');
    if (!list) return;
    list.innerHTML = "";

    // 통계 변수 매핑 (데이터 키 -> userStats 키)
    const statsMap = {
        login: 'loginDays',
        verse: 'totalVersesCleared',
        boss: 'totalBossKilled',
        gem: 'totalGemsEarned',
        perfect: 'totalPerfects',
        castle: 'maxCastleLevel',
        earlybird: 'earlyBirdCounts'
    };

    // 아이콘 매핑
    const iconMap = {
        login: '🕯️', verse: '📖', boss: '🏆', 
        gem: '💎', perfect: '✨', castle: '🏰', earlybird: '🌅'
    };

    // ACHIEVEMENT_DATA 순회
    for (let key in ACHIEVEMENT_DATA) {
        const data = ACHIEVEMENT_DATA[key];
        const currentTierIdx = achievementStatus[key] || 0; // 현재 단계 (0부터 시작)
        const maxTier = data.tiers.length;
        
        // 현재 내 수치 가져오기
        let myValue = 0;
        if (key === 'castle') {
            myValue = (typeof userStats !== 'undefined' && userStats.maxCastleLevel) 
                      ? userStats.maxCastleLevel : myCastleLevel;
        } else {
            myValue = (typeof userStats !== 'undefined') ? userStats[statsMap[key]] : 0;
        }
        if (!myValue) myValue = 0;

        // 아이템 박스 생성
        const item = document.createElement('div');
        
        item.style.cssText = "background:white; border-radius:15px; padding:15px; margin-bottom:15px; display:flex; align-items:center; box-shadow:0 4px 6px rgba(0,0,0,0.1);";

        // 왼쪽 아이콘
        const iconDiv = document.createElement('div');
        iconDiv.style.cssText = "font-size:2rem; margin-right:15px; width:50px; text-align:center;";
        iconDiv.innerText = iconMap[key] || '🏅';

        // 중간 정보
        const infoDiv = document.createElement('div');
        infoDiv.style.flex = "1";

        // 목표 설정
        let target = 0;
        let reward = 0;
        let isMax = false;

        if (currentTierIdx >= maxTier) {
            isMax = true; // 모든 단계 완료
            target = data.tiers[maxTier - 1]; // 마지막 목표 보여줌
        } else {
            target = data.tiers[currentTierIdx];
            reward = data.rewards[currentTierIdx];
        }

        // 진행률 계산
        let percent = Math.min(100, Math.floor((myValue / target) * 100));
        if (isMax) percent = 100;

        // 텍스트 생성
        let titleHtml = `<div style="font-weight:bold; color:#2c3e50; font-size:1rem;">${data.title} <span style="font-size:0.8rem; color:#7f8c8d;">(Lv.${currentTierIdx + 1})</span></div>`;
        if (isMax) titleHtml = `<div style="font-weight:bold; color:#f1c40f; font-size:1rem;">${data.title} (완료)</div>`;

        let descHtml = `<div style="font-size:0.8rem; color:#95a5a6; margin-bottom:5px;">${data.desc}</div>`;
        
        let progressHtml = `
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#7f8c8d; margin-bottom:2px;">
                <span>현재: ${myValue.toLocaleString()}</span>
                <span>목표: ${target.toLocaleString()}</span>
            </div>
            <div style="width:100%; height:8px; background:#ecf0f1; border-radius:4px; overflow:hidden;">
                <div style="width:${percent}%; height:100%; background:${isMax ? '#2ecc71' : '#f1c40f'}; transition:width 0.5s;"></div>
            </div>
        `;

        infoDiv.innerHTML = titleHtml + descHtml + progressHtml;

        // 오른쪽 버튼
        const btnDiv = document.createElement('div');
        btnDiv.style.marginLeft = "10px";

        if (isMax) {
            btnDiv.innerHTML = `<button disabled style="background:#2ecc71; color:white; border:none; padding:8px 12px; border-radius:10px; font-weight:bold; font-size:0.8rem;">👑 정복</button>`;
        } else if (myValue >= target) {
            // 보상 받기 가능
            btnDiv.innerHTML = `<button onclick="claimAchievementReward('${key}')" class="btn-pulse" style="background:#e74c3c; color:white; border:none; padding:8px 15px; border-radius:10px; font-weight:bold; cursor:pointer; font-size:0.85rem; box-shadow:0 3px 0 #c0392b;">💎 ${reward}<br>받기</button>`;
        } else {
            // 진행 중
            btnDiv.innerHTML = `<button disabled style="background:#ecf0f1; color:#bdc3c7; border:1px solid #bdc3c7; padding:8px 12px; border-radius:10px; font-size:0.8rem;">진행중</button>`;
        }

        item.appendChild(iconDiv);
        item.appendChild(infoDiv);
        item.appendChild(btnDiv);
        list.appendChild(item);
    }
}

// 3. 보상 받기 함수
function claimAchievementReward(key) {
    const data = ACHIEVEMENT_DATA[key];
    const currentTierIdx = achievementStatus[key] || 0;
    
    // 안전 장치
    if (currentTierIdx >= data.tiers.length) return;

    const reward = data.rewards[currentTierIdx];

    // 1. 보상 지급
    if (typeof myGems === 'undefined') myGems = 0;
    myGems += reward;

    // 2. 단계 상승 및 저장
    achievementStatus[key]++;
    
    // 3. 저장 및 갱신
    if(typeof updateGemDisplay === 'function') updateGemDisplay();
    if(typeof saveGameData === 'function') saveGameData();
    updateNotificationBadges();

    // 4. 효과음 및 알림
    if(typeof SoundEffect !== 'undefined') SoundEffect.playLevelUp(); // 또는 playGetGem
    if(typeof triggerConfetti === 'function') triggerConfetti();
    
    alert(`🎉 [${data.title}] 달성!\n보상으로 💎보석 ${reward}개를 받았습니다.`);

    // 5. 리스트 새로고침 (다음 단계 보여주기 위해)
    renderAchievementList();
}

/* [시스템] 알림 배지 상태 업데이트 함수 */
function updateNotificationBadges() {
    // 1. 업적(기록실) 알림 체크
    let hasAchievementReward = false;
    
    // 모든 업적을 돌면서 '달성했으나 아직 안 받은 보상'이 있는지 확인
    for (let key in ACHIEVEMENT_DATA) {
        const data = ACHIEVEMENT_DATA[key];
        const currentTierIdx = achievementStatus[key] || 0;
        
        // 마지막 단계가 아니라면 체크
        if (currentTierIdx < data.tiers.length) {
            const target = data.tiers[currentTierIdx];
            
            // 내 수치 가져오기 (매핑 로직 재사용)
            const statsMap = { login:'loginDays', verse:'totalVersesCleared', boss:'totalBossKilled', gem:'totalGemsEarned', perfect:'totalPerfects', castle:'maxCastleLevel', earlybird:'earlyBirdCounts' };
            let myValue = 0;
            if(key === 'castle') myValue = (typeof userStats !== 'undefined' && userStats.maxCastleLevel) ? userStats.maxCastleLevel : myCastleLevel;
            else myValue = (typeof userStats !== 'undefined') ? userStats[statsMap[key]] : 0;

            // 목표 달성했으면 알림 ON
            if (myValue >= target) {
                hasAchievementReward = true;
                break; // 하나라도 있으면 충분함
            }
        }
    }

    // 배지 켜기/끄기
    const achBadge = document.getElementById('badge-achievement');
    if (achBadge) {
        if (hasAchievementReward) achBadge.classList.add('active');
        else achBadge.classList.remove('active');
    }

    // 2. 미션 알림 체크
    let hasMissionReward = false;
    
    // 일일 미션 체크
    if (missionData && missionData.daily) {
        // 하드코딩된 목표치와 비교 (updateMissionUI 로직 참조)
        if (missionData.daily.newClear >= 1 && !missionData.daily.claimed[0]) hasMissionReward = true;
        if (missionData.daily.differentStages >= 3 && !missionData.daily.claimed[1]) hasMissionReward = true;
        if (missionData.daily.checkpointBoss >= 1 && !missionData.daily.claimed[2]) hasMissionReward = true;
    }
    // 주간 미션 체크
    if (missionData && missionData.weekly) {
        if (missionData.weekly.attendance >= 5 && !missionData.weekly.claimed[0]) hasMissionReward = true;
        if (missionData.weekly.dragonKill >= 5 && !missionData.weekly.claimed[1]) hasMissionReward = true;
        if (missionData.weekly.stageClear >= 15 && !missionData.weekly.claimed[2]) hasMissionReward = true;
    }

    // 배지 켜기/끄기
    const misBadge = document.getElementById('badge-mission');
    if (misBadge) {
        if (hasMissionReward) misBadge.classList.add('active');
        else misBadge.classList.remove('active');
    }

    // 3. 상점 알림 체크 (일일 무료 생명의 떡)
    const shopBadge = document.getElementById('badge-shop');
    if (shopBadge) {
        const hasFreeLifeBread = (typeof isLifeBreadFreeAvailable === 'function') && isLifeBreadFreeAvailable();
        if (hasFreeLifeBread) shopBadge.classList.add('active');
        else shopBadge.classList.remove('active');
    }
}

/* [기능] 보스 타격 연출 함수 (흔들림 + 데미지 숫자) */
function triggerBossHitEffect() {
    const bossAvatar = document.querySelector('.boss-avatar');
    
    // 1. 흔들림 효과 (클래스 줬다 뺏기)
    if (bossAvatar) {
        bossAvatar.classList.remove('boss-hit-effect'); // 혹시 있으면 제거
        void bossAvatar.offsetWidth; // 리플로우 강제 (애니메이션 리셋용)
        bossAvatar.classList.add('boss-hit-effect');
        
        // 애니메이션 끝나면 클래스 제거 (깔끔하게)
        setTimeout(() => {
            bossAvatar.classList.remove('boss-hit-effect');
        }, 500);
    }

    // 2. 데미지 텍스트 띄우기 (머리 위에 -1)
    if (bossAvatar) {
        const damageText = document.createElement('div');
        damageText.className = 'floating-damage';
        damageText.innerText = "-1";
        
        // 보스 위치 기준으로 좌표 잡기
        const rect = bossAvatar.getBoundingClientRect();
        // 화면 중앙쯤에 배치 (보스 머리 위)
        damageText.style.left = (rect.left + rect.width / 2 - 10) + 'px'; 
        damageText.style.top = (rect.top) + 'px'; 
        
        document.body.appendChild(damageText);

        // 1초 뒤에 텍스트 삭제 (청소)
        setTimeout(() => damageText.remove(), 1000);
    }
}

/* [시스템] 마일스톤 팝업 처리기 */
function tryShowMilestone() {
    // 1. 이미 팝업이 떠 있거나, 대기열이 비었으면 중단
    if (isMilestoneShowing || milestoneQueue.length === 0) return;

    // 2. 현재 전투 화면(game-screen)이면 방해하지 않음 (단, 결과창은 제외)
    const gameScreen = document.getElementById('game-screen');
    const resultModal = document.getElementById('result-modal');
    
    // 게임 화면이 켜져있는데 결과창은 안 켜져있다? -> 한창 싸우는 중 -> 보류
    if (gameScreen.classList.contains('active') && !resultModal.classList.contains('active')) {
        console.log("⚔️ 전투 중이라 업적 알림을 보류합니다.");
        return; 
    }

    // 3. 팝업 표시 시작
    isMilestoneShowing = true;
    const item = milestoneQueue.shift(); // 대기열에서 하나 꺼냄
    
    // HTML 생성
    const overlay = document.getElementById('milestone-overlay') || createMilestoneOverlay();
    const iconMap = { login: '🕯️', verse: '📖', boss: '🏆', gem: '💎', perfect: '✨', castle: '🏰', earlybird: '🌅' };
    
    const rewardVal = item.data.rewards[item.tier];
    
    // 내용 채우기
    overlay.innerHTML = `
        <div class="sunburst"></div>
        <div class="milestone-card">
            <div class="milestone-icon">${iconMap[item.key]}</div>
            <div class="milestone-title">LEVEL UP!</div>
            <div style="font-size:1.1rem; font-weight:bold; color:#2c3e50; margin-bottom:5px;">
                ${item.data.title}
            </div>
            <div class="milestone-desc">
                ${item.data.desc}
            </div>
            
            <div class="milestone-reward">
                보상: 💎 보석 ${rewardVal}개
            </div>

            <button class="btn-get-reward" onclick="claimMilestoneReward('${item.key}', ${item.tier}, ${rewardVal})">
                멋져요!
            </button>
        </div>
    `;
    
    overlay.style.display = 'flex';
    
    // 효과음: 팡파레! (기존 playClear보다 더 웅장하게)
    if(typeof SoundEffect !== 'undefined') {
        SoundEffect.playLevelUp(); // 기존 효과음 활용 (또는 새로 만들어도 됨)
    }
    if(typeof triggerConfetti === 'function') triggerConfetti(); // 폭죽 발사!
}

// 오버레이가 없으면 만드는 함수
function createMilestoneOverlay() {
    const div = document.createElement('div');
    div.id = 'milestone-overlay';
    document.body.appendChild(div);
    return div;
}

// 보상 받기 버튼 클릭 시
function claimMilestoneReward(key, tier, reward) {
    // 1. 보상 지급 (기존 claimAchievementReward 로직 재활용)
    if (typeof myGems === 'undefined') myGems = 0;
    myGems += reward;
    
    // 2. 상태 업데이트 (중요: 여기서 수령 처리를 함)
    achievementStatus[key] = tier + 1;
    
    // 3. 저장 및 갱신
    saveGameData();
    updateGemDisplay();
    updateNotificationBadges(); // 배지 갱신

    // 4. 팝업 닫기
    const overlay = document.getElementById('milestone-overlay');
    overlay.style.display = 'none';
    isMilestoneShowing = false;

    // 5. ★ 다음 대기열 확인 (연속 달성 시 줄줄이 사탕처럼 나옴)
    setTimeout(tryShowMilestone, 300);
}

/* [시스템: 데이터 보호 시스템] */

// 1. 자동 저장 (1분마다)
// 유저가 멍하니 화면만 보고 있어도 보석이 날아가지 않게 해줍니다.
setInterval(() => {
    saveGameData();
    console.log("💾 자동 저장 완료");
}, 60 * 1000); // 60초

// 2. 페이지 종료/새로고침 직전 강제 저장
// 실수로 창을 닫거나 새로고침했을 때 마지막 순간을 기록합니다.
window.addEventListener("beforeunload", () => {
    saveGameData();
});

// [시스템] 스테이지 목록 강제 새로고침 (UI 갱신용)
function reloadCurrentChapterUI() {
    // 현재 선택된 스테이지 ID가 없다면 중단
    if (!window.currentStageId) return;

    // ID에서 챕터 번호 추출 (예: "1-1" -> 1)
    const chNum = parseInt(window.currentStageId.split('-')[0]);
    
    // 해당 챕터의 데이터를 찾음
    const chData = gameData.find(c => c.id === chNum);
    
    // 스테이지 시트(목록)를 다시 엽니다 (이 과정에서 버튼 상태가 갱신됨)
    if (chData) {
        openStageSheet(chData);
    }
}

// [시스템] 스테이지 ID로 해당 챕터 시트 열기 (클리어 후 자동 표시용)
function openStageSheetForStageId(stageId) {
    if (!stageId) return;
    const chNum = parseInt(String(stageId).split('-')[0]);
    if (isNaN(chNum)) return;
    const chData = gameData.find(c => c.id === chNum);
    if (chData) {
        openStageSheet(chData);
    }
}

/* =========================================
   [서버 연동] 파이어베이스 점수 저장 및 시온성 심사
   ========================================= */
let lastScorePayloadKey = null;
function saveMyScoreToServer() {
    // 1. 파이어베이스가 없으면 중단 (안전장치)
    if (typeof db === 'undefined' || !db || !myPlayerId) return;

    console.log("📡 서버에 주간 점수 저장 중...");

    const currentWeekId = leagueData.weekId || getWeekId();
    const currentScore = leagueData.myScore || 0;
    const payload = {
        nickname: myNickname,
        score: currentScore,
        castleLv: myCastleLevel,
        tribe: myTribe,
        dept: myDept,
        tag: myTag,
        weekId: currentWeekId
    };

    if (typeof lastScorePayloadKey === 'undefined' || lastScorePayloadKey === null) {
        try {
            lastScorePayloadKey = localStorage.getItem("kingsroad_last_score_payload") || "";
        } catch (e) {
            lastScorePayloadKey = "";
        }
    }

    const nextKey = JSON.stringify(payload);
    if (nextKey === lastScorePayloadKey) return;

    db.collection("leaderboard").doc(myPlayerId).set({
        ...payload,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true })
    .then(() => {
        lastScorePayloadKey = nextKey;
        try {
            localStorage.setItem("kingsroad_last_score_payload", nextKey);
        } catch (e) {
            // Ignore storage errors.
        }
        console.log(`✅ 서버 저장 완료: ${currentScore}점 (${currentWeekId})`);
    })
    .catch((error) => {
        console.error("❌ 점수 저장 실패:", error);
    });
}

function renderMyPlayRecord() {
    const summary = document.getElementById('record-summary');
    if (!summary) return;
    ensurePlaytimeStats();

    const totalPlaySeconds = getTotalPlaySecondsNow();
    const avgDailySeconds = getAverageDailySecondsLast7Days();
    const counts = getStageClearCounts();
    const totalMemoryLevel = getTotalMemoryLevel();
    const gems = (userStats && typeof userStats.totalGemsEarned === 'number') ? userStats.totalGemsEarned : 0;
    const score = (userStats && typeof userStats.totalScoreEarned === 'number') ? userStats.totalScoreEarned : 0;

    const tile = (icon, label, value, accent) => `
        <div style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.12); border-radius:12px; padding:10px; color:#ecf0f1; font-size:0.85rem; box-shadow:0 6px 12px rgba(0,0,0,0.2);">
            <div style="display:flex; align-items:center; gap:6px; color:#95a5a6; font-size:0.75rem; margin-bottom:4px;">
                <span>${icon}</span><span>${label}</span>
            </div>
            <div style="font-weight:bold; font-size:1rem; color:${accent};">${value}</div>
        </div>
    `;

    summary.innerHTML = `
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
            <div style="background:rgba(241,196,15,0.15); border:1px solid rgba(241,196,15,0.4); color:#f1c40f; padding:6px 10px; border-radius:999px; font-size:0.8rem; font-weight:bold;">
                🧭 누적 승점 ${score.toLocaleString()} pts
            </div>
            <div style="background:rgba(52,152,219,0.15); border:1px solid rgba(52,152,219,0.4); color:#7fbdf0; padding:6px 10px; border-radius:999px; font-size:0.8rem; font-weight:bold;">
                💎 누적 보석 ${gems.toLocaleString()}개
            </div>
            <div style="background:rgba(46,204,113,0.15); border:1px solid rgba(46,204,113,0.4); color:#2ecc71; padding:6px 10px; border-radius:999px; font-size:0.8rem; font-weight:bold;">
                ⏱️ 누적 플레이타임 ${formatDuration(totalPlaySeconds)}
            </div>
        </div>
        <div style="display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:10px;">
            ${tile("⏱️", "플레이타임(누적)", formatDuration(totalPlaySeconds), "#f1c40f")}
            ${tile("📆", "최근 7일 평균", formatDuration(avgDailySeconds), "#7fbdf0")}
            ${tile("📖", "일반 스테이지 클리어", `${counts.normal}개`, "#ecf0f1")}
            ${tile("🐲", "중간/보스 클리어", `${counts.bossMid}개`, "#ecf0f1")}
            ${tile("💎", "누적 획득 보석", `${gems.toLocaleString()}개`, "#7fbdf0")}
            ${tile("🏅", "누적 획득 승점", `${score.toLocaleString()} pts`, "#f1c40f")}
            ${tile("💜", "총 기억레벨 합계", `${totalMemoryLevel} Lv`, "#b487ff")}
        </div>
    `;
}