# -*- coding: utf-8 -*-
import os, gzip, json, re, zipfile
from pathlib import Path

base = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\temp\2026-06-16-110140\2026-06-16-110140")
out = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\byead\analysis\_capture_ad_fields.txt")

MARKERS = [
    "ADExtension", "vasAdPost", "adExtension", "isAd", "showAD", "showAd",
    "adTag", "bizId", "nativeAd", "adSlot", "recCardType", "commercialPost",
    "postCommercial", "type\":\"AD", "type\":\"MW", "recallSRC\":999",
    "SoulUnified", "bidResult", "nativeExpress",
]

lines = []
for d in sorted(os.listdir(base), key=lambda x: int(x) if x.isdigit() else 0):
    rb = base / d / "response_body"
    basic = base / d / "basic"
    if not rb.exists():
        continue
    with open(rb, "rb") as f:
        raw = f.read()
    try:
        text = gzip.decompress(raw).decode("utf-8", "ignore")
    except Exception:
        text = raw.decode("utf-8", "ignore")
    url = basic.read_text(encoding="utf-8", errors="ignore").strip() if basic.exists() else d
    hits = [m for m in MARKERS if m in text]
    if hits:
        lines.append(f"[{d}] {url[:100]}")
        lines.append(f"  markers: {hits}")
        for h in hits[:3]:
            for m in re.finditer(re.escape(h) + r".{0,80}", text):
                lines.append(f"  ctx: ...{m.group()[:120]}...")
                break
        lines.append("")

out.write_text("\n".join(lines), encoding="utf-8")
print(len(lines), "lines", out)
