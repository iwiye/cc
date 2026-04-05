import { FAQ_ITEMS } from '@/lib/constants'
import { Accordion } from '@/components/ui/Accordion'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

export function FAQ() {
  return (
    <section
      id="faq"
      className="py-20 px-4 md:px-6 scroll-mt-20 bg-white"
    >
      <div className="max-w-2xl mx-auto">
        <ScrollReveal>
          <h2
            className="font-bold text-center text-3xl md:text-4xl"
            style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              color: '#0F2C6F',
            }}
          >
            Tes questions. Nos réponses.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="mt-12">
            <Accordion items={FAQ_ITEMS} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
