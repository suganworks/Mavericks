import React, { useState, useEffect } from "react";
import PremiereBackground from "../components/PremiereBackground";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
 

// --- Language Icons ---
const LanguageIcons = {
  python: (
    <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
      <linearGradient id="python-original-a" gradientUnits="userSpaceOnUse" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stopColor="#5A9FD4"></stop><stop offset="1" stopColor="#306998"></stop></linearGradient>
      <linearGradient id="python-original-b" gradientUnits="userSpaceOnUse" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stopColor="#FFD43B"></stop><stop offset="1" stopColor="#FFE873"></stop></linearGradient>
      <path fill="url(#python-original-a)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" transform="translate(0 10.26)"></path><path fill="url(#python-original-b)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" transform="translate(0 10.26)"></path><path opacity=".444" fill="#fff" fillRule="nonzero" d="M97.309 119.597c0 3.543-14.816 6.416-33.091 6.416-18.276 0-33.092-2.873-33.092-6.416 0-3.544 14.815-6.417 33.092-6.417 18.275 0 33.091 2.872 33.091 6.417z"></path>
    </svg>
  ),
  javascript: (
    <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
      <path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z"></path><path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z"></path>
    </svg>
  ),
  cpp: (
    <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
      <path fill="#D26383" d="M115.4 30.7L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.7z"></path><path fill="#9C033A" d="M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8l-106.6 62z"></path><path fill="#fff" d="M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8l-12.9-7.6z"></path><path d="M82.1 61.8h5.2v-5.3h4.4v5.3H97v4.4h-5.3v5.2h-4.4v-5.2h-5.2v-4.4zm18.5 0h5.2v-5.3h4.4v5.3h5.3v4.4h-5.3v5.2h-4.4v-5.2h-5.2v-4.4z" fill="#fff"></path>
    </svg>
  ),
  java: (
    <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
      <path fill="#0074BD" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z"></path><path fill="#EA2D2E" d="M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z"></path><path fill="#0074BD" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z"></path><path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z"></path><path fill="#0074BD" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z"></path>
    </svg>
  )
};

// Assessment topics with their descriptions
const assessmentTopics = [
  {
    id: "arrays",
    title: "Arrays",
    description: "Master array manipulation, traversal, and common algorithms.",
    icon: "📊"
  },
  {
    id: "strings",
    title: "Strings",
    description: "Tackle string manipulation, pattern matching, and text processing.",
    icon: "📝"
  },
  {
    id: "recursion",
    title: "Recursion",
    description: "Solve problems using recursive techniques and backtracking.",
    icon: "🔄"
  },
  {
    id: "data-structures",
    title: "Data Structures",
    description: "Implement and use stacks, queues, linked lists, trees, and graphs.",
    icon: "🏗️"
  },
  {
    id: "algorithms",
    title: "Algorithms",
    description: "Apply sorting, searching, and optimization algorithms.",
    icon: "⚙️"
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    description: "Solve complex problems by breaking them down into simpler subproblems.",
    icon: "🧩"
  }
];

// Weekly assessment data
const weeklyAssessment = {
  id: "weekly-challenge",
  title: "Weekly Challenge",
  description: "This week's challenge focuses on graph algorithms and network flow problems.",
  difficulty: "Medium",
  deadline: "Sunday, 11:59 PM",
  icon: "📆"
};

// Daily assessment data (changes daily)
const getDailyAssessment = () => {
  const today = new Date();
  const day = today.getDay();
  
  const dailyTopics = [
    "Arrays and Strings",
    "Linked Lists",
    "Stacks and Queues",
    "Trees and Graphs",
    "Sorting and Searching",
    "Dynamic Programming",
    "System Design"
  ];
  
  return {
    id: "daily-quiz",
    title: "Daily Coding Quiz",
    description: `Today's quiz focuses on ${dailyTopics[day]}. Complete it to earn bonus points!`,
    difficulty: "Easy",
    icon: "📅"
  };
};

