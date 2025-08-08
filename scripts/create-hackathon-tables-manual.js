import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createHackathonTables() {
  try {
    console.log('🔧 Creating hackathon tables...\n');

    // SQL commands to create the tables
    const sqlCommands = [
      // Create hackathon_registrations table
      `
      CREATE TABLE IF NOT EXISTS public.hackathon_registrations (
          id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
          hackathon_id bigint REFERENCES public.hackathons(id) ON DELETE CASCADE,
          team_name text NOT NULL,
          members text,
          registrant_name text,
          registrant_email text,
          created_at timestamp with time zone DEFAULT now(),
          UNIQUE(user_id, hackathon_id)
      );
      `,
      
      // Create hackathon_challenges table
      `
      CREATE TABLE IF NOT EXISTS public.hackathon_challenges (
          id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          hackathon_id bigint REFERENCES public.hackathons(id) ON DELETE CASCADE,
          title text NOT NULL,
          description text NOT NULL,
          type text NOT NULL CHECK (type IN ('mcq', 'coding', 'mixed')),
          difficulty text DEFAULT 'medium',
          time_limit integer DEFAULT 30,
          max_score integer DEFAULT 100,
          created_at timestamp with time zone DEFAULT now()
      );
      `,
      
      // Create hackathon_mcqs table
      `
      CREATE TABLE IF NOT EXISTS public.hackathon_mcqs (
          id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          challenge_id bigint REFERENCES public.hackathon_challenges(id) ON DELETE CASCADE,
          question text NOT NULL,
          options jsonb NOT NULL,
          correct_answer text NOT NULL,
          points integer DEFAULT 10,
          created_at timestamp with time zone DEFAULT now()
      );
      `,
      
      // Create hackathon_problems table
      `
      CREATE TABLE IF NOT EXISTS public.hackathon_problems (
          id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          challenge_id bigint REFERENCES public.hackathon_challenges(id) ON DELETE CASCADE,
          title text NOT NULL,
          description text NOT NULL,
          difficulty text DEFAULT 'medium',
          test_cases jsonb,
          templates jsonb,
          points integer DEFAULT 100,
          created_at timestamp with time zone DEFAULT now()
      );
      `,
      
      // Create hackathon_submissions table
      `
      CREATE TABLE IF NOT EXISTS public.hackathon_submissions (
          id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
          hackathon_id bigint REFERENCES public.hackathons(id) ON DELETE CASCADE,
          challenge_id bigint REFERENCES public.hackathon_challenges(id) ON DELETE CASCADE,
          type text NOT NULL CHECK (type IN ('mcq', 'coding')),
          answers jsonb,
          code text,
          language text,
          output text,
          score integer DEFAULT 0,
          time_taken integer,
          submitted_at timestamp with time zone DEFAULT now()
      );
      `,
      
      // Create hackathon_scores table
      `
      CREATE TABLE IF NOT EXISTS public.hackathon_scores (
          id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
          hackathon_id bigint REFERENCES public.hackathons(id) ON DELETE CASCADE,
          total_score integer DEFAULT 0,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          UNIQUE(user_id, hackathon_id)
      );
      `
    ];

    // Execute each SQL command
    for (let i = 0; i < sqlCommands.length; i++) {
      const sql = sqlCommands[i];
      console.log(`Creating table ${i + 1}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`❌ Error creating table ${i + 1}:`, error);
      } else {
        console.log(`✅ Table ${i + 1} created successfully`);
      }
    }

    // Enable RLS on all tables
    console.log('\n🔒 Enabling Row Level Security...');
    const rlsCommands = [
      'ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.hackathon_challenges ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.hackathon_mcqs ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.hackathon_problems ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.hackathon_submissions ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE public.hackathon_scores ENABLE ROW LEVEL SECURITY;'
    ];

    for (const rlsCommand of rlsCommands) {
      const { error } = await supabase.rpc('exec_sql', { sql: rlsCommand });
      if (error) {
        console.error('❌ Error enabling RLS:', error);
      }
    }

    // Create basic RLS policies
    console.log('\n📋 Creating RLS policies...');
    const policyCommands = [
      // Policies for hackathon_registrations
      `CREATE POLICY IF NOT EXISTS "Users can insert their own registrations"
        ON public.hackathon_registrations
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY IF NOT EXISTS "Users can view their own registrations"
        ON public.hackathon_registrations
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);`,
      
      // Policies for hackathon_challenges
      `CREATE POLICY IF NOT EXISTS "Anyone can view hackathon challenges"
        ON public.hackathon_challenges
        FOR SELECT
        TO authenticated
        USING (true);`,
      
      // Policies for hackathon_submissions
      `CREATE POLICY IF NOT EXISTS "Users can insert their own submissions"
        ON public.hackathon_submissions
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY IF NOT EXISTS "Users can view their own submissions"
        ON public.hackathon_submissions
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);`,
      
      // Policies for hackathon_scores
      `CREATE POLICY IF NOT EXISTS "Users can insert their own scores"
        ON public.hackathon_scores
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY IF NOT EXISTS "Users can view their own scores"
        ON public.hackathon_scores
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);`
    ];

    for (const policyCommand of policyCommands) {
      const { error } = await supabase.rpc('exec_sql', { sql: policyCommand });
      if (error) {
        console.error('❌ Error creating policy:', error);
      }
    }

    console.log('\n✅ Hackathon tables creation completed!');

  } catch (error) {
    console.error('❌ Error in createHackathonTables:', error);
  }
}

// Run the function
createHackathonTables();
