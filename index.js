const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Mentor = require('./models/Mentor');
const Student = require('./models/Student');

const app = express();
app.use(bodyParser.json());

const dbURI = process.env.MONGODB_URI || 'mongodb+srv://RadhaDarshan:Jagadeesan%23786@mentor-student-database.iqhjlhc.mongodb.net/?retryWrites=true&w=majority';
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

// Create a new mentor
app.post('/mentors', async (req, res) => {
    const mentor = new Mentor(req.body);
    await mentor.save();
    res.status(201).send(mentor);
});

// Create a new student
app.post('/students', async (req, res) => {
    const student = new Student(req.body);
    await student.save();
    res.status(201).send(student);
});

// Assign a student to a mentor
app.post('/mentors/:mentorId/students/:studentId', async (req, res) => {
    const { mentorId, studentId } = req.params;
    const mentor = await Mentor.findById(mentorId);
    const student = await Student.findById(studentId);

    if (student.mentor) {
        student.previousMentor = student.mentor;
    }

    student.mentor = mentor;
    await student.save();

    mentor.students.push(student);
    await mentor.save();

    res.send({ mentor, student });
});

// Assign multiple students to a mentor
app.post('/mentors/:mentorId/students', async (req, res) => {
    const { mentorId } = req.params;
    const { studentIds } = req.body; // Array of student IDs

    const mentor = await Mentor.findById(mentorId);

    for (const studentId of studentIds) {
        const student = await Student.findById(studentId);

        if (student.mentor) {
            student.previousMentor = student.mentor;
        }

        student.mentor = mentor;
        await student.save();

        mentor.students.push(student);
    }

    await mentor.save();

    res.send(mentor);
});

// Assign or change mentor for a student
app.put('/students/:studentId/mentor/:mentorId', async (req, res) => {
    const { studentId, mentorId } = req.params;
    const student = await Student.findById(studentId);
    const newMentor = await Mentor.findById(mentorId);

    if (student.mentor) {
        student.previousMentor = student.mentor;
    }

    student.mentor = newMentor;
    await student.save();

    newMentor.students.push(student);
    await newMentor.save();

    res.send(student);
});

// Show all students for a particular mentor
app.get('/mentors/:mentorId/students', async (req, res) => {
    const { mentorId } = req.params;
    const mentor = await Mentor.findById(mentorId).populate('students');
    res.send(mentor.students);
});

// Show the previous mentor for a particular student
app.get('/students/:studentId/previous-mentor', async (req, res) => {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate('previousMentor');
    res.send(student.previousMentor);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
