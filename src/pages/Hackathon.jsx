import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

function formatCountdown(msRemaining) {
  if (msRemaining <= 0) return "00d : 00h : 00m : 00s";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(days)}d : ${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
}

export default function Hackathon() {
  const navigate = useNavigate();

  // Auth + registration UI state
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Registration form fields
  const [registrantName, setRegistrantName] = useState("");
  const [registrantEmail, setRegistrantEmail] = useState("");
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState("");

  // Sample hackathons. In a real app, fetch from DB.
  const hackathons = useMemo(
    () => [
      {
        id: 1,
        title: "Mavericks Spring Hackathon",
        description:
          "Build innovative apps in 24 hours. Themes: AI Assistants, DevTools, and Education.",
        start_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // in 2 days
        end_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // +1 day
        location: "Online",
      },
      {
        id: 2,
        title: "Edge AI Mini-Hack",
        description:
          "4-hour sprint focusing on edge inference and tinyML challenges.",
        start_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // started 3h ago
        end_at: new Date(Date.now() + 1000 * 60 * 60 * 1).toISOString(), // ends in 1h
        location: "Hybrid",
      },
      {
        id: 3,
        title: "Winter DevFest",
        description: "A weekend-long festival of coding, talks, and workshops.",
        start_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        end_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
        location: "Bangalore, IN",
      },
    ],
    []
  );

  const now = Date.now();
  const withStatus = useMemo(() => {
    return hackathons
      .map((h) => {
        const start = new Date(h.start_at).getTime();
        const end = new Date(h.end_at).getTime();
        let status = "upcoming";
        if (now >= start && now <= end) status = "ongoing";
        if (now > end) status = "past";
        return { ...h, status };
      })
      .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
  }, [hackathons, now]);

  const upcoming = withStatus.filter((h) => h.status === "upcoming");
  const ongoing = withStatus.filter((h) => h.status === "ongoing");
  const past = withStatus.filter((h) => h.status === "past");

  const nextUpcoming = upcoming[0] || null;
  const [countdown, setCountdown] = useState(
    nextUpcoming ? new Date(nextUpcoming.start_at).getTime() - Date.now() : 0
  );

  // Auth
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user || null);
    };
    initAuth();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!nextUpcoming) return;
    const interval = setInterval(() => {
      setCountdown(new Date(nextUpcoming.start_at).getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [nextUpcoming]);

  const openRegistration = (hackathon) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setSelectedHackathon(hackathon);
    setRegistrantName("");
    setRegistrantEmail("");
    setTeamName("");
    setMembers("");
    setSubmitMessage("");
    setShowForm(true);
  };

  const submitRegistration = async (e) => {
    e.preventDefault();
    if (!selectedHackathon || !user) return;

    if (!teamName.trim()) {
      setSubmitMessage("Please provide a Team Name.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("Submitting...");
    try {
      const { error } = await supabase.from("hackathon_registrations").insert({
        user_id: user.id,
        hackathon_id: selectedHackathon.id,
        team_name: teamName.trim(),
        members: members.trim(),
        registrant_name: registrantName.trim(),
        registrant_email: registrantEmail.trim(),
      });

      if (error) {
        console.error("Registration error:", error);
        if (error.code === '23505') {
          setSubmitMessage("❌ You are already registered for this hackathon.");
        } else {
          setSubmitMessage("❌ Registration failed. Please try again later.");
        }
      } else {
        setSubmitMessage("✅ Registered successfully! Redirecting to dashboard...");
        setTimeout(() => {
          setShowForm(false);
          navigate(`/hackathons/${selectedHackathon.id}/dashboard`);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage(`❌ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const Section = ({ title, items }) => (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="h-px flex-1 ml-4 bg-gray-700" />
      </div>
      {items.length === 0 ? (
        <div className="text-gray-400">No hackathons here.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((h) => (
            <div
              key={h.id}
              className="bg-gray-800/60 border border-gray-700 rounded-xl p-6 backdrop-blur-sm hover:border-cyan-400 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold">{h.title}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    h.status === "ongoing"
                      ? "bg-green-500/20 text-green-300"
                      : h.status === "upcoming"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-gray-600/30 text-gray-300"
                  }`}
                >
                  {h.status.toUpperCase()}
                </span>
              </div>
              <p className="text-gray-300 mb-3 line-clamp-3">{h.description}</p>
              <div className="text-sm text-gray-400 mb-4">
                <div>📍 {h.location}</div>
                <div>🗓️ {new Date(h.start_at).toLocaleString()} → {new Date(h.end_at).toLocaleString()}</div>
              </div>
              <button
                onClick={() => openRegistration(h)}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 transition font-semibold"
              >
                Register
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-indigo-900/60 to-gray-900/80" />
        <div className="container mx-auto px-6 py-14 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              Mavericks Hackathons
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl">
              Collaborate, build, and ship. Join our community events to turn ideas into real products.
            </p>

            {nextUpcoming ? (
              <div className="mt-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 inline-flex flex-col md:flex-row md:items-center gap-4">
                <div>
                  <div className="text-sm text-gray-300">Next Hackathon</div>
                  <div className="text-xl font-semibold">{nextUpcoming.title}</div>
                  <div className="text-gray-400 text-sm">
                    {new Date(nextUpcoming.start_at).toLocaleString()} → {new Date(nextUpcoming.end_at).toLocaleString()}
                  </div>
                </div>
                <div className="md:ml-auto text-center">
                  <div className="text-xs text-gray-300">Starts in</div>
                  <div className="text-2xl md:text-3xl font-mono">{formatCountdown(countdown)}</div>
                </div>
              </div>
            ) : (
              <div className="mt-6 text-gray-300">No upcoming hackathons. Check back soon!</div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Sections */}
      <div className="container mx-auto px-6 py-10">
        <Section title="Ongoing Hackathons" items={ongoing} />
        <Section title="Upcoming Hackathons" items={upcoming} />
        <Section title="Past Hackathons" items={past} />
      </div>

      {/* Registration Modal */}
      {showForm && selectedHackathon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-gray-400">Register for</div>
                <div className="text-xl font-bold">{selectedHackathon.title}</div>
              </div>
              <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-white">✕</button>
            </div>

            <form onSubmit={submitRegistration} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={registrantName}
                    onChange={(e) => setRegistrantName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={registrantEmail}
                    onChange={(e) => setRegistrantEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Mavericks Builders"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Members</label>
                <input
                  type="text"
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  placeholder="Comma-separated names"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {submitMessage && (
                <div className="text-sm text-gray-200 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                  {submitMessage}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 ${
                    isSubmitting ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
