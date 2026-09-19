# ZIVOZONE V1192 — EXIT FIXED

- Removed the legacy exit CSS collision that caused the exit confirmation button to cover the entire screen.
- One custom ExitGuard only.
- Removed native `beforeunload` prompt from immersive challenge flow.
- Challenge exit controls are now labeled `العودة إلى الموقع`.
- Clicking `العودة إلى الموقع` opens the single cinematic confirmation:
  `هل أنت متأكد من مغادرة عالمك الجميل إلى عالمك الواقعي المؤلم؟`
- Confirm returns to `#home`; stay keeps the user inside the world.
- Fixed finish-screen return handler to use the unified guard.
- Removed remaining challenge CSS references to the legacy `.zrw-exit` class.
