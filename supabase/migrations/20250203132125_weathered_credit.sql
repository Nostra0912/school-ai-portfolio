-- Insert Discipline Building Liaisons
WITH inserted_staff AS (
  INSERT INTO staff (first_name, last_name, email)
  SELECT DISTINCT 
    split_part(person_name, ' ', 1) as first_name,
    split_part(person_name, ' ', 2) as last_name,
    person_email
  FROM (VALUES
    ('Aaron', 'Nakai', 'aaron.nakai@5280highschool.org'),
    ('Sammie', 'Belter', 'sammie@academy-360.org'),
    ('Esperanza', 'Cervantes', 'echave4@dpsk12.net'),
    ('Darlicia', 'Campbell', 'dcampbell@chscharter.org'),
    ('Sarah', 'LeDuff', 'sleduff@compassacademy.org'),
    ('Tyler', 'Bauer', 'Tyler.bauer@denverjustice.org'),
    ('Kendra', 'Lofland', 'firstname(at)denverlanguageschool.org'),
    ('Crissy', 'Doty', 'Crissy.Doty@ddeschool.org'),
    ('Allie', 'Serina', 'allie.serina@Scienceandtech.org'),
    ('Ian', 'McIntire', 'ian.mcintire@scienceandtech.org'),
    ('Jesse', 'Heaton', 'jesse.heaton@scienceandtech.org'),
    ('Joven', 'Lusa', 'joven.lusa@scienceandtech.org'),
    ('Jimmy', 'Cooley', 'Jimmy.Cooley@scienceandtech.org'),
    ('Eva', 'Perez', 'eva.perez@scienceandtech.org'),
    ('Katie', 'Ethridge', 'katie.ethridge@scienceandtech.org'),
    ('DeJuan', 'Clanton', 'dejuan.clanton@scienceandtech.org'),
    ('Jay', 'Gibson', 'jay.gibson@scienceandtech.org'),
    ('Lexie', 'Malika', 'lexie.malika@scienceandtech.org'),
    ('James', 'Rader', 'james.rader@scienceandtech.org'),
    ('Sandra', 'Bea', 'sandra.bea@fasdenver.org'),
    ('Erin', 'Williams', 'erin.williams@galsdenver.org'),
    ('Maya', 'Balikier', 'mbalakier@highlineacademy.org'),
    ('Cortney', 'Fry', 'cfry@highlineacademy.org'),
    ('Lauren', 'Abuhadema', 'labuhadema@kippcolorado.org'),
    ('Kristen', 'Tully', 'KTully@MonarchM.com'),
    ('Colin', 'Hynes', 'colin@odysseydenver.org'),
    ('Bishop', 'Burroughs', 'bishop.burroughs@omardblairk8.com'),
    ('Matthew', 'Baca', 'mbaca@riseupcommunityschool.net'),
    ('Sarah', 'Bliss', 'sbliss@rockymountainprep.org'),
    ('Crystal', 'Reed', 'creed@rmp.org'),
    ('Guadalupe', 'Marquez', 'gmarquez@rockymountainprep.org'),
    ('Joyce', 'Arzu', 'jarzu@rockymountainprep.org'),
    ('Christina', 'Pena', 'Cpena@rockymountainprep.org'),
    ('Chelsea', 'Yondo', 'cyondo@rockymountainprep.org'),
    ('Olivia', 'Fear', 'ofear@rockmountainprep.org'),
    ('Mayte', 'Galaviz', 'mgalavize@rockymountainprep.org'),
    ('Raymond', 'Simmons', 'rsimmons@soardenver.org'),
    ('Mollie', 'Major', 'mmajor@uprepschool.org'),
    ('Shang', 'Sharpe', 'ssharpe@uprepschool.org'),
    ('Melody', 'Means', 'melody.means@wyattacademy.org')
  ) as t(person_name, person_email)
  WHERE person_email NOT IN (SELECT email FROM staff)
  RETURNING id, email
)
-- Insert Discipline Building Liaison assignments
INSERT INTO school_staff (school_id, staff_id, role_id, department_id)
SELECT 
  s.id as school_id,
  staff.id as staff_id,
  r.id as role_id,
  d.id as department_id
FROM schools s
CROSS JOIN inserted_staff staff
JOIN roles r ON r.name = 'Discipline Building Liaison'
JOIN departments d ON d.name = 'General'
WHERE staff.email IN (
  'aaron.nakai@5280highschool.org',
  'sammie@academy-360.org',
  'echave4@dpsk12.net',
  'dcampbell@chscharter.org',
  'sleduff@compassacademy.org',
  'Tyler.bauer@denverjustice.org',
  'firstname(at)denverlanguageschool.org',
  'Crissy.Doty@ddeschool.org',
  'allie.serina@Scienceandtech.org',
  'ian.mcintire@scienceandtech.org',
  'jesse.heaton@scienceandtech.org',
  'joven.lusa@scienceandtech.org',
  'Jimmy.Cooley@scienceandtech.org',
  'eva.perez@scienceandtech.org',
  'katie.ethridge@scienceandtech.org',
  'dejuan.clanton@scienceandtech.org',
  'jay.gibson@scienceandtech.org',
  'lexie.malika@scienceandtech.org',
  'james.rader@scienceandtech.org',
  'sandra.bea@fasdenver.org',
  'erin.williams@galsdenver.org',
  'mbalakier@highlineacademy.org',
  'cfry@highlineacademy.org',
  'labuhadema@kippcolorado.org',
  'KTully@MonarchM.com',
  'colin@odysseydenver.org',
  'bishop.burroughs@omardblairk8.com',
  'mbaca@riseupcommunityschool.net',
  'sbliss@rockymountainprep.org',
  'creed@rmp.org',
  'gmarquez@rockymountainprep.org',
  'jarzu@rockymountainprep.org',
  'Cpena@rockymountainprep.org',
  'cyondo@rockymountainprep.org',
  'ofear@rockmountainprep.org',
  'mgalavize@rockymountainprep.org',
  'rsimmons@soardenver.org',
  'mmajor@uprepschool.org',
  'ssharpe@uprepschool.org',
  'melody.means@wyattacademy.org'
);

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_role ON school_staff(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_department ON school_staff(department_id);
