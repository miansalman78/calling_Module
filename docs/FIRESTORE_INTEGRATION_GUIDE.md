# Firestore Integration Guide

## 🎉 Real Users with Firebase Firestore

Your video calling app now uses **real-time Firebase Firestore** to manage users instead of mock data!

---

## ✅ What's Been Implemented

### 1. **Firestore Package Installed**
```bash
npm install @react-native-firebase/firestore --legacy-peer-deps
```

### 2. **Users Service Created**
- **File:** `src/utils/usersService.ts`
- Handles all Firestore operations for users
- Real-time user synchronization
- User presence management (online/offline/busy status)

### 3. **AuthContext Updated**
- Automatically creates/updates user profiles in Firestore on login
- Manages user presence based on app state
- Sets users offline when they log out or app goes to background

### 4. **HomeScreen Updated**
- Removed mock data
- Real-time user list from Firestore
- Automatic updates when users come online/offline
- Loading states for better UX

---

## 📋 Firestore Database Structure

### Collection: `users`

Each document represents a user with the following structure:

```javascript
{
  uid: "user_firebase_uid",           // Firebase Auth UID
  displayName: "John Doe",            // User's display name
  email: "john@example.com",          // User's email
  status: "online",                   // online | offline | busy
  isOnline: true,                     // Boolean for quick filtering
  lastSeen: Timestamp,                // Last activity timestamp
  createdAt: Timestamp,               // Account creation time
  updatedAt: Timestamp,               // Last profile update
  avatarUrl: "https://..."            // Optional profile picture URL
}
```

---

## 🔐 Firestore Security Rules

**IMPORTANT:** You must set up Firestore security rules in your Firebase Console.

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database**
4. Click on the **Rules** tab

### Step 2: Add These Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection rules
    match /users/{userId} {
      // Anyone can read user profiles
      allow read: if request.auth != null;
      
      // Users can only create/update their own profile
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      
      // Only the user can delete their own profile
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Optional: Add rules for other collections (calls, messages, etc.)
  }
}
```

### Step 3: Publish Rules
- Click **Publish** to save the rules
- Your Firestore database is now secure!

---

## 🚀 How It Works

### User Registration Flow

```
1. User signs up with email/password
   ↓
2. Firebase Auth creates account
   ↓
3. AuthContext detects new user
   ↓
4. createOrUpdateUserProfile() called
   ↓
5. User profile created in Firestore
   ↓
6. User appears in other users' lists
```

### User Login Flow

```
1. User logs in with credentials
   ↓
2. Firebase Auth authenticates
   ↓
3. AuthContext updates user profile in Firestore
   ↓
4. User status set to "online"
   ↓
5. initializeUserPresence() starts monitoring
   ↓
6. User appears as "online" to others
```

### User Presence System

```
App Active (foreground)
   → status: "online"
   → isOnline: true

App Background/Inactive
   → status: "offline"
   → isOnline: false
   → lastSeen: updated timestamp

User Logs Out
   → status: "offline"
   → isOnline: false
   → lastSeen: updated
