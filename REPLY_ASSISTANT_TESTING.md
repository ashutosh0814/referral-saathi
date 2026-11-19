# Reply Assistant - Testing Guide

## 🎯 Feature Overview

The Reply Assistant is a rule-based AI helper that:
- Analyzes employee responses to detect intent
- Provides confidence scoring
- Suggests appropriate replies
- Recommends next actions and follow-up intervals
- Updates referral status automatically (with confirmation)

**12 Detectable Intents:**
1. Resume Requested
2. Job ID Requested
3. Job Details Requested
4. Employee Agrees to Help
5. Will Check with HR
6. Will Contact Hiring Manager
7. Referral Submitted
8. Referral Declined
9. No Vacancy Available
10. Referral Link Shared
11. Follow-up Requested
12. Unclear Message

---

## 📋 Test Scenarios

### Test 1: Resume Requested

**Employee Message:**
```
Sure, I'd be happy to help! Can you send me your resume?
```

**Expected Results:**
- ✅ Intent: **Resume Requested**
- ✅ Confidence: **HIGH** (80%+)
- ✅ Matched Phrase: "Can you send me your resume"
- ✅ Next Action: "Send your resume to the employee"
- ✅ Suggested Reply: Contains "attached my resume"
- ✅ Follow-up: 5 days
- ✅ Suggested Status: details_requested

**Variations to Test:**
- "Could you please share your CV?"
- "Please email me your resume"
- "I need your resume to proceed"

---

### Test 2: Job ID Requested

**Employee Message:**
```
What's the job ID for this position?
```

**Expected Results:**
- ✅ Intent: **Job ID Requested**
- ✅ Confidence: **HIGH**
- ✅ Matched Phrase: "job ID"
- ✅ Next Action: "Provide the job ID or requisition number"
- ✅ Suggested Reply: Contains "[INSERT_JOB_ID]" placeholder
- ✅ Follow-up: 5 days

**Variations to Test:**
- "Send me the requisition number"
- "What's the req ID?"
- "Need the job code"

---

### Test 3: Job Details Requested

**Employee Message:**
```
Can you send me the job description?
```

**Expected Results:**
- ✅ Intent: **Job Details Requested**
- ✅ Confidence: **HIGH**
- ✅ Matched Phrase: "job description"
- ✅ Next Action: "Send the job description or posting link"
- ✅ Suggested Reply: Contains job posting link placeholder
- ✅ Follow-up: 5 days

---

### Test 4: Employee Agrees to Help

**Employee Message:**
```
Absolutely! I'd be happy to refer you.
```

**Expected Results:**
- ✅ Intent: **Employee Agrees to Help**
- ✅ Confidence: **HIGH**
- ✅ Matched Phrase: "Absolutely" or "happy to refer"
- ✅ Next Action: "Provide resume and job details"
- ✅ Suggested Reply: Thanks employee, mentions attaching resume
- ✅ Follow-up: 7 days
- ✅ Suggested Status: employee_agreed

**Variations to Test:**
- "Sure, no problem!"
- "Yeah, I can help with that"
- "Of course, I'll submit your referral"

---

### Test 5: Will Check with HR

**Employee Message:**
```
Let me check with HR first and get back to you.
```

**Expected Results:**
- ✅ Intent: **Will Check with HR**
- ✅ Confidence: **HIGH**
- ✅ Matched Phrase: "check with HR"
- ✅ Next Action: "Wait for HR feedback"
- ✅ Suggested Reply: Thanks for checking
- ✅ Follow-up: 7 days
- ✅ Suggested Status: employee_agreed

---

### Test 6: Will Contact Hiring Manager

**Employee Message:**
```
I'll talk to the hiring manager and see what they say.
```

**Expected Results:**
- ✅ Intent: **Will Contact Hiring Manager**
- ✅ Confidence: **HIGH**
- ✅ Matched Phrase: "talk to the hiring manager"
- ✅ Next Action: "Wait for manager feedback"
- ✅ Follow-up: 7 days

---

### Test 7: Referral Submitted

**Employee Message:**
```
Good news! I've submitted your referral. You should hear from the recruiter soon.
```

**Expected Results:**
- ✅ Intent: **Referral Submitted**
- ✅ Confidence: **HIGH**
- ✅ Matched Phrase: "submitted your referral"
- ✅ Next Action: "Thank the employee and wait for HR contact"
- ✅ Suggested Reply: Thanks for submitting
- ✅ Follow-up: 14 days
- ✅ Suggested Status: referral_submitted

**Variations to Test:**
- "I've already sent your resume to the team"
- "Your referral has been forwarded"
- "Done! You should hear from them soon"

---

### Test 8: Referral Declined

