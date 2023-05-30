if (
    "userAgentData" in navigator
        ? navigator.userAgentData.mobile
        : navigator.userAgent.match(/android|mobile/i)
) {
    document.documentElement.classList.add("mobile");
}
function convertAbsUrl(relativePath) {
    var anchor = document.createElement("a");
    anchor.href = relativePath;
    return anchor.href;
}
