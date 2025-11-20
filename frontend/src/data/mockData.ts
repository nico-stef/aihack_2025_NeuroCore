import { User } from "@/contexts/AuthContext";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high";
  assigneeId: string;
  projectId: string;
  estimatedHours: number;
  actualHours: number;
  createdAt: string;
  dueDate: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  githubUrl: string;
  members: string[];
  createdAt: string;
}

export interface GitHubActivity {
  commits: number;
  pullRequests: number;
  issues: number;
  lastCommit: string;
  recentCommits: {
    message: string;
    author: string;
    date: string;
  }[];
}

export const mockProjects: Project[] = [
  {
    id: "p1",
    name: "E-commerce Platform",
    description: "A modern e-commerce solution with React and Node.js",
    githubUrl: "https://github.com/company/ecommerce",
    members: ["3", "4", "5"],
    createdAt: "2024-01-15",
  },
  {
    id: "p2",
    name: "Mobile App Backend",
    description: "REST API for mobile applications",
    githubUrl: "https://github.com/company/mobile-backend",
    members: ["3", "4"],
    createdAt: "2024-02-01",
  },
  {
    id: "p3",
    name: "Analytics Dashboard",
    description: "Real-time analytics and reporting system",
    githubUrl: "https://github.com/company/analytics",
    members: ["4", "5"],
    createdAt: "2024-03-10",
  },
];

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Implement user authentication",
    description: "Add JWT-based authentication system",
    status: "in-progress",
    priority: "high",
    assigneeId: "3",
    projectId: "p1",
    estimatedHours: 16,
    actualHours: 12,
    createdAt: "2024-11-01",
    dueDate: "2024-11-25",
  },
  {
    id: "t2",
    title: "Design product catalog UI",
    description: "Create responsive product listing and detail pages",
    status: "done",
    priority: "high",
    assigneeId: "4",
    projectId: "p1",
    estimatedHours: 20,
    actualHours: 18,
    createdAt: "2024-11-05",
    dueDate: "2024-11-20",
  },
  {
    id: "t3",
    title: "Setup payment gateway",
    description: "Integrate Stripe payment processing",
    status: "todo",
    priority: "high",
    assigneeId: "3",
    projectId: "p1",
    estimatedHours: 12,
    actualHours: 0,
    createdAt: "2024-11-10",
    dueDate: "2024-11-30",
  },
  {
    id: "t4",
    title: "API rate limiting",
    description: "Implement rate limiting middleware",
    status: "in-progress",
    priority: "medium",
    assigneeId: "4",
    projectId: "p2",
    estimatedHours: 8,
    actualHours: 6,
    createdAt: "2024-11-08",
    dueDate: "2024-11-22",
  },
  {
    id: "t5",
    title: "Database optimization",
    description: "Optimize slow queries and add indexes",
    status: "review",
    priority: "high",
    assigneeId: "5",
    projectId: "p2",
    estimatedHours: 10,
    actualHours: 11,
    createdAt: "2024-11-12",
    dueDate: "2024-11-24",
  },
  {
    id: "t6",
    title: "Create data visualization charts",
    description: "Implement interactive charts using Recharts",
    status: "in-progress",
    priority: "medium",
    assigneeId: "5",
    projectId: "p3",
    estimatedHours: 16,
    actualHours: 10,
    createdAt: "2024-11-15",
    dueDate: "2024-11-28",
  },
];

export const mockGitHubActivity: Record<string, GitHubActivity> = {
  p1: {
    commits: 124,
    pullRequests: 18,
    issues: 7,
    lastCommit: "2 hours ago",
    recentCommits: [
      { message: "feat: add product filtering", author: "Alice Developer", date: "2 hours ago" },
      { message: "fix: resolve cart calculation bug", author: "Bob Developer", date: "5 hours ago" },
      { message: "docs: update API documentation", author: "Alice Developer", date: "1 day ago" },
    ],
  },
  p2: {
    commits: 89,
    pullRequests: 12,
    issues: 4,
    lastCommit: "4 hours ago",
    recentCommits: [
      { message: "feat: implement rate limiting", author: "Bob Developer", date: "4 hours ago" },
      { message: "refactor: improve error handling", author: "Carol Developer", date: "1 day ago" },
      { message: "test: add integration tests", author: "Bob Developer", date: "2 days ago" },
    ],
  },
  p3: {
    commits: 67,
    pullRequests: 9,
    issues: 3,
    lastCommit: "1 day ago",
    recentCommits: [
      { message: "feat: add real-time updates", author: "Carol Developer", date: "1 day ago" },
      { message: "style: improve chart styling", author: "Carol Developer", date: "2 days ago" },
      { message: "fix: resolve data refresh issue", author: "Bob Developer", date: "3 days ago" },
    ],
  },
};

export const mockBurnoutData = {
  score: 62,
  trend: "increasing",
  weeklyHours: [38, 42, 45, 48, 52, 50, 54],
  recommendations: [
    "Consider redistributing tasks to balance workload",
    "Schedule regular breaks throughout the day",
    "Review upcoming deadlines and adjust if possible",
  ],
};
