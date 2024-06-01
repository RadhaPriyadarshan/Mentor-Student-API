const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Mentor = require('./models/Mentor');
const Student = require('./models/Student');

const app = express();
app.use(bodyParser.json());

const dbURI = process.env.MONGODB_URI || 'mongodb+srv://RadhaDarshan:Jagadeesan%23786@mentor-student-database.iqhjlhc.mongodb.net/mentor-student-db?retryWrites=true&w=majority';
mongoose.connect(dbURI);

const endpoints = [
    { method: 'POST', path: '/mentors', description: 'Create a new mentor' },
    { method: 'POST', path: '/students', description: 'Create a new student' },
    { method: 'POST', path: '/mentors/:mentorId/students/:studentId', description: 'Assign a student to a mentor' },
    { method: 'POST', path: '/mentors/:mentorId/students', description: 'Assign multiple students to a mentor' },
    { method: 'PUT', path: '/students/:studentId/mentor/:mentorId', description: 'Assign or change mentor for a student' },
    { method: 'GET', path: '/mentors/:mentorId/students', description: 'Show all students for a particular mentor' },
    { method: 'GET', path: '/students/:studentId/previous-mentor', description: 'Show the previous mentor for a particular student' }
];

app.get('/', (req, res) => {
    res.send({
        message: 'Server is running successfully',
        endpoints
    });
});

// API to create a new Mentor
app.post('/mentor', async (req, res) => {
    try {
      const mentor = await Mentor.create(req.body);
      res.json(mentor);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // API to create a new Student
  app.post('/student', async (req, res) => {
    try {
      const student = await Student.create(req.body);
      res.json(student);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // API to get all mentors
app.get('/mentors', async (req, res) => {
    try {
      const mentors = await Mentor.find();
      res.json(mentors);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // API to get all students
  app.get('/students', async (req, res) => {
    try {
      const students = await Student.find();
      res.json(students);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // API to assign a Student to a Mentor
  app.put('/assign/:mentor_id', async (req, res) => {
    try {
      const mentor = await Mentor.findOne({ mentor_id: req.params.mentor_id });
      if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
  
      const students = req.body.students;
      await Student.updateMany({ student_id: { $in: students } }, { mentor: mentor._id });
      res.json({ message: 'Students assigned to mentor successfully' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // API to show all students for a particular mentor
  app.get('/mentor/:mentor_id/students', async (req, res) => {
    try {
      const mentor = await Mentor.findOne({ mentor_id: req.params.mentor_id });
      if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
  
      const students = await Student.find({ mentor: mentor._id });
      res.json(students);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // API to show the previously assigned mentor for a particular student
  app.get('/student/:student_id/mentor', async (req, res) => {
    try {
      const student = await Student.findOne({ student_id: req.params.student_id });
      if (!student) return res.status(404).json({ message: 'Student not found' });
  
      const mentor = await Mentor.findOne({ _id: student.mentor });
      res.json(mentor);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });
  
  // API to assign or change mentor for a particular student
  app.put('/student/:student_id/assign/:mentor_id', async (req, res) => {
    try {
      const student = await Student.findOne({ student_id: req.params.student_id });
      if (!student) return res.status(404).json({ message: 'Student not found' });
  
      const mentor = await Mentor.findOne({ mentor_id: req.params.mentor_id });
      if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
  
      student.mentor = mentor._id;
      await student.save();
      res.json({ message: 'Student assigned to mentor successfully' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
