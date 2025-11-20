import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const burnoutSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
    score: { type: Number, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
    week: Number,
    year: Number,
    factors: {
        commitsCount: Number,
        overtimeHours: Number,
        tasksInProgress: Number,
        completedTasks: Number,
        overdueTasks: Number,
        pullRequestsCount: Number,
        aiChatCount: Number,
        missedDeadlines: Number
    },
    analysis: String,
    recommendations: [String],
    modelUsed: String
}, { timestamps: true });

export default model('BurnoutScore', burnoutSchema);
