/**
 * Soul 广场信息流广告过滤 v1.7
 *
 * v1.7：直接处理 data.postList；authorId=-1 假号帖；QX 日志输出过滤计数
 */
const TAG = "[byead-feed]";
let body = (typeof $response !== "undefined" && $response) ? $response.body : null;
let reqUrl = $request.url || "";
let raw = body;

if (!body) {
    $done({});
} else {
    try {
        let raw = body;
        body = body.replace(/^[0-9a-fA-F]+\r?\n/gm, "");
        body = body.replace(/\r?\n0\r?\n\r?\n$/, "");
        let obj = JSON.parse(body);
        let removed = 0;
        let before = 0;

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
            if (obj.data.slotFreqConfigMap) {
                obj.data.slotFreqConfigMap = {};
            }
            if (Array.isArray(obj.data.adList)) {
                obj.data.adList = [];
            }
            if (Array.isArray(obj.data.slotList)) {
                obj.data.slotList = [];
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
            "qzs.gdtimg", "pgdt.gtimg", "sdk.e.qq", "feedAd",
            "UnifiedNative", "nativeExpress", "GDTMob"
        ];

        const LIST_KEYS = [
            "postList", "recommendItems", "recCards", "postInfoList",
            "timelineList", "unreadList", "hotList", "dataList", "list"
        ];

        function getAuthorId(item) {
            if (!item) return null;
            if (item.authorId !== undefined && item.authorId !== null) return item.authorId;
            if (item.postAuthorModel && item.postAuthorModel.authorId !== undefined) {
                return item.postAuthorModel.authorId;
            }
            return null;
        }

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
            if (item.feedAd || item.nativeExpressAd || item.unifiedNativeAd) return true;

            let type = item.type;
            if (type === "AD" || type === "MW" || type === "AD_POST") return true;

            let cardType = item.recCardType;
            if (cardType && cardType !== 0 && cardType !== "0") return true;

            let src = item.recallSRC;
            if (src === 999 || src === "999") return true;
            if (src === 76 || src === "76") return true;

            let alg = item.algExt;
            if (alg && String(alg).indexOf("76||") === 0) return true;

            let authorId = getAuthorId(item);
            if ((authorId === -1 || authorId === "-1") &&
                (src === 76 || src === "76" || src === 999 || src === "999")) {
                return true;
            }

            let content = JSON.stringify(item);
            for (let kw of AD_KEYWORDS) {
                if (content.indexOf(kw) !== -1) return true;
            }
            return false;
        }

        function filterList(arr) {
            if (!Array.isArray(arr)) return arr;
            before += arr.length;
            let out = arr.filter(item => {
                if (isAdPost(item)) {
                    removed++;
                    return false;
                }
                return true;
            });
            return out;
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

        if (obj.data && Array.isArray(obj.data.postList)) {
            obj.data.postList = filterList(obj.data.postList);
        }
        walkLists(obj);

        if (removed > 0) {
            console.log(TAG + " -" + removed + "/" + before + " " + reqUrl.split("?")[0]);
        }

        body = JSON.stringify(obj);
    } catch (e) {
        console.log(TAG + " parse_err " + e.message);
        body = raw;
    }
    $done({ body });
}
