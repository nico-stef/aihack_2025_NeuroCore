import express from 'express';
import { Octokit } from '@octokit/rest';
import GithubActivity from '../models/githubActivity.js';
import Project from '../models/project.js';
import Task from '../models/task.js';
import User from '../models/user.js';

const router = express.Router();

// Helper function to extract owner and repo from GitHub URL
const parseGithubUrl = (url) => {
    if (!url) return null;
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return { owner: match[1], repo: match[2].replace('.git', '') };
};

// Fetch commits from GitHub API using Octokit
const fetchGithubCommits = async (owner, repo, githubUsername, token) => {
    try {
        if (!token) {
            console.error('No GitHub token provided');
            return [];
        }

        console.log(`Attempting to fetch commits for ${githubUsername} from ${owner}/${repo}`);

        const octokit = new Octokit({
            auth: token
        });

        // Test authentication first
        try {
            const { data: user } = await octokit.rest.users.getAuthenticated();
            console.log(`Authenticated as: ${user.login}`);
        } catch (authError) {
            console.error('Authentication failed:', authError.message);
            throw new Error('GitHub authentication failed. Check token validity.');
        }

        const { data: commits } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            author: githubUsername,
            per_page: 100
        });

        console.log(`✓ Successfully found ${commits.length} commits for ${githubUsername}`);

        return commits.map(commit => ({
            message: commit.commit.message,
            date: new Date(commit.commit.author.date),
            sha: commit.sha,
            author: commit.commit.author.name
        }));
    } catch (error) {
        if (error.status === 404) {
            console.error(`Repository ${owner}/${repo} not found or not accessible`);
        } else if (error.status === 401) {
            console.error('Invalid GitHub token');
        } else if (error.status === 403) {
            console.error('GitHub API rate limit exceeded or access forbidden');
        } else {
            console.error(`Error fetching GitHub commits for ${githubUsername}:`, error.message);
        }
        return [];
    }
};

// Fetch pull requests from GitHub API using Octokit
const fetchGithubPullRequests = async (owner, repo, githubUsername, token) => {
    try {
        const octokit = new Octokit({
            auth: token
        });

        const { data: prs } = await octokit.rest.pulls.list({
            owner,
            repo,
            state: 'all',
            per_page: 100
        });

        const userPRs = prs.filter(pr => pr.user.login === githubUsername);
        console.log(`Found ${userPRs.length} PRs for ${githubUsername}`);

        return userPRs.map(pr => ({
            title: pr.title,
            url: pr.html_url,
            state: pr.state,
            openedAt: new Date(pr.created_at),
            closedAt: pr.closed_at ? new Date(pr.closed_at) : null
        }));
    } catch (error) {
        console.error(`Error fetching GitHub pull requests for ${githubUsername}:`, error.message);
        return [];
    }
};

// Fetch repository statistics using Octokit
const fetchRepoStats = async (owner, repo, token) => {
    try {
        const octokit = new Octokit({
            auth: token
        });

        const [repoData, contributors] = await Promise.all([
            octokit.rest.repos.get({ owner, repo }),
            octokit.rest.repos.listContributors({ owner, repo, per_page: 100 })
        ]);

        return {
            name: repoData.data.name,
            description: repoData.data.description,
            stars: repoData.data.stargazers_count,
            forks: repoData.data.forks_count,
            openIssues: repoData.data.open_issues_count,
            contributors: contributors.data.length,
            language: repoData.data.language
        };
    } catch (error) {
        console.error('Error fetching repository stats:', error.message);
        return null;
    }
};

// Calculate burnout risk based on commits and tasks
const calculateBurnoutRisk = (commits, activeTasks, completedTasks) => {
    let riskScore = 0;

    // High number of commits in short period
    if (commits > 50) riskScore += 40;
    else if (commits > 30) riskScore += 25;
    else if (commits > 15) riskScore += 10;

    // High number of active tasks
    if (activeTasks > 8) riskScore += 35;
    else if (activeTasks > 5) riskScore += 20;
    else if (activeTasks > 3) riskScore += 10;

    // High task completion rate (might indicate overwork)
    if (completedTasks > 20) riskScore += 25;
    else if (completedTasks > 15) riskScore += 15;
    else if (completedTasks > 10) riskScore += 5;

    return Math.min(riskScore, 100);
};

