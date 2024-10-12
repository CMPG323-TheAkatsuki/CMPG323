const mongoose = require('mongoose');

const FeedbackSchema = mongoose.Schema(
    {
            student:{ // This is the student
                type: mongoose.Schema.Types.String,
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
            module_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Module',
                required: true
            }
    }
           

);

const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = Feedback;