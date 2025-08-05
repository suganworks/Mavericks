import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Optionally highlight the home button if on dashboard
  const isDashboard = location.pathname === '/dashboard';

  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-black/70 backdrop-blur-md border-b border-white/10 z-50 relative">
      <button
        className="text-white font-bold text-lg flex items-center gap-2 hover:text-purple-400 transition-colors"
        onClick={() => navigate('/menu')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
        Menu
      </button>
      <button
        className={`text-white font-bold text-lg flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${isDashboard ? 'bg-purple-600' : 'bg-white/10 hover:bg-purple-600/80'}`}
        onClick={() => navigate('/dashboard')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-.586-1.414l-7-7a2 2 0 00-2.828 0l-7 7A2 2 0 003 7v11a2 2 0 002 2h3"></path>
        </svg>
        Home
      </button>
    </nav>
  );
}