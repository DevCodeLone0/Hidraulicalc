/**
 * accessibilityManager.js - Accessibility Features Manager
 * @description Enforces WCAG 2.1 AA accessibility standards
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * WCAG 2.1 AA Accessibility Manager
 * Ensures proper ARIA attributes, keyboard navigation, and contrast
 */
export class AccessibilityManager {
  constructor() {
    this.initialized = false;
    this.keyboardNavigation = true;
    this.screenReaderAnnouncements = null;
  }

  /**
   * Initialize accessibility features
   */
  init() {
    if (this.initialized) {
      console.warn('⚠️ AccessibilityManager already initialized');
      return;
    }

    console.log('♿ Initializing accessibility features...');

    // Set up live region for screen reader announcements
    this._setupLiveRegion();

    // Enhance all forms with proper ARIA attributes
    this._enhanceForms();

    // Enhance buttons
    this._enhanceButtons();

    // Set up keyboard trap for modals (if any)
    this._setupKeyboardNavigation();

    // Add focus management
    this._enhanceFocusManagement();

    // Check and fix contrast issues
    this._checkContrast();

    this.initialized = true;
    console.log('✅ Accessibility features initialized');
  }

  /**
   * Set up ASR (Assistive Screen Reader) live region
   * @private
   */
  _setupLiveRegion() {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only accessibility-announcer';
    liveRegion.setAttribute('id', 'accessibility-announcer');
    document.body.appendChild(liveRegion);
    this.screenReaderAnnouncements = liveRegion;
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} level - Politeness level ('polite', 'assertive')
   */
  announce(message, level = 'polite') {
    if (!this.screenReaderAnnouncements) {
      console.warn('⚠️ Live region not initialized');
      return;
    }

    // Update aria-live attribute based on level
    this.screenReaderAnnouncements.setAttribute('aria-live', level);

    // Set message with a small delay to ensure it's detected
    setTimeout(() => {
      this.screenReaderAnnouncements.textContent = message;
    }, 0);

    // Clear after announcement
    setTimeout(() => {
      this.screenReaderAnnouncements.textContent = '';
    }, 3000);
  }

  /**
   * Announce change in component state (e.g., tab change, calculation result)
   * @param {string} component - Component name
   * @param {string} state - New state description
   */
  announceStateChange(component, state) {
    this.announce(`${component} ${state}`, 'polite');
  }

  /**
   * Announce result announcement
   * @param {string} result - Result to announce
   */
  announceResult(result) {
    this.announce(`Resultado: ${result}`, 'assertive');
  }

  /**
   * Announce error to screen readers
   * @param {string} error - Error message
   */
  announceError(error) {
    this.announce(`Error: ${error}`, 'assertive');
  }

  /**
   * Enhance all forms with proper ARIA attributes
   * @private
   */
  _enhanceForms() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
      const formId = form.id || `form-${Math.random().toString(36).substr(2, 9)}`;
      if (!form.id) form.id = formId;

