/**
 * NextGen Component - Navbar Controller
 * Handles sticky glassmorphism on scroll and mobile drawer interactions.
 */

import { $, $$, on, addClass, removeClass, toggleClass } from '../utils/dom.js';

export class NavbarController {
  constructor() {
    this.navbar = $('#navbar');
    this.hamburger = $('#nav-hamburger');
    this.drawer = $('#nav-drawer');
    this.backdrop = $('#nav-backdrop');
    this.drawerLinks = $$('.drawer-link');
    this.isOpen = false;
    this.lastScrollY = 0;
  }

  init() {
    if (!this.navbar) return;

    this.bindScroll();
    this.bindDrawer();
  }

  bindScroll() {
    let ticking = false;

    window.addEventListener('scroll', () => {
      this.lastScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (this.lastScrollY > 20) {
            addClass(this.navbar, 'scrolled');
          } else {
            removeClass(this.navbar, 'scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  bindDrawer() {
    if (!this.hamburger || !this.drawer) return;

    // Toggle drawer on hamburger click
    on(this.hamburger, 'click', () => {
      this.toggleDrawer();
    });

    // Close on backdrop click
    if (this.backdrop) {
      on(this.backdrop, 'click', () => {
        this.closeDrawer();
      });
    }

    // Close on clicking any drawer link
    this.drawerLinks.forEach(link => {
      on(link, 'click', () => {
        this.closeDrawer();
      });
    });

    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDrawer();
      }
    });
  }

  toggleDrawer() {
    if (this.isOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer() {
    this.isOpen = true;
    addClass(this.hamburger, 'active');
    addClass(this.drawer, 'open');
    if (this.backdrop) addClass(this.backdrop, 'active');
    this.hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  }

  closeDrawer() {
    this.isOpen = false;
    removeClass(this.hamburger, 'active');
    removeClass(this.drawer, 'open');
    if (this.backdrop) removeClass(this.backdrop, 'active');
    this.hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

export const navbarController = new NavbarController();
