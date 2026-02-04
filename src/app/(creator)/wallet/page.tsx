import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Wallet, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react"
import { WithdrawalForm } from "@/components/creator/withdrawal-form"

async function getWalletData(userId: string) {
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId },
  })

  if (!profile) return null

  const withdrawals = await prisma.withdrawal.findMany({
    where: { creatorId: profile.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  // Calculer les stats
  const totalWithdrawn = await prisma.withdrawal.aggregate({
    where: {
      creatorId: profile.id,
      status: "COMPLETED",
    },
    _sum: { amount: true },
  })

  return {
    profile,
    withdrawals,
    totalWithdrawn: totalWithdrawn._sum.amount || 0,
  }
}

export default async function WalletPage() {
  const session = await auth()
  if (!session) return null

  const data = await getWalletData(session.user.id)
  if (!data) return <div>Profil non trouvé</div>

  const { profile, withdrawals, totalWithdrawn } = data
  const hasPendingWithdrawal = withdrawals.some((w) => w.status === "PENDING")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Portefeuille</h1>
        <p className="text-muted-foreground">
          Gérez vos revenus et effectuez des retraits
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Solde disponible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(profile.availableBalance)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Prêt pour retrait
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Gains totaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(profile.totalEarnings)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Depuis le début
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Total retiré
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalWithdrawn)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Retraits effectués
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulaire de retrait */}
        <Card>
          <CardHeader>
            <CardTitle>Demander un retrait</CardTitle>
            <CardDescription>
              Les retraits sont traités sous 24-48h ouvrées
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!profile.isVerified ? (
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300">
                <p className="font-medium">Compte non vérifié</p>
                <p className="text-sm mt-1">
                  Vous devez faire vérifier votre compte (KYC) avant de pouvoir
                  effectuer des retraits.
                </p>
              </div>
            ) : hasPendingWithdrawal ? (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                <p className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Retrait en cours
                </p>
                <p className="text-sm mt-1">
                  Vous avez déjà une demande de retrait en attente de traitement.
                </p>
              </div>
            ) : profile.availableBalance < 5000 ? (
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium">Solde insuffisant</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Le montant minimum de retrait est de 5 000 FCFA.
                </p>
              </div>
            ) : (
              <WithdrawalForm maxAmount={profile.availableBalance} />
            )}
          </CardContent>
        </Card>

        {/* Historique des retraits */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des retraits</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun retrait effectué
              </p>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {withdrawal.provider} - {withdrawal.phoneNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(withdrawal.requestedAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        withdrawal.status === "COMPLETED"
                          ? "success"
                          : withdrawal.status === "PENDING"
                          ? "warning"
                          : withdrawal.status === "APPROVED"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {withdrawal.status === "COMPLETED" && (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      )}
                      {withdrawal.status === "PENDING" && (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {withdrawal.status === "REJECTED" && (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {withdrawal.status === "COMPLETED"
                        ? "Effectué"
                        : withdrawal.status === "PENDING"
                        ? "En attente"
                        : withdrawal.status === "APPROVED"
                        ? "Approuvé"
                        : "Rejeté"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
