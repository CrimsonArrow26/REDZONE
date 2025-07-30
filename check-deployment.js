#!/usr/bin/env node

import fetch from 'node-fetch';

const BACKEND_URL = 'https://redzone-y2yb.onrender.com';

console.log('🔍 Checking RedZone Backend Deployment Status');
console.log('============================================\n');

async function checkBackend() {
  try {
    console.log(`Testing backend at: ${BACKEND_URL}`);
    
    // Test health endpoint
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Backend Health Check: PASSED');
      console.log(`   Status: ${healthData.status}`);
      console.log(`   Message: ${healthData.message}`);
      console.log(`   Environment: ${healthData.environment || 'N/A'}`);
    } else {
      console.log(`❌ Backend Health Check: FAILED (${healthResponse.status})`);
    }

    // Test news endpoint
    const newsResponse = await fetch(`${BACKEND_URL}/api/news`);
    if (newsResponse.ok) {
      const newsData = await newsResponse.json();
      console.log('✅ News API: PASSED');
      console.log(`   Articles fetched: ${Array.isArray(newsData) ? newsData.length : 'N/A'}`);
    } else {
      console.log(`❌ News API: FAILED (${newsResponse.status})`);
    }

  } catch (error) {
    console.log('❌ Backend Connection Failed');
    console.log(`   Error: ${error.message}`);
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('   1. Check if Render deployment is complete');
    console.log('   2. Verify environment variables are set in Render');
    console.log('   3. Check Render logs for errors');
    console.log('   4. Ensure the service is not suspended');
  }
}

async function checkFrontendConfig() {
  console.log('\n📋 Frontend Configuration:');
  console.log('   Backend URL configured: https://redzone-y2yb.onrender.com');
  console.log('   Environment variable needed: VITE_API_URL=https://redzone-y2yb.onrender.com');
}

console.log('🎯 Next Steps for Production Deployment:\n');

console.log('1. ✅ Backend deployed to Render');
console.log('2. 🔄 Deploy frontend to Netlify:');
console.log('   - Go to netlify.com');
console.log('   - Create new site from Git');
console.log('   - Build command: npm run build');
console.log('   - Publish directory: dist');
console.log('   - Set VITE_API_URL=https://redzone-y2yb.onrender.com');

console.log('\n3. 🔧 Update CORS in Render:');
console.log('   - Get your Netlify URL');
console.log('   - Update FRONTEND_URL in Render environment variables');
console.log('   - Redeploy backend');

console.log('\n4. 🧪 Test the complete application');

await checkBackend();
checkFrontendConfig(); 