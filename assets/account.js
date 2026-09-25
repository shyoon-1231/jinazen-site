/* 머리띠 계정 칸 (SITE-50 §1 · SITE-55 · 소유자 지적 2026-09-25) — 🔴 **얹기만 한다.**
   기본은 「로그인」(HTML 그대로)이고, 이 파일은 로그인한 손님에게만 「마이페이지」로 바꾼다.
   🔴 스크립트가 꺼지면 「로그인」 그대로다 — 링크가 `/login/?next=/mypage/` 라,
      이미 로그인한 손님이 눌러도 웹이 마이페이지로 보낸다(SITE-50 §1 ⑦).

   🔴 묻는 곳: `GET /report/auth/me` (WEB-70 §5) — 답은 `{"loggedIn": true|false}` **하나**다.
      `jinazen-web/web_report/tests/test_auth_me_70.py` 가 그 모양을 `==` 로 잠근다.

   🔴 「답」으로 치는 것은 **딱 한 모양**이다 — 200 이고, JSON 이고, 열쇠가 `loggedIn` 하나뿐이고,
      그 값이 참/거짓 값일 때. 나머지는 답이 아니다 — 글자도 기억도 바꾸지 않는다:
      · 실패(네트워크 · 4xx · 5xx) · JSON 이 아님
      · 🔴 **2초 안에 답이 없음** — 늦게 온 `true` 도 버린다(글자가 뒤늦게 바뀌면 손님이 누르려던 자리가 바뀐다)
      · 모양이 다름 — 열쇠가 늘었거나(`{"loggedIn":true,"name":…}`) 값이 글자(`"true"`)이거나
      ⚠ 모양이 다르면 앱 쪽 계약이 바뀐 것이다. 여기서 추측해 맞추지 않는다.

   ── 🔴 **깜박임 줄이기 — 지난번 답을 기억한다** (SITE-55 · 소유자 지적 2026-09-25) ──
   까닭: 로그인한 손님에게 「로그인」이 먼저 보였다가 답이 오면 「마이페이지」로 바뀌는 것이 보였다.
   🔴 기억은 `localStorage` 열쇠 **하나** — `jz_login_hint` = "1" | "0". **그 밖의 값은 쓰지 않는다**
      (회원번호 · 이름 · 시각 0 — 이 기기에서 지난번에 로그인돼 있었는가 하나뿐이다).
   🔴 첫 그림은 **머리(head) 안 인라인 한 줄**이 정한다 — 이 파일은 `defer` 라 첫 그림보다 늦을 수 있다:
      · 기억 "1" → `html.jz-in` — 처음부터 「마이페이지」
      · 기억 "0" → 아무것도 안 붙인다 — 「로그인」
      · 기억 없음(첫 방문 · 모르는 값) → `html.jz-wait` — 글자를 **숨긴 채** 기다린다(칸 폭은 그대로 · 자리만 빈다).
        🔴 **600ms 상한은 인라인 쪽 타이머**다 — 이 파일이 느린 망에서 늦게 와도 600ms 에 「로그인」이 보인다
      · `localStorage` 가 막혀 예외 → 아무것도 안 붙인다 — **SITE-50 동작 그대로**(「로그인」 → 답이 참이면 바꿈)
   🔴 답이 오면: 기억과 같으면 화면은 그대로 · 다르면 그때만 바꾸고 기억을 고친다.
      600ms 를 넘겨 「로그인」이 보인 뒤 2초 안에 참이 오면 그때 바꾼다.
   ⚠ 답이 아닌 것(실패 · 시간 초과 · 모양 다름)은 기억을 **안 고친다** — 기억 "1" 이면 「마이페이지」가 남는다.
      눌러도 아래 ⑤ 와 같이 해가 없다.

   ⑤ ⚠ **로그아웃 뒤** — 웹에서 로그아웃하고 홈페이지에 오면 기억 "1" 때문에 「마이페이지」가 **잠깐** 보일 수 있다.
      물어본 답(거짓)이 오면 곧 「로그인」이 되고 기억도 "0" 이 된다.
      🟢 **해가 없다** — 그 사이에 눌러도 `/mypage/` 는 비로그인에게 **로그인 화면**을 그린다
      (2026-09-25 실측: 401 · 제목 「로그인 — 개인용 운세그래프」 · 로그인 뒤 `/mypage/` 로 돌아오는 링크).
      다른 사람의 정보가 보이는 일은 없다 — 기억은 글자 하나를 고를 뿐 아무 권한도 없다.

   🔴 글자가 바뀌어도 머리띠가 흔들리지 않는다 — 두 라벨을 **같은 칸에 겹쳐** 두고 하나만 보인다
      (`assets/style.css` 의 `.mypage` 규칙 · SITE-55 규칙). 숨김 상태도 칸 폭은 둘 중 긴 쪽 그대로다.

   ⚠ `credentials: "same-origin"` — 쿠키는 jinazen.com 에서 열었을 때만 실린다.
      미리보기 주소·로컬에서는 교차 출처라 실패하고, 그래서 「로그인」 그대로다(의도한 대로).
   ⚠ `cache: "no-store"` — 앱도 `Cache-Control: no-store` 를 준다. 답이 쿠키마다 갈린다. */
(function () {
  var KEY = "jz_login_hint";
  var root = document.documentElement;
  var a = document.querySelector(".menu a.mypage");
  if (!a) return;
  var inHref = a.getAttribute("data-in-href");
  var outHref = a.getAttribute("href");
  if (!inHref) { root.classList.remove("jz-wait"); return; }

  function readHint() {
    try {
      var h = window.localStorage.getItem(KEY);
      return h === "1" || h === "0" ? h : null;
    } catch (e) { return null; }
  }
  function writeHint(v) {
    try { window.localStorage.setItem(KEY, v); } catch (e) { /* 막힌 브라우저 — 기억 없이 SITE-50 동작 */ }
  }
  function show(loggedIn) {
    root.classList.remove("jz-wait");
    if (loggedIn) {
      root.classList.add("jz-in");
      a.classList.add("in");
      a.setAttribute("href", inHref);
    } else {
      root.classList.remove("jz-in");
      a.classList.remove("in");
      a.setAttribute("href", outHref);
    }
  }

  // 기억 "1" — 글자는 머리 인라인이 이미 「마이페이지」로 그렸다. 링크도 맞춘다.
  if (readHint() === "1") a.setAttribute("href", inHref);
  if (!window.fetch) { root.classList.remove("jz-wait"); return; }

  var TIMEOUT = 2000;
  var late = false;
  var ctl = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () {
    late = true;
    root.classList.remove("jz-wait");
    if (ctl) ctl.abort();
  }, TIMEOUT);

  function isAnswer(j) {
    return !!j && typeof j === "object" && !Array.isArray(j) &&
      Object.keys(j).length === 1 && typeof j.loggedIn === "boolean";
  }

  fetch("https://jinazen.com/report/auth/me", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json" },
    signal: ctl ? ctl.signal : undefined
  })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (j) {
      clearTimeout(timer);
      if (late || !isAnswer(j)) { root.classList.remove("jz-wait"); return; }
      writeHint(j.loggedIn ? "1" : "0");
      show(j.loggedIn);
    })
    .catch(function () { clearTimeout(timer); root.classList.remove("jz-wait"); });
})();
