/* 첫 화면 배너 (SITE-43) — 🔴 **얹기만 한다.** 배너 셋은 CSS scroll-snap 만으로 밀어서 보인다.
   이 파일이 하는 것: 점 셋(단추) · 좌우 화살표(PC) · 자동 넘김 · 키보드 좌우.
   🔴 스크립트가 꺼지면 이것들이 **하나도 안 생긴다** — 자동 넘김도 없다.

   🔴 자동 넘김 규칙
   - 7초마다 한 칸. 셋째 다음은 첫째.
     근거: 가장 긴 배너 글자(② 한 줄 약 90자)를 읽는 데 한국어 기준 6초 남짓이 걸린다(분당 900자 안팎).
   - 🔴 **멈춤은 전부 「잠시」다** (SITE-48 §2 · 소유자 확정 2026-09-24) — 손을 대면 멈추고 **떼면 다시 돈다**:
     · 마우스를 올림(hover) — ⚠ **가리키는 장치가 있을 때만** 본다(`(hover: hover)`).
       폰은 탭에 `mouseenter` 가 한 번 오고 `mouseleave` 가 **영영 안 오는** 브라우저가 있어,
       그것을 세면 터치 기기에서 자동 넘김이 **다시는 안 돈다**
     · 배너 안에 **키보드 초점**(focusin + `:focus-visible`) — 탭으로 들어와 읽는 동안 멈춘다.
       🔴 마우스·손가락으로 눌러 생긴 초점은 **세지 않는다** — 아래 까닭(실측)
     · 손가락·마우스를 누르고 있음(pointerdown → pointerup/pointercancel)
     · 휠을 굴림 — ⚠ 휠에는 「뗌」이 없다. 마지막 휠에서 1.2초가 지나면 푼다
   - 탭이 안 보이면(document.hidden) 넘기지 않는다
   - 🔴 prefers-reduced-motion: reduce 면 **처음부터 끝까지 멈춤** · 넘김도 부드럽게 하지 않는다.
     ⚠ 이 손님에게는 자동 넘김이 **아예 없다** — 손으로만 넘긴다(SITE-48 에서도 그대로다)

   ~~🔴 **멈춤/재생 단추** (SITE-44 · WCAG 2.2.2 — 5초 넘게 움직이는 것에는 멈출 수단이 있어야 한다)
     점 셋 옆 · `aria-label` 「자동 넘김 멈춤」/「자동 넘김 재생」 · `aria-pressed` 는 쓰지 않는다(SITE-45)~~
   🔴 **단추를 뺐다 (SITE-48 §2 · 소유자 확정 2026-09-24).** 위 두 줄을 **지우지 않는다** —
      다음 사람이 「왜 없나」를 처음부터 다시 조사한다(함정 26 과 같은 이유).
   ⚠ **접근성 기준(WCAG 2.2.2)에서 멀어진다.** 그 기준은 「5초 넘게 자동으로 움직이는 것에는
      멈출 **수단**이 있어야 한다」이고, 이제 남은 수단은 **손을 대고 있는 동안**뿐이다 —
      손을 떼면 다시 돈다. 🔴 **소유자 확정으로 그렇게 한다**(2026-09-24). 되돌릴 때 필요한 것은
      `toggle` 단추와 `data-pause`/`data-play` 두 속성이다(세 쪽 `.banners` 에서 함께 뺐다).

   상태는 `data-auto` 에 적는다(on · paused · stopped) — 값 셋은 **그대로 둔다**. */
