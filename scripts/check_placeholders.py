#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""배포 전 검사 — **자리표시자가 남아 있으면 배포를 막는다** (SITE-EDIT-2 [1]).

## 왜 이 파일이 있나

개인정보처리방침의 시행일이 **미확정**이다. 그래서 본문에 `[시행일 미정]` 같은
자리표시자가 들어 있다.

    D-U-N-S 발급 → Play 스토어 등록 → 도메인 이전 → +7일 → 시행

D-U-N-S 는 2026-08-19 신청 후 대기 중이고 도메인 이전은 Play 등록 뒤다.
**시행은 10월 이후**이며, 앞의 두 칸은 우리가 정하지 못한다.

**그대로 배포되면 법적 고지에 「[시행일 미정]」이 그대로 찍힌다.** 시행일이 없는
개인정보처리방침은 방침이 없는 것과 다르지 않다. 그런데 이런 종류의 실수는
**아무 소리도 내지 않는다** — 페이지는 멀쩡히 뜨고, 링크도 다 살아 있고,
글자 하나가 틀렸을 뿐이다. 눈으로는 못 잡는다.

그래서 사람이 기억하는 대신 **기계가 막는다.**

```
python3 scripts/check_placeholders.py
```

- exit 0 → 자리표시자 없음. 배포해도 된다
- exit 1 → 🔴 배포 금지

⚠ **지금은 실패하는 것이 정상이다.** 이 검사가 통과로 바뀌는 순간이
「날짜가 들어갔다」는 뜻이고, 그때가 배포할 수 있는 때다.

## 검사 항목

1. 자리표시자가 남아 있는가 (있으면 배포 금지)
2. 철회된 날짜(2026-09-05 · 2026-08-29)가 되살아났는가
3. 세 언어의 자리표시자 개수가 같은가 — 한 언어만 채우고 배포하는 것을 막는다
4. 조문 번호·편 구조가 세 판본에서 일치하는가
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGES = [
    "privacy/index.html", "privacy/en/index.html", "privacy/ja/index.html",
    "privacy/notice/index.html", "privacy/notice/en/index.html", "privacy/notice/ja/index.html",
]
POLICIES = ["privacy/index.html", "privacy/en/index.html", "privacy/ja/index.html"]
NOTICES = ["privacy/notice/index.html", "privacy/notice/en/index.html", "privacy/notice/ja/index.html"]

# 세 언어의 자리표시자. 뜻이 같은 것끼리 묶어 개수를 맞춘다.
PLACEHOLDERS = ["[시행일 미정]", "[공지일 미정]",
                "[effective date TBD]", "[posting date TBD]",
                "［施行日未定］", "［告知日未定］"]

# 🔴 철회된 날짜. 되살아나면 실패한다 — 소유자 확정 없이 날짜가 돌아오는 길을 막는다.
WITHDRAWN = ["2026년 9월 5일", "September 5, 2026", "2026年9月5日", "2026-09-05",
             "2026년 8월 29일", "August 29, 2026", "2026年8月29日", "2026-08-29"]

ARTICLE_PAT = {
    "privacy/index.html": r"<h3>제(\d+)조",
    "privacy/en/index.html": r"<h3>Article (\d+)",
    "privacy/ja/index.html": r"<h3>第(\d+)条",
}


def read(rel):
    path = os.path.join(ROOT, rel)
    if not os.path.isfile(path):
        raise SystemExit("파일이 없다: %s" % path)
    with open(path, encoding="utf-8") as f:
        return f.read()


def body(text):
    """주석을 걷어낸 **그려지는 글자**. 주석 속 설명까지 세면 개수가 어긋난다."""
    return re.sub(r"<!--.*?-->", "", text, flags=re.S)


