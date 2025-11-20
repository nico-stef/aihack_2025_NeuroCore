import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Task from '../models/task.js';
import Project from '../models/project.js';
import AICoachLog from '../models/aiCoachLog.js';

const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Cache for available models
let cachedModels = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to get available models
async function getAvailableModels() {
    const now = Date.now();
    
    // Return cached models if still valid
    if (cachedModels && (now - lastFetchTime) < CACHE_DURATION) {
        return cachedModels;
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );

        if (!response.ok) {
            console.error('Failed to fetch models from API');
            // Fallback to default models
            return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        }

        const data = await response.json();
        const models = data.models
            .filter(model => 
                model.supportedGenerationMethods && 
                model.supportedGenerationMethods.includes('generateContent')
            )
            .map(model => model.name.replace('models/', ''));

        cachedModels = models;
        lastFetchTime = now;
        
        console.log('✅ Fetched available models:', models);
        return models;
    } catch (error) {
        console.error('Error fetching models:', error);
        // Fallback to default models
        return ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    }
}

// Get available models endpoint
router.get('/models', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ 
                message: 'AI Coach not configured - no API key',
                availableModels: [],
                recommended: null
            });
        }

        // Fetch actual available models from Google API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch models: ${response.statusText}`);
        }

        const data = await response.json();
        const allModels = data.models || [];
        
        // Filter models that support generateContent
        const availableModels = allModels
            .filter(model => 
                model.supportedGenerationMethods && 
                model.supportedGenerationMethods.includes('generateContent')
            )
            .map(model => model.name.replace('models/', ''));

        console.log('📋 Available Gemini models:', availableModels);

        res.json({ 
            availableModels,
            recommended: availableModels[0] || null,
            totalModels: allModels.length,
            message: availableModels.length > 0 
                ? `${availableModels.length} model(s) available for text generation` 
                : 'No models available for text generation.'
        });
    } catch (error) {
        console.error('Error checking models:', error);
        res.status(500).json({ 
            message: 'Failed to check available models',
            error: error.message,
            availableModels: []
        });
    }
});

// Chat with AI Coach about a task
router.post('/chat', async (req, res) => {
    try {
        const { taskId, message, conversationHistory } = req.body;

        if (!message || !taskId) {
            return res.status(400).json({ message: 'Message and taskId are required' });
        }

        // Check if Gemini API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({ 
                message: 'AI Coach is not configured. Please add GEMINI_API_KEY to environment variables.',
                response: 'I apologize, but I am currently unavailable. Please configure the Gemini API key to use the AI Coach feature.'
            });
        }

        // Fetch task details with populated relations
        const task = await Task.findById(taskId)
            .populate('projectId')
            .populate('assignedTo', '-password')
            .populate('createdBy', '-password');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const project = task.projectId;

        // Build context for AI
        const taskContext = `
Task Information:
- Title: ${task.title}
- Description: ${task.description || 'No description provided'}
- Status: ${task.status}
- Priority: ${task.priority}
- Estimated Hours: ${task.estimateHours || 0}
- Actual Hours Logged: ${task.realHours || 0}
- Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}
- Assigned To: ${task.assignedTo?.name || 'Unassigned'}

Project Context:
- Project Name: ${project?.name || 'Unknown'}
- Project Description: ${project?.description || 'No description'}
- Project Status: ${project?.status || 'Unknown'}
${project?.githubLink ? `- GitHub Repository: ${project.githubLink}` : ''}

Your Role:
You are an AI Coach helping software developers with their tasks. Provide practical, actionable advice based on the task context.

IMPORTANT FORMATTING RULES:
- Use **Markdown formatting** for better readability
- Use **bold** for important terms and concepts
- Use *italic* for emphasis
- Structure your response with clear sections using headings (## or ###)
- Use numbered lists (1., 2., 3.) for sequential steps
- Use bullet points (- or *) for non-sequential items
- Use \`code blocks\` for inline code, function names, or technical terms
- Use code blocks with triple backticks for longer code examples
- Use > blockquotes for important notes or warnings
- Keep paragraphs short and scannable
- Add emojis occasionally for visual appeal (✅, 💡, ⚠️, 🎯, 🔧, 📝)

Focus on:
1. Breaking down complex tasks into manageable steps
2. Suggesting best practices and approaches
3. Identifying potential challenges and solutions
4. Recommending resources or tools when relevant
5. Providing motivation and support

Current Progress:
- Time spent: ${task.realHours || 0}h out of ${task.estimateHours || 0}h estimated
- Status: ${task.status}
${task.realHours > task.estimateHours ? '⚠️ Task is over estimated time' : ''}
`;

        // Build conversation context
        let conversationContext = '';
        if (conversationHistory && conversationHistory.length > 0) {
            conversationContext = '\n\nPrevious Conversation:\n';
            conversationHistory.forEach((msg) => {
                conversationContext += `${msg.isAI ? 'AI Coach' : 'Developer'}: ${msg.content}\n`;
            });
        }

        // Create prompt for Gemini
        const prompt = `${taskContext}${conversationContext}\n\nDeveloper's Question: ${message}\n\nProvide a helpful, practical response using Markdown formatting for better readability:`;
        
        // Get available models dynamically
        const availableModels = await getAvailableModels();
        
        // Try available models in order until one works
        let aiResponse = null;
        let usedModel = null;
        let lastError = null;

        for (const modelName of availableModels) {
            try {
                console.log(`Trying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = result.response;
                aiResponse = response.text();
                usedModel = modelName;
                console.log(`✅ Successfully used model: ${modelName}`);
                break;
            } catch (error) {
                console.log(`❌ Model ${modelName} failed:`, error.message);
                lastError = error;
                continue;
            }
        }

        if (!aiResponse) {
            throw new Error(lastError?.message || 'All AI models failed. Please check your API key or try again later.');
        }

        // Log the interaction
        try {
            await AICoachLog.create({
                taskId: task._id,
                userId: task.assignedTo?._id,
                userMessage: message,
                aiResponse: aiResponse,
                context: {
                    taskTitle: task.title,
                    taskStatus: task.status,
                    projectName: project?.name
                }
            });
        } catch (logError) {
            console.error('Failed to log AI interaction:', logError);
            // Don't fail the request if logging fails
        }

        res.json({
            response: aiResponse,
            model: usedModel,
            taskContext: {
                title: task.title,
                status: task.status,
                progress: task.estimateHours > 0 ? (task.realHours / task.estimateHours * 100).toFixed(1) : 0
            }
        });

    } catch (error) {
        console.error('AI Coach error:', error);
        
        // Handle specific Gemini API errors
        if (error.message?.includes('API key')) {
            return res.status(503).json({ 
                message: 'Invalid or missing API key',
                response: 'I apologize, but there is an issue with my configuration. Please check the Gemini API key.'
            });
        }

        res.status(500).json({ 
            message: 'Failed to get AI response',
            response: 'I apologize, but I encountered an error. Please try again or reach out to your team for assistance.'
        });
    }
});

// Get AI Coach history for a task
router.get('/history/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params;
        
        const history = await AICoachLog.find({ taskId })
            .sort({ timestamp: 1 })
            .limit(50)
            .populate('userId', 'name username');

        const formattedHistory = history.map(log => ({
            id: log._id,
            userMessage: log.userMessage,
            aiResponse: log.aiResponse,
            timestamp: log.timestamp,
            user: log.userId
        }));

        res.json(formattedHistory);
    } catch (error) {
        console.error('Error fetching AI history:', error);
        res.status(500).json({ message: 'Failed to fetch conversation history' });
    }
});

export default router;
