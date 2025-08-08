import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupHackathonDatabase() {
  try {
    console.log('Setting up hackathon database...');
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20240901000000_create_hackathon_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.error(`Error executing statement ${i + 1}:`, error);
            console.log('Statement:', statement);
          } else {
            console.log(`✓ Executed statement ${i + 1}`);
          }
        } catch (err) {
          console.error(`Error executing statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('✅ Hackathon database setup completed!');
    
    // Verify the tables were created
    console.log('\nVerifying tables...');
    const tables = [
      'hackathons',
      'hackathon_registrations', 
      'hackathon_challenges',
      'hackathon_mcqs',
      'hackathon_problems',
      'hackathon_submissions',
      'hackathon_scores'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Table ${table} not accessible:`, error.message);
        } else {
          console.log(`✓ Table ${table} is accessible`);
        }
      } catch (err) {
        console.error(`❌ Error checking table ${table}:`, err.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupHackathonDatabase();
