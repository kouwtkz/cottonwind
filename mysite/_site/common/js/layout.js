window.addEventListener("DOMContentLoaded", () => {
    var hcls = document.documentElement.classList;
    document.querySelectorAll(".MenuButton").forEach((elm) => {
        elm.addEventListener("click", (e) => {
            hcls.toggle("naviMenu_open");
            hcls.remove("naviMenu_change");
            if (hcls.contains("naviMenu_open")) {
                hcls.remove("naviMenu_leave");
            } else {
                hcls.add("naviMenu_leave");
            }
        });
    });
    document.querySelectorAll("header a").forEach((elm) => {
        elm.addEventListener("click", (e) => {
            if (hcls.contains("naviMenu_open")) {
                hcls.add("naviMenu_change");
            }
            hcls.remove("naviMenu_open");
        });
    });
    document.querySelector(".menuExit").addEventListener("click", (e) => {
        hcls.remove("naviMenu_open");
        hcls.add("naviMenu_leave");
    });
    const toTop = document.querySelector(".toTop");
    const borderToTop = 700;
    toTop.addEventListener("click", (e) => {
        gsap.to(window, {
            scrollTo: 0,
            ease: "power1.inout",
        });
    });
    let toTopVision = false;
    document.addEventListener("scroll", (e) => {
        if (!toTopVision && scrollY > borderToTop) {
            gsap.to(toTop, {
                autoAlpha: 1,
                duration: 0.1,
                ease: "power1.inout",
            });
            toTopVision = true;
        } else if (toTopVision && scrollY <= borderToTop) {
            gsap.to(toTop, {
                autoAlpha: 0,
                duration: 0.1,
                ease: "power1.inout",
            });
            toTopVision = false;
        }
    })
});
