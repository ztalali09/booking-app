# 🏥 Application de Réservation Médicale

Une application de réservation de rendez-vous médicaux moderne avec intégration Google Calendar et notifications email.

## 📋 **Fonctionnalités**

### ✅ **Fonctionnalités principales**
- **Interface responsive** : Mobile et desktop
- **Système de réservation** : Sélection de date, période et créneau
- **Validation en temps réel** : Formulaire avec validation côté client
- **Règle des 15 minutes** : Impossible de réserver moins de 15 minutes à l'avance
- **Gestion des créneaux** : Matin (9h-12h) et après-midi (14h-17h)
- **Interface moderne** : Design avec Tailwind CSS

### ✅ **Intégrations avancées**
- **Google Calendar** : Synchronisation bidirectionnelle des créneaux
- **Notifications email** : Confirmations et rappels automatiques
- **Notifications médecin** : Emails détaillés avec motif de consultation et message patient
- **Base de données** : SQLite avec Prisma ORM
- **API REST** : Endpoints pour la gestion des réservations

## 🛠️ **Technologies utilisées**

- **Frontend** : Next.js 15, React, TypeScript
- **Styling** : Tailwind CSS
- **Base de données** : SQLite + Prisma ORM
- **Email** : Nodemailer + Gmail
- **Calendar** : Google Calendar API
- **Icons** : Lucide React

## 🔑 **Configuration des API**

### **1. Gmail Configuration (Emails)**

```env
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="votre-mot-de-passe-app"
```

**Comment obtenir le mot de passe d'application :**
1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Sécurité → Authentification à 2 facteurs → Activer
3. Sécurité → Mots de passe des applications
4. Sélectionnez "Gmail" → Générer
5. Copiez le mot de passe généré (16 caractères)

### **2. Google Calendar API**

```env
# Calendar ID
GOOGLE_CALENDAR_CALENDAR_ID="votre-calendar-id@group.calendar.google.com"

# Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL="votre-service@votre-projet.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nvotre-cle-privee-ici\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID="votre-projet-id"

# Google API Key (optionnel)
GOOGLE_API_KEY="votre-api-key"
```

### **3. Base de données**

```env
DATABASE_URL="file:./dev.db"
```

### **4. Application**

```env
NEXTAUTH_URL="https://votre-domaine.com"
SMTP_FROM_NAME="Cabinet Médical"
```

## 📁 **Structure du projet**

```
booking-app/
├── app/
│   ├── api/
│   │   ├── availability/
│   │   │   ├── dates/route.ts
│   │   │   ├── periods/route.ts
│   │   │   └── slots/route.ts
│   │   ├── bookings/route.ts
│   │   └── calendar/
│   │       └── blocked-slots/route.ts
│   └── page.tsx
├── lib/
│   ├── prisma.ts
│   └── services/
│       ├── email.ts
│       └── google-calendar.ts
├── components/
│   └── ui/
├── prisma/
│   └── schema.prisma
├── .env.local
└── README.md
```

## 🚀 **Installation et démarrage**

### **1. Installation des dépendances**

```bash
npm install
```

### **2. Configuration de l'environnement**

Créez un fichier `.env.local` avec les variables d'environnement ci-dessus.

### **3. Configuration de la base de données**

```bash
npx prisma generate
npx prisma db push
```

### **4. Démarrage de l'application**

