import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { History, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

interface DocumentVersioningProps {
  documentId: string;
  onRestore?: (version: any) => void;
}

const DocumentVersioning: React.FC<DocumentVersioningProps> = ({ documentId, onRestore }) => {
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_versions')
        .select(`
          *,
          changes:document_version_changes(*),
          created_by:user_profiles(first_name, last_name)
        `)
        .eq('document_id', documentId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: any) => {
    if (!window.confirm('Are you sure you want to restore this version? This will create a new version with the restored content.')) {
      return;
    }

    try {
      const { data: latestVersion, error: versionError } = await supabase
        .from('document_versions')
        .select('version_number')
        .eq('document_id', documentId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      if (versionError) throw versionError;

      const newVersion = {
        document_id: documentId,
        version_number: latestVersion.version_number + 1,
        content: version.content,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      const { error: insertError } = await supabase
        .from('document_versions')
        .insert([newVersion]);

      if (insertError) throw insertError;

      if (onRestore) {
        onRestore(version);
      }

      fetchVersions();
    } catch (err) {
      console.error('Error restoring version:', err);
    }
  };

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
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="space-y-4">
          {versions.map((version) => (
            <div
              key={version.id}
              className="bg-card rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <History className="w-5 h-5 text-primary mr-2" />
                  <div>
                    <h3 className="font-medium text-foreground">
                      Version {version.version_number}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Created by {version.created_by.first_name} {version.created_by.last_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedVersion(version)}
                    className="text-sm text-primary hover:text-primary/80"
                  >
                    View Changes
                  </button>
                  <button
                    onClick={() => handleRestore(version)}
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                {new Date(version.created_at).toLocaleString()}
              </div>

              {version.changes?.length > 0 && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Changes: {formatChanges(version.changes)}
                </div>
              )}
            </div>
          ))}

          {versions.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No versions available
            </p>
          )}
        </div>
      )}

      {selectedVersion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-lg w-full max-w-3xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Version {selectedVersion.version_number} Changes</h2>
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

export default DocumentVersioning;
