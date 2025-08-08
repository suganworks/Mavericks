import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import AdminStatsBar from '../components/AdminStatsBar';
import SkillAnalyticsChart from '../components/SkillAnalyticsChart';
import WorkflowProgressBar from '../components/WorkflowProgressBar';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';  

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// This is a self-contained component for a single row in the user list.
const UserRow = ({ user }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'bg-green-900/50 text-green-300';
      case 'Inactive': return 'bg-red-900/50 text-red-300';
      case 'Stagnant': return 'bg-yellow-900/50 text-yellow-300';
      default: return 'bg-gray-900/50 text-gray-300';
    }
  };

  const getSkillLevelBadge = (level) => {
    switch(level) {
      case 'Beginner': return 'bg-blue-900/50 text-blue-300';
      case 'Intermediate': return 'bg-purple-900/50 text-purple-300';
      case 'Advanced': return 'bg-pink-900/50 text-pink-300';
      default: return 'bg-gray-900/50 text-gray-300';
    }
  };

  return (
    <>
      <tr className="border-b border-gray-700 hover:bg-white/5 transition cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{user.username}</td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(user.status)}`}>
            {user.status}
          </span>
        </td>
        <td className="px-6 py-4">
          {user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {user.skills.map((skill, index) => (
                <span key={index} className={`px-2 py-1 text-xs font-medium rounded-full ${getSkillLevelBadge(skill.level)}`}>
                  {skill.name}
                </span>
              ))}
            </div>
          ) : 'N/A'}
        </td>
        <td className="px-6 py-4">{user.latest_assessment ? `${user.latest_assessment.score}/${user.latest_assessment.total}` : 'N/A'}</td>
        <td className="px-6 py-4 text-gray-400">{new Date(user.last_updated).toLocaleDateString()}</td>
      </tr>
      {isExpanded && (
        <tr className="bg-black/20">
          <td colSpan="5" className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <WorkflowProgressBar user={user} />
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-white mb-4">Manual Overrides</h4>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => alert(`Re-assessing ${user.username}...`)} className="px-3 py-1.5 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition">Re-assess</button>
                    <button onClick={() => alert(`Updating ${user.username}...`)} className="px-3 py-1.5 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition">Update Profile</button>
                    <button onClick={() => alert(`Generating report for ${user.username}...`)} className="px-3 py-1.5 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition">Generate Report</button>
                  </div>
                </div>
                
                {user.learning_path && user.learning_path.length > 0 && (
                  <div>
                    <h4 className="font-bold text-lg text-white mb-4">Learning Path</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {user.learning_path.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div>
                  <h4 className="font-bold text-lg text-white mb-4">User Metadata</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">User ID:</div>
                    <div className="text-gray-300">{user.id}</div>
                    <div className="text-gray-400">Email:</div>
                    <div className="text-gray-300">{user.email}</div>
                    <div className="text-gray-400">Admin:</div>
                    <div className="text-gray-300">{user.is_admin ? 'Yes' : 'No'}</div>
                    <div className="text-gray-400">Last Updated:</div>
                    <div className="text-gray-300">{new Date(user.last_updated).toLocaleString()}</div>
                  </div>
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
  const [allUsers, setAllUsers] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [analytics, setAnalytics] = useState({
    skillGrowth: [],
    platformEngagement: [],
    topSkills: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // users, hackathons, reports
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch users data from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*');
          
        if (error) throw error;
        
        // Transform the data to match the expected structure
        const transformedUsers = data.map(user => ({
          id: user.id,
          username: user.username || 'Anonymous',
          email: user.email,
          is_admin: user.is_admin || false,
          status: user.status || 'Active',
          last_updated: user.updated_at || user.created_at,
          skills: user.skills || [],
          latest_assessment: user.latest_assessment,
          learning_path_generated: user.learning_path_generated || false,
          workflow: user.workflow || {
            profile_loaded: { completed: true, timestamp: user.created_at },
            skills_evaluated: { completed: !!user.skills?.length, timestamp: user.skills_evaluated_at },
            assessment_completed: { completed: !!user.latest_assessment, timestamp: user.latest_assessment?.timestamp },
            learning_path_generated: { completed: user.learning_path_generated, timestamp: user.learning_path_generated_at }
          },
          learning_path: user.learning_path || []
        }));
        
        setAllUsers(transformedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users data');
      }
    };
    
    fetchUsers();
  }, []);
  
  // Fetch hackathons data from Supabase
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const { data, error } = await supabase
          .from('hackathons')
          .select(`
            *,
            hackathon_registrations(count),
            hackathon_submissions(count)
          `);
          
        if (error) throw error;
        
        // Transform the data to match the expected structure
        const transformedHackathons = data.map(hackathon => ({
          id: hackathon.id,
          title: hackathon.title,
          description: hackathon.description,
          start_date: hackathon.start_at,
          end_date: hackathon.end_at,
          status: hackathon.status || 'upcoming',
          participants: hackathon.hackathon_registrations?.[0]?.count || 0,
          submissions: hackathon.hackathon_submissions?.[0]?.count || 0
        }));
        
        setHackathons(transformedHackathons);
      } catch (err) {
        console.error('Error fetching hackathons:', err);
        setError('Failed to load hackathons data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHackathons();
  }, []);
  
  // Fetch analytics data from Supabase
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // For skill growth analytics
        const { data: skillData, error: skillError } = await supabase
          .from('analytics')
          .select('*')
          .eq('type', 'skill_growth');
          
        if (skillError) throw skillError;
        
        // For platform engagement analytics
        const { data: engagementData, error: engagementError } = await supabase
          .from('analytics')
          .select('*')
          .eq('type', 'platform_engagement');
          
        if (engagementError) throw engagementError;
        
        // For top skills analytics
        const { data: topSkillsData, error: topSkillsError } = await supabase
          .from('analytics')
          .select('*')
          .eq('type', 'top_skills');
          
        if (topSkillsError) throw topSkillsError;
        
        setAnalytics({
          skillGrowth: skillData || [],
          platformEngagement: engagementData || [],
          topSkills: topSkillsData || []
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      }
    };
    
    fetchAnalytics();
  }, [])

  // Memoized calculation to filter users only when inputs change
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = user.username.toLowerCase().includes(lowerSearchTerm) || 
                           user.email.toLowerCase().includes(lowerSearchTerm);
      const matchesSkill = selectedSkill ? user.skills.some(s => s.name === selectedSkill) : true;
      const matchesStatus = selectedStatus ? user.status === selectedStatus : true;
      return matchesSearch && matchesSkill && matchesStatus;
    });
  }, [allUsers, searchTerm, selectedSkill, selectedStatus]);

  // Memoized calculation to get a unique list of all skills
  const allSkills = useMemo(() => [...new Set(allUsers.flatMap(u => u.skills.map(s => s.name)))].sort(), [allUsers]);
  
  // Memoized calculation to get a unique list of all statuses
  const allStatuses = useMemo(() => [...new Set(allUsers.map(u => u.status))].sort(), [allUsers]);
  
  // Data for the stats bar
  const stats = {
    totalUsers: allUsers.length,
    assessmentsTaken: allUsers.filter(u => u.latest_assessment).length,
    activeHackathons: hackathons.filter(h => h.status === 'Active').length,
    skillsInDB: allSkills.length
  };

  // Prepare data for engagement chart
  const engagementChartData = {
    labels: analytics.platformEngagement.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Active Users',
        data: analytics.platformEngagement.map(item => item.active_users),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Assessments Taken',
        data: analytics.platformEngagement.map(item => item.assessments_taken),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4
      },
      {
        label: 'Learning Paths Started',
        data: analytics.platformEngagement.map(item => item.learning_paths_started),
        borderColor: 'rgba(255, 159, 64, 1)',
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        tension: 0.4
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#d1d5db'
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      x: { 
        grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
        ticks: { color: '#d1d5db' } 
      },
      y: { 
        grid: { color: 'rgba(255, 255, 255, 0.1)' }, 
        ticks: { color: '#d1d5db' } 
      }
    }
  };

  // Function to create a new hackathon
  const createHackathon = () => {
    alert('Creating new hackathon... (This would open a form in a real implementation)');
  };

  // Function to generate a report
  const generateReport = (reportType) => {
    alert(`Generating ${reportType} report... (This would download a report in a real implementation)`);
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
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg">
            <p className="font-medium">{error}</p>
            <p className="text-sm mt-1">Please try refreshing the page or contact support if the issue persists.</p>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-lg">Loading dashboard data...</span>
          </div>
        )}
        
        {/* Stats Bar */}
        {!loading && <AdminStatsBar stats={stats} />}

        {/* Tab Navigation */}
        {!loading && (
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
              onClick={() => setActiveTab('reports')} 
              className={`py-3 px-6 font-medium ${activeTab === 'reports' ? 'text-white border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            >
              Reports & Analytics
            </button>
          </div>
        )}

        {/* Users Tab Content */}
        {!loading && activeTab === 'users' && (
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left Side (Search and User List) */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
                <h3 className="text-2xl font-bold text-white mb-4">User Search & Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" 
                    placeholder="Search by username or email..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500" 
                  />
                  <select 
                    value={selectedSkill} 
                    onChange={e => setSelectedSkill(e.target.value)} 
                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Filter by Skill</option>
                    {allSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                  </select>
                  <select 
                    value={selectedStatus} 
                    onChange={e => setSelectedStatus(e.target.value)} 
                    className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Filter by Status</option>
                    {allStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-white">User List & Status</h3>
                  <span className="text-sm text-gray-400">{filteredUsers.length} users found</span>
                </div>
                {filteredUsers.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No users found matching your filters.</p>
                    {searchTerm || selectedSkill || selectedStatus ? (
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedSkill('');
                          setSelectedStatus('');
                        }}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500">Try adding some users to get started.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side (Analytics) */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="text-2xl font-bold text-white mb-4">Top Skills Analytics</h3>
              {allUsers.length > 0 ? (
                <SkillAnalyticsChart users={allUsers} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No user data available for analytics.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hackathons Tab Content */}
        {!loading && activeTab === 'hackathons' && (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Hackathon Management</h3>
                <button 
                  onClick={createHackathon}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  Create New Hackathon
                </button>
              </div>
              
              {hackathons.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-black/20">
                      <tr>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Dates</th>
                        <th className="px-6 py-3">Participants</th>
                        <th className="px-6 py-3">Submissions</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hackathons.map(hackathon => (
                        <tr key={hackathon.id} className="border-b border-gray-700 hover:bg-white/5 transition">
                          <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{hackathon.title}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              hackathon.status === 'Active' ? 'bg-green-900/50 text-green-300' :
                              hackathon.status === 'Upcoming' ? 'bg-blue-900/50 text-blue-300' :
                              'bg-gray-900/50 text-gray-300'
                            }`}>
                              {hackathon.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {new Date(hackathon.start_date).toLocaleDateString()} - {new Date(hackathon.end_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">{hackathon.participants}</td>
                          <td className="px-6 py-4">{hackathon.submissions}</td>
                          <td className="px-6 py-4">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => alert(`Viewing ${hackathon.title}...`)}
                                className="px-3 py-1 text-xs font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition"
                              >
                                View
                              </button>
                              <button 
                                onClick={() => alert(`Editing ${hackathon.title}...`)}
                                className="px-3 py-1 text-xs font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hackathons found.</p>
                  <p className="mt-2 text-sm text-gray-500">Create a new hackathon to get started.</p>
                </div>
              )}
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="text-2xl font-bold text-white mb-4">Hackathon Submissions</h3>
              {hackathons.length > 0 ? (
                <div>
                  <p className="text-gray-400 mb-4">View and manage submissions for active and completed hackathons.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hackathons.filter(h => h.submissions > 0).map(hackathon => (
                      <div key={hackathon.id} className="bg-black/20 p-4 rounded-xl border border-gray-700">
                        <h4 className="font-bold text-white mb-2">{hackathon.title}</h4>
                        <p className="text-sm text-gray-400 mb-3">{hackathon.submissions} submissions</p>
                        <button 
                          onClick={() => alert(`Viewing submissions for ${hackathon.title}...`)}
                          className="w-full px-3 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                        >
                          View Submissions
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">No hackathons available to view submissions</p>
              )}
            </div>
          </div>
        )}

        {/* Reports & Analytics Tab Content */}
        {!loading && activeTab === 'reports' && (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
              <h3 className="text-2xl font-bold text-white mb-6">Platform Engagement</h3>
              {analytics.platformEngagement && analytics.platformEngagement.length > 0 ? (
                <div className="h-80">
                  <Line data={engagementChartData} options={chartOptions} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No platform engagement data available.</p>
                  <p className="mt-2 text-sm text-gray-500">Data will appear as users interact with the platform.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
                <h3 className="text-2xl font-bold text-white mb-4">Generate Reports</h3>
                <div className="space-y-4">
                  <button 
                    onClick={() => generateReport('User Progress')} 
                    className="w-full px-4 py-3 text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition"
                    disabled={allUsers.length === 0}
                  >
                    User Progress Report
                  </button>
                  <button 
                    onClick={() => generateReport('Skill Development')} 
                    className="w-full px-4 py-3 text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition"
                    disabled={allUsers.length === 0}
                  >
                    Skill Development Report
                  </button>
                  <button 
                    onClick={() => generateReport('Platform Usage')} 
                    className="w-full px-4 py-3 text-white bg-gradient-to-r from-green-600 to-teal-600 rounded-lg hover:from-green-700 hover:to-teal-700 transition"
                    disabled={analytics.platformEngagement.length === 0}
                  >
                    Platform Usage Report
                  </button>
                  <button 
                    onClick={() => generateReport('Hackathon Results')} 
                    className="w-full px-4 py-3 text-white bg-gradient-to-r from-pink-600 to-rose-600 rounded-lg hover:from-pink-700 hover:to-rose-700 transition"
                    disabled={hackathons.length === 0}
                  >
                    Hackathon Results Report
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
                <h3 className="text-2xl font-bold text-white mb-4">Skill Growth Over Time</h3>
                {analytics.skillGrowth && analytics.skillGrowth.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                      <thead className="text-xs text-gray-400 uppercase bg-black/20">
                        <tr>
                          <th className="px-6 py-3">Month</th>
                          <th className="px-6 py-3">Users with Skills</th>
                          <th className="px-6 py-3">Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.skillGrowth.map((item, index) => {
                          const prevMonth = index > 0 ? analytics.skillGrowth[index - 1].users : 0;
                          const growth = index > 0 ? item.users - prevMonth : item.users;
                          const growthPercent = index > 0 ? ((growth / prevMonth) * 100).toFixed(1) : '100';
                          
                          return (
                            <tr key={item.month} className="border-b border-gray-700 hover:bg-white/5 transition">
                              <td className="px-6 py-4 font-medium text-white">{item.month}</td>
                              <td className="px-6 py-4">{item.users}</td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center ${growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {growth >= 0 ? '+' : ''}{growth} ({growthPercent}%)
                                  {growth >= 0 ? (
                                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                  )}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No skill growth data available.</p>
                    <p className="mt-2 text-sm text-gray-500">Data will appear as users develop skills over time.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}