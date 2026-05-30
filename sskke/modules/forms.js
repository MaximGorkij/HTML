// 📝 MODUL PRE FORMULÁRE A KONTAKTY
export class FormManager {
    constructor() {
        this.forms = new Map();
    }

    async init() {
        console.log('📝 Inicializácia FormManager...');
        
        try {
            await this.setupContactButton();
            this.setupNewsletterForm();
            
            console.log('✅ FormManager pripravený');
        } catch (error) {
            console.error('❌ Chyba v FormManager:', error);
        }
    }

    setupContactButton() {
        const contactBtn = document.querySelector('.btn[style*="background: white"]');
        if (contactBtn) {
            contactBtn.addEventListener('click', (e) => this.handleContactClick(e));
        }
    }

    setupNewsletterForm() {
        const newsletterHTML = `
            <div class="newsletter-form" style="margin-top: 20px;">
                <input type="email" placeholder="Váš email pre novinky" 
                       style="padding: 10px; border: none; border-radius: 5px; margin-right: 10px;">
                <button class="btn" style="background: var(--primary-yellow); color: var(--primary-blue);">
                    Odoberať
                </button>
            </div>
        `;
        
        const recruitment = document.querySelector('.recruitment');
        if (recruitment) {
            recruitment.insertAdjacentHTML('beforeend', newsletterHTML);
            
            const newsletterBtn = recruitment.querySelector('.newsletter-form .btn');
            newsletterBtn.addEventListener('click', () => this.handleNewsletterSignup());
        }
    }

    handleContactClick(e) {
        e.preventDefault();
        const phone = '+421 900 000 000';
        
        if (confirm(`Chcete zavolať na ${phone}?`)) {
            this.trackEvent('contact_click', { method: 'phone' });
            window.location.href = `tel:${phone}`;
        }
    }

    async handleNewsletterSignup() {
        const input = document.querySelector('.newsletter-form input');
        const email = input.value.trim();
        
        if (!this.validateEmail(email)) {
            alert('Prosím, zadajte platný email');
            return;
        }

        try {
            await this.subscribeToNewsletter(email);
            input.value = '';
            alert('Ďakujeme za váš záujem!');
            
        } catch (error) {
            console.error('❌ Chyba pri odbere:', error);
            alert('Došlo k chybe, skúste to prosím neskôr.');
        }
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async subscribeToNewsletter(email) {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('📧 Email uložený:', email);
                resolve({ success: true });
            }, 500);
        });
    }

    trackEvent(eventName, data) {
        console.log(`📊 Event: ${eventName}`, data);
    }

    destroy() {
        this.forms.clear();
    }
}