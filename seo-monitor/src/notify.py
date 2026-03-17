"""Weekly Feishu notification: articles with clicks > 10 in last 7 days."""

import json
import requests
from datetime import datetime, timedelta, UTC
from collections import defaultdict

from src.config import FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_TABLE_ARTICLES
from src.feishu_client import FeishuClient
from src.sync import _fetch_gsc_data

BASE = "https://open.feishu.cn/open-apis"
OPEN_ID = "ou_58b2244a6e2977878d4e7e0d20cf68bd"  # 阿水


def _send_message(text):
    r = requests.post(f"{BASE}/auth/v3/tenant_access_token/internal", json={
        "app_id": FEISHU_APP_ID, "app_secret": FEISHU_APP_SECRET,
    })
    token = r.json()["tenant_access_token"]
    r = requests.post(
        f"{BASE}/im/v1/messages?receive_id_type=open_id",
        headers={"Authorization": f"Bearer {token}"},
        json={"receive_id": OPEN_ID, "msg_type": "interactive", "content": text},
    )
    return r.json()


def weekly_report():
    """Query GSC last 7 days, find articles with clicks>10 published in 3 months, push to Feishu."""
    # 1. Get article info from Feishu (for title, publish_time, category, author)
    fs = FeishuClient()
    records = fs.list_records(FEISHU_TABLE_ARTICLES)
    slug_info = {}
    for rec in records:
        f = rec["fields"]
        slug = f.get("slug", "")
        if slug:
            slug_info[slug] = {
                "title": f.get("title", ""),
                "url": f.get("url", ""),
                "publish_time": f.get("publish_time", ""),
                "category": f.get("category", ""),
                "author": f.get("author", ""),
            }

    # 2. Query GSC for last 7 days
    end_date = (datetime.now(UTC) - timedelta(days=2)).strftime("%Y-%m-%d")
    print(f"[notify] Fetching GSC 7-day data (ending {end_date})...")
    gsc_7d = _fetch_gsc_data(end_date, days=7)
    print(f"[notify] {len(gsc_7d)} pages with data")

    # 3. Filter: published in 3 months + clicks > 10
    three_months_ago = (datetime.now(UTC) - timedelta(days=90)).strftime("%Y-%m-%d")
    hits = []
    for slug, data in gsc_7d.items():
        if data["clicks"] <= 10:
            continue
        info = slug_info.get(slug, {})
        pub = info.get("publish_time", "")
        if pub and pub < three_months_ago:
            continue
        hits.append({
            "title": info.get("title", slug),
            "url": info.get("url", ""),
            "category": info.get("category", ""),
            "author": info.get("author", ""),
            "publish_time": pub,
            "clicks": data["clicks"],
            "impressions": data["impressions"],
            "ctr": data["ctr"],
            "position": data["avg_position"],
        })

    hits.sort(key=lambda x: -x["clicks"])

    if not hits:
        print("[notify] No articles with clicks > 10 in last 7 days")
        return

    # 4. Category summary
    cat_clicks = defaultdict(int)
    cat_count = defaultdict(int)
    for h in hits:
        cat = h["category"] or "未分类"
        cat_clicks[cat] += h["clicks"]
        cat_count[cat] += 1
    cat_summary = sorted(cat_clicks.items(), key=lambda x: -x[1])

    # 5. Build card
    start_date = (datetime.now(UTC) - timedelta(days=9)).strftime("%m/%d")
    end_short = (datetime.now(UTC) - timedelta(days=2)).strftime("%m/%d")

    lines = []
    for i, h in enumerate(hits, 1):
        author_tag = " ✍️" if h["author"] == "阿水" else ""
        lines.append(
            f"**{i}. [{h['title'][:50]}]({h['url']})**{author_tag}\n"
            f"   🖱 {h['clicks']} clicks | 👁 {h['impressions']} impr | "
            f"CTR {h['ctr']}% | Pos {h['position']} | "
            f"{h['category'] or '-'} | {h['publish_time']}"
        )

    total_clicks = sum(h["clicks"] for h in hits)
    total_impr = sum(h["impressions"] for h in hits)
    ashuia_hits = [h for h in hits if h["author"] == "阿水"]
    ashuia_clicks = sum(h["clicks"] for h in ashuia_hits)

    # Category breakdown line
    cat_lines = " | ".join(f"{cat} {clicks}clicks({cat_count[cat]}篇)" for cat, clicks in cat_summary[:5])

    card = json.dumps({
        "config": {"wide_screen_mode": True},
        "header": {
            "title": {"tag": "plain_text", "content": f"SEO Weekly ({start_date}-{end_short})"},
            "template": "blue",
        },
        "elements": [
            {
                "tag": "div",
                "text": {
                    "tag": "lark_md",
                    "content": f"过去7天 clicks > 10 且发布3个月内（共 **{len(hits)}** 篇，✍️ 阿水 {len(ashuia_hits)} 篇 {ashuia_clicks} clicks）",
                },
            },
            {"tag": "hr"},
            *[{"tag": "div", "text": {"tag": "lark_md", "content": line}} for line in lines],
            {"tag": "hr"},
            {
                "tag": "div",
                "text": {
                    "tag": "lark_md",
                    "content": f"**分类** {cat_lines}",
                },
            },
            {
                "tag": "div",
                "text": {
                    "tag": "lark_md",
                    "content": f"**合计** {len(hits)} 篇 | {total_clicks} clicks | {total_impr} impressions",
                },
            },
        ],
    })

    result = _send_message(card)
    print(f"[notify] Sent: {len(hits)} articles, {total_clicks} total clicks, result: {result.get('msg')}")
