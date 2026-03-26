/**
 * domUtils.js - DOM Manipulation Utilities
 * @description Helpful utilities for DOM manipulation and queries
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * DOM Utilities Class
 * Provides convenient methods for DOM operations
 */
export class DomUtils {
  /**
   * Get element by ID with null check
   * @param {string} id - Element ID
   * @returns {HTMLElement|null} Element or null
   */
  $(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`⚠️ Element not found: #${id}`);
    }
    return element;
  }

  /**
   * Get elements by query selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element (default: document)
   * @returns {NodeList} Matching elements
   */
  $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
  }

  /**
   * Get first element matching selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element (default: document)
   * @returns {HTMLElement|null} Element or null
   */
  $first(selector, parent = document) {
    return parent.querySelector(selector);
  }

  /**
   * Get element by data attribute value
   * @param {string} dataAttr - Data attribute name (without 'data-')
   * @param {string} value - Data attribute value
   * @returns {HTMLElement|null} Element or null
   */
  $data(dataAttr, value) {
    return document.querySelector(`[data-${dataAttr}="${value}"]`);
  }

  /**
   * Get all elements by data attribute value
   * @param {string} dataAttr - Data attribute name (without 'data-')
   * @param {string} value - Data attribute value
   * @returns {NodeList} Matching elements
   */
  $$data(dataAttr, value) {
    return document.querySelectorAll(`[data-${dataAttr}="${value}"]`);
  }

  /**
   * Get form data as object
   * @param {HTMLFormElement} form - Form element
   * @returns {Object} Form data object
   */
  getFormData(form) {
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  /**
   * Set form data from object
   * @param {HTMLFormElement} form - Form element
   * @param {Object} data - Data object
   */
  setFormData(form, data) {
    Object.entries(data).forEach(([key, value]) => {
      const field = form.elements[key];
      if (field) {
        field.value = value;
      }
    });
  }

  /**
   * Reset form and clear custom error states
   * @param {HTMLFormElement} form - Form element
   */
  resetForm(form) {
    form.reset();

    // Clear custom error classes
    const invalidFields = form.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => {
      field.classList.remove('is-invalid');
    });

    // Clear error messages
    const errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(msg => {
      msg.textContent = '';
      msg.classList.add('hidden');
    });
  }

  /**
   * Show error message for a field
   * @param {HTMLInputElement|HTMLElement} field - Input element
   * @param {string} message - Error message
   */
  showFieldError(field, message) {
    field.classList.add('is-invalid');

    // Find or create error message element
    let errorElement = field.parentElement.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('small');
      errorElement.classList.add('error-message');
      errorElement.style.color = '#C62828';
      errorElement.style.display = 'block';
      errorElement.style.marginTop = '4px';
      field.after(errorElement);
    }

    errorElement.textContent = message;
    errorElement.classList.remove('hidden');

    // Shake animation
    this.animateError(field);
  }

  /**
   * Clear error for a field
   * @param {HTMLInputElement|HTMLElement} field - Input element
   */
  clearFieldError(field) {
    field.classList.remove('is-invalid');

    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.add('hidden');
    }
  }

  /**
   * Animate element for error indication
   * @param {HTMLElement} element - Element to animate
   */
  animateError(element) {
    if (typeof anime !== 'undefined') {
      anime({
        targets: element,
        translateX: [
          { value: -5, duration: 50 },
          { value: 5, duration: 50 },
          { value: -5, duration: 50 },
          { value: 5, duration: 50 },
          { value: 0, duration: 50 }
        ],
        easing: 'linear',
        duration: 200
      });
    }
  }

  /**
   * Show or hide element
   * @param {HTMLElement} element - Element to toggle
   * @param {boolean} show - True to show, false to hide
   */
  toggle(element, show) {
    if (!element) return;

    if (show) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  }

  /**
   * Toggle element visibility
   * @param {HTMLElement} element - Element to toggle
   */
  toggleVisibility(element) {
    if (!element) return;

    if (element.classList.contains('hidden')) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  }

  /**
   * Animate element entrance
   * @param {HTMLElement} element - Element to animate
   * @param {string} animationType - Animation type (fade, slide, scale)
   */
  animateIn(element, animationType = 'fade') {
    if (!element) return;

    element.classList.remove('hidden');

    if (typeof anime !== 'undefined') {
      const animations = {
        fade: { opacity: [0, 1] },
        slide: {
          translateY: [20, 0],
          opacity: [0, 1]
        },
        scale: {
          scale: [0.8, 1],
          opacity: [0, 1]
        }
      };

      anime({
        targets: element,
        ...animations[animationType],
        duration: 300,
        easing: 'easeOutQuad'
      });
    }
  }

  /**
   * Smooth scroll to element
   * @param {HTMLElement} element - Target element
   * @param {Object} options - Scroll options
   */
  scrollTo(element, options = {}) {
    if (!element) return;

    const defaultOptions = {
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
      ...options
    };

    element.scrollIntoView(defaultOptions);
  }

  /**
   * Focus element with animation
   * @param {HTMLElement} element - Element to focus
   */
  focusWithAnimation(element) {
    if (!element) return;

    element.focus();

    if (typeof anime !== 'undefined') {
      anime({
        targets: element,
        boxShadow: [
          { value: '0 0 0 0 rgba(46, 139, 87, 0.4)', duration: 0 },
          { value: '0 0 0 10px rgba(46, 139, 87, 0)', duration: 500 }
        ],
        easing: 'easeOutQuad'
      });
    }
  }

  /**
   * Create tooltip element
   * @param {HTMLElement} target - Target element
   * @param {string} content - Tooltip content
   * @param {Object} options - Tooltip options
   * @returns {HTMLElement} Tooltip element
   */
  createTooltip(target, content, options = {}) {
    const tooltip = document.createElement('div');
    tooltip.className = 'graph-tooltip';
    tooltip.textContent = content;

    const defaultOptions = {
      position: 'absolute',
      zIndex: 100,
      padding: '8px 12px',
      background: '#3E2723',
      color: '#FAF0E6',
      borderRadius: '8px',
      fontSize: '0.875rem',
      fontFamily: "'Courier New', monospace",
      boxShadow: '0 4px 12px rgba(62, 39, 35, 0.3)',
      pointerEvents: 'none',
      ...options
    };

    Object.assign(tooltip.style, defaultOptions);
    document.body.appendChild(tooltip);

    return tooltip;
  }

  /**
   * Debounce function
   * @param {Function} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, delay = 300) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  /**
   * Throttle function
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit = 300) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }
}

/**
 * Instance of DomUtils for global use
 */
export const dom = new DomUtils();

export default DomUtils;
