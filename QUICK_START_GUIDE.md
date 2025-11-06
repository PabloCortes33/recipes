# Quick Start Implementation Guide
## Recipe Web App - Essential Commands & Code Snippets

This is a condensed reference for immediately starting implementation. For full details, see `DESIGN_SYSTEM_RESEARCH.md`.

---

## 1. PROJECT INITIALIZATION (5 minutes)

```bash
# Create Vue 3 + TypeScript project
npm create vite@latest recipe-app -- --template vue-ts
cd recipe-app

# Install all dependencies at once
npm install vue@latest vue-router@4 pinia@latest \
  @vueuse/core @vueuse/motion \
  lucide-vue-next \
  @yeger/vue-masonry-wall \
  yaml

npm install -D vite-ssg @unhead/vue \
  unocss @unocss/reset \
  typescript

# Initialize git
git init
```

---

## 2. ESSENTIAL CONFIG FILES

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), UnoCSS()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  }
})
```

### uno.config.ts
```typescript
import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  theme: {
    colors: {
      blob: {
        purple: '#8B5CF6',
        green: '#10B981',
        orange: '#F97316',
        coral: '#FB7185',
      }
    },
    fontFamily: {
      display: ['Abril Fatface', 'serif'],
      body: ['Inter', 'sans-serif'],
    }
  }
})
```

### index.html - Add Google Fonts
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300..700&display=swap" rel="stylesheet">
```

---

## 3. FOLDER STRUCTURE

```bash
# Create project structure
mkdir -p src/{components/{ui,recipe,search,illustrations},composables,stores,types,utils,views,styles}
mkdir -p public/images/recipes
mkdir -p recipes/{appetizers,main-courses,desserts,side-dishes,_meta}
```

---

## 4. CORE TYPE DEFINITIONS

Create `src/types/recipe.ts`:
```typescript
export interface Recipe {
  id: string
  slug: string
  name: string
  description: string
  recipeCategory: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  prepTime: string
  cookTime: string
  totalTime: string
  servings: number
  recipeIngredient: Ingredient[]
  recipeInstructions: RecipeStep[]
  image: { main: string; thumbnail: string }
  card: { color: string; illustration: string }
  tags?: string[]
  keywords: string[]
}

export interface Ingredient {
  name: string
  amount: string
  unit: string
  note?: string
}

export interface RecipeStep {
  type: 'HowToStep'
  position: number
  name: string
  text: string
  tip?: string
}
```

---

## 5. SAMPLE RECIPE FILE

Create `recipes/main-courses/roasted-chicken.yml`:
```yaml
id: roasted-chicken-001
slug: roasted-chicken
name: "Perfect Roasted Chicken"
description: "Simple and delicious roasted chicken with crispy skin"
recipeCategory: "Main Course"
difficulty: "Easy"
prepTime: "PT20M"
cookTime: "PT1H30M"
totalTime: "PT1H50M"
servings: 4
keywords: [chicken, roasted, dinner]
tags: [family-friendly, easy]

card:
  color: "blob-orange"
  illustration: "chicken"

image:
  main: "/images/recipes/roasted-chicken.jpg"
  thumbnail: "/images/recipes/roasted-chicken-thumb.jpg"

recipeIngredient:
  - name: "whole chicken"
    amount: "1"
    unit: "piece"
    note: "about 4 lbs"
  - name: "olive oil"
    amount: "1"
    unit: "tablespoon"
  - name: "salt"
    amount: "1"
    unit: "teaspoon"

recipeInstructions:
  - type: "HowToStep"
    position: 1
    name: "Preheat"
    text: "Preheat oven to 425°F (220°C)"
  - type: "HowToStep"
    position: 2
    name: "Season"
    text: "Pat chicken dry and season with oil, salt, and pepper"
  - type: "HowToStep"
    position: 3
    name: "Roast"
    text: "Roast for 1.5 hours until internal temp reaches 165°F"
```

