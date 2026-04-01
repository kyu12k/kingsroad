# King's Road - Firebase Cloud Functions

## Functions 목록

### 1. **updateWeeklyCounts** (스케줄)
- **트리거**: 매일 00:00, 06:00, 12:00, 18:00 (한국시간)
- **기능**:
  - 현재 주차의 전체/지파별 인원 수 집계 → `system_meta/weekly_counts` 저장
  - 지파별 Top100 스냅샷 → `ranking_snapshots/{weekId}/tribes/tribe_{i}` 저장
  - 시온성(전체) Top100 스냅샷 → `ranking_snapshots/{weekId}/tribes/zion` 저장
  - 누적 점수 Top100 스냅샷 → `ranking_snapshots/all_time/hall/total` 저장
  - 12지파 연간 대항전 합산 → `ranking_snapshots/yearly/tribes/current` 저장

### 2. **archiveWeeklyRankings** (스케줄)
- **트리거**: 매주 월요일 00:00 (한국시간)
- **기능**: 지난주 Top100을 `weekly_history` 컬렉션에 영구 보관
- **문서 ID 형식**: `{weekId}_{userId}` (예: `2026-W14_abc123`)

### 3. **archiveMonthlyRankings** (스케줄)
- **트리거**: 매달 1일 00:00 (한국시간)
- **기능**:
  - 지난달 Top100을 `monthly_history` 컬렉션에 영구 보관
  - 월간 명예의 전당 스냅샷 → `ranking_snapshots/{monthId}/hall/monthly` 저장
- **문서 ID 형식**: `{monthId}_{userId}` (예: `202603_abc123`)

### 4. **sendScheduledNotifications** (스케줄)
- **트리거**: 매 5분마다
- **기능**: `leaderboard` 컬렉션에서 `notifyAt <= 현재시각` 인 문서를 조회해 FCM 푸시 알림 발송
- **중복 방지**: 당일 이미 발송한 경우 건너뜀

---

## 배포 방법

### 1. Firebase CLI 설치
```bash
npm install -g firebase-tools
```

### 2. Firebase 로그인
```bash
firebase login
```

### 3. 의존성 설치
```bash
cd functions
npm install
```

### 4. Functions 배포
```bash
firebase deploy --only functions
```

---

## 로컬 테스트

```bash
cd functions
npm run serve
```

Emulator 실행 후 `http://localhost:4000` 접속

---

## Firestore 인덱스 설정

`firestore.indexes.json`에 정의되어 있습니다. 콘솔에서 인덱스 오류 발생 시 에러 메시지의 링크를 클릭하면 자동 생성됩니다.

---

## 비용 안내

- **Blaze Plan(종량제) 필요**: Cloud Functions 사용을 위해 필요
- **updateWeeklyCounts**: 하루 4회 실행
- **archiveWeeklyRankings**: 주 1회
- **archiveMonthlyRankings**: 월 1회
- **sendScheduledNotifications**: 매 5분 (활성 유저 없으면 즉시 종료)
- **예상 비용**: $0~$1/월

---

## 문제 해결

### "Firebase project not found"
```bash
firebase use --add
```

### "Index not found"
에러 메시지에 나온 링크 클릭 → 자동 인덱스 생성
