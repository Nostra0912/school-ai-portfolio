export type WorkflowStatus = 'active' | 'inactive' | 'draft';
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed';
export type StepType = 'trigger' | 'action' | 'condition';
export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'time' | 'select' | 'multiselect' | 'user' | 'school' | 'contact' | 'intervention' | 'file';
export type ComparisonOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty' | 'in' | 'not_in';
export type LogicalOperator = 'and' | 'or';

export interface FieldDefinition {
  type: FieldType;
  label: string;
  required?: boolean;
  description?: string;
  defaultValue?: any;
  options?: { label: string; value: any }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customValidation?: string;
  };
}

export interface Condition {
  field: string;
  operator: ComparisonOperator;
  value: any;
}

export interface ConditionGroup {
  operator: LogicalOperator;
  conditions: (Condition | ConditionGroup)[];
}

export interface WorkflowVariable {
  name: string;
  type: FieldType;
  value: any;
  scope: 'workflow' | 'step';
}

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  status: WorkflowStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  variables: WorkflowVariable[];
  error_handling: {
    retry: {
      enabled: boolean;
      max_attempts: number;
      delay: number;
    };
    fallback_action?: string;
    notification?: {
      enabled: boolean;
      recipients: string[];
    };
  };
}

export interface WorkflowTrigger {
  id: string;
  name: string;
  description: string | null;
  event_type: string;
  config: {
    schema: {
      type: string;
      properties: Record<string, FieldDefinition>;
      required?: string[];
    };
    fields?: Record<string, FieldDefinition>;
    conditions?: ConditionGroup;
    scheduling?: {
      type: 'interval' | 'cron' | 'one-time';
      value: string;
      timezone?: string;
    };
  };
  created_at: string;
}

export interface WorkflowAction {
  id: string;
  name: string;
  description: string | null;
  action_type: string;
  config: {
    schema: {
      type: string;
      required: string[];
      properties: Record<string, FieldDefinition>;
    };
    fields?: Record<string, FieldDefinition>;
    transformations?: {
      input?: Record<string, string>;
      output?: Record<string, string>;
    };
    retry_config?: {
      max_attempts: number;
      delay: number;
    };
  };
  created_at: string;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  step_type: StepType;
  name?: string;
  description?: string;
  config: {
    triggerId?: string;
    actionId?: string;
    conditions?: ConditionGroup;
    variables?: WorkflowVariable[];
    config?: Record<string, any>;
    error_handling?: {
      retry: {
        enabled: boolean;
        max_attempts: number;
        delay: number;
      };
      fallback_step?: string;
      continue_on_failure?: boolean;
    };
    timeout?: number;
    parallel_execution?: boolean;
  };
  next_step_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: ExecutionStatus;
  started_at: string;
  completed_at: string | null;
  result: Record<string, any> | null;
  error: string | null;
  created_by: string;
  step_results: {
    step_id: string;
    status: ExecutionStatus;
    started_at: string;
    completed_at?: string;
    result?: any;
    error?: string;
  }[];
  variables: Record<string, any>;
}

export interface DynamicField {
  id: string;
  name: string;
  type: FieldType;
  entity_type: 'school' | 'contact' | 'intervention';
  config: {
    label: string;
    description?: string;
    required?: boolean;
    default_value?: any;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      options?: { label: string; value: any }[];
    };
  };
  created_at: string;
  updated_at: string;
}
