# CLAUDE.md — 킹스로드 (King's Road)

> **중요**: 코드를 수정한 경우, 관련된 내용(함수 위치, 데이터 구조, 동작 방식 등)이 이 파일의 내용과 달라졌다면 반드시 이 파일도 함께 업데이트해줘.

---

## 프로젝트 개요

영어 단어 암기 게임. 에빙하우스 스페이스드 리피티션 기반의 복습 시스템을 핵심으로 한다.

- **파일 구조**: `game.js` (전체 로직), `style.css`, `index.html`
- **저장소**: `localStorage` 키 `kingsRoadSave` (버전 `1.1.0`), `kingsRoad_savedVerses` (저장된 구절 stageId 배열)

---

## 핵심 데이터 구조 (game.js:89-98)

```js
let stageMastery        // id → 클리어 횟수
let stageClearDate      // id → 최초 클리어 날짜 ('YYYY-MM-DD')
let stageLastClear      // id → 마지막 클리어 타임스탬프 (Date.now())
let stageReviewStep     // id → 현재 복습 스텝 (1-based)
let stageNextReviewTime // id → 다음 복습 가능 타임스탬프
```

---

## 복습 시퀀스 (game.js:606)

```
step 1 (초학습)
  → 10분 → step 2
  → 1시간 → step 3
  → 6시간 → step 4
  → 23시간 → step 5
  → 71시간(3일) → step 6
  → 167시간(7일) → step 7+
step 7+: 이후 지수 증가 (약 2배씩)
```

---

## 주요 함수 위치

