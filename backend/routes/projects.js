import express from 'express';
import Project from '../models/project.js';
import Task from '../models/task.js';

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('teamId')
            .populate('members', '-password');
        
        res.json(projects.map(project => ({
            id: project._id,
            name: project.name,
            description: project.description,
            githubUrl: project.githubLink,
            members: project.members.map(m => m._id.toString()),
            teamId: project.teamId,
            status: project.status,
            createdAt: project.createdAt
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get project by ID
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('teamId')
            .populate('members', '-password');
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json({
            id: project._id,
            name: project.name,
            description: project.description,
            githubUrl: project.githubLink,
            members: project.members,
            teamId: project.teamId,
            status: project.status,
            createdAt: project.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create project
router.post('/', async (req, res) => {
    try {
        const { name, description, githubLink, teamId, members } = req.body;
        const project = new Project({
            name,
            description,
            githubLink,
            teamId,
            members
        });
        
        await project.save();
        
        res.status(201).json({
            id: project._id,
            name: project.name,
            description: project.description,
            githubUrl: project.githubLink,
            members: project.members,
            teamId: project.teamId,
            status: project.status,
            createdAt: project.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update project
router.put('/:id', async (req, res) => {
    try {
        const { name, description, githubLink, teamId, members, status } = req.body;
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { name, description, githubLink, teamId, members, status },
            { new: true }
        ).populate('members', '-password');
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        res.json({
            id: project._id,
            name: project.name,
            description: project.description,
            githubUrl: project.githubLink,
            members: project.members,
            teamId: project.teamId,
            status: project.status,
            createdAt: project.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        
        // Also delete all tasks associated with this project
        await Task.deleteMany({ projectId: req.params.id });
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
