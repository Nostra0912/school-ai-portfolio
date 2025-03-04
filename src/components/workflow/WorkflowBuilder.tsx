import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, X, ChevronDown } from 'lucide-react';
import type { WorkflowStep, WorkflowTrigger, WorkflowAction } from '../../types/workflow';
import StepConfigurationForm from './StepConfigurationForm';

interface WorkflowBuilderProps {
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  onAddStep: (type: 'trigger' | 'action' | 'condition') => void;
  onUpdateStep: (stepId: string, config: Record<string, any>) => void;
  onDeleteStep: (stepId: string) => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  steps,
  triggers,
  actions,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
}) => {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [showTriggerOptions, setShowTriggerOptions] = useState(false);
  const [showActionOptions, setShowActionOptions] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.trigger-dropdown') && !target.closest('.trigger-button')) {
        setShowTriggerOptions(false);
      }
      if (!target.closest('.action-dropdown') && !target.closest('.action-button')) {
        setShowActionOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const selectedStep = steps.find(step => step.id === selectedStepId);
  const selectedTrigger = selectedStep?.step_type === 'trigger' && selectedStep.config.triggerId
    ? triggers.find(t => t.id === selectedStep.config.triggerId)
    : null;
  const selectedAction = selectedStep?.step_type === 'action' && selectedStep.config.actionId
    ? actions.find(a => a.id === selectedStep.config.actionId)
    : null;

  const filteredTriggers = triggers.filter(trigger =>
    trigger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trigger.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActions = actions.filter(action =>
    action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTrigger = (trigger: WorkflowTrigger) => {
    onAddStep('trigger');
    // Wait for the step to be created before updating its config
    setTimeout(() => {
      const newStep = steps[steps.length - 1];
      if (newStep) {
        onUpdateStep(newStep.id, {
          triggerId: trigger.id,
          config: {}
        });
        setSelectedStepId(newStep.id);
      }
    }, 100);
    setShowTriggerOptions(false);
  };

  const handleAddAction = (action: WorkflowAction) => {
    onAddStep('action');
    // Wait for the step to be created before updating its config
    setTimeout(() => {
      const newStep = steps[steps.length - 1];
      if (newStep) {
        onUpdateStep(newStep.id, {
          actionId: action.id,
          config: {}
        });
        setSelectedStepId(newStep.id);
      }
    }, 100);
    setShowActionOptions(false);
  };

  const handleConfigChange = (config: Record<string, any>) => {
    if (selectedStepId) {
      onUpdateStep(selectedStepId, {
        ...selectedStep?.config,
        config
      });
    }
  };

  const renderDropdownContent = (
    items: (WorkflowTrigger | WorkflowAction)[],
    onSelect: (item: WorkflowTrigger | WorkflowAction) => void
  ) => (
    <div className="absolute top-full left-0 mt-2 w-80 bg-card rounded-lg shadow-lg border p-2 z-10">
      <div className="mb-2">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="max-h-80 overflow-y-auto">
        {items.map(item => (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary text-sm"
          >
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-muted-foreground">{item.description}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex gap-6">
      {/* Steps Timeline */}
      <div className="flex-1 space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors
              ${selectedStepId === step.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            onClick={() => setSelectedStepId(step.id)}
          >
            {/* Step Number */}
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
              {index + 1}
            </div>

            {/* Step Content */}
            <div className="flex-1">
              <div className="font-medium text-foreground capitalize">{step.step_type}</div>
              <div className="text-sm text-muted-foreground">
                {step.step_type === 'trigger' && step.config?.triggerId && (
                  triggers.find(t => t.id === step.config.triggerId)?.name || 'Select a trigger'
                )}
                {step.step_type === 'action' && step.config?.actionId && (
                  actions.find(a => a.id === step.config.actionId)?.name || 'Select an action'
                )}
                {step.step_type === 'condition' && 'Configure condition'}
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStep(step.id);
                if (selectedStepId === step.id) {
                  setSelectedStepId(null);
                }
              }}
              className="p-1 hover:bg-secondary rounded-full"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Connection Line */}
            {index < steps.length - 1 && (
              <div className="absolute left-7 top-16 bottom-0 w-0.5 bg-border -mb-8" />
            )}
          </div>
        ))}

        {/* Add Step Buttons */}
        <div className="flex items-center gap-4 mt-8">
          <div className="relative trigger-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTriggerOptions(!showTriggerOptions);
                setShowActionOptions(false);
              }}
              className="btn-secondary flex items-center gap-2 trigger-button"
            >
              <Plus className="w-4 h-4" />
              Add Trigger
              <ChevronDown className="w-4 h-4" />
            </button>
            {showTriggerOptions && (
              renderDropdownContent(filteredTriggers, handleAddTrigger)
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => {
              onAddStep('condition');
              setTimeout(() => {
                const newStep = steps[steps.length - 1];
                if (newStep) {
                  setSelectedStepId(newStep.id);
                }
              }, 100);
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Condition
          </button>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          <div className="relative action-dropdown">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActionOptions(!showActionOptions);
                setShowTriggerOptions(false);
              }}
              className="btn-secondary flex items-center gap-2 action-button"
            >
              <Plus className="w-4 h-4" />
              Add Action
              <ChevronDown className="w-4 h-4" />
            </button>
            {showActionOptions && (
              renderDropdownContent(filteredActions, handleAddAction)
            )}
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="w-96 border-l p-6">
        <h3 className="font-medium text-lg mb-4">Step Configuration</h3>
        {selectedStepId ? (
          <div className="space-y-4">
            {selectedStep?.step_type === 'trigger' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Selected Trigger
                </label>
                {selectedTrigger ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-secondary/20 rounded-md">
                      <h4 className="font-medium">{selectedTrigger.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedTrigger.description}</p>
                    </div>
                    <StepConfigurationForm
                      type="trigger"
                      schema={selectedTrigger.config.schema}
                      config={selectedStep.config.config || {}}
                      onConfigChange={handleConfigChange}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select a trigger from the dropdown</p>
                )}
              </div>
            )}

            {selectedStep?.step_type === 'action' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Selected Action
                </label>
                {selectedAction ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-secondary/20 rounded-md">
                      <h4 className="font-medium">{selectedAction.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedAction.description}</p>
                    </div>
                    <StepConfigurationForm
                      type="action"
                      schema={selectedAction.config.schema}
                      config={selectedStep.config.config || {}}
                      onConfigChange={handleConfigChange}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Select an action from the dropdown</p>
                )}
              </div>
            )}

            {selectedStep?.step_type === 'condition' && (
              <div>
                <h4 className="text-sm font-medium mb-2">Condition Configuration</h4>
                <StepConfigurationForm
                  type="condition"
                  schema={{
                    type: 'object',
                    properties: {
                      conditions: {
                        type: 'condition_group'
                      }
                    }
                  }}
                  config={selectedStep.config || {}}
                  onConfigChange={handleConfigChange}
                  availableFields={{
                    risk_score: {
                      type: 'number',
                      label: 'Risk Score',
                      validation: { min: 0 }
                    },
                    status: {
                      type: 'select',
                      label: 'Status',
                      options: [
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' }
                      ]
                    },
                    enrollment: {
                      type: 'number',
                      label: 'Enrollment',
                      validation: { min: 0 }
                    },
                    intervention_level: {
                      type: 'select',
                      label: 'Intervention Level',
                      options: [
                        { label: 'Informal Contact', value: 'informal_contact' },
                        { label: 'Initial Contact', value: 'initial_contact' },
                        { label: 'Improvement Plan', value: 'improvement_plan' },
                        { label: 'Notice of Concern', value: 'notice_of_concern' },
                        { label: 'Revocation of Contract', value: 'revocation' }
                      ]
                    }
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Select a step to configure its settings</p>
        )}
      </div>
    </div>
  );
};

export default WorkflowBuilder;
