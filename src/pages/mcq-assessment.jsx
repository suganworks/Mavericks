import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import useAssessmentSecurity from "../hooks/useAssessmentSecurity";
import { moods } from "../../data/moods";

// Get Quiz Questions by Topic (reusing from assessment-flow.jsx)
const getQuizQuestionsByTopic = (topic) => {
    // All possible questions organized by topic
    const allQuestions = {
        "arrays": [
            {
                question: "What is the time complexity of accessing an element in an array by index?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(1)"
            },
            {
                question: "Which of the following operations is NOT O(1) for arrays?",
                options: ["Access by index", "Insertion at the end (with space)", "Insertion at the beginning", "Updating an element"],
                correctAnswer: "Insertion at the beginning"
            },
            {
                question: "What is the space complexity of an array with n elements?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "In JavaScript, which method adds elements to the end of an array?",
                options: ["push()", "pop()", "shift()", "unshift()"],
                correctAnswer: "push()"
            },
            {
                question: "Which data structure is an array optimized for?",
                options: ["Random access", "Insertion/deletion in the middle", "Dynamic size management", "Hierarchical data"],
                correctAnswer: "Random access"
            },
            {
                question: "What is the output of [1,2,3,4,5].slice(1,3) in JavaScript?",
                options: ["[1,2,3]", "[2,3]", "[2,3,4]", "[1,2]"],
                correctAnswer: "[2,3]"
            },
            {
                question: "Which sorting algorithm has the best average time complexity?",
                options: ["Bubble Sort", "Insertion Sort", "Quick Sort", "Selection Sort"],
                correctAnswer: "Quick Sort"
            },
            {
                question: "What is the time complexity of searching for an element in an unsorted array?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "In Python, what does the list comprehension [x for x in range(5)] produce?",
                options: ["[0, 1, 2, 3, 4]", "[1, 2, 3, 4, 5]", "[0, 1, 2, 3, 4, 5]", "[1, 2, 3, 4]"],
                correctAnswer: "[0, 1, 2, 3, 4]"
            },
            {
                question: "Which of these is NOT a valid way to iterate through an array in JavaScript?",
                options: ["for (let i = 0; i < arr.length; i++)", "for (let item of arr)", "arr.forEach(item => {})", "arr.iterate(item => {})"],
                correctAnswer: "arr.iterate(item => {})"
            }
        ],
        "strings": [
            {
                question: "What is the time complexity of string concatenation in most languages?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "Which of the following is true about strings in most programming languages?",
                options: ["Strings are mutable", "Strings are immutable", "Strings are primitive types in all languages", "Strings have O(1) concatenation"],
                correctAnswer: "Strings are immutable"
            },
            {
                question: "What is the time complexity of checking if a string is a palindrome?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "In Python, what does the method str.strip() do?",
                options: ["Removes all whitespace", "Removes leading and trailing whitespace", "Removes specified characters", "Splits the string"],
                correctAnswer: "Removes leading and trailing whitespace"
            },
            {
                question: "Which algorithm is commonly used for pattern matching in strings?",
                options: ["Bubble Sort", "Dijkstra's Algorithm", "Knuth-Morris-Pratt", "Breadth-First Search"],
                correctAnswer: "Knuth-Morris-Pratt"
            },
            {
                question: "What is the output of 'Hello'.substring(1,3) in JavaScript?",
                options: ["'He'", "'el'", "'ell'", "'ello'"],
                correctAnswer: "'el'"
            },
            {
                question: "Which of these is NOT a common string operation?",
                options: ["Concatenation", "Substring", "Sorting", "Comparison"],
                correctAnswer: "Sorting"
            },
            {
                question: "What is the space complexity of creating a substring?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "In JavaScript, which method converts a string to lowercase?",
                options: ["toLowerCase()", "toLower()", "lowerCase()", "caseLower()"],
                correctAnswer: "toLowerCase()"
            },
            {
                question: "What is the result of 'a' + 'b' + 'c' in most programming languages?",
                options: ["Error", "abc", "a+b+c", "[a,b,c]"],
                correctAnswer: "abc"
            }
        ],
        "recursion": [
            {
                question: "What is a base case in recursion?",
                options: [
                    "The case where the function calls itself", 
                    "The case where the function returns without calling itself", 
                    "The first call to the function", 
                    "The last call to the function"
                ],
                correctAnswer: "The case where the function returns without calling itself"
            },
            {
                question: "What happens if a recursive function doesn't have a base case?",
                options: [
                    "It will run faster", 
                    "It will eventually stop on its own", 
                    "It will cause a stack overflow", 
                    "It will automatically optimize itself"
                ],
                correctAnswer: "It will cause a stack overflow"
            },
            {
                question: "Which of these problems is best solved using recursion?",
                options: [
                    "Finding the maximum value in an array", 
                    "Traversing a binary tree", 
                    "Sorting an array of integers", 
                    "Checking if a string is a palindrome"
                ],
                correctAnswer: "Traversing a binary tree"
            },
            {
                question: "What is tail recursion?",
                options: [
                    "A recursion that never ends", 
                    "A recursive call that is the last operation in the function", 
                    "A recursion with multiple base cases", 
                    "A recursion that uses global variables"
                ],
                correctAnswer: "A recursive call that is the last operation in the function"
            },
            {
                question: "What is the space complexity of a recursive function with depth n?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(n)"
            },
            {
                question: "Which of these is NOT a common use case for recursion?",
                options: [
                    "Tree traversal", 
                    "Calculating factorial", 
                    "Sorting large datasets", 
                    "Solving Tower of Hanoi"
                ],
                correctAnswer: "Sorting large datasets"
            },
            {
                question: "What is memoization in the context of recursion?",
                options: [
                    "A technique to avoid infinite recursion", 
                    "A way to store previously computed results to avoid redundant calculations", 
                    "A method to reduce the number of recursive calls", 
                    "A technique to convert recursion to iteration"
                ],
                correctAnswer: "A way to store previously computed results to avoid redundant calculations"
            },
            {
                question: "What is the recurrence relation for the Fibonacci sequence?",
                options: [
                    "F(n) = F(n-1) + F(n-2)", 
                    "F(n) = F(n-1) * n", 
                    "F(n) = F(n-1) + n", 
                    "F(n) = F(n/2) + 1"
                ],
                correctAnswer: "F(n) = F(n-1) + F(n-2)"
            },
            {
                question: "Which of these algorithms commonly uses recursion?",
                options: [
                    "Bubble Sort", 
                    "Linear Search", 
                    "Merge Sort", 
                    "Insertion Sort"
                ],
                correctAnswer: "Merge Sort"
            },
            {
                question: "What is the main disadvantage of recursion compared to iteration?",
                options: [
                    "Recursion is always slower", 
                    "Recursion uses more memory due to the call stack", 
                    "Recursion cannot solve all problems that iteration can", 
                    "Recursion is more difficult to debug"
                ],
                correctAnswer: "Recursion uses more memory due to the call stack"
            }
        ],
        "data-structures": [
            {
                question: "Which data structure uses LIFO (Last In First Out) principle?",
                options: ["Queue", "Stack", "Linked List", "Tree"],
                correctAnswer: "Stack"
            },
            {
                question: "Which data structure uses FIFO (First In First Out) principle?",
                options: ["Stack", "Queue", "Binary Search Tree", "Heap"],
                correctAnswer: "Queue"
            },
            {
                question: "What is the time complexity of searching in a balanced binary search tree?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(log n)"
            },
            {
                question: "Which of these is NOT a linear data structure?",
                options: ["Array", "Linked List", "Stack", "Tree"],
                correctAnswer: "Tree"
            },
            {
                question: "What is the main advantage of a hash table?",
                options: [
                    "Ordered elements", 
                    "Fast average case insertion, deletion, and lookup", 
                    "Memory efficiency", 
                    "Hierarchical organization"
                ],
                correctAnswer: "Fast average case insertion, deletion, and lookup"
            },
            {
                question: "In a min-heap, which element is at the root?",
                options: [
                    "The largest element", 
                    "The smallest element", 
                    "The middle element", 
                    "A random element"
                ],
                correctAnswer: "The smallest element"
            },
            {
                question: "What is the worst-case time complexity for insertion in a linked list if you have a reference to the insertion position?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(1)"
            },
            {
                question: "Which data structure would be most efficient for implementing a dictionary?",
                options: ["Array", "Linked List", "Hash Table", "Stack"],
                correctAnswer: "Hash Table"
            },
            {
                question: "What is a graph?",
                options: [
                    "A collection of nodes with edges between them", 
                    "A hierarchical data structure with a root node", 
                    "A linear data structure with constant time access", 
                    "A visualization of numerical data"
                ],
                correctAnswer: "A collection of nodes with edges between them"
            },
            {
                question: "Which of these operations is NOT typically O(1) for a hash table?",
                options: ["Insertion", "Deletion", "Lookup", "Finding the minimum value"],
                correctAnswer: "Finding the minimum value"
            }
        ],
        "algorithms": [
            {
                question: "Which sorting algorithm has the best average-case time complexity?",
                options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
                correctAnswer: "Quick Sort"
            },
            {
                question: "What is the time complexity of binary search?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(log n)"
            },
            {
                question: "Which algorithm is used to find the shortest path in a weighted graph?",
                options: ["Depth-First Search", "Breadth-First Search", "Dijkstra's Algorithm", "Bubble Sort"],
                correctAnswer: "Dijkstra's Algorithm"
            },
            {
                question: "What is the worst-case time complexity of quicksort?",
                options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
                correctAnswer: "O(n²)"
            },
            {
                question: "Which of these is NOT a divide-and-conquer algorithm?",
                options: ["Merge Sort", "Quick Sort", "Binary Search", "Bubble Sort"],
                correctAnswer: "Bubble Sort"
            },
            {
                question: "What is the primary goal of dynamic programming?",
                options: [
                    "To solve problems by breaking them into subproblems and storing their solutions", 
                    "To find the shortest path in a graph", 
                    "To sort data efficiently", 
                    "To optimize memory usage"
                ],
                correctAnswer: "To solve problems by breaking them into subproblems and storing their solutions"
            },
            {
                question: "Which algorithm is used for topological sorting of a directed acyclic graph?",
                options: ["Breadth-First Search", "Depth-First Search", "Dijkstra's Algorithm", "Prim's Algorithm"],
                correctAnswer: "Depth-First Search"
            },
            {
                question: "What is the time complexity of the best sorting algorithms?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
                correctAnswer: "O(n log n)"
            },
            {
                question: "Which of these is a greedy algorithm?",
                options: ["Merge Sort", "Dynamic Programming", "Kruskal's Algorithm", "Binary Search"],
                correctAnswer: "Kruskal's Algorithm"
            },
            {
                question: "What is the primary difference between BFS and DFS?",
                options: [
                    "BFS uses a queue, DFS uses a stack", 
                    "BFS is faster than DFS", 
                    "DFS uses less memory than BFS", 
                    "BFS can only be used on trees, DFS on any graph"
                ],
                correctAnswer: "BFS uses a queue, DFS uses a stack"
            }
        ],
        "dynamic-programming": [
            {
                question: "What are the two key attributes of a dynamic programming problem?",
                options: [
                    "Sorting and searching", 
                    "Overlapping subproblems and optimal substructure", 
                    "Recursion and iteration", 
                    "Greedy choice and memoization"
                ],
                correctAnswer: "Overlapping subproblems and optimal substructure"
            },
            {
                question: "What is memoization in dynamic programming?",
                options: [
                    "A technique to sort arrays faster", 
                    "A way to store previously computed results to avoid redundant calculations", 
                    "A method to reduce space complexity", 
                    "A technique to convert recursion to iteration"
                ],
                correctAnswer: "A way to store previously computed results to avoid redundant calculations"
            },
            {
                question: "Which of these problems is typically solved using dynamic programming?",
                options: ["Finding the shortest path in an unweighted graph", "Sorting an array", "The knapsack problem", "Finding a specific element in an array"],
                correctAnswer: "The knapsack problem"
            },
            {
                question: "What is the difference between 'top-down' and 'bottom-up' approaches in dynamic programming?",
                options: [
                    "Top-down uses more memory, bottom-up is faster", 
                    "Top-down uses recursion with memoization, bottom-up uses iteration with tabulation", 
                    "Top-down is for optimization problems, bottom-up is for counting problems", 
                    "There is no difference, they are just different names"
                ],
                correctAnswer: "Top-down uses recursion with memoization, bottom-up uses iteration with tabulation"
            },
            {
                question: "Which of these is NOT a classic dynamic programming problem?",
                options: ["Longest Common Subsequence", "Fibonacci Sequence", "Binary Search", "Edit Distance"],
                correctAnswer: "Binary Search"
            },
            {
                question: "What is the time complexity of computing the nth Fibonacci number using dynamic programming?",
                options: ["O(1)", "O(log n)", "O(n)", "O(2^n)"],
                correctAnswer: "O(n)"
            },
            {
                question: "What is the 'state' in a dynamic programming problem?",
                options: [
                    "The final answer to the problem", 
                    "The variables that define a subproblem", 
                    "The recursive function used", 
                    "The base case of the recursion"
                ],
                correctAnswer: "The variables that define a subproblem"
            },
            {
                question: "Which of these techniques is NOT used in dynamic programming?",
                options: ["Memoization", "Tabulation", "State transition", "Backtracking"],
                correctAnswer: "Backtracking"
            },
            {
                question: "What is the primary advantage of dynamic programming over recursion?",
                options: [
                    "It's easier to implement", 
                    "It avoids redundant calculations", 
                    "It always uses less memory", 
                    "It's always faster"
                ],
                correctAnswer: "It avoids redundant calculations"
            },
            {
                question: "Which of these problems would NOT benefit from dynamic programming?",
                options: [
                    "Finding all possible subsets of a set", 
                    "Longest increasing subsequence", 
                    "Matrix chain multiplication", 
                    "Finding the maximum element in an array"
                ],
                correctAnswer: "Finding the maximum element in an array"
            }
        ],
        "weekly-challenge": [
            {
                question: "What is a minimum spanning tree?",
                options: [
                    "A tree with the minimum number of nodes", 
                    "A subset of edges that forms a tree including every vertex with minimum total edge weight", 
                    "A binary tree with minimum height", 
                    "A path that visits each node exactly once"
                ],
                correctAnswer: "A subset of edges that forms a tree including every vertex with minimum total edge weight"
            },
            {
                question: "Which algorithm finds the maximum flow in a flow network?",
                options: ["Dijkstra's Algorithm", "Prim's Algorithm", "Ford-Fulkerson Algorithm", "Bellman-Ford Algorithm"],
                correctAnswer: "Ford-Fulkerson Algorithm"
            },
            {
                question: "What is the time complexity of the Floyd-Warshall algorithm for finding shortest paths?",
                options: ["O(V)", "O(E log V)", "O(V²)", "O(V³)"],
                correctAnswer: "O(V³)"
            },
            {
                question: "In graph theory, what is a bipartite graph?",
                options: [
                    "A graph with exactly two connected components", 
                    "A graph whose vertices can be divided into two disjoint sets such that every edge connects vertices from different sets", 
                    "A graph with exactly two cycles", 
                    "A graph with exactly two nodes"
                ],
                correctAnswer: "A graph whose vertices can be divided into two disjoint sets such that every edge connects vertices from different sets"
            },
            {
                question: "What does the max-flow min-cut theorem state?",
                options: [
                    "The maximum flow in a network equals the minimum capacity of any cut", 
                    "The maximum flow equals the minimum number of edges", 
                    "The maximum flow equals the minimum number of nodes", 
                    "The maximum flow equals the sum of all edge capacities"
                ],
                correctAnswer: "The maximum flow in a network equals the minimum capacity of any cut"
            },
            {
                question: "Which of these is NOT a graph traversal algorithm?",
                options: ["Depth-First Search", "Breadth-First Search", "Quick Sort", "Topological Sort"],
                correctAnswer: "Quick Sort"
            },
            {
                question: "What is a strongly connected component in a directed graph?",
                options: [
                    "A component with the maximum number of edges", 
                    "A subgraph where every vertex is reachable from every other vertex", 
                    "A component with exactly one cycle", 
                    "A component with no cycles"
                ],
                correctAnswer: "A subgraph where every vertex is reachable from every other vertex"
            },
            {
                question: "Which algorithm is used to find all pairs shortest paths in a graph?",
                options: ["Dijkstra's Algorithm", "Bellman-Ford Algorithm", "Floyd-Warshall Algorithm", "Prim's Algorithm"],
                correctAnswer: "Floyd-Warshall Algorithm"
            },
            {
                question: "What is the chromatic number of a graph?",
                options: [
                    "The number of edges in the graph", 
                    "The minimum number of colors needed to color the vertices such that no adjacent vertices have the same color", 
                    "The number of connected components", 
                    "The maximum degree of any vertex"
                ],
                correctAnswer: "The minimum number of colors needed to color the vertices such that no adjacent vertices have the same color"
            },
            {
                question: "What is the time complexity of Kruskal's algorithm for finding a minimum spanning tree?",
                options: ["O(V)", "O(E)", "O(V log V)", "O(E log E)"],
                correctAnswer: "O(E log E)"
            }
        ],
        "daily-quiz": [
            {
                question: "What is the time complexity of accessing an element in an array by index?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(1)"
            },
            {
                question: "Which data structure uses LIFO (Last In First Out) principle?",
                options: ["Queue", "Stack", "Linked List", "Tree"],
                correctAnswer: "Stack"
            },
            {
                question: "What is a base case in recursion?",
                options: [
                    "The case where the function calls itself", 
                    "The case where the function returns without calling itself", 
                    "The first call to the function", 
                    "The last call to the function"
                ],
                correctAnswer: "The case where the function returns without calling itself"
            },
            {
                question: "Which sorting algorithm has the best average-case time complexity?",
                options: ["Bubble Sort", "Quick Sort", "Insertion Sort", "Selection Sort"],
                correctAnswer: "Quick Sort"
            },
            {
                question: "What is the time complexity of binary search?",
                options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
                correctAnswer: "O(log n)"
            },
            {
                question: "In a min-heap, which element is at the root?",
                options: [
                    "The largest element", 
                    "The smallest element", 
                    "The middle element", 
                    "A random element"
                ],
                correctAnswer: "The smallest element"
            },
            {
                question: "What are the two key attributes of a dynamic programming problem?",
                options: [
                    "Sorting and searching", 
                    "Overlapping subproblems and optimal substructure", 
                    "Recursion and iteration", 
                    "Greedy choice and memoization"
                ],
                correctAnswer: "Overlapping subproblems and optimal substructure"
            },
            {
                question: "Which of these is NOT a linear data structure?",
                options: ["Array", "Linked List", "Stack", "Tree"],
                correctAnswer: "Tree"
            },
            {
                question: "What is the worst-case time complexity of quicksort?",
                options: ["O(n)", "O(n log n)", "O(n²)", "O(2^n)"],
                correctAnswer: "O(n²)"
            },
            {
                question: "Which algorithm is used to find the shortest path in a weighted graph?",
                options: ["Depth-First Search", "Breadth-First Search", "Dijkstra's Algorithm", "Bubble Sort"],
                correctAnswer: "Dijkstra's Algorithm"
            }
        ]
    };
    
    // Return questions for the specified topic or an empty array if topic not found
    return allQuestions[topic] || [];
};

