import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateHackathonRegistrations() {
  try {
    console.log('🔄 Updating hackathon registrations for individual participation...\n');

    // First, let's check the current structure
    console.log('1. Checking current registrations...');
    const { data: currentRegistrations, error: fetchError } = await supabase
      .from('hackathon_registrations')
      .select('*');

    if (fetchError) {
      console.error('❌ Error fetching registrations:', fetchError);
      return;
    }

    console.log(`✅ Found ${currentRegistrations.length} existing registrations`);

    // Update each registration to remove team fields and ensure individual participation
    for (const registration of currentRegistrations) {
      console.log(`Updating registration for user: ${registration.user_id}`);
      
      // Update the registration to remove team fields
      const { error: updateError } = await supabase
        .from('hackathon_registrations')
        .update({
          // Remove team_name and members fields by setting them to null
          team_name: null,
          members: null
        })
        .eq('id', registration.id);

      if (updateError) {
        console.error(`❌ Error updating registration ${registration.id}:`, updateError);
      } else {
        console.log(`✅ Updated registration ${registration.id}`);
      }
    }

    // Verify the updates
    console.log('\n2. Verifying updated registrations...');
    const { data: updatedRegistrations, error: verifyError } = await supabase
      .from('hackathon_registrations')
      .select('*');

    if (verifyError) {
      console.error('❌ Error verifying registrations:', verifyError);
    } else {
      console.log(`✅ Verified ${updatedRegistrations.length} registrations:`);
      updatedRegistrations.forEach(reg => {
        console.log(`   - User: ${reg.user_id}, Name: ${reg.registrant_name}, Email: ${reg.registrant_email}`);
      });
    }

    console.log('\n✅ Hackathon registrations updated for individual participation!');

  } catch (error) {
    console.error('❌ Error in updateHackathonRegistrations:', error);
  }
}

// Run the function
updateHackathonRegistrations();
