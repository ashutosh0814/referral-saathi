# Gemini Worker Setup Guide

## 📋 Overview

This guide explains how to set up the Cloudflare Worker that acts as a secure proxy for the Gemini API.

**What it does:**
- ✅ Validates Firebase authentication
- ✅ Calls Gemini API securely (API key never exposed to frontend)
- ✅ Returns AI-powered intent analysis
- ✅ Falls back to rule-based system if not configured

**What you need:**
- Cloudflare account (free tier works)
- Google Gemini API key (free tier available)
- 10 minutes to set up

---

## 🚀 Quick Start

### Step 1: Navigate to Worker Directory

```bash
cd worker
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `jose` (^5.2.0) - JWT verification for Firebase tokens
- `wrangler` (^3.28.0) - Cloudflare Workers CLI

### Step 3: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)

### Step 4: Create Local Environment File

```bash
# Copy the example
cp .dev.vars.example .dev.vars

# Edit .dev.vars and paste your API key
# File content should be:
# GEMINI_API_KEY=AIzaSy...your-key-here
```

**IMPORTANT:** `.dev.vars` is in `.gitignore` and will NOT be committed!

### Step 5: Start Development Server

```bash
npm run dev
```

Worker runs at: **http://localhost:8787**

### Step 6: Test the Worker

Open a new terminal and test:

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "token": "test-token",
    "message": "Can you send me your resume?"
  }'
```

**Note:** This will fail authentication (401) unless you provide a valid Firebase ID token. That's expected! It means the security is working.

---

## 🔗 Integrate with Frontend

### Update Environment Variable

Update your main project's `.env` file:

```bash
# In the root directory (not worker directory)
# Add or update:
VITE_AI_WORKER_URL=http://localhost:8787
```

### How Frontend Will Use It

The frontend will:
1. Get the user's Firebase ID token
2. Send it with the employee message to the worker
3. Worker validates token and calls Gemini
4. Returns AI-powered analysis
5. If worker fails/not configured, falls back to rule-based system

---

## 🧪 Testing the Complete Flow

### Prerequisites:
- Main app running: `npm run dev` (in root directory)
- Worker running: `npm run dev` (in worker directory)
- User logged in to the app

### Test Steps:

1. **Navigate to a referral detail page**
2. **Click "Open Assistant"**
3. **Paste employee message**: "Sure, I'd be happy to help! Can you send your resume?"
4. **Click "Analyze Response"**

**Expected Result:**
- If worker configured: AI-powered analysis from Gemini
- If worker not configured: Rule-based analysis (existing system)

Both work! The app gracefully falls back.

---

## 🌐 Deploy to Production

### 1. Login to Cloudflare

```bash
wrangler login
```

This opens a browser for authentication.

### 2. Update Production Config

Edit `wrangler.jsonc`:

```jsonc
"vars": {
  "FIREBASE_PROJECT_ID": "beep-4b926",
  "ALLOWED_ORIGIN": "https://your-production-domain.com",  // ← Update this!
  "GEMINI_MODEL": "gemini-1.5-flash"
}
```

### 3. Set Production Secret

```bash
wrangler secret put GEMINI_API_KEY
# Paste your API key when prompted
```

### 4. Deploy

```bash
npm run deploy
```

### 5. Update Frontend

Wrangler will output your worker URL:
```
https://referralsaathi-gemini-worker.your-subdomain.workers.dev
```

Update your production `.env`:
```
VITE_AI_WORKER_URL=https://referralsaathi-gemini-worker.your-subdomain.workers.dev
```

---

## 🔒 Security Features

### Firebase Token Verification

The worker validates tokens by:
1. **Fetching Google's public keys** (JWKS)
2. **Verifying signature** (RS256 algorithm)
3. **Checking issuer**: `https://securetoken.google.com/beep-4b926`
4. **Checking audience**: `beep-4b926` (your project ID)
5. **Extracting user ID** from verified token

### CORS Protection

- Only allows requests from `ALLOWED_ORIGIN`
- Rejects all other origins with 403 Forbidden

### Request Validation

- Max request size: 10KB
- Message length: 5-5000 characters
- Content type: Must be JSON
- Method: Only POST allowed

### No Data Logging

The worker NEVER logs:
- ❌ API keys
- ❌ Complete conversations
- ❌ User tokens
- ❌ Personal information

Only logs:
- ✅ Error messages (no sensitive data)
- ✅ Request counts (for monitoring)

---

## 💰 Cost Considerations

### Cloudflare Workers (Free Tier)

- **100,000 requests/day** - FREE
- Paid plan: $5/month for 10M requests

### Google Gemini API (Free Tier)

**Gemini 1.5 Flash:**
- **15 requests per minute** - FREE
- **1,500 requests per day** - FREE
- **1 million tokens per month** - FREE

**Typical Usage:**
- Each analysis: ~500 tokens
- Free tier: ~2,000 analyses/month
- More than enough for personal use!

### Recommendation

Start with free tiers. You'll know when you need to upgrade.

---

## 🐛 Troubleshooting

### Issue: "Gemini API not configured"

**Error in response:**
```json
{
  "error": "Gemini API not configured",
  "fallback": true
}
```

