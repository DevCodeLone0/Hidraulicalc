/**
 * integralGrapher.js - Main Integral Graphing Component
 * @description Orchestrates function parsing, integration, and graph rendering
 * Integrates all integral components into a cohesive experience
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

import { FunctionParser } from './functionParser.js';
import { IntegralCalculator } from './integralCalculator.js';
import { GraphRenderer } from './graphRenderer.js';
import { GraphControls } from './graphControls.js';
import { FormulaDisplay } from './formulaDisplay.js';
import { GraphTooltip } from './graphTooltip.js';
// mathjs is loaded via CDN as a global variable

/**
 * Integral Grapher
 * Main component for creating and displaying integral graphs
 */
export class IntegralGrapher {
  /**
   * Create a new IntegralGrapher
   * @param {EventBus} eventBus - Event bus for pub/sub communication
   * @param {ToastManager} toastManager - Toast notification system
   * @param {HistoryManager} historyManager - Calculation history manager
   */
  constructor(eventBus, toastManager, historyManager) {
    this.eventBus = eventBus;
    this.toastManager = toastManager;
    this.historyManager = historyManager;

    // Sub-components
    this.parser = new FunctionParser(eventBus);
    this.calculator = new IntegralCalculator();
    this.renderer = new GraphRenderer(eventBus);
    this.controls = new GraphControls(eventBus, this.renderer);
    this.formulaDisplay = new FormulaDisplay(eventBus);
    this.tooltip = new GraphTooltip(eventBus, this.renderer);

    // Form elements
    this.form = null;
    this.functionInput = null;
    this.limitAInput = null;
    this.limitBInput = null;
    this.calculateBtn = null;
    this.clearBtn = null;

    // Result elements
    this.resultValue = null;
    this.resultError = null;

    // Current state
    this.currentFunction = null;
    this.currentLimits = { a: null, b: null };
    this.currentResult = null;

    this.initialized = false;
  }

  /**
   * Initialize the integral grapher
   * @returns {Promise<boolean>} True if initialization successful
   */
  async init() {
    if (this.initialized) {
      console.warn('⚠️ IntegralGrapher already initialized');
      return false;
    }

try {
            // Initialize sub-components
            await this._initComponents();

            // Find DOM elements
            this._findElements();

            // Set up event listeners
            this._setupEventListeners();

            // Set up example buttons
            this._setupExampleButtons();

            this.initialized = true;
            return true;

    } catch (error) {
      console.error('Error initializing IntegralGrapher:', error);
      this.toastManager.error('Error al inicializar el graficador integral');
      return false;
    }
  }

  /**
   * Initialize all sub-components
   * @private
   */
  async _initComponents() {
    // Initialize renderer with canvas
    const canvas = document.getElementById('graph-plot');
    if (!canvas) {
      throw new Error('Canvas element #graph-plot not found');
    }
    await this.renderer.init('#graph-plot');

    // Initialize controls
    await this.controls.init();

    // Initialize formula display
    await this.formulaDisplay.init();

// Initialize tooltip
        await this.tooltip.init();
    }

  /**
   * Find DOM elements
   * @private
   */
  _findElements() {
    // Form elements
    this.functionInput = document.getElementById('function-input');
    this.limitAInput = document.getElementById('limit-lower');
    this.limitBInput = document.getElementById('limit-upper');
    this.calculateBtn = document.getElementById('btn-graph');

    // Result elements
    this.resultValue = document.getElementById('integral-area');
    this.resultContainer = document.getElementById('area-result');
  }

  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Calculate button
    if (this.calculateBtn) {
      this.calculateBtn.addEventListener('click', () => this.calculate());
    }

