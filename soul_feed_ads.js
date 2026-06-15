/**
 * Soul 广场信息流广告过滤 v1.1
 * 
 * 原理：拦截 post.soulapp.cn 的信息流 API 响应，
 * 1. 清除推广聊天室列表
 * 2. 过滤广告帖子（isAd/ad/adExtension）
 * 3. 清除推广业务列表
 */
let body = $response.body;
if (body) {
    try {
        // 去掉所有 chunked 编码头行
        body = body.replace(/^[0-9a-fA-F]+\r?\n/gm, "");
        body = body.replace(/\r?\n0\r?\n\r?\n$/, "");
        let obj = JSON.parse(body);

        // 清除推广聊天室列表（最常见的广场“广告”）
        if (obj.data && Array.isArray(obj.data.postSquareChatRoomRecDTOList)) {
            obj.data.postSquareChatRoomRecDTOList = [];
        }

        // 递归过滤广告帖子
        function filterAds(data) {
            if (!data || typeof data !== "object") return data;
            if (Array.isArray(data)) {
                return data
                    .filter(item => {
                        if (item && typeof item === "object") {
                            if (item.ad || item.adExtension) return false;
                            if (item.isAd === true) return false;
                            if (item.adUrl || item.adImageUrl) return false;
                            if (item.showPromote === true) return false;
                            // 剔除广告类型帖子
                            if (item.type === "AD") return false;
                        }
                        return true;
                    })
                    .map(item => filterAds(item));
            }
            if (typeof data === "object" && data !== null) {
                if (data.ad || data.adExtension || data.isAd === true) return null;
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

        // 清除推广业务列表
        if (obj.data && Array.isArray(obj.data.bizList)) {
            obj.data.bizList = [];
        }

        body = JSON.stringify(obj);
    } catch (e) {
        // JSON 解析失败，原样返回
    }
}
$done({ body });
