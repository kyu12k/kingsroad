# CLAUDE.md — 킹스로드 (King's Road)

> **중요**: 코드를 수정한 경우, 관련된 내용(함수 위치, 데이터 구조, 동작 방식 등)이 이 파일의 내용과 달라졌다면 반드시 이 파일도 함께 업데이트해줘.

> **배포 시 필수**: `game.js`/`style.css`를 고치면 `index.html`의 캐시 버스팅 파라미터(`?v=YYYYMMDD`)를 **반드시 함께 올릴 것.**
> 파라미터가 그대로면 URL이 변하지 않아 브라우저 HTTP 캐시가 옛 파일을 계속 제공하고, 배포해도 사용자에게 반영되지 않는다.
> (2026-09-06: `?v=20260804b`가 고정된 채 하루 네 번 배포해 동기화 수정이 PC에 전달되지 않았고, 그 사이 데이터 손실이 재발했다.)
> `sw.js`는 코어 자산에 네트워크 우선 전략을 쓰지만, SW의 `fetch()`도 브라우저 HTTP 캐시를 거치므로 파라미터 갱신이 필요하다.

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
| `buildMidBossRanges(totalVerses, targetSize)` | game.js:4751 | 장 절 수를 균등 분할해 중간점검 구간 배열 반환 |
| `migrateMidBossRanges(...)` | game.js:4769 | 구간 개편 시 구 기록 이전 + 고아 키 정리 |
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
| `_openRenameGuildModal()` | game.js:~14100 | 길드 이름 변경 모달 열기 (길드장 전용) |
| `_confirmRenameGuild()` | game.js:~14120 | 이름 변경 확인 → `renameGuild` CF 호출 후 화면 재렌더 |
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
  raidClearedCount,       // 이번 주 전체 처치 횟수
  raidHeadClearedCount,   // 이번 주 머리 단계(레벨 11+) 처치 횟수
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
  dragonScales,         // 비늘 (개인 장비 구매 재화)
  dragonHornFragments,  // 뿔조각 (길드 장비 구매 재화, 뿔 처치 드랍)
  dragonHeadSkins,      // 머릿가죽 (길드 장비 진화 재화, 머리 처치 드랍)
  pendingInvites: [{guildId, guildName, invitedBy, sentAt}], // 복수 초대
  pendingRaidReward: { weekId, scales, hornFragments, headSkins, scalesTier }, // 미수령 주간 보상
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
| 액션 | 기본값 | 비고 |
|------|--------|------|
| 첫 학습(new) | 15 | 고정 |
| 복습(review) | 5 | 고정 |
| 중간점검(checkpointBoss) | 5 | × 스테이지 `targetVerseCount` |
| 보스전(dragon) | 7 | × 스테이지 `targetVerseCount` |
| 주소의 고난(hardshipAddress) | 2 | × 장 구절 수 |
| 구절의 고난(hardshipVerse) | 3 | × 장 구절 수 |
| 암송의 고난(hardshipEndurance) | 9 | × 장 구절 수 |
| 망각의 고난(hardshipMemory) | 10 | × 장 구절 수 |

중간점검 클리어 시: `checkpointBoss`(일일 첫 클리어만) + `dragon`(항상) 둘 다 호출 — 보스전과 동일 구조.
즉 `checkpointBoss`/`dragon`은 스테이지 종류가 아니라 **중간점검·보스전 양쪽이 함께 발생시키는 두 대미지 항목**이며, 각각 하루 1회 중복 제거됨(`kingsRoad_raidDailyDmg`).

배율은 `_addGuildRaidDamage()`에서 **해당 스테이지의 `targetVerseCount`**(중간점검 = 자기 구간 절수, 보스전 = 장 전체 절수)를 사용.
고난 4종은 `dedupId`로 **장 번호(숫자)** 를 넘기므로 장 전체 절 수가 적용된다.

> 과거에는 스테이지 ID에서 장 번호만 떼어내 `bibleData[장].length`를 곱했기 때문에, 중간점검이 자기 크기와 무관하게 항상 장 전체 절수를 곱해 대미지가 부풀어 있었다(3장 기준 6·7·9절 중간점검이 모두 동일하게 22를 곱함). 2026-09-06 수정.

### 버튼 로딩 상태 (`_withButtonLoading`)

길드 화면의 Cloud Function 호출 버튼은 모두 `_withButtonLoading(btn, label, task)`을 거친다.
CF 왕복에 수 초가 걸려 아무 반응이 없으면 사용자가 실패로 오해하거나 중복 클릭하기 때문.

- 버튼을 비활성화하므로 **응답 대기 중 중복 클릭이 함께 막힌다**
- **같은 부모의 형제 버튼도 잠근다** (수락/거절 쌍에서 둘 다 눌리는 것 방지). 원래 비활성이던 버튼은 복원 대상에서 제외
- 성공 시 대개 `_renderGuildScreen()`으로 버튼이 사라지므로 **`isConnected`일 때만** 원상복구 (실패 시에만 복구되는 셈)
- 로딩 중 `minWidth`로 원래 폭을 고정해 줄 배치가 흔들리지 않게 한다
- **라벨을 빈 문자열로 주면 스피너만** 표시 — 폭이 좁은 버튼(추방·가입 수락/거절)용
- 스피너는 `.kr-spinner-btn`(style.css). 기존 `.kr-spinner`는 흰색 고정이라 노란 `guild-btn-primary`에서 보이지 않아 `currentColor`를 쓰는 변형을 따로 만들었다

> 확인 대화상자가 있는 동작(기부·추방·탈퇴)은 **`_guildConfirm`의 확인을 누른 뒤에** 로딩을 건다.
> 이전에는 기부가 확인 전에 "기부 중"으로 바뀌어 오해를 줬다. 2026-09-07 정리.

`_confirmRenameGuild`(모달 버튼 전체 잠금 + 힌트 문구)와 `_inviteToGuild`(성공 시 '✓ 발송' 유지)는
고유한 완료 표시가 있어 헬퍼를 쓰지 않고 스피너만 맞췄다.

### Cloud Functions (kingsroad/index.js, asia-northeast3)
- `createGuild`, `joinGuildRequest`, `respondJoinRequest`, `leaveGuild`, `kickGuildMember`
- `inviteToGuild`, `respondInvite`
- `renameGuild` (길드장 전용, 2~10자, 중복 불허, 7일 쿨다운, `guild.lastNameChangeAt` serverTimestamp)
- `reportRaidDamage`, `weeklyRaidReset`, `guildAttend`, `guildDonate`, `claimRaidReward`
- `buyPersonalEquipment`, `buyGuildEquipment`

### 레이드 용 HP 테이블 (`GUILD_DRAGON_BASE_HP`, 확장 시 배열 끝에 추가)
| 레벨 | 이름 | HP |
|------|------|----|
| 1~7 | 첫째~일곱째 뿔 | 2,000 / 5,000 / 12,000 / 25,000 / 50,000 / 100,000 / 200,000 |
| 8 | 여덟째 뿔 | 400,000 |
| 9 | 아홉째 뿔 | 800,000 |
| 10 | 열째 뿔 | 1,500,000 |
| 11 | 첫째 머리 | 3,000,000 |
| 12 | 둘째 머리 | 6,000,000 |
| 13 | 셋째 머리 | 12,000,000 |
| 14 | 넷째 머리 | 25,000,000 |
| 15 | 다섯째 머리 | 50,000,000 |
| 16 | 여섯째 머리 | 100,000,000 |
| 17 | 일곱째 머리 | 200,000,000 |

`GUILD_DRAGON_MAX_LEVEL = 17` (자동 연동), `GUILD_DRAGON_HEAD_START = 11`

### 레이드 동작
- 용 처치 시 즉시 다음 레벨 용으로 전환, 초과 데미지 이어받음 (연속 처치 불가, 최소 HP 1)
- 쇠사슬 감소는 현재 용과 다음 용 모두 적용 후 초과 계산

### 큰 쇠사슬 HP 감소와 표시 (`_getRaidHpView`)

