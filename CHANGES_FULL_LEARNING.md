# 전체학습 시스템 업데이트

## 변경 사항 개요

중간점검(중간보스) 또는 보스 클리어 시, 해당 구간에 속한 **아직 한 번도 플레이하지 않은 스테이지**들에서 **모드 선택 없이 바로 "전체학습(Step 1~5)"을 시작**할 수 있도록 업데이트했습니다.

---

## 구현 세부사항

### 1. 도우미 함수 추가

#### `getChapterDataByStageId(stageId)`
- 스테이지 ID로부터 해당 챕터의 데이터 객체를 조회합니다.
- 반환: 챕터 데이터 객체 또는 null

#### `getSegmentCheckpointStageId(chapterData, stageId)`
- 주어진 스테이지 이후의 **첫 번째 중간점검/보스**를 찾습니다.
- 반환: 체크포인트 스테이지 ID 또는 null

#### `isFullLearningUnlockedByCheckpoint(stageId)`
- 특정 스테이지가 중간점검/보스 클리어로 전체학습이 가능한지 확인합니다.
- **조건**:
  - 해당 스테이지는 일반 훈련 타입이어야 함
  - 스테이지 이후의 중간점검/보스가 클리어되어 있어야 함
- 반환: boolean

#### `isUnplayedStage(stageId)`
- 스테이지가 한 번도 진행되지 않았는지 확인합니다.
- 진행 기록이 없으면 true를 반환합니다.

### 2. 스테이지 시트(목록) UI 수정

**파일**: `openStageSheet()` 함수 (약 1950줄)

#### 변경 사항:
```javascript
const canForceFullNew = isFullLearningUnlockedByCheckpoint(stage.id) && isUnplayedStage(stage.id);
```

- 각 스테이지마다 "전체학습 가능 여부"를 계산합니다.

#### 표시되는 아이콘 및 정보:
- **전체학습 가능**: 노란색 재생 버튼 (▶) + "🎁 신규 전체학습: 최대 70💎" 배지
- **이미 클리어/복습 가능**: 회색 톱니바퀴 아이콘 (⚙️)
- **쿨타임 중**: 빨간색 ⏳ 타이머
- **신규 훈련(쿨타임 없음)**: 노란색 재생 버튼 (▶)

#### 클릭 동작:
```javascript
} else if (canForceFullNew) {
    startTraining(stage.id, 'full-new');
} else if (isCleared && memStatus.level >= 1) {
```

- 전체학습 가능 상태에서는 모드 선택 팝업을 띄우지 않고, **바로 `'full-new'` 모드로 시작**합니다.

---

### 3. 훈련 시작 로직 수정

**파일**: `startTraining()` 함수 (약 3020줄)

#### 새로운 모드 `'full-new'` 추가:
```javascript
const isForceFullNew = (mode === 'full-new');
// ...
if (isForceFullNew) {
    mode = 'full-new';
    stepSequence = [1, 2, 3, 4, 5];
} else {
    // 기존의 phase1/phase2/phase3 로직
}
```

- 복습 모드가 아니면서, `'full-new'` 모드인 경우:
  - 전체 5개 스텝(Step 1~5)을 모두 진행합니다.
  - **시간 차 학습(phase 시스템)을 우회**하고, 즉시 클리어 처리됩니다.

#### 복습 모드 판단:
```javascript
window.isReplayMode = isReplayEligible && !isForceFullNew;
```

- `'full-new'` 모드일 때는 복습 모드로 인식되지 않습니다.

---

### 4. 훈련 종료 로직 수정

**파일**: `finishTraining()` 함수 (약 3920줄)

#### `'full-new'` 모드 처리:
```javascript
if (window.trainingMode === 'full-new') {
    progress.phase = 3;  // 진행도를 최대(3단계)로 설정
    progress.unlockTime = 0;  // 쿨타임 없음
    missionData.stageProgress[sId] = progress;
}
// 이후 바로 showClearScreen()으로 진행
```

- 진행도 데이터를 3단계(완료)로 설정하여 이후 복습 모드가 바로 활성화됩니다.
- 쿨타임(숙성 시간) 무시자동으로 "결과 화면"으로 이동합니다.

---

### 5. 보상 계산 로직 수정

**파일**: `showClearScreen()` 함수 (약 4020줄)

