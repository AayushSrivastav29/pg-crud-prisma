# Quick Start: Deploy to Netlify in 5 Minutes

This is a **quick step-by-step guide** to deploy your PostgreSQL CRUD app's frontend on Netlify.

## Prerequisites

- GitHub account (free)
- Netlify account (free)
- Backend API deployed (or use localhost for testing)

---

## Step 1: Push Code to GitHub

```bash
cd /Users/rahul/self-projects/pg-crud-prisma
git add .
git commit -m "Complete implementation with Netlify config"
git push origin main
```

---

## Step 2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up or log in
3. Click **"Add new site" → "Import an existing project"**
4. Choose **GitHub**
5. Connect your GitHub account
6. Select your `pg-crud-prisma` repository

---

## Step 3: Configure Build Settings

Netlify should auto-detect:

- **Build command:** `npm run build`
- **Publish directory:** `dist`

If not, set them manually:

```
Build command:    npm run build
Publish directory: dist
```

---

## Step 4: Set Environment Variables

In **Netlify Dashboard:**

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Click **Edit variables**
3. Add:

```
VITE_API_BASE_URL = https://your-backend-api.com/api
```

Replace with your actual backend API URL:

- Local testing: `http://localhost:3000/api`
- Railway: `https://your-app-railway.railway.app/api`
- Render: `https://your-app-render.onrender.com/api`
- Vercel: `https://your-app-vercel.vercel.app/api`

---

## Step 5: Deploy

Click **"Deploy site"**

Netlify will:

1. Pull code from GitHub
2. Run `npm install`
3. Run `npm run build`
4. Deploy `dist/` folder
5. Give you a live URL

✅ Done! Your frontend is live!

---

## Test Your Deployment

1. Visit the Netlify URL provided
2. Navigate between Dashboard, Users, and Posts
3. Check browser console (F12) for any errors
4. Verify API calls are going to the right backend

---

## Troubleshooting

### Build fails with "Module not found"

Make sure `package-lock.json` is committed to git:

```bash
git add package-lock.json
git commit -m "Add package lock"
git push
```

### Frontend loads but API calls fail

Check:

1. `VITE_API_BASE_URL` is set correctly in Netlify
2. Backend API is running and accessible
3. Backend CORS is configured
4. Check browser DevTools → Network tab

### "Cannot find module 'vue-router'"

Run locally:

```bash
npm install vue-router --legacy-peer-deps
npm run build
git add package-lock.json
git commit -m "Add vue-router"
git push
```

---

## What's Next?

1. **Deploy Backend** (see DEPLOYMENT.md)
2. **Set Production API URL** in Netlify environment
3. **Configure CORS** on backend for your Netlify domain
4. **Add Authentication** if needed
5. **Monitor & Debug** with Netlify Analytics

---

## Useful Links

- Netlify Dashboard: https://app.netlify.com
- Netlify Docs: https://docs.netlify.com
- Build logs: View in Netlify Dashboard → Deploys

---

## Environment Variables by Backend

### Using Railway Backend

```
VITE_API_BASE_URL=https://pg-crud-api-production.railway.app/api
```

### Using Render Backend

```
VITE_API_BASE_URL=https://pg-crud-api.onrender.com/api
```

### Using Vercel Backend

```
VITE_API_BASE_URL=https://pg-crud-api.vercel.app/api
```

### Using Local Backend (for testing)

```
VITE_API_BASE_URL=/api
```

(Requires running backend on same domain or use localhost with `netlify dev`)

---

## Verify Deployment

After deployment, test all features:

- [ ] Dashboard loads with stats
- [ ] Users page loads user list
- [ ] Posts page loads posts list
- [ ] Can create new user
- [ ] Can create new post
- [ ] Can edit user
- [ ] Can edit post
- [ ] Can delete user
- [ ] Can delete post
- [ ] Benchmark runs successfully

---

**Congratulations! Your app is now live on Netlify! 🎉**

See DEPLOYMENT.md for backend deployment options.
