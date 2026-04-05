'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from '@/hooks/useInView'

interface CountUpProps {
  end: number
  duration?: number
  suffix?: string
}

export function CountUp({ end, duration = 1500, suffix = '' }: CountUpProps) {
  const [ref, isInView] = useInView<HTMLSpanElement>({ threshold: 0.5, triggerOnce: true })
  const [count, setCount] = useState(0)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!isInView || hasStarted.current) return
    hasStarted.current = true

    let startTime: number | null = null
    let rafId: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        rafId = requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [isInView, end, duration])

  return (
    <span ref={ref}>
      {count}{suffix}
    </span>
  )
}
