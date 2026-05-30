// 🎯 MODUL PRE SMOOTH SCROLL A URL HISTÓRIU
export class ScrollManager {
    constructor() {
        this.isScrolling = false;
        this.sections = new Map();
        this.currentSection = '';
    }

    async init() {
        console.log('🎯 Inicializácia ScrollManager...');
        
        try {
            this.cacheSections();
            this.setupSmoothScroll();
            this.setupScrollSpy();
            this.setupHistory();
            
            console.log('✅ ScrollManager pripravený');
        } catch (error) {
            console.error('❌ Chyba v ScrollManager:', error);
        }
    }

    cacheSections() {
        document.querySelectorAll('section[id]').forEach(section => {
            this.sections.set(section.id, section);
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => this.handleSmoothScroll(e, link));
        });
    }

    setupScrollSpy() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.updateActiveNav(entry.target.id);
                    this.updateURL(entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupHistory() {
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.section) {
                this.scrollToSection(e.state.section);
            }
        });
    }

    async handleSmoothScroll(e, link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        if (this.isScrolling) return;
        
        this.isScrolling = true;
        await this.scrollToSection(targetId);
        this.isScrolling = false;
    }

    async scrollToSection(sectionId) {
        const section = this.sections.get(sectionId);
        if (!section) {
            console.warn('⚠️ Sekcia nenájdená:', sectionId);
            return;
        }

        return new Promise((resolve) => {
            section.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            setTimeout(resolve, 1000);
        });
    }

    updateActiveNav(sectionId) {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        this.currentSection = sectionId;
    }

    updateURL(sectionId) {
        if (sectionId !== this.currentSection) {
            history.pushState({ section: sectionId }, '', `#${sectionId}`);
        }
    }

    destroy() {
        this.sections.clear();
    }
}