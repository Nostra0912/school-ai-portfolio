/*
  # School Portfolio Management Schema

  1. New Tables
    - `intervention_levels`
      - `id` (uuid, primary key)
      - `name` (text, unique) - The level name
      - `order` (integer) - For sorting levels in correct order
      - `created_at` (timestamp)

    - `interventions`
      - `id` (uuid, primary key)
      - `school_name` (text) - Name of the school
      - `risk_score` (integer) - Risk assessment score
      - `level_id` (uuid, foreign key) - Reference to intervention_levels
      - `contacts_count` (integer) - Number of associated contacts
      - `documents_count` (integer) - Number of associated documents
      - `alerts_count` (integer) - Number of active alerts
      - `info_count` (integer) - Number of info items
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `created_by` (uuid, foreign key) - Reference to auth.users
      - `active` (boolean)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read all intervention levels
      - Read all interventions
      - Create interventions
      - Update their own interventions
      - Delete their own interventions

  3. Initial Data
    - Insert default intervention levels
*/

-- Create intervention_levels table
CREATE TABLE intervention_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create interventions table
CREATE TABLE interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_name text NOT NULL,
  risk_score integer NOT NULL DEFAULT 0,
  level_id uuid NOT NULL REFERENCES intervention_levels(id),
  contacts_count integer NOT NULL DEFAULT 0,
  documents_count integer NOT NULL DEFAULT 0,
  alerts_count integer NOT NULL DEFAULT 0,
  info_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  active boolean DEFAULT true,

  CONSTRAINT risk_score_positive CHECK (risk_score >= 0),
  CONSTRAINT contacts_count_positive CHECK (contacts_count >= 0),
  CONSTRAINT documents_count_positive CHECK (documents_count >= 0),
  CONSTRAINT alerts_count_positive CHECK (alerts_count >= 0),
  CONSTRAINT info_count_positive CHECK (info_count >= 0)
);

-- Enable Row Level Security
ALTER TABLE intervention_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

-- Policies for intervention_levels
CREATE POLICY "Anyone can read intervention levels"
  ON intervention_levels
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for interventions
CREATE POLICY "Anyone can read interventions"
  ON interventions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create interventions"
  ON interventions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own interventions"
  ON interventions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own interventions"
  ON interventions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Insert default intervention levels
INSERT INTO intervention_levels (name, "order") VALUES
  ('Informal Contact', 1),
  ('Initial Contact', 2),
  ('Improvement Plan', 3),
  ('Notice of Concern', 4),
  ('Revocation of Contract / Non-Renewal', 5);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_interventions_updated_at
  BEFORE UPDATE ON interventions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
