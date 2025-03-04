-- Insert GT Coordinators
INSERT INTO staff (first_name, last_name, email)
VALUES
  ('Iyanifa', 'Ifalola', 'iya@5280higschool.org'),
  ('Kristen', 'Freeman', 'kristen@academy-360.org'),
  ('Greg', 'Moldow', 'greg_moldow@dpsk12.net'),
  ('Katrina', 'Jewell', 'kjewell@chschater.org'),
  ('Rigo', 'Tostado', 'rtostado@chscharter.org'),
  ('Daylan', 'Bradshaw', 'dbradshaw@compassacademy.org'),
  ('Tyler', 'Bauer', 'Tyler.bauer@denverjustice.org'),
  ('Rick', 'Nielsen', 'firstname(at)denverlanguageschool.org'),
  ('Liza', 'Hubbel', 'liza.hubbell@ddeschool.org'),
  ('Sheena', 'Bustamante', 'sheena.bustamante@scienceandtech.org'),
  ('Tyler', 'Randolph', 'tyler.randolph@scienceandtech.org'),
  ('Leslie', 'Stewart', 'leslie.stewart@scienceandtech.org'),
  ('Julie', 'Keys', 'julie.keys@scienceandtech.org'),
  ('Roxanne', 'Montreuil', 'roxanne.montreuil@scienceandtech.org'),
  ('Jeff', 'Shuster', 'Jeffrey.Shuster@scienceandtech.org'),
  ('Michelle', 'Rawls', 'michelle.rawls@scienceandtech.org'),
  ('Jamie', 'Doshi', 'jamie.doshi@scienceandtech.org'),
  ('Amanda', 'Lilly', 'amanda.lilly@scienceandtech.org'),
  ('Amanda', 'Evans', 'amanda.evansscienceandtech.org'),
  ('Lexie', 'Malika', 'lexie.malika@scienceandtech.org'),
  ('Emma', 'Jablow', 'emma.jablow@scienceandtech.org'),
  ('Verna', 'Rolland', 'verna.rolland@fasdenver.org'),
  ('Leah', 'Bock', 'leah.bock@galsdenver.org'),
  ('Molly', 'Smemo', 'molly.smemo@galsdenver.org'),
  ('Lora', 'Martinez', 'lmartinez@highlineacademy.org'),
  ('Kevin', 'O''Connell', 'koconnell@highlineacademy.org'),
  ('Jen', 'Jackson', 'jjackson@kippcolorado.org'),
  ('Leslie', 'Snyder Newquist', 'lsnyder@monarchm.com'),
  ('Liza', 'Hubbell', 'lizahubbell@odysseydenver.org'),
  ('Morgan', 'Hodge', 'morgan.hodge@omardblairk8.com'),
  ('Matthew', 'Baca', 'mbaca@riseupcommunityschool.net'),
  ('Anna', 'Flores-Monarrez', 'afloresmonarrez@rockymountainprep.org'),
  ('Joe', 'DiConsiglio', 'jdiconsiglio@rockymountainprep.org'),
  ('Abbey', 'Patteson', 'apatteson@rockymountainprep.org'),
  ('Kendra', 'Buck', 'kbuck@rockymountainprep.org'),
  ('Sam', 'Weir', 'sweir@rockymountainprep.org'),
  ('Cheryl', 'Robison', 'crobison@rockymountainprep.org'),
  ('Valeria', 'Nevarez-Varela', 'v_nevarez-varela@dpsk12.net'),
  ('Sarah', 'Waugh', 'swaugh@uprepschool.org'),
  ('Sarah', 'Grant', 'sarah.grant@wyattacademy')
ON CONFLICT (email) DO NOTHING;

