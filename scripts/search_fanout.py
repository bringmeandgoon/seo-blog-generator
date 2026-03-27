import json, os, re

topic = os.environ['FANOUT_TOPIC']
model = os.environ['FANOUT_MODEL']

# Build primary query: strip article-type suffixes for cleaner search
primary = topic
primary = re.sub(r'\b(api\s+provider[s]?|api\s+pricing|api\s+cost[s]?|api\s+comparison)\b', 'api', primary, flags=re.IGNORECASE)
primary = re.sub(r'\b(vram|requirements?|benchmark[s]?|comparison|review|guide|tutorial)\b', '', primary, flags=re.IGNORECASE)
primary = re.sub(r'\s+', ' ', primary).strip()

queries = [
    primary,
    f'site:reddit.com "{model}"',
]
print(json.dumps(queries))
