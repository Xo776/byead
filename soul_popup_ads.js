/**
 * Soul 去广告弹窗 v1.2
 * 
 * 原理：Soul App 启动时请求全局弹窗配置 API，服务端返回58种弹窗配置(assets/global_popup_config.json)。
 * 本脚本过滤掉纯广告/广告拉活弹窗，保留用户激励福利弹窗（签到礼包、发帖激励、回流奖励等可薅羊毛）。
 * 
 * === 拦截：纯广告 ===
 * - AD_Interstitial: 插屏广告（开屏广告本体）
 * - AD_Points: 广告积分导流弹窗
 * 
 * === 拦截：广告拉活（增长Web容器/广告推送） ===
 * - UG_Startup_flex / UG_Startup_flex_v1: 增长通用Web容器（广告落地页）
 * - UG_SurpriseGiftDialog: 广告拉活高价值用户承接
 * - UG_Cashpopup: 现金裂变激励弹窗（广告导流）
 * - UG_NOTICE_GLOBAL_POPUP: 增长通知弹窗（广告推送）
 * - UG_PushGuideUpdate: 广告拉活用户引导开启Push
 * 
 * === 保留：用户激励福利（不拦截，可薅羊毛） ===
 * - UG_LostuserMatchPopup: 回流用户免费匹配
 * - UG_Lowactivity_sign: 低活签到礼包
 * - UG_LostuserSoulcoinPopup: 回流发帖奖励
 * - UG_LostuserGiftPopup / UG_LostuserBadgePopup: 回流广场激励
 * - UG_Acquired_sign: 拉活签到
 * - UG_PushAuthGuidePopup / UG_NobehaviorGuidePopup: 功能引导
 * - UG_PaidItemExpireNotice: 付费到期提醒
 */

const AD_KEYS = [
    "AD_Interstitial",
    "AD_Points",
    "UG_Startup_flex",
    "UG_Startup_flex_v1",
    "UG_SurpriseGiftDialog",
    "UG_Cashpopup",
    "UG_NOTICE_GLOBAL_POPUP",
    "UG_PushGuideUpdate"
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
