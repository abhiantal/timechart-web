/**
 * ==============================================================================
 * FILE: src/js/core/links.js
 * ARCHITECTURE: Centralized URLs, Endpoints & Navigation Registry (NextGen / Time Chart)
 * ==============================================================================
 *
 * PURPOSE:
 * Canonical registry for ALL web paths, store links, API endpoints, support emails,
 * and deep links used across the Time Chart web showcase and monetization portal.
 *
 * WHY A DEDICATED FILE?
 * 1. Single Source of Truth: Change a domain or endpoint once, updates everywhere.
 * 2. Cross-Platform Parity: Mirrored 1-to-1 with Flutter's `lib/core/constants/app_links.dart`.
 * 3. Security: All endpoints explicitly validate protocol (HTTPS) and eliminate hardcoded strings.
 * 4. Auditability: Each entry documents WHERE it is used and WHY it exists.
 * ==============================================================================
 */

export const APP_LINKS = {
  // ============================================================================
  // 1. PRIMARY DOMAINS & PLATFORMS
  // ============================================================================

  /**
   * [USED IN]: Universal link generation, metadata canonical tags, SEO open-graph tags.
   * [WHY]: Primary domain for the Time Chart web platform.
   */
  webDomain: 'timechart.com',

  /**
   * [USED IN]: Absolute URL builders and social share previews.
   * [WHY]: Standard secure web base URL.
   */
  webBaseUrl: 'https://timechart.com',

  /**
   * [USED IN]: Mobile landing redirects and QR code app installation banners.
   * [WHY]: Branded lightweight download portal for iOS and Android onboarding.
   */
  appDownloadUrl: 'https://timechart.app/download',

  /**
   * [USED IN]: Web-to-app deep linking headers and smart app banners.
   * [WHY]: Custom URI scheme registered by the Flutter mobile app.
   */
  appScheme: 'timechart://',

  // ============================================================================
  // 2. STORE LISTINGS & APP DISTRIBUTION
  // ============================================================================

  /**
   * [USED IN]: "Download for Android" CTA buttons in Navbar, Hero section, and Footer.
   * [WHY]: Direct routing to Google Play Store listing.
   */
  playStore: 'https://play.google.com/store/apps/details?id=com.timechart.app',

  /**
   * [USED IN]: "Download on iOS" CTA buttons in Navbar, Hero section, and Footer.
   * [WHY]: Direct routing to Apple App Store listing.
   */
  appStore: 'https://apps.apple.com/app/time-chart-habit-os/id000000000',

  // ============================================================================
  // 3. BACKEND APIS & SUPABASE EDGE FUNCTIONS
  // ============================================================================

  /**
   * [USED IN]: `src/js/components/pricing.js` (Razorpay order initialization).
   * [WHY]: Server-side Edge Function that validates client-requested tier, applies canonical
   * pricing, creates a Razorpay order securely, and returns the order_id and public key_id.
   */
  edgeFunctionCreateOrder: '/functions/v1/create-razorpay-order',

  /**
   * [USED IN]: `src/js/components/pricing.js` (Zero-trust signature verification).
   * [WHY]: Server-side Edge Function that validates HMAC-SHA256 signature, prevents replay attacks,
   * verifies payment directly against Razorpay API, and upgrades user profile via Service Role.
   */
  edgeFunctionVerifyPayment: '/functions/v1/verify-razorpay-payment',

  /**
   * [USED IN]: Dynamic script loader in `pricing.js` & `index.html`.
   * [WHY]: Official Razorpay web checkout SDK loaded over HTTPS with integrity.
   */
  razorpaySdkScript: 'https://checkout.razorpay.com/v1/checkout.js',

  // ============================================================================
  // 4. CONTACT & CUSTOMER SUPPORT
  // ============================================================================

  /**
   * [USED IN]: Footer support link, payment failure help modal, Terms & Privacy screens.
   * [WHY]: Official customer helpdesk for billing inquiries, account binding, and questions.
   */
  supportEmail: 'timechart011@gmail.com',

  /**
   * [USED IN]: "Developer Contact" in Footer and About section.
   * [WHY]: Direct engineering and partnership contact with the lead architect.
   */
  developerEmail: 'akantal011@gmail.com',

  /**
   * [USED IN]: Quick email launcher.
   * [WHY]: Returns formatted RFC 2368 mailto URI with optional pre-filled subject and body.
   */
  getMailtoUri: (email = 'timechart011@gmail.com', subject = '', body = '') => {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    if (body) params.append('body', body);
    const query = params.toString();
    return `mailto:${email}${query ? `?${query}` : ''}`;
  },

  // ============================================================================
  // 5. INTERNAL SPA TAB ROUTES
  // ============================================================================

  /**
   * [USED IN]: Navigation tabs, breadcrumbs, and in-page anchor transitions.
   * [WHY]: Maps directly to single-page navigation states without full page reloads.
   */
  tabs: {
    home: '#home',
    features: '#features',
    billing: '#billing',
    study: '#study',
    terms: '#terms',
  },

  // ============================================================================
  // 6. STUDY & COGNITIVE HABIT RESEARCH HUBS
  // ============================================================================

  /**
   * [USED IN]: Study hub cards, feature detail readouts, research bibliography.
   * [WHY]: Direct hash routes to deep-dive research papers on habit architecture.
   */
  studyPages: {
    jCurve: '#study/j-curve',
    atomicHabits: '#study/atomic-habits',
    research: '#study/research',
    kaizen: '#study/kaizen',
    flowState: '#study/flow-state',
    habitStacking: '#study/habit-stacking',
  },

  // ============================================================================
  // 7. STUDY & RESEARCH EDUCATIONAL YOUTUBE VIDEOS
  // ============================================================================

  /**
   * Educational YouTube keynotes and lectures embedded in the 5 Study Hub research papers.
   * Uses privacy-enhanced `youtube-nocookie.com` for embeds to prevent tracking cookies.
   */
  studyVideos: {
    /**
     * [USED IN]: `pages/Knowledge/kaizen.html` (Embed iframe & "Watch Full Video on YouTube" button).
     * [WHY]: Explains the Japanese philosophy of Kaizen (small, continuous 1% daily compounding improvement).
     */
    kaizen: {
      videoId: '0hbmz82wN9Q',
      title: 'Kaizen Philosophy and Continuous Improvement',
      embedUrl: 'https://www.youtube-nocookie.com/embed/0hbmz82wN9Q',
      watchUrl: 'https://www.youtube.com/watch?v=0hbmz82wN9Q',
    },

    /**
     * [USED IN]: `pages/Knowledge/j-curve.html` (Embed iframe & "Watch on YouTube" button).
     * [WHY]: Explains the J-Curve phenomenon and how to persevere through the initial dip before exponential habit growth.
     */
    jCurve: {
      videoId: 'F_fJ8Pky2k8',
      title: 'The J-Curve and Overcoming the Dip',
      embedUrl: 'https://www.youtube-nocookie.com/embed/F_fJ8Pky2k8',
      watchUrl: 'https://www.youtube.com/watch?v=F_fJ8Pky2k8',
    },

    /**
     * [USED IN]: `pages/Knowledge/atomic-habits.html` (Embed iframe & "Watch Full Lecture on YouTube" button).
     * [WHY]: Official keynote lecture by James Clear on the 4 Laws of Behavior Change (Make it Obvious, Attractive, Easy, Satisfying).
     */
    atomicHabits: {
      videoId: 'U_nzqnXWvSo',
      title: 'James Clear: Atomic Habits Keynote',
      embedUrl: 'https://www.youtube-nocookie.com/embed/U_nzqnXWvSo',
      watchUrl: 'https://www.youtube.com/watch?v=U_nzqnXWvSo',
    },

    /**
     * [USED IN]: `pages/Knowledge/flow-state.html` (Embed iframe & "Watch Full TED Talk on YouTube" button).
     * [WHY]: Renowned TED Talk by psychologist Mihaly Csikszentmihalyi exploring the psychology of optimal experience and flow state.
     */
    flowState: {
      videoId: 'fXIeFJCqsCE',
      title: 'Mihaly Csikszentmihalyi: Flow, the secret to happiness',
      embedUrl: 'https://www.youtube-nocookie.com/embed/fXIeFJCqsCE',
      watchUrl: 'https://www.youtube.com/watch?v=fXIeFJCqsCE',
    },

    /**
     * [USED IN]: `pages/Knowledge/habit-stacking.html` (Embed iframe & "Watch Full TEDx Talk on YouTube" button).
     * [WHY]: Stanford Behavioral Lab's BJ Fogg explaining Tiny Habits and stacking new routines onto existing behavioral anchors.
     */
    habitStacking: {
      videoId: 'AdKUJxjn-R8',
      title: 'BJ Fogg: Forget big change, start with a tiny habit',
      embedUrl: 'https://www.youtube-nocookie.com/embed/AdKUJxjn-R8',
      watchUrl: 'https://www.youtube.com/watch?v=AdKUJxjn-R8',
    },
  },

  /**
   * Helper to build a privacy-enhanced YouTube embed URL from any video ID.
   * [USED IN]: Dynamic video embed players.
   * [WHY]: Blocks third-party tracking cookies on client browsers.
   */
  getYouTubeEmbedUrl: (videoId) => `https://www.youtube-nocookie.com/embed/${videoId}`,

  /**
   * Helper to build a standard YouTube watch URL from any video ID.
   * [USED IN]: External redirect buttons ("Watch on YouTube").
   * [WHY]: Opens the video directly in the YouTube app or website.
   */
  getYouTubeWatchUrl: (videoId) => `https://www.youtube.com/watch?v=${videoId}`,
};