쇠사슬은 HP를 **미리 깎아두지 않고, 서버가 대미지 계산 시점에 곱해서 적용**한다
([kingsroad/index.js](kingsroad/index.js) `reportRaidDamage`):

```js
const effectiveMaxHp     = Math.round(currentMaxHp * (1 - chainReduction));
const effectiveCurrentHp = Math.min(currentHp, effectiveMaxHp);  // 강화 시 진행 중인 용도 즉시 감소
```

그 결과 Firestore에는 **`raidDragonMaxHp` = 원본, `raidDragonCurrentHp` = 감소 반영값**이 저장된다.

> 이 둘을 그대로 나누면 **아무도 때리지 않은 용이 "20% 피해"로 표시**되고,
> 길드 랭킹 진행률도 쇠사슬 감소분을 '입힌 피해'로 세어 부풀었다. 2026-09-07 수정.

- 클라이언트는 `_getRaidHpView(guild)`로 서버와 **같은 식**을 다시 적용해 실질 최대 HP 기준을 맞춘다
- 길드 홈 HP 바와 길드 레이드 랭킹 진행률 **둘 다** 이 헬퍼를 쓴다 — 새 표시를 추가할 때도 반드시 경유할 것
- 쇠사슬이 있으면 `⛓️ 큰 쇠사슬 -N% · 원본 X HP`를 따로 적어 감소분과 실제 피해를 구분한다
- 주간 리셋 시: 비늘(처치×10 + 진행도 티어) + 뿔조각(처치×1 + 머리처치×1 보너스) + 머릿가죽(머리처치×1) 전원 지급, 용 레벨 1로 초기화

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

## 빠른 모드 백지 승급 (2026-09-09)

**한 번이라도 백지로 써낸 구절**(`verseRecall[id].pass > 0`)은 빠른 모드에서 **백지부터** 시작한다.
사용자가 스스로 증명한 구절에만 붙으므로 못 하는 것을 강요하지 않는다.

| 결과 | 이어지는 코스 |
|------|---------------|
| 통과 | `quick-after-pass` = `[1]` — 읽기로 확인만 |
| 막힘 | `quick-after-fail` = `[1, 5]` — 초성 조립까지 |

> **보상은 승점이 아니라 시간이다.** 잘 아는 구절일수록 복습이 짧아진다.
> 그래서 `getHardshipScoreScale()`이 이 세션에 **0**을 준다 — 이어지는 훈련 코스가 끝나면
> `stageClear`가 복습 승점을 정상 지급하므로, 여기서 또 주면 같은 복습에 두 번 주는 셈이다.

**「모르겠어요」**(`giveUpHardshipMemoryVerse`) — 실패로 기록하되 **체력을 깎지 않는다.**
벌을 주면 정직하게 누르는 대신 아무거나 찍게 되고, 그러면 '이 구절이 백지에서 나오는가'가 오염된다.

> **강등은 일시적이다.** 다음에 들어오면 다시 백지를 만난다.
> 영구 강등이면 한 번 도망친 구절은 영영 백지를 안 만나서, 정작 확인이 필요한 구절이 시야에서 사라진다.

**제어 흐름** — `startTraining(id,'quick')`이 `_startQuickBlank()`로 가로채 고난 세션을 열고,
`finishHardshipSession()`이 **결과 화면을 띄우지 않고** `resetHardshipSessionState()` 후 훈련으로 되돌아간다.
`'quick-after-*'`는 `'quick'`이 아니므로 재가로채기가 일어나지 않는다(무한 루프 방지).

---

## 중간점검 이어하기 (2026-09-09)

중간점검 하나가 3~4절이라 한 장을 훑으려면 맵을 여러 번 왕복해야 했다.
결과 화면에 **「다음 중간점검 ▶」**(`#btn-next-midboss`)을 붙여 바로 이어간다.

- `getNextMidBossStageId()` — **장 경계를 넘는다.** 왕의 길에서는 소속 구절이 하나라도 해금돼 있어야 이어진다
- `goToNextMidBoss()` — **설정 모달을 띄우지 않고** 방금 쓰던 `bossDifficultyMode`/`bossOrderMode`를 그대로 쓴다.
  모달을 거치면 '이어하기'의 목적인 마찰 제거가 사라진다
- `_attachNextMidBossBtn()`이 두 결과 경로에 공용으로 붙는다 —
  `showBossClearScreen`(초성·단어)과 `finishHardshipSession`(빈칸·백지)
- **보상은 늘리지 않는다.** 심화 미션이 이미 "오늘 서로 다른 중간점검 개수"로 누적 보상을 준다.
  지금 문제는 보상이 아니라 마찰이고, 여기 더 얹으면 파밍 유인이 된다

> 결과 모달(`#result-modal`)은 일반·보스·고난이 **하나를 돌려 쓴다.**
> 그래서 화면마다 이전 버튼을 지워야 한다 — `#btn-next-stage`, `#btn-next-midboss`,
> `result-notif-wrap`, `result-blank-wrap`. 안 지우면 직전 화면의 버튼이 그대로 남는다
> (백지 확인을 끝낸 화면에 '백지로 확인해보기'가 또 뜨던 버그가 이것이었다).

---

## 백지 인출 승점 배율 (2026-09-09)

`getHardshipScoreScale()` — 분량과 위험이 다르면 보상도 달라야 한다.

| 콘텐츠 | 분량·위험 | 배율 |
|--------|-----------|------|
| 망각의 고난 | 한 장(최대 29절), 무작위, **체력이 끝까지 이어짐** | 1.0 |
| 중간점검 빈칸·백지 | 3~4절, 체력 이어지지만 짧음 | 0.5 |
| 결과 화면 백지 확인 | 1구절, 사실상 위험 없음 | 0.25 |

> 망각의 고난이 어려운 건 분량만이 아니다. **오답 1개당 체력이 줄고 그 뒤 모든 구절의 승점이 영구히 낮아진다**
> (승점 공식이 `maxPlayerHearts`가 아니라 `playerHearts`를 쓴다). 1구절 확인엔 그 위험이 없다.

**`_blankScoreAlreadyToday()` — 같은 구절의 백지 승점은 하루 1회** (오전 6시 경계, `verseRecall[].lastScoredAt`).
배율만으로는 부족했다. 체력 47이면 1구절 47점인데 30번 반복하면 1,410점이 된다.

- **기록은 반복해도 계속 쌓인다** — 막는 것은 승점뿐. 측정 데이터가 줄면 이 기능의 목적이 사라진다
- **망각의 고난에는 걸지 않는다** — 한 장을 통으로 하는 진입 비용이 이미 억제 장치이고, 걸면 기존 사용자 너프가 된다

---

## 결과 화면의 '백지로 확인해보기' (2026-09-08)

일반 스테이지를 클리어하면 결과 화면(계속하기 위)에 **그 한 구절을 백지로 써보는** 버튼이 뜬다.
`_startVerseBlankCheck(stageId)` → 1구절짜리 망각의 고난 세션.

> **메뉴가 아니라 흐름 안에 둔 이유**: 보스 난이도 통계에서 87.4%가 기본값('hard')을 그대로 쓴다.
> 난이도 선택을 지배하는 건 선호가 아니라 **기본값 관성**이므로, 선택지로 만들면 거의 쓰이지 않는다.
> 흐름에 넣으면 하는 쪽이 기본이 되고 건너뛰는 쪽에 행동이 필요해진다.

- 글자 칸은 남긴다(`selectedHardshipUltimate = false`) — 문턱을 낮춰야 실제로 한다
- **첫 통과 보너스** `VERSE_FIRST_RECALL_GEM`(30) — 처음 백지로 써낸 구절에만 1회. 404절 전부라도 12,120으로 심화 미션 하루치(약 19,300)보다 작다
- **초학습 직후 확인은 `lastMode: 'learn'`으로 구분**하고 보너스를 주지 않는다.
  방금 다섯 단계를 거친 구절이라 통과가 당연해 증거 가치가 낮고,
  보너스를 주면 초학습 직후에 눌러 보석만 받는 것이 최적 전략이 된다