def main():
    failures = []
    blocked = []

    # ── 1. 자리표시자가 남아 있는가 ────────────────────────────────────
    print("── 1. 자리표시자 ──")
    for rel in PAGES:
        text = body(read(rel))
        found = [(p, text.count(p)) for p in PLACEHOLDERS if p in text]
        total = sum(n for _, n in found)
        if total:
            blocked.append((rel, found))
            print("  🔴 %-34s %d곳 %s" % (rel, total, " ".join("%s×%d" % f for f in found)))
        else:
            print("  ✅ %-34s 없음" % rel)

    # ── 2. 철회된 날짜가 되살아났는가 ──────────────────────────────────
    print("── 2. 철회된 날짜(9/5 · 8/29) 잔존 ──")
    for rel in PAGES:
        text = body(read(rel))
        back = [d for d in WITHDRAWN if d in text]
        if back:
            failures.append("%s 에 철회된 날짜가 되살아났다: %s" % (rel, back))
            print("  ❌ %-34s %s" % (rel, back))
        else:
            print("  ✅ %-34s 없음" % rel)

    # ── 3. 세 언어의 자리표시자 개수가 같은가 ──────────────────────────
    # 🔴 한 언어만 날짜를 채우고 배포하면 세 판본이 서로 다른 말을 한다.
    print("── 3. 세 언어 짝 ──")
    for name, group in (("방침", POLICIES), ("공지", NOTICES)):
        counts = {}
        for rel in group:
            text = body(read(rel))
            counts[rel] = sum(text.count(p) for p in PLACEHOLDERS)
        print("  %s: %s" % (name, {os.path.dirname(k) or "privacy": v for k, v in counts.items()}))
        if len(set(counts.values())) != 1:
            failures.append("%s 세 판본의 자리표시자 개수가 다르다: %s" % (name, counts))
            print("  ❌ 개수가 다르다 — 한 언어만 채웠을 수 있다")

    # ── 4. 조문 구조가 세 판본에서 일치하는가 ─────────────────────────
    print("── 4. 조문 구조 ──")
    nums = {}
    for rel, pat in ARTICLE_PAT.items():
        text = read(rel)
        nums[rel] = [int(m) for m in re.findall(pat, text)]
    want = list(range(1, 19))
    for rel, got in nums.items():
        ok = got == want
        print("  %s %-34s 제1~%d조 (%d개)" % ("✅" if ok else "❌", rel, got[-1] if got else 0, len(got)))
        if not ok:
            failures.append("%s 의 조문 번호가 1~18 과 다르다: %s" % (rel, got))
    parts = {rel: read(rel).count("<h2>") for rel in POLICIES}
    if len(set(parts.values())) != 1:
        failures.append("편(h2) 수가 다르다: %s" % parts)
        print("  ❌ 편 수가 다르다: %s" % parts)
    else:
        print("  ✅ 편 %d개로 일치" % list(parts.values())[0])

    # ── 결과 ──────────────────────────────────────────────────────────
    print()
    for f in failures:
        print("실패 —", f)

    if blocked:
        print("🔴 배포 금지 — 시행일 자리표시자가 남아 있다.")
        print()
        print("   시행일 = Play 등록 → 도메인 이전 완료 + 7일. 아직 확정되지 않았다.")
        print("   D-U-N-S(2026-08-19 신청) 대기 중이므로 시행은 10월 이후다.")
        print()
        print("   날짜를 넣기 전에 이전이 실제로 끝났는지 다시 잰다:")
        print()
        print("     dig +short NS jinazen.com      # hostcocoa.com 이면 아직 아임웹이다")
        print()
        print("   날짜를 넣을 때 아래가 **한 벌로** 움직인다:")
        print("     · privacy/{,en/,ja/}index.html          문서 머리 · 제18조 ①")
        print("     · privacy/notice/{,en/,ja/}index.html   공지일 · 시행일 · 본문")
        print("     · docs/공지_시행일미정_개인정보처리방침_개정.md  파일명 포함")
        print("     · 각 파일 머리의 「배포 금지」 주석 블록을 지운다")
        return 1

    if failures:
        print("❌ 검사 실패 %d건" % len(failures))
        return 1

    print("🟢 자리표시자 없음 · 구조 일치 — 배포 가능")
    return 0


if __name__ == "__main__":
    sys.exit(main())