```

### Real-Time Updates

The app uses Firestore's **real-time listeners** to automatically update the user list:

```typescript
// HomeScreen subscribes to users
useEffect(() => {
  const unsubscribe = subscribeToUsers(
    currentUserId,
    (users) => {
      // Users list automatically updates!
      setUsers(users);
    }
  );
  return () => unsubscribe();
}, [currentUserId]);
```

---

## 🎯 Available Functions

### From `usersService.ts`:

#### 1. **createOrUpdateUserProfile**
```typescript
await createOrUpdateUserProfile(uid, displayName, email);
```
Creates a new user profile or updates an existing one.

#### 2. **setUserOnlineStatus**
```typescript
await setUserOnlineStatus(uid, true);  // Online
await setUserOnlineStatus(uid, false); // Offline
```
Updates user's online/offline status.

#### 3. **setUserBusyStatus**
```typescript
await setUserBusyStatus(uid, true);  // Busy
await setUserBusyStatus(uid, false); // Online
```
Sets user as busy (e.g., during a call).

#### 4. **subscribeToUsers**
```typescript
const unsubscribe = subscribeToUsers(
  currentUserId,
  (users) => console.log('Users updated:', users),
  (error) => console.error('Error:', error)
);
```
Real-time listener for user list updates.

#### 5. **getUserById**
```typescript
const user = await getUserById(uid);
```
Fetches a specific user's profile.

#### 6. **updateUserAvatar**
```typescript
await updateUserAvatar(uid, avatarUrl);
```
Updates user's profile picture URL.

#### 7. **searchUsers**
```typescript
const results = await searchUsers(query, currentUserId);
```
Searches users by name or email.

---

## 🔄 Automatic Features

### 1. **Profile Creation**
- Automatic when user signs up
- Auto-fills from Firebase Auth data
- Creates Firestore document

### 2. **Status Updates**
- Automatic when app state changes
- Handles foreground/background transitions
- Updates on logout

### 3. **Real-Time Sync**
- All users see live updates
- No manual refresh needed
- Instant status changes

---

## 📊 Testing the Integration

### Test Scenario 1: Create Multiple Users

1. **Create User 1:**
   - Sign up with email: `user1@test.com`
   - Display name: "Alice Johnson"
   - Log in

2. **Create User 2 (different device/emulator):**
   - Sign up with email: `user2@test.com`
   - Display name: "Bob Smith"
   - Log in

3. **Result:**
   - User 1 should see "Bob Smith" in their users list
   - User 2 should see "Alice Johnson" in their users list
   - Both show as "Online"

### Test Scenario 2: Check Presence

1. **User 1** opens the app (shows as Online)
2. **User 2** sees User 1 as "Online" (green indicator)
3. **User 1** closes the app
4. **User 2** sees User 1 change to "Offline" (gray indicator)

### Test Scenario 3: Real-Time Updates

1. Open app on Device A
2. Open app on Device B
3. Create new user on Device C
4. **Result:** Devices A & B automatically show the new user!

---

## 🐛 Troubleshooting

### Issue: No users showing

**Solution 1:** Check Firestore Rules
```javascript
// Make sure you have this rule
allow read: if request.auth != null;
```

**Solution 2:** Check Firebase Console
- Go to Firestore Database
- Check if `users` collection exists
- Verify user documents are being created

**Solution 3:** Check Console Logs
```javascript
// Look for these messages:
"User profile saved to Firestore"
"User presence initialized"
"Error loading users" // If you see this, there's an issue
```

### Issue: Users not updating in real-time

**Solution:** Check subscription
```typescript
// Make sure useEffect cleanup is working
return () => unsubscribe(); // This must be called
```

### Issue: Permission Denied Error

**Error Message:** 
```
Error: Missing or insufficient permissions
```

**Solution:** Update Firestore Rules
- Go to Firebase Console → Firestore → Rules
- Make sure authenticated users can read the `users` collection
- Publish the updated rules

### Issue: User status not updating

**Solution:** Check App State Handling
```typescript
// In AuthContext, verify this useEffect exists:
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => subscription.remove();
}, [user]);
```

---

## 🎨 Customization Options

### 1. **Add More User Fields**

Edit `src/utils/usersService.ts`:

```typescript
export interface FirestoreUser {
  uid: string;
  displayName: string;
  email: string;
  status: 'online' | 'offline' | 'busy';
  isOnline: boolean;
  lastSeen: any;
  createdAt: any;
  updatedAt: any;
  avatarUrl?: string;
  // Add your custom fields:
  phoneNumber?: string;
  bio?: string;
  location?: string;
  interests?: string[];
}
```

### 2. **Change Status Colors**

Edit `App.tsx`:

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'online': return '#00ff00';  // Bright green
    case 'busy': return '#ff0000';    // Red
    case 'offline': return '#808080'; // Gray
    default: return '#808080';
  }
};
```

### 3. **Add Pagination**

For large user bases, add pagination:

```typescript
const subscribeToUsersPaginated = (
  currentUserId: string,
  pageSize: number = 20,
  onUpdate: (users: FirestoreUser[]) => void
) => {
  return firestore()
    .collection('users')
    .where('uid', '!=', currentUserId)
    .orderBy('uid')
    .limit(pageSize)
    .onSnapshot((snapshot) => {
      // Process results
    });
};
```

---

## 📈 Next Steps

### Recommended Enhancements:

1. **User Avatars**
   - Integrate Firebase Storage
   - Allow users to upload profile pictures
   - Display avatars in user list

2. **User Search**
   - Add advanced search filters
   - Search by multiple criteria
   - Sort by online status, name, etc.

3. **Favorites/Contacts**
   - Add favorites collection
   - Quick access to frequent contacts
   - Contact requests/approval system

4. **Call History**
   - Store call records in Firestore
   - Display recent calls
   - Call duration tracking

5. **User Status Messages**
   - Custom status text (e.g., "In a meeting")
   - Emoji status
   - Auto-status based on activity

6. **Block/Report Users**
   - User blocking functionality
   - Report inappropriate behavior
   - Admin moderation tools

---

## 🔒 Security Best Practices

### 1. **Never Trust Client-Side Data**
- Always validate in Firestore Rules
- Use server-side validation for critical operations

### 2. **Limit Read Access**
- Only allow authenticated users to read users
- Consider limiting fields visible to others

### 3. **Rate Limiting**
- Implement rate limiting for searches
- Prevent abuse of real-time listeners

### 4. **Data Privacy**
- Don't store sensitive data in Firestore
- Use Firebase Functions for sensitive operations
- Comply with GDPR/privacy regulations

---

## 📚 Additional Resources

- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Native Firebase](https://rnfirebase.io/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Real-Time Updates](https://firebase.google.com/docs/firestore/query-data/listen)

---

## ✅ Checklist

Before going to production, ensure:

- [ ] Firestore rules are properly configured
- [ ] User authentication is working
- [ ] User profiles are being created
- [ ] Real-time updates are functioning
- [ ] Presence system is updating correctly
- [ ] Error handling is in place
- [ ] Console logs are cleaned up (remove debug logs)
- [ ] Tested with multiple users
- [ ] Tested on both Android and iOS
- [ ] Privacy policy updated (if required)

---

## 🎉 Congratulations!

Your video calling app now has a **fully functional, real-time user management system** powered by Firebase Firestore!

Users will automatically appear in each other's lists, status updates happen in real-time, and everything syncs instantly across all devices.

Happy coding! 🚀