- 이미 통과한 구절은 버튼이 '한 번 더 백지로'로 흐려진다 (미완결 칸이 비어 보이게)

> **`closeResultModal(skipSheetReopen)`** — 이 경로는 `true`로 부른다.
> 이 함수는 `stageClear('normal')` → `quitGame()` → `openStageSheetForStageId()` 순으로 도는데,
> **마지막이 스테이지 시트를 다시 열어** 고난 화면 위에 남는다. 클리어 처리는 거쳐야 하므로
> 함수를 건너뛰지 않고 시트 재오픈만 막는다. 기존 '계속하기' 버튼은 인자 없이 호출해 동작이 그대로다.

---

## 중간점검 빈칸·백지 (2026-09-08)

중간점검 난이도가 4칸이 됐다. **빈칸·백지는 중간점검에만** 나온다
(보스전은 한 장 최대 29절이라 타이핑 부담이 크고, 그 규모는 망각의 고난이 담당한다).

| 난이도 | 단서 | 화면 |
|--------|------|------|
| 보통 | 단어 버튼 | 보스전 화면 |
| 어려움 | 초성 | 보스전 화면 |
| **빈칸** | 글자 칸만 | **망각의 고난 화면** |
| **백지** | 없음 | **망각의 고난 화면 (궁극의 암기)** |

> **타이핑 UI를 이식하지 않았다.** `startHardshipSession(mode, verseIds)`가 임의 구절 목록을 받으므로,
> 중간점검 구간의 구절로 **망각의 고난 세션을 여는** 방식으로 구현했다(`_startMidBossBlank`).
> 타이핑 보드·점진 힌트·`verseRecall` 기록이 전부 그대로 동작한다.

세션이 끝나면 `finishHardshipSession()`이 `stageClear('mid-boss', 1)`을 호출해 중간점검 클리어로 잇는다.
`stageClear`는 화면을 그리지 않으므로 고난 결과 화면과 충돌하지 않는다.

**구분 플래그는 `hardshipState.midBossStageId`.** 이것 때문에 갈리는 지점이 네 곳이다:

| 지점 | 동작 |
|------|------|
| 망각의 고난 히스토리 | **기록하지 않는다** (별개 콘텐츠의 세션이 섞이면 집계가 왜곡됨) |
| `verseRecall` | **기록한다** ← 이 기능의 목적 |
| 승점 | **고난 체계로 지급**(구절당 hearts×4). 대신 `stageClear` 승점을 0으로 |
| 클리어 alert | `window._suppressClearAlert`로 억제 (고난 결과 화면이 이어서 뜸) |

> **`rewardBlocked`를 쓰면 안 된다.** 그 플래그는 승점을 막지 않고(`awardHardshipScore`는 `trainingMode`만 본다)
> 정답 피드백만 "보상 없음"으로 바꾼다. 승점 차단은 `window._midBossBlankClear`로 `stageClear` 쪽에서 한다.

> **시트 닫기는 `startHardshipSession()` 한 곳에서 한다.** 보스전 경로는 인트로 연출 콜백 안에서 닫는데,
> 고난 세션은 연출을 거치지 않아 시트가 남는다. 중간점검 빈칸과 결과 화면 백지 확인에서
> 같은 버그가 각각 났으므로 진입점마다가 아니라 공통 지점에서 막는다.

`forcedChapter`는 넘기지 않는다 — 넘기면 장 단위 세션으로 취급돼 고난 히스토리 경로를 탄다.

---

## 도감 점수와 체력 보너스 (2026-09-08 수정)

`getCollectionScoreOf(mastery)` — 구절별 누적 클리어 횟수로 점수 산출 (1회↑ 10 / 5회↑ 20 / 10회↑ 30 / 20회↑ 50).
`getTotalCollectionScore()` — **자유여행 + 왕의 길 합산**. 체력 +3 보너스(15,000점) 판정에만 쓴다.

> **이 보너스는 한 번도 발동한 적이 없었다.**
> 점수 계산이 `renderLifeBook()` 안에 인라인으로 박혀 있었고 그 변수가 **함수 지역 `let`** 이라,
> `recalculateMaxHearts()`의 `typeof grandTotalScore !== 'undefined'`가 **항상 `'undefined'`** 였다.
> 도감 화면을 열어야만 값이 생기는 구조이기도 했다. 실제 도달자가 2명뿐이라 신고가 없었다.

- 활성 모드일 때 `stageMastery`는 그 모드의 데이터를 가리키므로, 자유여행 점수는 `_freeStageMastery`에서 읽는다
- **도감 화면 표시는 여전히 현재 모드 기준**(`getCollectionScoreOf(stageMastery)`)이다.
  경지(rank) 임계값이 단일 모드 만점 20,200 기준으로 설계돼 있어, 표시까지 합산으로 바꾸면 전원이 등급을 건너뛴다.
  → 체력 보너스만 합산, 표시는 그대로. 둘이 달라 보이는 문제는 남아 있다

---

## 온보딩 — 신규 유저 경로 (2026-09-08)

**활성 사용자의 51.6%가 한 구절도 클리어하지 않는다.** (2026-09-08 Firestore 집계:
30일 활동 547명 중 0절 282명, 누적 플레이 시간 중앙값 1.4분. 진행자는 1.9시간)
그중 **5일 이상 로그인하고도 0절인 사람이 52명** — 관심이 없어서가 아니라 시작을 못 하고 있다.

첫 구절까지 거치는 화면이 많다: 신규 모달 → 프로필 → 토스트 → 홈 → 인트로 슬라이드 3장 →
여정 오버레이(아멘) → 지도 → 스테이지 시트 → 스테이지 인트로 애니메이션 → step 1.

고친 것:

- **신규 유저에게 공지 모달을 띄우지 않는다** (`confirmProfile`).
  > 이전에는 `_isFirstProfile`일 때 `checkAndShowNewNotice()`를 불렀다. 의도는 "온보딩 중 억제된 공지를 나중에"였는데,
  > 결과적으로 **가입 직후 두 번째 화면이 과거 패치노트와 데이터 손실 사과문**이 됐다.
  > 겪지도 않은 사고를 첫인상으로 주던 셈. 지금은 `noticeHideUntil`을 3일 뒤로 설정해 온보딩 후에 보게 한다.
- **환영 문구를 네이티브 `alert()` → `showToast()`** 로. 모바일에서 시스템 대화상자는 이질적이고,
  브라우저에 따라 "이 사이트가 다시 알림을 표시하지 못하게 하기" 체크박스가 붙는다.
  `alert_welcome_tribe`의 `\n`도 제거(토스트는 한 줄).
- **아멘 버튼 등장 지연 1000ms → 120ms** (`_showJourneyOverlay`). 페이드인은 유지.

- **첫 구절 안내** — 클리어 기록이 전무한 자유여행 신규 유저는 지도 대신 **1장 1절로 바로** 들어간다.
  `amenAndStartGame()`이 `window._pendingFirstStageStart`를 예약하고 `goMap()` 끝에서 소비한다
  (복습 팝업·주간 보상 팝업과 같은 패턴). 조건은 `_shouldGuideFirstStage()`,
  1회성 표식은 `kingsRoad_firstStageGuided`(localStorage). 지도를 0.5초 보여준 뒤 진입해 위치를 인지시킨다.
- **이탈 지점 표식** `onboardStep` — `'profile' → 'map' → 'stage' → 'cleared'` 순으로 **앞으로만** 이동.
  `markOnboardStep()`이 실제로 전진할 때만 저장하므로 사용자당 최대 4회 저장이다.
  저장본(`onboardStep`)에 실려 Firestore로 올라가므로 다음 집계 때 어디서 멈추는지 바로 보인다.

> **일반 스테이지에는 이어하기가 없다.** `saveBattleCheckpoint()`는 `loadNextVerse()`(보스전)에서만 호출되고,
> `currentStep`/`sequenceIndex`는 저장되지 않는다. **훈련 도중 앱을 닫으면 그 스테이지는 처음부터**다.
> 신규 유저의 첫 스테이지는 `[1,2,3,4,5]` 전체 코스라 몇 분이 걸리는데, 중단되면 전부 사라진다.
> (0절 사용자 중 5일 이상 로그인한 52명의 누적 플레이 시간이 10.3분인 것과 부합하는 가설 — 미검증)

