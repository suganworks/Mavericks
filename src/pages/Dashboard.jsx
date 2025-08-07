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
    const [currentPage, setCurrentPage] = useState(0);
    
    // Chart references
    const loginChartRef = useRef(null);
    const performanceChartRef = useRef(null);
    const loginChartInstance = useRef(null);
    const performanceChartInstance = useRef(null);
    
    // Problems carousel references and state
    const problemsContainerRef = useRef(null);
    const autoScrollIntervalRef = useRef(null);
    const itemsPerView = useMemo(() => {
        // Responsive items per view based on screen size
        return window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
    }, []);

    // --- Supabase Authentication & Data Fetching ---
    // Scroll handling functions for problems carousel
    const handleScroll = (direction) => {
        if (!problemsContainerRef.current) return;
        
        const container = problemsContainerRef.current;
        const scrollAmount = container.clientWidth * 0.8; // 80% of visible width
        const newScrollPosition = direction === 'right' 
            ? container.scrollLeft + scrollAmount 
            : container.scrollLeft - scrollAmount;
            
        container.scrollTo({
            left: newScrollPosition,
            behavior: 'smooth'
        });
        
        // Update current page based on scroll position
        const newPage = Math.round(newScrollPosition / (container.clientWidth * 0.8));
        setCurrentPage(Math.max(0, Math.min(newPage, Math.ceil(problems.length / itemsPerView) - 1)));
        
        // Reset auto-scroll timer when manually scrolling
        resetAutoScroll();
    };
    
    const scrollToPage = (pageIndex) => {
        if (!problemsContainerRef.current) return;
        
        const container = problemsContainerRef.current;
        const scrollAmount = container.clientWidth * 0.8; // 80% of visible width
        
        container.scrollTo({
            left: pageIndex * scrollAmount,
            behavior: 'smooth'
        });
        
        setCurrentPage(pageIndex);
        resetAutoScroll();
    };
    
    const startAutoScroll = () => {
        // Clear any existing interval
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
        }
        
        // Set up auto-scrolling every 5 seconds
        autoScrollIntervalRef.current = setInterval(() => {
            if (!problemsContainerRef.current || problems.length <= itemsPerView) return;
            
            const totalPages = Math.ceil(problems.length / itemsPerView);
            const nextPage = (currentPage + 1) % totalPages; // Loop back to start
            scrollToPage(nextPage);
        }, 5000);
    };
    
    const resetAutoScroll = () => {
        // Reset the auto-scroll timer
        if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            startAutoScroll();
        }
    };
    
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
            
            // Clean up auto-scroll interval
            if (autoScrollIntervalRef.current) {
                clearInterval(autoScrollIntervalRef.current);
            }
        };
    }, [navigate]);

    // Start auto-scrolling when problems are loaded
    useEffect(() => {
        if (problems.length > 0 && !isLoading) {
            startAutoScroll();
            
            // Add scroll event listener to update current page on manual scroll
            const handleScrollEvent = () => {
                if (!problemsContainerRef.current) return;
                
                const container = problemsContainerRef.current;
                const scrollPosition = container.scrollLeft;
                const scrollAmount = container.clientWidth * 0.8;
                const newPage = Math.round(scrollPosition / scrollAmount);
                
                if (newPage !== currentPage) {
                    setCurrentPage(Math.max(0, Math.min(newPage, Math.ceil(problems.length / itemsPerView) - 1)));
                    resetAutoScroll();
                }
            };
            
            const container = problemsContainerRef.current;
            if (container) {
                container.addEventListener('scroll', handleScrollEvent);
            }
            
            return () => {
                if (container) {
                    container.removeEventListener('scroll', handleScrollEvent);
                }
                if (autoScrollIntervalRef.current) {
                    clearInterval(autoScrollIntervalRef.current);
                }
            };
        }
    }, [problems, isLoading, currentPage, itemsPerView]);
    
    // Handle window resize for responsive behavior
    useEffect(() => {
        const handleResize = () => {
            // Recalculate items per view and adjust scroll position
            if (problemsContainerRef.current) {
                scrollToPage(currentPage);
            }
        };
        
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [currentPage]);
    
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
    
    // --- Gamification Functions ---
    const updateUserXP = async (xpToAdd) => {
        if (!user || !userData) return;
        
        try {
            // Calculate new XP and level
            const newXP = (userData.xp || 0) + xpToAdd;
            const newLevel = Math.floor(newXP / 100) + 1; // Level up every 100 XP
            
            // Determine if user leveled up
            const didLevelUp = newLevel > (userData.level || 1);
            
            // Update badge if needed based on XP milestones
            let newBadge = userData.badge || 'Rookie Coder';
            let newBadgeDescription = userData.badge_description || 'Complete challenges to earn badges';
            
            if (newXP >= 1000) {
                newBadge = 'Coding Master';
                newBadgeDescription = 'Achieved mastery with 1000+ XP';
            } else if (newXP >= 750) {
                newBadge = 'Advanced Developer';
                newBadgeDescription = 'Reached advanced status with 750+ XP';
            } else if (newXP >= 500) {
                newBadge = 'Skilled Programmer';
                newBadgeDescription = 'Demonstrated skill with 500+ XP';
            } else if (newXP >= 250) {
                newBadge = 'Code Enthusiast';
                newBadgeDescription = 'Showing dedication with 250+ XP';
            }
            
            // Update user data in Supabase
            const { error } = await supabase
                .from('users')
                .update({
                    xp: newXP,
                    level: newLevel,
                    badge: newBadge,
                    badge_description: newBadgeDescription
                })
                .eq('id', user.id);
                
            if (error) {
                console.error('Error updating user XP:', error);
                return;
            }
            
            // Update local state
            setUserData(prev => ({
                ...prev,
                xp: newXP,
                level: newLevel,
                badge: newBadge,
                badge_description: newBadgeDescription
            }));
            
            // Show level up notification if applicable
            if (didLevelUp) {
                // You could implement a toast notification here
                console.log(`Congratulations! You've reached level ${newLevel}!`);
            }
            
            return { newXP, newLevel, newBadge };
        } catch (err) {
            console.error('Error in updateUserXP:', err);
        }
    };
    
    // Toggle between Classic and Maverick modes
    const togglePreferredMode = async () => {
        if (!user || !userData) return;
        
        try {
            // Toggle between Classic and Maverick
            const newMode = userData.preferred_mode === 'Maverick' ? 'Classic' : 'Maverick';
            
            // Update in Supabase
            const { error } = await supabase
                .from('users')
                .update({ preferred_mode: newMode })
                .eq('id', user.id);
                
            if (error) {
                console.error('Error updating preferred mode:', error);
                return;
            }
            
            // Update local state
            setUserData(prev => ({
                ...prev,
                preferred_mode: newMode
            }));
            
            // You could add a visual feedback here
            console.log(`Mode switched to ${newMode}`);
        } catch (err) {
            console.error('Error toggling preferred mode:', err);
        }
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
                            
                            {/* Basic User Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                            
                            {/* Gamification Tiles */}
                            <h3 className="text-lg font-semibold mb-4 text-purple-300">Your Progress</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* XP Tile */}
                                <motion.div 
                                    className="bg-gradient-to-br from-purple-900/40 to-purple-600/20 backdrop-blur-lg rounded-xl p-4 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group"
                                    whilehover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-purple-300 font-semibold">Experience Points</h4>
                                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-1 group-hover:text-purple-200 transition-colors">
                                        {userData.xp || 0} XP
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {userData.xp >= 1000 ? 'Expert Level' : userData.xp >= 500 ? 'Intermediate Level' : 'Beginner Level'}
                                    </div>
                                </motion.div>
                                
                                {/* Level Tile */}
                                <motion.div 
                                    className="bg-gradient-to-br from-blue-900/40 to-blue-600/20 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
                                    whilehover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-blue-300 font-semibold">Current Level</h4>
                                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-1 group-hover:text-blue-200 transition-colors">
                                        Level {userData.level || 1}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {userData.xp ? `${Math.min(100, Math.floor((userData.xp % 100) / 100 * 100))}% to Level ${(userData.level || 1) + 1}` : '0% to Level 2'}
                                    </div>
                                </motion.div>
                                
                                {/* Badge Tile */}
                                <motion.div 
                                    className="bg-gradient-to-br from-yellow-900/40 to-yellow-600/20 backdrop-blur-lg rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10 group"
                                    whilehover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-yellow-300 font-semibold">Current Badge</h4>
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-yellow-200 transition-colors">
                                        {userData.badge || 'Rookie Coder'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {userData.badge_description || 'Complete challenges to earn badges'}
                                    </div>
                                </motion.div>
                                
                                {/* Preferred Mode Tile */}
                                <motion.div 
                                    className="bg-gradient-to-br from-green-900/40 to-green-600/20 backdrop-blur-lg rounded-xl p-4 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 group"
                                    whilehover={{ y: -5 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    onClick={togglePreferredMode}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-green-300 font-semibold">Preferred Mode</h4>
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-bold text-white mb-1 group-hover:text-green-200 transition-colors">
                                        {userData.preferred_mode || 'Classic'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {userData.preferred_mode === 'Maverick' ? 'Animated UI with advanced features' : 'Clean interface for focused coding'}
                                    </div>
                                    <div className="mt-2 text-xs text-green-300/70">
                                        Click to toggle mode
                                    </div>
                                </motion.div>
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

                    {/* Practice Problems Section - Netflix Style */}
    <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Practice Problems</h2>
        <div className="relative group">
            {/* Left Navigation Arrow */}
            <button 
                onClick={() => handleScroll('left')} 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg transform hover:scale-110 focus:outline-none"
                aria-label="Scroll left"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            
            {/* Problems Carousel */}
            <div 
                ref={problemsContainerRef} 
                className="flex overflow-x-hidden pb-6 gap-4 scroll-smooth"
            >
                <AnimatePresence>
                    {isFetchingProblems || isFetchingSubmissions ? (
                        <p className="text-gray-400 py-12 text-center w-full">Fetching problems and submissions...</p>
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
                                    className="flex-shrink-0 w-64 md:w-72 transform transition-all duration-300 hover:scale-105 hover:z-10"
                                >
                                    <Link 
                                        to={`/editor/${problem.id}`}
                                        className={`backdrop-blur-xl border rounded-2xl p-4 flex flex-col justify-between text-left w-full h-full transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl ${
                                            isSolved 
                                                ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20' 
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="relative h-32 mb-3 overflow-hidden rounded-lg bg-gray-800 transform transition-transform duration-300 hover:brightness-110">
                                            {/* Problem image or placeholder */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                                                <span className="text-4xl font-bold text-white opacity-20">{problem.id}</span>
                                            </div>
                                            <div className="absolute top-0 right-0 m-2">
                                                {renderDifficultyBadge(problem.difficulty)}
                                            </div>
                                            {isSolved && (
                                                <div className="absolute bottom-0 left-0 m-2 flex items-center text-green-400 text-xs font-semibold bg-gray-900 bg-opacity-70 px-2 py-1 rounded">
                                                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                                    </svg>
                                                    Solved
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg mb-2 truncate">{problem.title}</h4>
                                            <p className="text-sm text-gray-400 truncate">{problem.category}</p>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.p 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="text-gray-400 w-full py-12 text-center"
                        >
                            No practice problems found.
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Right Navigation Arrow */}
            <button 
                onClick={() => handleScroll('right')} 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg transform hover:scale-110 focus:outline-none"
                aria-label="Scroll right"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
            
            {/* Gradient Overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-black to-transparent pointer-events-none z-20"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none z-20"></div>
            
            {/* Progress Indicators */}
            <div className="flex justify-center mt-4 gap-1.5">
                {Array.from({ length: Math.ceil(problems.length / itemsPerView) }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollToPage(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            currentPage === index ? 'w-6 bg-white' : 'w-3 bg-white/30 hover:bg-white/50'
                        }`}
                        aria-label={`Go to page ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    </div>
                </main>
            </div>
        </div>
    );
}