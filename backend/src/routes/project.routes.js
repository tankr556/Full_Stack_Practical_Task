import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { checkProjectAccess } from '../middleware/project.middleware.js';
import {
  createTask,
  getTasks,
  updateTask,
  getTaskComments,
  addComment,
  getActivityFeed,
  getProjects,
} from '../controllers/project.controller.js';
import { exportToAirtable } from '../controllers/airtable.controller.js';

const router = Router();

router.use(protect);

// Project list endpoint
router.get('/', getProjects);

// Task management & query endpoints
router.post('/:projectId/tasks', checkProjectAccess(['admin', 'member']), createTask);
router.get('/:projectId/tasks', checkProjectAccess(['admin', 'member', 'viewer']), getTasks);
router.patch('/tasks/:taskId', updateTask);

// Task Comments endpoints
router.get('/tasks/:taskId/comments', getTaskComments);
router.post('/tasks/:taskId/comments', addComment);

// Activity Feed endpoint (Project members only)
router.get('/:projectId/activity', checkProjectAccess(['admin', 'member', 'viewer']), getActivityFeed);

// Airtable Export Endpoint (Part 6)
router.post('/:projectId/export-airtable', checkProjectAccess(['admin', 'member']), exportToAirtable);

export default router;
