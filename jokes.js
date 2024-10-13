const bcrypt = require('bcryptjs');

// Your plain-text password
const password = 'Akatsuki12324'; // Replace with your actual password

// Hash the password
const saltRounds = 8;
const hashedPassword = bcrypt.hashSync(password, saltRounds);

// Log the hashed password in the console
console.log('Hashed password:', hashedPassword);