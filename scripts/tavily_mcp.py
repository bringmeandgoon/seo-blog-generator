#!/usr/bin/env python3
"""Tavily MCP server for dev-blog-platform.

Provides tavily_search and tavily_extract tools via PPIO proxy endpoint.
Used by `claude -p` during article generation for on-demand deep reading.
"""
import json
import os
import sys
import urllib.request
import urllib.error

TAVILY_BASE = "https://api.ppinfra.com/v3/tavily"
API_KEY = os.environ.get("PPIO_API_KEY") or os.environ.get("TAVILY_API_KEY", "")


def _call_tavily(endpoint: str, payload: dict) -> dict:
    url = f"{TAVILY_BASE}/{endpoint}"
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode() if e.fp else ""
        return {"error": f"HTTP {e.code}: {body[:500]}"}
    except Exception as e:
        return {"error": str(e)}


def handle_search(arguments: dict) -> str:
    query = arguments.get("query", "")
    max_results = arguments.get("max_results", 5)
    search_depth = arguments.get("search_depth", "advanced")
    result = _call_tavily("search", {
        "query": query,
        "max_results": max_results,
        "search_depth": search_depth,
        "include_answer": True,
    })
    return json.dumps(result, ensure_ascii=False, indent=2)


def handle_extract(arguments: dict) -> str:
    urls = arguments.get("urls", [])
    if isinstance(urls, str):
        urls = [urls]
    result = _call_tavily("extract", {"urls": urls})
    return json.dumps(result, ensure_ascii=False, indent=2)


# --- MCP Protocol (stdio JSON-RPC) ---

TOOLS = [
    {
        "name": "tavily_search",
        "description": "Search the web using Tavily. Returns relevant results with titles, URLs, and content snippets.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "max_results": {"type": "integer", "description": "Max results (default 5)", "default": 5},
                "search_depth": {"type": "string", "enum": ["basic", "advanced"], "default": "advanced"},
            },
            "required": ["query"],
        },
    },
    {
        "name": "tavily_extract",
        "description": "Extract full page content from one or more URLs using Tavily. Returns cleaned markdown text.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "urls": {
                    "oneOf": [
                        {"type": "string", "description": "Single URL to extract"},
                        {"type": "array", "items": {"type": "string"}, "description": "List of URLs to extract"},
                    ]
                },
            },
            "required": ["urls"],
        },
    },
]


def send(msg: dict):
    out = json.dumps(msg)
    sys.stdout.write(f"Content-Length: {len(out.encode())}\r\n\r\n{out}")
    sys.stdout.flush()


def read_message() -> dict | None:
    # Read headers
    headers = {}
    while True:
        line = sys.stdin.readline()
        if not line:
            return None
        line = line.strip()
        if line == "":
            break
        if ":" in line:
            key, val = line.split(":", 1)
            headers[key.strip()] = val.strip()
    content_length = int(headers.get("Content-Length", "0"))
    if content_length == 0:
        return None
    body = sys.stdin.read(content_length)
    return json.loads(body)


def main():
    while True:
        msg = read_message()
        if msg is None:
            break

        req_id = msg.get("id")
        method = msg.get("method", "")

        if method == "initialize":
            send({
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "tavily-mcp", "version": "1.0.0"},
                },
            })
        elif method == "notifications/initialized":
            pass  # no response needed
        elif method == "tools/list":
            send({
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {"tools": TOOLS},
            })
        elif method == "tools/call":
            params = msg.get("params", {})
            tool_name = params.get("name", "")
            arguments = params.get("arguments", {})

            if tool_name == "tavily_search":
                text = handle_search(arguments)
            elif tool_name == "tavily_extract":
                text = handle_extract(arguments)
            else:
                text = json.dumps({"error": f"Unknown tool: {tool_name}"})

            send({
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "content": [{"type": "text", "text": text}],
                },
            })
        else:
            # Unknown method
            if req_id is not None:
                send({
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32601, "message": f"Method not found: {method}"},
                })


if __name__ == "__main__":
    main()
