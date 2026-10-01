/**
 * NextGen Page Controller - Home
 * Manages phone mockup preview tab switching, APK download triggers, and email copy.
 * Uses event delegation for seamless dynamic page combining.
 */

import { $, $$ } from '../utils/dom.js';
import { toast } from '../components/toast.js';

// Helper for bulletproof clipboard copy with legacy/headless fallback
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // Fall through to textarea fallback
    }
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    return false;
  }
}

// Dual Navigation Model Data (Architecture & Feature Highlights)
const DUAL_NAV_CONFIG = {
  personal: {
    name: 'Personal Growth OS',
    badge: 'Sanctuary Mode • 100% Private & Focus',
    themeColor: '#00ACC1',
    accentColor: '#5E35B1',
    features: [
      {
        title: 'Cognitive Isolation',
        bullet: '100% distraction-free execution environment without ads or algorithmic dopamine feeds.',
        bulletColor: '#00ACC1'
      },
      {
        title: 'Tactile Haptic Morphing',
        bullet: 'Long-press or double-tap the center glyph to transition to Social Feed with physical haptic confirmation.',
        bulletColor: '#5E35B1'
      },
      {
        title: 'Chromatic Harmony',
        bullet: 'Curved dock dynamically harmonizes its elevated radiant halo to match each active subsystem domain.',
        bulletColor: '#FB8C00'
      }
    ],
    tabs: [
      {
        idx: 0,
        name: 'Analytics Hub',
        screen: 'DashboardSidebar',
        color: '#00ACC1',
        iconSvg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
        desc: 'Deep cognitive analytics, habit velocity radar charts, and focus streak heatmaps.',
        role: 'Side drawer & core telemetry overview'
      },
      {
        idx: 1,
        name: 'Task Engine',
        screen: 'TasksSidebar',
        color: '#5E35B1',
        iconSvg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
        desc: 'Atomic micro-scheduling with day & weekly milestone execution and multiplier points.',
        role: 'Execution sprint management'
      },
      {
        idx: 2,
        name: 'Mode Switcher',
        screen: 'BucketListScreen',
        color: '#FB8C00',
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>',
        desc: 'Focus Vault & Bucket Goals. Double-tap or long-press to trigger heavy haptic switch to Social Nav!',
        role: 'Center elevated glyph • Instant OS Morph',
        isCenter: true
      },
      {
        idx: 3,
        name: 'Battle Arena',
        screen: 'CompetitionOverviewScreen',
        color: '#FDD835',
        iconSvg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
        desc: 'Live habit tournaments, anti-burnout penalties, and cohort leaderboards.',
        role: 'Ranked gamified competition'
      },
      {
        idx: 4,
        name: 'Dashboard Home',
        screen: 'DashboardHomeScreen',
        color: '#1E88E5',
        iconSvg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m16 12-4-4-4 4"></path><path d="M12 16V8"></path></svg>',
        desc: 'Consolidated cognitive briefing, streak scores, Nova AI recommendations, and 3D Solar habit orbits.',
        role: 'Central operational cockpit'
      }
    ]
  },
  social: {
    name: 'Social Feed OS',
    badge: 'Accountability Mode • Community Proof & Channels',
    themeColor: '#E91E63',
    accentColor: '#00BFA5',
    features: [
      {
        title: 'Proof-of-Discipline Network',
        bullet: 'Community feeds celebrating verified habit streak completions, eliminating vanity doomscrolling.',
        bulletColor: '#E91E63'
      },
      {
        title: 'Task-Connected Channels',
        bullet: '1-on-1 messaging & group study channels with live schedule sharing and AI summaries.',
        bulletColor: '#00BFA5'
      },
      {
        title: 'Zero Latency Sanctuary Return',
        bullet: 'Double-tap or long-press the center glyph to instantly flip back to Personal Growth OS without delay.',
        bulletColor: '#7C4DFF'
      }
    ],
    tabs: [
      {
        idx: 0,
        name: 'Milestone Feed',
        screen: 'FeedScreen',
        color: '#E91E63',
        iconSvg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
        desc: 'Distraction-free community feed celebrating verified completed habits, streaks, and proof-of-work.',
        role: 'Social validation & peer inspiration'
      },
      {
        idx: 1,
        name: 'Live Alerts',
        screen: 'NotificationsScreen',
        color: '#00BFA5',
        iconSvg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
        desc: 'Real-time habit cheers, sprint challenge invitations, mentor nudges, and system alerts.',
        role: 'Direct push notifications & activity log'
      },
      {
        idx: 2,
        name: 'Post Studio',
        screen: 'CreatePostScreen',
        color: '#FF5252',
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>',
        desc: 'Media creation studio to publish verified habit streaks. Double-tap or long-press to switch back to Personal Growth OS!',
        role: 'Center elevated glyph • Instant OS Morph',
        isCenter: true
      },
      {
        idx: 3,
        name: 'Chat Hub',
        screen: 'ChatHubScreen',
        color: '#7C4DFF',
        iconSvg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
        desc: '1-on-1 chats and study channels with direct task-sharing & Nova AI conversation summaries.',
        role: 'Task-integrated messaging'
      },
      {
        idx: 4,
        name: 'User Profile',
        screen: 'UserProfileScreen',
        color: '#448AFF',
        iconSvg: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        desc: 'Public discipline portfolio, trophies unlocked, habit velocity badge, and social followers.',
        role: 'Identity & reputation showcase'
      }
    ]
  }
};