| 함수 | 위치 | 설명 |
|------|------|------|
| `REVIEW_SEQUENCE` | game.js:508 | 복습 대기시간 + 보상 젬 테이블 |
| `getReviewStatus(id)` | game.js:1927 | 현재 스텝, 복습 가능 여부, 남은 시간 |
| `advanceReviewStep(id)` | game.js:1939 | 복습 완료 시 스텝 증가 + 다음 시간 계산 |
| `getMemoryStrength(id)` | game.js:~1949 | 에빙하우스 공식으로 현재 기억 강도(0~1) 반환 |
| `getSubStagesOfMidBoss(chData, stage)` | game.js:~1983 | 중간점검 소속 서브스테이지 목록 반환 |
| `getMidBossAvgStrength(chData, stage)` | game.js:~1991 | 중간점검 소속 서브스테이지 평균 기억 강도 반환 |
| `getMemoryLevelFromStep(step)` | game.js:~2003 | 스텝 → 레벨(0~5) 변환 |
| `splitChunksIntoParts(chunks, maxWords)` | game.js:~6009 | 청크 배열을 maxWords(기본 20) 기준으로 균등 분할. 21개 이상이면 파트 수를 `Math.ceil(총/20)`으로 계산해 각 파트를 최대한 균등하게 나눔 |
| `buildReviewBadgeHtml(id)` | game.js:2010 | 복습 단계 배지 HTML 생성 |
| `openStageSheet()` | game.js:2809 | 스테이지 시트 열기 + 목록 렌더링 |
| `updateSheetTimers()` | game.js:~2956 | 60초마다 타이머 + 기억 강도 바 업데이트 |
| `stageClear(type, rewardMultiplier=1)` | game.js:~12127 | 스테이지 클리어 처리 전체. `rewardMultiplier`로 보상 배율 조정 (보통 모드: 0.7) |
| `openBossSetupModal(stage)` | game.js:~6170 | 보스/중간점검 진입 전 설정 모달 (난이도·순서 선택) |
| `setBossSetupOpt(type, value)` | game.js:~6218 | 모달 토글 클릭 핸들러 (type: 'difficulty'|'order') |
| `confirmBossSetup()` | game.js:~6228 | 모달 확인 → `startBossBattle()` 호출 |
| `saveGameData()` | game.js:4091 | localStorage에 저장 |
| `showBossHistoryModal()` | game.js:~6370 | 보스전 이전 파트/구절 보기 모달 표시/토글 |
| `generateVerseChoices(verse)` | game.js:~17908 | 구절의 고난용 4지선다 생성 (같은 장 2개 + 다른 장 1개) |
| `renderHardshipVerseVerse()` | game.js:~17933 | 구절의 고난 문제 렌더링 (주소 표시 + 4지선다) |
| `submitHardshipVerseGuess(idx)` | game.js:~17962 | 구절의 고난 선택지 제출 처리 |
| `toggleSavedVerse()` | game.js:~19065 | 기억하시나요 결과에서 구절 저장/해제 토글 |
| `openSavedVersesQuiz()` | game.js:~19184 | 저장된 구절 퀴즈 오버레이 열기 |
| `updateSavedVersesBadge()` | game.js:~19056 | 더보기 메뉴의 저장된 구절 배지 갱신 |
| `count6AMBoundaries(startTs, endTs)` | game.js:4538 | startTs~endTs 사이 로컬 오전 6시 경계 횟수 반환. **로컬 시간** 기준이므로 UTC 오프셋 무관 |
| `getKingsRoadUnlockedCount()` | game.js:4544 | 현재 해금된 일반 스테이지 수 (count6AMBoundaries 기반) |
| `getKingsRoadNextUnlockMs()` | game.js:4676 | 다음 해금까지 남은 ms. 로컬 오전 6시 기준 |
| `openGuildScreen()` | game.js:~12660 | 길드 오버레이 열기 |
| `_renderGuildScreen()` | game.js:~12680 | 길드 화면 렌더링 (소속 여부에 따라 분기) |
| `_renderGuildHome(body, guild, myStatus)` | game.js:~12950 | 길드 홈 HTML 생성 (레이드·장비·멤버 포함) |
| `_addGuildRaidDamage(type)` | game.js:~12716 | updateMissionProgress에서 호출, 개인장비 보너스 적용 후 대미지 누적 |
| `_flushGuildRaidDamage()` | game.js:~12730 | 5초 디바운스 후 Firestore에 대미지 반영 (트랜잭션) |
| `_buyPersonalEquipment(itemKey)` | game.js:~12887 | 비늘 차감 + personalEquipment 레벨 증가 CF 호출 |
| `_buyGuildEquipment(itemKey)` | game.js:~12900 | 발톱 차감 + guildEquipment 레벨 증가 CF 호출 |
| `_respondGuildInvite(accept, guildId)` | game.js:~12872 | 길드 초대 수락/거절 CF 호출 |

---

## 길드 시스템

### Firestore 구조
- `guilds/{guildId}`: 길드 문서
- `leaderboard/{tag}.guildId`: 유저의 소속 길드 ID

### 길드 문서 필드
```js
{
  name, code,           // 길드 이름, 가입 코드 (6자 영문대문자)
  leaderId,             // 길드장 tag
  level, xp,            // 길드 레벨(1~5), 누적 XP
  members: string[],    // tag 배열
  memberNicknames: {},  // tag → 닉네임
  pendingRequests: [{tag, nickname, sentAt, invitedBy?}],
  raidCurrentDragonLevel, // 현재 용 단계 (1~GUILD_DRAGON_MAX_LEVEL)
  raidDragonMaxHp,        // 현재 용 원본 최대 HP (쇠사슬 감소 미적용)
  raidDragonCurrentHp,    // 현재 용 HP
  raidClearedCount,       // 이번 주 처치 횟수
  raidWeekId,             // 현재 주차 ('YYYY-WXX')
  raidContributions: {tag: damage},  // 이번 주 기여 대미지
  raidStatus: 'active',
  guildEquipment: { chain, blade, judgment, winepress }, // 각 0~5
}
```

