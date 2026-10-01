/**
 * NextGen Utils - DOM Manipulation Helpers
 * Ergonomic, lightweight wrappers for standard DOM APIs.
 */

/**
 * Select a single element matching selector.
 */
export const $ = (selector, context = document) => {
  return context.querySelector(selector);
};

/**
 * Select all elements matching selector as an Array.
 */
export const $$ = (selector, context = document) => {
  return Array.from(context.querySelectorAll(selector));
};

/**
 * Add an event listener to element(s).
 */
export const on = (targets, event, handler, options = {}) => {
  const elements = Array.isArray(targets) || targets instanceof NodeList ? targets : [targets];
  elements.forEach(el => {
    if (el && el.addEventListener) {
      el.addEventListener(event, handler, options);
    }
  });
};

/**
 * Remove an event listener from element(s).
 */
export const off = (targets, event, handler, options = {}) => {
  const elements = Array.isArray(targets) || targets instanceof NodeList ? targets : [targets];
  elements.forEach(el => {
    if (el && el.removeEventListener) {
      el.removeEventListener(event, handler, options);
    }
  });
};

/**
 * Event delegation helper.
 */
export const delegate = (parent, selector, event, handler) => {
  on(parent, event, (e) => {
    const matchedEl = e.target.closest(selector);
    if (matchedEl && parent.contains(matchedEl)) {
      handler.call(matchedEl, e, matchedEl);
    }
  });
};

/**
 * Class manipulation helpers.
 */
export const addClass = (el, ...classes) => el && el.classList.add(...classes);
export const removeClass = (el, ...classes) => el && el.classList.remove(...classes);
export const toggleClass = (el, className, force) => el && el.classList.toggle(className, force);
export const hasClass = (el, className) => el && el.classList.contains(className);
