/*
  # Document Versioning and Notifications

  1. New Tables
    - document_versions: Stores document version history
    - document_version_changes: Tracks changes between versions
    - approval_workflows: Defines approval workflow templates
    - approval_steps: Defines steps in approval workflows
    - approval_assignments: Tracks who needs to approve documents
    - approval_history: Records approval decisions
    - notification_templates: Stores reusable notification templates
    - notification_schedules: Defines when notifications should be sent
    - notification_logs: Records sent notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Document Versioning
CREATE TABLE document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES document_submissions(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content jsonb NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(document_id, version_number)
);

CREATE TABLE document_version_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES document_versions(id) ON DELETE CASCADE,
  field_path text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  change_type text NOT NULL CHECK (change_type IN ('added', 'modified', 'removed')),
  created_at timestamptz DEFAULT now()
);

-- Approval Workflows
CREATE TABLE approval_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template_id uuid REFERENCES document_templates(id),
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE approval_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES approval_workflows(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  name text NOT NULL,
  description text,
  approver_type text NOT NULL CHECK (approver_type IN ('role', 'user', 'group')),
  approver_id text NOT NULL,
  is_required boolean DEFAULT true,
  deadline_days integer,
  created_at timestamptz DEFAULT now(),
  
  UNIQUE(workflow_id, step_number)
);

CREATE TABLE approval_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES document_submissions(id) ON DELETE CASCADE,
  step_id uuid REFERENCES approval_steps(id),
  assigned_to uuid REFERENCES auth.users(id),
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'skipped')),
  assigned_at timestamptz DEFAULT now(),
  due_date timestamptz,
  completed_at timestamptz,
  comments text
);

CREATE TABLE approval_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES approval_assignments(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('approved', 'rejected', 'reassigned', 'skipped')),
  performed_by uuid REFERENCES auth.users(id),
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  subject_template text NOT NULL,
  body_template text NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('email', 'in_app', 'sms')),
  variables jsonb DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE notification_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES calendar_events(id) ON DELETE CASCADE,
  template_id uuid REFERENCES notification_templates(id),
  schedule_type text NOT NULL CHECK (schedule_type IN ('before_event', 'after_event')),
  time_value integer NOT NULL,
  time_unit text NOT NULL CHECK (time_unit IN ('minutes', 'hours', 'days')),
  recipient_type text NOT NULL CHECK (recipient_type IN ('attendees', 'organizer', 'custom')),
  custom_recipients jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES notification_templates(id),
  schedule_id uuid REFERENCES notification_schedules(id),
  recipient uuid REFERENCES auth.users(id),
  notification_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_version_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Create updated_at triggers
CREATE TRIGGER update_approval_workflows_updated_at
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_schedules_updated_at
  BEFORE UPDATE ON notification_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS Policies
-- Document Versions
CREATE POLICY "Users can view document versions they have access to"
  ON document_versions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM document_submissions ds
    LEFT JOIN document_collaborators dc ON ds.id = dc.document_id
    WHERE ds.id = document_versions.document_id
    AND (ds.submitted_by = auth.uid() OR dc.user_id = auth.uid())
  ));

CREATE POLICY "Users can create document versions for their documents"
  ON document_versions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM document_submissions ds
    LEFT JOIN document_collaborators dc ON ds.id = dc.document_id
    WHERE ds.id = document_id
    AND (ds.submitted_by = auth.uid() OR (dc.user_id = auth.uid() AND dc.role = 'editor'))
  ));

-- Version Changes
CREATE POLICY "Users can view version changes they have access to"
  ON document_version_changes FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM document_versions dv
    JOIN document_submissions ds ON dv.document_id = ds.id
    LEFT JOIN document_collaborators dc ON ds.id = dc.document_id
    WHERE dv.id = document_version_changes.version_id
    AND (ds.submitted_by = auth.uid() OR dc.user_id = auth.uid())
  ));

-- Approval Workflows
CREATE POLICY "Users can view approval workflows"
  ON approval_workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage approval workflows"
  ON approval_workflows FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND up.profile_type = 'staff'
  ));

-- Approval Steps
CREATE POLICY "Users can view approval steps"
  ON approval_steps FOR SELECT
  TO authenticated
  USING (true);

-- Approval Assignments
CREATE POLICY "Users can view their approval assignments"
  ON approval_assignments FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid() OR EXISTS (
    SELECT 1 FROM document_submissions ds
    WHERE ds.id = document_id
    AND ds.submitted_by = auth.uid()
  ));

CREATE POLICY "Users can update their approval assignments"
  ON approval_assignments FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid());

-- Approval History
CREATE POLICY "Users can view approval history they have access to"
  ON approval_history FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM approval_assignments aa
    JOIN document_submissions ds ON aa.document_id = ds.id
    LEFT JOIN document_collaborators dc ON ds.id = dc.document_id
    WHERE aa.id = approval_history.assignment_id
    AND (ds.submitted_by = auth.uid() OR dc.user_id = auth.uid() OR aa.assigned_to = auth.uid())
  ));

-- Notification Templates
CREATE POLICY "Users can view notification templates"
  ON notification_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage notification templates"
  ON notification_templates FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND up.profile_type = 'staff'
  ));

-- Notification Schedules
CREATE POLICY "Users can view notification schedules for their events"
  ON notification_schedules FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM calendar_events ce
    WHERE ce.id = event_id
    AND ce.created_by = auth.uid()
  ));

CREATE POLICY "Users can manage notification schedules for their events"
  ON notification_schedules FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM calendar_events ce
    WHERE ce.id = event_id
    AND ce.created_by = auth.uid()
  ));

-- Notification Logs
CREATE POLICY "Users can view their notification logs"
  ON notification_logs FOR SELECT
  TO authenticated
  USING (recipient = auth.uid());

-- Insert sample notification templates
INSERT INTO notification_templates (name, description, subject_template, body_template, notification_type, variables) VALUES
  ('Event Reminder', 'Default event reminder template', 
   'Reminder: {{event_title}} starts in {{time_until}}',
   'Hello {{recipient_name}},\n\nThis is a reminder that {{event_title}} starts in {{time_until}}.\n\nDate: {{event_date}}\nTime: {{event_time}}\nLocation: {{event_location}}\n\nBest regards,\nYour Calendar Assistant',
   'email',
   '[
     {"name": "event_title", "type": "string"},
     {"name": "time_until", "type": "string"},
     {"name": "recipient_name", "type": "string"},
     {"name": "event_date", "type": "string"},
     {"name": "event_time", "type": "string"},
     {"name": "event_location", "type": "string"}
   ]'::jsonb),
   
  ('Document Approval Request', 'Default approval request template',
   'Document Approval Required: {{document_title}}',
   'Hello {{recipient_name}},\n\nYour approval is required for the document "{{document_title}}".\n\nDeadline: {{due_date}}\nSubmitted by: {{submitter_name}}\n\nPlease review and take action by clicking the link below:\n{{approval_link}}\n\nBest regards,\nDocument Management System',
   'email',
   '[
     {"name": "document_title", "type": "string"},
     {"name": "recipient_name", "type": "string"},
     {"name": "due_date", "type": "string"},
     {"name": "submitter_name", "type": "string"},
     {"name": "approval_link", "type": "string"}
   ]'::jsonb),
   
  ('Document Approved', 'Notification when document is approved',
   'Document Approved: {{document_title}}',
   'Hello {{recipient_name}},\n\nYour document "{{document_title}}" has been approved by {{approver_name}}.\n\nComments: {{comments}}\n\nBest regards,\nDocument Management System',
   'email',
   '[
     {"name": "document_title", "type": "string"},
     {"name": "recipient_name", "type": "string"},
     {"name": "approver_name", "type": "string"},
     {"name": "comments", "type": "string"}
   ]'::jsonb);
