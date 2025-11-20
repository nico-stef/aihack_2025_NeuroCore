import express from 'express';
import Task from '../models/task.js';

const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const { projectId, assignedTo, status } = req.query;
        const filter = {};

        if (projectId) filter.projectId = projectId;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (status) filter.status = status;

        const tasks = await Task.find(filter)
            .populate('projectId')
            .populate('assignedTo', '-password')
            .populate('createdBy', '-password');

        res.json(tasks.map(task => ({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status === 'to-do' ? 'todo' : task.status,
            priority: task.priority,
            assigneeId: task.assignedTo?._id.toString(),
            projectId: task.projectId._id.toString(),
            estimatedHours: task.estimateHours || 0,
            actualHours: task.realHours || 0,
            startedAt: task.startedAt,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            dueDate: task.dueDate || task.createdAt
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get task by ID
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('projectId')
            .populate('assignedTo', '-password')
            .populate('createdBy', '-password');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status === 'to-do' ? 'todo' : task.status,
            priority: task.priority,
            assigneeId: task.assignedTo?._id.toString(),
            assignee: task.assignedTo,
            projectId: task.projectId._id.toString(),
            project: task.projectId,
            estimatedHours: task.estimateHours || 0,
            actualHours: task.realHours || 0,
            startedAt: task.startedAt,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            createdBy: task.createdBy,
            dueDate: task.dueDate || task.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create task
router.post('/', async (req, res) => {
    try {
        const { projectId, title, description, assignedTo, createdBy, status, priority, estimateHours, realHours, dueDate } = req.body;

        const task = new Task({
            projectId,
            title,
            description,
            assignedTo,
            createdBy,
            status: status === 'todo' ? 'to-do' : status,
            priority,
            estimateHours,
            realHours,
            dueDate
        });

        await task.save();
        await task.populate('projectId');
        await task.populate('assignedTo', '-password');

        res.status(201).json({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status === 'to-do' ? 'todo' : task.status,
            priority: task.priority,
            assigneeId: task.assignedTo?._id.toString(),
            projectId: task.projectId._id.toString(),
            estimatedHours: task.estimateHours || 0,
            actualHours: task.realHours || 0,
            startedAt: task.startedAt,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            dueDate: task.dueDate || task.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update task status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['to-do', 'in-progress', 'done', 'todo'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const normalizedStatus = status === 'todo' ? 'to-do' : status;
        const updateData = { status: normalizedStatus };

        // Set timestamps based on status change
        if (normalizedStatus === 'in-progress') {
            updateData.startedAt = new Date();
        } else if (normalizedStatus === 'done') {
            updateData.completedAt = new Date();

            // Calculate actual hours if task has startedAt
            const existingTask = await Task.findById(req.params.id);
            if (existingTask && existingTask.startedAt) {
                const durationMs = updateData.completedAt - existingTask.startedAt;
                const durationHours = durationMs / (1000 * 60 * 60);
                updateData.realHours = Math.round(durationHours * 10) / 10; // Round to 1 decimal
            }
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .populate('projectId')
            .populate('assignedTo', '-password')
            .populate('createdBy', '-password');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status === 'to-do' ? 'todo' : task.status,
            priority: task.priority,
            assigneeId: task.assignedTo?._id.toString(),
            assignee: task.assignedTo,
            projectId: task.projectId._id.toString(),
            project: task.projectId,
            estimatedHours: task.estimateHours || 0,
            actualHours: task.realHours || 0,
            startedAt: task.startedAt,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            createdBy: task.createdBy,
            dueDate: task.dueDate || task.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update task
router.put('/:id', async (req, res) => {
    try {
        const { title, description, status, priority, assignedTo, estimateHours, realHours, dueDate } = req.body;

        const updateData = { title, description, priority, assignedTo, estimateHours, realHours, dueDate };
        if (status) {
            updateData.status = status === 'todo' ? 'to-do' : status;
        }

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        )
            .populate('projectId')
            .populate('assignedTo', '-password')
            .populate('createdBy', '-password');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json({
            id: task._id,
            title: task.title,
            description: task.description,
            status: task.status === 'to-do' ? 'todo' : task.status,
            priority: task.priority,
            assigneeId: task.assignedTo?._id.toString(),
            assignee: task.assignedTo,
            projectId: task.projectId._id.toString(),
            project: task.projectId,
            estimatedHours: task.estimateHours || 0,
            actualHours: task.realHours || 0,
            startedAt: task.startedAt,
            completedAt: task.completedAt,
            createdAt: task.createdAt,
            createdBy: task.createdBy,
            dueDate: task.dueDate || task.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
