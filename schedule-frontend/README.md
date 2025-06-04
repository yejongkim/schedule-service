# Schedule Service Frontend

모던한 JavaScript로 구현된 스케줄 관리 시스템의 프론트엔드 애플리케이션입니다.

## 🚀 기능

- ✅ 일정 추가, 수정, 삭제
- 🔍 일정 검색 및 필터링
- 📅 상태별, 날짜별 일정 조회
- 🎨 반응형 모던 UI/UX
- 💾 로컬 스토리지를 활용한 필터 상태 저장
- ⌨️ 키보드 단축키 지원
- 🔔 실시간 알림 시스템
- 📱 모바일 친화적 디자인

## 📂 프로젝트 구조

```
schedule-frontend/
├── index.html              # 메인 HTML 파일
├── styles/
│   └── main.css            # 스타일시트
├── js/
│   ├── config.js           # 설정 및 상수
│   ├── api.js              # API 통신 클래스
│   ├── ui.js               # UI 관리 클래스
│   └── main.js             # 메인 애플리케이션
└── README.md               # 프로젝트 문서
```

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Icons**: Font Awesome 6
- **Fonts**: Inter, 시스템 폰트
- **Storage**: LocalStorage
- **Architecture**: 모듈화된 클래스 기반 구조

## 🔧 설정 및 실행

### 1. 파일 다운로드
프로젝트 파일들을 원하는 디렉토리에 다운로드합니다.

### 2. 백엔드 API 설정
`js/config.js` 파일에서 백엔드 API URL을 설정합니다:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:8080/api',  // Spring Boot 서버 URL
    // ...
};
```

### 3. 개발 모드 설정
Mock API를 사용하려면 `js/api.js`에서 다음을 변경합니다:

```javascript
const USE_MOCK_API = true;  // 개발용: true, 실제 배포용: false
```

### 4. 웹 서버 실행
정적 파일 서버를 사용하여 실행:

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (serve 패키지 필요)
npx serve .

# VS Code Live Server 확장 사용
```

### 5. 브라우저에서 접속
`http://localhost:8000` (포트는 서버 설정에 따라 다를 수 있음)

## 📋 사용법

### 기본 사용법

1. **일정 추가**: 상단의 "일정 추가" 버튼 클릭 또는 `Ctrl+N`
2. **일정 수정**: 일정 카드의 "수정" 버튼 클릭
3. **일정 삭제**: 일정 카드의 "삭제" 버튼 클릭
4. **필터링**: 상태, 날짜, 검색어로 일정 필터링
5. **새로고침**: `Ctrl+R` 또는 `F5`

### 키보드 단축키

- `Ctrl+N` / `Cmd+N`: 새 일정 추가
- `Ctrl+R` / `Cmd+R`: 데이터 새로고침
- `F5`: 데이터 새로고침
- `Escape`: 모달 닫기

### 개발자 도구 (로컬 환경)

브라우저 콘솔에서 다음 명령어 사용 가능:

```javascript
// 샘플 데이터 생성
generateSampleData();

// 모든 데이터 삭제
clearAllData();

// 디버그 정보 출력
debugInfo();

// 통계 정보 조회
getStats();
```

## 🎨 UI/UX 특징

### 디자인 시스템
- **색상**: 보라색 계열 그라디언트 메인 테마
- **타이포그래피**: Inter 폰트 기반
- **간격**: 일관된 8px 기반 그리드 시스템
- **그림자**: 다층 depth 표현

### 반응형 디자인
- **데스크톱**: 1200px 최대 너비
- **태블릿**: 768px 이하 최적화
- **모바일**: 480px 이하 최적화

### 접근성
- 키보드 네비게이션 지원
- 스크린 리더 친화적 마크업
- 고대비 색상 조합

## 🔗 백엔드 연동

### API 엔드포인트
Spring Boot 백엔드와 연동시 필요한 API 엔드포인트:

```
GET    /api/schedules              # 모든 일정 조회
GET    /api/schedules/{id}         # 특정 일정 조회
POST   /api/schedules              # 새 일정 생성
PUT    /api/schedules/{id}         # 일정 수정
DELETE /api/schedules/{id}         # 일정 삭제
GET    /api/schedules/status/{status}  # 상태별 조회
GET    /api/schedules/date/{date}      # 날짜별 조회
GET    /api/schedules/search?q={query} # 검색
```

### 데이터 형식
```javascript
{
    "id": 1,
    "title": "회의",
    "description": "팀 회의",
    "startDate": "2024-01-15T09:00:00",
    "endDate": "2024-01-15T10:00:00",
    "status": "PENDING",           // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    "priority": "MEDIUM",          // LOW, MEDIUM, HIGH
    "createdAt": "2024-01-14T12:00:00",
    "updatedAt": "2024-01-14T12:00:00"
}
```

## 🐛 문제 해결

### 일반적인 문제들

1. **CORS 오류**
   - 백엔드에서 CORS 설정 확인
   - 개발 중에는 Mock API 사용 권장

2. **API 연결 실패**
   - `js/config.js`에서 API URL 확인
   - 네트워크 연결 상태 확인

3. **UI가 로드되지 않음**
   - 콘솔에서 JavaScript 오류 확인
   - 모든 파일이 올바른 경로에 있는지 확인

### 브라우저 호환성
- Chrome 70+
- Firefox 70+
- Safari 12+
- Edge 79+

## 🔮 향후 계획

- [ ] PWA (Progressive Web App) 지원
- [ ] 다크 모드 테마
- [ ] 드래그 앤 드롭 일정 관리
- [ ] 캘린더 뷰 추가
- [ ] 국제화 (i18n) 지원
- [ ] 오프라인 지원
- [ ] 알림 시스템 확장

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.

## 🤝 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 지원

문제가 있거나 질문이 있으시면 이슈를 생성해주세요.

---

**Schedule Service** - 효율적인 일정 관리를 위한 모던 웹 애플리케이션 