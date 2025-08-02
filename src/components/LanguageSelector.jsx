// src/components/LanguageSelector.jsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LanguageSelector({ language, setLanguage, theme = "dark" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { value: "javascript", label: "JavaScript", icon: "🟨" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "cpp", label: "C++", icon: "⚡" },
    { value: "java", label: "Java", icon: "☕" },
    { value: "typescript", label: "TypeScript", icon: "🔷" },
    { value: "html", label: "HTML", icon: "🌐" },
    { value: "css", label: "CSS", icon: "🎨" }
  ];

  const currentLanguage = languages.find(lang => lang.value === language) || languages[0];

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
        className="glass-select px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 min-w-[140px] justify-between"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2">
          <span>{currentLanguage.icon}</span>
          <span>{currentLanguage.label}</span>
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
            className="absolute top-full left-0 mt-2 w-full z-[100]"
          >
            <div className="glass-accent rounded-lg overflow-hidden shadow-xl border border-white/10">
              {languages.map((lang) => (
                <motion.button
                  key={lang.value}
                  onClick={() => {
                    setLanguage(lang.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors ${
                    language === lang.value
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'hover:bg-white/5 text-white/90 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">{lang.icon}</span>
                  <span>{lang.label}</span>
                  {language === lang.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto w-2 h-2 bg-blue-400 rounded-full"
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