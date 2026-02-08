import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const withdrawalActionSchema = z.object({
  withdrawalId: z.string().min(1),
  action: z.enum(["approve", "complete", "reject"]),
  reason: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { withdrawalId, action, reason } = withdrawalActionSchema.parse(body)

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { creator: true },
    })

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Retrait non trouvé" },
        { status: 404 }
      )
    }

    if (withdrawal.status !== "PENDING" && withdrawal.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Ce retrait a déjà été traité" },
        { status: 400 }
      )
    }

    if (action === "approve") {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "APPROVED",
          processedBy: session.user.id,
        },
      })

      return NextResponse.json({
        message: "Retrait approuvé",
      })
    } else if (action === "complete") {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "COMPLETED",
          processedAt: new Date(),
          processedBy: session.user.id,
        },
      })

      return NextResponse.json({
        message: "Retrait marqué comme effectué",
      })
    } else {
      // Rejeter le retrait et rembourser le solde
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: "REJECTED",
            rejectReason: reason,
            processedAt: new Date(),
            processedBy: session.user.id,
          },
        }),
        prisma.creatorProfile.update({
          where: { id: withdrawal.creatorId },
          data: {
            availableBalance: {
              increment: withdrawal.amount,
            },
          },
        }),
      ])

      return NextResponse.json({
        message: "Retrait rejeté, solde restauré",
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error processing withdrawal:", error)
    return NextResponse.json(
      { error: "Erreur lors du traitement du retrait" },
      { status: 500 }
    )
  }
}
