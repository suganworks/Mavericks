import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import useAssessmentSecurity from "../hooks/useAssessmentSecurity";

const AssessmentResults = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [isScoreUpdated, setIsScoreUpdated] = useState(false);
    const [output, setOutput] = useState("");
    
    // Assessment security implementation - read-only mode for results page
    useAssessmentSecurity({
        onWarning: (warningCount, maxWarnings) => {
            setOutput(`⚠️ WARNING: Tab switching detected (${warningCount}/${maxWarnings}). Your results may be invalidated if you continue.`);
        },
        // No auto-submit on results page, but still track warnings
        maxWarnings: 999,
        isActive: true
    });
    
    // Get scores from location state
    const { quizScore = 0, codingScore = 0, totalScore = 0, testResults = [], autoSubmitted = false } = location.state || {};

    useEffect(() => {
        // If no scores are available in location state, redirect to assessments page
        if (!location.state) {
            navigate('/assessments');
        }
    }, [location.state, navigate]);
    
    useEffect(() => {
        // Update user's score in Supabase if not already updated
        const updateUserScore = async () => {
            if (user && totalScore > 0 && !isScoreUpdated) {
                try {
                    const { error } = await supabase
                        .rpc('increment_user_score', { 
                            user_id: user.id, 
                            score_increment: totalScore 
                        });
                        
                    if (error) throw error;
                    setIsScoreUpdated(true);
                    console.log('User score updated successfully');
                } catch (error) {
                    console.error('Error updating user score:', error);
                }
            }
        };
        
        updateUserScore();
    }, [user, totalScore, isScoreUpdated]);

    const getFeedback = (score) => {
        if (score >= 90) {
            return "Excellent work! You've demonstrated exceptional understanding of the concepts and strong problem-solving skills.";
        } else if (score >= 70) {
            return "Great job! You have a solid grasp of the concepts, with some room for improvement in certain areas.";
        } else if (score >= 50) {
            return "Good effort! You understand the basics, but should focus on strengthening your knowledge and practice more.";
        } else {
            return "Keep practicing! This topic requires more study and practice to build your understanding and skills.";
        }
    };

    const exitAssessment = () => {
        navigate('/assessments');
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            {/* Header */}
            <div className="bg-white shadow-md p-4">
                <h1 className="text-xl font-bold">Assessment Results</h1>
            </div>

            {/* Main Content */}
            <div className="container mx-auto p-4">
                {output && (
                    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
                        <p>{output}</p>
                    </div>
                )}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto"
                >
                    <h2 className="text-2xl font-bold mb-6 text-center">{id} Assessment Results</h2>
                    
                    {autoSubmitted && (
                        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                            <p className="font-bold">Note:</p>
                            <p>Your assessment was auto-submitted due to time expiration or tab switching. Only your quiz score has been counted.</p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold mb-2">Quiz Score</h3>
                            <p className="text-3xl font-bold text-blue-600">{quizScore}%</p>
                            <p className="text-sm text-gray-600 mt-1">40% of Total</p>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold mb-2">Coding Score</h3>
                            <p className="text-3xl font-bold text-green-600">{codingScore}%</p>
                            <p className="text-sm text-gray-600 mt-1">60% of Total</p>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <h3 className="text-lg font-semibold mb-2">Total Score</h3>
                            <p className="text-3xl font-bold text-purple-600">{totalScore}%</p>
                            <p className="text-sm text-gray-600 mt-1">Final Result</p>
                        </div>
                    </div>
                    
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold mb-4">Feedback</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p>{getFeedback(totalScore)}</p>
                        </div>
                    </div>
                    
                    {testResults.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold mb-4">Test Results</h3>
                            
                            <div className="space-y-3">
                                {testResults.map((result, index) => (
                                    <div 
                                        key={index} 
                                        className={`p-3 rounded-lg ${result.passed ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}
                                    >
                                        <div className="flex justify-between">
                                            <span className="font-bold">Test Case {index + 1}:</span>
                                            <span className={`font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                {result.passed ? 'PASSED' : 'FAILED'}
                                            </span>
                                        </div>
                                        <div className="mt-2">
                                            <p><strong>Input:</strong> {result.input}</p>
                                            <p><strong>Expected:</strong> {result.expected}</p>
                                            <p><strong>Actual:</strong> {result.actual}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="text-center">
                        <button 
                            onClick={exitAssessment}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Return to Assessments
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AssessmentResults;