// Get GitHub statistics for a project
router.get('/project/:projectId/stats', async (req, res) => {
    try {
        const { projectId } = req.params;
        const { sync } = req.query;

        const project = await Project.findById(projectId)
            .populate('members', 'name email role githubUsername')
            .populate('teamId');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Get manager's GitHub token from team
        const manager = await User.findById(project.teamId?.managerId);
        const githubToken = manager?.githubToken;

        // Parse GitHub URL
        const githubInfo = parseGithubUrl(project.githubLink);

        // If sync is requested and GitHub URL is valid, fetch fresh data
        if (sync === 'true' && githubInfo && githubToken) {
            const { owner, repo } = githubInfo;

            console.log(`Syncing GitHub data for ${owner}/${repo}`);

            for (const member of project.members) {
                if (member.githubUsername) {
                    console.log(`Fetching data for ${member.githubUsername}`);
                    const [commits, pullRequests] = await Promise.all([
                        fetchGithubCommits(owner, repo, member.githubUsername, githubToken),
                        fetchGithubPullRequests(owner, repo, member.githubUsername, githubToken)
                    ]);

                    await GithubActivity.findOneAndUpdate(
                        { projectId, userId: member._id },
                        {
                            projectId,
                            userId: member._id,
                            commits,
                            pullRequests,
                            issues: [],
                            reviews: [],
                            lastSynced: new Date()
                        },
                        { upsert: true, new: true }
                    );

                    console.log(`Saved ${commits.length} commits and ${pullRequests.length} PRs for ${member.githubUsername}`);
                }
            }
        }

        const memberStats = [];

        for (const member of project.members) {
            // Get GitHub activity
            const githubActivity = await GithubActivity.findOne({
                projectId,
                userId: member._id
            });

            const commits = githubActivity?.commits?.length || 0;
            const pullRequests = githubActivity?.pullRequests?.length || 0;
            const issues = githubActivity?.issues?.length || 0;
            const recentCommits = githubActivity?.commits?.slice(0, 10) || [];

            // Get tasks statistics
            const activeTasks = await Task.countDocuments({
                projectId,
                assignedTo: member._id,
                status: { $in: ['to-do', 'in-progress'] }
            });

            const completedTasks = await Task.countDocuments({
                projectId,
                assignedTo: member._id,
                status: 'done'
            });

            const totalTasks = activeTasks + completedTasks;

            // Calculate burnout risk
            const burnoutRisk = calculateBurnoutRisk(commits, activeTasks, completedTasks);

            // Determine risk level
            let riskLevel = 'low';
            if (burnoutRisk >= 70) riskLevel = 'high';
            else if (burnoutRisk >= 40) riskLevel = 'medium';

            memberStats.push({
                userId: member._id,
                memberName: member.name,
                email: member.email,
                role: member.role,
                githubUsername: member.githubUsername || 'Not set',
                commits,
                pullRequests,
                issues,
                recentCommits,
                activeTasks,
                completedTasks,
                totalTasks,
                burnoutRisk,
                riskLevel,
                lastActivity: githubActivity?.lastSynced || null
            });
        }

        // Sort by burnout risk (highest first)
        memberStats.sort((a, b) => b.burnoutRisk - a.burnoutRisk);

        // Get alerts for high-risk members
        const alerts = memberStats
            .filter(m => m.riskLevel === 'high')
            .map(m => ({
                userId: m.userId,
                memberName: m.memberName,
                message: `${m.memberName} has ${m.activeTasks} active tasks and ${m.commits} commits. High burnout risk detected!`,
                riskLevel: m.riskLevel,
                burnoutRisk: m.burnoutRisk
            }));

        res.json({
            projectId,
            projectName: project.name,
            githubLink: project.githubLink,
            canSync: !!githubInfo && !!githubToken,
            hasToken: !!githubToken,
            memberStats,
            alerts,
            summary: {
                totalMembers: memberStats.length,
                highRisk: memberStats.filter(m => m.riskLevel === 'high').length,
                mediumRisk: memberStats.filter(m => m.riskLevel === 'medium').length,
                lowRisk: memberStats.filter(m => m.riskLevel === 'low').length,
                totalCommits: memberStats.reduce((sum, m) => sum + m.commits, 0),
                totalPullRequests: memberStats.reduce((sum, m) => sum + m.pullRequests, 0),
                totalTasks: memberStats.reduce((sum, m) => sum + m.totalTasks, 0)
            }
        });
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        res.status(500).json({ message: error.message });
    }
});

