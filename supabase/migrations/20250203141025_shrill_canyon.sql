-- Insert SPED Coordinators
INSERT INTO staff (first_name, last_name, email)
VALUES
  ('Hannah', 'Kramer', 'hannah.kramer@5280highschool.org'),
  ('Anna', 'OBrien', 'anna@academy-360.org'),
  ('Joshua', 'Gurvitch', 'Joshua_Gurvitch@dpsk12.net'),
  ('Katrina', 'Jewell', 'kjewell@chscharter.org'),
  ('Laura', 'Pritchard', 'lpritchard@chscharter.org'),
  ('Alicia', 'Schaefer', 'aschaefer@compassacademy.org'),
  ('Tyler', 'Bauer', 'Tyler.bauer@denverjustice.org'),
  ('Hannah', 'Koski', 'lorideacon@ineedai.com'),
  ('Jenna', 'Bertuzzo', 'jenna.bertuzzo@ddeschool.org'),
  ('Ellen', 'Hall', 'ellen.hall@scienceandtech.org'),
  ('Lindsey', 'Gish', 'lindsey.gish@scienceandtech.org'),
  ('Jenny', 'Brown', 'jenny.brown@scienceandtech.org'),
  ('Barbara', 'Zayas', 'barbara.zayas@scienceandtech.org'),
  ('Cory', 'Montreuil', 'cory.montreuil@scienceandtech.org'),
  ('Jennifer', 'Rivera', 'Jennifer.Rivera@scienceandtech.org'),
  ('Amel', 'Khalife', 'amel.khalife@scienceandtech.org'),
  ('Melissa', 'McCollor', 'melissa.mccollor@scienceandtech.org'),
  ('Matt', 'Somsky', 'matthew.somsky@scienceandtech.org'),
  ('Amanda', 'Evans', 'amanda.evans@scienceandtech.org'),
  ('Leann', 'Blackburn', 'leann.mccormick@scienceandtech.org'),
  ('Emma', 'Jablow', 'emma.jablow@scienceandtech.org'),
  ('Jordan', 'Bobrick', 'jordan.bobrick@fasdenver.org'),
  ('Austin', 'Doyle', 'austin.doyle@galsdenver.org'),
  ('Kendra', 'VanMatre', 'kvanmatre@highlineacademy.org'),
  ('Ann', 'Scharf', 'ascharf@highlineacademy.org'),
  ('Jen', 'Jackson', 'jjackson@kippcolorado.org'),
  ('Kristen', 'Tully', 'KTully@MonarchM.com'),
  ('Kate', 'McNamara', 'kate@odysseydenver.org'),
  ('Grandon', 'Pickering', 'grandon.pickering@omardblairk8.com'),
  ('Lauren', 'Conlin', 'lconlin@riseupcommunityschool.net'),
  ('Sophie', 'Knauf', 'sknauf@rockymountainprep.org'),
  ('Riley', 'Stouffer', 'rstouffer@rmp.org'),
  ('Abbey', 'Patteson', 'apatteson@rockymountainprep.org'),
  ('Ed', 'Krankowski', 'ekrankowski@rockymountainprep.org'),
  ('Lindsey', 'Knudson', 'Lknudson@rockymountainprep.org'),
  ('Tracy', 'Lane', 'tlane@rockymountainprep.org'),
  ('Cheryl', 'Robison', 'crobison@rockymountainprep.org'),
  ('Sonia', 'Sisneros', 'ssisneros@soardenver.org'),
  ('Liz', 'Suarez', 'lsuarez@uprepschool.org'),
  ('Brenda', 'Stratemeyer', 'bstratemeyer@uprepschool.org'),
  ('Sarah', 'Grant', 'sarah.grant@wyattacademy.org')
ON CONFLICT (email) DO NOTHING;

-- Insert SPED Coordinator assignments
INSERT INTO school_staff (school_id, staff_id, role_id, department_id)
SELECT 
  s.id,
  st.id,
  r.id,
  d.id
FROM schools s
JOIN staff st ON st.email IN (
  'hannah.kramer@5280highschool.org',
  'anna@academy-360.org',
  'Joshua_Gurvitch@dpsk12.net',
  'kjewell@chscharter.org',
  'lpritchard@chscharter.org',
  'aschaefer@compassacademy.org',
  'Tyler.bauer@denverjustice.org',
  'lorideacon@ineedai.com',
  'jenna.bertuzzo@ddeschool.org',
  'ellen.hall@scienceandtech.org',
  'lindsey.gish@scienceandtech.org',
  'jenny.brown@scienceandtech.org',
  'barbara.zayas@scienceandtech.org',
  'cory.montreuil@scienceandtech.org',
  'Jennifer.Rivera@scienceandtech.org',
  'amel.khalife@scienceandtech.org',
  'melissa.mccollor@scienceandtech.org',
  'matthew.somsky@scienceandtech.org',
  'amanda.evans@scienceandtech.org',
  'leann.mccormick@scienceandtech.org',
  'emma.jablow@scienceandtech.org',
  'jordan.bobrick@fasdenver.org',
  'austin.doyle@galsdenver.org',
  'kvanmatre@highlineacademy.org',
  'ascharf@highlineacademy.org',
  'jjackson@kippcolorado.org',
  'KTully@MonarchM.com',
  'kate@odysseydenver.org',
  'grandon.pickering@omardblairk8.com',
  'lconlin@riseupcommunityschool.net',
  'sknauf@rockymountainprep.org',
  'rstouffer@rmp.org',
  'apatteson@rockymountainprep.org',
  'ekrankowski@rockymountainprep.org',
  'Lknudson@rockymountainprep.org',
  'tlane@rockymountainprep.org',
  'crobison@rockymountainprep.org',
  'ssisneros@soardenver.org',
  'lsuarez@uprepschool.org',
  'bstratemeyer@uprepschool.org',
  'sarah.grant@wyattacademy.org'
)
JOIN roles r ON r.name = 'Sped coordinator'
JOIN departments d ON d.name = 'General';

-- Create additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_name_email ON staff(first_name, last_name, email);
CREATE INDEX IF NOT EXISTS idx_school_staff_composite ON school_staff(school_id, staff_id, role_id);
