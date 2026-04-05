import { Star } from 'lucide-react'
import { TESTIMONIALS, STATS } from '@/lib/constants'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { CountUp } from '@/components/ui/CountUp'

export function Testimonials() {
  return (
    <section
      id="testimonials"
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
            Ils ont obtenu leur visa. Voici ce qu'ils en disent.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {TESTIMONIALS.map((testimonial, index) => (
            <ScrollReveal key={testimonial.name} delay={index * 100}>
              <div
                className="bg-white p-8 h-full flex flex-col"
                style={{
                  borderRadius: '16px',
                  boxShadow: '0 4px 24px rgba(15,44,111,.1)',
                }}
              >
                {/* Avatar + Name */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-semibold text-xl flex-shrink-0"
                    style={{
                      backgroundColor: '#E8EEF9',
                      color: '#0F2C6F',
                      fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                    }}
                    aria-hidden="true"
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p
                      className="font-semibold"
                      style={{
                        fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                        color: '#0F2C6F',
                      }}
                    >
                      {testimonial.name}, {testimonial.age}
                    </p>
                    <p
                      className="text-sm mt-0.5"
                      style={{
                        fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                        color: '#8A94A6',
                      }}
                    >
                      {testimonial.detail}
                    </p>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mt-4" aria-label="5 étoiles sur 5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill="#F0A500"
                      color="#F0A500"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="italic text-base mt-4 leading-relaxed flex-1"
                  style={{
                    fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                    color: '#1C2940',
                  }}
                >
                  «&nbsp;{testimonial.quote}&nbsp;»
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats */}
        <ScrollReveal delay={200}>
          <div
            className="flex flex-wrap justify-center gap-12 md:gap-20 mt-16 py-8"
            aria-label="Chiffres clés"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p
                  className="font-bold text-4xl"
                  style={{
                    fontFamily: 'var(--font-playfair, Georgia, serif)',
                    color: '#F0A500',
                  }}
                >
                  <CountUp end={stat.end} suffix={stat.suffix} duration={1500} />
                </p>
                <p
                  className="text-sm mt-1"
                  style={{
                    fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                    color: '#8A94A6',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
