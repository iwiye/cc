"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface SettingsFormProps {
  profile: {
    artistName: string
    bio: string | null
    avatar: string | null
    coverImage: string | null
    weeklyPrice: number
    monthlyPrice: number
    quarterlyPrice: number
    isVerified: boolean
    kycStatus: string
  }
  user: {
    email: string
    phone: string | null
  }
}

export function SettingsForm({ profile, user }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Profile state
  const [artistName, setArtistName] = useState(profile.artistName)
  const [bio, setBio] = useState(profile.bio || "")

  // Pricing state
  const [weeklyPrice, setWeeklyPrice] = useState(profile.weeklyPrice)
  const [monthlyPrice, setMonthlyPrice] = useState(profile.monthlyPrice)
  const [quarterlyPrice, setQuarterlyPrice] = useState(profile.quarterlyPrice)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/creator/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "profile",
          artistName,
          bio: bio || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la mise à jour")
      }

      setMessage({ type: "success", text: "Profil mis à jour avec succès" })
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Une erreur est survenue",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePricingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/creator/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "pricing",
          weeklyPrice,
          monthlyPrice,
          quarterlyPrice,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la mise à jour")
      }

      setMessage({ type: "success", text: "Tarifs mis à jour avec succès" })
      router.refresh()
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Une erreur est survenue",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Statut de vérification */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Statut de vérification
            {profile.isVerified ? (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Vérifiée
              </Badge>
            ) : profile.kycStatus === "PENDING" ? (
              <Badge variant="warning" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                En attente
              </Badge>
            ) : (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Non vérifiée
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {profile.isVerified
              ? "Votre compte est vérifié. Vous pouvez effectuer des retraits."
              : profile.kycStatus === "PENDING"
              ? "Votre demande de vérification est en cours de traitement."
              : "Veuillez soumettre vos documents KYC pour pouvoir effectuer des retraits."}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Informations du profil */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du profil</CardTitle>
          <CardDescription>
            Personnalisez votre profil visible par vos abonnés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled />
              <p className="text-xs text-muted-foreground">
                L&apos;email ne peut pas être modifié
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" value={user.phone || "Non renseigné"} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artistName">Nom d&apos;artiste</Label>
              <Input
                id="artistName"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Votre nom de scène"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Décrivez-vous en quelques mots..."
                maxLength={500}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/500 caractères
              </p>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer le profil
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tarifs d'abonnement */}
      <Card>
        <CardHeader>
          <CardTitle>Tarifs d&apos;abonnement</CardTitle>
          <CardDescription>
            Définissez vos prix pour chaque plan d&apos;abonnement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePricingSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="weeklyPrice">Prix hebdomadaire (FCFA)</Label>
              <Input
                id="weeklyPrice"
                type="number"
                value={weeklyPrice}
                onChange={(e) => setWeeklyPrice(parseInt(e.target.value) || 0)}
                min={500}
                max={100000}
                step={100}
              />
              <p className="text-xs text-muted-foreground">
                Min: 500 FCFA - Max: 100 000 FCFA
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyPrice">Prix mensuel (FCFA)</Label>
              <Input
                id="monthlyPrice"
                type="number"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(parseInt(e.target.value) || 0)}
                min={1000}
                max={300000}
                step={100}
              />
              <p className="text-xs text-muted-foreground">
                Min: 1 000 FCFA - Max: 300 000 FCFA
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quarterlyPrice">Prix trimestriel (FCFA)</Label>
              <Input
                id="quarterlyPrice"
                type="number"
                value={quarterlyPrice}
                onChange={(e) => setQuarterlyPrice(parseInt(e.target.value) || 0)}
                min={2000}
                max={500000}
                step={100}
              />
              <p className="text-xs text-muted-foreground">
                Min: 2 000 FCFA - Max: 500 000 FCFA
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted space-y-2">
              <p className="text-sm font-medium">Aperçu des tarifs</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-muted-foreground">Semaine</p>
                  <p className="font-bold">{formatCurrency(weeklyPrice)}</p>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-muted-foreground">Mois</p>
                  <p className="font-bold">{formatCurrency(monthlyPrice)}</p>
                </div>
                <div className="text-center p-2 bg-background rounded">
                  <p className="text-muted-foreground">Trimestre</p>
                  <p className="font-bold">{formatCurrency(quarterlyPrice)}</p>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les tarifs
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Messages */}
      {message && (
        <div className="lg:col-span-2">
          <div
            className={`p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        </div>
      )}
    </div>
  )
}
