const mongoose = require('mongoose');
const userSchema = require('./User').schema;

// The Teacher model is not strictly necessary if you are using a single User model.
// However, if you wanted a separate collection for teachers, you would use this file.
// Based on your `User.js` file, you are using roles to differentiate between users.
// In that case, you don't need a separate Teacher model file.
// I've provided an example of a simple schema just in case.

const teacherSchema = new mongoose.Schema({
  // You could add fields specific to a teacher if they existed
  // For now, it's simpler to use the `User` model with a `role` field.
  // This schema is here for demonstration purposes.
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Teacher', teacherSchema);
