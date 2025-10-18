# 🚀 Guide d'Implémentation Backend - Étape par Étape

## 📋 Vue d'Ensemble

Ce guide vous accompagne pour implémenter le backend complet du système de réservation **SANS authentification** (site public pour les patients).

**Durée estimée :** 2 semaines  
**Niveau :** Intermédiaire

---

## 🎯 Ce qu'on va Construire

```
✅ Base de données PostgreSQL avec Prisma
✅ API Routes Next.js (créer, lire, annuler réservations)
✅ Intégration Google Calendar (sync automatique)
✅ Notifications Email (Gmail via Nodemailer)
✅ Notifications Telegram Bot
✅ Page admin simple (avec protection basique par mot de passe)
✅ Cron job pour synchronisation
```

---

## 📦 Phase 0 : Préparation (30 minutes)

### Étape 0.1 : Installer les Dépendances

```bash
# Base de données
npm install prisma @prisma/client

# Google Calendar
npm install googleapis

# Email
npm install nodemailer
npm install -D @types/nodemailer

# Utilitaires
npm install date-fns
npm install bcryptjs  # Pour protéger la page admin
npm install -D @types/bcryptjs
```

### Étape 0.2 : Configurer PostgreSQL

**Option A : Local (développement)**
```bash
# Installer PostgreSQL sur votre machine
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql@14
brew services start postgresql@14

# Windows
# Télécharger depuis https://www.postgresql.org/download/

# Créer la base de données
sudo -u postgres psql
CREATE DATABASE booking_db;
CREATE USER booking_user WITH PASSWORD 'votre_password';
GRANT ALL PRIVILEGES ON DATABASE booking_db TO booking_user;
\q
```

**Option B : Cloud (production) - RECOMMANDÉ**
```bash
# Supabase (gratuit) - https://supabase.com
# 1. Créer un compte
# 2. Créer un projet
# 3. Récupérer la DATABASE_URL dans Settings > Database

# Ou Vercel Postgres
# 1. Sur Vercel Dashboard > Storage > Create Database
# 2. Sélectionner Postgres
# 3. Récupérer la DATABASE_URL
```

### Étape 0.3 : Créer `.env.local`

```bash
# Copier le template
cp env.example .env.local
```

```env
# .env.local

# ==============================================
# BASE DE DONNÉES
# ==============================================
DATABASE_URL="postgresql://booking_user:votre_password@localhost:5432/booking_db"

# ==============================================
# APPLICATION
# ==============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ==============================================
# GOOGLE CALENDAR (on configurera plus tard)
# ==============================================
GOOGLE_CALENDAR_CLIENT_ID=""
GOOGLE_CALENDAR_CLIENT_SECRET=""
GOOGLE_CALENDAR_REFRESH_TOKEN=""
DOCTOR_EMAIL="dr.dubois@gmail.com"

# ==============================================
# EMAIL (Gmail)
# ==============================================
GMAIL_USER="votre-email@gmail.com"
GMAIL_APP_PASSWORD=""  # On va générer ça

# ==============================================
# TELEGRAM (optionnel pour l'instant)
# ==============================================
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""

# ==============================================
# ADMIN (protection simple)
# ==============================================
ADMIN_PASSWORD="changez-moi-en-production"

# ==============================================
# CRON JOB
# ==============================================
CRON_SECRET="votre-secret-random-123456"
```

---

## 🗄️ Phase 1 : Base de Données avec Prisma (2-3 heures)

### Étape 1.1 : Initialiser Prisma

```bash
npx prisma init
```

