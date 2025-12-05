# AI Healthcare Blog Automation System - Setup Guide

## Overview
This system automatically generates and publishes 2-3 healthcare blog posts daily using OpenAI and Perplexity APIs. It includes trend analysis, content generation, scheduling, and an admin dashboard.

## Architecture

### Frontend (React + Vite)
- Dashboard with blog management
- Article library with search and filtering
- Admin dashboard for automation control
- Real-time monitoring of AI generation

### Backend (Node.js + Express)
- MongoDB database for persistent storage
- REST API for blog operations
- Automated scheduling (cron jobs at 9 AM, 2 PM, 6 PM UTC)
- AI integration (OpenAI + Perplexity)
- Trend analysis module

## Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **MongoDB Atlas** account (free tier available)
- **OpenAI API** account with API key
- **Perplexity API** account with API key
- **Fly.io** account (for deployment)

## Step 1: MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free account and log in
3. Create a new cluster (M0 free tier is sufficient)
4. Wait for cluster to deploy (5-10 minutes)
5. Click "Connect" and select "Drivers"
6. Copy the connection string
7. Replace `<username>`, `<password>`, and `<dbname>` with your values
8. Connection string format: `mongodb+srv://username:password@cluster.mongodb.net/healthblog?retryWrites=true&w=majority`

## Step 2: OpenAI API Setup

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API keys section
4. Create a new API key
5. Copy the key (save it securely)
6. Note: You'll need billing set up for API usage

## Step 3: Perplexity API Setup

