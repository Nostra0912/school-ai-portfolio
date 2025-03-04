import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Filter, FileText, Clock, MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApplicationList = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    fetchApplications();
  }, [filterStatus, filterType]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('applications')
        .select(`
          *,
          template:application_templates(name, type),
          submitted_by:user_profiles(first_name, last_name),
          reviewers:application_reviewers(count),
          comments:application_comments(count)
        `);

      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }
      if (filterType) {
        query = query.eq('template.type', filterType);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-amber-100 text-amber-800';
      case 'approved':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app =>
    app.template?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Applications</h1>
        <Link to="/applications/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Application
        </Link>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Types</option>
          <option value="startup">Start-up Charter</option>
          <option value="replication">Replication Charter</option>
          <option value="transfer">Local Transfer Charter</option>
          <option value="grant">Grant Application</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApplications.map((app) => (
            <Link
              key={app.id}
              to={`/applications/${app.id}`}
              className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-foreground">{app.template?.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{app.school_name}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}>
                  {app.status.split('_').map((word: string) => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  <span>Submitted by {app.submitted_by?.first_name} {app.submitted_by?.last_name}</span>
                </div>
                {app.due_date && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Due {new Date(app.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {app.reviewers?.[0]?.count || 0} Reviewers
                </div>
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  {app.comments?.[0]?.count || 0} Comments
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationList;
