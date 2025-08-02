import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LayoutSelector({ currentLayout, setLayout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const layouts = [
    { 
      id: "leetcode", 
      name: "Classic", 
      icon: "📋"
    },
    { 
      id: "fullscreen", 
      name: "Fullscreen Editor", 
      icon: "🖥️"
    },
    { 
      id: "split", 
      name: "Split Workspace", 
      icon: "⚖️"
    },
    { 
      id: "minimal", 
      name: "Minimal", 
      icon: "✨"
    },
    { 
      id: "studio", 
      name: "Studio Mode", 
      icon: "🎬"
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm flex items-center justify-between gap-2 min-w-[160px]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {layouts.find(l => l.id === currentLayout)?.icon}{" "}
        {layouts.find(l => l.id === currentLayout)?.name}
        <motion.svg
          className="w-4 h-4 ml-auto"
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-lg z-50"
          >
            {layouts.map(layout => (
              <button
                key={layout.id}
                onClick={() => {
                  setLayout(layout.id);
                  setIsOpen(false);
                }}
                className={`flex items-start gap-3 px-4 py-3 w-full text-left hover:bg-white/10 transition ${
                  currentLayout === layout.id ? "bg-blue-500/20 text-blue-400" : "text-white/90"
                }`}
              >
                <span className="text-lg mt-1">{layout.icon}</span>
                <div>
                  <div className="font-medium">{layout.name}</div>
                  <div className="text-xs text-white/60 leading-snug">{layout.description}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
