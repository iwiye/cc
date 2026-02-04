import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const withdrawalSchema = z.object({
  amount: z.number().min(5000, "Le montant minimum de retrait est de 5000 FCFA"),
  phoneNumber: z.string().regex(/^(\+?237|0)?[6-9]\d{8}$/, "Numéro de téléphone invalide"),
  provider: z.enum(["MTN", "ORANGE", "AIRTEL", "MOOV"]),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "CREATOR") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      )
    }

    if (!profile.isVerified) {
      return NextResponse.json(
        { error: "Votre compte doit être vérifié pour effectuer des retraits" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = withdrawalSchema.parse(body)

    if (validatedData.amount > profile.availableBalance) {
      return NextResponse.json(
        { error: "Solde insuffisant" },
        { status: 400 }
      )
    }

    // Vérifier s'il y a un retrait en cours
    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: {
        creatorId: profile.id,
        status: "PENDING",
      },
    })

    if (pendingWithdrawal) {
      return NextResponse.json(
        { error: "Vous avez déjà une demande de retrait en cours" },
        { status: 400 }
      )
    }

    // Créer la demande de retrait
    const withdrawal = await prisma.withdrawal.create({
      data: {
        creatorId: profile.id,
        amount: validatedData.amount,
        phoneNumber: validatedData.phoneNumber,
        provider: validatedData.provider,
      },
    })

    // Déduire le montant du solde disponible
    await prisma.creatorProfile.update({
      where: { id: profile.id },
      data: {
        availableBalance: profile.availableBalance - validatedData.amount,
      },
    })

    return NextResponse.json({
      message: "Demande de retrait créée avec succès",
      withdrawal,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating withdrawal:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du retrait" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "CREATOR") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      )
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where: { creatorId: profile.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ withdrawals })
  } catch (error) {
    console.error("Error fetching withdrawals:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des retraits" },
      { status: 500 }
    )
  }
}
