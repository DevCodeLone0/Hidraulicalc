/**
 * graphControls.js - Graph Interaction Controls
 * @description Provides zoom, pan, and view controls for the graph
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Graph Controls
 * Manages user interaction with the graph
 */
export class GraphControls {
  /**
   * Create a new GraphControls
   * @param {EventBus} eventBus - Event bus for pub/sub communication
   * @param {GraphRenderer} graphRenderer - The graph renderer instance
   */
  constructor(eventBus, graphRenderer) {
    this.eventBus = eventBus;
    this.renderer = graphRenderer;

    // Control elements
    this.zoomInBtn = null;
    this.zoomOutBtn = null;
    this.resetBtn = null;
    this.gridBtn = null;
    this.expandBtn = null;
    this.exportBtn = null;

    // Pan controls
    this.panUpBtn = null;
    this.panDownBtn = null;
    this.panLeftBtn = null;
    this.panRightBtn = null;

    // State
    this.gridVisible = true;
    this.initialized = false;

    // Bound handler references for cleanup
    this._boundKeyHandler = null;
    this._boundWheelHandler = null;
  }

  /**
   * Initialize the controls
   * @returns {boolean} True if initialized successfully
   */
  init() {
    try {
      console.log('🎮 GraphControls initializing...');

      // Get control elements
      this._findControlElements();

      // Set up event listeners
      if (this.zoomInBtn) this.zoomInBtn.addEventListener('click', () => this.handleZoomIn());
      if (this.zoomOutBtn) this.zoomOutBtn.addEventListener('click', () => this.handleZoomOut());
      if (this.resetBtn) this.resetBtn.addEventListener('click', () => this.handleReset());
      if (this.gridBtn) this.gridBtn.addEventListener('click', () => this.handleToggleGrid());
      if (this.expandBtn) this.expandBtn.addEventListener('click', () => this.handleExpand());
      if (this.exportBtn) this.exportBtn.addEventListener('click', () => this.handleExport());

      // Pan controls
      if (this.panUpBtn) this.panUpBtn.addEventListener('click', () => this.handlePan(0, 1));
      if (this.panDownBtn) this.panDownBtn.addEventListener('click', () => this.handlePan(0, -1));
      if (this.panLeftBtn) this.panLeftBtn.addEventListener('click', () => this.handlePan(-1, 0));
      if (this.panRightBtn) this.panRightBtn.addEventListener('click', () => this.handlePan(1, 0));

      // Set up keyboard shortcuts
      this._setupKeyboardShortcuts();

      // Set up wheel zoom
      this._setupWheelZoom();

      this.initialized = true;
      console.log('✅ GraphControls initialized');
      return true;

    } catch (error) {
      console.error('Error initializing GraphControls:', error);
      return false;
    }
  }

  /**
   * Find control elements in DOM
   * @private
   */
  _findControlElements() {
    this.zoomInBtn = document.getElementById('btn-zoom-in');
    this.zoomOutBtn = document.getElementById('btn-zoom-out');
    this.resetBtn = document.getElementById('btn-reset-view');
    this.gridBtn = document.getElementById('btn-toggle-grid');
    this.expandBtn = document.getElementById('btn-expand-graph');
    this.exportBtn = document.getElementById('btn-export-graph');

    // Pan controls
    this.panUpBtn = document.getElementById('btn-pan-up');
    this.panDownBtn = document.getElementById('btn-pan-down');
    this.panLeftBtn = document.getElementById('btn-pan-left');
    this.panRightBtn = document.getElementById('btn-pan-right');

    // Show controls that are found
    const allControls = [
      this.zoomInBtn, this.zoomOutBtn, this.resetBtn, this.gridBtn,
      this.expandBtn, this.exportBtn, this.panUpBtn, this.panDownBtn,
      this.panLeftBtn, this.panRightBtn
    ];

    allControls.forEach(ctrl => {
      if (ctrl) {
        ctrl.style.display = '';
      }
    });
  }

  /**
   * Handle zoom in action
   */
  handleZoomIn() {
    try {
      const success = this.renderer.zoomIn(1.5);
      if (success) {
        this.eventBus.emit('graph:zoomed', { direction: 'in', factor: 1.5 });
      }
    } catch (error) {
      console.error('Error zooming in:', error);
      this.eventBus.emit('graph:error', { error: error.message });
    }
  }

  /**
   * Handle zoom out action
   */
  handleZoomOut() {
    try {
      const success = this.renderer.zoomOut(1.5);
      if (success) {
        this.eventBus.emit('graph:zoomed', { direction: 'out', factor: 1.5 });
      }
    } catch (error) {
      console.error('Error zooming out:', error);
      this.eventBus.emit('graph:error', { error: error.message });
    }
  }

  /**
   * Handle reset view action
   */
  handleReset() {
    try {
      const success = this.renderer.resetView();
      if (success) {
        this.eventBus.emit('graph:reset', {});
      }
    } catch (error) {
      console.error('Error resetting view:', error);
      this.eventBus.emit('graph:error', { error: error.message });
    }
  }

