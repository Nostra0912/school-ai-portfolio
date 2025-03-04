import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfileProps {
  user?: User;
  isEditable?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, isEditable = false }) => {
  const { id } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    title: '',
    organization: '',
    phone: '',
    profile_type: ''
  });

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_email_addresses(*)
        `)
        .eq('id', id || user?.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        title: data.title || '',
        organization: data.organization || '',
        phone: data.phone || '',
        profile_type: data.profile_type
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('id', id || user?.id);

      if (error) throw error;
      
      setEditMode(false);
      await fetchProfile();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!profile) return <div className="text-gray-500 p-4">Profile not found</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {editMode ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={e => setFormData(d => ({ ...d, first_name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={e => setFormData(d => ({ ...d, last_name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(d => ({ ...d, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization</label>
              <input
                type="text"
                value={formData.organization}
                onChange={e => setFormData(d => ({ ...d, organization: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Type</label>
              <select
                value={formData.profile_type}
                onChange={e => setFormData(d => ({ ...d, profile_type: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              >
                <option value="">Select Type</option>
                <option value="staff">Staff</option>
                <option value="board_member">Board Member</option>
                <option value="school_leader">School Leader</option>
                <option value="authorizer">Authorizer</option>
                <option value="external">External</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {profile.first_name} {profile.last_name}
              </h2>
              {profile.title && (
                <p className="text-gray-600">{profile.title}</p>
              )}
            </div>
            {isEditable && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Edit Profile
              </button>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Organization</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.organization || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{profile.phone || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Profile Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {profile.profile_type.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Addresses</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul className="space-y-1">
                  {profile.user_email_addresses?.map((email: any) => (
                    <li key={email.id} className="flex items-center">
                      {email.email}
                      {email.is_primary && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                          Primary
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
