# Huron Hire Backend for Render

Backend API for the Huron Hire equipment rental website, optimized for Render deployment.

## Deployment Steps:

1. **Create GitHub Repository**
   - Upload these files to a new GitHub repo
   - Include: `package.json`, `index.js`, `README.md`

2. **Deploy to Render**
   - Go to render.com and sign up
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Environment Variables**
   Set in Render dashboard:
   - `SENDGRID_API_KEY` = Your SendGrid API key
   - `NODE_ENV` = production

4. **Get Your URL**
   - After deployment, Render will provide a URL like `your-app-name.onrender.com`
   - Use this URL for your frontend configuration

## API Endpoints:
- `GET /api/equipment` - Equipment catalog
- `POST /api/inquiries` - Submit inquiry (sends email)
- `GET /health` - Health check

Your backend will be live at: `https://your-app-name.onrender.com`