Cela crée :
- `prisma/schema.prisma`
- `.env` (vous pouvez l'ignorer, on utilise `.env.local`)

### Étape 1.2 : Configurer le Schéma Prisma

Ouvrez `prisma/schema.prisma` et remplacez tout par :

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Modèle principal : Réservation
model Booking {
  id                    String        @id @default(cuid())
  
  // Informations patient
  firstName             String
  lastName              String
  email                 String
  phone                 String
  country               String        @default("FR")
  
  // Date et heure
  date                  DateTime
  time                  String        // Format: "09:00"
  period                String        // "morning" ou "afternoon"
  
  // Informations consultation
  firstConsultation     Boolean       @default(false)
  message               String?       // Optionnel
  
  // Statut de la réservation
  status                BookingStatus @default(PENDING)
  
  // Synchronisation Google Calendar
  googleCalendarEventId String?       @unique
  syncedWithGoogle      Boolean       @default(false)
  
  // Métadonnées
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  
  // Token pour annulation (sans auth)
  cancellationToken     String        @unique @default(cuid())
  
  // Indexes pour performance
  @@index([date, time])
  @@index([email])
  @@index([status])
  @@index([cancellationToken])
}

// Énumération des statuts
enum BookingStatus {
  PENDING       // En attente de confirmation
  CONFIRMED     // Confirmé
  CANCELLED     // Annulé
  COMPLETED     // Terminé (passé)
}

// Modèle optionnel : Créneaux bloqués
model BlockedSlot {
  id        String   @id @default(cuid())
  date      DateTime
  time      String
  reason    String?  // Ex: "Congé", "Formation", etc.
  createdAt DateTime @default(now())
  
  @@unique([date, time])
  @@index([date])
}

// Modèle optionnel : Configuration
model Settings {
  id                  String   @id @default(cuid())
  key                 String   @unique
  value               String
  updatedAt           DateTime @updatedAt
  
  @@index([key])
}
```

### Étape 1.3 : Créer la Migration

```bash
# Créer la migration initiale
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate
```

Vous devriez voir :
```
✔ Generated Prisma Client
```

### Étape 1.4 : Créer le Client Prisma Singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Étape 1.5 : Tester la Connexion

```bash
# Ouvrir Prisma Studio pour vérifier
npx prisma studio
```

Naviguer vers http://localhost:5555 - vous devriez voir vos tables vides.

---

## 🔧 Phase 2 : API Routes Next.js (4-5 heures)

### Étape 2.1 : Créer la Structure des Routes

```bash
mkdir -p app/api/bookings
mkdir -p app/api/bookings/[id]
mkdir -p app/api/bookings/cancel
mkdir -p app/api/availability
```

### Étape 2.2 : Validation avec Zod

```typescript
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
  message: z.string().optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
```

### Étape 2.3 : Route POST - Créer une Réservation

```typescript
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createBookingSchema } from '@/lib/validations/booking'

export async function POST(request: NextRequest) {
  try {
    // 1. Récupérer et valider les données
    const body = await request.json()
    const validatedData = createBookingSchema.parse(body)

    // 2. Vérifier la disponibilité du créneau
    const existingBooking = await prisma.booking.findFirst({
      where: {
        date: new Date(validatedData.date),
        time: validatedData.time,
        status: {
          notIn: ['CANCELLED']
        }
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: "Ce créneau est déjà réservé" },
        { status: 409 }
      )
    }

    // 3. Créer la réservation
    const booking = await prisma.booking.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
      }
    })

    // 4. Démarrer les tâches asynchrones (ne pas attendre)
    // On les fera en Phase 3, 4, 5
    Promise.all([
      // addToGoogleCalendar(booking),
      // sendEmailToDoctor(booking),
      // sendTelegramNotification(booking),
      // sendConfirmationEmail(booking),
    ]).catch(error => {
      console.error('Erreur lors des notifications:', error)
      // Ne pas bloquer la réponse si les notifications échouent
    })

    // 5. Retourner la réservation créée
    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          cancellationToken: booking.cancellationToken,
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erreur création réservation:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    )
  }
}

// Route GET - Lister les réservations (pour admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    const where: any = {}
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    if (status) {
      where.status = status
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        date: true,
        time: true,
        period: true,
        firstConsultation: true,
        message: true,
        status: true,
        createdAt: true,
        // Ne pas exposer le cancellationToken ici
      }
    })

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('Erreur récupération réservations:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des réservations" },
      { status: 500 }
    )
  }
}
```

### Étape 2.4 : Route GET - Détails d'une Réservation

```typescript
// app/api/bookings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        date: true,
        time: true,
        period: true,
        firstConsultation: true,
        message: true,
        status: true,
        createdAt: true,
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })

  } catch (error) {
    console.error('Erreur récupération réservation:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    )
  }
}

