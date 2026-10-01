/**
 * NextGen Core - Configuration & Environment Manager
 * Security Rule: Secrets & private keys must NEVER be hardcoded into client source files.
 * Public client environment values are dynamically loaded from .env or window.__ENV__.
 */

export const APP_CONFIG = {
  name: 'NextGen',
  version: '1.0.0',
  storageKeys: {
    theme: 'nexgen_theme_preference',
    userId: 'nexgen_user_id',
    userEmail: 'nexgen_user_email',
    activeTier: 'nexgen_active_tier',
  },
  supabase: {
    url: '',
    anonKey: '',
  },
  razorpay: {
    keyId: '', // Dynamically retrieved from secure server order generation
  },
  themes: {
    LIGHT: 'light',
    DARK: 'dark',
  },
  breakpoints: {
    mobile: 640,
    tablet: 900,
    desktop: 1240,
  },
  animation: {
    defaultThreshold: 0.15,
  },

  /**
   * Asynchronously loads environment variables without exposing secrets.
   */
  async loadEnv() {
    // 1. Check window.__ENV__ (injected by server / deployment environment)
    if (window.__ENV__ && window.__ENV__.VITE_SUPABASE_URL) {
      this.supabase.url = window.__ENV__.VITE_SUPABASE_URL;
      this.supabase.anonKey = window.__ENV__.VITE_SUPABASE_ANON_KEY || '';
      if (window.__ENV__.VITE_RAZORPAY_KEY_ID) {
        this.razorpay.keyId = window.__ENV__.VITE_RAZORPAY_KEY_ID;
      }
      return;
    }

    // 2. Fetch local .env file in development
    try {
      const response = await fetch('/.env');
      if (response.ok) {
        const text = await response.text();
        const lines = text.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const [key, ...rest] = trimmed.split('=');
          const value = rest.join('=').trim().replace(/^["']|["']$/g, '');
          if (key === 'VITE_SUPABASE_URL' || key === 'SUPABASE_URL') {
            this.supabase.url = value;
          } else if (key === 'VITE_SUPABASE_ANON_KEY' || key === 'SUPABASE_ANON_KEY') {
            this.supabase.anonKey = value;
          } else if (key === 'VITE_RAZORPAY_KEY_ID' || key === 'RAZORPAY_KEY_ID') {
            this.razorpay.keyId = value;
          }
        }
      }
    } catch (_) {
      // In production, values are supplied via window.__ENV__ or reverse proxy
    }
  }
};
