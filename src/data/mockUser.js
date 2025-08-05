// This file simulates the data we will eventually get from our Supabase 'users' table.
export const mockUsers = [
  {
    id: '1a2b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5',
    username: 'testuser1',
    email: 'testuser1@example.com',
    is_admin: false,
    status: 'Active',
    last_updated: '2025-08-04T10:23:00Z',
    skills: [{ name: 'python', level: 'Advanced' }, { name: 'flask', level: 'Intermediate' }, { name: 'sql', level: 'Beginner' }],
    latest_assessment: { score: 8, total: 10, timestamp: '2025-08-03T18:00:00Z', duration_minutes: 15 },
    learning_path_generated: true,
    workflow: {
      profile_loaded: { completed: true, timestamp: '2025-08-01T09:15:00Z' },
      skills_evaluated: { completed: true, timestamp: '2025-08-02T14:30:00Z' },
      assessment_completed: { completed: true, timestamp: '2025-08-03T18:00:00Z' },
      learning_path_generated: { completed: true, timestamp: '2025-08-04T10:23:00Z' }
    },
    learning_path: ['Advanced Python Algorithms', 'Flask API Development', 'Database Optimization']
  },
  {
    id: 'p6q7r8-s9t0-u1v2-w3x4-y5z6a7b8c9d',
    username: 'dev_jane',
    email: 'jane.doe@example.com',
    is_admin: false,
    status: 'Stagnant',
    last_updated: '2025-07-15T11:00:00Z',
    skills: [{ name: 'javascript', level: 'Intermediate' }, { name: 'react', level: 'Beginner' }, { name: 'css', level: 'Advanced' }],
    latest_assessment: { score: 5, total: 10, timestamp: '2025-07-14T09:30:00Z', duration_minutes: 22 },
    learning_path_generated: true,
    workflow: {
      profile_loaded: { completed: true, timestamp: '2025-07-10T08:45:00Z' },
      skills_evaluated: { completed: true, timestamp: '2025-07-12T16:20:00Z' },
      assessment_completed: { completed: true, timestamp: '2025-07-14T09:30:00Z' },
      learning_path_generated: { completed: true, timestamp: '2025-07-15T11:00:00Z' }
    },
    learning_path: ['React Component Patterns', 'JavaScript ES6+', 'Modern CSS Techniques']
  },
  {
    id: 'e0f1g2-h3i4-j5k6-l7m8-n9o0p1q2r3',
    username: 'coder_mike',
    email: 'mike@example.com',
    is_admin: false,
    status: 'Active',
    last_updated: '2025-08-04T08:45:00Z',
    skills: [],
    latest_assessment: null,
    learning_path_generated: false,
    workflow: {
      profile_loaded: { completed: true, timestamp: '2025-08-04T08:45:00Z' },
      skills_evaluated: { completed: false, timestamp: null },
      assessment_completed: { completed: false, timestamp: null },
      learning_path_generated: { completed: false, timestamp: null }
    },
    learning_path: []
  },
  {
    id: 'j7k8l9-m0n1-o2p3-q4r5-s6t7u8v9w0',
    username: 'data_sarah',
    email: 'sarah@example.com',
    is_admin: false,
    status: 'Active',
    last_updated: '2025-08-01T15:30:00Z',
    skills: [{ name: 'python', level: 'Advanced' }, { name: 'data_science', level: 'Advanced' }, { name: 'machine_learning', level: 'Intermediate' }],
    latest_assessment: { score: 9, total: 10, timestamp: '2025-07-30T13:45:00Z', duration_minutes: 18 },
    learning_path_generated: true,
    workflow: {
      profile_loaded: { completed: true, timestamp: '2025-07-28T09:00:00Z' },
      skills_evaluated: { completed: true, timestamp: '2025-07-29T11:15:00Z' },
      assessment_completed: { completed: true, timestamp: '2025-07-30T13:45:00Z' },
      learning_path_generated: { completed: true, timestamp: '2025-08-01T15:30:00Z' }
    },
    learning_path: ['Advanced Neural Networks', 'Data Visualization', 'Statistical Analysis']
  },
  {
    id: 'x1y2z3-a4b5-c6d7-e8f9-g0h1i2j3k4',
    username: 'backend_alex',
    email: 'alex@example.com',
    is_admin: false,
    status: 'Inactive',
    last_updated: '2025-06-20T10:15:00Z',
    skills: [{ name: 'java', level: 'Advanced' }, { name: 'spring', level: 'Intermediate' }, { name: 'microservices', level: 'Beginner' }],
    latest_assessment: { score: 7, total: 10, timestamp: '2025-06-18T14:30:00Z', duration_minutes: 25 },
    learning_path_generated: true,
    workflow: {
      profile_loaded: { completed: true, timestamp: '2025-06-15T08:30:00Z' },
      skills_evaluated: { completed: true, timestamp: '2025-06-17T11:45:00Z' },
      assessment_completed: { completed: true, timestamp: '2025-06-18T14:30:00Z' },
      learning_path_generated: { completed: true, timestamp: '2025-06-20T10:15:00Z' }
    },
    learning_path: ['Spring Boot Advanced', 'Microservices Architecture', 'API Design']
  }
];

// Mock hackathon data
export const mockHackathons = [
  {
    id: 'hack-001',
    title: 'AI Innovation Challenge',
    description: 'Build an innovative AI solution to solve real-world problems',
    start_date: '2025-09-01T00:00:00Z',
    end_date: '2025-09-15T23:59:59Z',
    status: 'Upcoming',
    participants: 12,
    submissions: 0
  },
  {
    id: 'hack-002',
    title: 'Web3 Development Hackathon',
    description: 'Create decentralized applications using blockchain technology',
    start_date: '2025-08-10T00:00:00Z',
    end_date: '2025-08-17T23:59:59Z',
    status: 'Active',
    participants: 24,
    submissions: 8
  },
  {
    id: 'hack-003',
    title: 'Mobile App Challenge',
    description: 'Develop innovative mobile applications for social impact',
    start_date: '2025-07-01T00:00:00Z',
    end_date: '2025-07-15T23:59:59Z',
    status: 'Completed',
    participants: 18,
    submissions: 15
  }
];

// Mock analytics data
export const mockAnalytics = {
  skillGrowth: [
    { month: 'Jan', users: 120 },
    { month: 'Feb', users: 150 },
    { month: 'Mar', users: 200 },
    { month: 'Apr', users: 250 },
    { month: 'May', users: 300 },
    { month: 'Jun', users: 350 }
  ],
  platformEngagement: [
    { date: '2025-08-01', active_users: 85, assessments_taken: 42, learning_paths_started: 38 },
    { date: '2025-08-02', active_users: 92, assessments_taken: 45, learning_paths_started: 40 },
    { date: '2025-08-03', active_users: 88, assessments_taken: 39, learning_paths_started: 35 },
    { date: '2025-08-04', active_users: 95, assessments_taken: 48, learning_paths_started: 42 }
  ],
  topSkills: [
    { skill: 'python', count: 120 },
    { skill: 'javascript', count: 110 },
    { skill: 'react', count: 95 },
    { skill: 'java', count: 85 },
    { skill: 'data_science', count: 75 }
  ]
};