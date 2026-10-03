/**
 * NextGen Master Script
 * Entry point orchestrating core modules, components, tabs, and animations.
 */

import { APP_CONFIG } from './core/config.js?v=15';
import { themeEngine } from './core/theme.js?v=15';
import { navbarController } from './components/navbar.js?v=15';
import { tabController } from './components/tabs.js?v=15';
import { pricingController } from './components/pricing.js?v=15';
import { homeController } from './pages/home.js?v=15';
import { modalController } from './components/modal.js?v=15';
import { featureVideoController } from './components/features-video.js?v=15';
import { feedbackModalController } from './components/feedback-modal.js?v=16';
import { toast } from './components/toast.js?v=15';
import { scrollReveal } from './utils/animation.js?v=15';
import { $$ } from './utils/dom.js?v=15';

// Expose on window for runtime and inline interaction
window.featureVideoController = featureVideoController;
window.feedbackModalController = feedbackModalController;

class NextGenApp {
  constructor() {
    this.config = APP_CONFIG;
  }

  async init() {
    // 0. Load Environment Configuration (.env or window.__ENV__)
    await this.config.loadEnv();

    // 1. Initialize Theme System
    themeEngine.init();

    // 2. Initialize Navigation and Drawer
    navbarController.init();

    // 3. Initialize Tab Router (Home, Features, Billing, Study, Terms)
    tabController.init();

    // 4. Initialize Home Page Controller (Mockup, APK Download, Contacts)
    homeController.init();

    // 5. Initialize Billing Pricing Toggle
    pricingController.init();

    // 6. Initialize Modal System
    modalController.init();

    // 6.5. Initialize Cloud Feedback Controller
    feedbackModalController.init();

    // 7. Initialize Feature Card Video Controller (Hover Preview & Theater Mode)
    featureVideoController.init();

    // 8. Initialize Scroll Reveal Animations
    scrollReveal.init();

    // 9. Initialize Feature Card Click Handlers
    this.initFeatureCardHandlers();

    // 10. Initialize Number Counters
    this.initNumberCounters();

    // 11. Console Branding
    this.printBranding();
  }

  initFeatureCardHandlers() {
    document.addEventListener('click', (e) => {
      // Don't navigate if clicking inside video box or theater expand button
      if (e.target.closest('.feature-card-video-box') || e.target.closest('[data-video-expand]')) {
        return;
      }
      const card = e.target.closest('[data-feature-card]');
      if (card) {
        const featureId = card.getAttribute('data-feature-id');
        if (featureId) {
          tabController.navigate(`features/${featureId}`, true);
        }
      }
    });
  }

  initNumberCounters() {
    const counters = $$('[data-counter-target]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-counter-target'), 10);
          const suffix = el.getAttribute('data-counter-suffix') || '';
          const prefix = el.getAttribute('data-counter-prefix') || '';
          const duration = 1600;
          const stepTime = 20;
          const totalSteps = duration / stepTime;
          const increment = target / totalSteps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
          }, stepTime);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(counter => observer.observe(counter));
  }

  printBranding() {
    console.log(
      `%c⚡ NextGen Web Framework v${this.config.version} %c Multi-Tab Architecture Ready`,
      'background: #0284C7; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
      'color: #00F2FE; font-weight: 500;'
    );
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new NextGenApp();
  app.init();
  window.__NEXGEN_APP__ = app;
});
