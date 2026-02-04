import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateContentSchema } from "@/lib/validations/content"
import { deleteFromCloudinary } from "@/lib/cloudinary"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

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

    const content = await prisma.content.findFirst({
      where: {
        id,
        creatorId: profile.id,
      },
    })

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

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

    const existingContent = await prisma.content.findFirst({
      where: {
        id,
        creatorId: profile.id,
      },
    })

    if (!existingContent) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateContentSchema.parse(body)

    const content = await prisma.content.update({
      where: { id },
      data: {
        ...validatedData,
        publishedAt:
          validatedData.status === "PUBLISHED" && !existingContent.publishedAt
            ? new Date()
            : existingContent.publishedAt,
      },
    })

    return NextResponse.json({
      message: "Contenu mis à jour avec succès",
      content,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Données invalides", details: error },
        { status: 400 }
      )
    }

    console.error("Error updating content:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du contenu" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

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

    const content = await prisma.content.findFirst({
      where: {
        id,
        creatorId: profile.id,
      },
    })

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      )
    }

    // Extraire le public_id de l'URL Cloudinary
    const urlParts = content.url.split("/")
    const publicIdWithExtension = urlParts.slice(-2).join("/")
    const publicId = publicIdWithExtension.replace(/\.[^/.]+$/, "")

    // Supprimer de Cloudinary
    try {
      await deleteFromCloudinary(publicId)
    } catch (cloudinaryError) {
      console.error("Error deleting from Cloudinary:", cloudinaryError)
      // Continuer même si la suppression Cloudinary échoue
    }

    // Supprimer de la base de données
    await prisma.content.delete({
      where: { id },
    })

    return NextResponse.json({
      message: "Contenu supprimé avec succès",
    })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du contenu" },
      { status: 500 }
    )
  }
}
