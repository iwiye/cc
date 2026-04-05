'use client'

import { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function ScrollReveal({ children, delay = 0, className = '' }: ScrollRevealProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15, triggerOnce: true })

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 600ms ease, transform 600ms ease`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
