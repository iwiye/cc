"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface ModerationActionsProps {
  contentId: string
  currentStatus: string
}

export function ModerationActions({ contentId, currentStatus }: ModerationActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const router = useRouter()

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !showRejectForm) {
      setShowRejectForm(true)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/moderation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          action,
          reason: rejectReason || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erreur lors de la modération")
      }

      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      alert(error instanceof Error ? error.message : "Erreur lors de la modération")
    } finally {
      setIsLoading(false)
      setShowRejectForm(false)
      setRejectReason("")
    }
  }

  if (showRejectForm) {
    return (
      <div className="space-y-3">
        <Textarea
          placeholder="Raison du rejet (optionnel)"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={2}
        />
        <div className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => handleAction("reject")}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <XCircle className="h-4 w-4 mr-2" />
            )}
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
    )
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="default"
        className="bg-green-600 hover:bg-green-700"
        onClick={() => handleAction("approve")}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-2" />
        )}
        Approuver
      </Button>
      <Button
        variant="destructive"
        onClick={() => handleAction("reject")}
        disabled={isLoading}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Rejeter
      </Button>
    </div>
  )
}
