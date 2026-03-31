/**
 * historyManager.js - Calculation History Manager
 * @description Manages calculation history using localStorage
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Storage key for history
 */
const STORAGE_KEY = 'hidraulicalc_history';

/**
 * Maximum number of history entries
 */
const MAX_HISTORY_SIZE = 50;

/**
 * History entry structure
 * @typedef {Object} HistoryEntry
 * @property {string} id - Unique identifier
 * @property {string} timestamp - ISO timestamp
 * @property {string} type - Calculator type (e.g., 'cylindrical-reservoir', 'integral')
 * @property {Object} inputs - Calculation inputs
 * @property {Object} results - Calculation results
 * @property {string} display - Human-readable display string
 */

/**
 * History Manager
 * Stores and retrieves calculation history from localStorage
 */
export class HistoryManager {
  constructor(options = {}) {
    this.storageKey = options.storageKey || STORAGE_KEY;
    this.maxSize = options.maxSize || MAX_HISTORY_SIZE;
    this.initialized = false;
    this.history = [];
  }

/**
     * Initialize the history manager
     */
    init() {
        if (this.initialized) {
            return;
        }

        this._loadFromStorage();
        this.initialized = true;
    }

  /**
   * Add a calculation to history
   * @param {string} type - Calculator type
   * @param {Object} inputs - Calculation inputs
   * @param {Object} results - Calculation results
   * @param {string} display - Human-readable display
   * @returns {HistoryEntry} The created entry
   */
  add(type, inputs, results, display = null) {
    const entry = {
      id: this._generateId(),
      timestamp: new Date().toISOString(),
      type,
      inputs,
      results,
      display: display || this._generateDisplay(type, inputs, results)
    };

    // Add to beginning of array (newest first)
    this.history.unshift(entry);

    // Trim if exceeding max size
    if (this.history.length > this.maxSize) {
      this.history = this.history.slice(0, this.maxSize);
    }

    // Save to storage
    this._saveToStorage();

    return entry;
  }

  /**
   * Get all history entries
   * @returns {HistoryEntry[]} Array of history entries
   */
  getAll() {
    return [...this.history];
  }

  /**
   * Get history entries by type
   * @param {string} type - Calculator type filter
   * @returns {HistoryEntry[]} Filtered history entries
   */
  getByType(type) {
    return this.history.filter(entry => entry.type === type);
  }

  /**
   * Get a single history entry by ID
   * @param {string} id - Entry ID
   * @returns {HistoryEntry|undefined} History entry
   */
  getById(id) {
    return this.history.find(entry => entry.id === id);
  }

  /**
   * Get recent history entries
   * @param {number} count - Number of recent entries to get
   * @returns {HistoryEntry[]} Recent history entries
   */
  getRecent(count = 5) {
    return this.history.slice(0, count);
  }

  /**
   * Delete a history entry by ID
   * @param {string} id - Entry ID
   * @returns {boolean} True if deletion successful
   */
  delete(id) {
    const initialLength = this.history.length;
    this.history = this.history.filter(entry => entry.id !== id);

    if (this.history.length < initialLength) {
      this._saveToStorage();
      return true;
    }

    return false;
  }

/**
     * Clear all history
     */
    clear() {
        this.history = [];
        this._saveToStorage();
    }

  /**
   * Get history statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    const typeCounts = this.history.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {});

    return {
      total: this.history.length,
      byType: typeCounts,
      oldest: this.history[this.history.length - 1]?.timestamp,
      newest: this.history[0]?.timestamp
    };
  }

  /**
   * Export history to JSON
   * @returns {string} JSON string of history
   */
  export() {
    return JSON.stringify(this.history, null, 2);
  }

  /**
   * Import history from JSON
   * @param {string} json - JSON string to import
   * @returns {boolean} True if import successful
   */
  import(json) {
    try {
      const imported = JSON.parse(json);

      if (!Array.isArray(imported)) {
        throw new Error('Invalid history format: not an array');
      }

      // Validate entries
      const valid = imported.filter(entry => {
        return entry.id && entry.timestamp && entry.type && entry.inputs && entry.results;
      });

      if (valid.length === 0) {
        throw new Error('No valid history entries found');
      }

      // Merge with existing history (newest first)
      const combined = [...valid, ...this.history];
      // Remove duplicates by ID
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      // Sort by timestamp (newest first)
      unique.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      // Trim to max size
      this.history = unique.slice(0, this.maxSize);

this._saveToStorage();
            return true;
        } catch (error) {
            return false;
        }
    }

  /**
   * Load history from localStorage
   * @private
   */
  _loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.history = JSON.parse(stored);
        // Ensure all entries have required fields
        this.history = this.history.filter(entry => {
          return entry.id && entry.timestamp && entry.type && entry.inputs && entry.results;
        });
      }
    } catch (error) {
      console.error('❌ Failed to load history from storage:', error);
      this.history = [];
    }
  }

  /**
   * Save history to localStorage
   * @private
   */
  _saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.history));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ localStorage quota exceeded, trimming history');
        // Remove oldest half
        this.history = this.history.slice(0, Math.floor(this.history.length / 2));
        try {
          localStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (retryError) {
          console.error('❌ Still cannot save history:', retryError);
        }
      } else {
        console.error('❌ Failed to save history to storage:', error);
      }
    }
  }

  /**
   * Generate a unique ID
   * @private
   * @returns {string} Unique ID
   */
  _generateId() {
    return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a human-readable display string
   * @private
   * @param {string} type - Calculator type
   * @param {Object} inputs - Calculation inputs
   * @param {Object} results - Calculation results
   * @returns {string} Display string
   */
  _generateDisplay(type, inputs, results) {
    if (results.display) {
      return results.display;
    }

    const typeMap = {
      'cylindrical-reservoir': 'Embalse Cilíndrico',
      'rectangular-channel': 'Canal Rectangular',
      'vertical-tank': 'Tanque Vertical',
      'integral': 'Integral'
    };

    const name = typeMap[type] || type;
    const result = results.volume || results.area || results.value || 'N/A';

    return `${name}: ${result}`;
  }
}

export default HistoryManager;
