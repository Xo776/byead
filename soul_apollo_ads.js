/**
 * Soul Apollo 配置净化 v1.0
 * 将 api-ucc Apollo 响应中的广告/展位/SSP 开关全部关闭（模拟审核/合规模式）
 */
let body = $response.body;
if (!body) {
    $done({});
} else {
    try {
        let obj = JSON.parse(body);
        const AD_KEY = /ad|slot|ssp|gdt|pangle|commercial|furion|vas|native|feed.*ad|square.*ad|banner|reward.*ad|splash.*ad|interstitial|竞价|广告/i;

        function patch(node) {
            if (!node || typeof node !== "object") return;
            if (Array.isArray(node)) {
                node.forEach(patch);
                return;
            }
            for (let key of Object.keys(node)) {
                let val = node[key];
                if (AD_KEY.test(key)) {
                    if (typeof val === "boolean") node[key] = false;
                    else if (typeof val === "number") node[key] = 0;
                    else if (typeof val === "string") {
                        if (/^true$/i.test(val) || val === "1" || /open|enable/i.test(val)) {
                            node[key] = "false";
                        }
                    } else if (Array.isArray(val)) {
                        node[key] = [];
                    } else if (val && typeof val === "object") {
                        node[key] = {};
                    }
                } else if (val && typeof val === "object") {
                    patch(val);
                }
            }
        }

        patch(obj);
        body = JSON.stringify(obj);
    } catch (e) {
        body = JSON.stringify({ code: 10001, success: true, data: {} });
    }
    $done({ body });
}
