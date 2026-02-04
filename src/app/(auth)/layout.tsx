import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentification",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">CloseUp</h1>
          <p className="text-muted-foreground mt-2">
            Votre plateforme de contenu premium
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
