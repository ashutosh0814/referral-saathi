# Firestore Setup Guide

## Overview
This guide will help you set up Cloud Firestore for ReferralSaathi. Follow these steps to configure your database.

## Prerequisites
- Firebase project created (Project ID: beep-4b926)
- Firebase CLI installed (optional, for deploying rules)
- Environment variables configured in `.env`

## Step 1: Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **beep-4b926**
3. Click on **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in production mode** (we have custom rules)
6. Select a location closest to your users (recommended: `us-central` or your region)
7. Click **Enable**

## Step 2: Deploy Firestore Security Rules

### Option A: Using Firebase Console (Easiest)

1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Copy the contents of `firestore.rules` from your project
3. Paste it into the rules editor
4. Click **Publish**

### Option B: Using Firebase CLI

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Step 3: Deploy Firestore Indexes

### Option A: Using Firebase Console

1. Go to **Firestore Database** → **Indexes** tab
2. Wait for automatic index suggestions when you run queries
3. Click **Create Index** when prompted

### Option B: Using Firebase CLI (Recommended)

```bash
# Deploy indexes
firebase deploy --only firestore:indexes
```

The indexes in `firestore.indexes.json` will be automatically created.

## Step 4: Verify Setup

### Test Authentication & Database Access

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Sign in to the app using Google or email/password
3. The console should show no Firestore permission errors

### Test Database Operations

Open your browser console and run:

```javascript
// This should work without errors (returns empty array initially)
const { getReferrals } = await import('./src/lib/firestore.js');
const result = await getReferrals('YOUR_USER_ID');
console.log(result);
```

## Data Structure

### Collection Hierarchy

```
users/{userId}
├── referrals/{referralId}
│   ├── companyName: string
│   ├── jobTitle: string
│   ├── jobUrl: string (optional)
│   ├── jobId: string (optional)
│   ├── employeeName: string
│   ├── employeeDesignation: string (optional)
│   ├── employeeLinkedIn: string (optional)
│   ├── contactNotes: string (optional)
│   ├── status: enum
│   ├── userId: string
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp
│   │
│   └── conversations/{conversationId}
│       ├── message: string
│       ├── direction: 'sent' | 'received'
│       ├── intent: string (optional)
│       ├── suggestedAction: string (optional)
│       ├── referralId: string
│       └── createdAt: timestamp
│
└── tasks/{taskId}
    ├── title: string
    ├── referralId: string
    ├── dueAt: timestamp (optional)
    ├── status: enum
    ├── snoozedUntil: timestamp (optional)
    ├── userId: string
    ├── createdAt: timestamp
    └── updatedAt: timestamp
```

## Available Database Functions

### Referrals

```javascript
import {
  createReferral,
  getReferral,
  getReferrals,
  updateReferral,
  deleteReferral
} from './lib/firestore';

// Create a referral
const result = await createReferral(userId, {
  companyName: 'Google',
  jobTitle: 'Software Engineer',
  employeeName: 'John Doe',
  status: 'pending'
});

// Get all referrals
const referrals = await getReferrals(userId, {
  status: 'pending',
  orderByField: 'createdAt',
  orderDirection: 'desc',
  limitCount: 20
});

// Get single referral
const referral = await getReferral(userId, referralId);

// Update referral
const updated = await updateReferral(userId, referralId, {
  status: 'applied'
});

// Delete referral
await deleteReferral(userId, referralId);
```

### Conversations

```javascript
import {
  createConversation,
  getConversations,
  updateConversation,
  deleteConversation
} from './lib/firestore';

// Create a conversation
const result = await createConversation(userId, referralId, {
  message: 'Hi, I would like to discuss the role...',
  direction: 'sent',
  intent: 'introduction'
});

// Get all conversations for a referral
const conversations = await getConversations(userId, referralId);

// Update conversation
await updateConversation(userId, referralId, conversationId, {
  suggestedAction: 'Follow up in 3 days'
});

// Delete conversation
await deleteConversation(userId, referralId, conversationId);
```

### Tasks

