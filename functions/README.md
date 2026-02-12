# 🔥 King's Road - Firebase Cloud Functions

## 📋 Functions 목록

### 1. **updateZionCutoff** (자동 트리거)
- **트리거**: `leaderboard/{userId}` 문서 변경 시
- **기능**: 
  - 시온성(tier 5) 인원이 100명 이상이면 100등의 점수를 커트라인으로 설정
  - 101등부터는 자동으로 가나안(tier 4)으로 강등
  - `system_meta/tier_info` 문서에 `zion_cutoff` 저장
- **실행 시점**: 유저가 점수를 서버에 저장할 때마다 자동 실행

### 2. **archiveMonthlyRankings** (스케줄)
- **트리거**: 매월 1일 00:00 (한국시간 기준)
- **기능**:
  - 지난달 Top 100 플레이어를 `history` 컬렉션에 영구 보관
  - 명예의 전당 자동 생성
- **문서 ID 형식**: `2026-02_userId`

### 3. **checkZionEligibility** (Callable)
- **호출 방식**: 클라이언트에서 직접 호출 가능
- **기능**: 현재 점수로 시온성 진입 가능한지 확인
- **반환값**: `{ canEnter, cutoff, currentCount, message }`

---

## 🚀 배포 방법

### 1. Firebase CLI 설치
```powershell
npm install -g firebase-tools
```

### 2. Firebase 로그인
```powershell
firebase login
```

### 3. Firebase 프로젝트 선택
```powershell
# 프로젝트 루트에서 실행 (kingsload/)
firebase init functions

# 기존 프로젝트 선택
# JavaScript 선택
# ESLint 설치? → No
# npm install? → Yes
```

### 4. 의존성 설치
```powershell
cd functions
npm install
```

### 5. Functions 배포
```powershell
# functions 폴더에서 실행
npm run deploy

# 또는 프로젝트 루트에서
firebase deploy --only functions
```

---

## 🧪 로컬 테스트

### Emulator 실행
```powershell
cd functions
npm run serve
```

### 테스트 방법
1. Emulator가 실행되면 `http://localhost:4000` 접속
2. Firestore Emulator에 테스트 데이터 추가
3. Functions 로그 확인

---

## 📊 Firestore 인덱스 설정

Firebase Console → Firestore Database → 색인(Indexes) → 다음 인덱스 추가:

### 인덱스 1: leaderboard (tier + score)
```
컬렉션 ID: leaderboard
필드:
  - tier (오름차순)
  - weekId (오름차순)
  - score (내림차순)
```

### 인덱스 2: history (weekId + score)
```
컬렉션 ID: history
필드:
  - weekId (오름차순)
  - score (내림차순)
```

---

## 🔒 보안 규칙

Firestore 규칙 설정 (Firebase Console → Firestore → 규칙):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 랭킹은 모두 읽기 가능, 본인만 쓰기 가능
    match /leaderboard/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 명예의 전당은 읽기만 가능
    match /history/{docId} {
      allow read: if true;
      allow write: if false; // Functions에서만 쓰기
    }
    
    // 시스템 메타데이터는 읽기만 가능
    match /system_meta/{docId} {
      allow read: if true;
      allow write: if false; // Functions에서만 쓰기
    }
    
    // 캐시는 모두 읽기 가능
    match /system_cache/{docId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

---

## 📈 모니터링

### Functions 로그 확인
```powershell
firebase functions:log
```

### 실시간 로그 스트리밍
```powershell
firebase functions:log --only updateZionCutoff
```

### Firebase Console
Firebase Console → Functions → 대시보드에서 실행 건수, 오류, 비용 확인

---

## 💰 비용 관리

### 무료 할당량 (Spark Plan)
- Functions 호출: 125,000회/월
- CPU 시간: 40,000 CPU-초/월
- 네트워크: 5GB/월

### Blaze Plan (종량제)
- updateZionCutoff: 유저 활동마다 실행 (예상: 1,000~10,000회/월)
- archiveMonthlyRankings: 1회/월
- 예상 비용: $0~$1/월

---

## ⚠️ 주의사항

1. **첫 배포 시**: Firebase Console에서 Blaze Plan으로 업그레이드 필요
2. **인덱스 생성**: 첫 쿼리 실행 시 에러 발생하면 콘솔에서 인덱스 생성 링크 클릭
3. **시간대 설정**: `archiveMonthlyRankings`는 한국시간 기준 (Asia/Seoul)
4. **테스트**: Emulator로 충분히 테스트 후 배포

---

## 🐛 문제 해결

### "Firebase project not found"
```powershell
firebase use --add
# 프로젝트 선택
```

### "Insufficient permissions"
```powershell
# Firebase Console에서 서비스 계정 권한 확인
# Firestore Admin 권한 필요
```

### "Index not found"
```
에러 메시지에 나온 링크 클릭 → 자동 인덱스 생성
또는 Firebase Console에서 수동 생성
```