**Solution:**
1. Check `.dev.vars` file exists in `worker/` directory
2. Verify it contains: `GEMINI_API_KEY=your-key`
3. Restart the worker: Stop (Ctrl+C) and `npm run dev` again

### Issue: "Invalid or expired authentication token"

**Error:** 401 Unauthorized

**Causes:**
1. User not logged in on frontend
2. Token expired (Firebase tokens last 1 hour)
3. Wrong Firebase project ID in config

**Solution:**
1. Make sure user is logged in
2. Refresh the page (gets new token)
3. Verify `FIREBASE_PROJECT_ID` matches your Firebase project

### Issue: "Origin not allowed"

**Error:** 403 Forbidden

**Solution:**
Update `ALLOWED_ORIGIN` in `wrangler.jsonc` to match your frontend URL:
- Local: `http://localhost:3000`
- Production: `https://your-domain.com`

### Issue: Worker not starting

**Error:** Port 8787 already in use

**Solution:**
```bash
# Find and kill the process
netstat -ano | findstr :8787
taskkill /PID <pid> /F

# Or use a different port
wrangler dev --port 8788
```

### Issue: "Request timeout"

**Error:** 500 Internal Server Error after 30 seconds

**Causes:**
1. Gemini API temporarily slow
2. Network issues
3. Invalid API key

**Solution:**
1. Try again (usually temporary)
2. Check API key is correct
3. Frontend will fall back to rule-based system

---

## 🔍 Monitoring & Debugging

### View Real-time Logs

```bash
# In worker directory
npm run tail
```

This shows live logs from your deployed worker.

### Test Specific Scenarios

**Test with valid authentication:**
```bash
# Get a real Firebase token from your app
# (Open DevTools → Application → IndexedDB → firebaseLocalStorage)
# Copy the token value

curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "token": "eyJhbGciOi...",  # Real Firebase token
    "message": "Sure, I can help! Send me your resume."
  }'
```

**Test error handling:**
```bash
# Missing token
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}'
# Expected: 401 Unauthorized

# Message too short
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"token": "test", "message": "hi"}'
# Expected: 400 Bad Request

# Wrong origin
curl -X POST http://localhost:8787 \
  -H "Origin: https://evil-site.com" \
  -d '{"token": "test", "message": "test message"}'
# Expected: 403 Forbidden
```

---

## 📊 API Response Format

### Success (200 OK)

```json
{
  "success": true,
  "analysis": {
    "intent": "resume_requested",
    "confidence": "high",
    "confidenceScore": 90,
    "evidence": "Employee explicitly requests resume or CV",
    "suggestedReply": "Thank you for your willingness to help! I've attached my resume to this message. Please let me know if you need any additional information.",
    "nextAction": "Send your resume to the employee",
    "followUpDays": 5
  },
  "userId": "firebase-user-id"
}
```

### Fallback (503 Service Unavailable)

```json
{
  "error": "Gemini API not configured",
  "fallback": true,
  "message": "Using rule-based assistant. Configure GEMINI_API_KEY for AI-powered analysis."
}
```

When frontend sees `fallback: true`, it uses the rule-based system.

---

## 🎯 Best Practices

### Development

1. **Keep `.dev.vars` secret** - Never commit it
2. **Test locally first** - Before deploying
3. **Monitor logs** - Use `npm run tail`
4. **Test error cases** - Not just happy path

### Production

1. **Use Wrangler secrets** - Not environment variables
2. **Update ALLOWED_ORIGIN** - To production domain
3. **Monitor usage** - Check Cloudflare dashboard
4. **Set up alerts** - For errors or high usage

### Security

1. **Rotate API keys** - Periodically
2. **Monitor logs** - For suspicious activity
3. **Keep dependencies updated** - `npm update`
4. **Don't log sensitive data** - Already implemented

---

## ✅ Verification Checklist

Before going to production:

- [ ] Dependencies installed (`npm install`)
- [ ] Gemini API key obtained
- [ ] `.dev.vars` created with API key
- [ ] Worker starts successfully (`npm run dev`)
- [ ] Frontend connects to worker
- [ ] Authentication works (401 for invalid tokens)
- [ ] Analysis returns valid results
- [ ] Fallback works when worker unavailable
- [ ] CORS configured correctly
- [ ] Production config updated in `wrangler.jsonc`
- [ ] Production secret set (`wrangler secret put GEMINI_API_KEY`)
- [ ] Deployed successfully (`npm run deploy`)
- [ ] Frontend `.env` updated with production worker URL
- [ ] Tested in production environment

---

## 📞 Getting Help

If you encounter issues:

1. **Check logs**: `npm run tail`
2. **Review troubleshooting section** above
3. **Check Cloudflare Workers docs**: https://developers.cloudflare.com/workers/
4. **Check Gemini API docs**: https://ai.google.dev/docs

---

## 🎉 Success!

Once set up, you'll have:

✅ Secure API proxy with Firebase authentication
✅ AI-powered intent detection via Gemini
✅ Automatic fallback to rule-based system
✅ Production-ready deployment
✅ Scalable infrastructure (Cloudflare)
✅ No exposed API keys

The worker handles all security, the frontend handles the UX, and users get the best experience automatically!
