// Lazy load and autoplay videos only when visible in viewport
// Supports both regular MP4 and HLS (.m3u8) streaming
document.addEventListener('DOMContentLoaded', function() {
    const videos = document.querySelectorAll('video[data-autoplay]');

    if (!videos.length) return;

    const hlsInstances = []; // Track HLS instances for cleanup

    // Initialize HLS for a video element if needed
    function initializeVideo(video) {
        if (video._initialized) return;
        video._initialized = true;

        const source = video.querySelector('source');
        if (!source) return;

        const videoSrc = source.src;

        // Add animation class when video has loaded enough data
        video.addEventListener('loadeddata', () => {
            video.classList.add('video-loaded');
        }, { once: true });

        // Check if it's an HLS stream (.m3u8)
        if (videoSrc.includes('.m3u8')) {
            if (Hls.isSupported()) {
                const hls = new Hls({
                    autoStartLoad: true,
                    capLevelToPlayerSize: true
                });
                hls.loadSource(videoSrc);
                hls.attachMedia(video);

                hls.on(Hls.Events.ERROR, function(event, data) {
                    if (data.fatal) {
                        console.error('HLS error:', data.type, data.details);
                    }
                });

                video._hls = hls;
                hlsInstances.push(hls);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Native HLS support (Safari)
                video.src = videoSrc;
            }
        } else {
            // Regular MP4 - just set the src
            video.src = videoSrc;
        }
    }

    // Create Intersection Observer
    const observerOptions = {
        root: null, // viewport
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.25 // 25% of video must be visible
    };

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;

            if (entry.isIntersecting) {
                // Initialize video when it enters viewport
                if (!video._initialized) {
                    initializeVideo(video);
                }

                // Play video when visible
                if (video.paused) {
                    video.play().catch(err => {
                        console.debug('Autoplay prevented:', err);
                    });
                }
            } else {
                // Video left viewport - pause it to save resources
                if (!video.paused) {
                    video.pause();
                }

                // Stop HLS loading when out of view
                if (video._hls) {
                    video._hls.stopLoad();
                }
            }
        });
    }, observerOptions);

    // Observe all videos
    videos.forEach(video => {
        // Remove autoplay attribute to prevent immediate playback
        video.removeAttribute('autoplay');

        // Change preload to "none" for better initial load performance
        video.setAttribute('preload', 'none');

        // Don't set src yet - will be set by initializeVideo when visible
        video.removeAttribute('src');

        videoObserver.observe(video);
    });

    // Cleanup observer and HLS instances on page unload
    function cleanup() {
        videoObserver.disconnect();
        hlsInstances.forEach(hls => {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
        hlsInstances.length = 0;
    }

    window.addEventListener('beforeunload', cleanup);
    window.addEventListener('pagehide', cleanup);
});
