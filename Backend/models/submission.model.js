const mongoose = require('mongoose');

const SubmissionSchema = mongoose.Schema(
    {
        assignment_id:{ // Need reference for the assignment details
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assignment',
            required: true
        },
        videoUrl: { // going to store it in the apache server
            type: String,  // URL or file path where the video is stored
            required: true
        },
        videoFileName: {
            type: String,  // Name of the video file
            required: true
        },
        videoFileType: {
            type: String,  // e.g., 'mp4', 'mkv', 'avi'
            required: true
        },
        videoSize: {
            type: Number,  // Size in bytes
            required: true
        },
        uploadDate: {
            type: Date,
            default: Date.now  // Automatically set the upload date
        },
        submitter_id:{ // Need reference for the user that submitted the assignment
            type: mongoose.Schema.Types.String,
            ref: 'User',
            required: true
        }
    }
);

const Submission = mongoose.model('Submission', SubmissionSchema);

module.exports = Submission;
