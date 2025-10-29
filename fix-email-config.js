#!/usr/bin/env node

/**
 * Script pour corriger la configuration email
 * Usage: node fix-email-config.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Correction de la configuration email...\n')

// Lire le fichier .env.local
const envPath = path.join(__dirname, '.env.local')
let envContent = fs.readFileSync(envPath, 'utf8')

console.log('📧 Configuration email actuelle:')
console.log('─'.repeat(50))

// Vérifier les variables email
const emailVars = [
  'SMTP_HOST',
  'SMTP_PORT', 
  'SMTP_USER',
  'SMTP_PASSWORD',
  'SMTP_FROM_NAME'
]

emailVars.forEach(varName => {
  const regex = new RegExp(`^${varName}=(.+)$`, 'm')
  const match = envContent.match(regex)
  if (match) {
    const value = match[1].replace(/"/g, '')
    if (value && value !== 'undefined') {
      console.log(`✅ ${varName}: ${value}`)
    } else {
      console.log(`❌ ${varName}: Non défini`)
    }
  } else {
    console.log(`❌ ${varName}: Manquant`)
  }
})

console.log('\n🔍 Vérification des variables dans le code...')

// Vérifier si les variables sont correctement exportées
const envFile = path.join(__dirname, 'lib', 'env.ts')
if (fs.existsSync(envFile)) {
  const envCode = fs.readFileSync(envFile, 'utf8')
  
  console.log('📋 Variables dans env.ts:')
  if (envCode.includes('SMTP_HOST')) {
    console.log('✅ SMTP_HOST: Défini dans env.ts')
  } else {
    console.log('❌ SMTP_HOST: Manquant dans env.ts')
  }
  
  if (envCode.includes('SMTP_USER')) {
    console.log('✅ SMTP_USER: Défini dans env.ts')
  } else {
    console.log('❌ SMTP_USER: Manquant dans env.ts')
  }
}

console.log('\n🔧 Correction en cours...')

// S'assurer que toutes les variables email sont correctement définies
const emailConfig = {
  'SMTP_HOST': 'smtp.gmail.com',
  'SMTP_PORT': '587',
  'SMTP_USER': 'londalonda620@gmail.com',
  'SMTP_PASSWORD': 'rmqd arit aukn vkwi',
  'SMTP_FROM_NAME': 'Cabinet Médical'
}

// Mettre à jour le fichier .env.local
Object.entries(emailConfig).forEach(([key, value]) => {
  const regex = new RegExp(`^${key}=.*$`, 'm')
  if (envContent.match(regex)) {
    envContent = envContent.replace(regex, `${key}="${value}"`)
    console.log(`✅ ${key}: Mis à jour`)
  } else {
    envContent += `\n${key}="${value}"`
    console.log(`✅ ${key}: Ajouté`)
  }
})

// Écrire le fichier mis à jour
fs.writeFileSync(envPath, envContent)

console.log('\n📧 Configuration email corrigée!')
console.log('🔄 Redémarrez l\'application pour appliquer les changements.')
console.log('   npm run dev')

console.log('\n📋 Test de la configuration...')

// Test simple de chargement des variables
require('dotenv').config({ path: '.env.local' })

console.log('🔍 Variables chargées:')
emailVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`✅ ${varName}: ${value}`)
  } else {
    console.log(`❌ ${varName}: Non chargé`)
  }
})

console.log('\n🎉 Configuration email prête!')
console.log('📧 Les emails devraient maintenant être envoyés correctement.')
