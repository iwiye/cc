import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Heart, CheckCircle } from "lucide-react"
import Link from "next/link"

async function getSubscribedCreators(userId: string) {
  const subscriberProfile = await prisma.subscriberProfile.findUnique({
    where: { userId },
  })

  if (!subscriberProfile) return []

  const subscriptions = await prisma.subscription.findMany({
    where: {
      subscriberId: subscriberProfile.id,
    },
    include: {
      creator: {
        include: {
          _count: {
            select: {
              contents: { where: { status: "PUBLISHED" } },
              subscriptions: { where: { status: "ACTIVE" } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return subscriptions
}

export default async function FavoritesPage() {
  const session = await auth()
  if (!session) return null

  const subscriptions = await getSubscribedCreators(session.user.id)
  const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mes Favoris</h1>
        <p className="text-muted-foreground">
          Les créatrices auxquelles vous êtes abonné
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucun favori</h3>
            <p className="text-muted-foreground text-center mt-2">
              Abonnez-vous à des créatrices pour les voir apparaître ici
            </p>
            <Link href="/discover" className="mt-4">
              <Button>Découvrir des créatrices</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeSubscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden">
              {/* Cover */}
              <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/40 relative">
                {subscription.creator.coverImage && (
                  <img
                    src={subscription.creator.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Avatar */}
              <div className="px-4 -mt-8 relative z-10">
                <Avatar className="h-16 w-16 border-4 border-background">
                  <AvatarImage src={subscription.creator.avatar || undefined} />
                  <AvatarFallback className="text-xl">
                    {subscription.creator.artistName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <CardContent className="pt-2 space-y-3">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    {subscription.creator.artistName}
                    {subscription.creator.isVerified && (
                      <CheckCircle className="h-4 w-4 text-primary" />
                    )}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span>{subscription.creator._count.contents} posts</span>
                    <span>{subscription.creator._count.subscriptions} abonnés</span>
                  </div>
                </div>

                <Badge variant="success" className="w-fit">
                  Abonné - {subscription.plan === "WEEKLY" ? "Hebdo" : subscription.plan === "MONTHLY" ? "Mensuel" : "Trimestre"}
                </Badge>

                <Link href={`/creator/${subscription.creator.id}`}>
                  <Button variant="outline" className="w-full">
                    Voir le profil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
