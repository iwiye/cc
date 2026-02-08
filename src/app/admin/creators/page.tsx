import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { CheckCircle, XCircle, Clock, Users } from "lucide-react"
import Link from "next/link"

async function getAllCreators() {
  const creators = await prisma.creatorProfile.findMany({
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
          contents: { where: { status: "PUBLISHED" } },
          subscriptions: { where: { status: "ACTIVE" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return creators
}

export default async function CreatorsPage() {
  const creators = await getAllCreators()

  const stats = {
    total: creators.length,
    verified: creators.filter((c) => c.isVerified).length,
    pending: creators.filter((c) => c.kycStatus === "PENDING").length,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Créatrices</h1>
        <p className="text-muted-foreground">
          Gérez toutes les créatrices de la plateforme
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total créatrices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vérifiées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              KYC en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des créatrices */}
      {creators.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucune créatrice</h3>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Liste des créatrices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Créatrice</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Contenus</th>
                    <th className="pb-3 font-medium">Abonnés</th>
                    <th className="pb-3 font-medium">Gains</th>
                    <th className="pb-3 font-medium">Inscrite le</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((creator) => (
                    <tr key={creator.id} className="border-b last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={creator.avatar || undefined} />
                            <AvatarFallback>
                              {creator.artistName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{creator.artistName}</p>
                            <p className="text-sm text-muted-foreground">
                              {creator.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        {creator.isVerified ? (
                          <Badge variant="success" className="flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" />
                            Vérifiée
                          </Badge>
                        ) : creator.kycStatus === "PENDING" ? (
                          <Link href="/admin/kyc">
                            <Badge variant="warning" className="flex items-center gap-1 w-fit cursor-pointer">
                              <Clock className="h-3 w-3" />
                              En attente
                            </Badge>
                          </Link>
                        ) : (
                          <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                            <XCircle className="h-3 w-3" />
                            Rejetée
                          </Badge>
                        )}
                      </td>
                      <td className="py-4">{creator._count.contents}</td>
                      <td className="py-4">{creator._count.subscriptions}</td>
                      <td className="py-4">{formatCurrency(creator.totalEarnings)}</td>
                      <td className="py-4 text-muted-foreground">
                        {formatDate(creator.user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
