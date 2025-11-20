import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/user.js';
import Project from './models/project.js';
import Task from './models/task.js';
import Team from './models/team.js';

dotenv.config();

const dbURI = process.env.dbURI;

const seedDatabase = async () => {
    try {
        await mongoose.connect(dbURI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Team.deleteMany({});
        console.log('Cleared existing data');

        // Create users
        const hashedPassword = await bcrypt.hash('password', 10);
        
        const admin = await User.create({
            name: 'Admin User',
            username: 'admin',
            email: 'admin@company.com',
            password: hashedPassword,
            role: 'superadmin'
        });

        const manager = await User.create({
            name: 'John Manager',
            username: 'manager1',
            email: 'manager@company.com',
            password: hashedPassword,
            role: 'manager'
        });

        const dev1 = await User.create({
            name: 'Alice Developer',
            username: 'alice',
            email: 'alice@company.com',
            password: hashedPassword,
            role: 'developer',
            githubUsername: 'alice-dev'
        });

        const dev2 = await User.create({
            name: 'Bob Developer',
            username: 'bob',
            email: 'bob@company.com',
            password: hashedPassword,
            role: 'developer',
            githubUsername: 'bob-dev'
        });

        const tester = await User.create({
            name: 'Carol Tester',
            username: 'carol',
            email: 'carol@company.com',
            password: hashedPassword,
            role: 'tester'
        });

        console.log('Created users');

        // Create team
        const team = await Team.create({
            name: 'Development Team',
            managerId: manager._id,
            members: [dev1._id, dev2._id, tester._id]
        });

        // Update users with team
        await User.updateMany(
            { _id: { $in: [manager._id, dev1._id, dev2._id, tester._id] } },
            { teamId: team._id }
        );

        console.log('Created team');

        // Create projects
        const project1 = await Project.create({
            name: 'E-commerce Platform',
            description: 'A modern e-commerce solution with React and Node.js',
            githubLink: 'https://github.com/company/ecommerce',
            teamId: team._id,
            members: [dev1._id, dev2._id, tester._id],
            status: 'active'
        });

        const project2 = await Project.create({
            name: 'Mobile App Backend',
            description: 'REST API for mobile applications',
            githubLink: 'https://github.com/company/mobile-backend',
            teamId: team._id,
            members: [dev1._id, dev2._id],
            status: 'active'
        });

        const project3 = await Project.create({
            name: 'Analytics Dashboard',
            description: 'Real-time analytics and reporting system',
            githubLink: 'https://github.com/company/analytics',
            teamId: team._id,
            members: [dev2._id, tester._id],
            status: 'active'
        });

        console.log('Created projects');

        // Create tasks
        const tasks = [
            {
                projectId: project1._id,
                title: 'Implement user authentication',
                description: 'Add JWT-based authentication system',
                assignedTo: dev1._id,
                createdBy: manager._id,
                status: 'in-progress',
                priority: 'high',
                estimateHours: 16,
                realHours: 12,
                dueDate: new Date('2024-11-25')
            },
            {
                projectId: project1._id,
                title: 'Design product catalog UI',
                description: 'Create responsive product listing and detail pages',
                assignedTo: dev2._id,
                createdBy: manager._id,
                status: 'done',
                priority: 'high',
                estimateHours: 20,
                realHours: 18,
                dueDate: new Date('2024-11-20')
            },
            {
                projectId: project1._id,
                title: 'Setup payment gateway',
                description: 'Integrate Stripe payment processing',
                assignedTo: dev1._id,
                createdBy: manager._id,
                status: 'to-do',
                priority: 'high',
                estimateHours: 12,
                realHours: 0,
                dueDate: new Date('2024-11-30')
            },
            {
                projectId: project2._id,
                title: 'API rate limiting',
                description: 'Implement rate limiting middleware',
                assignedTo: dev2._id,
                createdBy: manager._id,
                status: 'in-progress',
                priority: 'medium',
                estimateHours: 8,
                realHours: 6,
                dueDate: new Date('2024-11-22')
            },
            {
                projectId: project2._id,
                title: 'Database optimization',
                description: 'Optimize slow queries and add indexes',
                assignedTo: tester._id,
                createdBy: manager._id,
                status: 'done',
                priority: 'high',
                estimateHours: 10,
                realHours: 11,
                dueDate: new Date('2024-11-24')
            },
            {
                projectId: project3._id,
                title: 'Create data visualization charts',
                description: 'Implement interactive charts using Recharts',
                assignedTo: tester._id,
                createdBy: manager._id,
                status: 'in-progress',
                priority: 'medium',
                estimateHours: 16,
                realHours: 10,
                dueDate: new Date('2024-11-28')
            }
        ];

        await Task.insertMany(tasks);
        console.log('Created tasks');

        console.log('✅ Database seeded successfully!');
        console.log('\nCredentials for testing:');
        console.log('Admin: username=admin, password=password');
        console.log('Manager: username=manager1, password=password');
        console.log('Developer: username=alice, password=password');
        console.log('Developer: username=bob, password=password');
        console.log('Tester: username=carol, password=password');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
