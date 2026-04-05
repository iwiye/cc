'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionItem {
  question: string
  answer: string
}

interface AccordionProps {
  items: AccordionItem[]
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="border-b border-gray-200">
          <button
            onClick={() => toggle(index)}
            className="w-full flex justify-between items-center py-5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-navy rounded"
            aria-expanded={openIndex === index}
          >
            <span className="font-semibold text-navy text-lg pr-4" style={{ fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)' }}>
              {item.question}
            </span>
            <ChevronDown
              className="text-navy flex-shrink-0 transition-transform duration-300"
              style={{ transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)' }}
              size={20}
              aria-hidden="true"
            />
          </button>
          <div
            className="overflow-hidden transition-all duration-300"
            style={{ maxHeight: openIndex === index ? '500px' : '0' }}
          >
            <p
              className="text-base pb-5 leading-relaxed"
              style={{
                color: 'rgba(28, 41, 64, 0.8)',
                fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
              }}
            >
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
