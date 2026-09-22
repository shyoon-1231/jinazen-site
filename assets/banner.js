/* 첫 화면 배너 (SITE-43) — 🔴 **얹기만 한다.** 배너 셋은 CSS scroll-snap 만으로 밀어서 보인다.
   이 파일이 하는 것: 점 셋(단추) · 좌우 화살표(PC) · 자동 넘김 · 키보드 좌우.

   🔴 자동 넘김 규칙
   - 7초마다 한 칸. 셋째 다음은 첫째.
     근거: 가장 긴 배너 글자(② 한 줄 약 90자)를 읽는 데 한국어 기준 6초 남짓이 걸린다(분당 900자 안팎).
   - 멈춤(잠시): 마우스를 올리거나(hover) 배너 안에 초점이 있을 때 — 떠나면 다시 돈다
   - 멈춤(끝까지): 손을 대면(터치 · 끌기 · 휠 · 키보드 · 점 · 화살표) — 🔴 사람이 스스로 넘기기 시작하면 다시 돌지 않는다
   - 탭이 안 보이면(document.hidden) 넘기지 않는다
   - 🔴 prefers-reduced-motion: reduce 면 **자동 넘김이 없다**(그리고 넘김도 부드럽게 하지 않는다)
   상태는 `data-auto` 에 적는다(on · paused · stopped · off) — 시험이 이것을 읽는다. */
(function () {
  var root = document.querySelector(".banners");
  if (!root) return;
  var track = root.querySelector(".banner-track");
  var slides = Array.prototype.slice.call(track.querySelectorAll(".banner"));
  if (slides.length < 2) return;

  var INTERVAL = 7000;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var stopped = false, paused = false;

  function state() {
    root.setAttribute("data-auto", reduce.matches ? "off" : stopped ? "stopped" : paused ? "paused" : "on");
  }
  function index() {
    return Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
  }
  function go(i) {
    i = (i + slides.length) % slides.length;
    track.scrollTo({ left: i * track.clientWidth, behavior: reduce.matches ? "auto" : "smooth" });
    mark(i);
  }
  function stop() {
    stopped = true;
    state();
  }

  // ── 점 셋 — 단추 · aria-label · aria-controls ──
  var dots = document.createElement("div");
  dots.className = "banner-dots";
  var buttons = slides.map(function (slide, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", (root.getAttribute("data-dot") || "{n}").replace("{n}", i + 1));
    b.setAttribute("aria-controls", slide.id);
    b.addEventListener("click", function () { stop(); go(i); });
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
    b.addEventListener("click", function () { stop(); go(index() + a[1]); });
    root.appendChild(b);
  });

  function mark(target) {
    var k = typeof target === "number" ? target : index();
    buttons.forEach(function (b, j) { b.setAttribute("aria-current", j === k ? "true" : "false"); });
  }
  // ⚠ requestAnimationFrame 에 걸지 않는다 — 그리기가 멈춘 창(뒤 탭 · 헤드리스)에서는 rAF 가 안 돌아
  //   점이 옛 자리에 남았다(SITE-43 실측). mark 는 속성 셋만 바꾸므로 스크롤마다 불러도 싸다.
  track.addEventListener("scroll", mark, { passive: true });

  // ── 키보드 좌우 ──
  track.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      stop();
      go(index() + (e.key === "ArrowRight" ? 1 : -1));
    }
  });

  // ── 손을 대면 끝까지 멈춤 ──
  ["pointerdown", "touchstart", "wheel"].forEach(function (ev) {
    track.addEventListener(ev, stop, { passive: true });
  });

  // ── 올리거나 초점이 있으면 잠시 멈춤 ──
  root.addEventListener("mouseenter", function () { paused = true; state(); });
  root.addEventListener("mouseleave", function () { paused = false; state(); });
  root.addEventListener("focusin", function () { paused = true; state(); });
  root.addEventListener("focusout", function (e) {
    if (!root.contains(e.relatedTarget)) { paused = false; state(); }
  });
  if (reduce.addEventListener) reduce.addEventListener("change", state);

  setInterval(function () {
    if (stopped || paused || reduce.matches || document.hidden) return;
    go(index() + 1);
  }, INTERVAL);

  mark();
  state();
})();
