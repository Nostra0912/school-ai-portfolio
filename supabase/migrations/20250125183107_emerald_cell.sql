/*
  # School Contacts Schema

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `last_name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `role` (text)
      - `school_id` (uuid, foreign key)
      - `is_primary` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on contacts table
    - Add policies for authenticated users
*/

-- Create contacts table
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL,
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable Row Level Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO contacts (first_name, last_name, email, phone, role, school_id, is_primary)
VALUES
  ('John', 'Smith', 'john.smith@academy360.org', '+1(303) 555-0123', 'Principal', (SELECT id FROM schools WHERE code = '0181'), true),
  ('Sarah', 'Johnson', 'sarah.j@academy360.org', '+1(303) 555-0124', 'Assistant Principal', (SELECT id FROM schools WHERE code = '0181'), false),
  ('Michael', 'Brown', 'michael.b@academy360.org', '+1(303) 555-0125', 'Administrative Assistant', (SELECT id FROM schools WHERE code = '0181'), false);
