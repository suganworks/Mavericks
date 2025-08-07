import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import ParticleBackground from "../components/ParticleBackground";
import './leaderboard.css';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("xp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Badge definitions with colors and descriptions
  const badges = {
    "Rookie Coder": {
      color: "from-blue-400 to-blue-600",
      icon: "👶",
      description: "Just starting the coding journey"
    },
    "Code Enthusiast": {
      color: "from-green-400 to-green-600",
      icon: "🌱",
      description: "Showing dedication with 250+ XP"
    },
    "Skilled Programmer": {
      color: "from-yellow-400 to-yellow-600",
      icon: "⭐",
      description: "Demonstrated skill with 500+ XP"
    },
    "Advanced Developer": {
      color: "from-orange-400 to-orange-600",
      icon: "🔥",
      description: "Reached advanced status with 750+ XP"
    },
    "Coding Master": {
      color: "from-purple-400 to-purple-600",
      icon: "👑",
      description: "Achieved mastery with 1000+ XP"
    }
  };

  // Skill colors based on level
  const skillColors = {
    1: "bg-gray-700 text-gray-300",
    2: "bg-blue-700 text-blue-300",
    3: "bg-green-700 text-green-300",
    4: "bg-yellow-700 text-yellow-300",
    5: "bg-purple-700 text-purple-300"
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        
        // Fetch users from Supabase
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order(sortBy, { ascending: sortOrder === "asc" });
        
        if (error) throw error;
        
        // Transform data to include random skills if none exist
        const transformedUsers = data.map(user => {
          // If user has no skills, generate random ones
          if (!user.skills || !Array.isArray(user.skills) || user.skills.length === 0) {
            const randomSkills = generateRandomSkills();
            return { ...user, skills: randomSkills };
          }
          return user;
        });
        
        setUsers(transformedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, [sortBy, sortOrder]);
  
  // Set default sort to XP descending on component mount
  useEffect(() => {
    setSortBy("xp");
    setSortOrder("desc");
  }, []);
  
  // Generate random skills for users without skills data
  const generateRandomSkills = () => {
    const possibleSkills = [
      "JavaScript", "React", "Node.js", "Python", "CSS", "HTML", 
      "TypeScript", "SQL", "MongoDB", "AWS", "Docker", "Git"
    ];
    
    const numSkills = Math.floor(Math.random() * 5) + 1; // 1-5 skills
    const skills = [];
    
    for (let i = 0; i < numSkills; i++) {
      const randomSkill = possibleSkills[Math.floor(Math.random() * possibleSkills.length)];
      const randomLevel = Math.floor(Math.random() * 5) + 1; // Level 1-5
      
      // Only add if not already added
      if (!skills.some(s => s.name === randomSkill)) {
        skills.push({
          name: randomSkill,
          level: randomLevel
        });
      }
    }
    
    return skills;
  };
  
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column and default to descending
      setSortBy(column);
      setSortOrder("desc");
    }
  };
  
  const getSortIcon = (column) => {
    if (sortBy !== column) return null;
    
    return sortOrder === "asc" ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };
  
  const renderBadge = (badgeName) => {
    const badge = badges[badgeName] || badges["Rookie Coder"];
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${badge.color} text-white text-xs font-bold shadow-lg`}>
        <span className="mr-1">{badge.icon}</span>
        {badgeName}
      </div>
    );
  };
  
  const renderSkillBadges = (skills) => {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return <span className="text-gray-500">-</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {skills.slice(0, 3).map((skill, index) => (
          <span 
            key={index} 
            className={`px-2 py-0.5 rounded-full text-xs ${skillColors[skill.level] || skillColors[1]}`}
          >
            {skill.name} {skill.level && `(${skill.level})`}
          </span>
        ))}
        {skills.length > 3 && (
          <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 text-xs">
            +{skills.length - 3} more
          </span>
        )}
      </div>
    );
  };
  
  const renderGems = (xp, userRank) => {
    // Calculate gems based on XP (1 gem per 100 XP)
    const gems = Math.floor(xp / 100);
    
    // Define different glow colors for gems
    const glowColors = [
      { gradient: "from-purple-500 to-indigo-600", shadow: "rgba(130, 0, 255, 0.3)", textShadow: "0 0 5px #a855f7, 0 0 10px #6366f1", cssClass: "gem-purple" },
      { gradient: "from-blue-500 to-cyan-600", shadow: "rgba(0, 130, 255, 0.3)", textShadow: "0 0 5px #3b82f6, 0 0 10px #0891b2", cssClass: "gem-blue" },
      { gradient: "from-emerald-500 to-teal-600", shadow: "rgba(0, 200, 150, 0.3)", textShadow: "0 0 5px #10b981, 0 0 10px #0d9488", cssClass: "gem-green" },
      { gradient: "from-amber-500 to-yellow-600", shadow: "rgba(250, 200, 0, 0.3)", textShadow: "0 0 5px #f59e0b, 0 0 10px #ca8a04", cssClass: "gem-yellow" },
      { gradient: "from-rose-500 to-pink-600", shadow: "rgba(255, 0, 130, 0.3)", textShadow: "0 0 5px #f43f5e, 0 0 10px #db2777", cssClass: "gem-pink" },
    ];
    
    if (gems === 0) return <span className="text-gray-500">-</span>;
    
    const colorIndex = gems % glowColors.length;
    
    // Special styling for top 3 ranks
    let gemClass = `absolute w-7 h-7 transform bg-gradient-to-br ${glowColors[colorIndex].gradient} border border-white/30 shadow-lg gem-glow ${glowColors[colorIndex].cssClass}`;
    let gemStyle = { boxShadow: `0 0 10px 2px ${glowColors[colorIndex].shadow}` };
    let textClass = "absolute text-xs font-bold text-white z-10";
    let textStyle = { textShadow: glowColors[colorIndex].textShadow };
    
    // Apply special effects for top 3 ranks
    if (userRank === 0) {
      gemClass = "absolute w-8 h-8 transform gem-rank-1 border border-yellow-300/50 z-0";
      gemStyle = {};
      textClass = "absolute text-xs font-bold text-white z-10 animate-pulse";
      textStyle = { textShadow: "0 0 8px rgba(255, 215, 0, 0.8)" };
    } else if (userRank === 1) {
      gemClass = "absolute w-7 h-7 transform gem-rank-2 border border-gray-300/50 z-0";
      gemStyle = {};
      textClass = "absolute text-xs font-bold text-white z-10";
      textStyle = { textShadow: "0 0 6px rgba(192, 192, 192, 0.8)" };
    } else if (userRank === 2) {
      gemClass = "absolute w-7 h-7 transform gem-rank-3 border border-amber-500/50 z-0";
      gemStyle = {};
      textClass = "absolute text-xs font-bold text-white z-10";
      textStyle = { textShadow: "0 0 5px rgba(205, 127, 50, 0.8)" };
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className={gemClass} style={gemStyle}></div>
          <span className={textClass} style={textStyle}>{gems}</span>
          {userRank === 0 && (
            <span className="absolute -top-2 -right-2 text-xs animate-bounce">✨</span>
          )}
        </div>
      </div>
    );
  };
  
  const handleUserClick = (user) => {
    setSelectedUser(selectedUser?.id === user.id ? null : user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black text-white relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Glowing orbs - darker versions */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-900/15 blur-3xl animate-pulse"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-900/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="fixed top-1/3 right-1/4 w-48 h-48 rounded-full bg-cyan-900/15 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="fixed bottom-1/3 left-1/3 w-72 h-72 rounded-full bg-indigo-900/15 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-2/3 right-1/3 w-56 h-56 rounded-full bg-violet-900/15 blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }}></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-center mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">Leaderboard</span>
        </motion.h1>
        
        <motion.p 
          className="text-gray-400 text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Top coders ranked by experience, skills, and achievements
        </motion.p>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl glassmorphism">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/30 backdrop-filter backdrop-blur-sm text-gray-300 text-xs uppercase border-b border-purple-900/30">
                    <th className="px-6 py-3 text-center" style={{ width: '80px' }}>Rank</th>
                    <th className="px-6 py-3 text-left">User</th>
                    <th className="px-6 py-3 text-left">
                      XP {sortBy === "xp" && sortOrder === "desc" && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </th>
                    <th 
                      className="px-6 py-3 text-left cursor-pointer hover:text-white"
                      onClick={() => handleSort("level")}
                    >
                      Level {getSortIcon("level")}
                    </th>
                    <th className="px-6 py-3 text-left">Badge</th>
                    <th className="px-6 py-3 text-left">Skills</th>
                    <th className="px-6 py-3 text-left">Gems</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <React.Fragment key={user.id}>
                      <motion.tr 
                        className={`border-b border-purple-900/30 hover:bg-black/40 cursor-pointer transition-all 
                          ${selectedUser?.id === user.id ? 'bg-black/50 backdrop-blur-md' : 'backdrop-blur-sm'}
                          ${index === 0 ? 'rank-1' : ''}
                          ${index === 1 ? 'rank-2' : ''}
                          ${index === 2 ? 'rank-3' : ''}
                        `}
                        onClick={() => handleUserClick(user)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whilehover={{ scale: 1.01, backgroundColor: 'rgba(30, 0, 60, 0.3)' }}
                        style={{ position: 'relative' }}
                      >
                        {index < 3 && (
                          <div className={`aura aura-${index + 1}`}></div>
                        )}
                        {index < 3 && (
                          <>
                            <div className="sparkle sparkle-1"></div>
                            <div className="sparkle sparkle-2"></div>
                            <div className="sparkle sparkle-3"></div>
                            <div className="sparkle sparkle-4"></div>
                            <div className="sparkle sparkle-5"></div>
                          </>
                        )}
                        <td className="px-6 py-4 relative">
                          <div className="flex items-center justify-center h-full">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full 
                              ${index === 0 ? 'rank-1-badge' : index === 1 ? 'rank-2-badge' : index === 2 ? 'rank-3-badge' : 'bg-gradient-to-br from-purple-500/40 to-blue-500/40'} 
                              backdrop-blur-md text-white font-bold shadow-lg border border-white/10 relative z-10`}>
                              {index + 1}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-3 shadow-lg border border-white/20 relative
                              ${index === 0 
                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300 shadow-yellow-500/50' 
                                : index === 1 
                                ? 'bg-gradient-to-br from-gray-300 to-gray-500 border-gray-200 shadow-gray-400/50' 
                                : index === 2 
                                ? 'bg-gradient-to-br from-amber-600 to-amber-800 border-amber-500 shadow-amber-600/50'
                                : 'bg-gradient-to-br from-purple-500 to-blue-600'}
                            `}>
                              {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                              {index === 0 && (
                                <span className="absolute -top-3 -right-1 text-lg transform rotate-15 animate-bounce">👑</span>
                              )}
                            </div>
                            <div>
                              <div className={`font-semibold flex items-center ${index < 3 ? 'text-transparent bg-clip-text' : ''} 
                                ${index === 0 
                                  ? 'bg-gradient-to-r from-yellow-200 to-yellow-500 text-lg' 
                                  : index === 1 
                                  ? 'bg-gradient-to-r from-gray-200 to-gray-400' 
                                  : index === 2 
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-700'
                                  : ''}`}>
                                <div className="truncate">{user.username || 'Anonymous'}</div>
                                {index === 0 && <div className="ml-2 text-xs animate-pulse whitespace-nowrap text-yellow-300">👑 Champion</div>}
                                {index === 1 && <div className="ml-2 text-xs whitespace-nowrap text-gray-300">🥈 Runner-up</div>}
                                {index === 2 && <div className="ml-2 text-xs whitespace-nowrap text-amber-500">🥉 Third Place</div>}
                              </div>
                              <div className="text-xs text-gray-400">{user.email || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`font-mono text-cyan-400 font-bold bg-cyan-900/20 px-3 py-1 rounded-md backdrop-blur-sm inline-block glow-text ${index < 3 ? `xp-rank-${index + 1}` : ''}`} style={{ boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)' }}>
                            <span className="text-xs text-cyan-300 mr-1">XP</span>
                            {user.xp || 0}
                            {index === 0 && <span className="ml-1 text-xs animate-pulse">✨</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white text-sm font-bold shadow-lg border border-white/10 backdrop-blur-sm ${index < 3 ? `level-rank-${index + 1}` : ''}`} style={{ backgroundSize: '200% 200%', animation: 'gradientAnimation 3s ease infinite' }}>
                            <span className="text-xs mr-1">LVL</span>
                            <span className="glow-text">{user.level || 1}</span>
                            {index === 0 && <span className="ml-1 text-xs">🔥</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {renderBadge(user.badge || 'Rookie Coder')}
                        </td>
                        <td className="px-6 py-4">
                          {renderSkillBadges(user.skills)}
                        </td>
                        <td className="px-6 py-4">
                          {renderGems(user.xp || 0, index)}
                        </td>
                      </motion.tr>
                      
                      {/* Expanded user details */}
                      <AnimatePresence>
                        {selectedUser?.id === user.id && (
                          <motion.tr 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-r from-purple-950/40 to-blue-950/40 backdrop-blur-lg"
                          >
                            <td colSpan="7" className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Badge Details */}
                                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-purple-900/30 shadow-lg glassmorphism-card">
                                  <h3 className="text-lg font-semibold mb-2 text-purple-300">Badge Details</h3>
                                  <div className="flex items-center mb-4">
                                    {renderBadge(user.badge || 'Rookie Coder')}
                                  </div>
                                  <p className="text-sm text-gray-300">
                                    {badges[user.badge || 'Rookie Coder']?.description || 'Complete challenges to earn badges'}
                                  </p>
                                  <div className="mt-4 text-xs text-gray-400">
                                    Next badge: {getNextBadge(user.xp || 0)}
                                  </div>
                                </div>
                                
                                {/* Skills Breakdown */}
                                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-blue-900/30 shadow-lg glassmorphism-card">
                                  <h3 className="text-lg font-semibold mb-2 text-blue-300">Skills Breakdown</h3>
                                  <div className="space-y-2">
                                    {user.skills && user.skills.length > 0 ? (
                                      user.skills.map((skill, idx) => (
                                        <div key={idx} className="flex justify-between items-center">
                                          <span className="text-sm">{skill.name}</span>
                                          <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                              <div 
                                                key={i} 
                                                className={`w-2 h-2 rounded-full mx-0.5 ${i < skill.level ? 'bg-blue-400' : 'bg-gray-700'}`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-sm text-gray-400">No skills data available</p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Activity Stats */}
                                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-green-900/30 shadow-lg glassmorphism-card">
                                  <h3 className="text-lg font-semibold mb-2 text-green-300">Activity Stats</h3>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-purple-900/30" style={{ boxShadow: 'inset 0 0 10px rgba(128, 0, 255, 0.1)' }}>
                                      <div className="text-xs text-gray-400">Joined</div>
                                      <div className="text-sm">{formatDate(user.created_at)}</div>
                                    </div>
                                    <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-blue-900/30" style={{ boxShadow: 'inset 0 0 10px rgba(0, 128, 255, 0.1)' }}>
                                      <div className="text-xs text-gray-400">Last Active</div>
                                      <div className="text-sm">{formatDate(user.updated_at || user.created_at)}</div>
                                    </div>
                                    <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-cyan-900/30" style={{ boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.1)' }}>
                                       <div className="text-xs text-gray-400">Gems</div>
                                       <div className="flex items-center gap-2">
                                         <div className="relative w-6 h-6 flex items-center justify-center">
                                           {(() => {
                                             const gems = Math.floor((user.xp || 0) / 100);
                                             const colorIndex = gems % 5;
                                             const userRank = users.findIndex(u => u.id === user.id);
                                             
                                             // Default styling
                                             let gemClass = `absolute w-5 h-5 transform rotate-45 bg-gradient-to-br from-purple-500 to-indigo-600 border border-white/30 shadow-lg gem-glow gem-purple`;
                                             let gemStyle = { boxShadow: `0 0 10px 2px rgba(130, 0, 255, 0.3)` };
                                             let textClass = "absolute text-[10px] font-bold text-white z-10";
                                             let textStyle = { textShadow: "0 0 5px #a855f7, 0 0 10px #6366f1" };
                                             
                                             // Apply special effects for top 3 ranks
                                             if (userRank === 0) {
                                               gemClass = "absolute w-6 h-6 transform gem-rank-1 border border-yellow-300/50 z-0";
                                               gemStyle = {};
                                               textClass = "absolute text-[10px] font-bold text-white z-10 animate-pulse";
                                               textStyle = { textShadow: "0 0 8px rgba(255, 215, 0, 0.8)" };
                                             } else if (userRank === 1) {
                                               gemClass = "absolute w-5 h-5 transform gem-rank-2 border border-gray-300/50 z-0";
                                               gemStyle = {};
                                               textClass = "absolute text-[10px] font-bold text-white z-10";
                                               textStyle = { textShadow: "0 0 6px rgba(192, 192, 192, 0.8)" };
                                             } else if (userRank === 2) {
                                               gemClass = "absolute w-5 h-5 transform gem-rank-3 border border-amber-500/50 z-0";
                                               gemStyle = {};
                                               textClass = "absolute text-[10px] font-bold text-white z-10";
                                               textStyle = { textShadow: "0 0 5px rgba(205, 127, 50, 0.8)" };
                                             } else {
                                               // Use the color index for non-top-3 users
                                               const gemClasses = [
                                                 "gem-purple",
                                                 "gem-blue",
                                                 "gem-green",
                                                 "gem-yellow",
                                                 "gem-pink"
                                               ];
                                               const gradients = [
                                                 "from-purple-500 to-indigo-600",
                                                 "from-blue-500 to-cyan-600",
                                                 "from-emerald-500 to-teal-600",
                                                 "from-amber-500 to-yellow-600",
                                                 "from-rose-500 to-pink-600"
                                               ];
                                               const shadows = [
                                                 "rgba(130, 0, 255, 0.3)",
                                                 "rgba(0, 130, 255, 0.3)",
                                                 "rgba(0, 200, 150, 0.3)",
                                                 "rgba(250, 200, 0, 0.3)",
                                                 "rgba(255, 0, 130, 0.3)"
                                               ];
                                               const textShadows = [
                                                 "0 0 5px #a855f7, 0 0 10px #6366f1",
                                                 "0 0 5px #3b82f6, 0 0 10px #0891b2",
                                                 "0 0 5px #10b981, 0 0 10px #0d9488",
                                                 "0 0 5px #f59e0b, 0 0 10px #ca8a04",
                                                 "0 0 5px #f43f5e, 0 0 10px #db2777"
                                               ];
                                               
                                               gemClass = `absolute w-5 h-5 transform rotate-45 bg-gradient-to-br ${gradients[colorIndex]} border border-white/30 shadow-lg gem-glow ${gemClasses[colorIndex]}`;
                                               gemStyle = { boxShadow: `0 0 10px 2px ${shadows[colorIndex]}` };
                                               textClass = "absolute text-[10px] font-bold text-white z-10";
                                               textStyle = { textShadow: textShadows[colorIndex] };
                                             }
                                             
                                             return (
                                               <>
                                                 <div className={gemClass} style={gemStyle}></div>
                                                 <span className={textClass} style={textStyle}>{gems}</span>
                                                 {userRank === 0 && (
                                                   <span className="absolute -top-2 -right-2 text-[8px] animate-bounce">✨</span>
                                                 )}
                                               </>
                                             );
                                           })()}
                                         </div>
                                       </div>
                                     </div>
                                    <div className="bg-black/50 backdrop-blur-sm p-3 rounded-lg border border-green-900/30" style={{ boxShadow: 'inset 0 0 10px rgba(0, 255, 128, 0.1)' }}>
                                      <div className="text-xs text-gray-400">XP to Next Level</div>
                                      <div className="text-sm">{100 - ((user.xp || 0) % 100)}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get the next badge based on XP
function getNextBadge(xp) {
  if (xp >= 1000) return "You've reached the highest badge!";
  if (xp >= 750) return "Coding Master (1000+ XP)";
  if (xp >= 500) return "Advanced Developer (750+ XP)";
  if (xp >= 250) return "Skilled Programmer (500+ XP)";
  return "Code Enthusiast (250+ XP)";
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
}
