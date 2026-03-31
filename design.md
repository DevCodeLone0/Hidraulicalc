# Design: Hidraulicalc - Updated with Integral Graphing

## Technical Approach

The Hidraulicalc application will be enhanced to combine hydraulic volume calculators with a general integral function graphing feature. The system will use a modular architecture with separate concerns for hydraulic calculations and integral graphing, sharing common utilities for error correction, history management, and UI components.

Key technical decisions:
- Use HTML5 Canvas for graph rendering (better performance with many data points)
- Implement math.js for complex mathematical expression parsing and evaluation
- Use anime.js/GSAP for smooth, playful animations
- Maintain localStorage for calculation history persistence
- Implement scrollable layout with hydraulic calculators (40%) and integral graphing (60%)
- Apply retro-modern-fun design system with specific color palette and typography

## Architecture Decisions

### Decision: Graph Rendering Technology

**Choice**: HTML5 Canvas API with math.js for expression evaluation
**Alternatives considered**: SVG with D3.js, WebGL with Three.js, Chart.js library
**Rationale**: 
- Canvas provides better performance for dynamic graphing with frequent updates
- math.js offers comprehensive mathematical function support including trigonometric, exponential, and logarithmic functions
- Lower bundle size compared to full-featured charting libraries
- Greater control over animation and interactive features
- Compatibility with existing anime.js/GSAP animation plans

### Decision: State Management Approach

**Choice**: Modular state management with utility functions and localStorage persistence
**Alternatives considered**: Redux, Zustand, Context API, MobX
**Rationale**:
- Application state is relatively simple (calculator inputs, graph state, history)
- Avoids overhead of complex state management libraries for this use case
- localStorage persistence fits naturally with utility-based approach
- Easier to debug and maintain for a small team
- Utilities can be easily tested in isolation

### Decision: Error Correction Implementation

**Choice**: Centralized error correction utility with rule-based processing
**Alternatives considered**: Parser generator (PEG.js), Adaptive machine learning, Regex-only approach
**Rationale**:
- Rule-based approach allows for clear, maintainable correction logic
- Easy to add new correction rules as needed
- Provides immediate feedback to users through notifications
- Can be unit tested comprehensively
- Better performance than parser generators for this use case
- More predictable than machine learning approaches

### Decision: Animation Framework

**Choice**: anime.js for lightweight animations, GSAP for complex sequences
**Alternatives considered**: CSS transitions/animations only, Framer Motion, React Spring
**Rationale**:
- anime.js provides excellent performance for UI animations with small bundle size
- GSAP offers precise control for complex animation sequences like graph drawing
- Combined approach covers both simple and complex animation needs
- Both libraries have good documentation and community support
- Compatible with Canvas-based graph rendering

## Data Flow

```plaintext
User Interface ──→ Input Handler ──→ Error Correction Utility ──→ 
                    │                          │
                    ▼                          ▼
          Hydraulic Calculator     Expression Parser (math.js)
                    │                          │
                    ▼                          ▼
              Calculation Engine ←─── Graph Data Generator
                    │                          │
                    ▼                          ▼
              Result Display ←─── Graph Renderer (Canvas)
                    │                          │
                    ▼                          ▼
              History Manager ←──── Tooltip/Interaction Handler
                                    │
                                    ▼
                             Local Storage Persistence
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `public/js/components/integral/functionParser.js` | Modify | Enhanced to use math.js for expression evaluation and support all required function types |
| `public/js/components/integral/graphRenderer.js` | Modify | Updated to use Canvas API with improved performance optimizations |
| `public/js/components/integral/integralGrapher.js` | Modify | Refactored to separate concerns between graph data generation and rendering |
| `public/js/utils/errorCorrection.js` | Modify | Expanded to handle all specified error correction scenarios |
| `public/js/utils/historyManager.js` | Modify | Enhanced to support both hydraulic calculations and integral graphing history |
| `public/js/utils/animationController.js` | Create | New utility to manage anime.js/GSAP animations |
| `public/js/utils/mathUtils.js` | Create | New utility wrapper around math.js for consistent mathematical operations |
| `public/js/components/integral/graphControls.js` | Modify | Updated to support new interaction features (zoom, pan, point inspection) |
| `public/js/components/integral/graphTooltip.js` | Modify | Enhanced to support hover effects and coordinate display |
| `public/js/main.js` | Modify | Updated to initialize new modules and coordinate between hydraulic and graphing sections |
| `public/js/components/hydraulic/calculatorTabs.js` | Modify | Adjusted to work with new scrollable layout |
| `public/css/styles.css` | Modify | Updated to implement retro-modern-fun design system |
| `index.html` | Modify | Updated to include new library dependencies (math.js, anime.js) |

## Interfaces / Contracts

### Error Correction Utility Interface

```javascript
/**
 * Corrects mathematical expression input
 * @param {string} input - Raw user input
 * @returns {Object} Correction result
 * @property {string} corrected - The corrected expression
 * @property {Array<Object>} corrections - Array of applied corrections
 * @property {boolean} needsConfirmation - Whether user confirmation is required
 */
