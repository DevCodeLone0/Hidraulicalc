/**
 * calculatorTabs.js - Tab Navigation Manager
 * @description Manages tab switching between different hydraulic calculators
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Tab Manager
 * Handles tab click events and switches between calculator tabs
 */
export class TabManager {
  /**
   * Create a new TabManager
   * @param {EventBus} eventBus - The event bus for pub/sub communication
   * @param {Array<Object>} calculators - Array of calculator components
   */
  constructor(eventBus, calculators = []) {
    this.eventBus = eventBus;
    this.calculators = calculators;
    this.activeTab = null;
    this.initialized = false;
  }

  /**
   * Initialize the tab manager
   * @returns {Promise<boolean>} True if initialization successful
   */
  async init() {
    if (this.initialized) {
      console.warn('⚠️ TabManager already initialized');
      return false;
    }

    console.log('🔄 TabManager initializing...');

    try {
      // Get tab buttons from DOM
      this.tabButtons = document.querySelectorAll('.tab-button');
      this.tabPanels = document.querySelectorAll('.tab-panel');

      if (this.tabButtons.length === 0 || this.tabPanels.length === 0) {
        console.error('❌ Tab buttons or panels not found in DOM');
        return false;
      }

      // Set up click handlers
      this._setupTabButtons();

      // Set initial active state
      const initialActiveButton = document.querySelector('.tab-button.active');
      if (initialActiveButton) {
        const tabId = initialActiveButton.dataset.tab;
        this.activeTab = tabId;
      }

      this.initialized = true;
      console.log('✅ TabManager initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize TabManager:', error);
      return false;
    }
  }

  /**
   * Set up click handlers for tab buttons
   * @private
   */
  _setupTabButtons() {
    this.tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const tabId = e.target.dataset.tab;
        this.switchTab(tabId);
      });
    });
  }

  /**
   * Switch to a specific tab
   * @param {string} tabId - The ID of the tab to switch to
   */
  switchTab(tabId) {
    if (!tabId) {
      console.warn('⚠️ Invalid tab ID');
      return;
    }

    try {
      // Remove active class from all buttons and panels
      this.tabButtons.forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
      });

      this.tabPanels.forEach(panel => {
        panel.classList.remove('active');
      });

      // Add active class to target button and panel
      const targetButton = document.querySelector(`[data-tab="${tabId}"]`);
      const targetPanel = document.getElementById(tabId);

      if (targetButton) {
        targetButton.classList.add('active');
        targetButton.setAttribute('aria-selected', 'true');
      } else {
        console.warn(`⚠️ Tab button not found: ${tabId}`);
      }

      if (targetPanel) {
        targetPanel.classList.add('active');
      } else {
        console.warn(`⚠️ Tab panel not found: ${tabId}`);
      }

      this.activeTab = tabId;

      // Emit tab changed event
      this.eventBus.emit('tab:changed', {
        tabId: tabId,
        timestamp: new Date().toISOString()
      });

      console.log(`🔄 Switched to tab: ${tabId}`);
    } catch (error) {
      console.error('❌ Failed to switch tab:', error);
    }
  }

  /**
   * Get the currently active tab ID
   * @returns {string|null} The active tab ID or null if none active
   */
  getActiveTab() {
    return this.activeTab;
  }

  /**
   * Check if a specific calculator is currently visible
   * @param {string} calculatorType - The calculator type to check
   * @returns {boolean} True if the calculator is visible
   */
  isCalculatorVisible(calculatorType) {
    return this.activeTab === calculatorType;
  }

  /**
   * Clean up event listeners and resources
   */
  destroy() {
    // Event listeners are attached to DOM elements so they will be cleaned up naturally
    // when the elements are removed from the DOM
    this.tabButtons = null;
    this.tabPanels = null;
    this.calculators = [];
    this.initialized = false;
    console.log('🧹 TabManager destroyed');
  }
}

export default TabManager;
