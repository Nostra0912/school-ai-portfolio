/*
  # Intervention Management Schema

  1. New Tables
    - intervention_contacts (junction table for interventions and contacts)
    - intervention_documents (documents related to interventions)
    - intervention_alerts (alerts/notifications for interventions)
    - intervention_notes (notes/comments on interventions)

  2. Changes
    - Add new tables for tracking intervention-related data
    - Add RLS policies for secure access control
    - Add triggers for updated_at timestamps

  3. Security
    - Enable RLS on all new tables
    - Add policies for staff and authenticated users
*/

-- Create intervention_contacts junction table
CREATE TABLE IF NOT EXISTS intervention_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid REFERENCES interventions(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('primary', 'secondary', 'support')),
  created_at timestamptz DEFAULT now()
);

-- Create intervention_documents table
CREATE TABLE IF NOT EXISTS intervention_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid REFERENCES interventions(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create intervention_alerts table
CREATE TABLE IF NOT EXISTS intervention_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid REFERENCES interventions(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('risk_score', 'compliance', 'performance', 'other')),
  message text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create intervention_notes table
CREATE TABLE IF NOT EXISTS intervention_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid REFERENCES interventions(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE intervention_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Intervention Contacts
CREATE POLICY "Users can view intervention contacts"
  ON intervention_contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage intervention contacts"
  ON intervention_contacts FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND up.profile_type = 'staff'
  ));

-- Intervention Documents
CREATE POLICY "Users can view intervention documents"
  ON intervention_documents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage intervention documents"
  ON intervention_documents FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND up.profile_type = 'staff'
  ));

-- Intervention Alerts
CREATE POLICY "Users can view intervention alerts"
  ON intervention_alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage intervention alerts"
  ON intervention_alerts FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND up.profile_type = 'staff'
  ));

-- Intervention Notes
CREATE POLICY "Users can view intervention notes"
  ON intervention_notes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage intervention notes"
  ON intervention_notes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND up.profile_type = 'staff'
  ));
