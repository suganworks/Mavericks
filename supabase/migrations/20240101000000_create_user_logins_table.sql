-- Create user_logins table to track user login activity
create table if not exists public.user_logins (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references auth.users(id) on delete cascade,
    login_time timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now()
);

-- Add RLS policies
alter table public.user_logins enable row level security;

-- Create policy to allow users to see only their own login history
create policy "Users can view their own login history"
    on public.user_logins
    for select
    using (auth.uid() = user_id);

-- Create policy to allow users to insert their own login records
create policy "Users can insert their own login records"
    on public.user_logins
    for insert
    with check (auth.uid() = user_id);

-- Create index for faster queries
create index if not exists user_logins_user_id_idx on public.user_logins(user_id);
create index if not exists user_logins_login_time_idx on public.user_logins(login_time);