import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CreditCard, CheckCircle } from "lucide-react"
import Link from "next/link"

async function getSubscriptions(userId: string) {
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
          user: {
            select: { id: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return subscriptions
}

export default async function SubscriptionsPage() {
  const session = await auth()
  if (!session) return null

  const subscriptions = await getSubscriptions(session.user.id)

  const activeSubscriptions = subscriptions.filter((s) => s.status === "ACTIVE")
  const expiredSubscriptions = subscriptions.filter((s) => s.status !== "ACTIVE")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mes Abonnements</h1>
        <p className="text-muted-foreground">
          Gérez vos abonnements aux créatrices
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucun abonnement</h3>
            <p className="text-muted-foreground text-center mt-2">
              Vous n&apos;avez pas encore d&apos;abonnement
            </p>
            <Link href="/discover" className="mt-4">
              <Button>Découvrir des créatrices</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {activeSubscriptions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Abonnements actifs</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeSubscriptions.map((subscription) => (
                  <Card key={subscription.id}>
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={subscription.creator.avatar || undefined}
                        />
                        <AvatarFallback>
                          {subscription.creator.artistName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {subscription.creator.artistName}
                          {subscription.creator.isVerified && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </CardTitle>
                        <Badge variant="success">Actif</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plan</span>
                          <span className="font-medium">
                            {subscription.plan === "WEEKLY"
                              ? "Hebdomadaire"
                              : subscription.plan === "MONTHLY"
                              ? "Mensuel"
                              : "Trimestriel"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Montant</span>
                          <span className="font-medium">
                            {formatCurrency(subscription.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expire le</span>
                          <span className="font-medium">
                            {formatDate(subscription.endDate)}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/creator/${subscription.creatorId}`}
                        className="block mt-4"
                      >
                        <Button variant="outline" className="w-full">
                          Voir le profil
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {expiredSubscriptions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">
                Abonnements expirés
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {expiredSubscriptions.map((subscription) => (
                  <Card key={subscription.id} className="opacity-60">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={subscription.creator.avatar || undefined}
                        />
                        <AvatarFallback>
                          {subscription.creator.artistName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {subscription.creator.artistName}
                        </CardTitle>
                        <Badge variant="secondary">Expiré</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Link
                        href={`/creator/${subscription.creatorId}`}
                        className="block"
                      >
                        <Button variant="outline" className="w-full">
                          Renouveler
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
