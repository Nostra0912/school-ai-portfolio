-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Enable full access to schools" ON schools;
DROP POLICY IF EXISTS "Allow public read access to schools" ON schools;

-- Create new permissive policy
CREATE POLICY "Enable full public access to schools"
  ON schools FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Insert additional schools
INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
VALUES
  ('GALS Denver', 'GALS', '750 Galapago St, Denver, CO 80204', 'Opened', 'Denver Public Schools', '303-282-6437', 400, 'http://www.galsdenver.org'),
  ('Highline Academy Northeast', 'HAN', '19451 E. Maxwell Pl., Denver, CO 80249', 'Opened', 'Denver Public Schools', '303-802-4120', 450, 'http://www.highlineacademy.org'),
  ('Highline Academy Southeast', 'HAS', '2170 S. Dahlia St., Denver, CO 80222', 'Opened', 'Denver Public Schools', '303-759-7808', 525, 'http://www.highlineacademy.org'),
  ('KIPP Denver Collegiate High School', 'KDCH', '2960 Speer Boulevard, Denver, CO 80211', 'Opened', 'Denver Public Schools', '303-922-5324', 450, 'http://www.kippcolorado.org'),
  ('KIPP Northeast Denver Leadership Academy', 'KNDLA', '18250 E. 51st Avenue, Denver, CO 80249', 'Opened', 'Denver Public Schools', '303-307-1970', 400, 'http://www.kippcolorado.org'),
  ('KIPP Northeast Denver Middle School', 'KNDMS', '4635 Walden Street, Denver, CO 80249', 'Opened', 'Denver Public Schools', '303-307-1970', 350, 'http://www.kippcolorado.org'),
  ('KIPP Northeast Elementary', 'KNE', '4635 Walden Street, Denver, CO 80249', 'Opened', 'Denver Public Schools', '303-307-1970', 300, 'http://www.kippcolorado.org'),
  ('KIPP Sunshine Peak Academy', 'KSPA', '375 S. Tejon Street, Denver, CO 80223', 'Opened', 'Denver Public Schools', '303-623-5772', 425, 'http://www.kippcolorado.org'),
  ('Monarch Montessori', 'MM', '4895 Peoria Street, Denver, CO 80239', 'Opened', 'Denver Public Schools', '303-712-2001', 225, 'http://www.monarchm.com'),
  ('Odyssey School of Denver', 'OSD', '6550 E 21st Ave, Denver, CO 80207', 'Opened', 'Denver Public Schools', '303-316-3944', 234, 'http://www.odysseydenver.org'),
  ('Omar D Blair Charter School', 'ODB', '4905 Cathay Street, Denver, CO 80249', 'Opened', 'Denver Public Schools', '303-371-9570', 750, 'http://www.omardblaircharterschool.com'),
  ('RiseUp Community School', 'RUCS', '1801 Federal Blvd, Denver, CO 80204', 'Opened', 'Denver Public Schools', '303-477-0517', 125, 'http://www.riseupcommunityschool.net'),
  ('Rocky Mountain Prep Berkeley', 'RMP-B', '3752 Tennyson Street, Denver, CO 80212', 'Opened', 'Denver Public Schools', '720-464-3550', 425, 'http://www.rockymountainprep.org'),
  ('Rocky Mountain Prep Creekside', 'RMP-C', '7808 Cherry Creek South Drive #3-300, Denver, CO 80231', 'Opened', 'Denver Public Schools', '720-863-8920', 450, 'http://www.rockymountainprep.org'),
  ('Rocky Mountain Prep Southwest', 'RMP-SW', '911 S. Hazel Court, Denver, CO 80219', 'Opened', 'Denver Public Schools', '720-863-8920', 475, 'http://www.rockymountainprep.org'),
  ('SOAR Academy', 'SOAR', '4800 Telluride Street, Building 4, Denver, CO 80249', 'Opened', 'Denver Public Schools', '720-287-5100', 450, 'http://www.soardenver.org'),
  ('STRIVE Prep - RISE', 'SP-RISE', '18250 E. 51st Ave, Denver, CO 80249', 'Opened', 'Denver Public Schools', '720-485-6393', 450, 'http://www.striveprep.org'),
  ('STRIVE Prep - Ruby Hill', 'SP-RH', '2626 W. Evans Ave, Denver, CO 80219', 'Opened', 'Denver Public Schools', '720-460-2800', 450, 'http://www.striveprep.org'),
  ('STRIVE Prep - Smart Academy', 'SP-SMART', '3201 W. Arizona Ave, Denver, CO 80219', 'Opened', 'Denver Public Schools', '303-962-9880', 450, 'http://www.striveprep.org'),
  ('STRIVE Prep - Sunnyside', 'SP-SUN', '4735 Pecos St, Denver, CO 80211', 'Opened', 'Denver Public Schools', '303-561-9790', 450, 'http://www.striveprep.org'),
  ('STRIVE Prep - Westwood', 'SP-WW', '3201 W. Arizona Ave, Denver, CO 80219', 'Opened', 'Denver Public Schools', '303-962-9880', 450, 'http://www.striveprep.org'),
  ('University Prep - Arapahoe St.', 'UP-A', '2409 Arapahoe Street, Denver, CO 80205', 'Opened', 'Denver Public Schools', '303-292-0463', 300, 'http://www.uprepschool.org'),
  ('University Prep - Steele St.', 'UP-S', '3230 East 38th Avenue, Denver, CO 80205', 'Opened', 'Denver Public Schools', '303-329-8412', 300, 'http://www.uprepschool.org'),
  ('Wyatt Academy', 'WA', '3620 Franklin Street, Denver, CO 80205', 'Opened', 'Denver Public Schools', '303-292-5515', 325, 'http://www.wyattacademy.org')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  status = EXCLUDED.status,
  parent_organization = EXCLUDED.parent_organization,
  phone = EXCLUDED.phone,
  current_enrollment = EXCLUDED.current_enrollment,
  website = EXCLUDED.website;

