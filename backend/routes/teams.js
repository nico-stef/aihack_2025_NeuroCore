import express from 'express';
import Team from '../models/team.js';

const router = express.Router();

// Get all teams
router.get('/', async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('managerId', '-password')
            .populate('members', '-password');
        
        res.json(teams.map(team => ({
            id: team._id,
            name: team.name,
            managerId: team.managerId,
            members: team.members,
            createdAt: team.createdAt
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get team by ID
router.get('/:id', async (req, res) => {
    try {
        const team = await Team.findById(req.params.id)
            .populate('managerId', '-password')
            .populate('members', '-password');
        
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        
        res.json({
            id: team._id,
            name: team.name,
            managerId: team.managerId,
            members: team.members,
            createdAt: team.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create team
router.post('/', async (req, res) => {
    try {
        const { name, managerId, members } = req.body;
        const team = new Team({ name, managerId, members });
        await team.save();
        
        await team.populate('managerId', '-password');
        await team.populate('members', '-password');
        
        res.status(201).json({
            id: team._id,
            name: team.name,
            managerId: team.managerId,
            members: team.members,
            createdAt: team.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update team
router.put('/:id', async (req, res) => {
    try {
        const { name, managerId, members } = req.body;
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            { name, managerId, members },
            { new: true }
        )
        .populate('managerId', '-password')
        .populate('members', '-password');
        
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        
        res.json({
            id: team._id,
            name: team.name,
            managerId: team.managerId,
            members: team.members,
            createdAt: team.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove member from team
router.delete('/:teamId/members/:userId', async (req, res) => {
    try {
        const { teamId, userId } = req.params;
        
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        
        // Remove user from team members array
        team.members = team.members.filter(memberId => memberId.toString() !== userId);
        await team.save();
        
        // Also remove teamId from user
        const User = (await import('../models/user.js')).default;
        await User.findByIdAndUpdate(userId, { teamId: null });
        
        await team.populate('managerId', '-password');
        await team.populate('members', '-password');
        
        res.json({
            message: 'Member removed from team successfully',
            team: {
                id: team._id,
                name: team.name,
                managerId: team.managerId,
                members: team.members,
                createdAt: team.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete team
router.delete('/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
