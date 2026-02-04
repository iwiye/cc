import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const session = await auth()

  // Si connecté, rediriger vers le dashboard approprié
  if (session) {
    if (session.user.role === "CREATOR") {
      redirect("/dashboard")
    }
    if (session.user.role === "ADMIN") {
      redirect("/admin/dashboard")
    }
    redirect("/discover")
  }

  // Page d'accueil pour les visiteurs non connectés
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <nav className="flex items-center justify-between mb-16">
          <h1 className="text-3xl font-bold text-primary">CloseUp</h1>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Connexion</Button>
            </Link>
            <Link href="/register">
              <Button>S&apos;inscrire</Button>
            </Link>
          </div>
        </nav>

        <main className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-pink-600 bg-clip-text text-transparent">
            Monétisez votre contenu
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            CloseUp est la plateforme de monétisation de contenu premium
            adaptée au marché africain. Paiement Mobile Money, simple et sécurisé.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/register?role=creator">
              <Button size="lg" className="text-lg px-8">
                Devenir créatrice
              </Button>
            </Link>
            <Link href="/register?role=subscriber">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Découvrir le contenu
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 w-full mt-16">
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Mobile Money</h3>
              <p className="text-muted-foreground">
                Paiements via MTN, Orange, Airtel. Simple et accessible pour tous.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Revenus directs</h3>
              <p className="text-muted-foreground">
                Recevez vos gains directement sur votre mobile money. Retraits rapides.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Contenu privé</h3>
              <p className="text-muted-foreground">
                Partagez du contenu exclusif avec vos abonnés. Contrôle total.
              </p>
            </div>
          </div>
        </main>

        <footer className="mt-24 text-center text-muted-foreground">
          <p>&copy; 2025 CloseUp. Tous droits réservés.</p>
        </footer>
      </div>
    </div>
  )
}
