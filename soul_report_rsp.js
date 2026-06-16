/**
 * Soul data-collector 上报响应 v1.0
 * 返回成功，避免上报失败触发降级/重试/异常广告策略
 */
$done({
    body: JSON.stringify({
        code: 10001,
        success: true,
        message: "ok"
    })
});
