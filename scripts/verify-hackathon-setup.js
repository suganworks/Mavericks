import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyHackathonSetup() {
  try {
    console.log('🔍 Verifying hackathon database setup...\n');

    // Check hackathons table
    console.log('1. Checking hackathons table...');
    const { data: hackathons, error: hackathonsError } = await supabase
      .from('hackathons')
      .select('*')
      .limit(5);

    if (hackathonsError) {
      console.error('❌ Error accessing hackathons table:', hackathonsError);
    } else {
      console.log(`✅ hackathons table accessible. Found ${hackathons.length} hackathons:`);
      hackathons.forEach(h => {
        console.log(`   - ${h.title} (ID: ${h.id}, Status: ${h.status})`);
      });
    }

    // Check hackathon_registrations table
    console.log('\n2. Checking hackathon_registrations table...');
    const { data: registrations, error: registrationsError } = await supabase
      .from('hackathon_registrations')
      .select('*')
      .limit(5);

    if (registrationsError) {
      console.error('❌ Error accessing hackathon_registrations table:', registrationsError);
    } else {
      console.log(`✅ hackathon_registrations table accessible. Found ${registrations.length} registrations`);
    }

    // Check hackathon_challenges table
    console.log('\n3. Checking hackathon_challenges table...');
    const { data: challenges, error: challengesError } = await supabase
      .from('hackathon_challenges')
      .select('*')
      .limit(5);

    if (challengesError) {
      console.error('❌ Error accessing hackathon_challenges table:', challengesError);
    } else {
      console.log(`✅ hackathon_challenges table accessible. Found ${challenges.length} challenges`);
    }

    // Test inserting a sample registration (will fail due to RLS, but we can see the error)
    console.log('\n4. Testing registration insert (should fail due to RLS)...');
    const { error: testInsertError } = await supabase
      .from('hackathon_registrations')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // dummy UUID
        hackathon_id: 1,
        team_name: 'Test Team',
        members: 'Test Member',
        registrant_name: 'Test User',
        registrant_email: 'test@example.com'
      });

    if (testInsertError) {
      console.log('✅ RLS is working (expected error):', testInsertError.message);
    } else {
      console.log('⚠️  RLS might not be properly configured');
    }

    // Check if there are any ongoing hackathons
    console.log('\n5. Checking for ongoing hackathons...');
    const { data: ongoingHackathons, error: ongoingError } = await supabase
      .from('hackathons')
      .select('*')
      .eq('status', 'ongoing');

    if (ongoingError) {
      console.error('❌ Error checking ongoing hackathons:', ongoingError);
    } else {
      console.log(`✅ Found ${ongoingHackathons.length} ongoing hackathons:`);
      ongoingHackathons.forEach(h => {
        console.log(`   - ${h.title} (ID: ${h.id})`);
      });
    }

    console.log('\n✅ Hackathon setup verification completed!');

  } catch (error) {
    console.error('❌ Error in verifyHackathonSetup:', error);
  }
}

// Run the function
verifyHackathonSetup();
