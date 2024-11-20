const SimpleTranslations = {
    strings: {
      en: {
        "hero.title": "Transform, Secure, and Modernize Your Digital Enterprise",
        "hero.subtitle": "We deliver comprehensive IT solutions spanning cloud and on-premises environments, with expertise in security, infrastructure, and identity management.",
        "nav.home": "Home",
        "nav.about": "About",
        "nav.services": "Services",
        "nav.solutions": "Solutions",
        "nav.contact": "Contact",
        "contact.email": "Email Address"
      },
      fr: {
        "hero.title": "Transformez, Sécurisez et Modernisez Votre Entreprise Numérique",
        "hero.subtitle": "Nous fournissons des solutions informatiques complètes couvrant les environnements cloud et sur site, avec une expertise en sécurité, infrastructure et gestion des identités.",
        "nav.home": "Accueil",
        "nav.about": "À propos",
        "nav.services": "Services",
        "nav.solutions": "Solutions",
        "nav.contact": "Contact",
        "contact.email": "Adresse courriel"
      }
    },
  
    init() {
      this.currentLang = localStorage.getItem('preferred_language') 
        || navigator.language.split('-')[0] 
        || 'en';
      
      document.documentElement.setAttribute('lang', this.currentLang);
      this.translatePage();
      
      document.querySelectorAll('[data-lang]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.switchLanguage(e.target.dataset.lang);
        });
      });
  
      const activeButton = document.querySelector(`[data-lang="${this.currentLang}"]`);
      if (activeButton) {
        activeButton.classList.add('active');
      }
    },
  
    switchLanguage(lang) {
      if (this.strings[lang]) {
        this.currentLang = lang;
        localStorage.setItem('preferred_language', lang);
        document.documentElement.setAttribute('lang', lang);
        
        document.querySelectorAll('[data-lang]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.lang === lang);
        });
        
        this.translatePage();
      }
    },
  
    translatePage() {
      document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        const translation = this.strings[this.currentLang]?.[key];
        
        if (translation) {
          if (element.hasAttribute('placeholder')) {
            element.setAttribute('placeholder', translation);
          } else {
            element.textContent = translation;
          }
        }
      });
    }
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    SimpleTranslations.init();
  });