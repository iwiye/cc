import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Image as ImageIcon, Video } from "lucide-react"
import Link from "next/link"

async function getCreatorContent(userId: string) {
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId },
  })

  if (!profile) return null

  const contents = await prisma.content.findMany({
    where: { creatorId: profile.id },
    orderBy: { createdAt: "desc" },
  })

  return { profile, contents }
}

export default async function ContentPage() {
  const session = await auth()
  if (!session) return null

  const data = await getCreatorContent(session.user.id)
  if (!data) return <div>Profil non trouvé</div>

  const { contents } = data

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mon Contenu</h1>
          <p className="text-muted-foreground">
            Gérez vos photos et vidéos
          </p>
        </div>
        <Link href="/content/upload">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter du contenu
          </Button>
        </Link>
      </div>

      {contents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucun contenu</h3>
            <p className="text-muted-foreground text-center mt-2">
              Commencez à publier du contenu pour attirer des abonnés
            </p>
            <Link href="/content/upload" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter mon premier contenu
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contents.map((content) => (
            <Card key={content.id} className="overflow-hidden">
              <div className="aspect-square bg-muted relative">
                {content.thumbnail ? (
                  <img
                    src={content.thumbnail}
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
                <div className="absolute top-2 right-2">
                  <Badge
                    variant={
                      content.status === "PUBLISHED"
                        ? "success"
                        : content.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {content.status === "PUBLISHED"
                      ? "Publié"
                      : content.status === "REJECTED"
                      ? "Rejeté"
                      : "Brouillon"}
                  </Badge>
                </div>
                {content.isPreview && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className="bg-background">
                      Gratuit
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-base line-clamp-1">
                  {content.title || "Sans titre"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Eye className="h-4 w-4 mr-1" />
                  {content.views} vues
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
