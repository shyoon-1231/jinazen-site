# TASK-SITE-PREP-1 — 이관 전 준비

**작성 2026-09-15.** 로컬 커밋까지만 했다. **push 하지 않았다** — Pages 는 push 하면 뜬다.

근거 문서: `jinazen-homepage-handoff.md`(검토 문서 · 2026-09-14 · 저장소 밖) ·
sera-saju `docs/DECISIONS.md` D-058 · D-077 · D-085.

---

## 🔴 push 전에 채워야 하는 빈칸

빈칸이 남은 채로 올리면 **Play 버튼이 `{{PLAY_URL}}` 이라는 상대 주소로 가서 404** 가 난다.

| 빈칸 | 자리 | 누가 |
|---|---|---|
| `{{PLAY_URL}}` | 세 페이지 CTA `href` · 구조화 데이터 `installUrl` | 소유자 — Play Console URL 빌더 값(referrer 포함) |
| `{{OG_PNG}}` | 세 페이지 `og:image` | og.png 1200×630 을 만든 뒤 절대 URL |
| `{{PHONE}}` | 여섯 페이지 푸터 | 소유자 — 공개할 대표번호 |
| `{{APP_CATEGORY}}` | 세 페이지 구조화 데이터 `applicationCategory` | Play 등록 카테고리 |
| `{{EN_FOR_PROS_SENTENCE}}` · `{{JA_FOR_PROS_SENTENCE}}` | en · ja 히어로 첫 줄 | 앱 설명 원문의 번역 — 원문 번역이 없어 비워 뒀다 |
| `{{EN_ONE_SCREEN_SENTENCE}}` · `{{JA_ONE_SCREEN_SENTENCE}}` | en · ja 「한곳에서」 섹션 첫 줄 | 같다 |

```bash
grep -rn --exclude-dir=.git --exclude-dir=docs '{{' .      # 0건이 되기 전에는 push 하지 않는다 (이 문서는 빼고 센다)
```

---

## `/?mode=privacy` — 선행 검증 (실제 경로로 고친 판)

검토 문서 §4 목록은 `/privacy.html` 을 가리키는데, **이 저장소에는 그 파일이 없다.**
방침은 `privacy/index.html` 이고 주소는 `/privacy/` 다.

```
[ ] jinazen-site 가 Cloudflare Pages 에 배포되어 있다
[ ] *.pages.dev 주소로 정상 열린다
[ ] privacy/index.html 이 배포에 들어 있고 *.pages.dev/privacy/ 가 열린다
    (Pages 는 /privacy/index.html 요청을 /privacy/ 로 돌린다 — 문서 확인)
[ ] *.pages.dev/?mode=privacy 가 /privacy/ 로 넘어간다 — 지금은 JS 가 한다 (아래)
[ ] 🔴 *.pages.dev/?mode=privacy 가 방침으로 열리는 것을 눈으로 확인했다
```

### 지금 누가 넘기는가 — `index.html` `<head>` 의 한 줄

```html
<script>if(new URLSearchParams(location.search).get("mode")==="privacy")location.replace("privacy/");</script>
```

- 루트(`/`)에서 상대경로 `privacy/` → **`/privacy/`**. 로컬 헤드리스 Chrome 으로
  `/?mode=privacy` 를 열어 방침 제목이 뜨는 것을 확인했다(2026-09-15)
- ⚠ **ko 루트에만 있다.** `en/` · `ja/` 에는 없다 — 등록 URL 이 루트라 문제는 아니다
- 🔴 **JS 가 꺼진 클라이언트는 안 넘어간다** — 그러면 홈페이지 본문이 보인다

### `_redirects` 로는 못 한다 — 파일을 만들지 않았다

Cloudflare Pages 문서(`/pages/configuration/redirects/`)의 미지원 표:
「Query Parameters | ❌ | `/shop id=:id /blog/:id 301`」.
`?mode=privacy` 를 조건으로 거는 규칙은 `_redirects` 에 쓸 수 없다.

→ JS 없이도 넘기려면 **Cloudflare Redirect Rule(대시보드)** 로 한다.

⚠ **미확인:** 규칙 언어에 `http.request.uri.query` 필드(「The entire query string, without the `?` delimiter」)가
있다는 것까지는 문서로 봤다. **Single Redirects 에서 그 필드를 조건으로 쓸 수 있는지**,
그리고 **존(jinazen.com) 규칙이 `*.pages.dev` 에도 걸리는지**는 확인하지 못했다.
후자가 안 걸리면 위 마지막 두 줄은 JS 경로만 검증하는 것이다.

---

## 이번에 바꾼 것

- **거짓 넷** — ko · en · ja 같은 자리
  - Play CTA: `span` → `a href="{{PLAY_URL}}"`. 「출시 예정」을 뺐다
  - 「삶의 파동을 보다. 보다 정확하게.」 · 「정확한 용신」 · 「완벽한 상담 준비」 삭제·교체.
    ko 는 앱 설명 원문 두 문장을 그대로 넣었다. en · ja 는 빈칸
  - A4 리포트 섹션 삭제
  - 매장 흐름 02: 「결제 후 번호표」 → 「번호표 · 카운터에서 결제」(D-077)
- **푸터** — 여섯 페이지: 면책 문구를 맨 위로 · 사업자 정보(한국어 원문, 서류 문구 그대로)
- **방침** — 마지막 한 줄(jinazen.com/report). en · ja 는 번역 초안(주석 표시). **문단 삭제 없음**
- **SEO** — title · description(만세력) · canonical · hreflang · og · 구조화 데이터(SoftwareApplication, aggregateRating 없음) ·
  `robots.txt` · `sitemap.xml`(6 URL)

## 소유자 결정 대기

보고 메시지에 적었다 — 이 문서에 다시 적지 않는다.
