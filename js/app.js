/**
 * SIL LUBRICANTS MAROC - MAIN APPLICATION LOGIC (MOBILE-FIRST)
 * Navigation, mobile app bottom bar, header scrolling, form validation & toast notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile App Bottom Navigation Bar
  renderMobileBottomNav();

  // 2. Sticky Header Scroll Effect
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 3. Contact & Quote Form Handler
  const contactForm = document.getElementById('morocco-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name')?.value || '';
      const phone = document.getElementById('contact-phone')?.value || '';
      const email = document.getElementById('contact-email')?.value || '';
      const city = document.getElementById('contact-city')?.value || '';
      const sector = document.getElementById('contact-sector')?.value || '';
      const message = document.getElementById('contact-message')?.value || '';

      const successMsg = window.i18n ? window.i18n.getText('contact_section.form_success') : 'Merci ! Votre demande a été transmise à l\'équipe SIL Lubricants Maroc.';
      showToast(successMsg);

      setTimeout(() => {
        const confirmWa = confirm("Voulez-vous également transmettre cette demande directement par WhatsApp pour un traitement immédiat ?");
        if (confirmWa) {
          const contactData = window.contactLoader?.contactData;
          const waNum = contactData?.whatsapp?.number?.replace(/\D/g, '') || '212661000000';
          const waText = `Demande de devis SIL Maroc :\n- Nom: ${name}\n- Tél: ${phone}\n- Ville: ${city}\n- Secteur: ${sector}\n- Message: ${message}`;
          window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(waText)}`, '_blank');
        }
      }, 800);

      contactForm.reset();
    });
  }

  // 4. FAQ Accordion Toggle
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      if (!item) return;
      const isActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
});

/**
 * Mobile Bottom Navigation Dock (Native Mobile App Feel)
 */
function renderMobileBottomNav() {
  if (document.getElementById('mobile-bottom-nav')) return;

  const pathname = window.location.pathname.toLowerCase();
  const isHome = pathname.endsWith('index.html') || pathname.endsWith('/') || pathname.endsWith('sil-lubricants-maroc');
  const is4R = pathname.includes('4-roues');
  const is2R = pathname.includes('2-roues');

  const nav = document.createElement('nav');
  nav.id = 'mobile-bottom-nav';
  nav.className = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', 'Navigation mobile rapide');

  nav.innerHTML = `
    <a href="index.html" class="mobile-nav-item ${isHome ? 'active' : ''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
      <span data-i18n="nav.home">Accueil</span>
    </a>
    <a href="4-roues.html" class="mobile-nav-item ${is4R ? 'active' : ''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
      <span data-i18n="nav.4_wheels">4 Roues</span>
    </a>
    <a href="2-roues.html" class="mobile-nav-item ${is2R ? 'active' : ''}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="5" cy="17" r="3"></circle><circle cx="19" cy="17" r="3"></circle><path d="M12 17h4l-3-7H9l-2 4"></path><path d="M9 10l3-5h4"></path></svg>
      <span data-i18n="nav.2_wheels">2 Roues</span>
    </a>
    <button class="mobile-nav-item" onclick="window.quoteDrawer ? window.quoteDrawer.open() : null" id="mobile-nav-quote-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
      <span class="mobile-nav-badge" id="mobile-quote-badge" style="display:none;">0</span>
      <span data-i18n="quote_drawer.open_drawer">Devis</span>
    </button>
    <a href="javascript:void(0)" class="mobile-nav-item item-whatsapp" onclick="openWhatsAppMorocco()">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
      <span>WhatsApp</span>
    </a>
  `;

  document.body.appendChild(nav);

  // Sync Quote Badge in Mobile Nav
  const syncBadge = () => {
    const items = JSON.parse(localStorage.getItem('sil_quote_items') || '[]');
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('mobile-quote-badge');
    if (badge) {
      badge.textContent = totalCount;
      badge.style.display = totalCount > 0 ? 'flex' : 'none';
    }
  };

  syncBadge();
  window.addEventListener('storage', syncBadge);
  setInterval(syncBadge, 1000);
}

function openWhatsAppMorocco() {
  const contactData = window.contactLoader?.contactData;
  const waNum = contactData?.whatsapp?.number?.replace(/\D/g, '') || '212661000000';
  const lang = window.i18n ? window.i18n.currentLang : 'fr';
  let defaultMsg = "Bonjour SIL Lubricants Maroc, je souhaite avoir des informations sur vos huiles et tarifs.";
  if (lang === 'en') defaultMsg = "Hello SIL Lubricants Morocco, I would like to inquire about your products and distributor pricing.";
  if (lang === 'ar') defaultMsg = "مرحبا زيوت SIL المغرب، أود الاستفسار عن منتجاتكم والأسعار المتاحة بالمغرب.";
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(defaultMsg)}`, '_blank');
}

// Toast notification helper
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-box';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
