import React from "react";
import { motion } from "framer-motion";
import MonacoEditorPane from "./MonacoEditorPane";

export default function EditorPanel({
  code,
  setCode,
  language,
  theme = "vs-dark",
  title = "Code Editor"
}) {
  return (
    
    <motion.div
      className="flex-1 h-full w-full flex flex-col rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-lg border-b border-white/20 px-4 py-2">
        <div className="flex items-center gap-3">
          <span className="text-lg">💻</span>
          <h2 className="font-semibold text-white tracking-wide">{title}</h2>
          <span className="px-2 py-0.5 text-xs rounded-md bg-white/10 border border-white/20 text-white/70">
            {language.toUpperCase()}
          </span>
        </div>

        {/* Placeholder for future controls */}
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-xs rounded-md bg-white/10 border border-white/20 hover:bg-white/20 transition">
            Theme
          </button>
          <button className="px-3 py-1 text-xs rounded-md bg-white/10 border border-white/20 hover:bg-white/20 transition">
            AI Assist
          </button>
        </div>
      </div>

      {/* Monaco Editor Glass Container */}
      <div className="w-full h-full bg-white/5 backdrop-blur-lg border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] flex-1">
        <MonacoEditorPane
          code={code}
          setCode={setCode}
          language={language}
          theme={theme}
        />
      </div>
    </motion.div>
  );
}
