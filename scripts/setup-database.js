#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🗄️  Configuration de la base de données pour le déploiement');
console.log('');

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('Choisissez votre base de données :');
  console.log('1. PlanetScale (MySQL) - RECOMMANDÉ');
  console.log('2. Supabase (PostgreSQL)');
  console.log('3. Vercel Postgres');
  console.log('');

  const choice = await question('Votre choix (1-3): ');

  switch (choice) {
    case '1':
      await setupPlanetScale();
      break;
    case '2':
      await setupSupabase();
      break;
    case '3':
      await setupVercelPostgres();
      break;
    default:
      console.log('❌ Choix invalide');
      process.exit(1);
  }

  rl.close();
}

async function setupPlanetScale() {
  console.log('');
  console.log('🌍 Configuration PlanetScale :');
  console.log('');
  console.log('1. Allez sur https://planetscale.com');
  console.log('2. Créez un compte gratuit');
  console.log('3. Créez une nouvelle base de données "booking-app"');
  console.log('4. Cliquez sur "Connect" → "Prisma"');
  console.log('5. Copiez la connection string');
  console.log('');
  
  const connectionString = await question('Collez votre connection string PlanetScale: ');
  
  if (!connectionString.includes('mysql://')) {
    console.log('❌ Connection string invalide');
    process.exit(1);
  }

  console.log('');
  console.log('📝 Ajoutez cette variable d\'environnement sur Vercel :');
  console.log(`DATABASE_URL=${connectionString}`);
  console.log('');
  console.log('🔗 https://vercel.com/hahababamama77-gmailcoms-projects/booking-app/settings/environment-variables');
  console.log('');
  console.log('🚀 Après avoir ajouté la variable, exécutez :');
  console.log('npx prisma db push');
  console.log('npx vercel --prod');
}

async function setupSupabase() {
  console.log('');
  console.log('🐘 Configuration Supabase :');
  console.log('');
  console.log('1. Allez sur https://supabase.com');
  console.log('2. Créez un nouveau projet');
  console.log('3. Allez dans Settings → Database');
  console.log('4. Copiez la connection string');
  console.log('');
  
  const connectionString = await question('Collez votre connection string Supabase: ');
  
  if (!connectionString.includes('postgresql://')) {
    console.log('❌ Connection string invalide');
    process.exit(1);
  }

  console.log('');
  console.log('⚠️  N\'oubliez pas de modifier prisma/schema.prisma :');
  console.log('Changez provider = "mysql" en provider = "postgresql"');
  console.log('');
  console.log('📝 Ajoutez cette variable d\'environnement sur Vercel :');
  console.log(`DATABASE_URL=${connectionString}`);
  console.log('');
  console.log('🔗 https://vercel.com/hahababamama77-gmailcoms-projects/booking-app/settings/environment-variables');
}

async function setupVercelPostgres() {
  console.log('');
  console.log('⚡ Configuration Vercel Postgres :');
  console.log('');
  console.log('1. Allez sur https://vercel.com/hahababamama77-gmailcoms-projects/booking-app');
  console.log('2. Storage → Create Database → Postgres');
  console.log('3. Connectez à votre projet');
  console.log('4. Vercel ajoutera automatiquement DATABASE_URL');
  console.log('');
  console.log('⚠️  N\'oubliez pas de modifier prisma/schema.prisma :');
  console.log('Changez provider = "mysql" en provider = "postgresql"');
  console.log('');
  console.log('🚀 Après configuration, exécutez :');
  console.log('npx prisma db push');
  console.log('npx vercel --prod');
}

main().catch(console.error);
