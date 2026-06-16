# -*- coding: utf-8 -*-
import re, zipfile
from pathlib import Path

ipa = list(Path(r"c:\Users\OS01\Desktop\2026 全年比赛\temp").glob("Soul_6.23.0*.ipa"))[0]
out = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\temp\_ios_strings_clean.txt")

needles = [
    "recallSRC", "algExt", "recCardType", "showPromote", "commercialPostType",
    "PostSquare_City", "PostSquare_Recommend", "MW", '"MW"', "foodtaster",
    "社交达人", "强社交", "信息流", "广告", "疑似广告", "推广",
    "NativeAd", "SoulUnifiedNativeAd", "sculptor", "isAd", "adExtension",
    "RecommendPost", "PostSquareChatRoom", "bizad", "meituan",
]

with zipfile.ZipFile(ipa) as z:
    data = z.read("Payload/Soul_New.app/Soul_New")

hits = {n: [] for n in needles}
# scan ascii runs
for m in re.finditer(rb"[\x20-\x7e]{4,150}", data):
    s = m.group().decode("ascii", "ignore")
    for n in needles:
        if n in s and s not in hits[n] and len(hits[n]) < 30:
            hits[n].append(s)
for m in re.finditer(rb"(?:[\xe4-\xe9][\x80-\xbf]{2}){2,40}", data):
    try:
        s = m.group().decode("utf-8")
    except Exception:
        continue
    for n in needles:
        if n in s and s not in hits[n] and len(hits[n]) < 30:
            hits[n].append(s)

lines = [f"Soul_New {len(data)//1024//1024}MB"]
for n in needles:
    if hits[n]:
        lines.append(f"\n=== {n} ({len(hits[n])}) ===")
        for s in hits[n]:
            lines.append(f"  {s}")

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out, len(lines))
