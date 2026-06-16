# -*- coding: utf-8 -*-
"""Deep targeted string search in Soul APK DEX + IPA main binary."""
import os, re, zipfile, sys
from pathlib import Path

TEMP = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\temp")
OUT = TEMP / "_binary_deep_scan.txt"

# High-value exact / regex searches
QUERIES = [
    ("MW_post_type", re.compile(r'".{0,30}MW.{0,30}"|type.{0,5}MW|MW.{0,20}Post|Post.{0,20}MW', re.I)),
    ("recallSRC_76_999", re.compile(r'recallSRC.{0,40}(76|999)|"76".{0,30}recall|社交达人|强社交')),
    ("square_ad_classes", re.compile(r'square.{0,40}(ad|Ad|AD|promote|Promote)|PostSquare.{0,30}(ad|Ad)', re.I)),
    ("disguise_native", re.compile(r'伪装|native.{0,20}post|post.{0,20}native|信息流.{0,20}广告|广告.{0,20}信息流|软广|种草', re.I)),
    ("mw_container", re.compile(r'MW[A-Z][a-zA-Z]+|mw[A-Z][a-zA-Z]+|MWCard|MWPost|MWAd|MWItem|MWFeed', re.I)),
    ("ad_post_fields", re.compile(r'showPromote|isAd[^a-zA-Z]|adExtension|adImageUrl|adUrl|commercialPostType|postCommercialVO|recCardType', re.I)),
    ("foodtaster_meituan", re.compile(r'foodtaster|bizad|meituan\.net|offsiteact|dspadlogger', re.I)),
    ("soul_ad_pkg", re.compile(r'cn/soulapp/android/ad/[^\s;"]{5,80}', re.I)),
    ("square_pkg", re.compile(r'cn/soulapp/android/(component/)?square/[^\s;"]{5,80}', re.I)),
]


def strings_from(data, min_ascii=5):
    out = []
    for m in re.finditer(rb"[\x20-\x7e]{%d,}" % min_ascii, data):
        out.append(m.group().decode("ascii", "ignore"))
    for m in re.finditer(rb"(?:[\xe4-\xe9][\x80-\xbf]{2})+", data):
        try:
            out.append(m.group().decode("utf-8"))
        except Exception:
            pass
    return out


def scan_blob(label, data, limit_per_query=40):
    found = {}
    for s in strings_from(data):
        for qname, cre in QUERIES:
            if cre.search(s):
                found.setdefault(qname, [])
                if s not in found[qname] and len(found[qname]) < limit_per_query:
                    found[qname].append(s[:300])
    return found


def scan_apk(apk_path):
    results = {}
    files_scanned = []
    with zipfile.ZipFile(apk_path) as zf:
        dex_files = sorted([n for n in zf.namelist() if n.endswith(".dex")])
        for n in dex_files:
            data = zf.read(n)
            hits = scan_blob(n, data)
            if hits:
                results[n] = hits
                files_scanned.append(f"{n} ({len(data)//1024}KB) -> {sum(len(v) for v in hits.values())} hits")
    return results, files_scanned


def scan_ipa(ipa_path):
    results = {}
    files_scanned = []
    with zipfile.ZipFile(ipa_path) as zf:
        # Find main executable
        candidates = []
        for n in zf.namelist():
            if ".app/" in n and not n.endswith("/"):
                base = n.split(".app/")[-1]
                if "/" not in base and not base.endswith((".png", ".plist", ".json", ".car", ".metallib")):
                    candidates.append((len(n), n))
        candidates.sort(reverse=True)
        # Also frameworks with 'Soul' or 'Ad'
        for n in zf.namelist():
            low = n.lower()
            if any(k in low for k in ("soul", "ad", "commercial", "square")) and (
                low.endswith((".framework/",)) is False
            ):
                if low.endswith(()) and "/" not in n.split("/")[-1]:
                    pass
        # Scan main app binary + interesting frameworks
        targets = set()
        for _, n in candidates[:3]:
            targets.add(n)
        for n in zf.namelist():
            if ".framework/" in n:
                parts = n.split(".framework/")
                if len(parts) > 1:
                    rest = parts[1]
                    if "/" not in rest.strip("/") and rest.endswith((".dylib", "")):
                        fname = rest.split("/")[0] if "/" in rest else rest
                    bin_part = parts[1].split("/")[0] if "/" in parts[1] else None
                if any(k in n for k in ("SoulAd", "Commercial", "Square", "Sculptor", "AdCore", "soulapp")):
                    sub = n.split(".framework/")[-1]
                    if "/" not in sub:
                        targets.add(n)
        for n in sorted(targets):
            try:
                data = zf.read(n)
            except Exception:
                continue
            if len(data) < 1000:
                continue
            hits = scan_blob(n, data)
            if hits:
                results[n] = hits
                files_scanned.append(f"{n} ({len(data)//1024//1024}MB) -> {sum(len(v) for v in hits.values())} hits")
    return results, files_scanned


def main():
    lines = []
    ipa = list(TEMP.glob("Soul_6.23.0*.ipa"))
    apk = TEMP / "soul_channel_soul.apk"

    if apk.exists():
        lines.append("=" * 70)
        lines.append("APK DEEP SCAN")
        res, scanned = scan_apk(apk)
        lines.extend(scanned)
        for dex, hits in sorted(res.items()):
            lines.append(f"\n### {dex} ###")
            for q, vals in sorted(hits.items()):
                lines.append(f"  [{q}]")
                for v in vals:
                    lines.append(f"    {v}")

    if ipa:
        lines.append("\n" + "=" * 70)
        lines.append("IPA DEEP SCAN")
        res, scanned = scan_ipa(ipa[0])
        lines.extend(scanned or ["(no hits in main binary/frameworks)"])
        for path, hits in sorted(res.items()):
            lines.append(f"\n### {path} ###")
            for q, vals in sorted(hits.items()):
                lines.append(f"  [{q}]")
                for v in vals:
                    lines.append(f"    {v}")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"done -> {OUT} ({len(lines)} lines)")


if __name__ == "__main__":
    main()