> **`activeMode` 기본값을 `'kings'`로 바꾸면 안 된다.**
> `kingsRoadData.stepHistory`가 비어 있으면 `getKingsRoadUnlockedCount()`가 0을 반환해
> **해금된 스테이지가 하나도 없는 빈 지도**가 된다. `setKingsRoadStep()` 초기화가 선행되어야 한다.
> (모드별 첫 클리어율은 자유여행 41.6% / 왕의 길 60.1%지만, 왕의 길은 사용자가 직접 골라 들어간
> 자기선택 표본이라 모드 자체의 효과로 볼 수 없다.)

---

## 힌트 정책 — "먼저 시도, 그다음 도움" (2026-09-08)

힌트를 먼저 보면 **인출(retrieval)이 사라지고 단순 재학습(restudy)** 이 된다.
인출 연습이 재학습보다 기억에 강하게 남는다는 것이 이 분야에서 가장 잘 확립된 결과이므로,
**시도를 먼저 강제해 힌트의 성격을 '지름길'에서 '회복 도구'로 바꾼다.**

| 모드 | 비용 | 잠금 해제 조건 |
|------|------|---------------|
| 망각의 고난(`memory`) 계열 타이핑 | **무료** | **잠금 없음** (2026-09-09 해제) |
| 일반 스테이지·중간점검·보스전·집중 훈련 | 💎10 (집중 훈련은 무료) | **그 문제에서 한 번 오답** |

**힌트 버튼(`#common-hardship-hint-btn`)은 화면에 떠서 따라다닌다** — `position: fixed` FAB.
`armHardshipHintNudge()`가 **8초간 입력이 없으면 은은하게 맥동**시킨다 —
힌트가 있는 줄 모르고 그만두는 것을 막는 게 목적이라 입력이 있을 때마다 다시 건다.
(`prefers-reduced-motion`에서는 테두리 강조로 대체)

### 왜 헤더도 액션 행도 아닌가 (2026-09-10)

**모바일 키보드가 열리면 `100dvh`는 그대로인 채 '보이는 영역'만 줄어든다.**
브라우저는 포커스된 입력칸을 드러내려고 화면 전체를 위로 밀어 올리므로,
**`flex-shrink: 0`인 헤더도 보이는 영역 위로 밀려나간다.** 두 번 다 같은 이유로 실패했다:

| 위치 | 결과 |
|------|------|
| 입력 보드 아래 액션 행 | 키보드가 **아래를** 덮는다 |
| 헤더 우측 상단 | 키보드가 화면을 밀어 올려 **위로** 사라진다 |

→ 어느 쪽에도 매지 않고 `positionHardshipHintFab()`이 **`visualViewport` 기준으로 매번 다시 앉힌다.**

```js
const visibleBottom = vv.offsetTop + vv.height;          // 키보드 위 경계
limit = Math.min(visibleBottom, control.getBoundingClientRect().top);
fab.style.top = limit - fab.offsetHeight - MARGIN;
```

- **`position: fixed`의 기준은 레이아웃 뷰포트이고 `getBoundingClientRect()`도 같은 기준**이라
  `visualViewport`의 offset/size와 그대로 섞어 계산할 수 있다
- `.battle-control`(제출·다시 입력·모르겠어요) 위에 앉힌다. **키보드가 열리면 그 줄은 이미 화면 밖이라
  `visibleBottom` 쪽이 자연히 이긴다** — 상태 분기가 필요 없다
- 다시 앉히는 시점 4곳: `visualViewport` resize·scroll(키보드·주소창·회전) / `updateHardshipHud`(표시 전환) /
  `renderHardshipMemoryVerse`(제출 줄 높이가 상태마다 다름) / `updateHintButtonLabels`(라벨 폭이 위치를 정함)
- `z-index: 60` — 결과 모달(2000~99999)보다 **아래**라 세션이 끝나면 자연히 가려진다
- 헤더용 모바일 미디어쿼리(`padding: 5px 7px !important` 등)의 선택자 목록에서 **뺐다.**
  `!important`라 FAB 스타일을 이기기 때문

> **타이핑 백지에는 잠금을 걸지 않는다.** 처음에는 '한 글자 이상 입력'을 요구했으나,
> ① 한 글자 치는 것은 오답이 아니라 시도로 볼 수 없고 ② 아무 글자나 쳐서 열 수 있어
> 시도를 강제하지도 못하면서 입력만 더럽혔다. 잠금의 근거였던 "먼저 보면 인출이 사라진다"는
> **구절 전체를 보여주는 단어 버튼 모드의 논리**이지, 한 글자씩 여는 점진적 단서에는 해당하지 않는다.

> 두 힌트는 **구조가 전혀 다르다.**
> 망각의 고난은 `revealedHints`에 **한 글자씩** 공개하는 점진적 단서라 반복 인출 시도를 만들어낸다 → 비용을 없애 적극적으로 쓰게 한다.
> 반면 일반 스테이지·보스전의 `showHintModal()`은 **구절 전체를 모달로 보여준다.** 게다가 단어 버튼이 이미 화면에 다 있어
> 남는 인지 작업이 거의 없다 — 무료로 풀면 베껴 쓰기가 되므로 비용을 유지한다.

### 구현 (game.js:11294 부근)

| 이름 | 역할 |
|------|------|
| `hintAttemptMade` | 현재 문제에서 오답이 있었는지 |
| `markHintAttempt()` | 오답 지점에서 호출 → 잠금 해제 + 버튼 표시 갱신 |
| `resetHintLock()` | 문제 단위로 다시 잠금 |
| `isHintUnlocked()` | 고난 모드는 입력 여부, 그 외는 `hintAttemptMade` |

- **`markHintAttempt()` 호출 지점 6곳** — 보스전 공격(7928) / Step2 초성(10197) / Step5 조립(10592) /
  Step3 타워(15843) / Step4 두루마리 충돌(16455)·오답 클릭(16527).
  **방패(`_tryUseShield()`)로 막힌 오답도 '시도'로 인정**하므로 방패 분기보다 **앞에서** 호출한다
  (타워 게임은 체력 감소가 없어 `wrongCount`를 쓰지 않는다 — 그래서 `wrongCount`를 재사용하지 않고 별도 플래그를 뒀다)
- **`resetHintLock()` 호출 지점 2곳** — `loadStep()`(훈련: 스텝·구절·파트·사이클 경계) / `loadNextVerse()`(보스전: 구절 경계).
  이 둘의 다른 호출은 모두 실제 '새 문제' 경계라 한 문제 도중에 잠금이 되살아나지 않는다
- 잠긴 버튼은 **`.hint-locked`(style.css)로 흐리게만** 표시하고 클릭은 막지 않는다 — 눌러야 이유를 안내할 수 있다.
  버튼에 인라인 `background`가 박혀 있어 `opacity`/`filter`처럼 인라인에 없는 속성을 쓴다
- 잠금 검사는 **카운터 증가보다 앞**에 둔다 — 막힌 클릭이 `battleHintCount`/`bossHintCount`를 부풀리지 않도록
- 망각의 고난은 `updateHardshipMemoryBoard()`(매 키 입력)에서 `updateHintButtonLabels()`를 불러 첫 글자 입력 즉시 버튼이 밝아진다
- `getCurrentHintCost()`가 고난 모드에서 0을 반환하므로 버튼에 '(무료)'가 표시된다.
  `useHardshipMemoryHint()`의 보석 차감·잔액 검사도 함께 제거했다(`alert_blank_hint_no_gems`는 미사용 키로 남음)

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
- 심화 미션 `claimed` 인덱스: `[address, memory, endurance, verse, checkpointBoss, midBoss]` (길이 6)

---

## 기기 간 동기화 (`initFirestoreSync`)

