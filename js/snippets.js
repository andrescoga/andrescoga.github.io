document.addEventListener('DOMContentLoaded', function() {
    let lazyLoadObserver = null;
    
    // Structure with 13 snippets.
    // Set posterSrc to null if you want to rely purely on the "First Frame" method.
    // Featured snippets (4, 5, 7) auto-play on page load
    const snippetsData = [
        { id: 'snippet-1', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/1ce078aa-bfb1-4990-81f5-d6083ecf14f7/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-2', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/f7738e9c-e468-436b-9f0e-2a8753fae950/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-3', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/7d29d4ec-01d8-4bb5-bbc4-266d6ccfda81/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-4', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/fcd3e55e-e9a0-42b5-aff9-6d415e394134/playlist.m3u8', posterSrc: null, featured: true },
        { id: 'snippet-5', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/fa3e8440-582c-40c1-9590-815bc8d718dc/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-6', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/93b0d0ee-4df4-428d-8165-5f27b97f1d1d/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-7', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/f94f4825-4027-4ebd-9cb1-8c6ba3f2296b/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-8', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/4cd47844-3fbd-41e6-a856-1d907166fdde/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-9', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/c9b398f1-c97c-43e7-a38f-848f84f3cc78/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-10', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/138fd979-1edb-40df-897c-4fa629329872/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-11', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/0513f9ed-cde0-44b0-acc4-eea5ca201d32/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-12', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/ebfc5515-047c-4c06-a215-f9cb2246081d/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-13', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/e9d4f93f-cf75-475f-93f0-fed7009a0f95/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-14', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/72c964d3-c745-44eb-a2b5-865c7bc49f0a/playlist.m3u8', posterSrc: null, featured: false },
        { id: 'snippet-15', videoSrc: 'https://vz-73c5d4bc-396.b-cdn.net/3561fcce-d27d-41cf-a785-03387056b44b/playlist.m3u8', posterSrc: null, featured: false }
    ];
    
    const snippetsGrid = document.querySelector('.snippets-grid');
    
    function loadSnippets() {
        snippetsData.forEach(snippet => createSnippetItem(snippet));
        setupLazyLoading();
    }
    
    function createSnippetItem(snippet) {
        const snippetItem = document.createElement('div');
        snippetItem.className = snippet.featured ? 'snippet-item featured' : 'snippet-item';
        snippetItem.setAttribute('data-id', snippet.id);
        
        const snippetContainer = document.createElement('div');
        snippetContainer.className = 'snippet-container';
        
        const video = document.createElement('video');
        video.className = 'snippet-video';
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.preload = "metadata"; // Essential for Method 1

        // Use a manual poster if provided, otherwise the "First Frame" logic takes over
        if (snippet.posterSrc) {
            video.poster = snippet.posterSrc;
        }

        snippetContainer.appendChild(video);
        snippetItem.appendChild(snippetContainer);
        snippetsGrid.appendChild(snippetItem);

        // Reveal item once video has dimensions
        video.addEventListener('loadedmetadata', () => {
            snippetItem.classList.add('visible');
        });

        if (Hls.isSupported()) {
            const hls = new Hls({
                autoStartLoad: false, // Performance: don't load everything at once
                capLevelToPlayerSize: true
            });
            hls.loadSource(snippet.videoSrc);
            hls.attachMedia(video);

            // METHOD 1: Fetch the first frame as soon as the video metadata is ready
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                // This triggers a tiny "load" just for the first fragment
                // so the video displays its first frame instead of a black box.
                hls.startLoad(0);
            });

            snippetItem._hls = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = snippet.videoSrc;
        }
        
        handleSnippetInteractions(snippetItem, video);
    }
    
    function handleSnippetInteractions(snippetItem, video) {
        function playVideo() {
            if (snippetItem._hls) {
                // Start full streaming on hover
                snippetItem._hls.startLoad();
            }
            
            video.play().then(() => {
                snippetItem.classList.add('playing');
            }).catch(err => console.debug("Playback pending..."));
        }
        
        function pauseVideo() {
            video.pause();
            snippetItem.classList.remove('playing');
            if (snippetItem._hls) {
                // Pause loading chunks to save user data
                snippetItem._hls.stopLoad();
            }
        }
        
        // Use touch events for mobile, mouse events for desktop (not both)
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            snippetItem.addEventListener('click', (e) => {
                e.preventDefault();
                video.paused ? playVideo() : pauseVideo();
            });
        } else {
            snippetItem.addEventListener('mouseenter', playVideo);
            snippetItem.addEventListener('mouseleave', pauseVideo);
        }
    }

    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const options = { rootMargin: '200px', threshold: 0.1 };
            lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // The Hls.Events.MANIFEST_PARSED handles the frame load
                        lazyLoadObserver.unobserve(entry.target);
                    }
                });
            }, options);

            document.querySelectorAll('.snippet-item').forEach(item => {
                lazyLoadObserver.observe(item);
            });
        }
    }

    function autoPlayFeatured() {
        document.querySelectorAll('.snippet-item.featured').forEach(item => {
            const video = item.querySelector('video');
            if (item._hls) {
                item._hls.startLoad();
            }
            video.play().then(() => {
                item.classList.add('playing');
            }).catch(err => console.debug("Featured autoplay pending..."));
        });
    }

    window.addEventListener('beforeunload', () => {
        if (lazyLoadObserver) lazyLoadObserver.disconnect();
    });

    loadSnippets();

    // Auto-play featured videos after a short delay to ensure HLS is ready
    setTimeout(autoPlayFeatured, 500);
});