/**
 * NextGen Component - Pricing Toggle & Live Billing Controller
 * Toggles between Monthly and Annual billing figures and orchestrates
 * Razorpay Checkout & Supabase server-side payment verification.
 */

import { $, $$ } from '../utils/dom.js';
import { APP_CONFIG } from '../core/config.js';
import { APP_LINKS } from '../core/links.js';
import { toast } from './toast.js';
import { checkoutModal } from './checkout-modal.js';

export class PricingController {
  constructor() {
    this.isAnnual = false;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Use event delegation on document so it works regardless of when billing.html is mounted
    document.addEventListener('click', (e) => {
      const toggleSwitch = e.target.closest('#billing-cycle-switch');
      const monthlyLabel = e.target.closest('#billing-label-monthly');
      const annualLabel = e.target.closest('#billing-label-annual');
      const discountBadge = e.target.closest('.billing-discount-badge');
      const toggleWrapper = e.target.closest('.billing-toggle-wrapper');

      if (toggleSwitch) {
        e.preventDefault();
        this.toggle();
      } else if (monthlyLabel) {
        e.preventDefault();
        if (this.isAnnual) this.toggle();
      } else if (annualLabel || discountBadge) {
        e.preventDefault();
        if (!this.isAnnual) this.toggle();
      } else if (toggleWrapper) {
        e.preventDefault();
        this.toggle();
      }

      // Handle Billing Plan CTA Buttons
      const billingBtn = e.target.closest('[data-billing-plan]');
      if (billingBtn) {
        e.preventDefault();
        this.handlePlanCheckout(billingBtn);
        return;
      }

      // Handle Gamified Rules Scroll Buttons
      const scrollRulesBtn = e.target.closest('[data-scroll-rules]');
      if (scrollRulesBtn) {
        e.preventDefault();
        const rulesCard = document.querySelector('.billing-rules-card');
        if (rulesCard) {
          rulesCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          rulesCard.style.transition = 'border-color 0.4s ease, box-shadow 0.4s ease';
          rulesCard.style.borderColor = 'var(--color-emerald)';
          rulesCard.style.boxShadow = '0 0 35px var(--color-emerald-glow)';
          setTimeout(() => {
            rulesCard.style.borderColor = '';
            rulesCard.style.boxShadow = '';
          }, 2000);
        }
        return;
      }
    });

    // Keyboard accessibility for toggle switch
    document.addEventListener('keydown', (e) => {
      const toggleSwitch = e.target.closest('#billing-cycle-switch');
      if (toggleSwitch && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  syncUI() {
    const toggleSwitch = $('#billing-cycle-switch');
    const monthlyLabel = $('#billing-label-monthly');
    const annualLabel = $('#billing-label-annual');

    if (toggleSwitch) {
      toggleSwitch.setAttribute('aria-checked', this.isAnnual ? 'true' : 'false');
      if (this.isAnnual) {
        toggleSwitch.classList.add('annual');
        if (annualLabel) annualLabel.classList.add('active');
        if (monthlyLabel) monthlyLabel.classList.remove('active');
      } else {
        toggleSwitch.classList.remove('annual');
        if (monthlyLabel) monthlyLabel.classList.add('active');
        if (annualLabel) annualLabel.classList.remove('active');
      }
    }

    // Update all dynamic price figures
    const priceElements = $$('[data-price-monthly]');
    priceElements.forEach(el => {
      const monthly = el.getAttribute('data-price-monthly');
      const annual = el.getAttribute('data-price-annual');
      el.textContent = this.isAnnual ? annual : monthly;
    });

    // Update periods (/ mo vs / yr)
    const periodElements = $$('[data-price-period]');
    periodElements.forEach(el => {
      el.textContent = this.isAnnual ? '/ yr' : '/ mo';
    });

    // Update annual savings notes
    const annualNoteElements = $$('[data-annual-note]');
    annualNoteElements.forEach(el => {
      el.style.visibility = this.isAnnual ? 'visible' : 'hidden';
    });
  }

  toggle() {
    this.isAnnual = !this.isAnnual;
    this.syncUI();
  }

  /**
   * Orchestrates Razorpay Checkout with server-side order generation and zero-trust verification.
   */
  async handlePlanCheckout(button) {
    const planId = button.getAttribute('data-billing-plan');
    if (!planId) return;

    if (planId === 'free') {
      toast.show({
        title: 'Free Starter Plan Active',
        message: 'Free tier is enabled for all users. Download the mobile app to get started!',
        duration: 4000,
      });
      return;
    }

    const planTitle = button.getAttribute('data-plan-title') || planId;
    const billingCycle = button.getAttribute('data-billing-cycle') || (this.isAnnual ? 'annual' : 'monthly');
    
    // Multi-container price resolution (pricing-card, squad-hero-card, boost-card, pass-card)
    let price = button.getAttribute('data-price');
    if (!price) {
      const container = button.closest('.pricing-card, .squad-hero-card, .boost-card, .pass-card, tr');
      if (container) {
        if (this.isAnnual && container.querySelector('[data-price-annual]')) {
          price = container.querySelector('[data-price-annual]').textContent.trim();
        } else if (container.querySelector('[data-price-monthly]')) {
          price = container.querySelector('[data-price-monthly]').textContent.trim();
        } else if (container.querySelector('.pass-price-num')) {
          price = container.querySelector('.pass-price-num').textContent.trim();
        } else if (container.querySelector('.boost-card-price')) {
          price = container.querySelector('.boost-card-price').textContent.replace(/[^\d]/g, '').trim();
        }
      }
    }

    let cycleText = '';
    let subText = '';
    let inputHint = '';

    if (planId.startsWith('boost_')) {
      const days = button.getAttribute('data-boost-days') || (planId === 'boost_basic_3d' ? '3 Days' : (planId === 'boost_weekly_7d' ? '7 Days' : '15 Days'));
      cycleText = `${days} Feed Boost • 1-Tap UPI`;
      subText = 'One-time community post amplification';
      inputHint = 'Enter Post ID or Account to boost';
    } else if (planId === 'squad' || planId === 'study_squad') {
      cycleText = this.isAnnual ? '4 Accounts • Annual Billing' : '4 Accounts • Monthly Billing';
      subText = this.isAnnual ? '₹50 / person / mo (Save 33%)' : '~₹75 / person / mo • Cancel anytime';
      inputHint = 'Primary admin email to receive 4 account credentials';
    }

    // Always prompt / confirm user account identifier via dedicated checkout modal
    const input = await checkoutModal.open({ 
      planId,
      planTitle, 
      billingCycle, 
      price,
      cycleText,
      subText,
      inputHint,
    });
    if (!input || !input.trim()) {
      return;
    }
    const userId = input.trim();
    const userEmail = input.includes('@') ? input.trim() : '';
    if (!userId.includes('example.com') && !userId.includes('test@')) {
      localStorage.setItem(APP_CONFIG.storageKeys.userId, userId);
    }
    if (userEmail && !userEmail.includes('example.com') && !userEmail.includes('test@')) {
      localStorage.setItem(APP_CONFIG.storageKeys.userEmail, userEmail);
    }

    // Ensure Razorpay SDK is loaded
    await this.ensureRazorpaySdk();

    if (!window.Razorpay) {
      toast.show({
        title: 'Gateway Error',
        message: 'Could not load Razorpay payment SDK. Check your internet connection.',
        duration: 4000,
      });
      return;
    }

    const originalText = button.textContent;
    button.textContent = 'Connecting...';
    button.disabled = true;

    if (!APP_CONFIG.supabase.url) {
      await APP_CONFIG.loadEnv();
    }

    try {
      toast.show({
        title: 'Generating Order',
        message: `Securing price for ${planTitle} (${billingCycle})...`,
        duration: 2500,
      });

      // 1. Server-side order creation via centralized endpoint registry
      const orderResp = await fetch(`${APP_CONFIG.supabase.url}${APP_LINKS.edgeFunctionCreateOrder}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${APP_CONFIG.supabase.anonKey}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle,
          user_id: userId,
        }),
      });

      if (!orderResp.ok) {
        const errJson = await orderResp.json().catch(() => ({}));
        throw new Error(errJson.error || `Order generation failed (${orderResp.status})`);
      }

      const orderData = await orderResp.json();

      // 2. Open Razorpay Checkout modal with server-returned key_id
      const options = {
        key: orderData.key_id || APP_CONFIG.razorpay.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Time Chart',
        description: `${planTitle} (${billingCycle})`,
        order_id: orderData.order_id,
        prefill: {
          email: userEmail || '',
        },
        theme: {
          color: '#00F2FE',
        },
        handler: async (response) => {
          toast.show({
            title: 'Verifying Payment',
            message: 'Cryptographically validating transaction signature on server...',
            duration: 4000,
          });

          // 3. Zero-Trust Server Verification via centralized endpoint registry
          try {
            const verifyResp = await fetch(`${APP_CONFIG.supabase.url}${APP_LINKS.edgeFunctionVerifyPayment}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${APP_CONFIG.supabase.anonKey}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: userId,
              }),
            });

            const verifyData = await verifyResp.json();

            if (verifyData.verified) {
              const expDate = verifyData.expires_at ? new Date(verifyData.expires_at).toLocaleDateString() : '';
              toast.show({
                title: '🎉 Payment Successful!',
                message: `Unlocked ${planTitle}! Your ${verifyData.tier ? verifyData.tier.toUpperCase() : ''} access is active${expDate ? ` until ${expDate}` : ''}.`,
                duration: 8000,
              });
              if (verifyData.tier) {
                localStorage.setItem(APP_CONFIG.storageKeys.activeTier, verifyData.tier);
              }
            } else {
              toast.show({
                title: 'Verification Failed',
                message: verifyData.error || 'Payment signature mismatch. Please contact support.',
                duration: 6000,
              });
            }
          } catch (verErr) {
            console.error('Verify error:', verErr);
            toast.show({
              title: 'Verification Network Error',
              message: 'Payment received. Server webhook will auto-credit your tier within 1-2 minutes.',
              duration: 7000,
            });
          }
        },
        modal: {
          ondismiss: () => {
            button.textContent = originalText;
            button.disabled = false;
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (failResp) => {
        toast.show({
          title: 'Payment Failed',
          message: failResp.error?.description || 'Payment was not completed.',
          duration: 5000,
        });
        button.textContent = originalText;
        button.disabled = false;
      });

      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      toast.show({
        title: 'Checkout Error',
        message: err.message || 'Could not initiate payment session.',
        duration: 5000,
      });
      button.textContent = originalText;
      button.disabled = false;
    }
  }

  ensureRazorpaySdk() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = APP_LINKS.razorpaySdkScript;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
  }
}

export const pricingController = new PricingController();
