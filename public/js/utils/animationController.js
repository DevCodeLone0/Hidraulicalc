/**
 * animationController.js - Animation System Controller
 * @description Manages anime.js/GSAP animations with fallback support
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Animation Controller
 * Provides a unified interface for animations using anime.js with GSAP fallback
 */
export class AnimationController {
  constructor(options = {}) {
    this.enabled = true;
    this.useGSAP = false;
    this.reducedMotion = false;
    this.animations = new Map();

    // Check for reduced motion preference
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect available animation libraries
    this._detectLibraries(options);
  }

  /**
   * Detect and initialize animation libraries
   * @private
   */
  _detectLibraries(options) {
    // Check if anime.js is available
    if (typeof anime !== 'undefined') {
      this.library = 'anime';
      console.log('🎬 Using anime.js for animations');
    }
    // Fallback to GSAP if anime.js not available
    else if (typeof gsap !== 'undefined') {
      this.library = 'gsap';
      this.useGSAP = true;
      console.log('🎬 Using GSAP for animations');
    }
    // No animation library available
    else {
      this.enabled = false;
      console.warn('⚠️ No animation library detected - animations disabled');
    }

    // Respect reduced motion preference
    if (this.reducedMotion) {
      this.enabled = false;
      console.log('🎬 Reduced motion preferred - animations disabled');
    }

    // Override settings from options
    this.enabled = options.enabled !== undefined ? options.enabled : this.enabled;
  }

  /**
   * Fade in animation
   * @param {HTMLElement|string} target - Target element(s)
   * @param {Object} options - Animation options
   */
  fadeIn(target, options = {}) {
    if (!this.enabled) return;

    const defaults = {
      duration: 300,
      easing: 'easeOutQuad',
      opacity: [0, 1],
      ...options
    };

    if (this.library === 'anime') {
      const animeFn = anime({
        targets: target,
        ...defaults
      });
      this._registerAnimation('fadeIn', animeFn);
      return animeFn;
    } else if (this.useGSAP) {
      gsap.to(target, {
        duration: defaults.duration / 1000,
        ease: defaults.easing,
        opacity: 1
      });
    }
  }

  /**
   * Fade out animation
   * @param {HTMLElement|string} target - Target element(s)
   * @param {Object} options - Animation options
   */
  fadeOut(target, options = {}) {
    if (!this.enabled) return;

    const defaults = {
      duration: 300,
      easing: 'easeOutQuad',
      opacity: [1, 0],
      ...options
    };

    if (this.library === 'anime') {
      const animeFn = anime({
        targets: target,
        ...defaults
      });
      this._registerAnimation('fadeOut', animeFn);
      return animeFn;
    } else if (this.useGSAP) {
      gsap.to(target, {
        duration: defaults.duration / 1000,
        ease: defaults.easing,
        opacity: 0
      });
    }
  }

  /**
   * Slide in animation
   * @param {HTMLElement|string} target - Target element(s)
   * @param {Object} options - Animation options
   */
  slideIn(target, options = {}) {
    if (!this.enabled) return;

    const defaults = {
      duration: 400,
      easing: 'easeOutCubic',
      translateY: [30, 0],
      opacity: [0, 1],
      ...options
    };

    if (this.library === 'anime') {
      const animeFn = anime({
        targets: target,
        ...defaults
      });
      this._registerAnimation('slideIn', animeFn);
      return animeFn;
    } else if (this.useGSAP) {
      gsap.fromTo(target,
        { y: 30, opacity: 0 },
        { duration: defaults.duration / 1000, ease: defaults.easing, y: 0, opacity: 1 }
      );
    }
  }

  /**
   * Scale in animation
   * @param {HTMLElement|string} target - Target element(s)
   * @param {Object} options - Animation options
   */
  scaleIn(target, options = {}) {
    if (!this.enabled) return;

    const defaults = {
      duration: 300,
      easing: 'easeOutBack',
      scale: [0.8, 1],
      opacity: [0, 1],
      ...options
    };

    if (this.library === 'anime') {
      const animeFn = anime({
        targets: target,
        ...defaults
      });
      this._registerAnimation('scaleIn', animeFn);
      return animeFn;
    } else if (this.useGSAP) {
      gsap.fromTo(target,
        { scale: 0.8, opacity: 0 },
        { duration: defaults.duration / 1000, ease: 'back.out(1.7)', scale: 1, opacity: 1 }
      );
    }
  }

  /**
   * Button hover animation
   * @param {HTMLElement} target - Button element
   * @param {Object} options - Animation options
   */
  buttonHover(target, options = {}) {
    if (!this.enabled) {
      // Apply simple CSS-like scale
      target.style.transform = 'scale(1.05)';
    }

    const defaults = {
      duration: 300,
      easing: 'easeOutQuad',
      scale: [1, 1.05],
      ...options
    };

    if (this.library === 'anime') {
      const animeFn = anime({
        targets: target,
        ...defaults
      });
      return animeFn;
    } else if (this.useGSAP) {
      gsap.to(target, {
        duration: defaults.duration / 1000,
        ease: defaults.easing,
        scale: 1.05
      });
    }
  }

