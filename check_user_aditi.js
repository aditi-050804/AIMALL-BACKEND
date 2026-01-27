import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

async function check() {
    await mongoose.connect(process.env.MONGODB_ATLAS_URI);
    const user = await User.findOne({ email: 'aditilakhera0@gmail.com' });
    console.log('USER DATA:', JSON.stringify(user, null, 2));
    process.exit(0);
}

check();
