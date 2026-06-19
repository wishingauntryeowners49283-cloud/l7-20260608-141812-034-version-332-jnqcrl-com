(function () {
    function attachStream(video, stream) {
        if (video.dataset.ready === '1') {
            return Promise.resolve();
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            video.dataset.ready = '1';
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            return new Promise(function (resolve) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                video.hlsController = hls;
                video.dataset.ready = '1';
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    resolve();
                });
                window.setTimeout(resolve, 1200);
            });
        }
        video.src = stream;
        video.dataset.ready = '1';
        return Promise.resolve();
    }

    window.initializeMoviePlayer = function (shell, stream) {
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-overlay');
        if (!video || !button || !stream) {
            return;
        }

        function start() {
            shell.classList.add('is-loading');
            attachStream(video, stream).then(function () {
                button.classList.add('is-hidden');
                shell.classList.add('is-playing');
                video.controls = true;
                var playRequest = video.play();
                if (playRequest && typeof playRequest.catch === 'function') {
                    playRequest.catch(function () {
                        button.classList.remove('is-hidden');
                        shell.classList.remove('is-playing');
                    });
                }
            }).finally(function () {
                shell.classList.remove('is-loading');
            });
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
    };
})();
