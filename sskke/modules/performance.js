// 📊 MODUL PRE MONITOROVANIE VÝKONU
export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            loadTime: 0,
            domReady: 0,
            firstPaint: 0
        };
        this.startTime = performance.now();
    }

    init() {
        this.setupPerformanceTracking();
        this.setupMemoryMonitoring();
    }

    setupPerformanceTracking() {
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now() - this.startTime;
            this.metrics.domReady = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            this.metrics.firstPaint = performance.getEntriesByName('first-paint')[0]?.startTime || 0;
        });
    }

    setupMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                console.log('🧠 Memory usage:', {
                    used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
                    total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
                });
            }, 30000);
        }
    }

    logLoadTime() {
        console.log('📊 Performance Metrics:', {
            '🕒 Celkový čas načítania': Math.round(this.metrics.loadTime) + 'ms',
            '📄 DOM ready': Math.round(this.metrics.domReady) + 'ms',
            '🎨 First paint': Math.round(this.metrics.firstPaint) + 'ms'
        });
    }
}