/**
 * main.js - Application Entry Point
 * @description Initializes the Hidraulicalc application
 * @version 2.0.0
 */

import { FunctionParser } from './components/integral/functionParser.js';
import { IntegralCalculator } from './components/integral/integralCalculator.js';
import { GraphRenderer } from './components/integral/graphRenderer.js';
import { EventBus } from './utils/eventBus.js';

const M3_TO_FT3 = 35.3147;

class App {
  constructor() {
    this.history = this._loadHistory();
    this.parser = null;
    this.calculator = null;
    this.renderer = null;
  }

  _loadHistory() {
    try {
      const stored = localStorage.getItem('hidraulicalc-history');
      if (stored === null) {
        return [];
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('Failed to parse history from localStorage, clearing corrupted data:', error);
      localStorage.removeItem('hidraulicalc-history');
      return [];
    }
  }

  async init() {
    try {
      console.log('🌊 Hidraulicalc initializing...');

      if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
      }

      this._initHydraulicCalculators();
      await this._initIntegralGrapher();
      this._initHistory();

      console.log('✅ Hidraulicalc initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Hidraulicalc:', error);
    }
  }

  _initHydraulicCalculators() {
    // Cylindrical Reservoir
    const cylForm = document.getElementById('form-cylindrical-reservoir');
    if (cylForm) {
      cylForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const radius = parseFloat(document.getElementById('cyl-radius').value);
        const height = parseFloat(document.getElementById('cyl-height').value);
        if (this._validate(radius, height)) {
          const volume = Math.PI * radius * radius * height;
          this._showResult('result-cylindrical-reservoir', 'cyl-volume', 'cyl-volume-ft', volume);
          this._addToHistory(`Embalse: r=${radius}m, h=${height}m → ${volume.toFixed(2)} m³`);
        }
      });
    }

    // Rectangular Channel
    const rectForm = document.getElementById('form-rectangular-channel');
    if (rectForm) {
      rectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const length = parseFloat(document.getElementById('rect-length').value);
        const width = parseFloat(document.getElementById('rect-width').value);
        const height = parseFloat(document.getElementById('rect-height').value);
        if (this._validate(length, width, height)) {
          const volume = length * width * height;
          this._showResult('result-rectangular-channel', 'rect-volume', 'rect-volume-ft', volume);
          this._addToHistory(`Canal: l=${length}m, w=${width}m, h=${height}m → ${volume.toFixed(2)} m³`);
        }
      });
    }

    // Vertical Tank
    const tankForm = document.getElementById('form-vertical-tank');
    if (tankForm) {
      tankForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const radius = parseFloat(document.getElementById('tank-radius').value);
        const height = parseFloat(document.getElementById('tank-height').value);
        if (this._validate(radius, height)) {
          const volume = Math.PI * radius * radius * height;
          this._showResult('result-vertical-tank', 'tank-volume', 'tank-volume-ft', volume);
          this._addToHistory(`Tanque: r=${radius}m, h=${height}m → ${volume.toFixed(2)} m³`);
        }
      });
    }
  }

  _validate(...values) {
    for (const v of values) {
      if (isNaN(v) || v <= 0) {
        this._toast('Por favor ingresa valores válidos mayores a 0', '#EF4444');
        return false;
      }
    }
    return true;
  }

  _showResult(containerId, volumeId, volumeFtId, volume) {
    const container = document.getElementById(containerId);
    const volumeEl = document.getElementById(volumeId);
    const volumeFtEl = document.getElementById(volumeFtId);

    if (volumeEl) volumeEl.textContent = volume.toFixed(2) + ' m³';
    if (volumeFtEl) volumeFtEl.textContent = (volume * M3_TO_FT3).toFixed(2) + ' ft³';
    if (container) {
      container.classList.remove('hidden');
      container.style.animation = 'slideIn 300ms ease-in-out';
    }

    this._toast(`✅ Volumen: ${volume.toFixed(2)} m³`, '#10B981');
  }

  async _initIntegralGrapher() {
    this.parser = new FunctionParser(new EventBus());
    this.calculator = new IntegralCalculator();

    const graphEl = document.getElementById('graph-plot');
    if (graphEl) {
      this.renderer = new GraphRenderer(new EventBus());
      this.renderer.init('#graph-plot');
    }

    const graphBtn = document.getElementById('btn-graph');
    if (graphBtn) {
      graphBtn.addEventListener('click', () => this._calculateIntegral());
    }

    // Enter key on inputs
    ['function-input', 'limit-lower', 'limit-upper'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this._calculateIntegral();
        });
      }
    });

    // Example buttons
    document.querySelectorAll('.btn-example').forEach(btn => {
      btn.addEventListener('click', () => {
        const fn = btn.dataset.function;
        const fnInput = document.getElementById('function-input');
        const limitA = document.getElementById('limit-lower');
        const limitB = document.getElementById('limit-upper');

        if (fnInput) fnInput.value = fn;

        if (fn === 'ln(x)') {
          if (limitA) limitA.value = 0.1;
          if (limitB) limitB.value = 5;
        } else if (fn.includes('e^')) {
          if (limitA) limitA.value = -2;
          if (limitB) limitB.value = 2;
        } else {
          if (limitA) limitA.value = -5;
          if (limitB) limitB.value = 5;
        }

        this._calculateIntegral();
      });
    });
  }

  _calculateIntegral() {
    const fnInput = document.getElementById('function-input');
    const limitA = document.getElementById('limit-lower');
    const limitB = document.getElementById('limit-upper');

    const fn = fnInput ? fnInput.value.trim() : '';
    const a = parseFloat(limitA?.value);
    const b = parseFloat(limitB?.value);

    if (!fn) {
      this._toast('Por favor ingresa una función', '#EF4444');
      return;
    }
    if (isNaN(a) || isNaN(b)) {
      this._toast('Por favor ingresa límites válidos', '#EF4444');
      return;
    }
    if (a >= b) {
      this._toast('El límite inferior debe ser menor que el superior', '#EF4444');
      return;
    }

    try {
      const parseResult = this.parser.parse(fn);
      if (!parseResult.valid) {
        this._toast(parseResult.error || 'Error al analizar la función', '#EF4444');
        return;
      }

      const result = this.calculator.integrate(
        (x) => this.parser.evaluate(parseResult, x),
        a, b
      );

      // Render graph
      if (this.renderer) {
        this.renderer.render(parseResult.corrected, a, b, {
          color: '#3B82F6',
          fillColor: 'rgba(59, 130, 246, 0.2)',
          limitColor: '#EF4444'
        });
      }

      // Show result
      const areaResult = document.getElementById('area-result');
      const areaValue = document.getElementById('integral-area');
      if (areaResult) areaResult.classList.remove('hidden');
      if (areaValue) {
        const val = result.value;
        areaValue.textContent = Math.abs(val) < 0.0001 || Math.abs(val) > 1000000
          ? val.toExponential(4)
          : val.toFixed(6).replace(/\.?0+$/, '');
      }

      this._addToHistory(`∫[${a}, ${b}] ${parseResult.corrected} dx = ${result.value.toFixed(6)}`);
      this._toast('✅ Integral calculada correctamente', '#10B981');

    } catch (error) {
      console.error('Error calculating integral:', error);
      this._toast('Error al calcular la integral', '#EF4444');
    }
  }

  _initHistory() {
    const fab = document.getElementById('btn-history-fab');
    const modal = document.getElementById('history-modal');
    const closeBtns = modal?.querySelectorAll('.close-modal');
    const clearBtn = document.getElementById('btn-clear-history-modal');

    if (fab && modal) {
      fab.addEventListener('click', () => {
        modal.classList.remove('hidden');
        this._renderHistory();
      });
    }

    if (closeBtns) {
      closeBtns.forEach(btn => {
        btn.addEventListener('click', () => modal?.classList.add('hidden'));
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        modal.classList.add('hidden');
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('¿Borrar todo el historial?')) {
          this.history = [];
          localStorage.setItem('hidraulicalc-history', '[]');
          this._renderHistory();
          this._toast('🗑️ Historial borrado', '#64748B');
        }
      });
    }
  }

  _addToHistory(display) {
    this.history.unshift({
      display,
      timestamp: new Date().toISOString()
    });
    if (this.history.length > 50) this.history = this.history.slice(0, 50);
    localStorage.setItem('hidraulicalc-history', JSON.stringify(this.history));
  }

  _renderHistory() {
    const list = document.getElementById('history-list-modal');
    if (!list) return;

    if (this.history.length === 0) {
      list.innerHTML = '<p class="history-empty">No hay cálculos guardados</p>';
      return;
    }

    list.innerHTML = this.history.map(entry => {
      const date = new Date(entry.timestamp);
      const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      return `
        <div class="history-item">
          <span>${entry.display}</span>
          <span class="history-timestamp">${time}</span>
        </div>
      `;
    }).join('');
  }

  _toast(message, background = '#3B82F6') {
    if (typeof Toastify !== 'undefined') {
      Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        style: { background }
      }).showToast();
    }
  }
}

const app = new App();
app.init();

export default app;
