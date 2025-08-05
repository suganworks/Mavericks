import React, { useState, useMemo } from 'react';
import { mockUsers } from '../data/mockUser';
import AdminStatsBar from '../components/AdminStatsBar';
import SkillAnalyticsChart from '../components/SkillAnalyticsChart';
import WorkflowProgressBar from '../components/WorkflowProgressBar';

// This is a self-contained component for a single row in the user list.
const UserRow = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const getStatusClass = (status) => status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300';

  return (
    <>
      <tr className="border-b border-gray-700 hover:bg-white/5 transition cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{user.username}</td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(user.status)}`}>
            {user.status}
          </span>
        </td>
        <td className="px-6 py-4">{user.skills.map(s => s.name).join(', ') || 'N/A'}</td>
        <td className="px-6 py-4">{user.latest_assessment ? `${user.latest_assessment.score}/${user.latest_assessment.total}` : 'N/A'}</td>
        <td className="px-6 py-4 text-gray-400">{new Date(user.last_updated).toLocaleDateString()}</td>
      </tr>
      {isExpanded && (
        <tr className="bg-black/20">
          <td colSpan="5" className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <WorkflowProgressBar user={user} />
              <div>
                <h4 className="font-bold text-lg text-white mb-4">Manual Overrides</h4>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => alert(`Re-assessing ${user.username}...`)} className="px-3 py-1.5 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition">Re-assess</button>
                  <button onClick={() => alert(`Updating ${user.username}...`)} className="px-3 py-1.5 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition">Update Profile</button>
                  <button onClick={() => alert(`Generating report for ${user.username}...`)} className="px-3 py-1.5 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition">Generate Report</button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// This is the main page component for the entire admin dashboard.
export default function AdminDashboard() {
  const [allUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  // Memoized calculation to filter users only when inputs change
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = user.username.toLowerCase().includes(lowerSearchTerm) || user.email.toLowerCase().includes(lowerSearchTerm);
      const matchesSkill = selectedSkill ? user.skills.some(s => s.name === selectedSkill) : true;
      return matchesSearch && matchesSkill;
    });
  }, [allUsers, searchTerm, selectedSkill]);

  // Memoized calculation to get a unique list of all skills
  const allSkills = useMemo(() => [...new Set(allUsers.flatMap(u => u.skills.map(s => s.name)))].sort(), [allUsers]);
  
  // Data for the stats bar
  const stats = {
    totalUsers: allUsers.length,
    assessmentsTaken: allUsers.filter(u => u.latest_assessment).length,
    activeHackathons: 3, // Placeholder value
    skillsInDB: allSkills.length
  };

  return (
    // The background color has been removed from this div to allow the particle background to show through
    <div className="min-h-screen text-gray-200 font-sans p-4 md:p-8">
      <div className="container mx-auto space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Oversee user activity and manage platform events.</p>
        </div>
        
        {/* Stats Bar */}
        <AdminStatsBar stats={stats} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Side (Search and User List) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="text-2xl font-bold text-white mb-4">User Search & Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Search by username or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500" />
                <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option value="">Filter by Skill</option>
                  {allSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="text-2xl font-bold text-white mb-4">User List & Status</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs text-gray-400 uppercase bg-black/20">
                    <tr>
                      <th className="px-6 py-3">Username</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Skills</th>
                      <th className="px-6 py-3">Latest Score</th>
                      <th className="px-6 py-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => <UserRow key={user.id} user={user} />)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side (Analytics) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Top Skills Analytics</h3>
            <SkillAnalyticsChart users={allUsers} />
          </div>
        </div>
      </div>
    </div>
  );
}