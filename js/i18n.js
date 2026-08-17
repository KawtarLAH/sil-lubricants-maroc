/**
 * SIL LUBRICANTS MAROC - MULTILINGUAL ENGINE (i18n)
 * Supports French (FR), English (EN), Arabic (AR with RTL)
 */

class I18nEngine {
  constructor() {
    this.currentLang = localStorage.getItem('sil_lang') || 'fr';
    this.translations = null;
    this.isLoaded = false;
  }

  async init() {
    try {
      const response = await fetch('data/translations.json');
      if (!response.ok) throw new Error('Failed to load translations.json');
      this.translations = await response.json();
      this.isLoaded = true;
      this.applyLanguage(this.currentLang);
      this.setupEventListeners();
    } catch (err) {
      console.error('i18n initialization error:', err);
    }
  }

  setLanguage(lang) {
    if (!['fr', 'en', 'ar'].includes(lang)) return;
    this.currentLang = lang;
    localStorage.setItem('sil_lang', lang);
    this.applyLanguage(lang);
    
    // Dispatch global event for catalog and dynamic loaders
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  applyLanguage(lang) {
    const htmlEl = document.documentElement;
    htmlEl.setAttribute('lang', lang);
    htmlEl.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Update active state on language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (!this.translations) return;

    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.getText(key, lang);
      if (text) {
        el.innerHTML = text;
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.getText(key, lang);
      if (text) {
        el.setAttribute('placeholder', text);
      }
    });

    // Translate element titles/tooltips
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const text = this.getText(key, lang);
      if (text) {
        el.setAttribute('title', text);
      }
    });
  }

  getText(path, lang = this.currentLang) {
    if (!this.translations) return '';
    const keys = path.split('.');
    let current = this.translations;
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return '';
      }
    }

    if (current && typeof current === 'object') {
      return current[lang] || current['fr'] || '';
    }
    return current || '';
  }

  setupEventListeners() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLang = btn.dataset.lang;
        this.setLanguage(selectedLang);
      });
    });
  }
}

// Global instance
window.i18n = new I18nEngine();
document.addEventListener('DOMContentLoaded', () => {
  window.i18n.init();
});
