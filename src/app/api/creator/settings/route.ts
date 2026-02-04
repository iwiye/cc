import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProfileSchema = z.object({
  artistName: z.string().min(2, "Le nom d'artiste doit contenir au moins 2 caractères").optional(),
  bio: z.string().max(500, "La bio ne doit pas dépasser 500 caractères").optional(),
  avatar: z.string().url().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
})

const updatePricingSchema = z.object({
  weeklyPrice: z.number().min(500).max(100000),
  monthlyPrice: z.number().min(1000).max(300000),
  quarterlyPrice: z.number().min(2000).max(500000),
})

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
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profil non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "CREATOR") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, ...data } = body

    let validatedData
    if (type === "pricing") {
      validatedData = updatePricingSchema.parse(data)
    } else {
      validatedData = updateProfileSchema.parse(data)
    }

    const profile = await prisma.creatorProfile.update({
      where: { userId: session.user.id },
      data: validatedData,
    })

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      profile,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating profile:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    )
  }
}
