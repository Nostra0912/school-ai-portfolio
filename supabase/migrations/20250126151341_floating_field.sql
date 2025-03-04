-- Application Management
CREATE TABLE application_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('startup', 'replication', 'transfer', 'grant')),
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  workflow_id uuid REFERENCES approval_workflows(id),
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES application_templates(id),
  school_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
  submission_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_by uuid REFERENCES auth.users(id),
  submitted_at timestamptz,
  due_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE application_reviewers (
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('primary', 'secondary', 'external')),
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  assigned_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  PRIMARY KEY (application_id, user_id)
);

CREATE TABLE application_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id),
  section text NOT NULL,
  score integer,
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE application_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  comment text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE application_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE application_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_attachments ENABLE ROW LEVEL SECURITY;

-- Create updated_at triggers
CREATE TRIGGER update_application_templates_updated_at
  BEFORE UPDATE ON application_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_application_reviews_updated_at
  BEFORE UPDATE ON application_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS Policies
-- Application Templates
CREATE POLICY "Anyone can view active templates"
  ON application_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Staff can manage templates"
  ON application_templates FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE up.id = auth.uid() 
    AND up.profile_type = 'staff'
  ));

-- Applications
CREATE POLICY "Users can view their own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid() OR EXISTS (
    SELECT 1 FROM application_reviewers ar
    WHERE ar.application_id = id
    AND ar.user_id = auth.uid()
  ));

CREATE POLICY "Users can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Users can update their own draft applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (submitted_by = auth.uid() AND status = 'draft');

-- Application Reviewers
CREATE POLICY "Users can view their review assignments"
  ON application_reviewers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = application_id
    AND a.submitted_by = auth.uid()
  ));

-- Application Reviews
CREATE POLICY "Users can view reviews they have access to"
  ON application_reviews FOR SELECT
  TO authenticated
  USING (reviewer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = application_id
    AND a.submitted_by = auth.uid()
  ));

CREATE POLICY "Reviewers can create and update their reviews"
  ON application_reviews FOR ALL
  TO authenticated
  USING (reviewer_id = auth.uid());

-- Application Comments
CREATE POLICY "Users can view non-internal comments"
  ON application_comments FOR SELECT
  TO authenticated
  USING (NOT is_internal OR user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM application_reviewers ar
    WHERE ar.application_id = application_id
    AND ar.user_id = auth.uid()
  ));

CREATE POLICY "Users can create comments on applications they have access to"
  ON application_comments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM applications a
    LEFT JOIN application_reviewers ar ON a.id = ar.application_id
    WHERE a.id = application_id
    AND (a.submitted_by = auth.uid() OR ar.user_id = auth.uid())
  ));

-- Application Attachments
CREATE POLICY "Users can view attachments they have access to"
  ON application_attachments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM applications a
    LEFT JOIN application_reviewers ar ON a.id = ar.application_id
    WHERE a.id = application_id
    AND (a.submitted_by = auth.uid() OR ar.user_id = auth.uid())
  ));

CREATE POLICY "Users can upload attachments to their applications"
  ON application_attachments FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM applications a
    WHERE a.id = application_id
    AND a.submitted_by = auth.uid()
    AND a.status = 'draft'
  ));

-- Insert sample application templates
INSERT INTO application_templates (name, description, type, fields) VALUES
  ('Start-up Charter School Application', 
   'Application for establishing a new charter school',
   'startup',
   '[
     {
       "name": "school_mission",
       "label": "School Mission",
       "type": "textarea",
       "required": true,
       "description": "Describe the mission and vision of your proposed charter school"
     },
     {
       "name": "target_population",
       "label": "Target Population",
       "type": "textarea",
       "required": true,
       "description": "Describe the student population you intend to serve"
     },
     {
       "name": "educational_program",
       "label": "Educational Program",
       "type": "textarea",
       "required": true,
       "description": "Outline your proposed educational program and curriculum"
     },
     {
       "name": "governance_structure",
       "label": "Governance Structure",
       "type": "textarea",
       "required": true,
       "description": "Describe the proposed governance structure"
     },
     {
       "name": "financial_plan",
       "label": "Financial Plan",
       "type": "textarea",
       "required": true,
       "description": "Provide a detailed 5-year financial plan"
     }
   ]'::jsonb),
   
  ('Charter School Replication Application',
   'Application for replicating an existing successful charter school',
   'replication',
   '[
     {
       "name": "existing_school",
       "label": "Existing School",
       "type": "text",
       "required": true,
       "description": "Name of the existing charter school to be replicated"
     },
     {
       "name": "performance_data",
       "label": "Performance Data",
       "type": "textarea",
       "required": true,
       "description": "Provide performance data from the existing school"
     },
     {
       "name": "replication_rationale",
       "label": "Replication Rationale",
       "type": "textarea",
       "required": true,
       "description": "Explain why this school model should be replicated"
     }
   ]'::jsonb),
   
  ('Local Transfer Charter Application',
   'Application for transferring an existing charter school',
   'transfer',
   '[
     {
       "name": "current_authorizer",
       "label": "Current Authorizer",
       "type": "text",
       "required": true,
       "description": "Name of the current authorizing entity"
     },
     {
       "name": "transfer_rationale",
       "label": "Transfer Rationale",
       "type": "textarea",
       "required": true,
       "description": "Explain the reasons for seeking a transfer"
     },
     {
       "name": "compliance_history",
       "label": "Compliance History",
       "type": "textarea",
       "required": true,
       "description": "Provide compliance history with current authorizer"
     }
   ]'::jsonb),
   
  ('Charter School Grant Application',
   'Application for charter school grant funding',
   'grant',
   '[
     {
       "name": "project_title",
       "label": "Project Title",
       "type": "text",
       "required": true
     },
     {
       "name": "funding_amount",
       "label": "Requested Funding Amount",
       "type": "text",
       "required": true,
       "description": "Amount of funding requested in USD"
     },
     {
       "name": "project_description",
       "label": "Project Description",
       "type": "textarea",
       "required": true,
       "description": "Detailed description of how the funds will be used"
     },
     {
       "name": "timeline",
       "label": "Project Timeline",
       "type": "textarea",
       "required": true,
       "description": "Proposed timeline for implementing the project"
     },
     {
       "name": "budget",
       "label": "Detailed Budget",
       "type": "textarea",
       "required": true,
       "description": "Itemized budget for the requested funds"
     }
   ]'::jsonb);
