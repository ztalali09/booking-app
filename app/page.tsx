"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin, Calendar, Globe, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function BookingPage() {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<"morning" | "afternoon" | null>(null)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    firstConsultation: null as boolean | null,
    consultationReason: "",
    message: "",
  })
  const [selectedCountry, setSelectedCountry] = useState("FR")
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})
  const [isValidating, setIsValidating] = useState(false)
  const [availableDates, setAvailableDates] = useState<number[]>([])
  const [morningAvailable, setMorningAvailable] = useState(true)
  const [afternoonAvailable, setAfternoonAvailable] = useState(true)
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{time: string, available: boolean}[]>([])
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false)
  const [isDoctorInfoExpanded, setIsDoctorInfoExpanded] = useState(false)

  // Fonction pour obtenir l'heure actuelle en France
  const getCurrentTimeInFrance = () => {
    const now = new Date()
    // France est en UTC+1 (hiver) ou UTC+2 (été)
    const franceTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Paris"}))
    return franceTime
  }

  // Fonction pour vérifier la règle des 15 minutes minimum
  const isTimeSlotAvailableForBooking = (timeSlot: string, date: Date) => {
    const now = getCurrentTimeInFrance()
    const isToday = date.getDate() === now.getDate() && 
                   date.getMonth() === now.getMonth() && 
                   date.getFullYear() === now.getFullYear()

    if (!isToday) return true

    const [hours, minutes] = timeSlot.split(':').map(Number)
    const slotTime = hours * 60 + minutes
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const minimumAdvanceTime = currentTime + 15

    return slotTime > minimumAdvanceTime
  }

  // Fonction pour filtrer les horaires du jour même après l'heure actuelle
  const filterTodayTimeSlots = (slots: {time: string, available: boolean}[]) => {
    if (!selectedDate) return slots
    
    const franceTime = getCurrentTimeInFrance()
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
    const todayOnly = new Date(franceTime.getFullYear(), franceTime.getMonth(), franceTime.getDate())
    
    // Si ce n'est pas le jour même, retourner tous les créneaux
    if (selectedDateOnly.getTime() !== todayOnly.getTime()) {
      return slots
    }
    
    // Si c'est le jour même, filtrer les créneaux passés
    const currentHour = franceTime.getHours()
    const currentMinute = franceTime.getMinutes()
    const currentTime = currentHour * 60 + currentMinute
    
    return slots.filter(slot => {
      // Vérifier la disponibilité générale ET la règle des 15 minutes
      return slot.available && isTimeSlotAvailableForBooking(slot.time, selectedDate)
    })
  }

  // Charger les périodes disponibles quand une date est sélectionnée
  useEffect(() => {
    const loadAvailablePeriods = async () => {
      if (!selectedDate) return
      
      setIsLoadingPeriods(true)
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const response = await fetch(`/api/availability/periods?date=${dateStr}`)
        if (response.ok) {
          const data = await response.json()
          setMorningAvailable(data.morningAvailable)
          setAfternoonAvailable(data.afternoonAvailable)
          
          // Si une seule période est disponible, la sélectionner automatiquement
          if (data.morningAvailable && !data.afternoonAvailable) {
            setSelectedPeriod('morning')
          } else if (!data.morningAvailable && data.afternoonAvailable) {
            setSelectedPeriod('afternoon')
          }
        }
      } catch (error) {
        console.error('Erreur chargement périodes:', error)
      } finally {
        setIsLoadingPeriods(false)
      }
    }
    loadAvailablePeriods()
  }, [selectedDate])

  // Charger les dates disponibles depuis l'API
  useEffect(() => {
    const loadAvailableDates = async () => {
      // Pas de loading state - garder les dates précédentes
      try {
        const response = await fetch(`/api/availability/dates?month=${currentMonth}&year=${currentYear}`)
        if (response.ok) {
          const data = await response.json()
          setAvailableDates(data.availableDates)
        }
      } catch (error) {
        console.error('Erreur chargement dates:', error)
      }
    }
    loadAvailableDates()
  }, [currentMonth, currentYear])

  // Countries with phone codes and flags
  const countries = [
    { code: "FR", name: "France", phoneCode: "+33", flag: "🇫🇷" },
    { code: "BE", name: "Belgique", phoneCode: "+32", flag: "🇧🇪" },
    { code: "CH", name: "Suisse", phoneCode: "+41", flag: "🇨🇭" },
    { code: "DE", name: "Allemagne", phoneCode: "+49", flag: "🇩🇪" },
    { code: "ES", name: "Espagne", phoneCode: "+34", flag: "🇪🇸" },
    { code: "IT", name: "Italie", phoneCode: "+39", flag: "🇮🇹" },
    { code: "GB", name: "Royaume-Uni", phoneCode: "+44", flag: "🇬🇧" },
    { code: "US", name: "États-Unis", phoneCode: "+1", flag: "🇺🇸" },
    { code: "CA", name: "Canada", phoneCode: "+1", flag: "🇨🇦" },
    { code: "MA", name: "Maroc", phoneCode: "+212", flag: "🇲🇦" },
    { code: "TN", name: "Tunisie", phoneCode: "+216", flag: "🇹🇳" },
    { code: "DZ", name: "Algérie", phoneCode: "+213", flag: "🇩🇿" },
  ]

  const selectedCountryData = countries.find(c => c.code === selectedCountry) || countries[0]

  // Charger les créneaux disponibles quand une période est sélectionnée
  useEffect(() => {
    const loadAvailableTimeSlots = async () => {
      if (!selectedDate || !selectedPeriod) return
      
      setIsLoadingTimeSlots(true)
      try {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const response = await fetch(`/api/availability/slots?date=${dateStr}`)
        if (response.ok) {
          const data = await response.json()
          const slots = selectedPeriod === "morning" ? data.morning : data.afternoon
          setAvailableTimeSlots(slots)
        }
      } catch (error) {
        console.error('Erreur chargement créneaux:', error)
      } finally {
        setIsLoadingTimeSlots(false)
      }
    }
    loadAvailableTimeSlots()
  }, [selectedDate, selectedPeriod])

  // Time slots (fallback si pas de données)
  const morningSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"]
  const afternoonSlots = ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"]
  
  // Convertir les créneaux avec statut en créneaux simples pour l'affichage
  const rawTimeSlots = availableTimeSlots.length > 0 
    ? availableTimeSlots 
    : (selectedPeriod === "morning" ? morningSlots.map(time => ({time, available: true})) : selectedPeriod === "afternoon" ? afternoonSlots.map(time => ({time, available: true})) : [])
  
  // Filtrer les créneaux du jour même après l'heure actuelle
  const timeSlots = filterTodayTimeSlots(rawTimeSlots)

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]

  const dayNames = ["LUN.", "MAR.", "MER.", "JEU.", "VEN.", "SAM.", "DIM."]

  const dayNamesMobile = ["L", "M", "M", "J", "V", "S", "D"]

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1 // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    setSelectedDate(date)
    // Keep period and time if they exist
    setCurrentStep(2)
  }

  const handlePeriodClick = (period: "morning" | "afternoon") => {
    setSelectedPeriod(period)
    // Keep time if it exists and is valid for the new period
    if (selectedTime) {
      const timeSlots = period === "morning" ? morningSlots : afternoonSlots
      if (!timeSlots.includes(selectedTime)) {
        setSelectedTime(null)
      }
    }
  }

  const handleTimeClick = (time: string) => {
    setSelectedTime(time)
    setCurrentStep(3)
  }

  const handleNextClick = () => {
    if (selectedDate && selectedPeriod && selectedTime) {
      setCurrentStep(4)
      // Scroll vers le haut de la page
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToDate = () => {
    setCurrentStep(1)
  }

  // Validation en temps réel pour un champ
  const validateField = (field: string, value: string) => {
    const errors = { ...formErrors }
    
    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          errors.firstName = "Le prénom est requis"
        } else if (value.trim().length < 2) {
          errors.firstName = "Le prénom doit contenir au moins 2 caractères"
        } else {
          delete errors.firstName
        }
        break
        
      case 'lastName':
        if (!value.trim()) {
          errors.lastName = "Le nom est requis"
        } else if (value.trim().length < 2) {
          errors.lastName = "Le nom doit contenir au moins 2 caractères"
        } else {
          delete errors.lastName
        }
        break
        
      case 'email':
        if (!value.trim()) {
          errors.email = "L'email est requis"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = "Veuillez entrer un email valide"
        } else {
          delete errors.email
        }
        break
        
      case 'phone':
        if (!value.trim()) {
          errors.phone = "Le numéro de téléphone est requis"
        } else if (!/^[0-9\s\-\+\(\)]+$/.test(value)) {
          errors.phone = "Le numéro ne peut contenir que des chiffres, espaces, tirets, + et parenthèses"
        } else if (value.replace(/[^0-9]/g, '').length < 8) {
          errors.phone = "Le numéro doit contenir au moins 8 chiffres"
        } else {
          delete errors.phone
        }
        break
        
      case 'consultationReason':
        if (!value.trim()) {
          errors.consultationReason = "Le motif de consultation est requis"
        } else if (value.trim().length < 10) {
          errors.consultationReason = "Veuillez décrire plus précisément votre motif (minimum 10 caractères)"
        } else {
          delete errors.consultationReason
        }
        break
    }
    
    setFormErrors(errors)
  }

  // Fonction de validation du formulaire
  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.firstName.trim()) {
      errors.firstName = "Le prénom est requis"
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "Le prénom doit contenir au moins 2 caractères"
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = "Le nom est requis"
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "Le nom doit contenir au moins 2 caractères"
    }
    
    if (!formData.email.trim()) {
      errors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Veuillez entrer un email valide"
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Le numéro de téléphone est requis"
    } else if (!/^[0-9\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = "Le numéro ne peut contenir que des chiffres, espaces, tirets, + et parenthèses"
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 8) {
      errors.phone = "Le numéro doit contenir au moins 8 chiffres"
    }
    
    if (formData.firstConsultation === null) {
      errors.firstConsultation = "Veuillez indiquer si c'est votre première consultation"
    }
    
    if (!formData.consultationReason.trim()) {
      errors.consultationReason = "Le motif de consultation est requis"
    } else if (formData.consultationReason.trim().length < 10) {
      errors.consultationReason = "Veuillez décrire plus précisément votre motif (minimum 10 caractères)"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Détection automatique du pays basée sur le numéro
  const detectCountryFromPhone = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    
    // Détection basée sur les indicatifs
    if (cleanPhone.startsWith('33')) {
      return 'FR'
    } else if (cleanPhone.startsWith('1')) {
      return 'US'
    } else if (cleanPhone.startsWith('44')) {
      return 'GB'
    } else if (cleanPhone.startsWith('49')) {
      return 'DE'
    } else if (cleanPhone.startsWith('39')) {
      return 'IT'
    } else if (cleanPhone.startsWith('34')) {
      return 'ES'
    } else if (cleanPhone.startsWith('32')) {
      return 'BE'
    } else if (cleanPhone.startsWith('41')) {
      return 'CH'
    } else if (cleanPhone.startsWith('31')) {
      return 'NL'
    }
    
    return selectedCountry // Garder le pays actuel si pas de détection
  }

  const handleBackToPeriod = () => {
    setCurrentStep(2)
  }

  const handleBackToTime = () => {
      setCurrentStep(3)
  }

  const handleBack = () => {
    if (currentStep === 4) {
      setCurrentStep(3)
    } else if (currentStep === 3) {
      setCurrentStep(2)
    } else if (currentStep === 2) {
      setCurrentStep(1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation du formulaire
    if (!validateForm()) {
      setIsValidating(true)
      return
    }

    // Validation de la règle des 15 minutes
    if (selectedDate && selectedTime && !isTimeSlotAvailableForBooking(selectedTime, selectedDate)) {
      setSubmitError("Les réservations doivent être faites au moins 15 minutes à l'avance")
      return
    }
    
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      // Appel API réel
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: selectedCountry,
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
          time: selectedTime,
          period: selectedPeriod,
          firstConsultation: formData.firstConsultation,
          consultationReason: formData.consultationReason,
          message: formData.message,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Réservation créée:', data)
        setCurrentStep(5) // Succès
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      // Échec - afficher l'erreur à l'utilisateur
      console.error("Erreur lors de la soumission:", error)
      setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue')
      setCurrentStep(6)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fonction de retry en cas d'erreur
  const handleRetry = async () => {
    setIsRetrying(true)
    setSubmitError(null)
    
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
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : undefined,
          time: selectedTime,
          period: selectedPeriod,
          firstConsultation: formData.firstConsultation,
          consultationReason: formData.consultationReason,
          message: formData.message,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentStep(5) // Succès
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Erreur lors de la création')
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsRetrying(false)
    }
  }

  const handlePreviousMonth = () => {
    const today = new Date()
    const currentDate = new Date(currentYear, currentMonth)
    const todayDate = new Date(today.getFullYear(), today.getMonth())
    
    // Empêcher de revenir aux mois passés
    if (currentDate <= todayDate) {
      return
    }
    
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  // Vérifier si on peut revenir au mois précédent
  const canGoToPreviousMonth = () => {
    const franceTime = getCurrentTimeInFrance()
    const currentDate = new Date(currentYear, currentMonth)
    const todayDate = new Date(franceTime.getFullYear(), franceTime.getMonth())
    return currentDate > todayDate
  }

  const formatSelectedDate = () => {
    if (!selectedDate) return ""
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
    const months = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ]
    
    // La date selectedDate est déjà en heure locale, pas besoin de conversion
    return `${days[selectedDate.getDay()]}, ${selectedDate.getDate()} ${months[selectedDate.getMonth()]}`
  }

  const formatFullDateTime = () => {
    if (!selectedDate || !selectedTime) return ""
    const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
    const months = [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ]

    // Calculate end time (1h later)
    const [hours, minutes] = selectedTime.split(":").map(Number)
    const endHours = hours + 1
    const endTime = `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`

    // La date selectedDate est déjà en heure locale, pas besoin de conversion
    return `${selectedTime} - ${endTime}, ${days[selectedDate.getDay()]}, ${selectedDate.getDate()} ${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-6 sm:h-8" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isAvailable = availableDates.includes(day)
      const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentMonth && selectedDate?.getFullYear() === currentYear

      days.push(
        <button
          key={day}
          onClick={() => isAvailable && handleDateClick(day)}
          disabled={!isAvailable}
          className={`h-10 sm:h-12 w-10 sm:w-12 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            isSelected
              ? "bg-[#0066FF] text-white shadow-lg scale-105 ring-2 ring-[#0066FF] ring-offset-2"
              : isAvailable
                ? "text-[#0066FF] bg-white border-2 border-[#0066FF] hover:bg-blue-50 hover:shadow-md focus:ring-[#0066FF]"
                : "text-gray-300 bg-gray-50 border border-gray-200 cursor-not-allowed"
          }`}
          aria-label={`${day} ${monthNames[currentMonth]}`}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 lg:flex lg:items-center lg:justify-center lg:py-8 lg:px-4">
      {/* Conteneur mobile avec boîte et reflets */}
      <div className="lg:hidden py-8 px-1.5">
        <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden relative">
          {/* Reflets sur les côtés */}
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-60"></div>
          <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-60"></div>
          
          {/* Contenu mobile */}
          <div className="relative z-10">
            <div className="w-full bg-white flex flex-col px-3 pt-6 pb-12">
              {/* Version mobile - Informations du docteur - Masquées à l'étape 4 */}
                {currentStep !== 4 && (
                <div className="mb-8">
                  {/* Titre stylé */}
                  <div className="text-center mb-6">
                    <div className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-2xl p-6 shadow-lg">
                      <h1 className="text-2xl font-bold mb-2">Consultation Médicale</h1>
                      <p className="text-blue-100 text-sm">Dr. Marie Dubois - Médecine Générale</p>
                      <div className="mt-3 flex items-center justify-center gap-2 text-blue-100">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">1h modulable selon le besoin</span>
                      </div>
                    </div>
                  </div>

                  {/* Informations du médecin - Version mobile avec expansion */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="text-base font-bold text-gray-900 mb-3">Bienvenue</h3>
                    <p className="text-sm text-gray-600 leading-relaxed text-pretty mb-4">
                      Je suis ravie de vous accueillir pour une consultation personnalisée. Ensemble, nous prendrons le temps
                      d'écouter vos besoins et d'établir un plan de soins adapté à votre situation.
                    </p>
                    
                    <h3 className="text-base font-bold text-gray-900 mb-3">Description du service</h3>
                    <p className="text-sm text-gray-600 leading-relaxed text-pretty mb-3">
                      Consultation complète incluant un examen approfondi, un diagnostic et des recommandations thérapeutiques
                      personnalisées.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-[#0066FF] mt-1">•</span>
                        <span>Examen clinique détaillé</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#0066FF] mt-1">•</span>
                        <span>Analyse de vos antécédents médicaux</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#0066FF] mt-1">•</span>
                        <span>Plan de traitement personnalisé</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#0066FF] mt-1">•</span>
                        <span>Réponses à toutes vos questions</span>
                      </li>
                    </ul>

                    {/* Bouton d'expansion */}
                    <div className="text-center">
                      <button
                        onClick={() => setIsDoctorInfoExpanded(!isDoctorInfoExpanded)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0066FF] hover:text-[#0052CC] transition-colors"
                      >
                        {isDoctorInfoExpanded ? 'Afficher moins' : 'Afficher plus'}
                        <ChevronDown className={`w-4 h-4 transition-transform ${isDoctorInfoExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    {/* Contenu expandable */}
                    {isDoctorInfoExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                        <h3 className="text-base font-bold text-gray-900 mb-3">À propos du praticien</h3>
                        <p className="text-sm text-gray-600 leading-relaxed text-pretty mb-3">
                          Diplômée de la Faculté de Médecine de Paris, le Dr. Marie Dubois exerce depuis plus de 15 ans. Spécialisée
                          en médecine générale, elle accompagne ses patients avec bienveillance et professionnalisme.
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed text-pretty">
                          Son approche holistique et son écoute attentive permettent d'établir une relation de confiance durable
                          avec chaque patient.
                        </p>

                        <h3 className="text-base font-bold text-gray-900 mb-3 mt-4">Informations pratiques</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Accès</p>
                            <p className="leading-relaxed">
                              Métro ligne 6 - Station Glacière. Parking public à proximité. Accès PMR disponible.
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Paiement</p>
                            <p className="leading-relaxed">
                              Carte bancaire, espèces, chèque. Tiers payant accepté pour les patients en ALD.
                            </p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 mb-1">Annulation</p>
                            <p className="leading-relaxed">Merci de prévenir au moins 24h à l'avance en cas d'empêchement.</p>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-gray-900 mb-3 mt-4">Préparation de votre visite</h3>
                        <p className="text-sm text-gray-600 leading-relaxed text-pretty mb-3">
                          Pour optimiser votre consultation, pensez à apporter :
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <span className="text-[#0066FF] mt-1">•</span>
                            <span>Votre carte vitale et mutuelle</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#0066FF] mt-1">•</span>
                            <span>Vos ordonnances en cours</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#0066FF] mt-1">•</span>
                            <span>Vos derniers examens médicaux</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#0066FF] mt-1">•</span>
                            <span>Une liste de vos questions</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
            </div>
                )}

                {/* Titre principal pour mobile - Étape 4 */}
                {currentStep === 4 && (
                <div className="text-center mb-6 py-8">
                    <h2 className="text-2xl font-bold text-[#0066FF]">Finaliser votre rendez-vous</h2>
          </div>
                )}

                {/* 4 lignes d'informations essentielles */}
                <div className={`space-y-3 ${currentStep === 4 ? 'mb-8' : 'mb-6'}`}>
                  <div className="flex items-center gap-3 text-sm text-gray-700 p-3 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-[#0066FF]" />
                    </div>
                    <span className="font-medium">1h modulable selon le besoin</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-700 p-3 rounded-lg bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-[#0066FF]" />
                    </div>
                    <span className="font-medium">15 Rue de la Santé, 75014 Paris</span>
                  </div>

                  {selectedDate && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 p-3 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-4 h-4 text-[#0066FF]" />
                      </div>
                      <span className="font-medium">
                        {currentStep === 3 ? formatFullDateTime() : formatSelectedDate()}
                      </span>
                    </div>
                  )}

                  {currentStep >= 4 && selectedTime && (
                    <div className="flex items-center gap-3 text-sm text-gray-700 p-3 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-[#0066FF]" />
                      </div>
                      <span className="font-medium">
                        {selectedTime} - {(() => {
                          const [hours, minutes] = selectedTime.split(":").map(Number)
                          const endHours = hours + 1
                          return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                        })()}
                      </span>
                  </div>
                )}
              </div>

              {/* Contenu principal mobile */}
              <div className="flex-1 flex flex-col overflow-y-auto">
                {currentStep === 1 || currentStep === 2 || currentStep === 3 ? (
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
                      <div className={`${currentStep === 2 || currentStep === 3 ? "lg:w-1/2" : "w-full max-w-2xl mx-auto"}`}>
                       {/* Titre et workflow pour mobile */}
                       <div className="lg:hidden mb-6">
                         <h1 className="text-2xl font-bold text-[#0066FF] text-center mb-4">Prendre un rendez-vous</h1>
                         
                         {/* Workflow mobile */}
                         <div className="flex justify-center items-center gap-2 mb-6">
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                             currentStep >= 1 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                           }`}>
                             1
                           </div>
                           <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-[#0066FF]' : 'bg-gray-200'}`}></div>
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                             currentStep >= 2 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                           }`}>
                             2
                           </div>
                           <div className={`w-8 h-0.5 ${currentStep >= 3 ? 'bg-[#0066FF]' : 'bg-gray-200'}`}></div>
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                             currentStep >= 3 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                           }`}>
                             3
                           </div>
                           <div className={`w-8 h-0.5 ${currentStep >= 4 ? 'bg-[#0066FF]' : 'bg-gray-200'}`}></div>
                           <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                             currentStep >= 4 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                           }`}>
                             4
                           </div>
                         </div>
                         
                         <h2 className="text-xl font-bold text-[#0066FF] text-center">Choisissez un jour</h2>
                       </div>
                       
                       {/* Récapitulatif mobile des sélections */}
                       {(selectedDate || selectedTime) && (
                         <div className="lg:hidden mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                           <h3 className="text-sm font-semibold text-[#0066FF] mb-2">Votre sélection</h3>
                           {selectedDate && (
                             <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                               <Calendar className="w-4 h-4 text-[#0066FF]" />
                               <span>{formatSelectedDate()}</span>
                             </div>
                           )}
                           {selectedTime && (
                             <div className="flex items-center gap-2 text-sm text-gray-700">
                               <Clock className="w-4 h-4 text-[#0066FF]" />
                               <span>{selectedTime} - {(() => {
                                 const [hours, minutes] = selectedTime.split(":").map(Number)
                                 const endHours = hours + 1
                                 return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                               })()}</span>
                             </div>
                           )}
                         </div>
                       )}
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <button
                            onClick={handlePreviousMonth}
                            disabled={!canGoToPreviousMonth()}
                            className={`p-2 rounded-lg ${
                              canGoToPreviousMonth() 
                                ? "hover:bg-gray-100 cursor-pointer" 
                                : "cursor-not-allowed opacity-50"
                            }`}
                            aria-label="Mois précédent"
                          >
                            <ChevronLeft className={`w-5 h-5 ${
                              canGoToPreviousMonth() ? "text-gray-600" : "text-gray-400"
                            }`} />
                          </button>
                          <h2 className="text-lg font-bold text-gray-900">
                            {monthNames[currentMonth]} {currentYear}
                          </h2>
                          <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            aria-label="Mois suivant"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-3">
                          {dayNames.map((day, index) => (
                            <div
                              key={day}
                              className="h-8 sm:h-10 flex items-center justify-center text-sm font-bold text-gray-600 uppercase"
                            >
                              <span className="hidden sm:inline">{day}</span>
                              <span className="sm:hidden">{dayNamesMobile[index]}</span>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                      </div>

                      {selectedDate && (
                        <div className="flex gap-3 mb-6">
                          <button
                            onClick={() => morningAvailable && !isLoadingPeriods && handlePeriodClick("morning")}
                            disabled={!morningAvailable || isLoadingPeriods}
                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold ${
                              isLoadingPeriods
                                ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-wait"
                                : !morningAvailable
                                  ? "bg-gray-50 text-gray-400 border-2 border-gray-200 cursor-not-allowed opacity-50"
                                  : selectedPeriod === "morning"
                                    ? "bg-[#0066FF] text-white shadow-lg scale-105"
                                    : "bg-white text-[#0066FF] border-2 border-[#0066FF] hover:bg-blue-50 hover:shadow-md"
                            }`}
                          >
                            Matin {!morningAvailable && !isLoadingPeriods && "(Complet)"}
                          </button>
                          <button
                            onClick={() => afternoonAvailable && !isLoadingPeriods && handlePeriodClick("afternoon")}
                            disabled={!afternoonAvailable || isLoadingPeriods}
                            className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold ${
                              isLoadingPeriods
                                ? "bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-wait"
                                : !afternoonAvailable
                                  ? "bg-gray-50 text-gray-400 border-2 border-gray-200 cursor-not-allowed opacity-50"
                                  : selectedPeriod === "afternoon"
                                    ? "bg-[#0066FF] text-white shadow-lg scale-105"
                                    : "bg-white text-[#0066FF] border-2 border-[#0066FF] hover:bg-blue-50 hover:shadow-md"
                            }`}
                          >
                            Après-midi {!afternoonAvailable && !isLoadingPeriods && "(Complet)"}
                          </button>
                        </div>
                      )}
                    </div>

                    {(currentStep === 2 || currentStep === 3) && selectedDate && selectedPeriod && (
                      <div className="flex-1">
                        {/* Titre pour mobile */}
                        <div className="lg:hidden mb-6">
                          <h2 className="text-xl font-bold text-[#0066FF] text-center">
                            {currentStep === 2 ? "Choisissez une période" : "Choisissez un horaire"}
                          </h2>
                        </div>
                        
                        <div className="mb-6">
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 capitalize mb-1">
                            {formatSelectedDate()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {selectedPeriod === "morning" ? "Créneaux du matin" : "Créneaux de l'après-midi"}
                          </p>
                        </div>

                        {/* Message informatif sur la règle des 15 minutes */}
                        {selectedDate && isTimeSlotAvailableForBooking("09:00", selectedDate) && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-600">
                              Les réservations doivent être faites au moins 15 minutes à l'avance
                            </p>
                          </div>
                        )}

                        <div className="space-y-2 sm:space-y-3 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {isLoadingTimeSlots ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="rounded-full h-8 w-8 border-b-2 border-[#0066FF]"></div>
                              <span className="ml-3 text-gray-600">Chargement des créneaux...</span>
                            </div>
                          ) : timeSlots.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                              Aucun créneau disponible pour cette période
                            </div>
                          ) : (
                            timeSlots.map((slot, index) => (
                            <div key={slot.time}>
                              {selectedTime === slot.time ? (
                                <div className="flex gap-2 sm:gap-3">
                              <button
                                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 text-sm sm:text-base font-semibold bg-[#0066FF] text-white border-[#0066FF] shadow-lg scale-[1.02]"
                                      disabled
                                    >
                                      ✓ {slot.time}
                              </button>
                              <Button
                                onClick={handleNextClick}
                                      className="flex-1 bg-white text-[#0066FF] border-2 border-[#0066FF] hover:bg-blue-50 hover:shadow-md py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 h-full"
                              >
                                Suivant
                              </Button>
                            </div>
                              ) : (
                              <button
                                onClick={() => slot.available && handleTimeClick(slot.time)}
                                disabled={!slot.available}
                                className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 text-sm sm:text-base font-semibold hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                  slot.available
                                    ? "bg-white text-[#0066FF] border-[#0066FF] hover:bg-blue-50 hover:shadow-md focus:ring-[#0066FF]"
                                    : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                                }`}
                                aria-label={`Créneau à ${slot.time}${!slot.available ? ' (Réservé)' : ''}`}
                              >
                                {slot.available ? slot.time : `${slot.time} (Réservé)`}
                              </button>
                              )}
                            </div>
                          ))
                          )}
                        </div>

                      </div>
                    )}
                  </div>
                ) : currentStep === 5 ? (
                  <div className="max-w-2xl mx-auto w-full">
                    {/* Titre pour mobile */}
                    <div className="lg:hidden mb-6">
                      <h2 className="text-xl font-bold text-[#0066FF] text-center">Confirmation</h2>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        Rendez-vous confirmé !
                      </h2>
                      <p className="text-lg text-gray-600 mb-6">
                        Votre réservation a été enregistrée avec succès.
                      </p>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 bg-[#0066FF] rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">Détails de votre rendez-vous</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-4 h-4 text-[#0066FF]" />
                              <span className="text-sm font-medium text-gray-600">Date</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{formatSelectedDate()}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-[#0066FF]" />
                              <span className="text-sm font-medium text-gray-600">Horaire</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{selectedTime}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <Globe className="w-4 h-4 text-[#0066FF]" />
                              <span className="text-sm font-medium text-gray-600">Période</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{selectedPeriod === "morning" ? "Matin" : "Après-midi"}</p>
                          </div>
                          <div className="bg-white rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-4 h-4 bg-[#0066FF] rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">P</span>
                              </div>
                              <span className="text-sm font-medium text-gray-600">Patient</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{formData.firstName} {formData.lastName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Un email de confirmation vous a été envoyé à <strong>{formData.email}</strong>
                        </p>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm">📧</span>
                            </div>
                            <h4 className="text-sm font-semibold text-green-800">Gestion de votre rendez-vous</h4>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="text-sm font-medium text-green-800">Annulation</p>
                                <p className="text-xs text-green-700">Vous pouvez annuler votre rendez-vous via le lien dans l'email</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="text-sm font-medium text-green-800">Délai d'annulation</p>
                                <p className="text-xs text-green-700">Annulation possible jusqu'à 24h avant le rendez-vous</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div>
                                <p className="text-sm font-medium text-green-800">Durée de consultation</p>
                                <p className="text-xs text-green-700">Consultation personnalisée d'environ 1h selon vos besoins</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            setCurrentStep(1)
                            setSelectedDate(null)
                            setSelectedPeriod(null)
                            setSelectedTime(null)
                            setFormData({
                              firstName: "",
                              lastName: "",
                              email: "",
                              phone: "",
                              firstConsultation: null,
                              consultationReason: "",
                              message: "",
                            })
                          }}
                          className="w-full bg-[#0066FF] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#0052CC] "
                        >
                          Prendre un nouveau rendez-vous
                        </button>
                      </div>
                    </div>
                  </div>
                ) : currentStep === 6 ? (
                  <div className="max-w-2xl mx-auto w-full">
                    {/* Titre pour mobile */}
                    <div className="lg:hidden mb-6">
                      <h2 className="text-xl font-bold text-[#0066FF] text-center">Erreur</h2>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        Erreur de réservation
                      </h2>
                      <p className="text-lg text-gray-600 mb-6">
                        Une erreur s'est produite lors de l'enregistrement de votre rendez-vous.
                      </p>
                      
                      {submitError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                          <div className="flex items-center gap-3 mb-3">
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-red-800">Détails de l'erreur</h3>
                          </div>
                          <p className="text-red-700">{submitError}</p>
                        </div>
                      )}
                      
                      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Que s'est-il passé ?</h3>
                        <p className="text-red-700 text-sm">
                          Il semble qu'il y ait eu un problème de connexion avec nos serveurs. 
                          Votre rendez-vous n'a pas pu être enregistré.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          Veuillez réessayer dans quelques instants ou contactez-nous si le problème persiste.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleRetry}
                            disabled={isRetrying}
                            className={`flex-1 py-3 px-6 rounded-xl font-semibold  ${
                              isRetrying
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-[#0066FF] text-white hover:bg-[#0052CC]'
                            }`}
                          >
                            {isRetrying ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Nouvelle tentative...
                              </div>
                            ) : (
                              'Réessayer'
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setCurrentStep(1)
                              setSelectedDate(null)
                              setSelectedPeriod(null)
                              setSelectedTime(null)
                              setFormData({
                                firstName: "",
                                lastName: "",
                                email: "",
                                phone: "",
                                firstConsultation: null,
                                consultationReason: "",
                                message: "",
                              })
                            }}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 "
                          >
                            Recommencer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-2xl mx-auto w-full">

          <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-sm font-bold shadow-md">
                            4
                        </div>
                          <span className="text-sm font-medium text-gray-500">Étape 4 sur 4</span>
                        </div>
                        <button
                          onClick={handleBack}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#0066FF] bg-blue-50 hover:bg-blue-100 rounded-md "
                        >
                          <ChevronLeft className="w-3 h-3" />
                          Retour
                        </button>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance mb-2">
                        Indiquez vos informations
                      </h2>
                      <p className="text-sm sm:text-base text-gray-600">
                        Complétez le formulaire pour finaliser votre réservation
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Prénom *</label>
                        <Input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, firstName: value })
                            validateField('firstName', value)
                          }}
                          className={`w-full h-11 sm:h-12 px-4 rounded-xl border-2 focus:ring-2 focus:ring-offset-2  ${
                            formErrors.firstName 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]'
                          }`}
                          placeholder="Entrez votre prénom"
                        />
                        {formErrors.firstName && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Nom *</label>
                        <Input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, lastName: value })
                            validateField('lastName', value)
                          }}
                          className={`w-full h-11 sm:h-12 px-4 rounded-xl border-2 focus:ring-2 focus:ring-offset-2  ${
                            formErrors.lastName 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]'
                          }`}
                          placeholder="Entrez votre nom"
                        />
                        {formErrors.lastName && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.lastName}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">E-mail *</label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, email: value })
                            validateField('email', value)
                          }}
                          className={`w-full h-11 sm:h-12 px-4 rounded-xl border-2 focus:ring-2 focus:ring-offset-2  ${
                            formErrors.email 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]'
                          }`}
                          placeholder="Entrez votre email"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Téléphone *</label>
                        <div className="flex gap-2">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                              className="flex items-center gap-2 px-3 py-3 h-11 sm:h-12 border-2 border-gray-200 rounded-xl hover:border-[#0066FF]  bg-white"
                            >
                              <span className="text-lg">{selectedCountryData.flag}</span>
                              <span className="text-sm font-medium text-gray-700">{selectedCountryData.phoneCode}</span>
                              <ChevronDown className="w-3 h-3 text-gray-500" />
                            </button>
                            
                            {showCountryDropdown && (
                              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                                {countries.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(country.code)
                                      setShowCountryDropdown(false)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 "
                                  >
                                    <span className="text-lg">{country.flag}</span>
                                    <span className="text-sm font-medium text-gray-700">{country.phoneCode}</span>
                                    <span className="text-xs text-gray-500">{country.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => {
                              const phoneValue = e.target.value
                              setFormData({ ...formData, phone: phoneValue })
                              validateField('phone', phoneValue)
                              
                              // Détection automatique du pays
                              const detectedCountry = detectCountryFromPhone(phoneValue)
                              if (detectedCountry !== selectedCountry) {
                                setSelectedCountry(detectedCountry)
                              }
                            }}
                            className={`flex-1 h-11 sm:h-12 px-4 rounded-xl border-2 focus:ring-2 focus:ring-offset-2  ${
                              formErrors.phone 
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                                : 'border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]'
                            }`}
                            placeholder="Numéro de téléphone"
                          />
                        </div>
                        {formErrors.phone && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Première consultation *</label>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, firstConsultation: true })
                              if (formErrors.firstConsultation) {
                                setFormErrors({ ...formErrors, firstConsultation: "" })
                              }
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold  ${
                              formData.firstConsultation === true
                                ? "bg-[#0066FF] text-white shadow-lg scale-105"
                                : "bg-white text-[#0066FF] border-2 border-[#0066FF] hover:bg-blue-50 hover:shadow-md"
                            }`}
                          >
                            Oui
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, firstConsultation: false })
                              if (formErrors.firstConsultation) {
                                setFormErrors({ ...formErrors, firstConsultation: "" })
                              }
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold  ${
                              formData.firstConsultation === false
                                ? "bg-[#0066FF] text-white shadow-lg scale-105"
                                : "bg-white text-[#0066FF] border-2 border-[#0066FF] hover:bg-blue-50 hover:shadow-md"
                            }`}
                          >
                            Non
                          </button>
                        </div>
                        {formErrors.firstConsultation && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.firstConsultation}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Motif de consultation <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={formData.consultationReason}
                          onChange={(e) => {
                            const value = e.target.value
                            setFormData({ ...formData, consultationReason: value })
                            validateField('consultationReason', value)
                          }}
                          className={`w-full h-24 px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-offset-2 resize-none ${
                            formErrors.consultationReason 
                              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                              : 'border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]'
                          }`}
                          placeholder="Décrivez le motif de votre consultation (ex: douleur, suivi médical, bilan de santé, etc.)"
                        />
                        {formErrors.consultationReason && (
                          <p className="mt-1 text-xs text-red-600">{formErrors.consultationReason}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Message (optionnel)</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="w-full h-24 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 resize-none"
                          placeholder="Informations complémentaires ou questions spécifiques..."
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#0066FF] text-white py-4 px-6 rounded-xl font-semibold hover:bg-[#0052CC]  disabled:opacity-50 disabled:cursor-not-allowed mb-8"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Envoi en cours...
                          </div>
                        ) : (
                          "Confirmer le rendez-vous"
                        )}
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Version desktop */}
      <div className="hidden lg:flex w-full lg:max-w-6xl bg-white lg:rounded-2xl lg:shadow-2xl overflow-hidden flex-col lg:flex-row lg:max-h-[90vh]">
        <div className="lg:w-[35%] bg-gradient-to-b from-white to-gray-50 border-r border-gray-100 p-6 lg:p-8 flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          {/* Titre stylé pour desktop */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-[#0066FF] to-[#0052CC] text-white rounded-2xl p-6 shadow-lg">
              <h1 className="text-3xl font-bold mb-3">Consultation Médicale</h1>
              <p className="text-blue-100 text-lg mb-4">Dr. Marie Dubois - Médecine Générale</p>
              <div className="flex items-center gap-2 text-blue-100">
                <Clock className="w-5 h-5" />
                <span className="text-base">1h modulable selon le besoin</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-sm text-gray-700 p-3 rounded-lg hover:bg-white ">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-[#0066FF]" />
              </div>
              <span className="font-medium">1h modulable selon le besoin</span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-700 p-3 rounded-lg hover:bg-white ">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-[#0066FF]" />
              </div>
              <span className="font-medium">15 Rue de la Santé, 75014 Paris</span>
            </div>

            {selectedDate && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-700 p-3 rounded-lg hover:bg-white ">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-[#0066FF]" />
                </div>
                  <span className="font-medium">
                  {currentStep === 3 ? formatFullDateTime() : formatSelectedDate()}
                </span>
              </div>

                {currentStep >= 4 && selectedTime && (
            <div className="flex items-center gap-3 text-sm text-gray-700 p-3 rounded-lg hover:bg-white ">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-[#0066FF]" />
              </div>
                    <span className="font-medium">
                      {selectedTime} - {(() => {
                        const [hours, minutes] = selectedTime.split(":").map(Number)
                        const endHours = hours + 1
                        return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                      })()}
                    </span>
            </div>
                )}
              </div>
            )}

          </div>

          <div className="mb-8 pt-8 border-t border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">Bienvenue</h3>
            <p className="text-sm text-gray-600 leading-relaxed text-pretty">
              Je suis ravie de vous accueillir pour une consultation personnalisée. Ensemble, nous prendrons le temps
              d'écouter vos besoins et d'établir un plan de soins adapté à votre situation.
            </p>
          </div>

          <div className="mb-8 pt-6 border-t border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">Description du service</h3>
            <p className="text-sm text-gray-600 leading-relaxed text-pretty mb-4">
              Consultation complète incluant un examen approfondi, un diagnostic et des recommandations thérapeutiques
              personnalisées.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] mt-1">•</span>
                <span>Examen clinique détaillé</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] mt-1">•</span>
                <span>Analyse de vos antécédents médicaux</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] mt-1">•</span>
                <span>Plan de traitement personnalisé</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] mt-1">•</span>
                <span>Réponses à toutes vos questions</span>
              </li>
            </ul>
          </div>

          <div className="mb-8 pt-6 border-t border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">À propos du praticien</h3>
            <p className="text-sm text-gray-600 leading-relaxed text-pretty mb-3">
              Diplômée de la Faculté de Médecine de Paris, le Dr. Marie Dubois exerce depuis plus de 15 ans. Spécialisée
              en médecine générale, elle accompagne ses patients avec bienveillance et professionnalisme.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed text-pretty">
              Son approche holistique et son écoute attentive permettent d'établir une relation de confiance durable
              avec chaque patient.
            </p>
          </div>

          <div className="mb-8 pt-6 border-t border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">Informations pratiques</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <p className="font-semibold text-gray-900 mb-1">Accès</p>
                <p className="leading-relaxed">
                  Métro ligne 6 - Station Glacière. Parking public à proximité. Accès PMR disponible.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Paiement</p>
                <p className="leading-relaxed">
                  Carte bancaire, espèces, chèque. Tiers payant accepté pour les patients en ALD.
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">Annulation</p>
                <p className="leading-relaxed">Merci de prévenir au moins 24h à l'avance en cas d'empêchement.</p>
              </div>
            </div>
          </div>

          <div className="mb-8 pt-6 border-t border-gray-200">
            <h3 className="text-base font-bold text-gray-900 mb-3">Préparation de votre visite</h3>
            <p className="text-sm text-gray-600 leading-relaxed text-pretty mb-3">
              Pour optimiser votre consultation, pensez à apporter :
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] mt-1">•</span>
                <span>Votre carte vitale et mutuelle</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] mt-1">•</span>
                <span>Vos ordonnances en cours</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] mt-1">•</span>
                <span>Vos derniers examens médicaux</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0066FF] mt-1">•</span>
                <span>Une liste de vos questions</span>
              </li>
            </ul>
          </div>

          <div className="mt-auto pt-8 border-t border-gray-200">
            <a
              href="#"
              className="text-xs text-[#0066FF] hover:text-[#0052CC] font-medium hover:underline  inline-flex items-center gap-1"
            >
              Paramètres des cookies
            </a>
          </div>
        </div>

        <div className="flex-1 lg:w-[65%] p-4 sm:p-6 lg:p-8 xl:p-10 flex flex-col overflow-y-auto">
          {/* Version desktop - Titre et workflow */}
          <div className="hidden lg:block mb-4 lg:mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-[#0066FF] text-center lg:text-left mb-3">Prendre un rendez-vous</h1>
            
            {/* Workflow des étapes */}
            <div className="flex items-center justify-center lg:justify-start space-x-1 sm:space-x-2">
              <div className={`flex items-center space-x-1 ${currentStep >= 1 ? 'text-[#0066FF]' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 1 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
              </div>
                <span className="text-xs font-medium hidden sm:inline">Sélectionner une date</span>
                <span className="text-xs font-medium sm:hidden">Date</span>
              </div>
              
              <div className={`w-3 h-0.5 ${currentStep >= 2 ? 'bg-[#0066FF]' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center space-x-1 ${currentStep >= 2 ? 'text-[#0066FF]' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 2 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="text-xs font-medium hidden sm:inline">Choisir une période</span>
                <span className="text-xs font-medium sm:hidden">Période</span>
            </div>

              <div className={`w-3 h-0.5 ${currentStep >= 3 ? 'bg-[#0066FF]' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center space-x-1 ${currentStep >= 3 ? 'text-[#0066FF]' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 3 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
              </div>
                <span className="text-xs font-medium hidden sm:inline">Sélectionner un horaire</span>
                <span className="text-xs font-medium sm:hidden">Horaire</span>
              </div>
              
              <div className={`w-3 h-0.5 ${currentStep >= 4 ? 'bg-[#0066FF]' : 'bg-gray-300'}`}></div>
              
              <div className={`flex items-center space-x-1 ${currentStep >= 4 ? 'text-[#0066FF]' : 'text-gray-400'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep >= 4 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  4
                </div>
                <span className="text-xs font-medium hidden sm:inline">Informations personnelles</span>
                <span className="text-xs font-medium sm:hidden">Infos</span>
              </div>
            </div>
          </div>
          

          <div className="flex-1 flex flex-col overflow-y-auto">

            {currentStep === 1 || currentStep === 2 || currentStep === 3 ? (
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 flex-1">
                  <div className={`${currentStep === 2 || currentStep === 3 ? "lg:w-1/2" : "w-full max-w-2xl mx-auto"}`}>
                   {/* Titre et workflow pour mobile */}
                   <div className="lg:hidden mb-6">
                     <h1 className="text-2xl font-bold text-[#0066FF] text-center mb-4">Prendre un rendez-vous</h1>
                     
                     {/* Workflow mobile */}
                     <div className="flex justify-center items-center gap-2 mb-6">
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                         currentStep >= 1 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                       }`}>
                         1
                       </div>
                       <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-[#0066FF]' : 'bg-gray-200'}`}></div>
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                         currentStep >= 2 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                       }`}>
                         2
                       </div>
                       <div className={`w-8 h-0.5 ${currentStep >= 3 ? 'bg-[#0066FF]' : 'bg-gray-200'}`}></div>
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                         currentStep >= 3 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                       }`}>
                         3
                       </div>
                       <div className={`w-8 h-0.5 ${currentStep >= 4 ? 'bg-[#0066FF]' : 'bg-gray-200'}`}></div>
                       <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                         currentStep >= 4 ? 'bg-[#0066FF] text-white' : 'bg-gray-200 text-gray-500'
                       }`}>
                         4
                       </div>
                     </div>
                     
                     <h2 className="text-xl font-bold text-[#0066FF] text-center">Choisissez un jour</h2>
                   </div>
                   
                   {/* Récapitulatif mobile des sélections */}
                   {(selectedDate || selectedTime) && (
                     <div className="lg:hidden mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                       <h3 className="text-sm font-semibold text-[#0066FF] mb-2">Votre sélection</h3>
              {selectedDate && (
                         <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                           <Calendar className="w-4 h-4 text-[#0066FF]" />
                           <span>{formatSelectedDate()}</span>
                </div>
              )}
                       {selectedTime && (
                         <div className="flex items-center gap-2 text-sm text-gray-700">
                           <Clock className="w-4 h-4 text-[#0066FF]" />
                           <span>{selectedTime} - {(() => {
                             const [hours, minutes] = selectedTime.split(":").map(Number)
                             const endHours = hours + 1
                             return `${endHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                           })()}</span>
            </div>
                       )}
          </div>
                   )}
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <button
                        onClick={handlePreviousMonth}
                        disabled={!canGoToPreviousMonth()}
                        className={`p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF] ${
                          canGoToPreviousMonth() 
                            ? "hover:bg-gray-100 cursor-pointer" 
                            : "cursor-not-allowed opacity-50"
                        }`}
                        aria-label="Mois précédent"
                      >
                        <ChevronLeft className={`w-5 h-5 ${
                          canGoToPreviousMonth() ? "text-gray-700" : "text-gray-400"
                        }`} />
                      </button>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        {monthNames[currentMonth]} {currentYear}
                      </h3>
                      <button
                        onClick={handleNextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                        aria-label="Mois suivant"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {dayNames.map((day, index) => (
                        <div
                          key={day}
                          className="h-6 sm:h-8 flex items-center justify-center text-xs font-bold text-gray-500 uppercase"
                        >
                          <span className="hidden sm:inline">{day}</span>
                          <span className="sm:hidden">{dayNamesMobile[index]}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
                  </div>

                  {selectedDate && (
                    <div className="mt-4 animate-in fade-in slide-in-from-bottom duration-300">
                      <p className="text-xs text-gray-500 mb-3 text-center">Choisissez une période</p>
                      <div className="flex gap-2 sm:gap-3">
                        <button
                          onClick={() => morningAvailable && !isLoadingPeriods && handlePeriodClick("morning")}
                          disabled={!morningAvailable || isLoadingPeriods}
                          className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-semibold  hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isLoadingPeriods
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-wait animate-pulse"
                              : !morningAvailable
                                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                : selectedPeriod === "morning"
                                  ? "bg-[#0066FF] text-white border-[#0066FF] shadow-lg scale-[1.02]"
                                  : "bg-white text-[#0066FF] border-[#0066FF] hover:bg-blue-50 hover:shadow-md focus:ring-[#0066FF]"
                          }`}
                        >
                           Matin {!morningAvailable && !isLoadingPeriods && "(Complet)"}
                        </button>
                        <button
                          onClick={() => afternoonAvailable && !isLoadingPeriods && handlePeriodClick("afternoon")}
                          disabled={!afternoonAvailable || isLoadingPeriods}
                          className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-semibold  hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isLoadingPeriods
                              ? "bg-gray-100 text-gray-400 border-gray-200 cursor-wait animate-pulse"
                              : !afternoonAvailable
                                ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50"
                                : selectedPeriod === "afternoon"
                                  ? "bg-[#0066FF] text-white border-[#0066FF] shadow-lg scale-[1.02]"
                                  : "bg-white text-[#0066FF] border-[#0066FF] hover:bg-blue-50 hover:shadow-md focus:ring-[#0066FF]"
                          }`}
                        >
                           Après-midi {!afternoonAvailable && !isLoadingPeriods && "(Complet)"}
                        </button>
                  </div>
                </div>
                  )}

                </div>

                {(currentStep === 2 || currentStep === 3) && selectedDate && selectedPeriod && (
                  <div className="flex-1 animate-in fade-in slide-in-from-bottom lg:slide-in-from-right duration-500">
                    {/* Titre pour mobile */}
                    <div className="lg:hidden mb-6">
                      <h2 className="text-xl font-bold text-[#0066FF] text-center">
                        {currentStep === 2 ? "Choisissez une période" : "Choisissez un horaire"}
                      </h2>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 capitalize mb-1">
                        {formatSelectedDate()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedPeriod === "morning" ? "Créneaux du matin" : "Créneaux de l'après-midi"}
                      </p>
                    </div>

                    {/* Message informatif sur la règle des 15 minutes - Version desktop */}
                    {selectedDate && isTimeSlotAvailableForBooking("09:00", selectedDate) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-blue-600">
                          Les réservations doivent être faites au moins 15 minutes à l'avance
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 sm:space-y-3 max-h-[400px] lg:max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {isLoadingTimeSlots ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066FF]"></div>
                          <span className="ml-3 text-gray-600">Chargement des créneaux...</span>
                        </div>
                      ) : timeSlots.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Aucun créneau disponible pour cette période
                        </div>
                      ) : (
                        timeSlots.map((slot, index) => (
                        <div key={slot.time} className="animate-in fade-in slide-in-from-bottom" style={{ animationDelay: `${index * 30}ms` }}>
                          {selectedTime === slot.time ? (
                            <div className="flex gap-2 sm:gap-3">
                        <button
                                className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 text-sm sm:text-base font-semibold bg-[#0066FF] text-white border-[#0066FF] shadow-lg scale-[1.02] "
                                disabled
                              >
                                ✓ {slot.time}
                        </button>
                        <Button
                          onClick={handleNextClick}
                                className="flex-1 bg-white text-[#0066FF] border-2 border-[#0066FF] hover:bg-blue-50 hover:shadow-md py-3 sm:py-4 rounded-xl text-sm sm:text-base font-semibold  hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 h-full"
                        >
                          Suivant
                        </Button>
                      </div>
                          ) : (
                        <button
                          onClick={() => slot.available && handleTimeClick(slot.time)}
                          disabled={!slot.available}
                          className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl border-2 text-sm sm:text-base font-semibold  hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            slot.available
                              ? "bg-white text-[#0066FF] border-[#0066FF] hover:bg-blue-50 hover:shadow-md focus:ring-[#0066FF]"
                              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                          }`}
                          aria-label={`Créneau à ${slot.time}${!slot.available ? ' (Réservé)' : ''}`}
                        >
                          {slot.available ? slot.time : `${slot.time} (Réservé)`}
                        </button>
                          )}
                        </div>
                      ))
                      )}
                    </div>

                  </div>
                )}
              </div>
            ) : currentStep === 5 ? (
              <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom duration-500">
                {/* Titre pour mobile */}
                <div className="lg:hidden mb-6">
                  <h2 className="text-xl font-bold text-[#0066FF] text-center">Confirmation</h2>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    Rendez-vous confirmé !
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Votre réservation a été enregistrée avec succès.
                  </p>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-[#0066FF] rounded-full flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Détails de votre rendez-vous</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-[#0066FF]" />
                          <span className="text-sm font-medium text-gray-600">Date</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{formatSelectedDate()}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-[#0066FF]" />
                          <span className="text-sm font-medium text-gray-600">Horaire</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{selectedTime}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-[#0066FF]" />
                          <span className="text-sm font-medium text-gray-600">Période</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{selectedPeriod === "morning" ? "Matin" : "Après-midi"}</p>
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 bg-[#0066FF] rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">P</span>
                          </div>
                          <span className="text-sm font-medium text-gray-600">Patient</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900">{formData.firstName} {formData.lastName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Un email de confirmation vous a été envoyé à <strong>{formData.email}</strong>
                    </p>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm">📧</span>
                        </div>
                        <h4 className="text-sm font-semibold text-green-800">Gestion de votre rendez-vous</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-green-800">Annulation</p>
                            <p className="text-xs text-green-700">Vous pouvez annuler votre rendez-vous via le lien dans l'email</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-green-800">Délai d'annulation</p>
                            <p className="text-xs text-green-700">Annulation possible jusqu'à 24h avant le rendez-vous</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-green-800">Durée de consultation</p>
                            <p className="text-xs text-green-700">Consultation personnalisée d'environ 1h selon vos besoins</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setCurrentStep(1)
                        setSelectedDate(null)
                        setSelectedPeriod(null)
                        setSelectedTime(null)
                        setFormData({
                          firstName: "",
                          lastName: "",
                          email: "",
                          phone: "",
                          firstConsultation: null,
                          consultationReason: "",
                          message: "",
                        })
                      }}
                      className="w-full bg-[#0066FF] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#0052CC] "
                    >
                      Prendre un nouveau rendez-vous
                    </button>
                  </div>
                </div>
              </div>
            ) : currentStep === 6 ? (
              <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom duration-500">
                {/* Titre pour mobile */}
                <div className="lg:hidden mb-6">
                  <h2 className="text-xl font-bold text-[#0066FF] text-center">Erreur</h2>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    Erreur de réservation
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Une erreur s'est produite lors de l'enregistrement de votre rendez-vous.
                  </p>
                  
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                      <div className="flex items-center gap-3 mb-3">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h3 className="text-lg font-semibold text-red-800">Détails de l'erreur</h3>
                      </div>
                      <p className="text-red-700">{submitError}</p>
                    </div>
                  )}
                  
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Que s'est-il passé ?</h3>
                    <p className="text-red-700 text-sm">
                      Il semble qu'il y ait eu un problème de connexion avec nos serveurs. 
                      Votre rendez-vous n'a pas pu être enregistré.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Veuillez réessayer dans quelques instants ou contactez-nous si le problème persiste.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleRetry}
                        disabled={isRetrying}
                        className={`flex-1 py-3 px-6 rounded-xl font-semibold  ${
                          isRetrying
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-[#0066FF] text-white hover:bg-[#0052CC]'
                        }`}
                      >
                        {isRetrying ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Nouvelle tentative...
                          </div>
                        ) : (
                          'Réessayer'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setCurrentStep(1)
                          setSelectedDate(null)
                          setSelectedPeriod(null)
                          setSelectedTime(null)
                          setFormData({
                            firstName: "",
                            lastName: "",
                            email: "",
                            phone: "",
                            firstConsultation: null,
                            consultationReason: "",
                            message: "",
                          })
                        }}
                        className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 "
                      >
                        Recommencer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom duration-500">
                
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-sm font-bold shadow-md">
                        4
                    </div>
                      <span className="text-sm font-medium text-gray-500">Étape 4 sur 4</span>
                    </div>
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#0066FF] bg-blue-50 hover:bg-blue-100 rounded-md "
                    >
                      <ChevronLeft className="w-3 h-3" />
                      Retour
                    </button>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance mb-2">
                    Indiquez vos informations
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Complétez le formulaire pour finaliser votre réservation
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Prénom *</label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => {
                        setFormData({ ...formData, firstName: e.target.value })
                        if (formErrors.firstName) {
                          setFormErrors({ ...formErrors, firstName: "" })
                        }
                      }}
                      className={`w-full h-11 sm:h-12 px-4 rounded-xl border-2 focus:ring-2 focus:ring-offset-2  ${
                        formErrors.firstName 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]'
                      }`}
                      placeholder="Entrez votre prénom"
                    />
                    {formErrors.firstName && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Nom *</label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => {
                        setFormData({ ...formData, lastName: e.target.value })
                        if (formErrors.lastName) {
                          setFormErrors({ ...formErrors, lastName: "" })
                        }
                      }}
                      className={`w-full h-11 sm:h-12 px-4 rounded-xl border-2 focus:ring-2 focus:ring-offset-2  ${
                        formErrors.lastName 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]'
                      }`}
                      placeholder="Entrez votre nom"
                    />
                    {formErrors.lastName && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">E-mail *</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        if (formErrors.email) {
                          setFormErrors({ ...formErrors, email: "" })
                        }
                      }}
                      className={`w-full h-11 sm:h-12 px-4 rounded-xl border-2 focus:ring-2 focus:ring-offset-2  ${
                        formErrors.email 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]'
                      }`}
                      placeholder="exemple@email.com"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">Téléphone *</label>
                    <div className="flex gap-2 sm:gap-3">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="w-16 sm:w-18 h-11 sm:h-12 flex items-center justify-center gap-1 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 "
                        >
                          <span className="text-lg">{selectedCountryData.flag}</span>
                          <ChevronDown className="w-3 h-3 text-gray-500" />
                        </button>
                        
                        {showCountryDropdown && (
                          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                            {countries.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country.code)
                                  setShowCountryDropdown(false)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50  text-left"
                              >
                                <span className="text-lg">{country.flag}</span>
                                <span className="text-sm font-medium text-gray-900">{country.name}</span>
                                <span className="text-sm text-gray-500 ml-auto">{country.phoneCode}</span>
                              </button>
                            ))}
                      </div>
                        )}
                      </div>
                      
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          const phoneValue = e.target.value
                          setFormData({ ...formData, phone: phoneValue })
                          validateField('phone', phoneValue)
                          
                          // Détection automatique du pays
                          const detectedCountry = detectCountryFromPhone(phoneValue)
                          if (detectedCountry !== selectedCountry) {
                            setSelectedCountry(detectedCountry)
                          }
                        }}
                        className={`flex-1 h-11 sm:h-12 px-4 rounded-xl border-2 focus:ring-2 focus:ring-offset-2  ${
                          formErrors.phone 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]'
                        }`}
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.phone}</p>
                    )}
                    <div className="mt-1 text-xs text-gray-500">
                      Code sélectionné : {selectedCountryData.phoneCode}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3">
                      Est-ce une première consultation ? *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2  flex-1 ${
                        formErrors.firstConsultation 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-200 hover:border-[#0066FF] hover:bg-blue-50'
                      }`}>
                        <input
                          type="radio"
                          name="firstConsultation"
                          checked={formData.firstConsultation === true}
                          onChange={() => {
                            setFormData({ ...formData, firstConsultation: true })
                            if (formErrors.firstConsultation) {
                              setFormErrors({ ...formErrors, firstConsultation: "" })
                            }
                          }}
                          className="w-5 h-5 text-[#0066FF] border-gray-300 focus:ring-[#0066FF] focus:ring-offset-2 cursor-pointer"
                        />
                        <span className="text-base font-medium text-gray-900">Oui</span>
                      </label>
                      <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2  flex-1 ${
                        formErrors.firstConsultation 
                          ? 'border-red-300 hover:border-red-400' 
                          : 'border-gray-200 hover:border-[#0066FF] hover:bg-blue-50'
                      }`}>
                        <input
                          type="radio"
                          name="firstConsultation"
                          checked={formData.firstConsultation === false}
                          onChange={() => {
                            setFormData({ ...formData, firstConsultation: false })
                            if (formErrors.firstConsultation) {
                              setFormErrors({ ...formErrors, firstConsultation: "" })
                            }
                          }}
                          className="w-5 h-5 text-[#0066FF] border-gray-300 focus:ring-[#0066FF] focus:ring-offset-2 cursor-pointer"
                        />
                        <span className="text-base font-medium text-gray-900">Non</span>
                      </label>
                    </div>
                    {formErrors.firstConsultation && (
                      <p className="mt-2 text-xs text-red-600">{formErrors.firstConsultation}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Motif de consultation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.consultationReason}
                      onChange={(e) => {
                        const value = e.target.value
                        setFormData({ ...formData, consultationReason: value })
                        validateField('consultationReason', value)
                      }}
                      className={`w-full h-24 px-4 py-3 rounded-xl border-2 focus:ring-2 focus:ring-offset-2 resize-none ${
                        formErrors.consultationReason 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-200 focus:border-[#0066FF] focus:ring-[#0066FF]'
                      }`}
                      placeholder="Décrivez le motif de votre consultation (ex: douleur, suivi médical, bilan de santé, etc.)"
                    />
                    {formErrors.consultationReason && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.consultationReason}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Message (optionnel)
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full h-24 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2  resize-none"
                      placeholder="Ajoutez un message ou des informations supplémentaires..."
                    />
                  </div>

                  <div className="pt-4 sm:pt-6">
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 sm:mb-8 text-pretty">
                      En confirmant ce rendez-vous, vous acceptez nos{" "}
                      <a
                        href="#"
                        className="text-[#0066FF] hover:text-[#0052CC] font-semibold hover:underline "
                      >
                        conditions générales d'utilisation
                      </a>{" "}
                      et notre politique de confidentialité.
                    </p>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#0066FF] to-[#0052CC] hover:from-[#0052CC] hover:to-[#003D99] text-white py-4 sm:py-6 rounded-full text-base sm:text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Enregistrement...
                        </div>
                      ) : (
                        "Confirmer l'événement"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
