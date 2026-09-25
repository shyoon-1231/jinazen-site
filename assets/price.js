/* 개인용 운세그래프 가격 글자 (SITE-57 §1 · 소유자 확정 2026-09-25) — 🔴 **얹기만 한다.**
   기본은 숫자 없는 글자(HTML 그대로)다 — 단추는 「구매하기」, 가격 자리는 **빈 칸**.
   이 파일이 창구에서 지금 가격을 읽어 오면 그때만 숫자를 채운다.
   🔴 **숫자를 HTML 에 박아 두지 않는다** — 할인을 켜고 끌 때 홈페이지와 결제 화면이 갈리지 않게.
      값을 정하는 곳은 웹의 한 벌(`price_service.current_offer` · WEB-65)뿐이다.

   🔴 묻는 곳: `GET /report/api/price` (WEB-84 §2) — 답은 열쇠 **넷**이다:
      `{"price": 9900, "list_price": 9900, "badge": null, "strike": false}`
      `jinazen-web/web_report/tests/test_price_api_84.py` 가 그 모양을 `==` 로 잠근다.

   🔴 「답」으로 치는 것은 **딱 한 모양**이다 — 200 이고, JSON 이고, 열쇠가 그 넷뿐이고,
      `price` 가 0 보다 큰 정수 · `list_price` 가 수 · `badge` 가 null 또는 글자 · `strike` 가 참/거짓일 때.
      나머지는 답이 아니다 — 숫자 없는 글자 그대로 둔다(머리띠 로그인 `account.js` 와 같은 잣대):
      · 실패(네트워크 · 4xx · 🔴 503 = 웹이 값을 못 읽음) · JSON 이 아님
      · 🔴 **2초 안에 답이 없음** — 늦게 온 값도 버린다(손님이 누르려던 단추 글자가 뒤늦게 바뀌지 않게)
      · 모양이 다름 — 열쇠가 늘거나 줄었거나 값의 종류가 다름
      ⚠ 모양이 다르면 웹 쪽 계약이 바뀐 것이다. 여기서 추측해 맞추지 않는다.

   🔴🔴 **취소선 · 할인율 · 「원래 ○원」을 그리지 않는다** (종전거래가격 규정 · WEB-65 §1 조사).
      · `list_price` 는 **읽지 않는다** — 모양 검사에만 쓴다. 화면에 정가가 나가는 길이 이 파일에 없다.
      · `strike` 도 **그리는 데 쓰지 않는다** — 참이어도 취소선을 안 그린다. 판매 흐름(웹)의 설정이고
        홈페이지는 그 표시를 옮기지 않는다(소유자 지시: 「strike 가 false 면 정가를 취소선으로 그리지 않는다
        · list_price 는 쓰지 않는다」 — 홈페이지는 정가를 아예 안 쓰므로 참일 때도 그릴 것이 없다).
      · `badge` 가 있으면(할인 중) 그 글자를 딱지로 보인다 — 글자는 관리 화면에서 소유자가 적은 그대로다.
        🔴 딱지 칸(`[data-price-badge]`)은 **ko 쪽에만** 있다 (SITE-58) — 글자가 한국어뿐이라 en·ja·zh 에서는 칸을 뺐다.

   채우는 자리 — HTML 이 표시한다(이 파일은 글자를 짓지 않는다 · 언어별 글자는 각 쪽 HTML 에 있다):
      · `[data-price-tpl]` — 글자 틀. `{p}` 자리에 「9,900」을 넣은 글자로 **통째로** 바꾼다
        (단추 「구매하기」 → 「9,900원 구매하기」 · 가격 칸 「」 → 「9,900원」). 언어마다 어순이 달라 틀째 둔다.
      · `[data-price-badge]` — 딱지 칸. `badge` 가 글자일 때만 그 글자를 넣고 보인다(`hidden` 을 뗀다).
      · `[data-price-when]` — 가격이 채워졌을 때만 보이는 곁글(「부가세 포함」). 🔴 값 없이 「부가세 포함」만
        떠 있으면 뜻이 없다. `visibility` 로 숨겨 **자리는 남긴다** — 채워져도 줄 높이가 안 흔들린다.
      · 🔴 같은 표시가 **개인용 섹션의 가격 문장**에도 붙는다 (SITE-58 · 소유자 확정 2026-09-25) — 그쪽은
        `display:none` 이라 **통째로** 숨는다(「…내 것 하나만 ␣␣␣에.」를 손님에게 보이지 않는다). 이 파일은
        두 경우 모두 `.is-priced` 를 붙일 뿐이고, 숨기는 방식은 `assets/style.css` 가 정한다.
      · 🔴 **배너 ② 가격 줄**에도 같은 표시가 붙는다 (SITE-59 · 소유자 확정 2026-09-26) — 같은 함수(`fill`)가 같은 `.is-priced` 를
        붙이고, 숨김은 CSS 규칙 **하나**(`p[data-price-when]`)가 맡는다. 이 파일의 코드는 바뀌지 않았다.
   🔴 글자 폭이 흔들리지 않게 — 가격 칸 · 구매 단추의 최소 폭은 `assets/style.css` 의 SITE-57 규칙이 잡는다.

   ⚠ 묻는 주소는 `https://jinazen.com/...` 절대 주소다(`account.js` 와 같다). 창구는 **같은 출처**라
      CORS 머리를 안 단다(WEB-84 §2) — 미리보기 주소·로컬에서는 막혀 숫자 없는 글자 그대로다(의도한 대로).
   ⚠ 캐시 — 창구가 `public, max-age=60` 을 준다. 할인을 바꾸면 1분 안에 여기도 따라온다.
      그래서 `no-store` 를 **걸지 않는다**(`account.js` 와 다른 점 — 저쪽 답은 쿠키마다 갈리고 이쪽은 모두에게 같다). */
