#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function scanDirectory(dirPath, basePath = '') {
  const items = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    // Skip hidden files, node_modules, source folder, and this script
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || 
        entry.name === 'source' || entry.name === 'generate_manifest.js' ||
        entry.name === 'manifest.json' || entry.name === 'GEMINI.md' ||
        entry.name === 'index.html') {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.join(basePath, entry.name);

    if (entry.isDirectory()) {
      const children = scanDirectory(fullPath, relativePath);
      items.push({
        name: entry.name,
        type: 'folder',
        path: relativePath,
        children: children
      });
    } else if (entry.name.endsWith('.md')) {
      items.push({
        name: entry.name.replace('.md', ''),
        type: 'file',
        path: relativePath
      });
    }
  }

  return items.sort((a, b) => {
    // Folders first, then alphabetically
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  });
}

function generateHTML() {
  const rootDir = __dirname;
  const structure = scanDirectory(rootDir);
  
  const manifest = {
    generated: new Date().toISOString(),
    structure: structure
  };

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
<meta name="description" content="Personal recipes collection organized by language and category">
<meta name="theme-color" content="#007BFF">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Recipes">
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="icon.svg">
<link rel="icon" type="image/svg+xml" href="icon.svg">
<title>Recipes</title>
<script src="https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js"></script>
<style>
  * { box-sizing: border-box; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
    margin: 0;
    padding: 1em; 
    background: #f5f5f5;
  }
  @media (min-width: 768px) {
    body { padding: 2em; }
  }
  .header {
    max-width: 1200px;
    margin: 0 auto 1.5em;
  }
  @media (min-width: 768px) {
    .header { margin-bottom: 2em; }
  }
  h1 { 
    color: #333; 
    margin: 0 0 0.5em 0;
    font-size: 1.8em;
  }
  @media (min-width: 768px) {
    h1 { font-size: 2.5em; }
  }
  .subtitle {
    color: #666;
    font-size: 0.85em;
  }
  @media (min-width: 768px) {
    .subtitle { font-size: 0.9em; }
  }
  .container { 
    display: grid; 
    grid-template-columns: 1fr;
    gap: 1.5em; 
    max-width: 1200px;
    margin: 0 auto;
  }
  @media (min-width: 768px) {
    .container { 
      grid-template-columns: repeat(2, 1fr);
      gap: 2em;
    }
  }
  .language-section {
    background: white;
    padding: 1em;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  @media (min-width: 768px) {
    .language-section { padding: 1.5em; }
  }
  h2 { 
    color: #333; 
    margin: 0 0 0.8em 0;
    padding-bottom: 0.5em;
    border-bottom: 2px solid #007BFF;
    font-size: 1.3em;
  }
  @media (min-width: 768px) {
    h2 { 
      font-size: 1.5em;
      margin-bottom: 1em;
    }
  }
  .folder {
    margin: 0.5em 0;
  }
  .folder-name {
    font-weight: bold;
    color: #555;
    cursor: pointer;
    padding: 0.6em 0.5em;
    background: #f9f9f9;
    border-radius: 4px;
    user-select: none;
    display: flex;
    align-items: center;
    font-size: 0.95em;
    -webkit-tap-highlight-color: rgba(0,0,0,0.1);
    min-height: 44px;
  }
  .folder-name:hover, .folder-name:active {
    background: #f0f0f0;
  }
  @media (min-width: 768px) {
    .folder-name {
      padding: 0.5em;
      font-size: 1em;
      min-height: auto;
    }
  }
  .folder-icon {
    margin-right: 0.5em;
    font-size: 0.9em;
  }
  .folder-contents {
    margin-left: 1.5em;
    padding-left: 0.5em;
    border-left: 2px solid #e0e0e0;
  }
  .folder-contents.collapsed {
    display: none;
  }
  .file {
    margin: 0.3em 0;
  }
  .file a {
    text-decoration: none;
    color: #007BFF;
    padding: 0.5em;
    display: block;
    border-radius: 4px;
    transition: background 0.2s;
    cursor: pointer;
    font-size: 0.9em;
    -webkit-tap-highlight-color: rgba(0,123,255,0.1);
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  .file a:hover, .file a:active {
    background: #e3f2fd;
  }
  @media (min-width: 768px) {
    .file a {
      padding: 0.3em 0.5em;
      font-size: 1em;
      min-height: auto;
    }
  }
  .timestamp {
    text-align: center;
    color: #999;
    font-size: 0.8em;
    margin-top: 2em;
  }
  .hidden {
    display: none;
  }
  
  /* Recipe Viewer Styles */
  #recipe-viewer {
    max-width: 900px;
    margin: 0 auto;
    background: white;
    padding: 1em;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  @media (min-width: 768px) {
    #recipe-viewer { padding: 2em; }
  }
  #recipe-viewer.hidden {
    display: none;
  }
  .back-button {
    background: #007BFF;
    color: white;
    border: none;
    padding: 0.7em 1.2em;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    margin-bottom: 1em;
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    min-height: 44px;
  }
  .back-button:hover, .back-button:active {
    background: #0056b3;
  }
  @media (min-width: 768px) {
    .back-button {
      padding: 0.5em 1em;
      min-height: auto;
    }
  }
  #recipe-content {
    line-height: 1.6;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  #recipe-content h1 {
    color: #333;
    border-bottom: 3px solid #007BFF;
    padding-bottom: 0.5em;
    font-size: 1.6em;
  }
  @media (min-width: 768px) {
    #recipe-content h1 { font-size: 2em; }
  }
  #recipe-content h2 {
    color: #555;
    margin-top: 1.5em;
    font-size: 1.3em;
  }
  @media (min-width: 768px) {
    #recipe-content h2 { font-size: 1.5em; }
  }
  #recipe-content h3 {
    color: #666;
    font-size: 1.1em;
  }
  @media (min-width: 768px) {
    #recipe-content h3 { font-size: 1.2em; }
  }
  #recipe-content code {
    background: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
  }
  #recipe-content pre {
    background: #f5f5f5;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
  }
  #recipe-content pre code {
    background: none;
    padding: 0;
  }
  #recipe-content ul, #recipe-content ol {
    padding-left: 2em;
  }
  #recipe-content li {
    margin: 0.5em 0;
  }
  #recipe-content blockquote {
    border-left: 4px solid #007BFF;
    padding-left: 1em;
    margin-left: 0;
    color: #666;
  }
  #recipe-content img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
  .loading-message {
    text-align: center;
    padding: 2em;
    color: #666;
  }
