/**
 * SIL LUBRICANTS MAROC - REGIONAL DELIVERY & HUB CALCULATOR
 * Instant delivery lead times, regional stock status and WhatsApp direct connection for 20+ Moroccan cities
 */

const MOROCCAN_CITIES_DATA = [
  { id: 'casablanca', name_fr: 'Casablanca', name_ar: 'الدار البيضاء', hub: 'Plateforme Centrale (Sidi Bernoussi)', time_fr: 'Même jour (H+4) ou 24h', time_ar: 'نفس اليوم (خلال 4 ساعات) أو 24 ساعة', status: 'Stock permanent intégral', contact: '+212 6 61 00 00 00', min_order: '1 carton / 1 bidon' },
  { id: 'mohammedia', name_fr: 'Mohammedia', name_ar: 'المحمدية', hub: 'Hub Central Casa-Nord', time_fr: 'Même jour / 24h', time_ar: 'نفس اليوم أو 24 ساعة', status: 'Stock permanent', contact: '+212 6 61 00 00 00', min_order: '1 carton' },
  { id: 'rabat', name_fr: 'Rabat & Salé & Témara', name_ar: 'الرباط، سلا، تمارة', hub: 'Dépôt Régional Centre-Atlantique', time_fr: '24h chrono', time_ar: 'خلال 24 ساعة', status: 'Stock complet', contact: '+212 6 61 00 00 00', min_order: '1 carton' },
  { id: 'kenitra', name_fr: 'Kénitra & Zone Franche', name_ar: 'القنيطرة والمنطقة الحرة', hub: 'Hub Gharb Industriel', time_fr: '24h chrono', time_ar: 'خلال 24 ساعة', status: 'Stock industriel & auto', contact: '+212 6 61 00 00 00', min_order: '1 carton / fûts' },
  { id: 'tanger', name_fr: 'Tanger & TAC / TFZ', name_ar: 'طنجة والمناطق الحرة', hub: 'Dépôt Nord & Tanger Med', time_fr: '24h garanti', time_ar: '24 ساعة مضمونة', status: 'Stock lourd & industrie', contact: '+212 6 61 00 00 00', min_order: 'Cartons / Fûts 208L' },
  { id: 'tetouan', name_fr: 'Tétouan & Fnideq', name_ar: 'تطوان والفنيدق', hub: 'Hub Tanger / Tétouan', time_fr: '24h à 48h', time_ar: 'من 24 إلى 48 ساعة', status: 'Stock disponible', contact: '+212 6 61 00 00 00', min_order: '1 carton' },
  { id: 'marrakech', name_fr: 'Marrakech & Al Haouz', name_ar: 'مراكش والحوز', hub: 'Dépôt Régional Marrakech-Sud', time_fr: '24h chrono', time_ar: 'خلال 24 ساعة', status: 'Stock auto, moto & TP', contact: '+212 6 61 00 00 00', min_order: '1 carton' },
  { id: 'agadir', name_fr: 'Agadir, Inezgane & Taroudant', name_ar: 'أكادير، إنزكان وتارودانت', hub: 'Hub Souss-Massa & Pêche', time_fr: '24h à 48h', time_ar: '24 إلى 48 ساعة', status: 'Stock agricole & marine', contact: '+212 6 61 00 00 00', min_order: 'Cartons / Fûts' },
  { id: 'fes', name_fr: 'Fès & Sefrou', name_ar: 'فاس وصفرو', hub: 'Hub Régional Fès-Meknès', time_fr: '24h chrono', time_ar: 'خلال 24 ساعة', status: 'Stock complet', contact: '+212 6 61 00 00 00', min_order: '1 carton' },
  { id: 'meknes', name_fr: 'Meknès & El Hajeb', name_ar: 'مكناس والحاجب', hub: 'Hub Agricole & Auto', time_fr: '24h chrono', time_ar: 'خلال 24 ساعة', status: 'Stock tracteurs & VP', contact: '+212 6 61 00 00 00', min_order: '1 carton' },
  { id: 'oujda', name_fr: 'Oujda & Berkane', name_ar: 'وجدة وبركان', hub: 'Dépôt Région Oriental', time_fr: '48h', time_ar: 'خلال 48 ساعة', status: 'Stock disponible', contact: '+212 6 61 00 00 00', min_order: 'Cartons / Fûts' },
  { id: 'nador', name_fr: 'Nador & Port West Med', name_ar: 'الناظور', hub: 'Dépôt Oriental-Nord', time_fr: '48h', time_ar: 'خلال 48 ساعة', status: 'Stock auto & poids lourds', contact: '+212 6 61 00 00 00', min_order: 'Cartons' },
  { id: 'eljadida', name_fr: 'El Jadida & Jorf Lasfar', name_ar: 'الجديدة والجرف الأصفر', hub: 'Hub Doukkala & Pétrochimie', time_fr: '24h chrono', time_ar: 'خلال 24 ساعة', status: 'Stock industrie & auto', contact: '+212 6 61 00 00 00', min_order: 'Cartons / IBC' },
  { id: 'safi', name_fr: 'Safi', name_ar: 'آسفي', hub: 'Hub Côte Atlantique', time_fr: '24h à 48h', time_ar: '24 إلى 48 ساعة', status: 'Stock complet', contact: '+212 6 61 00 00 00', min_order: '1 carton' },
  { id: 'benimellal', name_fr: 'Béni Mellal & Fquih Ben Salah', name_ar: 'بني ملال والفقيه بن صالح', hub: 'Hub Tadla-Azilal', time_fr: '24h à 48h', time_ar: '24 إلى 48 ساعة', status: 'Stock agricole & VP', contact: '+212 6 61 00 00 00', min_order: '1 carton' },
  { id: 'layoune', name_fr: 'Laâyoune & Sahara', name_ar: 'العيون والأقاليم الجنوبية', hub: 'Plateforme Sud Express', time_fr: '48h à 72h', time_ar: '48 إلى 72 ساعة', status: 'Liaison directe régulière', contact: '+212 6 61 00 00 00', min_order: 'Fûts / Cartons' },
  { id: 'dakhla', name_fr: 'Dakhla', name_ar: 'الداخلة', hub: 'Plateforme Grand Sud', time_fr: '72h', time_ar: 'خلال 72 ساعة', status: 'Liaison hebdomadaire', contact: '+212 6 61 00 00 00', min_order: 'Cartons / Fûts' }
];

