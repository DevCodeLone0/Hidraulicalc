/**
 * graphTooltip.js - Interactive Graph Tooltip
 * @description Shows (x, y) coordinates on hover
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Graph Tooltip
 * Displays function values at cursor position
 */
export class GraphTooltip {
  /**
   * Create a new GraphTooltip
   * @param {EventBus} eventBus - Event bus for pub/sub communication
   * @param {GraphRenderer} graphRenderer - The graph renderer instance
   */
  constructor(eventBus, graphRenderer) {
    this.eventBus = eventBus;
    this.renderer = graphRenderer;

    this.tooltip = null;
    this.canvas = null;

    // Current function and limits
    this.currentFunction = null;
    this.currentA = null;
    this.currentB = null;

    this.initialized = false;
    this.enabled = true;

    // Bound handler references for cleanup
    this._boundMouseMove = null;
    this._boundMouseLeave = null;
    this._boundMouseEnter = null;
  }

/**
     * Initialize the tooltip
     * @returns {boolean} True if initialized successfully
     */
    init() {
        try {
            // Create tooltip element
            this._createTooltipElement();

            // Get canvas from renderer
            if (this.renderer.canvas) {
                this.canvas = this.renderer.canvas;
                this._setupEvents();
            }

            // Listen for graph render events
            this.eventBus.on('graph:rendered', this._onGraphRendered.bind(this));

            this.initialized = true;
            return true;

    } catch (error) {
      console.error('Error initializing GraphTooltip:', error);
      return false;
    }
  }

  /**
   * Create tooltip DOM element
   * @private
   */
  _createTooltipElement() {
    // Create tooltip container
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'graph-tooltip';
    this.tooltip.innerHTML = `
      <div class="tooltip-header">Valor en punto</div>
      <div class="tooltip-content">
        <div class="tooltip-row">
          <span class="tooltip-label">x:</span>
          <span class="tooltip-value x-value">—</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">f(x):</span>
          <span class="tooltip-value y-value">—</span>
        </div>
      </div>
    `;

    // Style the tooltip
    this.tooltip.style.cssText = `
      position: absolute;
      display: none;
      background: linear-gradient(135deg, #2c1810 0%, #4a2c2a 100%);
      color: #faf0e6;
      padding: 10px 12px;
      border-radius: 8px;
      border: 2px solid #8b5a2b;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      pointer-events: none;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      min-width: 100px;
    `;

    // Add styles for specific elements
    const style = document.createElement('style');
    style.textContent = `
      .graph-tooltip .tooltip-header {
        font-weight: bold;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid #8b5a2b;
        font-size: 12px;
        color: #deb887;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .graph-tooltip .tooltip-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .graph-tooltip .tooltip-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .graph-tooltip .tooltip-label {
        color: #deb887;
        font-weight: 600;
      }
      .graph-tooltip .tooltip-value {
        color: #faf0e6;
        font-family: 'Monaco', 'Consolas', monospace;
      }
    `;
    this.tooltip.appendChild(style);

    document.body.appendChild(this.tooltip);
  }

  /**
   * Set up mouse events on canvas
   * @private
   */
  _setupEvents() {
    if (!this.canvas) return;

    this._boundMouseMove = this._handleMouseMove.bind(this);
    this._boundMouseLeave = this._handleMouseLeave.bind(this);
    this._boundMouseEnter = this._handleMouseEnter.bind(this);

    this.canvas.addEventListener('mousemove', this._boundMouseMove);
    this.canvas.addEventListener('mouseleave', this._boundMouseLeave);
    this.canvas.addEventListener('mouseenter', this._boundMouseEnter);
  }

  /**
   * Handle graph rendered event
   * @private
   * @param {Object} eventData - Event data
   */
  _onGraphRendered(eventData) {
    this.currentFunction = eventData.fn;
    this.currentA = eventData.a;
    this.currentB = eventData.b;

    // Update canvas reference
    if (!this.canvas && this.renderer.canvas) {
      this.canvas = this.renderer.canvas;
      this._setupEvents();
    }
  }

