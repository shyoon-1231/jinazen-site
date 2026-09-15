# TASK-SITE-CUTOVER-R1 — 이관 당일 절차

**작성 2026-09-15 · 문서만. 실행하지 않았다.**
jinazen.com 을 아임웹에서 Cloudflare Pages(이 저장소)로 옮기는 날, 이 순서 그대로 한다.

> 🔴 **2026-09-24 이후 DNS 변경 금지.** 10-01 매장 개시 직전에는 복구할 시간이 없다.
> 9/24 를 넘기면 10월 중순 이후로 미룬다.

---

## 0. 시작 전 — 저장소

```bash
grep -rn --exclude-dir=.git --exclude-dir=docs '{{' .     # 🔴 0건이어야 push 한다
git status -sb                                             # clean · origin 과 차이 확인
```

2026-09-15 기준 **빈칸 0건.** Play 버튼은 `https://play.google.com/store/apps/details?id=com.jinazen.fortunegraph`
(파라미터 없음)로 연결됐다. `og:image` 는 그림이 없어 **줄을 뺐다** — 1200×630 파일이 오면 세 페이지에 한 줄씩 되살린다.

---

## 1. 선행 검증 — 임시 주소(`*.pages.dev`)에서 · 순서 그대로

```
[ ] Pages 배포 성공 · *.pages.dev 200
[ ] *.pages.dev/privacy/ 200
[ ] 🔴 *.pages.dev/?mode=privacy 가 방침으로 넘어가는 것을 눈으로 본다 (JS 경로)
[ ] 여섯 페이지 · robots.txt · sitemap.xml 200
      /  /en/  /ja/  /privacy/  /privacy/en/  /privacy/ja/
```

**넷 다 통과하기 전에는 커스텀 도메인을 붙이지 않는다.**

---

## 2. 도메인 연결 후 — 전수 확인

```
[ ] https://jinazen.com
[ ] https://www.jinazen.com → https://jinazen.com 으로 넘어간다 (아래 규칙)
[ ] 🔴 https://jinazen.com/?mode=privacy   ← Play 심사가 보는 URL
[ ] 🔴 https://api.jinazen.com/health 200  ← 안 되면 매장이 멈춘다. 가장 급하다
[ ] jina@jinazen.com 수신·발신
[ ] Play Console 방침 URL 유효성 재확인
```

### www → 비www — Cloudflare 대시보드 규칙 하나

정본 주소는 **`https://jinazen.com`(www 없음)** 이다 — canonical · og:url · sitemap 이 전부 이것이다.
`www.jinazen.com` 으로 온 요청은 대시보드 리다이렉트 규칙 **하나**로 `https://jinazen.com` 에 보낸다.
(규칙의 화면 조작 순서는 이 문서에 적지 않았다 — 당일 대시보드에서 확인한다.)

⚠ 이것은 아래 4. 의 「Redirect Rule 은 넣지 않는다」와 **다른 규칙이다.** 그쪽은 `?mode=privacy` 쿼리 조건이고,
이쪽은 호스트 이름(www)만 본다.

`api.jinazen.com` 은 매장 키오스크·카운터의 서버 주소다. **이것이 실패하면 다른 항목을
볼 것 없이 곧바로 3. 복구로 간다.**

---

## 3. 복구

```
아임웹 A레코드(18.238.238.x 계열)를 되살린다 → 아임웹 사이트로 즉시 복귀
🔵 네임서버는 건드리지 않는다
```

⚠ 되살릴 레코드 값은 **이관 전에 캡처해 둔 DNS 화면**에서 옮긴다. 기억이나 이 문서의
「18.238.238.x 계열」로 채우지 않는다 — 계열만 적어 둔 것이지 값이 아니다.

---

## 4. 넣지 않은 것 · 감수하는 것

### ⚠ Redirect Rule 은 넣지 않는다

- `_redirects` 는 쿼리 파라미터 매칭을 지원하지 않는다(Cloudflare Pages 문서 미지원 표 「Query Parameters ❌」)
- 대시보드 Redirect Rule 이 `?mode=privacy` 조건을 받는지는 **문서로 끝까지 확인하지 못했다**
- `index.html` `<head>` 의 JS 가 `/?mode=privacy` → `/privacy/` 로 넘기고, 로컬 헤드리스 Chrome 에서 동작을 확인했다

### 감수 항목 — JS 없는 브라우저

JS 가 꺼져 있거나 JS 를 실행하지 않는 클라이언트는 `/?mode=privacy` 에서 **방침으로 넘어가지
않고 홈페이지 본문을 본다.** 이것을 알고 이관한다.

---

## 5. 관찰만 — 이 문서가 정하지 않은 것

- **`https://www.jinazen.com/` 은 지금(아임웹) 200 이다** — apex 로 리다이렉트하지 않고 따로 뜬다
  (2026-09-15 `curl -I` 실측). 이관 뒤에는 2. 의 규칙 하나로 비www 에 보낸다(소유자 확정 2026-09-15)
- 구조화 데이터에 `aggregateRating`/`review` 가 없으므로 Google 리치 결과 대상이 아니다(의도)
