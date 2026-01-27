import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Use the URI from .env or the hardcoded one from previous session logs
const MONGO_URI = process.env.MONGODB_ATLAS_URI || 'mongodb+srv://gurumukhahuja3_db_user:I264cAAGxgT9YcQR@cluster0.selr4is.mongodb.net/AI_MALL';

async function createAdmin() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const email = 'admin@uwo24.com';
        const password = 'admin@123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await mongoose.connection.db.collection('users').updateOne(
            { email: email },
            {
                $set: {
                    name: 'UWO Admin',
                    email: email,
                    password: hashedPassword,
                    role: 'admin',
                    isVendor: false,
                    isVerified: true,
                    updatedAt: new Date()
                },
                $setOnInsert: { createdAt: new Date() }
            },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            console.log(`Successfully created new admin user: ${email}`);
        } else {
            console.log(`Successfully updated existing admin user: ${email}`);
        }

        console.log(`Password set to: ${password}`);
        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
}

createAdmin();
