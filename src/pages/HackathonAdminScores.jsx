import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function HackathonAdminScores() {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingScore, setEditingScore] = useState(null);

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

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        
        if (data?.role !== "admin") {
          navigate("/dashboard");
          return;
        }
      } catch (err) {
        navigate("/dashboard");
      }
    };

    if (user) {
      checkAdmin();
    }
  }, [user, navigate]);

  // Fetch participants with scores
  useEffect(() => {
    const fetchParticipants = async () => {
      if (!hackathonId) return;
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("hackathon_scores")
          .select(`
            id,
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
        setParticipants(data || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (hackathonId) {
      fetchParticipants();
    }
  }, [hackathonId]);

  const updateScore = async (scoreId, newScore) => {
    try {
      const { error } = await supabase
        .from("hackathon_scores")
        .update({ total_score: newScore })
        .eq("id", scoreId);

      if (error) throw error;

      // Update local state
      setParticipants(prev => 
        prev.map(p => 
          p.id === scoreId 
            ? { ...p, total_score: newScore }
            : p
        )
      );

      setSuccess("Score updated successfully!");
      setEditingScore(null);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteScore = async (scoreId) => {
    if (!confirm("Are you sure you want to delete this score entry?")) return;

    try {
      const { error } = await supabase
        .from("hackathon_scores")
        .delete()
        .eq("id", scoreId);

      if (error) throw error;

      // Update local state
      setParticipants(prev => prev.filter(p => p.id !== scoreId));

      setSuccess("Score entry deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message);
    }
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
          <p>Loading participants...</p>
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
            <h1 className="text-3xl font-bold">Admin Score Management</h1>
            <button
              onClick={() => navigate(`/hackathons/${hackathonId}/dashboard`)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
          <p className="text-gray-400">Manage participant scores for this hackathon</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg text-green-300">
            {success}
          </div>
        )}

        {/* Participants List */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold">Participant Scores</h2>
            <p className="text-gray-400 text-sm mt-1">
              {participants.length} participants with scores
            </p>
          </div>

          {participants.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No participants have scores yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {participants.map((participant, index) => (
                <div key={participant.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {participant.hackathon_registrations?.team_name || "Solo"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {participant.users?.email || "Unknown"}
                        </p>
                        {participant.hackathon_registrations?.members && (
                          <p className="text-xs text-gray-500">
                            Members: {participant.hackathon_registrations.members}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {editingScore === participant.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={participant.total_score}
                            className="w-20 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-center"
                            min="0"
                            max="1000"
                          />
                          <button
                            onClick={() => {
                              const input = document.querySelector(`input[defaultValue="${participant.total_score}"]`);
                              const newScore = parseInt(input.value);
                              if (!isNaN(newScore) && newScore >= 0) {
                                updateScore(participant.id, newScore);
                              }
                            }}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingScore(null)}
                            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-cyan-400">
                              {participant.total_score}
                            </div>
                            <div className="text-sm text-gray-400">points</div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingScore(participant.id)}
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteScore(participant.id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admin Actions */}
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                // Export scores to CSV
                const csvContent = "data:text/csv;charset=utf-8," + 
                  "Rank,Team,Email,Score\n" +
                  participants.map((p, i) => 
                    `${i + 1},"${p.hackathon_registrations?.team_name || 'Solo'}","${p.users?.email || 'Unknown'}",${p.total_score}`
                  ).join("\n");
                
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `hackathon-${hackathonId}-scores.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
            >
              Export Scores (CSV)
            </button>
            <button
              onClick={() => navigate(`/hackathons/${hackathonId}/leaderboard`)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-semibold"
            >
              View Public Leaderboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
