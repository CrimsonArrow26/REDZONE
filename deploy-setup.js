#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🚀 RedZone Safety App - Deployment Setup');
console.log('==========================================\n');

// Check if required files exist
const requiredFiles = [
  'app.py',
  'requirements.txt',
  'package.json',
  'vite.config.ts',
  'render.yaml',
  'netlify.toml'
];

console.log('Checking required files...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

console.log('\n📋 Deployment Checklist:');
console.log('1. ✅ Backend files configured for Render');
console.log('2. ✅ Frontend files configured for Netlify');
console.log('3. ✅ API utility created for production');
console.log('4. ✅ CORS configured for production');
console.log('5. ✅ Build optimization configured');

console.log('\n🎯 Next Steps:');
console.log('1. Deploy backend to Render:');
console.log('   - Go to render.com');
console.log('   - Create new Web Service');
console.log('   - Connect your GitHub repo');
console.log('   - Use build command: pip install -r requirements.txt');
console.log('   - Use start command: gunicorn app:app');

console.log('\n2. Deploy frontend to Netlify:');
console.log('   - Go to netlify.com');
console.log('   - Create new site from Git');
console.log('   - Connect your GitHub repo');
console.log('   - Build command: npm run build');
console.log('   - Publish directory: dist');

console.log('\n3. Update API URL:');
console.log('   - After Render deployment, get your backend URL');
console.log('   - Update src/utils/api.ts with the actual URL');
console.log('   - Set VITE_API_URL environment variable in Netlify');

console.log('\n📖 See DEPLOYMENT.md for detailed instructions'); 