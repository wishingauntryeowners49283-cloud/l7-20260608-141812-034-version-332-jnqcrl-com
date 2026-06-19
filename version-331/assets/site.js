(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var toggle = qs("[data-mobile-toggle]");
        var panel = qs("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHeroSlider() {
        var slider = qs("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = qsa("[data-hero-slide]", slider);
        var dots = qsa("[data-hero-dot]", slider);
        var prev = qs("[data-hero-prev]", slider);
        var next = qs("[data-hero-next]", slider);
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        show(0);
        restart();
    }

    function setupFilters() {
        qsa(".library-section").forEach(function (section) {
            var box = qs(".filter-box", section);
            if (!box) {
                return;
            }
            var input = qs("[data-filter-search]", box);
            var year = qs("[data-filter-year]", box);
            var type = qs("[data-filter-type]", box);
            var cards = qsa("[data-movie-card]", section);

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-title") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var visible = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        visible = false;
                    }
                    if (selectedYear && cardYear.indexOf(selectedYear) === -1) {
                        visible = false;
                    }
                    if (selectedType && cardType.indexOf(selectedType) === -1) {
                        visible = false;
                    }
                    card.classList.toggle("is-hidden", !visible);
                });
            }

            [input, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function setupMoviePlayer() {
        var player = qs("[data-movie-player]");
        if (!player) {
            return;
        }
        var video = qs("video", player);
        var cover = qs("[data-play-button]", player);
        var sourceElement = video ? qs("source", video) : null;
        var stream = sourceElement ? sourceElement.getAttribute("src") : "";
        var attached = false;

        function attach() {
            if (!video || !stream || attached) {
                return;
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.load();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }
            video.src = stream;
            video.load();
        }

        function start() {
            attach();
            player.classList.add("is-playing");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    player.classList.remove("is-playing");
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
        setupMoviePlayer();
    });
})();
