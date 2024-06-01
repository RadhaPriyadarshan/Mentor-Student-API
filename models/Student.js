const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor'
    },
    previousMentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mentor'
    }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
