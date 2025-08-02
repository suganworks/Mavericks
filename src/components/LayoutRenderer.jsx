// src/components/LayoutRenderer.jsx
import React from "react";
import EditorPanel from "./EditorPanel";
import TerminalOutput from "./TerminalOutput";
import ProblemDescription from "./ProblemDescription";
import AIFeedback from "./AIFeedback";

export default function LayoutRenderer({
  layout,
  glass,
  glassButton,
  code,
  setCode,
  language,
  logs,
  setLogs,
  runCode,
  getAIFeedback,
  theme
}) {
  const submitCode = async () => {
    try {
      const res = await fetch("http://localhost:5000/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code })
      });
      const data = await res.json();
      setLogs(`${data.message || "✅ Submitted"}\n\n${data.output || ""}`);
    } catch (err) {
      setLogs(`❌ Submit failed: ${err.message}`);
    }
  };

  const EditorTile = () => (
    <div
      className={`${glass} rounded-2xl overflow-hidden flex flex-col`}
      style={{ minHeight: "500px", height: "100%" }}
    >
      {/* Monaco Editor */}
      <div className="flex-1 min-h-[400px]">
        <EditorPanel
          code={code}
          setCode={setCode}
          language={language}
          height="100%"
        />
      </div>

      {/* Run + Submit Buttons */}
      <div className="flex justify-end gap-3 p-4 border-t border-white/10">
        <button onClick={runCode} className={glassButton}>
          ▶ Run
        </button>
        <button onClick={submitCode} className={glassButton}>
          📤 Submit
        </button>
      </div>
    </div>
  );

  const OutputTile = () => (
    <div
      className={`${glass} rounded-2xl p-4 max-h-[300px] overflow-y-auto`}
      style={{ minHeight: "200px" }}
    >
      <TerminalOutput glass={glass} logs={logs} />
    </div>
  );

  const ProblemTile = () => (
    <div className={`${glass} rounded-2xl p-4`} style={{ minHeight: "200px" }}>
      <ProblemDescription theme={theme} />
    </div>
  );

  const AIFeedbackTile = () => (
    <div className={`${glass} rounded-2xl p-4`} style={{ minHeight: "200px" }}>
      <AIFeedback code={code} language={language} theme={theme} />
    </div>
  );

  return (
    <div className="w-full p-6 overflow-y-auto space-y-6">
      {/* LeetCode Layout */}
      {layout === "leetcode" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <ProblemTile />
            <AIFeedbackTile />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <EditorTile />
            <OutputTile />
          </div>
        </div>
      )}

      {/* Fullscreen Layout */}
      {layout === "fullscreen" && (
        <div className="space-y-6">
          <EditorTile />
          <OutputTile />
        </div>
      )}

      {/* Split Layout */}
      {layout === "split" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ProblemTile />
            <AIFeedbackTile />
          </div>
          <div className="space-y-6">
            <EditorTile />
            <OutputTile />
          </div>
        </div>
      )}

      {/* Minimal Layout */}
      {layout === "minimal" && (
        <div className="max-w-6xl mx-auto space-y-6">
          <EditorTile />
          <OutputTile />
        </div>
      )}

      {/* Studio Layout */}
      {layout === "studio" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <ProblemTile />
            <AIFeedbackTile />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <EditorTile />
            <OutputTile />
          </div>
        </div>
      )}
    </div>
  );
}
