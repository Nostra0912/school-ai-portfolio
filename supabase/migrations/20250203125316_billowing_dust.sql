-- Insert Technology Coordinators, Discipline Building Liaisons, Finance Managers, etc.
WITH inserted_staff AS (
  INSERT INTO staff (first_name, last_name, email)
  SELECT DISTINCT 
    split_part(person_name, ' ', 1) as first_name,
    split_part(person_name, ' ', 2) as last_name,
    person_email
  FROM (VALUES
    -- Technology Coordinators
    ('Chris Dotson', 'cdotson@rmtt.com'),
    ('Christopher Bakke', 'Christopher_Bakke@dpsk12.net'),
    ('Curtis Huey', 'curtis.huey@ddeschool.org'),
    ('Curtis Sternisky', 'curtis.sternisky@scienceandtech.org'),
    ('Joshua Redmond', 'joshua.redmond@scienceandtech.org'),
    ('Richard Hoeft', 'richard.hoeft@scienceandtech.org'),
    ('Michael Morris', 'michael.morris@scienceandtech.org'),
    ('Khalifa Kendee', 'Khalifa.Kendee@scienceandtech.org'),
    ('Mike Dare', 'mike.dare@scienceandtech.org'),
    ('Bridget Mensah', 'bridget.mensah@scienceandtech.org'),
    ('Chris Garcia', 'chris.garcia@scienceandtech.org'),
    ('Todd Peterson', 'todd@fasdenver.org'),
    ('Ben Taylor', 'btaylor@rmtt.com'),
    ('Brandon Sexton', 'bsexton@highlineacademy.org'),
    ('Marisol Sotelo', 'msotelo@highlineacademy.org'),
    ('Geno Garcia', 'ggarcia@kippcolorado.org'),
    ('Bill Brooks', 'bbrooks@kippcolorado.org'),
    ('Jerod Sarlo', 'JSarlo@MonarchM.com'),
    ('John Kang', 'techsupport@omardblairk8.com'),
    ('Ryan Plantz', 'rplantz@riseupcommunityschool.net'),
    ('Selene Sanchez', 'ssanchez@rockymountainprep.org'),
    ('Tina Watson', 'twatson@rockymountainprep.org'),
    ('Lilia Barragan', 'lbarragan@rockymountainprep.org'),
    ('Jake Shane', 'jake@rockymountainprep.org'),
    ('Chris Landis', 'clandis@soardenver.org'),
    ('Doug Yoshimoto', 'dyoshimoto@uprepschool.org'),
    ('David tadlock', 'davidt@gracetechsystems.com')
  ) as t(person_name, person_email)
  WHERE person_email NOT IN (SELECT email FROM staff)
  RETURNING id, email
)
-- Insert Technology Coordinator assignments
INSERT INTO school_staff (school_id, staff_id, role_id, department_id)
SELECT 
  s.id as school_id,
  staff.id as staff_id,
  r.id as role_id,
  d.id as department_id
FROM schools s
CROSS JOIN inserted_staff staff
JOIN roles r ON r.name = 'Technology Coordinator'
JOIN departments d ON d.name = 'Technology'
WHERE staff.email IN (
  'cdotson@rmtt.com',
  'Christopher_Bakke@dpsk12.net',
  'curtis.huey@ddeschool.org',
  'curtis.sternisky@scienceandtech.org',
  'joshua.redmond@scienceandtech.org',
  'richard.hoeft@scienceandtech.org',
  'michael.morris@scienceandtech.org',
  'Khalifa.Kendee@scienceandtech.org',
  'mike.dare@scienceandtech.org',
  'bridget.mensah@scienceandtech.org',
  'chris.garcia@scienceandtech.org',
  'todd@fasdenver.org',
  'btaylor@rmtt.com',
  'bsexton@highlineacademy.org',
  'msotelo@highlineacademy.org',
  'ggarcia@kippcolorado.org',
  'bbrooks@kippcolorado.org',
  'JSarlo@MonarchM.com',
  'techsupport@omardblairk8.com',
  'rplantz@riseupcommunityschool.net',
  'ssanchez@rockymountainprep.org',
  'twatson@rockymountainprep.org',
  'lbarragan@rockymountainprep.org',
  'jake@rockymountainprep.org',
  'clandis@soardenver.org',
  'dyoshimoto@uprepschool.org',
  'davidt@gracetechsystems.com'
);

-- Insert remaining staff roles (Finance, HR, etc.)
WITH remaining_staff AS (
  INSERT INTO staff (first_name, last_name, email)
  SELECT DISTINCT 
    split_part(person_name, ' ', 1) as first_name,
    split_part(person_name, ' ', 2) as last_name,
    person_email
  FROM (VALUES
    -- Finance Managers
    ('Liz Duncan', 'liz.duncan@5280highschool.org'),
    ('Jacqui Carter', 'a360businessmanager@academy-360.org'),
    ('Irene Keenaghan', 'irenekeenaghan@ineedai.com'),
    ('Jennifer Lilly', 'jlilly@chscharter.orfg'),
    ('Sarah Craig', 'swhitlock@compassacademy.org'),
    ('Lori Deacon', 'lorideacon@ineedai.com'),
    ('Raul Padilla', 'raul.padilla@scienceandtech.org'),
    ('Tony Eberspacher', 'anthony.eberspacher@scienceandtech.org'),
    ('Nick Plantan', 'nicholas.plantan@scienceandtech.org'),
    ('David Xiao', 'davidxiao@rockymountainprep.org'),
    ('Kelly Moulton', 'kmoulton@soardenver.org'),
    ('Alastair Dawe', 'adawe@uprepschool.org')
  ) as t(person_name, person_email)
  WHERE person_email NOT IN (SELECT email FROM staff)
  RETURNING id, email
)
-- Insert Finance Manager assignments
INSERT INTO school_staff (school_id, staff_id, role_id, department_id)
SELECT 
  s.id as school_id,
  staff.id as staff_id,
  r.id as role_id,
  d.id as department_id
FROM schools s
CROSS JOIN remaining_staff staff
JOIN roles r ON r.name = 'Finance/Business Manager'
JOIN departments d ON d.name = 'FINANCE'
WHERE staff.email IN (
  'liz.duncan@5280highschool.org',
  'a360businessmanager@academy-360.org',
  'irenekeenaghan@ineedai.com',
  'jlilly@chscharter.orfg',
  'swhitlock@compassacademy.org',
  'lorideacon@ineedai.com',
  'raul.padilla@scienceandtech.org',
  'anthony.eberspacher@scienceandtech.org',
  'nicholas.plantan@scienceandtech.org',
  'davidxiao@rockymountainprep.org',
  'kmoulton@soardenver.org',
  'adawe@uprepschool.org'
);
