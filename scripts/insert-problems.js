// Script to directly insert problems into the Supabase database

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample problems data
const problemsData = [
  {
    id: "a1b2c3d4-e5f6-4a1b-2c3d-4e5f6a7b8c9d", // UUID format
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "Easy", // Note: capitalized first letter
    category: "Array", // Using category instead of topic
    test_cases: [
      { input: "[2, 7, 11, 15], 9", output: "[0, 1]" },
      { input: "[3, 2, 4], 6", output: "[1, 2]" },
      { input: "[3, 3], 6", output: "[0, 1]" }
    ],
    languages_allowed: ["javascript", "python", "java", "cpp"]
  },
  {
    id: "b2c3d4e5-f6a7-4b2c-3d4e-5f6a7b8c9d0e", // UUID format
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    difficulty: "Medium", // Note: capitalized first letter
    category: "Linked List", // Using category instead of topic
    test_cases: [
      { input: "[1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]" },
      { input: "[1, 2]", output: "[2, 1]" },
      { input: "[]", output: "[]" }
    ],
    languages_allowed: ["javascript", "python", "java", "cpp"]
  },
  {
    id: "c3d4e5f6-a7b8-4c3d-4e5f-6a7b8c9d0e1f", // UUID format
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
    difficulty: "Easy", // Note: capitalized first letter
    category: "Algorithm", // Using category instead of topic
    test_cases: [
      { input: "[-1, 0, 3, 5, 9, 12], 9", output: "4" },
      { input: "[-1, 0, 3, 5, 9, 12], 2", output: "-1" },
      { input: "[5], 5", output: "0" }
    ],
    languages_allowed: ["javascript", "python", "java", "cpp"]
  }
];

// Function to get existing problems to avoid duplicates
async function getExistingProblems() {
  try {
    // Check if there are any existing problems
    const { data: existingProblems, error: fetchError } = await supabase
      .from('problems')
      .select('id, title');
    
    if (fetchError) {
      console.error('Error fetching existing problems:', fetchError);
      return [];
    }
    
    if (existingProblems && existingProblems.length > 0) {
      console.log(`Found ${existingProblems.length} existing problems.`);
      return existingProblems;
    } else {
      console.log('No existing problems found');
      return [];
    }
  } catch (error) {
    console.error('Error in getExistingProblems:', error);
    return [];
  }
}

// Function to insert problems data
async function insertProblems() {
  try {
    // Get existing problems
    const existingProblems = await getExistingProblems();
    const existingTitles = existingProblems.map(p => p.title.toLowerCase());
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    // Insert each problem
    for (const problem of problemsData) {
      // Skip if problem with same title already exists
      if (existingTitles.includes(problem.title.toLowerCase())) {
        console.log(`Skipping problem "${problem.title}" as it already exists`);
        skippedCount++;
        continue;
      }
      
      const { error } = await supabase
        .from('problems')
        .insert([problem]);
      
      if (error) {
        console.error(`Error inserting problem "${problem.title}":`, error);
        console.log('Continuing to next problem...');
        continue;
      }
      
      console.log(`Successfully inserted problem: ${problem.title}`);
      insertedCount++;
    }
    
    console.log(`Insertion complete: ${insertedCount} problems inserted, ${skippedCount} problems skipped.`);
    return true;
  } catch (error) {
    console.error('Error in insertProblems:', error);
    return false;
  }
}

// Function to check if the problems table exists
async function checkTableExists() {
  try {
    const { data, error } = await supabase
      .from('problems')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') { // Table doesn't exist
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking if table exists:', error);
    return false;
  }
}

// Main function to run the script
async function main() {
  try {
    // Check if the problems table exists
    const tableExists = await checkTableExists();
    
    if (!tableExists) {
      console.error('Problems table does not exist. Please make sure the table is created in Supabase.');
      return;
    }
    
    // Insert problems data
    await insertProblems();
    
    console.log('Script completed successfully!');
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the script
main();