function correctExpression(input) {
  // Returns: {
  //   corrected: "2*x + 3",
  //   corrections: [{type: "added_operator", position: 1, original: "2x", corrected: "2*x"}],
  //   needsConfirmation: false
  // }
}
```

### Graph Renderer Interface

```javascript
/**
 * Renders a mathematical function graph on Canvas
 * @param {HTMLCanvasElement} canvas - Target canvas element
 * @param {Object} options - Graph configuration
 * @param {string} options.function - Mathematical function to graph
 * @param {number[]} options.limits - [xMin, xMax] range
 * @param {Object} options.styling - Color and style configuration
 * @param {Function} options.onPointHover - Callback for hover events
 */
function renderGraph(canvas, options) {
  // Draws function graph, area under curve, and handles interactions
}
```

### History Manager Interface

```javascript
/**
 * Adds a calculation to history
 * @param {Object} entry - History entry to add
 * @param {string} entry.type - "hydraulic" or "integral"
 * @param {Object} entry.inputs - Input values used
 * @param {Object} entry.results - Calculation results
 * @param {string} entry.timestamp - ISO timestamp
 */
function addToHistory(entry) {
  // Persists to localStorage with automatic cleanup when quota exceeded
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Expression parser corrections | Test individual error correction rules with various inputs |
| Unit | Math utility functions | Test mathematical operations with edge cases |
| Unit | History manager | Test localStorage persistence and quota handling |
| Integration | Graph rendering pipeline | Test end-to-end from input to rendered graph |
| Integration | Error correction flow | Test user input through correction to final expression |
| E2E | Complete user workflows | Test use case scenarios from specifications |
| Performance | Bundle size verification | Verify minified/gzipped bundle < 500KB |
| Performance | Animation FPS | Test 60 FPS maintenance on mobile devices |
| Accessibility | WCAG 2.1 AA compliance | Test keyboard navigation, screen reader compatibility, color contrast |
| Cross-browser | Chrome, Firefox, Safari, Edge | Test core functionality on latest 2 versions of each browser |

## Migration / Rollout

No migration required as this is a feature enhancement to an existing application. The changes are additive and backward compatible:
- Existing hydraulic calculators continue to work unchanged
- New integral graphing feature is added as additional functionality
- LocalStorage history format is extended but remains compatible
- No breaking changes to existing APIs or data structures

Rollout approach:
1. Deploy to staging environment for internal testing
2. Gather feedback from user testing group
3. Address any issues identified
4. Deploy to production with feature flag if needed
5. Monitor performance and error rates post-deployment

## Open Questions

- [ ] Should we implement lazy loading of math.js to improve initial load time?
- [ ] Should we add support for definite integral notation with ∫ symbol?
- [ ] Should we implement touch-specific gestures beyond pinch-to-zoom for mobile?
- [ ] Should we add export functionality for graphs as PNG or SVG?
- [ ] Should we implement a dark mode toggle option?