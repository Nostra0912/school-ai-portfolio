-- Temporarily disable RLS to allow initial data loading
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
WHERE code = 'A360'
ON CONFLICT (school_id, grade) DO NOTHING;

INSERT INTO school_grades (school_id, grade)
SELECT id, grade
FROM schools, unnest(ARRAY['9', '10', '11', '12']) AS grade
WHERE code = 'DSST-COLE'
ON CONFLICT (school_id, grade) DO NOTHING;

-- Insert sample tags
INSERT INTO school_tags (school_id, tag)
SELECT id, tag
FROM schools, unnest(ARRAY['public', 'charter', 'elementary']) AS tag
WHERE code = 'A360'
ON CONFLICT (school_id, tag) DO NOTHING;

INSERT INTO school_tags (school_id, tag)
SELECT id, tag
FROM schools, unnest(ARRAY['public', 'charter', 'high school']) AS tag
WHERE code = 'DSST-COLE'
ON CONFLICT (school_id, tag) DO NOTHING;

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
WHERE code IN ('A360', 'DSST-COLE')
ON CONFLICT (school_id) DO NOTHING;

-- Insert sample meal options
INSERT INTO school_meal_options (school_id, meal_option)
SELECT id, meal_option
FROM schools, unnest(ARRAY['Breakfast', 'Lunch', 'Snack']) AS meal_option
WHERE code IN ('A360', 'DSST-COLE')
ON CONFLICT (school_id, meal_option) DO NOTHING;

-- Create a super admin portfolio to access all schools
INSERT INTO school_portfolios (school_id, organization_id, enabled)
SELECT 
  schools.id,
  auth.uid(),
  true
FROM schools
ON CONFLICT DO NOTHING;

-- Re-enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_operation_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_meal_options ENABLE ROW LEVEL SECURITY;

-- Create a more permissive policy for schools during development
DROP POLICY IF EXISTS "Users can view schools they have access to" ON schools;
CREATE POLICY "Allow public read access to schools"
  ON schools FOR SELECT
  TO authenticated
  USING (true);
