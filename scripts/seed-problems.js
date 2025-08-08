// Script to seed the problems table in Supabase

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample problems data
const problemsData = [
  {
    id: 1,
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "easy",
    topic: "1", // Data Structures topic ID
    templates: {
      javascript: "function twoSum(nums, target) {\n  // Your code here\n}\n\n// Example usage:\n// twoSum([2, 7, 11, 15], 9) should return [0, 1]\n",
      python: "def two_sum(nums, target):\n    # Your code here\n    pass\n\n# Example usage:\n# two_sum([2, 7, 11, 15], 9) should return [0, 1]\n",
      java: "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        return new int[]{0, 0};\n    }\n}\n",
      cpp: "#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        // Your code here\n        return {0, 0};\n    }\n};\n"
    },
    test_cases: [
      {
        input: "[2, 7, 11, 15], 9",
        expected: "[0, 1]"
      },
      {
        input: "[3, 2, 4], 6",
        expected: "[1, 2]"
      },
      {
        input: "[3, 3], 6",
        expected: "[0, 1]"
      }
    ],
    time_limit: 10 // 10 minutes
  },
  {
    id: 2,
    title: "Reverse Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    difficulty: "medium",
    topic: "1", // Data Structures topic ID
    templates: {
      javascript: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n\nfunction reverseList(head) {\n  // Your code here\n}\n",
      python: "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n\ndef reverse_list(head):\n    # Your code here\n    pass\n",
      java: "/**\n * Definition for singly-linked list.\n * public class ListNode {\n *     int val;\n *     ListNode next;\n *     ListNode() {}\n *     ListNode(int val) { this.val = val; }\n *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }\n * }\n */\n\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        // Your code here\n        return null;\n    }\n}\n",
      cpp: "/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n *     ListNode(int x, ListNode *next) : val(x), next(next) {}\n * };\n */\n\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Your code here\n        return nullptr;\n    }\n};\n"
    },
    test_cases: [
      {
        input: "[1, 2, 3, 4, 5]",
        expected: "[5, 4, 3, 2, 1]"
      },
      {
        input: "[1, 2]",
        expected: "[2, 1]"
      },
      {
        input: "[]",
        expected: "[]"
      }
    ],
    time_limit: 20 // 20 minutes
  },
  {
    id: 3,
    title: "Binary Search",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.",
    difficulty: "easy",
    topic: "2", // Algorithms topic ID
    templates: {
      javascript: "function search(nums, target) {\n  // Your code here\n}\n\n// Example usage:\n// search([-1, 0, 3, 5, 9, 12], 9) should return 4\n",
      python: "def search(nums, target):\n    # Your code here\n    pass\n\n# Example usage:\n# search([-1, 0, 3, 5, 9, 12], 9) should return 4\n",
      java: "class Solution {\n    public int search(int[] nums, int target) {\n        // Your code here\n        return -1;\n    }\n}\n",
      cpp: "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Your code here\n        return -1;\n    }\n};\n"
    },
    test_cases: [
      {
        input: "[-1, 0, 3, 5, 9, 12], 9",
        expected: "4"
      },
      {
        input: "[-1, 0, 3, 5, 9, 12], 2",
        expected: "-1"
      },
      {
        input: "[5], 5",
        expected: "0"
      }
    ],
    time_limit: 10 // 10 minutes
  }
];

// Function to seed the problems table
async function seedProblems() {
  try {
    // First, check if problems already exist to avoid duplicates
    const { data: existingProblems, error: checkError } = await supabase
      .from('problems')
      .select('id');
    
    if (checkError) {
      throw checkError;
    }
    
    if (existingProblems && existingProblems.length > 0) {
      console.log(`Found ${existingProblems.length} existing problems. Skipping seed.`);
      return;
    }
    
    // Insert problems data
    const { data, error } = await supabase
      .from('problems')
      .insert(problemsData);
    
    if (error) {
      throw error;
    }
    
    console.log('Successfully seeded problems table!');
  } catch (error) {
    console.error('Error seeding problems table:', error);
  }
}

// Run the seed function
seedProblems();