const MCQAssessment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [loading, setLoading] = useState(true);
    const [output, setOutput] = useState("");
    const [currentMood, setCurrentMood] = useState("Galaxy Night"); // Default mood
    
    // Assessment security implementation
    const { tabSwitchWarnings } = useAssessmentSecurity({
        onWarning: (warningCount, maxWarnings) => {
            setOutput(`⚠️ WARNING: Tab switching detected (${warningCount}/${maxWarnings}). Your assessment will be auto-submitted if you continue.`);
        },
        onAutoSubmit: () => {
            setIsTimeUp(true);
            handleQuizSubmit();
        },
        isActive: !quizSubmitted && !isTimeUp && !loading
    });

    // --- User Authentication ---
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data?.user) {
                setUser(data.user);
                setLoading(false);
            } else {
                navigate("/login");
            }
        };
        getUser();
    }, [navigate]);

    // --- Load Quiz Questions ---
    useEffect(() => {
        if (!id || loading) return;
        
        // Load 10 quiz questions for the topic
        const allQuestions = getQuizQuestionsByTopic(id);
        
        // If we have more than 10 questions, randomly select 10
        if (allQuestions.length > 10) {
            const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
            setQuizQuestions(shuffled.slice(0, 10));
        } else {
            setQuizQuestions(allQuestions);
        }
    }, [id, loading]);

    // --- Timer Countdown Logic ---
    useEffect(() => {
        if (quizSubmitted || isTimeUp || loading) return;

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    setIsTimeUp(true);
                    // Auto-submit quiz when time is up
                    handleQuizSubmit();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quizSubmitted, isTimeUp, loading]);

    // --- Helper Functions ---
    const handleAnswerSelect = (questionIndex, answer) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleQuizSubmit = () => {
        if (quizSubmitted) return;
        
        let score = 0;
        
        quizQuestions.forEach((question, index) => {
            if (selectedAnswers[index] === question.correctAnswer) {
                score++;
            }
        });
        
        const percentScore = Math.round((score / quizQuestions.length) * 100);
        setQuizScore(percentScore);
        setQuizSubmitted(true);
        
        // Save quiz results to database
        saveQuizResults(percentScore);
        
        // Store quiz score in localStorage for the coding phase
        localStorage.setItem('quizScore', percentScore.toString());
        
        // Navigate to coding section after quiz
        setTimeout(() => {
            navigate(`/assessments/${id}/code`);
        }, 3000);
    };

    const saveQuizResults = async (score) => {
        if (!user || !id) return;

        try {
            // Record quiz results in database
            const { error } = await supabase
                .from("user_assessments")
                .upsert({
                    user_id: user.id,
                    problem_id: id,
                    topic: id,
                    started_at: new Date().toISOString(),
                    status: "in_progress",
                    quiz_score: score
                });

            if (error) throw error;
        } catch (error) {
            console.error("Error saving quiz results:", error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Render loading state
    if (loading) {
        return (
            <div 
                className="min-h-screen relative overflow-hidden flex items-center justify-center"
                style={{
                    backgroundImage: `url(${moods[currentMood].gif})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="text-center relative z-10">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl text-white">Loading Assessment...</p>
                </div>
            </div>
        );
    }

    return (
        <div 
            className="min-h-screen relative overflow-hidden"
            style={{
                backgroundImage: `url(${moods[currentMood].gif})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            {/* Mood Selector */}
            <div className="absolute top-4 right-4 z-10">
                <select 
                    className="bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-lg px-3 py-2"
                    value={currentMood}
                    onChange={(e) => setCurrentMood(e.target.value)}
                >
                    {Object.keys(moods).map(mood => (
                        <option key={mood} value={mood}>
                            {moods[mood].icon} {mood}
                        </option>
                    ))}
                </select>
            </div>
            
            {/* Header */}
            <div className="backdrop-blur-md bg-white/10 border-b border-white/20 p-4 flex justify-between items-center relative z-10 text-white">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold">{id} Quiz</h1>
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className={`font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-white'}`}>
                        Time Left: {formatTime(timeLeft)}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4 relative z-10">
                {output && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="backdrop-blur-xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-200 p-4 mb-4 rounded-xl"
                    >
                        <p>{output}</p>
                    </motion.div>
                )}
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl shadow-2xl p-8 mb-6"
                >
                    <h2 className="text-3xl font-bold mb-6 text-white">Knowledge Assessment</h2>
                    <p className="mb-8 text-white/80 text-lg">Answer the following 10 questions about {id}. You have 10 minutes to complete this section.</p>
                    
                    {quizSubmitted ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center p-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl"
                        >
                            <h3 className="text-2xl font-bold mb-4 text-white">Quiz Completed!</h3>
                            <p className="text-xl text-white mb-2">Your Score: {quizScore}%</p>
                            <p className="text-white/80">Proceeding to coding challenge...</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-6">
                            {quizQuestions.map((question, index) => (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
                                >
                                    <p className="font-bold mb-4 text-white text-lg">{index + 1}. {question.question}</p>
                                    <div className="space-y-3">
                                        {question.options.map((option, optIndex) => (
                                            <motion.div 
                                                key={optIndex} 
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-center"
                                            >
                                                <input 
                                                    type="radio" 
                                                    id={`q${index}-opt${optIndex}`}
                                                    name={`question-${index}`}
                                                    value={option}
                                                    checked={selectedAnswers[index] === option}
                                                    onChange={() => handleAnswerSelect(index, option)}
                                                    disabled={isTimeUp}
                                                    className="mr-3 w-4 h-4 text-blue-600 bg-white/20 border-white/30 focus:ring-blue-500/50"
                                                />
                                                <label 
                                                    htmlFor={`q${index}-opt${optIndex}`}
                                                    className="text-white/90 cursor-pointer hover:text-white transition-colors"
                                                >
                                                    {option}
                                                </label>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                            
                            <motion.button 
                                onClick={handleQuizSubmit}
                                disabled={Object.keys(selectedAnswers).length < quizQuestions.length || isTimeUp}
                                className={`mt-8 px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                                    Object.keys(selectedAnswers).length < quizQuestions.length 
                                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/25 transform hover:scale-105'
                                }`}
                                whileHover={Object.keys(selectedAnswers).length >= quizQuestions.length ? { scale: 1.05 } : {}}
                                whileTap={{ scale: 0.95 }}
                            >
                                Submit Quiz
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default MCQAssessment;