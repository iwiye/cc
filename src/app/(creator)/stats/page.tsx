import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, Users, Eye, DollarSign } from "lucide-react"

async function getCreatorStats(userId: string) {
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId },
  })

  if (!profile) return null

  // Stats des abonnements
  const subscriptionStats = await prisma.subscription.groupBy({
    by: ["plan"],
    where: {
      creatorId: profile.id,
      status: "ACTIVE",
    },
    _count: true,
    _sum: { amount: true },
  })

  // Total des revenus
  const totalRevenue = await prisma.subscription.aggregate({
    where: { creatorId: profile.id },
    _sum: { amount: true },
  })

  // Revenus ce mois
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthlyRevenue = await prisma.subscription.aggregate({
    where: {
      creatorId: profile.id,
      createdAt: { gte: startOfMonth },
    },
    _sum: { amount: true },
  })

  // Vues totales
  const totalViews = await prisma.content.aggregate({
    where: { creatorId: profile.id },
    _sum: { views: true },
  })

  // Nombre d'abonnés actifs
  const activeSubscribers = await prisma.subscription.count({
    where: {
      creatorId: profile.id,
      status: "ACTIVE",
    },
  })

  return {
    profile,
    subscriptionStats,
    totalRevenue: totalRevenue._sum.amount || 0,
    monthlyRevenue: monthlyRevenue._sum.amount || 0,
    totalViews: totalViews._sum.views || 0,
    activeSubscribers,
  }
}

export default async function StatsPage() {
  const session = await auth()
  if (!session) return null

  const stats = await getCreatorStats(session.user.id)
  if (!stats) return <div>Profil non trouvé</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">
          Analysez vos performances et revenus
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Depuis le début
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.monthlyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Mois en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnés actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              Abonnements en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Sur tous vos contenus
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par plan</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.subscriptionStats.length === 0 ? (
              <p className="text-muted-foreground">
                Aucun abonnement pour le moment
              </p>
            ) : (
              <div className="space-y-4">
                {stats.subscriptionStats.map((stat) => (
                  <div
                    key={stat.plan}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {stat.plan === "WEEKLY"
                          ? "Hebdomadaire"
                          : stat.plan === "MONTHLY"
                          ? "Mensuel"
                          : "Trimestriel"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {stat._count} abonnés
                      </p>
                    </div>
                    <p className="font-bold">
                      {formatCurrency(stat._sum.amount || 0)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solde et retraits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
              <div>
                <p className="text-sm text-muted-foreground">Solde disponible</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.profile.availableBalance)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="text-sm text-muted-foreground">Total des gains</p>
                <p className="text-xl font-bold">
                  {formatCurrency(stats.profile.totalEarnings)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
