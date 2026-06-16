# -*- coding: utf-8 -*-
import re, zipfile
from pathlib import Path

TEMP = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\temp")
BYEAD = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\byead")
OUT = BYEAD / "analysis" / "_feedback_scan.txt"

KEYS = [
    "你觉得这条广告怎么样", "直接关闭", "不喜欢内容", "不喜欢品牌",
    "广告", "角标", "反馈", "isAdvertisement", "adSign", "SQUARE_AD",
    "AdFeedback", "adFeedback", "dislike", "AdLabel", "showAd",
    "UnifiedNativeAd", "NativeExpress", "CSqItemSquareAdPost",
    "VIEW_TYPE_AD", "vasAdPostModel", "ADExtension",
]

lines = []
ipa = list(TEMP.glob("Soul_6.23.0*.ipa"))
apk = TEMP / "soul_channel_soul.apk"

def scan_data(label, data):
    for key in KEYS:
        kb = key.encode("utf-8")
        idx = 0
        c = 0
        while c < 8:
            i = data.find(kb, idx)
            if i < 0:
                break
            ctx = data[max(0, i - 60) : i + 120]
            parts = [x.decode("ascii", "ignore") for x in re.findall(rb"[\x20-\x7e]{4,}", ctx)]
            cn = []
            for m in re.finditer(rb"(?:[\xe4-\xe9][\x80-\xbf]{2})+", ctx):
                try:
                    cn.append(m.group().decode("utf-8"))
                except Exception:
                    pass
            txt = " | ".join(parts + cn)
            if txt:
                lines.append(f"[{label}] {key}: {txt[:300]}")
            idx = i + len(kb)
            c += 1

if ipa:
    with zipfile.ZipFile(ipa[0]) as z:
        scan_data("IPA/Soul_New", z.read("Payload/Soul_New.app/Soul_New"))
        for n in z.namelist():
            if ".framework/" in n and n.count("/") <= 3:
                try:
                    d = z.read(n)
                    if len(d) > 5000:
                        scan_data(f"IPA/{n.split('/')[-1]}", d)
                except Exception:
                    pass

if apk.exists():
    with zipfile.ZipFile(apk) as z:
        for n in z.namelist():
            if n.endswith(".dex"):
                scan_data(n, z.read(n))

OUT.write_text("\n".join(lines), encoding="utf-8")
print(len(lines), "hits ->", OUT)