### leaderboard 유저 문서 추가 필드
```js
{
  personalEquipment: { sword, breastplate, helmet, shield, belt, shoes }, // 각 0~5
  dragonScales,      // 비늘 (개인 장비 구매 재화)
  dragonClaws,       // 발톱 (길드 장비 구매 재화)
  pendingInvites: [{guildId, guildName, invitedBy, sentAt}], // 복수 초대
  pendingRaidReward: { weekId, scales, claws, scalesTier }, // 미수령 주간 보상
}
```

### 길드 레벨
| 레벨 | 최대 인원 | 필요 XP |
|------|-----------|---------|
| 1 | 5명 | — |
| 2 | 10명 | 300 |
| 3 | 15명 | 1,000 |
| 4 | 20명 | 3,000 |
| 5 | 25명 | 8,000 |

### 레이드 대미지 테이블 (`GUILD_RAID_DAMAGE`)
| 액션 | 대미지 |
|------|--------|
| 첫 학습(new) | 15 |
| 복습(review) | 10 |
| 중간점검(checkpointBoss) | 20 |
| 보스전(dragon) | 30 |
| 주소의 고난 | 20 |
| 구절의 고난 | 40 |
| 암송의 고난 | 60 |
| 망각의 고난 | 80 |

### Cloud Functions (kingsroad/index.js, asia-northeast3)
- `createGuild`, `joinGuildRequest`, `respondJoinRequest`, `leaveGuild`, `kickGuildMember`
- `inviteToGuild`, `respondInvite`
- `reportRaidDamage`, `weeklyRaidReset`, `guildAttend`, `guildDonate`, `claimRaidReward`
- `buyPersonalEquipment`, `buyGuildEquipment`

### 레이드 용 HP 테이블 (`GUILD_DRAGON_BASE_HP`, 확장 시 배열 끝에 추가)
| 레벨 | HP |
|------|----|
| 1 | 2,000 |
| 2 | 5,000 |
| 3 | 12,000 |
| 4 | 25,000 |
| 5 | 50,000 |
| 6 | 100,000 |
| 7 | 200,000 |

`GUILD_DRAGON_MAX_LEVEL = GUILD_DRAGON_BASE_HP.length - 1` (자동 연동)

### 레이드 동작
- 용 처치 시 즉시 다음 레벨 용으로 전환, 초과 데미지 이어받음 (연속 처치 불가, 최소 HP 1)
- 쇠사슬 감소는 현재 용과 다음 용 모두 적용 후 초과 계산
- 주간 리셋 시: 비늘(처치×10 + 진행도 티어) + 발톱(처치×1) 전원 지급, 용 레벨 1로 초기화

### 레이드 주간 비늘 티어 (`RAID_SCALES_BY_TIER`)
| 진행도 | 추가 비늘 |
|--------|----------|
| 0~19% | 0 |
| 20~39% | 2 |
| 40~59% | 4 |
| 60~79% | 6 |
| 80%+ | 10 |

### 장비 시스템

#### 개인 장비 (에베소서 6장, `leaderboard/{tag}.personalEquipment`)
| 키 | 이름 | 효과 타입 |
|----|------|----------|
| sword | 성령의 검 | 모든 레이드 대미지 |
| breastplate | 의의 흉배 | 첫 학습 대미지 |
| helmet | 구원의 투구 | 복습 대미지 |
| shield | 믿음의 방패 | 보스전·중간점검 대미지 |
| belt | 진리의 허리띠 | 고난 길 대미지 |
| shoes | 평안의 복음의 신 | 출석한 날 모든 대미지 |

- 레벨 0 = 망가진 상태, 1~5성
- 효과: `PERSONAL_EQUIP_EFFECT = [0, 2, 5, 10, 17, 26]` (%)
- 비용: `PERSONAL_EQUIP_COST = [0, 4, 8, 24, 72, 216]` (비늘)

