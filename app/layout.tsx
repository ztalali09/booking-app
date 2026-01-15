import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cyril-mtc.online"
const siteName = "Cyril Hudelot - Médecine Traditionnelle Chinoise"
const practitionerName = "Cyril Hudelot"
const description = `${practitionerName}, praticien en médecine traditionnelle chinoise depuis 2021. Réservation en ligne pour séances de MTC à domicile dans la région d'Aubagne, La Ciotat, Cassis. Bilan énergétique, techniques de soin adaptées et conseils personnalisés.`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${practitionerName} — Praticien en Médecine Traditionnelle Chinoise | Réservation en ligne`,
    template: `%s | ${practitionerName} - MTC`
  },
  description: description,
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
  authors: [{ name: practitionerName }],
  creator: practitionerName,
  publisher: practitionerName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: siteUrl,
    siteName: siteName,
    title: `${practitionerName} — Praticien en Médecine Traditionnelle Chinoise`,
    description: description,
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `${practitionerName} - Praticien en Médecine Traditionnelle Chinoise`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${practitionerName} — Praticien en Médecine Traditionnelle Chinoise`,
    description: description,
    images: [`${siteUrl}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "Santé & Bien-être",
  classification: "Médecine alternative",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