---

## 6. ESSENTIAL COMPONENTS

### BlobCard.vue (Base Component)
Create `src/components/ui/BlobCard.vue`:
```vue
<script setup lang="ts">
interface Props {
  color?: string
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  color: 'white',
  clickable: false
})

const emit = defineEmits(['click'])

const blobPath = "M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.1,73.1,42.3C64.8,55.5,53.8,67.3,40.3,73.9C26.8,80.5,10.8,81.9,-4.3,79.2C-19.4,76.5,-33.6,69.7,-45.2,61.2C-56.8,52.7,-65.8,42.5,-71.5,30.7C-77.2,18.9,-79.6,5.4,-78.1,-7.5C-76.6,-20.4,-71.2,-32.7,-63.2,-43.4C-55.2,-54.1,-44.6,-63.2,-32.8,-71.6C-21,-80,-10.5,-87.7,1.7,-90.5C13.9,-93.3,30.6,-83.6,44.7,-76.4Z"
</script>

<template>
  <div
    class="blob-card"
    :class="{ 'blob-card-clickable': clickable }"
    @click="clickable && emit('click')"
  >
    <svg class="blob-svg" viewBox="0 0 200 200">
      <path :d="blobPath" :fill="color" stroke="white" stroke-width="8" />
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

.blob-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15));
}

.blob-content {
  position: absolute;
  inset: 10%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  z-index: 1;
}
</style>
```

### RecipeCard.vue (Display Card)
Create `src/components/recipe/RecipeCard.vue`:
```vue
<script setup lang="ts">
import { Clock, Users } from 'lucide-vue-next'
import BlobCard from '@/components/ui/BlobCard.vue'
import type { Recipe } from '@/types/recipe'

const props = defineProps<{ recipe: Recipe }>()
const emit = defineEmits(['click'])

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
    :color="`var(--un-color-${recipe.card.color})`"
    clickable
    @click="emit('click', recipe)"
  >
    <div class="recipe-content">
      <span class="category-badge">{{ recipe.recipeCategory }}</span>
      <h3 class="recipe-title font-display text-2xl text-white">
        {{ recipe.name }}
      </h3>
      <div class="recipe-meta">
        <div class="meta-item">
          <Clock :size="18" />
          <span>{{ formatTime(recipe.totalTime) }}</span>
        </div>
        <div class="meta-item">
          <Users :size="18" />
          <span>{{ recipe.servings }}</span>
        </div>
      </div>
    </div>
  </BlobCard>
</template>

<style scoped>
.recipe-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  color: white;
}

.category-badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  width: fit-content;
}

.recipe-title {
  margin: 1rem 0;
  flex-grow: 1;
}

.recipe-meta {
  display: flex;
  gap: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}
</style>
```

---

## 7. RECIPE LOADER UTILITY

Create `src/utils/recipeLoader.ts`:
```typescript
import { parse as parseYAML } from 'yaml'
import type { Recipe } from '@/types/recipe'

export async function loadAllRecipes(): Promise<Recipe[]> {
  const recipeFiles = import.meta.glob('/recipes/**/*.yml', { as: 'raw' })

  const recipes = await Promise.all(
    Object.entries(recipeFiles).map(async ([path, loader]) => {
      const content = await loader()
      return parseYAML(content) as Recipe
    })
  )

  return recipes.filter(r => r.id && r.slug)
}

export async function loadRecipeBySlug(slug: string): Promise<Recipe | null> {
  const recipes = await loadAllRecipes()
  return recipes.find(r => r.slug === slug) || null
}
```

---

## 8. PINIA STORE

Create `src/stores/recipeStore.ts`:
```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadAllRecipes } from '@/utils/recipeLoader'
import type { Recipe } from '@/types/recipe'

export const useRecipeStore = defineStore('recipes', () => {
  const recipes = ref<Recipe[]>([])
  const loading = ref(false)

  const loadRecipes = async () => {
    loading.value = true
    try {
      recipes.value = await loadAllRecipes()
    } finally {
      loading.value = false
    }
  }

  return { recipes, loading, loadRecipes }
})
```

