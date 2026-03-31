document.addEventListener("DOMContentLoaded", function () {
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    const previewArea = document.getElementById('preview-area');
    if (!previewArea) return;

    const hoverTriggers = document.querySelectorAll('.hover-trigger');
    if (!hoverTriggers.length) return;

    // Build preview DOM
    const previewContent = document.createElement('div');
    previewContent.className = 'preview-content';
    previewArea.appendChild(previewContent);

    const container = document.createElement('div');
    container.className = 'video-responsive';
    previewContent.appendChild(container);

    let videoElement = null;
    let currentVideoSrc = null;
    let isMobileView = window.innerWidth < 992;
    let activeLink = null;

    function checkViewport() {
        isMobileView = window.innerWidth < 992;
    }

    function showPreview(trigger) {
        const url = trigger.dataset.videoSrc;
        if (!url) return;

        previewArea.classList.add('loading');

        if (currentVideoSrc !== url) {
            if (videoElement) {
                videoElement.pause();
                videoElement.remove();
                videoElement = null;
            }

            videoElement = document.createElement('video');
            videoElement.playsInline = true;
            videoElement.loop = true;
            videoElement.muted = true;
            videoElement.style.cssText = 'width:100%;height:100%;object-fit:cover;visibility:hidden;position:absolute;top:0;left:0;';
            videoElement.src = url;

            videoElement.addEventListener('loadeddata', () => {
                videoElement.style.visibility = 'visible';
                previewArea.classList.remove('loading');
            });
            videoElement.addEventListener('error', () => previewArea.classList.remove('loading'));

            container.appendChild(videoElement);
            currentVideoSrc = url;
        } else if (videoElement) {
            videoElement.style.visibility = 'visible';
            previewArea.classList.remove('loading');
        }

        videoElement.play().catch(() => previewArea.classList.remove('loading'));
        previewContent.classList.add('active');

        // Track active link for styling
        if (activeLink) activeLink.classList.remove('active');
        trigger.classList.add('active');
        activeLink = trigger;
    }

    function hidePreview() {
        previewContent.classList.remove('active');
        if (videoElement) {
            videoElement.pause();
            videoElement.style.visibility = 'hidden';
        }
        previewArea.classList.remove('loading');

        // Remove active state from link
        if (activeLink) {
            activeLink.classList.remove('active');
            activeLink = null;
        }
    }

    hoverTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function () {
            if (isMobileView) return;
            showPreview(this);
        });

        trigger.addEventListener('mouseleave', function () {
            if (isMobileView) return;
            hidePreview();
        });
    });

    window.addEventListener('resize', debounce(checkViewport, 150));
    checkViewport();
});