// Route DELETE - Annuler une réservation (pour admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'CANCELLED' }
    })

    // Envoyer notification d'annulation (Phase 4)
    // await sendCancellationEmail(booking)

    return NextResponse.json({
      success: true,
      message: "Réservation annulée"
    })

  } catch (error) {
    console.error('Erreur annulation:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 }
    )
  }
}
```

### Étape 2.5 : Route Annulation Publique (avec Token)

```typescript
// app/api/bookings/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { cancellationToken } = await request.json()

    if (!cancellationToken) {
      return NextResponse.json(
        { error: "Token d'annulation requis" },
        { status: 400 }
      )
    }

    // Trouver et annuler la réservation
    const booking = await prisma.booking.findUnique({
      where: { cancellationToken }
    })

    if (!booking) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      )
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json(
        { error: "Cette réservation est déjà annulée" },
        { status: 400 }
      )
    }

    // Vérifier que la réservation n'est pas dans moins de 24h
    const now = new Date()
    const bookingDate = new Date(booking.date)
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilBooking < 24) {
      return NextResponse.json(
        { error: "Impossible d'annuler moins de 24h avant le rendez-vous. Veuillez contacter le cabinet." },
        { status: 400 }
      )
    }

    // Annuler
    const updatedBooking = await prisma.booking.update({
      where: { cancellationToken },
      data: { status: 'CANCELLED' }
    })

    // Envoyer notifications (Phase 4)
    // await sendCancellationEmail(updatedBooking)
    // await sendCancellationNotificationToDoctor(updatedBooking)

    return NextResponse.json({
      success: true,
      message: "Votre rendez-vous a été annulé avec succès"
    })

  } catch (error) {
    console.error('Erreur annulation publique:', error)
    return NextResponse.json(
      { error: "Erreur lors de l'annulation" },
      { status: 500 }
    )
  }
}
```

### Étape 2.6 : Route Disponibilités

```typescript
// app/api/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date')

    if (!dateParam) {
      return NextResponse.json(
        { error: "Date requise" },
        { status: 400 }
      )
    }

    const date = new Date(dateParam)
    
    // Récupérer toutes les réservations du jour (non annulées)
    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: {
          notIn: ['CANCELLED']
        }
      },
      select: {
        time: true,
      }
    })

    // Créneaux disponibles (hardcodés pour l'instant)
    const morningSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"]
    const afternoonSlots = ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"]
    const allSlots = [...morningSlots, ...afternoonSlots]

    // Retirer les créneaux déjà réservés
    const bookedTimes = bookings.map(b => b.time)
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot))

    return NextResponse.json({
      date: dateParam,
      availableSlots,
      bookedSlots: bookedTimes.length,
      totalSlots: allSlots.length,
    })

  } catch (error) {
    console.error('Erreur disponibilités:', error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des disponibilités" },
      { status: 500 }
    )
  }
}
```

### Étape 2.7 : Tester les API Routes

```bash
# Installer un client HTTP (optionnel)
npm install -g httpie

# Ou utiliser curl
```

Tester la création d'une réservation :
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@email.com",
    "phone": "0612345678",
    "country": "FR",
    "date": "2025-10-25T10:00:00.000Z",
    "time": "10:00",
    "period": "morning",
    "firstConsultation": true,
    "message": "Première consultation"
  }'
```

---

## 📧 Phase 3 : Service Email avec Gmail (2-3 heures)

### Étape 3.1 : Générer un Mot de Passe d'Application Gmail

1. Aller sur https://myaccount.google.com/security
2. Activer la validation en 2 étapes (si pas déjà fait)
3. Aller dans "Mots de passe des applications"
4. Créer un mot de passe pour "Application de messagerie"
5. Copier le mot de passe généré (format: xxxx xxxx xxxx xxxx)
6. Ajouter dans `.env.local`:
```env
GMAIL_USER="votre-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
```

### Étape 3.2 : Créer le Service Email

```typescript
// lib/email/mailer.ts
import nodemailer from 'nodemailer'

// Créer le transporteur
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Vérifier la connexion
transporter.verify((error) => {
  if (error) {
    console.error('Erreur configuration email:', error)
  } else {
    console.log('✅ Service email prêt')
  }
})

export default transporter
```

### Étape 3.3 : Templates d'Emails

