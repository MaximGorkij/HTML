// 🧭 MODUL PRE NAVIGÁCIU A MENU
export class NavigationManager {
    constructor() {
        this.navbar = null;
        this.dropdowns = [];
        this.isMobile = window.innerWidth < 768;
    }

    async init() {
        console.log('🧭 Inicializácia NavigationManager...');
        
        try {
            this.navbar = document.querySelector('.navbar');
            this.dropdowns = document.querySelectorAll('.dropdown');
            
            if (!this.navbar) {
                throw new Error('Navigácia nenájdená');
            }

            this.setupEventListeners();
            this.setupClickOutside();
            this.setupMobileMenu();
            
            console.log('✅ NavigationManager pripravený');
        } catch (error) {
            console.error('❌ Chyba v NavigationManager:', error);
        }
    }

    setupEventListeners() {
        // Dropdown hover
        this.dropdowns.forEach(dropdown => {
            dropdown.addEventListener('mouseenter', () => this.openDropdown(dropdown));
            dropdown.addEventListener('mouseleave', () => this.closeDropdown(dropdown));
        });

        // Aktívna navigácia
        document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e, link));
        });
    }

    setupClickOutside() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    setupMobileMenu() {
        if (this.isMobile) {
            const menuToggle = document.createElement('button');
            menuToggle.innerHTML = '☰';
            menuToggle.className = 'mobile-menu-toggle';
            menuToggle.style.cssText = `
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                display: none;
            `;

            this.navbar.appendChild(menuToggle);
            
            menuToggle.addEventListener('click', () => this.toggleMobileMenu());
            
            // CSS pre mobilné menu
            const style = document.createElement('style');
            style.textContent = `
                @media (max-width: 768px) {
                    .mobile-menu-toggle { display: block !important; }
                    .nav-links { 
                        display: none; 
                        width: 100%;
                    }
                    .nav-links.active {
                        display: flex;
                        flex-direction: column;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    openDropdown(dropdown) {
        if (!this.isMobile) {
            dropdown.classList.add('active');
        }
    }

    closeDropdown(dropdown) {
        dropdown.classList.remove('active');
    }

    closeAllDropdowns() {
        this.dropdowns.forEach(dropdown => this.closeDropdown(dropdown));
    }

    toggleMobileMenu() {
        const navLinks = document.querySelector('.nav-links');
        navLinks.classList.toggle('active');
    }

    handleNavClick(e, link) {
        e.preventDefault();
        this.closeAllDropdowns();
    }

    // Memory cleanup
    destroy() {
        this.dropdowns.forEach(dropdown => {
            dropdown.removeEventListener('mouseenter', this.openDropdown);
            dropdown.removeEventListener('mouseleave', this.closeDropdown);
        });
    }
}