import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center font-retro">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://media.giphy.com/media/3o6Zt8MgUuvSbkZYWc/giphy.gif')",
        }}
      ></div>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl"></div>

      {/* Title */}
      <motion.h1
        className="relative z-10 text-white text-4xl sm:text-6xl font-bold text-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Mavericks Coding Platform
      </motion.h1>

      {/* Buttons */}
      <div className="relative z-10 flex gap-6">
        <motion.button
          onClick={() => navigate("/login")}
          className="px-8 py-4 rounded-[1rem] bg-white/10 backdrop-blur-2xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
        >
          Login
        </motion.button>
        <motion.button
          onClick={() => navigate("/register")}
          className="px-8 py-4 rounded-[1rem] bg-cyan-400 text-black hover:bg-cyan-500 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
        >
          Register
        </motion.button>
      </div>
    </div>
  );
}
