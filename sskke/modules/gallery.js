// 🖼️ MODUL PRE GALÉRIU OBRÁZKOV
export class GalleryManager {
    constructor() {
        this.galleries = new Map();
        this.currentGallery = null;
        this.observer = null;
    }

    async init() {
        console.log('🖼️ Inicializácia GalleryManager...');
        
        try {
            await this.loadGalleryStructure();
            this.renderGalleryNavigation();
            this.setupLazyLoading();
            this.setupLightbox();
            
            console.log('✅ GalleryManager pripravený');
        } catch (error) {
            console.error('❌ Chyba v GalleryManager:', error);
        }
    }

    async loadGalleryStructure() {
        console.log('📂 Načítavam štruktúru galérií...');
        
        const galleryStructure = await this.fetchGalleryStructure();
        galleryStructure.sort((a, b) => b.dateCode - a.dateCode);
        
        galleryStructure.forEach(gallery => {
            this.galleries.set(gallery.id, gallery);
        });

        console.log('📊 Načítané galérie:', this.galleries.size);
    }

    async fetchGalleryStructure() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: '20241015_turnaj_kosice',
                        dateCode: 20241015,
                        name: 'Turnaj Košice',
                        displayName: 'Medzinárodný turnaj v Košiciach',
                        folder: '20241015_TurnajKosice',
                        imageCount: 12,
                        coverImage: 'images/20241015_TurnajKosice/cover.jpg',
                        date: '15.10.2024',
                        description: 'Úspešná účasť na domácom turnaji'
                    },
                    {
                        id: '20240920_pripravny_zapas',
                        dateCode: 20240920,
                        name: 'Prípravný zápas',
                        displayName: 'Prípravný zápas s Prešovom',
                        folder: '20240920_PripravnyZapas',
                        imageCount: 8,
                        coverImage: 'images/20240920_PripravnyZapas/cover.jpg',
                        date: '20.9.2024',
                        description: 'Prípravný zápas pred sezónou'
                    },
                    {
                        id: '20240805_letny_tabor',
                        dateCode: 20240805,
                        name: 'Letný tábor',
                        displayName: 'Letný tréningový tábor',
                        folder: '20240805_LetnyTabor',
                        imageCount: 25,
                        coverImage: 'images/20240805_LetnyTabor/cover.jpg',
                        date: '5.8.2024',
                        description: 'Letný tréningový tábor v Tatrách'
                    },
                    {
                        id: '20240512_finale_ligy',
                        dateCode: 20240512,
                        name: 'Finále ligy',
                        displayName: 'Finále regionálnej ligy',
                        folder: '20240512_FinaleLigy',
                        imageCount: 18,
                        coverImage: 'images/20240512_FinaleLigy/cover.jpg',
                        date: '12.5.2024',
                        description: 'Finálový zápas regionálnej ligy'
                    }
                ]);
            }, 500);
        });
    }

    renderGalleryNavigation() {
        const gallerySection = this.createGallerySection();
        const historiaSection = document.querySelector('section#historia');
        if (historiaSection) {
            historiaSection.insertAdjacentElement('afterend', gallerySection);
        }
        this.renderGalleryGrid();
    }

    createGallerySection() {
        const section = document.createElement('section');
        section.id = 'galeria';
        section.innerHTML = `
            <h2>Galéria</h2>
            <p style="text-align: center; margin-bottom: 30px; color: #666;">
                Prehliadajte fotografie z našich zápasov, tréningov a eventov
            </p>
            
            <div class="gallery-filters" style="margin-bottom: 30px; text-align: center;">
                <button class="filter-btn active" data-filter="all">Všetky</button>
                <button class="filter-btn" data-filter="zapasy">Zápasy</button>
                <button class="filter-btn" data-filter="treningy">Tréningy</button>
                <button class="filter-btn" data-filter="eventy">Eventy</button>
            </div>
            
            <div class="gallery-grid" id="galleryGrid">
                <!-- Galérie sa načítajú tu -->
            </div>
            
            <div class="gallery-loading" style="text-align: center; padding: 40px;">
                <div class="loading-spinner">Načítavam galérie...</div>
            </div>
        `;

        this.injectGalleryStyles();
        return section;
    }

    injectGalleryStyles() {
        const styles = `
            <style>
                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                    margin-bottom: 40px;
                }
                
                .gallery-card {
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    cursor: pointer;
                }
                
                .gallery-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }
                
                .gallery-card-image {
                    width: 100%;
                    height: 200px;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .gallery-card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }
                
                .gallery-card:hover .gallery-card-image img {
                    transform: scale(1.05);
                }
                
                .gallery-card-content {
                    padding: 20px;
                }
                
                .gallery-card-date {
                    color: var(--primary-blue);
                    font-weight: bold;
                    font-size: 0.9rem;
                    margin-bottom: 5px;
                }
                
                .gallery-card-title {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: var(--text-dark);
                }
                
                .gallery-card-description {
                    color: #666;
                    font-size: 0.9rem;
                    margin-bottom: 15px;
                    line-height: 1.4;
                }
                
                .gallery-card-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.8rem;
                    color: #999;
                }
                
                .gallery-card-count {
                    background: var(--primary-blue);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.7rem;
                }
                
                .filter-btn {
                    padding: 8px 16px;
                    margin: 0 5px;
                    background: #f0f0f0;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .filter-btn.active {
                    background: var(--primary-blue);
                    color: white;
                }
                
                .lightbox {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.9);
                    z-index: 2000;
                    justify-content: center;
                    align-items: center;
                }
                
                .lightbox.active {
                    display: flex;
                }
                
                .lightbox-content {
                    max-width: 90%;
                    max-height: 90%;
                    position: relative;
                }
                
                .lightbox-img {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
                
                .lightbox-close {
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                }
                
                .lightbox-nav {
                    position: absolute;
                    top: 50%;
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                    transform: translateY(-50%);
                }
                
                .lightbox-prev, .lightbox-next {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 10px 15px;
                    cursor: pointer;
                    font-size: 1.5rem;
                    transition: background 0.3s ease;
                }
                
                .lightbox-prev:hover, .lightbox-next:hover {
                    background: rgba(255,255,255,0.4);
                }
                
                .loading-spinner {
                    color: #666;
                    font-style: italic;
                }

                .skeleton-header {
                    height: 40px;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                }

                .skeleton-line {
                    height: 16px;
                    background: #f0f0f0;
                    margin: 10px 0;
                    border-radius: 4px;
                }

                .skeleton-line.short {
                    width: 60%;
                }

                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                .match-card, .history-img img, .gallery-card {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.6s ease;
                }

                .match-card.visible, .history-img img.visible, .gallery-card.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    renderGalleryGrid() {
        const grid = document.getElementById('galleryGrid');
        const loading = document.querySelector('.gallery-loading');
        
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.galleries.forEach((gallery, id) => {
            const card = this.createGalleryCard(gallery);
            grid.appendChild(card);
        });
        
        if (loading) {
            loading.style.display = 'none';
        }
        
        this.setupFilterListeners();
    }

    createGalleryCard(gallery) {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.dataset.galleryId = gallery.id;
        card.dataset.category = this.detectCategory(gallery.name);
        
        card.innerHTML = `
            <div class="gallery-card-image">
                <img 
                    src="${gallery.coverImage}" 
                    alt="${gallery.displayName}"
                    loading="lazy"
                    onerror="this.style.display='none'; this.parentElement.innerHTML='🖼️ Galéria';"
                >
            </div>
            <div class="gallery-card-content">
                <div class="gallery-card-date">${gallery.date}</div>
                <div class="gallery-card-title">${gallery.displayName}</div>
                <div class="gallery-card-description">${gallery.description}</div>
                <div class="gallery-card-meta">
                    <span>${gallery.imageCount} fotografií</span>
                    <span class="gallery-card-count">${this.detectCategory(gallery.name)}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => this.openGallery(gallery));
        return card;
    }

    detectCategory(name) {
        const lowerName = name.toLowerCase();
        
        if (lowerName.includes('turnaj') || lowerName.includes('zapas') || lowerName.includes('finále')) {
            return 'zapasy';
        } else if (lowerName.includes('trening') || lowerName.includes('tábor')) {
            return 'treningy';
        } else {
            return 'eventy';
        }
    }

    setupFilterListeners() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.filterGalleries(btn.dataset.filter);
            });
        });
    }

    filterGalleries(filter) {
        const cards = document.querySelectorAll('.gallery-card');
        
        cards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    async openGallery(gallery) {
        console.log('🖼️ Otváram galériu:', gallery.name);
        
        try {
            const images = await this.loadGalleryImages(gallery.folder);
            this.showLightbox(gallery, images);
            
        } catch (error) {
            console.error('❌ Chyba pri otváraní galérie:', error);
            alert('Galériu sa nepodarilo načítať.');
        }
    }

    async loadGalleryImages(folderName) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const images = [];
                const imageCount = Math.floor(Math.random() * 10) + 5;
                
                for (let i = 1; i <= imageCount; i++) {
                    images.push({
                        src: `images/${folderName}/foto${i}.jpg`,
                        alt: `Fotografia ${i} z ${folderName}`,
                        title: `Fotografia ${i}`
                    });
                }
                
                resolve(images);
            }, 300);
        });
    }

    showLightbox(gallery, images) {
        const lightboxHTML = `
            <div class="lightbox active" id="galleryLightbox">
                <button class="lightbox-close">&times;</button>
                <div class="lightbox-content">
                    <img src="${images[0].src}" alt="${images[0].alt}" class="lightbox-img" id="lightboxImg">
                    <div class="lightbox-nav">
                        <button class="lightbox-prev">‹</button>
                        <button class="lightbox-next">›</button>
                    </div>
                </div>
                <div class="lightbox-info" style="position: absolute; bottom: 20px; left: 0; right: 0; text-align: center; color: white;">
                    ${gallery.displayName} (1/${images.length})
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        this.setupLightboxControls(gallery, images);
    }

    setupLightboxControls(gallery, images) {
        const lightbox = document.getElementById('galleryLightbox');
        const lightboxImg = document.getElementById('lightboxImg');
        const lightboxInfo = document.querySelector('.lightbox-info');
        let currentIndex = 0;
        
        const updateImage = (index) => {
            currentIndex = index;
            lightboxImg.src = images[index].src;
            lightboxImg.alt = images[index].alt;
            lightboxInfo.textContent = `${gallery.displayName} (${index + 1}/${images.length})`;
        };
        
        document.querySelector('.lightbox-close').addEventListener('click', () => {
            lightbox.remove();
        });
        
        document.querySelector('.lightbox-prev').addEventListener('click', () => {
            const newIndex = (currentIndex - 1 + images.length) % images.length;
            updateImage(newIndex);
        });
        
        document.querySelector('.lightbox-next').addEventListener('click', () => {
            const newIndex = (currentIndex + 1) % images.length;
            updateImage(newIndex);
        });
        
        document.addEventListener('keydown', (e) => {
            if (!lightbox) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    const prevIndex = (currentIndex - 1 + images.length) % images.length;
                    updateImage(prevIndex);
                    break;
                case 'ArrowRight':
                    const nextIndex = (currentIndex + 1) % images.length;
                    updateImage(nextIndex);
                    break;
                case 'Escape':
                    lightbox.remove();
                    break;
            }
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                lightbox.remove();
            }
        });
    }

    setupLazyLoading() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    this.observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            this.observer.observe(img);
        });
    }

    setupLightbox() {
        console.log('💡 Lightbox systém pripravený');
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.galleries.clear();
    }
}