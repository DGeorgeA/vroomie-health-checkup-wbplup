
# Admin Quick Start Guide

Get your first admin user set up in 5 minutes!

## Prerequisites

- Access to your Supabase project dashboard
- The app is running and connected to Supabase

## Step 1: Create Admin User in Supabase Auth

1. Open your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add User"** button
4. Fill in the form:
   - **Email**: `admin@example.com` (or your preferred email)
   - **Password**: Create a strong password
   - **Auto Confirm User**: ✅ Check this box (important!)
5. Click **"Create User"**
6. **Copy the User ID (UUID)** - You'll need this in the next step

## Step 2: Add User to admin_users Table

1. In Supabase dashboard, navigate to **SQL Editor**
2. Click **"New Query"**
3. Paste this SQL (replace `YOUR-USER-UUID-HERE` with the UUID from Step 1):

```sql
INSERT INTO admin_users (user_id)
VALUES ('YOUR-USER-UUID-HERE');
```

4. Click **"Run"** to execute the query
5. You should see: `Success. No rows returned`

## Step 3: Verify the Setup

1. In Supabase dashboard, navigate to **Table Editor** → **admin_users**
2. You should see your new admin user listed
3. Verify the `user_id` matches the UUID from Step 1

## Step 4: Test Admin Login

1. Open your app
2. Navigate to the admin panel:
   - Try to access `/admin` route, OR
   - Click on "Play Store Assets" (if visible)
3. You should be redirected to the login screen
4. Enter your admin credentials:
   - **Email**: The email you created in Step 1
   - **Password**: The password you created in Step 1
5. Click **"Sign In"**
6. ✅ You should be logged in and see the admin panel!

## Troubleshooting

### "Invalid login credentials" error

**Problem**: Email or password is incorrect

**Solution**:
- Double-check the email and password
- Verify the user exists in Supabase Auth
- Make sure "Auto Confirm User" was checked when creating the user

### "Not authorized" or redirected back to login

**Problem**: User is not in `admin_users` table

**Solution**:
1. Go to Supabase → Table Editor → admin_users
2. Verify your user's UUID is in the table
3. If not, run the INSERT query again (Step 2)

### Can't find the User ID (UUID)

**Solution**:
1. Go to Supabase → Authentication → Users
2. Click on your user
3. The UUID is shown at the top of the user details

### "User already exists" when creating user

**Solution**:
- The email is already registered
- Either use a different email, or
- Find the existing user's UUID and add it to `admin_users` table

## Quick Reference

### Create Additional Admin Users

```sql
-- Replace with actual user UUID from Supabase Auth
INSERT INTO admin_users (user_id)
VALUES ('new-admin-user-uuid-here');
```

### Remove Admin Access

```sql
-- Replace with the user UUID you want to remove
DELETE FROM admin_users
WHERE user_id = 'user-uuid-to-remove';
```

### List All Admin Users

```sql
SELECT 
  au.id,
  au.user_id,
  au.created_at,
  u.email
FROM admin_users au
LEFT JOIN auth.users u ON u.id = au.user_id
ORDER BY au.created_at DESC;
```

## Default Test Admin (Development Only)

For development/testing, you can create a test admin:

**Email**: `admin@vroomie.test`
**Password**: `VroomieAdmin2024!`

⚠️ **Important**: Never use this in production! Always create unique admin accounts with strong passwords.

## Security Best Practices

✅ **Use strong passwords** - At least 12 characters with mixed case, numbers, and symbols
✅ **Unique emails** - Each admin should have their own email
✅ **Regular audits** - Review admin users periodically
✅ **Remove inactive admins** - Delete admin access for users who no longer need it
✅ **Enable 2FA** - If supported by your Supabase plan
✅ **Monitor admin actions** - Check logs regularly

## Next Steps

Now that you have admin access:

1. **Upload anomaly patterns** - Go to Admin Panel → Upload New Pattern
2. **Manage Play Store assets** - Dashboard → Play Store Assets
3. **Export assets** - Mockups → Download All Assets
4. **Create more admins** - Repeat this guide for additional admin users

## Need Help?

- 📖 Full documentation: `/docs/ROLE_BASED_ACCESS.md`
- 🔧 Implementation details: `/docs/ADMIN_AUTH_IMPLEMENTATION.md`
- 🐛 Check Supabase logs for errors
- 💬 Review app console for debug messages

---

**Congratulations!** 🎉 You now have a fully functional admin account!
