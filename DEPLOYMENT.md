# Deployment Guide

## Backend (Render)

1. Push your code to `https://github.com/KHAZI18/major_project_backend.git`
2. Create a new Web Service on Render
3. Connect your repository
4. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `JWT_SECRET`: A secure random string for JWT signing
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://major-project.vercel.app`)
   - `PORT`: `5000` (default, can be changed)
   - `NODE_ENV`: `production`
5. Deploy!

## Frontend (Vercel)

1. Push your code to `https://github.com/KHAZI18/major_project_new.git`
2. Import your repository to Vercel
3. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://your-backend.onrender.com`)
4. Deploy!

## CORS Configuration

The CORS is now configured to:
- Allow requests from your Vercel frontend domain
- Support credentials (cookies, auth headers)
- Allow common HTTP methods

Make sure the `FRONTEND_URL` environment variable on Render matches your Vercel app URL exactly.

## Testing

After deployment:
1. Visit your Vercel frontend
2. Check the browser console for any CORS errors
3. Test login/signup functionality
4. Verify data sync works correctly
