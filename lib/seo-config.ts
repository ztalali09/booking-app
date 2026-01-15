// lib/seo-config.ts
// Configuration SEO centralisée pour le site de Cyril Hudelot

export const SEO_CONFIG = {
  siteName: "Cyril Hudelot - Médecine Traditionnelle Chinoise",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://cyril-mtc.online",
  practitionerName: "Cyril Hudelot",
  practitionerAlternateName: "Hudelot Cyril",
  description: "Cyril Hudelot, praticien en médecine traditionnelle chinoise depuis 2021. Réservation en ligne pour séances de MTC à domicile dans la région d'Aubagne, La Ciotat, Cassis. Bilan énergétique, techniques de soin adaptées et conseils personnalisés.",
  keywords: [
    "Cyril Hudelot",
    "Hudelot Cyril",
    "médecine traditionnelle chinoise",
    "MTC",
    "praticien MTC",
    "acupuncteur",
    "médecine chinoise",
    "bilan énergétique",
    "soins énergétiques",
    "massage chinois",
    "moxibustion",
    "diététique chinoise",
    "Aubagne",
    "La Ciotat",
    "Cassis",
    "médecine traditionnelle chinoise Aubagne",
    "MTC La Ciotat",
    "praticien MTC Cassis",
    "réservation MTC",
    "séance MTC",
    "consultation médecine chinoise",
    "soins à domicile",
    "bien-être",
    "équilibre énergétique",
    "médecine holistique"
  ],
  phone: "+33 7 62 37 66 21",
  priceRange: "50€",
  address: {
    locality: "Aubagne",
    region: "Provence-Alpes-Côte d'Azur",
    postalCode: "13400",
    country: "FR"
  },
  areaServed: [
    "Aubagne",
    "La Ciotat",
    "Cassis",
    "Roquefort-la-Bédoule",
    "Carnoux-en-Provence"
  ],
  coordinates: {
    latitude: "43.2928",
    longitude: "5.5707"
  }
}
