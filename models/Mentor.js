const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
    mentor_id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }]
});

module.exports = mongoose.model('Mentor', mentorSchema);