#### 길드 장비 (계시록, `guilds/{guildId}.guildEquipment`)
| 키 | 이름 | 효과 |
|----|------|------|
| chain | 큰 쇠사슬 | 용 최대 HP 감소 (서버 적용) |
| blade | 이한 검 | 전체 대미지 증가 (서버 적용) |
| judgment | 심판하는 권세 | 주간 비늘 보상 증가 |
| winepress | 맹렬한 진노의 포도주 틀 | 처치당 추가 비늘 |

- 레벨 0~5, 처음엔 미구매 상태
- 효과 테이블: `GUILD_EQUIP_CHAIN_REDUCTION/BLADE_BONUS = [0,3,6,10,15,20](%)`
- `GUILD_EQUIP_JUDGMENT_BONUS = [0,10,20,30,40,50](%)`, `GUILD_EQUIP_WINEPRESS_BONUS = [0,1,2,3,4,5](비늘/처치)`
- 비용: `GUILD_EQUIP_CLAW_COST = [0,1,2,4,7,12]` (발톱)

---

## 기억 강도 표시 (에빙하우스, 최근 추가)

공식: `R = e^(-t/S)` (t=경과시간(hr), S=안정성(hr))

스텝별 S값 (다음 복습 시점에 R=0.8이 되도록 역산):

| 스텝 | S (hr) | 비고 |
|------|--------|------|
| 1 | 0.747 | 10분 후 복습 |
| 2 | 4.48 | 1시간 후 |
| 3 | 26.9 | 6시간 후 |
| 4 | 103.1 | 23시간 후 |
| 5 | 206.0 | 대복습(23hr) 완료 후 S×2 적용 |
| 6 | 637.0 | 대복습(71hr) 완료 후 S×2 적용 |
| 7+ | 동적 | waitHr / 0.2231 |

> S×2 근거: FSRS 이론 — R=80% 부근에서 복습 완료 시 안정성이 약 2배 증가

CSS 클래스: `mem-strength-green` (≥80%), `mem-strength-yellow` (≥60%), `mem-strength-orange` (≥40%), `mem-strength-red` (<40%)

---

## Step 1 음성인식 모드

Step 1에 선택적 음성인식 기능 추가. 클릭(읽기) 방식과 병행 사용 가능.

- **마이크 버튼**: 초성 버튼 옆에 배치 (`btn-step1-mic`, 보라색)
- **동작**: 말하면 `calcEnduranceSpeechScore()`로 점수 계산
  - **≥ 80%**: 통과 → 남은 청크 전체 공개(`revealAll`) → 0.8초 후 `finishStep1Effect()` 자동 호출
  - **< 80%**: 점수 + 재시도/건너뛰기 버튼 표시 (재시도: 무제한, 건너뛰기: 전체 공개 후 완료)
- **완료 시**: `finishStep1Effect()` 내에서 mic 버튼 + 피드백 영역 자동 숨김
- 보상/젬 없음 — 단순 학습 보조 기능

---

## 고난 길 모드

| 모드 | 키 | 아이콘 | 설명 |
|------|----|--------|------|
| 암송의 고난 | `endurance` | 🕊️ | 말씀을 소리내어 암송, 음성인식 채점 |
| 주소의 고난 | `address` | 🎯 | 구절 보고 장·절 맞히기 |
| 망각의 고난 | `memory` | ⌨️ | 주소 보고 전체 구절 타이핑 |
| 구절의 고난 | `verse` | 📖 | 주소 보고 4지선다로 정확한 구절 선택 |

- 구절의 고난 선택지: 같은 장 2개 + 다른 장 1개 + 정답 1개 (섞어 표시)
- `HARDSHIP_MODES` 상수에 등록, `createEmptyHardshipState()`에 `verseChoices: []` 포함
- 히스토리: `hardshipVerseClearHistory` (장별 `{correct, total, score, date, duration}`)
- 왕의 고난 버튼: 4개 모드 기준 0/1~3/4 완료 구분 (`_doneModes.length === 4` 이면 `all-done`)
- 일일 미션 인덱스: address=4, memory=5, endurance=6, verse=7 (`missionData.daily.claimed`)
- 심화 미션 `claimed` 인덱스: `[address, memory, endurance, verse]` (길이 4)

