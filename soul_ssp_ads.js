/**
 * Soul SSP 广告响应清空
 * 拦截 ssp.soulapp.cn/api/q，空出 ads/prs 列表
 */
let body = $response.body;
if (body) {
    try {
        // 去掉 chunked 编码头
        body = body.replace(/^[0-9a-fA-F]+\r?\n/, '');
        let obj = JSON.parse(body);
        if (obj.data) {
            obj.data.ads = [];
            obj.data.prs = [];
            obj.data.prePrs = [];
        }
        $done({ body: JSON.stringify(obj) });
    } catch (e) {
        $done({});
    }
} else {
    $done({});
}
