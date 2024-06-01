const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
        default: null
    },
    previousMentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor',
        default: null
    },
    student_id: {
        type: String,
        required: true,
        unique: true
    }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
