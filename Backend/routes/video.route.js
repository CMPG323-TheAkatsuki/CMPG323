const express = require('express');
const Videos = require('../models/video.model.js'); // Importing the Video model
const router = express.Router();

// This is to get all the list of Users
router.get('/', async (req, res) => {
    try {
        const videos = await Videos.find({}); // Fetching all Videos
        res.status(200).json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// This is to add a Video
router.post('/add', async (req, res) => {
    try {
        const { title, description, videoUrl,videoFileName,videoFileType,videoSize, uploader} = req.body;



        const video = await Videos.create({
            title,
            description,
            videoUrl,
            videoFileName,
            videoFileType,
            videoSize,
            uploader,
        });

        res.status(201).json(video); // Responding with the created Video
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
