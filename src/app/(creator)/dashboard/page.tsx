import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Users, Image, Eye, Wallet } from "lucide-react"

async function getCreatorStats(userId: string) {
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: {
      _count: {
        select: {
          contents: true,
          subscriptions: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
  })

  if (!profile) return null

  const totalViews = await prisma.content.aggregate({
    where: { creatorId: profile.id },
    _sum: { views: true },
  })

  return {
    profile,
    totalSubscribers: profile._count.subscriptions,
    totalContent: profile._count.contents,
    totalViews: totalViews._sum.views || 0,
  }
}

export default async function CreatorDashboardPage() {
  const session = await auth()
  if (!session) return null

  const stats = await getCreatorStats(session.user.id)
  if (!stats) return <div>Profil non trouvé</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenue, {stats.profile.artistName}
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre activité
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnés actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              Abonnements en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contenus</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContent}</div>
            <p className="text-xs text-muted-foreground">
              Photos et vidéos publiées
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde disponible</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.profile.availableBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Prêt pour retrait
            </p>
          </CardContent>
        </Card>
      </div>

      {!stats.profile.isVerified && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="text-yellow-700 dark:text-yellow-300">
              Vérification en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600 dark:text-yellow-400">
              Votre compte est en attente de vérification KYC. Vous pouvez
              commencer à publier du contenu, mais les retraits ne seront
              disponibles qu&apos;après validation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
