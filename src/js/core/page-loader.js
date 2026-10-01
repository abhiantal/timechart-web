/**
 * NextGen Core - Page Loader & Combiner
 * Dynamically fetches and mounts dedicated page files into index.html shell.
 */

import { $ } from '../utils/dom.js';
import { scrollReveal } from '../utils/animation.js';
import { pricingController } from '../components/pricing.js';
import { homeController } from '../pages/home.js';
import { PAGE_PATHS, PAGE_TITLES } from '../pages/registry.js';

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

  async load(pageName) {
    if (!this.mountTarget) this.init();
    if (!this.mountTarget) return;

    // 1. If already on this page and content is rendered, avoid redundant work
    if (this.currentPage === pageName && this.mountTarget.children.length > 0) {
      return;
    }

    // 2. Instant cache check (0ms layout shift)
    if (this.pageCache.has(pageName)) {
      this.render(pageName, this.pageCache.get(pageName));
      return;
    }

    const pagePath = PAGE_PATHS[pageName] || (pageName.startsWith('features/') ? `./pages/modules/${pageName.replace('features/', '')}.html` : `./pages/main/${pageName}.html`);

    // 3. Fetch clean page template with fallback for cleanUrl servers
    try {
      const cacheBustUrl = pagePath.includes('?') ? `${pagePath}&v=${Date.now()}` : `${pagePath}?v=${Date.now()}`;
      let response = await fetch(cacheBustUrl, { cache: 'no-cache' });
      if (!response.ok && pagePath.endsWith('.html')) {
        // Try without .html if static server enforces clean URLs
        const cleanPath = pagePath.replace(/\.html$/, '');
        const altResponse = await fetch(`${cleanPath}?v=${Date.now()}`, { cache: 'no-cache' });
        if (altResponse.ok) {
          response = altResponse;
        }
      }
      if (!response.ok) {
        throw new Error(`Failed to load ${pagePath} (${response.status})`);
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
              Could not fetch <code>${pagePath}</code>. If running locally, please ensure you are viewing through a local server (e.g., Live Server at <code>http://127.0.0.1:5500/</code>).
            </p>
          </div>
        </div>
      `;
    }
  }

  render(pageName, html) {
    this.currentPage = pageName;
    this.mountTarget.innerHTML = html;

    // Update document title if defined
    if (PAGE_TITLES[pageName]) {
      document.title = PAGE_TITLES[pageName];
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

    // Only scroll to top if user was scrolled down
    if (window.scrollY > 80) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}

export const pageLoader = new PageLoader();
