# TASK-SITE-DEPLOY-PREP-R1 — 홈페이지 배포 준비

**작성 2026-08-23.** 이 문서가 정본이다.

> **상태: 1~5 완료 · 6(원격·push·Cloudflare)은 소유자 승인 대기.**
> 로컬 작업만 했다. 원격 저장소 없음. `sera-saju` 저장소·매장 태블릿·서버에
> 손대지 않았다.

---

## 지시 (소유자 · 2026-08-23)

1. `~/Downloads/jinazen_site_v1.zip` 을 `~/dev/jinazen-site` 로 푼다
2. 독립 git 저장소로 init (`sera-saju` 밖 · 원격 없음 · `main`). `.gitignore` 추가.
   초기 커밋 1건: `site: v1 (KO/EN/JA · privacy · assets)`
3. Pretendard 자체 호스팅 전환. variable woff2 를 `assets/font/` 에 받고 CDN link 를
   `@font-face` 로 교체. 로컬 http.server 로 세 언어 렌더 확인(스크린샷 3장, 저장소 밖).
   다운로드 불가 환경이면 CDN 유지하고 사유 보고
4. 검수: 링크 전수 · `lang` 속성 · 문구 오탈자 **목록만**(수정 금지) · Lighthouse 요약
5. 이 문서로 지시서와 결과를 저장소에 기록
6. 보고 후 정지. GitHub 원격·push·Cloudflare 는 별도 승인

---

## 1~2. 압축 해제 · 저장소 초기화 — 완료

`site/` 하위를 저장소 루트로 올렸다. 파일 13개 + 빈 `assets/font/`.

```
index.html · en/index.html · ja/index.html
privacy/index.html · privacy/en/index.html · privacy/ja/index.html
assets/style.css · assets/img/{northstar.svg, artist.jpg, tea_*.jpg}
README_배포.md
```

`sera-saju` 와 **분리한 이유**는 배포 주기와 공개 범위가 다르기 때문이다.
홈페이지는 정적 호스팅으로 공개되고, 앱·계산엔진 이력과 섞일 이유가 없다.

## 3. Pretendard 자체 호스팅 — 완료 (**성능 대가 있음**)

`assets/font/PretendardVariable.woff2` (2,057,688 B · 1.96 MB) 를 받아
`assets/style.css` 맨 앞에 `@font-face` 를 넣고, HTML **6개 파일**의 jsDelivr
`<link>` 를 전부 걷어냈다. 남은 CDN 참조 0건.

로컬 `python3 -m http.server 8777` 로 확인:

| 경로 | 응답 |
|---|---|
| `/` `/en/` `/ja/` `/privacy/` `/privacy/en/` `/privacy/ja/` | 200 |
| `/assets/style.css` | 200 |
| `/assets/font/PretendardVariable.woff2` | 200 · 2,057,688 B |

세 언어 스크린샷을 헤드리스 Chrome 으로 찍었고(저장소 밖 scratchpad),
서버 접근 로그에서 **세 페이지 모두 woff2 를 실제로 받아간 것**을 확인했다.

### ⚠ 왜 단일 variable 파일인가 — 그리고 그 대가

CDN 이 쓰던 것은 `pretendardvariable-dynamic-subset` 으로, **woff2 가 92개**인
동적 서브셋판이다. 정적 호스팅에 92개를 얹어 관리하는 대신 단일 variable
파일을 골랐다. 대신 **첫 로드가 2MB** 다.

Lighthouse(모바일 스로틀링) 기준 이것이 최대 자원이다 — 전체 전송량의 약 83%.
`font-display:swap` 이라 글자는 먼저 보이지만, 지표는 확실히 나빠졌다.

**줄이는 길 세 가지** (소유자 판단 필요):

1. `pyftsubset` 으로 실제 쓰는 글자만 남긴 서브셋 생성 → 보통 수백 KB
2. 92개 동적 서브셋을 그대로 저장소에 넣기 → 가장 빠르지만 파일 관리 부담
3. CDN 으로 되돌리기 → 성능은 최선이나 외부 의존과 방문자 요청 노출이 남는다

## 4. 검수 결과

### `lang` 속성 · title — 이상 없음

| 파일 | lang | title |
|---|---|---|
| `index.html` | `ko` | 진아젠 운세그래프 — JinaZen |
| `en/index.html` | `en` | JinaZen Fortune Graph — JinaZen |
| `ja/index.html` | `ja` | ジナゼン 運勢グラフ — JinaZen |
| `privacy/index.html` | `ko` | 개인정보처리방침 — JinaZen |
| `privacy/en/index.html` | `en` | Privacy Policy — JinaZen |
| `privacy/ja/index.html` | `ja` | プライバシーポリシー — JinaZen |

### 링크 전수 — HTML 은 깨진 곳 없음. **CSS 에 1건 있다**

HTML 의 앵커·상대경로·`src` 전수 검사에서 **깨진 링크 0건**.

다만 서버 로그에서 404 가 잡혔다:

- **`assets/style.css:45` — `url(assets/img/northstar.svg)`**
  CSS 는 `assets/` 안에 있으므로 이 경로는 `/assets/assets/img/...` 로 풀린다.
  → `url(img/northstar.svg)` 여야 한다. **키오스크 목업의 배경 별이 안 보인다.**
  (지시가 「문구는 수정 금지」였고 이건 문구가 아니지만, 범위를 넘지 않으려고
  **고치지 않고 남겨 둔다.** 승인하면 한 줄이다.)

