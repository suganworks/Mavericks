import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

const tracks = [
  { key: "all", label: "All Challenges" },
  { key: "ai-ml", label: "AI / ML" },
  { key: "web", label: "Web Dev" },
  { key: "iot", label: "IoT" },
  { key: "blockchain", label: "Blockchain" },
];

export default function HackathonDashboard() {
  const { id: hackathonId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isRegistered, setIsRegistered] = useState(null); // null=loading, false/true
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [currentTrack, setCurrentTrack] = useState("all");
  const [error, setError] = useState("");

  // Auth
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

  // Check registration for this hackathon
  useEffect(() => {
    const checkRegistration = async () => {
      if (!user || !hackathonId) return;
      setIsRegistered(null);
      setError("");
      try {
        const { data, error } = await supabase
          .from("hackathon_registrations")
          .select("id")
          .eq("user_id", user.id)
          .eq("hackathon_id", hackathonId)
          .maybeSingle();

        if (error && error.code !== "PGRST116") throw error;
        setIsRegistered(Boolean(data));
      } catch (err) {
        setError(err.message);
        setIsRegistered(false);
      }
    };
    checkRegistration();
  }, [user, hackathonId]);

  // Fetch challenges for this hackathon
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!hackathonId) return;
      setLoadingChallenges(true);
      setError("");
      try {
        const { data, error } = await supabase
          .from("hackathon_challenges")
          .select("id,title,description,type,difficulty,time_limit,max_score")
          .eq("hackathon_id", hackathonId);

        if (error) throw error;
        
        // Add track information based on challenge type and title
        const challengesWithTracks = data.map(challenge => {
          let track = 'web'; // default
          if (challenge.type === 'mcq') {
            track = 'ai-ml';
          } else if (challenge.title.toLowerCase().includes('api') || challenge.title.toLowerCase().includes('full-stack')) {
            track = 'web';
          } else if (challenge.title.toLowerCase().includes('responsive') || challenge.title.toLowerCase().includes('frontend')) {
            track = 'web';
          }
          return {
            ...challenge,
            track: track
          };
        });
        
        setChallenges(challengesWithTracks || []);
      } catch (err) {
        setError(err.message);
        setChallenges([]);
      } finally {
        setLoadingChallenges(false);
      }
    };
    fetchChallenges();
  }, [hackathonId]);

  const filteredChallenges = useMemo(() => {
    if (currentTrack === "all") {
      return challenges;
    }
    return challenges.filter((c) => (c.track || "").toLowerCase() === currentTrack);
  }, [challenges, currentTrack]);

  const difficultyBadge = (difficulty) => {
    const d = (difficulty || "").toLowerCase();
    if (d.includes("easy")) return "bg-green-500/20 text-green-300";
    if (d.includes("medium")) return "bg-yellow-500/20 text-yellow-300";
    if (d.includes("hard")) return "bg-red-500/20 text-red-300";
    return "bg-gray-600/30 text-gray-300";
  };

  const startChallenge = (challenge) => {
    // Navigate to the challenge workspace
    navigate(`/challenges/${challenge.id}/workspace`, { 
      state: { 
        hackathonId: hackathonId,
        challengeId: challenge.id 
      } 
    });
  };

  if (isRegistered === null || !user) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-2">Registration Required</h1>
          <p className="text-gray-300 mb-6">You must register for this hackathon to access the dashboard.</p>
          <button
            onClick={() => navigate("/hackathon")}
            className="px-5 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700"
          >
            Go to Hackathon Home
          </button>
          {error && <div className="mt-4 text-sm text-red-400">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h1 className="text-3xl font-bold mb-4">Hackathon Overview</h1>
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <button
                onClick={() => navigate(`/hackathons/${hackathonId}/leaderboard`)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-lg font-semibold"
              >
                View Leaderboard
              </button>
            </div>
            <div className="space-y-6 text-gray-300">
                             <div>
                 <h3 className="font-semibold text-white mb-2">Rules</h3>
                 <ul className="list-disc list-inside space-y-1">
                   <li>Individual participation only.</li>
                   <li>All work must be created during the event.</li>
                   <li>Use of open-source libraries is allowed with attribution.</li>
                   <li>Complete challenges to earn points and climb the leaderboard.</li>
                 </ul>
               </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Judging Criteria</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Innovation and creativity</li>
                  <li>Technical complexity and execution</li>
                  <li>Design and user experience</li>
                  <li>Impact and feasibility</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-2">Timeline</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Kickoff & problem briefing</li>
                  <li>Hacking period</li>
                  <li>Submission & demos</li>
                  <li>Judging & results</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-3">Tracks</h2>
            <div className="flex flex-wrap gap-2">
              {tracks.map((t) => (
                <button
                  key={t.key}
                  className={`px-3 py-1.5 rounded-lg border text-sm ${
                    currentTrack === t.key
                      ? "bg-cyan-600 border-cyan-500"
                      : "bg-gray-800 border-gray-700 hover:bg-gray-700"
                  }`}
                  onClick={() => setCurrentTrack(t.key)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Challenges */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Challenges</h2>
          {loadingChallenges && (
            <div className="text-sm text-gray-400">Loading challenges...</div>
          )}
        </div>

        {filteredChallenges.length === 0 ? (
          <div className="text-gray-400">No challenges for this track yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((c) => (
              <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold">{c.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${difficultyBadge(c.difficulty)}`}>
                    {c.difficulty || "—"}
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-4 line-clamp-4">{c.description}</p>
                <div className="mt-auto">
                  <button
                    onClick={() => startChallenge(c)}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 transition font-semibold"
                  >
                    Start Challenge
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


