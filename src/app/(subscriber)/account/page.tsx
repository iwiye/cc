import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency } from "@/lib/utils"
import { User, Mail, Phone, CreditCard, Calendar } from "lucide-react"

async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriberProfile: true,
    },
  })

  if (!user) return null

  // Statistiques des abonnements
  const subscriptionStats = await prisma.subscription.aggregate({
    where: {
      subscriber: { userId },
    },
    _sum: { amount: true },
    _count: true,
  })

  const activeSubscriptions = await prisma.subscription.count({
    where: {
      subscriber: { userId },
      status: "ACTIVE",
    },
  })

  return {
    user,
    stats: {
      totalSpent: subscriptionStats._sum.amount || 0,
      totalSubscriptions: subscriptionStats._count,
      activeSubscriptions,
    },
  }
}

export default async function AccountPage() {
  const session = await auth()
  if (!session) return null

  const data = await getUserData(session.user.id)
  if (!data) return <div>Utilisateur non trouvé</div>

  const { user, stats } = data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mon Compte</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations du compte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Vos informations de connexion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="font-medium">{user.phone || "Non renseigné"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Membre depuis</p>
                <p className="font-medium">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            {user.subscriberProfile?.dateOfBirth && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date de naissance</p>
                  <p className="font-medium">
                    {formatDate(user.subscriberProfile.dateOfBirth)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Mes abonnements
            </CardTitle>
            <CardDescription>
              Historique de vos abonnements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 text-center">
                <p className="text-3xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-sm text-muted-foreground">Abonnements actifs</p>
              </div>
              <div className="p-4 rounded-lg bg-muted text-center">
                <p className="text-3xl font-bold">{stats.totalSubscriptions}</p>
                <p className="text-sm text-muted-foreground">Total abonnements</p>
              </div>
            </div>

            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground">Total dépensé</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</p>
            </div>

            <div className="pt-2">
              <Badge variant="secondary">Compte {user.role}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations supplémentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Sécurité et confidentialité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Vos données sont protégées et ne sont jamais partagées avec des tiers.
            Pour toute question concernant votre compte, contactez notre support.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Connexion sécurisée</Badge>
            <Badge variant="outline">Données chiffrées</Badge>
            <Badge variant="outline">Paiements sécurisés</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
