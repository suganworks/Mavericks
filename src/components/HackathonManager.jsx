import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function HackathonManager() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);

  // Form state for creating/editing hackathons
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    status: 'upcoming'
  });

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hackathons')
        .select(`
          *,
          hackathon_registrations(count),
          hackathon_submissions(count)
        `)
        .order('start_at', { ascending: false });

      if (error) throw error;
      setHackathons(data || []);
    } catch (err) {
      console.error('Error fetching hackathons:', err);
      setError('Failed to load hackathons');
      // Set sample data for development
      setHackathons([
        {
          id: 1,
          title: 'Sample Hackathon 2024',
          description: 'A sample hackathon for testing',
          start_at: '2024-02-01T00:00:00Z',
          end_at: '2024-02-03T00:00:00Z',
          status: 'upcoming',
          hackathon_registrations: [{ count: 25 }],
          hackathon_submissions: [{ count: 18 }]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHackathon) {
        const { error } = await supabase
          .from('hackathons')
          .update(formData)
          .eq('id', editingHackathon.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('hackathons')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      setShowCreateForm(false);
      setEditingHackathon(null);
      setFormData({ title: '', description: '', start_at: '', end_at: '', status: 'upcoming' });
      fetchHackathons();
    } catch (err) {
      console.error('Error saving hackathon:', err);
      setError('Failed to save hackathon');
    }
  };

  const handleEdit = (hackathon) => {
    setEditingHackathon(hackathon);
    setFormData({
      title: hackathon.title,
      description: hackathon.description,
      start_at: hackathon.start_at.slice(0, 16), // Format for datetime-local input
      end_at: hackathon.end_at.slice(0, 16),
      status: hackathon.status
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hackathon?')) return;
    
    try {
      const { error } = await supabase
        .from('hackathons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchHackathons();
    } catch (err) {
      console.error('Error deleting hackathon:', err);
      setError('Failed to delete hackathon');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      upcoming: 'bg-blue-900/50 text-blue-300',
      ongoing: 'bg-green-900/50 text-green-300',
      past: 'bg-gray-900/50 text-gray-300'
    };
    return statusClasses[status] || statusClasses.past;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Hackathon Management</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Create New Hackathon
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-black/20 p-6 rounded-xl border border-gray-700 mb-6">
            <h4 className="text-xl font-bold text-white mb-4">
              {editingHackathon ? 'Edit Hackathon' : 'Create New Hackathon'}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Hackathon Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="past">Past</option>
                </select>
              </div>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 h-24"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="datetime-local"
                  value={formData.start_at}
                  onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                  className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
                <input
                  type="datetime-local"
                  value={formData.end_at}
                  onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                  className="px-4 py-2 bg-black/30 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  {editingHackathon ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingHackathon(null);
                    setFormData({ title: '', description: '', start_at: '', end_at: '', status: 'upcoming' });
                  }}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hackathons List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-3">Loading hackathons...</span>
          </div>
        ) : (
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
                {hackathons.map((hackathon) => (
                  <tr key={hackathon.id} className="border-b border-gray-700 hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-medium text-white">{hackathon.title}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(hackathon.status)}`}>
                        {hackathon.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(hackathon.start_at).toLocaleDateString()} - {new Date(hackathon.end_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">{hackathon.hackathon_registrations?.[0]?.count || 0}</td>
                    <td className="px-6 py-4">{hackathon.hackathon_submissions?.[0]?.count || 0}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(hackathon)}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(hackathon.id)}
                          className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                        <a
                          href={`/hackathons/${hackathon.id}/leaderboard`}
                          className="px-3 py-1 text-xs font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition"
                        >
                          View Leaderboard
                        </a>
                        <a
                          href={`/hackathons/${hackathon.id}/score-report`}
                          className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
                        >
                          Score Report
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
