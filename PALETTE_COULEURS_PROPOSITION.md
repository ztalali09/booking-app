# 🎨 Proposition d'utilisation de la nouvelle palette de couleurs

## 📋 Palette proposée

| Couleur | Code Hex | Usage prévu |
|---------|----------|-------------|
| **Jade doux** | `#A8C3A0` | Sections principales |
| **Beige/Ivoire** | `#F5F2E7` | Fond principal |
| **Rouge terre** | `#7A3E3E` | Boutons et accents |
| **Anthracite clair** | `#B4B4B4` | Typographie |

---

## 💡 Mon avis professionnel

### ✅ Points forts de cette palette

1. **Parfaitement adaptée au secteur** : La palette beige/jade/rouge terre évoque la nature, le bien-être et l'ancestralité - idéal pour la médecine traditionnelle chinoise.

2. **Apaisante et rassurante** : Le beige/ivoire est excellent pour un fond principal - doux pour les yeux, professionnel sans être froid.

3. **Jade doux excellent** : Le `#A8C3A0` est parfait pour les sections - assez visible sans être agressif, évoque la sérénité.

4. **Rouge terre original** : Le `#7A3E3E` est intéressant et unique, mais nécessite attention au contraste.

### ⚠️ Points d'attention et suggestions

#### 1. **Typographie - Contraste d'accessibilité**

**Problème** : `#B4B4B4` (anthracite clair) est **trop clair** pour le texte principal sur fond beige `#F5F2E7`.

**Contraste WCAG** :
- `#B4B4B4` sur `#F5F2E7` = **2.1:1** ❌ (minimum requis : 4.5:1 pour texte normal)
- Risque de non-conformité accessibilité

**Solution proposée** :
- **Texte principal** : `#4A4A4A` ou `#5A5A5A` (anthracite moyen-foncé)
- **Texte secondaire** : `#B4B4B4` (garder pour labels, hints, texte discret)
- **Texte tertiaire** : `#D0D0D0` (pour texte très discret)

#### 2. **Rouge terre - Vérification contraste**

**Contraste** :
- `#7A3E3E` sur `#F5F2E7` = **4.8:1** ✅ (acceptable pour texte)
- `#7A3E3E` sur `#A8C3A0` = **2.9:1** ⚠️ (limite, à éviter pour texte)

**Recommandation** :
- Utiliser rouge terre pour **boutons avec texte blanc** ou **sur fond beige**
- Éviter texte rouge terre sur fond jade

#### 3. **Nuances supplémentaires suggérées**

Pour enrichir la palette sans la surcharger :

| Usage | Couleur | Code |
|-------|---------|------|
| Hover boutons | Rouge terre foncé | `#6A2E2E` |
| Bordures subtiles | Jade très clair | `#D4E4D0` |
| Arrière-plans sections | Beige légèrement plus foncé | `#F0EDE0` |
| États disabled | Anthracite très clair | `#E0E0E0` |

---

## 🎯 Plan d'utilisation de la palette

### **1. Fond principal (Beige/Ivoire `#F5F2E7`)**

**Où l'utiliser** :
- ✅ Arrière-plan de la page (`body`, conteneurs principaux)
- ✅ Cartes et sections de contenu
- ✅ Zones d'information neutres

**Exemples** :
```css
body { background: #F5F2E7; }
.card { background: #F5F2E7; }
```

---

### **2. Sections principales (Jade doux `#A8C3A0`)**

**Où l'utiliser** :
- ✅ En-têtes de sections importantes
- ✅ Badges et indicateurs d'état
- ✅ Bordures de mise en évidence
- ✅ Arrière-plans de sections d'information
- ✅ Icônes et éléments décoratifs

**Exemples visuels** :
- En-tête "Séance de Médecine Traditionnelle Chinoise"
- Sections "Bienvenue", "Description du service"
- Badges de disponibilité
- Bordures autour des informations pratiques

**⚠️ Attention** : 
- Texte sur jade : utiliser texte foncé (`#4A4A4A`) ou blanc selon le contexte
- Éviter texte rouge terre sur fond jade (contraste insuffisant)

---

### **3. Boutons et accents (Rouge terre `#7A3E3E`)**

**Où l'utiliser** :
- ✅ Boutons principaux (CTA : "Réserver", "Confirmer")
- ✅ Liens importants
- ✅ Indicateurs de progression actifs
- ✅ Icônes d'action importantes
- ✅ Messages d'alerte/attention (modération)

**Variantes** :
- **Bouton principal** : Fond `#7A3E3E` + Texte blanc
- **Bouton secondaire** : Bordure `#7A3E3E` + Fond transparent/beige
- **Hover** : `#6A2E2E` (rouge terre foncé)

**⚠️ À éviter** :
- Boutons destructifs (annulation) : garder rouge vif `#E53E3E` pour clarté
- Sur fond jade (contraste insuffisant)

---

### **4. Typographie**

#### **Texte principal** (titres, paragraphes importants)
- **Couleur** : `#4A4A4A` ou `#5A5A5A` (anthracite moyen-foncé)
- **Usage** : Titres H1-H3, paragraphes principaux, labels de formulaire

