// Existing imports
const express = require('express');
const mongoose = require('mongoose');
const readline = require('readline');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const morgan = require('morgan');
const winston = require('winston');
const promMiddleware = require('express-prometheus-middleware');
const userRoute = require('./routes/user.route.js');
const assignmentRoute = require('./routes/assignment.route.js');
const feedbackRoute = require('./routes/feedback.route.js');
const User = require('./models/user.model.js'); // Make sure User model is imported

const app = express();
app.use(express.json()); 
require('dotenv').config({ path: 'config.env' }); 

const JWT_SECRET = process.env.JWT_SECRET;

// Winston for logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console(),
    ],
});

// Middleware to authenticate JWT and attach user data
function authenticateJWT(req, res, next) {
    const token = req.headers['authorization'];
    if (token) {
        jwt.verify(token.split(' ')[1], JWT_SECRET, async (err, decodedToken) => {
            if (err) {
                logger.error('JWT verification failed: ' + err.message);
                return res.sendStatus(403); // Forbidden if token is invalid
            }
            try {
                const user = await User.findOne({ user_number: decodedToken.user_number });
                if (!user) {
                    return res.status(401).json({ message: 'User not found' });
                }
                req.user = user; // Attach user info to request
                next();
            } catch (error) {
                logger.error('Error retrieving user: ' + error.message);
                res.status(500).json({ message: 'Internal server error' });
            }
        });
    } else {
        logger.warn('No token provided for authentication.');
        res.sendStatus(401); // Unauthorized if no token is provided
    }
}

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

// Route to authenticate a user and generate a JWT
app.post('/login', async (req, res) => {
    const { user_number, password } = req.body;

    try {
        const user = await User.findOne({ user_number });

        if (!user) {
            logger.warn(`User not found for user_number: ${user_number}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Debugging logs to check password comparison
        console.log("Received password:", password);
        console.log("Stored hashed password:", user.password);

        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            logger.warn(`Failed login for user_number: ${user_number}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ user_number: user.user_number }, JWT_SECRET, { expiresIn: '1h' });
        logger.info(`User ${user_number} logged in successfully.`);
        res.json({ token });
    } catch (error) {
        logger.error(`Error during login for user_number: ${user_number} - ${error.message}`);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});


// Routes

// Only "admin" can access this route
app.use('/api/user', authenticateJWT, authorizeRoles('admin'), userRoute);

// Both "admin" and "lecturer" can access assignments
app.use('/api/assignment', authenticateJWT, authorizeRoles('admin', 'lecturer'), assignmentRoute);

// Both "admin" and "student" can access feedback
app.use('/api/feedback', authenticateJWT, authorizeRoles('admin', 'student','lecturer'), feedbackRoute);

// General public route
app.get('/', (req, res) => {
    res.send('Welcome to our server running on port 5000!!!');
});

// Protected route for any authenticated user, this was a tester
app.get('/protected', authenticateJWT, (req, res) => {
    res.send(`Hello ${req.user.user_number}, you have access to this protected route!`);
});

// Error-handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
});

// MongoDB connection and server start logic
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function getMongoCredentials() {
    return new Promise((resolve) => {
        rl.question('Enter MongoDB username: ', (username) => {
            rl.question('Enter MongoDB password: ', (password) => {
                rl.close();
                resolve({ username, password });
            });
        });
    });
}

getMongoCredentials().then(({ username, password }) => {
    const mongoUri = `mongodb+srv://${username}:${password}@cluster0.pzujk.mongodb.net/serverDB`;

    mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        logger.info("Connected to database!");
        app.listen(5000, () => {
            logger.info('Server is running on port 5000');
        });
    })
    .catch((error) => {
        logger.error("Connection failed: " + error.message);
    });
});
