# ReferralSaathi

A production-ready MVP for managing employee referral opportunities and conversations.

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS v4
- **Authentication**: Firebase Authentication (Google + Email/Password)
- **Database**: Cloud Firestore
- **AI Integration**: Gemini API (via Cloudflare Workers proxy)
- **Icons**: Lucide React
- **Routing**: React Router
- **Utilities**: date-fns, Zod

## Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- Firebase project created
- Cloudflare Workers account (for AI proxy)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values
   - Add your Cloudflare Worker URL for AI features

3. **Run development server**:
   ```bash
   npm run dev
   ```
   The app will open at http://localhost:3000

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Status

✅ **Stage 1: Project initialization complete**
- Vite + React configured
- Tailwind CSS v4 integrated
- All dependencies installed
- Development environment ready

✅ **Stage 2: Design system complete**
- Professional SaaS design language
- Comprehensive design tokens
- Reusable component patterns
- Responsive layout system
- Accessibility-focused

✅ **Firebase Configuration Complete**
- Environment variables configured
- Firebase SDK initialized
- Authentication service ready
- Firestore security rules prepared
- Indexes configuration ready

## Next Steps

1. ✅ ~~Configure Firebase project~~ - Complete
2. Deploy Firestore security rules (see FIREBASE_SETUP.md)
3. Enable Authentication methods in Firebase Console
4. Deploy Cloudflare Worker for Gemini API proxy
5. Continue with PROMPT 3 for authentication UI

## Important Notes

- No Firebase Cloud Functions (Spark plan restriction)
- No Firebase Hosting requirement
- No paid services or APIs used
- Firebase Cloud Storage not used on Spark plan
- API keys secured via Cloudflare Workers proxy