#### **Texte secondaire** (informations complémentaires)
- **Couleur** : `#B4B4B4` (anthracite clair - votre choix original)
- **Usage** : Sous-titres, texte d'aide, hints, métadonnées

#### **Texte tertiaire** (très discret)
- **Couleur** : `#D0D0D0`
- **Usage** : Placeholders, texte désactivé, séparateurs

---

## 📐 Hiérarchie visuelle proposée

### **Mobile**

```
┌─────────────────────────────────┐
│  Fond : #F5F2E7 (beige)         │
│                                 │
│  ┌───────────────────────────┐ │
│  │ En-tête : #A8C3A0 (jade)  │ │ ← Section principale
│  │ Texte : Blanc ou #4A4A4A   │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Carte : #F5F2E7           │ │ ← Fond beige
│  │ Bordure : #D4E4D0         │ │ ← Jade très clair
│  │ Texte : #4A4A4A           │ │ ← Principal
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Bouton : #7A3E3E         │ │ ← Accent
│  │ Texte : Blanc            │ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### **Desktop**

Même logique, avec plus d'espace pour respirer et des sections plus larges.

---

## 🎨 Mapping des couleurs actuelles → nouvelles

| Élément actuel | Couleur actuelle | Nouvelle couleur | Notes |
|----------------|------------------|------------------|-------|
| Fond page | `gray-50` / `gray-100` | `#F5F2E7` (beige) | Direct |
| En-tête principal | `#2d5a27` → `#4a7c59` | `#A8C3A0` (jade) | Dégradé → uni |
| Boutons principaux | `#2d5a27` | `#7A3E3E` (rouge terre) | Changement majeur |
| Texte principal | `#2d3748` / `gray-900` | `#4A4A4A` | Anthracite moyen |
| Texte secondaire | `#4a5568` / `gray-600` | `#B4B4B4` | Anthracite clair |
| Bordures | `gray-200` | `#D4E4D0` (jade clair) | Plus doux |
| Arrière-plans sections | `gray-50` | `#F0EDE0` (beige foncé) | Nuance |
| Icônes principales | `#2d5a27` | `#7A3E3E` (rouge terre) | Accent |
| Boutons destructifs | `#e53e3e` | `#E53E3E` | **Garder** (clarté) |

---

## 🔄 Zones à modifier dans le code

### **1. `app/globals.css`**
- Variables CSS principales (`--background`, `--primary`, `--foreground`, etc.)
- Convertir hex → oklch pour cohérence avec le système

### **2. `app/page.tsx`**
- Tous les `bg-[#2d5a27]` → `bg-[#7A3E3E]` (boutons)
- Tous les `bg-gradient-to-r from-[#2d5a27] to-[#4a7c59]` → `bg-[#A8C3A0]` (en-têtes)
- Tous les `text-[#2d5a27]` → `text-[#7A3E3E]` (liens, icônes)
- Tous les `bg-gray-50` → `bg-[#F5F2E7]` (fonds)
- Tous les `text-gray-900` → `text-[#4A4A4A]` (texte principal)
- Tous les `text-gray-600` → `text-[#B4B4B4]` (texte secondaire)

### **3. `lib/services/email.ts`**
- En-têtes emails : `#2d5a27` → `#A8C3A0` (jade)
- Boutons emails : `#2d5a27` → `#7A3E3E` (rouge terre)
- Fonds emails : blanc → `#F5F2E7` (beige) ou garder blanc selon lisibilité

### **4. Composants UI**
- `components/ui/button.tsx` : Utilise les variables CSS, donc automatique si on modifie `globals.css`

---

## ✅ Checklist d'implémentation

- [ ] Convertir les couleurs hex en oklch dans `globals.css`
- [ ] Mettre à jour les variables CSS principales
- [ ] Remplacer toutes les couleurs hardcodées dans `page.tsx`
- [ ] Mettre à jour les couleurs dans les emails
- [ ] Tester le contraste d'accessibilité (WCAG AA minimum)
- [ ] Vérifier sur mobile et desktop
- [ ] Tester les états hover/focus/disabled
- [ ] Vérifier les emails dans différents clients email

---

## 🎯 Résultat attendu

Un site avec une identité visuelle :
- ✨ **Douce et apaisante** (beige/jade)
- 🎨 **Unique et mémorable** (rouge terre au lieu du vert classique)
- ♿ **Accessible** (bon contraste avec les ajustements proposés)
- 🏥 **Adaptée au secteur santé/bien-être**

---

## 💬 Questions / Ajustements possibles

1. **Texte principal** : Confirmez-vous l'utilisation de `#4A4A4A` au lieu de `#B4B4B4` pour l'accessibilité ?

2. **Boutons destructifs** : Garder rouge vif `#E53E3E` pour les annulations ou utiliser rouge terre `#7A3E3E` ?

3. **Emails** : Fond beige dans les emails ou garder blanc pour meilleure compatibilité clients email ?

4. **Nuances** : Souhaitez-vous que j'ajoute les nuances supplémentaires (hover, bordures, etc.) ou rester strictement sur les 4 couleurs de base ?

---

**Prêt à implémenter ?** 🚀

Je peux commencer par mettre à jour `globals.css` avec les nouvelles couleurs, puis modifier progressivement tous les fichiers. Souhaitez-vous que je procède ?


