/**
 * CAPE Technology Solutions - Main JavaScript Module
 * Modular approach for better maintainability and performance
 */

class ThemeToggle {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.html = document.documentElement;
    this.toggleIcon = this.themeToggle?.querySelector('i');
    this.init();
  }

  init() {
    if (!this.themeToggle || !this.toggleIcon) {
      console.warn('Theme toggle elements not found');
      return;
    }

    // Initialize theme from localStorage
    this.loadSavedTheme();
    
    // Add event listener
    this.themeToggle.addEventListener('click', () => this.toggleTheme());
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setDarkTheme();
    } else {
      this.setLightTheme();
    }
  }

  toggleTheme() {
    const isDark = this.html.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
      this.setLightTheme();
      localStorage.setItem('theme', 'light');
    } else {
      this.setDarkTheme();
      localStorage.setItem('theme', 'dark');
    }
  }

  setDarkTheme() {
    this.html.setAttribute('data-theme', 'dark');
    this.toggleIcon.classList.replace('bi-sun-fill', 'bi-moon-fill');
    this.themeToggle.setAttribute('aria-pressed', 'true');
    this.themeToggle.querySelector('.visually-hidden').textContent = 'Switch to light mode';
  }

  setLightTheme() {
    this.html.removeAttribute('data-theme');
    this.toggleIcon.classList.replace('bi-moon-fill', 'bi-sun-fill');
    this.themeToggle.setAttribute('aria-pressed', 'false');
    this.themeToggle.querySelector('.visually-hidden').textContent = 'Switch to dark mode';
  }
}

class AnimationController {
  constructor() {
    this.elements = document.querySelectorAll('.section, .card-holo, .leidos-box, .hero-content, .leidos-img');
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.setupIntersectionObserver();
    } else {
      // Fallback for older browsers
      this.showAllElements();
    }
  }

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '-50px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          // Stagger animations for better visual effect
          setTimeout(() => {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // Stop observing once animated
          }, idx * 100);
        }
      });
    }, observerOptions);

    this.elements.forEach(el => observer.observe(el));
  }

  showAllElements() {
    this.elements.forEach(el => el.classList.add('visible'));
  }
}

class ParallaxController {
  constructor() {
    this.hero = document.querySelector('.hero');
    this.isEnabled = window.innerWidth > 768; // Disable on mobile for performance
    this.init();
  }

  init() {
    if (!this.hero || !this.isEnabled) {
      return;
    }

    this.bindEvents();
  }

  bindEvents() {
    // Use passive listener for better scroll performance
    window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
    // Re-evaluate on resize
    window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
  }

  handleScroll() {
    if (!this.isEnabled) return;
    
    const scrollPosition = window.scrollY;
    // Reduced multiplier for subtler effect and better performance
    this.hero.style.transform = `translateY(${scrollPosition * 0.2}px)`;
  }

  handleResize() {
    this.isEnabled = window.innerWidth > 768;
    if (!this.isEnabled) {
      // Reset transform on mobile
      this.hero.style.transform = '';
    }
  }
}

class PageTransitions {
  constructor() {
    this.links = document.querySelectorAll('a[href$=".html"]');
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    this.links.forEach(link => {
      link.addEventListener('click', (e) => this.handleLinkClick(e));
    });
  }

  handleLinkClick(e) {
    const href = e.currentTarget.getAttribute('href');
    
    // Skip external links, mailto, and tel links
    if (this.isExternalLink(href)) {
      return; // Allow default behavior
    }

    e.preventDefault();
    this.transitionToPage(href);
  }

  isExternalLink(href) {
    return href.startsWith('http') || 
           href.startsWith('mailto') || 
           href.startsWith('tel') ||
           href.startsWith('#');
  }

  transitionToPage(href) {
    document.body.classList.add('page-exit');
    
    // Navigate after transition completes
    setTimeout(() => {
      window.location.href = href;
    }, 300); // Match CSS transition duration
  }
}

class AccessibilityEnhancements {
  constructor() {
    this.init();
  }

  init() {
    this.enhanceKeyboardNavigation();
    this.addSkipLinkFunctionality();
  }

  enhanceKeyboardNavigation() {
    // Ensure all interactive elements are keyboard accessible
    const interactiveElements = document.querySelectorAll('button, a, [tabindex]');
    
    interactiveElements.forEach(element => {
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          // Handle space bar activation for buttons
          if (element.tagName === 'BUTTON' && e.key === ' ') {
            e.preventDefault();
            element.click();
          }
        }
      });
    });
  }

  addSkipLinkFunctionality() {
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) {
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(skipLink.getAttribute('href'));
        if (target) {
          target.focus();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }
}

class ErrorHandler {
  static logError(context, error) {
    console.error(`Error in ${context}:`, error);
    
    // In production, you might want to send errors to a logging service
    // this.sendToLoggingService(context, error);
  }

  static handleComponentError(componentName, error) {
    this.logError(componentName, error);
    
    // Graceful degradation - ensure basic functionality still works
    document.querySelectorAll('.section, .card-holo, .leidos-box, .hero-content, .leidos-img')
      .forEach(el => el.classList.add('visible'));
  }
}

// Initialize all components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Initialize core components
    new ThemeToggle();
    new AnimationController();
    new ParallaxController();
    new PageTransitions();
    new AccessibilityEnhancements();

    // Log successful initialization
    console.log('CAPE Technology Solutions website initialized successfully');
    
  } catch (error) {
    ErrorHandler.handleComponentError('Main Application', error);
  }
});

// Handle page visibility changes for performance optimization
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden - pause expensive operations
    console.log('Page hidden - pausing animations');
  } else {
    // Page is visible - resume operations
    console.log('Page visible - resuming animations');
  }
});

// Export classes for potential use in other modules
window.CAPEComponents = {
  ThemeToggle,
  AnimationController,
  ParallaxController,
  PageTransitions,
  AccessibilityEnhancements,
  ErrorHandler
};