import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_ATLAS_URI;

const checkUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const accounts = await User.find({
            email: { $in: ['gauharifetkhar@gmail.com', 'aditilakhera0@gmail.com'] }
        });

        console.log('User Accounts Found:');
        accounts.forEach(a => {
            console.log(`- Email: ${a.email}, Role: ${a.role}, isVendor: ${a.isVendor}, Name: ${a.name}`);
        });

        const approvedVendors = await User.find({ isVendor: true, vendorStatus: 'approved' });
        console.log(`Approved Vendors in DB: ${approvedVendors.length}`);
        approvedVendors.forEach(v => {
            console.log(`- Vendor: ${v.name}, Status: ${v.vendorStatus}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

checkUsers();
