// Theme toggle functionality - runs immediately to prevent flash
(function() {
    const THEME_KEY = 'theme-preference';

    // Get saved theme or detect system preference
    function getThemePreference() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved) {
            return saved;
        }
        // Check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply theme to document
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // Toggle theme
    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(THEME_KEY, next);
    }

    // Apply theme immediately
    applyTheme(getThemePreference());

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(THEME_KEY)) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Set up toggle button when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        const toggleBtn = document.querySelector('.theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }
    });
})();