function initDeliveryCalculator() {
  const container = document.getElementById('delivery-calculator-widget');
  if (!container) return;

  const selectOptions = MOROCCAN_CITIES_DATA.map(c => `
    <option value="${c.id}">${c.name_fr} - ${c.name_ar}</option>
  `).join('');

  container.innerHTML = `
    <div class="delivery-calc-card">
      <div class="calc-header">
        <div class="calc-icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        </div>
        <div>
          <h3 class="calc-title" data-i18n="delivery_calc.title">Simulateur de Délais de Livraison au Maroc</h3>
          <p class="calc-desc" data-i18n="delivery_calc.desc">Sélectionnez votre ville pour vérifier les délais d'expédition et le dépôt de rattachement.</p>
        </div>
      </div>

      <div class="calc-body">
        <div class="calc-input-group">
          <label class="calc-label" for="city-select" data-i18n="delivery_calc.label">Votre Ville au Maroc :</label>
          <select id="city-select" class="calc-select">
            ${selectOptions}
          </select>
        </div>

        <div class="calc-results-box" id="calc-results-box">
          <!-- Populated by updateDeliveryDetails() -->
        </div>
      </div>
    </div>
  `;

  const select = document.getElementById('city-select');
  select.addEventListener('change', () => updateDeliveryDetails(select.value));
  updateDeliveryDetails(MOROCCAN_CITIES_DATA[0].id);
}

function updateDeliveryDetails(cityId) {
  const city = MOROCCAN_CITIES_DATA.find(c => c.id === cityId) || MOROCCAN_CITIES_DATA[0];
  const box = document.getElementById('calc-results-box');
  if (!box) return;

  const lang = window.i18n ? window.i18n.currentLang : 'fr';
  const cityName = lang === 'ar' ? city.name_ar : city.name_fr;
  const time = lang === 'ar' ? city.time_ar : city.time_fr;

  box.innerHTML = `
    <div class="delivery-result-grid">
      <div class="res-item highlight">
        <span class="res-label">⏱️ Délai de Livraison Estimé :</span>
        <strong class="res-value text-accent">${time}</strong>
      </div>
      <div class="res-item">
        <span class="res-label">🏢 Dépôt de Rattachement :</span>
        <strong class="res-value">${city.hub}</strong>
      </div>
      <div class="res-item">
        <span class="res-label">📦 Conditionnements en Stock :</span>
        <span class="res-value">Bidons 1L/4L/5L · Cartons · Fûts 208L · IBC 1000L</span>
      </div>
      <div class="res-item">
        <span class="res-label">🚚 Minimum de commande :</span>
        <span class="res-value">${city.min_order}</span>
      </div>
    </div>

    <div class="calc-cta-row">
      <button class="btn btn-primary" onclick="contactHubWhatsApp('${city.name_fr}')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
        Commander pour ${cityName} sur WhatsApp
      </button>
      <a href="#contact-maroc" class="btn btn-secondary">
        Demander un devis formel
      </a>
    </div>
  `;
}

function contactHubWhatsApp(cityName) {
  const contactData = window.contactLoader?.contactData;
  const waNum = contactData?.whatsapp?.number?.replace(/\D/g, '') || '212661000000';
  const msg = `Bonjour SIL Lubricants Maroc, je suis basé à ${cityName} et je souhaite avoir un devis et confirmer les délais de livraison pour ma commande de lubrifiants.`;
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
  initDeliveryCalculator();
});
