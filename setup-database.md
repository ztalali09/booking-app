# 🗄️ Configuration de la Base de Données

## Option 1 : PlanetScale (MySQL) - RECOMMANDÉE

### 1. Créer un compte PlanetScale
1. Allez sur https://planetscale.com
2. Créez un compte gratuit
3. Créez une nouvelle base de données "booking-app"

### 2. Obtenir la connection string
1. Dans votre dashboard PlanetScale
2. Cliquez sur "Connect" sur votre base de données
3. Sélectionnez "Prisma" 
4. Copiez la connection string

### 3. Configurer sur Vercel
1. Allez sur https://vercel.com/hahababamama77-gmailcoms-projects/booking-app
2. Settings → Environment Variables
3. Ajoutez : `DATABASE_URL` = votre connection string PlanetScale

### 4. Déployer la base de données
```bash
npx prisma db push
```

## Option 2 : Supabase (PostgreSQL) - ALTERNATIVE

### 1. Créer un projet Supabase
1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Notez l'URL et la clé API

### 2. Modifier le schéma Prisma
Changez `provider = "mysql"` en `provider = "postgresql"`

### 3. Configurer sur Vercel
Ajoutez la variable `DATABASE_URL` avec l'URL Supabase

## Option 3 : Vercel Postgres - SIMPLE

### 1. Ajouter Vercel Postgres
1. Dans votre dashboard Vercel
2. Storage → Create Database → Postgres
3. Connectez à votre projet

### 2. Configurer automatiquement
Vercel ajoutera automatiquement `DATABASE_URL`

## 🚀 Après configuration

1. Redéployez : `npx vercel --prod`
2. Testez votre application
3. Les réservations seront maintenant persistantes !

## 📝 Variables d'environnement nécessaires

```
DATABASE_URL=mysql://username:password@host:port/database
# ou
DATABASE_URL=postgresql://username:password@host:port/database
```
