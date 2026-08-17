/**
 * SIL LUBRICANTS MAROC - DYNAMIC CONTACT LOADER
 * Reads data/contact_morocco.json and dynamically populates
 * all contact details, addresses, phones, emails, and social links across the site.
 */

class ContactLoader {
  constructor() {
    this.contactData = null;
  }

  async init() {
    try {
      // Try local path first
      const res = await fetch('data/contact_morocco.json');
      if (!res.ok) throw new Error('Could not load data/contact_morocco.json');
      this.contactData = await res.json();
      this.populateData();

      // Listen for language changes to update language-specific strings (addresses, hours)
      window.addEventListener('languageChanged', (e) => {
        this.populateData(e.detail.lang);
      });
    } catch (err) {
      console.warn('Fallback: loading contact_config.json', err);
      try {
        const res2 = await fetch('contact_config.json');
        if (res2.ok) {
          this.contactData = await res2.json();
          this.populateData();
        }
      } catch (err2) {
        console.error('Failed to load contact configuration:', err2);
      }
    }
  }

  populateData(lang = (window.i18n ? window.i18n.currentLang : 'fr')) {
    if (!this.contactData) return;
    const d = this.contactData;

    // 1. Company Name & Tagline
    document.querySelectorAll('.contact-company-name').forEach(el => el.textContent = d.company_name);
    document.querySelectorAll('.contact-legal-name').forEach(el => el.textContent = d.distributor_legal_name);
    document.querySelectorAll('.contact-tagline').forEach(el => {
      el.textContent = d[`tagline_${lang}`] || d.tagline_fr;
    });

    // 2. Phones
    document.querySelectorAll('.contact-phone-primary').forEach(el => {
      el.textContent = d.phones.primary;
      if (el.tagName === 'A') el.href = `tel:${d.phones.primary.replace(/\s+/g, '')}`;
    });
    document.querySelectorAll('.contact-phone-mobile').forEach(el => {
      el.textContent = d.phones.mobile;
      if (el.tagName === 'A') el.href = `tel:${d.phones.mobile.replace(/\s+/g, '')}`;
    });
    document.querySelectorAll('.contact-phone-display').forEach(el => {
      el.textContent = d.phones.display || `${d.phones.primary} / ${d.phones.mobile}`;
      if (el.tagName === 'A') el.href = `tel:${d.phones.primary.replace(/\s+/g, '')}`;
    });

    // 3. Emails
    document.querySelectorAll('.contact-email-general').forEach(el => {
      el.textContent = d.emails.general;
      if (el.tagName === 'A') el.href = `mailto:${d.emails.general}`;
    });
    document.querySelectorAll('.contact-email-sales').forEach(el => {
      el.textContent = d.emails.sales;
      if (el.tagName === 'A') el.href = `mailto:${d.emails.sales}`;
    });
    document.querySelectorAll('.contact-email-tech').forEach(el => {
      el.textContent = d.emails.technical;
      if (el.tagName === 'A') el.href = `mailto:${d.emails.technical}`;
    });

    // 4. Addresses
    if (d.addresses && d.addresses.headquarters) {
      const hq = d.addresses.headquarters;
      const street = hq[`street_${lang}`] || hq.street_fr;
      const city = hq[`city_${lang}`] || hq.city_fr;
      document.querySelectorAll('.contact-address-hq').forEach(el => el.textContent = street);
      document.querySelectorAll('.contact-city-hq').forEach(el => el.textContent = city);
    }
    if (d.addresses && d.addresses.warehouse) {
      const wh = d.addresses.warehouse;
      const streetWh = wh[`street_${lang}`] || wh.street_fr;
      document.querySelectorAll('.contact-address-warehouse').forEach(el => el.textContent = streetWh);
    }

    // 5. Business Hours
    if (d.business_hours) {
      const hours = d.business_hours[`days_${lang}`] || d.business_hours.days_fr;
      document.querySelectorAll('.contact-business-hours').forEach(el => el.textContent = hours);
    }

    // 6. Social Networks
    if (d.social_networks) {
      document.querySelectorAll('.social-link-instagram').forEach(el => el.href = d.social_networks.instagram || '#');
      document.querySelectorAll('.social-link-facebook').forEach(el => el.href = d.social_networks.facebook || '#');
      document.querySelectorAll('.social-link-linkedin').forEach(el => el.href = d.social_networks.linkedin || '#');
      document.querySelectorAll('.social-link-youtube').forEach(el => el.href = d.social_networks.youtube || '#');
    }

    // 7. Moroccan Legal Registration IDs
    if (d.moroccan_legal_info) {
      const leg = d.moroccan_legal_info;
      document.querySelectorAll('.contact-legal-rc').forEach(el => el.textContent = leg.rc || '');
      document.querySelectorAll('.contact-legal-ice').forEach(el => el.textContent = leg.ice || '');
      document.querySelectorAll('.contact-legal-if').forEach(el => el.textContent = leg.if || '');
      document.querySelectorAll('.contact-legal-patente').forEach(el => el.textContent = leg.patente || '');
    }

    // 8. Google Maps Iframe
    if (d.google_maps && d.google_maps.embed_url) {
      document.querySelectorAll('.contact-map-iframe').forEach(el => {
        el.setAttribute('src', d.google_maps.embed_url);
      });
    }

    // 9. WhatsApp Links
    if (d.whatsapp) {
      const waNum = d.whatsapp.number.replace(/\D/g, '');
      const defaultMsg = d.whatsapp[`default_message_${lang}`] || d.whatsapp.default_message_fr;
      const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(defaultMsg)}`;

      document.querySelectorAll('.contact-whatsapp-link').forEach(el => {
        el.setAttribute('href', waUrl);
        el.setAttribute('target', '_blank');
      });
      document.querySelectorAll('.contact-whatsapp-number').forEach(el => {
        el.textContent = d.whatsapp.formatted || d.whatsapp.number;
      });
    }
  }
}

window.contactLoader = new ContactLoader();
document.addEventListener('DOMContentLoaded', () => {
  window.contactLoader.init();
});
