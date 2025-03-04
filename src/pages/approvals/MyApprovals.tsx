import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

const MyApprovals = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('approval_assignments')
        .select(`
          *,
          step:approval_steps(*),
          document:document_submissions(
            id,
            template:document_templates(name),
            submitted_by:user_profiles(first_name, last_name)
          )
        `)
        .eq('assigned_to', await supabase.auth.getUser())
        .order('assigned_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      } else if (filter === 'completed') {
        query = query.in('status', ['approved', 'rejected']);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApprovals(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('approval_assignments')
        .update({ status: 'approved', completed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchApprovals();
    } catch (err) {
      console.error('Error approving:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('approval_assignments')
        .update({ status: 'rejected', completed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchApprovals();
    } catch (err) {
      console.error('Error rejecting:', err);
    }
  };

  const filteredApprovals = approvals.filter(approval =>
    approval.document?.template?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-50 text-emerald-700';
      case 'rejected':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-amber-50 text-amber-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">My Approvals</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pending' ? 'bg-primary text-white' : 'bg-secondary text-foreground'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md ${
              filter === 'completed' ? 'bg-primary text-white' : 'bg-secondary text-foreground'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all' ? 'bg-primary text-white' : 'bg-secondary text-foreground'
            }`}
          >
            All
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search approvals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-foreground">
                    {approval.document?.template?.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Step: {approval.step?.name}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(approval.status)}`}>
                  {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Submitted by: {approval.document?.submitted_by?.first_name} {approval.document?.submitted_by?.last_name}
                </p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-1" />
                  {approval.due_date ? (
                    <span>Due by {new Date(approval.due_date).toLocaleDateString()}</span>
                  ) : (
                    <span>No deadline</span>
                  )}
                </div>
              </div>

              {approval.status === 'pending' && (
                <div className="pt-4 border-t flex justify-end space-x-4">
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApprovals;
