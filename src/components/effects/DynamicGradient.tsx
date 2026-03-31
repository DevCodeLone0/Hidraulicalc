'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

export function DynamicGradient() {
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { damping: 3, stiffness: 50 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      mouseX.set(x)
      mouseY.set(y)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <motion.div 
      className="fixed inset-0 z-0 overflow-hidden"
      style={{
        background: useTransform(
          [springX, springY],
          ([x, y]) => `
            radial-gradient(circle at ${x * 100}% ${y * 100}%, 
              rgba(0, 212, 255, 0.08) 0%, 
              transparent 50%),
            radial-gradient(circle at ${(1 - x) * 100}% ${(1 - y) * 100}%, 
              rgba(0, 168, 204, 0.05) 0%, 
              transparent 50%),
            linear-gradient(180deg, 
              #0a0a0a 0%, 
              #0f0f0f 50%, 
              #0a0a0a 100%)
          `
        ),
      }}
    />
  )
}
