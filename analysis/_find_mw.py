import os, gzip
base = r"c:\Users\OS01\Desktop\2026 全年比赛\temp\2026-06-16-110140\2026-06-16-110140"
found = []
for d in sorted(os.listdir(base), key=lambda x: int(x) if x.isdigit() else 0):
    dp = os.path.join(base, d)
    if not os.path.isdir(dp): continue
    rb = os.path.join(dp, "response_body")
    if not os.path.exists(rb): continue
    rh = os.path.join(dp, "request_headers")
    first_line = ""
    if os.path.exists(rh):
        with open(rh, "r", encoding="utf-8", errors="ignore") as f:
            first_line = f.readline().strip()
    with open(rb, "rb") as f:
        raw = f.read()
    text = ""
    try:
        text = gzip.decompress(raw).decode("utf-8", "ignore")
    except:
        try:
            text = raw.decode("utf-8", "ignore")
        except:
            pass
    if "MW" in text or '"mw"' in text.lower():
        # Find context around MW
        idx = text.find("MW")
        ctx = text[max(0,idx-50):idx+50]
        found.append(f"[{d}] {first_line[:100]}")
        found.append(f"     MW context: ...{ctx}...")
        found.append("")
print(f"Found MW in {len(found)//3} files:")
for line in found:
    print(line)
