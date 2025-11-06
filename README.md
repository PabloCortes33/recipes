# Recipe Collection Web App

A stylish, modern recipe web application built with Vue 3, TypeScript, and UnoCSS. Features beautiful blob-shaped recipe cards with flip animations.

## Features

- **Modern Design System**: Organic blob shapes, bold colors, hand-drawn style icons
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Interactive Cards**: Click to flip and see recipe details
- **Easy to Extend**: Just add YAML files to the `data/` folder
- **Docker Ready**: Deploy locally or to a server with one command

## Project Structure

```
recipes/
├── source/          # Design inspiration images
├── data/            # Recipe YAML files (add your recipes here!)
│   ├── chocolate-brownie.yaml
│   ├── rotisserie-chicken.yaml
│   └── gimlet-cocktail.yaml
├── app/             # Vue.js application
│   ├── src/
│   │   ├── components/
│   │   │   ├── BlobShape.vue
│   │   │   └── RecipeCard.vue
│   │   ├── types/
│   │   │   └── recipe.ts
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── recipes.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Quick Start

### Development (Local)

1. Navigate to the app directory:
```bash
cd app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Production (Docker)

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Open your browser to `http://localhost:8080`

3. To stop:
```bash
docker-compose down
```

## Adding New Recipes

1. Create a new YAML file in the `data/` folder (e.g., `pancakes.yaml`)

2. Use this template:

```yaml
id: pancakes
title: Fluffy Pancakes
tagline: Light and fluffy pancakes perfect for breakfast!
theme: orange  # Options: purple, green, orange, coral, yellow, blue
ingredients:
  - 2 cups flour
  - 2 eggs
  - 1 cup milk
  - 2 tbsp sugar
  - 1 tsp baking powder
steps:
  - number: 1
    instruction: Mix dry ingredients in a bowl
    icon: bowl
  - number: 2
    instruction: Beat eggs and milk together
    icon: whisk
  - number: 3
    instruction: Combine wet and dry ingredients
    icon: spoon
  - number: 4
    instruction: Heat pan with butter
    icon: pan
  - number: 5
    instruction: Pour batter and cook until bubbles form
    icon: pot
  - number: 6
    instruction: Flip and cook until golden
    icon: flame
cookTime: 20 mins
difficulty: Easy  # Easy, Medium, or Hard
servings: 4
```

3. Add the recipe to `app/src/recipes.ts` (in production, this would be automated)

## Design System

### Colors
- **Purple** (#2A2552): Deep, elegant
- **Green** (#1B6B4E): Fresh, natural
- **Orange** (#E57B3B): Warm, inviting
- **Coral** (#E84B3D): Bold, vibrant
- **Yellow** (#F5A623): Cheerful, bright
- **Blue** (#4DB8E8): Cool, refreshing

### Typography
- **Display**: Abril Fatface (titles)
- **Body**: Inter (descriptions, ingredients, steps)

### Components
- **BlobShape**: Organic SVG shapes with 4 variants
- **RecipeCard**: Dual-sided card with flip animation
  - Front: Title, tagline, cook time, difficulty
  - Back: Ingredients list, 6-step cooking process

## Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: UnoCSS (utility-first CSS)
- **Icons**: Lucide Vue Next (hand-drawn style)
- **Animation**: VueUse Motion
- **Deployment**: Docker + Nginx

## Development Scripts

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check
```

## Deployment Options

### Option 1: Docker (Recommended)
```bash
docker-compose up -d
```

### Option 2: Build and Serve Manually
```bash
cd app
npm run build
# Serve the dist/ folder with any static file server
```

### Option 3: Deploy to Cloud
The `app/dist` folder can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Auto-load recipes from `data/` folder via API
- [ ] Search and filter functionality
- [ ] Recipe categories/tags
- [ ] Print-friendly recipe view
- [ ] Share recipe as image
- [ ] Recipe rating system
- [ ] Cooking mode (step-by-step with timer)

## License

MIT

## Credits

Design inspired by Food Recipe Infographic Cards by J-EIGHT on Behance.
