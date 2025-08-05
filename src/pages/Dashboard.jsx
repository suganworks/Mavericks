import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import Chart from 'chart.js/auto';

// --- Icon Components (using inline SVG for simplicity) ---
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>;
const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

export default function Dashboard() {
    const navigate = useNavigate();

    // --- State Management ---
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [problems, setProblems] = useState([]);
    const [userSubmissions, setUserSubmissions] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingProblems, setIsFetchingProblems] = useState(true);
    const [isFetchingSubmissions, setIsFetchingSubmissions] = useState(true);
    const [error, setError] = useState(null);
    const [loginHistory, setLoginHistory] = useState([]);
    const [performanceData, setPerformanceData] = useState(null);
    
    // Chart references
    const loginChartRef = useRef(null);
    const performanceChartRef = useRef(null);
    const loginChartInstance = useRef(null);
    const performanceChartInstance = useRef(null);

    // --- Supabase Authentication & Data Fetching ---
    useEffect(() => {
        const checkUserAndFetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return;
            }
            setUser(user);
            
            // Fetch user data from users table
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
            
            // Record login in user_logins table
            const timestamp = new Date().toISOString();
            const { error: loginError } = await supabase
                .from('user_logins')
                .insert([{ user_id: user.id, login_time: timestamp }]);
                
            if (loginError) {
                console.error("Error recording login:", loginError);
            }
            
            fetchProblems(user.id);
            fetchUserSubmissions(user.id);
            fetchTestCaseSuccessData(user.id);
        };

        checkUserAndFetchData();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (_event === 'SIGNED_OUT') {
                navigate('/login');
            } else if (session?.user) {
                setUser(session.user);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
            
            // Clean up chart instances
            if (loginChartInstance.current) {
                loginChartInstance.current.destroy();
            }
            if (performanceChartInstance.current) {
                performanceChartInstance.current.destroy();
            }
        };
    }, [navigate]);

    // --- Data Fetching: Problems from Supabase ---
    const fetchProblems = async (userId) => {
        setIsFetchingProblems(true);
        try {
            const { data, error: problemsError } = await supabase
                .from('problems')
                .select('*');

            if (problemsError) throw problemsError;

            setProblems(data || []);
        } catch (err) {
            console.error("Error fetching problems:", err);
            setError("Failed to fetch practice problems.");
        } finally {
            setIsFetchingProblems(false);
        }
    };

    // --- Data Fetching: User Submissions from Supabase ---
    const fetchUserSubmissions = async (userId) => {
        setIsFetchingSubmissions(true);
        try {
            const { data, error: submissionsError } = await supabase
                .from('submissions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (submissionsError) throw submissionsError;

            setUserSubmissions(data || []);
            
            // Process performance data for chart
            if (data && data.length > 0) {
                processPerformanceData(data);
            }
        } catch (err) {
            console.error("Error fetching user submissions:", err);
            setError("Failed to fetch user submissions.");
        } finally {
            setIsFetchingSubmissions(false);
        }
    };
    
    // --- Data Fetching: Test Case Success Data from Supabase ---
    const fetchTestCaseSuccessData = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('submissions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(30); // Last 30 submissions

            if (error) throw error;

            // Process the submissions to extract test case success information
            const processedData = data.map(submission => {
                // Check if the output contains success message
                const isSuccess = submission.output && submission.output.includes('✅ Success!');
                return {
                    ...submission,
                    isSuccess
                };
            });

            setLoginHistory(processedData || []);
        } catch (err) {
            console.error("Error fetching test case success data:", err);
        }
    };
    
    // --- Process Performance Data for Chart ---
    const processPerformanceData = (submissions) => {
        // Group submissions by date
        const submissionsByDate = {};
        submissions.forEach(submission => {
            const date = new Date(submission.created_at).toLocaleDateString();
            if (!submissionsByDate[date]) {
                submissionsByDate[date] = [];
            }
            submissionsByDate[date].push(submission);
        });
        
        // Get last 7 days
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toLocaleDateString());
        }
        
        // Count submissions per day
        const submissionsPerDay = last7Days.map(date => {
            return submissionsByDate[date]?.length || 0;
        });
        
        setPerformanceData({
            labels: last7Days,
            data: submissionsPerDay
        });
    };

    // --- Data Generation: Dashboard Analytics with Gemini API ---
    useEffect(() => {
        if (isFetchingProblems || isFetchingSubmissions || problems.length === 0) {
            if(!isFetchingProblems && !isFetchingSubmissions) {
                 setIsLoading(false);
                 setDashboardData({});
            }
            return;
        }

        const generateDashboardData = async () => {
            setIsLoading(true);
            setError(null);

            // Get solved problems by checking submissions
            const solvedProblemIds = userSubmissions.map(sub => sub.problem_id);
            const solvedProblems = problems.filter(problem => solvedProblemIds.includes(problem.id));
            const unsolvedProblems = problems.filter(problem => !solvedProblemIds.includes(problem.id));

            const prompt = `
                Based on the following user's practice problem data, generate a JSON object for a dashboard.
                
                All available problems: ${JSON.stringify(problems)}
                Problems solved by user: ${JSON.stringify(solvedProblems)}
                Problems not yet solved: ${JSON.stringify(unsolvedProblems)}
                User submissions: ${JSON.stringify(userSubmissions)}

                Analyze the data and provide insights for the following four categories:
                1.  "Overall Performance": A summary of total problems solved (${solvedProblems.length}/${problems.length}) and success rate.
                2.  "Key Strengths": Identify the category or difficulty the user is best at based on solved problems.
                3.  "Areas for Improvement": Suggest a category or difficulty the user should focus on from unsolved problems.
                4.  "Recent Activity": Briefly mention the last 1-2 problems solved with submission details.

                The JSON response must strictly follow this schema:
            `;

            const schema = {
                type: "OBJECT",
                properties: {
                    "overall_performance": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "content": { "type": "STRING" } } },
                    "key_strengths": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "content": { "type": "STRING" } } },
                    "areas_for_improvement": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "content": { "type": "STRING" } } },
                    "recent_activity": { type: "OBJECT", properties: { "title": { "type": "STRING" }, "content": { "type": "STRING" } } },
                }
            };

            const payload = {
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json", responseSchema: schema },
            };

            const apiKey = import.meta.env.VITE_GEMINI_KEY || "";
            if (!apiKey) {
                setError("Missing Gemini API key");
                setIsLoading(false);
                return;
            }
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            try {
                let response;
                let retries = 3;
                let delay = 1000;
                while (retries > 0) {
                    response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    if (response.ok) break;
                    retries--;
                    await new Promise(res => setTimeout(res, delay));
                    delay *= 2;
                }

                if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);

                const result = await response.json();
                
                if (result.candidates && result.candidates.length > 0) {
                    const jsonText = result.candidates[0].content.parts[0].text;
                    setDashboardData(JSON.parse(jsonText));
                } else {
                    throw new Error("No content received from Gemini API.");
                }

            } catch (apiError) {
                console.error("Error fetching from Gemini API:", apiError);
                setError("Failed to generate dashboard insights. Displaying raw data.");
                setDashboardData({});
            } finally {
                setIsLoading(false);
            }
        };

        generateDashboardData();
    }, [problems, userSubmissions, isFetchingProblems, isFetchingSubmissions]);
    
    // --- Chart Rendering ---
    useEffect(() => {
        // Render test case success chart
        if (loginHistory.length > 0 && loginChartRef.current) {
            // Clean up previous chart instance
            if (loginChartInstance.current) {
                loginChartInstance.current.destroy();
            }
            
            // Process test case success data
            const submissionDates = {};
            const successDates = {};
            
            loginHistory.forEach(submission => {
                const date = new Date(submission.created_at).toLocaleDateString();
                submissionDates[date] = (submissionDates[date] || 0) + 1;
                if (submission.isSuccess) {
                    successDates[date] = (successDates[date] || 0) + 1;
                }
            });
            
            // Get last 7 days
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                last7Days.push(date.toLocaleDateString());
            }
            
            // Calculate success rate per day
            const successRatePerDay = last7Days.map(date => {
                const totalSubmissions = submissionDates[date] || 0;
                const successfulSubmissions = successDates[date] || 0;
                return totalSubmissions > 0 ? (successfulSubmissions / totalSubmissions) * 100 : 0;
            });
            
            // Create chart
            const ctx = loginChartRef.current.getContext('2d');
            loginChartInstance.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: last7Days,
                    datasets: [{
                        label: 'Test Case Success Rate (%)',
                        data: successRatePerDay,
                        backgroundColor: 'rgba(16, 185, 129, 0.5)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { color: '#d1d5db' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#d1d5db' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: '#d1d5db' }
                        }
                    }
                }
            });
        }
        
        // Render performance chart
        if (performanceData && performanceChartRef.current) {
            // Clean up previous chart instance
            if (performanceChartInstance.current) {
                performanceChartInstance.current.destroy();
            }
            
            // Create chart
            const ctx = performanceChartRef.current.getContext('2d');
            performanceChartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: performanceData.labels,
                    datasets: [{
                        label: 'Daily Submissions',
                        data: performanceData.data,
                        backgroundColor: 'rgba(167, 139, 250, 0.2)',
                        borderColor: 'rgba(167, 139, 250, 1)',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#d1d5db' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        x: {
                            ticks: { color: '#d1d5db' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    },
                    plugins: {
                        legend: {
                            labels: { color: '#d1d5db' }
                        }
                    }
                }
            });
        }
    }, [loginHistory, performanceData]);

    // --- Event Handlers ---
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    // --- Memoized Icon Mapping ---
    const iconMap = useMemo(() => ({
        "overall_performance": <ChartBarIcon />,
        "key_strengths": <TargetIcon />,
        "areas_for_improvement": <TrendingUpIcon />,
        "recent_activity": <ActivityIcon />,
    }), []);

    // --- UI Rendering ---
    const isProblemSolved = (problemId) => {
        return userSubmissions.some(submission => submission.problem_id === problemId);
    };

    const renderDifficultyBadge = (difficulty) => {
        const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full";
        switch (difficulty?.toLowerCase()) {
            case 'easy': return <span className={`${baseClasses} bg-green-500/20 text-green-300`}>Easy</span>;
            case 'medium': return <span className={`${baseClasses} bg-yellow-500/20 text-yellow-300`}>Medium</span>;
            case 'hard': return <span className={`${baseClasses} bg-red-500/20 text-red-300`}>Hard</span>;
            default: return <span className={`${baseClasses} bg-gray-500/20 text-gray-300`}>N/A</span>;
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-black text-white p-4 sm:p-6 font-sans overflow-x-hidden">
            {/* Animated Blob Background */}
            <motion.div
                className="absolute -top-40 -left-40 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-purple-600 mix-blend-multiply filter blur-3xl opacity-40"
                animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
                className="absolute bottom-0 -right-40 w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full bg-pink-600 mix-blend-multiply filter blur-3xl opacity-40"
                animate={{ x: [0, -20, 20, 0], y: [0, 20, -20, 0], rotate: [0, -180, -360] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3">
                    <BookOpenIcon />
                    <h1 className="text-xl sm:text-2xl font-bold">Welcome, {userData?.full_name || userData?.username || user?.email}</h1>
                </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors duration-200"
                    >
                        <LogOutIcon />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </header>

                {/* Main Content */}
                <main>
                    {/* User Information Section */}
                    {userData && (
                        <motion.div 
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-xl font-semibold mb-4">User Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-400 text-sm">Username</p>
                                    <p className="text-white text-lg">{userData.username || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Full Name</p>
                                    <p className="text-white text-lg">{userData.full_name || "Not set"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Email</p>
                                    <p className="text-white text-lg">{user?.email}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-sm">Member Since</p>
                                    <p className="text-white text-lg">{new Date(userData.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Dashboard Analytics Section */}
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-8">
                                <p>Analyzing your progress with Gemini...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                    {!isLoading && error && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/20 text-red-300 p-4 rounded-lg mb-8">
                            <p>{error}</p>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    {!isLoading && dashboardData && Object.keys(dashboardData).length > 0 && (
                        <motion.div 
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {Object.entries(dashboardData).map(([key, value], index) => (
                                <motion.div
                                    key={key}
                                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1, duration: 0.4 }}
                                >
                                    <div className="flex items-center gap-3 mb-3 text-purple-300">
                                        {iconMap[key]}
                                        <h3 className="font-semibold">{value.title || "Insight"}</h3>
                                    </div>
                                    <p className="text-gray-300 text-sm flex-grow">{value.content || "No content available."}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* Progress Summary Section */}
                    {!isFetchingProblems && !isFetchingSubmissions && problems.length > 0 && (
                        <motion.div 
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-400">
                                        {userSubmissions.length}
                                    </div>
                                    <div className="text-sm text-gray-400">Problems Solved</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-400">
                                        {problems.length}
                                    </div>
                                    <div className="text-sm text-gray-400">Total Problems</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-400">
                                        {problems.length > 0 ? Math.round((userSubmissions.length / problems.length) * 100) : 0}%
                                    </div>
                                    <div className="text-sm text-gray-400">Success Rate</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    {/* Performance Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Test Case Success Rate */}
                        <motion.div 
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <h2 className="text-xl font-semibold mb-4">Test Case Success Rate</h2>
                            <div className="h-64">
                                <canvas ref={loginChartRef}></canvas>
                            </div>
                        </motion.div>
                        
                        {/* Coding Performance */}
                        <motion.div 
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2 className="text-xl font-semibold mb-4">Coding Performance</h2>
                            <div className="h-64">
                                <canvas ref={performanceChartRef}></canvas>
                            </div>
                        </motion.div>
                    </div>

                    {/* Practice Problems Section */}
                    <h2 className="text-xl font-semibold mb-4 mt-12">Practice Problems</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <AnimatePresence>
                            {isFetchingProblems || isFetchingSubmissions ? (
                                <p className="text-gray-400">Fetching problems and submissions...</p>
                            ) : problems.length > 0 ? (
                                problems.map((problem, index) => {
                                    const isSolved = isProblemSolved(problem.id);
                                    return (
                                        <motion.div
                                            key={problem.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05, duration: 0.3 }}
                                            layout
                                        >
                                            <Link 
                                                to={`/editor/${problem.id}`}
                                                className={`backdrop-blur-xl border rounded-2xl p-4 flex flex-col justify-between text-left w-full h-full transition-colors duration-200 cursor-pointer ${
                                                    isSolved 
                                                        ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                                                        : 'bg-white/5 border-white/10 hover:bg-white/20'
                                                }`}
                                            >
                                                <div>
                                                    <h4 className="font-bold text-lg mb-2">{problem.title}</h4>
                                                    <p className="text-sm text-gray-400 mb-3">{problem.category}</p>
                                                </div>
                                                <div className="flex justify-between items-center mt-auto">
                                                    {renderDifficultyBadge(problem.difficulty)}
                                                    {isSolved && (
                                                        <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                            </svg>
                                                            Solved
                                                        </span>
                                                    )}
                                                </div>
                                            </Link>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <motion.p 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="text-gray-400 md:col-span-2 lg:col-span-3"
                                >
                                    No practice problems found.
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}