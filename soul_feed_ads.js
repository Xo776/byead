/**
 * Soul 广场信息流广告过滤 v1.5
 *
 * 拦截 post.soulapp.cn / gateway-mobile-gray sculptor 响应，
 * 从 postList 剔除伪装成普通帖的广告（APK+抓包验证）。
 *
 * 识别优先级：
 * 1. 显性标记：isAd / ad / adExtension / type=AD|MW / showPromote / vasAdPostModel
 * 2. 召回渠道：recallSRC=999 或 76（社交达人伪装帖，无需 utm）
 * 3. 算法标记：algExt 以 "76||" 开头
 * 4. 商业化字段：commercialPostType / postCommercialVO
 * 5. 内容关键词：foodtaster / meituan / utm_* 等追踪参数
 * 6. 清除 postSquareChatRoomRecDTOList / bizList
 */
let body = $response.body;
if (body) {
    try {
        body = body.replace(/^[0-9a-fA-F]+\r?\n/gm, "");
        body = body.replace(/\r?\n0\r?\n\r?\n$/, "");
        let obj = JSON.parse(body);

        if (obj.data && Array.isArray(obj.data.postSquareChatRoomRecDTOList)) {
            obj.data.postSquareChatRoomRecDTOList = [];
        }

        const AD_KEYWORDS = [
            "foodtaster", "offsiteact", "dspadlogger", "wmpact",
            "bizad", "tackinessann", "meituan.net", "meituan.com",
            "pangolin", "snssdk", "gdt.qq", "applovin", "mintegral",
            "doubleclick", "googlesyndication", "adservice",
            "utm_source", "utm_campaign", "utm_medium",
            "sponsor", "promoted", "advert", "chaxi66"
        ];

        function isAdPost(item) {
            if (!item || typeof item !== "object") return false;

            if (item.isAd === true) return true;
            if (item.ad || item.adExtension) return true;
            if (item.adUrl || item.adImageUrl) return true;
            if (item.showPromote === true) return true;
            if (item.vasAdPostModel) return true;
            if (item.commercialPostType) return true;
            if (item.postCommercialVO) return true;

            let type = item.type;
            if (type === "AD" || type === "MW") return true;

            let src = item.recallSRC;
            if (src === 999 || src === "999") return true;
            if (src === 76 || src === "76") return true;

            let alg = item.algExt;
            if (alg && String(alg).indexOf("76||") === 0) return true;

            let content = JSON.stringify(item);
            for (let kw of AD_KEYWORDS) {
                if (content.indexOf(kw) !== -1) return true;
            }
            return false;
        }

        function filterAds(data) {
            if (!data || typeof data !== "object") return data;
            if (Array.isArray(data)) {
                return data
                    .filter(item => !isAdPost(item))
                    .map(item => filterAds(item));
            }
            if (data !== null) {
                if (isAdPost(data)) return null;
                let result = {};
                for (let key of Object.keys(data)) {
                    let value = filterAds(data[key]);
                    if (value !== null && value !== undefined) result[key] = value;
                }
                return result;
            }
            return data;
        }

        obj = filterAds(obj);

        if (obj.data && Array.isArray(obj.data.bizList)) {
            obj.data.bizList = [];
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // JSON 解析失败，原样返回
    }
}
$done({ body });
