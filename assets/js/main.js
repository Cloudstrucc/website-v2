/**
 * Main JavaScript file for Cloudstrucc website
 */
document.addEventListener('DOMContentLoaded', () => {
  "use strict";

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Mobile nav toggle
   */
  const mobileNavToggle = () => {
    const mobileNavShow = document.querySelector('.mobile-nav-show');
    const mobileNavHide = document.querySelector('.mobile-nav-hide');
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

    if (mobileNavToggleBtn) {
      mobileNavToggleBtn.addEventListener('click', function(e) {
        document.querySelector('body').classList.toggle('mobile-nav-active');
        this.classList.toggle('bi-list');
        this.classList.toggle('bi-x');
      });
    }
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  const navbarlinks = document.querySelectorAll('#navmenu a');
  if (navbarlinks) {
    navbarlinks.forEach(navbarlink => {
      navbarlink.addEventListener('click', () => {
        if (document.querySelector('.mobile-nav-active')) {
          document.querySelector('body').classList.remove('mobile-nav-active');
          const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
          if (mobileNavToggleBtn) {
            mobileNavToggleBtn.classList.toggle('bi-list');
            mobileNavToggleBtn.classList.toggle('bi-x');
          }
        }
      });
    });
  }

  /**
   * Toggle mobile nav dropdowns
   */
  const navDropdowns = document.querySelectorAll('.navbar .dropdown > a');
  if (navDropdowns) {
    navDropdowns.forEach(el => {
      el.addEventListener('click', function(event) {
        if (document.querySelector('.mobile-nav-active')) {
          event.preventDefault();
          this.classList.toggle('active');
          this.nextElementSibling.classList.toggle('dropdown-active');
        }
      });
    });
  }

  /**
   * Scroll top button
   */
  const scrollTop = document.querySelector('.scroll-top');
  if (scrollTop) {
    const togglescrollTop = function() {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
    window.addEventListener('load', togglescrollTop);
    document.addEventListener('scroll', togglescrollTop);
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /**
   * Animation on scroll function and init
   */
  function aos_init() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false
      });
    }
  }
  window.addEventListener('load', () => {
    aos_init();
  });

  /**
   * Initiate Pure Counter
   */
  if (typeof PureCounter !== 'undefined') {
    new PureCounter();
  }

  /**
   * Initiate glightbox
   */
  if (typeof GLightbox !== 'undefined') {
    const glightbox = GLightbox({
      selector: '.glightbox'
    });
  }

  /**
   * Init swiper slider with custom options
   */
  function initSwiper() {
    document.querySelectorAll('.init-swiper').forEach(function(element) {
      let config = {
        loop: true,
        speed: 600,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false
        },
        slidesPerView: 'auto',
        pagination: {
          el: '.swiper-pagination',
          type: 'bullets',
          clickable: true
        }
      };

      // Get custom config from data attribute if exists
      const configElement = element.querySelector('.swiper-config');
      if (configElement) {
        try {
          const customConfig = JSON.parse(configElement.textContent);
          config = { ...config, ...customConfig };
        } catch (error) {
          console.error('Error parsing swiper config:', error);
        }
      }

      if (typeof Swiper !== 'undefined') {
        new Swiper(element, config);
      }
    });
  }
  window.addEventListener('load', initSwiper);

  /**
   * Init isotope layout and filters
   */
  function initIsotope() {
    document.querySelectorAll('.isotope-layout').forEach(function(isotopeContainer) {
      let layout = isotopeContainer.getAttribute('data-layout') || 'masonry';
      let filter = isotopeContainer.getAttribute('data-default-filter') || '*';
      let sort = isotopeContainer.getAttribute('data-sort') || 'original-order';

      if (typeof Isotope !== 'undefined') {
        let isotope = new Isotope(isotopeContainer.querySelector('.isotope-container'), {
          itemSelector: '.isotope-item',
          layoutMode: layout,
          filter: filter,
          sortBy: sort
        });

        isotopeContainer.querySelectorAll('.isotope-filters li').forEach(function(filter) {
          filter.addEventListener('click', function(e) {
            e.preventDefault();
            isotopeContainer.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
            this.classList.add('filter-active');
            isotope.arrange({
              filter: this.getAttribute('data-filter')
            });
            if (typeof aos_init === 'function') {
              aos_init();
            }
          }, false);
        });
      }
    });
  }
  window.addEventListener('load', initIsotope);

  // Initialize mobile nav
  mobileNavToggle();
});