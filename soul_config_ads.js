/**
 * Soul 广告位配置清除 v1.1
 * 清除 furion 展位、场景模块、IP 解析、星球配置等广告 data
 */
let body = $response.body;
let url = $request.url;
if (!body) {
    $done({});
} else {
    try {
        let obj = JSON.parse(body);
        const strip =
            url.includes("/furion/position/content") ||
            url.includes("/official/scene/module") ||
            url.includes("/winterfell/") ||
            url.includes("/getIpByDomain") ||
            url.includes("/post/homepage/guide/card") ||
            url.includes("/hot/soul/rank") ||
            url.includes("/post/gift/list") ||
            url.includes("/teenager/config") ||
            url.includes("/mobile/app/version/queryIos") ||
            url.includes("/homepage/diamond/position/info") ||
            url.includes("/recSquare/subTabs") ||
            url.includes("/planet/config") ||
            url.includes("/city/recommend/expConfig");

        if (strip) {
            if (obj.data !== undefined) delete obj.data;
            if (obj.result !== undefined) delete obj.result;
        }

        if (url.includes("/city/recommend/expConfig") && obj.data) {
            obj.data.showFlag = false;
            obj.data.adSlot = null;
        }

        body = JSON.stringify(obj);
    } catch (e) {
        body = JSON.stringify({ code: 10001, success: true, data: null });
    }
    $done({ body });
}
