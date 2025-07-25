/**
 * CAPE Technology Solutions - Professional Defense Contractor JavaScript
 * Enhanced interactions and functionality for mission-critical presentation
 */

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

// =============================================================================
// THEME MANAGEMENT
// =============================================================================

class ThemeManager {
  constructor() {
    this.currentTheme = this.getInitialTheme();
    this.toggleBtn = document.getElementById('theme-toggle');
    this.init();
  }

  getInitialTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem('cape-theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  }

  init() {
    console.log('ThemeManager initializing with theme:', this.currentTheme); // Debug log
    this.applyTheme(this.currentTheme);
    this.setupEventListeners();
    this.setupSystemThemeListener();
  }

  setupEventListeners() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleTheme());
    }
  }

  setupSystemThemeListener() {
    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem('cape-theme')) {
          this.currentTheme = e.matches ? 'dark' : 'light';
          this.applyTheme(this.currentTheme);
        }
      });
    }
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    localStorage.setItem('cape-theme', this.currentTheme);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme: this.currentTheme } 
    }));
  }

  applyTheme(theme) {
    console.log('Applying theme:', theme); // Debug log
    
    // Add transition class for smooth theme switching
    document.documentElement.classList.add('theme-transitioning');
    
    // Set the theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Debug: Check if attribute was set
    console.log('data-theme attribute:', document.documentElement.getAttribute('data-theme'));
    
    // Update toggle button
    if (this.toggleBtn) {
      const icon = this.toggleBtn.querySelector('i');
      if (icon) {
        icon.className = theme === 'light' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
      }
      
      // Update button text/tooltip
      const buttonText = this.toggleBtn.querySelector('span');
      if (buttonText) {
        buttonText.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
      }
      
      // Update aria-label for accessibility
      this.toggleBtn.setAttribute('aria-label', 
        theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
      );
    }
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'light' ? '#1e3a5f' : '#0f1419');
    }
    
    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 200); // Much faster - reduced from 400ms to 200ms
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

// =============================================================================
// HEADER SCROLL EFFECTS
// =============================================================================

class HeaderManager {
  constructor() {
    this.header = document.querySelector('.site-header');
    this.lastScrollY = window.scrollY;
    this.isScrolled = false;
    this.init();
  }

  init() {
    if (!this.header) return;
    this.setupScrollListener();
    this.setupPageTransitionListener();
  }

  setupScrollListener() {
    const handleScroll = throttle(() => {
      const currentScrollY = window.scrollY;
      
      // Add/remove scrolled class for styling with smooth transitions
      if (currentScrollY > 100) {
        if (!this.isScrolled) {
          this.header.classList.add('scrolled');
          this.isScrolled = true;
        }
      } else {
        if (this.isScrolled) {
          this.header.classList.remove('scrolled');
          this.isScrolled = false;
        }
      }

      // Hide/show header on scroll (only on desktop) with smoother transitions
      if (window.innerWidth > 768) {
        if (currentScrollY > this.lastScrollY && currentScrollY > 300) {
          this.header.style.transform = 'translateY(-100%)';
        } else {
          this.header.style.transform = 'translateY(0)';
        }
      } else {
        // Always show header on mobile
        this.header.style.transform = 'translateY(0)';
      }

      this.lastScrollY = currentScrollY;
    }, 50); // Reduced throttle time for smoother response

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  setupPageTransitionListener() {
    // Add page transition effects
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href$=".html"]');
      if (!link) return;

      // Don't apply transition to external links or same page links
      if (link.hostname !== window.location.hostname || 
          link.href === window.location.href) return;

      e.preventDefault();
      
      // Add subtle fade out effect
      document.body.classList.add('page-transitioning', 'fade-out');
      
      // Navigate after transition with shorter delay
      setTimeout(() => {
        window.location.href = link.href;
      }, 300); // Much shorter delay for smoother feel
    });
  }
}

// =============================================================================
// SMOOTH SCROLLING
// =============================================================================

class SmoothScrollManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupSmoothScrolling();
  }

  setupSmoothScrolling() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href === '#') return;

      e.preventDefault();
      
      const target = document.querySelector(href);
      if (!target) return;

      const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
      const classificationHeight = document.querySelector('.classification-banner')?.offsetHeight || 0;
      const offset = headerHeight + classificationHeight + 20;

      window.scrollTo({
        top: target.offsetTop - offset,
        behavior: 'smooth'
      });
    });
  }
}

// =============================================================================
// INTERSECTION OBSERVER ANIMATIONS
// =============================================================================

class AnimationManager {
  constructor() {
    this.observer = null;
    this.scrollObserver = null;
    this.animatedElements = new Set();
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.observeElements();
    this.setupStaggerAnimations();
  }

  setupIntersectionObserver() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.animatedElements.add(entry.target);
        }
      });
    }, options);
  }



  animateElement(element) {
    // Remove any existing animation classes
    element.classList.remove('animate-in', 'animate-slide-up', 'animate-fade-in', 'animate-scale-in');
    
    // Add base animation class
    element.classList.add('animate-in');
    
    // Determine animation type based on element class or data attribute
    const animationType = element.dataset.animation || this.getAnimationType(element);
    
    switch (animationType) {
      case 'slide-up':
        element.classList.add('animate-slide-up');
        break;
      case 'fade-in':
        element.classList.add('animate-fade-in');
        break;
      case 'scale-in':
        element.classList.add('animate-scale-in');
        break;
      case 'slide-in-left':
        element.classList.add('animate-slide-in-left');
        break;
      case 'slide-in-right':
        element.classList.add('animate-slide-in-right');
        break;
      default:
        element.classList.add('animate-fade-in');
    }
  }

  getAnimationType(element) {
    // Determine animation type based on element class
    if (element.classList.contains('capability-card')) return 'slide-up';
    if (element.classList.contains('trust-stat')) return 'scale-in';
    if (element.classList.contains('cert-card')) return 'fade-in';
    if (element.classList.contains('leadership-card')) return 'slide-up';
    if (element.classList.contains('section-header')) return 'fade-in';
    if (element.classList.contains('benefit-card')) return 'slide-up';
    if (element.classList.contains('position-card')) return 'slide-up';
    if (element.classList.contains('contact-card')) return 'fade-in';
    if (element.classList.contains('info-card')) return 'slide-up';
    if (element.classList.contains('solution-card')) return 'slide-up';
    if (element.classList.contains('method-item')) return 'slide-in-left';
    if (element.classList.contains('process-step')) return 'slide-in-right';
    if (element.classList.contains('tech-category')) return 'scale-in';
    if (element.classList.contains('spec-tech-card')) return 'fade-in';
    if (element.classList.contains('advantage-item')) return 'slide-up';
    if (element.classList.contains('metric-card')) return 'scale-in';
    if (element.classList.contains('team-item')) return 'fade-in';
    if (element.classList.contains('value-item')) return 'slide-up';
    
    return 'fade-in';
  }

  setupStaggerAnimations() {
    // No animations, just tracking
  }

  observeElements() {
    // Only observe a few key elements for tracking, no animations
    const elementsToTrack = [
      '.section-header',
      '.capability-card',
      '.benefit-card',
      '.position-card',
      '.contact-card',
      '.info-card',
      '.solution-card'
    ];

    elementsToTrack.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        this.observer?.observe(el);
      });
    });
  }


}

// =============================================================================
// HERO TECH GRID INTERACTIONS
// =============================================================================

class TechGridManager {
  constructor() {
    this.techCards = document.querySelectorAll('.tech-card');
    this.init();
  }

  init() {
    if (this.techCards.length === 0) return;
    this.setupTechCardRotation();
    this.setupTechCardInteractions();
  }

  setupTechCardRotation() {
    let currentIndex = 0;
    
    const rotateTechCards = () => {
      this.techCards.forEach(card => card.classList.remove('active'));
      this.techCards[currentIndex].classList.add('active');
      currentIndex = (currentIndex + 1) % this.techCards.length;
    };

    // Initial rotation
    rotateTechCards();
    
    // Auto-rotate every 3 seconds
    setInterval(rotateTechCards, 3000);
  }

  setupTechCardInteractions() {
    this.techCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.techCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
    });
  }
}

