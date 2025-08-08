-- Create analytics table for storing platform analytics data
create table if not exists public.analytics (
    id uuid primary key default uuid_generate_v4(),
    type text not null, -- 'skill_growth', 'platform_engagement', 'top_skills'
    date date not null,
    data jsonb not null,
    created_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.analytics enable row level security;

-- Create policy to allow admins to view analytics
create policy "Admins can view analytics"
    on public.analytics
    for select
    to authenticated
    using (auth.uid() in (select id from public.admin));

-- Create policy to allow admins to insert analytics
create policy "Admins can insert analytics"
    on public.analytics
    for insert
    to authenticated
    with check (auth.uid() in (select id from public.admin));

-- Create indexes for better performance
create index if not exists analytics_type_idx on public.analytics(type);
create index if not exists analytics_date_idx on public.analytics(date);
create index if not exists analytics_type_date_idx on public.analytics(type, date);

-- Insert some sample analytics data
insert into public.analytics (type, date, data) values
-- Skill growth data
('skill_growth', '2024-01-01', '{"month": "January", "users": 15}'),
('skill_growth', '2024-02-01', '{"month": "February", "users": 23}'),
('skill_growth', '2024-03-01', '{"month": "March", "users": 31}'),
('skill_growth', '2024-04-01', '{"month": "April", "users": 28}'),
('skill_growth', '2024-05-01', '{"month": "May", "users": 35}'),
('skill_growth', '2024-06-01', '{"month": "June", "users": 42}'),

-- Platform engagement data
('platform_engagement', '2024-01-01', '{"date": "2024-01-01", "active_users": 12, "assessments_taken": 8, "learning_paths_started": 5}'),
('platform_engagement', '2024-01-02', '{"date": "2024-01-02", "active_users": 15, "assessments_taken": 11, "learning_paths_started": 7}'),
('platform_engagement', '2024-01-03', '{"date": "2024-01-03", "active_users": 18, "assessments_taken": 14, "learning_paths_started": 9}'),
('platform_engagement', '2024-01-04', '{"date": "2024-01-04", "active_users": 22, "assessments_taken": 17, "learning_paths_started": 12}'),
('platform_engagement', '2024-01-05', '{"date": "2024-01-05", "active_users": 25, "assessments_taken": 20, "learning_paths_started": 15}'),
('platform_engagement', '2024-01-06', '{"date": "2024-01-06", "active_users": 28, "assessments_taken": 23, "learning_paths_started": 18}'),
('platform_engagement', '2024-01-07', '{"date": "2024-01-07", "active_users": 30, "assessments_taken": 26, "learning_paths_started": 21}'),

-- Top skills data
('top_skills', '2024-01-01', '{"skill": "JavaScript", "count": 25}'),
('top_skills', '2024-01-01', '{"skill": "Python", "count": 22}'),
('top_skills', '2024-01-01', '{"skill": "React", "count": 18}'),
('top_skills', '2024-01-01', '{"skill": "Node.js", "count": 15}'),
('top_skills', '2024-01-01', '{"skill": "SQL", "count": 12}');

