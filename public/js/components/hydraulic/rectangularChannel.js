/**
 * rectangularChannel.js - Rectangular Channel Calculator
 * @description Handles volume calculation for rectangular channels (V = l × w × h)
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Rectangular Channel Calculator
 * Calculates water volume in rectangular channels
 */
export class RectangularChannel {
  /**
   * Create a new RectangularChannel calculator
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
    this.lengthInput = null;
    this.widthInput = null;
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
      console.warn('⚠️ RectangularChannel already initialized');
      return false;
    }

    console.log('📐 RectangularChannel initializing...');

    try {
      // Get DOM elements
      this.form = document.getElementById('form-rectangular-channel');
      this.lengthInput = document.getElementById('rect-length');
      this.widthInput = document.getElementById('rect-width');
      this.heightInput = document.getElementById('rect-height');
      this.resultContainer = document.getElementById('result-rectangular-channel');
      this.volumeElement = document.getElementById('rect-volume');
      this.volumeFtElement = document.getElementById('rect-volume-ft');

      // Validate elements exist
      if (!this.form || !this.lengthInput || !this.widthInput || !this.heightInput ||
          !this.resultContainer || !this.volumeElement || !this.volumeFtElement) {
        console.error('❌ RectangularChannel: Required DOM elements not found');
        return false;
      }

      // Set up form submission handler
      this.form.addEventListener('submit', this._handleSubmitBound);

      this.initialized = true;
      console.log('✅ RectangularChannel initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize RectangularChannel:', error);
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
      const length = parseFloat(this.lengthInput.value);
      const width = parseFloat(this.widthInput.value);
      const height = parseFloat(this.heightInput.value);

      // Validate inputs
      const validation = this._validateInputs(length, width, height);
      if (!validation.valid) {
        this.toastManager.error(validation.error);
        this.eventBus.emit('calculation:error', {
          calculator: 'rectangular-channel',
          error: validation.error
        });
        return;
      }

      // Calculate volume
      const volume = this._calculateVolume(length, width, height);

      // Convert to ft³
      const volumeFt = volume * this.M3_TO_FT3;

      // Display results
      this._displayResult(volume, volumeFt);

      // Add to history
      this._addToHistory({
        length,
        width,
        height
      }, {
        volume: volume.toFixed(2),
        volumeFt: volumeFt.toFixed(2)
      });

      // Show success notification
      this.toastManager.success(`✅ Canal rectangular: ${volume.toFixed(2)} m³`);

      // Emit completion event
      this.eventBus.emit('calculation:complete', {
        calculator: 'rectangular-channel',
        inputs: { length, width, height },
        results: {
          volume: volume.toFixed(2),
          volumeFt: volumeFt.toFixed(2)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error in RectangularChannel calculation:', error);
      this.toastManager.error('Error al calcular el volumen');
      this.eventBus.emit('calculation:error', {
        calculator: 'rectangular-channel',
        error: error.message
      });
    }
  }

  /**
   * Validate input values
   * @private
   * @param {number} length - The length value
   * @param {number} width - The width value
   * @param {number} height - The height value
   * @returns {Object} Validation result with valid flag and error message
   */
  _validateInputs(length, width, height) {
    // Check for empty or NaN values
    if (isNaN(length)) {
      return { valid: false, error: 'Por favor ingresa una longitud válida' };
    }

    if (isNaN(width)) {
      return { valid: false, error: 'Por favor ingresa un ancho válido' };
    }

    if (isNaN(height)) {
      return { valid: false, error: 'Por favor ingresa una altura válida' };
    }

    // Check for non-positive values
    if (length <= 0) {
      return { valid: false, error: 'La longitud debe ser mayor a 0' };
    }

    if (width <= 0) {
      return { valid: false, error: 'El ancho debe ser mayor a 0' };
    }

    if (height <= 0) {
      return { valid: false, error: 'La altura debe ser mayor a 0' };
    }

    return { valid: true };
  }

  /**
   * Calculate rectangular channel volume
   * Formula: V = l × w × h
   * @private
   * @param {number} length - The length in meters
   * @param {number} width - The width in meters
   * @param {number} height - The height in meters
   * @returns {number} The volume in cubic meters
   */
  _calculateVolume(length, width, height) {
    return length * width * height;
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
    const display = `Canal: l=${inputs.length}m, w=${inputs.width}m, h=${inputs.height}m → ${results.volume} m³`;

    this.historyManager.add(
      'rectangular-channel',
      inputs,
      results,
      display
    );

    this.eventBus.emit('history:added', {
      type: 'rectangular-channel',
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
    this.lengthInput = null;
    this.widthInput = null;
    this.heightInput = null;
    this.resultContainer = null;
    this.volumeElement = null;
    this.volumeFtElement = null;
    this.initialized = false;
    console.log('🧹 RectangularChannel destroyed');
  }
}

export default RectangularChannel;
