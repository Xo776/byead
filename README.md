# Soul AdBlock

QuantumultX 重写规则，去除 Soul App（soulapp.cn）的开屏广告、插屏广告和广告积分弹窗。

## 文件说明

| 文件 | 用途 |
|------|------|
| `soul_ads.conf` | QuantumultX 重写配置文件（导入QX） |
| `soul_popup_ads.js` | 弹窗配置过滤脚本（需托管到GitHub raw） |

## 安装步骤

### 1. 上传脚本到 GitHub

把 `soul_popup_ads.js` 推到你自己的 GitHub 仓库，获取 raw 链接：
```
https://raw.githubusercontent.com/你的用户名/soul-adblock/main/soul_popup_ads.js
```

### 2. 修改配置文件

编辑 `soul_ads.conf`，把第11行的 `你的用户名` 替换为你的 GitHub 用户名。

### 3. 导入 QuantumultX

1. 打开 QuantumultX → 设置 → 重写 → 引用
2. 添加 `soul_ads.conf` 的 raw 链接
3. 开启 MITM，添加主机名：`*.soulapp.cn`

### 4. 验证

重启 Soul App，开屏广告应该消失。

## 原理

通过抓包分析 Soul App 的广告链路，发现5个核心广告端点：

| API | 作用 | 处理方式 |
|-----|------|----------|
| `api-a.soulapp.cn/soul/global/popup/allConfig` | 全局弹窗配置 | 脚本过滤 AD_* 条目 |
| `increase-openapi.soulapp.cn/increase/startup/policy` | 启动广告策略 | 直接拒绝 |
| `ssp.soulapp.cn/api/bidResult` | SSP广告竞价 | 直接拒绝 |
| `ad-r.soulapp.cn/api/v2/report` | 广告上报 | 直接拒绝 |
| `data-collector.soulapp.cn/api/data/report` | 数据上报 | 直接拒绝 |

## 许可证

MIT
