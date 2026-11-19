# My Referrals Feature - Test Plan

## Test Verification Steps

### 1. **Access the My Referrals Page**
- [ ] Navigate to http://localhost:3000
- [ ] Log in with your Firebase credentials
- [ ] Click on "My Referrals" in the sidebar
- [ ] Verify page loads without errors

### 2. **Test Add Referral (CREATE)**
- [ ] Click "Add Referral" button
- [ ] Verify modal opens with empty form
- [ ] Fill in the form:
  - Company Name: "Google" (required)
  - Job Title: "Senior Software Engineer" (required)
  - Job URL: "https://careers.google.com/jobs/12345"
  - Job ID: "GOOG-12345"
  - Employee Name: "John Smith" (required)
  - Employee Designation: "Staff Engineer"
  - LinkedIn Profile: "https://linkedin.com/in/johnsmith"
  - Status: Select "Message Sent"
  - Contact Notes: "Met at tech conference, very helpful"
- [ ] Click "Add Referral"
- [ ] Verify modal closes
- [ ] Verify new referral card appears in the grid
- [ ] Verify all information displays correctly

### 3. **Test Data Persistence (Firestore Verification)**
- [ ] **Refresh the browser (F5 or Ctrl+R)**
- [ ] Wait for page to reload
- [ ] Verify the referral you just added is still there
- [ ] Verify all data persisted correctly (company, job, employee, status, notes)

### 4. **Test Edit Referral (UPDATE)**
- [ ] Hover over the referral card
- [ ] Click the three-dot menu (appears on hover)
- [ ] Click "Edit"
- [ ] Verify modal opens with pre-filled data
- [ ] Change the following:
  - Status: Change to "Employee Agreed"
  - Contact Notes: Add " - Follow-up scheduled for next week"
- [ ] Click "Save Changes"
- [ ] Verify modal closes
- [ ] Verify card updates with new status badge
- [ ] **Refresh the browser again**
- [ ] Verify changes persisted after refresh

### 5. **Test Search Functionality**
- [ ] Add another referral (Company: "Microsoft", Job: "Product Manager", Employee: "Jane Doe")
- [ ] In the search box, type "Google"
- [ ] Verify only Google referral shows
- [ ] Type "Jane"
- [ ] Verify only Microsoft referral shows
- [ ] Clear search (click X button)
- [ ] Verify all referrals show again

### 6. **Test Filter by Status**
- [ ] Click the "All Statuses" dropdown
- [ ] Select "Employee Agreed"
- [ ] Verify only referrals with that status show
- [ ] Select "Message Sent"
- [ ] Verify the appropriate referrals show
- [ ] Select "All Statuses"
- [ ] Verify all referrals show again

### 7. **Test Combined Search and Filter**
- [ ] Type "Google" in search
- [ ] Select a status from dropdown
- [ ] Verify both filters work together
- [ ] Click "Clear All" button
- [ ] Verify search and filter reset

### 8. **Test Delete Referral (DELETE)**
- [ ] Hover over a referral card
- [ ] Click the three-dot menu
- [ ] Click "Delete"
- [ ] Verify delete confirmation modal appears
- [ ] Verify company and job title are shown in confirmation
- [ ] Click "Cancel" - verify modal closes and referral remains
- [ ] Open delete modal again
- [ ] Click "Delete"
- [ ] Verify modal closes and card disappears from grid
- [ ] **Refresh the browser**
- [ ] Verify the deleted referral does NOT reappear

### 9. **Test Empty States**
- [ ] Delete all referrals OR filter by a status with no referrals
- [ ] Verify appropriate empty state message shows:
  - If filtered: "No referrals found" with "Clear Filters" button
  - If no data: "No referrals yet" with "Add Your First Referral" button

### 10. **Test Loading State**
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab, set throttling to "Slow 3G"
- [ ] Refresh the page
- [ ] Verify loading spinner appears while data loads
- [ ] Verify data loads after spinner

### 11. **Test Validation**
- [ ] Click "Add Referral"
- [ ] Try to submit without filling required fields
- [ ] Verify validation errors appear for:
  - Company Name (required)
  - Job Title (required)
  - Employee Name (required)
- [ ] Fill in invalid URL in Job URL field (e.g., "not-a-url")
- [ ] Verify URL validation error
- [ ] Fix all errors and submit
- [ ] Verify successful submission

### 12. **Test Responsive Design**
- [ ] Resize browser window to tablet size (768px)
- [ ] Verify grid shows 2 columns
- [ ] Resize to mobile (< 768px)
- [ ] Verify grid shows 1 column
- [ ] Verify all buttons and forms are usable on mobile

## Expected Firestore Data Structure

After adding a referral, check Firebase Console:
```
users/
  └── {userId}/
      └── referrals/
          └── {referralId}/
              ├── companyName: "Google"
              ├── jobTitle: "Senior Software Engineer"
              ├── jobUrl: "https://careers.google.com/jobs/12345"
              ├── jobId: "GOOG-12345"
              ├── employeeName: "John Smith"
              ├── employeeDesignation: "Staff Engineer"
              ├── employeeLinkedIn: "https://linkedin.com/in/johnsmith"
              ├── contactNotes: "Met at tech conference, very helpful"
              ├── status: "message_sent"
              ├── createdAt: Timestamp
              └── updatedAt: Timestamp
```

## Success Criteria

✅ All CRUD operations work correctly
✅ Data persists after browser refresh
✅ Search and filter work as expected
✅ Validation prevents invalid data
✅ Loading and empty states display properly
✅ Responsive design works on all screen sizes
✅ No console errors in browser DevTools
✅ Firestore security rules allow authorized operations
✅ UI is smooth and user-friendly

## Common Issues to Check

1. **Authentication**: Make sure you're logged in
2. **Firestore Rules**: Verify rules were deployed successfully
3. **Network Errors**: Check browser console for CORS or Firebase config issues
4. **Date Display**: Verify "time ago" format works (e.g., "2 minutes ago")
5. **Status Colors**: Verify all 9 status badges show correct colors
