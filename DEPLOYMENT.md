# Deployment Guide

This repository contains both the frontend and backend. They can be deployed separately to Vercel and Render respectively.

## Option 1: Separate Repositories (Recommended)

### Backend (Render)

1. Create a new repo: `https://github.com/KHAZI18/major_project_backend.git`
2. Push only the `server/` directory:
   ```bash
   git subtree push --prefix server origin master
   ```
3. Create a new Web Service on Render
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `JWT_SECRET`: A secure random string for JWT signing
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://major-project.vercel.app`)
   - `PORT`: `5000` (default)
   - `NODE_ENV`: `production`

### Frontend (Vercel)

1. Create a new repo: `https://github.com/KHAZI18/major_project_new.git`
2. Push only the frontend files (exclude `server/` directory)
3. Import your repository to Vercel
4. Add environment variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-backend.onrender.com/api`)
5. Deploy!

## Option 2: Single Repository

If using a single repository for both:

### Backend on Render

1. Connect repository to Render
2. Set:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
3. Add environment variables as above

### Frontend on Vercel

1. Import repository to Vercel
2. Set **Root Directory** to project root
3. Add environment variable `VITE_API_URL` with your backend URL
4. Deploy!

## CORS Configuration

The CORS is now configured to:
- Allow requests from your Vercel frontend domain (via `FRONTEND_URL` env var)
- Support credentials (cookies, auth headers)
- Allow common HTTP methods: GET, POST, PUT, DELETE, OPTIONS

Make sure the `FRONTEND_URL` environment variable on Render matches your Vercel app URL exactly.

## Testing

After deployment:

1. Visit your Vercel frontend
2. Check the browser console for any CORS errors
3. Test login/signup functionality
4. Verify data sync works correctly

## Notes

- The `.env` file is already in `.gitignore` - never commit secrets
- Use `.env.example` as a template for production environment variables
- For local development, `npm run dev` starts the frontend on port 5173, `npm run server` starts the backend on port 5000