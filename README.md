# 🍳 Recipes Collection

A dynamic recipe browser that displays your markdown recipes in an organized, easy-to-navigate web interface.

## Features

- 📁 Collapsible folder structure organized by language (English/Spanish) and category
- 📖 Markdown viewer to read recipes directly in the browser
- 🔄 Easy to update - just run one script to regenerate

## How to Use

### Adding New Recipes

1. Add your markdown files to the appropriate folder:
   - `english/recipes/` or `spanish/recipes/`
   - `english/methods/` or `spanish/methods/`
   - etc.

2. Regenerate the index:
   ```bash
   node generate_manifest.js
   ```

3. Commit and push:
   ```bash
   git add index.html
   git commit -m "Add new recipes"
   git push origin main
   ```

### Viewing Locally

To test your recipes locally, you need a web server (due to browser security restrictions):

```bash
./start_server.sh
```

Then open http://localhost:8000 in your browser.

### Viewing on GitHub Pages

Once pushed to GitHub, the recipes will work perfectly on GitHub Pages without needing a local server.

## Project Structure

```
recipes/
├── english/
│   ├── bakery/
│   ├── methods/
│   ├── recipes/
│   ├── sauces/
│   └── spices/
├── spanish/
│   ├── bakery/
│   ├── methods/
│   ├── recipes/
│   ├── sauces/
│   └── spices/
├── index.html          # Generated recipe browser
├── generate_manifest.js # Script to regenerate index.html
└── start_server.sh     # Local development server
```

## Technologies

- Vanilla JavaScript for interactivity
- [Marked.js](https://marked.js.org/) for markdown parsing
- No build tools required - just push and go!

