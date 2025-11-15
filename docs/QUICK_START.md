# 🚀 Quick Start Guide - Firebase Authentication

## ⚡ 3 Steps to Get Started

### Step 1: Enable Authentication in Firebase Console (2 minutes)

1. Visit: https://console.firebase.google.com
2. Select your project
3. Go to **Build** → **Authentication** → **Sign-in method**
4. Click on **Email/Password**
5. Toggle **Enable** → **Save**

### Step 2: Run the App

```bash
npm install
npm run android
```

### Step 3: Test the Authentication

1. App opens with **Login Screen**
2. Click **"Sign Up"**
3. Enter:
   - Full Name: `John Doe`
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click **"Sign Up"** button
5. You're now logged in! 🎉

## 🎯 What You Can Do Now

### As a User:
- ✅ Create an account
- ✅ Login with email/password
- ✅ View your profile on home screen
- ✅ Start video calls
- ✅ Sign out

### As a Developer:
- ✅ All authentication is handled
- ✅ User state is managed automatically
- ✅ Navigation flows are configured
- ✅ Error handling is implemented

## 🔍 Key Files to Know

```typescript
// Access user data anywhere in the app
import { useAuth } from './src/contexts/AuthContext';

function MyComponent() {
  const { user, signIn, signUp, signOut, loading, error } = useAuth();
  
  // user.uid - User ID
  // user.email - User email
  // user.displayName - User name
  
  return <Text>Hello, {user?.displayName}!</Text>;
}
```

## 📱 Screen Flow

```
Launch App
    ↓
[Auth Check]
    ↓
   User?
    ├─ No → Login Screen
    │         ↓
    │      Sign Up Screen
    │         ↓
    └─ Yes → Home Screen
                ↓
           Video Call Screen
```

## 💡 Common Use Cases

### Get Current User Info
```typescript
const { user } = useAuth();
console.log(user?.uid);        // User ID
console.log(user?.email);      // Email
console.log(user?.displayName); // Display Name
```

### Check if User is Logged In
```typescript
const { user } = useAuth();
if (user) {
  // User is logged in
} else {
  // User is logged out
}
```

### Sign Out Programmatically
```typescript
const { signOut } = useAuth();

const handleLogout = async () => {
  await signOut();
  // User will be automatically redirected to login screen
};
```

## 🔧 Customization

### Change Primary Color
Edit `App.tsx`, `LoginScreen.tsx`, and `SignupScreen.tsx`:
```typescript
// Change from #0b74de to your brand color
backgroundColor: '#YOUR_COLOR_HERE'
```

### Add More User Fields
Update `SignupScreen.tsx` to collect more data:
```typescript
const [phoneNumber, setPhoneNumber] = useState('');
// Add input field and pass to signUp
```

### Customize Error Messages
Edit `src/contexts/AuthContext.tsx` in the `signIn` and `signUp` functions.

## 📞 Need Help?

Check these files for detailed information:
- `AUTHENTICATION_SUMMARY.md` - Complete overview
- `FIREBASE_SETUP.md` - Detailed setup instructions

## ✅ That's It!

You now have a fully functional authentication system. Start building amazing features! 🚀

---

**Pro Tip:** Test your authentication flow before building additional features to ensure everything works correctly.

