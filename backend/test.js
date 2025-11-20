import mongoose from "mongoose";
import Task from "./models/task.js";
import dotenv from "dotenv";

dotenv.config();

const projectId = "691ef740f2c3cec2f46d8873";
const aliceId = "691ef50e873ec4ee53b3c108";     // assignedTo
const managerId = "691ef50e873ec4ee53b3c106";   // createdBy

async function seedTasks() {
    await mongoose.connect(process.env.dbURI);
    console.log("Connected to MongoDB\n");

    const tasks = [
        // Septembrie - taskuri vechi completate normal
        {
            projectId,
            title: "Setup project structure",
            description: "Initialize project with proper folder structure and dependencies.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "done",
            priority: "high",
            estimateHours: 4,
            realHours: 4.5,
            startedAt: new Date("2025-09-15T08:00:00.000Z"),
            completedAt: new Date("2025-09-15T12:30:00.000Z"),
            createdAt: new Date("2025-09-14T10:00:00.000Z"),
            dueDate: new Date("2025-09-16T23:59:59.000Z")
        },
        {
            projectId,
            title: "Write API documentation",
            description: "Document all backend endpoints for manager and developer workflows.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "done",
            priority: "low",
            estimateHours: 3,
            realHours: 3.2,
            startedAt: new Date("2025-09-20T09:00:00.000Z"),
            completedAt: new Date("2025-09-20T12:15:00.000Z"),
            createdAt: new Date("2025-09-18T14:00:00.000Z"),
            dueDate: new Date("2025-09-22T23:59:59.000Z")
        },

        // Octombrie - începe să depășească timpul
        {
            projectId,
            title: "Implement user authentication",
            description: "Add JWT-based authentication with login and registration.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "done",
            priority: "high",
            estimateHours: 6,
            realHours: 9.5,
            startedAt: new Date("2025-10-05T08:00:00.000Z"),
            completedAt: new Date("2025-10-05T17:30:00.000Z"),
            createdAt: new Date("2025-10-03T11:00:00.000Z"),
            dueDate: new Date("2025-10-06T23:59:59.000Z")
        },
        {
            projectId,
            title: "Create reusable button component library",
            description: "Develop a reusable button style system with loading states and variants.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "done",
            priority: "medium",
            estimateHours: 3,
            realHours: 5.5,
            startedAt: new Date("2025-10-12T10:00:00.000Z"),
            completedAt: new Date("2025-10-12T15:30:00.000Z"),
            createdAt: new Date("2025-10-10T09:00:00.000Z"),
            dueDate: new Date("2025-10-13T23:59:59.000Z")
        },

        // Noiembrie - BURNOUT evident, multe taskuri, depășiri mari de timp
        // 5 noiembrie - 3 taskuri în aceeași zi (SUPRAÎNCĂRCARE)
        {
            projectId,
            title: "Fix critical login bug",
            description: "Users cannot log in with special characters in password.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "done",
            priority: "high",
            estimateHours: 2,
            realHours: 4.3,
            startedAt: new Date("2025-11-05T08:00:00.000Z"),
            completedAt: new Date("2025-11-05T12:20:00.000Z"),
            createdAt: new Date("2025-11-04T16:00:00.000Z"),
            dueDate: new Date("2025-11-05T12:00:00.000Z") // OVERDUE cu 20 min
        },
        {
            projectId,
            title: "Update user profile UI",
            description: "Redesign profile page with new brand guidelines.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "done",
            priority: "medium",
            estimateHours: 4,
            realHours: 6.8,
            startedAt: new Date("2025-11-05T13:00:00.000Z"),
            completedAt: new Date("2025-11-05T19:48:00.000Z"),
            createdAt: new Date("2025-11-04T10:00:00.000Z"),
            dueDate: new Date("2025-11-06T23:59:59.000Z")
        },
        {
            projectId,
            title: "Implement search feature",
            description: "Add search functionality for tasks and projects with filters.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "done",
            priority: "medium",
            estimateHours: 5,
            realHours: 8.2,
            startedAt: new Date("2025-11-05T20:00:00.000Z"),
            completedAt: new Date("2025-11-06T04:12:00.000Z"), // lucrat până la 4 dimineața!
            createdAt: new Date("2025-11-03T14:00:00.000Z"),
            dueDate: new Date("2025-11-06T23:59:59.000Z")
        },

        // 10 noiembrie - alte 2 taskuri în aceeași zi
        {
            projectId,
            title: "Fix UI bugs on dashboard",
            description: "Resolve layout inconsistencies and alignment issues on smaller screens.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "done",
            priority: "high",
            estimateHours: 3,
            realHours: 5.7,
            startedAt: new Date("2025-11-10T08:00:00.000Z"),
            completedAt: new Date("2025-11-10T13:42:00.000Z"),
            createdAt: new Date("2025-11-08T11:00:00.000Z"),
            dueDate: new Date("2025-11-10T17:00:00.000Z")
        },
        {
            projectId,
            title: "Optimize database queries",
            description: "Improve performance of slow API endpoints.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "done",
            priority: "high",
            estimateHours: 4,
            realHours: 7.5,
            startedAt: new Date("2025-11-10T14:00:00.000Z"),
            completedAt: new Date("2025-11-10T21:30:00.000Z"),
            createdAt: new Date("2025-11-09T09:00:00.000Z"),
            dueDate: new Date("2025-11-11T23:59:59.000Z")
        },

        // 15 noiembrie - task mare cu depășire masivă
        {
            projectId,
            title: "Build analytics chart system",
            description: "Implement chart visualizations for productivity and workload using Recharts.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "done",
            priority: "high",
            estimateHours: 6,
            realHours: 18.3, // DEPĂȘIRE MAJORĂ - burnout clar
            startedAt: new Date("2025-11-15T07:00:00.000Z"),
            completedAt: new Date("2025-11-16T01:20:00.000Z"),
            createdAt: new Date("2025-11-12T10:00:00.000Z"),
            dueDate: new Date("2025-11-16T23:59:59.000Z")
        },

        // 18 noiembrie - task cu deadline depășit, încă în progress
        {
            projectId,
            title: "Refactor sidebar navigation system",
            description: "Rewrite navigation logic and improve accessibility.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "in-progress",
            priority: "high",
            estimateHours: 8,
            startedAt: new Date("2025-11-18T08:00:00.000Z"),
            createdAt: new Date("2025-11-16T14:00:00.000Z"),
            dueDate: new Date("2025-11-19T23:59:59.000Z") // OVERDUE - ieri!
        },

        // 19 noiembrie - task de azi, to-do cu deadline astăzi (va fi OVERDUE)
        {
            projectId,
            title: "Write unit tests for auth module",
            description: "Add comprehensive test coverage for authentication endpoints.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "to-do",
            priority: "medium",
            estimateHours: 5,
            createdAt: new Date("2025-11-17T10:00:00.000Z"),
            dueDate: new Date("2025-11-20T12:00:00.000Z") // OVERDUE dacă e după ora 12
        },

        // 20 noiembrie - taskuri de astăzi
        {
            projectId,
            title: "Deploy to production",
            description: "Deploy latest changes to production environment.",
            assignedTo: aliceId,
            createdBy: managerId,
            status: "to-do",
            priority: "high",
            estimateHours: 3,
            createdAt: new Date("2025-11-19T15:00:00.000Z"),
            dueDate: new Date("2025-11-21T23:59:59.000Z")
        }
    ];

    await Task.insertMany(tasks);

    console.log("Inserted tasks successfully!");
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
}

seedTasks().catch(err => {
    console.error(err);
    mongoose.disconnect();
});
