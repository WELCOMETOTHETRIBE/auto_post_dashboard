# 🚀 Railway Deployment Guide

## Quick Start

This guide will help you deploy the Tribe SPA to Railway in minutes.

## 1. Prerequisites

- [Railway account](https://railway.app/)
- GitHub repository with your code
- GitHub Personal Access Token (optional)

## 2. Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Connect GitHub Repository**
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `auto_post_dashboard`
   - Select the `cursor-recovery-railway` branch

2. **Railway Auto-Detection**
   - Railway will automatically detect this is a Node.js project
   - It will use `npm start` to run the server
   - No Dockerfile needed!

### Option B: Deploy from Local Files

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

## 3. Environment Variables

Set these in your Railway project dashboard:

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `3000` | Railway sets this automatically |
| `NODE_ENV` | `production` | Environment setting |

### Optional Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `GITHUB_TOKEN` | `ghp_...` | GitHub Personal Access Token |
| `GITHUB_OWNER` | `WELCOMETOTHETRIBE` | GitHub username/organization |
| `GITHUB_REPO` | `auto_post_dashboard` | GitHub repository name |

### How to Set Environment Variables

1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add each variable with its value
5. Click "Add" to save

## 4. GitHub Token Setup (Optional)

If you want to fetch posts from GitHub instead of using mock data:

1. **Create GitHub Token**
   - Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
   - Click "Generate new token (classic)"
   - Select scopes: `repo` (for private repos) or `public_repo` (for public repos)
   - Copy the token

2. **Add to Railway**
   - Set `GITHUB_TOKEN` to your token
   - Set `GITHUB_OWNER` to your username
   - Set `GITHUB_REPO` to your repository name

## 5. Health Check

Railway will automatically check your app's health:

- **Health Check Path**: `/healthz`
- **Expected Response**: `{"ok": true, "timestamp": "...", "version": "v1.0.0-recovery"}`

## 6. Custom Domain (Optional)

1. **Add Domain**
   - Go to your Railway project
   - Click "Settings" tab
   - Scroll to "Domains" section
   - Click "Generate Domain" or add your custom domain

2. **DNS Configuration**
   - Add CNAME record pointing to your Railway domain
   - Wait for DNS propagation (5-10 minutes)

## 7. Monitoring & Logs

### View Logs
- Go to your Railway project
- Click on your service
- Go to "Deployments" tab
- Click on latest deployment
- View logs in real-time

### Metrics
- Railway provides basic metrics in the dashboard
- Monitor CPU, memory, and network usage
- Set up alerts for high resource usage

## 8. Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that `package.json` has correct scripts
   - Ensure all dependencies are in `dependencies` (not `devDependencies`)
   - Verify Node.js version compatibility

2. **App Won't Start**
   - Check environment variables are set correctly
   - Verify `/healthz` endpoint returns 200
   - Check logs for error messages

3. **Posts Not Loading**
   - Verify GitHub token is valid
   - Check GitHub repository permissions
   - App will fallback to mock data if GitHub fails

### Debug Commands

```bash
# Check Railway status
railway status

# View logs
railway logs

# Restart service
railway service restart

# Check environment variables
railway variables
```

## 9. Local Development

Test locally before deploying:

```bash
# Install dependencies
npm install

# Set environment variables
export GITHUB_TOKEN=your_token_here
export GITHUB_OWNER=WELCOMETOTHETRIBE
export GITHUB_REPO=auto_post_dashboard

# Run locally
npm start

# Test endpoints
curl http://localhost:3000/healthz
curl http://localhost:3000/api/git/posts
```

## 10. Update & Redeploy

### Automatic Deployments
- Railway automatically redeploys when you push to your branch
- No manual intervention needed

### Manual Redeploy
```bash
railway up
```

### Rollback
- Go to Railway dashboard
- Click "Deployments"
- Click "Redeploy" on previous deployment

## 11. Cost Optimization

- **Free Tier**: 500 hours/month
- **Pay-as-you-go**: $0.000463 per second
- **Pro Plan**: $20/month for unlimited usage

## 12. Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app/)
- **Community**: [Railway Discord](https://discord.gg/railway)
- **Issues**: Check your Railway project logs first

---

## 🎯 Success Checklist

- [ ] App deployed to Railway
- [ ] Environment variables configured
- [ ] Health check passing (`/healthz`)
- [ ] Posts loading (GitHub or mock data)
- [ ] Modal editing working
- [ ] Mobile responsive design
- [ ] Custom domain configured (optional)

**Your Tribe SPA is now live on Railway! 🚀** 