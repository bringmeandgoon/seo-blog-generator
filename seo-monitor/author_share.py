"""Multi-dimensional contribution analysis for Ashui (入职 2024-12)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import datetime, timedelta, UTC
from collections import defaultdict
from src.sync import _fetch_gsc_data
from src.feishu_client import FeishuClient
from src.config import FEISHU_TABLE_ARTICLES

def main():
    PUB_AFTER = "2024-12-01"

    # 1. Load all articles from Feishu
    fs = FeishuClient()
    records = fs.list_records(FEISHU_TABLE_ARTICLES)
    articles = {}  # slug -> {title, pub, author}
    for rec in records:
        f = rec["fields"]
        slug = f.get("slug", "")
        if not slug:
            continue
        articles[slug] = {
            "title": f.get("title", slug),
            "pub": f.get("publish_time", ""),
            "author": f.get("author", ""),
        }

    # 2. Fetch 1-year GSC data
    end_date = (datetime.now(UTC) - timedelta(days=2)).strftime("%Y-%m-%d")
    print(f"Fetching GSC data (365 days ending {end_date})...")
    # Cover full period since Ashui joined (2024-12-01)
    from datetime import date
    start = date(2024, 12, 1)
    end = datetime.now(UTC) - timedelta(days=2)
    total_days = (end.date() - start).days
    gsc = _fetch_gsc_data(end_date, days=total_days)
    print(f"GSC pages with data: {len(gsc)}\n")

    # 3. Classify
    site_clicks = sum(d["clicks"] for d in gsc.values())
    site_impressions = sum(d["impressions"] for d in gsc.values())

    # Recent articles (published after PUB_AFTER)
    recent_ashui = {}   # slug -> gsc data
    recent_others = {}
    ashui_articles_all = []  # all ashui articles with pub date
    for slug, info in articles.items():
        if info["pub"] < PUB_AFTER:
            continue
        g = gsc.get(slug, {"clicks": 0, "impressions": 0, "ctr": 0, "avg_position": 0})
        if info["author"] == "阿水":
            recent_ashui[slug] = g
            ashui_articles_all.append((slug, info, g))
        else:
            recent_others[slug] = g

    ashui_clicks = sum(d["clicks"] for d in recent_ashui.values())
    ashui_impressions = sum(d["impressions"] for d in recent_ashui.values())
    others_clicks = sum(d["clicks"] for d in recent_others.values())
    others_impressions = sum(d["impressions"] for d in recent_others.values())
    recent_clicks = ashui_clicks + others_clicks
    recent_impressions = ashui_impressions + others_impressions

    # ============================================================
    # DIMENSION 1: 全站大盘占比
    # ============================================================
    print("=" * 70)
    print("维度一：全站大盘占比（阿水入职后产出 vs 全站1年总流量）")
    print("=" * 70)
    print(f"  全站 clicks:     {site_clicks:>10,}")
    print(f"  全站 impressions:{site_impressions:>10,}")
    print(f"  阿水 clicks:     {ashui_clicks:>10,}  ({ashui_clicks/site_clicks*100:.1f}%)")
    print(f"  阿水 impressions:{ashui_impressions:>10,}  ({ashui_impressions/site_impressions*100:.1f}%)")

    # ============================================================
    # DIMENSION 2: 同期新文章占比
    # ============================================================
    print(f"\n{'=' * 70}")
    print(f"维度二：同期新文章占比（2024-12 后发布的文章）")
    print(f"{'=' * 70}")
    print(f"  同期新文章总数:  {len(recent_ashui) + len(recent_others)}")
    print(f"    阿水:          {len(recent_ashui)} 篇")
    print(f"    其他:          {len(recent_others)} 篇")
    print(f"  同期 clicks:     {recent_clicks:>10,}")
    print(f"    阿水:          {ashui_clicks:>10,}  ({ashui_clicks/recent_clicks*100:.1f}%)" if recent_clicks else "")
    print(f"    其他:          {others_clicks:>10,}  ({others_clicks/recent_clicks*100:.1f}%)" if recent_clicks else "")
    print(f"  同期 impressions:{recent_impressions:>10,}")
    print(f"    阿水:          {ashui_impressions:>10,}  ({ashui_impressions/recent_impressions*100:.1f}%)" if recent_impressions else "")
    print(f"    其他:          {others_impressions:>10,}  ({others_impressions/recent_impressions*100:.1f}%)" if recent_impressions else "")

    # ============================================================
    # DIMENSION 3: 篇均效率对比
    # ============================================================
    ashui_avg_clicks = ashui_clicks / len(recent_ashui) if recent_ashui else 0
    others_avg_clicks = others_clicks / len(recent_others) if recent_others else 0
    ashui_avg_impr = ashui_impressions / len(recent_ashui) if recent_ashui else 0
    others_avg_impr = others_impressions / len(recent_others) if recent_others else 0

    # CTR
    ashui_ctr = (ashui_clicks / ashui_impressions * 100) if ashui_impressions else 0
    others_ctr = (others_clicks / others_impressions * 100) if others_impressions else 0

    # Avg position (weighted by impressions)
    ashui_pos_sum = sum(d["avg_position"] * d["impressions"] for d in recent_ashui.values() if d["impressions"] > 0)
    ashui_pos = (ashui_pos_sum / ashui_impressions) if ashui_impressions else 0
    others_pos_sum = sum(d["avg_position"] * d["impressions"] for d in recent_others.values() if d["impressions"] > 0)
    others_pos = (others_pos_sum / others_impressions) if others_impressions else 0

    print(f"\n{'=' * 70}")
    print(f"维度三：篇均效率对比（同期新文章）")
    print(f"{'=' * 70}")
    print(f"  {'指标':<20} {'阿水':>12} {'其他作者':>12}")
    print(f"  {'-'*44}")
    print(f"  {'篇均 clicks':<20} {ashui_avg_clicks:>12.1f} {others_avg_clicks:>12.1f}")
    print(f"  {'篇均 impressions':<20} {ashui_avg_impr:>12.0f} {others_avg_impr:>12.0f}")
    print(f"  {'整体 CTR':<20} {ashui_ctr:>11.2f}% {others_ctr:>11.2f}%")
    print(f"  {'加权平均排名':<20} {ashui_pos:>12.1f} {others_pos:>12.1f}")

    # ============================================================
    # DIMENSION 4: 按月产出和流量
    # ============================================================
    print(f"\n{'=' * 70}")
    print(f"维度四：阿水按月产出和流量")
    print(f"{'=' * 70}")
    monthly = defaultdict(lambda: {"count": 0, "clicks": 0, "impressions": 0})
    for slug, info, g in ashui_articles_all:
        month = info["pub"][:7]  # "2025-01"
        monthly[month]["count"] += 1
        monthly[month]["clicks"] += g["clicks"]
        monthly[month]["impressions"] += g["impressions"]

    print(f"  {'月份':<10} {'篇数':>6} {'clicks':>10} {'impressions':>12} {'篇均clicks':>12}")
    print(f"  {'-'*52}")
    for month in sorted(monthly.keys()):
        d = monthly[month]
        avg = d["clicks"] / d["count"] if d["count"] else 0
        print(f"  {month:<10} {d['count']:>6} {d['clicks']:>10,} {d['impressions']:>12,} {avg:>12.1f}")
    print(f"  {'-'*52}")
    print(f"  {'合计':<10} {len(recent_ashui):>6} {ashui_clicks:>10,} {ashui_impressions:>12,} {ashui_avg_clicks:>12.1f}")

    # ============================================================
    # DIMENSION 5: 有效文章率（有GSC数据 = 被Google收录）
    # ============================================================
    ashui_indexed = sum(1 for d in recent_ashui.values() if d["impressions"] > 0)
    others_indexed = sum(1 for d in recent_others.values() if d["impressions"] > 0)
    ashui_with_clicks = sum(1 for d in recent_ashui.values() if d["clicks"] > 0)
    others_with_clicks = sum(1 for d in recent_others.values() if d["clicks"] > 0)

    print(f"\n{'=' * 70}")
    print(f"维度五：收录率和有效率")
    print(f"{'=' * 70}")
    print(f"  {'指标':<24} {'阿水':>16} {'其他作者':>16}")
    print(f"  {'-'*56}")
    print(f"  {'总篇数':<24} {len(recent_ashui):>16} {len(recent_others):>16}")
    ashui_idx_pct = (ashui_indexed / len(recent_ashui) * 100) if recent_ashui else 0
    others_idx_pct = (others_indexed / len(recent_others) * 100) if recent_others else 0
    print(f"  {'有曝光（已收录）':<24} {f'{ashui_indexed} ({ashui_idx_pct:.0f}%)':>16} {f'{others_indexed} ({others_idx_pct:.0f}%)':>16}")
    ashui_clk_pct = (ashui_with_clicks / len(recent_ashui) * 100) if recent_ashui else 0
    others_clk_pct = (others_with_clicks / len(recent_others) * 100) if recent_others else 0
    print(f"  {'有点击':<24} {f'{ashui_with_clicks} ({ashui_clk_pct:.0f}%)':>16} {f'{others_with_clicks} ({others_clk_pct:.0f}%)':>16}")

    # ============================================================
    # TOP 20
    # ============================================================
    print(f"\n{'=' * 70}")
    print(f"阿水 Top 20 文章 (by clicks)")
    print(f"{'=' * 70}")
    ranked = sorted(ashui_articles_all, key=lambda x: x[2]["clicks"], reverse=True)
    for i, (slug, info, g) in enumerate(ranked[:20], 1):
        print(f"  {i:>2}. {g['clicks']:>5} clicks | {g['impressions']:>7} impr | pos {g['avg_position']:>5.1f} | {info['pub']} | {info['title'][:45]}")

if __name__ == "__main__":
    main()
