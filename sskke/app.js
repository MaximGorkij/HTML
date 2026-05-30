// 🚀 HLAVNÝ APP MODULE
import { NavigationManager } from './modules/navigation.js';
import { ScrollManager } from './modules/scroll.js';
import { AnimationManager } from './modules/animations.js';
import { FormManager } from './modules/forms.js';
import { GalleryManager } from './modules/gallery.js';
import { PerformanceMonitor } from './modules/performance.js';
import { StorageManager } from './modules/storage.js';

class App {
    constructor() {
        this.modules = {};
        this.performance = new PerformanceMonitor();
        this.init();
    }

    async init() {
        console.log('🚀 Aplikácia sa inicializuje...');
        
        try {
            this.modules.navigation = new NavigationManager();
            this.modules.scroll = new ScrollManager();
            this.modules.animations = new AnimationManager();
            this.modules.forms = new FormManager();
            this.modules.gallery = new GalleryManager();
            this.modules.storage = new StorageManager();

            await Promise.all([
                this.modules.navigation.init(),
                this.modules.scroll.init(),
                this.modules.animations.init(),
                this.modules.forms.init(),
                this.modules.gallery.init()
            ]);

            console.log('✅ Všetky moduly úspešne načítané');
            this.performance.logLoadTime();
            
        } catch (error) {
            console.error('❌ Chyba pri inicializácii:', error);
        }
    }
}

// Error boundary
window.addEventListener('error', (e) => {
    console.error('🎯 Global Error:', {
        message: e.message,
        file: e.filename,
        line: e.lineno,
        column: e.colno
    });
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🎯 Unhandled Promise:', e.reason);
});

// Performance monitoring
const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        console.log('⚡ Performance:', entry.name, Math.round(entry.duration) + 'ms');
    });
});
observer.observe({ entryTypes: ['measure', 'navigation'] });

// Spustenie aplikácie
new App();