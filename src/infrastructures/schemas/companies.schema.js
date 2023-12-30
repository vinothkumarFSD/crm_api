const mongoose = require('mongoose');

/* The code is defining a Mongoose schema for a contact object. The schema specifies the structure and
validation rules for the contact object. */
const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    domain: { type: String, required: false },
    email: { type: String, required: true, index: true, unique: true },
    mobilephone: { type: String, required: false },
    address: { type: String, required: false },
    state: { type: String, required: false },
    city: { type: String, required: false },
    country: { type: String, required: false },
    is_deleted: { type: Boolean, required: true, default: false },
    deleted_at: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model('companies', companySchema);
