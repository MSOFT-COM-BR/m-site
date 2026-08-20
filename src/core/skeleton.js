/**
 * Skeleton Component - Premium Loading States
 * Provides beautiful loading placeholders for all component types
 * @version 2.0.0
 */

class Skeleton extends Component {
  constructor(options = {}) {
    super({
      name: 'skeleton',
      template: '',
      styles: Skeleton.getStyles(),
      state: {
        type: options.type || 'page',
        count: options.count || 1,
        animated: options.animated !== false
      }
    });

    this.templates = Skeleton.getTemplates();
  }

  /**
   * Get all skeleton CSS styles
   */
  static getStyles() {
    return `
      /* ============================================
         SKELETON BASE STYLES
         ============================================ */
      .skeleton-wrapper {
        width: 100%;
        min-height: 100%;
        background: var(--ms-surface);
        animation: skeletonFadeIn 0.3s ease-out;
      }

      .skeleton-item {
        background: rgba(203, 213, 225, 0.14);
        border-radius: 8px;
        position: relative;
        overflow: hidden;
      }

      /* Transform-only shimmer (compositor-friendly; avoids background-position animation) */
      .skeleton-item.animated::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          90deg,
          transparent 0%,
          rgba(248, 250, 252, 0.2) 50%,
          transparent 100%
        );
        transform: translateX(-100%);
        animation: skeletonShimmerSlide 1.5s infinite linear;
      }

      /* ============================================
         SKELETON TYPES
         ============================================ */

      /* Hero Skeleton */
      .skeleton-hero {
        min-height: 100vh;
        display: flex;
        align-items: center;
        padding: 120px 0 80px;
      }

      .skeleton-hero-content {
        width: 100%;
        max-width: 600px;
      }

      .skeleton-badge {
        width: 200px;
        height: 36px;
        border-radius: 50px;
        margin-bottom: 24px;
      }

      .skeleton-title-lg {
        width: 100%;
        height: 64px;
        margin-bottom: 16px;
        border-radius: 12px;
      }

      .skeleton-title-lg.short {
        width: 70%;
      }

      .skeleton-subtitle {
        width: 60%;
        height: 32px;
        margin-bottom: 24px;
        border-radius: 8px;
      }

      .skeleton-paragraph {
        width: 100%;
        height: 20px;
        margin-bottom: 12px;
        border-radius: 6px;
      }

      .skeleton-paragraph.short {
        width: 80%;
      }

      .skeleton-pills {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 24px 0;
      }

      .skeleton-pill {
        width: 100px;
        height: 40px;
        border-radius: 50px;
      }

      .skeleton-pill:nth-child(2) { width: 120px; }
      .skeleton-pill:nth-child(3) { width: 90px; }
      .skeleton-pill:nth-child(4) { width: 110px; }
      .skeleton-pill:nth-child(5) { width: 130px; }

      .skeleton-buttons {
        display: flex;
        gap: 16px;
        margin-top: 32px;
      }

      .skeleton-btn {
        width: 180px;
        height: 52px;
        border-radius: 12px;
      }

      .skeleton-btn.outline {
        background: transparent;
        border: 1px solid rgba(203, 213, 225, 0.34);
      }

      /* Avatar Skeleton */
      .skeleton-avatar-wrapper {
        display: flex;
        justify-content: center;
      }

      .skeleton-avatar {
        width: 300px;
        height: 300px;
        border-radius: 24px;
      }

      @media (min-width: 992px) {
        .skeleton-avatar {
          width: 350px;
          height: 350px;
        }
      }

      /* Card Skeleton */
      .skeleton-card {
        background: var(--ms-surface-container);
        border: 1px solid rgba(203, 213, 225, 0.22);
        border-radius: 20px;
        padding: 32px;
        height: 100%;
      }

      .skeleton-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        margin-bottom: 20px;
      }

      .skeleton-title {
        width: 70%;
        height: 24px;
        margin-bottom: 16px;
        border-radius: 6px;
      }

      .skeleton-text {
        width: 100%;
        height: 16px;
        margin-bottom: 8px;
        border-radius: 4px;
      }

      .skeleton-text.w-90 { width: 90%; }
      .skeleton-text.w-80 { width: 80%; }
      .skeleton-text.w-70 { width: 70%; }
      .skeleton-text.w-60 { width: 60%; }

      .skeleton-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 16px;
      }

      .skeleton-tag {
        width: 60px;
        height: 28px;
        border-radius: 50px;
      }

      .skeleton-tag:nth-child(2) { width: 80px; }
      .skeleton-tag:nth-child(3) { width: 70px; }

      /* Timeline Skeleton */
      .skeleton-timeline {
        position: relative;
        max-width: 900px;
        margin: 0 auto;
        padding-left: 60px;
      }

      .skeleton-timeline::before {
        content: '';
        position: absolute;
        left: 20px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: linear-gradient(to bottom, rgba(203, 213, 225, 0.48), rgba(203, 213, 225, 0.2));
      }

      .skeleton-timeline-item {
        position: relative;
        padding-bottom: 40px;
      }

      .skeleton-timeline-dot {
        position: absolute;
        left: -48px;
        top: 0;
        width: 18px;
        height: 18px;
        background: rgba(203, 213, 225, 0.48);
        border-radius: 50%;
      }

      .skeleton-timeline-card {
        background: var(--ms-surface-container);
        border: 1px solid rgba(203, 213, 225, 0.22);
        border-radius: 20px;
        padding: 28px;
      }

      /* Section Header Skeleton */
      .skeleton-section-header {
        text-align: center;
        max-width: 700px;
        margin: 0 auto 60px;
      }

      .skeleton-section-badge {
        width: 140px;
        height: 30px;
        border-radius: 50px;
        margin: 0 auto 20px;
      }

      .skeleton-section-title {
        width: 60%;
        height: 48px;
        margin: 0 auto 16px;
        border-radius: 10px;
      }

      .skeleton-section-desc {
        width: 80%;
        height: 20px;
        margin: 0 auto;
        border-radius: 6px;
      }

      /* Grid Skeleton */
      .skeleton-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 24px;
      }

      .skeleton-grid-3 {
        grid-template-columns: repeat(3, 1fr);
      }

      @media (max-width: 991px) {
        .skeleton-grid-3 {
          grid-template-columns: 1fr;
        }
      }

      /* Education Card Skeleton */
      .skeleton-edu-card {
        background: var(--ms-surface-container);
        border: 1px solid rgba(203, 213, 225, 0.22);
        border-radius: 20px;
        padding: 28px;
        text-align: center;
      }

      .skeleton-edu-icon {
        width: 50px;
        height: 50px;
        border-radius: 12px;
        margin: 0 auto 16px;
      }

      .skeleton-edu-title {
        width: 80%;
        height: 20px;
        margin: 0 auto 8px;
        border-radius: 4px;
      }

      .skeleton-edu-subtitle {
        width: 60%;
        height: 16px;
        margin: 0 auto;
        border-radius: 4px;
      }

      /* Contact Skeleton */
      .skeleton-contact {
        background: var(--ms-surface-container);
        border: 1px solid rgba(203, 213, 225, 0.22);
        border-radius: 30px;
        padding: 60px;
        text-align: center;
      }

      .skeleton-contact-title {
        width: 50%;
        height: 40px;
        margin: 0 auto 16px;
        border-radius: 8px;
      }

      .skeleton-contact-desc {
        width: 70%;
        height: 20px;
        margin: 0 auto 40px;
        border-radius: 6px;
      }

      .skeleton-contact-links {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
      }

      .skeleton-contact-link {
        width: 200px;
        height: 56px;
        border-radius: 12px;
      }

      /* Header Skeleton */
      .skeleton-header {
        background: rgba(10, 10, 15, 0.92);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(203, 213, 225, 0.22);
        padding: 16px 0;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
      }

      .skeleton-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      .skeleton-logo {
        width: 180px;
        height: 32px;
        border-radius: 6px;
      }

      .skeleton-nav-items {
        display: flex;
        gap: 24px;
        align-items: center;
      }

      .skeleton-nav-item {
        width: 80px;
        height: 20px;
        border-radius: 4px;
      }

      .skeleton-nav-btn {
        width: 120px;
        height: 40px;
        border-radius: 8px;
      }

      /* Footer Skeleton */
      .skeleton-footer {
        background: var(--ms-surface-container-lowest);
        border-top: 1px solid rgba(203, 213, 225, 0.22);
        padding: 80px 0 30px;
      }

      .skeleton-footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px;
      }

      .skeleton-footer-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1.5fr;
        gap: 48px;
        margin-bottom: 40px;
      }

      @media (max-width: 991px) {
        .skeleton-footer-grid {
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }
      }

      @media (max-width: 575px) {
        .skeleton-footer-grid {
          grid-template-columns: 1fr;
        }
      }

      .skeleton-footer-col-title {
        width: 100px;
        height: 20px;
        margin-bottom: 24px;
        border-radius: 4px;
      }

      .skeleton-footer-link {
        width: 80%;
        height: 16px;
        margin-bottom: 12px;
        border-radius: 4px;
      }

      .skeleton-footer-social {
        display: flex;
        gap: 12px;
        margin-top: 16px;
      }

      .skeleton-social-icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
      }

      /* ============================================
         ANIMATIONS
         ============================================ */
      @keyframes skeletonShimmerSlide {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      @keyframes skeletonFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes skeletonFadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      /* Transition when content loads */
      .skeleton-fade-out {
        animation: skeletonFadeOut 0.3s ease-out forwards;
      }

      /* Content fade in */
      .content-fade-in {
        animation: skeletonFadeIn 0.4s ease-out;
      }
    `;
  }

