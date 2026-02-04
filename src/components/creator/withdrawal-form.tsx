"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"

interface WithdrawalFormProps {
  maxAmount: number
}

const providers = [
  { id: "MTN", name: "MTN Mobile Money", color: "bg-yellow-500" },
  { id: "ORANGE", name: "Orange Money", color: "bg-orange-500" },
  { id: "AIRTEL", name: "Airtel Money", color: "bg-red-500" },
  { id: "MOOV", name: "Moov Money", color: "bg-blue-500" },
]

export function WithdrawalForm({ maxAmount }: WithdrawalFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [amount, setAmount] = useState<number>(Math.min(maxAmount, 5000))
  const [phoneNumber, setPhoneNumber] = useState("")
  const [provider, setProvider] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/creator/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          phoneNumber,
          provider,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la demande")
      }

      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
        <p className="font-medium">Demande envoyée avec succès</p>
        <p className="text-sm mt-1">
          Votre demande de retrait de {formatCurrency(amount)} est en cours de
          traitement.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="amount">Montant (FCFA)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
          min={5000}
          max={maxAmount}
          step={1000}
        />
        <p className="text-xs text-muted-foreground">
          Min: 5 000 FCFA - Max: {formatCurrency(maxAmount)}
        </p>
      </div>

      <div className="space-y-2">
        <Label>Opérateur Mobile Money</Label>
        <div className="grid grid-cols-2 gap-2">
          {providers.map((p) => (
            <label
              key={p.id}
              className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
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
              <div className={`w-3 h-3 rounded-full ${p.color}`} />
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
        />
        <p className="text-xs text-muted-foreground">
          Le numéro associé à votre compte Mobile Money
        </p>
      </div>

      <div className="p-3 rounded-lg bg-muted">
        <div className="flex justify-between text-sm">
          <span>Montant du retrait</span>
          <span className="font-medium">{formatCurrency(amount)}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span>Frais (0%)</span>
          <span className="font-medium">{formatCurrency(0)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t">
          <span>Vous recevrez</span>
          <span>{formatCurrency(amount)}</span>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !provider || !phoneNumber || amount < 5000}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Demander le retrait
      </Button>
    </form>
  )
}
