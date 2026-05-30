// 💾 MODUL PRE LOCALSTORAGE A DATABÁZU
export class StorageManager {
    constructor() {
        this.prefix = 'ssk_bernolakova_';
        this.quota = 5 * 1024 * 1024;
    }

    save(key, data) {
        try {
            if (this.isQuotaExceeded()) {
                console.warn('⚠️ LocalStorage quota exceeded, cleaning old data');
                this.cleanOldData();
            }

            const storageKey = this.prefix + key;
            const item = {
                data: data,
                timestamp: Date.now(),
                version: '1.0'
            };

            localStorage.setItem(storageKey, JSON.stringify(item));
            console.log('💾 Uložené do localStorage:', key);
            return true;
            
        } catch (error) {
            console.error('❌ Chyba pri ukladaní:', error);
            return false;
        }
    }

    load(key) {
        try {
            const storageKey = this.prefix + key;
            const item = localStorage.getItem(storageKey);
            
            if (!item) return null;

            const parsed = JSON.parse(item);
            
            if (!parsed.timestamp || !parsed.data) {
                this.remove(key);
                return null;
            }

            console.log('📂 Načítané z localStorage:', key);
            return parsed.data;
            
        } catch (error) {
            console.error('❌ Chyba pri čítaní:', error);
            this.remove(key);
            return null;
        }
    }

    remove(key) {
        try {
            const storageKey = this.prefix + key;
            localStorage.removeItem(storageKey);
            console.log('🗑️ Odstránené z localStorage:', key);
        } catch (error) {
            console.error('❌ Chyba pri mazaní:', error);
        }
    }

    isQuotaExceeded() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length;
                }
            }
            return total > this.quota;
        } catch (error) {
            return false;
        }
    }

    cleanOldData() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const toRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.prefix)) {
                try {
                    const item = JSON.parse(localStorage.getItem(key));
                    if (item.timestamp && item.timestamp < oneWeekAgo) {
                        toRemove.push(key);
                    }
                } catch {
                    toRemove.push(key);
                }
            }
        }

        toRemove.forEach(key => localStorage.removeItem(key));
        console.log('🧹 Vyčistených položiek:', toRemove.length);
    }

    list() {
        const items = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(this.prefix)) {
                items.push(key.replace(this.prefix, ''));
            }
        }
        return items;
    }
}