import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/Users.js';

dotenv.config();

async function testAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Find test user
        const user = await User.findOne({ email: 'test@example.com' });

        if (user) {
            console.log('User found:');
            console.log('  Email:', user.email);
            console.log('  ID:', user._id);
            console.log('  Admin status in DB:', user.role);

            // Check env
            const admins = (process.env.ADMIN || '').split(',').map(s => s.trim()).filter(Boolean);
            console.log('\nAdmin list from ENV:', admins);
            console.log('Is test@example.com in admin list?', admins.includes(user.email));
        } else {
            console.log('Test user not found');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
    }
}

testAdmin();
