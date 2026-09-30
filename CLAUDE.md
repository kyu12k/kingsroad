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
| `recordVerseRecall(id, ok, hints, mode, extra)` | game.js:~25400 | 백지·빈칸·음성 시도 1건 기록 — verseRecall 요약 + 백지레벨 + 힌트 흔적 + 일지(`_logRecallAttempt`). 시도 기록은 전부 여기를 지난다 |
| `_updateBlankBox(r, ok, blankMode, hintOk, now)` | game.js:~8400 | 백지레벨(라이트너 5상자) 갱신. 규칙은 `docs/복습과-기억.md` |
| `_buildNotifSchedule()` | game.js:~19800 | 푸시 일정 — 복습 1건 + 백지 차례(최소 3시간·밤 피함) |
| `_reviewOverlayHeadHtml(list)` | game.js:~8100 | 복습 목록 맨 위 — 오늘 백지 차례 · 중간점검/보스전으로 한 번에 |
| `_chapterBlankStats(chapter)` · `_mapBlankRingHtml(chapter)` | game.js:~7717 | 장별 백지 증거 집계(시트 헤더·지도 공용) · 지도 나무 둘레 백지 고리 |
| `_buildRiverFlow(points, scrollH)` · `_riverFlowTick` · `_riverGlintStep` | game.js:~7145 | 지도 강물 물결 — 구간별 SVG 조각, 보이는 조각만 초당 15번 흐름 · 가끔 빛줄기 |
| `_njDraw` · `openNewJerusalem()` · `_njPlace(k)` · `_njNoteBlankDay()` · `_njPearlCalc` | game.js:~7040 | 새 예루살렘 — 지도 맨 위 성 그림 · 건축 창 · 기초석 놓기 · 진주(주 5일 백지, 못 채운 주는 -1) · 바로 가기 `_njGoHtml` (`docs/새-예루살렘.md`) |
| `openNJ3DView()` → `nj3d.js`의 `openNJ3D()` / `closeNJ3D()` | game.js · nj3d.js | 새 예루살렘 3D 보기(별도 파일, 누를 때만 로드) — 산 위의 성·비탈을 내려가는 강·생명수의 바다와 70 나라가 한 세계, 걸어서 구경·점프·제트팩(`njJetpack`), `openNJ3DView({start:'sea'})` |
| `_njGrowFruit` · `_njFruitList` · `njEatFruit(key)` · `_njLeaves()` | game.js:~7100 | 생명나무 열매 — 백지 통과 절마다 열매, 7일 뒤 익음, 먹기 = 그 절 백지 세션(`fruitKey`) → 🍃 잎사귀 |
| `openSea()` · `_seaDraw` · `_seaGive` · `_seaRiverEnd` | game.js · kingsroad `seaGive`·`seaWeekly` | 생명수의 바다와 만국 — 모두의 바다 `sea/world`, 💎 물칸(에스겔 네 단계)·🍃 70 나라(창 10장), 길드 이름으로 기록 |
| `_njFishQuestion` · `_njFishPay` · `_njFishGot` (game.js) · nj3d.js `fishUpdate` | game.js · nj3d.js | 🎣 낚시 — 맑은 물칸에서 💎로 그물, 입질 때 빈칸 4지, 🐟 = 바다 단계 값 |
| `_njVinePlant(n)` · `_njVineHarvest(id)` · `_njVineInfo(v)` | game.js | 🍇 포도원 — 소성된 나라에 💎로 심고 3일 뒤 거둠, 백지 쓴 날이 물 주기(4 + 물 준 날 × 3) |
| `NJ_OFFERINGS` · `_njOfferBuy(k, n)` · nj3d.js `openOffer` · `startProc` · `placeMembers` · `follow` | game.js · nj3d.js | 🎁 만국의 예물 — 소성된 나라 사신에게 청하고(장 보스전 = 열쇠, 🐟·🍇 = 값) 가문별 행렬(`PM` 사람·짐승 모델)로 성 둘레 자리에. 행렬 중 카메라는 끌어서 돌린다 |
| nj3d.js `loadGift` · `giftAnim(k, root)` · `placeGift` · `models/gifts/*.glb` · `tools/blender/` | nj3d.js | 예물 모델 — 블렌더 로우폴리(스크립트로 뽑음), 움직일 부분은 이름 붙은 축 노드. 모델을 다시 뽑으면 `GIFT_V`를 올린다 |
| `SoundEffect` | game.js:~3987 | 효과음 신디사이저 — 종소리 `_note`, 출력 `_bus`, 잠든 오디오 깨우기 `_play`, 진동 `_buzz` |

---

---

## 배포

```bash
firebase deploy --only hosting            # 정적 파일 (현재 폴더 전체)
firebase deploy --only functions          # Cloud Functions 양쪽
firebase deploy --only firestore:rules    # 보안 규칙
```

- Firebase 프로젝트: **`kings-road-rank`** (`.firebaserc`)
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

**3. 암기 진행도는 필드 단위로 병합한다 (`_mergeSaveProgress`)**
두 기기가 각자 진도를 냈을 때 한쪽을 통째로 버리지 않고 스테이지별로 앞선 쪽을 취한다. **로컬 우선·원격 우선 두 경로 모두**에 적용되어야 한다 — 원격 우선 경로가 빠져서 오프라인 복습 진도가 통째로 사라진 적이 있다.
앞선 쪽 판정: `reviewStep` → `lastClear` → `mastery` 순.
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