class HomeController {
  constructor() {
    this.isInitialized = false;
    this.currentNavMode = 'personal';
    this.currentNavIndex = 0;
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 1. Interactive Phone Mockup Tab Switcher (Flagship Showcase)
    document.addEventListener('click', (e) => {
      const tabBtn = e.target.closest('[data-preview-target]');
      if (!tabBtn) return;

      e.preventDefault();
      const targetViewId = tabBtn.getAttribute('data-preview-target');
      this.switchMockupView(targetViewId, tabBtn);
    });

    // 1b. App Demo Video — Play / Pause toggle
    this.initDemoVideo();

    // 1c. Brand & Showcase Videos — Autoplay & Loop
    this.initShowcaseVideos();

    // 2. APK Download Buttons Toast Feedback
    document.addEventListener('click', (e) => {
      const downloadBtn = e.target.closest('#hero-apk-download-btn, #direct-apk-download-btn, .home-download-btn');
      if (!downloadBtn) return;

      toast.show({
        title: '📥 Downloading Time Chart APK',
        message: 'v1.0.0 package download initiated! Open your Downloads folder and tap time-chart.apk to install.',
        duration: 5000
      });
    });

    // 3. 1-Click Email Copy Handlers
    document.addEventListener('click', async (e) => {
      const copyTile = e.target.closest('[data-copy-email], [data-copy]');
      if (!copyTile) return;

      e.preventDefault();
      const email = copyTile.getAttribute('data-copy-email') || copyTile.getAttribute('data-copy');
      if (!email) return;

      await copyText(email);

      // Visual badge feedback on tile
      const badge = copyTile.querySelector('.contact-copy-badge span');
      const originalText = badge ? badge.textContent : 'COPY';
      if (badge) badge.textContent = 'COPIED!';

      toast.show({
        title: '📋 Copied to Clipboard',
        message: email,
        duration: 3000
      });

      setTimeout(() => {
        if (badge) badge.textContent = originalText;
      }, 2200);
    });

    // 4. Double Bottom Navigation Mode Switching (Personal vs Social)
    document.addEventListener('click', (e) => {
      const modeBtn = e.target.closest('[data-nav-mode]');
      if (modeBtn) {
        e.preventDefault();
        const mode = modeBtn.getAttribute('data-nav-mode');
        this.setDualNavMode(mode, true);
        return;
      }

      // Haptic Switch Trigger Button
      const hapticBtn = e.target.closest('[data-nav-haptic-trigger]');
      if (hapticBtn) {
        e.preventDefault();
        const nextMode = this.currentNavMode === 'personal' ? 'social' : 'personal';
        this.triggerHapticImpulse();
        this.setDualNavMode(nextMode, true);
        return;
      }

      // Curved Nav Tab Clicked
      const navTabBtn = e.target.closest('[data-nav-tab-idx]');
      if (navTabBtn) {
        e.preventDefault();
        const idx = parseInt(navTabBtn.getAttribute('data-nav-tab-idx'), 10);
        // If center button clicked while already on center, toggle mode (like in Flutter)
        if (idx === 2 && this.currentNavIndex === 2) {
          const nextMode = this.currentNavMode === 'personal' ? 'social' : 'personal';
          this.triggerHapticImpulse();
          this.setDualNavMode(nextMode, true);
        } else {
          this.selectDualNavTab(idx);
        }
      }
    });

    // Initialize initial state of Dual Navigation simulator
    this.renderDualNavState();

    // Re-align on window resize
    window.addEventListener('resize', () => {
      this.renderDualNavState();
    });
  }

