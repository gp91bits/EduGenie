import jwt from 'jsonwebtoken';
import { connectDB } from './conf/database.js';
import User from './models/Users.js';
import dotenv from 'dotenv';

dotenv.config();

const testAPI = async () => {
    try {
        await connectDB();

        // Find test user
        const user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            console.error('Test user not found');
            process.exit(1);
        }

        console.log('Found user:', user.email);
        console.log('User isAdmin:', user.isAdmin);

        // Generate token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Generated token:', token);
        console.log('\nMake this request:');
        console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/subjectNotes/getAllNotes`);

        // Test fetch
        const response = await fetch(
            'http://localhost:3000/api/subjectNotes/getAllNotes',
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            }
        );

        console.log('\n\nAPI Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testAPI();
