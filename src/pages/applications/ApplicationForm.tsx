import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, X } from 'lucide-react';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    template_id: '',
    school_name: '',
    status: 'draft',
    submission_data: {}
  });

  useEffect(() => {
    fetchTemplates();
    if (id) {
      fetchApplication();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('application_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, template:application_templates(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      setFormData(data);
      setSelectedTemplate(data.template);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    setFormData(d => ({
      ...d,
      template_id: templateId,
      submission_data: {}
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const data = {
        ...formData,
        submitted_by: userId
      };

      if (id) {
        const { error } = await supabase
          .from('applications')
          .update(data)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('applications')
          .insert([data]);

        if (error) throw error;
      }

      navigate('/applications');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: any) => {
    const value = formData.submission_data[field.name] || '';
    const handleChange = (newValue: any) => {
      setFormData(d => ({
        ...d,
        submission_data: {
          ...d.submission_data,
          [field.name]: newValue
        }
      }));
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <input
            type={field.type}
            value={value}
            onChange={e => handleChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={e => handleChange(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required={field.required}
          />
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={e => handleChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((option: any) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">
          {id ? 'Edit Application' : 'New Application'}
        </h1>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-card rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Application Type
            </label>
            <select
              value={formData.template_id}
              onChange={e => handleTemplateChange(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            >
              <option value="">Select Application Type</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground">
              School Name
            </label>
            <input
              type="text"
              value={formData.school_name}
              onChange={e => setFormData(d => ({ ...d, school_name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            />
          </div>
        </div>
      </div>

      {selectedTemplate && (
        <div className="bg-card rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-foreground mb-6">
            {selectedTemplate.name}
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {selectedTemplate.fields.map((field: any) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-foreground">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {field.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};

export default ApplicationForm;