---

## 단어 버튼 파트 분할 (Step 2, Step 5, 보스/중간점검)

구절이 길 경우 단어 버튼을 여러 파트로 나눠 표시함. 공통 유틸 `splitChunksIntoParts()` 사용.

- **기준**: 20단어 이하 → 1파트, 21개 이상 → `Math.ceil(총/20)` 파트로 균등 분할
- 예: 24개 → [12]+[12], 58개 → [20]+[19]+[19]
- **버튼 정렬**: 가나다순 (`localeCompare('ko')`)
- **파트 라벨**: 2파트 이상일 때 상단에 `(파트 1/2 · 다음 파트: 12단어)` 표시, 마지막 파트엔 "다음 파트" 미표시
- 보스전(`loadNextVerse`)은 `currentBossParts` / `currentBossPartIndex` 변수로 파트 관리

---

## 중간점검(mid-boss) 클리어 동작

중간점검은 편의 트리거 개념으로, **자체 복습 스텝/보상 없음**. 클리어 시:
- 소속 서브스테이지 중 **대기 중이 아닌(eligible)** 것만 `advanceReviewStep()` 호출
- eligible 서브스테이지의 `stageLastClear`, `stageMastery`, `stageClearDate` 업데이트
- 보석 = eligible 서브스테이지 각각의 `baseGem` 합산
- 승점 = eligible 서브스테이지 수 × hearts × 1
- 대기 중인 서브스테이지는 스텝/타이머 완전 무시

---

## 보스전/중간점검 설정 모달

보스·중간점검 클릭 시 `startBossBattle()` 대신 `openBossSetupModal(stage)`가 먼저 호출됨.

- **변수**: `bossDifficultyMode` (`'normal'|'hard'`, 기본 `'hard'`), `bossOrderMode` (`'sequential'|'random'`, 기본 `'sequential'`)
- 두 변수 모두 `kingsRoadSave`에 저장/로드됨
- **보통 모드**: 단어 버튼에 전체 단어 표시 (파란 색상), 정답 판정도 전체 단어 비교, 보상 70%
- **어려움 모드**: 기존 초성 힌트 방식 (빨간 색상), 보상 100%
- **무작위 모드**: 세션 시작 시 `currentBattleData` Fisher-Yates 셔플, 히스토리 버튼 숨김
- `renderBossBlocks()` 내부에서 `bossDifficultyMode` 분기 처리
- `stageClear()` 호출 시 보통 모드면 `rewardMultiplier = 0.7` 전달
- 클리어 처리(스테이지 일괄 클리어, 미션, 최초 클리어 보너스)는 난이도 무관 동일 적용

---

## 스테이지 시트 UI 구조

스테이지 목록 아이템 구성 (일반 스테이지 기준):
```
[상태 배지] [아이콘] [제목 + 설명] [복습 단계 배지] [기억 강도 바]   [오른쪽: ▶ / ⏳ / ⚙️]
```

중간점검 아이템 구성:
```
[상태 배지] [아이콘] [제목 + 설명] [서브스테이지 평균 기억 강도 바]   [오른쪽: ▶ / ⏳]
```
- Lv 배지 없음, 복습 단계 배지 없음
- `data-mid-boss-id` 속성으로 `updateSheetTimers()`에서 별도 업데이트

배지 종류:
- `today-badge`: 오늘 클리어
- `forgotten-badge`: 복습 가능 (step > 1)
- `mem-lv-low/mid/high`: 기억 레벨 (Lv.1~5+, 일반 스테이지만)
- `mem-strength-bar-wrap[data-stage-id]`: 기억 강도 바 (일반 스테이지)
- `mem-strength-bar-wrap[data-mid-boss-id]`: 평균 기억 강도 바 (중간점검)
