import React, { useState, useMemo } from 'react';
import { mockUsers, mockHackathons } from '../data/mockUser'; // Ensure path is correct

// --- Import your existing components ---
import AdminStatsBar from '../components/AdminStatsBar';
import WorkflowProgressBar from '../components/WorkflowProgressBar';

// --- Internal components specific to this page ---
// (These can also be moved to separate files if you prefer)

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
              {/* Using the imported WorkflowProgressBar component */}
              <WorkflowProgressBar user={user} />
              <div>
                <h4 className="font-bold text-lg text-white mb-4">Manual Overrides</h4>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => alert(`Re-assessing ${user.username}...`)} className="px-3 py-1.5 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition">Re-assess</button>
                  <button onClick={() => alert(`Updating profile for ${user.username}...`)} className="px-3 py-1.5 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition">Update Profile</button>
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

const HackathonManager = ({ hackathons, users }) => {
    const getUserName = (userId) => users.find(u => u.id === userId)?.username || 'Unknown User';

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Hackathon Management</h3>
                <button className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition">Create Hackathon</button>
            </div>
            <div className="space-y-4">
                {hackathons.map(hackathon => (
                    <div key={hackathon.id} className="bg-black/20 p-4 rounded-lg">
                        <h4 className="text-xl font-bold text-white">{hackathon.name}</h4>
                        <p className={`text-sm font-medium ${hackathon.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>{hackathon.status}</p>
                        <div className="mt-4">
                            <h5 className="font-semibold mb-2">Submissions ({hackathon.submissions.length})</h5>
                            {hackathon.submissions.length > 0 ? (
                                <ul className="space-y-2">
                                    {hackathon.submissions.map(sub => (
                                        <li key={sub.userId} className="flex justify-between items-center text-sm">
                                            <span>{getUserName(sub.userId)}</span>
                                            <span className="font-bold text-purple-400">{sub.result}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-gray-400 text-sm">No submissions yet.</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ReportsAndAnalytics = ({ users }) => {
    const skillCounts = useMemo(() => {
        const counts = {};
        users.forEach(user => {
            user.skills.forEach(skill => {
                counts[skill.name] = (counts[skill.name] || 0) + 1;
            });
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]);
    }, [users]);
    
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
        <h3 className="text-2xl font-bold text-white mb-4">Reports & Analytics</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-lg text-white mb-2">Top Skills by User Count</h4>
            <div className="space-y-2">
              {skillCounts.map(([skill, count]) => (
                <div key={skill}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-300">{skill}</span>
                    <span className="text-sm font-medium text-gray-400">{count} Users</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${(count / users.length) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-lg text-white mb-2">User Engagement</h4>
             <p className="text-sm text-gray-400">Average assessment score: <span className="font-bold text-white">
                {(users.filter(u => u.latest_assessment).reduce((acc, u) => acc + u.latest_assessment.score, 0) / users.filter(u => u.latest_assessment).length).toFixed(2)}
             </span></p>
             <p className="text-sm text-gray-400">Learning paths generated: <span className="font-bold text-white">
                {users.filter(u => u.learning_path_generated).length} / {users.length}
             </span></p>
             <button className="mt-4 px-3 py-1.5 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition">Generate Full Platform Report</button>
          </div>
        </div>
      </div>
    );
};


// --- Main Dashboard Component ---

export default function AdminDashboard() {
  const [allUsers] = useState(mockUsers);
  const [allHackathons] = useState(mockHackathons);
  const [activeTab, setActiveTab] = useState('users');

  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [scoreFilter, setScoreFilter] = useState({ min: 0, max: 10 });
  const [learningPathFilter, setLearningPathFilter] = useState(''); // 'yes', 'no', ''

  // Memoized calculation to filter users
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = user.username.toLowerCase().includes(lowerSearchTerm) || user.email.toLowerCase().includes(lowerSearchTerm);
      const matchesSkill = selectedSkill ? user.skills.some(s => s.name === selectedSkill) : true;
      const latestScore = user.latest_assessment?.score;
      const matchesScore = latestScore !== undefined ? latestScore >= scoreFilter.min && latestScore <= scoreFilter.max : (scoreFilter.min === 0);
      const matchesLearningPath = learningPathFilter ? (learningPathFilter === 'yes' ? user.learning_path_generated : !user.learning_path_generated) : true;
      
      return matchesSearch && matchesSkill && matchesScore && matchesLearningPath;
    });
  }, [allUsers, searchTerm, selectedSkill, scoreFilter, learningPathFilter]);

  const allSkills = useMemo(() => [...new Set(allUsers.flatMap(u => u.skills.map(s => s.name)))].sort(), [allUsers]);
  
  const stats = {
    totalUsers: allUsers.length,
    assessmentsTaken: allUsers.filter(u => u.assessments.length > 0).length,
    activeHackathons: allHackathons.filter(h => h.status === 'Active').length,
    skillsInDB: allSkills.length
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans p-4 md:p-8 bg-gray-900">
      <div className="container mx-auto space-y-8">
        
        <div>
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Oversee user activity, manage platform events, and analyze performance.</p>
        </div>
        
        {/* Using the imported AdminStatsBar component */}
        <AdminStatsBar stats={stats} />

        <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('users')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>User Management</button>
                <button onClick={() => setActiveTab('hackathons')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'hackathons' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Hackathons</button>
                <button onClick={() => setActiveTab('analytics')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Reports & Analytics</button>
            </nav>
        </div>

        {activeTab === 'users' && (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="text-2xl font-bold text-white mb-4">User Search & Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input type="text" placeholder="Search by username or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500" />
                <select value={selectedSkill} onChange={e => setSelectedSkill(e.target.value)} className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option value="">Filter by Skill</option>
                  {allSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                </select>
                <select value={learningPathFilter} onChange={e => setLearningPathFilter(e.target.value)} className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500">
                    <option value="">Filter by Learning Path</option>
                    <option value="yes">Generated</option>
                    <option value="no">Not Generated</option>
                </select>
                 <div>
                    <label className="text-sm text-gray-400">Score: {scoreFilter.min} - {scoreFilter.max}</label>
                    <input type="range" min="0" max="10" value={scoreFilter.max} onChange={e => setScoreFilter({ ...scoreFilter, max: Number(e.target.value) })} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="text-2xl font-bold text-white mb-4">User List & Status ({filteredUsers.length})</h3>
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
        )}

        {activeTab === 'hackathons' && <HackathonManager hackathons={allHackathons} users={allUsers} />}
        {activeTab === 'analytics' && <ReportsAndAnalytics users={allUsers} />}

      </div>
    </div>
  );
}