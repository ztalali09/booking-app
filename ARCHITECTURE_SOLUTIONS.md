# 🏗️ Architecture & Solutions de Gestion des Réservations

## 🎯 Votre Question

Comment gérer les réservations pour un médecin sans créer un dashboard admin complexe ?
- Utiliser Google Calendar comme interface de gestion
- Notifications par Gmail et Telegram
- Simplicité avant tout

---

## 💡 Solution Recommandée : Architecture Hybride Simple

### Concept
**Pas besoin de dashboard admin complexe !** On peut créer un système simple qui :
1. ✅ Enregistre les réservations dans une base de données (pour la fiabilité)
2. ✅ Synchronise automatiquement avec Google Calendar (pour la visualisation)
3. ✅ Envoie des notifications Gmail + Telegram (pour les alertes)
4. ✅ Le médecin gère tout depuis Google Calendar

---

## 🎨 Architecture Simplifiée

```
┌─────────────────┐
│   PATIENT       │
│  (Site Web)     │
└────────┬────────┘
         │ 1. Réserve un RDV
         ▼
┌─────────────────────────────────┐
│   BASE DE DONNÉES PostgreSQL    │ ◄── Source unique de vérité
│   (Stocke toutes les réservations) │
└────────┬────────────────────────┘
         │
         │ 2. Déclenche automatiquement
         │
    ┌────┴─────┬──────────────┬──────────────┐
    │          │              │              │
    ▼          ▼              ▼              ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Google  │ │  Email   │ │ Telegram │ │  SMS     │
│Calendar │ │ (Gmail)  │ │   Bot    │ │(optionnel)│
└─────────┘ └──────────┘ └──────────┘ └──────────┘
     │
     │ 3. Le médecin consulte et gère
     ▼
┌─────────────────┐
│  DR. DUBOIS     │
│ (Google Cal)    │
│  📱 Mobile/PC   │
└─────────────────┘
```

---

## ✅ Solution 1 : Simple & Efficace (RECOMMANDÉE)

### Fonctionnement

#### 1️⃣ **Patient réserve sur le site**
```typescript
// app/api/bookings/route.ts
export async function POST(request: Request) {
  const data = await request.json()
  
  // 1. Sauvegarder dans la BDD
  const booking = await prisma.booking.create({ data })
  
  // 2. Ajouter à Google Calendar
  await addToGoogleCalendar(booking)
  
  // 3. Envoyer email au médecin
  await sendEmailToDoctor(booking)
  
  // 4. Envoyer notification Telegram
  await sendTelegramNotification(booking)
  
  // 5. Envoyer email de confirmation au patient
  await sendConfirmationEmail(booking)
  
  return Response.json({ success: true })
}
```

#### 2️⃣ **Médecin reçoit les notifications**
- 📧 **Email Gmail** : "Nouveau RDV : Jean Dupont le 25/10 à 10h"
- 📱 **Telegram** : Message instantané avec détails
- 📅 **Google Calendar** : Événement créé automatiquement

#### 3️⃣ **Médecin gère depuis Google Calendar**
- Consulter l'agenda sur mobile/PC
- Modifier/déplacer les RDV
- Ajouter des notes
- **Synchronisation bidirectionnelle** avec votre BDD

---

## 🔧 Implémentation Détaillée

### A. Configuration Google Calendar API

```bash
# 1. Aller sur Google Cloud Console
# https://console.cloud.google.com/

# 2. Créer un projet "Booking App"

# 3. Activer Google Calendar API

# 4. Créer des credentials (OAuth 2.0)

# 5. Ajouter dans .env.local
GOOGLE_CALENDAR_CLIENT_ID="votre-client-id"
GOOGLE_CALENDAR_CLIENT_SECRET="votre-secret"
GOOGLE_CALENDAR_REFRESH_TOKEN="votre-refresh-token"
GOOGLE_CALENDAR_CALENDAR_ID="primary" # ou ID spécifique
```

### B. Code pour Google Calendar

```typescript
// lib/google-calendar.ts
import { google } from 'googleapis'

// Configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
  'http://localhost:3000/api/auth/google/callback'
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
})

const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

// Ajouter un événement
export async function addToGoogleCalendar(booking: Booking) {
  const event = {
    summary: `RDV - ${booking.firstName} ${booking.lastName}`,
    description: `
      Patient: ${booking.firstName} ${booking.lastName}
      Email: ${booking.email}
      Téléphone: ${booking.phone}
      Première consultation: ${booking.firstConsultation ? 'Oui' : 'Non'}
      Message: ${booking.message || 'Aucun'}
    `,
    start: {
      dateTime: booking.date.toISOString(),
      timeZone: 'Europe/Paris',
    },
    end: {
      dateTime: new Date(booking.date.getTime() + 60 * 60 * 1000).toISOString(), // +1h
      timeZone: 'Europe/Paris',
    },
    attendees: [
      { email: booking.email },
      { email: process.env.DOCTOR_EMAIL }, // Email du médecin
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 24h avant
        { method: 'popup', minutes: 60 }, // 1h avant
      ],
    },
  }

  const response = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
    sendUpdates: 'all', // Envoie des emails aux participants
  })

  return response.data
}

// Synchronisation bidirectionnelle
export async function syncFromGoogleCalendar() {
  // Récupérer les événements modifiés sur Google Calendar
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime',
  })

  // Mettre à jour la BDD
  for (const event of events.data.items || []) {
    await prisma.booking.updateMany({
      where: { googleCalendarEventId: event.id },
      data: {
        // Synchroniser les changements
        date: new Date(event.start?.dateTime || ''),
        status: event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
      },
    })
  }
}
```

