import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import MonacoEditor from "@monaco-editor/react";

// --- Config ---
const SUPABASE_URL = "https://bgnicypyisdjqkplveas.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnbmljeXB5aXNkanFrcGx2ZWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDQ5MTEsImV4cCI6MjA2OTU4MDkxMX0.2NwYJ6bdbQ_R62TOxN_rrRJ4qxhadqFlHS0iAx3tx1s"; // Replace
const GEMINI_API_KEY = "AIzaSyATQDLCeIjBnOMr8ZOEZ3P1NlYvMDYNVWM"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const moods = {
  neutral: "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif",
  running: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXNqZ3Y0Z2RkZ2w5a2ZqY2ZpZ3J5b3R4c3B6c3h6eXJtY3h5eHh5eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4KhVp1b2e4M2o2mQ/giphy.gif",
  success: "https://i.giphy.com/media/111ebonMs90YLu/giphy.gif",
  fail: "https://i.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif"
};

export default function CodeEditor() {
  const [problems, setProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("Select a problem to start coding.");
  const [mood, setMood] = useState(moods.neutral);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const fetchProblems = async () => {
      const { data, error } = await supabase.from("problems").select("*");
      if (error) {
        setOutput(`Error loading problems: ${error.message}`);
      } else {
        setProblems(data);
        if (data.length > 0) setCurrentProblem(data[0]);
      }
    };
    fetchProblems();
  }, []);

  const handleProblemChange = (id) => {
    const selected = problems.find((p) => p.id === id);
    setCurrentProblem(selected);
    setOutput("Ready to code for this problem.");
  };

  const runCode = async () => {
    if (!currentProblem || !code.trim()) {
      setOutput("⚠️ Please select a problem and write some code.");
      return;
    }
    if (!GEMINI_API_KEY) {
      setOutput("❌ Gemini API key missing.");
      return;
    }

    setIsRunning(true);
    setMood(moods.running);
    setOutput("⏳ Evaluating your code...");

    const testCasesText = currentProblem.test_cases
      ?.map((tc, i) => `Test Case ${i + 1}: Input: ${JSON.stringify(tc.input)}, Expected: ${tc.output}`)
      .join("\n");

    const prompt = `
You are a strict programming judge.
Evaluate the following ${language} code for the problem "${currentProblem.title}".

Problem:
${currentProblem.description}

Code:
\`\`\`${language}
${code}
\`\`\`

Test cases:
${testCasesText}

Return results in this format:
- provide the output log of the code, give actual output for each test case.
- "✅ Success! All test cases passed." if correct.
- "❌ Failed Test Case X: ..." if incorrect.
- "💥 Compilation Error: ..." if compile/runtime error.
`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Unknown error");

      const aiOutput = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!aiOutput) throw new Error("No response from AI.");

      if (aiOutput.includes("✅")) setMood(moods.success);
      else setMood(moods.fail);

      setOutput(aiOutput);
    } catch (err) {
      setMood(moods.fail);
      setOutput(`💥 API Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white font-sans">
      {/* Background */}
      <img src={mood} alt="bg" className="fixed top-0 left-0 w-full h-full object-cover z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>

      <div className="relative z-20 flex flex-col lg:flex-row h-screen p-4 gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/3 glass-panel p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Problems</h2>
          {problems.length > 0 && (
            <select
              className="w-full p-2 mb-4 bg-gray-900/70 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleProblemChange(e.target.value)}
              value={currentProblem?.id || ""}
            >
              {problems.map((p) => {
                let diffIcon = "🟢";
                if (p.difficulty?.toLowerCase() === "medium") {
                  diffIcon = "🟡";
                } else if (p.difficulty?.toLowerCase() === "hard") {
                  diffIcon = "🔴";
                }

                return (
                  <option
                    key={p.id}
                    value={p.id}
                    className="bg-gray-900 text-white p-2"
                  >
                    {diffIcon} {p.title}
                  </option>
                );
              })}
            </select>
          )}
          {currentProblem && (
            <>
              <h3 className="text-lg font-semibold">{currentProblem.title}</h3>
              <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">{currentProblem.description}</p>
              <h4 className="mt-4 font-semibold">Test Cases</h4>
              <div className="bg-gray-800/30 p-3 mt-2 rounded-lg border border-white/10">
                {currentProblem.test_cases?.map((tc, i) => (
                  <div key={i} className="mb-2 text-sm">
                    <strong>Input:</strong> {JSON.stringify(tc.input)} <br />
                    <strong>Expected:</strong> {tc.output}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Main */}
        <div className="lg:w-2/3 flex flex-col">
          <div className="glass-panel p-4 mb-4 flex justify-between items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800/50 p-2 rounded border border-gray-600"
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <button
              onClick={runCode}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-bold ${
                isRunning ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isRunning ? "Running..." : "Run Code"}
            </button>
          </div>

          <div className="glass-panel flex-1 overflow-hidden mb-4">
            <MonacoEditor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{ fontSize: 16, minimap: { enabled: false }, wordWrap: "on" }}
            />
          </div>

          {/* Console Output */}
          <div className="glass-panel p-4 h-30 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
            {output}
          </div>
        </div>
      </div>

      {/* Glass style */}
      <style>{`
        .glass-panel {
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
