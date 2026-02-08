"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

interface SubscribeButtonProps {
  creatorId: string
  creatorName: string
  plan: "WEEKLY" | "MONTHLY" | "QUARTERLY"
  price: number
  label: string
  popular?: boolean
}

export function SubscribeButton({
  creatorId,
  creatorName,
  plan,
  price,
  label,
  popular,
}: SubscribeButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    setIsLoading(true)

    // Rediriger vers la page de paiement
    router.push(`/subscribe/${creatorId}?plan=${plan}`)
  }

  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition-colors ${
        popular
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <Star className="h-3 w-3" />
            Populaire
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="font-medium">{label}</span>
        <span className="text-xl font-bold">{formatCurrency(price)}</span>
      </div>

      <Button
        onClick={handleSubscribe}
        disabled={isLoading}
        variant={popular ? "default" : "outline"}
        className="w-full"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        S&apos;abonner
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-2">
        {plan === "WEEKLY"
          ? "7 jours d'accès"
          : plan === "MONTHLY"
          ? "30 jours d'accès"
          : "90 jours d'accès"}
      </p>
    </div>
  )
}