-- Insert grades for new schools
INSERT INTO school_grades (school_id, grade)
SELECT s.id, g.grade
FROM schools s
CROSS JOIN (
  SELECT unnest(ARRAY['K', '1', '2', '3', '4', '5']) as grade
  WHERE EXISTS (SELECT 1 FROM schools WHERE name LIKE '%Elementary%')
  UNION
  SELECT unnest(ARRAY['6', '7', '8']) as grade
  WHERE EXISTS (SELECT 1 FROM schools WHERE name LIKE '%Middle%')
  UNION
  SELECT unnest(ARRAY['9', '10', '11', '12']) as grade
  WHERE EXISTS (SELECT 1 FROM schools WHERE name LIKE '%High%')
) g
WHERE s.name LIKE '%KIPP%' OR s.name LIKE '%STRIVE%' OR s.name LIKE '%Prep%'
ON CONFLICT (school_id, grade) DO NOTHING;

-- Insert tags for new schools
INSERT INTO school_tags (school_id, tag)
SELECT s.id, t.tag
FROM schools s
CROSS JOIN (
  SELECT unnest(ARRAY['public', 'charter']) as tag
) t
WHERE s.name LIKE '%KIPP%' OR s.name LIKE '%STRIVE%' OR s.name LIKE '%Prep%'
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
  s.id,
  CASE 
    WHEN s.name LIKE '%Elementary%' THEN 400
    WHEN s.name LIKE '%Middle%' THEN 450
    WHEN s.name LIKE '%High%' THEN 500
    ELSE 450
  END as student_capacity,
  25,
  '1:25',
  true,
  true,
  false
FROM schools s
WHERE s.name LIKE '%KIPP%' OR s.name LIKE '%STRIVE%' OR s.name LIKE '%Prep%'
ON CONFLICT (school_id) DO UPDATE SET
  student_capacity = EXCLUDED.student_capacity,
  class_size = EXCLUDED.class_size,
  teacher_to_student_ratio = EXCLUDED.teacher_to_student_ratio;

-- Insert meal options for new schools
INSERT INTO school_meal_options (school_id, meal_option)
SELECT s.id, m.meal_option
FROM schools s
CROSS JOIN (
  SELECT unnest(ARRAY['Breakfast', 'Lunch', 'Snack']) as meal_option
) m
WHERE s.name LIKE '%KIPP%' OR s.name LIKE '%STRIVE%' OR s.name LIKE '%Prep%'
ON CONFLICT (school_id, meal_option) DO NOTHING;

-- Refresh indexes
REINDEX TABLE schools;
REINDEX TABLE school_grades;
REINDEX TABLE school_tags;
REINDEX TABLE school_operation_details;
REINDEX TABLE school_meal_options;
