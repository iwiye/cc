"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PaymentFormProps {
  creatorId: string
  plan: "WEEKLY" | "MONTHLY" | "QUARTERLY"
  amount: number
}

const providers = [
  { id: "MTN", name: "MTN Mobile Money", color: "bg-yellow-500" },
  { id: "ORANGE", name: "Orange Money", color: "bg-orange-500" },
  { id: "AIRTEL", name: "Airtel Money", color: "bg-red-500" },
  { id: "MOOV", name: "Moov Money", color: "bg-blue-500" },
]

export function PaymentForm({ creatorId, plan, amount }: PaymentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<string>("")
  const [phoneNumber, setPhoneNumber] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          plan,
          provider,
          phoneNumber,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors du paiement")
      }

      // Rediriger vers la page de confirmation ou le profil
      router.push(`/creator/${creatorId}?subscribed=true`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          Paiement Mobile Money
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {providers.map((p) => (
            <label
              key={p.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                provider === p.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input
                type="radio"
                name="provider"
                value={p.id}
                checked={provider === p.id}
                onChange={(e) => setProvider(e.target.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full ${p.color}`} />
              <span className="text-sm font-medium">{p.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="6XXXXXXXX"
          required
        />
        <p className="text-xs text-muted-foreground">
          Vous recevrez une demande de paiement sur ce numéro
        </p>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading || !provider || !phoneNumber}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Payer maintenant
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        En cliquant sur &quot;Payer maintenant&quot;, vous acceptez nos conditions
        d&apos;utilisation. L&apos;abonnement sera activé immédiatement après
        confirmation du paiement.
      </p>
    </form>
  )
}
