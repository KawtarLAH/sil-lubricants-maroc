/**
 * SIL LUBRICANTS MAROC - CATALOG & PRODUCT FILTER ENGINE
 * Handles product listing, dynamic multi-criteria search, subcategory pills,
 * viscosity filters, and technical specification modals.
 */

class CatalogEngine {
  constructor(categoryFilter = null) {
    this.products = [];
    this.filteredProducts = [];
    this.categoryFilter = categoryFilter; // '4-roues' or '2-roues' or null
    this.activeSubcategory = 'all';
    this.activeViscosity = 'all';
    this.searchQuery = '';
    this.currentProductModal = null;
  }

  async init() {
    try {
      const res = await fetch('data/products.json');
      if (!res.ok) throw new Error('Could not load data/products.json');
      this.products = await res.json();
      
      this.setupControls();
      this.populateViscosityFilter();
      this.applyFilters();

      // Listen for language changes to re-render texts
      window.addEventListener('languageChanged', () => {
        this.renderProducts();
        if (this.currentProductModal) {
          this.renderModal(this.currentProductModal);
        }
      });
    } catch (err) {
      console.error('Catalog initialization error:', err);
    }
  }

  getLang() {
    return window.i18n ? window.i18n.currentLang : 'fr';
  }

  setupControls() {
    // Search input
    const searchInput = document.getElementById('catalog-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim().toLowerCase();
        this.applyFilters();
      });
    }

    // Viscosity dropdown
    const viscSelect = document.getElementById('viscosity-filter');
    if (viscSelect) {
      viscSelect.addEventListener('change', (e) => {
        this.activeViscosity = e.target.value;
        this.applyFilters();
      });
    }

    // Subcategory pills
    document.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeSubcategory = btn.dataset.subcat || 'all';
        this.applyFilters();
      });
    });

    // Modal Close button & backdrop click
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.modal-close-btn')) {
          this.closeModal();
        }
      });
    }

    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
    });
  }

  populateViscosityFilter() {
    const viscSelect = document.getElementById('viscosity-filter');
    if (!viscSelect) return;

    // Extract unique viscosities based on current category
    const relevantProducts = this.categoryFilter 
      ? this.products.filter(p => p.main_category === this.categoryFilter)
      : this.products;

    const viscosities = Array.from(new Set(relevantProducts.map(p => p.viscosity)))
      .filter(v => v && v !== 'Spécifique')
      .sort();

    // Preserve first option
    const firstOption = viscSelect.options[0];
    viscSelect.innerHTML = '';
    viscSelect.appendChild(firstOption);

    viscosities.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      viscSelect.appendChild(opt);
    });
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(p => {
      // 1. Main Category filter
      if (this.categoryFilter && p.main_category !== this.categoryFilter) {
        return false;
      }

      // 2. Subcategory filter
      if (this.activeSubcategory !== 'all' && p.subcategory_id !== this.activeSubcategory) {
        return false;
      }

      // 3. Viscosity filter
      if (this.activeViscosity !== 'all' && p.viscosity !== this.activeViscosity) {
        return false;
      }

      // 4. Text Search
      if (this.searchQuery) {
        const lang = this.getLang();
        const searchPool = [
          p.name,
          p.viscosity,
          p.specs.join(' '),
          p.subcategory_name[lang] || p.subcategory_name.fr,
          p.description[lang] || p.description.fr
        ].join(' ').toLowerCase();

        return searchPool.includes(this.searchQuery);
      }

      return true;
    });

    this.renderProducts();
  }

  renderProducts() {
    const grid = document.getElementById('product-grid');
    const countEl = document.getElementById('results-count');
    const noResultsEl = document.getElementById('no-results-msg');

    if (!grid) return;

    const lang = this.getLang();

    if (countEl) {
      countEl.textContent = this.filteredProducts.length;
    }

    if (this.filteredProducts.length === 0) {
      grid.innerHTML = '';
      if (noResultsEl) noResultsEl.style.display = 'block';
      return;
    }

    if (noResultsEl) noResultsEl.style.display = 'none';

    grid.innerHTML = this.filteredProducts.map(p => {
      const subcatTitle = p.subcategory_name[lang] || p.subcategory_name.fr;
      const specsHtml = p.specs.slice(0, 3).map(s => `
        <div class="spec-line" title="${s}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          <span>${s}</span>
        </div>
      `).join('');

      const btnDetailsText = window.i18n ? window.i18n.getText('catalog_page.view_details') : 'Fiche Technique';
      const btnQuoteText = window.i18n ? window.i18n.getText('catalog_page.order_quote') : 'Commander';

      return `
        <div class="product-card" data-product-id="${p.id}">
          <div class="product-header-badges">
            <span class="badge-viscosity">${p.viscosity}</span>
            <span class="badge-subcat" title="${subcatTitle}">${subcatTitle}</span>
          </div>
          <div class="product-img-wrap">
            <img src="${p.image}" alt="${p.name}" class="product-img" loading="lazy" onerror="this.src='https://www.sil-lubricants.com/wp-content/uploads/2026/04/SIL-POWER-ULTRA-5W40-Baixa-4.jpg'">
          </div>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-specs-list">
            ${specsHtml || '<div class="spec-line"><span>Normes & formulation haute pureté SIL</span></div>'}
          </div>
          <div class="product-card-actions">
            <button class="btn btn-secondary btn-sm btn-open-modal" onclick="window.catalog.openModal('${p.id}')">
              ${btnDetailsText}
            </button>
            <button class="btn btn-primary btn-sm btn-product-quote" onclick="window.catalog.quoteProduct('${p.id}')">
              ${btnQuoteText}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  openModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    this.currentProductModal = product;
    this.renderModal(product);

    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  renderModal(p) {
    const lang = this.getLang();
    const subcatTitle = p.subcategory_name[lang] || p.subcategory_name.fr;
    const descText = p.description[lang] || p.description.fr;
    const appText = p.applications[lang] || p.applications.fr;

    const specsHtml = p.specs.length > 0
      ? p.specs.map(s => `<div class="spec-chip"><strong>${s}</strong></div>`).join('')
      : `<div class="spec-chip">Formule certifiée laboratoire R&D SIL Lubricants</div>`;

    const packagingHtml = p.packaging.map(pk => `<span class="packaging-pill">${pk}</span>`).join('');

    const modalContent = document.getElementById('modal-content-slot');
    if (!modalContent) return;

    const titleSpecs = window.i18n ? window.i18n.getText('catalog_page.specifications') : 'Normes & Homologations';
    const titlePackaging = window.i18n ? window.i18n.getText('catalog_page.packaging') : 'Conditionnements';
    const titleApp = window.i18n ? window.i18n.getText('catalog_page.applications') : 'Applications';
    const btnQuote = window.i18n ? window.i18n.getText('catalog_page.order_quote') : 'Commander / Devis';
    const btnWa = window.i18n ? window.i18n.getText('contact_section.btn_whatsapp_direct') : 'WhatsApp';

    modalContent.innerHTML = `
      <div class="modal-grid">
        <div class="modal-gallery">
          <img src="${p.image}" alt="${p.name}" class="modal-product-img">
          <div style="margin-top: 1.5rem; text-align: center;">
            <span class="badge-viscosity" style="font-size: 1.1rem; padding: 4px 12px;">${p.viscosity}</span>
          </div>
        </div>
        <div class="modal-details">
          <h2 class="modal-product-title">${p.name}</h2>
          <span class="modal-subcat-badge">${subcatTitle}</span>
          <p class="modal-description">${descText}</p>

          <h4 class="modal-section-title">${titleSpecs}</h4>
          <div class="specs-chip-list">${specsHtml}</div>

          <h4 class="modal-section-title">${titlePackaging}</h4>
          <div class="packaging-pills">${packagingHtml}</div>

          <h4 class="modal-section-title">${titleApp}</h4>
          <p class="modal-description" style="font-size: 0.9rem; margin-bottom: 1.5rem;">${appText}</p>

          <div class="modal-action-row">
            <button class="btn btn-primary btn-block" onclick="window.catalog.quoteProduct('${p.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              ${btnQuote}
            </button>
            <button class="btn btn-whatsapp btn-block" onclick="window.catalog.whatsappProduct('${p.id}')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              ${btnWa}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      this.currentProductModal = null;
    }
  }

  quoteProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    this.closeModal();

    // Scroll to contact section
    const contactSection = document.getElementById('contact-maroc');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      // Pre-fill message textarea if present
      const msgField = document.getElementById('contact-message');
      if (msgField) {
        msgField.value = `Demande de devis pour le produit : ${product.name} (${product.viscosity}). Quantité souhaitée : `;
        msgField.focus();
      }
    } else {
      // Redirect to index.html#contact-maroc with query param
      window.location.href = `index.html#contact-maroc?product=${encodeURIComponent(product.name)}`;
    }
  }

  whatsappProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const contactData = window.contactLoader ? window.contactLoader.contactData : null;
    const waNum = contactData && contactData.whatsapp ? contactData.whatsapp.number.replace(/\D/g, '') : '212661000000';
    
    const lang = this.getLang();
    let msg = `Bonjour SIL Lubricants Maroc, je souhaite commander ou avoir un devis pour : *${product.name}* (Viscosité: ${product.viscosity}).`;
    if (lang === 'en') {
      msg = `Hello SIL Lubricants Morocco, I would like to order or request a quote for: *${product.name}* (Viscosity: ${product.viscosity}).`;
    } else if (lang === 'ar') {
      msg = `السلام عليكم SIL Lubricants Maroc، أود طلب عرض سعر للمنتج: *${product.name}* (اللزوجة: ${product.viscosity}).`;
    }

    const url = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  }
}

// Initialized per page
window.CatalogEngine = CatalogEngine;
