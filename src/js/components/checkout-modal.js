/**
 * NextGen Component - Checkout & Payment Authentication Modal
 * Standalone, theme-adaptive modal controller for subscriber identification
 * and payment flow orchestration.
 */

import { APP_CONFIG } from '../core/config.js';
import { toast } from './toast.js';

export class CheckoutModalController {
  constructor() {
    this.modal = null;
    this.isOpen = false;
    this.activeResolve = null;
  }

  /**
   * Builds or returns the cached modal backdrop DOM element.
   */
  getOrCreateModal() {
    let backdrop = document.getElementById('checkout-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'checkout-modal-backdrop';
      backdrop.className = 'checkout-modal-backdrop';
      backdrop.setAttribute('role', 'dialog');
      backdrop.setAttribute('aria-modal', 'true');
      backdrop.setAttribute('aria-labelledby', 'modal-plan-name');
      backdrop.innerHTML = `
        <div class="checkout-modal-container">
          <div class="checkout-modal-beam"></div>
          
          <div class="checkout-modal-header">
            <div class="checkout-modal-security-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Zero-Trust 256-bit SSL</span>
            </div>
            <button type="button" class="checkout-modal-close-btn" id="checkout-modal-close-btn" aria-label="Close modal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="checkout-modal-body">
            <div class="checkout-plan-preview-box">
              <div class="checkout-plan-title-col">
                <div class="checkout-plan-name" id="modal-plan-name">Sprint Pass</div>
                <div class="checkout-plan-cycle-tag" id="modal-plan-cycle">
                  <span class="pass-pulse-dot checkout-pulse-dot"></span>
                  <span id="modal-plan-cycle-text">7 Days Access &bull; 1-Tap UPI</span>
                </div>
              </div>
              <div class="checkout-plan-price-col">
                <div class="checkout-plan-price-val" id="modal-plan-price">₹19</div>
                <div class="checkout-plan-price-sub" id="modal-plan-sub">Zero recurring debit</div>
              </div>
            </div>

            <div class="checkout-input-group">
              <label class="checkout-input-label" for="checkout-user-input">
                <span>Account Identifier</span>
                <span class="checkout-input-hint">Links pass to your Time Chart app</span>
              </label>
              <div class="checkout-input-wrapper">
                <svg class="checkout-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <input type="text" id="checkout-user-input" class="checkout-input-field" placeholder="Enter your email or User ID (e.g. user@domain.com)" autocomplete="email">
              </div>
            </div>

            <div class="checkout-payment-methods">
              <span class="checkout-rail-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>
                Google Pay
              </span>
              <span class="checkout-rail-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>
                PhonePe
              </span>
              <span class="checkout-rail-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>
                Paytm &amp; UPI QR
              </span>
              <span class="checkout-rail-pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/></svg>
                Cards &amp; NetBanking
              </span>
            </div>

            <button type="button" class="checkout-cta-btn" id="checkout-launch-btn">
              <span>Launch Secure Checkout</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>

            <div class="checkout-guarantee-note">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--color-emerald, #10B981);"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>Instant server-side verification &bull; Zero banking auto-debits</span>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }
    this.modal = backdrop;
    return backdrop;
  }

  /**
   * Opens the checkout modal and resolves with user identifier or null if dismissed.
   */
  open({ planId, planTitle, billingCycle, price, cycleText, subText, inputHint }) {
    return new Promise((resolve) => {
      const modal = this.getOrCreateModal();
      this.isOpen = true;
      this.activeResolve = resolve;

      const planNameEl = modal.querySelector('#modal-plan-name');
      const planCycleText = modal.querySelector('#modal-plan-cycle-text');
      const planPriceEl = modal.querySelector('#modal-plan-price');
      const planSubEl = modal.querySelector('#modal-plan-sub');
      const inputEl = modal.querySelector('#checkout-user-input');
      const hintEl = modal.querySelector('.checkout-input-hint');
      const launchBtn = modal.querySelector('#checkout-launch-btn');
      const closeBtn = modal.querySelector('#checkout-modal-close-btn');

      // Populate plan details
      if (planNameEl) planNameEl.textContent = planTitle || 'Time Chart Pro';
      if (planCycleText) {
        planCycleText.textContent = cycleText || (billingCycle === 'one_time' 
          ? 'Single Pass • 1-Tap UPI' 
          : (billingCycle === 'annual' ? 'Annual Billing' : 'Monthly Billing'));
      }
      if (planPriceEl) {
        planPriceEl.textContent = price ? (String(price).startsWith('₹') ? price : `₹${price}`) : '';
      }
      if (planSubEl) {
        planSubEl.textContent = subText || (billingCycle === 'one_time' ? 'Zero recurring debit' : 'Cancel anytime');
      }
      if (hintEl) {
        hintEl.textContent = inputHint || 'Links pass to your Time Chart app';
      }

      // Clear any dummy test emails from storage and keep input empty by default
      ['nexgen_user_email', 'tc_user_email', 'nexgen_user_id', 'tc_user_id'].forEach(k => {
        const v = localStorage.getItem(k);
        if (v && (v.includes('example.com') || v.includes('test@') || v === 'student@example.com')) {
          localStorage.removeItem(k);
        }
      });

      // Start with a clean, empty input so placeholder is visible
      if (inputEl) {
        inputEl.value = '';
      }

      const cleanup = () => {
        modal.classList.remove('open');
        this.isOpen = false;
        document.removeEventListener('keydown', handleKey);
        if (closeBtn) closeBtn.removeEventListener('click', handleClose);
        modal.removeEventListener('click', handleBackdropClick);
        if (launchBtn) launchBtn.removeEventListener('click', handleConfirm);
        if (inputEl) inputEl.removeEventListener('keydown', handleInputKey);
      };

      const handleClose = () => {
        cleanup();
        resolve(null);
      };

      const handleBackdropClick = (e) => {
        if (e.target === modal) {
          handleClose();
        }
      };

      const handleConfirm = () => {
        const val = inputEl ? inputEl.value.trim() : '';
        if (!val) {
          if (inputEl) inputEl.focus();
          toast.show({
            title: 'Account Required',
            message: 'Please enter your account email or User ID to link your access.',
            duration: 3500,
          });
          return;
        }
        cleanup();
        resolve(val);
      };

      const handleKey = (e) => {
        if (e.key === 'Escape') {
          handleClose();
        }
      };

      const handleInputKey = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirm();
        }
      };

      // Attach lifecycle listeners
      if (closeBtn) closeBtn.addEventListener('click', handleClose);
      modal.addEventListener('click', handleBackdropClick);
      if (launchBtn) launchBtn.addEventListener('click', handleConfirm);
      document.addEventListener('keydown', handleKey);
      if (inputEl) inputEl.addEventListener('keydown', handleInputKey);

      // Open transition and focus
      requestAnimationFrame(() => {
        modal.classList.add('open');
        setTimeout(() => {
          if (inputEl) inputEl.focus();
        }, 120);
      });
    });
  }

  /**
   * Programmatically closes the modal.
   */
  close() {
    if (this.modal && this.isOpen) {
      this.modal.classList.remove('open');
      this.isOpen = false;
      if (this.activeResolve) {
        this.activeResolve(null);
        this.activeResolve = null;
      }
    }
  }
}

export const checkoutModal = new CheckoutModalController();
