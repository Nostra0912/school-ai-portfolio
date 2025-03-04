-- Drop existing tables to recreate with proper relationships
DROP TABLE IF EXISTS school_meal_options CASCADE;
DROP TABLE IF EXISTS school_operation_details CASCADE;
DROP TABLE IF EXISTS school_tags CASCADE;
DROP TABLE IF EXISTS school_grades CASCADE;

-- Recreate school_grades table with proper foreign key
CREATE TABLE school_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  grade text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_school
    FOREIGN KEY(school_id) 
    REFERENCES schools(id)
    ON DELETE CASCADE,
  UNIQUE(school_id, grade)
);

-- Recreate school_tags table with proper foreign key
CREATE TABLE school_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_school
    FOREIGN KEY(school_id) 
    REFERENCES schools(id)
    ON DELETE CASCADE,
  UNIQUE(school_id, tag)
);

-- Recreate school_operation_details table with proper foreign key
CREATE TABLE school_operation_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  student_capacity integer NOT NULL DEFAULT 0,
  class_size integer NOT NULL DEFAULT 0,
  teacher_to_student_ratio text,
  transportation_provided boolean DEFAULT false,
  lunch_provided boolean DEFAULT false,
  financial_aid_available boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_school
    FOREIGN KEY(school_id) 
    REFERENCES schools(id)
    ON DELETE CASCADE,
  UNIQUE(school_id)
);

-- Recreate school_meal_options table with proper foreign key
CREATE TABLE school_meal_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL,
  meal_option text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT fk_school
    FOREIGN KEY(school_id) 
    REFERENCES schools(id)
    ON DELETE CASCADE,
  UNIQUE(school_id, meal_option)
);

-- Create indexes
CREATE INDEX idx_school_grades_school_id ON school_grades(school_id);
CREATE INDEX idx_school_tags_school_id ON school_tags(school_id);
CREATE INDEX idx_school_operation_details_school_id ON school_operation_details(school_id);
CREATE INDEX idx_school_meal_options_school_id ON school_meal_options(school_id);

-- Temporarily disable RLS for data loading
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_operation_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_meal_options DISABLE ROW LEVEL SECURITY;

-- Insert sample data
INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
VALUES
  ('Academy 360', 'A360', '12000 E 47th Ave, Denver, CO 80239', 'Opened', 'Denver Public Schools', '303-574-1360', 226, 'http://www.academy-360.org'),
  ('DSST: Cole High School', 'DSST-COLE', '3240 Humboldt St, Denver, CO 80205', 'Opened', 'Denver Public Schools', '303-524-6354', 450, 'http://www.dsstpublicschools.org')
ON CONFLICT (code) DO NOTHING;

-- Insert sample grades
INSERT INTO school_grades (school_id, grade)
SELECT id, grade
FROM schools, unnest(ARRAY['K', '1', '2', '3', '4', '5']) AS grade
WHERE code = 'A360';

INSERT INTO school_grades (school_id, grade)
SELECT id, grade
FROM schools, unnest(ARRAY['9', '10', '11', '12']) AS grade
WHERE code = 'DSST-COLE';

-- Insert sample tags
INSERT INTO school_tags (school_id, tag)
SELECT id, tag
FROM schools, unnest(ARRAY['public', 'charter', 'elementary']) AS tag
WHERE code = 'A360';

INSERT INTO school_tags (school_id, tag)
SELECT id, tag
FROM schools, unnest(ARRAY['public', 'charter', 'high school']) AS tag
WHERE code = 'DSST-COLE';

-- Insert sample operation details
INSERT INTO school_operation_details (
  school_id,
  student_capacity,
  class_size,
  teacher_to_student_ratio,
  transportation_provided,
  lunch_provided,
  financial_aid_available
)
SELECT 
  id,
  500,
  25,
  '1:25',
  true,
  true,
  false
FROM schools
WHERE code IN ('A360', 'DSST-COLE');

-- Insert sample meal options
INSERT INTO school_meal_options (school_id, meal_option)
SELECT id, meal_option
FROM schools, unnest(ARRAY['Breakfast', 'Lunch', 'Snack']) AS meal_option
WHERE code IN ('A360', 'DSST-COLE');

-- Re-enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_operation_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_meal_options ENABLE ROW LEVEL SECURITY;

-- Create public read policies for development
CREATE POLICY "Allow public read access to school_grades"
  ON school_grades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to school_tags"
  ON school_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to school_operation_details"
  ON school_operation_details FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to school_meal_options"
  ON school_meal_options FOR SELECT
  TO authenticated
  USING (true);
