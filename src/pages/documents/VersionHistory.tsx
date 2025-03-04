import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, History, ArrowLeft, ArrowRight } from 'lucide-react';

const VersionHistory = () => {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_versions')
        .select(`
          *,
          document:document_submissions(
            id,
            template:document_templates(name),
            category:document_categories(name)
          ),
          created_by:user_profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredVersions = versions.filter(version =>
    version.document?.template?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatChanges = (changes: any[]) => {
    return changes.map(change => {
      const type = change.change_type === 'added' ? 'Added' :
                   change.change_type === 'modified' ? 'Modified' :
                   'Removed';
      return `${type} ${change.field_path}`;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Version History</h1>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search versions..."
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
        <div className="bg-card rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Version</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVersions.map((version) => (
                  <tr key={version.id} className="border-b hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">
                        {version.document?.template?.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {version.document?.category?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <History className="w-4 h-4 mr-2 text-primary" />
                        <span>v{version.version_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {version.created_by?.first_name} {version.created_by?.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(version.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedVersion(version)}
                          className="text-sm text-primary hover:text-primary/80"
                        >
                          View Changes
                        </button>
                        <button className="text-sm text-primary hover:text-primary/80">
                          Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedVersion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Version Changes</h2>
              <button
                onClick={() => setSelectedVersion(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Version {selectedVersion.version_number - 1}
                </div>
                <div className="flex items-center">
                  Version {selectedVersion.version_number}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
              <div className="bg-secondary/20 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(selectedVersion.content, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