</style>
</head>
<body>
<div class="header">
  <h1>🍳 Recipes Collection</h1>
  <div class="subtitle">Browse recipes organized by language and category</div>
</div>
<div id="recipe-list">
  <div id="content"></div>
  <div class="timestamp">Last updated: ${new Date(manifest.generated).toLocaleString()}</div>
</div>
<div id="recipe-viewer" class="hidden">
  <button class="back-button" onclick="showRecipeList()">← Back to Recipes</button>
  <div id="recipe-content"></div>
</div>

<script>
const RECIPES_DATA = ${JSON.stringify(manifest, null, 2)};

let expandedFolders = new Set();

function createFolderElement(item, level = 0) {
  const folder = document.createElement('div');
  folder.className = 'folder';
  
  const folderName = document.createElement('div');
  folderName.className = 'folder-name';
  const isExpanded = expandedFolders.has(item.path);
  folderName.innerHTML = \`<span class="folder-icon">\${isExpanded ? '📂' : '📁'}</span>\${formatName(item.name)}\`;
  
  const contents = document.createElement('div');
  contents.className = \`folder-contents \${isExpanded ? '' : 'collapsed'}\`;
  
  folderName.onclick = () => {
    const icon = folderName.querySelector('.folder-icon');
    if (contents.classList.contains('collapsed')) {
      contents.classList.remove('collapsed');
      icon.textContent = '📂';
      expandedFolders.add(item.path);
    } else {
      contents.classList.add('collapsed');
      icon.textContent = '📁';
      expandedFolders.delete(item.path);
    }
  };
  
  if (item.children) {
    item.children.forEach(child => {
      if (child.type === 'folder') {
        contents.appendChild(createFolderElement(child, level + 1));
      } else {
        contents.appendChild(createFileElement(child));
      }
    });
  }
  
  folder.appendChild(folderName);
  folder.appendChild(contents);
  return folder;
}

function createFileElement(item) {
  const file = document.createElement('div');
  file.className = 'file';
  
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = formatName(item.name);
  link.onclick = (e) => {
    e.preventDefault();
    loadRecipe(item.path, formatName(item.name));
  };
  
  file.appendChild(link);
  return file;
}

function formatName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/\\b\\w/g, l => l.toUpperCase());
}

function renderStructure(structure) {
  const container = document.createElement('div');
  container.className = 'container';
  
  structure.forEach(item => {
    if (item.type === 'folder' && (item.name === 'english' || item.name === 'spanish')) {
      const section = document.createElement('div');
      section.className = 'language-section';
      
      const title = document.createElement('h2');
      title.textContent = item.name === 'english' ? '🇬🇧 English' : '🇪🇸 Spanish';
      section.appendChild(title);
      
      if (item.children) {
        item.children.forEach(child => {
          if (child.type === 'folder') {
            section.appendChild(createFolderElement(child));
          }
        });
      }
      
      container.appendChild(section);
    }
  });
  
  return container;
}

function loadRecipes() {
  const content = document.getElementById('content');
  content.appendChild(renderStructure(RECIPES_DATA.structure));
}

async function loadRecipe(path, title) {
  const recipeViewer = document.getElementById('recipe-viewer');
  const recipeContent = document.getElementById('recipe-content');
  const recipeList = document.getElementById('recipe-list');
  
  // Show loading message
  recipeContent.innerHTML = '<div class="loading-message">Loading recipe...</div>';
  recipeList.classList.add('hidden');
  recipeViewer.classList.remove('hidden');
  
  // Scroll to top
  window.scrollTo(0, 0);
  
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Failed to load recipe');
    
    const markdown = await response.text();
    const html = marked.parse(markdown);
    recipeContent.innerHTML = html;
  } catch (error) {
    recipeContent.innerHTML = \`
      <div style="color: #c33; padding: 1em; background: #fee; border-radius: 4px;">
        ⚠️ Failed to load recipe. Please try again.
      </div>
    \`;
  }
}

function showRecipeList() {
  const recipeViewer = document.getElementById('recipe-viewer');
  const recipeList = document.getElementById('recipe-list');
  
  recipeViewer.classList.add('hidden');
  recipeList.classList.remove('hidden');
  window.scrollTo(0, 0);
}

loadRecipes();

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}
</script>
</body>
</html>
`;

  fs.writeFileSync(path.join(rootDir, 'index.html'), html);
  
  // Generate PWA manifest
  const pwaManifest = {
    "name": "Recipes Collection",
    "short_name": "Recipes",
    "description": "Personal recipes collection organized by language and category",
    "start_url": "./",
    "display": "standalone",
    "background_color": "#f5f5f5",
    "theme_color": "#007BFF",
    "orientation": "portrait-primary",
    "icons": [
      {
        "src": "icon.svg",
        "sizes": "any",
        "type": "image/svg+xml",
        "purpose": "any maskable"
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(rootDir, 'manifest.json'),
    JSON.stringify(pwaManifest, null, 2)
  );
  
  // Generate service worker
  const serviceWorker = `const CACHE_NAME = 'recipes-v2';
const urlsToCache = [
  '/',
  '/index.html',
  'https://cdn.jsdelivr.net/npm/marked@11.1.1/marked.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // Cache markdown files as they are fetched
          if (event.request.url.endsWith('.md')) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
`;

  fs.writeFileSync(path.join(rootDir, 'service-worker.js'), serviceWorker);
  
  // Generate SVG icon
  const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#007BFF" rx="64"/>
  <text x="256" y="340" font-size="280" text-anchor="middle" fill="white" font-family="-apple-system, BlinkMacSystemFont, system-ui, sans-serif">🍳</text>
</svg>`;
  
  fs.writeFileSync(path.join(rootDir, 'icon.svg'), svgIcon);
  
  console.log('✅ index.html generated successfully!');
  console.log('✅ manifest.json generated successfully!');
  console.log('✅ service-worker.js generated successfully!');
  console.log('✅ icon.svg generated successfully!');
  console.log('');
  console.log('📱 Your recipe site is now a Progressive Web App!');
  console.log('   Deploy to GitHub Pages and you can install it on your iPhone home screen.');
}

generateHTML();
