/**
 * Soul 广告 API 伪装 v1.0
 * /api/ad/* 返回「无广告策略」响应，避免客户端走 SDK 填充
 */
const url = $request.url;
let payload = {
    code: 10001,
    success: true,
    message: "success",
    data: {
        enable: false,
        adSwitch: false,
        open: false,
        adList: [],
        slotList: [],
        strategyList: [],
        biddingList: [],
        preloadList: [],
        configList: [],
        slotFreqConfigMap: {},
        plSlotInfo: null
    }
};

if (url.includes("strategyApi")) {
    payload.data.strategy = { enable: false, slots: [] };
}

$done({ body: JSON.stringify(payload) });