(function () {
  var root = document.querySelector(".banners");
  if (!root) return;
  var track = root.querySelector(".banner-track");
  var slides = Array.prototype.slice.call(track.querySelectorAll(".banner"));
  if (slides.length < 2) return;

  var INTERVAL = 7000;
  var WHEEL_IDLE = 1200;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var canHover = window.matchMedia("(hover: hover)");
  var stopped = reduce.matches;
  // 🔴 「잠시 멈춤」의 까닭 넷을 따로 센다 — 하나로 묶으면 마우스를 떼는 것이 손가락 누름까지 푼다.
  var hover = false, focus = false, held = false, wheeling = 0, wheelTimer = null;

  function paused() {
    return hover || focus || held || wheeling > 0;
  }
  function state() {
    root.setAttribute("data-auto", stopped ? "stopped" : paused() ? "paused" : "on");
  }
  function index() {
    return Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
  }
  function go(i) {
    i = (i + slides.length) % slides.length;
    track.scrollTo({ left: i * track.clientWidth, behavior: reduce.matches ? "auto" : "smooth" });
    mark(i);
  }

  // ── 점 셋 — 단추 · aria-label · aria-controls ──
  var dots = document.createElement("div");
  dots.className = "banner-dots";
  var buttons = slides.map(function (slide, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", (root.getAttribute("data-dot") || "{n}").replace("{n}", i + 1));
    b.setAttribute("aria-controls", slide.id);
    // ⚠ 여기서 끝까지 멈추지 않는다 — 누르는 순간 초점이 들어오므로 **초점이 있는 동안** 멈춘다.
    b.addEventListener("click", function () { go(i); });
    dots.appendChild(b);
    return b;
  });
  root.appendChild(dots);

  // ── 좌우 화살표 — PC 만(CSS 가 폰에서 숨긴다) ──
  [["prev", -1, "‹"], ["next", 1, "›"]].forEach(function (a) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "banner-arrow " + a[0];
    b.setAttribute("aria-label", root.getAttribute("data-" + a[0]) || a[0]);
    b.setAttribute("aria-controls", "banner-1");
    b.textContent = a[2];
    b.addEventListener("click", function () { go(index() + a[1]); });
    root.appendChild(b);
  });

  function mark(target) {
    var k = typeof target === "number" ? target : index();
    buttons.forEach(function (b, j) { b.setAttribute("aria-current", j === k ? "true" : "false"); });
  }
  // ⚠ requestAnimationFrame 에 걸지 않는다 — 그리기가 멈춘 창(뒤 탭 · 헤드리스)에서는 rAF 가 안 돌아
  //   점이 옛 자리에 남았다(SITE-43 실측). mark 는 속성 셋만 바꾸므로 스크롤마다 불러도 싸다.
  track.addEventListener("scroll", mark, { passive: true });

  // ── 키보드 좌우 — 초점이 들어와 있으므로 그동안은 이미 멈춰 있다 ──
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      go(index() + (e.key === "ArrowRight" ? 1 : -1));
    }
  });

  // ── 손가락·마우스를 누르고 있는 동안 ──
  track.addEventListener("pointerdown", function () { held = true; state(); }, { passive: true });
  ["pointerup", "pointercancel", "touchend", "touchcancel"].forEach(function (ev) {
    // ⚠ window 에 건다 — 배너 밖에서 손을 떼면 track 에는 이 사건이 안 온다.
    window.addEventListener(ev, function () { if (held) { held = false; state(); } }, { passive: true });
  });

  // ── 휠 — 「뗌」이 없어 마지막 휠에서 1.2초를 센다 ──
  track.addEventListener("wheel", function () {
    wheeling = 1;
    state();
    if (wheelTimer) clearTimeout(wheelTimer);
    wheelTimer = setTimeout(function () { wheeling = 0; state(); }, WHEEL_IDLE);
  }, { passive: true });

  // ── 올리거나 초점이 있으면 잠시 멈춤 ──
  root.addEventListener("mouseenter", function () { if (canHover.matches) { hover = true; state(); } });
  root.addEventListener("mouseleave", function () { hover = false; state(); });
  // 🔴 **초점 멈춤은 「키보드 초점」만 센다** (`:focus-visible` · SITE-48 §2 실측).
  //    까닭 — `.banner-track` 이 `tabindex="0"` 이라 **누르기만 해도 초점이 들어온다.** 그것을 세면
  //    손을 떼도 초점이 남아 **자동 넘김이 다시는 안 돈다**(실측: 누름을 떼도 `paused`).
  //    그리고 그 멈춤은 **눈에 보이지 않는다** — 마우스로 들어온 초점에는 테두리가 안 그려진다.
  //    키보드로 들어오면 테두리가 보이므로 「왜 멈췄나」가 손님에게 읽힌다.
  //    ⚠ `:focus-visible` 을 모르는 브라우저에서는 **종전대로 모든 초점**을 센다(안전한 쪽).
  root.addEventListener("focusin", function (e) {
    var t = e.target;
    try { focus = !t.matches || t.matches(":focus-visible"); }
    catch (err) { focus = true; }
    state();
  });
  root.addEventListener("focusout", function (e) {
    if (!root.contains(e.relatedTarget)) { focus = false; state(); }
  });
  if (reduce.addEventListener) reduce.addEventListener("change", function () { if (reduce.matches) stopped = true; state(); });

  setInterval(function () {
    if (stopped || paused() || document.hidden) return;
    go(index() + 1);
  }, INTERVAL);

  mark();
  state();
})();
