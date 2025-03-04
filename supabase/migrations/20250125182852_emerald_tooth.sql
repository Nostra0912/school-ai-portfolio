/*
  # School Portfolio Management - Schools Schema

  1. New Tables
    - `schools`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `code` (text, unique)
      - `address` (text)
      - `status` (text)
      - `parent_organization` (text)
      - `phone` (text)
      - `current_enrollment` (integer)
      - `website` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `school_grades`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key)
      - `grade` (text)

    - `school_tags`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key)
      - `tag` (text)

    - `school_operation_details`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key)
      - `student_capacity` (integer)
      - `class_size` (integer)
      - `teacher_to_student_ratio` (text)
      - `transportation_provided` (boolean)
      - `lunch_provided` (boolean)
      - `financial_aid_available` (boolean)

    - `school_meal_options`
      - `id` (uuid, primary key)
      - `school_id` (uuid, foreign key)
      - `meal_option` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create schools table
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  address text NOT NULL,
  status text NOT NULL CHECK (status IN ('Opened', 'Closed', 'Under Review')),
  parent_organization text,
  phone text,
  current_enrollment integer DEFAULT 0,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create school_grades table
CREATE TABLE school_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  grade text NOT NULL,
  UNIQUE(school_id, grade)
);

-- Create school_tags table
CREATE TABLE school_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  tag text NOT NULL,
  UNIQUE(school_id, tag)
);

-- Create school_operation_details table
CREATE TABLE school_operation_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE UNIQUE,
  student_capacity integer NOT NULL DEFAULT 0,
  class_size integer NOT NULL DEFAULT 0,
  teacher_to_student_ratio text,
  transportation_provided boolean DEFAULT false,
  lunch_provided boolean DEFAULT false,
  financial_aid_available boolean DEFAULT false
);

-- Create school_meal_options table
CREATE TABLE school_meal_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  meal_option text NOT NULL,
  UNIQUE(school_id, meal_option)
);

-- Enable Row Level Security
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_operation_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_meal_options ENABLE ROW LEVEL SECURITY;

-- Create policies for schools
CREATE POLICY "Anyone can read schools"
  ON schools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read school grades"
  ON school_grades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read school tags"
  ON school_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read school operation details"
  ON school_operation_details FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read school meal options"
  ON school_meal_options FOR SELECT
  TO authenticated
  USING (true);

-- Create updated_at trigger for schools
CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website) VALUES
  ('Academy 360', '0181', '12000 E. 47TH AVE, Denver, Jefferson, CO, 80239', 'Opened', 'Denver Public Schools', '+1(303) 574-1360', 226, 'http://www.academy-360.org');

-- Insert sample grades
INSERT INTO school_grades (school_id, grade)
SELECT 
  (SELECT id FROM schools WHERE code = '0181'),
  grade
FROM unnest(ARRAY['T', 'PK', 'K1', '1', '2', '3', '4', '5']) AS grade;

-- Insert sample tags
INSERT INTO school_tags (school_id, tag)
SELECT 
  (SELECT id FROM schools WHERE code = '0181'),
  tag
FROM unnest(ARRAY['public', 'charter', 'elementary']) AS tag;

-- Insert sample operation details
INSERT INTO school_operation_details (
  school_id,
  student_capacity,
  class_size,
  teacher_to_student_ratio,
  transportation_provided,
  lunch_provided,
  financial_aid_available
) VALUES (
  (SELECT id FROM schools WHERE code = '0181'),
  500,
  30,
  '1:20',
  true,
  true,
  false
);

-- Insert sample meal options
INSERT INTO school_meal_options (school_id, meal_option)
SELECT 
  (SELECT id FROM schools WHERE code = '0181'),
  meal_option
FROM unnest(ARRAY['Breakfast', 'Lunch']) AS meal_option;