  /**
   * Handle toggle grid action
   */
  handleToggleGrid() {
    try {
      this.gridVisible = this.renderer.toggleGrid();

      // Update button text/class
      if (this.gridBtn) {
        if (this.gridVisible) {
          this.gridBtn.textContent = '📐';
          this.gridBtn.title = 'Ocultar cuadrícula';
          this.gridBtn.classList.remove('grid-hidden');
        } else {
          this.gridBtn.textContent = '📏';
          this.gridBtn.title = 'Mostrar cuadrícula';
          this.gridBtn.classList.add('grid-hidden');
        }
      }

      this.eventBus.emit('grid:toggled', { visible: this.gridVisible });
    } catch (error) {
      console.error('Error toggling grid:', error);
      this.eventBus.emit('graph:error', { error: error.message });
    }
  }

  /**
   * Handle expand graph action (fullscreen)
   */
  handleExpand() {
    try {
      const canvas = this.renderer.canvas;
      if (!canvas) return;

      if (!document.fullscreenElement) {
        canvas.requestFullscreen().catch(err => {
          console.error('Error entering fullscreen:', err);
          this.eventBus.emit('graph:error', { error: 'No se pudo activar pantalla completa' });
        });
      } else {
        document.exitFullscreen();
      }

      this.eventBus.emit('graph:fullscreen', { isFullscreen: !!document.fullscreenElement });
    } catch (error) {
      console.error('Error expanding graph:', error);
      this.eventBus.emit('graph:error', { error: error.message });
    }
  }

  /**
   * Handle export graph action
   */
  handleExport() {
    try {
      const canvas = this.renderer.canvas;
      if (!canvas) {
        throw new Error('Canvas no encontrado');
      }

      // Find the SVG element
      const svg = canvas.querySelector('svg');
      if (!svg) {
        throw new Error('No se pudo encontrar el gráfico para exportar');
      }

      // Serialize SVG
      const serializer = new XMLSerializer();
      const svgData = serializer.serializeToString(svg);

      // Create blob
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      // Download
      const link = document.createElement('a');
      link.href = url;
      link.download = `grafico-hidraulicalc-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      this.eventBus.emit('graph:exported', { format: 'svg' });
    } catch (error) {
      console.error('Error exporting graph:', error);
      this.eventBus.emit('graph:error', { error: 'Error al exportar el gráfico' });
    }
  }

  /**
   * Handle pan action
   * @param {number} dx - X direction
   * @param {number} dy - Y direction
   */
  handlePan(dx, dy) {
    try {
      const success = this.renderer.pan(dx, dy);
      if (success) {
        this.eventBus.emit('graph:panned', { dx, dy });
      }
    } catch (error) {
      console.error('Error panning:', error);
      this.eventBus.emit('graph:error', { error: error.message });
    }
  }

  /**
   * Set up keyboard shortcuts
   * @private
   */
  _setupKeyboardShortcuts() {
    if (typeof window === 'undefined') return;

    this._boundKeyHandler = (e) => {
      // Only when graph has focus or no input is focused
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      switch(e.key) {
        case '+':
        case '=':
          this.handleZoomIn();
          e.preventDefault();
          break;
        case '-':
          this.handleZoomOut();
          e.preventDefault();
          break;
        case 'r':
        case 'R':
          this.handleReset();
          e.preventDefault();
          break;
        case 'g':
        case 'G':
          this.handleToggleGrid();
          e.preventDefault();
          break;
        case 'ArrowUp':
          this.handlePan(0, 1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          this.handlePan(0, -1);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          this.handlePan(-1, 0);
          e.preventDefault();
          break;
        case 'ArrowRight':
          this.handlePan(1, 0);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', this._boundKeyHandler);
  }

  /**
   * Set up wheel zoom on canvas
   * @private
   */
  _setupWheelZoom() {
    if (!this.renderer.canvas) return;

    this._boundWheelHandler = (e) => {
      e.preventDefault();

      // Zoom in
      if (e.deltaY < 0) {
        this.handleZoomIn();
      }
      // Zoom out
      else {
        this.handleZoomOut();
      }
    };

    this.renderer.canvas.addEventListener('wheel', this._boundWheelHandler, { passive: false });
  }

  /**
   * Enable/disable controls
   * @param {boolean} enabled - Whether controls should be enabled
   */
  setEnabled(enabled) {
    const allControls = [
      this.zoomInBtn, this.zoomOutBtn, this.resetBtn, this.gridBtn,
      this.expandBtn, this.exportBtn, this.panUpBtn, this.panDownBtn,
      this.panLeftBtn, this.panRightBtn
    ];

    allControls.forEach(ctrl => {
      if (ctrl) {
        ctrl.disabled = !enabled;
      }
    });
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Remove event listeners to prevent memory leaks
    if (this._boundKeyHandler && typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._boundKeyHandler);
      this._boundKeyHandler = null;
    }

    if (this._boundWheelHandler && this.renderer && this.renderer.canvas) {
      this.renderer.canvas.removeEventListener('wheel', this._boundWheelHandler);
      this._boundWheelHandler = null;
    }

    this.renderer = null;
    this.eventBus = null;

    if (this.zoomInBtn) this.zoomInBtn = null;
    if (this.zoomOutBtn) this.zoomOutBtn = null;
    if (this.resetBtn) this.resetBtn = null;
    if (this.gridBtn) this.gridBtn = null;
    if (this.expandBtn) this.expandBtn = null;
    if (this.exportBtn) this.exportBtn = null;
    if (this.panUpBtn) this.panUpBtn = null;
    if (this.panDownBtn) this.panDownBtn = null;
    if (this.panLeftBtn) this.panLeftBtn = null;
    if (this.panRightBtn) this.panRightBtn = null;
  }
}
