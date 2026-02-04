import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle, Users } from "lucide-react"
import Link from "next/link"

async function getVerifiedCreators() {
  const creators = await prisma.creatorProfile.findMany({
    where: {
      isVerified: true,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      _count: {
        select: {
          subscriptions: {
            where: { status: "ACTIVE" },
          },
          contents: {
            where: { status: "PUBLISHED" },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  })

  return creators
}

export default async function DiscoverPage() {
  const creators = await getVerifiedCreators()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Découvrir</h1>
        <p className="text-muted-foreground">
          Explorez les créatrices de contenu vérifiées
        </p>
      </div>

      {creators.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucune créatrice disponible</h3>
            <p className="text-muted-foreground text-center mt-2">
              Revenez bientôt pour découvrir de nouvelles créatrices
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => (
            <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Cover image */}
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/40 relative">
                {creator.coverImage && (
                  <img
                    src={creator.coverImage}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Avatar */}
              <div className="px-6 -mt-10 relative z-10">
                <Avatar className="h-20 w-20 border-4 border-background">
                  <AvatarImage src={creator.avatar || undefined} />
                  <AvatarFallback className="text-2xl">
                    {creator.artistName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <CardHeader className="pt-2">
                <CardTitle className="flex items-center gap-2">
                  {creator.artistName}
                  <CheckCircle className="h-5 w-5 text-primary" />
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {creator.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {creator.bio}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{creator._count.subscriptions} abonnés</span>
                  <span>{creator._count.contents} publications</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {formatCurrency(creator.weeklyPrice)}/semaine
                  </Badge>
                  <Badge variant="outline">
                    {formatCurrency(creator.monthlyPrice)}/mois
                  </Badge>
                </div>

                <Link href={`/creator/${creator.id}`} className="block">
                  <Button className="w-full">Voir le profil</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
