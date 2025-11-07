#!/bin/bash

echo "🔐 Setting up your environment variables"
echo "========================================="
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted. Your existing .env file was not modified."
        exit 0
    fi
fi

# Create .env from example
cp ENV_EXAMPLE.txt .env

echo "✅ Created .env file from template"
echo ""
echo "📝 Now you need to edit .env with your real secrets:"
echo ""
echo "1. AUTH_PASSWORD - Choose a strong password for the web UI"
echo "2. ANTHROPIC_API_KEY - Get from https://console.anthropic.com"
echo "3. GITHUB_TOKEN - Create at GitHub Settings → Developer settings → Tokens"
echo "4. REPO_PATH - Path to your recipes repo"
echo ""
echo "Edit the file now? (opens in nano)"
read -p "Press Enter to edit, or Ctrl+C to exit..."

nano .env

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   npm install     # Install dependencies"
echo "   npm start       # Start the server"
echo ""
echo "⚠️  IMPORTANT: The .env file is gitignored. Never commit it to git!"
echo "   Your secrets are safe as long as you don't manually add .env to git."

