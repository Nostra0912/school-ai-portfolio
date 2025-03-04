-- Create staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert staff members
INSERT INTO staff (first_name, last_name, email)
VALUES 
  ('Dan', 'Sullivan', 'daniel.sullivan@5280highschool.org'),
  ('Jeremy', 'Jensen', 'jeremy.jensen@5280highschool.org'),
  ('Becky', 'McLean', 'rebecca@academy-360.org'),
  ('Frank', 'Lee', 'Frank_Lee@dpsk12.net'),
  ('David', 'Brown', 'dbrown@chscharter.org'),
  ('Liz', 'Feldhusen', 'lfeldhusen@chscharter.org'),
  ('Brandon', 'Jones', 'bjones@compassacademy.org'),
  ('Stephen', 'Parce', 'Stephen.parce@denverjustice.org'),
  ('Richard', 'Royal', 'richard@denverlanguageschool.org'),
  ('Brent', 'Westrop', 'brent.westrop@ddeschool.org')
ON CONFLICT (email) DO NOTHING;

-- Insert school staff assignments for Executive Director role
WITH new_assignments AS (
  SELECT 
    s.id as school_id,
    st.id as staff_id,
    r.id as role_id,
    d.id as department_id
  FROM schools s
  JOIN staff st ON (
    CASE 
      WHEN s.name = '5280 High School' AND st.email = 'daniel.sullivan@5280highschool.org' THEN true
      WHEN s.name = 'Academy 360' AND st.email = 'rebecca@academy-360.org' THEN true
      WHEN s.name = 'AUL Denver' AND st.email = 'Frank_Lee@dpsk12.net' THEN true
      WHEN s.name = 'Colorado High School Charter GES' AND st.email = 'dbrown@chscharter.org' THEN true
      WHEN s.name = 'Colorado High School Charter Osage' AND st.email = 'lfeldhusen@chscharter.org' THEN true
      WHEN s.name = 'Compass Academy' AND st.email = 'bjones@compassacademy.org' THEN true
      WHEN s.name = 'Denver Justice High School' AND st.email = 'Stephen.parce@denverjustice.org' THEN true
      WHEN s.name LIKE 'Denver Language School%' AND st.email = 'richard@denverlanguageschool.org' THEN true
      WHEN s.name = 'Downtown Denver Expeditionary School' AND st.email = 'brent.westrop@ddeschool.org' THEN true
      ELSE false
    END
  )
  JOIN roles r ON r.name = 'Executive Director'
  JOIN departments d ON d.name = 'School Management'
)
INSERT INTO school_staff (school_id, staff_id, role_id, department_id)
SELECT school_id, staff_id, role_id, department_id
FROM new_assignments
WHERE NOT EXISTS (
  SELECT 1 FROM school_staff ss 
  WHERE ss.school_id = new_assignments.school_id 
  AND ss.staff_id = new_assignments.staff_id 
  AND ss.role_id = new_assignments.role_id
);

-- Insert additional roles for staff members who have multiple roles
WITH new_assignments AS (
  SELECT 
    s.id as school_id,
    st.id as staff_id,
    r.id as role_id,
    d.id as department_id
  FROM schools s
  JOIN staff st ON (
    CASE 
      WHEN s.name = '5280 High School' AND st.email = 'daniel.sullivan@5280highschool.org' THEN true
      WHEN s.name = 'Academy 360' AND st.email = 'rebecca@academy-360.org' THEN true
      ELSE false
    END
  )
  JOIN roles r ON r.name = 'School Leader/Principal'
  JOIN departments d ON d.name = 'School Management'
)
INSERT INTO school_staff (school_id, staff_id, role_id, department_id)
SELECT school_id, staff_id, role_id, department_id
FROM new_assignments
WHERE NOT EXISTS (
  SELECT 1 FROM school_staff ss 
  WHERE ss.school_id = new_assignments.school_id 
  AND ss.staff_id = new_assignments.staff_id 
  AND ss.role_id = new_assignments.role_id
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_school_staff_school_id ON school_staff(school_id);
CREATE INDEX IF NOT EXISTS idx_school_staff_staff_id ON school_staff(staff_id);
CREATE INDEX IF NOT EXISTS idx_school_staff_role_id ON school_staff(role_id);
CREATE INDEX IF NOT EXISTS idx_school_staff_department_id ON school_staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
