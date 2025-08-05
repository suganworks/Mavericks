import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  // Fetch logged-in user
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
        fetchUserDashboard(user.id);
      }
    };
    checkUser();
  }, [navigate]);

  // Fetch personal dashboard data from Supabase
  const fetchUserDashboard = async (userId) => {
    try {
      // Get user info from "users" table
      const { data: userInfo, error: userErr } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      // Get submissions for that user
      const { data: userSubs, error: subErr } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", userId);

      if (userErr) console.error(userErr);
      if (subErr) console.error(subErr);

      setUserData(userInfo);
      setSubmissions(userSubs || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen bg-black text-white p-6 overflow-hidden">
      {/* Animated Blob Background */}
      <motion.div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-500 mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      <motion.div
        className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full bg-pink-500 mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        animate={{ x: [0, -20, 20, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* Top Bar */}
      <div className="relative z-10 flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/menu")}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
          >
            ☰ Menu
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="relative z-10 flex-1 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
        {!userData ? (
          <p className="text-center">Loading your dashboard...</p>
        ) : (
          <div>
            {/* User Info */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{userData.name || "User"}</h2>
              <p className="opacity-80">ID: {userData.id}</p>
            </div>

            {/* Submissions */}
            <h3 className="text-lg font-semibold mb-2">Your Submissions</h3>
            {submissions.length > 0 ? (
              <ul className="list-disc list-inside text-sm">
                {submissions.map((sub) => (
                  <li key={sub.id}>{sub.title || "Untitled Submission"}</li>
                ))}
              </ul>
            ) : (
              <p className="opacity-70">No submissions found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
