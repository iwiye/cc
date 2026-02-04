import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "@/components/creator/settings-form"

async function getCreatorProfile(userId: string) {
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          email: true,
          phone: true,
        },
      },
    },
  })

  return profile
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session) return null

  const profile = await getCreatorProfile(session.user.id)
  if (!profile) return <div>Profil non trouvé</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez votre profil et vos tarifs d&apos;abonnement
        </p>
      </div>

      <SettingsForm
        profile={{
          artistName: profile.artistName,
          bio: profile.bio,
          avatar: profile.avatar,
          coverImage: profile.coverImage,
          weeklyPrice: profile.weeklyPrice,
          monthlyPrice: profile.monthlyPrice,
          quarterlyPrice: profile.quarterlyPrice,
          isVerified: profile.isVerified,
          kycStatus: profile.kycStatus,
        }}
        user={{
          email: profile.user.email,
          phone: profile.user.phone,
        }}
      />
    </div>
  )
}
