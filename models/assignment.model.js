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
            lecturer: { // Store the user_number instead of ObjectId
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }    
        
    }

);

const Assignment = mongoose.model('Assignment', AssignmentSchema);

module.exports = Assignment;