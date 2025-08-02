import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LanguageSelector from "./LanguageSelector";
import MoodSelector from "./MoodSelector";
import LayoutSelector from "./LayoutSelector";
import LayoutRenderer from "./LayoutRenderer";
import { moods } from "../assets/moods";
import { runCode } from "../utils/runCode";

export default function App() {
  const [layout, setLayout] = useState(localStorage.getItem("layout") || "leetcode");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "javascript");
  const [mood, setMood] = useState(localStorage.getItem("mood") || "Galaxy Night");
  const [code, setCode] = useState(
    localStorage.getItem("code") ||
      `// Welcome to Liquid Glass Code Editor! 🚀

function example() {
  console.log("Hello, Liquid Glass!");
}`
  );
  const [logs, setLogs] = useState(localStorage.getItem("logs") || "✨ System ready...");

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("layout", layout);
    localStorage.setItem("language", language);
    localStorage.setItem("mood", mood);
    localStorage.setItem("code", code);
    localStorage.setItem("logs", logs);
  }, [layout, language, mood, code, logs]);

  const handleRunCode = async () => {
    await runCode(language, code, setLogs);
  };

  const handleSubmitCode = async () => {
    try {
      const res = await fetch("http://localhost:5000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code })
      });
      const data = await res.json();
      setLogs(`${data.message || "✅ Code submitted successfully"}\n\n${data.output || ""}`);
    } catch (err) {
      setLogs(`❌ Submit failed: ${err.message}`);
    }
  };

  const getAIFeedback = () => {
    console.log("Getting AI feedback...");
  };

  const glass = "bg-white/5 backdrop-blur-md border border-white/10 rounded-lg font-code";
  const glassButton =
    "bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg text-white font-medium text-sm tracking-wide hover:bg-white/20 transition";

  return (
    <div className="min-h-screen w-full relative font-code text-white">
      {/* Background GIF */}
      {moods[mood]?.gif && (
        <div
          className="fixed inset-0 -z-50 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${moods[mood].gif})` }}
        />
      )}

      {/* Small Blur Overlay for Readability */}
      <div className="fixed inset-0 bg-black/30 -z-40"></div>

      {/* Header */}
      <motion.header
        className="relative z-10 border-b border-white/10 px-6 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LG</span>
            </div>
            <h1 className="font-bold text-2xl tracking-wide">Liquid Glass</h1>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSelector language={language} setLanguage={setLanguage} />
            <LayoutSelector currentLayout={layout} setLayout={setLayout} />
            <MoodSelector currentMood={mood} setMood={setMood} />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={layout}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="p-6"
        >
          <LayoutRenderer
            layout={layout}
            glass={glass}
            glassButton={glassButton}
            code={code}
            setCode={setCode}
            language={language}
            setLanguage={setLanguage}
            logs={logs}
            setLogs={setLogs}
            runCode={handleRunCode}
            submitCode={handleSubmitCode}
            getAIFeedback={getAIFeedback}
            aiAppreciation=""
            aiImprovement=""
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
