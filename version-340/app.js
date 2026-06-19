(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function show(next) {
        if (!slides.length) {
          return;
        }
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === index);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });

      setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    document.querySelectorAll("[data-filter-area]").forEach(function (area) {
      var panel = area.querySelector("[data-filter-panel]") || document.querySelector("[data-filter-panel]");
      var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));

      if (!panel || !cards.length) {
        return;
      }

      function apply() {
        var keyword = text((panel.querySelector("[data-filter='keyword']") || {}).value);
        var year = text((panel.querySelector("[data-filter='year']") || {}).value);
        var region = text((panel.querySelector("[data-filter='region']") || {}).value);
        var category = text((panel.querySelector("[data-filter='category']") || {}).value);

        cards.forEach(function (card) {
          var haystack = text([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-type")
          ].join(" "));
          var ok = true;

          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (year && text(card.getAttribute("data-year")) !== year) {
            ok = false;
          }
          if (region && text(card.getAttribute("data-region")).indexOf(region) === -1) {
            ok = false;
          }
          if (category && text(card.getAttribute("data-category")) !== category) {
            ok = false;
          }

          card.classList.toggle("is-hidden", !ok);
        });
      }

      panel.querySelectorAll("input, select").forEach(function (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });
    });

    var player = document.querySelector("[data-player]");

    if (player) {
      var video = player.querySelector("[data-player-video]");
      var button = player.querySelector("[data-player-button]");
      var status = player.querySelector("[data-player-status]");
      var hlsInstance = null;
      var attached = false;

      function setStatus(message) {
        if (status) {
          status.textContent = message || "";
        }
      }

      function attach() {
        if (!video || attached) {
          return;
        }

        var stream = video.getAttribute("data-stream");

        if (!stream) {
          setStatus("播放源暂不可用");
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          attached = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("播放连接异常，请稍后重试");
              if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
              }
              attached = false;
            }
          });
          attached = true;
        } else {
          video.src = stream;
          attached = true;
        }
      }

      function start() {
        attach();
        if (!video) {
          return;
        }
        var playResult = video.play();
        if (playResult && playResult.catch) {
          playResult.catch(function () {
            setStatus("请点击视频控件继续播放");
          });
        }
        if (button) {
          button.classList.add("is-hidden");
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("play", function () {
          if (button) {
            button.classList.add("is-hidden");
          }
          setStatus("");
        });
        video.addEventListener("pause", function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    }
  });
})();
