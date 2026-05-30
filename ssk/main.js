// =============================================
// DATA STORAGE
// =============================================
const matchesData = [
    {
        header: "STARŠIE ŽIAČKY - 1. LIGA",
        date: "Sobota 12.10.2024 o 10:00",
        teams: "ŠŠK Bernolákova VS Iuventa Michalovce",
        location: "Hala Bernolákova, Košice"
    },
    {
        header: "ŽENY - PRÍPRAVNÝ ZÁPAS",
        date: "Nedeľa 13.10.2024 o 16:00",
        teams: "ŠŠK Bernolákova VS Prešov",
        location: "Hala Bernolákova, Košice"
    },
    {
        header: "NOVINKA",
        date: "",
        teams: "Úspešný turnaj v Maďarsku",
        description: "Naše mladšie žiačky obsadili krásne 2. miesto na medzinárodnom turnaji...",
        location: ""
    }
];

// =============================================
// HAMBURGER MENU - Mobilné menu
// =============================================
function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    
    if (!hamburger || !navLinks) return;
    
    // Toggle menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

// =============================================
// ACTIVE NAVIGATION - Zvýraznenie aktívnej sekcie
// =============================================
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');
    
    if (sections.length === 0 || navLinksAll.length === 0) return;
    
    function updateActiveLink() {
        let current = '';
        const scrollPosition = window.scrollY;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinksAll.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Initial call
}

// =============================================
// BACK TO TOP BUTTON - Tlačidlo späť hore
// =============================================
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');
    
    if (!backToTop) return;
    
    function toggleBackToTop() {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    }
    
    window.addEventListener('scroll', toggleBackToTop);
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    toggleBackToTop(); // Initial call
}

// =============================================
// SCROLL ANIMATIONS - Fade-in efekty
// =============================================
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if (fadeElements.length === 0) return;
    
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };
    
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);
    
    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });
    
    return appearOnScroll;
}

// =============================================
// LAZY LOAD IMAGES - Optimalizované načítanie obrázkov
// =============================================
function initLazyLoadImages() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                
                // Load image from data-src attribute
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                
                // Add loaded class for fade-in effect
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    // Observe all images with data-src or loading="lazy"
    document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
        imageObserver.observe(img);
    });
}

