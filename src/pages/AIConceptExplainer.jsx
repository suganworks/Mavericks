import React, { useState, useCallback } from 'react';
import { Book, Bug, Lightbulb, Loader2, AlertCircle, Code, BrainCircuit, File, Wand2, BookOpen, FileText } from 'lucide-react';

// --- Animated Background Component ---
const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-600 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
);

// --- UI Components with Refined Glassmorphism Style ---
const GlassCard = ({ children, className = '' }) => (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-lg transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const InfoCard = ({ icon, title, content, code }) => (
    <div className="transition-opacity duration-500">
        <h3 className="text-lg font-semibold text-gray-100 flex items-center mb-3">
            <span className="bg-white/10 p-2 rounded-full mr-3 border border-white/20">{icon}</span>
            {title}
        </h3>
        <div className="pl-4 md:pl-12 border-l-2 border-white/20 ml-4">
            <div className="space-y-2 text-gray-200 py-2">{content}</div>
            {code && (
                 <pre className="bg-black/20 rounded-lg p-4 my-2 text-sm text-white overflow-x-auto">
                    <code>{code}</code>
                </pre>
            )}
        </div>
    </div>
);

const ModeButton = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-300 border ${
            isActive
                ? 'bg-white/20 border-white/30 text-white font-semibold shadow-md'
                : 'bg-transparent border-transparent text-gray-400 hover:bg-white/10'
        }`}
    >
        {icon}
        <span className="hidden sm:inline">{label}</span>
    </button>
);


// --- Main App Component ---
const App = () => {
    const [mode, setMode] = useState('concept'); // 'concept', 'debug', 'logic'
    const [inputText, setInputText] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setInputText('');
        setAnalysisResult(null);
        setError('');
    };
    
    const getPromptAndSchema = useCallback(() => {
        switch (mode) {
            case 'debug':
                return {
                    prompt: `You are an expert code debugger and teacher. A beginner programmer has provided the following code snippet. Your task is to: 1. Identify any errors or bugs in the code. 2. Explain the errors in simple, easy-to-understand terms. 3. Provide the corrected, working code. 4. Briefly explain why the corrected code works. Return the response as a structured JSON object. Code to debug: --- ${inputText} ---`,
                    schema: { type: "OBJECT", properties: { "errorAnalysis": { "type": "STRING" }, "correctedCode": { "type": "STRING" }, "explanation": { "type": "STRING" } } }
                };
            case 'logic':
                return {
                    prompt: `You are an expert programming tutor who helps beginners build logic. A user wants to solve the following problem. Your task is to: 1. Break down the problem into simple, step-by-step instructions. 2. Provide clear pseudocode that follows these steps. 3. Provide a simple code example in Python or JavaScript that implements the logic. Return the response as a structured JSON object. Problem to solve: --- ${inputText} ---`,
                    schema: { type: "OBJECT", properties: { "logicSteps": { "type": "ARRAY", "items": { "type": "STRING" } }, "pseudocode": { "type": "STRING" }, "codeExample": { "type": "STRING" } } }
                };
            case 'concept':
            default:
                return {
                    prompt: `You are an expert programming teacher. A beginner has asked for an explanation of a concept. Your task is to: 1. Explain the concept in simple, clear terms, using analogies if helpful. 2. Provide a simple, well-commented code example (in Python or JavaScript) to illustrate the concept. Return the response as a structured JSON object. Concept to explain: --- ${inputText} ---`,
                    schema: { type: "OBJECT", properties: { "explanation": { "type": "STRING" }, "codeExample": { "type": "STRING" } } }
                };
        }
    }, [mode, inputText]);

    const handleAnalyze = useCallback(async () => {
        if (!inputText.trim()) {
            setError("Please enter a concept, code snippet, or problem description.");
            return;
        }
        setIsLoading(true);
        setError('');
        setAnalysisResult(null);
        
        const { prompt, schema } = getPromptAndSchema();

        try {
            const data = await callGeminiAPI(prompt, schema);
            setAnalysisResult(data);
        } catch (err) {
            console.error('Analysis failed:', err);
            setError('An error occurred during analysis. The model may not have been able to process the request.');
        } finally {
            setIsLoading(false);
        }
    }, [inputText, getPromptAndSchema]);

    const callGeminiAPI = async (prompt, schema) => {
        const apiKey = import.meta.env.VITE_GEMINI_KEY || "";
        if (!apiKey) throw new Error("Missing Gemini API key");
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json", responseSchema: schema }
        };
        let retries = 3, delay = 1000;
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
                if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                    return JSON.parse(result.candidates[0].content.parts[0].text);
                } else { throw new Error("Invalid API response structure."); }
            } catch (error) {
                console.warn(`API call attempt ${i + 1} failed. Retrying...`);
                if (i < retries - 1) { await new Promise(res => setTimeout(res, delay)); delay *= 2; } else { throw error; }
            }
        }
    };

    const placeholders = {
        concept: 'e.g., "What is a JavaScript Promise?"',
        debug: 'Paste your code with a suspected error here...',
        logic: 'e.g., "How to check if a number is a prime number?"'
    };

    return (
        <div className="min-h-screen font-sans text-gray-200">
            <AnimatedBackground />
            <style>{`
                @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                .animate-slide-in-up { animation: slideInUp 0.5s ease-out forwards; }
                @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
            <div className="container mx-auto p-4 sm:p-6 lg:p-8 relative max-w-4xl">
                <header className="text-center p-4 sm:p-8">
                    <h1 className="text-3xl sm:text-5xl font-bold text-white">AI Concept Explainer</h1>
                    <p className="text-gray-300 mt-2 text-lg">Your personal coding tutor</p>
                </header>
                
                {/* --- Input Section --- */}
                <GlassCard className="p-6 space-y-6">
                    <GlassCard className="p-2 flex space-x-2">
                        <ModeButton icon={<Book size={20} />} label="Concept" isActive={mode === 'concept'} onClick={() => handleModeChange('concept')} />
                        <ModeButton icon={<Bug size={20} />} label="Debug" isActive={mode === 'debug'} onClick={() => handleModeChange('debug')} />
                        <ModeButton icon={<Lightbulb size={20} />} label="Logic" isActive={mode === 'logic'} onClick={() => handleModeChange('logic')} />
                    </GlassCard>
                    
                    <div>
                        <textarea
                            id="doc-text"
                            rows="10"
                            className="block w-full rounded-lg border-white/20 bg-white/5 p-4 shadow-sm focus:border-indigo-400 focus:ring-indigo-400 sm:text-sm text-gray-200 transition-all duration-300"
                            placeholder={placeholders[mode]}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !inputText}
                        className="w-full font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out bg-indigo-500/50 hover:bg-indigo-500/80 border border-indigo-400/50 text-white disabled:bg-gray-500/20 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        {isLoading ? <><Loader2 className="animate-spin mr-2" /> Analyzing...</> : <><Wand2 className="mr-2" size={20}/> Explain</>}
                    </button>
                </GlassCard>

                {/* --- Output Section --- */}
                <div className="mt-8">
                    {isLoading && <div className="flex justify-center items-center h-full p-10"><Loader2 className="w-12 h-12 text-white/80 animate-spin" /></div>}
                    {error && <GlassCard className="p-4 bg-red-500/30 border-red-500/50"><div className="flex items-center text-red-200"><AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" /><p>{error}</p></div></GlassCard>}
                    
                    {analysisResult && !isLoading && (
                        <GlassCard className="p-6 animate-slide-in-up">
                            <h2 className="text-2xl font-bold text-white mb-6">Analysis</h2>
                            <div className="space-y-6">
                                {mode === 'concept' && (
                                    <>
                                        <InfoCard icon={<BookOpen className="w-5 h-5 text-purple-300"/>} title="Explanation" content={<p>{analysisResult.explanation}</p>} />
                                        <InfoCard icon={<Code className="w-5 h-5 text-blue-300"/>} title="Code Example" content={null} code={analysisResult.codeExample} />
                                    </>
                                )}
                                {mode === 'debug' && (
                                    <>
                                        <InfoCard icon={<AlertCircle className="w-5 h-5 text-red-300"/>} title="Error Analysis" content={<p>{analysisResult.errorAnalysis}</p>} />
                                        <InfoCard icon={<Code className="w-5 h-5 text-green-300"/>} title="Corrected Code" content={<p>{analysisResult.explanation}</p>} code={analysisResult.correctedCode} />
                                    </>
                                )}
                                {mode === 'logic' && (
                                    <>
                                        <InfoCard icon={<BrainCircuit className="w-5 h-5 text-yellow-300"/>} title="Logic Steps" content={<ul className="list-decimal list-inside space-y-1">{analysisResult.logicSteps.map((step, i) => <li key={i}>{step}</li>)}</ul>} />
                                        <InfoCard icon={<FileText className="w-5 h-5 text-purple-300"/>} title="Pseudocode" content={null} code={analysisResult.pseudocode} />
                                        <InfoCard icon={<Code className="w-5 h-5 text-blue-300"/>} title="Code Example" content={null} code={analysisResult.codeExample} />
                                    </>
                                )}
                            </div>
                        </GlassCard>
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
