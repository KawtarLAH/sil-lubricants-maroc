/**
 * SIL LUBRICANTS MAROC - GLOBAL INSTANT SEARCH ENGINE
 * Real-time product search by name, viscosity, OEM approval, or vehicle type
 */

class GlobalSearchEngine {
  constructor() {
    this.products = [];
    this.modal = null;
    this.input = null;
    this.resultsContainer = null;
    this.isLoaded = false;
  }

  async init() {
    try {
      const res = await fetch('data/products.json');
      if (!res.ok) throw new Error('Failed to load products');
      this.products = await res.json();
      this.isLoaded = true;
      this.createModal();
      this.setupTriggers();
    } catch (err) {
      console.error('Failed to init GlobalSearchEngine:', err);
    }
  }

  createModal() {
    if (document.getElementById('global-search-modal')) return;

    this.modal = document.createElement('div');
    this.modal.id = 'global-search-modal';
    this.modal.className = 'search-modal-backdrop';
    this.modal.innerHTML = `
      <div class="search-modal-container">
        <div class="search-modal-header">
          <div class="search-input-wrap">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" id="global-search-input" class="global-search-input" placeholder="Rechercher une huile, viscosité (ex: 5W30, 10W40), norme OEM (VW, MB, BMW)..." autocomplete="off">
            <button class="search-clear-btn" id="search-clear-btn" style="display:none;" aria-label="Effacer">&times;</button>
          </div>
          <button class="search-modal-close" id="search-modal-close" aria-label="Fermer">&times;</button>
        </div>

        <div class="search-quick-tags">
          <span class="search-tag-label">Populaire :</span>
          <button class="search-tag-btn" data-query="5W30">5W30</button>
          <button class="search-tag-btn" data-query="5W40">5W40</button>
          <button class="search-tag-btn" data-query="10W40">10W40</button>
          <button class="search-tag-btn" data-query="15W40">15W40</button>
          <button class="search-tag-btn" data-query="Moto">Moto 4T</button>
          <button class="search-tag-btn" data-query="ATF">ATF</button>
        </div>

        <div class="search-results-box" id="global-search-results">
          <div class="search-empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <p>Tapez un nom de produit, une viscosité ou une norme constructeur pour trouver votre lubrifiant SIL.</p>
          </div>
        </div>

        <div class="search-modal-footer">
          <div class="search-hint"><span>[Échap]</span> pour fermer</div>
          <div class="search-total-count">${this.products.length} références disponibles au Maroc</div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    this.input = document.getElementById('global-search-input');
    this.resultsContainer = document.getElementById('global-search-results');
    const clearBtn = document.getElementById('search-clear-btn');
    const closeBtn = document.getElementById('search-modal-close');

    this.input.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      clearBtn.style.display = q ? 'block' : 'none';
      this.search(q);
    });

    clearBtn.addEventListener('click', () => {
      this.input.value = '';
      clearBtn.style.display = 'none';
      this.search('');
      this.input.focus();
    });

    closeBtn.addEventListener('click', () => this.close());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.close();
    });

    this.modal.querySelectorAll('.search-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        this.input.value = query;
        clearBtn.style.display = 'block';
        this.search(query);
      });
    });
  }

  setupTriggers() {
    // Keyboard shortcut Ctrl+K or /
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.toggle();
      }
      if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
        this.close();
      }
    });

    // Wire up any search trigger buttons
    document.querySelectorAll('.search-trigger-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });
  }

  open() {
    if (!this.modal) this.createModal();
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      if (this.input) this.input.focus();
    }, 100);
  }

  close() {
    if (!this.modal) return;
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggle() {
    if (this.modal && this.modal.classList.contains('active')) {
      this.close();
    } else {
      this.open();
    }
  }

  search(query) {
    if (!this.resultsContainer) return;
    if (!query) {
      this.resultsContainer.innerHTML = `
        <div class="search-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <p>Tapez un nom de produit, une viscosité ou une norme constructeur pour trouver votre lubrifiant SIL.</p>
        </div>
      `;
      return;
    }

    const q = query.toLowerCase();
    const lang = window.i18n ? window.i18n.currentLang : 'fr';

    const matches = this.products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const code = (p.code || '').toLowerCase();
      const visc = (p.viscosity || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const subcat = (p.subcat_name_fr || p.subcat_name_en || '').toLowerCase();
      const specs = (p.specifications || []).join(' ').toLowerCase();
      const desc = (p[`desc_${lang}`] || p.desc_fr || '').toLowerCase();

      return name.includes(q) || code.includes(q) || visc.includes(q) || cat.includes(q) || subcat.includes(q) || specs.includes(q) || desc.includes(q);
    });

    if (matches.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-empty-state">
          <p style="color:var(--text-muted); font-size: 1.1rem;">Aucun lubrifiant trouvé pour "<strong>${query}</strong>".</p>
          <p style="font-size: 0.85rem; margin-top: 0.5rem;">Conseil : Essayez avec une viscosité générique comme <strong>5W30</strong>, <strong>5W40</strong> ou <strong>10W40</strong>.</p>
        </div>
      `;
      return;
    }

    this.resultsContainer.innerHTML = `
      <div class="search-results-count">${matches.length} produit(s) trouvé(s)</div>
      <div class="search-results-list">
        ${matches.slice(0, 15).map(p => {
          const targetPage = p.category === '2-wheels' ? '2-roues.html' : '4-roues.html';
          return `
            <div class="search-result-row">
              <div class="search-row-img-wrap">
                <img src="${p.image}" alt="${p.name}" class="search-row-img" onerror="this.src='https://www.sil-lubricants.com/wp-content/uploads/2026/04/SIL-POWER-ULTRA-5W40-Baixa-4.jpg'">
              </div>
              <div class="search-row-info">
                <div class="search-row-badges">
                  ${p.viscosity ? `<span class="badge-viscosity-mini">${p.viscosity}</span>` : ''}
                  <span class="badge-cat-mini">${p.subcat_name_fr || p.category}</span>
                </div>
                <h4 class="search-row-title">${p.name}</h4>
                <div class="search-row-specs">${(p.specifications || []).slice(0, 2).join(' · ')}</div>
              </div>
              <div class="search-row-actions">
                <a href="${targetPage}" class="btn btn-secondary btn-sm">Voir Catalogue</a>
                <button class="btn btn-primary btn-sm" onclick="window.quoteDrawer && window.quoteDrawer.addItem('${p.id}'); window.globalSearch && window.globalSearch.close();">
                  + Devis
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
  window.globalSearch = new GlobalSearchEngine();
  window.globalSearch.init();
});
