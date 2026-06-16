# Soul 去广告 — 误伤复盘与使用说明

更新时间：2026-06-16（v0.7）

## 核心机制（为何会影响别的 App）

QuantumultX 的 `[rewrite]` **不按 App 区分**。只要：

1. MITM `hostname` 里包含某域名，且  
2. 有一条重写规则匹配该域名的请求  

→ **全机所有 App** 的对应 HTTPS 都会被改写成 `{}` / `reject` / 脚本处理。

因此：在 Soul 抓包里见过的「美团广告素材域名」，若写成 `*.meituan.net` 全局封禁，**美团 App 必挂**——不是美团坏了，是 QX 把它的 CDN/API 也拦了。

---

## 规则分级

### ✅ 基本只伤 Soul（`* .soulapp.cn` 或 Soul 专用路径）

| 类型 | 示例 | 误伤风险 |
|------|------|----------|
| Soul 广告子域 | `ssp/ad/soul-ad/ad-r`… | 低 |
| Soul API 路径 | `post.soulapp.cn/.../recommended` + `soul_feed_ads.js` | 低（仅改广场 JSON） |
| Soul 展位配置 | `furion/position`、`official/scene` | 低～中（可能少部分运营位，非别的 App） |
| Soul Apollo | `api-ucc.soulapp.cn/app/apollo` | 低 |
| Soul 广告 IP | `47.110.187.87` 等 | 低（仅 Soul 硬编码） |

### ⚠️ 会影响多个 App（共享广告 SDK / CDN）

| 域名模式 | 谁在用 | 误伤表现 |
|----------|--------|----------|
| `*.gdt.qq.com` / `sdk.e.qq.com` | 腾讯系 + 大量接广点通 App | 别的 App **开屏/信息流广告变没**；少数依赖 GDT 非广告能力的可能异常 |
| `*.snssdk.com` / 穿山甲全家桶 | 抖音系 SDK 宿主 | 接穿山甲的 App 广告/统计异常 |
| `*.alicdn.com` | 淘宝、支付宝、菜鸟… | **图片/静态资源加载失败**（高风险，已建议仅保留 Soul feed 内关键词过滤） |
| `*.gtimg.com` | 微信/QQ 头像、腾讯 CDN | **头像/图片异常**（v0.6 过宽，v0.7 已收窄） |
| `open.e.kuaishou.com` | 快手联盟 SDK | 接快手广告的 App |

### ❌ 已确认高误伤（v0.3～v0.6 曾存在，v0.7 已修）

| 规则 | 为何误伤 | Soul 侧替代 |
|------|----------|---------------|
| **`*.meituan.net`** | 美团/外卖/点评 **主 CDN**（商品图、接口） | `soul_feed_ads.js` 关键词 `meituan.net` / `foodtaster` 过滤广场帖；保留 `impdsp` 等 **纯广告子域** |
| **`open.meituan.com`** | 美团系登录/开放能力 | 同上，仅 feed 过滤 |
| **`lx0.meituan.com`** | 美团埋点（主 App 常用） | 同上 |
| **`portal-portm.meituan.com`** | 美团 Horn 动态配置 | 同上 |
| **`catfront.dianping.com`** | 点评/美团前端监控 | 同上 |

抓包里 Soul 广告跳转美团，看到的是 **Soul 请求** 了这些域名；封它们能挡 Soul 里的美团广告帖，但 **不能** 用全局 wildcard 封整个美团基础设施。

---

## Soul 内部「可能多删」但不算误伤别的 App

| 项 | 说明 |
|----|------|
| `recallSRC=76` 帖子 | 社交达人伪装帖/软广，删掉后广场更干净，可能少看营销号内容 |
| `planet/config` 删部分卡片 | 星球页少游戏/推广入口，主流程一般不受影响 |
| `teenager/config` 清 data | 可能少青少年弹窗（多数用户无感） |
| `popup` 过滤 `AD_*` | 保留签到/回流福利弹窗，只去广告弹窗 |
| `media-service.soulapp.cn` 阻断 | 若 Soul 正当媒体也走此域，极少数非广告素材可能失败 |

---

## 推荐使用方式

1. **仅订阅** `soul_ads.conf`，不要与 `AdvertisingLite`、墨鱼合集等叠 Soul 段。  
2. **美团/淘宝/微信** 与 Soul 同机使用时：用 v0.7+（已收窄美团与 `*.gtimg` / `*.alicdn`）。  
3. 若某 App 异常：QX 日志看是否命中 `soul_block` 域名 → 对照本文「规则分级」。  
4. 分析抓包时注明：**全局 QX 规则 ≠ 该 App 自身 bug**。

---

## 版本变更

| 版本 | 误伤相关改动 |
|------|----------------|
| v0.3 | 引入 `*.meituan.net` 等（**高误伤**） |
| v0.6 | 引入 `*.gtimg.com`（**中高误伤**） |
| **v0.7** | 美团改为 **仅广告子域**；移除 `*.meituan.net` / `open.meituan.com` 等；`*.gtimg.com` → 仅 `pgdt`；`*.alicdn.com` 移除全局封禁 |