**Employee Message:**
```
I'm sorry, but I don't think I can help with this one.
```

**Expected Results:**
- ✅ Intent: **Referral Declined**
- ✅ Confidence: **HIGH**
- ✅ Matched Phrase: "sorry" or "can't help"
- ✅ Next Action: "Thank them and move on"
- ✅ Suggested Reply: Understanding response
- ✅ Follow-up: null (no follow-up)
- ✅ Suggested Status: rejected

**Variations to Test:**
- "Unfortunately, I'm not comfortable referring for this role"
- "I have to decline this time"
- "Sorry, I won't be able to help"

---

### Test 9: No Vacancy Available

**Employee Message:**
```
There are no openings in that team right now.
```

**Expected Results:**
- ✅ Intent: **No Vacancy Available**
- ✅ Confidence: **HIGH**
- ✅ Matched Phrase: "no openings"
- ✅ Next Action: "Thank them and ask about future opportunities"
- ✅ Suggested Reply: Thanks, asks to keep in mind for future
- ✅ Follow-up: 30 days
- ✅ Suggested Status: closed

**Variations to Test:**
- "The position has been filled"
- "We're not hiring for that role currently"
- "Hiring freeze in that department"

---

### Test 10: Referral Link Shared

**Employee Message:**
```
Here's the referral link: https://company.com/jobs/apply?ref=12345
```

**Expected Results:**
- ✅ Intent: **Referral Link Shared**
- ✅ Confidence: **HIGH**
- ✅ Matched Phrase: URL or "referral link"
- ✅ Next Action: "Use the referral link to apply"
- ✅ Suggested Reply: Thanks for link, will apply
- ✅ Follow-up: 3 days
- ✅ Suggested Status: details_requested

---

### Test 11: Follow-up Requested

**Employee Message:**
```
Let me get back to you next week.
```

**Expected Results:**
- ✅ Intent: **Follow-up Requested**
- ✅ Confidence: **MEDIUM to HIGH**
- ✅ Matched Phrase: "get back" or "next week"
- ✅ Next Action: "Wait for the specified time and follow up"
- ✅ Suggested Reply: Acknowledges follow-up timing
- ✅ Follow-up: 7 days

**Variations to Test:**
- "I'll update you in a few days"
- "Check back with me after the weekend"
- "Give me some time to look into this"

---

### Test 12: Unclear Message

**Employee Message:**
```
Hmm, maybe.
```

**Expected Results:**
- ✅ Intent: **Unclear Message**
- ✅ Confidence: **LOW** (<50%)
- ✅ Next Action: "Ask for clarification"
- ✅ Suggested Reply: Politely asks for clarification
- ✅ Follow-up: 3 days

**Other Unclear Examples:**
- Very short messages (< 5 words)
- Ambiguous responses
- Messages with unclear context

---

## 🧪 Advanced Testing Scenarios

### Test 13: Multiple Intents

**Employee Message:**
```
Sure, I can help! Can you send me your resume and the job ID?
```

**Expected Results:**
- ✅ Primary Intent: **Resume Requested** (prioritized)
- ✅ Confidence: **MEDIUM** (multiple intents detected)
- ✅ Warning: "Multiple intents detected, also found: Job ID Requested"
- ✅ Alternative Intents listed

---

### Test 14: Low Confidence

**Employee Message:**
```
Maybe I can look into it.
```

**Expected Results:**
- ✅ Confidence: **LOW** (due to uncertainty words like "maybe")
- ✅ Confidence Interpretation: Warning about ambiguity
- ✅ Suggestion to review carefully

---

### Test 15: Edit Suggested Reply

**Steps:**
1. Analyze any message
2. Click "Edit Reply" button
3. Modify the suggested response
4. Click "Save Changes"
5. Verify "Modified" badge appears
6. Click "Confirm & Add to Timeline"

**Expected:**
- ✅ Can edit the reply text
- ✅ Modified badge shows
- ✅ Edited version is sent, not original

---

### Test 16: Copy to Clipboard

**Steps:**
1. Analyze message
2. Click "Copy to Clipboard"
3. Paste into text editor

**Expected:**
- ✅ "Copied!" success message appears (2 seconds)
- ✅ Exact suggested reply text is in clipboard
- ✅ Button icon changes to checkmark temporarily

---

### Test 17: Confirmation Workflow

**Steps:**
1. Open Reply Assistant
2. Paste employee message
3. Click "Analyze Response"
4. Review analysis
5. Click "Confirm & Add to Timeline"

**Expected:**
- ✅ Both messages added to timeline (received + sent)
- ✅ Employee's message appears first (left-aligned)
- ✅ Your reply appears second (right-aligned)
- ✅ Status updates if suggested
- ✅ Assistant closes after confirmation
- ✅ Messages persist after refresh

