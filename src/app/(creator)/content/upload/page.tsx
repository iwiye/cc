import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UploadForm } from "@/components/creator/upload-form"

export default function UploadPage() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || ""

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/content">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Ajouter du contenu</h1>
          <p className="text-muted-foreground">
            Uploadez une photo ou une vidéo
          </p>
        </div>
      </div>

      <UploadForm cloudName={cloudName} />
    </div>
  )
}
