// scripts/test-slot-logic.js
// Test de la logique des créneaux avec le cas problématique

// Simulation de la logique simplifiée
const isSlotAvailable = (slotTime, bookings) => {
  const [slotHour, slotMinute] = slotTime.split(':').map(Number)
  const slotStart = slotHour * 60 + slotMinute
  const slotEnd = slotStart + 60

  // Vérifier les chevauchements directs
  const hasDirectOverlap = bookings.some(booking => {
    const [bookingHour, bookingMinute] = booking.time.split(':').map(Number)
    const bookingStart = bookingHour * 60 + bookingMinute
    const bookingEnd = bookingStart + 60

    return (slotStart < bookingEnd && slotEnd > bookingStart)
  })

  return !hasDirectOverlap
}

// Test avec le cas problématique
console.log('🧪 Test de la logique des créneaux')
console.log('📅 Réservations existantes:')
console.log('  - 12h00-13h00 (midi-13h)')
console.log('  - 14h30-15h30')
console.log('')

const bookings = [
  { time: '12:00' }, // 12h-13h
  { time: '14:30' }  // 14h30-15h30
]

const testSlots = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30']

console.log('📋 Résultats:')
testSlots.forEach(slot => {
  const available = isSlotAvailable(slot, bookings)
  const status = available ? '✅ Disponible' : '❌ Indisponible'
  console.log(`  ${slot}: ${status}`)
})

console.log('')
console.log('🎯 Cas problématique:')
console.log('  - 13h00: devrait être disponible (fin de réservation 12h-13h)')
console.log('  - 13h30: devrait être INDISPONIBLE (créerait un trou avec 14h30)')
console.log('  - 14h00: devrait être disponible (entre 13h et 14h30)')
console.log('  - 14h30: devrait être INDISPONIBLE (début de réservation)')
