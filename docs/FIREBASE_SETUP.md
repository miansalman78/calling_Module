
# Firebase Authentication Setup Guide

This project uses Firebase Authentication for email/password login and signup.

## ✅ Completed Setup

1. ✅ Firebase packages installed (`@react-native-firebase/app` and `@react-native-firebase/auth`)
2. ✅ Android configuration completed
3. ✅ `google-services.json` file added
4. ✅ Authentication context created
5. ✅ Login and Signup screens implemented

## 🔧 Firebase Console Configuration

To enable email/password authentication, follow these steps:

### 1. Go to Firebase Console
Visit: https://console.firebase.google.com

### 2. Select Your Project
Choose the project that matches your `google-services.json` file.

### 3. Enable Email/Password Authentication

1. In the left sidebar, click **Build** → **Authentication**
2. Click **Get Started** (if first time)
3. Go to the **Sign-in method** tab
4. Click on **Email/Password**
5. Toggle **Enable** to ON
6. Click **Save**

### 4. (Optional) Configure Email Templates

1. In Authentication, go to **Templates** tab
2. Customize email templates for:
   - Password reset
   - Email verification
   - Email change

## 📱 Features Implemented

### Authentication Context (`src/contexts/AuthContext.tsx`)
- User state management
- Sign in with email/password
- Sign up with email/password
- Sign out
- Error handling
- Auto-persistence using AsyncStorage

### Login Screen (`src/screens/LoginScreen.tsx`)
- Email and password input
- Form validation
- Loading states
- Error messages
- Navigation to signup

### Signup Screen (`src/screens/SignupScreen.tsx`)
- Full name, email, and password inputs
- Password confirmation
- Form validation (min 6 characters)
- Loading states
- Error messages
- Navigation to login

### App Navigation
- Automatic routing based on authentication state
- Auth screens (Login/Signup) for unauthenticated users
- Main app screens (Home/VideoCall) for authenticated users
- Loading screen during auth state check

## 🔐 Security Features

- Passwords are never stored locally
- Firebase handles password encryption
- User sessions are automatically managed
- Secure token-based authentication
- Error messages don't expose sensitive information

## 📊 User Data Storage

User authentication data is automatically stored by Firebase:
- User ID (UID)
- Email address
- Display name
- Creation timestamp
- Last sign-in timestamp

Local storage (AsyncStorage) is used for:
- User ID
- Email
- Display name

## 🚀 Usage

### Running the App

1. Install dependencies:
```bash
npm install
```

2. Run on Android:
```bash
npm run android
```

### Testing Authentication

1. Open the app
2. You'll see the Login screen
3. Click "Sign Up" to create a new account
4. Enter your details and create an account
5. You'll be automatically logged in
6. Use "Sign Out" button to test logout
7. Login again with your credentials

## 📝 User Flow

```
App Start
    ↓
Check Auth State
    ↓
├─ Not Authenticated → Login Screen
│                          ↓
│                      Sign Up Screen
│                          ↓
└─ Authenticated → Home Screen
                      ↓
                  Video Call Screen
```

## 🔍 Troubleshooting

### Common Issues:

1. **"An internal error has occurred"**
   - Make sure Email/Password auth is enabled in Firebase Console
   - Check that google-services.json is properly placed

2. **Build fails with Firebase errors**
   - Run: `cd android && ./gradlew clean && cd ..`
   - Rebuild the app

3. **Authentication not working**
   - Verify Firebase project matches google-services.json
   - Check internet connection
   - Ensure authentication is enabled in Firebase Console

## 🛠️ Customization

### Adding More Fields to User Profile

To store additional user data, you can:

1. Use Firebase Realtime Database or Firestore
2. Create user documents with additional fields
3. Store data in the authentication profile's `displayName` or `photoURL`

### Password Reset

To implement password reset:
1. Use the utility function in `src/utils/firebaseConfig.ts`
2. Call `sendPasswordResetEmail(email)`
3. User will receive reset email from Firebase

## 📚 Additional Resources

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [React Native Firebase Docs](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com)

## ✨ Next Steps

You can enhance the authentication system by:
1. Adding email verification
2. Implementing password reset functionality
3. Adding social login (Google, Facebook, etc.)
4. Storing additional user profile data in Firestore
5. Adding user profile editing screen
6. Implementing "Remember Me" functionality
7. Adding biometric authentication

