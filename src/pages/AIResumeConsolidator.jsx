import React, { useState, useCallback } from "react";
import { Upload, ListChecks, Smile, CheckSquare, Loader2, AlertCircle, BookOpen, FileText } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";

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
  const [skillsExtracted, setSkillsExtracted] = useState([]);
  const { user } = useAuth();

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

  // --- Extract Skills from Resume ---
  const extractSkillsFromResume = async (resumeText) => {
    const prompt = `
You are a **technical recruiter** and **HR expert**. Extract technical skills and programming languages from this resume text.

Return JSON:
{
  "skills": [
    {
      "name": "skill_name",
      "level": "beginner|intermediate|advanced|expert"
    }
  ]
}

Focus on:
- Programming languages (JavaScript, Python, Java, C++, etc.)
- Frameworks and libraries (React, Node.js, Django, etc.)
- Databases (MySQL, PostgreSQL, MongoDB, etc.)
- Cloud platforms (AWS, Azure, GCP, etc.)
- Tools and technologies (Git, Docker, Kubernetes, etc.)
- Soft skills (Leadership, Communication, etc.)

Be precise and only include skills that are clearly mentioned or implied in the resume.

Text:
---
${resumeText}
---
`;

    try {
      const result = await callGeminiAPI(prompt);
      const skills = result?.skills || [];
      
      // Validate and clean skills data
      const validSkills = skills.filter(skill => 
        skill && 
        skill.name && 
        skill.level && 
        ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level)
      );
      
      console.log("Extracted skills:", validSkills);
      return validSkills;
    } catch (error) {
      console.error("Error extracting skills:", error);
      return [];
    }
  };

  // --- Update User Skills in Supabase ---
  const updateUserSkills = async (newSkills) => {
    if (!user?.id) {
      setError("User not authenticated. Please log in.");
      return false;
    }

    try {
      // First, try to get current user data
      let { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select('skills')
        .eq('id', user.id)
        .single();

      // If user doesn't exist in users table, create a new record
      if (fetchError && fetchError.code === 'PGRST116') {
                 // User doesn't exist, create new record
         const { data: newUser, error: insertError } = await supabase
           .from('users')
           .insert({
             id: user.id,
             email: user.email,
             username: user.email?.split('@')[0] || 'User',
             xp: 0,
             level: 1,
             badge: 'Rookie Coder',
             badge_description: 'Complete challenges to earn badges',
             preferred_mode: 'Classic',
             skills: newSkills
           })
           .select()
           .single();

        if (insertError) throw insertError;
        
        setSkillsExtracted(newSkills);
        return true;
      } else if (fetchError) {
        throw fetchError;
      }

      // User exists, merge skills
      const existingSkills = currentUser?.skills || [];
      const existingSkillNames = existingSkills.map(skill => skill.name.toLowerCase());
      
      const mergedSkills = [...existingSkills];
      
      newSkills.forEach(newSkill => {
        const existingIndex = existingSkillNames.indexOf(newSkill.name.toLowerCase());
        if (existingIndex === -1) {
          // Add new skill
          mergedSkills.push(newSkill);
        } else {
          // Update existing skill level if new level is higher
          const existingSkill = mergedSkills[existingIndex];
          const levelOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
          if (levelOrder[newSkill.level] > levelOrder[existingSkill.level]) {
            mergedSkills[existingIndex] = newSkill;
          }
        }
      });

      // Update user skills in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          skills: mergedSkills
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSkillsExtracted(newSkills);
      return true;
    } catch (error) {
      console.error("Error updating user skills:", error);
      console.error("User ID:", user?.id);
      console.error("User email:", user?.email);
      console.error("Error details:", error.message, error.code);
      setError(`Failed to update skills in database: ${error.message}`);
      return false;
    }
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
    setSkillsExtracted([]);

    try {
      // Extract skills first
      const extractedSkills = await extractSkillsFromResume(inputText);
      
      // Update user skills in Supabase
      if (extractedSkills.length > 0) {
        const success = await updateUserSkills(extractedSkills);
        if (!success) {
          console.error("Failed to save skills to profile");
          // Don't set error here as the analysis can still proceed
        }
      } else {
        console.log("No skills extracted from resume");
      }

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

      const result = await callGeminiAPI(prompt);
      setAnalysisResult(result);
    } catch (error) {
      setError("Analysis failed. Check API key & connection.");
    } finally {
      setLoading(false);
    }
  }, [inputText, user]);

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
            {!user && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-sm text-yellow-200">
                  ⚠️ Please log in to save extracted skills to your profile
                </p>
              </div>
            )}
            
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
            {skillsExtracted.length > 0 && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <h3 className="text-lg font-semibold text-green-300 mb-3 flex items-center">
                  <CheckSquare className="w-5 h-5 mr-2" />
                  Skills Extracted & Saved
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillsExtracted.map((skill, index) => (
                    <span 
                      key={index} 
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        skill.level === 'expert' ? 'bg-red-500/30 text-red-200' :
                        skill.level === 'advanced' ? 'bg-orange-500/30 text-orange-200' :
                        skill.level === 'intermediate' ? 'bg-yellow-500/30 text-yellow-200' :
                        'bg-blue-500/30 text-blue-200'
                      }`}
                    >
                      {skill.name} ({skill.level})
                    </span>
                  ))}
                </div>
                <p className="text-sm text-green-200 mt-2">
                  ✓ These skills have been added to your profile
                </p>
              </div>
            )}
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
