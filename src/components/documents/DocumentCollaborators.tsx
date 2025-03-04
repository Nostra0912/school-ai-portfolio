import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, X } from 'lucide-react';

interface DocumentCollaboratorsProps {
  documentId: string;
}

const DocumentCollaborators: React.FC<DocumentCollaboratorsProps> = ({ documentId }) => {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState('viewer');

  useEffect(() => {
    fetchCollaborators();
  }, [documentId]);

  const fetchCollaborators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_collaborators')
        .select(`
          *,
          user:user_profiles(
            id,
            first_name,
            last_name,
            title,
            organization
          )
        `)
        .eq('document_id', documentId);

      if (error) throw error;
      setCollaborators(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, title, organization')
        .or(`first_name.ilike.%${term}%,last_name.ilike.%${term}%,email.ilike.%${term}%`)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const addCollaborator = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('document_collaborators')
        .insert([{
          document_id: documentId,
          user_id: userId,
          role: selectedRole
        }]);

      if (error) throw error;

      setShowAddModal(false);
      setSearchTerm('');
      setSearchResults([]);
      await fetchCollaborators();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeCollaborator = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('document_collaborators')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', userId);

      if (error) throw error;
      await fetchCollaborators();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Collaborators
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Collaborator
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {collaborators.map((collaborator) => (
                <tr key={collaborator.user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {collaborator.user.first_name} {collaborator.user.last_name}
                    </div>
                    {collaborator.user.title && (
                      <div className="text-sm text-gray-500">
                        {collaborator.user.title}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {collaborator.user.organization || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary/10 text-primary">
                      {collaborator.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removeCollaborator(collaborator.user.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add Collaborator
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Search Users
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="Search by name or email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="reviewer">Reviewer</option>
                </select>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Search Results
                  </h4>
                  <div className="border rounded-md divide-y">
                    {searchResults.map(user => (
                      <div
                        key={user.id}
                        className="p-3 flex justify-between items-center hover:bg-gray-50"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          {user.title && (
                            <div className="text-sm text-gray-500">
                              {user.title}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => addCollaborator(user.id)}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentCollaborators;
