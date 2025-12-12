## Présentation du projet

Application de prise de rendez‑vous médicaux conçue pour un cabinet (médecine traditionnelle chinoise). L’objectif est d’offrir une expérience simple et rassurante aux patients tout en automatisant l’organisation côté praticien (synchronisation d’agenda, emails, rappels, annulations).

Le site est responsive (mobile et desktop), rapide, sécurisé et pensé pour réduire au maximum les frictions de réservation et les no‑shows.

## Ce que fait le site

- Réservation en ligne en quelques étapes guidées
- Sélection d’une date, d’une période (matin/après‑midi) puis d’un créneau disponible
- Validation immédiate des règles (ex. pas de réservation < 15 minutes avant)
- Confirmation automatique par email au patient et notification détaillée au praticien
- Synchronisation automatique des rendez‑vous avec Google Calendar (lecture/écriture)
- Rappels automatiques envoyés 24h avant le rendez‑vous
- Lien d’annulation sécurisé (token unique) et respect d’une politique d’annulation (ex. 24h)
- Gestion des créneaux bloqués (absences, congés, indisponibilités)

## Fonctionnalités livrées

- Moteur de disponibilités (dates, périodes, créneaux) avec vérifications côté serveur
- Formulaire patient clair avec contrôles de saisie et messages d’aide
- Emails professionnels (HTML responsive) pour confirmation, rappel et annulation
- Notification enrichie pour le praticien (motif de consultation, message du patient, indicateurs visuels)
- Intégration Google Calendar robuste pour éviter les conflits et centraliser l’agenda
- Système de rappels planifiable (API + script + cron) pour limiter les oublis
- Mesures de sécurité essentielles (validation, limitation de débit, en‑têtes de sécurité)
- Monitoring léger et métriques business/techniques (conversion, créneaux populaires, temps de réponse)
- Base de données fiable avec persistance des réservations
- Scripts de test et de démonstration du flux complet

## Expérience utilisateur (UX)

- Parcours clair en 3 étapes (date → période → créneau → informations → confirmation)
- Design moderne, sobre et rassurant, adapté aux codes du secteur santé/bien‑être
- Lisibilité optimisée sur mobile (prioritaire) et desktop
- Emails lisibles sur tous les appareils (responsive), hiérarchisés et colorimétrie douce

## Choix graphiques

- Style sobre, lumineux et naturel pour inspirer confiance
- Utilisation de composants UI cohérents et accessibles
- Mise en avant des informations essentielles (coordonnées, motif, horaire, actions)

## Choix techniques (vulgarisés)

- Framework web moderne permettant un site rapide et fiable
- Base de données relationnelle pour stocker les rendez‑vous en toute sécurité
- Connexion à Google Calendar pour que le praticien garde ses habitudes d’agenda
- Service d’envoi d’emails avec modèles professionnels
- Système de rappels automatisable chaque jour
- Tests et métriques pour suivre la qualité et les performances

## Principales règles métier (cahier des charges)

- Créneaux standards: matin (9h‑12h) et après‑midi (14h‑17h), pas de doublon
- Délai minimum: impossible de réserver moins de 15 minutes à l’avance
- Politique d’annulation: lien sécurisé avec token unique, délai de prévenance paramétrable (ex. 24h)
- Synchronisation d’agenda: tout rendez‑vous confirmé est ajouté au calendrier du praticien
- Rappels patients: email automatique 24h avant le rendez‑vous
- Champs requis et validations strictes (nom, prénom, email, téléphone, motif)

## Sécurité et conformité

- Validation côté serveur de toutes les données reçues
- Limitation du nombre de requêtes pour éviter les abus (anti‑spam/DDoS)
- En‑têtes de sécurité appliqués globalement (protection XSS, clickjacking, etc.)
- Données sensibles protégées, liens d’annulation non devinables
- Journaux d’activité non sensibles et métriques anonymisées

## Déploiement et maintenance

- Environnement de configuration documenté (emails, calendrier, base de données)
- Scripts d’initialisation et de tests disponibles
- Rappels configurables via un planificateur (cron) ou via une API dédiée
- Monitoring disponible via une route sécurisée pour suivre l’activité et la performance

## Indicateurs clés suivis

- Volume total de réservations et taux de conversion
- Créneaux les plus demandés (heures/jours)
- Temps de réponse moyen des APIs et taux d’erreur
- Suivi des rappels envoyés et des annulations

## Évolutions possibles

- Tableau de bord praticien plus complet (statistiques, filtres, exports)
- Multi‑praticiens / multi‑calendriers
- Notifications supplémentaires (SMS, Telegram) si souhaité
- Personnalisation avancée des modèles d’email
- Mode sombre et options d’accessibilité élargies

## Engagement qualité

Le projet a été livré avec des tests, un monitoring basique, des validations serveur et des protections de sécurité. L’objectif est de fournir une solution simple, stable et évolutive, qui s’intègre naturellement dans l’organisation du cabinet et améliore l’expérience des patients.

Pour le praticien, la gestion quotidienne reste centrée sur Google Calendar. Pour les patients, la réservation est fluide et rassurante, avec des rappels utiles pour réduire les oublis.

## Scénario de réservation (pas‑à‑pas)

1. Le patient arrive sur le site et consulte les informations du cabinet.
2. Il choisit une date disponible dans le calendrier intégré.
3. Il sélectionne une période (matin / après‑midi), puis un créneau proposé.
4. Il renseigne ses informations (nom, email, téléphone, motif, première consultation) avec validation immédiate.
5. Il confirme. La réservation est enregistrée et un email de confirmation lui est envoyé.
6. Le rendez‑vous apparaît automatiquement dans l’agenda Google du praticien.
7. 24h avant, le patient reçoit un email de rappel avec les informations utiles et un lien d’annulation si besoin.

## Côté patient (ce qu’il peut faire)

- Réserver un rendez‑vous en quelques minutes depuis mobile ou ordinateur
- Choisir un créneau réellement disponible (conflits évités automatiquement)
- Recevoir une confirmation par email avec toutes les informations
- Recevoir un rappel 24h avant le rendez‑vous
- Annuler via un lien sécurisé (selon la politique du cabinet)
- Contacter le cabinet via les informations présentes dans les emails

## Côté praticien (ce qu’il voit / reçoit)

- Notification email détaillée à chaque nouvelle réservation (motif, message patient, indicateurs visuels)
- Agenda Google mis à jour automatiquement avec le rendez‑vous
- Possibilité d’annuler un rendez‑vous via l’interface prévue (lien d’annulation médecin) pour informer le patient
- Vue simple (optionnelle) de l’activité du jour si souhaitée
- Rappels et métriques de base pour suivre l’activité

## Côté calendrier (Google Calendar)

- Ajout automatique de chaque rendez‑vous confirmé
- Synchronisation pour éviter les doublons et les conflits de créneaux
- Gestion des indisponibilités via des « créneaux bloqués » (absences, congés)
- Possibilité de déplacer/mettre à jour un rendez‑vous côté calendrier (selon le flux choisi)
- Le calendrier devient l’outil central du praticien, accessible sur mobile et ordinateur