// Sync GitHub activity for a project
router.post('/sync/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId)
            .populate('members', 'name email role githubUsername')
            .populate('teamId');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const githubInfo = parseGithubUrl(project.githubLink);
        if (!githubInfo) {
            return res.status(400).json({ message: 'Invalid GitHub URL in project' });
        }

        // Get manager's GitHub token
        const manager = await User.findById(project.teamId?.managerId);
        const githubToken = manager?.githubToken;

        if (!githubToken) {
            return res.status(400).json({ message: 'Manager GitHub token not configured' });
        }

        const { owner, repo } = githubInfo;
        const syncResults = [];

        for (const member of project.members) {
            if (member.githubUsername) {
                try {
                    const [commits, pullRequests] = await Promise.all([
                        fetchGithubCommits(owner, repo, member.githubUsername, githubToken),
                        fetchGithubPullRequests(owner, repo, member.githubUsername, githubToken)
                    ]);

                    await GithubActivity.findOneAndUpdate(
                        { projectId, userId: member._id },
                        {
                            projectId,
                            userId: member._id,
                            commits,
                            pullRequests,
                            issues: [],
                            reviews: [],
                            lastSynced: new Date()
                        },
                        { upsert: true, new: true }
                    );

                    syncResults.push({
                        userId: member._id,
                        name: member.name,
                        githubUsername: member.githubUsername,
                        commits: commits.length,
                        pullRequests: pullRequests.length,
                        success: true
                    });
                } catch (error) {
                    syncResults.push({
                        userId: member._id,
                        name: member.name,
                        githubUsername: member.githubUsername,
                        success: false,
                        error: error.message
                    });
                }
            } else {
                syncResults.push({
                    userId: member._id,
                    name: member.name,
                    githubUsername: null,
                    success: false,
                    error: 'No GitHub username set'
                });
            }
        }

        res.json({
            projectId,
            projectName: project.name,
            githubRepo: `${owner}/${repo}`,
            syncedAt: new Date(),
            results: syncResults
        });
    } catch (error) {
        console.error('Error syncing GitHub activity:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get repository statistics using Octokit
router.get('/repo/:projectId/stats', async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId).populate('teamId');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const githubInfo = parseGithubUrl(project.githubLink);
        if (!githubInfo) {
            return res.status(400).json({ message: 'Invalid GitHub URL' });
        }

        // Get manager's GitHub token
        const manager = await User.findById(project.teamId?.managerId);
        const githubToken = manager?.githubToken;

        if (!githubToken) {
            return res.status(400).json({ message: 'Manager GitHub token not configured' });
        }

        const { owner, repo } = githubInfo;
        const repoStats = await fetchRepoStats(owner, repo, githubToken);

        if (!repoStats) {
            return res.status(500).json({ message: 'Failed to fetch repository stats' });
        }

        res.json({
            projectId,
            projectName: project.name,
            githubUrl: project.githubLink,
            repository: repoStats
        });
    } catch (error) {
        console.error('Error fetching repository stats:', error);
        res.status(500).json({ message: error.message });
    }
});

export default router;
