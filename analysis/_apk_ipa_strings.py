# -*- coding: utf-8 -*-
"""Extract ad-related strings from Soul IPA/APK binaries."""
import os, re, zipfile, sys
from pathlib import Path

TEMP = Path(r"c:\Users\OS01\Desktop\2026 全年比赛\temp")
OUT = TEMP / "_binary_string_scan.txt"

# Patterns: Chinese + English ad/square feed related
PATTERNS = [
    r"广告", r"推广", r"信息流", r"广场", r"城市广场", r"社交达人",
    r"recallSRC", r"recallSrc", r"RecallSRC",
    r"PostSquare", r"PostSquare_City", r"PostSquare_Recommend",
    r"showPromote", r"isAd", r"adExtension", r"adUrl",
    r"foodtaster", r"bizad", r"meituan",
    r'"MW"', r"'MW'", r"type.*MW", r"MWPost", r"MWAd", r"MWCard",
    r"recCardType", r"recParam", r"algExt",
    r"sculptor", r"bidResult", r"ssp\.soulapp",
    r"recommended", r"container_timeline",
    r"native.?ad", r"NativeAd", r"feed.?ad", r"FeedAd",
    r"SoulAd", r"Commercial", r"commercial",
    r"伪装", r"达人", r"recallMap",
]

COMPILED = [(p, re.compile(p, re.I)) for p in PATTERNS]


def extract_strings(data: bytes, min_len=4):
    """ASCII + UTF-8 CJK runs from binary."""
    results = []
    # ASCII
    for m in re.finditer(rb"[\x20-\x7e]{%d,}" % min_len, data):
        results.append(m.group().decode("ascii", "ignore"))
    # UTF-8 Chinese sequences
    for m in re.finditer(rb"(?:[\xe4-\xe9][\x80-\xbf]{2}){2,}", data):
        try:
            results.append(m.group().decode("utf-8"))
        except Exception:
            pass
    return results


def scan_file(label, path, max_mb=200):
    hits = {p: [] for p, _ in COMPILED}
    size = os.path.getsize(path)
    if size > max_mb * 1024 * 1024:
        return hits, f"skipped (>{max_mb}MB)"
    with open(path, "rb") as f:
        data = f.read()
    strings = extract_strings(data)
    for s in strings:
        for pname, cre in COMPILED:
            if cre.search(s) and len(hits[pname]) < 30:
                if s not in hits[pname]:
                    hits[pname].append(s[:200])
    return hits, f"scanned {len(strings)} strings from {size//1024//1024}MB"


def scan_zip(zip_path, inner_filter=None, max_files=40):
    all_hits = {}
    scanned = []
    with zipfile.ZipFile(zip_path, "r") as zf:
        names = zf.namelist()
        targets = []
        for n in names:
            low = n.lower()
            if inner_filter and not inner_filter(n):
                continue
            if low.endswith((".dex",)) or (
                ".app/" in n
                and not low.endswith((".png", ".jpg", ".jpeg", ".gif", ".webp", ".ttf", ".otf", ".mp3", ".mp4", ".car"))
                and "/" in n.split(".app/")[-1]
                and "." not in os.path.basename(n).split("/")[-1][:20]
            ):
                targets.append(n)
            elif low.endswith((".json", ".plist", ".js", ".xml")) and any(
                k in low for k in ("ad", "popup", "config", "square", "feed", "commercial")
            ):
                targets.append(n)
        # Prioritize main binary / dex
        targets.sort(key=lambda x: (
            0 if x.endswith(".dex") or (".app/" in x and x.count("/") <= 3) else 1,
            -len(x),
        ))
        targets = targets[:max_files]
        for n in targets:
            try:
                data = zf.read(n)
            except Exception as e:
                scanned.append(f"  ERR {n}: {e}")
                continue
            strings = extract_strings(data)
            file_hits = {}
            for s in strings:
                for pname, cre in COMPILED:
                    if cre.search(s):
                        file_hits.setdefault(pname, [])
                        if s not in file_hits[pname] and len(file_hits[pname]) < 15:
                            file_hits[pname].append(s[:250])
            if file_hits:
                scanned.append(f"  {n} ({len(data)//1024}KB)")
                for pname, vals in file_hits.items():
                    all_hits.setdefault(pname, {})
                    all_hits[pname][n] = vals
    return all_hits, scanned


def main():
    lines = []
    ipa = list(TEMP.glob("Soul_6.23.0*.ipa"))
    apk = TEMP / "soul_channel_soul.apk"

    if ipa:
        lines.append("=" * 60)
        lines.append(f"IPA: {ipa[0].name}")
        hits, scanned = scan_zip(ipa[0], max_files=50)
        lines.extend(scanned)
        lines.append("")
        for pname in sorted(hits.keys()):
            lines.append(f"--- Pattern: {pname} ---")
            for fname, vals in hits[pname].items():
                lines.append(f"  [{fname}]")
                for v in vals[:8]:
                    lines.append(f"    {v}")
            lines.append("")

    if apk.exists():
        lines.append("=" * 60)
        lines.append(f"APK: {apk.name}")
        hits, scanned = scan_zip(apk, inner_filter=lambda n: ".dex" in n.lower() or "assets/" in n.lower(), max_files=60)
        lines.extend(scanned)
        lines.append("")
        for pname in sorted(hits.keys()):
            lines.append(f"--- Pattern: {pname} ---")
            for fname, vals in hits[pname].items():
                lines.append(f"  [{fname}]")
                for v in vals[:8]:
                    lines.append(f"    {v}")
            lines.append("")

    OUT.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT} ({len(lines)} lines)")


if __name__ == "__main__":
    main()
