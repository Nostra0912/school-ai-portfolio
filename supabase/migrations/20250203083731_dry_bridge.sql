/*
# Create Initial Schema

1. New Tables
  - schools
    - Basic school information
  - school_portfolios 
    - Links schools to organizations
  - interventions
    - Tracks school interventions
  - escalations
    - Manages escalation items
  - contacts
    - School contact information
  - documents
    - Document management
  - tasks
    - Compliance tasks

2. Security
  - Enable RLS on all tables
  - Create policies for data access

3. Changes
  - Initial schema creation
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS escalations CASCADE;
DROP TABLE IF EXISTS interventions CASCADE;
DROP TABLE IF EXISTS school_portfolios CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Create schools table first since other tables reference it
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  address text,
  status text CHECK (status IN ('Opened', 'Closed', 'Under Review')),
  parent_organization text,
  phone text,
  current_enrollment integer DEFAULT 0,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create school_portfolios table
CREATE TABLE school_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES auth.users(id),
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interventions table
CREATE TABLE interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  level text CHECK (level IN ('Informal Contact', 'Initial Contact', 'Improvement Plan', 'Notice of Concern', 'Revocation of Contract / Non-Renewal')),
  risk_score integer DEFAULT 0,
  status text DEFAULT 'active',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create escalations table
CREATE TABLE escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid REFERENCES interventions(id) ON DELETE CASCADE,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  category text NOT NULL,
  severity text CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  heading text NOT NULL,
  details text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contacts table
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  role text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  file_size integer,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  status text DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes first
CREATE INDEX schools_name_idx ON schools(name);
CREATE INDEX school_portfolios_school_id_idx ON school_portfolios(school_id);
CREATE INDEX school_portfolios_organization_id_idx ON school_portfolios(organization_id);
CREATE INDEX interventions_school_id_idx ON interventions(school_id);
CREATE INDEX escalations_intervention_id_idx ON escalations(intervention_id);
CREATE INDEX escalations_school_id_idx ON escalations(school_id);
CREATE INDEX contacts_school_id_idx ON contacts(school_id);
CREATE INDEX documents_school_id_idx ON documents(school_id);
CREATE INDEX tasks_school_id_idx ON tasks(school_id);

-- Enable Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies after all tables exist
CREATE POLICY "Users can view schools they have access to"
  ON schools FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = schools.id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can view their school portfolios"
  ON school_portfolios FOR SELECT
  TO authenticated
  USING (organization_id = auth.uid());

CREATE POLICY "Users can manage their school portfolios"
  ON school_portfolios FOR ALL 
  TO authenticated
  USING (organization_id = auth.uid());

CREATE POLICY "Users can view interventions for their schools"
  ON interventions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = interventions.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can manage interventions for their schools"
  ON interventions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = interventions.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can view escalations for their schools"
  ON escalations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = escalations.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can manage escalations for their schools"
  ON escalations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = escalations.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can view contacts for their schools"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = contacts.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can manage contacts for their schools"
  ON contacts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = contacts.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can view documents for their schools"
  ON documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = documents.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can manage documents for their schools"
  ON documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = documents.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can view tasks for their schools"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = tasks.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can manage tasks for their schools"
  ON tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = tasks.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );
