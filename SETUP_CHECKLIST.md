# AI Healthcare Blog Automation - Setup Checklist

Complete this checklist to get your automated blog system running.

## ✅ Phase 1: Prepare API Keys & Accounts

- [ ] **MongoDB Atlas**
  - [ ] Create account at https://mongodb.com/cloud/atlas
  - [ ] Create M0 free tier cluster
  - [ ] Wait for cluster deployment (5-10 min)
  - [ ] Get connection string with credentials
  - [ ] Test connection: `mongosh "mongodb+srv://..."`

- [ ] **OpenAI**
  - [ ] Create account at https://platform.openai.com
  - [ ] Add payment method
  - [ ] Generate API key at https://platform.openai.com/api-keys
  - [ ] Copy key to safe location
  - [ ] Note: gpt-4 is pricey, gpt-3.5-turbo is cheaper

- [ ] **Perplexity**
  - [ ] Sign up at https://www.perplexity.ai/
  - [ ] Access API dashboard
  - [ ] Generate API key
  - [ ] Copy key to safe location

## ✅ Phase 2: Configure Backend

```bash
cd server
```

- [ ] Copy environment file
  ```bash
  cp .env.example .env
  ```

- [ ] Edit `server/.env` with:
  ```env
  MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthblog
  OPENAI_API_KEY=sk-YOUR-KEY-HERE
  PERPLEXITY_API_KEY=pplx-YOUR-KEY-HERE
  PORT=3001
  NODE_ENV=development
  FRONTEND_URL=http://localhost:5173
  SCHEDULE_TIME_1=09:00
  SCHEDULE_TIME_2=14:00
  SCHEDULE_TIME_3=18:00
  POSTS_PER_DAY=3
  WORDS_PER_POST=1000
  AUTHOR_NAME=Health Blogger
  ```

- [ ] Verify all values are correct
  - [ ] MONGODB_URI has username and password replaced
  - [ ] API keys don't have quotes
  - [ ] Schedule times are in HH:MM format
  - [ ] No extra spaces or commas

- [ ] Install backend dependencies
  ```bash
  npm install
  cd ..
  ```

## ✅ Phase 3: Configure Frontend

```bash
# From root directory
```

- [ ] Copy environment file
  ```bash
  cp .env.example .env.local
  ```

- [ ] Edit `.env.local`:
  ```env
  VITE_API_URL=http://localhost:3001/api
  ```

- [ ] Install frontend dependencies
  ```bash
  npm install
  ```

## ✅ Phase 4: Run Development Servers

**Option A: Two Terminals (Recommended for development)**

- [ ] Terminal 1 - Frontend:
  ```bash
  npm run dev
  # Should show: ➜  Local:   http://localhost:5173/
  ```

- [ ] Terminal 2 - Backend:
  ```bash
  npm run dev:backend
  # Should show: ✓ Server running on port 3001
  #              ✓ Connected to MongoDB
  ```

**Option B: Single Terminal**

- [ ] Install concurrently
  ```bash
  npm install concurrently --save-dev
  ```

- [ ] Run both:
  ```bash
  npm run dev-all
  ```

## ✅ Phase 5: Verify Setup

- [ ] **Frontend loads**: http://localhost:5173
  - [ ] No errors in browser console
  - [ ] Navigation shows: Dashboard, Article Library, AI Admin

- [ ] **Backend is running**:
  ```bash
  curl http://localhost:3001/health
  # Should return: {"status":"OK",...}
  ```

- [ ] **MongoDB connected**:
  - [ ] No errors in backend terminal
  - [ ] Should see: "✓ Connected to MongoDB"

- [ ] **Scheduler initialized**:
  - [ ] Backend logs show scheduler initialization
  - [ ] Should see trend analysis time and post schedule times

## ✅ Phase 6: Test Admin Dashboard

- [ ] Open **http://localhost:5173/admin**

- [ ] **View Dashboard**:
  - [ ] Scheduler Status visible
  - [ ] Publication Schedule shows 3 times
  - [ ] Statistics cards display
  - [ ] No error messages

- [ ] **Check Scheduler Status Button**:
  ```bash
  curl http://localhost:3001/api/admin/scheduler/status
  # Should return schedule times
  ```

