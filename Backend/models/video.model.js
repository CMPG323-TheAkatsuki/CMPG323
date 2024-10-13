const mongoose = require('mongoose');

// Define the Video schema
const VideoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
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
    uploader: { // the person that uploaded the video
        type: mongoose.Schema.Types.ObjectId,  // Reference to a user (optional)
        ref: 'User',  // Assuming you have a 'User' model
        unique: true
    }
});

// Create the Video model from the schema
const Video = mongoose.model('Video', VideoSchema);

module.exports = Video;
