import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const kycActionSchema = z.object({
  creatorId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
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
    const { creatorId, action, reason } = kycActionSchema.parse(body)

    const creator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
    })

    if (!creator) {
      return NextResponse.json(
        { error: "Créatrice non trouvée" },
        { status: 404 }
      )
    }

    if (action === "approve") {
      await prisma.creatorProfile.update({
        where: { id: creatorId },
        data: {
          isVerified: true,
          kycStatus: "APPROVED",
        },
      })

      return NextResponse.json({
        message: "KYC approuvé avec succès",
      })
    } else {
      await prisma.creatorProfile.update({
        where: { id: creatorId },
        data: {
          isVerified: false,
          kycStatus: "REJECTED",
        },
      })

      return NextResponse.json({
        message: "KYC rejeté",
        reason,
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error processing KYC:", error)
    return NextResponse.json(
      { error: "Erreur lors du traitement KYC" },
      { status: 500 }
    )
  }
}
