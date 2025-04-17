// Enhanced hover and click video reveal functionality with mobile optimization

document.addEventListener('DOMContentLoaded', function() {
    // Set body as loaded to trigger fade-in
    document.body.classList.add('loaded');
    
    // Elements
    const previewArea = document.getElementById('preview-area');
    const projectItems = document.querySelectorAll('.project-item');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectsContainer = document.querySelector('.projects');
    
    // Create preview content container
    const previewContent = document.createElement('div');
    previewContent.className = 'preview-content';
    previewArea.appendChild(previewContent);
    
    // Preload the Vimeo player API
    const vimeoScript = document.createElement('script');
    vimeoScript.src = 'https://player.vimeo.com/api/player.js';
    document.head.appendChild(vimeoScript);
    
    // Create iframe container in advance - with improved styling
    const container = document.createElement('div');
    container.className = 'vimeo-responsive';
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    previewContent.appendChild(container);
    
    // Create iframe in advance
    const iframe = document.createElement('iframe');
    iframe.frameBorder = '0';
    iframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media';
    iframe.style.position = 'absolute';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.visibility = 'hidden'; // Initially hidden until loaded
    
    // Set initial src to empty to speed up later updates
    iframe.src = 'about:blank';
    container.appendChild(iframe);
    
    // Variables to track state
    let activeItem = null;
    let hoveredTimeout = null;
    let isLoaded = false;
    let currentVideoId = null;
    let isFullscreen = false;
    let isMobileView = window.innerWidth < 992;
    let mobilePreviewContainer = null;
    
    // Create mobile preview container
    function createMobilePreviewContainer() {
        mobilePreviewContainer = document.createElement('div');
        mobilePreviewContainer.className = 'mobile-preview-container';
        
        // Create a close button for mobile
        const mobileCloseButton = document.createElement('button');
        mobileCloseButton.className = 'mobile-close-button';
        mobileCloseButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
        
        mobileCloseButton.addEventListener('click', function() {
            closeMobilePreview();
        });
        
        // Create a container for the Vimeo video
        const mobileVimeoContainer = document.createElement('div');
        mobileVimeoContainer.className = 'mobile-vimeo-container';
        
        mobilePreviewContainer.appendChild(mobileCloseButton);
        mobilePreviewContainer.appendChild(mobileVimeoContainer);
        
        document.body.appendChild(mobilePreviewContainer);
    }
    
    // Function to check viewport and set mobile state
    function checkViewport() {
        const wasMobile = isMobileView;
        isMobileView = window.innerWidth < 992;
        
        // If we're transitioning from desktop to mobile or vice versa
        if (wasMobile !== isMobileView) {
            // If we have an active project in desktop view, reset it when switching to mobile
            if (!isMobileView && activeItem) {
                resetVimeoPlayer();
                previewContent.classList.remove('active', 'clicked');
                activeItem.classList.remove('clicked', 'hovered');
                activeItem = null;
            }
            
            // If we have the mobile preview open when switching to desktop, close it
            if (wasMobile && mobilePreviewContainer && mobilePreviewContainer.classList.contains('active')) {
                closeMobilePreview();
            }
        }
    }
    
    // Function to handle mobile preview
    function openMobilePreview(projectItem) {
        if (!mobilePreviewContainer) {
            createMobilePreviewContainer();
        }
        
        // Get the position of the clicked item
        const rect = projectItem.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Position the preview container right after the clicked item
        mobilePreviewContainer.style.top = `${rect.bottom + scrollTop}px`;
        
        // Get the project link and its corresponding Vimeo ID
        const projectHref = projectItem.getAttribute('href');
        const videoId = getVimeoID(projectHref);
        
        // Find or create the iframe in the mobile container
        let mobileIframe = mobilePreviewContainer.querySelector('iframe');
        if (!mobileIframe) {
            mobileIframe = document.createElement('iframe');
            mobileIframe.frameBorder = '0';
            mobileIframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media';
            mobileIframe.style.width = '100%';
            mobileIframe.style.height = '100%';
            mobilePreviewContainer.querySelector('.mobile-vimeo-container').appendChild(mobileIframe);
        }
        
        // Set the Vimeo source
        mobileIframe.src = `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=0&background=0&controls=1&dnt=1`;
        
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
            
            // Reset iframe
            const mobileIframe = mobilePreviewContainer.querySelector('iframe');
            if (mobileIframe) {
                setTimeout(() => {
                    mobileIframe.src = 'about:blank';
                }, 300);
            }
            
            activeItem = null;
        }
    }
    
    // Video IDs mapping for each project
    // Use the project href path to identify which video to show
    const vimeoIDs = {
        "projects/new-yorker.html": "1076262217",
        "projects/bob.html": "1075895355", // Bob Dylan video ID
        "projects/harpers.html": "645409357",
        "projects/marco.html": "1076259389",
        "projects/shakira.html": "1075906580",
        "projects/loretta.html": "1075905492",
        "projects/mabiland.html": "1075906812",
        "projects/elvis.html": "1075906057",
        "projects/prince.html": "1076258770",
        "projects/meb.html": "1075906302",
    };
    
    // Function to get Vimeo ID based on project path
    function getVimeoID(projectPath) {
        return vimeoIDs[projectPath] || "645409357"; // Default if not found
    }
    
    // Function to quickly update iframe src and show it
    function activateVimeoPlayer(videoId, unmute = false) {
        // Only reload if it's a different video
        if (currentVideoId !== videoId || !isLoaded) {
            // First make iframe invisible during load
            iframe.style.visibility = 'hidden';
            
            // Set muted parameter based on fullscreen state
            const mutedParam = unmute ? '0' : '1';
            
            // Add these parameters for better filling of the space:
            iframe.src = `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=${mutedParam}&background=1&controls=${unmute ? '1' : '0'}&dnt=1&transparent=1`;
            currentVideoId = videoId;
            isLoaded = true;
            
            // Make iframe visible once loaded
            iframe.onload = function() {
                iframe.style.visibility = 'visible';
            };
        } else {
            // If already loaded, we need to update the muted state without reloading
            // This requires accessing the Vimeo player API
            if (window.Vimeo && window.Vimeo.Player) {
                try {
                    const player = new Vimeo.Player(iframe);
                    if (unmute) {
                        player.setVolume(1);
                        player.setMuted(false);
                    } else {
                        player.setMuted(true);
                    }
                } catch (e) {
                    console.log('Could not update mute state dynamically, will reload iframe instead');
                    // If API fails, reload the iframe with the correct muted parameter
                    iframe.style.visibility = 'hidden';
                    const mutedParam = unmute ? '0' : '1';
                    iframe.src = `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=${mutedParam}&background=1&controls=${unmute ? '1' : '0'}&dnt=1&transparent=1`;
                    iframe.onload = function() {
                        iframe.style.visibility = 'visible';
                    };
                }
            }
            
            // Make sure it's visible
            iframe.style.visibility = 'visible';
        }
        
        // Show the preview
        previewContent.classList.add('active');
    }
    
    // Function to fully reset the video player
    function resetVimeoPlayer() {
        // Hide the iframe
        iframe.style.visibility = 'hidden';
    }
    
    // Function to preload videos (called at page load)
    function preloadVideos() {
        // Preload the first few thumbnails for perceived performance
        Object.values(vimeoIDs).slice(0, 3).forEach(id => {
            const img = new Image();
            img.src = `https://vumbnail.com/${id}.jpg`;
        });
    }
    
    // Function to toggle expanded mode
    function toggleExpanded() {
        if (isFullscreen) {
            // Exit expanded mode
            document.body.classList.remove('video-expanded');
            previewArea.classList.remove('expanded');
            previewContent.classList.remove('expanded');
            container.classList.remove('expanded');
            
            // Mute the video when exiting fullscreen
            if (activeItem && currentVideoId) {
                const projectHref = activeItem.getAttribute('href');
                const videoId = getVimeoID(projectHref);
                activateVimeoPlayer(videoId, false); // muted = true
            }
            
            // Add a small delay before removing the transition class
            setTimeout(() => {
                previewArea.classList.remove('transitioning');
            }, 600); // Match this to the CSS transition duration
            
            isFullscreen = false;
        } else {
            // Enter expanded mode
            // Add transitioning class first (for animation)
            previewArea.classList.add('transitioning');
            
            // Add expanded classes
            document.body.classList.add('video-expanded');
            previewArea.classList.add('expanded');
            previewContent.classList.add('expanded');
            container.classList.add('expanded');
            
            // Unmute the video when entering fullscreen
            if (activeItem && currentVideoId) {
                const projectHref = activeItem.getAttribute('href');
                const videoId = getVimeoID(projectHref);
                activateVimeoPlayer(videoId, true); // unmuted = true
            }
            
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
            
            // Get the project link and its corresponding Vimeo ID
            const projectHref = this.getAttribute('href');
            const videoId = getVimeoID(projectHref);
            
            // Activate the Vimeo player immediately with the correct video
            activateVimeoPlayer(videoId);
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
                        resetVimeoPlayer();
                        
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
                        
                        // Get the project link and its corresponding Vimeo ID
                        const projectHref = this.getAttribute('href');
                        const videoId = getVimeoID(projectHref);
                        
                        // Activate new video - keep unmuted since we're in fullscreen
                        activateVimeoPlayer(videoId, true);
                        
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
                    
                    // Get the project link and its corresponding Vimeo ID
                    const projectHref = this.getAttribute('href');
                    const videoId = getVimeoID(projectHref);
                    
                    // Make sure video is playing (muted in preview mode)
                    activateVimeoPlayer(videoId, false);
                    
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
                resetVimeoPlayer();
                
                // Remove the has-hovered class
                projectsContainer.classList.remove('has-hovered');
            }, 500);
        }
    });
    
    // Click outside to close expanded view
    document.addEventListener('click', function(e) {
        // Check if click is outside project items and preview area
        if (!e.target.closest('.project-item') && !e.target.closest('.preview-area')) {
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
                    resetVimeoPlayer();
                    
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
                    resetVimeoPlayer();
                    
                    // Remove the has-hovered class
                    projectsContainer.classList.remove('has-hovered');
                }
            }
        }
    });
    
    // Portfolio filtering functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Close mobile preview if open
            if (isMobileView && mobilePreviewContainer && mobilePreviewContainer.classList.contains('active')) {
                closeMobilePreview();
            }
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get filter value
            const filterValue = this.getAttribute('data-filter');
            
            // Filter portfolio items
            projectItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // Add a slight delay for a subtle fade-in effect
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    
                    // If this is the active item, hide preview
                    if (activeItem === item) {
                        previewContent.classList.remove('active', 'clicked');
                        resetVimeoPlayer();
                        
                        // If in fullscreen, exit it
                        if (isFullscreen) {
                            toggleExpanded();
                        }
                        
                        // Remove the has-hovered class
                        projectsContainer.classList.remove('has-hovered');
                        
                        activeItem = null;
                    }
                    
                    // Add a slight delay before hiding the element
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Subtle page transitions
    const links = document.querySelectorAll('a:not([target="_blank"]):not(.project-item)');
    
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
    
    // Listen for resize events to update mobile/desktop state
    window.addEventListener('resize', checkViewport);
    
    // Check initial viewport size
    checkViewport();
    
    // Keyboard navigation for projects
    document.addEventListener('keydown', function(e) {
        // Only if we have an active item
        if (activeItem) {
            const items = Array.from(projectItems).filter(item => 
                item.style.display !== 'none'
            );
            const currentIndex = items.indexOf(activeItem);
            
            // Arrow down or right: next project
            if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && currentIndex < items.length - 1) {
                if (isFullscreen) {
                    // If in expanded mode, just switch videos without closing
                    items[currentIndex + 1].click();
                } else {
                    items[currentIndex + 1].click();
                }
            }
            
            // Arrow up or left: previous project
            if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && currentIndex > 0) {
                if (isFullscreen) {
                    // If in expanded mode, just switch videos without closing
                    items[currentIndex - 1].click();
                } else {
                    items[currentIndex - 1].click();
                }
            }
            
            // Escape: exit expanded mode or close preview
            if (e.key === 'Escape') {
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
                        resetVimeoPlayer();
                        
                        // Remove the has-hovered class
                        projectsContainer.classList.remove('has-hovered');
                    }, 500);
                } else if (isMobileView && mobilePreviewContainer && mobilePreviewContainer.classList.contains('active')) {
                    closeMobilePreview();
                } else {
                    previewContent.classList.remove('clicked');
                    projectItems.forEach(item => item.classList.remove('clicked'));
                    
                    // Hide preview if no item is hovered
                    if (!document.querySelector('.project-item.hovered')) {
                        previewContent.classList.remove('active');
                        resetVimeoPlayer();
                        
                        // Remove the has-hovered class
                        projectsContainer.classList.remove('has-hovered');
                    }
                }
            }
        }
    });
    
    // Add this CSS to ensure preview area is clean when not active
    const style = document.createElement('style');
    style.textContent = `
        .preview-content:not(.active) {
            box-shadow: none !important;
            background: transparent !important;
            pointer-events: none;
        }
        
        .preview-content:not(.active) iframe,
        .preview-content:not(.active) .vimeo-responsive {
            opacity: 0 !important;
            visibility: hidden !important;
        }
        
        /* Mobile-specific styles */
        @media (max-width: 991px) {
            .preview-area {
                display: none !important; /* Hide the desktop preview area on mobile */
            }
            
            .portfolio-container {
                display: block; /* Change grid to block for mobile */
            }
            
            /* Mobile preview container styles */
            .mobile-preview-container {
                position: absolute;
                left: 0;
                width: 100%;
                height: 0;
                background-color: #000;
                overflow: hidden;
                transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 1000;
            }
            
            .mobile-preview-container.active {
                height: 56.25vw; /* 16:9 aspect ratio */
            }
            
            .mobile-vimeo-container {
                width: 100%;
                height: 100%;
                position: relative;
            }
            
            .mobile-close-button {
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.5);
                color: white;
                border: none;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10;
            }
            
            /* Style for the active project item in mobile */
            .project-item.mobile-active {
                background-color: var(--hover-color);
            }
            
            /* Add space after active project to accommodate preview */
            .project-item.mobile-active {
                margin-bottom: calc(56.25vw + 20px); /* Preview height + extra space */
                transition: margin-bottom 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            
            /* Overlay when mobile preview is open */
            body.mobile-preview-open::after {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 999;
                pointer-events: none;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize by preloading videos
    preloadVideos();
    
    // Console log to help with debugging
    console.log('Enhanced Vimeo video display script loaded with mobile optimization support');
});