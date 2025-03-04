import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createApplicationSchema = z.object({
  template_id: z.string().uuid(),
  school_name: z.string().min(1),
  submission_data: z.record(z.any()),
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected']),
  due_date: z.string().datetime().optional()
});

// Get all applications
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        template:application_templates(name, type),
        submitted_by:user_profiles(first_name, last_name),
        reviewers:application_reviewers(count),
        comments:application_comments(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(new AppError(500, 'Failed to fetch applications', error));
  }
});

// Create application
router.post('/', validateRequest(createApplicationSchema), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(new AppError(500, 'Failed to create application', error));
  }
});

// Get application by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        template:application_templates(*),
        submitted_by:user_profiles(*),
        reviewers:application_reviewers(
          user:user_profiles(*)
        ),
        comments:application_comments(
          *,
          user:user_profiles(*)
        )
      `)
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!data) throw new AppError(404, 'Application not found');
    
    res.json(data);
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(500, 'Failed to fetch application', error));
  }
});

export const applicationRoutes = router;
