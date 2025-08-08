import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupHackathonDatabase() {
  try {
    console.log('🔧 Setting up hackathon database...\n');

    // First, let's check if the hackathons table exists and has data
    console.log('1. Checking existing hackathons...');
    const { data: existingHackathons, error: hackathonsError } = await supabase
      .from('hackathons')
      .select('*');

    if (hackathonsError) {
      console.error('❌ Error accessing hackathons table:', hackathonsError);
      return;
    }

    console.log(`✅ Found ${existingHackathons.length} existing hackathons`);

    // Get the ongoing hackathon ID for creating challenges
    const ongoingHackathon = existingHackathons.find(h => h.status === 'ongoing');
    if (!ongoingHackathon) {
      console.log('❌ No ongoing hackathon found. Please create one first.');
      return;
    }

    console.log(`✅ Using ongoing hackathon: ${ongoingHackathon.title} (ID: ${ongoingHackathon.id})`);

    // Create hackathon_registrations table if it doesn't exist
    console.log('\n2. Setting up hackathon_registrations table...');
    try {
      const { error: regError } = await supabase
        .from('hackathon_registrations')
        .select('*')
        .limit(1);
      
      if (regError && regError.code === '42P01') {
        console.log('⚠️  hackathon_registrations table does not exist');
        console.log('Please create the table manually in Supabase dashboard with the following SQL:');
        console.log(`
          CREATE TABLE public.hackathon_registrations (
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
          
          ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can insert their own registrations"
            ON public.hackathon_registrations
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can view their own registrations"
            ON public.hackathon_registrations
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
        `);
      } else {
        console.log('✅ hackathon_registrations table exists');
      }
    } catch (err) {
      console.log('⚠️  Could not verify hackathon_registrations table');
    }

    // Create hackathon_challenges table if it doesn't exist
    console.log('\n3. Setting up hackathon_challenges table...');
    try {
      const { error: challengesError } = await supabase
        .from('hackathon_challenges')
        .select('*')
        .limit(1);
      
      if (challengesError && challengesError.code === '42P01') {
        console.log('⚠️  hackathon_challenges table does not exist');
        console.log('Please create the table manually in Supabase dashboard with the following SQL:');
        console.log(`
          CREATE TABLE public.hackathon_challenges (
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
          
          ALTER TABLE public.hackathon_challenges ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Anyone can view hackathon challenges"
            ON public.hackathon_challenges
            FOR SELECT
            TO authenticated
            USING (true);
        `);
      } else {
        console.log('✅ hackathon_challenges table exists');
      }
    } catch (err) {
      console.log('⚠️  Could not verify hackathon_challenges table');
    }

    // Create hackathon_mcqs table if it doesn't exist
    console.log('\n4. Setting up hackathon_mcqs table...');
    try {
      const { error: mcqsError } = await supabase
        .from('hackathon_mcqs')
        .select('*')
        .limit(1);
      
      if (mcqsError && mcqsError.code === '42P01') {
        console.log('⚠️  hackathon_mcqs table does not exist');
        console.log('Please create the table manually in Supabase dashboard with the following SQL:');
        console.log(`
          CREATE TABLE public.hackathon_mcqs (
              id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
              challenge_id bigint REFERENCES public.hackathon_challenges(id) ON DELETE CASCADE,
              question text NOT NULL,
              options jsonb NOT NULL,
              correct_answer text NOT NULL,
              points integer DEFAULT 10,
              created_at timestamp with time zone DEFAULT now()
          );
          
          ALTER TABLE public.hackathon_mcqs ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Anyone can view hackathon MCQs"
            ON public.hackathon_mcqs
            FOR SELECT
            TO authenticated
            USING (true);
        `);
      } else {
        console.log('✅ hackathon_mcqs table exists');
      }
    } catch (err) {
      console.log('⚠️  Could not verify hackathon_mcqs table');
    }

    // Create hackathon_problems table if it doesn't exist
    console.log('\n5. Setting up hackathon_problems table...');
    try {
      const { error: problemsError } = await supabase
        .from('hackathon_problems')
        .select('*')
        .limit(1);
      
      if (problemsError && problemsError.code === '42P01') {
        console.log('⚠️  hackathon_problems table does not exist');
        console.log('Please create the table manually in Supabase dashboard with the following SQL:');
        console.log(`
          CREATE TABLE public.hackathon_problems (
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
          
          ALTER TABLE public.hackathon_problems ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Anyone can view hackathon problems"
            ON public.hackathon_problems
            FOR SELECT
            TO authenticated
            USING (true);
        `);
      } else {
        console.log('✅ hackathon_problems table exists');
      }
    } catch (err) {
      console.log('⚠️  Could not verify hackathon_problems table');
    }

    // Create hackathon_submissions table if it doesn't exist
    console.log('\n6. Setting up hackathon_submissions table...');
    try {
      const { error: submissionsError } = await supabase
        .from('hackathon_submissions')
        .select('*')
        .limit(1);
      
      if (submissionsError && submissionsError.code === '42P01') {
        console.log('⚠️  hackathon_submissions table does not exist');
        console.log('Please create the table manually in Supabase dashboard with the following SQL:');
        console.log(`
          CREATE TABLE public.hackathon_submissions (
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
          
          ALTER TABLE public.hackathon_submissions ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can insert their own submissions"
            ON public.hackathon_submissions
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can view their own submissions"
            ON public.hackathon_submissions
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
        `);
      } else {
        console.log('✅ hackathon_submissions table exists');
      }
    } catch (err) {
      console.log('⚠️  Could not verify hackathon_submissions table');
    }

    // Create hackathon_scores table if it doesn't exist
    console.log('\n7. Setting up hackathon_scores table...');
    try {
      const { error: scoresError } = await supabase
        .from('hackathon_scores')
        .select('*')
        .limit(1);
      
      if (scoresError && scoresError.code === '42P01') {
        console.log('⚠️  hackathon_scores table does not exist');
        console.log('Please create the table manually in Supabase dashboard with the following SQL:');
        console.log(`
          CREATE TABLE public.hackathon_scores (
              id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
              user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
              hackathon_id bigint REFERENCES public.hackathons(id) ON DELETE CASCADE,
              total_score integer DEFAULT 0,
              created_at timestamp with time zone DEFAULT now(),
              updated_at timestamp with time zone DEFAULT now(),
              UNIQUE(user_id, hackathon_id)
          );
          
          ALTER TABLE public.hackathon_scores ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can insert their own scores"
            ON public.hackathon_scores
            FOR INSERT
            TO authenticated
            WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can view their own scores"
            ON public.hackathon_scores
            FOR SELECT
            TO authenticated
            USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own scores"
            ON public.hackathon_scores
            FOR UPDATE
            TO authenticated
            USING (auth.uid() = user_id);
        `);
      } else {
        console.log('✅ hackathon_scores table exists');
      }
    } catch (err) {
      console.log('⚠️  Could not verify hackathon_scores table');
    }

    console.log('\n✅ Hackathon database setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Create the missing tables in Supabase dashboard using the SQL provided above');
    console.log('2. Run the sample data insertion script');
    console.log('3. Test the hackathon registration and submission system');

  } catch (error) {
    console.error('❌ Error in setupHackathonDatabase:', error);
  }
}

// Run the function
setupHackathonDatabase();
