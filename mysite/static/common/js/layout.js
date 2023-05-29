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
});
