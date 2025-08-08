// Script to run Supabase migrations and seed the database

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Function to run a command and return a promise
function runCommand(command, cwd = projectRoot) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        console.error(`stderr: ${stderr}`);
        reject(error);
        return;
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

// Main function to setup the database
async function setupDatabase() {
  try {
    // Check if Supabase CLI is installed
    try {
      await runCommand('supabase --version');
    } catch (error) {
      console.log('Supabase CLI not found. Installing...');
      await runCommand('npm install -g supabase');
    }

    // Start Supabase local development
    console.log('Starting Supabase local development...');
    await runCommand('supabase start');

    // Run migrations
    console.log('Running migrations...');
    await runCommand('supabase db reset');

    // Run seed script
    console.log('Seeding database...');
    await runCommand('node scripts/seed-problems.js');

    console.log('Database setup complete!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Run the setup function
setupDatabase();