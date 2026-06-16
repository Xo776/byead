# -*- coding: utf-8 -*-
import re, zipfile
from pathlib import Path

apk = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\temp\soul_channel_soul.apk")
out = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\temp\_dex_key_findings.txt")

KEYS = [
    "VasAdPostModel", "vasAdPostModel", "SquareAdPost", "CSqItemSquareAdPost",
    "SquareAdapter", "typeMap", "factoryArray", "recallSRC", "commercialPostType",
    "postCommercialVO", "showPromote", "recCardType", "algExt", "recParam",
    "SoulUnifiedNativeAdLoader", "UnifiedNativeAd", "NativeExpressAD",
    "PostSquare_City", "PostSquare_Recommend", "PostSquareChatRoomRecDTO",
    "MW", '"MW"', "IMAGE", "TEXT", "VIDEO", "AD",
    "广告使用场景是信息流", "疑似广告", "广告构建", "信息流",
    "社交达人", "强社交", "foodtaster", "bizad",
]

lines = []
with zipfile.ZipFile(apk) as z:
    for n in sorted(z.namelist()):
        if not n.endswith(".dex"):
            continue
        data = z.read(n)
        for key in KEYS:
            kb = key.encode("utf-8") if not key.startswith('"') else key.encode("ascii")
            idx = 0
            c = 0
            while c < 12:
                i = data.find(kb, idx)
                if i < 0:
                    break
                ctx = data[max(0, i - 50) : i + 150]
                parts = [x.decode("ascii", "ignore") for x in re.findall(rb"[\x20-\x7e]{3,}", ctx)]
                for m in re.finditer(rb"(?:[\xe4-\xe9][\x80-\xbf]{2})+", ctx):
                    try:
                        parts.append(m.group().decode("utf-8"))
                    except Exception:
                        pass
                txt = " | ".join(parts)
                if key in ("MW", '"MW"') and "Square" not in txt and "AdPost" not in txt and "IMAGE" not in txt and "type" not in txt.lower():
                    idx = i + len(kb)
                    c += 1
                    continue
                lines.append(f"[{n}] {key}: {txt[:300]}")
                idx = i + len(kb)
                c += 1

# dedupe
seen = set()
uniq = []
for l in lines:
    if l not in seen:
        seen.add(l)
        uniq.append(l)

out.write_text("\n".join(uniq), encoding="utf-8")
print(len(uniq), "lines ->", out)