// =============================================================================
// TYPING ANIMATION FOR HERO TITLE
// =============================================================================

class TypingAnimation {
  constructor(element, text, speed = 100) {
    this.element = element;
    this.text = text;
    this.speed = speed;
    this.index = 0;
  }

  start() {
    if (!this.element) return;
    
    this.element.innerHTML = '';
    const typeChar = () => {
      if (this.index < this.text.length) {
        this.element.innerHTML += this.text.charAt(this.index);
        this.index++;
        setTimeout(typeChar, this.speed);
      }
    };
    
    setTimeout(typeChar, 500); // Delay start
  }
}

// =============================================================================
// COUNTER ANIMATIONS
// =============================================================================

class CounterAnimation {
  constructor() {
    this.counters = document.querySelectorAll('.stat-number');
    this.init();
  }

  init() {
    if (this.counters.length === 0) return;
    this.setupCounterObserver();
  }

  setupCounterObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.counters.forEach(counter => {
      observer.observe(counter);
    });
  }

  animateCounter(element) {
    const target = element.textContent;
    const isNumber = /^\d+$/.test(target);
    
    if (!isNumber) return;

    const finalNumber = parseInt(target);
    const duration = 2000;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const current = Math.floor(progress * finalNumber);
      element.textContent = current + (target.includes('+') ? '+' : '');
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target; // Ensure final value is correct
      }
    };

    requestAnimationFrame(updateCounter);
  }
}

// =============================================================================
// PARALLAX EFFECTS
// =============================================================================

class ParallaxManager {
  constructor() {
    this.elements = document.querySelectorAll('[data-parallax]');
    this.init();
  }

  init() {
    if (this.elements.length === 0) return;
    
    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.setupParallaxListener();
  }

  setupParallaxListener() {
    const handleScroll = throttle(() => {
      const scrolled = window.pageYOffset;
      
      this.elements.forEach(element => {
        const rate = scrolled * (element.dataset.parallax || 0.5);
        element.style.transform = `translateY(${rate}px)`;
      });
    }, 16); // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true });
  }
}

// =============================================================================
// FORM ENHANCEMENTS
// =============================================================================

class FormManager {
  constructor() {
    this.forms = document.querySelectorAll('form');
    this.init();
  }

  init() {
    this.setupFormValidation();
    this.setupFormInteractions();
  }

  setupFormValidation() {
    this.forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        if (!this.validateForm(form)) {
          e.preventDefault();
        }
      });
    });
  }

  setupFormInteractions() {
    // Enhanced input focus effects
    document.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('focus', () => {
        input.parentElement?.classList.add('focused');
      });

      input.addEventListener('blur', () => {
        if (!input.value) {
          input.parentElement?.classList.remove('focused');
        }
      });
    });

    // Character counter for message field
    const messageField = document.getElementById('message');
    const charCount = document.getElementById('charCount');
    
    if (messageField && charCount) {
      messageField.addEventListener('input', () => {
        const currentLength = messageField.value.length;
        charCount.textContent = currentLength;
        
        // Change color when approaching limit
        if (currentLength > 1800) {
          charCount.style.color = '#dc3545';
        } else if (currentLength > 1500) {
          charCount.style.color = '#ffc107';
        } else {
          charCount.style.color = 'inherit';
        }
      });
    }

    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        const submitBtn = contactForm.querySelector('#submitBtn');
        const originalText = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending...';
        submitBtn.disabled = true;
        
        // Reset button after a delay (form will redirect)
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 5000);
      });
    }

    // Check for success parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      const successMessage = document.getElementById('successMessage');
      if (successMessage) {
        successMessage.style.display = 'block';
        // Hide after 10 seconds
        setTimeout(() => {
          successMessage.style.display = 'none';
        }, 10000);
      }
    }
  }

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        this.showFieldError(input, 'This field is required');
        isValid = false;
      } else if (input.type === 'email' && !this.isValidEmail(input.value)) {
        this.showFieldError(input, 'Please enter a valid email address');
        isValid = false;
      } else {
        this.clearFieldError(input);
      }
    });

    return isValid;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showFieldError(input, message) {
    input.classList.add('error');
    let errorElement = input.parentElement?.querySelector('.error-message');
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      input.parentElement?.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }

  clearFieldError(input) {
    input.classList.remove('error');
    const errorElement = input.parentElement?.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

class PerformanceMonitor {
  constructor() {
    this.init();
  }

  init() {
    this.logPerformanceMetrics();
    this.setupErrorHandling();
  }

  logPerformanceMetrics() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          console.log('Page Load Performance:', {
            domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
            loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
            totalTime: Math.round(perfData.loadEventEnd - perfData.fetchStart)
          });
        }, 1000);
      });
    }
  }

  setupErrorHandling() {
    window.addEventListener('error', (e) => {
      console.error('JavaScript Error:', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno
      });
    });

    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled Promise Rejection:', e.reason);
    });
  }
}

