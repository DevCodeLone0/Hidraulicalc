'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator } from 'lucide-react'

export function RectangularChannelCalculator() {
const [length, setLength] = useState('')
const [width, setWidth] = useState('')
const [height, setHeight] = useState('')
const [volume, setVolume] = useState<number | null>(null)
const [volumeFt, setVolumeFt] = useState<number | null>(null)

const calculateVolume = (e: React.FormEvent) => {
e.preventDefault()
const l = parseFloat(length)
const w = parseFloat(width)
const h = parseFloat(height)

if (l > 0 && w > 0 && h > 0) {
const vol = l * w * h
setVolume(vol)
setVolumeFt(vol * 35.3147)
}
}

return (
<form onSubmit={calculateVolume} className="space-y-4">
<div className="space-y-2">
<label className="text-sm text-gray-400 block">Longitud (m)</label>
<input
type="number"
value={length}
onChange={(e) => setLength(e.target.value)}
placeholder="Ej: 20"
step="0.01"
min="0"
required
className="glass-input w-full px-4 py-3 text-white placeholder-gray-500"
/>
</div>

<div className="space-y-2">
<label className="text-sm text-gray-400 block">Ancho (m)</label>
<input
type="number"
value={width}
onChange={(e) => setWidth(e.target.value)}
placeholder="Ej: 3"
step="0.01"
min="0"
required
className="glass-input w-full px-4 py-3 text-white placeholder-gray-500"
/>
</div>

<div className="space-y-2">
<label className="text-sm text-gray-400 block">Altura (m)</label>
<input
type="number"
value={height}
onChange={(e) => setHeight(e.target.value)}
placeholder="Ej: 2"
step="0.01"
min="0"
required
className="glass-input w-full px-4 py-3 text-white placeholder-gray-500"
/>
</div>

<motion.button
type="submit"
className="glass-button w-full py-3 mt-6 flex items-center justify-center gap-2"
whileHover={{ scale: 1.02 }}
whileTap={{ scale: 0.98 }}
>
<Calculator className="w-4 h-4" />
Calcular Volumen
</motion.button>

<AnimatePresence>
{(volume !== null && volumeFt !== null) && (
<motion.div
className="mt-6 p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.4 }}
>
<div className="space-y-3">
<ResultRow label="Volumen:" value={volume} unit="m³" />
<ResultRow label="Volumen (ft³):" value={volumeFt} unit="ft³" />
</div>
</motion.div>
)}
</AnimatePresence>
</form>
)
}

function ResultRow({ label, value, unit }: { label: string, value: number | null, unit: string }) {
const [displayValue, setDisplayValue] = useState(0)

useEffect(() => {
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
<div className="flex justify-between items-center">
<span className="text-gray-400">{label}</span>
<span className="counter text-cyan-400 font-mono text-xl">
{displayValue.toLocaleString('es-ES', {
minimumFractionDigits: 2,
maximumFractionDigits: 2
})} {unit}
</span>
</div>
)
}
