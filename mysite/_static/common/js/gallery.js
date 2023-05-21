window.addEventListener("DOMContentLoaded", () => {
    var lightbox = document.querySelector(".lightbox");
    var preview_img = lightbox.querySelector(".preview img.viewer");
    var loading_img = lightbox.querySelector(".preview img.loading");
    var preview_imgLink = lightbox.querySelector(".preview a.link");
    var preview_text = lightbox.querySelector(".preview_text");
    var preview_title = preview_text.querySelector(".title");
    var preview_description = preview_text.querySelector(".description");
    var preview_date = preview_text.querySelector(".date");
    var preview_link = preview_text.querySelector(".link a");
    var lightboxSync = (anim = true) => {
        if (location.hash !== "") {
            document.body.classList.add("showLightbox");
            var targetImg = document.querySelector(`a[href="${location.hash}"] img`);
            var img_src = decodeURI(decodeURIComponent(location.hash)).slice(1);
            preview_img.src = targetImg.src;
            loading_img.src = img_src;
            preview_img.alt = targetImg.alt;
            preview_img.classList.add("nowloading");
            preview_title.innerHTML = targetImg.dataset.title;
            preview_description.innerHTML = targetImg.dataset.description;
            preview_date.innerHTML = targetImg.dataset.date;
            preview_link.href = targetImg.dataset.link;
            preview_link.innerHTML = targetImg.dataset.link;
            preview_imgLink.href = preview_link.innerHTML || loading_img.src;
            preview_imgLink.target = "_blank";
            if (typeof twemoji !== "undefined") {
                twemoji.parse(preview_text);
            }
            if (anim) {
                gsap.fromTo(
                    ".lightbox .window",
                    { opacity: 0, scale: 0.95 },
                    { opacity: 1, delay: 0.05, duration: 0.25, scale: 1 }
                );
                gsap.fromTo(
                    ".lightbox",
                    { opacity: 0 },
                    { opacity: 1, delay: 0.02, duration: 0.28 }
                );
            }
        } else {
            if (document.body.classList.contains("showLightbox")) {
                if (anim) {
                    gsap.fromTo(
                        ".lightbox .window",
                        { opacity: 1, scale: 1 },
                        { opacity: 0, scale: 0.95, duration: 0.20 },
                    );
                    gsap.fromTo(
                        ".lightbox",
                        { opacity: 1 },
                        {
                            opacity: 0, duration: 0.20,
                            onComplete: () => {
                                document.body.classList.remove("showLightbox");
                            }
                        }
                    );
                } else {
                    document.body.classList.remove("showLightbox");
                }
            }
        }
    };
    var lightboxBackAction = () => {
        if (history.state === null) {
            history.back();
        } else {
            location.hash = "";
            history.replaceState(null, null, location.pathname);
        }
    };
    document.querySelector(".lightbox").addEventListener("click", (e) => {
        if (e.target.classList.contains("lightbox")) {
            lightboxBackAction();
        }
    });
    loading_img.addEventListener("load", (e) => {
        preview_img.src = loading_img.src;
        loading_img.src = "";
        preview_img.classList.remove("nowloading");
    });
    window.addEventListener("hashchange", (e) => {
        lightboxSync();
    });
    lightboxSync(false);
});
