"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface KycActionsProps {
  creatorId: string
}

export function KycActions({ creatorId }: KycActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleAction = async (action: "approve" | "reject") => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          action,
          reason: action === "reject" ? rejectReason : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur")
      }

      setMessage({
        type: "success",
        text: action === "approve" ? "KYC approuvé" : "KYC rejeté",
      })

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
    <div className="space-y-4 pt-4 border-t">
      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {showRejectForm ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="rejectReason">Raison du rejet</Label>
            <Input
              id="rejectReason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Expliquez la raison du rejet..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => handleAction("reject")}
              disabled={isLoading || !rejectReason}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le rejet
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRejectForm(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Button
            onClick={() => handleAction("approve")}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Approuver
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowRejectForm(true)}
            disabled={isLoading}
            className="flex-1"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Rejeter
          </Button>
        </div>
      )}
    </div>
  )
}
