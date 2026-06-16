# -*- coding: utf-8 -*-
import re, zipfile
from pathlib import Path

apk = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\temp\soul_channel_soul.apk")
out = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\temp\_square_item_types.txt")

lines = []
with zipfile.ZipFile(apk) as z:
    data = z.read("classes10.dex")
    items = sorted(set(m.group().decode() for m in re.finditer(rb"ITEM_TYPE_[A-Z0-9_]+", data)))
    lines.append("classes10.dex ITEM_TYPE_* (" + str(len(items)) + "):")
    lines.extend("  " + x for x in items)

    cn_pat = "达人|强社交".encode("utf-8")
    for dex in ["classes10.dex", "classes13.dex", "classes14.dex", "classes15.dex"]:
        data = z.read(dex)
        for pat in [
            rb"SoulPostItemMap", rb"SquareAdPost", rb"VasAdPostModel", rb"AdPostV3",
            rb"isAdPost", rb"checkAd", rb"filterAd", rb"insertAd", rb"recallSRC",
            cn_pat,
        ]:
            for m in re.finditer(pat, data, re.I):
                ctx = data[max(0, m.start() - 30) : m.end() + 100]
                ascii_s = [x.decode("ascii", "ignore") for x in re.findall(rb"[\x20-\x7e]{4,}", ctx)]
                cn = []
                for m2 in re.finditer(rb"(?:[\xe4-\xe9][\x80-\xbf]{2})+", ctx):
                    try:
                        cn.append(m2.group().decode("utf-8"))
                    except Exception:
                        pass
                txt = " | ".join(ascii_s + cn)
                if len(txt) > 10:
                    lines.append(f"[{dex}] {pat}: {txt[:250]}")

    lines.append("\n=== Quoted post type literals ===")
    type_re = re.compile(rb'"(IMAGE|TEXT|VIDEO|AD|MW|AUDIO)"')
    for dex in sorted([n for n in z.namelist() if n.endswith(".dex")]):
        data = z.read(dex)
        hits = sorted(set(m.group(1).decode() for m in type_re.finditer(data)))
        if hits:
            lines.append(f"  {dex}: {hits}")

out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out, len(lines))