```typescript
// lib/email/templates.ts
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Booking {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  date: Date
  time: string
  firstConsultation: boolean
  message?: string | null
  cancellationToken: string
}

export function confirmationEmailTemplate(booking: Booking) {
  const formattedDate = format(booking.date, "EEEE d MMMM yyyy", { locale: fr })
  const cancellationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/cancel/${booking.cancellationToken}`

  return {
    subject: `Confirmation de votre rendez-vous - Dr. Marie Dubois`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #0066FF; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Rendez-vous Confirmé</h1>
          </div>
          <div class="content">
            <p>Bonjour ${booking.firstName} ${booking.lastName},</p>
            
            <p>Votre rendez-vous a été confirmé avec succès !</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #0066FF;">📅 Détails de votre rendez-vous</h3>
              <p><strong>Date :</strong> ${formattedDate}</p>
              <p><strong>Heure :</strong> ${booking.time}</p>
              <p><strong>Durée :</strong> Environ 1 heure</p>
              <p><strong>Praticien :</strong> Dr. Marie Dubois</p>
              <p><strong>Adresse :</strong> 15 Rue de la Santé, 75014 Paris</p>
              ${booking.firstConsultation ? '<p><strong>Type :</strong> Première consultation</p>' : ''}
            </div>

            <h3>📍 Comment venir ?</h3>
            <p>
              <strong>Métro :</strong> Ligne 6 - Station Glacière<br>
              <strong>Parking :</strong> Parking public à proximité<br>
              <strong>Accès PMR :</strong> Disponible
            </p>

            <h3>📋 À apporter</h3>
            <ul>
              <li>Votre carte vitale et mutuelle</li>
              <li>Vos ordonnances en cours</li>
              <li>Vos derniers examens médicaux</li>
              <li>Une liste de vos questions</li>
            </ul>

            <h3>❌ Annulation</h3>
            <p>Vous pouvez annuler votre rendez-vous jusqu'à 24h avant en cliquant sur le bouton ci-dessous :</p>
            <a href="${cancellationUrl}" class="button">Annuler mon rendez-vous</a>
            <p style="font-size: 12px; color: #666;">
              Merci de prévenir au moins 24h à l'avance en cas d'empêchement.
            </p>

            <div class="footer">
              <p>Dr. Marie Dubois - Médecine Générale</p>
              <p>15 Rue de la Santé, 75014 Paris</p>
              <p>Tél : 01 23 45 67 89</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function doctorNotificationTemplate(booking: Booking) {
  const formattedDate = format(booking.date, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin`

  return {
    subject: `🔔 Nouveau RDV - ${booking.firstName} ${booking.lastName} - ${formattedDate}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0066FF; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .info { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 10px 20px; background: #0066FF; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 Nouvelle Réservation</h2>
          </div>
          <div class="content">
            <div class="info">
              <h3>Informations Patient</h3>
              <p><strong>Nom :</strong> ${booking.firstName} ${booking.lastName}</p>
              <p><strong>Email :</strong> ${booking.email}</p>
              <p><strong>Téléphone :</strong> ${booking.phone}</p>
            </div>

            <div class="info">
              <h3>Rendez-vous</h3>
              <p><strong>Date :</strong> ${formattedDate}</p>
              <p><strong>Durée :</strong> 1h</p>
              <p><strong>Type :</strong> ${booking.firstConsultation ? 'Première consultation' : 'Consultation de suivi'}</p>
            </div>

            ${booking.message ? `
              <div class="info">
                <h3>Message du patient</h3>
                <p>${booking.message}</p>
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px;">
              <a href="${adminUrl}" class="button">Voir le calendrier</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}

export function cancellationEmailTemplate(booking: Booking) {
  const formattedDate = format(booking.date, "EEEE d MMMM yyyy", { locale: fr })

  return {
    subject: `Annulation de votre rendez-vous du ${formattedDate}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #0066FF; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Rendez-vous Annulé</h1>
          </div>
          <div class="content">
            <p>Bonjour ${booking.firstName} ${booking.lastName},</p>
            
            <p>Votre rendez-vous du <strong>${formattedDate} à ${booking.time}</strong> a été annulé.</p>
            
            <p>Si vous souhaitez reprendre rendez-vous, cliquez sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" class="button">Prendre un nouveau rendez-vous</a>
            </div>

            <p>Pour toute question, n'hésitez pas à nous contacter au 01 23 45 67 89.</p>

            <p>Cordialement,<br>Dr. Marie Dubois</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }
}
```

### Étape 3.4 : Fonctions d'Envoi

```typescript
// lib/email/send.ts
import transporter from './mailer'
import {
  confirmationEmailTemplate,
  doctorNotificationTemplate,
  cancellationEmailTemplate,
} from './templates'

export async function sendConfirmationEmail(booking: any) {
  try {
    const template = confirmationEmailTemplate(booking)
    
    await transporter.sendMail({
      from: `"Dr. Marie Dubois" <${process.env.GMAIL_USER}>`,
      to: booking.email,
      subject: template.subject,
      html: template.html,
    })

    console.log(`✅ Email de confirmation envoyé à ${booking.email}`)
  } catch (error) {
    console.error('❌ Erreur envoi email confirmation:', error)
    throw error
  }
}

export async function sendEmailToDoctor(booking: any) {
  try {
    const template = doctorNotificationTemplate(booking)
    
    await transporter.sendMail({
      from: `"Système de Réservation" <${process.env.GMAIL_USER}>`,
      to: process.env.DOCTOR_EMAIL,
      subject: template.subject,
      html: template.html,
    })

    console.log(`✅ Email envoyé au médecin`)
  } catch (error) {
    console.error('❌ Erreur envoi email médecin:', error)
    throw error
  }
}

export async function sendCancellationEmail(booking: any) {
  try {
    const template = cancellationEmailTemplate(booking)
    
    await transporter.sendMail({
      from: `"Dr. Marie Dubois" <${process.env.GMAIL_USER}>`,
      to: booking.email,
      subject: template.subject,
      html: template.html,
    })

    console.log(`✅ Email d'annulation envoyé`)
  } catch (error) {
    console.error('❌ Erreur envoi email annulation:', error)
    throw error
  }
}
```

### Étape 3.5 : Intégrer dans l'API

Mettre à jour `app/api/bookings/route.ts` :

```typescript
// En haut du fichier
import { sendConfirmationEmail, sendEmailToDoctor } from '@/lib/email/send'

// Dans la fonction POST, après création de la réservation
Promise.all([
  sendEmailToDoctor(booking),
  sendConfirmationEmail(booking),
]).catch(error => {
  console.error('Erreur notifications:', error)
})
```

---

## 📅 Phase 4 : Intégration Google Calendar (3-4 heures)

### Étape 4.1 : Configuration Google Cloud Console

1. Aller sur https://console.cloud.google.com/
2. Créer un nouveau projet "Booking App"
3. Activer Google Calendar API
4. Créer des credentials OAuth 2.0
5. Télécharger le fichier JSON des credentials

### Étape 4.2 : Obtenir le Refresh Token

Créer un script temporaire pour obtenir le token :

```typescript
// scripts/get-google-token.ts
import { google } from 'googleapis'
import * as readline from 'readline'

const oauth2Client = new google.auth.OAuth2(
  'VOTRE_CLIENT_ID',
  'VOTRE_CLIENT_SECRET',
  'http://localhost:3000'
)

const SCOPES = ['https://www.googleapis.com/auth/calendar']

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
})

console.log('Allez sur cette URL:', authUrl)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('Entrez le code : ', async (code) => {
  const { tokens } = await oauth2Client.getToken(code)
  console.log('Refresh token:', tokens.refresh_token)
  rl.close()
})
```

Lancer :
```bash
npx ts-node scripts/get-google-token.ts
```

Copier le `refresh_token` dans `.env.local`

### Étape 4.3 : Service Google Calendar

```typescript
// lib/google-calendar/client.ts
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
})