1. Go to [perplexity.ai](https://www.perplexity.ai/)
2. Sign up for API access
3. Navigate to API section
4. Create API key
5. Copy the key (save it securely)

## Step 4: Local Development Setup

### Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Configure Environment Variables

**Backend Configuration** (`server/.env`):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthblog?retryWrites=true&w=majority
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4
PERPLEXITY_API_KEY=pplx-your-key-here
PERPLEXITY_MODEL=pplx-7b-online

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

**Frontend Configuration** (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

### Run Development Servers

**Terminal 1 - Frontend**:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

**Terminal 2 - Backend**:
```bash
cd server
npm run dev
# Backend runs on http://localhost:3001
```

## Step 5: Access Admin Dashboard

1. Open frontend: `http://localhost:5173`
2. Navigate to: **⚙️ AI Admin**
3. You should see:
   - Scheduler status (should show "running")
   - Publication schedule (9 AM, 2 PM, 6 PM UTC)
   - Trending topics section
   - Manual trigger buttons

## Step 6: Test the System

### Manual Trend Analysis
1. In Admin Dashboard, click **"Analyze Trends"** button
2. Wait 30-60 seconds for Perplexity to fetch trending healthcare topics
3. Check "Trending Healthcare Topics" section - should show pending topics

### Manual Blog Generation
1. Ensure there are pending topics (from trend analysis)
2. Click **"Generate Post"** button
3. Wait 1-2 minutes for OpenAI to generate the blog post
4. New blog post should appear in Dashboard

### Verify in Database
```bash
# Connect to MongoDB Atlas via MongoDB Compass or CLI
# Check collections:
# - blogposts (should have new posts)
# - trendingtopics (should have topics with isProcessed=true)
```

## Step 7: Automated Scheduling

The system automatically runs:
- **6 AM UTC**: Trend analysis (discovers new healthcare topics)
- **9 AM UTC**: Generate & publish blog post
- **2 PM UTC**: Generate & publish blog post
- **6 PM UTC**: Generate & publish blog post

### Timezone Notes
- All times are in UTC
- Convert to your timezone:
  - 9 AM UTC = Check your timezone offset
  - Example: EST is UTC-5, so 9 AM UTC = 4 AM EST

## Step 8: Deploy to Fly.io

### Prepare for Deployment

1. **Create Fly.io Account**: Go to [fly.io](https://fly.io)

2. **Create fly.toml**:
```bash
cp fly.toml.example fly.toml
```

3. **Edit fly.toml**:
```toml
app = "your-health-blog-app"
primary_region = "ord"  # or your preferred region

[env]
  MONGODB_URI = "your_mongodb_atlas_url"
  OPENAI_API_KEY = "sk-..."
  PERPLEXITY_API_KEY = "pplx-..."
  SCHEDULE_TIME_1 = "09:00"
  SCHEDULE_TIME_2 = "14:00"
  SCHEDULE_TIME_3 = "18:00"
```

4. **Install Fly CLI**:
```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
choco install flyctl
```

5. **Login to Fly**:
```bash
flyctl auth login
```

6. **Create and Deploy**:
```bash
flyctl launch
flyctl deploy
```

7. **Set Environment Variables**:
```bash
flyctl secrets set MONGODB_URI="your_mongodb_url"
flyctl secrets set OPENAI_API_KEY="sk-..."
flyctl secrets set PERPLEXITY_API_KEY="pplx-..."
```

8. **Monitor Deployment**:
```bash
flyctl logs
```

## API Endpoints

### Blog Posts
- `GET /api/blog` - Get all published posts
- `GET /api/blog/ai` - Get AI-generated posts only
- `GET /api/blog/:id` - Get post by ID
- `GET /api/blog/slug/:slug` - Get post by slug
- `POST /api/blog` - Create post (manual)
- `PUT /api/blog/:id` - Update post
- `DELETE /api/blog/:id` - Delete post
- `GET /api/blog/stats/summary` - Get statistics

### Admin/Automation
- `GET /api/admin/trends` - Get trending topics
- `POST /api/admin/trends/analyze` - Trigger trend analysis
- `POST /api/admin/posts/generate` - Trigger blog generation
- `GET /api/admin/scheduler/status` - Get scheduler status

## Troubleshooting

### Issue: "Failed to fetch" in Admin Dashboard
**Solution**: Ensure backend is running on port 3001 and frontend can reach it

### Issue: No trending topics appearing
**Causes**:
1. Perplexity API key is invalid
2. API rate limit exceeded
3. Check server logs: `npm run server` terminal

### Issue: Blog posts not generating
**Causes**:
1. OpenAI API key is invalid
2. No pending trending topics (run trend analysis first)
3. Insufficient OpenAI credits
4. Check server logs for detailed errors

### Issue: Scheduler not running
**Solution**: 
1. Check backend logs for errors
2. Verify all environment variables are set
3. Ensure MongoDB connection is working

### Issue: MongoDB Connection Error
**Solution**:
1. Verify MongoDB Atlas connection string
2. Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for development)
3. Ensure network connectivity

## Monitoring & Maintenance

### Check Scheduler Status
```bash
# Terminal
curl http://localhost:3001/api/admin/scheduler/status
```

### View Recent Trending Topics
```bash
curl http://localhost:3001/api/admin/trends
```

### View Blog Statistics
```bash
curl http://localhost:3001/api/blog/stats/summary
```

## API Rate Limits

Be aware of API rate limits and costs:

- **OpenAI**: 
  - gpt-4: ~$0.03/1K input tokens, ~$0.06/1K output tokens
  - Monitor usage at [platform.openai.com/account/usage](https://platform.openai.com/account/usage)

- **Perplexity**: 
  - Check your plan limits
  - Monitor at [perplexity.ai/api](https://www.perplexity.ai/)

## Best Practices

1. **Start with manual triggers** before relying on automation
2. **Review AI-generated content** before publishing (can be enabled in future)
3. **Monitor costs** weekly (set up billing alerts)
4. **Backup MongoDB** regularly
5. **Keep API keys secure** - never commit to version control
6. **Test scheduling** with shorter intervals before production

## Support & Resources

- [OpenAI Documentation](https://platform.openai.com/docs)
- [Perplexity API Docs](https://docs.perplexity.ai/)
- [MongoDB Atlas Help](https://docs.atlas.mongodb.com/)
- [Fly.io Documentation](https://fly.io/docs/)
- [Express.js Guide](https://expressjs.com/)

## Future Enhancements

- [ ] Content review/approval workflow before publishing
- [ ] Email notifications for new posts
- [ ] Advanced analytics dashboard
- [ ] Content calendar view
- [ ] Social media auto-posting
- [ ] Multiple language support
- [ ] SEO optimization suggestions
- [ ] A/B testing framework

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Maintainer**: Health Blog Team
