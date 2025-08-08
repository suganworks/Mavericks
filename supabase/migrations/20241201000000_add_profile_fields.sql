-- Add profile fields to users table
alter table public.users add column if not exists bio text;
alter table public.users add column if not exists profile_photo_url text;

-- Create storage bucket for profile photos if it doesn't exist
-- Note: This would typically be done through the Supabase dashboard
-- or using the Supabase CLI, but we'll include it here for reference
-- insert into storage.buckets (id, name, public) values ('profile-photos', 'profile-photos', true);

-- Add RLS policies for profile photos storage
-- create policy "Users can upload their own profile photos"
--     on storage.objects for insert
--     with check (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- create policy "Users can view profile photos"
--     on storage.objects for select
--     using (bucket_id = 'profile-photos');

-- create policy "Users can update their own profile photos"
--     on storage.objects for update
--     with check (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- create policy "Users can delete their own profile photos"
--     on storage.objects for delete
--     using (bucket_id = 'profile-photos' and auth.uid()::text = (storage.foldername(name))[1]);
