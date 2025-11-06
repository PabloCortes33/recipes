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
<title>Recipes</title>
<style>
  * { box-sizing: border-box; }
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
    margin: 0;
    padding: 2em; 
    background: #f5f5f5;
  }
  .header {
    max-width: 1200px;
    margin: 0 auto 2em;
  }
  h1 { 
    color: #333; 
    margin: 0 0 0.5em 0;
  }
  .subtitle {
    color: #666;
    font-size: 0.9em;
  }
  .container { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); 
    gap: 2em; 
    max-width: 1200px;
    margin: 0 auto;
  }
  .language-section {
    background: white;
    padding: 1.5em;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  h2 { 
    color: #333; 
    margin: 0 0 1em 0;
    padding-bottom: 0.5em;
    border-bottom: 2px solid #007BFF;
  }
  .folder {
    margin: 0.5em 0;
  }
  .folder-name {
    font-weight: bold;
    color: #555;
    cursor: pointer;
    padding: 0.5em;
    background: #f9f9f9;
    border-radius: 4px;
    user-select: none;
    display: flex;
    align-items: center;
  }
  .folder-name:hover {
    background: #f0f0f0;
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
    padding: 0.3em 0.5em;
    display: block;
    border-radius: 4px;
    transition: background 0.2s;
  }
  .file a:hover {
    background: #e3f2fd;
  }
  .timestamp {
    text-align: center;
    color: #999;
    font-size: 0.8em;
    margin-top: 2em;
  }
</style>
</head>
<body>
<div class="header">
  <h1>🍳 Recipes Collection</h1>
  <div class="subtitle">Browse recipes organized by language and category</div>
</div>
<div id="content"></div>
<div class="timestamp">Last updated: ${new Date(manifest.generated).toLocaleString()}</div>

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
  link.href = item.path;
  link.textContent = formatName(item.name);
  
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

loadRecipes();
</script>
</body>
</html>
`;

  fs.writeFileSync(path.join(rootDir, 'index.html'), html);
  console.log('✅ index.html generated successfully!');
}

generateHTML();
