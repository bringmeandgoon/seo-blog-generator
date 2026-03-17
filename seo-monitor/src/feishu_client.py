"""Feishu Bitable API client — thin wrapper over REST API."""

import time
import requests
from src.config import FEISHU_APP_ID, FEISHU_APP_SECRET, FEISHU_BITABLE_APP_TOKEN

BASE = "https://open.feishu.cn/open-apis"


class FeishuClient:
    def __init__(self):
        self._token = None
        self._token_expires = 0

    @property
    def token(self):
        if time.time() >= self._token_expires:
            self._refresh_token()
        return self._token

    def _refresh_token(self):
        r = requests.post(f"{BASE}/auth/v3/tenant_access_token/internal", json={
            "app_id": FEISHU_APP_ID,
            "app_secret": FEISHU_APP_SECRET,
        })
        r.raise_for_status()
        data = r.json()
        self._token = data["tenant_access_token"]
        self._token_expires = time.time() + data["expire"] - 60

    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    # ---- Bitable CRUD ----

    def list_records(self, table_id, filter_expr=None, page_size=500):
        """List all records from a Bitable table, handling pagination."""
        records = []
        page_token = None
        while True:
            params = {"page_size": page_size}
            if page_token:
                params["page_token"] = page_token
            if filter_expr:
                params["filter"] = filter_expr
            r = requests.get(
                f"{BASE}/bitable/v1/apps/{FEISHU_BITABLE_APP_TOKEN}/tables/{table_id}/records",
                headers=self._headers(), params=params,
            )
            r.raise_for_status()
            data = r.json()["data"]
            records.extend(data.get("items") or [])
            if not data.get("has_more"):
                break
            page_token = data["page_token"]
        return records

    def batch_create(self, table_id, records):
        """Create records in batches of 500."""
        for i in range(0, len(records), 500):
            batch = records[i:i+500]
            r = requests.post(
                f"{BASE}/bitable/v1/apps/{FEISHU_BITABLE_APP_TOKEN}/tables/{table_id}/records/batch_create",
                headers=self._headers(),
                json={"records": [{"fields": rec} for rec in batch]},
            )
            r.raise_for_status()

    def batch_update(self, table_id, updates):
        """Update records in batches of 500. updates = [(record_id, fields_dict)]"""
        for i in range(0, len(updates), 500):
            batch = updates[i:i+500]
            r = requests.post(
                f"{BASE}/bitable/v1/apps/{FEISHU_BITABLE_APP_TOKEN}/tables/{table_id}/records/batch_update",
                headers=self._headers(),
                json={"records": [{"record_id": rid, "fields": fields} for rid, fields in batch]},
            )
            r.raise_for_status()