(function () {
  var slots = document.querySelectorAll("[data-price-tpl]");
  if (!slots.length || !window.fetch) return;

  var TIMEOUT = 2000;
  var late = false;
  var ctl = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () {
    late = true;
    if (ctl) ctl.abort();
  }, TIMEOUT);

  var KEYS = ["badge", "list_price", "price", "strike"];
  function isAnswer(j) {
    if (!j || typeof j !== "object" || Array.isArray(j)) return false;
    var k = Object.keys(j).sort();
    if (k.length !== KEYS.length) return false;
    for (var i = 0; i < KEYS.length; i++) if (k[i] !== KEYS[i]) return false;
    return typeof j.price === "number" && isFinite(j.price) && Math.floor(j.price) === j.price && j.price > 0 &&
      typeof j.list_price === "number" &&
      (j.badge === null || typeof j.badge === "string") &&
      typeof j.strike === "boolean";
  }
  // 🔴 「9900」 → 「9,900」 — 브라우저 언어 설정(`toLocaleString`)에 맡기지 않는다. 어떤 기기에서도 같은 글자다.
  function won(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

  function fill(j) {
    var p = won(j.price);
    for (var i = 0; i < slots.length; i++) {
      slots[i].textContent = slots[i].getAttribute("data-price-tpl").split("{p}").join(p);
      slots[i].classList.add("is-priced");
    }
    var when = document.querySelectorAll("[data-price-when]");
    for (i = 0; i < when.length; i++) when[i].classList.add("is-priced");
    if (typeof j.badge === "string" && j.badge.trim()) {
      var b = document.querySelectorAll("[data-price-badge]");
      for (i = 0; i < b.length; i++) { b[i].textContent = j.badge.trim(); b[i].hidden = false; }
    }
  }

  fetch("https://jinazen.com/report/api/price", {
    method: "GET",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
    signal: ctl ? ctl.signal : undefined
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      clearTimeout(timer);
      if (late || !isAnswer(j)) return;
      fill(j);
    })
    .catch(function () { clearTimeout(timer); });
})();