`saves/{uid}` 문서 하나를 모든 기기가 공유한다. 저장은 CF `saveGameDataSecure`를 거치며
서버가 `updatedAt`을 서버 시각으로 덮어쓰고 **이력 없이 `set()`으로 통째 저장**한다 → 덮어쓰면 복구 불가.

로컬/원격 중 최신을 고르는데, 비교에 쓰는 로컬 값은 **부팅 시점 스냅샷**(`window._bootLocalUpdatedAt`)이다.

> **왜 스냅샷인가**: `window.onload`의 `updateStats('login')`이 `saveGameData()`를 호출하고,
> `saveGameData()`는 `updatedAt: Date.now()`를 찍는다. 인증은 그보다 늦게 끝나므로
> `initFirestoreSync()`가 비교할 땐 **오래된 로컬 데이터에 방금 시각이 찍혀 있어** 원격보다 최신으로
> 오인되고, 다른 기기의 진행을 통째로 덮어썼다. (2026-09-06 실제 데이터 손실 발생)
> 시작 시 자동 저장은 '진행'이 아니므로 비교 기준에서 제외한다.

- 스냅샷은 **모듈 로드 시점**(`loadGameData` 정의 직전)에 잡는다 — `onload`보다 먼저여야 함
- 부팅 후 **60초가 지나면** 스냅샷을 버리고 현재 값을 쓴다 (인증 지연 중 실제 플레이 보호)
- `window.firestoreSyncPending`은 **죽은 플래그** — 5곳 모두 `= false`뿐이고 `true`로 설정하거나 읽는 코드가 없다
- 로컬 우선 경로가 병합하는 것: 고난 히스토리 · 심화 미션 배열(union) · `daily.claimed`(OR) · `pendingCompensation`
  **`gems`/`lastClaimTime`/스테이지 진행도는 병합되지 않는다** — 판정이 틀리면 그대로 소실
- 백업 파일 복원은 `forceSyncAfterLoad` 플래그로 비교를 건너뛰고 강제 업로드한다

### 낙관적 동시성 제어 (2026-09-07)

클라이언트는 **자신이 기준으로 삼은 서버 `updatedAt`** 을 `baseUpdatedAt`으로 함께 보내고,
`saveGameDataSecure`가 트랜잭션 안에서 현재 서버 값과 비교해 더 최근 저장이 있으면 `aborted`로 거절한다.

- 기준 버전은 **`_serverUpdatedAt`** (game.js 상단, 부팅 스냅샷 옆에 선언)
  — **서버 응답에서 받은 값만** 담는다. 저장본의 `updatedAt`은 `saveGameData()`가 로컬 저장마다
  `Date.now()`로 덮어써서 서버 값에서 멀어지므로 그대로 쓸 수 없다
- 갱신 시점: 부팅(`parsed.serverUpdatedAt`) / 저장 성공(CF 반환값) / 원격 적용(`remoteData.updatedAt`)
- 거절되면 재시도하지 않고 "다른 기기 기록" 배너를 띄운다. `aborted`는 `_SYNC_TRANSIENT_CODES`에 없어 자동 재시도에도 걸리지 않으며, `_syncDirty`가 true로 남아 로컬 변경이 조용히 버려지지 않는다

> **`baseUpdatedAt`이 없으면 서버는 검사를 건너뛴다.** 이 규칙 때문에
> ① 구버전 클라이언트가 영향받지 않고 ② 서버/클라이언트 배포 순서가 무관하며
> ③ **이 CF만 되돌리면 검사가 사라져 서버가 킬 스위치 역할**을 한다.

> **업로드는 반드시 직렬화되어야 한다** (`_syncInFlight` / `_syncQueuedAgain`).
> `syncToFirestore()`는 20여 곳에서 대부분 `await` 없이 호출된다. 두 요청이 동시에 뜨면
> 나중 것이 **낡은 `baseUpdatedAt`을 들고 가 서버에 거절당하고, 한 기기만 쓰는 사람에게도
> "다른 기기 기록" 배너가 뜬다.** 진행 중이면 새로 보내지 않고 끝난 뒤 한 번만 이어서 돌린다.
> 재시도도 `_callSaveFunction()`을 직접 부르면 가드를 우회하므로 `syncToFirestore()`로 되돌아가야 한다.
> (2026-09-07 동시성 제어 도입 직후 실제로 발생한 오탐)

> **`checkRemoteIsNewer()`는 서버 시각끼리 비교한다** (`_serverUpdatedAt` 기준).
> 저장본의 `updatedAt`은 `saveGameData()`가 로컬 저장마다 **기기 시계**로 덮어쓰므로,
> 기기 시계가 서버보다 5초만 느려도 한 기기만 쓰는 사람에게 오탐 배너가 떴다.

> **강제 업로드 경로는 기준을 비운다** (`_serverUpdatedAt = 0`).
> 백업 복원·충돌 해결에서 "이 데이터로 덮어쓴다"를 사용자가 명시적으로 고른 경우인데,
> 복원한 백업의 기준 버전은 낡아 있어 그대로 두면 검사에 거절당한다.

### 암기 진행도 필드 단위 병합 (`_mergeSaveProgress`)

두 기기가 각자 진도를 냈을 때 한쪽을 통째로 버리지 않고 **스테이지별로 앞선 쪽**을 취한다.
자유여행(최상위)과 왕의 길(`kingsMode`) 두 벌 모두, **로컬 우선·원격 우선 두 경로 모두**에 적용된다.

> 원격 우선 경로에 넣은 것이 특히 중요하다 — 오프라인에서 쌓은 복습 진도가
> 서버 데이터 적용과 함께 통째로 사라지던 경로다.

**앞선 쪽 판정**: `reviewStep` → `lastClear` → `mastery` 순.

> ★ **반드시 스테이지 단위로 통째 선택해야 한다.**
> 한 스테이지의 다섯 필드(`mastery`/`clearDate`/`lastClear`/`reviewStep`/`nextReviewTime`)는 서로 맞물려 있어서,
> 복습 스텝만 A에서 다음 복습 시각만 B에서 가져오면 **복습 일정 자체가 깨진다.**
> 판정은 대칭이라 인자 순서가 결과에 영향을 주지 않는다.

`clearDate`(최초 클리어 날짜)만 예외로 **이른 쪽**을 남긴다.

**재화는 일부러 병합하지 않는다** (`gems`/`dragonScales`/`maxHearts`/`leagueData` 점수).
`max`로 합치면 복제 취약점이 생긴다 — A에서 보석 100개로 체력을 사고 B(차감 전 상태)와 합치면
`max(gems)`로 차감 전 값이 살아나 **체력도 얻고 보석도 유지**된다. `sum`은 중복 계산이라 더 나쁘다.
따라서 재화는 이긴 쪽 값을 그대로 따른다.

정리하면 **잃으면 복구 불가능한 암기 진도는 지키고, 다시 벌 수 있는 재화는 한쪽을 포기**하는 절충이다.

배포: `firebase deploy --only "functions:kingsroad:saveGameDataSecure"`
(윈도우에서 `Timeout after 10000`이 나면 `FUNCTIONS_DISCOVERY_TIMEOUT=120` 환경변수를 주면 통과한다)

---

## 심화 미션 — 보스전 / 중간점검 (별도 미션)

보스전과 중간점검은 **규모가 전혀 다르므로 미션을 분리**한다. 둘 다 "오늘 서로 다른 것을 클리어할수록 보상 누적"(2번째부터).

| 미션 | 저장 필드 | `claimed` 인덱스 | 대상 | 상한 | 보상 테이블 | 하루 최대 |
|------|----------|-----------------|------|------|------------|----------|
| 보스전 누적 | `checkpointBossStages` | 4 | 보스전만 | 22 (= 장 수) | `ADVANCED_CHECKPOINT_BOSS_REWARDS`<br>2~6: 500 / 7~12: 800 / 13~22: 1,200 | **19,300** |
| 중간점검 누적 | `midBossStages` | 5 | 중간점검만 | `getTotalMidBossCount()` (111) | `ADVANCED_MID_BOSS_REWARDS`<br>2~40: 120 / 41~80: 180 / 81~111: 240 | **19,320** |

