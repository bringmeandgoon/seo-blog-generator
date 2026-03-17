import os
from dotenv import load_dotenv

load_dotenv()

WP_SITE_URL = os.environ["WP_SITE_URL"]
WP_API_BASE = f"{WP_SITE_URL}/wp-json/wp/v2"

GSC_CREDENTIALS_FILE = os.getenv("GSC_CREDENTIALS_FILE", "credentials/gsc-service-account.json")
GSC_CREDENTIALS_JSON_B64 = os.getenv("GSC_CREDENTIALS_JSON_B64")
GSC_SITE_URL = os.getenv("GSC_SITE_URL", WP_SITE_URL)

HTTPS_PROXY = os.getenv("HTTPS_PROXY", "")

FEISHU_APP_ID = os.environ["FEISHU_APP_ID"]
FEISHU_APP_SECRET = os.environ["FEISHU_APP_SECRET"]
FEISHU_BITABLE_APP_TOKEN = os.environ["FEISHU_BITABLE_APP_TOKEN"]
FEISHU_TABLE_ARTICLES = os.environ["FEISHU_TABLE_ARTICLES"]
FEISHU_TABLE_HISTORY = os.getenv("FEISHU_TABLE_HISTORY", "tblxQQRXjMJZADcg")

CATEGORY_EXCEL = os.getenv("CATEGORY_EXCEL", "")
