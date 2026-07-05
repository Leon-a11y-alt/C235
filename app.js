// MYSQL CODE (1/4): Import the mysql2 driver so Node.js can talk to MySQL
const mysql = require('mysql2');
const express = require('express');
const app = express();

// Tell Express to use EJS for rendering views
app.set('view engine', 'ejs');

// Enable parsing of form data (req.body) submitted from HTML forms
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public')); // Serve static files from the 'public' directory
// MYSQL CODE (2/4): Create the connection to the MySQL database (set your own credentials here)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD || '', // Set DB_PASSWORD in your local environment
  database: 'c237_studentlistapp'
});

// MYSQL CODE (3/4): Open the connection so login problems are reported clearly instead of crashing
connection.connect((err) => {
  if (err) {
    console.error('Could not connect to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Define routes
app.get('/', (req, res) => {
  // MYSQL CODE (4/4): Run a SQL query to fetch data from the MySQL database
  const sql = 'SELECT * FROM student';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error Retrieving students');
    }
    // Render HTML page with data
    res.render('index', { students: results });
  });
});

app.get('/student/:id', (req, res) => {
  // Extract the student ID from the request parameters
  const studentId = req.params.id;
  const sql = 'SELECT * FROM student WHERE studentId = ?';
  // Fetch data from MySQL based on the student ID
  connection.query(sql, [studentId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error Retrieving student by ID');
    }
    // Check if any student with the given ID was found
    if (results.length > 0) {
      // Render HTML page with the student data
      res.render('student', { student: results[0] });
    } else {
      // If no student with the given ID was found, let the user know
      res.status(404).send('Student not found');
    }
  });
});

// Show the "Add New Student" form
app.get('/addStudent', (req, res) => {
  res.render('addStudent');
});

// Handle the submitted form and insert the new student into the database
app.post('/addStudent', (req, res) => {
  // Pull the values submitted from the form (names must match the input "name" attributes)
  const { name, dob, contact, image } = req.body;
  const sql = 'INSERT INTO student (name, dob, contact, image) VALUES (?, ?, ?, ?)';
  connection.query(sql, [name, dob, contact, image], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error adding student: ' + error.message);
    }
    // After a successful insert, go back to the student list
    res.redirect('/');
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