- 두 미션 모두 404절 전체를 덮으므로 완주 보상을 같은 수준(≈19,300)으로 맞췄다
- 곡선은 둘 다 **상승형** — 많이 학습할수록 단가가 떨어지면 오히려 학습량을 억제하게 되므로 체감형을 쓰지 않는다. 보상 제한의 목적은 **같은 구절 반복 방지**이지 학습량 억제가 아니다
- 클리어 시 호출: 보스전 → `advancedCheckpointBoss`, 중간점검 → `advancedMidBoss`
- 상한의 목적은 실제 존재하는 개수보다 많이 쌓이는 것만 방지 (중복은 `includes()`가 차단)

> `getAdvancedRewardGem()`은 테이블 범위 밖이면 **0을 반환**하므로, 상한을 바꿀 때 **보상 테이블의 마지막 `to`도 반드시 함께 바꿔야 한다.**

`createEmptyAdvancedMissionData(lastResetDate)` — 심화 미션 기본값은 이 헬퍼 한 곳에서 생성한다.
(이전에는 같은 객체 리터럴이 7군데에 복사돼 있어 필드를 추가할 때 누락되기 쉬웠다.)

`buildMissionBlock(..., unit = '장')` — 이 두 미션만 `'개'`를 넘겨 "111장"으로 잘못 표시되는 것을 막는다.

새 필드는 `_advKeys`(Firestore 병합 목록)에도 반드시 추가할 것.

---

## 고난 길 승점 계산 · 세션 시간

### 승점 (구절당)

```
playerHearts × (궁극의 암기 ? 5 : 4) × (무작위 순서 ? 2 : 1) × 부스터 배율
```

