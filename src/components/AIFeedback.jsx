import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function AIFeedback({ code, language, theme = "dark" }) {
  const [activeTab, setActiveTab] = useState("suggestions");
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const tabs = [
    { id: "suggestions", label: "AI Suggestions", icon: "💡" },
    { id: "optimize", label: "Optimize", icon: "⚡" },
    { id: "explain", label: "Explain", icon: "📖" },
    { id: "logic", label: "Logic Builder", icon: "🧠" }
  ];

  const generateAIFeedback = async (type) => {
    setIsLoading(true);
    setFeedback("");
    try {
      const res = await axios.post("http://localhost:5001/ai-feedback", {
        code,
        language,
        type
      });
      setFeedback(res.data.feedback);
    } catch (err) {
      console.error(err);
      setFeedback("⚠️ Error getting AI feedback");
    }
    setIsLoading(false);
  };

  return (
    <div className={`glass-${theme === "light" ? "secondary" : "primary"} rounded-2xl overflow-hidden flex-1 relative group`}>
      <div className="p-6 h-full flex flex-col">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                generateAIFeedback(tab.id);
              }}
              className={`glass-button px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? "ring-2 ring-white/30 shadow-glow-hover" : "hover:shadow-glow"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <p className="text-sm text-white/70">AI is analyzing your code...</p>
              </div>
            </div>
          ) : (
            <motion.pre
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full text-sm font-mono leading-relaxed whitespace-pre-wrap"
            >
              {feedback || "Click a tab to get AI feedback"}
            </motion.pre>
          )}
        </div>
      </div>
    </div>
  );
}
