# Deployment Guide - Blog Generator

Complete step-by-step guide for deploying your Blog Generator to production.

## Prerequisites

- Node.js 18+ installed locally
- Git (for version control)
- Account on your chosen hosting platform

## Local Build & Testing

### 1. Prepare for Production Build

```bash
# Install dependencies
npm install

# Run development server (optional, for testing)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### 2. Verify Build Output

```bash
# Check dist folder exists and has content
ls -la dist/

# Typical structure:
# dist/
# ├── index.html
# ├── assets/
# │   ├── main-xxx.js
# │   ├── vendor-xxx.js
# │   └── style-xxx.css
```

## Deployment Options

### Option 1: Netlify (⭐ Recommended for Beginners)

#### Step 1: Connect Repository
```bash
# Option A: Via Git
# 1. Push code to GitHub, GitLab, or Bitbucket
# 2. Go to https://app.netlify.com
# 3. Click "New site from Git"
# 4. Select your repository

# Option B: Via Drag & Drop
# 1. Build locally: npm run build
# 2. Go to https://app.netlify.com
# 3. Drag dist/ folder into drop zone
```

#### Step 2: Configure Netlify
Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[context.production]
  command = "npm run build"

[context.deploy-preview]
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Step 3: Deploy
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy (will ask for authentication)
netlify deploy --prod --dir dist
```

**Result**: Your site is live at `yoursite.netlify.app`

### Option 2: Vercel

#### Step 1: Install Vercel CLI
```bash
npm i -g vercel
```

#### Step 2: Deploy
```bash
# First deployment (interactive)
vercel

# Answer prompts:
# - Link to existing project? No
# - What's your project's name? blog-generator
# - In which directory is your code? ./
# - Want to modify vercel.json? No
```

#### Step 3: Production Deployment
```bash
vercel --prod
```

**Result**: Your site is live at `blog-generator.vercel.app`

### Option 3: GitHub Pages

#### Step 1: Update Vite Config
Edit `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/repository-name/', // If deploying to subdirectory
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  }
});
```

#### Step 2: Create GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### Step 3: Configure GitHub Pages
1. Go to Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select branch: gh-pages

**Result**: Your site is live at `username.github.io/repository-name`

### Option 4: AWS Amplify

#### Step 1: Install Amplify CLI
```bash
npm install -g @aws-amplify/cli
```

#### Step 2: Initialize Amplify
```bash
amplify init

# Follow prompts to set up AWS credentials
# Choose "dist" as build folder
```

#### Step 3: Add Hosting
```bash
amplify add hosting

# Select: Hosting with Amplify Console
# Build and deploy settings automatically detected
```

#### Step 4: Deploy
```bash
amplify publish

# This builds and publishes your app
```

**Result**: Your site is live at `amplify-app-id.amplifyapp.com`

### Option 5: AWS S3 + CloudFront

#### Step 1: Create S3 Bucket
```bash
aws s3 mb s3://my-blog-generator
```

#### Step 2: Upload Build Files
```bash
# Build locally
npm run build

# Upload to S3
aws s3 sync dist/ s3://my-blog-generator --delete
```

#### Step 3: Configure CloudFront (Optional)
```bash
# Use AWS CloudFront for CDN distribution
# Caches content at edge locations globally
```

### Option 6: Docker Deployment

#### Create Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### Build & Run
```bash
# Build Docker image
docker build -t blog-generator .

# Run container
docker run -p 3000:3000 blog-generator

# Push to Docker Hub
docker tag blog-generator username/blog-generator
docker push username/blog-generator
```

## Post-Deployment Configuration

### 1. Custom Domain Setup

#### Netlify
1. Go to Site Settings → Domain Management
2. Add Custom Domain
3. Follow DNS instructions

#### Vercel
1. Go to Project Settings → Domains
2. Add Domain
3. Configure DNS records as shown

### 2. HTTPS/SSL Certificate
Most platforms auto-enable HTTPS. Verify:
- ✅ URL starts with `https://`
- ✅ Green lock icon in browser
- ✅ Security headers present

### 3. Environment Variables (if needed)
Add to hosting platform:
```
VITE_API_URL=https://api.example.com
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Monitoring & Maintenance

### Health Checks
After deployment, verify:
- [ ] Site loads without errors
- [ ] No console errors in DevTools
- [ ] Create blog post works
- [ ] Upload images works
- [ ] View blog works
- [ ] Comments work
- [ ] Export HTML works
- [ ] Navigation links work

### Performance Monitoring

**Using Lighthouse:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Audit your deployed site
lighthouse https://your-deployed-site.com --view
```

**Key Metrics to Monitor:**
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
- First Contentful Paint (FCP): < 1.8s

### Enable Analytics

**Google Analytics:**
1. Go to analytics.google.com
2. Create new property for your blog
3. Get measurement ID
4. Add to HTML head:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Set Up Error Tracking

**Using Sentry:**
```bash
npm install @sentry/react
```

Initialize in main.jsx:
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/project-id",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: ./dist
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Production Deployment"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Rollback Procedures

### Netlify
1. Go to Deploys section
2. Find previous successful deployment
3. Click "Publish deploy"

### Vercel
1. Go to Deployments
2. Find previous production deployment
3. Click "Promote to Production"

### GitHub Pages
1. Revert commits in main branch
2. GitHub Actions automatically redeployed

## Troubleshooting Deployments

### Build Fails
```bash
# Clear cache
rm -rf dist node_modules

# Reinstall and rebuild
npm install
npm run build

# Check for errors
npm run build 2>&1 | grep -i error
```

### Site Shows 404 for Routes
Add redirect rules to your hosting:

**Netlify (netlify.toml):**
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Vercel (vercel.json):**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Storage Not Working
- Clear browser cache
- Check localStorage isn't disabled
- Verify not in private/incognito mode
- Check browser developer tools → Application → Local Storage

### Performance Issues
1. Run Lighthouse audit
2. Check for large assets
3. Enable compression on server
4. Use CDN for static assets
5. Optimize images further

## Success Metrics

Your deployment is successful when:
✅ Site loads in < 3 seconds
✅ All features work
✅ No console errors
✅ Lighthouse score > 80
✅ Mobile friendly
✅ HTTPS enabled
✅ Database/storage working

---

**Last Updated**: 2024
**Status**: Production Ready ✅
