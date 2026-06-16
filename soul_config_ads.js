/**
 * Soul 广告位配置清除 v1.0
 * 参考 fmz200/wool_scripts，清除展位/场景/IP 解析等广告配置 data
 */
let body = $response.body;
let url = $request.url;
if (body) {
    try {
        let obj = JSON.parse(body);
        const strip =
            url.includes("/furion/position/content") ||
            url.includes("/official/scene/module") ||
            url.includes("/winterfell/v2/getIpByDomain") ||
            url.includes("/post/homepage/guide/card") ||
            url.includes("/hot/soul/rank") ||
            url.includes("/post/gift/list") ||
            url.includes("/teenager/config") ||
            url.includes("/mobile/app/version/queryIos");
        if (strip && obj.data !== undefined) {
            delete obj.data;
        }
        body = JSON.stringify(obj);
    } catch (e) {
        // 原样返回
    }
}
$done({ body });
