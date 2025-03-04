import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { UserPlus, X } from 'lucide-react';

interface EventAttendeesProps {
  eventId: string;
}

const EventAttendees: React.FC<EventAttendeesProps> = ({ eventId }) => {
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    fetchAttendees();
  }, [eventId]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('event_attendees')
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
        .eq('event_id', eventId);

      if (error) throw error;
      setAttendees(data || []);
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

  const addAttendee = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert([{
          event_id: eventId,
          user_id: userId,
          status: 'pending'
        }]);

      if (error) throw error;

      setShowAddModal(false);
      setSearchTerm('');
      setSearchResults([]);
      await fetchAttendees();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeAttendee = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
      await fetchAttendees();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateAttendeeStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .update({ status })
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
      await fetchAttendees();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'tentative':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Attendees
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Attendee
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendees.map((attendee) => (
                <tr key={attendee.user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {attendee.user.first_name} {attendee.user.last_name}
                    </div>
                    {attendee.user.title && (
                      <div className="text-sm text-gray-500">
                        {attendee.user.title}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.user.organization || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={attendee.status}
                      onChange={e => updateAttendeeStatus(attendee.user.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 ${getStatusColor(attendee.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                      <option value="tentative">Tentative</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removeAttendee(attendee.user.id)}
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
       ))}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add Attendee
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
                          onClick={() => addAttendee(user.id)}
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

export default EventAttendees;
