import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import { Image as ImageIcon, Video, AlertTriangle, CheckCircle, Clock, Flag } from "lucide-react"
import { ModerationActions } from "@/components/admin/moderation-actions"

async function getContentForModeration() {
  // Contenu en attente de modération ou signalé
  const pendingContent = await prisma.content.findMany({
    where: {
      OR: [
        { status: "PENDING" },
        { status: "FLAGGED" },
      ],
    },
    include: {
      creator: {
        include: {
          user: { select: { email: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Statistiques
  const stats = await prisma.content.groupBy({
    by: ["status"],
    _count: true,
  })

  const statsMap = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count
    return acc
  }, {} as Record<string, number>)

  // Contenu récemment modéré
  const recentlyModerated = await prisma.content.findMany({
    where: {
      status: { in: ["PUBLISHED", "REJECTED"] },
      updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    include: {
      creator: true,
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
  })

  return { pendingContent, stats: statsMap, recentlyModerated }
}

export default async function ModerationPage() {
  const { pendingContent, stats, recentlyModerated } = await getContentForModeration()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Modération de contenu</h1>
        <p className="text-muted-foreground">
          Examiner et modérer le contenu publié
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.PENDING || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Signalé</CardTitle>
            <Flag className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.FLAGGED || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Publié</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.PUBLISHED || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejeté</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.REJECTED || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu à modérer */}
      <Card>
        <CardHeader>
          <CardTitle>Contenu en attente de modération</CardTitle>
          <CardDescription>
            {pendingContent.length} élément(s) à examiner
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Aucun contenu en attente de modération</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingContent.map((content) => (
                <div
                  key={content.id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={content.creator.avatar || undefined} />
                        <AvatarFallback>
                          {content.creator.artistName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{content.creator.artistName}</p>
                        <p className="text-sm text-muted-foreground">
                          {content.creator.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={content.status === "FLAGGED" ? "destructive" : "secondary"}>
                        {content.status === "FLAGGED" ? "Signalé" : "En attente"}
                      </Badge>
                      <Badge variant="outline">
                        {content.type === "VIDEO" ? (
                          <><Video className="h-3 w-3 mr-1" /> Vidéo</>
                        ) : (
                          <><ImageIcon className="h-3 w-3 mr-1" /> Image</>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Preview */}
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
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
                    </div>

                    {/* Détails */}
                    <div className="space-y-3">
                      {content.title && (
                        <div>
                          <p className="text-sm text-muted-foreground">Titre</p>
                          <p className="font-medium">{content.title}</p>
                        </div>
                      )}
                      {content.description && (
                        <div>
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="text-sm">{content.description}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Soumis le</p>
                        <p className="text-sm">{formatDate(content.createdAt)}</p>
                      </div>
                      {content.url && (
                        <div>
                          <p className="text-sm text-muted-foreground">URL du fichier</p>
                          <a
                            href={content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all"
                          >
                            Voir le fichier original
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t">
                    <ModerationActions contentId={content.id} currentStatus={content.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique récent */}
      <Card>
        <CardHeader>
          <CardTitle>Modérations récentes</CardTitle>
          <CardDescription>
            Actions de modération des 7 derniers jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentlyModerated.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">
              Aucune modération récente
            </p>
          ) : (
            <div className="space-y-3">
              {recentlyModerated.map((content) => (
                <div
                  key={content.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={content.creator.avatar || undefined} />
                      <AvatarFallback>
                        {content.creator.artistName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {content.title || "Sans titre"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {content.creator.artistName} • {formatDate(content.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={content.status === "PUBLISHED" ? "success" : "destructive"}>
                    {content.status === "PUBLISHED" ? "Approuvé" : "Rejeté"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
