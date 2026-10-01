/**
 * NextGen Utils - Scroll Reveal Animation System
 * Uses IntersectionObserver for performant micro-animations.
 */

import { $$ } from './dom.js';

export class ScrollRevealManager {
  constructor(options = {}) {
    this.options = {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
      selector: '.reveal-on-scroll',
      revealedClass: 'is-revealed',
      ...options
    };
    this.observer = null;
  }

  init() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: reveal all immediately if IntersectionObserver isn't supported
      $$(this.options.selector).forEach(el => {
        el.classList.add(this.options.revealedClass);
      });
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(this.options.revealedClass);
          // Unobserve once revealed for performance
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: this.options.threshold,
      rootMargin: this.options.rootMargin
    });

    this.observeAll();
  }

  observeAll() {
    if (!this.observer) return;
    $$(this.options.selector).forEach(el => {
      // If already in viewport or hero, reveal immediately to eliminate UI flicker
      const rect = el.getBoundingClientRect();
      if ((rect.top < window.innerHeight && rect.bottom > 0) || el.closest('.section-hero')) {
        el.classList.add(this.options.revealedClass);
      } else {
        this.observer.observe(el);
      }
    });
  }

  refresh() {
    this.observeAll();
  }
}

export const scrollReveal = new ScrollRevealManager();
