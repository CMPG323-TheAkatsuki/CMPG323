const mongoose = require('mongoose');

const FeedbackSchema = mongoose.Schema(
    {
            user_number:{ // This is the student
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },      
            model_mark:{
                type: Number,
                required: true
            },
            text_feedback:{
                type: String,
                required: true
            },
            submission_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Submission',
                required: true
            }
    }
           

);

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;