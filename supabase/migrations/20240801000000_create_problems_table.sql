-- Create problems table for coding challenges
create table if not exists public.problems (
    id bigint primary key,
    title text not null,
    description text not null,
    difficulty text not null,
    topic text,
    templates jsonb,
    test_cases jsonb,
    time_limit integer default 10,
    created_at timestamp with time zone default now()
);

-- Create submissions table for storing code submissions
create table if not exists public.submissions (
    id bigint primary key generated always as identity,
    user_id uuid references auth.users(id) on delete cascade,
    problem_id bigint references public.problems(id) on delete cascade,
    code text not null,
    language text not null,
    output text,
    topic text,
    passed_all_tests boolean default false,
    score integer default 0,
    created_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.problems enable row level security;
alter table public.submissions enable row level security;

-- Create policy to allow all users to view problems
create policy "Anyone can view problems"
    on public.problems
    for select
    to authenticated
    using (true);

-- Create policy to allow only admins to modify problems
create policy "Only admins can insert/update/delete problems"
    on public.problems
    using (auth.uid() in (select auth.uid() from public.users where is_admin = true));

-- Create policy to allow users to insert their own submissions
create policy "Users can insert their own submissions"
    on public.submissions
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Create policy to allow users to view their own submissions
create policy "Users can view their own submissions"
    on public.submissions
    for select
    to authenticated
    using (auth.uid() = user_id);

-- Create policy to allow admins to view all submissions
create policy "Admins can view all submissions"
    on public.submissions
    for select
    to authenticated
    using (auth.uid() in (select auth.uid() from public.users where is_admin = true));

-- Create index for faster queries
create index if not exists problems_topic_idx on public.problems(topic);
create index if not exists problems_difficulty_idx on public.problems(difficulty);
create index if not exists submissions_user_id_idx on public.submissions(user_id);
create index if not exists submissions_problem_id_idx on public.submissions(problem_id);