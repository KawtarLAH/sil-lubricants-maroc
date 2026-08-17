/**
 * SIL LUBRICANTS MAROC - QUOTE DRAWER & MULTI-PRODUCT CART
 * Allows users and workshops to build multi-product inquiries and send formatted WhatsApp quotes.
 */

class QuoteDrawerEngine {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('sil_quote_items') || '[]');
    this.products = [];
  }

  async init() {
    try {
      const res = await fetch('data/products.json');
      if (res.ok) {
        this.products = await res.json();
      }
    } catch (e) {
      console.warn('Quote drawer products error:', e);
    }

    this.renderFloatingTrigger();
    this.renderDrawerMarkup();
    this.updateUI();

    window.addEventListener('languageChanged', () => {
      this.updateUI();
    });
  }

  renderFloatingTrigger() {
    if (document.getElementById('quote-drawer-trigger')) return;

    const btn = document.createElement('button');
    btn.id = 'quote-drawer-trigger';
    btn.className = 'floating-quote-btn';
    btn.setAttribute('aria-label', 'Ouvrir mon devis');
    btn.innerHTML = `
      <div class="quote-btn-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        <span class="quote-badge-count" id="quote-count-badge">0</span>
      </div>
      <span class="quote-btn-text" data-i18n="quote_drawer.open_drawer">Devis</span>
    `;

    btn.addEventListener('click', () => this.open());
    document.body.appendChild(btn);
  }

  renderDrawerMarkup() {
    if (document.getElementById('quote-drawer-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'quote-drawer-overlay';
    overlay.className = 'quote-drawer-overlay';

    overlay.innerHTML = `
      <div class="quote-drawer-panel">
        <div class="quote-drawer-header">
          <div>
            <h3 class="quote-drawer-title" data-i18n="quote_drawer.title">Votre Demande de Devis</h3>
            <span class="quote-drawer-subtitle"><span id="drawer-items-count">0</span> <span data-i18n="quote_drawer.items_count">produit(s) sélectionné(s)</span></span>
          </div>
          <button class="quote-drawer-close" aria-label="Fermer" onclick="window.quoteDrawer.close()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div class="quote-drawer-body" id="quote-items-container">
          <!-- Injected items -->
        </div>

        <div class="quote-drawer-footer" id="quote-drawer-footer">
          <button class="btn btn-whatsapp btn-block" onclick="window.quoteDrawer.sendWhatsApp()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            <span data-i18n="quote_drawer.btn_whatsapp">Envoyer sur WhatsApp Maroc</span>
          </button>
          <button class="btn btn-secondary btn-block" onclick="window.quoteDrawer.sendEmailForm()" style="margin-top: 0.5rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span data-i18n="quote_drawer.btn_email">Finaliser par Formulaire Email</span>
          </button>
          <button class="quote-clear-btn" onclick="window.quoteDrawer.clear()" data-i18n="quote_drawer.btn_clear">Vider la liste</button>
        </div>
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    document.body.appendChild(overlay);
  }

  addItem(productId, packaging = '5L', quantity = 1) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = this.items.findIndex(i => i.id === productId && i.packaging === packaging);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: productId,
        name: product.name,
        viscosity: product.viscosity,
        image: product.image,
        packaging: packaging || product.packaging[0] || '5L',
        quantity: quantity
      });
    }

    this.save();
    this.updateUI();

    const addedMsg = window.i18n ? window.i18n.getText('quote_drawer.item_added') : 'Produit ajouté à votre devis !';
    if (typeof showToast === 'function') {
      showToast(addedMsg);
    }
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.save();
    this.updateUI();
  }

  updateQuantity(index, delta) {
    if (this.items[index]) {
      this.items[index].quantity = Math.max(1, this.items[index].quantity + delta);
      this.save();
      this.updateUI();
    }
  }

  updatePackaging(index, newPkg) {
    if (this.items[index]) {
      this.items[index].packaging = newPkg;
      this.save();
    }
  }

  save() {
    localStorage.setItem('sil_quote_items', JSON.stringify(this.items));
  }

  clear() {
    this.items = [];
    this.save();
    this.updateUI();
  }

  open() {
    const overlay = document.getElementById('quote-drawer-overlay');
    if (overlay) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    const overlay = document.getElementById('quote-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  updateUI() {
    const countBadge = document.getElementById('quote-count-badge');
    const drawerCount = document.getElementById('drawer-items-count');
    const container = document.getElementById('quote-items-container');
    const footer = document.getElementById('quote-drawer-footer');

    const totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0);

    if (countBadge) {
      countBadge.textContent = totalCount;
      countBadge.style.display = totalCount > 0 ? 'flex' : 'none';
    }
    if (drawerCount) drawerCount.textContent = this.items.length;

    if (!container) return;

    if (this.items.length === 0) {
      const emptyTitle = window.i18n ? window.i18n.getText('quote_drawer.empty') : 'Votre liste de devis est vide.';
      const emptySub = window.i18n ? window.i18n.getText('quote_drawer.empty_sub') : 'Parcourez notre catalogue et ajoutez des produits.';
      container.innerHTML = `
        <div class="quote-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <h4>${emptyTitle}</h4>
          <p>${emptySub}</p>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';

    container.innerHTML = this.items.map((item, idx) => {
      const product = this.products.find(p => p.id === item.id);
      const pkgOptions = product ? product.packaging : ['1L', '5L', '20L', '208L (Fût)'];

      return `
        <div class="quote-item-row">
          <img src="${item.image}" alt="${item.name}" class="quote-item-img">
          <div class="quote-item-info">
            <div style="display:flex; justify-content:space-between;">
              <h4 class="quote-item-name">${item.name}</h4>
              <button class="quote-item-del" onclick="window.quoteDrawer.removeItem(${idx})" aria-label="Supprimer">&times;</button>
            </div>
            <span class="badge-viscosity" style="font-size:0.75rem; padding:1px 5px;">${item.viscosity}</span>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
              <select class="quote-pkg-select" onchange="window.quoteDrawer.updatePackaging(${idx}, this.value)">
                ${pkgOptions.map(opt => `<option value="${opt}" ${opt === item.packaging ? 'selected' : ''}>${opt}</option>`).join('')}
              </select>
              <div class="quote-qty-stepper">
                <button onclick="window.quoteDrawer.updateQuantity(${idx}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="window.quoteDrawer.updateQuantity(${idx}, 1)">+</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  sendWhatsApp() {
    if (this.items.length === 0) return;

    const contactData = window.contactLoader?.contactData;
    const waNum = contactData?.whatsapp?.number?.replace(/\D/g, '') || '212661000000';

    const lang = window.i18n ? window.i18n.currentLang : 'fr';
    let msg = `*DEMANDE DE DEVIS SIL LUBRICANTS MAROC*\n----------------------------------------\n`;
    if (lang === 'en') {
      msg = `*SIL LUBRICANTS MOROCCO QUOTE REQUEST*\n----------------------------------------\n`;
    } else if (lang === 'ar') {
      msg = `*طلب عرض أسعار - زيوت SIL المغرب*\n----------------------------------------\n`;
    }

    this.items.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.name}* (${item.viscosity})\n   - Conditionnement: ${item.packaging}\n   - Quantité: ${item.quantity}\n\n`;
    });

    msg += `----------------------------------------\nMerci de nous transmettre les prix et disponibilités au Maroc.`;

    const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    this.close();
  }

  sendEmailForm() {
    this.close();
    const contactSection = document.getElementById('contact-maroc');
    const msgField = document.getElementById('contact-message');

    let summary = "Demande de devis pour les produits suivants :\n";
    this.items.forEach((i, idx) => {
      summary += `${idx + 1}) ${i.name} [${i.viscosity}] - Format: ${i.packaging} x ${i.quantity}\n`;
    });

    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      if (msgField) msgField.value = summary;
    } else {
      window.location.href = `index.html#contact-maroc?quote=${encodeURIComponent(summary)}`;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.quoteDrawer = new QuoteDrawerEngine();
  window.quoteDrawer.init();
});
