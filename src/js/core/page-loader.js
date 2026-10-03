/**
 * NextGen Core - Page Loader & Combiner
 * Dynamically fetches and mounts dedicated page files into index.html shell.
 */

import { $ } from '../utils/dom.js';
import { scrollReveal } from '../utils/animation.js';
import { pricingController } from '../components/pricing.js';
import { homeController } from '../pages/home.js';
import { PAGE_PATHS, PAGE_TITLES } from '../pages/registry.js?v=15';

class PageLoader {
  constructor() {
    this.mountTarget = null;
    this.pageCache = new Map();
    this.currentPage = null;
  }

  init() {
    this.mountTarget = $('#page-mount');
    if (this.mountTarget && this.mountTarget.children.length > 0) {
      this.pageCache.set('home', this.mountTarget.innerHTML);
      this.currentPage = 'home';
    }
  }

  async load(rawPageName) {
    if (!this.mountTarget) this.init();
    if (!this.mountTarget) return;

    // Normalize study aliases to knowledge
    let pageName = (rawPageName || 'home').replace(/^#\/?/, '').trim();
    if (pageName === 'study') pageName = 'knowledge';
    if (pageName.startsWith('study/')) pageName = pageName.replace('study/', 'knowledge/');

    // 1. If already on this page and content is rendered, avoid redundant work
    if (this.currentPage === pageName && this.mountTarget.children.length > 0) {
      return;
    }

    // 2. Instant cache check (0ms layout shift)
    if (this.pageCache.has(pageName)) {
      this.render(pageName, this.pageCache.get(pageName));
      return;
    }

    const relPath = PAGE_PATHS[pageName] || (pageName.startsWith('features/') ? `./pages/modules/${pageName.replace('features/', '')}.html` : `./pages/main/${pageName}.html`);
    const cleanRel = relPath.replace(/^\.\//, '');

    // Resolve robust base URL using import.meta.url (guaranteed to point to project root)
    let baseUrl;
    try {
      baseUrl = new URL('../../../', import.meta.url).href;
    } catch {
      baseUrl = window.location.origin + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    }
    const resolvedUrl = new URL(cleanRel, baseUrl).href;

    // 3. Fetch clean page template with fallback for cleanUrl servers
    try {
      const cacheBust = `v=${Date.now()}`;
      const primaryUrl = resolvedUrl.includes('?') ? `${resolvedUrl}&${cacheBust}` : `${resolvedUrl}?${cacheBust}`;
      let response = await fetch(primaryUrl, { cache: 'no-cache' });
      
      // Fallback 1: Try relative path directly if absolute failed
      if (!response.ok) {
        const fallbackUrl = relPath.includes('?') ? `${relPath}&${cacheBust}` : `${relPath}?${cacheBust}`;
        const altResponse = await fetch(fallbackUrl, { cache: 'no-cache' });
        if (altResponse.ok) {
          response = altResponse;
        }
      }

      // Fallback 2: Try without .html if static server enforces clean URLs
      if (!response.ok && cleanRel.endsWith('.html')) {
        const cleanPath = cleanRel.replace(/\.html$/, '');
        const cleanUrl = new URL(cleanPath, baseUrl).href;
        const altResponse = await fetch(`${cleanUrl}?${cacheBust}`, { cache: 'no-cache' });
        if (altResponse.ok) {
          response = altResponse;
        }
      }

      if (!response.ok) {
        throw new Error(`Failed to load ${resolvedUrl} (${response.status})`);
      }
      const html = await response.text();
      this.pageCache.set(pageName, html);
      this.render(pageName, html);
    } catch (err) {
      console.error(`[PageLoader] Error loading page "${pageName}":`, err);
      this.mountTarget.innerHTML = `
        <div class="container section text-center">
          <div class="card glass-panel-elevated p-xl" style="max-width: 600px; margin: 0 auto;">
            <div class="badge badge-rose mb-sm">Page Load Notice</div>
            <h3 class="card-title">Unable to Load Page</h3>
            <p class="card-desc mb-md">
              Could not fetch <code>${resolvedUrl}</code>. If running locally, please ensure you are viewing through a local server (e.g., Live Server at <code>http://127.0.0.1:5500/</code>).
            </p>
          </div>
        </div>
      `;
    }
  }

  render(pageName, html) {
    this.currentPage = pageName;
    this.mountTarget.style.opacity = '0';
    this.mountTarget.innerHTML = html;

    // Update document title if defined
    if (PAGE_TITLES[pageName]) {
      document.title = PAGE_TITLES[pageName];
    }

    // Immediately reveal all elements in newly mounted view
    if (this.mountTarget) {
      this.mountTarget.querySelectorAll('.reveal-on-scroll').forEach(el => {
        el.classList.add('is-revealed');
      });
      // Start muted autoplay for any videos inside the mounted template
      this.mountTarget.querySelectorAll('video[autoplay]').forEach(v => {
        v.muted = true;
        v.play().catch(() => {});
      });
    }

    // Refresh scroll reveal animations for newly mounted elements
    scrollReveal.refresh();

    // Re-bind interactive controls for dynamic pages
    if (pageName === 'home') {
      homeController.init();
    } else if (pageName === 'billing') {
      pricingController.init();
      pricingController.syncUI();
    }

    // Buttery smooth fade-in
    requestAnimationFrame(() => {
      this.mountTarget.style.transition = 'opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
      this.mountTarget.style.opacity = '1';
    });

    // Only scroll to top if user was scrolled down
    if (window.scrollY > 80) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

export const pageLoader = new PageLoader();
