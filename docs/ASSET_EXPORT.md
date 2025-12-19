
# Asset Export Feature

## Overview

The Asset Export feature allows admin users to download all Google Play Store assets (app icon, feature graphic, screenshots) packaged into a single zip file. This feature is protected by admin-only access control.

## Features

### 1. Download All Assets Button
- Located on the `/mockups` page
- Only visible to admin users
- Packages all assets into a zip file
- Includes a README with upload instructions

### 2. Admin-Based Visibility
- Uses the `useIsAdmin` hook to check admin status
- Queries the `admin_users` table in Supabase
- Seamlessly hides the button from regular users

### 3. Asset Packaging
- Captures SVG-based assets at exact Google Play dimensions
- Creates a zip file with properly named files
- Includes metadata and instructions

## Technical Implementation

### Dependencies
- `jszip`: For creating zip files
- `expo-file-system`: For file system operations
- `expo-sharing`: For sharing/downloading files
- `react-native-view-shot`: For capturing screenshots

### Key Files

#### `utils/assetExporter.ts`
Main utility for exporting assets:
- `exportAllAssets()`: Captures and packages all assets
- Handles file system operations
- Creates zip file with README

#### `app/mockups/index.tsx`
Mockups index page with export button:
- Displays "Download All Assets" button for admins
- Handles export process
- Shows loading state during export

#### `utils/useIsAdmin.ts`
Admin status checker:
- Queries `admin_users` table
- Returns admin status and loading state
- Used throughout the app for conditional rendering

## Usage

### For Developers (Admin Users)

1. **Access the Feature**
   - Navigate to Dashboard
   - Tap "Play Store Assets" button (admin-only)
   - Or navigate directly to `/mockups`

2. **Download Assets**
   - Tap "Download All Assets" button
   - Confirm the export dialog
   - Wait for assets to be captured and packaged
   - Share/save the zip file when prompted

3. **Upload to Google Play**
   - Extract the zip file
   - Follow instructions in README.txt
   - Upload each asset to the appropriate section in Google Play Console

### For Regular Users
- The "Play Store Assets" button is hidden on the Dashboard
- The "Download All Assets" button is hidden on the mockups page
- Individual mockup screens remain accessible for viewing

## Admin Setup

### Adding Admin Users

1. Get the user's ID from Supabase Auth:
   ```sql
   SELECT id, email FROM auth.users;
   ```

2. Insert into `admin_users` table:
   ```sql
   INSERT INTO admin_users (user_id)
   VALUES ('user-uuid-here');
   ```

3. The user will now see admin-only features

### Removing Admin Users

```sql
DELETE FROM admin_users
WHERE user_id = 'user-uuid-here';
```

## Asset Specifications

### App Icon
- Size: 512 x 512 px
- Format: PNG
- Filename: `app-icon-512x512.png`

### Feature Graphic
- Size: 1024 x 500 px
- Format: PNG
- Filename: `feature-graphic-1024x500.png`

### Phone Screenshots
- Size: 1080 x 1920 px
- Format: PNG
- Filenames:
  - `phone-screenshot-1-1080x1920.png`
  - `phone-screenshot-2-1080x1920.png`
  - `phone-screenshot-3-1080x1920.png`

### Tablet Screenshot
- Size: 1200 x 1920 px
- Format: PNG
- Filename: `tablet-screenshot-1200x1920.png`

## Security

### Access Control
- Admin status checked on every render
- RLS policies on `admin_users` table
- Passcode protection for admin panel (1234)

### RLS Policies
```sql
-- Allow users to check if they are admin
CREATE POLICY "Users can check their own admin status"
ON admin_users FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can view all admin users
CREATE POLICY "Admins can view all admin users"
ON admin_users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  )
);
```

## Troubleshooting

### Button Not Visible
- Verify user is in `admin_users` table
- Check that RLS policies are enabled
- Ensure user is authenticated

### Export Fails
- Check file system permissions
- Verify all mockup screens are loaded
- Check console logs for specific errors

### Zip File Empty
- Ensure SVG components are rendering
- Check that refs are properly attached
- Verify capture dimensions are correct

## Future Enhancements

- [ ] Add progress indicator during export
- [ ] Support for custom asset dimensions
- [ ] Batch export with multiple configurations
- [ ] Cloud storage integration
- [ ] Automatic upload to Google Play Console
- [ ] Asset preview before export
- [ ] Export history and versioning

## Related Documentation

- [Admin Setup Guide](./ADMIN_SETUP.md)
- [Getting Started](./GETTING_STARTED.md)
- [Audio Implementation](./AUDIO_IMPLEMENTATION.md)
