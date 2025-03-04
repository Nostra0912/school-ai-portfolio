import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Play, Pause, Settings, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Workflow, WorkflowTrigger, WorkflowAction, WorkflowStep } from '../types/workflow';
import WorkflowForm from '../components/workflow/WorkflowForm';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';

const Workflows = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [triggers, setTriggers] = useState<WorkflowTrigger[]>([]);
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedWorkflow) {
      fetchWorkflowSteps(selectedWorkflow.id);
    }
  }, [selectedWorkflow]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([
        fetchWorkflows(),
        fetchTriggers(),
        fetchActions()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setError('Failed to fetch workflows');
    }
  };

  const fetchTriggers = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_triggers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      console.log('Fetched triggers:', data); // Debug log
      setTriggers(data || []);
    } catch (error) {
      console.error('Error fetching triggers:', error);
      setError('Failed to fetch triggers');
    }
  };

  const fetchActions = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_actions')
        .select('*')
        .order('name');
      
      if (error) throw error;
      console.log('Fetched actions:', data); // Debug log
      setActions(data || []);
    } catch (error) {
      console.error('Error fetching actions:', error);
      setError('Failed to fetch actions');
    }
  };

  const fetchWorkflowSteps = async (workflowId: string) => {
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_number');

      if (error) throw error;
      setWorkflowSteps(data || []);
    } catch (error) {
      console.error('Error fetching workflow steps:', error);
      setError('Failed to fetch workflow steps');
    }
  };

  const handleCreateWorkflow = async (data: Partial<Workflow>) => {
    try {
      const workflowData = {
        ...data,
        created_by: null
      };

      const { data: newWorkflow, error } = await supabase
        .from('workflows')
        .insert([workflowData])
        .select()
        .single();

      if (error) throw error;

      setWorkflows([newWorkflow, ...workflows]);
      setShowForm(false);
      setSelectedWorkflow(newWorkflow);
      setShowBuilder(true);
    } catch (error) {
      console.error('Error creating workflow:', error);
      setError('Failed to create workflow');
    }
  };

  const handleUpdateWorkflow = async (data: Partial<Workflow>) => {
    if (!selectedWorkflow) return;

    try {
      const { data: updatedWorkflow, error } = await supabase
        .from('workflows')
        .update(data)
        .eq('id', selectedWorkflow.id)
        .select()
        .single();

      if (error) throw error;

      setWorkflows(workflows.map(w => 
        w.id === updatedWorkflow.id ? updatedWorkflow : w
      ));
      setShowForm(false);
    } catch (error) {
      console.error('Error updating workflow:', error);
      setError('Failed to update workflow');
    }
  };

  const handleAddStep = async (type: 'trigger' | 'action' | 'condition') => {
    if (!selectedWorkflow) return;

    try {
      // First, fetch the current maximum step number for this workflow
      const { data: existingSteps, error: fetchError } = await supabase
        .from('workflow_steps')
        .select('step_number')
        .eq('workflow_id', selectedWorkflow.id)
        .order('step_number', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      // Calculate the next step number
      const nextStepNumber = existingSteps && existingSteps.length > 0 
        ? existingSteps[0].step_number + 1 
        : 1;

      const newStep: Partial<WorkflowStep> = {
        workflow_id: selectedWorkflow.id,
        step_number: nextStepNumber,
        step_type: type,
        config: {}
      };

      const { data: step, error } = await supabase
        .from('workflow_steps')
        .insert([newStep])
        .select()
        .single();

      if (error) throw error;
      setWorkflowSteps([...workflowSteps, step]);
    } catch (error) {
      console.error('Error adding workflow step:', error);
      setError('Failed to add workflow step');
    }
  };

  const handleUpdateStep = async (stepId: string, config: Record<string, any>) => {
    try {
      const { data: step, error } = await supabase
        .from('workflow_steps')
        .update({ config })
        .eq('id', stepId)
        .select()
        .single();

      if (error) throw error;
      setWorkflowSteps(workflowSteps.map(s => 
        s.id === step.id ? step : s
      ));
    } catch (error) {
      console.error('Error updating workflow step:', error);
      setError('Failed to update workflow step');
    }
  };

  const handleDeleteStep = async (stepId: string) => {
    try {
      const { error } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('id', stepId);

      if (error) throw error;
      
      // After deleting, reorder remaining steps
      const remainingSteps = workflowSteps.filter(s => s.id !== stepId);
      const reorderedSteps = await reorderWorkflowSteps(remainingSteps);
      setWorkflowSteps(reorderedSteps);
    } catch (error) {
      console.error('Error deleting workflow step:', error);
      setError('Failed to delete workflow step');
    }
  };

  const reorderWorkflowSteps = async (steps: WorkflowStep[]): Promise<WorkflowStep[]> => {
    try {
      const updates = steps.map((step, index) => ({
        id: step.id,
        step_number: index + 1,
        step_type: step.step_type,
        workflow_id: step.workflow_id,
        config: step.config
      }));

      const { data, error } = await supabase
        .from('workflow_steps')
        .upsert(updates)
        .select();

      if (error) throw error;
      return data || steps;
    } catch (error) {
      console.error('Error reordering steps:', error);
      return steps;
    }
  };

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-700';
      case 'inactive':
        return 'bg-gray-50 text-gray-700';
      case 'draft':
        return 'bg-amber-50 text-amber-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <button 
          onClick={fetchInitialData}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">
          {showBuilder ? 'Workflow Builder' : 'Workflows'}
        </h1>
        {!showBuilder && (
          <button 
            className="btn-primary flex items-center gap-2"
            onClick={() => setShowForm(true)}
          >
            <Plus className="w-4 h-4" />
            Create Workflow
          </button>
        )}
      </div>

      {showBuilder ? (
        <WorkflowBuilder
          steps={workflowSteps}
          triggers={triggers}
          actions={actions}
          onAddStep={handleAddStep}
          onUpdateStep={handleUpdateStep}
          onDeleteStep={handleDeleteStep}
        />
      ) : (
        <>
          {/* Search and Filter Bar */}
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

          {/* Workflows Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-foreground">{workflow.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {workflow.description || 'No description'}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Created {new Date(workflow.created_at).toLocaleDateString()}</span>
                    <ArrowRight className="w-4 h-4 mx-2" />
                    <span>Updated {new Date(workflow.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-between items-center bg-secondary/20">
                  <div className="flex gap-2">
                    {workflow.status === 'active' ? (
                      <button className="p-2 hover:bg-secondary rounded-full" title="Pause Workflow">
                        <Pause className="w-4 h-4 text-primary" />
                      </button>
                    ) : (
                      <button className="p-2 hover:bg-secondary rounded-full" title="Activate Workflow">
                        <Play className="w-4 h-4 text-primary" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-secondary rounded-full" title="Workflow Settings">
                      <Settings className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                  <button
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                    onClick={() => {
                      setSelectedWorkflow(workflow);
                      setShowBuilder(true);
                    }}
                  >
                    Edit Workflow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Workflow Form Modal */}
      {showForm && (
        <WorkflowForm
          workflow={selectedWorkflow || undefined}
          onSubmit={selectedWorkflow ? handleUpdateWorkflow : handleCreateWorkflow}
          onClose={() => {
            setShowForm(false);
            setSelectedWorkflow(null);
          }}
        />
      )}
    </div>
  );
};

export default Workflows;
