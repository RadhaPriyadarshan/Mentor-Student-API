const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const Mentor = require('./models/Mentor');
const Student = require('./models/Student');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const dbURI = process.env.MONGODB_URI || 'mongodb+srv://RadhaDarshan:Jagadeesan%23786@mentor-student-database.iqhjlhc.mongodb.net/student_mentor_database?retryWrites=true&w=majority';
mongoose.connect(dbURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const endpoints = [
    { method: 'POST', path: '/mentors', description: 'Create a new mentor' },
    { method: 'POST', path: '/students', description: 'Create a new student' },
    { method: 'POST', path: '/mentors/:mentorId/students/:studentId', description: 'Assign a student to a mentor' },
    { method: 'POST', path: '/mentors/:mentorId/students', description: 'Assign multiple students to a mentor' },
    { method: 'PUT', path: '/students/:studentId/mentor/:mentorId', description: 'Assign or change mentor for a student' },
    { method: 'GET', path: '/mentors/:mentorId/students', description: 'Show all students for a particular mentor' },
    { method: 'GET', path: '/students/:studentId/previous-mentor', description: 'Show the previous mentor for a particular student' },
    { method: 'GET', path: '/mentors', description: 'Get all mentors' },
    { method: 'GET', path: '/students', description: 'Get all students' }
];

app.get('/', (req, res) => {
    res.send({
        message: 'Server is running successfully',
        endpoints
    });
});

// Function to find the next available ID for mentors
async function getNextMentorId() {
    const mentor = await Mentor.findOne().sort({ mentor_id: -1 });
    if (mentor) {
        return mentor.mentor_id + 1;
    } else {
        return 1; // Start from 1 if no mentors exist
    }
}

// Function to find the next available ID for students
async function getNextStudentId() {
    const student = await Student.findOne().sort({ student_id: -1 });
    if (student) {
        return student.student_id + 1;
    } else {
        return 1; // Start from 1 if no students exist
    }
}

// Create a new mentor with custom ID
app.post('/mentors', async (req, res) => {
    try {
        const mentorData = req.body;
        const mentorId = await getNextMentorId();
        const mentor = new Mentor({ ...mentorData, mentor_id: mentorId });
        await mentor.save();
        res.status(201).send(mentor);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Create a new student with custom ID
app.post('/students', async (req, res) => {
    try {
        const studentData = req.body;
        const studentId = await getNextStudentId();
        const student = new Student({ ...studentData, student_id: studentId });
        await student.save();
        res.status(201).send(student);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Assign a student to a mentor
app.post('/mentors/:mentorId/students/:studentId', async (req, res) => {
    try {
        const { mentorId, studentId } = req.params;
        const mentor = await Mentor.findOne({ mentor_id: mentorId });
        const student = await Student.findOne({ student_id: studentId });

        if (student && student.mentor) {
            student.previousMentor = student.mentor;
        }

        student.mentor = mentor;
        await student.save();

        mentor.students.push(student);
        await mentor.save();

        res.send({ mentor, student });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Assign multiple students to a mentor
app.post('/mentors/:mentorId/students', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const { studentIds } = req.body; // Array of student IDs

        const mentor = await Mentor.findOne({ mentor_id: mentorId });

        for (const studentId of studentIds) {
            const student = await Student.findOne({ student_id: studentId });

            if (student.mentor) {
                student.previousMentor = student.mentor;
            }

            student.mentor = mentor;
            await student.save();

            mentor.students.push(student);
        }

        await mentor.save();

        res.send(entor);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Assign or change mentor for a student
app.put('/students/:studentId/mentor/:mentorId', async (req, res) => {
    try {
        const { studentId, mentorId } = req.params;
        const student = await Student.findOne({ student_id: studentId });
        const newMentor = await Mentor.findOne({ mentor_id: mentorId });

        if (student.mentor) {
            student.previousMentor = student.mentor;
        }

        student.mentor = newMentor;
        await student.save();

        newMentor.students.push(student);
        await newMentor.save();

        res.send(student);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Show all students for a particular mentor
app.get('/mentors/:mentorId/students', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const mentor = await Mentor.findOne({ mentor_id: mentorId }).populate('students');
        res.send(mentor.students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Show the previous mentor for a particular student
app.get('/students/:studentId/previous-mentor', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findOne({ student_id: studentId }).populate('previousMentor');
        res.send(student.previousMentor);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get all mentors
app.get('/mentors', async (req, res) => {
    try {
        const mentors = await Mentor.find();
        res.send(mentors);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get all students
app.get('/students', async (req, res) => {
    try {
        const students = await Student.find();
        res.send(students);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
