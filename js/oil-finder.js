/**
 * SIL LUBRICANTS MAROC - OIL FINDER / RECOMMANDATION ENGINE
 */

class OilFinderEngine {
  constructor() {
    this.container = null;
    this.products = [];
  }

  async init() {
    this.container = document.getElementById('oil-finder-widget');
    if (!this.container) return;

    try {
      const res = await fetch('data/products.json');
      if (res.ok) {
        this.products = await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch products for oil finder:', e);
    }

    this.setupListeners();
    window.addEventListener('languageChanged', () => {
      this.recalculate();
    });
  }

  setupListeners() {
    const btnFind = document.getElementById('oil-finder-submit');
    const btnReset = document.getElementById('oil-finder-reset');

    if (btnFind) {
      btnFind.addEventListener('click', (e) => {
        e.preventDefault();
        this.recalculate();
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('finder-vehicle-type').value = 'car';
        document.getElementById('finder-engine-type').value = 'gasoline';
        document.getElementById('finder-viscosity').value = 'all';
        this.recalculate();
      });
    }

    // Auto calculate on dropdown change
    ['finder-vehicle-type', 'finder-engine-type', 'finder-viscosity'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => this.recalculate());
      }
    });
  }

  recalculate() {
    const vehicleType = document.getElementById('finder-vehicle-type')?.value || 'car';
    const engineType = document.getElementById('finder-engine-type')?.value || 'gasoline';
    const viscosity = document.getElementById('finder-viscosity')?.value || 'all';

    const resultBox = document.getElementById('oil-finder-results');
    if (!resultBox || this.products.length === 0) return;

    let matched = [];

    if (vehicleType === 'car' || vehicleType === 'suv') {
      if (engineType === 'diesel_dpf') {
        matched = this.products.filter(p => p.main_category === '4-roues' && (p.name.includes('5W30') || p.name.includes('0W30') || p.name.includes('0W20')) && p.name.includes('ULTRA'));
      } else if (engineType === 'hot_climate') {
        matched = this.products.filter(p => p.main_category === '4-roues' && (p.name.includes('5W40') || p.name.includes('10W50') || p.name.includes('10W40')));
      } else if (engineType === 'racing') {
        matched = this.products.filter(p => p.main_category === '4-roues' && (p.name.includes('10W50') || p.name.includes('5W40')));
      } else {
        matched = this.products.filter(p => p.main_category === '4-roues' && p.subcategory_id === '4r_light_synth');
      }
    } else if (vehicleType === 'truck') {
      matched = this.products.filter(p => p.main_category === '4-roues' && p.subcategory_id === '4r_heavy_duty');
    } else if (vehicleType === 'agri') {
      matched = this.products.filter(p => p.main_category === '4-roues' && p.subcategory_id === '4r_agri_tp');
    } else if (vehicleType === 'tp') {
      matched = this.products.filter(p => p.main_category === '4-roues' && (p.subcategory_id === '4r_hydraulic' || p.subcategory_id === '4r_agri_tp'));
    } else if (vehicleType === 'moto4t') {
      matched = this.products.filter(p => p.main_category === '2-roues' && (p.subcategory_id === '2r_4t_factory' || p.subcategory_id === '2r_4t_synthetic'));
    } else if (vehicleType === 'moto2t') {
      matched = this.products.filter(p => p.main_category === '2-roues' && p.subcategory_id === '2r_2t');
    }

    // Filter by viscosity if specific
    if (viscosity !== 'all') {
      const filteredByVisc = matched.filter(p => p.viscosity === viscosity);
      if (filteredByVisc.length > 0) matched = filteredByVisc;
    }

    if (matched.length === 0) {
      matched = this.products.filter(p => p.id === 'sil-power-ultra-5w40' || p.id === 'sil-power-ultra-5w30');
    }

    const topProduct = matched[0] || this.products[0];
    this.renderResult(topProduct, resultBox);
  }

  renderResult(p, container) {
    const lang = window.i18n ? window.i18n.currentLang : 'fr';
    const subcat = p.subcategory_name[lang] || p.subcategory_name.fr;
    const desc = p.description[lang] || p.description.fr;
    const specs = p.specs.slice(0, 3).join(' | ');

    const btnQuoteText = window.i18n ? window.i18n.getText('oil_finder.add_to_quote') : 'Ajouter au Devis';
    const btnWaText = window.i18n ? window.i18n.getText('oil_finder.direct_order') : 'WhatsApp Direct';
    const titleResult = window.i18n ? window.i18n.getText('oil_finder.result_title') : 'Notre Recommandation SIL';

    container.innerHTML = `
      <div class="finder-result-card">
        <div class="finder-result-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span>${titleResult}</span>
        </div>
        <div class="finder-result-content">
          <div class="finder-result-img-wrap">
            <img src="${p.image}" alt="${p.name}" class="finder-result-img" onerror="this.src='https://www.sil-lubricants.com/wp-content/uploads/2026/04/SIL-POWER-ULTRA-5W40-Baixa-4.jpg'">
          </div>
          <div class="finder-result-details">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <span class="badge-viscosity">${p.viscosity}</span>
              <span style="font-size:0.8rem; color:var(--text-muted);">${subcat}</span>
            </div>
            <h3 style="color:#fff; font-size:1.35rem; margin-bottom:0.5rem;">${p.name}</h3>
            <p style="font-size:0.9rem; color:var(--text-secondary); line-height:1.5; margin-bottom:0.75rem;">${desc}</p>
            <div style="background:var(--bg-secondary); padding:0.5rem 0.75rem; border-radius:var(--radius-sm); font-size:0.8rem; color:var(--accent-green); margin-bottom:1.25rem;">
              <strong>${specs || 'Formule certifiée SIL'}</strong>
            </div>
            <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
              <button class="btn btn-primary btn-sm" onclick="window.quoteDrawer.addItem('${p.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                ${btnQuoteText}
              </button>
              <button class="btn btn-whatsapp btn-sm" onclick="window.catalog ? window.catalog.whatsappProduct('${p.id}') : window.open('https://wa.me/212661000000', '_blank')">
                ${btnWaText}
              </button>
              <button class="btn btn-secondary btn-sm" onclick="window.catalog ? window.catalog.openModal('${p.id}') : (window.location.href='4-roues.html')">
                Fiche complète
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.oilFinder = new OilFinderEngine();
  window.oilFinder.init();
});
