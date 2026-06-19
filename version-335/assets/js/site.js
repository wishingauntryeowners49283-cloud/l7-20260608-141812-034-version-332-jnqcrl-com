(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuToggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                var isOpen = mobileNav.classList.toggle("is-open");
                menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        }

        document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
            var prev = slider.querySelector("[data-hero-prev]");
            var next = slider.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    start();
                });
            });
            slider.addEventListener("mouseenter", stop);
            slider.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var input = scope.querySelector("[data-search-input]");
            var genre = scope.querySelector("[data-genre-select]");
            var year = scope.querySelector("[data-year-select]");
            var grid = scope.nextElementSibling;
            if (!grid || !grid.matches("[data-movie-grid]")) {
                grid = document.querySelector("[data-movie-grid]");
            }
            var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]")) : [];

            function normalize(value) {
                return String(value || "").toLowerCase().trim();
            }

            function applyFilter() {
                var query = normalize(input && input.value);
                var genreValue = normalize(genre && genre.value);
                var yearValue = normalize(year && year.value);
                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year"),
                        card.textContent
                    ].join(" "));
                    var okQuery = !query || haystack.indexOf(query) !== -1;
                    var okGenre = !genreValue || normalize(card.getAttribute("data-genre")).indexOf(genreValue) !== -1;
                    var okYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
                    card.style.display = okQuery && okGenre && okYear ? "" : "none";
                });
            }

            [input, genre, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilter);
                    control.addEventListener("change", applyFilter);
                }
            });
        });
    });
})();

function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var cover = document.getElementById(options.coverId);
    var loaded = false;
    var hlsInstance = null;

    if (!video || !cover || !options.url) {
        return;
    }

    function attachStream() {
        if (loaded) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = options.url;
            loaded = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls();
            hlsInstance.loadSource(options.url);
            hlsInstance.attachMedia(video);
            loaded = true;
            return;
        }
        video.src = options.url;
        loaded = true;
    }

    function play() {
        attachStream();
        cover.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    cover.addEventListener("click", play);
    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener("ended", function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
            hlsInstance.stopLoad();
        }
    });
}
