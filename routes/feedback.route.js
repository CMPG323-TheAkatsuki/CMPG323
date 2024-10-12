const express = require('express');
const Feedback = require('../models/feedback.model.js'); // Import Feedback model
const Module = require('../models/module.model.js'); // Import Module model
const router = express.Router();
const mongoose = require('mongoose');


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

// Route to get all feedback (accessible by admin only)
router.get('/all', authorizeRoles('admin'), async (req, res) => {
    try {
        const feedback = await Feedback.find({}); // Fetch all feedback from the database
        res.status(200).json(feedback); // Send back the feedback as a JSON response
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle any errors
    }
});

router.get('/student/:student', authorizeRoles('admin', 'student'), async (req, res) => {
    try {
        const { student } = req.params; // Get the student (as a string, like "112233445")

        // Find all feedback entries for the given student (string)
        const feedback = await Feedback.find({ student: student })
            .populate('module_id', 'module description');  // Populate the module information (code and description)

        if (!feedback || feedback.length === 0) {
            return res.status(404).json({ message: "No feedback found for this student" });
        }

        // Send the feedback
        res.status(200).json(feedback);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: error.message });
    }
});

router.get('/module/:module_id', authorizeRoles('admin'), async (req, res) => {
    try {
        const { module_id } = req.params; // Get the module_id from the route parameters
        console.log(`Fetching feedback for module ID: ${module_id}`);  // Log for debugging

        // Ensure the module_id is a valid ObjectId
        const validModuleId = mongoose.Types.ObjectId.isValid(module_id);

        if (!validModuleId) {
            return res.status(400).json({ message: "Invalid module ID format" }); // Handle invalid ObjectId format
        }

        // Query using new mongoose.Types.ObjectId()
        const feedback = await Feedback.find({ 
            module_id: new mongoose.Types.ObjectId(module_id) // Use `new` for ObjectId instantiation
        }).populate('student', 'name surname') // Populate student details
          .populate('module_id', 'module description'); // Populate module details

        if (!feedback || feedback.length === 0) {
            return res.status(404).json({ message: "No feedback found for this module" }); // Return 404 if not found
        }

        res.status(200).json(feedback); // Return the found feedback
    } catch (error) {
        console.error(error); // Log the error for debugging
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
