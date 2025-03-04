import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  status: 'Opened' | 'Closed' | 'Under Review';
  parent_organization: string | null;
  phone: string | null;
  current_enrollment: number;
  website: string | null;
  grades?: { grade: string }[];
  tags?: { tag: string }[];
  operation_details?: {
    student_capacity: number;
    class_size: number;
    teacher_to_student_ratio: string;
    transportation_provided: boolean;
    lunch_provided: boolean;
    financial_aid_available: boolean;
  };
  meal_options?: { meal_option: string }[];
}

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const data = await api.get('/schools');
      setSchools(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch schools'));
    } finally {
      setLoading(false);
    }
  };

  const createSchool = async (schoolData: Partial<School>) => {
    try {
      const data = await api.post('/schools', schoolData);
      setSchools(prev => [data, ...prev]);
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create school');
    }
  };

  return {
    schools,
    loading,
    error,
    fetchSchools,
    createSchool
  };
}
