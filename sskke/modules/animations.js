// ✨ MODUL PRE ANIMÁCIE A LAZY LOADING
export class AnimationManager {
    constructor() {
        this.observers = [];
        this.animatedElements = new Set();
    }

    async init() {
        console.log('✨ Inicializácia AnimationManager...');
        
        try {
            await this.setupLazyLoading();
            this.setupScrollAnimations();
            this.setupLoadingStates();
            
            console.log('✅ AnimationManager pripravený');
        } catch (error) {
            console.error('❌ Chyba v AnimationManager:', error);
        }
    }

    setupLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('loading' in HTMLImageElement.prototype) {
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        } else {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
            this.observers.push(imageObserver);
        }
    }

    setupScrollAnimations() {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    entry.target.classList.add('visible');
                    this.animatedElements.add(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.match-card, .history-img img').forEach(el => {
            animationObserver.observe(el);
        });

        this.observers.push(animationObserver);
    }

    setupLoadingStates() {
        const cards = document.querySelectorAll('.match-card');
        cards.forEach(card => {
            const originalContent = card.innerHTML;
            card.innerHTML = `
                <div class="skeleton-header"></div>
                <div class="skeleton-body">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                </div>
            `;
            
            setTimeout(() => {
                card.innerHTML = originalContent;
                card.classList.add('visible');
            }, Math.random() * 1000 + 500);
        });
    }

    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.animatedElements.clear();
    }
}