/**
 * toastManager.js - Toast Notification System
 * @description Wrapper around toastify-js for user notifications
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Toast notification types
 */
const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

/**
 * Toast Manager
 * Provides a consistent interface for toast notifications
 */
export class ToastManager {
  constructor(options = {}) {
    this.defaults = {
      duration: 3000,
      gravity: 'top',
      position: 'right',
      stopOnFocus: true,
      style: {
        background: 'linear-gradient(to right, #8B4513, #A0522D)',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(62, 39, 35, 0.2)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.9rem'
      },
      className: 'toast',
      ...options
    };

    this.initialized = false;
  }

/**
     * Initialize the toast manager
     */
    init() {
        if (this.initialized) {
            return;
        }

        if (typeof Toastify === 'undefined') {
            this.useConsoleFallback = true;
        } else {
            this.useConsoleFallback = false;
        }

        this.initialized = true;
    }

  /**
   * Show a success toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Additional toast options
   */
  success(message, options = {}) {
    const config = {
      ...this.defaults,
      ...options,
      text: message,
      duration: options.duration || 3000,
      style: {
        ...this.defaults.style,
        background: 'linear-gradient(135deg, #2E8B57 0%, #388E3C 100%)'
      },
      className: 'toast success'
    };

    this._show(config);
  }

  /**
   * Show an error toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Additional toast options
   */
  error(message, options = {}) {
    const config = {
      ...this.defaults,
      ...options,
      text: message,
      duration: options.duration || 5000,
      style: {
        ...this.defaults.style,
        background: 'linear-gradient(135deg, #C62828 0%, #D32F2F 100%)'
      },
      className: 'toast error'
    };

    this._show(config);
  }

  /**
   * Show a warning toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Additional toast options
   */
  warning(message, options = {}) {
    const config = {
      ...this.defaults,
      ...options,
      text: message,
      duration: options.duration || 4000,
      style: {
        ...this.defaults.style,
        background: 'linear-gradient(135deg, #F57F17 0%, #FFA000 100%)'
      },
      className: 'toast warning'
    };

    this._show(config);
  }

  /**
   * Show an info toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Additional toast options
   */
  info(message, options = {}) {
    const config = {
      ...this.defaults,
      ...options,
      text: message,
      duration: options.duration || 3000,
      style: {
        ...this.defaults.style,
        background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)'
      },
      className: 'toast info'
    };

    this._show(config);
  }

  /**
   * Show a custom toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Custom toast options
   */
  custom(message, options = {}) {
    const config = {
      ...this.defaults,
      ...options,
      text: message,
      className: 'toast'
    };

    this._show(config);
  }

  /**
   * Internal method to show toast
   * @private
   * @param {Object} config - Toast configuration
   */
  _show(config) {
    if (this.useConsoleFallback) {
      console.log(`🔔 [Toast] ${config.text}`);
      return;
    }

    try {
      Toastify(config).showToast();
    } catch (error) {
      console.error('❌ ToastManager error:', error);
      console.log(`🔔 [Toast] ${config.text}`);
    }
  }

  /**
   * Show a toast for auto-correction
   * @param {string} original - Original input
   * @param {string} corrected - Corrected input
   * @param {string} reason - Reason for correction
   */
  correction(original, corrected, reason) {
    const message = `💡 Corregido: "${original}" → "${corrected}"${reason ? ` (${reason})` : ''}`;
    this.info(message, { duration: 4000 });
  }

  /**
   * Show a toast for calculation result
   * @param {string} calculator - Calculator name
   * @param {string|number} result - Result value
   */
  calculation(calculator, result) {
    const message = `✅ ${calculator}: ${result}`;
    this.success(message);
  }

  /**
   * Show a toast for error
   * @param {string} error - Error message
   */
  handleError(error) {
    console.error('Error:', error);
    this.error(`❌ ${error}`);
  }

  /**
   * Clear all active toasts
   */
  clearAll() {
    if (!this.useConsoleFallback && typeof Toastify !== 'undefined') {
      try {
        if (typeof Toastify.closeAll === 'function') {
          Toastify.closeAll();
        } else if (typeof Toastify.dismiss === 'function') {
          Toastify.dismiss();
        }
      } catch (e) {
        // Toastify API not available for clearing all toasts
      }
    }
  }
}

export default ToastManager;
