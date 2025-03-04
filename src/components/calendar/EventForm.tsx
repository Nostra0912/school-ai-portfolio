import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, X } from 'lucide-react';

interface EventFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, initialData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    start_time: initialData?.start_time ? new Date(initialData.start_time).toISOString().slice(0, 16) : '',
    end_time: initialData?.end_time ? new Date(initialData.end_time).toISOString().slice(0, 16) : '',
    location: initialData?.location || '',
    event_type: initialData?.event_type || '',
    visibility: initialData?.visibility || 'public'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      if (initialData) {
        const { error: updateError } = await supabase
          .from('calendar_events')
          .update(formData)
          .eq('id', initialData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('calendar_events')
          .insert([formData]);

        if (insertError) throw insertError;
      }

      if (onSubmit) {
        onSubmit(formData);
      } else {
        navigate('/calendar');
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
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Event Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData(d => ({ ...d, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Start Time
          </label>
          <input
            type="datetime-local"
            value={formData.start_time}
            onChange={e => setFormData(d => ({ ...d, start_time: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            End Time
          </label>
          <input
            type="datetime-local"
            value={formData.end_time}
            onChange={e => setFormData(d => ({ ...d, end_time: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={e => setFormData(d => ({ ...d, location: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Event Type
          </label>
          <select
            value={formData.event_type}
            onChange={e => setFormData(d => ({ ...d, event_type: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="">Select Type</option>
            <option value="meeting">Meeting</option>
            <option value="training">Training</option>
            <option value="deadline">Deadline</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Visibility
          </label>
          <select
            value={formData.visibility}
            onChange={e => setFormData(d => ({ ...d, visibility: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="role_based">Role Based</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/calendar')}
          className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;
