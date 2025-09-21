# Deployment Guide

This guide covers deploying the Real-Time Chat Application to production.

## 📂 Repository Structure

The repository contains only the essential files needed for deployment:

### Included Files:
- ✅ `src/` - React source code
- ✅ `public/` - Public assets  
- ✅ `package.json` - Dependencies and scripts
- ✅ `package-lock.json` - Dependency lock file
- ✅ `websocket-server.js` - WebSocket server
- ✅ `websocket-package.json` - WebSocket server dependencies
- ✅ `README.md` - Documentation
- ✅ `.gitignore` - Git ignore rules

### Excluded Files:
- ❌ `node_modules/` - Dependencies (install via npm)
- ❌ `.env` - Environment variables (set in production)
- ❌ `build/` - Generated during deployment
- ❌ IDE files and logs

## 🚀 Frontend Deployment

### Option 1: Netlify (Recommended)

1. **Connect Repository**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub repository

2. **Build Settings**:
   ```
   Build Command: npm run build
   Publish Directory: build
   ```

3. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-laravel-backend.com/api
   REACT_APP_WS_URL=wss://your-websocket-server.com
   ```

### Option 2: Vercel

1. **Connect Repository**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Build Settings**:
   ```
   Framework Preset: Create React App
   Build Command: npm run build
   Output Directory: build
   ```

## 🔌 WebSocket Server Deployment

### Option 1: Railway (Recommended)

1. **Create New Project**:
   - Go to [Railway](https://railway.app)
   - Create new project from GitHub repo

2. **Configuration**:
   ```
   Start Command: node websocket-server.js
   Port: $PORT (Railway provides this)
   ```

3. **Environment Variables**:
   ```
   PORT=8080
   NODE_ENV=production
   ```

### Option 2: Heroku

1. **Create Heroku App**:
   ```bash
   heroku create your-websocket-server
   ```

2. **Deploy**:
   ```bash
   git subtree push --prefix websocket-server heroku main
   ```

3. **Add Procfile**:
   ```
   web: node websocket-server.js
   ```

## 🔧 Production Configuration

### Frontend Updates for Production

Update these files with production URLs:

#### `src/services/api.js`
```javascript
const api = axios.create({
    baseURL: 'https://your-laravel-backend.com/api', // Production API
    // ... rest of config
});
```

#### `src/services/websocket.js`
```javascript
class WebSocketService {
    constructor() {
        this.url = 'wss://your-websocket-server.herokuapp.com'; // Production WebSocket
        // ... rest of config
    }
}
```

### WebSocket Server Updates

#### `websocket-server.js`
```javascript
// Use environment port for production
const PORT = process.env.PORT || 8080;

// Add CORS for production
const corsOrigins = [
    'https://your-frontend-app.netlify.app',
    'https://your-frontend-app.vercel.app'
];
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --dir=build --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-websocket:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: railway-app/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

## 🧪 Testing Production

### Frontend Testing
1. Visit your deployed frontend URL
2. Register/login with test accounts
3. Open multiple tabs to test real-time features

### WebSocket Testing
1. Check WebSocket connection in browser dev tools
2. Test message delivery between different browsers
3. Verify typing indicators work

### Load Testing
```bash
# Install wscat for WebSocket testing
npm install -g wscat

# Test WebSocket connection
wscat -c wss://your-websocket-server.com?token=test-token
```

## 🔒 Security Considerations

### Frontend
- Remove console.logs in production
- Use HTTPS for all API calls
- Validate all user inputs

### WebSocket Server
- Implement proper token validation
- Add rate limiting
- Use WSS (WebSocket Secure) in production
- Add CORS protection

### Laravel Backend
- Use CSRF protection where needed
- Implement proper authentication
- Set up CORS for frontend domain
- Use HTTPS

## 📊 Monitoring

### Frontend Monitoring
- Google Analytics for user tracking
- Sentry for error monitoring
- Lighthouse for performance

### WebSocket Monitoring
- Monitor connection counts
- Track message delivery rates
- Set up health checks

### Backend Monitoring
- Laravel logs
- Database performance
- API response times

## 🚨 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**:
   - Check WebSocket server is running
   - Verify WSS URL in production
   - Check CORS settings

2. **API Calls Failing**:
   - Verify API URL is correct
   - Check authentication tokens
   - Verify CORS settings on backend

3. **Messages Not Real-time**:
   - Check WebSocket connection status
   - Verify server broadcasting logic
   - Check for duplicate message prevention

### Debug Commands
```bash
# Check if WebSocket server is running
curl -I http://your-websocket-server.com

# Test API endpoint
curl https://your-api-server.com/api/test

# Check frontend build
npm run build && serve -s build
```

## 📝 Deployment Checklist

### Pre-deployment
- [ ] Update API URLs for production
- [ ] Update WebSocket URLs for production
- [ ] Remove debug console.logs
- [ ] Test build process locally
- [ ] Set up environment variables

### Frontend Deployment
- [ ] Repository connected to Netlify/Vercel
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled

### WebSocket Deployment
- [ ] Server deployed to Railway/Heroku
- [ ] Environment variables set
- [ ] Health checks working
- [ ] WebSocket connections successful

### Post-deployment
- [ ] Frontend loads correctly
- [ ] User registration/login works
- [ ] Real-time messaging works
- [ ] Multiple browser testing
- [ ] Mobile responsiveness
- [ ] Performance testing

---

🎉 **Congratulations!** Your real-time chat application is now deployed and ready for users!
