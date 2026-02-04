import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { generateSignature } from "@/lib/cloudinary"

export async function POST() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "CREATOR") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      )
    }

    const folder = `closeup/creators/${session.user.id}`
    const signatureData = await generateSignature(folder)

    return NextResponse.json(signatureData)
  } catch (error) {
    console.error("Error generating signature:", error)
    return NextResponse.json(
      { error: "Erreur lors de la génération de la signature" },
      { status: 500 }
    )
  }
}
