import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function HackathonScoreReport() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Fetch score report data
  useEffect(() => {
    const fetchScoreReport = async () => {
      if (!user || !hackathonId) return;
      setLoading(true);
      setError("");

      try {
        // Fetch user's total score
        const { data: scoreData, error: scoreError } = await supabase
          .from("hackathon_scores")
          .select("total_score, created_at")
          .eq("user_id", user.id)
          .eq("hackathon_id", hackathonId)
          .single();

        if (scoreError && scoreError.code !== "PGRST116") throw scoreError;

        // Fetch all submissions for this user in this hackathon
        const { data: submissionsData, error: submissionsError } = await supabase
          .from("hackathon_submissions")
          .select(`
            id,
            type,
            score,
            time_taken,
            created_at,
            answers,
            code,
            language,
            output,
            challenges:challenge_id(
              title,
              difficulty
            )
          `)
          .eq("user_id", user.id)
          .eq("hackathon_id", hackathonId)
          .order("created_at", { ascending: true });

        if (submissionsError) throw submissionsError;

        setScoreData(scoreData);
        setSubmissions(submissionsData || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && hackathonId) {
      fetchScoreReport();
    }
  }, [user, hackathonId]);

  const getSubmissionTypeIcon = (type) => {
    if (type === "mcq") return "📝";
    if (type === "coding") return "💻";
    return "📄";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading score report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Your Score Report</h1>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/hackathons/${hackathonId}/leaderboard`)}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
              >
                View Leaderboard
              </button>
              <button
                onClick={() => navigate(`/hackathons/${hackathonId}/dashboard`)}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Overall Score Summary */}
        {scoreData && (
          <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Overall Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-cyan-400">{scoreData.total_score}</div>
                <div className="text-sm text-gray-400">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{submissions.length}</div>
                <div className="text-sm text-gray-400">Challenges Completed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-white">
                  {scoreData.created_at ? new Date(scoreData.created_at).toLocaleDateString() : "N/A"}
                </div>
                <div className="text-sm text-gray-400">Last Updated</div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Submissions */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Challenge Breakdown</h2>
          
          {submissions.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
              <p className="text-gray-400">No submissions found for this hackathon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission, index) => (
                <div key={submission.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getSubmissionTypeIcon(submission.type)}</span>
                      <div>
                        <h3 className="font-semibold text-white">
                          {submission.challenges?.title || `Challenge ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-400 capitalize">
                          {submission.type} • {submission.challenges?.difficulty || "Unknown"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(submission.score)}`}>
                        {submission.score || 0}
                      </div>
                      <div className="text-sm text-gray-400">points</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Time Taken:</span>
                      <div className="font-semibold">
                        {formatTime(submission.time_taken || 0)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Language:</span>
                      <div className="font-semibold capitalize">
                        {submission.language || "N/A"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Submitted:</span>
                      <div className="font-semibold">
                        {submission.created_at ? new Date(submission.created_at).toLocaleString() : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* MCQ Answers */}
                  {submission.type === "mcq" && submission.answers && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <h4 className="font-semibold mb-2">MCQ Responses</h4>
                      <div className="text-sm text-gray-300">
                        {Object.entries(submission.answers).map(([questionId, answer]) => (
                          <div key={questionId} className="mb-1">
                            <span className="text-gray-400">Q{questionId}:</span> {answer}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Coding Output */}
                  {submission.type === "coding" && submission.output && (
                    <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                      <h4 className="font-semibold mb-2">Code Output</h4>
                      <pre className="text-sm text-gray-300 overflow-x-auto">
                        {submission.output}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Insights */}
        {submissions.length > 0 && (
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Performance Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Challenge Types</h3>
                <div className="space-y-2">
                  {Object.entries(
                    submissions.reduce((acc, sub) => {
                      acc[sub.type] = (acc[sub.type] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="capitalize">{type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Average Scores</h3>
                <div className="space-y-2">
                  {Object.entries(
                    submissions.reduce((acc, sub) => {
                      if (!acc[sub.type]) acc[sub.type] = { total: 0, count: 0 };
                      acc[sub.type].total += sub.score || 0;
                      acc[sub.type].count += 1;
                      return acc;
                    }, {})
                  ).map(([type, data]) => (
                    <div key={type} className="flex justify-between">
                      <span className="capitalize">{type}</span>
                      <span className="font-semibold">
                        {Math.round(data.total / data.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
