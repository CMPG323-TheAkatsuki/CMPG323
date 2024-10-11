const mongoose = require('mongoose');

const AssignmentSchema = mongoose.Schema(
    {
            assignment_name:{
                type: String,
                required: true
            },
            description:{
                type: String,
                required: true
            },
            due_date:{
                type: Date,
                required: true
            },
            module: {
                type: String,
                required: true
                
            },
            lecturer_id: { // Store the user_number instead of ObjectId
                type: String, // Assuming user_number is a string in User schema
                ref: 'User',  // Reference the User model
                required: true
            }    
        
    }

);

const Assignment = mongoose.model('Assignment', AssignmentSchema);

module.exports = Assignment;