```bash
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## 📧 **Configuration Google Calendar**

### **1. Créer un projet Google Cloud**

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com)
2. Créez un nouveau projet : `booking-app-service`

### **2. Activer l'API Google Calendar**

1. **APIs & Services** → **Library**
2. Recherchez "Google Calendar API"
3. Cliquez **"Enable"**

### **3. Créer un Service Account**

1. **IAM & Admin** → **Service Accounts**
2. **Create Service Account**
3. **Name** : `booking-app-service`
4. **Role** : `Editor` ou `Calendar Editor`
5. **Keys** → **Add Key** → **Create new key** → **JSON**

### **4. Partager le calendrier**

1. Allez sur [calendar.google.com](https://calendar.google.com)
2. Trouvez votre calendrier
3. **Settings** → **Share with specific people**
4. Ajoutez : `booking-app-service@booking-app-service.iam.gserviceaccount.com`
5. **Permission** : `Make changes to events`

## 📱 **Fonctionnalités de l'interface**

### **Version Mobile**
- **Design responsive** avec reflets et ombres
- **Informations du médecin** avec bouton "Afficher plus"
- **Calendrier interactif** pour la sélection de date
- **Sélection de période** (matin/après-midi)
- **Créneaux horaires** avec validation des 15 minutes
- **Formulaire de réservation** avec validation en temps réel

### **Version Desktop**
- **Layout en deux colonnes** : infos médecin + formulaire
- **Workflow des étapes** visuel
- **Même fonctionnalités** que la version mobile

## 🔧 **APIs disponibles**

### **Disponibilité**
- `GET /api/availability/dates` - Dates disponibles
- `GET /api/availability/periods` - Périodes disponibles
- `GET /api/availability/slots` - Créneaux horaires

### **Réservations**
- `POST /api/bookings` - Créer une réservation
- `GET /api/bookings` - Lister les réservations

### **Google Calendar**
- `GET /api/calendar/blocked-slots` - Créneaux bloqués

## 🎯 **Règles métier**

### **Règle des 15 minutes**
- Impossible de réserver moins de 15 minutes à l'avance
- Validation côté client et serveur
- Message informatif affiché à l'utilisateur

### **Créneaux disponibles**
- **Matin** : 9h00 - 12h00 (créneaux de 30 minutes)
- **Après-midi** : 14h00 - 17h00 (créneaux de 30 minutes)
- **Synchronisation** avec Google Calendar

### **Validation du formulaire**
- **Prénom** : minimum 2 caractères
- **Nom** : minimum 2 caractères
- **Email** : format valide
- **Téléphone** : minimum 8 chiffres
- **Motif** : minimum 10 caractères
- **Première consultation** : obligatoire

## 📧 **Système d'emails**

### **Templates disponibles**
- **Confirmation de réservation** : Envoyé au patient
- **Notification médecin** : Nouvelle réservation avec détails complets
- **Email d'annulation** : Confirmation d'annulation

### **Notifications médecin améliorées** ✨
- **Motif de consultation** : Section dédiée mise en évidence
- **Message patient** : Formatage spécial avec style italique
- **Design coloré** : Sections organisées par couleur
- **Indicateurs visuels** : ✅/❌ pour première consultation
- **Informations complètes** : Toutes les données en un coup d'œil

### **Configuration Gmail**
- **SMTP** : smtp.gmail.com:587
- **Authentification** : Mot de passe d'application
- **Templates HTML** : Design professionnel et responsive

## 🐛 **Dépannage**

### **Erreurs courantes**

1. **Erreur de syntaxe JSX** : Vérifiez la structure des composants
2. **Erreur Google Calendar** : Vérifiez les permissions du service account
3. **Erreur email** : Vérifiez le mot de passe d'application Gmail
4. **Erreur base de données** : Vérifiez la configuration Prisma

### **Logs utiles**

```bash
# Vérifier les logs de l'application
npm run dev

# Vérifier la base de données
npx prisma studio

# Tester les APIs
curl http://localhost:3000/api/availability/dates

# Tester les notifications email
node test/booking-notification-test.js

# Prévisualiser le design des emails
open test/email-preview.html
```

## 📝 **Notes de développement**

### **Améliorations possibles**
- [ ] Système d'annulation avec lien unique
- [ ] Rappels automatiques par email
- [ ] Gestion des conflits de réservation
- [ ] Interface d'administration
- [ ] Statistiques de réservation
- [ ] Intégration avec d'autres calendriers

### **Sécurité**
- Validation côté serveur pour toutes les entrées
- Protection CSRF
- Limitation du taux de requêtes
- Chiffrement des données sensibles

## 📞 **Support**

Pour toute question ou problème :
1. Vérifiez les logs de l'application
2. Consultez la documentation des APIs
3. Vérifiez la configuration des variables d'environnement

---

**Développé avec ❤️ pour une expérience de réservation médicale moderne et efficace.**