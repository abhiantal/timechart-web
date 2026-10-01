/**
 * NextGen Component - Tab Navigation Router & Combiner
 * Synchronizes tabs, URL hashes, desktop navbar, mobile drawer, and mounts separate page files and module detail views.
 */

import { $, $$, on, addClass, removeClass } from '../utils/dom.js';
import { pageLoader } from '../core/page-loader.js';
import { PAGE_PATHS, MODULE_NAMES } from '../pages/registry.js';

export class TabController {
  constructor() {
    this.primaryTabs = ['home', 'features', 'billing', 'study', 'terms'];
    this.currentRoute = 'home';
    this.navLinks = $$('[data-tab-target]');
  }

  init() {
    // 1. Resolve initial route from URL hash (e.g. #billing, #features/day-task) or default to 'home'
    const hash = window.location.hash.replace('#', '').toLowerCase().trim();
    let initialRoute = 'home';
    if (this.isValidRoute(hash)) {
      initialRoute = hash;
    } else if (hash.startsWith('cat-')) {
      initialRoute = 'features';
    }
    this.navigate(initialRoute, false);

    // 2. Listen to all internal navigation triggers with full fallbacks
    document.addEventListener('click', (e) => {
      // 0. Do NOT navigate if clicking video, theater modal, or external download triggers
      if (
        e.target.closest('[data-video-src]') || 
        e.target.closest('[data-video-expand]') || 
        e.target.closest('[data-image-expand]') || 
        e.target.closest('.study-media-play-btn') || 
        e.target.closest('.study-pdf-pill-btn') || 
        e.target.closest('#theater-modal') ||
        e.target.closest('.video-theater-modal') ||
        e.target.closest('a[download]') ||
        e.target.closest('a[target="_blank"]')
      ) {
        return;
      }

      // 1. Study Target Click (e.g. data-study-target="j-curve" or "study")
      const studyTrigger = e.target.closest('[data-study-target]');
      if (studyTrigger) {
        e.preventDefault();
        const raw = studyTrigger.getAttribute('data-study-target').replace(/^#\/?/, '').trim();
        let route = raw;
        if (raw === 'study') {
          route = 'study';
        } else if (!raw.startsWith('study/')) {
          route = `study/${raw}`;
        }
        if (this.isValidRoute(route)) {
          this.navigate(route, true);
          return;
        }
      }

      // 2. Study Card Click (clicking anywhere on card body)
      const studyCard = e.target.closest('[data-study-card]');
      if (studyCard && !e.target.closest('button') && !e.target.closest('a')) {
        e.preventDefault();
        const cardId = studyCard.getAttribute('data-study-card').replace(/^#\/?/, '').trim();
        const route = cardId.startsWith('study/') ? cardId : `study/${cardId}`;
        if (this.isValidRoute(route)) {
          this.navigate(route, true);
          return;
        }
      }

      // 3. Feature Module Click (data-module-target)
      const moduleTrigger = e.target.closest('[data-module-target]');
      if (moduleTrigger) {
        e.preventDefault();
        const raw = moduleTrigger.getAttribute('data-module-target').replace(/^#\/?/, '').trim();
        const route = raw.startsWith('features/') ? raw : `features/${raw}`;
        if (this.isValidRoute(route)) {
          this.navigate(route, true);
          return;
        }
      }

      // 4. Feature Card Title / Action / Header Click (features.html)
      const featureCard = e.target.closest('[data-feature-card]');
      if (featureCard && (e.target.closest('.feature-module-header') || e.target.closest('.feature-module-title') || e.target.closest('.feature-module-desc') || e.target.closest('.feature-module-action'))) {
        e.preventDefault();
        const featId = featureCard.getAttribute('data-feature-id');
        if (featId) {
          const route = `features/${featId}`;
          if (this.isValidRoute(route)) {
            this.navigate(route, true);
            return;
          }
        }
      }

      // 5. Primary Tab Click (data-tab-target="features", data-tab-target="study", etc.)
      const tabTrigger = e.target.closest('[data-tab-target]');
      if (tabTrigger) {
        e.preventDefault();
        let target = tabTrigger.getAttribute('data-tab-target').replace(/^#\/?/, '').trim();
        if (this.isValidRoute(target)) {
          this.navigate(target, true);
          return;
        }
      }

      // 6. Generic Hash Link (<a href="#study/j-curve"> or <a href="#study"> or <a href="#features">)
      const hashLink = e.target.closest('a[href^="#"]');
      if (hashLink) {
        if (hashLink.closest('.category-nav-pill, .features-category-nav, [data-category-filter]')) {
          return;
        }
        const href = hashLink.getAttribute('href');
        const cleanRoute = href.replace(/^#\/?/, '').trim();
        if (cleanRoute && this.isValidRoute(cleanRoute)) {
          e.preventDefault();
          this.navigate(cleanRoute, true);
          return;
        }
      }
    });

    // 3. Listen to browser forward/backward navigation
    window.addEventListener('hashchange', () => {
      const currentHash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
      if (this.isValidRoute(currentHash) && currentHash !== this.currentRoute) {
        this.navigate(currentHash, false);
      }
    });
  }

  isValidRoute(route) {
    if (!route) return false;
    const clean = route.replace(/^#\/?/, '').trim();
    return this.primaryTabs.includes(clean) || (clean in PAGE_PATHS) || clean.startsWith('features/') || clean.startsWith('study/');
  }

  navigate(rawRoute, updateHash = true) {
    const route = rawRoute.replace(/^#\/?/, '').trim();
    if (!this.isValidRoute(route)) return;
    this.currentRoute = route;

    // 1. Dynamically load and combine the page file into the mount container
    pageLoader.load(route);

    // 2. Toggle detail page state on body & update breadcrumb
    const isDetailRoute = route.startsWith('features/');
    const isStudyDetailRoute = route.startsWith('study/') && route.length > 'study/'.length && route !== 'study';
    if (isDetailRoute) {
      document.body.classList.add('is-detail-page');
      const moduleId = route.replace('features/', '');
      const moduleName = MODULE_NAMES[moduleId] || moduleId.replace('-', ' ');
      const bcCurrent = document.getElementById('nav-bc-module-name');
      if (bcCurrent) {
        bcCurrent.textContent = moduleName;
      }
    } else {
      document.body.classList.remove('is-detail-page');
    }

    // 3. Determine Primary Active Tab for Navbar
    // If on a sub-route like 'features/day-task' or 'study/atomic-habits', parent tab remains highlighted
    const primaryActiveTab = isDetailRoute ? 'features' : isStudyDetailRoute ? 'study' : route;

    // 3. Update Nav Link Active States (Desktop & Mobile)
    this.navLinks = $$('[data-tab-target]');
    this.navLinks.forEach(link => {
      if (link.getAttribute('data-tab-target') === primaryActiveTab) {
        addClass(link, 'active');
      } else {
        removeClass(link, 'active');
      }
    });

    // 4. Update URL Hash
    if (updateHash) {
      history.pushState(null, '', `#${route}`);
    }

    // 5. Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 6. Dispatch custom event for sub-components
    window.dispatchEvent(new CustomEvent('nexgen:tab-changed', {
      detail: { route, primaryActiveTab }
    }));
  }

  // Alias for backward compatibility
  switchTab(tabId, updateHash = true) {
    this.navigate(tabId, updateHash);
  }
}

export const tabController = new TabController();
