import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertHackathonData() {
  try {
    console.log('Inserting hackathon data...');
    
    // Sample hackathon data
    const hackathons = [
      {
        title: "Mavericks Spring Hackathon 2024",
        description: "Join us for an exciting 48-hour hackathon focused on AI, Web3, and sustainable technology solutions. Build innovative applications that can change the world!",
        location: "Online",
        start_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Started 1 day ago
        end_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Ends in 1 day
        status: "ongoing",
        max_participants: 500
      },
      {
        title: "Winter CodeFest 2023",
        description: "A weekend-long coding festival that brought together developers from around the world to build amazing projects. Featured workshops on machine learning and cloud computing.",
        location: "Hybrid - San Francisco & Online",
        start_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        end_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), // 28 days ago
        status: "past",
        max_participants: 300
      },
      {
        title: "Summer Innovation Challenge 2024",
        description: "Get ready for the biggest summer hackathon! Focus on building solutions for climate change, healthcare, and education. Prizes worth $50,000 up for grabs!",
        location: "Online",
        start_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Starts in 14 days
        end_at: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(), // Ends in 16 days
        status: "upcoming",
        max_participants: 1000
      }
    ];

    // Insert each hackathon
    for (const hackathon of hackathons) {
      console.log(`Inserting hackathon: ${hackathon.title}`);
      
      const { data, error } = await supabase
        .from('hackathons')
        .insert(hackathon)
        .select();

      if (error) {
        if (error.code === '23505') {
          console.log(`⚠️  Hackathon "${hackathon.title}" already exists, skipping...`);
        } else {
          console.error(`❌ Error inserting hackathon "${hackathon.title}":`, error);
        }
      } else {
        console.log(`✅ Successfully inserted hackathon: ${hackathon.title} (ID: ${data[0].id})`);
      }
    }

    // Verify the data was inserted
    console.log('\nVerifying hackathon data...');
    const { data: allHackathons, error: fetchError } = await supabase
      .from('hackathons')
      .select('*')
      .order('start_at', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching hackathons:', fetchError);
    } else {
      console.log(`✅ Found ${allHackathons.length} hackathons in the database:`);
      allHackathons.forEach(hackathon => {
        const status = hackathon.status;
        const statusEmoji = status === 'ongoing' ? '🟢' : status === 'upcoming' ? '🟡' : '🔴';
        console.log(`${statusEmoji} ${hackathon.title} (${status})`);
        console.log(`   📅 ${new Date(hackathon.start_at).toLocaleDateString()} - ${new Date(hackathon.end_at).toLocaleDateString()}`);
        console.log(`   📍 ${hackathon.location}`);
        console.log('');
      });
    }

    console.log('✅ Hackathon data insertion completed!');

  } catch (error) {
    console.error('❌ Error in insertHackathonData:', error);
  }
}

// Run the function
insertHackathonData();
