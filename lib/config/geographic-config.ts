// lib/config/geographic-config.ts
// Configuration des restrictions géographiques pour les interventions

/**
 * Zones géographiques autorisées et exclues
 * Le praticien intervient uniquement dans certaines communes autour d'Aubagne
 */

export const GEOGRAPHIC_CONFIG = {
    // Villes autorisées pour les interventions
    allowedCities: [
        { name: "Aubagne", postalCodes: ["13400"] },
        { name: "Cassis", postalCodes: ["13260"] },
        { name: "Roquefort-la-Bédoule", postalCodes: ["13830"] },
        { name: "La Ciotat", postalCodes: ["13600"] },
        { name: "Carnoux-en-Provence", postalCodes: ["13470"] },
    ],

    // Villes explicitement exclues
    excludedCities: [
        "La Cadière-d'Azur",
        "Toulon",
    ],

    // Adresses spécifiques à exclure
    excludedAddresses: [
        "CRS Aubagne",
    ],
}

/**
 * Vérifie si une ville est dans la zone d'intervention
 * @param cityName - Nom de la ville (insensible à la casse)
 * @returns true si la ville est autorisée, false sinon
 */
export function isCityAllowed(cityName: string): boolean {
    const normalizedCity = cityName.trim().toLowerCase()

    // Vérifier si la ville est dans la liste des villes autorisées
    return GEOGRAPHIC_CONFIG.allowedCities.some(
        city => city.name.toLowerCase() === normalizedCity
    )
}

/**
 * Vérifie si un code postal est dans la zone d'intervention
 * @param postalCode - Code postal à vérifier
 * @returns true si le code postal est autorisé, false sinon
 */
export function isPostalCodeAllowed(postalCode: string): boolean {
    const normalizedCode = postalCode.trim()

    return GEOGRAPHIC_CONFIG.allowedCities.some(
        city => city.postalCodes.includes(normalizedCode)
    )
}

/**
 * Vérifie si une ville est explicitement exclue
 * @param cityName - Nom de la ville
 * @returns true si la ville est exclue, false sinon
 */
export function isCityExcluded(cityName: string): boolean {
    const normalizedCity = cityName.trim().toLowerCase()

    return GEOGRAPHIC_CONFIG.excludedCities.some(
        city => city.toLowerCase() === normalizedCity
    )
}

/**
 * Vérifie si une adresse contient une mention exclue
 * @param address - Adresse complète
 * @returns true si l'adresse est exclue, false sinon
 */
export function isAddressExcluded(address: string): boolean {
    const normalizedAddress = address.trim().toLowerCase()

    return GEOGRAPHIC_CONFIG.excludedAddresses.some(
        excluded => normalizedAddress.includes(excluded.toLowerCase())
    )
}

/**
 * Obtient la liste des noms de villes autorisées (pour le formulaire)
 * @returns Liste des noms de villes
 */
export function getAllowedCityNames(): string[] {
    return GEOGRAPHIC_CONFIG.allowedCities.map(city => city.name)
}

/**
 * Valide une localisation complète (ville + adresse optionnelle)
 * @param city - Nom de la ville
 * @param address - Adresse optionnelle
 * @returns Objet avec isValid et message d'erreur éventuel
 */
export function validateLocation(city: string, address?: string): { isValid: boolean; error?: string } {
    // Vérifier si la ville est exclue
    if (isCityExcluded(city)) {
        return {
            isValid: false,
            error: `Désolé, nous n'intervenons pas dans la zone de ${city}. Veuillez sélectionner une ville dans notre zone d'intervention.`
        }
    }

    // Vérifier si la ville est autorisée
    if (!isCityAllowed(city)) {
        return {
            isValid: false,
            error: `Désolé, nous n'intervenons pas à ${city}. Notre zone d'intervention comprend : ${getAllowedCityNames().join(', ')}.`
        }
    }

    // Vérifier si l'adresse est exclue
    if (address && isAddressExcluded(address)) {
        return {
            isValid: false,
            error: `Désolé, nous ne pouvons pas intervenir à cette adresse.`
        }
    }

    return { isValid: true }
}
