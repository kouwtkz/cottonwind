function updatePage(container = document, trigger = "") {
    if (trigger !== "popstate") {
        Object.getPrototypeOf($GET).update();
    }
    testElm(container);
    settingElm(container);
    allCurrentHrefDelete(container);
    audio_setlist(container);
}
function currentHrefDelete(e) {
    if (e.currentTarget.href === window.location.href) {
        e.preventDefault();
        e.stopPropagation();
        return;
    }
}
function allCurrentHrefDelete(doc = document) {
    doc.querySelectorAll(`a[href]`).forEach((l) => {
        var attrHref = l.getAttribute("href");
        if (!attrHref.match(/^\w+:\/\//)) {
            if (
                attrHref
                    .match(/^[^?#]*/)[0]
                    .match(/[^/]*$/)[0]
                    .match(/^[^.]+$/)
            ) {
                l.href = `${attrHref}/`;
            }
        }
        l.addEventListener("click", (e) => currentHrefDelete(e));
    });
}
window.addEventListener("DOMContentLoaded", () => {
    allCurrentHrefDelete();
    if (!window.sectionTable) window.sectionTable = {};
    const g_ccgs = { width: 0, pHeight: 0 };
    const g_ncgs = { width: 0, pHeight: 0 };
    const g_y = { from: 0, to: 0 };
    let hasFadeDisable = false;

    barba.init({
        timeout: 10000,
        preventRunning: true,
        prevent: ({ el, event }) => {
            if (event.type === "click") {
                g_y.to = 0;
                if (el.dataset.barbaFadeDisable !== undefined) {
                    hasFadeDisable = el.dataset.barbaFadeDisable;
                } else {
                    hasFadeDisable = false;
                }
                if (el.dataset.barbaToY) {
                    const groupEl = document.querySelector(el.dataset.barbaToY);
                    if (groupEl) {
                        g_y.to = window.scrollY - groupEl.offsetTop;
                        if (g_y.to < 0) {
                            g_y.to = 0;
                        } else {
                            hasFadeDisable = true;
                        }
                    }
                }
                return el.classList && el.classList.contains("no-barba");
            } else {
                return true;
            }
        },
        requestError: (trigger, action, url, response) => {
            if (response.statusText.match(/timeout/i)) {
                location.href = url;
                console.log(url);
                return false;
            }
        },
        transitions: [
            {
                sync: true,
                name: "opacity-transition",
                beforeLeave(data) {
                    const cc = data.current.container;
                    const nc = data.next.container;
                    nc.style.display = "none";
                    g_ccgs.width = getComputedStyle(cc).width;
                    g_ccgs.pHeight = getComputedStyle(cc.parentElement).height;
                    g_y.from = window.scrollY;
                },
                leave(data) {
                    const selected = document.querySelector(`.navi.selected`);
                    if (selected) {
                        selected.classList.remove("selected");
                    }
                    if (location.pathname !== "/") {
                        let get_section =
                            `/${data.next.container.dataset.topmenu}` ||
                            "location.pathname.match(/.[^/]*/)[0]";
                        let checkSection = sectionTable[get_section.slice(1)];
                        if (checkSection) get_section = `/${checkSection}`;
                        const new_selected = document.querySelector(
                            `[href^="${get_section}/"] .navi`
                        );
                        if (new_selected) {
                            new_selected.classList.add("selected");
                        }
                    }
                },
                beforeEnter(data) {
                    const cc = data.current.container;
                    const nc = data.next.container;
                    const ccs = cc.style;
                    const ncs = nc.style;
                    ccs.display = "none";
                    ncs.display = "";
                    g_ncgs.width = getComputedStyle(nc).width;
                    g_ncgs.pHeight = getComputedStyle(nc.parentElement).height;
                    ncs.display = "none";
                    ccs.display = "";
                    window.scrollTo({ top: g_y.from });
                    if (typeof twemoji !== "undefined") {
                        twemoji.parse(data.next.container);
                    }
                    updatePage(data.next.container, data.trigger);
                },
                enter(data) {
                    const cc = data.current.container;
                    const nc = data.next.container;
                    const ccs = cc.style;
                    const ncs = nc.style;
                    const pem = cc.parentElement;
                    ncs.display = "";
                    switch (data.trigger) {
                        case "back":
                        case "forward":
                        case "popstate":
                            ccs.display = "none";
                            break;
                        default:
                            pem.style.height = g_ccgs.pHeight;
                            ccs.width = g_ccgs.width;
                            ccs.position = "absolute";
                            ncs.width = g_ncgs.width;
                            ncs.position = "absolute";
                            // pem.style.overflow = "hidden";
                            if (
                                !hasFadeDisable &&
                                data.current.url.path !== data.next.url.path
                            ) {
                                gsap.to(cc, {
                                    opacity: 0,
                                    delay: 0.05,
                                    duration: 0.2,
                                    ease: "power1.inout",
                                });
                                gsap.from(nc, {
                                    opacity: 0,
                                    delay: 0.1,
                                    duration: 0.2,
                                    ease: "power1.inout",
                                });
                            } else {
                                ccs.display = "none";
                            }
                            scrollDD = {
                                delay: 0.05,
                                duration: 0.25,
                            };
                            gsap.fromTo(
                                window,
                                { scrollTo: g_y.from },
                                { ...{ scrollTo: g_y.to }, ...scrollDD }
                            );
                            gsap.fromTo(
                                cc,
                                { y: 0 },
                                { ...{ y: g_y.to - g_y.from }, ...scrollDD }
                            );
                            gsap.fromTo(
                                nc,
                                { y: g_y.from - g_y.to },
                                { ...{ y: 0 }, ...scrollDD }
                            );
                            return gsap.fromTo(
                                pem,
                                {
                                    height: g_ccgs.pHeight,
                                },
                                {
                                    delay: 0.1,
                                    duration: 0.2,
                                    height: g_ncgs.pHeight,
                                    onComplete: function () {
                                        this._pt.t.style.height = "";
                                        this._pt.t.style.overflow = "";
                                        ccs.display = "none";
                                        ncs.width = "";
                                        ncs.position = "";
                                    },
                                }
                            );
                    }
                },
            },
        ],
    });
});
