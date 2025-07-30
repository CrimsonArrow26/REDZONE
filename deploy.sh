#!/bin/bash

echo "🚀 RedZone Safety App - Deployment Script"
echo "=========================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin <your-github-repo-url>"
    echo "   git push -u origin main"
    exit 1
fi

# Check if all required files exist
echo "📋 Checking deployment files..."
required_files=("app.py" "requirements.txt" "package.json" "vite.config.ts" "render.yaml" "netlify.toml")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
    fi
done

echo ""
echo "🎯 Deployment Steps:"
echo ""
echo "1. BACKEND DEPLOYMENT (Render):"
echo "   - Go to https://render.com"
echo "   - Sign up/Login"
echo "   - Click 'New +' → 'Web Service'"
echo "   - Connect your GitHub repository"
echo "   - Configure:"
echo "     • Name: redzone-backend"
echo "     • Environment: Python 3"
echo "     • Build Command: pip install -r requirements.txt"
echo "     • Start Command: gunicorn app:app"
echo "   - Add Environment Variables:"
echo "     • NEWS_API_KEY: your_api_key"
echo "     • PYTHON_VERSION: 3.9.16"
echo ""
echo "2. FRONTEND DEPLOYMENT (Netlify):"
echo "   - Go to https://netlify.com"
echo "   - Sign up/Login"
echo "   - Click 'New site from Git'"
echo "   - Connect your GitHub repository"
echo "   - Configure:"
echo "     • Build command: npm run build"
echo "     • Publish directory: dist"
echo "     • Node version: 18"
echo ""
echo "3. UPDATE API URL:"
echo "   - After Render deployment, get your backend URL"
echo "   - Update src/utils/api.ts with the actual URL"
echo "   - Set VITE_API_URL environment variable in Netlify"
echo ""
echo "4. TEST YOUR DEPLOYMENT:"
echo "   - Backend health check: https://your-render-url.onrender.com/api/health"
echo "   - Frontend: Visit your Netlify URL"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "✅ Your app is ready for deployment!" 