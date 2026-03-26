/**
 * graphRenderer.js - Graph Visualization Renderer
 * @description Renders function graphs using function-plot library
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

// function-plot is loaded via CDN as a global variable

/**
 * Graph render result structure
 * @typedef {Object} GraphRenderResult
 * @property {boolean} success - Whether rendering was successful
 * @property {string} error - Error message if failed
 */

/**
 * Graph Renderer
 * Handles graph visualization with function-plot library
 */
export class GraphRenderer {
  /**
   * Create a new GraphRenderer
   * @param {EventBus} eventBus - Event bus for pub/sub communication
   */
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.canvas = null;
    this.currentConfig = null;
    this.resizeObserver = null;

    // Default graph configuration
    this.config = {
      width: 600,
      height: 400,
      xDomain: [-10, 10],
      yDomain: [-10, 10],
      grid: true,
      xAxis: { label: 'x' },
      yAxis: { label: 'f(x)' },
      data: []
    };

    // Animation settings
    this.animating = false;
    this.animationDuration = 300;
  }

  /**
   * Initialize the graph renderer
   * @param {HTMLElement|string} canvas - Canvas element or selector
   * @returns {boolean} True if initialized successfully
   */
  init(canvas) {
    try {
      // Get canvas element
      if (typeof canvas === 'string') {
        this.canvas = document.querySelector(canvas);
      } else {
        this.canvas = canvas;
      }

      if (!this.canvas) {
        throw new Error('Canvas element not found');
      }

      // Set up resize observer
      this._setupResizeObserver();

      console.log('📊 GraphRenderer initialized');
      return true;

    } catch (error) {
      console.error('Error initializing GraphRenderer:', error);
      return false;
    }
  }

  /**
   * Render a function graph
   * @param {string|Object} fnFunction - Function to render (string fn or object)
   * @param {number} [a] - Lower integration limit (optional, for shading)
   * @param {number} [b] - Upper integration limit (optional, for shading)
   * @param {Object} [options] - Additional render options
   * @returns {GraphRenderResult} Render result
   */
  render(fnFunction, a = null, b = null, options = {}) {
    try {
      if (!this.canvas) {
        throw new Error('Canvas not initialized. Call init() first.');
      }

      // Build data array
      const data = this._buildDataArray(fnFunction, a, b, options);

      // Merge with default config
      const graphConfig = {
        ...this.config,
        ...options,
        width: this.canvas.clientWidth || this.config.width,
        height: this.canvas.clientHeight || this.config.height,
        target: this.canvas,
        data
      };

      // Store current config
      this.currentConfig = graphConfig;

      // Render graph (functionPlot is a global from CDN)
      if (typeof functionPlot === 'undefined') {
        throw new Error('function-plot library not loaded');
      }
      functionPlot(graphConfig);

      // Emit success event
      this.eventBus.emit('graph:rendered', {
        fn: fnFunction,
        a,
        b,
        width: graphConfig.width,
        height: graphConfig.height
      });

      return {
        success: true,
        error: null
      };

    } catch (error) {
      console.error('Error rendering graph:', error);
      this.eventBus.emit('graph:error', {
        fn: fnFunction,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build data array for function-plot
   * @private
   * @param {string|Object} fnFunction - Function to render
   * @param {number} [a] - Lower limit
   * @param {number} [b] - Upper limit
   * @param {Object} [options] - Additional options
   * @returns {Array} Data array
   */
  _buildDataArray(fnFunction, a, b, options) {
    const data = [];

    // Main function
    const fn = typeof fnFunction === 'object' ? fnFunction : { fn: fnFunction };
    data.push({
      ...fn,
      graphType: 'polyline',
      color: options.color || '#1976D2',
      sampler: 'builtIn',
      nSamples: options.nSamples || 1000
    });

      // Shaded area for definite integral
      if (a !== null && b !== null) {
        data.push({
          fn: fn.fn,
          graphType: 'area',
          closed: true,
          color: options.fillColor || 'rgba(25, 118, 210, 0.2)',
          boundaries: {
            x: { min: a, max: b }
          }
        });
      }

      return data;
  }

  /**
   * Update graph domain and range
   * @param {Object} domain - xDomain: [min, max]
   * @param {Object} range - yDomain: [min, max]
   * @returns {boolean} True if updated successfully
   */
  updateView(domain, range) {
    try {
      if (!this.currentConfig) {
        throw new Error('No graph rendered yet');
      }

      // Update config
      if (domain) {
        this.currentConfig.xDomain = domain;
      }
      if (range) {
        this.currentConfig.yDomain = range;
      }

      // Preserve integration limits when re-rendering
      let a = null;
      let b = null;
      if (this.currentConfig.data.length > 1) {
        const areaData = this.currentConfig.data[1];
        if (areaData.boundaries && areaData.boundaries.x) {
          a = areaData.boundaries.x.min;
          b = areaData.boundaries.x.max;
        }
      }

      // Re-render with new view and limits
      this.render(this.currentConfig.data[0].fn, a, b);

      return true;

    } catch (error) {
      console.error('Error updating view:', error);
      return false;
    }
  }

  /**
   * Zoom in
   * @param {number} [factor=1.5] - Zoom factor
   * @returns {boolean} True if successful
   */
  zoomIn(factor = 1.5) {
    try {
      if (!this.currentConfig) {
        throw new Error('No graph rendered yet');
      }

      const { xDomain, yDomain } = this.currentConfig;

      const xWidth = xDomain[1] - xDomain[0];
      const yHeight = yDomain[1] - yDomain[0];
      const xCenter = (xDomain[0] + xDomain[1]) / 2;
      const yCenter = (yDomain[0] + yDomain[1]) / 2;

      const newXDomain = [
        xCenter - xWidth / (2 * factor),
        xCenter + xWidth / (2 * factor)
      ];
      const newYDomain = [
        yCenter - yHeight / (2 * factor),
        yCenter + yHeight / (2 * factor)
      ];

      return this.updateView(newXDomain, newYDomain);

    } catch (error) {
      console.error('Error zooming in:', error);
      return false;
    }
  }

  /**
   * Zoom out
   * @param {number} [factor=1.5] - Zoom factor
   * @returns {boolean} True if successful
   */
  zoomOut(factor = 1.5) {
    try {
      if (!this.currentConfig) {
        throw new Error('No graph rendered yet');
      }

      const { xDomain, yDomain } = this.currentConfig;

      const xWidth = xDomain[1] - xDomain[0];
      const yHeight = yDomain[1] - yDomain[0];
      const xCenter = (xDomain[0] + xDomain[1]) / 2;
      const yCenter = (yDomain[0] + yDomain[1]) / 2;

      const newXDomain = [
        xCenter - (xWidth * factor) / 2,
        xCenter + (xWidth * factor) / 2
      ];
      const newYDomain = [
        yCenter - (yHeight * factor) / 2,
        yCenter + (yHeight * factor) / 2
      ];

      return this.updateView(newXDomain, newYDomain);

    } catch (error) {
      console.error('Error zooming out:', error);
      return false;
    }
  }

  /**
   * Reset view to default
   * @returns {boolean} True if successful
   */
  resetView() {
    try {
      if (!this.canvas) {
        throw new Error('Canvas not initialized');
      }

      // Re-render with default config
      this.config.xDomain = [-10, 10];
      this.config.yDomain = [-10, 10];
      this.currentConfig = null;

      return true;

    } catch (error) {
      console.error('Error resetting view:', error);
      return false;
    }
  }

  /**
   * Pan graph in specified direction
   * @param {number} dx - X direction (negative: left, positive: right)
   * @param {number} dy - Y direction (negative: down, positive: up)
   * @returns {boolean} True if successful
   */
  pan(dx, dy) {
    try {
      if (!this.currentConfig) {
        throw new Error('No graph rendered yet');
      }

      const { xDomain, yDomain } = this.currentConfig;

      const shiftFactor = 0.1;
      const xShift = (xDomain[1] - xDomain[0]) * shiftFactor * dx;
      const yShift = (yDomain[1] - yDomain[0]) * shiftFactor * dy;

      const newXDomain = [
        xDomain[0] + xShift,
        xDomain[1] + xShift
      ];
      const newYDomain = [
        yDomain[0] + yShift,
        yDomain[1] + yShift
      ];

      return this.updateView(newXDomain, newYDomain);

    } catch (error) {
      console.error('Error panning:', error);
      return false;
    }
  }

  /**
   * Toggle grid visibility
   * @param {boolean} [visible] - Grid visibility (toggles if not provided)
   * @returns {boolean} New grid state
   */
  toggleGrid(visible = null) {
    try {
      if (!this.currentConfig) {
        throw new Error('No graph rendered yet');
      }

      const newGridState = visible !== null ? visible : !this.config.grid;
      this.config.grid = newGridState;

      // Preserve integration limits when re-rendering
      let a = null;
      let b = null;
      if (this.currentConfig.data.length > 1) {
        const areaData = this.currentConfig.data[1];
        if (areaData.boundaries && areaData.boundaries.x) {
          a = areaData.boundaries.x.min;
          b = areaData.boundaries.x.max;
        }
      }

      // Re-render with grid toggle and limits
      this.render(this.currentConfig.data[0].fn, a, b);

      return newGridState;

    } catch (error) {
      console.error('Error toggling grid:', error);
      return false;
    }
  }

  /**
   * Set graph theme colors
   * @param {string} lineColor - Function line color
   * @param {string} fillColor - Fill color for area under curve
   * @param {string} limitColor - Limit line color
   */
  setTheme(lineColor, fillColor, limitColor) {
    this.config.lineColor = lineColor;
    this.config.fillColor = fillColor;
    this.config.limitColor = limitColor;
  }

  /**
   * Get current graph configuration
   * @returns {Object|null} Current config
   */
  getConfig() {
    return this.currentConfig;
  }

  /**
   * Set up resize observer for responsive graph
   * @private
   */
  _setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined' && this.canvas) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === this.canvas) {
            this._handleResize(entry.contentRect);
          }
        }
      });

      this.resizeObserver.observe(this.canvas);
    }
  }

  /**
   * Handle canvas resize
   * @private
   * @param {DOMRect} rect - New canvas dimensions
   */
  _handleResize(rect) {
    try {
      if (!this.currentConfig || this.animating) return;

      // Update size
      this.currentConfig.width = rect.width;
      this.currentConfig.height = rect.height;

      // Re-render after debounce
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
        this.render(this.currentConfig.data[0].fn);
      }, 100);

    } catch (error) {
      console.error('Error handling resize:', error);
    }
  }

  /**
   * Clear the graph
   * @returns {boolean} True if cleared successfully
   */
  clear() {
    try {
      if (this.canvas) {
        this.canvas.innerHTML = '';
      }
      this.currentConfig = null;
      return true;

    } catch (error) {
      console.error('Error clearing graph:', error);
      return false;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.clear();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    this.canvas = null;
    this.eventBus = null;
  }
}
