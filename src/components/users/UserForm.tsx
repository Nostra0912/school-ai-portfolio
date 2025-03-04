import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface UserFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
}

const UserForm: React.FC<UserFormProps> = ({ onSubmit, initialData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    title: initialData?.title || '',
    organization: initialData?.organization || '',
    phone: initialData?.phone || '',
    profile_type: initialData?.profile_type || '',
    password: '',
    confirm_password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!initialData && formData.password !== formData.confirm_password) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);

      if (!initialData) {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user?.id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            title: formData.title,
            organization: formData.organization,
            phone: formData.phone,
            profile_type: formData.profile_type
          });

        if (profileError) throw profileError;

        // Create primary email address
        const { error: emailError } = await supabase
          .from('user_email_addresses')
          .insert({
            user_id: authData.user?.id,
            email: formData.email,
            is_primary: true
          });

        if (emailError) throw emailError;
      } else {
        // Update existing user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            first_name: formData.first_name,
            last_name: formData.last_name,
            title: formData.title,
            organization: formData.organization,
            phone: formData.phone,
            profile_type: formData.profile_type
          })
          .eq('id', initialData.id);

        if (profileError) throw profileError;
      }

      if (onSubmit) {
        onSubmit(formData);
      } else {
        navigate('/users');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={e => setFormData(d => ({ ...d, first_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={e => setFormData(d => ({ ...d, last_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        {!initialData && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(d => ({ ...d, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Organization
          </label>
          <input
            type="text"
            value={formData.organization}
            onChange={e => setFormData(d => ({ ...d, organization: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData(d => ({ ...d, phone: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Profile Type
          </label>
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

        {!initialData && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={e => setFormData(d => ({ ...d, confirm_password: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/users')}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
};

export default UserForm;
