
# Role-Based Access Control

This document describes the role-based access control (RBAC) implementation in the Vroomie Health CheckUp app.

## Overview

The app implements a two-tier access system:

1. **Public Users** - Can access all general app features without authentication
2. **Admin Users** - Require authentication to access privileged administrative features

## Public Access (No Login Required)

All general app features are accessible without any authentication:

- **Dashboard** - View app overview and statistics
- **Health CheckUp** - Record engine audio for analysis
- **Reports** - View past health checkup results
- **Settings** - Configure app preferences

Public users can use the entire core functionality of the app without creating an account or logging in.

## Admin Access (Login Required)

Administrative features require authentication with email and password:

### Protected Features

- **Play Store Assets** button on Dashboard
- **Download All Assets** button on Mockups page
- **Admin Panel** (`/admin`) - Manage anomaly patterns
  - Upload new anomaly pattern files
  - Delete existing patterns
  - View all uploaded patterns

### Admin Login

Admins access protected features by:

1. Navigating to `/admin-login` or clicking on admin-protected features
2. Signing in with email and password
3. Being redirected to the admin panel upon successful authentication

**Admin Login Screen:** `/admin-login`

## Authentication Architecture

### AuthContext

The app uses a React Context (`AuthContext`) to manage authentication state globally:

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { 
  session,      // Current Supabase session
  user,         // Current authenticated user
  isAdmin,      // Boolean indicating admin status
  loading,      // Boolean indicating auth check in progress
  signIn,       // Function to sign in
  signOut,      // Function to sign out
  refreshAdminStatus  // Function to refresh admin status
} = useAuth();
```

### Session Management

- Admin sessions are persisted across app restarts using Supabase Auth
- Sessions are stored securely in AsyncStorage
- Automatic session refresh on app launch
- Logout functionality available in admin panel

### Security Features

- Email/password authentication via Supabase Auth
- Row Level Security (RLS) policies on `admin_users` table
- Automatic redirect to login for unauthenticated admin access attempts
- Secure session storage with automatic token refresh

## Creating Admin Users

Admin users **cannot** be created from the app UI. They must be created via backend configuration:

### Method 1: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Create a new user with email and password
4. Copy the user's UUID
5. Navigate to Table Editor > admin_users
6. Insert a new row with the user's UUID:

```sql
INSERT INTO admin_users (user_id)
VALUES ('user-uuid-here');
```

### Method 2: SQL Query

Execute this SQL in the Supabase SQL Editor:

```sql
-- First, create the user in Supabase Auth (via dashboard or API)
-- Then add them to admin_users table:

INSERT INTO admin_users (user_id)
VALUES ('user-uuid-from-auth');
```

### Default Admin Account

For initial setup, create at least one admin account using the methods above.

## Database Schema

### admin_users Table

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view admin_users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert new admins"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete admins"
  ON admin_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );
```

## Implementation Details

### Protected Routes

Routes that require admin authentication:

- `/admin` - Admin panel (automatically redirects to `/admin-login` if not authenticated)
- `/admin-login` - Admin login screen

### Protected Components

Components that are only visible to admins:

- **Dashboard**: "Play Store Assets" button
- **Mockups**: "Download All Assets" button

These components check `isAdmin` from `useAuth()` and only render when `true`.

### Example Usage

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      {/* Public content - always visible */}
      <PublicFeature />

      {/* Admin-only content */}
      {isAdmin && (
        <AdminFeature />
      )}
    </View>
  );
}
```

### Redirect Pattern

For full pages that require admin access:

```typescript
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminScreen() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAdmin) {
    return <Redirect href="/admin-login" />;
  }

  return <AdminContent />;
}
```

## User Experience

### Public Users

- No login prompts or authentication barriers
- Full access to core app functionality
- Admin features are completely hidden
- Seamless, frictionless experience

### Admin Users

- Clear separation of admin features
- Dedicated login screen with email/password
- Persistent sessions across app restarts
- Logout button in admin panel
- Visual indicators (lock icons, badges) for admin features

## Security Best Practices

1. **Never expose admin credentials in the app**
2. **Always use RLS policies** on admin-related tables
3. **Validate admin status server-side** for sensitive operations
4. **Use HTTPS** for all API communications
5. **Implement rate limiting** on login attempts
6. **Regularly audit admin users** and remove inactive accounts
7. **Use strong passwords** for admin accounts
8. **Enable 2FA** (if supported by Supabase Auth)

## Troubleshooting

### Admin can't login

1. Verify user exists in Supabase Auth
2. Check user's UUID is in `admin_users` table
3. Verify RLS policies are enabled
4. Check Supabase project URL and anon key are correct

### Admin features not showing

1. Verify `isAdmin` is `true` in `useAuth()`
2. Check `loading` is `false` before rendering
3. Verify user is in `admin_users` table
4. Try refreshing admin status with `refreshAdminStatus()`

### Session not persisting

1. Check AsyncStorage permissions
2. Verify Supabase client configuration
3. Check for auth state change listeners
4. Verify `persistSession: true` in Supabase client config

## Future Enhancements

Potential improvements to the RBAC system:

- Multiple admin roles (super admin, moderator, etc.)
- Permission-based access control (granular permissions)
- Admin activity logging
- Two-factor authentication (2FA)
- Password reset functionality
- Admin user management UI
- Audit trail for admin actions
- Session timeout configuration
- IP whitelisting for admin access

## Related Files

- `/contexts/AuthContext.tsx` - Authentication context provider
- `/app/admin-login.tsx` - Admin login screen
- `/app/admin.tsx` - Admin panel (protected)
- `/utils/useIsAdmin.ts` - Legacy hook (deprecated, use `useAuth()`)
- `/app/(tabs)/(home)/index.tsx` - Dashboard with admin features
- `/app/mockups/index.tsx` - Mockups page with admin features