    // Enter key on inputs
    if (this.functionInput) {
      this.functionInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.calculate();
      });
    }
    if (this.limitAInput) {
      this.limitAInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.calculate();
      });
    }
    if (this.limitBInput) {
      this.limitBInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.calculate();
      });
    }

    // Real-time updates on input
    if (this.functionInput) {
      this.functionInput.addEventListener('input', () => this._handleInputChanged());
    }

    // Listen for correction applied events
    this.eventBus.on('correction:applied', (data) => {
      this._showCorrectionNotice(data);
    });

    // Listen for graph errors
    this.eventBus.on('graph:error', (data) => {
      this._handleGraphError(data);
    });
  }

  /**
   * Set up example function buttons
   * @private
   */
  _setupExampleButtons() {
    const buttons = document.querySelectorAll('.btn-example');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const fn = btn.dataset.function;

        // Default limits based on function type
        let a = null;
        let b = null;

        if (fn === 'ln(x)') {
          // Logarithmic function needs positive limits
          a = 0.1;
          b = 5;
        } else if (fn.includes('e^')) {
          // Exponential function - use negative lower limit for better visualization
          a = -2;
          b = 2;
        } else {
          // Default limits
          a = -5;
          b = 5;
        }

        if (fn && this.functionInput) {
          this.functionInput.value = fn;
          if (this.limitAInput && a !== null) this.limitAInput.value = a;
          if (this.limitBInput && b !== null) this.limitBInput.value = b;
          this.calculate();
        }
      });
    });
  }

  /**
   * Handle input changed
   * @private
   */
  _handleInputChanged() {
    const fn = this.functionInput ? this.functionInput.value.trim() : '';
    const a = this.limitAInput ? this.limitAInput.value.trim() : '';
    const b = this.limitBInput ? this.limitBInput.value.trim() : '';

    // Update formula display
    if (fn) {
      this.formulaDisplay.update(fn);
    }
  }

  /**
   * Calculate and graph the integral
   */
  async calculate() {
    try {
      // Get input values
      const fnInput = this.functionInput ? this.functionInput.value.trim() : '';
      const aInput = this.limitAInput ? this.limitAInput.value.trim() : '';
      const bInput = this.limitBInput ? this.limitBInput.value.trim() : '';

      // Validate inputs
      if (!fnInput) {
        this._showError('Por favor, ingresa una función');
        return;
      }

      const a = parseFloat(aInput);
      const b = parseFloat(bInput);

      if (isNaN(a) || isNaN(b)) {
        this._showError('Por favor, ingresa límites válidos (números)');
        return;
      }

      if (a >= b) {
        this._showError('El límite inferior debe ser menor que el superior');
        return;
      }

// Clear previous errors
        this._clearError();

        // Parse function
        const parseResult = this.parser.parse(fnInput);

      if (!parseResult.valid) {
        this._showError(parseResult.error || 'Error al analizar la función');
        return;
      }

      // Show correction notice if applicable
      if (parseResult.corrected !== fnInput) {
        this._showCorrectionNotice({
          original: fnInput,
          corrected: parseResult.corrected,
          corrections: parseResult.corrections
        });
      }

// Calculate integral
        const integralResult = this.calculator.integrate(
            (x) => this.parser.evaluate(parseResult, x),
            a,
            b
        );

      if (!integralResult.converged) {
        this._showWarning('El cálculo no convergió completamente. El resultado puede tener mayor error.');
      }

      // Store current state
      this.currentFunction = parseResult.corrected;
      this.currentLimits = { a, b };
      this.currentResult = integralResult.value;

        // Render graph
        try {
          // Compilar la función con math.js antes de pasarla
          if (typeof math === 'undefined') {
            throw new Error('math.js library not loaded');
          }
          
          const compiledExpr = math.compile(parseResult.corrected);
          
          const renderResult = this.renderer.render(
            compiledExpr,
            a,
            b,
            {
              color: '#1976D2',
              fillColor: 'rgba(25, 118, 210, 0.3)',
              limitColor: '#D32F2F',
              coefficient: 1,
              nSamples: 500  // Reducido para mejor rendimiento
            }
          );

          if (!renderResult.success) {
            this._showWarning('Gráfico renderizado con errores: ' + renderResult.error);
          }
        } catch (e) {
          console.error('Error al compilar/renderizar:', e);
          this._showWarning(`Error al compilar la función: ${e.message}`);
        }

      // Update formula display
      this.formulaDisplay.update(parseResult.corrected, a, b);
      this.formulaDisplay.updateResult(integralResult.value);

      // Display result
      this._displayResult(integralResult);

      // Save to history
      this._saveToHistory({
        function: parseResult.corrected,
        original: fnInput,
        a,
        b,
        result: integralResult.value,
        error: integralResult.error,
        method: integralResult.method,
        timestamp: Date.now()
      });

// Show success toast
        this.toastManager.success('✅ Integral calculada correctamente');

    } catch (error) {
      console.error('Error in calculate():', error);
      this._showError(`Error al calcular: ${error.message}`);
      this.toastManager.error('Error al calcular la integral');
    }
  }

  /**
   * Set function from external source
   * @param {string} fn - Function expression
   */
  setFunction(fn) {
    if (this.functionInput) {
      this.functionInput.value = fn;
      this.functionInput.focus();
    }
  }

  /**
   * Display calculation result
   * @private
   * @param {IntegrationResult} result - Integration result
   */
  _displayResult(result) {
    // Show result container
    if (this.resultContainer) {
      this.resultContainer.classList.remove('hidden');
      this.resultContainer.style.display = 'block';
    }

    if (this.resultValue) {
      const value = result.value;
      const error = result.error;

      // Format value
      let formattedValue;
      if (Math.abs(value) < 0.0001 || Math.abs(value) > 1000000) {
        formattedValue = value.toExponential(4);
      } else {
        formattedValue = value.toFixed(6).replace(/\.?0+$/, '');
      }

      // Update value
      this.resultValue.textContent = formattedValue;
    }
  }

  /**
   * Translate method name to Spanish
   * @private
   * @param {string} method - Method name
   * @returns {string} Translated method name
   */
  _translateMethod(method) {
    const translations = {
      'simpson': 'Regla de Simpson',
      'adaptive': 'Cuadratura Adaptiva',
      'auto': 'Automático'
    };
    return translations[method] || method;
  }

  /**
   * Show correction notice
   * @private
   * @param {Object} data - Correction data
   */
  _showCorrectionNotice(data) {
    if (data.corrections && data.corrections.length > 0) {
      const message = `Correcciones aplicadas: ${data.corrections.join(', ')}`;
      this.toastManager.info(message, { duration: 3000 });
    }
  }

  /**
   * Handle graph error
   * @private
   * @param {Object} data - Error data
   */
  _handleGraphError(data) {
    console.warn('Graph error:', data.error);
    this._showWarning(data.error);
  }

  /**
   * Show error message
   * @private
   * @param {string} message - Error message
   */
  _showError(message) {
    this.toastManager.error(message);
    if (this.resultContainer) {
      this.resultContainer.classList.add('hidden');
    }
  }

  /**
   * Show warning message
   * @private
   * @param {string} message - Warning message
   */
  _showWarning(message) {
    this.toastManager.warning(message);
  }

  /**
   * Clear error display
   * @private
   */
  _clearError() {
    // No error element to clear - just ensuring result container is visible if needed
  }

  /**
   * Save calculation to history
   * @private
   * @param {Object} entry - History entry
   */
  _saveToHistory(entry) {
    try {
      const inputs = {
        function: entry.function,
        original: entry.original,
        a: entry.a,
        b: entry.b
      };

      const results = {
        value: entry.result,
        error: entry.error,
        method: entry.method,
        timestamp: entry.timestamp
      };

      const display = `∫[${entry.a}, ${entry.b}] ${entry.function} dx = ${entry.result.toFixed(6)}`;

      this.historyManager.add('integral', inputs, results, display);

      // Emit history event
      this.eventBus.emit('history:added', { type: 'integral', display });

    } catch (error) {
      console.error('Error saving to history:', error);
    }
  }

  /**
   * Clear all inputs and results
   */
  clear() {
    // Clear inputs
    if (this.functionInput) this.functionInput.value = '';
    if (this.limitAInput) this.limitAInput.value = '';
    if (this.limitBInput) this.limitBInput.value = '';

    // Hide result container
    if (this.resultContainer) {
      this.resultContainer.classList.add('hidden');
      this.resultContainer.style.display = 'none';
    }

    // Clear formula display
    this.formulaDisplay.clear();

    // Clear graph
    this.renderer.clear();

    // Reset state
    this.currentFunction = null;
    this.currentLimits = { a: null, b: null };
    this.currentResult = null;

    this.toastManager.info('Formulario limpiado');
  }

  /**
   * Load from history
   * @param {Object} entry - History entry to load
   */
  loadFromHistory(entry) {
    try {
      if (!entry.data) return;

      this.functionInput.value = entry.data.original || entry.data.function;
      this.limitAInput.value = entry.data.a;
      this.limitBInput.value = entry.data.b;

      this.calculate();

      this.toastManager.info('Resultado cargado del historial');

    } catch (error) {
      console.error('Error loading from history:', error);
      this.toastManager.error('Error al cargar del historial');
    }
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return {
      function: this.currentFunction,
      limits: this.currentLimits,
      result: this.currentResult
    };
  }

/**
     * Destroy the component
     */
    destroy() {
        // Destroy sub-components
        if (this.parser) this.parser.destroy();
        if (this.renderer) this.renderer.destroy();
        if (this.controls) this.controls.destroy();
        if (this.formulaDisplay) this.formulaDisplay.destroy();
        if (this.tooltip) this.tooltip.destroy();

        // Clear references
        this.calculator = null;
        this.eventBus = null;
        this.toastManager = null;
        this.historyManager = null;
    }
}
