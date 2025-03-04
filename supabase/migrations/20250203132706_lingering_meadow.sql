-- Drop any existing policies
DROP POLICY IF EXISTS "Allow public read access to schools" ON schools;
DROP POLICY IF EXISTS "Enable read access for all users" ON schools;
DROP POLICY IF EXISTS "Users can view schools they have access to" ON schools;

-- Create new permissive policies
CREATE POLICY "Enable full access to schools"
  ON schools FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert additional schools
INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
VALUES
  ('DSST: Byers Middle School', 'DSST-BYERS-MS', '150 S. Pearl St, Denver, CO 80209', 'Opened', 'Denver Public Schools', '303-524-6350', 475, 'http://www.dsstpublicschools.org'),
  ('DSST: Cole High School', 'DSST-COLE-HS', '3240 Humboldt St, Denver, CO 80205', 'Opened', 'Denver Public Schools', '303-524-6354', 450, 'http://www.dsstpublicschools.org'),
  ('DSST: College View High School', 'DSST-CV-HS', '3111 W Dartmouth Ave, Denver, CO 80236', 'Opened', 'Denver Public Schools', '303-524-6320', 550, 'http://www.dsstpublicschools.org'),
  ('DSST: College View Middle School', 'DSST-CV-MS', '3111 W Dartmouth Ave, Denver, CO 80236', 'Opened', 'Denver Public Schools', '303-524-6320', 450, 'http://www.dsstpublicschools.org'),
  ('DSST: Conservatory Green High School', 'DSST-CG-HS', '5590 Central Park Boulevard, Denver, CO 80238', 'Opened', 'Denver Public Schools', '303-524-6300', 525, 'http://www.dsstpublicschools.org'),
  ('DSST: Conservatory Green Middle School', 'DSST-CG-MS', '8499 E Stoll Pl, Denver, CO 80238', 'Opened', 'Denver Public Schools', '303-524-6300', 450, 'http://www.dsstpublicschools.org'),
  ('DSST: Green Valley Ranch High School', 'DSST-GVR-HS', '4800 Telluride St, Denver, CO 80249', 'Opened', 'Denver Public Schools', '303-524-6300', 525, 'http://www.dsstpublicschools.org'),
  ('DSST: Green Valley Ranch Middle School', 'DSST-GVR-MS', '4800 Telluride St, Denver, CO 80249', 'Opened', 'Denver Public Schools', '303-524-6300', 450, 'http://www.dsstpublicschools.org'),
  ('DSST: Henry Middle School', 'DSST-HENRY', '3005 S Golden Way, Denver, CO 80227', 'Opened', 'Denver Public Schools', '303-524-6300', 150, 'http://www.dsstpublicschools.org'),
  ('DSST: Montview High School', 'DSST-MV-HS', '2000 Valentia St, Denver, CO 80238', 'Opened', 'Denver Public Schools', '303-320-5570', 525, 'http://www.dsstpublicschools.org'),
  ('DSST: Montview Middle School', 'DSST-MV-MS', '2000 Valentia St, Denver, CO 80238', 'Opened', 'Denver Public Schools', '303-320-5570', 450, 'http://www.dsstpublicschools.org'),
  ('DSST: Noel High School', 'DSST-NOEL-HS', '5290 Kittredge Street, Denver, CO 80239', 'Opened', 'Denver Public Schools', '303-524-6300', 400, 'http://www.dsstpublicschools.org'),
  ('DSST: Noel Middle School', 'DSST-NOEL-MS', '5290 Kittredge Street, Denver, CO 80239', 'Opened', 'Denver Public Schools', '303-524-6300', 450, 'http://www.dsstpublicschools.org')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  status = EXCLUDED.status,
  parent_organization = EXCLUDED.parent_organization,
  phone = EXCLUDED.phone,
  current_enrollment = EXCLUDED.current_enrollment,
  website = EXCLUDED.website;

-- Insert grades for DSST schools
INSERT INTO school_grades (school_id, grade)
SELECT s.id, g.grade
FROM schools s
CROSS JOIN (
  SELECT unnest(ARRAY['6', '7', '8']) as grade
  WHERE EXISTS (SELECT 1 FROM schools WHERE code LIKE '%MS%')
  UNION
  SELECT unnest(ARRAY['9', '10', '11', '12']) as grade
  WHERE EXISTS (SELECT 1 FROM schools WHERE code LIKE '%HS%')
) g
WHERE s.code LIKE 'DSST%'
ON CONFLICT (school_id, grade) DO NOTHING;

-- Insert tags for DSST schools
INSERT INTO school_tags (school_id, tag)
SELECT s.id, t.tag
FROM schools s
CROSS JOIN (
  SELECT unnest(ARRAY['public', 'charter', 'stem']) as tag
) t
WHERE s.code LIKE 'DSST%'
ON CONFLICT (school_id, tag) DO NOTHING;

-- Insert operation details for DSST schools
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
  s.id,
  CASE 
    WHEN s.code LIKE '%MS%' THEN 450
    WHEN s.code LIKE '%HS%' THEN 525
    ELSE 500
  END as student_capacity,
  25,
  '1:25',
  true,
  true,
  false
FROM schools s
WHERE s.code LIKE 'DSST%'
ON CONFLICT (school_id) DO UPDATE SET
  student_capacity = EXCLUDED.student_capacity,
  class_size = EXCLUDED.class_size,
  teacher_to_student_ratio = EXCLUDED.teacher_to_student_ratio;

-- Insert meal options for DSST schools
INSERT INTO school_meal_options (school_id, meal_option)
SELECT s.id, m.meal_option
FROM schools s
CROSS JOIN (
  SELECT unnest(ARRAY['Breakfast', 'Lunch', 'Snack']) as meal_option
) m
WHERE s.code LIKE 'DSST%'
ON CONFLICT (school_id, meal_option) DO NOTHING;

-- Refresh indexes
REINDEX TABLE schools;
REINDEX TABLE school_grades;
REINDEX TABLE school_tags;
REINDEX TABLE school_operation_details;
REINDEX TABLE school_meal_options;
