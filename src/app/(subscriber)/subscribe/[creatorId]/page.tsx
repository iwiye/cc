import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PaymentForm } from "@/components/subscriber/payment-form"

async function getSubscriptionData(creatorId: string, userId: string) {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorId },
    include: {
      user: { select: { id: true } },
    },
  })

  if (!creator) return null

  // Vérifier si déjà abonné
  const subscriberProfile = await prisma.subscriberProfile.findUnique({
    where: { userId },
  })

  if (subscriberProfile) {
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: subscriberProfile.id,
        creatorId: creator.id,
        status: "ACTIVE",
      },
    })

    if (existingSubscription) {
      return { creator, alreadySubscribed: true }
    }
  }

  return { creator, alreadySubscribed: false }
}

export default async function SubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ creatorId: string }>
  searchParams: Promise<{ plan?: string }>
}) {
  const session = await auth()
  if (!session) {
    redirect("/login")
  }

  const { creatorId } = await params
  const { plan } = await searchParams

  const data = await getSubscriptionData(creatorId, session.user.id)

  if (!data) {
    notFound()
  }

  const { creator, alreadySubscribed } = data

  if (alreadySubscribed) {
    redirect(`/creator/${creatorId}`)
  }

  const selectedPlan = (plan as "WEEKLY" | "MONTHLY" | "QUARTERLY") || "MONTHLY"
  const price =
    selectedPlan === "WEEKLY"
      ? creator.weeklyPrice
      : selectedPlan === "MONTHLY"
      ? creator.monthlyPrice
      : creator.quarterlyPrice

  const duration =
    selectedPlan === "WEEKLY" ? 7 : selectedPlan === "MONTHLY" ? 30 : 90

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href={`/creator/${creatorId}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au profil
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Finaliser votre abonnement</CardTitle>
          <CardDescription>
            Vous êtes sur le point de vous abonner à {creator.artistName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Récap créatrice */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
            <Avatar className="h-16 w-16">
              <AvatarImage src={creator.avatar || undefined} />
              <AvatarFallback className="text-xl">
                {creator.artistName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold flex items-center gap-2">
                {creator.artistName}
                {creator.isVerified && (
                  <CheckCircle className="h-4 w-4 text-primary" />
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                Accès à tout le contenu exclusif
              </p>
            </div>
          </div>

          {/* Sélection du plan */}
          <div className="space-y-3">
            <p className="font-medium">Plan sélectionné</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "WEEKLY", label: "Hebdo", price: creator.weeklyPrice, days: 7 },
                { id: "MONTHLY", label: "Mensuel", price: creator.monthlyPrice, days: 30 },
                { id: "QUARTERLY", label: "Trimestre", price: creator.quarterlyPrice, days: 90 },
              ].map((p) => (
                <Link
                  key={p.id}
                  href={`/subscribe/${creatorId}?plan=${p.id}`}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    selectedPlan === p.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="font-medium text-sm">{p.label}</p>
                  <p className="text-lg font-bold">{formatCurrency(p.price)}</p>
                  <p className="text-xs text-muted-foreground">{p.days} jours</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Récap paiement */}
          <div className="p-4 rounded-lg bg-muted space-y-2">
            <div className="flex justify-between">
              <span>Abonnement {selectedPlan === "WEEKLY" ? "hebdomadaire" : selectedPlan === "MONTHLY" ? "mensuel" : "trimestriel"}</span>
              <span className="font-medium">{formatCurrency(price)}</span>
            </div>
            <div className="flex justify-between">
              <span>Durée</span>
              <span className="font-medium">{duration} jours</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold">
              <span>Total à payer</span>
              <span>{formatCurrency(price)}</span>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <PaymentForm
            creatorId={creatorId}
            plan={selectedPlan}
            amount={price}
          />
        </CardContent>
      </Card>
    </div>
  )
}
