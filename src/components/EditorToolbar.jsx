// src/components/EditorToolbar.jsx
import React from "react";
import LayoutSelector from "./LayoutSelector";
import LanguageSelector from "./LanguageSelector";

export default function EditorToolbar({
  layout,
  setLayout,
  language,
  setLanguage,
  theme,
  setTheme
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-gray-900/80 backdrop-blur-md p-3 border-b border-gray-700">
      
      {/* Layout Selector */}
      <LayoutSelector currentLayout={layout} setLayout={setLayout} />

      {/* Language Selector */}
      <LanguageSelector language={language} setLanguage={setLanguage} theme={theme} />

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition"
      >
        {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </div>
  );
}
