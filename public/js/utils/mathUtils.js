/**
 * mathUtils.js - Mathematical Utilities
 * @description Mathematical helper functions and constants
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

/**
 * Mathematical constants
 */
export const MathConstants = {
  PI: Math.PI,
  E: Math.E,

  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  degToRad(degrees) {
    return degrees * (Math.PI / 180);
  },

  /**
   * Convert radians to degrees
   * @param {number} radians - Angle in radians
   * @returns {number} Angle in degrees
   */
  radToDeg(radians) {
    return radians * (180 / Math.PI);
  }
};

/**
 * Volume calculation helpers
 */
export const VolumeUtils = {
  /**
   * Calculate cylindrical volume
   * V = π * r² * h
   * @param {number} radius - Radius in meters
   * @param {number} height - Height in meters
   * @returns {number} Volume in cubic meters
   */
  cylinderVolume(radius, height) {
    return Math.PI * Math.pow(radius, 2) * height;
  },

  /**
   * Calculate rectangular volume
   * V = l * w * h
   * @param {number} length - Length in meters
   * @param {number} width - Width in meters
   * @param {number} height - Height in meters
   * @returns {number} Volume in cubic meters
   */
  rectangularVolume(length, width, height) {
    return length * width * height;
  },

  /**
   * Convert cubic meters to cubic feet
   * @param {number} cubicMeters - Volume in cubic meters
   * @returns {number} Volume in cubic feet
   */
  m3ToFt3(cubicMeters) {
    return cubicMeters * 35.3147;
  }
};

/**
 * Number formatting helpers
 */
export const FormatUtils = {
  /**
   * Format number to fixed decimal places
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted string
   */
  toFixed(value, decimals = 2) {
    return Number(value).toFixed(decimals);
  },

  /**
   * Format number with thousands separator
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted string
   */
  withCommas(value, decimals = 2) {
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  },

  /**
   * Safe number parsing
   * @param {*} value - Value to parse
   * @param {number} defaultValue - Default value if parsing fails
   * @returns {number} Parsed number
   */
  safeParse(value, defaultValue = 0) {
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
};

/**
 * Validation helpers
 */
export const ValidationUtils = {
  /**
   * Check if value is a positive number
   * @param {*} value - Value to check
   * @returns {boolean} True if positive number
   */
  isPositive(value) {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  /**
   * Check if value is a valid number
   * @param {*} value - Value to check
   * @returns {boolean} True if valid number
   */
  isNumber(value) {
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  },

  /**
   * Validate dimension input
   * @param {string|number} value - Dimension value
   * @param {string} fieldName - Field name for error message
   * @returns {Object} Validation result { valid, error }
   */
  validateDimension(value, fieldName) {
    const num = Number(value);

    if (isNaN(num)) {
      return {
        valid: false,
        error: `${fieldName} must be a valid number`
      };
    }

    if (num < 0) {
      return {
        valid: false,
        error: `${fieldName} must be positive`
      };
    }

    if (num === 0) {
      return {
        valid: false,
        error: `${fieldName} must be greater than 0`
      };
    }

    return { valid: true };
  }
};

export default {
  MathConstants,
  VolumeUtils,
  FormatUtils,
  ValidationUtils
};