- `/robots.txt` 404 — Lighthouse 의 탐색일 뿐 사이트 결함은 아니다.
  다만 공개 배포 전에 `robots.txt` 와 `sitemap.xml` 을 두는 편이 낫다.

### 출시 전에 반드시 채워야 할 자리

- **Google Play CTA 가 `href="#"`** — KO·EN·JA **세 곳 모두** 미연결
- **스크린샷 자리 4곳이 비어 있다** — 히어로 · 고객 화면 · 사주 원국 · A4 리포트
  (「스크린샷 자리」 문구가 그대로 보인다)
- `index.html:13` 의 `<a class="brand" href="">` — 빈 href. EN/JA 는 `href="../"`

### 문구 — 목록만 (수정하지 않았다)

**언어 간 불일치**

| # | 항목 | KO | EN | JA |
|---|---|---|---|---|
| 1 | 국가명 | 사우디 | Saudi Arabia | サウジアラビア |
| 2 | 전화 | `070-8287-1733` | `+82 70-8287-1733` | `+82 70-8287-1733` |
| 3 | 매장 위치 | 속초 영랑동 | Yeongnang **Beach**, Sokcho | 束草・永郎洞 |
| 4 | 천일차 | 기력·양기·**황기·구기자** | Vitality · yang energy | 気力 · 陽気 |
| 5 | 자미차 | 숙면·북극성·**산조인·흑하랑** | Deep rest · calm | 安眠 · 北極星 |
| 6 | 천월차 | 비움·음기·**우엉·민들레** | Emptying · yin energy | デトックス · 陰気 |

4~6 은 **재료가 한국어에만 있다.** 의도라면 그대로 두고, 아니라면 세 언어를 맞춘다.

**일본어**

- `専門家の検収を経た` · `専門家検収` — **`検収`(검수: 납품 검사)** 는 뜻이 다르다.
  한국어 「검수」의 이 맥락은 **`監修`(감수)** 가 맞다. 2곳
- `紫微斗數`(구자체)와 `紫微斗数`(신자체)가 **같은 페이지에 섞여 있다**
- `貢茶` — 일본에서 Gong Cha 는 보통 `ゴンチャ` 로 쓴다. 확인 필요

**영어**

- `Int'l Women's Invention Exposition 2017` — 정식 명칭 확인 필요(KIWIE)
- `the solo and companion meditation chairs` — 한국어는 「나홀로 명상의자」와
  **「사랑의 의자」**. `companion` 은 뉘앙스가 다르다

**한국어**

- 「명상아티스트」 — 표준 띄어쓰기는 「명상 아티스트」. 다만 전 페이지에서
  일관되게 붙여 쓰므로 **브랜드 표기 의도**로 보인다. 확인만 필요
- 「차 한잔을」 — 「한 잔」이 원칙이나 「한잔」도 허용된다. 그대로 두어도 무방

### Lighthouse (KO 페이지 · 헤드리스 Chrome · 기본 모바일 스로틀링)

| 항목 | 점수 |
|---|---|
| Performance | **56** |
| Accessibility | **89** |
| Best Practices | **96** |
| SEO | **100** |

핵심 지표: FCP 11.0s · LCP 13.4s · Speed Index 11.0s · **TBT 0ms · CLS 0**

- **TBT 0 · CLS 0 은 좋다** — 스크립트가 없고 레이아웃이 흔들리지 않는다
- 성능 감점은 사실상 **폰트 2MB 하나**다(전송량의 83%). 위 §3 의 서브셋 방안으로
  대부분 회수된다
- 접근성 감점 2건: **색 대비 부족**(`<small>`, `.k` 3곳) · **제목 레벨 건너뜀**
- Best Practices 감점: 콘솔 404 — 위 `northstar.svg` 경로 건

## 5. 이 문서 — 저장소에 기록

## R2 (2026-08-23 후속) — 폰트 되돌림 · 지적 2건 수정

소유자 지시로 자체 호스팅을 **되돌렸다**(`git revert`, reset 아님).
`assets/font/PretendardVariable.woff2` 는 **지우지 않고 남겼다** — 서브셋을
만들 때 원본으로 쓴다. 그래서 되돌림이 완전하지 않다: 파일 하나가 남아
있고 아무도 참조하지 않는다. 의도된 상태다.

함께 고친 것 둘:

- `style.css` 의 `url(assets/img/northstar.svg)` → `url(img/northstar.svg)`
- 루트 `index.html` 의 `<a class="brand" href="">` → `href="./"`

문구는 **손대지 않았다.** 소유자 확정본을 받아 한 번에 반영한다.

### Lighthouse 재측정 (KO · 같은 조건)

| 항목 | 자체 호스팅 | CDN 복귀 |
|---|---|---|
| Performance | 56 | **92** |
| Accessibility | 89 | 89 |
| Best Practices | 96 | **100** |
| SEO | 100 | 100 |
| First Contentful Paint | 11.0s | **1.4s** |
| Largest Contentful Paint | 13.4s | **3.3s** |
| Speed Index | 11.0s | **1.4s** |
| TBT · CLS | 0ms · 0 | 0ms · 0 |

**콘솔 오류 0건** — `northstar.svg` 404 가 사라져 모범사례가 100 이 됐다.

숫자가 말하는 것은 분명하다. 2MB 단일 variable 파일은 **너무 비쌌다.**
자체 호스팅을 다시 시도한다면 서브셋이 전제다 — 남겨 둔 woff2 가 그 원본이다.

## 6. 남은 일 (승인 대기)

- GitHub 원격 생성 · push
- Cloudflare Pages 연결 · 도메인
- 위 검수 목록 중 무엇을 고칠지 결정
