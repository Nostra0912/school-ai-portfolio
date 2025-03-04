/*
  # Workflow Builder System Schema

  1. New Tables
    - `workflows`: Stores workflow definitions
    - `workflow_triggers`: Defines available trigger types
    - `workflow_actions`: Defines available action types
    - `workflow_steps`: Stores steps within a workflow
    - `workflow_executions`: Tracks workflow execution history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create enum for workflow status
CREATE TYPE workflow_status AS ENUM ('active', 'inactive', 'draft');

-- Create enum for execution status
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- Create workflows table
CREATE TABLE workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status workflow_status DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workflow triggers table
CREATE TABLE workflow_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  event_type text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create workflow actions table
CREATE TABLE workflow_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  action_type text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create workflow steps table
CREATE TABLE workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  step_type text NOT NULL CHECK (step_type IN ('trigger', 'action', 'condition')),
  config jsonb DEFAULT '{}'::jsonb,
  next_step_id uuid REFERENCES workflow_steps(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(workflow_id, step_number)
);

-- Create workflow executions table
CREATE TABLE workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  status execution_status DEFAULT 'pending',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  result jsonb,
  error text,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their workflows"
  ON workflows FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create workflows"
  ON workflows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their workflows"
  ON workflows FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their workflows"
  ON workflows FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Policies for workflow triggers (read-only for users)
CREATE POLICY "Anyone can read workflow triggers"
  ON workflow_triggers FOR SELECT
  TO authenticated
  USING (true);

-- Policies for workflow actions (read-only for users)
CREATE POLICY "Anyone can read workflow actions"
  ON workflow_actions FOR SELECT
  TO authenticated
  USING (true);

-- Policies for workflow steps
CREATE POLICY "Users can read workflow steps"
  ON workflow_steps FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workflows
    WHERE workflows.id = workflow_steps.workflow_id
    AND workflows.created_by = auth.uid()
  ));

CREATE POLICY "Users can create workflow steps"
  ON workflow_steps FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM workflows
    WHERE workflows.id = workflow_steps.workflow_id
    AND workflows.created_by = auth.uid()
  ));

CREATE POLICY "Users can update workflow steps"
  ON workflow_steps FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workflows
    WHERE workflows.id = workflow_steps.workflow_id
    AND workflows.created_by = auth.uid()
  ));

CREATE POLICY "Users can delete workflow steps"
  ON workflow_steps FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workflows
    WHERE workflows.id = workflow_steps.workflow_id
    AND workflows.created_by = auth.uid()
  ));

-- Policies for workflow executions
CREATE POLICY "Users can read their workflow executions"
  ON workflow_executions FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

-- Insert default triggers
INSERT INTO workflow_triggers (name, description, event_type, config) VALUES
  ('Contact Created', 'Triggered when a new contact is created', 'contact.created', '{"schema": {"type": "object", "properties": {"contact_id": {"type": "string"}}}}'::jsonb),
  ('Contact Updated', 'Triggered when a contact is updated', 'contact.updated', '{"schema": {"type": "object", "properties": {"contact_id": {"type": "string"}}}}'::jsonb),
  ('School Status Changed', 'Triggered when a school status changes', 'school.status_changed', '{"schema": {"type": "object", "properties": {"school_id": {"type": "string"}, "old_status": {"type": "string"}, "new_status": {"type": "string"}}}}'::jsonb),
  ('Intervention Level Changed', 'Triggered when an intervention level changes', 'intervention.level_changed', '{"schema": {"type": "object", "properties": {"intervention_id": {"type": "string"}, "old_level": {"type": "string"}, "new_level": {"type": "string"}}}}'::jsonb);

-- Insert default actions
INSERT INTO workflow_actions (name, description, action_type, config) VALUES
  ('Send Email', 'Send an email to specified recipients', 'email.send', '{"schema": {"type": "object", "required": ["to", "subject", "body"], "properties": {"to": {"type": "string"}, "subject": {"type": "string"}, "body": {"type": "string"}}}}'::jsonb),
  ('Create Task', 'Create a new task', 'task.create', '{"schema": {"type": "object", "required": ["title"], "properties": {"title": {"type": "string"}, "description": {"type": "string"}, "due_date": {"type": "string", "format": "date-time"}, "assignee": {"type": "string"}}}}'::jsonb),
  ('Update Contact', 'Update contact information', 'contact.update', '{"schema": {"type": "object", "required": ["contact_id"], "properties": {"contact_id": {"type": "string"}, "first_name": {"type": "string"}, "last_name": {"type": "string"}, "email": {"type": "string"}, "phone": {"type": "string"}, "role": {"type": "string"}}}}'::jsonb),
  ('Create Note', 'Create a note on a record', 'note.create', '{"schema": {"type": "object", "required": ["content"], "properties": {"content": {"type": "string"}, "record_type": {"type": "string"}, "record_id": {"type": "string"}}}}'::jsonb);
