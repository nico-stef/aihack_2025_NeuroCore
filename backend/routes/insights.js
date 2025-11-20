import express from 'express';
import Insight from '../models/insight.js';

const router = express.Router();

// Get insights
router.get('/', async (req, res) => {
    try {
        const { teamId, projectId } = req.query;
        const filter = {};
        
        if (teamId) filter.teamId = teamId;
        if (projectId) filter.projectId = projectId;
        
        const insights = await Insight.find(filter)
            .populate('teamId')
            .populate('projectId')
            .populate('blockedTasks');
        
        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get insight by ID
router.get('/:id', async (req, res) => {
    try {
        const insight = await Insight.findById(req.params.id)
            .populate('teamId')
            .populate('projectId')
            .populate('blockedTasks');
        
        if (!insight) {
            return res.status(404).json({ message: 'Insight not found' });
        }
        res.json(insight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create insight
router.post('/', async (req, res) => {
    try {
        const { teamId, projectId, workloadOverview, estimationVsReality, blockedTasks, githubSummary } = req.body;
        const insight = new Insight({
            teamId,
            projectId,
            workloadOverview,
            estimationVsReality,
            blockedTasks,
            githubSummary
        });
        
        await insight.save();
        await insight.populate('teamId');
        await insight.populate('projectId');
        await insight.populate('blockedTasks');
        
        res.status(201).json(insight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update insight
router.put('/:id', async (req, res) => {
    try {
        const { workloadOverview, estimationVsReality, blockedTasks, githubSummary } = req.body;
        const insight = await Insight.findByIdAndUpdate(
            req.params.id,
            { workloadOverview, estimationVsReality, blockedTasks, githubSummary },
            { new: true }
        )
        .populate('teamId')
        .populate('projectId')
        .populate('blockedTasks');
        
        if (!insight) {
            return res.status(404).json({ message: 'Insight not found' });
        }
        res.json(insight);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete insight
router.delete('/:id', async (req, res) => {
    try {
        const insight = await Insight.findByIdAndDelete(req.params.id);
        if (!insight) {
            return res.status(404).json({ message: 'Insight not found' });
        }
        res.json({ message: 'Insight deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