#### `'full-new'` 모드 보상:
```javascript
else if (window.trainingMode === 'full-new') {
    baseGem = 70;
    msg = "📖 [전체 학습] 신규 클리어!";
}
```

#### 파일: `stageClear()` 함수 내부 (약 5800줄)

#### `'full-new'` 모드 보상 추가:
```javascript
if (window.trainingMode === 'full-new') {
    maxGem = 70;
    msg += "📖 [전체 학習] 신규 클리어! (+70💎)\n";
}
```

**보상**: **70개 보석** (신규 진도 3단계 완료와 동일)

---

## 게임 플레이 흐름

### 시나리오: 제 1장의 1~3절

#### 상황 1: 일반 진행
```
1절 학습 (신규) → 2절 학습 (신규) → 3절 학습 (신규)
↓
중간점검 (1~3절) 클리어
```

#### 상황 2: 중간점검 클리어 후 미진행 스테이지 접근
```
중간점검 (1~3절) 클리어 완료
    ↓
[스테이지 시트 에서]
- 1절: 🎁 신규 전체학습 모드 활성화
- 2절: 🎁 신규 전체학습 모드 활성화  
- 3절: 🎁 신규 전체학습 모드 활성화
    ↓
[해당 스테이지 클릭]
    ↓
모드 선택 없이 바로 "Step 1~5 전체 진행"
    ↓
+70💎 보상 획득
    ↓
복습 모드 자동 활성화
```

---

## 주요 특징

### ✅ 장점
1. **유저 경험 개선**: 중간점검/보스 클리어 후 미진행 스테이지의 **빠른 진입 가능**
2. **시간 절감**: 모드 선택 팝업을 거치지 않음
3. **명확한 피드백**: 스테이지 시트의 배지로 "전체학습 가능" 상태를 시각적으로 표시
4. **보상 형평성**: 신규 클리어와 동일한 70개 보석 지급
5. **진행도 호환성**: 기존 phase 시스템과 충돌 없이 동작

### ⚠️ 제약 사항
- **적용 범위**: 중간점검/보스 클리어로만 활성화
  - 첫 신규 진행(phase1/2/3)은 영향 없음
  - 복습 모드는 영향 없음
- **스테이지 조건**: "한 번도 플레이하지 않은" 스테이지에만 표시
  - 이미 진행 기록이 있으면 복습/쿨타임 로직으로 처리

---

## 코드 변경 목록

| 함수 | 라인 범위 | 변경 내용 |
|------|---------|---------|
| `getChapterDataByStageId()` | 신규 | 도우미 함수 추가 |
| `getSegmentCheckpointStageId()` | 신규 | 도우미 함수 추가 |
| `isFullLearningUnlockedByCheckpoint()` | 신규 | 도우미 함수 추가 |
| `isUnplayedStage()` | 신규 | 도우미 함수 추가 |
| `openStageSheet()` | ~2040 | UI 로직 수정, `canForceFullNew` 판단 및 클릭 처리 |
| `startTraining()` | ~3090 | `'full-new'` 모드 추가, stepSequence 설정 |
| `finishTraining()` | ~3930 | `'full-new'` 모드 진행도 처리 |
| `showClearScreen()` | ~4030 | `'full-new'` 모드 보상 계산 |
| `stageClear()` | ~5800 | `'full-new'` 모드 보상 메시지 추가 |

---

## 테스트 체크리스트

- [ ] 중간점검 클리어 후 미진행 스테이지에 🎁 배지 표시 확인
- [ ] 배지 클릭 시 모드 선택 팝업 없이 바로 Step 1 시작
- [ ] 전체 5개 스텝(Step 1~5) 완료 후 결과 화면 표시
- [ ] 보상으로 70개 보석 지급 확인
- [ ] 이후 해당 스테이지의 진행도가 3단계(완료)로 설정되어 복습 모드 활성화 확인
- [ ] 이미 진행한 스테이지는 기존 로직대로 처리 확인
- [ ] 보스 클리어 시에도 동일하게 작동 확인
- [ ] 기존 phase1/2/3 진행도 시스템과 충돌 없음 확인

---

## 호환성

- **기존 데이터**: 완전 호환
- **진행 중인 게임**: 중단 없이 즉시 적용 가능
- **UI/UX**: 기존 디자인 유지, 배지만 추가

---

**마지막 수정**: 2026-02-13
