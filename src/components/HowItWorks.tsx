import { STEPS } from '@/lib/constants'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export function HowItWorks() {
  return (
    <section
      id="process"
      className="py-20 px-4 md:px-6 scroll-mt-20"
      style={{ backgroundColor: '#E8EEF9' }}
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
            4 étapes. De ton canapé à ton campus.
          </h2>
        </ScrollReveal>

        {/* Desktop timeline */}
        <div className="hidden md:block mt-16">
          <div className="relative">
            {/* Connecting line */}
            <div
              className="absolute top-6 left-0 right-0 h-0.5"
              style={{ backgroundColor: 'rgba(15,44,111,0.2)' }}
              aria-hidden="true"
            />
            <div className="grid grid-cols-4 gap-6 relative">
              {STEPS.map((step, index) => (
                <ScrollReveal key={step.number} delay={index * 100}>
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl relative z-10"
                      style={{
                        fontFamily: 'var(--font-playfair, Georgia, serif)',
                        backgroundColor: '#F0A500',
                        color: '#0A1628',
                      }}
                    >
                      {step.number}
                    </div>
                    <h3
                      className="font-semibold text-lg mt-4"
                      style={{
                        fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                        color: '#0F2C6F',
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-base mt-2 leading-relaxed"
                      style={{
                        fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                        color: 'rgba(28, 41, 64, 0.8)',
                      }}
                    >
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile timeline */}
        <div className="md:hidden mt-12">
          <div className="relative">
            {/* Vertical connecting line */}
            <div
              className="absolute left-6 top-0 bottom-0 w-0.5"
              style={{ backgroundColor: 'rgba(15,44,111,0.2)' }}
              aria-hidden="true"
            />
            <div className="flex flex-col gap-8">
              {STEPS.map((step, index) => (
                <ScrollReveal key={step.number} delay={index * 80}>
                  <div className="flex gap-6 items-start">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0 relative z-10"
                      style={{
                        fontFamily: 'var(--font-playfair, Georgia, serif)',
                        backgroundColor: '#F0A500',
                        color: '#0A1628',
                      }}
                    >
                      {step.number}
                    </div>
                    <div className="pt-2">
                      <h3
                        className="font-semibold text-lg"
                        style={{
                          fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                          color: '#0F2C6F',
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        className="text-base mt-2 leading-relaxed"
                        style={{
                          fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                          color: 'rgba(28, 41, 64, 0.8)',
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
