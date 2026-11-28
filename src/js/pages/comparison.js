/**
 * NextGen Page Controller - Comparison & Benchmark UI
 * Handles interactive category filtering, competitor column focus,
 * and live consolidation cost calculator on the #comparison view.
 */

export class ComparisonController {
  constructor() {
    this.isInitialized = false;
    this.activeCategory = 'all';
    this.activeFocus = 'all';
  }

  init() {
    if (!this.isInitialized) {
      this.isInitialized = true;

      document.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('[data-comp-filter]');
        if (filterBtn) {
          e.preventDefault();
          this.activeCategory = filterBtn.getAttribute('data-comp-filter') || 'all';
          this.applyFilters();
          return;
        }

        const focusBtn = e.target.closest('[data-comp-focus]');
        if (focusBtn) {
          e.preventDefault();
          this.activeFocus = focusBtn.getAttribute('data-comp-focus') || 'all';
          this.applyColumnFocus();
          return;
        }
      });

      document.addEventListener('change', (e) => {
        if (e.target.matches('[data-comp-stack-check]')) {
          this.updateCalculator();
        }
      });
    }

    this.syncUI();
  }

  syncUI() {
    if (!document.querySelector('.comp-page')) return;
    this.applyFilters();
    this.applyColumnFocus();
    this.updateCalculator();
  }

  applyFilters() {
    const page = document.querySelector('.comp-page');
    if (!page) return;

    page.querySelectorAll('[data-comp-filter]').forEach((btn) => {
      const target = btn.getAttribute('data-comp-filter');
      const isActive = target === this.activeCategory;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    const rows = page.querySelectorAll('[data-comp-row]');
    let visibleCount = 0;

    rows.forEach((row) => {
      const cat = row.getAttribute('data-comp-category') || 'all';
      const show = this.activeCategory === 'all' || cat === this.activeCategory;
      row.hidden = !show;
      if (show) visibleCount += 1;
    });

    const countEl = page.querySelector('#comp-visible-count');
    if (countEl) {
      countEl.textContent = `Showing ${visibleCount} of ${rows.length} capabilities`;
    }
  }

  applyColumnFocus() {
    const page = document.querySelector('.comp-page');
    if (!page) return;

    page.querySelectorAll('[data-comp-focus]').forEach((btn) => {
      const target = btn.getAttribute('data-comp-focus');
      const isActive = target === this.activeFocus;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    const table = page.querySelector('.comp-matrix-table');
    if (!table) return;

    table.querySelectorAll('[data-col-group]').forEach((cell) => {
      const group = cell.getAttribute('data-col-group');
      const dimmed = this.activeFocus !== 'all' && group !== 'core' && group !== this.activeFocus;
      const focused = this.activeFocus !== 'all' && group === this.activeFocus;
      cell.classList.toggle('is-dimmed', dimmed);
      cell.classList.toggle('is-focused', focused);
    });
  }

  updateCalculator() {
    const page = document.querySelector('.comp-page');
    if (!page) return;

    const checks = page.querySelectorAll('[data-comp-stack-check]');
    let selectedCount = 0;
    let totalUsd = 0;

    checks.forEach((checkbox) => {
      const row = checkbox.closest('[data-comp-stack-item]');
      const price = parseFloat(checkbox.getAttribute('data-usd') || '0');
      if (row) {
        row.classList.toggle('is-selected', checkbox.checked);
      }
      if (checkbox.checked) {
        selectedCount += 1;
        totalUsd += price;
      }
    });

    const totalInr = Math.round(totalUsd * 84);
    const yearlyUsd = Math.round(totalUsd * 12);

    const countEl = page.querySelector('#comp-calc-count');
    const usdEl = page.querySelector('#comp-calc-usd');
    const inrEl = page.querySelector('#comp-calc-inr');
    const yearlyEl = page.querySelector('#comp-calc-yearly');

    if (countEl) countEl.textContent = `${selectedCount} separate ${selectedCount === 1 ? 'app' : 'apps'} selected`;
    if (usdEl) usdEl.textContent = `$${totalUsd.toFixed(2)} / mo`;
    if (inrEl) inrEl.textContent = `~₹${totalInr.toLocaleString('en-IN')} / mo`;
    if (yearlyEl) yearlyEl.textContent = `~$${yearlyUsd.toLocaleString('en-US')} / yr saved`;
  }
}

export const comparisonController = new ComparisonController();