export default function Assessments() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [dailyAssessment, setDailyAssessment] = useState(null);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const animatedGradientStyles = `
    .animated-gradient-bg {
      background: linear-gradient(-45deg, #0ea5e9, #8b5cf6, #ec4899, #22c55e);
      background-size: 400% 400%;
      animation: gradientShift 18s ease infinite;
      position: relative;
    }
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again
      navigate(location.pathname, { replace: true });
      
      // Auto-hide the message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  }, [location.state, navigate]);

  // Fetch user data and completed assessments
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      // Get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      setUser(user);
      
      // Fetch user profile data
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (userError) {
        console.error("Error fetching user data:", userError);
      } else {
        setUserData(userData);
      }
      
      // Fetch completed assessments
      const { data: completedData, error: completedError } = await supabase
        .from("user_assessments")
        .select("problem_id, completed_at, score")
        .eq("user_id", user.id)
        .not("completed_at", "is", null);
      
      if (completedError) {
        console.error("Error fetching completed assessments:", completedError);
      } else {
        setCompletedAssessments(completedData || []);
      }
      
      // Set daily assessment
      setDailyAssessment(getDailyAssessment());
      
      setLoading(false);
    };
    
    fetchUserData();
  }, [navigate]);

  // Start an assessment
  const startAssessment = (assessmentId) => {
    navigate(`/assessments/${assessmentId}/mcq`);
  };

  // Check if an assessment is completed
  const isCompleted = (assessmentId) => {
    return completedAssessments.some(a => a.problem_id === assessmentId);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading Assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-6">
      <PremiereBackground darkOverlay={true} />
      
      
      
      
      <div className="max-w-7xl relative z-10 mx-auto">
        <h1 className="text-4xl font-bold mb-8">Assessment Dashboard</h1>
        
        {/* Success Message */}
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="backdrop-blur-xl bg-green-500/20 border border-green-500/30 text-green-200 p-4 mb-6 rounded-xl"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold">{successMessage}</p>
            </div>
          </motion.div>
        )}
        
        {/* User Stats */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-8 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Welcome, {userData?.username || user?.email}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 transition-all hover:bg-white/20">
              <p className="text-white/80">Completed Assessments</p>
              <p className="text-3xl font-bold">{completedAssessments.length}</p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 transition-all hover:bg-white/20">
              <p className="text-white/80">Average Score</p>
              <p className="text-3xl font-bold">
                {completedAssessments.length > 0 
                  ? Math.round(completedAssessments.reduce((sum, a) => sum + (a.score || 0), 0) / completedAssessments.length) + '%'
                  : 'N/A'}
              </p>
            </div>
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 transition-all hover:bg-white/20">
              <p className="text-white/80">Total Points</p>
              <p className="text-3xl font-bold">{userData?.score || 0}</p>
            </div>
          </div>
        </div>
        
        {/* Featured Assessments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Daily Assessment */}
          <motion.div 
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden"
            whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-5xl filter drop-shadow-lg">{dailyAssessment.icon}</span>
                  <h3 className="text-2xl font-bold mt-2">{dailyAssessment.title}</h3>
                </div>
                <span className="backdrop-blur-md bg-white/20 text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                  {dailyAssessment.difficulty}
                </span>
              </div>
              <p className="text-white/80 mb-6">{dailyAssessment.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">10 minutes</span>
                <motion.button
                  onClick={() => startAssessment(dailyAssessment.id)}
                  className="px-4 py-2 backdrop-blur-md bg-white/20 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isCompleted(dailyAssessment.id)}
                >
                  {isCompleted(dailyAssessment.id) ? 'Completed' : 'Start Assessment'}
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          {/* Weekly Assessment */}
          <motion.div 
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden"
            whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-5xl filter drop-shadow-lg">{weeklyAssessment.icon}</span>
                  <h3 className="text-2xl font-bold mt-2">{weeklyAssessment.title}</h3>
                </div>
                <span className="backdrop-blur-md bg-white/20 text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                  {weeklyAssessment.difficulty}
                </span>
              </div>
              <p className="text-white/80 mb-6">{weeklyAssessment.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/70">Deadline: {weeklyAssessment.deadline}</span>
                <motion.button
                  onClick={() => startAssessment(weeklyAssessment.id)}
                  className="px-4 py-2 backdrop-blur-md bg-white/20 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isCompleted(weeklyAssessment.id)}
                >
                  {isCompleted(weeklyAssessment.id) ? 'Completed' : 'Start Assessment'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Topic-wise Assessments */}
        <h2 className="text-2xl font-bold mb-6 text-white/90">Topic-wise Assessments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessmentTopics.map((topic) => (
            <motion.div 
              key={topic.id}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-xl overflow-hidden"
              whileHover={{ scale: 1.03, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3 filter drop-shadow-lg">{topic.icon}</span>
                  <h3 className="text-xl font-bold">{topic.title}</h3>
                </div>
                <p className="text-white/70 mb-6 h-12">{topic.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/60">
                    {isCompleted(topic.id) ? 'Completed' : 'Not attempted'}
                  </span>
                  <motion.button
                    onClick={() => startAssessment(topic.id)}
                    className={`px-4 py-2 rounded-xl font-semibold backdrop-blur-md border ${isCompleted(topic.id) 
                      ? 'bg-white/10 text-white/70 border-white/20' 
                      : 'bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isCompleted(topic.id) ? 'Review' : 'Start'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
