/* 머리띠 계정 칸 (SITE-50 §1 · 소유자 지적 2026-09-25) — 🔴 **얹기만 한다.**
   기본은 「로그인」(HTML 그대로)이고, 이 파일은 로그인한 손님에게만 「마이페이지」로 바꾼다.
   🔴 스크립트가 꺼지면 「로그인」 그대로다 — 링크가 `/login/?next=/mypage/` 라,
      이미 로그인한 손님이 눌러도 웹이 마이페이지로 보낸다(SITE-50 §1 ⑦).

   🔴 묻는 곳: `GET /report/auth/me` (WEB-70 §5) — 답은 `{"loggedIn": true|false}` **하나**다.
      `jinazen-web/web_report/tests/test_auth_me_70.py` 가 그 모양을 `==` 로 잠근다.

   🔴 「마이페이지」로 바꾸는 것은 **딱 한 경우**다 — 200 이고, JSON 이고, 열쇠가 `loggedIn`
      하나뿐이고, 그 값이 `true`(참/거짓 값)일 때. 나머지는 전부 「로그인」 그대로:
      · 실패(네트워크 · 4xx · 5xx) · JSON 이 아님
      · 🔴 **2초 안에 답이 없음** — 늦게 온 `true` 도 버린다(글자가 뒤늦게 바뀌면 손님이 누르려던 자리가 바뀐다)
      · 모양이 다름 — 열쇠가 늘었거나(`{"loggedIn":true,"name":…}`) 값이 글자(`"true"`)이거나
      ⚠ 모양이 다르면 앱 쪽 계약이 바뀐 것이다. 여기서 추측해 맞추지 않는다 — 안전한 쪽(로그인)에 선다.

   🔴 글자가 바뀌어도 머리띠가 흔들리지 않는다 — 두 라벨을 **같은 칸에 겹쳐** 두고 하나만 보인다
      (`assets/style.css` 의 `.mypage` 규칙). 칸 폭은 늘 둘 중 긴 쪽이다. 이 파일은 `.in` 한 개만 붙인다.

   ⚠ `credentials: "same-origin"` — 쿠키는 jinazen.com 에서 열었을 때만 실린다.
      미리보기 주소·로컬에서는 교차 출처라 실패하고, 그래서 「로그인」 그대로다(의도한 대로).
   ⚠ `cache: "no-store"` — 앱도 `Cache-Control: no-store` 를 준다. 답이 쿠키마다 갈린다. */
(function () {
  var a = document.querySelector(".menu a.mypage");
  if (!a || !window.fetch) return;
  var inHref = a.getAttribute("data-in-href");
  if (!inHref) return;

  var TIMEOUT = 2000;
  var late = false;
  var ctl = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () {
    late = true;
    if (ctl) ctl.abort();
  }, TIMEOUT);

  function isLoggedIn(j) {
    return !!j && typeof j === "object" && !Array.isArray(j) &&
      Object.keys(j).length === 1 && j.loggedIn === true;
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
      if (late || !isLoggedIn(j)) return;
      a.setAttribute("href", inHref);
      a.classList.add("in");
    })
    .catch(function () { clearTimeout(timer); });
})();
