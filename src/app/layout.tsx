import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "CloseUp - Plateforme de contenu premium",
    template: "%s | CloseUp",
  },
  description:
    "CloseUp est la plateforme de monétisation de contenu premium adaptée au marché africain avec paiement mobile money.",
  keywords: ["contenu premium", "créateurs", "mobile money", "Afrique"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background font-sans">
        {children}
      </body>
    </html>
  )
}
