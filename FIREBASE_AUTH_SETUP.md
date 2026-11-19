# Firebase Authentication Setup Guide

## Prerequisites

You need to set up Firebase Authentication before the app can work properly.

## Step-by-Step Setup

### 1. Create Firebase Project (if not already done)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select your existing project (**beep-4b926**)
3. Follow the setup wizard

### 2. Enable Authentication Methods

1. In Firebase Console, navigate to **Authentication**
2. Click **Get started** (if first time)
3. Go to **Sign-in method** tab

#### Enable Email/Password:
1. Click on **Email/Password** provider
2. Toggle **Enable** to ON
3. Click **Save**

#### Enable Google Sign-In:
1. Click on **Google** provider
2. Toggle **Enable** to ON
3. Set a **Project support email** (required)
4. Click **Save**

### 3. Register Your Web App (if not already done)

1. In Firebase Console, go to **Project Settings** (⚙️ icon)
2. Scroll down to "Your apps" section
3. Click the **</>** (Web) icon
4. Enter app nickname: `ReferralSaathi Web`
5. Check "Also set up Firebase Hosting" (optional)
6. Click **Register app**

### 4. Get Firebase Configuration

After registering the app, you'll see your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "beep-4b926.firebaseapp.com",
  projectId: "beep-4b926",
  storageBucket: "beep-4b926.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

### 5. Update Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=beep-4b926.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=beep-4b926
   VITE_FIREBASE_STORAGE_BUCKET=beep-4b926.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Important**: Never commit `.env` to version control!

### 6. Configure Authorized Domains (for Google Sign-In)

1. In Firebase Console, go to **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Add your domains:
   - `localhost` (already added by default)
   - Your production domain (when you deploy)

### 7. Test Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000

3. You should see the auth page

4. Test each auth method:
   - ✅ Register with email/password
   - ✅ Login with email/password
   - ✅ Google sign-in
   - ✅ Password reset
   - ✅ Logout

## Authentication Features Implemented

### ✅ Email/Password Authentication
- Registration with display name
- Email validation
- Password strength validation (min 6 chars)
- Password confirmation
- Login
- Friendly error messages

### ✅ Google Sign-In
- One-click Google authentication
- Automatic profile photo
- Display name from Google account

### ✅ Password Reset
- Send password reset email
- Firebase handles reset flow
- Success confirmation

### ✅ Protected Routes
- Automatic redirect to `/auth` if not logged in
- Automatic redirect to `/dashboard` if already logged in
- Loading state while checking auth
- Persistent authentication

### ✅ User State Management
- Global auth context using React Context API
- Auth state persists across page refreshes
- User info available throughout the app
- Logout from header menu

## Security Notes

### Environment Variables
- ✅ All Firebase config in environment variables
- ✅ Never commit `.env` file
- ✅ `.env` is in `.gitignore`

### Firebase Security
- ✅ Firebase API keys are safe to expose in frontend
- ✅ Security is enforced by Firestore rules
- ✅ Authentication tokens are handled by Firebase SDK
- ✅ User data protected by authentication state

### Best Practices
- ✅ Email validation before submission
- ✅ Password strength requirements
- ✅ Password confirmation on registration
- ✅ Friendly error messages (no technical details exposed)
- ✅ Loading states during auth operations
- ✅ Protected routes with automatic redirects

## Troubleshooting

### "Firebase: Error (auth/unauthorized-domain)"
**Solution**: Add your domain to Authorized domains in Firebase Console

### "Firebase: Error (auth/operation-not-allowed)"
**Solution**: Enable Email/Password or Google sign-in in Firebase Console

### "Firebase: Error (auth/popup-blocked)"
**Solution**: Allow pop-ups for localhost in your browser settings

### Authentication not persisting
**Solution**: Check browser cookies are enabled

### Google sign-in not working
**Solution**: 
1. Verify Google provider is enabled in Firebase Console
2. Check Authorized domains include localhost
3. Ensure pop-ups are not blocked

## Testing Checklist

- [ ] Email registration works
- [ ] Email login works
- [ ] Google sign-in works
- [ ] Password reset email is sent
- [ ] Logout works
- [ ] Protected routes redirect when not logged in
- [ ] Auth state persists on page refresh
- [ ] User info displays in header
- [ ] Form validation works
- [ ] Error messages are friendly

## Next Steps

After authentication is working:
1. ✅ Authentication implemented
2. Set up Firestore security rules
3. Implement referral CRUD operations
4. Add user profile management
5. Implement reminder system

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firebase configuration
3. Ensure authentication methods are enabled
4. Check Authorized domains
5. Review `.env` file for correct values

---

**Current Status**: Firebase credentials are configured in `.env`. Enable Email/Password and Google providers in Firebase Console to start using authentication.
