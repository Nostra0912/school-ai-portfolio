-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to schools" ON schools;
DROP POLICY IF EXISTS "Allow public read access to school_grades" ON school_grades;
DROP POLICY IF EXISTS "Allow public read access to school_tags" ON school_tags;
DROP POLICY IF EXISTS "Allow public read access to school_operation_details" ON school_operation_details;
DROP POLICY IF EXISTS "Allow public read access to school_meal_options" ON school_meal_options;

-- Create more permissive policies for development
CREATE POLICY "Enable read access for all users"
  ON schools FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for all users"
  ON school_grades FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for all users"
  ON school_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for all users"
  ON school_operation_details FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable read access for all users"
  ON school_meal_options FOR SELECT
  TO authenticated
  USING (true);

-- Insert additional sample data
INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
VALUES
  ('Denver Green School Southeast', 'DGS', '6700 E Virginia Ave, Denver, CO 80224', 'Opened', 'Denver Public Schools', '720-424-7480', 525, 'http://www.denvergreenschool.org'),
  ('DSST: Byers High School', 'DSST-BYERS', '150 S Pearl St, Denver, CO 80209', 'Opened', 'Denver Public Schools', '303-524-6350', 525, 'http://www.dsstpublicschools.org'),
  ('GALS Denver', 'GALS', '750 Galapago St, Denver, CO 80204', 'Opened', 'Denver Public Schools', '303-282-6437', 400, 'http://www.galsdenver.org')
ON CONFLICT (code) DO NOTHING;

-- Insert grades for new schools
INSERT INTO school_grades (school_id, grade)
SELECT id, grade
FROM schools, unnest(ARRAY['K', '1', '2', '3', '4', '5', '6', '7', '8']) AS grade
WHERE code = 'DGS'
ON CONFLICT (school_id, grade) DO NOTHING;

INSERT INTO school_grades (school_id, grade)
SELECT id, grade
FROM schools, unnest(ARRAY['9', '10', '11', '12']) AS grade
WHERE code = 'DSST-BYERS'
ON CONFLICT (school_id, grade) DO NOTHING;

INSERT INTO school_grades (school_id, grade)
SELECT id, grade
FROM schools, unnest(ARRAY['6', '7', '8', '9', '10', '11', '12']) AS grade
WHERE code = 'GALS'
ON CONFLICT (school_id, grade) DO NOTHING;

-- Insert tags for new schools
INSERT INTO school_tags (school_id, tag)
SELECT id, tag
FROM schools, unnest(ARRAY['public', 'innovation', 'k-8']) AS tag
WHERE code = 'DGS'
ON CONFLICT (school_id, tag) DO NOTHING;

INSERT INTO school_tags (school_id, tag)
SELECT id, tag
FROM schools, unnest(ARRAY['public', 'charter', 'high school', 'stem']) AS tag
WHERE code = 'DSST-BYERS'
ON CONFLICT (school_id, tag) DO NOTHING;

INSERT INTO school_tags (school_id, tag)
SELECT id, tag
FROM schools, unnest(ARRAY['public', 'charter', 'all-girls', 'middle school', 'high school']) AS tag
WHERE code = 'GALS'
ON CONFLICT (school_id, tag) DO NOTHING;

-- Insert operation details for new schools
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
  CASE 
    WHEN code = 'DGS' THEN 600
    WHEN code = 'DSST-BYERS' THEN 550
    WHEN code = 'GALS' THEN 450
  END,
  CASE 
    WHEN code = 'DGS' THEN 28
    WHEN code = 'DSST-BYERS' THEN 25
    WHEN code = 'GALS' THEN 22
  END,
  CASE 
    WHEN code = 'DGS' THEN '1:28'
    WHEN code = 'DSST-BYERS' THEN '1:25'
    WHEN code = 'GALS' THEN '1:22'
  END,
  true,
  true,
  false
FROM schools
WHERE code IN ('DGS', 'DSST-BYERS', 'GALS')
ON CONFLICT (school_id) DO NOTHING;

-- Insert meal options for new schools
INSERT INTO school_meal_options (school_id, meal_option)
SELECT id, meal_option
FROM schools, unnest(ARRAY['Breakfast', 'Lunch', 'Snack', 'Special Dietary Options']) AS meal_option
WHERE code IN ('DGS', 'DSST-BYERS', 'GALS')
ON CONFLICT (school_id, meal_option) DO NOTHING;
