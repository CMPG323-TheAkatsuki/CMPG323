const mongoose = require('mongoose');

const UserSchema = mongoose.Schema(
    {
            name:{
                type: String,
                required: true
            },
            surname:{
                type: String,
                required: true
            },
            user_number: {
                type: String,
                required: true,
                unique: true
            },
            phone: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            password:{
                type: String,
                required: true
            },
            role: { // Add a role field to define user roles
                type: String,
                enum: ['admin', 'lecturer', 'student'], // Possible roles
                default: 'student' // Default role is 'student'
            }
    }

);

const User = mongoose.model('User', UserSchema);

module.exports = User;