### C. Notifications Telegram

```bash
# 1. Créer un bot Telegram
# Parler à @BotFather sur Telegram
# /newbot
# Récupérer le token

# 2. Ajouter dans .env.local
TELEGRAM_BOT_TOKEN="votre-bot-token"
TELEGRAM_CHAT_ID="votre-chat-id" # ID du médecin
```

```typescript
// lib/telegram.ts
export async function sendTelegramNotification(booking: Booking) {
  const message = `
🔔 *Nouvelle Réservation*

👤 *Patient:* ${booking.firstName} ${booking.lastName}
📅 *Date:* ${format(booking.date, 'dd/MM/yyyy')}
⏰ *Heure:* ${booking.time}
📧 *Email:* ${booking.email}
📱 *Téléphone:* ${booking.phone}
${booking.firstConsultation ? '✨ *Première consultation*' : ''}

${booking.message ? `💬 *Message:* ${booking.message}` : ''}
  `

  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    }),
  })
}
```

### D. Email via Gmail

```typescript
// lib/email-gmail.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Mot de passe d'application
  },
})

export async function sendEmailToDoctor(booking: Booking) {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: process.env.DOCTOR_EMAIL,
    subject: `🔔 Nouveau RDV - ${booking.firstName} ${booking.lastName}`,
    html: `
      <h2>Nouvelle réservation</h2>
      <p><strong>Patient:</strong> ${booking.firstName} ${booking.lastName}</p>
      <p><strong>Date:</strong> ${format(booking.date, 'dd/MM/yyyy à HH:mm')}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Téléphone:</strong> ${booking.phone}</p>
      ${booking.message ? `<p><strong>Message:</strong> ${booking.message}</p>` : ''}
      
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings/${booking.id}">
        Voir les détails
      </a></p>
    `,
  })
}
```

---

## 🎯 Workflows Complets

### Workflow 1 : Nouvelle Réservation

```
1. Patient remplit le formulaire
   ↓
2. API crée la réservation en BDD
   ↓
3. [PARALLÈLE]
   ├─→ Ajout automatique à Google Calendar
   ├─→ Email envoyé au médecin (Gmail)
   ├─→ Notification Telegram au médecin
   └─→ Email de confirmation au patient
   ↓
4. Médecin reçoit les notifications
   ↓
5. Médecin consulte son Google Calendar
```

### Workflow 2 : Modification par le Médecin

```
1. Médecin modifie RDV dans Google Calendar
   ↓
2. Webhook Google Calendar notifie votre API
   (ou cron job toutes les 5 min)
   ↓
3. API met à jour la BDD
   ↓
4. Email envoyé au patient pour confirmer le changement
```

### Workflow 3 : Annulation

```
1. Médecin annule dans Google Calendar
   OU
   Patient clique sur lien d'annulation dans l'email
   ↓
2. Statut mis à jour en BDD
   ↓
3. Notification envoyée aux deux parties
```

---

## 📱 Interface Minimale pour le Médecin

### Option A : Tout dans Google Calendar (SIMPLE)
- ✅ Pas de dashboard à créer
- ✅ Le médecin utilise l'app qu'il connaît déjà
- ✅ Disponible sur tous les appareils
- ⚠️ Moins de contrôle

### Option B : Dashboard Ultra-Simple (RECOMMANDÉ)
Créer une page admin basique avec juste l'essentiel :

```typescript
// app/admin/page.tsx
export default function AdminDashboard() {
  return (
    <div>
      <h1>Réservations du jour</h1>
      
      {/* Liste simple des RDV */}
      <div>
        {bookings.map(booking => (
          <div key={booking.id}>
            <h3>{booking.time} - {booking.firstName} {booking.lastName}</h3>
            <p>{booking.phone}</p>
            <button>Confirmer</button>
            <button>Annuler</button>
          </div>
        ))}
      </div>
      
      {/* Lien vers Google Calendar */}
      <a href="https://calendar.google.com">
        Voir dans Google Calendar
      </a>
    </div>
  )
}
```

---

## 🔄 Synchronisation Bidirectionnelle

### Cron Job pour Sync (Recommandé)

```typescript
// app/api/cron/sync-calendar/route.ts
export async function GET() {
  // Sécuriser avec un token
  if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Récupérer les modifications de Google Calendar
  const updatedEvents = await fetchGoogleCalendarUpdates()
  
  // 2. Mettre à jour la BDD
  for (const event of updatedEvents) {
    await syncEventToDatabase(event)
  }
  
  // 3. Récupérer les modifications de la BDD
  const updatedBookings = await prisma.booking.findMany({
    where: { syncedWithGoogle: false }
  })
  
  // 4. Mettre à jour Google Calendar
  for (const booking of updatedBookings) {
    await updateGoogleCalendarEvent(booking)
  }
  
  return Response.json({ success: true })
}
```

