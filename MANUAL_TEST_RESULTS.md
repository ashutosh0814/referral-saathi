# Manual Testing Instructions & Results

## How to Test the My Referrals Feature

### Prerequisites
1. ✅ Dev server is running at http://localhost:3000
2. ✅ Firebase project configured (beep-4b926)
3. ✅ Firestore rules deployed
4. ✅ Build succeeds without errors

### Step-by-Step Testing

#### Step 1: Access the Application
1. Open your browser and navigate to: **http://localhost:3000**
2. If not logged in, you'll see the authentication page
3. Log in using your email and password (or create a new account)
4. After login, you should see the Dashboard

#### Step 2: Navigate to My Referrals
1. Click on **"My Referrals"** in the left sidebar
2. You should see the My Referrals page with:
   - Page title: "My Referrals"
   - "Add Referral" button in the top right
   - Search and filter bar
   - Either referral cards OR an empty state message

#### Step 3: Add Your First Referral
1. Click the **"Add Referral"** button
2. A modal should open with the title "Add New Referral"
3. Fill in the form with test data:
   ```
   Company Name: Google
   Job Title: Senior Software Engineer
   Job URL: https://careers.google.com/jobs/12345
   Job ID: GOOG-SWE-2024
   Employee Name: John Smith
   Employee Designation: Staff Engineer
   LinkedIn Profile: https://linkedin.com/in/johnsmith
   Status: Message Sent (use dropdown)
   Contact Notes: Met at tech conference, very responsive
   ```
4. Click **"Add Referral"**
5. The modal should close and you should see a new card appear with:
   - ✅ Company name "Google" with building icon
   - ✅ Job title "Senior Software Engineer" with briefcase icon
   - ✅ Employee name "John Smith" with user icon
   - ✅ Blue "Message Sent" status badge
   - ✅ "X time ago" timestamp
   - ✅ "View Job Posting" link at the bottom

#### Step 4: **CRITICAL - Test Data Persistence**
1. **Press F5 or click browser refresh button**
2. Wait for the page to reload
3. Navigate back to "My Referrals" if needed
4. **✅ VERIFY: The referral you just added is still there**
5. **✅ VERIFY: All data is exactly the same (company, job, employee, status, notes)**

**This confirms data is being saved to Firestore correctly!**

#### Step 5: Add a Second Referral
1. Click "Add Referral" again
2. Fill in different data:
   ```
   Company Name: Microsoft
   Job Title: Product Manager
   Job URL: https://careers.microsoft.com/job/456
   Job ID: MSFT-PM-2024
   Employee Name: Sarah Johnson
   Employee Designation: Senior PM
   LinkedIn Profile: https://linkedin.com/in/sarahjohnson
   Status: Not Contacted
   Contact Notes: Referred by mutual friend
   ```
3. Click "Add Referral"
4. You should now see 2 referral cards

#### Step 6: Test Edit Functionality
1. **Hover over** the Google referral card
2. You should see a **three-dot menu icon** appear in the top right of the card
3. Click the three-dot menu
4. Click **"Edit"**
5. A modal opens with the title "Edit Referral" and pre-filled data
6. Change the Status from "Message Sent" to **"Employee Agreed"**
7. Update Contact Notes: Add " - Follow-up call scheduled for next Monday"
8. Click **"Save Changes"**
9. The card should update with a purple/indigo "Employee Agreed" badge
10. **Refresh the browser (F5)**
11. **✅ VERIFY: Changes persisted** - status is still "Employee Agreed"

#### Step 7: Test Search
1. In the search box, type: **"Google"**
2. ✅ Only the Google referral should show
3. Type: **"Sarah"**
4. ✅ Only the Microsoft referral should show
5. Type: **"Engineer"**
6. ✅ Both referrals should show (matches job titles and designations)
7. Click the **X button** in the search box to clear
8. ✅ All referrals show again

