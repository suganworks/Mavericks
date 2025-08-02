import React from "react";
import { motion } from "framer-motion";
import { moods } from "../data/moods";

export default function VibeSelector({ mood, setMood, vibeEnabled }) {
  return (
    <motion.div 
      className="glass-accent rounded-2xl p-6 relative group"
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      {/* Liquid border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"></div>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full pulse-glow"></div>
          <h3 className="font-bold text-xl glass-text">🎧 Vibe Selection</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(moods).map(([moodName, moodData]) => (
            <motion.button
              key={moodName}
              onClick={() => setMood(moodName)}
              className={`glass-button p-4 rounded-xl text-left transition-all duration-300 ${
                mood === moodName 
                  ? 'ring-2 ring-white/30 shadow-glow-hover' 
                  : 'hover:shadow-glow'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!vibeEnabled}
            >
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${moodData.color}`}></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{moodName}</h4>
                  <p className="text-xs text-white/70 mt-1">{moodData.description}</p>
                </div>
                {mood === moodName && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
