const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    student_id: {
        type: Number,
        required: true,
        unique: true
    },
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

module.exports = mongoose.model('Student', studentSchema);
