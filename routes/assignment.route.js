const express = require('express');
const Assignment = require('../models/assignment.model.js'); // Make sure to import Assignment, not Student
const { error } = require('winston');
const router = express.Router();


//This is to get all the list of assignment
router.get('/', async(req, res)=> {
    try {
        const assignment = await Assignment.find({});
        res.status(200).json(student);

    }
    catch{ (error)
    res.status(500).json({message: error.message});
    }
});


//This is to add a assignment
router.post('/add', async (req,res)=>{
    try{
        const assignment = await Assignment.create(req.body);
        res.status(200).json(assignment)

    } catch (error) {
        res.status(500).json({message: error.message})
    }
} )

//Look for a certain assignment and then update
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const updatedAssignment = await Assignment.findByIdAndUpdate(id, req.body, { new: true }); // Use findByIdAndUpdate
        
        if (!updatedAssignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }
        
        res.status(200).json(updatedAssignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params; // Get the id from the route parameters

        const deletedAssignment = await Assignment.findByIdAndDelete(id); // Find and delete the assignment by id
        
        if (!deletedAssignment) {
            return res.status(404).json({ message: "Assignment not found" }); // If the assignment is not found, return a 404
        }
        
        res.status(200).json({ message: "Assignment deleted successfully", assignment: deletedAssignment }); // Respond with success and the deleted assignment
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle any errors that occur
    }
});


module.exports = router;
