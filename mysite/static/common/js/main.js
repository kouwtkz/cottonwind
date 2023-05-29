function testElm(elm = document) {
    elm.querySelectorAll(`[data-test-elm-write]`).forEach((e) => {
        var str = e.dataset.testElmWrite;
        var m = str.match(/\s*([^:\s]+)\s*\:?\s*(\S*)/);
        switch (m[1].toLowerCase()) {
            case "get":
                e.innerHTML = m[2].match(/^(|all)$/)
                    ? JSON.stringify($GET)
                    : $GET[m[2]];
                break;
            default:
                console.log(m);
                break;
        }
    });
}
testElm();
function galleryLightBox() {
    document.querySelector(`[property="og:title"]`).content = "てすと";
}
function settingElm(elm = document) {
    elm.querySelectorAll(`[data-setting-cookie-enable]`).forEach((e) => {
        e.innerHTML = `<input type="checkbox" onclick="$COOKIE.outEnable=!$COOKIE.outEnable; this.checked = $COOKIE.outEnable;" ${
            $COOKIE.outEnable ? "checked" : ""
        } />`;
    });
    elm.querySelectorAll(`[data-setting-analytics-ignore]`).forEach((e) => {
        e.innerHTML = `<input type="checkbox" onclick="$COOKIE.toggle({key:'analytics-ignore'}); this.checked = toBoolean($COOKIE['analytics-ignore']);" ${
            toBoolean($COOKIE["analytics-ignore"]) ? "checked" : ""
        } />`;
    });
}
settingElm();
