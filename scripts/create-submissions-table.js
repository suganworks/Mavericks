// Script to create the submissions table in Supabase

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to create submissions table
async function createSubmissionsTable() {
  try {
    console.log('Creating submissions table...');
    
    // Create the submissions table using SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.submissions (
          id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          problem_id BIGINT REFERENCES public.problems(id) ON DELETE CASCADE,
          code TEXT NOT NULL,
          language TEXT NOT NULL,
          output TEXT,
          topic TEXT,
          passed_all_tests BOOLEAN DEFAULT FALSE,
          score INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY IF NOT EXISTS "Users can insert their own submissions"
          ON public.submissions
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Users can view their own submissions"
          ON public.submissions
          FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);
        
        CREATE POLICY IF NOT EXISTS "Admins can view all submissions"
          ON public.submissions
          FOR SELECT
          TO authenticated
          USING (auth.uid() IN (SELECT auth.uid() FROM public.users WHERE is_admin = true));
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS submissions_user_id_idx ON public.submissions(user_id);
        CREATE INDEX IF NOT EXISTS submissions_problem_id_idx ON public.submissions(problem_id);
      `
    });
    
    if (error) {
      console.error('Error creating submissions table:', error);
    } else {
      console.log('Submissions table created successfully!');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
createSubmissionsTable();
