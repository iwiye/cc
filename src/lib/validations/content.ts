import { z } from "zod"

export const createContentSchema = z.object({
  type: z.enum(["PHOTO", "VIDEO"]),
  url: z.string().url("URL invalide"),
  thumbnail: z.string().url("URL de thumbnail invalide").optional(),
  title: z.string().max(200, "Le titre ne doit pas dépasser 200 caractères").optional(),
  description: z.string().max(1000, "La description ne doit pas dépasser 1000 caractères").optional(),
  isPreview: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
})

export const updateContentSchema = createContentSchema.partial()

export const updatePricingSchema = z.object({
  weeklyPrice: z.number().min(500, "Le prix minimum est de 500 FCFA").max(100000, "Le prix maximum est de 100 000 FCFA"),
  monthlyPrice: z.number().min(1000, "Le prix minimum est de 1000 FCFA").max(300000, "Le prix maximum est de 300 000 FCFA"),
  quarterlyPrice: z.number().min(2000, "Le prix minimum est de 2000 FCFA").max(500000, "Le prix maximum est de 500 000 FCFA"),
})

export type CreateContentInput = z.infer<typeof createContentSchema>
export type UpdateContentInput = z.infer<typeof updateContentSchema>
export type UpdatePricingInput = z.infer<typeof updatePricingSchema>
