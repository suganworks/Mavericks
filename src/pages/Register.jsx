import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          username: username,
          email: email,
        });
        if (insertError) throw insertError;
      }

      alert("Registration successful! Please check your email.");
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen w-full overflow-hidden">
      {/* Background GIF */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif')",
        }}
      ></div>
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      {/* Liquid Glass Card */}
      <form
        onSubmit={handleRegister}
        className="relative z-10 w-[90%] sm:w-[420px] p-8 rounded-[2rem]
                   backdrop-blur-3xl bg-white/10 border border-white/30
                   shadow-[0_0_30px_rgba(255,0,255,0.6),inset_0_0_30px_rgba(255,255,255,0.05)]
                   transition-all hover:scale-[1.02] duration-300"
      >
        <h2 className="text-4xl font-semibold text-white mb-6 text-center drop-shadow-md">
          Create Account
        </h2>
        {errorMsg && <p className="text-red-400 mb-4">{errorMsg}</p>}

        <input
          type="text"
          placeholder="Username"
          className="w-full p-4 mb-4 rounded-2xl bg-white/20 text-white placeholder-gray-300
                     focus:outline-none focus:ring-2 focus:ring-pink-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-4 mb-4 rounded-2xl bg-white/20 text-white placeholder-gray-300
                     focus:outline-none focus:ring-2 focus:ring-pink-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 mb-6 rounded-2xl bg-white/20 text-white placeholder-gray-300
                     focus:outline-none focus:ring-2 focus:ring-pink-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl font-bold text-white
                     bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500
                     shadow-[0_0_20px_#ff00ff] transition-all duration-300 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="text-gray-300 mt-6 text-center">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-pink-400 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}
