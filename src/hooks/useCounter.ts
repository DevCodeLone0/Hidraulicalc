'use client'

import { useState, useEffect, useRef } from 'react'
import { easeOutCubic } from '@/lib/utils'

interface UseCounterOptions {
  duration?: number
  easing?: (t: number) => number
}

/**
 * Hook for animated number counters
 */
export function useCounter(
  value: number,
  { duration = 500, easing = easeOutCubic }: UseCounterOptions = {}
) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)
  const animationRef = useRef<number>()

  useEffect(() => {
    const start = previousValue.current
    const end = value
    const startTime = performance.now()

    if (start === end) return

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = easing(progress)
      const current = start + (end - start) * easeProgress
      
      setDisplayValue(current)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        previousValue.current = value
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value, duration, easing])

  return displayValue
}
