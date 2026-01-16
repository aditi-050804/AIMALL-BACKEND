import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_ATLAS_URI;

const fixRoles = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Reset gauhar back to user
        await User.updateOne(
            { email: 'gauharifetkhar@gmail.com' },
            { $set: { role: 'user' } }
        );
        console.log('Reverted gauharifetkhar@gmail.com to user role');

        // Ensure aditi is admin
        await User.updateOne(
            { email: 'aditilakhera0@gmail.com' },
            { $set: { role: 'admin' } }
        );
        console.log('Confirmed aditilakhera0@gmail.com is admin role');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixRoles();
