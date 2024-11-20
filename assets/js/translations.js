const SimpleTranslations = {
    strings: {},
    currentLang: 'en',
  
    async init() {
      try {
        console.log('Loading translations...');
        const response = await fetch('https://www.cloudstrucc.com/assets/js/locales/translations.csv');
        // const response = await fetch('/assets/js/locales/translations.csv');
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csv = await response.text();
        console.log('CSV loaded:', csv);
        
        this.currentLang = localStorage.getItem('preferred_language') 
          || navigator.language.split('-')[0] 
          || 'en';
        
        // Set html lang attribute
        document.documentElement.setAttribute('lang', this.currentLang);
        
        // Initial translation
        this.translatePage();
        
        // Set up language buttons
        document.querySelectorAll('[data-lang]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchLanguage(e.target.dataset.lang);
          });
        });
  
        // Update active state
        const activeButton = document.querySelector(`[data-lang="${this.currentLang}"]`);
        if (activeButton) {
          activeButton.classList.add('active');
        }
      } catch (error) {
        console.error('Translation initialization failed:', error);
      }
    },
  
    parseCsv(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Create fresh objects for each language
        this.strings = {};
        headers.slice(1).forEach(lang => {
          this.strings[lang] = Object.create(null);
        });
        
        lines.slice(1).forEach(line => {
          if (!line.trim()) return;
          const values = line.split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
          const key = values[0];
          headers.slice(1).forEach((lang, i) => {
            if (this.strings[lang]) {
              this.strings[lang][key] = values[i + 1];
            }
          });
        });
    },

    switchLanguage(lang) {
      if (this.strings[lang]) {
        console.log('Switching to language:', lang);
        this.currentLang = lang;
        localStorage.setItem('preferred_language', lang);
        document.documentElement.setAttribute('lang', lang);
        
        // Update active state on buttons
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
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    SimpleTranslations.init();
  });