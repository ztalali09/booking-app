// lib/validations/booking.ts
import { z } from 'zod'

export const createBookingSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Le numéro doit contenir au moins 8 chiffres"),
  country: z.string().default("FR"),
  date: z.string().datetime(), // ISO 8601 format
  time: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide"),
  period: z.enum(["morning", "afternoon"]),
  firstConsultation: z.boolean(),
  consultationReason: z.string().min(10, "Le motif de consultation doit contenir au moins 10 caractères"),
  message: z.string().optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>