  /**
   * Handle mouse move
   * @private
   * @param {MouseEvent} event - Mouse event
   */
  _handleMouseMove(event) {
    if (!this.enabled || !this.currentFunction) {
      this.hide();
      return;
    }

    const canvas = event.target.closest('svg') || event.target;

    if (!canvas) {
      this.hide();
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Get current graph configuration
    const config = this.renderer.getConfig();
    if (!config) {
      this.hide();
      return;
    }

    // Convert pixel coordinates to graph coordinates
    const graphX = this._convertPixelToX(x, rect.width, config.xDomain);

    // Calculate function value
    const graphY = this._calculateY(graphX);

    // Update tooltip content
    this._updateContent(graphX, graphY);

    // Position tooltip
    this._position(event.clientX, event.clientY);

    // Show tooltip
    this.show();
  }

  /**
   * Handle mouse leave
   * @private
   */
  _handleMouseLeave() {
    this.hide();
  }

  /**
   * Handle mouse enter
   * @private
   */
  _handleMouseEnter() {
    // Tooltip will show on mouse move
  }

  /**
   * Convert pixel x to graph x
   * @private
   * @param {number} pixelX - Pixel x coordinate
   * @param {number} width - Canvas width
   * @param {Array} xDomain - x domain [min, max]
   * @returns {number} Graph x coordinate
   */
  _convertPixelToX(pixelX, width, xDomain) {
    const x = xDomain[0] + (pixelX / width) * (xDomain[1] - xDomain[0]);
    return x;
  }

  /**
 * Calculate y value at x
 * @private
 * @param {number} x - X value
 * @returns {number|null} Y value or null if error
 */
  _calculateY(x) {
    try {
      if (!this.currentFunction) return null;

      const fn = this.currentFunction;

      // Validar que x sea un número finito
      if (typeof x !== 'number' || !isFinite(x)) {
        return null;
      }

      let y;

      // Check if it's a compiled math.js expression (has .evaluate method)
      if (fn && typeof fn.evaluate === 'function') {
        // Es una expresión compilada de math.js
        const scope = { x, pi: Math.PI, e: Math.E };
        y = fn.evaluate(scope);
      } else if (typeof fn === 'function') {
        // Es una función regular
        y = fn(x);
      } else if (typeof fn === 'string') {
        // Es un string, parsear con math.js
        if (typeof math !== 'undefined') {
          try {
            const node = math.parse(fn);
            const compiled = node.compile();
            const scope = { x, pi: Math.PI, e: Math.E };
            y = compiled.evaluate(scope);
          } catch (e) {
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }

      // Validar resultado
      if (typeof y !== 'number' || !isFinite(y)) {
        return null;
      }

      return y;

    } catch (error) {
      return null;
    }
  }

  /**
   * Update tooltip content
   * @private
   * @param {number} x - X value
   * @param {number|null} y - Y value
   */
  _updateContent(x, y) {
    const xValue = this.tooltip.querySelector('.x-value');
    const yValue = this.tooltip.querySelector('.y-value');

    if (xValue) {
      xValue.textContent = this._formatValue(x);
    }

    if (yValue) {
      if (typeof y === 'number' && isFinite(y)) {
        yValue.textContent = this._formatValue(y);
        yValue.style.color = '#faf0e6';
      } else {
        yValue.textContent = 'Indefinido';
        yValue.style.color = '#ff6b6b';
      }
    }
  }

  /**
   * Format value for display
   * @private
   * @param {number} value - Value to format
   * @returns {string} Formatted value
   */
  _formatValue(value) {
    if (typeof value !== 'number') return '—';

    const absValue = Math.abs(value);

    if (absValue === 0 || Number.isInteger(value)) {
      return value.toString();
    } else if (absValue < 0.01 || absValue >= 100) {
      return value.toExponential(2);
    } else {
      return value.toFixed(3).replace(/\.?0+$/, '');
    }
  }

  /**
   * Position tooltip
   * @private
   * @param {number} clientX - Mouse client X
   * @param {number} clientY - Mouse client Y
   */
  _position(clientX, clientY) {
    if (!this.tooltip) return;

    const offset = 15;
    const x = clientX + offset;
    const y = clientY + offset;

    this.tooltip.style.left = `${x}px`;
    this.tooltip.style.top = `${y}px`;

    // Keep within viewport
    const rect = this.tooltip.getBoundingClientRect();

    if (rect.right > window.innerWidth) {
      this.tooltip.style.left = `${clientX - rect.width - offset}px`;
    }

    if (rect.bottom > window.innerHeight) {
      this.tooltip.style.top = `${clientY - rect.height - offset}px`;
    }
  }

  /**
   * Show tooltip
   */
  show() {
    if (this.tooltip) {
      this.tooltip.style.display = 'block';
    }
  }

  /**
   * Hide tooltip
   */
  hide() {
    if (this.tooltip) {
      this.tooltip.style.display = 'none';
    }
  }

  /**
   * Enable or disable tooltip
   * @param {boolean} enabled - Whether tooltip should be enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.hide();
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.hide();

    if (this.canvas) {
      if (this._boundMouseMove) {
        this.canvas.removeEventListener('mousemove', this._boundMouseMove);
        this._boundMouseMove = null;
      }
      if (this._boundMouseLeave) {
        this.canvas.removeEventListener('mouseleave', this._boundMouseLeave);
        this._boundMouseLeave = null;
      }
      if (this._boundMouseEnter) {
        this.canvas.removeEventListener('mouseenter', this._boundMouseEnter);
        this._boundMouseEnter = null;
      }
    }

    if (this.tooltip && this.tooltip.parentNode) {
      this.tooltip.parentNode.removeChild(this.tooltip);
    }

    this.tooltip = null;
    this.canvas = null;
    this.currentFunction = null;
    this.renderer = null;
    this.eventBus = null;
  }
}
