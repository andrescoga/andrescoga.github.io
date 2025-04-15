document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const header = document.querySelector('header');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileClose = document.querySelector('.mobile-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    
    // Variables for scroll handling
    let lastScrollTop = 0;
    const scrollThreshold = 50;
    
    // Toggle mobile menu
    mobileNavToggle.addEventListener('click', () => {
        mobileNav.classList.add('open');
        document.body.classList.add('no-scroll');
    });
    
    // Close mobile menu with X button
    mobileClose.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        document.body.classList.remove('no-scroll');
    });
    
    // Close mobile menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
            mobileNav.classList.remove('open');
            document.body.classList.remove('no-scroll');
        }
    });
    
    // Close mobile menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('open');
            document.body.classList.remove('no-scroll');
        });
    });
    
    // Add scroll event to handle header visibility (throttled)
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScrollTop = window.scrollY;
                
                // Toggle scrolled class for styling
                header.classList.toggle('scrolled', currentScrollTop > 10);
                
                // Check if we're on mobile view and menu is not open
                const isMobile = window.innerWidth <= 768;
                const isMenuOpen = mobileNav.classList.contains('open');
                
                if (isMobile && !isMenuOpen) {
                    // If scrolling down and beyond threshold, hide header
                    if (currentScrollTop > lastScrollTop && currentScrollTop > scrollThreshold) {
                        header.classList.add('hide');
                    } 
                    // If scrolling up, show header
                    else if (currentScrollTop < lastScrollTop) {
                        header.classList.remove('hide');
                    }
                } else {
                    // On desktop or when menu is open, ensure header is always visible
                    header.classList.remove('hide');
                }
                
                lastScrollTop = currentScrollTop;
                ticking = false;
            });
            
            ticking = true;
        }
    });
    
    // Handle window resize (debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768) {
                header.classList.remove('hide');
                // Reset mobile menu if window is resized
                mobileNav.classList.remove('open');
                document.body.classList.remove('no-scroll');
            }
        }, 250);
    });
});