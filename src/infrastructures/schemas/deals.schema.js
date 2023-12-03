const mongoose = require('mongoose');

/* The code is defining a Mongoose schema for a contact object. The schema specifies the structure and
validation rules for the contact object. */
const dealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: false },
  quantity: { type: String, required: true, index: true, unique: true },
  contact: { type: mongoose.Schema.ObjectId, ref: 'contacts', required: false },
  companies: { type: mongoose.Schema.ObjectId, ref: 'companies', required: false },
  products: { type: mongoose.Schema.ObjectId, ref: 'products', required: false },
  order_date: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('deals', dealSchema);
