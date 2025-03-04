import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Filter, Edit, Trash2, Copy, ArrowUp, ArrowDown } from 'lucide-react';
import TemplateForm from '../../components/documents/TemplateForm';

const Templates = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'created_at'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
  }, [sortField, sortDirection, filterCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('document_templates')
        .select('*, category:document_categories(name)')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (filterCategory) {
        query = query.eq('category_id', filterCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchTemplates();
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const handleDuplicate = async (template: any) => {
    try {
      const { id, created_at, updated_at, ...templateData } = template;
      templateData.name = `${templateData.name} (Copy)`;
      
      const { error } = await supabase
        .from('document_templates')
        .insert([templateData]);

      if (error) throw error;
      fetchTemplates();
    } catch (err) {
      console.error('Error duplicating template:', err);
    }
  };

  const toggleSort = (field: 'name' | 'created_at') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Document Templates</h1>
        <button
          onClick={() => {
            setSelectedTemplate(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Template
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-4 text-sm">
        <button
          onClick={() => toggleSort('name')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          Name
          {sortField === 'name' && (
            sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => toggleSort('created_at')}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          Created Date
          {sortField === 'created_at' && (
            sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-foreground mb-2">{template.name}</h3>
              {template.description && (
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Category: {template.category?.name || 'Uncategorized'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Fields: {template.template_fields?.length || 0}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-end space-x-4">
                <button
                  onClick={() => handleDuplicate(template)}
                  className="text-primary hover:text-primary/80"
                  title="Duplicate Template"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowForm(true);
                  }}
                  className="text-primary hover:text-primary/80"
                  title="Edit Template"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="text-red-500 hover:text-red-600"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TemplateForm
          initialData={selectedTemplate}
          onSubmit={() => {
            setShowForm(false);
            fetchTemplates();
          }}
        />
      )}
    </div>
  );
};

export default Templates;