  triggerHapticImpulse() {
    if (navigator.vibrate) {
      try { navigator.vibrate(60); } catch (e) { /* ignore */ }
    }
    const mock = $('#curved-nav-device-mock');
    if (mock) {
      mock.classList.remove('haptic-pulse-active');
      void mock.offsetWidth; // Force reflow
      mock.classList.add('haptic-pulse-active');
    }
  }

  setDualNavMode(mode, showFeedback = false) {
    if (!DUAL_NAV_CONFIG[mode]) return;
    this.currentNavMode = mode;
    this.currentNavIndex = 0; // Reset to 1st tab of that mode

    const rootConsole = $('#dual-nav-console');
    if (rootConsole) {
      rootConsole.setAttribute('data-active-nav-mode', mode);
    }

    // Update Mode Buttons
    $$('[data-nav-mode]').forEach(btn => {
      if (btn.getAttribute('data-nav-mode') === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderDualNavState();

    if (showFeedback) {
      const modeData = DUAL_NAV_CONFIG[mode];
      toast.show({
        title: `📳 Haptic Switch: ${modeData.name}`,
        message: `Switched via HapticFeedback to ${modeData.name}`,
        duration: 3500
      });
    }
  }

  selectDualNavTab(index) {
    const config = DUAL_NAV_CONFIG[this.currentNavMode];
    if (index < 0 || index >= config.tabs.length) return;
    this.currentNavIndex = index;
    this.renderDualNavState();
  }

  renderDualNavState() {
    const config = DUAL_NAV_CONFIG[this.currentNavMode];
    const activeTab = config.tabs[this.currentNavIndex];
    if (!activeTab) return;

    // 1. Move Floating Indicator Bubble
    // 1. Update Tab Buttons Icons & Labels
    const track = $('#curved-nav-track');
    if (track) {
      track.innerHTML = config.tabs.map(tab => {
        const isActive = tab.idx === this.currentNavIndex;
        return `
          <button type="button" class="curved-nav-tab-btn ${isActive ? 'active' : ''}" data-nav-tab-idx="${tab.idx}" title="${tab.name}">
            <div class="curved-nav-tab-icon" style="color: ${isActive ? '#FFFFFF' : (tab.isCenter ? tab.color : '#94A3B8')};">
              ${tab.iconSvg}
            </div>
            <span class="curved-nav-tab-label">${tab.name}</span>
          </button>
        `;
      }).join('');
    }

    // 2. Move Floating Indicator Bubble with Dead-Center Alignment
    const indicator = $('#curved-nav-indicator');
    const bubble = $('#curved-nav-indicator-bubble');
    const wrapper = $('#curved-nav-bar-wrapper') || (indicator && indicator.parentElement);
    if (indicator && bubble) {
      const activeBtn = track ? track.querySelectorAll('.curved-nav-tab-btn')[this.currentNavIndex] : null;
      if (activeBtn) {
        // Use getBoundingClientRect for pixel-perfect sub-pixel calculation
        const btnRect = activeBtn.getBoundingClientRect();
        const wrapperRect = (wrapper || indicator.parentElement).getBoundingClientRect();
        const btnCenterRelative = (btnRect.left + btnRect.width / 2) - wrapperRect.left;
        const indicatorHalfW = (indicator.offsetWidth || 52) / 2;
        indicator.style.transform = `translateX(${btnCenterRelative - indicatorHalfW}px)`;
      } else {
        // Fallback: uniform distribution
        const slotW = (track ? track.offsetWidth : 0) / 5;
        indicator.style.transform = `translateX(${this.currentNavIndex * slotW + slotW / 2 - (indicator.offsetWidth || 52) / 2}px)`;
      }
      bubble.style.backgroundColor = activeTab.color;
      bubble.style.boxShadow = `0 8px 25px ${activeTab.color}88, inset 0 2px 4px rgba(255,255,255,0.4)`;
    }

    // 3. Update Preview Screen Content
    const previewTag = $('#curved-nav-screen-tag');
    const previewTitle = $('#curved-nav-screen-title');
    const previewDesc = $('#curved-nav-screen-desc');
    const previewRoute = $('#curved-nav-screen-route');
    const previewColorChip = $('#curved-nav-color-chip');
    const previewScreenBox = $('#curved-nav-screen-preview');

    if (previewTag) previewTag.textContent = `${config.name} • TAB 0${activeTab.idx + 1}`;
    if (previewTitle) {
      previewTitle.innerHTML = `
        <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${activeTab.color}; box-shadow:0 0 10px ${activeTab.color};"></span>
        <span>${activeTab.name}</span>
      `;
    }
    if (previewDesc) previewDesc.textContent = activeTab.desc;
    if (previewRoute) previewRoute.textContent = `${config.name} ➔ ${activeTab.role}`;
    if (previewColorChip) {
      previewColorChip.textContent = activeTab.color;
      previewColorChip.style.color = activeTab.color;
    }
    if (previewScreenBox) {
      previewScreenBox.style.boxShadow = `0 10px 30px ${activeTab.color}15`;
    }

    // 4. Update Inspector Panel Title & Features
    const inspectorTitle = $('#dual-nav-inspector-title');
    if (inspectorTitle) {
      inspectorTitle.textContent = config.name;
    }
    const featuresList = $('#dual-nav-features-list');
    if (featuresList && config.features) {
      featuresList.innerHTML = config.features.map(f => `
        <div class="inspector-feature-item">
          <span class="feature-bullet" style="color: ${f.bulletColor};">✦</span>
          <div>
            <strong>${f.title}:</strong> ${f.bullet}
          </div>
        </div>
      `).join('');
    }
  }

  switchMockupView(viewId, activeBtn) {
    const allTabs = $$('[data-preview-target]');
    allTabs.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');

    const allViews = $$('.phone-screen-view');
    allViews.forEach(view => view.classList.remove('active'));

    const targetView = $(`#view-${viewId}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Update mini nav in phone mockup if present
    const miniNavTabs = $$('.phone-mini-nav-btn');
    if (miniNavTabs.length > 0) {
      miniNavTabs.forEach(tab => tab.classList.remove('active'));
      const targetMap = { tasks: 1, solar: 4, ai: 2, battles: 3 };
      const targetIdx = targetMap[viewId] !== undefined ? targetMap[viewId] : 0;
      if (miniNavTabs[targetIdx]) {
        miniNavTabs[targetIdx].classList.add('active');
      }
    }
  }

  initDemoVideo() {
    const video = document.getElementById('app-demo-video');
    const playBtn = document.getElementById('app-demo-play-btn');
    if (!video || !playBtn) return;

    const iconPlay = playBtn.querySelector('.vid-icon-play');
    const iconPause = playBtn.querySelector('.vid-icon-pause');

    const syncIcons = () => {
      if (video.paused) {
        if (iconPlay) iconPlay.style.display = '';
        if (iconPause) iconPause.style.display = 'none';
      } else {
        if (iconPlay) iconPlay.style.display = 'none';
        if (iconPause) iconPause.style.display = '';
      }
    };

    // Toggle on button click
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.paused ? video.play() : video.pause();
      syncIcons();
    });

    // Toggle on card click (excluding buttons/links)
    const card = document.getElementById('app-demo-video-wrap');
    if (card) {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('a')) return;
        video.paused ? video.play() : video.pause();
        syncIcons();
      });
    }

    video.addEventListener('play', syncIcons);
    video.addEventListener('pause', syncIcons);

    // Auto-pause when scrolled out of view, resume when back
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            video.pause();
          } else if (video.paused) {
            video.play().catch(() => {});
          }
          syncIcons();
        });
      }, { threshold: 0.25 });
      observer.observe(video);
    }
  }

  initShowcaseVideos() {
    const showcaseVideos = document.querySelectorAll('.home-video-showcase-card video');
    showcaseVideos.forEach(vid => {
      vid.muted = true;
      vid.playsInline = true;
      vid.loop = true;
      vid.setAttribute('autoplay', '');
      vid.setAttribute('muted', '');
      vid.setAttribute('playsinline', '');
      vid.setAttribute('loop', '');
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    });
  }
}

export const homeController = new HomeController();


