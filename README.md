# 🚫 숲 스트리머 숨기기

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/khhnggmkhlpocgildddhhcdgnhomgdan?label=Chrome%20Web%20Store&logo=googlechrome&logoColor=white&color=4285F4)](https://chromewebstore.google.com/detail/%EC%88%B2-%EC%8A%A4%ED%8A%B8%EB%A6%AC%EB%A8%B8-%EC%88%A8%EA%B8%B0%EA%B8%B0/khhnggmkhlpocgildddhhcdgnhomgdan?hl=ko&utm_source=ext_sidebar)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/khhnggmkhlpocgildddhhcdgnhomgdan?label=%EC%82%AC%EC%9A%A9%EC%9E%90&color=34A853)](https://chromewebstore.google.com/detail/%EC%88%B2-%EC%8A%A4%ED%8A%B8%EB%A6%AC%EB%A8%B8-%EC%88%A8%EA%B8%B0%EA%B8%B0/khhnggmkhlpocgildddhhcdgnhomgdan?hl=ko&utm_source=ext_sidebar)
[![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/khhnggmkhlpocgildddhhcdgnhomgdan?label=%ED%8F%89%EC%A0%90&color=FBBC04)](https://chromewebstore.google.com/detail/%EC%88%B2-%EC%8A%A4%ED%8A%B8%EB%A6%AC%EB%A8%B8-%EC%88%A8%EA%B8%B0%EA%B8%B0/khhnggmkhlpocgildddhhcdgnhomgdan?hl=ko&utm_source=ext_sidebar)

SoopLive에서 원하지 않는 스트리머와 태그를 차단하여 더 나은 시청 경험을 제공하는 Chrome 확장 프로그램입니다.

## ✨ 주요 기능

### 🎯 차단 기능
- **스트리머 차단**: 특정 스트리머의 방송을 목록에서 숨김
- **태그 차단**: 특정 태그가 포함된 모든 방송을 숨김
- **제목 키워드 차단**: 방송 제목에 특정 키워드가 포함된 방송을 숨김 (부분 일치)
- **태그 차단 예외**: 태그 차단 중에도 특정 스트리머의 방송은 항상 표시
- **실시간 적용**: 페이지 새로고침 없이 즉시 적용
- **동적 콘텐츠 감지**: 스크롤이나 페이지 변경 시 자동으로 새로운 콘텐츠 차단

### 🔍 검색 기능
- 차단된 스트리머/태그 실시간 검색
- 검색어 하이라이트 표시
- 검색 결과 개수 표시

### 💾 백업 기능
- **내보내기**: 차단 목록을 TXT 파일로 저장
- **가져오기**: TXT 파일에서 차단 목록 불러오기
- **자동 병합**: 중복 제거 및 기존 목록과 자동 병합


## 🆕 업데이트 내역

### v2.2.0 (2026. 05. 12)
- **제목 키워드 차단 추가**: 방송 제목에 특정 키워드가 포함된 방송을 숨김 (부분 일치)
- 팝업에 제목 키워드 차단 토글 및 차단된 키워드 수 표시 추가
- 내보내기/가져오기에 제목 키워드 섹션 포함

### v2.1.0 (2026. 05. 03)
- **태그 차단 예외 스트리머 추가**: 태그 차단이 설정되어 있어도 지정한 스트리머의 방송은 항상 표시
- **문의·후원 링크 추가**: 팝업 하단에 카카오 오픈톡 링크 추가

### v2.0.1 (2026. 03. 24)
- **SoopLive 도메인 변경 대응**: `sooplive.com` 주소에서 정상 작동하도록 업데이트
- **안정성 개선**: 도메인 전환에 따른 권한 설정 최적화

## 🎮 사용 방법


### 스트리머 차단하기
1. 설정 페이지에서 **스트리머 차단** 섹션으로 이동
2. 텍스트 필드에 스트리머 이름 입력
   - 여러 명 동시 추가: 쉼표(,)로 구분
   - 예: `스트리머1, 스트리머2, 스트리머3`
3. **추가** 버튼 클릭 또는 Enter 키

### 태그 차단하기
1. 설정 페이지에서 **태그 차단** 섹션으로 이동
2. 차단할 태그 입력 (# 없이 입력)
   - 여러 개 동시 추가: 쉼표(,)로 구분
   - 예: `버튜버, 게임, 음악`
3. **추가** 버튼 클릭

### 제목 키워드 차단하기
1. 설정 페이지에서 **제목 키워드 차단** 섹션으로 이동
2. 차단할 키워드 입력 (방송 제목에 포함된 단어)
   - 여러 개 동시 추가: 쉼표(,)로 구분
   - 예: `덕몽, 뽀로로, 핑크퐁`
3. **추가** 버튼 클릭
> 부분 일치 방식으로 작동합니다. "덕몽" 입력 시 "덕몽어스", "덕몽이랑 게임" 등 모두 차단됩니다.

### 태그 차단 예외 스트리머 설정하기
1. 설정 페이지에서 **태그 차단 예외 스트리머** 섹션으로 이동
2. 태그 차단에서 제외할 스트리머 이름 입력
   - 여러 명 동시 추가: 쉼표(,)로 구분
3. **추가** 버튼 클릭
> ⚠️ 스트리머 직접 차단은 예외 설정과 무관하게 그대로 적용됩니다.

### 차단 목록 검색
- 검색창에 키워드 입력하면 실시간으로 필터링
- 검색된 항목은 노란색으로 하이라이트

### 차단 목록 백업/복원

#### 내보내기
1. **📤 내보내기** 카드에서 **차단 목록 내보내기** 클릭
2. `sooplive_blocklist_타임스탬프.txt` 파일 자동 다운로드

#### 가져오기
1. **📥 가져오기** 카드에서 **차단 목록 가져오기** 클릭
2. 백업한 TXT 파일 선택
3. 자동으로 병합 및 적용

## 📁 파일 구조

```
soop-streamer-blocker/
├── manifest.json       # 확장 프로그램 설정
├── content.js         # 페이지 콘텐츠 제어 스크립트
├── popup.html         # 툴바 팝업 UI
├── popup.js          # 팝업 기능 스크립트
├── options.html      # 설정 페이지 UI
├── options.js        # 설정 페이지 기능 스크립트
└── README.md         # 사용 설명서
```

## 🔧 기술 스펙

### 요구사항
- Chrome 브라우저 88 이상
- Manifest V3 지원

### 사용 기술
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: Chrome Storage Local API
- **Pattern Matching**: DOM Mutation Observer

### 권한
- `storage`: 차단 목록 저장
- `activeTab`: 현재 탭 정보 접근
- `host_permissions`: sooplive.co.kr 및 sooplive.com 도메인 접근

## 💡 문제 해결

### 차단이 작동하지 않을 때
1. 확장 프로그램이 활성화되어 있는지 확인
2. SoopLive 페이지 새로고침
3. 콘솔에서 오류 메시지 확인 (F12)

### 목록이 저장되지 않을 때
1. 저장 용량 확인 (Chrome Storage 제한: 100KB)
2. 확장 프로그램 재설치

### 가져오기가 실패할 때
1. TXT 파일 형식 확인
2. 파일 인코딩이 UTF-8인지 확인
3. 파일 크기가 너무 크지 않은지 확인

## 📝 내보내기 파일 형식

```text
=== 숲 스트리머 숨기기 차단 목록 ===
생성 일시: 2024. 12. 27. 오후 3:30:00

[차단된 스트리머]
스트리머1
스트리머2

[차단된 태그]
#태그1
#태그2

[차단된 제목 키워드]
키워드1
키워드2

[태그 차단 예외 스트리머]
스트리머3

=== 총 7개 항목 ===
```


## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## ⚠️ 주의사항

- 이 확장 프로그램은 SoopLive와 공식적으로 제휴하지 않은 서드파티 도구입니다
- 차단 목록은 로컬 브라우저에만 저장되며 외부 서버로 전송되지 않습니다

## 📞 문의 · 후원

문의나 제안사항, 후원은 카카오 오픈톡을 통해 연락해주세요.
👉 https://open.kakao.com/o/seCsBXni

---

Made with ❤️ for better SoopLive experience