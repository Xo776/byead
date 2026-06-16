/**
 * Soul 广告SDK直连阻断 v1.1
 * 拦截 Pangle/GDT SDK 的广告请求 API，返回错误码使 SDK 停止请求
 * v1.1：补 iOS 广点通 sdk.e.qq.com / c.gdt.qq.com 等端点
 */
const url = $request.url;
const method = $request.method;
if (!$response.body) {
    $done({});
}

let body;
try {
    body = JSON.parse($response.body);
} catch (e) {
    $done({});
}

// 穿山甲 Pangle - get_ads API (POST)
if ((url.includes("api-access.pangolin-sdk-toutiao.com/api/ad/union/sdk")
     || url.includes("is.snssdk.com/api/ad/union/sdk"))
    && method === "POST") {
    if (body.message !== undefined || body.status_code !== undefined) {
        body = {
            "request_id": body.request_id || "",
            "status_code": 20001,
            "reason": 112,
            "desc": "rate limited"
        };
    }
}
// 广点通 GDT/优量汇 — Android mi.gdt + iOS sdk.e.qq.com 等
else if (url.includes("gdt.qq.com") || url.includes("sdk.e.qq.com")) {
    if (body.ret === 0 || body.ret === undefined) {
        body = { ret: 102006, msg: "no ad fill" };
    }
}
// 快手联盟
else if (url.includes("open.e.kuaishou.com") && method === "POST") {
    if (body.result === 1) {
        body.result = 40003;
    }
}

$done({ body: JSON.stringify(body) });
