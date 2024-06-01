const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  student_id: { type: Number, unique: true },
  name: String,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
  // other student properties
});

studentSchema.pre('save', async function(next) {
  try {
    if (!this.isNew) return next(); // If not a new document, do nothing
    const lastStudent = await Student.findOne().sort({ student_id: -1 });
    this.student_id = lastStudent ? lastStudent.student_id + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
