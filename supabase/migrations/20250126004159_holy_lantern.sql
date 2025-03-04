/*
  # Enhanced Workflow Components

  1. New Triggers
    - Add more sophisticated triggers for school and intervention events
    - Add scheduled triggers for time-based workflows
    - Add data-driven triggers for metric thresholds

  2. New Actions
    - Add notification actions for different channels
    - Add data manipulation actions
    - Add integration actions

  3. New Conditions
    - Add complex conditional logic support
    - Add data comparison conditions
    - Add time-based conditions
*/

-- Add new triggers
INSERT INTO workflow_triggers (name, description, event_type, config) VALUES
  -- School-related triggers
  ('School Enrollment Changed', 'Triggered when school enrollment changes significantly', 'school.enrollment_changed', 
   jsonb_build_object(
     'schema', jsonb_build_object(
       'type', 'object',
       'required', jsonb_build_array('school_id', 'old_enrollment', 'new_enrollment', 'threshold_percentage'),
       'properties', jsonb_build_object(
         'school_id', jsonb_build_object('type', 'string'),
         'old_enrollment', jsonb_build_object('type', 'number'),
         'new_enrollment', jsonb_build_object('type', 'number'),
         'threshold_percentage', jsonb_build_object('type', 'number')
       )
     )
   )),
  
  ('School Grade Performance Alert', 'Triggered when school performance metrics change', 'school.performance_alert',
   jsonb_build_object(
     'schema', jsonb_build_object(
       'type', 'object',
       'required', jsonb_build_array('school_id', 'metric_type', 'old_value', 'new_value'),
       'properties', jsonb_build_object(
         'school_id', jsonb_build_object('type', 'string'),
         'metric_type', jsonb_build_object(
           'type', 'string',
           'enum', jsonb_build_array('academic', 'financial', 'operational')
         ),
         'old_value', jsonb_build_object('type', 'number'),
         'new_value', jsonb_build_object('type', 'number')
       )
     )
   )),
  
  -- Time-based triggers
  ('Daily Schedule', 'Triggers workflow at specified time daily', 'schedule.daily',
   jsonb_build_object(
     'schema', jsonb_build_object(
       'type', 'object',
       'required', jsonb_build_array('time'),
       'properties', jsonb_build_object(
         'time', jsonb_build_object('type', 'string', 'format', 'time'),
         'timezone', jsonb_build_object('type', 'string')
       )
     )
   )),
  
  ('Monthly Schedule', 'Triggers workflow on specified day of month', 'schedule.monthly',
   jsonb_build_object(
     'schema', jsonb_build_object(
       'type', 'object',
       'required', jsonb_build_array('day', 'time'),
       'properties', jsonb_build_object(
         'day', jsonb_build_object('type', 'number', 'minimum', 1, 'maximum', 31),
         'time', jsonb_build_object('type', 'string', 'format', 'time'),
         'timezone', jsonb_build_object('type', 'string')
       )
     )
   )),
  
  -- Metric-based triggers
  ('Risk Score Threshold', 'Triggered when risk score exceeds threshold', 'metric.risk_score',
   jsonb_build_object(
     'schema', jsonb_build_object(
       'type', 'object',
       'required', jsonb_build_array('school_id', 'threshold', 'comparison'),
       'properties', jsonb_build_object(
         'school_id', jsonb_build_object('type', 'string'),
         'threshold', jsonb_build_object('type', 'number'),
         'comparison', jsonb_build_object(
           'type', 'string',
           'enum', jsonb_build_array('greater_than', 'less_than', 'equal_to')
         )
       )
     )
   ));

-- Add new actions
INSERT INTO workflow_actions (name, description, action_type, config) VALUES
  -- Notification actions
  ('Send SMS', 'Send SMS notification', 'notification.sms',
   jsonb_build_object(
     'schema', jsonb_build_object(
       'type', 'object',
       'required', jsonb_build_array('to', 'message'),
       'properties', jsonb_build_object(
         'to', jsonb_build_object('type', 'string'),
         'message', jsonb_build_object('type', 'string')
       )
     )
   )),
  
  ('Send Slack Message', 'Send message to Slack channel', 'notification.slack',
   jsonb_build_object(
     'schema', jsonb_build_object(
       'type', 'object',
       'required', jsonb_build_array('channel', 'message'),
       'properties', jsonb_build_object(
         'channel', jsonb_build_object('type', 'string'),
         'message', jsonb_build_object('type', 'string'),
         'attachments', jsonb_build_object('type', 'array')
       )
     )
   )),
  
  ('Update School Status', 'Update school status', 'school.update_status',
   jsonb_build_object(
     'schema', jsonb_build_object(
       'type', 'object',
       'required', jsonb_build_array('school_id', 'status'),
       'properties', jsonb_build_object(
         'school_id', jsonb_build_object('type', 'string'),
         'status', jsonb_build_object(
           'type', 'string',
           'enum', jsonb_build_array('Opened', 'Closed', 'Under Review')
         )
       )
     )
   ));

-- Create conditions table for more complex conditional logic
CREATE TABLE IF NOT EXISTS workflow_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  condition_type text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_condition_type CHECK (
    condition_type IN (
      'comparison',
      'time_based',
      'data_validation',
      'complex_logic'
    )
  )
);

-- Enable RLS on conditions
ALTER TABLE workflow_conditions ENABLE ROW LEVEL SECURITY;

-- Create public access policy for conditions
CREATE POLICY "Allow public read access"
  ON workflow_conditions FOR SELECT
  TO public
  USING (true);

-- Insert default conditions
INSERT INTO workflow_conditions (name, description, condition_type, config) VALUES
  ('Compare Numbers', 'Compare numeric values', 'comparison',
   jsonb_build_object(
     'schema', jsonb_build_object(
       'type', 'object',
       'required', jsonb_build_array('value1', 'operator', 'value2'),
       'properties', jsonb_build_object(
         'value1', jsonb_build_object('type', 'number'),
         'operator', jsonb_build_object(
           'type', 'string',
           'enum', jsonb_build_array('eq', 'ne', 'gt', 'lt', 'gte', 'lte')
         ),
         'value2', jsonb_build_object('type', 'number')
       )
     )
   )),
  
  ('Time Window', 'Check if current time is within window', 'time_based',
   jsonb_build_object(
     'schema', jsonb_build_object(
       'type', 'object',
       'required', jsonb_build_array('start_time', 'end_time', 'days_of_week'),
       'properties', jsonb_build_object(
         'start_time', jsonb_build_object('type', 'string', 'format', 'time'),
         'end_time', jsonb_build_object('type', 'string', 'format', 'time'),
         'days_of_week', jsonb_build_object(
           'type', 'array',
           'items', jsonb_build_object(
             'type', 'string',
             'enum', jsonb_build_array('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
           )
         )
       )
     )
   ));
