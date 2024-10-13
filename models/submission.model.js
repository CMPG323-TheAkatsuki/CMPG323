const mongoose = require('mongoose');

const SubmissionSchema = mongoose.Schema(
    {
          
            assignment:{ // Need reference for the assignment details
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Assignment',
                required: true
            },
            video:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video',
                required: true

            },
            submitter:{ // Need reference for the user that submitted the assignment
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
    }

);

const Submission = mongoose.model('Submission', SubmissionSchema);

module.exports = Submission;