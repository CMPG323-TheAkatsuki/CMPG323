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

// Get all submissions (accessible by admin only)
router.get('/', authorizeRoles('admin'), async (req, res) => {
    try {
        const submissions = await Submission.find().populate('assignment_id').populate('submitter_id');
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific submission by ID (accessible by admin and the submitter)
router.get('/:id', authorizeRoles('admin', 'lecturer'), async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id).populate('assignment_id').populate('submitter_id');
        
        // Ensure the user is either admin or the one who submitted this submission
        if (!submission || (req.user.role === 'student' && submission.submitter_id.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new submission (accessible by students and admins)
router.post('/add', authorizeRoles('student', 'admin'), async (req, res) => {
    try {
        const { assignment_id, videoUrl, videoFileName, videoFileType, videoSize, submitter_id } = req.body;

        // Create a new Submission
        const submission = new Submission({
            assignment_id,
            videoUrl,
            videoFileName,
            videoFileType,
            videoSize,
            submitter_id
        });

        // Save the submission to the database
        await submission.save();
        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a submission by ID (accessible by the submitter and admin)
router.put('/update/:id', authorizeRoles('student', 'admin'), async (req, res) => {
    try {
        const { assignment_id, videoUrl, videoFileName, videoFileType, videoSize, submitter_id } = req.body;
        
        const submission = await Submission.findById(req.params.id);

        // Ensure the user is either admin or the one who submitted this submission
        if (!submission || (req.user.role === 'student' && submission.submitter_id.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Update submission
        const updatedSubmission = await Submission.findByIdAndUpdate(
            req.params.id,
            { assignment_id, videoUrl, videoFileName, videoFileType, videoSize, submitter_id },
            { new: true, runValidators: true }
        );

        if (!updatedSubmission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.status(200).json(updatedSubmission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a submission by ID (accessible by admin only)
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
