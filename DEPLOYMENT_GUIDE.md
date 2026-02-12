# 🏰 King's Road - Cloud Functions 배포 가이드

## ✅ 완료된 작업

1. ✅ 강등 로직 제거 (승격 전용)
2. ✅ Cloud Functions 구조 생성
3. ✅ Firebase 설정 파일 생성

---

## 📁 생성된 파일

```
kingsload/
├── functions/
│   ├── index.js          # Cloud Functions 코드 (3개 함수)
│   ├── package.json      # 의존성 설정
│   ├── .gitignore        # Git 무시 파일
│   └── README.md         # Functions 상세 가이드
├── firebase.json         # Firebase 프로젝트 설정
├── firestore.rules       # Firestore 보안 규칙
└── firestore.indexes.json # Firestore 인덱스 설정
```

---

## 🚀 배포 단계 (PowerShell)

### 1단계: Firebase CLI 설치
```powershell
npm install -g firebase-tools
```

### 2단계: Firebase 로그인
```powershell
firebase login
```

### 3단계: 프로젝트 초기화
```powershell
# kingsload 폴더에서 실행
cd c:\Users\Edit04\Desktop\kingsload
firebase init

# 선택 항목:
# - Functions (화살표 키로 선택, 스페이스로 체크, 엔터로 확인)
# - Firestore
# - 기존 프로젝트 선택
# - JavaScript 선택
# - ESLint? No
# - 의존성 설치? Yes
```

### 4단계: Functions 배포
```powershell
firebase deploy --only functions
```

### 5단계: Firestore 규칙 및 인덱스 배포
```powershell
firebase deploy --only firestore
```

---

## 🔍 Functions 개요

### 1️⃣ updateZionCutoff (자동 실행)
- **언제**: 유저가 점수를 저장할 때마다
- **기능**: 시온성 100명 제한 자동 관리
- **비용**: ~0.001초/실행

### 2️⃣ archiveMonthlyRankings (스케줄)
- **언제**: 매월 1일 00:00 (한국시간)
- **기능**: 지난달 Top 100 자동 보관
- **비용**: 1회/월

### 3️⃣ checkZionEligibility (선택)
- **언제**: 클라이언트가 호출할 때
- **기능**: 시온성 진입 가능 여부 확인
- **사용법**: 필요시 클라이언트에서 호출

---

## 💰 예상 비용

### Spark Plan (무료)으로 가능한가?
- ❌ **불가능** - Cloud Functions는 Blaze Plan 필요
- 하지만 실제 비용은 **거의 $0**

### Blaze Plan 예상 비용
```
updateZionCutoff: 10,000회/월 × $0.0000004 = $0.004
archiveMonthlyRankings: 1회/월 × $0.0000004 = $0.0000004
-----------------------------------------------
월 예상 비용: $0.01 미만 (거의 무료)
```

---

## ⚠️ 중요 사항

### 1. Blaze Plan 업그레이드
Firebase Console → 좌측 하단 톱니바퀴 → 요금제 업그레이드

### 2. 예산 알림 설정
Firebase Console → Blaze Plan 설정 → 예산 알림
- 권장: $1/월로 설정

### 3. 인덱스 생성 확인
첫 배포 후 게임 실행 → 에러 발생 시 → 콘솔에 나온 링크 클릭

---

## 🧪 테스트 방법

### 로컬 Emulator로 테스트
```powershell
cd functions
npm install
npm run serve
```
→ `http://localhost:4000` 접속하여 테스트

### 실제 배포 후 테스트
1. 게임 실행 → 스테이지 클리어
2. Firebase Console → Functions → 로그 확인
3. `updateZionCutoff` 실행 확인

---

## 📊 모니터링

### Functions 실행 로그
```powershell
firebase functions:log
```

### Firebase Console
Functions → 대시보드 → 실행 건수, 오류, 성능 확인

---

## 🐛 문제 해결

### "This project requires the Blaze plan"
→ Firebase Console에서 Blaze Plan으로 업그레이드

### "Index not found" 에러
→ 에러 메시지의 링크 클릭 → 자동 인덱스 생성

### "Permission denied"
→ `firestore.rules` 배포: `firebase deploy --only firestore:rules`

---

## 📞 추가 질문이 있다면

[functions/README.md](functions/README.md) 파일 참고!
