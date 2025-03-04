-- Create school_tags table
CREATE TABLE IF NOT EXISTS school_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, tag)
);

-- Create school_operation_details table
CREATE TABLE IF NOT EXISTS school_operation_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  student_capacity integer NOT NULL DEFAULT 0,
  class_size integer NOT NULL DEFAULT 0,
  teacher_to_student_ratio text,
  transportation_provided boolean DEFAULT false,
  lunch_provided boolean DEFAULT false,
  financial_aid_available boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id)
);

-- Create school_meal_options table
CREATE TABLE IF NOT EXISTS school_meal_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  meal_option text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, meal_option)
);

-- Enable RLS
ALTER TABLE school_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_operation_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_meal_options ENABLE ROW LEVEL SECURITY;

-- Create policies for school_tags
CREATE POLICY "Users can view tags for schools they have access to"
  ON school_tags FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = school_tags.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can manage tags for their schools"
  ON school_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = school_tags.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

-- Create policies for school_operation_details
CREATE POLICY "Users can view operation details for schools they have access to"
  ON school_operation_details FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = school_operation_details.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can manage operation details for their schools"
  ON school_operation_details FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = school_operation_details.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

-- Create policies for school_meal_options
CREATE POLICY "Users can view meal options for schools they have access to"
  ON school_meal_options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = school_meal_options.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can manage meal options for their schools"
  ON school_meal_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = school_meal_options.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

-- Create indexes
CREATE INDEX school_tags_school_id_idx ON school_tags(school_id);
CREATE INDEX school_operation_details_school_id_idx ON school_operation_details(school_id);
CREATE INDEX school_meal_options_school_id_idx ON school_meal_options(school_id);
