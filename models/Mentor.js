const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  mentor_id: { type: Number, unique: true },
  name: String,
  // other mentor properties
});

mentorSchema.pre('save', async function(next) {
  try {
    if (!this.isNew) return next(); // If not a new document, do nothing
    const lastMentor = await Mentor.findOne().sort({ mentor_id: -1 });
    this.mentor_id = lastMentor ? lastMentor.mentor_id + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});

const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;
