const mongoose = require('mongoose');

/* The code is defining a Mongoose schema for a contact object. The schema specifies the structure and
validation rules for the contact object. */
const dealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: false },
    quantity: { type: String, required: true, index: true, unique: true },
    contacts: [{ type: mongoose.Schema.ObjectId, ref: 'contacts', required: false }],
    companies: [{ type: mongoose.Schema.ObjectId, ref: 'companies', required: false }],
    products: [{ type: mongoose.Schema.ObjectId, ref: 'products', required: false }],
    is_deleted: { type: Boolean, default: false },
    deleted_at: { type: String, default: null },
    order_date: { type: String, required: false },
    created_date: { type: String }
  },
  { timestamps: true },
);

module.exports = mongoose.model('deals', dealSchema);
