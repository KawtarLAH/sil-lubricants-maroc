/**
 * SIL LUBRICANTS MAROC - PRODUCT COMPARATOR MODULE
 */

class ComparatorEngine {
  constructor() {
    this.comparedIds = JSON.parse(localStorage.getItem('sil_compared_ids') || '[]');
    this.products = [];
  }

  async init() {
    try {
      const res = await fetch('data/products.json');
      if (res.ok) {
        this.products = await res.json();
      }
    } catch (e) {
      console.warn('Comparator load error:', e);
    }

    this.renderComparatorBar();
    this.renderModal();
    this.updateBar();

    window.addEventListener('languageChanged', () => {
      this.updateBar();
      if (document.getElementById('comparator-modal')?.classList.contains('active')) {
        this.renderTable();
      }
    });
  }

  renderComparatorBar() {
    if (document.getElementById('comparator-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'comparator-bar';
    bar.className = 'comparator-bar';

    bar.innerHTML = `
      <div class="container comparator-bar-inner">
        <div class="comparator-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          <span><strong id="compare-count">0</strong> / 3 <span data-i18n="comparator.btn_compare">produits à comparer</span></span>
        </div>
        <div class="comparator-thumbs" id="comparator-thumbs"></div>
        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-primary btn-sm" onclick="window.comparator.openModal()" data-i18n="comparator.btn_compare">Comparer</button>
          <button class="btn btn-secondary btn-sm" onclick="window.comparator.clear()" data-i18n="comparator.remove">Vider</button>
        </div>
      </div>
    `;

    document.body.appendChild(bar);
  }

  renderModal() {
    if (document.getElementById('comparator-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'comparator-modal';
    modal.className = 'modal-overlay';

    modal.innerHTML = `
      <div class="modal-card" style="max-width: 960px;">
        <button class="modal-close-btn" onclick="window.comparator.closeModal()" aria-label="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div style="padding: 2.5rem;" id="comparator-table-slot">
          <!-- Injected Table -->
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });

    document.body.appendChild(modal);
  }

  toggle(productId) {
    const idx = this.comparedIds.indexOf(productId);
    if (idx > -1) {
      this.comparedIds.splice(idx, 1);
    } else {
      if (this.comparedIds.length >= 3) {
        this.comparedIds.shift(); // keep max 3
      }
      this.comparedIds.push(productId);
    }

    this.save();
    this.updateBar();

    if (typeof showToast === 'function') {
      showToast('Liste de comparaison mise à jour !');
    }
  }

  save() {
    localStorage.setItem('sil_compared_ids', JSON.stringify(this.comparedIds));
  }

  clear() {
    this.comparedIds = [];
    this.save();
    this.updateBar();
    this.closeModal();
  }

  updateBar() {
    const bar = document.getElementById('comparator-bar');
    const count = document.getElementById('compare-count');
    const thumbs = document.getElementById('comparator-thumbs');

    if (!bar) return;

    if (this.comparedIds.length > 0) {
      bar.classList.add('visible');
    } else {
      bar.classList.remove('visible');
    }

    if (count) count.textContent = this.comparedIds.length;

    if (thumbs) {
      const selectedProducts = this.products.filter(p => this.comparedIds.includes(p.id));
      thumbs.innerHTML = selectedProducts.map(p => `
        <div class="compare-thumb" title="${p.name}">
          <img src="${p.image}" alt="${p.name}">
          <span class="compare-thumb-del" onclick="window.comparator.toggle('${p.id}')">&times;</span>
        </div>
      `).join('');
    }
  }

  openModal() {
    const modal = document.getElementById('comparator-modal');
    if (!modal) return;

    this.renderTable();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    const modal = document.getElementById('comparator-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  renderTable() {
    const slot = document.getElementById('comparator-table-slot');
    if (!slot) return;

    const selected = this.products.filter(p => this.comparedIds.includes(p.id));
    const lang = window.i18n ? window.i18n.currentLang : 'fr';

    if (selected.length === 0) {
      slot.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:2rem;">Aucun produit sélectionné pour la comparaison.</p>`;
      return;
    }

    const title = window.i18n ? window.i18n.getText('comparator.title') : 'Comparateur Technique de Lubrifiants';
    const sub = window.i18n ? window.i18n.getText('comparator.subtitle') : 'Comparez les caractéristiques côte à côte.';

    slot.innerHTML = `
      <div style="margin-bottom: 2rem; border-bottom:1px solid var(--border-light); padding-bottom:1rem;">
        <h2 style="font-size:1.8rem; color:#fff; margin-bottom:0.5rem;">${title}</h2>
        <p style="color:var(--text-muted); font-size:0.95rem;">${sub}</p>
      </div>

      <div style="overflow-x: auto;">
        <table class="comparator-table">
          <thead>
            <tr>
              <th style="width: 20%;">Caractéristique</th>
              ${selected.map(p => `
                <th style="width: ${80 / selected.length}%; text-align:center;">
                  <img src="${p.image}" alt="${p.name}" style="height:100px; margin:0 auto 0.5rem auto; object-fit:contain;">
                  <h4 style="font-size:1rem; color:#fff;">${p.name}</h4>
                  <button class="btn btn-outline btn-sm" style="margin-top:0.5rem;" onclick="window.quoteDrawer.addItem('${p.id}')">+ Ajouter au devis</button>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Viscosité SAE</strong></td>
              ${selected.map(p => `<td><span class="badge-viscosity">${p.viscosity}</span></td>`).join('')}
            </tr>
            <tr>
              <td><strong>Gamme</strong></td>
              ${selected.map(p => `<td>${p.subcategory_name[lang] || p.subcategory_name.fr}</td>`).join('')}
            </tr>
            <tr>
              <td><strong>Homologations OEM</strong></td>
              ${selected.map(p => `
                <td>
                  <ul style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5;">
                    ${p.specs.map(s => `<li>• ${s}</li>`).join('')}
                  </ul>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td><strong>Conditionnements</strong></td>
              ${selected.map(p => `<td><div style="display:flex; flex-wrap:wrap; gap:4px;">${p.packaging.map(pk => `<span class="packaging-pill">${pk}</span>`).join('')}</div></td>`).join('')}
            </tr>
            <tr>
              <td><strong>Recommandation</strong></td>
              ${selected.map(p => `<td style="font-size:0.85rem; line-height:1.5;">${p.applications[lang] || p.applications.fr}</td>`).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.comparator = new ComparatorEngine();
  window.comparator.init();
});
