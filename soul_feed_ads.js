/**
 * Soul 广场信息流广告过滤 v1.0
 * 
 * 原理：拦截 post.soulapp.cn 的信息流 API 响应，
 * 过滤掉包含 ad 字段或 adExtension 扩展的广告帖子。
 * 
 * 广告帖子识别规则（基于 APK 逆向）：
 * 1. 帖子对象包含 "ad" 或 "adExtension" 字段
 * 2. 帖子对象的 "isAd" 字段为 true
 * 3. 帖子类型标识为广告类型
 */

let body = $response.body;
if (body) {
    try {
        // 去掉 chunked 编码前缀（如 "a2dc\n"）
        body = body.replace(/^[0-9a-fA-F]+\r?\n/, '');
        let obj = JSON.parse(body);
        
        // 递归过滤广告帖子
        function filterAds(data) {
            if (!data || typeof data !== 'object') return data;
            
            // 如果是数组，过滤每个元素
            if (Array.isArray(data)) {
                return data
                    .filter(item => {
                        // 检查是否为广告帖子
                        if (item && typeof item === 'object') {
                            // 规则1: 有 ad 或 adExtension 字段
                            if (item.ad || item.adExtension) return false;
                            // 规则2: isAd 标记
                            if (item.isAd === true) return false;
                            // 规则3: 包含广告URL
                            if (item.adUrl || item.adImageUrl) return false;
                        }
                        return true;
                    })
                    .map(item => filterAds(item));
            }
            
            // 如果是对象，递归处理每个属性
            if (typeof data === 'object' && data !== null) {
                // 如果对象本身是广告，返回空
                if (data.ad || data.adExtension || data.isAd === true) {
                    return null;
                }
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
        body = JSON.stringify(obj);
    } catch (e) {
        // JSON 解析失败，原样返回
    }
}
$done({ body });
