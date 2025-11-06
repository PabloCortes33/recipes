# Production-Ready Design System Research Report
## Vue.js Recipe Web Application

**Research Date:** November 5, 2025
**Target:** Modern retro playful aesthetic with organic blob shapes
**Framework:** Vue 3 with Composition API

---

## Table of Contents

1. [Recommended Tech Stack](#1-recommended-tech-stack)
2. [Design Implementation Guide](#2-design-implementation-guide)
3. [Recipe Data Architecture](#3-recipe-data-architecture)
4. [Component Breakdown](#4-component-breakdown)
5. [Docker Configuration Approach](#5-docker-configuration-approach)
6. [Step-by-Step Implementation Roadmap](#6-step-by-step-implementation-roadmap)

---

## 1. RECOMMENDED TECH STACK

### Core Framework & Build Tools

#### Vue 3 + Vite + TypeScript
- **Package:** `vue@^3.5.0` with `vite@^5.0.0`
- **Rationale:** Vue 3 Composition API provides excellent performance and developer experience. Vite offers lightning-fast HMR and optimized production builds.
- **TypeScript:** `typescript@^5.6.0` for type safety and better IDE support

#### Static Site Generation
- **Package:** `vite-ssg@^0.23.0`
- **Rationale:** Maintained by antfu-collective, provides static-site generation for Vue 3 on Vite
- **Features:**
  - Ships with @unhead/vue v2 for document-head management
  - Built-in Critical CSS inlining via beasties package
  - Data fetching at build time (no refetch needed on client)
- **Alternative:** VitePress if content-focused, Nuxt 3 if you need advanced SSR features

### CSS Framework & Styling

#### UnoCSS (Recommended) over Tailwind CSS
- **Package:** `unocss@^0.63.0`
- **Rationale:**
  - **200x faster** than Tailwind's JIT according to benchmarks
  - **87% smaller output** (4.2KB vs 32KB in real-world tests)
  - Isomorphic engine with first-class Vite integration
  - Supports all Tailwind utilities PLUS extras:
    - Variant groups
    - Fluid columns with CSS grid
    - More animations out-of-box
  - Better for Vue 3 projects due to native Vite integration

**Installation:**
```bash
npm install -D unocss
```

**Configuration Example:**
```javascript
// uno.config.ts
import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  theme: {
    colors: {
      // Your blob card colors
      'blob-purple': '#8B5CF6',
      'blob-green': '#10B981',
      'blob-orange': '#F97316',
      'blob-coral': '#FB7185',
    }
  }
})
```

### Typography System

#### Google Fonts - Modern Retro Pairing

**Recommended Pairing:**
- **Title/Display:** `Abril Fatface` or `Montagu Slab`
- **Body Text:** `Inter` (variable font) or `Work Sans`

**Rationale:**
- **Abril Fatface:** Bold, elegant, slightly condensed - perfect for recipe titles
- **Montagu Slab:** Chunky, friendly slab serif with retro charm
- **Inter:** Highly readable variable font designed for screens (performance benefit)
- **Work Sans:** Versatile sans-serif optimized for on-screen reading

**Alternative Bold Serifs (Cooper Black style):**
- **Fredoka One:** Bold, rounded, playful for headlines
- **DM Serif Display:** Elegant, high-contrast, 70s vibe

**Implementation:**
```html
<!-- index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300..700&display=swap" rel="stylesheet">
```

```css
/* CSS Custom Properties */
:root {
  --font-display: 'Abril Fatface', serif;
  --font-body: 'Inter', sans-serif;
}
```

### Icon Libraries

#### Lucide Icons (Recommended)
- **Package:** `lucide-vue-next@^0.460.0`
- **Rationale:**
  - 850+ clean, consistent icons
  - Community fork of Feather Icons with more options
  - Perfect mono-line style (3-5px stroke weight)
  - Excellent Vue 3 support
  - Tree-shakeable (import only what you use)

**Installation:**
```bash
npm install lucide-vue-next
```

**Usage:**
```vue
<script setup>
import { ChefHat, Clock, Users } from 'lucide-vue-next'
</script>

<template>
  <ChefHat :size="24" :stroke-width="2.5" />
  <Clock :size="20" color="#8B5CF6" />
</template>
```

**Alternatives:**
- **Heroicons** (`@heroicons/vue@^2.2.0`): By Tailwind team, clean modern style
- **Phosphor Icons** (`@phosphor-icons/vue@^2.2.0`): Six weights (Thin to Bold)
- **Custom Food Icons:** Supplement with Flaticon/The Noun Project SVGs for specialty food icons

### Layout & Grid Systems

#### Masonry Layout for Recipe Cards
- **Package:** `@yeger/vue-masonry-wall@^4.1.1`
- **Rationale:**
  - Responsive masonry layout for Vue 3
  - No dependencies
  - Perfect for Pinterest-style recipe card grids
  - Handles different card heights elegantly

**Installation:**
```bash
npm install @yeger/vue-masonry-wall
```

**Alternative:** CSS Grid with `grid-auto-rows` and `grid-auto-flow: dense` for native solution

### Animation Libraries

#### VueUse Motion (Recommended)
- **Package:** `@vueuse/motion@^2.2.0`
- **Rationale:**
  - Part of VueUse ecosystem
  - Declarative animations inspired by Framer Motion
  - Perfect for card hover/flip effects
  - Lightweight and Vue 3 Composition API native

**Installation:**
```bash
npm install @vueuse/motion
```

**Usage:**
```vue
<template>
  <div v-motion
    :initial="{ opacity: 0, y: 100 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }">
    <RecipeCard />
  </div>
</template>
```

**For Complex Animations:**
- **GSAP** (`gsap@^3.12.0`): Professional-grade for card flips and complex sequences

### State Management & Utilities

#### Pinia
- **Package:** `pinia@^2.2.0`
- **Rationale:** Official Vue 3 state management, replaces Vuex

#### VueUse
- **Package:** `@vueuse/core@^11.0.0`
- **Rationale:** Collection of essential Vue Composition API utilities
  - `useLocalStorage` for saved recipes
  - `useIntersectionObserver` for lazy loading
  - `useDebounce` for search input

### Image Optimization

#### Built-in Vite Image Optimization
- **Package:** `vite-plugin-imagemin@^0.6.1`
- **Rationale:** Compress images during build

```bash
npm install -D vite-plugin-imagemin
```

**Modern Formats:**
- Serve WebP/AVIF with fallbacks
- Use `loading="lazy"` attribute on all recipe images
- Implement responsive images with `srcset`

---

## 2. DESIGN IMPLEMENTATION GUIDE

### Creating Organic Blob Shapes

#### Method 1: SVG Blobs (Recommended for Cards)

**Tools:**
1. **Blobmaker** (https://www.blobmaker.app/)
   - Simple, random organic shapes
   - Download as SVG
   - Control complexity and uniqueness

2. **Haikei** (https://haikei.app/)
   - Advanced generator
   - More shape options
   - Export SVG/PNG

3. **ssshape** (https://fffuel.co/ssshape/)
   - Draw points and smooth
   - Precise control

**Implementation for Cards:**

```vue
<!-- BlobCard.vue -->
<template>
  <div class="blob-card-wrapper">
    <svg class="blob-border" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path
        :d="blobPath"
        fill="white"
        stroke="white"
        stroke-width="8"
      />
    </svg>
    <div class="blob-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
// Blob path from generator
const blobPath = `M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,73.1,42.3C64.8,55.5,53.8,67.3,40.3,73.9C26.8,80.5,10.8,81.9,-4.3,79.2C-19.4,76.5,-33.6,69.7,-45.2,61.2C-56.8,52.7,-65.8,42.5,-71.5,30.7C-77.2,18.9,-79.6,5.4,-78.1,-7.5C-76.6,-20.4,-71.2,-32.7,-63.2,-43.4C-55.2,-54.1,-44.6,-63.2,-32.8,-71.6C-21,-80,-10.5,-87.7,1.7,-90.5C13.9,-93.3,30.6,-83.6,44.7,-76.4Z`
</script>

<style scoped>
.blob-card-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.blob-border {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
}

.blob-content {
  position: absolute;
  inset: 8%;
  display: flex;
  flex-direction: column;
  padding: 2rem;
  overflow: hidden;
}
</style>
```

#### Method 2: CSS clip-path (Simpler, Less Flexible)

**Tools:**
- **Clippy** (https://bennettfeely.com/clippy/)
- **CSS Portal Clip-Path Generator** (https://www.cssportal.com/css-clip-path-generator/)

**Implementation:**

```vue
<style>
.blob-card {
  background: white;
  padding: 2rem;
  clip-path: polygon(
    30% 0%, 70% 0%, 100% 30%,
    100% 70%, 70% 100%, 30% 100%,
    0% 70%, 0% 30%
  );
}

/* For border effect, use nested approach */
.blob-card-bordered {
  background: white;
  padding: 8px;
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}

.blob-card-inner {
  background: var(--card-color);
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
  padding: 2rem;
}
</style>
```

### Color System Implementation

**UnoCSS Configuration:**

```javascript
// uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      // Primary blob colors
      'blob': {
        purple: '#8B5CF6',
        green: '#10B981',
        orange: '#F97316',
        coral: '#FB7185',
        yellow: '#FBBF24',
        blue: '#3B82F6',
      },
      // Background colors
      'bg': {
        cream: '#FFF8E7',
        light: '#F9FAFB',
      }
    }
  }
})
```

**Usage in Components:**

```vue
<div class="bg-blob-purple text-white rounded-2xl p-6">
  <h2 class="font-display text-4xl">Recipe Title</h2>
</div>
```

### Typography System

**CSS Custom Properties:**

```css
/* styles/typography.css */
:root {
  /* Font Families */
  --font-display: 'Abril Fatface', serif;
  --font-body: 'Inter', sans-serif;

  /* Font Sizes - Fluid Scale */
  --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
  --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  --text-lg: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  --text-xl: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  --text-2xl: clamp(1.5rem, 1.3rem + 1vw, 2rem);
  --text-3xl: clamp(1.875rem, 1.6rem + 1.375vw, 2.5rem);
  --text-4xl: clamp(2.25rem, 1.9rem + 1.75vw, 3rem);

  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}

.font-display {
  font-family: var(--font-display);
  line-height: var(--leading-tight);
  font-weight: 700;
}

.font-body {
  font-family: var(--font-body);
  line-height: var(--leading-normal);
}
```

### Hand-Drawn Illustrations

**Approach 1: Use Lucide Icons with Custom Styling**

```vue
<template>
  <ChefHat
    :size="48"
    :stroke-width="3"
    class="text-blob-purple animate-bounce-slow"
  />
</template>

<style>
.animate-bounce-slow {
  animation: bounce 2s ease-in-out infinite;
}
</style>
```

**Approach 2: Custom SVG Illustrations**

Create hand-drawn style SVGs with:
- 3-5px stroke width
- Rounded line caps and joins
- Simple, playful shapes
- Store in `/src/assets/illustrations/`

```vue
<!-- components/illustrations/CookingPot.vue -->
<template>
  <svg viewBox="0 0 100 100" class="illustration">
    <path
      d="M20,40 Q20,25 35,25 L65,25 Q80,25 80,40 L80,70 Q80,85 65,85 L35,85 Q20,85 20,70 Z"
      fill="none"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <!-- Add steam lines, handle, etc. -->
  </svg>
</template>
```

### Dual-Card System

**Title Card + Instruction Card Pattern:**

```vue
<!-- RecipeDualCard.vue -->
<template>
  <div class="recipe-dual-card">
    <!-- Title Card -->
    <BlobCard
      :color="titleColor"
      class="title-card"
      @click="showInstructions = !showInstructions"
    >
      <h2 class="font-display text-4xl text-white">{{ recipe.name }}</h2>
      <div class="recipe-meta">
        <div class="meta-item">
          <Clock :size="20" />
          <span>{{ recipe.cookTime }}</span>
        </div>
        <div class="meta-item">
          <Users :size="20" />
          <span>{{ recipe.servings }}</span>
        </div>
      </div>
      <RecipeIllustration :type="recipe.category" />
    </BlobCard>

    <!-- Instruction Card (slides in or flips) -->
    <Transition name="flip">
      <BlobCard
        v-if="showInstructions"
        color="white"
        class="instruction-card"
      >
        <h3 class="font-display text-2xl mb-4">Instructions</h3>
        <div class="steps-grid">
          <div
            v-for="(step, index) in recipe.steps"
            :key="index"
            class="step-item"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <p class="font-body text-sm">{{ step }}</p>
          </div>
        </div>
      </BlobCard>
    </Transition>
  </div>
</template>

<style scoped>
.recipe-dual-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.flip-enter-active,
.flip-leave-active {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-enter-from {
  transform: rotateY(90deg);
}

.flip-leave-to {
  transform: rotateY(-90deg);
}
</style>
```

---

## 3. RECIPE DATA ARCHITECTURE

### Recommended File Format: YAML with Frontmatter

**Rationale:**
- Human-readable and editable
- Supports comments (great for recipe notes)
- Cleaner than JSON for manual editing
- Perfect for file-based CMS approach
- Compatible with Schema.org standards

### Folder Structure

```
/recipes
├── /appetizers
│   ├── bruschetta.yml
│   ├── spring-rolls.yml
│   └── _category.yml
├── /main-courses
│   ├── /chicken
│   │   ├── roasted-chicken.yml
│   │   ├── chicken-curry.yml
│   │   └── _category.yml
│   ├── /beef
│   │   └── beef-stew.yml
│   └── /vegetarian
│       └── pasta-primavera.yml
├── /desserts
│   ├── chocolate-cake.yml
│   ├── tiramisu.yml
│   └── _category.yml
├── /side-dishes
│   └── roasted-vegetables.yml
└── /_meta
    ├── categories.json
    ├── tags.json
    ├── cuisines.json
    └── dietary-restrictions.json
```

### Recipe Schema (YAML Example)

**File: `/recipes/main-courses/chicken/roasted-chicken.yml`**

```yaml
# Schema.org/Recipe Compliant
# Recipe Metadata
id: roasted-chicken-001
slug: perfect-roasted-chicken
lang: en-US
status: published # draft, published, archived

# Basic Information
name: "Perfect Roasted Chicken"
alternativeName: "Classic Sunday Roast Chicken"
author:
  name: "Pablo Cortés"
  email: "pablo@example.com"
datePublished: "2025-11-05"
dateModified: "2025-11-05"
description: "A simple and delicious roasted chicken recipe with crispy skin and juicy meat. Perfect for Sunday dinner or meal prep."

# Categorization
recipeCategory: "Main Course"
recipeCuisine: "American"
keywords:
  - chicken
  - roasted
  - dinner
  - comfort-food
  - easy

# Custom Tags for Filtering
tags:
  - family-friendly
  - meal-prep
  - weekend-cooking
difficulty: "Easy" # Easy, Medium, Hard
season: # Optional
  - fall
  - winter

# Dietary & Allergen Information
suitableForDiet:
  - GlutenFreeDiet
  - LowCarbohydrateDiet
dietaryRestrictions: []
allergens: []
isVegetarian: false
isVegan: false

# Timing (ISO 8601 Duration Format)
prepTime: "PT20M" # 20 minutes
cookTime: "PT1H30M" # 1 hour 30 minutes
totalTime: "PT1H50M" # 1 hour 50 minutes
restTime: "PT10M" # Optional: resting time

# Servings
recipeYield: "4 servings"
servings: 4

# Equipment Needed
recipeEquipment:
  - "Roasting pan"
  - "Meat thermometer"
  - "Kitchen twine"

# Visual Assets
image:
  main: "/images/recipes/roasted-chicken-main.jpg"
  thumbnail: "/images/recipes/roasted-chicken-thumb.jpg"
  gallery:
    - "/images/recipes/roasted-chicken-01.jpg"
    - "/images/recipes/roasted-chicken-02.jpg"
    - "/images/recipes/roasted-chicken-03.jpg"
imageAlt: "Golden roasted chicken on a white platter with herbs"

# Design System Properties
card:
  color: "orange" # blob-orange color theme
  illustration: "chicken" # which illustration SVG to use

# Ingredients (Schema.org format)
recipeIngredient:
  - name: "whole chicken"
    amount: "1"
    unit: "piece"
    weight: "4 lbs"
    note: "about 1.8 kg"
  - name: "olive oil"
    amount: "1"
    unit: "tablespoon"
    note: ""
  - name: "kosher salt"
    amount: "1"
    unit: "teaspoon"
  - name: "black pepper"
    amount: "0.5"
    unit: "teaspoon"
    note: "freshly ground"
  - name: "garlic cloves"
    amount: "4"
    unit: "piece"
    note: "peeled"
  - name: "fresh thyme"
    amount: "3"
    unit: "sprigs"
    note: "or rosemary"
  - name: "lemon"
    amount: "1"
    unit: "piece"
    note: "halved"

# Instructions (Schema.org HowToStep format)
recipeInstructions:
  - type: "HowToStep"
    position: 1
    name: "Preheat"
    text: "Preheat oven to 425°F (220°C)."
    image: "/images/steps/roasted-chicken-step-1.jpg"

  - type: "HowToStep"
    position: 2
    name: "Prep the chicken"
    text: "Pat the chicken dry with paper towels. Remove giblets if included."
    tip: "Dry skin is the secret to crispy skin!"

  - type: "HowToStep"
    position: 3
    name: "Season"
    text: "Rub the chicken all over with olive oil. Season generously with salt and pepper, inside and out."

  - type: "HowToStep"
    position: 4
    name: "Stuff cavity"
    text: "Stuff the cavity with garlic cloves, thyme, and lemon halves."

  - type: "HowToStep"
    position: 5
    name: "Truss"
    text: "Tie the legs together with kitchen twine. Tuck wing tips under."
    video: "/videos/how-to-truss-chicken.mp4" # optional

  - type: "HowToStep"
    position: 6
    name: "Roast"
    text: "Place in roasting pan and roast for 1 hour and 30 minutes, or until internal temperature reaches 165°F (74°C) in the thickest part of the thigh."

  - type: "HowToStep"
    position: 7
    name: "Rest"
    text: "Remove from oven and let rest for 10 minutes before carving."

# Recipe Tips & Notes
recipeNotes:
  - "For extra crispy skin, let the chicken air-dry uncovered in the refrigerator for 2-24 hours before roasting."
  - "Save the bones for homemade chicken stock!"
  - "Leftovers keep well in the fridge for 3-4 days."

# Nutrition Information (Schema.org/NutritionInformation)
nutrition:
  servingSize: "1/4 chicken"
  calories: "500 kcal"
  proteinContent: "45 g"
  fatContent: "30 g"
  saturatedFatContent: "8 g"
  carbohydrateContent: "2 g"
  fiberContent: "0 g"
  sugarContent: "0 g"
  sodiumContent: "600 mg"
  cholesterolContent: "140 mg"

# User Engagement (for future features)
aggregateRating:
  ratingValue: 4.8
  ratingCount: 247
  reviewCount: 89

# Related Recipes
relatedRecipes:
  - "garlic-mashed-potatoes"
  - "roasted-vegetables"
  - "chicken-stock"

# Variations
variations:
  - name: "Herb Butter Roasted Chicken"
    description: "Use herb butter under the skin instead of oil"
  - name: "Spicy Roasted Chicken"
    description: "Add paprika and cayenne to the seasoning"
```

### Category Metadata File

**File: `/recipes/main-courses/_category.yml`**

```yaml
id: main-courses
name: "Main Courses"
slug: main-courses
description: "Hearty dishes perfect for lunch or dinner"
icon: "utensils"
color: "blob-orange"
order: 2
```

### Global Metadata Files

**File: `/recipes/_meta/categories.json`**

```json
{
  "categories": [
    {
      "id": "appetizers",
      "name": "Appetizers",
      "slug": "appetizers",
      "color": "blob-green",
      "icon": "cheese"
    },
    {
      "id": "main-courses",
      "name": "Main Courses",
      "slug": "main-courses",
      "color": "blob-orange",
      "icon": "utensils"
    },
    {
      "id": "desserts",
      "name": "Desserts",
      "slug": "desserts",
      "color": "blob-coral",
      "icon": "ice-cream"
    },
    {
      "id": "side-dishes",
      "name": "Side Dishes",
      "slug": "side-dishes",
      "color": "blob-purple",
      "icon": "salad"
    }
  ]
}
```

**File: `/recipes/_meta/tags.json`**

```json
{
  "tags": [
    { "id": "quick", "name": "Quick & Easy", "type": "time" },
    { "id": "family-friendly", "name": "Family Friendly", "type": "audience" },
    { "id": "meal-prep", "name": "Meal Prep", "type": "usage" },
    { "id": "comfort-food", "name": "Comfort Food", "type": "style" },
    { "id": "healthy", "name": "Healthy", "type": "dietary" },
    { "id": "budget", "name": "Budget-Friendly", "type": "economic" }
  ]
}
```

### Recipe Loading Utility

**File: `/src/utils/recipeLoader.ts`**

```typescript
import { parse as parseYAML } from 'yaml'
import type { Recipe } from '@/types/recipe'

export async function loadRecipe(path: string): Promise<Recipe> {
  const response = await fetch(path)
  const yamlContent = await response.text()
  const recipe = parseYAML(yamlContent) as Recipe

  return recipe
}

export async function loadAllRecipes(): Promise<Recipe[]> {
  // Use Vite's glob import feature
  const recipeFiles = import.meta.glob('/recipes/**/*.yml', { as: 'raw' })

  const recipes = await Promise.all(
    Object.entries(recipeFiles).map(async ([path, loader]) => {
      const content = await loader()
      return parseYAML(content) as Recipe
    })
  )

  // Filter out _category.yml and _meta files
  return recipes.filter(r => r.id && r.slug)
}

export async function loadRecipesByCategory(category: string): Promise<Recipe[]> {
  const allRecipes = await loadAllRecipes()
  return allRecipes.filter(r => r.recipeCategory === category)
}

export async function loadRecipesByTag(tag: string): Promise<Recipe[]> {
  const allRecipes = await loadAllRecipes()
  return allRecipes.filter(r => r.tags?.includes(tag))
}
```

### TypeScript Types

**File: `/src/types/recipe.ts`**

```typescript
export interface Recipe {
  // Identifiers
  id: string
  slug: string
  lang: string
  status: 'draft' | 'published' | 'archived'

  // Basic Info
  name: string
  alternativeName?: string
  author: {
    name: string
    email?: string
  }
  datePublished: string
  dateModified: string
  description: string

  // Categorization
  recipeCategory: string
  recipeCuisine: string
  keywords: string[]
  tags?: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  season?: string[]

  // Dietary
  suitableForDiet?: string[]
  dietaryRestrictions?: string[]
  allergens?: string[]
  isVegetarian: boolean
  isVegan: boolean

  // Timing
  prepTime: string // ISO 8601
  cookTime: string
  totalTime: string
  restTime?: string

  // Servings
  recipeYield: string
  servings: number

  // Equipment
  recipeEquipment?: string[]

  // Visual
  image: {
    main: string
    thumbnail: string
    gallery?: string[]
  }
  imageAlt: string

  // Design
  card: {
    color: string
    illustration: string
  }

  // Recipe Content
  recipeIngredient: Ingredient[]
  recipeInstructions: RecipeStep[]
  recipeNotes?: string[]

  // Nutrition
  nutrition?: NutritionInfo

  // Engagement
  aggregateRating?: {
    ratingValue: number
    ratingCount: number
    reviewCount: number
  }

  // Relations
  relatedRecipes?: string[]
  variations?: Variation[]
}

export interface Ingredient {
  name: string
  amount: string
  unit: string
  weight?: string
  note?: string
}

export interface RecipeStep {
  type: 'HowToStep'
  position: number
  name: string
  text: string
  image?: string
  video?: string
  tip?: string
}

export interface NutritionInfo {
  servingSize: string
  calories: string
  proteinContent: string
  fatContent: string
  saturatedFatContent?: string
  carbohydrateContent: string
  fiberContent?: string
  sugarContent?: string
  sodiumContent?: string
  cholesterolContent?: string
}

export interface Variation {
  name: string
  description: string
}
```

---

## 4. COMPONENT BREAKDOWN

### Component Hierarchy

```
App.vue
├── layouts/
│   ├── DefaultLayout.vue
│   └── RecipeDetailLayout.vue
├── views/
│   ├── HomeView.vue
│   ├── RecipeGridView.vue
│   ├── RecipeDetailView.vue
│   └── SearchView.vue
└── components/
    ├── recipe/
    │   ├── RecipeCard.vue (Title card)
    │   ├── RecipeCardFlip.vue (Dual-card with flip)
    │   ├── RecipeGrid.vue
    │   ├── RecipeDetail.vue
    │   ├── IngredientList.vue
    │   ├── InstructionSteps.vue
    │   └── RecipeMeta.vue
    ├── ui/
    │   ├── BlobCard.vue (Base blob shape component)
    │   ├── BlobButton.vue
    │   ├── BlobTag.vue
    │   └── BlobAvatar.vue
    ├── illustrations/
    │   ├── CookingPot.vue
    │   ├── ChefHat.vue
    │   ├── Utensils.vue
    │   └── FoodItems.vue
    ├── search/
    │   ├── SearchBar.vue
    │   ├── FilterPanel.vue
    │   └── SortDropdown.vue
    └── common/
        ├── TheHeader.vue
        ├── TheFooter.vue
        ├── TheSidebar.vue
        └── LoadingSpinner.vue
```

### Key Components Implementation

#### 1. BlobCard.vue (Base Component)

```vue
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  color?: string
  borderWidth?: number
  shadow?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'white',
  borderWidth: 8,
  shadow: true,
  clickable: false
})

const emit = defineEmits(['click'])

// Generate unique blob shape (or use pre-defined shapes)
const blobPath = computed(() => {
  // Return SVG path data
  return "M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,73.1,42.3C64.8,55.5,53.8,67.3,40.3,73.9C26.8,80.5,10.8,81.9,-4.3,79.2C-19.4,76.5,-33.6,69.7,-45.2,61.2C-56.8,52.7,-65.8,42.5,-71.5,30.7C-77.2,18.9,-79.6,5.4,-78.1,-7.5C-76.6,-20.4,-71.2,-32.7,-63.2,-43.4C-55.2,-54.1,-44.6,-63.2,-32.8,-71.6C-21,-80,-10.5,-87.7,1.7,-90.5C13.9,-93.3,30.6,-83.6,44.7,-76.4Z"
})

const cardClass = computed(() => ({
  'blob-card': true,
  'blob-card-clickable': props.clickable,
  'blob-card-shadow': props.shadow
}))

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<template>
  <div
    :class="cardClass"
    @click="handleClick"
  >
    <svg
      class="blob-svg"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        :d="blobPath"
        :fill="color"
        stroke="white"
        :stroke-width="borderWidth"
      />
    </svg>
    <div class="blob-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.blob-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  transition: transform 0.3s ease;
}

.blob-card-clickable {
  cursor: pointer;
}

.blob-card-clickable:hover {
  transform: translateY(-4px);
}

.blob-card-shadow .blob-svg {
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
}

.blob-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: filter 0.3s ease;
}

.blob-card-clickable:hover .blob-svg {
  filter: drop-shadow(0 15px 40px rgba(0, 0, 0, 0.2));
}

.blob-content {
  position: absolute;
  inset: 10%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.5rem;
  z-index: 1;
}
</style>
```

#### 2. RecipeCard.vue (Title Card)

```vue
<script setup lang="ts">
import { Clock, Users } from 'lucide-vue-next'
import BlobCard from '@/components/ui/BlobCard.vue'
import type { Recipe } from '@/types/recipe'

interface Props {
  recipe: Recipe
}

const props = defineProps<Props>()

const emit = defineEmits(['view-details'])

// Get color from recipe card config
const cardColor = computed(() => props.recipe.card?.color || 'blob-orange')

// Parse ISO 8601 duration to readable format
const formatTime = (duration: string) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?/)
  if (!match) return duration

  const hours = match[1] ? parseInt(match[1]) : 0
  const minutes = match[2] ? parseInt(match[2]) : 0

  if (hours && minutes) return `${hours}h ${minutes}m`
  if (hours) return `${hours}h`
  return `${minutes}m`
}
</script>

<template>
  <BlobCard
    :color="`var(--color-${cardColor})`"
    clickable
    @click="emit('view-details', recipe)"
  >
    <div class="recipe-card-content">
      <!-- Category Badge -->
      <div class="category-badge">
        {{ recipe.recipeCategory }}
      </div>

      <!-- Recipe Title -->
      <h3 class="recipe-title font-display">
        {{ recipe.name }}
      </h3>

      <!-- Meta Information -->
      <div class="recipe-meta">
        <div class="meta-item">
          <Clock :size="18" :stroke-width="2.5" />
          <span>{{ formatTime(recipe.totalTime) }}</span>
        </div>
        <div class="meta-item">
          <Users :size="18" :stroke-width="2.5" />
          <span>{{ recipe.servings }}</span>
        </div>
      </div>

      <!-- Difficulty Badge -->
      <div class="difficulty-badge" :class="`difficulty-${recipe.difficulty.toLowerCase()}`">
        {{ recipe.difficulty }}
      </div>

      <!-- Illustration (if available) -->
      <component
        v-if="recipe.card?.illustration"
        :is="`${recipe.card.illustration}-illustration`"
        class="recipe-illustration"
      />
    </div>
  </BlobCard>
</template>

<style scoped>
.recipe-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: white;
}

.category-badge {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  width: fit-content;
  backdrop-filter: blur(10px);
}

.recipe-title {
  font-size: var(--text-2xl);
  margin: 1rem 0;
  line-height: var(--leading-tight);
  flex-grow: 1;
}

.recipe-meta {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--text-sm);
  font-weight: 500;
}

.difficulty-badge {
  font-size: var(--text-xs);
  font-weight: 600;
  padding: 0.375rem 1rem;
  border-radius: 1rem;
  width: fit-content;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.recipe-illustration {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 80px;
  height: 80px;
  opacity: 0.3;
}
</style>
```

#### 3. RecipeGrid.vue (Masonry Layout)

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MasonryWall } from '@yeger/vue-masonry-wall'
import RecipeCard from '@/components/recipe/RecipeCard.vue'
import type { Recipe } from '@/types/recipe'

interface Props {
  recipes: Recipe[]
  columns?: number
  gap?: number
}

const props = withDefaults(defineProps<Props>(), {
  columns: 3,
  gap: 24
})

// Responsive columns
const columnCount = computed(() => {
  if (window.innerWidth < 640) return 1
  if (window.innerWidth < 1024) return 2
  return props.columns
})

const handleViewDetails = (recipe: Recipe) => {
  // Navigate to recipe detail page
  router.push(`/recipe/${recipe.slug}`)
}
</script>

<template>
  <MasonryWall
    :items="recipes"
    :column-width="300"
    :gap="gap"
    class="recipe-grid"
  >
    <template #default="{ item: recipe }">
      <RecipeCard
        :recipe="recipe"
        @view-details="handleViewDetails"
      />
    </template>
  </MasonryWall>
</template>

<style scoped>
.recipe-grid {
  padding: 2rem 0;
}
</style>
```

#### 4. SearchBar.vue with Composable

**Composable: `/src/composables/useRecipeFilter.ts`**

```typescript
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { Recipe } from '@/types/recipe'

export function useRecipeFilter(recipes: Ref<Recipe[]>) {
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)
  const selectedTags = ref<string[]>([])
  const selectedDifficulty = ref<string | null>(null)
  const sortBy = ref<'name' | 'date' | 'time' | 'rating'>('date')

  // Debounced search
  const debouncedSearch = useDebounceFn((query: string) => {
    searchQuery.value = query
  }, 300)

  // Filtered recipes
  const filteredRecipes = computed(() => {
    let result = recipes.value

    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(recipe =>
        recipe.name.toLowerCase().includes(query) ||
        recipe.description.toLowerCase().includes(query) ||
        recipe.keywords.some(k => k.toLowerCase().includes(query))
      )
    }

    // Category filter
    if (selectedCategory.value) {
      result = result.filter(recipe =>
        recipe.recipeCategory === selectedCategory.value
      )
    }

    // Tags filter
    if (selectedTags.value.length > 0) {
      result = result.filter(recipe =>
        selectedTags.value.some(tag => recipe.tags?.includes(tag))
      )
    }

    // Difficulty filter
    if (selectedDifficulty.value) {
      result = result.filter(recipe =>
        recipe.difficulty === selectedDifficulty.value
      )
    }

    // Sorting
    result = [...result].sort((a, b) => {
      switch (sortBy.value) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'date':
          return new Date(b.datePublished).getTime() - new Date(a.datePublished).getTime()
        case 'time':
          return parseDuration(a.totalTime) - parseDuration(b.totalTime)
        case 'rating':
          return (b.aggregateRating?.ratingValue || 0) - (a.aggregateRating?.ratingValue || 0)
        default:
          return 0
      }
    })

    return result
  })

  // Helper function to parse ISO 8601 duration
  const parseDuration = (duration: string): number => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/)
    if (!match) return 0
    const hours = match[1] ? parseInt(match[1]) * 60 : 0
    const minutes = match[2] ? parseInt(match[2]) : 0
    return hours + minutes
  }

  return {
    searchQuery,
    selectedCategory,
    selectedTags,
    selectedDifficulty,
    sortBy,
    filteredRecipes,
    debouncedSearch
  }
}
```

**Component: `/src/components/search/SearchBar.vue`**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Search, X } from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Search recipes...'
})

const emit = defineEmits(['update:modelValue', 'clear'])

const inputRef = ref<HTMLInputElement | null>(null)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}
</script>

<template>
  <div class="search-bar">
    <Search class="search-icon" :size="20" />
    <input
      ref="inputRef"
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      class="search-input"
      @input="handleInput"
    />
    <button
      v-if="modelValue"
      class="clear-button"
      @click="handleClear"
      aria-label="Clear search"
    >
      <X :size="18" />
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 2rem;
  padding: 0.75rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
}

.search-bar:focus-within {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.12);
}

.search-icon {
  color: #9CA3AF;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  margin-left: 0.75rem;
  font-size: var(--text-base);
  font-family: var(--font-body);
  color: #1F2937;
}

.search-input::placeholder {
  color: #9CA3AF;
}

.clear-button {
  background: #F3F4F6;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
}

.clear-button:hover {
  background: #E5E7EB;
}
</style>
```

#### 5. InstructionSteps.vue (3x2 Grid Layout)

```vue
<script setup lang="ts">
import type { RecipeStep } from '@/types/recipe'

interface Props {
  steps: RecipeStep[]
  layout?: 'grid' | 'list'
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'grid'
})
</script>

<template>
  <div :class="`instructions-${layout}`">
    <div
      v-for="step in steps"
      :key="step.position"
      class="instruction-step"
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :visible="{
        opacity: 1,
        y: 0,
        transition: {
          delay: step.position * 100
        }
      }"
    >
      <!-- Step Number Blob -->
      <div class="step-number">
        {{ step.position }}
      </div>

      <!-- Step Content -->
      <div class="step-content">
        <h4 v-if="step.name" class="step-name font-display">
          {{ step.name }}
        </h4>
        <p class="step-text font-body">
          {{ step.text }}
        </p>
        <div v-if="step.tip" class="step-tip">
          <span class="tip-icon">💡</span>
          {{ step.tip }}
        </div>
      </div>

      <!-- Step Image (optional) -->
      <img
        v-if="step.image"
        :src="step.image"
        :alt="`Step ${step.position}`"
        class="step-image"
        loading="lazy"
      />
    </div>
  </div>
</template>

<style scoped>
.instructions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.instructions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.instruction-step {
  position: relative;
  background: white;
  border-radius: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.instruction-step:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
}

.step-number {
  position: absolute;
  top: -12px;
  left: 1.5rem;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-blob-orange), var(--color-blob-coral));
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.step-content {
  margin-top: 1rem;
}

.step-name {
  font-size: var(--text-lg);
  margin-bottom: 0.5rem;
  color: #1F2937;
}

.step-text {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: #4B5563;
}

.step-tip {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #FEF3C7;
  border-left: 3px solid #F59E0B;
  border-radius: 0.5rem;
  font-size: var(--text-sm);
  color: #92400E;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.tip-icon {
  flex-shrink: 0;
}

.step-image {
  width: 100%;
  border-radius: 1rem;
  margin-top: 1rem;
  object-fit: cover;
  aspect-ratio: 16/9;
}
</style>
```

---

## 5. DOCKER CONFIGURATION APPROACH

### Multi-Stage Dockerfile

**File: `/Dockerfile`**

```dockerfile
# Stage 1: Build Stage
FROM node:20-alpine AS build-stage

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application (static site generation)
RUN npm run build

# Stage 2: Production Stage with Nginx
FROM nginx:1.25-alpine AS production-stage

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy recipe YAML files (if you want them served statically)
COPY --from=build-stage /app/recipes /usr/share/nginx/html/data/recipes

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nextjs:nodejs /var/run/nginx.pid

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

**File: `/nginx.conf`**

```nginx
# User is set in Dockerfile
worker_processes auto;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
}

http {
    # Basic settings
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        image/svg+xml;

    # Brotli compression (if available)
    # brotli on;
    # brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    server {
        listen 8080;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Cache YAML recipe files
        location ~* \.yml$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
        }

        # SPA fallback - all routes to index.html
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Disable access to hidden files
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
    }
}
```

### Docker Compose for Development

**File: `/docker-compose.yml`**

```yaml
version: '3.9'

services:
  # Development service with hot reload
  recipe-app-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: recipe-app-dev
    ports:
      - "5173:5173" # Vite dev server
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - VITE_API_BASE_URL=http://localhost:5173
    command: npm run dev

  # Production service
  recipe-app-prod:
    build:
      context: .
      dockerfile: Dockerfile
      target: production-stage
    container_name: recipe-app-prod
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

### Development Dockerfile

**File: `/Dockerfile.dev`**

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

### Environment Variables

**File: `/.env.example`**

```bash
# Application
NODE_ENV=development
VITE_APP_NAME="Recipe Collection"
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_BASE_URL=http://localhost:5173
VITE_RECIPE_DATA_PATH=/data/recipes

# Feature Flags
VITE_ENABLE_SEARCH=true
VITE_ENABLE_RATINGS=true
VITE_ENABLE_COMMENTS=false

# Analytics (optional)
VITE_GA_ID=

# Image CDN (optional)
VITE_IMAGE_CDN_URL=
```

**File: `/.env.production`**

```bash
NODE_ENV=production
VITE_APP_NAME="Recipe Collection"
VITE_APP_VERSION=1.0.0
VITE_API_BASE_URL=https://recipes.yourdomain.com
VITE_RECIPE_DATA_PATH=/data/recipes
VITE_ENABLE_SEARCH=true
VITE_ENABLE_RATINGS=true
VITE_ENABLE_COMMENTS=true
```

### Build and Run Commands

```bash
# Development
docker-compose up recipe-app-dev

# Production build
docker build -t recipe-app:latest .

# Run production container
docker run -d -p 8080:8080 --name recipe-app recipe-app:latest

# Using docker-compose for production
docker-compose up -d recipe-app-prod

# View logs
docker logs -f recipe-app-prod

# Stop and remove
docker-compose down
```

### Volume Mounting for Recipe Development

If you want to edit recipes without rebuilding:

```yaml
# docker-compose.override.yml
version: '3.9'

services:
  recipe-app-prod:
    volumes:
      - ./recipes:/usr/share/nginx/html/data/recipes:ro
```

---

## 6. STEP-BY-STEP IMPLEMENTATION ROADMAP

### Phase 1: Project Setup (Days 1-2)

#### Step 1.1: Initialize Vue 3 Project
```bash
npm create vite@latest recipe-app -- --template vue-ts
cd recipe-app
npm install
```

#### Step 1.2: Install Core Dependencies
```bash
# Core framework
npm install vue@latest vue-router@4 pinia@latest

# Static Site Generation
npm install -D vite-ssg @unhead/vue

# State management & utilities
npm install @vueuse/core @vueuse/motion

# YAML parsing
npm install yaml
```

#### Step 1.3: Install UI Dependencies
```bash
# CSS Framework
npm install -D unocss @unocss/reset

# Icons
npm install lucide-vue-next

# Layout
npm install @yeger/vue-masonry-wall
```

#### Step 1.4: Configure Build Tools

Create `/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
  }
})
```

Create `/uno.config.ts`:
```typescript
import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  theme: {
    colors: {
      blob: {
        purple: '#8B5CF6',
        green: '#10B981',
        orange: '#F97316',
        coral: '#FB7185',
        yellow: '#FBBF24',
        blue: '#3B82F6',
      },
    },
    fontFamily: {
      display: ['Abril Fatface', 'serif'],
      body: ['Inter', 'sans-serif'],
    },
  },
})
```

#### Step 1.5: Setup TypeScript Types
Create the `/src/types/recipe.ts` file with all interfaces from Section 3.

---

### Phase 2: Design System Components (Days 3-5)

#### Step 2.1: Create Base BlobCard Component
- Implement `/src/components/ui/BlobCard.vue` (see Section 4)
- Generate 5-6 unique blob shapes using Blobmaker
- Test with different colors and sizes

#### Step 2.2: Typography Setup
- Add Google Fonts to `/index.html`
- Create `/src/styles/typography.css`
- Create utility components for headings and text

#### Step 2.3: Additional UI Components
- `BlobButton.vue` - Button with blob shape
- `BlobTag.vue` - Tag/badge component
- Color palette utilities
- Animation utilities

#### Step 2.4: Icon System
- Create illustration components in `/src/components/illustrations/`
- Setup Lucide icons configuration
- Create icon wrapper component for consistent styling

---

### Phase 3: Recipe Data Layer (Days 6-7)

#### Step 3.1: Create Recipe Folder Structure
```bash
mkdir -p recipes/{appetizers,main-courses,desserts,side-dishes}
mkdir recipes/_meta
```

#### Step 3.2: Create Sample Recipes
- Write 3-5 example recipes in YAML format
- Include all metadata fields
- Test with different categories and tags

#### Step 3.3: Build Recipe Loader
- Implement `/src/utils/recipeLoader.ts` (see Section 3)
- Test loading individual recipes
- Test loading all recipes
- Add error handling

#### Step 3.4: Create Pinia Store
```typescript
// src/stores/recipeStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loadAllRecipes } from '@/utils/recipeLoader'
import type { Recipe } from '@/types/recipe'

export const useRecipeStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadRecipes = async () => {
    loading.value = true
    error.value = null

    try {
      recipes.value = await loadAllRecipes()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const getRecipeBySlug = computed(() => {
    return (slug: string) => recipes.value.find(r => r.slug === slug)
  })

  const recipesByCategory = computed(() => {
    return (category: string) =>
      recipes.value.filter(r => r.recipeCategory === category)
  })

  return {
    recipes,
    loading,
    error,
    loadRecipes,
    getRecipeBySlug,
    recipesByCategory
  }
})
```

---

### Phase 4: Core Recipe Components (Days 8-10)

#### Step 4.1: RecipeCard Component
- Implement `/src/components/recipe/RecipeCard.vue` (see Section 4)
- Add hover effects
- Test with different recipes and colors

#### Step 4.2: RecipeGrid Component
- Implement `/src/components/recipe/RecipeGrid.vue`
- Setup masonry layout
- Add responsive breakpoints
- Test with various numbers of cards

#### Step 4.3: Recipe Detail Components
- `RecipeDetail.vue` - Full recipe page layout
- `IngredientList.vue` - Interactive ingredient list with checkboxes
- `InstructionSteps.vue` - Step-by-step instructions (see Section 4)
- `RecipeMeta.vue` - Time, servings, difficulty display

#### Step 4.4: Dual-Card System (Optional Enhancement)
- Implement card flip animation
- Create `RecipeCardFlip.vue` component
- Add gesture support (swipe/click to flip)

---

### Phase 5: Search & Filter System (Days 11-12)

#### Step 5.1: Create Filter Composable
- Implement `/src/composables/useRecipeFilter.ts` (see Section 4)
- Add search by name, description, keywords
- Add category filter
- Add tag filter
- Add difficulty filter
- Add sorting options

#### Step 5.2: Search UI Components
- `SearchBar.vue` - Main search input (see Section 4)
- `FilterPanel.vue` - Category, tag, difficulty filters
- `SortDropdown.vue` - Sort options
- `FilterChips.vue` - Active filter display

#### Step 5.3: Search Results View
- Create search results page
- Add "no results" state
- Add result count display
- Add clear filters button

---

### Phase 6: Routing & Views (Days 13-14)

#### Step 6.1: Setup Vue Router
```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: () => import('@/views/RecipeGridView.vue')
    },
    {
      path: '/recipe/:slug',
      name: 'recipe-detail',
      component: () => import('@/views/RecipeDetailView.vue')
    },
    {
      path: '/category/:category',
      name: 'category',
      component: () => import('@/views/CategoryView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
```

#### Step 6.2: Create View Components
- `HomeView.vue` - Landing page with featured recipes
- `RecipeGridView.vue` - All recipes grid
- `RecipeDetailView.vue` - Single recipe page
- `CategoryView.vue` - Recipes by category
- `SearchView.vue` - Search results page

#### Step 6.3: Layout Components
- `TheHeader.vue` - App header with navigation
- `TheFooter.vue` - App footer
- `DefaultLayout.vue` - Main layout wrapper

---

### Phase 7: Image Optimization (Day 15)

#### Step 7.1: Setup Image Optimization Plugin
```bash
npm install -D vite-plugin-imagemin
```

Configure in `vite.config.ts`:
```typescript
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true }
        ]
      }
    })
  ]
})
```

#### Step 7.2: Create Image Component
```vue
<!-- src/components/ui/OptimizedImage.vue -->
<script setup lang="ts">
interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  lazy?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lazy: true
})

// Generate WebP/AVIF sources if available
const sources = computed(() => {
  const base = props.src.replace(/\.[^.]+$/, '')
  return {
    avif: `${base}.avif`,
    webp: `${base}.webp`,
    fallback: props.src
  }
})
</script>

<template>
  <picture>
    <source :srcset="sources.avif" type="image/avif">
    <source :srcset="sources.webp" type="image/webp">
    <img
      :src="sources.fallback"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="lazy ? 'lazy' : 'eager'"
      class="optimized-image"
    >
  </picture>
</template>
```

#### Step 7.3: Add Image Assets
- Create `/public/images/recipes/` folder
- Add sample recipe images
- Create different sizes (thumbnail, medium, large)
- Test lazy loading

---

### Phase 8: Schema.org & SEO (Day 16)

#### Step 8.1: Create Schema.org Generator
```typescript
// src/utils/schemaGenerator.ts
import type { Recipe } from '@/types/recipe'

export function generateRecipeSchema(recipe: Recipe) {
  return {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    "name": recipe.name,
    "image": recipe.image.main,
    "author": {
      "@type": "Person",
      "name": recipe.author.name
    },
    "datePublished": recipe.datePublished,
    "description": recipe.description,
    "prepTime": recipe.prepTime,
    "cookTime": recipe.cookTime,
    "totalTime": recipe.totalTime,
    "recipeYield": recipe.recipeYield,
    "recipeCategory": recipe.recipeCategory,
    "recipeCuisine": recipe.recipeCuisine,
    "keywords": recipe.keywords.join(", "),
    "recipeIngredient": recipe.recipeIngredient.map(i =>
      `${i.amount} ${i.unit} ${i.name}`
    ),
    "recipeInstructions": recipe.recipeInstructions.map(step => ({
      "@type": "HowToStep",
      "text": step.text,
      "name": step.name,
      "url": step.image
    })),
    "nutrition": recipe.nutrition ? {
      "@type": "NutritionInformation",
      ...recipe.nutrition
    } : undefined,
    "aggregateRating": recipe.aggregateRating ? {
      "@type": "AggregateRating",
      "ratingValue": recipe.aggregateRating.ratingValue,
      "ratingCount": recipe.aggregateRating.ratingCount
    } : undefined
  }
}
```

#### Step 8.2: Add Schema to Recipe Detail Page
```vue
<script setup>
import { useHead } from '@unhead/vue'
import { generateRecipeSchema } from '@/utils/schemaGenerator'

const recipe = // ... load recipe

useHead({
  title: recipe.name,
  meta: [
    { name: 'description', content: recipe.description },
    { property: 'og:title', content: recipe.name },
    { property: 'og:description', content: recipe.description },
    { property: 'og:image', content: recipe.image.main },
    { property: 'og:type', content: 'article' },
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(generateRecipeSchema(recipe))
    }
  ]
})
</script>
```

---

### Phase 9: Docker Setup (Day 17)

#### Step 9.1: Create Dockerfiles
- Create `/Dockerfile` (see Section 5)
- Create `/Dockerfile.dev` (see Section 5)
- Create `/nginx.conf` (see Section 5)
- Create `/docker-compose.yml` (see Section 5)

#### Step 9.2: Create .dockerignore
```
node_modules
dist
.git
.env
.env.local
*.log
```

#### Step 9.3: Test Docker Build
```bash
# Build development image
docker-compose build recipe-app-dev

# Test development container
docker-compose up recipe-app-dev

# Build production image
docker build -t recipe-app:latest .

# Test production container
docker run -p 8080:8080 recipe-app:latest
```

---

### Phase 10: Testing & Refinement (Days 18-20)

#### Step 10.1: Testing Checklist
- [ ] All recipes load correctly
- [ ] Search and filters work
- [ ] Recipe detail pages display properly
- [ ] Images load and lazy-load correctly
- [ ] Mobile responsive design works
- [ ] Animations are smooth
- [ ] No console errors
- [ ] Docker containers run successfully

#### Step 10.2: Performance Optimization
- Run Lighthouse audit
- Optimize bundle size (analyze with `rollup-plugin-visualizer`)
- Implement code splitting
- Add loading states
- Optimize images further

#### Step 10.3: Accessibility
- Add ARIA labels
- Test keyboard navigation
- Ensure color contrast meets WCAG standards
- Add focus indicators
- Test with screen reader

#### Step 10.4: Cross-browser Testing
- Test in Chrome, Firefox, Safari, Edge
- Test on mobile devices (iOS Safari, Chrome Mobile)
- Fix any browser-specific issues

---

### Phase 11: Documentation & Deployment (Day 21)

#### Step 11.1: Create Documentation
- README.md with setup instructions
- CONTRIBUTING.md for recipe contributions
- Document recipe YAML format
- Create example recipes

#### Step 11.2: Deployment Preparation
- Setup environment variables for production
- Configure CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
- Setup hosting (Vercel, Netlify, or Docker on VPS)
- Configure domain and SSL

#### Step 11.3: Launch Checklist
- [ ] Production build works
- [ ] Environment variables configured
- [ ] Schema.org markup validated
- [ ] Analytics setup (if needed)
- [ ] Performance metrics acceptable
- [ ] All images optimized
- [ ] SEO meta tags complete
- [ ] Sitemap generated

---

## Additional Resources

### Tools & Generators
- **Blobmaker:** https://www.blobmaker.app/
- **Haikei:** https://haikei.app/
- **Clippy:** https://bennettfeely.com/clippy/
- **Google Fonts:** https://fonts.google.com/
- **Lucide Icons:** https://lucide.dev/
- **Schema.org Recipe:** https://schema.org/Recipe
- **Rich Results Test:** https://search.google.com/test/rich-results

### Documentation
- **Vue 3:** https://vuejs.org/
- **Vite:** https://vitejs.dev/
- **vite-ssg:** https://github.com/antfu-collective/vite-ssg
- **UnoCSS:** https://unocss.dev/
- **VueUse:** https://vueuse.org/
- **Pinia:** https://pinia.vuejs.org/

### Design Inspiration
- **Dribbble Recipe Designs:** https://dribbble.com/tags/recipe-app
- **Behance Food & Drink:** https://www.behance.net/search/projects?field=food%20%26%20drink

---

## Summary

This comprehensive design system provides everything needed to build a production-ready Vue.js recipe web application with a modern, playful aesthetic. The tech stack is optimized for performance, developer experience, and maintainability.

**Key Highlights:**
- **Vue 3 + Vite + TypeScript** for robust development
- **UnoCSS** for ultra-fast, efficient styling (87% smaller than Tailwind)
- **vite-ssg** for static site generation and optimal SEO
- **YAML-based** recipe data with Schema.org compliance
- **Organic blob shapes** using SVG for unique visual identity
- **Docker multi-stage builds** for efficient deployment
- **Complete component library** with examples
- **21-day implementation roadmap** with clear phases

The system balances modern web development best practices with the unique design requirements of a playful, organic aesthetic perfect for a recipe application.
