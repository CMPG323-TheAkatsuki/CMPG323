const express = require('express');
const Feedback = require('../models/feedback.model.js'); // Import Feedback model
const router = express.Router();

// Middleware to check for roles
function authorizeRoles(...roles) { // centralize this
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            next(); // User has the required role
        } else {
            res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
    };
}

// Route to get all feedback (accessible by admin only)
router.get('/all', authorizeRoles('admin'), async (req, res) => {
    try {
        const feedback = await Feedback.find({}); // Fetch all feedback from the database
        res.status(200).json(feedback); // Send back the feedback as a JSON response
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle any errors
    }
});

// Route to get a specific feedback by ID (accessible by admin and student)
router.get('/:id', authorizeRoles('admin', 'student'), async (req, res) => {
    try {
        const { id } = req.params; // Get the ID from the route parameters
        console.log(`Fetching feedback with ID: ${id}`);  // Log for debugging

        const feedback = await Feedback.findById(id); // Find feedback by ID

        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" }); // Return 404 if not found
        }

        res.status(200).json(feedback); // Return the found feedback
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle any errors
    }
});

// Route to add feedback (accessible by admin only)
router.post('/add', authorizeRoles('admin'), async (req, res) => {
    try {
        const feedback = await Feedback.create(req.body); // Create a new feedback entry
        res.status(201).json(feedback); // Respond with the created feedback
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle any errors
    }
});

// Route to update feedback by ID (accessible by admin only)
router.put('/update/:id', authorizeRoles('admin'), async (req, res) => {
    try {
        const { id } = req.params;

        const updatedFeedback = await Feedback.findByIdAndUpdate(id, req.body, { new: true }); // Use findByIdAndUpdate
        
        if (!updatedFeedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }
        
        res.status(200).json(updatedFeedback); // Return the updated feedback
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle any errors
    }
});

// Route to delete feedback by ID (accessible by admin only)
router.delete('/delete/:id', authorizeRoles('admin'), async (req, res) => {
    try {
        const { id } = req.params; // Get the id from the route parameters

        const deletedFeedback = await Feedback.findByIdAndDelete(id); // Find and delete the feedback by id
        
        if (!deletedFeedback) {
            return res.status(404).json({ message: "Feedback not found" }); // If the feedback is not found, return a 404
        }
        
        res.status(200).json({ message: "Feedback deleted successfully", feedback: deletedFeedback }); // Respond with success and the deleted feedback
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle any errors that occur
    }
});

// Export the router
module.exports = router;
