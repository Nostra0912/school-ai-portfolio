import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { History, Filter, Search } from 'lucide-react';

interface DocumentAuditLogProps {
  documentId: string;
}

const DocumentAuditLog: React.FC<DocumentAuditLogProps> = ({ documentId }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    fetchLogs();
  }, [documentId]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_audit_log')
        .select(`
          *,
          user:user_profiles(first_name, last_name)
        `)
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterType || log.action === filterType;
    return matchesSearch && matchesFilter;
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return '📝';
      case 'updated':
        return '✏️';
      case 'deleted':
        return '🗑️';
      case 'shared':
        return '🔗';
      case 'viewed':
        return '👁️';
      default:
        return '📋';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Actions</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="shared">Shared</option>
          <option value="viewed">Viewed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-card rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl">{getActionIcon(log.action)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-foreground capitalize">
                        {log.action}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">
                        by {log.user.first_name} {log.user.last_name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No audit logs found
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentAuditLog;
