# 📱 iOS Build Guide

This guide will help you build the iOS version of the Video Calling app. 

> **⚠️ Important**: Building iOS apps requires a **macOS machine** with Xcode installed. If you're on Windows, see the [Alternative Options](#alternative-options-for-windows-users) section below.

## 📋 Prerequisites

Before you begin, ensure you have:

1. **macOS** (Monterey 12.0 or later recommended)
2. **Xcode** (14.0 or later) - [Download from Mac App Store](https://apps.apple.com/us/app/xcode/id497799835)
3. **Xcode Command Line Tools** installed
4. **CocoaPods** installed
5. **Node.js** (v20 or later)
6. **Ruby** (for CocoaPods)
7. **Apple Developer Account** (for device testing and App Store distribution)

### Verify Prerequisites

```bash
# Check Xcode installation
xcode-select --version

# Check CocoaPods
pod --version

# Check Node.js
node --version

# Check Ruby
ruby --version
```

## 🚀 Quick Start

### 1. Install Dependencies

From the project root directory:

```bash
# Install Node.js dependencies
npm install

# Install Ruby bundler (first time only)
bundle install

# Install iOS dependencies via CocoaPods
cd ios
bundle exec pod install
cd ..
```

### 2. Run on iOS Simulator

```bash
# Start Metro bundler in one terminal
npm start

# In another terminal, run the app
npm run ios

# Or specify a specific simulator
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### 3. Run on Physical Device

1. Open the project in Xcode:
   ```bash
   open ios/videocalling.xcworkspace
   ```

2. In Xcode:
   - Select your development team in **Signing & Capabilities**
   - Connect your iPhone via USB
   - Select your device from the device dropdown
   - Click the **Run** button (▶️)

## 🏗️ Building for Production

### Development Build

```bash
# Build for simulator
npx react-native run-ios --configuration Debug

# Build for device
npx react-native run-ios --device --configuration Debug
```

### Release Build

#### Option 1: Using Xcode (Recommended)

1. Open the workspace:
   ```bash
   open ios/videocalling.xcworkspace
   ```

2. In Xcode:
   - Select **Product** → **Scheme** → **Edit Scheme**
   - Change **Build Configuration** to **Release**
   - Select **Product** → **Archive**
   - Once archived, click **Distribute App**
   - Choose distribution method:
     - **App Store Connect** - for App Store submission
     - **Ad Hoc** - for testing on registered devices
     - **Enterprise** - for enterprise distribution
     - **Development** - for development testing

#### Option 2: Using Command Line

```bash
# Build release version
npx react-native run-ios --configuration Release

# Create archive (requires Xcode)
cd ios
xcodebuild -workspace videocalling.xcworkspace \
  -scheme videocalling \
  -configuration Release \
  -archivePath ./build/videocalling.xcarchive \
  archive
```

### Creating IPA File

After archiving in Xcode:

1. Open **Window** → **Organizer**
2. Select your archive
3. Click **Distribute App**
4. Follow the wizard to create an IPA file

Or via command line:

```bash
xcodebuild -exportArchive \
  -archivePath ./build/videocalling.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist ExportOptions.plist
```

## ⚙️ Configuration

### App Signing

1. **Automatic Signing** (Recommended for beginners):
   - Open `ios/videocalling.xcworkspace` in Xcode
   - Select the project in the navigator
   - Select the **videocalling** target
   - Go to **Signing & Capabilities**
   - Check **Automatically manage signing**
   - Select your **Team**

2. **Manual Signing** (Advanced):
   - Uncheck **Automatically manage signing**
   - Select your **Provisioning Profile**
   - Select your **Signing Certificate**

### Bundle Identifier

The default bundle identifier is set in Xcode. To change it:

1. Open `ios/videocalling.xcworkspace`
2. Select the project → **videocalling** target
3. Change **Bundle Identifier** under **General** tab

### App Icons and Launch Screen

- **App Icons**: Add to `ios/videocalling/Images.xcassets/AppIcon.appiconset/`
- **Launch Screen**: Edit `ios/videocalling/LaunchScreen.storyboard`

### Permissions

This app requires several permissions. They are already configured in `Info.plist`:

- Camera access (for video calls)
- Microphone access (for audio)
- Location access (for background tracking)
- Push notifications (for call invitations)

## 🔧 Troubleshooting

### CocoaPods Issues

```bash
# Clear CocoaPods cache
cd ios
pod cache clean --all
rm -rf Pods
rm Podfile.lock
bundle exec pod install
cd ..
```

### Build Failures

```bash
# Clean build folder
cd ios
xcodebuild clean
cd ..

# Or in Xcode: Product → Clean Build Folder (Shift+Cmd+K)
```

### Metro Bundler Issues

```bash
# Reset Metro cache
npm start -- --reset-cache

# Or
npx react-native start --reset-cache
```

### Xcode Derived Data Issues

```bash
# Clear Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

### Signing Issues

- Ensure your Apple Developer account is active
- Check that your certificates are valid
- Verify provisioning profiles are not expired
- Try **Automatically manage signing** first

## 📦 App Store Submission

### 1. Prepare App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app
3. Fill in app information
4. Upload screenshots and app preview videos

### 2. Archive and Upload

1. In Xcode, select **Product** → **Archive**
2. Once archived, click **Distribute App**
3. Select **App Store Connect**
4. Follow the wizard to upload

### 3. Submit for Review

1. In App Store Connect, select your app
2. Go to **App Store** tab
3. Fill in all required information
4. Click **Submit for Review**

## 🖥️ Alternative Options for Windows Users

Since you're on Windows, here are your options:

### Option 1: Use a Mac (Recommended)
- Borrow a Mac from a friend or colleague
- Use a Mac at a co-working space or library

### Option 2: Cloud-based Mac Services
- **[MacStadium](https://www.macstadium.com/)** - Rent a Mac in the cloud
- **[MacinCloud](https://www.macincloud.com/)** - Mac cloud hosting
- **[AWS EC2 Mac Instances](https://aws.amazon.com/ec2/instance-types/mac/)** - Amazon's Mac cloud service

### Option 3: CI/CD Services
- **[GitHub Actions](https://github.com/features/actions)** - Free macOS runners for open source
- **[Bitrise](https://www.bitrise.io/)** - Mobile CI/CD with free tier
- **[CircleCI](https://circleci.com/)** - CI/CD with macOS support
- **[Codemagic](https://codemagic.io/)** - Specialized in React Native builds

### Option 4: Expo EAS Build (If Applicable)
If you can migrate to Expo:
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios
```

## 📝 Build Checklist

Before submitting to App Store:

- [ ] Test on multiple iOS devices and simulators
- [ ] Verify all features work in Release mode
- [ ] Check app icons and launch screen
- [ ] Verify all permissions are properly requested
- [ ] Test Firebase authentication
- [ ] Test video/voice calling functionality
- [ ] Test background location tracking
- [ ] Test push notifications
- [ ] Review app metadata and screenshots
- [ ] Ensure compliance with App Store guidelines

## 🔗 Useful Resources

- [React Native iOS Setup](https://reactnative.dev/docs/environment-setup)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [CocoaPods Guides](https://guides.cocoapods.org/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Zego Cloud iOS Integration](https://www.zegocloud.com/docs)

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
3. Check [Zego Cloud Documentation](https://www.zegocloud.com/docs)
4. Search [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

---

**Note**: This app uses several native modules (Firebase, Zego Cloud, CallKeep, etc.) that require proper configuration. Ensure all native dependencies are properly linked via CocoaPods.
