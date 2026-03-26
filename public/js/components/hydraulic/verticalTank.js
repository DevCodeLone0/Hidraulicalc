/**
 * verticalTank.js - Vertical Cylindrical Tank Calculator
 * @description Handles volume calculation for vertical cylindrical tanks (V = πr²h)
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Vertical Tank Calculator
 * Calculates water volume in vertical cylindrical tanks
 */
export class VerticalTank {
  /**
   * Create a new VerticalTank calculator
   * @param {EventBus} eventBus - The event bus for pub/sub communication
   * @param {ToastManager} toastManager - The toast notification system
   * @param {HistoryManager} historyManager - The calculation history manager
   */
  constructor(eventBus, toastManager, historyManager) {
    this.eventBus = eventBus;
    this.toastManager = toastManager;
    this.historyManager = historyManager;

    // Form elements
    this.form = null;
    this.radiusInput = null;
    this.heightInput = null;

    // Result elements
    this.resultContainer = null;
    this.volumeElement = null;
    this.volumeFtElement = null;

    // Unit conversion factor: 1 m³ = 35.3147 ft³
    this.M3_TO_FT3 = 35.3147;

    // Bind event handlers for proper event listener removal
    this._handleSubmitBound = this._handleSubmit.bind(this);

    this.initialized = false;
  }

  /**
   * Initialize the calculator
   * @returns {Promise<boolean>} True if initialization successful
   */
  async init() {
    if (this.initialized) {
      console.warn('⚠️ VerticalTank already initialized');
      return false;
    }

    console.log('📐 VerticalTank initializing...');

    try {
      // Get DOM elements
      this.form = document.getElementById('form-vertical-tank');
      this.radiusInput = document.getElementById('tank-radius');
      this.heightInput = document.getElementById('tank-height');
      this.resultContainer = document.getElementById('result-vertical-tank');
      this.volumeElement = document.getElementById('tank-volume');
      this.volumeFtElement = document.getElementById('tank-volume-ft');

      // Validate elements exist
      if (!this.form || !this.radiusInput || !this.heightInput ||
          !this.resultContainer || !this.volumeElement || !this.volumeFtElement) {
        console.error('❌ VerticalTank: Required DOM elements not found');
        return false;
      }

      // Set up form submission handler
      this.form.addEventListener('submit', this._handleSubmitBound);

      this.initialized = true;
      console.log('✅ VerticalTank initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize VerticalTank:', error);
      return false;
    }
  }

  /**
   * Handle form submission
   * @private
   * @param {Event} e - Submit event
   */
  _handleSubmit(e) {
    e.preventDefault();

    try {
      // Get input values
      const radius = parseFloat(this.radiusInput.value);
      const height = parseFloat(this.heightInput.value);

      // Validate inputs
      const validation = this._validateInputs(radius, height);
      if (!validation.valid) {
        this.toastManager.error(validation.error);
        this.eventBus.emit('calculation:error', {
          calculator: 'vertical-tank',
          error: validation.error
        });
        return;
      }

      // Calculate volume
      const volume = this._calculateVolume(radius, height);

      // Convert to ft³
      const volumeFt = volume * this.M3_TO_FT3;

      // Display results
      this._displayResult(volume, volumeFt);

      // Add to history
      this._addToHistory({
        radius,
        height
      }, {
        volume: volume.toFixed(2),
        volumeFt: volumeFt.toFixed(2)
      });

      // Show success notification
      this.toastManager.success(`✅ Tanque vertical: ${volume.toFixed(2)} m³`);

      // Emit completion event
      this.eventBus.emit('calculation:complete', {
        calculator: 'vertical-tank',
        inputs: { radius, height },
        results: {
          volume: volume.toFixed(2),
          volumeFt: volumeFt.toFixed(2)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error in VerticalTank calculation:', error);
      this.toastManager.error('Error al calcular el volumen');
      this.eventBus.emit('calculation:error', {
        calculator: 'vertical-tank',
        error: error.message
      });
    }
  }

  /**
   * Validate input values
   * @private
   * @param {number} radius - The radius value
   * @param {number} height - The height value
   * @returns {Object} Validation result with valid flag and error message
   */
  _validateInputs(radius, height) {
    // Check for empty or NaN values
    if (isNaN(radius)) {
      return { valid: false, error: 'Por favor ingresa un radio válido' };
    }

    if (isNaN(height)) {
      return { valid: false, error: 'Por favor ingresa una altura válida' };
    }

    // Check for non-positive values
    if (radius <= 0) {
      return { valid: false, error: 'El radio debe ser mayor a 0' };
    }

    if (height <= 0) {
      return { valid: false, error: 'La altura debe ser mayor a 0' };
    }

    return { valid: true };
  }

  /**
   * Calculate vertical cylindrical tank volume
   * Formula: V = π × r² × h
   * @private
   * @param {number} radius - The radius in meters
   * @param {number} height - The height in meters
   * @returns {number} The volume in cubic meters
   */
  _calculateVolume(radius, height) {
    return Math.PI * Math.pow(radius, 2) * height;
  }

  /**
   * Display the calculation result
   * @private
   * @param {number} volume - The volume in m³
   * @param {number} volumeFt - The volume in ft³
   */
  _displayResult(volume, volumeFt) {
    // Update result elements
    this.volumeElement.textContent = volume.toFixed(2);
    this.volumeFtElement.textContent = volumeFt.toFixed(2);

    // Show result container
    this.resultContainer.classList.remove('hidden');

    // Scroll to result for better visibility
    this.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Add calculation to history
   * @private
   * @param {Object} inputs - Input values
   * @param {Object} results - Calculation results
   */
  _addToHistory(inputs, results) {
    const display = `Tanque: r=${inputs.radius}m, h=${inputs.height}m → ${results.volume} m³`;

    this.historyManager.add(
      'vertical-tank',
      inputs,
      results,
      display
    );

    this.eventBus.emit('history:added', {
      type: 'vertical-tank',
      display
    });
  }

  /**
   * Reset the calculator form
   */
  reset() {
    if (this.form) {
      this.form.reset();
    }
    if (this.resultContainer) {
      this.resultContainer.classList.add('hidden');
    }
  }

  /**
   * Clean up event listeners and resources
   */
  destroy() {
    if (this.form) {
      this.form.removeEventListener('submit', this._handleSubmitBound);
    }
    this.form = null;
    this.radiusInput = null;
    this.heightInput = null;
    this.resultContainer = null;
    this.volumeElement = null;
    this.volumeFtElement = null;
    this.initialized = false;
    console.log('🧹 VerticalTank destroyed');
  }
}

export default VerticalTank;
