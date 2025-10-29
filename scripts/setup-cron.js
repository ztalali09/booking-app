// scripts/setup-cron.js
// Script pour configurer le cron job des rappels

const { execSync } = require('child_process')
const path = require('path')

function setupCronJob() {
  try {
    console.log('⏰ Configuration du cron job pour les rappels...')
    
    const scriptPath = path.join(__dirname, 'send-reminders.js')
    const nodePath = process.execPath
    
    // Commande cron pour exécuter tous les jours à 18h00
    const cronCommand = `0 18 * * * cd ${process.cwd()} && ${nodePath} ${scriptPath} >> /var/log/booking-reminders.log 2>&1`
    
    console.log('📝 Commande cron à ajouter:')
    console.log(cronCommand)
    console.log('\n📋 Instructions:')
    console.log('1. Ouvrez le crontab: crontab -e')
    console.log('2. Ajoutez la ligne ci-dessus')
    console.log('3. Sauvegardez et fermez')
    console.log('\n🔍 Pour vérifier: crontab -l')
    console.log('\n📊 Pour voir les logs: tail -f /var/log/booking-reminders.log')
    
    // Optionnel: essayer d'ajouter automatiquement (nécessite des permissions)
    try {
      execSync(`echo "${cronCommand}" | crontab -`, { stdio: 'inherit' })
      console.log('✅ Cron job ajouté automatiquement!')
    } catch (error) {
      console.log('⚠️  Ajout automatique échoué. Ajoutez manuellement.')
    }
    
  } catch (error) {
    console.error('❌ Erreur configuration cron:', error)
  }
}

// Alternative: utiliser un service systemd
function setupSystemdService() {
  console.log('\n🔧 Alternative: Service systemd')
  console.log('Créez le fichier /etc/systemd/system/booking-reminders.service:')
  console.log(`
[Unit]
Description=Booking App Reminders
After=network.target

[Service]
Type=oneshot
User=www-data
WorkingDirectory=${process.cwd()}
ExecStart=${process.execPath} ${path.join(__dirname, 'send-reminders.js')}
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
  `)
  
  console.log('\nPuis créez le timer /etc/systemd/system/booking-reminders.timer:')
  console.log(`
[Unit]
Description=Run Booking Reminders Daily
Requires=booking-reminders.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
  `)
  
  console.log('\nCommandes:')
  console.log('sudo systemctl daemon-reload')
  console.log('sudo systemctl enable booking-reminders.timer')
  console.log('sudo systemctl start booking-reminders.timer')
}

// Exécuter
setupCronJob()
setupSystemdService()
