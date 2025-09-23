const mongoose = require('mongoose');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');

// Import your Class model
const Class = require('./models/Class');

const dbUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/teacher_app';

mongoose.connect(dbUrl)
    .then(() => console.log('✅ MongoDB connected successfully for migration.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

const updateClassDocuments = async () => {
    try {
        // Find all documents in the 'classes' collection that are missing the 'classCode' field
        const classesToUpdate = await Class.find({ classCode: { $exists: false } });

        console.log(`Found ${classesToUpdate.length} classes to update.`);

        for (const classDoc of classesToUpdate) {
            // Generate a new UUID for each class and save it
            classDoc.classCode = uuidv4();
            await classDoc.save();
            console.log(`Updated class with ID: ${classDoc._id} with new classCode.`);
        }

        console.log('✅ Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        // Disconnect from the database after the script finishes
        mongoose.disconnect();
    }
};

// Run the migration function
updateClassDocuments();