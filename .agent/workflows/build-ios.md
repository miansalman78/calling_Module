---
description: Build iOS app for testing or App Store submission
---

# iOS Build Workflow

This workflow guides you through building the iOS version of the Video Calling app.

> **⚠️ Important**: This workflow requires macOS with Xcode installed. If you're on Windows, see the iOS Build Guide for alternative options.

## Prerequisites Check

Before starting, verify you have:

```bash
# Check Xcode
xcode-select --version

# Check CocoaPods
pod --version

# Check Node.js (should be v20+)
node --version
```

## Step 1: Install Dependencies

First time setup or after pulling new changes:

```bash
# Install Node.js dependencies
npm install
```

## Step 2: Install iOS Dependencies

```bash
# Navigate to iOS directory
cd ios

# Install CocoaPods dependencies
bundle exec pod install

# Return to root
cd ..
```

## Step 3: Choose Your Build Type

### Option A: Development Build (Simulator)

Run on iOS Simulator for quick testing:

```bash
# Start Metro bundler
npm start
```

In a new terminal:

```bash
# Run on default simulator
npm run ios

# Or specify a simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### Option B: Development Build (Physical Device)

Run on a real iPhone for testing:

1. Open Xcode workspace:
```bash
open ios/videocalling.xcworkspace
```

2. In Xcode:
   - Select your development team under **Signing & Capabilities**
   - Connect your iPhone via USB
   - Select your device from the device dropdown
   - Click Run (▶️)

### Option C: Release Build (Production)

Create a production build for App Store:

1. Open Xcode workspace:
```bash
open ios/videocalling.xcworkspace
```

2. In Xcode:
   - Select **Product** → **Scheme** → **Edit Scheme**
   - Change **Build Configuration** to **Release**
   - Select **Product** → **Archive**
   - Wait for archive to complete
   - Click **Distribute App**
   - Choose distribution method:
     - **App Store Connect** - for App Store submission
     - **Ad Hoc** - for testing on specific devices
     - **Development** - for development testing

## Step 4: Test the Build

After building, verify:

- [ ] App launches successfully
- [ ] Firebase authentication works
- [ ] User list loads from Firestore
- [ ] Video calling functionality works
- [ ] Audio works properly
- [ ] Location tracking works in background
- [ ] Push notifications work
- [ ] App doesn't crash on common actions

## Troubleshooting

### Build Fails with CocoaPods Error

```bash
cd ios
pod cache clean --all
rm -rf Pods
rm Podfile.lock
bundle exec pod install
cd ..
```

### Build Fails with Signing Error

1. Open `ios/videocalling.xcworkspace` in Xcode
2. Select the project → **videocalling** target
3. Go to **Signing & Capabilities**
4. Enable **Automatically manage signing**
5. Select your Team

### Metro Bundler Issues

```bash
# Reset Metro cache
npm start -- --reset-cache
```

### Xcode Derived Data Issues

```bash
# Clear derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

## For Windows Users

Since you're on Windows, you have these options:

1. **Use a Mac** - Borrow or rent access to a Mac
2. **Cloud Mac Services**:
   - [MacStadium](https://www.macstadium.com/)
   - [MacinCloud](https://www.macincloud.com/)
   - [AWS EC2 Mac](https://aws.amazon.com/ec2/instance-types/mac/)
3. **CI/CD Services** (Recommended):
   - GitHub Actions (free for open source)
   - Bitrise
   - CircleCI
   - Codemagic

## Next Steps

After successful build:

1. Test all features thoroughly
2. Fix any bugs found during testing
3. Prepare app store assets (screenshots, description, etc.)
4. Submit to App Store Connect for review

## Additional Resources

- [Full iOS Build Guide](../docs/IOS_BUILD_GUIDE.md)
- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup)
- [Apple Developer Portal](https://developer.apple.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
