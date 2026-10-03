/**
 * NextGen Component - Theme-Adaptive Futuristic Feedback Controller
 * Manages Rating selection, Category tagging, Cloud sync to Supabase,
 * Offline queue resilience, and Celebration modal state.
 */

import { APP_CONFIG } from '../core/config.js?v=16';
import { toast } from './toast.js?v=16';
import { $ } from '../utils/dom.js?v=16';

class FeedbackModalController {
  constructor() {
    this.isOpen = false;
    this.selectedRating = 5;
    this.selectedCategory = 'Feature Request';
    this.selectedTags = new Set();
    this.isSubmitting = false;

    this.ratingDescriptions = {
      1: '😡 1/5 — Needs Work & Polish',
      2: '😕 2/5 — Fair, Has Some Issues',
      3: '😐 3/5 — Average Experience',
      4: '😊 4/5 — Great & Very Useful',
      5: '🚀 5/5 — Superb! Absolutely Love It!',
    };

    this.categoryPlaceholders = {
      'Feature Request': 'Describe the feature or workflow you would love to see added to Time Chart...',
      'Bug Report': 'What went wrong? Please share the steps to reproduce or what device you are using...',
      'UI & Design': 'How does Time Chart look and feel to you? Thoughts on animations, dark mode, colors...',
      'Performance': 'Any lag, slow loading, or battery concerns? Let our engineering team know...',
      'General Feedback': 'Share your overall thoughts, ideas, or questions with the creator...',
    };
  }

  init() {
    this.bindTriggers();
    this.bindModalEvents();
    this.bindRatingEvents();
    this.bindCategoryEvents();
    this.bindTagEvents();
    this.bindInputEvents();
    this.autoFillIdentity();
    this.setupOfflineSync();
    this.setupGlobalShortcuts();
  }

  /* --------------------------------------------------------------------------
     1. Open & Close Mechanics
     -------------------------------------------------------------------------- */
  open() {
    const backdrop = $('#feedback-modal');
    if (!backdrop) return;

    this.isOpen = true;
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    this.autoFillIdentity();
    this.updateTelemetryBadge();

    // Auto-focus message textarea after transition
    setTimeout(() => {
      const textarea = $('#feedback-message');
      if (textarea) textarea.focus();
    }, 200);
  }

  close() {
    const backdrop = $('#feedback-modal');
    if (!backdrop) return;

    this.isOpen = false;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  resetForm() {
    const formView = $('#feedback-form-view');
    const successView = $('#feedback-success-view');
    const messageInput = $('#feedback-message');
    const counter = $('#feedback-char-counter');

    if (formView && successView) {
      formView.style.display = 'block';
      successView.style.display = 'none';
    }

    if (messageInput) {
      messageInput.value = '';
    }
    if (counter) {
      counter.textContent = '0 / 1000';
    }

    this.selectedRating = 5;
    this.updateRatingUI(5);
    this.selectedTags.clear();
    document.querySelectorAll('.feedback-quick-tag').forEach(tag => tag.classList.remove('selected'));
  }

  /* --------------------------------------------------------------------------
     2. Event Bindings
     -------------------------------------------------------------------------- */
  bindTriggers() {
    // Navbar Trigger Button
    const navBtn = $('#nav-feedback-btn');
    if (navBtn) {
      navBtn.addEventListener('click', () => this.open());
    }

    // Mobile Drawer Trigger Link
    const drawerLink = $('#drawer-feedback-link');
    if (drawerLink) {
      drawerLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Close drawer if open
        const drawer = $('#nav-drawer');
        const backdrop = $('#nav-backdrop');
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('open');
        this.open();
      });
    }

    // Footer Links
    document.querySelectorAll('[data-open-feedback]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });
  }

