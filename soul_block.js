/**
 * Soul 通用域名阻断 v1.0
 * 无条件返回空响应，用于替代无效的 url reject-200
 */
$done({ body: "{}" });
