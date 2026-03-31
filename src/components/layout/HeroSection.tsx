'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { motion as Motion } from 'framer-motion'

interface HeroSectionProps {
  scrollYProgress: any
}

export function HeroSection({ scrollYProgress }: HeroSectionProps) {
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95])
  const y = useTransform(scrollYProgress, [0, 0.2], [0, 100])

  return (
    <Motion.section 
      className="min-h-screen flex items-center justify-center px-4 pt-20"
      style={{ opacity, scale }}
    >
      <motion.div 
        className="text-center max-w-6xl mx-auto"
        style={{ y }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 1.2, 
          ease: [0.16, 1, 0.3, 1],
          delay: 0.2 
        }}
      >
        {/* Main Hero Text */}
        <motion.h1 
          className="hero-text mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 1, 
            delay: 0.4,
            ease: [0.16, 1, 0.3, 1] 
          }}
        >
          HIDRAULICALC.
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          className="text-xl md:text-2xl text-gray-400 font-light tracking-wide mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          INGENIERÍA HIDRÁULICA DE PRECISIÓN
        </motion.p>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
        >
          <motion.div 
            className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center"
            animate={{ 
              borderColor: ['rgba(75, 85, 99, 0.5)', 'rgba(0, 212, 255, 0.8)', 'rgba(75, 85, 99, 0.5)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div 
              className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
          <span className="text-xs text-gray-500 uppercase tracking-widest">
            Explorar
          </span>
        </motion.div>
      </motion.div>
    </Motion.section>
  )
}