---

## 9. SEARCH COMPOSABLE

Create `src/composables/useRecipeFilter.ts`:
```typescript
import { ref, computed } from 'vue'
import type { Recipe } from '@/types/recipe'

export function useRecipeFilter(recipes: Ref<Recipe[]>) {
  const searchQuery = ref('')
  const selectedCategory = ref<string | null>(null)

  const filteredRecipes = computed(() => {
    let result = recipes.value

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(r =>
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      )
    }

    if (selectedCategory.value) {
      result = result.filter(r => r.recipeCategory === selectedCategory.value)
    }

    return result
  })

  return { searchQuery, selectedCategory, filteredRecipes }
}
```

---

## 10. ROUTER SETUP

Create `src/router/index.ts`:
```typescript
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/recipe/:slug',
      name: 'recipe-detail',
      component: () => import('@/views/RecipeDetailView.vue')
    }
  ]
})

export default router
```

---

## 11. MAIN VIEW

Create `src/views/HomeView.vue`:
```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRecipeStore } from '@/stores/recipeStore'
import RecipeCard from '@/components/recipe/RecipeCard.vue'

const recipeStore = useRecipeStore()

onMounted(() => {
  recipeStore.loadRecipes()
})

const handleRecipeClick = (recipe: Recipe) => {
  router.push(`/recipe/${recipe.slug}`)
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="font-display text-5xl mb-8">Recipe Collection</h1>

    <div v-if="recipeStore.loading">Loading...</div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RecipeCard
        v-for="recipe in recipeStore.recipes"
        :key="recipe.id"
        :recipe="recipe"
        @click="handleRecipeClick"
      />
    </div>
  </div>
</template>
```

---

## 12. DOCKER SETUP

### Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:1.25-alpine AS production-stage
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf (minimal)
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 8080;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

### docker-compose.yml
```yaml
version: '3.9'

services:
  recipe-app:
    build: .
    ports:
      - "8080:8080"
    restart: unless-stopped
```

---

## 13. PACKAGE.JSON SCRIPTS

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "docker:build": "docker build -t recipe-app .",
    "docker:run": "docker run -p 8080:8080 recipe-app"
  }
}
```

---

## 14. ESSENTIAL COMMANDS

```bash
# Development
npm run dev

# Build for production
npm run build

# Docker
docker-compose up --build

# Add more recipes
# Just create new .yml files in /recipes/ folders

# Generate blob shapes
# Visit: https://www.blobmaker.app/
```

---

## 15. NEXT STEPS PRIORITY

1. Run `npm install` and `npm run dev`
2. Create 3-5 sample recipes in YAML format
3. Test BlobCard and RecipeCard components
4. Add recipe images to `/public/images/recipes/`
5. Implement recipe detail view
6. Add search functionality
7. Setup Docker
8. Deploy

---

## DESIGN RESOURCES

- **Blob Shapes:** https://www.blobmaker.app/
- **Icons:** https://lucide.dev/
- **Fonts:** https://fonts.google.com/ (Abril Fatface + Inter)
- **Colors:** Use the blob color palette in uno.config.ts

---

## TROUBLESHOOTING

**Issue: UnoCSS not working**
```bash
# Make sure main.ts imports uno.css
import 'uno.css'
```

**Issue: YAML files not loading**
```bash
# Check vite.config.ts has:
assetsInclude: ['**/*.yml', '**/*.yaml']
```

**Issue: Fonts not loading**
```bash
# Add @import in main CSS file
@import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300..700&display=swap');
```

---

This quick start guide provides the minimal viable setup. For complete implementation details, architecture decisions, and advanced features, refer to `DESIGN_SYSTEM_RESEARCH.md`.
