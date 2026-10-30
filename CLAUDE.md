# CLAUDE.md — 킹스로드 (King's Road)

> **중요**: 코드를 수정한 경우, 관련된 내용(함수 위치, 데이터 구조, 동작 방식 등)이 이 파일의 내용과 달라졌다면 반드시 이 파일도 함께 업데이트해줘.

> **배포 시 필수**: `game.js`/`style.css`를 고치면 `index.html`의 캐시 버스팅 파라미터(`?v=YYYYMMDD`)를 **반드시 함께 올릴 것.**
> 파라미터가 그대로면 URL이 변하지 않아 브라우저 HTTP 캐시가 옛 파일을 계속 제공하고, 배포해도 사용자에게 반영되지 않는다.
> (2026-09-06: `?v=20260804b`가 고정된 채 하루 네 번 배포해 동기화 수정이 PC에 전달되지 않았고, 그 사이 데이터 손실이 재발했다.)
> `sw.js`는 코어 자산에 네트워크 우선 전략을 쓰지만, SW의 `fetch()`도 브라우저 HTTP 캐시를 거치므로 파라미터 갱신이 필요하다.

> **최상위 코드에서 브라우저 전용 API를 그냥 참조하지 말 것.** `game.js` 최상위의 `if (Notification.permission === 'granted')`가
> 아이폰 **사파리(설치 안 한 상태)** 에서 `ReferenceError`로 스크립트를 **그 줄에서 멈춰** 뒤의 초기화 5,000줄(고난·훈련의 `let`/`const` 선언 포함)이
> 안 돌았다 — 2026-03-23부터 09-17까지 반년. 설치 앱(iOS 16.4+)엔 Notification이 있어 설치한 사람만 멀쩡했다.
> 증상은 "버튼을 눌러도 모달만 닫힘·프로필 저장 실패"처럼 엉뚱한 곳에서 난다. `typeof X !== 'undefined'`로 감쌀 것.
> 헤드리스 크롬에서 `delete window.Notification`을 먼저 넣은 index 사본으로 재현·검증했다. 잡히지 않은 오류는 이제 화면 위 빨간 상자로 뜬다(`_showUncaughtError`, 세션당 1회).

> **배포 전 인라인 스크립트 문법 검사**: index.html의 `<script>` 블록(특히 `NOTICES`)은 `node --check`가 안 걸러준다.
> 2026-09-16 영어 제목의 `King's`(작은따옴표 안의 작은따옴표) 하나로 **공지 블록 전체가 파싱 실패**해 하루 동안 공지·패치노트가
> 아무에게도 안 보였고 공지 버튼도 죽어 있었다(9/17 헤드리스 크롬으로 발견). 공지를 고치면 블록마다 떼어 `node --check`를 돌리거나
> 헤드리스 크롬(`--dump-dom --enable-logging=stderr`)으로 콘솔 `Uncaught`를 확인할 것. 영어 문구의 `'`는 `'`.

> **Firestore는 배열 안에 배열을 저장하지 못한다.** 9/28에 넣은 힌트 흔적 `verseRecall[id].hm`이 `[[3,5],[],[1]]` 모양이라
> 힌트를 한 번 쓴 사람의 서버 저장이 **통째로** 거절됐다(`Property verseRecall contains an invalid nested entity`) — 9/28 14시~9/30 새벽, 최소 6명.
> 기기에는 남아 있어 날아가진 않았지만 다른 기기에 안 보였다. 저장본에 새 필드를 넣을 때 **배열의 배열**이면 문자열이나 객체로 바꿀 것(`_hmFix`).
> 서버 함수 로그(`firebase functions:log --only saveGameDataSecure`)의 `set 실패`가 신호다.

