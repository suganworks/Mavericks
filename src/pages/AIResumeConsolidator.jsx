import React, { useState, useCallback } from "react";
import { Upload, ListChecks, Smile, CheckSquare, Loader2, AlertCircle, BookOpen, FileText } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min";

const GlassCard = ({ children, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-6 transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${className}`}
  >
    {children}
  </div>
);

const InfoCard = ({ icon, title, content }) => (
  <div className="opacity-0 animate-fadeInUp">
    <h3 className="text-lg font-semibold text-gray-100 flex items-center mb-3">
      <span className="bg-white/10 p-2 rounded-full mr-3 border border-white/20">{icon}</span>
      {title}
    </h3>
    <div className="pl-12 border-l-2 border-white/20 ml-4 text-gray-200">{content}</div>
  </div>
);

export default function App() {
  const [inputText, setInputText] = useState("");
  const [fileName, setFileName] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- File Upload ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setError("");
    setAnalysisResult(null);

    if (file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (ev) => setInputText(ev.target.result);
      reader.readAsText(file);
    } else if (file.type === "application/pdf") {
      try {
        const pdfData = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
        let extractedText = "";
        for (let i = 1; i <= pdfDoc.numPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items.map((it) => it.str).join(" ") + "\n";
        }
        setInputText(extractedText.trim());
      } catch (err) {
        setError("Error reading PDF. Please try again.");
      }
    } else {
      setError(`Unsupported file type: ${file.type}`);
    }
  };

  // --- Gemini API Call ---
  const callGeminiAPI = async (prompt) => {
    const apiKey = import.meta.env.VITE_GEMINI_KEY || "";
    if (!apiKey) throw new Error("Missing Gemini API key");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    };

    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : null;
  };

  // --- Analyze Resume ---
  const handleAnalyze = useCallback(async () => {
    if (!inputText.trim()) {
      setError("Please upload or paste text first.");
      return;
    }
    setLoading(true);
    setError("");
    setAnalysisResult(null);

    const prompt = `
You are a **career coach** and **HR expert**. Analyze this resume/profile text.

Return JSON:
{
  "summary": "Concise professional summary",
  "keyPoints": ["Important highlights"],
  "sentiment": "Positive|Negative|Neutral|Mixed",
  "actionItems": ["Specific improvements"],
  "suggestedJobRole": "Best suited role",
  "jobMatchPercentage": "Match % (0-100)",
  "areasOfDevelopment": ["Skills to improve"]
}

Be precise, industry-relevant, and non-generic.

Text:
---
${inputText}
---
`;

    try {
      const result = await callGeminiAPI(prompt);
      setAnalysisResult(result);
    } catch {
      setError("Analysis failed. Check API key & connection.");
    } finally {
      setLoading(false);
    }
  }, [inputText]);

  return (
    <div className="min-h-screen relative bg-gray-900 text-gray-200 overflow-hidden">
      {/* GIF Background */}
      <div
        className="absolute top-0 left-0 w-full h-full -z-10 bg-cover bg-center animate-slowZoom"
        style={{
          backgroundImage: `url('https://media.giphy.com/media/xT1XGYy9NPhWRPp2uA/giphy.gif')`
        }}
      />
      {/* Dark overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/70 backdrop-blur-sm -z-10" />

      {/* Page Content */}
      <div className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Title */}
        <header className="text-center animate-fadeInDown">
          <h1 className="text-4xl font-bold">AI Resume & Career Analyzer</h1>
          <p className="text-gray-300">Upload your resume or text to get career insights & improvement areas</p>
        </header>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Input */}
          <GlassCard>
            <label className="block mb-2">Upload Document</label>
            <input type="file" accept=".txt,.pdf" onChange={handleFileChange} className="mb-4" />
            {fileName && <p className="text-sm text-gray-400 mb-4">File: {fileName}</p>}

            <label className="block mb-2">Or Paste Text</label>
            <textarea
              rows="10"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/20 resize-none"
              placeholder="Paste resume or text here..."
            />

            <button
              onClick={handleAnalyze}
              disabled={loading || !inputText}
              className="mt-4 px-6 py-2 w-full bg-indigo-500/70 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 transition-all duration-300"
            >
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </GlassCard>

          {/* Right: Output */}
          <GlassCard className="max-h-[75vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Results</h2>
            {error && <p className="text-red-400">{error}</p>}
            {loading && <Loader2 className="animate-spin w-6 h-6 text-white" />}
            {analysisResult && (
              <div className="space-y-6">
                {analysisResult.summary && (
                  <InfoCard icon={<BookOpen className="w-5 h-5 text-purple-300" />} title="Summary" content={<p>{analysisResult.summary}</p>} />
                )}
                {analysisResult.keyPoints?.length > 0 && (
                  <InfoCard
                    icon={<ListChecks className="w-5 h-5 text-blue-300" />}
                    title="Key Points"
                    content={<ul className="list-disc list-inside">{analysisResult.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>}
                  />
                )}
                {analysisResult.sentiment && (
                  <InfoCard icon={<Smile className="w-5 h-5 text-green-300" />} title="Sentiment" content={<p>{analysisResult.sentiment}</p>} />
                )}
                {analysisResult.actionItems?.length > 0 && (
                  <InfoCard
                    icon={<CheckSquare className="w-5 h-5 text-yellow-300" />}
                    title="Action Items"
                    content={<ul className="list-disc list-inside">{analysisResult.actionItems.map((a, i) => <li key={i}>{a}</li>)}</ul>}
                  />
                )}
                {analysisResult.suggestedJobRole && (
                  <InfoCard
                    icon={<FileText className="w-5 h-5 text-orange-300" />}
                    title="Suggested Job Role"
                    content={<p>{analysisResult.suggestedJobRole} ({analysisResult.jobMatchPercentage || 0}%)</p>}
                  />
                )}
                {analysisResult.areasOfDevelopment?.length > 0 && (
                  <InfoCard
                    icon={<AlertCircle className="w-5 h-5 text-red-300" />}
                    title="Areas of Development"
                    content={<ul className="list-disc list-inside">{analysisResult.areasOfDevelopment.map((a, i) => <li key={i}>{a}</li>)}</ul>}
                  />
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slowZoom { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease forwards; }
        .animate-fadeInDown { animation: fadeInDown 0.8s ease forwards; }
        .animate-slowZoom { animation: slowZoom 20s ease-in-out infinite alternate; }
        `}
      </style>
    </div>
  );
}
