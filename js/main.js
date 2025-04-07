document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const header = document.querySelector('header');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileClose = document.querySelector('.mobile-close');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    
    // Desktop dropdown elements
    const dropdown = document.querySelector('.dropdown');
    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    
    // Portfolio filtering elements
    const filterLinks = document.querySelectorAll('.dropdown-content a');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
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
    
    // Toggle desktop dropdown menu
    if (dropbtn) {
        dropbtn.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownContent.classList.toggle('show');
            dropdown.classList.toggle('active');
            
            // Close dropdown when clicking outside
            const closeDropdown = (event) => {
                if (!event.target.closest('.dropdown')) {
                    dropdownContent.classList.remove('show');
                    dropdown.classList.remove('active');
                    document.removeEventListener('click', closeDropdown);
                }
            };
            
            document.addEventListener('click', closeDropdown);
        });
    }
    
    // Filter portfolio items
    filterLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const filterValue = this.getAttribute('data-filter');
            
            // Update active state
            filterLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // Filter portfolio items
            portfolioItems.forEach(item => {
                const category = item.getAttribute('data-category');
                item.style.display = (filterValue === 'all' || category === filterValue) ? 'block' : 'none';
            });
            
            // Close dropdown
            dropdownContent.classList.remove('show');
            dropdown.classList.remove('active');
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
    
    // Initialize portfolio - show all items by default
    portfolioItems.forEach(item => {
        item.style.display = 'block';
    });
});