export const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
```

```typescript
// lib/google-calendar/sync.ts
import { calendar } from './client'
import { format } from 'date-fns'
import { prisma } from '@/lib/prisma'

export async function addToGoogleCalendar(booking: any) {
  try {
    const event = {
      summary: `RDV - ${booking.firstName} ${booking.lastName}`,
      description: `
Patient: ${booking.firstName} ${booking.lastName}
Email: ${booking.email}
Téléphone: ${booking.phone}
Première consultation: ${booking.firstConsultation ? 'Oui' : 'Non'}
${booking.message ? `Message: ${booking.message}` : ''}

ID: ${booking.id}
      `.trim(),
      start: {
        dateTime: booking.date.toISOString(),
        timeZone: 'Europe/Paris',
      },
      end: {
        dateTime: new Date(booking.date.getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: 'Europe/Paris',
      },
      attendees: [
        { email: booking.email },
        { email: process.env.DOCTOR_EMAIL },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 60 },
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all',
    })

    // Mettre à jour la BDD avec l'ID Google Calendar
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        googleCalendarEventId: response.data.id,
        syncedWithGoogle: true,
      },
    })

    console.log(`✅ Événement Google Calendar créé: ${response.data.id}`)
    return response.data

  } catch (error) {
    console.error('❌ Erreur ajout Google Calendar:', error)
    throw error
  }
}

