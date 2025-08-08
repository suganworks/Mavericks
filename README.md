# Mavericks Coding Platform

A comprehensive coding platform with user and admin functionalities.

## Features

- User authentication and registration
- User dashboard with coding challenges
- Admin dashboard for platform management
- Gamification elements (XP, levels, badges)

## Admin Functionality

The platform includes an admin system that uses the same login mechanism as regular users. When a user logs in, the system checks if they are an admin and redirects them accordingly:

- Regular users are directed to the user dashboard
- Admin users are directed to the admin dashboard

### Adding an Admin

To add an admin user to the system, use the provided script:

```bash
# First, make sure the user is registered in the system
# Then run the admin script with their email
node scripts/add_admin.js <user_email>
```

Note: You need to set the `SUPABASE_SERVICE_KEY` environment variable with a Supabase service key that has admin privileges.

## Development

This project is built with React and Vite, with Supabase as the backend.

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`
4. Run the development server: `npm run dev`

### Database Migrations

Database migrations are located in the `supabase/migrations` directory. To apply migrations, use the Supabase CLI.
