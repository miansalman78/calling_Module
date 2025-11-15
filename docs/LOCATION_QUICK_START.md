# 📍 Location Tracking - Quick Start

## ⚡ 5-Minute Setup Guide

### Step 1: Firestore Rules (2 min)

1. Go to **[Firebase Console](https://console.firebase.google.com/)**
2. Select your project
3. **Firestore Database** → **Rules**
4. Add this code:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Location History
    match /locationHistory/{docId} {
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
    }
    
    // Users with location
    match /users/{userId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

5. Click **Publish**

---

### Step 2: Build the App (1 min)

```bash
# Android
npx react-native run-android

# iOS (if you're on Mac)
cd ios && pod install && cd ..
npx react-native run-ios
```

---

### Step 3: Grant Permissions (1 min)

1. Open the app and log in
2. Go to **"Location"** tab (third tab)
3. Toggle **"Background Tracking"** ON
4. When prompted, **allow location permissions**:
   - Android: Select "Allow all the time"
   - iOS: Select "Always" or "Allow While Using App" then "Change to Always Allow"

---

### Step 4: Disable Battery Optimization - Android ONLY (1 min)

**⚠️ CRITICAL for 5-6 days tracking!**

1. In the app, tap **"Battery Settings"** button
2. OR manually: **Settings** → **Apps** → **videocalling** → **Battery**
3. Select **"Unrestricted"** or **"Don't optimize"**

---

## ✅ Done! You're Tracking!

Check if it's working:
1. You should see a **persistent notification** (Android)
2. Check **Firebase Console** → **Firestore** → **locationHistory** collection
3. New location documents should appear every 30 seconds

---

## 📱 App Usage

### To Start Tracking:
1. Open app → **Location tab**
2. Toggle switch **ON**
3. Grant permissions

### To Stop Tracking:
1. Open app → **Location tab**  
2. Toggle switch **OFF**

### Check Status:
- **🟢 Active** = Currently tracking
- **⚪ Inactive** = Not tracking

---

## 🔴 Common Issues

### Issue: Tracking stops after a few hours (Android)

**Fix:** Disable battery optimization (Step 4 above)

### Issue: No location updates in Firestore

**Fix:** Check Firestore rules are published (Step 1)

### Issue: Permission denied error

**Fix:** Make sure you granted "Allow all the time" (Android) or "Always" (iOS)

---

## 📊 What Data is Saved?

### In Firestore → `locationHistory`:
```javascript
{
  uid: "user_abc123",
  location: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 15.2,
    timestamp: 1699000000000
  },
  updatedAt: Timestamp,
  deviceInfo: {
    platform: "android",
    isBackground: true
  }
}
```

### In Firestore → `users/{userId}`:
```javascript
{
  currentLocation: {
    latitude: 37.7749,
    longitude: -122.4194,
    ...
  },
  lastLocationUpdate: Timestamp
}
```

---

## ⚙️ Configuration

### Update Frequency:
Edit `src/utils/locationService.ts`:
```typescript
const UPDATE_INTERVAL = 30000; // 30 seconds (change if needed)
```

### Accuracy:
```typescript
accuracy: {
  android: 'high',    // high | balanced | low
  ios: 'bestForNavigation',  // best | bestForNavigation | ...
}
```

---

## 🔋 Battery Impact

- **High accuracy, 30s**: ~10-15% per hour
- **Balanced, 1min**: ~5-8% per hour  
- **Low, 5min**: ~2-4% per hour

---

## ✅ Testing Checklist

Quick test (15 minutes):
- [ ] Start tracking
- [ ] Minimize app
- [ ] Lock screen
- [ ] Wait 5 minutes
- [ ] Check Firestore for new locations
- [ ] Check notification shows (Android)

Long test (24 hours):
- [ ] Start tracking
- [ ] Leave device alone for 24 hours
- [ ] Check if still tracking after 24 hours
- [ ] Verify locations saved continuously

---

## 📖 Full Documentation

For detailed info, see **`LOCATION_TRACKING_GUIDE.md`**

---

**That's it! Your app now tracks locations continuously for 5-6 days! 🎉**

