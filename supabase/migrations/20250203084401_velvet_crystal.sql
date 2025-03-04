-- Create school_grades table
CREATE TABLE IF NOT EXISTS school_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid REFERENCES schools(id) ON DELETE CASCADE,
  grade text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, grade)
);

-- Enable RLS
ALTER TABLE school_grades ENABLE ROW LEVEL SECURITY;

-- Create policy for school_grades
CREATE POLICY "Users can view grades for schools they have access to"
  ON school_grades FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = school_grades.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

CREATE POLICY "Users can manage grades for their schools"
  ON school_grades FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_portfolios sp
      WHERE sp.school_id = school_grades.school_id
      AND sp.organization_id = auth.uid()
      AND sp.enabled = true
    )
  );

-- Create index
CREATE INDEX school_grades_school_id_idx ON school_grades(school_id);
