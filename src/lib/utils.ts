import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names with Tailwind CSS classes
 * Merges duplicate Tailwind classes intelligently
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number with locale-specific separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Calculates volume of a cylinder
 */
export function calculateCylinderVolume(radius: number, height: number): number {
  return Math.PI * Math.pow(radius, 2) * height
}

/**
 * Calculates volume of a rectangular prism
 */
export function calculateRectangularVolume(length: number, width: number, height: number): number {
  return length * width * height
}

/**
 * Converts cubic meters to cubic feet
 */
export function cubicMetersToCubicFeet(value: number): number {
  return value * 35.3147
}

/**
 * Easing function for smooth animations (ease-out cubic)
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Smooth counter animation helper
 */
export function animateCounter(
  start: number,
  end: number,
  duration: number,
  onUpdate: (value: number) => void
): () => void {
  const startTime = performance.now()
  let animationFrameId: number

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easeProgress = easeOutCubic(progress)
    const current = start + (end - start) * easeProgress
    
    onUpdate(current)

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate)
    }
  }

  animationFrameId = requestAnimationFrame(animate)
  
  return () => cancelAnimationFrame(animationFrameIdId)
}