---

### Test 18: Cancel Operations

**Test canceling at different stages:**

**Cancel Analysis:**
- Clear button clears the textarea
- No analysis performed

**Cancel Suggestion:**
- "Cancel" button dismisses the suggestion
- Returns to paste area
- No messages added

**Cancel Edit:**
- "Cancel" in edit mode
- Reverts to original suggested reply
- Returns to view mode

---

## 🎨 UI/UX Testing

### Visual Checks

**Color Coding:**
- [ ] High confidence → Green header, success badge
- [ ] Medium confidence → Yellow header, warning badge
- [ ] Low confidence → Red header, error badge

**Icons:**
- [ ] Sparkles icon on main button
- [ ] CheckCircle2 for high confidence
- [ ] AlertTriangle for medium confidence
- [ ] AlertCircle for low confidence
- [ ] Quote icon for matched phrase
- [ ] Target icon for full message
- [ ] TrendingUp icon for next action
- [ ] Calendar icon for follow-up
- [ ] Send icon for confirm button
- [ ] Copy icon for clipboard
- [ ] Edit2 icon for edit

**Layout:**
- [ ] Gradient headers (violet/purple)
- [ ] Proper spacing and alignment
- [ ] Responsive on mobile
- [ ] All text readable
- [ ] No overflow issues

---

## 🔄 Integration Testing

### Test with Real Referrals

**Prerequisites:**
1. Have an active referral
2. Navigate to referral detail page
3. See "Need help replying?" card

**Workflow:**
1. Click "Open Assistant"
2. Paste employee response
3. Analyze
4. Review all sections
5. Edit reply if needed
6. Confirm
7. Verify timeline updates
8. Verify status updates
9. Refresh browser
10. Verify persistence

---

## ⚠️ Edge Cases

### Test Empty Input
- Paste empty string
- **Expected:** Validation error

### Test Very Short Message
- Paste "ok"
- **Expected:** Error about message being too short

### Test Very Long Message
- Paste 500+ word message
- **Expected:** Still analyzes, might have lower confidence

### Test Special Characters
- Paste message with emojis: "Sure! 👍 Can you send your resume?"
- **Expected:** Analyzes correctly, ignores emojis

### Test Multiple Sentences
- Paste: "Thanks for reaching out. I'd love to help. Can you send me your resume and the job link?"
- **Expected:** Detects primary intent correctly

---

## 📊 Pattern Accuracy Testing

Test each pattern variant for all 12 intents. Use the examples provided in each test scenario above.

**Success Criteria:**
- ✅ 90%+ accuracy on primary test cases
- ✅ Correct intent detection for variations
- ✅ Appropriate confidence levels
- ✅ Relevant suggested replies
- ✅ Accurate follow-up intervals

---

## 🐛 Known Limitations

1. **Rule-based only** - No AI/ML, patterns may miss creative phrasings
2. **English only** - Won't work with other languages
3. **Context-limited** - Doesn't remember previous conversations
4. **Conservative** - May classify ambiguous messages as "unclear"
5. **No sentiment analysis** - Doesn't detect tone (sarcasm, enthusiasm)

---

## ✅ Success Checklist

After testing, all these should work:

- [ ] All 12 intents detected correctly
- [ ] Confidence scoring accurate
- [ ] Matched phrases highlighted
- [ ] Next actions appropriate
- [ ] Suggested replies relevant
- [ ] Follow-up intervals sensible
- [ ] Copy to clipboard works
- [ ] Edit reply functionality works
- [ ] Confirmation adds both messages
- [ ] Status updates correctly
- [ ] Assistant opens/closes properly
- [ ] No console errors
- [ ] Build succeeds
- [ ] Responsive design works
- [ ] Data persists after refresh

---

## 📝 Test Results Log

Date: _______________
Tester: _______________

| Intent | Test Passed | Notes |
|--------|-------------|-------|
| 1. Resume Requested | ⬜ | |
| 2. Job ID Requested | ⬜ | |
| 3. Job Details Requested | ⬜ | |
| 4. Employee Agrees | ⬜ | |
| 5. Will Check HR | ⬜ | |
| 6. Will Contact Manager | ⬜ | |
| 7. Referral Submitted | ⬜ | |
| 8. Referral Declined | ⬜ | |
| 9. No Vacancy | ⬜ | |
| 10. Referral Link Shared | ⬜ | |
| 11. Follow-up Requested | ⬜ | |
| 12. Unclear Message | ⬜ | |

**Overall Status:** ⬜ Pass ⬜ Fail

**Issues Found:**
_________________________________
_________________________________
_________________________________
