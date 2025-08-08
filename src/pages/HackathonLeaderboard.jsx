import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function HackathonLeaderboard() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userScore, setUserScore] = useState(null);

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

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!hackathonId) return;
      setLoading(true);
      setError("");

      try {
        // Fetch all participants with their scores
        const { data, error } = await supabase
          .from("hackathon_scores")
          .select(`
            total_score,
            user_id,
            users:user_id(email),
            hackathon_registrations!inner(
              team_name,
              members
            )
          `)
          .eq("hackathon_id", hackathonId)
          .order("total_score", { ascending: false });

        if (error) throw error;

        // Process and rank participants
        const rankedParticipants = data.map((participant, index) => ({
          rank: index + 1,
          userId: participant.user_id,
          email: participant.users?.email || "Unknown",
          teamName: participant.hackathon_registrations?.team_name || "Solo",
          members: participant.hackathon_registrations?.members || "",
          totalScore: participant.total_score || 0,
        }));

        setParticipants(rankedParticipants);

        // Find current user's score
        const currentUserScore = rankedParticipants.find(
          p => p.userId === user?.id
        );
        setUserScore(currentUserScore);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && hackathonId) {
      fetchLeaderboard();
    }
  }, [user, hackathonId]);

  const getRankBadge = (rank) => {
    if (rank === 1) return "bg-yellow-500 text-yellow-900";
    if (rank === 2) return "bg-gray-400 text-gray-900";
    if (rank === 3) return "bg-orange-500 text-orange-900";
    return "bg-gray-600 text-gray-200";
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
          <p>Loading leaderboard...</p>
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
            <h1 className="text-3xl font-bold">Hackathon Leaderboard</h1>
            <button
              onClick={() => navigate(`/hackathons/${hackathonId}/dashboard`)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>

          {/* User's Current Score */}
          {userScore && (
            <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/30 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-2">Your Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">#{userScore.rank}</div>
                  <div className="text-sm text-gray-400">Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{userScore.totalScore}</div>
                  <div className="text-sm text-gray-400">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{userScore.teamName}</div>
                  <div className="text-sm text-gray-400">Team</div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/hackathons/${hackathonId}/score-report`)}
                className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-semibold"
              >
                View Detailed Report
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold">Rankings</h2>
            <p className="text-gray-400 text-sm mt-1">
              {participants.length} participants competing
            </p>
          </div>

          {participants.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No participants have completed challenges yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {participants.map((participant) => (
                <div
                  key={participant.userId}
                  className={`p-6 flex items-center justify-between ${
                    participant.userId === user?.id
                      ? "bg-cyan-900/20 border-l-4 border-cyan-500"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadge(participant.rank)}`}>
                      {participant.rank}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {participant.teamName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {participant.email}
                      </p>
                      {participant.members && (
                        <p className="text-xs text-gray-500 mt-1">
                          Members: {participant.members}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">
                      {participant.totalScore}
                    </div>
                    <div className="text-sm text-gray-400">points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <h3 className="font-semibold mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span>1st Place</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <span>2nd Place</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <span>3rd Place</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-cyan-500 rounded-full"></div>
              <span>Your Position</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
