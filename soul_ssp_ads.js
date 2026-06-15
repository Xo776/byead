/**
 * Soul SSP 广告阻断 v2.0
 * 无条件拦截所有SSP响应，返回空JSON
 * 不尝试解析、不尝试修改 — 最可靠的阻断方式
 */
let body = $response.body;
// 直接返回空对象，SSP SDK拿到空数据→没有广告可渲染
$done({ body: "{}" });
