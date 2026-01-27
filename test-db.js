import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_ATLAS_URI;

const testConnection = async () => {
    try {
        const DIRECT_URI = "mongodb://gurumukhahuja3_db_user:I264cAAGxgT9YcQR@ac-dskxu0w-shard-00-00.selr4is.mongodb.net:27017,ac-dskxu0w-shard-00-01.selr4is.mongodb.net:27017,ac-dskxu0w-shard-00-02.selr4is.mongodb.net:27017/AI_MALL?ssl=true&authSource=admin&retryWrites=true&w=majority";
        console.log('Connecting to direct nodes...');
        await mongoose.connect(DIRECT_URI);
        console.log('✅ Connected to MongoDB');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const userCount = await User.countDocuments();
        console.log('User count:', userCount);

        const user = await User.findOne({ email: 'aditilakhera0@gmail.com' });
        if (user) {
            console.log('✅ Found admin user:', user.email);
        } else {
            console.log('❌ Admin user not found');
        }

    } catch (error) {
        console.error('❌ Connection error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

testConnection();
