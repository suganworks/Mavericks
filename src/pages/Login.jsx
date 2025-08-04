import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { useTilt } from "../hooks/useTilt";

const tiltStyle = `
  .tilt-card {
    transform: perspective(1000px) rotateX(calc((var(--py, 0.5) - 0.5) * 40deg)) rotateY(calc((var(--px, 0.5) - 0.5) * -40deg));
    transition: transform 0.6s ease;
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const tiltRef = useTilt(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center font-retro">
      <style>{tiltStyle}</style>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://media.giphy.com/media/3o6Zt8MgUuvSbkZYWc/giphy.gif')",
        }}
      ></div>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl"></div>

      <form
        ref={tiltRef}
        onSubmit={handleLogin}
        className="tilt-card relative z-10 w-[90%] sm:w-[420px] p-8 rounded-[2rem] backdrop-blur-3xl bg-white/10 border border-white/30 shadow-lg"
      >
        <h2 className="text-2xl text-white text-center mb-4">Login</h2>
        {errorMsg && <p className="text-red-400 text-sm mb-2">{errorMsg}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 rounded-xl bg-black/50 text-white placeholder-gray-300 border border-gray-400/40 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 rounded-xl bg-black/50 text-white placeholder-gray-300 border border-gray-400/40 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-black bg-cyan-400 hover:bg-cyan-500 transition-all"
        >
          {loading ? "Loading..." : "Login"}
        </button>
        <p className="text-gray-300 text-sm mt-4 text-center">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-cyan-400 hover:underline cursor-pointer"
          >
            Register
          </span>
        </p>
      </form>
    </div>
  );
}