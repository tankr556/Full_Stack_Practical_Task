import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Error: Admin credentials are not set in environment variables');
      process.exit(1);
    }

    // Check if admin email already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin user with email ${adminEmail} already exists. Skipping seeding.`);
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create the admin user
    const adminUser = new User({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: adminPassword,
      role: 'admin',
    });

    // Create or find default project
    let project = await Project.findOne({ name: 'Default Practical Project' });
    if (!project) {
      project = new Project({
        name: 'Default Practical Project',
        description: 'Demo project for practical task evaluation',
        createdBy: adminUser._id,
        members: [{ user: adminUser._id, role: 'admin' }],
      });
      await project.save();
      console.log('Default project seeded successfully with ID:', project._id.toString());
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin account:', error.message);
    process.exit(1);
  }
};

seedAdmin();
