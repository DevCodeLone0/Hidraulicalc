'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface CalculatorCardProps {
  id: string
  title: string
  icon: LucideIcon
  description: string
  component: React.ComponentType<any>
}

export function CalculatorCard({ 
  id, 
  title, 
  icon: Icon, 
  description,
  component: Component 
}: CalculatorCardProps) {
  return (
    <motion.div
      className="glass-card p-6 md:p-8 h-full"
      whileHover={{ 
        y: -8,
        boxShadow: '0 20px 60px rgba(0, 212, 255, 0.15)',
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Card Header */}
      <div className="flex items-center gap-4 mb-6">
        <motion.div 
          className="p-3 rounded-xl bg-cyan-500/10"
          whileHover={{ 
            scale: 1.1, 
            rotate: 5,
            backgroundColor: 'rgba(0, 212, 255, 0.2)'
          }}
          transition={{ duration: 0.3 }}
        >
          <Icon className="w-6 h-6 text-cyan-400" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      
      {/* Calculator Component */}
      <Component />
    </motion.div>
  )
}
