#!/usr/bin/env python3
"""Real-browser smoke test (Playwright + Chromium). External hosts are blocked, so Firebase is offline: the site must still work.
usage: python3 scripts/browser_smoke.py [chromium_path]      exit 0 = pass"""
import functools, http.server, socketserver, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
import json, re
IGN = json.loads((ROOT / "firebase.json").read_text(encoding="utf-8"))["hosting"]["ignore"]
def _rx(g):
    g = re.escape(g).replace(r"\*\*/", "(?:.*/)?").replace(r"\*\*", ".*").replace(r"\*", "[^/]*")
    return re.compile("^(?:" + g + ")$")
_IGNORED = [_rx(g) for g in IGN] + [_rx(g + "/**") for g in IGN]
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def do_GET(self):                       # behave like Firebase Hosting: excluded files are 404
        rel = self.path.split("?")[0].lstrip("/")
        if rel and any(r.match(rel) for r in _IGNORED):
            self.send_error(404); return
        super().do_GET()
srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=str(ROOT)))
port = srv.server_address[1]; base = f"http://127.0.0.1:{port}"
threading.Thread(target=srv.serve_forever, daemon=True).start()

res = []
def check(name, ok, detail=""):
    res.append(ok); print(("PASS  " if ok else "FAIL  ") + name + (f" — {detail}" if detail and not ok else ""))

def run(browser, label, vp):
    ctx = browser.new_context(viewport=vp, service_workers="block")
    pg = ctx.new_page(); errors, notfound = [], []
    pg.route("**/*", lambda r: r.continue_() if r.request.url.startswith(base) else r.abort())
    pg.on("pageerror", lambda e: errors.append(str(e)[:160]))
    pg.on("response", lambda r: notfound.append(r.url.replace(base, "")) if r.status >= 400 else None)
    pg.goto(base + "/index.html", wait_until="load"); pg.wait_for_timeout(2200)
    check(f"[{label}] no uncaught JS errors", not errors, "; ".join(errors))
    local404 = [u for u in notfound if not u.startswith("/data/matches/")]
    check(f"[{label}] no 404 for site assets", not local404, ", ".join(local404))
    top = pg.evaluate("(()=>{const t=document.querySelector('#audio-toggle'),f=document.querySelector('#zivo-audio-control');return {top:t&&t.offsetParent!==null,fab:f&&!f.hidden&&f.getBoundingClientRect().width>0,label:(f||{}).textContent}})()")
    check(f"[{label}] exactly one sound button visible", bool(top["top"]) != bool(top["fab"]), str(top))
    check(f"[{label}] no horizontal overflow", pg.evaluate("document.documentElement.scrollWidth<=innerWidth"))
    if label == "desktop":
        pg.evaluate("document.querySelector('#audio-toggle').click()"); pg.wait_for_timeout(300)
        check("audio toggle really mutes", pg.evaluate("window.ZIVOZONE_AUDIO.isMuted()") is True)
        pg.evaluate("document.querySelector('#audio-toggle').click()"); pg.wait_for_timeout(300)
        check("audio API facade complete", pg.evaluate("['successCoin','purchaseBurn','menuOpen','menuClose','challengeWin','challengeFail','notification','stopChallenge','playSFX'].every(k=>typeof ZIVOZONE_AUDIO[k]==='function')"))
        # health room
        pg.evaluate("ZIVOZONE.RealRooms.enter('health')"); pg.wait_for_timeout(300)
        check("entry is an accessible dialog", pg.locator("#zivo-real-room[role=dialog][aria-modal=true]").count() == 1)
        pg.evaluate("ZIVOZONE.RealRooms.openHealth()"); pg.wait_for_timeout(500)
        check("12 health doors listed", pg.locator("#zivo-real-room .zr-card").count() == 12)
        pg.evaluate("ZIVOZONE.RealRooms.healthDoor('11')"); pg.wait_for_timeout(500)
        txt = pg.locator("#zivo-real-room .zr-health-text").inner_text()
        check("markdown rendered (no raw ### or **)", "###" not in txt and "**" not in txt)
        check("table rendered as <table>", pg.locator("#zivo-real-room table tr").count() == 8)
        pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
        check("Esc closes the room", pg.locator("#zivo-real-room.show").count() == 0)
        # stories room
        pg.evaluate("ZIVOZONE.RealRooms.openStories()"); pg.wait_for_timeout(600)
        import json; n = len(json.load(open(ROOT / "data/stories/index.json", encoding="utf-8")))
        check(f"{n} stories listed", pg.locator("#zivo-real-room .zr-card").count() == n)
        pg.fill("#zr-search", "الكأس"); pg.wait_for_timeout(200)
        check("story search filters", pg.locator("#zivo-real-room .zr-card").count() == 1)
        pg.evaluate("ZIVOZONE.RealRooms.openStory('tale-06')"); pg.wait_for_timeout(600)
        body = pg.locator("#zivo-real-room .zr-story-body").inner_text()
        check("story header lines not repeated in body", "الأبواب الثلاثة" not in body[:40] and not body.lstrip().startswith(("التصنيف", "النوع", "#", "06.")))
        pg.go_back(); pg.wait_for_timeout(300)
        check("browser Back closes the room", pg.locator("#zivo-real-room.show").count() == 0)
    ctx.close()

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=sys.argv[1] if len(sys.argv) > 1 else None, args=["--no-sandbox"])
    run(b, "mobile", {"width": 390, "height": 844}); run(b, "desktop", {"width": 1366, "height": 800}); b.close()
print(f"\n{sum(res)}/{len(res)} passed"); sys.exit(0 if all(res) else 1)
