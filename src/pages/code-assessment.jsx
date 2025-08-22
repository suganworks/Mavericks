import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { marked } from "marked";

export default function CodeAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const quizScore = location.state?.quizScore || 0;
  
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  
  const editorRef = useRef(null);
  const timerRef = useRef(null);
  const tabSwitchRef = useRef(0);

  // Default code templates for different languages
  const defaultTemplates = {
    python: `def solution():
    # Write your solution here
    pass

# Test your solution
if __name__ == "__main__":
    result = solution()
    print(result)`,
    javascript: `function solution() {
    // Write your solution here
}

// Test your solution
console.log(solution());`,
    java: `public class Solution {
    public static void main(String[] args) {
        // Write your solution here
        System.out.println("Hello World");
    }
}`,
    cpp: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    // Write your solution here
    cout << "Hello World" << endl;
    return 0;
}`,
    csharp: `using System;

class Solution {
    public static void Main(string[] args) {
        // Write your solution here
        Console.WriteLine("Hello World");
    }
}`
  };

  // Language icons
  const LanguageIcons = {
    python: (
      <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
        <linearGradient id="python-original-a" gradientUnits="userSpaceOnUse" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stopColor="#5A9FD4"></stop><stop offset="1" stopColor="#306998"></stop></linearGradient>
        <linearGradient id="python-original-b" gradientUnits="userSpaceOnUse" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stopColor="#FFD43B"></stop><stop offset="1" stopColor="#FFE873"></stop></linearGradient>
        <path fill="url(#python-original-a)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" transform="translate(0 10.26)"></path><path fill="url(#python-original-b)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" transform="translate(0 10.26)"></path><path opacity=".444" fill="#fff" fillRule="nonzero" d="M97.309 119.597c0 3.543-14.816 6.416-33.091 6.416-18.276 0-33.092-2.873-33.092-6.416 0-3.544 14.815-6.417 33.092-6.417 18.275 0 33.091 2.872 33.091 6.417z"></path>
      </svg>
    ),
    javascript: (
      <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
        <path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z"></path><path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z"></path>
      </svg>
    ),
    cpp: (
      <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
        <path fill="#D26383" d="M115.4 30.7L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.7z"></path><path fill="#9C033A" d="M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8l-106.6 62z"></path><path fill="#fff" d="M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8l-12.9-7.6z"></path><path d="M82.1 61.8h5.2v-5.3h4.4v5.3H97v4.4h-5.3v5.2h-4.4v-5.2h-5.2v-4.4zm18.5 0h5.2v-5.3h4.4v5.3h5.3v4.4h-5.3v5.2h-4.4v-5.2h-5.2v-4.4z" fill="#fff"></path>
      </svg>
    ),
    java: (
      <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
        <path fill="#0074BD" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z"></path><path fill="#EA2D2E" d="M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z"></path><path fill="#0074BD" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z"></path><path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z"></path><path fill="#0074BD" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z"></path>
      </svg>
    ),
    csharp: (
      <svg viewBox="0 0 128 128" className="w-5 h-5 mr-2">
        <path fill="#68217A" d="M117.5 33.5l.3-.2c-.6-1.1-1.5-2.1-2.4-2.6L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.6z"></path><path fill="#68217A" d="M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8l-106.6 62z"></path><path fill="#68217A" d="M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17.1 5 21.3 12.5l13-7.5c-6.8-11.9-19.6-20-34.3-20-21.8 0-39.5 17.7-39.5 39.5s17.7 39.5 39.5 39.5c14.6 0 27.4-8 34.2-19.8l-12.9-7.6z"></path><path d="M82.1 61.8h5.2v-5.3h4.4v5.3H97v4.4h-5.3v5.2h-4.4v-5.2h-5.2v-4.4zm18.5 0h5.2v-5.3h4.4v5.3h5.3v4.4h-5.3v5.2h-4.4v-5.2h-5.2v-4.4z" fill="#68217A"></path>
      </svg>
    )
  };

  // Keyword suggestions for different languages
  const keywordSuggestions = {
    python: ["def", "class", "import", "from", "if", "else", "for", "while", "try", "except", "return", "print"],
    javascript: ["function", "const", "let", "var", "if", "else", "for", "while", "try", "catch", "return", "console.log"],
    java: ["public", "class", "static", "void", "main", "String", "int", "if", "else", "for", "while", "try", "catch", "return", "System.out.println"],
    cpp: ["#include", "using", "namespace", "int", "main", "cout", "cin", "if", "else", "for", "while", "try", "catch", "return"],
    csharp: ["using", "namespace", "class", "public", "static", "void", "Main", "string", "int", "if", "else", "for", "while", "try", "catch", "return", "Console.WriteLine"]
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tab switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && assessmentStarted) {
        const newCount = tabSwitchRef.current + 1;
        tabSwitchRef.current = newCount;
        setTabSwitchCount(newCount);
        
        if (newCount >= 3) {
          setOutput("⚠️ Too many tab switches detected! Assessment will be auto-submitted.");
          setTimeout(() => {
            autoSubmitCode();
          }, 2000);
        } else {
          setOutput(`⚠️ Tab switch detected! Warning ${newCount}/3`);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [assessmentStarted]);

  // Timer countdown
  useEffect(() => {
    if (assessmentStarted && timeLeft > 0 && !isTimeUp) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimeUp(true);
            autoSubmitCode();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [assessmentStarted, timeLeft, isTimeUp]);

  // Auto-submit when time is up or too many tab switches
  const autoSubmitCode = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setOutput("Assessment time expired or too many tab switches. Your work has been auto-submitted.");
    
    // Navigate back to assessment dashboard
    setTimeout(() => {
      navigate(`/assessments`, { 
        state: { 
          message: `Assessment auto-submitted due to time expiration. Quiz Score: ${quizScore}%, Total Score: ${quizScore}%`,
          autoSubmitted: true 
        } 
      });
    }, 3000);
  };

  // Fetch problem and start assessment
  useEffect(() => {
    const fetchProblem = async () => {
      if (!id || !user) {
        console.log("Cannot fetch problem - missing id or user:", { id, user });
        return;
      }

      console.log("Fetching problems for topic ID:", id);
      console.log("Current user:", user);

      try {
        // Map topic string IDs to numeric IDs used in the database
        const topicMapping = {
          'arrays': '1',
          'strings': '2',
          'recursion': '3',
          'data-structures': '1',
          'algorithms': '2',
          'dynamic-programming': '3',
          'weekly-challenge': '1',
          'daily-quiz': '2'
        };

        const numericTopicId = topicMapping[id] || id;
        console.log("Using numeric topic ID:", numericTopicId);

        // Fetch a random problem from the problems table
        let { data, error } = await supabase
          .from("problems")
          .select("*")
          .eq("topic", numericTopicId)
          .limit(10); // Get multiple problems to select from

        console.log("First query result:", { data, error });

        // If no problems found with topic, try with category field
        if (!data || data.length === 0) {
          console.log("No problems found with topic, trying category field instead");
          const categoryResult = await supabase
            .from("problems")
            .select("*")
            .eq("category", numericTopicId)
            .limit(10);

          data = categoryResult.data;
          error = categoryResult.error;
          console.log("Category query result:", { data, error });
        }

        // If still no problems found, get random problems from all problems
        if (!data || data.length === 0) {
          console.log("No problems found for this topic, getting random problems");
          const randomResult = await supabase
            .from("problems")
            .select("*")
            .limit(10);

          data = randomResult.data;
          error = randomResult.error;
          console.log("Random query result:", { data, error });
        }

        console.log("Final Supabase response:", { data, error });

        if (error) {
          console.error("Database error:", error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.log("No problems found in database");
          setOutput("No problems found for this topic. Please try another topic.");
          return;
        }

        // Select a random problem from the results
        const selectedProblem = data[Math.floor(Math.random() * data.length)];
        console.log("Selected problem:", selectedProblem);
        setProblem(selectedProblem);
        
        // Set initial code based on language
        const initialCode = selectedProblem.templates && selectedProblem.templates[language] 
          ? selectedProblem.templates[language] 
          : defaultTemplates[language];
        setCode(initialCode);
        
        // Start assessment immediately with timer
        setAssessmentStarted(true);
        setLoading(false);
        
        // Start the timer immediately
        setTimeLeft(1800); // 30 minutes
        
      } catch (error) {
        console.error("Error fetching problem:", error);
        setOutput(`Error loading problem: ${error.message}. Please try again.`);
      }
    };

    if (!loading) {
      fetchProblem();
    }
  }, [id, user, loading, language]);

  // Initialize user and start loading
  useEffect(() => {
    const initializeUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    
    initializeUser();
  }, [navigate]);

  // Run code function - tests 4 cases with strict evaluation
  const runCode = async () => {
    if (!code.trim()) {
      setOutput("Please write some code first!");
      return;
    }

    setIsRunning(true);
    setOutput("Running code with strict evaluation (4 test cases)...");

    try {
      // Get first 4 test cases for Run button
      const testCases = problem?.testCases || [];
      const runTestCases = testCases.slice(0, 4);
      
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY || '',
        },
        body: JSON.stringify({
          code: code,
          language: language,
          testCases: runTestCases,
          mode: 'run',
          strictEvaluation: true,
          maxTestCases: 4
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setOutput(`✅ Run Results (4/4 test cases):\n${result.output}\n\nPassed: ${result.passedTests || 0}/4`);
      } else {
        setOutput(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setOutput(`❌ Error running code: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit code function - tests 12 cases with consolidation
  const submitCode = async () => {
    if (!code.trim()) {
      setOutput("Please write some code first!");
      return;
    }

    setIsSubmitting(true);
    setOutput("Submitting code with comprehensive evaluation (12 test cases)...");

    try {
      // Get up to 12 test cases for Submit button
      const testCases = problem?.testCases || [];
      const submitTestCases = testCases.slice(0, 12);
      
      const response = await fetch('/api/run-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY || '',
        },
        body: JSON.stringify({
          code: code,
          language: language,
          testCases: submitTestCases,
          mode: 'submit',
          strictEvaluation: true,
          consolidateResults: true,
          maxTestCases: 12
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        setOutput(`❌ Error: ${result.error}`);
        setIsSubmitting(false);
        return;
      }

      // Calculate score based on test results
      const testResults = result.testResults || [];
      const passedTests = testResults.filter(t => t.passed).length;
      const totalTests = testResults.length;
      const codingScore = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
      
      // Calculate total score (quiz + coding)
      const total = Math.round((quizScore + codingScore) / 2);

      // Save to submissions table with consolidated results
      try {
        const { error: submissionError } = await supabase
          .from("submissions")
          .insert({
            user_id: user.id,
            problem_id: problem.id,
            code: code,
            language: language,
            output: result.consolidatedOutput || result.output,
            topic: id,
            passed_all_tests: passedTests === totalTests,
            score: codingScore,
            test_results: JSON.stringify(testResults),
            total_test_cases: totalTests,
            passed_test_cases: passedTests
          });

        if (submissionError) {
          console.error("Error saving submission:", submissionError);
          // Continue with assessment even if saving fails
        }
      } catch (error) {
        console.error("Error saving to submissions table:", error);
        // Continue with assessment even if saving fails
      }

      // Save to user_assessments table
      const { error: userError } = await supabase
        .from("user_assessments")
        .insert({
          user_id: user.id,
          problem_id: problem.id,
          quiz_score: quizScore,
          coding_score: codingScore,
          total_score: total,
          completed_at: new Date().toISOString(),
          tab_switches: tabSwitchCount
        });

      if (userError) throw userError;

      // Show consolidated results
      setOutput(`🎯 Final Results (${totalTests}/12 test cases):\n${result.consolidatedOutput || result.output}\n\nPassed: ${passedTests}/${totalTests} (${codingScore}%)`);

      // Navigate back to assessment dashboard
      navigate(`/assessments`, { 
        state: { 
          message: `Assessment completed! Quiz Score: ${quizScore}%, Coding Score: ${codingScore}%, Total Score: ${total}%`,
          testResults: result.testResults 
        } 
      });
    } catch (error) {
      console.error("Error submitting code:", error);
      setOutput(`❌ Error submitting code: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Disable copy-paste
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
      // Do nothing - disable copy
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      // Do nothing - disable paste
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyC, () => {
      // Do nothing - disable copy
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyV, () => {
      // Do nothing - disable paste
    });
    
    // Disable right-click context menu
    editor.onContextMenu(() => {
      return false;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading Assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">{id} Assessment</h1>
            <div className="flex items-center space-x-2">
              {LanguageIcons[language]}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
            <div className={`text-sm ${tabSwitchCount > 0 ? 'text-yellow-400' : 'text-gray-300'}`}>
              Tab Switches: {tabSwitchCount}/3
            </div>
            {tabSwitchCount > 0 && (
              <div className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
                ⚠️ Warning
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Problem Description */}
        <div className="w-1/3 bg-gray-800 p-6 overflow-y-auto">
          {/* Security Warning */}
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-200 mb-2">⚠️ Assessment Security</h3>
            <ul className="text-sm text-yellow-100 space-y-1">
              <li>• Copy-paste is disabled in the code editor</li>
              <li>• Tab switching is limited to 3 times</li>
              <li>• Assessment auto-submits after 30 minutes</li>
              <li>• All actions are monitored and logged</li>
            </ul>
          </div>
          {problem ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">Problem Statement</h2>
              <div className="mb-4">
                <span className="inline-block bg-blue-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                  {problem.difficulty} Level
                </span>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="text-lg leading-relaxed" 
                     dangerouslySetInnerHTML={{ __html: marked(problem.description) }}>
                </div>
              </div>

              {problem.examples && problem.examples.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">📝 Examples:</h3>
                  {problem.examples.map((example, index) => (
                    <div key={index} className="mb-4 p-3 bg-gray-700 rounded-lg">
                      <div className="mb-2">
                        <strong>Input:</strong> <code className="bg-gray-600 px-2 py-1 rounded">{example.input}</code>
                      </div>
                      <div>
                        <strong>Output:</strong> <code className="bg-gray-600 px-2 py-1 rounded">{example.output}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {problem.constraints && problem.constraints.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">⚠️ Constraints:</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {problem.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading problem...</p>
              </div>
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div className="w-2/3 bg-gray-900 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={setCode}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                automaticLayout: true,
                wordWrap: "on",
                copyWithSyntaxHighlighting: false,
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: false
                },
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnCommitCharacter: true,
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
                wordBasedSuggestions: true
              }}
              onMount={handleEditorDidMount}
            />
          </div>

          {/* Output and Buttons */}
          <div className="bg-gray-800 p-4 border-t border-gray-700">
            {output && (
              <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                <h3 className="font-semibold mb-2">Output:</h3>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{output}</pre>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button 
                  onClick={runCode}
                  disabled={isTimeUp || isRunning}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center ${isTimeUp || isRunning ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 'bg-green-500/70 hover:bg-green-600/70 text-white shadow-lg hover:shadow-green-500/25'}`}
                >
                  {isRunning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Run Code
                    </>
                  )}
                </button>
                
                <button 
                  onClick={submitCode}
                  disabled={isTimeUp || isSubmitting}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center ${isTimeUp || isSubmitting ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 'bg-blue-500/70 hover:bg-blue-600/70 text-white shadow-lg hover:shadow-blue-500/25'}`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Submit Code
                    </>
                  )}
                </button>
              </div>
              
              <div className="text-sm text-gray-300">
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Auto-saving every 30 seconds
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}