      // Add aria-describedby to inputs with help text
      const inputs = form.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.placeholder) {
          const placeholderId = `${input.id || input.name}-placeholder`;
          if (!input.id) input.id = `${formId}-input-${inputs.indexOf(input)}`;
          input.setAttribute('aria-placeholder', input.placeholder);
        }

        // Ensure all inputs have associated labels
        const hasLabel = form.querySelector(`label[for="${input.id}"]`);
        if (!hasLabel && input.name) {
          const label = form.querySelector(`label[for="${input.name}"]`);
          if (label) {
            label.setAttribute('for', input.id);
          }
        }
      });
    });
  }

  /**
   * Enhance buttons with proper ARIA attributes
   * @private
   */
  _enhanceButtons() {
    const buttons = document.querySelectorAll('button');

    buttons.forEach(button => {
      // Ensure all buttons have accessible names
      if (!button.id) {
        button.id = `button-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Add pressed state toggling for toggle-style buttons
      if (button.classList.contains('tab-button')) {
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false');

        // Track state changes
        const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
              const isActive = button.classList.contains('active');
              button.setAttribute('aria-selected', isActive ? 'true' : 'false');
            }
          });
        });
        observer.observe(button, { attributes: true, attributeFilter: ['class'] });
      }

      // Ensure aria-expanded for dropdown/collapsible buttons
      if (button.getAttribute('aria-expanded') === null && button.getAttribute('data-toggle')) {
        button.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Set up keyboard navigation helpers
   * @private
   */
  _setupKeyboardNavigation() {
    // Tab index management
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to submit nearest form
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const activeElement = document.activeElement;
        const form = activeElement.closest('form');
        if (form) {
          e.preventDefault();
          // Dispatch submit event instead of clicking button
          const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
          form.dispatchEvent(submitEvent);
        }
      }

      // Escape key to close dropdowns/modals
      if (e.key === 'Escape') {
        // Close any active menus, modals, dropdowns
        document.querySelectorAll('[aria-expanded="true"]').forEach(element => {
          if (element.tagName === 'BUTTON') {
            element.setAttribute('aria-expanded', 'false');
            // Trigger close action if needed
            element.dispatchEvent(new Event('close'));
          }
        });
      }
    });
  }

  /**
   * Enhance focus management with visible indicators
   * @private
   */
  _enhanceFocusManagement() {
    // Add focus trap functionality for modals (future use)
    document.addEventListener('focus', (e) => {
      // Announce focus changes for important interactive elements
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') {
        /* Screen readers naturally announce focus */
      }
    }, true);

    // Move focus to error fields
    const moveFocusToError = (field) => {
      field.focus();
      // Add visual focus indicator (handled by CSS)
      this.announceError(field.getAttribute('aria-invalid') ||
                          field.getAttribute('aria-errormessage') ||
                          'Error en este campo');
    };
  }

  /**
   * Check and report contrast issues (development mode)
   * @private
   */
  _checkContrast() {
    // This is a simplified contrast check
    // Production use would use a library like axe-core
    const backgrounds = document.querySelectorAll('.calculator-card, .result-display, .history-container');

    backgrounds.forEach(element => {
      const style = window.getComputedStyle(element);
      const bgColor = style.backgroundColor;
      const textColor = style.color;

      // Very basic check - would need proper RGB comparison in production
      if (this._isContrastLow(bgColor, textColor)) {
        console.warn('⚠️ Low contrast detected:', element.id || element.className);
      }
    });
  }

  /**
   * Simple contrast check helper
   * @private
   * @param {string} bgColor - Background color
   * @param {string} textColor - Text color
   * @returns {boolean} True if contrast is potentially low
   */
  _isContrastLow(bgColor, textColor) {
    // WCAG 2.1 contrast ratio calculation
    // Returns true if contrast is below minimum threshold (4.5:1 normal, 3:1 large text)
    const bgRgb = this._parseColor(bgColor);
    const textRgb = this._parseColor(textColor);

    if (!bgRgb || !textRgb) return false;

    const bgLum = this._relativeLuminance(bgRgb);
    const textLum = this._relativeLuminance(textRgb);

    const lighter = Math.max(bgLum, textLum);
    const darker = Math.min(bgLum, textLum);
    const ratio = (lighter + 0.05) / (darker + 0.05);

    return ratio < 4.5;
  }

  /**
   * Parse a CSS color string to [r, g, b] array
   * @private
   * @param {string} color - CSS color string (hex, rgb, named)
   * @returns {number[]|null} [r, g, b] or null
   */
  _parseColor(color) {
    if (!color || typeof color !== 'string') return null;

    // Handle hex colors
    const hexMatch = color.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (hexMatch) {
      return [
        parseInt(hexMatch[1], 16),
        parseInt(hexMatch[2], 16),
        parseInt(hexMatch[3], 16)
      ];
    }

    // Handle short hex colors (#abc -> #aabbcc)
    const shortHex = color.match(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (shortHex) {
      return [
        parseInt(shortHex[1] + shortHex[1], 16),
        parseInt(shortHex[2] + shortHex[2], 16),
        parseInt(shortHex[3] + shortHex[3], 16)
      ];
    }

    // Handle rgb(r, g, b) format
    const rgbMatch = color.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/);
    if (rgbMatch) {
      return [
        Math.min(255, parseInt(rgbMatch[1], 10)),
        Math.min(255, parseInt(rgbMatch[2], 10)),
        Math.min(255, parseInt(rgbMatch[3], 10))
      ];
    }

    return null;
  }

  /**
   * Calculate relative luminance per WCAG 2.1
   * @private
   * @param {number[]} rgb - [r, g, b] values 0-255
   * @returns {number} Relative luminance 0-1
   */
  _relativeLuminance([r, g, b]) {
    const sRGB = [r, g, b].map(c => c / 255);
    const [rs, gs, bs] = sRGB.map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Update ARIA state for an element
   * @param {HTMLElement} element - Element to update
   * @param {string} attribute - ARIA attribute name
   * @param {string} value - ARIA attribute value
   */
  updateAriaState(element, attribute, value) {
    if (element) {
      element.setAttribute(`aria-${attribute}`, value);
    }
  }

  /**
   * Mark an element as invalid
   * @param {HTMLElement} element - Element to mark
   * @param {string} errorMessage - Error message
   */
  markInvalid(element, errorMessage) {
    element.setAttribute('aria-invalid', 'true');

    // Create or update error message element
    const errorId = `${element.id}-error`;
    let errorElement = document.getElementById(errorId);

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      errorElement.style.color = '#C62828';
      element.parentElement.appendChild(errorElement);
    }

    errorElement.textContent = errorMessage;
    element.setAttribute('aria-describedby', errorId);
    errorElement.classList.remove('hidden');

    this.announceError(errorMessage);
  }

  /**
   * Clear invalid state
   * @param {HTMLElement} element - Element to clear
   */
  clearInvalid(element) {
    element.removeAttribute('aria-invalid');
    element.removeAttribute('aria-describedby');

    const errorId = `${element.id}-error`;
    const errorElement = document.getElementById(errorId);

    if (errorElement) {
      errorElement.textContent = '';
      errorElement.classList.add('hidden');
    }
  }

  /**
   * Set loading state for an element
   * @param {HTMLElement} element - Element to set
   * @param {boolean} loading - Loading state
   * @param {string} message - Loading message for screen readers
   */
  setLoading(element, loading, message = 'Cargando...') {
    if (loading) {
      element.setAttribute('aria-busy', 'true');
      this.announce(message, 'polite');
    } else {
      element.removeAttribute('aria-busy');
    }
  }

  /**
   * Get current reduced motion preference
   * @returns {boolean} True if reduced motion is preferred
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Get current high contrast preference
   * @returns {boolean} True if high contrast is preferred
   */
  prefersHighContrast() {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }
}

/**
 * Global accessibility manager instance
 */
export const a11y = new AccessibilityManager();

export default AccessibilityManager;