- **`maxPlayerHearts`가 아니라 `playerHearts`(현재 체력)** 를 쓴다 → 오답 1개당 체력이 1 줄고([game.js:21844](game.js#L21844)) **그 뒤 모든 구절의 승점이 영구히 낮아진다.** 세션 초반 오답의 손해가 특히 크다
- 부스터 배율은 `awardHardshipScore()`에서 적용
- 체력 상한은 100 (`(현재-4) × 3,000`젬), `maxPlayerHearts = 구매 체력 + (도감 15,000점 이상이면 3)`
- 그래서 같은 만점(예: 20/20)이라도 기록마다 승점이 크게 다를 수 있다 — 당시 체력·설정·부스터·세션 중 체력 손실이 모두 반영되기 때문

### 히스토리 배열 정렬 — **오름차순 불변조건**

`hardship*ClearHistory[장]`은 **반드시 오래된 것이 앞(오름차순)** 이어야 한다. 세 곳이 이 전제에 의존한다:

| 위치 | 동작 |
|------|------|
| 기록 저장 | `push(record)` — 최신을 **뒤에** 붙임 |
| 10개 유지 | `if (length > 10) shift()` — **앞**(가장 오래된 것)을 버림 |
| 화면 표시 | `.slice().reverse()` 후 `history.length - i`로 회차 번호 부여 |

> 동기화 병합([game.js:8737](game.js#L8737))이 내림차순으로 정렬해 이 불변조건을 깨뜨렸다.
> 그 결과 **회차 번호가 뒤집혀 "1회"가 최신 기록으로 표시**되고, 이후 세션마다 `shift()`가
> 가장 오래된 것이 아니라 **가장 최신 기록을 삭제**했다. 2026-09-06 수정.
>
> 병합 시에는 `sort((a,b) => a.date - b.date)` + `slice(-10)`을 쓸 것.
> 로드 시 `loadGameData()`가 정렬이 깨진 배열을 감지해 날짜순으로 복구한다.

### 세션 시간

`getHardshipElapsedSeconds()` **한 곳에서만** 계산한다 (결과 화면 상단 + 4개 모드 히스토리 기록).

- 답 제출 시 `pauseHardshipTimer()`, 다음 구절로 넘어갈 때 `resumeHardshipTimer()` →
  **정답 확인 화면을 보는 시간은 제외**된 순수 풀이 시간
- 일시정지 상태로 세션이 끝나도 열린 구간을 포함해 계산

> 이전에는 상단이 `Date.now() - stageStartTime`(일시정지 미차감), 히스토리가 `- pausedMs`(차감)로
> 서로 다르게 계산해 같은 세션에 43:48과 09:11이 동시에 표시됐다. 2026-09-06 헬퍼로 통일.

---

## 단어 버튼 파트 분할 (Step 2, Step 5, 보스/중간점검)

구절이 길 경우 단어 버튼을 여러 파트로 나눠 표시함. 공통 유틸 `splitChunksIntoParts()` 사용.

- **기준**: 20단어 이하 → 1파트, 21개 이상 → `Math.ceil(총/20)` 파트로 균등 분할
- 예: 24개 → [12]+[12], 58개 → [20]+[19]+[19]
- **버튼 정렬**: 가나다순 (`localeCompare('ko')`)
- **파트 라벨**: 2파트 이상일 때 상단에 `(파트 1/2 · 다음 파트: 12단어)` 표시, 마지막 파트엔 "다음 파트" 미표시
- 보스전(`loadNextVerse`)은 `currentBossParts` / `currentBossPartIndex` 변수로 파트 관리

---

## 중간점검(mid-boss) 구간 생성

구간은 하드코딩이 아니라 **절 수 기준 균등 분할**로 생성된다 (`buildMidBossRanges()`).

- `MIDBOSS_TARGET_VERSES = 4` — 중간점검 1개가 담당할 목표 절 수
- 분배 방식은 `splitChunksIntoParts()`와 동일 (앞쪽 구간이 1절씩 더 가져감)
- 예: 22절 → 4·4·4·4·3·3 / 29절 → 4·4·4·4·4·3·3·3
- 결과: 전체 **111개**, 구간 크기 3~4절, 404절 전부를 빈틈없이 덮음
- ID는 `{장}-mid-{끝절}`, 스테이지 객체에 `rangeStart`/`rangeEnd`/`targetVerseCount` 보유
- **소제목 없음** — `getStageTitle()`이 `stage_title_midboss`('📜 중간 점검 (3장 7~10절)')로 폴백

> 이전에는 신학적 소제목 기반으로 하드코딩되어 구간 크기가 3~9절로 들쭉날쭉했다.
> 소제목이 눈에 잘 띄지 않고, 임의 작명의 오해 소지와 애매한 경계 문제가 있어 2026-09-06 균등 분할로 전환.

구간을 바꾸면 `migrateMidBossRanges()`가 구 기록을 **끝 절을 포함하는 새 구간**으로 이전하고 고아 키를 삭제한다.
고아 키를 남기면 `getStageClearCounts()`/`getTotalMemoryLevel()`이 키를 순회하며 수치를 부풀리므로 반드시 정리해야 한다.
(절 단위 기록은 ID가 `{장}-{절}`이라 구간 변경의 영향을 받지 않는다.)

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

---

## 복습 타이밍 자동 팝업 (`openForgottenStagesOverlay`, game.js:6464)

왕의 길/자유여행 진입("아멘" 클릭) 시, 복습 가능한 스테이지가 있으면 자동으로 1회 표시됨.

- `amenAndStartGame()`에서 `window._pendingReviewPopupCheck = true` 예약 → `goMap()` 마지막에 `maybeAutoShowReviewPopup()`이 소비(1회성 플래그라 다른 `goMap()` 호출에는 영향 없음)
- 표시 조건: `isReviewPopupHiddenToday()`가 false **AND** `getForgottenStages().length > 0`
- 오버레이 내 체크박스("오늘은 보지 않기") 체크 시 `kingsRoad_hideReviewPopupDate`(localStorage)에 오늘 날짜(`getMemoryQuizDate()` 기준, 오전 6시 경계) 저장 → 당일 자동 팝업만 억제, 우측 하단 플로팅 버튼(`#forgotten-stages-floating-btn`)으로 수동 여는 것은 항상 가능

---

## Firestore 보안 규칙 — leaderboard 소유권 (2026-09-10)

`leaderboard/{tag}`의 `allow update`에 **소유권 검사가 없어서, 로그인한 아무나(익명 게스트 포함)
남의 문서의 비(非)서버필드를 고칠 수 있었다.** `nickname`·`tribe`·`friends`·`fcmToken`·
`notificationTimes`·`weeklyHistory`·`maxHearts`, 그리고 **`sessionToken`** 까지.

> `sessionToken`이 특히 나빴다. [game.js:19417](game.js#L19417)의 세션 감시가
> `serverData.sessionToken !== window.currentSessionToken`이면 '다른 기기 로그인'으로 판정하므로,
> 남의 문서에 아무 값이나 써넣으면 **그 사용자를 계속 강제 새로고침·원격 확인 흐름에 빠뜨릴 수 있었다.**
> (점수·재화는 `serverOnlyKeys()`가 막고 있어 랭킹 조작은 불가능했다.)

### 왜 '전면 금지'가 아니라 '필드 화이트리스트'인가

**친구 기능이 구조적으로 남의 문서에 직접 쓴다.** CF를 거치지 않는다:

| 동작 | 상대 문서에 쓰는 필드 |
|------|----------------------|
| 친구 신청 | `pendingReceived` |
| 신청 수락 | `friends`, `pendingSent` (신청자 문서) |
| 친구 삭제·차단 | `friends` |
| 응원 보내기 | `pendingCheers` |

그래서 소유권 검사를 통째로 걸면 친구 기능 전체가 죽는다.
→ **`friendWritableKeys()` 4개(`friends`/`pendingReceived`/`pendingSent`/`pendingCheers`)만 남에게 열어두고,
그 외 전부는 본인만** 쓰게 했다. 남은 위험은 친구 목록 훼손 정도로, CF로 옮기지 않는 한 남는다.

### 소유권 판정 — `saves/{uid}.tag`

문서 ID가 uid가 아니라 태그(`'8648'`)라 `request.auth.uid`와 직접 비교할 수 없다.
uid → 태그의 **유일한 권위 매핑은 `saves/{uid}.tag`** 이고, 서버도 이미 같은 근거로 판단한다
(`kingsroad/index.js` `verifyTag()`). `saves/`는 규칙상 클라이언트 쓰기가 금지(`allow write: if false`)라
위조할 수 없다.

```
function isOwner() {
  return request.auth != null
      && saveDoc() != null
      && 'tag' in saveDoc().data
      && string(saveDoc().data.tag) == userId;
}
```

- 같은 `get()`은 한 번의 평가 안에서 캐시되므로 **쓰기당 문서 읽기 1회**만 추가된다.
  leaderboard 쓰기는 알림 동기화·FCM 토큰·보상 수령 정도라 빈도가 낮다
- `exists()`를 따로 부르지 않는다 — `exists()`도 읽기 1회로 과금되므로 `get() != null`로 합쳤다
- **`saves/{uid}`가 아직 없으면 본인 쓰기도 거절된다.** 하지만 `submitScoreSecure`가 이미
  `verifyTag`로 같은 조건을 요구하므로, **점수가 올라간 적 있는 사용자는 반드시 saves 문서를 갖고 있다.**
  아직 없는 신규/게스트는 실패해도 다음 시도에 다시 쓴다
  (`syncReviewNotification`은 성공했을 때만 `_lastReviewNotifAt`을 갱신하므로 재시도가 막히지 않는다)
- `create`에도 같은 검사를 건다 — 남의 태그 자리를 선점하는 것을 막는다

### 남겨둔 것

- **`leaderboard`의 전체 공개 읽기(`allow read: if true`)는 유지.** 랭킹 표시에 필요하다.
  `sessionToken`이 함께 노출되지만 **서버는 이 값을 인증에 쓰지 않는다**
  (`kingsroad/index.js`·`functions/index.js`에 사용처 없음) — 읽혀도 계정 탈취로 이어지지 않는다.
  위험은 읽기가 아니라 쓰기 쪽이었고, 그쪽을 막았다
- **`system_cache`는 로그인 사용자 쓰기 유지** — [index.html:3139](index.html#L3139)이 랭킹 캐시를 직접 쓴다.
  오염되면 랭킹 표시가 잠시 틀릴 뿐이라 우선순위가 낮다
- **`allow delete: if false`** 때문에 [game.js:17831](game.js#L17831)의 옛 태그 문서 삭제는 조용히 실패한다
  (유령 문서가 남는 원인 중 하나로 의심됨 — 미확인)

배포: `firebase deploy --only firestore:rules` (게임 배포와 별개)

---

## 친구 기능

### 메모 (`kingsRoad_friendMemos` / `kingsRoad_memberMemos`)

메모는 localStorage에 저장되지만 **`saveGameData()` payload에도 함께 실린다**(`friendMemos`/`memberMemos`).

> 예전에는 localStorage에만 있어서 **기기를 바꾸거나 백업을 복원하면 사라졌다.**
> 백업 파일은 `kingsRoadSave`만 내보내므로 메모가 빠졌고, Firestore 동기화 대상도 아니었다.
> (`localStorage.clear()`는 "모두 삭제" 리셋에서만 호출되므로 유실 원인이 아니다.) 2026-09-07 수정.

- 로드 시 `_mergeMemos()`가 **이 기기의 메모를 우선하고 저장본에만 있는 항목만 보충**한다 — 양쪽 어느 것도 잃지 않는 합집합
- 이 방향 때문에 한쪽에서 지운 메모가 다른 기기에 남아 있으면 되살아날 수 있다 (파괴적이지 않아 허용)

### 친구 목록 정렬 (`_renderFriendScreen`)

목록은 **지난주 점수 내림차순**으로 정렬하고, 각 항목을 2줄로 표시한다.

```
닉네임                     1,200점  💛 ▶
#1234 · 메모
```

- 지난주 점수 = `weeklyHistory[getLastWeekId()] || prevWeekScore || 0` (친구 프로필과 동일한 계산)
- 정렬하려면 전체 점수를 알아야 하므로 렌더 전에 `Promise.all`로 친구 문서를 병렬 조회한다.
  `FRIEND_MAX = 20`이라 조회량이 제한적이고, 실패한 친구는 0점·닉네임 없음으로 처리해 목록 자체는 항상 그려진다
- 닉네임도 이 조회 결과에서 가져오므로 추가 비용이 없다
- 클래스: `.friend-list-name`(닉네임) / `.friend-list-sub`(#태그·메모) / `.friend-list-score`(지난주 점수)

---

## 구절별 백지 산출 기록 (`verseRecall`)

**"외웠다"의 유일한 증거**를 구절 단위로 남긴다. 망각의 고난(타이핑)·암송의 고난(음성)에서만 기록한다.

```js
verseRecall['1-1'] = { pass, typedPass, fail, firstPass, lastPass, lastAt, lastOk, hints, lastHints, lastMode, lastScoredAt }
```

> **`pass`와 `typedPass`는 다르다.** `pass`는 모든 백지 산출 성공, `typedPass`는 **타이핑으로 써낸 것만**(`mode === 'memory'`).
> 암송의 고난은 음성인식 80점이 통과선이라 타이핑 완전 일치보다 기준이 훨씬 느슨하고,
> 초학습 직후 확인(`'learn'`)은 방금 본 구절이라 증거 가치가 낮다.
> **첫 통과 보너스와 빠른 모드 백지 승급은 둘 다 `typedPass`를 기준으로 한다** —
> 음성으로 통과한 구절이 승급돼 타이핑 백지를 요구받으면 판정과 요구가 어긋나기 때문.
> `typedPass`가 없는 옛 기록은 로드 시 `pass`로 채운다(이미 받은 보너스를 다시 주지 않는 쪽을 우선).

> **왜 복습 스텝으로는 안 되는가**
> Step 2/5의 단어 버튼은 **답이 화면에 다 있는 재구성**이라, 단서 없이 산출할 수 있는지를 증명하지 못한다.
> 기억 연구의 용어로 복습 스텝이 재는 것은 **인출 강도**(retrieval strength — 지금 얼마나 쉽게 떠오르나,
> 주어진 단서에 크게 의존)이고, 우리가 알고 싶은 것은 **저장 강도**(storage strength)다.
> 인출 강도를 높이는 조건이 저장 강도를 높이지는 않는다(Bjork).
> 게다가 쉬운 성공은 **유창성 착각**을 만들어, 스텝을 보여주는 것 자체가 과신을 강화할 수 있다.
> 연구상으로도 회상 연습이 재인 연습보다 학습 효과가 크므로, 이 기록을 세는 것이 행동도 바람직한 방향으로 민다.

- **힌트 수를 함께 남긴다.** 통과했더라도 힌트가 많으면 아직 막히는 구절이다.
  `revealedHints`는 구절마다 초기화되므로 제출 시점의 길이가 곧 그 구절에 쓴 힌트 수다
- **오타 보정 통과도 성공**으로 본다 (내용은 떠올렸고 표기만 어긋난 경우)
- **집중 훈련은 기록하지 않는다** — 학습 보조이지 증거가 아니다
- 암송의 고난 통과선은 `ENDURANCE_PASS_SCORE = 80` (승점 만점 구간과 동일)
- `firstPass`/`lastPass`로 **간격을 두고 두 번 이상 성공**했는지(정착) 판정한다

이 기록으로 답할 수 있는 것:

| 질문 | 판정 |
|------|------|
| 백지에서 나오는 구절 | `pass > 0` |
| 진짜 정착된 구절 | `pass >= 2` **AND** `lastPass - firstPass >= 임계` |
| 아직 막히는 구절 | `pass === 0` 또는 `hints`가 큼 |
| 최근에 무너진 구절 | `lastOk === false` |

동기화 시 `_mergeVerseRecall()`이 병합한다. 진행도와 달리 '앞선 쪽'이 아니라
**시도 횟수가 많은 쪽**을 취한다 — 누적 기록이라 많이 쌓인 쪽이 나중 상태이기 때문.

---

## 복습 알림 (`syncReviewNotification`)

간격 반복은 **제때 돌아오게 만드는 것이 전부**이므로, 복습 시각 알림이 이 앱의 핵심 장치다.

**모델: "다음에 올 복습" 한 건만 서버에 유지한다.**

- `_computeNextReviewNotif()`가 자유여행·왕의 길의 `nextReviewTime`을 모두 훑어 **아직 오지 않은 것 중 가장 이른 하나**를 고른다
- `syncReviewNotification()`이 이를 `leaderboard/{tag}.reviewNotifications`(1건) + `reviewNotifEarliest`에 기록
- **`syncToFirestore()` 성공 시마다 호출**되므로 진도가 바뀌면 자동으로 따라간다. 값이 그대로면 쓰지 않아 Firestore 쓰기가 늘지 않는다
- 서버 `sendReviewNotifications`(functions/index.js, 매분)가 `reviewNotifEarliest <= now`를 훑어 FCM 발송

> **예전 방식의 문제 (2026-09-07 개편)**
> ① 결과 화면 버튼을 **매번 손으로 눌러야만** 예약됐다
> ② 버튼이 `rawHr <= 7` 조건이라 **23시간·3일·7일 복습에는 알림을 걸 방법이 아예 없었다.**
>    정작 잊어버리는 건 긴 간격 쪽인데 짧은 간격에만 알림이 있었다
> ③ `REVIEW_NOTIF_MAX = 5`로 최근 5건만 남아 나머지는 조용히 버려졌다
> ④ `TimestampTrigger` 지원 환경(안드로이드 크롬)은 **서버에 저장하지 않고** SW 예약만 걸었는데,
>    `sw.js` 폴백이 `setTimeout`이라 서비스워커가 종료되면 사라지고 서버가 대신 보내줄 수도 없었다

- 지금은 OS 예약과 서버 예약을 **둘 다** 건다 (한쪽이 실패해도 다른 쪽이 발송)
- 결과 화면 버튼은 '알림 켜기' 입구 역할 — 권한 요청 + `initFCM()` 후 `syncReviewNotification()`에 위임.
  이미 켜져 있으면 버튼 대신 "🔔 ~에 복습 알림을 보내드릴게요" 안내만 표시
- **끄기**: 알림 설정 모달의 `복습 시간 알림` 체크박스(`toggleReviewNotif`). 꺼짐은 `kingsRoad_reviewNotifOff`(localStorage).
  끄면 서버의 예약도 함께 지워 잔여 알림이 오지 않게 한다
- 권한이 없으면 켜져 있어도 서버 예약을 지운다 — 서버는 `fcmToken` 없는 문서를 건너뛰므로 `initFCM()`으로 토큰 확보가 선행되어야 한다

---

## 미션 포인트 시스템 (`missionData.points`, game.js:2527 부근)

일일/주간 퀘스트를 클리어(`claimReward()`)하면 기존 보석 보상과 별개로 **미션 포인트**가 적립되고, 마일스톤 도달 시 추가 보석 보상을 준다. 리그 순위표에 쓰이는 `leagueData.myScore`와는 완전히 분리된 시스템(그쪽은 서버 검증·일일 상한이 걸린 민감한 값이라 건드리지 않음).

- **완전 분리**: 일일 포인트(`missionData.points.daily`)와 주간 포인트(`.weekly`)는 서로 전혀 영향을 주지 않음 — 일일 미션 클리어는 daily에만, 주간 미션 클리어는 weekly에만 적립
- **고정 포인트 + 보스 클리어 시 만점 확장**: 클리어 1회당 `POINTS_PER_MISSION_CLEAR`(25점) 고정 적립. 보스를 한 번도 못 깼을 땐 기본 미션 4개뿐이라 만점이 100점(`getDailyPointMax()`/`getWeeklyPointMax()`가 `hasAnyBossCleared()` 기준으로 반환), 보스를 클리어해 고난 계열 미션이 열리면 만점 자체가 늘어남 — 일일은 100→200(4개 추가), 주간은 100→125(1개 추가)
  - 성경읽기 미션(`claimBibleReadReward()`)과 심화 미션(`claimAdvancedReward()`)은 별도 함수라 이 포인트 시스템에 포함되지 않음 (의도적으로 제외)
- **마일스톤**: `DAILY_POINT_MILESTONES_BASE`(40/70/100점) + 보스 클리어 후에만 추가되는 `DAILY_POINT_MILESTONES_EXPANDED`(150/200점), 주간도 동일 구조(`WEEKLY_POINT_MILESTONES_BASE` 40/70/100 + `_EXPANDED` 125). `getDailyPointMilestones()`/`getWeeklyPointMilestones()`가 `hasAnyBossCleared()`에 따라 BASE 또는 BASE+EXPANDED를 반환 — concat 순서가 고정이라 배열 인덱스로 중복 지급을 막을 수 있음. `checkMissionPointMilestones()`가 매 클리어마다 확인해 보석 지급 (달성 티어 인덱스는 `dailyClaimedTiers`/`weeklyClaimedTiers`에 기록)
- **리셋**: 기존 일일/주간 미션(자정·`getWeekId()` 기준)과 달리, 미션 포인트는 **오전 6시 경계** 기준으로 별도 리셋됨 — `checkMissionPointsReset()`이 `getMemoryQuizDate()`(일일)와 `getMissionPointWeekId()`(주간, 월요일 6시 기준)로 키를 비교해 날짜/주차가 바뀌면 초기화. `checkMissions()` 호출 시와 `claimReward()` 호출 시 둘 다 체크됨
- **UI**: `renderMissionList()`(실제 미션 화면, `#mission-list-area`)에서 `buildMissionPointSummaryHtml()`로 일일/주간 목록 상단에 현재 포인트와 다음 목표를 요약 표시. (레거시 `updateMissionUI()`는 `#mission-list`를 찾는데 이 엘리먼트가 DOM에 없어 항상 조기 반환되는 죽은 함수이므로 여기엔 UI를 추가하지 않음)
