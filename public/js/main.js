/**
 * main.js - Application Entry Point
 * @description Initializes the Hidraulicalc application
 * @version 3.0.0
 */

import { EventBus } from './utils/eventBus.js';
import { ToastManager } from './utils/toastManager.js';
import { HistoryManager } from './utils/historyManager.js';
import { IntegralGrapher } from './components/integral/integralGrapher.js';

const M3_TO_FT3 = 35.3147;

class App {
    constructor() {
        this.eventBus = new EventBus();
        this.toastManager = new ToastManager();
        this.historyManager = new HistoryManager();
        this.integralGrapher = null;
    }

    async init() {
        try {
            // Wait for DOM
            if (document.readyState === 'loading') {
                await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
            }

            // Initialize utilities
            this.toastManager.init();
            this.historyManager.init();
            this.eventBus.init();

            // Initialize hydraulic calculators
            this._initHydraulicCalculators();

            // Initialize integral grapher
            await this._initIntegralGrapher();

            // Initialize history modal
            this._initHistoryModal();

        } catch (error) {
            console.error('Failed to initialize Hidraulicalc:', error);
            this.toastManager.error('Error al inicializar la aplicación');
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
                if (this._validateHydraulicInput(radius, height)) {
                    const volume = Math.PI * radius * radius * height;
                    this._showHydraulicResult('result-cylindrical-reservoir', 'cyl-volume', 'cyl-volume-ft', volume);
                    this.historyManager.add('cylindrical-reservoir', { radius, height }, { volume });
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
                if (this._validateHydraulicInput(length, width, height)) {
                    const volume = length * width * height;
                    this._showHydraulicResult('result-rectangular-channel', 'rect-volume', 'rect-volume-ft', volume);
                    this.historyManager.add('rectangular-channel', { length, width, height }, { volume });
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
                if (this._validateHydraulicInput(radius, height)) {
                    const volume = Math.PI * radius * radius * height;
                    this._showHydraulicResult('result-vertical-tank', 'tank-volume', 'tank-volume-ft', volume);
                    this.historyManager.add('vertical-tank', { radius, height }, { volume });
                }
            });
        }
    }

    _validateHydraulicInput(...values) {
        for (const v of values) {
            if (isNaN(v)) {
                this.toastManager.error('Por favor ingresa un número válido');
                return false;
            }
            if (v <= 0) {
                this.toastManager.error('Por favor ingresa un valor mayor a 0');
                return false;
            }
        }
        return true;
    }

    _showHydraulicResult(containerId, volumeId, volumeFtId, volume) {
        const container = document.getElementById(containerId);
        const volumeEl = document.getElementById(volumeId);
        const volumeFtEl = document.getElementById(volumeFtId);

        if (volumeEl) volumeEl.textContent = volume.toFixed(2) + ' m³';
        if (volumeFtEl) volumeFtEl.textContent = (volume * M3_TO_FT3).toFixed(2) + ' ft³';
        if (container) {
            container.classList.remove('hidden');
        }

        this.toastManager.success(`Volumen: ${volume.toFixed(2)} m³`);
    }

    async _initIntegralGrapher() {
        this.integralGrapher = new IntegralGrapher(
            this.eventBus,
            this.toastManager,
            this.historyManager
        );

        await this.integralGrapher.init();
    }

    _initHistoryModal() {
        const fab = document.getElementById('btn-history-fab');
        const modal = document.getElementById('history-modal');
        const closeBtns = modal?.querySelectorAll('.close-modal');
        const clearBtn = document.getElementById('btn-clear-history-modal');

        if (fab && modal) {
            fab.addEventListener('click', () => {
                modal.classList.remove('hidden');
                this._renderHistoryList();
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
                    this.historyManager.clear();
                    this._renderHistoryList();
                    this.toastManager.info('Historial borrado');
                }
            });
        }
    }

    _renderHistoryList() {
        const list = document.getElementById('history-list-modal');
        if (!list) return;

        const history = this.historyManager.getAll();

        if (history.length === 0) {
            list.innerHTML = '<p class="history-empty">No hay cálculos guardados</p>';
            return;
        }

        list.innerHTML = history.map(entry => {
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
}

// Initialize application
const app = new App();
app.init();

export default app;
