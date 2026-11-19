# Firebase Setup Guide

This guide will help you configure Firebase for the ReferralSaathi application.

## Prerequisites

- Firebase project created (beep-4b926)
- Firebase CLI installed (optional but recommended)

## Steps to Complete Firebase Setup

### 1. Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **beep-4b926**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable the following providers:
   - ✅ **Email/Password** - Click Enable and Save
   - ✅ **Google** - Click Enable, configure project support email, and Save

### 2. Create Firestore Database

1. In Firebase Console, navigate to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode** (we'll add custom rules)
4. Select your preferred location (choose closest to your users)
5. Click **Enable**

### 3. Deploy Firestore Security Rules

#### Option A: Using Firebase Console (Manual)
1. In Firestore Database, go to **Rules** tab
2. Copy the contents of `firestore.rules` file
3. Paste into the rules editor
4. Click **Publish**

#### Option B: Using Firebase CLI (Recommended)
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Select your project: beep-4b926
# Accept default filenames (firestore.rules and firestore.indexes.json)

# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. Configure Firestore Indexes

The `firestore.indexes.json` file contains the required composite indexes for efficient queries.

#### Using Firebase Console:
1. Navigate to **Firestore Database** → **Indexes** tab
2. Click **Add Index** for each index in the JSON file

#### Using Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

### 5. Test Firebase Connection

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. The app should load without any Firebase errors in the console

### 6. Set Up Authorized Domains (for Google Sign-In)

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (already added by default)
   - Your production domain when you deploy

## Firestore Data Structure

The application uses the following collections:

### `users/{userId}`
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string (optional),
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `referrals/{referralId}`
```javascript
{
  userId: string,
  companyName: string,
  employeeName: string,
  employeeContact: string (email/phone),
  position: string,
  status: string, // 'pending', 'contacted', 'responded', 'applied', 'rejected', 'success'
  notes: string,
  createdAt: timestamp,
  updatedAt: timestamp,
  nextFollowUp: timestamp (optional)
}
```

### `conversations/{conversationId}`
```javascript
{
  userId: string,
  referralId: string,
  message: string,
  sender: string, // 'user' or 'employee'
  timestamp: timestamp,
  aiAnalysis: {
    sentiment: string,
    suggestedAction: string,
    nextSteps: array
  } (optional)
}
```

## Security Notes

- ✅ API keys are environment variables (never commit `.env`)
- ✅ Security rules ensure users can only access their own data
- ✅ Google sign-in requires authorized domains
- ✅ Firestore rules validate all writes
- ✅ No Cloud Storage used (Spark plan restriction)

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to Authorized domains in Firebase Console

### "Missing or insufficient permissions"
- Check Firestore security rules are deployed correctly
- Ensure user is authenticated

### "Failed to get document because the client is offline"
- Check internet connection
- Verify Firestore is enabled in Firebase Console

## Next Steps

After completing Firebase setup:
1. ✅ Verify authentication works
2. ✅ Test Firestore read/write operations
3. Continue with PROMPT 2 for UI development
