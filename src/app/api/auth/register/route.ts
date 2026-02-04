import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validations/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 400 }
      )
    }

    // Vérifier si le numéro de téléphone existe déjà
    if (validatedData.phone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: validatedData.phone },
      })

      if (existingPhone) {
        return NextResponse.json(
          { error: "Un compte avec ce numéro de téléphone existe déjà" },
          { status: 400 }
        )
      }
    }

    // Hasher le mot de passe
    const hashedPassword = await hash(validatedData.password, 12)

    // Créer l'utilisateur avec son profil
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        phone: validatedData.phone || null,
        password: hashedPassword,
        role: validatedData.role,
        ...(validatedData.role === "CREATOR" && {
          creatorProfile: {
            create: {
              artistName: validatedData.artistName!,
            },
          },
        }),
        ...(validatedData.role === "SUBSCRIBER" && {
          subscriberProfile: {
            create: {
              dateOfBirth: validatedData.dateOfBirth
                ? new Date(validatedData.dateOfBirth)
                : null,
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json({
      message: "Compte créé avec succès",
      user,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error },
        { status: 400 }
      )
    }

    console.error("Erreur lors de l'inscription:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription" },
      { status: 500 }
    )
  }
}
