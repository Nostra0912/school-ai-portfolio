import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface Application {
  id: string;
  template_id: string;
  school_name: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submission_data: Record<string, any>;
  submitted_by: string;
  submitted_at: string | null;
  due_date: string | null;
  template?: {
    name: string;
    type: string;
  };
  submitted_by_profile?: {
    first_name: string;
    last_name: string;
  };
  reviewers_count?: number;
  comments_count?: number;
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.get('/applications');
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch applications'));
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData: Partial<Application>) => {
    try {
      const data = await api.post('/applications', applicationData);
      setApplications(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create application');
    }
  };

  const getApplication = async (id: string) => {
    try {
      return await api.get(`/applications/${id}`);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to fetch application');
    }
  };

  return {
    applications,
    loading,
    error,
    fetchApplications,
    createApplication,
    getApplication
  };
}
