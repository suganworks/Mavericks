import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

export default function Dashboard() {
    const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Auth check
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };
  return (
   <div className="flex flex-col min-h-screen bg-black text-white p-6">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
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

      {/* Placeholder main content */}
      <div className="flex-1 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
        🚀 Dashboard content will go here...
      </div>
    </div>
  );
}
