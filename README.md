# SIL Lubricants Maroc - Site Web Officiel & Catalogue

Site web officiel pour l'antenne et distributeur exclusif de **SIL Lubricants au Maroc**, répliquant l'ensemble des produits, fiches techniques, catalogues et actualités de [sil-lubricants.com](https://www.sil-lubricants.com/fr/) avec support multilingue intégral (**Français**, **English**, **العربية** avec support RTL).

---

## 📁 Comment modifier vos coordonnées au Maroc ?

Toutes vos coordonnées (adresses, téléphones, emails, réseaux sociaux, WhatsApp, ICE/RC, horaires et carte Google Maps) sont centralisées dans le fichier :

👉 `data/contact_morocco.json` (ou `contact_config.json` à la racine)

Il vous suffit de modifier ce fichier avec vos informations réelles, et **l'ensemble du site se met à jour automatiquement** (barre supérieure, en-tête, page de contact, devis, pied de page et widget WhatsApp).

### Exemple de structure du fichier JSON :
```json
{
  "company_name": "SIL Lubricants Maroc",
  "distributor_legal_name": "VOTRE SOCIETE SARL",
  "tagline_fr": "Distributeur Officiel & Exclusif des Lubrifiants SIL au Maroc",
  "tagline_en": "Official & Exclusive Distributor of SIL Lubricants in Morocco",
  "tagline_ar": "الموزع الرسمي والحصري لزيوت وتشحيمات SIL في المغرب",
  "phones": {
    "primary": "+212 5 22 XX XX XX",
    "mobile": "+212 6 61 XX XX XX",
    "display": "+212 522 XX XX XX / +212 661 XX XX XX"
  },
  "whatsapp": {
    "number": "2126XXXXXXXX",
    "formatted": "+212 6 XX XX XX XX"
  },
  "emails": {
    "general": "contact@votredomaine.ma",
    "sales": "commercial@votredomaine.ma",
    "technical": "technique@votredomaine.ma"
  },
  "addresses": {
    "headquarters": {
      "city_fr": "Casablanca",
      "street_fr": "Zone Industrielle Sidi Bernoussi, Casablanca, Maroc",
      "street_ar": "المنطقة الصناعية سيدي البرنوصي، الدار البيضاء، المغرب"
    }
  },
  "moroccan_legal_info": {
    "rc": "RC XXXXXX Casablanca",
    "ice": "00XXXXXXXXXXXXX",
    "if": "XXXXXXXX",
    "patente": "XXXXXXXX"
  },
  "social_networks": {
    "instagram": "https://www.instagram.com/votre_compte/",
    "facebook": "https://www.facebook.com/votre_page/",
    "linkedin": "https://www.linkedin.com/company/votre_societe/",
    "youtube": "https://www.youtube.com/"
  }
}
```

---

## 🚀 Comment lancer le site en local ?

Le site est conçu en **HTML5 / CSS3 / JavaScript modulaire ultra-rapide** sans dépendances complexes, compatible avec n'importe quel hébergeur web (Apache, Nginx, cPanel, Vercel, Netlify, etc.).

Pour tester en local :
```bash
# Dans le dossier sil-lubricants-maroc :
python -m http.server 8080
```
Puis ouvrez votre navigateur sur : `http://localhost:8080`

---

## 🌐 Pages Disponibles :
1. `index.html` : Page d'accueil, Hero section, Présentation de la marque, Univers de lubrification, Produits phares, Actualités Motorsport et Formulaire de contact / Devis Maroc avec Carte interactive.
2. `4-roues.html` : Catalogue exhaustif 4 Roues (Véhicules légers, Poids lourds, Agricole, BTP, Transmissions, Liquides de freins, Huiles hydrauliques, Graisses, Aérosols, Antigels) avec filtres de recherche en temps réel et fiches techniques modales.
3. `2-roues.html` : Catalogue 2 Roues (Motos 4T Factory Racing, 4T Synthétique, 2T Compétition, Huiles de fourche Fork Oil, Gamme Motocare Sprays).
4. `catalogues.html` : Téléchargement direct des catalogues officiels PDF (Auto/Industrie et Motoline).
5. `entreprise.html` : Histoire (+75 ans), Usine de Barcelone (10 000 m²), Laboratoire R&D, Homologations constructeurs et Logistique Maroc.
6. `actualites.html` : Compétitions et sponsoring mondial (SSDT Écosse, Raid 1000 Dunas, X-Trial FIM, Leonart Motors).