  /**
   * Get all skeleton templates
   */
  static getTemplates() {
    return {
      // Full page skeleton
      page: `
        <div class="skeleton-wrapper">
          <!-- Hero Section -->
          <section class="skeleton-hero">
            <div class="container">
              <div class="row align-items-center">
                <div class="col-lg-7">
                  <div class="skeleton-hero-content">
                    <div class="skeleton-item skeleton-badge animated"></div>
                    <div class="skeleton-item skeleton-title-lg animated"></div>
                    <div class="skeleton-item skeleton-title-lg short animated"></div>
                    <div class="skeleton-item skeleton-subtitle animated"></div>
                    <div class="skeleton-item skeleton-paragraph animated"></div>
                    <div class="skeleton-item skeleton-paragraph short animated"></div>
                    <div class="skeleton-pills">
                      <div class="skeleton-item skeleton-pill animated"></div>
                      <div class="skeleton-item skeleton-pill animated"></div>
                      <div class="skeleton-item skeleton-pill animated"></div>
                      <div class="skeleton-item skeleton-pill animated"></div>
                      <div class="skeleton-item skeleton-pill animated"></div>
                    </div>
                    <div class="skeleton-buttons">
                      <div class="skeleton-item skeleton-btn animated"></div>
                      <div class="skeleton-item skeleton-btn outline animated"></div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-5">
                  <div class="skeleton-avatar-wrapper">
                    <div class="skeleton-item skeleton-avatar animated"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Skills Section -->
          <section class="dev-section" style="padding: 100px 0;">
            <div class="container">
              <div class="skeleton-section-header">
                <div class="skeleton-item skeleton-section-badge animated"></div>
                <div class="skeleton-item skeleton-section-title animated"></div>
                <div class="skeleton-item skeleton-section-desc animated"></div>
              </div>
              <div class="skeleton-grid skeleton-grid-3">
                ${Array(3).fill(`
                  <div class="skeleton-card">
                    <div class="skeleton-item skeleton-icon animated"></div>
                    <div class="skeleton-item skeleton-title animated"></div>
                    <div class="skeleton-tags">
                      <div class="skeleton-item skeleton-tag animated"></div>
                      <div class="skeleton-item skeleton-tag animated"></div>
                      <div class="skeleton-item skeleton-tag animated"></div>
                      <div class="skeleton-item skeleton-tag animated"></div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>

          <!-- Experience Section -->
          <section class="dev-section" style="padding: 100px 0;">
            <div class="container">
              <div class="skeleton-section-header">
                <div class="skeleton-item skeleton-section-badge animated"></div>
                <div class="skeleton-item skeleton-section-title animated"></div>
                <div class="skeleton-item skeleton-section-desc animated"></div>
              </div>
              <div class="skeleton-timeline">
                ${Array(3).fill(`
                  <div class="skeleton-timeline-item">
                    <div class="skeleton-timeline-dot"></div>
                    <div class="skeleton-timeline-card">
                      <div class="skeleton-item skeleton-title animated"></div>
                      <div class="skeleton-item skeleton-text animated"></div>
                      <div class="skeleton-item skeleton-text w-90 animated"></div>
                      <div class="skeleton-item skeleton-text w-80 animated"></div>
                      <div class="skeleton-tags">
                        <div class="skeleton-item skeleton-tag animated"></div>
                        <div class="skeleton-item skeleton-tag animated"></div>
                        <div class="skeleton-item skeleton-tag animated"></div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>

          <!-- Contact Section -->
          <section class="dev-section" style="padding: 100px 0;">
            <div class="container">
              <div class="skeleton-contact">
                <div class="skeleton-item skeleton-contact-title animated"></div>
                <div class="skeleton-item skeleton-contact-desc animated"></div>
                <div class="skeleton-contact-links">
                  <div class="skeleton-item skeleton-contact-link animated"></div>
                  <div class="skeleton-item skeleton-contact-link animated"></div>
                  <div class="skeleton-item skeleton-contact-link animated"></div>
                </div>
              </div>
            </div>
          </section>
        </div>
      `,

      // Hero only
      hero: `
        <div class="skeleton-wrapper">
          <section class="skeleton-hero">
            <div class="container">
              <div class="row align-items-center">
                <div class="col-lg-7">
                  <div class="skeleton-hero-content">
                    <div class="skeleton-item skeleton-badge animated"></div>
                    <div class="skeleton-item skeleton-title-lg animated"></div>
                    <div class="skeleton-item skeleton-title-lg short animated"></div>
                    <div class="skeleton-item skeleton-subtitle animated"></div>
                    <div class="skeleton-item skeleton-paragraph animated"></div>
                    <div class="skeleton-item skeleton-paragraph short animated"></div>
                    <div class="skeleton-pills">
                      <div class="skeleton-item skeleton-pill animated"></div>
                      <div class="skeleton-item skeleton-pill animated"></div>
                      <div class="skeleton-item skeleton-pill animated"></div>
                    </div>
                    <div class="skeleton-buttons">
                      <div class="skeleton-item skeleton-btn animated"></div>
                      <div class="skeleton-item skeleton-btn outline animated"></div>
                    </div>
                  </div>
                </div>
                <div class="col-lg-5">
                  <div class="skeleton-avatar-wrapper">
                    <div class="skeleton-item skeleton-avatar animated"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      `,

      // Card grid
      cards: `
        <div class="skeleton-wrapper">
          <div class="container">
            <div class="skeleton-section-header">
              <div class="skeleton-item skeleton-section-badge animated"></div>
              <div class="skeleton-item skeleton-section-title animated"></div>
              <div class="skeleton-item skeleton-section-desc animated"></div>
            </div>
            <div class="skeleton-grid skeleton-grid-3">
              ${Array(3).fill(`
                <div class="skeleton-card">
                  <div class="skeleton-item skeleton-icon animated"></div>
                  <div class="skeleton-item skeleton-title animated"></div>
                  <div class="skeleton-item skeleton-text animated"></div>
                  <div class="skeleton-item skeleton-text w-80 animated"></div>
                  <div class="skeleton-tags">
                    <div class="skeleton-item skeleton-tag animated"></div>
                    <div class="skeleton-item skeleton-tag animated"></div>
                    <div class="skeleton-item skeleton-tag animated"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `,

      // Single card
      card: `
        <div class="skeleton-card">
          <div class="skeleton-item skeleton-icon animated"></div>
          <div class="skeleton-item skeleton-title animated"></div>
          <div class="skeleton-item skeleton-text animated"></div>
          <div class="skeleton-item skeleton-text w-90 animated"></div>
          <div class="skeleton-item skeleton-text w-80 animated"></div>
        </div>
      `,

      // Timeline
      timeline: `
        <div class="skeleton-wrapper">
          <div class="container">
            <div class="skeleton-section-header">
              <div class="skeleton-item skeleton-section-badge animated"></div>
              <div class="skeleton-item skeleton-section-title animated"></div>
              <div class="skeleton-item skeleton-section-desc animated"></div>
            </div>
            <div class="skeleton-timeline">
              ${Array(4).fill(`
                <div class="skeleton-timeline-item">
                  <div class="skeleton-timeline-dot"></div>
                  <div class="skeleton-timeline-card">
                    <div class="skeleton-item skeleton-title animated"></div>
                    <div class="skeleton-item skeleton-text animated"></div>
                    <div class="skeleton-item skeleton-text w-90 animated"></div>
                    <div class="skeleton-item skeleton-text w-80 animated"></div>
                    <div class="skeleton-tags">
                      <div class="skeleton-item skeleton-tag animated"></div>
                      <div class="skeleton-item skeleton-tag animated"></div>
                      <div class="skeleton-item skeleton-tag animated"></div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `,

      // Education grid
      education: `
        <div class="skeleton-wrapper">
          <div class="container">
            <div class="skeleton-section-header">
              <div class="skeleton-item skeleton-section-badge animated"></div>
              <div class="skeleton-item skeleton-section-title animated"></div>
              <div class="skeleton-item skeleton-section-desc animated"></div>
            </div>
            <div class="skeleton-grid">
              ${Array(5).fill(`
                <div class="skeleton-edu-card">
                  <div class="skeleton-item skeleton-edu-icon animated"></div>
                  <div class="skeleton-item skeleton-edu-title animated"></div>
                  <div class="skeleton-item skeleton-edu-subtitle animated"></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `,

      // Contact section
      contact: `
        <div class="skeleton-wrapper">
          <div class="container">
            <div class="skeleton-contact">
              <div class="skeleton-item skeleton-contact-title animated"></div>
              <div class="skeleton-item skeleton-contact-desc animated"></div>
              <div class="skeleton-contact-links">
                <div class="skeleton-item skeleton-contact-link animated"></div>
                <div class="skeleton-item skeleton-contact-link animated"></div>
                <div class="skeleton-item skeleton-contact-link animated"></div>
              </div>
            </div>
          </div>
        </div>
      `,

      // Header
      header: `
        <div class="skeleton-header">
          <div class="skeleton-nav">
            <div class="skeleton-item skeleton-logo animated"></div>
            <div class="skeleton-nav-items">
              <div class="skeleton-item skeleton-nav-item animated"></div>
              <div class="skeleton-item skeleton-nav-item animated"></div>
              <div class="skeleton-item skeleton-nav-item animated"></div>
              <div class="skeleton-item skeleton-nav-item animated"></div>
              <div class="skeleton-item skeleton-nav-btn animated"></div>
            </div>
          </div>
        </div>
      `,

      // Footer
      footer: `
        <div class="skeleton-footer">
          <div class="skeleton-footer-content">
            <div class="skeleton-footer-grid">
              <div>
                <div class="skeleton-item skeleton-logo animated" style="margin-bottom: 16px;"></div>
                <div class="skeleton-item skeleton-text animated"></div>
                <div class="skeleton-item skeleton-text w-80 animated"></div>
                <div class="skeleton-footer-social">
                  <div class="skeleton-item skeleton-social-icon animated"></div>
                  <div class="skeleton-item skeleton-social-icon animated"></div>
                  <div class="skeleton-item skeleton-social-icon animated"></div>
                </div>
              </div>
              <div>
                <div class="skeleton-item skeleton-footer-col-title animated"></div>
                <div class="skeleton-item skeleton-footer-link animated"></div>
                <div class="skeleton-item skeleton-footer-link animated"></div>
                <div class="skeleton-item skeleton-footer-link animated"></div>
              </div>
              <div>
                <div class="skeleton-item skeleton-footer-col-title animated"></div>
                <div class="skeleton-item skeleton-footer-link animated"></div>
                <div class="skeleton-item skeleton-footer-link animated"></div>
                <div class="skeleton-item skeleton-footer-link animated"></div>
              </div>
              <div>
                <div class="skeleton-item skeleton-footer-col-title animated"></div>
                <div class="skeleton-item skeleton-footer-link animated"></div>
                <div class="skeleton-item skeleton-footer-link animated"></div>
              </div>
            </div>
          </div>
        </div>
      `,

      // Simple text lines
      text: `
        <div class="skeleton-wrapper">
          <div class="skeleton-item skeleton-text animated"></div>
          <div class="skeleton-item skeleton-text w-90 animated"></div>
          <div class="skeleton-item skeleton-text w-80 animated"></div>
        </div>
      `,

      // Image placeholder
      image: `
        <div class="skeleton-item skeleton-avatar animated" style="width: 100%; height: 200px;"></div>
      `,

      // Button
      button: `
        <div class="skeleton-item skeleton-btn animated"></div>
      `
    };
  }

  /**
   * Render the skeleton
   * @param {HTMLElement} element - Target element
   */
  render(element) {
    const { type = 'page', count = 1, animated = true } = this.state;
    const template = this.templates[type] || this.templates.page;

    // Generate template based on count
    let content = '';
    if (type === 'card' || type === 'text' || type === 'button' || type === 'image') {
      content = Array(count).fill(template).join('');
    } else {
      content = template;
    }

    // Apply animation class based on state
    if (!animated) {
      content = content.replace(/animated/g, '');
    }

    this.template = content;

    // If element is provided, render directly to it
    if (element) {
      // Add styles if not already added
      if (!document.getElementById('skeleton-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'skeleton-styles';
        styleElement.textContent = this.styles;
        document.head.appendChild(styleElement);
      }
      element.innerHTML = this.template;
    } else {
      super.render();
    }
  }

  /**
   * Static method to show skeleton in an element
   * @param {HTMLElement|string} target - Target element or selector
   * @param {string} type - Type of skeleton
   * @param {Object} options - Additional options
   */
  static show(target, type = 'page', options = {}) {
    const element = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (!element) return;

    const skeleton = new Skeleton({
      type,
      count: options.count || 1,
      animated: options.animated !== false
    });

    skeleton.render(element);
    return skeleton;
  }

  /**
   * Static method to hide skeleton with smooth transition
   * @param {HTMLElement|string} target - Target element or selector
   * @param {string} newContent - New content to replace skeleton
   * @param {Function} callback - Callback after transition
   */
  static hide(target, newContent = '', callback) {
    const element = typeof target === 'string'
      ? document.querySelector(target)
      : target;

    if (!element) return;

    const wrapper = element.querySelector('.skeleton-wrapper');
    if (wrapper) {
      wrapper.classList.add('skeleton-fade-out');

      setTimeout(() => {
        element.innerHTML = newContent;
        element.classList.add('content-fade-in');

        // Remove animation class after it completes
        setTimeout(() => {
          element.classList.remove('content-fade-in');
          if (callback) callback();
        }, 400);
      }, 300);
    } else {
      element.innerHTML = newContent;
      if (callback) callback();
    }
  }
}

// Register the component when core is ready
function registerSkeletonWhenCoreReady() {
  if (window.core && typeof window.core.registerComponent === 'function') {
    Skeleton.register('skeleton');
    // Make Skeleton globally available
    window.Skeleton = Skeleton;
  } else {
    setTimeout(registerSkeletonWhenCoreReady, 50);
  }
}
registerSkeletonWhenCoreReady();