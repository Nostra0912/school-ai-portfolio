/*
  # Sample Data Import with Conflict Handling

  1. Data Import
    - Import sample data for schools and contacts
    - Handle existing records to avoid conflicts
    - Maintain relationships and data integrity

  2. Tables Affected
    - schools
    - school_grades
    - school_tags
    - school_operation_details
    - school_meal_options
    - contacts
*/

-- Insert sample schools with conflict handling
INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
VALUES
  ('DSST: Cole Middle School', '0182', '3240 Humboldt St, Denver, CO 80205', 'Opened', 'Denver Public Schools', '(303) 524-6350', 450, 'http://www.dsstpublicschools.org'),
  ('DSST: College View High School', '0183', '3111 W Dartmouth Ave, Denver, CO 80236', 'Opened', 'Denver Public Schools', '(303) 524-6320', 550, 'http://www.dsstpublicschools.org'),
  ('Denver Justice High School', '0184', '300 E. 9th Ave, Denver, CO 80203', 'Opened', 'Denver Public Schools', '(720)424-0095', 125, 'http://www.denverjustice.org'),
  ('Girls Athletic Leadership School High School', '0185', '750 Galapago St, Denver, CO 80204', 'Opened', 'Denver Public Schools', '(303) 282-6437', 175, 'http://www.galsdenver.org'),
  ('Compass Academy', '0186', '2550 W Evans Ave, Denver, CO 80219', 'Opened', 'Denver Public Schools', '(720) 424-2900', 380, 'http://www.compassacademy.org')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  status = EXCLUDED.status,
  parent_organization = EXCLUDED.parent_organization,
  phone = EXCLUDED.phone,
  current_enrollment = EXCLUDED.current_enrollment,
  website = EXCLUDED.website;

-- Insert sample grades with conflict handling
INSERT INTO school_grades (school_id, grade)
SELECT id, grade
FROM schools, unnest(ARRAY['6', '7', '8']) AS grade
WHERE code = '0182'
ON CONFLICT (school_id, grade) DO NOTHING;

INSERT INTO school_grades (school_id, grade)
SELECT id, grade
FROM schools, unnest(ARRAY['9', '10', '11', '12']) AS grade
WHERE code = '0183'
ON CONFLICT (school_id, grade) DO NOTHING;

-- Insert sample tags with conflict handling
INSERT INTO school_tags (school_id, tag)
SELECT id, tag
FROM schools, unnest(ARRAY['public', 'charter', 'middle']) AS tag
WHERE code = '0182'
ON CONFLICT (school_id, tag) DO NOTHING;

INSERT INTO school_tags (school_id, tag)
SELECT id, tag
FROM schools, unnest(ARRAY['public', 'charter', 'high']) AS tag
WHERE code = '0183'
ON CONFLICT (school_id, tag) DO NOTHING;

-- Insert sample operation details with conflict handling
INSERT INTO school_operation_details (
  school_id, student_capacity, class_size, teacher_to_student_ratio,
  transportation_provided, lunch_provided, financial_aid_available
)
SELECT id, 500, 25, '1:25', true, true, false
FROM schools
WHERE code IN ('0182', '0183', '0184', '0185', '0186')
ON CONFLICT (school_id) DO UPDATE SET
  student_capacity = EXCLUDED.student_capacity,
  class_size = EXCLUDED.class_size,
  teacher_to_student_ratio = EXCLUDED.teacher_to_student_ratio,
  transportation_provided = EXCLUDED.transportation_provided,
  lunch_provided = EXCLUDED.lunch_provided,
  financial_aid_available = EXCLUDED.financial_aid_available;

-- Insert sample meal options with conflict handling
INSERT INTO school_meal_options (school_id, meal_option)
SELECT id, meal_option
FROM schools, unnest(ARRAY['Breakfast', 'Lunch']) AS meal_option
WHERE code IN ('0182', '0183', '0184', '0185', '0186')
ON CONFLICT (school_id, meal_option) DO NOTHING;

-- Insert sample contacts with conflict handling
INSERT INTO contacts (
  first_name, last_name, email, phone, role,
  school_id, is_primary
)
VALUES
  ('Lili', 'Chavez', 'liliana.chavez@scienceandtech.org', '(303) 524-6350', 'Operations Lead',
   (SELECT id FROM schools WHERE code = '0182'), true),
  ('Karina', 'Hernandez', 'karina.hernandez@scienceandtech.org', '(303) 524-6320', 'Operations Lead',
   (SELECT id FROM schools WHERE code = '0183'), true),
  ('Erik', 'Jacobson', 'Erik.Jacobson@scienceandtech.org', '(303) 524-6320', 'Operations Lead',
   (SELECT id FROM schools WHERE code = '0183'), false),
  ('Brandon', 'Jones', 'bjones@compassacademy.org', '(720) 424-2900', 'Executive Director',
   (SELECT id FROM schools WHERE code = '0186'), true),
  ('Ian', 'McIntire', 'ian.mcintire@scienceandtech.org', '(303) 524-6350', 'School Leader/Principal',
   (SELECT id FROM schools WHERE code = '0182'), true),
  ('Stephen', 'Parce', 'Stephen.parce@denverjustice.org', '(720)424-0095', 'Executive Director',
   (SELECT id FROM schools WHERE code = '0184'), true),
  ('Dolores', 'Schaack', 'dolores.schaack@galsdenver.org', '(303) 282-6437', 'Operations Lead',
   (SELECT id FROM schools WHERE code = '0185'), true)
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  school_id = EXCLUDED.school_id,
  is_primary = EXCLUDED.is_primary;
