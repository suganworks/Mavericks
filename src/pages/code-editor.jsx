import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import MonacoEditor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { loader } from "@monaco-editor/react";

// --- Config ---
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY || "";

// --- Mood GIFs ---
const moods = {
  neutral: "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif",
  running: "https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXNqZ3Y0Z2RkZ2w5a2ZqY2ZpZ3J5b3R4c3B6c3h6eXJtY3h5eHh5eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4KhVp1b2e4M2o2mQ/giphy.gif",
  success: "https://i.giphy.com/media/111ebonMs90YLu/giphy.gif",
  fail: "https://i.giphy.com/media/26n6WywJyh39n1pBu/giphy.gif"
};

export default function CodeEditor() {
  const { problemId } = useParams(); // Get problemId from URL
  const navigate = useNavigate();
  const editorRef = useRef(null);

  const [allProblems, setAllProblems] = useState([]);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("Select a problem to start coding.");
  const [mood, setMood] = useState(moods.neutral);
  const [isRunning, setIsRunning] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isProblemSolved, setIsProblemSolved] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  // --- Fetch User, All Problems, and Specific Problem Data ---
  useEffect(() => {
    // 1. Check for authenticated user
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Fetch additional user data from users table
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) {
          console.error("Error fetching user data:", error);
        } else {
          setUserData(data);
        }
      } else {
        navigate('/login');
      }
    };
    fetchUser();

    // 2. Fetch all problems for the dropdown selector
    const fetchAllProblems = async () => {
        const { data, error } = await supabase.from("problems").select("id, title");
        if (error) {
            console.error("Error fetching problem list:", error);
        } else {
            setAllProblems(data);
        }
    };
    fetchAllProblems();

  }, [navigate]);

  // --- Fetch Problem and Last Submission Together ---
  useEffect(() => {
    if (!user || !problemId) return;
    let isMounted = true;
    const fetchProblemAndSubmission = async () => {
      setCurrentProblem(null);
      setOutput("Loading problem...");
      // Fetch problem
      const { data: problemData, error: problemError } = await supabase
        .from("problems")
        .select("*")
        .eq("id", problemId)
        .single();
      if (problemError) {
        if (isMounted) {
          setOutput(`Error loading problem: ${problemError.message}`);
          setCurrentProblem(null);
        }
        return;
      }
      // Fetch last submission
      const { data: submissionData, error: submissionError } = await supabase
        .from("submissions")
        .select("code, language, output")
        .eq("user_id", user.id)
        .eq("problem_id", problemId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (isMounted) {
        setCurrentProblem(problemData);
        if (submissionData) {
          setCode(submissionData.code || "");
          setLanguage(submissionData.language || "python");
          setOutput(submissionData.output || "Loaded your last submission.");
          setIsProblemSolved(true);
        } else {
          const defaultBoilerplate = problemData.boilerplate?.[language] || ``;
          setCode(defaultBoilerplate);
          setOutput("Ready to code.");
          setIsProblemSolved(false);
        }
      }
    };
    fetchProblemAndSubmission();
    return () => { isMounted = false; };
  }, [user, problemId, language]);


  const runCode = async () => {
    if (!currentProblem || !code.trim()) {
      setOutput("⚠️ Please select a problem and write some code.");
      return;
    }
    
    const apiKey = GEMINI_API_KEY; 
    if (!apiKey) {
      setOutput("❌ Gemini API key missing. Please set VITE_GEMINI_KEY in your environment variables.");
      return;
    }

    setIsRunning(true);
    setMood(moods.running);
    setOutput("⏳ Evaluating your code...");

    const testCasesText = currentProblem.test_cases
      ?.map((tc, i) => `Test Case ${i + 1}: Input: ${JSON.stringify(tc.input)}, Expected: ${tc.output}`)
      .join("\n");

    const prompt = `
      You are a compiler. Strictly give only the output for the problem provided.
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
      - Give actual output for each test case.
      - Give time complexity and space complexity.
      - "✅ Success! All test cases passed." if correct.
      - "❌ Failed Test Case X: ..." if incorrect.
      - "💥 Compilation Error: ..." if compile/runtime error.
    `;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`,
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

  const submitCode = async () => {
    if (!user) {
      alert("⚠️ User not logged in.");
      return;
    }
    if (!currentProblem) {
      alert("⚠️ No problem selected.");
      return;
    }
    if (!code.trim()) {
      alert("⚠️ Write some code before submitting.");
      return;
    }

    const { error } = await supabase.from("submissions").insert([
      {
        user_id: user.id,
        problem_id: currentProblem.id,
        code,
        language,
        output, // Save the last run output with the submission
        test_cases: currentProblem.test_cases
      }
    ]);

    if (error) {
      alert("❌ Error submitting: " + error.message);
    } else {
      alert("✅ Submission saved successfully!");
    }
  };

  const handleProblemSelect = (selectedProblemId) => {
    if (selectedProblemId) {
        navigate(`/editor/${selectedProblemId}`);
    }
  };
  
  // Function to handle editor mounting
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Set up auto-completion provider
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        });
        
        // Get current word being typed
        const word = textUntilPosition.replace(/.*[\s\(\{\[\=\+\-\*\/\,\;\:\<\>\!\&\|\^\%\~\?]([^\s\(\{\[\=\+\-\*\/\,\;\:\<\>\!\&\|\^\%\~\?]*)$/, '$1');
        
        if (word.length < 2) return { suggestions: [] };
        
        // Generate suggestions based on language
        let completions = [];
        
        // Get code context (surrounding lines)
        const lineCount = model.getLineCount();
        const startLine = Math.max(1, position.lineNumber - 10);
        const endLine = Math.min(lineCount, position.lineNumber + 10);
        const codeContext = model.getValueInRange({
          startLineNumber: startLine,
          startColumn: 1,
          endLineNumber: endLine,
          endColumn: model.getLineMaxColumn(endLine),
        });
        
        // Extract variable names and function names from context
        const contextWords = extractContextWords(codeContext, language);
        
        // Add language-specific keywords
        const languageKeywords = getLanguageKeywords(language);
        
        // Combine context words and language keywords
        completions = [...contextWords, ...languageKeywords]
          .filter(item => item.label.startsWith(word))
          .map(item => ({
            label: item.label,
            kind: item.kind,
            insertText: item.insertText || item.label,
            detail: item.detail || '',
            documentation: item.documentation || '',
          }));
        
        return {
          suggestions: completions,
        };
      },
    });
  };
  
  // Function to extract context words from code
  const extractContextWords = (codeContext, language) => {
    let words = [];
    let regex;
    
    // Different regex patterns for different languages
    switch (language) {
      case 'python':
        // Match variable assignments and function definitions
        regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*[=\(]/g;
        break;
      case 'javascript':
        // Match variable declarations, function declarations, and method calls
        regex = /\b(var|let|const|function)\s+([a-zA-Z_][a-zA-Z0-9_]*)\b|\b([a-zA-Z_][a-zA-Z0-9_]*)\s*[=\(\.]|\.(\w+)\s*\(/g;
        break;
      case 'java':
      case 'cpp':
        // Match variable declarations, function declarations, and method calls
        regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*[=\(\.]|\.(\w+)\s*\(/g;
        break;
      default:
        regex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g;
    }
    
    let match;
    while ((match = regex.exec(codeContext)) !== null) {
      const word = match[1] || match[2] || match[3] || match[4];
      if (word && !words.some(w => w.label === word)) {
        words.push({
          label: word,
          kind: monaco.languages.CompletionItemKind.Variable,
          detail: 'Context variable or function',
        });
      }
    }
    
    return words;
  };
  
  // Function to get language-specific keywords
  const getLanguageKeywords = (language) => {
    switch (language) {
      case 'python':
        return [
          { label: 'def', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Define a function' },
          { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Conditional statement' },
          { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Else clause' },
          { label: 'elif', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Else if clause' },
          { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'For loop' },
          { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'While loop' },
          { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Return statement' },
          { label: 'import', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Import module' },
          { label: 'from', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Import from module' },
          { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Define a class' },
          { label: 'print', kind: monaco.languages.CompletionItemKind.Function, detail: 'Print to console', insertText: 'print($1)', documentation: 'Print objects to the console' },
          { label: 'len', kind: monaco.languages.CompletionItemKind.Function, detail: 'Get length', insertText: 'len($1)', documentation: 'Return the length of an object' },
          { label: 'range', kind: monaco.languages.CompletionItemKind.Function, detail: 'Range generator', insertText: 'range($1)', documentation: 'Generate a sequence of numbers' },
        ];
      case 'javascript':
        return [
          { label: 'function', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Define a function' },
          { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Conditional statement' },
          { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Else clause' },
          { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'For loop' },
          { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'While loop' },
          { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Return statement' },
          { label: 'const', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Constant variable' },
          { label: 'let', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Block-scoped variable' },
          { label: 'var', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Function-scoped variable' },
          { label: 'console.log', kind: monaco.languages.CompletionItemKind.Method, detail: 'Log to console', insertText: 'console.log($1)', documentation: 'Log objects to the browser console' },
        ];
      case 'java':
        return [
          { label: 'public', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Public access modifier' },
          { label: 'private', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Private access modifier' },
          { label: 'protected', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Protected access modifier' },
          { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Define a class' },
          { label: 'void', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Void return type' },
          { label: 'int', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Integer type' },
          { label: 'String', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'String type' },
          { label: 'boolean', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Boolean type' },
          { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Conditional statement' },
          { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Else clause' },
          { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'For loop' },
          { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'While loop' },
          { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Return statement' },
          { label: 'System.out.println', kind: monaco.languages.CompletionItemKind.Method, detail: 'Print to console', insertText: 'System.out.println($1)', documentation: 'Print objects to the console' },
        ];
      case 'cpp':
        return [
          { label: 'int', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Integer type' },
          { label: 'char', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Character type' },
          { label: 'bool', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Boolean type' },
          { label: 'float', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Float type' },
          { label: 'double', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Double type' },
          { label: 'void', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Void type' },
          { label: 'if', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Conditional statement' },
          { label: 'else', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Else clause' },
          { label: 'for', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'For loop' },
          { label: 'while', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'While loop' },
          { label: 'return', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Return statement' },
          { label: 'class', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Define a class' },
          { label: 'struct', kind: monaco.languages.CompletionItemKind.Keyword, detail: 'Define a struct' },
          { label: 'cout', kind: monaco.languages.CompletionItemKind.Variable, detail: 'Output stream', insertText: 'cout << $1', documentation: 'Output stream object' },
          { label: 'cin', kind: monaco.languages.CompletionItemKind.Variable, detail: 'Input stream', insertText: 'cin >> $1', documentation: 'Input stream object' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="relative min-h-screen text-white font-sans">
      <img src={mood} alt="bg" className="fixed top-0 left-0 w-full h-full object-cover z-0" />
      <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10"></div>

      <div className="relative z-20 flex flex-col lg:flex-row h-screen p-4 gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/3 glass-panel p-4 overflow-y-auto flex flex-col">
          {/* Removed 'Back to Dashboard' button as requested */}

          <div className="mb-4">
              <label htmlFor="problem-selector" className="block mb-2 text-sm font-medium text-gray-300">Select a Problem</label>
              <select
                id="problem-selector"
                value={problemId || ""}
                onChange={(e) => handleProblemSelect(e.target.value)}
                className="w-full p-2 glass-panel-input"
              >
                <option value="" disabled>Choose a problem</option>
                {allProblems.map((p) => (
                  <option key={p.id} value={p.id} className="bg-gray-900 text-white">
                    {p.title}
                  </option>
                ))}
              </select>
          </div>

          <div className="flex-grow overflow-y-auto">
            {currentProblem ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{currentProblem.title}</h3>
                  {isProblemSolved && (
                    <span className="text-xs text-green-400 font-semibold flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                      </svg>
                      Solved
                    </span>
                  )}
                </div>
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
            ) : (
               <p>{problemId ? "Loading problem..." : "Please select a problem from the dropdown."}</p>
            )}
          </div>
        </div>

        {/* Main */}
        <div className="lg:w-2/3 flex flex-col">
          <div className="glass-panel p-4 mb-4 flex gap-2 items-center">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="glass-panel-input"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <button
              onClick={runCode}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-bold ${isRunning ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"}`}
            >
              {isRunning ? "Running..." : "Run Code"}
            </button>
            <button
              onClick={submitCode}
              className="px-4 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-700"
            >
              Submit
            </button>
          </div>

          <div className="glass-panel flex-1 overflow-hidden mb-4">
            <MonacoEditor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              onMount={handleEditorDidMount}
              options={{ 
                fontSize: 16, 
                minimap: { enabled: false }, 
                wordWrap: "on",
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                snippetSuggestions: "inline"
              }}
            />
          </div>

          <div className="glass-panel p-4 h-30 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
            {output}
          </div>
        </div>
      </div>

      <style>{`
        .glass-panel {
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .glass-panel-input {
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.18);
            border-radius: 8px;
            padding: 8px;
            color: white;
        }
        .glass-panel-input:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.5);
        }
      `}</style>
    </div>
  );
}
