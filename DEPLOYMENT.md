# Deployment Guide

This guide will help you deploy the RedZone Safety App on Render (backend) and Netlify (frontend).

## Backend Deployment (Render)

### 1. Prepare Your Repository

- Ensure all files are committed to your Git repository
- Make sure `requirements.txt` and `render.yaml` are in the root directory

### 2. Deploy on Render

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `redzone-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Plan**: Free (or choose paid plan)

### 3. Environment Variables

In Render dashboard, go to your service → Environment → Add Environment Variable:

- `NEWS_API_KEY`: Your news API key
- `PYTHON_VERSION`: `3.9.16`

### 4. Get Your Backend URL

After deployment, Render will provide a URL like: `https://your-app-name.onrender.com`

## Frontend Deployment (Netlify)

### 1. Update API URL

Before deploying, update the API URL in your environment:

1. Create a `.env` file in the root directory:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

2. Update `src/utils/api.ts` with your actual Render backend URL:

```typescript
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://your-actual-render-url.onrender.com");
```

### 2. Deploy on Netlify

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

### 3. Environment Variables (Optional)

In Netlify dashboard, go to Site settings → Environment variables:

- `VITE_API_URL`: Your Render backend URL

## Testing Your Deployment

### Backend Health Check

Visit: `https://your-render-backend-url.onrender.com/api/health`
Should return: `{"status": "healthy", "message": "Backend is running"}`

### Frontend

Visit your Netlify URL and test the news functionality.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your backend CORS is configured properly
2. **API Not Found**: Verify the API URL is correct in your frontend
3. **Build Failures**: Check the build logs in both Render and Netlify

### Local Testing

1. Backend: `python app.py` (runs on http://localhost:5000)
2. Frontend: `npm run dev` (runs on http://localhost:5173)

## Security Notes

- In production, update CORS origins in `app.py` to only allow your Netlify domain
- Consider using environment variables for sensitive data
- Enable HTTPS on both platforms (usually automatic)

## File Structure After Deployment

```
├── app.py                    # Flask backend
├── requirements.txt          # Python dependencies
├── render.yaml              # Render configuration
├── netlify.toml            # Netlify configuration
├── package.json             # Node.js dependencies
├── vite.config.ts          # Vite configuration
├── src/
│   ├── utils/
│   │   └── api.ts         # API utility functions
│   └── pages/
│       └── News.tsx       # Updated to use API utility
└── DEPLOYMENT.md           # This guide
```
