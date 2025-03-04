-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create school_staff table to track assignments
CREATE TABLE IF NOT EXISTS school_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES staff(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id),
  department_id uuid REFERENCES departments(id),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, staff_id, role_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_staff ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to roles"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to departments"
  ON departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to staff"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow public read access to school_staff"
  ON school_staff FOR SELECT
  TO authenticated
  USING (true);

-- Insert departments
INSERT INTO departments (name, description) VALUES
  ('FINANCE', 'Financial management and operations'),
  ('HUMAN RESOURCES', 'HR and personnel management'),
  ('Technology', 'IT and technical support'),
  ('Administration', 'School administration'),
  ('Special Education Information', 'Special education services'),
  ('Student Services', 'Student support services'),
  ('General', 'General school operations'),
  ('Instruction', 'Teaching and curriculum'),
  ('Operations', 'School operations'),
  ('School Psychologist', 'Psychological services'),
  ('School Management', 'School leadership and management'),
  ('Social Worker', 'Social work services');

-- Insert roles
INSERT INTO roles (name, description) VALUES
  ('Executive Director/Operations Lead', 'School executive director and operations lead'),
  ('School Leader/Principal', 'School principal or leader'),
  ('Operations Lead', 'Operations management'),
  ('Hr', 'Human resources management'),
  ('Social Worker', 'Social work services'),
  ('Finance/Business Manager', 'Financial management'),
  ('Discipline Building Liaison', 'Student discipline management'),
  ('Technology Coordinator', 'Technology management'),
  ('GT Coordinator', 'Gifted and talented program coordination'),
  ('Executive Director', 'School executive leadership'),
  ('COO', 'Chief Operating Officer'),
  ('President', 'School network president'),
  ('External Comms', 'External communications'),
  ('Special Projects', 'Special projects management'),
  ('Director of Operations', 'Operations director'),
  ('CAO', 'Chief Academic Officer'),
  ('CEO', 'Chief Executive Officer'),
  ('CFO', 'Chief Financial Officer'),
  ('Counsel/COO', 'Legal counsel and operations'),
  ('School Psychologist', 'Psychological services'),
  ('Sped coordinator', 'Special education coordination'),
  ('Nurse', 'School nurse');

-- Create updated_at triggers
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_school_staff_updated_at
  BEFORE UPDATE ON school_staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
