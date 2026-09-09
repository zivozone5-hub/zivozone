# ZIVOZONE V71 — NEWS FREE (No Firebase Billing)

This version removes the Firebase `getNewsNetwork` dependency from the news display.

How it works:
- GitHub Actions fetches RSS feeds every 6 hours.
- The workflow writes Arabic-only headlines to `data/news.json`.
- GitHub Pages serves the JSON as a normal static file.
- The website continuously scrolls the two news rails like a TV ticker.
- No Cloud Functions and no Firebase billing are required for the news system.

Activation:
1. Upload/replace the files in the GitHub repository.
2. In GitHub open Actions -> Update ZIVOZONE News.
3. Run workflow once with "Run workflow".
4. After it succeeds, GitHub Pages will serve `data/news.json`.
5. The site will read it automatically.

Important:
- This solution does NOT require a payment card or Blaze for the news feature.
- GitHub Actions is a scheduled automation; scheduled runs can be delayed by GitHub.
- Source attribution is kept in the generated JSON.
