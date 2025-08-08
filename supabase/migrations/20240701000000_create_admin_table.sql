-- Create admin table to store admin user information
create table if not exists public.admin (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone
);

-- Add RLS policies
alter table public.admin enable row level security;

-- Create policy to allow admins to view admin table
create policy "Admins can view admin table"
    on public.admin
    for select
    using (auth.uid() IN (select id from public.admin));

-- Create index for faster queries
create index if not exists admin_id_idx on public.admin(id);