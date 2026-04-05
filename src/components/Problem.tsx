import { Clock, HelpCircle, AlertCircle, type LucideIcon } from 'lucide-react'
import { PROBLEMS } from '@/lib/constants'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const ICON_MAP: Record<string, LucideIcon> = {
  Clock,
  HelpCircle,
  AlertCircle,
}

export function Problem() {
  return (
    <section
      id="problem"
      className="py-20 px-4 md:px-6 scroll-mt-20"
      style={{ backgroundColor: '#FAFAFA' }}
    >
      <div className="max-w-5xl mx-auto">
        <ScrollReveal>
          <h2
            className="font-bold text-center text-3xl md:text-4xl"
            style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              color: '#0F2C6F',
            }}
          >
            On sait ce que tu vis.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {PROBLEMS.map((problem, index) => {
            const Icon = ICON_MAP[problem.iconName]
            return (
              <ScrollReveal key={problem.iconName} delay={index * 100}>
                <div
                  className="bg-white p-8 h-full card-hover"
                  style={{ borderRadius: '16px' }}
                >
                  {Icon && <Icon size={40} color="#F0A500" aria-hidden="true" />}
                  <h3
                    className="font-semibold text-lg mt-4"
                    style={{
                      fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                      color: '#0F2C6F',
                    }}
                  >
                    {problem.title}
                  </h3>
                  <p
                    className="text-base mt-2 leading-relaxed"
                    style={{
                      fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                      color: 'rgba(28, 41, 64, 0.8)',
                    }}
                  >
                    {problem.description}
                  </p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
