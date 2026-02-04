import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Users } from "lucide-react"

async function getSubscribers(userId: string) {
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId },
  })

  if (!profile) return null

  const subscriptions = await prisma.subscription.findMany({
    where: {
      creatorId: profile.id,
    },
    include: {
      subscriber: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              createdAt: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "ACTIVE").length,
    expired: subscriptions.filter((s) => s.status === "EXPIRED").length,
  }

  return { subscriptions, stats }
}

export default async function SubscribersPage() {
  const session = await auth()
  if (!session) return null

  const data = await getSubscribers(session.user.id)
  if (!data) return <div>Profil non trouvé</div>

  const { subscriptions, stats } = data

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mes Abonnés</h1>
        <p className="text-muted-foreground">
          Gérez et suivez vos abonnés
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total abonnés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expirés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-muted-foreground">{stats.expired}</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des abonnés */}
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucun abonné</h3>
            <p className="text-muted-foreground text-center mt-2">
              Publiez du contenu attractif pour attirer des abonnés
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des abonnés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {subscription.subscriber.user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {subscription.subscriber.user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Membre depuis {formatDate(subscription.subscriber.user.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(subscription.amount)}</p>
                      <p className="text-sm text-muted-foreground">
                        {subscription.plan === "WEEKLY"
                          ? "Hebdo"
                          : subscription.plan === "MONTHLY"
                          ? "Mensuel"
                          : "Trimestriel"}
                      </p>
                    </div>
                    <Badge
                      variant={subscription.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {subscription.status === "ACTIVE" ? "Actif" : "Expiré"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
