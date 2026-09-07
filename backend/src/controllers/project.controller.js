import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import ActivityLog from '../models/ActivityLog.js';
import Project from '../models/Project.js';
import mongoose from 'mongoose';

// Create a new task within a project
export const createTask = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { projectId } = req.params;
    const { title, description, assignee } = req.body;

    const task = new Task({
      title,
      description,
      assignee: assignee || null,
      project: projectId,
    });

    await task.save({ session });

    // Reliability: Using DB Transaction to guarantee strict consistency
    await ActivityLog.create(
      [
        {
          project: projectId,
          user: req.user._id,
          action: 'task_created',
          details: `Created task "${task.title}"`,
          task: task._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, task });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};

// Part 4 Challenge: Tasks Endpoint with Pagination, Filtering, Search & Indexes
export const getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20, status, search } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = { project: projectId };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('assignee', 'name email'),
      Task.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      tasks,
    });
  } catch (error) {
    return next(error);
  }
};

// Update Task Status & Assignee with Activity Log Transaction
export const updateTask = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { taskId } = req.params;
    const { status, assignee } = req.body;

    const task = await Task.findById(taskId).session(session);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    let actionDetails = [];

    if (status && status !== task.status) {
      actionDetails.push(`changed status from ${task.status} to ${status}`);
      task.status = status;
    }

    if (assignee !== undefined && String(assignee) !== String(task.assignee)) {
      actionDetails.push(`updated assignee`);
      task.assignee = assignee;
    }

    await task.save({ session });

    if (actionDetails.length > 0) {
      await ActivityLog.create(
        [
          {
            project: task.project,
            user: req.user._id,
            action: status ? 'status_changed' : 'assignee_changed',
            details: `Task "${task.title}": ${actionDetails.join(', ')}`,
            task: task._id,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ success: true, task });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};

// Part 3 Task Comments: Read & Immutable Create
export const getTaskComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ task: taskId })
      .sort({ createdAt: 1 })
      .populate('author', 'name email');

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    return next(error);
  }
};

export const addComment = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { taskId } = req.params;
    const { body } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const comment = new Comment({
      task: taskId,
      author: req.user._id,
      body,
    });

    await comment.save({ session });

    await ActivityLog.create(
      [
        {
          project: task.project,
          user: req.user._id,
          action: 'comment_added',
          details: `Added comment to task "${task.title}"`,
          task: task._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    await comment.populate('author', 'name email');

    return res.status(201).json({ success: true, comment });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return next(error);
  }
};

// Activity Feed Endpoint (Newest first)
export const getActivityFeed = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const activities = await ActivityLog.find({ project: projectId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('user', 'name email');

    return res.status(200).json({ success: true, activities });
  } catch (error) {
    return next(error);
  }
};
