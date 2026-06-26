# VERCEL DEPLOYMENT GUIDE

## 🚀 One-Command Deployment

```bash
# 1. Ensure your code is on GitHub
git add .
git commit -m "Ready for Vercel deployment"
git push origin main

# 2. Go to https://vercel.com/new
# 3. Select your repository
# 4. Vercel auto-detects settings
# 5. Add Environment Variables (below)
# 6. Click "Deploy"
```

## 🔑 Environment Variables

Add these to Vercel (Settings → Environment Variables):

| Key | Value | Where to find |
|-----|-------|---------------|
| `VITE_SUPABASE_URL` | `https://YOUR_PROJECT.supabase.co` | Supabase → Settings → API |
| `VITE_SUPABASE_PROJECT_ID` | `YOUR_PROJECT_ID` | Supabase → Settings → API → Project Ref |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbG...` | Supabase → Settings → API → Anon Key |

**✅ MUST use Supabase "Anon Public Key" - NOT Service Key**

## 📋 Pre-Deployment Checklist

```bash
# 1. Build locally (must succeed)
npm run build

# 2. Check for TypeScript errors
npm run lint

# 3. Test production build
npm run preview

# 4. Verify .env is NOT in git
git status | grep ".env"  # Should show nothing

# 5. Commit and push
git push origin main
```

## ✅ Verification After Deploy

1. **Vercel Dashboard** → Deployments → View latest
2. Check status: Should be "✓ Ready"
3. Click deployment URL
4. Test site functionality
5. Check browser console (F12) for errors

## 🐛 If Build Fails

### Error: "Cannot find module"
```bash
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Fix dependencies"
git push origin main
```

### Error: "Environment variables undefined"
1. Vercel Dashboard → Settings → Environment Variables
2. Confirm variables start with `VITE_`
3. Redeploy: Click "..." → "Redeploy"

### Error: "Supabase connection failed"
1. Verify credentials are correct
2. Supabase project → Authentication → URL Configuration
3. Add: `https://YOUR-DOMAIN.vercel.app`
4. Try again

### Error: "Build succeeded but site shows error"
1. Click Vercel URL → Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Verify Supabase CORS settings

## 🔍 Debug Commands

```bash
# Check what Vercel will build
npm run build

# Check build output size
du -sh dist/

# List dist files
ls -la dist/

# Simulate Vercel build locally
npm run build && npm run preview
```

## 🔐 Security Reminders

- ✅ `.env` file is in `.gitignore` (check: `cat .gitignore | grep .env`)
- ✅ Never paste credentials in code
- ✅ Only use Anon Key for client-side (Service Key is for backend only)
- ✅ Store secrets only in Vercel Environment Variables

## 📊 Monitor Performance

After deployment:
1. Vercel Dashboard → Analytics tab
2. Monitor Core Web Vitals
3. Check deployment duration

## 🔄 Re-Deploy

### Auto (Recommended)
```bash
git push origin main  # Vercel auto-redeploys
```

### Manual
```bash
# Using Vercel CLI
vercel --prod

# Or in Vercel Dashboard → Deployments → "..." → "Redeploy"
```

## 🎯 Next Steps

1. ✅ Deploy to Vercel
2. ✅ Test all features work
3. ✅ Set up custom domain (optional)
4. ✅ Enable automatic deployments
5. ✅ Monitor logs regularly

---

**Need help?**
- Check build logs: Vercel Dashboard → Deployments → Logs
- Test locally: `npm run build && npm run preview`
- Verify env vars: Vercel Settings → Environment Variables
