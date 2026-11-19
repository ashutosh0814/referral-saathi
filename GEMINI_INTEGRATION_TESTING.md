# Gemini AI Integration Testing Guide

## Overview
This guide covers testing the complete Gemini AI integration with the Reply Assistant, including consent flow, AI analysis, rule-based fallback, and status suggestions.

## Prerequisites

### Services Running
1. **Main App**: http://localhost:3000 (running)
2. **Worker**: http://localhost:8787 (running)
3. **Gemini API Key**: Configured in `worker/.dev.vars`

### Firebase Authentication
- User must be signed in to use AI features
- Authentication required for Firebase ID token

---

## Test Scenarios

### 1. First-Time Consent Flow

**Purpose**: Verify consent modal appears and preferences are stored

**Steps**:
1. Clear localStorage: Open DevTools → Application → Local Storage → Delete `referralsaathi_ai_consent`
2. Navigate to any referral detail page
3. Click "Open Assistant"
4. Select "AI-Powered" mode (toggle button)
5. Paste a test message: `"Sure, I can help! Can you send me your resume?"`
6. Click "Analyze with AI"

**Expected Result**:
- ✅ Consent modal appears with detailed explanation
- ✅ Shows what data gets shared (message, company, job, status)
- ✅ Shows what doesn't get shared (name, email, full history)
- ✅ Link to Google's API terms is present
- ✅ "Don't ask again" checkbox is available

**Actions to Test**:
- Click "Use AI Analysis" → Modal closes, analysis begins
- Click "Use Rule-Based Only" → Modal closes, switches to rule-based mode
- Check "Don't ask again" before clicking → Preference is stored

**Verification**:
```javascript
// In DevTools Console:
localStorage.getItem('referralsaathi_ai_consent')
// Should show stored preferences
```

---

### 2. AI-Powered Analysis

**Purpose**: Verify AI analysis with Gemini API

**Test Messages**:

#### Resume Request
```
"Thanks for reaching out! I'd be happy to help. Could you send me your resume and the job posting link?"
```

**Expected AI Analysis**:
- Intent: `resume_requested` or `details_requested`
- Confidence: 75-95%
- Source Badge: "AI Analysis" (blue gradient)
- Status Suggestion: `details_requested`
- Suggested Reply: Professional response offering resume

#### Positive Agreement
```
"Sure, I can refer you! Just applied internally on your behalf. Should hear back in 2-3 days."
```

**Expected AI Analysis**:
- Intent: `referral_submitted`
- Confidence: 85-100%
- Status Suggestion: `referral_submitted`
- Suggested Reply: Thank you message
- Follow-up: 2-3 days

#### Ambiguous Response
```
"Let me check with my team."
```

**Expected AI Analysis**:
- Intent: `will_check`
- Confidence: 40-60% (medium/low)
- Status Suggestion: null or `waiting_response`
- Low confidence warning should appear
- Suggested Reply: Polite acknowledgment

---

### 3. Rule-Based Analysis

**Purpose**: Verify fallback to pattern matching

**Steps**:
1. Open Reply Assistant
2. Select "Rule-Based" mode
3. Paste: `"Can you send me your CV and the job description?"`
4. Click "Analyze Response"

