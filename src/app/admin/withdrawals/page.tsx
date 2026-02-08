import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Clock, CheckCircle, XCircle, Wallet } from "lucide-react"
import { WithdrawalActions } from "@/components/admin/withdrawal-actions"

async function getWithdrawals() {
  const withdrawals = await prisma.withdrawal.findMany({
    include: {
      creator: {
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    pending: withdrawals.filter((w) => w.status === "PENDING").length,
    pendingAmount: withdrawals
      .filter((w) => w.status === "PENDING")
      .reduce((sum, w) => sum + w.amount, 0),
    completed: withdrawals.filter((w) => w.status === "COMPLETED").length,
    completedAmount: withdrawals
      .filter((w) => w.status === "COMPLETED")
      .reduce((sum, w) => sum + w.amount, 0),
  }

  return { withdrawals, stats }
}

export default async function WithdrawalsPage() {
  const { withdrawals, stats } = await getWithdrawals()

  const pendingWithdrawals = withdrawals.filter((w) => w.status === "PENDING")
  const processedWithdrawals = withdrawals.filter((w) => w.status !== "PENDING")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Gestion des retraits</h1>
        <p className="text-muted-foreground">
          Traitez les demandes de retrait des créatrices
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Montant en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(stats.pendingAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Effectués
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total versé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(stats.completedAmount)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Retraits en attente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Retraits en attente ({pendingWithdrawals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingWithdrawals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun retrait en attente
            </p>
          ) : (
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="p-4 rounded-lg border space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{withdrawal.creator.artistName}</p>
                      <p className="text-sm text-muted-foreground">
                        {withdrawal.creator.user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <Badge variant="warning">
                        <Clock className="h-3 w-3 mr-1" />
                        En attente
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Opérateur</p>
                      <p className="font-medium">{withdrawal.provider}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Numéro</p>
                      <p className="font-medium">{withdrawal.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Demandé le</p>
                      <p className="font-medium">{formatDate(withdrawal.requestedAt)}</p>
                    </div>
                  </div>

                  <WithdrawalActions withdrawalId={withdrawal.id} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historique */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des retraits</CardTitle>
        </CardHeader>
        <CardContent>
          {processedWithdrawals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun retrait traité
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Créatrice</th>
                    <th className="pb-3 font-medium">Montant</th>
                    <th className="pb-3 font-medium">Opérateur</th>
                    <th className="pb-3 font-medium">Statut</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {processedWithdrawals.slice(0, 20).map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b last:border-0">
                      <td className="py-3">{withdrawal.creator.artistName}</td>
                      <td className="py-3 font-medium">
                        {formatCurrency(withdrawal.amount)}
                      </td>
                      <td className="py-3">{withdrawal.provider}</td>
                      <td className="py-3">
                        {withdrawal.status === "COMPLETED" ? (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Effectué
                          </Badge>
                        ) : withdrawal.status === "APPROVED" ? (
                          <Badge>Approuvé</Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejeté
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(withdrawal.processedAt || withdrawal.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
