import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Admin() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addSuccess, setAddSuccess] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalSubmissions: 0,
    averageScore: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', message: 'Welcome to the Admin Panel', read: false, timestamp: new Date() },
    { id: 2, type: 'warning', message: 'System maintenance scheduled for tomorrow', read: false, timestamp: new Date(Date.now() - 3600000) },
    { id: 3, type: 'success', message: 'New user registration spike detected', read: true, timestamp: new Date(Date.now() - 86400000) }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [darkMode, setDarkMode] = useState(true); // Added missing darkMode state
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    adminId: null,
    adminEmail: '',
    isLoading: false
  });

  useEffect(() => {
    fetchAdmins();
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      
      // Fetch total users count
      const { count: userCount, error: userError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      
      if (userError) throw userError;
      
      // Fetch active users (users who logged in within the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeCount, error: activeError } = await supabase
        .from('user_logins')
        .select('user_id', { count: 'exact', head: true })
        .gt('login_time', sevenDaysAgo.toISOString());
      
      if (activeError) throw activeError;
      
      // Fetch total submissions
      const { count: submissionCount, error: submissionError } = await supabase
        .from('submissions')
        .select('id', { count: 'exact', head: true });
      
      if (submissionError) throw submissionError;
      
      // Calculate average score (mock data for now)
      const averageScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
      
      setStats({
        totalUsers: userCount || 0,
        activeUsers: activeCount || 0,
        totalSubmissions: submissionCount || 0,
        averageScore
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      
      // Fetch the list of admins from the admin table
      const { data, error } = await supabase
        .from('admin')
        .select('id, gmail');
      
      if (error) throw error;
      
      // For each admin, fetch their user details
      const adminsWithDetails = await Promise.all(
        data.map(async (admin) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('username')
            .eq('id', admin.id)
            .single();
          
          return {
            id: admin.id,
            email: admin.gmail,
            username: userData?.username || 'Unknown'
          };
        })
      );
      
      setAdmins(adminsWithDetails);
    } catch (error) {
      console.error('Error fetching admins:', error);
      setError('Failed to load admin list. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      setAddingAdmin(true);
      setAddError(null);
      setAddSuccess(null);
      
      // First, find the user by email
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email);
        
      if (userError) {
        throw new Error(`Error finding user: ${userError.message}`);
      }
      
      if (!users || users.length === 0) {
        throw new Error(`No user found with email: ${email}`);
      }
      
      if (users.length > 1) {
        throw new Error(`Multiple users found with email: ${email}. Please contact administrator.`);
      }
      
      const userId = users[0].id;

      // Check if user is already an admin
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingAdmin) {
        setAddSuccess(`User ${email} is already an admin.`);
        setEmail('');
        return;
      }

      // Add user to admin table
      const { error: insertError } = await supabase
        .from('admin')
        .insert([{ id: userId, gmail: email, password: 'default-password' }]);

      if (insertError) {
        throw new Error(`Error adding admin: ${insertError.message}`);
      }

      setAddSuccess(`Successfully added ${email} as an admin.`);
      
      // Reset the email field
      setEmail('');
      
      // Refresh the admin list
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      setAddError(error.message || 'Failed to add admin. Please try again.');
    } finally {
      setAddingAdmin(false);
    }
  };

  const openConfirmModal = (adminId, adminEmail) => {
    setConfirmModal({
      show: true,
      adminId,
      adminEmail,
      isLoading: false
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      show: false,
      adminId: null,
      adminEmail: '',
      isLoading: false
    });
  };

  const handleRemoveAdmin = async (adminId) => {
    try {
      setConfirmModal(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase
        .from('admin')
        .delete()
        .eq('id', adminId);
      
      if (error) throw error;
      
      // Refresh the admin list
      fetchAdmins();
      
      // Add success notification
      const newNotification = {
        id: Date.now(),
        type: 'success',
        message: 'Admin removed successfully',
        read: false,
        timestamp: new Date()
      };
      setNotifications([newNotification, ...notifications]);
      
      // Close the modal
      closeConfirmModal();
    } catch (error) {
      console.error('Error removing admin:', error);
      setError('Failed to remove admin. Please try again.');
      setConfirmModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.username?.toLowerCase().includes(searchLower) ||
      admin.email?.toLowerCase().includes(searchLower)
    );
  });

  // Sort admins based on username
  const sortedAdmins = [...filteredAdmins].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.username?.localeCompare(b.username || '');
    } else {
      return b.username?.localeCompare(a.username || '');
    }
  });

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen font-sans p-4 md:p-8 relative overflow-hidden transition-colors duration-300 ${darkMode ? 'text-gray-200 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20' : 'text-gray-800 bg-gradient-to-br from-purple-100/50 via-white to-blue-100/50'}`}>
      {/* Glassmorphism background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full filter blur-3xl ${darkMode ? 'bg-purple-500/30' : 'bg-purple-300/40'}`}></div>
        <div className={`absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full filter blur-3xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-300/30'}`}></div>
        <div className={`absolute top-2/3 right-1/4 w-72 h-72 rounded-full filter blur-3xl ${darkMode ? 'bg-pink-500/20' : 'bg-pink-300/30'}`}></div>
      </div>
      <div className="container mx-auto space-y-8 relative z-10">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Management</h1>
            <p className="text-gray-400 mt-2">Manage administrator access to the platform.</p>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notification Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-gray-800/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex justify-between items-center p-3 border-b border-white/10">
                  <h3 className="font-semibold">Notifications</h3>
                  <button 
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer ${!notification.read ? 'bg-white/10' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            {notification.type === 'info' && (
                              <div className="p-1 bg-blue-500/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                            {notification.type === 'warning' && (
                              <div className="p-1 bg-yellow-500/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              </div>
                            )}
                            {notification.type === 'success' && (
                              <div className="p-1 bg-green-500/20 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          {loadingStats ? (
            <div className="col-span-4 flex justify-center items-center py-8 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-xl shadow-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              <span className="ml-3">Loading statistics...</span>
            </div>
          ) : (
            <>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:shadow-purple-500/10 transition duration-300 hover:bg-white/15">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</h3>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:shadow-blue-500/10 transition duration-300 hover:bg-white/15">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Users (7d)</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{stats.activeUsers}</h3>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:shadow-green-500/10 transition duration-300 hover:bg-white/15">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Submissions</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{stats.totalSubmissions}</h3>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:shadow-pink-500/10 transition duration-300 hover:bg-white/15">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Average Score</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{stats.averageScore}%</h3>
                  </div>
                  <div className="p-3 bg-pink-500/20 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard')} 
            className="px-6 py-4 bg-purple-600/80 text-white rounded-xl hover:bg-purple-700/90 transition flex items-center justify-center backdrop-blur-sm shadow-lg border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Go to Admin Dashboard
          </button>
          
          <button 
            onClick={() => alert('This would generate a system report in a real implementation')}
            className="px-6 py-4 bg-blue-600/80 text-white rounded-xl hover:bg-blue-700/90 transition flex items-center justify-center backdrop-blur-sm shadow-lg border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-3a1 1 0 011 1v5a1 1 0 11-2 0v-5a1 1 0 011-1zm4-1a1 1 0 10-2 0v7a1 1 0 102 0V8z" clipRule="evenodd" />
            </svg>
            Generate System Report
          </button>
          
          <button 
            onClick={() => alert('This would open system settings in a real implementation')}
            className="px-6 py-4 bg-green-600/80 text-white rounded-xl hover:bg-green-700/90 transition flex items-center justify-center backdrop-blur-sm shadow-lg border border-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            System Settings
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-900/40 border border-red-500/70 text-red-300 p-4 rounded-lg mb-6 backdrop-blur-md shadow-lg animate-pulse">
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        {/* Admin Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Admin Form */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:shadow-purple-500/10 transition duration-300 hover:bg-white/15">
            <h2 className="text-2xl font-bold text-white mb-4">Add New Admin</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm shadow-inner transition-all duration-300 hover:bg-gray-800/70 text-white"
                  disabled={addingAdmin}
                />
              </div>
              
              <button
                onClick={handleAddAdmin}
                disabled={!email || addingAdmin}
                className={`w-full px-4 py-2 rounded-lg transition shadow-lg ${!email || addingAdmin ? 'bg-gray-700/80 text-gray-400 cursor-not-allowed' : 'bg-green-600/80 text-white hover:bg-green-700/90 hover:shadow-green-500/20'}`}
              >
                {addingAdmin ? 'Adding...' : 'Add Admin'}
              </button>
              
              {addError && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-3 rounded-lg mt-2 backdrop-blur-sm shadow-md">
                  <p className="font-medium text-sm">{addError}</p>
                </div>
              )}
              
              {addSuccess && (
                <div className="bg-green-900/30 border border-green-500/50 text-green-300 p-4 rounded-lg mt-4 backdrop-blur-sm shadow-md animate-pulse">
                  <p className="font-medium">{addSuccess}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Admin List */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-xl shadow-xl hover:shadow-blue-500/10 transition duration-300 hover:bg-white/15">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Current Admins</h2>
              
              {/* Search Bar */}
              <div className="relative mt-4 md:mt-0 w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-sm text-white placeholder-gray-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                <span className="ml-3">Loading admins...</span>
              </div>
            ) : admins.length > 0 ? (
              filteredAdmins.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400 text-lg">No admins found matching "{searchTerm}"</p>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white rounded-lg transition backdrop-blur-sm"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl backdrop-blur-sm bg-white/5 border border-white/10">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-white/20">
                        <th 
                          className="p-3 font-medium text-white cursor-pointer hover:bg-white/10 transition-colors"
                          onClick={toggleSortOrder}
                        >
                          <div className="flex items-center">
                            Username
                            <svg xmlns="http://www.w3.org/2000/svg" className={`ml-1 h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </th>
                        <th className="p-3 font-medium text-white">Email</th>
                        <th className="p-3 font-medium text-white">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedAdmins.map((admin, index) => (
                      <tr key={admin.id} className={`border-b border-white/10 hover:bg-white/10 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white/5' : ''}`}>
                        <td className="p-3">{admin.username}</td>
                        <td className="p-3">{admin.email}</td>
                        <td className="p-3">
                          <button
                            onClick={() => openConfirmModal(admin.id, admin.email)}
                            className="px-3 py-1 bg-red-600/80 text-white rounded hover:bg-red-700/90 transition text-sm shadow-lg border border-white/10 backdrop-blur-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )) : (
              <div className="text-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-inner">
                <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-gray-300 font-medium">No admins found</p>
                <p className="mt-2 text-sm text-gray-400">Add an admin using the form on the left</p>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmModal.show && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeConfirmModal}></div>
            <div className="relative bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-fadeIn">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-center mb-2">Confirm Admin Removal</h3>
              <p className="text-gray-300 text-center mb-6">
                Are you sure you want to remove <span className="font-semibold text-white">{confirmModal.adminEmail}</span> from administrators?
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={closeConfirmModal}
                  className="px-4 py-2 bg-gray-600/50 hover:bg-gray-600/80 text-white rounded-lg transition backdrop-blur-sm"
                  disabled={confirmModal.isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveAdmin(confirmModal.adminId)}
                  className="px-4 py-2 bg-red-600/80 hover:bg-red-700/90 text-white rounded-lg transition backdrop-blur-sm flex items-center"
                  disabled={confirmModal.isLoading}
                >
                  {confirmModal.isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Removing...
                    </>
                  ) : (
                    'Remove Admin'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}