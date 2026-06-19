(function () {
    var mobileButton = document.querySelector('[data-mobile-menu]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-nav-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var query = input ? input.value.trim() : '';
            var target = 'search.html';
            if (query) {
                target += '?q=' + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        hero.querySelectorAll('[data-hero-prev]').forEach(function (button) {
            button.addEventListener('click', function () {
                showSlide(current - 1);
                startTimer();
            });
        });

        hero.querySelectorAll('[data-hero-next]').forEach(function (button) {
            button.addEventListener('click', function () {
                showSlide(current + 1);
                startTimer();
            });
        });

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startTimer();
            });
        });

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    var filterForm = document.querySelector('[data-filter-form]');
    var filterCards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!filterForm || !filterCards.length) {
            return;
        }

        var keywordField = filterForm.querySelector('[name="keyword"]');
        var regionField = filterForm.querySelector('[name="region"]');
        var typeField = filterForm.querySelector('[name="type"]');
        var yearField = filterForm.querySelector('[name="year"]');
        var keyword = normalize(keywordField && keywordField.value);
        var region = normalize(regionField && regionField.value);
        var type = normalize(typeField && typeField.value);
        var year = normalize(yearField && yearField.value);
        var visible = 0;

        filterCards.forEach(function (card) {
            var haystack = normalize(card.getAttribute('data-search'));
            var cardRegion = normalize(card.getAttribute('data-region'));
            var cardType = normalize(card.getAttribute('data-type'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var ok = true;

            if (keyword && haystack.indexOf(keyword) === -1) {
                ok = false;
            }
            if (region && cardRegion.indexOf(region) === -1) {
                ok = false;
            }
            if (type && cardType.indexOf(type) === -1) {
                ok = false;
            }
            if (year && cardYear !== year) {
                ok = false;
            }

            card.classList.toggle('hidden-by-filter', !ok);
            if (ok) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle('is-visible', visible === 0);
        }
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });
        filterForm.querySelectorAll('input, select').forEach(function (field) {
            field.addEventListener('input', applyFilters);
            field.addEventListener('change', applyFilters);
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            var keywordField = filterForm.querySelector('[name="keyword"]');
            if (keywordField) {
                keywordField.value = q;
            }
        }
        applyFilters();
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var url = player.getAttribute('data-video-url');
        var hlsInstance = null;

        function loadVideo() {
            if (!video || !url || video.getAttribute('data-ready') === 'yes') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
            } else {
                video.src = url;
            }

            video.setAttribute('data-ready', 'yes');
        }

        function beginPlay() {
            loadVideo();
            player.classList.add('is-playing');
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', beginPlay);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    beginPlay();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.currentTime) {
                    player.classList.remove('is-playing');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        }, { once: true });
    });
})();
