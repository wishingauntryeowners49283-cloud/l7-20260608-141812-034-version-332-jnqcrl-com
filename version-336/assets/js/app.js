(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setHeaderState() {
        var header = document.querySelector("[data-header]");
        if (!header) {
            return;
        }
        if (window.scrollY > 18 || document.body.classList.contains("force-solid-header")) {
            header.classList.add("is-scrolled");
        } else {
            header.classList.remove("is-scrolled");
        }
    }

    function bootMenu() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        if (!header || !toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = header.classList.toggle("is-open");
            document.body.classList.toggle("menu-open", open);
        });
    }

    function bootHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dotsWrap = hero.querySelector("[data-hero-dots]");
        var dots = dotsWrap ? Array.prototype.slice.call(dotsWrap.querySelectorAll("button")) : [];
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalized(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function bootSearch() {
        var input = document.querySelector("[data-site-search]");
        var yearFilter = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        if (!cards.length) {
            return;
        }

        function filterCards() {
            var keyword = normalized(input ? input.value : "");
            var year = yearFilter ? yearFilter.value : "";
            cards.forEach(function (card) {
                var haystack = normalized([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-year")
                ].join(" "));
                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchYear = !year || card.getAttribute("data-year") === year;
                card.classList.toggle("is-hidden", !(matchKeyword && matchYear));
            });
        }

        if (input) {
            input.addEventListener("input", filterCards);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", filterCards);
        }
        filterCards();
    }

    window.bootPlayer = function (videoUrl) {
        var video = document.querySelector("[data-player]");
        var cover = document.querySelector("[data-player-cover]");
        if (!video || !videoUrl) {
            return;
        }
        var started = false;
        var hlsInstance = null;

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function loadVideo() {
            if (started) {
                playVideo();
                return;
            }
            started = true;
            if (cover) {
                cover.hidden = true;
            }
            video.controls = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
            } else {
                video.src = videoUrl;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
            }
        }

        if (cover) {
            cover.addEventListener("click", loadVideo);
        }
        video.addEventListener("click", function () {
            if (!started) {
                loadVideo();
            } else if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setHeaderState();
        bootMenu();
        bootHero();
        bootSearch();
        window.addEventListener("scroll", setHeaderState, { passive: true });
    });
})();
