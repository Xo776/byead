/**
 * Soul SSP 广告响应清空 v1.1
 * 拦截 ssp.soulapp.cn 所有API响应，废掉广告模块
 */
let body = $response.body;
if (body) {
    try {
        // 去掉所有 chunked 编码头
        body = body.replace(/^[0-9a-fA-F]+\r?\n/gm, "");
        // 去掉chunk尾标记
        body = body.replace(/\r?\n0\r?\n\r?\n$/, "");
        let obj = JSON.parse(body);
        if (obj.data) {
            // 清空广告/推广列表
            obj.data.ads = [];
            obj.data.prs = [];
            obj.data.prePrs = [];
            // 禁用策略
            if (obj.data.strategy) {
                obj.data.strategy.timeout = 0;
                obj.data.strategy.reqMode = 0;
            }
        }
        // 把成功的code也改成错误，阻止客户端渲染
        obj.code = -1;
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        // JSON解析失败 -> 直接返回空对象，让SDK无法解析
        $done({ body: "{}" });
    }
} else {
    $done({ body: "{}" });
}
