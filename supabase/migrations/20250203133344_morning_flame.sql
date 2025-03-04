-- Drop any existing restrictive policies
DROP POLICY IF EXISTS "Enable full access to schools" ON schools;
DROP POLICY IF EXISTS "Allow public read access to schools" ON schools;
DROP POLICY IF EXISTS "Enable full public access to schools" ON schools;

-- Create new permissive policies for all related tables
CREATE POLICY "Enable unrestricted access to schools"
  ON schools FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable unrestricted access to school_grades"
  ON school_grades FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable unrestricted access to school_tags"
  ON school_tags FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable unrestricted access to school_operation_details"
  ON school_operation_details FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable unrestricted access to school_meal_options"
  ON school_meal_options FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Verify and update any missing data
DO $$
DECLARE
  school_record RECORD;
BEGIN
  -- Ensure all schools have grades
  FOR school_record IN SELECT * FROM schools LOOP
    -- Insert elementary grades if missing
    IF school_record.name LIKE '%Elementary%' THEN
      INSERT INTO school_grades (school_id, grade)
      SELECT school_record.id, grade
      FROM unnest(ARRAY['K', '1', '2', '3', '4', '5']) AS grade
      ON CONFLICT (school_id, grade) DO NOTHING;
    END IF;

    -- Insert middle school grades if missing
    IF school_record.name LIKE '%Middle%' THEN
      INSERT INTO school_grades (school_id, grade)
      SELECT school_record.id, grade
      FROM unnest(ARRAY['6', '7', '8']) AS grade
      ON CONFLICT (school_id, grade) DO NOTHING;
    END IF;

    -- Insert high school grades if missing
    IF school_record.name LIKE '%High%' THEN
      INSERT INTO school_grades (school_id, grade)
      SELECT school_record.id, grade
      FROM unnest(ARRAY['9', '10', '11', '12']) AS grade
      ON CONFLICT (school_id, grade) DO NOTHING;
    END IF;

    -- Ensure all schools have basic tags
    INSERT INTO school_tags (school_id, tag)
    SELECT school_record.id, tag
    FROM unnest(ARRAY['public', 'charter']) AS tag
    ON CONFLICT (school_id, tag) DO NOTHING;

    -- Ensure all schools have operation details
    INSERT INTO school_operation_details (
      school_id,
      student_capacity,
      class_size,
      teacher_to_student_ratio,
      transportation_provided,
      lunch_provided,
      financial_aid_available
    )
    VALUES (
      school_record.id,
      CASE 
        WHEN school_record.name LIKE '%Elementary%' THEN 400
        WHEN school_record.name LIKE '%Middle%' THEN 450
        WHEN school_record.name LIKE '%High%' THEN 500
        ELSE 450
      END,
      25,
      '1:25',
      true,
      true,
      false
    )
    ON CONFLICT (school_id) DO NOTHING;

    -- Ensure all schools have basic meal options
    INSERT INTO school_meal_options (school_id, meal_option)
    SELECT school_record.id, meal_option
    FROM unnest(ARRAY['Breakfast', 'Lunch', 'Snack']) AS meal_option
    ON CONFLICT (school_id, meal_option) DO NOTHING;
  END LOOP;
END $$;

-- Refresh all indexes to ensure optimal query performance
REINDEX TABLE schools;
REINDEX TABLE school_grades;
REINDEX TABLE school_tags;
REINDEX TABLE school_operation_details;
REINDEX TABLE school_meal_options;

-- Analyze tables to update statistics
ANALYZE schools;
ANALYZE school_grades;
ANALYZE school_tags;
ANALYZE school_operation_details;
ANALYZE school_meal_options;
