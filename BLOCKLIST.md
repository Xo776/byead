# Soul 广告拦截清单 v0.4

更新时间：2026-06-16  
规则文件：`soul_ads.conf`  
处理方式说明：

| 脚本 | 行为 |
|------|------|
| `soul_block.js` | 返回 `{}` |
| `soul_ssp_ads.js` | 返回 `{}` |
| `soul_sdk_ads.js` | 返回 SDK 错误 JSON，废掉广告模块 |
| `soul_popup_ads.js` | 过滤弹窗配置中的广告 bizCode |
| `soul_feed_ads.js` | 从广场 feed 响应中删除广告帖（含 GDT 原生广告位） |

---

## 一、IP 直连

| IP | 用途 | 发现来源 |
|----|------|----------|
| `47.110.187.87` | Soul 硬编码广告服务器 IP，用于绕过域名拦截 | 逆向/历史抓包 |

---

## 二、Soul 自有域名（*.soulapp.cn）

| 域名/路径 | 用途 | 处理方式 |
|-----------|------|----------|
| `ssp.soulapp.cn` | SSP 广告竞价（开屏/信息流 SDK 源） | 空 JSON |
| `ad.soulapp.cn` | 广告投放 | 空 JSON |
| `ad-r.soulapp.cn` | 广告加密上报（含美团素材点击上报） | 空 JSON |
| `soul-ad.soulapp.cn` | 广告服务 | 空 JSON |
| `ad-audit-provider.soulapp.cn` | 广告审核 | 空 JSON |
| `ad-brand-activity.soulapp.cn` | 品牌活动广告 | 空 JSON |
| `ad-h5-cdn.soulapp.cn` | 广告 H5 CDN | 空 JSON |
| `ad-reward.soulapp.cn` | 激励视频广告 | 空 JSON |
| `ad-reward-test.soulapp.cn` | 激励广告测试 | 空 JSON |
| `soul-commercial.soulapp.cn` | 商业化 API | 空 JSON |
| `soul-report.soulapp.cn` | 广告报表 | 空 JSON |
| `marketing-openapi.soulapp.cn` | 营销开放 API | 空 JSON |
| `data-collector.soulapp.cn` | 数据上报 | 空 JSON |
| `datacollector-sea.soulapp.cn` | 海外数据收集 | 空 JSON |
| `insight.soulapp.cn` | 洞察分析 | 空 JSON |
| `aegis-log.soulapp.cn` | 日志上报 | 空 JSON |
| `aegis-cdn.soulapp.cn` | CDN 日志 | 空 JSON |
| `fingerprint.soulapp.cn` | 设备指纹 | 空 JSON |
| `increase-openapi.soulapp.cn` | 增长/开屏策略（`/increase/startup/policy`） | 空 JSON |
| `gateway2-tcp-spam.soulapp.cn` | TCP 垃圾网关 | 空 JSON |
| `handshake.gtnetwork.soulapp.cn` | 网络握手 | 空 JSON |
| `soul-permanent.soulapp.cn` | 永久配置 | 空 JSON |
| `api-a.soulapp.cn/.../popup/allConfig` | 全局弹窗配置（开屏/插屏/积分） | 过滤 AD_* |
| `post.soulapp.cn/.../recommended` 等 | 广场/城市广场推荐流 | 过滤伪装帖 + 原生广告位 |
| `post.soulapp.cn/.../recommend/vas/` | VAS 原生广告帖推荐 | 空 JSON |
| `*.soulapp.cn/api/ad/` | 广告策略/槽位配置（strategyApi 等） | 空 JSON |
| `gateway-mobile-gray.soulapp.cn/sculptor/` | 灰度推荐引擎 | 过滤伪装帖 |
| `api-ucc.soulapp.cn/app/apollo/` | Apollo 特性开关 | 空 JSON |
| `media-service.soulapp.cn` | 媒体/广告 CDN | 空 JSON |

---

## 三、穿山甲 / 字节跳动

| 域名 | 用途 |
|------|------|
| `api-access.pangolin-sdk-toutiao.com` | 穿山甲 SDK 主 API |
| `is.snssdk.com` | 穿山甲 union SDK |
| `*.snssdk.com` / `*.snssdk.cn` | 字节 SDK 全家桶 |
| `*.pangolin-sdk-toutiao.com` | 穿山甲域名 |
| `*.pstatp.com` | 字节广告基础设施 |
| `pglstatp-toutiao.com` | 穿山甲统计 |
| `*.volccdn.com` | 字节 CDN |
| `*.volcvod.com` | 字节视频点播 |
| `*.byteimg.com` | 字节图片 CDN |
| `*.ctobsnssdk.com` | 字节观测 SDK |
| `apmplus.volces.com` | 字节 APM 行为分析 |
| `vod-settings.volcvod.com` | VOD 配置 |
| `vod-license-*.volccdn.com` | VOD 许可证 |

