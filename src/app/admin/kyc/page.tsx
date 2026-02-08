import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Clock, FileText } from "lucide-react"
import { KycActions } from "@/components/admin/kyc-actions"

async function getPendingKyc() {
  const creators = await prisma.creatorProfile.findMany({
    where: {
      kycStatus: "PENDING",
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          contents: true,
          subscriptions: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return creators
}

export default async function KycPage() {
  const pendingCreators = await getPendingKyc()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Vérification KYC</h1>
        <p className="text-muted-foreground">
          Validez les demandes de vérification des créatrices
        </p>
      </div>

      {pendingCreators.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucune demande en attente</h3>
            <p className="text-muted-foreground text-center mt-2">
              Toutes les demandes KYC ont été traitées
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {pendingCreators.length} demande(s) en attente
          </p>

          {pendingCreators.map((creator) => (
            <Card key={creator.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={creator.avatar || undefined} />
                      <AvatarFallback className="text-xl">
                        {creator.artistName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{creator.artistName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {creator.user.email}
                      </p>
                      {creator.user.phone && (
                        <p className="text-sm text-muted-foreground">
                          {creator.user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="warning">
                    <Clock className="h-3 w-3 mr-1" />
                    En attente
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Inscrite le</p>
                    <p className="font-medium">{formatDate(creator.user.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Contenus</p>
                    <p className="font-medium">{creator._count.contents}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Abonnés</p>
                    <p className="font-medium">{creator._count.subscriptions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Document KYC</p>
                    {creator.kycDocument ? (
                      <a
                        href={creator.kycDocument}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Voir le document
                      </a>
                    ) : (
                      <p className="font-medium text-muted-foreground">Non fourni</p>
                    )}
                  </div>
                </div>

                {creator.bio && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bio</p>
                    <p className="text-sm">{creator.bio}</p>
                  </div>
                )}

                <KycActions creatorId={creator.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
