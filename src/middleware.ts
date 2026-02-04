import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

// Routes publiques qui ne nécessitent pas d'authentification
const publicRoutes = ["/login", "/register", "/"]

// Routes par rôle
const creatorRoutes = ["/dashboard", "/content", "/stats", "/subscribers", "/wallet", "/settings"]
const subscriberRoutes = ["/discover", "/feed", "/subscriptions", "/favorites", "/account"]
const adminRoutes = ["/admin"]

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorer les routes API et les assets statiques
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const session = await auth()

  // Si l'utilisateur n'est pas connecté
  if (!session) {
    // Permettre l'accès aux routes publiques
    if (publicRoutes.some((route) => pathname === route)) {
      return NextResponse.next()
    }
    // Rediriger vers la page de connexion
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const userRole = session.user.role

  // Si l'utilisateur est connecté et essaie d'accéder aux pages d'auth
  if (pathname === "/login" || pathname === "/register") {
    // Rediriger selon le rôle
    if (userRole === "CREATOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
    return NextResponse.redirect(new URL("/discover", request.url))
  }

  // Redirection de la page d'accueil selon le rôle
  if (pathname === "/") {
    if (userRole === "CREATOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
    return NextResponse.redirect(new URL("/discover", request.url))
  }

  // Protection des routes créatrice
  if (creatorRoutes.some((route) => pathname.startsWith(route))) {
    if (userRole !== "CREATOR") {
      return NextResponse.redirect(new URL("/discover", request.url))
    }
  }

  // Protection des routes abonné
  if (subscriberRoutes.some((route) => pathname.startsWith(route))) {
    if (userRole === "CREATOR") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    }
  }

  // Protection des routes admin
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (userRole !== "ADMIN") {
      if (userRole === "CREATOR") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
      return NextResponse.redirect(new URL("/discover", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
