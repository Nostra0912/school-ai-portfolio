import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { AppError } from '../middleware/errorHandler';
import { validateRequest } from '../middleware/validateRequest';
import { z } from 'zod';

const router = Router();

// Validation schemas
const createSchoolSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().min(1),
  status: z.enum(['Opened', 'Closed', 'Under Review']),
  parent_organization: z.string().optional(),
  phone: z.string().optional(),
  current_enrollment: z.number().int().min(0),
  website: z.string().url().optional()
});

// Get all schools
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select(`
        *,
        grades:school_grades(*),
        tags:school_tags(*),
        operation_details:school_operation_details(*),
        meal_options:school_meal_options(*)
      `)
      .order('name');

    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(new AppError(500, 'Failed to fetch schools', error));
  }
});

// Create school
router.post('/', validateRequest(createSchoolSchema), async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('schools')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(new AppError(500, 'Failed to create school', error));
  }
});

export const schoolRoutes = router;
