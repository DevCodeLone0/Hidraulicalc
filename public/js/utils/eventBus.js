/**
 * eventBus.js - Pub/Sub Event System
 * @description Allows components to communicate via publish/subscribe pattern
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Simple Event Bus for component communication
 * Implements publish/subscribe pattern
 */
export class EventBus {
  constructor() {
    this.events = {};
    this.initialized = false;
  }

/**
     * Initialize the event bus
     */
    init() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
    }

  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event to subscribe to
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (typeof callback !== 'function') {
      console.error('❌ EventBus.on: callback must be a function');
      return () => {};
    }

    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);

    // Return unsubscribe function
    return () => this.off(eventName, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event to unsubscribe from
   * @param {Function} callback - Callback function to remove
   */
  off(eventName, callback) {
    if (!this.events[eventName]) {
      return;
    }

    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }

  /**
   * Emit an event to all subscribers
   * @param {string} eventName - Name of the event to emit
   * @param {*} data - Data to pass to subscribers
   */
  emit(eventName, data) {
    if (!this.events[eventName]) {
      return;
    }

    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ EventBus error in ${eventName}:`, error);
      }
    });
  }

  /**
   * Subscribe to an event once (auto-unsubscribe after first call)
   * @param {string} eventName - Name of the event to subscribe to
   * @param {Function} callback - Function to call once when event is emitted
   * @returns {Function} Unsubscribe function (though this happens automatically)
   */
  once(eventName, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(eventName, onceCallback);
    };

    return this.on(eventName, onceCallback);
  }

  /**
   * Remove all subscribers for an event
   * @param {string} eventName - Name of the event
   */
  clear(eventName) {
    if (eventName) {
      delete this.events[eventName];
    } else {
      this.events = {};
    }
  }

  /**
   * Get the number of subscribers for an event
   * @param {string} eventName - Name of the event
   * @returns {number} Number of subscribers
   */
  subscriberCount(eventName) {
    return this.events[eventName] ? this.events[eventName].length : 0;
  }

/**
     * Destroy the event bus (cleanup)
     */
    destroy() {
        this.events = {};
        this.initialized = false;
    }
}

/**
 * Standard Event Names in Hidraulicalc
 * @enum {string}
 */
export const EventNames = {
  // Calculation events
  'calculation:complete': 'calculation:complete',
  'calculation:error': 'calculation:error',

  // History events
  'history:added': 'history:added',
  'history:cleared': 'history:cleared',
  'history:loaded': 'history:loaded',

  // Graph events
  'graph:rendered': 'graph:rendered',
  'graph:error': 'graph:error',
  'graph:tooltip': 'graph:tooltip',

  // Tab events
  'tab:changed': 'tab:changed',

  // Error correction events
  'correction:applied': 'correction:applied',
  'correction:suggested': 'correction:suggested',

  // UI events
  'ui:scroll': 'ui:scroll',
  'ui:focus': 'ui:focus'
};

export default EventBus;
