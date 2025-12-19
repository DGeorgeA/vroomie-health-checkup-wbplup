
# Download All Assets Feature - User Guide

## Overview

The "Download All Assets" feature allows admin users to export all Google Play Store assets (app icon, feature graphic, screenshots) packaged into a single zip file. This feature is **admin-only** and completely hidden from regular users.

## ✨ Key Features

### 1. Admin-Only Visibility
- **Dashboard**: "Play Store Assets" button only visible to admins
- **Mockups Page**: "Download All Assets" button only visible to admins
- **Security Badge**: Admin features display a lock/shield icon
- **Seamless UX**: Regular users never see these features

### 2. One-Click Export
- Captures all assets at exact Google Play dimensions
- Packages everything into a single zip file
- Includes README with upload instructions
- Automatic file naming and organization

### 3. Complete Asset Package
The exported zip includes:
- App Icon (512x512 px)
- Feature Graphic (1024x500 px)
- Phone Screenshots (1080x1920 px) - 3 screens
- Tablet Screenshot (1200x1920 px)
- README.txt with upload instructions

## 🚀 How to Use

### For Admin Users

#### Step 1: Access the Feature
1. Log in to the app with an admin account
2. On the Dashboard, you'll see a "Play Store Assets" button with a security badge
3. Tap the button to navigate to the mockups page

#### Step 2: Download Assets
1. On the mockups page, locate the "Download All Assets" button at the top
2. Tap the button
3. Confirm the export dialog
4. Wait for the assets to be captured and packaged (takes a few seconds)
5. When prompted, choose where to save the zip file

#### Step 3: Upload to Google Play
1. Extract the downloaded zip file
2. Open the README.txt for detailed instructions
3. Go to Google Play Console → Store Presence → Main store listing
4. Upload each asset to its corresponding section

### For Regular Users
- The feature is completely hidden
- No "Play Store Assets" button on Dashboard
- No "Download All Assets" button on mockups page
- Individual mockup screens remain accessible for viewing

## 🔐 Admin Setup

### Adding Your First Admin User

1. **Get Your User ID**
   - Log in to your Supabase project dashboard
   - Go to Authentication → Users
   - Find your user and copy the UUID

2. **Add to Admin Table**
   - Go to SQL Editor in Supabase
   - Run this query (replace `YOUR_USER_ID` with your actual UUID):
   ```sql
   INSERT INTO admin_users (user_id)
   VALUES ('YOUR_USER_ID');
   ```

3. **Verify**
   - Refresh the app
   - You should now see the "Play Store Assets" button on the Dashboard

### Adding Additional Admin Users

Once you're an admin, you can add other admins:

1. Get the new user's ID from Supabase Auth
2. Run the same INSERT query with their user ID
3. They'll immediately see admin features

### Removing Admin Access

```sql
DELETE FROM admin_users
WHERE user_id = 'USER_ID_TO_REMOVE';
```

## 📋 Technical Details

### Dependencies Used
- `jszip` - Creates zip files
- `expo-file-system` - File operations
- `expo-sharing` - Share/download functionality
- `react-native-view-shot` - Captures screenshots

### File Structure
```
utils/
  ├── assetExporter.ts      # Main export logic
  └── useIsAdmin.ts         # Admin status checker

app/
  ├── mockups/
  │   └── index.tsx         # Mockups page with export button
  └── (tabs)/(home)/
      └── index.tsx         # Dashboard with assets button

docs/
  ├── ASSET_EXPORT.md       # Technical documentation
  ├── ADMIN_SETUP.md        # Admin setup guide
  └── DOWNLOAD_ASSETS_FEATURE.md  # This file
```

### Security Features
- **RLS Policies**: Row Level Security on admin_users table
- **Auth Check**: Verifies user authentication before checking admin status
- **Conditional Rendering**: Features only render for admins
- **Passcode Protection**: Admin panel has additional passcode (1234)

## 🐛 Troubleshooting

### Button Not Visible
**Problem**: "Play Store Assets" button doesn't appear on Dashboard

**Solutions**:
1. Verify you're logged in
2. Check your user ID is in the admin_users table:
   ```sql
   SELECT * FROM admin_users WHERE user_id = 'YOUR_USER_ID';
   ```
3. Refresh the app or log out and back in
4. Check browser console for errors

### Export Fails
**Problem**: Export process fails or zip file is empty

**Solutions**:
1. Ensure all mockup screens are loaded
2. Check file system permissions
3. Try exporting individual assets first
4. Check console logs for specific errors
5. Verify you have enough storage space

### Zip File Issues
**Problem**: Zip file won't open or is corrupted

**Solutions**:
1. Try a different zip extraction tool
2. Re-export the assets
3. Check that the export completed successfully
4. Verify file size is reasonable (should be a few MB)

## 📱 Platform Support

### iOS
- ✅ Full support
- ✅ Native share sheet
- ✅ Save to Files app

### Android
- ✅ Full support
- ✅ Native share dialog
- ✅ Save to Downloads folder

### Web
- ✅ Full support
- ✅ Browser download
- ✅ Save to default downloads location

## 🎯 Best Practices

### For Admins
1. **Test First**: Export assets to a test location first
2. **Verify Quality**: Check each asset before uploading to Play Store
3. **Keep Backups**: Save exported zips for version control
4. **Update Regularly**: Re-export when mockups are updated
5. **Secure Access**: Only give admin access to trusted developers

### For Development
1. **Limit Admins**: Only add necessary users to admin_users table
2. **Monitor Access**: Regularly review who has admin access
3. **Update Passcode**: Change the admin panel passcode from default
4. **Test Changes**: Test export after any mockup changes
5. **Document Updates**: Keep track of asset versions

## 🔄 Future Enhancements

Potential improvements for future versions:
- [ ] Progress indicator during export
- [ ] Custom asset dimensions
- [ ] Batch export with multiple configurations
- [ ] Cloud storage integration
- [ ] Automatic upload to Google Play Console
- [ ] Asset preview before export
- [ ] Export history and versioning
- [ ] Email delivery of assets
- [ ] Scheduled exports

## 📞 Support

If you encounter issues:

1. **Check Documentation**
   - Read ASSET_EXPORT.md for technical details
   - Review ADMIN_SETUP.md for setup instructions

2. **Check Console Logs**
   - Open browser developer tools
   - Look for error messages
   - Share logs when reporting issues

3. **Verify Setup**
   - Confirm admin_users table exists
   - Check RLS policies are enabled
   - Verify user authentication

## 🎉 Summary

The "Download All Assets" feature provides a streamlined way for admin users to export all Play Store assets in one click. It's:

- **Secure**: Admin-only with proper RLS policies
- **Convenient**: One-click export of all assets
- **Professional**: Properly sized and named files
- **Hidden**: Completely invisible to regular users
- **Well-Documented**: Comprehensive guides and instructions

Perfect for developers who need to quickly generate and update Play Store listings!
