import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";
import ParticleBackground from "../components/ParticleBackground";
import FuturisticBackground from "../components/FuturisticBackground";
import './leaderboard.css';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("xp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch & sorting effects
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .order(sortBy, { ascending: sortOrder === "asc" });
        if (fetchError) throw fetchError;
        const transformed = (data || []).map(u => {
          if (!u.skills || !Array.isArray(u.skills) || u.skills.length === 0) {
            return { ...u, skills: generateRandomSkills() };
          }
            return u;
        });
        setUsers(transformed);
      } catch (e) {
        console.error(e);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [sortBy, sortOrder]);

  useEffect(() => {
    setSortBy("xp");
    setSortOrder("desc");
  }, []);

  // Utilities
  const possibleSkills = ["JavaScript","React","Node.js","Python","CSS","HTML","TypeScript","SQL","MongoDB","AWS","Docker","Git"]; 
  function generateRandomSkills() {
    const num = Math.floor(Math.random() * 5) + 1;
    const picked = [];
    for (let i = 0; i < num; i++) {
      const name = possibleSkills[Math.floor(Math.random() * possibleSkills.length)];
      if (picked.some(s => s.name === name)) continue;
      picked.push({ name, level: Math.floor(Math.random() * 5) + 1 });
    }
    return picked;
  }

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  }

  function getSortIcon(column) {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    );
  }

  const badgeDefs = {
    "Rookie Coder": { color: "from-blue-400 to-blue-600", icon: "👶", description: "Just starting the coding journey" },
    "Code Enthusiast": { color: "from-green-400 to-green-600", icon: "🌱", description: "Showing dedication with 250+ XP" },
    "Skilled Programmer": { color: "from-yellow-400 to-yellow-600", icon: "⭐", description: "Demonstrated skill with 500+ XP" },
    "Advanced Developer": { color: "from-orange-400 to-orange-600", icon: "🔥", description: "Reached advanced status with 750+ XP" },
    "Coding Master": { color: "from-purple-400 to-purple-600", icon: "👑", description: "Achieved mastery with 1000+ XP" }
  };

  function renderBadge(name) {
    const b = badgeDefs[name] || badgeDefs["Rookie Coder"]; 
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${b.color} text-white text-xs font-bold shadow-lg`}>
        <span className="mr-1">{b.icon}</span>{name}
      </div>
    );
  }

  const skillColors = {
    1: "bg-gray-700 text-gray-300",
    2: "bg-blue-700 text-blue-300",
    3: "bg-green-700 text-green-300",
    4: "bg-yellow-700 text-yellow-300",
    5: "bg-purple-700 text-purple-300"
  };

  function renderSkillBadges(skills) {
    if (!skills || !skills.length) return <span className="text-gray-500">-</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {skills.slice(0,3).map((s,i) => (
          <span key={i} className={`px-2 py-0.5 rounded-full text-xs ${skillColors[s.level] || skillColors[1]}`}>{s.name} {s.level && `(${s.level})`}</span>
        ))}
        {skills.length > 3 && <span className="px-2 py-0.5 rounded-full bg-gray-700 text-gray-300 text-xs">+{skills.length - 3} more</span>}
      </div>
    );
  }

  function renderGems(xp, userRank) {
    const gems = Math.floor((xp || 0) / 100);
    if (gems === 0) return <span className="text-gray-500">-</span>;
    const colors = [
      { gradient: "from-purple-500 to-indigo-600", shadow: "rgba(130,0,255,0.3)", css: "gem-purple", text: "0 0 5px #a855f7,0 0 10px #6366f1" },
      { gradient: "from-blue-500 to-cyan-600", shadow: "rgba(0,130,255,0.3)", css: "gem-blue", text: "0 0 5px #3b82f6,0 0 10px #0891b2" },
      { gradient: "from-emerald-500 to-teal-600", shadow: "rgba(0,200,150,0.3)", css: "gem-green", text: "0 0 5px #10b981,0 0 10px #0d9488" },
      { gradient: "from-amber-500 to-yellow-600", shadow: "rgba(250,200,0,0.3)", css: "gem-yellow", text: "0 0 5px #f59e0b,0 0 10px #ca8a04" },
      { gradient: "from-rose-500 to-pink-600", shadow: "rgba(255,0,130,0.3)", css: "gem-pink", text: "0 0 5px #f43f5e,0 0 10px #db2777" }
    ];
    const idx = gems % colors.length;
    let gemClass = `absolute w-7 h-7 transform bg-gradient-to-br ${colors[idx].gradient} border border-white/30 shadow-lg gem-glow ${colors[idx].css}`;
    let gemStyle = { boxShadow: `0 0 10px 2px ${colors[idx].shadow}` };
    let textClass = "absolute text-xs font-bold text-white z-10";
    let textStyle = { textShadow: colors[idx].text };
    if (userRank === 0) { gemClass = "absolute w-8 h-8 transform gem-rank-1 border border-yellow-300/50 z-0"; gemStyle={}; textClass+=" animate-pulse"; textStyle={ textShadow:"0 0 8px rgba(255,215,0,0.8)"}; }
    else if (userRank === 1) { gemClass = "absolute w-7 h-7 transform gem-rank-2 border border-gray-300/50 z-0"; gemStyle={}; textStyle={ textShadow:"0 0 6px rgba(192,192,192,0.8)"}; }
    else if (userRank === 2) { gemClass = "absolute w-7 h-7 transform gem-rank-3 border border-amber-500/50 z-0"; gemStyle={}; textStyle={ textShadow:"0 0 5px rgba(205,127,50,0.8)"}; }
    return (
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className={gemClass} style={gemStyle}></div>
          <span className={textClass} style={textStyle}>{gems}</span>
          {userRank === 0 && <span className="absolute -top-2 -right-2 text-xs animate-bounce">✨</span>}
        </div>
      </div>
    );
  }

  function handleUserClick(user) {
    setSelectedUser(selectedUser?.id === user.id ? null : user);
  }
  // Split users into top 3 and the rest
  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="min-h-screen bg-[#05040a] text-white relative overflow-hidden font-sans selection:bg-cyan-400/30 selection:text-cyan-200">
      {/* Background Layers */}
      <ParticleBackground />
      <FuturisticBackground />

      {/* Glowing orbs - darker versions */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-900/15 blur-3xl animate-pulse"></div>
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-900/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="fixed top-1/3 right-1/4 w-48 h-48 rounded-full bg-cyan-900/15 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      <div className="fixed bottom-1/3 left-1/3 w-72 h-72 rounded-full bg-indigo-900/15 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-2/3 right-1/3 w-56 h-56 rounded-full bg-violet-900/15 blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <motion.h1 
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-center mb-4 drop-shadow-[0_0_25px_rgba(120,0,255,0.35)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-indigo-400 bg-[length:300%_300%] animate-[gradientShift_8s_ease_infinite]">
            Leaderboard
          </span>
        </motion.h1>

        <motion.p 
          className="text-gray-400/80 text-center mb-12 text-sm md:text-base tracking-wide backdrop-blur-sm px-4 py-2 inline-block rounded-full bg-white/5 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Top coders ranked by experience, skills, and achievements
        </motion.p>

        {/* Podium for Top 3 (center taller winner, left 2nd, right 3rd) */}
        {!loading && !error && topThree.length > 0 && (
          <div className="flex justify-center items-end gap-12 mb-20 px-6 relative">
            {/* Decorative connecting lines */}
            <div className="absolute inset-x-0 bottom-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {[
              topThree[1] ? { user: topThree[1], rank: 2, originalIndex: 1 } : null,
              topThree[0] ? { user: topThree[0], rank: 1, originalIndex: 0 } : null,
              topThree[2] ? { user: topThree[2], rank: 3, originalIndex: 2 } : null,
            ].filter(Boolean).map(slot => {
              const { user, rank, originalIndex } = slot;
              const isWinner = rank === 1;
              const avatarSize = isWinner ? 'w-32 h-32' : 'w-28 h-28';
              const dropOffset = rank === 1 ? 'mt-0' : rank === 2 ? 'mt-8' : 'mt-10';
              const avatarBorder = rank === 1
                ? 'border-yellow-400 bg-gradient-to-br from-yellow-300 to-yellow-500'
                : rank === 2
                ? 'border-gray-400 bg-gradient-to-br from-gray-300 to-gray-500'
                : 'border-amber-500 bg-gradient-to-br from-amber-400 to-amber-700';
              const nameColor = rank === 1 ? 'text-yellow-300' : rank === 2 ? 'text-gray-300' : 'text-amber-500';
              const pedestalHeight = isWinner ? 'h-24' : (rank === 2 ? 'h-16' : 'h-14');
              const pedestalGradient = rank === 1
                ? 'from-yellow-500/70 to-yellow-700/40'
                : rank === 2
                ? 'from-gray-400/60 to-gray-600/30'
                : 'from-amber-500/60 to-amber-700/30';
              return (
                <motion.div
                  key={user.id}
                  className={`group flex flex-col items-center justify-end relative ${isWinner ? 'z-10 scale-105' : 'z-0'} transition-all`}
                  style={{ minWidth: isWinner ? 190 : 160 }}
                  whileHover={{ y: -8, rotateX: 6, rotateY: -6 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                >
                  {/* Pedestal */}
                  <div className={`flex flex-col items-center justify-end ${pedestalHeight} relative perspective-[1200px]`}> 
                    <div className={`absolute bottom-0 w-28 rounded-t-2xl bg-gradient-to-b ${pedestalGradient} backdrop-blur-md border border-white/10 shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.15)] before:absolute before:inset-0 before:rounded-t-2xl before:bg-[linear-gradient(135deg,rgba(255,255,255,0.25),transparent_55%)] overflow-hidden`}>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-white/60 via-white/20 to-transparent opacity-70"></div>
                    </div>
                    {/* Avatar */}
                    <div className={`relative ${dropOffset} ${avatarSize} rounded-[1.75rem] flex items-center justify-center text-4xl font-extrabold shadow-[0_10px_35px_-8px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.25)] border-4 ${avatarBorder} ring-2 ring-white/20 backdrop-blur-md group-hover:shadow-[0_16px_50px_-10px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.35)] transition-all`}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                      {isWinner && <span className="absolute -top-5 -right-3 text-3xl animate-bounce drop-shadow-[0_0_12px_rgba(255,215,0,0.8)]">👑</span>}
                      <span className="absolute inset-0 rounded-[1.4rem] bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.35),transparent_60%)] mix-blend-overlay" />
                    </div>
                  </div>
                  {/* Info */}
                  <div className={`mt-5 font-semibold text-center ${nameColor} max-w-[160px] truncate tracking-wide drop-shadow`}>{user.username || 'Anonymous'}</div>
                  <div className="text-xs text-gray-400 mb-1 max-w-[150px] truncate">{user.email || '-'}</div>
                  <div className="font-mono text-cyan-300 font-bold bg-cyan-900/40 px-3 py-1 rounded-lg inline-block mb-1 text-[13px] shadow-[0_0_0_1px_rgba(0,255,255,0.25),0_6px_18px_-6px_rgba(0,255,255,0.25)] backdrop-blur-md">
                    <span className="text-xs text-cyan-300 mr-1">XP</span>{user.xp || 0}
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/30 via-fuchsia-500/30 to-purple-500/30 text-white text-[11px] font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_8px_25px_-10px_rgba(99,102,241,0.6)] border border-white/10 mb-1 backdrop-blur-md">
                    <span className="text-[10px] font-bold text-cyan-200">LVL</span><span className="tracking-wide">{user.level || 1}</span>
                  </div>
                  <div className="mb-1">{renderBadge(user.badge || 'Rookie Coder')}</div>
                  <div className="mb-1">{renderSkillBadges(user.skills)}</div>
                  <div className="mb-1">{renderGems(user.xp || 0, originalIndex)}</div>
                  <div className="font-bold text-sm mt-3 text-center whitespace-nowrap tracking-wide drop-shadow">
                    {rank === 1 ? '🥇 Champion' : rank === 2 ? '🥈 Runner-up' : '🥉 Third Place'}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Table for the rest */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-center">
            {error}
          </div>
        ) : (
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_30px_80px_-20px_rgba(0,0,0,0.65)] glassmorphism relative before:absolute before:inset-0 before:pointer-events-none before:bg-[linear-gradient(145deg,rgba(255,255,255,0.15),transparent_60%)]">
            <div className="overflow-x-auto">
        <table className="w-full text-sm">
                <thead>
          <tr className="bg-gradient-to-r from-white/5 via-fuchsia-500/10 to-cyan-500/10 backdrop-filter backdrop-blur-sm text-gray-300 text-[10px] uppercase tracking-wider border-b border-white/10">
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
                  {rest.map((user, index) => (
                    <React.Fragment key={user.id}>
                      <motion.tr 
                        className={
                          'border-b border-white/10 hover:bg-white/5 cursor-pointer transition-all ' +
                          (selectedUser?.id === user.id ? 'bg-white/10 backdrop-blur-md shadow-inner' : '')
                        }
                        onClick={() => handleUserClick(user)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whilehover={{ scale: 1.015 }}
                        style={{ position: 'relative' }}
                      >
                        <td className="px-6 py-4 relative">
                          <div className="flex items-center justify-center h-full">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500/30 to-cyan-500/30 backdrop-blur-md text-white font-bold shadow-md border border-white/15 relative z-10">
                              {index + 4}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold mr-3 shadow-[0_0_0_1px_rgba(255,255,255,0.25)] border border-white/10 relative bg-gradient-to-br from-fuchsia-500 via-indigo-500 to-cyan-500">
                              {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <div className="font-semibold flex items-center">
                                <div className="truncate">{user.username || 'Anonymous'}</div>
                              </div>
                              <div className="text-xs text-gray-400">{user.email || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-cyan-300 font-bold bg-cyan-900/30 px-3 py-1 rounded-md backdrop-blur-sm inline-block shadow-[0_0_0_1px_rgba(0,255,255,0.25)]">
                            <span className="text-[10px] text-cyan-200 mr-1">XP</span>
                            {user.xp || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/30 via-fuchsia-500/30 to-purple-500/30 text-white text-[11px] font-semibold shadow-[0_0_0_1px_rgba(255,255,255,0.15)] border border-white/10 backdrop-blur-sm" style={{ backgroundSize: '220% 220%', animation: 'gradientAnimation 5s ease infinite' }}>
                            <span className="text-[10px] font-bold text-cyan-200">LVL</span>
                            <span className="tracking-wide">{user.level || 1}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {renderBadge(user.badge || 'Rookie Coder')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">{renderSkillBadges(user.skills)}</div>
                        </td>
                        <td className="px-6 py-4">
                          {renderGems(user.xp || 0, index + 3)}
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
                            <td colSpan="7" className="px-6 py-6 bg-gradient-to-br from-white/5 to-white/0">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Badge Details */}
                                <div className="relative group bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_25px_60px_-25px_rgba(0,0,0,0.6)] overflow-hidden">
                                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_60%)]" />
                                  <h3 className="text-base font-semibold mb-3 text-fuchsia-300 tracking-wide">Badge Details</h3>
                                  <div className="flex items-center mb-4">
                                    {renderBadge(user.badge || 'Rookie Coder')}
                                  </div>
                                  <p className="text-xs text-gray-300 leading-relaxed min-h-[46px]">
                                    {badgeDefs[user.badge || 'Rookie Coder']?.description || 'Complete challenges to earn badges'}
                                  </p>
                                  <div className="mt-4 text-[11px] text-gray-400 font-mono">
                                    Next badge: {getNextBadge(user.xp || 0)}
                                  </div>
                                </div>
                                {/* Skills Breakdown */}
                                <div className="relative group bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_25px_60px_-25px_rgba(0,0,0,0.6)] overflow-hidden">
                                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_60%)]" />
                                  <h3 className="text-base font-semibold mb-3 text-cyan-300 tracking-wide">Skills Breakdown</h3>
                                  <div className="space-y-2">
                                    {user.skills && user.skills.length > 0 ? (
                                      user.skills.map((skill, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs">
                                          <span>{skill.name}</span>
                                          <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                              <div
                                                key={i}
                                                className={`w-2 h-2 rounded-full mx-0.5 ${i < skill.level ? 'bg-cyan-400' : 'bg-gray-700'}`}
                                              />
                                            ))}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-gray-400">No skills data available</p>
                                    )}
                                  </div>
                                </div>
                                {/* Activity Stats */}
                                <div className="relative group bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_25px_60px_-25px_rgba(0,0,0,0.6)] overflow-hidden">
                                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.12),transparent_60%)]" />
                                  <h3 className="text-base font-semibold mb-3 text-emerald-300 tracking-wide">Activity Stats</h3>
                                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                                    <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-inner">
                                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">Joined</div>
                                      <div className="text-xs font-medium mt-0.5">{formatDate(user.created_at)}</div>
                                    </div>
                                    <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-inner">
                                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">Last Active</div>
                                      <div className="text-xs font-medium mt-0.5">{formatDate(user.updated_at || user.created_at)}</div>
                                    </div>
                                    <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-inner">
                                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">Gems</div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <div className="relative w-6 h-6 flex items-center justify-center">
                                          {(() => {
                                            const gems = Math.floor((user.xp || 0) / 100);
                                            const colorIndex = gems % 5;
                                            const gemClasses = [
                                              'from-purple-500 to-indigo-600 gem-purple',
                                              'from-blue-500 to-cyan-600 gem-blue',
                                              'from-emerald-500 to-teal-600 gem-green',
                                              'from-amber-500 to-yellow-600 gem-yellow',
                                              'from-rose-500 to-pink-600 gem-pink'
                                            ];
                                            const gradients = gemClasses[colorIndex];
                                            return gems === 0 ? <span className="text-gray-500">-</span> : (
                                              <>
                                                <div className={`absolute w-5 h-5 transform rotate-45 bg-gradient-to-br ${gradients} border border-white/30 shadow-lg gem-glow`} />
                                                <span className="absolute text-[10px] font-bold text-white z-10" style={{ textShadow: '0 0 5px rgba(255,255,255,0.6)' }}>{gems}</span>
                                              </>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-inner">
                                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">Next Level</div>
                                      <div className="text-xs font-medium mt-0.5">{100 - ((user.xp || 0) % 100)}</div>
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
