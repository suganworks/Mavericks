// src/components/MoodSelector.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { moods } from "../assets/moods";

export default function MoodSelector({ currentMood, setMood, theme = "dark" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selectedRef = useRef(null);

  const fallbackMood = Object.keys(moods)[0];
  const currentMoodData = moods[currentMood] || moods[fallbackMood];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-scroll to current mood when opening
  useEffect(() => {
    if (isOpen && selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-select px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 min-w-[140px] justify-between"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentMoodData.icon}</span>
          <span className="truncate">{currentMood}</span>
        </div>
        <motion.svg
          className="w-4 h-4"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 z-[100]"
          >
            <div className="glass-accent rounded-lg shadow-xl border border-white/10 custom-scroll">
              {Object.entries(moods).map(([moodName, moodData]) => (
                <motion.button
                  key={moodName}
                  ref={currentMood === moodName ? selectedRef : null} // attach ref for auto-scroll
                  onClick={() => {
                    setMood(moodName);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${
                    currentMood === moodName
                      ? "bg-blue-500/20 text-blue-400"
                      : "hover:bg-white/5 text-white/90 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">{moodData.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{moodName}</div>
                    <div className="text-xs text-white/60 truncate">
                      {moodData.description}
                    </div>
                  </div>
                  {currentMood === moodName && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-blue-400 rounded-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
