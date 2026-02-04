import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { SubscriberSidebar } from "@/components/subscriber/sidebar"

export const metadata: Metadata = {
  title: "Espace Abonné",
}

export default async function SubscriberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  if (session.user.role === "CREATOR") {
    redirect("/dashboard")
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <SubscriberSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
