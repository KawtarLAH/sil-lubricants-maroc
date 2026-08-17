/**
 * SIL LUBRICANTS MAROC - MAIN APPLICATION LOGIC
 * Navigation, header scrolling, news loader, form validation & toast notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Drawer Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      const isExpanded = mainNav.classList.contains('active');
      mobileToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when clicking nav links on mobile
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          mainNav.classList.remove('active');
        }
      });
    });
  }

  // 2. Sticky Header Scroll Effect
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
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

      // Success notification
      const successMsg = window.i18n ? window.i18n.getText('contact_section.form_success') : 'Merci ! Votre demande a été transmise à l\'équipe SIL Lubricants Maroc.';
      showToast(successMsg);

      // Optionally offer WhatsApp send
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

  // 4. News Loader (for Homepage and Actualités page)
  loadNewsCards();
});

async function loadNewsCards() {
  const newsGrid = document.getElementById('news-cards-grid');
  if (!newsGrid) return;

  try {
    const res = await fetch('data/news.json');
    if (!res.ok) return;
    const newsItems = await res.json();

    const renderNews = () => {
      const lang = window.i18n ? window.i18n.currentLang : 'fr';
      const readMoreText = window.i18n ? window.i18n.getText('news_section.read_more') : 'En savoir plus';

      newsGrid.innerHTML = newsItems.map(item => {
        const title = item[`title_${lang}`] || item.title_fr;
        const excerpt = item[`excerpt_${lang}`] || item.excerpt_fr;
        const cat = item[`category_${lang}`] || item.category_fr;

        return `
          <div class="news-card">
            <div class="news-img-wrap">
              <img src="${item.image}" alt="${title}" class="news-img" loading="lazy" onerror="this.src='https://www.sil-lubricants.com/wp-content/uploads/2026/07/ssdt-sil-lubricants.jpg'">
              <span class="news-category-tag">${cat}</span>
            </div>
            <div class="news-body">
              <div class="news-date">${item.date}</div>
              <h3 class="news-title">${title}</h3>
              <p class="news-excerpt">${excerpt}</p>
              <div style="margin-top: auto;">
                <a href="actualites.html#${item.id}" class="btn btn-secondary btn-sm" style="width: fit-content;">
                  ${readMoreText} &rarr;
                </a>
              </div>
            </div>
          </div>
        `;
      }).join('');
    };

    renderNews();
    window.addEventListener('languageChanged', renderNews);
  } catch (err) {
    console.error('Failed to load news items:', err);
  }
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
