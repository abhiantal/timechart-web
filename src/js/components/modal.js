/**
 * NextGen Component - Modal Helper
 * Accessible dialog and modal controller.
 */

import { $, on, addClass, removeClass } from '../utils/dom.js';

export class ModalController {
  constructor() {
    this.activeModal = null;
  }

  open(modalId) {
    const modal = typeof modalId === 'string' ? $(modalId) : modalId;
    if (!modal) return;

    this.activeModal = modal;
    addClass(modal, 'open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus first focusable element
    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  close(modalId) {
    const modal = modalId ? (typeof modalId === 'string' ? $(modalId) : modalId) : this.activeModal;
    if (!modal) return;

    removeClass(modal, 'open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.activeModal = null;
  }

  init() {
    // Listen for modal close triggers
    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-modal-close]');
      if (closeBtn) {
        e.preventDefault();
        this.close();
      }
    });

    // Close on backdrop click
    document.addEventListener('click', (e) => {
      if (this.activeModal && e.target.classList.contains('modal-backdrop')) {
        this.close();
      }
    });

    // Close on Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal) {
        this.close();
      }
    });
  }
}

export const modalController = new ModalController();
