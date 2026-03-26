/**
 * functionParser.js - Math Expression Parser
 * @description Parses user input mathematical expressions using math.js
 * Supports linear, polynomial, trigonometric, exponential, logarithmic, and complex integrals
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

// mathjs is loaded via CDN as a global variable
import { ErrorCorrectionPipeline } from '../../utils/errorCorrection.js';

/**
 * Parse result structure
 * @typedef {Object} ParseResult
 * @property {Function|null} fn - Parsed function ready for evaluation
 * @property {Object|null} node - math.js AST node
 * @property {boolean} valid - Whether parsing was successful
 * @property {string} error - Error message if parsing failed
 * @property {string} corrected - Corrected expression after error correction
 * @property {string[]} corrections - List of corrections applied
 */

/**
 * Function Parser
 * Parses and validates mathematical expressions for integration
 */
export class FunctionParser {
  /**
   * Create a new FunctionParser
   * @param {EventBus} eventBus - Event bus for pub/sub communication
   */
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.errorCorrection = new ErrorCorrectionPipeline();

    // Supported function patterns for validation
    this.supportedPatterns = [
      /^[a-z0-9+\-*/^()\s.,e]+$/i,  // Basic arithmetic
      /sin|cos|tan|cot|csc|sec/,      // Trigonometric
      /ln|log|sqrt|abs/,             // Math functions
      /exp|e\^/,                     // Exponential
      /asin|acos|atan/               // Inverse trigonometric
    ];
  }

  /**
   * Parse a mathematical expression
   * @param {string} expression - The expression to parse
   * @returns {ParseResult} Parse result
   */
  parse(expression) {
    try {
      const original = expression;

      // Step 1: Apply error correction pipeline
      const correctionResult = this.errorCorrection.correct(expression);

      // Step 2: Validate basic structure
      if (!this._validateStructure(correctionResult.corrected)) {
        return {
          fn: null,
          node: null,
          valid: false,
          error: 'La expresión contiene caracteres inválidos',
          corrected: correctionResult.corrected,
          corrections: correctionResult.corrections
        };
      }

      // Step 3: Parse with math.js
      let node;
      try {
        if (typeof math === 'undefined') {
          throw new Error('mathjs library not loaded');
        }
        node = math.parse(correctionResult.corrected);
      } catch (parseError) {
        return {
          fn: null,
          node: null,
          valid: false,
          error: `Error de sintaxis: ${parseError.message}`,
          corrected: correctionResult.corrected,
          corrections: correctionResult.corrections
        };
      }

      // Step 4: Compile to function
      let fn;
      try {
        fn = node.compile();
      } catch (compileError) {
        return {
          fn: null,
          node: null,
          valid: false,
          error: `Error al compilar: ${compileError.message}`,
          corrected: correctionResult.corrected,
          corrections: correctionResult.corrections
        };
      }

      // Step 5: Test with sample value
      try {
        const testValue = fn.evaluate({ x: 1 });
        if (typeof testValue !== 'number' || isNaN(testValue) || !isFinite(testValue)) {
          return {
            fn: null,
            node: null,
            valid: false,
            error: 'La función debe devolver un valor numérico',
            corrected: correctionResult.corrected,
            corrections: correctionResult.corrections
          };
        }
      } catch (evalError) {
        return {
          fn: null,
          node: null,
          valid: false,
          error: `Error al evaluar: ${evalError.message}`,
          corrected: correctionResult.corrected,
          corrections: correctionResult.corrections
        };
      }

      // Emit event if corrections were applied
      if (correctionResult.changed) {
        this.eventBus.emit('correction:applied', {
          original,
          corrected: correctionResult.corrected,
          corrections: correctionResult.corrections
        });
      }

      return {
        fn,
        node,
        valid: true,
        error: null,
        corrected: correctionResult.corrected,
        corrections: correctionResult.corrections
      };

    } catch (error) {
      console.error('Error in parse():', error);
      return {
        fn: null,
        node: null,
        valid: false,
        error: 'Error inesperado al analizar la función',
        corrected: expression,
        corrections: []
      };
    }
  }

  /**
   * Validate expression structure
   * @private
   * @param {string} expression - Expression to validate
   * @returns {boolean} True if valid
   */
  _validateStructure(expression) {
    // Check if expression is empty
    if (!expression || expression.trim().length === 0) {
      return false;
    }

    // Check for valid characters
    try {
      // Check each character
      const validChars = /^[a-z0-9+\-*/^()\s.,e]$/i;
      for (const char of expression) {
        if (!validChars.test(char)) {
          console.warn(`Invalid character detected: ${char}`);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error in _validateStructure():', error);
      return false;
    }
  }

  /**
   * Evaluate the parsed function at a specific x value
   * @param {ParseResult} parseResult - Result from parse()
   * @param {number} x - X value to evaluate
   * @returns {number|null} Y value or null on error
   */
  evaluate(parseResult, x) {
    if (!parseResult.valid || !parseResult.fn) {
      console.error('Cannot evaluate invalid parse result');
      return null;
    }

    try {
      const result = parseResult.fn.evaluate({ x });

      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        console.warn(`Evaluation returned non-numeric value: ${result}`);
        return null;
      }

      return result;
    } catch (error) {
      console.error('Error evaluating function:', error);
      return null;
    }
  }

  /**
   * Get expression in LaTeX format for display
   * @param {ParseResult} parseResult - Result from parse()
   * @returns {string} LaTeX formatted expression
   */
  toLaTeX(parseResult) {
    if (!parseResult.valid || !parseResult.node) {
      return parseResult.corrected || '';
    }

    try {
      return parseResult.node.toTex();
    } catch (error) {
      console.error('Error converting to LaTeX:', error);
      return parseResult.corrected || '';
    }
  }

  /**
   * Parse multiple expressions at once
   * @param {string[]} expressions - Array of expressions to parse
   * @returns {ParseResult[]} Array of parse results
   */
  parseMultiple(expressions) {
    return expressions.map(expr => this.parse(expr));
  }

  /**
   * Validate that x is the only variable in expression
   * @param {ParseResult} parseResult - Result from parse()
   * @returns {boolean} True if x is the only variable
   */
  isSingleVariable(parseResult) {
    if (!parseResult.valid || !parseResult.node) {
      return false;
    }

    try {
      const variables = new Set();

      // Traverse AST to find variables
      const traverse = (node) => {
        if (node.type === 'SymbolNode') {
          variables.add(node.name);
        }
        if (node.args) {
          node.args.forEach(traverse);
        }
      };

      traverse(parseResult.node);

      // Check if only variable is 'x'
      return variables.size === 0 || (variables.size === 1 && variables.has('x'));
    } catch (error) {
      console.error('Error checking variables:', error);
      return false;
    }
  }

  /**
   * Get function information
   * @param {ParseResult} parseResult - Result from parse()
   * @returns {string} Function type description
   */
  getFunctionType(parseResult) {
    if (!parseResult.valid || !parseResult.corrected) {
      return 'Desconocido';
    }

    const expr = parseResult.corrected.toLowerCase();

    if (expr.includes('^')) return 'Polinómica';
    if (expr.includes('sin') || expr.includes('cos') || expr.includes('tan')) return 'Trigonométrica';
    if (expr.includes('exp') || expr.includes('e^')) return 'Exponencial';
    if (expr.includes('ln') || expr.includes('log')) return 'Logarítmica';
    if (/^[a-z]*x\s*[\+\-\*]?\s*\d*$/.test(expr)) return 'Lineal';
    if (/^\d*\s*x?\s*[\+\-\*\/\^].*\d*$/.test(expr)) return 'Compleja';

    return 'Genérica';
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.eventBus = null;
    this.errorCorrection = null;
  }
}
