# 🚀 Guide de Déploiement - Application de Réservation Médicale

## ⚠️ **SÉCURITÉ - IMPORTANT**

**NE JAMAIS COMMITER LES CLÉS SENSIBLES !**

Les clés suivantes doivent être configurées dans les variables d'environnement du serveur de production :

## 🔑 **Variables d'environnement requises**

### **1. Configuration Email (Gmail)**
```env
SMTP_USER="votre-email@gmail.com"
SMTP_PASSWORD="votre-mot-de-passe-application"
SMTP_FROM_NAME="Cabinet Médical"
```

### **2. Google Calendar API**
```env
GOOGLE_CALENDAR_CALENDAR_ID="votre-calendar-id@group.calendar.google.com"
GOOGLE_SERVICE_ACCOUNT_EMAIL="votre-service@votre-projet.iam.gserviceaccount.com"
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nvotre-cle-privee\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_PROJECT_ID="votre-projet-id"
```

### **3. Application**
```env
NEXTAUTH_URL="https://votre-domaine.com"
DATABASE_URL="file:./dev.db"
```

## 🌐 **Options de déploiement**

### **Option 1 : Vercel (Recommandé)**
1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement dans Vercel
3. Déployer automatiquement

### **Option 2 : Netlify**
1. Connecter le repository GitHub à Netlify
2. Configurer les variables d'environnement
3. Déployer

### **Option 3 : Serveur VPS**
1. Cloner le repository
2. Installer les dépendances : `npm install`
3. Configurer les variables d'environnement
4. Démarrer : `npm run build && npm start`

## 📋 **Checklist de déploiement**

### **Avant le déploiement**
- [ ] ✅ Clés sensibles supprimées du README
- [ ] ✅ Variables d'environnement configurées
- [ ] ✅ Tests passent : `npm run test:run`
- [ ] ✅ Build fonctionne : `npm run build`
- [ ] ✅ Base de données configurée

### **Après le déploiement**
- [ ] ✅ Site accessible
- [ ] ✅ Formulaire de réservation fonctionne
- [ ] ✅ Emails envoyés correctement
- [ ] ✅ Google Calendar synchronisé
- [ ] ✅ Système de rappel actif

## 🔧 **Configuration Google Calendar**

### **1. Créer un Service Account**
1. Aller sur [Google Cloud Console](https://console.cloud.google.com)
2. Créer un projet : `booking-app-production`
3. Activer l'API Google Calendar
4. Créer un Service Account
5. Télécharger la clé JSON

### **2. Partager le calendrier**
1. Aller sur [Google Calendar](https://calendar.google.com)
2. Créer un nouveau calendrier : "Réservations Cabinet"
3. Partager avec le Service Account : `votre-service@votre-projet.iam.gserviceaccount.com`
4. Permission : "Make changes to events"

## 📧 **Configuration Gmail**

### **1. Activer l'authentification à 2 facteurs**
1. Aller sur [myaccount.google.com](https://myaccount.google.com)
2. Sécurité → Authentification à 2 facteurs → Activer

### **2. Créer un mot de passe d'application**
1. Sécurité → Mots de passe des applications
2. Sélectionner "Gmail"
3. Générer un mot de passe (16 caractères)
4. Utiliser ce mot de passe dans `SMTP_PASSWORD`

## 🚀 **Commandes de déploiement**

```bash
# 1. Vérifier que tout fonctionne
npm run test:run
npm run build

# 2. Commiter les changements (sans clés sensibles)
git add .
git commit -m "feat: prepare for production deployment"
git push origin main

# 3. Déployer sur Vercel
vercel --prod

# 4. Configurer les variables d'environnement
# (via l'interface Vercel ou CLI)
```

## 📊 **Monitoring post-déploiement**

### **Vérifications essentielles**
1. **Site accessible** : https://votre-domaine.com
2. **API fonctionnelle** : https://votre-domaine.com/api/availability/dates
3. **Emails envoyés** : Tester une réservation
4. **Google Calendar** : Vérifier la synchronisation
5. **Rappels automatiques** : Configurer le cron job

### **Logs à surveiller**
- Erreurs d'API
- Échecs d'envoi d'emails
- Problèmes de synchronisation Google Calendar
- Erreurs de base de données

## 🆘 **Dépannage**

### **Problèmes courants**
1. **Site ne se charge pas** : Vérifier les variables d'environnement
2. **Emails non envoyés** : Vérifier SMTP_USER et SMTP_PASSWORD
3. **Google Calendar non synchronisé** : Vérifier les permissions du Service Account
4. **Erreurs de build** : Vérifier les dépendances et la configuration

### **Commandes de diagnostic**
```bash
# Vérifier les variables d'environnement
vercel env ls

# Voir les logs en temps réel
vercel logs

# Tester localement
npm run dev
```

## ✅ **Système prêt pour la production !**

Votre application de réservation médicale est maintenant sécurisée et prête pour le déploiement en production.

**Prochaines étapes :**
1. Configurer les variables d'environnement
2. Déployer sur Vercel/Netlify
3. Tester toutes les fonctionnalités
4. Configurer le monitoring

---

**Développé avec ❤️ pour une expérience de réservation médicale moderne et sécurisée.**
