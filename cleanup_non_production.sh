#!/bin/bash

# Cleanup Non-Production Files Script
# This script removes development, documentation, and unused files from the repository

set -e  # Exit on error

echo "🧹 Starting cleanup of non-production files..."
echo ""

# Function to safely remove files/directories
safe_remove() {
    local path="$1"
    local description="$2"

    if [ -e "$path" ]; then
        echo "🗑️  Removing: $description"
        rm -rf "$path"
        echo "   ✅ Removed: $path"
    else
        echo "   ⚠️  Not found (already removed?): $path"
    fi
}

# Navigate to project root
cd "$(dirname "$0")"

echo "═══════════════════════════════════════════════════════"
echo "1️⃣  Removing Design Mockups (115MB)"
echo "═══════════════════════════════════════════════════════"
safe_remove "source/" "Design mockup screenshots from Behance"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "2️⃣  Removing Documentation Files"
echo "═══════════════════════════════════════════════════════"
safe_remove "DEPLOYMENT.md" "Deployment documentation"
safe_remove "GEMINI.md" "Gemini documentation"
safe_remove "IMPLEMENTATION_SUMMARY.md" "Implementation summary"
safe_remove "MIGRATION_SUMMARY.md" "Migration summary"
safe_remove "NGINX_CONFIG.md" "Nginx configuration docs"
safe_remove "QA_REVIEW.md" "QA review document"
safe_remove "REACT_MIGRATION_COMPLETE.md" "React migration docs"
safe_remove "docs/" "Documentation directory"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "3️⃣  Removing Unused Components"
echo "═══════════════════════════════════════════════════════"
safe_remove "frontend-react/src/components/JobsDashboard/JobCard.jsx" "Unused JobCard component"
safe_remove "frontend-react/src/components/JobsDashboard/JobCard.css" "Unused JobCard CSS"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "4️⃣  Removing Test Recipe Files"
echo "═══════════════════════════════════════════════════════"
safe_remove "recipes/english/recipes/test_recipe.md" "Test recipe"
safe_remove "recipes/english/recipes/test_chocolate_chip_cookies.md" "Test chocolate chip cookies"
safe_remove "recipes/english/recipes/test_recipe_simple_pasta.md" "Test simple pasta"
safe_remove "recipes/english/recipes/test_chocolate_brownies.md" "Test chocolate brownies"
safe_remove "english/recipes/test_honey_garlic_salmon.md" "Test honey garlic salmon"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "5️⃣  Removing Development Scripts"
echo "═══════════════════════════════════════════════════════"
safe_remove "debug_server.sh" "Debug server script"
safe_remove "frontend/start_server.sh" "Frontend start script"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "6️⃣  Checking for Duplicate Recipe Directories"
echo "═══════════════════════════════════════════════════════"
# Check if english/ and spanish/ directories are duplicates
if [ -d "english/" ] && [ -d "recipes/english/" ]; then
    echo "⚠️  Found both 'english/' and 'recipes/english/' directories"
    echo "   Comparing contents..."

    # Count files in each
    count_root=$(find english/ -type f 2>/dev/null | wc -l)
    count_recipes=$(find recipes/english/ -type f 2>/dev/null | wc -l)

    if [ "$count_root" -lt 5 ] && [ "$count_recipes" -gt 10 ]; then
        echo "   'english/' appears to be a test/duplicate directory"
        safe_remove "english/" "Duplicate english directory"
        safe_remove "spanish/" "Duplicate spanish directory"
    else
        echo "   ⚠️  Directories differ - manual review recommended"
    fi
else
    echo "   ✅ No duplicate directories found"
fi
echo ""

echo "═══════════════════════════════════════════════════════"
echo "7️⃣  Cleaning Node Modules Cache (Optional)"
echo "═══════════════════════════════════════════════════════"
read -p "Remove node_modules to save space? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    safe_remove "frontend-react/node_modules/" "Frontend React node_modules"
    safe_remove "backend/node_modules/" "Backend node_modules"
    echo "   ℹ️  Run 'npm install' in each directory to reinstall"
else
    echo "   ⏭️  Skipping node_modules cleanup"
fi
echo ""

echo "═══════════════════════════════════════════════════════"
echo "8️⃣  Size Analysis"
echo "═══════════════════════════════════════════════════════"
echo "Current project size:"
du -sh . 2>/dev/null || echo "Cannot determine size"
echo ""

echo "═══════════════════════════════════════════════════════"
echo "✅ Cleanup Complete!"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "   • Design mockups removed (~115MB)"
echo "   • Documentation files removed"
echo "   • Unused components removed"
echo "   • Test files removed"
echo "   • Dev scripts removed"
echo ""
echo "⚠️  Important: If you need any of these files, restore from git:"
echo "   git checkout HEAD -- <file>"
echo ""
echo "🎉 Your production repository is now cleaner!"
