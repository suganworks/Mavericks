import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../auth';

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-black/70 backdrop-blur-md border-b border-white/10 z-50 relative">
      <div className="flex items-center">
        <span className="text-white font-bold text-xl">Mavericks Admin</span>
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700/90 transition flex items-center backdrop-blur-sm shadow-lg border border-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
        </svg>
        Logout
      </button>
    </nav>
  );
}