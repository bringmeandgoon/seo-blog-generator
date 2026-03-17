"""SEO Monitor — cron entry point.

Usage:
    python main.py weekly       # Weekly: WP sync + GSC update + snapshot + report
    python main.py notify       # Send weekly Feishu report only
    python main.py wp           # Only sync new WordPress articles
    python main.py gsc          # Only update GSC data
    python main.py gsc 2026-02-19  # GSC for specific end date
    python main.py snapshot     # Only save weekly snapshot
    python main.py status       # Only re-run auto-tagging
    python main.py init         # First-time full import
"""

import sys


def main():
    step = sys.argv[1] if len(sys.argv) > 1 else "weekly"
    date_arg = sys.argv[2] if len(sys.argv) > 2 else None

    if step == "init":
        from src.sync import full_init
        full_init()
        return

    if step == "weekly":
        from src.sync import sync_new_wp_articles, update_gsc_data, save_weekly_snapshot, sync_author
        from src.notify import weekly_report
        print("=== Weekly: WP sync + author + GSC + snapshot + report ===")
        sync_new_wp_articles()
        sync_author()
        update_gsc_data(date_arg)
        save_weekly_snapshot(date_arg)
        weekly_report()
        print("=== Weekly done ===")
        return

    if step == "notify":
        from src.notify import weekly_report
        weekly_report()

    elif step == "wp":
        from src.sync import sync_new_wp_articles
        sync_new_wp_articles()

    elif step == "gsc":
        from src.sync import update_gsc_data
        update_gsc_data(date_arg)

    elif step == "snapshot":
        from src.sync import save_weekly_snapshot
        save_weekly_snapshot(date_arg)

    elif step == "status":
        from src.sync import update_status
        update_status()

    print("=== Done ===")


if __name__ == "__main__":
    main()
