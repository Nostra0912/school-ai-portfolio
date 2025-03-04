import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, X } from 'lucide-react';

interface DocumentFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
}

const DocumentForm: React.FC<DocumentFormProps> = ({ onSubmit, initialData }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    template_id: initialData?.template_id || '',
    category_id: initialData?.category_id || '',
    status: initialData?.status || 'draft',
    due_date: initialData?.due_date || '',
    submission_data: initialData?.submission_data || {}
  });

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
    if (initialData?.template_id) {
      fetchTemplate(initialData.template_id);
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  };

  const fetchTemplate = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      setSelectedTemplate(data);
    } catch (err) {
      console.error('Error fetching template:', err);
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    setFormData(d => ({ ...d, template_id: templateId }));
    if (templateId) {
      await fetchTemplate(templateId);
    } else {
      setSelectedTemplate(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      if (initialData) {
        // Update existing document
        const { error: updateError } = await supabase
          .from('document_submissions')
          .update(formData)
          .eq('id', id);

        if (updateError) throw updateError;
      } else {
        // Create new document
        const { error: insertError } = await supabase
          .from('document_submissions')
          .insert([formData]);

        if (insertError) throw insertError;
      }

      if (onSubmit) {
        onSubmit(formData);
      } else {
        navigate('/documents');
      }
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
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={e => handleChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required={field.required}
          />
        );
      default:
        return null;
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
            Template
          </label>
          <select
            value={formData.template_id}
            onChange={e => handleTemplateChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="">Select Template</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            value={formData.category_id}
            onChange={e => setFormData(d => ({ ...d, category_id: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={e => setFormData(d => ({ ...d, due_date: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={formData.status}
            onChange={e => setFormData(d => ({ ...d, status: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            required
          >
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {selectedTemplate && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {selectedTemplate.name}
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {selectedTemplate.template_fields.map((field: any) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
                {field.description && (
                  <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/documents')}
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
          {loading ? 'Saving...' : initialData ? 'Update Document' : 'Create Document'}
        </button>
      </div>
    </form>
  );
};

export default DocumentForm;
