(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = document.body.classList.toggle('menu-open');
            button.setAttribute('aria-expanded', String(open));
            panel.setAttribute('aria-hidden', String(!open));
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('active', itemIndex === index);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('active', itemIndex === index);
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

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = Number(dot.getAttribute('data-hero-dot') || 0);
                show(next);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function textOf(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-category') || '',
            card.textContent || ''
        ].join(' ').toLowerCase();
    }

    function initFilters() {
        var filterInput = document.querySelector('.js-filter-input');
        var list = document.querySelector('[data-filter-list]');
        if (!filterInput || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var activeTag = '';
        var yearSelect = document.querySelector('.js-filter-year');
        var typeSelect = document.querySelector('.js-filter-type');
        var categorySelect = document.querySelector('.js-filter-category');
        if (query) {
            filterInput.value = query;
        }

        function apply() {
            var keyword = (filterInput.value || '').trim().toLowerCase();
            var year = yearSelect ? yearSelect.value : '';
            var type = typeSelect ? typeSelect.value : '';
            var category = categorySelect ? categorySelect.value : '';
            cards.forEach(function (card) {
                var haystack = textOf(card);
                var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchedTag = !activeTag || haystack.indexOf(activeTag.toLowerCase()) !== -1;
                var matchedYear = !year || card.getAttribute('data-year') === year;
                var matchedType = !type || card.getAttribute('data-type') === type;
                var matchedCategory = !category || card.getAttribute('data-category') === category;
                card.classList.toggle('is-hidden', !(matchedKeyword && matchedTag && matchedYear && matchedType && matchedCategory));
            });
        }

        filterInput.addEventListener('input', apply);
        [yearSelect, typeSelect, categorySelect].forEach(function (select) {
            if (select) {
                select.addEventListener('change', apply);
            }
        });
        Array.prototype.slice.call(document.querySelectorAll('[data-filter-tag]')).forEach(function (button) {
            button.addEventListener('click', function () {
                activeTag = button.getAttribute('data-filter-tag') || '';
                Array.prototype.slice.call(document.querySelectorAll('[data-filter-tag]')).forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
        apply();
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