-- Insert School Psychologists
INSERT INTO staff (first_name, last_name, email)
VALUES
  ('Breanna', 'Faisch', 'breanna.faish@5280highschool.org'),
  ('Anna', 'O''Brien', 'anna@academy-360.org'),
  ('Abigail', 'Dole', 'abigail_dole@dpsk12.net'),
  ('Paul', 'Embleton', 'paul_embleton@dpsk12.net'),
  ('Jaclyn', 'Legendre', 'Jaclyn_Legendre@dpsk12.net'),
  ('Summit', 'Pac', 'Hannah@....'),
  ('Andrew', 'Pucci', 'andrew.pucci@ddeschool.org'),
  ('Sadie', 'Johnson', 'Sadie.Johnson@scienceandtech.org'),
  ('Kirsten', 'Skie', 'kskie@dpsk12.net'),
  ('Brianne', 'Rogers', 'brogers@highlineacademy.org'),
  ('Tierra', 'Kilbert', 'tkilbert@highlineacademy.org'),
  ('Dawn', 'Loge', 'dawnl@odysseydenver.org'),
  ('Jaclyn', 'Terrell', 'jaclyn_terrell@dpsk12.net'),
  ('Liz', 'Leeper Garcia', 'lleepergarcia@rockymountainprep.org'),
  ('Josh', 'O''Neal', 'jryan@rockymountainprep.org'),
  ('Debbieann', 'Santana', 'debbieann_santana@dpsk12.net'),
  ('Jenny', 'Stoner', 'jenny_stoner@dpsk12.net')
ON CONFLICT (email) DO NOTHING;

-- Insert GT Coordinator assignments
INSERT INTO school_staff (school_id, staff_id, role_id, department_id)
SELECT 
  s.id,
  st.id,
  r.id,
  d.id
FROM schools s
JOIN staff st ON st.email IN (
  'iya@5280higschool.org',
  'kristen@academy-360.org',
  'greg_moldow@dpsk12.net',
  'kjewell@chschater.org',
  'rtostado@chscharter.org',
  'dbradshaw@compassacademy.org',
  'Tyler.bauer@denverjustice.org',
  'firstname(at)denverlanguageschool.org',
  'liza.hubbell@ddeschool.org',
  'sheena.bustamante@scienceandtech.org',
  'tyler.randolph@scienceandtech.org',
  'leslie.stewart@scienceandtech.org',
  'julie.keys@scienceandtech.org',
  'roxanne.montreuil@scienceandtech.org',
  'Jeffrey.Shuster@scienceandtech.org',
  'michelle.rawls@scienceandtech.org',
  'jamie.doshi@scienceandtech.org',
  'amanda.lilly@scienceandtech.org',
  'amanda.evansscienceandtech.org',
  'lexie.malika@scienceandtech.org',
  'emma.jablow@scienceandtech.org',
  'verna.rolland@fasdenver.org',
  'leah.bock@galsdenver.org',
  'molly.smemo@galsdenver.org',
  'lmartinez@highlineacademy.org',
  'koconnell@highlineacademy.org',
  'jjackson@kippcolorado.org',
  'lsnyder@monarchm.com',
  'lizahubbell@odysseydenver.org',
  'morgan.hodge@omardblairk8.com',
  'mbaca@riseupcommunityschool.net',
  'afloresmonarrez@rockymountainprep.org',
  'jdiconsiglio@rockymountainprep.org',
  'apatteson@rockymountainprep.org',
  'kbuck@rockymountainprep.org',
  'sweir@rockymountainprep.org',
  'crobison@rockymountainprep.org',
  'v_nevarez-varela@dpsk12.net',
  'swaugh@uprepschool.org',
  'sarah.grant@wyattacademy'
)
JOIN roles r ON r.name = 'GT Coordinator'
JOIN departments d ON d.name = 'Special Education Information';

-- Insert School Psychologist assignments
INSERT INTO school_staff (school_id, staff_id, role_id, department_id)
SELECT 
  s.id,
  st.id,
  r.id,
  d.id
FROM schools s
JOIN staff st ON st.email IN (
  'breanna.faish@5280highschool.org',
  'anna@academy-360.org',
  'abigail_dole@dpsk12.net',
  'paul_embleton@dpsk12.net',
  'Jaclyn_Legendre@dpsk12.net',
  'Hannah@....',
  'andrew.pucci@ddeschool.org',
  'Sadie.Johnson@scienceandtech.org',
  'kskie@dpsk12.net',
  'brogers@highlineacademy.org',
  'tkilbert@highlineacademy.org',
  'dawnl@odysseydenver.org',
  'jaclyn_terrell@dpsk12.net',
  'lleepergarcia@rockymountainprep.org',
  'jryan@rockymountainprep.org',
  'debbieann_santana@dpsk12.net',
  'jenny_stoner@dpsk12.net'
)
JOIN roles r ON r.name = 'School Psychologist'
JOIN departments d ON d.name = 'School Psychologist';

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_name ON staff(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_school_staff_active ON school_staff(is_active);
