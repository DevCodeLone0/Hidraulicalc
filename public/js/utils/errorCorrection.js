/**
 * errorCorrection.js - 7-Stage Error Correction Pipeline
 * @description Automatically corrects common errors in mathematical expressions
 * @author Hidraulicalc Team
 * @version 1.0.0
 */

// mathjs is loaded via CDN as a global variable

/**
 * Error correction result structure
 * @typedef {Object} CorrectionResult
 * @property {string} original - Original input
 * @property {string} corrected - Corrected expression
 * @property {boolean} changed - Whether corrections were made
 * @property {string[]} corrections - List of corrections applied
 */

/**
 * 7-Stage Error Correction Pipeline
 * Automatically fixes common mathematical expression errors
 */
export class ErrorCorrectionPipeline {
  constructor() {
    // Spanish to English function mappings
    this.spanishMappings = {
      'sen': 'sin',
      'tg': 'tan',
      'cotg': 'cot',
      'sec': 'sec',
      'cosec': 'csc',
      'arcsen': 'arcsin',
      'arctg': 'arctan'
    };

    // Common typos corrections
    this.typoCorrections = {
      'sine': 'sin',
      'cosine': 'cos',
      'tangent': 'tan',
      'cosecant': 'csc',
      'secant': 'sec',
      'cotangent': 'cot',
      'ex': 'e^x',
      'lnx': 'ln(x)',
      'logx': 'log(x)',
      'sqr': 'sqrt',
      'sqroot': 'sqrt',
      'power': '^'
    };
  }

  /**
   * Run all 7 correction stages
   * @param {string} input - Input expression
   * @returns {CorrectionResult} Correction result
   */
  correct(input) {
    const original = input.trim();
    let current = original;
    const corrections = [];

    if (!current) {
      return {
        original,
        corrected: '',
        changed: false,
        corrections: []
      };
    }

    // Stage 1: Remove extra text (units, descriptions)
    current = this.stage1RemoveExtraText(current, corrections);

    // Stage 2: Normalize spaces
    current = this.stage2NormalizeSpaces(current, corrections);

    // Stage 3: Fix missing operators
    current = this.stage3FixMissingOperators(current, corrections);

    // Stage 4: Fix parentheses
    current = this.stage4FixParentheses(current, corrections);

    // Stage 5: Correct typos
    current = this.stage5CorrectTypos(current, corrections);

    // Stage 6: Map Spanish functions
    current = this.stage6MapSpanish(current, corrections);

    // Stage 7: Fix implicit multiplication
    current = this.stage7FixImplicitMultiplication(current, corrections);

    return {
      original,
      corrected: current.trim(),
      changed: original !== current.trim(),
      corrections
    };
  }

  /**
   * Stage 1: Remove extra text (units, descriptions)
   * Removes: "meters", "m", "feet", "ft", "function:", etc.
   * @private
   * @param {string} input - Input expression
   * @param {string[]} corrections - Corrections array to populate
   * @returns {string} Cleaned expression
   */
  stage1RemoveExtraText(input, corrections) {
    let output = input;

    // Remove units and common descriptors
    const patterns = [
      /\s*(meters|meter|metres|metre|mts|m|feet|foot|ft)\s*/gi,
      /\s*(function|func|f\s*[:=])\s*:/gi,
      /\s*(calculate|compute|eval|result)\s*[:=]*/gi,
      /\s*(y|f|x)\s*[:=]\s*/gi  // Remove "y = " or "f(x) = "
    ];

    const removed = [];

    patterns.forEach(pattern => {
      const match = output.match(pattern);
      if (match) {
        output = output.replace(pattern, ' ');
        removed.push(match[0].trim());
      }
    });

    if (removed.length > 0) {
      corrections.push(`Removed: ${removed.join(', ')}`);
    }

    return output.trim();
  }

