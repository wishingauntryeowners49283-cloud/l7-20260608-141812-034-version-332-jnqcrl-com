(function () {
    var body = document.body;
    var menuToggle = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
            body.classList.toggle('menu-open', mobilePanel.classList.contains('open'));
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === index);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener('click', function () {
                showSlide(itemIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        startTimer();
    }

    var filterScope = document.querySelector('[data-filter-scope]');

    if (filterScope) {
        var input = filterScope.querySelector('.local-filter');
        var select = filterScope.querySelector('.sort-select');
        var list = filterScope.querySelector('.category-list');
        var cards = Array.prototype.slice.call(filterScope.querySelectorAll('.video-card'));

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                var text = ((card.dataset.title || '') + ' ' + (card.dataset.tags || '')).toLowerCase();
                card.classList.toggle('hidden-card', keyword && text.indexOf(keyword) === -1);
            });
        }

        function applySort() {
            if (!select || !list) {
                return;
            }

            var value = select.value;
            var sorted = cards.slice();

            if (value === 'year') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
            }

            if (value === 'views') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
                });
            }

            if (value === 'likes') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.likes || 0) - Number(a.dataset.likes || 0);
                });
            }

            sorted.forEach(function (card) {
                list.appendChild(card);
            });
            applyFilter();
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (select) {
            select.addEventListener('change', applySort);
        }
    }

    var player = document.querySelector('[data-video-player]');

    if (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.video-start');
        var src = player.getAttribute('data-video-url');
        var hlsInstance = null;

        function loadVideo() {
            if (!video || video.dataset.ready === '1' || !src) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
            } else {
                video.src = src;
            }

            video.dataset.ready = '1';
        }

        function beginPlay() {
            loadVideo();
            if (!video) {
                return;
            }

            var result = video.play();
            player.classList.add('is-playing');

            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    player.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', beginPlay);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    beginPlay();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                player.classList.remove('is-playing');
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    var searchPage = document.querySelector('[data-search-page]');

    if (searchPage && window.__VIDEO_INDEX) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var searchInput = document.getElementById('searchInput');
        var searchTitle = document.getElementById('searchTitle');
        var searchResults = document.getElementById('searchResults');

        if (searchInput) {
            searchInput.value = query;
        }

        function makeCard(item) {
            var tags = (item.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '<article class="video-card">' +
                '<a href="' + item.url + '" aria-label="' + escapeHtml(item.title) + '">' +
                '<div class="poster">' +
                '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                '<span class="duration">' + escapeHtml(item.duration) + '</span>' +
                '<span class="play-badge">▶</span>' +
                '</div>' +
                '<div class="card-body">' +
                '<div class="tag-line">' + tags + '</div>' +
                '<h2>' + escapeHtml(item.title) + '</h2>' +
                '<p>' + escapeHtml(item.oneLine) + '</p>' +
                '<div class="card-meta"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.category) + '</span></div>' +
                '</div>' +
                '</a>' +
                '</article>';
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function runSearch() {
            if (!query.trim()) {
                if (searchTitle) {
                    searchTitle.innerHTML = '<h2>热门搜索入口</h2><p>输入关键词即可浏览匹配的高清影视内容。</p>';
                }
                if (searchResults) {
                    searchResults.innerHTML = window.__VIDEO_INDEX.slice(0, 24).map(makeCard).join('');
                }
                return;
            }

            var q = query.trim().toLowerCase();
            var matched = window.__VIDEO_INDEX.filter(function (item) {
                var text = [item.title, item.oneLine, item.category, item.region, item.type, item.year, item.genre].concat(item.tags || []).join(' ').toLowerCase();
                return text.indexOf(q) !== -1;
            }).slice(0, 120);

            if (searchTitle) {
                searchTitle.innerHTML = '<h2>搜索结果</h2><p>关键词：' + escapeHtml(query) + '</p>';
            }

            if (searchResults) {
                searchResults.innerHTML = matched.length ? matched.map(makeCard).join('') : '<div class="text-panel"><h2>未找到匹配内容</h2><p>可以尝试更换关键词，或返回分类页面继续浏览。</p></div>';
            }
        }

        runSearch();
    }
}());
