/**
 * formulaDisplay.js - Formula Display and Formatting
 * @description Displays parsed formulas with mathematical notation
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Formula Display
 * Renders formatted mathematical expressions
 */
export class FormulaDisplay {
  /**
   * Create a new FormulaDisplay
   * @param {EventBus} eventBus - Event bus for pub/sub communication
   */
  constructor(eventBus) {
    this.eventBus = eventBus;

    // Display elements
    this.formulaElement = null;
    this.notationElement = null;

    // Current formula data
    this.currentFunction = null;
    this.currentA = null;
    this.currentB = null;

    this.initialized = false;
  }

  /**
   * Initialize the formula display
   * @returns {boolean} True if initialized successfully
   */
  init() {
    try {
      console.log('📐 FormulaDisplay initializing...');

      // Find display elements
      this._findElements();

      // Set up event listeners
      this._setupEventListeners();

      this.initialized = true;
      console.log('✅ FormulaDisplay initialized');
      return true;

    } catch (error) {
      console.error('Error initializing FormulaDisplay:', error);
      return false;
    }
  }

  /**
   * Find display elements in DOM
   * @private
   */
  _findElements() {
    // These elements are optional - will gracefully handle if they don't exist
    this.formulaElement = document.getElementById('formula-display');
    this.notationElement = document.getElementById('integral-notation');
    this.resultElement = document.getElementById('integral-result');

    // Log status
    if (!this.formulaElement && !this.notationElement && !this.resultElement) {
      console.info('FormulaDisplay: No display elements found (optional feature)');
    }
  }

  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Listen for graph rendered events
    this.eventBus.on('graph:rendered', this._onGraphRendered.bind(this));
  }

  /**
   * Handle graph rendered event
   * @private
   * @param {Object} eventData - Event data
   */
  _onGraphRendered(eventData) {
    this.update(eventData.fn, eventData.a, eventData.b);
  }

  /**
   * Update the formula display
   * @param {string|Object} fn - Function to display
   * @param {number} [a] - Lower integration limit
   * @param {number} [b] - Upper integration limit
   */
  update(fn, a = null, b = null) {
    try {
      this.currentFunction = fn;
      this.currentA = a;
      this.currentB = b;

      // Update integral notation
      if (this.notationElement) {
        this.notationElement.innerHTML = this._formatIntegralNotation(fn, a, b);
      }

      // Update formula display
      if (this.formulaElement) {
        this.formulaElement.innerHTML = this._formatFormula(fn, a, b);
      }

    } catch (error) {
      console.error('Error updating formula display:', error);
    }
  }

  /**
   * Format integral notation
   * @private
   * @param {string|Object} fn - Function to display
   * @param {number|null} a - Lower limit
   * @param {number|null} b - Upper limit
   * @returns {string} Formatted HTML
   */
  _formatIntegralNotation(fn, a, b) {
    const fnStr = typeof fn === 'object' ? fn.fn : fn;

    const aStr = a !== null ? this._formatNumber(a) : 'a';
    const bStr = b !== null ? this._formatNumber(b) : 'b';

    return `
      <div class="integral-notation">
        <span class="integral-symbol">∫</span>
        <div class="integral-limits">
          <span class="upper-limit">${bStr}</span>
          <span class="lower-limit">${aStr}</span>
        </div>
        <span class="integral-function">${this._escapeHtml(fnStr)}</span>
        <span class="integral-differential">dx</span>
      </div>
    `;
  }

  /**
   * Format formula for display
   * @private
   * @param {string|Object} fn - Function to display
   * @param {number|null} a - Lower limit
   * @param {number|null} b - Upper limit
   * @returns {string} Formatted HTML
   */
  _formatFormula(fn, a, b) {
    const fnStr = typeof fn === 'object' ? fn.fn : fn;

    let html = '<div class="formula-container">';

    // Integral symbol
    html += '<span class="integral-sign">∫</span>';

    // Limits
    if (a !== null && b !== null) {
      html += `<span class="limit-row">
        <span class="sup-limit">${this._formatNumber(b)}</span>
        <span class="sub-limit">${this._formatNumber(a)}</span>
      </span>`;
    }

    // Function
    html += `<span class="function-expression">${this._formatExpression(fnStr)}</span>`;

    // Differential
    html += '<span class="differential">dx</span>';

    html += '</div>';

    return html;
  }

  /**
   * Format mathematical expression
   * @private
   * @param {string} expr - Expression to format
   * @returns {string} Formatted expression
   */
  _formatExpression(expr) {
    if (!expr) return '';

    let formatted = this._escapeHtml(expr);

    // Format powers (x^2 → x²)
    formatted = formatted.replace(/\^(\d+)/g, (match, power) => {
      const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
      return superscripts[power] || match;
    });

    // Format fractions (for simple ones)
    formatted = formatted.replace(/(\d+)\/(\d+)/g, '<sup>$1</sup>⁄<sub>$2</sub>');

    // Add spacing around operators
    formatted = formatted.replace(/([\+\-\*\/=])/g, ' $1 ');

    // Trigonometric functions
    const trigFunctions = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc'];
    trigFunctions.forEach(fn => {
      const regex = new RegExp(`\\b${fn}\\(([^)]+)\\)`, 'g');
      formatted = formatted.replace(regex, `${fn}<sub class="fn-sub">($1)</sub>`);
    });

    // Logarithmic functions
    const logFunctions = ['ln', 'log', 'lg'];
    logFunctions.forEach(fn => {
      const regex = new RegExp(`\\b${fn}\\(([^)]+)\\)`, 'g');
      formatted = formatted.replace(regex, `${fn}<sub class="fn-sub">($1)</sub>`);
    });

    // exponential
    formatted = formatted.replace(/e\^([^\s\)]+)/g, 'e<sup class="exp-sup">$1</sup>');
    formatted = formatted.replace(/exp\(([^)]+)\)/g, 'e<sup class="exp-sup">$1</sup>');

    // Square root
    formatted = formatted.replace(/sqrt\(([^)]+)\)/g, '√($1)');

    // Absolute value
    formatted = formatted.replace(/abs\(([^)]+)\)/g, '|$1|');

    return formatted;
  }

  /**
   * Format number for display
   * @private
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  _formatNumber(num) {
    if (typeof num !== 'number') return num;

    // Handle integers
    if (Number.isInteger(num)) {
      return num.toString();
    }

    // Handle simple decimals
    if (Math.abs(num) < 0.01 || Math.abs(num) >= 1000) {
      return num.toExponential(2);
    }

    // Handle π and e equivalents
    const pi = Math.PI;
    const e = Math.E;

    if (Math.abs(num - pi) < 0.01) return 'π';
    if (Math.abs(num + pi) < 0.01) return '-π';
    if (Math.abs(num - e) < 0.01) return 'e';
    if (Math.abs(num + e) < 0.01) return '-e';

    // Decimal format
    return num.toFixed(2).replace(/\.?0+$/, '');
  }

  /**
   * Escape HTML special characters
   * @private
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  _escapeHtml(text) {
    if (!text) return '';

    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Update display with calculation result
   * @param {number} result - Integration result
   */
  updateResult(result) {
    try {
      const resultElement = document.getElementById('integral-result');
      if (resultElement) {
        if (result !== null && typeof result === 'number') {
          resultElement.innerHTML = `
            <div class="result-label">Área bajo la curva:</div>
            <div class="result-value">${this._formatResult(result)}</div>
            <div class="result-units">unidades²</div>
          `;
        } else {
          resultElement.innerHTML = `
            <div class="result-label">Resultado:</div>
            <div class="result-value error">No calculado</div>
          `;
        }
      }
    } catch (error) {
      console.error('Error updating result display:', error);
    }
  }

  /**
   * Format calculation result
   * @private
   * @param {number} result - Result to format
   * @returns {string} Formatted result
   */
  _formatResult(result) {
    if (typeof result !== 'number') return '—';

    const absResult = Math.abs(result);

    // Very small or very large numbers
    if (absResult < 0.0001 || absResult > 1000000) {
      return result.toExponential(4);
    }

    // Format to reasonable precision
    return result.toFixed(6).replace(/\.?0+$/, '');
  }

  /**
   * Clear the display
   */
  clear() {
    if (this.formulaElement) {
      this.formulaElement.innerHTML = '<span class="placeholder">∫ f(x) dx</span>';
    }
    if (this.notationElement) {
      this.notationElement.innerHTML = '<span class="placeholder">Integrar función</span>';
    }

    const resultElement = document.getElementById('integral-result');
    if (resultElement) {
      resultElement.innerHTML = '';
    }

    this.currentFunction = null;
    this.currentA = null;
    this.currentB = null;
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.clear();
    this.eventBus = null;
    this.formulaElement = null;
    this.notationElement = null;
  }
}
