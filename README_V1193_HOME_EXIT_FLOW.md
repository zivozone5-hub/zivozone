# ZIVOZONE V1193 — Home Return / Full Exit Flow

- Inside all Challenge Worlds and Dark Room: button is `العودة إلى الموقع` and returns directly to `#home` without showing the full-exit confirmation.
- Forensic Lab: all internal navigation buttons now use `العودة إلى الموقع` and return directly to `#home`.
- Main site header and mobile navigation now contain the single `الخروج من الموقع` action.
- The full-site exit action alone opens the cinematic confirmation:
  `هل أنت متأكد من مغادرة عالمك الجميل إلى عالمك الواقعي المؤلم؟`
- One centralized ExitGuard remains responsible for the full-site exit confirmation.
- No internal challenge/forensic return button invokes the full-site exit confirmation.
