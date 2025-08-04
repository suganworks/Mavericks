import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// AI-based hackathon questions with varying difficulty levels
const hackathonQuestions = [
  {
    id: 1,
    title: "🤖 AI Pathfinding Challenge",
    description: "Implement Dijkstra's algorithm to find the shortest path in a weighted graph. This is a fundamental algorithm used in AI navigation systems, GPS applications, and network routing.",
    difficulty: "Hard",
    category: "Algorithms",
    timeLimit: "45 minutes",
    points: 100,
    tags: ["Graph Theory", "Dynamic Programming", "AI Navigation"]
  },
  {
    id: 2,
    title: "🧠 Neural Network from Scratch",
    description: "Build a simple feedforward neural network without using any ML libraries. Implement the XOR operation using backpropagation. This challenge tests your understanding of deep learning fundamentals.",
    difficulty: "Very Hard",
    category: "Machine Learning",
    timeLimit: "60 minutes",
    points: 150,
    tags: ["Neural Networks", "Backpropagation", "XOR Logic"]
  },
  {
    id: 3,
    title: "⚡ Dynamic Programming Mastery",
    description: "Solve the Edit Distance problem using dynamic programming. This algorithm is crucial for spell checkers, DNA sequence analysis, and natural language processing applications.",
    difficulty: "Hard",
    category: "Algorithms",
    timeLimit: "40 minutes",
    points: 120,
    tags: ["Dynamic Programming", "String Matching", "NLP"]
  },
  {
    id: 4,
    title: "🎯 Binary Search Tree Operations",
    description: "Implement a self-balancing binary search tree (AVL tree) with insertion, deletion, and search operations. This data structure is essential for efficient database indexing.",
    difficulty: "Medium",
    category: "Data Structures",
    timeLimit: "35 minutes",
    points: 80,
    tags: ["Trees", "Balancing", "Database Indexing"]
  },
  {
    id: 5,
    title: "🔐 Cryptography Challenge",
    description: "Implement RSA encryption and decryption from scratch. This challenge covers modular arithmetic, prime number generation, and public-key cryptography fundamentals.",
    difficulty: "Very Hard",
    category: "Cryptography",
    timeLimit: "75 minutes",
    points: 200,
    tags: ["RSA", "Modular Arithmetic", "Prime Numbers"]
  },
  {
    id: 6,
    title: "🌐 WebSocket Chat Server",
    description: "Build a real-time chat server using WebSockets. Handle multiple client connections, message broadcasting, and implement basic chat room functionality.",
    difficulty: "Medium",
    category: "Web Development",
    timeLimit: "50 minutes",
    points: 90,
    tags: ["WebSockets", "Real-time", "Networking"]
  }
];

export default function Hackathon() {
  const navigate = useNavigate();
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleSolve = (problemId) => {
    navigate(`/code-editor?problemId=${problemId}`);
  };

  // Defensive: Ensure hackathonQuestions is always an array
  const safeQuestions = Array.isArray(hackathonQuestions) ? hackathonQuestions : [];

  const filteredQuestions = safeQuestions.filter(q => {
    const difficultyMatch = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
    const categoryMatch = selectedCategory === "All" || q.category === selectedCategory;
    return difficultyMatch && categoryMatch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500";
      case "Medium": return "bg-yellow-500";
      case "Hard": return "bg-orange-500";
      case "Very Hard": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            🤖 AI Hackathon Portal
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Challenge yourself with AI-powered programming problems. Solve complex algorithms, 
            build neural networks, and master advanced data structures.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Very Hard">Very Hard</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Algorithms">Algorithms</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Data Structures">Data Structures</option>
            <option value="Cryptography">Cryptography</option>
            <option value="Web Development">Web Development</option>
          </select>
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20"
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-cyan-400">{question.title}</h2>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>

              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {question.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {(question.tags || []).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex justify-between items-center mb-4 text-sm text-gray-400">
                <span>⏱️ {question.timeLimit}</span>
                <span>🏆 {question.points} pts</span>
                <span>📂 {question.category}</span>
              </div>

              <button
                onClick={() => handleSolve(question.id)}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                🚀 Start Challenge
              </button>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-cyan-400">{hackathonQuestions.length}</div>
              <div className="text-gray-400">Total Challenges</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">740</div>
              <div className="text-gray-400">Total Points</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">5</div>
              <div className="text-gray-400">Categories</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">∞</div>
              <div className="text-gray-400">Time to Code</div>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
