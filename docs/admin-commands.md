# Admin Commands

## Adding an Admin User

To add a new admin user to the system, use the following command:

```bash
npm run add-admin <user_email>
```

For example:

```bash
npm run add-admin user@example.com
```

### Common Issues

#### Wrong Command Format

❌ **Incorrect:** `npm add -admin user@example.com`

✅ **Correct:** `npm run add-admin user@example.com`

The command uses `run` to execute the script defined in package.json, not `add` which is for installing packages.

#### Missing Environment Variable

If you see an error about missing `SUPABASE_SERVICE_KEY`, you need to set this environment variable:

```bash
# On Windows PowerShell
$env:SUPABASE_SERVICE_KEY="your-service-key-here"

# On Windows Command Prompt
set SUPABASE_SERVICE_KEY=your-service-key-here

# On Linux/Mac
export SUPABASE_SERVICE_KEY=your-service-key-here
```

You can get a service key from your Supabase project dashboard by following these steps:

1. Log in to your Supabase dashboard at https://supabase.com/dashboard
2. Select your project
3. Go to Project Settings > API
4. Under "Project API keys", find the "service_role" key (it has a label "service_role secret")
5. Click "Copy" to copy the key
6. Use this key as your SUPABASE_SERVICE_KEY value

**IMPORTANT**: The service role key has admin privileges and bypasses Row Level Security. Keep it secure and never expose it in client-side code.

#### User Not Found

If you see "No user found with email", make sure:

1. **The user has already registered through the normal registration process** - This is a requirement! Users must first create a regular account through your application before they can be promoted to admin status.
2. You're using the correct email address that the user registered with
3. Your Supabase service key has the necessary permissions

**Important**: The add-admin script cannot create new users. It can only promote existing users to admin status. The workflow is:

1. User registers a regular account through the application
2. User verifies their email (if required by your app)
3. Administrator runs the add-admin script with the user's email
4. User can now access admin features

## Admin Table Schema

The admin table in the database has the following structure:

```sql
create table if not exists public.admin (
    id uuid primary key references auth.users(id) on delete cascade,
    gmail text not null,
    password text not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone
);
```

Note that the actual schema may differ from what's defined in the migration files. The current implementation requires the following fields:

- `id`: UUID that references the user's ID in the auth.users table
- `gmail`: The user's email address
- `password`: A password field (set to a default value by the add-admin script)

If you encounter schema-related errors when running the add-admin script, please check the actual database schema and update the script accordingly.