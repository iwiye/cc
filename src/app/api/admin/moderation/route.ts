import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const moderationActionSchema = z.object({
  contentId: z.string().min(1),
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
    const { contentId, action, reason } = moderationActionSchema.parse(body)

    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: { creator: true },
    })

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      )
    }

    if (content.status !== "PENDING" && content.status !== "FLAGGED") {
      return NextResponse.json(
        { error: "Ce contenu a déjà été modéré" },
        { status: 400 }
      )
    }

    if (action === "approve") {
      await prisma.content.update({
        where: { id: contentId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
        },
      })

      return NextResponse.json({
        message: "Contenu approuvé et publié",
      })
    } else {
      await prisma.content.update({
        where: { id: contentId },
        data: {
          status: "REJECTED",
          // On pourrait stocker la raison dans les métadonnées si nécessaire
        },
      })

      return NextResponse.json({
        message: "Contenu rejeté",
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Error moderating content:", error)
    return NextResponse.json(
      { error: "Erreur lors de la modération" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const pendingContent = await prisma.content.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { status: "FLAGGED" },
        ],
      },
      include: {
        creator: {
          include: {
            user: { select: { id: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ contents: pendingContent })
  } catch (error) {
    console.error("Error fetching moderation queue:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
      { status: 500 }
    )
  }
}
