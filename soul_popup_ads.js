/**
 * Soul 去广告弹窗 v1.0
 * 
 * 原理：Soul App 启动时请求全局弹窗配置 API，服务端返回86种弹窗配置。
 * 本脚本过滤掉广告相关弹窗的 bizCode，使App收不到广告弹窗配置。
 * 
 * 被过滤的 bizCode：
 * - AD_Interstitial: 插屏广告（开屏广告本体）
 * - AD_Points: 广告积分导流弹窗
 * - UG_Startup_flex: 增长通用Web容器弹窗
 * - UG_Startup_flex_v1: 增长通用Web容器弹窗v1
 * - UG_SurpriseGiftDialog: 广告拉活高价值用户承接
 */

const AD_KEYS = [
    "AD_Interstitial",
    "AD_Points",
    "UG_Startup_flex",
    "UG_Startup_flex_v1",
    "UG_SurpriseGiftDialog"
];

let body = $response.body;
if (body) {
    try {
        let obj = JSON.parse(body);
        // 适配嵌套结构 { data: { bizCode: {...} } }
        let target = obj.data || obj;
        for (let key of AD_KEYS) {
            delete target[key];
        }
        body = JSON.stringify(obj);
    } catch (e) {
        // JSON 解析失败，原样返回，不影响正常使用
    }
}
$done({ body });