  /**
   * Reset button animation
   * @param {HTMLElement} target - Button element
   * @param {Object} options - Animation options
   */
  buttonReset(target, options = {}) {
    if (!this.enabled) {
      target.style.transform = 'scale(1)';
    }

    const defaults = {
      duration: 200,
      easing: 'easeOutQuad',
      scale: [1.05, 1],
      ...options
    };

    if (this.library === 'anime') {
      return anime({
        targets: target,
        ...defaults
      });
    } else if (this.useGSAP) {
      gsap.to(target, {
        duration: defaults.duration / 1000,
        ease: defaults.easing,
        scale: 1
      });
    }
  }

  /**
   * Graph drawing animation (progressive line drawing)
   * @param {HTMLElement} target - Graph container
   * @param {number} duration - Duration in milliseconds
   * @param {Object} options - Animation options
   */
  drawGraph(target, duration = 600, options = {}) {
    if (!this.enabled) return;

    const defaults = {
      easing: 'easeInOutSine',
      ...options
    };

    if (this.library === 'anime') {
      // Animate stroke-dashoffset for SVG paths
      const paths = target.querySelectorAll('path');
      paths.forEach(path => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        anime({
          targets: path,
          strokeDashoffset: [length, 0],
          duration,
          easing: defaults.easing
        });
      });

      // Fade in area fill
      const area = target.querySelector('.function-plot-graph-area');
      if (area) {
        anime({
          targets: area,
          opacity: [0, 0.3],
          duration: duration * 0.7,
          easing: 'easeOutQuad',
          delay: duration * 0.3
        });
      }
    }
  }

  /**
   * Tab transition animation
   * @param {HTMLElement} target - Tab panel element
   * @param {boolean} show - True for showing, false for hiding
   */
  tabTransition(target, show) {
    if (!this.enabled) {
      target.classList.toggle('hidden', !show);
      return;
    }

    if (show) {
      target.classList.remove('hidden');
      this.slideIn(target, { duration: 300 });
    } else {
      this.fadeOut(target, {
        duration: 200,
        complete: () => {
          target.classList.add('hidden');
        }
      });
    }
  }

  /**
   * Error shake animation
   * @param {HTMLElement} target - Target element
   */
  shake(target) {
    if (this.reducedMotion) return;

    if (this.library === 'anime') {
      return anime({
        targets: target,
        translateX: [
          { value: -5, duration: 50 },
          { value: 5, duration: 50 },
          { value: -5, duration: 50 },
          { value: 5, duration: 50 },
          { value: 0, duration: 50 }
        ],
        easing: 'linear'
      });
    } else if (this.useGSAP) {
      gsap.to(target, {
        x: -5,
        duration: 0.05,
        yoyo: true,
        repeat: 5,
        repeatDelay: 0.05,
        onComplete: () => {
          gsap.set(target, { x: 0 });
        }
      });
    }
  }

  /**
   * Scroll indicator animation
   * @param {HTMLElement} target - Scroll indicator element
   */
  scrollBounce(target) {
    if (this.reducedMotion) return;

    if (this.library === 'anime') {
      return anime({
        targets: target,
        translateY: [0, 10, 0],
        duration: 1500,
        easing: 'easeInOutSine',
        loop: true
      });
    } else if (this.useGSAP) {
      gsap.to(target, {
        y: 10,
        duration: 0.75,
        yoyo: true,
        repeat: -1,
        ease: 'power1.inOut'
      });
    }
  }

  /**
   * Register an animation for management
   * @private
   * @param {string} type - Animation type
   * @param {*} animation - Animation object
   */
  _registerAnimation(type, animation) {
    if (animation && animation.play) {
      const id = `${type}_${Date.now()}`;
      this.animations.set(id, animation);

      if (typeof animation.then === 'function') {
        animation.then(() => {
          this.animations.delete(id);
        });
      } else if (typeof animation.finished !== 'undefined' && typeof animation.finished.then === 'function') {
        animation.finished.then(() => {
          this.animations.delete(id);
        });
      } else {
        animation.complete = () => {
          this.animations.delete(id);
        };
      }
    }
  }

  /**
   * Pause all running animations
   */
  pauseAll() {
    this.animations.forEach(animation => {
      if (animation && animation.pause) {
        animation.pause();
      }
    });
  }

  /**
   * Resume all paused animations
   */
  resumeAll() {
    this.animations.forEach(animation => {
      if (animation && animation.play) {
        animation.play();
      }
    });
  }

  /**
   * Cancel all running animations
   */
  cancelAll() {
    this.animations.forEach(animation => {
      if (animation && animation.seek && animation.pause) {
        animation.pause();
        animation.seek(0);
      }
    });
    this.animations.clear();
  }

  /**
   * Update reduced motion preference
   */
  updateMotionPreference() {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.enabled = !this.reducedMotion;

    if (this.reducedMotion) {
      this.cancelAll();
    }
  }
}

/**
 * Global animation controller instance
 */
export const animations = new AnimationController();

// Listen for changes in motion preference
if (window.matchMedia) {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', () => {
    animations.updateMotionPreference();
  });
}

export default AnimationController;
