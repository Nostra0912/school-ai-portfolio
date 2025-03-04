-- Insert Social Workers
INSERT INTO staff (first_name, last_name, email)
VALUES
  ('Ciara', 'Skredenske', 'ciara.skredenske@5280highschool.org'),
  ('Sam', 'Adams', 'sam@academy-360.org'),
  ('DonDre', 'Harris', 'Dondre_Harris@dpsk12.net'),
  ('Nichole', 'Sapp', 'nichole_sapp@dpsk12.net'),
  ('Staci', 'LaFore', 's_longoria-alarid@dpsk12.net'),
  ('Abbe', 'Montoya', 'Abbe_montoya@dpsk12.net'),
  ('Mollie', 'Ferrito', 'firstname(at)denverlanguageschool.org'),
  ('Colette', 'Franz', 'colette.franz@ddeschool.org'),
  ('Luigi', 'Bordonaro', 'luigi.bordonaro@scienceandtech.org'),
  ('Alex', 'Wirth', 'alex.wirth@scienceandtech.org'),
  ('Chloe', 'Randall', 'chloe.randall@scienceandtech.org'),
  ('Corey', 'Engle', 'corey.engle@scienceandtech.org'),
  ('Leslie', 'Bailey', 'leslie.bailey@scienceandtech.org'),
  ('Stanley', 'Chen', 'Stanley.Chen@scienceandtech.org'),
  ('Alexis', 'Rudd', 'alexis.rudd@scienceandtech.org'),
  ('Chris', 'OConnell', 'chris.oconnell@scienceandtech.org'),
  ('Pateath', 'Herndon', 'pateath.herndon@scienceandtech.og'),
  ('Kim', 'Dosher', 'kimberly.dosher@scienceandtech.org'),
  ('Jae', 'Berry', 'jeffrey.berry@scienceandtech.org'),
  ('Sarah', 'Winter', 'sarah_winter@dpsk12.net'),
  ('Jaimie', 'Schlicher', 'jschlicher@highlineacademy.org'),
  ('Haley', 'Lewin', 'hlewin@highlineacademy.org'),
  ('Katie', 'Davis', 'kdavis@riseupcommunityschool.net'),
  ('Hannah', 'Younger', 'hyounger@rockymountainprep.org'),
  ('Amy', 'Srivastava', 'amy.srivastava@rmp.org'),
  ('Maddie', 'Gaughan', 'mgaughan@rockymountainprep.org'),
  ('Brenna', 'Swanson', 'bswanson@rockymountainprep.org'),
  ('Stephanie', 'Bell', 'sbell@rockymountainprep.org'),
  ('Lauren', 'Hunter', 'lhunter@@rockmountainprep.org'),
  ('Samantha', 'Trail', 'strail@rockymountainprep.org'),
  ('Megan', 'Beltran', 'mbeltran@soardenver.org'),
  ('Angela', 'Smith', 'angelahopesmith@gmail.com'),
  ('Amanda', 'Owens', 'amanda.owens@wyattacademy.org')
ON CONFLICT (email) DO NOTHING;

-- Insert Nurses
INSERT INTO staff (first_name, last_name, email)
VALUES
  ('TBD', 'Nurse', 'tbd.nurse@5280highschool.org'),
  ('Paula', 'Gutzmer', 'paula_gutzmer@dpsk12.net'),
  ('Tami', 'Steinfeld', 't_steinfeld@dpsk12.net'),
  ('Claire', 'Gorsich', 'cgorsich@uprepschool.org'),
  ('Tania', 'Garrett-Guy', 'tania_garrett-guy@dpsk12.net'),
  ('Caroline', 'Somers', 'csomers@highlineacademy.org'),
  ('Kelley', 'Green', 'kgreen@highlineacademy.org'),
  ('Kelly', 'Brown', 'kelly.brown@childrenscolorado.org'),
  ('Lezlie', 'Saurer', 'lezlie_sauer@dpsk12.net')
ON CONFLICT (email) DO NOTHING;

-- Insert Social Worker assignments
INSERT INTO school_staff (school_id, staff_id, role_id, department_id)
SELECT 
  s.id,
  st.id,
  r.id,
  d.id
FROM schools s
JOIN staff st ON st.email IN (
  'ciara.skredenske@5280highschool.org',
  'sam@academy-360.org',
  'Dondre_Harris@dpsk12.net',
  'nichole_sapp@dpsk12.net',
  's_longoria-alarid@dpsk12.net',
  'Abbe_montoya@dpsk12.net',
  'firstname(at)denverlanguageschool.org',
  'colette.franz@ddeschool.org',
  'luigi.bordonaro@scienceandtech.org',
  'alex.wirth@scienceandtech.org',
  'chloe.randall@scienceandtech.org',
  'corey.engle@scienceandtech.org',
  'leslie.bailey@scienceandtech.org',
  'Stanley.Chen@scienceandtech.org',
  'alexis.rudd@scienceandtech.org',
  'chris.oconnell@scienceandtech.org',
  'pateath.herndon@scienceandtech.og',
  'kimberly.dosher@scienceandtech.org',
  'jeffrey.berry@scienceandtech.org',
  'sarah_winter@dpsk12.net',
  'jschlicher@highlineacademy.org',
  'hlewin@highlineacademy.org',
  'kdavis@riseupcommunityschool.net',
  'hyounger@rockymountainprep.org',
  'amy.srivastava@rmp.org',
  'mgaughan@rockymountainprep.org',
  'bswanson@rockymountainprep.org',
  'sbell@rockymountainprep.org',
  'lhunter@@rockmountainprep.org',
  'strail@rockymountainprep.org',
  'mbeltran@soardenver.org',
  'angelahopesmith@gmail.com',
  'amanda.owens@wyattacademy.org'
)
JOIN roles r ON r.name = 'Social Worker'
JOIN departments d ON d.name = 'Social Worker';

-- Insert Nurse assignments
INSERT INTO school_staff (school_id, staff_id, role_id, department_id)
SELECT 
  s.id,
  st.id,
  r.id,
  d.id
FROM schools s
JOIN staff st ON st.email IN (
  'tbd.nurse@5280highschool.org',
  'paula_gutzmer@dpsk12.net',
  't_steinfeld@dpsk12.net',
  'cgorsich@uprepschool.org',
  'tania_garrett-guy@dpsk12.net',
  'csomers@highlineacademy.org',
  'kgreen@highlineacademy.org',
  'kelly.brown@childrenscolorado.org',
  'lezlie_sauer@dpsk12.net'
)
JOIN roles r ON r.name = 'Nurse'
JOIN departments d ON d.name = 'Student Services';

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_role ON school_staff(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_department ON school_staff(department_id);