**Expected Result**:
- ✅ Analysis completes quickly (500ms delay)
- ✅ Source Badge: "Rule-Based" (gray)
- ✅ Detects intent using regex patterns
- ✅ No status suggestions (rule-based doesn't provide this)
- ✅ Confidence based on pattern matching

---

### 4. Automatic Fallback on AI Failure

**Purpose**: Test graceful degradation when AI is unavailable

**Simulate AI Failure**:
1. Stop the worker: Find worker terminal and press Ctrl+C
2. OR temporarily change `.env`: `VITE_AI_WORKER_URL=http://localhost:9999` (wrong port)

**Steps**:
1. Select "AI-Powered" mode
2. Paste a message
3. Click "Analyze with AI"

**Expected Result**:
- ✅ Error message appears: "AI analysis failed: [reason]"
- ✅ Message: "Falling back to rule-based analysis..."
- ✅ After 1 second, rule-based analysis completes
- ✅ Source Badge: "Fallback Analysis" (amber)
- ✅ Result shows with rule-based patterns

---

### 5. Status Update Integration

**Purpose**: Verify AI-suggested status updates work

**Steps**:
1. Use AI mode with message: `"I've submitted your referral to the hiring manager!"`
2. Wait for AI analysis
3. Check for status suggestion in AnalysisResult
4. In SuggestedReply section, checkbox appears: "Update referral status to 'referral_submitted'"
5. Check the checkbox
6. Click "Confirm & Add to Timeline"

**Expected Result**:
- ✅ Checkbox appears only when AI provides statusSuggestion
- ✅ Checkbox shows suggested status in readable format
- ✅ After confirmation, referral status updates automatically
- ✅ Status badge in header reflects new status
- ✅ Both messages (received + sent) added to timeline

---

### 6. Confidence Score Display

**Purpose**: Verify confidence indicators work correctly

**Test Different Confidence Levels**:

#### High Confidence (75-100%)
Message: `"Yes, I can definitely refer you. Send me your resume."`
- ✅ Green badge: "HIGH"
- ✅ Confidence score in green
- ✅ Checkmark icon
- ✅ No warning messages

#### Medium Confidence (50-74%)
Message: `"Let me see what I can do."`
- ✅ Yellow badge: "MEDIUM"
- ✅ Confidence score in yellow
- ✅ Warning triangle icon
- ✅ Interpretation: "Review carefully"

#### Low Confidence (<50%)
Message: `"Thanks."`
- ✅ Red badge: "LOW"
- ✅ Confidence score in red
- ✅ Alert icon
- ✅ Amber warning banner: "Low confidence reply: Please review carefully"

---

### 7. Mode Switching

**Purpose**: Verify seamless switching between AI and rule-based

**Steps**:
1. Start in AI mode, analyze a message
2. Switch to Rule-Based mode (click toggle)
3. Analyze the same message again
4. Compare results

**Expected Result**:
- ✅ Mode switch is instant
- ✅ No errors when switching
- ✅ Button states update correctly
- ✅ Tips section changes based on mode
- ✅ Previous analysis clears when switching

---

### 8. Edit and Confirm Reply

**Purpose**: Test reply customization workflow

**Steps**:
1. Complete any analysis (AI or rule-based)
2. Review suggested reply
3. Click "Edit Reply"
4. Modify the message
5. Click "Save Changes"
6. Optionally check status update checkbox
7. Click "Confirm & Add to Timeline"

**Expected Result**:
- ✅ Edit mode shows textarea with current text
- ✅ Character count updates
- ✅ Cancel restores original text
- ✅ "Modified" badge appears after editing
- ✅ Confirmation adds both messages to timeline
- ✅ Assistant closes after successful confirmation

---

### 9. Copy to Clipboard

**Purpose**: Test clipboard functionality

**Steps**:
1. Complete analysis
2. Click "Copy to Clipboard" button

**Expected Result**:
- ✅ Button text changes to "Copied!" (green checkmark)
- ✅ Returns to "Copy to Clipboard" after 2 seconds
- ✅ Text is in clipboard (test by pasting elsewhere)

---

### 10. Error Handling

**Test Various Error Scenarios**:

#### Network Error
- Disconnect internet
- Try AI analysis
- ✅ Shows: "Network error. Please check your connection."
- ✅ Automatically falls back to rules

#### Invalid Token
- Sign out and try to analyze
- ✅ Shows: "Please sign in to use AI analysis."
- ✅ Falls back to rule-based

#### Timeout
- (Hard to test locally, but implemented)
- ✅ Should show: "Request timed out. Please try again."
- ✅ Falls back to rules after 30 seconds

#### Rate Limit (Gemini API)
- Make many rapid requests
- ✅ Shows: "Too many requests. Please wait a moment."
- ✅ Suggests trying again later

---

## Verification Checklist

### UI/UX
- [ ] Consent modal is clear and informative
- [ ] Mode toggle buttons work smoothly
- [ ] Loading states show during analysis
- [ ] Error messages are user-friendly
- [ ] Success states are clear
- [ ] All icons render correctly
- [ ] Badges show appropriate colors

### Functionality
- [ ] AI analysis returns structured JSON
- [ ] Rule-based analysis detects intents correctly
- [ ] Fallback mechanism works automatically
- [ ] Status suggestions appear when appropriate
- [ ] Status updates apply correctly
- [ ] Messages save to Firestore
- [ ] Consent preferences persist
- [ ] Edit workflow functions properly

### Security
- [ ] Gemini API key never exposed in frontend
- [ ] Firebase token sent in Authorization header
- [ ] CORS properly configured
- [ ] Worker validates requests
- [ ] No sensitive data logged

### Performance
- [ ] AI analysis completes in <5 seconds typically
- [ ] Rule-based analysis completes in <1 second
- [ ] No memory leaks on repeated use
- [ ] Worker handles concurrent requests

---

## Debug Tools

### Check Consent Status
```javascript
// DevTools Console
const consent = localStorage.getItem('referralsaathi_ai_consent');
console.log(JSON.parse(consent));
```

### Clear Consent (Force Re-prompt)
```javascript
localStorage.removeItem('referralsaathi_ai_consent');
```

### Check Worker Logs
Look at the worker terminal for:
- Request received logs
- Token verification results
- Gemini API calls
- Error messages

### Check Network Requests
DevTools → Network → Filter by "analyze"
- Verify Authorization header present
- Check request payload
- Verify response structure

---

## Common Issues & Solutions

### Issue: Consent modal doesn't appear
**Solution**: Check localStorage for existing consent. Clear it to re-trigger.

### Issue: AI analysis fails immediately
**Solutions**:
1. Verify worker is running on port 8787
2. Check `.env` has correct `VITE_AI_WORKER_URL`
3. Verify Gemini API key in `worker/.dev.vars`
4. Check worker logs for errors

### Issue: Status update checkbox doesn't appear
**Solution**: AI must return `statusSuggestion` field. Test with clear messages like "I submitted your referral."

### Issue: Fallback doesn't trigger
**Solution**: Ensure error handling is in ReplyAnalyzer's handleAnalyze function. Should catch errors and call rule-based analysis.

### Issue: "Invalid token" errors
**Solutions**:
1. Ensure user is signed in
2. Token might be expired - sign out and back in
3. Check Firebase project ID matches in worker config

---

## Success Criteria

All tests pass when:
1. ✅ Consent flow works on first use
2. ✅ AI analysis returns structured, accurate results
3. ✅ Rule-based analysis works independently
4. ✅ Automatic fallback triggers on AI errors
5. ✅ Status suggestions work and apply correctly
6. ✅ Confidence scores display accurately
7. ✅ All badges and indicators show correct state
8. ✅ Edit and confirm workflow completes successfully
9. ✅ No console errors during normal operation
10. ✅ Build completes without errors

---

## Next Steps After Testing

If all tests pass:
1. Deploy worker to Cloudflare: `cd worker && npm run deploy`
2. Update production `.env` with worker URL
3. Monitor Gemini API usage in Google Cloud Console
4. Consider implementing:
   - Usage analytics
   - A/B testing AI vs rules
   - Feedback mechanism for bad suggestions
   - Rate limiting per user
   - Caching for common queries

---

## Test Results Template

```
Date: ___________
Tester: ___________

| Test Scenario | Status | Notes |
|--------------|--------|-------|
| 1. Consent Flow | ⬜ Pass ⬜ Fail | |
| 2. AI Analysis | ⬜ Pass ⬜ Fail | |
| 3. Rule-Based | ⬜ Pass ⬜ Fail | |
| 4. Auto Fallback | ⬜ Pass ⬜ Fail | |
| 5. Status Update | ⬜ Pass ⬜ Fail | |
| 6. Confidence Display | ⬜ Pass ⬜ Fail | |
| 7. Mode Switching | ⬜ Pass ⬜ Fail | |
| 8. Edit & Confirm | ⬜ Pass ⬜ Fail | |
| 9. Copy Feature | ⬜ Pass ⬜ Fail | |
| 10. Error Handling | ⬜ Pass ⬜ Fail | |

Overall: ⬜ PASS ⬜ FAIL
```
