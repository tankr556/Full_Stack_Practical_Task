import mongoose from 'mongoose';
import Project from '../models/Project.js';

export const checkProjectAccess = (allowedRoles = ['admin', 'member', 'viewer']) => {
  return async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({ success: false, message: 'Project ID is required' });
      }

      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ success: false, message: 'Invalid Project ID format' });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found' });
      }

      const member = project.members.find(
        (m) => m.user.toString() === req.user._id.toString()
      );

      if (!member) {
        // User outside project gets 403 Forbidden
        return res.status(403).json({ success: false, message: 'Access denied: You are not a member of this project' });
      }

      if (!allowedRoles.includes(member.role)) {
        return res.status(403).json({ success: false, message: `Access denied: Requires ${allowedRoles.join('/')} permission` });
      }

      req.project = project;
      req.projectRole = member.role;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
