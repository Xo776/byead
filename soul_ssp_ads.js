/**
 * Soul SSP 广告阻断 v2.1
 * 返回无竞价结果，SSP/SDK 无法拿到广告素材
 */
$done({
    body: JSON.stringify({
        code: 10001,
        success: true,
        message: "no fill",
        data: null,
        ads: [],
        bidResult: [],
        list: []
    })
});
