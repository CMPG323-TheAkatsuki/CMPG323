const mongoose = require('mongoose');

const FeedbackSchema = mongoose.Schema(
    {
            student:{ // This is the student
                type: mongoose.Schema.Types.String,
                ref: 'User',
                required: true
            },      
            assignment_mark:{
                type: Number,
                required: true
            },
            text_feedback:{
                type: String,
                required: true
            },
            module: {
                type: mongoose.Schema.Types.String,
                ref: 'Module',
                required: true
            },
            assignment_id:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Assignment',
                required: true
            }
    }
           

);

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;