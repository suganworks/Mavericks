import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createHackathonTables() {
  try {
    console.log('Creating hackathon tables...');
    
    // Create hackathons table
    console.log('Creating hackathons table...');
    const { error: hackathonsError } = await supabase
      .from('hackathons')
      .select('*')
      .limit(1);
    
    if (hackathonsError && hackathonsError.code === 'PGRST116') {
      console.log('hackathons table does not exist, creating...');
      // We'll need to create this manually in Supabase dashboard
      console.log('Please create the hackathons table manually in Supabase dashboard');
    } else {
      console.log('✓ hackathons table exists');
    }

    // Test hackathon_registrations table
    console.log('Testing hackathon_registrations table...');
    const { error: registrationsError } = await supabase
      .from('hackathon_registrations')
      .select('*')
      .limit(1);
    
    if (registrationsError && registrationsError.code === 'PGRST116') {
      console.log('hackathon_registrations table does not exist');
      console.log('Please create the hackathon_registrations table manually in Supabase dashboard');
    } else {
      console.log('✓ hackathon_registrations table exists');
    }

    // Test hackathon_challenges table
    console.log('Testing hackathon_challenges table...');
    const { error: challengesError } = await supabase
      .from('hackathon_challenges')
      .select('*')
      .limit(1);
    
    if (challengesError && challengesError.code === 'PGRST116') {
      console.log('hackathon_challenges table does not exist');
      console.log('Please create the hackathon_challenges table manually in Supabase dashboard');
    } else {
      console.log('✓ hackathon_challenges table exists');
    }

    // Test hackathon_mcqs table
    console.log('Testing hackathon_mcqs table...');
    const { error: mcqsError } = await supabase
      .from('hackathon_mcqs')
      .select('*')
      .limit(1);
    
    if (mcqsError && mcqsError.code === 'PGRST116') {
      console.log('hackathon_mcqs table does not exist');
      console.log('Please create the hackathon_mcqs table manually in Supabase dashboard');
    } else {
      console.log('✓ hackathon_mcqs table exists');
    }

    // Test hackathon_problems table
    console.log('Testing hackathon_problems table...');
    const { error: problemsError } = await supabase
      .from('hackathon_problems')
      .select('*')
      .limit(1);
    
    if (problemsError && problemsError.code === 'PGRST116') {
      console.log('hackathon_problems table does not exist');
      console.log('Please create the hackathon_problems table manually in Supabase dashboard');
    } else {
      console.log('✓ hackathon_problems table exists');
    }

    // Test hackathon_submissions table
    console.log('Testing hackathon_submissions table...');
    const { error: submissionsError } = await supabase
      .from('hackathon_submissions')
      .select('*')
      .limit(1);
    
    if (submissionsError && submissionsError.code === 'PGRST116') {
      console.log('hackathon_submissions table does not exist');
      console.log('Please create the hackathon_submissions table manually in Supabase dashboard');
    } else {
      console.log('✓ hackathon_submissions table exists');
    }

    // Test hackathon_scores table
    console.log('Testing hackathon_scores table...');
    const { error: scoresError } = await supabase
      .from('hackathon_scores')
      .select('*')
      .limit(1);
    
    if (scoresError && scoresError.code === 'PGRST116') {
      console.log('hackathon_scores table does not exist');
      console.log('Please create the hackathon_scores table manually in Supabase dashboard');
    } else {
      console.log('✓ hackathon_scores table exists');
    }

    console.log('\n📋 MANUAL SETUP REQUIRED:');
    console.log('Since the tables don\'t exist, you need to create them manually in Supabase:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of supabase/migrations/20240901000000_create_hackathon_tables.sql');
    console.log('4. Run the SQL script');
    console.log('5. Come back and run this script again to verify the tables were created');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the setup
createHackathonTables();
