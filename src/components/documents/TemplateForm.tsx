import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, X, Plus, Trash2 } from 'lucide-react';

interface TemplateFormProps {
  onSubmit?: (data: any) => void;
  initialData?: any;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ onSubmit, initialData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category_id: initialData?.category_id || '',
    template_fields: initialData?.template_fields || []
  });

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const addField = () => {
    setFormData(d => ({
      ...d,
      template_fields: [
        ...d.template_fields,
        {
          name: '',
          label: '',
          type: 'text',
          required: false,
          description: '',
          options: []
        }
      ]
    }));
  };

  const removeField = (index: number) => {
    setFormData(d => ({
      ...d,
      template_fields: d.template_fields.filter((_, i) => i !== index)
    }));
  };

  const updateField = (index: number, updates: any) => {
    setFormData(d => ({
      ...d,
      template_fields: d.template_fields.map((field, i) => 
        i === index ? { ...field, ...updates } : field
      )
    }));
  };

  const addOption = (fieldIndex: number) => {
    setFormData(d => ({
      ...d,
      template_fields: d.template_fields.map((field, i) => 
        i === fieldIndex ? {
          ...field,
          options: [
            ...field.options,
            { label: '', value: '' }
          ]
        } : field
      )
    }));
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    setFormData(d => ({
      ...d,
      template_fields: d.template_fields.map((field, i) => 
        i === fieldIndex ? {
          ...field,
          options: field.options.filter((_, j) => j !== optionIndex)
        } : field
      )
    }));
  };

  const updateOption = (fieldIndex: number, optionIndex: number, updates: any) => {
    setFormData(d => ({
      ...d,
      template_fields: d.template_fields.map((field, i) => 
        i === fieldIndex ? {
          ...field,
          options: field.options.map((option, j) => 
            j === optionIndex ? { ...option, ...updates } : option
          )
        } : field
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      if (initialData) {
        const { error: updateError } = await supabase
          .from('document_templates')
          .update(formData)
          .eq('id', initialData.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('document_templates')
          .insert([formData]);

        if (insertError) throw insertError;
      }

      if (onSubmit) {
        onSubmit(formData);
      } else {
        navigate('/documents/templates');
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
            Template Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
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

        <div className="col-span-2">
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
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Template Fields
          </h3>
          <button
            type="button"
            onClick={addField}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>
        </div>

        <div className="space-y-6">
          {formData.template_fields.map((field, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Field {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Field Name
                  </label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={e => updateField(index, { name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Label
                  </label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={e => updateField(index, { label: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Field Type
                  </label>
                  <select
                    value={field.type}
                    onChange={e => updateField(index, { type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    required
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Text Area</option>
                    <option value="select">Select</option>
                    <option value="date">Date</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                    <option value="url">URL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Required
                  </label>
                  <div className="mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={e => updateField(index, { required: e.target.checked })}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        This field is required
                      </span>
                    </label>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={field.description}
                    onChange={e => updateField(index, { description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                {field.type === 'select' && (
                  <div className="col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Options
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(index)}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {field.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <input
                            type="text"
                            value={option.label}
                            onChange={e => updateOption(index, optionIndex, { label: e.target.value })}
                            placeholder="Label"
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                          />
                          <input
                            type="text"
                            value={option.value}
                            onChange={e => updateOption(index, optionIndex, { value: e.target.value })}
                            placeholder="Value"
                            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index, optionIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/documents/templates')}
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
          {loading ? 'Saving...' : initialData ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  );
};

export default TemplateForm;
