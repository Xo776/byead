import os, gzip, json, re
base = r"c:\Users\OS01\Desktop\2026 全年比赛\temp\2026-06-16-110140\2026-06-16-110140"
results = []
for d in sorted(os.listdir(base), key=lambda x: int(x) if x.isdigit() else 0):
    dp = os.path.join(base, d)
    rb = os.path.join(dp, "response_body")
    basic = os.path.join(dp, "basic")
    if not os.path.exists(rb):
        continue
    with open(rb, "rb") as f:
        raw = f.read()
    try:
        text = gzip.decompress(raw).decode("utf-8", "ignore")
    except Exception:
        text = raw.decode("utf-8", "ignore")
    if "postList" not in text:
        continue
    url = ""
    if os.path.exists(basic):
        with open(basic, "r", encoding="utf-8", errors="ignore") as f:
            url = f.read().strip()
    try:
        obj = json.loads(text.lstrip("\x00"))
    except Exception:
        try:
            t = re.sub(r"^[0-9a-fA-F]+\r?\n", "", text, flags=re.M)
            obj = json.loads(t)
        except Exception:
            continue
    posts = obj.get("data", {}).get("postList", [])
    for i, p in enumerate(posts):
        markers = []
        if p.get("type") == "MW":
            markers.append("type=MW")
        if p.get("type") == "AD":
            markers.append("type=AD")
        rs = p.get("recallSRC")
        if rs in (999, "999", 76, "76"):
            markers.append("recallSRC=" + str(rs))
        if p.get("ad") or p.get("isAd") or p.get("showPromote"):
            markers.append("ad_flag")
        s = json.dumps(p, ensure_ascii=False)
        if "utm_" in s:
            markers.append("utm")
        if "meituan" in s.lower() or "offsiteact" in s:
            markers.append("meituan")
        if '"MW"' in s or 'type":"MW' in s:
            markers.append("MW_in_json")
        if markers:
            results.append(
                (d, url[:120], i, p.get("type"), p.get("recallSRC"), ",".join(markers), (p.get("content") or "")[:50])
            )

out = os.path.join(os.path.dirname(base), "..", "_ad_analysis.txt")
with open(out, "w", encoding="utf-8") as f:
    f.write(f"AD posts in feed responses: {len(results)}\n\n")
    for r in results:
        f.write(str(r) + "\n")
print("written", out, "count", len(results))