export async function removeFromGoogleCalendar(googleCalendarEventId: string) {
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: googleCalendarEventId,
    })

    console.log(`✅ Événement Google Calendar supprimé`)

  } catch (error) {
    console.error('❌ Erreur suppression Google Calendar:', error)
    throw error
  }
}
```

### Étape 4.4 : Intégrer dans l'API

Mettre à jour `app/api/bookings/route.ts` :

```typescript
import { addToGoogleCalendar } from '@/lib/google-calendar/sync'

// Dans POST
Promise.all([
  addToGoogleCalendar(booking),
  sendEmailToDoctor(booking),
  sendConfirmationEmail(booking),
]).catch(error => {
  console.error('Erreur notifications:', error)
})
```

---

## 💬 Phase 5 : Notifications Telegram (1-2 heures)

### Étape 5.1 : Créer un Bot Telegram

1. Ouvrir Telegram
2. Chercher `@BotFather`
3. Envoyer `/newbot`
4. Suivre les instructions
5. Récupérer le token : `123456:ABC-DEF...`

### Étape 5.2 : Obtenir le Chat ID

Créer un bot temporaire pour obtenir votre chat ID :

```typescript
// scripts/get-telegram-chat-id.ts
const BOT_TOKEN = 'VOTRE_BOT_TOKEN'

fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`)
  .then(r => r.json())
  .then(data => {
    console.log('Chat IDs:', data.result.map((r: any) => r.message.chat.id))
  })
```

Avant de lancer ce script, envoyez un message à votre bot sur Telegram, puis :
```bash
npx ts-node scripts/get-telegram-chat-id.ts
```

### Étape 5.3 : Service Telegram

```typescript
// lib/telegram/send.ts
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function sendTelegramNotification(booking: any) {
  try {
    const formattedDate = format(booking.date, "EEEE d MMMM yyyy", { locale: fr })
    
    const message = `
🔔 *Nouvelle Réservation*

👤 *Patient:* ${booking.firstName} ${booking.lastName}
📅 *Date:* ${formattedDate}
⏰ *Heure:* ${booking.time}
📧 *Email:* ${booking.email}
📱 *Téléphone:* ${booking.phone}
${booking.firstConsultation ? '✨ *Première consultation*' : '🔄 *Consultation de suivi*'}

${booking.message ? `💬 *Message:* ${booking.message}` : ''}

🔗 Voir dans [Google Calendar](https://calendar.google.com)
    `.trim()

    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.statusText}`)
    }

    console.log(`✅ Notification Telegram envoyée`)

  } catch (error) {
    console.error('❌ Erreur notification Telegram:', error)
    throw error
  }
}
```

### Étape 5.4 : Intégrer dans l'API

```typescript
import { sendTelegramNotification } from '@/lib/telegram/send'

Promise.all([
  addToGoogleCalendar(booking),
  sendEmailToDoctor(booking),
  sendTelegramNotification(booking),
  sendConfirmationEmail(booking),
]).catch(error => {
  console.error('Erreur notifications:', error)
})
```

---

## 👨‍⚕️ Phase 6 : Page Admin Simple (2-3 heures)

### Étape 6.1 : Protection par Mot de Passe Simple

```typescript
// lib/auth/simple-auth.ts
import bcrypt from 'bcryptjs'

const ADMIN_PASSWORD_HASH = bcrypt.hashSync(
  process.env.ADMIN_PASSWORD || 'admin123',
  10
)

