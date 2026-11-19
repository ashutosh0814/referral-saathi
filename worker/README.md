# ReferralSaathi Gemini Worker

Secure Cloudflare Worker that acts as a Gemini API proxy with Firebase authentication.

## 🔒 Security Features

- ✅ Firebase ID token verification with JWT
- ✅ Token signature, issuer, and audience validation
- ✅ CORS restricted to configured origin
- ✅ Request size limits (10KB max)
- ✅ Message length validation (5-5000 chars)
- ✅ Timeout protection (30s)
- ✅ No logging of API keys or conversations
- ✅ Server-side API key storage

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Cloudflare account** (free tier works)
4. **Wrangler CLI** (installed via npm)
5. **Google Gemini API key** ([Get one here](https://makersuite.google.com/app/apikey))

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd worker
npm install
```

This installs:
- `jose` - JWT verification library
- `wrangler` - Cloudflare Workers CLI

### 2. Configure Environment

The worker needs these environment variables (already configured in `wrangler.jsonc`):

- `FIREBASE_PROJECT_ID`: Your Firebase project ID (`beep-4b926`)
- `ALLOWED_ORIGIN`: Frontend URL (`http://localhost:3000` for dev)
- `GEMINI_MODEL`: Gemini model to use (`gemini-1.5-flash`)

### 3. Set Up API Key (for local development)

**Option A: Using .dev.vars file (Recommended for local development)**

```bash
# Copy the example file
cp .dev.vars.example .dev.vars

# Edit .dev.vars and add your Gemini API key
# GEMINI_API_KEY=your-actual-api-key-here
```

**⚠️ IMPORTANT:** `.dev.vars` is in `.gitignore` and will NEVER be committed!

**Option B: Using Wrangler secrets (for production)**

```bash
# Set the secret (will prompt for value)
wrangler secret put GEMINI_API_KEY

# Or provide directly
echo "your-api-key" | wrangler secret put GEMINI_API_KEY
```

### 4. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add it to `.dev.vars` or as a Wrangler secret

**API Key Format:**
```
AIzaSy... (39 characters)
```

## 🧪 Local Development

### Start the development server:

```bash
npm run dev
```

The worker will be available at:
```
http://localhost:8787
```

### Test the endpoint:

**With Authentication:**
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "token": "your-firebase-id-token",
    "message": "Sure, I can help! Can you send me your resume?"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "analysis": {
    "intent": "resume_requested",
    "confidence": "high",
    "confidenceScore": 90,
    "evidence": "Employee explicitly asks for resume",
    "suggestedReply": "Thank you for your willingness to help!...",
    "nextAction": "Send your resume to the employee",
    "followUpDays": 5
  },
  "userId": "user-id-from-token"
}
```

### Test without API key:

If `GEMINI_API_KEY` is not set, the worker returns:

```json
{
  "error": "Gemini API not configured",
  "fallback": true,
  "message": "Using rule-based assistant..."
}
```

This allows the frontend to fall back to the rule-based system.

## 🌐 Deployment to Cloudflare

### 1. Login to Cloudflare

```bash
wrangler login
```

### 2. Update Production Configuration

Edit `wrangler.jsonc` and update `ALLOWED_ORIGIN`:

```jsonc
"vars": {
  "ALLOWED_ORIGIN": "https://your-production-domain.com"
}
```

### 3. Set Production Secrets

```bash
wrangler secret put GEMINI_API_KEY
```

### 4. Deploy

```bash
npm run deploy
```

### 5. Get Worker URL

After deployment, Wrangler will show your worker URL:
```
https://referralsaathi-gemini-worker.your-subdomain.workers.dev
```

Update your frontend `.env` to use this URL:
```
VITE_AI_WORKER_URL=https://referralsaathi-gemini-worker.your-subdomain.workers.dev
```

## 🔍 Testing & Debugging

### View real-time logs:

```bash
npm run tail
```

### Test error cases:

**Invalid token:**
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"token": "invalid", "message": "test"}'
```

Response: `401 Unauthorized`

**Message too long:**
```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{"token": "valid-token", "message": "..."}'  # 5001+ chars
```

Response: `400 Bad Request`

**Wrong origin:**
```bash
curl -X POST http://localhost:8787 \
  -H "Origin: https://evil-site.com" \
  -d '{"token": "valid-token", "message": "test"}'
```

Response: `403 Forbidden`

## 🛡️ Security Considerations

### What the Worker Does:

✅ Validates Firebase authentication tokens
✅ Verifies JWT signatures using Google's public keys
✅ Checks token issuer and audience
✅ Enforces CORS restrictions
✅ Validates request sizes and message lengths
✅ Protects API keys server-side
✅ Handles timeouts gracefully

### What the Worker Does NOT Do:

❌ Log complete messages or conversations
❌ Log API keys or tokens
❌ Store any data
❌ Create users or manage authentication
❌ Allow requests from unauthorized origins

### Token Verification:

The worker verifies Firebase ID tokens by:
1. Fetching Google's public keys (JWKS)
2. Verifying signature with RS256 algorithm
3. Checking issuer: `https://securetoken.google.com/beep-4b926`
4. Checking audience: `beep-4b926`
5. Extracting user ID from `sub` or `user_id` claim

## 📊 API Specification

### Endpoint

```
POST /
```

### Request Headers

```
Content-Type: application/json
Origin: <allowed-origin>
```

### Request Body

```json
{
  "token": "firebase-id-token",
  "message": "employee message to analyze"
}
```

### Response (Success - 200)

```json
{
  "success": true,
  "analysis": {
    "intent": "resume_requested",
    "confidence": "high",
    "confidenceScore": 90,
    "evidence": "...",
    "suggestedReply": "...",
    "nextAction": "...",
    "followUpDays": 5
  },
  "userId": "user-id"
}
```

### Response (Error - 4xx/5xx)

```json
{
  "error": "error message",
  "fallback": true  // (optional) frontend should use rule-based system
}
```

### Status Codes

- `200` - Success
- `400` - Bad request (invalid JSON, missing fields, message too long)
- `401` - Unauthorized (invalid or expired token)
- `403` - Forbidden (origin not allowed)
- `405` - Method not allowed (not POST)
- `413` - Payload too large
- `500` - Internal server error
- `503` - Service unavailable (Gemini API not configured)

## 🔧 Configuration

### wrangler.jsonc

```jsonc
{
  "name": "referralsaathi-gemini-worker",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01",
  "compatibility_flags": ["nodejs_compat"],
  
  "vars": {
    "FIREBASE_PROJECT_ID": "beep-4b926",
    "ALLOWED_ORIGIN": "http://localhost:3000",
    "GEMINI_MODEL": "gemini-1.5-flash"
  }
}
```

### Gemini Models

Available models:
- `gemini-1.5-flash` - Fast, efficient (recommended)
- `gemini-1.5-pro` - More capable, slower
- `gemini-pro` - Previous generation

## 🐛 Troubleshooting

### "Gemini API not configured"

**Problem:** `GEMINI_API_KEY` not set

**Solution:**
1. Create `.dev.vars` file with your API key
2. Or set secret: `wrangler secret put GEMINI_API_KEY`

### "Invalid or expired authentication token"

**Problem:** Firebase token verification failed

**Solution:**
1. Check user is logged in on frontend
2. Verify `FIREBASE_PROJECT_ID` matches your project
3. Check token isn't expired (tokens expire after 1 hour)

### "Origin not allowed"

**Problem:** Request from unauthorized origin

**Solution:**
Update `ALLOWED_ORIGIN` in `wrangler.jsonc` to match your frontend URL

### "Request timeout"

**Problem:** Gemini API took too long (>30s)

**Solution:**
1. Check your internet connection
2. Try again (temporary Gemini API issue)
3. Frontend should fall back to rule-based system

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Firebase Auth Token Verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [jose JWT Library](https://github.com/panva/jose)

## 📝 Notes

- The worker uses `jose` for JWT verification (Cloudflare Workers compatible)
- Firebase public keys are fetched from Google's JWKS endpoint
- The worker has NO database or persistent storage
- All configuration is via environment variables
- API keys are NEVER logged or exposed
- The worker is stateless and scales automatically

## ⚠️ Important Reminders

1. **NEVER commit `.dev.vars`** - It contains your API key!
2. **NEVER commit `GEMINI_API_KEY`** - Use Wrangler secrets!
3. **Update `ALLOWED_ORIGIN`** before deploying to production
4. **Monitor usage** - Gemini API has rate limits and costs
5. **Keep `jose` updated** - Security patches are important

---

## 🎉 Ready to Test!

The worker is now ready for local testing. When you have your Gemini API key:

1. Add it to `.dev.vars`:
   ```bash
   echo "GEMINI_API_KEY=your-key-here" > .dev.vars
   ```

2. Start the worker:
   ```bash
   npm run dev
   ```

3. Test from your frontend application

**If you don't have a Gemini API key yet**, the rule-based assistant will continue to work. The worker will return a 503 error with `fallback: true`, telling the frontend to use the local rules.
