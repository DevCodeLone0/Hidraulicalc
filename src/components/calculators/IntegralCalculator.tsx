'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, TrendingUp, Download, Expand, Grid3X3 } from 'lucide-react'

interface FunctionExample {
  label: string
  fn: string
}

const functionExamples: FunctionExample[] = [
  { label: 'x', fn: 'x' },
  { label: 'x²', fn: 'x^2' },
  { label: 'sin(x)', fn: 'sin(x)' },
  { label: 'cos(x)', fn: 'cos(x)' },
  { label: 'eˣ', fn: 'e^x' },
  { label: 'ln(x)', fn: 'ln(x)' },
]

export function IntegralCalculator() {
  const [func, setFunc] = useState('')
  const [lowerLimit, setLowerLimit] = useState('')
  const [upperLimit, setUpperLimit] = useState('')
  const [area, setArea] = useState<number | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const graphRef = useRef<HTMLDivElement>(null)

  const calculateIntegral = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement integral calculation with mathjs
    const a = parseFloat(lowerLimit)
    const b = parseFloat(upperLimit)
    // Simplified for demo
    setArea((b * b - a * a) / 2)
  }

  const handleExampleClick = (exampleFn: string) => {
    setFunc(exampleFn)
  }

  return (
    <form onSubmit={calculateIntegral} className="space-y-4">
      {/* Function Input */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400 block">Función f(x)</label>
        <motion.input
          type="text"
          value={func}
          onChange={(e) => setFunc(e.target.value)}
          placeholder="Ej: x^2, sin(x), e^x"
          required
          className="glass-input w-full px-4 py-3 text-white placeholder-gray-500 font-mono"
        />
      </div>

      {/* Limits Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-400 block">Límite inferior (a)</label>
          <motion.input
            type="number"
            value={lowerLimit}
            onChange={(e) => setLowerLimit(e.target.value)}
            placeholder="0"
            step="0.01"
            required
            className="glass-input w-full px-4 py-3 text-white placeholder-gray-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400 block">Límite superior (b)</label>
          <motion.input
            type="number"
            value={upperLimit}
            onChange={(e) => setUpperLimit(e.target.value)}
            placeholder="5"
            step="0.01"
            required
            className="glass-input w-full px-4 py-3 text-white placeholder-gray-500"
          />
        </div>
      </div>

      {/* Example Functions */}
      <div className="flex flex-wrap gap-2 py-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Ejemplos:</span>
        {functionExamples.map((example) => (
          <motion.button
            key={example.label}
            type="button"
            onClick={() => handleExampleClick(example.fn)}
            className="px-3 py-1 text-xs rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {example.label}
          </motion.button>
        ))}
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        className="glass-button w-full py-3 mt-4 flex items-center justify-center gap-2"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <TrendingUp className="w-4 h-4" />
        Graficar y Calcular
      </motion.button>

      {/* Graph Container */}
      <AnimatePresence>
        {area !== null && (
          <motion.div 
            className="mt-6 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Graph Controls */}
            <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex gap-2">
                <motion.button
                  type="button"
                  title="Acercar"
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Expand className="w-4 h-4 text-gray-400" />
                </motion.button>
                <motion.button
                  type="button"
                  title="Cuadrícula"
                  onClick={() => setShowGrid(!showGrid)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Grid3X3 className={`w-4 h-4 ${showGrid ? 'text-cyan-400' : 'text-gray-400'}`} />
                </motion.button>
              </div>
              <motion.button
                type="button"
                title="Exportar"
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Download className="w-4 h-4 text-gray-400" />
              </motion.button>
            </div>

            {/* Graph Placeholder */}
            <div 
              ref={graphRef}
              className="h-64 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center"
            >
              <p className="text-gray-500 text-sm">Gráfico se renderizará aquí</p>
            </div>

            {/* Result */}
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Área bajo la curva:</span>
                <ResultCounter value={area} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

function ResultCounter({ value }: { value: number | null }) {
  const [displayValue, setDisplayValue] = useState(0)

  useState(() => {
    if (value !== null) {
      const duration = 500
      const start = 0
      const end = value
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3)
        const current = start + (end - start) * easeProgress
        
        setDisplayValue(current)

        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [value])

  return (
    <motion.span 
      className="counter text-cyan-400 font-mono text-xl"
      key={value}
    >
      {displayValue.toLocaleString('es-ES', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}
    </motion.span>
  )
}
