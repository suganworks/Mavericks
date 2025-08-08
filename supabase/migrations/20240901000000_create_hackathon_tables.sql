-- Create hackathons table
create table if not exists public.hackathons (
    id bigint primary key generated always as identity,
    title text not null,
    description text not null,
    location text not null,
    start_at timestamp with time zone not null,
    end_at timestamp with time zone not null,
    status text default 'upcoming' check (status in ('upcoming', 'ongoing', 'past')),
    max_participants integer,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create hackathon_registrations table
create table if not exists public.hackathon_registrations (
    id bigint primary key generated always as identity,
    user_id uuid references auth.users(id) on delete cascade,
    hackathon_id bigint references public.hackathons(id) on delete cascade,
    team_name text not null,
    members text,
    registrant_name text,
    registrant_email text,
    created_at timestamp with time zone default now(),
    unique(user_id, hackathon_id)
);

-- Create hackathon_challenges table
create table if not exists public.hackathon_challenges (
    id bigint primary key generated always as identity,
    hackathon_id bigint references public.hackathons(id) on delete cascade,
    title text not null,
    description text not null,
    type text not null check (type in ('mcq', 'coding', 'mixed')),
    difficulty text default 'medium',
    time_limit integer default 30, -- minutes
    max_score integer default 100,
    created_at timestamp with time zone default now()
);

-- Create hackathon_mcqs table
create table if not exists public.hackathon_mcqs (
    id bigint primary key generated always as identity,
    challenge_id bigint references public.hackathon_challenges(id) on delete cascade,
    question text not null,
    options jsonb not null, -- array of options
    correct_answer text not null,
    points integer default 10,
    created_at timestamp with time zone default now()
);

-- Create hackathon_problems table
create table if not exists public.hackathon_problems (
    id bigint primary key generated always as identity,
    challenge_id bigint references public.hackathon_challenges(id) on delete cascade,
    title text not null,
    description text not null,
    difficulty text default 'medium',
    test_cases jsonb,
    templates jsonb, -- language-specific code templates
    points integer default 100,
    created_at timestamp with time zone default now()
);

-- Create hackathon_submissions table
create table if not exists public.hackathon_submissions (
    id bigint primary key generated always as identity,
    user_id uuid references auth.users(id) on delete cascade,
    hackathon_id bigint references public.hackathons(id) on delete cascade,
    challenge_id bigint references public.hackathon_challenges(id) on delete cascade,
    type text not null check (type in ('mcq', 'coding')),
    answers jsonb, -- for MCQ submissions
    code text, -- for coding submissions
    language text, -- for coding submissions
    output text, -- for coding submissions
    score integer default 0,
    time_taken integer, -- seconds
    submitted_at timestamp with time zone default now()
);

-- Create hackathon_scores table
create table if not exists public.hackathon_scores (
    id bigint primary key generated always as identity,
    user_id uuid references auth.users(id) on delete cascade,
    hackathon_id bigint references public.hackathons(id) on delete cascade,
    total_score integer default 0,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    unique(user_id, hackathon_id)
);

-- Enable RLS on all tables
alter table public.hackathons enable row level security;
alter table public.hackathon_registrations enable row level security;
alter table public.hackathon_challenges enable row level security;
alter table public.hackathon_mcqs enable row level security;
alter table public.hackathon_problems enable row level security;
alter table public.hackathon_submissions enable row level security;
alter table public.hackathon_scores enable row level security;

-- RLS Policies for hackathons
create policy "Anyone can view hackathons"
    on public.hackathons
    for select
    to authenticated
    using (true);

create policy "Only admins can modify hackathons"
    on public.hackathons
    for all
    to authenticated
    using (auth.uid() in (select auth.uid() from public.users where is_admin = true));

-- RLS Policies for hackathon_registrations
create policy "Users can view their own registrations"
    on public.hackathon_registrations
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own registrations"
    on public.hackathon_registrations
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Admins can view all registrations"
    on public.hackathon_registrations
    for select
    to authenticated
    using (auth.uid() in (select auth.uid() from public.users where is_admin = true));

-- RLS Policies for hackathon_challenges
create policy "Anyone can view hackathon challenges"
    on public.hackathon_challenges
    for select
    to authenticated
    using (true);

create policy "Only admins can modify hackathon challenges"
    on public.hackathon_challenges
    for all
    to authenticated
    using (auth.uid() in (select auth.uid() from public.users where is_admin = true));

-- RLS Policies for hackathon_mcqs
create policy "Anyone can view hackathon MCQs"
    on public.hackathon_mcqs
    for select
    to authenticated
    using (true);

create policy "Only admins can modify hackathon MCQs"
    on public.hackathon_mcqs
    for all
    to authenticated
    using (auth.uid() in (select auth.uid() from public.users where is_admin = true));

-- RLS Policies for hackathon_problems
create policy "Anyone can view hackathon problems"
    on public.hackathon_problems
    for select
    to authenticated
    using (true);

create policy "Only admins can modify hackathon problems"
    on public.hackathon_problems
    for all
    to authenticated
    using (auth.uid() in (select auth.uid() from public.users where is_admin = true));

-- RLS Policies for hackathon_submissions
create policy "Users can view their own submissions"
    on public.hackathon_submissions
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own submissions"
    on public.hackathon_submissions
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Admins can view all submissions"
    on public.hackathon_submissions
    for select
    to authenticated
    using (auth.uid() in (select auth.uid() from public.users where is_admin = true));

-- RLS Policies for hackathon_scores
create policy "Users can view their own scores"
    on public.hackathon_scores
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own scores"
    on public.hackathon_scores
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own scores"
    on public.hackathon_scores
    for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Admins can view all scores"
    on public.hackathon_scores
    for select
    to authenticated
    using (auth.uid() in (select auth.uid() from public.users where is_admin = true));

-- Create indexes for better performance
create index if not exists hackathon_registrations_user_id_idx on public.hackathon_registrations(user_id);
create index if not exists hackathon_registrations_hackathon_id_idx on public.hackathon_registrations(hackathon_id);
create index if not exists hackathon_challenges_hackathon_id_idx on public.hackathon_challenges(hackathon_id);
create index if not exists hackathon_mcqs_challenge_id_idx on public.hackathon_mcqs(challenge_id);
create index if not exists hackathon_problems_challenge_id_idx on public.hackathon_problems(challenge_id);
create index if not exists hackathon_submissions_user_id_idx on public.hackathon_submissions(user_id);
create index if not exists hackathon_submissions_hackathon_id_idx on public.hackathon_submissions(hackathon_id);
create index if not exists hackathon_scores_user_id_idx on public.hackathon_scores(user_id);
create index if not exists hackathon_scores_hackathon_id_idx on public.hackathon_scores(hackathon_id);

-- Insert sample hackathon data
insert into public.hackathons (title, description, location, start_at, end_at, status) values
('Mavericks Spring Hackathon', 'Join us for an exciting spring hackathon focused on AI and web development!', 'Online', 
 now() - interval '1 day', now() + interval '3 days', 'ongoing'),
('Edge AI Mini-Hack', 'A quick 24-hour hackathon focused on edge AI applications', 'Online',
 now() + interval '7 days', now() + interval '8 days', 'upcoming'),
('Web3 Innovation Challenge', 'Build the future of decentralized applications', 'Online',
 now() - interval '30 days', now() - interval '25 days', 'past');

-- Insert sample challenges for the ongoing hackathon
insert into public.hackathon_challenges (hackathon_id, title, description, type, difficulty, time_limit, max_score) values
(1, 'AI/ML Fundamentals', 'Test your knowledge of AI and machine learning concepts', 'mcq', 'easy', 10, 100),
(1, 'Web Development Challenge', 'Build a responsive web application using modern technologies', 'coding', 'medium', 30, 200),
(1, 'Full-Stack Integration', 'Create a complete application with frontend and backend integration', 'coding', 'hard', 45, 300);

-- Insert sample MCQs for the first challenge
insert into public.hackathon_mcqs (challenge_id, question, options, correct_answer, points) values
(1, 'What is the primary goal of machine learning?', 
 '["To create artificial intelligence", "To enable computers to learn from data", "To replace human workers", "To make computers faster"]', 
 'To enable computers to learn from data', 10),
(1, 'Which of the following is NOT a type of machine learning?',
 '["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Static Learning"]',
 'Static Learning', 10),
(1, 'What is overfitting in machine learning?',
 '["When a model performs well on training data but poorly on new data", "When a model is too simple", "When a model has too few parameters", "When a model is too fast"]',
 'When a model performs well on training data but poorly on new data', 10);

-- Insert sample coding problems
insert into public.hackathon_problems (challenge_id, title, description, difficulty, test_cases, templates, points) values
(2, 'Responsive Navigation Bar', 
 'Create a responsive navigation bar that adapts to different screen sizes. The navigation should include a logo, menu items, and a mobile hamburger menu.',
 'medium',
 '[{"input": "screen width: 768px", "output": "hamburger menu visible"}, {"input": "screen width: 1024px", "output": "full menu visible"}]',
 '{"html": "<nav class=\"navbar\">\n  <!-- Your code here -->\n</nav>", "css": "/* Your styles here */", "javascript": "// Your JavaScript here"}',
 200),
(3, 'API Integration Challenge',
 'Build a REST API with CRUD operations for a todo list. Include proper error handling, validation, and documentation.',
 'hard',
 '[{"input": "POST /todos", "output": "201 Created"}, {"input": "GET /todos", "output": "200 OK with todos array"}]',
 '{"javascript": "// Express.js server setup\nconst express = require(\"express\");\nconst app = express();\n\n// Your code here"}',
 300);
