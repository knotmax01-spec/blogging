# Security & Persistence Setup Guide

This guide walks you through setting up the 4 critical fixes that were just implemented.

## Overview of Changes

| Feature | Status | Requirement |
|---------|--------|-------------|
| 1. Admin Authentication | ✅ Implemented | Set `ADMIN_API_KEY` |
| 2. Env Var Validation | ✅ Implemented | Set all required vars |
| 3. Server Persistence | ✅ Implemented | Connect to MongoDB |
| 4. Automated Publishing | ✅ Implemented | Ready to use |

---

## Quick Start (5 minutes)

### 1. Create Server .env File
```bash
cd server
cp .env.example .env
```

### 2. Edit `server/.env` with Your API Keys

**Required (server won't start without these):**
```env
# Get from MongoDB Atlas
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/healthblog?retryWrites=true&w=majority

# Get from OpenAI Dashboard  
OPENAI_API_KEY=sk-YOUR_KEY_HERE

# Get from Perplexity
PERPLEXITY_API_KEY=pplx-YOUR_KEY_HERE

# Generate a strong random string (use: openssl rand -hex 32)
ADMIN_API_KEY=your-generated-api-key-here
```

**Optional:**
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Start Development Servers
```bash
# From root directory
npm run dev-all

# This starts:
# - Frontend on http://localhost:5173
# - Backend on http://localhost:3001
```

### 4. Test the Setup
```bash
# Open browser and navigate to http://localhost:5173

# Try creating a new blog post
# It will be saved to MongoDB and display in the list

# Try accessing /admin to trigger AI generation
# (Remember: requires OPENAI_API_KEY and PERPLEXITY_API_KEY)
```

---

## Detailed Setup

### Getting Required API Keys

#### MongoDB URI
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy connection string
5. Replace `<username>:<password>` with your credentials
6. Add `?retryWrites=true&w=majority` to the end

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (you can only see it once)
4. Paste into `OPENAI_API_KEY`

#### Perplexity API Key
1. Go to https://api.perplexity.ai
2. Get your API key from dashboard
3. Paste into `PERPLEXITY_API_KEY`

#### ADMIN_API_KEY (Generate Yourself)
```bash
# macOS/Linux
openssl rand -hex 32

# Windows PowerShirt
[Convert]::ToHexString([byte[]](1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## Feature Testing

### Test 1: Admin Authentication
```bash
# This should fail (401)
curl http://localhost:3001/api/admin/scheduler/status

# Output: {"error":"Missing authorization header","status":"unauthorized"}

# This should work
curl -H "Authorization: Bearer your-admin-api-key-here" \
  http://localhost:3001/api/admin/scheduler/status

# Output: {"status":"running","scheduleTimes":[...]}
```

### Test 2: Post Creation & Server Persistence
1. Open http://localhost:5173
2. Click "📝 Publish Health Article"
3. Fill in post details and save
4. Check that:
   - ✅ Post appears in dashboard
   - ✅ Post is saved to MongoDB
   - ✅ Post displays in "Latest Health Articles"
   - ✅ Editor can fetch and edit it

### Test 3: Blog Publishing
```javascript
// Using browser console or API client:
const response = await fetch('/api/blog/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Article',
    slug: 'test-article',
    content: '<h2>Section</h2><p>Content here</p>',
    author: 'Health Blogger',
    category: 'Healthcare',
    tags: ['test', 'health'],
  })
});

