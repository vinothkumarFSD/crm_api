const mongoose = require('mongoose');

/* The code is defining a Mongoose schema for a contact object. The schema specifies the structure and
validation rules for the contact object. */
const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: false },
  email: { type: String, required: true, index: true, unique: true },
  mobile: { type: String, required: false },
  last_login_date: { type: String, required: false },
  password: { type: String, required: false },
});

module.exports = mongoose.model('users', userSchema);
