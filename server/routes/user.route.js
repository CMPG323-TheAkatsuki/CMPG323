const express = require('express');
const User = require('../models/user.model.js'); // Importing the User model
const router = express.Router();
const bcrypt = require('bcryptjs');


//CRUD check

// This is to get all the list of Users
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}); // Fetching all Users
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// This is to add a User By the Admin
router.post('/add', async (req, res) => {
    try {
        const { user_number, password, role } = req.body;

        // Validate role before creating a user
        const validRoles = ['admin', 'lecturer', 'student'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: `Invalid role. Choose from: ${validRoles.join(', ')}` });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 8);

        // Create a new user with the hashed password and role
        const user = await User.create({
            user_number,
            password: hashedPassword,
            role // Assign the role to the user
        });

        res.status(201).json(user); // Responding with the created user
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Look for a certain user and then update by the Admin
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { password, role } = req.body;

        // Validate role before updating a user
        const validRoles = ['admin', 'lecturer', 'student'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ message: `Invalid role. Choose from: ${validRoles.join(', ')}` });
        }

        let updateData = req.body;

        // Hash the new password if it's being updated
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 8);
            updateData.password = hashedPassword;
        }

        // Update user and return the updated document
        const user = await User.findByIdAndUpdate(id, updateData, { new: true }); // Updating the user
        
        if (!user) {
            return res.status(404).json({ message: "User not found" }); // If not found, return a 404
        }
        
        res.status(200).json(user); // Responding with the updated user
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a user by user_number by the Admin
router.delete('/delete/:user_number', async (req, res) => {
    try {
        const { user_number } = req.params; // Get user_number from the route parameters

        const deletedUser = await User.findOneAndDelete({ user_number }); // Find and delete the user by user_number
        
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" }); // If the user is not found, return a 404
        }
        
        res.status(200).json({ message: "User deleted successfully", user: deletedUser }); // Respond with success and the deleted user
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle any errors that occur
    }
});

// Endpoint to update password based on user_number and email
// Endpoint to update password based on user_number, email, and old password
router.post('/update-password', async (req, res) => {
    try {
        const { user_number, email, oldPassword, newPassword } = req.body;

        // Find the user by user_number and email
        const user = await User.findOne({ user_number, email });

        if (!user) {
            return res.status(404).json({ message: "User not found" }); // If not found, return a 404
        }

        // Check if the old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" }); // If old password doesn't match, return an error
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 8);

        // Update the user's password
        user.password = hashedPassword;
        await user.save(); // Save the updated user

        res.status(200).json({ message: "Password updated successfully" }); // Respond with success
    } catch (error) {
        res.status(500).json({ message: error.message }); // Handle any errors that occur
    }
});


module.exports = router;
