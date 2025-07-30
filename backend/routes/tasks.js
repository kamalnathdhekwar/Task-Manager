import express from 'express';
import jwt from 'jsonwebtoken';
import Task from '../models/Task.js';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Add a new task
router.post('/addTask', authenticateToken, async (req, res) => {
  try {
    const { title, description, timestamp, dueDate, category, userName, userEmail } = req.body;

    // Validate required fields
    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Get the next serial number for this user's tasks in the category
    const lastTask = await Task.findOne({ userEmail, category }).sort({ serial: -1 });
    const serial = lastTask ? lastTask.serial + 1 : 1;

    const task = new Task({
      title,
      description,
      timestamp,
      dueDate,
      category: category || 'ToDo',
      userName: userName || req.user.name,
      userEmail: userEmail || req.user.email,
      serial
    });

    const savedTask = await task.save();
    res.status(201).json({ 
      message: 'Task added successfully',
      insertedId: savedTask._id,
      task: savedTask
    });
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get tasks by user email
router.get('/tasks', authenticateToken, async (req, res) => {
  try {
    const { email } = req.query;
    const userEmail = email || req.user.email;

    const tasks = await Task.find({ userEmail }).sort({ category: 1, serial: 1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/tasks/:taskId', authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user owns the task
    if (task.userEmail !== req.user.email) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task order (for drag and drop)
router.put('/tasksUpdateOrder', authenticateToken, async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Tasks array is required' });
    }

    const updatePromises = tasks.map((task, index) => 
      Task.findByIdAndUpdate(task._id, { 
        serial: index + 1,
        category: task.category 
      })
    );

    await Promise.all(updatePromises);
    res.json({ message: 'Task order updated successfully', modifiedCount: tasks.length });
  } catch (error) {
    console.error('Error updating task order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task category and lock status
router.put('/tasksUpdateCategory', authenticateToken, async (req, res) => {
  try {
    const { taskId, category, isLocked } = req.body;
    
    if (!taskId || !category) {
      return res.status(400).json({ message: 'Task ID and category are required' });
    }

    const updateData = { category };
    if (isLocked !== undefined) {
      updateData.isLocked = isLocked;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId, 
      updateData,
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ 
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating task category:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for collaboration features)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 