-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON schools;
DROP POLICY IF EXISTS "Users can view schools they have access to" ON schools;

-- Create new permissive policy for development
CREATE POLICY "Allow public read access to schools"
  ON schools FOR SELECT
  TO public
  USING (true);

-- Insert schools one at a time to avoid conflicts
INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
SELECT 
  '5280 High School',
  '532',
  '1200 W. Mississippi Ave. Denver, CO 80223',
  'Opened',
  'Denver Public Schools',
  '720-919-1056',
  226,
  'http://www.5280highschool.org'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = '532');

INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
SELECT 
  'Academy 360',
  '181',
  '12000 East 47th Avenue Denver, CO 80239',
  'Opened',
  'Denver Public Schools',
  '303-574-1360',
  226,
  'http://www.academy-360.org'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = '181');

INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
SELECT 
  'AUL Denver',
  '488',
  '2417 W. 29th Ave. Denver Co 80207',
  'Opened',
  'Denver Public Schools',
  '303-282-0900',
  125,
  'http://www.auldenver.org'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = '488');

INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
SELECT 
  'Colorado High School Charter GES',
  '490',
  '3093 E. 42nd Avenue, Denver, CO 80216',
  'Opened',
  'Denver Public Schools',
  '720-524-4994',
  150,
  'http://www.chscharter.org'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = '490');

INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
SELECT 
  'Colorado High School Charter Osage',
  '479',
  '1175 Osage Street Suite 100 Denver, CO 80204',
  'Opened',
  'Denver Public Schools',
  '303-892-8475',
  175,
  'http://www.chscharter.org'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = '479');

INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
SELECT 
  'Compass Academy',
  '386',
  '2285 S Federal Blvd, Denver, CO 80219',
  'Opened',
  'Denver Public Schools',
  '720-424-0096',
  380,
  'http://www.compassacademy.org'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = '386');

INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
SELECT 
  'Denver Justice High School',
  '497',
  '300 East Ninth Avenue, Denver, CO 80203',
  'Opened',
  'Denver Public Schools',
  '303-480-5610',
  125,
  'http://www.denverjustice.org'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = '497');

INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
SELECT 
  'Denver Language School - Gilpin Campus',
  '176',
  '2949 California St.',
  'Opened',
  'Denver Public Schools',
  '303-777-0544',
  450,
  'http://www.denverlanguageschool.org'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = '176');

INSERT INTO schools (name, code, address, status, parent_organization, phone, current_enrollment, website)
SELECT 
  'Downtown Denver Expeditionary School',
  '182',
  '1860 Lincoln St',
  'Opened',
  'Denver Public Schools',
  '720-424-2350',
  400,
  'http://www.ddeschool.org'
WHERE NOT EXISTS (SELECT 1 FROM schools WHERE code = '182');

-- Update existing schools if needed
UPDATE schools 
SET 
  name = s.name,
  address = s.address,
  status = s.status,
  parent_organization = s.parent_organization,
  phone = s.phone,
  current_enrollment = s.current_enrollment,
  website = s.website
FROM (VALUES
  ('5280 High School', '532', '1200 W. Mississippi Ave. Denver, CO 80223', 'Opened', 'Denver Public Schools', '720-919-1056', 226, 'http://www.5280highschool.org'),
  ('Academy 360', '181', '12000 East 47th Avenue Denver, CO 80239', 'Opened', 'Denver Public Schools', '303-574-1360', 226, 'http://www.academy-360.org'),
  ('AUL Denver', '488', '2417 W. 29th Ave. Denver Co 80207', 'Opened', 'Denver Public Schools', '303-282-0900', 125, 'http://www.auldenver.org'),
  ('Colorado High School Charter GES', '490', '3093 E. 42nd Avenue, Denver, CO 80216', 'Opened', 'Denver Public Schools', '720-524-4994', 150, 'http://www.chscharter.org'),
  ('Colorado High School Charter Osage', '479', '1175 Osage Street Suite 100 Denver, CO 80204', 'Opened', 'Denver Public Schools', '303-892-8475', 175, 'http://www.chscharter.org'),
  ('Compass Academy', '386', '2285 S Federal Blvd, Denver, CO 80219', 'Opened', 'Denver Public Schools', '720-424-0096', 380, 'http://www.compassacademy.org'),
  ('Denver Justice High School', '497', '300 East Ninth Avenue, Denver, CO 80203', 'Opened', 'Denver Public Schools', '303-480-5610', 125, 'http://www.denverjustice.org'),
  ('Denver Language School - Gilpin Campus', '176', '2949 California St.', 'Opened', 'Denver Public Schools', '303-777-0544', 450, 'http://www.denverlanguageschool.org'),
  ('Downtown Denver Expeditionary School', '182', '1860 Lincoln St', 'Opened', 'Denver Public Schools', '720-424-2350', 400, 'http://www.ddeschool.org')
) as s(name, code, address, status, parent_organization, phone, current_enrollment, website)
WHERE schools.code = s.code;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools(name);
CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);
