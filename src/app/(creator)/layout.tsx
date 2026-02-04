import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { CreatorSidebar } from "@/components/creator/sidebar"

export const metadata: Metadata = {
  title: "Espace Créatrice",
}

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "CREATOR") {
    redirect("/discover")
  }

  return (
    <div className="min-h-screen bg-background">
      <CreatorSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
