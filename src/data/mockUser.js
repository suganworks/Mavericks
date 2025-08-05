// This file simulates the data we will eventually get from our Supabase backend.
// It has been expanded to support all features of the admin dashboard.

export const mockUsers = [
  {
    id: '1a2b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5',
    username: 'testuser1',
    email: 'testuser1@example.com',
    status: 'Active',
    last_updated: '2025-08-04T10:23:00Z',
    skills: [{ name: 'Python' }, { name: 'Flask' }, { name: 'SQL' }],
    // Workflow progress timestamps
    workflow: {
      profile_loaded_at: '2025-08-01T09:00:00Z',
      assessment_completed_at: '2025-08-03T18:15:00Z',
      skills_evaluated_at: '2025-08-03T19:00:00Z',
      learning_path_generated_at: '2025-08-04T10:23:00Z',
    },
    assessments: [
      { id: 'assess1', score: 8, total: 10, timestamp: '2025-08-03T18:15:00Z', duration_minutes: 15 },
    ],
    // The latest assessment is derived from the assessments array
    get latest_assessment() { return this.assessments.length > 0 ? this.assessments[this.assessments.length - 1] : null; },
    get learning_path_generated() { return !!this.workflow.learning_path_generated_at; },
  },
  {
    id: 'p6q7r8-s9t0-u1v2-w3x4-y5z6a7b8c9d',
    username: 'dev_jane',
    email: 'jane.doe@example.com',
    status: 'Stagnant',
    last_updated: '2025-07-15T11:00:00Z',
    skills: [{ name: 'JavaScript' }, { name: 'React' }, { name: 'CSS' }],
    workflow: {
      profile_loaded_at: '2025-07-10T10:00:00Z',
      assessment_completed_at: '2025-07-14T09:30:00Z',
      skills_evaluated_at: '2025-07-14T10:00:00Z',
      learning_path_generated_at: null, // Learning path not generated yet
    },
    assessments: [
      { id: 'assess2', score: 5, total: 10, timestamp: '2025-07-14T09:30:00Z', duration_minutes: 25 },
    ],
    get latest_assessment() { return this.assessments.length > 0 ? this.assessments[this.assessments.length - 1] : null; },
    get learning_path_generated() { return !!this.workflow.learning_path_generated_at; },
  },
  {
    id: 'e0f1g2-h3i4-j5k6-l7m8-n9o0p1q2r3',
    username: 'coder_mike',
    email: 'mike@example.com',
    status: 'Active',
    last_updated: '2025-08-04T08:45:00Z',
    skills: [],
    workflow: {
      profile_loaded_at: '2025-08-04T08:45:00Z',
      assessment_completed_at: null, // Has not completed assessment
      skills_evaluated_at: null,
      learning_path_generated_at: null,
    },
    assessments: [],
    get latest_assessment() { return this.assessments.length > 0 ? this.assessments[this.assessments.length - 1] : null; },
    get learning_path_generated() { return !!this.workflow.learning_path_generated_at; },
  },
  {
    id: 'k4l5m6-n7o8-p9q0-r1s2-t3u4v5w6x7',
    username: 'data_scientist_ana',
    email: 'ana@example.com',
    status: 'Active',
    last_updated: '2025-08-05T12:00:00Z',
    skills: [{ name: 'Python' }, { name: 'Pandas' }, { name: 'scikit-learn' }],
     workflow: {
      profile_loaded_at: '2025-08-01T11:00:00Z',
      assessment_completed_at: '2025-08-02T14:00:00Z',
      skills_evaluated_at: '2025-08-02T14:30:00Z',
      learning_path_generated_at: '2025-08-03T10:00:00Z',
    },
    assessments: [
      { id: 'assess3', score: 9, total: 10, timestamp: '2025-08-02T14:00:00Z', duration_minutes: 18 },
    ],
    get latest_assessment() { return this.assessments.length > 0 ? this.assessments[this.assessments.length - 1] : null; },
    get learning_path_generated() { return !!this.workflow.learning_path_generated_at; },
  }
];

export const mockHackathons = [
    {
        id: 'hack01',
        name: 'AI Automation Challenge',
        status: 'Active',
        submissions: [
            { userId: '1a2b3c-4d5e-6f7g-8h9i-0j1k2l3m4n5', submissionLink: '#', result: 'Winner' },
            { userId: 'p6q7r8-s9t0-u1v2-w3x4-y5z6a7b8c9d', submissionLink: '#', result: 'Participant' },
        ]
    },
    {
        id: 'hack02',
        name: 'Data Visualization Contest',
        status: 'Upcoming',
        submissions: []
    }
];