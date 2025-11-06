# Quick Start Guide

Your recipe web app is ready to use! Follow these simple steps:

## 🚀 Running Locally (Development)

The dev server is currently running at: **http://localhost:3001**

Open your browser and navigate to that URL to see your recipes!

### To start it again later:

```bash
cd app
npm run dev
```

### To stop the server:

Press `Ctrl+C` in the terminal

## 🐳 Running with Docker (Production)

From the `/recipes` directory:

```bash
# Build and start
docker-compose up -d

# Your app will be at http://localhost:8080

# To stop
docker-compose down
```

## ➕ Adding New Recipes

### Method 1: Quick Add (Manual)

1. Create a new YAML file in `/data/` folder
2. Copy the format from existing recipes
3. Add the recipe object to `app/src/recipes.ts`
4. Refresh your browser

### Method 2: Edit Existing

Just modify the YAML files in `/data/`:
- `chocolate-brownie.yaml`
- `rotisserie-chicken.yaml`
- `gimlet-cocktail.yaml`

Then add the data to `app/src/recipes.ts`

## 🎨 Customizing Colors

Each recipe has a theme color. Available themes:
- `purple`: #2A2552 (dark elegant)
- `green`: #1B6B4E (fresh natural)
- `orange`: #E57B3B (warm inviting)
- `coral`: #E84B3D (bold vibrant)
- `yellow`: #F5A623 (cheerful bright)
- `blue`: #4DB8E8 (cool refreshing)

Change the `theme` field in your YAML files!

## 📁 Project Structure

```
/recipes/
├── source/          ← Design inspiration (don't modify)
├── data/            ← Add your recipe YAML files here!
├── app/             ← Vue.js application
└── README.md        ← Full documentation
```

## ✨ Features

- **Click cards** to flip and see recipe details
- **Responsive** - works on mobile, tablet, desktop
- **Fast** - built with Vite
- **Stylish** - organic blob shapes with animations
- **Extensible** - just add YAML files!

## 🆘 Troubleshooting

**Port 3000 already in use?**
```bash
# Stop the current server (Ctrl+C)
# Or change the port in app/vite.config.ts
```

**Docker not working?**
```bash
# Make sure Docker is installed and running
docker --version
docker-compose --version
```

**Styles not loading?**
```bash
# Clear cache and restart
cd app
rm -rf node_modules/.vite
npm run dev
```

## 📚 Next Steps

1. **Add your favorite recipes** to the `data/` folder
2. **Customize colors** to match your style
3. **Take photos** of your dishes and add them later
4. **Deploy** to a server using Docker

See `README.md` for full documentation!

---

**Your app is running now at http://localhost:3000** 🎉
