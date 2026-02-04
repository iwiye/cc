"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Compass,
  Home,
  CreditCard,
  Heart,
  Settings,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "Découvrir", href: "/discover", icon: Compass },
  { name: "Mon Feed", href: "/feed", icon: Home },
  { name: "Mes Abonnements", href: "/subscriptions", icon: CreditCard },
  { name: "Favoris", href: "/favorites", icon: Heart },
  { name: "Paramètres", href: "/account", icon: Settings },
]

export function SubscriberSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/discover" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">CloseUp</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  )
}