// =============================================
// LOAD MATCHES - Dynamické načítanie zápasov
// =============================================
function loadMatches() {
    const container = document.getElementById('matchesContainer');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    matchesData.forEach(match => {
        const card = document.createElement('div');
        card.className = 'match-card fade-in';
        
        let bodyContent = '';
        if (match.date) {
            bodyContent += `<div class="match-info">${match.date}</div>`;
        }
        bodyContent += `<div class="match-teams">${match.teams}</div>`;
        if (match.description) {
            bodyContent += `<p style="font-size: 0.9rem;">${match.description}</p>`;
        }
        if (match.location) {
            bodyContent += `<div class="match-info">${match.location}</div>`;
        }
        
        card.innerHTML = `
            <div class="match-header">${match.header}</div>
            <div class="match-body">
                ${bodyContent}
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Re-observe new elements for animations
    const observer = initScrollAnimations();
    if (observer) {
        container.querySelectorAll('.fade-in').forEach(el => {
            observer.observe(el);
        });
    }
}

// =============================================
// CONTACT FORM - Kontaktný formulár
// =============================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
    if (!contactForm || !formStatus) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            age: document.getElementById('age').value,
            message: document.getElementById('message').value
        };
        
        // Simulate form submission (replace with actual API call)
        try {
            // Show loading state
            formStatus.style.display = 'block';
            formStatus.className = 'form-status';
            formStatus.textContent = '⏳ Odosiela sa...';
            
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Success
            formStatus.className = 'form-status success';
            formStatus.textContent = '✓ Správa bola úspešne odoslaná! Ozveme sa vám čoskoro.';
            
            // Save to localStorage for demo purposes
            const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
            submissions.push({
                ...formData,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('formSubmissions', JSON.stringify(submissions));
            
            // Reset form
            contactForm.reset();
            
            // Hide message after 5 seconds
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 5000);
            
        } catch (error) {
            formStatus.className = 'form-status error';
            formStatus.textContent = '✗ Chyba pri odosielaní. Skúste to prosím znova.';
        }
    });
}

// =============================================
// GALLERY - Správa galérie s nahrávaním súborov
// =============================================
function initGallery() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (!uploadZone || !fileInput || !galleryGrid) return;
    
    // Load saved images from localStorage
    function loadGallery() {
        const savedImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        
        if (savedImages.length === 0) {
            // Show placeholder images if no images uploaded
            const placeholderImages = [
                { src: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a26?w=500', caption: 'Tréning 1' },
                { src: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=500', caption: 'Zápas 1' },
                { src: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=500', caption: 'Tím' },
                { src: 'https://images.unsplash.com/photo-1593510452382-3c6156f0e449?w=500', caption: 'Turnaj' }
            ];
            
            placeholderImages.forEach(img => {
                addImageToGallery(img.src, img.caption, false);
            });
        } else {
            savedImages.forEach(imgData => {
                addImageToGallery(imgData.src, imgData.caption, false);
            });
        }
    }
    
    function addImageToGallery(src, caption, save = true) {
        const item = document.createElement('div');
        item.className = 'gallery-item fade-in';
        
        const img = document.createElement('img');
        img.dataset.src = src; // Use data-src for lazy loading
        img.alt = caption;
        img.loading = 'lazy';
        
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `<p>${caption}</p>`;
        
        item.appendChild(img);
        item.appendChild(overlay);
        galleryGrid.appendChild(item);
        
        // Trigger lazy loading for new image
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                        image.removeAttribute('data-src');
                    }
                    image.classList.add('loaded');
                    imageObserver.unobserve(image);
                }
            });
        });
        imageObserver.observe(img);
        
        if (save) {
            saveToLocalStorage(src, caption);
        }
    }
    
    function saveToLocalStorage(src, caption) {
        const savedImages = JSON.parse(localStorage.getItem('galleryImages') || '[]');
        savedImages.push({ src, caption });
        localStorage.setItem('galleryImages', JSON.stringify(savedImages));
    }
    
    // Click to upload
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Drag and drop handlers
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    function handleFiles(files) {
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const caption = prompt('Pridajte popis k fotke:', `Nová fotka ${index + 1}`) 
                        || `Fotka ${new Date().toLocaleDateString('sk-SK')}`;
                    addImageToGallery(e.target.result, caption);
                };
                
                reader.onerror = () => {
                    console.error('Chyba pri načítaní súboru:', file.name);
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Reset file input
        fileInput.value = '';
    }
    
    // Initialize gallery
    loadGallery();
}

// =============================================
// SMOOTH SCROLL - Plynulé scrollovanie k sekciám
// =============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            
            // Skip empty or just # links
            if (!href || href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            }
        });
    });
}

// =============================================
// PERFORMANCE MONITORING
// =============================================
function logPerformance() {
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                console.log(`📊 Čas načítania stránky: ${pageLoadTime}ms`);
            }, 0);
        });
    }
}

// =============================================
// MAIN INITIALIZATION
// =============================================
function initializeApp() {
    console.log('🚀 Inicializácia aplikácie...');
    
    // Initialize all modules
    initHamburgerMenu();
    initActiveNavigation();
    initBackToTop();
    initScrollAnimations();
    initLazyLoadImages();
    loadMatches();
    initContactForm();
    initGallery();
    initSmoothScroll();
    logPerformance();
    
    console.log('✅ Aplikácia úspešne načítaná!');
}

// =============================================
// START APPLICATION
// =============================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// =============================================
// ERROR HANDLING
// =============================================
window.addEventListener('error', (e) => {
    console.error('❌ Chyba aplikácie:', e.error);
});

// =============================================
// CLEANUP ON PAGE UNLOAD
// =============================================
window.addEventListener('beforeunload', () => {
    console.log('👋 Zatváram aplikáciu...');
});