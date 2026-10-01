/**
 * NextGen Core - Theme Engine
 * Seamless Light and Dark mode management with system sync and persistent state.
 */

import { APP_CONFIG } from './config.js';
import { appStorage } from './storage.js';

class ThemeEngine {
  constructor() {
    this.storageKey = APP_CONFIG.storageKeys.theme;
    this.currentTheme = APP_CONFIG.themes.DARK; // default futuristic dark
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  }

  /**
   * Determine initial theme based on storage or OS preference.
   */
  resolveInitialTheme() {
    const saved = appStorage.get(this.storageKey);
    if (saved === APP_CONFIG.themes.LIGHT || saved === APP_CONFIG.themes.DARK) {
      return saved;
    }
    // Check OS preference
    return this.mediaQuery.matches ? APP_CONFIG.themes.DARK : APP_CONFIG.themes.LIGHT;
  }

  /**
   * Apply theme attribute to root <html> element.
   */
  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;

    // Persist to storage
    appStorage.set(this.storageKey, theme);

    // Update all theme toggle elements
    this.updateToggleControls(theme);

    // Dispatch custom event for components
    window.dispatchEvent(new CustomEvent('nexgen:theme-change', {
      detail: { theme }
    }));
  }

  /**
   * Synchronize accessible labels and visual state on all toggle buttons.
   */
  updateToggleControls(theme) {
    const toggles = document.querySelectorAll('[data-theme-toggle]');
    toggles.forEach(btn => {
      const isDark = theme === APP_CONFIG.themes.DARK;
      btn.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
      btn.setAttribute('title', `Switch to ${isDark ? 'light' : 'dark'} mode`);
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    });
  }

  /**
   * Toggle between light and dark themes.
   */
  toggle() {
    const nextTheme = this.currentTheme === APP_CONFIG.themes.DARK
      ? APP_CONFIG.themes.LIGHT
      : APP_CONFIG.themes.DARK;
    this.applyTheme(nextTheme);
    return nextTheme;
  }

  /**
   * Get current active theme.
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Initialize theme listener and apply starting state.
   */
  init() {
    const initialTheme = this.resolveInitialTheme();
    this.applyTheme(initialTheme);

    // Listen for OS system theme changes if user hasn't explicitly set one in current session
    this.mediaQuery.addEventListener('change', (e) => {
      const saved = appStorage.get(this.storageKey);
      if (!saved) {
        this.applyTheme(e.matches ? APP_CONFIG.themes.DARK : APP_CONFIG.themes.LIGHT);
      }
    });

    // Attach click listeners to all theme toggles across the DOM
    document.addEventListener('click', (e) => {
      const toggleBtn = e.target.closest('[data-theme-toggle]');
      if (toggleBtn) {
        e.preventDefault();
        this.toggle();
      }
    });
  }
}

export const themeEngine = new ThemeEngine();