export function verifyPassword(password: string): boolean {
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
}
```

### Étape 6.2 : Middleware de Protection

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Protéger toutes les routes /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin-auth')
    
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

### Étape 6.3 : Page de Login

```typescript
// app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        setError('Mot de passe incorrect')
      }
    } catch (error) {
      setError('Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Administration
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

### Étape 6.4 : API de Login

```typescript
// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/auth/simple-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (verifyPassword(password)) {
      const response = NextResponse.json({ success: true })
      
      // Définir un cookie d'authentification
      response.cookies.set('admin-auth', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 heures
      })

      return response
    }

    return NextResponse.json(
      { error: 'Mot de passe incorrect' },
      { status: 401 }
    )

  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

### Étape 6.5 : Dashboard Admin

```typescript
// app/admin/page.tsx
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export default async function AdminDashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Réservations du jour
  const todayBookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        notIn: ['CANCELLED'],
      },
    },
    orderBy: { time: 'asc' },
  })

  // Statistiques
  const stats = {
    today: todayBookings.length,
    pending: await prisma.booking.count({ where: { status: 'PENDING' } }),
    confirmed: await prisma.booking.count({ where: { status: 'CONFIRMED' } }),
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard Admin</h1>
          <a
            href="https://calendar.google.com"
            target="_blank"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Ouvrir Google Calendar
          </a>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Aujourd'hui</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.today}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">En attente</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm">Confirmés</h3>
            <p className="text-3xl font-bold text-green-600">{stats.confirmed}</p>
          </div>
        </div>

        {/* Liste des RDV du jour */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">
              Rendez-vous d'aujourd'hui ({format(today, 'd MMMM yyyy', { locale: fr })})
            </h2>
          </div>
          
          <div className="p-6">
            {todayBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun rendez-vous aujourd'hui
              </p>
            ) : (
              <div className="space-y-4">
                {todayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">
                          {booking.time} - {booking.firstName} {booking.lastName}
                        </h3>
                        <p className="text-gray-600">
                          📧 {booking.email} • 📱 {booking.phone}
                        </p>
                        {booking.firstConsultation && (
                          <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            Première consultation
                          </span>
                        )}
                        {booking.message && (
                          <p className="mt-2 text-sm text-gray-600">
                            💬 {booking.message}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Confirmer
                        </button>
                        <button
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🔄 Phase 7 : Synchronisation Bidirectionnelle (2 heures)

### Étape 7.1 : Cron Job de Sync

```typescript
// app/api/cron/sync-calendar/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { calendar } from '@/lib/google-calendar/client'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Sécurité : vérifier le token
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Début de la synchronisation...')

    // 1. Récupérer les événements de Google Calendar (30 jours)
    const now = new Date()
    const in30Days = new Date()
    in30Days.setDate(in30Days.getDate() + 30)

    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: in30Days.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    // 2. Synchroniser les modifications
    let updated = 0
    for (const event of events.data.items || []) {
      const booking = await prisma.booking.findFirst({
        where: { googleCalendarEventId: event.id }
      })

      if (booking) {
        // Vérifier si annulé dans Google Calendar
        if (event.status === 'cancelled' && booking.status !== 'CANCELLED') {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { status: 'CANCELLED' }
          })
          updated++
          console.log(`✅ Réservation ${booking.id} marquée comme annulée`)
        }
      }
    }

    console.log(`✅ Synchronisation terminée. ${updated} réservations mises à jour`)

    return NextResponse.json({
      success: true,
      updated,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('❌ Erreur synchronisation:', error)
    return NextResponse.json(
      { error: 'Erreur de synchronisation' },
      { status: 500 }
    )
  }
}
```

### Étape 7.2 : Configurer le Cron Job

**Option A : Vercel Cron (si déployé sur Vercel)**

Créer `vercel.json` :
```json
{
  "crons": [{
    "path": "/api/cron/sync-calendar",
    "schedule": "*/5 * * * *"
  }]
}
```

**Option B : Service externe (cron-job.org)**

1. Aller sur https://cron-job.org
2. Créer un compte
3. Créer un nouveau cron job :
   - URL : `https://votreapp.com/api/cron/sync-calendar`
   - Schedule : Toutes les 5 minutes
   - Headers : `Authorization: Bearer votre-secret`

---

## 🧪 Phase 8 : Tests & Finalisation (2-3 heures)

### Étape 8.1 : Tester le Workflow Complet

```bash
# 1. Démarrer l'application
npm run dev

# 2. Créer une réservation via le site
# 3. Vérifier :
#    - Email reçu par le patient
#    - Email reçu par le médecin
#    - Notification Telegram reçue
#    - Événement dans Google Calendar
#    - Réservation en BDD (Prisma Studio)
```

### Étape 8.2 : Tester l'Annulation

```bash
# 1. Récupérer le cancellationToken de l'email
# 2. Tester l'annulation
curl -X POST http://localhost:3000/api/bookings/cancel \
  -H "Content-Type: application/json" \
  -d '{"cancellationToken": "votre-token"}'

# 3. Vérifier :
#    - Email d'annulation reçu
#    - Statut mis à jour en BDD
#    - Événement annulé dans Google Calendar
```

### Étape 8.3 : Mettre à Jour le Frontend

```typescript
// app/page.tsx
// Dans handleSubmit, remplacer la simulation par un vrai appel API

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) {
    setIsValidating(true)
    return
  }
  
  setIsSubmitting(true)
  
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: selectedCountry,
        date: selectedDate?.toISOString(),
        time: selectedTime,
        period: selectedPeriod,
        firstConsultation: formData.firstConsultation,
        message: formData.message,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      console.log('Réservation créée:', data)
      setCurrentStep(5) // Succès
    } else {
      throw new Error('Erreur lors de la création')
    }
  } catch (error) {
    console.error('Erreur:', error)
    setCurrentStep(6) // Erreur
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## 🚀 Phase 9 : Déploiement (1-2 heures)

### Étape 9.1 : Préparer le Déploiement

```bash
# Vérifier que tout fonctionne
npm run build
npm run start

# Tester en production locale
```

### Étape 9.2 : Déployer sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel

# Configurer les variables d'environnement sur Vercel Dashboard
# Settings > Environment Variables
```

### Étape 9.3 : Configurer la Base de Données Production

```bash
# Option A : Vercel Postgres
# Créer une BDD depuis Vercel Dashboard
# Copier la DATABASE_URL

# Option B : Supabase
# Créer un projet sur supabase.com
# Copier la DATABASE_URL

# Lancer les migrations
npx prisma migrate deploy
```

---

## ✅ Checklist Finale

### Backend
- [ ] PostgreSQL configuré
- [ ] Prisma migrations appliquées
- [ ] API Routes fonctionnelles
- [ ] Validation Zod active
- [ ] Gestion des erreurs

### Intégrations
- [ ] Google Calendar sync OK
- [ ] Emails Gmail envoyés
- [ ] Notifications Telegram OK
- [ ] Cron job configuré

### Sécurité
- [ ] Variables d'environnement sécurisées
- [ ] Page admin protégée
- [ ] Validation côté serveur
- [ ] Rate limiting (optionnel)

### Tests
- [ ] Création réservation OK
- [ ] Annulation OK
- [ ] Emails reçus
- [ ] Google Calendar sync
- [ ] Page admin accessible

---

## 📚 Ressources Utiles

- **Prisma :** https://www.prisma.io/docs
- **Google Calendar API :** https://developers.google.com/calendar
- **Nodemailer :** https://nodemailer.com
- **Telegram Bot API :** https://core.telegram.org/bots/api
- **Vercel :** https://vercel.com/docs

---

## 🆘 Dépannage

### Erreur : Cannot find module 'prisma'
```bash
npm install prisma @prisma/client
npx prisma generate
```

### Erreur : Prisma Client not found
```bash
npx prisma generate
# Redémarrer le serveur Next.js
```

### Emails non reçus
- Vérifier GMAIL_APP_PASSWORD
- Vérifier que la validation en 2 étapes est active
- Checker les spams

### Google Calendar 401 Unauthorized
- Régénérer le refresh token
- Vérifier les scopes OAuth

---

## 🎉 Félicitations !

Vous avez maintenant un backend complet et fonctionnel ! 🚀

**Prochaines étapes :**
- Tester en profondeur
- Ajouter des tests automatisés
- Optimiser les performances
- Améliorer la page admin

---

*Besoin d'aide ? Consultez ARCHITECTURE_SOLUTIONS.md*

