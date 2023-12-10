const mongoose = require('mongoose');

/* The code is defining a Mongoose schema for a contact object. The schema specifies the structure and
validation rules for the contact object. */
const contactSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: false },
    email: { type: String, required: true, index: true },
    whatsapp: { type: String, required: false },
    mobilephone: { type: String, required: false },
    address: { type: String, required: false },
    state: { type: String, required: false },
    city: { type: String, required: false },
    country: { type: String, required: false },
    is_deleted: { type: Boolean, required: true, default: false },
    deals: [{ type: mongoose.Schema.ObjectId, ref: 'deals', required: false }],
  },
  { timestamps: true },
);

module.exports = mongoose.model('contacts', contactSchema);