  /**
   * Stage 2: Normalize spaces
   * Removes excessive spaces, ensures single spaces around operators
   * @private
   * @param {string} input - Input expression
   * @param {string[]} corrections - Corrections array to populate
   * @returns {string} Normalized expression
   */
  stage2NormalizeSpaces(input, corrections) {
    let output = input;

    // Remove multiple consecutive spaces
    output = output.replace(/\s{2,}/g, ' ');

    // Remove spaces around parentheses
    output = output.replace(/\s*\(\s*/g, '(');
    output = output.replace(/\s*\)\s*/g, ')');

    // Ensure single space around operators (but keep implicit multiplication)
    output = output.replace(/\s*([+\-*/^=])\s*/g, ' $1 ');

    // Remove spaces after numbers before opening parenthesis (e.g., "2 (x+1)" -> "2(x+1)")
    output = output.replace(/(\d)\s*\(/g, '$1(');

    // Clean up any resulting double spaces
    output = output.replace(/\s{2,}/g, ' ').trim();

    if (input.replace(/\s{2,}/g, ' ') !== output) {
      corrections.push('Normalized spacing');
    }

    return output;
  }

  /**
   * Stage 3: Fix missing operators
   * Adds missing +, * operators between terms
   * @private
   * @param {string} input - Input expression
   * @param {string[]} corrections - Corrections array to populate
   * @returns {string} Expression with fixed operators
   */
  stage3FixMissingOperators(input, corrections) {
    let output = input;

    // Detect number directly followed by opening parenthesis: "3(x+1)" -> "3*(x+1)"
    const numParenPattern = /(\d)(\()/g;
    if (numParenPattern.test(output)) {
      output = output.replace(numParenPattern, '$1*$2');
      corrections.push("Added '*' between number and parenthesis");
    }

    // Detect function directly followed by number: "sin2" -> "sin(2)"
    const funcNumPattern = /([a-z]+)(\d+)/gi;
    const funcNums = [...output.matchAll(funcNumPattern)];

    // Only process if it's likely a function name (not a variable name)
    const functionNames = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'log', 'ln', 'sqrt', 'exp', 'e'];
    funcNums.forEach(match => {
      const func = match[1].toLowerCase();
      if (functionNames.includes(func)) {
        const replacement = `${func}(${match[2]})`;
        output = output.replace(match[0], replacement);
        corrections.push(`Added parenthesis around function argument`);
      }
    });

    // Detect two numbers separated by space: "2 3" -> "2*3"
    const spaceNumPattern = /(\d)\s+(\d)/g;
    if (spaceNumPattern.test(output)) {
      output = output.replace(spaceNumPattern, '$1*$2');
      corrections.push("Replaced space with '*' between numbers");
    }

    return output;
  }

  /**
   * Stage 4: Fix parentheses
   * Balances mismatched parentheses
   * @private
   * @param {string} input - Input expression
   * @param {string[]} corrections - Corrections array to populate
   * @returns {string} Expression with balanced parentheses
   */
  stage4FixParentheses(input, corrections) {
    let output = input;

    // Count open and close parentheses
    let openCount = 0;
    let closeCount = 0;

    for (const char of output) {
      if (char === '(') openCount++;
      if (char === ')') closeCount++;
    }

    // Add missing closing parentheses
    if (openCount > closeCount) {
      const diff = openCount - closeCount;
      output += ')'.repeat(diff);
      corrections.push(`Added ${diff} closing parenthesis`);
    }

    // Add missing opening parentheses (less common, but possible)
    if (closeCount > openCount) {
      const diff = closeCount - openCount;
      output = '('.repeat(diff) + output;
      corrections.push(`Added ${diff} opening parenthesis`);
    }

    return output;
  }

  /**
   * Stage 5: Correct typos
   * Fixes common mathematical function typos
   * @private
   * @param {string} input - Input expression
   * @param {string[]} corrections - Corrections array to populate
   * @returns {string} Expression with corrected typos
   */
  stage5CorrectTypos(input, corrections) {
    let output = input;

    Object.entries(this.typoCorrections).forEach(([typo, correction]) => {
      const regex = new RegExp(`\\b${typo}\\b`, 'gi');
      if (regex.test(output)) {
        const original = typo;
        const pattern = new RegExp(`\\b${original}\\b`, 'gi');

        output = output.replace(pattern, correction);
        corrections.push(`Corrected: "${original}" → "${correction}"`);
      }
    });

    return output;
  }

  /**
   * Stage 6: Map Spanish functions to English
   * Converts Spanish math notation to English (sen→sin, tg→tan, etc.)
   * @private
   * @param {string} input - Input expression
   * @param {string[]} corrections - Corrections array to populate
   * @returns {string} Expression with English functions
   */
  stage6MapSpanish(input, corrections) {
    let output = input;

    Object.entries(this.spanishMappings).forEach(([spanish, english]) => {
      const regex = new RegExp(`\\b${spanish}\\b`, 'gi');
      if (regex.test(output)) {
        output = output.replace(regex, english);
        corrections.push(`Mapped: "${spanish}" → "${english}" (Spanish)`);
      }
    });

    return output;
  }

  /**
   * Stage 7: Fix implicit multiplication
   * Converts implicit multiplication to explicit: 2x → 2*x
   * @private
   * @param {string} input - Input expression
   * @param {string[]} corrections - Corrections array to populate
   * @returns {string} Expression with explicit multiplication
   */
  stage7FixImplicitMultiplication(input, corrections) {
    let output = input;

    // Pattern: number followed by variable: 2x → 2*x
    // But don't match e^x or 2^x (where x is exponent)
    const pattern1 = /(\d)([a-z])(?![a-z^])/gi;
    if (pattern1.test(output)) {
      output = output.replace(pattern1, '$1*$2');
      corrections.push("Added '*' for implicit multiplication (number*variable)");
    }

    // Pattern: closing parenthesis followed by number or variable: (x+1)2 → (x+1)*2
    const pattern2 = /(\))([a-z0-9])(?![a-z])/gi;
    if (pattern2.test(output)) {
      output = output.replace(pattern2, '$1*$2');
      corrections.push("Added '*' for implicit multiplication ( ) * number/variable");
    }

    // Pattern: variable followed by opening parenthesis: x(x+1) → x*(x+1)
    // But don't match sin(x) or cos(x) (function calls)
    const pattern3 = /([a-z])(\()/gi;
    const pattern3match = [...output.matchAll(pattern3)];

    const functionNames = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'log', 'ln', 'sqrt', 'exp', 'e'];
    pattern3match.forEach(match => {
      const variable = match[1].toLowerCase();

      // Only add * if it's not a function name
      if (!functionNames.includes(variable) && variable !== 'e') {
        const replacement = `${variable}*(`;
        output = output.replace(match[0], replacement);
        corrections.push(`Added '*' for implicit multiplication (variable*()`);
      }
    });

    return output;
  }

  /**
   * Validate expression syntax (optional pre-check)
   * @param {string} expression - Expression to validate
   * @returns {Object} Validation result { valid, error }
   */
  validateSyntax(expression) {
    try {
      // Try to evaluate the expression as a test
      // Note: This is a basic check, math.js does thorough validation
      if (typeof math === 'undefined') {
        throw new Error('mathjs library not loaded');
      }
      math.evaluate(expression.replace('x', '1')); // Replace x for evaluation test
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

export default ErrorCorrectionPipeline;
