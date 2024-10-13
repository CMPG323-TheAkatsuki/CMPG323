const express = require('express');
const router = express.Router();
const Submission = require('../models/submission.model'); // Importing the Submission model

// Middleware to check for roles
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next(); // User has the required role
        } else {
            res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
    };
}

// Middleware to check if the student is the owner of the submission
async function isSubmissionOwner(req, res, next) {
    try {
        const submission = await Submission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        // Check if the submitter is the user making the request
        if (submission.submitter_id.toString() === req.user.id || req.user.role === 'admin') {
            next(); // Allow if the user is the owner or admin
        } else {
            res.status(403).json({ message: 'Access denied: you do not own this submission' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// Get all submissions (admin only)
router.get('/', authorizeRoles('admin'), async (req, res) => {
    try {
        const submissions = await Submission.find().populate('assignment_id').populate('submitter_id');
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific submission by ID (accessible by owner and admin)
router.get('/:id', authorizeRoles('admin', 'student'), isSubmissionOwner, async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id).populate('assignment_id').populate('submitter_id');
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new submission (students only)
router.post('/add', authorizeRoles('student'), async (req, res) => {
    try {
        const { assignment_id, videoUrl, videoFileName, videoFileType, videoSize, submitter_id } = req.body;

        // Create a new Submission
        const submission = new Submission({
            assignment_id,
            videoUrl,
            videoFileName,
            videoFileType,
            videoSize,
            submitter_id: req.user.id // Ensure submitter_id is the logged-in student's ID
        });

        // Save the submission to the database
        await submission.save();
        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a submission by ID (accessible by owner and admin)
router.put('/update/:id', authorizeRoles('admin', 'student'), isSubmissionOwner, async (req, res) => {
    try {
        const { assignment_id, videoUrl, videoFileName, videoFileType, videoSize } = req.body;

        const submission = await Submission.findByIdAndUpdate(
            req.params.id,
            { assignment_id, videoUrl, videoFileName, videoFileType, videoSize },
            { new: true, runValidators: true }
        );

        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a submission by ID (admin only)
router.delete('/delete/:id', authorizeRoles('admin'), async (req, res) => {
    try {
        const submission = await Submission.findByIdAndDelete(req.params.id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        res.status(200).json({ message: 'Submission deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
