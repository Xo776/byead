/**
 * Soul 广场信息流广告过滤 v1.4
 * 
 * 拦截 feed/sculptor 响应，过滤所有 MW 广告帖子（通用广告容器，不限美团）
 * 
 * 广告识别规则：
 * 1. recallSRC=999 (直接广告)
 * 2. recallSRC=76 + utm_source 参数 (伪装社交达人)
 * 3. 任何包含 utm_source/utm_campaign/utm_medium 的帖子 (广告追踪参数)
 * 4. 已知广告平台关键词
 * 5. 推广聊天室/bizList
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

        // 通用广告平台关键词（不限于美团）
        const AD_KEYWORDS = [
            "foodtaster", "offsiteact", "dspadlogger", "wmpact",
            "bizad", "tackinessann", "meituan",
            "pangolin", "snssdk", "gdt.qq", "applovin", "mintegral",
            "doubleclick", "googlesyndication", "adservice",
            "utm_source", "utm_campaign", "utm_medium",
            "sponsor", "promoted", "advert"
        ];

        function isAdPost(item) {
            if (!item || typeof item !== "object") return false;
            // 硬性广告标记
            if (item.ad || item.adExtension || item.isAd === true) return true;
            if (item.adUrl || item.adImageUrl || item.showPromote === true) return true;
            if (item.type === "AD") return true;
            // recallSRC 广告渠道
            let src = item.recallSRC;
            if (src === 999 || src === "999") return true;
            if (src === 76 || src === "76") {
                let s = JSON.stringify(item);
                if (s.indexOf("utm_") !== -1) return true;
            }
            // 内容关键词匹配
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
    } catch (e) {}
}
$done({ body });

        body = JSON.stringify(obj);
    } catch (e) {
        // JSON 解析失败，原样返回
    }
}
$done({ body });
