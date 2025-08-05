import React from 'react';

// A simple component to display key metrics
export default function AdminStatsBar({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h4 className="text-sm text-gray-400">Total Users</h4>
        <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
      </div>
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h4 className="text-sm text-gray-400">Assessments Taken</h4>
        <p className="text-3xl font-bold text-white">{stats.assessmentsTaken}</p>
      </div>
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h4 className="text-sm text-gray-400">Active Hackathons</h4>
        <p className="text-3xl font-bold text-white">{stats.activeHackathons}</p>
      </div>
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <h4 className="text-sm text-gray-400">Skills in Database</h4>
        <p className="text-3xl font-bold text-white">{stats.skillsInDB}</p>
      </div>
    </div>
  );
}