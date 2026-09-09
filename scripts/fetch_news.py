import json
import re
import time
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

UA = "ZIVOZONE-News/1.0"

SOURCES = {
    "sports": [
        ("BBC Sport", "https://feeds.bbci.co.uk/sport/rss.xml"),
        ("Sky News Arabia", "https://www.skynewsarabia.com/rss.xml"),
        ("الجزيرة", "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9"),
        ("الأردن", "https://news.google.com/rss/search?q=%D9%83%D8%B1%D8%A9%20%D8%A7%D9%84%D9%82%D8%AF%D9%85%20%D8%A7%D9%84%D8%A3%D8%B1%D8%AF%D9%86%D9%8A%D8%A9&hl=ar&gl=JO&ceid=JO:ar"),
    ],
    "general": [
        ("BBC عربي", "https://feeds.bbci.co.uk/arabic/rss.xml"),
        ("Sky News Arabia", "https://www.skynewsarabia.com/rss.xml"),
        ("الشرق الأوسط", "https://aawsat.com/feed/news"),
        ("أخبار الأردن", "https://news.google.com/rss/search?q=%D8%A7%D9%84%D8%A3%D8%B1%D8%AF%D9%86%20%D8%A3%D8%AE%D8%A8%D8%A7%D8%B1&hl=ar&gl=JO&ceid=JO:ar"),
    ],
}

ARABIC = re.compile(r"[\u0600-\u06FF]")


def clean(value):
    return re.sub(r"\s+", " ", value or "").strip()


def fetch(url):
    request = urllib.request.Request(
        url,
        headers={"User-Agent": UA}
    )

    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read()


def parse_feed(source_name, url):
    try:
        root = ET.fromstring(fetch(url))
        results = []

        for item in root.findall(".//item")[:15]:
            title = clean(item.findtext("title"))
            link = clean(item.findtext("link"))
            published = clean(item.findtext("pubDate"))

            if title:
                results.append({
                    "headline": title,
                    "source": source_name,
                    "url": link,
                    "published": published
                })

        return results

    except Exception as error:
        print("Feed failed:", source_name, error)
        return []


def unique(items):
    seen = set()
    result = []

    for item in items:
        key = re.sub(
            r"[^\w\u0600-\u06FF]",
            "",
            item["headline"]
        ).lower()

        if key and key not in seen:
            seen.add(key)
            result.append(item)

    return result


def main():

    output = {
        "updatedAt": int(time.time() * 1000),
        "sports": [],
        "general": []
    }

    for category in ["sports", "general"]:

        all_items = []

        for source_name, url in SOURCES[category]:
            all_items.extend(
                parse_feed(source_name, url)
            )

        # عرض الأخبار العربية فقط
        arabic_items = [
            item
            for item in all_items
            if ARABIC.search(item["headline"])
        ]

        output[category] = unique(arabic_items)[:30]

    Path("data").mkdir(exist_ok=True)

    Path("data/news.json").write_text(
        json.dumps(
            output,
            ensure_ascii=False,
            indent=2
        ),
        encoding="utf-8"
    )


if __name__ == "__main__":
    main()
