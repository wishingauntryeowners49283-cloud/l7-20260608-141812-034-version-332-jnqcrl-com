(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupHeader() {
    var header = document.querySelector('.site-header');
    if (!header) {
      return;
    }
    var toggle = function () {
      if (window.scrollY > 20 || header.getAttribute('data-home') !== 'true') {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
  }

  function setupMobileMenu() {
    var header = document.querySelector('.site-header');
    var button = document.querySelector('.mobile-toggle');
    if (!header || !button) {
      return;
    }
    button.addEventListener('click', function () {
      var opened = header.classList.toggle('mobile-open');
      button.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var prev = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        schedule();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        schedule();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide-to') || 0));
        schedule();
      });
    });
    schedule();
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupCatalogFilters() {
    var grids = Array.prototype.slice.call(document.querySelectorAll('.filter-grid'));
    if (!grids.length) {
      return;
    }
    var searchInput = document.querySelector('.catalog-search');
    var yearSelect = document.querySelector('.catalog-year');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && searchInput) {
      searchInput.value = query;
    }

    function apply() {
      var keyword = normalize(searchInput ? searchInput.value : '');
      var year = yearSelect ? yearSelect.value : '';
      grids.forEach(function (grid) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var cardYear = card.getAttribute('data-year') || '';
          var visible = (!keyword || haystack.indexOf(keyword) !== -1) && (!year || cardYear.indexOf(year) !== -1);
          card.classList.toggle('is-hidden', !visible);
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    apply();
  }

  window.setupMoviePlayer = function (videoId, playId, streamUrl) {
    var video = document.getElementById(videoId);
    var playButton = document.getElementById(playId);
    if (!video || !playButton || !streamUrl) {
      return;
    }
    var hls = null;
    var loaded = false;

    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      load();
      playButton.classList.add('is-hidden');
      var result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {
          playButton.classList.remove('is-hidden');
        });
      }
    }

    playButton.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      playButton.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        playButton.classList.remove('is-hidden');
      }
    });
    video.addEventListener('ended', function () {
      playButton.classList.remove('is-hidden');
    });
    load();
  };

  ready(function () {
    setupHeader();
    setupMobileMenu();
    setupHero();
    setupCatalogFilters();
  });
})();
