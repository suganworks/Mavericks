import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAnalyticsTable() {
  try {
    console.log('Checking if analytics table exists...');
    
    // Try to query the analytics table to see if it exists
    const { data, error } = await supabase
      .from('analytics')
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('❌ Analytics table does not exist');
      console.log('Please create the analytics table manually in Supabase dashboard using the SQL from supabase/migrations/20241301000000_create_analytics_table.sql');
      return;
    }

    if (error) {
      console.error('Error checking analytics table:', error);
      return;
    }

    console.log('✅ Analytics table exists');

    // Check if there's already data
    const { data: existingData, error: countError } = await supabase
      .from('analytics')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking existing data:', countError);
      return;
    }

    if (existingData && existingData.length > 0) {
      console.log('✅ Analytics table already has data');
      return;
    }

    // Insert sample data
    console.log('Inserting sample analytics data...');
    
    const sampleData = [
      // Skill growth data
      { type: 'skill_growth', date: '2024-01-01', data: { month: 'January', users: 15 } },
      { type: 'skill_growth', date: '2024-02-01', data: { month: 'February', users: 23 } },
      { type: 'skill_growth', date: '2024-03-01', data: { month: 'March', users: 31 } },
      { type: 'skill_growth', date: '2024-04-01', data: { month: 'April', users: 28 } },
      { type: 'skill_growth', date: '2024-05-01', data: { month: 'May', users: 35 } },
      { type: 'skill_growth', date: '2024-06-01', data: { month: 'June', users: 42 } },

      // Platform engagement data
      { type: 'platform_engagement', date: '2024-01-01', data: { date: '2024-01-01', active_users: 12, assessments_taken: 8, learning_paths_started: 5 } },
      { type: 'platform_engagement', date: '2024-01-02', data: { date: '2024-01-02', active_users: 15, assessments_taken: 11, learning_paths_started: 7 } },
      { type: 'platform_engagement', date: '2024-01-03', data: { date: '2024-01-03', active_users: 18, assessments_taken: 14, learning_paths_started: 9 } },
      { type: 'platform_engagement', date: '2024-01-04', data: { date: '2024-01-04', active_users: 22, assessments_taken: 17, learning_paths_started: 12 } },
      { type: 'platform_engagement', date: '2024-01-05', data: { date: '2024-01-05', active_users: 25, assessments_taken: 20, learning_paths_started: 15 } },
      { type: 'platform_engagement', date: '2024-01-06', data: { date: '2024-01-06', active_users: 28, assessments_taken: 23, learning_paths_started: 18 } },
      { type: 'platform_engagement', date: '2024-01-07', data: { date: '2024-01-07', active_users: 30, assessments_taken: 26, learning_paths_started: 21 } },

      // Top skills data
      { type: 'top_skills', date: '2024-01-01', data: { skill: 'JavaScript', count: 25 } },
      { type: 'top_skills', date: '2024-01-01', data: { skill: 'Python', count: 22 } },
      { type: 'top_skills', date: '2024-01-01', data: { skill: 'React', count: 18 } },
      { type: 'top_skills', date: '2024-01-01', data: { skill: 'Node.js', count: 15 } },
      { type: 'top_skills', date: '2024-01-01', data: { skill: 'SQL', count: 12 } }
    ];

    const { error: insertError } = await supabase
      .from('analytics')
      .insert(sampleData);

    if (insertError) {
      console.error('Error inserting sample data:', insertError);
      return;
    }

    console.log('✅ Sample analytics data inserted successfully');
    console.log('🎉 Analytics table setup complete!');

  } catch (error) {
    console.error('Error setting up analytics table:', error);
  }
}

createAnalyticsTable();
