import express from 'express';
import BurnoutScore from '../models/burnoutScore.js';

const router = express.Router();

// Get burnout scores
router.get('/', async (req, res) => {
    try {
        const { userId, week, year } = req.query;
        const filter = {};
        
        if (userId) filter.userId = userId;
        if (week) filter.week = parseInt(week);
        if (year) filter.year = parseInt(year);
        
        const burnoutScores = await BurnoutScore.find(filter).populate('userId', '-password');
        res.json(burnoutScores);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get burnout score by ID
router.get('/:id', async (req, res) => {
    try {
        const burnoutScore = await BurnoutScore.findById(req.params.id).populate('userId', '-password');
        if (!burnoutScore) {
            return res.status(404).json({ message: 'Burnout score not found' });
        }
        res.json(burnoutScore);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create burnout score
router.post('/', async (req, res) => {
    try {
        const { userId, score, week, year, factors } = req.body;
        const burnoutScore = new BurnoutScore({ userId, score, week, year, factors });
        await burnoutScore.save();
        await burnoutScore.populate('userId', '-password');
        res.status(201).json(burnoutScore);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update burnout score
router.put('/:id', async (req, res) => {
    try {
        const { score, week, year, factors } = req.body;
        const burnoutScore = await BurnoutScore.findByIdAndUpdate(
            req.params.id,
            { score, week, year, factors },
            { new: true }
        ).populate('userId', '-password');
        
        if (!burnoutScore) {
            return res.status(404).json({ message: 'Burnout score not found' });
        }
        res.json(burnoutScore);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete burnout score
router.delete('/:id', async (req, res) => {
    try {
        const burnoutScore = await BurnoutScore.findByIdAndDelete(req.params.id);
        if (!burnoutScore) {
            return res.status(404).json({ message: 'Burnout score not found' });
        }
        res.json({ message: 'Burnout score deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
