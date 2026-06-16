/**
 * Soul 广场信息流广告过滤 v1.3
 * 
 * 拦截 feed/sculptor 响应，过滤 MW 广告帖子：
 * 1. recallSRC=999 (直接广告) 
 * 2. recallSRC=76 + foodtaster_rtb (美团伪装的"社交达人"广告)
 * 3. 已知广告域名内容检测 (meituan/bizad/foodtaster/offsiteact)
 * 4. 清除推广聊天室/bizList
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

        const AD_KEYWORDS = ["meituan", "bizad", "foodtaster", "offsiteact", "dspadlogger", "wmpact", "tackinessann"];

        function isAdPost(item) {
            if (!item || typeof item !== "object") return false;
            // 已知广告标记
            if (item.ad || item.adExtension || item.isAd === true) return true;
            if (item.adUrl || item.adImageUrl || item.showPromote === true) return true;
            if (item.type === "AD") return true;
            // recallSRC 广告类型
            if (item.recallSRC === 999 || item.recallSRC === "999") return true;
            if (item.recallSRC === 76 || item.recallSRC === "76") {
                // 76=社会达人 需要检查是否包含 foodtaster
                let s = JSON.stringify(item);
                if (s.indexOf("foodtaster") !== -1 || s.indexOf("utm_source") !== -1) return true;
            }
            // 内容中匹配广告关键词
            let content = JSON.stringify(item);
            for (let kw of AD_KEYWORDS) {
                if (content.indexOf(kw) !== -1) return true;
            }
            return false;
        }

        function filterAds(data) {
            if (!data || typeof data !== "object") return data;
            if (Array.isArray(data)) {
                return data.filter(item => !isAdPost(item)).map(item => filterAds(item));
            }
            if (typeof data === "object" && data !== null) {
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
