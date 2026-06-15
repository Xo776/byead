/**
 * Soul 广告SDK直连阻断 v1.0
 * 拦截 Pangle/GDT SDK 的广告请求API，返回错误码使SDK停止请求
 * 参考: app2smile/rules adsense.js 成熟方案
 */
const url = $request.url;
const method = $request.method;
if (!$response.body) {
    $done({});
}

let body = JSON.parse($response.body);

// 穿山甲 Pangle - get_ads API (POST)
if ((url.includes("api-access.pangolin-sdk-toutiao.com/api/ad/union/sdk")
     || url.includes("is.snssdk.com/api/ad/union/sdk"))
    && method === "POST") {
    if (body.message) {
        body = {
            "request_id": body.request_id || "",
            "status_code": 20001,
            "reason": 112,
            "desc": "rate limited"
        };
    }
}
// 广点通 GDT/优量汇 (GET)
else if (url.includes("mi.gdt.qq.com") && method === "GET") {
    if (body.ret === 0) {
        body.ret = 102006;
    }
}
// 快手联盟
else if (url.includes("open.e.kuaishou.com") && method === "POST") {
    if (body.result === 1) {
        body.result = 40003;
    }
}

$done({ body: JSON.stringify(body) });
