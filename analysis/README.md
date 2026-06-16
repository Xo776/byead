# 逆向分析产物

2026-06-16 对 Soul 6.23.0 IPA/APK 及抓包 `temp/2026-06-16-110140` 的分析脚本与输出。

| 文件 | 说明 |
|------|------|
| `_analyze_ads.py` | 抓包 postList 广告标记统计 |
| `_find_mw.py` | 抓包 MW 字符串搜索 |
| `_apk_ipa_strings.py` / `_apk_ipa_deep.py` | APK/IPA 字符串扫描 |
| `_dex_key.py` / `_square_types.py` | DEX 关键字精确搜索 |
| `_ad_analysis.txt` | 抓包 recallSRC=76 帖子列表 |
| `_dex_key_findings.txt` | APK 广告类/字段命中 |
| `_square_item_types.txt` | SquareAdapter ITEM_TYPE 枚举 |
| `_binary_string_scan.txt` | 广谱字符串扫描结果 |

结论已写入仓库根目录 `BLOCKLIST.md`。
