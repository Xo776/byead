/**
 * Soul 广场信息流广告过滤 v1.2
 * 
 * 拦截 post.soulapp.cn + gateway-mobile-gray 的信息流/sculptor 响应
 * 1. 清除推广聊天室列表
 * 2. 过滤广告帖子（已知标记 + 内容关键词）
 * 3. 清除推广业务列表
 * 4. 检测并过滤含广告域名的帖子（meituan等）
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

        // 已知广告域名关键词
        const AD_DOMAINS = ["meituan.net", "meituan.com", "bizad", "ad-ssp-admin", "tackinessann"];

        function isAdPost(item) {
            if (!item || typeof item !== "object") return false;
            // 已知广告标记
            if (item.ad || item.adExtension) return true;
            if (item.isAd === true) return true;
            if (item.adUrl || item.adImageUrl) return true;
            if (item.showPromote === true) return true;
            if (item.type === "AD") return true;
            // 内容中包含广告域名
            let content = JSON.stringify(item);
            for (let domain of AD_DOMAINS) {
                if (content.indexOf(domain) !== -1) return true;
            }
            // recParam 中包含广告相关字符串 (如 ad_ / _ad)
            if (item.recParam && (item.recParam.indexOf("ad_") !== -1 || item.recParam.indexOf("_ad") !== -1)) return true;
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
                    if (value !== null && value !== undefined) {
                        result[key] = value;
                    }
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
