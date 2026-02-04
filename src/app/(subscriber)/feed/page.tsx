import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"
import { Image as ImageIcon, Video, Lock } from "lucide-react"
import Link from "next/link"

async function getSubscriberFeed(userId: string) {
  const subscriberProfile = await prisma.subscriberProfile.findUnique({
    where: { userId },
  })

  if (!subscriberProfile) return { contents: [], subscriptions: [] }

  const activeSubscriptions = await prisma.subscription.findMany({
    where: {
      subscriberId: subscriberProfile.id,
      status: "ACTIVE",
    },
    include: {
      creator: true,
    },
  })

  const creatorIds = activeSubscriptions.map((sub) => sub.creatorId)

  const contents = await prisma.content.findMany({
    where: {
      creatorId: { in: creatorIds },
      status: "PUBLISHED",
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
    orderBy: { publishedAt: "desc" },
    take: 50,
  })

  return { contents, subscriptions: activeSubscriptions }
}

export default async function FeedPage() {
  const session = await auth()
  if (!session) return null

  const { contents, subscriptions } = await getSubscriberFeed(session.user.id)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mon Feed</h1>
        <p className="text-muted-foreground">
          Le contenu de vos créatrices favorites
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucun abonnement actif</h3>
            <p className="text-muted-foreground text-center mt-2 max-w-sm">
              Abonnez-vous à des créatrices pour voir leur contenu exclusif ici
            </p>
            <Link href="/discover" className="mt-4">
              <Button>Découvrir des créatrices</Button>
            </Link>
          </CardContent>
        </Card>
      ) : contents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Pas de contenu récent</h3>
            <p className="text-muted-foreground text-center mt-2">
              Vos créatrices n&apos;ont pas encore publié de contenu
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {contents.map((content) => (
            <Card key={content.id}>
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar>
                  <AvatarImage src={content.creator.avatar || undefined} />
                  <AvatarFallback>
                    {content.creator.artistName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-base">
                    {content.creator.artistName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {content.publishedAt
                      ? formatRelativeTime(content.publishedAt)
                      : ""}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.title && (
                  <p className="font-medium">{content.title}</p>
                )}
                {content.description && (
                  <p className="text-muted-foreground">{content.description}</p>
                )}
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  {content.thumbnail || content.url ? (
                    <img
                      src={content.thumbnail || content.url}
                      alt={content.title || "Contenu"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {content.type === "VIDEO" ? (
                        <Video className="h-12 w-12 text-muted-foreground" />
                      ) : (
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  {content.type === "VIDEO" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-primary border-b-8 border-b-transparent ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
