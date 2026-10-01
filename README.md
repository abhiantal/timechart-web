# NexGen — Web Platform Architecture

Welcome to **NexGen**! This is the official web application foundation engineered for maximum aesthetic impact, high performance, and massive scalability.

---

## 🌟 Highlights

- **Dual-Theme Engine (Light & Dark)**:
  - Instant toggle with zero screen flash (anti-FOUC script in `<head>`).
  - Automatically synchronizes with OS preference (`prefers-color-scheme`).
  - Persists preference across sessions via `localStorage`.
- **Fully Responsive (Desktop & Mobile)**:
  - Desktop sticky glassmorphic navigation bar.
  - Mobile slide-in drawer with animated morphing hamburger button.
  - Fluid typography (`clamp()`) and flexible CSS Grid / Flexbox layouts.
- **Futuristic & Premium Aesthetics**:
  - Frosted glassmorphism (`backdrop-filter: blur(14px)`).
  - Ambient glowing radial orbs & cybernetic grid lines.
  - Electric Cyan (`#00F2FE`), Neon Violet (`#A855F7`), and Cyber Emerald (`#00F5A0`) color accents.
  - High-precision modern typography featuring Google Fonts: **Outfit** and **Plus Jakarta Sans**.
- **Clean 7-1 Modular Architecture**:
  - Scalable CSS layers preventing selector collision.
  - Modular ES6+ JavaScript modules with DOM helpers, storage fallback, and scroll animations.

---

## 📁 Project Directory Structure

```text
NexGen/
├── index.html                          # Showcase landing page demonstrating the foundation
├── README.md                           # Quickstart guide & documentation
├── src/
│   ├── css/
│   │   ├── main.css                    # Master import orchestrator
│   │   ├── base/
│   │   │   ├── reset.css               # Modern CSS reset & baseline
│   │   │   ├── variables.css           # Design tokens (colors, light/dark themes, spacing, shadows)
│   │   │   └── typography.css          # Fluid typography scales & Google font imports
│   │   ├── components/
│   │   │   ├── navbar.css              # Sticky glass navbar, desktop links & mobile drawer
│   │   │   ├── button.css              # Cyber neon glow, glass, and outline buttons
│   │   │   ├── card.css                # Glassmorphic cyber cards with hover lift & border glows
│   │   │   ├── badge.css               # Status pills, tags, and animated pulse dots
│   │   │   ├── theme-toggle.css        # Interactive sun/moon toggle switch
│   │   │   └── footer.css              # Structured multi-column responsive footer
│   │   ├── layout/
│   │   │   ├── container.css           # Responsive container bounds & gutters
│   │   │   ├── grid.css                # Flexbox and CSS Grid layout utilities
│   │   │   └── section.css             # Section wrappers, ambient glow orbs & cyber grid
│   │   └── utilities/
│   │       ├── animations.css          # Keyframes (float, glow, fade-up, shimmer) & scroll observer classes
│   │       └── helpers.css             # Glass panels, spacing, alignment, and display classes
│   ├── js/
│   │   ├── main.js                     # Master bootstrap entry point
│   │   ├── core/
│   │   │   ├── config.js               # Application configuration & constants
│   │   │   ├── theme.js                # Theme switching engine (light/dark, OS sync, storage)
│   │   │   └── storage.js              # Resilient storage manager with in-memory fallback
│   │   ├── components/
│   │   │   ├── navbar.js               # Responsive mobile drawer & scroll glass controller
│   │   │   └── modal.js                # Accessible modal dialog controller
│   │   └── utils/
│   │       ├── dom.js                  # Fast DOM querying ($ / $$) and event helpers
│   │       └── animation.js            # IntersectionObserver scroll reveal manager
│   ├── images/
│   │   ├── logo.svg                    # NexGen futuristic vector logo mark
│   │   └── icons/                      # SVG icon assets (sun, moon, sparkle, lightning, shield, code)
│   └── docs/
│       └── ARCHITECTURE.md             # In-depth architectural guide for step-by-step expansion
```

---

## 🚀 How to Run Locally

Because NexGen uses clean standard HTML5, CSS3, and ES6 Modules, you can run it with any local static HTTP server:

```powershell
# Using Python
python -m http.server 8000

# Or using Node / npx
npx serve .
```

Then open `http://localhost:8000` in any modern browser.

---

## 🎨 Design Tokens Quick Reference

In any CSS file, you can utilize the design tokens:

```css
/* Backgrounds */
background-color: var(--bg-primary);
background: var(--bg-surface);

/* Text Colors */
color: var(--text-primary);
color: var(--text-secondary);

/* Futuristic Accents */
color: var(--color-cyan);
box-shadow: 0 0 20px var(--color-cyan-glow);

/* Gradients */
background: var(--grad-primary);

/* Borders */
border: 1px solid var(--border-subtle);
border-color: var(--border-glow);
```

---

## 🧩 Adding New Features Step-by-Step

1. **New CSS Component**:
   Create `src/css/components/my-component.css` and add `@import url('./components/my-component.css');` into `src/css/main.css`.
2. **New JavaScript Module**:
   Create `src/js/components/my-component.js` and initialize it inside `src/js/main.js`.
3. **HTML Elements**:
   Add semantic tags using `.card`, `.btn`, `.badge`, `.grid-cols-3`, or `.reveal-on-scroll` for instant high-end styling.
