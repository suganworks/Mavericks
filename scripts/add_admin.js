// Script to add an admin user to the admin table
// Usage: node add_admin.js <user_email>

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://bgnicypyisdjqkplveas.supabase.co";
// Check for both SUPABASE_SERVICE_KEY and VITE_SUPABASE_SERVICE_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_SERVICE_KEY; // This should be a service key with admin privileges

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_KEY or VITE_SUPABASE_SERVICE_KEY environment variable is required');
  // In ES modules, we need to import process explicitly or use a different approach
  // For simplicity, we'll just throw an error instead of using process.exit
  throw new Error('SUPABASE_SERVICE_KEY or VITE_SUPABASE_SERVICE_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addAdmin(email) {
  try {
    // First, find the user by email
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);
      
    // Check if we got any users
    if (userError) {
      console.error('Error finding user:', userError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.error(`No user found with email: ${email}`);
      return;
    }
    
    if (users.length > 1) {
      console.error(`Multiple users found with email: ${email}. Please contact administrator.`);
      return;
    }
    
    const userId = users[0].id;

    // Check if user is already an admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingAdmin) {
      console.log(`User ${email} is already an admin.`);
      return;
    }

    // Add user to admin table
    const { error: insertError } = await supabase
      .from('admin')
      .insert([
        { id: userId, gmail: email, password: 'default-password' }
      ]);

    if (insertError) {
      console.error('Error adding admin:', insertError.message);
      return;
    }

    console.log(`Successfully added ${email} as an admin.`);
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Get email from command line arguments
// In ES modules, we need to access command line arguments differently
import { fileURLToPath } from 'url';
import { argv } from 'process';

const email = argv[2];

if (!email) {
  console.error('Error: Email is required. Usage: node add_admin.js <user_email>');
  throw new Error('Email is required');
}

addAdmin(email);