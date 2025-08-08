import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Editor from "@monaco-editor/react";
import useHackathonSecurity from "../hooks/useHackathonSecurity";
import { configureMonacoSecurity, getHackathonMonacoOptions } from "../utils/monacoSecurityConfig";
import HackathonSecurityWrapper from "../components/HackathonSecurityWrapper";

export default function ChallengeWorkspace() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { hackathonId } = location.state || {};

  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1 = MCQ, 2 = Coding
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // MCQ State
  const [mcqs, setMcqs] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [mcqTimeLeft, setMcqTimeLeft] = useState(600); // 10 minutes
  const [mcqSubmitted, setMcqSubmitted] = useState(false);

  // Coding State
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [codingTimeLeft, setCodingTimeLeft] = useState(0);
  const [codingSubmitted, setCodingSubmitted] = useState(false);
  const editorRef = useRef(null);

  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
  ];

  // Auth check
  useEffect(() => {
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);
    };
    initAuth();
  }, [navigate]);

  // MCQ Timer
  useEffect(() => {
    if (currentStep !== 1 || mcqSubmitted) return;

    const timer = setInterval(() => {
      setMcqTimeLeft((prev) => {
        if (prev <= 1) {
          submitMcq();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, mcqSubmitted]);

  // Coding Timer
  useEffect(() => {
    if (currentStep !== 2 || codingSubmitted) return;

    const timer = setInterval(() => {
      setCodingTimeLeft((prev) => {
        if (prev <= 1) {
          submitCoding();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, codingSubmitted]);

  // Get hackathon security state from wrapper
  const [isHackathonEnded, setIsHackathonEnded] = useState(false);

  // Load MCQ questions
  useEffect(() => {
    const loadMcqs = async () => {
      if (!challengeId) return;
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("hackathon_mcqs")
          .select("id,question,options,correct_answer")
          .eq("challenge_id", challengeId)
          .limit(10);

        if (error) throw error;
        setMcqs(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentStep === 1) {
      loadMcqs();
    }
  }, [challengeId, currentStep]);

  // Load coding problem
  useEffect(() => {
    const loadProblem = async () => {
      if (!challengeId) return;
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("hackathon_problems")
          .select("id,title,description,difficulty,test_cases,templates")
          .eq("challenge_id", challengeId)
          .single();

        if (error) throw error;
        setProblem(data);

        // Set timer based on difficulty
        const difficulty = (data.difficulty || "").toLowerCase();
        let timeMinutes = 10; // default
        if (difficulty.includes("medium")) timeMinutes = 20;
        else if (difficulty.includes("hard")) timeMinutes = 30;
        setCodingTimeLeft(timeMinutes * 60);

        // Set initial code
        if (data.templates && data.templates[language]) {
          setCode(data.templates[language]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentStep === 2) {
      loadProblem();
    }
  }, [challengeId, currentStep, language]);

  const submitMcq = async () => {
    if (mcqSubmitted || isHackathonEnded) return;
    setMcqSubmitted(true);

    try {
      // Calculate score
      let correctAnswers = 0;
      mcqs.forEach((mcq) => {
        if (mcqAnswers[mcq.id] === mcq.correct_answer) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / mcqs.length) * 100;

      // Save to database
      await supabase.from("hackathon_submissions").insert({
        user_id: user.id,
        challenge_id: challengeId,
        hackathon_id: hackathonId,
        type: "mcq",
        answers: mcqAnswers,
        score: score,
        time_taken: 600 - mcqTimeLeft,
      });

      // Update or create total score in hackathon_scores table
      const { data: existingScore } = await supabase
        .from("hackathon_scores")
        .select("total_score")
        .eq("user_id", user.id)
        .eq("hackathon_id", hackathonId)
        .single();

      const newTotalScore = (existingScore?.total_score || 0) + score;

      if (existingScore) {
        await supabase
          .from("hackathon_scores")
          .update({ total_score: newTotalScore })
          .eq("user_id", user.id)
          .eq("hackathon_id", hackathonId);
      } else {
        await supabase
          .from("hackathon_scores")
          .insert({
            user_id: user.id,
            hackathon_id: hackathonId,
            total_score: newTotalScore,
          });
      }

      // Move to coding step
      setCurrentStep(2);
      setMcqSubmitted(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const submitCoding = async () => {
    if (codingSubmitted || isHackathonEnded) return;
    setCodingSubmitted(true);

    try {
      // Evaluate the code submission
      let evaluationScore = 0;
      let evaluationOutput = "";

      try {
        const response = await fetch("/api/run-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.REACT_APP_API_KEY,
          },
          body: JSON.stringify({
            code,
            language,
            testCases: problem?.test_cases || [],
            mode: "evaluate",
            strictEvaluation: true,
            maxTestCases: 12,
          }),
        });

        const result = await response.json();
        if (result.success) {
          evaluationScore = result.score || 0;
          evaluationOutput = result.output || "";
        } else {
          evaluationScore = 0;
          evaluationOutput = `Evaluation failed: ${result.error}`;
        }
      } catch (err) {
        evaluationScore = 0;
        evaluationOutput = `Evaluation error: ${err.message}`;
      }

      // Save to database
      await supabase.from("hackathon_submissions").insert({
        user_id: user.id,
        challenge_id: challengeId,
        hackathon_id: hackathonId,
        type: "coding",
        code: code,
        language: language,
        output: evaluationOutput,
        score: evaluationScore,
        time_taken: (problem?.difficulty?.toLowerCase().includes("hard") ? 30 : 
                    problem?.difficulty?.toLowerCase().includes("medium") ? 20 : 10) * 60 - codingTimeLeft,
      });

      // Update or create total score in hackathon_scores table
      const { data: existingScore } = await supabase
        .from("hackathon_scores")
        .select("total_score")
        .eq("user_id", user.id)
        .eq("hackathon_id", hackathonId)
        .single();

      const newTotalScore = (existingScore?.total_score || 0) + evaluationScore;

      if (existingScore) {
        await supabase
          .from("hackathon_scores")
          .update({ total_score: newTotalScore })
          .eq("user_id", user.id)
          .eq("hackathon_id", hackathonId);
      } else {
        await supabase
          .from("hackathon_scores")
          .insert({
            user_id: user.id,
            hackathon_id: hackathonId,
            total_score: newTotalScore,
          });
      }

      // Navigate back to hackathon dashboard
      navigate(`/hackathons/${hackathonId}/dashboard`, {
        state: { message: `Challenge completed! Your score: ${evaluationScore} points` }
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const runCode = async () => {
    setOutput("Running code...");
    try {
      const response = await fetch("/api/run-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.REACT_APP_API_KEY,
        },
        body: JSON.stringify({
          code,
          language,
          testCases: problem?.test_cases?.slice(0, 4) || [],
          mode: "run",
          strictEvaluation: true,
          maxTestCases: 4,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setOutput(`✅ Code executed successfully!\n\nOutput:\n${result.output}`);
      } else {
        setOutput(`❌ Error: ${result.error}`);
      }
    } catch (err) {
      setOutput(`❌ Network error: ${err.message}`);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <HackathonSecurityWrapper
      hackathonId={hackathonId}
      onWarning={(warningCount, maxWarnings) => {
        setOutput(`⚠️ WARNING: Tab switching detected (${warningCount}/${maxWarnings}). Your submission will be auto-submitted if you continue.`);
      }}
      onAutoSubmit={() => {
        if (currentStep === 1 && !mcqSubmitted) {
          submitMcq();
        } else if (currentStep === 2 && !codingSubmitted) {
          submitCoding();
        }
      }}
      onHackathonEnded={() => {
        setOutput("🚨 Hackathon has ended! Submissions are now locked.");
        if (currentStep === 1 && !mcqSubmitted) {
          submitMcq();
        } else if (currentStep === 2 && !codingSubmitted) {
          submitCoding();
        }
      }}
      isActive={!mcqSubmitted && !codingSubmitted && !loading}
    >
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">
              Challenge Workspace
            </h1>
            <div className="flex items-center gap-4">
              {currentStep === 1 && (
                <div className="text-right">
                  <div className="text-sm text-gray-400">MCQ Timer</div>
                  <div className={`text-xl font-mono ${mcqTimeLeft <= 60 ? "text-red-400" : "text-cyan-400"}`}>
                    {formatTime(mcqTimeLeft)}
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Coding Timer</div>
                    <div className={`text-xl font-mono ${codingTimeLeft <= 60 ? "text-red-400" : "text-cyan-400"}`}>
                      {formatTime(codingTimeLeft)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Security Active</div>
                    <div className="text-xl font-mono text-green-400">
                      ✓
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-6">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? "text-cyan-400" : "text-gray-500"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= 1 ? "bg-cyan-500" : "bg-gray-700"
              }`}>
                1
              </div>
              <span>MCQ Assessment</span>
            </div>
            <div className="w-8 h-1 bg-gray-700"></div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? "text-cyan-400" : "text-gray-500"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= 2 ? "bg-cyan-500" : "bg-gray-700"
              }`}>
                2
              </div>
              <span>Coding Challenge</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Step 1: MCQ */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">MCQ Assessment</h2>
              <p className="text-gray-300 mb-6">
                Answer 10 multiple choice questions. You have 10 minutes to complete this section.
              </p>

              {mcqs.map((mcq, index) => (
                <div key={mcq.id} className="mb-8 p-4 bg-gray-800 rounded-lg" onContextMenu={(e) => e.preventDefault()}>
                  <h3 className="font-semibold mb-3 select-none">
                    Question {index + 1}: {mcq.question}
                  </h3>
                  <div className="space-y-2">
                    {mcq.options?.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="radio"
                          name={`mcq-${mcq.id}`}
                          value={option}
                          checked={mcqAnswers[mcq.id] === option}
                          onChange={(e) => setMcqAnswers({
                            ...mcqAnswers,
                            [mcq.id]: e.target.value
                          })}
                          className="text-cyan-500"
                        />
                        <span className="text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={submitMcq}
                  disabled={mcqSubmitted || isHackathonEnded}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-lg font-semibold disabled:opacity-50"
                >
                  {mcqSubmitted ? "Submitting..." : isHackathonEnded ? "Hackathon Ended" : "Submit MCQ"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Coding */}
        {currentStep === 2 && problem && (
          <div className="space-y-6">
            {/* Problem Description */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
              <div className="mb-4">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  problem.difficulty?.toLowerCase().includes("easy") ? "bg-green-500/20 text-green-300" :
                  problem.difficulty?.toLowerCase().includes("medium") ? "bg-yellow-500/20 text-yellow-300" :
                  "bg-red-500/20 text-red-300"
                }`}>
                  {problem.difficulty || "Unknown"}
                </span>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{problem.description}</p>
              </div>
            </div>

            {/* Security Warning */}
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Hackathon Security Environment</h3>
              <ul className="text-sm text-yellow-200 space-y-1">
                <li>• Copy and paste is disabled</li>
                <li>• Tab switching is limited to 2 times</li>
                <li>• Right-click is disabled</li>
                <li>• Developer tools are blocked</li>
                <li>• Timer will auto-submit when time expires</li>
                <li>• Submissions are locked after hackathon ends</li>
              </ul>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Language:</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Code Editor */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="font-semibold">Code Editor</h3>
              </div>
              <Editor
                height="400px"
                language={language}
                value={code}
                onChange={setCode}
                theme="vs-dark"
                options={getHackathonMonacoOptions()}
                onMount={(editor) => {
                  editorRef.current = editor;
                  configureMonacoSecurity(editor, (violation) => {
                    setOutput(`⚠️ Security violation: ${violation} is disabled in hackathon mode.`);
                  });
                }}
              />
            </div>

            {/* Output */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-3">Output</h3>
              <pre className="bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
                {output || "No output yet. Click 'Run Code' to test your solution."}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={runCode}
                disabled={isHackathonEnded}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50"
              >
                Run Code
              </button>
              <button
                onClick={submitCoding}
                disabled={codingSubmitted || isHackathonEnded}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg font-semibold disabled:opacity-50"
              >
                {codingSubmitted ? "Submitting..." : isHackathonEnded ? "Hackathon Ended" : "Submit Solution"}
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </HackathonSecurityWrapper>
  );
}
