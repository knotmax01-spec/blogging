# Quick Start - AI Healthcare Blog Automation

## 5-Minute Setup

### 1. Get API Keys
- **OpenAI**: https://platform.openai.com/api-keys
- **Perplexity**: https://www.perplexity.ai/api
- **MongoDB**: https://www.mongodb.com/cloud/atlas (free tier)

### 2. Configure Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthblog
OPENAI_API_KEY=sk-your-key
PERPLEXITY_API_KEY=pplx-your-key
```

### 3. Configure Frontend

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server && npm install && cd ..
```

### 5. Run Everything

**Option A: Two Terminals**
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run dev:backend
```

**Option B: Single Terminal (with concurrently)**
```bash
npm run dev-all
```

### 6. Access Admin Dashboard
- Frontend: http://localhost:5173
- Click **⚙️ AI Admin** in navigation
- Click **"Analyze Trends"** to fetch trending topics
- Click **"Generate Post"** to create a blog post

## What Happens Automatically

- **Every day at 6 AM UTC**: System analyzes healthcare trends
- **Daily at 9 AM, 2 PM, 6 PM UTC**: System generates & publishes blog posts

## Testing Without Waiting

In Admin Dashboard:
1. **Test Trends**: Click "Analyze Trends" button
2. **Test Generation**: Click "Generate Post" button
3. **View Results**: Check Dashboard for new posts

## Common Issues

### "Failed to fetch" in Admin Dashboard
```bash
# Check if backend is running
curl http://localhost:3001/api/admin/scheduler/status

# Should return scheduler status JSON
```

### "No API keys found" error in logs
```bash
# Verify .env file exists in server/
cat server/.env

# Restart backend
npm run dev:backend
```

### "No pending topics"
```bash
# Run trend analysis first
curl -X POST http://localhost:3001/api/admin/trends/analyze
```

## Next Steps

1. Read full guide: [AI_BLOG_SETUP.md](./AI_BLOG_SETUP.md)
2. Deploy to Fly.io: Follow deployment section in setup guide
3. Monitor costs: Set up billing alerts in OpenAI & Perplexity
4. Customize: Edit content prompts in `server/utils/contentGenerator.js`

## Database Inspection

```bash
# Use MongoDB Compass or Atlas UI to view:
# - blogposts collection (your generated posts)
# - trendingtopics collection (discovered trends)
```

## File Structure

```
health-blog-ai/
├── src/                          # Frontend React app
│   ├── components/
│   │   ├── AdminDashboard.jsx   # 🆕 AI control panel
│   │   ├── BlogList.jsx
│   │   └── ...
│   └── services/
│       └── api.js                # 🆕 Backend API calls
├── server/                        # 🆕 Backend Node.js/Express
│   ├── models/                    # MongoDB schemas
│   │   ├── BlogPost.js
│   │   └── TrendingTopic.js
│   ├── utils/                     # AI integration
│   │   ├── contentGenerator.js    # OpenAI integration
│   │   ├── trendAnalyzer.js       # Perplexity integration
│   │   └── scheduler.js           # Cron scheduling
│   ├── routes/                    # API endpoints
│   │   ├── blog.js
│   │   └── admin.js
│   └── server.js                  # Main server file
├── AI_BLOG_SETUP.md              # 📖 Full setup guide
└── QUICK_START_AI.md             # 📖 This file
```

## Key Components

### AdminDashboard.jsx
- Monitor scheduler status
- View trending topics (pending & processed)
- Manual trigger buttons for trends & generation
- Real-time statistics

### Backend Services
- **trendAnalyzer.js**: Fetches healthcare trends via Perplexity
- **contentGenerator.js**: Creates blog posts via OpenAI
- **scheduler.js**: Runs automated jobs via node-cron

### Database Models
- **BlogPost**: Stores all blog posts with AI metadata
- **TrendingTopic**: Tracks healthcare trends and processing status

---

**Need more help?** See [AI_BLOG_SETUP.md](./AI_BLOG_SETUP.md) for comprehensive guide.
