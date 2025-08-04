import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import MonacoEditor from '@monaco-editor/react';


// --- Reusable Icon Components ---
const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
);

const LoaderIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin mr-2 h-5 w-5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
);

// In a real app, these would come from environment variables (.env file)
// For this example, replace them with your actual keys.
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

// --- Keyword Suggestions Data ---
const keywordSuggestions = {
    python: ['def', 'return', 'for', 'in', 'while', 'if', 'else', 'elif', 'import', 'class', 'try', 'except', 'finally', 'with', 'as', 'lambda', 'yield', 'pass', 'continue', 'break'],
    cpp: ['int', 'double', 'char', 'string', 'void', 'return', 'for', 'while', 'if', 'else', '#include', 'using', 'namespace', 'std', 'cout', 'cin', 'vector', 'map', 'set'],
    java: ['public', 'static', 'void', 'main', 'String', 'int', 'double', 'char', 'return', 'for', 'while', 'if', 'else', 'import', 'class', 'System', 'out', 'println', 'new', 'ArrayList', 'HashMap']
};

// --- Main App Component ---
export default function App() {
    // --- State Management ---
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('Connect to Supabase and select a question.');
    const [isLoading, setIsLoading] = useState(false);
    const [backgroundGif, setBackgroundGif] = useState('https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXNqZ3Y0Z2RkZ2w5a2ZqY2ZpZ3J5b3R4c3B6c3h6eXJtY3h5eHh5eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4KhVp1b2e4M2o2mQ/giphy.gif');
    const [supabaseClient, setSupabaseClient] = useState(null);

    // Question and Test Case State
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [testCases, setTestCases] = useState([]);

    // --- Background GIFs ---
    const gifs = {
        win: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDB2dGk4d3g0bW5qZ3N0c2JqNnZ0a3h5d2h6Z3F1c3NqZ3J4bWJzZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7abGQa0aRJUoiWyY/giphy.gif',
        lose: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExbW80OHJ5N3R5N3F4d25oa2ZqZzR5b3o2c3c4b3VzZ3Z5a3JtY3ZzdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26n6WywJyh39n1pBu/giphy.gif',
        loading: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXNqZ3Y0Z2RkZ2w5a2ZqY2ZpZ3J5b3R4c3B6c3h6eXJtY3h5eHh5eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4KhVp1b2e4M2o2mQ/giphy.gif'
    };

    // --- Initialize Supabase Client and Fetch Initial Data ---
    useEffect(() => {
        if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== "YOUR_SUPABASE_URL") {
            const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            setSupabaseClient(client);
        } else {
            setOutput(<span className="text-yellow-400">Please configure your Supabase credentials in the code.</span>);
        }
    }, []);

    // --- Fetch Questions from Supabase ---
    useEffect(() => {
        if (!supabaseClient) return;

        const fetchQuestionsAndSetFirst = async () => {
            const { data, error } = await supabaseClient.from('questions').select('*').order('id', { ascending: true });
            if (error) {
                setOutput(<span className="text-red-400">Error fetching questions: {error.message}</span>);
            } else {
                setQuestions(data);
                if (data.length > 0) {
                    handleQuestionChange(data[0].id, data);
                } else {
                     setOutput(<span className="text-yellow-400">No questions found in your Supabase project.</span>);
                }
            }
        };
        fetchQuestionsAndSetFirst();
    }, [supabaseClient]);

    // --- Fetch Test Cases for Selected Question ---
    const fetchTestCases = async (questionId) => {
        if (!supabaseClient) return;
        const { data, error } = await supabaseClient.from('test_cases').select('*').eq('question_id', questionId);
        if (error) {
            setOutput(<span className="text-red-400">Error fetching test cases: {error.message}</span>);
            setTestCases([]);
        } else {
            setTestCases(data);
        }
    };

    // --- Handle Question Selection ---
    const handleQuestionChange = (questionId, currentQuestionsList = questions) => {
        const selectedQuestion = currentQuestionsList.find(q => q.id == questionId);
        setCurrentQuestion(selectedQuestion);
        fetchTestCases(questionId);
    };

    // --- API Call to Gemini ---
    const handleRunCode = async () => {
        if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
            setOutput(<span className="text-red-400">Error: Please configure your Google Gemini API key in the code.</span>);
            return;
        }
        if (!currentQuestion) {
            setOutput(<span className="text-red-400">Error: Please select a question first.</span>);
            return;
        }
        if (testCases.length === 0) {
            setOutput(<span className="text-yellow-400">Warning: No test cases found for this question. Cannot validate.</span>);
            return;
        }
        if (code.trim() === '') {
            setOutput(<span className="text-yellow-400">Warning: Code editor is empty.</span>);
            return;
        }

        setIsLoading(true);
        setOutput(<span className="text-yellow-400">Evaluating with test cases...</span>);
        setBackgroundGif(gifs.loading);

        const prompt = `
            As an expert code evaluator, analyze the following ${language} code intended to solve the problem: "${currentQuestion.title}".
            
            Problem Description:
            ${currentQuestion.description}

            User's Code:
            \`\`\`${language}
            ${code}
            \`\`\`

            Evaluate the code against these test cases:
            ${testCases.map((tc, i) => `Test Case ${i+1}: Input: ${JSON.stringify(tc.input)}, Expected Output: ${tc.expected_output}`).join('\n')}

            Your task is to determine if the code passes all test cases. 
            - If the code is logically correct and passes all tests, respond with only "Success!".
            - If the code fails any test case or has a compilation/runtime error, provide a brief, user-friendly error message explaining the failure. For example: "Failed Test Case 2: Input ({"nums":[3,2,4], "target":6}) -> Expected [1,2] but got [something_else]" or "Compilation Error: [error details]".
            Do not provide the corrected code. Only provide the success or failure message.
        `;
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (textResponse) {
                 if (textResponse.trim().toLowerCase().includes("success")) {
                    setOutput(<span className="text-green-400 whitespace-pre-wrap">{textResponse}</span>);
                    setBackgroundGif(gifs.win);
                 } else {
                    setOutput(<span className="text-red-400 whitespace-pre-wrap">{textResponse}</span>);
                    setBackgroundGif(gifs.lose);
                 }
            } else {
                throw new Error("No content in API response.");
            }

        } catch (error) {
            setOutput(<span className="text-red-400">API Error: {error.message}</span>);
            setBackgroundGif(gifs.lose);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-900 text-white font-sans">
            <img src={backgroundGif} alt="dynamic background" className="fixed top-0 left-0 w-full h-full object-cover z-0 transition-opacity duration-500" />
            <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"></div>

            <div className="relative z-20 container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-shadow-lg flex items-center justify-center">
                        Mavericks Code Editor
                    </h1>
                     <p className="text-gray-300 mt-2">Powered by React, Supabase & Gemini AI</p>
                </header>

                <main className="space-y-8">
                    {/* Problem Description Panel */}
                    <div className="glassmorphism rounded-xl p-6 shadow-2xl border border-white/20">
                         <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-white">Problem Description</h2>
                            {questions.length > 0 && (
                                <select onChange={(e) => handleQuestionChange(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none transition">
                                    {questions.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
                                </select>
                            )}
                        </div>
                        {currentQuestion ? (
                            <>
                                <h3 className="text-xl font-bold mb-2">{currentQuestion.title}</h3>
                                <p className="mb-4 text-gray-200 whitespace-pre-wrap">{currentQuestion.description}</p>
                                <div className="bg-gray-800/50 rounded-lg p-4 mt-4 border border-white/10">
                                    <p className="font-mono text-gray-300 whitespace-pre-wrap">
                                        <strong>Test Cases:</strong><br />
                                        {testCases.length > 0 ? (
                                            testCases.map((tc, i) => (
                                                <span key={tc.id || i} className="block mt-2">
                                                    <strong>Input:</strong> {JSON.stringify(tc.input)}<br />
                                                    <strong>Expected Output:</strong> {tc.expected_output}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-yellow-400">No test cases found for this problem.</span>
                                        )}
                                    </p>
                                </div>
                            </>
                        ) : <p>Please wait... connecting to database and loading questions.</p>}
                    </div>

                    {/* Code Editor and Output Panel */}
                    <div className="glassmorphism rounded-xl p-6 shadow-2xl border border-white/20">
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                            <div className="flex items-center space-x-2">
                                <label htmlFor="language" className="font-semibold text-sm">Language:</label>
                                <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none transition">
                                    <option value="python">Python</option>
                                    <option value="cpp">C++</option>
                                    <option value="java">Java</option>
                                </select>
                            </div>
                            <button onClick={handleRunCode} disabled={isLoading || !currentQuestion} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center justify-center disabled:bg-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-green-500/50">
                                {isLoading ? <LoaderIcon /> : <PlayIcon />}
                                {isLoading ? 'Running...' : 'Run Code'}
                            </button>
                        </div>

                        <div className="border border-white/10 rounded-lg overflow-hidden">
                            <div className="mb-2 p-2 bg-gray-900/80 border-b border-white/10 rounded-t-lg flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                                <span className="text-green-400 font-bold mr-2 self-center">Suggestions:</span>
                                {keywordSuggestions[language]?.slice(0, 30).map((kw, i) => (
                                    <span key={kw + i} className="bg-gray-800 text-xs px-2 py-1 rounded text-green-200 border border-green-700/30">{kw}</span>
                                ))}
                            </div>
                            <MonacoEditor
                                height="400px"
                                language={language}
                                theme="vs-dark"
                                value={code}
                                onChange={value => setCode(value || '')}
                                options={{
                                    fontSize: 16,
                                    minimap: { enabled: false },
                                    fontFamily: 'Fira Code, monospace',
                                    scrollBeyondLastLine: false,
                                    wordWrap: 'on',
                                    roundedSelection: true,
                                    automaticLayout: true,
                                    formatOnPaste: true,
                                    formatOnType: true,
                                }}
                            />
                        </div>

                        <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-2">Output</h3>
                            <div className="bg-gray-800/50 rounded-lg p-4 h-48 overflow-y-auto font-mono border border-white/10">
                                {output}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
