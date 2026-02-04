import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Email invalide"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
})

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Email invalide"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^(\+?237|0)?[6-9]\d{8}$/.test(val), {
      message: "Numéro de téléphone invalide",
    }),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z
    .string()
    .min(1, "La confirmation du mot de passe est requise"),
  role: z.enum(["CREATOR", "SUBSCRIBER"], {
    message: "Veuillez sélectionner un type de compte",
  }),
  artistName: z.string().optional(),
  dateOfBirth: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === "CREATOR" && !data.artistName) {
    return false
  }
  return true
}, {
  message: "Le nom d'artiste est requis pour les créatrices",
  path: ["artistName"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
