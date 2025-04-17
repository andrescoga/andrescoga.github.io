/**
 * Enhanced portfolio interface with video previews
 * Andrés Escobar portfolio script - 2025
 */
document.addEventListener('DOMContentLoaded', () => {
    // Mark body as loaded to trigger fade-in transition
    document.body.classList.add('loaded');
    
    // DOM element references
    const previewArea = document.getElementById('preview-area');
    const projectItems = document.querySelectorAll('.project-item');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectsContainer = document.querySelector('.projects');
    
    // State tracking variables
    let activeItem = null;
    let hoveredTimeout = null;
    let isLoaded = false;
    let currentVideoId = null;
    let isFullscreen = false;
    let vimeoPlayer = null;
    
    // Video mappings (project path → Vimeo ID)
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
    
    // ===== Setup Preview Area =====
    
    // Create preview content container
    const previewContent = document.createElement('div');
    previewContent.className = 'preview-content';
    previewArea.appendChild(previewContent);
    
    // Create video container
    const videoContainer = document.createElement('div');
    videoContainer.className = 'vimeo-responsive';
    previewContent.appendChild(videoContainer);
    
    // Create video iframe
    const videoIframe = document.createElement('iframe');
    videoIframe.frameBorder = '0';
    videoIframe.allow = 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media';
    videoIframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;';
    videoIframe.src = 'about:blank'; // Empty initial source
    videoIframe.id = 'vimeo-player';
    videoContainer.appendChild(videoIframe);
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    previewArea.appendChild(closeButton);
    
    // ===== Core Functions =====
    
    /**
     * Loads the Vimeo API script
     */
    function loadVimeoAPI() {
        if (!document.querySelector('script[src*="player.vimeo.com"]')) {
            const vimeoScript = document.createElement('script');
            vimeoScript.src = 'https://player.vimeo.com/api/player.js';
            document.head.appendChild(vimeoScript);
        }
    }
    
    /**
     * Preloads thumbnails for first few videos for better performance
     */
    function preloadVideos() {
        Object.values(vimeoIDs).slice(0, 3).forEach(id => {
            new Image().src = `https://vumbnail.com/${id}.jpg`;
        });
    }
    
    /**
     * Gets Vimeo ID for a project path, with fallback
     */
    function getVimeoID(projectPath) {
        return vimeoIDs[projectPath] || "645409357"; // Fallback ID
    }
    
    /**
     * Activates the Vimeo player with specified video ID
     */
    function activateVimeoPlayer(videoId) {
        // Only reload if it's a different video or not loaded yet
        if (currentVideoId !== videoId || !isLoaded) {
            // For preview, always use background and muted options
            videoIframe.src = `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&background=1&controls=0&dnt=1&transparent=1`;
            currentVideoId = videoId;
            isLoaded = true;
        }
        
        // Show the preview
        previewContent.classList.add('active');
    }
    
    /**
     * Toggles the expanded (fullscreen) mode
     */
    function toggleExpanded() {
        if (isFullscreen) {
            // Exit expanded mode
            document.body.classList.remove('video-expanded');
            previewArea.classList.remove('expanded');
            previewContent.classList.remove('expanded');
            videoContainer.classList.remove('expanded');
            
            // When closing, switch back to muted background mode
            videoIframe.src = `https://player.vimeo.com/video/${currentVideoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&background=1&controls=0&dnt=1&transparent=1`;
            
            // Remove transition class after animation completes
            setTimeout(() => {
                previewArea.classList.remove('transitioning');
            }, 600);
            
            isFullscreen = false;
        } else {
            // Enter expanded mode
            previewArea.classList.add('transitioning');
            document.body.classList.add('video-expanded');
            previewArea.classList.add('expanded');
            previewContent.classList.add('expanded');
            videoContainer.classList.add('expanded');
            
            // When expanding, switch to unmuted mode with controls
            videoIframe.src = `https://player.vimeo.com/video/${currentVideoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=0&background=0&controls=1&dnt=1&transparent=0`;
            
            isFullscreen = true;
        }
    }
    
    // ===== Event Handlers =====
    
    /**
     * Handles mouse enter for project items
     */
    function handleProjectMouseEnter() {
        // Clear any pending timeouts
        if (hoveredTimeout) {
            clearTimeout(hoveredTimeout);
        }
        
        // Add classes to manage visual state
        projectsContainer.classList.add('has-hovered');
        this.classList.add('hovered');
        
        // Set as active item
        activeItem = this;
        
        // Load and activate video
        const projectHref = this.getAttribute('href');
        const videoId = getVimeoID(projectHref);
        activateVimeoPlayer(videoId);
    }
    
    /**
     * Handles mouse leave for project items
     */
    function handleProjectMouseLeave() {
        // Only process if this is the active item
        if (activeItem === this) {
            this.classList.remove('hovered');
            
            // Only hide preview if not in clicked mode and not fullscreen
            if (!previewContent.classList.contains('clicked') && !isFullscreen) {
                hoveredTimeout = setTimeout(() => {
                    previewContent.classList.remove('active');
                    projectsContainer.classList.remove('has-hovered');
                }, 100);
            }
        }
    }
    
    /**
     * Handles click on project items
     */
    function handleProjectClick(e) {
        // Skip default handling if modifier keys pressed
        if (e.ctrlKey || e.metaKey) return;
        
        e.preventDefault();
        
        // If already clicked and expanded, navigate to project page
        if (previewContent.classList.contains('clicked') && activeItem === this && isFullscreen) {
            window.location.href = this.getAttribute('href');
            return;
        }
        
        // If clicking a different item while expanded, switch items
        if (isFullscreen && activeItem !== this) {
            // Update active item
            activeItem = this;
            
            // Get new video ID and activate 
            const projectHref = this.getAttribute('href');
            const videoId = getVimeoID(projectHref);
            
            // When in fullscreen and switching, directly use unmuted mode
            videoIframe.src = `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=0&background=0&controls=1&dnt=1&transparent=0`;
            currentVideoId = videoId;
            
            // Update classes
            projectItems.forEach(i => i.classList.remove('clicked', 'hovered'));
            this.classList.add('clicked', 'hovered');
            
            // Ensure preview is active
            previewContent.classList.add('active');
            return;
        }
        
        // Normal click handling
        previewContent.classList.add('clicked');
        activeItem = this;
        
        // Update classes
        projectItems.forEach(i => i.classList.remove('hovered', 'clicked'));
        this.classList.add('clicked', 'hovered');
        
        // Keep dim effect on other items
        projectsContainer.classList.add('has-hovered');
        
        // Load video
        const projectHref = this.getAttribute('href');
        const videoId = getVimeoID(projectHref);
        activateVimeoPlayer(videoId);
        
        // Expand with slight delay for better visual flow
        setTimeout(() => toggleExpanded(), 50);
    }
    
    /**
     * Handles close button clicks
     */
    function handleCloseButtonClick(e) {
        e.stopPropagation();
        if (isFullscreen) {
            toggleExpanded();
        }
    }
    
    /**
     * Handles clicks anywhere in the document
     */
    function handleDocumentClick(e) {
        // If click is outside project items and preview area
        if (!e.target.closest('.project-item') && !e.target.closest('.preview-area')) {
            if (isFullscreen) {
                toggleExpanded();
                
                // Delay before removing other classes
                setTimeout(() => {
                    previewContent.classList.remove('clicked');
                    projectItems.forEach(item => item.classList.remove('clicked'));
                    
                    if (!document.querySelector('.project-item.hovered')) {
                        previewContent.classList.remove('active');
                        projectsContainer.classList.remove('has-hovered');
                    }
                }, 500);
            } else {
                previewContent.classList.remove('clicked');
                projectItems.forEach(item => item.classList.remove('clicked'));
                
                if (!document.querySelector('.project-item.hovered')) {
                    previewContent.classList.remove('active');
                    projectsContainer.classList.remove('has-hovered');
                }
            }
        }
    }
    
    /**
     * Handles filter button clicks for portfolio filtering
     */
    function handleFilterButtonClick() {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Get filter value
        const filterValue = this.getAttribute('data-filter');
        
        // Apply filter to items
        projectItems.forEach(item => {
            const shouldShow = filterValue === 'all' || item.getAttribute('data-category') === filterValue;
            
            if (shouldShow) {
                // Show the item
                item.style.display = 'block';
                setTimeout(() => item.style.opacity = '1', 50);
            } else {
                // Hide the item with transition
                item.style.opacity = '0';
                
                // If this is the active item, hide preview
                if (activeItem === item) {
                    previewContent.classList.remove('active', 'clicked');
                    
                    if (isFullscreen) {
                        toggleExpanded();
                    }
                    
                    projectsContainer.classList.remove('has-hovered');
                    activeItem = null;
                }
                
                // Delay hiding for animation
                setTimeout(() => item.style.display = 'none', 300);
            }
        });
    }
    
    /**
     * Handles page transitions for regular navigation links
     */
    function handlePageTransition(e) {
        // Skip if modifier keys pressed or internal anchor
        if (e.metaKey || e.ctrlKey || this.getAttribute('href').charAt(0) === '#') return;
        
        e.preventDefault();
        
        // Fade out, then navigate
        document.body.style.opacity = '0';
        setTimeout(() => {
            window.location.href = this.getAttribute('href');
        }, 300);
    }
    
    /**
     * Handles keyboard navigation
     */
    function handleKeydown(e) {
        // Skip if no active item
        if (!activeItem) return;
        
        // Get visible items
        const items = Array.from(projectItems).filter(item => item.style.display !== 'none');
        const currentIndex = items.indexOf(activeItem);
        
        // Arrow down/right: next project
        if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && currentIndex < items.length - 1) {
            items[currentIndex + 1].click();
        }
        
        // Arrow up/left: previous project
        if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && currentIndex > 0) {
            items[currentIndex - 1].click();
        }
        
        // Escape: exit expanded mode or close preview
        if (e.key === 'Escape') {
            if (isFullscreen) {
                toggleExpanded();
            } else {
                previewContent.classList.remove('clicked');
                projectItems.forEach(item => item.classList.remove('clicked'));
                
                if (!document.querySelector('.project-item.hovered')) {
                    previewContent.classList.remove('active');
                    projectsContainer.classList.remove('has-hovered');
                }
            }
        }
        
        // M key: toggle mute when in fullscreen
        if (e.key === 'm' && isFullscreen) {
            // Toggle the iframe source between muted and unmuted
            if (videoIframe.src.includes('muted=0')) {
                videoIframe.src = videoIframe.src.replace('muted=0', 'muted=1');
            } else {
                videoIframe.src = videoIframe.src.replace('muted=1', 'muted=0');
            }
        }
    }
    
    // ===== Event Listeners =====
    
    // Close button
    closeButton.addEventListener('click', handleCloseButtonClick);
    
    // Document-level events
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
    
    // Project items
    projectItems.forEach(item => {
        item.addEventListener('mouseenter', handleProjectMouseEnter);
        item.addEventListener('mouseleave', handleProjectMouseLeave);
        item.addEventListener('click', handleProjectClick);
    });
    
    // Filter buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterButtonClick);
    });
    
    // Page transition for navigation links
    const navigationLinks = document.querySelectorAll('a:not([target="_blank"]):not(.project-item)');
    navigationLinks.forEach(link => {
        link.addEventListener('click', handlePageTransition);
    });
    
    // ===== Initialization =====
    loadVimeoAPI();
    preloadVideos();
    
    // Log initialization complete
    console.log('Portfolio interface initialized with role column display and mute/unmute functionality');
});