```javascript
import {
  createTask,
  getTask,
  getTasks,
  updateTask,
  deleteTask
} from './lib/firestore';

// Create a task
const result = await createTask(userId, {
  title: 'Follow up with recruiter',
  referralId: 'ref123',
  dueAt: new Date('2024-12-01'),
  status: 'pending'
});

// Get all tasks
const tasks = await getTasks(userId, {
  status: 'pending',
  referralId: 'ref123'
});

// Update task
await updateTask(userId, taskId, {
  status: 'completed'
});

// Delete task
await deleteTask(userId, taskId);
```

## Security Rules Summary

✅ **Users can only access their own data**
- All reads/writes require authentication
- User ID is validated using `request.auth.uid`
- No cross-user data access possible

✅ **Field validation**
- Required fields are enforced
- Status enums are validated
- Direction enums are validated

✅ **No open rules**
- No `allow read, write: if true` anywhere
- Default deny on all unmatched paths

## Composite Indexes

The following indexes are automatically created:

1. **Referrals by status and createdAt** (descending)
2. **Referrals by status and updatedAt** (descending)
3. **Referrals by companyName and createdAt** (descending)
4. **Conversations by referralId and createdAt** (descending)
5. **Conversations by referralId, direction, and createdAt** (descending)
6. **Tasks by userId, status, and createdAt** (descending)
7. **Tasks by userId, status, and dueAt** (ascending)
8. **Tasks by userId, referralId, and createdAt** (descending)
9. **Tasks by userId, referralId, status, and createdAt** (descending)

## Offline Support

The app includes **offline persistence** enabled by default:

- Data is cached locally in IndexedDB
- Reads work offline from cache
- Writes are queued and synced when back online
- Automatic conflict resolution

## Best Practices

### 1. Always Use Provided Functions

```javascript
// ✅ Good
import { createReferral } from './lib/firestore';
await createReferral(userId, data);

// ❌ Bad - bypasses validation
import { addDoc, collection } from 'firebase/firestore';
await addDoc(collection(db, 'referrals'), data);
```

### 2. Handle Errors

```javascript
const result = await createReferral(userId, data);

if (!result.success) {
  console.error(result.error);
  // Show error to user
  return;
}

// Use result.data
console.log(result.data);
```

### 3. Use Pagination

```javascript
// First page
const page1 = await getReferrals(userId, { limitCount: 20 });

// Next page
const page2 = await getReferrals(userId, {
  limitCount: 20,
  lastDoc: page1.lastVisible
});
```

### 4. Filter and Sort Efficiently

```javascript
// ✅ Use indexed fields
await getReferrals(userId, {
  status: 'pending',
  orderByField: 'createdAt',
  orderDirection: 'desc'
});

// ❌ Will fail without index
// await getReferrals(userId, {
//   status: 'pending',
//   orderByField: 'companyName',
//   orderDirection: 'desc',
//   customFilter: true  // Not supported
// });
```

## Troubleshooting

### Error: Missing or insufficient permissions

**Cause**: Firestore rules not deployed or user not authenticated

**Solution**:
1. Check that you're signed in: `auth.currentUser`
2. Deploy rules: `firebase deploy --only firestore:rules`
3. Verify rules in Firebase Console

### Error: The query requires an index

**Cause**: Missing composite index for your query

**Solution**:
1. Click the link in the error message to create the index
2. Or deploy indexes: `firebase deploy --only firestore:indexes`
3. Wait 2-5 minutes for index to build

### Error: Quota exceeded

**Cause**: Free tier limits reached (50K reads/day, 20K writes/day)

**Solution**:
1. Check usage in Firebase Console → Usage tab
2. Optimize queries to reduce reads
3. Use pagination and caching
4. Upgrade to Blaze plan if needed

### Data not syncing

**Cause**: Network issues or persistence conflicts

**Solution**:
1. Check network connectivity
2. Clear browser cache and reload
3. Check browser console for errors
4. Ensure only one tab is open (persistence limitation)

## Testing with Emulators (Optional)

For local development without affecting production data:

```bash
# Install Firebase emulators
firebase init emulators

# Start emulators
firebase emulators:start
```

Update `src/config/firebase.js` to connect to emulators:

```javascript
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Next Steps

1. ✅ Enable Firestore in Firebase Console
2. ✅ Deploy security rules
3. ✅ Deploy indexes
4. ✅ Test authentication and database access
5. ✅ Start building features with the provided functions

## Support

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Reference](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Firestore Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**🎉 Your Firestore database is now ready to use!**
