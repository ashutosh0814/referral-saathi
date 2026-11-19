# Referral Detail Page - Testing Guide

## 🎯 Feature Overview

The Referral Detail Page provides a complete view of a referral with:
- Full referral information (company, job, employee)
- LinkedIn profile actions (open, copy URL)
- Status management
- Conversation timeline with messaging history
- Message composer for adding/editing conversations
- CRUD operations for messages

---

## ✅ Pre-Testing Checklist

- [ ] Dev server is running: `npm run dev`
- [ ] Logged into the application
- [ ] At least one referral exists (create one if needed)
- [ ] Browser DevTools open (F12) to monitor console

---

## 📋 Test Scenarios

### 1. **Navigate to Referral Detail**

**Steps:**
1. Go to "My Referrals" page (http://localhost:3000/referrals)
2. Click on any referral card
3. Verify you're redirected to `/referrals/{referralId}`

**Expected Results:**
- ✅ URL changes to `/referrals/{referralId}`
- ✅ Page loads without errors
- ✅ Loading spinner appears briefly
- ✅ Referral details display correctly

---

### 2. **View Referral Information**

**Verify all information displays correctly:**

**Left Column - Referral Details:**
- [ ] Company name with Building2 icon
- [ ] Job title with Briefcase icon
- [ ] Job posting link (if available) - click to verify it opens
- [ ] Job ID (if available) with Hash icon
- [ ] Last updated timestamp ("X time ago")
- [ ] Employee name
- [ ] Employee designation (if available)
- [ ] Current status badge with correct color
- [ ] Contact notes (if available)

**Status Colors:**
- Not Contacted → Gray
- Message Sent → Blue
- Waiting for Response → Yellow
- Employee Agreed → Indigo
- Details Requested → Indigo
- Referral Submitted → Indigo
- Rejected → Red
- Successful → Green
- Closed → Gray

---

### 3. **Test LinkedIn Actions**

**Open Profile Button:**
1. Click "Open Profile" button
2. Verify LinkedIn profile opens in new tab
3. Verify original tab remains on referral detail page

**Copy URL Button:**
1. Click the Copy button (clipboard icon)
2. Verify checkmark icon appears
3. Verify "Copied to clipboard!" message shows
4. Paste in a text editor (Ctrl+V)
5. Verify correct LinkedIn URL is pasted
6. Wait 2 seconds, verify button returns to copy icon

**Edge Cases:**
- [ ] Test when LinkedIn URL is not provided (button should not appear)

---

### 4. **Test Status Update**

**Steps:**
1. Note current status
2. Click on the status selector dropdown
3. Select a different status
4. Verify status updates immediately
5. Verify badge color changes
6. **Refresh browser (F5)**
7. Verify status persisted correctly

**Test Multiple Status Changes:**
- [ ] Change from "Not Contacted" → "Message Sent"
- [ ] Change from "Message Sent" → "Employee Agreed"
- [ ] Change from "Employee Agreed" → "Referral Submitted"
- [ ] Verify each change persists after refresh

---

### 5. **Test Add Sent Message**

**Steps:**
1. Scroll to "Conversation History" section
2. Verify "Sent Message" is selected by default (violet highlight)
3. Enter message: "Hi John, I'm interested in the Software Engineer position at Google. Would you be willing to provide a referral?"
4. Click "Add Message"
5. Verify message appears in timeline on the RIGHT side
6. Verify message has violet gradient background
7. Verify Send icon appears with timestamp
8. **Refresh browser (F5)**
9. Verify message persisted

**Expected Message Appearance:**
- Aligned right
- Violet gradient background
- Rounded corners (rounded-br-md at bottom right is flat)
- Send icon with timestamp below
- "X time ago" format (e.g., "just now", "2 minutes ago")

---

### 6. **Test Add Received Message**

**Steps:**
1. Click "Received Message" button
2. Verify button changes to blue highlight
3. Enter message: "Sure, I'd be happy to help! Can you send me your resume?"
4. Click "Add Message"
5. Verify message appears in timeline on the LEFT side
6. Verify message has gray background
7. Verify MessageCircle icon appears with timestamp
8. **Refresh browser**
9. Verify message persisted

**Expected Message Appearance:**
- Aligned left
- Gray background
- Rounded corners (rounded-bl-md at bottom left is flat)
- MessageCircle icon with timestamp below

---

### 7. **Test Chronological Ordering**

**Steps:**
1. Add multiple messages in this order:
   - Sent: "Message 1 - sent"
   - Received: "Message 2 - received"
   - Sent: "Message 3 - sent"
   - Received: "Message 4 - received"
2. Verify messages appear from top to bottom in chronological order
3. Oldest message should be at top
4. Newest message should be at bottom

**Visual Check:**
- [ ] Timeline flows chronologically (oldest → newest, top → bottom)
- [ ] Sent messages (right) and received messages (left) alternate correctly
- [ ] Timestamps show progression

---

### 8. **Test Advanced Message Fields**

**Add Message with Intent and Next Action:**
1. Click "Add intent & next action (optional)"
2. Verify advanced section expands
3. Fill in:
   - Message: "Following up on our last conversation"
   - Intent: "Request status update"
   - Next Action: "Wait for response, follow up in 3 days if no reply"
4. Click "Add Message"
5. Verify message displays with:
   - Main message text
   - "Intent: Request status update" (with border separator)
   - "Next: Wait for response..." (with border separator)

**Visual Check:**
- [ ] Intent and Next Action appear below main message
- [ ] Border separator between sections
- [ ] Text color is lighter than main message
- [ ] "Intent:" and "Next:" labels are bold

---

### 9. **Test Edit Message**

**Steps:**
1. Hover over any message
2. Verify three-dot menu icon appears
3. Click the three-dot icon
4. Click "Edit" from dropdown
5. Verify ConversationComposer changes to edit mode:
   - Form pre-fills with message data
   - "Update Message" button appears
   - "Cancel" button appears
6. Modify the message text
7. Click "Update Message"
8. Verify message updates in timeline
9. **Refresh browser**
10. Verify changes persisted

**Test Canceling Edit:**
1. Start editing a message
2. Make changes
3. Click "Cancel"
4. Verify form returns to add mode
5. Verify original message unchanged

---

### 10. **Test Delete Message**

**Steps:**
1. Hover over a message
2. Click three-dot menu
3. Click "Delete" (red text)
4. Verify delete confirmation modal appears:
   - Red alert icon
   - "Delete Message" title
   - Warning message
   - "Cancel" and "Delete" buttons
5. Click "Cancel" first
6. Verify modal closes and message remains
7. Open delete modal again
8. Click "Delete"
9. Verify message disappears from timeline
10. **Refresh browser**
11. Verify message does not reappear

---

### 11. **Test Empty Conversation State**

**Steps:**
1. Create a new referral (or use one without conversations)
2. Navigate to its detail page
3. Verify empty state displays:
   - MessageCircle icon (gray)
   - "No conversations yet" message
   - Helpful text about adding first message

---

### 12. **Test Back Navigation**

**Steps:**
1. Click "Back to Referrals" button
2. Verify navigation back to referrals list
3. Verify URL changes to `/referrals`
4. Verify referral list loads

---

### 13. **Test Responsive Design**

**Desktop (> 1024px):**
- [ ] Left column: 1/3 width
- [ ] Right column: 2/3 width
- [ ] All information visible
- [ ] No horizontal scrolling

**Tablet (768px - 1023px):**
- [ ] Columns stack vertically
- [ ] Details at top, conversations below
- [ ] Cards remain readable
- [ ] No layout breaking

**Mobile (< 768px):**
- [ ] Single column layout
- [ ] Messages max-width 75% still applies
- [ ] LinkedIn buttons stack properly
- [ ] All actions accessible

---

### 14. **Test Direct URL Access**

**Steps:**
1. Copy a referral detail URL (e.g., `/referrals/abc123`)
2. Open in new browser tab
3. Verify page loads correctly
4. Verify all data displays

**Test Invalid ID:**
1. Navigate to `/referrals/invalid-id-999`
2. Verify error message appears:
   - "Error Loading Referral"
   - "Referral not found"
   - "Back to Referrals" button works

---

### 15. **Test Loading States**

**Steps:**
1. Open browser DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Navigate to a referral detail page
4. Verify:
   - Loading spinner appears
   - "Loading referral details..." message shows
   - Page waits for data before rendering
5. After data loads, verify timeline loading:
   - "Loading conversations..." message
   - Animated MessageCircle icon

---

### 16. **Test Error Handling**

**Test Conversation Load Error:**
1. Turn off internet connection (or use DevTools offline mode)
2. Navigate to referral detail
3. Add a message (should fail)
4. Verify error alert appears
5. Reconnect internet
6. Retry operation

---

### 17. **Test Message Validation**

**Empty Message:**
1. Try to submit without entering message
2. Verify "Add Message" button is disabled
3. Enter message text
4. Verify button becomes enabled

**Long Message:**
1. Enter a very long message (> 10,000 characters)
2. Submit
3. Verify validation error appears: "Message must be 10000 characters or less"

---

## 🔥 Firestore Data Verification

### Check Conversations in Firebase Console

1. Go to https://console.firebase.google.com
2. Select project "beep-4b926"
3. Navigate to Firestore Database
4. Go to: `users/{userId}/referrals/{referralId}/conversations`
5. Verify all conversations are stored with:
   - `message` (string)
   - `direction` ("sent" or "received")
   - `intent` (string, optional)
   - `suggestedAction` (string, optional)
   - `referralId` (string)
   - `createdAt` (timestamp)

### Data Structure Example:
```
users/
  └── {userId}/
      └── referrals/
          └── {referralId}/
              ├── companyName: "Google"
              ├── jobTitle: "Senior Software Engineer"
              ├── status: "message_sent"
              └── conversations/
                  ├── {conversationId1}/
                  │   ├── message: "Hi, I'm interested..."
                  │   ├── direction: "sent"
                  │   ├── referralId: "{referralId}"
                  │   └── createdAt: Timestamp
                  └── {conversationId2}/
                      ├── message: "Sure, I'd be happy..."
                      ├── direction: "received"
                      ├── intent: "Agree to help"
                      ├── suggestedAction: "Send resume"
                      ├── referralId: "{referralId}"
                      └── createdAt: Timestamp
```

---

## ✅ Success Criteria

All tests pass when:

- ✅ **Navigation**: Clicking referral card navigates to detail page
- ✅ **Display**: All referral information displays correctly
- ✅ **LinkedIn Actions**: Open and copy LinkedIn URL work
- ✅ **Status Update**: Status changes and persists after refresh
- ✅ **Add Messages**: Both sent and received messages can be added
- ✅ **Edit Messages**: Messages can be edited and changes persist
- ✅ **Delete Messages**: Messages can be deleted with confirmation
- ✅ **Chronological Order**: Messages display oldest to newest
- ✅ **Advanced Fields**: Intent and next action display correctly
- ✅ **Persistence**: All changes survive browser refresh
- ✅ **Loading States**: Loading indicators appear appropriately
- ✅ **Error Handling**: Errors display helpful messages
- ✅ **Validation**: Form validation prevents invalid data
- ✅ **Responsive**: Layout works on all screen sizes
- ✅ **Back Navigation**: Can return to referrals list
- ✅ **No Console Errors**: Browser console shows no errors

---

## 🐛 Common Issues & Solutions

### Issue: "Referral not found" error
**Solution**: Verify the referral ID in the URL matches an existing referral in Firestore

### Issue: Messages not persisting
**Solution**: Check Firestore rules are deployed: `firebase deploy --only firestore:rules`

### Issue: LinkedIn buttons not appearing
**Solution**: Verify the referral has `employeeLinkedIn` field populated

### Issue: Timestamps showing "Invalid date"
**Solution**: Ensure Firestore timestamps are properly formatted (should be Timestamp objects)

### Issue: Messages appearing out of order
**Solution**: Check that `createdAt` timestamps are set correctly

---

## 📝 Test Results Log

Date: _______________
Tester: _______________

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Navigate to Detail | ⬜ Pass ⬜ Fail | |
| 2 | View Information | ⬜ Pass ⬜ Fail | |
| 3 | LinkedIn Actions | ⬜ Pass ⬜ Fail | |
| 4 | Status Update | ⬜ Pass ⬜ Fail | |
| 5 | Add Sent Message | ⬜ Pass ⬜ Fail | |
| 6 | Add Received Message | ⬜ Pass ⬜ Fail | |
| 7 | Chronological Order | ⬜ Pass ⬜ Fail | |
| 8 | Advanced Fields | ⬜ Pass ⬜ Fail | |
| 9 | Edit Message | ⬜ Pass ⬜ Fail | |
| 10 | Delete Message | ⬜ Pass ⬜ Fail | |
| 11 | Empty State | ⬜ Pass ⬜ Fail | |
| 12 | Back Navigation | ⬜ Pass ⬜ Fail | |
| 13 | Responsive Design | ⬜ Pass ⬜ Fail | |
| 14 | Direct URL Access | ⬜ Pass ⬜ Fail | |
| 15 | Loading States | ⬜ Pass ⬜ Fail | |
| 16 | Error Handling | ⬜ Pass ⬜ Fail | |
| 17 | Message Validation | ⬜ Pass ⬜ Fail | |

---

## 🎉 Completion Checklist

Once all tests pass:
- [ ] All 17 test scenarios completed
- [ ] Data verified in Firebase Console
- [ ] No console errors
- [ ] All features work as expected
- [ ] Responsive design validated
- [ ] Data persistence confirmed
- [ ] Ready for production use!
