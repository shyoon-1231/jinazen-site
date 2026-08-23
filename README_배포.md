# jinazen.com 정적 사이트 (v1 · 2026-08-23)

구조: / (KO) · /en/ · /ja/ · /privacy/{,en/,ja/} · assets/
- 방침은 2026-08-19 시행판 그대로. 사이트 전환 직전 개정 필요: 제1편(회원가입·결제 삭제→문의 메일만),
  제5조(아임웹→Cloudflare, Inc. + 국외 이전 고지), 제6조(쿠키 미사용으로 단순화 가능), 시행일 갱신.
- /?mode=privacy → /privacy/ 는 index.html 인라인 스크립트로 처리(아임웹 옛 주소 호환).
  Cloudflare Pages 배포 후 대시보드 Redirect Rule 로도 한 벌 더 걸어 두면 JS 꺼진 브라우저까지 커버.
- 폰트: Pretendard CDN(jsdelivr). 배포 시 자체 호스팅 전환 권장(assets/font/ 에 woff2 넣고 style.css 상단 교체).
- 스크린샷 자리 4곳(.device .screen): 캡처 모드 산출물로 교체.
- Play 배지·링크: Console 개설 후 hero 의 .cta href 교체.
- 인물 사진: 9월 신규 촬영본으로 교체 후보(현재 720px).
- 배포: 전용 GitHub 저장소(공개) → Cloudflare Pages 연결 → 빌드 명령 없음(정적) → 커스텀 도메인 jinazen.com.