Configurer sur Vercel Cron ou utiliser un service externe comme **cron-job.org** :
```bash
# Toutes les 5 minutes
*/5 * * * * curl -X GET https://votreapp.com/api/cron/sync-calendar \
  -H "Authorization: Bearer votre-secret"
```

---

## 📊 Comparaison des Approches

| Critère | Sans Dashboard | Dashboard Simple | Dashboard Complet |
|---------|----------------|------------------|-------------------|
| **Complexité** | 🟢 Faible | 🟡 Moyenne | 🔴 Élevée |
| **Temps de dev** | 1 semaine | 2 semaines | 4-6 semaines |
| **Coût** | Gratuit | Gratuit | Hébergement BDD |
| **Flexibilité** | 🟡 Limitée | 🟢 Bonne | 🟢 Totale |
| **UX Médecin** | 🟢 Familier | 🟢 Simple | 🟡 Apprentissage |
| **Maintenance** | 🟢 Minimal | 🟢 Faible | 🔴 Élevée |

---

## 🎯 Ma Recommandation Finale

### **Solution Hybride Simple** ✨

```
┌─────────────────────────────────────────┐
│  CE QU'IL FAUT ABSOLUMENT               │
├─────────────────────────────────────────┤
│ ✅ Base de données PostgreSQL           │
│    (pour stocker les réservations)      │
│                                          │
│ ✅ API Routes Next.js                   │
│    (pour gérer les réservations)        │
│                                          │
│ ✅ Intégration Google Calendar          │
│    (le médecin consulte ici)            │
│                                          │
│ ✅ Notifications Email (Gmail)          │
│    (le médecin est alerté)              │
│                                          │
│ ✅ Notifications Telegram               │
│    (alertes instantanées)               │
│                                          │
│ ✅ Page admin ultra-simple              │
│    (juste pour voir la liste)           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  CE QU'ON PEUT FAIRE PLUS TARD          │
├─────────────────────────────────────────┤
│ 🔵 Dashboard admin complet              │
│ 🔵 Statistiques                         │
│ 🔵 Gestion des disponibilités           │
│ 🔵 Multi-praticiens                     │
└─────────────────────────────────────────┘
```

---

## 📝 Variables d'Environnement Nécessaires

```env
# .env.local

# Base de données
DATABASE_URL="postgresql://..."

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=""
GOOGLE_CALENDAR_CLIENT_SECRET=""
GOOGLE_CALENDAR_REFRESH_TOKEN=""
DOCTOR_EMAIL="dr.dubois@gmail.com"

# Gmail (pour notifications)
GMAIL_USER="votre-email@gmail.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"

# Telegram
TELEGRAM_BOT_TOKEN="123456:ABC-DEF..."
TELEGRAM_CHAT_ID="123456789"

# Cron Job (sécurité)
CRON_SECRET="votre-secret-random"
```

---

## 🚀 Plan d'Implémentation (2 semaines)

### Semaine 1 : Backend & Sync
- [ ] Jour 1-2 : Setup BDD + API Routes
- [ ] Jour 3 : Intégration Google Calendar
- [ ] Jour 4 : Notifications Email
- [ ] Jour 5 : Notifications Telegram

### Semaine 2 : Sync & Polish
- [ ] Jour 1-2 : Sync bidirectionnelle
- [ ] Jour 3 : Page admin simple
- [ ] Jour 4 : Tests
- [ ] Jour 5 : Déploiement

---

## ❓ Questions Fréquentes

### Q1 : Le médecin doit-il avoir des compétences techniques ?
**R :** Non ! Il utilise juste Google Calendar qu'il connaît déjà. Les notifications arrivent automatiquement par email et Telegram.

### Q2 : Que se passe-t-il si Google Calendar est en panne ?
**R :** Les données sont dans votre BDD. Vous pouvez toujours consulter via la page admin simple.

### Q3 : Peut-on gérer plusieurs médecins ?
**R :** Oui, il suffit de créer un calendrier Google par médecin et d'ajuster la logique.

### Q4 : Combien ça coûte ?
**R :** 
- Google Calendar API : Gratuit (jusqu'à 1M requêtes/jour)
- Telegram Bot : Gratuit
- Gmail : Gratuit
- BDD PostgreSQL : ~5-10€/mois (Vercel Postgres ou Supabase)
- Hébergement Next.js : Gratuit (Vercel)

---

## ✅ Conclusion

**Vous n'avez PAS besoin d'un dashboard admin complexe !**

La meilleure solution est :
1. **Base de données** pour stocker de manière fiable
2. **Google Calendar** comme interface pour le médecin
3. **Notifications** par email et Telegram
4. **Page admin minimaliste** juste pour backup

C'est **simple, efficace, et le médecin utilise des outils qu'il connaît déjà** ! 🎯

---

*Besoin d'aide pour l'implémentation ? Consultez les exemples de code ci-dessus !*

