import { Router } from 'express';
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
} from '../controllers/leadController';
import { validateCreateLead, validateUpdateLead } from '../middleware/validateRequest';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All lead routes require authentication
router.use(authenticate);

router.get('/', getAllLeads);
router.get('/:id', getLeadById);
router.post('/', validateCreateLead, createLead);
router.put('/:id', validateUpdateLead, updateLead);
router.delete('/:id', deleteLead);

export default router;