#### Step 8: Test Filter by Status
1. Click the **"All Statuses"** dropdown
2. Select **"Employee Agreed"**
3. ✅ Only the Google referral shows (we edited it to this status)
4. Select **"Not Contacted"**
5. ✅ Only the Microsoft referral shows
6. Select **"Message Sent"**
7. ✅ No referrals show (none have this status now)
8. Select **"All Statuses"**
9. ✅ All referrals show again

#### Step 9: Test Delete
1. Hover over the Microsoft referral card
2. Click the three-dot menu
3. Click **"Delete"**
4. A confirmation modal appears asking:
   - "Are you sure you want to delete the referral for Product Manager at Microsoft?"
5. Click **"Cancel"** first to test cancellation
6. ✅ Modal closes, referral remains
7. Open delete modal again
8. Click **"Delete"**
9. ✅ Modal closes and card disappears
10. **Refresh the browser (F5)**
11. **✅ VERIFY: Deleted referral does NOT reappear**

#### Step 10: Test All Status Badges
Add referrals with each status to verify colors:
- Not Contacted → Gray badge
- Message Sent → Blue badge
- Waiting for Response → Yellow/Amber badge
- Employee Agreed → Indigo badge
- Details Requested → Indigo badge
- Referral Submitted → Indigo badge
- Rejected → Red badge
- Successful → Green badge
- Closed → Gray badge

#### Step 11: Test Validation
1. Click "Add Referral"
2. Leave all fields empty
3. Click "Add Referral" button
4. ✅ Red error messages appear under required fields:
   - "Company name is required"
   - "Job title is required"
   - "Employee name is required"
5. Fill in Company Name, Job Title, Employee Name
6. Enter invalid URL in Job URL: "not-a-url"
7. Click "Add Referral"
8. ✅ Error message appears: Invalid URL format
9. Fix the URL or remove it
10. ✅ Form submits successfully

#### Step 12: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. ✅ VERIFY: No red errors
4. You might see some info messages from Firebase - this is normal

#### Step 13: Check Firebase Console
1. Go to https://console.firebase.google.com
2. Select project "beep-4b926"
3. Go to Firestore Database
4. Navigate to: `users/{your-user-id}/referrals`
5. ✅ VERIFY: You see all your referrals stored there
6. Click on one referral document
7. ✅ VERIFY: All fields are present with correct data types:
   - companyName (string)
   - jobTitle (string)
   - employeeName (string)
   - status (string, e.g., "employee_agreed")
   - createdAt (timestamp)
   - updatedAt (timestamp)

---

## Test Results Summary

Fill this in after testing:

- [ ] Add referral works
- [ ] Edit referral works
- [ ] Delete referral works
- [ ] **Data persists after browser refresh** ✅ CRITICAL
- [ ] Search functionality works
- [ ] Filter by status works
- [ ] All 9 status badges display correctly
- [ ] Validation prevents invalid data
- [ ] No console errors
- [ ] Data visible in Firebase Console
- [ ] UI is responsive and user-friendly

---

## Troubleshooting

### If referrals don't persist after refresh:
1. Check browser console for Firestore errors
2. Verify you're logged in (check Authentication in Firebase Console)
3. Verify Firestore rules were deployed: `firebase deploy --only firestore:rules`
4. Check Network tab in DevTools for failed requests

### If "Permission Denied" error appears:
1. Make sure you're logged in
2. Run: `firebase deploy --only firestore:rules`
3. Verify the user ID in Firestore matches your authenticated user

### If form validation doesn't work:
1. Check console for errors
2. Verify Zod is installed: `npm list zod`
3. Clear browser cache and reload

### If status colors are wrong:
1. Verify Badge component has all variants (neutral, info, warning, error, success, primary)
2. Check STATUS_BADGE_VARIANTS in constants.js

---

## Next Steps After Testing

Once all tests pass:
1. ✅ My Referrals feature is complete
2. Move on to building other features:
   - Referral Detail Page
   - Conversation Tracking
   - Task Management
   - Dashboard with Statistics