const result = await response.json();
// result.url => "/published-blogs/test-article.html"
```

### Test 4: Environment Validation
1. Stop the server: `Ctrl+C`
2. Edit `server/.env` and comment out OPENAI_API_KEY
3. Run `npm run dev:backend`
4. Server should print warnings and still start (warning for missing keys)
5. Try to use admin endpoints that need OpenAI - they'll fail gracefully

---

## File Structure After Setup

```
project/
├── .env.local                          # Frontend config (new)
├── server/
│   ├── .env                            # Backend config (create from .env.example)
│   ├── .env.example                    # Template (updated)
│   ├── middleware/
│   │   └── auth.js                     # NEW - Authentication middleware
│   ├── utils/
│   │   ├── envValidator.js             # NEW - Env var validation
│   │   ├── manifestManager.js          # NEW - Publishing automation
│   │   └── ...
│   ├── routes/
│   │   ├── blog.js                     # Updated - Added /publish endpoint
│   │   └── admin.js                    # Updated - Added auth middleware
│   └── server.js                       # Updated - Env validation at startup
├── src/
│   ├── components/
│   │   ├── BlogEditor.jsx              # Updated - Uses server API
│   │   └── BlogList.jsx                # Updated - Uses server API
│   ├── services/
│   │   └── api.js                      # Updated - Added publishPost()
│   └── ...
├── public/
│   ├── published-blogs/                # NEW - Generated HTML files stored here
│   ├── blog-manifest.json              # Updated automatically
│   └── ...
└── IMPLEMENTATION_FIXES.md             # NEW - Documentation of fixes
```

---

## Troubleshooting

### Issue: Server won't start, "missing required environment variables"

**Solution:**
1. Check `server/.env` file exists
2. Ensure all 4 required vars are set:
   - MONGODB_URI
   - OPENAI_API_KEY
   - PERPLEXITY_API_KEY
   - ADMIN_API_KEY
3. No empty strings - values must be actual keys/URIs

### Issue: API calls return 401 Unauthorized

**Solution:**
- Admin endpoints now require authentication
- Include header: `Authorization: Bearer <ADMIN_API_KEY>`
- Check the exact key matches what's in `server/.env`

### Issue: Posts aren't showing up in list

**Solution:**
1. Check MongoDB connection is working
   ```bash
   # From Node console:
   import mongoose from 'mongoose';
   await mongoose.connect(process.env.MONGODB_URI);
   console.log('Connected:', mongoose.connection.readyState === 1);
   ```
2. Make sure `BlogList` is loading from server API (not just localStorage)
3. Check browser console for fetch errors

### Issue: Blog publishing fails

**Solution:**
1. Ensure `public/published-blogs/` directory exists
2. Check server has write permissions in `public/` directory
3. Verify blog content is valid (not empty/null)
4. Check server logs for specific error message

### Issue: HMR connection errors when deploying to Fly.io

**Solution:**
Set these environment variables:
```bash
fly secrets set VITE_HMR_HOST="your-app.fly.dev"
fly secrets set VITE_HMR_PORT="443"
fly secrets set VITE_HMR_PROTOCOL="wss"
```

---

## Next Steps

### Immediate (Optional but Recommended)
- [ ] Test all 4 features with the testing guide above
- [ ] Set up CI/CD to deploy to Fly.io
- [ ] Monitor logs for any errors

### Short Term (from remaining 7 incomplete items)
- [ ] Add actual logs retrieval endpoint
- [ ] Implement scheduler run history persistence
- [ ] Add response validation in client components

### Medium Term
- [ ] Add rate limiting to prevent abuse
- [ ] Implement request signing for security
- [ ] Add audit logging for admin actions
- [ ] Set up monitoring/alerting

---

## Security Best Practices

### Do's ✅
- [ ] Keep ADMIN_API_KEY secret (treat like password)
- [ ] Use strong, random ADMIN_API_KEY (at least 32 chars)
- [ ] Rotate API keys periodically
- [ ] Enable IP whitelisting on MongoDB
- [ ] Use HTTPS in production
- [ ] Keep npm dependencies updated

### Don'ts ❌
- [ ] Don't commit .env files to git
- [ ] Don't share API keys in code comments
- [ ] Don't use same key for multiple services
- [ ] Don't log sensitive data
- [ ] Don't expose error messages in production

---

## Support

If you encounter issues:
1. Check IMPLEMENTATION_FIXES.md for detailed feature documentation
2. Review server logs: `npm run dev:backend` shows all logs
3. Verify all env vars are set: `cat server/.env`
4. Test connectivity: `curl http://localhost:3001/health`