## ✅ Phase 7: Test Trend Analysis

- [ ] In Admin Dashboard, click **"Analyze Trends"**
  - [ ] Should show "⏳ Analyzing..." state
  - [ ] Wait 30-60 seconds
  - [ ] Should see green "✓ Success" message

- [ ] **View Pending Topics**:
  - [ ] Should show 3 trending healthcare topics
  - [ ] Each has relevance score (0-100%)
  - [ ] Shows trend type: evolution, innovation, or emerging

- [ ] **Check Database**:
  ```bash
  # Use MongoDB Atlas UI or Compass to verify:
  # - Database: healthblog
  # - Collection: trendingtopics
  # - Should have 3 documents
  ```

## ✅ Phase 8: Test Blog Generation

- [ ] Ensure pending topics exist (from Phase 7)

- [ ] Click **"Generate Post"** button in Admin Dashboard
  - [ ] Should show "⏳ Generating..." state
  - [ ] Wait 1-2 minutes
  - [ ] Should see green "✓ Success: Blog post generated" message

- [ ] **Verify in Database**:
  ```bash
  # MongoDB Atlas UI:
  # - Collection: blogposts
  # - Should see new document
  # - Check fields: title, content, wordCount, isAIGenerated
  ```

- [ ] **View in Dashboard**:
  - [ ] Go to **Dashboard** (http://localhost:5173/)
  - [ ] Scroll to "Latest Health Articles"
  - [ ] Should see newly generated post
  - [ ] Click to read full article

- [ ] **Check Statistics**:
  - [ ] Admin Dashboard should update
  - [ ] AI Generated count: 1
  - [ ] Total Posts: 1
  - [ ] Avg Words updated

## ✅ Phase 9: Test Manual Generation (Optional)

- [ ] Run trend analysis again
  - [ ] Generate 2-3 more posts
  - [ ] Verify each appears in Dashboard

- [ ] **View AI-Generated Posts Only**:
  ```bash
  curl http://localhost:3001/api/blog/ai
  # Should list all AI-generated posts
  ```

## ✅ Phase 10: Prepare for Deployment (Fly.io)

- [ ] Copy Fly.io configuration
  ```bash
  cp fly.toml.example fly.toml
  ```

- [ ] Edit `fly.toml`:
  ```toml
  app = "your-unique-app-name"  # e.g., "health-blog-ai-123"
  ```

- [ ] Create Fly.io account at https://fly.io

- [ ] Install Fly CLI:
  ```bash
  # macOS
  brew install flyctl

  # Linux
  curl -L https://fly.io/install.sh | sh

  # Windows
  choco install flyctl
  ```

- [ ] Authenticate:
  ```bash
  flyctl auth login
  ```

- [ ] Deploy:
  ```bash
  flyctl launch
  flyctl deploy
  ```

- [ ] Set environment secrets:
  ```bash
  flyctl secrets set MONGODB_URI="your_mongodb_url"
  flyctl secrets set OPENAI_API_KEY="sk-..."
  flyctl secrets set PERPLEXITY_API_KEY="pplx-..."
  ```

- [ ] Monitor deployment:
  ```bash
  flyctl logs
  ```

## ✅ Phase 11: Verify Production Setup

- [ ] Get app URL:
  ```bash
  flyctl status
  ```

- [ ] Update frontend environment:
  ```bash
  # In .env.local or Fly environment
  VITE_API_URL=https://your-app.fly.dev/api
  ```

- [ ] Test production API:
  ```bash
  curl https://your-app.fly.dev/api/health
  ```

- [ ] Access admin dashboard:
  - [ ] Open https://your-app.fly.dev/admin
  - [ ] Should work identically to local version

## ✅ Phase 12: Monitor Automated Execution

- [ ] **Set reminders** to check admin dashboard at:
  - [ ] ~9:05 AM UTC (check for post)
  - [ ] ~2:05 PM UTC (check for post)
  - [ ] ~6:05 PM UTC (check for post)

- [ ] **First week monitoring**:
  - [ ] Verify posts generate automatically
  - [ ] Check content quality
  - [ ] Monitor API usage/costs
  - [ ] Review blog post quality

- [ ] **Set up alerts**:
  - [ ] OpenAI usage alerts (prevent unexpected charges)
  - [ ] MongoDB storage alerts
  - [ ] Perplexity API alerts

## ✅ Phase 13: Customize (Optional)

- [ ] **Change posting times** in `server/.env`:
  ```env
  SCHEDULE_TIME_1=06:00
  SCHEDULE_TIME_2=12:00
  SCHEDULE_TIME_3=20:00
  ```

- [ ] **Adjust content style**:
  - Edit `server/utils/contentGenerator.js`
  - Modify `systemPrompt` for tone
  - Change `TARGET_WORDS` for length

- [ ] **Change AI model** (cost optimization):
  ```env
  OPENAI_MODEL=gpt-3.5-turbo  # Cheaper than gpt-4
  ```

## ✅ Phase 14: Ongoing Maintenance

- [ ] **Weekly Tasks**:
  - [ ] Check OpenAI usage and costs
  - [ ] Review blog quality
  - [ ] Check MongoDB storage usage
  - [ ] Verify scheduler is running

- [ ] **Monthly Tasks**:
  - [ ] Backup MongoDB data
  - [ ] Review trending topics relevance
  - [ ] Optimize prompts if needed
  - [ ] Check for API updates

- [ ] **Monitor Error Logs**:
  ```bash
  # Local development
  # Check both terminal windows for errors

  # Production
  flyctl logs
  ```

## 🆘 Troubleshooting Checklist

If something doesn't work:

- [ ] **"Failed to fetch" in Admin Dashboard**
  ```bash
  # 1. Check backend is running
  curl http://localhost:3001/health
  
  # 2. Check CORS is configured
  # 3. Check VITE_API_URL in .env.local
  ```

- [ ] **"No trending topics appearing"**
  ```bash
  # 1. Verify Perplexity API key in server/.env
  # 2. Check server logs for errors
  # 3. Verify network connectivity
  ```

- [ ] **"Blog post not generating"**
  ```bash
  # 1. Verify OpenAI API key
  # 2. Check OpenAI has credits
  # 3. Ensure pending topics exist
  # 4. Check server logs
  ```

- [ ] **"MongoDB connection error"**
  ```bash
  # 1. Verify connection string in server/.env
  # 2. Check IP whitelist in MongoDB Atlas
  # 3. Verify username/password
  # 4. Check network connectivity
  ```

- [ ] **"Scheduler not running"**
  ```bash
  # 1. Check server logs for initialization
  # 2. Verify NODE_ENV=development
  # 3. Ensure all env vars are set
  # 4. Restart backend server
  ```

## 📞 Support Resources

If you get stuck, check these in order:

1. **Local**: Check server/frontend logs first
2. **Docs**: Read [AI_BLOG_SETUP.md](./AI_BLOG_SETUP.md)
3. **Quick Start**: See [QUICK_START_AI.md](./QUICK_START_AI.md)
4. **Summary**: Check [AI_INTEGRATION_SUMMARY.md](./AI_INTEGRATION_SUMMARY.md)
5. **API Docs**:
   - OpenAI: https://platform.openai.com/docs
   - Perplexity: https://docs.perplexity.ai/
   - MongoDB: https://docs.mongodb.com/

## 🎉 Success Indicators

You'll know everything is working when:

✅ Admin Dashboard shows "running" scheduler status  
✅ Trend analysis button discovers new topics  
✅ Generate button creates blog posts  
✅ New posts appear in Dashboard within seconds  
✅ Database contains posts with AI metadata  
✅ Admin statistics update in real-time  
✅ No errors in browser console or server logs  
✅ Posts auto-publish at scheduled times (after first successful test)

---

## 🚀 Next Steps After Setup

1. **Test for 1 week**: Let it run and monitor quality
2. **Adjust prompts**: Fine-tune content generation
3. **Customize schedule**: Change times if needed
4. **Monitor costs**: Track API spending
5. **Scale up**: Add more posts/day if happy with quality
6. **Deploy**: Push to production on Fly.io

**Estimated total setup time**: 30-45 minutes  
**Estimated API cost (first month)**: $20-50 depending on usage

Good luck! 🏥📝