// =============================================================================
// ACCESSIBILITY ENHANCEMENTS
// =============================================================================

class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupReducedMotion();
  }

  setupKeyboardNavigation() {
    // Enhanced keyboard navigation for dropdowns
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openDropdown = document.querySelector('.dropdown-menu.show');
        if (openDropdown) {
          const toggle = document.querySelector('[data-bs-toggle="dropdown"][aria-expanded="true"]');
          if (toggle) {
            toggle.click();
            toggle.focus();
          }
        }
      }
    });
  }

  setupFocusManagement() {
    // Ensure focus is visible for keyboard users
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-nav');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  }

  setupReducedMotion() {
    // Respect user's motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.setProperty('--transition-fast', '0ms');
      document.documentElement.style.setProperty('--transition-normal', '0ms');
      document.documentElement.style.setProperty('--transition-slow', '0ms');
    }
  }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

class CapeApp {
  constructor() {
    this.managers = [];
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeManagers());
    } else {
      this.initializeManagers();
    }
  }

  initializeManagers() {
    try {
      // Core functionality
      this.managers.push(new ThemeManager());
      this.managers.push(new HeaderManager());
      this.managers.push(new SmoothScrollManager());
      this.managers.push(new AnimationManager());
      
      // Interactive elements
      this.managers.push(new TechGridManager());
      this.managers.push(new CounterAnimation());
      this.managers.push(new FormManager());
      
      // Enhanced features
      this.managers.push(new ParallaxManager());
      this.managers.push(new AccessibilityManager());
      this.managers.push(new PerformanceMonitor());

      // Hero title is now immediately visible for maximum impact
      console.log('Hero optimized for professional defense contractor presentation');

      console.log('🛡️ CAPE Technology Solutions - All systems initialized');
      
    } catch (error) {
      console.error('Initialization error:', error);
    }
  }

  // Public method to get manager instances
  getManager(managerName) {
    return this.managers.find(manager => 
      manager.constructor.name === managerName
    );
  }
}

// =============================================================================
// GLOBAL UTILITIES
// =============================================================================

// Expose useful utilities globally
window.CapeUtils = {
  debounce,
  throttle,
  
  // Smooth scroll to element
  scrollTo: (selector, offset = 0) => {
    const element = document.querySelector(selector);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  },

  // Show notification (could be used for form submissions, etc.)
  notify: (message, type = 'info') => {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Could be extended to show actual toast notifications
  },

  // Format numbers for display
  formatNumber: (num) => {
    return new Intl.NumberFormat().format(num);
  }
};

// =============================================================================
// START APPLICATION
// =============================================================================

// Initialize the application
const capeApp = new CapeApp();

// Make app instance available globally for debugging
window.CapeApp = capeApp;