---

## 四、广点通 / 腾讯

| 域名 | 用途 |
|------|------|
| `mi.gdt.qq.com` | GDT SDK API（Android） |
| `sdk.e.qq.com` | GDT SDK API（**iOS**，v0.4 新增） |
| `qzs.gdtimg.com` | 广点通素材 CDN（v0.4 新增） |
| `httpring.qq.com` | 广点通上报（v0.4 新增） |
| `adsmis.qq.com` | 广点通 MIS（v0.4 新增） |
| `*.gdt.qq.com` | 广点通全家桶 |
| `pgdt.gtimg.com` / `.cn` | 广点通素材 CDN |
| `mmgr.gtimg.com` | 广点通管理 |
| `tmfmazu4.m.qq.com` | 腾讯广告 |
| `data.ab.qq.com` | AB 测试/广告数据 |

---

## 五、美团 DSP（广场 foodtaster 广告链）

| 域名 | 用途 | 备注 |
|------|------|------|
| `impdsp.meituan.com` | 站外 DSP 竞价 | v0.2 已有 |
| `offsiteact.meituan.com` | 站外活动落地 | v0.2 已有 |
| `dspadlogger.waimai.meituan.com` | 外卖广告点击日志 | v0.2 已有 |
| `*.meituan.net` | 广告素材图（如 `p0.meituan.net/bizad`） | **v0.3 新增** |
| `open.meituan.com` | foodtaster 小程序登录 | **v0.3 新增** |
| `lx0.meituan.com` | foodtaster 埋点 | **v0.3 新增** |
| `portal-portm.meituan.com` | 美团 Horn 配置 | **v0.3 新增** |
| `catfront.dianping.com` | foodtaster 指标上报 | **v0.3 新增** |

---

## 六、其他外部 DSP / 落地页

| 域名 | 用途 |
|------|------|
| `*.maplehaze.cn` | 枫叶 SSP |
| `*.qchannel01.cn` / `qchannel03.cn` | 广告渠道追踪 |
| `gateway.tackinessann.xyz` | Soul 反广告拦截探测 |
| `*.zztfly.com` | 广告 CDN 分发 |
| `*.chaxi66.com` | 第三方广告落地页（点击后跳转） | **v0.3 新增** |
| `*.alicdn.com` | 阿里广告 CDN |
| `*.alibabausercontent.com` | 阿里用户内容 CDN |
| `*.qquanquan.com` | 广告渠道 |

---

## 七、国际广告 SDK

| 域名 | 用途 |
|------|------|
| `googleads.g.doubleclick.net` | Google AdMob |
| `pagead2.googlesyndication.com` | Google 广告 |
| `adservice.google.com` | Google 广告服务 |
| `*.doubleclick.net` | Google 广告基础设施 |
| `*.googlesyndication.com` | Google 联盟 |
| `*.applovin.com` | AppLovin SDK |
| `*.mintegral.com` | Mintegral SDK |

---

## 八、快手 SDK

| 域名 | 用途 |
|------|------|
| `open.e.kuaishou.com` | 快手广告 SDK |

---

## 九、广场信息流 — 响应体过滤（非域名封禁）

以下 API 不封域名，由 `soul_feed_ads.js` 修改 JSON 响应：

| API | 场景 |
|-----|------|
| `post.soulapp.cn/v6/post/recommended` | 广场推荐 / 城市广场（`pageId=PostSquare_*`） |
| `post.soulapp.cn/.../timeline` 等 | 时间线、扩展流 |
| `gateway-mobile-gray.soulapp.cn/sculptor/*` | 灰度推荐 |

### 过滤字段（v1.5）

| 条件 | 说明 |
|------|------|
| `recallSRC=76` | 社交达人伪装帖（抓包验证） |
| `recallSRC=999` | 直接广告渠道 |
| `algExt` 以 `76\|\|` 开头 | 算法侧广告标记 |
| `vasAdPostModel` | APK 增值广告帖模型 |
| `commercialPostType` / `postCommercialVO` | 商业化帖 |
| `type=MW` / `type=AD` | 广告类型帖 |
| `isAd` / `ad` / `adExtension` / `showPromote` | 显性标记 |
| 含 `foodtaster` / `meituan` / `utm_*` 等 | 追踪关键词 |
| `postSquareChatRoomRecDTOList` | 推广聊天室（整表清空） |
| `bizList` | 推广业务列表（整表清空） |

---

## 十、v0.3 修复项

1. **修复 `soul_feed_ads.js` v1.4 语法错误**（末尾重复代码导致 QX 脚本失效）
2. **`recallSRC=76` 改为无条件过滤**（不再要求 utm 参数）
3. **新增 APK 验证字段**：`vasAdPostModel`、`commercialPostType`、`postCommercialVO`、`type=MW`
4. **补全美团广告链域名**（见第五节）
5. **新增 `chaxi66.com`** 第三方落地页
