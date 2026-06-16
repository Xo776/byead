/**
 * Soul 广场信息流广告过滤 v1.6
 *
 * 拦截 post.soulapp.cn / gateway-mobile-gray sculptor 响应，
 * 从 postList 等列表剔除伪装帖与原生信息流广告位。
 *
 * v1.6：补全 GDT/穿山甲原生广告帖字段（ADExtension、isAdvertisement、
 *       adSign、slot 配置等），并覆盖 VAS 推荐帖 API 响应。
 */
let body = $response.body;
if (body) {
    try {
        body = body.replace(/^[0-9a-fA-F]+\r?\n/gm, "");
        body = body.replace(/\r?\n0\r?\n\r?\n$/, "");
        let obj = JSON.parse(body);

        if (obj.data && typeof obj.data === "object") {
            if (Array.isArray(obj.data.postSquareChatRoomRecDTOList)) {
                obj.data.postSquareChatRoomRecDTOList = [];
            }
            if (Array.isArray(obj.data.bizList)) {
                obj.data.bizList = [];
            }
            if (obj.data.recommendInsertSlot) {
                obj.data.recommendInsertSlot = null;
            }
            if (obj.data.plSlotInfo) {
                obj.data.plSlotInfo = null;
            }
        }

        const AD_KEYWORDS = [
            "foodtaster", "offsiteact", "dspadlogger", "wmpact",
            "bizad", "tackinessann", "meituan.net", "meituan.com",
            "pangolin", "snssdk", "gdt.qq", "applovin", "mintegral",
            "doubleclick", "googlesyndication", "adservice",
            "utm_source", "utm_campaign", "utm_medium",
            "sponsor", "promoted", "advert", "chaxi66",
            "soul-ad.soulapp", "ad-performance-advertiser", "ad-ssp-admin",
            "qzs.gdtimg", "pgdt.gtimg", "sdk.e.qq"
        ];

        const LIST_KEYS = [
            "postList", "recommendItems", "recCards", "postInfoList",
            "timelineList", "unreadList", "hotList", "dataList"
        ];

        function isAdPost(item) {
            if (!item || typeof item !== "object") return false;

            if (item.isAd === true) return true;
            if (item.isAdvertisement === true) return true;
            if (item.adSign === true) return true;
            if (item.showAD === true || item.showAd === true) return true;
            if (item.ad || item.adExtension || item.ADExtension) return true;
            if (item.adUrl || item.adImageUrl || item.adTag) return true;
            if (item.showPromote === true) return true;
            if (item.vasAdPostModel) return true;
            if (item.commercialPostType) return true;
            if (item.postCommercialVO) return true;
            if (item.plSlotInfo || item.adSlotInfo) return true;
            if (item.slotId || item.adSlotId || item.subSlotId) return true;
            if (item.recommendInsertSlot) return true;

            let type = item.type;
            if (type === "AD" || type === "MW" || type === "AD_POST") return true;

            let cardType = item.recCardType;
            if (cardType && cardType !== 0 && cardType !== "0") return true;

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

        function filterList(arr) {
            if (!Array.isArray(arr)) return arr;
            return arr.filter(item => !isAdPost(item));
        }

        function walkLists(node) {
            if (!node || typeof node !== "object") return;
            if (Array.isArray(node)) {
                node.forEach(walkLists);
                return;
            }
            for (let key of Object.keys(node)) {
                let val = node[key];
                if (LIST_KEYS.indexOf(key) !== -1 && Array.isArray(val)) {
                    node[key] = filterList(val);
                } else if (val && typeof val === "object") {
                    walkLists(val);
                }
            }
        }

        walkLists(obj);
        body = JSON.stringify(obj);
    } catch (e) {
        // JSON 解析失败，原样返回
    }
}
$done({ body });
