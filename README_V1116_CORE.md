# ZIVOZONE V1116 CORE

This build consolidates the current sports/news and ZIVO economy UX into the existing architecture.

### Deploy
From the directory containing `index.html`:

```bash
firebase deploy --only hosting
```

Then hard refresh once (`Ctrl + Shift + R`).

### News updates
The repository workflow `.github/workflows/news.yml` runs hourly and writes `data/news.json` from free RSS/Google News feeds. The deployed Firebase site does not need a paid API or Cloud Function.

### Local validation
```bash
python scripts/validate_v1116.py
```
