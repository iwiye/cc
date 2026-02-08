import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const subscriptionSchema = z.object({
  creatorId: z.string().min(1, "ID créatrice requis"),
  plan: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY"]),
  provider: z.enum(["MTN", "ORANGE", "AIRTEL", "MOOV"]),
  phoneNumber: z.string().regex(/^(\+?237|0)?[6-9]\d{8}$/, "Numéro invalide"),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "SUBSCRIBER") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = subscriptionSchema.parse(body)

    // Récupérer le profil abonné
    let subscriberProfile = await prisma.subscriberProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscriberProfile) {
      // Créer le profil s'il n'existe pas
      subscriberProfile = await prisma.subscriberProfile.create({
        data: { userId: session.user.id },
      })
    }

    // Récupérer le profil créatrice
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { id: validatedData.creatorId },
    })

    if (!creatorProfile) {
      return NextResponse.json(
        { error: "Créatrice non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier si déjà abonné
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: subscriberProfile.id,
        creatorId: creatorProfile.id,
        status: "ACTIVE",
      },
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: "Vous êtes déjà abonné à cette créatrice" },
        { status: 400 }
      )
    }

    // Calculer le prix et la durée
    const price =
      validatedData.plan === "WEEKLY"
        ? creatorProfile.weeklyPrice
        : validatedData.plan === "MONTHLY"
        ? creatorProfile.monthlyPrice
        : creatorProfile.quarterlyPrice

    const days =
      validatedData.plan === "WEEKLY"
        ? 7
        : validatedData.plan === "MONTHLY"
        ? 30
        : 90

    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)

    // Générer une référence unique
    const reference = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Créer la transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        amount: price,
        type: "SUBSCRIPTION",
        status: "PENDING",
        provider: validatedData.provider,
        reference,
        metadata: {
          creatorId: creatorProfile.id,
          plan: validatedData.plan,
          phoneNumber: validatedData.phoneNumber,
        },
      },
    })

    // TODO: Intégrer avec Flutterwave/Paystack pour le vrai paiement
    // Pour le moment, simuler un paiement réussi

    // Mettre à jour la transaction comme réussie
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "SUCCESS" },
    })

    // Créer ou mettre à jour l'abonnement
    const subscription = await prisma.subscription.upsert({
      where: {
        subscriberId_creatorId: {
          subscriberId: subscriberProfile.id,
          creatorId: creatorProfile.id,
        },
      },
      create: {
        subscriberId: subscriberProfile.id,
        creatorId: creatorProfile.id,
        plan: validatedData.plan,
        status: "ACTIVE",
        amount: price,
        endDate,
        transactionId: transaction.id,
      },
      update: {
        plan: validatedData.plan,
        status: "ACTIVE",
        amount: price,
        startDate: new Date(),
        endDate,
        transactionId: transaction.id,
      },
    })

    // Mettre à jour les gains de la créatrice (80% pour la créatrice)
    const creatorEarnings = Math.floor(price * 0.8)
    await prisma.creatorProfile.update({
      where: { id: creatorProfile.id },
      data: {
        totalEarnings: { increment: creatorEarnings },
        availableBalance: { increment: creatorEarnings },
      },
    })

    return NextResponse.json({
      message: "Abonnement activé avec succès",
      subscription,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error creating subscription:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de l'abonnement" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const subscriberProfile = await prisma.subscriberProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscriberProfile) {
      return NextResponse.json({ subscriptions: [] })
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { subscriberId: subscriberProfile.id },
      include: {
        creator: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des abonnements" },
      { status: 500 }
    )
  }
}
