"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Loader2, Upload, X, Image as ImageIcon, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UploadFormProps {
  cloudName: string
}

export function UploadForm({ cloudName }: UploadFormProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    type: "PHOTO" | "VIDEO"
    thumbnail?: string
  } | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isPreview, setIsPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadToCloudinary = async (file: File) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Obtenir la signature
      const signatureRes = await fetch("/api/content/upload", {
        method: "POST",
      })
      const signatureData = await signatureRes.json()

      if (!signatureRes.ok) {
        throw new Error(signatureData.error || "Erreur lors de l'upload")
      }

      // Upload vers Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("api_key", signatureData.apiKey)
      formData.append("timestamp", signatureData.timestamp.toString())
      formData.append("signature", signatureData.signature)
      formData.append("folder", `closeup/creators`)

      const resourceType = file.type.startsWith("video/") ? "video" : "image"

      const xhr = new XMLHttpRequest()
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
      )

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100))
        }
      }

      const uploadResult = await new Promise<{
        secure_url: string
        resource_type: string
      }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error("Upload failed"))
          }
        }
        xhr.onerror = () => reject(new Error("Upload failed"))
        xhr.send(formData)
      })

      setUploadedFile({
        url: uploadResult.secure_url,
        type: resourceType === "video" ? "VIDEO" : "PHOTO",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload")
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      uploadToCloudinary(acceptedFiles[0])
    }
  }, [cloudName])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".mov", ".avi", ".webm"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  })

  const handleSave = async (status: "DRAFT" | "PUBLISHED") => {
    if (!uploadedFile) return

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: uploadedFile.type,
          url: uploadedFile.url,
          thumbnail: uploadedFile.thumbnail,
          title: title || undefined,
          description: description || undefined,
          isPreview,
          status,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de l'enregistrement")
      }

      router.push("/content")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'enregistrement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemove = () => {
    setUploadedFile(null)
    setTitle("")
    setDescription("")
    setIsPreview(false)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Zone d'upload */}
      <Card>
        <CardHeader>
          <CardTitle>Fichier</CardTitle>
        </CardHeader>
        <CardContent>
          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
                  <p className="text-muted-foreground">
                    Upload en cours... {uploadProgress}%
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      Glissez votre fichier ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Photos (JPG, PNG, GIF) ou vidéos (MP4, MOV) - Max 100MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {uploadedFile.type === "VIDEO" ? (
                  <video
                    src={uploadedFile.url}
                    className="w-full h-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={uploadedFile.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 mt-2">
                {uploadedFile.type === "VIDEO" ? (
                  <Video className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {uploadedFile.type === "VIDEO" ? "Vidéo" : "Photo"}
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Détails du contenu */}
      <Card>
        <CardHeader>
          <CardTitle>Détails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre (optionnel)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Donnez un titre à votre contenu"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre contenu..."
              maxLength={1000}
              rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/1000 caractères
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPreview"
              checked={isPreview}
              onChange={(e) => setIsPreview(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="isPreview" className="cursor-pointer">
              Contenu gratuit (visible par tous)
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => handleSave("DRAFT")}
              disabled={!uploadedFile || isSaving}
              className="flex-1"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer comme brouillon
            </Button>
            <Button
              onClick={() => handleSave("PUBLISHED")}
              disabled={!uploadedFile || isSaving}
              className="flex-1"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Publier
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
