# 🚀 Building iOS with GitHub Actions (Windows Users)

Since you're on Windows, you can use GitHub Actions to build your iOS app automatically in the cloud - **completely FREE**!

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Push your code to GitHub**
3. That's it! No Mac needed!

## 🎯 Quick Setup

### Step 1: Push Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

### Step 2: Enable GitHub Actions

The workflow file is already created at `.github/workflows/ios-build.yml`. GitHub will automatically detect it!

### Step 3: Trigger a Build

**Option A: Automatic (on every push)**
```bash
git add .
git commit -m "Update app"
git push
```

**Option B: Manual trigger**
1. Go to your GitHub repository
2. Click **Actions** tab
3. Select **iOS Build** workflow
4. Click **Run workflow**
5. Click the green **Run workflow** button

## 📥 Download Your Build

After the build completes (usually 5-10 minutes):

1. Go to **Actions** tab on GitHub
2. Click on the completed workflow run
3. Scroll down to **Artifacts**
4. Download **ios-build** artifact
5. Extract the ZIP file

You'll get the `.app` file that you can:
- Test on iOS Simulator (on a Mac)
- Sign and distribute (requires Mac + Apple Developer account)

## 🔐 For Signed Builds (App Store)

To create a signed build for App Store or TestFlight:

### 1. Add Secrets to GitHub

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:
- `APPLE_CERTIFICATE_BASE64` - Your signing certificate (base64 encoded)
- `APPLE_CERTIFICATE_PASSWORD` - Certificate password
- `PROVISIONING_PROFILE_BASE64` - Provisioning profile (base64 encoded)
- `KEYCHAIN_PASSWORD` - A password for temporary keychain

### 2. Update Workflow

I can create an advanced workflow with signing if you provide:
- Apple Developer account credentials
- Signing certificates
- Provisioning profiles

## 🎨 What the Workflow Does

1. ✅ Checks out your code
2. ✅ Sets up Node.js 20
3. ✅ Installs npm dependencies
4. ✅ Sets up Ruby and Bundler
5. ✅ Installs CocoaPods dependencies
6. ✅ Builds the iOS app
7. ✅ Uploads the build as an artifact

## ⏱️ Build Time

- First build: ~10-15 minutes
- Subsequent builds: ~5-8 minutes (with caching)

## 💰 Cost

**FREE!** GitHub provides:
- 2,000 minutes/month for free accounts
- Unlimited for public repositories
- Each iOS build uses ~10 minutes

## 🔧 Troubleshooting

### Build Fails with CocoaPods Error

The workflow automatically handles CocoaPods installation. If it fails:
1. Check the error in Actions logs
2. Update Podfile if needed
3. Push changes and retry

### Build Fails with Signing Error

The current workflow builds **without signing** (for testing). For signed builds:
1. Add signing secrets (see above)
2. Request an advanced workflow configuration

### Workflow Doesn't Trigger

1. Ensure the file is at `.github/workflows/ios-build.yml`
2. Check you pushed to `main` or `master` branch
3. Check Actions tab is enabled in repo settings

## 🚀 Next Steps

1. **Push your code to GitHub** (if not already)
2. **Watch the build run** in Actions tab
3. **Download the artifact** when complete
4. **Test on a Mac** (simulator or device)

## 📱 Alternative: Use Expo EAS

If you want even easier builds:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios
```

Expo EAS provides:
- ✅ Cloud builds without Mac
- ✅ Automatic signing
- ✅ TestFlight distribution
- ✅ Free tier available

## 📞 Need Help?

1. Check the [GitHub Actions logs](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/using-workflow-run-logs)
2. Review [iOS Build Guide](./IOS_BUILD_GUIDE.md)
3. Ask in the repository issues

---

**You can now build iOS apps from Windows!** 🎉
