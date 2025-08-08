# Admin Guide

## Overview

The Mavericks Coding Platform includes an admin system that allows privileged users to access an admin dashboard with additional management capabilities. Admin users use the same login system as regular users, but are redirected to the admin dashboard upon login.

## Admin Authentication

The admin authentication system works as follows:

1. Users log in through the standard login page using their email and password
2. The system checks if the user is registered in the `admin` table in the database
3. If the user is an admin, they are redirected to the admin dashboard
4. If the user is not an admin, they are redirected to the regular user dashboard

## Adding an Admin User

To add a new admin user:

1. First, ensure the user has registered through the normal registration process
2. Use the provided script to add the user to the admin table:

```bash
# Using npm script
npm run add-admin user@example.com

# Or directly with node
node scripts/add_admin.js user@example.com
```

**Note:** You need to set the `SUPABASE_SERVICE_KEY` environment variable with a Supabase service key that has admin privileges.

## Admin Dashboard

The admin dashboard provides the following features:

- User management
- Analytics and statistics
- Content management
- System configuration

## Security Considerations

- Admin access is controlled through database row-level security (RLS) policies
- Admin users can only be added through the server-side script, not through the UI
- The admin table is protected with RLS policies that only allow admins to view the admin list