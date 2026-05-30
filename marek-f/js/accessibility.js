/**
 * Accessibility & UX Enhancements
 * Pridajte tento súbor ako: <script src="js/accessibility.js" defer></script>
 */

(function() {
    'use strict';

    // =================================================================
    // Mobile Menu Toggle - ARIA Enhancement
    // =================================================================
    function initMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav-wrap');
        
        if (!menuToggle || !mainNav) return;

        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            // Toggle ARIA state
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle class
            document.body.classList.toggle('menu-is-open');
            
            // Focus management
            if (!isExpanded) {
                // Menu opening - focus first link
                const firstLink = mainNav.querySelector('a');
                if (firstLink) {
                    setTimeout(() => firstLink.focus(), 300);
                }
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.body.classList.contains('menu-is-open')) {
                menuToggle.click();
                menuToggle.focus();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (document.body.classList.contains('menu-is-open') && 
                !mainNav.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                menuToggle.click();
            }
        });
    }

    // =================================================================
    // Lazy Loading Images Enhancement
    // =================================================================
    function initLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        // Fallback pro starší browsery
        if ('loading' in HTMLImageElement.prototype) {
            // Browser podporuje native lazy loading
            images.forEach(img => {
                img.addEventListener('load', function() {
                    this.classList.add('loaded');
                });
            });
        } else {
            // Fallback: Intersection Observer
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src || img.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => imageObserver.observe(img));
        }
    }

    // =================================================================
    // Smooth Scroll with Keyboard Support
    // =================================================================
    function initSmoothScroll() {
        const smoothScrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
        
        smoothScrollLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('.s-header')?.offsetHeight || 0;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Focus management pro keyboard users
                    setTimeout(() => {
                        targetElement.setAttribute('tabindex', '-1');
                        targetElement.focus();
                        
                        // Remove tabindex after focus
                        targetElement.addEventListener('blur', function() {
                            this.removeAttribute('tabindex');
                        }, { once: true });
                    }, 300);
                    
                    // Update URL bez scrollu
                    history.pushState(null, '', targetId);
                }
            });
        });
    }

    // =================================================================
    // Gallery Iframe Loading State
    // =================================================================
    function initGalleryLoading() {
        const galleryWrapper = document.querySelector('.zenphoto-gallery-wrapper');
        const iframe = document.querySelector('.zenphoto-iframe');
        
        if (!galleryWrapper || !iframe) return;

        // Add loading class
        galleryWrapper.classList.add('gallery-loading');
        
        // Remove loading when iframe loads
        iframe.addEventListener('load', function() {
            galleryWrapper.classList.remove('gallery-loading');
            galleryWrapper.classList.add('gallery-loaded');
        });
        
        // Error handling
        iframe.addEventListener('error', function() {
            galleryWrapper.classList.remove('gallery-loading');
            galleryWrapper.classList.add('gallery-error');
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'gallery-error';
            errorMessage.innerHTML = `
                <h3>Galéria sa nedá načítať</h3>
                <p>Skúste obnoviť stránku alebo navštívte <a href="https://marekfindrik.pixieset.com/" target="_blank" rel="noopener">Pixieset galériu</a>.</p>
            `;
            galleryWrapper.replaceWith(errorMessage);
        });
        
        // Timeout fallback (30 sekúnd)
        setTimeout(() => {
            if (galleryWrapper.classList.contains('gallery-loading')) {
                console.warn('Gallery loading timeout');
                galleryWrapper.classList.remove('gallery-loading');
            }
        }, 30000);
    }

    // =================================================================
    // External Links - Security & Accessibility
    // =================================================================
    function initExternalLinks() {
        const externalLinks = document.querySelectorAll('a[target="_blank"]');
        
        externalLinks.forEach(link => {
            // Add rel attributes if missing
            if (!link.hasAttribute('rel')) {
                link.setAttribute('rel', 'noopener noreferrer');
            } else {
                const rel = link.getAttribute('rel');
                if (!rel.includes('noopener')) {
                    link.setAttribute('rel', rel + ' noopener');
                }
                if (!rel.includes('noreferrer')) {
                    link.setAttribute('rel', link.getAttribute('rel') + ' noreferrer');
                }
            }
            
            // Add aria-label if missing
            if (!link.hasAttribute('aria-label')) {
                const text = link.textContent.trim();
                if (text) {
                    link.setAttribute('aria-label', `${text} (otvorí sa v novom okne)`);
                }
            }
        });
    }

    // =================================================================
    // Focus Visible Polyfill (for older browsers)
    // =================================================================
    function initFocusVisible() {
        // Simple polyfill for :focus-visible
        let hadKeyboardEvent = false;
        
        document.addEventListener('keydown', () => {
            hadKeyboardEvent = true;
        });
        
        document.addEventListener('mousedown', () => {
            hadKeyboardEvent = false;
        });
        
        document.addEventListener('focus', (e) => {
            if (hadKeyboardEvent) {
                e.target.classList.add('focus-visible');
            }
        }, true);
        
        document.addEventListener('blur', (e) => {
            e.target.classList.remove('focus-visible');
        }, true);
    }

    // =================================================================
    // Prefers Reduced Motion Detection
    // =================================================================
    function checkReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduced-motion');
            console.log('Reduced motion preference detected');
        }
        
        // Listen for changes
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        });
    }

    // =================================================================
    // Announce Page Load to Screen Readers
    // =================================================================
    function announcePageLoad() {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.classList.add('sr-only');
        announcement.textContent = 'Stránka bola úspešne načítaná';
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            announcement.remove();
        }, 2000);
    }

    // =================================================================
    // Skip Links Enhancement
    // =================================================================
    function initSkipLinks() {
        const skipLink = document.querySelector('.skip-to-content');
        
        if (skipLink) {
            skipLink.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    // =================================================================
    // Form Validation Enhancement (pre budúcnosť)
    // =================================================================
    function initFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const invalidFields = form.querySelectorAll(':invalid');
                
                if (invalidFields.length > 0) {
                    e.preventDefault();
                    
                    // Focus na prvé nevalidné pole
                    invalidFields[0].focus();
                    
                    // Announce error to screen readers
                    const announcement = document.createElement('div');
                    announcement.setAttribute('role', 'alert');
                    announcement.classList.add('sr-only');
                    announcement.textContent = 'Formulár obsahuje chyby. Prosím opravte označené polia.';
                    form.appendChild(announcement);
                    
                    setTimeout(() => announcement.remove(), 3000);
                }
            });
        });
    }

    // =================================================================
    // Scroll Progress Indicator (voliteľné)
    // =================================================================
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-label', 'Priebeh čítania stránky');
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
            
            progressBar.style.width = scrollPercent + '%';
            progressBar.setAttribute('aria-valuenow', Math.round(scrollPercent));
        });
        
        // CSS for progress bar (add to your stylesheet)
        const style = document.createElement('style');
        style.textContent = `
            .scroll-progress {
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: var(--color-accent, #ff0000);
                z-index: 9999;
                transition: width 0.1s ease;
            }
        `;
        document.head.appendChild(style);
    }

    // =================================================================
    // Performance Monitoring (voliteľné)
    // =================================================================
    function monitorPerformance() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }

    // =================================================================
    // Initialize Everything
    // =================================================================
    function init() {
        // Core functionality
        initMobileMenu();
        initLazyLoading();
        initSmoothScroll();
        initGalleryLoading();
        initExternalLinks();
        initSkipLinks();
        
        // Accessibility enhancements
        initFocusVisible();
        checkReducedMotion();
        
        // Nice to have
        // initScrollProgress(); // Odkomentujte ak chcete scroll indicator
        // monitorPerformance(); // Odkomentujte pre performance monitoring
        
        // Announce page load
        announcePageLoad();
        
        console.log('✓ Accessibility & UX enhancements loaded');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();