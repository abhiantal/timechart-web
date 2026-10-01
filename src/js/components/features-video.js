/**
 * NextGen Component - Features Video Controller
 * Manages video previews on feature cards (hover to play, theater mode lightbox).
 */

import { tabController } from './tabs.js';

export class FeatureVideoController {
  constructor() {
    this.isInitialized = false;
    this.theaterGalleryImages = [];
    this.theaterCurrentIndex = 0;
    this.theaterActiveGalleryCard = null;
    this.theaterBaseTitle = '';
    this.theaterFeatureId = '';
  }

  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    const getTargetElement = (target) => {
      if (!target) return null;
      if (target instanceof Element) return target;
      if (target.parentElement) return target.parentElement;
      return null;
    };

    // 1. Hover to play / pause video preview on cards (Event delegation)
    document.addEventListener('pointerenter', (e) => {
      const targetEl = getTargetElement(e.target);
      const card = targetEl?.closest?.('.feature-module-card, .module-media-card');
      if (card && !card.classList.contains('module-gallery-card')) {
        const video = card.querySelector('.feature-card-video, video.media-actual-content');
        if (video) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
          const hint = card.querySelector('.video-play-indicator span');
          if (hint) hint.textContent = 'Streaming Preview';
        }
      }
    }, true);

    document.addEventListener('pointerleave', (e) => {
      const targetEl = getTargetElement(e.target);
      const card = targetEl?.closest?.('.feature-module-card, .module-media-card');
      if (card && !card.classList.contains('module-gallery-card')) {
        const video = card.querySelector('.feature-card-video, video.media-actual-content');
        if (video) {
          video.pause();
          const hint = card.querySelector('.video-play-indicator span');
          if (hint) hint.textContent = 'Hover to Preview';
        }
      }
    }, true);

    // 2. Click to open Theater Modal (Feature cards + Module detail pages)
    document.addEventListener('click', (e) => {
      const targetEl = getTargetElement(e.target);
      if (!targetEl) return;

      // Theater Gallery Prev / Next / Thumbnail click
      const theaterPrevBtn = targetEl.closest('#theater-gallery-prev');
      const theaterNextBtn = targetEl.closest('#theater-gallery-next');
      const theaterThumbBtn = targetEl.closest('.theater-thumb-item');

      if (theaterPrevBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.stepTheaterGallery(-1);
        return;
      }

      if (theaterNextBtn) {
        e.preventDefault();
        e.stopPropagation();
        this.stepTheaterGallery(1);
        return;
      }

      if (theaterThumbBtn) {
        e.preventDefault();
        e.stopPropagation();
        const index = parseInt(theaterThumbBtn.getAttribute('data-theater-index'), 10);
        if (!isNaN(index)) {
          this.setTheaterGalleryIndex(index);
        }
        return;
      }

      // Category Navigation Pills (Smooth scroll & active state)
      const categoryPill = targetEl.closest('.category-nav-pill');
      if (categoryPill) {
        e.preventDefault();
        const filterTarget = categoryPill.getAttribute('data-category-filter');
        const nav = categoryPill.closest('.features-category-nav');
        if (nav) {
          nav.querySelectorAll('.category-nav-pill').forEach(p => p.classList.remove('active'));
          categoryPill.classList.add('active');
        }
        if (filterTarget === 'all') {
          const firstSection = document.querySelector('.feature-category-group');
          if (firstSection) {
            firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        } else {
          const targetSection = document.getElementById(filterTarget);
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
        return;
      }

      // Gallery Card Navigation (Prev, Next, Dot on standard page view)
      if (this.handleGalleryAction(targetEl, e)) {
        return;
      }

      const expandBtn = targetEl.closest('[data-video-expand], [data-video-src]');
      const imageExpandBtn = targetEl.closest('[data-image-expand]');
      const videoBox = targetEl.closest('.feature-card-video-box');
      const mediaViewport = targetEl.closest('.media-frame-viewport');

      // Expand Image Trigger (Detail page gallery card or overview)
      if (imageExpandBtn) {
        e.preventDefault();
        e.stopPropagation();
        const gallery = imageExpandBtn.closest('.module-gallery-card');
        if (gallery) {
          this.openTheaterGallery(gallery);
          return;
        }

        const activeImg = gallery ? gallery.querySelector('.gallery-slide-img.active') : null;
        const imgSrc = (activeImg && activeImg.getAttribute('src')) || imageExpandBtn.getAttribute('data-image-src') || '';
        const title = imageExpandBtn.getAttribute('data-image-title') || 'Interface Screenshot Gallery';
        const badge = imageExpandBtn.getAttribute('data-image-badge') || 'UI CAPTURE';
        const desc = (activeImg && activeImg.getAttribute('data-caption')) || imageExpandBtn.getAttribute('data-image-desc') || '';
        const featureId = imageExpandBtn.getAttribute('data-feature-id') || '';
        if (imgSrc) {
          this.openTheaterImage(imgSrc, featureId, title, badge, desc);
          return;
        }
      }

      // Explicit Theater Video Button Trigger
      if (expandBtn) {
        e.preventDefault();
        e.stopPropagation();
        const videoSrc = expandBtn.getAttribute('data-video-src');
        const videoTitle = expandBtn.getAttribute('data-video-title') || 'Interactive Walkthrough';
        const videoBadge = expandBtn.getAttribute('data-video-badge') || 'LIVE DEMO';
        const videoDesc = expandBtn.getAttribute('data-video-desc') || '';
        const featureId = expandBtn.getAttribute('data-feature-id') || '';

        if (videoSrc) {
          this.openTheater(videoSrc, featureId, videoTitle, videoBadge, videoDesc);
          return;
        }

        // Fallback: check card or container
        const card = expandBtn.closest('.feature-module-card, .module-media-card');
        if (card) {
          const video = card.querySelector('video');
          const finalSrc = (video && (video.currentSrc || video.getAttribute('src') || video.querySelector('source')?.getAttribute('src'))) || '';
          const featId = card.getAttribute('data-feature-id') || featureId;
          const featName = card.getAttribute('data-feature-name') || videoTitle;
          const badgeText = card.querySelector('.badge')?.textContent.trim() || videoBadge;
          const descText = card.querySelector('.feature-module-desc, .module-media-footer-info p')?.textContent.trim() || videoDesc;
          if (finalSrc) {
            this.openTheater(finalSrc, featId, featName, badgeText, descText);
            return;
          }
        }
      }

      // Click anywhere on Overview Video Box (features.html)
      if (videoBox && !targetEl.closest('.feature-module-action') && !targetEl.closest('.feature-module-title')) {
        e.preventDefault();
        e.stopPropagation();
        
        const card = videoBox.closest('.feature-module-card');
        if (card) {
          const video = card.querySelector('.feature-card-video');
          const featureId = card.getAttribute('data-feature-id') || '';
          const featureName = card.getAttribute('data-feature-name') || card.querySelector('.feature-module-title')?.textContent.trim() || 'Feature';
          const badgeEl = card.querySelector('.feature-module-header .badge');
          const badgeText = badgeEl ? badgeEl.textContent.trim() : 'MODULE';
          const descEl = card.querySelector('.feature-module-desc');
          const descText = descEl ? descEl.textContent.trim() : '';

          const videoSrc = (video && (video.currentSrc || video.getAttribute('src'))) || '';
          if (videoSrc) {
            this.openTheater(videoSrc, featureId, featureName, badgeText, descText);
          }
        }
        return;
      }

      // Click anywhere on Module Detail Media Viewport (pages/modules/*.html)
      if (mediaViewport) {
        e.preventDefault();
        e.stopPropagation();

        const card = mediaViewport.closest('.module-media-card');
        if (!card) return;

        // If it's a gallery card, open all images in theater mode
        if (card.classList.contains('module-gallery-card')) {
          this.openTheaterGallery(card);
          return;
        }

        // It's a video card
        const video = card.querySelector('video');
        const expand = card.querySelector('[data-video-expand]');
        const videoSrc = (expand && expand.getAttribute('data-video-src')) || 
                         (video && (video.currentSrc || video.getAttribute('src') || video.querySelector('source')?.getAttribute('src'))) || '';
        const featureId = (expand && expand.getAttribute('data-feature-id')) || card.getAttribute('data-feature-id') || '';
        const featureName = (expand && expand.getAttribute('data-video-title')) || card.querySelector('.media-frame-title span')?.textContent.trim() || 'Walkthrough';
        const badgeText = (expand && expand.getAttribute('data-video-badge')) || card.querySelector('.badge')?.textContent.trim() || 'MODULE DEMO';
        const descText = (expand && expand.getAttribute('data-video-desc')) || card.querySelector('.module-media-footer-info p')?.textContent.trim() || '';

        if (videoSrc) {
          this.openTheater(videoSrc, featureId, featureName, badgeText, descText);
        }
      }
    });

    // 3. Theater Close Triggers
    document.addEventListener('click', (e) => {
      const targetEl = getTargetElement(e.target);
      if (!targetEl) return;
      if (targetEl.closest('#theater-close-btn') || targetEl.classList.contains('video-theater-backdrop')) {
        e.preventDefault();
        this.closeTheater();
      }
    });

    // 4. Keyboard Navigation (Escape to close, Arrow keys for theater gallery)
    window.addEventListener('keydown', (e) => {
      const modal = document.querySelector('#feature-video-modal.open');
      if (!modal) return;

      if (e.key === 'Escape') {
        this.closeTheater();
      } else if (this.theaterGalleryImages && this.theaterGalleryImages.length > 1) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.stepTheaterGallery(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.stepTheaterGallery(1);
        }
      }
    });
  }

  handleGalleryAction(targetEl, e) {
    const galleryCard = targetEl.closest('.module-gallery-card');
    if (!galleryCard) return false;

    const prevBtn = targetEl.closest('.gallery-nav-btn.prev');
    const nextBtn = targetEl.closest('.gallery-nav-btn.next');
    const dotBtn = targetEl.closest('.gallery-dot');
    const slides = Array.from(galleryCard.querySelectorAll('.gallery-slide-img'));
    if (!slides.length) return false;

    const dots = Array.from(galleryCard.querySelectorAll('.gallery-dot'));
    const counter = galleryCard.querySelector('.gallery-counter-label');
    const caption = galleryCard.querySelector('.gallery-caption-text');
    const expandBtn = galleryCard.querySelector('[data-image-expand]');

    let currentIndex = slides.findIndex(img => img.classList.contains('active'));
    if (currentIndex < 0) currentIndex = 0;

    if (prevBtn || nextBtn || dotBtn) {
      e.preventDefault();
      e.stopPropagation();
      let newIndex = currentIndex;
      if (prevBtn) {
        newIndex = (currentIndex - 1 + slides.length) % slides.length;
      } else if (nextBtn) {
        newIndex = (currentIndex + 1) % slides.length;
      } else if (dotBtn) {
        const idxAttr = dotBtn.getAttribute('data-slide-to');
        if (idxAttr !== null) newIndex = parseInt(idxAttr, 10);
      }

      if (newIndex >= 0 && newIndex < slides.length) {
        slides.forEach((img, i) => img.classList.toggle('active', i === newIndex));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === newIndex));
        if (counter) counter.textContent = `Image ${newIndex + 1} / ${slides.length}`;
        const activeSlide = slides[newIndex];
        if (caption && activeSlide) {
          const text = activeSlide.getAttribute('data-caption') || activeSlide.getAttribute('alt') || '';
          caption.innerHTML = `<strong>Screen ${newIndex + 1}:</strong> ${text}`;
        }
        if (expandBtn && activeSlide) {
          expandBtn.setAttribute('data-image-desc', activeSlide.getAttribute('data-caption') || '');
          expandBtn.setAttribute('data-image-badge', `IMAGE ${newIndex + 1} OF ${slides.length}`);
        }
      }
      return true;
    }

    return false;
  }

  openTheater(videoSrc, featureId, featureName, badgeText, descText) {
    const modal = document.querySelector('#feature-video-modal');
    if (!modal) return;

    // Reset gallery tracking and hide gallery controls
    this.theaterGalleryImages = [];
    this.theaterCurrentIndex = 0;
    this.theaterActiveGalleryCard = null;
    modal.classList.remove('theater-gallery-mode');

    const prevBtn = modal.querySelector('#theater-gallery-prev');
    const nextBtn = modal.querySelector('#theater-gallery-next');
    const strip = modal.querySelector('#theater-gallery-strip');
    if (prevBtn) prevBtn.style.setProperty('display', 'none', 'important');
    if (nextBtn) nextBtn.style.setProperty('display', 'none', 'important');
    if (strip) {
      strip.style.setProperty('display', 'none', 'important');
      strip.innerHTML = '';
    }

    const player = modal.querySelector('#theater-video-player');
    const imagePlayer = modal.querySelector('#theater-image-player');
    const badge = modal.querySelector('#theater-module-badge');
    const title = modal.querySelector('#theater-module-title');
    const desc = modal.querySelector('#theater-module-desc');
    const deepDiveBtn = modal.querySelector('#theater-deep-dive-btn');

    // Hide image player completely
    if (imagePlayer) {
      imagePlayer.classList.add('theater-media-hidden');
      imagePlayer.style.setProperty('display', 'none', 'important');
      imagePlayer.removeAttribute('src');
    }

    if (badge) badge.textContent = badgeText;
    if (title) title.textContent = `${featureName} — Live Walkthrough`;
    if (desc) desc.textContent = descText;

    // Remove Deep Dive button for detail pages & study pages (only show when on main features overview)
    const isStudyPage = window.location.hash.startsWith('#study') || !!document.querySelector('.study-detail-section') || !!document.querySelector('.study-detail-hero-media');
    const isDetailPage = (window.location.hash.startsWith('#features/') && window.location.hash.length > '#features/'.length) || !!document.querySelector('.module-detail-hero') || isStudyPage;
    const isValidOverviewFeature = featureId && !featureId.startsWith('study') && !isDetailPage && !isStudyPage;

    if (deepDiveBtn) {
      if (isValidOverviewFeature) {
        deepDiveBtn.style.setProperty('display', 'inline-flex', 'important');
        deepDiveBtn.setAttribute('href', `#features/${featureId}`);
        deepDiveBtn.setAttribute('data-tab-target', `features/${featureId}`);
        deepDiveBtn.onclick = (e) => {
          e.preventDefault();
          this.closeTheater();
          tabController.navigate(`features/${featureId}`, true);
        };
      } else {
        deepDiveBtn.style.setProperty('display', 'none', 'important');
      }
    }

    // Show and configure video player
    if (player) {
      player.classList.remove('theater-media-hidden');
      player.style.setProperty('display', 'block', 'important');
      player.pause();
      player.src = videoSrc;
      player.load();
      player.currentTime = 0.05;
      player.muted = false;
      const playPromise = player.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          player.muted = true;
          player.play().catch(() => {});
        });
      }
    }

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Opens multi-image gallery in Theater Mode with thumbnail strip, prev/next controls, and captions.
   */
  openTheaterGallery(galleryCard, initialIndex = null) {
    const modal = document.querySelector('#feature-video-modal');
    if (!modal) return;

    this.theaterActiveGalleryCard = galleryCard;
    const slides = Array.from(galleryCard.querySelectorAll('.gallery-slide-img'));
    
    // Fallback if no slides found
    if (!slides.length) {
      const singleImg = galleryCard.querySelector('img');
      if (singleImg) {
        this.openTheaterImage(singleImg.getAttribute('src') || '', '', 'Gallery Image', 'UI CAPTURE', singleImg.getAttribute('alt') || '');
      }
      return;
    }

    const expandBtn = galleryCard.querySelector('[data-image-expand]');
    this.theaterFeatureId = expandBtn?.getAttribute('data-feature-id') || galleryCard.getAttribute('data-feature-id') || '';
    this.theaterBaseTitle = expandBtn?.getAttribute('data-image-title') || 
                            galleryCard.querySelector('.media-frame-title span')?.textContent.trim() || 
                            'Interface Gallery';

    // Extract all image slides
    this.theaterGalleryImages = slides.map((img, i) => ({
      src: img.getAttribute('src') || '',
      alt: img.getAttribute('alt') || `Screenshot ${i + 1}`,
      caption: img.getAttribute('data-caption') || img.getAttribute('alt') || '',
      index: i
    }));

    // Determine starting index
    if (initialIndex !== null && initialIndex >= 0 && initialIndex < this.theaterGalleryImages.length) {
      this.theaterCurrentIndex = initialIndex;
    } else {
      const activeIdx = slides.findIndex(img => img.classList.contains('active'));
      this.theaterCurrentIndex = activeIdx >= 0 ? activeIdx : 0;
    }

    // Hide video player completely
    const player = modal.querySelector('#theater-video-player');
    const imagePlayer = modal.querySelector('#theater-image-player');
    if (player) {
      player.pause();
      player.removeAttribute('src');
      player.load();
      player.classList.add('theater-media-hidden');
      player.style.setProperty('display', 'none', 'important');
    }

    // Show image player
    if (imagePlayer) {
      imagePlayer.classList.remove('theater-media-hidden');
      imagePlayer.style.setProperty('display', 'block', 'important');
    }

    // Configure gallery navigation buttons & thumbnail strip
    const prevBtn = modal.querySelector('#theater-gallery-prev');
    const nextBtn = modal.querySelector('#theater-gallery-next');
    const strip = modal.querySelector('#theater-gallery-strip');

    if (this.theaterGalleryImages.length > 1) {
      if (prevBtn) prevBtn.style.setProperty('display', 'flex', 'important');
      if (nextBtn) nextBtn.style.setProperty('display', 'flex', 'important');
      if (strip) {
        strip.style.setProperty('display', 'flex', 'important');
        strip.innerHTML = this.theaterGalleryImages.map((item, i) => `
          <button type="button" class="theater-thumb-item ${i === this.theaterCurrentIndex ? 'active' : ''}" data-theater-index="${i}" aria-label="View screenshot ${i + 1}: ${item.alt}">
            <img src="${item.src}" alt="${item.alt}" loading="lazy">
          </button>
        `).join('');
      }
    } else {
      if (prevBtn) prevBtn.style.setProperty('display', 'none', 'important');
      if (nextBtn) nextBtn.style.setProperty('display', 'none', 'important');
      if (strip) {
        strip.style.setProperty('display', 'none', 'important');
        strip.innerHTML = '';
      }
    }

    // Apply active slide content
    this.setTheaterGalleryIndex(this.theaterCurrentIndex);

    // Deep Dive button visibility
    const deepDiveBtn = modal.querySelector('#theater-deep-dive-btn');
    const isStudyPage = window.location.hash.startsWith('#study') || !!document.querySelector('.study-detail-section') || !!document.querySelector('.study-detail-hero-media');
    const isDetailPage = (window.location.hash.startsWith('#features/') && window.location.hash.length > '#features/'.length) || !!document.querySelector('.module-detail-hero') || isStudyPage;
    const isValidOverviewFeature = this.theaterFeatureId && !this.theaterFeatureId.startsWith('study') && !isDetailPage && !isStudyPage;

    if (deepDiveBtn) {
      if (isValidOverviewFeature) {
        deepDiveBtn.style.setProperty('display', 'inline-flex', 'important');
        deepDiveBtn.setAttribute('href', `#features/${this.theaterFeatureId}`);
        deepDiveBtn.setAttribute('data-tab-target', `features/${this.theaterFeatureId}`);
        deepDiveBtn.onclick = (e) => {
          e.preventDefault();
          this.closeTheater();
          tabController.navigate(`features/${this.theaterFeatureId}`, true);
        };
      } else {
        deepDiveBtn.style.setProperty('display', 'none', 'important');
      }
    }

    modal.classList.add('open');
    modal.classList.add('theater-gallery-mode');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  setTheaterGalleryIndex(index) {
    if (!this.theaterGalleryImages || !this.theaterGalleryImages.length) return;
    if (index < 0 || index >= this.theaterGalleryImages.length) return;

    this.theaterCurrentIndex = index;
    const current = this.theaterGalleryImages[index];
    const modal = document.querySelector('#feature-video-modal');
    if (!modal) return;

    const imagePlayer = modal.querySelector('#theater-image-player');
    const badge = modal.querySelector('#theater-module-badge');
    const title = modal.querySelector('#theater-module-title');
    const desc = modal.querySelector('#theater-module-desc');
    const strip = modal.querySelector('#theater-gallery-strip');

    if (imagePlayer) {
      imagePlayer.src = current.src;
      imagePlayer.alt = current.alt;
    }

    if (badge) {
      badge.textContent = `IMAGE ${index + 1} OF ${this.theaterGalleryImages.length}`;
    }

    if (title) {
      title.textContent = current.alt ? `${this.theaterBaseTitle} — ${current.alt}` : this.theaterBaseTitle;
    }

    if (desc) {
      desc.textContent = current.caption || `High-resolution preview capture ${index + 1} of ${this.theaterGalleryImages.length}`;
    }

    // Update active thumbnail in strip
    if (strip) {
      const thumbs = strip.querySelectorAll('.theater-thumb-item');
      thumbs.forEach((thumb, i) => {
        const isActive = (i === index);
        thumb.classList.toggle('active', isActive);
        if (isActive) {
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    }

    // Synchronize underlying module gallery card on the page if active
    if (this.theaterActiveGalleryCard) {
      const slides = Array.from(this.theaterActiveGalleryCard.querySelectorAll('.gallery-slide-img'));
      const dots = Array.from(this.theaterActiveGalleryCard.querySelectorAll('.gallery-dot'));
      const counter = this.theaterActiveGalleryCard.querySelector('.gallery-counter-label');
      const caption = this.theaterActiveGalleryCard.querySelector('.gallery-caption-text');
      const expandBtn = this.theaterActiveGalleryCard.querySelector('[data-image-expand]');

      slides.forEach((img, i) => img.classList.toggle('active', i === index));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
      if (counter) counter.textContent = `Image ${index + 1} / ${slides.length}`;
      if (caption && slides[index]) {
        const text = slides[index].getAttribute('data-caption') || slides[index].getAttribute('alt') || '';
        caption.innerHTML = `<strong>Screen ${index + 1}:</strong> ${text}`;
      }
      if (expandBtn && slides[index]) {
        expandBtn.setAttribute('data-image-desc', slides[index].getAttribute('data-caption') || '');
        expandBtn.setAttribute('data-image-badge', `IMAGE ${index + 1} OF ${slides.length}`);
      }
    }
  }

  stepTheaterGallery(step) {
    if (!this.theaterGalleryImages || !this.theaterGalleryImages.length) return;
    const total = this.theaterGalleryImages.length;
    const nextIndex = (this.theaterCurrentIndex + step + total) % total;
    this.setTheaterGalleryIndex(nextIndex);
  }

  openTheaterImage(imageSrc, featureId, titleText, badgeText, descText) {
    // If element passed, forward to openTheaterGallery
    if (imageSrc && typeof imageSrc === 'object' && imageSrc.nodeType) {
      return this.openTheaterGallery(imageSrc);
    }

    const modal = document.querySelector('#feature-video-modal');
    if (!modal) return;

    this.theaterGalleryImages = [{
      src: imageSrc,
      alt: titleText || 'High-Resolution Screenshot',
      caption: descText || '',
      index: 0
    }];
    this.theaterCurrentIndex = 0;
    this.theaterActiveGalleryCard = null;
    this.theaterBaseTitle = titleText || 'High-Resolution Screenshot';
    this.theaterFeatureId = featureId || '';

    // Hide gallery chevrons and strip for single standalone image
    const prevBtn = modal.querySelector('#theater-gallery-prev');
    const nextBtn = modal.querySelector('#theater-gallery-next');
    const strip = modal.querySelector('#theater-gallery-strip');
    if (prevBtn) prevBtn.style.setProperty('display', 'none', 'important');
    if (nextBtn) nextBtn.style.setProperty('display', 'none', 'important');
    if (strip) {
      strip.style.setProperty('display', 'none', 'important');
      strip.innerHTML = '';
    }

    // Hide video player completely
    const player = modal.querySelector('#theater-video-player');
    const imagePlayer = modal.querySelector('#theater-image-player');
    const badge = modal.querySelector('#theater-module-badge');
    const title = modal.querySelector('#theater-module-title');
    const desc = modal.querySelector('#theater-module-desc');
    const deepDiveBtn = modal.querySelector('#theater-deep-dive-btn');

    if (player) {
      player.pause();
      player.removeAttribute('src');
      player.load();
      player.classList.add('theater-media-hidden');
      player.style.setProperty('display', 'none', 'important');
    }

    // Show image player completely
    if (imagePlayer) {
      imagePlayer.src = imageSrc;
      imagePlayer.classList.remove('theater-media-hidden');
      imagePlayer.style.setProperty('display', 'block', 'important');
    }

    if (badge) badge.textContent = badgeText || 'UI GALLERY';
    if (title) title.textContent = titleText || 'High-Resolution Screenshot';
    if (desc) desc.textContent = descText || '';

    // Remove Deep Dive button for detail pages & study pages
    const isStudyPage = window.location.hash.startsWith('#study') || !!document.querySelector('.study-detail-section') || !!document.querySelector('.study-detail-hero-media');
    const isDetailPage = (window.location.hash.startsWith('#features/') && window.location.hash.length > '#features/'.length) || !!document.querySelector('.module-detail-hero') || isStudyPage;
    const isValidOverviewFeature = featureId && !featureId.startsWith('study') && !isDetailPage && !isStudyPage;

    if (deepDiveBtn) {
      if (isValidOverviewFeature) {
        deepDiveBtn.style.setProperty('display', 'inline-flex', 'important');
        deepDiveBtn.setAttribute('href', `#features/${featureId}`);
        deepDiveBtn.setAttribute('data-tab-target', `features/${featureId}`);
        deepDiveBtn.onclick = (e) => {
          e.preventDefault();
          this.closeTheater();
          tabController.navigate(`features/${featureId}`, true);
        };
      } else {
        deepDiveBtn.style.setProperty('display', 'none', 'important');
      }
    }

    modal.classList.add('open');
    modal.classList.remove('theater-gallery-mode');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  closeTheater() {
    const modal = document.querySelector('#feature-video-modal');
    if (!modal) return;

    this.theaterGalleryImages = [];
    this.theaterCurrentIndex = 0;
    this.theaterActiveGalleryCard = null;
    modal.classList.remove('theater-gallery-mode');

    const prevBtn = modal.querySelector('#theater-gallery-prev');
    const nextBtn = modal.querySelector('#theater-gallery-next');
    const strip = modal.querySelector('#theater-gallery-strip');
    if (prevBtn) prevBtn.style.setProperty('display', 'none', 'important');
    if (nextBtn) nextBtn.style.setProperty('display', 'none', 'important');
    if (strip) {
      strip.style.setProperty('display', 'none', 'important');
      strip.innerHTML = '';
    }

    const player = modal.querySelector('#theater-video-player');
    const imagePlayer = modal.querySelector('#theater-image-player');
    if (player) {
      player.pause();
      player.removeAttribute('src');
      player.load();
      player.classList.add('theater-media-hidden');
      player.style.setProperty('display', 'none', 'important');
    }
    if (imagePlayer) {
      imagePlayer.removeAttribute('src');
      imagePlayer.classList.add('theater-media-hidden');
      imagePlayer.style.setProperty('display', 'none', 'important');
    }
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

export const featureVideoController = new FeatureVideoController();

