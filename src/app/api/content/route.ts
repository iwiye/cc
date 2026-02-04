import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createContentSchema } from "@/lib/validations/content"

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
        { error: "Profil créatrice non trouvé" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createContentSchema.parse(body)

    const content = await prisma.content.create({
      data: {
        ...validatedData,
        creatorId: profile.id,
        publishedAt: validatedData.status === "PUBLISHED" ? new Date() : null,
      },
    })

    return NextResponse.json({
      message: "Contenu créé avec succès",
      content,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error },
        { status: 400 }
      )
    }

    console.error("Error creating content:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création du contenu" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
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
        { error: "Profil créatrice non trouvé" },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where = {
      creatorId: profile.id,
      ...(status && { status: status as "DRAFT" | "PUBLISHED" | "REJECTED" }),
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.content.count({ where }),
    ])

    return NextResponse.json({
      contents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
      { status: 500 }
    )
  }
}
