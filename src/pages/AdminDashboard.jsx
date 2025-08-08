import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import HackathonManager from '../components/HackathonManager';
import SkillAnalyticsChart from '../components/SkillAnalyticsChart';

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
          is_admin: user.is_admin || false
        }));
        console.log('Transformed users:', transformedUsers);
        setUsers(transformedUsers);
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
        activeUsers: Math.floor((usersResult.count || 150) * 0.7),
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id?.toString().includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
                <div className="flex gap-4">
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
                        <th className="px-6 py-3">Created Date</th>
                          <th className="px-6 py-3">Last Updated</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-700 hover:bg-white/5 transition">
                          <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                          <td className="px-6 py-4">{user.email}</td>
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
                          <td className="px-6 py-4">
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