-- Add gamification fields to users table
alter table public.users add column if not exists xp integer default 0;
alter table public.users add column if not exists level integer default 1;
alter table public.users add column if not exists badge text default 'Rookie Coder';
alter table public.users add column if not exists badge_description text default 'Complete challenges to earn badges';
alter table public.users add column if not exists preferred_mode text default 'Classic';

-- Update existing users with default values
update public.users set 
  xp = 0, 
  level = 1, 
  badge = 'Rookie Coder', 
  badge_description = 'Complete challenges to earn badges',
  preferred_mode = 'Classic' 
where xp is null;

-- Create index for faster queries
create index if not exists users_xp_idx on public.users(xp);
create index if not exists users_level_idx on public.users(level);