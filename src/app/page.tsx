import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Problem } from '@/components/Problem'
import { HowItWorks } from '@/components/HowItWorks'
import { Testimonials } from '@/components/Testimonials'
import { FAQ } from '@/components/FAQ'
import { FinalCTA } from '@/components/FinalCTA'
import { Footer } from '@/components/Footer'
import { WhatsAppButton } from '@/components/WhatsAppButton'

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
