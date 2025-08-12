import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import HackathonManager from '../components/HackathonManager';
import SkillAnalyticsChart from '../components/SkillAnalyticsChart';
import WorkflowProgressBar from '../components/WorkflowProgressBar';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('hackathons');
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalHackathons: 0,
    totalSubmissions: 0,
    skillGrowth: [],
    platformEngagement: []
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [initialized, setInitialized] = useState(false);
  const [skillFilter, setSkillFilter] = useState('');
  const [minScore, setMinScore] = useState('');
  const [learningPathFilter, setLearningPathFilter] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);

  // Fetch users and analytics on component mount
  useEffect(() => {
    console.log('AdminDashboard: Component mounted');
    const initializeData = async () => {
      try {
        await Promise.all([fetchUsers(), fetchAnalytics()]);
        setInitialized(true);
      } catch (error) {
        console.error('AdminDashboard: Error initializing:', error);
        setInitialized(true);
      }
    };
    initializeData();
  }, []);

    const fetchUsers = async () => {
      try {
      setLoading(true);
      console.log('Fetching users...');
        const { data, error } = await supabase
          .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        // Fallback to sample data if table doesn't exist
        const fallbackUsers = [
          { id: '1', email: 'user1@example.com', username: 'user1', created_at: '2024-01-15', updated_at: '2024-01-20', status: 'active' },
          { id: '2', email: 'user2@example.com', username: 'user2', created_at: '2024-01-10', updated_at: '2024-01-18', status: 'active' },
          { id: '3', email: 'user3@example.com', username: 'user3', created_at: '2024-01-05', updated_at: '2024-01-15', status: 'inactive' },
          { id: '4', email: 'admin@example.com', username: 'admin', created_at: '2024-01-01', updated_at: '2024-01-25', status: 'active', is_admin: true }
        ];
        console.log('Using fallback users data:', fallbackUsers);
        setUsers(fallbackUsers);
      } else {
        console.log('Fetched users from database:', data);
        // Transform the data to match the expected structure
        const transformedUsers = data.map(user => ({
          id: user.id,
          email: user.email,
          username: user.username || 'Anonymous',
          created_at: user.created_at,
          updated_at: user.updated_at,
          status: user.status || 'active',
          is_admin: user.is_admin || false,
          skills: Array.isArray(user.skills) ? user.skills : [],
          learning_path: Array.isArray(user.learning_path) ? user.learning_path : [],
          latest_score: null,
          latest_assessed_at: null
        }));
        console.log('Transformed users:', transformedUsers);
        // Fetch latest assessment scores and user skills table for these users
        const userIds = transformedUsers.map(u => u.id);
        if (userIds.length > 0) {
          const { data: assessments } = await supabase
            .from('user_assessments')
            .select('user_id,total_score,quiz_score,coding_score,updated_at')
            .in('user_id', userIds)
            .order('updated_at', { ascending: false });
          // Try to load from dedicated user_skills table if available
          let skillsByUser = new Map();
          try {
            const { data: skillRows, error: skillErr } = await supabase
              .from('user_skills')
              .select('user_id,name,level')
              .in('user_id', userIds);
            if (!skillErr && Array.isArray(skillRows)) {
              skillsByUser = skillRows.reduce((map, r) => {
                const arr = map.get(r.user_id) || [];
                arr.push({ name: r.name, level: r.level || 'beginner' });
                map.set(r.user_id, arr);
                return map;
              }, new Map());
            }
          } catch (e) {
            console.warn('user_skills table not available, falling back to users.skills');
          }
          const latestByUser = new Map();
          (assessments || []).forEach(a => {
            if (!latestByUser.has(a.user_id)) latestByUser.set(a.user_id, a);
          });
          const merged = transformedUsers.map(u => {
            const a = latestByUser.get(u.id);
            const score = (a?.total_score ?? a?.quiz_score);
            const skillsFromTable = skillsByUser.get(u.id);
            // Ensure minimal defaults when data is empty
            const safeSkills = (skillsFromTable && skillsFromTable.length > 0)
              ? skillsFromTable
              : (Array.isArray(u.skills) && u.skills.length > 0
                  ? u.skills
                  : [{ name: 'Basics', level: 'beginner' }]);
            const safeLearningPath = Array.isArray(u.learning_path) && u.learning_path.length > 0
              ? u.learning_path
              : ['Intro'];
            const safeScore = typeof score === 'number' ? score : 1;
            return {
              ...u,
              skills: safeSkills,
              learning_path: safeLearningPath,
              latest_score: safeScore,
              latest_assessed_at: a?.updated_at ?? u.updated_at ?? u.created_at,
            };
          });
          setUsers(merged);
        } else {
          // Apply minimal defaults if no users
          setUsers(transformedUsers.map(u => ({
            ...u,
            skills: (u.skills && u.skills.length > 0) ? u.skills : [{ name: 'Basics', level: 'beginner' }],
            learning_path: (u.learning_path && u.learning_path.length > 0) ? u.learning_path : ['Intro'],
            latest_score: typeof u.latest_score === 'number' ? u.latest_score : 1,
          })));
        }
      }
      } catch (err) {
        console.error('Error fetching users:', err);
      // Set fallback data
      const fallbackUsers = [
        { id: '1', email: 'user1@example.com', username: 'user1', created_at: '2024-01-15', updated_at: '2024-01-20', status: 'active' },
        { id: '2', email: 'user2@example.com', username: 'user2', created_at: '2024-01-10', updated_at: '2024-01-18', status: 'active' },
        { id: '3', email: 'user3@example.com', username: 'user3', created_at: '2024-01-05', updated_at: '2024-01-15', status: 'inactive' },
        { id: '4', email: 'admin@example.com', username: 'admin', created_at: '2024-01-01', updated_at: '2024-01-25', status: 'active', is_admin: true }
      ];
      console.log('Using fallback users data due to error:', fallbackUsers);
      setUsers(fallbackUsers);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchAnalytics = async () => {
      try {
      // Fetch basic counts
      const [usersResult, hackathonsResult, submissionsResult] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact' }),
        supabase.from('hackathons').select('*', { count: 'exact' }),
        supabase.from('hackathon_submissions').select('*', { count: 'exact' })
      ]);

      // Sample analytics data
      const sampleAnalytics = {
        totalUsers: usersResult.count || 150,
        activeUsers: 6,
        totalHackathons: hackathonsResult.count || 12,
        totalSubmissions: submissionsResult.count || 89,
        skillGrowth: [
          { month: 'Jan', users: 45, growth: 12 },
          { month: 'Feb', users: 67, growth: 15 },
          { month: 'Mar', users: 89, growth: 18 },
          { month: 'Apr', users: 112, growth: 22 },
          { month: 'May', users: 134, growth: 25 },
          { month: 'Jun', users: 150, growth: 28 }
        ],
        platformEngagement: [
          { day: 'Mon', sessions: 120, submissions: 45 },
          { day: 'Tue', sessions: 145, submissions: 52 },
          { day: 'Wed', sessions: 98, submissions: 38 },
          { day: 'Thu', sessions: 167, submissions: 61 },
          { day: 'Fri', sessions: 134, submissions: 49 },
          { day: 'Sat', sessions: 89, submissions: 32 },
          { day: 'Sun', sessions: 76, submissions: 28 }
        ]
      };

      setAnalytics(sampleAnalytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      // Set fallback data
      setAnalytics({
        totalUsers: 150,
        activeUsers: 105,
        totalHackathons: 12,
        totalSubmissions: 89,
        skillGrowth: [],
        platformEngagement: []
      });
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = (
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toString().includes(searchTerm)
      );
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesSkill = !skillFilter || (Array.isArray(user.skills) && user.skills.some(s => (s.name || '').toLowerCase().includes(skillFilter.toLowerCase())));
      const scoreNum = Number(minScore);
      const matchesScore = !minScore || (typeof user.latest_score === 'number' && user.latest_score >= scoreNum);
      const matchesLearningPath = !learningPathFilter || (Array.isArray(user.learning_path) && user.learning_path.join(' ').toLowerCase().includes(learningPathFilter.toLowerCase()));
      return matchesSearch && matchesStatus && matchesSkill && matchesScore && matchesLearningPath;
    });
  }, [users, searchTerm, filterStatus, skillFilter, minScore, learningPathFilter]);

  const handleUserStatusChange = async (userId, newStatus) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  // Manual override actions
  const handleReassess = async (user) => {
    try {
      // Mark user for reassessment by updating a flag or timestamp
      await supabase.from('users').update({ reassess_requested_at: new Date().toISOString() }).eq('id', user.id);
      alert(`Re-assessment requested for ${user.username}`);
    } catch (e) {
      console.error('Failed to request reassessment', e);
      alert('Failed to request re-assessment');
    }
  };

  const handleUpdateProfile = async (user) => {
    try {
      const skillName = prompt('Enter skill name to add/update (e.g., React):');
      if (!skillName) return;
      const level = prompt('Enter level (beginner|intermediate|advanced|expert):', 'intermediate');
      if (!level) return;
      const skills = Array.isArray(user.skills) ? [...user.skills] : [];
      const i = skills.findIndex(s => (s.name || '').toLowerCase() === skillName.toLowerCase());
      if (i >= 0) skills[i] = { name: skillName, level };
      else skills.push({ name: skillName, level });
      await supabase.from('users').update({ skills }).eq('id', user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, skills } : u));
      alert('Profile updated');
    } catch (e) {
      console.error('Failed to update profile', e);
      alert('Failed to update profile');
    }
  };

  const handleGenerateUserReport = (user) => {
    const filename = `user_${user.username || user.email}_report.csv`;
    const headers = ['ID','Username','Email','Status','LatestScore','Skills','LearningPath','Created','Updated'];
    const row = [
      user.id,
      user.username,
      user.email,
      user.status,
      user.latest_score ?? '',
      (user.skills || []).map(s => `${s.name}(${s.level})`).join('|'),
      (user.learning_path || []).join('|'),
      user.created_at,
      user.updated_at || ''
    ];
    const csv = `${headers.join(',')}
${row.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateReport = (type) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_');
    const filename = `${type}_report_${timestamp}.csv`;
    
    let csvContent = '';
    switch(type) {
      case 'users':
        csvContent = 'ID,Email,Created Date,Last Login,Status\n';
        users.forEach(user => {
          csvContent += `${user.id},${user.email},${user.created_at},${user.last_login},${user.status}\n`;
        });
        break;
      case 'analytics':
        csvContent = 'Metric,Value\n';
        csvContent += `Total Users,${analytics.totalUsers}\n`;
        csvContent += `Active Users,${analytics.activeUsers}\n`;
        csvContent += `Total Hackathons,${analytics.totalHackathons}\n`;
        csvContent += `Total Submissions,${analytics.totalSubmissions}\n`;
        break;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Show loading state while initializing
  if (!initialized) {
    return (
      <div className="min-h-screen text-gray-200 font-sans p-4 md:p-8">
        <div className="container mx-auto space-y-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-lg">Initializing Admin Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-200 font-sans p-4 md:p-8">
      <div className="container mx-auto space-y-8">
        
        {/* Page Header */}
        <div>
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">Oversee user activity and manage platform events.</p>
        </div>

        {/* Tab Navigation */}
          <div className="flex border-b border-gray-700">
            <button 
              onClick={() => setActiveTab('users')} 
              className={`py-3 px-6 font-medium ${activeTab === 'users' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            >
              Users
            </button>
            <button 
              onClick={() => setActiveTab('hackathons')} 
              className={`py-3 px-6 font-medium ${activeTab === 'hackathons' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            >
              Hackathons
            </button>
          <button 
            onClick={() => setActiveTab('assignments')} 
            className={`py-3 px-6 font-medium ${activeTab === 'assignments' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
          >
            Assignments
            </button>
            <button 
              onClick={() => setActiveTab('reports')} 
              className={`py-3 px-6 font-medium ${activeTab === 'reports' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            >
              Reports & Analytics
            </button>
          </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Management Header */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">User Management</h3>
                <div className="flex gap-4 flex-wrap">
                  <input 
                    type="text" 
                    placeholder="Search users..."
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Filter by skill (e.g., React)"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="number"
                    placeholder="Min score"
                    min="0"
                    max="100"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    className="w-36 px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Filter by learning path"
                    value={learningPathFilter}
                    onChange={(e) => setLearningPathFilter(e.target.value)}
                    className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Users Table */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  <span className="ml-3">Loading users...</span>
                </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs text-gray-400 uppercase bg-black/20">
                        <tr>
                          <th className="px-6 py-3">Username</th>
                        <th className="px-6 py-3">Email</th>
                          <th className="px-6 py-3">Skills</th>
                          <th className="px-6 py-3">Assessment Score</th>
                          <th className="px-6 py-3">Created Date</th>
                          <th className="px-6 py-3">Last Updated</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <>
                          <tr key={user.id} className="border-b border-gray-700 hover:bg-white/5 transition cursor-pointer"
                              onClick={() => setExpandedUserId(prev => prev === user.id ? null : user.id)}>
                            <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                            <td className="px-6 py-4">{user.email}</td>
                            <td className="px-6 py-4 truncate max-w-xs">
                              {(user.skills || []).slice(0, 3).map(s => s.name).join(', ') || '—'}
                              {(user.skills || []).length > 3 && ' …'}
                            </td>
                            <td className="px-6 py-4">{typeof user.latest_score === 'number' ? `${user.latest_score}%` : '—'}</td>
                            <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.status === 'active' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.is_admin ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-900/50 text-gray-300'
                              }`}>
                                {user.is_admin ? 'Admin' : 'User'}
                              </span>
                            </td>
                            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={user.status}
                                onChange={(e) => handleUserStatusChange(user.id, e.target.value)}
                                className="px-2 py-1 text-xs bg-black/30 border border-gray-600 rounded focus:ring-1 focus:ring-purple-500"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </td>
                          </tr>
                          {expandedUserId === user.id && (
                            <tr className="bg-black/20">
                              <td className="px-6 py-4" colSpan={9}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <WorkflowProgressBar user={{
                                      ...user,
                                      workflow: {
                                        profile_loaded: { completed: !!user.created_at, timestamp: user.created_at },
                                        skills_evaluated: { completed: (user.skills || []).length > 0, timestamp: user.updated_at },
                                        assessment_completed: { completed: typeof user.latest_score === 'number', timestamp: user.latest_assessed_at },
                                        learning_path_generated: { completed: (user.learning_path || []).length > 0, timestamp: user.updated_at },
                                      },
                                      latest_assessment: typeof user.latest_score === 'number' ? { score: user.latest_score, total: 100, duration_minutes: 15 } : null,
                                      learning_path: user.learning_path || []
                                    }} />
                                  </div>
                                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                                    <h5 className="font-semibold text-white">User Metadata</h5>
                                    <p className="text-sm text-gray-300"><span className="text-gray-400">Skills:</span> {(user.skills || []).map(s => `${s.name} (${s.level})`).join(', ') || '—'}</p>
                                    <p className="text-sm text-gray-300"><span className="text-gray-400">Learning Path:</span> {(user.learning_path || []).join(' → ') || '—'}</p>
                                    <p className="text-sm text-gray-300"><span className="text-gray-400">Latest Score:</span> {typeof user.latest_score === 'number' ? `${user.latest_score}%` : '—'}</p>
                                    <div className="pt-2 flex flex-wrap gap-3">
                                      <button onClick={() => handleReassess(user)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-xs">Re-assess</button>
                                      <button onClick={() => handleUpdateProfile(user)} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-xs">Update Profile</button>
                                      <button onClick={() => handleGenerateUserReport(user)} className="px-3 py-2 bg-gray-700 hover:bg-gray-800 rounded text-white text-xs">Generate Report</button>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Skill Analytics Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h4 className="text-xl font-bold text-white mb-4">User Skill Growth</h4>
              <SkillAnalyticsChart data={analytics.skillGrowth} />
                  </div>
                </div>
        )}

        {activeTab === 'hackathons' && (
          <HackathonManager />
        )}

        {activeTab === 'assignments' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
            <h3 className="text-2xl font-bold text-white mb-4">Assignments Management</h3>
            <p className="text-gray-400">Standalone assignments management will be implemented here.</p>
            <div className="mt-6">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                Create New Assignment
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
                <h4 className="text-gray-400 text-sm font-medium">Total Users</h4>
                <p className="text-3xl font-bold text-white">{analytics.totalUsers}</p>
                <p className="text-green-400 text-sm">+12% from last month</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
                <h4 className="text-gray-400 text-sm font-medium">Active Users</h4>
                <p className="text-3xl font-bold text-white">{analytics.activeUsers}</p>
                <p className="text-blue-400 text-sm">70% engagement rate</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
                <h4 className="text-gray-400 text-sm font-medium">Total Hackathons</h4>
                <p className="text-3xl font-bold text-white">{analytics.totalHackathons}</p>
                <p className="text-purple-400 text-sm">3 upcoming events</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
                <h4 className="text-gray-400 text-sm font-medium">Submissions</h4>
                <p className="text-3xl font-bold text-white">{analytics.totalSubmissions}</p>
                <p className="text-yellow-400 text-sm">+8% from last week</p>
              </div>
            </div>

            {/* Platform Engagement Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h4 className="text-xl font-bold text-white mb-4">Platform Engagement</h4>
              <div className="h-64 flex items-end justify-center space-x-2">
                {analytics.platformEngagement.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-8 bg-purple-600 rounded-t" style={{ height: `${(day.sessions / 200) * 200}px` }}></div>
                    <span className="text-xs text-gray-400 mt-2">{day.day}</span>
                </div>
                ))}
                </div>
            </div>

            {/* Report Generation */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h4 className="text-xl font-bold text-white mb-4">Generate Reports</h4>
              <div className="flex gap-4">
                  <button 
                  onClick={() => generateReport('users')}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                  Export User Report
                  </button>
                  <button 
                  onClick={() => generateReport('analytics')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Export Analytics Report
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}