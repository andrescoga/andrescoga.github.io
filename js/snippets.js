document.addEventListener('DOMContentLoaded', function() {
    // Set body as loaded to trigger fade-in
    document.body.classList.add('loaded');
    
    // Subtle page transitions (reused from main site)
    const links = document.querySelectorAll('a:not([target="_blank"])');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Skip if modifier keys are pressed
            if (e.metaKey || e.ctrlKey) return;
            
            // Skip if it's an anchor link
            if (this.getAttribute('href').charAt(0) === '#') return;
            
            e.preventDefault();
            
            // Subtle fade out
            document.body.style.opacity = '0';
            
            // Navigate after transition
            setTimeout(() => {
                window.location.href = this.getAttribute('href');
            }, 300);
        });
    });
    
    // Snippets data - Replace with your actual video data
    const snippetsData = [
        {
            id: 'snippet-1',
            videoSrc: 'videos/tdbq.mp4'
        },
        {
            id: 'snippet-2',
            videoSrc: 'videos/miles.mp4'
        },
        {
            id: 'snippet-3',
            videoSrc: 'videos/rosalia.mp4',
            posterSrc: 'images/snippets/motion-03.jpg'
        },
        {
            id: 'snippet-4',
            videoSrc: 'videos/luther.mp4',
            posterSrc: 'images/snippets/motion-04.jpg'
        },
        {
            id: 'snippet-5',
            videoSrc: 'videos/shakira.mp4',
            posterSrc: 'images/snippets/motion-05.jpg'
        },
        {
            id: 'snippet-6',
            videoSrc: 'videos/certified.mp4',
            posterSrc: 'images/snippets/motion-06.jpg'
        },
        {
            id: 'snippet-7',
            videoSrc: 'videos/bruce.mp4',
            posterSrc: 'images/snippets/motion-07.jpg'
        },
        {
            id: 'snippet-8',
            videoSrc: 'videos/judas.mp4',
            posterSrc: 'images/snippets/motion-08.jpg'
        },
        {
            id: 'snippet-9',
            videoSrc: 'videos/janis-2.mp4',
            posterSrc: 'images/snippets/motion-09.jpg'
        },
        {
            id: 'snippet-10',
            videoSrc: 'videos/pearl.mp4',
            posterSrc: 'images/snippets/motion-10.jpg'
        },
        {
            id: 'snippet-11',
            videoSrc: 'videos/elvis.mp4',
            posterSrc: 'images/snippets/motion-11.jpg'
        },
        {
            id: 'snippet-12',
            videoSrc: 'videos/acdc.mp4',
            posterSrc: 'images/snippets/motion-12.jpg'
        },
        // Add more snippets as needed
        {
            id: 'snippet-13',
            videoSrc: 'videos/acdc-2.mp4',
            posterSrc: 'images/snippets/motion-12.jpg'
        },
    ];
    
    // Get snippets grid
    const snippetsGrid = document.querySelector('.snippets-grid');
    
    // Create and load snippet items
    function loadSnippets() {
        snippetsData.forEach(snippet => {
            createSnippetItem(snippet);
        });
        
        // After all items are created, set up intersection observer for lazy loading
        setupLazyLoading();
    }
    
    // Create a single snippet item
    function createSnippetItem(snippet) {
        // Create elements
        const snippetItem = document.createElement('div');
        snippetItem.className = 'snippet-item';
        snippetItem.setAttribute('data-id', snippet.id);
        
        const snippetContainer = document.createElement('div');
        snippetContainer.className = 'snippet-container';
        
        const video = document.createElement('video');
        video.className = 'snippet-video';
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.preload = 'metadata'; // Load just enough to get the first frame
        
        // Set up source
        const source = document.createElement('source');
        source.src = snippet.videoSrc;
        source.type = 'video/mp4';
        
        // Assemble the elements
        video.appendChild(source);
        snippetContainer.appendChild(video);
        snippetItem.appendChild(snippetContainer);
        
        // Add to grid
        snippetsGrid.appendChild(snippetItem);
        
        // Capture first frame when metadata is loaded
        video.addEventListener('loadedmetadata', function() {
            // We need to play and then immediately pause to get the first frame
            video.currentTime = 1;
            
            // After seeking to start
            video.addEventListener('seeked', function onSeeked() {
                // Now the video shows the first frame
                // Add class to indicate we have the first frame
                snippetItem.classList.add('first-frame-loaded');
                
                // Remove this event listener as it's no longer needed
                video.removeEventListener('seeked', onSeeked);
            }, { once: true });
        }, { once: true });
        
        // Set up event listeners
        handleSnippetInteractions(snippetItem, video);
    }
    
    // Handle hover and touch interactions
    function handleSnippetInteractions(snippetItem, video) {
        // Variables for managing state
        let isLoaded = false;
        let isPlaying = false;
        let hoverTimeout;
        
        // Function to start video playback
        function playVideo() {
            if (!isLoaded) {
                // Add loading indicator
                snippetItem.classList.add('loading');
                
                // Load video if not loaded yet
                video.load();
                
                // Listen for video to be loaded enough to play
                video.addEventListener('canplay', function onCanPlay() {
                    // Remove loading indicator
                    snippetItem.classList.remove('loading');
                    // Set as loaded
                    isLoaded = true;
                    // Start playing
                    video.play().then(() => {
                        isPlaying = true;
                        snippetItem.classList.add('playing');
                    }).catch(error => {
                        console.error('Play error:', error);
                    });
                    // Remove event listener
                    video.removeEventListener('canplay', onCanPlay);
                }, { once: true });
            } else {
                // If already loaded, just play
                video.play().then(() => {
                    isPlaying = true;
                    snippetItem.classList.add('playing');
                }).catch(error => {
                    console.error('Play error:', error);
                });
            }
        }
        
        // Function to pause video
        function pauseVideo() {
            if (isPlaying) {
                video.pause();
                isPlaying = false;
                snippetItem.classList.remove('playing');
            }
        }
        
        // Mouse enter - start playing after slight delay
        snippetItem.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            // Small delay to prevent accidental triggering
            hoverTimeout = setTimeout(() => {
                playVideo();
            }, 150);
        });
        
        // Mouse leave - pause video
        snippetItem.addEventListener('mouseleave', function() {
            clearTimeout(hoverTimeout);
            pauseVideo();
        });
        
        // Touch devices - toggle play/pause on tap
        if ('ontouchstart' in window) {
            snippetItem.addEventListener('click', function(e) {
                e.preventDefault();
                if (isPlaying) {
                    pauseVideo();
                } else {
                    playVideo();
                }
            });
        }
    }
    
    // Set up lazy loading with Intersection Observer
    function setupLazyLoading() {
        // Only create observer if supported
        if ('IntersectionObserver' in window) {
            const videoItems = document.querySelectorAll('.snippet-item');
            
            const options = {
                root: null, // viewport
                rootMargin: '100px', // start loading when within 100px
                threshold: 0.1 // 10% visible
            };
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const snippetItem = entry.target;
                        const video = snippetItem.querySelector('video');
                        
                        // Make sure we're loading the metadata to get the first frame
                        if (video.readyState === 0) { // HAVE_NOTHING
                            video.load(); // This will load the metadata
                        }
                        
                        // Stop observing this item
                        observer.unobserve(snippetItem);
                    }
                });
            }, options);
            
            // Observe all snippet items
            videoItems.forEach(item => {
                observer.observe(item);
            });
        }
    }
    
    // Initialize
    loadSnippets();
});