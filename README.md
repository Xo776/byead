# Soul AdBlock

QuantumultX 重写规则，去除 Soul App 开屏广告、广场伪装帖广告、插屏广告和广告积分弹窗。

版本：**v0.4**（2026-06-16）

## 文件说明

| 文件 | 用途 |
|------|------|
| `soul_ads.conf` | QX 重写配置（导入引用） |
| `soul_feed_ads.js` | 广场/城市广场信息流伪装帖过滤 |
| `soul_popup_ads.js` | 开屏/插屏弹窗配置过滤 |
| `soul_ssp_ads.js` | SSP 竞价空响应 |
| `soul_sdk_ads.js` | 穿山甲/GDT SDK 废掉模块 |
| `soul_block.js` | 通用空 JSON 阻断 |
| `BLOCKLIST.md` | 完整拦截域名/IP 清单 |
| `analysis/` | IPA/APK 逆向分析脚本与报告 |

## 安装

1. 打开 QuantumultX → 设置 → 重写 → 引用
2. 添加：`https://raw.githubusercontent.com/Xo776/byead/main/soul_ads.conf`
3. 开启 MITM，`soul_ads.conf` 末尾 `hostname` 行已列出需解密的域名
4. 强制更新脚本缓存后重启 Soul

## 广告链路

| 类型 | 来源 | 处理方式 |
|------|------|----------|
| 开屏/插屏 | `api-a` 弹窗配置 + `ssp` + `increase-openapi` | 源头封禁 |
| 广场伪装帖 / 原生广告 | `post.soulapp.cn` 推荐流 + VAS 接口 | 响应体过滤 + 源头封禁 |
| SDK 原生广告 | 穿山甲/广点通/美团 | 域名封禁 + SDK 废模块 |
| 推广聊天室 | `postSquareChatRoomRecDTOList` | 响应体清空 |

详细封禁列表见 [BLOCKLIST.md](BLOCKLIST.md)。

## 许可证

MIT