// Add some additional CSS classes via JavaScript for animations
const style = document.createElement('style');
style.textContent = `
  .animate-in {
    animation: fadeIn 0.4s ease-out forwards;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .page-transitioning.fade-out {
    animation: fadeOut 0.3s ease-out forwards;
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-5px);
    }
  }
  
  .keyboard-nav *:focus {
    outline: 2px solid var(--blue-accent) !important;
    outline-offset: 2px !important;
  }
  
  .error {
    border-color: var(--red-primary) !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
  }
  
  .error-message {
    color: var(--red-primary);
    font-size: var(--font-size-sm);
    margin-top: var(--space-1);
  }
  
  /* Consistent header styling across themes */
  .site-header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.4s cubic-bezier(0.4, 0.0, 0.2, 1), 
                box-shadow 0.4s cubic-bezier(0.4, 0.0, 0.2, 1),
                transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  }
  
  .site-header.scrolled {
    background: rgba(255, 255, 255, 0.98) !important;
    box-shadow: 0 2px 20px var(--shadow-medium);
    border-bottom: 1px solid var(--border-color);
  }
  
  [data-theme="dark"] .site-header {
    background: rgba(15, 20, 25, 0.95);
    color: var(--text-white);
    border-bottom: 1px solid var(--border-color);
  }
  
  [data-theme="dark"] .site-header.scrolled {
    background: rgba(15, 20, 25, 0.98) !important;
    box-shadow: 0 2px 20px var(--shadow-medium);
    border-bottom: 1px solid var(--border-color);
  }
`;

document.head.appendChild(style);

// Apply initial theme immediately to prevent flash
const savedTheme = localStorage.getItem('cape-theme');
const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

// Hide the page content until theme is applied
document.body.style.visibility = 'hidden';

// Apply theme immediately
document.documentElement.setAttribute('data-theme', initialTheme);

// Also set the page loader background immediately to match theme
const loader = document.querySelector('.page-loader');
if (loader) {
  if (initialTheme === 'dark') {
    loader.style.background = 'var(--background-dark)';
  } else {
    loader.style.background = 'var(--background-light)';
  }
  
  // Fade in the loader smoothly
  setTimeout(() => {
    loader.style.opacity = '1';
  }, 50);
}

// Show page content after theme is applied
setTimeout(() => {
  document.body.style.visibility = 'visible';
}, 100);

// Fade in on page load
document.documentElement.classList.add('theme-transitioning');
setTimeout(() => {
  document.documentElement.classList.add('theme-fade-in');
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning', 'theme-fade-in');
  }, 200); // Much faster - reduced from 600ms to 200ms for more responsive text
}, 10);

// Add smooth page load animations and scroll to top
document.addEventListener('DOMContentLoaded', () => {
  // Scroll to top immediately
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Remove loading state with smooth transition
  const loader = document.querySelector('.page-loader');
  if (loader) {
    loader.style.transition = 'opacity 0.3s ease-out';
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.style.display = 'none';
    }, 300);
  }
  
  // Add gradual fade-in animation to main content sections
  const mainSections = document.querySelectorAll('main, .hero-section, .capabilities-section, .gallery-section, .trust-section, .leadership-section, .cta-section, .site-footer');
  
  mainSections.forEach((section, index) => {
    // Set initial state - very subtle
    section.style.opacity = '0';
    section.style.transform = 'translateY(5px)';
    section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    
    // Much more gradual stagger - longer delays between sections
    setTimeout(() => {
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, 200 + (index * 150)); // Longer delays between sections
  });
  
  // Add subtle scroll animations - just gentle fade-in
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Simple fade-in without movement
        entry.target.style.opacity = '0';
        entry.target.style.transition = 'opacity 0.4s ease-out';
        
        setTimeout(() => {
          entry.target.style.opacity = '1';
        }, 50);
      }
    });
  }, observerOptions);

  // Observe elements for subtle scroll animations
  const animatedElements = document.querySelectorAll('.capability-card, .gallery-item, .cert-card, .leadership-card, .benefit-card, .position-card, .contact-card, .info-card, .solution-card, .method-item, .process-step, .tech-category, .spec-tech-card, .advantage-item, .metric-card, .team-item, .value-item');

  animatedElements.forEach(el => {
    observer.observe(el);
  });
});

// Handle browser navigation (back/forward buttons) to ensure scroll to top
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Page was loaded from cache (back/forward navigation)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    // Page became visible again
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

// Also do this when toggling theme
function fadeThemeTransition() {
  document.documentElement.classList.add('theme-transitioning');
  setTimeout(() => {
    document.documentElement.classList.add('theme-fade-in');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning', 'theme-fade-in');
    }, 200); // Much faster - reduced from 600ms to 200ms for more responsive text
  }, 10);
}
// Call fadeThemeTransition() after theme toggle

