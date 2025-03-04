import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Filter, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import CategoryForm from '../../components/documents/CategoryForm';

const Categories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'name' | 'created_at'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterParent, setFilterParent] = useState<string>('');

  useEffect(() => {
    fetchCategories();
  }, [sortField, sortDirection]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('document_categories')
        .select('*, parent:document_categories(name)')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const { error } = await supabase
        .from('document_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
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

  const filteredCategories = categories
    .filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!filterParent || category.parent_id === filterParent)
    );

  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Document Categories</h1>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={filterParent}
          onChange={(e) => setFilterParent(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Categories</option>
          {parentCategories.map(category => (
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
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-foreground mb-2">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              )}
              {category.parent && (
                <p className="text-sm text-muted-foreground">
                  Parent Category: {category.parent.name}
                </p>
              )}
              <div className="mt-4 pt-4 border-t flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowForm(true);
                  }}
                  className="text-primary hover:text-primary/80"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <CategoryForm
          initialData={selectedCategory}
          onSubmit={() => {
            setShowForm(false);
            fetchCategories();
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Categories;
