#!/usr/bin/env python3
"""V1229.3 gate: on a cold page load, data/news.json (local + GitHub mirror) must be requested
exactly once each — not 2x or 3x. V1228 called the news pipeline from three places at boot
(its own self-init timer, plus the sports() screen calling both .load() and a .loadJordan() alias
that were literally the same function), tripling every request to data/news.json and the GitHub
mirror. This regression class is easy to reintroduce silently (e.g. adding a new caller of
ZIVOZONE_NEWS.load() at boot) and static analysis cannot catch it, so this gate drives a real
headless Chromium load and counts fetch() calls.

run:  python3 scripts/qa_no_duplicate_boot_fetch.py
"""
import http.server, socketserver, threading, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
fails = []

def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + (f"  [{detail}]" if detail and not ok else ""))
    if not ok:
        fails.append(name)

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("SKIPPED: playwright not installed")
    sys.exit(2)

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw): super().__init__(*a, directory=str(ROOT), **kw)
    def log_message(self, *a): pass

class ReusableServer(socketserver.TCPServer):
    allow_reuse_address = True

httpd = ReusableServer(("127.0.0.1", 0), Handler)
PORT = httpd.server_address[1]
threading.Thread(target=httpd.serve_forever, daemon=True).start()
time.sleep(0.3)

try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        # V1230.71 — stories/* and rooms/* pages both carry body.zivo-seo-route (the whole real
        # homepage rendered hidden behind CSS, purely so their one real SEO article + CTA can boot the
        # real app). app-shell.js's applyLanguage() now skips renderNewsSources()/sports() entirely on
        # any zivo-seo-route page — a visitor there never sees the news/sports sections (they stay
        # display:none the whole time), so the Firestore reads and two real network fetches those calls
        # used to trigger were pure waste. Expected count for those pages is now 0, not 2; index.html
        # (the real homepage, not a zivo-seo-route page) is unaffected and still expects exactly 2.
        for page_path, expected in [("index.html", 2), ("stories/tale-01/index.html", 0)]:
            ctx = b.new_context(viewport={"width": 1280, "height": 900}, service_workers="block", locale="ar")
            page = ctx.new_page()
            page.add_init_script(
                "window.__newsCalls=0;window.__matchCalls=0;const _f=window.fetch;"
                "window.fetch=function(...a){const u=String(a[0]);"
                "if(u.includes('news.json'))window.__newsCalls++;"
                "return _f.apply(this,a)}"
            )
            page.goto(f"http://127.0.0.1:{PORT}/{page_path}", wait_until="load")
            page.wait_for_timeout(2500)
            n = page.evaluate("window.__newsCalls")
            label = "not tripled" if expected > 0 else "skipped entirely on a hidden zivo-seo-route page"
            check(f"{page_path}: data/news.json fetched exactly {expected}x at boot ({label})", n == expected, f"got {n} fetch() calls")
            ctx.close()
        b.close()
finally:
    httpd.shutdown()

print("\n%d check(s) failed" % len(fails) if fails else "\nALL BOOT-FETCH CHECKS PASSED")
sys.exit(1 if fails else 0)
