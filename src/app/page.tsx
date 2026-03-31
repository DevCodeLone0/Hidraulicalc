'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { HeroSection } from '@/components/layout/HeroSection'
import { CalculatorGrid } from '@/components/calculators/CalculatorGrid'
import { ParticleBackground } from '@/components/effects/ParticleBackground'
import { DynamicGradient } from '@/components/effects/DynamicGradient'

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })
  
  const smoothScrollY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  return (
    <main ref={containerRef} className="relative min-h-screen">
      {/* Dynamic Background Layers */}
      <ParticleBackground />
      <DynamicGradient />
      
      {/* Content */}
      <div className="relative z-10">
        <HeroSection scrollYProgress={smoothScrollY} />
        <CalculatorGrid />
      </div>
      
      {/* Footer */}
      <motion.footer 
        className="py-12 text-center text-sm text-gray-500"
        style={{
          opacity: useTransform(scrollYProgress, [0.8, 1], [0, 1]),
        }}
      >
        <p>© 2026 HIDRAULICALC. Ingeniería de Precisión</p>
      </motion.footer>
    </main>
  )
}
