import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle, Image as ImageIcon, Users, Lock } from "lucide-react"
import { SubscribeButton } from "@/components/subscriber/subscribe-button"

async function getCreatorProfile(creatorId: string, userId?: string) {
  const creator = await prisma.creatorProfile.findUnique({
    where: { id: creatorId },
    include: {
      user: {
        select: { id: true, email: true },
      },
      contents: {
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: 20,
      },
      _count: {
        select: {
          subscriptions: { where: { status: "ACTIVE" } },
          contents: { where: { status: "PUBLISHED" } },
        },
      },
    },
  })

  if (!creator) return null

  // Vérifier si l'utilisateur est abonné
  let isSubscribed = false
  let subscription = null

  if (userId) {
    const subscriberProfile = await prisma.subscriberProfile.findUnique({
      where: { userId },
    })

    if (subscriberProfile) {
      subscription = await prisma.subscription.findFirst({
        where: {
          subscriberId: subscriberProfile.id,
          creatorId: creator.id,
          status: "ACTIVE",
        },
      })
      isSubscribed = !!subscription
    }
  }

  return { creator, isSubscribed, subscription }
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const data = await getCreatorProfile(id, session?.user?.id)

  if (!data) {
    notFound()
  }

  const { creator, isSubscribed } = data

  // Séparer le contenu gratuit et payant
  const freeContent = creator.contents.filter((c) => c.isPreview)
  const paidContent = creator.contents.filter((c) => !c.isPreview)

  return (
    <div className="space-y-8">
      {/* Header du profil */}
      <div className="relative">
        {/* Cover image */}
        <div className="h-48 bg-gradient-to-r from-primary/20 to-primary/40 rounded-xl overflow-hidden">
          {creator.coverImage && (
            <img
              src={creator.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Avatar et infos */}
        <div className="flex flex-col md:flex-row gap-6 px-6 -mt-16 relative z-10">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage src={creator.avatar || undefined} />
            <AvatarFallback className="text-4xl">
              {creator.artistName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 pt-4 md:pt-16">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{creator.artistName}</h1>
              {creator.isVerified && (
                <CheckCircle className="h-6 w-6 text-primary" />
              )}
            </div>
            {creator.bio && (
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {creator.bio}
              </p>
            )}
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {creator._count.subscriptions} abonnés
              </span>
              <span className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                {creator._count.contents} publications
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plans d'abonnement */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>
                {isSubscribed ? "Vous êtes abonné" : "S'abonner"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSubscribed ? (
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                  <p className="font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Abonnement actif
                  </p>
                  <p className="text-sm mt-1">
                    Vous avez accès à tout le contenu exclusif
                  </p>
                </div>
              ) : (
                <>
                  <SubscribeButton
                    creatorId={creator.id}
                    creatorName={creator.artistName}
                    plan="WEEKLY"
                    price={creator.weeklyPrice}
                    label="Hebdomadaire"
                  />
                  <SubscribeButton
                    creatorId={creator.id}
                    creatorName={creator.artistName}
                    plan="MONTHLY"
                    price={creator.monthlyPrice}
                    label="Mensuel"
                    popular
                  />
                  <SubscribeButton
                    creatorId={creator.id}
                    creatorName={creator.artistName}
                    plan="QUARTERLY"
                    price={creator.quarterlyPrice}
                    label="Trimestriel"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contenu */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contenu gratuit */}
          {freeContent.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Aperçu gratuit</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {freeContent.map((content) => (
                  <ContentCard key={content.id} content={content} unlocked />
                ))}
              </div>
            </div>
          )}

          {/* Contenu payant */}
          {paidContent.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Contenu exclusif ({paidContent.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {paidContent.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    unlocked={isSubscribed}
                  />
                ))}
              </div>
            </div>
          )}

          {creator.contents.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucun contenu publié pour le moment
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ContentCard({
  content,
  unlocked,
}: {
  content: {
    id: string
    type: string
    url: string
    thumbnail: string | null
    title: string | null
  }
  unlocked: boolean
}) {
  return (
    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
      {unlocked ? (
        <>
          <img
            src={content.thumbnail || content.url}
            alt={content.title || "Contenu"}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {content.type === "VIDEO" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                <div className="w-0 h-0 border-t-6 border-t-transparent border-l-10 border-l-primary border-b-6 border-b-transparent ml-1" />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <Lock className="h-8 w-8 text-muted-foreground mb-2 relative z-10" />
          <Badge variant="secondary" className="relative z-10">
            Abonnez-vous
          </Badge>
        </div>
      )}
    </div>
  )
}
