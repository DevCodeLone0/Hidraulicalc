'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { CalculatorCard } from './CalculatorCard'
import { CylindricalReservoirCalculator } from './CylindricalReservoirCalculator'
import { RectangularChannelCalculator } from './RectangularChannelCalculator'
import { VerticalTankCalculator } from './VerticalTankCalculator'
import { IntegralCalculator } from './IntegralCalculator'
import { Database, Ruler, Droplet, ChartLine } from 'lucide-react'

const calculators = [
  {
    id: 'cylindrical-reservoir',
    title: 'Embalse Cilíndrico',
    icon: Database,
    component: CylindricalReservoirCalculator,
    description: 'Cálculo de volumen para tanques cilíndricos',
  },
  {
    id: 'rectangular-channel',
    title: 'Canal Rectangular',
    icon: Ruler,
    component: RectangularChannelCalculator,
    description: 'Cálculo de volumen para canales rectangulares',
  },
  {
    id: 'vertical-tank',
    title: 'Tanque Vertical',
    icon: Droplet,
    component: VerticalTankCalculator,
    description: 'Cálculo de volumen para tanques verticales',
  },
  {
    id: 'integral',
    title: 'Graficador de Integrales',
    icon: ChartLine,
    component: IntegralCalculator,
    description: 'Graficado y cálculo de integrales definidas',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function CalculatorGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.section 
      ref={ref}
      className="py-24 px-4 md:px-8 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <motion.div 
        className="mb-16 text-center"
        variants={itemVariants}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-gradient">Calculadoras</span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Herramientas de precisión para ingeniería hidráulica
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {calculators.map((calculator) => (
          <motion.div key={calculator.id} variants={itemVariants}>
            <CalculatorCard
              id={calculator.id}
              title={calculator.title}
              icon={calculator.icon}
              description={calculator.description}
              component={calculator.component}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
