# Supabase Database Setup

## User Logins Table

To track user login activity and display performance graphs on the dashboard, you need to create a `user_logins` table in your Supabase database.

### Option 1: Using the SQL Editor in Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `migrations/20240101000000_create_user_logins_table.sql` file
5. Run the query

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed, you can run the migration with:

```bash
supabase migration up
```

## Table Structure

### user_logins

| Column      | Type                     | Description                       |
|-------------|--------------------------|-----------------------------------|
| id          | uuid                     | Primary key                       |
| user_id     | uuid                     | Foreign key to auth.users(id)     |
| login_time  | timestamp with time zone | When the user logged in           |
| created_at  | timestamp with time zone | When the record was created       |

## Row Level Security (RLS) Policies

The migration script sets up the following RLS policies:

1. Users can only view their own login history
2. Users can only insert their own login records

## Indexes

The following indexes are created for better performance:

1. `user_logins_user_id_idx` on `user_id`
2. `user_logins_login_time_idx` on `login_time`