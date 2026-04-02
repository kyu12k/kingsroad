# CLAUDE.md — 킹스로드 (King's Road)

> **중요**: 코드를 수정한 경우, 관련된 내용(함수 위치, 데이터 구조, 동작 방식 등)이 이 파일의 내용과 달라졌다면 반드시 이 파일도 함께 업데이트해줘.

---

## 프로젝트 개요

영어 단어 암기 게임. 에빙하우스 스페이스드 리피티션 기반의 복습 시스템을 핵심으로 한다.

- **파일 구조**: `game.js` (전체 로직), `style.css`, `index.html`
- **저장소**: `localStorage` 키 `kingsRoadSave` (버전 `1.1.0`)

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

## 복습 시퀀스 (game.js:508)

```
step 1 (초학습)
  → 10분 → step 2
  → 1시간 → step 3
  → 6시간 → step 4
  → 23시간 → step 5
  → 1시간(부스터) → step 6
  → 6시간(부스터) → step 7
  → 71시간(3일) → step 8
  → 6시간(부스터) → step 9
  → 167시간(7일) → step 10+
step 10+: 이후 지수 증가 (약 2배씩)
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
| `buildReviewBadgeHtml(id)` | game.js:2010 | 복습 단계 배지 HTML 생성 |
| `openStageSheet()` | game.js:2809 | 스테이지 시트 열기 + 목록 렌더링 |
| `updateSheetTimers()` | game.js:~2956 | 60초마다 타이머 + 기억 강도 바 업데이트 |
| `stageClear()` | game.js:7529 | 스테이지 클리어 처리 전체 |
| `saveGameData()` | game.js:4091 | localStorage에 저장 |

---

## 기억 강도 표시 (에빙하우스, 최근 추가)

공식: `R = e^(-t/S)` (t=경과시간(hr), S=안정성(hr))

스텝별 S값 (다음 복습 시점에 R=0.8이 되도록 역산):

| 스텝 | S (hr) | 다음 복습 |
|------|--------|----------|
| 1 | 0.747 | 10분 후 |
| 2 | 4.48 | 1시간 후 |
| 3 | 26.9 | 6시간 후 |
| 4~6 | 103.1 | 23시간 후 (부스터 포함) |
| 7~8 | 318.4 | 71시간 후 (부스터 포함) |
| 9 | 748.7 | 167시간 후 |
| 10+ | 동적 | waitHr / 0.2231 |

CSS 클래스: `mem-strength-green` (≥80%), `mem-strength-yellow` (≥60%), `mem-strength-orange` (≥40%), `mem-strength-red` (<40%)

---

## 중간점검(mid-boss) 클리어 동작

중간점검은 편의 트리거 개념으로, **자체 복습 스텝/보상 없음**. 클리어 시:
- 소속 서브스테이지 중 **대기 중이 아닌(eligible)** 것만 `advanceReviewStep()` 호출
- eligible 서브스테이지의 `stageLastClear`, `stageMastery`, `stageClearDate` 업데이트
- 보석 = eligible 서브스테이지 각각의 `baseGem` 합산
- 승점 = eligible 서브스테이지 수 × hearts × 1
- 대기 중인 서브스테이지는 스텝/타이머 완전 무시

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
