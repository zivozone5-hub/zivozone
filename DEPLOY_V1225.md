# ZIVOZONE V1225 — Production Deploy

## Correct Firebase directory
Run Firebase from this exact directory — the directory containing `index.html` and `firebase.json`.

```bat
cd ZIVOZONE_V1225
firebase use zivozone-fc6ed
firebase deploy --only hosting
```

Do NOT run `firebase deploy` from the parent directory.

## Included
- Clean SPA routes
- Firebase rewrites for `/stories`, `/health`, `/challenges`
- Static story prerender pages
- Dynamic SEO + JSON-LD
- Web Share + Clipboard fallback
- True lazy ambient audio with unload on exit
- Service Worker cache version `v1225`
- Custom `404.html`
