/**
 * integralCalculator.js - Numerical Integration Calculator
 * @description Implements numerical integration algorithms (Simpson's rule, adaptive quadrature)
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Integration result structure
 * @typedef {Object} IntegrationResult
 * @property {number} value - Calculated integral value
 * @property {number} error - Error estimate
 * @property {number} iterations - Number of iterations performed
 * @property {boolean} converged - Whether the algorithm converged
 * @property {string} method - Method used (simpson, adaptive)
 */

/**
 * Integral Calculator
 * Performs numerical integration using various methods
 */
export class IntegralCalculator {
  constructor() {
    // Default parameters
    this.defaultIterations = 1000;  // Default number of intervals
    this.tolerance = 1e-8;          // Convergence tolerance
    this.maxIterations = 10000;     // Maximum iterations for adaptive method

    // Simpson's rule constants
    this.SIMPSON_MIN_INTERVALS = 4;    // Minimum intervals (must be even)
    this.SIMPSON_MAX_INTERVALS = 10000;

    // Adaptive quadrature parameters
    this.ADAPTIVE_MAX_DEPTH = 20;
    this.ADAPTIVE_MIN_TOLERANCE = 1e-12;
  }

  /**
   * Calculate definite integral using Simpson's rule
   * @param {Function} fn - Function to integrate (takes x, returns y)
   * @param {number} a - Lower limit of integration
   * @param {number} b - Upper limit of integration
   * @param {number} [n] - Number of intervals (optional, uses default if not provided)
   * @param {boolean} [skipErrorEstimation] - Skip error estimation to prevent infinite recursion
   * @returns {IntegrationResult} Integration result
   */
  integrateSimpson(fn, a, b, n = null, skipErrorEstimation = false) {
    try {
      // Validate inputs
      if (typeof fn !== 'function') {
        throw new Error('fn must be a function');
      }
      if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Integration limits must be numbers');
      }
      if (a >= b) {
        throw new Error('Lower limit must be less than upper limit');
      }

      // Determine number of intervals
      const intervals = n || this._calculateOptimalIntervals(fn, a, b);

      // Ensure even number of intervals (required for Simpson's rule)
      const nFinal = Math.max(4, Math.ceil(intervals / 2) * 2);
      const nFinalClamped = Math.min(nFinal, this.SIMPSON_MAX_INTERVALS);

      const h = (b - a) / nFinalClamped;

      // Simpson's rule: ∫f(x)dx ≈ (h/3)[f(a) + 4f(x1) + 2f(x2) + 4f(x3) + ... + f(b)]
      let sum = 0;
      const firstValue = fn(a);
      if (!isFinite(firstValue)) {
        throw new Error(`Function undefined at x = ${a}`);
      }
      sum += firstValue;

      // Loop through interior points
      for (let i = 1; i < nFinalClamped; i++) {
        const x = a + i * h;
        let y;
        try {
          y = fn(x);
        } catch (e) {
          throw new Error(`Function error at x = ${x}: ${e.message}`);
        }

        // Check for invalid values
        if (!isFinite(y)) {
          throw new Error(`Function undefined at x = ${x}`);
        }

        // Alternate coefficients: 4, 2, 4, 2, ...
        const coefficient = (i % 2 === 1) ? 4 : 2;
        sum += coefficient * y;
      }

      const lastValue = fn(b);
      if (!isFinite(lastValue)) {
        throw new Error(`Function undefined at x = ${b}`);
      }
      sum += lastValue;

      // Calculate integral
      const value = (h / 3) * sum;

      // Estimate error (using Richardson extrapolation) - skip if requested to avoid infinite recursion
      const error = skipErrorEstimation ? 0 : this._estimateSimpsonError(fn, a, b, nFinalClamped);

      return {
        value,
        error,
        iterations: nFinalClamped,
        converged: error < this.tolerance,
        method: 'simpson'
      };

    } catch (error) {
      console.error('Error in integrateSimpson():', error);
      return {
        value: NaN,
        error: Infinity,
        iterations: 0,
        converged: false,
        method: 'simpson'
      };
    }
  }

  /**
   * Calculate definite integral using adaptive quadrature
   * @param {Function} fn - Function to integrate
   * @param {number} a - Lower limit
   * @param {number} b - Upper limit
   * @param {number} [tolerance] - Error tolerance (uses default if not provided)
   * @returns {IntegrationResult} Integration result
   */
  integrateAdaptive(fn, a, b, tolerance = null) {
    try {
      const tol = tolerance || this.tolerance;

      // Initial Simpson integration (skip error estimation to prevent loops in error estimation)
      const initialResult = this.integrateSimpson(fn, a, b, this.SIMPSON_MIN_INTERVALS, true);

      if (!initialResult.converged || isNaN(initialResult.value)) {
        return initialResult;
      }

      // Apply adaptive refinement
      const adaptiveResult = this._adaptiveQuadrature(fn, a, b, initialResult, tol, 0);

      return {
        value: adaptiveResult.value,
        error: adaptiveResult.error,
        iterations: adaptiveResult.iterations,
        converged: adaptiveResult.error < tol,
        method: 'adaptive'
      };

    } catch (error) {
      console.error('Error in integrateAdaptive():', error);
      return {
        value: NaN,
        error: Infinity,
        iterations: 0,
        converged: false,
        method: 'adaptive'
      };
    }
  }

  /**
   * Calculate integral automatically (chooses best method)
   * @param {Function} fn - Function to integrate
   * @param {number} a - Lower limit
   * @param {number} b - Upper limit
   * @returns {IntegrationResult} Integration result
   */
  integrate(fn, a, b) {
    try {
      // Try adaptive method first (most accurate for most functions)
      const adaptiveResult = this.integrateAdaptive(fn, a, b);

      if (adaptiveResult.converged) {
        return adaptiveResult;
      }

// Fall back to Simpson's rule
            return this.integrateSimpson(fn, a, b, null, false);

    } catch (error) {
      console.error('Error in integrate():', error);
      return {
        value: NaN,
        error: Infinity,
        iterations: 0,
        converged: false,
        method: 'auto'
      };
    }
  }

  /**
   * Calculate optimal number of intervals for Simpson's rule
   * @private
   * @param {Function} fn - Function to integrate
   * @param {number} a - Lower limit
   * @param {number} b - Upper limit
   * @returns {number} Optimal interval count
   */
  _calculateOptimalIntervals(fn, a, b) {
    try {
      // Sample the function to determine complexity
      const samplePoints = 10;
      const h = (b - a) / samplePoints;
      const values = [];

      for (let i = 0; i <= samplePoints; i++) {
        const x = a + i * h;
        let y;
        try {
          y = fn(x);
        } catch (e) {
          // If function evaluation fails, use default intervals
          return this.defaultIterations;
        }

        if (!isFinite(y)) {
          // If function returns non-finite value, use default intervals
          return this.defaultIterations;
        }
        values.push(y);
      }

      // Calculate curvature (second derivative approximation)
      let maxCurvature = 0;
      for (let i = 1; i < values.length - 1; i++) {
        const curvature = Math.abs(values[i + 1] - 2 * values[i] + values[i - 1]);
        maxCurvature = Math.max(maxCurvature, curvature);
      }

      // More curvature = more intervals needed
      const baseIntervals = this.defaultIterations;
      const curvatureFactor = Math.min(5, 1 + maxCurvature * 10);

      return Math.ceil(baseIntervals * curvatureFactor);

    } catch (error) {
      console.error('Error calculating optimal intervals:', error);
      return this.defaultIterations;
    }
  }

  /**
   * Estimate Simpson's rule error using Richardson extrapolation
   * @private
   * @param {Function} fn - Function to integrate
   * @param {number} a - Lower limit
   * @param {number} b - Upper limit
   * @param {number} n - Number of intervals
   * @returns {number} Error estimate
   */
  _estimateSimpsonError(fn, a, b, n) {
    try {
      // Calculate with n intervals (skip error estimation to prevent infinite recursion)
      const result1 = this.integrateSimpson(fn, a, b, n, true);

      // Calculate with n/2 intervals (skip error estimation to prevent infinite recursion)
      const result2 = this.integrateSimpson(fn, a, b, Math.max(4, n / 2), true);

      // Richardson extrapolation error estimate
      const error = Math.abs(result1.value - result2.value) / 15;

      return error;

    } catch (error) {
      console.error('Error estimating Simpson error:', error);
      return Infinity;
    }
  }

  /**
   * Adaptive quadrature implementation
   * @private
   * @param {Function} fn - Function to integrate
   * @param {number} a - Lower limit
   * @param {number} b - Upper limit
   * @param {IntegrationResult} prevResult - Previous result
   * @param {number} tolerance - Error tolerance
   * @param {number} depth - Current recursion depth
   * @returns {IntegrationResult} Refined result
   */
  _adaptiveQuadrature(fn, a, b, prevResult, tolerance, depth) {
    try {
// Check recursion depth
            if (depth > this.ADAPTIVE_MAX_DEPTH) {
                return prevResult;
            }

      // Check convergence
      if (prevResult.error < tolerance || !isFinite(prevResult.error)) {
        return prevResult;
      }

      // Split interval
      const mid = (a + b) / 2;

      // Integrate sub-intervals (skip error estimation to prevent loops)
      const leftResult = this.integrateSimpson(fn, a, mid, this.SIMPSON_MIN_INTERVALS, true);
      const rightResult = this.integrateSimpson(fn, mid, b, this.SIMPSON_MIN_INTERVALS, true);

      if (!leftResult.converged || !rightResult.converged) {
        return prevResult;
      }

      // Combine results
      const value = leftResult.value + rightResult.value;
      const error = Math.abs(value - prevResult.value);
      const iterations = prevResult.iterations + leftResult.iterations + rightResult.iterations;

      // Recursively refine if needed
      if (error > tolerance && isFinite(error)) {
        // Try to refine sub-intervals with larger error
        const leftError = Math.abs(leftResult.error);
        const rightError = Math.abs(rightResult.error);

        let resultLeft = leftResult;
        let resultRight = rightResult;

        // Refine sub-intervals with larger error
        if (leftError > tolerance / 2) {
          resultLeft = this._adaptiveQuadrature(fn, a, mid, leftResult, tolerance / 2, depth + 1);
        }
        if (rightError > tolerance / 2) {
          resultRight = this._adaptiveQuadrature(fn, mid, b, rightResult, tolerance / 2, depth + 1);
        }

        // Recalculate error after refinement
        const refinedValue = resultLeft.value + resultRight.value;
        const refinedError = Math.abs(refinedValue - prevResult.value);

        return {
          value: refinedValue,
          error: refinedError,
          iterations: resultLeft.iterations + resultRight.iterations,
          converged: refinedError < tolerance,
          method: 'adaptive'
        };
      }

      return {
        value,
        error,
        iterations,
        converged: error < tolerance,
        method: 'adaptive'
      };

    } catch (error) {
      console.error('Error in adaptive quadrature:', error);
      return prevResult;
    }
  }

  /**
   * Check if function is well-behaved on interval
   * @param {Function} fn - Function to check
   * @param {number} a - Lower limit
   * @param {number} b - Upper limit
   * @returns {boolean} True if function is well-behaved
   */
  isWellBehaved(fn, a, b) {
    try {
      // Validate that fn is callable before executing
      if (typeof fn !== 'function') {
        return false;
      }

      const samplePoints = 20;
      const h = (b - a) / samplePoints;

      for (let i = 0; i <= samplePoints; i++) {
        const x = a + i * h;

        // Skip if too close to potential singularities
        if (x === 0) continue;

        const y = fn(x);

        // Check for undefined/infinite values
        if (typeof y !== 'number' || isNaN(y) || !isFinite(y)) {
          return false;
        }
      }

      return true;

    } catch (error) {
      console.error('Error checking if function is well-behaved:', error);
      return false;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    // No resources to clean up
  }
}
