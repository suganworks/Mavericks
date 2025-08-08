import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://bgnicypyisdjqkplveas.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertHackathonSampleData() {
  try {
    console.log('📝 Inserting hackathon sample data...\n');

    // Get the ongoing hackathon
    const { data: ongoingHackathon, error: hackathonError } = await supabase
      .from('hackathons')
      .select('*')
      .eq('status', 'ongoing')
      .single();

    if (hackathonError || !ongoingHackathon) {
      console.error('❌ No ongoing hackathon found');
      return;
    }

    console.log(`✅ Using ongoing hackathon: ${ongoingHackathon.title} (ID: ${ongoingHackathon.id})`);

    // Sample challenges
    const challenges = [
      {
        hackathon_id: ongoingHackathon.id,
        title: "AI/ML Fundamentals Quiz",
        description: "Test your knowledge of artificial intelligence and machine learning concepts. This challenge covers basic AI principles, ML algorithms, and data science fundamentals.",
        type: "mcq",
        difficulty: "easy",
        time_limit: 15,
        max_score: 100
      },
      {
        hackathon_id: ongoingHackathon.id,
        title: "Responsive Web Development",
        description: "Build a responsive web application that works seamlessly across all devices. Focus on modern CSS techniques, JavaScript functionality, and user experience.",
        type: "coding",
        difficulty: "medium",
        time_limit: 45,
        max_score: 200
      },
      {
        hackathon_id: ongoingHackathon.id,
        title: "Full-Stack API Integration",
        description: "Create a complete full-stack application with frontend, backend, and database integration. Implement RESTful APIs, authentication, and data persistence.",
        type: "coding",
        difficulty: "hard",
        time_limit: 60,
        max_score: 300
      }
    ];

    // Insert challenges
    for (const challenge of challenges) {
      console.log(`Inserting challenge: ${challenge.title}`);
      
      const { data: challengeData, error: challengeError } = await supabase
        .from('hackathon_challenges')
        .insert(challenge)
        .select();

      if (challengeError) {
        console.error(`❌ Error inserting challenge "${challenge.title}":`, challengeError);
        continue;
      }

      const challengeId = challengeData[0].id;
      console.log(`✅ Successfully inserted challenge: ${challenge.title} (ID: ${challengeId})`);

      // Insert MCQs for the first challenge
      if (challenge.type === 'mcq') {
        const mcqs = [
          {
            challenge_id: challengeId,
            question: "What is the primary goal of machine learning?",
            options: ["To create artificial intelligence", "To enable computers to learn from data", "To replace human workers", "To make computers faster"],
            correct_answer: "To enable computers to learn from data",
            points: 20
          },
          {
            challenge_id: challengeId,
            question: "Which of the following is NOT a type of machine learning?",
            options: ["Supervised Learning", "Unsupervised Learning", "Reinforcement Learning", "Static Learning"],
            correct_answer: "Static Learning",
            points: 20
          },
          {
            challenge_id: challengeId,
            question: "What is overfitting in machine learning?",
            options: ["When a model performs well on training data but poorly on new data", "When a model is too simple", "When a model has too few parameters", "When a model is too fast"],
            correct_answer: "When a model performs well on training data but poorly on new data",
            points: 20
          },
          {
            challenge_id: challengeId,
            question: "Which algorithm is commonly used for classification problems?",
            options: ["Linear Regression", "Logistic Regression", "K-Means Clustering", "Principal Component Analysis"],
            correct_answer: "Logistic Regression",
            points: 20
          },
          {
            challenge_id: challengeId,
            question: "What does 'deep learning' refer to?",
            options: ["Learning with many layers of neural networks", "Learning for a long time", "Learning complex algorithms", "Learning from big data"],
            correct_answer: "Learning with many layers of neural networks",
            points: 20
          }
        ];

        for (const mcq of mcqs) {
          const { error: mcqError } = await supabase
            .from('hackathon_mcqs')
            .insert(mcq);

          if (mcqError) {
            console.error(`❌ Error inserting MCQ:`, mcqError);
          }
        }
        console.log(`✅ Inserted ${mcqs.length} MCQs for challenge: ${challenge.title}`);
      }

      // Insert coding problems for coding challenges
      if (challenge.type === 'coding') {
        const problems = [
          {
            challenge_id: challengeId,
            title: challenge.title === "Responsive Web Development" ? "Responsive Navigation Bar" : "REST API Implementation",
            description: challenge.title === "Responsive Web Development" 
              ? "Create a responsive navigation bar that adapts to different screen sizes. The navigation should include a logo, menu items, and a mobile hamburger menu."
              : "Build a REST API with CRUD operations for a todo list. Include proper error handling, validation, and documentation.",
            difficulty: challenge.difficulty,
            test_cases: challenge.title === "Responsive Web Development" 
              ? [
                  {"input": "screen width: 768px", "output": "hamburger menu visible"},
                  {"input": "screen width: 1024px", "output": "full menu visible"}
                ]
              : [
                  {"input": "POST /todos", "output": "201 Created"},
                  {"input": "GET /todos", "output": "200 OK with todos array"}
                ],
            templates: challenge.title === "Responsive Web Development"
              ? {
                  "html": "<nav class=\"navbar\">\n  <!-- Your code here -->\n</nav>",
                  "css": "/* Your styles here */",
                  "javascript": "// Your JavaScript here"
                }
              : {
                  "javascript": "// Express.js server setup\nconst express = require(\"express\");\nconst app = express();\n\n// Your code here"
                },
            points: challenge.max_score
          }
        ];

        for (const problem of problems) {
          const { error: problemError } = await supabase
            .from('hackathon_problems')
            .insert(problem);

          if (problemError) {
            console.error(`❌ Error inserting problem:`, problemError);
          }
        }
        console.log(`✅ Inserted coding problem for challenge: ${challenge.title}`);
      }
    }

    console.log('\n✅ Hackathon sample data insertion completed!');

    // Verify the data was inserted
    console.log('\n🔍 Verifying inserted data...');
    
    const { data: challengesData, error: challengesError } = await supabase
      .from('hackathon_challenges')
      .select('*')
      .eq('hackathon_id', ongoingHackathon.id);

    if (challengesError) {
      console.error('❌ Error fetching challenges:', challengesError);
    } else {
      console.log(`✅ Found ${challengesData.length} challenges for the hackathon`);
      challengesData.forEach(challenge => {
        console.log(`   - ${challenge.title} (${challenge.type}, ${challenge.difficulty})`);
      });
    }

  } catch (error) {
    console.error('❌ Error in insertHackathonSampleData:', error);
  }
}

// Run the function
insertHackathonSampleData();
