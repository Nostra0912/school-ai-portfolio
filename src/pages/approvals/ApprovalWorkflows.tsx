import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Search, Filter, Settings } from 'lucide-react';

const ApprovalWorkflows = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('approval_workflows')
        .select(`
          *,
          template:document_templates(name),
          steps:approval_steps(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Approval Workflows</h1>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filters
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
          {filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="bg-card rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium text-foreground">{workflow.name}</h3>
                  {workflow.description && (
                    <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  workflow.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-700'
                }`}>
                  {workflow.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Template: {workflow.template?.name || 'Any'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Steps: {workflow.steps?.length || 0}
                </p>
              </div>

              <div className="pt-4 border-t flex justify-end">
                <button className="text-sm text-primary hover:text-primary/80 flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflows;
