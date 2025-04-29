// Enhanced hover and click video reveal functionality with Bunny.net integration

document.addEventListener("DOMContentLoaded", function() {
    // Set body as loaded to trigger fade-in
    document.body.classList.add("loaded");

    // Apply cascade animation with delay
    const allProjectItems = document.querySelectorAll(".project-item"); // Renamed variable
    allProjectItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.05}s`; // Stagger delay
    });
    
    // Elements
    const previewArea = document.getElementById('preview-area');
    const projectItems = document.querySelectorAll('.project-item');
    const projectsContainer = document.querySelector('.projects');
    
    // Create preview content container
    const previewContent = document.createElement('div');
    previewContent.className = 'preview-content';
    previewArea.appendChild(previewContent);
    
    // Create video container with improved styling
    const container = document.createElement('div');
    container.className = 'video-responsive';
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    previewContent.appendChild(container);
    
    // Video URLs mapping for each project
    // Use the project href path to identify which video to show
    const videoURLs = {
        "projects/new-yorker.html": "https://index-videos.b-cdn.net/why_does_the_grim_reaper_exist-_-_the_new_yorker%20(1080p).mp4",
        "projects/bob.html": "https://index-videos.b-cdn.net/bob_dylan_-_lay%2C_lady%2C_lay_(alternate_version_-_take_2)_(official_lyric_video)%20(1080p).mp4",
        "projects/harpers.html": "https://index-videos.b-cdn.net/harper%E2%80%99s_bazaar_-_icons_2018_-_wreck_the_plaza%20(1080p).mp4",
        "projects/marco.html": "https://index-videos.b-cdn.net/marco_luka_-_big_talk_(lyric_video)%20(1080p).mp4",
        "projects/shakira.html": "https://index-videos.b-cdn.net/shakira_-_20_years_of_laundry_service%20(1080p).mp4",
        "projects/loretta.html": "https://index-videos.b-cdn.net/loretta_lynn_-_celebrating_loretta's_history_in_country_music%20(1080p).mp4",
        "projects/mabiland.html": "https://index-videos.b-cdn.net/mabiland_-_retrato_ft_%40juanpablovega%20(1080p).mp4",
        "projects/elvis.html": "https://index-videos.b-cdn.net/elvis_presley_-_don't_be_cruel_(official_lyric_video)%20(1080p).mp4",
        "projects/prince.html": "https://index-videos.b-cdn.net/prince_-_musicology__real_music_by_real_musicians_(20th_anniversary)%20(1080p).mp4",
        "projects/meb.html": "https://index-videos.b-cdn.net/m.e.b._-_the_making_of__that_you_not_dare_to_forget_%20(1080p).mp4"
    };
    
    // Fallback to Vimeo IDs if Bunny.net URL is not available
    const vimeoIDs = {
        "projects/new-yorker.html": "1076262217",
        "projects/bob.html": "1075895355",
        "projects/harpers.html": "645409357",
        "projects/marco.html": "1076259389",
        "projects/shakira.html": "1075906580",
        "projects/loretta.html": "1075905492",
        "projects/mabiland.html": "1075906812",
        "projects/elvis.html": "1075906057",
        "projects/prince.html": "1076258770",
        "projects/meb.html": "1075906302"
    };
    
    // Variables to track state
    let activeItem = null;
    let hoveredTimeout = null;
    let isLoaded = false;
    let currentVideoPath = null;
    let isFullscreen = false;
    let isMobileView = window.innerWidth < 992;
    let mobilePreviewContainer = null;
    let videoElement = null;
    let iframeElement = null;
    
    // Create mobile preview container
    function createMobilePreviewContainer() {
        // Check if container already exists to avoid duplicates
        if (mobilePreviewContainer) {
            return mobilePreviewContainer;
        }
        
        mobilePreviewContainer = document.createElement('div');
        mobilePreviewContainer.className = 'mobile-preview-container';
        
        // Create a close button for mobile
        const mobileCloseButton = document.createElement('button');
        mobileCloseButton.className = 'mobile-close-button';
        mobileCloseButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        
        mobileCloseButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent bubbling
            closeMobilePreview();
        });
        
        // Create a container for the video
        const mobileVideoContainer = document.createElement('div');
        mobileVideoContainer.className = 'mobile-video-container';
        
        mobilePreviewContainer.appendChild(mobileCloseButton);
        mobilePreviewContainer.appendChild(mobileVideoContainer);
        
        document.body.appendChild(mobilePreviewContainer);
        
        return mobilePreviewContainer;
    }
    
    // Function to check viewport and set mobile state
    function checkViewport() {
        const wasMobile = isMobileView;
        isMobileView = window.innerWidth < 992;
        
        // If we're transitioning from desktop to mobile or vice versa
        if (wasMobile !== isMobileView) {
            // If we have an active project in desktop view, reset it when switching to mobile
            if (!isMobileView && activeItem) {
                resetVideoPlayer();
                previewContent.classList.remove('active', 'clicked');
                if (activeItem) {
                    activeItem.classList.remove('clicked', 'hovered');
                }
                activeItem = null;
            }
            
            // If we have the mobile preview open when switching to desktop, close it
            if (wasMobile && mobilePreviewContainer && mobilePreviewContainer.classList.contains('active')) {
                closeMobilePreview();
            }
            
            // If switching to mobile, ensure mobile container exists
            if (isMobileView && !mobilePreviewContainer) {
                createMobilePreviewContainer();
            }
        }
    }
    
    // Function to handle mobile preview
    function openMobilePreview(projectItem) {
        // Make sure mobile container exists
        if (!mobilePreviewContainer) {
            mobilePreviewContainer = createMobilePreviewContainer();
        }
        
        // Get the position of the clicked item
        const rect = projectItem.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Position the preview container right after the clicked item
        mobilePreviewContainer.style.top = `${rect.bottom + scrollTop}px`;
        
        // Get the project link
        const projectHref = projectItem.getAttribute('href');
        
        // Get the video container
        const mobileVideoContainer = mobilePreviewContainer.querySelector('.mobile-video-container');
        mobileVideoContainer.innerHTML = ''; // Clear previous content
        
        // Check if we have a Bunny.net URL for this project
        if (videoURLs[projectHref] && videoURLs[projectHref].length > 0) {
            // Create HTML5 video element
            const videoEl = document.createElement('video');
            videoEl.controls = true;
            videoEl.autoplay = true;
            videoEl.style.width = '100%';
            videoEl.style.height = '100%';
            
            // Add source
            const source = document.createElement('source');
            source.src = videoURLs[projectHref];
            source.type = 'video/mp4';
            videoEl.appendChild(source);
            
            mobileVideoContainer.appendChild(videoEl);
        } else if (vimeoIDs[projectHref]) {
            // Fallback to Vimeo if no Bunny.net URL
            const videoId = vimeoIDs[projectHref];
            
            // Create iframe for Vimeo
            const iframe = document.createElement('iframe');
            iframe.frameBorder = '0';
            iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media';
            iframe.style.width = '100%';
            iframe.style.height = '100%';
            iframe.src = `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=0&background=0&controls=1&dnt=1`;
            
            mobileVideoContainer.appendChild(iframe);
        }
        
        // Remove any previously set active classes
        projectItems.forEach(item => {
            item.classList.remove('mobile-active', 'after-active');
        });
        
        // Add active class to show the container with animation
        mobilePreviewContainer.classList.add('active');
        
        // Mark this item as active
        activeItem = projectItem;
        projectItem.classList.add('mobile-active');
        
        // Add 'after-active' class to all items after the clicked one
        // This will push them down to make space for the preview
        let isAfterActive = false;
        projectItems.forEach(item => {
            if (isAfterActive && item.style.display !== 'none') {
                item.classList.add('after-active');
            }
            if (item === projectItem) {
                isAfterActive = true;
            }
        });
        
        // Add active class to body for overlay
        document.body.classList.add('mobile-preview-open');
        
        // Scroll to ensure the video is visible
        setTimeout(() => {
            window.scrollTo({
                top: rect.top + scrollTop - 20,
                behavior: 'smooth'
            });
        }, 50);
    }
    
    // Function to close mobile preview
    function closeMobilePreview() {
        if (mobilePreviewContainer) {
            mobilePreviewContainer.classList.remove('active');
            
            // Remove all active classes
            projectItems.forEach(item => {
                item.classList.remove('mobile-active', 'after-active');
            });
            
            document.body.classList.remove('mobile-preview-open');
            
            // Clear the video container
            const mobileVideoContainer = mobilePreviewContainer.querySelector('.mobile-video-container');
            setTimeout(() => {
                mobileVideoContainer.innerHTML = '';
            }, 300);
            
            activeItem = null;
        }
    }
    
    // Function to get video URL based on project path
    function getVideoURL(projectPath) {
        return videoURLs[projectPath] || "";
    }
    
    // Function to get Vimeo ID based on project path (fallback)
    function getVimeoID(projectPath) {
        return vimeoIDs[projectPath] || "645409357"; // Default if not found
    }
    
    // Function to show loading state
    function showLoadingState() {
        // Add loading class to preview area to show the loading placeholder
        previewArea.classList.add('loading');
        // Make sure preview content is visible but video is hidden during loading
        previewContent.classList.add('active');
    }
    
    // Function to hide loading state
    function hideLoadingState() {
        // Remove loading class when video is ready
        previewArea.classList.remove('loading');
    }
    
    // Function to create and activate HTML5 video player
    function createVideoElement(videoURL, unmute = false) {
        // Create video element if it doesn't exist
        if (!videoElement) {
            videoElement = document.createElement('video');
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.style.objectFit = isFullscreen ? 'contain' : 'cover';
            videoElement.playsInline = true;
            videoElement.loop = true;
            
            // Add event listeners
            videoElement.addEventListener('loadeddata', function() {
                videoElement.style.visibility = 'visible';
                hideLoadingState();
            });
            
            videoElement.addEventListener('error', function() {
                console.error('Video loading error');
                hideLoadingState();
            });
            
            container.appendChild(videoElement);
        }
        
        // Update video properties
        videoElement.muted = !unmute;
        videoElement.controls = unmute;
        videoElement.src = videoURL;
        videoElement.style.visibility = 'hidden';
        videoElement.style.objectFit = isFullscreen ? 'contain' : 'cover';
        
        // Play the video
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Auto-play was prevented:', error);
                // Show play button or other UI to allow user-initiated play
                hideLoadingState();
            });
        }
        
        return videoElement;
    }
    
    // Function to create and activate Vimeo player (fallback)
    function createIframeElement(videoId, unmute = false) {
        // Create iframe if it doesn't exist
        if (!iframeElement) {
            iframeElement = document.createElement('iframe');
            iframeElement.frameBorder = '0';
            iframeElement.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media';
            iframeElement.style.position = 'absolute';
            iframeElement.style.top = '0';
            iframeElement.style.left = '0';
            iframeElement.style.width = '100%';
            iframeElement.style.height = '100%';
            iframeElement.style.visibility = 'hidden';
            
            container.appendChild(iframeElement);
        }
        
        // Set muted parameter based on fullscreen state
        const mutedParam = unmute ? '0' : '1';
        
        // Update iframe src
        iframeElement.src = `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=${mutedParam}&background=1&controls=${unmute ? '1' : '0'}&dnt=1&transparent=1`;
        
        // Make iframe visible once loaded
        iframeElement.onload = function() {
            iframeElement.style.visibility = 'visible';
            hideLoadingState();
        };
        
        return iframeElement;
    }
    
    // Function to activate the appropriate video player
    function activateVideoPlayer(projectPath, unmute = false) {
        // Show loading state immediately
        showLoadingState();
        
        // Only reload if it's a different video
        if (currentVideoPath !== projectPath || !isLoaded) {
            // Reset any existing players
            if (videoElement) {
                videoElement.style.visibility = 'hidden';
                videoElement.pause();
                if (videoElement.parentNode) {
                    videoElement.parentNode.removeChild(videoElement);
                }
                videoElement = null;
            }
            
            if (iframeElement) {
                iframeElement.style.visibility = 'hidden';
                if (iframeElement.parentNode) {
                    iframeElement.parentNode.removeChild(iframeElement);
                }
                iframeElement = null;
            }
            
            // Check if we have a Bunny.net URL for this project
            const videoURL = getVideoURL(projectPath);
            if (videoURL && videoURL.length > 0) {
                // Use HTML5 video player
                createVideoElement(videoURL, unmute);
            } else {
                // Fallback to Vimeo
                const videoId = getVimeoID(projectPath);
                createIframeElement(videoId, unmute);
            }
            
            currentVideoPath = projectPath;
            isLoaded = true;
        } else {
            // If already loaded, just update mute state
            if (videoElement) {
                videoElement.muted = !unmute;
                videoElement.controls = unmute;
                videoElement.style.visibility = 'visible';
                videoElement.style.objectFit = isFullscreen ? 'contain' : 'cover';
                hideLoadingState();
            } else if (iframeElement) {
                // For Vimeo, we need to reload with new muted parameter
                const videoId = getVimeoID(projectPath);
                createIframeElement(videoId, unmute);
            }
        }
        
        // Show the preview
        previewContent.classList.add('active');
    }
    
    // Function to fully reset the video player
    function resetVideoPlayer() {
        // Hide and reset video elements
        if (videoElement) {
            videoElement.style.visibility = 'hidden';
            videoElement.pause();
        }
        
        if (iframeElement) {
            iframeElement.style.visibility = 'hidden';
        }
        
        // Remove loading state
        hideLoadingState();
    }
    
    // Function to preload videos (called at page load)
    function preloadVideos() {
        // Preload the first few videos for perceived performance
        Object.entries(videoURLs).slice(0, 3).forEach(([path, url]) => {
            if (url && url.length > 0) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'video';
                link.href = url;
                document.head.appendChild(link);
            }
        });
    }
    
    // Function to toggle expanded mode
    function toggleExpanded() {
        if (isFullscreen) {
            // First update transitioning state
            previewArea.classList.add('transitioning');
            
            // Then remove expanded classes with slight delay
            setTimeout(() => {
                document.body.classList.remove('video-expanded');
                previewArea.classList.remove('expanded');
                previewContent.classList.remove('expanded');
                container.classList.remove('expanded');
                
                // Mute the video when exiting fullscreen
                if (activeItem && currentVideoPath) {
                    const projectHref = activeItem.getAttribute('href');
                    activateVideoPlayer(projectHref, false); // muted = true
                }
            }, 50); // Short delay for smoother animation
            
            // Remove the transition class after animation completes
            setTimeout(() => {
                previewArea.classList.remove('transitioning');
            }, 900); // Match this to slightly longer than CSS transition duration
            
            isFullscreen = false;
        } else {
            // Enter expanded mode - add transitioning first
            previewArea.classList.add('transitioning');
            
            // Short delay before adding expanded classes
            setTimeout(() => {
                document.body.classList.add("video-expanded");
                previewArea.classList.add("expanded");
                previewContent.classList.add("expanded");
                container.classList.add("expanded");
                
                // Unmute the video when entering fullscreen
                if (activeItem && currentVideoPath) {
                    const projectHref = activeItem.getAttribute('href');
                    activateVideoPlayer(projectHref, true); // unmuted = true
                }
            }, 50);
            
            isFullscreen = true;
        }
    }
    
    // Handle project item click/hover
    projectItems.forEach(item => {
        // Mouse enter - show preview (only in desktop)
        item.addEventListener('mouseenter', function() {
            if (isMobileView) return; // Skip hover effects on mobile
            
            // Clear any existing timeout
            if (hoveredTimeout) {
                clearTimeout(hoveredTimeout);
            }
            
            // Add class to the projects container to dim other items
            projectsContainer.classList.add('has-hovered');
            
            // Set active item
            activeItem = this;
            
            // Add hovered class
            this.classList.add('hovered');
            
            // Get the project link
            const projectHref = this.getAttribute('href');
            
            // Activate the video player immediately with the correct video
            activateVideoPlayer(projectHref);
        });
        
        // Mouse leave - hide preview if not clicked
        item.addEventListener('mouseleave', function() {
            if (isMobileView) return; // Skip hover effects on mobile
            
            // Only remove hover state if this is the active item
            if (activeItem === this) {
                this.classList.remove('hovered');
                
                // Only hide preview if we're not in clicked mode and not in fullscreen
                if (!previewContent.classList.contains('clicked') && !isFullscreen) {
                    // Add a slight delay before hiding to prevent flickering during movement
                    hoveredTimeout = setTimeout(() => {
                        previewContent.classList.remove('active');
                        
                        // Fully reset the player when hiding
                        resetVideoPlayer();
                        
                        // Remove the has-hovered class
                        projectsContainer.classList.remove('has-hovered');
                    }, 100);
                }
            }
        });
        
        // Click - toggle expanded mode or open mobile preview
        item.addEventListener('click', function(e) {
            // Prevent default only if we're handling the click for preview
            // (not navigating to project page)
            if (!e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                
                if (isMobileView) {
                    // In mobile view, open the mobile preview
                    openMobilePreview(this);
                } else {
                    // Desktop behavior
                    // If this item is already clicked and in expanded mode, navigate to the project
                    if (previewContent.classList.contains('clicked') && activeItem === this && isFullscreen) {
                        window.location.href = this.getAttribute('href');
                        return;
                    }
                    
                    // If clicking a different item while one is expanded, switch items
                    if (isFullscreen && activeItem !== this) {
                        // Update active item
                        activeItem = this;
                        
                        // Get the project link
                        const projectHref = this.getAttribute('href');
                        
                        // Activate new video - keep unmuted since we're in fullscreen
                        activateVideoPlayer(projectHref, true);
                        
                        // Remove clicked class from all items
                        projectItems.forEach(i => i.classList.remove('clicked', 'hovered'));
                        
                        // Add clicked/hovered classes to this item
                        this.classList.add('clicked', 'hovered');
                        return;
                    }
                    
                    // Set clicked state
                    previewContent.classList.add('clicked');
                    
                    // Update active item
                    activeItem = this;
                    
                    // Remove hovered and clicked classes from all items
                    projectItems.forEach(i => i.classList.remove('hovered', 'clicked'));
                    
                    // Add clicked and hovered classes to this item
                    this.classList.add('clicked', 'hovered');
                    
                    // Maintain the has-hovered class on projects container
                    projectsContainer.classList.add('has-hovered');
                    
                    // Get the project link
                    const projectHref = this.getAttribute('href');
                    
                    // Make sure video is playing (muted in preview mode)
                    activateVideoPlayer(projectHref, false);
                    
                    // Immediately toggle to expanded mode with a slight delay for smoother experience
                    setTimeout(() => {
                        toggleExpanded();
                    }, 50);
                }
            }
        });
    });
    
    // Add a close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    previewArea.appendChild(closeButton);
    
    // Click on close button to exit expanded mode
    closeButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering other click events
        if (isFullscreen) {
            toggleExpanded();
            
            // After a delay matching the transition
            setTimeout(() => {
                // Remove clicked state
                previewContent.classList.remove('clicked');
                
                // Remove clicked class from all items
                projectItems.forEach(item => item.classList.remove('clicked'));
                
                // Hide preview and reset player
                previewContent.classList.remove('active');
                resetVideoPlayer();
                
                // Remove the has-hovered class
                projectsContainer.classList.remove('has-hovered');
            }, 500);
        }
    });
    
    // Click outside to close expanded view
    document.addEventListener('click', function(e) {
        // Check if click is outside project items and preview area
        if (!e.target.closest('.project-item') && !e.target.closest('.preview-area') && 
            !e.target.closest('.mobile-preview-container')) {
            // If in expanded mode, exit it
            if (isFullscreen) {
                toggleExpanded();
                
                // Add a small delay before removing other classes
                setTimeout(() => {
                    // Remove clicked state
                    previewContent.classList.remove('clicked');
                    
                    // Remove clicked class from all items
                    projectItems.forEach(item => item.classList.remove('clicked'));
                    
                    // Hide preview and reset player
                    previewContent.classList.remove('active');
                    resetVideoPlayer();
                    
                    // Remove the has-hovered class
                    projectsContainer.classList.remove('has-hovered');
                }, 500);
            } else {
                // Remove clicked state
                previewContent.classList.remove('clicked');
                
                // Remove clicked class from all items
                projectItems.forEach(item => item.classList.remove('clicked'));
                
                // Hide preview if no item is hovered
                if (!document.querySelector('.project-item.hovered')) {
                    previewContent.classList.remove('active');
                    resetVideoPlayer();
                    
                    // Remove the has-hovered class
                    projectsContainer.classList.remove('has-hovered');
                }
            }
            
            // Also close mobile preview if open
            if (isMobileView && mobilePreviewContainer && 
                mobilePreviewContainer.classList.contains('active')) {
                closeMobilePreview();
            }
        }
    });
    
    // Subtle page transitions
    const links = document.querySelectorAll('a:not([target="_blank"]):not(.project-item)');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only handle links to other pages on the site
            if (this.getAttribute('href').startsWith('#') || 
                this.getAttribute('href').includes('://') ||
                e.ctrlKey || e.metaKey) {
                return; // Let the browser handle these normally
            }
            
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // Fade out
            document.body.style.opacity = '0';
            
            // Navigate after fade completes
            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
    
    // Check viewport size on resize
    window.addEventListener('resize', checkViewport);
    
    // Initial viewport check
    checkViewport();
    
    // Preload videos for better performance
    preloadVideos();
    
    // Add cascade animation for titles and fade-in for other elements
    function addEntranceAnimations() {
        // Add animation classes to project items for cascade effect
        const projectItems = document.querySelectorAll('.project-item');
        projectItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
            item.style.transitionDelay = `${0.05 * index}s`;
            
            // Trigger animation after a small delay
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, 100);
        });
        
        // Add fade-in for other elements
        const fadeElements = document.querySelectorAll('header, footer, .preview-area');
        fadeElements.forEach((element) => {
            element.style.opacity = '0';
            element.style.transition = 'opacity 0.8s ease';
            
            // Trigger animation
            setTimeout(() => {
                element.style.opacity = '1';
            }, 200);
        });
    }
    
    // Call the animation function when page is loaded
    addEntranceAnimations();
});