> **Firestore 문서 하나의 색인 항목은 4만 개까지다.** 404절을 다 외운 사람의 저장본(절마다 백지 기록·고난 기록·열매·도감…)이 이 한도를 넘어
> 저장이 통째로 거절됐다(`too many index entries for entity`) — 2026-10-12 흠없는 어린양·푸른 새벽별, 3만+가 셋 더 있었다. 그 사이 관리자 보상이
> 서버에서 지워지지 않아 **동기화할 때마다 또 더해져** 밭 74 → 303(#0HY3JE). → `firestore.indexes.json`의 `fieldOverrides`로 saves의 큰 필드 75개를 색인에서 뺐다(`firebase deploy --only firestore:indexes`).
> **저장본에 큰 맵·배열 필드를 새로 넣으면 fieldOverrides에도 넣을 것.** 보상(`compDone`)·바로잡기(`fixDone`)는 이제 한 번만 적용된다.

---

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
| `_studyModeBarHtml()` · `setStudyModeQuick(v)` · `studyModePreference` | game.js:~12210 | ⚡📖❓ 학습 방식 전환 줄 — 스테이지 창(`#sheet-study-mode`)·복습 목록 위, 매번 묻는 창의 「다음부터 묻지 않기」(10/19) · 10/21부터 기본 「빠른 복습」(옛 「매번 묻기」는 한 번 옮김 `smMig`, 처음 외우는 절은 늘 1~5단계) |
| `updateSheetTimers()` | game.js:~2956 | 60초마다 타이머 + 기억 강도 바 업데이트 |
| `stageClear(type, rewardMultiplier=1)` | game.js:~12127 | 스테이지 클리어 처리 전체. `rewardMultiplier`로 보상 배율 조정 (보통 모드: 0.7) |
| `openBossSetupModal(stage)` | game.js:~6170 | 보스/중간점검 진입 전 설정 모달 (난이도·순서 선택) |
| `setBossSetupOpt(type, value)` | game.js:~6218 | 모달 토글 클릭 핸들러 (type: 'difficulty'|'order') |
| `confirmBossSetup()` | game.js:~6228 | 모달 확인 → `startBossBattle()` 호출 |
| `chClean` · `_noteChClean(ch)` · `_chCleanOk(id)` | game.js:~8950 | 🏔️ 장을 통째로 백지로 쓴 가장 최근 판(보스전 백지·망각의 고난 백지 장 전체, +깨끗·−아님) — 조개 판 「주소 → 첫 마디」는 이 장만 (`docs/새-예루살렘.md` 10/29) |
| `_attachNextDiffBtn(anchor, midId, mode)` · `BOSS_DIFF_ORDER` | game.js:~17905 | 🪜 중간점검 결과 「다음 난이도」(보통→어려움→빈칸→백지, 백지엔 없음, 10/28) |
| `scoreRepeat` · `SCORE_REPEAT_MAX` · `_srFull(key)` · `_srNote(key)` | game.js:~33880 | 🔁 중간점검·보스전·오늘의 암송 — 같은 날 같은 난이도 승점 세 번까지(저장 필드, 병합은 같은 날 큰 쪽) (`docs/고난과-난이도.md` 10/28) |
| `saveGameData()` | game.js:4091 | localStorage에 저장 |
| `showBossHistoryModal()` | game.js:~6370 | 보스전 이전 파트/구절 보기 모달 표시/토글 |
| `generateVerseChoices(verse)` | game.js:~17908 | 구절의 고난용 4지선다 생성 (같은 장 2개 + 다른 장 1개) |
| `renderHardshipVerseVerse()` | game.js:~17933 | 구절의 고난 문제 렌더링 (주소 표시 + 4지선다) |
| `submitHardshipVerseGuess(idx)` | game.js:~17962 | 구절의 고난 선택지 제출 처리 |
| `toggleSavedVerse()` | game.js:~19065 | 기억하시나요 결과에서 구절 저장/해제 토글 — **10/19 화면에서 뺌**(버튼·메뉴 없음, 코드만 남음) |
| `openSavedVersesQuiz()` | game.js:~19184 | 저장된 구절 퀴즈 오버레이 열기 — **10/19 화면에서 뺌**(버튼·메뉴 없음, 코드만 남음) |
| `updateSavedVersesBadge()` | game.js:~19056 | 더보기 메뉴의 저장된 구절 배지 갱신 — **10/19 화면에서 뺌**(버튼·메뉴 없음, 코드만 남음) |
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
| `recordVerseRecall(id, ok, hints, mode, extra)` | game.js:~25400 | 백지·빈칸·음성 시도 1건 기록 — verseRecall 요약 + 백지레벨 + 힌트 흔적 + 일지(`_logRecallAttempt`). 시도 기록은 전부 여기를 지난다 |
| `_updateBlankBox(r, ok, blankMode, hintOk, now)` | game.js:~8400 | 백지레벨(라이트너 5상자) 갱신. 규칙은 `docs/복습과-기억.md` |
| `_buildNotifSchedule()` · `_njNotifItems(now)` | game.js:~26460 · ~9035 | 푸시 일정 — 복습 1건 + 백지 차례(최소 3시간·밤 피함) + 🍞🐦 만나·메추라기 오는 때(`kind:'nj'`, 거둬 본 사람·낮·그날만, 10/28 — 서버 functions/ `sendReviewNotifications`도 함께) |
| `_reviewOverlayHeadHtml(list)` | game.js:~8100 | 복습 목록 맨 위 — 오늘 백지 차례 · 중간점검/보스전으로 한 번에 |
| `_chapterBlankStats(chapter)` · `_mapBlankRingHtml(chapter)` | game.js:~7717 | 장별 백지 증거 집계(시트 헤더·지도 공용) · 지도 나무 둘레 백지 고리 |
| `_buildRiverFlow(points, scrollH)` · `_riverFlowTick` · `_riverGlintStep` | game.js:~7145 | 지도 강물 물결 — 구간별 SVG 조각, 보이는 조각만 초당 15번 흐름 · 가끔 빛줄기 |
| `_njDraw` · `openNewJerusalem()` · `_njPlace(k)` · `_njNoteBlankDay()` · `_njPearlCalc` | game.js:~7040 | 새 예루살렘 — 지도 맨 위 성 그림 · 건축 창 · 기초석 놓기 · 진주(주 5일 백지, 못 채운 주는 -1) · 바로 가기 `_njGoHtml` (`docs/새-예루살렘.md`) |
| `openNJ3DView()` → `nj3d.js`의 `openNJ3D()` / `closeNJ3D()` · `_njBuildFrom3D` · nj3d.js `intro`·`introStep` | game.js · nj3d.js | 새 예루살렘 3D 보기(별도 파일, 누를 때만 로드) — 지도 성 그림이 바로 성문(건축 창은 성 안 🔨) · 들어갈 때 하늘에서 내려오는 카메라 + 계 21:2/21:24 · 홈 칩 「🏛️ 성에서」(`opts.start` manna·stars) (10/15) — 산 위의 성·비탈을 내려가는 강·생명수의 바다와 70 나라가 한 세계, 걸어서 구경·점프·제트팩(`njJetpack` · 하루 1분 체험 `jetTrialTick`·`kr_jetTrial`)·🛝 남쪽 강 미끄럼(`slideStep`)·🏊 바다는 헤엄(`swimWater`·`SWIM_D`, 땅 높이는 그대로 수면 — 순례자만)·수면 한 장(`paintSea`), `openNJ3DView({start:'sea'})` |
| `_njGrowFruit` · `_njFruitList` · `_njFruitShadows` · `njEatFruit(key)` · `_njLeaves()` · nj3d.js `suspendNJ3D`·`resumeNJ3D` | game.js:~8300 | 생명나무 열매 — 백지 통과 절마다 열매(한 절에 한 번에 하나 — 먹은 뒤 다시 백지로 써야 다음, 겹친 옛 기록은 그림자, 10/16), 7일 뒤 익음, 먹기 = 그 절 백지 세션(`fruitKey`) → 🍃 잎사귀. 먹으러 갈 때 3D는 닫지 않고 숨겨 둔다(돌아오면 즉시, 15분 뒤 닫음) |
| `openSea()` · `_seaDraw`(해안 띠, 끌어서 넘김 `_seaView`) · `_seaHitNation` · `_seaCoastZ`·`_seaIsles`·`_seaNatSpan` · `_seaMine`·`_seaRefresh`·`_seaClearCells(ids)`·`_seaHeal(n)` · `_seaGeom`(ring·zone) · `_seaRiverEnd` · nj3d.js `pourSpot`·`pourSets`·`renderPour` | game.js · nj3d.js | 🌊 **내 바다**(10/5부터 개인 — 저장본 `njSea`·`njNat`) — 바다 창에서 1칸·10칸·되는 만큼(`_sea2dClear`·`_seaNextCells`, 10/15) 또는 3D에서 내가 있는 칸을 💎로 맑힌다(물가 300은 뭍에서 · 얕은 600·깊은 1,000은 ⛵ 배로, 둘레 7칸), 구역을 다 맑히면 단계 · 🍃 잎사귀로 나라 한 단계씩(2·4·8·16장 `NJ_NAT_LEAF`, 70 나라, 창 10장). 흐려짐 없음. 서버 `seaGive`·`seaWeekly`는 쓰지 않는다 |
| `_njFishQuestion` · `_njFishPay` · `_njFishGot` (game.js) · nj3d.js `fishUpdate` | game.js · nj3d.js | 🎣 낚시 — 맑은 물칸에서 💎로 그물, 입질 때 빈칸 4지, 🐟 = 바다 단계 값 |
| `NJ_PEARLS` · `_njClamDay()` · `_njClamQuestion()` · `_njClamResult(i, ok)` · `_njPearlSell(k, n)` · `_njPearlSellHtml()` · nj3d.js `clamSpots` · `askClam` · `openClam` · `openPearlShop` | game.js · nj3d.js | 🐚 진주조개 — 조개 셋 = 지난 오늘의 암송 세 절(`_njClamPickIds`), 고정 자리·미니맵 눌러 순간이동(`clamGo`)·조개를 눌러(`clamTap`) 그 절들을 백지로(10/17 — 단서 없이 빛깔 💎500 · 단서 흰 💎250), 한 주 날마다 다 열면 값진 1만(`njClamWeek`), 강 어귀 진주 장사(·소성된 나라 사신)에게 판다. `njClams`·`njPearlFound`·`njPearlSold` (`docs/새-예루살렘.md`) |
| `_njMannaToday()` · `_njQuailTime()` · `njManna` · `_njRoundLeft(kind)` · `njRoundStart(kind, from)` · `_njRoundResult` · `_njRoundsHtml()` · 🐚 홈 카드 `_recallCardHtml`(어제 세 구절 + 막힌 절 다시 묻기 `njClams.carry` · 앞에서 막힌 절은 다음 날 첫 마디 판 먼저 `_njStartStall`·`_njClamFpResult`·`_njClamFpPending`, `ss`·`fpFirst`·`fpOk`·`fpFail`·`fpTry`, 판 `clamfp` 10/22) · `_njPastDue`(판 `past`) · nj3d.js `mannaSpots` · `roundAsk` · `C.refreshDaily` · `miniDraw` | game.js · nj3d.js | 🍞 만나(오늘의 암송을 마치고 1시간 뒤 `NJ_MANNA_WAIT`) · 🐦 메추라기(그 만나를 거두고 2시간 뒤 `_njQuailOpen(i)`·`gotAt`, 10/28) · 🐚 조개(어제 세 절) — **백지 판**(10/17, `hardshipState.njRound` — 망각의 고난 아님, 승점 0.25/0.5), 홈 오늘의 암송 창 아래 세 줄 · 3D에선 「✍️ 백지로 쓰기」→ 성 숨기고 판 → 돌아오면 반영(✕로 나가도 성으로 `_njQuitRound`). 토요일 두 배 · 🗺️ 걷기 미니맵 (`docs/새-예루살렘.md`) |
| `REV_UNITS` · `_revUnitOf(id)` · `_revUnitLabel(u)` · `_njCarryExpand(core, skip)` · `_carryUnitHtml(id)` · `njClams.cs` · 일지 `cu` | game.js:~8886 | 📜 내용 단락 89개(10/26) — 어제 막힌 절(`cs`)을 다음 날 그 단락째 순서대로(5절까지 통째, 긴 단락은 앞뒤 한 절, 12절까지) · 판 안 주소 밑 단락 이름 (`docs/새-예루살렘.md`) |
| `SEA_ACTS` · `actInst`·`actStart`·`actFrame`·`makeFx` · `obsOpen`·`obsTick` · `openWatch(s, ci, ti)` (nj3d.js) | nj3d.js | 👀 바다 생물 관찰 — 종마다 움직임 3~4가지(가끔 저절로), 이번 주에 만난 아이를 누르면 3인칭 관찰 모드, 도감 카드 「👀 관찰」은 작은 물속 무대 (`docs/새-예루살렘.md`) |
| `NJ_SEA_DEX` · `_njDexOf(v)` · `_njDexToday()` · `_njDexAnswer(id, ok)` · `_njDexGroups()` · `_njDexHtml()` · `njDex` · nj3d.js `seaLoad` · `seaMake` · `SEA_ANIM` · `SEA_ACC` · `makeAcc` · `creatureTap` · `askDex` · 모델 `tools/blender/sea.py` → `models/sea/`(`SEA_V`) | game.js · nj3d.js | 🐠 바다 생물 도감 — 404절마다 생물(종 = v%12 · 꾸밈 = 84절씩 · 요일 빛깔), 지난주·이번 주에 백지로 쓴 절의 생물이 **모두** 제 빛깔로(10/17 — 내 둘레부터 소환 `dexSpawn`, 가까운 12마리만 그림 `DEX_SHOW`, 바닥 높이 `gridFloor`), 📜 문제는 제 요일 빛깔·제 시간대 아이만(`_njDexAskable`, 10/19) — 누르면 그 절을 **백지 판**(`njRoundStart('dex','3d')`·`window._njDexPick`) → 🐟(주 1회, 월 6시 초기화), 묶음 💎5,000 · 404칸 💎10만 (`docs/새-예루살렘.md`) |
| `_njVinePlant(n)` · `_njVineHarvest(id)` · `_njVineInfo(v)` | game.js | 🍇 포도원 — 소성된 나라에 💎로 심고 3일 뒤 거둠, 백지 쓴 날이 물 주기(4 + 물 준 날 × 3) |
| `NJ_OFFERINGS` · `_njOfferBuy(k, n)` · nj3d.js `openOffer` · `startProc` · `placeMembers` · `follow` | game.js · nj3d.js | 🎁 만국의 예물 — 소성된 나라 사신에게 청하고(장 보스전 = 열쇠, 🐟·🍇 = 값) 가문별 행렬(`PM` 사람·짐승 모델)로 성 둘레 자리에. 행렬 중 카메라는 끌어서 돌린다 |
| `NJ_GOODS` · `NJ_GOODS_SIZES` · `_njGoodsBuy(n, s, peace)` · `_njGoodsPeace(id)` · `_njGiftName(gf)` · `_njTreasurePay` · nj3d.js `goodsKey` · `packWithGoods` · `goodsCarry`·`goodsCart`·`goodsShip`·`goodsLand` · `dequant` · `topAt` | game.js · nj3d.js | 🏺 만국의 특산물 — 70 나라마다 하나, 나라 단계가 크기(×1 · ×1.4 · ×1.8, 🐟🍇 40·100·220)를 연다, 포장(꾸러미·궤·수레)·섬 나라는 다시스의 배, 무기 여섯은 🕊️ 평화의 모습(`pc`). 기록은 `njGifts`(`k: 'gd_<n>'`, `sz`). 모델 `tools/blender/goods.py` → `models/gifts/gd_*`·`pk_*`(`GIFT_V`) (`docs/새-예루살렘.md`) |
| `NJ_CONCEPTS` · `NJ_SETS` · `NJ_BIG` · `_njSetPick`·`_njSetAssemble`·`_njSetDisassemble` · `_njBigPick`·`_njBigAssemble`·`_njBigDisassemble` · nj3d.js `buildSet`·`placeSet`·`placeBig`·`bigShow`·`fishShow`·`haulShow`·`brideShow`·`setAnim`·`setFx`·`idleFx`·`decoSpot`·`decoExt` | game.js · nj3d.js | 🧩 세트 — 낱개를 다 모으면 조립(정해진 배치 + 연출), 해체하면 낱개. `njSets`, 낱개 `in`. 모델 `tools/blender/shepherd.py`·`galilee.py`·`harvest.py`·`wedding.py` |
| `NJ_MOUNTS` · `njMounts`·`njMountSel` · `_njMountBuy`·`_njMountCoat`·`_njMountGear`·`_njMountPick` · nj3d.js `loadMount`·`mountUp`·`mountDown`·`openTack`·`mountAnim` | game.js · nj3d.js | 🐴 탈것(+ 🪂 `NJ_WINGS`·`njWings`·`makeGlider`·`makeBackWing`·`equipWing` — 날개마다 활강 빠르기·덜 떨어짐) — 사서 타면 빨라지고, 점프는 탈것째, 공중에서 한 번 더 = 뛰어내려 글라이더, 성 안에선 내림. 장식은 탈것마다 따로. 모델 `tools/blender/mounts.py`·`mounts_horse.py`·`mounts_boat.py`·`mounts_bike.py` → `models/mounts/`(`MOUNT_V`) · 종류 `kind` animal·bike·boat |
| `NJ_DECOR` · `_njDecorBuy(k, x, z)` · `_njDecoSave(changes)` · nj3d.js `enterDeco`·`exitDeco`·`decoCam`·`placeDecor`·`loadDecor` | game.js · nj3d.js | 🛠️ 꾸미기 — 예물·🪴 꾸밈 아이템(💎)을 끌어서 놓고 돌리고 보관함에. `njDecor`, 예물 `x·z·r·st·mv`. 모델 `models/decor/*.glb`(`tools/blender/decor.py`, `DECO_V`) |
| nj3d.js `chunkInstanced` · `nearTick` · `addBlob` · `blobTick` · `sun.shadow.needsUpdate` | nj3d.js | 3D 가볍게(10/3·10/4) — 흩어진 InstancedMesh를 칸으로 쪼개 가까운 칸만 · 해 그림자는 멈춰 있을 때만 굽는다(움직이는 동안 0번) · 순례자·탈것·행렬·움직인 세트 조각은 발밑 둥근 그늘 · 모델 구석 그늘은 블렌더에서 꼭짓점 색으로(`lp.bake_ao`) (`docs/새-예루살렘.md`) |
| nj3d.js `pm` · `pmPose(dt, clip, over)` · `PM_OVER` · `PILGRIM_V` · `models/pilgrim/pilgrim.glb` · `tools/blender/pilgrim.py` | nj3d.js | 🧍 순례자 모델(10/20) — KayKit Mage(CC0)를 흰 겉옷·금빛으로, 뼈·동작째. 상태마다 동작 하나 + 동작에 없는 팔·다리 자세는 위 뼈만 덮어씀. 받기 전·실패하면 도형 순례자(`limbs`) (`docs/새-예루살렘.md`) |
| `NJ_WEAR` · `njWear` · `_njWearSt()` · `_njWearPick(k)` · nj3d.js `pm.wear` · `wearBody` · `PM_EMOTE` · `pm.emote` | game.js · nj3d.js | 👒 꾸밈 소품(머리 5·손 5, 💎) · 😊 감정 표현 6 — 모델 `wear_*`(머리 뼈)·`hold_*`(오른손 자리 뼈) (`docs/새-예루살렘.md` 10/21) |
| `NJ_LOOK` · `NJ_LOOK_DEF` · `_njLookGet()` · `_njLookSet(patch, sync)` · `njLook` · nj3d.js `PM_ALL` · `pmLook()` · `openLook(tab)` · `closeLook()` | game.js:~9884 · nj3d.js | 🙂 내 모습(10/20) — 머리 5·눈 4·눈썹 4·코 4·입 4·귀 3·볼터치·수염·피부/머리/눈 색, 값 없음. 부품은 모델 안 이름으로 켜고 끔, 색은 재질 색. 병합은 `mv` 나중 쪽 (`docs/새-예루살렘.md`) |
| nj3d.js `loadCity` · `cityAnims` · `wallPieces` · `models/city/*.glb` · `tools/blender/city.py` | nj3d.js | 거룩한 성 모델 — 보좌(녹보석 무지개·일곱 등불)·진주 문(큰 진주·천사)·깎은 기초석·벽옥 성벽. 모델을 다시 뽑으면 `CITY_V` |
| nj3d.js `loadGift` · `giftAnim(k, root)` · `placeGift` · `models/gifts/*.glb` · `tools/blender/` | nj3d.js | 예물 모델 — 블렌더 로우폴리(스크립트로 뽑음), 움직일 부분은 이름 붙은 축 노드. 모델을 다시 뽑으면 `GIFT_V`를 올린다 |
| `_blankDueToday(all)` · `_blankDueDoneToday()` · `BLANK_DUE_DAILY` | game.js:~11817 | 📏 백지 차례 하루 20절 — 화면에 보이는 「오늘 몫」(레벨 높은 절부터). 전체는 `_blankDueIds()` |
| `openBlankDueScreen()` · `_startBlankDue(ch, from)` · `openReviewFromHome()` · `_renderSheetBlankDue` · `_groupBlankDue` | game.js:~31230 · ~10390 | 홈 ✍️ 백지 → 오늘 백지 차례 창(장별 절 범위) · 📖 복습 → 마지막 여정의 복습 목록 · 장 목록 맨 위 「오늘 백지 차례 / 지금 쓰기」와 묶음 「✍️n」(`from='map'`) |
| `openLevelTest()` · `_startLevelTest(ch)` · `_ltNote` · `_ltShowResult(ch)` · `levelTests` · `_verseSeenMark`/`_verseSeenGet` | game.js:~27535 | 🎓 레벨 테스트 — 장 전체 주소만·무작위·백지, 승점 없음(그 장 모든 절의 장 전체 테스트는 망각의 고난으로 인정·같은 승점, 하루 둘 중 하나만 — `ltFull`·`ltPay`) · ⏱ `T.d` · 백지 단계 결과만 백지 레벨·복습에 들어감(10/9, `_ltGame`) · 첫 마디·빈칸 단계는 테스트 기록·일지 `lt`만, ☀️ 8시간 안에 본 절 표시 · 👁️ 마지막으로 본 시각(일지 `sx`) (`docs/암송-단계.md`) |
| `openOilScreen(ch)` · `_oilStage(id)` · `_oilNote(id, L, pass)` · `_oilFromAttempt` · `_oilBackfill()` · `_oilIcon(st)` · `oilLv` · `_mergeOil` | game.js:~27950 | 🪔 기름 단계(0~8, 감람 열매 → 한밤의 등불) — 절마다 증거로만 오르내림, 「내 암송」 화면(장 시트·고난 창·레벨 테스트 결과·암기 리포트 자리) (`docs/암송-단계.md`) |
| `BONE_CH` · `BONE_CUE` · `_boneCueHtml(id)` · `_boneMark(ch, i)` · `_boneVerse(ch, v)` · `_boneUnitRun(ch, a, b)` | game.js:~30512 | 🦴 뼈대 세우기(10/29, 1~22장 칩 177 · 고리 110) — 「내 암송」 장 화면 = 장 뼈대 칩 · 단락 칸(누르면 본문+고리) · ✍️ 단락 백지 · 완전 암송 계단. 고리 종류 🔔 소리 · 📛 이름 `n` · 📐 모양 `s`(10/29 🔢🔤🔷에서 — 작아서 구분이 안 됐다) (`docs/암송-단계.md`) |
| `openMalssi(ch)` · `_msSlots(ids)` · `_msRule(sl)` · `_msPick` · BONE_CH 💬 칩(장 화면 「말씨 — 헷갈리는 낱말」 칸) | game.js (`_oilChapterHtml` 밑) | 💬 말씨 고르기(10/30) — 보니/보매·들으니/들으매·가로되/말하되/가라사대·내가 또/또 내가·하니/하매 자리만 빈칸, 고르면 규칙 한 줄(+그 절의 장 칩). 「내 암송」 장 화면(그 장 전부)·전체 화면(외운 절 15). 규칙은 `docs/계시록-말씨.md` · 저장본 `msLog`{'장-절_자리': n·w·x·f·at}(병합은 자리마다 많이 푼 쪽, fieldOverrides 있음) |
| `myCues` · `_myCue(id)` · `_cueBoxHtml(id)` · `_cueForm`·`_cueSave`·`_cueDel`·`_cueTake` · `_cueLoadCh(ch)` · `_cuePendingHtml`·`_cueJudge` · Firestore `cues` | game.js (`_boneVerse` 밑) | 🔗 내 고리 등록·나누기(10/29) — 저장본 `myCues`(절마다 `at` 나중 쪽 병합) · 나눔은 `cues` 승인제(편지 창 검토 대기) · 「내 고리로」 `takes` (`docs/암송-단계.md`) |
| `openInitialLine(ch, mode)` · `_ilInitial` · `_fpBridgeHtml` · `_verseText(c, v)` | game.js:~28330 | 🔤 첫 글자 줄(장마다 절 첫 글자 한 줄 — 보기·순서·무작위 4지) · 🌉 첫 마디 순서대로에서 앞 절 끝 마디 (`docs/암송-단계.md`) |
| `firstPhraseOf(text, lv)` · `openFirstPhrasePick()` · `_startFirstPhrase(ch, lv)` · `startFirstPhraseNote()` · `fpRecall` | game.js:~26330 | 🔑 첫 마디의 고난(장 단위, 쉬움·보통·어려움 · 순서대로/무작위 `fpSeq`) · 📒 오답노트(5절부터) — 고난 엔진을 `startLv`로 빌려 쓴다 (`docs/고난과-난이도.md`) |
| `useStrongHint()` · `_mjPhrase(n)` · `MJ_MAX` · `hardshipState.mj` · 일지 `e.mj` | game.js:~32450 | 💧 마중물 — 🔑을 누를 때마다 첫 마디 한 마디씩(최대 3), 누른 수를 일지에. 통과해도 백지 레벨은 안 오름 (`docs/고난과-난이도.md` 10/23) |
| `_rlEligible()` · `_rlNoteFail(id)` · `_rlAsk()` · `_rlRestore()` · `_rlFinish()` | game.js:~29935 | 🌱 다시 익히기 — 백지 차례·망각의 고난(백지) 판에서 모르겠어요·틀린 절을 판 끝에 단어 절반 빈칸 → 백지로 다시. 그동안 trainingMode(승점·백지레벨·통계 밖), 끝나거나 나가면 판 기록을 되돌리고 「완료」(`docs/복습과-기억.md`) |
| `_blankFirstDue(id)` · `_bossReviewHold` · `BLANK_FIRST_STEP` · `_reviewNoAdvance` | game.js:~11025 | ✍️ 3일 뒤 복습(단계 6+)부터 백지 먼저 · 막히면 단계 그대로 내일 다시 · 보스전·중간점검은 백지로 깼을 때만 단계 6+ 절을 올린다 (`docs/복습과-기억.md`) |
| nj3d.js `DOOR_ON` · `doorBuild(id)` · `doorEnter(id)` · `doorGo()` · `doorPodium()` · `doorEnd(ok, out)` · `PM_EMOTE.cry` · `doorPick()` · `DOOR_PART`·`doorWords`(긴 구절은 14어절 이하 부분으로, id `장-절/부분`) · `DR` · `.nj3d-bag`(🎒 더보기) | nj3d.js | 🚪 좁은 문(10/22, 1단계 혼자 · 10/23부터 모두에게) — 성 북쪽 늘 있는 경기장(투명 뚜껑 · 입장문으로 걸어 들어감), 출발선 앞 막 → 모두 밟으면 3·2·1 출발·구절과 글자 공개, 도착하면 🏆 시상대, 줄마다 문 4(다음 어절만 열림 · 정답 문은 좁아지고 오답 문은 넓어짐 · 틀리면 직전 문 뒤로) · ⛰ 험한 길 장애물(🟩🟥 빨라지는·느려지는 길+🧱 낮은 천장·유리 징검다리·좁은 다리+미는 벽·🪨 흔들리는 징검다리+🚶 돌아가는 길·🟨 움직이는 발판·🪨 굴러오는 돌·🔨 진자 망치·🗼 솟는 기둥, 돌아가는 길은 지그재그·🕳️ 아랫길·🪜 윗길 `dv`, 경기장 높이 `DR.RH`(회전 막대는 뺌, 같은 종류 연달아 없음 `prevT`) · 🕊️ 고요한 구간(`DR.CALM`, 글자는 거기서 드러남 `doorReveal(on, only)`)·끝 점프 `offEdgeAt` · 떨어지면 손을 떼야 다시 걷기 `moveHold` · 🕊️ 데려다주기(버튼 `doorFlyBtn`) `DOOR_LIM`·`doorFlyStart` · ✨ 세 번 틀리면 정답 문 반짝 · 📖 구절 고르기 `doorPickOpen`·`doorCh` · 🎥 시점 고정 `camLock`·`camLockOn()`(경기장은 추천 시점, 유리·징검다리는 위에서 `obs.tops`) · 지나온 줄 반투명 · 경사로 · 🕹️ `.nj3d-joyzone` — `OB`·`doorObsAnim`·`doorObsHit`·`doorFall`, 떨어지면 직전 문 앞) · `rebuild`는 경기장 상자를 남긴다 · 오른쪽 버튼은 🎒 더보기로 묶음 · 다음: 유령 → 실시간 (`docs/새-예루살렘.md`) |
| `_doorDb()` · `_doorInbox()` · `_doorInvShow` · `_doorJoin(room)` · `openDoorInvite(o)` · nj3d.js `doorRoom` · `doorRoomJoin`·`doorRoomLeave` · `roomCfg`·`roomGo`·`roomLobbyTick`·`roomTick`·`roomRemote`·`roomCard` · kingsroad `doorRoom` · `database.rules.json` | game.js ~10470 · nj3d.js | 👥 좁은 문 함께 달리기(10/25) — **Realtime Database**(asia-southeast1) `door/{방}`(allow·cfg·go·m·p·f) · `doorInv/{uid}`. 친구·길드원 4명, 👑(먼저 들어온 사람)가 구절·출발, 서버 시각에 같이 출발, 0.1초마다 자리, 도착 순 순위 (`docs/새-예루살렘.md`) |
| `_chLastTouch()` · `_chQuiet(id)` · `QUIET_CH_MS` · `_resetSoonIds()` · `RESET_WARN_MS` | game.js:~12190 | 🤫 1주 동안 손대지 않은 장은 복습·백지 차례·홈 할 일·알림에서 조용히(기록은 그대로, 앱이 내준 절도 손댄 것) · ⏳ 처음으로 돌아가기 3일 전 홈 칩·복습 목록 맨 위 (`docs/복습과-기억.md` 10/22) |
| `_resetLongUnstudied()` · `_stabilityHours(step)` · `_blankCountsAsClear(id)` · `getForgottenStages(all)` · `REVIEW_DAILY` | game.js:~11300 | 30일 넘게 밀린 절은 처음으로(백지 차례 살아 있으면 예외) · 보너스 선은 (10/12) 새 절(단계 2~3)·백지 안 써낸 절만 · 복습 목록은 하루 30절(낮은 단계부터)·백지 차례 온 절 제외 · 백지로 써낸 절 = 그 절 일반 클리어(고난·백지 차례·오늘의 암송·열매) |
| `_unifyJourneyMemory()` · `collectionLegacy` | game.js:~5610 | 두 여정 진도를 한 벌로(불러올 때) · 합치기 전 도감 점수 보존(체력 +3) |
| `openGiftFruit(tag, nick)` · `_giftSend` · `_giftCheckInbox` · `_giftArrive` · `_giftOnBlank` · `eatGiftFruit(id)` · `openGiftBasket()` · `njGiftFruits` | game.js:~26480 | 🎁 나눔 열매 — 내 💎로 친구·길드원·동행에게, 받은 이가 백지로 익히고 먹으면 💎 반·🍃. 받는 이 문서 `pendingFruits`·`pendingThanks` (`docs/새-예루살렘.md`) |
| `renderHomeTodo()` · `_todoSocial` · `_syncSocialBadges()` · `updateFriendBadge()` | game.js:~29250 | 홈 「오늘 할 일」(복습·백지·응원·길드 출석)과 친구/길드/더보기 배지. `updateNotificationBadges`가 함께 그린다 |
| `maybeShowGoogleNudge()` · `googleNudgeLink()` · `_googleNudgeEligible()` · `googleNudge` | game.js:~26103 | 🔒 내 기록 지키기 — 구글 미연결에게 1(처음 한 절, 「내일의 약속」보다 먼저 `_googleFirstPending`)·5·20·50·100·200절째 클리어 직후 한 번 + 홈 🔒 칩, 앱 안 브라우저 제외 (`docs/저장과-동기화.md`) |
| `_checkReturnBoost()` · `_returnBoostExtra(gem)` · `_renderReturnFloat()` · `returnBoost` | game.js:~29450 | 돌아온 순례자 — 14일 넘게 쉬면 7일간 암송 보석 2배(동기화 뒤 판정), 효과 기록 포함 (`docs/랭킹과-이벤트.md`) |
| `openGuideScreen()` · `openGuideQuiz()` · `_guideSync()` · `_guideNoteDay()` · `_guideTryGraduate()` · `guideInfo`·`guideRel` | game.js:~29700 · kingsroad `guide*` | 🧭 인도자와 동행 — 시험(다 맞힐 때까지) → 인도자 코드, 초심자 신청·승낙, 정착 졸업(망각의 고난 한 장 + 4주 연속 주 3일) → 성 나무에 빨간 열매 (`docs/인도자와-동행.md`) |
| `_dailyMakeupList()` · `startDailyMakeup(day)` · `_dailyMakeupHtml()` · `_isMakeupEventId` · `dailyMakeup` | game.js:~20300 | 🌿 못 한 날 채우기(10/19) — 쉬는 날에만 이번 주 못 마친 날을 백지로, 승점 절반, ✅·주간 칭호·연속엔 안 듦, 일지 「채움」 (`docs/랭킹과-이벤트.md`) |
| `openDailyJournal(view)` · `_dailyLogSync()` · `dailyLog` · `_djMonthHtml` · `_djJourneyHtml` | game.js:~19280 | 📖 오늘의 암송 일지 — 날마다 한 절·단계를 400일 보관, 한 달 달력(등잔)·여정 전체(22장 칩 + 주×요일 칸), 스크린샷용 카드 (`docs/랭킹과-이벤트.md`) |
| `openLetterBoard(tab, kind, topic)` · `openLetterWrite(kind, topic)` · `_letterNudge(reason)` · `_letterJudge` · `_letterLike` · `LETTER_ADMIN_UID` · 💡 `TIP_TOPICS`·`_tipPick`·`_tipLineShow`·`_tipText`·`_tipNudge`·`_tipAsk` | game.js:~21730 | 💌 편지 · 💡 꿀팁(10/15) — 승인제 게시판(Firestore `letters`, 관리자 #8648), 꿀팁은 주제(`topic`)·외운 절 수(`vn`), 결과 화면·성문 앞 한 줄 · 막막한 순간 하루 한 장 (`docs/UX-결정기록.md`) |
| `renderHomeTogether()` · `_togetherLoad()` · `_togetherHtml(kind)` · kingsroad `togetherStats` | game.js:~33500 · kingsroad/index.js | 🙏 최근 7일 함께 암송한 성도(10/19 「이번 주」 문구를 바로잡음 — 월요일부터가 아니라 지난 7일) — 서버가 6시간마다 `stats/together`{people, verses}(지난 7일 실제 암송), 홈 「여정 시작」 아래 한 줄 · 편지 창 머리 (`docs/UX-결정기록.md`) |
| `openDailyRecorder()` · `_camDrawLoop` · `_camBeautyFrame(v, w, h, amt)` · `_camDrawWithBg` | game.js:~17400 | 🎥 오늘의 암송 촬영 — 캔버스에 그려 녹화, 액자·WebGL 피부 보정(강도 `softAmt`)·배경 바꾸기 |
| `_applyPendingCompensation(data, pc)` · `compDone` · `_applyPendingFix(data, fx)` · `fixDone` · kingsroad `saveGameDataSecure`(`pendingFix` 이어 붙임·적용한 저장만 「줄지 않게」 건너뜀) | game.js:~14250 | 관리자 보상(더하기)·바로잡기(값 정하기) — 둘 다 열쇠로 **한 번만** (10/12) (`docs/저장과-동기화.md`) |
| `_autoMergeRemote()` · `_syncIdle()` · `_remoteMergePending` · `checkRemoteIsNewer()` · `_showRemoteNewerBannerUI()` | game.js:~14900 | 📱 다른 기기 기록 — 새로고침 안내 대신 그 자리에서 앱을 열 때와 같은 병합(게임·3D·대결 중엔 미룸), 실패하면 안내 (`docs/저장과-동기화.md` 10/14) |
| `_googleLostPrompt()` · `_noteGoogleDevice()` · `kr_wasGoogle` · `initFirestoreSync`의 forceRemote 예외 | game.js:~24229 · index.html 익명 로그인 | 🔑 구글로 쓰던 기기가 로그인을 잃고 익명으로 새로 들어오면 다시 로그인 권유 · 같은 태그·기기 쪽이 최근이면 「기록 가져오기」도 병합 (`docs/저장과-동기화.md` 10/13) |
| `openNJVisit(tag, nick)` · `_njVisitEnd` · `_njVisitItem` · `_njGuestbook` · `_njVisitClaim` · `_njMineBar` · nj3d.js `opts.visit`·`visitTap` · kingsroad `njVisitOpen`·`njVisitSign`·`njVisitQuiz`·`njVisitClaim` | game.js:~9910 · nj3d.js | 🕊️ 친구·길드원의 새 예루살렘 구경 — 꾸밈을 잠시 바꿔 끼우고(**그동안 저장 멈춤**, 닫으면 되돌림) · 물건마다 말씀 빈칸 → 손님 💎300·주인 💎500(하루 5만) · 오전 6시 기준 방명록 (`docs/새-예루살렘.md` 10/14) |
| `openNJBrowse(tab)` · `_njOpenToggle()` · kingsroad `njVisitSetOpen`·`njVisitList` | game.js:~10500 · kingsroad/index.js | 🌍 누구나 들어오기(주인이 켬, `njVisits/{태그}.open`)·둘러보기 목록(인기·새로·아무 곳·같은 지파) — 구경 3단계(10/19, `docs/새-예루살렘.md`) |
| `openBattle(opts)` · `_battleLog` · `battleReviewVerse(id)` · `_battleInboxRefresh` → battle.js `openBattleScreen`·`makeQs`·`play`·`result` · kingsroad `battleCheck`·`battleSend`·`battleAnswer` | game.js:~9862 · battle.js | ⚔️ 말씀 대결(도전장) — 장을 골라 7문제(순서·빈칸·주소·다음 어절), 받은 사람이 같은 문제로 보낸 사람 기록과 겨룸. 구글 연동끼리·친구/길드원·하루 10장, 승패(`leaderboard.battleW/L/D` 서버 전용) · 💎 보상은 장마다 하루 한 번·하루 10판(`battleRw`·`battleRwClaim`, 10/14), 일지엔 `m:'battle'`·`tr` (`docs/말씀-대결.md`) |
| `_exitLabel()` · `_exitNote()` · `exitLog` · `_pauseCheck()` · `_pauseAsk()` · `pauseWhy` · `lastSeenDay` | game.js:~20500 | 🚪 떠난 화면(최근 20)·💬 0~49절이 3일+ 쉬었다 오면 까닭 한 번 묻기 — 라이트 유저 이탈 원인(10/19, `docs/UX-결정기록.md`) |
| `firstSurvey` · `FS_Q` · `_fsChipsHtml(k)` · `_fsTap` · `_firstSurveyAsk()` | game.js:~20865 | 📝 처음 온 사람 설문(10/26) — 이름 정할 때 알게 된 길(선택) · 첫 절 뒤 「내일의 약속」 다음에 온 까닭·암송 경험, 월요일 모아 보기에 (`docs/UX-결정기록.md`) |
| `_firstLearnNovice()` · `_btGuideStart(overlay)` · `hardship_step1_novice` · `.novice-pulse`·`.novice-tip` · `_s1NoviceNext()`(1단계 끝 「다음 단계로」 안내) | game.js:~28610 · ~16237 | 🌱 처음 온 사람(깬 절 3개 미만) — 낭독 화면 「먼저 귀로」 + 남은 시간, 1단계 쉬운 안내 + 「읽기」 손가락 (`docs/UX-결정기록.md` 10/23) |
| `_verCheck()` · `_verBar(kind)` · `_verReload(auto)` · `_appVer` | game.js 맨 끝 | ✨ 새 버전 알림 — 깨어날 때·30분마다 서버 버전과 견줘 띠, 하루 지나면 안전한 순간에 조용히 새로고침 + ✕로만 닫히는 안내 (`docs/UX-결정기록.md` 10/23) |
| `SoundEffect` | game.js:~3987 | 효과음 신디사이저 — 종소리 `_note`, 출력 `_bus`, 잠든 오디오 깨우기 `_play`, 진동 `_buzz` |

---

---

## 배포

```bash
firebase deploy --only hosting            # 정적 파일 (현재 폴더 전체)
firebase deploy --only functions          # Cloud Functions 양쪽
firebase deploy --only firestore:rules    # 보안 규칙
firebase deploy --only database           # Realtime Database 규칙(database.rules.json — 좁은 문 함께 달리기)
```

- Firebase 프로젝트: **`kings-road-rank`** (`.firebaserc`)
- **앱 주소가 둘이다** — Cloudflare `kingsload.pages.dev`(git push로 자동) · Firebase `kings-road-rank.web.app`·`firebaseapp.com`(`firebase deploy --only hosting`). **배포할 때 둘 다 올릴 것.** 10/14까지 Firebase 쪽이 7/26 앱으로 남아, 그 주소로 쓰는 사람은 10/10부터 저장이 전부 거절됐다(기준 시각을 안 보내는 옛 앱 — 「기준 없는 저장은 기존 문서를 못 덮는다」). `docs/저장과-동기화.md` 10/14
- Hosting은 이 폴더를 통째로 올린다. `functions/`·`kingsroad/`·`assets`·`images`는 제외 (`firebase.json`의 ignore)
- **Cloud Functions가 두 벌이다**: `functions/`(default) · `kingsroad/`(codebase kingsroad, asia-northeast3). 고친 쪽을 배포해야 한다
- 함수 배포가 `User code failed to load ... Timeout after 10000`으로 멈추면 `FUNCTIONS_DISCOVERY_TIMEOUT=120`을 붙인다 (OneDrive 폴더라 로딩이 느리다). 배포 전 해당 폴더에 `npm ci`
- 규칙: `firestore.rules` · 색인: `firestore.indexes.json` — 새 랭킹 쿼리를 만들면 색인도 함께 추가
- **배포 전에 맨 위 경고 네 개를 다시 볼 것.** 캐시 버스팅과 인라인 스크립트 문법 검사는 실제로 하루씩 날린 적이 있다

---

## 절대 깨면 안 되는 불변조건

**1. 히스토리 배열은 오름차순 (오래된 것이 앞)**
`hardship*ClearHistory[장]`은 `push`로 뒤에 붙이고 `shift()`로 앞을 버린다. 화면은 `reverse()`해서 보여준다.
동기화 병합이 내림차순으로 정렬해 이 전제를 깨뜨린 적이 있다 — 회차 번호가 뒤집히고, 이후 `shift()`가 **가장 최신 기록을 지웠다**.
병합할 때는 `sort((a,b)=>a.date-b.date)` + `slice(-10)`. 자세한 내용은 `docs/고난과-난이도.md`.

**2. 저장은 낙관적 동시성 제어를 거친다**
클라이언트가 기준으로 삼은 서버 `updatedAt`을 `baseUpdatedAt`으로 함께 보내고, `saveGameDataSecure`가 트랜잭션 안에서 비교해 더 최근 저장이 있으면 거절한다. 이 검사를 우회하는 경로를 만들면 기기 간 데이터가 사라진다.
**기준 시각(`serverUpdatedAt`)은 저장본에 남아야 한다** — `saveGameData`가 빠뜨려 앱을 다시 열 때마다 기준이 0이 되어 첫 업로드가 검사 없이 서버를 덮었다(10/7 #TJNGGW 주간 승점 2만 → 9,994). 저장본 필드를 정리할 때 이것을 지우지 말 것.

**3. 암기 진행도는 필드 단위로 병합한다 (`_mergeSaveProgress`)**
두 기기가 각자 진도를 냈을 때 한쪽을 통째로 버리지 않고 스테이지별로 앞선 쪽을 취한다. **로컬 우선·원격 우선 두 경로 모두**에 적용되어야 한다 — 원격 우선 경로가 빠져서 오프라인 복습 진도가 통째로 사라진 적이 있다.
앞선 쪽 판정: **마지막으로 복습 단계를 올린 시각**(`다음 복습 − 그 스텝 대기`) → `reviewStep` → `lastClear`. 클리어 횟수는 큰 쪽. (10/2까지 스텝 우선이었다 — 갈래가 다른 기록끼리는 스텝을 비교할 수 없어 봄에 멈춘 기록이 이겼다)
**두 여정(왕의 길·자유여행)은 진도 한 벌을 같은 객체로 함께 쓴다** (`_unifyJourneyMemory`, 10/2). 진도 맵을 새 객체로 바꿔 끼우는 코드를 만들면 한쪽만 바뀌어 다시 갈라진다. **저장 직전·모드 전환 때 `_ensureOneMemory()`가 한 벌로 맞춘다** — 불러오기를 안 거친 새 사람은 두 벌이라 첫 절 기록이 저장에서 통째로 빠졌다(10/20 새 사람 셋, `docs/저장과-동기화.md` 10/21). 저장본에는 10/12부터 최상위에만 쓴다(`kingsMode`엔 길 정보 3개만) — 불러올 때 `_unifyJourneyMemory`가 같은 객체로 만든다.
**저장본에 진행 필드를 새로 넣으면 `_mergeSaveProgress`에도 넣을 것** — 빠진 필드는 다른 기기의 저장이 통째로 덮어쓴다. 오늘의 암송(`eventProgress`·`dailyReciteDone`)이 9/17에 들어와 9/28까지 빠져 있었다(`_mergeEventProgress`).

**4. 서버가 정하는 값은 클라이언트가 못 쓴다**
랭킹·점수 관련 필드는 `submitScoreSecure`의 화이트리스트를 거치고, 보안 규칙의 `serverOnlyKeys`가 직접 쓰기를 막는다. 새 랭킹 지표를 추가하면 **클라이언트 전송 · 함수 화이트리스트 · 규칙 · 색인 네 곳을 모두** 손봐야 한다. 자세한 내용은 `docs/저장과-동기화.md`.

**5. 시각은 서버 기준 (`clock.js`)**
주간 랭킹·일일 스테이지처럼 기간이 걸린 것은 기기 시계를 믿지 않는다.

---

## 주제별 기록 — 필요할 때만 읽는다

이 파일이 너무 길어져서 주제별로 나눴다. **작업 주제에 해당하는 문서만 읽으면 된다.**

| 문서 | 내용 |
|---|---|
| `docs/고난과-난이도.md` | 망각의 고난, 보스전·중간점검, 빈칸·백지, 난이도 추천, 세션 이어하기, 승점 계산 |
| `docs/길드와-레이드.md` | 길드 구조·레벨, 레이드 HP·대미지, 장비, 감사 로그, Cloud Functions |
| `docs/복습과-기억.md` | 기억 강도(에빙하우스), 복습 소요 시간 표본, 구절별 백지 기록(`verseRecall`), 복습 알림 |
| `docs/밭과-단비.md` | 밭(체력의 재정의), 단비, 햇살, 이정표, 도감 점수 |
| `docs/랭킹과-이벤트.md` | 실시간 암송왕·통독왕, 주간 랭킹 보상, 기간 한정 이벤트, 오늘의 암송, 미션 |
| `docs/저장과-동기화.md` | 기기 간 동기화, 서버 시각, Firestore 보안 규칙, 태그(#번호) 발급, 친구 |
| `docs/UX-결정기록.md` | 실측 사용률, 온보딩, 힌트 정책, 토스트 규칙, 지도 헤더 |
| `docs/인도자와-동행.md` | 인도자 시험·동행·정착 지표(망각의 고난 + 4주 연속 주 3일)·빨간 열매 — 오프라인에서 초심자 곁에서 돕는 도구 |
| `docs/암송-단계.md` | 구절별 암송 단계(증거로만 오르내림)·묶음·「다음 할 것」 설계 — 초안, 검토 중 |
| `docs/설문-헤비유저.md` | 헤비 유저 데이터 검토와 설문 문항 초안 |
| `docs/말씀-대결.md` | 1:1 말씀 대결(장 선택·앱 안 도전장·구글 연동끼리·승패만) — 구현 계획 초안 |
| `docs/계시록-말씨.md` | 계시록 문법 경향 — 보니/보매·들으니·가로되/말하되·하니/하매·절 끝·장면 여는 말, 절 목록과 예외 |
| `docs/새-예루살렘.md` | 밭 100 이후 — 열두 기초석·진주·생명나무 열매·바다와 만국·3D, 보석 수입 실측 |
| `REVELATION_TOPICS.md` | 계시록 주제 분류 데이터 |
| `DEPLOYMENT_GUIDE.md` · `README.md` | 초기 설정 안내 |

> **기록을 남길 때**: 코드를 고쳐서 이 문서들의 내용이 달라졌다면 해당 문서를 함께 고친다.
> 새 결정·버그 수정 기록은 **주제 문서 쪽에** 날짜와 함께 덧붙이고, CLAUDE.md에는 넣지 않는다.
> CLAUDE.md에 추가할 것은 「경고」·「불변조건」·「주요 함수 위치」 셋뿐이다.

---

## 작업할 때

- `game.js`가 1.5MB 한 파일이다. 위치를 찾을 때는 **「주요 함수 위치」 표를 먼저 보고**, 없으면 `grep -n "function 이름" game.js`
- 함수 위치 표의 줄 번호는 수정하면 밀린다. 크게 고쳤으면 표의 줄 번호도 갱신한다
- 잡히지 않은 오류는 화면 위 빨간 상자로 뜬다(`_showUncaughtError`, 세션당 1회). 사용자가 "버튼이 안 돼요"라고 하면 이 상자를 먼저 물어본다
- 헤드리스 크롬으로 실제 오류를 재현·검증해온 이력이 있다(`--dump-dom --enable-logging=stderr`). 브라우저 전용 API 문제는 이 방법이 가장 빠르다
