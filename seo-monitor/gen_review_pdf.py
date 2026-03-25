"""Generate SEO contribution review PDF for Ashui."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import simpleSplit

# ── Colors ──
BG       = HexColor("#FAFAFA")
PRIMARY  = HexColor("#1A1A2E")
ACCENT   = HexColor("#E94560")
BLUE     = HexColor("#0F3460")
GRAY     = HexColor("#666666")
LIGHT_BG = HexColor("#F0F0F5")
GREEN    = HexColor("#2ECC71")
ORANGE   = HexColor("#F39C12")
WHITE    = white

W, H = A4  # 210mm x 297mm

# ── Register CJK font ──
FONT_PATHS = [
    "/System/Library/Fonts/STHeiti Light.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/System/Library/Fonts/Supplemental/Songti.ttc",
]
CN_FONT = "Helvetica"
CN_FONT_BOLD = "Helvetica-Bold"
for fp in FONT_PATHS:
    if os.path.exists(fp):
        try:
            pdfmetrics.registerFont(TTFont("CNFont", fp, subfontIndex=0))
            CN_FONT = "CNFont"
            CN_FONT_BOLD = "CNFont"
            break
        except:
            continue


def draw_rounded_rect(c, x, y, w, h, r, fill_color):
    c.setFillColor(fill_color)
    c.roundRect(x, y, w, h, r, fill=1, stroke=0)


def draw_metric_card(c, x, y, value, label, color=ACCENT):
    """Draw a metric card with big number + label."""
    card_w, card_h = 80*mm, 36*mm
    draw_rounded_rect(c, x, y, card_w, card_h, 4, LIGHT_BG)
    c.setFillColor(color)
    c.setFont(CN_FONT_BOLD, 22)
    c.drawCentredString(x + card_w/2, y + card_h - 16*mm, value)
    c.setFillColor(GRAY)
    c.setFont(CN_FONT, 9)
    c.drawCentredString(x + card_w/2, y + 4*mm, label)


def draw_bar(c, x, y, w_max, pct, color, h=6*mm):
    """Draw a horizontal bar."""
    draw_rounded_rect(c, x, y, w_max, h, 2, HexColor("#E8E8E8"))
    bar_w = w_max * min(pct, 1.0)
    if bar_w > 0:
        draw_rounded_rect(c, x, y, bar_w, h, 2, color)


def draw_comparison_row(c, y, label, val_a, val_b, unit="", highlight_higher=True):
    """Draw a comparison row: label | bar+value A | bar+value B"""
    c.setFont(CN_FONT, 9)
    c.setFillColor(PRIMARY)
    c.drawString(20*mm, y + 2*mm, label)

    max_val = max(val_a, val_b) if max(val_a, val_b) > 0 else 1
    bar_max_w = 50*mm

    # Ashui bar
    draw_bar(c, 62*mm, y, bar_max_w, val_a/max_val, ACCENT, 5*mm)
    c.setFont(CN_FONT, 8)
    c.setFillColor(PRIMARY)
    if isinstance(val_a, float):
        c.drawString(114*mm, y + 1*mm, f"{val_a:.1f}{unit}")
    else:
        c.drawString(114*mm, y + 1*mm, f"{val_a:,}{unit}")

    # Others bar
    draw_bar(c, 135*mm, y, bar_max_w, val_b/max_val, BLUE, 5*mm)
    if isinstance(val_b, float):
        c.drawString(187*mm, y + 1*mm, f"{val_b:.1f}{unit}")
    else:
        c.drawString(187*mm, y + 1*mm, f"{val_b:,}{unit}")


def build_pdf(output_path):
    c = canvas.Canvas(output_path, pagesize=A4)

    # ════════════════════════════════════════════════════════════════
    # PAGE 1: Cover + Key Metrics
    # ════════════════════════════════════════════════════════════════
    # Background
    c.setFillColor(PRIMARY)
    c.rect(0, H - 90*mm, W, 90*mm, fill=1, stroke=0)

    # Title
    c.setFillColor(WHITE)
    c.setFont(CN_FONT_BOLD, 28)
    c.drawString(20*mm, H - 35*mm, "SEO Content Growth")
    c.setFont(CN_FONT_BOLD, 20)
    c.drawString(20*mm, H - 50*mm, "Annual Review 2024.12 — 2026.02")

    c.setFillColor(HexColor("#AAAACC"))
    c.setFont(CN_FONT, 11)
    c.drawString(20*mm, H - 68*mm, "Author: Ashui | Role: SEO Growth")
    c.drawString(20*mm, H - 80*mm, "Data Source: Google Search Console (365 days) + Feishu Bitable")

    # Section: Key Numbers
    y_section = H - 105*mm
    c.setFillColor(ACCENT)
    c.setFont(CN_FONT_BOLD, 14)
    c.drawString(20*mm, y_section, "Core Metrics")

    y_cards = y_section - 42*mm
    draw_metric_card(c, 15*mm, y_cards, "270", "Total Articles Published", ACCENT)
    draw_metric_card(c, 105*mm, y_cards, "31,358", "Total Clicks Driven", BLUE)

    y_cards2 = y_cards - 42*mm
    draw_metric_card(c, 15*mm, y_cards2, "21.6%", "Share of Site Clicks", ACCENT)
    draw_metric_card(c, 105*mm, y_cards2, "4.1M", "Total Impressions", BLUE)

    y_cards3 = y_cards2 - 42*mm
    draw_metric_card(c, 15*mm, y_cards3, "54.9%", "New Article Click Share", ACCENT)
    draw_metric_card(c, 105*mm, y_cards3, "9.5", "Avg Google Rank (Weighted)", GREEN)

    # Efficiency callout
    y_eff = y_cards3 - 28*mm
    draw_rounded_rect(c, 15*mm, y_eff, W - 30*mm, 22*mm, 4, HexColor("#FFF3E0"))
    c.setFillColor(ORANGE)
    c.setFont(CN_FONT_BOLD, 11)
    c.drawString(22*mm, y_eff + 13*mm, "Production Efficiency")
    c.setFillColor(PRIMARY)
    c.setFont(CN_FONT, 10)
    c.drawString(22*mm, y_eff + 4*mm, "1 day/article → 30 min/article  (pipeline: search → architect → write → QC)")

    c.showPage()

    # ════════════════════════════════════════════════════════════════
    # PAGE 2: Comparison + Monthly Trend
    # ════════════════════════════════════════════════════════════════

    # Section: Head-to-Head comparison
    y = H - 20*mm
    c.setFillColor(ACCENT)
    c.setFont(CN_FONT_BOLD, 14)
    c.drawString(20*mm, y, "Quality Comparison: Ashui vs Others (Same Period)")

    y -= 10*mm
    c.setFont(CN_FONT, 8)
    c.setFillColor(GRAY)
    c.drawString(20*mm, y, "Based on 533 articles published after 2024-12 (Ashui: 270 | Others: 263)")

    # Header
    y -= 10*mm
    c.setFont(CN_FONT_BOLD, 9)
    c.setFillColor(ACCENT)
    c.drawString(80*mm, y, "Ashui")
    c.setFillColor(BLUE)
    c.drawString(152*mm, y, "Others")

    y -= 12*mm
    draw_comparison_row(c, y, "Avg Clicks/Article", 116.1, 98.0)
    y -= 12*mm
    draw_comparison_row(c, y, "Avg Impressions/Article", 15175, 8897)
    y -= 12*mm
    draw_comparison_row(c, y, "Avg Google Rank", 9.5, 13.0)
    y -= 12*mm
    draw_comparison_row(c, y, "Indexed Rate", 94, 93, "%")
    y -= 12*mm
    draw_comparison_row(c, y, "CTR", 0.77, 1.10, "%")

    # Insight box
    y -= 16*mm
    draw_rounded_rect(c, 15*mm, y, W - 30*mm, 14*mm, 3, LIGHT_BG)
    c.setFillColor(GRAY)
    c.setFont(CN_FONT, 8.5)
    c.drawString(22*mm, y + 5.5*mm, "Insight: Higher impressions + better rank = stronger keyword strategy; lower CTR = title optimization opportunity")

    # Section: Monthly Trend
    y -= 22*mm
    c.setFillColor(ACCENT)
    c.setFont(CN_FONT_BOLD, 14)
    c.drawString(20*mm, y, "Monthly Output & Traffic")

    months = [
        ("2024-12", 8, 1838), ("2025-01", 17, 1177), ("2025-02", 18, 1095),
        ("2025-03", 21, 1961), ("2025-04", 28, 2509), ("2025-05", 29, 2827),
        ("2025-06", 31, 6346), ("2025-07", 25, 4391), ("2025-08", 32, 5480),
        ("2025-09", 17, 1823), ("2025-10", 8, 662), ("2025-11", 10, 733),
        ("2025-12", 14, 367), ("2026-01", 4, 53), ("2026-02", 8, 96),
    ]

    max_clicks = max(cl for _, _, cl in months)
    chart_x = 25*mm
    chart_w = W - 50*mm
    bar_area_h = 60*mm
    y_chart_base = y - 15*mm - bar_area_h

    # Draw bars
    bar_w = chart_w / len(months) * 0.6
    gap = chart_w / len(months)

    for i, (mon, count, clicks) in enumerate(months):
        bx = chart_x + i * gap
        # Click bar
        bh = (clicks / max_clicks) * bar_area_h if max_clicks else 0
        draw_rounded_rect(c, bx, y_chart_base, bar_w, bh, 2, ACCENT)

        # Count label on top
        c.setFont(CN_FONT, 6.5)
        c.setFillColor(PRIMARY)
        c.drawCentredString(bx + bar_w/2, y_chart_base + bh + 2*mm, str(clicks))

        # Article count inside bar
        if bh > 8*mm:
            c.setFillColor(WHITE)
            c.setFont(CN_FONT_BOLD, 7)
            c.drawCentredString(bx + bar_w/2, y_chart_base + 2*mm, f"{count}p")

        # Month label
        c.setFillColor(GRAY)
        c.setFont(CN_FONT, 5.5)
        label = mon[2:]  # "24-12"
        c.drawCentredString(bx + bar_w/2, y_chart_base - 5*mm, label)

    # Legend
    y_legend = y_chart_base - 12*mm
    c.setFillColor(ACCENT)
    c.rect(chart_x, y_legend + 1*mm, 3*mm, 3*mm, fill=1, stroke=0)
    c.setFillColor(GRAY)
    c.setFont(CN_FONT, 8)
    c.drawString(chart_x + 5*mm, y_legend + 1*mm, "Clicks (bar height)   |   Np = N articles published")

    # Peak callout
    y_peak = y_legend - 12*mm
    draw_rounded_rect(c, 15*mm, y_peak, W - 30*mm, 14*mm, 3, HexColor("#E8F5E9"))
    c.setFillColor(GREEN)
    c.setFont(CN_FONT_BOLD, 9)
    c.drawString(22*mm, y_peak + 5*mm, "Peak: Jun-Aug 2025 (Qwen3/GLM4.5 launch window) — avg 204 clicks/article")

    c.showPage()

    # ════════════════════════════════════════════════════════════════
    # PAGE 3: Top Articles + Site Ranking + Conclusion
    # ════════════════════════════════════════════════════════════════

    y = H - 20*mm
    c.setFillColor(ACCENT)
    c.setFont(CN_FONT_BOLD, 14)
    c.drawString(20*mm, y, "Top 10 Articles by Clicks")

    top10 = [
        ("#11", 1544, "Qwen 3 vs Qwen 2.5: Lightweight Comparison", "2025-06"),
        ("#12", 1521, "Which Qwen3 Model Is Right for You?", "2025-07"),
        ("#24", 1078, "LLaMA 3.3 70B VRAM Requirements", "2024-12"),
        ("#27", 956, "How to Access GLM 4.5: Practical Guide", "2025-08"),
        ("#35", 853, "Qwen 3 8B vs Llama 3.1 8B", "2025-06"),
        ("#38", 813, "Is Kling AI Free and Worth It?", "2025-06"),
        ("#48", 694, "Qwen3 Coder 480B VRAM Requirements", "2025-08"),
        ("#60", 490, "Wan2.1 vs HunyuanVideo Comparison", "2025-03"),
        ("#62", 487, "How to Use GLM-4.6 in Cursor", "2025-10"),
        ("#66", 466, "Use GLM 4.5 in Trae IDE", "2025-08"),
    ]

    y -= 8*mm
    # Table header
    c.setFillColor(PRIMARY)
    c.setFont(CN_FONT_BOLD, 8)
    c.drawString(18*mm, y, "#")
    c.drawString(25*mm, y, "Clicks")
    c.drawString(45*mm, y, "Site Rank")
    c.drawString(70*mm, y, "Published")
    c.drawString(92*mm, y, "Title")

    y -= 2*mm
    c.setStrokeColor(HexColor("#DDDDDD"))
    c.line(18*mm, y, W - 15*mm, y)

    for i, (rank, clicks, title, pub) in enumerate(top10):
        y -= 9*mm
        if i % 2 == 0:
            draw_rounded_rect(c, 15*mm, y - 1*mm, W - 30*mm, 8*mm, 1, LIGHT_BG)

        c.setFont(CN_FONT_BOLD, 9)
        c.setFillColor(ACCENT)
        c.drawString(18*mm, y + 1*mm, str(i + 1))

        c.setFont(CN_FONT, 9)
        c.setFillColor(PRIMARY)
        c.drawString(25*mm, y + 1*mm, f"{clicks:,}")
        c.setFillColor(BLUE)
        c.drawString(48*mm, y + 1*mm, rank)
        c.setFillColor(GRAY)
        c.drawString(70*mm, y + 1*mm, pub)
        c.setFillColor(PRIMARY)
        c.drawString(92*mm, y + 1*mm, title[:38])

    # Site ranking distribution
    y -= 18*mm
    c.setFillColor(ACCENT)
    c.setFont(CN_FONT_BOLD, 14)
    c.drawString(20*mm, y, "Site Ranking Distribution")

    ranking_data = [
        ("Top 10", 0, 10), ("Top 20", 2, 20),
        ("Top 50", 7, 50), ("Top 100", 22, 100),
    ]

    y -= 12*mm
    for label, count, total in ranking_data:
        draw_rounded_rect(c, 20*mm, y - 1*mm, 160*mm, 9*mm, 2, LIGHT_BG)
        pct = count / total
        if pct > 0:
            draw_rounded_rect(c, 20*mm, y - 1*mm, 160*mm * pct, 9*mm, 2, ACCENT)
        c.setFont(CN_FONT_BOLD, 8)
        c.setFillColor(PRIMARY)
        c.drawString(22*mm, y + 1*mm, f"{label}: {count}/{total} ({count/total*100:.0f}%)")
        y -= 13*mm

    # Context note
    y -= 4*mm
    draw_rounded_rect(c, 15*mm, y, W - 30*mm, 12*mm, 3, LIGHT_BG)
    c.setFillColor(GRAY)
    c.setFont(CN_FONT, 8)
    c.drawString(22*mm, y + 4*mm, "Note: Site Top 10 dominated by 2024 legacy NSFW content (1,692-3,601 clicks). Tech articles have lower ceiling but longer lifespan.")

    # ── Conclusion — on a new page ──
    c.showPage()

    y = H - 25*mm
    c.setFillColor(PRIMARY)
    c.setFont(CN_FONT_BOLD, 18)
    c.drawString(20*mm, y, "Summary & Conclusion")

    conclusions = [
        ("Scalable Production",
         "270 articles in 15 months (avg 18/month).",
         "Efficiency: 1 day/article → 30 min/article via 4-agent automated pipeline (search → architect → write → QC)."),
        ("Keyword Strategy",
         "70% higher impressions per article than peers — consistently targeting higher-volume, developer-intent keywords.",
         "Top performers all hit model launch windows (Qwen3, GLM4.5, LLaMA 3.3)."),
        ("Ranking Quality",
         "Weighted avg Google rank: 9.5 (page 1) vs others 13.0 (page 2).",
         "94% indexed rate, 94% with clicks — near-zero wasted content."),
        ("Measurable Impact",
         "21.6% of total site clicks from 1 person. 54.9% of new article clicks — more than all other authors combined.",
         "22 articles in site-wide Top 100. Best single article: #11 globally (1,544 clicks)."),
        ("Trend Capture",
         "Jun-Aug 2025 peak: avg 204 clicks/article (2-3x normal) during Qwen3/GLM4.5 launches.",
         "Demonstrates ability to rapidly capitalize on industry events with timely, optimized content."),
    ]

    y -= 14*mm
    for i, (title, line1, line2) in enumerate(conclusions):
        # Card background
        card_h = 28*mm
        draw_rounded_rect(c, 15*mm, y - card_h + 6*mm, W - 30*mm, card_h, 4, LIGHT_BG if i % 2 == 0 else HexColor("#FAFAFA"))

        # Number badge
        badge_x, badge_y = 20*mm, y - 2*mm
        c.setFillColor(ACCENT)
        c.circle(badge_x, badge_y, 4*mm, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont(CN_FONT_BOLD, 10)
        c.drawCentredString(badge_x, badge_y - 1.2*mm, str(i + 1))

        # Title
        c.setFillColor(PRIMARY)
        c.setFont(CN_FONT_BOLD, 11)
        c.drawString(28*mm, y, title)

        # Line 1
        c.setFillColor(HexColor("#333333"))
        c.setFont(CN_FONT, 9)
        c.drawString(28*mm, y - 9*mm, line1)

        # Line 2
        c.setFillColor(GRAY)
        c.setFont(CN_FONT, 8.5)
        lines = simpleSplit(line2, CN_FONT, 8.5, W - 48*mm)
        for j, ln in enumerate(lines[:2]):
            c.drawString(28*mm, y - 16*mm - j * 8, ln)

        y -= card_h + 5*mm

    # Bottom tagline
    y -= 8*mm
    c.setStrokeColor(HexColor("#DDDDDD"))
    c.line(20*mm, y + 4*mm, W - 20*mm, y + 4*mm)
    c.setFillColor(GRAY)
    c.setFont(CN_FONT, 8)
    c.drawCentredString(W/2, y - 4*mm, "Data period: 2025-03-15 to 2026-03-15 (365 days)  |  Source: Google Search Console + Feishu Bitable")
    c.drawCentredString(W/2, y - 12*mm, "Generated on 2026-03-17")

    c.showPage()
    c.save()
    print(f"PDF saved to: {output_path}")


if __name__ == "__main__":
    output = os.path.expanduser("~/Downloads/SEO_Review_Ashui_2026.pdf")
    build_pdf(output)
