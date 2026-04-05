import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SchoolMo — Visa étudiant France | Accompagnement Campus France',
  description:
    "SchoolMo accompagne les étudiants africains de tous âges dans l'obtention de leur visa étudiant pour la France. Dossier Campus France, préparation entretien, suivi complet.",
  keywords:
    'visa étudiant France, Campus France Cameroun, études en France, accompagnement visa, SchoolMo, visa étudiant Afrique, études France profil atypique',
  openGraph: {
    title: 'SchoolMo — Obtiens ton visa étudiant pour la France, quel que soit ton profil',
    description:
      "SchoolMo accompagne les étudiants africains de tous âges dans l'obtention de leur visa étudiant pour la France. Dossier Campus France, préparation entretien, suivi complet.",
    url: 'https://schoolmo.fr',
    type: 'website',
    locale: 'fr_FR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
