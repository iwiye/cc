import { CheckCircle } from 'lucide-react'
import { WHATSAPP_URL } from '@/lib/constants'

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center min-h-screen py-16 px-4 md:py-24 md:px-6"
      style={{
        background: `
          repeating-linear-gradient(
            -45deg,
            rgba(255,255,255,0.03) 0px,
            rgba(255,255,255,0.03) 1px,
            transparent 1px,
            transparent 20px
          ),
          linear-gradient(160deg, #0A1628 0%, #0F2C6F 100%)
        `,
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h1
          className="font-bold text-white leading-tight text-5xl md:text-6xl"
          style={{ fontFamily: 'var(--font-playfair, Georgia, serif)' }}
        >
          Ton visa étudiant pour la France, même après 35 ans.
        </h1>

        <p
          className="mt-6 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          style={{
            fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          SchoolMo t'accompagne de A à Z — dossier Campus France, préparation entretien, obtention du visa. Tous les profils. Tous les âges.
        </p>

        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-8 text-lg font-semibold px-8 py-4 transition-all duration-300 hover:scale-[1.03]"
          style={{
            fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
            backgroundColor: '#F0A500',
            color: '#0A1628',
            borderRadius: '999px',
            boxShadow: '0 12px 48px rgba(15,44,111,.18)',
          }}
          aria-label="Évaluer ton profil gratuitement via WhatsApp"
        >
          Évalue ton profil gratuitement
        </a>

        <p
          className="mt-6 text-sm flex items-center justify-center gap-2"
          style={{
            fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          <CheckCircle size={16} aria-hidden="true" />
          Plus de 150 étudiants accompagnés depuis 2023
        </p>
      </div>
    </section>
  )
}