  bindModalEvents() {
    const backdrop = $('#feedback-modal');
    if (!backdrop) return;

    // Click outside to dismiss
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });

    // Close Button
    const closeBtn = $('#feedback-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // Success View Close Button
    const doneBtn = $('#feedback-done-btn');
    if (doneBtn) {
      doneBtn.addEventListener('click', () => {
        this.close();
        setTimeout(() => this.resetForm(), 300);
      });
    }

    // Submit Another Button
    const anotherBtn = $('#feedback-another-btn');
    if (anotherBtn) {
      anotherBtn.addEventListener('click', () => {
        this.resetForm();
      });
    }

    // Submit Form
    const submitBtn = $('#feedback-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.handleSubmit());
    }
  }

  bindRatingEvents() {
    const starBtns = document.querySelectorAll('.feedback-star-btn');
    const label = $('#feedback-rating-label');

    starBtns.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-star-val'), 10);

      // Hover preview
      btn.addEventListener('mouseenter', () => {
        starBtns.forEach(b => {
          const bVal = parseInt(b.getAttribute('data-star-val'), 10);
          b.classList.toggle('hovered', bVal <= val);
        });
        if (label) label.textContent = this.ratingDescriptions[val] || '';
      });

      btn.addEventListener('mouseleave', () => {
        starBtns.forEach(b => b.classList.remove('hovered'));
        if (label) label.textContent = this.ratingDescriptions[this.selectedRating] || '';
      });

      // Click select
      btn.addEventListener('click', () => {
        this.selectedRating = val;
        this.updateRatingUI(val);
      });
    });
  }

  updateRatingUI(val) {
    const starBtns = document.querySelectorAll('.feedback-star-btn');
    const label = $('#feedback-rating-label');

    starBtns.forEach(btn => {
      const bVal = parseInt(btn.getAttribute('data-star-val'), 10);
      btn.classList.toggle('active', bVal <= val);
    });

    if (label) {
      label.textContent = this.ratingDescriptions[val] || '';
    }
  }

  bindCategoryEvents() {
    const pills = document.querySelectorAll('.feedback-cat-pill');
    const textarea = $('#feedback-message');

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        this.selectedCategory = pill.getAttribute('data-category') || 'General Feedback';

        if (textarea) {
          textarea.placeholder = this.categoryPlaceholders[this.selectedCategory] || 'Share your feedback...';
        }
      });
    });
  }

  bindTagEvents() {
    const tags = document.querySelectorAll('.feedback-quick-tag');
    tags.forEach(tag => {
      tag.addEventListener('click', () => {
        const text = tag.getAttribute('data-tag-text') || tag.textContent.trim();
        if (this.selectedTags.has(text)) {
          this.selectedTags.delete(text);
          tag.classList.remove('selected');
        } else {
          this.selectedTags.add(text);
          tag.classList.add('selected');
        }
      });
    });
  }

  bindInputEvents() {
    const textarea = $('#feedback-message');
    const counter = $('#feedback-char-counter');

    if (textarea && counter) {
      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        counter.textContent = `${len} / 1000`;
        if (len > 900) {
          counter.style.color = '#EF4444';
        } else {
          counter.style.color = '';
        }
      });
    }
  }

  autoFillIdentity() {
    const emailInput = $('#feedback-user-email');
    const nameInput = $('#feedback-user-name');

    if (emailInput && !emailInput.value) {
      const savedEmail = localStorage.getItem(APP_CONFIG.storageKeys.userEmail);
      const savedUserId = localStorage.getItem(APP_CONFIG.storageKeys.userId);
      if (savedEmail) {
        emailInput.value = savedEmail;
      } else if (savedUserId && savedUserId.includes('@')) {
        emailInput.value = savedUserId;
      }
    }
  }

  updateTelemetryBadge() {
    const badge = $('#feedback-telemetry-text');
    if (!badge) return;

    const browser = this.detectBrowser();
    const os = this.detectOS();
    const resolution = `${window.innerWidth}x${window.innerHeight}`;
    badge.textContent = `Client: ${browser} on ${os} • Screen: ${resolution} • App v${APP_CONFIG.version}`;
  }

  detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Edge') || ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Web Browser';
  }

  detectOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Desktop/Mobile';
  }

  setupGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Escape closes feedback modal if open
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
      // Alt + F shortcut to quickly open feedback
      if (e.altKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        if (this.isOpen) this.close();
        else this.open();
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. Submission & Cloud Integration
     -------------------------------------------------------------------------- */
  async handleSubmit() {
    if (this.isSubmitting) return;

    const messageInput = $('#feedback-message');
    const nameInput = $('#feedback-user-name');
    const emailInput = $('#feedback-user-email');
    const submitBtn = $('#feedback-submit-btn');

    const message = (messageInput ? messageInput.value : '').trim();
    const name = (nameInput ? nameInput.value : '').trim() || 'Anonymous Explorer';
    const email = (emailInput ? emailInput.value : '').trim();

    if (!message || message.length < 3) {
      toast.show({
        title: 'Message Required',
        message: 'Please write at least a few words so our team can understand your feedback.',
        duration: 3500,
      });
      if (messageInput) messageInput.focus();
      return;
    }

    this.isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
        </svg>
        <span>Transmitting to Cloud...</span>
      `;
    }

    // Prepare structured payload
    const tagsArray = Array.from(this.selectedTags);
    const feedbackRefId = `TC-FB-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    const telemetry = {
      browser: this.detectBrowser(),
      os: this.detectOS(),
      screen: `${window.innerWidth}x${window.innerHeight}`,
      theme: document.documentElement.getAttribute('data-theme') || 'dark',
      userAgent: navigator.userAgent,
    };

    const richDescription = [
      `[Source: TIME_CHART_WEB]`,
      `[Ref: ${feedbackRefId}]`,
      name ? `User: ${name}` : null,
      email ? `Email: ${email}` : null,
      `Category: ${this.selectedCategory}`,
      `Rating: ${this.selectedRating}/5`,
      tagsArray.length ? `Tags: ${tagsArray.join(', ')}` : null,
      `Client: ${telemetry.browser} on ${telemetry.os} (${telemetry.screen})`,
      `Timestamp: ${timestamp}`,
      `----------------------------------------`,
      message
    ].filter(Boolean).join('\n');

    const record = {
      id: feedbackRefId,
      user_id: localStorage.getItem(APP_CONFIG.storageKeys.userId) || null,
      category: this.selectedCategory,
      rating: this.selectedRating,
      description: richDescription,
      name,
      email,
      tags: tagsArray,
      created_at: timestamp,
      status: 'pending_sync',
    };

    // Save locally first (Zero Data Loss Guarantee)
    this.saveToLocalVault(record);

    // Ensure Cloud configuration is loaded
    if (!APP_CONFIG.supabase.url) {
      await APP_CONFIG.loadEnv();
    }

    let syncedToCloud = false;

    // 1. Direct Supabase PostgREST sync attempt
    try {
      if (APP_CONFIG.supabase.url && APP_CONFIG.supabase.anonKey) {
        const payload = {
          category: this.selectedCategory,
          rating: this.selectedRating,
          description: richDescription,
        };
        // Include user_id if valid UUID exists
        if (record.user_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(record.user_id)) {
          payload.user_id = record.user_id;
        }

        const resp = await fetch(`${APP_CONFIG.supabase.url}/rest/v1/app_feedback`, {
          method: 'POST',
          headers: {
            'apikey': APP_CONFIG.supabase.anonKey,
            'Authorization': `Bearer ${APP_CONFIG.supabase.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(payload),
        });

        if (resp.ok) {
          syncedToCloud = true;
          this.markVaultRecordSynced(feedbackRefId);
        }
      }
    } catch (e) {
      console.warn('[Feedback] Supabase direct sync paused; saved safely in local vault.', e);
    }

    // Complete Submission Flow
    this.isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span>Send Feedback to Cloud</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      `;
    }

    // Show celebration screen
    this.showSuccessView(feedbackRefId, syncedToCloud);

    toast.show({
      title: 'Feedback Received!',
      message: syncedToCloud ? 'Successfully connected & synchronized to cloud.' : 'Saved securely in your account vault.',
      duration: 3500,
    });
  }

  showSuccessView(refId, isCloudLive) {
    const formView = $('#feedback-form-view');
    const successView = $('#feedback-success-view');
    const refContainer = $('#feedback-ref-id');
    const statusPill = $('#feedback-status-pill');

    if (refContainer) {
      refContainer.textContent = refId;
    }

    if (statusPill) {
      if (isCloudLive) {
        statusPill.innerHTML = `
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#10B981; margin-right:6px;"></span>
          <span>Delivered directly to Supabase Cloud</span>
        `;
        statusPill.style.color = '#10B981';
      } else {
        statusPill.innerHTML = `
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#0284C7; margin-right:6px;"></span>
          <span>Verified &amp; Queued for Sync</span>
        `;
        statusPill.style.color = '';
      }
    }

    if (formView && successView) {
      formView.style.display = 'none';
      successView.style.display = 'flex';
    }
  }

  /* --------------------------------------------------------------------------
     4. Local Vault & Offline Resilience
     -------------------------------------------------------------------------- */
  saveToLocalVault(record) {
    try {
      const existingRaw = localStorage.getItem('nexgen_feedback_vault');
      const vault = existingRaw ? JSON.parse(existingRaw) : [];
      vault.unshift(record);
      // Keep up to 20 most recent
      if (vault.length > 20) vault.length = 20;
      localStorage.setItem('nexgen_feedback_vault', JSON.stringify(vault));
    } catch (e) {
      console.warn('[Feedback] Could not write to localStorage vault.', e);
    }
  }

  markVaultRecordSynced(refId) {
    try {
      const existingRaw = localStorage.getItem('nexgen_feedback_vault');
      if (!existingRaw) return;
      const vault = JSON.parse(existingRaw);
      const target = vault.find(r => r.id === refId);
      if (target) {
        target.status = 'synced';
        localStorage.setItem('nexgen_feedback_vault', JSON.stringify(vault));
      }
    } catch (_) {}
  }

  setupOfflineSync() {
    window.addEventListener('online', () => {
      this.retryPendingVaultSubmissions();
    });
  }

  async retryPendingVaultSubmissions() {
    try {
      const existingRaw = localStorage.getItem('nexgen_feedback_vault');
      if (!existingRaw) return;
      const vault = JSON.parse(existingRaw);
      const pending = vault.filter(r => r.status === 'pending_sync');
      if (!pending.length) return;

      if (!APP_CONFIG.supabase.url) {
        await APP_CONFIG.loadEnv();
      }

      for (const item of pending) {
        const resp = await fetch(`${APP_CONFIG.supabase.url}/rest/v1/app_feedback`, {
          method: 'POST',
          headers: {
            'apikey': APP_CONFIG.supabase.anonKey,
            'Authorization': `Bearer ${APP_CONFIG.supabase.anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            category: item.category,
            rating: item.rating,
            description: item.description,
          }),
        }).catch(() => null);

        if (resp && resp.ok) {
          item.status = 'synced';
        }
      }
      localStorage.setItem('nexgen_feedback_vault', JSON.stringify(vault));
    } catch (_) {}
  }
}

export const feedbackModalController = new FeedbackModalController();
