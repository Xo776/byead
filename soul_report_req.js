/**
 * Soul 数据上报请求体替换 v1.0
 * 防止 data-collector 上传环境指纹（含代理检测）影响广告策略
 */
$done({
    body: JSON.stringify({
        content: "ok"
    })
});
